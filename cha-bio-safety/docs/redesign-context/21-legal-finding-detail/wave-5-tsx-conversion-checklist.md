# wave-5-tsx-conversion-checklist.md — redesign/21-legal-finding-detail W5

작성: 2026-05-25 / quick 260525-4of
범위: LegalFindingDetailPage.tsx (279 lines) 단일 atomic TSX 변환 verify checklist (markdown, 12 섹션).

본 PLAN 에서는 sketch HTML 3개 (W2 chrome + W3 finding-info + W4 resolve-form) + 본 checklist 1개 = 총 4 파일 만 산출.
**TSX 변환 자체는 W6 별도 wave** (다음 turn 진입점).

10 src 파일 (LegalFindingDetailPage + 외부 6 + App.tsx + 조부모 LegalPage + 부모 LegalFindingsPage)
모두 **0 byte 변경** 확인 — 본 PLAN 종료 시 최종 verify gate.

참조: 20-legal-findings/wave-5-tsx-conversion-checklist.md mirror, wave-1-index.md §3/§7 verbatim,
sketch-wave-2-chrome.html + sketch-wave-3-finding-info.html + sketch-wave-4-resolve-form.html (본 PLAN 산출 3 sketch).

---

## §1 변환 범위 — LegalFindingDetailPage.tsx 단일 atomic (279 lines, 3 영역 통합)

