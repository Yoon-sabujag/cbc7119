---
phase: 260529-lzh-b3-7-bc-recovery-fetch-race-guard
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/pages/FloorPlanPage.tsx
autonomous: false
requirements:
  - QUICK-260529-LZH-01  # DB 회복 INSERT — CP-B3-7-BC 누락 record 1건
  - QUICK-260529-LZH-02  # FloorPlanPage paired BC fetch race 가드 (loading state + 저장 disabled)
user_setup: []

must_haves:
  truths:
    - "CP-B3-7-BC 가 prod D1 의 check_records 에 1건 INSERT 되어, 일반 점검 (CheckpointsPage) 에 완료로 노출된다 (SH 짝꿍과 동일 timestamp/staff/result/session)"
    - "FloorPlanPage 도면점검 모달에서 소화전 indoor_hydrant 마커 진입 시, paired BC fetch 가 진행 중인 동안은 저장 버튼이 disabled 되어 fetch 미완료 상태로 SH 단독 저장되는 race 가 차단된다"
    - "기존 paired BC 매칭 룰 (location_no 매칭) + 짝꿍 동시 INSERT (if pairedBC) 흐름은 변경 없음 — 가드만 추가"
    - "다른 plan_type (guidelamp/sprinkler/detector) 또는 비-indoor_hydrant 마커 동작은 무변경 (가드 조건이 indoor_hydrant + cp_id 있을 때만 발동)"
    - "직원 도메인 (cbc7119.pages.dev) 에 fix 가 배포되어 다음 도면점검부터 race 가 차단된다"
  artifacts:
    - path: "cha-bio-safety/src/pages/FloorPlanPage.tsx"
      provides: "pairedBcLoading state + 저장 disabled 가드"
      contains: "useState pairedBcLoading + fetch 시작/완료 setLoading + button disabled 조건"
  key_links:
    - from: "cha-bio-safety/src/pages/FloorPlanPage.tsx L413-427 (paired BC fetch useEffect)"
      to: "cha-bio-safety/src/pages/FloorPlanPage.tsx L1924 (저장 button disabled)"
      via: "pairedBcLoading state — fetch in-flight 동안 true → 저장 disabled"
      pattern: "pairedBcLoading"

---

<objective>
오늘 발견된 isolated 사고 (5월 사이클 비상콘센트 점검 중 CP-B3-7-BC 만 누락) 를 회복하고, 같은 race 가 재발하지 않게 도면점검 모달에 fetch loading 가드를 추가한다.

Purpose:
- CP-B3-7-SH (지하 3층 D-7 기둥 소화전) 는 오늘 13:49:09 윤종엽 staff 가 정상 점검 완료. 짝꿍 BC 가 모든 다른 B3 짝꿍과 달리 누락 — 통계상 5월 전체 SH-BC 짝꿍 점검 중 단 1건만 깨짐. 데이터/API/매칭 룰 모두 정상이라 가장 그럴듯한 원인은 클라이언트 fetch race (모달 진입 직후 paired BC 비동기 fetch 완료 전에 저장 누름).

Output:
1. prod D1 의 check_records 에 CP-B3-7-BC 회복 INSERT (SH 짝꿍과 동일 session/staff/timestamp/result/status, floor_plan_marker_id NULL — 도면점검에서 들어간 BC record 들과 동일 패턴).
2. FloorPlanPage paired BC fetch 에 loading state 추가 + indoor_hydrant SH 마커 + cp_id 있을 때 + loading 중일 때 저장 disabled.
3. SUMMARY 에 실행 SQL + 코드 diff + verify grep 박제. orchestrator (메인 Claude) 가 build + wrangler pages deploy --branch=production.

absolutely_do_not:
- check_records DELETE 절대 금지 (점검 기록 보존 원칙)
- paired BC 매칭 룰 (L419-424 의 location_no 매칭) 변경 금지 — 가드만 추가
- 다른 plan_type (guidelamp/sprinkler/detector) 의 저장 흐름 영향 금지 — 가드 조건이 'extinguisher' + 'indoor_hydrant' + cp_id 모두일 때만 발동
- 도면점검 외 페이지 (InspectionPage / CheckpointsPage) 코드 수정 금지
- sub-agent (executor) 가 wrangler pages deploy 직접 실행 금지 (memory `feedback_subagent_production_deploy_forbidden`)
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/production-sync.md
@CLAUDE.md

<interfaces>
<!-- 수정 대상: cha-bio-safety/src/pages/FloorPlanPage.tsx -->

**현재 코드 (L366 근처 state 선언)**:
```tsx
const [pairedBC, setPairedBC] = useState<any | null>(null)
```

