---
phase: quick-260502-hgx
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages/InspectionPage.tsx
autonomous: false
requirements:
  - HGX-01  # 클라이언트 [접근불가] 자동 정상처리 useEffect 두 개 + 관련 ref 제거 (cron 단일화)
  - HGX-02  # 5/2 12:29 잘못 들어간 14건(소화기 [접근불가] 자동 정상처리) admin SQL 삭제
  - HGX-03  # 14건 외 동일 사고 (다른 카테고리/시간) 점검 후 정리
  - HGX-04  # inspection_sessions 잔존 행 정리 (해당 세션이 14건만 들어있으면 함께 삭제)
  - HGX-05  # production 빌드 + Cloudflare Pages 배포 (`--branch production`) + PWA 캐시 갱신 안내
user_setup: []

must_haves:
  truths:
    - "InspectionPage 진입/그룹 선택 시 클라이언트가 [접근불가] cp 를 자동으로 'normal' 처리하지 않는다"
    - "5/2 12:29 KST 자동 입력된 소화기 [접근불가] 14건이 production check_records 에 존재하지 않는다"
    - "5/2 사고 외 정상 점검 기록 (memo != '접근불가 개소 자동 정상처리') 은 단 한 건도 영향받지 않는다"
    - "5/22 (소화기 마지막 점검일) 에 cbc-cron-worker 가 재실행되어 [접근불가] cp 를 다시 자동 정상처리할 수 있는 상태 (해당 cp 들의 5월 check_records 가 비어 있음)"
    - "production 빌드/배포가 완료되어 사용자 PWA 가 새 SW 로 업데이트 후 useEffect 코드가 사라진 번들을 받는다"
  artifacts:
    - path: "src/pages/InspectionPage.tsx"
      provides: "wkAutoRef/feAutoRef 선언 및 useEffect 2개 제거된 코드"
      contains: "// 30초마다 폴링"
    - path: ".planning/quick/260502-hgx-useeffect-cron-5-2-14-admin/260502-hgx-SUMMARY.md"
      provides: "삭제 전 백업 SELECT 결과 + 삭제 SQL + 배포 검증 로그"
  key_links:
    - from: "src/pages/InspectionPage.tsx (배포 번들)"
      to: "cbc-cron-worker (handleAccessBlockedAutoComplete)"
      via: "memo='접근불가 개소 자동 정상처리' 단일 작성자 = cron"
      pattern: "memo.*접근불가 개소 자동 정상처리"
---

<objective>
[접근불가] 자동 정상처리 로직을 cron 단독으로 일원화하고, 5/2 클라이언트 useEffect 사고로 잘못 들어간 14건을 admin 권한으로 정리한다.

Purpose:
- 260429-qd8 에서 도입한 cron 이 "그 달 마지막 점검일" 게이트로 안전하게 처리하는 반면, 클라이언트 useEffect 두 개는 날짜 가드 없이 그룹 진입 즉시 발동되어 사용자(2022051052)가 5/2 에 의도치 않게 14건을 자동 정상처리한 사고가 발생함.
- 클라이언트 폴백을 제거하여 단일 작성자(cron) 로 일원화. 5/22 에 정상 cron 발동으로 해당 cp 들이 다시 자동 처리될 수 있도록 잘못 들어간 14건을 삭제.

Output:
- src/pages/InspectionPage.tsx 에서 useEffect 2개 + ref 2개 제거
- production D1 에서 14건 (+ 동일 사고 발견 시 추가분) check_records 삭제 + 잔여 inspection_sessions 정리
- production 배포 + PWA 캐시 갱신 안내
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md
@.planning/STATE.md
@.planning/quick/260429-qd8-access-blocked-cron/260429-qd8-SUMMARY.md
@src/pages/InspectionPage.tsx

<interfaces>
<!-- 제거 대상 코드의 정확한 위치/형태. executor 는 이 블록만 보고 정확히 잘라낼 수 있어야 한다. -->

