---
phase: quick-260523-rgj
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md
autonomous: true
requirements:
  - REDESIGN-20-WAVE1
must_haves:
  truths:
    - "wave-1-index.md 파일이 cha-bio-safety/docs/redesign-context/20-legal-findings/ 직속에 생성됨 (sketch/ 서브폴더 X — 13-schedule + 14-reports + 27-login + 16-workshift + 17-annual-plan + 28-splash + 23-education + 19-legal 평면 패턴 mirror)"
    - "7개 필수 섹션(§1~§7) 모두 채워짐"
    - "LegalFindingsPage.tsx 인벤토리 표가 3 영역 (1) 상단 imports/포맷터/SKELETON/Spinner (line 1~40) (2) 메인 페이지 — useQuery 2종 (round/findings) + state 6종 + handlers 3종 (save/upload/delete) + sortedFindings + adminBar + findingCard + addButton (line 41~290) (3) JSX render — 모바일 헤더 + 데스크톱 타이틀 + adminBar + 콘텐츠 (loading/error/empty/list) + 모바일 고정 하단 CTA + FindingFormSheet 시트 2종 (line 291~378) 모두 포함 + 비즈 시그니처 박스 분리"
    - "4 sub-wave 분배 표가 W2~W5 행을 모두 포함 (LegalFindingsPage 378 lines 단일 export + 내부 panel 없음 + 데스크톱/모바일 useIsDesktop 분기 → 4 sub-wave: W2=chrome+모바일 헤더+데스크톱 타이틀+빈/로딩/오류+모바일 고정 하단 CTA / W3=라운드 메타 카드 + finding list + open-first 정렬 + 빈 상태 / W4=admin 도구 (결과 select + 저장 + 보고서 업로드/열기 + ZIP 일괄 다운로드 + finding 수정/삭제) / W5=markdown TSX checklist)"
    - "design-system.md §1.1/§1.2/§1.3/§6.4/§6.6/§7/§7.1 인용이 fence 안 verbatim 으로 포함 (§6/§7 미적용 부분은 1줄 메타 동반)"
    - "메모리 룰 12개가 inline 인용 (10 기본 + LegalFindingsPage 특화 2건 — finding 상태 칩 status 토큰 매핑 룰 + role admin 권한 도구 분기 + sortedFindings open-first 룰)"
    - "negative rule 섹션이 sketch HTML 금지 / 코드 수정 금지 (LegalFindingsPage.tsx + PhotoGrid.tsx + PhotoSourceModal.tsx + FindingFormSheet.tsx + utils/findingDownload.ts + hooks/useMultiPhotoUpload.ts + utils/api.ts 7 파일) / wrangler 금지 / npm run deploy 금지 / 평면 폴더 / App.tsx 미수정 / 비즈 시그니처 변경 금지 (legalApi 4종 get/getFindings/updateResult/deleteFinding + useQuery 2종 + useQueryClient invalidate 4 key + role admin 분기 + navigate 분기 + sortedFindings open-first + filter/sort 로직 + fmtDate/fmtMonthOnly + handleZipDownload 패턴 + buildMetaTxt + fflate ZIP + 모바일 헤더 36x36 + headerTitle 동적 분기 + finding 칩 2분기 (open/resolved)) + 부모 /legal (LegalPage) + 자식 /legal/:id/finding/:fid (LegalFindingDetailPage) 본 wave 범위 아님"
    - "OQ 5건이 §7 에 정리됨 (모바일 헤더 raised alpha 0.97 유지 / finding 상태 칩 status 토큰 치환 / submit/CTA 그라데이션 vs solid / 빈/오류 아이콘 / Lucide back+Camera 교체 + back 44x44 격상)"
    - "LegalFindingsPage.tsx 코드 변경 0"
    - "/legal/:id 가 App.tsx 실측 — 라우트 등록 (line 290 LegalFindingsPage) + lazy import (line 36) + MOBILE_NO_NAV_PATHS (line 71, `/legal/:id` 명시 미등재이지만 line 117 정규식 `^\\/legal\\/.+` 으로 모바일 BottomNav 숨김) + DESKTOP_NO_NAV_PATHS (line 74 미등재이지만 line 117 정규식으로 데스크톱 사이드바도 숨김) + DESKTOP_HEADER_HIDE_PATHS (line 77 미등재이지만 showNav=false → AppHeader 함께 숨김) + PAGE_TITLES (line 79~104 `/legal/:id` 미등재 → pageTitle 빈 문자열) = §4 에 박제"
    - "§4 chrome 룰 적용 여부 — LegalFindingsPage 는 19-legal LegalPage 의 sub-route (지적사항 목록) → 점검 시리즈 직접 적용 케이스. inspection-modal-chrome-rules.md 의 적용 가능 룰을 1줄씩 적용/미적용 판정 + 적용 룰은 verbatim 인용. **단 19-legal LegalPage 와 다른 점**: line 117 정규식 `^\\/legal\\/.+` 매칭 → 모바일/데스크톱 모두 showNav=false → BottomNav + 사이드바 + 글로벌 AppHeader 전부 숨김. 자체 헤더 (모바일 line 298~308 / 데스크톱 line 311~319 padding 24px 32px) 가 chrome 의 유일한 외곽."
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md"
      provides: "W2~W5 진입을 위한 단일 진입점 인덱스 + 룰 verbatim 인용 + sub-wave 분배 매핑 (LegalFindingsPage 378 lines 단일 export — 3 영역 4 sub-wave 분배)"
      contains: "§1. LegalFindingsPage 인벤토리 (3 영역 + 비즈 시그니처 박스), §2. 4 sub-wave 분배, §3. design-system verbatim, §4. chrome 통일 룰 적용 (점검 시리즈 직접 적용 케이스 + showNav=false 특수 케이스 + App.tsx 실측), §5. 메모리 룰 12개 inline, §6. negative rule, §7. open questions"
  key_links:
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/pages/LegalFindingsPage.tsx"
      via: "§1 인벤토리에 line 범위 인용 + §2 sub-wave 분배 표의 element/line 매핑 + 비즈 시그니처 박스"
      pattern: "line [0-9]+"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/docs/redesign-context/20-legal-findings/design-system.md"
      via: "§3 fence verbatim 인용 (§1.1/§1.2/§1.3/§6.4/§6.6/§7/§7.1 본문 박제)"
      pattern: "design-system.md §"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md"
      via: "§4 chrome 룰 (점검 시리즈 직접 적용 + showNav=false 특수 케이스 + 각 룰 적용/미적용 1줄 메타)"
      pattern: "inspection-modal-chrome-rules"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/App.tsx"
      via: "§4 chrome 실측 — lazy import (line 36) + MOBILE_NO_NAV_PATHS (line 71 `/legal/:id` 명시 미등재) + DESKTOP_NO_NAV_PATHS (line 74) + DESKTOP_HEADER_HIDE_PATHS (line 77) + PAGE_TITLES (line 79~104) + 특수 regex line 117 `^\\/legal\\/.+` (showNav=false) + Route (line 290)"
      pattern: "LegalFindingsPage|/legal/:id|MOBILE_NO_NAV_PATHS|DESKTOP_NO_NAV_PATHS|DESKTOP_HEADER_HIDE_PATHS|PAGE_TITLES"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/utils/api.ts"
      via: "§1 인벤토리 비즈 로직 보존 — legalApi.get / getFindings / updateResult / deleteFinding 4종 시그니처 박제 (line 349 export const legalApi)"
      pattern: "legalApi\\.(get|getFindings|updateResult|deleteFinding)"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/stores/authStore.ts"
      via: "§1 인벤토리 권한 분기 — useAuthStore().staff.role admin/assistant 분기 (adminBar 안 select/저장/보고서/ZIP 다운로드 모두 admin 한정) 박제"
      pattern: "useAuthStore|staff\\?\\.role"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/hooks/useIsDesktop.ts"
      via: "§1 인벤토리 데스크톱 분기 — useIsDesktop() ≥768px 박제 (line 205 호출, 10+ 위치 분기)"
      pattern: "useIsDesktop"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/components/FindingFormSheet.tsx"
      via: "§1 인벤토리 등록/수정 시트 — FindingFormSheet props { scheduleItemId, mode 'create'|'edit', finding?, onClose } 시그니처 박제 (line 91~99 export interface + function 시그니처)"
      pattern: "FindingFormSheet"
---

<objective>
redesign/20-legal-findings sketch 작업의 wave 1 — 후속 wave(W2~W5) 의 단일 진입점이 되는 인덱스/룰 정리 문서 1개만 작성한다.

Purpose: LegalFindingsPage.tsx (378 라인 — 단일 export, 내부 panel 없음, 모바일 + 데스크톱 분기 via useIsDesktop, `/legal/:id` sub-route — 19-legal LegalPage 가 라운드 카드 클릭 시 navigate(`/legal/${id}`) 로 진입하는 지적사항 목록 페이지) 의 모든 element 를 **4 sub-wave** 로 분배 (19-legal + 23-education + 28-splash + 17-annual-plan + 27-login + 16-workshift W1 패턴 mirror), 그리고 design-system.md 룰과 메모리 룰 12개 (10 기본 + LegalFindingsPage 특화 2건 — finding 상태 칩 status 토큰 매핑 룰 + role admin 권한 도구 분기 + sortedFindings open-first 룰) 를 verbatim 박제해서 후속 sketch wave 작업자가 이 인덱스만 보면 일관되게 작업할 수 있도록 한다.

Output: `cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md` 단 1개 파일. 코드 변경 0건. sketch HTML 생성 0건 (그건 W2 부터).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md
@./CLAUDE.local.md

# 19-legal W1 + 23-education W1 + 28-splash W1 precedent (이번 wave 가 mirror 할 정확한 7 섹션 + 4 sub-wave 구조)
@.planning/quick/260522-sa7-redesign-19-legal-w1/260522-sa7-PLAN.md
@.planning/quick/260522-gmp-redesign-23-education-w1/260522-gmp-PLAN.md
@.planning/quick/260522-209-redesign-28-splash-sketch-wave-1-splashs/260522-209-PLAN.md

# 19-legal W1 산출물 (가장 직접적인 mirror — LegalFindingsPage 는 LegalPage 의 sub-route, 동일 도메인 + 동일 비즈 anchor 룰)
@cha-bio-safety/docs/redesign-context/19-legal/wave-1-index.md
@cha-bio-safety/docs/redesign-context/19-legal/sketch-wave-2-chrome.html
@cha-bio-safety/docs/redesign-context/19-legal/sketch-wave-3-round-card.html
@cha-bio-safety/docs/redesign-context/19-legal/sketch-wave-4-findings-panel.html
@cha-bio-safety/docs/redesign-context/19-legal/wave-5-tsx-conversion-checklist.md

# 23-education + 28-splash 평면 패턴 mirror (12 메모리 룰 패턴 + 단일 파일 atomic 패턴)
@cha-bio-safety/docs/redesign-context/23-education/wave-1-index.md
@cha-bio-safety/docs/redesign-context/28-splash/wave-1-index.md

# Source file (이 wave 의 분석 대상, 수정 0)
@cha-bio-safety/src/pages/LegalFindingsPage.tsx

# Redesign context (이 wave 가 산출할 인덱스가 인용/참조하는 문서들)
@cha-bio-safety/docs/redesign-context/20-legal-findings/20-legal-findings.md
@cha-bio-safety/docs/redesign-context/20-legal-findings/design-system.md
@cha-bio-safety/docs/redesign-context/20-legal-findings/LegalFindingsPage.tsx
@cha-bio-safety/docs/redesign-context/20-legal-findings/PhotoGrid.tsx
@cha-bio-safety/docs/redesign-context/20-legal-findings/PhotoSourceModal.tsx
@cha-bio-safety/docs/redesign-context/20-legal-findings/tokens.css
@cha-bio-safety/docs/redesign-context/20-legal-findings/typography.css
@cha-bio-safety/docs/redesign-context/20-legal-findings/useMultiPhotoUpload.ts
@cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md

# App.tsx 실측 (chrome 등록 여부 — 특수 케이스: line 117 정규식)
@cha-bio-safety/src/App.tsx

# 13-schedule + 14-reports + 27-login + 16-workshift + 17-annual-plan + 28-splash + 23-education + 19-legal 모두 평면 sibling 패턴 (sketch/ 서브폴더 없음). 본 wave 도 동일.
</context>

<interfaces>
<!-- 후속 wave 가 산출할 sketch 파일 명명 규칙 (이 인덱스가 §2 표에서 인용) -->
<!-- 13-schedule + 14-reports + 27-login + 16-workshift + 17-annual-plan + 28-splash + 23-education + 19-legal 평면 패턴 일관 — 20-legal-findings/ 직속에 위치 -->

W2 → cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html
W3 → cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html
W4 → cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html
W5 → cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md (markdown, sketch 아님)

(주의: LegalFindingsPage 가 378 lines 단일 export — 내부 panel 없음 (19-legal LegalPage 의 3개 내부 컴포넌트와 다름). useIsDesktop 분기로 데스크톱/모바일 단일 컬럼 (데스크톱은 maxWidth 800 중앙 정렬). 모바일은 자체 헤더 + 콘텐츠 + 고정 하단 CTA, 데스크톱은 padding 24px 32px 타이틀 영역 + adminBar + 콘텐츠. **부모 페이지 /legal (LegalPage) + 자식 페이지 /legal/:id/finding/:fid (LegalFindingDetailPage) 는 본 wave 범위 아님**. 4 sub-wave 분배는 W2 chrome+모바일 헤더+데스크톱 타이틀+빈/로딩/오류+모바일 고정 하단 CTA / W3 라운드 메타 카드+finding list+open-first 정렬+빈 상태 / W4 admin 도구 (결과 select + 저장 + 보고서 업로드/열기 + ZIP 일괄 다운로드 + finding 수정/삭제 액션) / W5 markdown TSX checklist 채택. 평면 패턴 4-wave 개수와 sketch-wave-N-{slug}.html (W2~W4) + wave-5-tsx-conversion-checklist.md (W5) 유지.)

# 비즈 로직 시그니처 (W5 TSX 보존 checklist 의 anchor — 이 인덱스가 §1 + §6 에서 인용)

## LegalFindingsPage.tsx (line 1~378)
### 상단 imports / 포맷터 / SKELETON / Spinner (line 1~40)
- imports (line 1~10): useState/useRef / useParams+useNavigate / useQuery+useQueryClient / toast / legalApi / useAuthStore / useIsDesktop / FindingFormSheet / buildMetaTxt / type { LegalFinding }
- fmtDate(iso: string) (line 13~16): `${y}.${m}.${d}` zero-padded — 1 byte 변경 금지
- fmtMonthOnly(iso: string) (line 18~21): `${y}.${m}.` (일자 없음, trailing dot) — 1 byte 변경 금지
- SKELETON_STYLE (line 24~29): { background: 'var(--bg3)', borderRadius: 12, height: 88, animation: 'blink 2s ease-in-out infinite' } — height 88 (19-legal LegalPage 72 와 다름, 23-education 88 과 일치) — 1 byte 변경 금지
- Spinner() (line 32~39): 28x28 border 2px var(--bd2) borderTopColor var(--acl) borderRadius 50% animation `spin .7s linear infinite` + 인라인 `@keyframes spin{to{transform:rotate(360deg)}}` — flex column으로 빈 영역에 absolute 가운데가 아닌 flex center

### 메인 페이지 LegalFindingsPage (line 41~290) — useQuery + state + handlers + sorted + adminBar + findingCard + addButton
- useParams { id } (line 43) + useNavigate (line 44) + useQueryClient (line 45) + useAuthStore().staff + role (line 46~47)
- state (line 49~55):
  - showSheet boolean (등록 시트)
  - editingFinding LegalFinding | null (수정 시트)
  - selectedResult string (admin select 값 — '' '' 'pass' 'fail' 'conditional')
  - savingResult boolean (admin 저장 중)
  - uploadingReport boolean (admin 보고서 업로드 중)
  - zipLoading string | false ('준비 중...' / '수집 중... (N/M)' / '압축 중...' / false)
  - reportInputRef HTMLInputElement (admin 파일 input ref)
- useQuery × 2 (line 57~68):
  - `['legal-round', id]` → legalApi.get(id!), enabled !!id (line 57~61)
  - `['legal-findings', id]` → legalApi.getFindings(id!), enabled !!id, staleTime 30_000 (line 63~68)
- isLoading = roundLoading || findingsLoading (line 70)
- currentResult = round?.result ?? null (line 73), effectiveSelectedResult = selectedResult || (currentResult ?? '') (line 74)
- handleSaveResult (line 76~89): legalApi.updateResult(id, { result: effectiveSelectedResult || undefined }) → invalidate ['legal-round', id] + ['legal-rounds'] + toast.success '점검 결과가 저장되었습니다.' / catch toast.error '저장에 실패했습니다.'
- handleReportUpload (line 91~117): FormData multipart `/api/uploads` (folder `legal/${id}/report`) + Authorization Bearer token (dynamic import authStore) → key 받아서 legalApi.updateResult(id, { report_file_key: key }) → invalidate ['legal-round', id] + toast.success '보고서가 업로드되었습니다.' / catch toast.error '사진 업로드 실패'
- headerTitle (line 120~122): round 있으면 `${round.title.includes('종합정밀') ? '종합정밀' : '작동기능'} ${fmtMonthOnly(round.date)}` / 없으면 '지적사항 목록' — **동적 분기 보존**
- handleDeleteFinding (line 124~136): e.stopPropagation + legalApi.deleteFinding(id, finding.id) → invalidate ['legal-findings', id] + ['legal-rounds'] + ['legal-round', id] + toast.success '삭제되었습니다' / catch toast.error err?.message ?? '삭제 실패'
- handleZipDownload (line 138~196) — **ZIP 일괄 다운로드** (admin 전용 — adminBar 안 배치):
  - fflate `zipSync` 동적 import
  - findings.length 0 이면 early return
  - 폴더명 `finding-${idx}_${(f.location ?? '위치없음').replace(/[\\/\\\\:*?"<>|]/g, '_')}` (idx zero-padded 3자리)
  - 내용.txt → encoder.encode(buildMetaTxt(f)) — **사진 0건이어도 always 포함**
  - photoKeys 매핑 → '지적사진-${j+1}.jpg' (Promise.allSettled fulfilled 만)
  - resolutionPhotoKeys 매핑 → '조치사진-${j+1}.jpg' (Promise.allSettled fulfilled 만)
  - zipLoading 단계별 텍스트 '준비 중...' → '수집 중... (N/M)' → '압축 중...' → false
  - Blob zipped.buffer as ArrayBuffer, type 'application/zip'
  - iOS PWA 안정성 위해 `<a download>` 방식 (createElement / body.appendChild / click / removeChild + setTimeout(URL.revokeObjectURL, 3000)) — **iOS 다운로드 패턴 1 byte 변경 금지**
  - 파일명 `지적사항_${round?.title ?? 'report'}.zip` (line 184)
  - toast.success '다운로드 완료' / catch toast.error '다운로드에 실패했습니다' / console.error 'ZIP download failed:'
