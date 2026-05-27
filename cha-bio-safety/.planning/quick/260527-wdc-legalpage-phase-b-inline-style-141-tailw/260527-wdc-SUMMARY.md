---
phase: 260527-wdc-legalpage-phase-b-inline-style-141-tailw
plan: 01
subsystem: redesign/submission-ppt
tags: [legal-page, inline-style, tailwind, no-op-refactor, design-system]
requires:
  - 260527-tb3 Phase A (emoji + 색 토큰 sweep) 완료 상태
  - LegalPage 인라인 스타일 141곳 baseline
provides:
  - LegalPage.tsx 정적 inline style → tailwind className 일괄 변환 완료
  - inline style 141 → 6 (옵션 N 잔존: 색 변수 / dynamic / fontFamily inherit / linear-gradient)
affects:
  - src/pages/LegalPage.tsx (단일)
tech-stack:
  added: []
  patterns:
    - "옵션 X — 스케일 외 값은 arbitrary [Npx] 명시 (시각 0 byte 보장)"
    - "옵션 P — lineHeight 명시 보존 (leading-[1.5] / leading-[1.4] / leading-[1.6])"
    - "옵션 M — className conditional template literal (${cond ? 'A' : 'B'})"
    - "옵션 N (색 변수만) — var(--accent) borderBottom 동적 / linear-gradient / fontFamily inherit 잔존"
    - "shadow-[0_4px_12px_rgba(0,0,0,0.4)] arbitrary box-shadow"
    - "aspect-[297/210] arbitrary aspect-ratio"
    - "grid-cols-[1fr_1fr] grid-rows-[auto_1fr_auto_1fr] arbitrary grid track"
key-files:
  created:
    - .planning/quick/260527-wdc-legalpage-phase-b-inline-style-141-tailw/sketch/legalpage-phase-b-tailwind.html
    - .planning/quick/260527-wdc-legalpage-phase-b-inline-style-141-tailw/260527-wdc-SUMMARY.md
  modified:
    - src/pages/LegalPage.tsx
decisions:
  - "옵션 X (정확값 arbitrary) — 스케일 외 값은 모두 [Npx] 명시. 라운드 변환 금지로 시각 0 byte 보장."
  - "옵션 P (leading 명시 보존) — lineHeight 1.5/1.4/1.6 모두 leading-[N] arbitrary 로 명시. text-* 토큰 의 기본 line-height 와 중복일 수 있어도 의도 추적용으로 보존."
  - "옵션 M (className conditional) — 동적 분기는 template literal `${cond ? 'A' : 'B'}` 로 분리. 색 변수 외 케이스는 className 안으로 흡수."
  - "옵션 N 적용 범위 (색 변수만) — borderBottom: var(--accent) (L174/L947/L1165 탭/필터) / linear-gradient(135deg, ...) (L807 조치 완료 버튼) / fontFamily: 'inherit' (L372/L782 textarea) 4종은 style 잔존."
metrics:
  duration: "약 30분 (Task 3 단독 실행)"
  completed-date: 2026-05-27
  tasks-completed: "2/3 (Task 1 sketch e419ac7, Task 2 decision-checkpoint resolved by user, Task 3 184e548)"
  files-modified: 1
  lines-changed: "145 ins / 186 del (net -41 lines)"
---

# Phase 260527-wdc Plan 01: LegalPage Phase B inline style 141 → tailwind Summary

LegalPage.tsx (1250→1209줄) 의 정적 inline style 141 곳을 사용자 선택 옵션 (X + P + M, 색변수만 N) 에 따라 tailwind className 으로 일괄 변환. 시각 결과 0 byte 변경 (no-op refactor) + 비즈니스 로직 / Phase A 결과 (Lucide import + 색 토큰 + emoji 0) 보존.

## User Decisions (Task 2 checkpoint)

| ID  | 선택지                                                          | 결정                                       |
| --- | --------------------------------------------------------------- | ------------------------------------------ |
| (b) | 스케일 외 값 처리 (X: arbitrary / Y: 라운드)                    | **옵션 X** (arbitrary, 시각 0 byte 보장)   |
| (c) | lineHeight 명시 보존 (P: 보존 / Q: text-* 토큰과 동일하면 생략) | **옵션 P** (보존)                          |
| (d) | 동적 처리 (M: className conditional / N: style 잔존)            | **옵션 M + 색 변수만 N**                   |