**현재 코드 (L413-427 paired BC fetch useEffect)**:
```tsx
useEffect(() => {
  let cancelled = false
  if (!inspectModal || !selected || planType !== 'extinguisher' || selected.marker_type !== 'indoor_hydrant' || !selected.check_point_id) {
    setPairedBC(null)
    return
  }
  inspectionApi.getCheckpoints(selected.floor).then((all: any[]) => {
    if (cancelled) return
    const sh = all.find(cp => cp.id === selected.check_point_id)
    if (!sh || !sh.locationNo) { setPairedBC(null); return }
    const bc = all.find(cp => cp.category === '비상콘센트' && cp.locationNo === sh.locationNo)
    setPairedBC(bc ?? null)
  }).catch(() => { if (!cancelled) setPairedBC(null) })
  return () => { cancelled = true }
}, [inspectModal, selected?.id, planType, selected?.marker_type, selected?.check_point_id, selected?.floor])
```

**현재 코드 (L429-437 모달 닫힘 effect)**:
```tsx
useEffect(() => {
  if (!inspectModal) {
    setPairedBC(null)
    setInspectBcResult('normal')
    setInspectBcMemo('')
    inspectBcPhoto.reset()
  }
}, [inspectModal])
```

**현재 코드 (L1923-1924 저장 button)**:
```tsx
<button
  disabled={inspectSubmitting || inspectPhoto.uploading || inspectBcPhoto.uploading || isAccessBlocked}
```

**현재 코드 (L1989 button label)**:
```tsx
{(inspectPhoto.uploading || inspectBcPhoto.uploading) ? '사진 업로드 중...' : inspectSubmitting ? '저장 중...' : isAccessBlocked ? '접근 불가 개소' : '저장'}
```

**check_records schema** (PRAGMA 검증 완료):
id, session_id, checkpoint_id, staff_id, result, memo, photo_key, checked_at, created_at, status, resolution_memo, resolved_at, resolved_by, resolution_photo_key, materials_used, guide_light_type, floor_plan_marker_id, location_detail, extinguisher_id

**SH 짝꿍 record (회복 시 mirror 대상)**:
- id: `Z4FJ3Wa6V1Nv98VoJi5we`
- session_id: `nyD6soJiiNYaOE4cZeMHw`
- checkpoint_id: `CP-B3-7-SH`
- staff_id: `2022051052`
- result: `normal`
- status: `open`
- checked_at: `2026-05-29 13:49:09`
- floor_plan_marker_id: NULL (도면점검 record 패턴 — 다른 SH/BC 들도 모두 NULL)
- 기타 NULL

</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: prod D1 의 CP-B3-7-BC 누락 record 1건 회복 INSERT (4-28 id1 패턴)</name>
  <files>(SQL only — 로컬 파일 변경 없음)</files>
  <action>
사용자 컨펌 이미 받음 (회복 + 코드 가드 옵션 선택). 안전 절차로 중복 가드 → INSERT → verify 진행.

**Step A — 중복 가드 (이미 회복됐는지 확인)**

```bash
cd cha-bio-safety && npx wrangler d1 execute cha-bio-db --remote --command "SELECT id, checkpoint_id, checked_at, result, status FROM check_records WHERE checkpoint_id = 'CP-B3-7-BC' AND checked_at >= '2026-05-29 13:00:00' AND checked_at < '2026-05-29 14:00:00';"
```

- 결과 0 rows → Step B INSERT 진행
- 결과 1+ rows → 이미 회복됨, SUMMARY 에 박제 + Task 1 skip

**Step B — INSERT (SH 짝꿍 mirror)**

새 nanoid 21자리 record id 생성 — orchestrator scout 에서 이미 SH record id `Z4FJ3Wa6V1Nv98VoJi5we` 와 다르고 충돌 안 되는 새 id 사용. 권장: `Z4FJ3Wa6V1Nv98VoJi5we` 와 비슷한 형태 (nanoid 21자리, 영문/숫자) 의 새 값을 생성 후 INSERT.

executor 가 임의 nanoid 21자리 생성 — 예: `node -e "process.stdout.write(require('crypto').randomBytes(21).toString('base64url').slice(0,21))"` 또는 단순히 영문/숫자 21자리 임의값 만들기. 박제 시 사용한 id 명시.

```bash
cd cha-bio-safety && npx wrangler d1 execute cha-bio-db --remote --command "INSERT INTO check_records (id, session_id, checkpoint_id, staff_id, result, status, checked_at, created_at) VALUES ('<NEW_NANOID>', 'nyD6soJiiNYaOE4cZeMHw', 'CP-B3-7-BC', '2022051052', 'normal', 'open', '2026-05-29 13:49:09', datetime('now','+9 hours'));"
```

