---
title: "redesign/23-education — wave 5 (TSX 변환 verify checklist)"
status: ready_for_tsx_wave
created: 2026-05-22
quick_id: 260522-o7b
branch: redesign/23-education
source_tsx: cha-bio-safety/src/pages/EducationPage.tsx
source_tsx_lines: 591
sketch_inputs:
  - cha-bio-safety/docs/redesign-context/23-education/sketch-wave-2-chrome-empty.html
  - cha-bio-safety/docs/redesign-context/23-education/sketch-wave-3-staff-card.html
  - cha-bio-safety/docs/redesign-context/23-education/sketch-wave-4-edit-modal.html
mirror_of: cha-bio-safety/docs/redesign-context/28-splash/wave-5-tsx-conversion-checklist.md (260522-2q6) + cha-bio-safety/docs/redesign-context/17-annual-plan/wave-5-tsx-conversion-checklist.md (260522-0j3)
oq_locked_count: 5
biz_anchor_count: 12
memory_rules_inline: 12
---

# redesign/23-education — wave 5 (TSX 변환 verify checklist)

본 문서는 redesign/23-education 의 sketch 3 wave (W2 chrome+empty + W3 staff-card + W4 edit-modal) 결정을 토대로
`EducationPage.tsx` (591 lines) **단일 atomic 변환** 을 위한 **verify checklist** 다 (markdown).
sketch 가 아닌 markdown — 본 wave 작성 후 사용자 시각 검수 → 다음 quick task (W6 — TSX 변환) 진입 직전
본 checklist 의 §3 매핑 표 verbatim + §5/§6/§7/§8 verify gate 그대로 적용.

