---
quick_id: 260526-ucq
phase: quick
plan: 01
type: execute
wave: 1
status: complete
completed_at: 2026-05-26
duration_minutes: 6
tasks_completed: 1
files_created:
  - cha-bio-safety/docs/redesign-context/30-not-found/sketch.html
files_modified: []
commits:
  - hash: 78dca20
    message: "feat(quick-260526-ucq): redesign/30-not-found W1 sketch.html 단일 변형 작성"
requirements_completed:
  - REDESIGN-30-W1
tags:
  - redesign
  - 30-not-found
  - sketch
  - design-system-v0.1.1
key_decisions:
  - 평면 폴더 단일 sketch.html (10-cctv-info precedent mirror, sketch/ 서브폴더 생성 0)
  - 404 색 var(--text-tertiary) 정보 없음 의미 (status-danger 금지)
  - alias 처리 옵션 A/B/C 박제만, 선택은 W2 사용자 컨펌 단계로 위임
  - Pretendard CDN 1건만 외부 리소스, 그 외 모든 토큰 인라인 :root + [data-theme="light"]
---

# Phase Quick Plan 260526-ucq: redesign/30-not-found W1 sketch (NotFoundPage) Summary

> **One-liner.** NotFoundPage.tsx (11 라인 wildcard route `*`) 의 W1 디자인 시안 1 파일을 평면 폴더 (`cha-bio-safety/docs/redesign-context/30-not-found/sketch.html`) 에 작성 — 다크 + 라이트 2 변형, design-system v0.1.1 토큰 인라인, 비즈 anchor 5건 박제, 1 byte 변경 0 보존 룰 통과.

## Outcome

- 작성 산출물: `cha-bio-safety/docs/redesign-context/30-not-found/sketch.html` (423 라인, 신규 1 파일)
- 평면 폴더 룰 통과 — `sketch/` 서브폴더 생성 0 (28-splash/23-education/27-login/16-workshift 평면 패턴 mirror)
- W1 인덱스 markdown / W5 checklist markdown 작성 생략 (페이지 단순성으로 사용자 명시 지시, 10-cctv-info precedent mirror)
- 사용자 컨펌 후 W2 (TSX 변환) quick task 로 진입 가능한 상태 도달

## Sketch 작성 결과

### 라인 수 / 변형 시연 증거

- 총 423 라인 단일 HTML 파일
- 다크 변형 (`:root` 기본) 1건 + 라이트 변형 (`data-theme="light"` attribute) 1건 — `data-theme="light"` 등장 3회
- 모바일 폭 480 컨테이너 시뮬레이션 (`.frame-mobile { width: 480px; min-height: 720px; }`)
- 외부 리소스 1건만 = Pretendard CDN (`typography.css` line 11 mirror), 그 외 모든 토큰 / 스타일은 단일 HTML 안 `<style>` 블록 인라인

### Verify gate grep 결과 (plan 12건 + git diff 6건 모두 PASS)

| # | Check | Result |
|---|-------|--------|
| 1 | `test -f sketch.html` | PASS |
| 2 | `404` count ≥ 3 | 13 |
| 3 | `페이지를 찾을 수 없습니다` count ≥ 2 | 4 |
| 4 | `대시보드로 이동` count ≥ 2 | 4 |
| 5 | `design-system` count ≥ 1 | 7 |
| 6 | `useNavigate` count ≥ 1 | 4 |
| 7 | `/dashboard` count ≥ 1 | 7 |
| 8 | `data-theme="light"` count ≥ 1 | 3 |
| 9 | `var(--accent` count ≥ 1 | 8 |
| 10 | `var(--text-tertiary)` count ≥ 1 | 8 |
| 11 | `status-danger\|status-fire` (negation OR 0건) | 2 (모두 negative gate / 디자인 결정 요약 안 "사용 금지" negation 문구) |
| 12 | `9\|10\|11 px fontSize` 0건 | 0 |
| 13 | `sketch/` 서브폴더 미존재 | OK |
| 14 | `NotFoundPage.tsx` 1 byte 변경 0 | PASS (`git diff --quiet`) |
| 15 | `App.tsx` 1 byte 변경 0 | PASS |
| 16 | `tokens.css` 1 byte 변경 0 | PASS |
| 17 | `typography.css` 1 byte 변경 0 | PASS |
| 18 | `design-system.md` 1 byte 변경 0 | PASS |
| 19 | `30-not-found.md` 1 byte 변경 0 | PASS |