**Step C — verify**

```bash
# C1: INSERT 된 record 확인
cd cha-bio-safety && npx wrangler d1 execute cha-bio-db --remote --command "SELECT id, checkpoint_id, session_id, staff_id, result, status, checked_at, created_at FROM check_records WHERE checkpoint_id = 'CP-B3-7-BC' AND checked_at = '2026-05-29 13:49:09';"

# C2: 비상콘센트 미완료 cp 재조회 — 0 rows 여야 함
cd cha-bio-safety && npx wrangler d1 execute cha-bio-db --remote --command "SELECT cp.id, cp.floor, cp.zone, cp.location FROM check_points cp WHERE cp.category = '비상콘센트' AND cp.is_active = 1 AND cp.id NOT IN (SELECT DISTINCT checkpoint_id FROM check_records WHERE checked_at >= '2026-05-01' AND checked_at < '2026-06-01' AND checkpoint_id IS NOT NULL AND (result='normal' OR result='caution' OR (result='bad' AND status='resolved'))) ORDER BY cp.floor;"

# C3: check_records 총 건수 — INSERT 1건 늘어남 (baseline 3759 → 3760)
cd cha-bio-safety && npx wrangler d1 execute cha-bio-db --remote --command "SELECT COUNT(*) AS total_records FROM check_records;"
```

모든 SELECT/INSERT 명령 + 출력 (rows_read/rows_written/JSON 결과) 을 SUMMARY 에 코드블록으로 박제.
  </action>
  <verify>
    <automated>
      # Step C1 의 결과가 1 row 이고 staff_id=2022051052, result=normal, status=open
      # Step C2 가 0 rows
      # Step C3 가 3760
    </automated>
  </verify>
  <done>
- prod D1 의 check_records 에 CP-B3-7-BC record 1건 INSERT 됨
- 5월 비상콘센트 미완료 cp 가 0 건 (Step C2)
- check_records 총 건수 3759 → 3760 (Step C3, 정확히 1건 증가)
- 모든 SQL + 출력이 SUMMARY 에 박제됨
  </done>
</task>

<task type="auto">
  <name>Task 2: FloorPlanPage paired BC fetch race 가드 (pairedBcLoading state + 저장 disabled)</name>
  <files>cha-bio-safety/src/pages/FloorPlanPage.tsx</files>
  <action>
대상: `FloorPlanPage` 컴포넌트의 paired BC fetch + 저장 button. 다른 영역 (다른 plan_type 흐름, isExtCascade, DELETE 등) 무손상.

**Edit 1 — state 선언 추가** (L366 의 `const [pairedBC, setPairedBC] = useState<any | null>(null)` 바로 다음 줄):

old_string:
```
  const [pairedBC, setPairedBC] = useState<any | null>(null)
```

new_string:
```
  const [pairedBC, setPairedBC] = useState<any | null>(null)
  const [pairedBcLoading, setPairedBcLoading] = useState(false)
```

**Edit 2 — paired BC fetch useEffect 에 loading 추가** (L413-427):

old_string (정확히 매치):
```
  useEffect(() => {
    let cancelled = false
    if (!inspectModal || !selected || planType !== 'extinguisher' || selected.marker_type !== 'indoor_hydrant' || !selected.check_point_id) {
      setPairedBC(null)
      return
    }
    inspectionApi.getCheckpoints(selected.floor).then((all: any[]) => {
      if (cancelled) return
      const sh = all.find(cp => cp.id === selected.check_point_id)
      if (!sh || !sh.locationNo) { setPairedBC(null); return }
      const bc = all.find(cp => cp.category === '비상콘센트' && cp.locationNo === sh.locationNo)
      setPairedBC(bc ?? null)
    }).catch(() => { if (!cancelled) setPairedBC(null) })
    return () => { cancelled = true }
  }, [inspectModal, selected?.id, planType, selected?.marker_type, selected?.check_point_id, selected?.floor])
```

new_string:
```
  useEffect(() => {
    let cancelled = false
    if (!inspectModal || !selected || planType !== 'extinguisher' || selected.marker_type !== 'indoor_hydrant' || !selected.check_point_id) {
      setPairedBC(null)
      setPairedBcLoading(false)
      return
    }
    setPairedBcLoading(true)
    inspectionApi.getCheckpoints(selected.floor).then((all: any[]) => {
      if (cancelled) return
      const sh = all.find(cp => cp.id === selected.check_point_id)
      if (!sh || !sh.locationNo) { setPairedBC(null); setPairedBcLoading(false); return }
      const bc = all.find(cp => cp.category === '비상콘센트' && cp.locationNo === sh.locationNo)
      setPairedBC(bc ?? null)
      setPairedBcLoading(false)
    }).catch(() => { if (!cancelled) { setPairedBC(null); setPairedBcLoading(false) } })
    return () => { cancelled = true; setPairedBcLoading(false) }
  }, [inspectModal, selected?.id, planType, selected?.marker_type, selected?.check_point_id, selected?.floor])
```

