---
quick_id: 260517-e9k
title: redesign/09-extinguishers — 확인 모달 4종 sketch wave 5
branch: redesign/09-extinguishers
depends_on: [260517-e9c, 260517-e9d, 260517-e9r, 260517-e9e]
status: sketch wave 5 완료
---

# 260517-e9k · 09 확인 모달 4종 sketch wave 5

## 작성 파일

- `cha-bio-safety/docs/redesign-context/09-extinguishers/sketch/confirm-modal-sketch.html` (209 lines)

## 영역 범위

- ConfirmModal 컴포넌트 (l.1075-1103)
- 4 호출처 (l.579-628): 분리 / 폐기 / 삭제 / 스왑

## 5 viewport

| ID | 호출 | primary | label |
|---|---|---|---|
| V1 | 분리 (confirmUnassign) | acl (accent) | 분리 |
| V2 | 폐기 (confirmDispose) | danger | 폐기 |
| V3 | 삭제 (confirmDelete) | danger | 삭제 (영구) |
| V4 | 스왑 (swapTarget) | acl | 스왑 |
| V5 | 처리 중 (loading=true 폐기) | danger + opacity 0.7 | 처리 중… |

## 핵심 변형 — primaryStyle 2 톤

- **acl** (가역 액션: 분리/스왑) — `--accent` + `--accent-fg`
- **danger** (불가역 / 데이터 변경: 폐기/삭제) — `--status-danger-bar` + `--accent-fg`

## ConfirmModal 차별 요소

- 모달 maxWidth **320** (다른 모달 360 보다 작음 — 짧은 텍스트에 맞는 dialog 크기)
- 타이틀-body 간 margin 10 (다른 모달 16 보다 짧음)
- body fontSize 13 / line-height 1.6 — 가독성 우선

## 9 verify gate (모두 PASS)

```
G1 viewport (≥5)             : 5 PASS
G2 surface-overlay           : 1 PASS
G3 radius-lg                 : 5 PASS
G4 accent primary (acl)      : 2 PASS
G5 status-danger-bar primary : 3 PASS
G6 옛 alias                  : 0 PASS
G7 linear-gradient           : 0 PASS
G8 raw hex/rgba              : 0 PASS
G9 emoji/shadow/blur         : 0 PASS
```

## 비즈니스 로직 보존

- ConfirmModalProps 전체 (title / body / primaryLabel / primaryStyle / onConfirm / onCancel / loading)
- 4 mutation isPending 분기 (unassign / dispose / remove / swap)
- body 동적 텍스트 (cp_location ?? zoneLabelKo(cp_zone))

## 다음 wave 후보

- wave 6: **skeleton / 빈 상태 / 에러 상태** (l.487-557 카드 grid 안 3 상태)
- 모든 sketch wave 완료 후 → **TSX 변환 wave** (별도 quick, 전체 매핑)

## 파일 변경 요약

```
A  cha-bio-safety/docs/redesign-context/09-extinguishers/sketch/confirm-modal-sketch.html  (209 lines)
A  .planning/quick/260517-e9k-redesign-09-extinguishers-confirm-modal-sketch/260517-e9k-PLAN.md
A  .planning/quick/260517-e9k-redesign-09-extinguishers-confirm-modal-sketch/260517-e9k-SUMMARY.md
```
