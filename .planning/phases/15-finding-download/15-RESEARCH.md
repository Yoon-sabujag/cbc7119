# Phase 15: Finding Download - Research

**Researched:** 2026-04-06
**Domain:** Client-side download (HTML new tab + fflate ZIP) for legal inspection findings; iOS PWA share-sheet pattern
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 건별 다운로드 버튼을 LegalFindingDetailPage 헤더에 배치
- **D-02:** HTML 페이지를 새 탭(window.open)으로 열어 인쇄/PDF 저장 방식 — 메타데이터(항목, 위치, 상태, 날짜, 담당자) + base64 인코딩된 사진 포함
- **D-03:** 관리자(admin)만 다운로드 버튼 표시 (보고서 작성 용도)
- **D-04:** LegalFindingsPage 라운드 목록에서 일괄 다운로드 버튼 배치 (관리자만)
- **D-05:** fflate.zipSync 클라이언트사이드 ZIP — 기존 ReportsPage 패턴 재활용
- **D-06:** ZIP 내부 구조: 컨텍스트 명명 폴더 — `finding-001_위치/지적사진-1.jpg`, `finding-001_위치/조치사진-1.jpg`, `finding-001_위치/내용.txt`
- **D-07:** 각 finding의 메타데이터(항목, 위치, 상태, 지적내용, 조치내용, 날짜)를 `내용.txt`에 포함
- **D-08:** `<a download>` 사용 금지 — iOS PWA에서 무시됨 (WebKit bug 167341)
- **D-09:** 건별: window.open()으로 HTML 페이지 새 탭 열기 → 사용자가 공유시트로 저장
- **D-10:** 일괄: ZIP blob을 window.open()으로 열기 — iOS에서 공유시트 표시됨
- **D-11:** isStandalone() + isIOS() 감지 (InstallPrompt.tsx에서 이미 구현됨) 활용
- **D-12:** 관리자(admin)만 건별/일괄 다운로드 가능 — `staff?.role === 'admin'` 체크

### Claude's Discretion
- HTML 보고서 페이지 레이아웃/스타일링 (인쇄 최적화)
- ZIP 파일명 패턴 (연도_점검종류_지적사항.zip 등)
- 사진 fetch 병렬 처리 전략 (Promise.allSettled 등)
- 다운로드 진행률 표시 (토스트 vs 버튼 내 스피너)
- 일괄 다운로드 시 사진 없는 finding 처리 방식

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DL-01 | 지적사항 1건의 내용+사진을 건별로 다운로드할 수 있다 | D-01, D-02, D-09: LegalFindingDetailPage 헤더 버튼 → window.open HTML 새 탭 |
| DL-02 | 라운드 전체 지적사항을 일괄 ZIP으로 다운로드할 수 있다 | D-04, D-05, D-06, D-07, D-10: LegalFindingsPage admin 서브헤더 버튼 → fflate.zipSync |
| DL-03 | iOS PWA에서 window.open + 공유시트 방식으로 다운로드를 지원한다 | D-08, D-09, D-10, D-11: `<a download>` 완전 금지, window.open 전용 경로 |
</phase_requirements>

---

## Summary

Phase 15는 새 API 엔드포인트 없이 클라이언트사이드 전용으로 구현한다. 두 가지 다운로드 경로가 있다: 건별(LegalFindingDetailPage에서 HTML 새 탭)과 일괄(LegalFindingsPage에서 fflate ZIP). 두 경로 모두 `<a download>` 대신 `window.open()`을 사용한다. iOS PWA 홈 화면 모드에서 `<a download>`는 WebKit bug 167341로 인해 무시되며 이 버그는 2017년 이후 미해결 상태다.

건별 다운로드는 finding 데이터를 fetch한 뒤 in-memory에서 HTML 문자열을 생성하고 `data:text/html` URL 또는 blob URL을 `window.open()`으로 연다. 이 HTML에는 메타데이터 테이블과 base64로 인코딩한 사진이 포함되어, 사용자가 인쇄 또는 공유시트로 PDF 저장할 수 있다. 일괄 다운로드는 기존 ReportsPage의 `fflate.zipSync` 패턴을 직접 재활용한다. 사진은 `fetch('/api/uploads/'+key)`로 병렬 수집하고 `Promise.allSettled`로 개별 실패를 처리한다.