**Edit 3 — 모달 닫힘 effect 에 loading 초기화 추가** (L429-437):

old_string:
```
  useEffect(() => {
    if (!inspectModal) {
      setPairedBC(null)
      setInspectBcResult('normal')
      setInspectBcMemo('')
      inspectBcPhoto.reset()
    }
  }, [inspectModal])
```

new_string:
```
  useEffect(() => {
    if (!inspectModal) {
      setPairedBC(null)
      setPairedBcLoading(false)
      setInspectBcResult('normal')
      setInspectBcMemo('')
      inspectBcPhoto.reset()
    }
  }, [inspectModal])
```

**Edit 4 — 저장 button disabled 조건에 가드 추가** (L1924):

old_string:
```
                disabled={inspectSubmitting || inspectPhoto.uploading || inspectBcPhoto.uploading || isAccessBlocked}
```

new_string:
```
                disabled={inspectSubmitting || inspectPhoto.uploading || inspectBcPhoto.uploading || isAccessBlocked || (planType === 'extinguisher' && selected?.marker_type === 'indoor_hydrant' && !!selected?.check_point_id && pairedBcLoading)}
```

**Edit 5 — button label 분기에 fetch 진행 상태 표시** (L1989):

old_string:
```
                {(inspectPhoto.uploading || inspectBcPhoto.uploading) ? '사진 업로드 중...' : inspectSubmitting ? '저장 중...' : isAccessBlocked ? '접근 불가 개소' : '저장'}
```

new_string:
```
                {(inspectPhoto.uploading || inspectBcPhoto.uploading) ? '사진 업로드 중...' : inspectSubmitting ? '저장 중...' : isAccessBlocked ? '접근 불가 개소' : (planType === 'extinguisher' && selected?.marker_type === 'indoor_hydrant' && !!selected?.check_point_id && pairedBcLoading) ? '비상콘센트 확인 중...' : '저장'}
```

**작업 흐름**:
1. Read 로 현재 파일 해당 영역 확인.
2. 위 5개 Edit 호출 — old_string 정확 매치 (들여쓰기 2-space 유지).
3. `cd cha-bio-safety && npx tsc --noEmit` 로 타입 체크.
4. 검증 grep (cha-bio-safety/src/pages/FloorPlanPage.tsx 에 대해):
   - `grep -c 'pairedBcLoading' ...` ≥ 6 (state 1 + fetch effect 4 + 모달닫힘 effect 1 + button disabled 1 + button label 1 = 8 안팎)
   - `grep -c 'setPairedBcLoading(true)' ...` = 1 (fetch 시작)
   - `grep -c 'setPairedBcLoading(false)' ...` ≥ 3 (성공/매핑없음/실패/cleanup/모달닫힘 등)
   - `grep -c 'inspectionApi.getCheckpoints' ...` = 변경 전과 동일 (paired BC fetch 1건만, 다른 곳 안 건드림)
   - `grep -c 'cp.category === .비상콘센트.' ...` = 변경 전과 동일 (paired BC 매칭 룰 보존)
   - 작업 브랜치 production
5. commit (한글 OK):
   ```
   fix(260529-lzh): FloorPlanPage paired BC fetch race 가드 + 저장 disabled

   - pairedBcLoading state 추가 (fetch 진행 중일 때 true)
   - paired BC fetch useEffect 에 setLoading 시작/완료/실패/cleanup 모두 반영
   - 저장 button disabled 조건에 indoor_hydrant SH 마커 + cp_id 있을 때 + loading 중일 때 추가
   - button label 분기에 '비상콘센트 확인 중...' 표시 추가
   - 5월 사이클 CP-B3-7-BC 누락 isolated 사고 재발 방지
   - paired BC 매칭 룰 / 동시 저장 흐름 변경 없음 (가드만 추가)
   ```

