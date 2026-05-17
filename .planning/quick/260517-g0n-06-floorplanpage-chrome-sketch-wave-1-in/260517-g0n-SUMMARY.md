---
phase: 260517-g0n
plan: 01
subsystem: redesign/06-floorplan
tags: [sketch, design-token, modal-chrome, wave-1, html-only]
requires: [inspection-modal-chrome-rules.md, floorplan-chrome-sketch.html]
provides: [floorplan-modals-sketch.html]
affects: [redesign/06-floorplan-v2 (TSX 변환 대기)]
tech-stack-added: []
tech-stack-patterns: [v0.1.1-tokens-only, lucide-icons, single-color-accent-cta, status-pair-tokens]
key-files-created:
  - cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html
key-files-modified: []
decisions:
  - 모달 wrapper 안의 input/textarea bg = surface-page (모달 외부 본문 룰 §6.2 의 modal-내부 변형)
  - paired BC 점검 결과 = bad-selected (danger) — 3 status 페어 모두 시안에 등장하도록 의도적 선택
  - 마커 popup 미점검 아이콘 박스 = surface-sunken+border-default (status 토큰 아님 — 의미상 회색 톤이 맞음)
metrics:
  duration: ~12min
  completed: 2026-05-17
  tasks-completed: 1
  files-changed: 1
  lines-added: 967
---

# 260517-g0n 06 FloorPlanPage Wave 1 모달 sketch HTML

## 한 줄 요약

06 FloorPlanPage 의 3 모달 (마커 선택 정보 popup / inspectModal / resolveModal) 을 v0.1.1 토큰 + 02 inspection-unification chrome 룰 + 05 RemediationDetailPage 단색 accent CTA 패턴으로 통일한 sketch HTML 작성. 7 viewport (mobile dark sheet × 2 / desktop dark balloon × 1 / inspectModal mobile+desktop / resolveModal mobile+desktop) + 적용 룰 요약 rule-box 포함, 총 967 lines.

## 작성한 파일

- `cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html` (967 lines, 신규 생성)

## 7 viewport 구성

### Section A — 마커 선택 정보 popup (3 viewport)

| ID | 환경 | status | 패턴 | 액션 |
|---|---|---|---|---|
| A1 | mobile dark sheet | normal (safe) | 아이콘 박스 `bg-safe-bg border-[1.5px] border-safe` + statusLabel `text-safe` "정상" | 단일: 점검 기록 입력 |
| A2 | mobile dark sheet | bad/미조치 (fire) | 아이콘 박스 `bg-fire-bg border-[1.5px] border-fire` + statusLabel `text-fire` "불량" | 2개: 점검 기록 입력 + 조치 입력 |
| A3 | desktop dark balloon | uninspected | 아이콘 박스 `bg-surface-sunken border border-border-default` + statusLabel `text-text-tertiary` "미점검" (회색 톤) | 단일: 점검 기록 입력 |

- A1/A2 = bottom sheet (`absolute bottom-0` + grab handle `w-9 h-1 bg-border-default`)
- A3 = balloon (`absolute top/left` + `balloon-arrow-bottom` border-bottom via surface-raised, 백드롭 없음)
- 메모리 룰 `feedback_inspection_unresolved_color` 준수: 미조치 = fire (주황), danger 아님

### Section B — inspectModal 점검 기록 입력 (2 viewport)

| ID | 환경 | 카테고리 | 점검 결과 | 분기 |
|---|---|---|---|---|
| B1 | mobile dark | 소화기 | normal (safe) | 소화기 KV grid (8 페어) + 정보 수정/소화기 분리 (h-8 + leading-none) |
| B2 | desktop dark (max-w-400) | 소화전 | caution (warning) | paired BC 카드 + BC 점검 결과 bad (danger) + BC 특이사항 textarea |

- 점검 결과 3택 className: 02 InspectionPage 패턴 verbatim
  - 선택: `border-[1.5px] border-{status} bg-{status}-bg text-{status}` (safe/warning/danger)
  - 비선택: `border border-border-default bg-surface-page text-text-secondary`
- textarea + PhotoButton row: 모달 wrapper(raised) 안에서는 input bg = `surface-page` 로 분리해 시각 구분
- PhotoButton placeholder: `bg-surface-page border border-dashed border-border-default` + `lucide camera` + "촬영" leading-none

### Section C — resolveModal 조치 입력 (2 viewport)

| ID | 환경 | 카테고리 | 선택 | 분기 |
|---|---|---|---|---|
| C1 | mobile dark | 유도등 | "본체 교체" (accent) | 자재명 input + 개수 input + ea suffix + PhotoButton |
| C2 | desktop dark (max-w-400) | 감지기 | (선택 없음 — memo 분기) | 조치 내용 textarea (필수) — 자재 input 없음 |

- 조치 피커 3택 (라벨 없음): 선택 1.5px accent / 비선택 1px border-default page
- 지적 메모 배지: `bg-warning-bg border border-warning-bar rounded-sm px-2.5 py-1.5 text-caption text-warning` (warning 톤 카드)
- 하단 액션: `bg-accent text-text-on-accent` 단색 (linear-gradient 폐기, 05 RemediationDetailPage mirror)

## 적용된 핵심 룰

