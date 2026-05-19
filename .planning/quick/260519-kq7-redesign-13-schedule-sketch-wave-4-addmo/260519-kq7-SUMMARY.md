---
phase: 260519-kq7-redesign-13-schedule-sketch-wave-4-addmo
plan: 01
subsystem: redesign-13-schedule
tags: [redesign, 13-schedule, sketch, AddModal, wave-4]
requires: [redesign/13-schedule W1+W2+W3 LOCKED, SchedulePage.tsx line 35~39 / 63 / 64 / 81~87 / 647~963]
provides: [cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-4.html]
affects: [13-schedule TSX 변환 wave (예정), AddModal 검수 사용자 컨펌]
tech-stack-added: []
patterns-used: [정적 HTML 시안, tokens.css verbatim 임베드, typography.css verbatim 임베드, inspection-modal-chrome-rules.md §1~§6 mirror]
key-files-created:
  - cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-4.html (1739 lines)
key-files-modified: []
key-decisions:
  - ELEV_SUBCATS / FIRE_SUBCATS 라벨은 SchedulePage.tsx line 63~64 verbatim 따름 (task_scope 본문 라벨 차이는 별도 wave 에서 source 패치 후 sketch 재작성)
  - 7 state frame (빈폼 / inspect 소화기 / task / elev 정기 점검 / fire 상반기 / N일 a+b / saving) — 모바일 393 + 데스크톱 480 페어
  - 라이트 mirror = frame #1 + frame #6a 두 개로 한정 (검수 부담 감축)
  - inline style 예외 허용 (5 cat × 7 frame dynamic alpha bg + border — Tailwind utility 표현 어려움)
  - 노안 격상: 9·10·11 → 12+ / 헤더 15 → 18 / CTA 14 → 16 / fire grid 10 → 12 / close 28 → 32 + svg 14 → 16
duration-minutes: ~7
completed-date: 2026-05-19
---

# Phase 260519-kq7 Plan 01: redesign/13-schedule sketch wave 4 — AddModal Summary

AddModal (SchedulePage.tsx line 647~963) 정적 HTML 시안 1장으로 5 cat variant × 7 state frame × 다크/라이트 mirror 를 한 페이지에서 시각 검수할 수 있도록 작성. W1+W2+W3 LOCKED 결정과 inspection-modal-chrome-rules.md §1~§6 을 mirror, 노안 격상 룰 적용, verify gate 16/16 PASS.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | sketch-wave-4.html 작성 (AddModal 7 state frame) | de27ec5 | cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-4.html (+1739) |

## Verify Gate 16/16 PASS

