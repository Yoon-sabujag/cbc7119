---
quick_id: 260428-hbh
type: execute
status: complete
wave: 1
completed: "2026-04-28T03:34:35Z"
duration_minutes: 2
commits:
  - 3a231a5
files:
  modified:
    - src/App.tsx
    - src/pages/QRScanPage.tsx
  created: []
  deleted: []
metrics:
  lines_added: 55
  lines_removed: 241
  net_change: -186
verification: build_pass + 9_grep_checks_pass
---

# Quick 260428-hbh: QRScanPage 데드 코드 제거 + GlobalHeader 통합 Summary

## One-liner

QRScanPage stage 머신을 5단계('scan'|'manual'|'found'|'form'|'done')에서 도달 가능한 2단계('scan'|'manual')로 좁히고, 페이지 자체 `<header>`를 제거해 GlobalHeader 단일 헤더로 통일. 토글 버튼(수동입력/카메라)은 createPortal로 GlobalHeader 우측 슬롯에 렌더.

## Why

- 기존 코드에서 `lookupCheckpoint`가 cp 발견 시 즉시 `navigate('/inspection', { state: { qrCheckpoint: cp } })`로 떠나기 때문에 found/form/done 경로는 사실상 도달 불가능한 데드 코드였음
- 페이지 자체 `<header>`와 GlobalHeader가 함께 떠서 이중 헤더 상태였음
- 다른 페이지와 동일한 단일 헤더 구조로 통일해 유지보수 부담을 줄이고 UI 일관성을 확보

## What changed

### src/pages/QRScanPage.tsx (slim 재작성)

- `Stage` 타입을 `'scan' | 'manual'`로 좁힘
- 페이지 자체 `<header>` JSX 블록 제거 (line 222-251)
- `found` / `form` / `done` 렌더 블록 전부 제거 (line 322-451)
- 미사용 항목 제거:
  - import: `inspectionApi`, `CheckResult` 타입
  - 상수: `RESULT_OPTIONS`, `ZONE_LABEL`, `iconBtnSt`
  - state: `checkpoint`/`setCheckpoint`, `result`/`setResult`, `memo`/`setMemo`, `submitting`/`setSubmitting`
  - 함수: `handleSubmit`, `handleRescan`
  - `useAuthStore`의 `staff` destructure (handleSubmit에서만 사용했음)
- `createPortal` 추가:
  - `import { createPortal } from 'react-dom'`
  - `headerSlot` state + useEffect로 `#qr-header-portal-slot` 조회 (RAF 폴백 포함, StrictMode 호환)
  - stage에 따른 토글 버튼(`수동입력` ↔ `카메라`)을 portal로 GlobalHeader 우측에 렌더
- 유지된 핵심 로직:
  - `startCamera` / `stopCamera` 전체
  - Ultra Wide 카메라 자동 선택 + 권한 프라임 + zoom 0.5x 안전망
  - `useEffect(() => { startCamera(); return () => stopCamera() }, [])` 마운트/언마운트 cleanup (햄버거 메뉴 이탈 시 카메라 누수 방지)
  - `lookupCheckpoint` cpError 후 `startCamera()` 자동 재시작 (별도 rescan 트리거 불필요)

### src/App.tsx (portal 슬롯 추가)

- `isQrScan` 플래그 추가: `location.pathname === '/inspection/qr'`
- 모바일 GlobalHeader `rightSlot`을 3-way 삼항으로 분기:
  - `isDashboard` → 기존 `<div>{dashboardRightSlot}{settingsGearBtn}</div>` (변경 없음)
  - `isQrScan` → `<div><div id="qr-header-portal-slot" />{settingsGearBtn}</div>` (settings 톱니 좌측에 portal 컨테이너)
  - 그 외 → 기존 `settingsGearBtn` (변경 없음)
- `PAGE_TITLES`, `MOBILE_NO_NAV_PATHS`, `DESKTOP_NO_NAV_PATHS`, 데스크톱 헤더, 라우팅 등은 일절 손대지 않음

## Verification

### Build

```
npm run build → ✓ built in 10.58s + sw.mjs in 160ms
TypeScript 에러 0건
```

### Grep checks (9/9 PASS)

| # | Pattern | Expected | Actual |
|---|---------|----------|--------|
| 1 | `RESULT_OPTIONS\|ZONE_LABEL\|handleSubmit\|setCheckpoint\|setResult\b\|setMemo\|setSubmitting` (QRScanPage) | 0 | 0 |
| 2 | `stage === 'found'\|stage === 'form'\|stage === 'done'` (QRScanPage) | 0 | 0 |
| 3 | `type Stage` (QRScanPage) | `'scan' \| 'manual'`만 | line 9: `type Stage = 'scan' \| 'manual'` |
| 4 | `qr-header-portal-slot` (App.tsx) | ≥1 | line 171 (1건) |
| 5 | `createPortal` (QRScanPage) | ≥1 | line 2 (import), line 192 (사용) |
| 6 | `<header` (QRScanPage) | 0 | 0 |
| 7 | `inspectionApi` (QRScanPage) | 0 | 0 |
| 8 | `CheckResult` (QRScanPage) | 0 | 0 |
| 9 | `iconBtnSt` (QRScanPage) | 0 | 0 |

### Side-effect audit

- SideMenu MENU 라벨: 변경 없음
- App.tsx PAGE_TITLES: 변경 없음 (`'/inspection/qr': 'QR 스캔'` 그대로)
- App.tsx MOBILE_NO_NAV_PATHS: 변경 없음 (`/inspection/qr`은 여전히 비포함 → GlobalHeader 노출)
- 다른 페이지 GlobalHeader rightSlot 동작: 그대로 유지 (isDashboard 분기 + 기본 settingsGearBtn 분기 모두 보존)
- 데스크톱 simple 헤더 (line 178-197): 변경 없음 (portal 슬롯 div는 모바일 GlobalHeader 내부에만 존재 → 데스크톱에서는 `headerSlot`이 null로 유지되어 `createPortal` 호출 안 됨, 토글 버튼 미표시. 페이지 본문은 정상 동작. 데스크톱 토글 버튼 UI는 별도 task로 보강 가능)

## Deviations from Plan

None — 플랜 그대로 실행. 카메라 cleanup, Ultra Wide, zoom 0.5x 등 기존 보강 로직 모두 보존.

## Stats

- 2 files modified
- +55 / -241 (net -186)
- 1 atomic commit (3a231a5)
- Duration: 약 2분

## Self-Check: PASSED

- File `src/App.tsx` exists with `qr-header-portal-slot` at line 171 — FOUND
- File `src/pages/QRScanPage.tsx` exists with `createPortal` at line 192 — FOUND
- Commit `3a231a5` exists in `git log` — FOUND
- `npm run build` 성공, TypeScript 에러 0건 — VERIFIED
- 9/9 grep verifications passed — VERIFIED
- 의도하지 않은 파일 삭제 없음 — VERIFIED