mirror_of: 28-splash/wave-5-tsx-conversion-checklist.md (260522-2q6) + 17-annual-plan/wave-5-tsx-conversion-checklist.md (260522-0j3).
차이점 = EducationPage 591 lines 단일 파일 통합 (28-splash 320 lines 의 1.8배 + 17-annual-plan 단일 파일 패턴 mirror) +
OQ 결정 내용 (모바일 헤더 raised + D-day status 토큰 3 임계치 + submit 그라데이션 인라인 + 빈/오류 아이콘 무 + Lucide ChevronLeft) +
W4 만 linear-gradient 예외 anchor (OQ #3 LOCKED submit 그라데이션 채택).

---

## §1. 변환 범위 + 산출 파일

- **EducationPage.tsx 591 lines 단일 atomic 변환** (in-place):
  - `cha-bio-safety/src/pages/EducationPage.tsx` (591 lines → 약 580~620 lines 예상)
  - 4 내부 컴포넌트 (DdayBadge + StaffEducationCard + EducationEditPanel + EducationBottomSheet + 메인 EducationPage) 통합 변환
  - Tailwind v0.1.1 className 으로 인라인 style 치환
- W2 (모바일 헤더 + 빈/로딩/오류 + 데스크톱 outline) + W3 (직원 카드 + DdayBadge + 그룹핑) + W4 (등록/수정/삭제 모달)
  3 sketch 결정 → className 1:1 매핑
- **components.css 신규 생성 X** (현재 tokens.css + typography.css 만 사용)
- **`src/App.tsx` 변경 X** (PAGE_TITLES / MOBILE_NO_NAV_PATHS / Route 모두 현재 유지)
- **Lucide import 추가 1 줄** — `import { ChevronLeft } from 'lucide-react'` (OQ #5 LOCKED)
- **IconChevronLeft 함수 정의 (line 12~18) 제거** (OQ #5 LOCKED — Lucide 교체 후 단일 사용처 외 의존 0)
- **★ 비즈 anchor 12건 1 byte 변경 금지** (§2 박스)
- 비즈 로직 0 diff (state/handler/effect/hook 모두 보존, §10 체크박스)

산출 (W6 wave 의 expected output):
1. `EducationPage.tsx` 단일 파일 atomic 변환 완료 (in-place)
2. atomic commit 1개: `feat(23-education): W6 TSX 변환 (v0.1.1 className 매핑 + 비즈 anchor 12건 보존 + Lucide ChevronLeft 교체 + OQ LOCKED 5건 반영)`
3. `App.tsx` 변경 0 byte (final verify gate)

---

## §2. 보존 (비즈 anchor 12건 박스 — 1 byte 변경 금지)

### ★ EducationPage 12건 (line 별, `EducationPage.tsx`)

```
1. calcNextDeadline (line 21~33) + addMonths(parseISO(appointedAt), 6) (첫 실무) + addYears(parseISO(sorted[0].completedAt), 2) (보수)
2. differenceInCalendarDays(d, new Date()) (line 29, 32) → D-day 산출
3. TITLE_ORDER {'주임':0, '대리':1, '기사':2} (line 49) + titleRank(title) → TITLE_ORDER[title] ?? 99 (line 50)
4. D-day 분기 매트릭스 — dday > 30 → safe / 0 ≤ dday ≤ 30 → warning / dday < 0 → danger (line 66~78)
   + 라벨 'D-${dday}' (safe + warning) / 'D+${Math.abs(dday)} 초과' (danger)
5. useQuery<StaffEducation[]>({ queryKey: ['education'], queryFn: educationApi.list }) (line 427~430)
6. useMutation × 3 (line 212~244):
   - createMutation: educationApi.create({ staffId, education_type, completed_at }) + onSuccess invalidateQueries ['education'] + toast.success '이수일이 기록되었습니다.' + onSaved
   - updateMutation: educationApi.update(editingRecord!.id, { completed_at }) + onSuccess + toast.success '이수일이 수정되었습니다.'
   - deleteMutation: educationApi.delete(id) + onSuccess + toast.success '이수 기록이 삭제되었습니다.' + onError 'e?.message ?? 삭제에 실패했습니다.'
7. educationApi.list / educationApi.create / educationApi.update / educationApi.delete (line 6 import, 213/227/237 호출)
   snake_case payload (education_type / completed_at) + positional id
8. useIsDesktop() (line 8 import / line 422 호출, >=768px)
9. useAuthStore.staff = currentStaff (line 423) + canEdit (line 432~435):
   currentStaff?.role === 'admin' || currentStaff.id === cardStaffId
10. @keyframes blink (line 583~588, 0%/100% opacity 1 + 50% opacity 0.4)
    + @keyframes slideUp (글로벌, EducationBottomSheet 'slideUp 0.28s ease-out both' line 406)
11. toast 카피 5종 verbatim (line 220/223/230/233/240/243):
    create.success '이수일이 기록되었습니다.'
    update.success '이수일이 수정되었습니다.'
    delete.success '이수 기록이 삭제되었습니다.'
    create+update.error '이수 기록 저장에 실패했습니다.'
    delete.error 'e?.message ?? 삭제에 실패했습니다.'
12. 빈/오류 카피 verbatim (line 472/477/478):
    오류 '교육 현황을 불러오지 못했습니다. 화면을 당겨서 새로고침하세요.'
    빈 제목 '교육 이력 없음'
    빈 보조 '이수일을 기록하면 다음 교육 마감일이 자동으로 계산됩니다.'
    데스크톱 우측 fallback '좌측에서 직원을 선택하세요' (line 528)
```

### 비즈 로직 보존 표 (line 별)

| file | line | 항목 | 보존 방식 |
|---|---|---|---|
| EducationPage.tsx | 1~9 | import 9개 (useState / useNavigate / useQuery+useMutation+useQueryClient / date-fns 4종 / toast / educationApi / useAuthStore / useIsDesktop / type EducationRecord+StaffEducation) | 그대로 + **추가**: `import { ChevronLeft } from 'lucide-react'` (OQ #5 LOCKED) |
| EducationPage.tsx | 12~18 | IconChevronLeft 인라인 SVG 함수 | **제거** (OQ #5 LOCKED — Lucide 교체) |
| EducationPage.tsx | 21~33 | calcNextDeadline 함수 | **1 byte 변경 금지** (★ 비즈 anchor 1) |
| EducationPage.tsx | 35~46 | fmtDate + dateToYmd 헬퍼 | 그대로 |
| EducationPage.tsx | 49~50 | TITLE_ORDER + titleRank | **1 byte 변경 금지** (★ 비즈 anchor 3) |
| EducationPage.tsx | 53~58 | SKELETON_STYLE | **className 변환 대상** (§3.1) — height/animation 보존, var(--bg3) → 토큰 |
| EducationPage.tsx | 61~93 | DdayBadge 함수 | **className 변환 대상** (§3.2, OQ #2 LOCKED 3 임계치) |
| EducationPage.tsx | 96~187 | StaffEducationCard 함수 | **className 변환 대상** (§3.3, OQ #3 LOCKED selected border-2) |
| EducationPage.tsx | 190~390 | EducationEditPanel 함수 | **className 변환 대상** (§3.4, OQ #3 LOCKED submit 그라데이션 + disabled) |
| EducationPage.tsx | 212~244 | useMutation × 3 + isSubmitting | **1 byte 변경 금지** (★ 비즈 anchor 6 + toast 11) |
| EducationPage.tsx | 369~370 | select option '실무교육 (최초)' / '보수교육' | **1 byte 변경 금지** (★ verbatim) |
| EducationPage.tsx | 383 | submit text 'isSubmitting ? "저장 중..." : (isEditMode ? "수정 완료" : "이수일 기록")' | **1 byte 변경 금지** (★ verbatim) |
| EducationPage.tsx | 393~417 | EducationBottomSheet 함수 | **className 변환 대상** (§3.5, slideUp 인라인 anchor 보존) |
| EducationPage.tsx | 420~590 | EducationPage 메인 + 데스크톱/모바일 분기 + 빈/로딩/오류 | **className 변환 대상** (§3.6, OQ #1 + OQ #4 + OQ #5 LOCKED) |
| EducationPage.tsx | 427~430 | useQuery queryKey ['education'] | **1 byte 변경 금지** (★ 비즈 anchor 5) |
| EducationPage.tsx | 432~435 | canEdit 함수 | **1 byte 변경 금지** (★ 비즈 anchor 9) |
| EducationPage.tsx | 438~439 | adminList + assistantList sort | **1 byte 변경 금지** (★ titleRank 활용) |
| EducationPage.tsx | 471~473 | 오류 카피 verbatim | **1 byte 변경 금지** (★ OQ #4 LOCKED) |
| EducationPage.tsx | 477~478 | 빈 카피 verbatim | **1 byte 변경 금지** (★ OQ #4 LOCKED) |
| EducationPage.tsx | 528 | 데스크톱 fallback '좌측에서 직원을 선택하세요' | **1 byte 변경 금지** (★ verbatim) |
| EducationPage.tsx | 549~565 | 모바일 자체 헤더 (back button + 타이틀 + spacer) | **className 변환 대상** (§3.6, OQ #1 + OQ #5 LOCKED) |
| EducationPage.tsx | 559 | IconChevronLeft size={20} 사용처 | **교체**: `<ChevronLeft size={20} />` (OQ #5 LOCKED) |
| EducationPage.tsx | 562 | 모바일 타이틀 '보수교육' | **1 byte 변경 금지** (★ verbatim) |
| EducationPage.tsx | 583~588 | @keyframes blink 인라인 style | **1 byte 변경 금지** (★ animation anchor) |
| App.tsx | 전체 | PAGE_TITLES / MOBILE_NO_NAV_PATHS / Route | **0 byte 변경 금지** |

---

## §3. 변환 매핑 (영역별 className/토큰 — W2/W3/W4 sketch verbatim 인용)

### §3.1 영역 1 — 상단 유틸 / 상수 / 스켈레톤 (line 1~58)

| 현재 (인라인 style) | 변환 후 (className + 인라인) | sketch 출처 |
|---|---|---|
| imports 9개 (line 1~9) | 그대로 + **추가**: `import { ChevronLeft } from 'lucide-react'` (OQ #5 LOCKED) | W2 |
| IconChevronLeft 인라인 SVG (line 12~18) | **함수 정의 + 사용처 모두 제거** (OQ #5 LOCKED) | W2 |
| calcNextDeadline + fmtDate + dateToYmd + TITLE_ORDER + titleRank (line 21~50) | 그대로 (★ 비즈 anchor) | - |
| SKELETON_STYLE (line 53~58): `background: 'var(--bg3)', borderRadius: 12, height: 88, animation: 'blink 2s ease-in-out infinite'` | React.CSSProperties 인라인 그대로 유지 (단계적 토큰 치환 — `bg-surface-sunken rounded-md` 클래스 + 인라인 height/animation 분리 옵션). 또는 SKELETON 컴포넌트로 분리 `<div className="bg-surface-sunken rounded-md" style={{ height: 88, animation: 'blink 2s ease-in-out infinite' }} />` | W2 |

### §3.2 영역 2 — DdayBadge (line 61~93, OQ #2 LOCKED ★)

| 현재 (인라인 style) | 변환 후 (className + 인라인) | sketch 출처 |
|---|---|---|
| 분기 매트릭스 (line 66~78): `dday > 30 → bg:'rgba(34,197,94,0.12)', color:'var(--safe)'` / `0~30 → bg:'rgba(245,158,11,0.15)', color:'var(--warn)'` / `<0 → bg:'rgba(239,68,68,0.15)', color:'var(--danger)'` | className 분기 — `bg-safe-bg text-safe` (>30) / `bg-warning-bg text-warning` (0~30) / `bg-danger-bg text-danger` (<0). 옛 rgba + var(--safe)/var(--warn)/var(--danger) 인라인 모두 제거. **status- prefix 없음** (memory feedback_tailwind_token_class_pattern) | W3 |
| 라벨 'D-${dday}' (safe + warning) / 'D+${Math.abs(dday)} 초과' (danger) | **1 byte 변경 금지** (★ OQ #2 LOCKED verbatim, 임계치 30/0 + 라벨 모두) | W3 |
| 외곽 (line 80~91): `fontSize:12, fontWeight:700, padding:'2px 8px', borderRadius:8, flexShrink:0` | `<div className="text-caption font-bold leading-none rounded-sm [분기 매트릭스 토큰]" style={{ padding: '2px 8px', flexShrink: 0 }} >` (memory feedback_text_caption_leading_none — leading-none 강제) | W3 |

### §3.3 영역 3 — StaffEducationCard (line 96~187, OQ #3 LOCKED selected ★)

| 현재 (인라인 style) | 변환 후 (className + 인라인) | sketch 출처 |
|---|---|---|
| 외곽 div (line 114~125): `background:'var(--bg2)', borderRadius:12, padding:16, border: selected ? '1.5px solid var(--acl)' : '1px solid var(--bd)', cursor, minHeight:80, WebkitTapHighlightColor:'transparent', userSelect:'none'` | `<div className={`bg-surface-raised rounded-md ${selected ? 'border-2 border-accent' : 'border border-border-default'}`} style={{ padding:16, minHeight:80, cursor: canEdit ? 'pointer' : 'default', WebkitTapHighlightColor:'transparent', userSelect:'none' }} >` (OQ #3 LOCKED: 1.5 → 2 / var(--acl) → border-accent, **데스크톱만 selected**) | W3 |
| 아바타 (line 130~144): `width:32, height:32, borderRadius:'50%', background:'var(--bg3)', color:'var(--t2)', fontSize:14, fontWeight:700, flexShrink:0` | `<div className="bg-surface-sunken text-text-secondary text-body-sm font-bold rounded-full" style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }} >` (w-8 = 48px 함정 회피 — 32px 인라인 명시) | W3 |
| 이름 (line 148): `fontSize:16, fontWeight:700, color:'var(--t1)', lineHeight:1.3` | `<div className="text-body font-bold text-text-primary" style={{ lineHeight:1.3 }} >` | W3 |
| 직책 (line 151): `fontSize:13, fontWeight:400, color:'var(--t2)', marginTop:2` | `<div className="text-label text-text-secondary" style={{ marginTop:2 }} >` | W3 |
| 메타 (line 165, 171, 176, 179): `fontSize:12, fontWeight:400, color:'var(--t3)'` 또는 `var(--t2)` | `<div className="text-caption leading-relaxed text-text-tertiary">` (마지막 이수 / 다음 마감 label) / `<span className="text-caption leading-relaxed text-text-secondary">` (다음 마감 일자) | W3 |

### §3.4 영역 4 — EducationEditPanel (line 190~390, OQ #3 LOCKED submit + disabled ★)

| 현재 (인라인 style) | 변환 후 (className + 인라인) | sketch 출처 |
|---|---|---|
| 프로필 헤더 (line 276~289): 40x40 아바타 + 이름 fontSize:18 + 직책 fontSize:13 + DdayBadge | `<div className="bg-surface-sunken text-text-secondary text-body font-bold rounded-full" style={{ width:40, height:40, ... }} >` 아바타 + `<div className="text-title font-extrabold text-text-primary">` 이름 + `<div className="text-label text-text-secondary">` 직책 + DdayBadge (영역 2 동일) | W4 |
| 마감 정보 박스 (line 292~299): `background:'var(--bg3)', borderRadius:10, padding:'12px 16px'` + '다음 마감' fontSize:12 var(--t3) + 일자 fontSize:14 fontWeight:600 var(--t1) + (label) fontSize:12 var(--t3) | `<div className="bg-surface-sunken rounded-md" style={{ padding:'12px 16px' }} >` + `<div className="text-caption leading-none text-text-tertiary">` + `<div className="text-body-sm font-bold text-text-primary">` + `<span className="text-caption leading-none text-text-tertiary">` | W4 |
| 이수 이력 row (line 306~340): `background:'var(--bg3)', borderRadius:8, padding:'8px 12px'` + date fontSize:13 var(--t2) + 수정/취소 버튼 + 삭제 버튼 (border + padding + color) | `<div className="bg-surface-sunken rounded-sm" style={{ padding:'8px 12px' }} >` + `<span className="text-label text-text-secondary">` + 액션 버튼 `<button className="bg-surface-raised border border-border-strong text-label leading-none rounded-sm" style={{ padding:'4px 10px', cursor: ... }} >` (수정 text-text-secondary / 삭제 text-text-tertiary) | W4 |
| 폼 borderTop (line 347): `borderTop:'1px solid var(--bd)', paddingTop:16` | `<div className="border-t border-border-default" style={{ paddingTop:16 }} >` | W4 |
| 폼 라벨 (line 348, 353, 357): `fontSize:13 var(--t2)` (제목) + `fontSize:12 var(--t3)` (이수일/교육 유형) | `<div className="text-label font-bold text-text-secondary">` (제목) + `<div className="text-caption leading-none font-bold text-text-tertiary">` (라벨) | W4 |
| input/select inputStyle (line 266~271): `width:'100%', background:'var(--bg3)', borderRadius:9, padding:'10px 12px', border:'1px solid var(--bd2)', color:'var(--t1)', fontSize:13, ...` | `<input className="bg-surface-sunken border border-border-strong text-label text-text-primary rounded-md" style={{ width:'100%', padding:'10px 12px', outline:'none', boxSizing:'border-box', fontFamily:'inherit', WebkitAppearance:'none', appearance:'none', minWidth:0 }} />` (radius 9 → rounded-md 12 또는 rounded-[9px] arbitrary) | W4 |
| select disabled 분기 (line 358~371): `color: (!hasRecords && !isEditMode) ? 'var(--t3)' : 'var(--t1)', cursor: 'default', pointerEvents: 'none'` | className 동적 분기 — `${(!hasRecords && !isEditMode) ? 'bg-surface-sunken text-text-tertiary cursor-not-allowed' : 'bg-surface-sunken text-text-primary cursor-pointer'}` (OQ #3 LOCKED disabled 토큰) + disabled prop + 인라인 pointerEvents | W4 |
| **★ submit button** (line 374~384): `width:'100%', height:44, background:'var(--acl)', borderRadius:10, border:'none', color:'#fff', fontWeight:700, fontSize:14, cursor: ..., opacity: ..., marginTop:4` | `<button className="text-text-on-accent text-body font-bold rounded-md" style={{ width:'100%', height:44, border:'none', cursor: isSubmitting ? 'default' : 'pointer', opacity: isSubmitting ? 0.6 : 1, marginTop:4, background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)' }} disabled={isSubmitting \|\| !completedAt} >` (★ OQ #3 LOCKED 인라인 그라데이션 유지, var(--acl) → 인라인 그라데이션) | W4 |

### §3.5 영역 5 — EducationBottomSheet (line 393~417)

| 현재 (인라인 style) | 변환 후 (className + 인라인) | sketch 출처 |
|---|---|---|
| 오버레이 (line 397~400): `position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', flexDirection:'column', justifyContent:'flex-end', zIndex:50` | 인라인 그대로 유지 (alpha 정밀도, OQ #4 정신 일관 — 인라인 anchor) | W4 |
| 시트 (line 402~408): `background:'var(--bg2)', borderRadius:'16px 16px 0 0', animation:'slideUp 0.28s ease-out both', maxHeight:'90vh', overflowY:'auto', padding:'16px 16px 32px'` | `<div className="bg-surface-raised rounded-t-lg" style={{ animation:'slideUp 0.28s ease-out both', maxHeight:'90vh', overflowY:'auto', padding:'16px 16px 32px' }} >` (rounded-t-lg = 16px or rounded-t-[16px] arbitrary, ★ slideUp 인라인 anchor 보존) | W4 |
| handle 32x4 (line 411): `width:32, height:4, background:'var(--bd2)', borderRadius:2` | `<div className="bg-border-strong rounded-sm" style={{ width:32, height:4 }} />` | W4 |

### §3.6 영역 6 — EducationPage 메인 + 데스크톱/모바일 분기 (line 419~590, OQ #1 + OQ #4 + OQ #5 LOCKED ★)

| 현재 (인라인 style) | 변환 후 (className + 인라인) | sketch 출처 |
|---|---|---|
| useNavigate / useIsDesktop / useAuthStore / useState selectedItem / useQuery education / canEdit / adminList / assistantList / renderCards (line 420~451) | 모두 verbatim 유지 (★ 비즈 anchor) | - |
| sectionLabelStyle (line 453~459): `fontSize: isDesktop ? 15 : 13, fontWeight:700, color:'var(--t2)', marginBottom:8, marginTop:4` | className `text-label font-bold text-text-secondary` (데스크톱 15 → 모바일 13 둘 다 text-label = 13 통일, 또는 isDesktop 분기로 데스크톱 `text-body-sm font-bold`) + 인라인 marginBottom/marginTop | W2 |
| 로딩 SKELETON 4개 (line 462~468): `<div style={SKELETON_STYLE} />` × 4 | `<div className="bg-surface-sunken rounded-md" style={{ height:88, animation:'blink 2s ease-in-out infinite' }} />` × 4 (또는 SKELETON 컴포넌트 분리) | W2 |
| 오류 상태 (line 471~473): `fontSize:14, color:'var(--danger)', padding:24` | `<div className="text-body-sm text-danger" style={{ padding:24, ... }} >` ('교육 현황을 불러오지 못했습니다. 화면을 당겨서 새로고침하세요.' verbatim, OQ #4 LOCKED) | W2 |
| 빈 상태 (line 475~480): 제목 fontSize:16 var(--t2) + 보조 fontSize:14 var(--t3) + padding:24 + gap:8 | `<div className="text-body font-bold text-text-secondary">` ('교육 이력 없음' verbatim) + `<div className="text-body-sm text-text-tertiary">` ('이수일을 기록하면 다음 교육 마감일이 자동으로 계산됩니다.' verbatim, OQ #4 LOCKED) + 인라인 padding 24 / gap 8 | W2 |
| 데스크톱 외곽 (line 502~503): `display:'flex', height:'100%', background:'var(--bg)'` | `<div className="bg-surface-page" style={{ display:'flex', height:'100%' }} >` | W2 |
| 데스크톱 좌측 (line 504~512): `flex:1, borderRight:'1px solid var(--bd)', display:'flex', flexDirection:'column', height:'100%'` | `<div className="border-r border-border-default" style={{ flex:1, display:'flex', flexDirection:'column', height:'100%' }} >` | W2 |
| 데스크톱 우측 fallback (line 524~530): `display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--t3)', fontSize:14` | `<div className="text-body-sm text-text-tertiary" style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }} >` ('좌측에서 직원을 선택하세요' verbatim) | W2 |
| 모바일 외곽 (line 538): `display:'flex', flexDirection:'column', height:'100%', background:'var(--bg)'` | `<div className="bg-surface-page" style={{ display:'flex', flexDirection:'column', height:'100%' }} >` | W2 |
| **★ 모바일 자체 헤더** (line 541~548): `height:48, background:'var(--bg2)', borderBottom:'1px solid var(--bd)', display:'flex', alignItems:'center', flexShrink:0` | `<div className="bg-surface-raised border-b border-border-default" style={{ height:48, display:'flex', alignItems:'center', flexShrink:0 }} >` (★ OQ #1 LOCKED) | W2 |
| **★ 모바일 back button** (line 549~560): 44x44 + IconChevronLeft size={20} color="var(--t2)" | `<button className="text-text-secondary" style={{ width:44, height:44, background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} >` + `<ChevronLeft size={20} />` (★ OQ #5 LOCKED, IconChevronLeft 인라인 SVG 폐기) | W2 |
| 모바일 타이틀 (line 561~563): `flex:1, textAlign:'center', fontSize:16, fontWeight:700, color:'var(--t1)'` | `<span className="text-body font-bold text-text-primary" style={{ flex:1, textAlign:'center' }} >보수교육</span>` ('보수교육' verbatim) | W2 |
| right spacer 44 (line 564) | `<div style={{ width:44 }} />` 인라인 유지 | W2 |
| 스크롤 영역 (line 568): `flex:1, overflowY:'auto', padding:16` | 인라인 유지 | W2 |
| @keyframes blink 인라인 style (line 583~588): `<style>{...}</style>` | 인라인 유지 (★ animation anchor, 1 byte 변경 금지) | W2 |

---

## §4. OQ LOCKED 5건 반영 매핑

| OQ | 위치 | 변환 룰 | 검증 grep |
|---|---|---|---|
| #1 | 모바일 헤더 line 541~565 | `bg-surface-raised border-b border-border-default` | `bg-surface-raised border-b border-border-default` ≥1 |
| #2 | DdayBadge line 61~93 | safe/warning/danger 3 토큰 클래스 + 임계치 30·0 + 라벨 verbatim | `bg-safe-bg text-safe` + `bg-warning-bg text-warning` + `bg-danger-bg text-danger` 각 ≥1 |
| #3 | EducationEditPanel line 374~383 + select disabled line 358~371 + StaffEducationCard line 120 | submit 인라인 그라데이션 + disabled 토큰 + selected border-2 border-accent | `linear-gradient(135deg, #1d4ed8, #0ea5e9)` ≥1 / `bg-surface-sunken text-text-tertiary cursor-not-allowed` ≥1 / `border-2 border-accent` ≥1 |
| #4 | renderGroupedList line 470~479 | 빈/오류 카피 verbatim 유지, 아이콘 추가 X | '교육 이력 없음' + '이수일을 기록하면 다음 교육 마감일이 자동으로 계산됩니다.' + '교육 현황을 불러오지 못했습니다. 화면을 당겨서 새로고침하세요.' 각 ≥1 |
| #5 | 모바일 헤더 line 549~560 + line 12~18 | `<ChevronLeft size={20} />` Lucide 교체 + IconChevronLeft 함수 정의 + polyline SVG 제거 + import 추가 | `<ChevronLeft size={20}` ≥1 + IconChevronLeft 함수 정의 = 0 + polyline = 0 + `import { ChevronLeft } from 'lucide-react'` ≥1 |

---

## §5. Negative gate (TSX 변환 후 검증)

- 이모지 0건 (TSX 본문)
- `linear-gradient` — **EducationEditPanel submit 인라인 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` ≥1 만 허용** (OQ #3 LOCKED 예외 anchor) / 다른 linear-gradient 인스턴스 0건
- 9·10·11px fontSize 0건 (text-caption 12 leading-none 마지노선)
- `(text|bg|border)-` 의 status- prefix 0건 (OQ #2 LOCKED 위반 시 verify FAIL, memory `feedback_tailwind_token_class_pattern`)
- `\b(w|h)-8\b` 0건 (memory `feedback_tailwind_w8_h8_is_48px`)
- 옛 alias 토큰 (`var(--bg2)` `var(--bg3)` `var(--bd)` `var(--bd2)` `var(--t1)` `var(--t2)` `var(--t3)` `var(--acl)` `var(--safe)` `var(--warn)` `var(--danger)`) — TSX 본문 안 인라인 style 안에서는 단계적 제거 권장 (Tailwind class 치환 우선). 변환 wave 마무리 시 0건 목표.

---

## §6. Positive gate (TSX 변환 후 검증)

- 비즈 anchor 12건 모두 변경 없이 보존:
  - calcNextDeadline + addMonths/addYears 시그니처 verbatim
  - differenceInCalendarDays + new Date() verbatim
  - TITLE_ORDER 객체 + titleRank fallback 99 verbatim
  - D-day 분기 매트릭스 임계치 30/0 + 라벨 'D-${dday}' / 'D+${Math.abs(dday)} 초과' verbatim
  - useQuery queryKey ['education'] + queryFn educationApi.list verbatim
  - useMutation × 3 + invalidateQueries ['education'] + toast 카피 5종 verbatim
  - educationApi.list/create/update/delete snake_case payload + positional id verbatim
  - useIsDesktop() + useAuthStore canEdit verbatim
  - @keyframes blink + @keyframes slideUp verbatim
  - 빈/오류/fallback 카피 verbatim
- OQ LOCKED 5건 모두 verify grep PASS
- Tailwind utility class 패턴 (status- prefix 없음 + w-8/h-8 함정 회피) 준수
- App.tsx 변경 0 byte

---

## §7. Build/tsc

- `cd cha-bio-safety && npx tsc --noEmit` PASS (0 errors)
- `cd cha-bio-safety && npm run build` PASS
- cbc7119-preview 자동 배포 후 모바일/데스크톱 시각 검수

---

## §8. 자체 verify (변환 후 grep 모음)

```bash
# OQ #1 — 모바일 자체 헤더
grep -c 'bg-surface-raised border-b border-border-default' cha-bio-safety/src/pages/EducationPage.tsx

# OQ #2 — DdayBadge 3 임계치
grep -c 'bg-safe-bg text-safe' cha-bio-safety/src/pages/EducationPage.tsx
grep -c 'bg-warning-bg text-warning' cha-bio-safety/src/pages/EducationPage.tsx
grep -c 'bg-danger-bg text-danger' cha-bio-safety/src/pages/EducationPage.tsx

# OQ #3 — submit 그라데이션 + disabled + selected
grep -c 'linear-gradient(135deg, #1d4ed8, #0ea5e9)' cha-bio-safety/src/pages/EducationPage.tsx
grep -c 'bg-surface-sunken text-text-tertiary cursor-not-allowed' cha-bio-safety/src/pages/EducationPage.tsx
grep -c 'border-2 border-accent' cha-bio-safety/src/pages/EducationPage.tsx

# OQ #4 — 빈/오류 카피 verbatim
grep -c '교육 이력 없음' cha-bio-safety/src/pages/EducationPage.tsx
grep -c '이수일을 기록하면 다음 교육 마감일이 자동으로 계산됩니다.' cha-bio-safety/src/pages/EducationPage.tsx
grep -c '교육 현황을 불러오지 못했습니다. 화면을 당겨서 새로고침하세요.' cha-bio-safety/src/pages/EducationPage.tsx

# OQ #5 — Lucide ChevronLeft 교체
grep -c "import { ChevronLeft } from 'lucide-react'" cha-bio-safety/src/pages/EducationPage.tsx
grep -c '<ChevronLeft size={20}' cha-bio-safety/src/pages/EducationPage.tsx
grep -c 'IconChevronLeft' cha-bio-safety/src/pages/EducationPage.tsx  # 0 기대 (함수 정의 + 사용처 모두 제거)

# negative
grep -cE '(text|bg|border)-' cha-bio-safety/src/pages/EducationPage.tsx  # status- prefix 검사
grep -cE '\b(w|h)-8\b' cha-bio-safety/src/pages/EducationPage.tsx  # 0

# App.tsx 변경 0 byte
git diff --name-only HEAD~1 HEAD -- cha-bio-safety/src/App.tsx  # empty
```

---

## §9. Tailwind cheatsheet (v0.1.1 토큰 → utility class 매핑, 23-education 적용)

| v0.1.1 토큰 | Tailwind utility | 23-education 적용 위치 |
|---|---|---|
| `--surface-page` | `bg-surface-page` | EducationPage 외곽 (모바일 line 538 / 데스크톱 line 503) |
| `--surface-raised` | `bg-surface-raised` | 카드 (line 117) + 모바일 헤더 (line 543, OQ #1) + 바텀시트 (line 405) |
| `--surface-sunken` | `bg-surface-sunken` | 아바타 + 마감 박스 + input/select + 이수 이력 row + 액션 버튼 + 신규 select disabled (OQ #3) |
| `--border-default` | `border-border-default` | 모바일 헤더 borderBottom (line 544, OQ #1) + 카드 평시 border (line 120) + 폼 borderTop (line 347) + 데스크톱 좌측 borderRight (line 506) |
| `--border-strong` | `border-border-strong` | input/select border (line 269) + 이수 이력 액션 버튼 border (line 320/330) + 바텀시트 handle (line 411) |
| `--text-primary` | `text-text-primary` | 이름 + 모바일 타이틀 + 다음 마감 일자 + input color |
| `--text-secondary` | `text-text-secondary` | 직책 + back button color + sectionLabelStyle + 폼 라벨 + 이수 이력 row + 액션 버튼 + 빈 제목 |
| `--text-tertiary` | `text-text-tertiary` | 메타 + 데스크톱 우측 fallback + 빈 보조 + 액션 버튼 + 마감 박스 라벨 + 신규 select disabled (OQ #3) |
| `--danger` | `text-danger` | 오류 카피 (line 471) |
| `--safe` + rgba | `bg-safe-bg text-safe` | DdayBadge safe (>30, OQ #2) |
| `--warn` + rgba | `bg-warning-bg text-warning` | DdayBadge warning (0~30, OQ #2) |
| `--danger` + rgba | `bg-danger-bg text-danger` | DdayBadge danger (<0, OQ #2) |
| `--accent` | `border-accent` (border-2) | selected card border (line 120, OQ #3, 1.5→2, 데스크톱만) |
| (인라인 유지, OQ #3) | `style={{ background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)' }}` | submit 버튼 (line 377, W4 만 예외 anchor) |
| (radius 8) | `rounded-sm` | DdayBadge + 이수 이력 row + 액션 버튼 + handle |
| (radius 9~12) | `rounded-md` | input/select + 마감 박스 + submit + 카드 + SKELETON |
| (radius 50%) | `rounded-full` | 아바타 32 + 40 |
| (radius '16px 16px 0 0') | `rounded-t-lg` | 바텀시트 |

---

## §10. 비즈 보존 체크박스

- [ ] calcNextDeadline 함수 시그니처 + addMonths(6) + addYears(2) 모두 verbatim
- [ ] differenceInCalendarDays 호출 + new Date() 인자 verbatim
- [ ] TITLE_ORDER 객체 + titleRank fallback 99 verbatim
- [ ] D-day 임계치 30 / 0 verbatim + 라벨 'D-${dday}' / 'D+${Math.abs(dday)} 초과' 1 byte 변경 없음
- [ ] useQuery queryKey ['education'] verbatim + 3 mutation invalidate 동일 key
- [ ] useMutation × 3 — create educationApi.create / update educationApi.update / delete educationApi.delete (snake_case payload + positional id)
- [ ] useIsDesktop() 분기 호출 line 422 verbatim
- [ ] canEdit 함수 (currentStaff?.role === 'admin' || currentStaff.id === cardStaffId) verbatim
- [ ] @keyframes blink + @keyframes slideUp 보존
- [ ] toast 카피 5종 verbatim ('이수일이 기록되었습니다.' / '이수일이 수정되었습니다.' / '이수 기록이 삭제되었습니다.' / '이수 기록 저장에 실패했습니다.' / 'e?.message ?? 삭제에 실패했습니다.')
- [ ] 빈/오류/fallback 카피 verbatim ('교육 이력 없음' / '이수일을 기록하면 다음 교육 마감일이 자동으로 계산됩니다.' / '교육 현황을 불러오지 못했습니다. 화면을 당겨서 새로고침하세요.' / '좌측에서 직원을 선택하세요')
- [ ] role 그룹 라벨 verbatim ('소방안전관리자' / '소방안전관리 보조자')
- [ ] App.tsx 변경 0 byte (final verify gate)

---

## §11. 메모리 룰 inline (12+ rule citations)

- `feedback_inspection_unresolved_color` — D-day 임계치 status 토큰 일반화 (OQ #2 LOCKED 일반화, >30 safe / 0~30 warning / <0 danger 매트릭스)
- `project_inspection_completion_rule` — role 그룹핑 + titleRank + canEdit source of truth 일반화 (영역 6 verbatim, adminList/assistantList + canEdit 분기)
- `feedback_tailwind_token_class_pattern` — status&#8209; prefix 없음 (`bg-safe-bg` O, `bg&#8209;status&#8209;safe` X). OQ #2 LOCKED 위반 시 verify FAIL.
- `feedback_tailwind_w8_h8_is_48px` — w-8/h-8 = 48px 함정 (back button 44x44 = `w-11 h-11` 또는 `style={{ width:44, height:44 }}` 인라인 명시. 아바타 32x32 / 40x40 도 인라인 명시.)
- `feedback_text_caption_leading_none` — DdayBadge 12px + 메타 12px 작은 컨테이너 leading-none 명시 (text-caption lh:1.5 = 18px 시각 패딩 방지)
- `feedback_sketch_realistic_data` — sketch 데이터는 시각 디자인 검증, 표시 분기 룰 자체는 코드 그대로 (실제 운영 데이터 베이스 — 윤종엽 본인 + 김재선 admin + 박신규 신규 등)
- `feedback_design_changes_ask_first` — 디자인 변경 전 사용자 컨펌 (본 wave 는 W1 OQ LOCKED 5건 적용 + 시각 검수 후 W6 TSX 변환)
- `feedback_planner_prompt_sketch_verbatim` — sketch CSS verbatim 인용 (추측 토큰명 금지). 본 checklist §3 매핑 표가 sketch 박제 verbatim.
- `feedback_tsx_wave_emoji_dot_gap` — sketch 의 이모지 0건 negative gate (TSX 본문도 동일)
- `feedback_tsx_wave_stat_card_drift` — source outline 패턴 보존 + sketch 새 패턴 누락 방지 (W4 sketch 의 submit 그라데이션 + disabled 토큰 verbatim)
- `feedback_subagent_production_deploy_forbidden` — 본 wave 는 디자인 sketch + cbc7119-preview 자동 배포 만 (wrangler 명령 절대 X)
- `feedback_redesign_sketch_rule_enforcement` — §6.2 negative rule + §6.3/§7.1 일관성 강제

---

## §12. 다음 단계 (TSX 변환 wave 진입)

- 본 checklist 가 W6 변환 wave 의 단일 진입점
- W6 = EducationPage.tsx 591 lines 단일 atomic 변환 (4 내부 컴포넌트 통합)
- 변환 후 cbc7119-preview 자동 배포 → 사용자 모바일/데스크톱 시각 검수
- 통과 시 main 머지 + cbc7119-preview 재배포 → status 박제 (memory `project_redesign_23_education_status` 신규)

**예상 W6 quick PLAN 구조:**
- branch: redesign/23-education (현재 ✓)
- atomic 1 commit: `feat(23-education): W6 TSX 변환 (v0.1.1 className 매핑 + 비즈 anchor 12건 보존 + Lucide ChevronLeft 교체 + OQ LOCKED 5건 반영)`
- 변경 1 파일: `cha-bio-safety/src/pages/EducationPage.tsx` (591 lines → 580~620 lines 예상)
- App.tsx 변경 0 byte
- verify gate: §4 + §5 + §6 + §8 (OQ 5건 + biz anchor 12건 + Tailwind 패턴 + App.tsx 0 byte)

본 wave (W5) 완결 시점에 사용자 시각 검수 — sketch 3 + checklist 1 파일 cbc7119-preview 자동 배포 사이클 1회 후
'/preview' 또는 사용자 지정 경로에서 sketch HTML 4 파일 직접 열어 확인.

---

**본 checklist 박제 완료. 다음 quick (`/gsd:quick` 또는 동등 명령) 으로 W6 TSX 변환 wave 진입.**
