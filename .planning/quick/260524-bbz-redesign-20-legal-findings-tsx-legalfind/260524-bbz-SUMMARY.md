---
phase: 260524-bbz
plan: 01
type: execute
wave: 1
status: complete
branch: redesign/20-legal-findings
commit: 73eae9f
completed: 2026-05-22
duration: ~12분
files_changed:
  - cha-bio-safety/src/pages/LegalFindingsPage.tsx (378 → 407 lines, +90/-61)
files_unchanged_verified:
  - cha-bio-safety/src/App.tsx
  - cha-bio-safety/src/components/PhotoGrid.tsx
  - cha-bio-safety/src/components/PhotoSourceModal.tsx
  - cha-bio-safety/src/components/FindingFormSheet.tsx
  - cha-bio-safety/src/hooks/useMultiPhotoUpload.ts
  - cha-bio-safety/src/utils/findingDownload.ts
  - cha-bio-safety/src/utils/api.ts
  - cha-bio-safety/src/stores/authStore.ts
  - cha-bio-safety/src/pages/LegalPage.tsx
  - cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
  - cha-bio-safety/tailwind.config.js
tags:
  - redesign
  - 20-legal-findings
  - tsx-conversion
  - v0.1.x
  - quick
  - single-file-atomic
  - lucide-chevron-left
  - lucide-loader2
  - back-button-44x44
  - border-l-2-2px
  - status-token
---

# Phase 260524-bbz Plan 01: redesign/20-legal-findings TSX 변환 Summary

**One-liner:** LegalFindingsPage.tsx 378 lines 단일 atomic in-place TSX 변환 — v0.1.x 토큰 className 적용 + Lucide ChevronLeft/Loader2 교체 + back button 44x44 격상 + OQ LOCKED 5건 + 비즈 anchor 11건 1 byte 변경 0 + W5 §1 매핑 verbatim.

## 1. 라인 수 변환 결과

| 단계 | 라인 수 | diff |
|---|---|---|
| Before (HEAD~) | 378 | baseline |
| After (HEAD) | **407** | +29 (+90 insertions / -61 deletions) |
| 예상 범위 | 350~410 | ✓ 범위 내 |

라인 수 변동 사유:
- Lucide 2종 import 1줄 추가
- Spinner 함수 (8줄, line 32~39) 폐기 + isLoading 분기에 Loader2 직접 mount (5줄) → 순 -3줄
- adminBar 인라인 style → className 분리로 줄당 길이 단축 + multi-line button JSX 전개 (+15줄)
- findingCard 인라인 style → className 분리로 multi-line 전개 (+10줄)
- 모바일 헤더 / 모바일 고정 하단 CTA className+style 분리 (+5줄)
- addButton className 추가 (+2줄)

## 2. OQ LOCKED 5건 결정 적용 결과

| OQ | 결정 (LOCKED) | 적용 위치 (변환 후 line) | grep 결과 | PASS |
|---|---|---|---|---|
| OQ #1 | 모바일 자체 헤더 `bg-surface-raised border-b border-border-default` | 308, 391 (adminBar + 모바일 헤더 + 모바일 하단 CTA borderTop) | 2건 hit | ✓ |
| OQ #2 ★ | finding 카드 `border-l-2` (**2px**, 19-legal 3px 와 다름) + status 칩 `bg-{safe\|danger}-bg text-{safe\|danger}` (status- prefix 없음) | 254 카드 + 264 칩 | border-l-2 1 / border-safe-bar 1 / border-danger-bar 1 / bg-safe-bg text-safe 1 / bg-danger-bg text-danger 1 | ✓ |
| OQ #3 | 9·10·11 fontSize 인라인 0 → `text-caption font-bold leading-none` 12 격상 | 222, 226, 234, 240, 254, 264, 267, 275, 277 등 | text-caption 10건 / leading-none 9건 / fontSize 9·10·11 인라인 0건 | ✓ (≥5 요구) |
| OQ #4 ★ | addButton (메인 CTA) 인라인 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` ≥1 + admin 작은 도구 `bg-accent` solid + 빈/오류 카피 verbatim + 아이콘 X | 296 addButton 인라인 그라데이션 + 222 결과 저장 bg-accent + 보고서/ZIP `bg-surface-sunken border-border-strong` solid | linear-gradient anchor 1 / bg-accent 1 | ✓ |
| OQ #5 ★ | Lucide ChevronLeft size={20} (back) + Loader2 animate-spin (isLoading) + back 36x36 → **44x44** 격상 + Spinner 함수 + @keyframes spin 완전 폐기 | 5 import / 311 ChevronLeft / 347 Loader2 / 310 width:44 height:44 | import 1 / `<ChevronLeft` 1 / `<Loader2` 1 / back 44x44 1 / function Spinner 0 / @keyframes spin 0 / 인라인 SVG path 0 / IconChevronLeft 0 / polyline 0 | ✓ |