src/pages/InspectionPage.tsx 라인 4112-4113 (선언):
```tsx
  const wkAutoRef = useRef(false)
  const feAutoRef = useRef(false)
```

src/pages/InspectionPage.tsx 라인 4251-4277 (완강기 useEffect):
```tsx
  // 완강기 카테고리 선택 시 접근불가 개소 자동 정상처리 (1회)
  useEffect(() => {
    if (selectedGroupIdx === null || wkAutoRef.current || allCheckpoints.length === 0) return
    if (!CATEGORY_GROUPS[selectedGroupIdx].categories.includes('완강기')) return

    const inaccessible = allCheckpoints.filter(
      cp => cp.category === '완강기' && cp.description === '접근불가' && !monthRecords[cp.id]
    )
    if (inaccessible.length === 0) { wkAutoRef.current = true; return }

    wkAutoRef.current = true
    ;(async () => {
      try {
        const sid = await ensureSession()
        await Promise.all(
          inaccessible.map(cp =>
            inspectionApi.submitRecord(sid, {
              checkpointId: cp.id,
              result: 'normal',
              memo: '접근불가 개소 자동 정상처리',
            })
          )
        )
        loadTodayRecords()
      } catch { wkAutoRef.current = false }
    })()
  }, [selectedGroupIdx, allCheckpoints]) // eslint-disable-line
```

src/pages/InspectionPage.tsx 라인 4279-4305 (소화기 useEffect): 위와 같은 패턴, 카테고리만 '소화기' 이고 description 매칭은 `description?.includes('[접근불가]')`.

확인된 사용처 (`grep -n "wkAutoRef\|feAutoRef" src/pages/InspectionPage.tsx`):
- 4112, 4113: 선언
- 4253, 4259, 4261, 4275: 완강기 useEffect 내부만
- 4281, 4287, 4289, 4303: 소화기 useEffect 내부만

→ useEffect 2개를 통째로 제거하면 ref 2개도 사용처가 0이므로 안전하게 제거 가능.
</interfaces>

<sql_targets>
<!-- 5/2 사고 식별 쿼리. Task 2 의 백업/삭제 SQL 의 기반이 된다. -->

식별 조건 (cron 과 동일한 memo 문자열):
- `memo = '접근불가 개소 자동 정상처리'`
- `checked_at LIKE '2026-05-02 12:29:%'` (KST 12:29:19 근처에 14건 일괄 입력)
- `result = 'normal'`
- `staff_id = 2022051052` (사용자 본인)

D1 binding: `DB` / database_name: `cha-bio-db`. 모든 wrangler d1 명령은 `--remote` 로 production 직접.
</sql_targets>
</context>

<tasks>

