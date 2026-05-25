---
phase: 260523-lft
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/pages/LegalPage.tsx
autonomous: true
requirements:
  - W5-checklist-§1-scope-single-atomic
  - W5-checklist-§2-biz-anchor-17
  - W5-checklist-§3-region-mapping-4
  - W5-checklist-§4-OQ-LOCKED-5
  - W5-checklist-§5-negative-gate
  - W5-checklist-§6-positive-gate
  - W5-checklist-§7-build-gate
  - W5-checklist-§8-self-verify-grep
  - W5-checklist-§9-tailwind-cheatsheet
  - W5-checklist-§10-biz-checkbox
  - W5-checklist-§11-memory-rules-12
  - W5-checklist-§12-next-step
tags:
  - redesign
  - 19-legal
  - tsx-conversion
  - v0.1.1
  - quick
  - single-file-atomic
  - lucide-chevron-left
  - lucide-camera
  - lucide-loader2
  - back-button-44x44
  - status-token

must_haves:
  truths:
    - "LegalPage.tsx **단일 파일 atomic** in-place 수정. `git diff --name-only HEAD~ HEAD` 에 'cha-bio-safety/src/pages/LegalPage.tsx' + 본 PLAN.md/SUMMARY.md 만 등장 (다른 파일 0). 23-education (r22) / 17-annual-plan (1hj) / 27-login (gox) / 16-workshift (u5n) 와 동일한 단일 파일 패턴. 28-splash (4i9) 는 2 파일이었음 — 본 19-legal 은 571 lines 단일 파일 안 3 컴포넌트 (FindingsPanel + FindingDetailPanel + 메인 LegalPage) + 5 helper (fmtDate / fmtDateTime / accentColor / ResultBadge / SKELETON / TabKey+TABS / filterRounds / genYears / KVRow) 통합 변환."
    - "App.tsx + tailwind.config.js + tokens.css + typography.css + hooks/useIsDesktop.ts + hooks/useMultiPhotoUpload.ts + stores/authStore.ts + utils/api.ts + utils/findingDownload.ts + components/PhotoGrid.tsx + components/PhotoSourceModal.tsx + components/FindingFormSheet.tsx + pages/LegalFindingsPage.tsx + pages/LegalFindingDetailPage.tsx + types/ + functions/ + templates/ + migrations/ + public/ 모두 변경 0 byte. **App.tsx + 외부 8 파일 변경 0 byte 가드 = final verify gate**."
    - "변환 후 LegalPage.tsx 라인 수 571 ± 40 (540~620 예상). 인라인 SVG ChevronLeft path (line 512) 1 line + 인라인 spinner div (line 291) 1 line + spin @keyframes (line 291 동일) → Lucide 3종 import 1 line 추가 + Loader2 spinner 3 lines + Camera 첨부 button 변환 동등 → 총 라인 수 거의 동일."
    - "★ LegalPage 비즈 anchor 17건 1 byte 변경 0: (1) useQuery ['legal-rounds', year] + staleTime 30_000 (line 386~390) / (2) useQuery ['legal-round', roundId] + enabled (line 96~100) / (3) useQuery ['legal-findings', roundId] + staleTime 30_000 (line 102~106) / (4) useQuery ['legal-finding', roundId, findingId] + resolveMutation (line 241~265) + 4 키 invalidate / (5) legalApi 7종 시그니처 + snake_case payload (resolution_memo / resolution_photo_keys / report_file_key) / (6) accentColor 4분기 (pass→safe / fail→danger / conditional→warn / null→bd2) (line 27~32) / (7) ResultBadge map 4 라벨 (적합/부적합/조건부적합/결과 미입력) (line 35~47) / (8) filterRounds 3분기 (미조치 findingCount>resolvedCount / 완료 ===, findingCount>0 / 전체) (line 59~63) / (9) TABS key/label mismatch ('미조치' key → '진행 중' label) (line 54~58) / (10) sorted findings (open-first + createdAt desc localeCompare) (line 147~151) / (11) handleRoundClick isDesktop 분기 (line 394~401) / (12) role admin 도구 분기 (FindingsPanel role==='admin' line 162 + FindingDetailPanel staff?.role==='admin' line 299) / (13) useMultiPhotoUpload 5장 (canAdd/slots/cameraRef/albumRef/handleFiles/uploadAll/reset) / (14) buildMetaTxt + fflate dynamic import + ZIP 파일명 '지적사항_{location}.zip' + 사진 파일명 '지적사진-{N}.jpg' / '조치사진-{N}.jpg' / (15) @keyframes blink (.6/.3, Education .4 와 다름) + spin (OQ #5 Loader2 교체로 spin 제거) / (16) toast 카피 11종 (success 5 + error 6) / (17) 데스크톱 3분할 500+500+flex 1 + borderRight 1px + 모바일 자체 헤더 h 48 + 타이틀 '소방 점검 관리' verbatim — 모두 1 byte 변경 0."
    - "비즈 로직 0 diff: imports 13개 (useState+useRef/useNavigate+useSearchParams/useQuery+useMutation+useQueryClient/toast/legalApi/useIsDesktop/useAuthStore/useMultiPhotoUpload/PhotoGrid/PhotoSourceModal/FindingFormSheet/buildMetaTxt/types) line 1~13 그대로 + **추가 1줄**: `import { ChevronLeft, Camera, Loader2 } from 'lucide-react'`."
    - "카피 verbatim 보존 (17건): success 5 — '점검 결과 저장' / '보고서 업로드 완료' / '삭제됨' / '조치 완료' / '다운로드 완료'. error 6 — '저장 실패' / '업로드 실패' / err?.message ?? '삭제 실패' / '조치 처리 실패' / '다운로드 실패' / '조치 내용을 입력하세요'. 빈/오류/fallback 6 — '지적사항 없음' / '항목을 불러오지 못했습니다.' / '점검 이력 없음' / '불러오기 실패' / '재시도' / '다시 시도' / '목록을 불러오지 못했습니다.' / '소방 점검 관리 이력 없음' / '소방 일정 페이지에서 종합정밀 또는 작동기능 점검을 등록하면 여기에 표시됩니다.' / '좌측에서 점검을 선택하세요' / '중앙에서 지적사항을 선택하세요' / '점검을 먼저 선택하세요' / 'ResultBadge fallback 결과 미입력'. 모바일 타이틀 '소방 점검 관리' verbatim."
    - "OQ #1 LOCKED 적용 (모바일 자체 헤더 line 507~515): `bg-surface-raised border-b border-border-default`. 옛 인라인 `background:'rgba(22,27,34,0.97)', borderBottom:'1px solid var(--bd)'` 완전 폐기."
    - "OQ #2 LOCKED 적용 (accentColor + ResultBadge + finding 칩/borderLeft + round 카드 borderLeft): pass `bg-safe-bg text-safe` + `border-safe-bar` / fail `bg-danger-bg text-danger` + `border-danger-bar` / conditional `bg-warning-bg text-warning` + `border-warning-bar` / null `border-border-strong`. 옛 rgba(34,197,94,.13) / rgba(239,68,68,.15) / rgba(245,158,11,.15) + var(--safe) / var(--danger) / var(--warn) / var(--bd2) 인라인 모두 완전 폐기. finding 칩 open `bg-danger-bg text-danger` '미조치' / resolved `bg-safe-bg text-safe` '완료'. **status&#8209; prefix 없음** (memory `feedback_tailwind_token_class_pattern`)."
    - "OQ #3 LOCKED 적용 (9·10·11 fontSize → text-caption 12 + leading-none 격상): ResultBadge fontSize 11 + finding 칩 fontSize 10 + 메타 fontSize 10·11 + admin 도구 fontSize 11 + 데스크톱 탭 fontSize 11 + 다운로드 button fontSize 11 + KVRow 라벨 fontSize 12 + 첨부 fontSize 10 모두 `text-caption font-bold leading-none` (또는 `text-caption leading-none`) 격상. fontSize 9·10·11 인라인 0건 (verify negative gate)."
    - "OQ #4 LOCKED 적용 (조치 완료 CTA 인라인 그라데이션 ≥3 anchor + 작은 도구 button bg-accent + 빈/오류 카피 verbatim + 아이콘 추가 X): **★ 조치 완료 button (line 345~347)** 인라인 `background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)'` 유지 (OQ #4 LOCKED 예외 anchor ≥1, height 40→44 격상 옵션). admin '저장' button (line 170) + admin '재시도' (line 432) + 모바일 '다시 시도' (line 543) → `bg-accent text-text-on-accent` solid 토큰 치환 (linear-gradient 아님, OQ #4 LOCKED 작은 도구는 solid). 빈 '점검 이력 없음' + '소방 점검 관리 이력 없음' + '소방 일정 페이지에서...' + 오류 '불러오기 실패' / '목록을 불러오지 못했습니다.' / '항목을 불러오지 못했습니다.' + fallback '좌측에서 점검을 선택하세요' / '중앙에서 지적사항을 선택하세요' / '점검을 먼저 선택하세요' 모두 1 byte 변경 0. 빈/오류 영역 아이콘 / lucide / SVG 추가 X."
    - "OQ #5 LOCKED 적용 (Lucide 3종 교체 + back button 44x44 격상): `import { ChevronLeft, Camera, Loader2 } from 'lucide-react'` 추가 (line 14 또는 imports 끝). (a) 모바일 헤더 back button (line 511~513) 인라인 SVG path `d=\"M15 19l-7-7 7-7\"` 완전 제거 → `<ChevronLeft size={20} />` 교체 + back button 36x36 → **44x44 격상** (w&#8209;8 함정 회피, 인라인 `width:44, height:44` 명시). (b) FindingDetailPanel 첨부 button 안 '📷' 이모지 (line 340) 완전 제거 → `<Camera size={18} />` 교체. (c) FindingDetailPanel 로딩 spinner (line 291) 인라인 div spinner + spin @keyframes 완전 제거 → `<Loader2 className=\"animate-spin\" size={24} />` 교체. grep gate `IconChevronLeft = 0` (해당 없음) + `polyline = 0` (해당 없음) + `'📷' = 0` (이모지 제거) + `path d=\"M15 19` = 0 (인라인 SVG 제거) + `animation: 'spin .7s linear infinite' = 0` (Loader2 교체)."
    - "Negative gate 모두 PASS: 이모지 0 (TSX 본문, 특히 '📷' line 340 제거) / linear-gradient — **조치 완료 button 인라인 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` ≥1 만 허용** (OQ #4 LOCKED 예외 anchor, total == OQ #4 카운트) / 그 외 0 / fontSize 9·10·11 인라인 0 / status- prefix 0 / w-8·h-8 0 (memory `feedback_tailwind_w8_h8_is_48px`) / 옛 alias var(--bg|bg2|bg3|bg4|bd|bd2|t1|t2|t3|acl|safe|warn|danger) 0 (TSX 본문 안 단계적 제거 완료) / 인라인 SVG path d=\"M15 19...\" 0 / 인라인 spinner div + spin keyframes 0 / '📷' 0."
    - "Positive gate 모두 PASS: bg-surface-raised border-b border-border-default ≥1 (OQ #1) / border-safe-bar + border-danger-bar + border-warning-bar 각 ≥1 (OQ #2 accentColor + round borderLeft) / bg-safe-bg text-safe + bg-warning-bg text-warning + bg-danger-bg text-danger 각 ≥1 (OQ #2 ResultBadge + finding 칩) / text-caption ≥10 + leading-none ≥10 (OQ #3 격상) / linear-gradient(135deg, #1d4ed8, #0ea5e9) ≥1 (OQ #4 조치 완료) + bg-accent ≥2 (OQ #4 admin 저장 + 재시도/다시 시도) / 빈+오류 카피 verbatim 다수 (OQ #4) / import ChevronLeft, Camera, Loader2 from lucide-react ≥1 + <ChevronLeft size={20} ≥1 + <Camera size={18} ≥1 + <Loader2 ≥1 (OQ #5)."
    - "★ 비즈 anchor 17건 보존 grep gate PASS: useQuery 4종 queryKey + staleTime 30_000 + enabled / legalApi 7종 (list/get/getFindings/updateResult/deleteFinding/getFinding/resolveFinding) / snake_case payload (resolution_memo / resolution_photo_keys / report_file_key) / accentColor 4분기 함수 시그니처 + ResultBadge map 4 라벨 / filterRounds 3분기 / TABS key '미조치' label '진행 중' / sorted open-first + localeCompare desc / handleRoundClick isDesktop / role admin 도구 분기 2건 / useMultiPhotoUpload (slots+canAdd+uploadAll+reset) / buildMetaTxt + fflate zipSync + 파일명 정규식 / @keyframes blink (.6/.3) / toast 11종 / 데스크톱 3분할 500+500+flex 1 + 모바일 헤더 h 48 + 타이틀 '소방 점검 관리'."
    - "App.tsx + 외부 8 파일 변경 0 byte: `git diff --name-only HEAD~ HEAD -- cha-bio-safety/src/App.tsx cha-bio-safety/src/utils/api.ts cha-bio-safety/src/utils/findingDownload.ts cha-bio-safety/src/hooks/useMultiPhotoUpload.ts cha-bio-safety/src/components/PhotoGrid.tsx cha-bio-safety/src/components/PhotoSourceModal.tsx cha-bio-safety/src/components/FindingFormSheet.tsx cha-bio-safety/src/pages/LegalFindingsPage.tsx cha-bio-safety/src/pages/LegalFindingDetailPage.tsx` 빈 출력."
    - "Build gate: `cd cha-bio-safety && npx tsc --noEmit` 0 errors + `cd cha-bio-safety && npm run build` exit 0 (Vite build PASS). LegalPage chunk size 보고."
    - "Atomic 1-commit (단일 파일): `feat(quick-260523-lft): redesign/19-legal TSX 변환 (LegalPage.tsx 571 단일 atomic + v0.1.1 토큰 className 매핑 + 비즈 anchor 17건 보존 + Lucide ChevronLeft+Camera+Loader2 3종 교체 + OQ LOCKED 5건 반영 + W5 §3 매핑 verbatim)`."

  artifacts:
    - path: cha-bio-safety/src/pages/LegalPage.tsx
      provides: v0.1.1 토큰 className 적용 (외곽 / 모바일 헤더 / 데스크톱 3분할 500+500+flex 1 / accentColor 4 토큰 / ResultBadge 4 토큰 / finding 칩 2 토큰 / round 카드 borderLeft / FindingsPanel admin 도구 / FindingDetailPanel admin 다운로드 / KVRow / 조치 입력 textarea / 사진 슬롯 / 첨부 button / 조치 완료 button / 모바일 필터 / 모바일 카드) + Lucide 3종 교체 (ChevronLeft 모바일 헤더 + Camera 첨부 + Loader2 spinner, IconChevronLeft / polyline / '📷' / 인라인 spinner div + spin keyframes 완전 제거) + back button 44x44 격상 + OQ #1 모바일 헤더 bg-surface-raised border-b border-border-default + OQ #2 accentColor + ResultBadge + finding 칩 status 토큰 + OQ #3 9·10·11 → text-caption + leading-none 격상 + OQ #4 조치 완료 인라인 그라데이션 + 작은 도구 solid bg-accent + 빈/오류 verbatim + OQ #5 Lucide 3종 + 비즈 anchor 17건 (useQuery 4종 + legalApi 7종 + snake_case payload + accentColor 4분기 + ResultBadge 4 라벨 + filterRounds 3분기 + TABS mismatch + sorted open-first + handleRoundClick isDesktop + role admin 도구 + useMultiPhotoUpload 5장 + buildMetaTxt + ZIP + @keyframes blink + toast 11종 + 데스크톱 3분할 + 모바일 헤더 h 48) 1 byte 변경 0
      contains: "bg-surface-page / bg-surface-raised / bg-surface-sunken / bg-surface-active / border-border-default / border-border-strong / border-2 / border-accent / text-text-primary / text-text-secondary / text-text-tertiary / text-text-on-accent / text-danger / bg-safe-bg / text-safe / border-safe-bar / bg-warning-bg / text-warning / border-warning-bar / bg-danger-bg / text-danger / border-danger-bar / bg-accent / text-body / text-body-sm / text-label / text-caption / font-bold / font-extrabold / leading-none / leading-relaxed / rounded-full / rounded-md / rounded-sm / ChevronLeft / Camera / Loader2 / size={20} / size={18} / size={24} / animate-spin / from 'lucide-react' / legal-rounds / legal-round / legal-findings / legal-finding / legalApi.list / legalApi.get / legalApi.getFindings / legalApi.updateResult / legalApi.deleteFinding / legalApi.getFinding / legalApi.resolveFinding / resolution_memo / resolution_photo_keys / report_file_key / accentColor / ResultBadge / filterRounds / sorted / handleRoundClick / isDesktop / useMultiPhotoUpload / buildMetaTxt / zipSync / @keyframes blink / 점검 결과 저장 / 보고서 업로드 완료 / 삭제됨 / 조치 완료 / 다운로드 완료 / 저장 실패 / 업로드 실패 / 삭제 실패 / 조치 처리 실패 / 다운로드 실패 / 조치 내용을 입력하세요 / 지적사항 없음 / 항목을 불러오지 못했습니다 / 점검 이력 없음 / 불러오기 실패 / 재시도 / 다시 시도 / 목록을 불러오지 못했습니다 / 소방 점검 관리 이력 없음 / 좌측에서 점검을 선택하세요 / 중앙에서 지적사항을 선택하세요 / 점검을 먼저 선택하세요 / 소방 점검 관리 / linear-gradient(135deg, #1d4ed8, #0ea5e9)"
      min_lines: 540

  key_links:
    - from: "W5 §3 영역 1 — 상단 유틸 / 포맷터 / accentColor / ResultBadge / SKELETON / TABS / filterRounds / genYears / KVRow (line 1~77)"
      to: LegalPage.tsx line 1~77
      via: "imports 13개 line 1~13 그대로 + 추가 1줄 line 14: `import { ChevronLeft, Camera, Loader2 } from 'lucide-react'`. fmtDate / fmtDateTime (line 16~24) verbatim. **★ accentColor 4분기 함수 시그니처 line 27~32 verbatim** (pass→var(--safe) / fail→var(--danger) / conditional→var(--warn) / null→var(--bd2)). **★ ResultBadge map 4 라벨 verbatim** + 외곽 style 인라인 11/700 → className `text-caption font-bold leading-none rounded-sm` (OQ #3 격상) + bg/color 토큰 치환 OQ #2 (pass `bg-safe-bg text-safe` / fail `bg-danger-bg text-danger` / conditional `bg-warning-bg text-warning` / null `bg-transparent text-text-tertiary`). SKELETON (line 50) — className `bg-surface-sunken rounded-md` + 인라인 height 72 + animation 'blink 2s ease-in-out infinite' 옵션. TabKey + TABS (line 53~58) verbatim, **key '미조치' label '진행 중' mismatch 1 byte 변경 0**. filterRounds (line 59~63) verbatim 3분기. genYears verbatim. KVRow (line 70~77) — 라벨 12 var(--t3) → className `text-caption leading-none text-text-tertiary` + children 14 var(--t1) → className `text-label text-text-primary`."
      pattern: "import \\{ ChevronLeft, Camera, Loader2 \\} from 'lucide-react'|accentColor|ResultBadge|filterRounds|TABS|'미조치'|'진행 중'"

    - from: "W5 §3 영역 2 — FindingsPanel (line 82~228, OQ #2 + OQ #3 + OQ #4 적용)"
      to: LegalPage.tsx line 82~228
      via: "useQueryClient / useAuthStore / role / state 6개 verbatim. **★ useQuery × 2** (line 96~106) — queryKey ['legal-round', roundId] + ['legal-findings', roundId] + enabled + staleTime 30_000 1 byte 변경 0. handleSaveResult + handleReportUpload + handleDelete (line 110~145) — toast 카피 verbatim ('점검 결과 저장' / '저장 실패' / '보고서 업로드 완료' / '업로드 실패' / '삭제됨' / err?.message ?? '삭제 실패'). **★ sorted findings (line 147~151) open-first + createdAt desc localeCompare 1 byte 변경 0**. 헤더 (line 156~159) — `text-body-sm font-bold text-text-primary` + 날짜 `text-caption leading-none text-text-secondary`. **admin 도구 (line 162~178, role==='admin' 분기) OQ #3 격상**: select className `bg-surface-sunken border border-border-strong text-caption font-bold leading-none text-text-primary rounded-sm` + 인라인 padding '4px 8px' + appearance none + cursor. **저장 button OQ #4 작은 도구 solid**: className `bg-accent text-text-on-accent text-caption font-bold leading-none rounded-sm` + 인라인 height 28 + padding '0 10px' + opacity 분기. 보고서 / 보고서 업로드 button: className `bg-surface-sunken border border-border-strong text-caption font-bold leading-none text-text-primary rounded-sm` (또는 secondary `text-text-secondary`) + 인라인 height 28 + padding '0 10px'. SKELETON className 동일. 빈 '지적사항 없음' verbatim `text-text-tertiary text-label`. **★ finding 카드 (line 187~213) OQ #2 + OQ #3 selected ★**: 외곽 className `bg-surface-sunken rounded-md ${selectedFindingId===f.id ? 'border-2 border-accent' : 'border border-border-default'} border-l-[3px] ${f.status==='open' ? 'border-danger-bar' : 'border-safe-bar'}` + 인라인 padding 10 + cursor + flex + gap. description className `text-label font-medium text-text-primary` + 인라인 ellipsis. **status 칩 OQ #2 + OQ #3**: open `bg-danger-bg text-danger text-caption font-bold leading-none rounded-sm` + 인라인 padding '1px 6px' + label '미조치' / resolved `bg-safe-bg text-safe text-caption font-bold leading-none rounded-sm` + label '완료'. location className `text-caption leading-none text-text-secondary`. createdAt className `text-caption leading-none text-text-tertiary`. 수정/삭제 button className `text-caption leading-none text-text-tertiary` + 인라인 background none + border none + cursor + padding. FindingFormSheet mount verbatim."
      pattern: "queryKey: \\['legal-round'|queryKey: \\['legal-findings'|sorted|'open' && b\\.status|border-l-\\[3px\\]|border-danger-bar|border-safe-bar|bg-danger-bg text-danger|bg-safe-bg text-safe|'미조치'|'완료'"

    - from: "W5 §3 영역 3 — FindingDetailPanel (line 233~367, OQ #3 + OQ #4 + OQ #5 적용)"
      to: LegalPage.tsx line 233~367
      via: "useQueryClient / useNavigate / useState memo / useAuthStore / useMultiPhotoUpload / useState downloading verbatim. **★ useQuery (line 241~245)** queryKey ['legal-finding', roundId, findingId] + enabled. **★ resolveMutation (line 247~265)** — uploadAll → legalApi.resolveFinding(roundId, findingId, {resolution_memo: memo.trim(), resolution_photo_keys: keys.length>0 ? keys : undefined}) + 4 키 invalidate (['legal-finding', roundId, findingId] + ['legal-findings', roundId] + ['legal-rounds'] + ['legal-round', roundId]) + toast.success '조치 완료' + resPhotos.reset + setMemo('') + onError toast.error '조치 처리 실패'. **★ handleDownload (line 267~287)** — fflate dynamic import + zipSync + 파일명 `지적사항_${(finding.location ?? '').replace(/[\\/\\\\:*?\"<>|]/g, '_')}.zip` + 사진 파일명 `지적사진-${j+1}.jpg` / `조치사진-${j+1}.jpg` + toast.success '다운로드 완료' / toast.error '다운로드 실패'. **★ isLoading spinner OQ #5 Lucide Loader2 교체 (line 291)**: 인라인 div spinner + spin @keyframes 완전 제거 → `<Loader2 className=\"animate-spin text-accent\" size={24} />`. !finding 빈 '항목을 불러오지 못했습니다.' verbatim. **헤더 + admin 다운로드 (line 297~302) OQ #3 격상**: '지적 상세' className `text-body-sm font-bold text-text-primary`. admin 다운로드 button className `bg-surface-sunken border border-border-strong text-caption font-bold leading-none text-text-primary rounded-sm` + 인라인 height 28 + padding '0 10px' + opacity 분기. **지적 정보 KVRow 4건 + 지적 사진 PhotoGrid** verbatim. **조치 입력 영역 (open finding line 322~348)**: borderTop className `border-t border-border-default` + 인라인 paddingTop 16. 섹션 라벨 className `text-caption leading-none font-bold text-text-tertiary`. textarea className `bg-surface-sunken border border-border-strong text-label text-text-primary rounded-md` + 인라인 padding '10px 12px' + boxSizing + outline none + fontFamily inherit + lineHeight 1.5 + resize vertical. 사진 슬롯 64x64 인라인 width/height (w-8 함정 회피) + ✕ 18x18 인라인 + bg-danger 인라인 또는 className. **첨부 button OQ #5 Lucide Camera 교체 (line 338~342)**: 인라인 '📷' span 완전 제거 → `<Camera size={18} />` + className `bg-surface-sunken text-text-tertiary rounded-sm` + 인라인 width 64 + height 64 + flex column + dashed border + cursor + gap. label className `text-caption leading-none font-bold`. **★ 조치 완료 button OQ #4 인라인 그라데이션 (line 345~347) ★★★**: className `text-text-on-accent text-label font-bold rounded-md` + 인라인 marginTop 12 + width 100% + **height 44 (옛 40 → 44 격상 권장)** + border none + cursor isSubmitting 분기 + opacity 분기 + **background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)'** (★ OQ #4 LOCKED 예외 anchor, var(--acl) 완전 폐기). 조치 결과 영역 (resolved finding line 352~363) — borderTop className `border-t border-border-default` + KVRow 3 + PhotoGrid verbatim."
      pattern: "queryKey: \\['legal-finding'|resolveFinding|resolution_memo|resolution_photo_keys|<Loader2|animate-spin|<Camera size=\\{18\\}|linear-gradient\\(135deg, #1d4ed8, #0ea5e9\\)|border-t border-border-default"

    - from: "W5 §3 영역 4 — 메인 LegalPage (line 372~571, OQ #1 + OQ #2 + OQ #3 + OQ #4 + OQ #5 통합 적용)"
      to: LegalPage.tsx line 372~571
      via: "useNavigate / useIsDesktop / useSearchParams (tab + setTab) / useState year + selectedRoundId + selectedFindingId / **★ useQuery ['legal-rounds', year] + staleTime 30_000 (line 386~390) + filtered = filterRounds(rounds ?? [], tab) verbatim**. **★ handleRoundClick isDesktop 분기 (line 394~401) 1 byte 변경 0**. **roundList JSX (line 404~461)**: 탭 (TABS 매핑 line 408~418) — 데스크톱 height 38 인라인 / 모바일 height 44 인라인 + className `${tab===t.key ? 'bg-surface-active text-text-primary' : 'text-text-tertiary'} text-caption font-bold leading-none` + 인라인 flex 1 + border none + borderBottom `2px solid ${tab===t.key ? 'var(--accent)' : 'transparent'}` 인라인 또는 분기. 연도 select className `bg-surface-sunken border border-border-strong text-caption leading-none text-text-primary rounded-sm` + 인라인 padding '4px 8px' 데스크톱 / '6px 12px' 모바일 + cursor + appearance none. 데스크톱 SKELETON 동일. **데스크톱 오류 '불러오기 실패' + 재시도 button OQ #4 작은 도구 solid (line 429~434)**: 텍스트 className `text-label text-text-secondary` + 재시도 button className `bg-accent text-text-on-accent text-caption font-bold leading-none rounded-sm` + 인라인 display block + margin '8px auto' + padding '6px 16px'. 데스크톱 빈 '점검 이력 없음' className `text-caption leading-none text-text-tertiary` (line 436). **★ 라운드 카드 데스크톱 (line 438~458) OQ #2 + OQ #3 selected ★**: 외곽 className `bg-surface-sunken rounded-md ${selectedRoundId===round.id ? 'border-2 border-accent' : 'border border-border-default'} border-l-[3px] ${result==='pass' ? 'border-safe-bar' : result==='fail' ? 'border-danger-bar' : result==='conditional' ? 'border-warning-bar' : 'border-border-strong'}` + 인라인 padding 10 + cursor + flex + gap. title className `text-label font-bold text-text-primary` + 인라인 ellipsis. ResultBadge mount. 메타 '`fmtDate(round.date)` · 지적 N · 완료 M' verbatim className `text-caption leading-none text-text-secondary`. **데스크톱 3분할 (line 464~500)**: 외곽 className `bg-surface-page flex h-full`. 인라인 `<style>{`@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }`}</style>` (line 467) 보존. 좌측 className `w-[500px] flex-shrink-0 border-r border-border-default flex flex-col h-full` (또는 인라인 width 500). 중앙 className `w-[500px] flex-shrink-0 border-r border-border-default flex flex-col` + FindingsPanel mount + fallback '좌측에서 점검을 선택하세요' className `flex-1 flex items-center justify-center text-label text-text-tertiary`. 우측 className `flex-1 flex flex-col` + FindingDetailPanel mount + fallback `selectedRoundId ? '중앙에서 지적사항을 선택하세요' : '점검을 먼저 선택하세요'` className `flex-1 flex items-center justify-center text-label text-text-tertiary`. **모바일 (line 503~570)**: 외곽 className `bg-surface-page flex flex-col h-full overflow-hidden`. 인라인 `<style>{`@keyframes blink ...`}</style>` (line 505) 보존. **★ 모바일 자체 헤더 (line 507~515) OQ #1 LOCKED + OQ #5 LOCKED ★★★**: className `bg-surface-raised border-b border-border-default` + 인라인 height 48 + flex + alignItems center + justifyContent center + position relative + flexShrink 0. back button className `text-text-primary` + 인라인 position absolute + left 8 (옛 12) + **width 44 + height 44 (옛 36x36 → 44x44 격상, w&#8209;8 함정 회피)** + background none + border none + cursor + flex center + `<ChevronLeft size={20} />` (옛 인라인 svg path `M15 19l-7-7 7-7` 완전 제거). 타이틀 '소방 점검 관리' className `text-body font-bold text-text-primary` verbatim. 필터 영역 (line 518~534) — 외곽 className `bg-surface-raised border-b border-border-default` + 탭 동일 매핑 + select 모바일 padding. 모바일 SKELETON 동일. **모바일 오류 + 다시 시도 button OQ #4 작은 도구 solid (line 540~544)**: 텍스트 '목록을 불러오지 못했습니다.' className `text-body-sm text-text-secondary` + 다시 시도 button className `bg-accent text-text-on-accent text-body-sm font-bold rounded-sm` + 인라인 padding '8px 24px'. **모바일 빈 (line 547~550)**: '소방 점검 관리 이력 없음' className `text-body font-bold text-text-primary` + '소방 일정 페이지에서 종합정밀 또는 작동기능 점검을 등록하면 여기에 표시됩니다.' className `text-caption leading-relaxed text-text-secondary` (line 549). **★ 라운드 카드 모바일 (line 552~567) OQ #2 ★**: 외곽 className `bg-surface-sunken rounded-md border border-border-default border-l-[3px] ${result==='pass' ? 'border-safe-bar' : result==='fail' ? 'border-danger-bar' : result==='conditional' ? 'border-warning-bar' : 'border-border-strong'}` + 인라인 padding 12 + cursor. title className `text-body-sm font-bold text-text-primary` + 인라인 ellipsis. ResultBadge mount. 메타 verbatim '`fmtDate(round.date)`${round.endDate ? ` ~ ${fmtDate(round.endDate)}` : ''} · 지적 {findingCount}건 · 완료 {resolvedCount}건' className `text-caption leading-relaxed text-text-secondary` ('건' 있음, 데스크톱과 다름)."
      pattern: "queryKey: \\['legal-rounds', year\\]|handleRoundClick|setSelectedRoundId|setSelectedFindingId|bg-surface-raised border-b border-border-default|<ChevronLeft size=\\{20\\}|@keyframes blink|width: 500|w-\\[500px\\]"

    - from: "W5 §9 Tailwind cheatsheet — v0.1.1 토큰 → utility class 매핑"
      to: cha-bio-safety/src/styles/tokens.css + cha-bio-safety/tailwind.config.js
      via: "v0.1.1 토큰 확인 (tokens.css 실측): --surface-page #0a0d12 / --surface-raised #1a1f27 / --surface-sunken #232a33 / --surface-active #2c333d / --text-primary #e6edf3 / --text-secondary #adb6c0 (AAA 7.4:1) / --text-tertiary #8b949e / --text-on-accent #fff / --border-default rgba(255,255,255,0.14) / --border-strong rgba(255,255,255,0.22) / --accent #3b82f6 + --status-{safe,warning,danger}-{bar,bg} 모두 dark mode 보유. tailwind.config 실측: bg-surface-page+raised+sunken / border-border-default+strong / text-text-on-accent / bg-accent / bg-safe-bg+warning-bg+danger-bg 모두 매핑 존재. **status- prefix 없음** (memory `feedback_tailwind_token_class_pattern` — 정확 = `bg-safe-bg` `text-safe` `border-safe-bar` / 잘못 = `bg-status-safe-bg`)."
      pattern: "surface-page|surface-raised|surface-sunken|safe-bg|warning-bg|danger-bg|safe-bar|warning-bar|danger-bar"

    - from: "W1 §7 OQ LOCKED 5건 + W5 §4 LOCKED 결정 (sa7 + 40p 박제)"
      to: cha-bio-safety/docs/redesign-context/19-legal/wave-1-index.md (758 lines) + wave-5-tsx-conversion-checklist.md (525 lines)
      via: "OQ #1 모바일 헤더 raised + border-b / OQ #2 accentColor + ResultBadge + finding 칩 status 토큰 (status- prefix 없음) / OQ #3 9·10·11 fontSize → text-caption 12 leading-none / OQ #4 조치 완료 인라인 그라데이션 ≥3 anchor + 작은 도구 solid bg-accent + 빈/오류 verbatim 아이콘 X / OQ #5 Lucide ChevronLeft (back 44x44 격상) + Camera (첨부) + Loader2 (spinner) 3종 교체."
      pattern: "OQ #1|OQ #2|OQ #3|OQ #4|OQ #5|LOCKED"

  scope_negatives:
    - "1 파일만 수정 — cha-bio-safety/src/pages/LegalPage.tsx 외 src/ 트리 변경 0건"
    - "App.tsx 변경 0 byte (final verify gate)"
    - "외부 8 파일 변경 0 byte: utils/api.ts / utils/findingDownload.ts / hooks/useMultiPhotoUpload.ts / components/PhotoGrid.tsx / components/PhotoSourceModal.tsx / components/FindingFormSheet.tsx / pages/LegalFindingsPage.tsx / pages/LegalFindingDetailPage.tsx"
    - "tailwind.config.js / tokens.css / typography.css / hooks/useIsDesktop.ts / stores/authStore.ts / types/ / functions/ / templates/ / migrations/ / public/ 모두 0 byte 변경"
    - "sketch HTML 3 파일 (W2 chrome 617 + W3 round-card 682 + W4 findings-panel 950) + W5 checklist (525) + W1 index (758) 모두 0 byte 변경 (read-only reference)"
    - "wrangler 명령 0건 (CLAUDE.local.md 디자인 워크트리 강제)"
    - "npm run deploy 0건 (직원 도메인 cbc7119 경로)"
