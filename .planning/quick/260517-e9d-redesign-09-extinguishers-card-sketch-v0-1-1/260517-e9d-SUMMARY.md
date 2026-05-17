---
quick_id: 260517-e9d
title: redesign/09-extinguishers — 카드 영역 sketch wave 2
branch: redesign/09-extinguishers
depends_on: [260517-e9c]
status: sketch wave 2 완료 · 사용자 컨펌 대기
---

# 260517-e9d · 09 카드 sketch wave 2

## 작성 파일

- `cha-bio-safety/docs/redesign-context/09-extinguishers/sketch/card-sketch.html` (445 lines)

## 영역 범위

- ExtinguisherCard (`src/pages/ExtinguishersListPage.tsx` l.646-784)
- DetailField (l.799-811)
- Card grid (l.487-557, 모바일 1열 / 데스크톱 2~3열)

## 8 viewport 매트릭스

| ID | 상태 | 핵심 검증 |
|---|---|---|
| V1 | 모바일 collapsed 미배치 | danger badge + dot, 위치 미지정 |
| V2 | 모바일 collapsed 배치됨 + 교체 도래 | accent badge + warning chip (노랑) |
| V3 | 모바일 expanded mapped | accent 1.5px border + 정보수정 / 분리 (danger) |
| V4 | 모바일 expanded unmapped-clean | 정보수정 / 배치 / 삭제 (danger) — hard delete 케이스 |
| V5 | 모바일 expanded unmapped-inspected | 정보수정 / 배치 / 폐기 (danger) — 점검 이력 보존 |
| V6 | 모바일 disposed | surface-sunken + opacity 0.6 + "폐기된 자산입니다." |
| V7 | 모바일 collapsed + 교체 초과 | danger chip (빨강) |
| V8 | 데스크톱 grid 2열 | 배치+warning + 폐기 동시 노출 |

## 13 verify gate 결과 (모두 PASS)

```
G1 viewport markers           : 8 (≥8) PASS
G2 status-danger-bg           : 7 (≥1) PASS
G3 status-warning-bg          : 4 (≥1) PASS
G4 accent (배치/expand border): 8 (≥1) PASS
G5 surface-raised (카드)      : 7 (≥6) PASS
G6 surface-sunken             : 7 (≥2) PASS
G7 text-primary/secondary/tertiary: 29 / 12 / 26
G8 border-default/strong      : 11 / 5
G9 radius-md/sm               : 9 / 20
G10 옛 alias                  : 0 (=0) PASS
G11 linear-gradient           : 0 (=0) PASS
G12 raw hex/rgba in body      : 0 (=0) PASS
G13 emoji/shadow/blur         : 0 (=0) PASS
```

## 토큰 단일 source (chrome wave 1 + accent-bg 추가)

기존 chrome 토큰 + 신규:
- `--accent-bg: rgba(59, 130, 246, 0.16)` — 배치됨 badge 배경

## 비즈니스 로직 보존

- `getMappingState` 4-way 분기 (unmapped-clean / unmapped-inspected / mapped / disposed)
- `getReplaceWarning` 분기 (warn / imminent / danger / null)
- 카드 onClick `!isDisposed` 만 toggle
- Action row `e.stopPropagation`
- DetailField mono 옵션
- badge 라벨: 폐기 / 배치됨 / 미배치

## 디자인 선택 — 검토 필요

- **교체 warning chip 2색** (warn+imminent=노랑 / danger=빨강) — 원본 코드 그대로. chrome 의 chip 은 3색 (warning/fire/danger) 인데 카드 warning chip 은 2색만. 일관성 차이 의도된 것인지 사용자 컨펌 가능.
- **미배치 badge = danger 톤** — 미배치 자산이 "긴급 조치 필요" 인지 사용자 인지. 메모리 `feedback_inspection_unresolved_color` (미조치 = fire) 와는 별개 영역이지만 톤 일관성 검토 가능.

## 다음 단계

1. **사용자 시각 컨펌** — sketch HTML 로컬 또는 GitHub 에서 8 viewport 확인
2. 컨펌 OK 시 다음 wave 후보:
   - wave 3: **등록 모달** (RegisterModal, hasMarkerContext 분기 + 6 필드)
   - wave 4: **수정 모달** (EditModal, 7 필드 + 연속 등록 편의)
   - wave 5: **확인 모달 4종** (delete / dispose / unassign / swap)
   - wave 6: **skeleton / 빈 상태 / 에러 상태**
3. 모든 sketch wave 완료 후 → TSX 변환 wave (별도 quick)

## 파일 변경 요약

```
A  cha-bio-safety/docs/redesign-context/09-extinguishers/sketch/card-sketch.html  (445 lines)
A  .planning/quick/260517-e9d-redesign-09-extinguishers-card-sketch-v0-1-1/260517-e9d-PLAN.md
A  .planning/quick/260517-e9d-redesign-09-extinguishers-card-sketch-v0-1-1/260517-e9d-SUMMARY.md
```