#11 의 2건 등장 위치:
- 헤더 주석 안 Negative gate 박제 (line 45 — `- status-danger / status-fire 색 사용 0건 (404 는 에러가 아니라 정보 없음)`)
- 디자인 결정 요약 안 "404 색 결정" 항목 (line 373 — `<code>status-danger</code> 색 사용 금지: 404 는 에러가 아니라 정보 없음 성격이며, design-system §1.4 상태 색 의미 우선 룰을 따른다.`)
- 모두 "사용 금지 명시 negation" 문맥 — plan §1 verify gate #11 의 OR 절을 만족 (실제 색 사용 0건, negation 문맥 only)

## 사용된 토큰 매핑 결정

| Anchor | 현재 NotFoundPage.tsx (alias) | sketch 시연 토큰 (v0.1.1) | 비고 |
|---|---|---|---|
| 페이지 배경 | `var(--bg)` | `var(--surface-page)` | 다크 #0a0d12 / 라이트 #ffffff |
| 본문 색 | `var(--t1)` | `var(--text-primary)` | 다크 #e6edf3 / 라이트 #1f2328 |
| 404 큰 텍스트 색 | `var(--bg4)` (surface-active) | `var(--text-tertiary)` | 정보 없음 의미. **status-danger 금지** (404 는 에러 아님) |
| 버튼 배경 | `#2563eb` raw hex | `var(--accent-active)` | 다크 #2563eb / 라이트 #0a52c4 |
| 버튼 텍스트 | `#fff` raw | `var(--text-on-accent)` | 양 모드 #ffffff |
| gap | `16` 인라인 | `var(--space-4)` | 16 |
| borderRadius | `12` 인라인 | `var(--radius-md)` | 12 |
| 버튼 height (없음) | `padding:'12px 28px'` | `var(--button-height)` | 44 모바일 |

### 폰트 결정 (노안 룰 준수)