1. **v0.1.1 토큰 단일 source** — 옛 alias (`--bg/--bg2/--bg3/--bd/--bd2/--t1~3/--acl/--warn/--danger`) 0건
2. **lucide 아이콘 통일** — x / check-circle / alert-triangle / x-circle / camera / zap / flame / help-circle / chevron-left
3. **그라디언트 0건** — CTA 단색 `bg-accent text-text-on-accent`
4. **모달 wrapper 일관성** — `bg-surface-raised border border-border-default rounded-md p-5` (모바일 max-w-320 / 데스크톱 max-w-400)
5. **점검 결과 3택** — 02 InspectionPage 패턴 mirror (safe/warning/danger 페어, 각 status 1개 이상 시안 등장)
6. **조치 피커 3택** — 증상 피커 동일 패턴 (1.5px accent / 1px border-default page)
7. **input/textarea bg 분기** — 모달 wrapper(raised) → input(page) 시각 구분 (룰 §6.2 modal-내부 변형)
8. **h-8 컨테이너 안 text-caption** — `leading-none` 명시 (정보 수정 / 소화기 분리 / statusLabel meta)
9. **마커 popup 아이콘 박스** — status 토큰 페어로 통일 (uninspected만 sunken 회색)
10. **메모리 룰 `feedback_inspection_unresolved_color`** — 미조치 = fire (주황), danger 아님

## 자체 verify gate (15 grep 체크 모두 PASS)

```
lines:967 OK
viewports:9 OK            (요구 ≥6, 7 sketch viewport + 2 부수 매칭 chrome stub)
modal-wrappers:6 OK
normal-state:1 OK
caution-state:1 OK
bad-state:1 OK            (BC 점검 결과를 bad-selected 로 변경해 충족)
accent-cta:25 OK          (요구 ≥2)
alias:0 OK
gradient:0 OK
emoji-x:0 OK
lucide-x:3 OK
lucide-check:3 OK
lucide-alert:3 OK
lucide-xcircle:3 OK
raw-hex:0 OK              (status 토큰 정의는 :root 블록 — grep -v 로 제외)
```

## 메모리 룰 준수

- `feedback_design_sketch_first` — 시각만 손봄, 비즈니스 로직(소화기 KV / paired BC / planType 분기) 시각 표현만, 로직 변경 X
- `feedback_planner_prompt_sketch_verbatim` — 06 chrome sketch (1-244 line) head/style/tokens/viewport CSS verbatim 복사
- `feedback_redesign_sketch_rule_enforcement` — 룰 문서 §5/§6.2/§7 className verbatim 사용
- `feedback_inspection_unresolved_color` — 미조치 = fire (주황) 톤
- `feedback_text_caption_leading_none` — h-8 row 안 text-caption 모두 `leading-none` 명시

## Deviations from Plan

**1. [Rule 2 - Must-haves 충족] BC 점검 결과를 normal-selected → bad-selected (danger) 로 변경**
- **Found during:** Task 1 작성 후 첫 verify gate 실행 시
- **Issue:** 플랜의 B1=normal, B2=caution, BC=normal 조합으로는 bad-state (`border-[1.5px] border-danger bg-danger-bg text-danger`) 패턴이 시안에 등장하지 않음. 플랜 `must_haves.truths` 5번 ("점검 결과 3택은 02 inspection / 05 remediation 패턴 mirror — border-[1.5px] + status 토큰 페어") 의 verify gate `bad-state ≥1` 충족 불가.
- **Fix:** B2 BC 점검 결과를 bad-selected 로 변경. 사용자 시각 검토에 3 status 페어 모두 노출되어 통일 룰 검증이 명확해짐.
- **Files modified:** `cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html` (line 717-728)
- **Commit:** 5baa21a

**2. [Rule 3 - Tooling bug fix] verify gate bash 체이닝 패턴 보강 (sketch 본문 영향 0)**
- **Found during:** verify gate 실행 시
- **Issue:** 플랜 verify 의 `GRAD=$(grep -c 'linear-gradient' "$F") && [ "$GRAD" -eq 0 ]` 패턴에서 `grep -c` 가 0 매칭 시 exit 1 을 반환 → `&&` 체인 중단으로 후속 검사 미실행. 동일 패턴이 EMOJI/HEX 에도 있음.
- **Fix:** 실행 시 `$({ grep -c '...' "$F" || true; })` 로 wrap 해 정확한 count 비교. **sketch 파일에는 변경 0** — bash 도구만 보강. 향후 TSX 변환 quick 의 verify gate 작성 시 동일 패턴 사용.
- **Files modified:** 없음 (실행 명령만 보강)
- **Commit:** N/A

## 사용자 시각 검토 대기 + 다음 단계

브라우저에서 `floorplan-modals-sketch.html` 열어 검토:
1. 3 모달 chrome 일관성 (wrapper / 헤더 / CTA / textarea / 상태색)
2. 02 inspection-unification-sketch.html + 05 RemediationDetailPage 옆에 두고 비교
3. 마커 popup statusLabel 색 (normal=safe / bad=fire / uninspected=tertiary)

**다음 quick (사용자 컨펌 후):** TSX 변환 — `redesign/06-floorplan-v2` 브랜치에서 FloorPlanPage.tsx line 1300~2160 의 3 모달 구현부에 sketch className verbatim 인용. 외부 popup (InspectionRevisitPopup / AccessBlockedPopup) 은 별도 Wave 로 분리.

## Self-Check: PASSED

- File exists: `cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html` — FOUND
- Commit exists: 5baa21a — FOUND in git log
- All 15 verify gate checks PASS
- 0 deletions in commit
- 0 untracked files after commit (worktree clean)