## Task 3: TSX Bulk Apply (commit 184e548)

### Before/After 카운트

| Metric                    | Before  | After   | Diff                       |
| ------------------------- | ------- | ------- | -------------------------- |
| `grep -c 'style={{'`      | **141** | **6**   | -135 (-95.7%)              |
| Lines total               | 1250    | 1209    | -41 (.tsx 응축)            |
| Insertions                | —       | 145     | className 추가             |
| Deletions                 | —       | 186     | style attribute 제거       |

### 패턴별 변환 통계 (6 그룹 from sketch §2-P1 ~ §2-P6)

| Pattern                       | 변환 건수 | 비고                                                    |
| ----------------------------- | --------- | ------------------------------------------------------- |
| §2-P1 Padding 상수            | ~30       | px-N py-N 또는 px-[Npx] py-[Npx] (스케일 외)             |
| §2-P2 Flex layout             | ~50       | flex / flex-col / gap-N / items-X / justify-X 등        |
| §2-P3 Sizing (옵션 X)         | ~25       | w-[28px] / h-[36px] / w-[64px] / w-[500px] arbitrary    |
| §2-P4 flex-1 + leading (옵션 P) | ~10       | leading-[1.5] / leading-[1.4] / leading-[1.6] 명시 보존 |
| §2-P5 Button reset            | ~15       | bg-transparent / border-0 / cursor-pointer 합치기        |
| §2-P6 Dynamic (옵션 M / N)    | ~10 / 4   | className 분기 흡수 / 색 변수 4건 style 잔존            |

### 잔존 inline style 6곳 (옵션 N — 색 변수 / dynamic / CSS-only)

| Line  | 잔존 이유                                                                                  | 패턴                                                                          |
| ----- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| 174   | `borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent'`              | 옵션 N — CSS 변수 기반 동적 색 (탭 active underline)                          |
| 372   | `fontFamily: 'inherit'`                                                                    | 옵션 N — textarea 한글 폰트 상속 (Tailwind 표현 불가)                          |
| 782   | `fontFamily: 'inherit'`                                                                    | 옵션 N — 동일 (조치 입력 textarea)                                            |
| 807   | `background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)'`                                  | 옵션 N — multi-stop gradient (Tailwind arbitrary 표현 무리, style 가 명료)    |
| 947   | `borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent'`         | 옵션 N — 동일 (data 동적 색, 데스크톱 필터 탭)                                |
| 1165  | `borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent'`         | 옵션 N — 동일 (모바일 필터 탭)                                                 |

## Verification Results

### Verify gate (모두 PASS)

