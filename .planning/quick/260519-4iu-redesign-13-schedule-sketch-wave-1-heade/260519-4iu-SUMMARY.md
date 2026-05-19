---
phase: quick-260519-4iu
plan: 01
subsystem: design
tags: [redesign, 13-schedule, sketch, wave-1, calendar]
type: execute
wave: 1
key-files:
  created:
    - cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-1.html
  modified: []
decisions:
  - "캘린더 일자 셀: aspect-square + leading-none + text-caption (12px) — 12-staff W2 패치 룰 mirror"
  - "공휴일 라벨: source 11px → 12px (text-caption) 노안 격상"
  - "요일 헤더: source 10px → 12px (text-caption) 노안 격상"
  - "선택 셀 box: sketch CDN 기본 tailwind (w-8=32px) 가정. TSX 변환 wave 에서는 config override 로 명시적 px 필요"
metrics:
  duration_minutes: ~12
  completed_date: "2026-05-19"
  lines: 1098
  verify_gates: "14/14 PASS"
commit: e2e19d9
---

# Quick 260519-4iu: redesign/13-schedule sketch wave 1 — 헤더 + 월 네비 + 캘린더 grid

## One-liner

13-schedule 의 첫 시안 wave — 자체 헤더 + 월/연도 네비게이션 + 7×6 캘린더 그리드 (요일 헤더 + 일자 셀 + 카테고리 dot 5종 + 공휴일 + 선택/오늘 표식)를 다크/라이트 모바일 frame + 데스크톱 placeholder 로 정적 HTML 1장 출력.

## Output

| 항목 | 값 |
|---|---|
| 시안 파일 | `cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-1.html` |
| 라인 수 | 1098 |
| 커밋 | `e2e19d9` — `sketch(13-schedule): wave 1 — 헤더 + 월 네비 + 캘린더 grid` |
| Verify gate | 14/14 PASS |

## Verify Gate 결과 (14/14)

| # | Gate | 결과 |
|---|---|---|
| 1 | 파일 존재 + ≥350 라인 | PASS (1098 라인) |
| 2 | 이모지 0 (Python regex, 0x1F300-1F9FF / 0x1FA00-1FAFF / 0x2600-27BF) | PASS (0건) |
| 3 | 9·10·11px font-size 0 | PASS |
| 4 | status- prefix className 0 (text-status-fire 등) | PASS |
| 5 | SCHED_CATEGORIES 5 hex verbatim — #3b82f6 / #eab308 / #e2e8f0 / #f97316 / #ef4444 | PASS (all 5) |
| 6 | WEEK_DAYS 7 한글 모두 노출 — 일 월 화 수 목 금 토 | PASS (all 7) |
| 7 | data-theme 토글 동작 | PASS |
| 8 | 페이지 제목 "월간 점검 계획" verbatim | PASS |
| 9 | 라이트 frame `data-theme="light"` 존재 | PASS |
| 10 | tokens.css 표식 (`--surface-page` + `--status-fire-bar`) | PASS |
| 11 | typography.css 표식 (`.text-caption` + `.text-display`) | PASS |
| 12 | category 5 label 모두 노출 — 점검 업무 행사 승강기 소방 | PASS |
| 13 | OQ (open question) 명시 | PASS |
| 14 | 멀티데이 mock (5/12 또는 소방 종합정밀점검 또는 멀티데이) | PASS |

## 시각 컨펌 항목 (사용자 단계)

브라우저로 `sketch-wave-1.html` 을 열고 확인:

1. **다크 모바일 frame (393px)** — 좌측, 본문 기본
   - 자체 헤더 h-48 (백 버튼 32×32 + 페이지 제목 "월간 점검 계획" + 우측 placeholder 32×32 dashed)
   - 월/연도 네비 (‹ 36×36 + "2026년 5월" text-title + "오늘" 칩 h-7 border-accent + › 36×36)
   - 캘린더 카드 (border + rounded-md + bg-surface-raised)
     - 요일 헤더 일(red)/월~금(tertiary)/토(accent), 모두 12px font-semibold leading-none
     - 일자 grid 7×6 aspect-square — 1주차 앞 5칸 empty, 5/1 ~ 5/31, 마지막 6칸 empty
     - **5/5 (어린이날) 선택 셀** — 8px rounded + 2px accent border + bg rgba(59,130,246,0.15) + accent 색 + event dot
     - **5/19 (오늘, 화요일)** — accent 원형 배경 24×24 + 흰 글자 + 3개 dot (inspect/fire/task)
     - **5/12~5/15 멀티데이 fire** — 동일 fire dot 4일 연속
     - **5/20 셀** — 4 카테고리 중 slice(0,3) 으로 3개만 (inspect/task/event, elevator 잘림)
     - **5/25 (부처님 오신 날) + event dot** — 공휴일이라도 단일 일자 schedule 은 표시되는 룰 검증
   - 공휴일 라벨 "어린이날" — 12px font-semibold danger
   - dashed placeholder "↓ 다음 wave: 일자별 일정 카드 + 미리보기 + 범례 + CTA"

