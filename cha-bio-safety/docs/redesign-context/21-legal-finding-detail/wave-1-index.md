---
title: "redesign/21-legal-finding-detail — sketch wave 1 (index)"
status: ready_for_oq
created: 2026-05-25
quick_id: 260525-013
branch: redesign/21-legal-finding-detail (based on redesign/20-legal-findings HEAD or main)
source_tsx: cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
source_tsx_lines: 279
design_system: cha-bio-safety/docs/redesign-context/21-legal-finding-detail/design-system.md (v0.1.1)
chrome_rules: cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md
chrome_apply_mode: "소방 점검 관리 손주-route = 점검 시리즈 직접 적용 케이스 — 단 App.tsx line 117 정규식 `^\\/legal\\/.+/` 매칭으로 showNav=false 특수 케이스 (모바일 BottomNav + 데스크톱 사이드바 + 데스크톱 글로벌 AppHeader 모두 숨김 — 자체 헤더/타이틀이 유일한 chrome) — 각 룰 1줄 메타로 적용/미적용 판정"
mirror_of: "20-legal-findings W1 (260523-rgj) + 19-legal W1 (260522-sa7) + 23-education W1 (260522-gmp) + 28-splash W1 (260522-209) + 17-annual-plan W1 (260521-wmq) + 16-workshift W1 (260521-sjj) + 27-login W1 (260521-c6p) — 7 섹션 + 4 sub-wave 구조 정확히 mirror"
biz_anchor_precedent: "20-legal-findings + 19-legal + 17-annual-plan W1 의 비즈 anchor 1 byte 변경 0 룰 일반화"
sub_wave_count: 4
memory_rules_inline: 12
open_questions: 5
---

# redesign/21-legal-finding-detail — sketch wave 1 (index)

본 문서는 W2~W5 진입의 단일 진입점이며, 이 인덱스만 봐도 후속 wave 가 디자인 룰 / 메모리 룰 / sub-wave 분배 / OQ 를 알 수 있도록 한다.

- **산출일자**: 2026-05-25
- **Quick ID**: 260525-013
- **branch**: redesign/21-legal-finding-detail

**1줄 메타**: 20-legal-findings W1 (260523-rgj) + 19-legal W1 (260522-sa7) + 23-education W1 (260522-gmp) + 28-splash W1 (260522-209) + 17-annual-plan W1 (260521-wmq) + 16-workshift W1 (260521-sjj) + 27-login W1 (260521-c6p) 의 7 섹션 + 4 sub-wave 구조를 정확히 mirror. **LegalFindingDetailPage 가 279 lines 단일 export** — 20-legal-findings 와 동일 평면 구조. 모바일/데스크톱 useIsDesktop 분기 + 데스크톱 maxWidth 700 중앙 정렬 + 모바일 고정 하단 CTA (status open 한정) — **4 sub-wave (W2~W5) 채택**. **19/20-legal 과 차이 (5건)**: (1) 단일 finding 페이지 (지적사항 1건의 상세 + 조치 처리 전용), (2) resolution form 풀 페이지 — 사진 5장 useMultiPhotoUpload **직접 사용** (20-legal-findings 가 FindingFormSheet 우회한 것과 다름), (3) 조치 완료 button 풀폭 CTA 그라데이션 후보 (메인 액션 — addButton 류와 같은 §6.4 후보), (4) admin ZIP 다운로드 단일 finding 기반 — **파일명 location 기반 `지적사항_${name}.zip`** (20-legal-findings 의 round.title 기반과 다름), (5) status open/resolved 분기로 화면 모드 자체가 바뀜 (open = textarea + 사진 슬롯 + CTA / resolved = 결과 KVRow 3행 + PhotoGrid).

---

# §1. LegalFindingDetailPage.tsx 인벤토리

LegalFindingDetailPage.tsx (**279 lines, 실측**) 의 element 를 3 영역으로 나눠 표로 정리.

**LegalFindingDetailPage 의 구조 특이성** (인벤토리 머리말):

- **모바일/데스크톱 분기** via `useIsDesktop()` (line 6 import, line 142 호출, ≥768px). 데스크톱은 maxWidth 700 중앙 정렬 (**20-legal-findings 의 800 보다 더 좁음** — 단일 finding 상세 페이지 특성, 19-legal LegalPage 의 FindingDetailPanel 마스터-디테일 우측 영역과 폭 유사).
- **단일 export 279 lines** — 내부 panel/컴포넌트 0건 (20-legal-findings 와 동일 평면 구조). 20-legal-findings LegalFindingsPage 의 손주-route 페이지로, **finding 카드 클릭 시 navigate(`/legal/${id}/finding/${fid}`) 로 진입하는 단일 지적사항 상세 + 조치 처리 페이지** (App.tsx line 291).
- **`/legal/:id/finding/:fid` 는 글로벌 chrome 모두 숨김** — App.tsx line 117 정규식 `!location.pathname.match(/^\/legal\/.+/)` 매칭으로 `showNav=false` → 모바일 BottomNav + 데스크톱 사이드바 + 데스크톱 글로벌 AppHeader 모두 숨김. 자체 헤더 (모바일 line 149~165 / 데스크톱 line 168~177) 가 유일한 외곽 chrome. **20-legal-findings LegalFindingsPage 와 동일 chrome 모드** (모두 line 117 정규식 cover).
- **finding.status 분기로 화면 모드 자체가 바뀜** (line 218 open / line 253 resolved). open = Section 3 (조치 내용 입력 textarea + 사진 5장 슬롯 useMultiPhotoUpload + 데스크톱 인라인 CTA / 모바일 고정 하단 CTA). resolved = Section 4 (조치 결과 KVRow 3행 — 조치일시 / 조치자 / 조치 내용 + 조치 사진 PhotoGrid). **2 모드 매트릭스 = W4 sketch 핵심** (open form vs resolved 결과). 19-legal LegalPage 의 FindingDetailPanel 안 동일 분기 패턴과 일관, 단 본 페이지는 풀 페이지 단독 (분할 X).
- **role admin 다운로드 button 분기** (모바일 line 159 `staff?.role === 'admin' && finding` 조건부, 데스크톱 line 171 동일 조건). admin 만 ZIP 다운로드 button 표시. assistant 는 다운로드 button 미렌더 — finding 정보/사진 + 조치 입력/완료 + 조치 결과는 모두 표시.
- **모바일은 자체 헤더 렌더** (line 149~165) — height 48 / bg `rgba(22,27,34,0.97)` (raised 변형 alpha — 19-legal + 20-legal-findings + 23-education 일관) / borderBottom 1px / back button **36x36 (position absolute left 12)** + admin 다운로드 button **36x36 (position absolute right 12)**. 디자인 §1.1 터치 마지노선 44px 미달 — OQ #5 검토 후보 (Lucide ChevronLeft + Download 교체 + 사이즈 44x44 격상). 타이틀 = '지적 상세' 16/700 정중앙 (단순 문자열, 20-legal-findings 의 동적 분기와 다름).
- **데스크톱 타이틀 + admin 다운로드 button** (line 168~177) — padding '24px 32px 12px' flex space-between. 좌측 '지적 상세' 22/800 (정적). 우측 admin 다운로드 button (13/700 h 36 bg var(--bg3) border 1px var(--bd2) padding '0 16px' borderRadius 8) — 모바일과 다른 텍스트 button 패턴 ('다운로드' / '다운로드 중...').
- **모바일 고정 하단 CTA (status open 한정)** (line 270~275) — position fixed bottom 0 / button width 100% height 48 bg var(--acl) color #fff 14/700 borderRadius 12 — '조치 완료' verbatim. paddingBottom 'calc(12px + var(--sab, 0px))' iOS safe-area. 콘텐츠 영역 paddingBottom 'calc(72px + var(--sab, 0px))' 로 카드 영역이 가려지지 않게 회피 (open 한정 — resolved 는 paddingBottom 24).
- **데스크톱 조치 완료 CTA (status open 한정)** (line 244~248) — Section 3 안 인라인 button width 100% height 48 — 모바일 고정 하단 CTA 와 동일 스타일. 데스크톱은 고정 하단 패턴 없음 (콘텐츠 안 inline CTA).
- **ZIP 단일 finding 다운로드 (admin 전용)** (line 89~130 + 모바일/데스크톱 헤더 button) — fflate `zipSync` 동적 import + buildMetaTxt → 내용.txt + photoKeys '지적사진-{N}.jpg' + resolutionPhotoKeys '조치사진-{N}.jpg' + **파일명 `지적사항_${name}.zip` (line 119) — name = location 안전화** (20-legal-findings 의 round.title 기반과 다르고, fid 기반도 아님 — **본 페이지 = location 기반**). iOS PWA `<a download>` 다운로드 패턴 (createElement + body.appendChild + click + removeChild + setTimeout(URL.revokeObjectURL, 3000)) — 1 byte 변경 금지. 19-legal LegalPage 의 FindingDetailPanel 단일 다운로드 패턴 일치 (location 기반), 20-legal-findings 의 전체 findings 일괄 다운로드 (round.title 기반) 와 다름.
- **사진 5장 useMultiPhotoUpload 직접 사용** (line 59) — resolutionPhotos = useMultiPhotoUpload(). slots / canAdd / openPicker / pickCamera / pickAlbum / handleFiles / removeSlot / uploadAll / reset / isUploading / cameraRef / albumRef / showPicker / closePicker 모두 직접 호출. 20-legal-findings 가 FindingFormSheet 우회한 것과 다른 패턴 — **본 페이지는 풀 페이지 직접 form 통합**.
- **resolveMutation async pattern** (line 67~87) — mutationFn 안에서 photoKeys = await resolutionPhotos.uploadAll() **먼저 실행** 후 legalApi.resolveFinding 호출. onSuccess 에서 4 키 invalidate (`['legal-finding', id, fid]` + `['legal-findings', id]` + `['legal-rounds']` + `['legal-round', id]`) + resolutionPhotos.reset() + navigate(-1). **비즈 anchor — uploadAll 선행 + 4 키 invalidate + navigate(-1)** 1 byte 변경 금지.
- **인라인 keyframes 1종 중복 정의** — `@keyframes spin{to{transform:rotate(360deg)}}` (line 45 Spinner 함수 내부) + (line 147 JSX 외곽 인라인) — 두 곳 모두 동일 정의. 1 byte 변경 금지.
- **에러 상태 verbatim** (line 185): '항목을 불러오지 못했습니다. 뒤로 가서 다시 시도하세요.' (14 var(--t2)) — 20-legal-findings 의 '화면을 당겨서 다시 시도하세요.' 와 다름 (본 페이지는 navigate(-1) 권장 카피).
- **toast 카피 verbatim** — success 2 ('조치 완료' / '다운로드 완료') + error 3 ('조치 처리 실패' / '조치 내용을 입력하세요' / '다운로드 실패'). 총 5건 (20-legal-findings 의 8건 보다 적음).
- **KVRow + SectionHeader 컴포넌트 패턴** (line 22~38) — finding 정보 4행 (지적 내용 / 위치 / 등록일 / 등록자) + 조치 결과 3행 (조치일시 / 조치자 / 조치 내용) 모두 KVRow 사용. label width 64 flexShrink 0 + children flex 1. **19-legal LegalPage 의 FindingDetailPanel 안 KVRow 패턴과 동일** (재사용 가능 컴포넌트). SectionHeader 12/700 var(--t3) marginBottom 10.
- **finding status 칩 본 페이지 없음** — 20-legal-findings 의 '미조치/완료' 칩 + borderLeft 2px 분기 패턴이 본 페이지에는 없음 (단일 finding 상세 → status 표시는 화면 모드 자체로 표현 — open 이면 form / resolved 면 결과). **OQ #2 검토 — status 표시 추가 여부** (페이지 헤더 또는 SectionHeader 근처 칩).

## §1.1 영역별 인벤토리 표

### 영역 1 — 상단 imports / fmtDate / KVRow / SectionHeader / Spinner (line 1~50)

