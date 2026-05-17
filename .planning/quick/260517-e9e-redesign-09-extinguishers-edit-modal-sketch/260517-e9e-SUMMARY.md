---
quick_id: 260517-e9e
title: redesign/09-extinguishers — 수정 모달 sketch wave 4
branch: redesign/09-extinguishers
depends_on: [260517-e9c, 260517-e9d, 260517-e9r]
status: sketch wave 4 완료
---

# 260517-e9e · 09 수정 모달 sketch wave 4

## 작성 파일

- `cha-bio-safety/docs/redesign-context/09-extinguishers/sketch/edit-modal-sketch.html` (297 lines)

## 영역 범위

- EditModal (l.938-1061)
- 공통 modal styles 는 wave 3 (register) 재사용

## EditModal 고유 요소

1. **Counter chip 3 톤** (변경: N / 3)
   - 0 = surface-sunken + text-tertiary
   - 1~3 = accent-bg + accent
   - 4+ = status-danger-bg + status-danger
2. **borderForField** — 원본과 다르면 input border accent / 같으면 border-strong
3. **종류 grid 변경 표시** — active + 원본과 다름 = 1.5px accent border
4. **changedCount > 3 microcopy** — danger 톤 "「폐기 후 재등록」을 사용하세요."
5. **Save disabled** — border-strong bg + text-tertiary + 1px danger-bar 보더 (위험 시각 강조)
6. **saving 라벨** — "저장 중…" vs "저장"

## 5 viewport

| ID | 상태 | 핵심 |
|---|---|---|
| V1 | 변경 0 | counter 회색 / save disabled |
| V2 | 변경 2 (제조업체+제조년월) | counter accent / 변경 필드 accent border / save enabled |
| V3 | 변경 4 over | counter danger / microcopy 노출 / save disabled red-bordered |
| V4 | 저장 중 (변경 2) | counter accent + 라벨 "저장 중…" |
| V5 | 데스크톱 변경 2 | 모달 사이즈 동일 + backdrop overlay |

## 11 verify gate (모두 PASS)

```
G1 viewport (≥5)              : 5 PASS
G2 counter 3톤 등장            : 3 톤 모두 PASS
G3 status-danger-bg           : 1 PASS
G4 status-danger-bar          : 3 PASS
G5 accent-bg                  : 3 PASS
G6 surface-overlay            : 2 PASS
G7 radius-lg                  : 5 PASS
G8 옛 alias                   : 0 PASS
G9 linear-gradient            : 0 PASS
G10 raw hex/rgba in body      : 0 PASS
G11 emoji/shadow/blur         : 0 PASS
```

## 비즈니스 로직 보존

- norm() 정규화
- changedCount useMemo (7 필드 vs 원본)
- saveDisabled = count === 0 || count > 3
- borderForField dispatcher
- handleSave changed delta 빌드
- saving prop

## 다음 wave 후보

- wave 5: **ConfirmModal 4종** (delete / dispose / unassign / swap — primary 'acl' vs 'danger' 분기)
- wave 6: **skeleton / 빈 상태 / 에러 / 카드 grid loading**

## 파일 변경 요약

```
A  cha-bio-safety/docs/redesign-context/09-extinguishers/sketch/edit-modal-sketch.html  (297 lines)
A  .planning/quick/260517-e9e-redesign-09-extinguishers-edit-modal-sketch/260517-e9e-PLAN.md
A  .planning/quick/260517-e9e-redesign-09-extinguishers-edit-modal-sketch/260517-e9e-SUMMARY.md
```
