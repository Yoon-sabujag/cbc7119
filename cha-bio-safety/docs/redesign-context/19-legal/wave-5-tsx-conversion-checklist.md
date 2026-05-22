---
title: "redesign/19-legal — wave 5 (TSX 변환 verify checklist)"
status: ready_for_tsx_wave
created: 2026-05-23
quick_id: 260523-40p
branch: redesign/19-legal
source_tsx: cha-bio-safety/src/pages/LegalPage.tsx
source_tsx_lines: 571
sketch_inputs:
  - cha-bio-safety/docs/redesign-context/19-legal/sketch-wave-2-chrome.html
  - cha-bio-safety/docs/redesign-context/19-legal/sketch-wave-3-round-card.html
  - cha-bio-safety/docs/redesign-context/19-legal/sketch-wave-4-findings-panel.html
mirror_of:
  - cha-bio-safety/docs/redesign-context/23-education/wave-5-tsx-conversion-checklist.md (260522-o7b)
  - cha-bio-safety/docs/redesign-context/28-splash/wave-5-tsx-conversion-checklist.md (260522-2q6)
oq_locked_count: 5
biz_anchor_count: 17
memory_rules_inline: 12
---

# redesign/19-legal — Wave 5 (TSX 변환 verify checklist)

> 본 문서는 W2~W4 sketch 3 파일 (chrome / round-card / findings-panel) 의 **W6 TSX 변환 wave 진입점**.
> LegalPage.tsx 571 lines 단일 atomic 변환 룰 + 비즈 anchor 17건 + OQ LOCKED 5건 + 메모리 룰 12+ inline 박제.

---

## §1. 변환 범위 (LegalPage.tsx 단일 atomic, 4 영역 통합)

LegalPage.tsx 571 lines 단일 파일. 4 영역 통합 변환:

- **영역 1** — 상단 유틸 / 포맷터 / 스켈레톤 / 탭 / KVRow (line 1~77)
- **영역 2** — FindingsPanel (line 82~228, 데스크톱 중앙 — 헤더 + admin 도구 + sorted findings + 카드 + 수정/삭제 + FindingFormSheet)
- **영역 3** — FindingDetailPanel (line 233~367, 데스크톱 우측 — 헤더 + admin 다운로드 + 지적 정보 + 사진 + 조치 입력/결과)
- **영역 4** — 메인 LegalPage (line 372~571, 모바일 + 데스크톱 3분할)

**atomic 1-commit 변환** (23-education o7b 591 lines + 28-splash 2q6 320 lines + 10-cctv-info 2-step 패턴 precedent).

**components.css 신규 X** (현재 tokens.css + typography.css 만 사용).

**`src/App.tsx` 변경 X** (PAGE_TITLES + MOBILE_NO_NAV_PATHS + Route 3개 + 특수 regex 모두 현재 유지).

**외부 6 파일 + sub-route 2 파일 변경 X** —
LegalPage.tsx 만 변경, 다음 파일들은 **0 byte**:
- `cha-bio-safety/src/utils/api.ts` (legalApi 7종)
- `cha-bio-safety/src/utils/findingDownload.ts` (buildMetaTxt)
- `cha-bio-safety/src/hooks/useMultiPhotoUpload.ts` (5장 제한 + cameraRef/albumRef + handleFiles)
- `cha-bio-safety/src/components/PhotoGrid.tsx`
- `cha-bio-safety/src/components/PhotoSourceModal.tsx`
- `cha-bio-safety/src/components/FindingFormSheet.tsx`
- `cha-bio-safety/src/pages/LegalFindingsPage.tsx` (모바일 sub-route)
- `cha-bio-safety/src/pages/LegalFindingDetailPage.tsx` (모바일 sub-route)