<task type="auto">
  <name>Task 1: InspectionPage useEffect 2개 + ref 2개 제거</name>
  <files>src/pages/InspectionPage.tsx</files>
  <action>
    HGX-01 구현. 다음 4개 블록을 순서대로 정확히 제거한다 (다른 어떤 라인도 건드리지 않는다):

    1) 라인 4112-4113 두 줄 (`const wkAutoRef = useRef(false)` + `const feAutoRef = useRef(false)`) 삭제. 주변 다른 useRef 선언 (timerRef, prevIdsRef, prevSW 등) 은 유지.
    2) 라인 4251-4277 완강기 useEffect 블록 삭제 (주석 `// 완강기 카테고리 선택 시 접근불가 개소 자동 정상처리 (1회)` 부터 `}, [selectedGroupIdx, allCheckpoints]) // eslint-disable-line` 까지).
    3) 라인 4279-4305 소화기 useEffect 블록 삭제 (주석 `// 소화기 카테고리 선택 시 접근불가 개소 자동 정상처리 (1회)` 부터 동일 형태 종료까지).
    4) 4250 (폴링 useEffect 종료) 와 4307 (ensureSession 함수 시작) 사이에는 빈 줄 1개만 남긴다.

    제거 사유 주석은 남기지 않는다 (코드 베이스 컨벤션상 노이즈). 사고 경위는 SUMMARY.md 에만 기록.

    제거 후 `import { useState, useEffect, useMemo, useRef, useCallback } from 'react'` 의 useRef 는 그대로 둔다 (다른 useRef 사용처 다수 존재 — 4107, 4108, 4114, 212 등).

    검색 검증: 변경 후 `grep -n "wkAutoRef\|feAutoRef\|접근불가 개소 자동 정상처리" src/pages/InspectionPage.tsx` 결과가 0줄이어야 한다.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && grep -n "wkAutoRef\|feAutoRef\|접근불가 개소 자동 정상처리" src/pages/InspectionPage.tsx | wc -l | tr -d ' ' | grep -qx "0" && npx tsc --noEmit -p tsconfig.json && npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>
    - InspectionPage.tsx 에서 wkAutoRef / feAutoRef / "접근불가 개소 자동 정상처리" grep 0건
    - tsc --noEmit 무에러
    - npm run build 성공 (vite + tsc)
    - 동일 파일 내 다른 useRef/useEffect 변경 0건 (라인 변동 외)
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: production D1 사고 기록 식별 + 백업 SELECT (사용자 승인 게이트)</name>
  <files>.planning/quick/260502-hgx-useeffect-cron-5-2-14-admin/260502-hgx-SUMMARY.md</files>
  <what-built>
    HGX-02/03/04 의 삭제 전 단계: production D1 에 직접 쿼리하여 (1) 5/2 12:29 소화기 14건, (2) 같은 시간 다른 카테고리 동일 memo 자동 처리, (3) 14건이 묶여 있는 inspection_sessions 행이 그 14건만 들어있는지를 확인한다. 결과를 SUMMARY.md 에 백업으로 기록.

    실행할 쿼리 (모두 `--remote` 로 production 직접):

    ```bash
    # (A) 5/2 12:29 동일 memo 자동 처리 전수 조사 — 카테고리 무관
    npx wrangler d1 execute cha-bio-db --remote --json --command "
      SELECT cr.id, cr.checkpoint_id, cr.session_id, cr.staff_id, cr.result, cr.memo, cr.checked_at, cp.category, cp.description
      FROM check_records cr
      JOIN check_points cp ON cp.id = cr.checkpoint_id
      WHERE cr.memo = '접근불가 개소 자동 정상처리'
        AND cr.checked_at LIKE '2026-05-02 12:29:%'
      ORDER BY cr.id;
    "

    # (B) 그 시간대에 묶여 있는 inspection_sessions 행
    npx wrangler d1 execute cha-bio-db --remote --json --command "
      SELECT s.id, s.staff_id, s.date, s.floor, s.created_at,
             (SELECT COUNT(*) FROM check_records WHERE session_id = s.id) AS total_records,
             (SELECT COUNT(*) FROM check_records WHERE session_id = s.id AND memo = '접근불가 개소 자동 정상처리') AS auto_records
      FROM inspection_sessions s
      WHERE s.id IN (
        SELECT DISTINCT session_id FROM check_records
        WHERE memo = '접근불가 개소 자동 정상처리'
          AND checked_at LIKE '2026-05-02 12:29:%'
      );
    "

    # (C) 안전성 검증: 5/22 cron 정상 발동 가능 여부 — 해당 cp 들의 5월 check_records 다른 행 존재 여부
    npx wrangler d1 execute cha-bio-db --remote --json --command "
      SELECT cr.checkpoint_id, COUNT(*) AS other_records_in_may
      FROM check_records cr
      WHERE cr.checkpoint_id IN (
        SELECT checkpoint_id FROM check_records
        WHERE memo = '접근불가 개소 자동 정상처리'
          AND checked_at LIKE '2026-05-02 12:29:%'
      )
        AND cr.checked_at LIKE '2026-05-%'
        AND NOT (cr.memo = '접근불가 개소 자동 정상처리' AND cr.checked_at LIKE '2026-05-02 12:29:%')
      GROUP BY cr.checkpoint_id;
    "
    ```

    각 쿼리 결과 (id 목록 / category 분포 / session_id) 를 SUMMARY.md 의 "Backup (pre-delete)" 섹션에 raw JSON 그대로 붙여 영구 보존.

    그리고 다음 두 가지를 SUMMARY.md 에 명시한다:
    - **삭제 대상 check_records id 목록** (A 결과 전체)
    - **삭제 대상 inspection_sessions id 목록**: B 결과 중 `total_records == auto_records` 인 행만 (즉, 다른 정상 점검 기록이 없는 세션). `total_records > auto_records` 인 세션은 세션 자체는 보존하고 자식 check_records 만 삭제.
    - **5/22 cron 안전성**: C 결과가 (대부분/전부) 빈 결과여야 함. 이미 다른 점검 기록이 있는 cp 가 있다면 cron 의 `NOT IN (이번 달 check_records)` 필터로 자동 제외되므로 문제 없음을 명기.
  </what-built>
  <how-to-verify>
    사용자가 SUMMARY.md 의 Backup 섹션을 직접 검토한다:

    1. (A) 결과 row 수가 14건인지 확인. 14건 초과 시 추가 사고 가능성 — 사용자에게 추가 삭제 여부 결정 요청.
    2. (A) 결과 모든 row 의 `cp.category` 가 의도된 사고 (소화기) 와 일치하는지. 다른 카테고리 (완강기/유도등 등) 가 섞여 있다면 의도된 cron 발동인지/사고인지 사용자 판단 필요.
    3. (A) 결과 모든 row 의 `staff_id` 가 2022051052 인지. cron 은 schedule_items.assignee_id 를 쓰므로 그 staff_id 가 다른 값이면 cron 출력일 수 있음 — 그 경우 삭제 후보에서 제외.
    4. (B) 결과로 "세션 통째 삭제" / "세션 보존, 자식만 삭제" 분류가 명확한지.
    5. (C) 결과가 비어 있거나 사용자 판단으로 안전한지 (5/22 cron 재처리에 영향 없음 확인).
    6. SUMMARY.md 에 raw JSON 결과가 보존되어 있는지 (사고 후 감사 추적 가능 여부).

    사용자가 위 6항목을 모두 OK 하면 Task 3 진행. 한 항목이라도 의문이면 작업 중단 후 사용자와 상의.
  </how-to-verify>
  <resume-signal>"approved — proceed with delete" 또는 구체적 수정 지시 (e.g., "X건만 삭제" / "Y 세션은 보존")</resume-signal>