| 영역 | element | source line | 역할 | 비즈 로직 연결 | 후속 wave 매핑 |
|---|---|---|---|---|---|
| 1 | imports 12종 | 1~12 | useState / useParams+useNavigate / useQuery+useMutation+useQueryClient / toast / legalApi / useIsDesktop / useMultiPhotoUpload / PhotoGrid / PhotoSourceModal / useAuthStore / buildMetaTxt / type LegalFinding | react-query/react-router/zustand/react-hot-toast 의존성 + Lucide-react 미import (OQ #5 LOCKED 시 추가) | W5 lucide-react import 추가 verify (OQ #5) |
| 1 | fmtDate | 15~19 | iso 포맷터 — null → '-' / `${y}.${m}.${d} ${HH}:${mm}` zero-padded (분까지 표시) | 등록일/조치일시 KVRow 출력 | W3 finding 정보 KVRow / W4 조치 결과 KVRow 인용 |
| 1 | KVRow({label,children}) | 22~29 | flex gap 12 alignItems flex-start + label 12 var(--t3) width 64 flexShrink 0 + children 14 var(--t1) flex 1 lineHeight 1.5 | finding 정보 4행 + 조치 결과 3행 출력 | W3 + W4 sketch 핵심 컴포넌트, 1 byte 변경 금지 |
| 1 | SectionHeader({children}) | 32~38 | 12 fontWeight 700 var(--t3) marginBottom 10 | Section 1/2/3/4 라벨 출력 | W3 + W4 sketch 라벨 패턴, 1 byte 변경 금지 |
| 1 | Spinner() | 41~48 | flex 1 alignItems center justifyContent center + 28x28 border 2px var(--bd2) borderTopColor var(--acl) borderRadius 50% animation `spin .7s linear infinite` + 인라인 `@keyframes spin{to{transform:rotate(360deg)}}` | isLoading 시 콘텐츠 영역 자리에 표시 | W2 sketch Spinner 영역 + W5 OQ #5 LOCKED 시 Lucide Loader2 size={24} animate-spin 교체 + 함수 line 41~48 폐기 |

### 영역 2 — 메인 페이지 LegalFindingDetailPage 함수 (line 51~144)

| 영역 | element | source line | 역할 | 비즈 로직 연결 | 후속 wave 매핑 |
|---|---|---|---|---|---|
| 2 | useParams { id, fid } + useNavigate + useQueryClient | 52~54 | 손주-route id+fid 추출 + navigate(-1) 뒤로가기 + 4 키 invalidate 도구 | react-router-dom + react-query | 비즈 anchor (시그니처 보존) |
| 2 | state — memo / downloading | 56~57 | 조치 내용 textarea + admin ZIP 다운로드 중 | textarea controlled + admin button disabled | W4 textarea controlled state |
| 2 | staff = useAuthStore(s => s.staff) | 58 | role 분기 (admin/assistant) — selector 패턴 (20-legal-findings 의 getState() 와 다름) | 다운로드 button 조건부 렌더 | W2 + W4 admin 매트릭스 분기 anchor |
| 2 | resolutionPhotos = useMultiPhotoUpload() | 59 | 사진 5장 슬롯 풀 컨트롤 — **본 페이지 직접 사용** (FindingFormSheet 우회 X) | resolveMutation uploadAll + 슬롯 UI + PhotoSourceModal | W4 사진 슬롯 핵심 비즈 anchor |
| 2 | useQuery × 1 | 61~65 | `['legal-finding', id, fid]` → legalApi.getFinding(id!, fid!), enabled !!id && !!fid | finding 단일 fetch | W3 finding 정보/사진 source, W4 조치 결과 source |
| 2 | useMutation × 1 (resolveMutation) | 67~87 | mutationFn async: uploadAll → resolveFinding(id!, fid!, snake_case payload). onSuccess: 4 키 invalidate + toast.success '조치 완료' + reset() + navigate(-1). onError: toast.error '조치 처리 실패' | uploadAll 선행 + 4 키 invalidate + navigate(-1) **순서 보존** | W4 조치 완료 비즈 anchor (1 byte 변경 금지) |
| 2 | handleDownload (async) | 89~130 | fflate zipSync 동적 import + buildMetaTxt + photoKeys/resolutionPhotoKeys Promise.allSettled + iOS PWA `<a download>` + setTimeout(URL.revokeObjectURL, 3000). **파일명 `지적사항_${name}.zip` (line 119) — name = location 안전화** | admin 전용 ZIP 다운로드 | W2 + W4 admin 다운로드 button 비즈 anchor (1 byte 변경 금지) |
| 2 | handleResolve | 132~138 | memo.trim() 빈 값 → toast.error '조치 내용을 입력하세요' return / 아니면 resolveMutation.mutate() | validation gate | W4 조치 완료 button onClick anchor |
| 2 | isSubmitting | 140 | resolveMutation.isPending \|\| resolutionPhotos.isUploading | CTA disabled + opacity 0.5 + cursor not-allowed | W2 + W4 CTA disabled 매트릭스 anchor |
| 2 | isDesktop = useIsDesktop() | 142 | ≥768px 분기 | 모바일 헤더 / 데스크톱 타이틀 / 콘텐츠 padding / CTA 위치 / maxWidth 분기 5+ | 전체 wave 데스크톱/모바일 매트릭스 anchor |
| 2 | sectionPad | 143 | `isDesktop ? '20px 32px' : '20px 16px'` | Section 1~4 padding 공통 | W3 + W4 Section 외곽 padding anchor |

### 영역 3 — JSX render (line 145~278)

| 영역 | element | source line | 역할 | 비즈 로직 연결 | 후속 wave 매핑 |
|---|---|---|---|---|---|
| 3 | 외곽 div | 146 | flex 1 display flex flexDirection column background var(--bg) height 100% overflow hidden | 페이지 컨테이너 | W2 외곽 chrome |
| 3 | 인라인 `<style>` @keyframes spin | 147 | `@keyframes spin{to{transform:rotate(360deg)}}` 중복 정의 (Spinner 함수 내부에도 동일) | Spinner animation | W2 sketch — OQ #5 LOCKED Lucide Loader2 시 양쪽 폐기 |
| 3 | 모바일 헤더 (`!isDesktop`) | 149~165 | h 48 bg `rgba(22,27,34,0.97)` (raised alpha) borderBottom 1px var(--bd) flex center relative flexShrink 0 | 모바일 chrome (line 117 정규식으로 BottomNav 숨김 → 자체 헤더만) | W2 모바일 chrome sketch |
| 3 | back button (모바일) | 155~157 | position absolute left 12 **w 36 h 36** + 인라인 SVG ChevronLeft (w 20 h 20 strokeWidth 2 path `M15 19l-7-7 7-7`) | navigate(-1) | W2 + OQ #5 Lucide ChevronLeft size={20} + 44x44 격상 |
| 3 | 타이틀 (모바일) | 158 | '지적 상세' 16/700 var(--t1) verbatim | 정적 카피 | W2 카피 verbatim |
| 3 | admin 다운로드 button (모바일, `staff?.role === 'admin' && finding`) | 159~163 | position absolute right 12 **w 36 h 36** + 인라인 SVG Download (w 18 h 18 path `M12 5v14m0 0l-6-6m6 6l6-6M5 19h14`) + downloading opacity 0.5 + cursor not-allowed | handleDownload | W2 + W4 admin 매트릭스 + OQ #5 Lucide Download size={18} + 44x44 격상 |
| 3 | 데스크톱 타이틀 영역 (`isDesktop`) | 168~177 | padding '24px 32px 12px' flex space-between flexShrink 0 | 데스크톱 chrome (글로벌 AppHeader 숨김 → 자체 타이틀만) | W2 데스크톱 chrome sketch |
| 3 | 타이틀 (데스크톱) | 170 | '지적 상세' 22/800 var(--t1) verbatim — 정적 | 정적 카피 | W2 카피 verbatim |
| 3 | admin 다운로드 button (데스크톱, 동일 조건) | 171~175 | 13/700 height 36 bg var(--bg3) borderRadius 8 padding '0 16px' border 1px var(--bd2) color var(--t1). 텍스트 '다운로드' / '다운로드 중...' (downloading) | handleDownload | W2 + W4 admin 매트릭스, 모바일과 다른 텍스트형 |
| 3 | Spinner (isLoading) | 180 | 영역 1 Spinner 함수 호출 | isLoading state | W2 로딩 sketch |
| 3 | 에러 fallback (error && !isLoading) | 183~187 | flex 1 alignItems center padding '0 24px' 14 var(--t2) — '항목을 불러오지 못했습니다. 뒤로 가서 다시 시도하세요.' verbatim | error state | W2 에러 sketch |
| 3 | 콘텐츠 영역 외곽 (!isLoading && !error && finding) | 190~195 | flex 1 overflowY auto paddingBottom (open mobile `calc(72px + var(--sab, 0px))` / open desktop 24 / resolved 양쪽 24) maxWidth (isDesktop ? 700 : undefined) | finding 데이터 조건부 | W3 + W4 분기 anchor — open/resolved + 모바일/데스크톱 paddingBottom |
| 3 | Section 1: 지적 정보 | 197~205 | padding sectionPad borderBottom 1px var(--bd) + SectionHeader '지적 정보' + KVRow 4행 (지적 내용 — whiteSpace pre-wrap / 위치 ?? '-' / 등록일 fmtDate / 등록자 createdByName ?? createdBy) + 내부 flex column gap 8 | finding read | W3 핵심 sketch |
| 3 | Section 2: 지적 사진 | 208~215 | padding sectionPad borderBottom + SectionHeader '지적 사진' + photoKeys length > 0 → PhotoGrid (photoUrls map '/api/uploads/'+k) marginTop 8 / else '사진 없음' 13 var(--t3) marginTop 8 | finding.photoKeys | W3 PhotoGrid + 빈 상태 sketch |
| 3 | Section 3: 조치 내용 입력 (status open) | 218~250 | padding sectionPad borderBottom + SectionHeader '조치 내용' + textarea (memo / setMemo / placeholder '조치 내용을 입력하세요' / rows 3 / bg var(--bg3) borderRadius 9 padding '10px 12px' border 1px var(--bd2) color var(--t1) fs 13 boxSizing border-box fontFamily inherit lh 1.5 resize vertical outline none) + 조치 사진 영역 (marginTop 12, 라벨 '조치 사진 (최대 5장)' 12/700 var(--t3) marginBottom 6, input cameraRef + albumRef hidden + PhotoSourceModal + 슬롯 매핑 flex gap 8 overflowX auto paddingBottom 4 — img 72x72 br 10 + 제거 button (-6,-6) 20x20 br 50% bg var(--danger) color #fff 11/700 '✕' + uploading overlay inset 0 bg rgba(0,0,0,0.4) br 10 10 #fff '업로드 중', canAdd 72x72 br 10 bg var(--bg3) border 1px dashed var(--bd2) color var(--t3) 11/600 + '📷' fs 22 + '사진 첨부') + 데스크톱 inline CTA (isDesktop 조건, marginTop 16 w 100% h 48 bg var(--acl) #fff 14/700 br 12 — '조치 완료' / '처리 중...') | resolutionPhotos 직접 사용 + handleResolve | W4 핵심 sketch — 매트릭스 다중 (모드 / 사진 슬롯 상태 5종 / 데스크톱 CTA) |
| 3 | Section 4: 조치 결과 (status resolved) | 253~265 | padding sectionPad borderBottom + SectionHeader '조치 결과' + KVRow 3행 (조치일시 fmtDate(resolvedAt) / 조치자 resolvedByName ?? resolvedBy ?? '-' / 조치 내용 resolutionMemo ?? '-' whiteSpace pre-wrap) + 내부 flex column gap 8 + resolutionPhotoKeys length > 0 → marginTop 12 PhotoGrid | finding.status === 'resolved' read | W4 핵심 sketch (resolved 결과 모드) |
| 3 | 모바일 고정 하단 CTA (status open, !isDesktop && !isLoading && !error && finding && finding.status === 'open') | 270~275 | position fixed bottom 0 left 0 right 0 bg var(--bg) borderTop 1px var(--bd) padding '12px 16px' paddingBottom 'calc(12px + var(--sab, 0px))' + button w 100% h 48 bg var(--acl) #fff 14/700 br 12 transition 'opacity 0.15s' — '조치 완료' / '처리 중...' (isSubmitting) | handleResolve | W2 + W4 매트릭스 (open 한정 영역) |

## §1.2 line 수 실측 확인

```
$ wc -l cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
     279 cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
```

PLAN 추정치 (279 lines) 일치, **drift 없음**.

## §1.3 비즈 시그니처 보존 anchor (별도 박스)

W5 TSX 변환 wave 에서 다음 식별자/값은 **1 byte 변경 금지** (20-legal-findings W1 의 비즈 anchor 보존 룰 + 19-legal W1 의 비즈 anchor 보존 룰 일반화):

```
[LegalFindingDetailPage.tsx — react-query / 비즈 시그니처]
- useQuery({ queryKey: ['legal-finding', id, fid], queryFn: () => legalApi.getFinding(id!, fid!), enabled: !!id && !!fid })  (변경 금지)
- useMutation({ mutationFn: async () => { const photoKeys = await resolutionPhotos.uploadAll(); return legalApi.resolveFinding(id!, fid!, { resolution_memo: memo.trim(), resolution_photo_keys: photoKeys.length > 0 ? photoKeys : undefined }) }, ... })  (uploadAll 선행 + photoKeys.length > 0 분기 + snake_case payload 변경 금지)
- queryClient.invalidateQueries — ['legal-finding', id, fid] + ['legal-findings', id] + ['legal-rounds'] + ['legal-round', id] 4 키 (onSuccess 마다 정확한 4 키 invalidate 필수)
- onSuccess: invalidate 4 키 + toast.success '조치 완료' + resolutionPhotos.reset() + navigate(-1)  (순서 보존)
- onError: toast.error '조치 처리 실패'  (변경 금지)

[utils/api.ts — legalApi 2종 시그니처]
- legalApi.getFinding(roundId: string, findingId: string): Promise<LegalFinding>                                              (변경 금지)
- legalApi.resolveFinding(roundId, findingId, { resolution_memo?: string; resolution_photo_keys?: string[] }): Promise<void>  (snake_case payload 변경 금지)
(주의: legalApi.list / get / getFindings / updateResult / deleteFinding 5종은 LegalFindingDetailPage 미사용 — 19-legal LegalPage / 20-legal-findings LegalFindingsPage 가 각각 사용)

[LegalFindingDetailPage.tsx — 비즈 로직 함수]
- fmtDate(iso): null → '-' / `${y}.${m}.${d} ${HH}:${mm}` zero-padded (분까지 표시 — 20-legal-findings 의 일까지만 표시와 다름)  (변경 금지)
- handleResolve: memo.trim() 빈 값 toast.error '조치 내용을 입력하세요' return / 아니면 resolveMutation.mutate()  (validation 보존)
- handleDownload: fflate zipSync + buildMetaTxt + Promise.allSettled photoKeys/resolutionPhotoKeys + iOS PWA `<a download>` 패턴 + setTimeout(URL.revokeObjectURL, 3000)  (변경 금지)
- 파일명 `지적사항_${name}.zip` (line 119) where name = (finding.location ?? '위치없음').replace(/[\/\\:*?"<>|]/g, '_')  (변경 금지 — **location 기반**, 20-legal-findings round.title 기반과 다름)
- 사진 파일명: `지적사진-${j+1}.jpg` / `조치사진-${j+1}.jpg`  (변경 금지)
- 내용.txt: encoder.encode(buildMetaTxt(finding)) — **사진 0건이어도 always 포함**  (변경 금지)
- iOS PWA `<a download>` + setTimeout(URL.revokeObjectURL, 3000)  (변경 금지 — iOS 안정성 검증된 패턴)

[LegalFindingDetailPage.tsx — finding.status 분기 시그니처 (memory project_inspection_completion_rule 일반화)]
- finding.status === 'open' → Section 3 (조치 내용 textarea + 사진 5장 슬롯 + 데스크톱 inline CTA + 모바일 고정 하단 CTA) 렌더  (변경 금지)
- finding.status === 'resolved' → Section 4 (조치 결과 KVRow 3행 + 조치 사진 PhotoGrid) 렌더  (변경 금지)
- 두 모드 mutually exclusive (open && resolved 양쪽 동시 렌더 불가) — UI/시안에서 분기 변경 금지
- paddingBottom 분기: open 모바일 'calc(72px + var(--sab, 0px))' (고정 CTA 회피) / open 데스크톱 24 / resolved 양쪽 24  (변경 금지)

[LegalFindingDetailPage.tsx — role admin 시그니처 (memory project_inspection_completion_rule 일반화)]
- staff = useAuthStore(s => s.staff) (selector 패턴 — 20-legal-findings 의 getState() 와 다름)  (변경 금지)
- 모바일 헤더 admin 다운로드 button 조건부 (line 159 `staff?.role === 'admin' && finding`)  (변경 금지)
- 데스크톱 타이틀 admin 다운로드 button 조건부 (line 171 동일 조건)  (변경 금지)
- assistant: 다운로드 button 미렌더, 조치 입력/완료/결과는 모두 표시  (변경 금지)

[LegalFindingDetailPage.tsx — useMultiPhotoUpload 직접 사용 시그니처]
- resolutionPhotos = useMultiPhotoUpload() (line 59) — 본 페이지가 훅 직접 사용 (FindingFormSheet 우회 X)  (변경 금지)
- slots / canAdd / openPicker / closePicker / pickCamera / pickAlbum / handleFiles / removeSlot / uploadAll / reset / isUploading / cameraRef / albumRef / showPicker 모두 직접 호출 (시그니처 변경 금지)
- 사진 슬롯 UI: 72x72 borderRadius 10 + 제거 button (-6,-6) 20x20 + uploading overlay rgba(0,0,0,0.4) + canAdd '📷 사진 첨부' (fontSize 22)  (변경 금지)
- input cameraRef accept 'image/*' capture 'environment' + albumRef accept 'image/*' multiple — hidden  (변경 금지)
- PhotoSourceModal {open: showPicker, onClose: closePicker, onCamera: pickCamera, onAlbum: pickAlbum}  (변경 금지)

[LegalFindingDetailPage.tsx — toast / 카피 / 자산 / animation]
- toast.success: '조치 완료' (line 80, resolveMutation onSuccess)                                (변경 금지)
- toast.success: '다운로드 완료' (line 124, handleDownload)                                       (변경 금지)
- toast.error: '조치 처리 실패' (line 85, resolveMutation onError)                                (변경 금지)
- toast.error: '조치 내용을 입력하세요' (line 134, handleResolve validation)                      (변경 금지)
- toast.error: '다운로드 실패' (line 126, handleDownload catch)                                   (변경 금지)
- 모바일 + 데스크톱 헤더 타이틀 '지적 상세' (line 158 16/700 / line 170 22/800)  verbatim          (변경 금지)
- 에러 verbatim: '항목을 불러오지 못했습니다. 뒤로 가서 다시 시도하세요.' (line 185, 14 var(--t2))   (변경 금지)
- 사진 없음 verbatim: '사진 없음' (line 213, 13 var(--t3))                                        (변경 금지)
- 조치 사진 라벨 verbatim: '조치 사진 (최대 5장)' (line 223, 12/700 var(--t3))                    (변경 금지)
- textarea placeholder verbatim: '조치 내용을 입력하세요' (line 221)                              (변경 금지)
- canAdd button 카피 verbatim: '사진 첨부' (line 237, 📷 fontSize 22 + 11/600 var(--t3))         (변경 금지)
- 슬롯 제거 button verbatim: '✕' (line 231, 11/700 #fff bg var(--danger) 20x20)                  (변경 금지)
- 슬롯 업로드 중 verbatim: '업로드 중' (line 232, 10 #fff bg rgba(0,0,0,0.4))                    (변경 금지)
- CTA button verbatim: '조치 완료' / '처리 중...' (isSubmitting) (line 246, 273, 14/700 #fff bg var(--acl) h 48 borderRadius 12)  (변경 금지)
- 모바일 데스크톱 admin 다운로드 button verbatim: 데스크톱 '다운로드' / '다운로드 중...' (line 173) / 모바일 SVG icon (line 161)  (변경 금지)
- @keyframes spin (line 45 Spinner / line 147 JSX 외곽, 동일 정의 중복): `to{transform:rotate(360deg)}`  (변경 금지)
- 모바일 헤더 height 48 + back button 36x36 (position absolute left 12, **§1.1 터치 마지노선 44px 미달** — OQ #5 LOCKED 시 44x44 격상) + admin 다운로드 button 36x36 (position absolute right 12) + 타이틀 정중앙  (현 상태 박제, 격상은 OQ)
- 데스크톱 타이틀 padding '24px 32px 12px' + 좌측 '지적 상세' 22/800 + 우측 admin 다운로드 button (13/700 h 36 bg var(--bg3) border 1px var(--bd2) padding '0 16px' borderRadius 8)
- 콘텐츠 영역 padding sectionPad (`isDesktop ? '20px 32px' : '20px 16px'`) borderBottom 1px solid var(--bd) 각 Section
- 모바일 고정 하단 CTA (open 한정): position fixed bottom 0 padding '12px 16px' paddingBottom 'calc(12px + var(--sab, 0px))' — button width 100% h 48 transition 'opacity 0.15s'
- 데스크톱 inline CTA (open 한정, Section 3 안): marginTop 16 width 100% h 48 bg var(--acl) — 모바일 고정 하단 CTA 와 동일 스타일, 위치만 다름
- 사진 슬롯: 72x72 (img + canAdd 동일) + 제거 button (-6,-6) 20x20 + uploading overlay
- textarea: width 100% bg var(--bg3) borderRadius 9 padding '10px 12px' border 1px solid var(--bd2) color var(--t1) fontSize 13 boxSizing border-box fontFamily inherit lineHeight 1.5 resize vertical outline none
- 콘텐츠 영역 maxWidth 700 데스크톱 (중앙 정렬용 — 20-legal-findings 800 보다 좁음)
- 콘텐츠 영역 paddingBottom: open 모바일 'calc(72px + var(--sab, 0px))' / open 데스크톱 24 / resolved 양쪽 24
- KVRow label width 64 flexShrink 0 + children flex 1 lineHeight 1.5 + gap 12 alignItems flex-start
- SectionHeader 12/700 var(--t3) marginBottom 10
- Spinner div 28x28 border 2px var(--bd2) borderTopColor var(--acl) borderRadius 50% (Lucide Loader2 교체 후보)
- PhotoGrid / PhotoSourceModal (변경 금지)

[App.tsx — chrome 실측 (line 37, 71, 74, 77, 79~104, 117, 291)]
- line 37: const LegalFindingDetailPage  = lazy(() => import('./pages/LegalFindingDetailPage'))  (실측 변경 금지)
- line 71: MOBILE_NO_NAV_PATHS = ['/', '/login', '/schedule', '/reports', '/workshift', '/leave', '/floorplan', '/div', '/qr-print', '/daily-report', '/worklog', '/meal', '/education', '/legal', '/elevator/findings', '/annual-plan']  (`/legal/:id/finding/:fid` 명시 미등재 — 정규식 line 117 cover)  (변경 금지)
- line 74: DESKTOP_NO_NAV_PATHS = ['/', '/login']                                                 (`/legal/:id/finding/:fid` 미등재 — 정규식 line 117 cover)  (변경 금지)
- line 77: DESKTOP_HEADER_HIDE_PATHS = ['/elevator', '/div', '/floorplan', '/workshift']         (`/legal/:id/finding/:fid` 미등재 — 정규식 line 117 cover)  (변경 금지)
- line 79~104: PAGE_TITLES Record — `/legal/:id/finding/:fid` **미등재** (오직 line 98 `'/legal': '소방 점검 관리'`만 있음). line 133 `pageTitle = PAGE_TITLES[location.pathname] || ''` → 빈 문자열 (showNav=false 라 영향 없음)  (변경 금지)
- line 117: `!location.pathname.match(/^\/legal\/.+/)` — `/legal/:id/finding/:fid` 매칭 시 showNav=false → 모바일 BottomNav + 데스크톱 사이드바 + 데스크톱 글로벌 AppHeader 모두 숨김. 자체 헤더가 유일한 chrome  (변경 금지)
- line 289: <Route path="/legal" element={<Auth><LegalPage /></Auth>} />                          (조부모 페이지 — 본 wave 범위 아님)
- line 290: <Route path="/legal/:id" element={<Auth><LegalFindingsPage /></Auth>} />              (부모 페이지 — 본 wave 범위 아님 / 20-legal-findings 가 담당)
- line 291: <Route path="/legal/:id/finding/:fid" element={<Auth><LegalFindingDetailPage /></Auth>} />  (변경 금지)

[stores/authStore.ts]
- useAuthStore(s => s.staff) (selector 패턴) — staff: Staff | null — role: 'admin' | 'assistant'  (시그니처 변경 금지)
- handleDownload 안 token 직접 사용 X (legalApi 가 내부 axios interceptor 로 처리 — 20-legal-findings 의 handleReportUpload dynamic import 패턴과 다름)  (현 상태 보존)

[hooks/useIsDesktop.ts]
- useIsDesktop(): boolean — ≥768px 분기                                                            (시그니처 변경 금지)

[hooks/useMultiPhotoUpload.ts — 본 페이지 직접 사용 핵심 훅]
- resolutionPhotos = useMultiPhotoUpload() (line 59) — 사진 5장 슬롯 풀 컨트롤
- 모든 export 시그니처 변경 금지 — 본 wave + W2~W5 미수정

[components/PhotoGrid.tsx + PhotoSourceModal.tsx]
- PhotoGrid({ photoUrls: string[] }) — 지적 사진 + 조치 사진 양쪽 렌더 (변경 금지)
- PhotoSourceModal({ open, onClose, onCamera, onAlbum }) (변경 금지)
- 본 wave + W2~W5 미수정 — 시그니처 + props 보존

[utils/findingDownload.ts]
- buildMetaTxt(finding) → ZIP 내부 '내용.txt' (line 98)  (시그니처 변경 금지)
- 본 wave + W2~W5 미수정
```

위 모든 식별자/값은 §6 negative rule + §5 룰 11/12 + §7 OQ #1/#2/#3/#4/#5 default 답에서 재확인. **1 byte 변경 시 W5 verify FAIL**.

---

# §2. 4 sub-wave 분배 plan

다음 표 (W2~W5 4행) — 파일명은 frontmatter 의 평면 패턴 (`sketch-wave-N-{slug}.html` for W2~W4, `wave-5-tsx-conversion-checklist.md` for W5):

| Wave | scope | 대상 element | 산출 파일 |
|---|---|---|---|
| W2 | 모바일 자체 헤더 (h 48 + back 36x36 + admin 다운로드 36x36 + 타이틀 '지적 상세') + 데스크톱 타이틀 영역 (padding '24px 32px 12px' + '지적 상세' 22/800 + admin 다운로드 button 텍스트형) + Spinner (로딩) + 에러 fallback (단일 문장) + 모바일 고정 하단 CTA (status open 한정 — '조치 완료') + 데스크톱 inline CTA (Section 3 안 marginTop 16) | 영역 3 모바일 헤더 (line 149~165) + 데스크톱 타이틀 + admin 다운로드 (line 168~177) + Spinner (line 180) + 에러 fallback (line 183~187) + 모바일 고정 하단 CTA (line 270~275) + 외곽 (line 146 flex 1 column overflow hidden) + 인라인 keyframes spin (line 147). admin/assistant 분기 매트릭스 (다운로드 button 있음/없음). status open/resolved 분기 매트릭스 (CTA 영역 표시/숨김). | sketch-wave-2-chrome.html |
| W3 | finding 정보 (Section 1: KVRow 4행 — 지적 내용 / 위치 / 등록일 / 등록자) + 지적 사진 (Section 2: PhotoGrid 또는 '사진 없음') + SectionHeader 패턴 (12/700 var(--t3) marginBottom 10) + KVRow 패턴 (label 64 flexShrink 0 / children flex 1) — **status 칩 없음** (본 페이지는 화면 모드 자체로 status 표현, 칩 패턴 OQ #2) | 영역 3 콘텐츠 영역 (line 190~215) — Section 1 지적 정보 (line 197~205, KVRow 4행) + Section 2 지적 사진 (line 208~215, PhotoGrid 또는 '사진 없음') + KVRow 컴포넌트 (line 22~29) + SectionHeader 컴포넌트 (line 32~38) + 메타 표시 (whiteSpace pre-wrap for description + fmtDate + createdByName fallback). isDesktop 분기 sectionPad ('20px 32px' / '20px 16px') + maxWidth 700 (데스크톱 중앙 정렬). | sketch-wave-3-finding-info.html |
| W4 | status open 분기 (Section 3 조치 내용 — textarea + 사진 5장 useMultiPhotoUpload 슬롯 + canAdd '+사진 첨부' + 데스크톱 inline CTA) + status resolved 분기 (Section 4 조치 결과 KVRow 3행 — 조치일시 / 조치자 / 조치 내용 + 조치 사진 PhotoGrid) + 두 모드 매트릭스 | 영역 2 useMutation resolveMutation (line 67~87, uploadAll 선행 + 4 키 invalidate + navigate(-1)) + handleResolve (line 132~138, memo.trim() validation) + 영역 3 Section 3 (line 218~250, finding.status === 'open' 조건부 — textarea + 슬롯 + canAdd + 데스크톱 inline CTA) + Section 4 (line 253~265, finding.status === 'resolved' 조건부 — KVRow 3행 + PhotoGrid). admin/assistant 다운로드 button 매트릭스 (handleDownload line 89~130, fflate ZIP location 기반 파일명). status 분기 매트릭스 (open form vs resolved 결과) + 사진 슬롯 매트릭스 (canAdd / uploading overlay / 제거 button) + admin/assistant 매트릭스. | sketch-wave-4-resolve-form.html |
| W5 | TSX 변환 verify checklist (sketch 아님, markdown) | W2~W4 sketch + LegalFindingDetailPage.tsx 비즈 로직 보존 룰 + status open/resolved 분기 1 byte 변경 금지 + admin/assistant 분기 + resolveMutation uploadAll 선행 + 4 키 invalidate + navigate(-1) + handleDownload iOS PWA `<a download>` 패턴 location 기반 파일명 + buildMetaTxt + 모든 toast 카피 5건 + 에러 카피 + textarea placeholder + 사진 슬롯 카피 + CTA 카피 + Tailwind cheatsheet + 메모리 룰 12건 cross-ref. 20-legal-findings W5 + 19-legal W5 + 23-education W5 의 12-섹션 구조 mirror. | wave-5-tsx-conversion-checklist.md |

## §2.1 각 wave 행 — 보존 / 토큰 / 폰트 / 레이아웃

### [W2 — 모바일 자체 헤더 + 데스크톱 타이틀 + Spinner/에러 + 모바일 고정 하단 CTA]

- **보존**:
  - 모바일 헤더 + 데스크톱 타이틀 '지적 상세' verbatim (line 158, 170) — 정적 문자열 (20-legal-findings 동적 분기와 다름)
  - 에러 verbatim '항목을 불러오지 못했습니다. 뒤로 가서 다시 시도하세요.' (line 185)
  - Spinner div 28x28 border 2px var(--bd2) borderTopColor var(--acl) borderRadius 50% animation `spin .7s linear infinite` (line 41~48) — 인라인 @keyframes spin. Lucide Loader2 (animate-spin) 교체 후보 (OQ #5)
  - @keyframes spin `to{transform:rotate(360deg)}` (line 45 Spinner 함수 / line 147 JSX 외곽 중복 정의) — 변경 금지
  - 모바일 헤더 height 48 + back button **36x36 (position absolute left 12)** + admin 다운로드 button **36x36 (position absolute right 12, `staff?.role === 'admin' && finding` 조건부)** + 인라인 SVG ChevronLeft + Download — **§1.1 터치 마지노선 44px 미달** — 현 상태 박제 (OQ #5 LOCKED 시 44x44 격상)
  - 모바일 헤더 bg `rgba(22,27,34,0.97)` (raised 변형 alpha) — OQ #1 검토 (19-legal + 20-legal-findings + 23-education 일관 raised 유지)
  - 데스크톱 타이틀 padding '24px 32px 12px' flex space-between + 좌측 '지적 상세' 22/800 + 우측 admin 다운로드 button (텍스트형 13/700 h 36 bg var(--bg3) border 1px var(--bd2) padding '0 16px' borderRadius 8) — verbatim
  - 모바일 고정 하단 CTA (status open 한정) position fixed bottom 0 left 0 right 0 padding '12px 16px' paddingBottom 'calc(12px + var(--sab, 0px))' + button width 100% h 48 transition 'opacity 0.15s' — verbatim
  - 데스크톱 inline CTA (status open 한정, Section 3 안 marginTop 16) — 모바일 고정 하단 CTA 와 동일 스타일, 위치만 다름
  - 콘텐츠 영역 paddingBottom 분기 'calc(72px + var(--sab, 0px))' (open 모바일 — 고정 CTA 영역 회피) / 24 (open 데스크톱 / resolved 양쪽)
  - 콘텐츠 영역 maxWidth 700 데스크톱 (중앙 정렬용) — verbatim, 변경 금지 (20-legal-findings 800 보다 좁음)
  - 외곽 flex 1 column overflow hidden + height 100% (line 146) — verbatim
  - useIsDesktop 분기 verbatim — 데스크톱 타이틀 영역 / 모바일 자체 헤더 + 고정 하단 CTA (open 한정)
  - admin/assistant 다운로드 button 분기 매트릭스

- **토큰** (design-system §4.1 매핑):
  - `var(--bg)` (line 146, 271) → `bg-surface-page`
  - 모바일 헤더 bg `rgba(22,27,34,0.97)` → `bg-surface-raised/97` arbitrary 또는 인라인 유지 (OQ #1)
  - `var(--bg3)` (데스크톱 다운로드 button bg, textarea bg, canAdd button bg) → `bg-surface-sunken`
  - `var(--bd)` (모바일 헤더 borderBottom, 모바일 고정 CTA borderTop, Section borderBottom) → `border-border-default`
  - `var(--bd2)` (Spinner border, 다운로드 button border, textarea border) → `border-border-strong`
  - `var(--t1)` (헤더/타이틀 색, 다운로드 button 색, KVRow children) → `text-text-primary`
  - `var(--t2)` (에러, 메타) → `text-text-secondary`
  - `var(--t3)` (KVRow label, SectionHeader, '사진 없음', '조치 사진' 라벨) → `text-text-tertiary`
  - `var(--acl)` (Spinner borderTopColor, CTA bg) → `bg-accent` / `border-t-accent`

- **폰트** (design-system §1.1 + §4.2):
  - 12 (KVRow label, SectionHeader, '조치 사진' 라벨) → text-caption(12) leading-none
  - 13 (데스크톱 다운로드 button, textarea, '사진 없음') → text-label
  - 14 (KVRow children, 에러, CTA button) → text-body-sm
  - 16 (모바일 헤더 타이틀) → text-body (마지노선)
  - 22 (데스크톱 타이틀 22/800) → text-display-sm 또는 인라인 22/800 (마지노선 이상)

- **레이아웃**:
  - 모바일: 자체 헤더 48 + 콘텐츠 영역 (paddingBottom calc 72 — open / 24 — resolved) + (open 한정) 고정 하단 CTA 영역 (60~64 + safe-area)
  - 데스크톱: 타이틀 padding '24px 32px 12px' + 콘텐츠 영역 padding sectionPad '20px 32px' maxWidth 700 paddingBottom 24
  - **모바일 BottomNav 숨김** (line 117 정규식 cover → showNav=false) — sketch 시 nav placeholder 그릴 필요 없음
  - **데스크톱 사이드바 BottomNav 숨김 + 글로벌 AppHeader 숨김** (line 117 정규식 cover → showNav=false) — sketch 시 데스크톱 시안도 chrome 외곽 없이 자체 타이틀 영역만 표시

### [W3 — finding 정보 (KVRow 4행 + PhotoGrid) + SectionHeader 패턴]

- **보존**:
  - **SectionHeader 컴포넌트 (line 32~38) 12/700 var(--t3) marginBottom 10 — 1 byte 변경 금지**
  - **KVRow 컴포넌트 (line 22~29) label 12 width 64 flexShrink 0 + children 14 flex 1 lineHeight 1.5 + gap 12 alignItems flex-start — 1 byte 변경 금지**
  - **Section 1 지적 정보 4행 verbatim** (line 200~204): '지적 내용' (description whiteSpace pre-wrap) + '위치' (location ?? '-') + '등록일' (fmtDate) + '등록자' (createdByName ?? createdBy)
  - **Section 2 지적 사진 — PhotoGrid (photoKeys length > 0) 또는 '사진 없음' (line 213, 13 var(--t3) marginTop 8)** — 1 byte 변경 금지
  - SectionHeader verbatim '지적 정보' (line 198) / '지적 사진' (line 209)
  - Section 외곽 padding sectionPad (`isDesktop ? '20px 32px' : '20px 16px'`) borderBottom 1px solid var(--bd)
  - PhotoGrid photoUrls={photoKeys.map(k => '/api/uploads/' + k)} marginTop 8

- **토큰** (status- prefix 없음 룰):
  - Section borderBottom `var(--bd)` → `border-b border-border-default`
  - SectionHeader color `var(--t3)` → `text-text-tertiary`
  - KVRow label color `var(--t3)` → `text-text-tertiary`
  - KVRow children color `var(--t1)` → `text-text-primary`
  - '사진 없음' color `var(--t3)` → `text-text-tertiary`

- **폰트** (design-system §1.1 + §4.2):
  - 12 (SectionHeader, KVRow label) → text-caption(12) leading-none (작은 컨테이너 시각 패딩 방지)
  - 13 ('사진 없음') → text-label
  - 14 (KVRow children) → text-body-sm

- **레이아웃**:
  - Section padding '20px 32px' (데스크톱) / '20px 16px' (모바일) borderBottom 1px var(--bd) — 1 byte 변경 금지
  - KVRow flex gap 12 alignItems flex-start + label width 64 flexShrink 0 + children flex 1 lineHeight 1.5
  - SectionHeader marginBottom 10
  - Section 1 내부 flex column gap 8 (KVRow 4행 사이 간격)
  - PhotoGrid marginTop 8

### [W4 — status open form + status resolved 결과 + admin 다운로드]

- **보존**:
  - **finding.status open 분기 Section 3 1 byte 변경 금지** (line 218~250) — textarea + 사진 5장 슬롯 + canAdd + 데스크톱 inline CTA
  - **finding.status resolved 분기 Section 4 1 byte 변경 금지** (line 253~265) — KVRow 3행 + 조치 사진 PhotoGrid
  - **resolveMutation uploadAll 선행 + 4 키 invalidate + navigate(-1) 1 byte 변경 금지** (line 67~87)
  - **handleDownload iOS PWA `<a download>` 패턴 + 파일명 `지적사항_${name}.zip` location 기반 + setTimeout(URL.revokeObjectURL, 3000) — 변경 금지** (line 89~130)
  - **admin 다운로드 button 조건부 `staff?.role === 'admin' && finding` (line 159, 171) 1 byte 변경 금지**
  - **handleResolve memo.trim() validation + toast.error '조치 내용을 입력하세요'** — 변경 금지
  - SectionHeader verbatim '조치 내용' (line 220) / '조치 결과' (line 255)
  - textarea placeholder verbatim '조치 내용을 입력하세요' (line 221) + rows 3 + width 100% bg var(--bg3) borderRadius 9 padding '10px 12px' border 1px solid var(--bd2) color var(--t1) fontSize 13 boxSizing border-box fontFamily inherit lineHeight 1.5 resize vertical outline none
  - 조치 사진 라벨 verbatim '조치 사진 (최대 5장)' (line 223, 12/700 var(--t3) marginBottom 6)
  - input cameraRef + albumRef hidden + accept 'image/*' + capture 'environment' (camera) / multiple (album) + PhotoSourceModal {open, onClose, onCamera, onAlbum}
  - 슬롯 외곽 flex gap 8 overflowX auto paddingBottom 4
  - 슬롯 img 72x72 objectFit cover borderRadius 10 border 1px solid var(--bd) display block
  - 제거 button position absolute top -6 right -6 width 20 height 20 borderRadius 50% bg var(--danger) color #fff fontSize 11/700 '✕' lineHeight 1
  - uploading overlay position absolute inset 0 bg rgba(0,0,0,0.4) borderRadius 10 fontSize 10 color #fff '업로드 중'
  - canAdd button 72x72 borderRadius 10 bg var(--bg3) border 1px dashed var(--bd2) color var(--t3) fontSize 11 fontWeight 600 — 아이콘 '📷' fontSize 22 + '사진 첨부' verbatim
  - 데스크톱 inline CTA (open 한정, line 244~248) marginTop 16 width 100% h 48 bg var(--acl) color #fff 14/700 borderRadius 12 — '조치 완료' / '처리 중...' isSubmitting opacity 0.5 cursor not-allowed
  - Section 4 KVRow 3행 verbatim — '조치일시' (fmtDate(resolvedAt)) + '조치자' (resolvedByName ?? resolvedBy ?? '-') + '조치 내용' (resolutionMemo ?? '-' whiteSpace pre-wrap)
  - Section 4 PhotoGrid (resolutionPhotoKeys length > 0 조건부) marginTop 12 photoUrls={resolutionPhotoKeys.map(k => '/api/uploads/' + k)}
  - 모바일 데스크톱 admin 다운로드 button verbatim — 모바일 SVG icon Download (size 18) / 데스크톱 텍스트 '다운로드' / '다운로드 중...'

- **토큰** (status- prefix 없음 룰):
  - textarea bg `var(--bg3)` → `bg-surface-sunken`, border `var(--bd2)` → `border-border-strong`, color `var(--t1)` → `text-text-primary`
  - 슬롯 img border `var(--bd)` → `border-border-default`
  - 제거 button bg `var(--danger)` → `bg-danger`
  - uploading overlay bg `rgba(0,0,0,0.4)` → `bg-black/40` arbitrary
  - canAdd button bg `var(--bg3)` → `bg-surface-sunken`, border `var(--bd2)` → `border-border-strong border-dashed`, color `var(--t3)` → `text-text-tertiary`
  - CTA button bg `var(--acl)` → `bg-accent` solid 또는 **§6.4 그라데이션 `linear-gradient(135deg, #1d4ed8, #0ea5e9)`** (메인 CTA 적용 OQ #4 default 그라데이션)
  - admin 다운로드 button (데스크톱) bg `var(--bg3)` → `bg-surface-sunken` solid (작은 도구) — 그라데이션 적용 X
  - admin 다운로드 button (모바일) icon button — 색만 (`text-text-primary`), bg 없음

- **폰트** (design-system §1.1 + §4.2):
  - 10 (uploading overlay '업로드 중') — **§1.1 9·10·11 금지 위반** — 12 격상 후보 (OQ #3)
  - 11 (canAdd button '사진 첨부', 제거 button '✕') — **§1.1 위반** — 12 격상 후보 (OQ #3). 격상 후 leading-none 명시 (memory `feedback_text_caption_leading_none`)
  - 12 (조치 사진 라벨, SectionHeader, KVRow label) → text-caption(12) leading-none
  - 13 (textarea, 데스크톱 admin 다운로드 button) → text-label
  - 14 (CTA button, KVRow children) → text-body-sm
  - 22 ('📷' 이모지 fontSize 22 canAdd 아이콘) — 이미지 글리프, fontSize 룰 무관

- **레이아웃**:
  - Section 3 외곽 padding sectionPad borderBottom 1px var(--bd)
  - textarea rows 3 width 100% + marginTop 12 (사진 라벨)
  - 슬롯 영역 marginTop 12 (textarea 아래) + flex gap 8 overflowX auto paddingBottom 4
  - 슬롯 72x72 (img + canAdd 동일) — 1 byte 변경 금지
  - 제거 button (-6,-6) 20x20 — 1 byte 변경 금지
  - 데스크톱 inline CTA marginTop 16 width 100% h 48 (모바일 고정 CTA 와 동일 스타일)
  - Section 4 외곽 padding sectionPad borderBottom 1px var(--bd) + 내부 flex column gap 8
  - Section 4 PhotoGrid marginTop 12 (KVRow 3행 아래)
  - **모바일 고정 하단 CTA = W2 책임** — W4 sketch 에는 표시 위치만 인디케이션, 실제 마크업은 W2

### [W5 — TSX 변환 verify checklist]

- W2~W4 모든 sketch 의 className/style 인라인 grep 추출 + verbatim 인용 (memory `feedback_planner_prompt_sketch_verbatim`)
- 비즈 anchor 시그니처 1 byte 변경 0 verify gate — useQuery 1종 + useMutation 1종 (uploadAll 선행 + 4 키 invalidate + navigate(-1)) + legalApi 2종 + handleDownload (iOS PWA `<a download>` + setTimeout 3000 + 파일명 location 기반) + handleResolve (memo.trim() validation) + finding.status open/resolved 분기 + admin/assistant 분기 + buildMetaTxt + 사진 파일명 + toast 카피 5종 + 에러/placeholder/라벨 카피 + @keyframes spin 중복 정의
- 20-legal-findings W5 + 19-legal W5 + 23-education W5 + 28-splash W5 의 12-섹션 구조 mirror — 산출 파일 헤더 / OQ LOCKED 정리 / Tailwind 매핑 표 / 비즈 anchor 보존 verify / negative gate / positive gate / scope / build / 메모리 룰 cross-ref
- status 표시 (OQ #2 LOCKED 시) verify — 페이지 헤더 또는 SectionHeader 근처 칩, status- prefix 없음, KVRow 만 사용 (borderLeft 0건)
- admin/assistant 다운로드 button 분기 verify + uploadAll 선행 패턴 verify (memory `project_inspection_completion_rule` 일반화)
- 모바일 back button + admin 다운로드 button 36x36 → 44x44 (OQ #5 LOCKED 시) + Lucide ChevronLeft size={20} + Download size={18} 교체 verify + lucide-react import 추가
- Spinner 함수 (인라인 div + @keyframes spin) → Lucide Loader2 size={24} className `animate-spin` 교체 verify (OQ #5 LOCKED 시) — Spinner 함수 line 41~48 폐기 + 외곽 인라인 keyframe 정의 (line 147) 도 폐기
- CTA button (조치 완료, 모바일 고정 + 데스크톱 inline) §6.4 그라데이션 (OQ #4 LOCKED 시) verify — `linear-gradient(135deg, #1d4ed8, #0ea5e9)`. admin 다운로드 button (작은 도구) 은 solid 유지

---

# §3. design-system.md v0.1.1 인용 (verbatim 발췌, fence 안)

design-system.md (`cha-bio-safety/docs/redesign-context/21-legal-finding-detail/design-system.md`, v0.1.1) 의 §1.1 / §1.2 / §1.3 / §6.4 / §6.6 / §7 (Iconography) / §7.1 (Lucide) 본문을 각각 별도 fence 블록에 verbatim 박제. §6/§7 미적용 부분은 1줄 메타 동반. 20-legal-findings + 19-legal wave-1-index.md 의 동일 영역과 동일 design-system.md (v0.1.1) 기반이므로 fence 내용 동일.

## §3.1 design-system §1.1 노안 친화 (verbatim fence)

```
### 1.1 노안 친화가 모든 결정보다 우선
- 본문 폰트 최소 16px. 9·10·11px 사용 금지.
- 보조 텍스트 명도 대비 AAA(7:1) 도달.
- 터치 타겟 모바일 44px, 데스크톱 40px.
- 1-2px 단위 미세 차이는 의미 없다 — 토큰은 4의 배수로만.
```

**적용 메타 (21-legal-finding-detail)**: LegalFindingDetailPage 의 현재 fontSize 매핑 — **10 (uploading overlay '업로드 중' line 232)** — §1.1 위반 (9·10·11 금지). **11 (제거 button '✕' line 231, canAdd '사진 첨부' line 237)** — §1.1 위반. 격상 후보 12 (OQ #3 검토). 12 / 13 / 14 / 16 / 22 (데스크톱 타이틀 22/800 마지노선 이상). **터치 마지노선 44px** — 모바일 back button **36x36 (line 155 absolute left 12)** + 모바일 admin 다운로드 button **36x36 (line 159 absolute right 12)** = **§1.1 위반** (OQ #5 LOCKED 시 44x44 격상). CTA button (모바일 고정 + 데스크톱 inline) h 48 = 룰 일치 (44 + 4 추가). 데스크톱 admin 다운로드 button h 36 = 데스크톱 도구 패턴 일치. 슬롯 72x72 + 제거 button 20x20 = 배지/장식 패턴 (44px 룰 직접 적용 대상 아님 — 단 제거 button 은 손가락 hit 영역 조정 검토 가능).

## §3.2 design-system §1.2 정보 인지 > 미적 정제 (verbatim fence)

```
### 1.2 정보 인지 > 미적 정제
방재 시스템은 매일 보는 업무 도구다. 트렌디함은 가치가 없다.
- 정보 위계는 폰트 크기/굵기/색이 분명하게 차별화한다.
- 카드 경계는 항상 명확하게 (다크는 명도, 라이트는 보더).
- 인지 부하를 늘리는 장식은 빼고, 빠른 식별을 돕는 색·아이콘을 살린다.
```

**적용 메타 (21-legal-finding-detail)**: 정보 위계 — 페이지 타이틀 '지적 상세' → SectionHeader (지적 정보 / 지적 사진 / 조치 내용 / 조치 결과) → KVRow label (12 var(--t3) width 64) → KVRow children (14 var(--t1) flex 1) 4 단계 명확. status open/resolved 화면 모드 자체로 표현 (form vs 결과) = 빠른 식별. 칩 없음 — finding 상태 칩 추가 시 정보 중복 우려 (OQ #2). 장식 0건 (CTA button 만 §6.4 후보).

## §3.3 design-system §1.3 모바일/데스크톱 동일 폰트 (verbatim fence)

```
### 1.3 모바일/데스크톱은 같은 시스템, 다른 밀도
- 폰트는 양쪽 동일 — 노안 대응 절대 룰.
- Radius도 양쪽 동일.
- Spacing만 분기 (모바일 14px → 데스크톱 10px 등).
- 데스크톱이 빽빽한 건 spacing보다 **레이아웃**(사이드바, 좌우 분할, 그리드 컬럼 수)이 책임진다.
```

**적용 메타 (21-legal-finding-detail)**: 데스크톱 = **단일 컬럼 maxWidth 700 중앙 정렬** (20-legal-findings 800 보다 좁음 — 단일 finding 상세 페이지 특성). 폰트 분기 — **데스크톱 타이틀 22/800 / 모바일 타이틀 16/700** (§1.3 동일 폰트 룰 위반 — 데스크톱이 큼, 단 마스터 타이틀은 예외 케이스). KVRow + SectionHeader + textarea + 슬롯 본문은 모바일/데스크톱 동일 폰트 — 룰 일치. spacing 분기 — Section padding '20px 32px' (데스크톱) / '20px 16px' (모바일) — §1.3 허용. CTA button 모바일 고정 / 데스크톱 inline — 위치만 다름, 스타일 동일 (h 48 width 100%). admin 다운로드 button 모바일 icon (36x36) / 데스크톱 텍스트 (h 36) — 형태 분기 의도된 패턴.

## §3.4 design-system §6.4 Backgrounds & Gradients (verbatim fence)

```
### 6.4 Backgrounds & Gradients

- 단색 surface 계층 — 이미지 배경 없음, 풀블리드 없음
- **유일한 그라디언트 2종:**
  - "오늘 점검 대상" 배너: `linear-gradient(135deg, rgba(37,99,235,.10), rgba(14,165,233,.05))`
  - 저장/CTA 버튼: `linear-gradient(135deg, #1d4ed8, #0ea5e9)`
- 그 외 모든 배경은 surface 토큰 단색
```

**적용 메타 (21-legal-finding-detail)**: LegalFindingDetailPage 의 CTA 버튼 = 조치 완료 button (모바일 고정 line 270~275 + 데스크톱 inline line 244~248, width 100% h 48). 현재 solid `var(--acl)` — §6.4 그라데이션 적용 후보. **default = 조치 완료 CTA (메인 액션) 그라데이션 + admin 다운로드 button (작은 도구) solid 유지** (OQ #4). 작은 도구 button (h 36) 까지 그라데이션 = 시각 잡음 — 메인 CTA 한정. 그라데이션 색은 §6.4 룰 (#1d4ed8, #0ea5e9) 우선. 20-legal-findings + 19-legal + 23-education + 17-annual-plan + 16-workshift + 14-reports W1 OQ #1 그라데이션 default 일관. 단 28-splash W1 OQ #1 은 정반대 (solid 채택) — 사용자 컨펌으로 둘 중 LOCKED. 그 외 모든 배경 = surface 토큰 단색 일치 (그라데이션 0건 확인).

## §3.5 design-system §6.6 Animation (verbatim fence)

```
### 6.6 Animation (최소화)

업무 도구 톤 — 화려한 모션 금지.

| 대상 | 트랜지션 |
|---|---|
| 모달/시트 진입 | `transform: translateY(100%)→0`, `cubic-bezier(0.32,0.72,0,1)`, 0.26s |
| 대시보드 카드 stagger | `slideUp .28s ease-out`, 0.06s 간격 |
| 상태 dot (수신반 이력) | `blink 2s ease-in-out infinite` |
| 일반 트랜지션 | `all .13s` 또는 `border-color .15s, transform .15s` |
```

**적용 메타 (21-legal-finding-detail)**: Spinner `spin .7s linear infinite` (line 45) — §6.6 의 "일반 트랜지션" 범주, 0.7s 는 §6.6 표 미정의 (loading spinner 는 일반 트랜지션과 별개) — 현 상태 보존. 모바일 CTA button transition 'opacity 0.15s' (line 274) — §6.6 일반 트랜지션 룰 일치. uploading overlay (line 232) animation 없음 — 현 상태 보존. 화려한 모션 0건. PhotoSourceModal 진입 트랜지션은 컴포넌트 자체 처리 (본 wave 미수정). **@keyframes spin 중복 정의 (line 45 Spinner 함수 + line 147 JSX 외곽) 보존** — 두 곳 모두 동일 정의, 1 byte 변경 금지 (W5 변환 시 Lucide Loader2 교체 OQ #5 LOCKED 시 양쪽 모두 폐기 가능).

## §3.6 design-system §7 Iconography 미적용 메타 + §7.1 Lucide (verbatim fence)

```
### 7.1 Icon System: Lucide

- **`lucide-react`** 사용 (MIT, stroke 기반, 24×24 viewBox)
- 사이즈: **16 / 20 / 24 px** 세 종류만
- 색상: 본 문서의 status / accent 토큰만 사용
- 이모지 사용 금지 (대시보드 빠른 도구 카드 + 카테고리 카드 모두 Lucide로 통일)
```

**적용 메타 (21-legal-finding-detail)**: LegalFindingDetailPage 본문에 **이모지 1건** — canAdd button '📷' (line 237, fontSize 22). 19-legal LegalPage 의 FindingDetailPanel 안 '📷' 첨부 button 이모지와 일치 패턴. Lucide Camera size={22} 교체 후보 (OQ #5 검토). 모바일 back button 인라인 SVG ChevronLeft (line 156, polyline path `M15 19l-7-7 7-7` — 19-legal 과 동일 path 포맷) **size 20** → Lucide `ChevronLeft size={20} color="currentColor"` 교체 후보. 모바일 admin 다운로드 button 인라인 SVG Download (line 161, path `M12 5v14m0 0l-6-6m6 6l6-6M5 19h14`) **size 18** → Lucide `Download size={18}` 교체 후보. Spinner 인라인 div + @keyframes spin (line 41~48) — Lucide `Loader2` (animate-spin) 교체 후보. 16-workshift / 17-annual-plan / 28-splash / 23-education / 19-legal / 20-legal-findings W1 OQ 일관 LOCKED. **§7.2 카테고리 → Lucide 매핑** = LegalFindingDetailPage 는 점검 카테고리 카드 시스템 아님 (단일 finding 상세) → **미적용 1줄 메타**. **§6.1 Progress Color Rule** / **§6.2 Stat Card Number Color** / **§6.3 카테고리 카드** = LegalFindingDetailPage 에 진척률 도넛/통계 카드/카테고리 카드 모두 없음 → **미적용 1줄 메타** (memory `feedback_tsx_wave_stat_card_drift` 룰 일치). **§7.3 상태/결과 아이콘** = finding status open/resolved 화면 모드 자체로 표현 (칩/아이콘 없음) — OQ #2 검토.

---

# §4. 02+06 chrome 통일 룰 적용 여부

`inspection-modal-chrome-rules.md` (`cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md`) 를 읽고 21-legal-finding-detail 의 chrome 적용 여부 정리.

**21-legal-finding-detail 페이지는 20-legal-findings LegalFindingsPage 의 손주-route (`/legal/:id/finding/:fid`) → 점검 시리즈 직접 적용 케이스.** 02 InspectionPage 와 동일한 점검 도메인. **20-legal-findings 와 일관**: App.tsx line 117 정규식 `^\/legal\/.+` 매칭 → 모바일/데스크톱 모두 **showNav=false** → BottomNav + 사이드바 + 글로벌 AppHeader 모두 숨김. 자체 헤더 (모바일) + 데스크톱 타이틀 영역이 chrome 의 유일한 외곽.

각 룰을 1줄씩 적용/미적용 판정 + 적용 룰은 verbatim 인용:

1. **§1 모달 chrome 룰** — 본 wave 의 모달 후보: PhotoSourceModal (사진 첨부 선택 — line 226 mount). 자체 컴포넌트, 본 wave 미수정 — 적용 판정은 PhotoSourceModal 별도 wave 에서. **본 W2~W5 범위 = 모바일 자체 헤더 + 데스크톱 타이틀 + 콘텐츠 + 모바일 고정 하단 CTA = 모달 chrome 룰 직접 적용 0건**.

2. **§2 모바일 헤더 chrome** — 모바일 자체 헤더 (line 149~165): h 48 + bg `rgba(22,27,34,0.97)` + '지적 상세' 정중앙 + position absolute back button 36x36 + position absolute admin 다운로드 button 36x36. **chrome 룰 §2.1 'bg-surface-page'** vs 현재 raised 변형 alpha — OQ #1 default raised 유지 (19-legal + 20-legal-findings + 16-workshift + 17-annual-plan + 02 + 28-splash + 23-education 일관). 단 alpha 0.97 보존 검토. **chrome 룰 §2 헤더 h 48** = 현재 일치. **모바일 헤더 좌우 button 양쪽 패턴** = 단일 페이지 헤더의 정상 케이스 (back + 도구), 격상 시 양쪽 동시 44x44 검토 (OQ #5).

3. **§3 BottomNav 룰** — App.tsx 실측 (**20-legal-findings 와 일관**):
   - **모바일**: `/legal/:id/finding/:fid` ∈ `MOBILE_NO_NAV_PATHS` 직접 등재 아님 (line 71) **단 line 117 정규식 `^\/legal\/.+` 매칭 → showNav=false** → 모바일 BottomNav **숨김**. 자체 헤더만 단독.
   - **데스크톱**: `/legal/:id/finding/:fid` ∉ `DESKTOP_NO_NAV_PATHS` (line 74) **단 line 117 정규식 매칭 → showNav=false** → 데스크톱 사이드바 BottomNav **숨김**.
   - **데스크톱 글로벌 AppHeader**: `/legal/:id/finding/:fid` ∉ `DESKTOP_HEADER_HIDE_PATHS` (line 77) **단 line 117 정규식 매칭 → showNav=false** → 글로벌 AppHeader **숨김**.
   - `PAGE_TITLES` (App.tsx line 79~104) `/legal/:id/finding/:fid` **미등재** (line 98 `'/legal': '소방 점검 관리'` 만 있음) → `pageTitle = ''`. 단 글로벌 AppHeader 자체가 숨김이라 영향 없음.
   - → **모바일 = 자체 헤더만 단독 표시 / 데스크톱 = 자체 타이틀 영역만 단독 표시.** 20-legal-findings 와 동일 패턴 (모두 line 117 정규식 cover). **본 페이지는 chrome 외곽 0건** — sketch 시 데스크톱 시안에 글로벌 AppHeader 영역 + 좌측 사이드바 영역 그리지 않음.

4. **§4 데스크톱 헤더 chrome** — LegalFindingDetailPage 데스크톱은 자체 타이틀 영역 (padding '24px 32px 12px') 만 표시 — 글로벌 AppHeader 도 숨김. chrome 룰 §4 직접 적용 0건 (자체 타이틀 영역만).

5. **§5 카드 / 리스트 chrome** — finding 카드 없음 (단일 finding 상세 페이지). Section 외곽 (padding sectionPad borderBottom 1px var(--bd)) 가 카드 대체 — chrome 룰 §5 의 카드 spacing 룰 적용 여부 — 실제 파일 §5 본문 확인 후 적용/미적용 판정. KVRow + PhotoGrid 가 Section 내부 콘텐츠 패턴.

6. **§6 색 / status chrome** — finding status open/resolved 화면 모드 자체로 표현 (칩/borderLeft 없음). chrome 룰 §6 의 status 색 사용 룰 — 본 페이지 직접 적용 0건 (단, OQ #2 LOCKED 시 status 칩 추가 → §6 적용). design-system §1.4 상태 색 의미 + tokens.css `--status-safe/danger` 일치 — 적용 시 OQ #2 토큰 치환 default OK.

7. **§7 back button + 도구 button 패턴** — 모바일 자체 헤더 back button **36x36 position absolute left 12** + admin 다운로드 button **36x36 position absolute right 12** + inline SVG (line 155~157, 159~163). chrome 룰 §7.2 의 `w-8 h-8 bg-surface-sunken` 패턴과 다른 케이스 (현재 36x36 = `w-9 h-9` (36px tailwind 기본) 또는 `w-[36px] h-[36px]` arbitrary). **§1.1 터치 마지노선 44px 미달** — OQ #5 LOCKED 시 44x44 격상 + Lucide ChevronLeft + Download 교체 동시 적용. memory `feedback_tailwind_w8_h8_is_48px` 함정 회피 — `w-8` 사용 시 48px 사고.

**실측 결과 (App.tsx 본문 grep, drift 없음):**

```
line 37: const LegalFindingDetailPage  = lazy(() => import('./pages/LegalFindingDetailPage'))
line 71: MOBILE_NO_NAV_PATHS = ['/', '/login', '/schedule', '/reports', '/workshift', '/leave', '/floorplan', '/div', '/qr-print', '/daily-report', '/worklog', '/meal', '/education', '/legal', '/elevator/findings', '/annual-plan']  // /legal/:id/finding/:fid 미등재 (정규식 line 117 cover)
line 74: DESKTOP_NO_NAV_PATHS = ['/', '/login']                                       // /legal/:id/finding/:fid 미등재 (정규식 line 117 cover)
line 77: DESKTOP_HEADER_HIDE_PATHS = ['/elevator', '/div', '/floorplan', '/workshift']  // /legal/:id/finding/:fid 미등재 (정규식 line 117 cover)
line 79~104: PAGE_TITLES Record — '/legal/:id/finding/:fid' 미등재 (line 98 '/legal': '소방 점검 관리' 만)  // showNav=false 라 영향 없음
line 117: !location.pathname.match(/^\/legal\/.+/)                                    // /legal/:id/finding/:fid 매칭 → showNav=false (모바일/데스크톱 모두 chrome 외곽 숨김)
line 289: <Route path="/legal"                  element={<Auth><LegalPage /></Auth>} />          // 조부모 페이지 — 본 wave 범위 아님
line 290: <Route path="/legal/:id"              element={<Auth><LegalFindingsPage /></Auth>} />  // 부모 페이지 — 본 wave 범위 아님 (20-legal-findings 가 담당)
line 291: <Route path="/legal/:id/finding/:fid" element={<Auth><LegalFindingDetailPage /></Auth>} />
```

**핵심 시사점:**
- 모바일: 자체 헤더만 (line 149~165, h 48 + back button 36x36 + admin 다운로드 button 36x36 + '지적 상세'), BottomNav 숨김 (정규식 cover). **양쪽 36x36 button 모두 §1.1 터치 44px 미달 — OQ #5 LOCKED 시 양쪽 동시 44x44 격상**.
- 데스크톱: **chrome 외곽 0건** (자체 타이틀 영역만, 글로벌 AppHeader + 사이드바 모두 정규식으로 숨김) → sketch 시 데스크톱 시안에 글로벌 chrome 그리지 않음. 20-legal-findings 와 동일.
- **본 wave + W2~W5 모두 LegalFindingDetailPage.tsx 본 페이지만 다룸 — 조부모 `/legal` (LegalPage) + 부모 `/legal/:id` (LegalFindingsPage) 는 별도 wave (20-legal-findings 가 담당).**
- **20-legal-findings 와 차이 (5건)**: (1) 단일 finding 페이지 (목록 X), (2) resolution form 풀 페이지 (FindingFormSheet 우회 X), (3) 사진 5장 useMultiPhotoUpload 직접 사용, (4) ZIP 파일명 location 기반 (round.title 기반 X, fid 기반 X), (5) status open/resolved 화면 모드 분기.

본 wave + W2~W5 모두 `App.tsx` 손대지 않음 (§6 negative rule).

---

# §5. 메모리 룰 inline 인용 (verbatim)

본 인덱스에서 후속 wave 작업자가 따라야 할 메모리 룰 12건. 19-legal W1 + 20-legal-findings W1 + 23-education W1 + 28-splash W1 + 17-annual-plan W1 + 16-workshift W1 + 27-login W1 의 10건 + LegalFindingDetailPage 특화 2건 (`feedback_inspection_unresolved_color` finding status 분기 화면 모드 일반화 + `project_inspection_completion_rule` role admin ZIP 도구 분기 + resolutionPhotos uploadAll async source of truth 일반화). 각 룰은 슬러그 + 요약 + Why + How (21-legal-finding-detail 컨텍스트) 4 항목.

### 룰 1 — feedback_design_sketch_first
- **요약**: spacing/sizing 도 sketch HTML 시안 먼저 보여주고 승인 받은 후 인라인 적용.
- **Why**: 변경 후 결과를 두 번 보여주는 것보다 sketch 1회 컨펌이 효율적. 디자인 작업의 핵심 룰.
- **How to apply (21-legal-finding-detail)**: W3 Section padding sectionPad 20/16 / W3 KVRow label width 64 + gap 12 / W4 textarea rows 3 + padding '10px 12px' / W4 사진 슬롯 72x72 + 제거 button 20x20 + canAdd 72x72 / W4 CTA h 48 width 100% / W2 모바일 고정 하단 CTA paddingBottom 'calc(12px + var(--sab, 0px))' + 콘텐츠 paddingBottom 'calc(72px + var(--sab, 0px))' (open 한정) / 데스크톱 maxWidth 700 (20-legal-findings 800 보다 좁음, 단일 finding 상세 의도) 손볼 거 있으면 sketch 먼저. 특히 데스크톱 maxWidth 700 = 운영 룰 — "맥스 800 으로 늘려" 인라인 변경 직행 금지.

### 룰 2 — feedback_redesign_sketch_rule_enforcement
- **요약**: §6.2 negative rule (위험 임계치 아닌 카드 status 색 금지) / §6.3 §7.1 일관성, executor + verify gate + 자체 검수 4중 강화.
- **Why**: status 색 (fire/danger/warning) 은 의미 fix — 진척률/위험 임계치 외에 미적 색으로 사용하면 정보 위계 무너짐.
- **How to apply (21-legal-finding-detail)**: 본 페이지에는 finding 상태 칩 없음 — 화면 모드 자체로 status 표현 (open form vs resolved 결과). OQ #2 LOCKED 시 status 칩 추가 → KVRow 만 사용 (borderLeft 0건 — 20-legal-findings 의 borderLeft 2px 패턴과 다름). 제거 button bg `var(--danger)` = 위험 임계치 의미 (사진 삭제 = 데이터 손실 — danger 적합). CTA button bg `var(--acl)` = accent 색 (활성 강조) — status 임계치 아님. `border-l-status-safe-bar` 같은 위험 색 사용 금지.

### 룰 3 — feedback_sketch_realistic_data
- **요약**: 표시 분기/라벨 룰은 코드 그대로, 시각 디자인만 손봄.
- **Why**: sketch 작성 시 '지적 상세' 같은 타이틀이나 SectionHeader '지적 정보' 를 임의 변경하면 코드 변경 wave 가 deviation 으로 잡힘.
- **How to apply (21-legal-finding-detail)**: 카피 verbatim — '지적 상세' (모바일/데스크톱 헤더, line 158/170), SectionHeader 4종 ('지적 정보' / '지적 사진' / '조치 내용' / '조치 결과'), KVRow label 7종 ('지적 내용' / '위치' / '등록일' / '등록자' / '조치일시' / '조치자' / '조치 내용'), '사진 없음' (빈), '조치 사진 (최대 5장)' (라벨), '조치 내용을 입력하세요' (textarea placeholder), '사진 첨부' (canAdd button), '✕' (제거), '업로드 중' (overlay), '조치 완료' / '처리 중...' (CTA), '다운로드' / '다운로드 중...' (데스크톱 admin), '항목을 불러오지 못했습니다. 뒤로 가서 다시 시도하세요.' (에러 단일 문장). toast 카피 5종 ('조치 완료' / '다운로드 완료' / '조치 처리 실패' / '조치 내용을 입력하세요' / '다운로드 실패'). 시안에서 변경 금지.

### 룰 4 — feedback_planner_prompt_sketch_verbatim
- **요약**: TSX 변환 wave 진입 시 sketch CSS 정의를 grep 으로 추출해 그대로 인용. 추측한 토큰명/사이즈는 deviation 유발 (03-qr-scan 6건 사례).
- **Why**: planner 가 sketch 의 토큰명 (예: `bg-surface-raised`) 을 정확히 알지 못한 상태로 추측하면 executor 가 wave 의 의도와 다른 class 를 적용.
- **How to apply (21-legal-finding-detail)**: W5 TSX 변환 wave 진입 직전 `sketch-wave-2~4.html` 의 모든 Tailwind class / CSS 토큰을 grep 으로 추출 → `wave-5-tsx-conversion-checklist.md` 안에 verbatim 인용. 특히 모바일 헤더 bg `rgba(22,27,34,0.97)`, 모바일 헤더 h 48 + back/admin button 36x36 (또는 44x44 OQ #5), 데스크톱 타이틀 padding '24px 32px 12px' + '지적 상세' 22/800, Section padding sectionPad '20px 32px' / '20px 16px' + borderBottom 1px var(--bd), KVRow gap 12 + label 12 width 64 + children 14 flex 1 lineHeight 1.5, SectionHeader 12/700 marginBottom 10, textarea bg var(--bg3) borderRadius 9 padding '10px 12px' border 1px var(--bd2) color var(--t1) fontSize 13, 사진 슬롯 72x72 borderRadius 10 + 제거 (-6,-6) 20x20 borderRadius 50% bg var(--danger), uploading overlay rgba(0,0,0,0.4) borderRadius 10 fontSize 10 #fff, canAdd 72x72 borderRadius 10 bg var(--bg3) border 1px dashed var(--bd2) color var(--t3) fontSize 11/600 + 📷 fontSize 22, CTA width 100% h 48 borderRadius 12 bg var(--acl) color #fff 14/700 (또는 §6.4 그라데이션 OQ #4), 데스크톱 admin 다운로드 h 36 padding '0 16px' borderRadius 8 bg var(--bg3) border 1px var(--bd2) color var(--t1) 13/700, 모바일 고정 하단 CTA padding '12px 16px' paddingBottom 'calc(12px + var(--sab, 0px))', 콘텐츠 paddingBottom (open 모바일 'calc(72px + var(--sab, 0px))' / 그 외 24), maxWidth 700 (데스크톱), Spinner 28x28 border 2px, animation `spin .7s linear infinite`, @keyframes spin (line 45 + line 147 중복), ZIP 파일명 패턴 `지적사항_${name}.zip` (location 기반), 사진 파일명 '지적사진-${j+1}.jpg' / '조치사진-${j+1}.jpg'. 추측 토큰명 사용 시 deviation 유발.

### 룰 5 — feedback_tailwind_token_class_pattern
- **요약**: `text-fire-bar` O / `text-status-fire-bar` X (status- prefix 없음) + lucide `<Icon size={N} />` prop (`w-N h-N` className 금지).
- **Why**: 11-div TSX v3 hotfix(4ce707e) 사고 — `status-` prefix 가 tailwind.config 에 없어서 class 안 먹음. `bg-safe-bar` 가 올바른 패턴.
- **How to apply (21-legal-finding-detail)**: 제거 button bg `var(--danger)` → `bg-danger` (status- prefix 없음). OQ #2 LOCKED 시 status 칩 추가 → `bg-{safe|danger}-bg text-{safe|danger}`. `bg-status-danger` 사용 시 W5 verify FAIL. CTA button → `bg-accent` solid 또는 §6.4 그라데이션 (OQ #4). 모바일 back button + 모바일 admin 다운로드 button → Lucide `ChevronLeft size={20}` + `Download size={18}` prop (OQ #5) — className 으로 `w-5 h-5` 금지. Spinner → Lucide `Loader2 size={24} className="animate-spin"` (OQ #5). canAdd '📷' → Lucide `Camera size={22}` prop (OQ #5).

### 룰 6 — feedback_tailwind_w8_h8_is_48px
- **요약**: tailwind.config spacing override — `w-8 = 48px` (기본 32 아님), `w-7 = 32px`.
- **Why**: 11-div 백버튼 1.5배 사고(54a1c8d) — `w-8 h-8` 로 32px 의도했는데 실제 48px 적용.
- **How to apply (21-legal-finding-detail)**:
  - 모바일 back button + admin 다운로드 button 36x36 (line 155, 159) → `w-9 h-9` (36px tailwind 기본 spacing 9) 또는 `w-[36px] h-[36px]` arbitrary. **§1.1 터치 44px 미달 — OQ #5 LOCKED 시 44x44 격상 = `w-11 h-11` 또는 `w-[44px] h-[44px]`**.
  - CTA button h 48 (line 245, 273) = `h-12` (48px tailwind 기본 spacing 12) — 또는 `h-[48px]` arbitrary.
  - 데스크톱 admin 다운로드 button h 36 (line 172) = `h-9` (36px tailwind 기본).
  - 사진 슬롯 + canAdd 72x72 (line 230, 236) = `w-[72px] h-[72px]` arbitrary 필수 (tailwind `w-18` 없음 — tailwind 기본 w-16=64 / w-20=80 차이).
  - 제거 button 20x20 (line 231) = `w-5 h-5` (20px tailwind 기본 spacing 5) 또는 `w-[20px] h-[20px]` arbitrary.
  - Spinner 28x28 (line 44) = `w-7 h-7` (28px tailwind 기본) 또는 `w-[28px] h-[28px]` arbitrary.
  - 데스크톱 maxWidth 700 (line 194) = `max-w-[700px]` arbitrary 필수 (tailwind `max-w-3xl 768px` / `max-w-2xl 672px` 와 차이).
  - KVRow label width 64 (line 25) = `w-16` (64px tailwind 기본).
  - 인라인 padding/gap 8/10/12/16/20/24/32 등은 `p-2` (8px) / `p-2.5` (10px) / `p-3` (12px) / `p-4` (16px) / `p-5` (20px) / `p-6` (24px) / `p-8` (32px). tailwind.config spacing override 실측 확인 후 적용.

### 룰 7 — feedback_text_caption_leading_none
- **요약**: `text-caption` lh:1.5 (18px) 가 h-8(32px) 컨테이너 안에서도 시각적 패딩. 헤더 토글/배지/칩 작은 영역은 `leading-none` 명시.
- **Why**: 작은 컨테이너 안 text-caption 이 line-height 1.5 때문에 의도보다 위/아래 시각 패딩 발생.
- **How to apply (21-legal-finding-detail)**:
  - SectionHeader 12 (line 33) → `text-caption font-bold leading-none` (마지노선 + 작은 컨테이너)
  - KVRow label 12 (line 25) → `text-caption leading-none`
  - 조치 사진 라벨 12 (line 223) → `text-caption font-bold leading-none`
  - canAdd '사진 첨부' 11 (line 237) → `text-caption leading-none` (격상 후 12)
  - 제거 button '✕' 11 (line 231) → `text-caption leading-none` (격상 후 12)
  - uploading overlay '업로드 중' 10 (line 232) → `text-caption leading-none` (격상 후 12)
  - '사진 없음' 13 (line 213) → `text-label leading-tight`
  - 메타 모든 10~12 fontSize → leading-none 필수 (작은 컨테이너 패턴)

### 룰 8 — feedback_tsx_wave_emoji_dot_gap
- **요약**: alias sed-replace 만 X. sketch negative gate (이모지 0) + dot span 추가 markup 도 verify.
- **Why**: sketch 의 `🎯` `⬇` 같은 이모지/특수문자 글리프가 TSX 변환에서 빠지지 않고 그대로 남는 사고. dot span (`<span>·</span>`) 추가 markup 도 자동 적용 안 됨.
- **How to apply (21-legal-finding-detail)**: **LegalFindingDetailPage 본문에 이모지 1건** — canAdd button '📷' (line 237, fontSize 22). 19-legal LegalPage 의 FindingDetailPanel 안 '📷' 첨부 button 이모지와 일치 패턴 — Lucide `Camera size={22}` 교체 (OQ #5). 제거 button '✕' (line 231) 은 unicode 글리프 (이모지 아님) — Lucide `X size={11}` 교체 검토 (OQ #5) 또는 현 상태 보존. 인라인 SVG ChevronLeft + Download (모바일 헤더) 는 Lucide 교체. Spinner div + @keyframes spin 도 Lucide `Loader2` (animate-spin) 교체. 메타 dot span 패턴 추가 markup 본 페이지 없음.

### 룰 9 — feedback_tsx_wave_stat_card_drift
- **요약**: executor 가 source outline 패턴 보존, sketch 새 패턴 누락 가능. plan 에 verbatim 인용 + verify gate 권장.
- **Why**: source 의 fontSize/색 패턴이 sketch 의 새 룰 (`bg-surface-raised border-l-[3px] border-accent`) 을 덮어쓰는 사고.
- **How to apply (21-legal-finding-detail)**: LegalFindingDetailPage 에 Stat Card (28px display 숫자) 없음 → §6.2 Stat Card Number Color 룰 미적용. **§6.3 카테고리 카드 룰 미적용** (LegalFindingDetailPage 는 점검 카테고리 카드 시스템 아님 — 단일 finding 상세 페이지). 단 sketch 새 패턴 (예: status open/resolved 2 모드 매트릭스 / admin/assistant 매트릭스 / 사진 슬롯 5종 상태 매트릭스 — 빈/img/uploading/canAdd / 데스크톱/모바일 CTA 위치 매트릭스 / 데스크톱/모바일 admin 다운로드 button 형태 매트릭스 — icon/텍스트) 은 W5 진입 시 verbatim 인용 필수. source LegalFindingDetailPage.tsx 의 인라인 rgba (`rgba(22,27,34,0.97)` / `rgba(0,0,0,0.4)`) 가 sketch 의 새 토큰 패턴 (`bg-surface-raised/97` / `bg-black/40`) 을 덮어쓰지 않도록 명시 필수.

### 룰 10 — feedback_avoid_premature_confirmation
- **요약**: "거의 일치" 자신감 표현 금지. 결과 보여주고 사용자 판단.
- **Why**: 시각 작업은 사용자 인지에 의존 — Claude 의 "approved" 자체 판단은 무의미.
- **How to apply (21-legal-finding-detail)**: 본 인덱스 작성 완료 후 "§7 OQ 5건 컨펌 부탁" 보고만. "wave 1 완벽 / W2 진입 가능" 같은 자신감 표현 금지. W2~W5 진입 시점도 사용자 컨펌 명시 받은 후에만. sketch 산출 후 "거의 일치 / 잘 됐다" 표현 금지. 특히 status open/resolved 화면 모드 시각 결과 + 사진 슬롯 매트릭스 + admin 도구 분기 시각 결과 + 모바일 고정 하단 CTA 영역 시각 결과는 사용자 판단 영역.

### 룰 11 — feedback_inspection_unresolved_color (★ 21-legal-finding-detail 특화 — finding status 화면 모드 분기 일반화)
- **요약**: 미조치 색 = status-fire (주황). 메인 칩 fire / 상세 danger inconsistent. 사용자 인지 = 칩의 fire 색.
- **Why**: 점검 페이지에서 미조치 칩이 fire (주황) 으로 표시되어 사용자가 "위험 임계치 = 칩 색" 패턴 학습. 21-legal-finding-detail 의 finding status open/resolved 화면 모드 자체로 status 표현 — open form 모드 = 미조치 의미 / resolved 결과 모드 = 완료 의미.
- **How to apply (21-legal-finding-detail)**: **finding.status open/resolved 화면 모드 분기 (line 218 open Section 3 / line 253 resolved Section 4)** — 운영 의미 source of truth. 칩 없음 (현재 디자인) — 단 OQ #2 LOCKED 시 status 칩 추가 가능 (페이지 헤더 또는 SectionHeader 근처). 추가 시 20-legal-findings 의 칩 패턴 일치 — `bg-{safe|danger}-bg text-{safe|danger}` (status- prefix 없음 룰). KVRow 만 사용 (borderLeft 0건 — 20-legal-findings borderLeft 2px 와 다른 패턴, 본 페이지는 단일 finding 상세 → 카드 borderLeft 시각 metaphor 불요). **2 화면 모드 + 칩 추가 옵션 1 byte 변경 금지** (OQ #2 LOCKED 후 W3 sketch + W4 sketch + TSX 변환 양쪽 동일 적용). 28-splash + 17-annual-plan 의 비즈 anchor 1 byte 0 룰 일반화.

### 룰 12 — project_inspection_completion_rule (★ 21-legal-finding-detail 특화 — role admin ZIP 도구 분기 + resolutionPhotos uploadAll async source of truth 일반화)
- **요약**: 점검 완료 = normal | caution | (bad+resolved). isCpCompleted 가 source of truth. 새 화면/통계는 이 룰 강제.
- **Why**: 점검 완료 정의가 페이지별로 일관되지 않으면 사용자 인지/통계 모두 깨짐. isCpCompleted 헬퍼 = source of truth 룰의 일반화.
- **How to apply (21-legal-finding-detail)**: **(1) admin 다운로드 button 조건부 렌더 (line 159, 171 모두 `staff?.role === 'admin' && finding`)** — admin 만 ZIP 다운로드 가능. assistant 는 다운로드 button 미렌더 (조치 입력/완료/결과는 모든 사용자). UI/시안에서 권한 분기 변경 금지. (2) **finding.status open/resolved 분기 (line 218 / line 253)** — 운영 룰 source of truth — UI/시안에서 분기 변경 금지. 두 모드 mutually exclusive (양쪽 동시 렌더 불가). (3) **resolveMutation uploadAll 선행 async pattern (line 67~87)** — mutationFn 안에서 `await resolutionPhotos.uploadAll()` **먼저** 실행 후 legalApi.resolveFinding 호출. photoKeys.length > 0 분기로 undefined or array 결정. onSuccess 4 키 invalidate (`['legal-finding', id, fid]` + `['legal-findings', id]` + `['legal-rounds']` + `['legal-round', id]`) + resolutionPhotos.reset() + navigate(-1) **순서 보존**. **uploadAll 선행 + 4 키 invalidate + navigate(-1) 1 byte 변경 금지**. (4) **handleDownload iOS PWA `<a download>` 패턴 + 파일명 `지적사항_${name}.zip` location 기반** — iOS 안정성 검증된 패턴, 1 byte 변경 금지. (5) **handleResolve memo.trim() validation** (line 132~138) — 빈 값 toast.error '조치 내용을 입력하세요' return 조기 종료. validation 룰 보존 필수. 모두 점검 완료 isCpCompleted 룰의 일반화. W3 sketch + W4 sketch + W5 TSX 변환 양쪽 동일 적용.

---

# §6. negative rule (이 wave 에서 금지된 것)

본 wave (sketch wave 1 = 인덱스 작성) 에서 절대 하지 않는 것:

- **sketch HTML 생성 금지** — sketch 는 W2 부터. 본 wave 산출물은 markdown 1개 (`wave-1-index.md`) 만.
- **LegalFindingDetailPage.tsx 코드 수정 금지** — `cha-bio-safety/src/pages/LegalFindingDetailPage.tsx` 는 분석 대상이지 수정 대상이 아님. `git diff --name-only HEAD -- cha-bio-safety/src/pages/LegalFindingDetailPage.tsx` 결과 0 줄.
- **외부 컴포넌트/훅 수정 금지** — PhotoGrid.tsx / PhotoSourceModal.tsx / useMultiPhotoUpload.ts / utils/findingDownload.ts / utils/api.ts (legalApi) / stores/authStore.ts / hooks/useIsDesktop.ts 모두 본 wave + W2~W5 미수정. 시그니처 + props 보존.
- **비즈 로직 시그니처 변경 금지** — useQuery 1종 (`['legal-finding', id, fid]`) / useMutation 1종 (resolveMutation, uploadAll 선행 + 4 키 invalidate + navigate(-1)) / legalApi 2종 (getFinding / resolveFinding) / handleDownload (fflate ZIP location 기반 파일명) / handleResolve (memo.trim() validation) / finding.status open/resolved 분기 / admin/assistant 다운로드 button 조건부 / resolutionPhotos useMultiPhotoUpload 직접 사용 (slots/canAdd/openPicker/handleFiles/removeSlot/uploadAll/reset/isUploading/cameraRef/albumRef/showPicker/closePicker/pickCamera/pickAlbum) / fmtDate (분까지 표시) / KVRow + SectionHeader / Spinner / @keyframes spin 중복 정의 (line 45 + line 147) / 인라인 SVG ChevronLeft + Download (또는 Lucide 교체 OQ #5) 모두 import/export 동일하게 유지.
- **다른 페이지 (19-legal / 20-legal-findings / 13-schedule / 14-reports / 27-login / 16-workshift / 15-daily-report / 17-annual-plan / 28-splash / 23-education / 02 / 06 등) 영향 금지** — `git status` 에 21-legal-finding-detail/ + .planning/quick/260525-013-* 외 변경 0.
- **wrangler 명령 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler` (디자인 wave 중 `wrangler --project-name=cbc7119` 절대 X). `.claude/settings.local.json` deny 강제. 본 워크트리 (cbc7119-design) 는 `cbc7119-preview.pages.dev` 만 다룸.
- **`npm run deploy` 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler`. `npm run deploy` 는 직원 도메인 (`cbc7119.pages.dev`) 경로. 본 워크트리에서 절대 금지. main push → GitHub Actions 자동 cbc7119-preview 배포만.
- **19-legal + 20-legal-findings + 23-education + 28-splash 의 평면 sketch-wave-*.html 패턴과 다른 폴더 구조 도입 금지** — 4 페이지 모두 평면(flat sibling). `sketch/` 서브폴더 만들지 않음. 21-legal-finding-detail 도 동일 평면 배치 (`21-legal-finding-detail/sketch-wave-N-{slug}.html`).
- **App.tsx 수정 금지** — `MOBILE_NO_NAV_PATHS` (line 71, `/legal/:id/finding/:fid` 미등재 — 정규식 line 117 cover) + `DESKTOP_NO_NAV_PATHS` (line 74) + `DESKTOP_HEADER_HIDE_PATHS` (line 77) + `PAGE_TITLES` (line 79~104, `/legal/:id/finding/:fid` 미등재) + 특수 regex (line 117 `!location.pathname.match(/^\/legal\/.+/)` — showNav=false) + `Route` (line 291) 모두 실측 확인됨. 본 wave + W2~W5 모두 `App.tsx` 손대지 않음.
- **조부모 페이지 (LegalPage @ App.tsx line 289) + 부모 페이지 (LegalFindingsPage @ App.tsx line 290) 수정 금지** — 본 wave + W2~W5 범위 아님. 20-legal-findings 가 부모 페이지 담당.
- **★ finding.status open/resolved 분기 시그니처 변경 금지** — open → Section 3 (textarea + 사진 5장 슬롯 + 데스크톱 inline CTA + 모바일 고정 하단 CTA 렌더) / resolved → Section 4 (KVRow 3행 + 조치 사진 PhotoGrid 렌더). 1 byte 변경 금지. 두 모드 mutually exclusive.
- **★ paddingBottom 분기 변경 금지** — open 모바일 `calc(72px + var(--sab, 0px))` (고정 CTA 영역 회피) / open 데스크톱 24 / resolved 양쪽 24. 변경 시 콘텐츠 가려짐 사고.
- **★ admin 다운로드 button 조건부 렌더 변경 금지** — `staff?.role === 'admin' && finding` (line 159, 171 모두). admin 만 ZIP 다운로드, assistant 다운로드 button 미렌더. 운영 룰 source of truth, 1 byte 변경 금지.
- **★ useAuthStore selector 패턴 변경 금지** — `useAuthStore(s => s.staff)` (line 58, selector 패턴 — 20-legal-findings 의 getState() 와 다름). 본 페이지 selector 패턴 유지.
- **★ resolveMutation uploadAll 선행 + 4 키 invalidate + navigate(-1) 변경 금지** — mutationFn 안 `await resolutionPhotos.uploadAll()` 먼저 실행 → photoKeys.length > 0 분기로 array or undefined 결정 → legalApi.resolveFinding 호출. onSuccess 순서: invalidate 4 키 (`['legal-finding', id, fid]` / `['legal-findings', id]` / `['legal-rounds']` / `['legal-round', id]`) → toast.success '조치 완료' → resolutionPhotos.reset() → navigate(-1).
- **★ legalApi 2종 시그니처 변경 금지** — `legalApi.getFinding(roundId, findingId)` / `legalApi.resolveFinding(roundId, findingId, { resolution_memo?, resolution_photo_keys? })` 모두 보존. 특히 snake_case payload (`resolution_memo`, `resolution_photo_keys`) + camelCase props (`roundId`, `findingId`) 혼용 패턴 보존. 본 wave + W2~W5 모두 utils/api.ts 손대지 않음.
- **★ handleDownload iOS PWA `<a download>` 패턴 변경 금지** — createElement('a') + body.appendChild + click + removeChild + setTimeout(URL.revokeObjectURL, 3000). iOS PWA 안정성 검증된 패턴. 본 wave + W2~W5 변경 금지.
- **★ ZIP 파일명 + 사진 파일명 패턴 변경 금지** — `지적사항_${name}.zip` (line 119, name = `(finding.location ?? '위치없음').replace(/[\/\\:*?"<>|]/g, '_')` — **location 기반**, 20-legal-findings round.title 기반과 다르고, fid 기반도 아님) / `지적사진-${j+1}.jpg` / `조치사진-${j+1}.jpg` (line 104, 111). 본 wave + W2~W5 utils/findingDownload.ts + 본 페이지 미수정.
- **★ useMultiPhotoUpload 직접 사용 패턴 변경 금지** — line 59 `resolutionPhotos = useMultiPhotoUpload()`. FindingFormSheet 우회 X (20-legal-findings 와 다른 패턴). slots / canAdd / openPicker / closePicker / pickCamera / pickAlbum / handleFiles / removeSlot / uploadAll / reset / isUploading / cameraRef / albumRef / showPicker 모두 직접 호출.
- **★ handleResolve memo.trim() validation 변경 금지** — 빈 값 toast.error '조치 내용을 입력하세요' return 조기 종료 (line 133~136).
- **toast 카피 verbatim 5종 변경 금지** — success 2 ('조치 완료' / '다운로드 완료') + error 3 ('조치 처리 실패' / '조치 내용을 입력하세요' / '다운로드 실패').
- **에러/placeholder/라벨 카피 verbatim 변경 금지** — '지적 상세' (헤더) / '항목을 불러오지 못했습니다. 뒤로 가서 다시 시도하세요.' (에러 단일 문장) / SectionHeader 4종 ('지적 정보' / '지적 사진' / '조치 내용' / '조치 결과') / KVRow label 7종 ('지적 내용' / '위치' / '등록일' / '등록자' / '조치일시' / '조치자' / '조치 내용') / '사진 없음' (빈) / '조치 사진 (최대 5장)' (라벨) / '조치 내용을 입력하세요' (textarea placeholder) / '사진 첨부' (canAdd) / '✕' (제거) / '업로드 중' (overlay) / '조치 완료' / '처리 중...' (CTA) / '다운로드' / '다운로드 중...' (데스크톱 admin) / '-' (KVRow null fallback) / '위치 미지정' 패턴 없음 (본 페이지는 `location ?? '-'`).
- **데스크톱 maxWidth 700 변경 금지** — 의도된 디자인 (단일 컬럼 중앙 정렬 — 20-legal-findings 800 보다 좁음, 단일 finding 상세 의도). "맥스 800 으로 늘려" 변경 금지.
- **모바일 고정 하단 CTA 패턴 보존** — position fixed bottom 0 left 0 right 0 padding '12px 16px' paddingBottom 'calc(12px + var(--sab, 0px))' + button width 100% h 48 transition 'opacity 0.15s'. status open 한정 (resolved 는 미렌더). 콘텐츠 영역 paddingBottom 'calc(72px + var(--sab, 0px))' 회피 패턴 (open 모바일 한정).
- **데스크톱 inline CTA 패턴 보존** — Section 3 안 marginTop 16 width 100% h 48 bg var(--acl) (모바일 고정 CTA 와 동일 스타일, 위치만 다름). status open 한정.
- **@keyframes spin 중복 정의 보존** — line 45 (Spinner 함수 내부) + line 147 (JSX 외곽 인라인) 두 곳 모두 동일 정의 `to{transform:rotate(360deg)}`. OQ #5 LOCKED Lucide Loader2 교체 시 양쪽 모두 폐기.
- **모바일 헤더 자체 렌더 보존 (line 149~165)** — height 48 + back button 36x36 position absolute left 12 + admin 다운로드 button 36x36 position absolute right 12 (admin 조건부) + '지적 상세' 정중앙 + bg `rgba(22,27,34,0.97)` (raised 변형 alpha). **OQ #5 LOCKED 시 back + admin 다운로드 모두 44x44 격상 + Lucide ChevronLeft + Download 교체** — 그 외 변경 금지. 데스크톱은 자체 타이틀 영역 (padding '24px 32px 12px') 만, 글로벌 AppHeader 도 line 117 정규식으로 숨김.
- **fmtDate 분까지 표시 패턴 보존** — null → '-' / `${y}.${m}.${d} ${HH}:${mm}` zero-padded (line 15~19). 20-legal-findings 의 일까지만 표시와 다름 — 본 페이지는 분까지 (조치일시 정밀 표시 의도).
- **KVRow + SectionHeader 컴포넌트 시그니처 보존** — KVRow (label width 64 flexShrink 0 + children flex 1 lineHeight 1.5 + gap 12 alignItems flex-start) + SectionHeader (12/700 var(--t3) marginBottom 10). 본 wave + W2~W5 변경 금지.
- **사진 슬롯 5종 UI 패턴 보존** — slot img 72x72 borderRadius 10 border 1px var(--bd) + 제거 button (-6,-6) 20x20 borderRadius 50% bg var(--danger) color #fff fontSize 11/700 '✕' + uploading overlay inset 0 bg rgba(0,0,0,0.4) borderRadius 10 fontSize 10 #fff '업로드 중' + canAdd 72x72 borderRadius 10 bg var(--bg3) border 1px dashed var(--bd2) color var(--t3) fontSize 11/600 '📷' fontSize 22 '사진 첨부'. 1 byte 변경 금지.
- **textarea 스타일 패턴 보존** — rows 3 width 100% bg var(--bg3) borderRadius 9 padding '10px 12px' border 1px var(--bd2) color var(--t1) fontSize 13 boxSizing border-box fontFamily inherit lineHeight 1.5 resize vertical outline none. 1 byte 변경 금지.

---

# §7. open questions (W2 진입 직전 사용자 컨펌)

본 wave 산출 후 W2 sketch 진입 전 사용자에게 컨펌 받아야 할 항목 5건. 각 OQ 아래 "default 답" 1줄 — 사용자가 별 의견 없으면 이 답으로 진행할 것이라는 reasonable call. 단, "approved" 받기 전까지 W2 진입 금지 (memory `feedback_avoid_premature_confirmation`).

- **OQ #1**: 모바일 자체 헤더 배경 `rgba(22,27,34,0.97)` (raised 변형 alpha, line 152) → chrome 룰 §2.1 `bg-surface-page` 통일 vs raised 유지 (alpha 0.97 vs full opacity)?
  - **default 답: raised 유지 + alpha 0.97 보존** (19-legal W1 + 20-legal-findings W1 + 16-workshift + 17-annual-plan + 02 InspectionPage + 28-splash + 23-education 7 페이지 일관 패턴). 모바일 헤더 = `bg-surface-raised/97` arbitrary (또는 인라인 유지). 데스크톱 자체 타이틀 영역은 별도 배경 없음 (외곽 var(--bg) 그대로). 본 OQ 적용 시 W2 sketch + TSX 변환 양쪽 동일 적용.

- **OQ #2**: finding 상태 표시 추가 여부 — 현재 finding.status open/resolved 화면 모드 자체로 표현 (form vs 결과). **페이지 헤더 또는 SectionHeader 근처에 status 칩 추가**? 추가 시 토큰 — `bg-{safe|danger}-bg text-{safe|danger}` (status- prefix 없음 + KVRow 만 사용, borderLeft 0건 — 20-legal-findings 의 borderLeft 2px 와 다른 패턴 — 단일 finding 상세 → 카드 borderLeft 시각 metaphor 불요)?
  - **default 답: 칩 무 유지** — 화면 모드 자체로 표현이 정보 인지 단순화 (§1.2). 추가 시 정보 중복 우려 (KVRow + status 칩 + Section 4 결과 표시 = 3중 표시). 단 시각 일관성 강화 옵션으로 페이지 헤더 우측 또는 SectionHeader '지적 정보' 옆에 칩 추가 가능 — **사용자 컨펌으로 채택 가능**. 채택 시 status- prefix 없음 룰 (memory `feedback_tailwind_token_class_pattern`) 일치 + 19-legal LegalPage / 20-legal-findings W1 OQ #2 칩 패턴 mirror. **borderLeft 0건 유지 필수** (단일 finding 상세 페이지 → 카드 borderLeft 적용 위치 없음).

- **OQ #3**: §1.1 fontSize 9·10·11 위반 격상 — LegalFindingDetailPage 의 10 (uploading overlay '업로드 중') + 11 (제거 button '✕' / canAdd '사진 첨부') 모두 §1.1 마지노선 위반. **모두 12 격상 vs 인라인 유지**?
  - **default 답: 격상 OK** (§1.1 노안 친화 룰 우선). 11 → text-caption(12) / 10 → text-caption(12). 격상 후 leading-none 명시 (memory `feedback_text_caption_leading_none`). 단 시각 균형 (제거 button '✕' 이 너무 커짐 — 20x20 컨테이너에 12 fontSize 부적합) 우려 시 사용자 컨펌으로 일부 인라인 유지 (예: 제거 button '✕' 11 유지 / canAdd + uploading overlay 만 12 격상). 격상 시 padding 조정 (canAdd padding 동시 검토) 동시 검토. 20-legal-findings + 19-legal + 23-education + 16-workshift + 17-annual-plan W1 OQ 비슷한 패턴 일관.

- **OQ #4**: 메인 CTA (조치 완료 button — 모바일 고정 하단 line 270~275 + 데스크톱 inline line 244~248, 양쪽 width 100% h 48) 현재 solid `var(--acl)` → design-system §6.4 그라데이션 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` 통일 vs solid 유지? **+ 데스크톱 admin 다운로드 button (텍스트형 h 36 line 172) 그라데이션 vs solid 유지?**
  - **default 답 (CTA)**: **그라데이션 OK** (design-system §6.4 CTA 룰 + 19-legal / 20-legal-findings / 14-reports / 16-workshift / 17-annual-plan / 23-education W1 OQ 그라데이션 default 일관). 그라데이션 색은 §6.4 룰 (#1d4ed8, #0ea5e9) 우선. 메인 CTA 한정 (조치 완료 — 모바일 고정 + 데스크톱 inline 양쪽). disabled 시 = `bg-surface-sunken text-text-tertiary cursor-not-allowed` (현재 opacity 0.5 + cursor not-allowed 일관). 사용자 컨펌 결과에 따라 그라데이션 vs solid 둘 중 LOCKED. 28-splash W1 OQ #1 LOCKED 는 정반대 (solid) — 21-legal-finding-detail 는 §6.4 CTA 룰 우선.
  - **default 답 (admin 다운로드)**: **solid 유지** (작은 도구 그라데이션 = 시각 잡음 — 메인 CTA 와 시각적 구분 필요). 데스크톱 admin 다운로드 button = `bg-surface-sunken border-border-strong text-text-primary` solid 유지. 모바일 admin 다운로드 button = icon button (bg 없음 + color 만) — 그라데이션 적용 X.

- **OQ #5**: 아이콘 Lucide 교체 + 모바일 button 44x44 격상 —
  (1) 모바일 헤더 back button 인라인 SVG ChevronLeft (line 156, polyline path `M15 19l-7-7 7-7` strokeWidth 2 size 20) → Lucide `ChevronLeft size={20}` 교체? + back button **36x36 → 44x44 격상**?
  (2) 모바일 헤더 admin 다운로드 button 인라인 SVG Download (line 161, path `M12 5v14m0 0l-6-6m6 6l6-6M5 19h14` size 18) → Lucide `Download size={18}` 교체? + admin 다운로드 button **36x36 → 44x44 격상**?
  (3) Spinner 함수 (line 41~48, 인라인 div + @keyframes spin) → Lucide `Loader2 size={24} className="animate-spin"` 교체? + Spinner 함수 line 41~48 폐기 + 외곽 인라인 keyframe (line 147) 도 폐기?
  (4) canAdd button '📷' 이모지 (line 237, fontSize 22) → Lucide `Camera size={22}` 교체?
  (5) 제거 button '✕' (line 231, fontSize 11) → Lucide `X size={11}` 교체 (선택)?
  - **default 답**:
    - **(1) 교체 + 44x44 격상 OK** (§7.4 "뒤로가기: ChevronLeft" + §1.1 터치 44px + 19-legal / 20-legal-findings / 16-workshift / 17-annual-plan / 28-splash / 23-education W1 OQ Lucide ChevronLeft 교체 LOCKED 일관). back button position absolute left 12 → left 8 또는 left 12 유지 (44 - 36 = 8px 추가 영역, 정중앙 타이틀 영향 없음).
    - **(2) 교체 + 44x44 격상 OK** (모바일 admin 다운로드 button 양쪽 동시 44x44 격상 — back + admin 다운로드 동일 사이즈 유지). Lucide `Download size={18}` (icon size 는 button 사이즈와 별개).
    - **(3) 교체 OK** (Lucide `Loader2` + `animate-spin` className — 인라인 div + @keyframes spin 폐기, Spinner 함수 line 41~48 폐기 + 외곽 인라인 keyframe 정의 line 147 폐기). size={24} 유지 (§7.1 16/20/24 3 종 중 24 일치). 모두 lucide-react import 추가.
    - **(4) 교체 OK** (Lucide `Camera size={22}` — 이모지 0건 룰 일치, 19-legal LegalPage FindingDetailPanel '📷' → Camera 교체 OQ 일치).
    - **(5) 제거 button '✕' 유지** — unicode 글리프 (이모지 아님), 11 → 12 격상 시 (OQ #3) leading-none 명시. Lucide X 교체는 선택 (시각 비교 후 결정).
  - W2 모바일 chrome sketch + W2 Spinner sketch + W4 사진 슬롯 sketch + W5 TSX 변환 양쪽 동일 적용.

각 OQ 의 default 답은 사용자가 별 의견 없으면 이 답으로 진행할 것이라는 reasonable call. 단, "approved" 받기 전까지 W2 진입 금지.

---

## 자체 verify (작성 완료 후 본 인덱스가 통과해야 할 gate)

1. 7개 섹션 모두 존재 (§1~§7) — `grep '^# §[1-7]'` 카운트 = 7
2. 메모리 룰 12개 인용 — `feedback_*` (10개) + `feedback_inspection_unresolved_color` (11번째) + `project_inspection_completion_rule` (12번째) 가 본문에 등장 (unique `feedback_*` ≥ 10)
3. sub-wave 분배 표가 W2~W5 4행 — 표 안에 `| W[2-5] |` 카운트 = 4
4. design-system 인용 fence 가 최소 6개 (§1.1 / §1.2 / §1.3 / §6.4 / §6.6 / §7.1) — fence 카운트 ≥ 12 (open+close)
5. negative rule 안 `wrangler` + `npm run deploy` 키워드 모두 등장 (≥1 each)
6. OQ 5건 — `OQ #` 카운트 ≥ 5
7. LegalFindingDetailPage.tsx 변경 0 — `git diff --name-only HEAD -- {파일}` 가 빈 출력
8. legalApi 2종 (`legalApi.getFinding` + `legalApi.resolveFinding`) anchor 본문 등장 ≥ 2
