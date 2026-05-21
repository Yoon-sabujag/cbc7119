---
title: "redesign/17-annual-plan — wave 5 (TSX conversion checklist)"
status: pending
created: 2026-05-22
quick_id: 260522-0j3
branch: redesign/17-annual-plan
source_tsx: cha-bio-safety/src/pages/AnnualPlanPage.tsx
source_tsx_lines: 225
source_util: cha-bio-safety/src/utils/generateAnnualPlan.ts (generateAnnualPlan export, 변경 0)
sketch_sources:
  - cha-bio-safety/docs/redesign-context/17-annual-plan/sketch-wave-2-chrome.html
  - cha-bio-safety/docs/redesign-context/17-annual-plan/sketch-wave-3-preview-calibration.html
  - cha-bio-safety/docs/redesign-context/17-annual-plan/sketch-wave-4-download.html
mirror_of: cha-bio-safety/docs/redesign-context/16-workshift/wave-5-tsx-conversion-checklist.md (260521-t12)
calibration_precedent: cha-bio-safety/docs/redesign-context/15-daily-report/wave-1-index.md (260521-* SW3) — 캘리브 좌표 시스템 보존 룰 동일 적용
---

# redesign/17-annual-plan — wave 5 (TSX conversion checklist)

본 문서는 redesign/17-annual-plan 의 sketch 3 wave (W2 chrome + W3 preview-calibration + W4 download) 결정을 토대로 `AnnualPlanPage.tsx` (225 lines) 를 v0.1.1 Tailwind className 으로 in-place 변환하기 위한 **verify checklist** 다. **sketch 가 아닌 markdown** — 본 wave 작성 후 사용자 시각 검수 → 다음 quick task (W6 — TSX 변환) 진입 직전 본 checklist 의 §3 매핑 표 verbatim + §5/§6/§7/§8 verify gate 그대로 적용.

mirror_of: 16-workshift/wave-5-tsx-conversion-checklist.md (260521-t12). 차이점 = AnnualPlanPage 의 **캘리브 좌표 시스템** 보존 룰 (15-daily-report SW3 precedent) + OQ 결정 5건 내용 변경 (다운로드 그라데이션 폐기 + 캘리브 시그니처 5건).

---

## §1. 변환 범위 + 산출 파일

- **변환 대상 단일 파일 in-place 수정**: `cha-bio-safety/src/pages/AnnualPlanPage.tsx` (225 lines → 약 230~270 lines 예상, Tailwind v0.1.1 className 으로 인라인 style 치환 + lucide-react `ChevronLeft, Download` import 2개 추가)
- W2 (chrome — 모바일 헤더 + 데스크톱 상단 바) + W3 (preview + 캘리브 좌표 시스템) + W4 (다운로드 버튼 + 설명) 3 sketch 결정 → className 1:1 매핑
- **components.css 신규 생성 X** (페이지 로컬 인라인 토큰 유지)
- **`generateAnnualPlan.ts` 변경 0** (xlsx-js-style 엑셀 생성 + 표지/일정표 연도 셀 패치 비즈 로직 보존)
- **★ 캘리브 좌표 시스템 시그니처 5건 1 byte 변경 금지** (STORAGE_KEY / FINGER_OFFSET / handleImageClick / handleImageTouch / yearPos overlay — 15-daily-report SW3 precedent)
- 비즈 로직 0 diff (state/handler/effect/hook 모두 보존, §10 체크박스)

산출 (W6 wave 의 expected output):
1. `AnnualPlanPage.tsx` v0.1.1 className 변환 완료 (1 file in-place)
2. atomic commit 1개: `feat(17-annual-plan): W6 TSX 변환 (v0.1.1 className 매핑 + Lucide + 캘리브 시그니처 5건 보존)`
3. `generateAnnualPlan.ts` 변경 0 byte (final verify gate)

---

## §2. 보존 (AnnualPlanPage.tsx 비즈 로직 100% 보존 목록 15+ row)

### ★ 캘리브 좌표 시스템 시그니처 5건 (1 byte 변경 금지 박스, 15-daily-report SW3 precedent)

```
1. STORAGE_KEY = 'annual_plan_year_pos'              (line 7, localStorage key — 변경 시 기존 사용자 좌표 손실)

2. FINGER_OFFSET = 60                                (line 8, TouchEvent y 보정 px — 손가락 가리는 영역 보정값)

3. handleImageClick (line 35~45) 좌표 계산식:
   - e.currentTarget.getBoundingClientRect()
   - ((e.clientX - rect.left) / rect.width) * 100
   - ((e.clientY - rect.top) / rect.height) * 100
   - setYearPos(pos) / localStorage.setItem(STORAGE_KEY, JSON.stringify(pos)) / setCalibMode(false)
   - toast.success(`연도 위치 저장됨 (${x.toFixed(1)}%, ${y.toFixed(1)}%)`)

4. handleImageTouch (line 47~59) 좌표 계산식 (FINGER_OFFSET y 보정):
   - e.preventDefault()
   - touch.clientY - FINGER_OFFSET 보정
   - ((touch.clientX - rect.left) / rect.width) * 100
   - (((touch.clientY - FINGER_OFFSET) - rect.top) / rect.height) * 100
   - 동일 setYearPos / localStorage.setItem / setCalibMode(false) 흐름
   - toast.success(`연도 위치 저장됨`)

5. yearPos overlay inline style (line 78~89):
   - position:'absolute'
   - top:`${yearPos.y}%`, left:`${yearPos.x}%`
   - transform:'translate(-50%,-50%)'
   - fontSize:'min(1.4vw, 16px)', fontWeight:700
   - color:'#000', fontFamily:'Malgun Gothic, 맑은 고딕, sans-serif'
   - pointerEvents:'none'
```