**OQ 위반 0건 확인.**

## 3. ★ 비즈 anchor 11건 보존 grep 결과

| # | anchor | grep | 결과 | PASS |
|---|---|---|---|---|
| 1 | legalApi 4종 (`get` / `getFindings` / `updateResult` / `deleteFinding`) | `legalApi\.(getFindings\|get\|deleteFinding\|updateResult)` | 5건 hit | ✓ |
| 2 | useQuery × 2 (`['legal-round', id]` + `['legal-findings', id]`) | `queryKey:\s*\['legal-(round\|findings)'` | 6건 hit (queryKey 2 + invalidateQueries 4) | ✓ |
| 3 | invalidateQueries 3 키 (`legal-round` / `legal-rounds` / `legal-findings`) | `invalidateQueries.*\['legal-(findings\|round\|rounds)'` | 6건 hit | ✓ |
| 4 | headerTitle 동적 분기 (`종합정밀` / `작동기능`) | `round.title.includes('종합정밀')` exact | 1건 hit (line 113) | ✓ |
| 5 | sortedFindings open-first | `a\.status === 'open' && b\.status !== 'open'` exact | 1건 hit (line 193) | ✓ |
| 6 | adminBar `role === 'admin' && round` 조건부 | `role === 'admin' && round` exact | 1건 hit (line 203) | ✓ |
| 7 | findingCard navigate 자식 진입 `/legal/:id/finding/:fid` | `navigate(\`/legal/${id}/finding/${finding.id}\`)` exact | 1건 hit (line 254) | ✓ |
| 8 | handleZipDownload iOS PWA `<a download>` + `setTimeout 3000` + ZIP 파일명 | `setTimeout.*URL\.revokeObjectURL.*3000` + `지적사항_${round?.title ?? 'report'}.zip` | 각 1건 hit (line 173, 177) | ✓ |
| 9 | toast 카피 8종 verbatim (success 4 + error 4) | `toast\.(success\|error)` | 8건 hit | ✓ (≥4 요구) |
| 10 ★ | finding borderLeft **2px** (★ 19-legal lft `border-l-[3px]` 와 다름) | `border-l-2` | 1건 hit (line 251) | ✓ |
| 11 | `@keyframes blink` (.6 / .3 — Education 1/0.4 와 다름, 19-legal 일치) | `@keyframes blink` | 1건 hit (line 304) | ✓ |

**비즈 anchor 11건 1 byte 변경 0 — 모두 보존.**

## 4. ★ border-l-2 = 2px anchor 박제 (19-legal 3px 와 다름)

- **본 페이지** (`LegalFindingsPage.tsx` line 251): `border-l-2` = Tailwind 기본 **2px**
- **19-legal lft 비교** (`LegalPage.tsx` line 195 / 446 / 554): `border-l-[3px]` = arbitrary value **3px**

W1 §1.4 19-legal 차이 5건 anchor 1. 19-legal lft 패턴 mirror 시 `border-l-[3px]` 복사 안 됨 (정확히 본 페이지 고유 2px 유지). **OQ #2 LOCKED 명시.**

