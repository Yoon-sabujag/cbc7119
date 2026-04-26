---
phase: 260426-jeh-qr-ultra-wide
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages/QRScanPage.tsx
autonomous: false
requirements:
  - QR-UW-01
tags:
  - qr
  - camera
  - ios
  - html5-qrcode

must_haves:
  truths:
    - "iPhone(13 Pro 이상)에서 QR 스캔 페이지를 열면 자동으로 후면 초광각(0.5x Ultra Wide) 카메라가 선택된다"
    - "안드로이드/PC/구형 아이폰처럼 초광각 라벨이 없는 기기에서는 기존 동작과 동일하게 facingMode: 'environment' 후면 카메라가 사용된다"
    - "iOS 사파리에서 카메라 권한 첫 요청 시 라벨이 비어 있어도 권한 부여 직후 다시 조회해 초광각을 찾을 수 있다"
    - "카메라 권한 거부 / 카메라 시작 실패 시 기존 camError 메시지와 수동 입력 경로가 그대로 동작한다"
    - "scannedRef / stopCamera / lookupCheckpoint 등 기존 스캔 흐름이 변경되지 않는다"
  artifacts:
    - path: "src/pages/QRScanPage.tsx"
      provides: "Ultra Wide 카메라 자동 선택 로직이 포함된 startCamera 함수"
      contains: "Html5Qrcode.getCameras"
  key_links:
    - from: "QRScanPage.startCamera"
      to: "Html5Qrcode.getCameras() + Html5Qrcode.start({ deviceId: { exact } })"
      via: "라벨 정규식 매칭 (/ultra[\\s-]?wide|초광각|울트라/i)"
      pattern: "ultra.?wide|초광각|울트라"
    - from: "QRScanPage.startCamera (fallback)"
      to: "Html5Qrcode.start({ facingMode: 'environment' })"
      via: "초광각 미발견 시 기존 제약으로 폴백"
      pattern: "facingMode:\\s*'environment'"
---

<objective>
QR 스캔 페이지에서 아이폰 초광각(0.5x Ultra Wide) 후면 카메라를 자동 선택하도록 startCamera 함수를 수정한다.

Purpose: 작은 QR 스티커(체크포인트 라벨)를 아이폰 일반 광각 1x 카메라로 가까이서 스캔하면 최소 초점거리(약 10–15cm) 미만이라 초점이 흐려 인식이 잘 안 된다. iOS 카메라 앱이 매크로 거리에서 자동으로 초광각으로 전환하는 동작은 웹 getUserMedia에는 없으므로, 라벨 매칭으로 직접 deviceId를 지정해 초광각을 강제 선택한다.

Output: 수정된 src/pages/QRScanPage.tsx (startCamera 함수만). 다른 컴포넌트, UI, 타입, API 무변경.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@src/pages/QRScanPage.tsx

<interfaces>
<!-- html5-qrcode 2.3.8 의 관련 정적/인스턴스 메서드. 코드 직접 사용 시 참조용. -->

```typescript
// from html5-qrcode (이미 import 되어 있음)
class Html5Qrcode {
  static getCameras(): Promise<{ id: string; label: string }[]>;
  constructor(elementId: string);
  start(
    cameraIdOrConfig: string | MediaTrackConstraints,
    config: { fps: number; qrbox: { width: number; height: number } | number; aspectRatio?: number },
    qrCodeSuccessCallback: (decodedText: string) => void,
    qrCodeErrorCallback?: (errorMessage: string) => void
  ): Promise<void>;
  stop(): Promise<void>;
  clear(): void;
}

// 카메라 ID 타깃팅용 MediaTrackConstraints
type CameraTarget =
  | { deviceId: { exact: string } }
  | { facingMode: 'environment' };
```
</interfaces>

**현행 startCamera 핵심 (QRScanPage.tsx 91–121):**
- `new Html5Qrcode(QR_REGION_ID)` 생성 후
- 첫 인자로 `{ facingMode: 'environment' }` 만 넘김 → iOS는 항상 1x 메인 광각이 선택됨
- 권한/시작 실패 시 `setCamError(...)` 처리

