---
quick_id: 260517-upw
title: redesign/10-cctv-info — v0.1.1 토큰 sketch 1차 작성
branch: redesign/10-cctv-info
date: 2026-05-17
status: sketch-done · 사용자 컨펌 대기
---

# 260517-upw · 10-cctv-info v0.1.1 sketch

## 작성 파일

- `cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html` (422 lines)

## 6 viewport 구성

| ID | frame | 데이터 | 검증 포인트 |
|---|---|---|---|
| V1 | 모바일 1열 | DVR 1 · 16ch · 8F,7F · 50일 (safe) · 3포트 모두 기존 | 표준 카드 / 다포트 / 기존 톤 |
| V2 | 데스크톱 2열 + 페이지 출처 | DVR 1 + DVR 2 (둘 다 safe) | grid 2열 max-width 960 + 출처 푸터 |
| V3 | 모바일 | DVR 13 · 7ch · 보존 120일 (추정, info) · 포트 #1 4TB 2026-04-28 (info) | info dot + info 교체일자 동시 노출 |
| V4 | 모바일 | DVR 7 · 15ch · 63일 safe · #4 2025-12-05(info) / #5 기존 / #6 2025-12-05(info) | 한 카드 안 info 강조 2 + 기존 1 |
| V5 | 모바일 | DVR 12 · 8ch · 91일 safe · 단일 포트 #2 2TB 기존 | 1행 포트 표 시각 균형 |
| V6 | 데스크톱 2열 | DVR 13 (좌) + 빈 슬롯 (우) | 13÷2 = 7+1 odd-row 마지막 행 |

## 9 verify gate 결과 (모두 PASS)

```
G1 viewport markers      : 6 (≥6) PASS
G2 status-safe-bg/bar    : 5 / 5 (≥1 each) PASS
G3 status-info-bg        : 2 (≥1) PASS
G4 text-info 강조        : 6 (≥2) PASS
G5 card chrome (raised)  : 7 (≥7) PASS — 카드 7개 inline style
G6 옛 alias              : 0 (=0) PASS
G7 linear-gradient       : 0 (=0) PASS
G8 raw hex/rgba in body  : 0 (=0) PASS
G9 emoji/shadow/blur     : 0 (=0) PASS
```

verify 과정 메모:
- 1차 작성 시 클래스 기반 카드 + rules 박스에 금지 토큰명/리터럴 직접 인용 → G5/G6/G7/G8/G9 5개 동시 FAIL
- 2차에서 카드를 inline style 로 재작성 + rules 박스 본문은 한글 풀이로 변경 (`var(--bg)` → "bg 계열 alias", `linear-gradient` → "그라디언트" 등)
- 최종 9/9 PASS

## 디자인 토큰 단일 source

`:root` 안에 정확히 다음 18 토큰만 정의 (이외 추가 금지):

- surface: page / raised / sunken
- text: primary / secondary / tertiary
- border: default / strong
- accent (외곽 h2 강조에만)
- status-safe / safe-bar / safe-bg (확정 보존)
- status-info / info-bar / info-bg (추정 보존 + 교체일자 강조)
- radius: sm / md / pill

## 메모리 룰 강제 결과

- `feedback_design_sketch_first` — sketch HTML 시안 먼저 / 비즈니스 로직 0 변경 ✓
- `feedback_redesign_sketch_rule_enforcement` — :root 단일 source / 카드 chrome 통일 / 카드 내부 raw 색 0 ✓
- `feedback_tailwind_token_class_pattern` — sketch 의 CSS 변수명은 `--status-*` 그대로 유지 (HTML sketch 한정 룰) ✓
- `feedback_text_caption_leading_none` — 배지 / 푸터 / 채널수 / 페이지 출처 4 곳 `line-height: 1` 명시 ✓
- `feedback_inspection_unresolved_color` — 이 페이지엔 미조치 개념 없음. status 매핑 일관성 (safe = 확정 / info = 추정) ✓
- `feedback_design_changes_ask_first` / `feedback_deploy_test` — 시안 작성만, commit / push 전 사용자 시각 컨펌 대기 ✓

## 비즈니스 로직 보존 (TSX 변환 wave 입력 그대로)

- `CCTV_DVRS` 13개 데이터 구조 — 변경 0
- `useIsDesktop()` 모바일/데스크톱 분기 — 변경 0
- 합계 계산 (`p.cap.endsWith('TB') ? parseFloat(p.cap) : 0`) — 변경 0
- 추정여부 분기 (`retention.includes('추정')`) — 변경 0
- 교체일자 분기 (`p.replaced !== '기존'`) — 변경 0

TSX 변환 wave 에서는 위 4 로직 + 본 sketch 의 inline style 토큰을 verbatim 인용.

## 다음 단계

1. **사용자 시각 컨펌** — 브라우저로 `cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html` 열어 6 viewport 확인.
2. 컨펌 OK 시 → commit + push (`redesign/10-cctv-info` 브랜치).
3. 다음 quick: **10-cctv-info TSX 변환 wave** — 본 sketch verbatim 인용 원천으로 `src/pages/CctvInfoPage.tsx` 재작성. (별도 PLAN 생성 + planner 가 sketch CSS grep 으로 verbatim 추출하여 인용)

## 파일 변경 요약

```
A  cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html  (422 lines)
A  .planning/quick/260517-upw-redesign-10-cctv-info-sketch-v0-1-1-cctv/260517-upw-PLAN.md (PLAN 자체)
A  .planning/quick/260517-upw-redesign-10-cctv-info-sketch-v0-1-1-cctv/260517-upw-SUMMARY.md (본 파일)
```

소스 코드 변경 0건. sketch HTML + plan/summary 만.
