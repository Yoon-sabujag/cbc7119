---
status: complete
phase: 260426-jeh-qr-ultra-wide
plan: 01
subsystem: qr-scan
tags:
  - qr
  - camera
  - ios
  - html5-qrcode
requires: []
provides:
  - "QR-UW-01: iPhone QR 스캔이 후면 초광각 카메라를 자동 선택"
affects:
  - src/pages/QRScanPage.tsx
tech-stack:
  added: []
  patterns:
    - "html5-qrcode Html5Qrcode.getCameras() 라벨 매칭 → deviceId 강제 지정"
    - "iOS Safari 권한 프라이밍: getUserMedia → 트랙 stop → getCameras 재시도"
key-files:
  created: []
  modified:
    - src/pages/QRScanPage.tsx
decisions:
  - "정규식 /ultra[\\s-]?wide|초광각|울트라/i 만 매칭 — 'back' 단독 라벨은 일반 광각이라 의도적으로 제외"
  - "별도 hook/util 추출하지 않고 startCamera 내부 인라인 — 단일 함수 변경 원칙 유지"
  - "navigator.mediaDevices.enumerateDevices 대신 Html5Qrcode.getCameras 사용 — 라이브러리 추상화 일관성"
metrics:
  duration_seconds: 58
  completed: 2026-04-26
  tasks_completed: "1/2 (Task 2 = 사용자 실기기 검증, 본 실행에서는 deferred-to-user)"
  files_modified: 1
requirements:
  - QR-UW-01
---

# Phase 260426-jeh Plan 01: QR Ultra Wide Auto-select Summary

QR 스캔 페이지가 iPhone 후면 초광각(0.5x Ultra Wide) 카메라를 자동 선택하도록 `startCamera` 를 수정. 매크로 거리(QR 스티커 5–10 cm)에서 1x 광각 최소 초점거리 미만으로 인해 인식이 실패하던 문제 해결을 목표로 함.

## What Changed

`src/pages/QRScanPage.tsx` — `startCamera` 함수만 수정 (24행 추가, 1행 변경). 다른 함수/JSX/import 무수정.

### Before / After Diff (핵심)

**Before (lines 100–103):**
```ts
try {
  scannerRef.current = new Html5Qrcode(QR_REGION_ID)
  await scannerRef.current.start(
    { facingMode: 'environment' },
    ...
```

**After:**
```ts
try {
  // ── Ultra Wide 카메라 자동 선택 (주로 iPhone 13 Pro 이상) ──
  let cameras: { id: string; label: string }[] = []
  try {
    cameras = await Html5Qrcode.getCameras()
  } catch {
    // iOS Safari: 권한 부여 전이면 throw — 아래에서 프라임 시도
  }
  // 라벨이 비었거나 모두 generic 이면 권한 프라임 후 재조회
  if (cameras.length === 0 || cameras.every(c => !c.label)) {
    try {
      const primeStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      primeStream.getTracks().forEach(t => t.stop())
      cameras = await Html5Qrcode.getCameras()
    } catch {
      // 권한 거부 / 미지원 — 폴백 분기로 진행
    }
  }
  const ultraWide = cameras.find(c =>
    /ultra[\s-]?wide|초광각|울트라/i.test(c.label || '')
  )

  scannerRef.current = new Html5Qrcode(QR_REGION_ID)
  await scannerRef.current.start(
    ultraWide ? { deviceId: { exact: ultraWide.id } } : { facingMode: 'environment' },
    ...
```

### 동작 분기

| 환경 | 카메라 라벨 | 결과 |
| --- | --- | --- |
| iPhone 13 Pro+ (영문 OS) | "Back Ultra Wide Camera" | `deviceId: { exact: <ultraWideId> }` 로 시작 |
| iPhone 13 Pro+ (한글 OS) | "후면 초광각 카메라" | 동일 |
| iPhone 일반 (광각만) / Android / PC | 라벨 없음 또는 매칭 안됨 | `facingMode: 'environment'` 폴백 (기존과 동일) |
| iOS Safari 권한 부여 전 첫 호출 | `getCameras()` throw 또는 빈 라벨 | `getUserMedia` 로 프라이밍 후 재조회 |
| 카메라 권한 거부 | 프라임도 throw | 폴백 분기 → 기존 catch 블록의 한국어 안내 (`'카메라 권한이 필요합니다…'`) 그대로 |

## Tasks

| # | Name | Status | Commit |
| --- | --- | --- | --- |
| 1 | startCamera 에 Ultra Wide 자동 선택 로직 추가 | done | `9ceaa49` |
| 2 | iPhone 실기기 초광각 자동 선택 동작 확인 | **deferred-to-user** (실기기 + 프로덕션 배포 필요) | — |

