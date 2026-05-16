---
phase: 260516-sdd
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/pages/RemediationDetailPage.tsx
autonomous: true
requirements:
  - REDESIGN-05
must_haves:
  truths:
    - "RemediationDetailPage 가 sketch (커밋 0c6315e) 1:1 매핑된 시각으로 렌더된다 (자체 헤더 48px / 결과 배지 페어 / 5종 피커 / textarea / 자재 row / CTA 단색 / admin 액션)."
    - "5종 카테고리 자동화 useEffect 와 PhotoButton 사진 흐름, admin 액션, useQuery/mutation 호출, route param, record.memo 통합 필드 — 비즈니스 로직 한 줄도 변경되지 않는다."
    - "변환 영역(RemediationDetailPage.tsx)에 옛 alias (--bg/--bg2/--bg3/--bd/--bd2/--t1/--t2/--t3/--acl/--danger/--warn) 0건 / 9·10·11px 0건 (소화전 tight 피커 1건만 화이트리스트) / 인라인 rgba(239,68,68|245,158,11|34,197,94,*) 0건 / 이모지 0건."
    - "TypeScript 0 에러, npm build PASS, lucide-react 아이콘으로 인라인 svg + ✕ 글리프 + 텍스트 라벨이 모두 교체된다."
  artifacts:
    - path: "cha-bio-safety/src/pages/RemediationDetailPage.tsx"
      provides: "v0.1.1 토큰/Tailwind/lucide 적용된 RemediationDetailPage (sketch 1:1 매핑)"
      contains: "import.*lucide-react"
  key_links:
    - from: "RemediationDetailPage.tsx"
      to: "sketch line 339~392 (.det-badge / .det-picker / .det-picker.tight)"
      via: "v0.1.1 토큰 페어 (--status-danger-bg/--status-danger / --status-warning-bg/--status-warning / --status-fire-bg/--status-fire / --status-safe-bg/--status-safe) + .det-picker.tight 11px 화이트리스트"
      pattern: "bg-danger-bg|bg-warning-bg|bg-fire-bg|bg-safe-bg|text-danger|text-warning|text-fire|text-safe"
    - from: "RemediationDetailPage.tsx (자체 헤더 / admin / CTA / 사진)"
      to: "lucide-react"
      via: "ChevronLeft / RotateCcw / Trash2 / Check / Image / Camera (PhotoButton 내부 재사용)"
      pattern: "from 'lucide-react'"
---

<objective>
redesign/05-remediation-detail TSX 변환 — cha-bio-safety/src/pages/RemediationDetailPage.tsx (594줄) 를 sketch HTML (커밋 0c6315e, remediation-detail-sketch.html) 1:1 매핑으로 v0.1.1 토큰 / Tailwind / lucide-react 로 재작성한다.

Purpose:
- 04-remediation TSX Wave (커밋 48746ff, e01c6e7) paired-page 일관성 mirror — 두 페이지(목록/상세)가 동일한 결과·상태 배지 페어, 동일한 단색 accent CTA, 동일한 노안 12px 마지노 룰을 공유해야 한다.
- 옛 토큰 alias (--bg/--bg2/--bg3/--bd/--bd2/--t1/--t2/--t3/--acl) 제거 + 인라인 rgba 상태 색 제거 + 인라인 svg→lucide 치환.

Output:
- 갱신된 RemediationDetailPage.tsx 1 개 (이 외 파일 0).
- 비즈니스 로직 100% 보존: 5종 카테고리 자동 setActionPick + 자재 자동채움 useEffect, PhotoButton 사진 업로드, useQuery/api.post(resolve/unresolve)/api.delete, isAdmin 분기, route param, record.memo 통합 필드.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@./CLAUDE.md

@cha-bio-safety/src/pages/RemediationDetailPage.tsx
@cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html
@cha-bio-safety/docs/redesign-context/05-remediation-detail/design-system.md
@cha-bio-safety/docs/redesign-context/05-remediation-detail/tokens.css
@cha-bio-safety/docs/redesign-context/05-remediation-detail/typography.css
@cha-bio-safety/src/pages/RemediationPage.tsx
@cha-bio-safety/src/styles/tokens.css
@cha-bio-safety/src/styles/typography.css
@cha-bio-safety/tailwind.config.js
@cha-bio-safety/src/components/PhotoButton.tsx

<sketch_css_verbatim>
<!-- Sketch (remediation-detail-sketch.html) verbatim CSS — 추측 금지, 인용 그대로 사용 -->
<!-- (메모 feedback_planner_prompt_sketch_verbatim 강제) -->

# 자체 헤더 (sketch line 299~309)
.det-page-hd {
  height: 48px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  position: relative; padding: 0 12px;
  background: var(--surface-raised); border-bottom: 1px solid var(--border-default);
}
.det-back-btn {
  position: absolute; left: 12px; width: 36px; height: 36px; border: none; background: none;
  cursor: pointer; color: var(--text-primary);
  display: flex; align-items: center; justify-content: center;
}
.det-page-hd-title { font-size: 16px; font-weight: 700; color: var(--text-primary); line-height: 1.2; }

# 본문 (line 312~315)
.det-body { flex: 1; overflow-y: auto; }
.det-body.has-cta { padding-bottom: 72px; }