</task>

<task type="auto">
  <name>Task 3: production D1 14건 삭제 + 세션 정리 + 빌드/배포</name>
  <files>.planning/quick/260502-hgx-useeffect-cron-5-2-14-admin/260502-hgx-SUMMARY.md</files>
  <action>
    HGX-02/04/05 실행. Task 2 에서 사용자 승인 받은 대상에 대해서만 다음 단계를 순서대로 실행:

    **1) production D1 삭제 (admin 예외 작업)**

    Task 2 의 (A) 쿼리로 식별된 정확한 id 목록을 사용. 안전을 위해 memo + checked_at 패턴까지 같이 매칭하는 WHERE 조건으로 한 번 더 가드:

    ```bash
    npx wrangler d1 execute cha-bio-db --remote --json --command "
      DELETE FROM check_records
      WHERE memo = '접근불가 개소 자동 정상처리'
        AND checked_at LIKE '2026-05-02 12:29:%'
        AND staff_id = 2022051052;
    "
    ```

    (Task 2 에서 staff_id 가 다른 row 가 있어 사용자가 일부만 승인한 경우, WHERE 절을 그에 맞게 좁힌다.)

    삭제 행 수가 Task 2 의 (A) 카운트와 일치하는지 확인. 일치하지 않으면 즉시 중단하고 사용자에게 보고.

    **2) inspection_sessions 정리**

    Task 2 의 (B) 결과에서 `total_records == auto_records` 였던 session_id 만 삭제 (자식 행 모두 삭제됐으므로 빈 세션):

    ```bash
    npx wrangler d1 execute cha-bio-db --remote --json --command "
      DELETE FROM inspection_sessions WHERE id IN ('<sid1>', '<sid2>', ...);
    "
    ```

    `total_records > auto_records` 였던 세션은 자식 정상 기록이 남아 있으므로 건들지 않는다.

    **3) post-delete 검증**

    ```bash
    # 14건 0건이어야 함
    npx wrangler d1 execute cha-bio-db --remote --command "
      SELECT COUNT(*) FROM check_records
      WHERE memo = '접근불가 개소 자동 정상처리'
        AND checked_at LIKE '2026-05-02 12:29:%';
    "
    # 5/22 cron 재처리 가능성 확인 — 해당 cp 들의 5월 정상 점검 기록이 비어 있는지
    npx wrangler d1 execute cha-bio-db --remote --command "
      SELECT cp.id, cp.category, cp.description,
             (SELECT COUNT(*) FROM check_records cr
              WHERE cr.checkpoint_id = cp.id AND cr.checked_at LIKE '2026-05-%') AS may_records
      FROM check_points cp
      WHERE cp.description LIKE '%접근불가%' AND cp.is_active = 1 AND cp.category = '소화기'
      ORDER BY may_records DESC, cp.id LIMIT 30;
    "
    ```

    검증 결과 raw output 을 SUMMARY.md 의 "Post-delete verification" 섹션에 보존.

    **4) production 배포**

    Task 1 의 코드 변경을 production 으로:

    ```bash
    cd /Users/jykevin/Documents/20260328/cha-bio-safety
    git add src/pages/InspectionPage.tsx
    git commit -m "fix(inspection): remove client-side [접근불가] auto-complete useEffect (cron 단일화)"
    git push  # auto-push hook 가동, push 만 트리거됨
    npm run build
    npx wrangler pages deploy dist --project-name=cha-bio-safety --branch production --commit-message="quick-260502-hgx: remove access-blocked client useEffect"
    ```

    (CLAUDE.md 메모리: `--branch production` 누락 시 Preview 로 감 / wrangler 가 한글 commit message 거부할 수 있어 ASCII 별도 지정.)

    **5) PWA 캐시 갱신 안내**

    SUMMARY.md 의 "Deploy & user action" 섹션에 다음을 명기:
    - 배포 commit hash + Cloudflare 배포 URL
    - 사용자(방재팀 4인) 가 PWA 를 한 번 닫고 다시 열거나 (브라우저 SW 활성 갱신) 재설치하면 새 번들 적용됨을 안내
    - 다음 카테고리 진입 시 자동 14건이 추가 입력되지 않는지 사용자에게 확인 요청
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && npx wrangler d1 execute cha-bio-db --remote --json --command "SELECT COUNT(*) AS c FROM check_records WHERE memo = '접근불가 개소 자동 정상처리' AND checked_at LIKE '2026-05-02 12:29:%';" | grep -E '"c":\s*0'</automated>
  </verify>
  <done>
    - production check_records 에서 5/2 12:29 자동 처리 행 0건
    - 빈 inspection_sessions 행 정리 완료 (자식 정상 기록 없는 경우)
    - production Pages 배포 성공 (`--branch production`)
    - SUMMARY.md 에 Backup / Post-delete verification / Deploy URL 모두 기록
    - 사용자에게 PWA 재시작 안내 메시지 전달
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| developer → production D1 | admin 예외 작업으로 직접 DELETE 실행 — 잘못된 WHERE 절이면 정상 점검 기록 손실 |
| client bundle → cron worker | 단일 작성자 일관성: memo 문자열 동일 → 둘 다 살아 있으면 중복/사고. 본 작업으로 클라 제거하여 단일화 |
| 사용자 PWA 캐시 → 새 번들 | SW 캐시가 갱신되지 않으면 useEffect 가 살아 있는 구 번들이 계속 동작 |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-hgx-01 | Tampering | Task 3 DELETE WHERE 절 | mitigate | memo 문자열 + checked_at LIKE + staff_id 3중 매칭 가드, Task 2 백업 SELECT 행 수와 DELETE 행 수 일치 검증, 일치하지 않으면 즉시 중단 |
| T-hgx-02 | Tampering | inspection_sessions 삭제 | mitigate | total_records == auto_records 인 세션만 삭제. 다른 정상 기록이 있는 세션은 본문 보존 |
| T-hgx-03 | Repudiation | admin 삭제 작업 감사 추적 | mitigate | SUMMARY.md 의 Backup 섹션에 삭제 전 raw JSON 영구 보존 (id/checkpoint_id/checked_at 전부) |
| T-hgx-04 | Denial of Service | 5/22 cron 자동 처리 | accept | cron 의 `NOT IN (이번 달 check_records)` 필터가 이미 멱등성 보장. 14건 삭제 후 재처리 정상 |
| T-hgx-05 | Elevation of Privilege | client useEffect 잔존 | mitigate | Task 1 grep 0건 검증 + production 빌드 + Pages 배포 + PWA 재시작 안내까지 포함하여 코드 잔존 가능성 0 |
| T-hgx-06 | Information Disclosure | wrangler --remote 출력 로그 | accept | staff_id/memo 만 노출. 비밀정보 없음. SUMMARY.md 는 .planning/ 내부 (gitignore 또는 private repo) |
</threat_model>

