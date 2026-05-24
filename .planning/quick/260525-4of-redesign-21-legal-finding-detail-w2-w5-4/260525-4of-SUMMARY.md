---
phase: quick-260525-4of
plan: 01
type: execute
wave: 1
quick_id: 260525-4of
date: 2026-05-25
branch: redesign/21-legal-finding-detail (worktree base 046c8ec)
status: complete
files_created:
  - cha-bio-safety/docs/redesign-context/21-legal-finding-detail/sketch-wave-2-chrome.html (465 lines)
  - cha-bio-safety/docs/redesign-context/21-legal-finding-detail/sketch-wave-3-finding-info.html (480 lines)
  - cha-bio-safety/docs/redesign-context/21-legal-finding-detail/sketch-wave-4-resolve-form.html (600 lines)
  - cha-bio-safety/docs/redesign-context/21-legal-finding-detail/wave-5-tsx-conversion-checklist.md (490 lines)
commits:
  - e35e031 — T1 (W2 chrome) feat(quick-260525-4of): sketch wave 2 (모바일 헤더 + 데스크톱 타이틀 + Lucide ChevronLeft/Download/Loader2 44x44)
  - 66df871 — T2 (W3 finding-info) feat(quick-260525-4of): sketch wave 3 (Section 1 KVRow 4행 + Section 2 PhotoGrid/사진 없음 + status 칩 없음 OQ #2)
  - aed88dc — T3 (W4 resolve-form) feat(quick-260525-4of): sketch wave 4 (status open form + 사진 5장 useMultiPhotoUpload 직접 + 조치 완료 CTA 그라데이션 ≥3 OQ #4)
  - 39b2340 — T4 (W5 TSX checklist) feat(quick-260525-4of): sketch wave 5 (LegalFindingDetailPage.tsx 279 lines 단일 atomic 변환 룰 + 비즈 anchor 11 + Tailwind cheatsheet)
src_files_modified: 0 (★ 10 src 파일 모두 0 byte 변경 — LegalFindingDetailPage + 외부 6 + App.tsx + 조부모 LegalPage + 부모 LegalFindingsPage)
oq_locked_applied: [1, 2, 3, 4, 5]
biz_anchor_count: 11
diff_19_20_legal: 5
---

# Phase quick-260525-4of: redesign/21-legal-finding-detail W2~W5 통합 Summary

One-liner: redesign/21-legal-finding-detail W2 chrome + W3 finding-info + W4 resolve-form + W5 TSX checklist 4 atomic 산출 — OQ #1~#5 LOCKED 5건 verbatim + 비즈 anchor 11건 박제 + 19/20-legal 차이 5건 시각 반영 + src 10 파일 0 byte.

## What was built

4 atomic 산출물 (모두 `cha-bio-safety/docs/redesign-context/21-legal-finding-detail/` 직속 평면 배치):

1. **T1 (W2 chrome) — sketch-wave-2-chrome.html (465 lines, 4 frame)**
   - 모바일 자체 헤더 `bg-surface-raised border-b border-border-default` (★ OQ #1 LOCKED — 옛 alpha 토큰 폐기)
   - 타이틀 '지적 상세' 정중앙 정적 (line 158 verbatim, 20-legal-findings 동적 분기와 다름)
   - back + admin 다운로드 button 44x44 격상 — `w-11 h-11` (★ OQ #5 LOCKED, w-8=48 함정 회피)
   - 데스크톱 타이틀 영역 (line 168~177) — 글로벌 chrome 0 (App.tsx line 117 정규식 `^/legal/.+` → showNav=false)
   - Spinner → Lucide Loader2 animate-spin size={24} (★ OQ #5 LOCKED, line 41~48 div 폐기)
   - 에러 단일 문장 (line 185 verbatim — 20-legal-findings '화면을 당겨서...' 와 다름)
   - 4 frame: 다크 모바일 빈 / 다크 모바일 로딩 / 다크 데스크톱 빈 / 라이트 모바일 오류
   - **linear-gradient 0건** (T3 만 예외)

2. **T2 (W3 finding-info) — sketch-wave-3-finding-info.html (480 lines, 4 frame)**
   - Section 1 지적 정보 KVRow 4행 (지적 내용 / 위치 / 등록일 / 등록자 — line 200~204 verbatim)
   - Section 2 지적 사진 PhotoGrid 또는 '사진 없음' (line 213 verbatim)
   - KVRow 컴포넌트 (label 12 width 64 flexShrink 0 + children 14 flex 1 lineHeight 1.5) + SectionHeader 12/700 var(--t3) marginBottom 10
   - ★ OQ #2 LOCKED — finding 상태 chip 본 페이지 없음 + KVRow value 좌측 강조 없음 (status 표시는 화면 모드 자체로 W4 scope)
   - ★ OQ #3 LOCKED — KVRow label + SectionHeader 12 leading-none 명시
   - 19/20 차이 시각 반영: 위치 fallback '-' (line 202, 20-legal-findings '위치 미지정' 과 다름) + fmtDate 분까지 표시 (line 18, 20-legal-findings 일까지만 과 다름)
   - 4 frame: 다크 모바일 사진 0건 / 다크 데스크톱 사진 3개 / 라이트 모바일 위치 '-' / 라이트 데스크톱 사진 5개
   - **linear-gradient 0건**

3. **T3 (W4 resolve-form) — sketch-wave-4-resolve-form.html (600 lines, 4 frame)**
   - Section 3 status open 분기 (line 218~250): textarea + 사진 5장 슬롯 (img + uploading overlay + canAdd) + 데스크톱 inline CTA
   - Section 4 status resolved 분기 (line 253~265): KVRow 3행 + PhotoGrid
   - ★ OQ #4 LOCKED — 조치 완료 CTA 인라인 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` ≥3 박제 (T3 만 예외 anchor: 모바일 고정 + 데스크톱 inline + admin frame, 실제 grep hit 8개)
   - ★ OQ #3 LOCKED — uploading overlay '업로드 중' 10→12 + 제거 button '✕' 11→12 + canAdd '사진 첨부' 11→12 모두 격상 + leading-none 명시
   - ★ OQ #5 LOCKED — canAdd '📷' 이모지 (line 237) → Lucide Camera size={22} 교체
   - 모바일 고정 하단 CTA (line 270~275, status open 한정 — position fixed + iOS safe-area `calc(12px + var(--sab, 0px))`)
   - admin ZIP 다운로드 — 파일명 location 기반 `지적사항_${name}.zip` (line 119, **19/20 차이 4** — 20-legal-findings round.title 기반과 다름)
   - handleDownload + iOS PWA `<a download>` + setTimeout(URL.revokeObjectURL, 3000) anchor verbatim
   - useMultiPhotoUpload 직접 사용 (line 59, **19/20 차이 2** — FindingFormSheet 우회 X)
   - 4 frame: 다크 모바일 open form + 슬롯 3종 + 모바일 고정 CTA / 다크 데스크톱 open form + 슬롯 5개 + 데스크톱 inline CTA / 다크 모바일 resolved 결과 / 라이트 데스크톱 resolved + admin ZIP zipLoading + admin frame anchor

4. **T4 (W5 TSX checklist) — wave-5-tsx-conversion-checklist.md (490 lines, 12 섹션)**
   - §1 변환 범위 — LegalFindingDetailPage.tsx 단일 atomic 279 lines 3 영역 통합 표
   - §2 비즈 anchor 11건 보존 (verbatim fence — useQuery + useMutation uploadAll 선행 + 4 키 invalidate + navigate(-1) + legalApi 2종 + useMultiPhotoUpload 직접 + handleResolve validation + finding.status 분기 + admin selector + handleDownload location 기반 + iOS PWA + toast 5)
   - §3 변환 매핑 영역 1~3 verbatim
   - §4 OQ LOCKED 5건 반영 매핑 표
   - §5 negative gate (T3 만 linear-gradient 예외 anchor)
   - §6 positive gate
   - §7 build/tsc (W6 시점)
   - §8 자체 verify grep 모음 15종
   - §9 Tailwind cheatsheet (v0.1.1 토큰 → utility class 매핑 13행)
   - §10 비즈 보존 체크박스 21건
   - §11 메모리 룰 inline 13건
   - §12 다음 단계 — 단일 finding 페이지 자체로 종결 (W6 TSX 변환만 남음, 부모/조부모 변환 완료)

## OQ LOCKED 5건 verbatim 반영

| OQ # | LOCKED 결정 | 적용 sketch | 핵심 line |
|------|-------------|-------------|----------|
| #1 | 모바일 헤더 `bg-surface-raised border-b border-border-default` + 타이틀 '지적 상세' 정중앙 정적 + back/admin 44x44 | W2 chrome | line 149~165 |
| #2 | finding 상태 chip 본 페이지 없음 + KVRow value 좌측 강조 없음 (status 표시 = 화면 모드 자체로 mutually exclusive) | W3 finding-info + W4 status 분기 | line 218 + 253 |
| #3 | 9·10·11 → 12 격상 + leading-none (uploading overlay + 제거 button + canAdd) | W3 + W4 | line 231/232/237 |
| #4 | 조치 완료 CTA `linear-gradient(135deg, #1d4ed8, #0ea5e9)` ≥3 (T3 만 예외) + admin 다운로드 = 작은 도구 solid 유지 | W4 resolve-form | line 244~248 + 270~275 |
| #5 | Lucide ChevronLeft 20 + Download 18 + Loader2 24 + Camera 22 교체 + back/admin 44x44 격상 | W2 (ChevronLeft+Download+Loader2) + W4 (Camera) | line 156/161/41/237 |

## 비즈 anchor 11건 박제 (4 파일 모두)

react-query 시그니처 3종 + legalApi 2종 + useMultiPhotoUpload 직접 + handleResolve validation + finding.status 분기 + admin selector + handleDownload (fflate + iOS PWA + ZIP location 기반) + @keyframes spin 중복 + toast 카피 5종 + 추가 카피 다수 — 모두 1 byte 변경 0 룰.

각 sketch + checklist 안 `legalApi|useQuery|useMutation|useMultiPhotoUpload|handleResolve|handleDownload|finding.status|role.*admin|toast|KVRow|SectionHeader` grep hit count:
- W2 chrome: 44 hits
- W3 finding-info: 69 hits
- W4 resolve-form: 69 hits
- W5 checklist: 72 hits

## 19/20-legal 차이 5건 sketch 시각 반영

1. **단일 finding 페이지** (LegalFindingsPage 다건 목록 + LegalPage 마스터-디테일 우측 패널과 다름) — 데스크톱 maxWidth 700 (20-legal-findings 800 보다 좁음)
2. **resolution form 풀 페이지 — 사진 5장 useMultiPhotoUpload 직접 사용** (FindingFormSheet 우회 X) — W4 슬롯 3종+5개 박제
3. **조치 완료 button 풀폭 CTA 그라데이션** — OQ #4 LOCKED `linear-gradient(135deg, #1d4ed8, #0ea5e9)` ≥3 anchor
4. **admin ZIP 다운로드 단일 finding 기반 — 파일명 location 기반** `지적사항_${name}.zip` (line 119, 20-legal-findings round.title 기반과 다름) — W4 + W5 §10 박제
5. **finding.status open/resolved 분기 화면 모드 자체** (mutually exclusive line 218/253) — W4 4 frame (open 모바일/데스크톱 + resolved 모바일/데스크톱) 매트릭스

## Negative gate 결과 (4 sketch + 1 checklist)

| Gate | T1 (W2) | T2 (W3) | T3 (W4) | T4 (W5) |
|------|---------|---------|---------|---------|
| 이모지 0건 | PASS | PASS | PASS | PASS |
| linear-gradient | 0건 PASS | 0건 PASS | ≥3 PASS (★ 예외) | 5건 PASS (code fence 인용) |
| 9·10·11px fontSize 0건 | PASS | PASS | PASS | PASS |
| status- prefix 0건 | PASS | PASS | PASS | PASS |
| w-8 / h-8 0건 | PASS | PASS | PASS | PASS |
| 옛 alias 토큰 0건 (본문) | PASS | PASS | PASS | PASS |
| finding 칩/borderLeft 본 페이지 0건 (OQ #2) | N/A | PASS | N/A | N/A |

## src 10 파일 0 byte verify gate

```bash
git diff --name-only HEAD~4 HEAD -- \
  cha-bio-safety/src/pages/LegalFindingDetailPage.tsx \
  cha-bio-safety/src/components/PhotoGrid.tsx \
  cha-bio-safety/src/components/PhotoSourceModal.tsx \
  cha-bio-safety/src/hooks/useMultiPhotoUpload.ts \
  cha-bio-safety/src/utils/findingDownload.ts \
  cha-bio-safety/src/utils/api.ts \
  cha-bio-safety/src/stores/authStore.ts \
  cha-bio-safety/src/App.tsx \
  cha-bio-safety/src/pages/LegalPage.tsx \
  cha-bio-safety/src/pages/LegalFindingsPage.tsx
# 결과: empty → PASS
```

**PASS — 10 src 파일 모두 0 byte 변경.** 4 commit 모두 sketch HTML 3개 + checklist md 1개 산출만.

## Deviations from Plan

**1 minor deviation (Rule 1 — bug fix during T1 verify gate):**

- **Found during:** T1 verify gate part 2 (after T1 initial commit)
- **Issue:** sketch annotation 메타 텍스트 안에 `font-size:11px` (frame-label) + `font-size:10px` (placeholder annotation 6건) 사용 — negative gate `9·10·11px fontSize 0건` 위반
- **Fix:** sed-replace `font-size:11px → font-size:12px` + `font-size:10px → font-size:12px` (T1 + T3 W4 양쪽 모두). frame label / 콘텐츠 placeholder 가독성 유지하며 OQ #3 룰 일관 적용
- **Commit:** T1 amended (e35e031) — atomic 4 commit 룰 보존 (별도 commit 추가 X)

**1 sketch escape (negative gate 자체매칭 회피 — Rule 2):**

- **Found during:** T1/T2 verify gate (`linear-gradient` 메타 텍스트 + `미조치/완료 칩` + `text-status-safe` 예시)
- **Issue:** rules 박스 안에서 "linear-gradient 0건" / "finding 상태 칩 없음" / "text-status-safe 패턴 사용 시 FAIL" 메타 설명 사용 시 grep negative gate 자체매칭으로 FAIL
- **Fix:** HTML entity escape (`linear&#8209;gradient` / `미&#8209;조치/완&#8209;료 chip` / `text&#8209;status&#8209;safe`) — 시각적으로 동일, grep 매칭 회피
- **Commit:** T1 amended + T2 신규 commit 안 포함

위 2건 모두 PLAN scope_negatives 의 "negative gate 자체매칭 회피: ... 메타 줄은 `<code>` fence 안 또는 HTML entity escape" 룰 일치 — deviation 이 아닌 PLAN-conform 적용.

## Commits

- `e35e031` — T1 (W2 chrome) — 465 lines (amended for OQ #3 conform)
- `66df871` — T2 (W3 finding-info) — 480 lines
- `aed88dc` — T3 (W4 resolve-form) — 600 lines (★ linear-gradient ≥3 OQ #4 LOCKED)
- `39b2340` — T4 (W5 TSX checklist) — 490 lines (12 섹션)

Total: 4 atomic commits + 1 SUMMARY (본 파일, 후속 commit 으로 박제).

## Next steps

1. **W6 TSX 변환 wave** (다음 turn 진입점, 별도 quick task):
   - `LegalFindingDetailPage.tsx` (279 lines) 단일 atomic 변환 (3 영역 통합)
   - 본 W5 checklist §3 변환 매핑 + §8 verify grep + §10 비즈 보존 체크박스 기반
   - 다른 9 src 파일 모두 0 byte

2. **단일 finding 페이지 자체로 종결**:
   - 조부모 LegalPage (19-legal) = 이미 변환 완료
   - 부모 LegalFindingsPage (20-legal-findings) = wic sketch 완료, TSX 변환 별도 wave
   - 본 페이지 (21-legal-finding-detail) = W6 만 남음

3. **메모리 박제 (W6 완료 후)**: `project_redesign_21_legal_finding_detail_status.md`

4. **직원 도메인 X** (cbc7119-preview 자동 배포만, wrangler 명령 절대 X).

## Self-Check: PASSED

- ✅ 4 파일 모두 생성 (FOUND: sketch-wave-2-chrome.html, sketch-wave-3-finding-info.html, sketch-wave-4-resolve-form.html, wave-5-tsx-conversion-checklist.md)
- ✅ 4 commits 모두 존재 (FOUND: e35e031, 66df871, aed88dc, 39b2340)
- ✅ 10 src 파일 0 byte verify gate PASS (`git diff --name-only HEAD~4 HEAD -- cha-bio-safety/src/...` empty)
- ✅ 평면 배치 (cha-bio-safety/docs/redesign-context/21-legal-finding-detail/ 직속, sketch/ 서브폴더 X)
- ✅ 각 task verify gate `<automated>` 블록 모두 PASS
