---
phase: 260525-6if
plan: 01
subsystem: redesign/21-legal-finding-detail
tags:
  - redesign
  - 21-legal-finding-detail
  - tsx-conversion
  - v0.1.x
  - quick
  - single-file-atomic
  - lucide-chevron-left
  - lucide-loader2
  - lucide-download
  - lucide-camera
  - back-button-44x44
  - admin-button-44x44
  - spinner-discarded
  - cta-gradient-anchor
  - location-based-zip
  - multi-photo-upload-direct
  - staff-selector-pattern
dependency_graph:
  requires:
    - .planning/quick/260525-4of-redesign-21-legal-finding-detail/260525-4of-SUMMARY.md (W2~W5 sketch+checklist 통합)
    - cha-bio-safety/docs/redesign-context/21-legal-finding-detail/wave-5-tsx-conversion-checklist.md (SOURCE OF TRUTH)
    - cha-bio-safety/docs/redesign-context/21-legal-finding-detail/wave-1-index.md (OQ LOCKED 5건)
    - cha-bio-safety/src/styles/tokens.css (v0.1.x 토큰)
    - cha-bio-safety/tailwind.config.js (utility class)
  provides:
    - cha-bio-safety/src/pages/LegalFindingDetailPage.tsx (v0.1.x 토큰 className, Lucide 4종, OQ LOCKED 5건, 비즈 anchor 11 보존)
  affects:
    - cbc7119-preview.pages.dev (main 머지 시 GitHub Actions 자동 배포)
tech-stack:
  added: []
  patterns:
    - "Lucide 4종 (ChevronLeft 20 + Download 18 + Loader2 24 + Camera 22) 단일 import"
    - "Spinner 함수 폐기 + @keyframes spin 2건 폐기 → Loader2 animate-spin 직접 사용"
    - "back button + admin 다운로드 button 양쪽 44x44 격상 (inline width:44 height:44, w-8 함정 회피)"
    - "CTA 그라데이션 ≥2 박제 (데스크톱 inline + 모바일 고정 양쪽, lft 1건 + bbz 1건 mirror)"
    - "ZIP 파일명 location 기반 (지적사항_${finding.location}.zip, 19/20/21 차이 4)"
    - "useMultiPhotoUpload 직접 호출 (19/20/21 차이 2, FindingFormSheet 우회 X)"
    - "staff selector 패턴 (s => s.staff, 20-legal-findings getState() 와 다름)"
    - "단일 파일 atomic 8번째 도달 (r22/lft/bbz/1hj/gox/u5n/4i9/6if)"
key-files:
  created:
    - .planning/quick/260525-6if-redesign-21-legal-finding-detail-tsx-leg/260525-6if-SUMMARY.md
  modified:
    - cha-bio-safety/src/pages/LegalFindingDetailPage.tsx (279 → 327 lines)