<verification>
- 코드: `grep -n "wkAutoRef\|feAutoRef\|접근불가 개소 자동 정상처리" src/pages/InspectionPage.tsx` 결과 0줄
- 빌드: `npm run build` 성공
- DB: `SELECT COUNT(*) FROM check_records WHERE memo = '접근불가 개소 자동 정상처리' AND checked_at LIKE '2026-05-02 12:29:%'` 결과 0
- 배포: Cloudflare Pages production 배포 URL 확인
- 검증 (사용자): 다음 InspectionPage 진입 시 자동 14건이 추가되지 않음
- 5/22 cron: 그 날 KST 15:00 발동 후 [접근불가] 소화기 cp 들이 정상 자동 처리되는지 확인 (다음 단계 작업)
</verification>

<success_criteria>
- [ ] InspectionPage useEffect 2개 + ref 2개 제거된 코드가 production 에서 동작 중
- [ ] 5/2 12:29 자동 입력 14건 (또는 사용자 승인 범위) 이 production check_records 에서 삭제됨
- [ ] 그 14건만 들어있던 inspection_sessions 도 함께 삭제됨 (해당 시)
- [ ] 정상 점검 기록 (memo != '접근불가 개소 자동 정상처리') 은 단 한 건도 영향받지 않음
- [ ] SUMMARY.md 에 Backup (raw JSON) + Post-delete verification + Deploy URL 모두 기록
- [ ] 사용자에게 PWA 재시작 안내 전달, 다음 진입 시 자동 14건 추가 입력 없음 확인
</success_criteria>

<output>
After completion, create `.planning/quick/260502-hgx-useeffect-cron-5-2-14-admin/260502-hgx-SUMMARY.md` with:
- Backup (pre-delete) 섹션: Task 2 의 (A)/(B)/(C) 쿼리 raw JSON 결과
- Post-delete verification 섹션: Task 3 의 검증 쿼리 raw output
- Deploy & user action 섹션: commit hash, Pages URL, PWA 재시작 안내
- Decisions 섹션: useEffect 통째 제거 사유, 세션 보존/삭제 분기 기준, cron 안전성 근거
</output>