**Primary recommendation:** ReportsPage의 `downloadAllAsZip` 패턴(lines 109-137)을 찾아보-finding 전용으로 복제하되, `<a download>` 대신 `window.open(url, '_blank')`로 교체한다. 건별 다운로드는 별도 라이브러리 없이 template literal로 HTML을 직접 생성한다.

---

## Standard Stack

### Core (이미 설치됨 — 추가 설치 없음)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| fflate | ^0.8.2 | 클라이언트사이드 ZIP 생성 | ReportsPage에서 이미 검증됨, sync API로 Worker 제약 없음 |
| lucide-react | ^0.454.0 | Download 아이콘 | 기존 코드베이스 표준 아이콘 라이브러리 |
| react-hot-toast | ^2.4.1 | 진행 상태 알림 | 기존 코드베이스 표준 토스트 |
| useAuthStore (Zustand) | ^5.0.0 | admin role 체크 | `staff?.role === 'admin'` 패턴 기존 코드에서 검증됨 |

**새 의존성 불필요** — 이 phase는 기존 번들에 있는 도구만 사용한다.

**Version verification:**
- fflate 0.8.2: package.json에서 확인 완료
- yet-another-react-lightbox 3.30.1: 설치됨 (Phase 12에서 추가됨)

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| fflate.zipSync (sync) | fflate.zip (async) | sync는 ~10 MB 이하에서 더 단순, 이 phase는 최대 ~10 MB |
| data:text/html URL | Blob URL (createObjectURL) | iOS 18.2+에서 blob URL은 Files 앱에 저장 안 됨 — data URL이 더 안전 |
| window.open() | <a download> | iOS PWA에서 <a download>는 완전히 무시됨 (D-08 결정) |
| Promise.allSettled | Promise.all | allSettled는 사진 1개 실패 시 전체 중단 방지 — 일괄 다운로드에 필수 |

---

## Architecture Patterns

### 건별 다운로드 패턴 (DL-01)

**What:** LegalFindingDetailPage 헤더에 Download 아이콘 버튼 추가 (admin 전용). 클릭 시: finding 데이터(이미 React Query 캐시에 있음) + 사진 blob을 fetch → base64 변환 → HTML 문자열 생성 → `window.open()`으로 새 탭 열기.

**When to use:** 단건 지적사항을 PDF로 저장하거나 인쇄할 때.

**Integration point:** LegalFindingDetailPage 헤더 영역 (lines 97-130). 뒤로가기 버튼 우측에 Download 아이콘 버튼 추가. `finding`이 로드된 후에만 활성화.

```typescript
// 사진 fetch + base64 변환 패턴
async function fetchAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

// HTML 생성 + 새 탭 열기 패턴
async function openFindingReport(finding: LegalFinding) {
  const allPhotoKeys = [
    ...finding.photoKeys.map(k => ({ url: '/api/uploads/' + k, label: '지적 사진' })),
    ...finding.resolutionPhotoKeys.map(k => ({ url: '/api/uploads/' + k, label: '조치 사진' })),
  ]
  const photos = await Promise.allSettled(
    allPhotoKeys.map(async p => ({ ...p, src: await fetchAsBase64(p.url) }))
  )
  const photosHtml = photos
    .filter(r => r.status === 'fulfilled' && r.value.src)
    .map(r => (r as PromiseFulfilledResult<any>).value)
    .map(p => `<figure><figcaption>${p.label}</figcaption><img src="${p.src}" /></figure>`)
    .join('')
  const html = buildReportHtml(finding, photosHtml)  // template literal
  const win = window.open('', '_blank')
  if (win) { win.document.write(html); win.document.close() }
}
```

### 일괄 ZIP 다운로드 패턴 (DL-02)

**What:** LegalFindingsPage의 admin 서브헤더에 일괄 다운로드 버튼 추가. 클릭 시: `legalApi.getFindings(id)` 호출 → 각 finding의 사진들을 `fetch('/api/uploads/'+key)`로 병렬 수집 → `fflate.zipSync`로 ZIP 생성 → `window.open(blobUrl, '_blank')`.

**Integration point:** LegalFindingsPage admin 서브헤더 영역 (lines 494-593). 기존 버튼들과 같은 row에 추가.