**Lucide import 추가 1 줄** — `import { ChevronLeft, Camera, Loader2 } from 'lucide-react'` (OQ #5 LOCKED).

---

## §2. 보존 — 비즈 anchor 17건 verbatim (1 byte 변경 금지)

W2/W3/W4 sketch rules 박스 의 17건 박제 fence verbatim 인용:

```
[react-query / 비즈 시그니처]
 1. useQuery({ queryKey: ['legal-rounds', year], queryFn: () => legalApi.list(year), staleTime: 30_000 }) (line 386~390)
 2. useQuery({ queryKey: ['legal-round', roundId], queryFn: () => legalApi.get(roundId), enabled: !!roundId }) (line 96~100)
 3. useQuery({ queryKey: ['legal-findings', roundId], queryFn: () => legalApi.getFindings(roundId), enabled: !!roundId, staleTime: 30_000 }) (line 102~106)
 4. useQuery({ queryKey: ['legal-finding', roundId, findingId], queryFn: () => legalApi.getFinding(roundId, findingId), enabled: !!roundId && !!findingId }) (line 241~245)
    + useMutation resolveMutation (line 247~265) + 4 키 invalidate

[utils/api.ts legalApi 7종]
 5. legalApi.list(year) / legalApi.get(roundId) / legalApi.getFindings(roundId)
    / legalApi.updateResult(roundId, {result?, report_file_key?})
    / legalApi.deleteFinding(roundId, fid)
    / legalApi.getFinding(roundId, fid)
    / legalApi.resolveFinding(roundId, fid, {resolution_memo, resolution_photo_keys?})
    snake_case payload + camelCase props 혼용 보존

[비즈 로직 함수 + 분기]
 6. accentColor(result) (line 27~32): pass → 'var(--safe)' / fail → 'var(--danger)' / conditional → 'var(--warn)' / 그 외 → 'var(--bd2)'
    ★ 4분기 1 byte 변경 금지 ★ (memory `feedback_inspection_unresolved_color` 일반화)
 7. ResultBadge map (line 35~47):
    pass {bg:'rgba(34,197,94,.13)', color:'var(--safe)', label:'적합'}
    fail {bg:'rgba(239,68,68,.15)', color:'var(--danger)', label:'부적합'}
    conditional {bg:'rgba(245,158,11,.15)', color:'var(--warn)', label:'조건부적합'}
    null → '결과 미입력' var(--t3)
    ★ 4 라벨 + rgba + var() 1 byte 변경 금지 ★
 8. filterRounds (line 59~63):
    미조치 → findingCount > resolvedCount
    완료 → findingCount > 0 && findingCount === resolvedCount
    전체 → 그대로
    (memory `project_inspection_completion_rule` 일반화)
 9. TABS (line 54~58):
    [{key:'전체',label:'전체'},{key:'미조치',label:'진행 중'},{key:'완료',label:'완료'}]
    ★ key '미조치' / label '진행 중' mismatch 의도된 디자인 ★
10. sorted findings (line 147~151):
    const sorted = [...(findings ?? [])].sort((a, b) => {
      if (a.status === 'open' && b.status !== 'open') return -1
      if (a.status !== 'open' && b.status === 'open') return 1
      return b.createdAt.localeCompare(a.createdAt)
    })
    ★ open 먼저 + createdAt desc localeCompare 1 byte 변경 금지 ★
11. handleRoundClick (line 394~401):
    function handleRoundClick(round: LegalRound) {
      if (isDesktop) { setSelectedRoundId(round.id); setSelectedFindingId(null) }
      else { navigate('/legal/' + round.id) }
    }
12. role admin 도구 분기:
    FindingsPanel: role === 'admin' (line 162) → select + 저장 + 보고서/업로드 button
    FindingDetailPanel: staff?.role === 'admin' (line 299) → 다운로드 button

[useMultiPhotoUpload + ZIP + animation + 카피]
13. useMultiPhotoUpload() — slots / canAdd = slots.length < 5 / cameraRef / albumRef / showPicker
    / openPicker / closePicker / pickCamera / pickAlbum / handleFiles / removeSlot / uploadAll / isUploading / reset
14. buildMetaTxt(finding) + fflate dynamic import('fflate').zipSync
    + ZIP 파일명 `지적사항_${(finding.location ?? '').replace(/[\/\\:*?"<>|]/g, '_')}.zip`
    + 사진 파일명 `지적사진-${j+1}.jpg` / `조치사진-${j+1}.jpg`
15. @keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} } (line 467, 505)
    ★ Education 1/0.4 와 다름 (LegalPage 만 .6/.3) ★
    + @keyframes spin (line 291) — OQ #5 LOCKED Loader2 교체로 제거 예정
16. toast 카피 11종 verbatim:
    success 5 — '점검 결과 저장' (line 116) / '보고서 업로드 완료' (line 132) / '삭제됨' (line 143) / '조치 완료' (line 260) / '다운로드 완료' (line 284)
    error  6 — '저장 실패' (line 117) / '업로드 실패' (line 133) / err?.message ?? '삭제 실패' (line 144) / '조치 처리 실패' (line 264) / '다운로드 실패' (line 285) / '조치 내용을 입력하세요' (line 345)
17. 빈/오류/fallback 카피 verbatim 다수 (W2 박제):
    모바일 빈 '소방 점검 관리 이력 없음' + '소방 일정 페이지에서 종합정밀 또는 작동기능 점검을 등록하면 여기에 표시됩니다.'
    모바일 오류 '목록을 불러오지 못했습니다.' + '다시 시도'
    데스크톱 좌측 오류 '불러오기 실패' + '재시도' / 데스크톱 좌측 빈 '점검 이력 없음'
    FindingsPanel 빈 '지적사항 없음' / FindingDetailPanel 빈 '항목을 불러오지 못했습니다.'
    데스크톱 중앙 fallback '좌측에서 점검을 선택하세요'
    데스크톱 우측 fallback '중앙에서 지적사항을 선택하세요' / '점검을 먼저 선택하세요'
    모바일 헤더 타이틀 '소방 점검 관리'
    데스크톱 3분할 width 500 + 500 + flex 1 + borderRight 1px border-border-default
```

---

## §3. 변환 매핑 (영역 1~4 verbatim)

### 영역 1 — 상단 유틸 / 포맷터 / 스켈레톤 / 탭 / KVRow (line 1~77)

**imports** (line 1~13) verbatim 유지 + **import 추가**:
```tsx
import { ChevronLeft, Camera, Loader2 } from 'lucide-react'  // OQ #5 LOCKED
```

**fmtDate / fmtDateTime** (line 16~24) verbatim 유지.

**accentColor (line 27~32) verbatim 유지** — `'var(--safe)'` / `'var(--danger)'` / `'var(--warn)'` / `'var(--bd2)'` 4분기 (1 byte 변경 금지, memory `feedback_inspection_unresolved_color` 일반화).

TSX 변환 후 borderLeft 적용 위치 (line 445 데스크톱 카드 / 555 모바일 카드) 에서:
- **옵션 A (인라인 보존)**: `style={{ borderLeft: '3px solid ' + accentColor(round.result) }}` 인라인 그대로
- **옵션 B (Tailwind 매핑, OQ #2)**:
  ```tsx
  const borderLeftCls = (result: LegalInspectionResult | null) =>
    result === 'pass' ? 'border-l-[3px] border-safe-bar'
    : result === 'fail' ? 'border-l-[3px] border-danger-bar'
    : result === 'conditional' ? 'border-l-[3px] border-warning-bar'
    : 'border-l-[3px] border-border-strong'
  ```
  (executor 선호 — OQ #2 LOCKED status 토큰 매핑)

**ResultBadge (line 35~47) — map 4 라벨 verbatim 유지** + 외곽 style 인라인 11/700 → `text-caption font-bold leading-none` (OQ #3 격상) + bg/color 토큰 치환 (OQ #2):

```tsx
function ResultBadge({ result }: { result: LegalInspectionResult | null }) {
  const map: Record<string, { cls: string; label: string }> = {
    pass: { cls: 'bg-safe-bg text-safe', label: '적합' },
    fail: { cls: 'bg-danger-bg text-danger', label: '부적합' },
    conditional: { cls: 'bg-warning-bg text-warning', label: '조건부적합' },
  }
  const m = result ? map[result] : null
  return (
    <span className={`${m?.cls ?? 'bg-transparent text-text-tertiary'} text-caption font-bold leading-none rounded-sm`} style={{ padding: '2px 8px', flexShrink: 0 }}>
      {m?.label ?? '결과 미입력'}
    </span>
  )
}
```

**SKELETON** (line 50) — height 72 + animation 'blink 2s ease-in-out infinite' verbatim (var(--bg3) → 인라인 유지 또는 className `bg-surface-sunken rounded-md`).

**TabKey + TABS** (line 53~58) verbatim, **key '미조치' label '진행 중' mismatch 1 byte 변경 금지**.

**filterRounds** (line 59~63) verbatim, 3분기 변경 금지.

**genYears** (line 64~67) verbatim.

**KVRow** (line 70~77) — 라벨 12 var(--t3) → className `text-caption leading-none text-text-tertiary` + children 14 var(--t1) → className `text-label text-text-primary`.

### 영역 2 — FindingsPanel (line 82~228, OQ #2 + OQ #3 적용)

- useQueryClient / useAuthStore / role / state verbatim 유지
- useQuery × 2 (round + findings) — queryKey + queryFn + enabled 1 byte 변경 금지
- handleSaveResult / handleReportUpload / handleDelete — toast 카피 verbatim 유지
- sorted findings (line 147~151) — open-first 정렬 룰 verbatim 1 byte 변경 금지
- 헤더 — round?.title fallback '지적사항 목록' verbatim

**admin 도구 (role === 'admin' 분기 line 162)** — OQ #3 격상 (11 → text-caption font-bold leading-none):
```tsx
{role === 'admin' && round && (
  <div style={{ padding: '0 16px 8px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
    <select
      className="bg-surface-sunken border border-border-strong text-caption font-bold leading-none text-text-primary rounded-sm"
      style={{ padding: '4px 8px', appearance: 'none', cursor: 'pointer' }}
      value={effectiveResult} onChange={e => setSelectedResult(e.target.value)}
    >
      <option value="">미입력</option>
      <option value="pass">적합</option>
      <option value="fail">부적합</option>
      <option value="conditional">조건부적합</option>
    </select>
    <button
      onClick={handleSaveResult} disabled={savingResult}
      className="bg-accent text-text-on-accent text-caption font-bold leading-none rounded-sm"
      style={{ height: 28, padding: '0 10px', border: 'none', cursor: 'pointer', opacity: savingResult ? 0.6 : 1 }}
    >저장</button>
    <input ref={reportInputRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleReportUpload} />
    {round.reportFileKey ? (
      <button
        onClick={() => window.open('/api/uploads/' + round.reportFileKey, '_blank')}
        className="bg-surface-sunken border border-border-strong text-caption font-bold leading-none text-text-primary rounded-sm"
        style={{ height: 28, padding: '0 10px', cursor: 'pointer' }}
      >보고서</button>
    ) : (
      <button
        onClick={() => reportInputRef.current?.click()} disabled={uploadingReport}
        className="bg-surface-sunken border border-border-strong text-caption font-bold leading-none text-text-secondary rounded-sm"
        style={{ height: 28, padding: '0 10px', cursor: 'pointer', opacity: uploadingReport ? 0.6 : 1 }}
      >{uploadingReport ? '...' : '보고서 업로드'}</button>
    )}
  </div>
)}
```

**finding 카드 (line 187~211)** — bg `var(--bg3) → bg-surface-sunken` / border `selectedFindingId === id ? 'border-2 border-accent' : 'border border-border-default'` (OQ #3-selected 1.5 → 2) / borderLeft (OQ #2): `border-l-[3px] ${status === 'open' ? 'border-danger-bar' : 'border-safe-bar'}` / 칩 (OQ #2): open `bg-danger-bg text-danger '미조치'` / resolved `bg-safe-bg text-safe '완료'` + OQ #3 격상 (10 → text-caption leading-none) / 액션 '수정' / '삭제' verbatim.

**수정 모달 FindingFormSheet** — mount 그대로 (props 변경 X, line 217~225).

### 영역 3 — FindingDetailPanel (line 233~367, OQ #4 + OQ #5 적용)

- useQuery getFinding + resolveMutation verbatim 유지 (4 키 invalidate 동일)
- handleDownload (admin 다운로드 ZIP) verbatim 유지 (fflate + buildMetaTxt + 파일명 정규식)

**isLoading spinner (line 291) — Lucide Loader2 교체 (OQ #5)**:
```tsx
if (isLoading) return (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
    <Loader2 className="animate-spin text-accent" size={24} />
  </div>
)
// 인라인 div spinner + @keyframes spin 모두 제거
```

`!finding` 빈 — '항목을 불러오지 못했습니다.' verbatim.

**헤더 + admin 다운로드** — OQ #3 격상 (11 → text-caption leading-none):
```tsx
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
  <span className="text-body-sm font-bold text-text-primary">지적 상세</span>
  {staff?.role === 'admin' && (
    <button
      onClick={handleDownload} disabled={downloading}
      className="bg-surface-sunken border border-border-strong text-caption font-bold leading-none text-text-primary rounded-sm"
      style={{ height: 28, padding: '0 10px', cursor: downloading ? 'not-allowed' : 'pointer', opacity: downloading ? 0.5 : 1 }}
    >{downloading ? '...' : '다운로드'}</button>
  )}
</div>
```

**지적 정보 KVRow 4 + 지적 사진 PhotoGrid** verbatim.

**조치 입력 영역 (open finding)**:
- borderTop `var(--bd) → border-t border-border-default`
- textarea — `className="bg-surface-sunken border border-border-strong text-label text-text-primary rounded-md"` + 인라인 padding 유지 (rows={3} verbatim)
- 사진 슬롯 64x64 + ✕ 18x18 verbatim

**첨부 button — Lucide Camera 교체 (OQ #5)**:
```tsx
{resPhotos.canAdd && (
  <button
    onClick={resPhotos.openPicker}
    className="bg-surface-sunken text-text-tertiary rounded-sm"
    style={{ width: 64, height: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer', border: '1px dashed var(--border-strong)' }}
  >
    <Camera size={18} />
    <span className="text-caption leading-none font-bold">첨부</span>
  </button>
)}
```

**★ 조치 완료 button — 인라인 그라데이션 OQ #4 LOCKED ★**:
```tsx
<button
  onClick={() => { if (!memo.trim()) { toast.error('조치 내용을 입력하세요'); return }; resolveMutation.mutate() }}
  disabled={isSubmitting}
  className="text-text-on-accent text-label font-bold rounded-md"
  style={{
    marginTop: 12,
    width: '100%',
    height: 44,
    border: 'none',
    cursor: isSubmitting ? 'not-allowed' : 'pointer',
    opacity: isSubmitting ? 0.5 : 1,
    background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
  }}
>
  {isSubmitting ? '처리 중...' : '조치 완료'}
</button>
```

**조치 결과 영역 (resolved finding)** — KVRow 3 + PhotoGrid verbatim.

### 영역 4 — 메인 LegalPage (line 372~571)

- useNavigate / useIsDesktop / useSearchParams / state / useQuery legal-rounds / filtered verbatim 유지
- **handleRoundClick (line 394~401) isDesktop 분기 verbatim 유지** — 1 byte 변경 금지

**roundList JSX (line 404~461)**:
- 탭 (TABS 매핑) — 데스크톱 h 38 / 모바일 h 44, OQ #3 격상 (11 → text-caption leading-none)
- 연도 select — 데스크톱 padding '4px 8px' / 모바일 padding '6px 12px'
- 라운드 카드 데스크톱 (line 438~458) — selected `border-2 border-accent` (OQ #3-selected) + borderLeft accentColor (OQ #2 LOCKED 4분기 매핑) + 메타 verbatim ('건' 없음)
- 라운드 카드 모바일 (line 552~567) — borderLeft accentColor (OQ #2) + 메타 verbatim ('건' 있음 + endDate '~' 분기)

**데스크톱 3분할 (line 464~500)**:
- 외곽 — `bg-surface-page flex h-full` (var(--bg) 인라인 폐기)
- 인라인 `<style>{`@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }`}</style>` (line 467) 보존
- 좌측 — `w-[500px] flex-shrink-0 border-r border-border-default flex flex-col h-full` (1 byte 변경 금지)
- 중앙 — `w-[500px] flex-shrink-0 border-r border-border-default flex flex-col` + FindingsPanel mount + fallback '좌측에서 점검을 선택하세요' verbatim
- 우측 — `flex-1 flex flex-col` + FindingDetailPanel mount + fallback `selectedRoundId ? '중앙에서 지적사항을 선택하세요' : '점검을 먼저 선택하세요'` verbatim

**모바일 (line 503~570)**:
- 외곽 — `bg-surface-page flex flex-col h-full overflow-hidden`
- 인라인 `<style>{`@keyframes blink ...`}</style>` (line 505) 보존
- **모바일 자체 헤더 (line 507~515) — OQ #1 LOCKED + OQ #5 LOCKED**:
  ```tsx
  <div
    className="bg-surface-raised border-b border-border-default"
    style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}
  >
    <button
      onClick={() => navigate(-1)}
      aria-label="뒤로 가기"
      className="text-text-primary"
      style={{ position: 'absolute', left: 8, width: 44, height: 44, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <ChevronLeft size={20} />
    </button>
    <span className="text-body font-bold text-text-primary">소방 점검 관리</span>
  </div>
  ```
  (옛 inline SVG ChevronLeft path d="M15 19l-7-7 7-7" + 36x36 → 44x44 격상)
- 필터 영역 / 카드 영역 verbatim
- 빈/오류 카피 verbatim

---

## §4. OQ LOCKED 5건 반영 매핑 표

| OQ | 위치 | 변환 룰 | 검증 grep |
|---|---|---|---|
| #1 | 모바일 헤더 line 507~515 | `bg-surface-raised border-b border-border-default` + back button 44x44 | `bg-surface-raised border-b border-border-default` ≥1 |
| #2 | accentColor + ResultBadge + finding 칩/borderLeft (line 27~47, 187~200, 438~458, 552~567) | 4분기 status 토큰 매핑 (status- prefix 없음) | `border-(safe\|warning\|danger)-bar` 각 ≥1 / `bg-(safe\|warning\|danger)-bg text-(safe\|warning\|danger)` 각 ≥1 |
| #3 | ResultBadge + admin 도구 + 데스크톱 탭 + finding 칩 + 메타 + 첨부/수정/삭제 button | 11·10 → `text-caption font-bold leading-none` 격상 | `text-caption` + `leading-none` ≥10 |
| #4 | 조치 완료 button line 346 + admin 작은 도구 + 다시 시도 | 조치 완료 인라인 그라데이션 + 작은 도구 solid bg-accent + 빈/오류 아이콘 무 | `linear-gradient(135deg, #1d4ed8, #0ea5e9)` ≥1 / `bg-accent` ≥2 |
| #5 | 모바일 헤더 back button line 511 + 첨부 button line 340 + 로딩 spinner line 291 | Lucide ChevronLeft + Camera + Loader2 교체 + back 44x44 격상 | `import { ChevronLeft, Camera, Loader2 } from 'lucide-react'` ≥1 + `<ChevronLeft size={20}` ≥1 + `<Camera size={18}` ≥1 + `<Loader2` ≥1 + IconChevronLeft = 0 + '📷' = 0 |

---

## §5. Negative gate (TSX 변환 후 검증)

- 이모지 0건 (TSX 본문)
- `linear-gradient` — **FindingDetailPanel 조치 완료 button 인라인 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` ≥1 만 허용** (OQ #4 LOCKED 예외 anchor) / 다른 linear-gradient 0건
- 9·10·11px fontSize 0건 (OQ #3 LOCKED text-caption 12 leading-none 마지노선)
- `(text|bg|border)-status-` class prefix 0건 (OQ #2 LOCKED 위반 시 FAIL, memory `feedback_tailwind_token_class_pattern`)
- `\b(w|h)-8\b` 0건 (memory `feedback_tailwind_w8_h8_is_48px`)
- 옛 alias 토큰 — TSX 본문 안 인라인 style 안 단계적 제거, 변환 wave 마무리 시 0건 목표

---

## §6. Positive gate (TSX 변환 후 검증)

- 비즈 anchor 17건 모두 변경 없이 보존
- OQ LOCKED 5건 모두 verify grep PASS
- Tailwind utility class 패턴 (status- prefix 없음 + w-8/h-8 함정 회피) 준수
- LegalPage.tsx 단일 atomic commit + 다른 9 파일 변경 0 byte

---

## §7. Build / tsc

```bash
cd cha-bio-safety && npx tsc --noEmit   # PASS (0 errors)
cd cha-bio-safety && npm run build      # PASS
```

cbc7119-preview 자동 배포 후 모바일/데스크톱 시각 검수.

---

## §8. 자체 verify (변환 후 grep 모음)

```bash
# OQ #1
grep -c 'bg-surface-raised border-b border-border-default' cha-bio-safety/src/pages/LegalPage.tsx
# OQ #2
grep -cE 'border-(safe|warning|danger)-bar' cha-bio-safety/src/pages/LegalPage.tsx
grep -cE 'bg-(safe|warning|danger)-bg text-(safe|warning|danger)' cha-bio-safety/src/pages/LegalPage.tsx
# OQ #3
grep -c 'text-caption' cha-bio-safety/src/pages/LegalPage.tsx
grep -c 'leading-none' cha-bio-safety/src/pages/LegalPage.tsx
# OQ #4
grep -c 'linear-gradient(135deg, #1d4ed8, #0ea5e9)' cha-bio-safety/src/pages/LegalPage.tsx
grep -c 'bg-accent' cha-bio-safety/src/pages/LegalPage.tsx
# OQ #5
grep -c "import { ChevronLeft, Camera, Loader2 } from 'lucide-react'" cha-bio-safety/src/pages/LegalPage.tsx
grep -c '<ChevronLeft size={20}' cha-bio-safety/src/pages/LegalPage.tsx
grep -c '<Camera size={18}' cha-bio-safety/src/pages/LegalPage.tsx
grep -c '<Loader2' cha-bio-safety/src/pages/LegalPage.tsx
grep -c '📷' cha-bio-safety/src/pages/LegalPage.tsx   # 0 기대 (이모지 제거)
grep -c 'IconChevronLeft' cha-bio-safety/src/pages/LegalPage.tsx  # 0 기대 (해당 없음)
# 비즈 anchor
grep -cE 'legal-rounds|legal-round|legal-findings|legal-finding' cha-bio-safety/src/pages/LegalPage.tsx  # ≥4
grep -cE 'legalApi\.(list|get|getFindings|updateResult|deleteFinding|getFinding|resolveFinding)' cha-bio-safety/src/pages/LegalPage.tsx  # ≥7
# negative
grep -cE '(text|bg|border)-status-' cha-bio-safety/src/pages/LegalPage.tsx  # 0
grep -cE '\b(w|h)-8\b' cha-bio-safety/src/pages/LegalPage.tsx  # 0
```

---

## §9. Tailwind cheatsheet (v0.1.1 토큰 → utility class 매핑, 19-legal 적용)

| v0.1.1 토큰 | Tailwind utility | 19-legal 적용 위치 |
|---|---|---|
| `--surface-page` | `bg-surface-page` | LegalPage 외곽 (line 466 데스크톱 / 504 모바일) |
| `--surface-raised` | `bg-surface-raised` | 모바일 헤더 (line 508, OQ #1) |
| `--surface-sunken` | `bg-surface-sunken` | 카드 (line 443 데스크톱 / 554 모바일) + SKELETON (line 50) + admin select / 보고서 / 다운로드 / textarea / 첨부 button |
| `--surface-active` | `bg-surface-active` | 탭 활성 (line 411 / 522) |
| `--border-default` | `border-border-default` | 모바일 헤더 borderBottom + 카드 평시 + 데스크톱 분할 borderRight + 조치 borderTop |
| `--border-strong` | `border-border-strong` | input/select border + admin 도구 button border + 첨부 button border-dashed + null accentColor |
| `--text-primary` | `text-text-primary` | 이름 + 모바일 타이틀 + 카드 title + 빈 제목 + KVRow children + finding description |
| `--text-secondary` | `text-text-secondary` | 카드 메타 + 모바일 빈 보조 + back button + 모바일 오류 + 데스크톱 좌측 오류 |
| `--text-tertiary` | `text-text-tertiary` | 데스크톱 fallback + 데스크톱 좌측 빈 + FindingsPanel 빈 + FindingDetailPanel 빈 + KVRow 라벨 + 섹션 라벨 + null ResultBadge + 첨부 color |
| `--danger` | `text-danger` | finding 칩 open / ResultBadge fail / 오류 카피 |
| `--safe` + rgba(34,197,94,.13) | `bg-safe-bg text-safe` / `border-safe-bar` | ResultBadge pass / accentColor pass / finding 칩 resolved (OQ #2) |
| `--warn` + rgba(245,158,11,.15) | `bg-warning-bg text-warning` / `border-warning-bar` | ResultBadge conditional / accentColor conditional (OQ #2) |
| `--danger` + rgba(239,68,68,.15) | `bg-danger-bg text-danger` / `border-danger-bar` | ResultBadge fail / accentColor fail / finding 칩 open / finding borderLeft open (OQ #2) |
| `--bd2` (null accent) | `border-border-strong` (border-l-[3px]) | accentColor null |
| `--accent` (acl) | `border-accent` (border-2) | selected card border (line 192, 444, OQ #3-selected, 데스크톱만) |
| `--accent` (CTA) | `bg-accent` solid 또는 인라인 그라데이션 | admin 도구 solid (line 170) / 조치 완료 CTA 인라인 (line 346, OQ #4 LOCKED 예외) |
| (radius 6) | `rounded-sm` | admin 도구 button + finding 칩 + ResultBadge |
| (radius 8) | `rounded-sm` | 사진 슬롯 + 첨부 button + 모바일 다시 시도 button |
| (radius 9) | `rounded-md` 또는 `rounded-[9px]` arbitrary | 조치 textarea |
| (radius 10) | `rounded-md` | 라운드 카드 데스크톱 + finding 카드 + 조치 완료 button |
| (radius 12) | `rounded-md` | SKELETON + 라운드 카드 모바일 |

---

## §10. 비즈 보존 체크박스 (17건)

- [ ] useQuery × 4 queryKey 정확히 일치 + 4 키 invalidate 정확
- [ ] useMutation resolveMutation — uploadAll + legalApi.resolveFinding(snake_case)
- [ ] legalApi 7종 시그니처 + snake_case payload + camelCase props 혼용 보존
- [ ] accentColor 4분기 (pass/fail/conditional/null) 1 byte 변경 0
- [ ] ResultBadge map 4 라벨 verbatim ('적합' / '부적합' / '조건부적합' / '결과 미입력')
- [ ] filterRounds 3분기 (미조치 / 완료 / 전체) 운영 룰
- [ ] TABS key/label mismatch ('미조치' key → '진행 중' label) 의도된 디자인
- [ ] sorted findings open-first + createdAt desc localeCompare
- [ ] handleRoundClick isDesktop 분기 (데스크톱 selectedRoundId + 모바일 navigate sub-route)
- [ ] role admin 도구 분기 (FindingsPanel role === 'admin' + FindingDetailPanel staff?.role === 'admin')
- [ ] useMultiPhotoUpload 5장 제한 (canAdd = slots.length < 5)
- [ ] buildMetaTxt + fflate ZIP + 파일명 패턴 (지적사항_{location}.zip / 지적사진-{N}.jpg / 조치사진-{N}.jpg)
- [ ] @keyframes blink (.6/.3, Education .4 와 다름) + spin (OQ #5 Loader2 교체 후 spin 제거)
- [ ] toast 카피 11종 verbatim (success 5 / error 6)
- [ ] 빈/오류/fallback 카피 다수 verbatim (모바일 + 데스크톱 + FindingsPanel + FindingDetailPanel)
- [ ] 데스크톱 3분할 width 500/500/flex 1 + borderRight 1px
- [ ] 모바일 자체 헤더 h 48 + 타이틀 '소방 점검 관리' verbatim

---

## §11. 메모리 룰 inline (12+ rule citations)

- `feedback_inspection_unresolved_color` — accentColor + ResultBadge + finding 칩 결과 status 토큰 일반화 (OQ #2 LOCKED 핵심)
- `project_inspection_completion_rule` — role admin 도구 분기 + filterRounds + sorted open-first + handleRoundClick isDesktop 분기 source of truth 일반화
- `feedback_tailwind_token_class_pattern` — status- prefix 없음 + lucide `<Icon size={N} />` prop
- `feedback_tailwind_w8_h8_is_48px` — w-8/h-8 = 48px 함정 (back button 44x44 = `w-11 h-11` 또는 `w-[44px] h-[44px]`)
- `feedback_text_caption_leading_none` — 작은 컨테이너 안 text-caption(12) leading-none 명시
- `feedback_sketch_realistic_data` — 표시 분기/라벨 룰 코드 그대로
- `feedback_design_changes_ask_first` — 디자인 변경 전 사용자 컨펌
- `feedback_planner_prompt_sketch_verbatim` — sketch CSS verbatim 인용 (추측 토큰명 금지)
- `feedback_tsx_wave_emoji_dot_gap` — sketch 의 이모지 0건 negative gate ('📷' 이모지 사고 케이스 OQ #5 Camera 교체)
- `feedback_tsx_wave_stat_card_drift` — source outline 패턴 보존 + sketch 새 패턴 누락 방지
- `feedback_subagent_production_deploy_forbidden` — wrangler 명령 절대 X (디자인 wave)
- `feedback_redesign_sketch_rule_enforcement` — §6.2 negative rule (단 결과 status 토큰은 룰 11 예외) + §6.3/§7.1 일관성 강제

---

## §12. 다음 단계 (TSX 변환 wave 진입)

- 본 checklist 가 W6 변환 wave 의 단일 진입점
- W6 = LegalPage.tsx 571 lines 단일 atomic 변환 (4 영역 통합)
- 변환 후 cbc7119-preview 자동 배포 → 사용자 모바일/데스크톱 시각 검수
- 통과 시 main 머지 + cbc7119-preview 재배포 → status 박제 (memory `project_redesign_19_legal_status` 신규)
- sub-route 페이지 (LegalFindingsPage + LegalFindingDetailPage) 는 별도 wave 진행
- 본 PLAN (260523-40p) 의 **src 10 파일 모두 0 byte 변경** verify 통과 후 commit (final verify gate 본 task 의 마지막 단계)

---

### ★ 본 PLAN 최종 verify gate (4 commit 누적 diff)

```bash
# 본 PLAN 의 4 commit 누적 diff 에서 src 10 파일 모두 등장하면 안 됨 (empty 가 PASS)
git diff --name-only HEAD~4 HEAD -- \
  cha-bio-safety/src/pages/LegalPage.tsx \
  cha-bio-safety/src/App.tsx \
  cha-bio-safety/src/utils/api.ts \
  cha-bio-safety/src/utils/findingDownload.ts \
  cha-bio-safety/src/hooks/useMultiPhotoUpload.ts \
  cha-bio-safety/src/components/PhotoGrid.tsx \
  cha-bio-safety/src/components/PhotoSourceModal.tsx \
  cha-bio-safety/src/components/FindingFormSheet.tsx \
  cha-bio-safety/src/pages/LegalFindingsPage.tsx \
  cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
```

empty (no output) = PASS / 어떤 결과라도 나오면 FAIL.