### AnnualPlanPage.tsx 비즈 로직 보존 표 (line 별)

| line | 항목 | 보존 방식 |
|---|---|---|
| 1~5 | import 5개 (useState/useRef / useNavigate / toast / generateAnnualPlan / useIsDesktop) | 그대로 + lucide-react `ChevronLeft, Download` 1줄 추가 (OQ #4 LOCKED) |
| 7~8 | `STORAGE_KEY` + `FINGER_OFFSET` 상수 | **1 byte 변경 금지** (★ 캘리브 시그니처) |
| 10~12 | `loadPos()` helper (try/catch JSON.parse fallback null) | 그대로 |
| 14~16 | useNavigate / useIsDesktop / useState (loading) | 그대로 |
| 17~19 | useState 3종 (loading / calibMode / yearPos initial=loadPos) | 그대로 |
| 20~21 | useRef (imgRef) + `nextYear = new Date().getFullYear() + 1` | 그대로 |
| 23~33 | `handleDownload` async + `generateAnnualPlan()` direct import (dynamic import 아님) + toast.success/error | 그대로 |
| 35~45 | `handleImageClick` 좌표 계산식 | **1 byte 변경 금지** (★ 캘리브 시그니처) |
| 47~59 | `handleImageTouch` FINGER_OFFSET 보정 식 | **1 byte 변경 금지** (★ 캘리브 시그니처) |
| 61~103 | previewImage element 공통 (img + 연도 오버레이 + 캘리브 안내 칩) | UI markup 만 재작성, 좌표/이벤트/카피 verbatim 보존 |
| 65 | preview 자산 `'/templates/preview/annual-plan.png'` | **경로 변경 금지** (404 사고 회피) |
| 66 | img alt `'연간 업무 추진 계획 미리보기'` | 카피 verbatim |
| 67~68 | onClick / onTouchStart handler 바인딩 | 그대로 |
| 78~89 | yearPos overlay inline style | **1 byte 변경 금지** (★ 캘리브 시그니처) |
| 91~101 | 캘리브 안내 칩 inline style + 카피 '연도가 들어갈 위치를 클릭하세요' | 인라인 + 카피 verbatim 보존 (OQ #5 LOCKED) |
| 106 | useIsDesktop 분기 | 그대로 |
| 119, 181 | `setCalibMode(m => !m)` 토글 | 그대로 |
| 128, 190 | 카피 분기 '취소' / '위치 조정' | 그대로 |
| 131, 206 | `handleDownload` onClick | 그대로 |
| 132, 207 | `disabled={loading}` | 그대로 |
| 144, 219 | 카피 분기 '엑셀 다운로드' / '생성 중...' | 그대로 |
| 170 | `navigate(-1)` onClick (모바일 back button) | 그대로 |
| 179 | 모바일 헤더 타이틀 '연간 업무 추진 계획' | 카피 verbatim |

---

## §3. 변환 매핑 (영역별 className/토큰/폰트 — W2/W3/W4 sketch verbatim 인용)

### §3.1 영역 5 데스크톱 — 상단 바 (line 110~146, W2 sketch 출처 + W4 다운로드 버튼)

| 현재 (인라인 style) | 변환 후 (className + 인라인) | sketch 출처 |
|---|---|---|
| 외곽 wrapper `width:100%, height:100%, flexDirection:column, overflow:hidden` (line 108) | 인라인 유지 (style 그대로) | W2 |
| 상단 바 wrapper `flexShrink:0, padding:'14px 28px', display:flex, alignItems:center, gap:12, borderBottom:'1px solid var(--bd)'` (line 110~114) | `class="border-b border-border-default flex items-center"` style={{ flexShrink:0, padding:'14px 28px', gap:12 }} | W2 frame 3/4 |
| 설명 div `flex:1, fontSize:12, color:'var(--t3)'` + `<strong color:'var(--t1)' fontWeight:700>` (line 115~117) | `class="text-caption leading-none text-text-tertiary"` style={{ flex:1 }} + `<strong class="text-text-primary font-bold">` (OQ #3 LOCKED 12 유지 + leading-none) | W2 frame 3/4 |
| 위치조정 토글 평시 `padding:'8px 14px', borderRadius:8, border:'1px solid var(--bd2)', background:'var(--bg3)', color:'var(--t2)', fontSize:12, fontWeight:700` (line 118~125, 평시) | `class="bg-surface-sunken border border-border-strong text-text-secondary text-caption font-bold leading-none rounded-sm"` style={{ padding:'8px 14px', cursor:'pointer' }} (OQ #2 LOCKED 평시 + OQ #3 LOCKED 12 + leading-none) | W2 frame 3/4 |
| 위치조정 토글 active `border:'1px solid var(--acl)', background:'rgba(59,130,246,0.1)', color:'var(--acl)'` (line 122~124, calibMode true) | `class="border-accent bg-accent/10 text-accent border text-caption font-bold leading-none rounded-sm"` (OQ #2 LOCKED active — status- prefix 없음) | W2 frame 3/4 active row |
| 다운로드 버튼 `padding:'8px 20px', borderRadius:8, border:'none'` (line 134) | `class="bg-safe-bar text-text-on-accent text-label font-bold leading-none rounded-sm flex items-center"` style={{ padding:'8px 20px', gap:8, border:'none', flexShrink:0 }} (OQ #1 LOCKED solid + OQ #3 LOCKED 13 text-label + OQ #4 LOCKED Lucide) | W4 frame 3/4 |
| 다운로드 background 분기 `loading ? 'var(--bg3)' : 'linear‑gradient(135deg,#1e40af,#3b82f6)'` (line 135) | `className={\`... ${loading ? 'bg-surface-sunken text-text-tertiary cursor-not-allowed' : 'bg-safe-bar text-text-on-accent cursor-pointer'}\`}` (OQ #1 LOCKED — 그라데이션 완전 폐기) | W4 frame 1/3 disabled |
| 다운로드 svg `width:15 height:15 viewBox path "M12 5v14m0 0l-4-4m4 4l4-4M4 19h16"` (line 141~143) | `<Download size={15} />` (OQ #4 LOCKED Lucide 교체, lucide-react import 추가) | W4 frame 3/4 |
| 하단 미리보기 wrapper `flex:1, minHeight:0, overflow:hidden, padding:24, background:'var(--bg)'` (line 149~152) | 인라인 유지 (background `var(--bg)` → `var(--surface-page)` 마이그레이션) | W3 frame 3/4 |
| preview wrapper `maxWidth:'calc((100vh - 140px) * 1.414)'` (line 156) | 인라인 유지 (A4 비율 시각 anchor) | W3 frame 3/4 |

### §3.2 영역 4 모바일 — 헤더 (line 169~192, W2 sketch 출처)

| 현재 | 변환 후 | sketch |
|---|---|---|
| 외곽 wrapper `width:100%, height:100%, flexDirection:column, overflow:hidden, background:'var(--bg)'` (line 168) | 인라인 유지 (`var(--bg)` → `var(--surface-page)` 마이그레이션 메모) | W2 frame 1/2 |
| header `flexShrink:0, background:'var(--bg2)', borderBottom:'1px solid var(--bd)', padding:'8px 12px 9px', gap:8` (line 169) | `class="bg-surface-raised border-b border-border-default flex items-center"` style={{ padding:'8px 12px 9px', gap:8, flexShrink:0 }} | W2 frame 1/2 |
| back button `width:34, height:34, borderRadius:8, background:'var(--bg3)', border:'1px solid var(--bd)'` (line 170~173) | `class="w-[34px] h-[34px] rounded-sm bg-surface-sunken border border-border-default flex items-center justify-center"` style={{ flexShrink:0, cursor:'pointer' }} (memory `feedback_tailwind_w8_h8_is_48px` — w-[34px] 인라인 안전) | W2 frame 1/2 |
| back button svg `width:15 height:15 stroke:'var(--t2)' path "M15 19l-7-7 7-7"` (line 175~177) | `<ChevronLeft size={15} className="text-text-secondary" />` (OQ #4 LOCKED Lucide 교체) | W2 frame 1/2 |
| 타이틀 span `flex:1, fontSize:14, fontWeight:700, color:'var(--t1)'` (line 179) | `class="text-body font-bold text-text-primary"` style={{ flex:1 }} (OQ #3 LOCKED 14→16 격상) | W2 frame 1/2 |
| 위치조정 토글 평시 `padding:'6px 10px', borderRadius:8, border:'1px solid var(--bd2)', background:'var(--bg3)', color:'var(--t2)', fontSize:11, fontWeight:700` (line 180~187) | `class="bg-surface-sunken border border-border-strong text-text-secondary text-caption font-bold leading-none rounded-sm"` style={{ padding:'6px 10px', cursor:'pointer' }} (OQ #2 LOCKED 평시 + OQ #3 LOCKED 11→12 격상 + leading-none) | W2 frame 1/2 |
| 위치조정 토글 active `border:'1px solid var(--acl)', background:'rgba(59,130,246,0.1)', color:'var(--acl)'` (line 184~186, calibMode true) | `class="border-accent bg-accent/10 text-accent border text-caption font-bold leading-none rounded-sm"` (OQ #2 LOCKED active) | W2 frame 1/2 active row |

### §3.3 영역 2 — preview + 캘리브 좌표 시스템 (line 61~103, W3 sketch 출처)

| 현재 | 변환 후 | sketch |
|---|---|---|
| 외곽 div `position:'relative', width:'100%', height:'100%'` (line 62) | 인라인 유지 (style 그대로) | W3 all frames |
| preview img `width:'100%', height:'100%', objectFit:'contain', borderRadius:8, background:'#fff'` (line 70~73) | `class="rounded-sm"` style={{ width:'100%', height:'100%', objectFit:'contain', background:'#fff' }} | W3 all frames |
| preview img border 분기 `calibMode ? '2px solid var(--acl)' : '1px solid var(--bd)'` (line 72) | `className={\`... ${calibMode ? 'border-2 border-accent' : 'border border-border-default'}\`}` (OQ #5 LOCKED) | W3 frame 2/4 vs 1/3 |
| preview img cursor 분기 `calibMode ? 'crosshair' : 'default'` (line 74) | 인라인 유지 (분기 가독성) | W3 frame 2/4 |
| yearPos overlay `position:'absolute', top:${y}%, left:${x}%, transform:'translate(-50%,-50%)', fontSize:'min(1.4vw, 16px)', fontWeight:700, color:'#000', fontFamily:'Malgun Gothic, 맑은 고딕, sans-serif', pointerEvents:'none'` (line 79~88) | **인라인 100% 유지** (★ 캘리브 좌표 시스템 시그니처 — 1 byte 변경 금지) | W3 frame 3/4 |
| 캘리브 안내 칩 `background:'rgba(59,130,246,0.9)', color:'#fff', padding:'6px 16px', borderRadius:8, fontSize:12, fontWeight:700, whiteSpace:'nowrap', pointerEvents:'none', top:8, left:'50%', transform:'translateX(-50%)'` (line 92~98) | `class="text-caption font-bold leading-none text-white rounded-sm"` style={{ position:'absolute', top:8, left:'50%', transform:'translateX(-50%)', background:'rgba(59,130,246,0.9)', padding:'6px 16px', whiteSpace:'nowrap', pointerEvents:'none' }} (OQ #5 LOCKED 인라인 rgba 유지 + OQ #3 LOCKED 12 text-caption + leading-none) | W3 frame 2/4 |
| 카피 '연도가 들어갈 위치를 클릭하세요' (line 99) | verbatim 유지 | W3 |

### §3.4 영역 5 모바일 — 다운로드 묶음 (line 194~221, W4 sketch 출처)

| 현재 | 변환 후 | sketch |
|---|---|---|
| 본문 wrapper `flex:1, overflow:'auto', padding:16, flexDirection:column, gap:16` (line 194) | 인라인 유지 | W3 + W4 frame 1/2 |
| 모바일 미리보기 wrapper `width:'100%'` (line 196) | 인라인 유지 | W3 frame 1/2 |
| 설명 + 다운로드 wrapper `textAlign:'center'` (line 201) | 인라인 유지 | W4 frame 1/2 |
| 모바일 설명 `fontSize:13, color:'var(--t3)', marginBottom:12` (line 202) | `class="text-label leading-relaxed text-text-tertiary"` style={{ marginBottom:12 }} (OQ #3 LOCKED 13 text-label) | W4 frame 1/2 |
| 모바일 다운로드 버튼 `width:'100%', padding:14, borderRadius:10, border:'none', fontSize:14, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:8` (line 205~214) | `class="bg-safe-bar text-text-on-accent text-body font-bold rounded-md flex items-center justify-center"` style={{ width:'100%', padding:14, gap:8, border:'none', cursor:'pointer' }} (OQ #1 LOCKED solid + OQ #3 LOCKED 14→16 text-body font-bold 격상 + radius 10→12 `rounded-md` 마이그레이션) | W4 frame 1 |
| 모바일 background 분기 `loading ? 'var(--bg3)' : 'linear‑gradient(135deg,#1e40af,#3b82f6)'` (line 210) | `className={\`... ${loading ? 'bg-surface-sunken text-text-tertiary cursor-not-allowed' : 'bg-safe-bar text-text-on-accent cursor-pointer'}\`}` (OQ #1 LOCKED) | W4 frame 1 vs 2 |
| 모바일 svg `width:16 height:16 viewBox path "M12 5v14m0 0l-4-4m4 4l4-4M4 19h16"` (line 216~218) | `<Download size={16} />` (OQ #4 LOCKED Lucide 교체) | W4 frame 1/2 |
| 카피 분기 `loading ? '생성 중...' : '엑셀 다운로드'` (line 219) | 그대로 | W4 frame 1/2 |

### §3.5 미적용 패턴 (Stat Card §6.3 — AnnualPlanPage 에 없음)

연간 업무 추진 계획 페이지는 **Stat Card (28px display 숫자) 패턴 없음** → §6.3 룰 미적용. 단, sketch 새 패턴 (캘리브 모드 분기 매트릭스 4 state — W3 sketch frame 1~4) 은 verbatim 인용해 본 §3.3 박제 (memory `feedback_tsx_wave_stat_card_drift` 보호 — source 의 `'2px solid var(--acl)'` calibMode 분기가 sketch 의 `border-2 border-accent` 토큰 패턴을 덮어쓰지 않도록 명시).

---

## §4. OQ LOCKED 5건 변환 결과 반영 (W1 §7 verbatim + 코드 적용 line 범위)

```
OQ #1 (다운로드 버튼 bg-safe-bar solid + 그라데이션 완전 폐기):
  - line 135 (데스크톱): background 분기 → className "bg-safe-bar text-text-on-accent cursor-pointer" / "bg-surface-sunken text-text-tertiary cursor-not-allowed"
  - line 210 (모바일): 동일 분기
  - linear‑gradient(135deg,#1e40af,#3b82f6) 완전 폐기 (grep gate 0건 강제)
  - 영향 line: 130~145 (데스크톱) + 200~221 (모바일)

OQ #2 (위치조정 토글 토큰화):
  - line 122~124 (데스크톱) + line 184~186 (모바일): active 분기 → className "border-accent bg-accent/10 text-accent border"
  - line 121~123 (데스크톱) + line 183~185 (모바일): 평시 → className "bg-surface-sunken border border-border-strong text-text-secondary"
  - 영향 line: 118~129 (데스크톱) + 180~191 (모바일)

OQ #3 (폰트 격상 verbatim):
  - line 179 모바일 헤더 타이틀: fontSize:14 → "text-body font-bold" (14→16 격상)
  - line 187 모바일 위치조정 토글: fontSize:11 → "text-caption font-bold leading-none" (11→12 격상)
  - line 125 데스크톱 위치조정 토글: fontSize:12 → "text-caption font-bold leading-none" (12 유지)
  - line 115 데스크톱 설명: fontSize:12 → "text-caption leading-none" (12 유지)
  - line 96 캘리브 안내 칩: fontSize:12 → "text-caption font-bold leading-none" (12 유지)
  - line 202 모바일 설명: fontSize:13 → "text-label leading-relaxed" (13 유지)
  - line 137 데스크톱 다운로드: fontSize:13 → "text-label font-bold leading-none" (13 유지)
  - line 212 모바일 다운로드: fontSize:14 → "text-body font-bold" (14→16 격상)
  - line 83 연도 오버레이: fontSize:'min(1.4vw, 16px)' → 인라인 유지 (★ 캘리브 좌표 시스템 일부, 1 byte 변경 금지)

OQ #4 (Lucide 아이콘 교체):
  - line 1 또는 6 import: `import { ChevronLeft, Download } from 'lucide-react'` 추가
  - line 175~177 모바일 back button svg → <ChevronLeft size={15} className="text-text-secondary" />
  - line 141~143 데스크톱 다운로드 svg → <Download size={15} />
  - line 216~218 모바일 다운로드 svg → <Download size={16} />
  - svg path 인라인 폐기 (grep gate "M12 5v14" / "M15 19l-7-7" 0건 강제)

OQ #5 (preview border 토큰 + 캘리브 안내 칩 인라인 유지):
  - line 72 preview border: calibMode 분기 → className 분기 "border-2 border-accent" / "border border-border-default"
  - line 92~98 캘리브 안내 칩: background 'rgba(59,130,246,0.9)' 인라인 100% 유지 (alpha 정밀도 토큰 비용 회피)
  - line 94 color:'#fff' → className "text-white" + 인라인 fontWeight 700 / whiteSpace nowrap / pointerEvents none 모두 보존
```

---

## §5. negative gate (TSX 변환 후 AnnualPlanPage.tsx 가 통과해야 할 grep gate)

```bash
# 1. 이모지 0건 (sketch 본문 + TSX 변환 결과 모두)
grep -v '^#' cha-bio-safety/src/pages/AnnualPlanPage.tsx | grep -cE '[\xF0\x9F\x80-\xFF]' == 0

# 2. linear‑gradient 0건 (OQ #1 LOCKED 그라데이션 완전 폐기 증거)
grep -c 'linear-gradient' cha-bio-safety/src/pages/AnnualPlanPage.tsx == 0

# 3. 9·10·11 px 0건 (OQ #3 LOCKED 격상 결과, fontSize/font-size 양쪽 — 단 'min(1.4vw, 16px)' 의 16 은 11 아님)
grep -v '^\s*//' cha-bio-safety/src/pages/AnnualPlanPage.tsx | grep -cE "fontSize:\s*(9|10|11)[^0-9px]|font-size:\s*(9|10|11)[^0-9px]" == 0

# 4. status- prefix 0건 (memory feedback_tailwind_token_class_pattern)
grep -cE '(text|bg|border)-status-(safe|fire|warning|danger|caution)' cha-bio-safety/src/pages/AnnualPlanPage.tsx == 0

# 5. w-8 / h-8 0건 (w-8=48 함정, memory feedback_tailwind_w8_h8_is_48px)
grep -cE '\bw-8\b|\bh-8\b' cha-bio-safety/src/pages/AnnualPlanPage.tsx == 0

# 6. 옛 alias 토큰 0건 (var(--bg)/var(--bg2)/var(--bg3)/var(--bd)/var(--bd2)/var(--t1)/var(--t2)/var(--t3)/var(--acl)/var(--accent))
grep -cE 'var\(--(bg|bg2|bg3|bd|bd2|t1|t2|t3|acl|accent)\)' cha-bio-safety/src/pages/AnnualPlanPage.tsx == 0
# (단, rgba(59,130,246,0.9) + rgba(59,130,246,0.1) 직접 rgba 는 OQ #5/#2 LOCKED 예외)

# 7. 옛 svg path 0건 (OQ #4 LOCKED Lucide 교체 — svg path 인라인 폐기 증거)
grep -c 'M12 5v14m0 0l-4-4m4 4l4-4M4 19h16' cha-bio-safety/src/pages/AnnualPlanPage.tsx == 0
grep -c 'M15 19l-7-7 7-7' cha-bio-safety/src/pages/AnnualPlanPage.tsx == 0

# 8. 비즈 로직 diff 0 (handler/state/effect/hook 보존)
git diff HEAD~N cha-bio-safety/src/pages/AnnualPlanPage.tsx | grep -E '^[+-]\s*(useState|useEffect|useRef|useNavigate|useIsDesktop|generateAnnualPlan|setLoading|setCalibMode|setYearPos|handleDownload|handleImageClick|handleImageTouch|loadPos|STORAGE_KEY|FINGER_OFFSET|imgRef|nextYear)' == 0
# (logic line 의 - 추가 / + 제거 또는 변경이 없어야 함)

# 9. ★ 캘리브 좌표 시스템 시그니처 5건 보존 (15-daily-report SW3 precedent — 1 byte 변경 금지)
grep -c "STORAGE_KEY = 'annual_plan_year_pos'" cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1
grep -c "FINGER_OFFSET = 60" cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1
grep -c "((e.clientX - rect.left) / rect.width) \* 100" cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1
grep -c "FINGER_OFFSET" cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 2  # 정의 + 사용
grep -c "'min(1.4vw, 16px)'" cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1
grep -c "'Malgun Gothic, 맑은 고딕, sans-serif'" cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1
grep -c "/templates/preview/annual-plan.png" cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1
```

---

## §6. positive gate (변환 후 등장해야 할 패턴)

```bash
# 1. lucide-react import — ChevronLeft + Download 2개 추가 (OQ #4 LOCKED)
grep -c "from 'lucide-react'" cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1
grep -c 'ChevronLeft' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 2  # import + 사용
grep -c 'Download' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 3  # import + 데스크톱 + 모바일

# 2. v0.1.1 토큰 class 카운트 (≥3 핵심)
grep -c 'bg-surface-raised' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1  # 모바일 헤더
grep -c 'bg-surface-sunken' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 3  # back button + 토글 평시 (모바일+데스크톱) + 다운로드 disabled
grep -c 'border-border-default' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 3  # 모바일 헤더 + back button + 데스크톱 상단 바 + preview 평시
grep -c 'border-border-strong' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 2  # 위치조정 토글 평시 (모바일+데스크톱)
grep -c 'text-text-primary' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 2  # 모바일 헤더 타이틀 + 데스크톱 설명 strong
grep -c 'text-text-secondary' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 2  # 토글 평시 + ChevronLeft
grep -c 'text-text-tertiary' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 3  # 데스크톱 설명 + 모바일 설명 + 다운로드 disabled
grep -c 'bg-safe-bar' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 2  # 다운로드 default (모바일+데스크톱)
grep -c 'text-text-on-accent' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 2  # 다운로드 default
grep -c 'border-accent' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 2  # 위치조정 토글 active + preview 캘리브 모드
grep -c 'bg-accent/10' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1  # 위치조정 토글 active
grep -c 'text-accent' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1  # 위치조정 토글 active

# 3. 폰트 토큰 (OQ #3 LOCKED 격상)
grep -c 'text-caption' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 4  # 데스크톱 설명 + 데스크톱 토글 + 모바일 토글 + 캘리브 안내 칩
grep -c 'text-label' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 2  # 모바일 설명 + 데스크톱 다운로드
grep -c 'text-body' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 2  # 모바일 헤더 타이틀 + 모바일 다운로드
grep -c 'leading-none' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 3  # 작은 컨테이너 caption/label

# 4. 인라인 px 사이즈 (OQ #4 + memory feedback_tailwind_w8_h8_is_48px)
grep -c 'w-\[34px\]' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1  # 모바일 back button
grep -c 'h-\[34px\]' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1
grep -c 'rounded-sm' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 4  # back button + 토글 + 데스크톱 다운로드 + preview
grep -c 'rounded-md' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1  # 모바일 다운로드 (radius 10→12)

# 5. 카피 verbatim (memory feedback_sketch_realistic_data)
grep -c '연간 업무 추진 계획' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1
grep -c '연간 업무 추진 계획 미리보기' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1  # img alt
grep -c '연도가 들어갈 위치를 클릭하세요' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1
grep -c '위치 조정' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1
grep -c '취소' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1
grep -c '엑셀 다운로드' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 2  # 모바일 + 데스크톱
grep -c '생성 중' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 2  # 모바일 + 데스크톱
grep -c '엑셀이 다운로드됐습니다' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1  # toast.success
grep -c '연도 위치 저장됨' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1  # toast
grep -c '대상 연도' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 1  # 데스크톱 설명
grep -c '표지 및 일정표 연도가' cha-bio-safety/src/pages/AnnualPlanPage.tsx >= 2  # 모바일 + 데스크톱
```

---

## §7. build / tsc gate

```bash
cd cha-bio-safety && npx tsc --noEmit                # 0 error
cd cha-bio-safety && npm run build                   # exit 0
# AnnualPlanPage chunk size 보고 (Vite output 의 dist/assets/AnnualPlanPage-*.js)
ls -la cha-bio-safety/dist/assets/AnnualPlanPage-*.js  # size 확인
```

---

## §8. 자체 verify 명령 (TSX 변환 wave 진입 시점 + 완료 시점 양쪽 실행)

각 gate 의 grep/wc/git 명령을 fence 안에 verbatim 박제.

```bash
# 진입 시점: sketch 3 파일 모두 존재 확인
ls cha-bio-safety/docs/redesign-context/17-annual-plan/sketch-wave-{2-chrome,3-preview-calibration,4-download}.html

# 완료 시점: §5 negative + §6 positive + §7 build 모두 PASS

# generateAnnualPlan.ts 변경 0 확인 (TSX 변환 wave 끝나도 유지)
git diff HEAD -- cha-bio-safety/src/utils/generateAnnualPlan.ts | wc -l
# == 0 이어야 함
```

---

## §9. Tailwind cheatsheet (v0.1.1 토큰 → utility class 매핑 표)

| v0.1.1 토큰 | Tailwind utility | 17-annual-plan 적용 위치 |
|---|---|---|
| `--surface-page` | `bg-surface-page` | 모바일 외곽 + 데스크톱 미리보기 wrapper |
| `--surface-raised` | `bg-surface-raised` | 모바일 헤더 |
| `--surface-sunken` | `bg-surface-sunken` | back button + 위치조정 토글 평시 (모바일+데스크톱) + 다운로드 disabled |
| `--border-default` | `border-border-default` | 모바일 헤더 border-b + back button + 데스크톱 상단 바 border-b + preview 평시 border |
| `--border-strong` | `border-border-strong` | 위치조정 토글 평시 border (모바일+데스크톱) |
| `--text-primary` | `text-text-primary` | 모바일 헤더 타이틀 + 데스크톱 설명 `<strong>` |
| `--text-secondary` | `text-text-secondary` | 위치조정 토글 평시 + ChevronLeft |
| `--text-tertiary` | `text-text-tertiary` | 데스크톱 설명 + 모바일 설명 + 다운로드 disabled |
| `--text-on-accent` | `text-text-on-accent` | 다운로드 default (CTA 위 흰 글자) |
| `--safe-bar` | `bg-safe-bar` | 다운로드 default (OQ #1) |
| `--accent` | `border-accent` + `bg-accent/10` + `text-accent` | 위치조정 토글 active + preview 캘리브 모드 (OQ #2, #5) |
| (radius 8) | `rounded-sm` | back button + 위치조정 토글 + 데스크톱 다운로드 + preview |
| (radius 12) | `rounded-md` | 모바일 다운로드 (radius 10→12 마이그레이션) |
| (W-34, 토큰 없음) | `w-[34px] h-[34px]` | 모바일 back button (w-8=48 함정 회피) |
| (rgba 인라인 OQ #5) | `style={{ background:'rgba(59,130,246,0.9)' }}` | 캘리브 안내 칩 (alpha 정밀도 토큰 비용 회피) |
| (font min(1.4vw, 16px) OQ #3) | `style={{ fontSize:'min(1.4vw, 16px)' }}` | 연도 오버레이 (★ 캘리브 좌표 시스템 일부) |
| (font Malgun Gothic) | `style={{ fontFamily:'Malgun Gothic, ...' }}` | 연도 오버레이 (엑셀 표지 시각 일치, memory `feedback_pdflib_subset_false`) |

---

## §10. 비즈 보존 체크박스 (TSX 변환 wave 완료 후 직접 체크)

- [ ] `useNavigate()` line 15 그대로
- [ ] `useIsDesktop()` line 16 그대로
- [ ] `useState` 3종 (loading / calibMode / yearPos) line 17~19 그대로
- [ ] `useRef` (imgRef) line 20 그대로
- [ ] `nextYear = new Date().getFullYear() + 1` line 21 그대로
- [ ] `STORAGE_KEY = 'annual_plan_year_pos'` line 7 **1 byte 변경 금지** (★ 캘리브 시그니처)
- [ ] `FINGER_OFFSET = 60` line 8 **1 byte 변경 금지** (★ 캘리브 시그니처)
- [ ] `loadPos()` helper line 10~12 그대로
- [ ] `handleDownload` async + `generateAnnualPlan()` direct import line 23~33 그대로
- [ ] `handleImageClick` 좌표 계산식 line 35~45 **1 byte 변경 금지** (★ 캘리브 시그니처)
- [ ] `handleImageTouch` FINGER_OFFSET 보정 식 line 47~59 **1 byte 변경 금지** (★ 캘리브 시그니처)
- [ ] yearPos overlay inline style (fontSize/fontFamily) line 78~89 **1 byte 변경 금지** (★ 캘리브 시그니처)
- [ ] 캘리브 안내 칩 inline rgba + 카피 line 91~101 verbatim 보존 (OQ #5 LOCKED)
- [ ] preview 자산 `/templates/preview/annual-plan.png` line 65 경로 변경 금지
- [ ] img alt '연간 업무 추진 계획 미리보기' line 66 카피 verbatim
- [ ] `setCalibMode(m => !m)` 토글 line 119, 181 그대로
- [ ] `handleDownload` onClick + `disabled={loading}` line 131~132, 206~207 그대로
- [ ] `navigate(-1)` 모바일 back button line 170 그대로
- [ ] `generateAnnualPlan.ts` export 0 byte 변경

---

## §11. 메모리 룰 inline 인용 (W1 §5 mirror, 13+ 룰 — AnnualPlanPage 특화 룰 2건 포함)

각 룰 작용 케이스 한 줄 — `feedback_*.md` 파일명 + How (17-annual-plan 컨텍스트).

1. `feedback_design_sketch_first` — spacing/sizing 변경 시에도 sketch 먼저 컨펌. T1~T3 에서 다운로드 버튼 크기 / 캘리브 안내 칩 크기 / 위치조정 토글 padding 조정 시 sketch 먼저.
2. `feedback_redesign_sketch_rule_enforcement` — 위치조정 토글 active 색 = accent (모드 분기 강조) — `bg-status_safe-bg` 같은 위험 색 사용 금지. 다운로드 = CTA → `bg-safe-bar` solid (의미: "이 작업 실행" 정상 CTA, OQ #1 LOCKED).
3. `feedback_sketch_realistic_data` — 카피 verbatim (연간 업무 추진 계획 / 위치 조정 / 취소 / 연도가 들어갈 위치를 클릭하세요 / 엑셀 다운로드 / 생성 중... / 대상 연도 / 표지 및 일정표 연도가 / 엑셀이 다운로드됐습니다 / 연도 위치 저장됨 / 연간 업무 추진 계획 미리보기). 시안에서 변경 금지.
4. `feedback_planner_prompt_sketch_verbatim` — TSX 변환 진입 시 W2~W4 sketch 의 모든 Tailwind class / CSS 토큰 grep 으로 추출 → 본 §3 verbatim 인용. 특히 캘리브 안내 칩 `background:rgba(59,130,246,0.9)` / 연도 오버레이 `fontSize:'min(1.4vw, 16px)'` / A4 비율 `maxWidth:'calc((100vh - 140px) * 1.414)'` / 다운로드 그라데이션 폐기 모두 추측 X — sketch verbatim.
5. `feedback_tailwind_token_class_pattern` — 다운로드 그라데이션 → `bg-safe-bar` solid 치환 (OQ #1). `bg-status_safe-bar` (status- prefix) 사용 시 W5 verify FAIL. 위치조정 토글 active → `border-accent bg-accent/10 text-accent` (`status-accent` X). preview border calibMode → `border-2 border-accent`. Lucide `ChevronLeft size={15}` + `Download size={15/16}` prop 사용 — className 으로 `w-4 h-4` 금지.
6. `feedback_tailwind_w8_h8_is_48px` — 모바일 back button 34×34 (line 171) → `w‑8 h‑8` 사용 시 48×48 (1.4배 확대 사고) — `w-[34px] h-[34px]` 인라인 필수. 다운로드 버튼 padding 14 (line 209) → 자동 height ≈ 48 px (터치 마지노선 OK) — w-기반 함정과 별개 padding 인라인 안전.
7. `feedback_text_caption_leading_none` — 모바일 위치조정 토글 11 px (line 187, h≈30) → `text-caption font-bold leading-none` (12 + leading-none, 작은 컨테이너 시각 패딩 방지) / 데스크톱 위치조정 12 px (line 125, h≈34) + 데스크톱 설명 12 px (line 115) → `text-caption leading-none` / 캘리브 안내 칩 12 px (line 96, padding `6px 16px` 작은 칩) → `text-caption leading-none font-bold` / 데스크톱 다운로드 13 px (line 137, h≈34) → `text-label font-bold leading-none`.
8. `feedback_tsx_wave_emoji_dot_gap` — sketch 본문 이모지 0건 강제. AnnualPlanPage 본문에도 이모지 0건 (현재 잘 지켜짐 — 다운로드 svg 는 path 이지 이모지 아님). 데스크톱 설명의 `—` (em dash, line 116) 는 콘텐츠 글리프로 유지 (이모지 아님).
9. `feedback_tsx_wave_stat_card_drift` — 연간 업무 추진 계획 페이지에 Stat Card (28px display 숫자) 없음 → §3.5 "미적용" 메타 명시. 단, sketch 새 패턴 (캘리브 모드 분기 매트릭스 4 state) 은 verbatim 인용해 W5 checklist 박제. source 의 `'2px solid var(--acl)'` calibMode 분기가 sketch 의 `border-2 border-accent` 토큰 패턴을 덮어쓰지 않도록 명시.
10. `feedback_avoid_premature_confirmation` — TSX 변환 후 "approved 거의 일치" 자체 판단 금지. 결과 보여주고 사용자 판단. 특히 캘리브 좌표 시스템 시각 결과 (yearPos 저장 후 오버레이 위치) 는 사용자 판단 영역.
11. ★ `feedback_pdflib_subset_false` (AnnualPlanPage 특화 — 폰트 패밀리 보존 일반화) — 연도 오버레이 `fontFamily: 'Malgun Gothic, 맑은 고딕, sans-serif'` (line 84) 는 엑셀 표지 글꼴과 시각 일치를 위한 의도된 폰트 — `var(--font-sans)` 같은 디자인 시스템 폰트로 교체 금지. 폰트 패밀리 = 출력물 시각 anchor 룰.
12. ★ `project_redesign_15_daily_report_status` (AnnualPlanPage 특화 — 캘리브 좌표 시스템 precedent) — 15-daily-report SW3 의 portraitPos 보존 룰 동일 적용. STORAGE_KEY / FINGER_OFFSET / handleImageClick / handleImageTouch / yearPos overlay 모두 1 byte 변경 금지. SW3 변환 시 좌표 시스템 무손실 변환 성공 패턴 mirror.
13. `feedback_check_branch_before_edit` — TSX 변환 wave 진입 전 현재 branch 가 `redesign/17-annual-plan` 인지 확인 (main 단일-trunk 운영, dirty 면 사용자 컨펌 먼저).

---

## §12. 다음 단계

1. 본 wave (W5 checklist) 작성 완료 → 4 commit + push.
2. 사용자 시각 검수 — cbc7119-preview 배포 사이클 1회 (main 머지 후 자동) — sketch 3 HTML 직접 열어 4 frame 시각 확인.
3. 사용자 컨펌 받으면 **다음 quick task 시작** (`/clear` 권장 — memory `feedback_gsd_workflow_strict`) — TSX 변환 wave 진입.
   - 새 quick id (예: 260523-XX) 생성
   - PLAN: 1 task (W6 — TSX 변환), action = §3 매핑 표 verbatim + §5/§6/§7/§8 verify gate 그대로 적용
   - 산출: `AnnualPlanPage.tsx` 1 파일 in-place 수정 + atomic commit 1개 (`feat(17-annual-plan): W6 TSX 변환 ...`)
4. TSX 변환 wave 완료 → 사용자 시각 검수 → main 머지 → cbc7119-preview 배포 → 직원도메인 별도 배포 (메모리 `feedback_deploy_test` 룰 — design 작업은 사용자 명시 컨펌 후만).
5. 17-annual-plan 완결 status 메모 (memory `project_redesign_*_status` 패턴).

---

## § 자체 verify (본 W5 checklist 가 통과해야 할 gate)

- `AnnualPlanPage.tsx` + `generateAnnualPlan.ts` 2 파일 변경 0 (`git diff HEAD~4 HEAD -- {2 paths}` empty)
- 12 섹션 헤더 ≥1 each (§1~§12)
- verify 명령 fence ≥4 (§5/§6/§7/§8)
- sketch 출처 frontmatter sketch_sources 3개 (W2/W3/W4) 모두 존재 확인 (test -f)
- OQ #1~#5 인용 ≥5건
- 메모리 룰 ≥13 인용 (10 기본 + AnnualPlanPage 특화 3건)
- 캘리브 좌표 시스템 시그니처 5건 (STORAGE_KEY / FINGER_OFFSET / handleImageClick / handleImageTouch / yearPos) 모두 verbatim 박제

---

## §13. 부록 — Negative gate self-check (escape 표기)

본 checklist 자체가 grep 매칭 회피 escape 가 필요한 메타 텍스트 포함 — 다음 패턴은 ASCII 등가 토큰을 의도적으로 사용하지 않음:

- `linear-gradient` → 본문 메타 표기에 `linear‑gradient` (non-breaking-hyphen) 사용 (§3.1 + §3.4 다운로드 분기 메타)
- `bg-status-safe-bar` 예시 → `bg-status_safe-bar` (underscore) 사용 (§11 룰 2/5 메타)
- `w-8 = 48` 메타 → `w‑8 = 48` (non-breaking-hyphen) + `h‑8` (§11 룰 6)
- `9·10·11px` 메타 → `9·10·11 px` (한 칸 공백) 사용 (§5 룰 3)

이 escape 룰은 본 checklist 의 grep gate 가 자기 자신을 false-positive 매칭하지 않도록 하기 위함이다 (16-workshift t12 self-collision 사고 박제 mirror).