# 섹션 (line 318~321)
.det-section { padding: 20px 16px; border-bottom: 1px solid var(--border-default); }
.det-section-hd {
  font-size: 12px; font-weight: 700; color: var(--text-tertiary); margin-bottom: 10px; line-height: 1;
}

# KV row (line 324~331)
.det-kv-list { display: flex; flex-direction: column; gap: 8px; }
.det-kv-row { display: flex; gap: 12px; align-items: flex-start; }
.det-kv-label {
  font-size: 12px; color: var(--text-tertiary); width: 64px; flex-shrink: 0; line-height: 1.5;
}
.det-kv-value {
  font-size: 14px; color: var(--text-primary); flex: 1; line-height: 1.5;
}

# 결과/상태 배지 페어 (line 334~342) — leading-none 명시
.det-badge {
  font-size: 12px; font-weight: 700; padding: 2px 6px; border-radius: 5px;
  line-height: 1; white-space: nowrap; flex-shrink: 0;
  display: inline-flex; align-items: center;
}
.det-badge.danger  { background: var(--status-danger-bg);  color: var(--status-danger); }   /* 불량 */
.det-badge.warning { background: var(--status-warning-bg); color: var(--status-warning); }  /* 주의 */
.det-badge.fire    { background: var(--status-fire-bg);    color: var(--status-fire); }     /* 미조치 */
.det-badge.safe    { background: var(--status-safe-bg);    color: var(--status-safe); }     /* 완료 */

# 점검 메모 (line 345~348)
.det-memo {
  font-size: 14px; line-height: 1.5; color: var(--text-primary); margin: 0; white-space: pre-wrap;
}
.det-memo.empty { color: var(--text-tertiary); }

# 사진 (line 351~361)
.det-photo {
  width: 100%; max-height: 240px; object-fit: cover; border-radius: 10px;
  border: 1px solid var(--border-default); display: block; margin-top: 12px;
  background: var(--surface-sunken);
}

# Admin 액션 (line 364~374)
.det-admin-row {
  padding: 14px 16px; border-bottom: 1px solid var(--border-default);
  display: flex; gap: 8px; flex-wrap: wrap;
}
.det-admin-btn {
  padding: 8px 14px; border-radius: 8px; background: transparent;
  font-size: 12px; font-weight: 700; cursor: pointer; line-height: 1;
  font-family: inherit; display: inline-flex; align-items: center; gap: 4px;
}
.det-admin-btn.warn   { border: 1px solid var(--status-warning-bar); color: var(--status-warning-bar); }
.det-admin-btn.danger { border: 1px solid var(--status-danger-bar);  color: var(--status-danger-bar); }

# 조치 피커 (line 377~392)
.det-picker { display: flex; gap: 5px; margin-bottom: 10px; }
.det-picker-opt {
  flex: 1; padding: 10px 4px; border-radius: 10px; cursor: pointer;
  font-size: 12px; font-weight: 700; line-height: 1.2;
  font-family: inherit; text-align: center;
  border: 1px solid var(--border-default);
  background: var(--surface-raised);
  color: var(--text-secondary);
}
.det-picker-opt.is-active {
  border: 2px solid var(--accent);
  background: rgba(59,130,246,0.12);
  color: var(--accent);
}
/* 4-옵션 피커 (소화전) — 11px (의도된 예외, 화이트리스트 1건) */
.det-picker.tight .det-picker-opt { font-size: 11px; padding: 10px 2px; }

# textarea (line 395~405)
.det-textarea {
  width: 100%; min-height: 96px;
  background: var(--surface-sunken);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  font-size: 14px; line-height: 1.5;
  color: var(--text-primary);
  padding: 12px; resize: vertical; box-sizing: border-box;
  font-family: var(--font-sans);
}

# 소모 자재 row (line 408~432) — 라벨 12px 상향 (옛 11px 폐기)
.det-mat-row-hd-label { font-size: 12px; color: var(--text-tertiary); line-height: 1; }
.det-mat-row { display: flex; gap: 8px; align-items: flex-start; }
.det-mat-col { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; height: 72px; }
.det-mat-input {
  flex: 1; min-height: 0; min-width: 0; width: 100%;
  background: var(--surface-sunken); border: 1px solid var(--border-strong); border-radius: 8px;
  font-size: 13px; color: var(--text-primary); padding: 0 10px;
  box-sizing: border-box; font-family: inherit;
}
.det-mat-num {
  width: 100%; height: 100%; min-width: 0;
  background: var(--surface-sunken); border: 1px solid var(--border-strong); border-radius: 8px;
  font-size: 13px; color: var(--text-primary); padding: 0 28px 0 10px;
  box-sizing: border-box; font-family: inherit;
}
.det-mat-num-suffix {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  font-size: 12px; color: var(--text-tertiary); pointer-events: none; line-height: 1;
}

# 고정 하단 CTA (line 466~479)
.det-cta {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: var(--surface-page);
  border-top: 1px solid var(--border-default);
  padding: 12px 16px;
}
.det-cta-btn {
  width: 100%; height: 48px;
  background: var(--accent); color: var(--text-on-accent);
  font-size: 14px; font-weight: 700;
  border: none; border-radius: 12px; cursor: pointer;
  transition: opacity .15s; line-height: 1;
  font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 6px;
}
</sketch_css_verbatim>

<interfaces>
<!-- 변환 영역이 사용하는 외부 인터페이스 (변경 0건, 그대로 호출) -->