- sortedFindings (line 198~203): findings.sort — status 'open' 먼저 (open === -1, open !== 1, 그 외 createdAt desc localeCompare) — **운영 룰 source of truth**
- isDesktop = useIsDesktop() (line 205)
- **adminBar** (line 208~234) — `role === 'admin' && round` 조건부 렌더, null 시 표시 안 함:
  - 외곽 (line 209~218): padding `isDesktop ? '8px 24px' : '8px 16px'` background var(--bg2) borderBottom 1px solid var(--bd) display flex gap 8 alignItems center flexShrink 0 flexWrap wrap
  - select (line 219~224): effectiveSelectedResult — '결과 미입력' / pass '적합' / fail '부적합' / conditional '조건부적합'. bg var(--bg3) border 1px solid var(--bd2) borderRadius 8 padding '6px 12px' color var(--t1) fontSize 13 appearance none cursor pointer
  - 저장 button (line 225): 12/700 height 36 bg var(--acl) borderRadius 8 padding '0 12px' color #fff cursor savingResult ? 'not-allowed' : 'pointer' opacity savingResult ? 0.6 : 1 flexShrink 0 — verbatim '결과 저장'
  - file input (line 226): hidden, accept 'application/pdf' onChange handleReportUpload
  - 보고서 button 조건부 (line 227~231):
    - reportFileKey 있으면 (line 228): '보고서 보기' window.open('/api/uploads/' + key, '_blank') — 12/700 h 36 bg var(--bg3) border 1px solid var(--bd2) padding '0 12px' color var(--t1)
    - 없으면 (line 230): '보고서 업로드' / '업로드 중...' (uploadingReport) → reportInputRef.current?.click() — color var(--t2) (idle) opacity 0.6 + cursor not-allowed (uploading)
  - 일괄 다운로드 button (line 232): zipLoading 텍스트 || '일괄 다운로드' — disabled !!zipLoading || !findings?.length — 12/700 h 36 bg var(--bg3) border 1px solid var(--bd2) padding '0 12px' color var(--t1) whiteSpace nowrap
- **findingCard** 함수 (line 237~269): 각 finding 렌더링
  - 외곽 onClick navigate(`/legal/${id}/finding/${finding.id}`) — **자식 페이지 LegalFindingDetailPage 진입** (App.tsx line 291) — 본 wave 범위 아님
  - 스타일 (line 241~251): bg var(--bg3) border 1px solid var(--bd) **borderLeft `2px solid ${finding.status === 'open' ? 'var(--danger)' : 'var(--safe)'}`** (19-legal LegalPage 의 3px 과 다름 — 2px) borderRadius 12 padding `isDesktop ? 16 : 12` cursor pointer flex column gap 3
  - 상단 라인 (line 253~256): description 14/500 var(--t1) 1줄 ellipsis flex 1 + 상태 칩 11/700 borderRadius 6 padding '2px 8px' flexShrink 0 (open → bg rgba(239,68,68,.15) color var(--danger) '미조치' / resolved → bg rgba(34,197,94,.13) color var(--safe) '완료') — verbatim
  - 위치 (line 257): location ?? '위치 미지정' 12 var(--t2)
  - 메타 (line 258~267): fmtDate(createdAt) + ' · ' + (createdByName ?? createdBy) 11 var(--t3) + 우측 '수정' button (e.stopPropagation + setEditingFinding) / '삭제' button (handleDeleteFinding) — 둘 다 10 var(--t3) background none border none cursor pointer padding '2px 4px'
- **addButton** 함수 (line 272~291): 등록 button
  - `+ 지적사항 등록` verbatim
  - 데스크톱: width auto height 36 padding '0 16px' borderRadius 8 fontSize 13
  - 모바일: width 100% height 48 borderRadius 12 fontSize 14 (터치 마지노선 44 일치 + 4 추가)
  - 공통: bg var(--acl) color #fff fontWeight 700 border none cursor pointer flexShrink 0

