---
phase: quick-260820-nkt-div-prod-staging
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/components/div/DivInspectModal.tsx
autonomous: true
requirements: [DIV-PRESS-PORT-260820]
must_haves:
  truths:
    - "prod DivInspectModal.tsx가 staging HEAD 버전과 바이트(sha256) 동일"
    - "신규 심볼 divRound / noBasis 와 신규 사유 문자열이 파일에 실재 (git apply 무음 no-op 아님)"
    - "cha-bio-safety npm run build (tsc+vite) 성공"
    - "해당 파일 단건 커밋 1개 생성 (커밋 메시지에 금칙 리터럴 없음)"
  artifacts:
    - path: "cha-bio-safety/src/components/div/DivInspectModal.tsx"
      provides: "급변 감지 + 설정압 대비 15% 절대하한 + 현 회차 이후 라운드 제외 + 비교 기록 부족 라벨"
      contains: "divRound"
  key_links:
    - from: "HANDOFF-div-pressure-judgment.patch"
      to: "cha-bio-safety/src/components/div/DivInspectModal.tsx"
      via: "git apply (1:1 이식)"
      pattern: "divRound"
---

<objective>
staging에서 구현·배포·자동검증(시뮬레이터 18/18, 실브라우저 E2E 13/13)·사용자 UAT 승인(2026-08-20)까지 완료된 DIV 압력 자동판정 수정 패치를 prod `cha-bio-safety`에 기계적으로 1:1 이식한다.

Purpose: prod B1층 DIV#2(`-1-2`) 실사례 버그 — 2차압 2.4→0.0 단일 급락이 'normal' 오판정되던 결함을 제거. staging에서 이미 확정된 로직을 prod에 동일하게 반영.
Output: 패치 적용된 `DivInspectModal.tsx` 1개 파일 + 단건 커밋 1개. 빌드 통과.

**범위 고정 (constraints):** 새 설계 금지, 패치 내용 변경 금지. 이식 정본 = HANDOFF의 "[완료] staging 검증 결과 및 prod 이식 패키지" 섹션. 패치 파일 = `HANDOFF-div-pressure-judgment.patch` (149줄, 단일 파일).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/jykevin/Documents/cbc7119-data/HANDOFF-div-pressure-judgment.md
@/Users/jykevin/Documents/cbc7119-data/HANDOFF-div-pressure-judgment.patch
@/Users/jykevin/Documents/20260328/cha-bio-safety/src/components/div/DivInspectModal.tsx
</context>

<source_coverage_audit>
이식 정본은 단일 검증 패치이며, 패치를 verbatim 적용하는 것으로 모든 스펙 항목이 자동 커버된다 (내용 개별 재구현 없음).

| Source | Item | Covered by |
|--------|------|-----------|
| HANDOFF §1 | 급변 감지 (1차 +0.5/+1.0, 2차 -0.5/-1.0) | 패치 hunk @@ -426 (급변 블록) |
| HANDOFF §2 | 설정압 대비 15% 절대 하한 (bad 단독) | 패치 hunk @@ -426 (floorChecked 블록) |
| HANDOFF §3 | 기존 추세 로직 유지 + '누적' 표기 | 패치 hunk (detectDivTrend 호출부 문자열) |
| HANDOFF §4 확장 | 현 회차 이후(≥) 라운드 전부 제외 (divRound) | 패치 hunk @@ -54 + @@ -426 |
| HANDOFF §5 | 비교 기록 부족 라벨 (noBasis) | 패치 hunk @@ -360 + @@ -622 |
| HANDOFF §6 | null 압력 레코드 제외 (방어) | 패치 hunk (hist1/hist2 필터) |
| HANDOFF 추가 2/3 | prev 표시 동일 라운드 필터 / fetch 선클리어 | 패치 hunk @@ -557 / @@ -378 |

MISSING 항목 없음. 확정 옵션(2차압 급상승=미포함, 하한 15%=유지)은 UAT 무변경 통과로 이미 패치에 반영됨.
</source_coverage_audit>

<tasks>

<task type="auto">
  <name>Task 1: 패치 적용 + 실재/바이트 검증 + 빌드 + 커밋</name>
  <files>cha-bio-safety/src/components/div/DivInspectModal.tsx</files>
  <action>
repo 루트는 `/Users/jykevin/Documents/20260328`, 앱은 `cha-bio-safety/` 하위이고 패치 경로가 `src/…` 이므로 `cha-bio-safety` 디렉토리에서 패치를 적용한다: `cd /Users/jykevin/Documents/20260328/cha-bio-safety && git apply /Users/jykevin/Documents/cbc7119-data/HANDOFF-div-pressure-judgment.patch`.

`git apply`가 종료코드 0을 내면서도 무음 no-op으로 파일이 안 바뀐 이력(대괄호 경로 등)이 있으므로, 적용 성공을 종료코드로 단정하지 말고 아래 verify의 grep 실재 확인 + 바이트 해시 일치 두 관문을 모두 통과해야 완료로 본다.

패치는 staging 커밋 2건(`55bb8f7` 본 수정 + `04b8705` 누적 표기)을 담은 단일 파일 diff다. 신규 심볼 `divRound`(회차 순서 키), `noBasis`(비교 근거 전무 라벨 분기), 신규 사유 문자열(`2차압 급락`, `설정압 대비 15% 미만`, `비교 기록 부족`)이 반드시 실재해야 한다. HANDOFF §4~§6 및 추가 반영 3건이 이 심볼들에 대응한다.

