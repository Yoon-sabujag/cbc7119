---
title: "redesign/22-documents — sketch wave 1 (index)"
status: ready_for_oq
created: 2026-05-26
quick_id: 260526-7qg
branch: redesign/22-documents
source_tsx:
  - cha-bio-safety/src/pages/DocumentsPage.tsx (162 lines)
  - cha-bio-safety/src/components/DocumentSection.tsx (517 lines)
  - cha-bio-safety/src/components/DocumentUploadForm.tsx (402 lines)
  - 합계 1081 lines / 3 파일 (19-legal multi-file pattern + 21-legal-finding-detail 외부 의존 패턴 mirror)
design_system: cha-bio-safety/docs/redesign-context/22-documents/design-system.md (v0.1.1)
chrome_rules: cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md (문서 페이지 = 점검 시리즈 아님 — 직접 적용 X. 단 BottomSheet 의 overlay/handle/slideUp 패턴은 19-legal 모달 룰 + 23-education EducationBottomSheet 패턴 mirror 검토)
mirror_of:
  - cha-bio-safety/docs/redesign-context/23-education/wave-1-index.md (260522-gmp) — 8 section + 4 sub-wave 구조
  - cha-bio-safety/docs/redesign-context/19-legal/wave-1-index.md — multi-file 외부 의존 (PhotoGrid/PhotoSourceModal/useMultiPhotoUpload 미수정 패턴) — 22-documents 의 useQueryClient + runMultipartUpload + documentsApi + downloadDocument + formatBytes + ApiError 외부 의존 동일 패턴
  - cha-bio-safety/docs/redesign-context/14-reports/wave-1-index.md — components.css inherit 매핑 (재사용 ≥3 + 신규 ≥10)
biz_anchor_precedent: 28-splash W1 비즈 anchor 16건 1 byte 변경 0 패턴 + 23-education W1 D-day 임계치 + role 그룹핑 + useMutation 패턴 — 22-documents 는 multipart upload (5MB 단위) + abort/retry + beforeunload guard + admin 권한 분기 + R2 storage + plan/drill 2 type 분기
sub_wave_count: 5 (W2~W6) — 1 파일 → 4 sub-wave 룰 + 1 파일 추가 (DocumentUploadForm 단독 wave) — 19-legal multi-file 패턴 일관
memory_rules_inline: 12 (10 기본 + project_redesign_19_legal multi-file 외부 의존 보존 + project_legal_findings_delete_incident_260520 삭제 가드 confirm 보존)
open_questions: 5
---

본 문서는 redesign/22-documents 의 W2~W6 후속 wave 의 **단일 진입점**이다. 23-education/wave-1-index.md (260522-gmp, 612 lines, 8 section + 4 sub-wave) 구조와 19-legal/wave-1-index.md (multi-file 외부 의존 미수정 패턴) 두 mirror 를 합쳐 다음을 박제한다:

- **3 파일 통합** — DocumentsPage.tsx (162) + DocumentSection.tsx (517) + DocumentUploadForm.tsx (402) = 합계 1081 lines. 18-worklog (단일 1216) / 23-education (단일 591) 의 단일 파일 패턴과 다르고, 19-legal/20-legal-findings/21-legal-finding-detail 의 multi-file 외부 의존 패턴과 유사.
- **design-system v0.1.1 §6/§7 적용 룰** — §1.1 노안 마지노선 12 / §1.2 정보 인지 > 미적 / §1.3 모바일/데스크톱 같은 시스템 다른 밀도 / §6.1 Progress Color Rule (본 페이지 비적용) / §6.2 Stat Card Number Color (본 페이지 비적용) / §6.4 그라데이션 (CTA) / §7.1 Lucide.
- **chrome 룰 적용 여부** — 문서 페이지 = 점검 시리즈 아님. inspection-modal-chrome-rules.md 직접 적용 X. 단 BottomSheet/Modal 의 overlay opacity 0.55 + handle bar 40x4 + slideUp 240ms + fade-in 180ms 패턴은 19-legal 모달 룰 + 23-education EducationBottomSheet 패턴과 mirror 검토.
- **App.tsx 실측 (작성 시 직접 grep)** — `/documents` 가 MOBILE_NO_NAV_PATHS / DESKTOP_HEADER_HIDE_PATHS / PAGE_TITLES 에 등재된 패턴 확인 필수 (W2 sketch chrome 작성 직전). 본 인덱스 작성 시점에는 App.tsx 직접 수정 0.
- **메모리 룰 12건** (§5) + **§6 negative 8건** + **§7 OQ 5건** + **§8 verify gate 8건** 박제.

작성일 2026-05-26 / Quick ID **260526-7qg** / Branch **redesign/22-documents** / base = origin/main (ca7545f, 18-worklog 머지 보류).

────────────────────────────────────────

# §1. DocumentsPage.tsx + DocumentSection.tsx + DocumentUploadForm.tsx 인벤토리

3 파일 영역별 인벤토리 박제. line 범위는 실측 (`wc -l` = 162 + 517 + 402 = 1081, drift 없음). 6 영역으로 나눠:

1. **DocumentsPage.tsx** (162 lines) — 컨테이너만 (tab 분기 + upload shell BottomSheet/Modal)
2. **DocumentSection.tsx 상단 유틸 / 상수** (1~58) — imports + formatDate + typeLabel
3. **DocumentSection.tsx 핵심 컴포넌트** (60~517) — query + handleDownload + handleDelete + 4 state 매트릭스 + Hero card + 과거 이력 list
4. **DocumentUploadForm.tsx 상단 유틸 / 상수** (1~45) — imports + ALLOWED + EXT_TO_MIME + MAX_SIZE 500MB + typeLabel + findAllowed
5. **DocumentUploadForm.tsx 핵심 폼** (51~402) — state + 2 useEffect (beforeunload + abortRef cleanup) + handleFileChange + handleSubmit + handleCancel + handleRetry + year/title/file inputs + Progress + Error block + Action row
6. **외부 의존** — utils/multipartUpload runMultipartUpload + formatBytes + formatEta + ProgressState / utils/api documentsApi + DocumentListItem + ApiError / utils/downloadBlob downloadDocument / hooks/useIsDesktop / stores/authStore useAuthStore / react-query useQuery + useQueryClient / react-hot-toast / lucide-react FileText + Plus + Loader2 + Trash2

## §1 머리말 특이성 7건 (23-education §1 머리말 7건 mirror)

- **multipart upload (R2, 5MB 단위) + abort/retry + beforeunload guard** — D1 + R2 외부 의존 시그니처 보존 (`runMultipartUpload` + `queryClient.invalidateQueries(['documents', type])`).
- **admin 권한 분기** (DocumentSection 의 isAdmin + DocumentUploadForm 의 403 → '관리자만 업로드할 수 있습니다.' 카피) — `useAuthStore((s) => s.staff?.role === 'admin')`.
- **모바일 = BottomSheet** (slideUp + maxHeight 85vh + borderTopRadius 16) / **데스크톱 = Modal** (fade-in + min(480px,92vw) + maxHeight 85vh + borderRadius 12) — `useIsDesktop` 가 ≥1024px 분기 (23-education 의 ≥768px 와 다름 — `hooks/useIsDesktop.ts` 의 매개변수 default 검증 필요).
- **backdrop click NO-OP** — 사용자가 반드시 '취소' 버튼 사용해야 beforeunload guard 동작 (DocumentsPage line 97~99, 140~142 코멘트 verbatim `/* backdrop no-op — user must use 취소 button so confirm guard fires */`).
- **ALLOWED 6 ext × empty MIME fallback** (HWP/ZIP iOS Safari case) — `f.type && !mimes.includes(f.type)` 조건 (empty MIME 통과 허용, iOS Safari .hwp/.zip 의 file.type 비어있는 케이스 대응).
- **모바일 탭 전환** (plan ↔ drill) / **데스크톱 좌우 2단 동시** (max 1200px gap 48) — 단순 if-else 분기.
- **BottomSheet handle bar 40x4 + slideUp 240ms ease-out** + **데스크톱 모달 fade-in 180ms ease-out** — `@keyframes` 인라인 정의 (DocumentsPage line 36~39, `docs-slide-up` + `docs-fade-in` 2종 + DocumentSection line 167 `docsec-spin` 1종 = 합계 3종).

