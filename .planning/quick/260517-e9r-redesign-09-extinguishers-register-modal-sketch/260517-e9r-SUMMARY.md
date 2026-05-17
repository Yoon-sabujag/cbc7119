---
quick_id: 260517-e9r
title: redesign/09-extinguishers — 등록 모달 sketch wave 3
branch: redesign/09-extinguishers
depends_on: [260517-e9c, 260517-e9d]
status: sketch wave 3 완료 · 사용자 컨펌 대기
---

# 260517-e9r · 09 등록 모달 sketch wave 3

## 작성 파일

- `cha-bio-safety/docs/redesign-context/09-extinguishers/sketch/register-modal-sketch.html` (279 lines)

## 영역 범위

- RegisterModal (l.823-927)
- 공통 모달: ModalBackdrop (l.1107-1120), FieldLabel (l.1124-1130), modalWrapperStyle, infoBannerStyle, inputStyle, cancelBtnStyle, primaryBtnStyle (l.1134-1168)
- → 이 wave 의 공통 스타일은 EditModal (wave 4), ConfirmModal (wave 5) 도 그대로 재사용

## 4 viewport

| ID | 상태 | 핵심 |
|---|---|---|
| V1 | 모바일 — 마커 OFF | 6 input + 종류 "분말 3.3kg" active + "등록" |
| V2 | 모바일 — 마커 ON | 2개 info banner + "등록 후 배치" 라벨 |
| V3 | 모바일 — 등록 중 disabled | submit 버튼 disabled 톤 (border-strong + text-tertiary + 등록 중…) |
| V4 | 데스크톱 — 모달 사이즈 고정 | maxWidth 360 그대로, backdrop overlay 강조 |

## 10 verify gate (모두 PASS)

```
G1 viewport (≥4)              : 4 PASS
G2 surface-overlay (backdrop) : 2 PASS
G3 radius-lg (모달)           : 4 PASS
G4 surface-raised (모달)      : 4 PASS
G5 accent (active+primary)    : 8 PASS
G6 status-info-bg (banner)    : 5 PASS
G7 옛 alias                   : 0 PASS
G8 linear-gradient            : 0 PASS
G9 raw hex/rgba in body       : 0 PASS
G10 emoji/shadow/blur         : 0 PASS
```

## 토큰 카탈로그 (wave 1+2+3 누적)

- Surface 5: page / raised / sunken / active / overlay
- Text 3: primary / secondary / tertiary
- Border 2: default / strong
- Accent: accent / accent-fg / accent-bg
- Status 4 페어: info / warning / fire / danger
- Radius 4: sm (8) / md (12) / **lg (16, 모달)** / pill (99)

## 비즈니스 로직 보존

- localStorage `'cbc24:lastRegisteredExt'` 연속 등록 편의
- handleSubmit type 필수 validation
- setSubmitting state
- 마커 동행 시 primary 라벨 분기 ("등록 후 배치" vs "등록")
- 부모가 모달 닫음

## 다음 wave 후보

- wave 4: **EditModal** (수정 모달 — 7 필드 + borderForField 변경 표시)
- wave 5: **ConfirmModal 4종** (delete / dispose / unassign / swap)
- wave 6: **skeleton / 빈 상태 / 에러**

## 파일 변경 요약

```
A  cha-bio-safety/docs/redesign-context/09-extinguishers/sketch/register-modal-sketch.html  (279 lines)
A  .planning/quick/260517-e9r-redesign-09-extinguishers-register-modal-sketch/260517-e9r-PLAN.md
A  .planning/quick/260517-e9r-redesign-09-extinguishers-register-modal-sketch/260517-e9r-SUMMARY.md
```
