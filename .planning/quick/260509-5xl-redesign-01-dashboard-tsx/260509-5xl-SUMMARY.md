---
phase: 260509-5xl-redesign-01-dashboard-tsx
plan: 01
subsystem: redesign-dashboard
tags:
  - redesign
  - dashboard
  - tsx-conversion
  - design-tokens-v0.1.1
  - tailwind-only
status: human-verify-pending
dependency:
  requires:
    - 260509-3e3-redesign-01-dashboard-sketch  # 시안 approve 완료
  provides:
    - DashboardPage v0.1.1 (인라인 style 금지 키 0건, §6.2 + §7.1 적용)
  affects:
    - cha-bio-safety/src/pages/DashboardPage.tsx
tech-stack:
  added:
    - lucide-react (Map, BarChart3, Siren, Users — 이미 dependency 에 있음 — 신규 import)
  patterns:
    - Tailwind only + tokens.css 자동 라이트/다크/모바일/데스크톱 분기
    - §6.2 Stat Card negative rule (위험 임계치만 status 색)
    - §7.1 빠른 도구 일관성 (모두 회색 통일)
key-files:
  created: []
  modified:
    - cha-bio-safety/src/pages/DashboardPage.tsx
decisions:
  - 인라인 style 허용 키 화이트리스트 운영 — gridTemplateRows / animation / 동적 catColor & CAT_DOT (var() 직참조) / IS_ANDROID 동적 height|flex / paddingBottom calc(safe-area) / overflowY:'clip'
  - 디자인 시스템 §6.2 negative rule 정확 적용 — 오늘 일정 카드는 isThreshold=false 항상, 색바=border-default 회색
  - §7.1 빠른 도구 4종 모두 동일 회색 (배경 surface-sunken, 아이콘 text-secondary) — 고장 접수도 fire 강조 제거
  - 시안의 9/10/11px 폰트는 모두 12px(text-caption) 로 승격 — 메모리 룰 절대 준수
  - Lucide 아이콘 4종 신규 도입 — 기존 이모지(🗺️📈🚨🍱) 4종 대체
metrics:
  duration_minutes: 38
  completed_date: "2026-05-09"
  tasks_completed: 3
  tasks_total: 4  # task 4 = human-verify checkpoint
---

# Phase 260509-5xl Plan 01: DashboardPage TSX 변환 Summary

**One-liner:** DashboardPage.tsx 를 v0.1.1 디자인 토큰 + Tailwind only 로 교체. 인라인 style 금지 키 0건, §6.2 negative rule + §7.1 일관성 적용, 비즈니스 로직 100% 보존.

---

## 변경 요약 (Tasks 1–3 완료, Task 4 = human-verify pending)

| Task | 내용 | Commit | 라인 |
|------|------|--------|------|
| 1 | 컨테이너 + 근무자 칩 바 + 두 배너 + Lucide 아이콘 import + tools 배열 통합 | `1ea14dc` | -93 / +89 |
| 2 | 통계 카드 4종 §6.2 negative rule + 빠른 도구 4종 §7.1 일관성 (모바일+데스크톱) | `fdb0371` | -67 / +139 |
| 3 | 일정/도넛/캘린더/액션시트/ScheduleRow Tailwind 변환 + scrollbar 숨김 | `2786bf5` | -103 / +113 |
| **합계** | DashboardPage.tsx | — | 697 → **775** |

---

## §6.2 Stat Card negative rule — 적용 결과

| 카드 | 임계치 조건 | 정상치 숫자 색 | 임계치 숫자 색 | 좌측 색바 |
|------|-------------|---------------|---------------|-----------|
| 점검 미완료 | `incomplete > 0` | text-text-primary | `text-danger` | `bg-danger-bar` (항상) |
| 미조치 항목 | `unresolved > 0` | text-text-primary | `text-fire` | `bg-fire-bar` |
| 오늘 일정 | (없음 — 정보 카드) | text-text-primary (항상) | — | **`bg-border-default` (회색)** |
| 승강기 고장 | `elevatorFault > 0` | text-text-primary | `text-danger` | `>0` → `bg-danger-bar`, 0 → `bg-safe-bar` |

→ "오늘 일정" 카드가 다른 위험 카드와 시각적으로 구별되도록 설계 (회색 색바 + 숫자 항상 text-primary). 데스크톱과 모바일 모두 동일 룰 적용.