**유지해야 하는 동작:**
- `scannerRef.current` 재생성 전 기존 인스턴스 stop/clear
- `scannedRef.current` 초기화
- `setScanning(true)` 호출
- 권한/실패 catch 블록의 한국어 안내 메시지 그대로
- onDecode 콜백 (`scannedRef`, `stopCamera`, `lookupCheckpoint`) 무수정
- onFailure 콜백 (스캔 실패 무시) 무수정
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: startCamera에 Ultra Wide 자동 선택 로직 추가</name>
  <files>src/pages/QRScanPage.tsx</files>
  <behavior>
    - iPhone (라벨에 "Back Ultra Wide Camera" / "후면 초광각 카메라" 포함) → 초광각 deviceId 로 start
    - Android/PC/라벨 없음 → 기존 facingMode: 'environment' 로 start (폴백)
    - iOS Safari 첫 호출 시 getCameras() 가 빈 라벨/throw → getUserMedia({ video: { facingMode:'environment' }}) 로 권한 프라임 후 트랙 즉시 stop, getCameras 1회 재시도
    - 권한 프라임도 실패 → 폴백 분기로 진행 (기존 catch 가 카메라 시작 실패를 처리)
    - 기존 camError 메시지, scannedRef, setScanning, stopCamera 흐름 무변경
  </behavior>
  <action>
    src/pages/QRScanPage.tsx 의 `startCamera` 함수(91–121행)만 수정한다. 다른 함수, JSX, import, 타입은 건드리지 않는다.

    구체적 변경:

    1. `try {` 블록 시작 직후, `new Html5Qrcode(QR_REGION_ID)` 생성 **앞**에 Ultra Wide 탐지 헬퍼 로직을 인라인으로 추가한다. 별도 파일/유틸 만들지 말 것 — 단일 함수 변경이라는 원칙 유지.

    2. 탐지 알고리즘 (정확히 이대로):
       ```ts
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
       ```

    3. 그 다음 기존 `new Html5Qrcode(QR_REGION_ID)` 줄과 `scannerRef.current.start(...)` 호출은 유지하되, 첫 인자만 다음과 같이 분기한다:
       ```ts
       scannerRef.current = new Html5Qrcode(QR_REGION_ID)
       await scannerRef.current.start(
         ultraWide ? { deviceId: { exact: ultraWide.id } } : { facingMode: 'environment' },
         { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 },
         async (decodedText) => {
           if (scannedRef.current) return
           scannedRef.current = true
           await stopCamera()
           await lookupCheckpoint(decodedText)
         },
         () => { /* 스캔 실패 무시 */ }
       )
       setScanning(true)
       ```

    4. `catch (e: any) { ... }` 블록은 그대로 둔다 — 권한 거부 / 일반 시작 실패 안내 메시지 변경 없음.

    5. 함수 외부(다른 함수, JSX, import)는 절대 수정하지 말 것. `Html5Qrcode` 는 이미 import 되어 있다 (3행).

    피해야 할 패턴 / 이유:
    - 새로운 useState / useRef 추가 금지 (UI 표시 없음, 1회 자동 선택만 필요)
    - `navigator.mediaDevices.enumerateDevices()` 사용 금지 (html5-qrcode 가 이미 동등한 추상화 제공 — 일관성)
    - 정규식에 `back` 추가 금지 (라벨에 "Back" 만 있고 "Ultra Wide" 없는 경우는 일반 광각이므로 매칭하면 안 됨)
    - 매칭 후 `start` 실패 시 폴백 재시도 루프 추가 금지 (현재 catch 흐름이 사용자에게 수동 입력 안내. 복잡도만 증가)
    - 디자인/레이아웃/JSX 수정 금지 (사용자 메모리: 디자인 변경 전 상의 필수)
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && npx tsc --noEmit</automated>
  </verify>
  <done>
    - `startCamera` 안에 `Html5Qrcode.getCameras()` 호출 1회 이상, 권한 프라임을 위한 `navigator.mediaDevices.getUserMedia` 호출 1회 존재
    - `start()` 첫 인자가 `ultraWide ? { deviceId: { exact: ultraWide.id } } : { facingMode: 'environment' }` 삼항식
    - 라벨 정규식 `/ultra[\s-]?wide|초광각|울트라/i` 가 코드에 그대로 존재
    - tsc 타입 체크 통과 (no errors)
    - 다른 함수(stopCamera, lookupCheckpoint, handleSubmit, handleRescan, handleManualSearch, 마운트 useEffect, JSX) 의 코드 한 줄도 변경되지 않음 (`git diff src/pages/QRScanPage.tsx` 가 startCamera 범위에만 변경 표시)
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: iPhone 실기기 초광각 자동 선택 동작 확인</name>
  <what-built>
    QRScanPage 의 startCamera 가 카메라 라벨을 조회해 "Back Ultra Wide Camera" / "후면 초광각 카메라" 가 발견되면 해당 카메라를 자동 선택하도록 수정됨. 미발견 시(안드로이드/PC/구형 아이폰) 기존 facingMode: 'environment' 동작 유지.
  </what-built>
  <how-to-verify>
    배포 후 검증 (사용자 메모리: 로컬 서버 X, 항상 프로덕션 배포 후 테스트, --branch production 필수):

    1. `npm run build` 후 `npx wrangler pages deploy dist --branch production --commit-message "qr ultra wide auto select"` 로 프로덕션 배포
       (한글 커밋 메시지 거부 이슈 → ASCII 사용)
    2. 아이폰(iPhone 13 Pro 이상)에서 PWA 강제 새로고침 또는 앱 재설치 (PWA 캐시 SW 무력화)
    3. QR 스캔 페이지 진입 → 카메라 권한 허용
    4. **확인 포인트 A — 시야각 광각 효과:**
       - 화면이 일반 1x 보다 눈에 띄게 넓게 보임 (책상/벽 더 많이 잡힘)
       - 폰을 QR 스티커에서 5–10cm 거리까지 가까이 가져가도 초점이 흐려지지 않고 인식됨
    5. **확인 포인트 B — 폴백 (선택):**
       - 같은 코드를 안드로이드 또는 PC 크롬으로 열었을 때 카메라가 정상 시작되고 QR 인식 동작
    6. **확인 포인트 C — 권한 거부 회귀:**
       - 카메라 권한 거부 시 기존 한국어 안내 ("카메라 권한이 필요합니다…") 그대로 표시
    7. **확인 포인트 D — 인식 흐름 회귀:**
       - QR 인식 후 체크포인트 조회 → /inspection 으로 이동, "QR 코드를 찾을 수 없습니다" 시 카메라 재시작 모두 정상

    문제 발생 시 보고할 정보:
    - 사용 기기 모델 / iOS 버전
    - 카메라 화면이 1x 인지 0.5x 인지 (시야각으로 판단)
    - 콘솔에 보이는 에러 메시지 (Safari 원격 디버깅)
  </how-to-verify>
  <resume-signal>
    "approved" 또는 문제점 설명 (예: "여전히 1x 광각으로 보임", "안드로이드에서 카메라 시작 실패" 등)
  </resume-signal>
