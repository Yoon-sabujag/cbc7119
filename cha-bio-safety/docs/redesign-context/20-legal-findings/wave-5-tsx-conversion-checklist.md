---
title: "redesign/20-legal-findings — sketch wave 5 (TSX conversion checklist)"
status: ready_for_w6_conversion
created: 2026-05-23
quick_id: 260523-wic
branch: redesign/20-legal-findings (based on redesign/19-legal HEAD)
source_tsx: cha-bio-safety/src/pages/LegalFindingsPage.tsx
source_tsx_lines: 378
target_atomic: single export (영역 1 상단 + 영역 2 메인 함수 + 영역 3 JSX render 통합)
sketch_inputs:
  - cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html (W2)
  - cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html (W3)
  - cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html (W4)
oq_locked: 5 (W1 인덱스 §7 default LOCKED 2026-05-23 rgj)
biz_anchors: 11 (1 byte 변경 금지)
memory_rules_inline: 13
diff_with_19_legal: 5
next_wave: W6 (TSX 변환 atomic) + 자식 페이지 LegalFindingDetailPage 별도 wave
---

# redesign/20-legal-findings — W5 TSX conversion checklist

본 문서는 W2~W4 sketch (3 파일) + W1 인덱스 (724 lines) + LegalFindingsPage.tsx (378 lines) 를 기반으로
**W6 TSX 변환 wave (단일 atomic)** 의 verify checklist 다.
sketch HTML 아님 — markdown checklist.

## §1. 변환 범위

**LegalFindingsPage.tsx 단일 atomic 변환** (378 lines, 3 영역 통합):