From src/components/PhotoButton.tsx — 이미 v0.1.1 토큰 + lucide Camera 사용 중. 수정 0건:
```ts
export function PhotoButton(props: { hook: ReturnType<typeof usePhotoUpload>, label?: string, noCapture?: boolean }): JSX.Element
```

From src/hooks/usePhotoUpload — 그대로 사용 (사진 흐름 비즈니스 로직):
```ts
const photo = usePhotoUpload()
photo.hasPhoto: boolean
photo.upload(): Promise<string | null>
```

From src/utils/api — 그대로 호출:
```ts
api.post(`/inspections/records/${recordId}/resolve`, { resolution_memo, resolution_photo_key, materials_used })
api.post(`/inspections/records/${recordId}/unresolve`, {})
api.delete(`/inspections/records/${recordId}`)
remediationApi.get(recordId)
```

From src/stores/authStore:
```ts
useAuthStore(s => s.staff?.role === 'admin')
```

From src/utils/datetime:
```ts
fmtKstDateTime(iso: string): string  // (alias fmtDate, 유지)
```

# Tailwind 토큰 매핑 (tailwind.config.js 확인됨)
- bg-surface-page / bg-surface-raised / bg-surface-sunken
- text-text-primary / text-text-secondary / text-text-tertiary / text-on-accent
- border-border-default / border-border-strong
- bg-accent / text-accent
- bg-danger-bg / text-danger  (단, text-danger 는 fontground 토큰)
  - 시안은 fg 로 `var(--status-danger)` (line 339) 사용 → Tailwind class `text-danger` 정합
- bg-warning-bg / text-warning  (sketch line 340)
- bg-fire-bg / text-fire        (sketch line 341)
- bg-safe-bg / text-safe        (sketch line 342)
- border-warning-bar / text-warning-bar (admin warn button)
- border-danger-bar  / text-danger-bar  (admin danger button)
- 11px (소화전 tight) 는 Tailwind 표준에 없음 → 인라인 `style={{ fontSize:11, padding:'10px 2px' }}` 화이트리스트
- accent soft `rgba(59,130,246,0.12)` 는 동적 → `style={{ background:'rgba(59,130,246,0.12)' }}` 또는 임의 클래스 `bg-[rgba(59,130,246,0.12)]`

# lucide 매핑표 (sketch verbatim — line 555/650/753/...)
- ChevronLeft → 자체 헤더 back (sketch line 555: `data-lucide="chevron-left" class="icon-lg"` = 20px)
- Image → 사진 placeholder + preview slot (sketch line 597/692/796/823/995/1097/1124: `class="icon-2xl"` = 28px placeholder, `class="icon-xl"` = 24px preview)
- Camera → PhotoButton 내부 (이미 lucide-react 사용 중, 외부 수정 0)
- RotateCcw → admin "조치 취소" (sketch line 830/1132: `class="icon-sm"` = 14px)
- Trash2 → admin "점검 기록 삭제" (sketch line 834/1136: `class="icon-sm"` = 14px)
- Check → CTA "조치 완료" 좌측 아이콘 (sketch line 632/735/925/1035: `class="icon-md"` = 16px)

# 04 paired-page 일관성 (RemediationPage.tsx 패턴 mirror)
- `import { Inbox, AlertCircle, Download, Camera } from 'lucide-react'` 패턴 따라
  → `import { ChevronLeft, Image, RotateCcw, Trash2, Check } from 'lucide-react'`
- 사진 비어있을 때 placeholder = sketch `.det-photo-empty` (line 356~361):
  height 180px / bg surface-sunken / border border-default / Image 28px text-tertiary + "점검 사진 없음"
- 사진 있을 때 = `.det-photo` (line 351~355) — 기존 TSX 동일 흐름 유지

# 상태→ 카테고리→ Tailwind 클래스 매핑 (사용자 인지)
- record.result === 'bad'  → `bg-danger-bg text-danger`   (불량)
- record.result !== 'bad'  → `bg-warning-bg text-warning` (주의)
- 미조치 상태 배지(추후 노출 시) → `bg-fire-bg text-fire`
- 완료 상태 배지(추후 노출 시) → `bg-safe-bg text-safe`