2. **라이트 모바일 frame (393px)** — 우측
   - 동일 구조, tokens 자동 분기 (#ffffff 배경, #1f2328 텍스트, light status 톤)
   - **OQ #1**: event dot 만 다크(#e2e8f0) → 라이트(#94a3b8) 로 darken 임시 적용 — 시각 확인용
   - 선택 셀 border 도 라이트 accent(#1f6feb) 자동 분기

3. **카테고리 5종 라벨 카드** — 다크 페이지 중앙
   - 점검(#3b82f6) / 업무(#eab308) / 행사(#e2e8f0) / 승강기(#f97316) / 소방(#ef4444) 모두 hex 같이 노출
   - 멀티데이/slice(0,3)/공휴일 단일 일자 룰 설명 텍스트

4. **데스크톱 frame (≥1024px 화면 노출)** — 1280px
   - 자체 헤더 24px padding (모바일 12px 대비 자동 분기 확인용)
   - 좌측 380px 캘린더 컬럼 + 우측 placeholder dashed callout
   - 우측 영역은 다음 wave (월간 미리보기 + CTA + 카테고리별 일정 컬럼)

5. **OQ 카드** — 노란 strip, 3 항목 순서 매김

6. **다크/라이트 토글** — 우상단 fixed pill 2개. 데스크톱 frame + 페이지 body 배경 분기

## Open Questions — LOCKED (2026-05-19 사용자 답변)

### OQ #1 ▶ LOCKED a) — 라이트 모드 event 카테고리 dot 색

- 다크: `#e2e8f0` verbatim (SchedulePage.tsx line 84)
- 라이트: **`#94a3b8` (slate-400) lock**
- TSX 변환 wave 시 다크/라이트 분기 hardcode (var(--text-secondary) 매핑 X, 카테고리 hex 재선정 X)

### OQ #2 ▶ LOCKED 유지 — 멀티데이 범위 표시

- **dot 유지** (band 추가 안 함). matchesDate 룰 mirror, source SchedulePage.tsx verbatim
- 일자 셀당 동일 카테고리 dot 만 표시

### OQ #3 ▶ LOCKED 제거 — "오늘" 칩 제거

- **칩 자체 제거.** 월/연도 네비는 ‹ / 라벨 / › 3-element 만 (단순화)
- 적용 위치 3건: 다크 모바일 frame (line 365) / 라이트 모바일 frame (line 651) / 데스크톱 frame (line 948)
- 5/19 일자 셀의 accent 원형 표식 (오늘 cell visual) 은 유지 — 별개 표식

## 메모리 룰 준수 체크리스트

- [x] 이모지 0 (feedback_tsx_wave_emoji_dot_gap.md)
- [x] 9·10·11px font-size 0 (text-caption 12 마지노선, feedback_text_caption_leading_none.md)
- [x] status- prefix className 0 (feedback_tailwind_token_class_pattern.md — text-fire-bar O / text-status-fire-bar X)
- [x] SCHED_CATEGORIES 5 hex verbatim
- [x] WEEK_DAYS 7 한글 모두 노출
- [x] 일자 셀 leading-none + aspect-square 일관 (12-staff W2 패치 룰 mirror)
- [x] tokens.css + typography.css verbatim 임베드
- [x] data-theme 토글 동작
- [x] sketch 작성 시 디자인 룰 강제 (feedback_redesign_sketch_rule_enforcement.md) — 4종 검증 모두 PASS
- [x] **비즈니스 로직 0 변경** — SchedulePage.tsx 1줄도 수정 X (`git diff --quiet` 확인)
- [x] 데스크톱 page-padding 분기 시각 확인 영역 포함 (lg:block + 24px padding)
- [x] 자체 헤더 통일 룰 (project_redesign_self_header_chrome.md) — h-48 + bg-surface-raised + 백 버튼 32×32 + lucide ChevronLeft 15px stroke 1.5

## Deviations from Plan

**None.** plan 의 모든 항목 (skeleton / frame 구조 / mock data 2026-05 / OQ 3건 / verify gate 14종) verbatim 적용.

소소한 자동 fix:
- 다크/라이트 토글 버튼 fixed top-right placement 의 line-height inline 처리 — text-caption (lh:1.5) 가 button 안에서 시각적 패딩 유발하지 않도록 `style="line-height:1"` 명시 (feedback_text_caption_leading_none.md 룰)
- 데스크톱 frame 의 캘린더 grid 는 모바일과 1:1 동일 (재사용 컴포넌트 가정). dot row 의 inner `flex items-center` 없는 빈 placeholder 셀은 `<div style="height:6px;margin-top:auto;"></div>` 로 간소화 (markup 길이 절감, 시각 동일)

## Auth Gates

해당 없음 (정적 HTML 작성 작업).

## Next Steps

1. **사용자 시각 컨펌** — 브라우저로 `sketch-wave-1.html` 열어 모바일 다크/라이트 + 데스크톱 placeholder + OQ 3건 확인
2. OQ 3건 답변 → sketch 에 락 (필요 시 micro-patch)
3. **Wave 2 진입 조건:** 사용자 컨펌 OK → wave 2 (캘린더 아래 영역: 일자별 일정 카드 + 미리보기 + 범례 + CTA) sketch 신규 quick task
4. TSX 변환 wave 는 모든 sketch wave 완결 후 (12-staff 패턴 mirror — W1~W10 sketch → TSX 변환 wave)

## 워크트리 룰 준수 (CLAUDE.local.md)

- [x] wrangler 명령 0 (디자인 워크트리 deny)
- [x] `npm run deploy` 0
- [x] TSX 파일 (.tsx) 수정 0
- [x] `.planning/` 외부 mass-edit 0 — 단일 파일 (sketch-wave-1.html) 만 created
- [x] redesign/13-schedule 브랜치 작업
- [x] atomic commit 1개 (sketch-wave-1.html 만)
- [x] SUMMARY/PLAN/STATE 직접 commit 없음 — orchestrator 가 별도 docs commit 수행

## Self-Check: PASSED

- [x] FOUND: `cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-1.html` (1098 lines)
- [x] FOUND: commit `e2e19d9` (`git log --oneline -1` → "sketch(13-schedule): wave 1 — 헤더 + 월 네비 + 캘린더 grid")
- [x] FOUND: `SchedulePage.tsx` untouched (`git diff --quiet HEAD` → exit 0)
- [x] 14/14 verify gates PASS (검증 결과 cited above)