## 5. App.tsx + 외부 10 파일 0 byte 변경 verify

```
$ git diff --name-only HEAD~ HEAD -- cha-bio-safety/src/App.tsx \
    cha-bio-safety/src/components/PhotoGrid.tsx \
    cha-bio-safety/src/components/PhotoSourceModal.tsx \
    cha-bio-safety/src/components/FindingFormSheet.tsx \
    cha-bio-safety/src/hooks/useMultiPhotoUpload.ts \
    cha-bio-safety/src/utils/findingDownload.ts \
    cha-bio-safety/src/utils/api.ts \
    cha-bio-safety/src/stores/authStore.ts \
    cha-bio-safety/src/pages/LegalPage.tsx \
    cha-bio-safety/src/pages/LegalFindingDetailPage.tsx \
    cha-bio-safety/tailwind.config.js
(empty)
```

**모두 0 byte 변경 — final verify gate PASS.**

## 6. Build gate 결과

| 단계 | 결과 |
|---|---|
| `npx tsc --noEmit` | **PASS** (0 errors, 0 warnings) |
| `npm run build` | **PASS** (15.26s, exit 0) |
| LegalFindingsPage chunk | **10.71 kB / gzip 4.03 kB** (`dist/assets/LegalFindingsPage-D2fUUhqw.js`) |
| 참고: LegalPage (19-legal, 부모) chunk | 21.87 kB / gzip 5.85 kB |
| 참고: LegalFindingDetailPage (자식, 별도 wave 대기) chunk | 10.11 kB / gzip 3.53 kB |

## 7. Negative + Positive + W5 §8 grep gate 종합

### Negative gate (10건)

| # | gate | 결과 | PASS |
|---|---|---|---|
| 1 | 이모지 (1F300-1FAFF + 2600-26FF) | 0건 | ✓ |
| 2 | `linear-gradient` 총 카운트 = OQ #4 anchor 카운트 | 1 = 1 | ✓ |
| 3 | fontSize 9·10·11 인라인 | 0건 | ✓ |
| 4 | `(text\|bg\|border)-status-` prefix | 0건 | ✓ |
| 5 | `w-8` / `h-8` (=48px 함정) | 0건 | ✓ |
| 6 | 옛 alias `var(--bg\|bg2\|bg3\|bg4\|bd\|bd2\|t1\|t2\|t3\|acl\|safe\|warn\|danger)` | 0건 | ✓ |
| 7 | 인라인 SVG ChevronLeft path `M15 19l-7-7 7-7` | 0건 | ✓ |
| 8 | `function Spinner` / `const Spinner` 정의 | 0건 | ✓ |
| 9 | `@keyframes spin` | 0건 | ✓ |
| 10 | `IconChevronLeft` / `polyline` | 0건 | ✓ |

### Positive gate (10건)

| # | gate | 결과 | PASS |
|---|---|---|---|
| 1 | OQ #1 모바일 헤더 `bg-surface-raised border-b border-border-default` | 2건 (헤더 + adminBar) | ✓ |
| 2 | OQ #2 `border-l-2` + `border-safe-bar` + `border-danger-bar` + 칩 토큰 | 모두 ≥1 | ✓ |
| 3 | OQ #3 `text-caption` ≥5 + `leading-none` ≥5 | 10 / 9 | ✓ |
| 4 | OQ #4 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` + `bg-accent` 각 ≥1 | 1 / 1 | ✓ |
| 5 | OQ #5 Lucide import + `<ChevronLeft` + `<Loader2` + back 44x44 | 모두 1 | ✓ |

### W5 §8 self-verify grep (12건)

모두 PASS — 위 §3 비즈 anchor + OQ 항목과 동일 grep 패턴.

## 8. 변환 패턴 요약

### 옛 alias → v0.1.x 토큰 매핑

