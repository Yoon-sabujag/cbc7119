---
title: "redesign/22-documents — W6 TSX 변환 verify checklist"
status: complete
created: 2026-05-26
quick_id: 260526-8yx
branch: redesign/22-documents
source_files:
  - cha-bio-safety/src/pages/DocumentsPage.tsx (162 lines, 변환 대상)
  - cha-bio-safety/src/components/DocumentSection.tsx (517 lines, 변환 대상)
  - cha-bio-safety/src/components/DocumentUploadForm.tsx (402 lines, 변환 대상)
  - 합계 1081 lines / 3 파일 multi-file scope
mirror_of:
  - cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md (slq, 단일 1216)
  - 19-legal (6if) / 20-legal-findings (bbz) / 21-legal-finding-detail (lft) / 23-education (4i9) / 28-splash (0803d2f) 5 페이지 checklist 패턴
oq_locked: 5 (#1~#5, wave-1-index.md §7)
biz_anchor_groups: 9
sketch_grep_classes: 36 unique (≥8 마지노선 충족)
memory_rules: ≥12 unique slug
components_css_reuse: 3 / new: 17
negative_count: 17
verify_gate_count: 22
---

본 문서는 redesign/22-documents 의 **W7 TSX 변환 wave 단일 진입점** 이다. 18-worklog slq W7 / 19-legal 6if / 20-legal-findings bbz / 21-legal-finding-detail lft / 23-education 4i9 / 28-splash 0803d2f 6 mirror 의 정확한 박제. 22-documents 만 multi-file scope (3 파일 1081 lines) 차이.

12 섹션:

────────────────────────────────────────

# §1. imports 매핑 (3 파일 영역별)

[DocumentsPage.tsx 변환 후 import 블록 (verbatim, line 10~13 기반)]
```tsx
import { useState } from 'react'
import { useIsDesktop } from '../hooks/useIsDesktop'
import DocumentSection from '../components/DocumentSection'
import DocumentUploadForm from '../components/DocumentUploadForm'
// (Lucide 미사용 — 본 파일은 chrome 만)
```

[DocumentSection.tsx 변환 후 import 블록 (verbatim, line 7~15 기반)]
```tsx
import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FileText, Plus, Loader2, Trash2 } from 'lucide-react'
import { documentsApi, type DocumentListItem } from '../utils/api'
import { downloadDocument } from '../utils/downloadBlob'
import { formatBytes } from '../utils/multipartUpload'
import { useAuthStore } from '../stores/authStore'
import { useIsDesktop } from '../hooks/useIsDesktop'
```

[DocumentUploadForm.tsx 변환 후 import 블록 (verbatim, line 7~16 기반)]
```tsx
import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { runMultipartUpload, formatBytes, formatEta, type ProgressState } from '../utils/multipartUpload'
import { ApiError } from '../utils/api'
```

verify: 3 import 블록 모두 1 byte 변경 0 (변환 후 alias rename / 경로 수정 0). Lucide 4종 (FileText/Plus/Loader2/Trash2) 만 import. AlertTriangle/Upload/X 등 추가 옵션은 §8 LOCKED 미사용.

────────────────────────────────────────

# §2. 메인 함수 시그니처 보존

[DocumentsPage]
- `export default function DocumentsPage()` — props 없음
- useState<DocType> `activeTab` (default 'plan') + useState<DocType|null> `uploadFor`
- tabBtnStyle 헬퍼 함수 (active border-accent + 2px borderBottom)
- isDesktop = useIsDesktop() ≥1024 분기
- DocType = 'plan' | 'drill' 타입 보존

[DocumentSection]
- `export default function DocumentSection({ type, onUploadClick }: Props)`
- Props 인터페이스 `type: 'plan' | 'drill'; onUploadClick: () => void` 보존
- `formatDate(iso, mode 'full'|'date-only')` 헬퍼 보존
- `typeLabel(t: 'plan' | 'drill')` 헬퍼 verbatim '소방계획서/소방훈련자료'
- `isAdmin = useAuthStore((s) => s.staff?.role === 'admin')` 보존
- `deletingIds = useState<Set<number>>(new Set())` per-item 잠금 상태 보존
- useQuery({ queryKey: ['documents', type], queryFn, staleTime: 60_000 }) 보존

[DocumentUploadForm]
- `export default function DocumentUploadForm({ type, onClose }: Props)`
- Props 인터페이스 `type: 'plan' | 'drill'; onClose: () => void` 보존
- `ALLOWED` 6 ext + `EXT_TO_MIME` + `MAX_SIZE` 500MB + `typeLabel` + `findAllowed` 헬퍼 모두 verbatim
- 7 state (year + title + file + progress + isUploading + error + abortRef + fileInputRef) verbatim
- 2 useEffect (beforeunload + unmount abort) verbatim
- 4 handler (handleFileChange + handleSubmit + handleCancel + handleRetry) verbatim

verify: 3 메인 함수 모두 시그니처 + state 인터페이스 1 byte 변경 0.

────────────────────────────────────────

# §3. JSX render 영역 매핑 (3 파일 영역별)

[DocumentsPage render (line 34~162 기반)]
- 모바일 분기 (line 41~64) — div sticky top-0 z-10 flex bg-surface-page border-b border-border-default mb-4 → `.docs-tab-bar` + activeTab 별 tabBtnStyle 함수 → `.docs-tab-btn` / `.docs-tab-btn-active` (border-accent — OQ #1)
- 데스크톱 분기 (line 66~83) — 좌우 2단 maxWidth 1200 gap 48 padding 24 → flex gap-12 max-w-[1200px] mx-auto p-6 (또는 arbitrary 1200/48/24)
- upload shell 모바일 (line 86~126) — BottomSheet + handle 40x4 + slideUp 240ms + backdrop NO-OP 코멘트 verbatim 유지
- upload shell 데스크톱 (line 128~159) — Modal + fade-in 180ms + min(480px,92vw) + backdrop NO-OP 코멘트 verbatim 유지
- @keyframes docs-slide-up + docs-fade-in 인라인 정의 (line 36~39) 보존

[DocumentSection render (line 165~516 기반)]
- 헤더 행 (line 170~180) — flex justify-between items-center min-h-10 + h2 16/600 + uploadBtn 분기 (admin 40x40 모바일 / 40 pill 데스크톱)
- 4 state 매트릭스:
  - loading (line 183~196) — 96+56+56 스켈레톤 3행 bg-surface-raised
  - error (line 199~233) — '문서 목록을 불러오지 못했습니다.' + 다시 시도 button bg-accent
  - empty (line 236~260) — FileText size={48} + admin/non-admin 카피 분기 (typeLabel 사용)
  - data (line 263~514) — Hero card (latest) + 과거 이력 list (history)
- Hero card (line 263~394) — 최신 pill bg-accent text-caption font-bold leading-none + Year tile 64x64 bg-surface-sunken JetBrains Mono 28/600 + Meta verbatim 포맷 + Loader2 spin + admin Trash2 32x32
- 과거 이력 list (line 397~514) — 연결된 borderRadius isFirst/isLast + Year+Title 14/600 + meta 14/400 + admin Trash2 32x32
- @keyframes docsec-spin (line 167) 보존

[DocumentUploadForm render (line 201~401 기반)]
- 모달 title (line 204) — '${label} 업로드' text-heading 22/600 (OQ #4 격상)
- year select (line 207~221) — yearOptions descending currentYear+1 → 2020
- title input (line 223~234) — placeholder verbatim '예: ${currentYear}년 ${label}'
- file dashed button (line 236~272) — bg-surface-sunken border-dashed border-border-default + 보조 'PDF, XLSX, DOCX, PPTX, HWP, ZIP · 최대 500MB' text-caption leading-none 12 (OQ #3)
- Progress block (line 274~322) — height-2 bg-surface-sunken + fill bg-accent transition-[width] duration-[240ms] ease-linear + meta (% 16/600 + speedBps + ETA 14/400)
- Error block (line 324~360) — bg-surface-sunken text-danger text-body-sm 14 font-medium (OQ #4 14 격상) + 다시 시도 button bg-accent
- Action row (line 362~399) — submit (lin-grad OQ #2 LOCKED) + cancel (border-border-default)

verify: 3 파일 영역 매핑 모두 line range 박제. JSX render 영역별 토큰 매핑 100%.

────────────────────────────────────────

# §4. 비즈 anchor 박스 (9 그룹, 1 byte 변경 0)

```
[GROUP 1 — documentsApi 2종 (utils/api 외부 의존 미수정)]
- documentsApi.list(type: 'plan' | 'drill') → Promise<DocumentListItem[]> (시그니처 변경 금지)
- documentsApi.remove(id: number) → Promise<void> (시그니처 변경 금지)
- documentsApi.upload — runMultipartUpload 내부 호출 (직접 호출 0)
- DocumentListItem type (id / type / year / title / filename / size / uploaded_by_name / uploaded_at) 보존

[GROUP 2 — useQuery + invalidateQueries (react-query 시그니처)]
- useQuery({ queryKey: ['documents', type], queryFn: () => documentsApi.list(type), staleTime: 60_000 })
- queryClient.invalidateQueries({ queryKey: ['documents', type] }) (DocumentSection handleDelete + DocumentUploadForm handleSubmit 2곳)
- query key 1 byte 변경 0 (변경 시 cache mismatch → silent stale)

[GROUP 3 — ALLOWED 6 ext + EXT_TO_MIME + MAX_SIZE 500MB]
- ALLOWED 6 ext: .pdf .xlsx .docx .pptx .hwp .zip (verbatim, DocumentUploadForm line 23~30)
- EXT_TO_MIME 매핑 (verbatim, line 32~39) — fallback contentType
- MAX_SIZE = 500 * 1024 * 1024 (500MB) (verbatim, line 41)

[GROUP 4 — empty MIME fallback (HWP/ZIP iOS Safari)]
- 조건 `if (f.type && !(entry.mimes as readonly string[]).includes(f.type))` verbatim (line 96)
- HWP/ZIP empty MIME 통과 허용 (iOS Safari file.type 비어있는 케이스 대응)

[GROUP 5 — multipart upload runMultipartUpload]
- runMultipartUpload({ file, type, year, title, contentType, signal, onProgress }) (verbatim, line 122~130)
- contentType fallback: file.type || (entry ? EXT_TO_MIME[entry.ext] : 'application/octet-stream') (verbatim, line 112)
- onProgress: (p: ProgressState) => setProgress(p) — ProgressState 타입 보존

[GROUP 6 — abort/retry]
- AbortController abortRef = useRef<AbortController | null>(null) (line 59)
- ctrl = new AbortController() + abortRef.current = ctrl + try { runMultipartUpload({ ..., signal: ctrl.signal, ... }) } finally { abortRef.current = null } (line 118~152)
- AbortError 분기: err.name === 'AbortError' → message '업로드가 취소되었습니다.' + isAbort=true → toast 미발송 (line 137~138)
- handleCancel: isUploading 시 window.confirm → ok → abortRef.current?.abort() (line 155~166)
- handleRetry: setError(null) + void handleSubmit() (line 168~171)
- unmount cleanup useEffect: return () => abortRef.current?.abort() (line 75~79)

[GROUP 7 — beforeunload guard]
- useEffect (line 64~72) — isUploading 동안만 listener 등록
- handler returnValue verbatim '업로드 중입니다. 페이지를 나가면 전송이 중단됩니다.' (1 byte 변경 0)
- 화면 이동/리로드 시 브라우저 confirm 자동 발동

[GROUP 8 — admin 권한 isAdmin]
- isAdmin = useAuthStore((s) => s.staff?.role === 'admin') (verbatim, DocumentSection line 40)
- uploadBtn 분기 — isAdmin false 시 null 반환 (line 118 + 163)
- Trash2 button 분기 — isAdmin true 만 (Hero line 364 + 과거 line 482)
- 403 → '관리자만 업로드할 수 있습니다.' (DocumentUploadForm line 141, 1 byte 변경 0)
- ApiError status 분기로 403 카피 강제 매핑

[GROUP 9 — ★ delete confirm gate full string (memory project_legal_findings_delete_incident_260520)]
- DocumentSection handleDelete (line 87~89) window.confirm full string verbatim:
  "${item.title}\n(${item.filename})\n\n정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
- 1 byte 변경 0 (2026-05-20 22행 삭제 사고 후 가드 강화 룰 일반화)
- 위치 보존 (Hero 카드 우하단 absolute + 과거 row 우측 행 안)
- 추가 가드: deletingIds Set state per-item 잠금 / Loader2 spin during delete / aria-disabled
- delete 성공 후 toast.success('삭제했습니다.') + invalidateQueries (2 step)
```

verify: 9 그룹 모두 anchor verbatim 박제. grep gate 9 (그룹 별 ≥1 anchor).

────────────────────────────────────────

# §5. OQ LOCKED 5건 verbatim 인용 (wave-1-index.md §7)

## §5.1 OQ #1 — chrome 강조색 토큰 통일 (LOCKED default)

> 모바일 탭 active borderBottom `2px solid #2f81f7` + 최신 pill bg `#2f81f7` + uploadBtn 데스크톱 pill bg `#2f81f7` + submit button bg `#2f81f7` + progress fill bg `#2f81f7` + Error 다시 시도 button bg `#2f81f7` + DocumentSection error 다시 시도 button bg `#2f81f7` — 모두 동일 hex `#2f81f7` 인데 → `bg-accent` / `border-accent` 토큰 통일.
> default 답: 토큰 통일 (`bg-accent` / `border-accent`). 16-workshift / 17-annual-plan / 23-education / 28-splash 4 페이지 일관 패턴.

22-documents 적용: 7곳 모두 `bg-accent` / `border-accent` 치환. fallback (tokens.css mismatch 시): `bg-[#2f81f7]` arbitrary (16-workshift 사례).

## §5.2 OQ #2 — submit button 그라데이션 (LOCKED default)

> submit button 현재 solid `#2f81f7` (line 371) → design-system §6.4 그라데이션 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` 통일.
> default 답: 그라데이션 OK (lin-grad 채택). 14-reports / 16-workshift / 17-annual-plan / 23-education W1 OQ #3 그라데이션 default 일관.

22-documents 적용: DocumentUploadForm line 371 submit button `background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)'` 인라인 또는 components.css `.btn-primary-gradient` 신규 클래스. canSubmit false 시 `bg-surface-sunken text-text-tertiary cursor-not-allowed` 분기 보존. T2/T3 sketch 본문 lin-grad 0건 — T4 + checklist §4/§5 만 anchor.

## §5.3 OQ #3 — 최신 pill 11 → 12 격상 (LOCKED default)

> 최신 pill 현재 `fontSize 11/600` (line 292~298, 노안 마지노선 12 위반) → 12/600 격상.
> default 답: 12 격상 OK. design-system §1.1 노안 마지노선 12 / 9·10·11px 사용 금지. memory `feedback_text_caption_leading_none` 일관.

22-documents 적용: 최신 pill `text-caption font-bold leading-none` (12px). 파일 보조 'PDF, XLSX, DOCX, PPTX, HWP, ZIP · 최대 500MB' (line 269) 도 `text-caption leading-none` 유지.

## §5.4 OQ #4 — 빈/오류/Progress 시각 일관성 (LOCKED default)

> 빈 상태 FileText 48 유지. 오류 상태는 카피만 (아이콘 추가 옵션). Progress 메타 14 → text-body-sm 유지. 모달 title 20 → text-heading 22 격상. Error 카피 13 → text-body-sm 14 격상.

22-documents 적용:
- 빈 FileText size={48} 유지 (DocumentSection line 250)
- 모달 title `${label} 업로드` text-heading 22/600 (DocumentUploadForm line 204, 20 → 22 격상)
- Error 카피 14 font-medium (DocumentUploadForm line 338, 13 → 14 격상 — 13px 사용 금지)
- Progress meta 16/600 % + 14/400 speedBps 유지

## §5.5 OQ #5 — var(--bg4) → bg-surface-sunken 통일 (LOCKED default)

> var(--bg4) 토큰 (DocumentUploadForm inputBaseStyle bg, line 184 + progress bar 배경 line 284) → bg-surface-sunken 통일.
> default 답: bg-surface-sunken 통일. 새 토큰 신설 안 함.

22-documents 적용: inputBaseStyle bg + progress bar bg + Year tile bg + dashed file button bg 모두 `bg-surface-sunken` 통일 (4곳). var(--bg3) + var(--bg4) 모두 동일 sunken 매핑.

verify: §5.1~§5.5 5건 헤더 grep `grep -cE '^## §5\.[1-5]' wave-6-tsx-conversion-checklist.md` = 5.

────────────────────────────────────────

# §6. sketch grep fence verbatim 박제 (≥8 unique class)

executor 실행 명령:
```bash
grep -hoE 'class="[^"]+"' cha-bio-safety/docs/redesign-context/22-documents/sketch-wave-*.html | sort -u
```

위 명령 결과 verbatim 박제 (planner 추측 X — executor 실시간 grep 결과 박제, 36 unique class):

```
class="bg-accent text-text-on-accent text-body-sm font-semibold rounded-sm"
class="bg-accent text-text-on-accent text-body-sm font-semibold"
class="bg-accent"
class="bg-surface-raised border border-border-default rounded-md"
class="bg-surface-sunken border border-border-default rounded-sm"
class="bg-surface-sunken border border-border-default text-text-primary rounded-sm text-body-sm"
class="bg-surface-sunken border border-dashed border-border-default text-text-primary rounded-sm text-body-sm"
class="bg-surface-sunken border border-dashed border-border-default text-text-secondary rounded-sm text-body-sm"
class="bg-surface-sunken rounded-sm"
class="bg-surface-sunken text-text-primary text-body-sm rounded-sm"
class="bg-surface-sunken text-text-tertiary text-body-sm font-semibold rounded-sm"
class="dialog-overlay"
class="dialog"
class="frame frame-desktop"
class="frame frame-mobile"
class="frame-label"
class="placeholder"
class="rules-box"
class="sketch-wrap"
class="star"
class="text-body font-semibold text-text-primary"
class="text-body-sm font-normal text-text-secondary"
class="text-body-sm font-semibold text-text-primary"
class="text-caption font-bold leading-none"
class="text-caption leading-none text-text-secondary font-normal"
class="text-danger font-semibold"
class="text-danger rounded-sm"
class="text-danger text-body-sm font-medium"
class="text-heading font-semibold text-text-primary"
class="text-text-on-accent text-body-sm font-semibold rounded-sm"
class="text-text-primary font-semibold"
class="text-text-primary text-body font-semibold"
class="text-text-primary text-body-sm font-semibold rounded-sm"
class="text-text-primary text-body-sm"
class="text-text-secondary font-normal"
class="text-text-secondary text-body-sm"
class="text-text-tertiary text-caption"
```

(36 unique class 모두 박제. ≥8 마지노선 4.5배 초과 충족. 4 sketch wave 합산 결과)

분석:
- 비즈 토큰 anchor (`bg-accent` / `bg-surface-sunken` / `bg-surface-raised` / `text-danger` / `text-text-on-accent` / `text-text-primary` / `text-text-secondary` / `text-text-tertiary` / `border-border-default`) 모두 일관
- 폰트 토큰 anchor (`text-heading` / `text-body` / `text-body-sm` / `text-caption`) 4 단계 일관 (격상 OQ #3/#4 LOCKED 반영)
- `leading-none` 작은 컨테이너 강제 (text-caption 2곳 + text-caption leading-none 등장 — memory feedback_text_caption_leading_none)
- `font-bold` / `font-semibold` / `font-medium` / `font-normal` 4 단계 모두 등장
- sketch 인프라 클래스 (`frame frame-mobile` / `frame frame-desktop` / `frame-label` / `sketch-wrap` / `placeholder` / `rules-box` / `dialog` / `dialog-overlay` / `star`) TSX 변환 시 모두 제거 대상 (sketch 전용)

verify: §6 fence ≥1 + 본문 안 grep 명령 verbatim 1회 + 결과 line 36 (≥8 마지노선 만족).

────────────────────────────────────────

# §7. 폰트 격상 매핑 (9·10·11 → 12/14/16/18 line 별)

[DocumentsPage]
- tabBtnStyle fontSize: 16 (line 27) → text-body (마지노선) ✓
- handle bar / @keyframes — 폰트 없음

[DocumentSection]
- h2 헤더 (line 178): fontSize: 16, fontWeight: 600 → text-body font-semibold
- uploadBtn 데스크톱 pill (line 132): fontSize: 14, fontWeight: 600 → text-body-sm font-semibold
- error 카피 (line 212): fontSize: 16, fontWeight: 600 → text-body font-semibold
- error '다시 시도' button (line 223): fontSize: 14, fontWeight: 600 → text-body-sm font-semibold
- empty '아직 업로드된...' (line 251): fontSize: 16, fontWeight: 600 → text-body font-semibold
- empty admin/non-admin 카피 (line 254): fontSize: 14, fontWeight: 400 → text-body-sm font-normal
- 최신 pill (line 292): **fontSize: 11, fontWeight: 600 → text-caption font-bold leading-none (12 격상, OQ #3 LOCKED)** ★
- Year tile (line 319): fontSize: 28, fontWeight: 600 fontFamily 'JetBrains Mono' → font-mono text-display font-semibold
- Hero 이름 (line 332): fontSize: 16, fontWeight: 600 → text-body font-semibold
- Hero meta (line 344): fontSize: 14, fontWeight: 400 → text-body-sm font-normal
- 과거 이력 라벨 (line 401): fontSize: 16, fontWeight: 600 → text-body font-semibold
- 과거 row Year+Title (line 448): fontSize: 14, fontWeight: 600 → text-body-sm font-semibold
- 과거 row meta (line 460): fontSize: 14, fontWeight: 400 → text-body-sm font-normal

[DocumentUploadForm]
- 모달 title (line 204): **fontSize: 20, fontWeight: 600 → text-heading font-semibold (22 격상, OQ #4 LOCKED)** ★
- labelStyle (line 195): fontSize: 14, fontWeight: 600 → text-body-sm font-semibold
- inputBaseStyle (line 188): fontSize: 14 → text-body-sm
- file button (line 259): fontSize: 14 → text-body-sm
- 파일 보조 (line 269): **fontSize: 12, fontWeight: 400 → text-caption leading-none font-normal (OQ #3 LOCKED leading-none 강제)** ★
- Progress % (line 308): fontSize: 16, fontWeight: 600 fontFamily 'JetBrains Mono' → font-mono text-body font-semibold
- Progress meta (line 311): fontSize: 14, fontWeight: 400 → text-body-sm font-normal
- Error 카피 (line 338): **fontSize: 14, fontWeight: 500 → text-body-sm font-medium (13 → 14 격상, OQ #4 LOCKED)** ★
- Error '다시 시도' button (line 348): fontSize: 14, fontWeight: 600 → text-body-sm font-semibold
- submit button (line 374): fontSize: 15, fontWeight: 600 → text-body font-semibold (15 → 16 ↓ 0)
- cancel button (line 390): fontSize: 15, fontWeight: 600 → text-body font-semibold

verify: 9·10·11 fontSize 인라인 0 (최신 pill 11 → 12 격상 + 보조 12 leading-none 강제). text-caption 12 leading-none 마지노선.

────────────────────────────────────────

# §8. Lucide ≥5종 size prop 매핑 (size prop 룰)

| icon | size | 위치 | className |
|---|---|---|---|
| FileText | 48 | DocumentSection 빈 상태 (line 250) | text-text-tertiary |
| Plus | 16 | DocumentSection uploadBtn 데스크톱 (line 139) | text-on-accent |
| Plus | 20 | DocumentSection uploadBtn 모바일 (line 160) | text-text-primary |
| Loader2 | 16 | Hero card spin (line 358) + 과거 row spin (line 473) + Trash2 spin (line 387 + 503) | text-text-secondary + animate-spin |
| Trash2 | 16 | Hero admin (line 389) + 과거 admin (line 505) | text-danger |
| Upload | 16/20 | DocumentUploadForm file dashed button 옵션 (현재 미사용 — text label 만) | text-text-secondary |
| X | 16 | DocumentUploadForm 모달 닫기 옵션 (현재 미사용 — handleCancel button 만) | text-text-primary |
| AlertTriangle | 16/20 | DocumentSection error block 옵션 (현재 미사용 — 카피만, OQ #4 LOCKED 추가 옵션) | text-danger |

룰 (memory feedback_tailwind_token_class_pattern):
- size prop 사용 (`size={N}` O, `w-N h-N` className X)
- 색은 토큰 className (`text-danger` O, `color="var(--danger)"` 인라인 X)
- status- prefix 0 (`text-danger` O, `text-status-danger` X)
- stroke-width: 24 이하 default 2, 48 이상 1.5 검토 (FileText 48 → strokeWidth 1.5 옵션)

verify: ≥5종 Lucide 박제 + size prop 사용 100% + w-N/h-N className 0.

────────────────────────────────────────

# §9. components.css inherit (재사용 3 + 신규 17)

[재사용 ≥3 — 기존 components.css 클래스 그대로]

`.btn-primary` (기존 — 14-reports / 16-workshift / 17-annual-plan / 23-education 일관)
→ DocumentSection error '다시 시도' button + DocumentSection uploadBtn 데스크톱 pill + DocumentUploadForm Error '다시 시도' button
→ bg-accent + h-11 (또는 h-10) + px-4 + text-body-sm + font-semibold + rounded-lg
→ submit button 은 OQ #2 LOCKED lin-grad → 신규 `.btn-primary-gradient` 별도 생성

`.btn-secondary` (기존 — 14-reports / 16-workshift / 17-annual-plan / 23-education 일관)
→ DocumentUploadForm cancel button
→ transparent + border-border-default + text-text-primary + h-11 + text-body font-semibold + rounded-lg

`.empty-state` (기존 — 14-reports / 23-education 일관)
→ DocumentSection empty block wrapper
→ flex column items-center gap-3 px-6 py-12 + bg-surface-raised + rounded-xl + border-border-default

[신규 ≥15 — 22-documents 전용 새 클래스]

1. `.docs-tab-bar` — DocumentsPage 모바일 탭 sticky top-0 z-10 flex bg-surface-page border-b border-border-default mb-4
2. `.docs-tab-btn` + `.docs-tab-btn-active` — flex-1 h-11 bg-transparent text-body / active text-text-primary font-semibold border-b-2 border-accent
3. `.docs-section-header` — flex justify-between items-center min-h-10 (DocumentSection 헤더 행)
4. `.docs-hero-card` — relative w-full min-h-24 p-6 bg-surface-raised border-border-default rounded-xl flex items-center gap-4 cursor-pointer
5. `.docs-year-tile` — w-16 h-16 bg-surface-sunken rounded-lg flex items-center justify-center font-mono text-display font-semibold text-text-primary flex-shrink-0
6. `.docs-latest-pill` — absolute top-3 right-3 text-caption font-semibold leading-none text-on-accent bg-accent px-2 py-1 rounded-full (OQ #3 12 격상)
7. `.docs-history-row` — w-full min-h-14 p-4 bg-surface-raised border-border-default flex items-center gap-3 cursor-pointer (first:rounded-t-lg + last:rounded-b-lg)
8. `.docs-trash-btn` — w-[32px] h-[32px] inline-flex items-center justify-center bg-transparent text-danger border border-border-default rounded-lg (w-8 = 48 함정 회피)
9. `.docs-upload-btn-mobile` — w-[40px] h-[40px] inline-flex items-center justify-center bg-transparent text-text-primary border border-border-default rounded-lg
10. `.docs-upload-sheet` + `.docs-upload-sheet-body` — fixed inset-0 bg-black/55 z-[1000] flex items-end / body w-full max-h-[85vh] overflow-y-auto bg-surface-raised rounded-t-2xl p-6 animate-slide-up
11. `.docs-upload-modal` + `.docs-upload-modal-body` — fixed inset-0 bg-black/55 z-[1000] flex items-center justify-center animate-fade-in / body w-[min(480px,92vw)] max-h-[85vh] overflow-y-auto bg-surface-raised border-border-default rounded-xl p-6
12. `.docs-sheet-handle` — w-10 h-1 bg-border-default rounded-sm mx-auto mb-4 (40x4)
13. `.docs-input` — w-full h-11 px-3 bg-surface-sunken text-text-primary border-border-default rounded-lg text-body-sm (OQ #5 var(--bg4) → bg-surface-sunken)
14. `.docs-file-btn` + `.docs-file-btn-filled` — w-full h-11 px-3 bg-surface-sunken text-text-secondary border border-dashed border-border-default rounded-lg text-body-sm text-left truncate / filled text-text-primary
15. `.docs-progress-bar` + `.docs-progress-fill` — h-2 bg-surface-sunken rounded-sm overflow-hidden / fill h-full bg-accent rounded-sm transition-[width] duration-[240ms] ease-linear
16. `.docs-error-block` — flex items-center justify-between gap-3 p-3 bg-surface-sunken border-border-default rounded-lg / 본문 text-danger text-body-sm font-medium flex-1
17. `.btn-primary-gradient` — bg gradient (OQ #2 LOCKED lin-grad 135deg #1d4ed8 #0ea5e9) + h-11 + text-body + font-semibold + rounded-lg + disabled:bg-surface-sunken disabled:text-text-tertiary disabled:cursor-not-allowed

(재사용 3 + 신규 17 = 20개 ≥ 18 ≥ 신규 ≥15 + 재사용 ≥3 양쪽 만족)

verify: components.css inherit 표 grep `^[0-9]+\. \.docs-` ≥15 + `^\.btn-` (재사용) ≥2.

────────────────────────────────────────

# §10. Tailwind cheatsheet (12 마지노선 + w-N 함정 회피)

| 영역 | Tailwind class | 비고 |
|---|---|---|
| 32x32 (admin Trash2) | `w-[32px] h-[32px]` 또는 `w-7 h-7` | ★ `w-8 h-8` = 48px 함정 (memory feedback_tailwind_w8_h8_is_48px) |
| 40x40 (모바일 uploadBtn) | `w-[40px] h-[40px]` | arbitrary 권장 |
| 44 (input + button height) | `h-11` | tailwind.config spacing override |
| 40 (데스크톱 uploadBtn pill) | `h-10` | |
| 56 (과거 row min-h) | `min-h-14` | |
| 96 (Hero min-h) | `min-h-24` | |
| 64 (Year tile) | `w-16 h-16` | |
| 11px → 12px | `text-caption` (12) + `leading-none` | ★ 9·10·11 사용 금지 (OQ #3 LOCKED + memory feedback_text_caption_leading_none) |
| 12px | `text-caption` + `leading-none` (작은 컨테이너) | |
| 14px | `text-body-sm` | |
| 16px | `text-body` | 마지노선 ✓ |
| 18px | `text-body` 또는 `text-heading` | |
| 20px → 22px | `text-heading` (22) | ★ OQ #4 LOCKED 모달 title 격상 |
| 28px | `text-display` | Year tile JetBrains Mono |
| Lucide 16/20/24/48 | `size={N}` prop | className 금지 (memory feedback_tailwind_token_class_pattern) |
| @keyframes 3종 | `animate-slide-up` / `animate-fade-in` / `animate-spin` | docs-slide-up + docs-fade-in + docsec-spin 인라인 정의 components.css 또는 tailwind.config 등록 |
| 색 — 강조 | `bg-accent` / `border-accent` / `text-on-accent` | OQ #1 LOCKED, fallback `bg-[#2f81f7]` (16-workshift 사례) |
| 색 — danger | `text-danger` | status- prefix 0 (memory feedback_tailwind_token_class_pattern) |
| 그라데이션 (submit) | lin-grad 135deg #1d4ed8 #0ea5e9 | OQ #2 LOCKED — 인라인 style 또는 신규 `.btn-primary-gradient` |
| backdrop | `bg-black/55` (= rgba 0,0,0,0.55) | docs-slide-up + docs-fade-in 외곽 |

────────────────────────────────────────

# §11. negative rule (W6 본 wave + W7 TSX 변환 직전 — 17건)

1. **src 3 파일 (DocumentsPage.tsx + DocumentSection.tsx + DocumentUploadForm.tsx) 변경 0** — 본 wave (markdown 만) + W7 변환 전 0 byte 변경
2. **sketch HTML 4 파일 변경/추가 0** — W2~W5 완료 직후 W6 는 markdown 만 (sketch/ 서브폴더 절대 X)
3. **wrangler 명령 절대 X** (CLAUDE.local.md + memory `feedback_cbc7119_design_never_wrangler`)
4. **npm run deploy 절대 X** (직원 도메인 경로 — 본 워크트리 cbc7119-design 금지)
5. **이모지 0** (Lucide 텍스트 이름 anchor 만 인용 — FileText/Plus/Loader2/Trash2/Upload/X/AlertTriangle)
6. **linear-gradient 본문 약어 'lin-grad' 사용** — §4/§5 OQ #2 LOCKED 인용 anchor 만 verbatim 등장 / 그 외 본문 약어 (mbr deviation 2건 mirror)
7. **status- prefix 0** (`bg-status-safe / text-status-danger` 등 사용 시 verify FAIL, memory `feedback_tailwind_token_class_pattern`)
8. **w-8 / h-8 className 0** (48px 함정, memory `feedback_tailwind_w8_h8_is_48px`). 32x32 = w-[32px] h-[32px] arbitrary 또는 w-7 h-7
9. **9·10·11 fontSize 인라인 0** (text-caption 12 leading-none 마지노선, OQ #3 LOCKED)
10. **옛 alias 토큰 (var(--bg/bg2/bg3/bg4/bd/bd2/t1/t2/t3/acl/accent/safe/warn/danger)) 본문 안 0** — sketch fence 인용 안 예외
11. **utils/api 수정 0** — documentsApi 시그니처 미수정 (외부 의존 보존, memory `project_redesign_19_legal` multi-file 패턴)
12. **utils/multipartUpload 수정 0** — runMultipartUpload + formatBytes + formatEta + ProgressState 모두 미수정
13. **utils/downloadBlob 수정 0** — downloadDocument 미수정
14. **hooks/useIsDesktop 수정 0** — ≥1024px 분기 default 미수정
15. **stores/authStore 수정 0** — useAuthStore + Staff role 미수정
16. **App.tsx 수정 0** — /documents 라우트 + MOBILE_NO_NAV_PATHS + DESKTOP_HEADER_HIDE_PATHS + PAGE_TITLES 모두 미수정
17. **components.css 수정 — 신규 클래스 추가 OK (§9 ≥15)** 단 기존 `.btn-primary / .btn-secondary / .empty-state` 수정 0

(verify gate `grep -c '^[0-9]+\.' wave-6-tsx-conversion-checklist.md` 17 보장. wrangler ≥1 + npm run deploy ≥1 + status- ≥1 + w-8 ≥1 negative anchor 박제)

추가 메모리 룰 unique slug 박제 (verify gate ≥10 충족):
- `feedback_tailwind_token_class_pattern` (status- prefix 0 + Lucide size prop)
- `feedback_tailwind_w8_h8_is_48px` (w-7 = 32, w-8 = 48 함정)
- `feedback_text_caption_leading_none` (12 마지노선 leading-none)
- `feedback_design_changes_ask_first` (디자인 변경 전 상의)
- `feedback_design_sketch_first` (spacing/sizing sketch 먼저)
- `feedback_avoid_premature_confirmation` (자신감 표현 자제)
- `feedback_sketch_realistic_data` (분기/라벨 룰 코드 그대로)
- `feedback_redesign_sketch_rule_enforcement` (§6.2/§6.3/§7.1 4중 강화)
- `feedback_check_branch_before_edit` (브랜치 확인 후 편집)
- `feedback_cbc7119_design_never_wrangler` (wrangler 절대 X)
- `feedback_tsx_wave_emoji_dot_gap` (이모지 0 + dot 추가)
- `project_redesign_19_legal` (multi-file 외부 의존 미수정 패턴)
- `project_legal_findings_delete_incident_260520` (★ delete confirm 가드)

────────────────────────────────────────

# §12. verify gate (22건 — slq mirror)

| # | 명령 | 기대값 |
|---|---|---|
| 1 | `grep -c '^# §' wave-6-tsx-conversion-checklist.md` | =12 (§1~§12) |
| 2 | `grep -c '^\[GROUP [1-9]' wave-6-tsx-conversion-checklist.md` | ≥9 (비즈 anchor 9 그룹) |
| 3 | `grep -cE '^## §5\.[1-5]' wave-6-tsx-conversion-checklist.md` | =5 (OQ #1~#5 LOCKED) |
| 4 | `grep -hoE 'class="[^"]+"' cha-bio-safety/docs/redesign-context/22-documents/sketch-wave-*.html \| sort -u \| wc -l` 결과 ≥8 + checklist §6 fence 안 박제 ≥8 | sketch grep fence ≥8 unique class (실측 36) |
| 5 | `grep -oE 'feedback_[a-z_]+\|project_[a-z0-9_]+' wave-6-tsx-conversion-checklist.md \| sort -u \| wc -l` | ≥10 unique slug |
| 6 | `grep -c '^[0-9]\+\.' wave-6-tsx-conversion-checklist.md` (§11 negative count) | ≥15 (17 박제) |
| 7 | `grep -c '^\| [0-9]\+ \|' wave-6-tsx-conversion-checklist.md` (§12 verify table row) | ≥18 (22 박제) |
| 8 | `wc -l cha-bio-safety/docs/redesign-context/22-documents/DocumentsPage.tsx` | =162 |
| 9 | `wc -l cha-bio-safety/docs/redesign-context/22-documents/DocumentSection.tsx` | =517 |
| 10 | `wc -l cha-bio-safety/docs/redesign-context/22-documents/DocumentUploadForm.tsx` | =402 |
| 11 | `grep -cE '^[0-9]+\. \.(docs\|btn)-' wave-6-tsx-conversion-checklist.md` (§9 components.css inherit) | 재사용 ≥2 + 신규 ≥15 = 합계 ≥17 |
| 12 | `grep -c 'text-caption' wave-6-tsx-conversion-checklist.md` (§10 Tailwind cheatsheet 12 마지노선) | ≥1 |
| 13 | `grep -cE 'FileText\|Plus\|Loader2\|Trash2\|Upload\|X\|AlertTriangle' wave-6-tsx-conversion-checklist.md` | ≥5종 |
| 14 | `grep -cE 'docs-slide-up\|docs-fade-in\|docsec-spin' wave-6-tsx-conversion-checklist.md` | ≥3 (@keyframes 3종) |
| 15 | `grep -c '소방계획서\|소방훈련자료' wave-6-tsx-conversion-checklist.md` (typeLabel verbatim) | ≥2 |
| 16 | `grep -c '정말 삭제하시겠습니까' wave-6-tsx-conversion-checklist.md` (★ delete confirm verbatim) | ≥1 |
| 17 | `grep -c '업로드 중입니다' wave-6-tsx-conversion-checklist.md` (beforeunload verbatim) | ≥1 |
| 18 | `grep -c '업로드를 취소하시겠습니까' wave-6-tsx-conversion-checklist.md` (abort confirm verbatim) | ≥1 |
| 19 | `grep -c '관리자만 업로드할 수 있습니다' wave-6-tsx-conversion-checklist.md` (403 카피 verbatim) | ≥1 |
| 20 | `grep -c "useAuthStore" wave-6-tsx-conversion-checklist.md` (admin 권한 anchor verbatim) | ≥1 |
| 21 | `grep -cE '#1d4ed8.*#0ea5e9\|linear-gradient\(135deg' wave-6-tsx-conversion-checklist.md` (OQ #2 lin-grad anchor) | ≥3 (§4/§5/§9 등) |
| 22 | `grep -c 'bg-surface-sunken' wave-6-tsx-conversion-checklist.md` (OQ #5 통일) | ≥3 (§3/§9/§10 등) |
| + | `git diff --name-only HEAD -- cha-bio-safety/src/pages/DocumentsPage.tsx cha-bio-safety/src/components/DocumentSection.tsx cha-bio-safety/src/components/DocumentUploadForm.tsx cha-bio-safety/src/utils/api.ts cha-bio-safety/src/utils/multipartUpload.ts cha-bio-safety/src/utils/downloadBlob.ts cha-bio-safety/src/hooks/useIsDesktop.ts cha-bio-safety/src/stores/authStore.ts cha-bio-safety/src/App.tsx cha-bio-safety/src/styles/components.css` | 0 lines (src 변경 0) |
| + | `git diff --name-only HEAD -- cha-bio-safety/docs/redesign-context/22-documents/sketch-wave-*.html` | 0 lines (sketch HTML 변경 0) |
| + | `git diff --name-only HEAD -- cha-bio-safety/docs/redesign-context/22-documents/wave-6-tsx-conversion-checklist.md` | 1 line (본 wave 산출 1개만) |

22 verify gate + 3 git diff gate 모두 PASS 시 본 checklist 가 W7 TSX 변환 wave 단일 진입점 자격을 갖춘 것으로 본다.

────────────────────────────────────────

(끝 — wave-6-tsx-conversion-checklist.md / quick-260526-8yx / redesign/22-documents W6)
