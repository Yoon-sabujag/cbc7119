---
phase: 260522-1hj
plan: 01
status: complete
type: execute
wave: 1
subsystem: redesign/17-annual-plan
tags:
  - redesign
  - 17-annual-plan
  - tsx-conversion
  - v0.1.1
  - quick
  - calibration-preserve
key-files:
  modified:
    - cha-bio-safety/src/pages/AnnualPlanPage.tsx
metrics:
  duration: ~6 minutes
  completed: 2026-05-22
  files-modified: 1
  lines-before: 225
  lines-after: 210
  net-diff: "+54 / -69"
commit: a3d81f1
dependency-graph:
  requires:
    - W1 (260521-3wn): OQ LOCKED 5건 + 13 메모리 룰
    - W2 sketch (sketch-wave-2-chrome.html): 모바일 헤더 + 데스크톱 상단 바
    - W3 sketch (sketch-wave-3-preview-calibration.html): preview + 캘리브 좌표 시스템
    - W4 sketch (sketch-wave-4-download.html): 다운로드 버튼 + 설명
    - W5 (260522-0j3): 12 섹션 TSX 변환 checklist 427 lines (SOURCE OF TRUTH)
  provides:
    - AnnualPlanPage.tsx v0.1.1 토큰 적용 완료 (in-place, atomic 1-commit)
    - 캘리브 좌표 시스템 시그니처 5건 1 byte 변경 0 보존 (15-daily-report SW3 precedent mirror)
    - Lucide ChevronLeft + Download 도입 (svg path 인라인 폐기)
  affects:
    - cbc7119-preview.pages.dev (다음 main 머지 시 GitHub Actions 자동 배포)
decisions:
  - "OQ #1 LOCKED: 다운로드 버튼 bg-safe-bar solid + linear-gradient 완전 폐기"
  - "OQ #2 LOCKED: 위치조정 토글 border-accent/bg-accent/10/text-accent (active) + bg-surface-sunken/border-border-strong/text-text-secondary (평시)"
  - "OQ #3 LOCKED: 폰트 격상 (14→16 헤더타이틀/모바일다운로드, 11→12 모바일위치조정)"
  - "OQ #4 LOCKED: lucide-react ChevronLeft + Download import 1줄 추가 + svg path 인라인 폐기"
  - "OQ #5 LOCKED: preview border 토큰 분기 (border-2 border-accent / border border-border-default) + 캘리브 칩 rgba(59,130,246,0.9) 인라인 유지"
  - "캘리브 좌표 시스템 시그니처 5건 1 byte 변경 금지 (15-daily-report SW3 precedent 동일 적용)"
---

# Quick 260522-1hj: redesign/17-annual-plan AnnualPlanPage.tsx v0.1.1 토큰 변환 Summary

**One-liner:** AnnualPlanPage.tsx 225 lines 를 in-place 단일 atomic commit 으로 v0.1.1 Tailwind className 매핑 + Lucide 아이콘 도입 + 캘리브 좌표 시스템 시그니처 5건 무손실 보존하여 변환 완료.

## 변환 결과 수치

| 항목 | 변환 전 | 변환 후 |
|---|---|---|
| 라인 수 | 225 | 210 (-15) |
| 인라인 style 토큰 (`var(--bg/bd/t1/...)`) | 9+ | 0 |
| Lucide 아이콘 | 0 | 3 (ChevronLeft 1, Download 2) |
| svg path 인라인 | 3 | 0 |
| linear-gradient | 2 | 0 |
| v0.1.1 토큰 className | 0 | 30+ (bg-surface-* / border-border-* / text-text-* / bg-safe-bar / border-accent / bg-accent/10 / text-accent / 폰트 토큰) |
| 캘리브 좌표 시스템 시그니처 (5건) | 정의됨 | **1 byte 변경 0** |
| 비즈 로직 (state/handler/effect/카피) | 정의됨 | **0 diff** |
| `generateAnnualPlan.ts` | 48 lines | **0 byte 변경** |