- 404: 96px / weight 900 / lineHeight 1.0 — text-display (28px) 초과 인라인 허용, 30-not-found.md §4 권장 패턴
- 안내 문구: 18px / weight 600 (text-title) — 본문 마지노선 16px 초과 ✓
- 버튼: 16px / weight 700 (text-body) — 본문 마지노선 16px 초과 ✓
- 9 / 10 / 11 px fontSize 0건 (verify gate #12 통과)

### Spacing / Radius / 모바일·데스크톱

- gap `var(--space-4)` = 16
- borderRadius (버튼) `var(--radius-md)` = 12
- borderRadius (frame mock) `var(--radius-lg)` = 16
- 모바일/데스크톱 폰트 동일, spacing 동일 — 정적 컨테이너 센터링이라 분기 불필요
- 컨테이너 max-width 480 (모바일 시뮬레이션). 데스크톱도 동일 센터링 (페이지 단순성)

## 비즈 anchor 5건 sketch 안 등장 위치

| # | Anchor | 캡션 | 비즈 anchor 박스 | 디자인 결정 요약 | 헤더 주석 |
|---|--------|-----|-----------------|-----------------|-----------|
| 1 | `useNavigate()` hook (line 1, 3) | 캡션 다크 + 캡션 라이트 2회 | `<li>` 1항목 | (간접) | line 16 |
| 2 | `navigate('/dashboard')` (line 8) | 캡션 다크 + 캡션 라이트 2회 | `<li>` 2항목 | (간접) | line 17 |
| 3 | "404" 텍스트 (line 6) | frame 안 `<p class="not-found-display">` 2회 | `<li>` 3항목 | (간접) | line 18 |
| 4 | "페이지를 찾을 수 없습니다" (line 7) | frame 안 `<p class="not-found-message">` 2회 | `<li>` 4항목 | (간접) | line 19 |
| 5 | "대시보드로 이동" 버튼 카피 (line 8) | frame 안 `<button>` 2회 | `<li>` 5항목 | (간접) | line 20 |

총 grep 등장 횟수 (verify gate 통과 증거):
- `useNavigate` × 4 / `/dashboard` × 7 / `404` × 13 / `페이지를 찾을 수 없습니다` × 4 / `대시보드로 이동` × 4

## W2 진입 조건 (사용자 컨펌 대기)

### 다음 wave (260526-ucq+1 / quick: redesign/30-not-found W2 TSX 변환) 진입 조건

1. 사용자가 `sketch.html` 을 브라우저에서 열어 다크 + 라이트 2 변형 시각 컨펌
2. **alias 처리 옵션 A/B/C 중 선택** (W2 plan 작성 시 사용자 명시 입력):
   - **A. 풀-마이그레이션** — `var(--bg)` → `var(--surface-page)`, `var(--t1)` → `var(--text-primary)`, `var(--bg4)` → `var(--text-tertiary)` 모두 새 semantic 으로 교체. 가장 깨끗하지만 기존 alias 의존성 확인 필요
   - **B. alias 유지** — `var(--bg)` / `var(--t1)` / `var(--bg4)` 그대로 유지. 변경 최소화. 버튼 raw hex 도 그대로
   - **C. 하이브리드** — 배경/텍스트 alias 유지 + 버튼 raw hex (`#2563eb` / `#fff`) 만 `var(--accent-active)` / `var(--text-on-accent)` 교체. 중간 절충안

### W2 변환 wave 가 의식할 룰 (sketch §4 Negative gate)

- 9 / 10 / 11 px fontSize 0건 (노안 마지노선 16 룰)
- status-danger / status-fire 색 사용 0건 (404 는 에러가 아니라 정보 없음)
- 이모지 0건 (feedback_tsx_wave_emoji_dot_gap.md)
- linear-gradient 0건 (28-splash OQ #2 LOCKED 패턴 mirror — 단색 solid 만)
- `style={...}` 인라인 → W2 TSX 에서 Tailwind class 로 교체 (30-not-found.md §4 요구사항)

## 1 byte 변경 0 보존 증거

| 파일 | `git diff --quiet` 결과 |
|---|---|
| `cha-bio-safety/src/pages/NotFoundPage.tsx` | PASS |
| `cha-bio-safety/src/App.tsx` | PASS |
| `cha-bio-safety/docs/redesign-context/30-not-found/tokens.css` | PASS |
| `cha-bio-safety/docs/redesign-context/30-not-found/typography.css` | PASS |
| `cha-bio-safety/docs/redesign-context/30-not-found/design-system.md` | PASS |
| `cha-bio-safety/docs/redesign-context/30-not-found/30-not-found.md` | PASS |

본 wave 의 git diff 는 단 1 파일 (sketch.html 신규) — 보존 룰 절대 통과.

## Deviations from Plan

None — plan 을 verbatim 그대로 따랐다.

- 평면 폴더 룰 강제 — `sketch/` 서브폴더 생성 0
- W1 인덱스 / W5 checklist markdown 생략 (플랜 명시 지시)
- Pretendard CDN 1건 외 외부 리소스 0
- 토큰 인라인 정의 (10-cctv-info precedent 패턴 mirror)
- 다크 + 라이트 2 변형 시연 (`data-theme="light"` attribute 분기)
- 비즈 anchor 5건 박스 + 캡션 + 헤더 주석 3중 박제
- alias 처리 옵션 A/B/C 디자인 결정 요약 박스 안 박제 (W2 컨펌 단계 위임)

## CLAUDE.local.md / CLAUDE.md 준수

- 디자인 워크트리 (cbc7119-design) 룰 준수
  - wrangler 명령 사용 0건
  - `npm run deploy` 호출 0건
  - 운영 PWA (20260328 워크트리) 영역 침범 0건
- main 단일 trunk 룰 — 현 브랜치 `redesign/30-not-found` (사용자 정의 브랜치) 작업 후 commit 만, push/머지/배포는 별도 단계
- 디자인 변경 전 시안 먼저 (feedback_design_sketch_first.md) — 본 wave 가 시안 단계 (W1) 자체

## Self-Check: PASSED

- `cha-bio-safety/docs/redesign-context/30-not-found/sketch.html` — FOUND (423 라인)
- commit `78dca20` — FOUND in `git log` (HEAD)
- 6 보호 파일 모두 `git diff --quiet` PASS
- 평면 폴더 룰 PASS (`sketch/` 서브폴더 미존재)
- 12개 grep verify gate 모두 PASS (#11 negation 문맥 OR 절 만족)