### JSX render (line 293~377)
- 외곽 (line 294): flex 1 display flex flexDirection column background var(--bg) height 100% overflow hidden
- 인라인 `@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }` (line 295) — 19-legal LegalPage `.6/.3` 일치, Education `1/0.4` 와 다름
- **모바일 헤더** (line 298~308, `!isDesktop` 조건): height 48 bg `rgba(22,27,34,0.97)` (raised 변형 alpha — 19-legal + 23-education 일관) borderBottom 1px solid var(--bd) flex align justify center relative flexShrink 0
  - back button (line 303~305): position absolute left 12 **width 36 height 36** (§1.1 터치 마지노선 44 미달 — OQ #5 LOCKED 시 44x44 격상) border none background none color var(--t1) flex center align center
  - 인라인 SVG ChevronLeft (line 304): width 20 height 20 strokeWidth 2 path `M15 19l-7-7 7-7` strokeLinecap round strokeLinejoin round (Lucide ChevronLeft size={20} 교체 후보)
  - 타이틀 (line 306): headerTitle 16/700 var(--t1) — 동적 분기 ('지적사항 목록' 또는 '종합정밀/작동기능 ${YYYY.MM.}')
- **데스크톱 타이틀 + 등록 button** (line 311~319, `isDesktop` 조건): padding '24px 32px 12px' flex alignItems center justifyContent space-between flexShrink 0
  - 좌측: headerTitle 22/800 var(--t1) + round 있으면 round.title 13 var(--t2) marginTop 4 (동적 round 정보)
  - 우측: addButton (데스크톱 width auto height 36)
- **adminBar** (line 321): 모바일/데스크톱 공통 위치 — 헤더 또는 타이틀 바로 아래 — `role === 'admin' && round` 조건부
- **콘텐츠 영역** (line 324~345): isLoading ? Spinner : isError ? 오류 fallback : 카드 목록 분기
  - isLoading (line 324~325): Spinner
  - isError (line 326~329): flex 1 alignItems center justifyContent center padding '0 24px' textAlign center 14 var(--t2) — '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.' verbatim
  - 목록 (line 330~344): flex 1 overflowY auto padding `isDesktop ? '16px 32px' : '12px 16px'` paddingBottom `isDesktop ? 24 : 'calc(72px + var(--sab, 0px))'` (모바일 = 고정 CTA 영역 회피) flex column gap 8 maxWidth `isDesktop ? 800 : undefined` (데스크톱 중앙 정렬용)
  - 빈 (line 338~341): sortedFindings.length === 0 → '지적사항 없음' 16/700 var(--t1) + '현장에서 지적된 항목을 등록하려면 ${isDesktop ? '상단' : '아래'} 버튼을 누르세요.' 12 var(--t2) — flex column align center justify center gap 8 padding '60px 16px'
  - 카드 매핑 (line 343): sortedFindings.map(findingCard)
- **모바일 고정 하단 CTA** (line 348~356, `!isDesktop` 조건): position fixed bottom 0 left 0 right 0 background var(--bg) borderTop 1px solid var(--bd) padding '12px 16px' paddingBottom 'calc(12px + var(--sab, 0px))' zIndex 20 → {addButton} (모바일 width 100% height 48)
- **등록 시트** (line 359~365): showSheet && id → FindingFormSheet { scheduleItemId id, mode 'create', onClose setShowSheet(false) }
- **수정 시트** (line 368~375): editingFinding && id → FindingFormSheet { scheduleItemId id, mode 'edit', finding editingFinding, onClose setEditingFinding(null) }

## utils/api.ts (legalApi 4종 시그니처 박제 — line 349 export const legalApi)
- legalApi.get(roundId: string): Promise<LegalRound>
- legalApi.getFindings(roundId: string): Promise<LegalFinding[]>
- legalApi.updateResult(roundId, { result?, report_file_key? }): Promise<void>  (snake_case payload 변경 금지)
- legalApi.deleteFinding(roundId, findingId): Promise<void>
(주의: legalApi.list / getFinding / resolveFinding 3종은 LegalFindingsPage 미사용 — 19-legal LegalPage / LegalFindingDetailPage 가 각각 사용)

## utils/findingDownload.ts
- buildMetaTxt(finding: LegalFinding): string — ZIP 내부 '내용.txt' 콘텐츠 (시그니처 변경 금지, 본 wave 미수정)

## stores/authStore.ts (권한 분기)
- useAuthStore().staff: Staff | null — role: 'admin' | 'assistant'
- admin 한정: adminBar 전체 (결과 select + 저장 + 보고서 업로드/열기 + ZIP 일괄 다운로드)
- 그 외 (assistant): adminBar 미렌더 (`role === 'admin' && round` 조건부) — findingCard + 수정/삭제 + 등록 시트 + 수정 시트 + 모바일 고정 CTA 는 모두 렌더 (조치는 자식 페이지 LegalFindingDetailPage 가 담당)

## hooks/useIsDesktop.ts
- useIsDesktop(): boolean — ≥768px 분기

## components/FindingFormSheet.tsx (line 91~99 시그니처)
- export interface FindingFormSheetProps { scheduleItemId, mode 'create'|'edit', finding?, onClose }
- 자체 fixed/inset:0 오버레이 (본 wave 미수정)

## components/PhotoGrid.tsx + PhotoSourceModal.tsx + hooks/useMultiPhotoUpload.ts
- LegalFindingsPage 직접 사용 X — FindingFormSheet 내부에서 사용 (지적사진 + useMultiPhotoUpload 5장 슬롯)
- 본 wave + W2~W5 미수정 — 시그니처 + props 보존

## react-query / react-router-dom / react-hot-toast 의존
- useQuery / useQueryClient (@tanstack/react-query)
- useParams / useNavigate (react-router-dom — sub-route id 추출 + 자식 페이지 진입 / 뒤로가기)
- toast (react-hot-toast)
- import('fflate') dynamic (다운로드 ZIP 시점에만 로드)
- import('../stores/authStore') dynamic (handleReportUpload 안 token 가져오기용)
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: wave-1-index.md 작성</name>
  <files>cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md</files>
  <action>
LegalFindingsPage.tsx (378 라인) + 20-legal-findings.md + design-system.md + tokens.css + typography.css + PhotoGrid.tsx + PhotoSourceModal.tsx + useMultiPhotoUpload.ts + inspection-modal-chrome-rules.md + App.tsx (chrome 실측) 를 모두 끝까지 읽은 뒤 아래 7개 섹션을 가진 단일 markdown 파일을 작성한다. 파일은 Write 도구로 생성한다 (heredoc/cat 금지).

**작업 진행 룰** (CRITICAL):
1. 가장 먼저 19-legal wave-1-index.md (`cha-bio-safety/docs/redesign-context/19-legal/wave-1-index.md`) 를 처음부터 끝까지 Read 도구로 한번에 읽는다 — 이것이 정확히 mirror 할 구조 템플릿 (가장 직접적 mirror, 동일 도메인 + 동일 비즈 anchor 룰).
2. 그 다음 LegalFindingsPage.tsx 를 처음부터 끝까지 Read 한다 (378 lines — 1회로 완전 cover, 같은 range 중복 read 금지).
3. design-system.md §1.1 / §1.2 / §1.3 / §6.4 / §6.6 / §7 / §7.1 영역을 grep + Read offset 으로 정확히 추출한다 (paraphrase 금지, verbatim fence 인용). 19-legal wave-1-index.md 안에 이미 verbatim 인용된 부분은 그대로 복사 가능 (양쪽 모두 동일 design-system v0.1.1 기반).
4. inspection-modal-chrome-rules.md 를 끝까지 한번 Read 한다 (이번 페이지는 점검 시리즈 직접 적용 케이스 — 19-legal 의 sub-route 라 chrome 룰 동일하나 line 117 showNav=false 특수 케이스).
5. App.tsx 의 `/legal/:id` 관련 라인 (36, 71, 74, 77, 79~104, 117, 290) 을 grep 으로 실측 확인 (이미 plan 본문 §1 인벤토리 + 박스에 명시되어 있음 — 그 값을 verbatim 사용).
6. tokens.css 에서 status 토큰 정의 라인을 grep 으로 확인 (19-legal wave-1-index.md 참고).

---

# 파일 헤더

상단에 frontmatter + 다음 1블록:
- frontmatter: title / status: ready_for_oq / created: 2026-05-23 / quick_id: 260523-rgj / branch: redesign/20-legal-findings (based on redesign/19-legal HEAD, NOT main) / source_tsx: cha-bio-safety/src/pages/LegalFindingsPage.tsx / source_tsx_lines: 378 / design_system: cha-bio-safety/docs/redesign-context/20-legal-findings/design-system.md (v0.1.1) / chrome_rules: cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md (소방 점검 관리 sub-route = 점검 시리즈 직접 적용 케이스 — 단 line 117 showNav=false 특수 케이스 — 각 룰 1줄 메타로 적용/미적용 판정) / mirror_of (19-legal + 23-education + 28-splash + 17-annual-plan + 16-workshift + 27-login W1 mirror) / biz_anchor_precedent / sub_wave_count: 4 (W2~W5) / memory_rules_inline: 12 / open_questions: 5
- 제목: `# redesign/20-legal-findings — sketch wave 1 (index)`
- 1-2줄 설명: 본 문서는 W2~W5 진입의 단일 진입점이며, 이 인덱스만 봐도 후속 wave 가 디자인 룰 / 메모리 룰 / sub-wave 분배 / OQ 를 알 수 있도록 한다.
- 산출일자: 2026-05-23 / Quick ID 260523-rgj / branch redesign/20-legal-findings (based on redesign/19-legal HEAD)
- 1줄 메타: "19-legal W1 (260522-sa7) + 23-education W1 (260522-gmp) + 28-splash W1 (260522-209) + 17-annual-plan W1 (260521-wmq) + 16-workshift W1 (260521-sjj) + 27-login W1 (260521-c6p) 의 7 섹션 + 4 sub-wave 구조를 정확히 mirror. LegalFindingsPage 가 378 lines 단일 export (19-legal LegalPage 의 3개 내부 컴포넌트와 다름) — 모바일/데스크톱 useIsDesktop 분기 + 데스크톱 maxWidth 800 중앙 정렬 + 모바일 고정 하단 CTA — 4 sub-wave (W2~W5) 채택. **19-legal 과 차이**: (1) 부모 라우트 `/legal` 의 sub-route `/legal/:id`, (2) App.tsx line 117 정규식 `^\\/legal\\/.+` 매칭으로 모바일/데스크톱 모두 showNav=false (글로벌 chrome 모두 숨김 — 자체 헤더가 유일한 외곽), (3) 내부 panel 없는 단일 export, (4) 사진 5장 useMultiPhotoUpload 직접 사용 X (FindingFormSheet 가 내부에서 담당), (5) finding borderLeft 2px (19-legal 3px 과 다름), (6) findingCard 클릭 시 자식 페이지 `/legal/:id/finding/:fid` 진입 (LegalFindingDetailPage — 본 wave 범위 아님), (7) headerTitle 동적 분기 (round 정보 기반 '종합정밀/작동기능 YYYY.MM.')."

---

# §1. LegalFindingsPage.tsx 인벤토리

LegalFindingsPage.tsx (378 lines, 실측) 의 element 를 3 영역 (1) 상단 imports/포맷터/SKELETON/Spinner (line 1~40) (2) 메인 페이지 LegalFindingsPage — useQuery + state + handlers + sortedFindings + adminBar + findingCard + addButton (line 41~290) (3) JSX render — 모바일 헤더 + 데스크톱 타이틀 + adminBar + 콘텐츠 + 모바일 고정 하단 CTA + FindingFormSheet 2종 (line 291~378) 으로 나눠 표로 정리. 각 행은 (영역 / element / source line 범위 / 역할 / 비즈 로직 연결 / 후속 wave 매핑) 6 컬럼. line 범위는 **실측 결과** (이미 plan 본문에 line 범위 명시되어 있음 — 그 값을 verbatim 사용, drift 없음).

**LegalFindingsPage 의 구조 특이성** (인벤토리 머리말로 1단락):
- 모바일/데스크톱 분기 via `useIsDesktop()` (line 7 import, line 205 호출, ≥768px). 데스크톱은 maxWidth 800 중앙 정렬 (19-legal LegalPage 의 3분할 500/500/flex1 과 다름).
- **단일 export 378 lines** — 내부 panel/컴포넌트 0건 (19-legal LegalPage 의 FindingsPanel/FindingDetailPanel/메인 LegalPage 3개 통합과 다름). 19-legal LegalPage 의 sub-route 페이지로, **모바일이 라운드 카드 클릭 시 navigate(`/legal/${id}`) 로 진입하는 페이지** (App.tsx line 290).
- **`/legal/:id` 는 글로벌 chrome 모두 숨김** — App.tsx line 117 정규식 `!location.pathname.match(/^\/legal\/.+/)` 매칭으로 `showNav=false` → 모바일 BottomNav + 데스크톱 사이드바 + 데스크톱 글로벌 AppHeader 모두 숨김. 자체 헤더 (모바일 line 298~308 / 데스크톱 line 311~319) 가 유일한 외곽 chrome. 19-legal LegalPage `/legal` 본 페이지는 데스크톱 글로벌 AppHeader + 사이드바 표시 — **본 wave 와 완전히 다른 chrome 모드**.
- **headerTitle 동적 분기** (line 120~122) — round 있으면 `${round.title.includes('종합정밀') ? '종합정밀' : '작동기능'} ${fmtMonthOnly(round.date)}` (예: '종합정밀 2026.05.') / 없으면 '지적사항 목록' fallback. 모바일 헤더 + 데스크톱 타이틀 양쪽 동일 사용 — **비즈 분기 보존 룰** (변경 금지).
- **finding 상태 2분기 (open/resolved) 색 분기** (line 244 borderLeft + line 255 칩) — open → borderLeft 2px var(--danger) + 칩 bg rgba(239,68,68,.15) + var(--danger) + '미조치' / resolved → borderLeft 2px var(--safe) + 칩 bg rgba(34,197,94,.13) + var(--safe) + '완료'. **borderLeft 2px** (19-legal LegalPage 의 3px 과 다름). status 토큰 매핑 룰 = W3 sketch 핵심 (memory `feedback_tailwind_token_class_pattern` status- prefix 없음 룰 + memory `feedback_inspection_unresolved_color` 결과 status 토큰 일반화).
- **role admin 권한 도구 분기** (line 208 adminBar `role === 'admin' && round` 조건부) — admin 만 결과 select + 결과 저장 + 보고서 업로드/열기 + ZIP 일괄 다운로드 가능. assistant 는 adminBar 미렌더 — finding 등록/수정/삭제 + 자식 페이지 진입은 모든 사용자 가능. 비즈 보존 룰 = W4 sketch 보존 필수 (memory `project_inspection_completion_rule` 일반화 룰).
- **모바일은 자체 헤더 렌더** (line 298~308) — height 48 / bg `rgba(22,27,34,0.97)` (raised 변형 alpha — 19-legal + 23-education 일관) / borderBottom 1px / back button **36x36 (position absolute left 12)** — 19-legal LegalPage 와 동일. 디자인 §1.1 터치 마지노선 44px 미달 — OQ #5 검토 후보 (Lucide 교체 + 사이즈 44x44 격상). 타이틀 = headerTitle (동적 분기) 16/700 정중앙.
- **데스크톱 타이틀 + 등록 button** (line 311~319) — padding '24px 32px 12px' flex space-between. 좌측 headerTitle 22/800 + round?.title 13 var(--t2) marginTop 4 (round 정보 라인). 우측 addButton (width auto height 36). 데스크톱은 자체 헤더 없음, 글로벌 AppHeader 도 숨김 — **데스크톱 시안 상단에 타이틀 padding 영역만 chrome 으로 인지**.
- **모바일 고정 하단 CTA** (line 348~356) — position fixed bottom 0 / addButton (모바일 width 100% height 48). zIndex 20. paddingBottom 'calc(12px + var(--sab, 0px))' iOS safe-area. 콘텐츠 영역 paddingBottom 'calc(72px + var(--sab, 0px))' 로 카드 영역이 가려지지 않게 회피. 19-legal LegalPage 의 데스크톱 3분할/모바일 sub-route 와 다른 패턴.
- **findingCard onClick → 자식 페이지 진입** (line 240) — navigate(`/legal/${id}/finding/${finding.id}`) → LegalFindingDetailPage (App.tsx line 291). **본 wave + W2~W5 범위는 LegalFindingsPage.tsx 만** (자식 페이지는 별도 wave).
- **ZIP 일괄 다운로드 (admin 전용 + adminBar 안 배치)** (line 138~196 + adminBar 안 line 232) — fflate `zipSync` 동적 import + buildMetaTxt → 내용.txt + photoKeys '지적사진-{N}.jpg' + resolutionPhotoKeys '조치사진-{N}.jpg' + 파일명 `지적사항_${round?.title ?? 'report'}.zip` (19-legal LegalPage 의 `지적사항_${location 안전화}.zip` 와 다름 — 본 페이지는 round.title 사용). zipLoading 단계별 텍스트 ('준비 중...' / '수집 중... (N/M)' / '압축 중...'). iOS PWA `<a download>` 다운로드 패턴 (createElement + body.appendChild + click + removeChild + setTimeout(URL.revokeObjectURL, 3000)) — 1 byte 변경 금지. 19-legal LegalPage 의 FindingDetailPanel 안 다운로드 (단일 finding) 와 다른 패턴 — 본 페이지는 **전체 findings 일괄 다운로드**.
- **사진 업로드 (useMultiPhotoUpload) 본 페이지 직접 사용 X** — FindingFormSheet 가 내부에서 useMultiPhotoUpload 사용. 본 페이지는 FindingFormSheet props (scheduleItemId / mode 'create'|'edit' / finding? / onClose) 만 전달.
- **인라인 keyframes 2종** — `blink { 0%,100%{opacity:.6} 50%{opacity:.3} }` (line 295) — 19-legal `.6/.3` 일치, Education `1/0.4` 와 다름 + `spin { to{transform:rotate(360deg)} }` (line 36 Spinner 함수 내부) — 1 byte 변경 금지.
- **빈 상태 메시지 verbatim** (line 340~341): '지적사항 없음' (16/700 var(--t1)) + '현장에서 지적된 항목을 등록하려면 ${isDesktop ? '상단' : '아래'} 버튼을 누르세요.' (12 var(--t2)) — **isDesktop 분기 ('상단' / '아래') 보존**.
- **오류 상태 verbatim** (line 328): '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.' (14 var(--t2)) — 19-legal LegalPage 의 '목록을 불러오지 못했습니다.' + '다시 시도' button 분리 패턴과 다름 (본 페이지는 단일 문장).
- **toast 카피 verbatim 7건** — success 3 ('점검 결과가 저장되었습니다.' / '보고서가 업로드되었습니다.' / '삭제되었습니다' / '다운로드 완료') + error 4 ('저장에 실패했습니다.' / '사진 업로드 실패' / err?.message ?? '삭제 실패' / '다운로드에 실패했습니다'). 총 7건 (success 4 + error 4 = 8건 — 다운로드 완료 success 포함하면 8건).
- **권한 분기 카드 cursor** — 모든 finding 카드 cursor pointer (모든 사용자 자식 페이지 진입 가능). 권한 분기는 adminBar (admin 만 결과 select/저장/보고서/ZIP 다운로드) 와 finding 수정/삭제 (모든 사용자 가능 — 19-legal LegalPage 의 admin 분기 없는 finding 액션과 일관).

## §1.1 영역별 인벤토리 표

각 영역 표 3개:

**영역 1 표 — 상단 imports / 포맷터 / SKELETON_STYLE / Spinner** (line 1~40)
- imports 1~10, fmtDate 13~16, fmtMonthOnly 18~21, SKELETON_STYLE 24~29 (height 88), Spinner 32~39 (28x28 인라인 div + @keyframes spin)

**영역 2 표 — 메인 페이지 LegalFindingsPage 함수** (line 41~290) — useParams + useNavigate + useQueryClient + useAuthStore + role + state 6종 + useQuery 2종 (round/findings) + handlers 3종 (save/upload/delete) + handleZipDownload + sortedFindings (open-first) + useIsDesktop + adminBar (조건부 admin) + findingCard + addButton

**영역 3 표 — JSX render** (line 293~377) — 외곽 + 인라인 keyframes blink + 모바일 헤더 + 데스크톱 타이틀 + adminBar mount + 콘텐츠 (loading/error/empty/list) + 모바일 고정 하단 CTA + FindingFormSheet (create) + FindingFormSheet (edit)

각 표 행은 6 컬럼 (영역 / element / line / 역할 / 비즈 / 후속 wave). element 행은 LegalFindingsPage 의 실제 element 를 모두 망라 — 누락 0건 (전수 인벤토리).

## §1.2 line 수 실측 확인

```
$ wc -l cha-bio-safety/src/pages/LegalFindingsPage.tsx
     378 cha-bio-safety/src/pages/LegalFindingsPage.tsx
```

PLAN 추정치 (378 lines) 일치, drift 없음.

## §1.3 비즈 시그니처 보존 anchor (별도 박스)

W5 TSX 변환 wave 에서 다음 식별자/값은 **1 byte 변경 금지** (19-legal W1 의 비즈 anchor 보존 룰 + 23-education W1 의 비즈 anchor 보존 룰 + 28-splash W1 비즈 anchor 16건 보존 룰 일반화):

```
[LegalFindingsPage.tsx — react-query / 비즈 시그니처]
- useQuery({ queryKey: ['legal-round', id], queryFn: () => legalApi.get(id!), enabled: !!id })  (변경 금지)
- useQuery({ queryKey: ['legal-findings', id], queryFn: () => legalApi.getFindings(id!), enabled: !!id, staleTime: 30_000 })  (변경 금지)
- queryClient.invalidateQueries — ['legal-round', id] / ['legal-rounds'] / ['legal-findings', id] 3 키 (handler onSuccess 마다 정확한 키 invalidate 필수)
- (note: useMutation 없음 — handler 들이 직접 await + try/catch 패턴 사용. 19-legal LegalPage 와 다름)

[utils/api.ts — legalApi 4종 시그니처]
- legalApi.get(roundId: string): Promise<LegalRound>                                              (변경 금지)
- legalApi.getFindings(roundId: string): Promise<LegalFinding[]>                                   (변경 금지)
- legalApi.updateResult(roundId, { result?: LegalInspectionResult; report_file_key?: string })    (snake_case payload 변경 금지)
- legalApi.deleteFinding(roundId, findingId): Promise<void>                                        (변경 금지)
(주의: legalApi.list / getFinding / resolveFinding 3종은 LegalFindingsPage 미사용 — 19-legal LegalPage / LegalFindingDetailPage 가 각각 사용)

[LegalFindingsPage.tsx — 비즈 로직 함수]
- fmtDate(iso): `${y}.${m}.${d}` zero-padded  (변경 금지)
- fmtMonthOnly(iso): `${y}.${m}.` (일자 없음, trailing dot)  (변경 금지)
- headerTitle: round 있으면 `${round.title.includes('종합정밀') ? '종합정밀' : '작동기능'} ${fmtMonthOnly(round.date)}` / 없으면 '지적사항 목록'  (동적 분기 변경 금지)
- effectiveSelectedResult: selectedResult || (round?.result ?? '')  (initial 동기화 룰 변경 금지)
- sortedFindings (line 198~203): status 'open' 먼저, 그 외 createdAt desc localeCompare  (운영 룰 source of truth, 변경 금지)
- adminBar 조건부: role === 'admin' && round  (변경 금지)
- findingCard onClick: navigate(`/legal/${id}/finding/${finding.id}`)  (자식 페이지 진입 — 변경 금지)
- handleDeleteFinding: e.stopPropagation + legalApi.deleteFinding → invalidate 3 키 + toast  (변경 금지)
- handleSaveResult: legalApi.updateResult({ result: effectiveSelectedResult || undefined }) → invalidate ['legal-round'/'legal-rounds']  (변경 금지)
- handleReportUpload: FormData multipart `/api/uploads` (folder `legal/${id}/report`) + dynamic authStore token + legalApi.updateResult({ report_file_key: key }) → invalidate ['legal-round', id]  (변경 금지)
- handleZipDownload: fflate zipSync + buildMetaTxt + Promise.allSettled photoKeys/resolutionPhotoKeys + iOS PWA `<a download>` 패턴 + setTimeout(URL.revokeObjectURL, 3000)  (변경 금지)
- 폴더명 패턴: `finding-${idx zero-padded 3}_${(location ?? '위치없음').replace(/[\\/\\\\:*?"<>|]/g, '_')}`  (변경 금지)

[LegalFindingsPage.tsx — finding 상태 status 시그니처 (memory feedback_inspection_unresolved_color 일반화)]
- finding status open → borderLeft 2px var(--danger) + 칩 bg rgba(239,68,68,.15) color var(--danger) '미조치'  (변경 금지)
- finding status resolved → borderLeft 2px var(--safe) + 칩 bg rgba(34,197,94,.13) color var(--safe) '완료'  (변경 금지)
- borderLeft 2px (19-legal LegalPage 의 3px 과 다름 — **본 페이지는 2px**)  (변경 금지)
- (note: ResultBadge / accentColor 본 페이지에 없음 — 부모 페이지 LegalPage 가 라운드 카드에 사용. 본 페이지는 round 표시는 headerTitle 동적 분기로만)

[LegalFindingsPage.tsx — role 권한 시그니처 (memory project_inspection_completion_rule 일반화)]
- adminBar 조건부 렌더 (line 208 `role === 'admin' && round`) — admin 만 결과 select / 결과 저장 / 보고서 업로드/열기 / ZIP 일괄 다운로드 가능  (변경 금지)
- assistant: adminBar 미렌더, finding 등록/수정/삭제는 가능 (조치는 자식 페이지 LegalFindingDetailPage)  (변경 금지)
- 카드 cursor pointer 모든 사용자 (모든 사용자 자식 페이지 진입 가능)

[LegalFindingsPage.tsx — ZIP 다운로드 패턴]
- ZIP 파일명: `지적사항_${round?.title ?? 'report'}.zip` (19-legal LegalPage 의 location 기반과 다름)  (변경 금지)
- 사진 파일명: `지적사진-${j+1}.jpg` / `조치사진-${j+1}.jpg`  (변경 금지)
- 폴더명 패턴: `finding-${idx zero-padded 3}_${(location ?? '위치없음').replace(/[\\/\\\\:*?"<>|]/g, '_')}`  (변경 금지)
- 내용.txt: encoder.encode(buildMetaTxt(f)) — **사진 0건이어도 always 포함**  (변경 금지)
- iOS PWA `<a download>` 패턴 + setTimeout(URL.revokeObjectURL, 3000)  (변경 금지 — iOS 안정성 검증된 패턴)
- zipLoading 단계별 텍스트: '준비 중...' / '수집 중... (N/M)' / '압축 중...' / false  (변경 금지)

[LegalFindingsPage.tsx — toast / 카피 / 자산 / animation]
- toast.success: '점검 결과가 저장되었습니다.' (line 83, handleSaveResult)                       (변경 금지)
- toast.success: '보고서가 업로드되었습니다.' (line 111, handleReportUpload)                     (변경 금지)
- toast.success: '삭제되었습니다' (line 132)                                                      (변경 금지)
- toast.success: '다운로드 완료' (line 189)                                                       (변경 금지)
- toast.error: '저장에 실패했습니다.' (line 85)                                                   (변경 금지)
- toast.error: '사진 업로드 실패' (line 113)                                                      (변경 금지)
- toast.error: err?.message ?? '삭제 실패' (line 134)                                             (변경 금지)
- toast.error: '다운로드에 실패했습니다' (line 192)                                                (변경 금지)
- 모바일 + 데스크톱 헤더 타이틀 동적 분기: round 있으면 '${종합정밀|작동기능} ${YYYY.MM.}' / 없으면 '지적사항 목록' (line 120~122)  (변경 금지)
- 빈 제목: '지적사항 없음' (line 340, 16/700 var(--t1))                                          (변경 금지)
- 빈 보조 + isDesktop 분기: '현장에서 지적된 항목을 등록하려면 ${isDesktop ? '상단' : '아래'} 버튼을 누르세요.' (line 341, 12 var(--t2))  (변경 금지)
- 오류 verbatim: '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.' (line 328, 14 var(--t2))  (변경 금지)
- adminBar select 옵션 verbatim: '결과 미입력' / '적합' / '부적합' / '조건부적합' (line 220~223)  (변경 금지)
- adminBar 결과 저장 button verbatim: '결과 저장' (line 225)                                       (변경 금지)
- adminBar 보고서 button verbatim: '보고서 보기' (열기, line 228) / '보고서 업로드' (idle, line 230) / '업로드 중...' (uploading)  (변경 금지)
- adminBar ZIP button verbatim: zipLoading 텍스트 || '일괄 다운로드' (line 232)                  (변경 금지)
- finding 카드 액션 verbatim: '수정' (line 264) / '삭제' (line 265)                              (변경 금지)
- finding 상태 칩 verbatim: '미조치' (open) / '완료' (resolved) (line 255)                       (변경 금지)
- finding 카드 위치 fallback: '위치 미지정' (line 257)                                            (변경 금지)
- finding 카드 메타 verbatim 패턴: `${fmtDate(createdAt)} · ${createdByName ?? createdBy}` (line 259)  (변경 금지)
- addButton verbatim: '+ 지적사항 등록' (line 289)                                                (변경 금지)
- @keyframes blink (line 295): `0%,100%{opacity:.6} 50%{opacity:.3}` — 19-legal 일치 / Education 1/0.4 와 다름  (변경 금지)
- @keyframes spin (line 36, Spinner 함수 내부): `to{transform:rotate(360deg)}`  (변경 금지)
- 모바일 헤더 height 48 + back button 36x36 (position absolute left 12, **§1.1 터치 마지노선 44px 미달** — OQ #5 LOCKED 시 44x44 격상 검토) + 타이틀 정중앙  (현 상태 박제, 격상은 OQ)
- 데스크톱 타이틀 padding '24px 32px 12px' + headerTitle 22/800 + round.title 13 var(--t2) marginTop 4
- adminBar height 컴포넌트 별: select padding '6px 12px' fontSize 13 / button height 36 padding '0 12px' fontSize 12 / 외곽 padding '8px 24px' (데스크톱) / '8px 16px' (모바일)
- 콘텐츠 영역 padding `isDesktop ? '16px 32px' : '12px 16px'` paddingBottom `isDesktop ? 24 : 'calc(72px + var(--sab, 0px))'` maxWidth `isDesktop ? 800 : undefined`
- 모바일 고정 하단 CTA: position fixed bottom 0 padding '12px 16px' paddingBottom 'calc(12px + var(--sab, 0px))' zIndex 20 — addButton width 100% height 48
- findingCard padding `isDesktop ? 16 : 12` borderRadius 12 borderLeft 2px solid (open danger / resolved safe) + 상단 라인 description 14/500 + 칩 11/700 + 위치 12 + 메타 11 + 수정/삭제 10
- SKELETON_STYLE height 88 (Education 88 일치, 19-legal LegalPage 72 와 다름) — 단 본 페이지 SKELETON_STYLE 객체는 정의되어 있으나 실제 JSX 에서 사용되지 않음 (Spinner 가 isLoading 처리 — line 324~325). **현 상태 박제** (W5 변환 시 SKELETON 활용 옵션 검토 가능 OQ).
- Spinner div 28x28 border 2px var(--bd2) borderTopColor var(--acl) borderRadius 50% (Lucide Loader2 교체 후보)
- FindingFormSheet (자체 fixed/inset 0 오버레이, 본 wave 미수정)
- PhotoGrid / PhotoSourceModal / useMultiPhotoUpload (FindingFormSheet 내부에서 사용 — 본 페이지 직접 import 만 X — 단 import 시점에는 FindingFormSheet 가 import)

[App.tsx — chrome 실측 (line 36, 71, 74, 77, 79~104, 117, 290)]
- line 36: const LegalFindingsPage = lazy(() => import('./pages/LegalFindingsPage'))               (변경 금지)
- line 71: MOBILE_NO_NAV_PATHS = [... '/legal' ...] — **/legal/:id 명시 미등재** (정규식 line 117 로 cover)  (변경 금지)
- line 74: DESKTOP_NO_NAV_PATHS = ['/', '/login']  // /legal/:id 미등재 (정규식 line 117 로 cover)  (변경 금지)
- line 77: DESKTOP_HEADER_HIDE_PATHS = ['/elevator', '/div', '/floorplan', '/workshift']  // /legal/:id 미등재 (정규식 line 117 로 cover)  (변경 금지)
- line 79~104: PAGE_TITLES Record — `/legal/:id` 미등재 (line 98 `/legal` 만 있음). 본 페이지 진입 시 line 133 `pageTitle = PAGE_TITLES[location.pathname] || ''` → 빈 문자열  (변경 금지)
- line 117: `!location.pathname.match(/^\/legal\/.+/)` — **/legal/:id 매칭 시 showNav=false** → 모바일 BottomNav + 데스크톱 사이드바 + 데스크톱 글로벌 AppHeader 모두 숨김. 자체 헤더가 유일한 chrome  (변경 금지)
- line 290: <Route path="/legal/:id" element={<Auth><LegalFindingsPage /></Auth>} />               (변경 금지)
- line 289: <Route path="/legal" element={<Auth><LegalPage /></Auth>} />                          (부모 페이지 — 본 wave 범위 아님)
- line 291: <Route path="/legal/:id/finding/:fid" element={<Auth><LegalFindingDetailPage /></Auth>} />  (자식 페이지 — 본 wave 범위 아님)

[stores/authStore.ts]
- useAuthStore().staff: Staff | null — role: 'admin' | 'assistant'                                 (시그니처 변경 금지)
- handleReportUpload 안 dynamic import('../stores/authStore').useAuthStore.getState().token  (Bearer token 패턴 변경 금지)

[hooks/useIsDesktop.ts]
- useIsDesktop(): boolean — ≥768px 분기                                                            (시그니처 변경 금지)

[components/FindingFormSheet.tsx (line 91~99)]
- export interface FindingFormSheetProps { scheduleItemId: string, mode: 'create'|'edit', finding?: LegalFinding, onClose: () => void }
- 자체 fixed/inset 0 오버레이 — 본 wave 미수정. props 호출 양식 (etc onClose setShowSheet(false) / setEditingFinding(null)) 보존

[hooks/useMultiPhotoUpload.ts + utils/findingDownload.ts + components/PhotoGrid/PhotoSourceModal]
- 본 페이지 직접 사용 X (FindingFormSheet 내부에서만)
- buildMetaTxt(finding) → ZIP 내부 '내용.txt' (line 153)  (시그니처 변경 금지)
- 모두 본 wave 미수정 — 시그니처 + props 보존
```

위 모든 식별자/값은 §6 negative rule + §5 룰 11/12 + §7 OQ #1/#2/#3/#4/#5 default 답에서 재확인. 1 byte 변경 시 W5 verify FAIL.

---

# §2. 4 sub-wave 분배 plan

다음 표 (W2~W5 4행) — 파일명은 위 frontmatter 의 평면 패턴 (`sketch-wave-N-{slug}.html` for W2~W4, `wave-5-tsx-conversion-checklist.md` for W5):

| Wave | scope | 대상 element | 산출 파일 |
|---|---|---|---|
| W2 | 모바일 자체 헤더 (h 48 + back 36x36 + headerTitle 동적) + 데스크톱 타이틀 영역 (padding '24px 32px 12px' + headerTitle 22/800 + round.title 13) + 빈/로딩/오류 상태 (Spinner / 빈 / 오류 단일 문장) + 모바일 고정 하단 CTA (position fixed + addButton width 100% h 48) | 영역 3 모바일 헤더 (line 298~308) + 데스크톱 타이틀 + 등록 button (line 311~319) + 콘텐츠 영역 외곽 (line 330~344) + 로딩 Spinner (line 324~325) + 오류 fallback (line 326~329) + 빈 fallback (line 338~341, isDesktop '상단'/'아래' 분기) + 모바일 고정 하단 CTA (line 348~356) + 외곽 (line 294 flex 1 column overflow hidden) + 인라인 keyframes blink (line 295 `.6/.3`). headerTitle 동적 분기 (line 120~122) 매트릭스 frame (round 있음/없음 2종). | sketch-wave-2-chrome.html |
| W3 | finding 카드 목록 + open-first 정렬 + finding 상태 borderLeft 2px (open danger / resolved safe) + 칩 (미조치 danger / 완료 safe) + 메타 (fmtDate + createdByName) + 수정/삭제 액션 + 빈 상태 카피 | 영역 2 findingCard 함수 (line 237~269) + sortedFindings (line 198~203, status open 먼저 + createdAt desc) + 영역 3 콘텐츠 매핑 (line 343 sortedFindings.map(findingCard)) + finding status 2분기 매트릭스 (open/resolved + 칩+borderLeft) + 메타 분기 (createdByName ?? createdBy). isDesktop 분기 padding 16/12 + maxWidth 800 (데스크톱 중앙 정렬). | sketch-wave-3-finding-list.html |
| W4 | adminBar (role admin 조건부) — 결과 select (4 옵션) + 결과 저장 button + 보고서 업로드/열기 분기 + ZIP 일괄 다운로드 (단계별 텍스트) + addButton (모바일/데스크톱 분기) + 등록/수정 시트 mount | 영역 2 adminBar (line 208~234, role === 'admin' && round 조건부 — select '결과 미입력/적합/부적합/조건부적합' + 저장 button h 36 var(--acl) + file input hidden + 보고서 button 분기 reportFileKey 있음/없음 + ZIP button + zipLoading 5단계 텍스트) + addButton 함수 (line 272~291, 모바일 width 100% h 48 / 데스크톱 width auto h 36) + 영역 3 FindingFormSheet create (line 359~365, showSheet && id) + FindingFormSheet edit (line 368~375, editingFinding && id). admin 분기 매트릭스 (admin/assistant) + reportFileKey 있음/없음 매트릭스 + zipLoading 5 단계 매트릭스 + 모바일/데스크톱 addButton 매트릭스. handleSaveResult / handleReportUpload / handleZipDownload / handleDeleteFinding 시그니처 보존 검토. | sketch-wave-4-admin-tools.html |
| W5 | TSX 변환 verify checklist (sketch 아님, markdown) | W2~W4 sketch + LegalFindingsPage.tsx 비즈 로직 보존 룰 + finding 상태 2분기 1 byte 변경 금지 + sortedFindings open-first + adminBar role admin 분기 + handleZipDownload iOS PWA `<a download>` 패턴 + buildMetaTxt + 모든 toast 카피 8건 + headerTitle 동적 분기 + Tailwind cheatsheet + 메모리 룰 12건 cross-ref. 19-legal W5 + 28-splash W5 + 23-education W5 의 12-섹션 구조 mirror. | wave-5-tsx-conversion-checklist.md |

## §2.1 각 wave 행 — 보존 / 토큰 / 폰트 / 레이아웃

**[W2 — 모바일 자체 헤더 + 데스크톱 타이틀 + 빈/로딩/오류 상태 + 모바일 고정 하단 CTA]**

- **보존**:
  - 모바일 헤더 + 데스크톱 타이틀 headerTitle 동적 분기 verbatim (line 120~122) — round 있음/없음 × ('종합정밀' / '작동기능') 4종 패턴
  - 빈 제목 '지적사항 없음' (line 340) + 빈 보조 '현장에서 지적된 항목을 등록하려면 ${isDesktop ? '상단' : '아래'} 버튼을 누르세요.' (line 341) verbatim + isDesktop 분기 ('상단' / '아래')
  - 오류 verbatim '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.' (line 328) — 19-legal LegalPage 의 분리 패턴 ('목록을 불러오지 못했습니다.' + '다시 시도' button) 과 다른 단일 문장
  - SKELETON_STYLE height 88 + animation `blink 2s ease-in-out infinite` (line 24~29) — Education 88 일치, 19-legal LegalPage 72 와 다름. 단 현재 SKELETON_STYLE 정의는 있으나 JSX 미사용 (Spinner 가 처리) — **현 상태 박제** (W5 변환 시 SKELETON 활용 옵션 OQ — 단 OQ #4 default 무 유지)
  - Spinner div 28x28 border 2px var(--bd2) borderTopColor var(--acl) borderRadius 50% animation `spin .7s linear infinite` (line 32~39) — 인라인 @keyframes spin. Lucide Loader2 (animate-spin) 교체 후보 (OQ #5)
  - @keyframes blink `0%,100%{opacity:.6} 50%{opacity:.3}` (line 295) — 19-legal 일치, Education 1/0.4 와 다름. 변경 금지
  - @keyframes spin `to{transform:rotate(360deg)}` (line 36 Spinner 함수 내부) — 변경 금지
  - 모바일 헤더 height 48 + back button **36x36 (position absolute left 12)** + 인라인 SVG ChevronLeft strokeWidth 2 path `M15 19l-7-7 7-7` strokeLinecap round strokeLinejoin round — **§1.1 터치 마지노선 44px 미달** — 현 상태 박제 (OQ #5 LOCKED 시 44x44 격상)
  - 모바일 헤더 bg `rgba(22,27,34,0.97)` (raised 변형 alpha) — surface-raised 토큰과의 alpha 차이 OQ #1 검토 (19-legal + 23-education 일관 raised 유지)
  - 데스크톱 타이틀 padding '24px 32px 12px' flex space-between + 좌측 headerTitle 22/800 + round.title 13 var(--t2) marginTop 4 + 우측 addButton (데스크톱 width auto h 36) — verbatim
  - 모바일 고정 하단 CTA position fixed bottom 0 left 0 right 0 padding '12px 16px' paddingBottom 'calc(12px + var(--sab, 0px))' zIndex 20 + addButton (모바일 width 100% h 48) — verbatim
  - 콘텐츠 영역 paddingBottom 'calc(72px + var(--sab, 0px))' 모바일 (CTA 영역 회피) / 24 데스크톱
  - 콘텐츠 영역 maxWidth 800 데스크톱 (중앙 정렬용) — verbatim, 변경 금지
  - 외곽 flex 1 column overflow hidden + height 100% (line 294) — verbatim
  - useIsDesktop 분기 verbatim — 데스크톱 타이틀 영역 / 모바일 자체 헤더 + 고정 하단 CTA

- **토큰** (design-system §4.1 매핑):
  - `var(--bg)` (line 294, 351) → `bg-surface-page`
  - 모바일 헤더 bg `rgba(22,27,34,0.97)` → `bg-surface-raised/97` arbitrary 또는 인라인 유지 (OQ #1)
  - `var(--bg3)` (SKELETON_STYLE line 26 미사용, finding 카드 background line 242) → `bg-surface-sunken`
  - `var(--bd)` (모바일 헤더 borderBottom line 300, 모바일 고정 CTA borderTop line 351 외) → `border-border-default`
  - `var(--bd2)` (Spinner border line 35) → `border-border-strong`
  - `var(--t1)` (모바일 헤더 색 line 303 + 타이틀 line 306, 빈 제목 line 340, 데스크톱 타이틀 line 314) → `text-text-primary`
  - `var(--t2)` (빈 보조 line 341, 데스크톱 round.title line 315, 오류 line 327) → `text-text-secondary`
  - `var(--acl)` (Spinner borderTopColor line 35, addButton bg line 278) → `bg-accent` / `border-t-accent`

- **폰트** (design-system §1.1 + §4.2):
  - 12 (빈 보조 line 341) → text-caption(12) leading-none
  - 13 (데스크톱 addButton fontSize line 280, 데스크톱 round.title line 315) → text-label
  - 14 (모바일 addButton fontSize line 280, 오류 line 327) → text-body-sm
  - 16 (모바일 헤더 타이틀 line 306, 빈 제목 line 340) → text-body (마지노선)
  - 22 (데스크톱 타이틀 headerTitle line 314 fontSize 22/800) → text-display-sm 또는 인라인 22/800 (마지노선 이상)

- **레이아웃**:
  - 모바일: 자체 헤더 48 + (adminBar 옵션) + 콘텐츠 영역 (paddingBottom calc 72) + 고정 하단 CTA 영역 (60~64 + safe-area)
  - 데스크톱: 타이틀 padding '24px 32px 12px' + (adminBar 옵션) + 콘텐츠 영역 padding '16px 32px' maxWidth 800 paddingBottom 24
  - **모바일 BottomNav 숨김** (line 117 정규식 매칭 → showNav=false) — sketch 시 nav placeholder 그릴 필요 없음
  - **데스크톱 사이드바 BottomNav 숨김 + 글로벌 AppHeader 숨김** (line 117 정규식 매칭 → showNav=false) — sketch 시 데스크톱 시안도 chrome 외곽 없이 자체 타이틀 영역만 표시

**[W3 — finding 카드 + open-first 정렬 + 상태 칩 + 메타 + 액션]**

- **보존**:
  - **sortedFindings open-first 정렬 (line 198~203) — 1 byte 변경 금지** (운영 룰 source of truth, memory `project_inspection_completion_rule` 일반화)
  - **finding 상태 borderLeft 2px — open danger / resolved safe — 1 byte 변경 금지** (19-legal LegalPage 의 3px 과 다름, **본 페이지는 2px**)
  - **finding 칩 verbatim '미조치' (open) / '완료' (resolved) (line 255) — 1 byte 변경 금지**
  - finding 칩 색 — open bg `rgba(239,68,68,.15)` + var(--danger) / resolved bg `rgba(34,197,94,.13)` + var(--safe) (또는 status 토큰 치환 OQ #2)
  - finding 칩 외곽 — fontSize 11/700 borderRadius 6 padding '2px 8px' flexShrink 0 (1 byte 변경 금지)
  - finding 카드 외곽 — bg var(--bg3) border 1px solid var(--bd) borderLeft 2px solid (status 분기) borderRadius 12 padding `isDesktop ? 16 : 12` cursor pointer flex column gap 3
  - finding description 14/500 var(--t1) flex 1 1줄 ellipsis (overflow hidden + textOverflow ellipsis + whiteSpace nowrap)
  - finding 위치 12 var(--t2) + fallback '위치 미지정' (line 257) verbatim
  - finding 메타 11 var(--t3) — verbatim 패턴 `${fmtDate(createdAt)} · ${createdByName ?? createdBy}`
  - finding 액션 '수정' (line 264, e.stopPropagation + setEditingFinding) / '삭제' (line 265, handleDeleteFinding) — 둘 다 10 var(--t3) background none border none padding '2px 4px' cursor pointer
  - findingCard onClick navigate(`/legal/${id}/finding/${finding.id}`) — **자식 페이지 진입** (본 wave 범위 아님, 액션만 보존)

- **토큰** (status- prefix 없음 룰):
  - 카드 bg `var(--bg3)` → `bg-surface-sunken`
  - 카드 border 1px solid var(--bd) → `border border-border-default`
  - **finding borderLeft 2px status 토큰** (OQ #2): open → `border-l-2 border-danger-bar` / resolved → `border-l-2 border-safe-bar` — 2px 보존 (border-l-[2px] arbitrary 또는 border-l-2 tailwind 기본)
  - **finding 칩 status 토큰** (OQ #2): open → `bg-danger-bg text-danger` / resolved → `bg-safe-bg text-safe`
  - **status- prefix 없음** (memory `feedback_tailwind_token_class_pattern`) — `border-l-status-danger-bar` 같은 패턴 사용 시 W5 verify FAIL
  - description color `var(--t1)` → `text-text-primary`
  - 위치 color `var(--t2)` → `text-text-secondary`
  - 메타 color `var(--t3)` → `text-text-tertiary`
  - 수정/삭제 button color `var(--t3)` → `text-text-tertiary`

- **폰트** (design-system §1.1 + §4.2):
  - 10 (수정/삭제 button line 263/265) — **§1.1 9·10·11 금지 위반** — 12 격상 후보 (OQ #3 검토)
  - 11 (finding 칩 line 255, 메타 line 259) — **§1.1 위반** — 12 격상 후보 (OQ #3). 격상 후 leading-none 명시 (memory `feedback_text_caption_leading_none`)
  - 12 (위치 line 257) → text-caption(12) leading-none (작은 컨테이너 시각 패딩 방지)
  - 14 (description line 254) → text-body-sm

- **레이아웃**:
  - 카드 padding 16 (데스크톱) / 12 (모바일) + borderRadius 12 + gap 3 (1 byte 변경 금지)
  - 콘텐츠 영역 padding '16px 32px' (데스크톱) / '12px 16px' (모바일) + flex column gap 8 + maxWidth 800 (데스크톱 중앙)
  - 상단 라인 flex alignItems center justifyContent space-between gap 8
  - 메타 라인 flex alignItems center justifyContent space-between
  - 액션 영역 flex alignItems center gap 8

**[W4 — adminBar + addButton + FindingFormSheet mount]**

- **보존**:
  - **adminBar 조건부 렌더 `role === 'admin' && round` (line 208) — 1 byte 변경 금지** (memory `project_inspection_completion_rule` 일반화)
  - **legalApi 4종 호출 (get / getFindings / updateResult / deleteFinding) + admin 분기** — 변경 금지
  - **handleZipDownload iOS PWA `<a download>` 패턴 + setTimeout(URL.revokeObjectURL, 3000)** — 변경 금지
  - **handleReportUpload FormData multipart `/api/uploads` (folder `legal/${id}/report`) + dynamic authStore token** — 변경 금지
  - **handleDeleteFinding e.stopPropagation + invalidate 3 키** — 변경 금지
  - toast 카피 verbatim 8종 — success 4 ('점검 결과가 저장되었습니다.' / '보고서가 업로드되었습니다.' / '삭제되었습니다' / '다운로드 완료') + error 4 ('저장에 실패했습니다.' / '사진 업로드 실패' / err?.message ?? '삭제 실패' / '다운로드에 실패했습니다')
  - adminBar 외곽 — padding `isDesktop ? '8px 24px' : '8px 16px'` background var(--bg2) borderBottom 1px solid var(--bd) flex gap 8 alignItems center flexShrink 0 flexWrap wrap
  - admin select 옵션 verbatim — '결과 미입력' / '적합' / '부적합' / '조건부적합' (line 220~223). bg var(--bg3) border 1px solid var(--bd2) borderRadius 8 padding '6px 12px' color var(--t1) fontSize 13 appearance none cursor pointer
  - admin 결과 저장 button '결과 저장' (line 225) — 12/700 height 36 bg var(--acl) borderRadius 8 padding '0 12px' color #fff. opacity savingResult ? 0.6 : 1 (1 byte 변경 금지)
  - admin file input hidden + accept 'application/pdf' onChange handleReportUpload
  - admin 보고서 button 분기 — reportFileKey 있으면 '보고서 보기' window.open + color var(--t1) / 없으면 '보고서 업로드' / '업로드 중...' + color var(--t2). 12/700 h 36 bg var(--bg3) border 1px solid var(--bd2) padding '0 12px' (1 byte 변경 금지)
  - admin ZIP button zipLoading 텍스트 || '일괄 다운로드' (line 232) + disabled !!zipLoading || !findings?.length. 12/700 h 36 bg var(--bg3) border 1px solid var(--bd2) padding '0 12px' color var(--t1) whiteSpace nowrap (1 byte 변경 금지)
  - addButton verbatim '+ 지적사항 등록' (line 289) — 모바일 width 100% h 48 borderRadius 12 fontSize 14 / 데스크톱 width auto h 36 padding '0 16px' borderRadius 8 fontSize 13 — 공통 bg var(--acl) color #fff fontWeight 700 border none
  - FindingFormSheet props (scheduleItemId / mode 'create'|'edit' / finding / onClose) verbatim — props 호출 양식 보존
  - 등록 시트 mount: showSheet && id (line 359~365)
  - 수정 시트 mount: editingFinding && id (line 368~375)
  - zipLoading 단계별 텍스트 5종 verbatim — '준비 중...' / '수집 중... (${i+1}/${findings.length})' / '압축 중...' / false / '일괄 다운로드' (idle)
  - ZIP 파일명 패턴 `지적사항_${round?.title ?? 'report'}.zip` (line 184) verbatim
  - 폴더명 패턴 `finding-${idx zero-padded 3}_${(location ?? '위치없음').replace(/[\\/\\\\:*?"<>|]/g, '_')}` verbatim
  - 사진 파일명 '지적사진-${j+1}.jpg' / '조치사진-${j+1}.jpg' verbatim
  - 내용.txt always 포함 (사진 0건이어도)

- **토큰** (status- prefix 없음 룰):
  - adminBar bg `var(--bg2)` → `bg-surface-raised`
  - adminBar borderBottom `var(--bd)` → `border-b border-border-default`
  - select bg `var(--bg3)` → `bg-surface-sunken`, border `var(--bd2)` → `border-border-strong`, color `var(--t1)` → `text-text-primary`
  - 결과 저장 button bg `var(--acl)` → `bg-accent` solid (작은 도구 = solid 유지 권장 — 메인 CTA 한정 그라데이션 OQ #4) — 또는 §6.4 그라데이션 (OQ #4)
  - 보고서 button bg `var(--bg3)` → `bg-surface-sunken`, border `var(--bd2)` → `border-border-strong`, color `var(--t1)` → `text-text-primary` (열기) / `var(--t2)` → `text-text-secondary` (idle)
  - ZIP button bg `var(--bg3)` → `bg-surface-sunken`, border `var(--bd2)` → `border-border-strong`, color `var(--t1)` → `text-text-primary`
  - addButton bg `var(--acl)` → `bg-accent` solid 또는 **§6.4 그라데이션 `linear-gradient(135deg, #1d4ed8, #0ea5e9)`** (메인 CTA 적용 OQ #4 default 그라데이션). disabled cursor not-allowed + opacity 0.6

- **폰트** (design-system §1.1 + §4.2):
  - 12 (admin 결과 저장/보고서/ZIP button line 225/228/230/232) — **§1.1 9·10·11 금지 한계 케이스 (12 = 마지노선)** — 격상 불요. text-caption(12) font-bold leading-none
  - 13 (admin select fontSize line 219, addButton 데스크톱 line 280) → text-label
  - 14 (addButton 모바일 line 280) → text-body-sm

- **레이아웃**:
  - adminBar — padding '8px 24px' (데스크톱) / '8px 16px' (모바일) + flex gap 8 alignItems center flexShrink 0 flexWrap wrap
  - select padding '6px 12px' borderRadius 8
  - button h 36 padding '0 12px' borderRadius 8 — **터치 마지노선 44px 미달** (h 36 = 데스크톱 도구 36 정도, 모바일은 컨펌 후 격상 검토 OQ #3)
  - addButton 모바일 h 48 borderRadius 12 / 데스크톱 h 36 borderRadius 8
  - FindingFormSheet 자체 fixed/inset 0 오버레이 (본 wave 미수정)

**[W5 — TSX 변환 verify checklist]**

- W2~W4 모든 sketch 의 className/style 인라인 grep 추출 + verbatim 인용 (memory `feedback_planner_prompt_sketch_verbatim`)
- 비즈 anchor 시그니처 1 byte 변경 0 verify gate — useQuery 2종 + legalApi 4종 + headerTitle 동적 분기 + sortedFindings open-first + handleSaveResult/handleReportUpload/handleDeleteFinding/handleZipDownload (iOS PWA `<a download>` + setTimeout 3000) + adminBar role === 'admin' && round 조건부 + findingCard navigate + buildMetaTxt + ZIP 파일명 + 폴더명 패턴 + 사진 파일명 + toast 카피 8종 + 빈/오류 카피 + @keyframes blink (.6/.3) + spin
- 19-legal W5 + 28-splash W5 + 23-education W5 의 12-섹션 구조 mirror — 산출 파일 헤더 / OQ LOCKED 정리 / Tailwind 매핑 표 / 비즈 anchor 보존 verify / negative gate / positive gate / scope / build / 메모리 룰 cross-ref
- finding 상태 status 토큰 매핑 verify (OQ #2 LOCKED) — borderLeft 2px → `border-l-2 border-{safe|danger}-bar` / 칩 → `bg-{safe|danger}-bg text-{safe|danger}`, status- prefix 없음
- role admin 도구 분기 / sortedFindings / handleZipDownload iOS PWA 패턴 시그니처 무변 verify (memory `project_inspection_completion_rule` 일반화)
- 모바일 back button 36x36 → 44x44 (OQ #5 LOCKED 시) + Lucide ChevronLeft size={20} 교체 verify + lucide-react import 추가
- Spinner 함수 (인라인 div + @keyframes spin) → Lucide Loader2 size={24} className `animate-spin` 교체 verify (OQ #5 LOCKED 시) — Spinner 함수 line 32~39 폐기
- addButton (메인 CTA) §6.4 그라데이션 (OQ #4 LOCKED 시) verify — `linear-gradient(135deg, #1d4ed8, #0ea5e9)`
- 빈/오류 상태 아이콘 추가 (OQ #4 LOCKED 시) verify — Lucide `ClipboardList` (빈, 점검 의미) + `AlertCircle` (오류) 또는 무 유지

---

# §3. design-system.md v0.1.1 인용 (verbatim 발췌, fence 안)

design-system.md (`cha-bio-safety/docs/redesign-context/20-legal-findings/design-system.md`, v0.1.1) 의 §1.1 / §1.2 / §1.3 / §6.4 / §6.6 / §7 (Iconography) / §7.1 (Lucide) 본문을 각각 별도 fence 블록에 verbatim 박제. §6/§7 미적용 부분은 1줄 메타 동반. design-system.md 안 실제 §번호/제목이 다를 시 실제 파일 기준 §번호 맞춰 인용하고 1줄 메타에서 차이 명시. 19-legal wave-1-index.md 의 동일 영역과 동일 design-system.md 기반이므로 fence 내용 동일 — 본 wave 는 19-legal wave-1-index.md 의 §3 본문 그대로 복사 후 "적용 메타 (20-legal-findings)" 만 본 페이지 컨텍스트로 갱신.

## §3.1 design-system §1.1 노안 친화 (verbatim fence)

**적용 메타 (20-legal-findings)**: LegalFindingsPage 의 현재 fontSize 매핑 — **10 (finding 카드 수정/삭제 button line 263/265)** — §1.1 위반 (9·10·11 금지). **11 (finding 칩 line 255, 메타 line 259)** — §1.1 위반. 격상 후보 12 (OQ #3 검토). 12 / 13 / 14 / 16 / 22 (데스크톱 타이틀 22/800 마지노선 이상). **터치 마지노선 44px** — 모바일 back button **36x36 (line 303 absolute left 12)** = **§1.1 위반** (OQ #5 LOCKED 시 44x44 격상). addButton 모바일 h 48 = 룰 일치 (44 + 4 추가) / 데스크톱 h 36 = 데스크톱 도구 패턴 일치. adminBar button h 36 = 도구 패턴 (44px 직접 적용 대상 아님 — 데스크톱 도구 36 일관). finding 칩 + 수정/삭제 button = 배지/장식 패턴 (44px 룰 직접 적용 대상 아님).

## §3.2 design-system §1.2 정보 인지 > 미적 정제 (verbatim fence)

**적용 메타 (20-legal-findings)**: 정보 위계 — finding 카드 description 14/500 (var(--t1)) → 위치 12 (var(--t2)) → 메타 11 (var(--t3)) 3 단계 명확. finding 상태 칩 11/700 status 색 = 빠른 식별 (§1.4 상태 색 의미 룰 일치). borderLeft 2px = 카드 좌측 색바로 상태 즉시 인지. 칩 + borderLeft 동시 표시 = 정보 중복이지만 빠른 식별 우선. 장식 0건 (addButton 만 §6.4 후보).

## §3.3 design-system §1.3 모바일/데스크톱 동일 폰트 (verbatim fence)

**적용 메타 (20-legal-findings)**: 데스크톱 = **단일 컬럼 maxWidth 800 중앙 정렬** (19-legal LegalPage 의 3분할 마스터-디테일 과 다름 — 본 페이지는 자식 페이지 진입 위주, 데스크톱도 모바일과 유사한 단일 컬럼). "데스크톱이 빽빽한 건 레이아웃이 책임진다" 룰은 maxWidth 800 + padding 32 좌우 여백 책임. 모바일 = 단일 컬럼 + 고정 하단 CTA. 폰트 분기 — **데스크톱 타이틀 22/800 / 모바일 타이틀 16/700** (§1.3 동일 폰트 룰 위반 — 데스크톱이 큼, 단 마스터 타이틀은 예외 케이스). finding 카드 본문은 모바일/데스크톱 동일 폰트 (description 14, 위치 12, 메타 11) — 룰 일치. spacing 분기 — finding 카드 padding 16 (데스크톱) / 12 (모바일) + 콘텐츠 영역 padding '16px 32px' (데스크톱) / '12px 16px' (모바일) — §1.3 허용. addButton 모바일 h 48 / 데스크톱 h 36 — 모바일 터치 마지노선 일치, 데스크톱 도구 패턴 일관.

## §3.4 design-system §6.4 Backgrounds & Gradients (verbatim fence)

**적용 메타 (20-legal-findings)**: LegalFindingsPage 의 CTA 버튼 = addButton (line 272~291, 모바일 width 100% h 48 / 데스크톱 width auto h 36) + adminBar 안 결과 저장 button (line 225, h 36). 모두 현재 solid `var(--acl)` — §6.4 그라데이션 적용 후보. **default = addButton (메인 CTA) 그라데이션 + adminBar 결과 저장 button solid 유지 + 보고서/ZIP button 비-acl solid 유지** (OQ #4). 작은 도구 button (h 36) 까지 그라데이션 = 시각 잡음 — 메인 CTA 한정. 그라데이션 색은 §6.4 룰 (#1d4ed8, #0ea5e9) 우선. 19-legal / 23-education / 17-annual-plan / 16-workshift / 14-reports W1 OQ #1 그라데이션 default 일관. 단 28-splash W1 OQ #1 은 정반대 (solid 채택) — 사용자 컨펌으로 둘 중 LOCKED. 그 외 모든 배경 = surface 토큰 단색 일치 (그라데이션 0건 확인).

## §3.5 design-system §6.6 Animation (verbatim fence)

**적용 메타 (20-legal-findings)**: SKELETON_STYLE animation `blink 2s ease-in-out infinite` (line 28) = §6.6 "상태 dot (수신반 이력)" 룰 일치. 단 SKELETON_STYLE 객체는 정의되어 있으나 JSX 미사용 (Spinner 가 isLoading 처리). 인라인 @keyframes blink `0%,100%{opacity:.6} 50%{opacity:.3}` (line 295) — 19-legal 일치, **Education 의 opacity 1/0.4 와 다름 (현재 .6/.3 더 미세)**. 변경 금지. Spinner `spin .7s linear infinite` (line 35~36) — §6.6 의 "일반 트랜지션" 범주, 0.7s 는 §6.6 표 미정의 (loading spinner 는 일반 트랜지션과 별개) — 현 상태 보존. 화려한 모션 0건. 모달/시트 진입 트랜지션은 FindingFormSheet (본 wave 미수정) 가 자체 처리.

## §3.6 design-system §7 Iconography 미적용 메타 + §7.1 Lucide (verbatim fence)

**적용 메타 (20-legal-findings)**: LegalFindingsPage 본문에 **이모지 0건** — 19-legal LegalPage 의 '📷' 첨부 button 이모지는 FindingDetailPanel 안에 있고 본 페이지에는 없음 (조치는 자식 페이지 LegalFindingDetailPage 가 담당). 모바일 back button 인라인 SVG ChevronLeft (line 304, polyline path `M15 19l-7-7 7-7` — 19-legal 과 동일 path 포맷) **size 20** → Lucide `ChevronLeft size={20} color="currentColor"` 교체 후보 (16-workshift / 17-annual-plan / 28-splash / 23-education / 19-legal W1 OQ 일관 LOCKED). Spinner 인라인 div + @keyframes spin (line 32~39) — Lucide `Loader2` (animate-spin) 교체 후보. **§7.2 카테고리 → Lucide 매핑** = LegalFindingsPage 는 점검 카테고리 카드 시스템 아님 (finding 카드 = 지적사항 단위) → **미적용 1줄 메타**. **§6.1 Progress Color Rule** / **§6.2 Stat Card Number Color** / **§6.3 카테고리 카드** = LegalFindingsPage 에 진척률 도넛/통계 카드/카테고리 카드 모두 없음 → **미적용 1줄 메타** (memory `feedback_tsx_wave_stat_card_drift` 룰 일치). **§7.3 상태/결과 아이콘** = finding 상태 칩 (미조치/완료) 가 색만 사용 (아이콘 없음) — 상태별 아이콘 추가 옵션 (open `AlertCircle` 또는 `Circle` / resolved `CheckCircle`) — OQ #4 default 아이콘 무 유지 (현 디자인 보존).

---

# §4. 02+06 chrome 통일 룰 적용 여부

`inspection-modal-chrome-rules.md` (`cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md`) 를 읽고 20-legal-findings 의 chrome 적용 여부 정리.

**20-legal-findings 페이지는 19-legal LegalPage 의 sub-route (`/legal/:id`) → 점검 시리즈 직접 적용 케이스.** 02 InspectionPage 와 동일한 점검 도메인. **단 19-legal LegalPage 와 결정적 차이**: App.tsx line 117 정규식 `^\/legal\/.+` 매칭 → 모바일/데스크톱 모두 **showNav=false** → BottomNav + 사이드바 + 글로벌 AppHeader 모두 숨김. 자체 헤더 (모바일) + 데스크톱 타이틀 영역이 chrome 의 유일한 외곽.

inspection-modal-chrome-rules.md 의 각 룰을 1줄씩 적용/미적용 판정 + 적용 룰은 verbatim 인용.

executor 는 inspection-modal-chrome-rules.md 를 끝까지 한번 Read 한 후 다음 항목별로 1줄 메타 작성 (각 룰 §번호는 실제 파일 기준):

1. **§1 모달 chrome 룰** — 본 wave 의 모달 후보: FindingFormSheet (등록 mode 'create' line 359~365 + 수정 mode 'edit' line 368~375). 자체 fixed/inset 0 오버레이, 본 wave 미수정 — 적용 판정은 FindingFormSheet 별도 wave 에서. **본 W2~W5 범위 = 모바일 자체 헤더 + 데스크톱 타이틀 + 콘텐츠 + 모바일 고정 하단 CTA + adminBar = 모달 chrome 룰 직접 적용 0건**. PhotoSourceModal 도 FindingFormSheet 내부에서만 사용 (본 페이지 직접 import X) — 범위 아님.

2. **§2 모바일 헤더 chrome** — 모바일 자체 헤더 (line 298~308): h 48 + bg `rgba(22,27,34,0.97)` + headerTitle 정중앙 + position absolute back button 36x36. **chrome 룰 §2.1 'bg-surface-page'** vs 현재 raised 변형 alpha — OQ #1 default raised 유지 (19-legal + 16-workshift + 17-annual-plan + 02 + 28-splash + 23-education 일관). 단 alpha 0.97 보존 검토. **chrome 룰 §2 헤더 h 48** = 현재 일치. **headerTitle 동적 분기** (round 있음/없음 + 종합정밀/작동기능 분기) = sketch 시 frame 매트릭스 (4종) 필요.

3. **§3 BottomNav 룰** — App.tsx 실측 (**결정적 차이**):
   - **모바일**: `/legal/:id` ∈ `MOBILE_NO_NAV_PATHS` 직접 등재 아님 (line 71 `/legal` 본 페이지만 등재) **단 line 117 정규식 `^\/legal\/.+` 매칭 → showNav=false** → 모바일 BottomNav **숨김**. 자체 헤더만 단독.
   - **데스크톱**: `/legal/:id` ∉ `DESKTOP_NO_NAV_PATHS` (line 74) **단 line 117 정규식 매칭 → showNav=false** → 데스크톱 사이드바 BottomNav **숨김**.
   - **데스크톱 글로벌 AppHeader**: `/legal/:id` ∉ `DESKTOP_HEADER_HIDE_PATHS` (line 77) **단 line 117 정규식 매칭 → showNav=false** → 글로벌 AppHeader **숨김** (showNav=false 의 line 227 조건문 `{isDesktop && showNav && !DESKTOP_HEADER_HIDE_PATHS.includes(...)}` 첫 조건에서 차단).
   - `PAGE_TITLES` (App.tsx line 79~104) `/legal/:id` **미등재** → `pageTitle = PAGE_TITLES[location.pathname] || ''` 빈 문자열. 단 글로벌 AppHeader 자체가 숨김이라 pageTitle 영향 없음.
   - → **모바일 = 자체 헤더만 단독 표시 / 데스크톱 = 자체 타이틀 영역만 단독 표시.** 19-legal LegalPage + 23-education + 17-annual-plan 와 완전히 다른 패턴 (저 페이지들은 데스크톱 글로벌 AppHeader + 사이드바 모두 표시). **본 페이지는 chrome 외곽 0건** — sketch 시 데스크톱 시안에 글로벌 AppHeader 영역 + 좌측 사이드바 영역 그리지 않음.

4. **§4 데스크톱 헤더 chrome** — LegalFindingsPage 데스크톱은 자체 타이틀 영역 (padding '24px 32px 12px') 만 표시 — 글로벌 AppHeader 도 숨김. chrome 룰 §4 직접 적용 0건 (자체 타이틀 영역만).

5. **§5 카드 / 리스트 chrome** — finding 카드 (padding `isDesktop ? 16 : 12` borderRadius 12). chrome 룰 §5 의 카드 spacing 룰 적용 여부 — 실제 파일 §5 본문 확인 후 적용/미적용 판정.

6. **§6 색 / status chrome** — finding 상태 2분기 (open/resolved) borderLeft 2px + 칩. chrome 룰 §6 의 status 색 사용 룰 적용 — design-system §1.4 상태 색 의미 + tokens.css `--status-safe/danger` 일치. OQ #2 토큰 치환 default OK.

7. **§7 back button 패턴** — 모바일 자체 헤더 back button **36x36 position absolute left 12** + inline SVG (line 303~305). chrome 룰 §7.2 의 `w-8 h-8 bg-surface-sunken` 패턴과 다른 케이스 (현재 36x36 = `w-9 h-9` (36px tailwind 기본) 또는 `w-[36px] h-[36px]` arbitrary). **§1.1 터치 마지노선 44px 미달** — OQ #5 LOCKED 시 44x44 격상 + Lucide ChevronLeft 교체 동시 적용. memory `feedback_tailwind_w8_h8_is_48px` 함정 회피 — `w-8` 사용 시 48px 사고.

**실측 결과 (App.tsx 본문 grep, drift 없음):**

```
line 36: const LegalFindingsPage = lazy(() => import('./pages/LegalFindingsPage'))
line 71: MOBILE_NO_NAV_PATHS = ['/', '/login', '/schedule', '/reports', '/workshift', '/leave', '/floorplan', '/div', '/qr-print', '/daily-report', '/worklog', '/meal', '/education', '/legal', '/elevator/findings', '/annual-plan']  // /legal/:id 명시 미등재 (정규식 line 117 cover)
line 74: DESKTOP_NO_NAV_PATHS = ['/', '/login']                                  // /legal/:id 미등재 (정규식 line 117 cover)
line 77: DESKTOP_HEADER_HIDE_PATHS = ['/elevator', '/div', '/floorplan', '/workshift']  // /legal/:id 미등재 (정규식 line 117 cover)
line 79~104: PAGE_TITLES Record — '/legal/:id' 미등재 (line 98 '/legal' 만)     // showNav=false 라 영향 없음
line 117: !location.pathname.match(/^\/legal\/.+/)                              // /legal/:id 매칭 → showNav=false (모바일/데스크톱 모두 chrome 외곽 숨김)
line 289: <Route path="/legal" element={<Auth><LegalPage /></Auth>} />          // 부모 페이지 — 본 wave 범위 아님
line 290: <Route path="/legal/:id" element={<Auth><LegalFindingsPage /></Auth>} />
line 291: <Route path="/legal/:id/finding/:fid" element={<Auth><LegalFindingDetailPage /></Auth>} />  // 자식 페이지 — 본 wave 범위 아님
```

**핵심 시사점:**
- 모바일: 자체 헤더만 (line 298~308, h 48 + back button 36x36 + headerTitle), BottomNav 숨김 (정규식 cover). **36x36 back button 은 §1.1 터치 44px 미달 — OQ #5 LOCKED 시 44x44 격상**.
- 데스크톱: **chrome 외곽 0건** (자체 타이틀 영역만, 글로벌 AppHeader + 사이드바 모두 정규식으로 숨김) → sketch 시 데스크톱 시안에 글로벌 chrome 그리지 않음. 19-legal LegalPage / 23-education / 17-annual-plan 와 완전히 다른 패턴.
- **본 wave + W2~W5 모두 LegalFindingsPage.tsx 본 페이지만 다룸 — 부모 `/legal` (LegalPage) + 자식 `/legal/:id/finding/:fid` (LegalFindingDetailPage) 는 별도 wave.**
- **19-legal LegalPage 와 차이**: (1) 글로벌 chrome 0건 vs 19-legal 데스크톱 AppHeader+사이드바 표시, (2) 단일 export vs 19-legal 3개 내부 컴포넌트, (3) finding borderLeft 2px vs 19-legal 3px, (4) ZIP 파일명 round.title 기반 vs 19-legal location 기반, (5) findingCard 클릭 시 자식 페이지 진입 vs 19-legal 데스크톱 setSelectedFindingId.

본 wave + W2~W5 모두 `App.tsx` 손대지 않음 (§6 negative rule).

---

# §5. 메모리 룰 inline 인용 (verbatim)

본 인덱스에서 후속 wave 작업자가 따라야 할 메모리 룰 12건. 19-legal W1 + 23-education W1 + 28-splash W1 + 17-annual-plan W1 + 16-workshift W1 + 27-login W1 의 10건 + LegalFindingsPage 특화 2건 (`feedback_inspection_unresolved_color` finding 상태 칩 status 토큰 일반화 + `project_inspection_completion_rule` role admin 권한 도구 분기 + sortedFindings open-first source of truth 일반화). 각 룰은 슬러그 + 요약 + Why + How (20-legal-findings 컨텍스트) 4 항목, 미니 카드 박스.

### 룰 1 — feedback_design_sketch_first
- 요약: spacing/sizing 도 sketch HTML 시안 먼저 보여주고 승인 받은 후 인라인 적용.
- Why: 변경 후 결과를 두 번 보여주는 것보다 sketch 1회 컨펌이 효율적. 디자인 작업의 핵심 룰.
- How to apply (20-legal-findings): W3 finding 카드 크기 (현재 padding 16/12 borderRadius 12 borderLeft 2px) / W4 adminBar button h 36 + select padding '6px 12px' + addButton 모바일 h 48 / 데스크톱 h 36 / 모바일 고정 하단 CTA 영역 + paddingBottom 'calc(72px + var(--sab, 0px))' 조정도 spacing 손볼 거 있으면 sketch 먼저. 특히 데스크톱 maxWidth 800 은 운영 룰 (단일 컬럼 중앙 정렬 — 19-legal LegalPage 의 3분할과 다른 의도된 패턴) — "맥스 1200 으로 좀 늘려" 인라인 변경 직행 금지.

### 룰 2 — feedback_redesign_sketch_rule_enforcement
- 요약: §6.2 negative rule (위험 임계치 아닌 카드 status 색 금지) / §6.3 §7.1 일관성, executor + verify gate + 자체 검수 4중 강화.
- Why: status 색 (fire/danger/warning) 은 의미 fix — 진척률/위험 임계치 외에 미적 색으로 사용하면 정보 위계 무너짐.
- How to apply (20-legal-findings): finding 카드 borderLeft 2px (open danger / resolved safe) + 칩 (open '미조치' danger / resolved '완료' safe) 는 §6.2 negative rule 의 예외가 아니라 §1.4 상태 색 의미 룰의 정상 적용 케이스 (룰 11 — finding 상태 = status 토큰 일반화 룰). adminBar 결과 저장 button bg var(--acl) = accent 색 (활성 강조) — status 임계치 아님. `border-l-status-safe-bar` 같은 위험 색 사용 금지.

### 룰 3 — feedback_sketch_realistic_data
- 요약: 표시 분기/라벨 룰은 코드 그대로, 시각 디자인만 손봄.
- Why: sketch 작성 시 '지적사항 목록' 같은 타이틀이나 칩 라벨 '미조치/완료' 를 임의 변경하면 코드 변경 wave 가 deviation 으로 잡힘.
- How to apply (20-legal-findings): 카피 verbatim — '지적사항 목록' (헤더 fallback, line 122), '종합정밀/작동기능 ${YYYY.MM.}' (headerTitle 동적 분기 verbatim), '미조치' / '완료' (finding 상태 칩), '지적사항 없음' (빈 제목), '현장에서 지적된 항목을 등록하려면 ${isDesktop ? '상단' : '아래'} 버튼을 누르세요.' (빈 보조 + isDesktop 분기 보존), '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.' (오류 단일 문장), '결과 미입력' / '적합' / '부적합' / '조건부적합' (admin select), '결과 저장' (admin 저장), '보고서 보기' / '보고서 업로드' / '업로드 중...' (admin 보고서 분기), '일괄 다운로드' / '준비 중...' / '수집 중... (N/M)' / '압축 중...' (admin ZIP 단계별), '+ 지적사항 등록' (addButton), '수정' / '삭제' (finding 액션), '위치 미지정' (위치 fallback), 메타 verbatim (' · ' dot + fmtDate + createdByName). toast 카피 8종. 시안에서 변경 금지.

### 룰 4 — feedback_planner_prompt_sketch_verbatim
- 요약: TSX 변환 wave 진입 시 sketch CSS 정의를 grep 으로 추출해 그대로 인용. 추측한 토큰명/사이즈는 deviation 유발 (03-qr-scan 6건 사례).
- Why: planner 가 sketch 의 토큰명 (예: `bg-surface-raised`) 을 정확히 알지 못한 상태로 추측하면 executor 가 wave 의 의도와 다른 class 를 적용.
- How to apply (20-legal-findings): W5 TSX 변환 wave 진입 직전 `sketch-wave-2~4.html` 의 모든 Tailwind class / CSS 토큰을 grep 으로 추출 → `wave-5-tsx-conversion-checklist.md` 안에 verbatim 인용. 특히 finding 상태 rgba 정확히 — `rgba(239,68,68,.15)` (open) / `rgba(34,197,94,.13)` (resolved), 모바일 헤더 bg `rgba(22,27,34,0.97)`, 모바일 헤더 h 48 + back button 36x36 (또는 44x44 OQ #5), 데스크톱 타이틀 padding '24px 32px 12px' + headerTitle 22/800, finding 카드 데스크톱 padding 16 / 모바일 padding 12 + borderRadius 12 + borderLeft 2px solid (status 분기), adminBar 외곽 padding '8px 24px' / '8px 16px' + flex gap 8 + flexWrap wrap, adminBar button h 36 padding '0 12px' borderRadius 8, adminBar select padding '6px 12px' borderRadius 8, addButton 모바일 h 48 borderRadius 12 / 데스크톱 h 36 borderRadius 8, 모바일 고정 하단 CTA padding '12px 16px' paddingBottom 'calc(12px + var(--sab, 0px))' zIndex 20, 콘텐츠 영역 paddingBottom 'calc(72px + var(--sab, 0px))' (모바일) / 24 (데스크톱) maxWidth 800 (데스크톱), SKELETON_STYLE height 88 (미사용), Spinner 28x28 border 2px, animation `blink 2s ease-in-out infinite` + `spin .7s linear infinite`, @keyframes blink `0%,100%{opacity:.6} 50%{opacity:.3}` (19-legal 일치, Education .4 와 다름), @keyframes spin `to{transform:rotate(360deg)}`, ZIP 파일명 패턴 `지적사항_${round?.title ?? 'report'}.zip`, 폴더명 패턴 `finding-${idx zero-padded 3}_${location 안전화}`, 사진 파일명 패턴. 추측 토큰명 사용 시 deviation 유발.

### 룰 5 — feedback_tailwind_token_class_pattern
- 요약: `text-fire-bar` O / `text-status-fire-bar` X (status- prefix 없음) + lucide `<Icon size={N} />` prop (`w-N h-N` className 금지).
- Why: 11-div TSX v3 hotfix(4ce707e) 사고 — `status-` prefix 가 tailwind.config 에 없어서 class 안 먹음. `bg-safe-bar` 가 올바른 패턴.
- How to apply (20-legal-findings): finding borderLeft → `border-l-2 border-{safe|danger}-bar` (open/resolved) — **borderLeft 2px** 보존 (border-l-2 tailwind 기본 또는 border-l-[2px] arbitrary). finding 상태 칩 → `bg-{danger|safe}-bg text-{danger|safe}`. `bg-status-safe-bg` 사용 시 W5 verify FAIL. addButton → `bg-accent` solid 또는 §6.4 그라데이션 (OQ #4) — 토큰 prefix 동일 룰 적용. adminBar 결과 저장 button → `bg-accent` solid 유지 (작은 도구). 모바일 back button → Lucide `ChevronLeft size={20}` prop (OQ #5) — className 으로 `w-5 h-5` 금지. Spinner → Lucide `Loader2 size={24} className="animate-spin"` (OQ #5).

### 룰 6 — feedback_tailwind_w8_h8_is_48px
- 요약: tailwind.config spacing override — `w-8 = 48px` (기본 32 아님), `w-7 = 32px`.
- Why: 11-div 백버튼 1.5배 사고(54a1c8d) — `w-8 h-8` 로 32px 의도했는데 실제 48px 적용.
- How to apply (20-legal-findings):
  - 모바일 back button 36x36 (line 303) → `w-9 h-9` (36px tailwind 기본 spacing 9) 또는 `w-[36px] h-[36px]` arbitrary. **§1.1 터치 44px 미달 — OQ #5 LOCKED 시 44x44 격상 = `w-11 h-11` 또는 `w-[44px] h-[44px]`**.
  - addButton 모바일 h 48 (line 277) = `h-12` (48px tailwind 기본 spacing 12) — 또는 `h-[48px]` arbitrary.
  - addButton 데스크톱 h 36 (line 277) = `h-9` (36px tailwind 기본).
  - adminBar button h 36 (line 225, 228, 230, 232) = `h-9` (36px tailwind 기본).
  - Spinner 28x28 (line 35) = `w-7 h-7` (28px tailwind 기본) 또는 `w-[28px] h-[28px]` arbitrary.
  - SKELETON_STYLE height 88 (line 28, 미사용) = `h-[88px]` arbitrary 필수 (tailwind `h-22` 없음).
  - 데스크톱 maxWidth 800 (line 336) = `max-w-[800px]` arbitrary 필수 (tailwind `max-w-200` 없음 — tailwind 기본 max-w-3xl 768px / max-w-4xl 896px 와 차이).
  - 인라인 padding 8/12/16/24/32 등은 `p-2` (8px) / `p-3` (12px) / `p-4` (16px) / `p-6` (24px) / `p-8` (32px). tailwind.config spacing override 실측 확인 후 적용.

### 룰 7 — feedback_text_caption_leading_none
- 요약: `text-caption` lh:1.5 (18px) 가 h-8(32px) 컨테이너 안에서도 시각적 패딩. 헤더 토글/배지/칩 작은 영역은 `leading-none` 명시.
- Why: 작은 컨테이너 안 text-caption 이 line-height 1.5 때문에 의도보다 위/아래 시각 패딩 발생.
- How to apply (20-legal-findings):
  - finding 상태 칩 fontSize 11 (padding `2px 8px`, h ≈ 18~22px) → `text-caption font-bold leading-none` (작은 컨테이너 시각 패딩 방지) — 11 → 12 격상 후 (OQ #3) leading-none
  - finding 메타 fontSize 11 (메타 텍스트) → `text-caption leading-none` (격상 후)
  - finding 수정/삭제 button fontSize 10 (padding `2px 4px`) → `text-caption leading-none` (10 → 12 격상 후)
  - adminBar button fontSize 12 (h 36) → `text-caption font-bold leading-none` (마지노선 = 격상 불요)
  - 빈 보조 fontSize 12 → `text-caption leading-none`
  - 메타 모든 10~12 fontSize → leading-none 필수 (작은 컨테이너 패턴)

### 룰 8 — feedback_tsx_wave_emoji_dot_gap
- 요약: alias sed-replace 만 X. sketch negative gate (이모지 0) + dot span 추가 markup 도 verify.
- Why: sketch 의 `🎯` `⬇` 같은 이모지/특수문자 글리프가 TSX 변환에서 빠지지 않고 그대로 남는 사고. dot span (`<span>·</span>`) 추가 markup 도 자동 적용 안 됨.
- How to apply (20-legal-findings): **LegalFindingsPage 본문에 이모지 0건** — 19-legal LegalPage 의 '📷' 첨부 button 이모지는 FindingDetailPanel 안 (본 페이지 아님). 인라인 SVG ChevronLeft (모바일 back button) 는 Lucide `ChevronLeft size={20}` 교체 (OQ #5). Spinner div + @keyframes spin 도 Lucide `Loader2` (animate-spin) 교체. **메타 dot ' · ' (line 259)** = string literal dot, sketch 에 `<span>·</span>` 추가 markup 도입 시 W5 변환에 자동 적용 안 됨 — 메타 dot 은 string literal 그대로 보존 (변경 없음). 빈/오류 상태 아이콘 추가 (OQ #4 Lucide `ClipboardList`/`AlertCircle`) 시 점검 페이지 dot span 룰과 별개.

### 룰 9 — feedback_tsx_wave_stat_card_drift
- 요약: executor 가 source outline 패턴 보존, sketch 새 패턴 누락 가능. plan 에 verbatim 인용 + verify gate 권장.
- Why: source 의 fontSize/색 패턴이 sketch 의 새 룰 (`bg-surface-raised border-l-[3px] border-accent`) 을 덮어쓰는 사고.
- How to apply (20-legal-findings): LegalFindingsPage 에 Stat Card (28px display 숫자) 없음 → §6.2 Stat Card Number Color 룰 미적용. **§6.3 카테고리 카드 룰 미적용** (LegalFindingsPage 는 점검 카테고리 카드 시스템 아님 — finding 카드 = 지적사항 단위). 단 sketch 새 패턴 (예: finding 상태 2분기 매트릭스 / adminBar admin/assistant 분기 매트릭스 / addButton 모바일/데스크톱 분기 매트릭스 / 빈/로딩/오류 매트릭스 / zipLoading 5단계 매트릭스 / 보고서 button reportFileKey 있음/없음 매트릭스 / headerTitle 동적 분기 4종 매트릭스) 은 W5 진입 시 verbatim 인용 필수. source LegalFindingsPage.tsx 의 인라인 rgba (`rgba(239,68,68,.15)` / `rgba(34,197,94,.13)` / `rgba(22,27,34,0.97)`) 가 sketch 의 새 토큰 패턴 (`bg-danger-bg text-danger`) 을 덮어쓰지 않도록 명시 필수. finding 칩 alpha 0.13/0.15 vs tokens.css safe-bg 0.16 미세 차이 — W5 LOCKED 시 시각 비교. **borderLeft 2px (19-legal 3px 와 다름)** 보존 명시 필수.

### 룰 10 — feedback_avoid_premature_confirmation
- 요약: "거의 일치" 자신감 표현 금지. 결과 보여주고 사용자 판단.
- Why: 시각 작업은 사용자 인지에 의존 — Claude 의 "approved" 자체 판단은 무의미.
- How to apply (20-legal-findings): 본 인덱스 작성 완료 후 "§7 OQ 5건 컨펌 부탁" 보고만. "wave 1 완벽 / W2 진입 가능" 같은 자신감 표현 금지. W2~W5 진입 시점도 사용자 컨펌 명시 받은 후에만. sketch 산출 후 "거의 일치 / 잘 됐다" 표현 금지. 특히 finding 색 시각 결과 (open 빨강 / resolved 녹색) + 사진 슬롯 매트릭스 + admin 도구 분기 시각 결과 + 모바일 고정 하단 CTA 영역 시각 결과는 사용자 판단 영역.

### 룰 11 — feedback_inspection_unresolved_color (★ 20-legal-findings 특화 — finding 상태 칩 + borderLeft status 토큰 일반화)
- 요약: 미조치 색 = status-fire (주황). 메인 칩 fire / 상세 danger inconsistent. 사용자 인지 = 칩의 fire 색.
- Why: 점검 페이지에서 미조치 칩이 fire (주황) 으로 표시되어 사용자가 "위험 임계치 = 칩 색" 패턴 학습. 20-legal-findings 의 finding 상태 칩 + borderLeft 동일 패턴 — finding 2분기 (open/resolved) 색이 사용자 인지의 source of truth.
- How to apply (20-legal-findings): **finding 상태 칩 + borderLeft 2분기 (open danger '미조치' / resolved safe '완료')** — 운영 의미 source of truth. 미조치 점검 fire 칩과 다른 색상 (LegalFindingsPage = danger 빨강) 이지만 "결과 = status 토큰" 룰 일반화. status- prefix 없음 룰과 같이 적용 → `border-l-2 border-{safe|danger}-bar` / `bg-{safe|danger}-bg text-{safe|danger}`. **2분기 + 2 라벨 1 byte 변경 금지** (OQ #2 LOCKED 후 W3 sketch + W4 sketch + TSX 변환 양쪽 동일 적용). 19-legal LegalPage 의 accentColor + ResultBadge 4분기 룰과 동일 패턴 (본 페이지는 2분기만, finding 단위). 28-splash + 17-annual-plan 의 비즈 anchor 1 byte 0 룰 일반화. **borderLeft 2px (19-legal LegalPage 3px 과 다름) — 본 페이지 2px 보존 필수**.

### 룰 12 — project_inspection_completion_rule (★ 20-legal-findings 특화 — role admin 도구 분기 + sortedFindings open-first source of truth 일반화)
- 요약: 점검 완료 = normal | caution | (bad+resolved). isCpCompleted 가 source of truth. 새 화면/통계는 이 룰 강제.
- Why: 점검 완료 정의가 페이지별로 일관되지 않으면 사용자 인지/통계 모두 깨짐. isCpCompleted 헬퍼 = source of truth 룰의 일반화.
- How to apply (20-legal-findings): **(1) adminBar 조건부 렌더 (line 208 `role === 'admin' && round`)** — admin 만 결과 select/저장/보고서 업로드/ZIP 일괄 다운로드 가능. assistant 는 adminBar 미렌더 (finding 등록/수정/삭제는 모든 사용자). UI/시안에서 권한 분기 변경 금지. (2) **sortedFindings open-first (line 198~203)** — status 'open' 먼저, 그 외 createdAt desc localeCompare. 운영 룰 source of truth — UI/시안에서 정렬 변경 금지. (3) **findingCard onClick navigate(`/legal/${id}/finding/${finding.id}`)** — 모든 사용자 자식 페이지 진입 가능 (line 240). 본 wave 범위는 LegalFindingsPage.tsx 만 (자식 페이지 별도 wave). (4) **handleZipDownload iOS PWA `<a download>` 패턴 + setTimeout(URL.revokeObjectURL, 3000)** — iOS 안정성 검증된 패턴, 1 byte 변경 금지. (5) **headerTitle 동적 분기 (line 120~122)** — round 있으면 '${종합정밀|작동기능} ${YYYY.MM.}' / 없으면 '지적사항 목록'. round.title.includes('종합정밀') 조건 보존 필수 — UI/시안에서 분기 변경 금지. 모두 점검 완료 isCpCompleted 룰의 일반화. W3 sketch + W4 sketch + W5 TSX 변환 양쪽 동일 적용.

---

# §6. negative rule (이 wave 에서 금지된 것)

본 wave (sketch wave 1 = 인덱스 작성) 에서 절대 하지 않는 것:

- **sketch HTML 생성 금지** — sketch 는 W2 부터. 본 wave 산출물은 markdown 1개 (`wave-1-index.md`) 만.
- **LegalFindingsPage.tsx 코드 수정 금지** — `cha-bio-safety/src/pages/LegalFindingsPage.tsx` 는 분석 대상이지 수정 대상이 아님. `git diff --name-only HEAD -- cha-bio-safety/src/pages/LegalFindingsPage.tsx` 결과 0 줄.
- **외부 컴포넌트/훅 수정 금지** — PhotoGrid.tsx / PhotoSourceModal.tsx / FindingFormSheet.tsx / useMultiPhotoUpload.ts / utils/findingDownload.ts / utils/api.ts (legalApi) / stores/authStore.ts / hooks/useIsDesktop.ts 모두 본 wave + W2~W5 미수정. 시그니처 + props 보존.
- **비즈 로직 시그니처 변경 금지** — useQuery 2종 (`['legal-round', id]` / `['legal-findings', id]`) / legalApi 4종 (get / getFindings / updateResult / deleteFinding) / headerTitle 동적 분기 (round.title.includes('종합정밀') ? '종합정밀' : '작동기능') / sortedFindings open-first / handleSaveResult + handleReportUpload + handleDeleteFinding + handleZipDownload + adminBar role 조건부 / findingCard onClick navigate / addButton 모바일/데스크톱 분기 / FindingFormSheet props (scheduleItemId/mode/finding?/onClose) / fmtDate + fmtMonthOnly / SKELETON_STYLE + Spinner / @keyframes blink (.6/.3) + spin / 인라인 SVG ChevronLeft (또는 Lucide 교체 OQ #5) 모두 import/export 동일하게 유지.
- **다른 페이지 (13-schedule / 14-reports / 27-login / 16-workshift / 15-daily-report / 17-annual-plan / 28-splash / 23-education / 19-legal / 02 / 06 등) 영향 금지** — `git status` 에 20-legal-findings/ + .planning/quick/260523-rgj-* 외 변경 0.
- **wrangler 명령 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler` (디자인 wave 중 `wrangler --project-name=cbc7119` 절대 X). `.claude/settings.local.json` deny 강제. 본 워크트리 (cbc7119-design) 는 `cbc7119-preview.pages.dev` 만 다룸.
- **`npm run deploy` 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler`. `npm run deploy` 는 직원 도메인 (`cbc7119.pages.dev`) 경로. 본 워크트리에서 절대 금지. main push → GitHub Actions 자동 cbc7119-preview 배포만.
- **13-schedule + 14-reports + 27-login + 16-workshift + 17-annual-plan + 28-splash + 23-education + 19-legal 의 평면 sketch-wave-*.html 패턴과 다른 폴더 구조 도입 금지** — 8 페이지 모두 평면(flat sibling). `sketch/` 서브폴더 만들지 않음. 20-legal-findings 도 동일 평면 배치 (`20-legal-findings/sketch-wave-N-{slug}.html`).
- **App.tsx 수정 금지** — `MOBILE_NO_NAV_PATHS` (line 71, `/legal/:id` 미등재 — 정규식 line 117 cover) + `DESKTOP_NO_NAV_PATHS` (line 74) + `DESKTOP_HEADER_HIDE_PATHS` (line 77) + `PAGE_TITLES` (line 79~104, `/legal/:id` 미등재) + 특수 regex (line 117 `!location.pathname.match(/^\\/legal\\/.+/)` — showNav=false) + `Route` (line 290) 모두 실측 확인됨. 본 wave + W2~W5 모두 `App.tsx` 손대지 않음.
- **부모 페이지 (LegalPage @ App.tsx line 289) + 자식 페이지 (LegalFindingDetailPage @ App.tsx line 291) 수정 금지** — 본 wave + W2~W5 범위 아님. findingCard 클릭 → navigate(`/legal/${id}/finding/${finding.id}`) 시 자식 페이지 진입은 별도 wave.
- **★ finding 상태 2분기 시그니처 변경 금지** — open → borderLeft 2px var(--danger) + 칩 bg rgba(239,68,68,.15) + var(--danger) + '미조치' (line 244, 255) / resolved → borderLeft 2px var(--safe) + 칩 bg rgba(34,197,94,.13) + var(--safe) + '완료'. 1 byte 변경 금지. **borderLeft 2px (19-legal LegalPage 3px 과 다름) 보존 필수**.
- **★ sortedFindings open-first 변경 금지** — line 198~203. status 'open' 먼저, 그 외 createdAt desc localeCompare.
- **★ adminBar 조건부 렌더 변경 금지** — `role === 'admin' && round` (line 208). admin 만 결과 select+저장+보고서+ZIP 다운로드 / assistant adminBar 미렌더. 운영 룰 source of truth, 1 byte 변경 금지.
- **★ headerTitle 동적 분기 변경 금지** — round 있으면 `${round.title.includes('종합정밀') ? '종합정밀' : '작동기능'} ${fmtMonthOnly(round.date)}` / 없으면 '지적사항 목록' (line 120~122). 비즈 분기 source of truth.
- **★ findingCard onClick navigate 변경 금지** — navigate(`/legal/${id}/finding/${finding.id}`) (line 240). 모든 사용자 자식 페이지 진입.
- **★ legalApi 4종 시그니처 변경 금지** — get(roundId) / getFindings(roundId) / updateResult(roundId, { result?, report_file_key? }) / deleteFinding(roundId, findingId) 모두 보존. 특히 snake_case payload (`result`, `report_file_key`) + camelCase props (`roundId`, `findingId`) 혼용 패턴 보존. 본 wave + W2~W5 모두 utils/api.ts 손대지 않음.
- **★ handleZipDownload iOS PWA `<a download>` 패턴 변경 금지** — createElement('a') + body.appendChild + click + removeChild + setTimeout(URL.revokeObjectURL, 3000). iOS PWA 안정성 검증된 패턴. 본 wave + W2~W5 변경 금지.
- **★ ZIP 파일명 + 폴더명 + 사진 파일명 패턴 변경 금지** — `지적사항_${round?.title ?? 'report'}.zip` (line 184, 19-legal LegalPage 의 location 기반과 다름 — round.title 사용) / `finding-${idx zero-padded 3}_${(location ?? '위치없음').replace(/[\\/\\\\:*?"<>|]/g, '_')}` (폴더, line 149) / `지적사진-${j+1}.jpg` / `조치사진-${j+1}.jpg` (line 161, 171). 본 wave + W2~W5 utils/findingDownload.ts + 본 페이지 미수정.
- **★ handleReportUpload FormData 패턴 + Bearer token + dynamic authStore import 변경 금지** — folder `legal/${id}/report` + dynamic import('../stores/authStore').useAuthStore.getState().token + Authorization Bearer header.
- **toast 카피 verbatim 8종 변경 금지** — success 4 ('점검 결과가 저장되었습니다.' / '보고서가 업로드되었습니다.' / '삭제되었습니다' / '다운로드 완료') + error 4 ('저장에 실패했습니다.' / '사진 업로드 실패' / err?.message ?? '삭제 실패' / '다운로드에 실패했습니다').
- **빈/오류 상태 카피 verbatim 변경 금지** — '지적사항 없음' / '현장에서 지적된 항목을 등록하려면 ${isDesktop ? '상단' : '아래'} 버튼을 누르세요.' (isDesktop 분기 보존) / '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.' (단일 문장).
- **adminBar 카피 verbatim 변경 금지** — select 옵션 '결과 미입력' / '적합' / '부적합' / '조건부적합' + 저장 '결과 저장' + 보고서 '보고서 보기' / '보고서 업로드' / '업로드 중...' + ZIP '일괄 다운로드' / '준비 중...' / '수집 중... (N/M)' / '압축 중...' (zipLoading 5 단계).
- **finding 카피 verbatim 변경 금지** — 상태 칩 '미조치' / '완료' + 액션 '수정' / '삭제' + 위치 fallback '위치 미지정' + 메타 패턴 `${fmtDate(createdAt)} · ${createdByName ?? createdBy}` (' · ' dot 보존).
- **addButton 카피 '+ 지적사항 등록' (line 289) verbatim 변경 금지**.
- **데스크톱 maxWidth 800 변경 금지** — 의도된 디자인 (단일 컬럼 중앙 정렬 — 19-legal 의 3분할과 다른 의도된 패턴). "맥스 1200 으로 좀 늘려" 변경 금지.
- **모바일 고정 하단 CTA 패턴 보존** — position fixed bottom 0 left 0 right 0 padding '12px 16px' paddingBottom 'calc(12px + var(--sab, 0px))' zIndex 20 + addButton (모바일 width 100% h 48). 콘텐츠 영역 paddingBottom 'calc(72px + var(--sab, 0px))' 회피 패턴.
- **@keyframes blink `0%,100%{opacity:.6} 50%{opacity:.3}` (line 295) + @keyframes spin `to{transform:rotate(360deg)}` (line 36 Spinner 함수 내부) 보존** — Education 의 1/0.4 와 다름. 변경 시 SKELETON 깜빡임 + spinner 회전 깨짐.
- **모바일 헤더 자체 렌더 보존 (line 298~308)** — height 48 + back button 36x36 position absolute left 12 + headerTitle 정중앙 + bg `rgba(22,27,34,0.97)` (raised 변형 alpha). **OQ #5 LOCKED 시 back button 44x44 격상 + Lucide ChevronLeft 교체** — 그 외 변경 금지. 데스크톱은 자체 타이틀 영역 (padding '24px 32px 12px') 만, 글로벌 AppHeader 도 line 117 정규식으로 숨김.
- **FindingFormSheet props 보존** — scheduleItemId + mode 'create'|'edit' + finding? + onClose. 본 wave + W2~W5 미수정. props 호출 양식 (onClose setShowSheet(false) / setEditingFinding(null)) 보존.

---

# §7. open questions (W2 진입 직전 사용자 컨펌)

본 wave 산출 후 W2 sketch 진입 전 사용자에게 컨펌 받아야 할 항목 5건. 각 OQ 아래 "default 답" 1줄 — 사용자가 별 의견 없으면 이 답으로 진행 (reasonable call). 단, "approved" 받기 전까지 W2 진입 금지 (memory `feedback_avoid_premature_confirmation`).

- **OQ #1**: 모바일 자체 헤더 배경 `rgba(22,27,34,0.97)` (raised 변형 alpha, line 300) → chrome 룰 §2.1 `bg-surface-page` 통일 vs raised 유지 (alpha 0.97 vs full opacity)?
  - **default 답: raised 유지 + alpha 0.97 보존** (19-legal W1 OQ #1 LOCKED + 16-workshift + 17-annual-plan + 02 InspectionPage + 28-splash + 23-education 6 페이지 일관 패턴). 모바일 헤더 = `bg-surface-raised/97` arbitrary (또는 인라인 유지). 데스크톱 자체 타이틀 영역은 별도 배경 없음 (외곽 var(--bg) 그대로). 본 OQ 적용 시 W2 sketch + TSX 변환 양쪽 동일 적용.

- **OQ #2**: finding 상태 2분기 (open/resolved) 색 — 현재 rgba 인라인 + var() (`rgba(239,68,68,.15)` open / `rgba(34,197,94,.13)` resolved + var(--danger/safe)). status 토큰 매핑 (`border-l-2 border-{safe|danger}-bar` + `bg-{safe|danger}-bg` + `text-{safe|danger}`) 치환?
  - **default 답: 토큰 치환 OK** — status- prefix 없음 룰 (memory `feedback_tailwind_token_class_pattern`). 19-legal W1 OQ #2 + 23-education W1 OQ #2 + 17-annual-plan W1 OQ #2 + 28-splash W1 OQ #4 토큰 치환 default OK 일관. **finding 2분기 + 2 라벨 + borderLeft 2px (19-legal 3px 과 다름) 모두 1 byte 변경 금지** (룰 11 + §6 negative rule). W3 sketch + W4 sketch + TSX 변환 양쪽 동일 적용. 토큰 치환 후 시각 결과 비교 — 칩 alpha 0.13/0.15 vs tokens.css `--status-safe-bg: rgba(34, 197, 94, 0.16)` alpha 0.16 미세 차이 (0.03 차이) → 시각 차이 발생 가능 — 사용자 컨펌 후 인라인 유지 또는 토큰 alpha 조정.

- **OQ #3**: §1.1 fontSize 9·10·11 위반 격상 — LegalFindingsPage 의 10 (수정/삭제 button) + 11 (finding 칩 / 메타) 모두 §1.1 마지노선 위반. **모두 12 격상 vs 인라인 유지**?
  - **default 답: 격상 OK** (§1.1 노안 친화 룰 우선). 11 → text-caption(12) / 10 → text-caption(12). 격상 후 leading-none 명시 (memory `feedback_text_caption_leading_none`). 단 시각 균형 (배지/칩이 너무 커짐) 우려 시 사용자 컨펌으로 일부 인라인 유지 (예: finding 칩 11 유지 / 수정/삭제 button 만 11 → 12 격상). 격상 시 padding 조정 (칩 padding 2px 8px → 3px 10px) 동시 검토. 19-legal + 23-education + 16-workshift + 17-annual-plan W1 OQ 비슷한 패턴 (text-body-sm 14 → text-body 16 격상 default) 일관.

- **OQ #4**: 메인 CTA (addButton line 272~291, 모바일 width 100% h 48 / 데스크톱 width auto h 36) 현재 solid `var(--acl)` → design-system §6.4 그라데이션 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` 통일 vs solid 유지? **+ 빈/오류 상태 아이콘 추가** (Lucide `ClipboardList` 빈 / `AlertCircle` 오류) vs 무 유지? **+ SKELETON_STYLE 활용 (현재 미사용)** — isLoading 시 Spinner 대신 SKELETON 카드 3개 렌더 vs Spinner 유지?
  - **default 답 (CTA)**: **그라데이션 OK** (design-system §6.4 CTA 룰 + 19-legal / 14-reports / 16-workshift / 17-annual-plan / 23-education W1 OQ 그라데이션 default 일관). 그라데이션 색은 §6.4 룰 (#1d4ed8, #0ea5e9) 우선. 메인 CTA 한정 (addButton — 모바일/데스크톱 양쪽) — adminBar 작은 도구 button (저장/보고서/ZIP h 36) 은 **solid 유지** (작은 도구 그라데이션 = 시각 잡음). disabled 시 = `bg-surface-sunken text-text-tertiary cursor-not-allowed` (현재 opacity 0.6 + cursor not-allowed 일관). 사용자 컨펌 결과에 따라 그라데이션 vs solid 둘 중 LOCKED. 28-splash W1 OQ #1 LOCKED 는 정반대 (solid) — 20-legal-findings 는 §6.4 CTA 룰 우선.
  - **default 답 (아이콘)**: **아이콘 무 유지** (현재 카피만 — 19-legal + 17-annual-plan + 16-workshift + 28-splash + 23-education W1 빈/오류 상태 아이콘 무 일관). 단 시각 일관성 강화 옵션으로 빈 상태에 Lucide `ClipboardList size={48} color="var(--t3)"` (점검 의미) + 오류에 Lucide `AlertCircle size={48} color="var(--danger)"` 추가 가능 — **사용자 컨펌으로 채택 가능**.
  - **default 답 (SKELETON)**: **Spinner 유지** (현 디자인 보존 — SKELETON_STYLE 객체 정의는 있으나 JSX 미사용, 사실상 dead code). 단 isLoading 시각 일관성 강화 옵션으로 SKELETON 카드 3개 (height 88) 렌더 + Spinner 폐기 가능 — **사용자 컨펌으로 채택 가능** (23-education 패턴 mirror).

- **OQ #5**: 아이콘 Lucide 교체 + 모바일 back button 44x44 격상 — (1) 모바일 헤더 back button 인라인 SVG ChevronLeft (line 304, polyline path "M15 19l-7-7 7-7" strokeWidth 2 size 20) → Lucide `ChevronLeft size={20}` 교체? + back button **36x36 → 44x44 격상** (§1.1 터치 마지노선 44px 일치)? (2) Spinner 함수 (line 32~39, 인라인 div + @keyframes spin) → Lucide `Loader2 size={24} className="animate-spin"` 교체?
  - **default 답: (1) 교체 + 44x44 격상 OK** (§7.4 "뒤로가기: ChevronLeft" + §1.1 터치 44px + 19-legal / 16-workshift / 17-annual-plan / 28-splash / 23-education W1 OQ Lucide ChevronLeft 교체 LOCKED 일관). back button position absolute left 12 → left 8 또는 left 12 유지 (44 - 36 = 8px 추가 영역, 정중앙 타이틀 영향 없음). **(2) 교체 OK** (Lucide `Loader2` + `animate-spin` className — 인라인 div + @keyframes spin 폐기, Spinner 함수 line 32~39 폐기 + 인라인 keyframe 정의 폐기). size={24} 유지 (§7.1 16/20/24 3 종 중 24 일치). 모두 lucide-react import 추가. W2 모바일 chrome sketch + W2 빈/로딩/오류 sketch + W5 TSX 변환 양쪽 동일 적용. (주의: 19-legal LegalPage 의 첨부 button '📷' 이모지 → Lucide Camera 교체 OQ 는 본 페이지에 없음 — 본 페이지는 이모지 0건).

각 OQ 의 default 답은 사용자가 별 의견 없으면 이 답으로 진행할 것이라는 reasonable call. 단, "approved" 받기 전까지 W2 진입 금지.

---

## 자체 verify (작성 완료 후 본 인덱스가 통과해야 할 gate)

1. 7개 섹션 모두 존재 (§1~§7) — grep `^# §[1-7]` 카운트 = 7
2. 메모리 룰 12개 인용 — `feedback_*` (10개) + `feedback_inspection_unresolved_color` (11번째) + `project_inspection_completion_rule` (12번째) 가 본문에 등장 (unique `feedback_*` ≥ 10)
3. sub-wave 분배 표가 W2~W5 4행 — 표 안에 `| W[2-5] |` 카운트 ≥ 4 (정확히 4)
4. design-system 인용 fence 가 최소 5개 (§1.1 / §1.2 / §1.3 / §6.4 / §6.6 / §7.1 — 6개 권장) — fence 카운트 ≥ 12 (open+close)
5. negative rule 안 `wrangler` + `npm run deploy` 키워드 모두 등장 (≥1 each)
6. OQ 5건 — `OQ #` 카운트 ≥ 5
7. LegalFindingsPage.tsx 변경 0 — `git diff --name-only HEAD -- {파일}` 가 빈 출력
  </action>
  <verify>
    <automated>test -f cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md && \
echo "--- section count (expect 7) ---" && \
grep -c '^# §[1-7]' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md && \
echo "--- subwave rows W2~W5 (expect 4) ---" && \
grep -E '^\| W[2-5] \|' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md | wc -l && \
echo "--- memory rules unique (expect >=10) ---" && \
grep -oE 'feedback_[a-z_]+' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md | sort -u | wc -l && \
echo "--- OQ items #1~#5 (expect >=5) ---" && \
grep -cE 'OQ #[1-5]' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md && \
echo "--- fence count (expect >=12) ---" && \
grep -c '^```' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md && \
echo "--- wrangler keyword in negative rule (expect >=1) ---" && \
grep -c 'wrangler' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md && \
echo "--- npm run deploy keyword (expect >=1) ---" && \
grep -c 'npm run deploy' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md && \
echo "--- LegalFindingsPage.tsx unchanged (expect 0) ---" && \
git diff --name-only HEAD -- cha-bio-safety/src/pages/LegalFindingsPage.tsx | wc -l && \
echo "--- legalApi 4-method anchor (expect >=4) ---" && \
grep -cE 'legalApi\.(get|getFindings|updateResult|deleteFinding)' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md</automated>
  </verify>
  <done>
- `cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md` 파일 존재 (sketch/ 서브폴더 X — 20-legal-findings/ 직속)
- 7개 섹션 (§1~§7) 모두 존재, grep 결과 = 7
- §2 sub-wave 표가 W2~W5 4행 모두 포함 (정확히 4)
- §1 인벤토리에 3 영역 (상단 imports/포맷터/SKELETON/Spinner / 메인 페이지 LegalFindingsPage 함수 / JSX render) 모두 포함 + 비즈 시그니처 보존 박스 별도 포함 (legalApi 4종 + useQuery 2종 + headerTitle 동적 분기 + sortedFindings open-first + handleZipDownload iOS PWA 패턴 + adminBar role 조건부 + findingCard navigate + buildMetaTxt + ZIP 파일명 round.title 기반 + 폴더명 패턴 + 사진 파일명 + toast 8종 + 모든 카피 verbatim)
- 메모리 룰 12개 (`feedback_*` 10개 + `feedback_inspection_unresolved_color` + `project_inspection_completion_rule`) 모두 inline 인용, unique feedback_ count ≥ 10
- LegalFindingsPage 특화 룰 2건 (finding 상태 칩 + borderLeft status 토큰 매핑 + role admin 도구 분기 + sortedFindings open-first source of truth) 명시 포함
- design-system.md 인용 fence 최소 6개 (§1.1, §1.2, §1.3, §6.4, §6.6, §7.1) — fence 총 카운트 ≥ 12
- §4 에 line 36 lazy import + line 71 MOBILE_NO_NAV_PATHS (/legal/:id 명시 미등재 — 정규식 cover) + line 74 DESKTOP_NO_NAV_PATHS (정규식 cover) + line 77 DESKTOP_HEADER_HIDE_PATHS (정규식 cover) + line 79~104 PAGE_TITLES (/legal/:id 미등재) + line 117 특수 regex `^\\/legal\\/.+` (showNav=false 핵심) + line 290 Route + 부모 line 289 + 자식 line 291 실측 결과 박제
- §4 chrome 룰 적용 여부 — LegalFindingsPage = 점검 시리즈 직접 적용 케이스 + showNav=false 특수 케이스 (모바일/데스크톱 모두 글로벌 chrome 외곽 숨김) 명시 + 02 InspectionPage 와 동일 도메인 + 19-legal LegalPage 와 차이 (chrome 외곽 0건 vs 19-legal 데스크톱 AppHeader+사이드바 표시) 명시
- §6 negative rule 안 `wrangler` + `npm run deploy` 키워드 모두 등장 + finding 상태 + borderLeft 2px (19-legal 3px 과 다름) 시그니처 변경 금지 / role admin adminBar 조건부 + sortedFindings open-first + headerTitle 동적 분기 + findingCard navigate 변경 금지 / legalApi 4종 snake_case payload 보존 / handleZipDownload iOS PWA `<a download>` 패턴 + setTimeout 3000 / ZIP 파일명 round.title 기반 + 폴더명 + 사진 파일명 / handleReportUpload FormData + Bearer token + dynamic authStore import / toast 8종 + 빈/오류 카피 + adminBar 카피 5종 + finding 카피 + addButton / 데스크톱 maxWidth 800 / 모바일 고정 하단 CTA 패턴 / @keyframes blink (.6/.3) + spin / 모바일 헤더 자체 렌더 + 36x36 / 외부 컴포넌트 (PhotoGrid/PhotoSourceModal/FindingFormSheet) 미수정 / 부모 + 자식 페이지 미수정 명시
- §7 OQ 5건 모두 정리, 각각 default 답 1줄 포함 (모바일 헤더 raised alpha 0.97 유지 / finding 상태 status 토큰 치환 / §1.1 9·10·11 fontSize 12 격상 / 메인 CTA (addButton) 그라데이션 + 빈/오류 아이콘 + SKELETON 활용 / Lucide back+Loader2 교체 + back 44x44 격상)
- LegalFindingsPage.tsx 코드 변경 0 — `git diff --name-only` 빈 출력
- 어떠한 sketch-wave-*.html 도 생성하지 않음 (W2 부터)
- legalApi 4종 메서드 (get / getFindings / updateResult / deleteFinding) 모두 본문에 언급 (anchor verify ≥ 4)
  </done>
</task>

</tasks>

<verification>
이 wave 의 verify 는 task 1 의 automated block 으로 충분. 추가 phase-level 검증 없음.

자체 검수 흐름:
1. `git status` — wave-1-index.md 1개 신규, 그 외 변경 0
2. `wc -l cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md` — 합리적 길이 (대략 400~550 줄 예상, LegalFindingsPage 378 lines 단일 export + 내부 panel 없음 + finding 상태 2분기 + adminBar 분기 + ZIP 다운로드 + 모바일 고정 하단 CTA 박제로 19-legal W1 보다 약간 짧음)
3. 사용자에게 "wave-1-index.md 작성 완료 / §7 OQ 5건 답변 필요" 보고 후 컨펌 대기 (W2 자동 진입 금지, memory `feedback_avoid_premature_confirmation`)
</verification>

<success_criteria>
- wave-1-index.md 7개 섹션 모두 채워짐 (§1 인벤토리 3영역 + 비즈 시그니처 박스 / §2 sub-wave 분배 4행 + 보존/토큰/폰트/레이아웃 / §3 design-system verbatim 6 fence / §4 chrome 룰 (점검 시리즈 + showNav=false 특수 케이스 + App.tsx 실측 박제) / §5 메모리 룰 12개 (10 + LegalFindingsPage 특화 2) / §6 negative 20+건 / §7 OQ 5건)
- 코드 변경 0건 (LegalFindingsPage.tsx + 외부 컴포넌트/훅 모두 untouched)
- sketch HTML 0건 생성 (W2 부터)
- 13-schedule + 14-reports + 27-login + 16-workshift + 17-annual-plan + 28-splash + 23-education + 19-legal 의 평면 sketch-wave-*.html 패턴 mirror — sketch/ 서브폴더 안 만듦
- 사용자 컨펌 받을 OQ 5건 정리됨 (모바일 헤더 raised alpha / finding 상태 토큰 / §1.1 fontSize 격상 / 메인 CTA (addButton) 그라데이션 + 빈/오류 아이콘 + SKELETON 활용 / Lucide back+Loader2 교체 + back 44x44 격상)
- automated verify 명령이 PASS (section=7 / subwave=4 / rules≥10 / wrangler≥1 / deploy≥1 / OQ≥5 / fence≥12 / src 변경=0 / legalApi anchor≥4)
</success_criteria>

<output>
After completion, return summary to user:
- 생성 파일: `cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md`
- §7 OQ 5건 사용자 컨펌 대기
- W2 진입 = OQ #1~#5 답변 후 (`/clear` + 새 `/gsd:quick` 시작 권장 — memory `feedback_gsd_workflow_strict`)
- 다음 wave 파일명 권장: `sketch-wave-2-chrome.html`
- 부모 페이지 (LegalPage @ /legal) + 자식 페이지 (LegalFindingDetailPage @ /legal/:id/finding/:fid) 는 본 wave 범위 아님 — 별도 wave 에서 처리
- 19-legal 와의 핵심 차이 5건 박제 (글로벌 chrome 0건 / 단일 export / borderLeft 2px / ZIP 파일명 round.title 기반 / findingCard 자식 페이지 진입) — W2~W5 진입 시 reference
</output>
</content>