---

<objective>
redesign/19-legal TSX 변환 — LegalPage.tsx (571 lines) **단일 파일 atomic in-place 수정**.

W2 (chrome) + W3 (round-card) + W4 (findings-panel) 3 sketch + W5 12 섹션 checklist + W1 OQ 5건 LOCKED 결정을 1-commit 으로 적용. **★ 비즈 anchor 17건 1 byte 변경 0**. **★ Lucide 3종 교체** (ChevronLeft 모바일 헤더 back button + Camera 첨부 button + Loader2 spinner, 인라인 SVG path + 📷 이모지 + 인라인 spinner div + spin @keyframes 완전 제거, OQ #5 LOCKED). **★ back button 44x44 격상** (옛 36x36, w-8 함정 회피).

23-education (r22) / 17-annual-plan (1hj) / 27-login (gox) / 16-workshift (u5n) 와 동일한 단일 파일 atomic 패턴 mirror. 28-splash (4i9) 는 2 파일이었으나 19-legal 은 571 lines 단일 파일 안 3 컴포넌트 (FindingsPanel + FindingDetailPanel + 메인 LegalPage) + 5 helper (fmtDate / fmtDateTime / accentColor / ResultBadge / SKELETON / TabKey+TABS / filterRounds / genYears / KVRow) 통합 변환.

Purpose:
- v0.1.1 토큰 className 으로 옛 인라인 `var(--bg) / var(--bg2) / var(--bg3) / var(--bg4) / var(--bd) / var(--bd2) / var(--t1) / var(--t2) / var(--t3) / var(--acl) / var(--safe) / var(--warn) / var(--danger)` 치환
- **OQ #1 LOCKED**: 모바일 자체 헤더 → `bg-surface-raised border-b border-border-default` (line 507~515). 옛 `background:rgba(22,27,34,0.97), borderBottom:1px solid var(--bd)` 완전 폐기
- **OQ #2 LOCKED**: accentColor 4분기 + ResultBadge 4 라벨 + finding 칩 2분기 + round 카드 borderLeft 4분기 → status 토큰 매핑. pass `bg-safe-bg text-safe` + `border-safe-bar` / fail `bg-danger-bg text-danger` + `border-danger-bar` / conditional `bg-warning-bg text-warning` + `border-warning-bar` / null `border-border-strong`. 옛 rgba(34,197,94,.13) + rgba(239,68,68,.15) + rgba(245,158,11,.15) + var(--safe) + var(--danger) + var(--warn) + var(--bd2) 완전 폐기. **status- prefix 없음**. 4분기 라벨 적합 / 부적합 / 조건부적합 / 결과 미입력 verbatim
- **OQ #3 LOCKED**: 9·10·11 fontSize → `text-caption font-bold leading-none` (12 격상). ResultBadge 11 + finding 칩 10 + 메타 10·11 + admin 도구 11 + 데스크톱 탭 11 + 다운로드 11 + KVRow 12 + 첨부 10 모두 격상. fontSize 9·10·11 인라인 0건
- **OQ #4 LOCKED**: **★ 조치 완료 button (line 345~347) 인라인 그라데이션** `linear-gradient(135deg, #1d4ed8, #0ea5e9)` 유지 (≥1 anchor) + 옛 `background:var(--acl)` 완전 폐기. height 40 → 44 격상 옵션. admin 저장 button + 데스크톱 재시도 + 모바일 다시 시도 → `bg-accent text-text-on-accent` solid (작은 도구는 그라데이션 아님). 빈/오류 카피 점검 이력 없음 + 소방 점검 관리 이력 없음 + 소방 일정 페이지에서 종합정밀 또는 작동기능 점검을 등록하면 여기에 표시됩니다. + 좌측에서 점검을 선택하세요 + 중앙에서 지적사항을 선택하세요 + 점검을 먼저 선택하세요 + 지적사항 없음 + 항목을 불러오지 못했습니다. + 불러오기 실패 + 목록을 불러오지 못했습니다. 1 byte 변경 0. 아이콘 / SVG 추가 X
- **OQ #5 LOCKED**: Lucide 3종 교체 — `import { ChevronLeft, Camera, Loader2 } from lucide-react` 추가 1줄. (a) 모바일 헤더 back button (line 511~513) 인라인 SVG path `M15 19l-7-7 7-7` 완전 제거 → `<ChevronLeft size={20} />` 교체 + back button 36x36 → **44x44 격상**. (b) FindingDetailPanel 첨부 button 📷 이모지 (line 340) 완전 제거 → `<Camera size={18} />` 교체. (c) FindingDetailPanel isLoading spinner (line 291) 인라인 div spinner + spin @keyframes 완전 제거 → `<Loader2 className=\"animate-spin text-accent\" size={24} />` 교체
- ★ 비즈 anchor 17건 **1 byte 변경 0** (§3 박제)
- 비즈 로직 0 diff (state/handler/effect/hook/queryKey/mutation/legalApi 7종/snake_case payload/role admin 분기/sorted/filterRounds/handleRoundClick/useMultiPhotoUpload/ZIP 모두 보존)

Output:
- cha-bio-safety/src/pages/LegalPage.tsx 단일 파일 in-place 수정 (571 → 540~620 lines 예상)
- App.tsx + 외부 8 파일 + tailwind.config.js + tokens.css + typography.css + hooks/ + stores/ + types/ + functions/ + templates/ + migrations/ + public/ 모두 0 byte 변경
- `npm run build` PASS
- atomic 1-commit (단일 파일 + PLAN.md/SUMMARY.md)
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/jykevin/Documents/cbc7119-design/CLAUDE.md
@/Users/jykevin/Documents/cbc7119-design/CLAUDE.local.md
@/Users/jykevin/Documents/cbc7119-design/.planning/STATE.md

# W5 TSX 변환 checklist (SOURCE OF TRUTH — §3 매핑 verbatim)
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/19-legal/wave-5-tsx-conversion-checklist.md

# W1 sketch index (OQ LOCKED 5건 + biz anchor 17 원본)
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/19-legal/wave-1-index.md

# W2~W4 sketch (변환 매핑 시각 검증)
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/19-legal/sketch-wave-2-chrome.html
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/19-legal/sketch-wave-3-round-card.html
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/19-legal/sketch-wave-4-findings-panel.html

# 토큰 / Tailwind config (utility class 검증)
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/styles/tokens.css
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/tailwind.config.js

# Precedent — 23-education r22 PLAN.md (mirror skeleton)
@/Users/jykevin/Documents/cbc7119-design/.planning/quick/260522-r22-redesign-23-education-tsx-educationpage-/260522-r22-PLAN.md

# 변환 대상 (in-place 수정 단일 파일)
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/LegalPage.tsx

# 변환 무영향 — 0 byte 변경 (final verify gate)
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/App.tsx
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/utils/api.ts
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/utils/findingDownload.ts
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/hooks/useMultiPhotoUpload.ts
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/components/PhotoGrid.tsx
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/components/PhotoSourceModal.tsx
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/components/FindingFormSheet.tsx
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/LegalFindingsPage.tsx
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/LegalFindingDetailPage.tsx

</context>

<tasks>

<task type="auto">
  <name>Task 1: LegalPage.tsx 단일 파일 atomic v0.1.1 토큰 변환 (in-place, 비즈 anchor 17건 + Lucide 3종 교체 + back 44x44 격상 + OQ LOCKED 5건, atomic 1-commit)</name>
  <files>cha-bio-safety/src/pages/LegalPage.tsx</files>
  <action>

LegalPage.tsx 571 lines 를 **단일 atomic commit** 으로 in-place 수정하여 v0.1.1 토큰 className 으로 치환한다. **23-education (r22) / 17-annual-plan (1hj) / 27-login (gox) / 16-workshift (u5n) mirror 패턴 — 단일 파일 atomic**. 28-splash (4i9) 2 파일과 달리 571 lines 안 3 컴포넌트 (FindingsPanel + FindingDetailPanel + 메인 LegalPage) + 5 helper 통합 변환. 비즈 로직(useState/useRef/useQuery 4종/useMutation/legalApi 7종/snake_case payload/accentColor 4분기/ResultBadge map/filterRounds/sorted/handleRoundClick/role admin 분기/useMultiPhotoUpload/buildMetaTxt/ZIP) 1 byte 변경 0. **★ 비즈 anchor 17건 + Lucide 3종 교체 ((a) ChevronLeft back + (b) Camera 첨부 + (c) Loader2 spinner) + back button 44x44 격상 모두 grep PASS**.

## 0. 사전 확인 (필수)

```bash
# 0-1. branch 확인 (worktree-aware)
git branch --show-current   # 기대: redesign/19-legal
git status --short          # 기대: 빈 출력 (clean) 또는 PLAN.md 만

# 0-2. branch base 검증
EXPECTED_BASE="origin/main"
git merge-base HEAD "$EXPECTED_BASE" >/dev/null 2>&1 && echo "branch base OK" || echo "branch base FAIL"

# 0-3. 변환 대상 파일 라인 수 baseline
wc -l cha-bio-safety/src/pages/LegalPage.tsx   # 기대: 571

# 0-4. App.tsx + 외부 8 파일 baseline (0 byte 변경 verify gate)
for f in cha-bio-safety/src/App.tsx \
         cha-bio-safety/src/utils/api.ts \
         cha-bio-safety/src/utils/findingDownload.ts \
         cha-bio-safety/src/hooks/useMultiPhotoUpload.ts \
         cha-bio-safety/src/components/PhotoGrid.tsx \
         cha-bio-safety/src/components/PhotoSourceModal.tsx \
         cha-bio-safety/src/components/FindingFormSheet.tsx \
         cha-bio-safety/src/pages/LegalFindingsPage.tsx \
         cha-bio-safety/src/pages/LegalFindingDetailPage.tsx; do
  git rev-parse "HEAD:$f" 2>/dev/null | head -c 12; echo "  $f"
done

# 0-5. 인라인 alias / 이모지 / 인라인 SVG / spinner 현 상태 (negative gate baseline)
grep -c "var(--" cha-bio-safety/src/pages/LegalPage.tsx              # baseline: 다수 (변환 후 0)
grep -c "📷" cha-bio-safety/src/pages/LegalPage.tsx                  # baseline: 1 (line 340, 변환 후 0)
grep -c "M15 19l-7-7 7-7" cha-bio-safety/src/pages/LegalPage.tsx     # baseline: 1 (line 512, 변환 후 0)
grep -c "animation: 'spin .7s linear" cha-bio-safety/src/pages/LegalPage.tsx  # baseline: 1 (line 291, 변환 후 0)
grep -c "linear-gradient" cha-bio-safety/src/pages/LegalPage.tsx     # baseline: 0 (변환 후 1 = OQ #4 조치 완료 추가)
```

## 1. 변환 매핑 (W5 §3 verbatim — 4 영역, 추측 0건)

### §1.1 영역 1 — 상단 유틸 / 포맷터 / accentColor / ResultBadge / SKELETON / TABS / filterRounds / KVRow (line 1~77, W2 chrome)

| 현재 (인라인 style, line) | 변환 후 (className + 인라인) | sketch / OQ |
|---|---|---|
| imports 13개 (line 1~13) | **그대로** + **추가 1줄**: `import { ChevronLeft, Camera, Loader2 } from 'lucide-react'` (line 14, OQ #5 LOCKED) | W2 + OQ #5 |
| fmtDate (line 16~19) + fmtDateTime (line 20~24) | **그대로** (비즈 anchor — Date 포맷팅) | - |
| **★ accentColor 4분기 (line 27~32)** | **그대로** (★ 비즈 anchor 6) — `pass → var(--safe)` / `fail → var(--danger)` / `conditional → var(--warn)` / `else → var(--bd2)`. 함수 시그니처 + 분기 모두 1 byte 변경 0. ★ borderLeft 사용처 line 445/555 에서 토큰 매핑 inline 결정 | W2 + OQ #2 |
| **★ ResultBadge (line 35~47)** | map 4 라벨 verbatim 유지. 외곽 span fontSize 11 + fontWeight 700 + borderRadius 6 + background m?.bg + color m?.color 인라인 → className `text-caption font-bold leading-none rounded-sm` (OQ #3 격상) + bg/color 토큰 분기 — pass `bg-safe-bg text-safe` / fail `bg-danger-bg text-danger` / conditional `bg-warning-bg text-warning` / null `bg-transparent text-text-tertiary`. 인라인 `padding: '2px 8px', flexShrink: 0` 유지. 라벨 적합 / 부적합 / 조건부적합 / 결과 미입력 verbatim | W2 + OQ #2 + OQ #3 |
| SKELETON (line 50) | className `bg-surface-sunken rounded-md` + 인라인 `height: 72, animation: 'blink 2s ease-in-out infinite'` (★ 비즈 anchor 15 blink 보존). 옛 `background: 'var(--bg3)', borderRadius: 12, height: 72` 완전 폐기 | W2 |
| TabKey type + TABS (line 53~58) | **그대로** (★ 비즈 anchor 9, key 미조치 label 진행 중 mismatch 1 byte 변경 0) | - |
| filterRounds (line 59~63) | **그대로** (★ 비즈 anchor 8, 3분기 미조치 findingCount>resolvedCount / 완료 ===, findingCount>0 / 전체) | - |
| genYears (line 64~67) | **그대로** | - |
| KVRow (line 70~77) | 라벨 `fontSize:12, color:'var(--t3)'` → className `text-caption leading-none text-text-tertiary` + 인라인 `width: 64, flexShrink: 0`. children `fontSize:14, color:'var(--t1)', lineHeight:1.5` → className `text-label text-text-primary` + 인라인 `flex: 1, lineHeight: 1.5` (또는 className `leading-relaxed`) | W2 + OQ #3 |

### §1.2 영역 2 — FindingsPanel (line 82~228, W4 findings-panel, OQ #2 + OQ #3 + OQ #4 적용)

| 현재 (인라인 style, line) | 변환 후 (className + 인라인) | sketch / OQ |
|---|---|---|
| state 6개 (line 87~94) | **그대로** — queryClient / staff / role / selectedResult / savingResult / uploadingReport / editingFinding / reportInputRef | - |
| **★ useQuery × 2 (line 96~106)** | **그대로** (★ 비즈 anchor 2+3) — queryKey legal-round / legal-findings + roundId + enabled + staleTime 30_000 1 byte 변경 0 | - |
| handleSaveResult (line 110~119) | **그대로** (★ 비즈 anchor 5+16) — legalApi.updateResult(roundId, {result: effectiveResult || undefined}) + invalidateQueries 2건 + toast.success 점검 결과 저장 / toast.error 저장 실패 | - |
| handleReportUpload (line 121~135) | **그대로** (★ 비즈 anchor 5+16) — FormData + /api/uploads + legalApi.updateResult(roundId, {report_file_key}) snake_case + invalidate + toast.success 보고서 업로드 완료 / toast.error 업로드 실패 | - |
| handleDelete (line 137~145) | **그대로** (★ 비즈 anchor 5+16) — legalApi.deleteFinding(roundId, finding.id) + invalidate 3건 + toast.success 삭제됨 / toast.error err?.message ?? 삭제 실패 | - |
| **★ sorted findings (line 147~151)** | **그대로** (★ 비즈 anchor 10) — open-first + createdAt desc localeCompare 1 byte 변경 0 | - |
| 외곽 div (line 154) | className `flex flex-col h-full` 또는 인라인 유지 | W4 |
| 헤더 (line 156~159) | 외곽 div 인라인 padding 16px 16px 8px + flexShrink 0 유지. round?.title fallback 지적사항 목록 className `text-body-sm font-bold text-text-primary`. 날짜 className `text-caption leading-none text-text-secondary` + 인라인 marginTop 2 (또는 className `mt-0.5`) | W4 + OQ #3 |
| **admin 도구 (line 162~178, role===admin 분기) OQ #3 격상** | 외곽 div 인라인 padding 0 16px 8px + flex + gap 6 + flexWrap wrap + flexShrink 0 유지. **select** className `bg-surface-sunken border border-border-strong text-caption font-bold leading-none text-text-primary rounded-sm` + 인라인 padding 4px 8px + appearance none + cursor. 옵션 4개 verbatim. **저장 button OQ #4 작은 도구 solid**: className `bg-accent text-text-on-accent text-caption font-bold leading-none rounded-sm` + 인라인 height 28 + padding 0 10px + border none + cursor + opacity savingResult 분기. input file type=file ref=reportInputRef accept=application/pdf verbatim. **보고서 button (round.reportFileKey 있을 때)**: className `bg-surface-sunken border border-border-strong text-caption font-bold leading-none text-text-primary rounded-sm` + 인라인 height 28 + padding 0 10px. **보고서 업로드 button (없을 때)**: className `bg-surface-sunken border border-border-strong text-caption font-bold leading-none text-text-secondary rounded-sm` + 인라인 동일 + opacity uploadingReport 분기 | W4 + OQ #3 + OQ #4 |
| 목록 외곽 (line 181) | 인라인 `flex:1, overflowY:'auto', padding:'0 16px 16px', display:'flex', flexDirection:'column', gap:6` 유지 | W4 |
| 로딩 SKELETON (line 182) | `<div className="bg-surface-sunken rounded-md" style={{ height:72, animation:'blink 2s ease-in-out infinite' }} />` | W4 |
| 빈 지적사항 없음 (line 184) | className `flex-1 flex items-center justify-center text-label text-text-tertiary` (verbatim) | W4 + OQ #4 |
| **★ finding 카드 외곽 (line 187~196) OQ #2 + OQ #3 selected ★** | className `bg-surface-sunken rounded-md ${selectedFindingId===f.id ? 'border-2 border-accent' : 'border border-border-default'} border-l-[3px] ${f.status===open ? 'border-danger-bar' : 'border-safe-bar'}` (★ OQ #2 LOCKED 4분기는 status open/resolved 2분기로 단순화, status- prefix 없음. ★ OQ #3 1.5→2 selected 격상) + 인라인 padding 10 + cursor + display flex + flexDirection column + gap 2. 옛 인라인 border + borderLeft + background 완전 폐기 | W4 + OQ #2 + OQ #3 |
| finding 카드 description (line 199) | className `text-label font-medium text-text-primary` + 인라인 `flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'` 유지. fontWeight 500 → font-medium (text-label 기본 weight 일치 확인, 안 맞으면 font-medium 명시) | W4 |
| **finding 카드 status 칩 (line 200) OQ #2 + OQ #3** | open `bg-danger-bg text-danger text-caption font-bold leading-none rounded-sm` + 라벨 미조치 / resolved `bg-safe-bg text-safe text-caption font-bold leading-none rounded-sm` + 라벨 완료 + 인라인 padding 1px 6px + flexShrink 0. 옛 인라인 background rgba + color var(--danger)/var(--safe) + fontSize 10 + borderRadius 5 완전 폐기 | W4 + OQ #2 + OQ #3 |
| finding 카드 location (line 202) | className `text-caption leading-none text-text-secondary` 위치 미지정 fallback verbatim | W4 + OQ #3 |
| finding 카드 메타 (line 203~212) | createdAt className `text-caption leading-none text-text-tertiary`. 수정/삭제 button className `text-caption leading-none text-text-tertiary` + 인라인 `background:'none', border:'none', cursor:'pointer', padding:'1px 3px'`. 수정 / 삭제 verbatim | W4 + OQ #3 |
| FindingFormSheet mount (line 217~225) | **그대로** (외부 컴포넌트 0 byte) | - |

### §1.3 영역 3 — FindingDetailPanel (line 233~367, W4 findings-panel, OQ #3 + OQ #4 + OQ #5 적용)

| 현재 (인라인 style, line) | 변환 후 (className + 인라인) | sketch / OQ |
|---|---|---|
| state 5개 (line 234~239) | **그대로** — queryClient / navigate / memo / staff / resPhotos = useMultiPhotoUpload() / downloading | - |
| **★ useQuery (line 241~245)** | **그대로** (★ 비즈 anchor 4) — queryKey legal-finding + roundId + findingId + enabled 1 byte 변경 0 | - |
| **★ resolveMutation (line 247~265)** | **그대로** (★ 비즈 anchor 4+5+13+16) — uploadAll → legalApi.resolveFinding(roundId, findingId, {resolution_memo: memo.trim(), resolution_photo_keys: keys.length>0 ? keys : undefined}) + **4 키 invalidate** (legal-finding + legal-findings + legal-rounds + legal-round) + toast.success 조치 완료 + resPhotos.reset() + setMemo('') + onError toast.error 조치 처리 실패 1 byte 변경 0 | - |
| **★ handleDownload (line 267~287)** | **그대로** (★ 비즈 anchor 14+16) — fflate dynamic import + zipSync({...}, {level:6}) + buildMetaTxt(finding) → 내용.txt + 지적사진 fetch + 조치사진 fetch + 파일명 `지적사항_${(finding.location ?? '').replace(/[\\/\\\\:*?\"<>|]/g, '_')}.zip` + 사진 파일명 `지적사진-${j+1}.jpg` / `조치사진-${j+1}.jpg` + toast.success 다운로드 완료 / toast.error 다운로드 실패 | - |
| isSubmitting (line 289) | **그대로** | - |
| **★ isLoading spinner OQ #5 LOCKED Lucide Loader2 교체 (line 291) ★★★** | 옛 `<div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:24, height:24, border:'2px solid var(--bd2)', borderTopColor:'var(--acl)', borderRadius:'50%', animation:'spin .7s linear infinite' }} /><style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style></div>` 완전 제거 → `<div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-accent" size={24} /></div>` | W4 + OQ #5 |
| !finding 빈 (line 292) | className `flex-1 flex items-center justify-center text-label text-text-tertiary` (verbatim 항목을 불러오지 못했습니다.) | W4 + OQ #4 |
| 외곽 div (line 295) | 인라인 `flex:1, overflowY:'auto', padding:'16px 20px'` 유지 | W4 |
| **헤더 + admin 다운로드 (line 297~302) OQ #3 격상** | 외곽 div flex space-between marginBottom 16 유지. 지적 상세 className `text-body-sm font-bold text-text-primary`. **admin 다운로드 button** (staff?.role===admin 분기) className `bg-surface-sunken border border-border-strong text-caption font-bold leading-none text-text-primary rounded-sm` + 인라인 height 28 + padding 0 10px + cursor downloading 분기 + opacity 분기 | W4 + OQ #3 |
| 지적 정보 섹션 (line 305~313) | 외곽 marginBottom 16. 섹션 라벨 지적 정보 className `text-caption leading-none font-bold text-text-tertiary` + 인라인 marginBottom 8. KVRow 4개 (지적 내용/위치/등록일/등록자) verbatim — children verbatim 내부 카피 보존 | W4 + OQ #3 |
| 지적 사진 섹션 (line 316~319) | 외곽 marginBottom 16. 라벨 지적 사진 className `text-caption leading-none font-bold text-text-tertiary`. PhotoGrid mount verbatim. 사진 없음 fallback className `text-caption leading-none text-text-tertiary` 사진 없음 verbatim | W4 + OQ #3 |
| **조치 입력 (open finding) borderTop (line 323)** | className `border-t border-border-default` + 인라인 paddingTop 16 | W4 |
| 조치 라벨 조치 내용 (line 324) | className `text-caption leading-none font-bold text-text-tertiary` + 인라인 marginBottom 8 | W4 + OQ #3 |
| textarea (line 325) | className `bg-surface-sunken border border-border-strong text-label text-text-primary rounded-md` + 인라인 `width:'100%', padding:'10px 12px', boxSizing:'border-box', fontFamily:'inherit', lineHeight:1.5, resize:'vertical', outline:'none'` 유지. placeholder 조치 내용을 입력하세요 verbatim. rows={3} verbatim | W4 + OQ #3 |
| 조치 사진 라벨 (line 327) | className `text-caption leading-none font-bold text-text-tertiary` + 인라인 marginBottom 6 | W4 + OQ #3 |
| input cameraRef + albumRef + PhotoSourceModal (line 328~330) | **그대로** (외부 컴포넌트 / hook 0 byte) | - |
| 사진 슬롯 div (line 332~337) | 외곽 position relative. img 인라인 `width:64, height:64, objectFit:'cover', borderRadius:8, border:'1px solid var(--bd)'` → className `border border-border-default rounded-sm` + 인라인 width/height/objectFit 유지 (w-8 함정 회피 — 64 인라인 명시). **✕ button** 인라인 `position:'absolute', top:-5, right:-5, width:18, height:18, borderRadius:'50%', background:'var(--danger)', border:'none', color:'#fff', fontSize:10, fontWeight:700, ...` → className `bg-danger text-white rounded-full` (또는 인라인 bg 유지) + 인라인 position/top/right/width/height/border none/cursor/flex center 유지. fontSize 10 → className `text-caption leading-none font-bold` | W4 + OQ #3 |
| **첨부 button OQ #5 LOCKED Lucide Camera 교체 (line 338~342) ★★★** | 옛 인라인 `width:64, height:64, borderRadius:8, background:'var(--bg3)', border:'1px dashed var(--bd2)', color:'var(--t3)', fontSize:10, fontWeight:600, ...` + `<span style={{ fontSize:18 }}>📷</span>첨부` → className `bg-surface-sunken text-text-tertiary rounded-sm` + 인라인 `width:64, height:64, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, cursor:'pointer', border:'1px dashed var(--border-strong)'` (또는 className `border border-dashed border-border-strong`). 안쪽 `<Camera size={18} /><span className="text-caption leading-none font-bold">첨부</span>` (★ 📷 이모지 완전 제거) | W4 + OQ #5 |
| **★ 조치 완료 button OQ #4 LOCKED 인라인 그라데이션 (line 345~347) ★★★ (OQ #4 anchor)** | 옛 `style={{ marginTop:12, width:'100%', height:40, background:'var(--acl)', color:'#fff', fontSize:13, fontWeight:700, border:'none', borderRadius:10, cursor:..., opacity:... }}` → className `text-text-on-accent text-label font-bold rounded-md` + 인라인 `marginTop:12, width:'100%', height:44 (옛 40 → 44 격상), border:'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.5 : 1, background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)'` (★ OQ #4 LOCKED 예외 anchor, var(--acl) 완전 폐기). 안쪽 텍스트 `{isSubmitting ? '처리 중...' : '조치 완료'}` verbatim. onClick `{ if (!memo.trim()) { toast.error('조치 내용을 입력하세요'); return }; resolveMutation.mutate() }` verbatim | W4 + OQ #4 |
| **조치 결과 (resolved finding) borderTop (line 353)** | className `border-t border-border-default` + 인라인 paddingTop 16 | W4 |
| 조치 라벨 조치 결과 (line 354) | className `text-caption leading-none font-bold text-text-tertiary` + 인라인 marginBottom 8 | W4 + OQ #3 |
| KVRow 3개 + PhotoGrid (line 355~362) | **verbatim** (children verbatim 내부 카피 보존) | W4 |

### §1.4 영역 4 — 메인 LegalPage + 데스크톱 3분할 + 모바일 분기 (line 372~571, W2 chrome + W3 round-card, OQ #1~#5 통합 적용)

| 현재 (인라인 style, line) | 변환 후 (className + 인라인) | sketch / OQ |
|---|---|---|
| state 5개 (line 373~384) | **그대로** — navigate / isDesktop / tab / year / years / selectedRoundId / selectedFindingId | - |
| **★ useQuery [legal-rounds, year] (line 386~390)** | **그대로** (★ 비즈 anchor 1) — queryKey + queryFn + staleTime 30_000 + filtered 1 byte 변경 0 | - |
| **★ handleRoundClick (line 394~401)** | **그대로** (★ 비즈 anchor 11) — isDesktop 분기 (데스크톱 selectedRoundId+selectedFindingId / 모바일 navigate sub-route) 1 byte 변경 0 | - |
| roundList 외곽 (line 405) | className `flex flex-col h-full` 또는 인라인 유지 | W3 |
| 탭 영역 (line 408~418) | 외곽 div 인라인 `display:'flex'`. 각 button — 옛 인라인 `flex:1, height:38, border:'none', background: tab===t.key ? 'var(--bg4)' : 'transparent', color: tab===t.key ? 'var(--t1)' : 'var(--t3)', fontSize:11, fontWeight:700, cursor:'pointer', borderBottom: tab===t.key ? '2px solid var(--acl)' : '2px solid transparent'` → className `${tab===t.key ? 'bg-surface-active text-text-primary' : 'text-text-tertiary'} text-caption font-bold leading-none` + 인라인 `flex:1, height:38, border:'none', cursor:'pointer', borderBottom: tab===t.key ? '2px solid var(--accent)' : '2px solid transparent'` (var(--bg4)→bg-surface-active, var(--acl)→var(--accent) 인라인) | W3 + OQ #3 |
| 연도 select 데스크톱 (line 419~423) | 옛 인라인 `background:'var(--bg3)', border:'1px solid var(--bd2)', borderRadius:6, padding:'4px 8px', color:'var(--t1)', fontSize:12, cursor:'pointer', appearance:'none'` → className `bg-surface-sunken border border-border-strong text-caption leading-none text-text-primary rounded-sm` + 인라인 `padding:'4px 8px', cursor:'pointer', appearance:'none'`. 외곽 div 인라인 padding 6px 12px 유지 | W3 + OQ #3 |
| 카드 영역 (line 427) | 인라인 `flex:1, overflowY:'auto', padding:'8px 12px', display:'flex', flexDirection:'column', gap:6` 유지 | W3 |
| 데스크톱 SKELETON × 3 (line 428) | `<div className="bg-surface-sunken rounded-md" style={{ height:72, animation:'blink 2s ease-in-out infinite' }} />` × 3 | W3 |
| **데스크톱 오류 + 재시도 button OQ #4 작은 도구 solid (line 429~434)** | 외곽 div className `text-center text-label text-text-secondary` + 인라인 padding 24. 불러오기 실패 span verbatim. 재시도 button className `bg-accent text-text-on-accent text-caption font-bold leading-none rounded-sm` + 인라인 `display:'block', margin:'8px auto', border:'none', padding:'6px 16px', cursor:'pointer'` (var(--acl) 완전 폐기) | W3 + OQ #4 |
| 데스크톱 빈 점검 이력 없음 (line 436) | className `flex-1 flex items-center justify-center text-caption leading-none text-text-tertiary text-center` + 인라인 padding 16 | W3 + OQ #4 |
| **★ 라운드 카드 데스크톱 외곽 (line 438~448) OQ #2 + OQ #3 selected ★** | 옛 `style={{ background:'var(--bg3)', border: selectedRoundId===round.id ? '1.5px solid var(--acl)' : '1px solid var(--bd)', borderLeft: '3px solid '+accentColor(round.result), borderRadius:10, padding:10, ... }}` → className `bg-surface-sunken rounded-md ${selectedRoundId===round.id ? 'border-2 border-accent' : 'border border-border-default'} border-l-[3px] ${round.result===pass ? 'border-safe-bar' : round.result===fail ? 'border-danger-bar' : round.result===conditional ? 'border-warning-bar' : 'border-border-strong'}` + 인라인 `padding:10, cursor:'pointer', display:'flex', flexDirection:'column', gap:3`. (★ accentColor() 함수 호출 → className 4분기 매핑, OQ #2 LOCKED status- prefix 없음. ★ OQ #3 1.5→2 selected 격상) | W3 + OQ #2 + OQ #3 |
| 데스크톱 카드 title + ResultBadge (line 450~453) | title className `text-label font-bold text-text-primary` + 인라인 `flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'`. ResultBadge mount verbatim | W3 |
| 데스크톱 카드 메타 (line 454~456) | 옛 `fontSize:11, color:'var(--t2)'` → className `text-caption leading-none text-text-secondary`. 내용 verbatim {fmtDate(round.date)} · 지적 {round.findingCount} · 완료 {round.resolvedCount} (건 없음, 모바일과 다름) | W3 + OQ #3 |
| **데스크톱 3분할 외곽 (line 464~466)** | 옛 `style={{ display:'flex', height:'100%', background:'var(--bg)' }}` → className `bg-surface-page flex h-full` (var(--bg) 완전 폐기) | W2 |
| **★ 데스크톱 인라인 <style> @keyframes blink (line 467) ★** | **그대로** (★ 비즈 anchor 15 — 글로벌 정의 없으므로 인라인 유지, .6/.3 Education 0.4 와 다름) | - |
| **★ 좌측 (line 470~472)** | 옛 `style={{ width:500, flexShrink:0, borderRight:'1px solid var(--bd)', display:'flex', flexDirection:'column' }}` → className `border-r border-border-default flex flex-col` + 인라인 `width:500, flexShrink:0` (또는 className `w-[500px] flex-shrink-0`). ★ 비즈 anchor 17 — width 500 1 byte 변경 0 | W2 |
| **★ 중앙 (line 475~486)** | 옛 동일 width 500 borderRight → className `border-r border-border-default flex flex-col` + 인라인 `width:500, flexShrink:0`. FindingsPanel mount (key+roundId+onSelectFinding+selectedFindingId) verbatim. fallback 좌측에서 점검을 선택하세요 className `flex-1 flex items-center justify-center text-label text-text-tertiary` (verbatim) | W2 + OQ #4 |
| **★ 우측 (line 489~497)** | 인라인 `flex:1, display:'flex', flexDirection:'column'` → className `flex-1 flex flex-col`. FindingDetailPanel mount (key+roundId+findingId) verbatim. fallback `selectedRoundId ? '중앙에서 지적사항을 선택하세요' : '점검을 먼저 선택하세요'` className `flex-1 flex items-center justify-center text-label text-text-tertiary` (verbatim) | W2 + OQ #4 |
| **모바일 외곽 (line 504)** | 옛 `style={{ flex:1, display:'flex', flexDirection:'column', background:'var(--bg)', height:'100%', overflow:'hidden' }}` → className `bg-surface-page flex flex-col h-full overflow-hidden` + 인라인 `flex:1` 유지 | W2 |
| **★ 모바일 인라인 <style> @keyframes blink (line 505) ★** | **그대로** (★ 비즈 anchor 15) | - |
| **★ 모바일 자체 헤더 (line 507~515) OQ #1 LOCKED + OQ #5 LOCKED ★★★** | 옛 `style={{ height:48, background:'rgba(22,27,34,0.97)', borderBottom:'1px solid var(--bd)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', flexShrink:0 }}` → className `bg-surface-raised border-b border-border-default flex items-center justify-center relative flex-shrink-0` + 인라인 `height:48`. **★ back button (line 511~513) OQ #5 ★★★**: 옛 `<button ... style={{ position:'absolute', left:12, width:36, height:36, border:'none', background:'none', cursor:'pointer', color:'var(--t1)', ... }}><svg width={20} height={20} ... ><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>` → `<button aria-label="뒤로 가기" onClick={() => navigate(-1)} className="text-text-primary" style={{ position:'absolute', left:8, width:44, height:44 (옛 36 → 44 격상, w-8 함정 회피), background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><ChevronLeft size={20} /></button>` (인라인 SVG path 완전 제거). 타이틀 소방 점검 관리 className `text-body font-bold text-text-primary` (verbatim) | W2 + OQ #1 + OQ #5 |
| 모바일 필터 영역 (line 518~534) | 외곽 className `bg-surface-raised border-b border-border-default flex-shrink-0`. 탭 (높이 44 인라인) 데스크톱과 동일 className 패턴. 연도 select 인라인 padding 6px 12px className `bg-surface-sunken border border-border-strong text-label leading-none text-text-primary rounded-sm`. 외곽 div 인라인 `display:'flex', alignItems:'center', gap:8, padding:'8px 16px'` 유지 | W2 + OQ #3 |
| 모바일 카드 영역 (line 538) | 인라인 `flex:1, overflowY:'auto', padding:'12px 16px', display:'flex', flexDirection:'column', gap:8` 유지 | W2 |
| 모바일 SKELETON × 3 (line 539) | className `bg-surface-sunken rounded-md` + 인라인 height 72 + animation blink × 3 | W2 |
| **모바일 오류 + 다시 시도 button OQ #4 작은 도구 solid (line 540~544)** | 외곽 div className `text-center text-body-sm text-text-secondary flex flex-col items-center` + 인라인 `padding:'40px 16px', gap:12`. 목록을 불러오지 못했습니다. span verbatim. 다시 시도 button className `bg-accent text-text-on-accent text-body-sm font-bold rounded-sm` + 인라인 `border:'none', padding:'8px 24px', cursor:'pointer'` (var(--acl) 완전 폐기) | W2 + OQ #4 |
| **모바일 빈 (line 547~550)** | 외곽 div `flex-1 flex flex-col items-center justify-center` + 인라인 `gap:8, padding:'60px 16px'`. 소방 점검 관리 이력 없음 className `text-body font-bold text-text-primary` (verbatim). 소방 일정 페이지에서 종합정밀 또는 작동기능 점검을 등록하면 여기에 표시됩니다. className `text-caption leading-relaxed text-text-secondary text-center` (verbatim) | W2 + OQ #4 |
| **★ 라운드 카드 모바일 외곽 (line 552~558) OQ #2 ★** | 옛 `style={{ background:'var(--bg3)', border:'1px solid var(--bd)', borderLeft: '3px solid '+accentColor(round.result), borderRadius:12, padding:12, ... }}` → className `bg-surface-sunken rounded-md border border-border-default border-l-[3px] ${round.result===pass ? 'border-safe-bar' : round.result===fail ? 'border-danger-bar' : round.result===conditional ? 'border-warning-bar' : 'border-border-strong'}` + 인라인 `padding:12, cursor:'pointer', display:'flex', flexDirection:'column', gap:4` (모바일 카드는 selected 분기 없음, 데스크톱만) | W3 + OQ #2 |
| 모바일 카드 title (line 559~561) | className `text-body-sm font-bold text-text-primary` + 인라인 `flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'`. ResultBadge mount verbatim | W3 |
| 모바일 카드 메타 (line 562~564) | className `text-caption leading-relaxed text-text-secondary`. 내용 verbatim {fmtDate(round.date)}{round.endDate ? ` ~ ${fmtDate(round.endDate)}` : ''} · 지적 {findingCount}건 · 완료 {resolvedCount}건 (건 있음 + endDate ~ 분기, 데스크톱과 다름) | W3 + OQ #3 |

## 2. OQ 5건 LOCKED 결정 (W1 §7 + W5 §4 verbatim — 위반 0건)

### OQ #1 LOCKED — 모바일 자체 헤더 `bg-surface-raised border-b border-border-default`
- line 507~515 (모바일 헤더): `background:'rgba(22,27,34,0.97)', borderBottom:'1px solid var(--bd)'` 인라인 완전 제거 → className `bg-surface-raised border-b border-border-default`
- 인라인 `height:48, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', flexShrink:0` 유지
- grep gate `bg-surface-raised border-b border-border-default >= 1` (모바일 헤더 + 모바일 필터 영역 2회 가능)

### OQ #2 LOCKED — accentColor + ResultBadge + finding 칩 + round 카드 borderLeft (status 토큰, status- prefix 없음)
- **accentColor 4분기** (line 27~32 함수 정의 1 byte 변경 0) — 사용처 line 445 데스크톱 / 555 모바일 round 카드 borderLeft 에서 className 4분기 매핑 (pass `border-safe-bar` / fail `border-danger-bar` / conditional `border-warning-bar` / null `border-border-strong`)
- **ResultBadge map** (line 35~47 4 라벨 verbatim) — 옛 인라인 bg rgba + color var() 완전 제거 → className 4분기 (pass `bg-safe-bg text-safe` / fail `bg-danger-bg text-danger` / conditional `bg-warning-bg text-warning` / null `bg-transparent text-text-tertiary`)
- **finding 칩** (line 187~200, FindingsPanel) — 옛 인라인 bg rgba + color var(--danger/--safe) 완전 제거 → className 2분기 (open `bg-danger-bg text-danger` 미조치 / resolved `bg-safe-bg text-safe` 완료)
- 임계치 — open / resolved 라벨 verbatim. accentColor 4분기 함수 시그니처 1 byte 변경 0
- **status- prefix 없음** (memory `feedback_tailwind_token_class_pattern`)
- grep gate `border-safe-bar >= 1` + `border-danger-bar >= 1` + `border-warning-bar >= 1` + `bg-safe-bg text-safe >= 1` + `bg-warning-bg text-warning >= 1` + `bg-danger-bg text-danger >= 1`

### OQ #3 LOCKED — 9·10·11 fontSize → text-caption 12 leading-none 격상
- ResultBadge fontSize 11 (line 43) → `text-caption font-bold leading-none`
- finding 칩 fontSize 10 (line 200) → `text-caption font-bold leading-none`
- finding 카드 메타 fontSize 10·11 (line 202, 204, 208, 210) → `text-caption leading-none`
- admin 도구 fontSize 11 (line 164, 170, 173, 175) → `text-caption font-bold leading-none`
- 데스크톱 탭 fontSize 11 (line 414) + 모바일 탭 fontSize 12 (line 525) → `text-caption font-bold leading-none`
- 다운로드 button fontSize 11 (line 300) → `text-caption font-bold leading-none`
- 데스크톱 카드 메타 fontSize 11 (line 454) → `text-caption leading-none`
- 첨부 button fontSize 10 (line 339) → `text-caption leading-none font-bold`
- KVRow 라벨 fontSize 12 (line 73) → `text-caption leading-none`
- 빈 fallback fontSize 12·13 (line 184, 292, 318, 436) → `text-caption leading-none` 또는 `text-label`
- fontSize 9·10·11 인라인 0건 (negative gate)
- selected card OQ #3-selected: border 1.5 → 2 격상 (`border-2 border-accent`, 데스크톱 round 카드 + finding 카드 모두)
- grep gate `text-caption >= 10` + `leading-none >= 10`

### OQ #4 LOCKED — 조치 완료 인라인 그라데이션 (≥1 anchor) + 작은 도구 solid bg-accent + 빈/오류 verbatim + 아이콘 X
- **★ 조치 완료 button (line 345~347)** 옛 `background:'var(--acl)'` 완전 제거 → 인라인 `background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)'` 추가 (★ OQ #4 LOCKED 예외 anchor). height 40 → 44 격상 권장. className `text-text-on-accent text-label font-bold rounded-md`
- **admin 저장 button** (line 170) + **데스크톱 재시도 button** (line 432) + **모바일 다시 시도 button** (line 543) → `bg-accent text-text-on-accent` solid (작은 도구는 그라데이션 아님, var(--acl) 완전 폐기)
- **빈/오류 카피 다수 verbatim** — 지적사항 없음 (line 184) / 항목을 불러오지 못했습니다. (line 292) / 점검 이력 없음 (line 436) / 불러오기 실패 (line 431) / 재시도 (line 432) / 다시 시도 (line 543) / 목록을 불러오지 못했습니다. (line 542) / 소방 점검 관리 이력 없음 (line 548) / 소방 일정 페이지에서 종합정밀 또는 작동기능 점검을 등록하면 여기에 표시됩니다. (line 549) / 좌측에서 점검을 선택하세요 (line 484) / 중앙에서 지적사항을 선택하세요 (line 494) / 점검을 먼저 선택하세요 (line 494)
- 아이콘 / lucide / SVG 추가 X (back button + 첨부 button + spinner 외 빈/오류 영역 아이콘 무)
- grep gate `linear-gradient(135deg, #1d4ed8, #0ea5e9) >= 1` + `bg-accent >= 2` + 빈/오류 카피 12+ verbatim grep

### OQ #5 LOCKED — Lucide 3종 교체 + back button 44x44 격상
- **추가**: `import { ChevronLeft, Camera, Loader2 } from 'lucide-react'` (line 14 또는 imports 끝)
- **(a) 모바일 헤더 back button (line 511~513) ChevronLeft 교체 + 44x44 격상**: 옛 인라인 SVG path `<svg width={20} height={20} ... ><path ... d="M15 19l-7-7 7-7" /></svg>` 완전 제거 → `<ChevronLeft size={20} />`. width:36, height:36 → **width:44, height:44 격상** (w-8 함정 회피, 인라인 명시. tailwind w-11 = 44px 도 가능하나 일관성으로 인라인 권장)
- **(b) FindingDetailPanel 첨부 button 📷 교체 (line 340)**: 옛 `<span style={{ fontSize:18 }}>📷</span>첨부` 완전 제거 → `<Camera size={18} /><span className="text-caption leading-none font-bold">첨부</span>`
- **(c) FindingDetailPanel isLoading spinner (line 291) Loader2 교체**: 옛 `<div style={{ width:24, height:24, border:'2px solid var(--bd2)', borderTopColor:'var(--acl)', borderRadius:'50%', animation:'spin .7s linear infinite' }} /><style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>` 완전 제거 → `<Loader2 className="animate-spin text-accent" size={24} />`
- grep gate `import { ChevronLeft, Camera, Loader2 } from 'lucide-react' >= 1` + `<ChevronLeft size={20} >= 1` + `<Camera size={18} >= 1` + `<Loader2 >= 1` + `📷 = 0` + `M15 19l-7-7 7-7 = 0` + `animation: 'spin .7s linear = 0` + `IconChevronLeft = 0` (해당 없음) + `polyline = 0` (해당 없음)


## 3. ★ 비즈 anchor 17건 보존 (23-education r22 + 28-splash 4i9 precedent — 1 byte 변경 금지)

다음은 **변경 0** — className 추가 + 인라인 alias 토큰 제거 외 logic / 상수 / 값 / 카피 / 시그니처 라인 손대지 않음:

1. **useQuery [`legal-rounds`, year]** (line 386~390) — `queryKey: [legal-rounds, year], queryFn: () => legalApi.list(year), staleTime: 30_000`. 변경 시 캐시 키 + 자동 갱신 어긋남.

2. **useQuery [`legal-round`, roundId]** (line 96~100) — `enabled: !!roundId`. 라운드 메타 + reportFileKey + result 조회. resolveMutation invalidate 키와 일치 필수.

3. **useQuery [`legal-findings`, roundId]** (line 102~106) — `staleTime: 30_000`. FindingsPanel 목록 + sorted open-first 입력. handleDelete + resolveMutation invalidate 키.

4. **useQuery [`legal-finding`, roundId, findingId]** (line 241~245) — `enabled: !!roundId && !!findingId`. FindingDetailPanel 상세 + resolveMutation invalidate 키 4번째.

5. **legalApi 7종 시그니처** — list / get / getFindings / updateResult / deleteFinding / getFinding / resolveFinding. **snake_case payload** (resolution_memo / resolution_photo_keys / report_file_key) + camelCase props 혼용 1 byte 변경 0. utils/api.ts 0 byte 변경 = 가드.

6. **accentColor 4분기** (line 27~32 함수 시그니처) — pass→safe / fail→danger / conditional→warn / null→bd2. 함수 정의 그대로, **사용처 line 445/555 borderLeft = className 4분기 매핑** (OQ #2 LOCKED). memory `feedback_inspection_unresolved_color` 일반화.

7. **ResultBadge map 4 라벨** (line 35~47) — pass `적합` / fail `부적합` / conditional `조건부적합` / null `결과 미입력`. bg/color 인라인 → className 4분기 (OQ #2 LOCKED).

8. **filterRounds 3분기** (line 59~63) — 미조치 findingCount>resolvedCount / 완료 ===, findingCount>0 / 전체. memory `project_inspection_completion_rule` 일반화.

9. **TABS key/label mismatch** (line 54~58) — key `미조치` label `진행 중` mismatch 의도된 디자인. URL searchParam tab 키 깨짐 방지.

10. **sorted findings open-first + createdAt desc localeCompare** (line 147~151). 1 byte 변경 0.

11. **handleRoundClick isDesktop 분기** (line 394~401) — isDesktop=true 데스크톱 마스터-디테일 / isDesktop=false 모바일 sub-route 네비. memory `project_desktop_conversion_plan` 일반화.

12. **role admin 도구 분기 2건** — FindingsPanel role===`admin` (line 162) + FindingDetailPanel staff?.role===`admin` (line 299). memory `project_inspection_completion_rule` 권한 분기 일반화.

13. **useMultiPhotoUpload 5장** — slots / canAdd = slots.length < 5 / cameraRef / albumRef / handleFiles / uploadAll / reset. 외부 hook 0 byte 변경.

14. **buildMetaTxt + fflate ZIP + 파일명** — `import(fflate).zipSync({...}, {level:6})` + ZIP `지적사항_${location}.zip` + 사진 `지적사진-${N}.jpg` / `조치사진-${N}.jpg`. 외부 utils 0 byte 변경.

15. **@keyframes blink (.6/.3)** (line 467 데스크톱 + line 505 모바일) — 인라인 <style> × 2. Education 1/0.4 와 다름. @keyframes spin (line 291) 은 OQ #5 Loader2 교체로 제거 예정.

16. **toast 카피 11종 verbatim** — success 5 + error 6. line 116/132/143/260/284 (success) + 117/133/144/264/285/345 (error).

17. **데스크톱 3분할 500+500+flex 1 + 모바일 헤더 h 48 + 타이틀 `소방 점검 관리`** — line 470/475/489/508/514. 1 byte 변경 0.

## 4. 비즈 로직 0 diff 보존

### 메인 LegalPage (line 372~571)
- line 1~13 imports 13개 + 추가 line 14 lucide-react 3종
- line 372~401 state + useQuery + handleRoundClick
- line 404~461 roundList JSX
- line 464~500 데스크톱 3분할
- line 503~570 모바일 (헤더 + 필터 + 카드)

### FindingsPanel (line 82~228)
- state 6 + ref / useQuery×2 / handler 3 / sorted / render

### FindingDetailPanel (line 233~367)
- state 5 / useQuery + resolveMutation (4 키 invalidate) / handleDownload / render

### 카피 verbatim 전체 — toast 11 + 빈/오류 13 + ResultBadge 4 + finding 칩 2 + 기타 라벨 다수

## 5. 작업 순서

1. wc -l 으로 571 baseline 확인
2. LegalPage.tsx 한 번 Read (571 lines)
3. App.tsx + 외부 8 파일 baseline hash 저장
4. Edit/Write in-place 수정 순서: §1.1 → §1.2 → §1.3 → §1.4
5. tsc --noEmit 0 errors 확인
6. build PASS 확인
7. negative gate + positive gate + biz anchor 17 모두 PASS 확인
8. atomic 1-commit:
   ```bash
   git add cha-bio-safety/src/pages/LegalPage.tsx .planning/quick/260523-lft-redesign-19-legal-tsx-legalpage-tsx-571-/
   git commit -m "feat(quick-260523-lft): redesign/19-legal TSX 변환 (LegalPage.tsx 571 단일 atomic + v0.1.1 토큰 className 매핑 + 비즈 anchor 17건 보존 + Lucide 3종 교체 + back 44x44 격상 + OQ LOCKED 5건 반영 + W5 §3 매핑 verbatim)"
   ```

## 6. 금지 사항

- wrangler 명령 0건 (CLAUDE.local.md 강제, 디자인 워크트리)
- npm run deploy 0건 (직원 도메인 cbc7119 경로)
- LegalPage.tsx 외 src 파일 수정 0건 (App.tsx + 외부 8 파일 + tailwind.config.js + tokens.css + typography.css + types/ + functions/ + templates/ + migrations/ + public/ 모두 무영향)
- **★ App.tsx + 외부 8 파일 변경 0 byte** — final verify gate
- status- prefix className 0건 (memory `feedback_tailwind_token_class_pattern`)
- w-8 / h-8 토큰 사용 0건 (=48px 함정, memory `feedback_tailwind_w8_h8_is_48px`)
- var(--bg|bg2|bg3|bg4|bd|bd2|t1|t2|t3|acl|safe|warn|danger) 잔존 0건 (accentColor 함수 정의 안 4분기 제외)
- linear-gradient 일반 0건. 예외 anchor: linear-gradient(135deg, #1d4ed8, #0ea5e9) (조치 완료 button, OQ #4 LOCKED) ≥1
- fontSize 9·10·11 인라인 0건 (OQ #3 LOCKED 격상)
- 이모지 0건 — 특히 카메라 이모지 (line 340) 완전 제거 (OQ #5 LOCKED)
- 인라인 SVG path `d="M15 19l-7-7 7-7"` 0건 (OQ #5 LOCKED ChevronLeft 교체)
- 인라인 spinner div + @keyframes spin 0건 (OQ #5 LOCKED Loader2 교체)
- IconChevronLeft 0건 (해당 없음 — 19-legal 은 인라인 SVG 만)
- polyline 0건 (해당 없음)
- 비즈 로직 변경 0건 (state/handler/useMutation/useQuery 4종/legalApi 7종/snake_case payload/accentColor/ResultBadge/filterRounds/sorted/handleRoundClick/role admin/useMultiPhotoUpload/buildMetaTxt/ZIP)
- **★ 비즈 anchor 17건 1 byte 변경 0건** — r22/4i9/1hj precedent
- App.tsx + 외부 8 파일 0 byte 변경 (final verify gate)

  </action>
  <verify>
    <automated>
# Path 변수
L="cha-bio-safety/src/pages/LegalPage.tsx"
APP="cha-bio-safety/src/App.tsx"
API="cha-bio-safety/src/utils/api.ts"
FDL="cha-bio-safety/src/utils/findingDownload.ts"
UMP="cha-bio-safety/src/hooks/useMultiPhotoUpload.ts"
PG="cha-bio-safety/src/components/PhotoGrid.tsx"
PSM="cha-bio-safety/src/components/PhotoSourceModal.tsx"
FFS="cha-bio-safety/src/components/FindingFormSheet.tsx"
LFP="cha-bio-safety/src/pages/LegalFindingsPage.tsx"
LFDP="cha-bio-safety/src/pages/LegalFindingDetailPage.tsx"

# ─── Negative gate ───
echo "=== Negative gate (LegalPage) ==="
# emoji range 검사 (특히 카메라 이모지 제거 OQ #5)
test "$(grep -oP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{26FF}]' "$L" 2>/dev/null | wc -l | tr -d ' ')" = "0" && echo "neg-L1 (emoji 0) PASS" || echo "neg-L1 FAIL"
# linear-gradient = 정확히 1 (OQ #4 조치 완료 예외)
LG_TOTAL=$(grep -c "linear-gradient" "$L")
LG_RESOLVE=$(grep -c "linear-gradient(135deg, #1d4ed8, #0ea5e9)" "$L")
test "$LG_TOTAL" = "$LG_RESOLVE" && test "$LG_RESOLVE" -ge 1 && echo "neg-L2 (linear-gradient only OQ #4, count=$LG_RESOLVE) PASS" || echo "neg-L2 FAIL (total=$LG_TOTAL, resolve=$LG_RESOLVE)"
# fontSize 9·10·11 인라인 0
test "$(grep -v "^\s*//" "$L" | grep -cE "fontSize:\s*(9|10|11)[^0-9px]|font-size:\s*(9|10|11)[^0-9px]")" = "0" && echo "neg-L3 (no 9·10·11 fontSize) PASS" || echo "neg-L3 FAIL"
# status- prefix 0
test "$(grep -cE "\b(text|bg|border)-status-(safe|fire|warning|danger|caution|accent)" "$L")" = "0" && echo "neg-L4 (no status- prefix) PASS" || echo "neg-L4 FAIL"
# w-8 / h-8 0 (=48px 함정)
test "$(grep -cE "\bw-8\b|\bh-8\b" "$L")" = "0" && echo "neg-L5 (no w-8/h-8) PASS" || echo "neg-L5 FAIL"
# 옛 alias var(--bg|bg2|bg3|bg4|bd|bd2|t1|t2|t3|acl|safe|warn|danger) 0
# accentColor 함수 정의 안 4분기 var() 는 grep 으로 제외 안 됨 → 카운트가 4 이하면 통과 처리
OLD_ALIAS=$(grep -cE "var\(--(bg|bg2|bg3|bg4|bd|bd2|t1|t2|t3|acl|safe|warn|danger)\)" "$L")
test "$OLD_ALIAS" -le 4 && echo "neg-L6 (old alias <= 4, accentColor 함수 안 4분기 제외, count=$OLD_ALIAS) PASS" || echo "neg-L6 FAIL (count=$OLD_ALIAS)"
# 인라인 SVG path d="M15 19l-7-7 7-7" 0 (OQ #5 ChevronLeft 교체)
test "$(grep -c "M15 19l-7-7 7-7" "$L")" = "0" && echo "neg-L7 (no inline SVG path, OQ #5) PASS" || echo "neg-L7 FAIL"
# spin keyframes 0 (OQ #5 Loader2 교체)
test "$(grep -cE "animation:\s*'spin .7s linear|@keyframes spin\{" "$L")" = "0" && echo "neg-L8 (no spin keyframes, OQ #5) PASS" || echo "neg-L8 FAIL"
# IconChevronLeft 0 (해당 없음, gate 만)
test "$(grep -c "IconChevronLeft" "$L")" = "0" && echo "neg-L9 (no IconChevronLeft) PASS" || echo "neg-L9 FAIL"
# polyline 0 (해당 없음, gate 만)
test "$(grep -c "polyline" "$L")" = "0" && echo "neg-L10 (no polyline) PASS" || echo "neg-L10 FAIL"

# ─── Positive gate ───
echo "=== Positive gate (LegalPage) ==="
# v0.1.1 토큰 다수
test "$(grep -cE "bg-surface-(page|raised|sunken|active)|border-border-(default|strong)|text-text-(primary|secondary|tertiary|on-accent)" "$L")" -ge 10 && echo "pos-L1 (v0.1.1 tokens >=10) PASS" || echo "pos-L1 FAIL"
# OQ #1 — 모바일 헤더
test "$(grep -c "bg-surface-raised border-b border-border-default" "$L")" -ge 1 && echo "pos-L2 (OQ #1 모바일 헤더) PASS" || echo "pos-L2 FAIL"
# OQ #2 — accentColor + ResultBadge + finding 칩 (status- prefix 없음)
test "$(grep -c "border-safe-bar" "$L")" -ge 1 && echo "pos-L3 (OQ #2 border-safe-bar) PASS" || echo "pos-L3 FAIL"
test "$(grep -c "border-danger-bar" "$L")" -ge 1 && echo "pos-L4 (OQ #2 border-danger-bar) PASS" || echo "pos-L4 FAIL"
test "$(grep -c "border-warning-bar" "$L")" -ge 1 && echo "pos-L5 (OQ #2 border-warning-bar) PASS" || echo "pos-L5 FAIL"
test "$(grep -c "bg-safe-bg text-safe" "$L")" -ge 1 && echo "pos-L6 (OQ #2 ResultBadge pass + finding resolved) PASS" || echo "pos-L6 FAIL"
test "$(grep -c "bg-warning-bg text-warning" "$L")" -ge 1 && echo "pos-L7 (OQ #2 ResultBadge conditional) PASS" || echo "pos-L7 FAIL"
test "$(grep -c "bg-danger-bg text-danger" "$L")" -ge 1 && echo "pos-L8 (OQ #2 ResultBadge fail + finding open) PASS" || echo "pos-L8 FAIL"
# OQ #3 — text-caption + leading-none ≥10
test "$(grep -c "text-caption" "$L")" -ge 10 && echo "pos-L9 (OQ #3 text-caption >=10) PASS" || echo "pos-L9 FAIL"
test "$(grep -c "leading-none" "$L")" -ge 10 && echo "pos-L10 (OQ #3 leading-none >=10) PASS" || echo "pos-L10 FAIL"
# OQ #4 — 조치 완료 그라데이션 + 작은 도구 solid
test "$(grep -c "linear-gradient(135deg, #1d4ed8, #0ea5e9)" "$L")" -ge 1 && echo "pos-L11 (OQ #4 조치 완료 그라데이션) PASS" || echo "pos-L11 FAIL"
test "$(grep -c "bg-accent" "$L")" -ge 2 && echo "pos-L12 (OQ #4 bg-accent solid >=2) PASS" || echo "pos-L12 FAIL"
# OQ #5 — Lucide 3종
test "$(grep -c "import { ChevronLeft, Camera, Loader2 } from 'lucide-react'" "$L")" -ge 1 && echo "pos-L13 (OQ #5 lucide import 3종) PASS" || echo "pos-L13 FAIL"
test "$(grep -c "<ChevronLeft size={20}" "$L")" -ge 1 && echo "pos-L14 (OQ #5 ChevronLeft usage) PASS" || echo "pos-L14 FAIL"
test "$(grep -c "<Camera size={18}" "$L")" -ge 1 && echo "pos-L15 (OQ #5 Camera usage) PASS" || echo "pos-L15 FAIL"
test "$(grep -c "<Loader2" "$L")" -ge 1 && echo "pos-L16 (OQ #5 Loader2 usage) PASS" || echo "pos-L16 FAIL"
test "$(grep -c "animate-spin" "$L")" -ge 1 && echo "pos-L17 (OQ #5 animate-spin) PASS" || echo "pos-L17 FAIL"

# v0.1.1 토큰 sampling
test "$(grep -c "bg-surface-page" "$L")" -ge 2 && echo "pos-L18 (bg-surface-page 모바일+데스크톱) PASS" || echo "pos-L18 FAIL"
test "$(grep -c "bg-surface-raised" "$L")" -ge 2 && echo "pos-L19 (bg-surface-raised) PASS" || echo "pos-L19 FAIL"
test "$(grep -c "bg-surface-sunken" "$L")" -ge 5 && echo "pos-L20 (bg-surface-sunken >=5) PASS" || echo "pos-L20 FAIL"
test "$(grep -c "text-text-primary" "$L")" -ge 3 && echo "pos-L21 (text-text-primary >=3) PASS" || echo "pos-L21 FAIL"
test "$(grep -c "text-text-secondary" "$L")" -ge 3 && echo "pos-L22 (text-text-secondary >=3) PASS" || echo "pos-L22 FAIL"
test "$(grep -c "text-text-tertiary" "$L")" -ge 5 && echo "pos-L23 (text-text-tertiary >=5) PASS" || echo "pos-L23 FAIL"
test "$(grep -c "rounded-md" "$L")" -ge 3 && echo "pos-L24 (rounded-md >=3) PASS" || echo "pos-L24 FAIL"
test "$(grep -c "rounded-sm" "$L")" -ge 3 && echo "pos-L25 (rounded-sm >=3) PASS" || echo "pos-L25 FAIL"
test "$(grep -c "border-2 border-accent" "$L")" -ge 1 && echo "pos-L26 (border-2 border-accent selected) PASS" || echo "pos-L26 FAIL"
test "$(grep -c "border-l-\[3px\]" "$L")" -ge 1 && echo "pos-L27 (border-l-[3px] borderLeft) PASS" || echo "pos-L27 FAIL"

# ─── ★ 비즈 anchor 17건 보존 ───
echo "=== Biz anchor (LegalPage 17) ==="
# 1~4: useQuery 4종
test "$(grep -c "queryKey: \[.legal-rounds., year\]" "$L")" -ge 1 && echo "anchor-L1 (useQuery legal-rounds) PASS" || echo "anchor-L1 FAIL"
test "$(grep -c "queryKey: \[.legal-round., roundId\]" "$L")" -ge 1 && echo "anchor-L2 (useQuery legal-round) PASS" || echo "anchor-L2 FAIL"
test "$(grep -c "queryKey: \[.legal-findings., roundId\]" "$L")" -ge 1 && echo "anchor-L3 (useQuery legal-findings) PASS" || echo "anchor-L3 FAIL"
test "$(grep -c "queryKey: \[.legal-finding., roundId, findingId\]" "$L")" -ge 1 && echo "anchor-L4 (useQuery legal-finding) PASS" || echo "anchor-L4 FAIL"
test "$(grep -c "staleTime: 30_000" "$L")" -ge 2 && echo "anchor-L5 (staleTime 30_000 >=2) PASS" || echo "anchor-L5 FAIL"
# 5: legalApi 7종
test "$(grep -cE "legalApi\.(list|get|getFindings|updateResult|deleteFinding|getFinding|resolveFinding)" "$L")" -ge 7 && echo "anchor-L6 (legalApi 7종 호출 >=7) PASS" || echo "anchor-L6 FAIL"
# snake_case payload
test "$(grep -c "resolution_memo" "$L")" -ge 1 && echo "anchor-L7 (snake_case resolution_memo) PASS" || echo "anchor-L7 FAIL"
test "$(grep -c "resolution_photo_keys" "$L")" -ge 1 && echo "anchor-L8 (snake_case resolution_photo_keys) PASS" || echo "anchor-L8 FAIL"
test "$(grep -c "report_file_key" "$L")" -ge 1 && echo "anchor-L9 (snake_case report_file_key) PASS" || echo "anchor-L9 FAIL"
# 6: accentColor 4분기
test "$(grep -c "function accentColor" "$L")" -ge 1 && echo "anchor-L10 (accentColor 함수 정의) PASS" || echo "anchor-L10 FAIL"
test "$(grep -c "result === .pass." "$L")" -ge 1 && echo "anchor-L11 (accentColor pass 분기) PASS" || echo "anchor-L11 FAIL"
test "$(grep -c "result === .fail." "$L")" -ge 1 && echo "anchor-L12 (accentColor fail 분기) PASS" || echo "anchor-L12 FAIL"
test "$(grep -c "result === .conditional." "$L")" -ge 1 && echo "anchor-L13 (accentColor conditional 분기) PASS" || echo "anchor-L13 FAIL"
# 7: ResultBadge map 4 라벨
test "$(grep -c "label: .적합." "$L")" -ge 1 && echo "anchor-L14 (ResultBadge 적합) PASS" || echo "anchor-L14 FAIL"
test "$(grep -c "label: .부적합." "$L")" -ge 1 && echo "anchor-L15 (ResultBadge 부적합) PASS" || echo "anchor-L15 FAIL"
test "$(grep -c "label: .조건부적합." "$L")" -ge 1 && echo "anchor-L16 (ResultBadge 조건부적합) PASS" || echo "anchor-L16 FAIL"
test "$(grep -c "결과 미입력" "$L")" -ge 1 && echo "anchor-L17 (ResultBadge fallback 결과 미입력) PASS" || echo "anchor-L17 FAIL"
# 8: filterRounds 3분기
test "$(grep -c "findingCount > resolvedCount" "$L")" -ge 1 && echo "anchor-L18 (filterRounds 미조치) PASS" || echo "anchor-L18 FAIL"
test "$(grep -c "findingCount === resolvedCount" "$L")" -ge 1 && echo "anchor-L19 (filterRounds 완료) PASS" || echo "anchor-L19 FAIL"
# 9: TABS key/label mismatch
test "$(grep -c "key: .미조치., label: .진행 중." "$L")" -ge 1 && echo "anchor-L20 (TABS key=미조치 label=진행 중 mismatch) PASS" || echo "anchor-L20 FAIL"
# 10: sorted findings open-first + localeCompare
test "$(grep -c "a.status === .open. && b.status !== .open." "$L")" -ge 1 && echo "anchor-L21 (sorted open-first) PASS" || echo "anchor-L21 FAIL"
test "$(grep -c "b.createdAt.localeCompare(a.createdAt)" "$L")" -ge 1 && echo "anchor-L22 (sorted localeCompare desc) PASS" || echo "anchor-L22 FAIL"
# 11: handleRoundClick isDesktop 분기
test "$(grep -c "function handleRoundClick" "$L")" -ge 1 && echo "anchor-L23 (handleRoundClick 정의) PASS" || echo "anchor-L23 FAIL"
test "$(grep -c "navigate(.\\/legal\\/. + round.id)" "$L")" -ge 1 && echo "anchor-L24 (handleRoundClick 모바일 navigate) PASS" || echo "anchor-L24 FAIL"
# 12: role admin 도구 분기 2건
test "$(grep -c "role === .admin." "$L")" -ge 1 && echo "anchor-L25 (FindingsPanel admin 분기) PASS" || echo "anchor-L25 FAIL"
test "$(grep -c "staff?.role === .admin." "$L")" -ge 1 && echo "anchor-L26 (FindingDetailPanel admin 분기) PASS" || echo "anchor-L26 FAIL"
# 13: useMultiPhotoUpload
test "$(grep -c "useMultiPhotoUpload()" "$L")" -ge 1 && echo "anchor-L27 (useMultiPhotoUpload hook) PASS" || echo "anchor-L27 FAIL"
# 14: buildMetaTxt + fflate ZIP
test "$(grep -c "buildMetaTxt" "$L")" -ge 1 && echo "anchor-L28 (buildMetaTxt) PASS" || echo "anchor-L28 FAIL"
test "$(grep -c "zipSync" "$L")" -ge 1 && echo "anchor-L29 (fflate zipSync) PASS" || echo "anchor-L29 FAIL"
test "$(grep -c "지적사항_" "$L")" -ge 1 && echo "anchor-L30 (ZIP 파일명 패턴) PASS" || echo "anchor-L30 FAIL"
# 15: @keyframes blink
test "$(grep -c "@keyframes blink" "$L")" -ge 2 && echo "anchor-L31 (@keyframes blink 데스크톱+모바일 2회) PASS" || echo "anchor-L31 FAIL"
test "$(grep -cE "opacity:\.6|opacity:\.3" "$L")" -ge 1 && echo "anchor-L32 (blink .6/.3 Education .4 와 다름) PASS" || echo "anchor-L32 FAIL"
# 16: toast 카피 11종 sampling
test "$(grep -c "점검 결과 저장" "$L")" -ge 1 && echo "anchor-L33 (toast 점검 결과 저장) PASS" || echo "anchor-L33 FAIL"
test "$(grep -c "보고서 업로드 완료" "$L")" -ge 1 && echo "anchor-L34 (toast 보고서 업로드 완료) PASS" || echo "anchor-L34 FAIL"
test "$(grep -c "조치 완료" "$L")" -ge 1 && echo "anchor-L35 (toast/button 조치 완료) PASS" || echo "anchor-L35 FAIL"
test "$(grep -c "다운로드 완료" "$L")" -ge 1 && echo "anchor-L36 (toast 다운로드 완료) PASS" || echo "anchor-L36 FAIL"
test "$(grep -c "조치 처리 실패" "$L")" -ge 1 && echo "anchor-L37 (toast 조치 처리 실패) PASS" || echo "anchor-L37 FAIL"
test "$(grep -c "조치 내용을 입력하세요" "$L")" -ge 1 && echo "anchor-L38 (toast 조치 내용을 입력하세요) PASS" || echo "anchor-L38 FAIL"
# 17: 데스크톱 3분할 500+500+flex 1 + 모바일 헤더
test "$(grep -cE "width:\s*500|w-\[500px\]" "$L")" -ge 2 && echo "anchor-L39 (데스크톱 좌+중 width 500 2건) PASS" || echo "anchor-L39 FAIL"
test "$(grep -c "소방 점검 관리" "$L")" -ge 1 && echo "anchor-L40 (모바일 타이틀 소방 점검 관리) PASS" || echo "anchor-L40 FAIL"

# ─── 카피 verbatim sampling ───
echo "=== Copy verbatim (LegalPage) ==="
test "$(grep -c "지적사항 없음" "$L")" -ge 1 && echo "copy-L1 (FindingsPanel 빈) PASS" || echo "copy-L1 FAIL"
test "$(grep -c "항목을 불러오지 못했습니다" "$L")" -ge 1 && echo "copy-L2 (FindingDetailPanel 빈) PASS" || echo "copy-L2 FAIL"
test "$(grep -c "점검 이력 없음" "$L")" -ge 1 && echo "copy-L3 (데스크톱 좌측 빈) PASS" || echo "copy-L3 FAIL"
test "$(grep -c "불러오기 실패" "$L")" -ge 1 && echo "copy-L4 (데스크톱 오류) PASS" || echo "copy-L4 FAIL"
test "$(grep -c "목록을 불러오지 못했습니다" "$L")" -ge 1 && echo "copy-L5 (모바일 오류) PASS" || echo "copy-L5 FAIL"
test "$(grep -c "소방 점검 관리 이력 없음" "$L")" -ge 1 && echo "copy-L6 (모바일 빈 제목) PASS" || echo "copy-L6 FAIL"
test "$(grep -c "소방 일정 페이지에서 종합정밀 또는 작동기능 점검을 등록하면 여기에 표시됩니다" "$L")" -ge 1 && echo "copy-L7 (모바일 빈 보조) PASS" || echo "copy-L7 FAIL"
test "$(grep -c "좌측에서 점검을 선택하세요" "$L")" -ge 1 && echo "copy-L8 (중앙 fallback) PASS" || echo "copy-L8 FAIL"
test "$(grep -c "중앙에서 지적사항을 선택하세요" "$L")" -ge 1 && echo "copy-L9 (우측 fallback 1) PASS" || echo "copy-L9 FAIL"
test "$(grep -c "점검을 먼저 선택하세요" "$L")" -ge 1 && echo "copy-L10 (우측 fallback 2) PASS" || echo "copy-L10 FAIL"
test "$(grep -c "지적사항 목록" "$L")" -ge 1 && echo "copy-L11 (FindingsPanel 헤더 fallback) PASS" || echo "copy-L11 FAIL"
test "$(grep -c "위치 미지정" "$L")" -ge 1 && echo "copy-L12 (finding 위치 fallback) PASS" || echo "copy-L12 FAIL"

# ─── App.tsx + 외부 8 파일 0 byte 변경 (final verify gate) ───
echo "=== App.tsx + 외부 8 파일 preserve ==="
for f in "$APP" "$API" "$FDL" "$UMP" "$PG" "$PSM" "$FFS" "$LFP" "$LFDP"; do
  WD=$(git diff HEAD -- "$f" 2>/dev/null | wc -l | tr -d " ")
  test "$WD" = "0" && echo "preserve-WD: $f working tree 0 diff PASS" || echo "preserve-WD: $f FAIL ($WD lines)"
done
# 커밋 후 시점
for f in "$APP" "$API" "$FDL" "$UMP" "$PG" "$PSM" "$FFS" "$LFP" "$LFDP"; do
  CD=$(git diff HEAD~ HEAD -- "$f" 2>/dev/null | wc -l | tr -d " ")
  test "$CD" = "0" && echo "preserve-HEAD: $f HEAD~ HEAD 0 diff PASS" || echo "preserve-HEAD: $f ($CD lines, 커밋 전이면 skip)"
done

# ─── Scope (정확히 1 파일 + PLAN/SUMMARY 만) ───
echo "=== Scope ==="
EXTRA=$(git diff --name-only HEAD~ HEAD 2>/dev/null | grep -vE "cha-bio-safety/src/pages/LegalPage\.tsx|^\.planning/quick/260523-lft-")
test -z "$EXTRA" && echo "scope (only LegalPage.tsx + PLAN/SUMMARY) PASS" || echo "scope FAIL — extra: $EXTRA"

# ─── Line count sanity ───
echo "=== Line count ==="
LCL=$(wc -l < "$L" | tr -d " ")
test "$LCL" -ge 540 -a "$LCL" -le 620 && echo "lc-L ($LCL lines, 571 ± 40) PASS" || echo "lc-L FAIL ($LCL lines)"

# ─── Build gate ───
echo "=== Build ==="
(cd cha-bio-safety && npx tsc --noEmit 2>&1 | tail -5)
(cd cha-bio-safety && npm run build 2>&1 | tail -5)
echo "=== LegalPage chunk size ==="
ls -la cha-bio-safety/dist/assets/LegalPage-*.js 2>/dev/null || echo "(LegalPage chunk — lazy chunk 보고)"
    </automated>
  </verify>
  <done>
- LegalPage.tsx 단일 파일 in-place 수정 완료. 라인 수 571 ± 40 (540~620).
- Negative gate 10건 모두 PASS: emoji 0 / linear-gradient = 1 (OQ #4 조치 완료 만) / 9·10·11 fontSize 0 / status- prefix 0 / w-8·h-8 0 / 옛 alias ≤4 (accentColor 함수 안 4분기 예외) / 인라인 SVG path 0 / spin keyframes 0 / IconChevronLeft 0 / polyline 0
- Positive gate 27건 모두 PASS — v0.1.1 토큰 ≥10 + OQ #1 모바일 헤더 + OQ #2 6 토큰 (border-bar 3 + bg/text 3) + OQ #3 text-caption + leading-none ≥10 + OQ #4 그라데이션 + bg-accent ≥2 + OQ #5 Lucide 3종 + animate-spin + 폰트 토큰 + radius 토큰 + border-2 border-accent + border-l-[3px]
- ★ 비즈 anchor 17 카테고리 (40 grep 분해) 모두 PASS: useQuery 4종 + staleTime 30_000 + legalApi 7종 + snake_case payload 3종 + accentColor 4분기 + ResultBadge 4 라벨 + filterRounds 3분기 + TABS mismatch + sorted open-first + localeCompare + handleRoundClick + role admin 2건 + useMultiPhotoUpload + buildMetaTxt + zipSync + ZIP 파일명 + @keyframes blink ≥2 + .6/.3 + toast 11종 sampling + 데스크톱 3분할 width 500 ≥2 + 모바일 타이틀
- 카피 verbatim 12건 모두 PASS
- App.tsx + 외부 8 파일 0 byte 변경 (working tree + 커밋 후 모두)
- Scope: LegalPage.tsx + .planning/quick/260523-lft-*/ 외 파일 변경 0건
- `cd cha-bio-safety && npx tsc --noEmit` 0 errors, `cd cha-bio-safety && npm run build` exit 0, LegalPage chunk size 보고
- Atomic 1-commit (단일 파일 + PLAN/SUMMARY 묶음): `feat(quick-260523-lft): redesign/19-legal TSX 변환 ...`
  </done>
</task>

</tasks>

<verification>
## 전체 PLAN 통과 조건

1. **Negative gate (10건)** — emoji 0 / linear-gradient = 정확히 1 (OQ #4 조치 완료 만, total == OQ #4) / 9·10·11 fontSize 0 / status- prefix 0 / w-8·h-8 0 / 옛 alias var(--bg|bg2|bg3|bg4|bd|bd2|t1|t2|t3|acl|safe|warn|danger) ≤4 (accentColor 함수 정의 안 4분기 예외) / 인라인 SVG path 0 / spin keyframes 0 / IconChevronLeft 0 / polyline 0
2. **Positive gate (27건)** — v0.1.1 토큰 ≥10 + OQ #1 모바일 헤더 + OQ #2 6 토큰 (border-safe-bar + border-danger-bar + border-warning-bar + bg-safe-bg text-safe + bg-warning-bg text-warning + bg-danger-bg text-danger) + OQ #3 text-caption + leading-none ≥10 + OQ #4 그라데이션 ≥1 + bg-accent ≥2 + OQ #5 import Lucide 3종 + ChevronLeft + Camera + Loader2 + animate-spin + 토큰 sampling + border-2 border-accent + border-l-[3px]
3. **★ 비즈 anchor 17 카테고리 (40 grep 분해)** — useQuery 4종 + staleTime 30_000 + legalApi 7종 + snake_case payload 3종 + accentColor 4분기 + ResultBadge 4 라벨 + filterRounds 3분기 + TABS mismatch + sorted open-first + handleRoundClick + role admin 2건 + useMultiPhotoUpload + buildMetaTxt + zipSync + ZIP 파일명 + @keyframes blink ≥2 + .6/.3 + toast 11종 sampling + 데스크톱 3분할 width 500 ≥2 + 모바일 타이틀
4. **카피 verbatim (12건)** — 지적사항 없음 / 항목을 불러오지 못했습니다 / 점검 이력 없음 / 불러오기 실패 / 목록을 불러오지 못했습니다 / 소방 점검 관리 이력 없음 / 소방 일정 페이지에서... / 좌측에서 점검을 선택하세요 / 중앙에서 지적사항을 선택하세요 / 점검을 먼저 선택하세요 / 지적사항 목록 / 위치 미지정
5. **App.tsx + 외부 8 파일 0 byte 변경** (final verify gate)
6. **Scope** — 1 파일 변경 (LegalPage.tsx) + PLAN.md/SUMMARY.md
7. **Build** — `npx tsc --noEmit` 0 errors + `npm run build` exit 0
8. **Atomic 1-commit** — 단일 파일 + PLAN/SUMMARY 묶음 단일 commit
9. **Line count** — 571 ± 40 (540~620)

## 검수 시각 (cbc7119-preview 자동 배포 후, 사용자 컨펌 필수)

- **모바일 viewport (375x812)**:
  - 외곽 `bg-surface-page` (#0a0d12 톤)
  - **★ 모바일 자체 헤더 (OQ #1)** = `bg-surface-raised border-b border-border-default` + height 48 + back button **44x44 격상** + `<ChevronLeft size={20} />` text-text-primary + 타이틀 "소방 점검 관리" `text-body font-bold text-text-primary` center + spacer (right balance)
  - 필터 영역: 탭 3개 (전체 / 진행 중 / 완료) `text-caption font-bold leading-none` + 연도 select `bg-surface-sunken border border-border-strong text-label leading-none rounded-sm`
  - 빈 상태 (OQ #4): "소방 점검 관리 이력 없음" `text-body font-bold text-text-primary` + "소방 일정 페이지에서 종합정밀 또는 작동기능 점검을 등록하면 여기에 표시됩니다." `text-caption leading-relaxed text-text-secondary` (아이콘 무)
  - 오류 상태 (OQ #4): "목록을 불러오지 못했습니다." `text-body-sm text-text-secondary` + 다시 시도 button `bg-accent text-text-on-accent` (그라데이션 아님)
  - 로딩 SKELETON × 3: `bg-surface-sunken rounded-md` + height 72 + animation blink .6/.3
  - **★ 라운드 카드 모바일 (OQ #2)**: `bg-surface-sunken rounded-md border border-border-default border-l-[3px] {border-safe-bar | border-danger-bar | border-warning-bar | border-border-strong}` (accentColor 4분기 status 토큰) + title `text-body-sm font-bold text-text-primary` + ResultBadge + 메타 `· 지적 N건 · 완료 M건` (건 있음, 데스크톱과 다름)
  - **★ ResultBadge (OQ #2 + OQ #3)**: pass `bg-safe-bg text-safe` "적합" / fail `bg-danger-bg text-danger` "부적합" / conditional `bg-warning-bg text-warning` "조건부적합" / null `bg-transparent text-text-tertiary` "결과 미입력" + `text-caption font-bold leading-none rounded-sm`
  - 라운드 카드 tap → /legal/{id} sub-route 네비 (handleRoundClick 모바일 분기)
- **데스크톱 viewport (1280+)**:
  - 외곽 `bg-surface-page` + `flex h-full`
  - **★ 좌측 (라운드 목록) width 500 + `border-r border-border-default`** + 탭 (h 38) + 연도 select + 라운드 카드 (selected `border-2 border-accent`, OQ #3 1.5→2 격상)
  - **★ 중앙 (지적사항 목록) width 500 + `border-r border-border-default`** + FindingsPanel mount + fallback "좌측에서 점검을 선택하세요"
  - **★ 우측 (지적 상세) flex 1** + FindingDetailPanel mount + fallback "중앙에서 지적사항을 선택하세요" / "점검을 먼저 선택하세요" (selectedRoundId 분기)
- **FindingsPanel (데스크톱 중앙, 점검 선택 시)**:
  - 헤더 round?.title fallback "지적사항 목록" `text-body-sm font-bold` + 날짜 `text-caption leading-none text-text-secondary`
  - **admin 도구 (role==="admin" 분기)**: 결과 select (적합/부적합/조건부적합/미입력) + 저장 button `bg-accent text-text-on-accent` solid + 보고서/업로드 button `bg-surface-sunken border border-border-strong`. 모두 `text-caption font-bold leading-none rounded-sm` (OQ #3 격상)
  - **★ finding 카드 (OQ #2 + OQ #3)**: open `border-l-[3px] border-danger-bar` + 칩 `bg-danger-bg text-danger` "미조치" / resolved `border-l-[3px] border-safe-bar` + 칩 `bg-safe-bg text-safe` "완료". selected `border-2 border-accent`
  - 빈 "지적사항 없음" `text-label text-text-tertiary` center
- **FindingDetailPanel (데스크톱 우측, 지적 선택 시)**:
  - **★ Loader2 로딩 (OQ #5)**: `<Loader2 className="animate-spin text-accent" size={24} />` (옛 인라인 spinner 폐기)
  - 헤더 "지적 상세" `text-body-sm font-bold` + admin 다운로드 button `bg-surface-sunken border border-border-strong text-caption font-bold leading-none rounded-sm`
  - 지적 정보 KVRow 4 (지적 내용/위치/등록일/등록자) + 지적 사진 PhotoGrid (또는 "사진 없음")
  - **조치 입력 (open finding)**: 섹션 borderTop `border-t border-border-default` + textarea `bg-surface-sunken border border-border-strong text-label rounded-md` + 사진 슬롯 64x64 + **★ 첨부 button (OQ #5)** `<Camera size={18} />` + "첨부" (옛 카메라 이모지 폐기) + **★★★ 조치 완료 button (OQ #4)** `text-text-on-accent text-label font-bold rounded-md` + 인라인 `background: linear-gradient(135deg, #1d4ed8, #0ea5e9)` + **height 44 (옛 40 격상)**
  - 조치 결과 (resolved finding): KVRow 3 + PhotoGrid
- **공통**:
  - admin 권한: select + 저장 + 보고서 도구 + 다운로드 button 모두 표시
  - assistant 권한: 도구 영역 숨김, 점검 결과 조치만 가능
  - useQuery 4종 동작: legal-rounds / legal-round / legal-findings / legal-finding 캐시 + invalidate 4 키
  - toast 11종 동작 (success 5 + error 6)

## 사용자 컨펌 후 다음 단계

- `main` 머지 (사용자 명시 컨펌 후, memory `feedback_deploy_test`)
- GitHub Actions → cbc7119-preview 자동 배포 (memory `project_cbc7119_design_repo` + `reference_cbc7119_domain` + `feedback_cbc7119_design_never_wrangler`)
- 직원 도메인 (cbc7119) 배포는 별도 worktree (20260328) 담당 (이 워크트리는 절대 다루지 않음, CLAUDE.local.md)
- `project_redesign_19_legal_status` 메모리 박제 (신규) — W1 인덱스 + W2~W5 통합 + lft TSX 변환 모두 main 머지+배포 완결 status
</verification>

<success_criteria>
- [ ] LegalPage.tsx 571 ± 40 lines (540~620), in-place 수정
- [ ] Negative gate 10건 모두 PASS
- [ ] Positive gate 27건 모두 임계치 이상
- [ ] ★ 비즈 anchor 17 카테고리 (40 grep 분해) 모두 PASS
- [ ] 카피 verbatim 12건 모두 PASS
- [ ] App.tsx + 외부 8 파일 0 byte 변경 (working tree + 커밋 후 모두)
- [ ] 다른 파일 변경 0건
- [ ] `cd cha-bio-safety && npx tsc --noEmit` 0 errors
- [ ] `cd cha-bio-safety && npm run build` exit 0
- [ ] Atomic 1-commit (단일 파일 + PLAN/SUMMARY 묶음)
- [ ] OQ #1: `bg-surface-raised border-b border-border-default` ≥1 (모바일 자체 헤더)
- [ ] OQ #2: `border-safe-bar` + `border-danger-bar` + `border-warning-bar` 각 ≥1 (accentColor + round borderLeft) + `bg-safe-bg text-safe` + `bg-warning-bg text-warning` + `bg-danger-bg text-danger` 각 ≥1 (ResultBadge + finding 칩, status- prefix 없음)
- [ ] OQ #3: `text-caption` ≥10 + `leading-none` ≥10 + 9·10·11 fontSize 인라인 0건 + selected `border-2 border-accent` (1.5→2 격상)
- [ ] OQ #4: `linear-gradient(135deg, #1d4ed8, #0ea5e9)` ≥1 (조치 완료 button 예외 anchor) + `bg-accent` ≥2 (admin 저장 + 데스크톱 재시도/모바일 다시 시도, 작은 도구 solid) + 빈/오류 카피 12건 verbatim grep ≥1
- [ ] OQ #5: `import { ChevronLeft, Camera, Loader2 } from 'lucide-react'` ≥1 + `<ChevronLeft size={20}` ≥1 + `<Camera size={18}` ≥1 + `<Loader2` ≥1 + `animate-spin` ≥1 + 카메라 이모지 0 + 인라인 SVG path 0 + spin keyframes 0 + back button 44x44 (w-8 함정 회피)
</success_criteria>

<output>
After completion, create `.planning/quick/260523-lft-redesign-19-legal-tsx-legalpage-tsx-571-/260523-lft-SUMMARY.md` documenting:

- 변환 전후 LegalPage.tsx wc -l (571 → 변환 후 라인 수)
- 적용된 v0.1.1 토큰 className 목록 (grep 카운트 — bg-surface-*/border-border-*/text-text-*/text-caption+label+body+title+heading/font-*/rounded-*/leading-*)
- OQ #1~#5 LOCKED 각 적용 결과 확인:
  - OQ #1: 모바일 헤더 bg-surface-raised border-b border-border-default ≥1
  - OQ #2: accentColor + ResultBadge + finding 칩 + round borderLeft 6 토큰 매트릭스 + status- prefix 없음
  - OQ #3: 9·10·11 fontSize 0 + text-caption + leading-none ≥10 + selected border-2 격상
  - OQ #4: 조치 완료 인라인 그라데이션 ≥1 + 작은 도구 solid bg-accent ≥2 + 빈/오류 카피 12건 verbatim
  - OQ #5: Lucide 3종 (ChevronLeft + Camera + Loader2) 교체 + 인라인 SVG path 0 + spin keyframes 0 + 카메라 이모지 0 + back button 44x44 격상
- ★ 비즈 anchor 17 카테고리 (40 grep 분해) 1 byte 변경 0 검증 결과 (23-education r22 + 28-splash 4i9 + 17-annual-plan SW3 precedent mirror)
- Negative gate (10) + Positive gate (27) + Biz anchor (40) + Copy (12) + Preserve (9 파일 × 2) + Scope + LC + Build PASS 결과 (verify automated 출력 첨부)
- `npm run build` 결과 (LegalPage chunk size 포함)
- atomic commit hash + main 머지 대기 상태 명시
- 다음 단계 (사용자 컨펌 → main 머지 → cbc7119-preview 자동 배포 → `project_redesign_19_legal_status` 메모리 박제 신규)
</output>
