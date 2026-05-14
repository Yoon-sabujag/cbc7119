---
phase: 260514-pnr-wave-1-fix-photobutton-revisitpopup-acce
plan: 01
status: complete
type: execute
wave: 1-fix
autonomous: true
requirements:
  - REDESIGN-02-INSPECTION-TSX-WAVE1-FIX
tags:
  - redesign
  - inspection
  - fix
  - lucide-icons
  - design-tokens-v0.1.1
---

# Wave 1 외부 컴포넌트 3종 fix — SUMMARY

## 발견 경로

Wave 1 본체 (`260514-i4r`) 의 Task 4 (사용자 시각 검증) 에서 사용자가 production `/inspection` 직접 확인 → 일반 InspectionModal 안의 사진 첨부 버튼 아이콘 + Revisit/AccessBlocked 팝업 아이콘이 옛 이모지 그대로임을 발견.

원인: 260514-i4r 가 `InspectionPage.tsx` 단일 파일만 다뤘는데, 이 3 컴포넌트가 `src/components/` 별도 파일이라 변환 영역 밖에 있었음. 5xl(dashboard) 전례의 "공통 UI 컴포넌트 내부 수정 금지" 룰을 그대로 적용한 게 누락 원인.

## 적용 fix

| 파일 | 옛 | 새 |
|---|---|---|
| `PhotoButton.tsx` | `<span>📷</span>` | `<Camera size={22} />` |
| `InspectionRevisitPopup.tsx` | `<div>⚠️</div>` (variant 공통) | `<CheckCircle2 size={32} color="status-safe" />` (completed) / `<Flame size={32} color="status-fire" />` (pending-action) |
| `AccessBlockedPopup.tsx` | `<div>🚫</div>` | `<ShieldAlert size={32} color="status-warning" />` |

토큰도 같이 v0.1.1 화:

| 옛 | 새 |
|---|---|
| `var(--bg2)` | `var(--surface-raised)` |
| `var(--bd)` | `var(--border-default)` |
| `var(--bd2)` | `var(--border-strong)` |
| `var(--acl)` | `var(--accent)` |
| `var(--t1)` | `var(--text-primary)` |
| `var(--t2)` | `var(--text-secondary)` |
| `var(--t3)` | `var(--text-tertiary)` |
| `var(--danger)` | `var(--status-danger)` |
| `fontSize:11` | `fontSize:12` (PhotoButton 라벨, 노안 12px+ 룰) |

## 시안 권위 spec 매핑

- `inspection-sketch-main.html` 1901: `<i data-lucide="check-circle-2" color="var(--status-safe)">` ✓
- `inspection-sketch-main.html` 1924: `<i data-lucide="flame" color="var(--status-fire)">` ✓
- `inspection-sketch-main.html` 1969: `<i data-lucide="shield-alert" color="var(--status-warning)">` ✓
- `inspection-sketch-misc-modals.html` 166-177: `.photo-btn` 72×72 + lucide camera 22×22 ✓

## 비즈니스 로직 보존

- **PhotoButton**: input refs / accept / capture / onChange / PhotoSourceModal / photoPreview / removePhoto / uploading / hook.openPicker 흐름 0 변경. props 시그니처 (`hook`, `label?`, `noCapture?`) 그대로.
- **InspectionRevisitPopup**: variant 분기 / fmtDateTime / KST 보정 / 메시지 문자열 / onClose / onGoToRemediation / recordId guard 0 변경. RevisitVariant 타입 export 그대로.
- **AccessBlockedPopup**: onConfirm 시그니처 / 메시지 문자열 0 변경.

## verify gate

| 항목 | 결과 |
|---|---|
| 옛 이모지 (📷/⚠️/🚫) 잔존 | 0건 ✓ |
| 옛 토큰 (--bg2/--bd/--acl/--t[123]/--danger) 잔존 | 0건 ✓ |
| 9/10/11px 폰트 사이즈 | 0건 ✓ |
| `tsc --noEmit` (npm run build 안) | 0 에러 ✓ |
| `npm run build` | ✓ built in 168ms |
| files changed | 3 파일 +22 / -15 |

## 영향 범위

- `PhotoButton` — `InspectionPage.tsx` 내 9곳 모두 새 디자인 적용 (전용 컴포넌트라 다른 페이지 영향 없음)
- `InspectionRevisitPopup` — `InspectionPage.tsx` 6곳 모두 새 디자인
- `AccessBlockedPopup` — `InspectionPage.tsx` + `FloorPlanPage.tsx` 양쪽 모두 새 디자인 (사용자 컨펌된 통일)

## commits

```
<hash> feat(260514-pnr): Wave 1 외부 컴포넌트 3종 lucide 아이콘 + v0.1.1 토큰 통일
```

## next

- Wave 1 본체 (i4r) + 이 fix (pnr) 가 사용자 시각 검증 통과한 것으로 간주
- Wave 2 (5 증상 피커) 후속 quick 발주 가능
- 이번 fix 후 Wave 1 영역 인라인 style 잔존 키 (gridTemplateRows / animation / 토큰화 불가 alpha) 외에는 모두 v0.1.1 토큰 + lucide 통일