## 적용된 v0.1.1 토큰 className 인벤토리 (grep 카운트)

| 토큰 | 카운트 | 위치 |
|---|---|---|
| `bg-surface-page` | 2 | 데스크톱 미리보기 wrapper + 모바일 외곽 |
| `bg-surface-raised` | 1 | 모바일 헤더 |
| `bg-surface-sunken` | 5 | back button + 위치조정 토글 평시 (모바일+데스크톱) + 다운로드 disabled (모바일+데스크톱) |
| `border-border-default` | 4 | 모바일 헤더 + back button + 데스크톱 상단 바 + preview img 평시 |
| `border-border-strong` | 2 | 위치조정 토글 평시 (모바일+데스크톱) |
| `text-text-primary` | 2 | 데스크톱 설명 strong + 모바일 헤더 타이틀 |
| `text-text-secondary` | 3 | 위치조정 토글 평시 (모바일+데스크톱) + ChevronLeft |
| `text-text-tertiary` | 4 | 데스크톱 설명 + 모바일 설명 + 다운로드 disabled (모바일+데스크톱) |
| `text-text-on-accent` | 2 | 다운로드 default (모바일+데스크톱) |
| `bg-safe-bar` | 2 | 다운로드 default (모바일+데스크톱) — OQ #1 |
| `border-accent` | 3 | 위치조정 토글 active (모바일+데스크톱) + preview img 캘리브 모드 — OQ #2 + #5 |
| `bg-accent/10` | 2 | 위치조정 토글 active (모바일+데스크톱) — OQ #2 |
| `text-accent` | 2 | 위치조정 토글 active (모바일+데스크톱) — OQ #2 |
| `text-white` | 1 | 캘리브 안내 칩 — OQ #5 |
| `text-caption` | 4 | 데스크톱 설명 + 위치조정 토글 (모바일+데스크톱) + 캘리브 안내 칩 |
| `text-label` | 2 | 모바일 설명 + 데스크톱 다운로드 |
| `text-body` | 2 | 모바일 헤더 타이틀 + 모바일 다운로드 (14→16 격상) |
| `leading-none` | 5 | 작은 컨테이너 caption/label |
| `rounded-sm` | 6 | back button + 위치조정 토글 (모바일+데스크톱) + 데스크톱 다운로드 + preview img + 캘리브 칩 |
| `rounded-md` | 1 | 모바일 다운로드 (radius 10→12) |
| `w-[34px]` / `h-[34px]` | 1/1 | 모바일 back button (w-8=48 함정 회피) |

## OQ #1~#5 LOCKED 적용 결과

### OQ #1 LOCKED — 다운로드 버튼 bg-safe-bar solid (linear-gradient 폐기)

- **데스크톱 다운로드 (L130~146 → L130~140 변환)**: `className={\`text-label font-bold leading-none rounded-sm flex items-center ${loading ? 'bg-surface-sunken text-text-tertiary cursor-not-allowed' : 'bg-safe-bar text-text-on-accent cursor-pointer'}\`}`
- **모바일 다운로드 (L205~220 → L196~205 변환)**: `className={\`text-body font-bold rounded-md flex items-center justify-center ${loading ? 'bg-surface-sunken text-text-tertiary cursor-not-allowed' : 'bg-safe-bar text-text-on-accent cursor-pointer'}\`}`
- `linear-gradient(135deg,#1e40af,#3b82f6)` 2건 **완전 폐기** (grep 0 PASS)

### OQ #2 LOCKED — 위치조정 토글 토큰화

- **데스크톱 (L118~123 변환)**: `className={\`text-caption font-bold leading-none rounded-sm border ${calibMode ? 'border-accent bg-accent/10 text-accent' : 'bg-surface-sunken border-border-strong text-text-secondary'}\`}`
- **모바일 (L176~182 변환)**: 동일 토큰 (`padding:'6px 10px'` 만 차이)
- `rgba(59,130,246,0.1)` 인라인 사용 0 → `bg-accent/10` 토큰 적용