decisions:
  - "단일 파일 atomic in-place 수정 (LegalFindingDetailPage.tsx) — 외 9 src 파일 + tailwind.config.js 0 byte 변경 = final verify gate PASS"
  - "OQ #1 LOCKED — 모바일 자체 헤더 bg-surface-raised border-b border-border-default + 타이틀 정적 '지적 상세' + back/admin 44x44 격상"
  - "OQ #2 LOCKED — finding 상태 칩 본 페이지 없음 + 화면 모드 mutually exclusive (open Section 3 / resolved Section 4) + KVRow value 좌측 강조 없음 + status- prefix 0"
  - "OQ #3 LOCKED — 9·10·11 fontSize → text-caption 12 leading-none 격상 (슬롯 제거 11 + 업로드 중 10 + 사진 첨부 11 + KVRow label + SectionHeader + 조치 사진 라벨 모두 격상)"
  - "OQ #4 LOCKED — 조치 완료 CTA 인라인 그라데이션 linear-gradient(135deg, #1d4ed8, #0ea5e9) ≥2 박제 (데스크톱 inline line 244~248 + 모바일 고정 line 270~275 양쪽) + admin 다운로드 button = 작은 도구 solid (모바일 ghost + 데스크톱 bg-surface-sunken) 유지, CTA only 패턴 (lft/bbz 일관)"
  - "OQ #5 LOCKED — Lucide 4종 (ChevronLeft 20 + Download 18 + Loader2 24 + Camera 22) + Spinner 함수 line 41~48 폐기 + @keyframes spin 2건 폐기 + 인라인 SVG path 2종 폐기 + 이모지 '📷' 폐기 + back/admin 44x44 격상"
  - "비즈 anchor 11건 1 byte 변경 0 (legalApi 2종 + useQuery 1 + useMutation 1 + invalidateQueries 4 키 + useMultiPhotoUpload 직접 + handleResolve memo.trim + handleDownload fflate + iOS PWA + ZIP location 기반 + status open/resolved 분기 + staff selector + toast 5 + 카피 verbatim)"
  - "44x44 격상 패턴 — w-11 utility 없음 (tailwind.config spacing) → inline width:44 height:44 채택 (LegalFindingsPage bbz precedent mirror)"
metrics:
  duration: "~12 minutes (단일 turn, single file Write + verify + commit)"
  completed: "2026-05-25"
---

# Phase 260525-6if Plan 01: redesign/21-legal-finding-detail TSX 변환 Summary

LegalFindingDetailPage.tsx (279 lines) 를 v0.1.x 토큰 className 으로 단일 atomic 변환 — Lucide 4종 교체 + Spinner 폐기 + back/admin 44x44 격상 + CTA 그라데이션 ≥2 박제 + OQ LOCKED 5건 + 비즈 anchor 11건 보존, 모든 verify gate PASS.

## 변환 전후

| 항목 | 값 |
|---|---|
| 변환 전 라인 수 | 279 |
| 변환 후 라인 수 | 327 (+48, JSX 멀티라인 포맷팅 영향) |
| 단일 atomic commit hash | `d13ab58` |
| 외부 파일 변경 | 0 (LegalFindingDetailPage.tsx 만) |
| Build chunk size | `LegalFindingDetailPage-Du3yaXdX.js` 9,847 bytes |
| TSX 변환 wave (W6 → 6if) | **단일 atomic 8번째 도달** (r22/lft/bbz/1hj/gox/u5n/4i9/6if) |

## OQ LOCKED 5건 적용 + 위반 0건 확인

### OQ #1 LOCKED — 모바일 자체 헤더 raised + border-b + 타이틀 정적 + back/admin 44x44
- 모바일 헤더 (line 137): `className="bg-surface-raised border-b border-border-default flex items-center justify-center relative flex-shrink-0"` + 인라인 `height:48` ✅
- 옛 인라인 `background:'rgba(22,27,34,0.97)', borderBottom:'1px solid var(--bd)'` 완전 폐기 ✅
- 타이틀 '지적 상세' 정적 (line 148): className `text-body font-bold text-text-primary` (verbatim, 20-legal-findings 동적 분기와 다름) ✅
- back button 44x44 (line 145): `width:44, height:44` inline ✅
- admin 다운로드 button 44x44 (line 154): `width:44, height:44` inline ✅
- grep: `bg-surface-raised border-b border-border-default` ≥1 PASS, `'지적 상세'` ≥2 (모바일 + 데스크톱) PASS