## §1.1 영역별 인벤토리 표

| # | element | line 범위 | 역할 | 비즈 로직 연결 | 후속 wave |
|---|---|---|---|---|---|
| 1 | DocumentsPage `tabBtnStyle` 헬퍼 | 22~32 | 모바일 탭 버튼 활성/비활성 스타일 (height 44, borderBottom 2px) | activeTab state | W2 |
| 2 | DocumentsPage `@keyframes docs-slide-up` + `docs-fade-in` | 36~39 | BottomSheet slideUp + Modal fade-in 인라인 정의 | animation prop | W2 |
| 3 | DocumentsPage isDesktop 모바일 분기 | 41~64 | 모바일 탭 sticky + DocumentSection 1개 | useIsDesktop | W2 |
| 4 | DocumentsPage isDesktop 데스크톱 분기 | 66~83 | 좌우 2단 (maxWidth 1200 gap 48 padding 24) | useIsDesktop | W2 |
| 5 | DocumentsPage upload shell 모바일 | 86~126 | BottomSheet + handle 40x4 + slideUp 240ms + backdrop NO-OP | uploadFor state | W2 또는 W5 |
| 6 | DocumentsPage upload shell 데스크톱 | 128~159 | Modal + fade-in 180ms + min(480px,92vw) + backdrop NO-OP | uploadFor state | W2 또는 W5 |
| 7 | DocumentSection imports | 1~15 | react / react-query / toast / lucide / utils/api / utils/downloadBlob / utils/multipartUpload / authStore / useIsDesktop | — | W3 |
| 8 | DocumentSection `formatDate` | 22~35 | full/date-only 2 mode (YYYY-MM-DD HH:mm / YYYY-MM-DD) | Hero meta / 과거 row meta | W3 |
| 9 | DocumentSection `typeLabel` | 37 | 'plan' → '소방계획서' / 'drill' → '소방훈련자료' (verbatim) | header h2 / aria-label | W3 |
| 10 | DocumentSection `useQuery(['documents', type], staleTime 60s)` | 44~48 | 문서 목록 fetch — query key 변경 금지 | documentsApi.list | W3 |
| 11 | DocumentSection `downloadingIds` + `deletingIds` Set state | 50~51 | per-item disable/spin 표시 | handleDownload / handleDelete | W3 / W4 |
| 12 | DocumentSection error toast useEffect | 54~58 | one-shot per error change | query.error 변경 시 | W3 |
| 13 | DocumentSection `handleDownload` | 60~82 | downloadingIds Set + toast.loading + downloadDocument + dismiss/success/error | downloadDocument(id, filename) | W3 / W4 |
| 14 | DocumentSection `handleDelete` (★ confirm 가드) | 84~110 | window.confirm + deletingIds Set + documentsApi.remove + invalidateQueries + toast | confirm 카피 verbatim 보존 | W3 / W4 |
| 15 | DocumentSection uploadBtn 분기 | 118~163 | admin 가드 + 모바일 40x40 icon-only / 데스크톱 40 pill | isAdmin / isDesktop | W3 또는 W4 |
| 16 | DocumentSection `@keyframes docsec-spin` | 167 | Loader2 1s linear infinite | Loader2 spin animation | W3 |
| 17 | DocumentSection 헤더 행 | 170~180 | h2 title (16/600) + uploadBtn (flex justify-between minHeight 40) | uploadBtn 분기 | W3 |
| 18 | DocumentSection isLoading 스켈레톤 | 183~196 | 96 + 56 + 56 placeholder 3행 | query.isLoading | W3 |
| 19 | DocumentSection error block | 199~233 | '문서 목록을 불러오지 못했습니다.' + 다시 시도 button | query.error + query.refetch | W3 |
| 20 | DocumentSection empty block | 236~260 | FileText 48 + 카피 (admin '우측 상단...' / non-admin '관리자가...') | data.length === 0 + isAdmin | W3 |
| 21 | DocumentSection Hero card 최신 | 263~394 | 최신 pill + Year tile 64x64 + Meta + Loader spin + admin Trash2 | latest = data[0] | W4 |
| 22 | DocumentSection 과거 이력 list | 397~514 | 연결된 borderRadius isFirst/isLast + Year+Title + meta + Loader + Trash2 | history = data.slice(1) | W4 |
| 23 | DocumentUploadForm ALLOWED 6 ext + EXT_TO_MIME + MAX_SIZE 500MB | 23~41 | 6 ext + empty MIME fallback (HWP/ZIP iOS) + 500MB 한도 | handleFileChange 검증 | W5 |
| 24 | DocumentUploadForm `findAllowed` | 46~49 | filename.toLowerCase().endsWith(ext) | handleFileChange / handleSubmit | W5 |
| 25 | DocumentUploadForm state 7건 | 53~61 | year + title + file + progress + isUploading + error + abortRef + fileInputRef | 폼 input + submit | W5 |
| 26 | DocumentUploadForm beforeunload useEffect | 64~72 | isUploading 동안만, returnValue '업로드 중입니다...' verbatim | window beforeunload | W5 |
| 27 | DocumentUploadForm unmount abort useEffect | 75~79 | abortRef.current?.abort() on unmount | AbortController | W5 |
| 28 | DocumentUploadForm `handleFileChange` | 81~104 | MAX_SIZE 검증 + findAllowed + MIME 검증 (empty MIME OK) + auto-prefill title | setFile / setTitle | W5 |
| 29 | DocumentUploadForm `handleSubmit` | 106~153 | runMultipartUpload + ApiError 403 분기 + AbortError 분기 + invalidateQueries | runMultipartUpload | W5 |
| 30 | DocumentUploadForm `handleCancel` (★ confirm 가드) | 155~166 | isUploading 시 window.confirm '업로드를 취소하시겠습니까?' verbatim | abortRef.current?.abort() | W5 |
| 31 | DocumentUploadForm `handleRetry` | 168~171 | setError(null) + handleSubmit 재호출 | error block 다시 시도 | W5 |
| 32 | DocumentUploadForm yearOptions descending | 174~175 | currentYear+1 → 2020 | year select options | W5 |
| 33 | DocumentUploadForm `inputBaseStyle` + `labelStyle` 공용 객체 | 180~199 | width 100% height 44 padding '0 12px' bg var(--bg4) border 1px solid var(--bd) borderRadius 8 | year select / title input | W5 |
| 34 | DocumentUploadForm 모달 title + year select + title input | 204~234 | '${label} 업로드' + 연도 select + 제목 input | inputBaseStyle 적용 | W5 |
| 35 | DocumentUploadForm file 선택 button (dashed) | 237~272 | dashed border + bg var(--bg3) + '파일 선택' or 'filename · bytes' + 보조 'PDF, XLSX, DOCX, PPTX, HWP, ZIP · 최대 500MB' | fileInputRef.current?.click() | W5 |
| 36 | DocumentUploadForm Progress block | 275~322 | progress bar height 8 + #2f81f7 + transition 240ms linear + 메타 (% + speedBps + ETA / 속도 계산 중…) | progress state | W5 |
| 37 | DocumentUploadForm Error block | 325~360 | bg var(--bg3) + var(--danger) 카피 + 다시 시도 button | error state + handleRetry | W5 |
| 38 | DocumentUploadForm Action row | 363~399 | submit (flex 1 height 44 #2f81f7 → bg3 disabled) + cancel (flex 1 transparent border) | handleSubmit / handleCancel | W5 |

(총 38 행 — 23-education ≥38 와 유사. multi-file 분리도 양호 + element 수 적절.)

## §1.2 line 수 실측 확인

```
wc -l 결과 (2026-05-26):
     162  cha-bio-safety/docs/redesign-context/22-documents/DocumentsPage.tsx
     517  cha-bio-safety/docs/redesign-context/22-documents/DocumentSection.tsx
     402  cha-bio-safety/docs/redesign-context/22-documents/DocumentUploadForm.tsx
    1081  total
```

drift 없음 확인.

## §1.3 비즈 시그니처 보존 anchor (별도 박스)

28-splash W1 비즈 anchor 16건 1 byte 변경 0 패턴 + 23-education D-day 임계치 룰 mirror. 카테고리별 박제:

```
[DocumentsPage.tsx — 분기 / @keyframes / shell]
- useIsDesktop() (≥1024px 분기, hooks/useIsDesktop.ts default breakpoint 확인 필수)
- type DocType = 'plan' | 'drill'
- backdrop onClick = no-op (line 97~99, 140~142 코멘트 verbatim) — 사용자 '취소' 버튼 강제
- @keyframes docs-slide-up (translateY 100% → 0) (변경 금지)
- @keyframes docs-fade-in (opacity 0 → 1) (변경 금지)
- BottomSheet handle 40x4 borderRadius 2 bg var(--bd2) margin '0 auto 16px auto' (변경 금지)
- BottomSheet slideUp 240ms ease-out (변경 금지)
- 데스크톱 Modal fade-in 180ms ease-out (변경 금지)
- 데스크톱 Modal width 'min(480px, 92vw)' + maxHeight 85vh (변경 금지)
- 모바일 BottomSheet maxHeight 85vh + padding 24 + borderTopLeftRadius 16 / borderTopRightRadius 16 (변경 금지)
- 데스크톱 2단 maxWidth 1200 + gap 48 + padding 24 (변경 금지)

[DocumentSection.tsx — react-query / 비즈 시그니처]
- useQuery({ queryKey: ['documents', type], queryFn: documentsApi.list(type), staleTime: 60_000 }) (변경 금지)
- documentsApi.list(type: 'plan' | 'drill') (시그니처 변경 금지)
- documentsApi.remove(id: number) (시그니처 변경 금지)
- queryClient.invalidateQueries({ queryKey: ['documents', type] }) (모든 mutation 의 query key 일치 필수)
- downloadDocument(id, filename) (utils/downloadBlob 시그니처 변경 금지)
- formatBytes(size) (utils/multipartUpload 시그니처 변경 금지)
- typeLabel: 'plan' → '소방계획서' / 'drill' → '소방훈련자료' (1 byte 변경 금지)
- isAdmin = useAuthStore((s) => s.staff?.role === 'admin') (시그니처 변경 금지)
- downloadingIds: Set<number> + deletingIds: Set<number> state 패턴 (변경 금지)
- formatDate(iso, mode 'full'|'date-only') 출력 'YYYY-MM-DD HH:mm' / 'YYYY-MM-DD' (변경 금지)
- @keyframes docsec-spin (1s linear infinite) (변경 금지)

[DocumentSection.tsx — 카피 verbatim]
- toast loading: '다운로드 중입니다…' (변경 금지)
- toast success: '다운로드를 시작했습니다' duration 2000 (변경 금지)
- toast error: '다운로드에 실패했습니다. 네트워크를 확인해주세요.' (변경 금지)
- toast error: '문서 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.' (변경 금지)
- ★ delete confirm: '"${item.title}"\n(${item.filename})\n\n정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.' (1 byte 변경 금지, memory project_legal_findings_delete_incident_260520 일반화)
- toast success: '문서를 삭제했습니다' (변경 금지)
- toast error fallback: '문서 삭제에 실패했습니다' (변경 금지)
- 빈 상태: '아직 업로드된 문서가 없습니다' (line 252) + admin 분기 '우측 상단 업로드 버튼으로 ${title}를 추가하세요.' + non-admin 분기 '관리자가 문서를 업로드하면 이곳에 표시됩니다.' (변경 금지)
- 오류 상태: '문서 목록을 불러오지 못했습니다.' (line 213) + '다시 시도' 버튼 카피 (변경 금지)
- 최신 pill 카피: '최신' (line 300) (변경 금지)
- 과거 이력 라벨: '과거 이력' (line 408) (변경 금지)
- Hero card meta verbatim: `${filename} · ${formatBytes(size)} · ${uploaded_by_name ?? '알 수 없음'} · ${formatDate(uploaded_at)}` (변경 금지)
- 과거 이력 row 1번째 라인: `${row.year}년 · ${row.title}` (변경 금지)
- 과거 이력 row 2번째 라인: `${formatBytes(size)} · ${uploaded_by_name ?? '알 수 없음'} · ${formatDate(uploaded_at, 'date-only')}` (변경 금지)

[DocumentUploadForm.tsx — multipart upload / 비즈 시그니처]
- runMultipartUpload({ file, type, year, title, contentType, signal, onProgress }) (시그니처 변경 금지)
- ALLOWED 6 ext: .pdf .xlsx .docx .pptx .hwp .zip (변경 금지)
- EXT_TO_MIME 매핑 (변경 금지) — fallback contentType
- MAX_SIZE = 500 * 1024 * 1024 (500MB) (변경 금지)
- empty MIME fallback (HWP/ZIP iOS Safari) — `f.type && !mimes.includes(f.type)` 조건 (변경 금지)
- yearOptions: descending currentYear+1 → 2020 (변경 금지)
- auto-prefill title: `${year}년 ${typeLabel(type)}` (D-19, 변경 금지)
- beforeunload handler: 'e.returnValue = "업로드 중입니다. 페이지를 나가면 전송이 중단됩니다."' (변경 금지)
- abortRef cleanup on unmount (변경 금지)
- ApiError 403 → '관리자만 업로드할 수 있습니다.' (변경 금지)
- ApiError other → '업로드 중 네트워크 오류가 발생했습니다. 다시 시도해주세요.' (변경 금지)
- AbortError → '업로드가 취소되었습니다.' (toast 미발송, error block 만 표시) (변경 금지)
- toast.success: '업로드가 완료되었습니다.' (변경 금지)
- toast.error: '파일 크기가 500MB를 초과합니다.' (변경 금지)
- toast.error: '지원하지 않는 파일 형식입니다. (PDF, XLSX, DOCX, PPTX, HWP, ZIP)' (변경 금지)
- toast.error: '연도, 제목, 파일을 모두 입력해주세요.' (변경 금지)
- handleCancel confirm: '업로드를 취소하시겠습니까? 지금까지 전송된 데이터는 저장되지 않습니다.' (변경 금지)
- progress 라벨 verbatim: '속도 계산 중…' (speedBps < 100KB) / `${MB/s} · 남은 시간 ${formatEta}` (변경 금지)
- 폼 라벨 verbatim: '연도' / '제목' / '파일' / '파일 선택' / '예: ${currentYear}년 ${label}' (placeholder) (변경 금지)
- 파일 라벨 보조 verbatim: 'PDF, XLSX, DOCX, PPTX, HWP, ZIP · 최대 500MB' (변경 금지)
- submit verbatim: '업로드 중…' / '업로드' (변경 금지)
- cancel verbatim: '취소' (변경 금지)
- 모달 title: '${label} 업로드' (변경 금지)

[outer 의존]
- documentsApi (utils/api) — list / remove + DocumentListItem type (변경 금지)
- downloadDocument (utils/downloadBlob) — Blob → window URL → a.click (변경 금지)
- runMultipartUpload + formatBytes + formatEta + ProgressState (utils/multipartUpload) — 변경 금지
- ApiError (utils/api) — status property — 변경 금지
- useAuthStore (stores/authStore) — Staff role: 'admin'|'assistant' — 변경 금지
- useIsDesktop (hooks/useIsDesktop) — boolean — 변경 금지
- @tanstack/react-query useQuery + useQueryClient — 변경 금지
- react-hot-toast — 변경 금지
- lucide-react FileText + Plus + Loader2 + Trash2 — 변경 금지

[자산 / animation]
- BottomSheet handle 40x4 borderRadius 2 (변경 금지)
- Year tile 64x64 borderRadius 8 + JetBrains Mono 28/600 (변경 금지)
- 최신 pill bg #2f81f7 + color #fff + fontSize 11/600 + padding '4px 8px' + borderRadius 999 (변경 금지)
- Hero card minHeight 96 + padding 24 + borderRadius 12 (변경 금지)
- 과거 이력 row minHeight 56 + padding 16 (변경 금지)
- admin Trash2 button 32x32 (Hero) / 32x32 (과거) borderRadius 8 (변경 금지)
- 빈 상태 FileText size 48 color var(--t3) (변경 금지)
- progress bar height 8 + #2f81f7 + transition 240ms linear (변경 금지)
- modal/sheet @keyframes 3종 (docs-slide-up / docs-fade-in / docsec-spin) (변경 금지)
- inputBaseStyle width 100% height 44 padding '0 12px' bg var(--bg4) border '1px solid var(--bd)' borderRadius 8 (변경 금지)
- file 선택 button border '1px dashed var(--bd2)' (dashed border 변경 금지)
- submit button + cancel button flex 1 height 44 borderRadius 8 (변경 금지)
```

위 모든 식별자/값은 §6 negative rule + §7 OQ + §5 룰에서 재확인. 1 byte 변경 시 W6 verify FAIL.

────────────────────────────────────────

# §2. 5 sub-wave 분배 plan (W2~W6)

23-education 의 4 sub-wave 와 다름. multi-file (3 파일) 구조 + DocumentUploadForm 단독 wave 필요로 1 sub-wave 추가:

| Wave | scope | 대상 element | 산출 파일 |
|---|---|---|---|
| W2 | DocumentsPage chrome — 모바일 탭 + 데스크톱 좌우 2단 outline + upload shell (BottomSheet + Modal) | DocumentsPage 전체 (162 lines). tab bar (모바일 sticky + activeTab 분기) + 데스크톱 2단 (maxWidth 1200 gap 48) + BottomSheet (slideUp + handle 40x4) + Modal (fade-in + min(480px,92vw)) + backdrop NO-OP 코멘트 보존. 4 frame 매트릭스 (모바일 tab=plan / 모바일 tab=drill / 데스크톱 2단 / upload shell open) | sketch-wave-2-chrome.html |
| W3 | DocumentSection 헤더 + 4 state (loading/error/empty/data 헤더만) + admin uploadBtn | DocumentSection 헤더 행 + uploadBtn 분기 (admin 40x40 모바일 / 40 pill 데스크톱) + 4 state 매트릭스 (loading 스켈레톤 96+56+56 / error 다시시도 / empty FileText 48 + 카피 admin/non-admin / data 헤더만). 4 frame | sketch-wave-3-section-states.html |
| W4 | DocumentSection Hero card + 과거 이력 list (data state) | Hero card (최신 pill + Year tile 64x64 JetBrains Mono 28 + Meta + Loader spin + admin Trash2) + 과거 이력 list (연결된 borderRadius isFirst/isLast + Year+Title + meta + admin Trash2). 빈 이력 / 1개 / 다수 (5개) 3 frame + delete confirm dialog frame | sketch-wave-4-section-cards.html |
| W5 | DocumentUploadForm 폼 + Progress + Error block | DocumentUploadForm 전체 (402 lines). year select + title input + file button (dashed border) + 보조 카피 'PDF, XLSX, DOCX, PPTX, HWP, ZIP · 최대 500MB' + Progress bar (height 8 #2f81f7 transition 240ms) + Progress meta (% + speedBps + ETA / 속도 계산 중…) + Error block (var(--danger) + 다시 시도) + Action row (submit + 취소). 5 frame 매트릭스 (초기 / 파일 선택 후 / 업로드 중 (progress 50%) / 오류 / abort confirm) | sketch-wave-5-upload-form.html |
| W6 | TSX 변환 verify checklist (sketch 아님, markdown) | W2~W5 sketch + 3 파일 비즈 로직 보존 룰 + multipart upload + abort/retry + beforeunload guard + admin 권한 분기 + Tailwind cheatsheet + 메모리 룰 12건 cross-ref + verify gate. 23-education W5 + 19-legal W6 + 21-legal-finding-detail W6 의 12-섹션 구조 mirror | wave-6-tsx-conversion-checklist.md |

## §2.1 각 wave 행 — 보존 / 토큰 / 폰트 / 레이아웃

### [W2 — DocumentsPage chrome]
- **보존**: useIsDesktop 분기 (모바일 tab / 데스크톱 2단) / @keyframes docs-slide-up + docs-fade-in / BottomSheet handle 40x4 + slideUp 240ms / Modal fade-in 180ms width 'min(480px,92vw)' / backdrop NO-OP 코멘트 verbatim / 데스크톱 maxWidth 1200 gap 48 padding 24 / tabBtnStyle (height 44 borderBottom 2px #2f81f7 active) / 탭 카피 verbatim '소방계획서' / '소방훈련자료'
- **토큰**: var(--bg) → bg-surface-page / var(--bg2) → bg-surface-raised / var(--bd) → border-border-default / var(--t1) → text-text-primary / var(--t2) → text-text-secondary / #2f81f7 active borderBottom → border-accent (OQ #1)
- **폰트**: 16 (탭 label) → text-body (마지노선) / fontWeight 600 active vs 400 inactive 보존
- **레이아웃**: 모바일 단일 컬럼 (탭 sticky top 0 zIndex 10) / 데스크톱 좌/우 50:50 (flex 1 minWidth 0)

### [W3 — DocumentSection 헤더 + 4 state]
- **보존**: useQuery query key ['documents', type] + staleTime 60_000 / isAdmin 분기 / 4 state 매트릭스 (loading 96+56+56 / error 카피 + 다시 시도 / empty FileText 48 + 카피 admin/non-admin 분기 / data 헤더만) / uploadBtn 분기 (모바일 40x40 icon-only Plus 20 / 데스크톱 40 pill bg #2f81f7 color #fff Plus 16 '업로드')
- **토큰**: var(--bg2) → bg-surface-raised / var(--bg3) → bg-surface-sunken (스켈레톤 placeholder) / var(--bd) → border-border-default / var(--danger) → text-danger (status- prefix 없음 룰, memory feedback_tailwind_token_class_pattern) / #2f81f7 → bg-accent
- **폰트**: h2 16/600 (line 178) → text-body / 14 (error '다시 시도' button + empty '관리자가...' 카피) → text-body-sm / 16 (empty '아직 업로드된...' + error '문서 목록을...') → text-body
- **레이아웃**: 헤더 행 flex justify-between minHeight 40 / 4 state 모두 width 100% + 카드 padding 24

### [W4 — DocumentSection Hero card + 과거 이력]
- **보존**: Hero minHeight 96 + padding 24 + borderRadius 12 / 최신 pill (absolute top 12 right 12 bg #2f81f7 fontSize 11/600 padding '4px 8px' borderRadius 999) / Year tile 64x64 borderRadius 8 + JetBrains Mono 28/600 / Meta verbatim 포맷 / 과거 이력 row minHeight 56 + padding 16 + 연결된 borderRadius (isFirst → top 8 / isLast → bottom 8) / admin Trash2 32x32 / Loader2 spin docsec-spin 1s / **★ delete confirm 카피 verbatim 보존** (memory project_legal_findings_delete_incident_260520) / handleDownload + handleDelete state Set 패턴
- **토큰**: var(--bg2) → bg-surface-raised / var(--bg3) → bg-surface-sunken (Year tile + dashed input file) / var(--bd) → border-border-default / var(--t1) → text-text-primary / var(--t2) → text-text-secondary / var(--danger) → text-danger (Trash2 색 — status- prefix 없음) / #2f81f7 (최신 pill) → bg-accent
- **폰트**: 16/600 (이름 + year+title) → text-body / 14/400 (meta) → text-body-sm / 11/600 (최신 pill) → text-caption 11px 불가 (12 마지노선 — memory feedback_text_caption_leading_none, OQ #3 12 격상 검토 — design-system §1.1 노안 룰 적용 시 11 → 12 강제) / JetBrains Mono 28/600 (Year tile) → text-display 28
- **레이아웃**: Hero flex align-center gap 16 / 과거 이력 column 연결 (각 row borderTop+Right+Left+Bottom + isFirst/isLast borderRadius)

### [W5 — DocumentUploadForm 폼 + Progress + Error]
- **보존**: state 7건 (year + title + file + progress + isUploading + error + abortRef + fileInputRef) / beforeunload useEffect verbatim '업로드 중입니다. 페이지를 나가면 전송이 중단됩니다.' / unmount abort useEffect / handleFileChange MAX_SIZE + findAllowed + MIME 검증 / handleSubmit runMultipartUpload + ApiError 403 분기 + abort 분기 + invalidateQueries / handleCancel confirm verbatim '업로드를 취소하시겠습니까? 지금까지 전송된 데이터는 저장되지 않습니다.' / yearOptions descending currentYear+1 → 2020 / auto-prefill title `${year}년 ${typeLabel(type)}` / ALLOWED 6 ext + EXT_TO_MIME + MAX_SIZE 500MB / empty MIME fallback / Progress 라벨 verbatim '속도 계산 중…' / '${MB/s} · 남은 시간 ${formatEta}' / 폼 라벨 verbatim '연도' '제목' '파일' '파일 선택' / 보조 'PDF, XLSX, DOCX, PPTX, HWP, ZIP · 최대 500MB' / submit '업로드 중…' / '업로드' / cancel '취소' / 모달 title '${label} 업로드'
- **토큰**: var(--bg2) (모달 외곽) → bg-surface-raised / var(--bg3) (file button + Error block) → bg-surface-sunken / var(--bg4) (input bg) → bg-surface-sunken or 새 토큰 (OQ #5) / var(--bd) → border-border-default / var(--bd2) (dashed file button border) → border-border-default (dashed 보존) / var(--t1) → text-text-primary / var(--t2) → text-text-secondary / var(--t3) → text-text-tertiary / var(--danger) → text-danger (status- prefix 없음) / #2f81f7 (progress bar + submit + Error 다시 시도 button) → bg-accent (OQ #2 LOCKED)
- **폰트**: 20/600 (모달 title) → text-heading 22 격상 (OQ #4 노안) / 14/600 (input 라벨) → text-body-sm / 14 (input 본문 + file button + 다시 시도 button + submit button) → text-body-sm / 13 (Error 카피) → text-label 또는 text-body-sm 격상 (OQ #4) / 12 (파일 보조 'PDF, XLSX...') → text-caption 12 leading-none / 16/600 (Progress %) → text-body / 14 (Progress meta) → text-body-sm
- **레이아웃**: 폼 flex column gap 20 / 모달 padding 24 / Action row flex gap 12 marginTop 4 / Progress block flex column gap 8 / Error block flex align-center justify-between gap 12 padding 12

### [W6 — TSX 변환 verify checklist]
- 23-education W5 + 19-legal W6 의 12-섹션 mirror — sketch outline / Tailwind cheatsheet / components.css inherit (재사용 ≥3 + 신규 ≥10) / 비즈 anchor cross-ref / 메모리 룰 12건 / verify gate (grep + diff + 빌드)

────────────────────────────────────────

# §3. design-system v0.1.1 fence verbatim 7건

각 fence 는 design-system §1.1 / §1.2 / §1.3 / §6.1 / §6.2 / §6.4 / §7.1 verbatim 인용 + 22-documents 적용 메모 1줄. 7 fence 모두 필수 (verify gate 7번 `grep -c '^\`\`\`' ≥ 14` 으로 검증, open+close).

## §3.1 design-system §1.1 노안 친화

```
1.1 노안 친화가 모든 결정보다 우선
- 본문 폰트 최소 16px. 9·10·11px 사용 금지.
- 보조 텍스트 명도 대비 AAA(7:1) 도달.
- 터치 타겟 모바일 44px, 데스크톱 40px.
- 1-2px 단위 미세 차이는 의미 없다 — 토큰은 4의 배수로만.
```
**22-documents 적용**: Hero card 14 meta + 과거 이력 row 14 meta + 최신 pill 11/600 (11 → 12 격상 OQ #3) + 모달 폼 13 라벨 (13 → 14 격상 OQ #4 검토) + 빈 상태 14 보조 → text-body-sm 또는 text-body 격상 검토. inputBaseStyle height 44 (모바일/데스크톱 동일) → §2.5 input-height 44/40 분기 OK.

## §3.2 design-system §1.2 정보 인지 > 미적 정제

```
1.2 정보 인지 > 미적 정제
방재 시스템은 매일 보는 업무 도구다. 트렌디함은 가치가 없다.
- 정보 위계는 폰트 크기/굵기/색이 분명하게 차별화한다.
- 카드 경계는 항상 명확하게 (다크는 명도, 라이트는 보더).
- 인지 부하를 늘리는 장식은 빼고, 빠른 식별을 돕는 색·아이콘을 살린다.
```
**22-documents 적용**: Hero card 위계 (최신 pill + Year tile 64x64 28/600 + Title 16/600 + Meta 14/400) / 과거 이력 (Year+Title 14/600 + 메타 14/400 2줄) / 카드 경계 라이트 border var(--bd) + 다크 명도 var(--bg2) / 장식 최소 (최신 pill 만 강조색 #2f81f7).

## §3.3 design-system §1.3 모바일/데스크톱 같은 시스템 다른 밀도

```
1.3 모바일/데스크톱은 같은 시스템, 다른 밀도
- 폰트는 양쪽 동일 — 노안 대응 절대 룰.
- Radius도 양쪽 동일.
- Spacing만 분기 (모바일 14px → 데스크톱 10px 등).
- 데스크톱이 빽빽한 건 spacing보다 레이아웃(사이드바, 좌우 분할, 그리드 컬럼 수)이 책임진다.
```
**22-documents 적용**: 폰트 동일 (h2 16/600 / meta 14/400 / pill 12/600 격상 후) / Radius 동일 (Hero 12 / Year tile 8 / pill 999 / 과거 row 8 isFirst/isLast 만) / Spacing 분기 (모바일 padding '16px 16px 0 16px' / 데스크톱 padding 24 maxWidth 1200) / 레이아웃 분기 (모바일 탭 / 데스크톱 2단 50:50).

## §3.4 design-system §6.1 Progress Color Rule

```
6.1 진척률 색 매핑 (도넛/카테고리 카드 색바)
- 0% : 회색 (var(--t3))
- 1-49% : warning
- 50-99% : info
- 100% : safe
적용 대상: 도넛 차트, 카테고리 카드 색바.
```
**22-documents 적용**: 본 페이지 비적용 (메타 — '본 페이지에는 진척률 색 매핑 대상 없음, 정보 표시만'). 진행률 비주얼은 DocumentUploadForm Progress bar 만 존재하지만 이는 multipart upload 진행률 (시간축 0~100%) 이지 점검 진척률 (도넛/카테고리) 이 아님 → §6.1 미적용. progress bar 색 = 단색 #2f81f7 → bg-accent 토큰 일관 (OQ #2 LOCKED).

## §3.5 design-system §6.2 Stat Card Number Color

```
6.2 Stat Card Number Color
- 좌측 3px 색바 + 위험 임계치 조건부 danger
- 카테고리 색 매핑 (회색 = 정보 / safe = 정상 / warning = 주의 / danger = 위험)
- 숫자 색은 평소 var(--t1), 위험 임계치 도달 시 var(--status-danger)
```
**22-documents 적용**: 본 페이지 비적용 (메타 — 'Year tile = stat card 아님 (단순 식별 라벨)'). Year tile (64x64 JetBrains Mono 28/600) 은 위험 임계치 개념 없는 단순 연도 식별. 색바 없음. § 6.2 적용 대상 아님.

## §3.6 design-system §6.4 Backgrounds & Gradients

```
6.4 Backgrounds & Gradients
- CTA primary 버튼: linear-gradient(135deg, #1d4ed8, #0ea5e9) 적용 (lin-grad 패턴, ⚠ 단색 단순화 후보 — 28-splash W1 OQ #1 LOCKED 사례)
- Hero 배경: 단색 var(--bg2) 또는 var(--bg3) 사용
- 모달/시트 배경: var(--bg2) 통일
```
**22-documents 적용**: submit button (DocumentUploadForm line 371) 현재 solid `#2f81f7` → §6.4 lin-grad `linear-gradient(135deg, #1d4ed8, #0ea5e9)` 채택 검토 (OQ #2 default OK, 23-education W1 OQ #3 LOCKED 일관) / 최신 pill bg #2f81f7 → bg-accent 토큰 치환 검토 (OQ #1) / Hero 배경 var(--bg2) 단색 / 모달/시트 배경 var(--bg2) 단색 유지.

## §3.7 design-system §7.1 Lucide

```
7.1 Lucide
- size prop {16/20/24/48} 3 종 중 사용 (w-N/h-N className 금지 — memory feedback_tailwind_token_class_pattern Lucide size prop 룰)
- 색은 토큰 (text-text-primary / text-text-secondary / text-text-tertiary / text-danger / text-accent) 직접 className
- 24px 이하는 stroke-width 2 (default) / 48px 이상은 stroke-width 1.5 검토
```
**22-documents 적용**: FileText / Plus / Loader2 / Trash2 4종 모두 size prop 룰 일치 — Hero+과거 Trash2 size={16} / uploadBtn Plus size={16}(데스크톱) size={20}(모바일) / Loader2 size={16} / 빈 상태 FileText size={48}. 색은 inline `color: 'var(--danger)'` (Trash2) / `color="var(--t3)"` (FileText) → W6 TSX 변환 시 `className="text-danger"` / `className="text-text-tertiary"` 으로 치환.

────────────────────────────────────────

# §4. 14-reports SW1 components.css inherit 매핑

재사용 ≥3 + 신규 ≥10. 14-reports/wave-1-index.md SW1 패턴 mirror.

```
[재사용 ≥3] — 기존 components.css 클래스 그대로
.btn-primary
  → submit button (DocumentUploadForm Action row) + 다시 시도 button (DocumentSection error block + DocumentUploadForm Error block) + uploadBtn 데스크톱 pill (DocumentSection)
  → bg-accent + h-11 + px-4 + text-body-sm + font-semibold + rounded-lg
  → 14-reports / 16-workshift / 17-annual-plan / 23-education 일관

.btn-secondary
  → cancel button (DocumentUploadForm Action row)
  → transparent + border-border-default + text-text-primary + h-11 + text-body-sm + font-semibold + rounded-lg
  → 14-reports / 16-workshift / 17-annual-plan / 23-education 일관

.empty-state
  → 빈 상태 wrapper (DocumentSection empty block)
  → flex column items-center gap-3 px-6 py-12 + bg-surface-raised + rounded-xl + border-border-default
  → 14-reports / 23-education 일관

[신규 ≥10] — 22-documents 전용 새 클래스
.docs-tab-bar
  → 모바일 탭 sticky top-0 z-10 flex bg-surface-page border-b border-border-default mb-4
  → 단일 사용처: DocumentsPage 모바일 탭

.docs-tab-btn + .docs-tab-btn-active
  → flex-1 h-11 bg-transparent text-body font-normal border-b-2 border-transparent
  → active: text-text-primary font-semibold border-accent
  → DocumentsPage tabBtnStyle 치환

.docs-section-header
  → flex justify-between items-center min-h-10
  → DocumentSection 헤더 행

.docs-hero-card
  → relative w-full min-h-24 p-6 bg-surface-raised border-border-default rounded-xl flex items-center gap-4 cursor-pointer
  → DocumentSection Hero card (최신)

.docs-year-tile
  → w-16 h-16 bg-surface-sunken rounded-lg flex items-center justify-center font-mono text-display font-semibold text-text-primary flex-shrink-0
  → DocumentSection Hero Year tile (64x64 JetBrains Mono 28/600)

.docs-latest-pill
  → absolute top-3 right-3 text-caption font-semibold text-on-accent bg-accent px-2 py-1 rounded-full
  → DocumentSection 최신 pill (현재 11/600 → 12 격상 OQ #3 LOCKED 후)

.docs-history-row
  → w-full min-h-14 p-4 bg-surface-raised border-border-default flex items-center gap-3 cursor-pointer
  → isFirst/isLast borderRadius 분기는 Tailwind first:rounded-t-lg + last:rounded-b-lg 으로 대체

.docs-trash-btn
  → w-[32px] h-[32px] inline-flex items-center justify-center bg-transparent text-danger border border-border-default rounded-lg
  → Hero + 과거 이력 공용
  → ⚠ w-8 h-8 사용 금지 (= 48px, memory feedback_tailwind_w8_h8_is_48px 함정 회피)
  → arbitrary w-[32px] h-[32px] 또는 w-7 h-7 (= 32) 사용

.docs-upload-btn-mobile
  → w-[40px] h-[40px] inline-flex items-center justify-center bg-transparent text-text-primary border border-border-default rounded-lg
  → admin only — DocumentSection 모바일 분기

.docs-upload-sheet + .docs-upload-sheet-body
  → wrapper: fixed inset-0 bg-black/55 z-[1000] flex items-end justify-center
  → body: w-full max-h-[85vh] overflow-y-auto bg-surface-raised rounded-t-2xl p-6 animate-slide-up
  → DocumentsPage 모바일 BottomSheet

.docs-upload-modal + .docs-upload-modal-body
  → wrapper: fixed inset-0 bg-black/55 z-[1000] flex items-center justify-center animate-fade-in
  → body: w-[min(480px,92vw)] max-h-[85vh] overflow-y-auto bg-surface-raised border-border-default rounded-xl p-6
  → DocumentsPage 데스크톱 Modal

.docs-sheet-handle
  → w-10 h-1 bg-border-default rounded-sm mx-auto mb-4
  → DocumentsPage BottomSheet handle bar (40x4)

.docs-input
  → w-full h-11 px-3 bg-surface-sunken text-text-primary border-border-default rounded-lg text-body-sm
  → year select + title input 공용 (DocumentUploadForm inputBaseStyle 치환)

.docs-file-btn + .docs-file-btn-filled
  → w-full h-11 px-3 bg-surface-sunken text-text-secondary border border-dashed border-border-default rounded-lg text-body-sm text-left truncate
  → filled: text-text-primary
  → DocumentUploadForm file 선택 button (dashed border)

.docs-progress-bar + .docs-progress-fill
  → bar: h-2 bg-surface-sunken rounded-sm overflow-hidden
  → fill: h-full bg-accent rounded-sm transition-[width] duration-[240ms] ease-linear
  → DocumentUploadForm progress

.docs-error-block
  → flex items-center justify-between gap-3 p-3 bg-surface-sunken border-border-default rounded-lg
  → 본문: text-danger text-body-sm font-medium flex-1
  → DocumentUploadForm Error block
```

────────────────────────────────────────

# §5. 메모리 룰 inline (≥12 unique slug)

각 룰 1 bullet — slug 명 + 1줄 요지 + 22-documents 적용처.

1. **feedback_tailwind_token_class_pattern** — status- prefix 없음 (`text-danger` O / `text-status-danger` X) + Lucide size prop 룰. → DocumentSection Trash2 / FileText / Loader2 / Plus 모두 `size={N}` prop, `w-N/h-N` className 금지. var(--danger) → `text-danger`.

2. **feedback_tailwind_w8_h8_is_48px** — `w-8 h-8` = 48px (32 아님), `w-7` = 32. → Trash2 32x32 = `w-7 h-7` 또는 `w-[32px] h-[32px]` arbitrary 필수. uploadBtn 모바일 40x40 = `w-[40px] h-[40px]` arbitrary. ⚠ w-8 = 48 함정 (11-div TSX v3 hotfix 54a1c8d 사고 박제).

3. **feedback_text_caption_leading_none** — text-caption 12 lh:1.5 가 작은 컨테이너에서 시각 패딩. → 최신 pill (현재 11/600 → 12 격상 OQ #3) + 모바일 폼 12 보조 'PDF, XLSX, DOCX, PPTX, HWP, ZIP · 최대 500MB' 모두 `leading-none` 명시.

4. **feedback_design_changes_ask_first** — 디자인 변경 전 사용자 컨펌. → W2 진입 전 OQ 5건 컨펌 필수. PLAN.md 의 sub-wave 구조 변경 시 (W2~W6 5단계 → 4단계 축소 등) 추가 컨펌 필요.

5. **feedback_design_sketch_first** — spacing/sizing 도 sketch HTML 시안 후 인라인. → W2~W5 sketch 후 W6 TSX 변환. spacing 한 줄 fix 라도 sketch 거쳐서 사용자 시각 컨펌 → 적용 순서 강제.

6. **feedback_avoid_premature_confirmation** — 시각 작업 자신감 표현 금지. → '거의 일치' / 'approved 주세요' 같은 표현 금지. 결과 보여주고 사용자 판단.

7. **feedback_sketch_realistic_data** — 표시 분기/라벨 룰은 코드 그대로. → sketch 시 typeLabel '소방계획서/소방훈련자료' / Year tile yyyy / 최신 pill '최신' / 빈 카피 '아직 업로드된 문서가 없습니다' / 오류 카피 '문서 목록을 불러오지 못했습니다.' / progress 라벨 '속도 계산 중…' / 'PDF, XLSX, DOCX, PPTX, HWP, ZIP · 최대 500MB' verbatim 보존.

8. **feedback_redesign_sketch_rule_enforcement** — design-system 룰 negative gate 강제. → §6 negative 8건 + verify gate 8 grep. sketch 별로 design-system §6.2 negative rule (위험 임계치 아닌 카드는 status 색 금지) 등 다중 게이트 자체 검수.

9. **feedback_check_branch_before_edit** — main 아니거나 dirty 면 사용자 컨펌. → 현재 redesign/22-documents 브랜치 + origin/main (ca7545f) base 확인됨. .planning/quick/260526-7qg-* 외 변경 0.

10. **feedback_cbc7119_design_never_wrangler** — 디자인 wave 중 wrangler 절대 X. → §6 negative 명시. `wrangler --project-name=cbc7119` 절대 금지. main push 자동 cbc7119-preview 만.

11. **project_redesign_19_legal** + **project_redesign_21_legal_finding_detail** (multi-file 외부 의존 보존 패턴 일반화) — 19-legal 의 PhotoGrid / PhotoSourceModal / useMultiPhotoUpload 외부 의존 미수정 패턴 mirror. → 22-documents 의 utils/multipartUpload + utils/api + utils/downloadBlob + hooks/useIsDesktop + stores/authStore 외부 의존 6종 미수정. ⚠ DocumentSection + DocumentUploadForm 은 components/ 안 있지만 본 페이지 핵심 UI → 함께 변환 대상 (19-legal PhotoGrid 외부 의존 미수정 패턴과 다름).

12. **project_legal_findings_delete_incident_260520** — 종합정밀 2026.05 22행 삭제 사고 + Time Travel 복구. delete confirm 가드 강화 룰. → DocumentSection handleDelete 의 `window.confirm` 카피 verbatim `"${item.title}"\n(${item.filename})\n\n정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.` 1 byte 변경 금지 + Action row 의 destructive button 위치 보존.

(`feedback_*` 10 unique + `project_*` 2 unique = 12 unique slug. verify gate 3번 `grep -oE 'feedback_[a-z_]+' | sort -u | wc -l` ≥ 10 보장)

────────────────────────────────────────

# §6. negative rule (이 wave 에서 금지된 것) — 8건+

본 wave (sketch wave 1 = 인덱스 작성) 에서 절대 하지 않는 것:

1. **sketch HTML 생성 금지** — sketch 는 W2 부터. 본 wave 산출물은 markdown 1개 (`wave-1-index.md`) 만.

2. **src 3 파일 코드 수정 금지** — `cha-bio-safety/src/pages/DocumentsPage.tsx` + `cha-bio-safety/src/components/DocumentSection.tsx` + `cha-bio-safety/src/components/DocumentUploadForm.tsx` 모두 분석 대상이지 수정 대상이 아님. `git diff --name-only HEAD -- cha-bio-safety/src/pages/DocumentsPage.tsx cha-bio-safety/src/components/DocumentSection.tsx cha-bio-safety/src/components/DocumentUploadForm.tsx` 결과 0 줄.

3. **비즈 로직 시그니처 변경 금지** — `useQuery({ queryKey: ['documents', type] })` / `documentsApi.list/remove` / `runMultipartUpload` / `downloadDocument` / `formatBytes` / `formatEta` / `ProgressState` / `ApiError` / `useAuthStore` / `useIsDesktop` / `@keyframes docs-slide-up`/`docs-fade-in`/`docsec-spin` / `ALLOWED` 6 ext / `EXT_TO_MIME` / `MAX_SIZE` 500MB / `yearOptions` descending / auto-prefill title 모두 import/export 동일하게 유지. 본 wave + W2~W6 모두.

4. **다른 페이지 (13-schedule / 14-reports / 16-workshift / 17-annual-plan / 19-legal / 20-legal-findings / 21-legal-finding-detail / 23-education / 27-login / 28-splash / 02 / 06 등) 영향 금지** — `git status` 에 22-documents/ + .planning/quick/260526-7qg-* 외 변경 0.

5. **wrangler 명령 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler` (디자인 wave 중 `wrangler --project-name=cbc7119` 절대 X). `.claude/settings.local.json` deny 강제. 본 워크트리 (cbc7119-design) 는 `cbc7119-preview.pages.dev` 만 다룸. ⚠ wrangler 단어 본 문서 negative 박제용으로만 등장.

6. **`npm run deploy` 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler`. `npm run deploy` 는 직원 도메인 (`cbc7119.pages.dev`) 경로. 본 워크트리에서 절대 금지. main push → GitHub Actions 자동 cbc7119-preview 배포만. ⚠ `npm run deploy` 단어 본 문서 negative 박제용으로만 등장.

7. **13-schedule + 14-reports + 16-workshift + 17-annual-plan + 19-legal + 20-legal-findings + 21-legal-finding-detail + 23-education + 27-login + 28-splash 의 평면 sketch-wave-*.html 패턴과 다른 폴더 구조 도입 금지** — 10 페이지 모두 평면(flat sibling). `sketch/` 서브폴더 만들지 않음. 22-documents 도 동일 평면 배치 (`22-documents/sketch-wave-N-{slug}.html`).

8. **App.tsx + components.css + utils/api + utils/multipartUpload + utils/downloadBlob 수정 금지** — 본 wave + W2~W6 모두 5 파일 손대지 않음. components.css 는 W6 TSX 변환 시 신규 클래스 추가 OK (§4 신규 ≥10 한정).

9. **★ delete confirm 카피 변경 금지** — DocumentSection handleDelete 의 `window.confirm` 카피 `"${item.title}"\n(${item.filename})\n\n정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.` 1 byte 변경 금지 (memory `project_legal_findings_delete_incident_260520` 일반화 — 2026-05-20 22행 삭제 사고 후 가드 강화 룰).

10. **★ beforeunload guard 카피 + abort confirm 카피 변경 금지** — beforeunload handler returnValue `업로드 중입니다. 페이지를 나가면 전송이 중단됩니다.` + handleCancel window.confirm `업로드를 취소하시겠습니까? 지금까지 전송된 데이터는 저장되지 않습니다.` 모두 1 byte 변경 금지.

11. **★ ALLOWED + EXT_TO_MIME + MAX_SIZE 변경 금지** — 6 ext (PDF/XLSX/DOCX/PPTX/HWP/ZIP) + empty MIME fallback (HWP/ZIP iOS) + 500MB 모두 운영 룰 보존.

12. **★ admin 권한 분기 (isAdmin / 403 카피 `관리자만 업로드할 수 있습니다.`) 변경 금지** — `useAuthStore((s) => s.staff?.role === 'admin')` 시그니처 보존.

13. **toast 카피 verbatim 12종 (DocumentSection 5 + DocumentUploadForm 7) 변경 금지**.

14. **빈/오류/empty 카피 verbatim 변경 금지** — `아직 업로드된 문서가 없습니다` / `우측 상단 업로드 버튼으로 ${title}를 추가하세요.` / `관리자가 문서를 업로드하면 이곳에 표시됩니다.` / `문서 목록을 불러오지 못했습니다.` / `다시 시도`.

15. **typeLabel verbatim 변경 금지** — 'plan' → '소방계획서' / 'drill' → '소방훈련자료'.

16. **3 @keyframes (docs-slide-up / docs-fade-in / docsec-spin) 변경 금지** — DocumentsPage 인라인 + DocumentSection 인라인 정의 보존.

(verify gate 4번: `wrangler` ≥1 + `npm run deploy` ≥1 보장 — 본 §6 안 각 negative 박제로 등장)

────────────────────────────────────────

# §7. open questions (W2 진입 직전 사용자 컨펌) — 5건

각 OQ + default 답 (사용자 별 의견 없으면 이 답으로 진행). approved 받기 전 W2 진입 금지.

## OQ #1 — chrome 강조색 토큰화

모바일 탭 active borderBottom `2px solid #2f81f7` + 최신 pill bg `#2f81f7` + uploadBtn 데스크톱 pill bg `#2f81f7` + submit button bg `#2f81f7` + progress fill bg `#2f81f7` + Error 다시 시도 button bg `#2f81f7` + DocumentSection error 다시 시도 button bg `#2f81f7` — 모두 동일 hex `#2f81f7` 인데 → `bg-accent` / `border-accent` 토큰 통일 vs hex 유지?

**default 답: 토큰 통일 (`bg-accent` / `border-accent`)**. 16-workshift / 17-annual-plan / 23-education / 28-splash 4 페이지 일관 패턴. tokens.css 의 `--accent` 가 #2f81f7 이면 1:1 매핑. 만약 hex 차이 (예: light/dark mode 분기) 발견 시 arbitrary `bg-[#2f81f7]` fallback 패턴 (16-workshift 사례) 사용.

## OQ #2 — submit button 그라데이션 vs solid

submit button 현재 solid `#2f81f7` (line 371) → design-system §6.4 그라데이션 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` 통일 vs solid 유지?

**default 답: 그라데이션 OK (lin-grad 채택)**. design-system §6.4 CTA 룰 + 14-reports / 16-workshift / 17-annual-plan / 23-education W1 OQ #3 그라데이션 default 일관. 단 28-splash W1 OQ #1 LOCKED 는 정반대 (그라데이션 폐기 → bg-safe-bar solid 채택) — 23-education 일관해 22-documents 도 §6.4 우선. disabled 시 = `bg-surface-sunken text-text-tertiary cursor-not-allowed` (현재 `canSubmit ? '#2f81f7' : 'var(--bg3)'` 패턴 보존).

## OQ #3 — 최신 pill 11 → 12 격상

최신 pill 현재 `fontSize 11/600` (line 292~298, 노안 마지노선 12 위반) → 12/600 격상?

**default 답: 12 격상 OK**. design-system §1.1 노안 마지노선 12 / 9·10·11px 사용 금지. memory `feedback_text_caption_leading_none` 일관. `text-caption` (12) `leading-none` 적용. 동시에 모바일 폼 12 보조 'PDF, XLSX, DOCX, PPTX, HWP, ZIP · 최대 500MB' (line 269) 도 12 `leading-none` 유지.

## OQ #4 — 빈/오류/Progress 시각 일관성

빈 상태 FileText 48 유지 vs 오류 상태에도 AlertCircle 48 추가? Progress 16/600 % + 14 meta 보존 vs text-display 격상? 모달 title 20/600 → text-heading 22 격상? Error 카피 13 → 14 격상?

**default 답: 현재 유지 (최소 격상)**. 17-annual-plan + 16-workshift + 23-education W1 빈/오류 상태 아이콘 무 일관. 빈 상태 FileText 48 유지 (보수교육 W1 OQ #4 LOCKED 와 반대 — 22-documents 는 빈 상태 아이콘 이미 존재). 오류 상태는 카피만 (아이콘 추가 OK 옵션). Progress 메타 14 → text-body-sm 유지 (격상 안 함). 모달 title 20 → text-heading 22 격상 (노안 룰 일관). Error 카피 13 → text-body-sm 14 격상 (노안 룰 일관, 13px 사용 금지).

## OQ #5 — `var(--bg4)` 토큰 매핑

`var(--bg4)` 토큰 (DocumentUploadForm `inputBaseStyle` bg, line 184 + progress bar 배경 line 284) — design-system tokens.css 의 surface 5단계 중 어디 매핑?

**default 답: `bg-surface-sunken` 통일**. `var(--bg4)` 가 surface-sunken 보다 더 sunken 한 단계라면 design-system §2.1 5단계 (page/raised/sunken/active/overlay) 안에 없음 → 새 토큰 `surface-sunken-2` 신설 필요. 단 디자인 일관성 위해 `bg-surface-sunken` 통일 권장 — Year tile (`var(--bg3)`) + dashed file button (`var(--bg3)`) + input bg (`var(--bg4)`) + progress bar (`var(--bg4)`) 모두 동일 sunken. 사용자 컨펌 시 LOCKED.

(verify gate 6번 `grep -cE 'OQ #[1-5]' ≥5` 보장)

────────────────────────────────────────

# §8. verify gate (자체 verify — 작성 완료 후 본 인덱스 통과 gate)

| gate | 검증 명령 | 기대값 |
|---|---|---|
| 1. 8 헤더 존재 | `grep -c '^# §[1-8]' wave-1-index.md` | =8 |
| 2. sub-wave 분배 표 ≥5 (W2~W6) | `grep -E '^\| W[2-6] \|' wave-1-index.md \| wc -l` | =5 |
| 3. 메모리 룰 unique ≥10 | `grep -oE 'feedback_[a-z_]+' wave-1-index.md \| sort -u \| wc -l` | ≥10 |
| 4. negative §6 안 wrangler + npm run deploy | `grep -c 'wrangler' wave-1-index.md` ≥1 & `grep -c 'npm run deploy' wave-1-index.md` ≥1 | 둘 다 ≥1 |
| 5. src/** 변경 0 | `git diff --name-only HEAD -- cha-bio-safety/src/pages/DocumentsPage.tsx cha-bio-safety/src/components/DocumentSection.tsx cha-bio-safety/src/components/DocumentUploadForm.tsx` | 0 lines |
| 6. OQ §7 ≥5 | `grep -cE 'OQ #[1-5]' wave-1-index.md` | ≥5 |
| 7. design-system fence ≥14 (open+close) | `grep -c '^\`\`\`' wave-1-index.md` | ≥14 |
| 8. components.css 미수정 + App.tsx 미수정 | `git diff --name-only HEAD -- cha-bio-safety/src/styles/components.css cha-bio-safety/src/App.tsx` | 0 lines |

모두 PASS 시 본 인덱스가 W2 진입의 단일 진입점으로 자격을 갖춘 것으로 본다. 사용자 컨펌은 §7 OQ 5건 답변으로 받는다.

────────────────────────────────────────

**다음 단계**: 사용자에게 §7 OQ 5건 default 답 컨펌 요청 → 컨펌 후 W2 진입 (`sketch-wave-2-chrome.html` — DocumentsPage chrome 4 frame 매트릭스 sketch).