### OQ #3 LOCKED — 폰트 격상

| line (변환 후) | 원본 px | 변환 후 className | 변경 |
|---|---|---|---|
| L113 데스크톱 설명 | 12 | `text-caption leading-none text-text-tertiary` | 12 유지 |
| L114 strong | 14 | `text-text-primary font-bold` | 14 (parent text-caption inherit) |
| L121 데스크톱 위치조정 | 12 | `text-caption font-bold leading-none` | 12 유지 |
| L128 데스크톱 다운로드 | 13 | `text-label font-bold leading-none` | 13 유지 |
| L170 모바일 헤더 타이틀 | 14 | `text-body font-bold` | **14→16 격상** |
| L179 모바일 위치조정 | 11 | `text-caption font-bold leading-none` | **11→12 격상** |
| L195 모바일 설명 | 13 | `text-label leading-relaxed text-text-tertiary` | 13 유지 |
| L201 모바일 다운로드 | 14 | `text-body font-bold` | **14→16 격상** |
| L93 캘리브 안내 칩 | 12 | `text-caption font-bold leading-none` | 12 유지 |
| L83 연도 오버레이 | `'min(1.4vw, 16px)'` | **인라인 유지** | ★ 캘리브 시그니처 |

### OQ #4 LOCKED — Lucide 아이콘 교체

- **L6 신규 import 1줄**: `import { ChevronLeft, Download } from 'lucide-react'`
- **L167 모바일 back button** (was L175~177 svg path): `<ChevronLeft size={15} className="text-text-secondary" />`
- **L138 데스크톱 다운로드** (was L141~143 svg path): `<Download size={15} />`
- **L204 모바일 다운로드** (was L216~218 svg path): `<Download size={16} />`
- svg path 인라인 `M12 5v14...` / `M15 19l-7-7...` **완전 폐기** (grep 0 PASS)

### OQ #5 LOCKED — preview border 토큰 + 캘리브 칩 rgba 인라인 유지

- **L70 preview img**: `className={\`rounded-sm ${calibMode ? 'border-2 border-accent' : 'border border-border-default'}\`}` (border 분기 토큰화)
- **L91~102 캘리브 안내 칩**: `className="text-caption font-bold leading-none text-white rounded-sm"` + `style={{ position:'absolute', top:8, left:'50%', transform:'translateX(-50%)', background:'rgba(59,130,246,0.9)', padding:'6px 16px', whiteSpace:'nowrap', pointerEvents:'none' }}` — rgba 인라인 **유지** (alpha 정밀도 토큰 비용 회피)

## ★ 캘리브 좌표 시스템 시그니처 5건 1 byte 변경 0 검증 (15-daily-report SW3 precedent mirror)

| # | 시그니처 | 변환 후 line | 보존 결과 |
|---|---|---|---|
| 1 | `STORAGE_KEY = 'annual_plan_year_pos'` | L8 | **1 byte 변경 0** (따옴표/공백/값 모두 동일) |
| 2 | `FINGER_OFFSET = 60` | L9 | **1 byte 변경 0** (값 60 그대로) |
| 3 | `loadPos()` helper (try/catch JSON.parse fallback null) | L11~13 | **1 byte 변경 0** (함수 본문 그대로) |
| 4 | `handleImageClick` 좌표 계산식 | L36~46 | **1 byte 변경 0** (getBoundingClientRect / % 계산 / setYearPos / localStorage / setCalibMode / toast 모두 그대로) |
| 5 | `handleImageTouch` FINGER_OFFSET 보정식 | L48~60 | **1 byte 변경 0** (e.preventDefault / touch.clientY - FINGER_OFFSET 보정 / 동일 흐름) |
| 6 | yearPos overlay inline style | L78~89 | **1 byte 변경 0** (position/top/left/transform/fontSize='min(1.4vw, 16px)'/fontWeight=700/color='#000'/fontFamily='Malgun Gothic, 맑은 고딕, sans-serif'/pointerEvents='none') |