| 영역 | line 범위 | 내용 | 후속 wave 매핑 |
|---|---|---|---|
| 1. 상단 imports + 포맷터 + 컴포넌트 | line 1~48 | imports (useState, react-router-dom, react-query, react-hot-toast, legalApi, useIsDesktop, useMultiPhotoUpload, PhotoGrid, PhotoSourceModal, useAuthStore, buildMetaTxt) + fmtDate (분까지 표시) + KVRow (label 12 width 64 + children 14 flex 1) + SectionHeader (12/700 var(--t3) marginBottom 10) + Spinner (28x28 border var(--bd2) borderTopColor var(--acl) + @keyframes spin 중복) | W2 chrome (Spinner → Lucide Loader2 OQ #5) + W3 finding-info (KVRow + SectionHeader + fmtDate) |
| 2. 메인 함수 + 상태 + 비즈 로직 | line 51~143 | useParams (id, fid) + useNavigate + useQueryClient + useState memo + useState downloading + useAuthStore staff (selector) + useMultiPhotoUpload resolutionPhotos + useQuery (line 61~65 ★) + useMutation resolveMutation (line 67~87 uploadAll 선행 + 4 키 invalidate + navigate(-1) ★) + handleDownload (line 89~130, fflate + iOS PWA + ZIP location 기반 ★) + handleResolve (line 132~138 memo.trim() validation ★) + isSubmitting + useIsDesktop + sectionPad | W4 resolve-form (모든 비즈 로직 anchor) |
| 3. JSX render | line 145~278 | 외곽 (line 146 flex 1 column overflow hidden + @keyframes spin) + 모바일 헤더 (line 149~165, OQ #1 + OQ #5) + 데스크톱 타이틀 (line 168~177, 글로벌 chrome 0) + 로딩 (Spinner line 180) + 에러 단일 문장 (line 183~187) + 콘텐츠 (line 190~267 — Section 1+2+3+4) + 모바일 고정 하단 CTA (line 270~275, status open 한정) | W2 (헤더+타이틀+Spinner+에러) + W3 (Section 1+2) + W4 (Section 3+4+모바일 고정 CTA) |

**외부 의존성 0 byte 변경** (LegalFindingDetailPage 외 9 파일):
- `src/components/PhotoGrid.tsx` (Section 2 지적 사진 + Section 4 조치 사진 render)
- `src/components/PhotoSourceModal.tsx` (사진 5장 슬롯 picker — W4 useMultiPhotoUpload 직접 사용)
- `src/hooks/useMultiPhotoUpload.ts` (line 59 직접 호출 — 사진 5장 슬롯 풀 컨트롤)
- `src/utils/findingDownload.ts` (buildMetaTxt — handleDownload 안 '내용.txt' encoder 호출)
- `src/utils/api.ts` (legalApi.getFinding + legalApi.resolveFinding)
- `src/stores/authStore.ts` (useAuthStore selector 패턴 — staff?.role === 'admin' 분기)
- `src/App.tsx` (line 117 정규식 `!location.pathname.match(/^\/legal\/.+/)` → showNav=false — 글로벌 chrome 0)
- `src/pages/LegalPage.tsx` (조부모 — 19-legal 변환 완료 확인)
- `src/pages/LegalFindingsPage.tsx` (부모 — 본 페이지 진입점 findingCard 클릭 시 navigate(`/legal/${id}/finding/${fid}`))

---

## §2 비즈 anchor 11건 보존 (verbatim fence — 1 byte 변경 금지)

```typescript
// [1] useQuery (line 61~65) — Section 3+4 finding query 결과
const { data: finding, isLoading, error } = useQuery({
  queryKey: ['legal-finding', id, fid],
  queryFn: () => legalApi.getFinding(id!, fid!),
  enabled: !!id && !!fid,
})

// [2] useMutation resolveMutation (line 67~87) — uploadAll 선행 + snake_case payload
const resolveMutation = useMutation({
  mutationFn: async () => {
    const photoKeys = await resolutionPhotos.uploadAll()
    return legalApi.resolveFinding(id!, fid!, {
      resolution_memo: memo.trim(),
      resolution_photo_keys: photoKeys.length > 0 ? photoKeys : undefined,
    })
  },
  // [3] queryClient.invalidateQueries 4 키 onSuccess (순서 보존)
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['legal-finding', id, fid] })
    queryClient.invalidateQueries({ queryKey: ['legal-findings', id] })
    queryClient.invalidateQueries({ queryKey: ['legal-rounds'] })
    queryClient.invalidateQueries({ queryKey: ['legal-round', id] })
    toast.success('조치 완료')
    resolutionPhotos.reset()
    navigate(-1)
  },
  onError: () => {
    toast.error('조치 처리 실패')
  },
})

// [4] legalApi 2종 — getFinding + resolveFinding (snake_case payload 변경 금지)
//     legalApi.list / get / getFindings / updateResult / deleteFinding 5종은 본 페이지 미사용
//     (19-legal LegalPage / 20-legal-findings LegalFindingsPage 가 각각 사용)

// [5] resolutionPhotos = useMultiPhotoUpload() (line 59)
//     ★ 본 페이지가 훅 직접 사용 — FindingFormSheet 우회 X (20-legal-findings 와 다름, 19/20 차이 2)
const resolutionPhotos = useMultiPhotoUpload()
// 직접 호출 멤버: slots / canAdd / openPicker / closePicker / pickCamera / pickAlbum /
//   handleFiles / removeSlot / uploadAll / reset / isUploading / cameraRef / albumRef / showPicker

// [6] handleResolve (line 132~138) — memo.trim() validation
const handleResolve = () => {
  if (!memo.trim()) {
    toast.error('조치 내용을 입력하세요')
    return
  }
  resolveMutation.mutate()
}

// [7] finding.status 분기 (line 218 open / line 253 resolved) — mutually exclusive
{finding.status === 'open' && (
  /* Section 3: textarea + 사진 5장 슬롯 + 데스크톱 inline CTA */
)}
{finding.status === 'resolved' && (
  /* Section 4: KVRow 3행 + PhotoGrid */
)}

// [8] admin 다운로드 button 조건부 (line 159 모바일 + line 171 데스크톱)
//     staff = useAuthStore(s => s.staff) (line 58, selector 패턴 — 20-legal-findings getState() 와 다름)
const staff = useAuthStore(s => s.staff)
{staff?.role === 'admin' && finding && (
  <button onClick={handleDownload} disabled={downloading}>...</button>
)}

// [9] handleDownload (line 89~130) — fflate + iOS PWA + ZIP location 기반
async function handleDownload() {
  if (!finding) return
  setDownloading(true)
  try {
    const { zipSync } = await import('fflate')
    const files: Record<string, Uint8Array> = {}
    const encoder = new TextEncoder()
    // ★ ZIP 파일명 location 기반 (line 96, 119 — 19/20 차이 4)
    //   20-legal-findings round.title 기반과 다름 + fid 기반 아님 — name = location 안전화
    const name = (finding.location ?? '위치없음').replace(/[\/\\:*?"<>|]/g, '_')

    files['내용.txt'] = encoder.encode(buildMetaTxt(finding))

    const photoResults = await Promise.allSettled(
      finding.photoKeys.map(k => fetch('/api/uploads/' + k).then(r => r.arrayBuffer()))
    )
    photoResults.forEach((r, j) => {
      if (r.status === 'fulfilled') files[`지적사진-${j + 1}.jpg`] = new Uint8Array(r.value)
    })

    const resResults = await Promise.allSettled(
      finding.resolutionPhotoKeys.map(k => fetch('/api/uploads/' + k).then(r => r.arrayBuffer()))
    )
    resResults.forEach((r, j) => {
      if (r.status === 'fulfilled') files[`조치사진-${j + 1}.jpg`] = new Uint8Array(r.value)
    })

    const zipped = zipSync(files, { level: 6 })
    const blob = new Blob([zipped.buffer as ArrayBuffer], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    // ★ iOS PWA `<a download>` 패턴 verbatim (1 byte 변경 금지 — iOS 안정성 검증된 패턴):
    const a = document.createElement('a')
    a.href = url
    a.download = `지적사항_${name}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 3000)
    toast.success('다운로드 완료')
  } catch {
    toast.error('다운로드 실패')
  } finally {
    setDownloading(false)
  }
}