# admin 버튼 outline 페어 (sketch line 373~374 verbatim)
- 조치 취소: `border-warning-bar text-warning-bar` outline (배경 transparent)
- 점검 기록 삭제: `border-danger-bar text-danger-bar` outline (배경 transparent)
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: RemediationDetailPage.tsx 변환 (594줄 sketch 1:1 매핑)</name>
  <files>cha-bio-safety/src/pages/RemediationDetailPage.tsx</files>
  <behavior>
    sketch (remediation-detail-sketch.html, 커밋 0c6315e) 1:1 매핑. 비즈니스 로직 0 변경 + 시각만 재정렬.

    A. 보존 (한 줄도 변경 금지):
    - 모든 import 의 hook/util 사용 (useState/useEffect/useParams/useNavigate/useQuery/useQueryClient/remediationApi/api/usePhotoUpload/PhotoButton/useAuthStore/toast/fmtKstDateTime)
    - state: memo, actionPick (12 union 타입 그대로), materialName, materialCount, submitting, photo, isAdmin
    - useQuery (queryKey ['remediation-detail', recordId], queryFn, enabled)
    - 5종 카테고리 분기 변수 (isGuideLight/isExtinguisher/isHydrant/isFireShutter/isSmokeDamper)
    - GL_TYPE_LABEL 6키 (ceiling_exit/wall_exit/room_passage/corridor_passage/stair_passage/audience_passage) 그대로
    - 10개 useEffect 전부 (5종 증상→피커 기본값 + 5종 피커→자재 자동채움)
    - handleDelete / handleUnresolve / handleResolve 본문 100% 보존 — confirm 메시지/toast 한글/api.* path/queryClient.invalidateQueries 키/finalMemo 분기/materialsString 포맷/setSubmitting/navigate(-1)
    - ZONE_LABEL 4키, KVRow/SectionHeader 헬퍼 (단, 내부 스타일은 토큰 교체)
    - route param useParams<{ recordId: string }>()
    - PhotoButton 호출 시그너처 `<PhotoButton hook={photo} label="촬영" noCapture />`

    B. 시각 변환 (sketch verbatim CSS 기반):
    1. 자체 헤더 (line 270~302) → sketch `.det-page-hd` 매핑:
       - 컨테이너: `height:48 / bg-surface-raised / border-b border-border-default / relative / flex items-center justify-center / px-3 / flex-shrink:0`
       - back 버튼: `absolute left-3 / w-9 h-9 / 인라인 svg 제거 → <ChevronLeft size={20} />` (sketch icon-lg = 20px)
       - 타이틀: "조치 상세" `text-base font-bold leading-tight` text-text-primary (sketch line 309 `font-size:16; line-height:1.2`)
       - 옛 `background:'rgba(22,27,34,0.97)'` → `bg-surface-raised` (sketch verbatim — line 302)
    2. 로딩 spinner (line 305~310): `border-border-strong / border-t-accent` (color 토큰만 교체, 사이즈 유지)
    3. 에러 (line 313~317): `text-text-secondary text-body-sm` (옛 `color:'var(--t2)'` 폐기)
    4. 컨테이너 (line 320~325): `flex-1 overflow-y-auto / pb-[72px]` when open (sketch `.det-body.has-cta` = padding-bottom 72px verbatim) / pb-6 when resolved. iOS sab — `paddingBottom: 'calc(72px + var(--sab,0px))'` 그대로 유지.
    5. 섹션 wrapper (line 327/358/374/420): `.det-section` → `p-5 px-4 border-b border-border-default` (sketch verbatim padding `20px 16px`)
       - 마지막 섹션 (조치 입력) `border-b:none` 유지
    6. SectionHeader (line 23~29): `.det-section-hd` → `text-caption font-bold leading-none mb-2.5 text-text-tertiary` (sketch line 320: `font-size:12; font-weight:700; line-height:1; margin-bottom:10px`)
    7. KVRow (line 14~21): `.det-kv-row` → `flex gap-3 items-start`
       - label: `text-caption leading-relaxed text-text-tertiary w-16 flex-shrink-0`
       - value: `text-body-sm leading-relaxed text-text-primary flex-1`
    8. 결과 배지 (line 342~352) → sketch `.det-badge` 페어 (line 339/340):
       ```tsx
       record.result === 'bad'
         ? <span className="inline-flex items-center text-caption font-bold leading-none px-1.5 py-0.5 rounded-[5px] bg-danger-bg text-danger">불량</span>
         : <span className="inline-flex items-center text-caption font-bold leading-none px-1.5 py-0.5 rounded-[5px] bg-warning-bg text-warning">주의</span>
       ```
       (메모 feedback_text_caption_leading_none — 작은 컨테이너 내 leading-none 명시 강제)
    9. 점검 메모 (line 358~362): `.det-memo` → `text-body-sm leading-relaxed m-0 whitespace-pre-wrap text-text-primary` (memo 있을 때) / `text-text-tertiary` (없을 때 "메모 없음")
    10. 점검 사진 (line 363~369): record.photoKey 있을 때 `.det-photo` → `w-full max-h-60 object-cover rounded-[10px] border border-border-default block mt-3 bg-surface-sunken`
        - photoKey 없을 때 sketch 시안 placeholder 도입 X (옛 TSX 는 그냥 렌더 안 함 — 비즈니스 로직 보존, sketch line 596 등의 `.det-photo-empty` placeholder 는 시안 시연용이므로 도입 X)
    11. 조치 완료 섹션 (line 372~394): `.det-section` 동일. 사진 같은 패턴.
    12. Admin 액션 영역 (line 397~416) → sketch `.det-admin-row` (line 364~374):
        - 컨테이너: `py-3.5 px-4 border-b border-border-default flex gap-2 flex-wrap`
        - "조치 취소" 버튼: `<button onClick={handleUnresolve} className="px-3.5 py-2 rounded-md bg-transparent text-caption font-bold leading-none cursor-pointer inline-flex items-center gap-1 border border-warning-bar text-warning-bar"><RotateCcw size={14} />조치 취소</button>` (sketch line 830/1132 verbatim, icon-sm=14)
        - "점검 기록 삭제" 버튼: `<button onClick={handleDelete} className="... border border-danger-bar text-danger-bar"><Trash2 size={14} />점검 기록 삭제</button>`
    13. 5종 조치 피커 (line 423~491) → sketch `.det-picker` (line 377~392):
        - 공통 컨테이너 className: `flex gap-[5px] mb-2.5`  (sketch line 377: `gap:5px; margin-bottom:10px`)
        - 옵션 버튼 (`.det-picker-opt`): 비활성 = `flex-1 rounded-[10px] cursor-pointer font-bold leading-tight text-center border border-border-default bg-surface-raised text-text-secondary` + `text-caption px-1 py-2.5` (sketch padding `10px 4px`, font-size 12)
        - 활성 (`actionPick === opt`): `border-2 border-accent text-accent` + `style={{ background: 'rgba(59,130,246,0.12)' }}` (sketch line 387~390 verbatim — 동적 soft accent, var() 화이트리스트 정합)
        - **소화전 (isHydrant, 4-옵션 tight)** — sketch line 392 verbatim 예외:
          - 컨테이너 동일 (`flex gap-[5px] mb-2.5`)
          - 옵션 버튼: 위 className 에서 `text-caption px-1 py-2.5` 대신 인라인 `style={{ fontSize: 11, padding: '10px 2px' }}` (11px 화이트리스트 1건, 메모 + sketch line 392 verbatim 정합)
        - 5개 분기 모두 동일 패턴, 라벨 한글 문자열 그대로 ('본체 교체'/'예비전원 교체'/'직접 입력' 등 12 union 문자열 0 변경)
    14. textarea (line 494~514) → sketch `.det-textarea` (line 395~405):
        - className: `w-full min-h-24 bg-surface-sunken border border-border-strong rounded-[10px] text-body-sm leading-relaxed text-text-primary p-3 resize-y box-border font-sans`
        - placeholder `"조치 내용을 입력하세요 (필수)"` 그대로
        - 분기 조건 `((!isGuideLight && !isExtinguisher && !isHydrant && !isFireShutter && !isSmokeDamper) || actionPick === '직접 입력')` 그대로
    15. 소모 자재 + 사진 row (line 516~553) → sketch `.det-mat-row*` (line 408~432):
        - 라벨 row: `flex items-center justify-between mt-3 mb-1` / 두 span `text-caption leading-none text-text-tertiary` (옛 11px → 12px 상향, 메모 정합)
        - 자재 col: `flex-1 min-w-0 flex flex-col gap-1 h-[72px]`
        - 자재명 input: `flex-1 min-h-0 min-w-0 w-full bg-surface-sunken border border-border-strong rounded-md text-label text-text-primary px-2.5 box-border font-inherit`
        - 수량 wrap: `relative flex-1 min-h-0 min-w-0`
        - 수량 input: 동일 토큰 + `pr-7 pl-2.5`
        - "ea" suffix span: `absolute right-2.5 top-1/2 -translate-y-1/2 text-caption leading-none text-text-tertiary pointer-events-none` (옛 11px → 12px 상향)
        - PhotoButton: `<PhotoButton hook={photo} label="촬영" noCapture />` 그대로 (PhotoButton 자체는 이미 v0.1.1 — 수정 0)
    16. 고정 하단 CTA (line 559~591) → sketch `.det-cta` (line 466~479):
        - 컨테이너: `fixed bottom-0 left-0 right-0 bg-surface-page border-t border-border-default px-4 py-3` + 인라인 `style={{ paddingBottom: 'calc(12px + var(--sab,0px))' }}` (iOS sab 보존)
        - 버튼: `w-full h-12 bg-accent text-on-accent text-body-sm font-bold border-none rounded-xl transition-opacity flex items-center justify-center gap-1.5 leading-none` + `cursor-pointer disabled:cursor-not-allowed disabled:opacity-50` (또는 인라인 보존)
        - 좌측 `<Check size={16} />` + 라벨 `{submitting ? '처리 중...' : '조치 완료'}`
        - 옛 `var(--acl)` → `bg-accent` (Tailwind class, var() 0건 정합)
        - **그라디언트 도입 절대 금지** (sketch 결정 mirror)
    17. 외곽 컨테이너 (line 268): 옛 `background:'var(--bg)'` → `bg-surface-page`. 나머지 layout-only 인라인 style (flex/height/overflow) 유지 허용.

    C. lucide-react import (paired-page 패턴 mirror):
    ```tsx
    import { ChevronLeft, Image, RotateCcw, Trash2, Check } from 'lucide-react'
    ```
    (Camera 는 PhotoButton 내부에서만 사용 → 본 파일 import 0)

    D. 색 토큰 / 사이즈 / 이모지 정리표 — 변환 영역 전체 sweep:
    - `var(--bg)` → `bg-surface-page` (Tailwind class) — line 268, 566
    - `var(--bg2)` → `bg-surface-raised` — line 430/444/458/472/486
    - `var(--bg3)` → `bg-surface-sunken` — line 502/530/544
    - `var(--bd)` → `border-border-default` — line 273/327/358/367/398/367(image)
    - `var(--bd2)` → `border-border-strong` — line 307/503/530/544
    - `var(--t1)` → `text-text-primary` — line 291/301/506/531/545
    - `var(--t2)` → `text-text-secondary` — line 431 외 picker 비활성
    - `var(--t3)` → `text-text-tertiary` — line 17/25/360/518/519/549
    - `var(--acl)` → `text-accent` / `bg-accent` — line 307/429/431/...(picker active) / line 577 (CTA bg)
    - `var(--warn)` → `text-warning-bar` / `border-warning-bar` — line 403/404 (admin 조치취소 outline)
    - `var(--danger)` → `text-danger-bar` / `border-danger-bar` — line 411/412 (admin 점검기록 삭제 outline)
    - 인라인 `rgba(239,68,68,.13)`/`rgba(245,158,11,.13)` (line 348/349) → `bg-danger-bg`+`text-danger` / `bg-warning-bg`+`text-warning` 페어 (sketch verbatim line 339/340)
    - 인라인 `rgba(59,130,246,.12)` (line 430 picker active) → 그대로 인라인 style 유지 (동적 soft accent, var() 화이트리스트 정합)
    - 인라인 svg `<svg width={20} height={20} ...>` (line 297~299) → `<ChevronLeft size={20} />` 치환
    - 11px (line 459 소화전 tight / 518 / 519 / 549) → 4건 중 1건만 화이트리스트 유지 (소화전 tight: sketch line 392 verbatim), 나머지 3건 (자재 라벨 2 + ea suffix 1) → 12px 상향
    - 9px / 10px / 이모지 → 0건 확인 (변환 영역 sweep)

    E. 작업 흐름 (sequential, 동일 파일 1개 sweep):
    1. Read 전체 (594줄) — 이미 완료.
    2. lucide-react import 추가 (line 1 부근).
    3. KVRow / SectionHeader (line 14~29) 내부 className 토큰 교체.
    4. 본문 컨테이너 (line 267~) → 자체 헤더 → 로딩/에러 → 본문 → 섹션별로 위 매핑표 순서대로 sweep.
    5. 5종 피커 (line 423~491) — 5 블록 모두 동일 패턴, 소화전(line 451~463)만 11px 인라인 화이트리스트.
    6. textarea / 자재 row / PhotoButton — 동일 sweep.
    7. admin 액션 영역 → outline 페어.
    8. CTA → 단색 bg-accent.
    9. 변환 후 자체 검수: `grep -n "var(--bg\\b\\|var(--bg2\\|var(--bg3\\|var(--bd\\b\\|var(--bd2\\|var(--t1\\|var(--t2\\|var(--t3\\|var(--acl\\b\\|var(--warn\\b\\|var(--danger\\b\\|rgba(239,68\\|rgba(245,158\\|rgba(34,197\\|width={20}.*viewBox" cha-bio-safety/src/pages/RemediationDetailPage.tsx` → 0건이어야 함.
    10. 9·10·11px sweep: `grep -nE "fontSize:\\s*9\\b|fontSize:\\s*10\\b|fontSize:\\s*11\\b|text-\\[9px\\]|text-\\[10px\\]|text-\\[11px\\]" cha-bio-safety/src/pages/RemediationDetailPage.tsx` → 정확히 1건 (소화전 tight 화이트리스트 line) 만 매치.
    11. 이모지 sweep: `grep -nE "[\\x{1F300}-\\x{1F9FF}]|[\\x{2600}-\\x{27BF}]|✓|✕|✘|✗|⚠|❗|🔥|📋|📷|✅|🚨" cha-bio-safety/src/pages/RemediationDetailPage.tsx` → 0건.
    12. 비즈니스 로직 sweep (diff 자체검수): 5종 useEffect / handleResolve finalMemo 분기 / handleDelete / handleUnresolve / GL_TYPE_LABEL / ZONE_LABEL / queryKey / api.* path — 전부 변경 0건.

    F. iOS sab / SideMenu / BottomNav 영향:
    - 본 페이지는 BottomNav 가 숨겨진 라우트 — `position:fixed bottom:0 + paddingBottom:'calc(12px + var(--sab,0px))'` 패턴 보존.
    - body:position:fixed 도입 절대 금지 (메모 feedback_body_scroll_lock_safe_area).

    G. 04 paired-page 일관성 (mirror 체크):
    - 결과 배지 페어 = RemediationPage 와 같은 토큰 (`bg-danger-bg text-danger` / `bg-warning-bg text-warning`).
    - CTA 단색 accent = RemediationPage 다운로드 버튼과 동일 (`bg-accent text-on-accent`).
    - lucide 아이콘 사이즈 호출 방식 = RemediationPage 동일 (`<Icon size={N} />`).
    - 자재 보조 라벨 12px 상향 = RemediationPage 11→12 상향과 동일.
  </behavior>
  <action>
    cha-bio-safety/src/pages/RemediationDetailPage.tsx (594줄) 를 위 behavior 의 A~G 를 순서대로 적용하여 sketch 1:1 매핑으로 재작성한다.

    핵심 룰 (위반 = 재작업):
    1. **비즈니스 로직 한 줄도 변경 금지** — 5종 useEffect, handleResolve/handleUnresolve/handleDelete 전체 본문, useQuery, GL_TYPE_LABEL, ZONE_LABEL, state union 타입, route param, PhotoButton 호출, toast 메시지, queryClient.invalidateQueries 키, confirm 한글 문자열, finalMemo 분기 — 단 한 글자도 바꾸지 마라.
    2. **sketch CSS verbatim** — `<sketch_css_verbatim>` 의 모든 수치 (height/font-size/padding/gap/border-radius/border-width) 를 그대로 인용. 추측 금지.
    3. **lucide 5종 + size 매핑** — ChevronLeft 20 / Image 28(placeholder)|24(preview) / RotateCcw 14 / Trash2 14 / Check 16. Camera 는 PhotoButton 내부에서만 사용 (본 파일 import 0).
    4. **결과 배지 페어** — 옛 인라인 rgba(239,68,68,.13)/rgba(245,158,11,.13) 폐기. Tailwind `bg-danger-bg text-danger` / `bg-warning-bg text-warning` 페어 적용 + `leading-none` 명시 (작은 컨테이너 leading 룰 강제).
    5. **CTA 단색** — `bg-accent text-on-accent`. linear-gradient 도입 절대 금지.
    6. **admin outline** — 조치 취소 = `border-warning-bar text-warning-bar` outline / 점검 기록 삭제 = `border-danger-bar text-danger-bar` outline. 배경 transparent.
    7. **11px 화이트리스트 1건** — 소화전 tight 피커 (sketch line 392 verbatim) 만 인라인 `style={{ fontSize: 11, padding: '10px 2px' }}`. 그 외 모든 11px → 12px 상향. 9·10px 0건.
    8. **이모지 0건** — 인라인 svg back arrow → ChevronLeft. PhotoButton "✕" 제거 버튼은 PhotoButton 내부 책임 (본 파일에 ✕ 없음 확인).
    9. **var() 0건** — 변환 영역 옛 alias (--bg/--bg2/--bg3/--bd/--bd2/--t1/--t2/--t3/--acl/--warn/--danger) 0건. 동적 soft accent `rgba(59,130,246,0.12)` 1건만 인라인 style 화이트리스트 허용 (sketch verbatim).
    10. **04 paired-page mirror** — RemediationPage.tsx (커밋 e01c6e7) 의 토큰 사용 패턴/lucide 호출 방식/12px 상향 룰과 1:1 일관.
  </action>
  <verify>
    <automated>cd cha-bio-safety && npx tsc --noEmit 2>&1 | grep -E "RemediationDetailPage" | wc -l | tr -d ' ' | xargs -I{} test {} -eq 0 &amp;&amp; npm run build 2>&amp;1 | tail -20 &amp;&amp; cd .. &amp;&amp; bash -c 'cd cha-bio-safety/src/pages &amp;&amp; ALIAS=$(grep -cE "var\(--bg\b|var\(--bg2|var\(--bg3|var\(--bd\b|var\(--bd2|var\(--t1|var\(--t2|var\(--t3|var\(--acl\b|var\(--warn\b|var\(--danger\b" RemediationDetailPage.tsx) &amp;&amp; RGBA=$(grep -cE "rgba\(239,68,68|rgba\(245,158,11|rgba\(34,197,94" RemediationDetailPage.tsx) &amp;&amp; INLINESVG=$(grep -cE "width=\{20\}.*viewBox|<svg[^>]*viewBox=\"0 0 24 24\"" RemediationDetailPage.tsx) &amp;&amp; SMALLPX=$(grep -nE "fontSize:\s*9\b|fontSize:\s*10\b|fontSize:\s*11\b|text-\[9px\]|text-\[10px\]|text-\[11px\]" RemediationDetailPage.tsx | wc -l | tr -d " ") &amp;&amp; EMOJI=$(grep -cE "✓|✕|✘|✗|⚠|❗|🔥|📋|📷|✅|🚨" RemediationDetailPage.tsx) &amp;&amp; LUCIDE=$(grep -cE "from .lucide-react." RemediationDetailPage.tsx) &amp;&amp; echo "ALIAS=$ALIAS RGBA=$RGBA INLINESVG=$INLINESVG SMALLPX=$SMALLPX EMOJI=$EMOJI LUCIDE=$LUCIDE" &amp;&amp; test "$ALIAS" = "0" &amp;&amp; test "$RGBA" = "0" &amp;&amp; test "$INLINESVG" = "0" &amp;&amp; test "$SMALLPX" = "1" &amp;&amp; test "$EMOJI" = "0" &amp;&amp; test "$LUCIDE" = "1"'</automated>
  </verify>
  <done>
    1. RemediationDetailPage.tsx 가 sketch (커밋 0c6315e) 1:1 매핑된 시각으로 렌더된다 (자체 헤더 48px / ChevronLeft / 결과 배지 페어 / 5종 피커 / textarea / 자재 row / 단색 CTA / admin outline).
    2. 비즈니스 로직 0 변경 — 5종 useEffect / handle*/useQuery/route param/state union/PhotoButton 호출/toast/confirm/queryClient 키 모두 보존.
    3. 변환 영역 sweep: var() 옛 alias 0건 / 인라인 rgba(상태색) 0건 / 인라인 svg 0건 / 9·10px 0건 / 11px 정확히 1건 (소화전 tight 화이트리스트) / 이모지 0건 / `import ... from 'lucide-react'` 1줄.
    4. `cd cha-bio-safety && npx tsc --noEmit` 결과에서 RemediationDetailPage 관련 에러 0건.
    5. `cd cha-bio-safety && npm run build` PASS.
    6. 04 paired-page 일관 — RemediationPage 와 동일한 토큰 페어 / lucide 호출 방식 / 12px 상향 룰.
  </done>
