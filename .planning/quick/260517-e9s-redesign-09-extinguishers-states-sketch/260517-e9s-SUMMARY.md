---
quick_id: 260517-e9s
title: redesign/09-extinguishers — 카드 grid 상태 3종 sketch wave 6 (최종)
branch: redesign/09-extinguishers
depends_on: [260517-e9c, 260517-e9d, 260517-e9r, 260517-e9e, 260517-e9k]
status: sketch wave 6 완료 · 09 sketch 시리즈 완결
---

# 260517-e9s · 09 카드 grid 상태 3종 sketch wave 6 (최종)

## 작성 파일

- `cha-bio-safety/docs/redesign-context/09-extinguishers/sketch/states-sketch.html` (194 lines)

## 영역 범위

- Card grid wrapper (l.487-555)
- SKELETON_STYLE (l.15-20) + Loading 블록 (l.493-499)
- Error 블록 (l.502-521)
- Empty 블록 (l.524-535)

## 4 viewport

| ID | 상태 | 핵심 |
|---|---|---|
| V1 | Loading 모바일 1열 | 3 skeleton + blink 2s infinite |
| V2 | Loading 데스크톱 3열 | 3 skeleton 한 행 (gridCols 1fr 1fr 1fr) |
| V3 | Error | 타이틀 + 안내 + 재시도 버튼 |
| V4 | Empty | 타이틀 + 「+ 새로 등록」 안내 |

## 10 verify gate (모두 PASS)

```
G1 viewport (≥4)             : 4 PASS
G2 skeleton class            : 6 PASS
G3 surface-sunken            : 2 PASS
G4 radius-md (skeleton)      : 1 PASS
G5 radius-sm (재시도 버튼)   : 1 PASS
G6 blink @keyframes          : 1 PASS
G7 옛 alias                  : 0 PASS
G8 linear-gradient           : 0 PASS
G9 raw hex/rgba              : 0 PASS
G10 emoji/shadow/blur        : 0 PASS
```

## 비즈니스 로직 보존

- isLoading / isError / items.length === 0 분기
- refetch() 핸들러
- gridCols 반응형 (useIsDesktop + window.innerWidth)
- @keyframes blink 그대로

---

# 09 sketch 시리즈 완결 (wave 1~6)

| Wave | Quick ID | 파일 | viewport | lines |
|---|---|---|---|---|
| 1 chrome | 260517-e9c | chrome-sketch.html | 6 | 505 |
| 2 card | 260517-e9d | card-sketch.html | 8 | 445 |
| 3 register modal | 260517-e9r | register-modal-sketch.html | 4 | 279 |
| 4 edit modal | 260517-e9e | edit-modal-sketch.html | 5 | 297 |
| 5 confirm modal | 260517-e9k | confirm-modal-sketch.html | 5 | 209 |
| 6 states | 260517-e9s | states-sketch.html | 4 | 194 |
| **총** | | **6 파일** | **32 viewport** | **1929 lines** |

## 토큰 카탈로그 누적 (모든 wave 합산)

- Surface 5: page / raised / sunken / active / overlay
- Text 3: primary / secondary / tertiary
- Border 2: default / strong
- Accent: accent / accent-fg / accent-bg
- Status 4 페어: info / warning / fire / danger (각 fg + bar + bg)
- Radius 4: sm (8) / md (12) / lg (16) / pill (99)

## 다음 단계 — TSX 변환 wave

목표: `ExtinguishersListPage.tsx` (1168 lines) 의 alias 60 + raw hex 8 → v0.1.1 토큰 단일 source.

변환 wave 분할 (TSX 측):
- W1: 페이지 wrapper + 헤더 portal + 마커 동행 배너 (chrome 1차)
- W2: Filter bar (4탭 + 4 select·input + 교체경고 chip)
- W3: Card grid + ExtinguisherCard + DetailField
- W4: RegisterModal + 공통 modal styles
- W5: EditModal (counter + borderForField + microcopy)
- W6: ConfirmModal (4 호출처)
- W7: states (loading / error / empty + SKELETON_STYLE)

각 W 는 sketch wave 와 1:1 verbatim 인용.

## 파일 변경 요약

```
A  cha-bio-safety/docs/redesign-context/09-extinguishers/sketch/states-sketch.html  (194 lines)
A  .planning/quick/260517-e9s-redesign-09-extinguishers-states-sketch/260517-e9s-PLAN.md
A  .planning/quick/260517-e9s-redesign-09-extinguishers-states-sketch/260517-e9s-SUMMARY.md
```