// [10] @keyframes spin (line 45 Spinner + line 147 JSX 외곽 중복 정의)
//      OQ #5 LOCKED: Lucide Loader2 animate-spin size={24} 교체 시 양쪽 keyframes 폐기 가능

// [11] toast 카피 5종 verbatim:
//   success 2 — '조치 완료' (line 80) / '다운로드 완료' (line 124)
//   error 3 — '조치 처리 실패' (line 85) / '조치 내용을 입력하세요' (line 134) / '다운로드 실패' (line 126)
// 추가 카피 verbatim:
//   모바일 + 데스크톱 헤더 타이틀 '지적 상세' (line 158, 170) — 정적, 20-legal-findings 동적 분기와 다름
//   오류 단일 문장 '항목을 불러오지 못했습니다. 뒤로 가서 다시 시도하세요.' (line 185)
//   SectionHeader 4종 '지적 정보' / '지적 사진' / '조치 내용' / '조치 결과' (line 198/209/220/255)
//   KVRow label 7종 '지적 내용' / '위치' / '등록일' / '등록자' / '조치일시' / '조치자' / '조치 내용' (line 200~204, 257~259)
//   위치 fallback '-' (line 202, 20-legal-findings '위치 미지정' 과 다름)
//   '사진 없음' (line 213), 조치 사진 라벨 '조치 사진 (최대 5장)' (line 223)
//   textarea placeholder '조치 내용을 입력하세요' (line 221)
//   canAdd '사진 첨부' (line 237, OQ #3 격상 11→12 + OQ #5 Lucide Camera 22 교체)
//   슬롯 제거 '✕' (line 231, OQ #3 격상 11→12)
//   슬롯 업로드 중 '업로드 중' (line 232, OQ #3 격상 10→12)
//   CTA '조치 완료' / '처리 중...' (line 246, 273)
//   데스크톱 admin '다운로드' / '다운로드 중...' (line 173)
```

---

## §3 변환 매핑 (영역 1~3 verbatim, sketch wave 매핑)

### 영역 1 (line 1~48): imports + 포맷터 + KVRow + SectionHeader + Spinner

```diff
- import { useState } from 'react'
+ import { useState } from 'react'
+ import { ChevronLeft, Download, Loader2, Camera } from 'lucide-react'  // ★ OQ #5 LOCKED
```

```diff
- function Spinner() {
-   return (
-     <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
-       <div style={{ width: 28, height: 28, border: '2px solid var(--bd2)', borderTopColor: 'var(--acl)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
-       <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
-     </div>
-   )
- }
+ function Spinner() {
+   return (
+     <div className="flex-1 flex items-center justify-center">
+       <Loader2 className="animate-spin text-accent" size={24} />   {/* ★ OQ #5 LOCKED */}
+     </div>
+   )
+ }
```

KVRow + SectionHeader 보존 (line 22~38, OQ #3 leading-none 명시) — 컴포넌트 구조 변경 X.

### 영역 2 (line 51~143): 메인 함수 + 상태 + 비즈 로직

★ **0 byte 변경** — 모든 비즈 anchor 11건 verbatim 보존 (§2 참조).
- useQuery / useMutation / queryClient.invalidateQueries (4 키) / legalApi 2종 / useMultiPhotoUpload 직접 /
  handleResolve memo.trim() validation / handleDownload location 기반 + iOS PWA / staff selector 패턴

### 영역 3 (line 145~278): JSX render → Tailwind class + Lucide 교체

W2 매핑 (line 146~187):
- `style={{ flex: 1, ..., background: 'var(--bg)' }}` → `className="flex-1 flex flex-col bg-surface-page h-full overflow-hidden"` (line 146)
- 모바일 헤더 (line 149~165): `bg-surface-raised border-b border-border-default` 토큰 적용 (★ OQ #1) + back/admin 다운로드 button 44x44 격상 (★ OQ #5: w-11 h-11 또는 w-[44px] h-[44px], w-8 함정 회피)
- 데스크톱 타이틀 (line 168~177): 글로벌 chrome 0 anchor (App.tsx line 117 정규식)
- Spinner → Lucide Loader2 (★ OQ #5)
- 에러 단일 문장 (line 185): `text-body-sm text-text-secondary` (20-legal-findings 와 다름)

W3 매핑 (line 190~215):
- 콘텐츠 외곽 (line 190~195): paddingBottom 분기 + maxWidth 700 데스크톱 + overflowY auto
- Section 1+2 (line 197~215): `border-b border-border-default` + KVRow 4행 + PhotoGrid/'사진 없음' (★ OQ #2 finding 칩 본 페이지 없음 + KVRow value 좌측 강조 없음)

W4 매핑 (line 218~275):
- Section 3 status open (line 218~250): textarea + 사진 5장 슬롯 + ★ 데스크톱 inline CTA `style={{ background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)' }}` (★ OQ #4 LOCKED anchor 2번째) + Camera 교체 (★ OQ #5)
- Section 4 status resolved (line 253~265): KVRow 3행 + PhotoGrid
- 모바일 고정 하단 CTA (line 270~275): ★ position fixed + iOS safe-area + `linear-gradient` 인라인 (★ OQ #4 LOCKED anchor 1번째)

★ T3 linear-gradient 예외 anchor ≥3 박제: 모바일 고정 + 데스크톱 inline + admin frame (W4 sketch)

---

## §4 OQ LOCKED 5건 반영 매핑 표

| OQ # | LOCKED 결정 verbatim | TSX 변환 후 적용 위치 (line) | sketch wave 매핑 |
|---|---|---|---|
| #1 | 모바일 자체 헤더 `bg-surface-raised border-b border-border-default` (옛 alpha 토큰 폐기) + 타이틀 '지적 상세' 정중앙 정적 (line 158 verbatim, 20-legal-findings 동적 분기와 다름) + back + admin 다운로드 button 44x44 격상 | line 149~165 모바일 헤더 div + back button (line 155, 44x44) + 타이틀 (line 158 정적) + admin 다운로드 button (line 159~163, 44x44) | W2 chrome (★ 핵심) |
| #2 | finding 상태 칩 본 페이지 없음 + KVRow value 좌측 강조 없음 (status 표시는 화면 모드 자체로 — `finding.status === 'open'` Section 3 form / `'resolved'` Section 4 결과 mutually exclusive) | line 218 (open) / line 253 (resolved) 분기 — KVRow 7행 (line 200~204 Section 1 + 257~259 Section 4) — value 좌측 강조 0 | W3 finding-info (★ 핵심) + W4 resolve-form (status 분기) |
| #3 | §1.1 9·10·11 → 12 격상 + leading-none (uploading overlay '업로드 중' 10 → 12 + 제거 button '✕' 11 → 12 + canAdd '사진 첨부' 11 → 12) | line 231 (제거 button) + line 232 (uploading overlay) + line 237 (canAdd) — text-caption + leading-none 명시 | W4 resolve-form (★ 핵심) + W3 finding-info (KVRow + SectionHeader 부분 적용) |
| #4 | 조치 완료 CTA 인라인 그라데이션 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` (T3 만 linear-gradient negative gate 예외 anchor ≥3) + admin 다운로드 button = 작은 도구 solid 유지 + handleResolve memo.trim() validation 보존 | line 244~248 데스크톱 inline CTA + line 270~275 모바일 고정 CTA — 양쪽 인라인 `style={{ background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)' }}` 박제 | W4 resolve-form (★ 핵심) |
| #5 | Lucide ChevronLeft size={20} + Download size={18} + Loader2 size={24} + Camera size={22} 교체 + back/admin 다운로드 44x44 격상 (w-11 h-11 또는 w-[44px] h-[44px], w-8 함정 회피) | line 156 (ChevronLeft) + line 161 (Download) + line 41~48/180 (Loader2) + line 237 (Camera) — import 추가: `import { ChevronLeft, Download, Loader2, Camera } from 'lucide-react'` | W2 chrome (ChevronLeft+Download+Loader2 ★ 핵심) + W4 resolve-form (Camera ★ 핵심) |

---

## §5 negative gate (W5 checklist 자체 + 4 sketch 모두 통과)

- ★ 이모지 0건 (sketch 본문 — '📷' Camera Lucide 교체 OQ #5 후 본 페이지 직접 사용 이모지 폐기)
- ★ `linear-gradient` 분기:
  - T1 (chrome) = 0건
  - T2 (finding-info) = 0건
  - **T3 (resolve-form) = `linear-gradient(135deg, #1d4ed8, #0ea5e9)` ≥3 박제 (OQ #4 LOCKED 예외 anchor — 모바일 고정 + 데스크톱 inline + admin frame)**
  - T4 (W5 checklist) = code fence 안 인용 ≥1 (본 §5 + §3 영역 3 W4 매핑 예시 + §10 §6.4 CTA 카테고리)
- 9·10·11px fontSize 0건 (text-caption 12 leading-none 마지노선, OQ #3 LOCKED, uploading overlay 10 + 제거 button 11 + canAdd 11 모두 격상)
- (text|bg|border)-status- prefix 0건 (memory `feedback_tailwind_token_class_pattern`, OQ #2 LOCKED 위반 시 FAIL)
- \b(w|h)-8\b 0건 (tailwind config w-8=48 함정, memory `feedback_tailwind_w8_h8_is_48px`)
- 옛 alias 토큰 (var(--bg/bg2/bg3/bg4/bd/bd2/t1/t2/t3/acl/accent/safe/warn/danger)) sketch 본문 안 0건 (tokens.css 정의 인용 fence 안 예외)

---

## §6 positive gate

- ✅ 4 파일 모두 cha-bio-safety/docs/redesign-context/21-legal-finding-detail/ 직속 평면 배치 (sketch/ 서브폴더 X)
- ✅ W2 chrome sketch ≥200 lines, 4 frame, OQ #1 + OQ #5 LOCKED 박제
- ✅ W3 finding-info sketch ≥200 lines, 4 frame, OQ #2 + OQ #3 LOCKED 박제
- ✅ W4 resolve-form sketch ≥200 lines, 4 frame, OQ #4 LOCKED 그라데이션 ≥3 + OQ #5 Camera 박제
- ✅ W5 checklist ≥300 lines, 12 섹션, 비즈 anchor 11건 박제 + OQ #1~#5 citation + 메모리 룰 inline 12+
- ✅ 비즈 anchor 11건 박제 hit ≥6 per file (모든 file)
- ✅ OQ #1~#5 citation 4 sketch 분산 + 본 checklist 안 5건 모두

---

## §7 build / tsc (W6 TSX 변환 wave 시점 — 본 PLAN 에서는 verify gate 없음)

```bash
cd cha-bio-safety
npm run build       # PASS (vite + PWA)
npx tsc --noEmit    # PASS (strict false 모드, 타입 에러 0)
```

본 PLAN (W2~W5) 에서는 LegalFindingDetailPage.tsx 0 byte 변경 — TSX 변환 wave (W6) 진입 시 위 명령 PASS 확인.

---

## §8 자체 verify grep 모음 (W6 TSX 변환 후 확인용)

```bash
# (1) status- prefix 0
grep -cE '(text|bg|border)-status-(safe|fire|warning|danger|caution)' cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
# 결과 = 0 PASS / >0 FAIL

# (2) w-8 / h-8 0 (tailwind w-8=48 함정)
grep -cE '\bw-8\b|\bh-8\b' cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
# 결과 = 0 PASS / >0 FAIL

# (3) 9·10·11px fontSize 0 (text-caption 12 leading-none 마지노선)
grep -cE 'font-size:[[:space:]]*(9|10|11)[^0-9]|fontSize:[[:space:]]*(9|10|11)[^0-9]' cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
# 결과 = 0 PASS / >0 FAIL

# (4) ★ linear-gradient T3 만 ≥3 (OQ #4 LOCKED 예외 anchor)
grep -cE 'linear-gradient\(135deg,\s*#1d4ed8,\s*#0ea5e9\)' cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
# 결과 ≥2 PASS (모바일 고정 + 데스크톱 inline, line 245/272) / <2 FAIL

# (5) Lucide imports (OQ #5)
grep -E 'from .lucide-react' cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
# 결과: ChevronLeft + Download + Loader2 + Camera 4종 PASS

# (6) 타이틀 정적 '지적 상세'
grep -c '지적 상세' cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
# 결과 ≥2 (모바일 line 158 + 데스크톱 line 170)

# (7) KVRow + SectionHeader + width 64
grep -cE 'function KVRow|function SectionHeader|width:[[:space:]]*64|width:[[:space:]]*\[64' cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
# 결과 ≥3 PASS

# (8) fmtDate 분까지 (HH:mm zero-padded)
grep -cE 'fmtDate|HH:mm|getHours|getMinutes' cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
# 결과 ≥1 PASS

# (9) status open/resolved 분기 (mutually exclusive)
grep -cE "finding\.status === 'open'|finding\.status === 'resolved'" cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
# 결과 ≥2 PASS (line 218 + 253)

# (10) useMultiPhotoUpload 직접 사용 (19/20 차이 2)
grep -cE 'useMultiPhotoUpload\(\)' cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
# 결과 ≥1 PASS

# (11) handleResolve memo.trim() validation
grep -cE 'memo\.trim\(\)|조치 내용을 입력하세요' cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
# 결과 ≥2 PASS

# (12) handleDownload location 기반 + iOS PWA
grep -cE '지적사항_\$\{name\}|finding\.location|createElement\(.a.\)|URL\.revokeObjectURL' cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
# 결과 ≥4 PASS

# (13) 모바일 고정 하단 CTA position fixed + paddingBottom calc
grep -cE "position: 'fixed'|paddingBottom: 'calc.*sab" cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
# 결과 ≥2 PASS

# (14) admin selector 패턴 (staff?.role === 'admin' && finding)
grep -cE "staff\?\.role === 'admin'|useAuthStore\(s =>" cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
# 결과 ≥3 PASS (selector + 모바일 + 데스크톱 분기)

# (15) @keyframes spin 중복 정의 (OQ #5 LOCKED 후 폐기 가능)
grep -cE '@keyframes spin' cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
# OQ #5 LOCKED 후 = 0 (Lucide Loader2 교체) / 이전 = 2 (line 45 + 147 중복)
```

---

## §9 Tailwind cheatsheet (v0.1.1 토큰 → utility class 매핑, 21-legal-finding-detail 적용)

| v0.1.1 토큰 (var alias) | Tailwind utility | LegalFindingDetailPage 적용 위치 (line) |
|---|---|---|
| `--surface-page` (var(--bg)) | `bg-surface-page` | 외곽 line 146 + 모바일 고정 CTA bg line 271 |
| `--surface-raised` (var(--bg2)) | `bg-surface-raised` | 모바일 헤더 line 149 (★ OQ #1) |
| `--surface-sunken` (var(--bg3)) | `bg-surface-sunken` | textarea line 221 + canAdd button line 234 + 데스크톱 admin 다운로드 button line 172 |
| `--border-default` (var(--bd)) | `border-border-default` | 모바일 헤더 borderBottom + 모바일 고정 CTA borderTop + Section borderBottom + 슬롯 img border |
| `--border-strong` (var(--bd2)) | `border-border-strong` | Spinner border + 데스크톱 admin 다운로드 button border + textarea border + canAdd button border-dashed |
| `--text-primary` (var(--t1)) | `text-text-primary` | 헤더 타이틀 + 데스크톱 타이틀 + KVRow children + textarea color + 데스크톱 admin 다운로드 button color |
| `--text-secondary` (var(--t2)) | `text-text-secondary` | 에러 단일 문장 (line 185) |
| `--text-tertiary` (var(--t3)) | `text-text-tertiary` | KVRow label + SectionHeader + '사진 없음' + 조치 사진 라벨 + canAdd button color |
| `--danger` | `bg-danger` | 제거 button bg (line 231) |
| `--accent` (CTA gradient) | 인라인 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` | 조치 완료 CTA (모바일 고정 line 270~275 + 데스크톱 inline line 244~248, ★ OQ #4 LOCKED **T3 만 예외 anchor ≥3**) |
| radius 8/9/10 | `rounded-sm` | textarea + canAdd button + 슬롯 img + 데스크톱 admin 다운로드 button |
| radius 12 | `rounded-md` | CTA button |
| radius 50% | `rounded-full` | 제거 button (-6,-6) 20x20 |
| Spacing 44px | `w-11 h-11` 또는 `w-[44px] h-[44px]` arbitrary | back button + admin 다운로드 button 44x44 (★ OQ #5, w-8=48 함정 회피) |

---

## §10 비즈 보존 체크박스

- [ ] `legalApi.getFinding(roundId, findingId)` 직접 호출 (line 63) — snake_case payload 변경 0
- [ ] `legalApi.resolveFinding(roundId, findingId, { resolution_memo, resolution_photo_keys })` snake_case payload (line 70~73)
- [ ] `useQuery({ queryKey: ['legal-finding', id, fid], ... })` (line 61~65)
- [ ] `useMutation` uploadAll 선행 + photoKeys.length > 0 분기 (line 67~74)
- [ ] `queryClient.invalidateQueries` 4 키 onSuccess (순서: legal-finding → legal-findings → legal-rounds → legal-round) (line 76~79)
- [ ] `toast.success('조치 완료')` + `resolutionPhotos.reset()` + `navigate(-1)` 순서 (line 80~82)
- [ ] `useMultiPhotoUpload()` 직접 호출 (line 59) — FindingFormSheet 우회 X (19/20 차이 2)
- [ ] `handleResolve` `memo.trim()` 빈 값 → `toast.error('조치 내용을 입력하세요')` validation (line 133~134)
- [ ] `finding.status === 'open'` Section 3 (form) / `'resolved'` Section 4 (결과) mutually exclusive (line 218 + 253)
- [ ] `staff?.role === 'admin' && finding` 조건부 admin 다운로드 button (line 159 모바일 + line 171 데스크톱)
- [ ] `staff = useAuthStore(s => s.staff)` selector 패턴 (line 58, 20-legal-findings getState() 와 다름)
- [ ] `handleDownload` `fflate` dynamic import + `zipSync` (line 93)
- [ ] `buildMetaTxt(finding)` 내용.txt always 포함 (line 98)
- [ ] `Promise.allSettled` photoKeys + resolutionPhotoKeys (line 100, 107)
- [ ] iOS PWA `<a download>` 패턴 — createElement + body.appendChild + click + removeChild + `setTimeout(URL.revokeObjectURL(url), 3000)` (line 117~123)
- [ ] ZIP 파일명 location 기반 `지적사항_${name}.zip` where `name = (finding.location ?? '위치없음').replace(/[\/\\:*?"<>|]/g, '_')` (line 96, 119 — 19/20 차이 4)
- [ ] 사진 파일명 `지적사진-${j+1}.jpg` / `조치사진-${j+1}.jpg` (line 104, 111)
- [ ] `@keyframes spin` 중복 정의 (line 45 + 147) — OQ #5 LOCKED Lucide Loader2 교체 시 양쪽 폐기
- [ ] toast 카피 5종 verbatim — '조치 완료'/'다운로드 완료'/'조치 처리 실패'/'조치 내용을 입력하세요'/'다운로드 실패'
- [ ] 카피 verbatim — 헤더 '지적 상세' (정적) / SectionHeader 4종 / KVRow label 7종 / 위치 fallback '-' / 등록자 fallback `??` / '사진 없음' / 조치 사진 라벨 / textarea placeholder / canAdd / 슬롯 제거/업로드 중 / CTA '조치 완료'/'처리 중...' / 데스크톱 admin '다운로드'/'다운로드 중...'

§6.4 CTA 카테고리 (design-system 일관) — 메인 액션 단일 = 그라데이션 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` 후보:
조치 완료 CTA 가 본 페이지의 유일한 메인 액션 → ★ OQ #4 LOCKED 그라데이션 anchor ≥3.

---

## §11 메모리 룰 inline (12+ rule citations)

1. **feedback_inspection_unresolved_color.md** (일반화)
   - status 표시 화면 모드 자체로 일반화 (칩 없음, `finding.status === 'open'` / `'resolved'` 분기 source of truth)
   - KVRow value 좌측 강조 (borderLeft 등) 없음. OQ #2 LOCKED.

2. **project_inspection_completion_rule.md** (일반화)
   - admin role 분기 (selector 패턴) + finding.status 분기 source of truth 일반화.
   - `staff?.role === 'admin' && finding` (admin 다운로드 button 조건부, line 159/171).

3. **feedback_tailwind_token_class_pattern.md**
   - status- prefix 없음 (`text-status-safe` 같은 패턴 사용 시 W5 verify FAIL).
   - Lucide `<Icon size={N} />` prop (OQ #5 LOCKED: ChevronLeft 20 + Download 18 + Loader2 24 + Camera 22).

4. **feedback_tailwind_w8_h8_is_48px.md** (tailwind config 함정)
   - `w-8` / `h-8` = 48px (4 = 32px). back/admin 다운로드 button 44x44 = `w-11 h-11` 또는 `w-[44px] h-[44px]` arbitrary (OQ #5 LOCKED).

5. **feedback_text_caption_leading_none.md** ★ 핵심
   - 작은 컨테이너 안 `text-caption` (12, lh:1.5 = 18) 시각 패딩 → leading-none 명시 (OQ #3 LOCKED).
   - uploading overlay '업로드 중' 10 / 제거 button '✕' 11 / canAdd '사진 첨부' 11 모두 격상 → text-caption leading-none.

6. **feedback_sketch_realistic_data.md**
   - 표시 분기/라벨 룰 코드 그대로. 헤더 타이틀 '지적 상세' 정적 / KVRow label 7종 / SectionHeader 4종 / toast 5종 / 위치 fallback '-' / fmtDate 분까지 모두 verbatim.

7. **feedback_design_changes_ask_first.md**
   - 디자인 변경 전 사용자 컨펌. W1 OQ 5건 default LOCKED 2026-05-25 013 — 사용자 "다음 진행" 으로 LOCKED.

8. **feedback_planner_prompt_sketch_verbatim.md**
   - sketch CSS 토큰/사이즈 grep 추출 → W5 checklist 안 verbatim 인용. 본 §9 Tailwind cheatsheet + §3 변환 매핑 박제.

9. **feedback_tsx_wave_emoji_dot_gap.md**
   - sketch negative gate 이모지 0건. '📷' (line 237) → Lucide Camera 22 교체 후 본 페이지 직접 사용 이모지 폐기.

10. **feedback_tsx_wave_stat_card_drift.md**
    - source outline 패턴 보존 + sketch 새 패턴 누락 방지.
    - 단일 finding 상세 페이지 = 진척률 도넛/통계 카드/카테고리 카드 없음 — 미적용.

11. **feedback_subagent_production_deploy_forbidden.md**
    - 메인 Claude + 사용자 같은 턴 명시 OK 한정. wrangler 명령 절대 X (디자인 wave).

12. **feedback_redesign_sketch_rule_enforcement.md**
    - §6.2 negative rule (위험 임계치 아닌 카드는 status 색 금지 — OQ #2 LOCKED 일치) + §6.3/§7.1 일관성.
    - executor 프롬프트 + verify gate + 자체 검수 4중 강화.

13. **feedback_cbc7119_design_never_wrangler.md**
    - 디자인 작업 wrangler 명령 자체 금지. cbc7119-preview 자동 배포 사이클만.

---

## §12 다음 단계 — 단일 finding 페이지 자체로 종결

본 PLAN (W2~W5) 완료 후:

1. **W6 TSX 변환 wave** (다음 turn 진입점, 별도 quick task) —
   - `LegalFindingDetailPage.tsx` (279 lines) **단일 atomic** 변환 (3 영역 통합).
   - 본 W5 checklist 의 §3 변환 매핑 + §8 자체 verify grep 모음 + §10 비즈 보존 체크박스 기반.
   - 다른 9 src 파일 (외부 6 + App.tsx + 조부모 LegalPage + 부모 LegalFindingsPage) 모두 **0 byte 변경**.

2. **단일 finding 페이지 자체로 종결**:
   - LegalFindingDetailPage 는 풀 페이지 단독 (찾아 들어가는 자식 페이지가 없음).
   - 조부모 LegalPage 의 19-legal 변환 = **이미 완료** (redesign/19-legal 0c34e83).
   - 부모 LegalFindingsPage 변환 = **별도 wave** (redesign/20-legal-findings 본 시점 완료 — wic 4 sketch + TSX 변환 별도 wave).
   - 본 페이지 (LegalFindingDetailPage) 변환 = **W6 만 남음** (단일 finding 페이지 자체로 종결).

3. **직원 도메인 X**:
   - cbc7119-preview 자동 배포만 (디자인 wave).
   - 직원 도메인 cbc7119 = 별도 워크트리 (20260328) 책임 — wrangler 명령 절대 X.

4. **메모리 박제 (W6 완료 후)**:
   - `project_redesign_21_legal_finding_detail_status.md` (W1 인덱스 + W2~W5 sketch+checklist 4 atomic + W6 TSX 변환 완결 박제).
   - LegalFinding 시리즈 19/20/21 3 페이지 (LegalPage + LegalFindingsPage + LegalFindingDetailPage) 모두 redesign 완료 status update.

---

**최종 src 10 파일 0 byte verify gate (본 PLAN 종료 시점):**

```bash
git diff --name-only HEAD~4 HEAD -- \
  cha-bio-safety/src/pages/LegalFindingDetailPage.tsx \
  cha-bio-safety/src/components/PhotoGrid.tsx \
  cha-bio-safety/src/components/PhotoSourceModal.tsx \
  cha-bio-safety/src/hooks/useMultiPhotoUpload.ts \
  cha-bio-safety/src/utils/findingDownload.ts \
  cha-bio-safety/src/utils/api.ts \
  cha-bio-safety/src/stores/authStore.ts \
  cha-bio-safety/src/App.tsx \
  cha-bio-safety/src/pages/LegalPage.tsx \
  cha-bio-safety/src/pages/LegalFindingsPage.tsx
# 결과 empty = PASS (4 sketch+checklist commit 만 — src 변경 0 byte)
# 결과 non-empty = FAIL (src 파일 수정 — 0 byte 룰 위반)
```