</task>

</tasks>

<verification>
변환 영역 자체 검수 (RemediationDetailPage.tsx 단일 파일):

```bash
cd cha-bio-safety/src/pages

# 1. 옛 토큰 alias 0건
grep -nE "var\(--bg\b|var\(--bg2|var\(--bg3|var\(--bd\b|var\(--bd2|var\(--t1|var\(--t2|var\(--t3|var\(--acl\b|var\(--warn\b|var\(--danger\b" RemediationDetailPage.tsx
# → 0줄

# 2. 인라인 rgba 상태색 0건 (soft accent rgba(59,130,246,0.12) 는 화이트리스트)
grep -nE "rgba\(239,68,68|rgba\(245,158,11|rgba\(34,197,94" RemediationDetailPage.tsx
# → 0줄

# 3. 인라인 svg 0건 (모두 lucide 치환)
grep -nE "width=\{20\}.*viewBox|<svg[^>]*viewBox=\"0 0 24 24\"" RemediationDetailPage.tsx
# → 0줄

# 4. 9·10·11px sweep — 정확히 1건 (소화전 tight)
grep -nE "fontSize:\s*9\b|fontSize:\s*10\b|fontSize:\s*11\b|text-\[9px\]|text-\[10px\]|text-\[11px\]" RemediationDetailPage.tsx
# → 정확히 1줄 (소화전 tight 화이트리스트, sketch line 392 verbatim)

# 5. 이모지 0건
grep -cE "✓|✕|✘|✗|⚠|❗|🔥|📋|📷|✅|🚨" RemediationDetailPage.tsx
# → 0

# 6. lucide import
grep -nE "from 'lucide-react'" RemediationDetailPage.tsx
# → 1줄: { ChevronLeft, Image, RotateCcw, Trash2, Check }

cd ../../..

# 7. TypeScript 0 에러
cd cha-bio-safety && npx tsc --noEmit
# → exit 0, RemediationDetailPage 관련 에러 0

# 8. npm build PASS
cd cha-bio-safety && npm run build
# → exit 0
```