1. **영역 1 — 상단 imports / 포맷터 / SKELETON_STYLE / Spinner** (line 1~40)
   - imports 추가: `import { ChevronLeft, Loader2 } from 'lucide-react'` (OQ #5 LOCKED)
   - fmtDate / fmtMonthOnly 보존 (line 13~21)
   - SKELETON_STYLE (line 24~29, height 88) 현 상태 박제 (OQ #4 LOCKED — SKELETON+Spinner 유지)
   - Spinner 함수 (line 32~39) → Lucide Loader2 animate-spin size={24} 교체 (OQ #5 LOCKED, @keyframes spin 제거)

2. **영역 2 — 메인 페이지 LegalFindingsPage 함수** (line 41~290)
   - useParams + useNavigate + useQueryClient + useAuthStore + useIsDesktop (line 43~47)
   - state 7종 (line 49~55) 보존
   - useQuery × 2 (line 57~68) — `['legal-round', id]` + `['legal-findings', id]` (★ 비즈 anchor 1+2)
   - handlers — handleSaveResult (line 76~89) / handleReportUpload (line 91~117) / handleDeleteFinding (line 124~136) / handleZipDownload (line 138~196) 모두 보존
   - headerTitle 동적 분기 (line 120~122) 보존 (★ 비즈 anchor 5)
   - sortedFindings (line 198~203) 보존 (★ 비즈 anchor 6)
   - adminBar (line 208~234) — Tailwind class 치환 + leading-none 명시 (OQ #3) (★ 비즈 anchor 7)
   - findingCard (line 237~269) — Tailwind class 치환 + `border-l-2 border-{safe|danger}-bar` (OQ #2 ★) + 칩 `bg-{danger|safe}-bg text-{danger|safe}` + text-caption leading-none (OQ #3) (★ 비즈 anchor 8)
   - addButton (line 272~291) — 데스크톱 width auto h 36 + 모바일 width 100% h 48, 인라인 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` (OQ #4 LOCKED ★)

3. **영역 3 — JSX render** (line 293~377)
   - 외곽 div (line 294) — `bg-surface-page` Tailwind 치환
   - 인라인 `@keyframes blink` (line 295) 보존 (.6/.3, ★ 비즈 anchor 10)
   - 모바일 헤더 (line 298~308) — `bg-surface-raised border-b border-border-default` (OQ #1 ★) + Lucide ChevronLeft size={20} + back button w-11 h-11 (OQ #5 ★)
   - 데스크톱 타이틀 (line 311~319) — `text-headline font-bold text-text-primary` (22/700) + round.title 부제 `text-label text-text-secondary`
   - {adminBar} mount (line 321) — `role === 'admin' && round` 조건부
   - 콘텐츠 영역 (line 324~344) — isLoading → `<Loader2 className="animate-spin" size={24} />` (OQ #5) / isError → 단일 문장 verbatim / 빈 → 카피 verbatim isDesktop 분기 / 카드 → sortedFindings.map(findingCard)
   - 모바일 고정 하단 CTA (line 348~356) — position fixed + iOS safe-area + addButton 그라데이션
   - FindingFormSheet 2종 (line 359~375) mount 그대로

**0 byte 변경 파일 (11 src 파일):**
- `cha-bio-safety/src/pages/LegalFindingsPage.tsx` — W6 변환 wave 에서만 수정 (본 PLAN 0 byte)
- `cha-bio-safety/src/components/PhotoGrid.tsx` (0 byte)
- `cha-bio-safety/src/components/PhotoSourceModal.tsx` (0 byte)
- `cha-bio-safety/src/components/FindingFormSheet.tsx` (0 byte — FindingFormSheet 내부 변환은 별도 wave)
- `cha-bio-safety/src/hooks/useMultiPhotoUpload.ts` (0 byte)
- `cha-bio-safety/src/utils/findingDownload.ts` (0 byte — buildMetaTxt 시그니처 보존)
- `cha-bio-safety/src/utils/api.ts` (0 byte — legalApi 4종 시그니처 보존)
- `cha-bio-safety/src/stores/authStore.ts` (0 byte)
- `cha-bio-safety/src/App.tsx` (0 byte — `/legal/:id` 라우팅 + line 117 정규식 보존)
- `cha-bio-safety/src/pages/LegalPage.tsx` (0 byte — 부모 페이지, 19-legal scope)
- `cha-bio-safety/src/pages/LegalFindingDetailPage.tsx` (0 byte — 자식 페이지, **§12 별도 wave**)

## §2. 비즈 anchor 11건 보존 (verbatim fence)

```typescript
// [react-query / 비즈 시그니처]
// 1. useQuery legal-round (line 57~62 verbatim)
const { data: round, isLoading: roundLoading } = useQuery({
  queryKey: ['legal-round', id],
  queryFn: () => legalApi.get(id!),
  enabled: !!id,
})

// 2. useQuery legal-findings (line 63~68 verbatim)
const { data: findings, isLoading: findingsLoading, isError } = useQuery({
  queryKey: ['legal-findings', id],
  queryFn: () => legalApi.getFindings(id!),
  enabled: !!id,
  staleTime: 30_000,
})

// 3. queryClient.invalidateQueries 3 키 — handler onSuccess 마다 정확한 키 invalidate 필수
//   ['legal-round', id] (handleSaveResult, handleReportUpload, handleDeleteFinding)
//   ['legal-rounds']    (handleSaveResult, handleDeleteFinding)
//   ['legal-findings', id] (handleDeleteFinding)

// [utils/api.ts legalApi 4종]
// 4. legalApi.get(roundId) / legalApi.getFindings(roundId) / legalApi.updateResult(roundId, {result?, report_file_key?}) / legalApi.deleteFinding(roundId, findingId)
//    snake_case payload + camelCase props 혼용 보존
//    (note: list / getFinding / resolveFinding 3종은 본 페이지 미사용 — 19-legal LegalPage 와 자식 LegalFindingDetailPage 가 사용)

// [비즈 로직 함수 + 분기]
// 5. headerTitle 동적 분기 (line 120~122 verbatim)
const headerTitle = round
  ? `${round.title.includes('종합정밀') ? '종합정밀' : '작동기능'} ${fmtMonthOnly(round.date)}`
  : '지적사항 목록'

// 6. sortedFindings open-first (line 198~203 verbatim)
const sortedFindings = [...(findings ?? [])].sort((a, b) => {
  if (a.status === 'open' && b.status !== 'open') return -1
  if (a.status !== 'open' && b.status === 'open') return 1
  return b.createdAt.localeCompare(a.createdAt)
})

// 7. adminBar 조건부 (line 208 verbatim)
const adminBar = role === 'admin' && round ? (
  // ... 결과 select + 결과 저장 + 보고서 + ZIP
) : null

// 8. findingCard onClick — 자식 페이지 진입 (line 240 verbatim, 19-legal 우측 패널과 다름 ★)
onClick={() => navigate(`/legal/${id}/finding/${finding.id}`)}

// [handleZipDownload + iOS PWA + animation + 카피]
// 9. handleZipDownload (line 138~196 verbatim — fflate + buildMetaTxt + iOS PWA <a download> + setTimeout 3000)
//    ZIP 파일명 (line 184): `지적사항_${round?.title ?? 'report'}.zip` (19-legal location 기반과 다름 ★)
//    폴더명 (line 149): `finding-${String(idx+1).padStart(3,'0')}_${(location ?? '위치없음').replace(/[\/\\:*?"<>|]/g, '_')}`
//    사진 파일명 (line 161, 171): `지적사진-${j+1}.jpg` / `조치사진-${j+1}.jpg`
//    내용.txt (line 153): encoder.encode(buildMetaTxt(f)) — 사진 0건이어도 always 포함
//    iOS PWA `<a download>` (line 182~188): createElement + body.appendChild + click + removeChild + setTimeout(URL.revokeObjectURL, 3000)
//    zipLoading 5 단계: '준비 중...' / '수집 중... (N/M)' / '압축 중...' / false / idle '일괄 다운로드'

// 10. @keyframes 2종
//     @keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} } (line 295) — .6/.3, 19-legal 일치, Education 1/0.4 와 다름
//     @keyframes spin { to{transform:rotate(360deg)} } (line 36) — OQ #5 LOCKED Lucide Loader2 교체 시 제거

// 11. toast 카피 8종 verbatim
//     success: '점검 결과가 저장되었습니다.' (handleSaveResult line 83) / '보고서가 업로드되었습니다.' (handleReportUpload line 111)
//              / '삭제되었습니다' (handleDeleteFinding line 132) / '다운로드 완료' (handleZipDownload)
//     error:   '저장에 실패했습니다.' / '사진 업로드 실패' / err?.message ?? '삭제 실패' / '다운로드에 실패했습니다'
//     + 빈 '지적사항 없음' + isDesktop 분기 '현장에서 지적된 항목을 등록하려면 ${isDesktop ? "상단" : "아래"} 버튼을 누르세요.'
//     + 단일 문장 오류 '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.' (19-legal 분리 패턴과 다름 ★)
//     + adminBar select 4 옵션 '결과 미입력'/'적합'/'부적합'/'조건부적합' + '결과 저장' + 보고서 분기 '보고서 보기'/'보고서 업로드'/'업로드 중...'
//     + ZIP zipLoading 5 단계 + addButton '+ 지적사항 등록'
//     + finding 칩 '미조치'/'완료' + 위치 fallback '위치 미지정' + 액션 '수정'/'삭제'
//     + 메타 `${fmtDate(createdAt)} · ${createdByName ?? createdBy}`
```

## §3. 변환 매핑 (영역 1~3 verbatim — wave-1-index.md §1.1 인용)

### 영역 1 — 상단 imports / 포맷터 / SKELETON_STYLE / Spinner (line 1~40)

| element | line | 변환 | W2 sketch 매핑 |
|---|---|---|---|
| imports | 1~10 | `import { ChevronLeft, Loader2 } from 'lucide-react'` 추가 (OQ #5) | W2 + W3 + W4 헤더/Spinner anchor |
| fmtDate / fmtMonthOnly | 13~21 | 보존 (1 byte 변경 금지) | W2 (headerTitle) + W3 (메타) |
| SKELETON_STYLE | 24~29 | 현 상태 박제 — `bg-surface-sunken rounded-md` Tailwind 치환 (height 88 보존) | W2 sketch SKELETON 박제 |
| Spinner | 32~39 | `<Loader2 className="animate-spin" size={24} />` 교체 (OQ #5), @keyframes spin 제거 | W2 sketch Loader2 anchor |

### 영역 2 — 메인 함수 (line 41~290)

| element | line | 변환 | sketch 매핑 |
|---|---|---|---|
| state + useQuery × 2 | 43~68 | 보존 | W3/W4 anchor |
| handlers | 76~196 | 보존 (handleSaveResult / handleReportUpload / handleDeleteFinding / handleZipDownload) | W4 anchor |
| headerTitle | 120~122 | 보존 (동적 분기) | W2 sketch (4 frame headerTitle 박제) |
| sortedFindings | 198~203 | 보존 (open-first) | W3 sketch (Frame 3 mixed sorted 박제) |
| adminBar | 208~234 | `bg-surface-raised border-b border-border-default` + 4 옵션 verbatim + 결과 저장 `bg-accent` solid + 보고서/ZIP `bg-surface-sunken border-border-strong` (OQ #4) + leading-none (OQ #3) | W4 sketch (4 frame admin/assistant + zipLoading 박제) |
| findingCard | 237~269 | `bg-surface-sunken border border-border-default border-l-2 border-{safe|danger}-bar` (★ 2px, OQ #2) + 칩 `bg-{danger|safe}-bg text-{danger|safe}` + `text-caption font-bold leading-none` (OQ #3) | W3 sketch (4 frame 박제) |
| addButton | 272~291 | 데스크톱 width auto h 36 / 모바일 width 100% h 48 + 인라인 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` (OQ #4 ★) | W4 sketch (4 frame 그라데이션 anchor ≥3 박제) |

### 영역 3 — JSX render (line 293~377)

| element | line | 변환 | sketch 매핑 |
|---|---|---|---|
| 외곽 div | 294 | `bg-surface-page` Tailwind 치환 | W2 sketch 외곽 |
| @keyframes blink | 295 | 보존 (.6/.3) | W2 sketch SKELETON anchor |
| 모바일 헤더 | 298~308 | `bg-surface-raised border-b border-border-default` (OQ #1 ★) + Lucide ChevronLeft size={20} + w-11 h-11 (OQ #5 ★) | W2 sketch (4 frame 모바일 헤더 박제) |
| 데스크톱 타이틀 | 311~319 | `bg-surface-page` 패딩 24px/32px/12px + headerTitle 22/700 + round.title 부제 13 | W2 sketch (Frame 3 글로벌 chrome 0건 박제) |
| {adminBar} mount | 321 | role === 'admin' && round 조건부 | W4 sketch |
| isLoading 분기 | 324~325 | `<Loader2 className="animate-spin" size={24} />` (OQ #5) | W2 sketch (Frame 2 Loader2) |
| isError 분기 | 326~329 | 단일 문장 verbatim `text-body-sm text-text-secondary` (19-legal 분리 패턴과 다름 ★) | W2 sketch (Frame 4 단일 문장) |
| 빈 분기 | 338~342 | isDesktop 분기 '상단'/'아래' verbatim (OQ #4) | W2 sketch (Frame 1/3 빈) |
| 카드 매핑 | 343 | sortedFindings.map(findingCard) | W3 sketch |
| 모바일 고정 하단 CTA | 348~356 | position fixed + iOS safe-area + zIndex 20 + addButton 그라데이션 | W4 sketch (Frame 3 모바일 박제) |
| FindingFormSheet 2종 | 359~375 | mount 그대로 (props 보존) | (별도 wave) |

## §4. OQ LOCKED 5건 반영 매핑 표

| OQ | 결정 | 적용 위치 (line) | sketch wave | TSX 변환 후 매핑 |
|---|---|---|---|---|
| OQ #1 ★ | 모바일 헤더 `bg-surface-raised border-b border-border-default` | 298~308 (`rgba(22,27,34,0.97)` + `1px solid var(--bd)` 폐기) | W2 Frame 1/2/4 | `<div className="bg-surface-raised border-b border-border-default" style="height:48px;...">` |
| OQ #2 ★ | finding 2분기 `border-l-2 border-{safe\|danger}-bar` (★ 2px, 19-legal 3px 와 다름) + 칩 `bg-{danger\|safe}-bg text-{danger\|safe}` | 244 borderLeft / 255 칩 | W3 Frame 1~4 | `<div className="bg-surface-sunken border border-border-default border-l-2 border-{open?'danger':'safe'}-bar rounded-md">` + 칩 |
| OQ #3 ★ | 9·10·11 → 12 격상 + `leading-none` | 255 칩 11 / 259 메타 11 / 264~265 액션 10 / 257 위치 12 | W3 Frame 1~4 | `text-caption font-bold leading-none` 일괄 격상 |
| OQ #4 ★ | addButton `linear-gradient(135deg, #1d4ed8, #0ea5e9)` ≥3 박제 + 작은 도구 solid + 빈/오류 카피 verbatim + SKELETON+Spinner 유지 | 272~291 addButton / 219~232 adminBar / 326~342 빈/오류 | W4 Frame 1~4 그라데이션 ≥3 + W2 Frame 1/3/4 빈/오류 | addButton 인라인 `style={{ background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)' }}` |
| OQ #5 ★ | Lucide ChevronLeft size={20} + back 44x44 (w-11 h-11) + Lucide Loader2 animate-spin size={24} (★ Camera 없음 — 19-legal 차이) | 303~305 back / 32~39 Spinner | W2 Frame 1~4 anchor | `import { ChevronLeft, Loader2 } from 'lucide-react'` + `<ChevronLeft size={20} />` + `<Loader2 className="animate-spin" size={24} />` |

## §5. Negative gate (sketch + TSX 변환)

**Sketch 본문 (W2/W3/W4):**
- 이모지 0건 (Camera 없음 — FindingFormSheet 내부 담당)
- `linear-gradient` — T1/T2/T4 = 0건 / **T3 (W4) 만 예외 anchor ≥3** (OQ #4 LOCKED `linear-gradient(135deg, #1d4ed8, #0ea5e9)` 박제)
- 9·10·11 px fontSize 0건 (OQ #3 LOCKED 12 격상)
- `(text|bg|border)-status-` class prefix 0건 (OQ #2 위반)
- `w-8` / `h-8` 0건 (tailwind config w-8=48px 함정)
- 옛 alias 토큰 (`var(--bg)` 등) sketch 본문 0건 (tokens.css 정의 fence 예외)

**TSX 변환 후:**
- LegalFindingsPage.tsx — `var(--bg) / var(--bg2) / var(--bg3) / var(--bd) / var(--bd2) / var(--t1) / var(--t2) / var(--t3) / var(--acl)` 옛 alias 모두 → Tailwind class 치환 (단 `var(--sab, 0px)` iOS safe-area 만 인라인 보존)
- `bg-status-*` / `text-status-*` 사용 0건 (OQ #2 위반)
- 인라인 SVG ChevronLeft path 폐기 (OQ #5)
- Spinner div + @keyframes spin 폐기 (OQ #5)
- addButton 인라인 그라데이션 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` ≥1 (예외 anchor)

## §6. Positive gate

- 4 sketch 파일 모두 존재 (W2 chrome + W3 finding-list + W4 admin-tools + W5 checklist)
- 토큰 매핑 완결 (W2/W3/W4 모두 토큰 매핑 박스 포함)
- 비즈 anchor 11건 박제 hit ≥6 / 4 sketch
- OQ #1~#5 인용 4 sketch 분산
- 글로벌 chrome 0건 anchor (App.tsx line 117 정규식 `!location.pathname.match(/^\/legal\/.+/)` → `showNav=false`) ≥1
- ZIP 파일명 round.title 기반 anchor ≥1 (W4)
- 19-legal 차이 5건 cross-ref 4 sketch + 본 checklist

## §7. Build / tsc (W6 변환 wave 시점)

```bash
# W6 변환 wave 완료 후 (본 PLAN 본 task 에서는 verify gate 없음 — sketch 만 산출)
cd cha-bio-safety
npm run build  # PASS 필수
npx tsc --noEmit  # PASS 필수 (strict false 이지만 type error 0건)
```

## §8. 자체 verify grep 모음 (W6 변환 wave 시점)

```bash
# 1. borderLeft 2px 매칭 (★ 2px 19-legal 3px 와 다름)
grep -cE 'border-l-2 border-(safe|danger)-bar' cha-bio-safety/src/pages/LegalFindingsPage.tsx
# expected: ≥1

# 2. status- prefix 0
grep -cE '(text|bg|border)-status-(safe|fire|warning|danger|caution)' cha-bio-safety/src/pages/LegalFindingsPage.tsx
# expected: 0

# 3. w-8 / h-8 0
grep -cE '\bw-8\b|\bh-8\b' cha-bio-safety/src/pages/LegalFindingsPage.tsx
# expected: 0

# 4. 9/10/11 px 0 (OQ #3)
grep -cE 'fontSize:\s*(9|10|11)[^0-9]' cha-bio-safety/src/pages/LegalFindingsPage.tsx
# expected: 0

# 5. linear-gradient ≥1 (T3/W4 만 예외 anchor — addButton)
grep -cE 'linear-gradient\(135deg,\s*#1d4ed8,\s*#0ea5e9\)' cha-bio-safety/src/pages/LegalFindingsPage.tsx
# expected: ≥1 (addButton, OQ #4 LOCKED 예외 anchor)

# 6. Lucide ChevronLeft + Loader2 (OQ #5)
grep -cE 'import.*ChevronLeft|import.*Loader2' cha-bio-safety/src/pages/LegalFindingsPage.tsx
# expected: ≥1

# 7. headerTitle 동적 분기 보존
grep -c "round.title.includes('종합정밀')" cha-bio-safety/src/pages/LegalFindingsPage.tsx
# expected: 1

# 8. sortedFindings open-first 보존
grep -cE "a\.status === 'open' && b\.status !== 'open'" cha-bio-safety/src/pages/LegalFindingsPage.tsx
# expected: 1

# 9. adminBar 조건부 보존
grep -cE "role === 'admin' && round" cha-bio-safety/src/pages/LegalFindingsPage.tsx
# expected: 1

# 10. findingCard navigate 자식 진입 보존
grep -c "navigate(\`/legal/\${id}/finding/\${finding.id}\`)" cha-bio-safety/src/pages/LegalFindingsPage.tsx
# expected: 1

# 11. ZIP round.title + iOS PWA <a download>
grep -cE "지적사항_\$\{round\?\.title \?\? 'report'\}\.zip" cha-bio-safety/src/pages/LegalFindingsPage.tsx
# expected: 1
grep -cE "setTimeout.*URL\.revokeObjectURL.*3000" cha-bio-safety/src/pages/LegalFindingsPage.tsx
# expected: 1

# 12. @keyframes blink (.6/.3) + addButton 카피
grep -c '@keyframes blink' cha-bio-safety/src/pages/LegalFindingsPage.tsx
# expected: 1
grep -c '+ 지적사항 등록' cha-bio-safety/src/pages/LegalFindingsPage.tsx
# expected: 1
```

## §9. Tailwind cheatsheet (v0.1.1 토큰 → utility class 매핑, 20-legal-findings 적용)

| v0.1.1 토큰 | Tailwind utility | 20-legal-findings 적용 위치 (line) |
|---|---|---|
| `--surface-page` | `bg-surface-page` | LegalFindingsPage 외곽 (294) + 모바일 고정 하단 CTA (351) |
| `--surface-raised` | `bg-surface-raised` | 모바일 헤더 (298, OQ #1) + adminBar 외곽 (211) |
| `--surface-sunken` | `bg-surface-sunken` | finding 카드 (244) + SKELETON_STYLE (25) + select (219) + 보고서 button (228/230) + ZIP button (232) |
| `--border-default` | `border-border-default` / `border-b border-border-default` / `border-t border-border-default` | 모바일 헤더 borderBottom (OQ #1) + finding 카드 평시 + adminBar borderBottom + 모바일 고정 하단 CTA borderTop |
| `--border-strong` | `border-border-strong` | select border + 보고서 button border + ZIP button border + Spinner border (OQ #5 폐기) |
| `--text-primary` | `text-text-primary` | 모바일 헤더 타이틀 + 데스크톱 headerTitle + finding description + adminBar select 글자 + 빈 제목 + 보고서 보기 글자 |
| `--text-secondary` | `text-text-secondary` | finding 위치 + round.title 부제 + 빈 보조 + 오류 카피 + 보고서 업로드 글자 |
| `--text-tertiary` | `text-text-tertiary` | finding 메타 + 수정/삭제 액션 + fallback 카피 |
| `--status-danger-bar` + `--status-danger-bg` + `--status-danger` | `border-l-2 border-danger-bar` / `bg-danger-bg` / `text-danger` | finding 칩 open + finding borderLeft open (OQ #2 LOCKED, **2px** 19-legal 3px 와 다름) |
| `--status-safe-bar` + `--status-safe-bg` + `--status-safe` | `border-l-2 border-safe-bar` / `bg-safe-bg` / `text-safe` | finding 칩 resolved + finding borderLeft resolved (OQ #2 LOCKED, **2px**) |
| `--accent` (solid) | `bg-accent text-text-on-accent` | 결과 저장 button (line 225) |
| `--accent` (CTA gradient) | 인라인 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` | addButton (line 289, **OQ #4 LOCKED T3 만 예외 anchor ≥3**) |
| (radius 6) | `rounded-sm` | finding 칩 |
| (radius 8) | `rounded-sm` | adminBar select + 결과 저장 + 보고서 button + ZIP button + 데스크톱 addButton |
| (radius 12) | `rounded-md` | finding 카드 + SKELETON + 모바일 addButton |
| (spacing 11) | `w-11 h-11` (44x44, OQ #5) | back button (44x44 격상) |
| typography | `text-caption font-bold leading-none` (12) / `text-label` (13) / `text-body-sm` (14) / `text-body font-bold` (16) / `text-headline font-bold` (22) | 칩/메타/액션 (OQ #3) / select / description / 모바일 헤더 타이틀 / 데스크톱 headerTitle |

## §10. 비즈 보존 체크박스 (W6 변환 후 verify 시 체크)

- [ ] legalApi 4종 시그니처 보존 (get / getFindings / updateResult snake_case / deleteFinding) (line 79, 100, 130 등)
- [ ] useQuery × 2 보존 — `['legal-round', id]` enabled !!id (line 57~62) + `['legal-findings', id]` enabled !!id staleTime 30_000 (line 63~68)
- [ ] queryClient.invalidateQueries 3 키 정확 — ['legal-round', id] / ['legal-rounds'] / ['legal-findings', id] (handler onSuccess 마다 line 83~88, 111~115, 130~134)
- [ ] headerTitle 동적 분기 보존 (line 120~122) — `round.title.includes('종합정밀') ? '종합정밀' : '작동기능'` + fmtMonthOnly + fallback '지적사항 목록'
- [ ] sortedFindings open-first 보존 (line 198~203) — open === -1, open !== 1, 그 외 createdAt desc localeCompare
- [ ] adminBar role admin 조건부 보존 (line 208) — `role === 'admin' && round`
- [ ] findingCard navigate 자식 진입 보존 (line 240) — `navigate(\`/legal/${id}/finding/${finding.id}\`)` ★
- [ ] handleZipDownload iOS PWA 패턴 보존 (line 138~196) — fflate zipSync + buildMetaTxt + `<a download>` + setTimeout 3000
- [ ] ZIP 파일명 round.title 기반 (line 184) — `지적사항_${round?.title ?? 'report'}.zip` ★ (19-legal 차이)
- [ ] toast 카피 8종 verbatim — success 4 + error 4 (handleSaveResult/handleReportUpload/handleDeleteFinding/handleZipDownload)
- [ ] @keyframes blink (.6/.3) 보존 (line 295) — 19-legal 일치, Education 1/0.4 와 다름
- [ ] 빈/오류 카피 verbatim — '지적사항 없음' + isDesktop 분기 + 단일 문장 '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.'
- [ ] adminBar 카피 verbatim — select 4 옵션 / '결과 저장' / 보고서 분기 / ZIP zipLoading 5단계 / addButton '+ 지적사항 등록'
- [ ] finding 카드 카피 verbatim — 칩 '미조치'/'완료' / 위치 fallback '위치 미지정' / 액션 '수정'/'삭제' / 메타 fmtDate + ' · '

## §11. 메모리 룰 inline (13 룰 cross-ref)

1. **feedback_inspection_unresolved_color.md** (일반화) — finding 2분기 status 토큰 (OQ #2 LOCKED, borderLeft 2px + 칩 status- prefix 없음)
2. **project_inspection_completion_rule.md** (일반화) — adminBar role admin 도구 분기 (line 208) + sortedFindings open-first (line 198~203) source of truth
3. **feedback_tailwind_token_class_pattern.md** — status- prefix 없음 + lucide `<Icon size={N} />` prop
4. **feedback_tailwind_w8_h8_is_48px.md** — w-8/h-8 = 48px 함정 (back button 44x44 = `w-11 h-11`, OQ #5 LOCKED 격상)
5. **feedback_text_caption_leading_none.md** — 작은 컨테이너 안 `text-caption` (12) `leading-none` 명시 (칩/메타/액션 OQ #3)
6. **feedback_sketch_realistic_data.md** — 표시 분기/라벨 룰 코드 그대로 (W2/W3/W4 sketch 모두 적용)
7. **feedback_design_changes_ask_first.md** — 디자인 변경 전 사용자 컨펌
8. **feedback_planner_prompt_sketch_verbatim.md** — sketch CSS verbatim 인용 (W2/W3/W4 sketch CSS 박제 패턴)
9. **feedback_tsx_wave_emoji_dot_gap.md** — sketch 의 이모지 0건 negative gate (Camera 없음)
10. **feedback_tsx_wave_stat_card_drift.md** — source outline 패턴 보존 + sketch 새 패턴 누락 방지 (단일 atomic 변환에 적용)
11. **feedback_subagent_production_deploy_forbidden.md** — wrangler 명령 절대 X (디자인 wave)
12. **feedback_redesign_sketch_rule_enforcement.md** — §6.2 negative rule + OQ #2 status 토큰 예외 (운영 결과 상태 색) + OQ #4 addButton 그라데이션 예외
13. **feedback_cbc7119_design_never_wrangler.md** — wrangler 명령 절대 X (cbc7119-preview 자동 배포 사이클만, 직원 도메인 cbc7119 절대 X)

## §12. 다음 단계

### W6 — TSX 변환 wave (LegalFindingsPage.tsx 378 lines 단일 atomic)

- **별도 quick task** 로 진행 — 본 PLAN (260523-wic) 범위 외
- **단일 atomic commit**: `feat(redesign): redesign/20-legal-findings TSX 변환 (LegalFindingsPage.tsx 378 lines 단일 atomic + v0.1.1 토큰 className 매핑 + OQ LOCKED 5건 반영 + 비즈 anchor 11건 보존 + 19-legal 차이 5건 반영)`
- 변환 후 build/tsc PASS + 본 §8 grep 12종 모두 PASS + §10 비즈 보존 체크박스 모두 ✓
- cbc7119-preview 자동 배포 후 사용자 시각 검수 사이클 1회

### 자식 페이지 LegalFindingDetailPage (App.tsx line 291) — 별도 wave

- 본 wave + W2~W5 + W6 범위 **아님**
- LegalFindingsPage 의 findingCard onClick 으로 진입하는 자식 페이지 — sketch + TSX 변환 별도 quick task 로 진행
- 19-legal LegalPage 의 FindingDetailPanel 변환 패턴 참고 가능

### 부모 페이지 LegalPage (`/legal`) 의 19-legal 변환 완료 확인

- 19-legal/wave-5-tsx-conversion-checklist.md 기반 W6 변환 완료 후
- 본 LegalFindingsPage 변환 완료
- 자식 LegalFindingDetailPage 변환 완료
- → 3 페이지 (LegalPage / LegalFindingsPage / LegalFindingDetailPage) 모두 v0.1.1 토큰 완결

### 배포

- cbc7119-preview.pages.dev 자동 배포 (main 머지 시 GitHub Actions)
- ★ 직원 도메인 cbc7119.pages.dev 는 본 wave + W6 + 자식 페이지 wave 모두 **절대 다루지 않음** (CLAUDE.local.md + memory `feedback_cbc7119_design_never_wrangler`)
- wrangler 명령 절대 X / npm run deploy 절대 X