바이트 일치 검증: 적용 후 prod 파일 sha256이 staging HEAD 버전과 동일해야 한다 — `git -C /Users/jykevin/Documents/cbc7119-data show HEAD:src/components/div/DivInspectModal.tsx` 의 해시와 prod 파일 해시 비교. 두 해시가 다르면 이식 실패로 간주하고 중단(패치 변형·부분 적용 신호).

빌드: `cha-bio-safety`에서 `npm run build` (tsc + vite) 가 성공해야 한다.

커밋: 해당 파일 1개만 스테이징해 단건 커밋한다. 커밋 메시지는 한글 conventional commit로 작성하되, 메시지 문자열 안에 `wrangler` 또는 `git`+`commit` 두 단어 리터럴을 넣지 않는다 (require-production-branch / auto-push 훅 오탐 방지). 권장 메시지: `fix(div): 압력 자동판정 급변감지+설정압하한+회차제외+기록부족 라벨 이식 (staging 검증)`. production 브랜치에서 직접 커밋한다 (새 브랜치 생성 금지, 워크트리 격리 없음 — 사전 확인됨). 배포는 이 태스크 범위 밖(후속 단계).
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && grep -q 'divRound' src/components/div/DivInspectModal.tsx && grep -q 'noBasis' src/components/div/DivInspectModal.tsx && grep -Fq '2차압 급락' src/components/div/DivInspectModal.tsx && grep -Fq '설정압 대비 15% 미만' src/components/div/DivInspectModal.tsx && grep -Fq '비교 기록 부족' src/components/div/DivInspectModal.tsx && echo SYMBOLS_OK</automated>
    <automated>S=$(git -C /Users/jykevin/Documents/cbc7119-data show HEAD:src/components/div/DivInspectModal.tsx | shasum -a 256 | cut -d' ' -f1); P=$(shasum -a 256 /Users/jykevin/Documents/20260328/cha-bio-safety/src/components/div/DivInspectModal.tsx | cut -d' ' -f1); [ "$S" = "$P" ] && echo "HASH_MATCH $P" || { echo "HASH_MISMATCH staging=$S prod=$P"; exit 1; }</automated>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && npm run build</automated>
    <automated>git -C /Users/jykevin/Documents/20260328 log -1 --name-only --format='%s' | grep -q 'DivInspectModal.tsx' && echo COMMIT_OK</automated>
  </verify>
  <done>패치가 적용되어 신규 심볼/사유 문자열이 실재하고, prod 파일 sha256이 staging HEAD와 일치하며, npm run build 성공, 해당 파일 단건 커밋 1개 존재. 커밋 메시지에 훅 금칙 리터럴 없음.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| (없음 — 신규 없음) | 순수 클라이언트 판정 로직 변경. 새 입력 표면·새 API·새 의존성 없음. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-nkt-01 | Tampering | 패치 적용 무결성 | mitigate | `git apply` 종료코드 신뢰 금지 — grep 실재 + staging HEAD 대비 sha256 바이트 일치 이중 관문으로 변형/부분적용 차단 |
| T-nkt-SC | Tampering | 패키지 설치 | accept | 신규 npm/pip/cargo 설치 없음 (단일 소스 파일 로직 패치). 공급망 표면 증가 0 |
</threat_model>

<verification>
- 신규 심볼(divRound, noBasis) + 3개 사유 문자열 grep 실재
- prod 파일 sha256 == staging HEAD 버전 sha256 (바이트 동일)
- npm run build (tsc + vite) 성공
- DivInspectModal.tsx 단건 커밋 1개 (금칙 리터럴 없음)
</verification>

<success_criteria>
- `cha-bio-safety/src/components/div/DivInspectModal.tsx` 가 staging HEAD와 바이트 동일하게 패치됨
- 빌드 통과, 해당 파일만 담은 커밋 1건이 production 브랜치에 생성됨
- 배포/데이터 정정은 미실행 상태 (후속 단계 대기)
</success_criteria>

<follow_up_orchestrator_only>
아래는 **오케스트레이터(메인) 전용** 후속 단계다. 서브에이전트 production 배포 금지 정책상 executor 태스크 범위에서 제외 — 실행 주체는 메인 오케스트레이터.

1. **production 배포** (production-sync.md 게이트 하에): `cha-bio-safety` CWD에서 dist 배포. 프로젝트 `--project-name=cbc7119`, 브랜치 `--branch=production`, commit-message는 ASCII 별도(한글 커밋 거부 회피). `--project-name=cbc7119-data` 절대 금지(staging), `--project-name=cbc7119` 확인 후 실행.
2. **production-sync.md 갱신**: `.planning/production-sync.md` 게이트에 이번 이식(DIV 압력 자동판정 급변감지/설정압 하한/회차 제외/기록부족 라벨, staging 커밋 55bb8f7+04b8705)을 실제 prod 커밋 해시로 기록.
3. **prod 데이터 정정**: `-1-2` 2026-08 late 기록(현재 result=normal로 저장돼 미조치 추적에 안 잡힘)을 앱에서 재저장 → 새 로직상 자기 회차 제외로 `2차압 급락 (-2.4)` + `2차압 상실 (설정압 대비 15% 미만)` 발화(bad), 조치 플로우 진입. prod 이력 기준 예상 사유 = 급락+상실 2건('지속 하강'은 시드 차이로 prod엔 없음).
</follow_up_orchestrator_only>

<output>
Create `.planning/quick/260820-nkt-div-prod-staging/260820-nkt-SUMMARY.md` when done
</output>