```typescript
// ReportsPage downloadAllAsZip 패턴 재활용 (lines 109-137)
// 차이점: <a download> → window.open()
async function downloadFindingsZip(
  findings: LegalFinding[],
  roundTitle: string,
  onProgress: (msg: string) => void
) {
  const { zipSync } = await import('fflate')
  const files: Record<string, Uint8Array> = {}

  for (let i = 0; i < findings.length; i++) {
    const f = findings[i]
    const idx = String(i + 1).padStart(3, '0')
    const folderName = `finding-${idx}_${(f.location ?? '위치없음').replace(/[\/\\:*?"<>|]/g, '_')}`
    onProgress(`수집 중... (${i + 1}/${findings.length})`)

    // 내용.txt
    const txt = buildMetaTxt(f)
    files[`${folderName}/내용.txt`] = new TextEncoder().encode(txt)

    // 지적 사진
    const photoResults = await Promise.allSettled(
      f.photoKeys.map(k => fetch('/api/uploads/' + k).then(r => r.arrayBuffer()))
    )
    photoResults.forEach((r, j) => {
      if (r.status === 'fulfilled') {
        files[`${folderName}/지적사진-${j + 1}.jpg`] = new Uint8Array(r.value)
      }
    })

    // 조치 사진
    const resPhotoResults = await Promise.allSettled(
      f.resolutionPhotoKeys.map(k => fetch('/api/uploads/' + k).then(r => r.arrayBuffer()))
    )
    resPhotoResults.forEach((r, j) => {
      if (r.status === 'fulfilled') {
        files[`${folderName}/조치사진-${j + 1}.jpg`] = new Uint8Array(r.value)
      }
    })
  }

  onProgress('압축 중...')
  const zipped = zipSync(files, { level: 6 })
  const blob = new Blob([zipped.buffer as ArrayBuffer], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)

  // iOS PWA: window.open → 공유시트; 데스크톱: 브라우저가 다운로드 처리
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
```

### HTML 보고서 레이아웃 패턴 (Claude's Discretion)

**인쇄 최적화 원칙:**
- `@media print` CSS: 배경색 제거, 폰트 크기 12pt, 이미지 `max-width: 100%`
- `@page { size: A4; margin: 20mm }` 설정
- 메타데이터 테이블 → 사진 grid 순서 (인쇄 시 자연스러운 흐름)
- base64 이미지는 외부 URL 요청 없이 오프라인 인쇄 가능

**추천 ZIP 파일명 패턴:**
```
{라운드 날짜}_{점검종류}_지적사항.zip
예: 2026.04_종합정밀점검_지적사항.zip
```

### Anti-Patterns to Avoid

- **`<a download>` 절대 사용 금지:** iOS PWA 홈 화면 모드에서 WebKit bug 167341로 완전히 무시됨. 데스크톱 Chrome에서는 작동하므로 테스트 환경에서 문제가 안 보임.
- **`window.open()` popup 차단:** 버튼 클릭 이벤트 핸들러 내에서 직접 호출해야 함. async fetch 완료 후 호출하면 일부 브라우저에서 팝업 차단. `window.open`을 먼저 열고 fetch 완료 후 `win.document.write(html)` 패턴 사용.
- **blob URL + <a download> 조합:** ReportsPage의 `a.click()` 패턴은 iOS PWA에서 동작 안 함 — `window.open(url, '_blank')`로 교체 필수.
- **단일 Promise.all로 모든 사진 fetch:** 일괄 다운로드 시 finding 하나가 사진을 5장 가지면 전체 round에서 동시 fetch가 폭발적으로 늘어남. finding 단위로 순차 처리하되 finding 내 사진은 병렬 처리.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ZIP 생성 | 직접 ZIP 바이트 조립 | fflate.zipSync | ZIP 포맷은 CRC32, 중앙 디렉토리, 로컬 헤더 등 엣지 케이스 다수 — 이미 검증된 라이브러리 사용 |
| base64 변환 | 직접 ArrayBuffer → base64 | FileReader.readAsDataURL | FileReader API가 모든 타겟 브라우저에서 동작, Blob MIME type 자동 처리 |
| iOS 감지 | navigator.platform 파싱 | isIOS() / isStandalone() from InstallPrompt.tsx | iPadOS 13+ 감지 포함, 코드베이스에서 이미 검증됨 |
| 인쇄 최적화 CSS | jsPDF 또는 외부 라이브러리 | window.open + HTML + @media print CSS | 새 탭 열기 → 사용자 Cmd+P가 가장 단순하고 iOS 친화적 |

**Key insight:** 이 phase는 새로운 라이브러리를 도입하지 않는다. 모든 필요 도구가 이미 번들에 있다.

---

## Common Pitfalls

### Pitfall 1: window.open() 팝업 차단 (async 이후 호출)

**What goes wrong:** 사진 fetch가 완료된 후 `window.open()`을 호출하면 브라우저가 "사용자가 시작하지 않은 팝업"으로 판단해 차단. 개발자가 `await fetchPhotos()` 이후에 `window.open()` 호출하면 iOS/Android 모두에서 무음으로 실패.

**Why it happens:** 브라우저의 팝업 차단 정책은 `window.open()`이 사용자 제스처 이벤트 핸들러의 synchronous 콜 스택 내에서 호출되어야 한다고 요구한다. async 작업 이후에는 이 제약이 풀림.

**How to avoid (건별):**
```typescript
// 정답: 먼저 window.open()으로 창을 열고, async 작업 완료 후 내용 채우기
const win = window.open('', '_blank')
if (!win) { toast.error('팝업이 차단되었습니다. 팝업을 허용해 주세요.'); return }
win.document.write('<p>로딩 중...</p>')
const html = await buildHtml(finding)  // async fetch
win.document.open()
win.document.write(html)
win.document.close()
```

**How to avoid (일괄 ZIP):**
일괄 다운로드는 fetch 완료 후 blob URL을 `window.open()`에 전달해야 하므로 async 이후 호출이 불가피. 대부분의 브라우저는 `blob:` URL을 `window.open()`으로 여는 것을 허용하지만 팝업 차단이 발생하면 `<a>` 태그를 DOM에 임시 추가하고 click (iOS 제외 fallback).

**Warning signs:** 일괄 다운로드 버튼 클릭 후 아무 일도 안 일어남, 브라우저 주소창에 팝업 차단 아이콘 표시.

### Pitfall 2: iOS PWA에서 `<a download>` 무시 (WebKit bug 167341)

**What goes wrong:** ReportsPage(lines 129-136)의 `<a download>` + `.click()` 패턴을 그대로 복사하면 iOS PWA 홈 화면 모드에서 다운로드가 완전히 무시됨. 데스크톱 Chrome, 심지어 iOS Safari 브라우저 탭에서도 동작하므로 테스트 통과처럼 보임.

**Why it happens:** WebKit bug 167341 — iOS Safari PWA(홈 화면 추가 모드)에서 `<a download>` 속성은 2017년부터 현재까지 무시됨. URL만 열리거나 아무 일도 없음.

**How to avoid:** D-08 결정 준수 — 이 phase의 모든 다운로드는 `window.open(url, '_blank')`만 사용. ReportsPage의 `<a>` 클릭 패턴은 절대 재사용하지 않음.

**Warning signs:** 데스크톱에서 정상 동작하지만 물리 iOS 기기 PWA 모드에서 버튼 클릭 후 아무 일도 안 일어남.

### Pitfall 3: 사진이 없는 finding의 ZIP 폴더 처리

**What goes wrong:** `photoKeys.length === 0`인 finding은 사진 fetch 루프를 건너뛰게 되면 `finding-001_위치/내용.txt`만 있는 폴더가 ZIP에 포함되거나, 더 나쁘게는 해당 finding 자체를 건너뛰어 ZIP에 누락됨.

**Why it happens:** 사진 없는 finding은 정상 데이터 — 사진 없이 지적사항만 등록하는 경우가 있음.

**How to avoid:** 사진이 없어도 `내용.txt`는 반드시 포함. 사진 fetch 루프를 빈 배열에 대해 건너뛰더라도 폴더(내용.txt)는 항상 생성.

### Pitfall 4: base64 이미지로 HTML 페이지가 너무 커짐

**What goes wrong:** 지적 사진 5장 + 조치 사진 5장 = 최대 10장 × 200 KB = 2 MB → base64 인코딩 시 ~2.7 MB HTML. `window.open()`으로 2.7 MB `data:text/html` URL을 여는 것은 일부 iOS 버전에서 제한에 걸림.

**Why it happens:** data URI 길이 제한이 브라우저마다 다름. iOS Safari는 data URI를 ~2 MB까지 지원한다고 알려져 있음.

**How to avoid:** `data:text/html` 대신 Blob URL 방식 사용:
```typescript
const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
const url = URL.createObjectURL(blob)
const win = window.open(url, '_blank')
setTimeout(() => URL.revokeObjectURL(url), 5000)
```
Blob URL은 현재 세션에서만 유효하고 iOS 18.2+에서도 새 탭 열기에는 정상 동작함 (Files 앱 저장만 문제임).

### Pitfall 5: 토큰 인증이 필요한 /api/uploads fetch

**What goes wrong:** 사진 URL은 `/api/uploads/{key}` 패턴인데, 이 엔드포인트는 JWT 인증 미들웨어로 보호됨. `fetch('/api/uploads/' + key)` 시 Authorization 헤더 없이 요청하면 401 응답.

**Why it happens:** functions/_middleware.ts가 모든 /api/ 경로를 보호하나, CONTEXT.md와 기존 코드를 보면 `/api/uploads/*`는 public 예외 경로임. 하지만 PhotoGrid와 동일한 패턴으로 처리해야 함.

**How to avoid:**
```typescript
// PhotoGrid가 <img src="/api/uploads/"+key>로 직접 렌더링하는 것처럼
// fetch도 동일 URL 사용 — 미들웨어 설정 확인
const res = await fetch('/api/uploads/' + key)
// 만약 401이면 authStore에서 token 가져와 헤더 추가 필요
```
미들웨어 설정에서 `/api/uploads/*`가 public 예외인지 먼저 확인 필요.

---

## Code Examples

### 기존 ReportsPage ZIP 다운로드 패턴 (lines 109-136)

```typescript
// Source: cha-bio-safety/src/pages/ReportsPage.tsx lines 126-137
// 이 phase에서 교체할 부분: a.click() → window.open()
const zipped = zipSync(files, { level: 6 })
const blob = new Blob([zipped.buffer as ArrayBuffer], { type: 'application/zip' })
const url = URL.createObjectURL(blob)

// 기존 (iOS PWA에서 동작 안 함):
const a = document.createElement('a')
a.href = url
a.download = `...zip`
document.body.appendChild(a)
a.click()
document.body.removeChild(a)
setTimeout(() => URL.revokeObjectURL(url), 1000)

// Phase 15에서 대체:
window.open(url, '_blank')
setTimeout(() => URL.revokeObjectURL(url), 2000)
```

### isIOS() / isStandalone() 재사용

```typescript
// Source: cha-bio-safety/src/components/InstallPrompt.tsx lines 4-16
// 이 파일에서 import 또는 함수 복사하여 사용
function isStandalone(): boolean {
  if ((window.navigator as any).standalone === true) return true
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  if (window.matchMedia('(display-mode: fullscreen)').matches) return true
  return false
}

function isIOS(): boolean {
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) return true
  if (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1) return true
  return false
}
// 사용 예: isIOS() && isStandalone() 일 때 공유시트 안내 토스트 표시
```

### LegalFinding 타입 확인 (photo keys 필드)

```typescript
// Source: cha-bio-safety/src/types/index.ts lines 90-107
export interface LegalFinding {
  id: string
  scheduleItemId: string
  description: string
  location: string | null
  photoKey: string | null          // legacy single photo
  photoKeys: string[]              // array of R2 keys (multi-photo) — Phase 12에서 추가됨
  resolutionMemo: string | null
  resolutionPhotoKey: string | null
  resolutionPhotoKeys: string[]    // array of R2 keys (multi-photo) — Phase 12에서 추가됨
  status: LegalFindingStatus
  resolvedAt: string | null
  resolvedBy: string | null
  resolvedByName: string | null
  createdBy: string
  createdByName: string | null
  createdAt: string
}
```

### Admin 조건부 렌더링 패턴

```typescript
// Source: cha-bio-safety/src/pages/LegalFindingsPage.tsx line 358-359
const { staff } = useAuthStore()
const role = staff?.role
// 사용: {role === 'admin' && <DownloadButton />}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<a download>` blob 다운로드 | `window.open(url, '_blank')` | iOS 16.3.1+ PWA 요구사항 | iOS PWA 호환성 확보 |
| 서버사이드 ZIP (JSZip + Worker) | 클라이언트사이드 fflate.zipSync | 프로젝트 설계 당시 결정 | Worker 128 MB 제한 회피, 배포 단순화 |
| 단일 photo_key | photo_keys[] (Phase 12) | Phase 12 완료 시 | 다중 사진 ZIP 포함 가능 |

**Deprecated/outdated:**
- `FileSaver.js`: iOS PWA에서 동작 안 함, 이 프로젝트에서 사용 금지
- `jsPDF` 클라이언트 PDF 생성: HTML+print 방식이 더 단순하고 한글 폰트 이슈 없음 (이미 설치된 jsPDF 4.2.1은 이 phase에서 불필요)

---

## Open Questions

1. **`/api/uploads/*` 인증 요구사항**
   - What we know: functions/_middleware.ts가 /api/uploads/*를 public 예외로 처리하는 것으로 보임 (PhotoGrid가 인증 헤더 없이 `<img src>` 직접 사용)
   - What's unclear: fetch()로 직접 호출할 때도 동일하게 예외 적용되는지, 아니면 img 요소만 예외인지
   - Recommendation: 구현 전 _middleware.ts에서 `/api/uploads` 예외 경로 확인. 인증 필요 시 `useAuthStore.getState().token`으로 Authorization 헤더 추가.

2. **iOS 18.2+ blob URL window.open() 동작**
   - What we know: iOS 18.2+에서 blob URL → Files 앱 저장이 차단됨 (Apple Developer Forums)
   - What's unclear: `window.open(blobUrl, '_blank')`로 새 탭을 열면 공유시트가 여전히 표시되는지
   - Recommendation: D-10 결정(일괄 ZIP blob을 window.open으로 열기)이 iOS 18.2+에서 유효한지 물리 기기 테스트 필수. STATE.md 블로커와 동일: "물리 iOS 16.x 기기 PWA 홈 화면 모드 테스트 필수"

3. **진행률 표시 방식**
   - What we know: ReportsPage는 `onProgress` 콜백으로 버튼 텍스트를 업데이트함
   - What's unclear: 일괄 다운로드가 몇 초나 걸리는지 (finding 수 × 사진 수에 따라 변동)
   - Recommendation: 버튼 내 로딩 텍스트(ReportsPage 패턴) + toast.loading() 조합. 사진 없는 경우 1-2초, 10 findings × 5 photos면 5-15초 예상.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| fflate | ZIP 생성 | ✓ | ^0.8.2 (package.json) | — |
| lucide-react | Download 아이콘 | ✓ | ^0.454.0 | SVG 인라인 |
| react-hot-toast | 진행 알림 | ✓ | ^2.4.1 | — |
| Node.js | 빌드 도구 | ✓ | v24.14.0 | — |
| npm | 패키지 관리 | ✓ | 11.9.0 | — |

**Missing dependencies with no fallback:** 없음

**Missing dependencies with fallback:** 없음

**신규 의존성 설치 불필요** — 이 phase는 0-install phase.

---

## Validation Architecture

테스트 프레임워크 미설치 (`package.json`에 vitest/jest 없음). `nyquist_validation: true`이나 테스트 인프라 자체가 없으므로 수동 검증 절차로 대체.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | 없음 (테스트 프레임워크 미설치) |
| Config file | 없음 |
| Quick run command | `npm run build` (TypeScript 컴파일 오류 확인) |
| Full suite command | `npm run build && wrangler pages dev` (프로덕션 배포 후 수동 테스트) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DL-01 | 건별 다운로드 버튼이 admin에게 보임 | manual | `npm run build` (빌드 성공 확인) | ❌ Wave 0 |
| DL-01 | HTML 새 탭이 열리고 메타데이터+사진 표시 | manual | 프로덕션 배포 후 물리 기기 테스트 | ❌ Wave 0 |
| DL-02 | 일괄 다운로드 버튼이 admin 서브헤더에 보임 | manual | `npm run build` (빌드 성공 확인) | ❌ Wave 0 |
| DL-02 | ZIP 다운로드 후 파일 구조 확인 | manual | 데스크톱 브라우저에서 ZIP 열기 | ❌ Wave 0 |
| DL-03 | iOS PWA 홈 화면 모드에서 window.open 동작 | manual | 물리 iOS 16.x 기기 PWA 모드 테스트 | ❌ Wave 0 |
| DL-03 | non-admin 사용자에게 버튼 미표시 | manual | `npm run build` (빌드 성공 확인) | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run build` (TypeScript 오류 없는지)
- **Per wave merge:** 데스크톱 브라우저에서 수동 E2E 검증
- **Phase gate:** 물리 iOS 16.x 기기 PWA 홈 화면 모드에서 DL-03 통과 후 `/gsd:verify-work`

### Wave 0 Gaps
- 테스트 프레임워크 자체가 없으므로 자동화 테스트 파일 생성 불필요
- 모든 검증은 프로덕션 배포 후 수동 테스트 (`feedback_deploy_test.md` 메모리: "항상 프로덕션 배포 후 테스트")

---

## Project Constraints (from CLAUDE.md)

구현 시 반드시 준수해야 할 지시사항:

- **배포:** `npm run deploy` + `--branch production` 필수 (Preview 배포 방지) — memory: feedback_deploy_branch.md
- **테스트:** 로컬 서버 X, 항상 프로덕션 배포 후 테스트 — memory: feedback_deploy_test.md
- **언어:** UI 문자열은 한국어
- **인라인 스타일:** CSS 변수(`var(--bg)`, `var(--t1)`, `var(--acl)`)로 테마 적용
- **컴포넌트:** 함수형 컴포넌트, PascalCase 파일명
- **에러 처리:** toast 알림은 react-hot-toast, 에러 메시지는 한국어
- **권한 체크:** `staff?.role === 'admin'` + 조건부 렌더링 패턴
- **API 클라이언트:** `legalApi.*` 함수 사용 (직접 fetch 금지)
- **새 API 엔드포인트 불필요:** 이 phase는 클라이언트사이드 전용
- **strict: false:** TypeScript strict 모드 비활성화 상태 — 타입 오류 허용하지만 빌드 오류는 불허

---

## Sources

### Primary (HIGH confidence)
- `cha-bio-safety/src/pages/ReportsPage.tsx` — fflate zipSync + `<a download>` 패턴 직접 확인 (lines 109-137)
- `cha-bio-safety/src/components/InstallPrompt.tsx` — isIOS(), isStandalone() 구현 확인 (lines 4-16)
- `cha-bio-safety/src/types/index.ts` — LegalFinding 인터페이스 (lines 90-107): photoKeys[], resolutionPhotoKeys[] 확인
- `cha-bio-safety/src/pages/LegalFindingDetailPage.tsx` — 헤더 구조, finding 데이터 접근 패턴 확인
- `cha-bio-safety/src/pages/LegalFindingsPage.tsx` — admin 서브헤더 구조 확인 (lines 494-593)
- `cha-bio-safety/src/utils/api.ts` — legalApi 확인: getFindings, getFinding 메서드
- `.planning/research/PITFALLS.md` — Pitfall 3: iOS `<a download>` 상세 문서화
- `.planning/research/SUMMARY.md` — iOS download 제약 종합 문서화

### Secondary (MEDIUM confidence)
- [WebKit bug 167341](https://bugs.webkit.org/show_bug.cgi?id=167341) — `<a download>` 미동작 2017년 이후 미해결 확인
- [iOS PWA limitations guide 2026](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide) — download, blob URL 동작 확인
- [Apple Developer Forums — iOS blob URL iOS 18.2+](https://developer.apple.com/forums/thread/751063) — createObjectURL 변경 확인

### Tertiary (LOW confidence)
- 없음 — 모든 핵심 결정은 HIGH confidence 소스에서 검증됨

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — package.json에서 직접 확인, 신규 의존성 없음
- Architecture: HIGH — ReportsPage 패턴 소스 코드에서 직접 확인, LegalFinding 타입 확인 완료
- Pitfalls: HIGH — WebKit bug 167341 공식 문서 및 프로젝트 PITFALLS.md에서 검증됨

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (fflate, lucide-react API는 안정적 — 30일 유효)