### OQ #2 LOCKED — finding 상태 칩 없음 + 화면 모드 mutually exclusive + KVRow value 좌측 강조 없음 + status- prefix 0
- 본 페이지에 finding 상태 칩 자체 없음 (20-legal-findings border-l-2 + 칩 패턴 X) ✅
- `finding.status === 'open'` Section 3 form (line 226) ✅
- `finding.status === 'resolved'` Section 4 결과 (line 285) ✅
- mutually exclusive 분기 (동시 표시 불가) — 화면 모드 자체 status 표시 source of truth ✅
- KVRow 컴포넌트 (line 24~30) borderLeft 0 — value 좌측 강조 없음 ✅
- status- prefix `text-status-*` / `bg-status-*` / `border-status-*` 0건 (memory `feedback_tailwind_token_class_pattern`) ✅
- grep: `finding.status === 'open'` =3 PASS, `'resolved'` =1 PASS

### OQ #3 LOCKED — 9·10·11 fontSize → text-caption 12 leading-none 격상
- 슬롯 제거 button '✕' (line 254): `text-caption font-bold leading-none` (fontSize 11 → 12 격상) ✅
- 업로드 중 overlay (line 261): `text-caption leading-none` (fontSize 10 → 12 격상) ✅
- canAdd 사진 첨부 button '사진 첨부' (line 273): `text-caption font-bold leading-none` (fontSize 11 → 12 격상) ✅
- KVRow label (line 27): `text-caption leading-none` ✅
- SectionHeader (line 36): `text-caption font-bold leading-none` ✅
- 조치 사진 라벨 (line 244): `text-caption font-bold leading-none` ✅
- 데스크톱 admin 다운로드 button (line 176): `text-caption font-bold leading-none` ✅
- fontSize 9·10·11 인라인 0건 (negative gate) ✅
- grep: `text-caption` =7 PASS (≥5), `leading-none` =7 PASS (≥5)

### OQ #4 LOCKED — CTA 그라데이션 ≥2 박제 + admin 다운로드 solid + 빈/오류 verbatim
- ★ 데스크톱 inline 조치 완료 CTA (line 293~298): 인라인 `background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)'` 예외 anchor 1 ✅
- ★ 모바일 고정 하단 조치 완료 CTA (line 319~322): 인라인 `background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)'` 예외 anchor 2 ✅
- 옛 `background:'var(--acl)'` 양쪽 완전 폐기 ✅
- admin 다운로드 button — 모바일 ghost (`background:'none'`, line 154~159) + 데스크톱 solid (`bg-surface-sunken border border-border-strong`, line 174) 유지 ✅
- 빈/오류 카피 verbatim '항목을 불러오지 못했습니다. 뒤로 가서 다시 시도하세요.' (line 196) + '사진 없음' (line 220) ✅
- grep: `linear-gradient(135deg, #1d4ed8, #0ea5e9)` =2 PASS (≥2), `linear-gradient` total = 2 (anchor 카운트와 일치)

### OQ #5 LOCKED — Lucide 4종 + back/admin 44x44 + Spinner 폐기 + 이모지 폐기
- `import { ChevronLeft, Download, Loader2, Camera } from 'lucide-react'` 추가 (line 5) ✅
- `<ChevronLeft size={20} />` (line 148, back button) ✅
- `<Download size={18} />` (line 160, admin 다운로드 button) ✅
- `<Loader2 className="animate-spin text-accent" size={24} />` (line 191, 로딩 직접 mount) ✅
- `<Camera size={22} />` (line 274, canAdd) ✅
- back button 44x44 (line 145): `width:44, height:44` inline ✅
- admin 다운로드 button 44x44 (line 154): `width:44, height:44` inline ✅
- Spinner 함수 line 41~48 정의 완전 폐기 ✅
- @keyframes spin 2건 (line 45 + 147) 모두 폐기 ✅
- 인라인 SVG path `d="M15 19l-7-7 7-7"` 0건 (ChevronLeft 교체) ✅
- 인라인 SVG path `d="M12 5v14m0 0l-6-6m6 6l6-6M5 19h14"` 0건 (Download 교체) ✅
- 이모지 '📷' 0건 (Camera 교체) ✅
- grep: ChevronLeft size 20 =1 PASS, Download size 18 =1 PASS, Loader2 =1 PASS, Camera size 22 =1 PASS, 44x44 inline =2 PASS