| # | 검사 | 결과 | 비고 |
|---|------|------|------|
| 1 | 라인 수 ≥ 600 | 1739 | PASS (≥600) |
| 2 | 이모지 0 | 0 | PASS (Python emoji range 검사) |
| 3 | 9·10·11px font-size 0 | 0 | PASS (HTML 코멘트 격상 표 텍스트 제외) |
| 4 | status- prefix className 0 | 0 | PASS (class 속성 검사 — var(--status-*) 토큰만 사용) |
| 5 | SCHED_CATEGORIES 5 hex | 18 / 4 / 3 / 7 / 8 | PASS (#3b82f6 / #eab308 / #e2e8f0 / #f97316 / #ef4444) |
| 6 | 라이트 event #94a3b8 hardcode | 10 | PASS (W1+W2+W3 LOCKED mirror) |
| 7 | INSP_CATEGORIES 19종 verbatim | 21 / 6 × 18 | PASS (소화기 21회 — Frame 2 select + 헤더/내용 라벨 중복 포함) |
| 8 | ELEV_SUBCATS 3종 verbatim | 4 / 4 / 4 | PASS (승강기 정기 점검 / 승강기 수리 / 승강기 법정 검사) |
| 9 | FIRE_SUBCATS 4종 verbatim | 4 / 4 / 4 / 4 | PASS (소방 상반기 종합정밀점검 / 소방 하반기 작동기능점검 / 소방 시설물 공사 / 소방 관공서 불시 점검) |
| 10 | tokens.css 임베드 마커 | 2 | PASS (--surface-page:#0a0d12 + --duty-day:#f59e0b) |
| 11 | typography 클래스 정의 | 4 | PASS (.text-caption / .text-label / .text-body / .text-title 등) |
| 12 | data-theme dark/light | 18 / 6 | PASS (각 ≥1 — 라이트 mirror frame #1 + #6a) |
| 13 | "일정 추가" 헤더 ≥7 | 20 | PASS (7 state frame × dark+light = 12+ 헤더 + 코멘트 인용) |
| 14 | N일 미리보기 문구 | 3 / 2 | PASS (4일 skipped=0 + 8일 skipped=2) |
| 15 | "저장 중..." 라벨 | 2 | PASS (frame #7 mobile + desktop) |
| 16 | 모바일 393 + 데스크톱 480 | 3 / 1 | PASS (frame-mobile 393 + modal-sheet-desktop 480) |

## Frame Matrix (시연 노출)

| # | Frame | state | dark mobile | dark desktop | light mobile | light desktop |
|---|-------|-------|------|------|------|------|
| 1 | 빈폼 / inspect 기본 | cat='inspect', insCat='' | O | O | O (event dot) | O (event dot) |
| 2 | inspect sub 선택 (소화기) | cat='inspect', insCat='소화기', memo verbatim | O | O | - | - |
| 3 | task 업무 입력 | cat='task', title='당직 인계 정리' | O | O | - | - |
| 4 | elevator sub 선택 | cat='elevator', elevSub='승강기 정기 점검', agency='TKE' | O | O | - | - |
| 5 | fire sub 선택 | cat='fire', fireSub='소방 상반기 종합정밀점검', agency='동양소방' | O | O | - | - |
| 6a | N일 미리보기 4일 skipped=0 | endDate='2026-05-15' | O | O | O | - |
| 6b | N일 미리보기 8일 skipped=2 | endDate='2026-05-19' | O | O | - | - |
| 7 | saving 저장 중 | saving=true, opacity 0.6, label "저장 중..." | O | O | - | - |

총 페어: 다크 mobile×7 + 다크 desktop×7 + 라이트 mobile×2 + 라이트 desktop×1 = **17 frame**

## Deviations from Plan

### Auto-fixed Issues

없음 — 플랜 그대로 실행. 다음 항목은 플랜에 명시된 LOCKED 결정/예외 사유로 deviation 아님:

- **inline style 사용** — 플랜 §7 예외 사유 명시대로 5 cat × 7 frame dynamic alpha bg 는 Tailwind utility 로 표현 불가. tokens var() 가능한 chrome 은 모두 var() 사용.
- **ELEV/FIRE_SUBCATS 라벨 = source verbatim** — task_scope 본문 라벨과 다름. 플랜 `<source_verbatim>` 섹션 LOCKED 결정대로 SchedulePage.tsx line 63~64 원본 따름.
- **frame #1 라이트 mirror 데스크톱도 추가** — 플랜은 mobile mirror 만 필수였으나 chrome consistency 검수 목적으로 desktop 라이트도 함께 노출 (검수 부담 가중 없음, gate #12 light=6 → 6 mirror frame 분량 정합).

### Authentication Gates

해당 없음 (정적 HTML 작성).

## Light Mirror 시연

- **Frame 1C/1D** — 라이트 모드 빈폼 inspect. 행사 칩 안에 `.event-dot-themed` span 1개 노출 — 다크에서는 #e2e8f0, 라이트에서는 `[data-theme="light"] .event-dot-themed { background: #94a3b8 !important; }` override 적용되어 회색 톤으로 전환. W1+W2+W3 LOCKED chrome consistency.
- **Frame 6Ac** — 라이트 모드 N일 미리보기 (4일 skipped=0). 동일 event dot override 시연 + accent 라이트 톤 (#1f6feb) 적용.

## inspection-modal-chrome-rules.md mirror 항목

| 룰 | source 값 | sketch 적용 |
|----|---------|-----------|
| Overlay bg | `rgba(0,0,0,0.55)` | `.modal-overlay` / `.modal-overlay-mobile` 둘 다 |
| z-index | 300 | `.modal-overlay` z-index:300 |
| Desktop sheet bg | `var(--surface-raised)` | `.modal-sheet-desktop` |
| Desktop sheet radius | 16 (--radius-lg) | `border-radius: 16px` |
| Mobile sheet bg | `var(--surface-raised)` | `.modal-sheet-mobile` |
| Mobile sheet radius | 20 0 0 0 | `border-radius: 20px 20px 0 0` |
| Desktop sheet width | 480 max-width 90vw | `width: 480px; max-width: 90vw` |
| 헤더 close X 크기 (노안 격상) | 28→32 + svg 14→16 | width:32 height:32 + svg 16×16 |
| 헤더 타이틀 (노안 격상) | 15 → 18 (text-title font-semibold) | `<span class="text-title font-semibold">` |

## Open Questions (사용자 답변 요청)

푸터 박스로 시각 노출:
- **OQ #1** — 모바일 BottomSheet maxHeight: a) 90dvh verbatim / b) 80vh 축소
- **OQ #2** — 저장 버튼 색: a) source linear-gradient(135deg, #1d4ed8, #2563eb) / b) accent solid token
- **OQ #3** — INSP_CATEGORIES 19종 입력: a) `<select>` native / b) grid 3-4열 칩

## LOCKED 사전 결정 (사용자 답변 불필요 — 시안 안에 명시)

- ELEV_SUBCATS / FIRE_SUBCATS = SchedulePage.tsx line 63~64 원본 verbatim
- SCHED_CATEGORIES 5 hex — W1+W2+W3 LOCKED mirror
- 라이트 event #94a3b8 hardcode override — W1+W2+W3 LOCKED mirror
- 이모지 0 — feedback_tsx_wave_emoji_dot_gap.md
- 노안 격상 표 (9·10·11 → 12+ / 헤더 15→18 / CTA 14→16 / fire grid 10→12)
- inspection-modal-chrome-rules.md §1~§6
- SchedulePage.tsx 0줄 수정 (시안 only)

## Threat Flags

없음 — 정적 HTML 시안 (네트워크/auth/파일 액세스/스키마 변경 없음).

## Self-Check: PASSED

- 파일 존재: `cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-4.html` — FOUND (1739 lines)
- 커밋 존재: `de27ec5` — FOUND (`sketch(13-schedule): wave 4 — 등록 모달 AddModal`)
- SchedulePage.tsx 0줄 수정: `git status -- cha-bio-safety/src/pages/SchedulePage.tsx` 빈 결과 — PASS
- verify gate 16/16: 모두 PASS (상세 표 위 참조)