**중요**:
- 빌드 + wrangler pages deploy 는 executor 안 함 — orchestrator 처리.
- 작업 브랜치 production 가정 (production-sync 노트 작업중). HEAD 가 production 아니면 STOP + 보고.
  </action>
  <verify>
    <automated>
      cd cha-bio-safety && npx tsc --noEmit
      grep -c 'pairedBcLoading' cha-bio-safety/src/pages/FloorPlanPage.tsx
      grep -c 'setPairedBcLoading(true)' cha-bio-safety/src/pages/FloorPlanPage.tsx
      grep -c 'setPairedBcLoading(false)' cha-bio-safety/src/pages/FloorPlanPage.tsx
      grep -cE "cp\.category === '비상콘센트'" cha-bio-safety/src/pages/FloorPlanPage.tsx
      git rev-parse --abbrev-ref HEAD
    </automated>
  </verify>
  <done>
- FloorPlanPage.tsx 의 5 영역 (state, fetch effect, 모달닫힘 effect, button disabled, button label) 에 pairedBcLoading 가드 반영
- tsc 통과
- grep 검증 모두 PASS
- 기존 paired BC 매칭 룰 (location_no 매칭) 변경 0
- production 브랜치 commit
- SUMMARY 에 변경 diff + grep 결과 + commit hash 박제
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: 배포 후 사용자 시나리오 검증 (orchestrator deploy 후)</name>
  <what-built>
- Task 1: CP-B3-7-BC 회복 record INSERT (prod D1)
- Task 2: FloorPlanPage paired BC fetch race 가드 commit
- 그 후 orchestrator (메인 Claude) 가 `cd cha-bio-safety && npm run build && npx wrangler pages deploy dist --project-name=cbc7119 --branch=production --commit-message="..."` 로 배포
  </what-built>
  <how-to-verify>
**A. CP-B3-7-BC 가 일반 점검에 완료로 노출**
- 일반 점검 (CheckpointsPage) → B3 → 비상콘센트 → D-7 기둥 cp 가 완료 (정상) 표시

**B. 도면점검 race 가드 동작**
1. 도면점검 → 소화전 → 임의 indoor_hydrant SH 마커 클릭
2. 모달 열리는 순간 즉시 저장 누르려 시도 → 저장 버튼이 disabled 되어 있고 "비상콘센트 확인 중..." 같은 표시 (혹은 잠시 후 활성화)
3. paired BC 매핑 있는 마커: 잠시 후 BC 입력 섹션 노출 + 저장 활성 → 정상 SH+BC 동시 저장 가능
4. paired BC 매핑 없는 마커 (예: 비상콘센트 cp 가 없는 층/위치): fetch 완료 후 저장 활성 + BC 섹션 미노출 (기존 정상 동작)

**C. 다른 plan_type 회귀 없음**
- 유도등 (guidelamp) / 스프링클러 (sprinkler) / 감지기 (detector) 등 다른 도면점검 흐름은 가드 미적용 (조건에 `planType === 'extinguisher' && marker_type === 'indoor_hydrant'` 명시) → 저장 즉시 가능, 기존과 동일
  </how-to-verify>
  <resume-signal>
검증 통과 시 "approved" 또는 "배포 OK". 이슈 발견 시 시나리오 번호 + 증상 보고. 검증 후 production-sync.md 표 entry 추가 + 상태 '안정' 환원.
  </resume-signal>
</task>

</tasks>

<verification>
1. Task 1 SQL: INSERT 1건 + verify 3 step (5월 미완료 0 / 총 count 3760)
2. Task 2 grep: pairedBcLoading 6+ / setPairedBcLoading(true) 1 / setPairedBcLoading(false) 3+ / 기존 매칭 룰 보존
3. tsc 통과
4. Task 3 사용자 시나리오 A/B/C 통과
5. production-sync.md 표 entry + 안정 환원
</verification>

<success_criteria>
- CP-B3-7-BC 가 prod D1 에 record 1건 회복 (5월 비상콘센트 미완료 0 건)
- FloorPlanPage paired BC fetch 가드로 fetch 미완료 상태 저장 race 차단
- paired BC 매칭/저장 흐름 기존 동작 무변경
- 다른 plan_type 도면점검 영향 0
- 직원 도메인 cbc7119.pages.dev 배포 완료
- production-sync.md entry 추가 + 안정 환원
</success_criteria>

<output>
After completion, create `.planning/quick/260529-lzh-b3-7-bc-recovery-fetch-race-guard/260529-lzh-SUMMARY.md` containing:
- Task 1 SQL: SELECT/INSERT 명령 + 결과 (rows_read/written, JSON)
- Task 1 verify: 미완료 0 + total count 3760
- Task 2 diff: 5 영역 before/after
- Task 2 verify grep + tsc
- Task 2 commit hash
- 배포 URL (orchestrator deploy 후 추가)
- production-sync.md 갱신 entry
</output>