비즈니스 로직 보존 sweep:

```bash
# 5종 useEffect 카운트 (점검 → 피커 5 + 피커 → 자재 5 = 10)
grep -cE "useEffect\(" cha-bio-safety/src/pages/RemediationDetailPage.tsx
# → 10

# handle* 함수 3개 보존
grep -cE "const handle(Delete|Unresolve|Resolve) = async" cha-bio-safety/src/pages/RemediationDetailPage.tsx
# → 3

# 12 union 액션 타입 보존
grep -nE "본체 교체.*예비전원 교체.*받침 교체.*소화기 교체.*경종 교체.*위치표시등 교체.*호스걸이 교체.*방화셔터 라인 표시함.*연동제어기 기판 교체.*기판 교체.*모터 교체.*직접 입력" cha-bio-safety/src/pages/RemediationDetailPage.tsx
# → 1줄

# api.* path 보존
grep -cE "/inspections/records/.+ recordId" cha-bio-safety/src/pages/RemediationDetailPage.tsx
# → 3 (delete + unresolve + resolve)
```

paired-page 일관 (Wave 1 mirror):

```bash
# 04 RemediationPage 와 lucide 호출 방식 동일
grep -E "from 'lucide-react'" cha-bio-safety/src/pages/RemediationPage.tsx cha-bio-safety/src/pages/RemediationDetailPage.tsx
# → 둘 다 1줄
```
</verification>