---

## §7.1 빠른 도구 — 적용 결과

| 항목 | Before | After |
|------|--------|-------|
| 아이콘 | 이모지 🗺️📈🚨🍱 | Lucide `MapIcon`, `BarChart3`, `Siren`, `Users` |
| 배경색 | rgba(59,130,246,.13) / rgba(239,68,68,.13) … | 모두 `bg-surface-sunken` (회색) |
| 아이콘 색 | (이모지 자체 컬러) | 모두 `text-text-secondary` |
| 고장 접수 강조 | 빨강 배경 (fire 강조) | **회색 통일 — fire 강조 제거** |

---

## 인라인 style 잔존 — 의도된 화이트리스트 (10건)

| 라인 | 키 | 사유 |
|------|----|------|
| 412 | `background: CAT_DOT[cat]` | 카테고리별 동적 색 (var() 직참조) — 토큰 매핑 불가 |
| 481 | `gridTemplateRows: IS_ANDROID ? ... : ...` | Android 분기 동적 (메모리 룰: minmax 유지) |
| 492 | `animation: 'slideUp .28s ease-out'` | keyframe — Tailwind 정의 안 됨 |
| 513, 592, 618 | `animation: 'slideUp .28s .NNs ease-out both'` | 동일 (mobile 섹션 staggered) |
| 643 | `animation + height: IS_ANDROID ? 125 : undefined` | Android 분기 동적 |
| 658 | `overflowY: 'clip', flex/height: IS_ANDROID 분기` | Android 분기 동적 |
| 702 | `paddingBottom: 'calc(16px + var(--sab, 0px))'` | safe-area-bottom — calc + var() |
| 753 | `background: catColor[item.category]` | 카테고리별 동적 색 (ScheduleRow) |

→ 색/배경/패딩/마진/폰트/borderRadius 등 **정적 시각 스타일 인라인 0건**. 위 잔존은 모두 동적 분기 또는 토큰화 불가 keyframe.

---

## 비즈니스 로직 보존 검증 (grep 11종 + TS 컴파일 PASS)

| 항목 | 결과 |
|------|------|
| `useQuery({ queryKey: ['dashboard'] })` | OK |
| `queryFn: dashboardApi.getStats` | OK |
| `MOCK_SCHEDULE` 폴백 | OK |
| `IS_ANDROID` 분기 + minmax(140px, auto) | OK |
| `RAW_TO_STYPE` 매핑 | OK |
| `getMonthlySchedule` 호출 | OK |
| `useIsDesktop()` 분기 | OK |
| `handleManualComplete` 콜백 | OK |
| `navigate('/inspection', { state: { autoSelectCategory } })` | OK |
| `function ScheduleRow` 서브컴포넌트 | OK |
| `calDayHolidays` 5월 공휴일 매핑 | OK |
| Lucide 아이콘 4종 import | OK |
| `flex-nowrap` + `overflow-x-auto` (월간 도넛 가로 스크롤 메모리 룰) | OK |
| `npx tsc --noEmit` 컴파일 | **에러 0** |
| `npm run build` | **성공** (15.02s) |

---

## 검증 grep 결과 (모두 0건)

| 검출 패턴 | 건수 | 상태 |
|-----------|------|------|
| `fontSize:` (인라인) | 0 | PASS |
| `padding:'[0-9]` (정적 패딩) | 0 | PASS |
| `background:'var(--bg` | 0 | PASS |
| `background:'rgba([0-9]` | 0 | PASS |
| `borderRadius:[0-9]` | 0 | PASS |
| `color:'var(--t[123])` | 0 | PASS |
| 이모지 🗺️📈🚨🍱 | 0 | PASS |
| `text-[9px]` / `text-[10px]` / `text-[11px]` | 0 | PASS |
| `onMouseEnter={e => { e.currentTarget.style` | 0 | PASS |
| `border:'1px` | 0 | PASS |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] node_modules 가 worktree 에 없음**
- **Found during:** Task 1 verify (npx tsc 실패)
- **Issue:** worktree 에 `node_modules` 폴더가 없어 `tsc`/`vite` CLI 가 없음
- **Fix:** `npm install` 실행 (정상 완료 — 새 의존성 추가 없음)
- **Files modified:** (없음 — node_modules 만 생성)