추가 확인된 grep gate:
- `STORAGE_KEY = 'annual_plan_year_pos'` 1건
- `FINGER_OFFSET = 60` 1건 (정의), `FINGER_OFFSET` 총 2건 (정의 + 사용)
- `loadPos` 2건 (정의 + useState 초기값)
- `handleImageClick` 2건 (정의 + onClick 바인딩)
- `handleImageTouch` 2건 (정의 + onTouchStart 바인딩)
- `'min(1.4vw, 16px)'` 1건
- `'Malgun Gothic, 맑은 고딕, sans-serif'` 1건
- `/templates/preview/annual-plan.png` 1건
- `rgba(59,130,246,0.9)` 1건 (캘리브 안내 칩, OQ #5)

## Verify 결과 (verify automated 출력 요약)

### Negative gate 9/9 PASS

```
neg1 (emoji=0) PASS                  — ★ 메타 마커 제거 후 0
neg2 (no linear-gradient) PASS       — 2건 완전 폐기 (OQ #1)
neg3 (no 9/10/11 fontSize) PASS      — 모두 토큰 격상 (OQ #3)
neg4 (no status- prefix) PASS        — tailwind token pattern 룰 준수
neg5 (no w-8/h-8) PASS               — w-[34px] arbitrary 사용 (w-8=48 함정 회피)
neg6 (no old alias) PASS             — var(--bg/bd/t1/...) 0건
neg7 (no Download svg path) PASS     — OQ #4 Lucide 교체
neg8 (no ChevronLeft svg path) PASS  — OQ #4 Lucide 교체
neg9 (no text-danger) PASS           — danger 토큰 미사용
```

### Positive gate 22/22 PASS

```
pos1  v0.1.1 tokens ≥3      PASS
pos2  bg-surface-raised ≥1  PASS  (1)
pos3  bg-surface-sunken ≥3  PASS  (5)
pos4  border-border-default ≥3  PASS  (4)
pos5  border-border-strong ≥2  PASS  (2)
pos6  bg-safe-bar ≥2        PASS  (2)
pos7  text-text-on-accent ≥2 PASS (2)
pos8  border-accent ≥2      PASS  (3)
pos9  bg-accent/10 ≥2       PASS  (2)
pos10 text-accent ≥2        PASS  (2)
pos11 w-[34px] ≥1           PASS
pos12 h-[34px] ≥1           PASS
pos13 ChevronLeft ≥2        PASS  (2: import + 사용)
pos14 Download ≥3           PASS  (6: import + 사용 2 + 메타)
pos15 lucide-react import ≥1 PASS
pos16 text-caption ≥4       PASS  (4)
pos17 text-label ≥2         PASS  (2)
pos18 text-body ≥2          PASS  (2)
pos19 rounded-sm ≥4         PASS  (6)
pos20 rounded-md ≥1         PASS
pos21 leading-none ≥3       PASS  (5)
pos22 text-white ≥1         PASS
```

### Calibration signature 10/10 PASS

```
calib1  STORAGE_KEY                      PASS
calib2  FINGER_OFFSET = 60 (정의)         PASS
calib3  FINGER_OFFSET ≥2 (정의+사용)      PASS  (2)
calib4  loadPos                          PASS
calib5  handleImageClick                 PASS
calib6  handleImageTouch                 PASS
calib7  'min(1.4vw, 16px)'               PASS
calib8  Malgun Gothic                    PASS
calib9  /templates/preview/annual-plan.png PASS
calib10 rgba(59,130,246,0.9)             PASS
```

### Biz preserve 19/19 PASS

```
biz1  useIsDesktop                   PASS
biz2  generateAnnualPlan import      PASS
biz3  navigate(-1)                   PASS
biz4  setCalibMode ≥4 (토글+click+touch) PASS (5)
biz5  setYearPos ≥2 (click+touch)    PASS (3)
biz6  setLoading ≥2                  PASS (3)
biz7  '연간 업무 추진 계획' ≥2         PASS (2)
biz8  '엑셀 다운로드' ≥2 (모+데)        PASS (2)
biz9  '생성 중' ≥2 (모+데)             PASS (2)
biz10 toast success 다운로드          PASS
biz11 '연도 위치 저장됨' ≥2 (click+touch) PASS (2)
biz12 '연도가 들어갈 위치를 클릭하세요' PASS
biz13 '위치 조정'                    PASS
biz14 '취소'                         PASS
biz15 '대상 연도'                    PASS
biz16 '표지 및 일정표 연도가' ≥2 (모+데) PASS (2)
biz17 nextYear ≥3                    PASS (4)
biz18 imgRef ≥2 (정의+사용)           PASS (2)
biz19 onTouchStart={handleImageTouch} PASS
```

### Utils preserve + Scope + Build

```
utils1 generateAnnualPlan.ts 0 diff   PASS  (git diff 0 lines)
scope  no extra files                 PASS  (단일 파일 + PLAN.md/SUMMARY.md)
lc     210 lines (225 ± 30)           PASS
```

## Build 결과

```
npm run build  exit 0 (15.45s tsc + Vite + sw.ts + PWA precache)
- AnnualPlanPage chunk: dist/assets/AnnualPlanPage-Ceb4q6zk.js (6,496 bytes ≈ 6.5 KB)
- tsc --noEmit: 0 errors
- PWA precache: 82 entries (7889.62 KiB)
```

## Atomic commit

**Commit hash:** `a3d81f1`

**Commit message:**
```
feat(17-annual-plan): TSX 변환 — AnnualPlanPage v0.1.1 토큰 적용
                      (W5 checklist + OQ 5건 LOCKED + 캘리브 시그니처 보존)
```

**File stat:** `1 file changed, 54 insertions(+), 69 deletions(-)`

**Scope:** `cha-bio-safety/src/pages/AnnualPlanPage.tsx` 단일 (generateAnnualPlan.ts / App.tsx / tailwind.config.js / tokens.css / functions / migrations / public / templates 모두 무영향).

## Deviations from Plan

### 사소한 자체 조정 1건

**1. [Rule 2 - Missing critical] yearPos overlay 주석에서 `★` 글리프 제거**

- **Found during:** Task 1 negative gate 1차 verify
- **Issue:** 주석 `{/* 연도 오버레이 — ★ 캘리브 좌표 시스템 시그니처 ... */}` 의 `★` (U+2605) 가 negative gate neg1 의 emoji 감지 범위 (`\x{2600}-\x{26FF}` Miscellaneous Symbols block) 에 매칭되어 FAIL.
- **Fix:** `★` 글리프 단순 제거 (`— 캘리브 좌표 시스템 시그니처 (1 byte 변경 금지)` 로 변경). W5 checklist 본문은 `★` 를 메타 마커로 사용하지만, 실제 TSX 코드에서는 16-workshift / 15-daily-report 변환 결과에도 `★` 글리프 0건 — 본 패턴 mirror.
- **Files modified:** AnnualPlanPage.tsx L77 주석 (1 byte 텍스트 변경, 코드 로직 영향 0)
- **Impact on biz:** 0 — 주석 메타 텍스트 변경, runtime 영향 0.
- **Commit:** a3d81f1 (단일 atomic 안에 포함)

### 그 외 deviation

없음 — PLAN.md `<tasks>` Task 1 의 W5 §3.1~§3.4 매핑 표를 verbatim 적용.

## 자체 검수 (Self-Check)

**1. Created files exist:**
- `cha-bio-safety/src/pages/AnnualPlanPage.tsx`: **FOUND** (210 lines)
- `.planning/quick/260522-1hj-redesign-17-annual-plan-tsx-annualplanpa/260522-1hj-SUMMARY.md`: **FOUND** (이 파일)

**2. Commit exists:**
- `a3d81f1`: **FOUND** (git log --oneline -3 확인됨)

**3. Build:** `cd cha-bio-safety && npm run build` exit 0 (AnnualPlanPage chunk 6.5 KB)

**4. Verify gates:**
- Negative 9/9 PASS, Positive 22/22 PASS, Calibration 10/10 PASS, Biz 19/19 PASS
- generateAnnualPlan.ts 0 byte diff PASS
- Scope: 단일 파일 + SUMMARY/PLAN PASS

## Self-Check: PASSED

## 다음 단계

1. **사용자 시각 검수** — cbc7119-preview 자동 배포 (main 머지 후 GitHub Actions)
2. **사용자 컨펌 후 main 머지** (메모리 룰 `feedback_deploy_test` — design 작업은 사용자 명시 컨펌 후만)
3. **redesign/17-annual-plan 완결 status 메모리 박제** (project_redesign_17_annual_plan_status — `redesign/13-schedule` / `redesign/15-daily-report` / `redesign/16-workshift` 패턴 mirror)
4. **직원 도메인 (cbc7119) 배포는 별도 worktree (20260328) 담당** — 이 워크트리는 절대 다루지 않음 (CLAUDE.local.md)

### 검수 시각 가이드 (cbc7119-preview 배포 후)

- **모바일 viewport (375×812)**: 헤더 — `bg-surface-raised` + back button `w-[34px] h-[34px] bg-surface-sunken border` + `ChevronLeft size={15}` + 타이틀 `text-body font-bold` (14→16 격상) + 위치조정 토글
- **데스크톱 viewport (≥768)**: 상단 바 — `border-b border-border-default` + 설명 `text-caption text-text-tertiary` + `<strong text-text-primary>` + 위치조정 토글 + 다운로드 `bg-safe-bar text-text-on-accent text-label font-bold` + `Download size={15}`
- **다운로드 버튼 default**: `bg-safe-bar` solid 파랑 + `text-text-on-accent` 흰 글자 — **그라데이션 0건**
- **다운로드 버튼 loading**: `bg-surface-sunken text-text-tertiary cursor-not-allowed` 회색 disabled
- **위치조정 토글 평시**: `bg-surface-sunken border-border-strong text-text-secondary` 톤다운
- **위치조정 토글 active**: `border-accent bg-accent/10 text-accent` 파랑 강조
- **preview img 평시**: `border border-border-default`
- **preview img 캘리브 모드**: `border-2 border-accent` 파랑 강조
- **캘리브 안내 칩**: `text-white text-caption font-bold` + 인라인 `rgba(59,130,246,0.9)` 파랑 배경 (alpha 0.9)
- **캘리브 좌표 시스템 동작**:
  - 모바일 터치 → `FINGER_OFFSET=60` y 보정 정상 (손가락 가리는 영역 회피)
  - 클릭 위치에 `nextYear` (2027) 오버레이 `min(1.4vw, 16px)` + Malgun Gothic 폰트로 정확히 표시
  - 새로고침 후 `localStorage['annual_plan_year_pos']` 좌표 복원

## 참조

- PLAN: `.planning/quick/260522-1hj-redesign-17-annual-plan-tsx-annualplanpa/260522-1hj-PLAN.md` (714 lines)
- W5 SOURCE OF TRUTH: `cha-bio-safety/docs/redesign-context/17-annual-plan/wave-5-tsx-conversion-checklist.md` (427 lines)
- W1 OQ LOCKED: `cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md`
- 변환 대상: `cha-bio-safety/src/pages/AnnualPlanPage.tsx` (225 → 210 lines)
- precedent: 15-daily-report SW3 (캘리브 좌표 시스템 보존), 16-workshift SW1~SW4, 27-login (atomic 1-commit TSX 변환)