</task>

</tasks>

<verification>
- TypeScript 타입 검사 통과 (`npx tsc --noEmit`)
- `git diff src/pages/QRScanPage.tsx` 변경 범위가 startCamera 함수 내부로 한정됨
- 사용자 실기기 검증(Task 2) 통과
</verification>

<success_criteria>
- iPhone 13 Pro 이상에서 QR 스캔 페이지가 자동으로 0.5x 초광각 카메라를 사용 (광각 시야 + 가까운 거리 초점)
- iPhone 외 기기에서 기존 동작 유지 (facingMode: 'environment' 폴백)
- 권한 거부 / 카메라 시작 실패 / QR 미발견 / 점검 페이지 이동 등 기존 모든 분기가 회귀 없이 동작
- 사용자(윤종엽)가 5월 법정점검 실전 사용에서 QR 인식 속도/정확도 개선 체감
</success_criteria>

<output>
After completion, create `.planning/quick/260426-jeh-qr-ultra-wide/260426-jeh-SUMMARY.md` documenting:
- 변경된 코드 블록 (before / after diff 핵심)
- 실기기 검증 결과 (사용 기기 모델, 시야각 변화 여부)
- 안드로이드/PC 폴백 회귀 확인 여부
- 향후 메모: html5-qrcode 가 deviceId 미지원 환경에서 보이는 거동, 라벨 i18n 케이스(예: 다른 언어 OS) 추가 패턴 필요 시 정규식 확장 위치
</output>