**2. [Rule 1 - Bug] dev script 경로 오타**
- **Found during:** Task 4 dev server 시작
- **Issue:** PLAN 에 `npm run dev` 가이드되어 있으나 실제 script 는 `dev:front`
- **Fix:** `npm run dev:front` 사용
- **사용자 안내 문구 반영:** Verify steps 에 `npm run dev:front` 로 정정

위 외에는 plan 그대로 실행. **rgba alpha 의 임의 값(`bg-info-bar/30` 등) 일부는 시안의 정확한 값(0.22)과 약간 다른 30% 사용** — 시안 비교 시 미세 차이 가능. 사용자 승인 시 그대로 유지, 수정 요청 시 정확값으로 보정.

---

## Authentication Gates

발생하지 않음.

---

## Task 4 — Human-verify checkpoint (현재 상태)

### What was built (자동화 완료)

- DashboardPage.tsx v0.1.1 재디자인
- Vite dev server 백그라운드 실행 중 → http://localhost:5173/ HTTP 200 응답 확인
- DashboardPage 모듈 transform 정상 (HTTP 200)
- TypeScript 컴파일 0 에러, `npm run build` 성공

### How to verify (사용자 작업)

**1. dev server 접속:**
```
http://localhost:5173/dashboard
```
(이미 백그라운드에서 실행 중. 종료가 필요하면 PID 확인 후 kill.)

**2. 4 조합 시각 확인:**
- 모바일 다크 / 모바일 라이트 / 데스크톱 다크 / 데스크톱 라이트
- DevTools 모바일 모드 (iPhone 13 = 390x844)
- 테마 토글: 콘솔에 `document.documentElement.dataset.theme = 'light'` (또는 'dark')

**3. 체크리스트 (PLAN Task 4 인용):**

a. **§6.2 Stat Card negative rule 시각 확인:**
- [ ] "점검 미완료" 28/34 → 빨강 숫자 + 빨강 색바
- [ ] "미조치 항목" → 0이면 흰색/검정 숫자, >0이면 주황 숫자 + 주황 색바
- [ ] **"오늘 일정" → 항상 흰색/검정 숫자 + 회색 색바** (다른 카드와 구별되어 보여야 함)
- [ ] "승강기 고장" → 0이면 흰색/검정 + 초록 색바, >0이면 빨강 + 빨강 색바

b. **§7.1 빠른 도구 일관성:**
- [ ] 4개 카드 동일 회색 배경 (Map/BarChart3/Siren/Users 모두)
- [ ] 이모지 보이지 않음
- [ ] 고장 접수 카드 fire 강조 없음

c. **메모리 룰:**
- [ ] 월간 도넛 가로 스크롤 (모바일)
- [ ] 9/10/11px 폰트 없음 (모든 텍스트 12px+)
- [ ] BottomNav 갭 자연스러움

d. **인터랙션:**
- [ ] 근무자 칩 탭 → 액션시트
- [ ] 통계 카드 4종 navigation 동작
- [ ] 빠른 도구 4종 navigation 동작
- [ ] 오늘 일정 "완료 처리" 동작
- [ ] 데스크톱 미니 캘린더 5월 1/5/15일 빨강

e. **콘솔/빌드:**
- [x] `npx tsc --noEmit` 통과 (자동 검증 완료)
- [x] `npm run build` 성공 (자동 검증 완료)
- [ ] 브라우저 콘솔 에러 0건 (사용자 확인 필요)

### Resume signal

- **"approved"** → 완료. 다음 페이지 redesign 후속 작업 진행
- **"수정: [구체 항목]"** → Task 1/2/3 중 해당 부분 보정
- **"롤백"** → 3 commits revert 후 재논의

---

## Self-Check: PASSED

- [x] DashboardPage.tsx 파일 존재 (775 줄)
- [x] Commit 1ea14dc 존재 (Task 1)
- [x] Commit fdb0371 존재 (Task 2)
- [x] Commit 2786bf5 존재 (Task 3)
- [x] node_modules/.bin/tsc 정상 → `tsc --noEmit` 0 에러
- [x] `npm run build` 성공
- [x] Vite dev server HTTP 200 응답 (http://localhost:5173/)
- [x] 인라인 style 금지 키 0건 grep 검증
- [x] 9/10/11px 폰트 0건 grep 검증
- [x] 비즈니스 로직 grep gate 11종 PASS