| 옛 (인라인) | 변환 후 (Tailwind class) | 적용 영역 |
|---|---|---|
| `background: 'var(--bg)'` | `bg-surface-page` | 외곽 div + 모바일 하단 CTA |
| `background: 'rgba(22,27,34,0.97)'` | `bg-surface-raised` | 모바일 헤더 (OQ #1) |
| `background: 'var(--bg2)'` | `bg-surface-raised` | adminBar 외곽 (OQ #1) |
| `background: 'var(--bg3)'` | `bg-surface-sunken` | finding 카드 + select + 보고서/ZIP button + SKELETON |
| `borderBottom: '1px solid var(--bd)'` | `border-b border-border-default` | 모바일 헤더 + adminBar |
| `borderTop: '1px solid var(--bd)'` | `border-t border-border-default` | 모바일 하단 CTA |
| `border: '1px solid var(--bd)'` | `border border-border-default` | finding 카드 평시 |
| `border: '1px solid var(--bd2)'` | `border border-border-strong` | select + 보고서/ZIP button |
| `borderLeft: '2px solid var(--danger\|safe)'` | `border-l-2 border-{danger\|safe}-bar` | finding 카드 (★ 2px OQ #2) |
| `color: 'var(--t1)'` | `text-text-primary` | 헤더 타이틀 + select 글자 + finding description + 빈 제목 |
| `color: 'var(--t2)'` | `text-text-secondary` | finding 위치 + 부제 + 오류 카피 + 빈 보조 + 보고서 업로드 글자 |
| `color: 'var(--t3)'` | `text-text-tertiary` | finding 메타 + 수정/삭제 액션 |
| `color: 'var(--danger)'` + `background: 'rgba(239,68,68,.15)'` | `text-danger bg-danger-bg` | finding 칩 open (OQ #2) |
| `color: 'var(--safe)'` + `background: 'rgba(34,197,94,.13)'` | `text-safe bg-safe-bg` | finding 칩 resolved (OQ #2) |
| `background: 'var(--acl)'` | `bg-accent text-text-on-accent` (작은 도구 solid) OR 인라인 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` (CTA, OQ #4) | 결과 저장 button (solid) + addButton (CTA gradient) |
| `fontSize: 10/11` + `fontWeight: 700` | `text-caption font-bold leading-none` (12 격상) | finding 칩 + 메타 + admin 도구 (OQ #3) |
| `fontSize: 12` (위치) | `text-caption leading-none text-text-secondary` | finding 위치 |
| `fontSize: 13` (select) | `text-label` | adminBar select |
| `fontSize: 14` (description) | `text-body-sm text-text-primary` | finding description |
| `fontSize: 16, fontWeight: 700` (헤더 타이틀) | `text-body font-bold text-text-primary` | 모바일 헤더 타이틀 |
| `borderRadius: 8` (select / button) | `rounded-sm` | adminBar 도구 일괄 |
| `borderRadius: 6` (칩) | `rounded-sm` | finding 칩 |
| `borderRadius: 12` (카드 / SKELETON / 모바일 addButton) | `rounded-md` | finding 카드 + SKELETON + 모바일 addButton |

### Lucide 2종 교체

- **ChevronLeft** — 인라인 SVG `<svg ...><path d="M15 19l-7-7 7-7" /></svg>` (line 304) → `<ChevronLeft size={20} />` + back button 36x36 → 44x44 (`width: 44, height: 44` 인라인 — w-8=48 함정 회피로 w-11 대신 인라인 선택)
- **Loader2** — `function Spinner()` (line 32~39, 8줄) + `@keyframes spin` 완전 폐기 → isLoading 분기에 `<Loader2 className="animate-spin text-accent" size={28} />` 직접 mount

## 9. 인라인 보존 (의도)

| 인라인 잔존 | 사유 |
|---|---|
| `var(--sab, 0px)` (line 363 + 387) | iOS PWA safe-area-bottom CSS variable — Tailwind utility 없음, 의도 보존 |
| addButton `background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)'` | OQ #4 LOCKED 예외 anchor (CTA 그라데이션) |
| `@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }` | ★ 비즈 anchor 11 (19-legal 일치, Education 1/0.4 와 다름) |
| `fontSize: 22, fontWeight: 800` (데스크톱 headerTitle, line 333) | Tailwind config 에 fontWeight: 800 매핑 없음 — 800 명시 위해 인라인 보존 (text-headline 은 600) |
| 카드 padding `isDesktop ? 16 : 12` / `isDesktop ? 24 : 12` 등 | semantic spacing — 분기 인라인 유지 (`p-card` 등 추후 wave) |

## 10. 다음 단계

1. **푸시**: `git push origin redesign/20-legal-findings`
2. **main 머지** (사용자 컨펌 후): `git checkout main && git merge --no-ff redesign/20-legal-findings`
3. **cbc7119-preview 자동 배포**: main push 시 GitHub Actions 자동 트리거 → 5분 내 cbc7119-preview.pages.dev 반영
4. **사용자 시각 검수**: 모바일 헤더 / finding 카드 (open/resolved 2분기 색) / addButton 그라데이션 / Loader2 spinner / back button 44x44 터치 안정성 / admin 도구바 (admin 계정 로그인 시)
5. **자식 페이지 별도 wave**: `LegalFindingDetailPage.tsx` (App.tsx line 291, `/legal/:id/finding/:fid`) — findingCard onClick 진입 페이지. sketch + TSX 변환 별도 quick task 권장.
6. **부모 페이지 19-legal 완결 확인**: 이미 redesign/19-legal main 머지 완료 (memory `project_redesign_19_legal_status` 참조 — 본 메모리 슬롯은 아직 없음, 후속 박제 후보).

★ **직원 도메인 `cbc7119.pages.dev` 절대 X** (CLAUDE.local.md + memory `feedback_cbc7119_design_never_wrangler`).
★ **wrangler / npm run deploy 명령 0건** (디자인 워크트리 강제, 본 wave 도 0건 유지).

## 11. 메모리 박제 후보

1. **`project_redesign_20_legal_findings_status.md`** (신규) — W1 ~ W5 sketch + W6 TSX 변환 완결 status (commit 73eae9f). 단일 atomic 7번째 도달 (r22 / lft / 1hj / gox / u5n / cd01e96 / 본 wave).
2. **`feedback_border_l_2_vs_3px_per_page.md`** (신규 후보) — 19-legal lft `border-l-[3px]` + 20-legal-findings bbz `border-l-2` (2px) 차이 박제. 페이지별 finding/round 카드 borderLeft 두께 분리 룰. mirror wave 시 무조건 복사 금지.
3. **`feedback_tsx_wave_spinner_to_loader2_replacement.md`** (신규 후보) — 옛 `function Spinner() { ... @keyframes spin }` 패턴 → Lucide `<Loader2 className="animate-spin" size={N} />` 직접 사용 + @keyframes spin 완전 폐기. (a) Spinner 함수 정의 0 / (b) @keyframes spin 0 / (c) 호출처 size 별 16/20/24/28 적절 선택.
4. **`feedback_tsx_wave_back_button_44x44.md`** (신규 후보) — 모바일 헤더 back button 36x36 → 44x44 격상 (iOS HIG 44pt 터치 타겟 / Material Design 48dp). w-11 OR 인라인 `width:44 height:44` 선택. `w-8` (=48px 함정, project spacing override) 사용 0건.

## Self-Check: PASSED

- FOUND: `cha-bio-safety/src/pages/LegalFindingsPage.tsx` (407 lines)
- FOUND: `.planning/quick/260524-bbz-redesign-20-legal-findings-tsx-legalfind/260524-bbz-SUMMARY.md`
- FOUND: `.planning/quick/260524-bbz-redesign-20-legal-findings-tsx-legalfind/260524-bbz-PLAN.md`
- FOUND: commit `73eae9f` (TSX 변환 atomic) on `redesign/20-legal-findings`
- FOUND: parent commit `11831c6` (PLAN pre-dispatch)
- 외부 11 파일 (App.tsx + 외부 10 파일) git diff HEAD~ HEAD 빈 출력 = 0 byte 변경 확인
- tsc + npm run build 모두 exit 0