## 비즈 anchor 11건 보존 grep 결과

| anchor | 검증 | 결과 |
|---|---|---|
| A1 — legalApi 2종 | `legalApi.(getFinding\|resolveFinding)` | =2 ✅ |
| A2 — useQuery legal-finding | `queryKey: ['legal-finding'...]` | =2 ✅ |
| A3 — invalidateQueries 4 키 | `invalidateQueries.*['legal-(finding\|findings\|rounds?)'...]` | =4 ✅ (순서 legal-finding → legal-findings → legal-rounds → legal-round) |
| A4 — snake_case payload | `resolution_memo\|resolution_photo_keys` | =2 ✅ |
| A5 — useMultiPhotoUpload 직접 | `useMultiPhotoUpload()` | =1 ✅ (★ 19/20/21 차이 2 — FindingFormSheet 우회 X) |
| A6 — handleResolve memo.trim | `memo.trim()` + '조치 내용을 입력하세요' | =2 + =2 ✅ |
| A7 — staff selector | `useAuthStore(s => s.staff)` | =1 ✅ (★ 20-legal-findings getState() 와 다름) |
| A7 — admin role 분기 | `staff?.role === 'admin'` | =2 ✅ (모바일 + 데스크톱) |
| A8 — handleDownload fflate | `import('fflate')\|zipSync` | =2 ✅ |
| A8 — iOS PWA `<a download>` | `createElement('a')\|URL.revokeObjectURL` | =2 ✅ |
| A9 — ZIP location 기반 | `지적사항_*\.zip\|finding.location` | =2 ✅ (★ 19/20/21 차이 4 — round.title 기반 X) |
| A10 — toast 5종 | `toast.(success\|error)` | =5 ✅ |
| A10 — '조치 완료' / '다운로드 완료' | verbatim | =5 / =1 ✅ |
| A11 — KVRow + SectionHeader 컴포넌트 | `function KVRow\|function SectionHeader` | =2 ✅ |
| A11 — fmtDate 호출 ≥3 | `fmtDate` | =3 ✅ |

## Lucide 4종 교체 + Spinner 폐기 박제

| 교체 대상 | line (변환 전 → 후) | Lucide | size |
|---|---|---|---|
| 모바일 헤더 back button 인라인 SVG `M15 19l-7-7 7-7` | line 156 → line 148 | `ChevronLeft` | 20 |
| 모바일 헤더 admin 다운로드 button 인라인 SVG `M12 5v14m0 0l-6-6m6 6l6-6M5 19h14` | line 161 → line 160 | `Download` | 18 |
| Spinner 함수 line 41~48 + 호출처 line 180 + @keyframes spin 2건 (line 45 + 147) | line 41~48 + 180 → line 190~193 직접 mount | `Loader2` | 24 |
| 카메라 첨부 button 이모지 '📷' | line 237 → line 274 | `Camera` | 22 |

폐기 박제:
- Spinner 함수 line 41~48 (8 lines) 완전 제거 ✅
- @keyframes spin line 45 (Spinner 안) + line 147 (JSX 외곽 중복) 양쪽 모두 폐기 ✅
- 인라인 SVG path 2종 완전 제거 ✅
- 이모지 '📷' 완전 제거 ✅

## back + admin 다운로드 button 양쪽 44x44 격상 박제

| button | 변환 전 | 변환 후 | 패턴 |
|---|---|---|---|
| 모바일 헤더 back | `width:36, height:36` | `width:44, height:44` inline | LegalFindingsPage bbz precedent mirror |
| 모바일 헤더 admin 다운로드 | `width:36, height:36` | `width:44, height:44` inline | 동일 |

★ 44x44 패턴 — tailwind.config 에 `w-11` 없음 (spacing override: w-7=32, w-8=48) → **inline width/height 채택** (memory `feedback_tailwind_w8_h8_is_48px` 함정 회피).