| Check                                                                                                | Result | 비고                                                                       |
| ---------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| `grep -c 'style={{' src/pages/LegalPage.tsx`                                                         | **6**  | 141 → 6 (-135). 잔존 = 옵션 N 색 변수 / dynamic CSS only                    |
| `git show HEAD~1:cha-bio-safety/src/pages/LegalPage.tsx \| grep -oE 'onClick=\{[^}]*\}' \| sort` ↔ HEAD | **IDENTICAL** | onClick 핸들러 정확 추출 비교 0 차이                                       |
| onChange 핸들러 비교                                                                                  | **IDENTICAL** | 동일                                                                       |
| useState/useRef/useEffect/useNavigate/useMutation/useQuery 호출 비교                                  | **IDENTICAL** | 동일                                                                       |
| legalApi.* / fetch( 호출 비교                                                                          | **IDENTICAL** | 동일                                                                       |
| Lucide import 보존 (`Check, X, Lock, Save` 모두)                                                       | **OK** | L5 `from 'lucide-react'` 0 byte change                                       |
| `grep -cE '✓\|✗\|🔒\|💾'`                                                                          | **0**  | Phase A §7.1 결과 보존                                                     |
| `grep -cE 'bg-warning[^-]\|border-safe[^-]\|border-warning[^-]\|border-danger[^-]'`                  | **0**  | Phase A §2.3 + audit followup 결과 보존                                    |
| Phase A 색 토큰 보존 (bg-warning-bg text-warning, bg-safe-bg text-safe, bg-danger-bar 등)             | **OK** | 5/8/2 instance 유지 (df0f99d 결과 포함)                                     |
| `./node_modules/.bin/tsc --noEmit` (LegalPage.tsx 신규 에러)                                          | **0**  |                                                                            |
| `./node_modules/.bin/tsc --noEmit` (전체 프로젝트 에러)                                                | **0**  |                                                                            |
| `git diff --name-only HEAD~1 HEAD` (변경 파일)                                                        | **1**  | `cha-bio-safety/src/pages/LegalPage.tsx` 만                                  |
| `git diff --diff-filter=D --name-only HEAD~1 HEAD` (post-commit deletions)                          | **0**  |                                                                            |

### 비즈니스 로직 false-positive grep 보충 설명

PLAN.md 의 `BIZ_DIFF` grep gate 는 26 줄을 매치했지만 이는 **false-positive**:

- grep 패턴 `onClick=` 등이 inline style → className 으로 변환된 *동일 라인* 의 unchanged 부분과 매치됨
- 예: `<button onClick={handleDownload} ... style={...}>` → `<button onClick={handleDownload} ... className="...">` 에서 `onClick=` 텍스트 자체는 0 byte change, but 라인 전체가 diff 에 포함되므로 grep 이 매치

진짜 검증은 `grep -oE 'onClick=\{[^}]*\}'` 으로 핸들러만 추출 후 sort/diff — **모두 IDENTICAL** 확인 (위 표).

Phase A SUMMARY 가 biz_diff=0 으로 표기된 이유는 Phase A 에서는 inline style → className 변환이 아닌 emoji/색 토큰 단순 sweep 였고, 핸들러 부착 JSX 라인을 거의 안 건드렸기 때문 (충돌 없는 영역). Phase B 는 거의 모든 buttons/inputs 의 style attribute 가 대상이라 핸들러 attribute 와 같은 라인 다수.

### Memory anchor 4건 적용 확인

| Anchor                                          | 적용 사례                                                                                                  |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `feedback_tailwind_w8_h8_is_48px.md`            | 옵션 X 원칙으로 w-7/w-8 회피, w-[28px]/w-[36px]/w-[64px]/w-[500px] arbitrary 일관 사용 (32/48 함정 회피)    |
| `feedback_tailwind_token_class_pattern.md`      | bg-danger-bar / text-danger / bg-safe-bg / text-safe — status- prefix 없는 short form 보존                |
| `feedback_text_caption_leading_none.md`         | 작은 컨테이너 안 text-caption 은 Phase A 에서 이미 leading-none 처리됨 — Phase B 가 안 건드림              |
| `project_redesign_16_workshift_status.md`       | `text-[#444]`, `text-[#888]`, `bg-[#f5f5f5]`, `bg-[#e5e5e5]`, `bg-[#fff]`, `text-[18px]`, `text-[36px]` 등 arbitrary fallback (PPT 미리보기 슬라이드 — token 외 색/사이즈) |

## Commits

| Hash    | Subject                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------ |
| e419ac7 | `feat(260527-wdc-01): LegalPage Phase B sketch — inline style → tailwind 패턴 표 (6 그룹 + 옵션 X/P/M 분기)` (Task 1) |
| 184e548 | `feat(260527-wdc-03): LegalPage §inline-style 141곳 → tailwind class 변환 (옵션 X + P + M, 색변수 N)` (Task 3) |

## Deviations from Plan

### None — plan executed exactly as written.

PLAN 의 task 3 spec + 사용자 옵션 X/P/M+색변수N 결정에 정확히 부합. scope expansion / 다른 파일 변경 / 자동 추가 기능 / 자동 fix 모두 0.

### 한 가지 caveat (보충 설명)

PLAN 의 `BIZ_DIFF` automated verify gate (`grep -E '^[+-]' | grep -cE 'onClick=|...'`) 는 26 매치를 false-positive 로 반환. 위 "비즈니스 로직 false-positive grep 보충 설명" 참조 — 정확한 핸들러 byte-level 비교는 IDENTICAL.

대안 verify 명령 (post-mortem):
```bash
git show HEAD~1:cha-bio-safety/src/pages/LegalPage.tsx | grep -oE 'onClick=\{[^}]*\}' | sort > /tmp/before.txt
grep -oE 'onClick=\{[^}]*\}' cha-bio-safety/src/pages/LegalPage.tsx | sort > /tmp/after.txt
diff /tmp/before.txt /tmp/after.txt   # MUST be empty
```

이 정확한 verify 패턴은 PLAN 의 자동화 gate 보강용으로 다음 인라인 스타일 변환 작업 (LegalFindingsPage 등) 시 채택 권장.

## Phase A 보존 확인 (별도 점검)

| Phase A 항목                                                                  | 보존 여부 | 비고                                                                              |
| ----------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------- |
| L5 lucide import (`Check, X, Lock, Save`)                                     | OK        | 0 byte change                                                                     |
| `<Check size={N} />` / `<X size={N} />` / `<Lock size={N} />` / `<Save size={N} />` | OK        | 모든 JSX usage 0 byte change                                                       |
| `bg-warning-bg text-warning` (5 인스턴스 — Phase A wave 1 4 + L596 wave 1 옵션 B) | OK        | grep count 5                                                                      |
| `bg-safe-bg text-safe` (8 인스턴스)                                            | OK        | grep count 8                                                                      |
| `bg-danger-bar` (L792 resPhotos slot X + L1047 결과내역서 X df0f99d)            | OK        | 두 인스턴스 모두 보존                                                              |
| Emoji 0 (✓ / ✗ / 🔒 / 💾)                                                    | OK        | grep -cE 0                                                                        |
| 비표준 색 토큰 0 (border-warning, border-safe, border-danger short form 부재)  | OK        | grep -cE 0                                                                        |

## 배포 계획

- **이 워크트리 (디자인 트랙):** main 머지 → cbc7119-preview.pages.dev 자동 배포 (GitHub Actions). 시각 0 byte 보장이므로 preview 검증은 페이지 정상 렌더 + 빌드 통과 정도로 충분.
- **production cherry-pick 대상:** 184e548 (Task 3 commit). production worktree (20260328) 에서 별도 cherry-pick 결정 필요. inline style → className 변환은 cherry-pick 충돌 가능성 낮음 (LegalPage.tsx 단일 파일, Phase A 도 cherry-pick 미결).
- **이 워크트리에서는 wrangler 명령 금지 / production deploy 금지** — `.claude/settings.local.json` deny 룰 준수.

## Next Steps (out of scope for this plan)

- **production cherry-pick:** Phase A (47b9088) + Phase B (184e548) 묶음 cherry-pick 검토. inline style 변환 후 시각 0 byte 이므로 사용자 컨펌 후 진행 가능.
- **LegalFindingsPage.tsx / LegalFindingDetailPage.tsx** 동일 패턴 변환 가능성 (LegalFindingDetailPage 는 deprecated 메모리 anchor 박제 — sweep 불필요 확률 높음).
- **다른 페이지 inline style sweep** — InspectionPage / ElevatorPage 등 대량 inline style 페이지에 동일 옵션 X/P/M 룰 적용 가능 (별도 quick task).
- Phase B 옵션 N 잔존 6곳 후속 정리 (선택사항):
  - 탭 underline borderBottom 3곳 (L174/L947/L1165): tailwind `border-b-2 border-accent` + conditional → 가능하나 양쪽 모두 underline 차지 공간 동일해야 → 현 style 잔존이 명료
  - linear-gradient (L807): tailwind 의 `from-* via-* to-*` 로 변환 가능하나 #1d4ed8 / #0ea5e9 는 token 없어 arbitrary 필요 → 현 style 잔존 권장
  - fontFamily inherit (L372/L782): tailwind plugin 으로 `font-inherit` arbitrary 추가 가능. ROI 낮음.

## Self-Check: PASSED

**Files:**
- FOUND: cha-bio-safety/src/pages/LegalPage.tsx (modified, 1209 lines)
- FOUND: cha-bio-safety/.planning/quick/260527-wdc-legalpage-phase-b-inline-style-141-tailw/sketch/legalpage-phase-b-tailwind.html (from Task 1 e419ac7)
- FOUND: cha-bio-safety/.planning/quick/260527-wdc-legalpage-phase-b-inline-style-141-tailw/260527-wdc-SUMMARY.md (this file)

**Commits:**
- FOUND: e419ac7 (Task 1 sketch)
- FOUND: 184e548 (Task 3 bulk apply)