## Verification

- `npx tsc --noEmit` 통과 (no errors)
- `git diff src/pages/QRScanPage.tsx` 변경 범위가 `startCamera` 함수의 try 블록 시작부 ~ `start()` 첫 인자만으로 한정됨 확인
- 다른 함수(`stopCamera`, `lookupCheckpoint`, `handleSubmit`, `handleRescan`, `handleManualSearch`, 마운트 useEffect, JSX) 한 줄도 변경 없음
- Plan 의 done 조건 모두 충족:
  - `Html5Qrcode.getCameras()` 호출 2회 (초기 + 프라임 후 재시도)
  - `navigator.mediaDevices.getUserMedia` 호출 1회 (프라이밍)
  - `start()` 첫 인자 = `ultraWide ? { deviceId: { exact: ultraWide.id } } : { facingMode: 'environment' }` 삼항식
  - 라벨 정규식 `/ultra[\s-]?wide|초광각|울트라/i` 코드 그대로 존재

## Deferred / Pending

### Task 2 (사용자 실기기 검증)

본 실행은 코드 변경 + 타입 체크까지만 수행. 다음 단계는 **사용자(윤종엽)** 가 직접 진행:

1. `npm run build`
2. `npx wrangler pages deploy dist --branch production --commit-message "qr ultra wide auto select"`
   - `--branch production` 안 붙이면 Preview 로 감 (메모리 참조)
   - 한글 커밋 메시지 거부 이슈 → 위처럼 ASCII 사용
3. iPhone 13 Pro+ 에서 PWA 강제 새로고침 또는 앱 재설치 (PWA SW 캐시 무력화)
4. QR 스캔 페이지 진입 → 카메라 권한 허용
5. 확인 포인트:
   - **A. 시야각 광각 효과** — 화면이 일반 1x 보다 눈에 띄게 넓게 보이고 5–10 cm 거리에서도 초점 유지/QR 인식
   - **B. 폴백** — 안드로이드/PC 크롬에서 카메라 정상 시작 + QR 인식
   - **C. 권한 거부 회귀** — 거부 시 기존 한국어 안내 그대로
   - **D. 인식 흐름 회귀** — QR 인식 후 `/inspection` 이동, "찾을 수 없습니다" 시 카메라 재시작 정상

문제 발생 시 보고 항목: 사용 기기 모델 / iOS 버전 / 시야각 (1x vs 0.5x) / Safari 원격 디버깅 콘솔 에러.

## Deviations from Plan

None — 플랜 그대로 실행됨. 단일 함수 인라인 변경, 새 hook/util/state 미추가, JSX 무수정.

## Future Notes

- **deviceId 미지원 환경 거동:** html5-qrcode 가 `{ deviceId: { exact: <id> } }` 를 받으면 내부적으로 `getUserMedia({ video: { deviceId: { exact: <id> } } })` 로 매핑. 해당 deviceId 가 더 이상 유효하지 않으면 (사용자가 권한 회수 후 재부여) `OverconstrainedError` 발생 가능 — 현재는 `catch` 가 일반 시작 실패 안내로 처리. 향후 라이트해진 회복 흐름이 필요하면 그 catch 안에서 ultraWide 를 잊고 facingMode 폴백으로 한 번 재시도하는 로직 추가 위치는 동일 함수의 catch 블록.
- **라벨 i18n 확장:** 정규식이 영어/한국어 두 케이스만 다룸. 일본어 OS("超広角") / 중국어("超广角") / 독일어 등 추가 환경에서 검증 필요해질 경우, 동일 라인의 정규식만 확장 (예: `/ultra[\s-]?wide|초광각|울트라|超広角|超广角/i`). 별도 함수로 추출하지 않은 이유: 1회성 매칭이며 호출 위치도 한 곳뿐.
- **5월 법정점검 실전 활용:** 운영 관찰 모드 정책상 새 기능 추가 금지지만 본 변경은 기존 QR 스캔 신뢰도 개선이며 실전 검증 1순위 시즌과 정확히 맞물림. 실전에서 "여전히 1x 광각으로 보임" 이라는 피드백이 나오면 라벨 디버깅용 `console.log(cameras.map(c => c.label))` 한 줄 임시 추가가 가장 빠른 분기점.

## Self-Check: PASSED

- File modified exists: `src/pages/QRScanPage.tsx` — FOUND
- Commit `9ceaa49` exists in git log — FOUND
- TypeScript check passed — confirmed
- No unintended file deletions — confirmed (`git diff --diff-filter=D HEAD~1 HEAD` empty)