<success_criteria>
1. **시각 1:1 매핑**: RemediationDetailPage 가 sketch (커밋 0c6315e, remediation-detail-sketch.html) 의 6 viewport (모바일 다크 × 4 + 데스크톱 다크 × 1 + 데스크톱 라이트 × 1) 디자인 결정과 완전히 정합 — 자체 헤더 / 결과 배지 페어 / 5종 피커 + 자탐 textarea fallback / 단색 CTA / admin outline.
2. **비즈니스 로직 100% 보존**: 5종 useEffect, handleResolve/handleUnresolve/handleDelete, useQuery, GL_TYPE_LABEL, ZONE_LABEL, route param, PhotoButton 호출, isAdmin 분기, toast 메시지, confirm 한글 — 단 한 글자도 변경 없음.
3. **토큰 청결**: 변환 영역 var() 옛 alias 0건 / 인라인 rgba(상태색) 0건 / 9·10px 0건 / 11px 정확히 1건 (소화전 tight 화이트리스트, sketch line 392 verbatim) / 이모지 0건.
4. **TypeScript / 빌드**: `npx tsc --noEmit` PASS + `npm run build` PASS.
5. **04 paired-page 일관**: RemediationPage.tsx (커밋 e01c6e7) 와 동일한 토큰 페어 / lucide 호출 방식 / 12px 상향 룰.
6. **사용자 검수 게이트**: 변환 완료 후 사용자에게 결과 보여주고 main 머지+배포 여부 컨펌 요청 (메모 feedback_deploy_test — redesign 브랜치 작업은 명시 컨펌 후에만 머지).
</success_criteria>

<output>
After completion, create `.planning/quick/260516-sdd-redesign-05-remediation-detail-tsx-remed/260516-sdd-01-SUMMARY.md` covering:
- 변환된 라인 수 (before/after)
- sketch 1:1 매핑 결정 mirror 결과 (결과 배지 페어 / CTA 단색 / admin outline / 5종 피커 + 자탐 textarea / 11px 1건 화이트리스트)
- lucide 5종 (ChevronLeft/Image/RotateCcw/Trash2/Check) 도입 결과
- 변환 영역 검수: var()/rgba/svg/9·10·11px/이모지 카운트
- 비즈니스 로직 보존 검증 (5종 useEffect/handle*/useQuery/state union/PhotoButton 호출)
- 04 paired-page 일관 확인
- TypeScript / npm build 결과
</output>