## CTA 그라데이션 ≥2 박제 (T3 만 예외 anchor)

| anchor | line | 패턴 |
|---|---|---|
| 데스크톱 inline 조치 완료 CTA | line 293~298 | `background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)'` |
| 모바일 고정 하단 조치 완료 CTA | line 319~322 | `background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)'` |

★ lft 1건 + bbz 1건 mirror — 본 페이지는 **mutually exclusive (mobile vs desktop)** 분기로 양쪽 박제 = ≥2.

## ZIP 파일명 location 기반 anchor (19/20/21 차이 4)

```typescript
const name = (finding.location ?? '위치없음').replace(/[\/\\:*?"<>|]/g, '_')
// ...
a.download = `지적사항_${name}.zip`
```

- 19-legal LegalPage: 다른 패턴 (지적사항 분기 안 함)
- 20-legal-findings LegalFindingsPage: `round.title` 기반
- 21-legal-finding-detail (본 페이지): **`finding.location` 기반** ← 고유 anchor

## useMultiPhotoUpload 직접 호출 anchor (19/20/21 차이 2)

```typescript
const resolutionPhotos = useMultiPhotoUpload()
// 직접 사용 멤버 14종: slots / canAdd / openPicker / closePicker / pickCamera / pickAlbum /
//   handleFiles / removeSlot / uploadAll / reset / isUploading / cameraRef / albumRef / showPicker
```

- 19-legal LegalPage: FindingFormSheet 우회 (간접)
- 20-legal-findings LegalFindingsPage: FindingFormSheet 우회 (간접)
- 21-legal-finding-detail (본 페이지): **useMultiPhotoUpload 직접 호출** ← 고유 anchor

## staff selector 패턴 anchor (20-legal-findings getState() 와 다름)

```typescript
const staff = useAuthStore(s => s.staff)   // ★ selector 패턴
{staff?.role === 'admin' && finding && (...)}
```

- 20-legal-findings: `useAuthStore.getState().staff` (getState 패턴)
- 21-legal-finding-detail: `useAuthStore(s => s.staff)` (selector 패턴, React 재렌더 트리거)

## App.tsx + 9 src 파일 + tailwind.config.js 0 byte 변경 verify

```bash
git diff --name-only HEAD~ HEAD -- \
  cha-bio-safety/src/App.tsx \
  cha-bio-safety/src/components/PhotoGrid.tsx \
  cha-bio-safety/src/components/PhotoSourceModal.tsx \
  cha-bio-safety/src/hooks/useMultiPhotoUpload.ts \
  cha-bio-safety/src/hooks/useIsDesktop.ts \
  cha-bio-safety/src/utils/findingDownload.ts \
  cha-bio-safety/src/utils/api.ts \
  cha-bio-safety/src/stores/authStore.ts \
  cha-bio-safety/src/pages/LegalPage.tsx \
  cha-bio-safety/src/pages/LegalFindingsPage.tsx \
  cha-bio-safety/tailwind.config.js
# 출력: (빈 출력) → external-0byte PASS
```

## Build gate

| gate | 결과 |
|---|---|
| `npx tsc --noEmit` | **PASS** (0 errors) |
| `npm run build` | **PASS** (✓ built in 15.30s + PWA injectManifest PASS) |
| LegalFindingDetailPage chunk size | `LegalFindingDetailPage-Du3yaXdX.js` **9,847 bytes** (≈ 9.6 KB raw) |

## Negative gate 11건 + Positive gate 13건 + 카피 verbatim 19종 PASS

