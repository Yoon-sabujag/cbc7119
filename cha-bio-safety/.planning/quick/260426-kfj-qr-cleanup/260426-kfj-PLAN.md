---
phase: 260426-kfj-qr-cleanup
plan: 01
type: execute
wave: 1
depends_on:
  - 260426-jzp-qr-zoom-0-5x
files_modified:
  - src/pages/QRScanPage.tsx
autonomous: true
tags:
  - qr
  - cleanup
  - debug-ui-removal
---

# 260426-kfj: QR 진단 UI 제거 (260426-jzp 디버그 완료 후 정리)

## Objective

직전 두 quick (260426-jeh / 260426-jzp) 의 결과로 iPhone 16 Pro/iOS 26.4.1 에서 시작부터 광각 + 빠른 초점이 동작함을 사용자가 검증함. 디버그 목적으로 추가했던 화면 진단 텍스트를 제거하고 안전망 코드만 유지한다.

## Tasks

### Task 1 — 진단 UI 일괄 삭제

`grep -n "260426-jzp" src/pages/QRScanPage.tsx` 마커 위치 3곳에서:

1. `diag` useState 블록 삭제 (~37–43줄)
2. `startCamera` 내부 zoom 적용 후의 setDiag/zoomResult/capsRange 변수 + 진단 추적 로직 단순화 → 안전망 형태(try/catch silently 무시)만 유지
3. `stage === 'scan'` JSX 의 🐞 진단 div 블록 삭제

### 유지

- 260426-jeh 의 `Html5Qrcode.getCameras()` + 라벨 매칭(`/ultra[\s-]?wide|초광각|울트라/i`) + permission prime
- 260426-jzp 의 `track.applyConstraints({ advanced: [{ zoom: 0.5 }] })` 안전망 (간소화 형태)

### Verification

- `grep -n "260426-jzp\|🐞\|setDiag\|diag\." src/pages/QRScanPage.tsx` → 0건
- `npx tsc --noEmit` → PASS

## User-verified outcome (260426-jzp 결과)

| 진단 항목 | 값 |
|---|---|
| cams | 전면 카메라, 후면 트리플 카메라, 후면 듀얼 와이드 카메라, **후면 울트라 와이드 카메라**, 후면 듀얼 카메라, 후면 카메라, 후면 망원 카메라 |
| pick | 후면 울트라 와이드 카메라 (정규식 `울트라` 매칭 성공) |
| zoom | 1x ✓ (caps: 1–10x) — 이미 ultra wide 카메라이므로 1x 가 가장 광각 |
| 시야 | 광각 (이전 1x 메인 대비) |
| 초점 | 5cm 근접도 즉시 잡힘. 첫 흐림 단계 사라짐 |