### Negative gate (11건 모두 PASS)
- emoji 0 ✅
- linear-gradient anchor 카운트 = total (=2) ✅
- fontSize 9·10·11 인라인 0 ✅
- status- prefix 0 ✅
- w-8/h-8 0 ✅
- 옛 alias `var(--bg|bg2|bg3|bd|bd2|t1|t2|t3|acl|safe|warn|danger)` 0 ✅
- 인라인 SVG path 2종 0 ✅
- function Spinner / const Spinner 0 ✅
- @keyframes spin 0 ✅
- IconChevronLeft / polyline 0 ✅
- 📷 이모지 0 ✅

### Positive gate (13건 모두 PASS)
- OQ #1 raised+border-b ≥1 (=1) ✅
- 헤더 '지적 상세' ≥2 (=2 모바일 + 데스크톱) ✅
- status open 분기 ≥1 (=3) ✅
- status resolved 분기 ≥1 (=1) ✅
- text-caption ≥5 (=7) ✅
- leading-none ≥5 (=7) ✅
- linear-gradient(135deg, #1d4ed8, #0ea5e9) ≥2 (=2) ✅
- lucide-react import ≥1 (=1) ✅
- ChevronLeft / Download / <Loader2 / Camera ≥1 (=2 / =9 / =1 / =3) ✅
- ChevronLeft size 20 / Download size 18 / Camera size 22 ≥1 (=1 / =1 / =1) ✅
- back/admin 44x44 격상 ≥2 (=2 inline width:44 height:44) ✅

### 카피 verbatim 19종 모두 PASS
지적 정보 ✅ / 지적 사진 ✅ / 조치 내용 ✅ / 조치 결과 ✅ / 지적 내용 ✅ / 위치 ✅ / 등록일 ✅ / 등록자 ✅ / 조치일시 ✅ / 조치자 ✅ / 사진 없음 ✅ / 사진 첨부 ✅ / 업로드 중 ✅ / 처리 중... ✅ / 다운로드 중... ✅ / 항목을 불러오지 못했습니다 ✅ / 조치 사진 ✅ / 조치 처리 실패 ✅ / 다운로드 실패 ✅

## Deviations from Plan

None — 모든 OQ LOCKED 5건 / 비즈 anchor 11건 / negative gate 11건 / positive gate 13건 / 카피 verbatim 19종 / external 0-byte gate / build gate plan 명세 그대로 적용. PLAN.md 의 "279 → 250~310 lines 예상" 은 estimate 였고, 실제 327 lines (+18) 는 JSX 멀티라인 포맷팅 영향 — `min_lines: 250` 충족, 기능 deviation 0.

## 다음 단계

1. **redesign/21-legal-finding-detail 브랜치 push** → 사용자 컨펌 대기
2. main 머지 → GitHub Actions 자동 배포 (cbc7119-preview.pages.dev)
3. 사용자 시각 컨펌 (모바일 + 데스크톱 양쪽 viewport)
4. **LegalFinding 시리즈 19/20/21 3 페이지 (LegalPage + LegalFindingsPage + LegalFindingDetailPage) 모두 redesign 완료** — legal 시리즈 종결
5. 메모리 박제 후보:
   - `project_redesign_21_legal_finding_detail_status.md` (W1~W6 모두 완결 박제)
   - `feedback_redesign_legal_series_19_20_21_complete.md` (19/20/21 차이 2 + 4 + selector 패턴 + CTA 그라데이션 ≥2 패턴 통합 박제)
   - `feedback_single_file_atomic_8th_pattern.md` (r22/lft/bbz/1hj/gox/u5n/4i9/6if 단일 파일 atomic 패턴 8번째 도달)

## Self-Check: PASSED

- ✅ `cha-bio-safety/src/pages/LegalFindingDetailPage.tsx` exists (327 lines)
- ✅ Atomic commit `d13ab58` exists in git log
- ✅ `cha-bio-safety/dist/assets/LegalFindingDetailPage-Du3yaXdX.js` exists (9,847 bytes)
- ✅ External 0-byte gate PASS (11 files)
- ✅ tsc + build PASS
- ✅ All negative + positive + biz anchor + copy gates PASS
