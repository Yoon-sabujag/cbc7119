---
phase: 260528-h3z-phase-b-wave-5-remediationdetail
plan: 01
subsystem: redesign/phase-b-sweep
status: complete
tags: [remediation, remediation-detail, inline-style-to-tailwind, no-op-refactor, phase-b-tier-1-wave-5, font-family-inherit-option-n, conditional-option-m, atomic-single-commit]
requires:
  - 260528-gsh-phase-b-wave-4 완료 (05fddf1)
  - 260528-cjn-phase-b-wave-3 완료 (a78963f + 4e99270)
  - 260528-c9s-phase-b-wave-2 완료 (d36a20f)
  - 260528-a3v-phase-b-wave-1 완료 (18fd138)
  - 260527-wdc-legalpage-phase-b 옵션 X+P+M+색변수N 확정 (184e548)
  - 260528-0hr-phase-b-master-roadmap v2 (ROADMAP only)
provides:
  - RemediationDetailPage.tsx Phase B 완료 (11 → 2 잔존 = L486/L496 fontFamily 'inherit' 옵션 N — tailwind 표현 불가)
  - Phase B Tier 1 Wave 5 (조치 상세 — 단일 파일 자동화 5종 페이지) 완료
affects:
  - src/pages/RemediationDetailPage.tsx
tech-stack:
  added: []
  patterns:
    - "옵션 X (정확값 arbitrary) — `w-[28px] h-[28px]` 스피너 (w-7=32 / w-8=48 함정 회피 — feedback_tailwind_w8_h8_is_48px.md)"
    - "옵션 P — `leading-*` 명시 불필요 (Phase A 결과 보존, 본 wave 신규 leading 변경 없음)"
    - "옵션 M (className conditional) — 2건 신규: L301 `${record.status === 'open' ? 'pb-[calc(72px+var(--sab,0px))]' : 'pb-6'}` template literal + L518 `${submitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}`"
    - "옵션 N 잔존 2건 — L486/L496 `fontFamily: 'inherit'` (Wave 01h LegalFindingDetail 동일 패턴, tailwind 표현 불가)"
    - "animation arbitrary — L285 spinner `[animation:spin_.7s_linear_infinite]` (gsh Wave 4 slideUp arbitrary 패턴 직접 승계)"
    - "calc + var 동적 arbitrary — L301 `pb-[calc(72px+var(--sab,0px))]` + L512 `pb-[calc(12px+var(--sab,0px))]` (whitespace 제거 후 동일)"
    - "px-6 = padding 0 24px (`spacing.6=24px` config override 활용)"
key-files:
  created:
    - .planning/quick/260528-h3z-phase-b-wave-5/260528-h3z-SUMMARY.md
  modified:
    - src/pages/RemediationDetailPage.tsx
decisions:
  - "wdc/01h/a3v/c9s/cjn/gsh 승계 옵션 X+P+M+색변수N — 사용자 재컨펌 불필요 (0hr roadmap locked)"
  - "L285 spinner — `w-[28px] h-[28px]` arbitrary 사용 (config spacing w-7=32 / w-8=48 함정 회피 — 28px 직접 표현)"
  - "L301 paddingBottom conditional — multiline style 객체를 className template literal 통째 변환 (옵션 M). open 시 pb-[calc(72px+var(--sab,0px))] / 그 외 pb-6 (=24px, config override)"
  - "L512 paddingBottom 단일 calc — className 합병 `pb-[calc(12px+var(--sab,0px))]` (py-3 + 더 큰 pb-[calc] 마지막 선언 우선)"
  - "L518 cursor + opacity conditional — single object 두 prop 모두 옵션 M template literal 로 변환 (submitting 분기 동일 조건)"
  - "L486/L496 fontFamily 'inherit' 옵션 N 잔존 — tailwind utility 표현 불가 (font-sans 는 Pretendard Variable 고정값, inherit 동작 아님)"
  - "단일 파일 단일 atomic commit 패턴 — 28-splash/27-login/23-education/c9s/cjn/gsh 정밀도 패턴 자동 도달"
metrics:
  duration: "약 8분 (Task 1 atomic — single commit)"
  completed-date: 2026-05-28
  tasks-completed: "1/1"
  files-modified: 1
  lines-changed: "9 ins / 14 del (net -5 lines, atomic single commit)"
roadmap-wave: "Tier 1 / Wave 5 (조치 상세 — 단일 파일)"
---

# Phase 260528-h3z Plan 01: Phase B Wave 5 RemediationDetailPage Summary

RemediationDetailPage (528줄, 11 inline) 의 inline style 을 wdc/01h/a3v/c9s/cjn/gsh 승계 옵션 X+P+M+색변수N 으로 tailwind className 으로 일괄 변환. **위험 anchor 없음** (의도 inline 분기 없음, 캘리브 좌표 없음) — 자동화 5종 (유도등/소화기/소화전/방화셔터/전실제연댐퍼) 룰은 `useEffect` 본체에 있어 inline style 변환과 무관. 시각 결과 0 byte 변경 (no-op refactor). Phase A 결과 (Lucide / 색 토큰 -bar / emoji 0 / 비표준 색 0) 및 비즈니스 로직 (remediationApi.get / api.delete/post resolve/unresolve / useQuery / useQueryClient invalidateQueries / usePhotoUpload / 5 카테고리 자동화 useEffect / handleResolve materialsString 빌더) 모두 보존. Phase B Tier 1 Wave 5 성공.

## User Decisions (승계 — wdc / 01h / a3v / c9s / cjn / gsh / 0hr-roadmap 재확인 불필요)

| ID  | 선택                                                          | 출처                              |
| --- | ------------------------------------------------------------- | --------------------------------- |
| (b) | **옵션 X** — 정확값 arbitrary `[Npx]` (시각 0 byte)            | wdc Phase B Task 2 결정            |
| (c) | **옵션 P** — `leading-none/leading-relaxed` 명시 보존          | wdc Phase B Task 2 결정            |
| (d) | **옵션 M + 색 변수만 N** — template literal conditional 우선   | wdc Phase B Task 2 결정            |
| -   | **a3v/c9s/cjn/gsh 승계 적용** — 본 wave 사용자 재확인 없이 진행 | 260528-0hr roadmap v2 locked-decisions |

## Before / After 카운트

| Metric (`style={{` count)        | Before | After   | Diff             |
| -------------------------------- | ------ | ------- | ---------------- |
| RemediationDetailPage.tsx        | **11** | **2**   | **-9 (-82%)**    |

총 변경: 1 file, 9 ins / 14 del, net -5 lines. PLAN 예상 (11→2) 정확히 달성.

## 변환 매핑 (9건 변환, 2건 옵션 N 잔존)

### Root + 로딩/에러 wrapper 변환 (3건)

| Line (orig) | Before                                                                                                                                                                                | After                                                                                              | 패턴            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------- |
| L269 root   | `style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }} className="bg-surface-page"`                                                       | className 통째 `flex-1 flex flex-col h-full overflow-hidden bg-surface-page`                        | P2/P3           |
| L284 spinner wrapper | `style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}`                                                                                       | className `flex-1 flex items-center justify-center`                                                | P2/P3           |
| L292 error wrapper | `style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' }} className="text-body-sm text-text-secondary"`     | className 통째 `flex-1 flex items-center justify-center px-6 text-center text-body-sm text-text-secondary` — **px-6 = padding 0 24px (config override `spacing.6=24px`)** | P2/P3 + override |

### Spinner animation arbitrary 변환 (1건)

| Line (orig) | Before                                                                                                                  | After                                                                                                                          | 패턴            |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| L285 spinner | className `border-2 border-border-strong border-t-accent rounded-full` + `style={{ width: 28, height: 28, animation: 'spin .7s linear infinite' }}` | className 통째 `border-2 border-border-strong border-t-accent rounded-full w-[28px] h-[28px] [animation:spin_.7s_linear_infinite]` — **w-7=32 / w-8=48 함정 회피 (28px arbitrary)** | arbitrary X     |

### whitespace pre-wrap 2건 변환

| Line (orig) | Before                                                                                                  | After                                                                       | 패턴            |
| ----------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------- |
| L352 메모   | `<span style={{ whiteSpace: 'pre-wrap' }}>{record.resolutionMemo ?? '-'}</span>`                        | `<span className="whitespace-pre-wrap">{record.resolutionMemo ?? '-'}</span>` | P3              |
| L355 자재   | `<span style={{ whiteSpace: 'pre-wrap' }}>{record.materialsUsed ?? '-'}</span>`                         | `<span className="whitespace-pre-wrap">{record.materialsUsed ?? '-'}</span>`  | P3              |

### calc + var arbitrary 변환 (2건)

| Line (orig) | Before                                                                                                                                                          | After                                                                                                                                            | 패턴                       |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| L301 conditional | className `flex-1 overflow-y-auto` + `style={{ paddingBottom: record.status === 'open' ? 'calc(72px + var(--sab, 0px))' : 24 }}`                          | className template literal `flex-1 overflow-y-auto ${record.status === 'open' ? 'pb-[calc(72px+var(--sab,0px))]' : 'pb-6'}`                       | 옵션 M + arbitrary CSS calc |
| L512 CTA bar | className `fixed bottom-0 left-0 right-0 bg-surface-page border-t border-border-default px-4 py-3` + `style={{ paddingBottom: 'calc(12px + var(--sab, 0px))' }}` | className 합병 `fixed bottom-0 left-0 right-0 bg-surface-page border-t border-border-default px-4 py-3 pb-[calc(12px+var(--sab,0px))]`             | arbitrary CSS calc (whitespace 제거) |

### Submitting conditional 옵션 M (1건)

| Line (orig) | Before                                                                                                                                                                                                      | After                                                                                                                                                                              | 패턴   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| L518 CTA button | className `w-full h-12 ... transition-opacity flex items-center justify-center gap-1.5 leading-none` + `style={{ cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.5 : 1 }}` | className template literal `w-full h-12 ... transition-opacity flex items-center justify-center gap-1.5 leading-none ${submitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}` | 옵션 M |

### 옵션 N 잔존 (2건 — tailwind 표현 불가)

| Line | Before                                                | 잔존 이유                                                                                          |
| ---- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| L486 (이전 L483) materialName input | `style={{ fontFamily: 'inherit' }}` | **`fontFamily: 'inherit'` 은 tailwind utility 로 표현 불가** — Wave 01h LegalFindingDetail 동일 패턴. font-sans 는 Pretendard Variable 고정값. |
| L496 (이전 L493) materialCount input | `style={{ fontFamily: 'inherit' }}` | **동일 — fontFamily inherit tailwind 표현 불가**                                                    |

## Verification Results (모든 게이트 PASS)

| Check                                                                                              | Result        | 비고                                                                                                |
| -------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------- |
| `grep -c 'style={{' RemediationDetailPage.tsx`                                                     | **2**         | 11 → 2 (-9, -82%)                                                                                   |
| 비즈 anchor count diff (9종)                                                                       | **IDENTICAL** | onClick / useState / useRef / useEffect / useMutation / useQuery / useNavigate / useParams / fetch — empty diff |
| onClick handler bodies precise diff (5 uniq)                                                       | **IDENTICAL** | `grep -oE 'onClick=\{[^}]+\}' \| sort \| uniq` diff 0 줄                                            |
| `grep -cE '✓\|✗\|🔒\|💾\|🔥\|⏰\|📋\|✅\|⚠️\|❌\|🔧\|🚨\|🔍\|🧯\|📊'`                              | **0**         | Phase A §7.1 결과 보존                                                                              |
| 비표준 색 토큰 grep (`bg-warning[^-]\|border-safe[^-]\|border-warning[^-]\|border-danger[^-]`)         | **0**         | Phase A §2.3 결과 보존                                                                              |
| TypeScript `tsc --noEmit` 전체 에러                                                                 | **0**         | 신규 에러 0                                                                                          |
| 변경 파일 범위 (`.planning/` 외)                                                                     | **1 .tsx**    | RemediationDetailPage.tsx                                                                            |
| post-commit deletions (`git diff --diff-filter=D HEAD~1 HEAD`)                                     | **none**      | 의도하지 않은 삭제 없음                                                                              |
| **5 카테고리 자동화 useEffect 보존**                                                                  | **10 occur.** | isGuideLight / isExtinguisher / isHydrant / isFireShutter / isSmokeDamper 각 2개씩 (basic action + materials 자동) |
| **잔존 inline 위치 확인**                                                                            | **L486/L496** | 둘 다 fontFamily: 'inherit' (옵션 N — 계획대로)                                                       |

### 비즈 anchor identity 상세 (precise diff = empty)

```
=== src/pages/RemediationDetailPage.tsx (before == after) ===
  onClick=\{[^}]+\} : 9
  useState\( : 3
  useRef\( : 0
  useEffect\( : 10
  useMutation\( : 0
  useQuery\( : 1
  useNavigate\( : 1
  useParams\( : 0
  fetch\( : 0
```

diff before↔after = 0 줄 차이.

### onClick precise diff (5 uniq IDENTICAL)

`grep -oE 'onClick=\{[^}]+\}' | sort | uniq` 결과:
- `onClick={() => navigate(-1)}` (back button)
- `onClick={() => setActionPick(opt)}` (5 카테고리 picker 공통)
- `onClick={handleDelete}` (admin delete)
- `onClick={handleResolve}` (CTA submit)
- `onClick={handleUnresolve}` (admin unresolve)

5 uniq IDENTICAL — diff 0 줄.

## 비즈니스 로직 0 byte 확인 (precise)

원본 9건 onClick handler 본체 grep + sort + uniq = 5 uniq IDENTICAL.

추가 보존 확인:
- `remediationApi.get(recordId)` (useQuery)
- `api.delete('/inspections/records/' + recordId)` (handleDelete)
- `api.post('/inspections/records/' + recordId + '/unresolve', {})` (handleUnresolve)
- `api.post('/inspections/records/' + recordId + '/resolve', { resolution_memo, resolution_photo_key, materials_used })` (handleResolve)
- `usePhotoUpload()` + `photo.hasPhoto` + `photo.upload()` (사진 첨부)
- `useQueryClient.invalidateQueries({ queryKey: ['remediation' | 'remediation-detail' | 'dashboard'] })` (3 invalidate)
- 5 카테고리 자동화 5 종 useEffect 본체 (유도등 본체/예비전원, 소화기 받침/소화기, 소화전 경종/위치표시등/호스걸이, 방화셔터 라인표시함/연동제어기 기판, 전실제연댐퍼 기판/모터)
- materialName/materialCount 자동 채움 5 카테고리 분기
- `materialsString = materialName.trim() ? '${materialName.trim()} ${materialCount || 1}ea' : null` (자재 빌더)
- isAdmin = useAuthStore(s => s.staff?.role === 'admin') (admin 분기)
- ZONE_LABEL / GL_TYPE_LABEL / 5 isXxx category 분기 / record.locationDetail / record.markerLabel / fmtDate
- handleResolve 5 카테고리 + 그 외 finalMemo 결정 분기

## Phase A 보존 확인

| Phase A 항목                                   | RemediationDetailPage | 비고                                |
| ---------------------------------------------- | --------------------- | ----------------------------------- |
| Lucide import                                  | OK                    | ChevronLeft/Image/RotateCcw/Trash2/Check 그대로 |
| 색 토큰 `-bar` 변종                              | OK                    | border-warning-bar/border-danger-bar/text-warning-bar/text-danger-bar 그대로 |
| Emoji 0 (watched set)                          | 0                     | grep 0                              |
| 비표준 색 토큰 0                                 | 0                     | grep 0                              |

## Memory anchor 적용 확인

| Anchor                                                              | 적용 사례                                                                                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `feedback_tailwind_w8_h8_is_48px.md` (w-7=32 / w-8=48 함정)           | **L285 spinner** width:28/height:28 → `w-[28px] h-[28px]` arbitrary (w-7=32 / w-8=48 함정 회피 — 28px 직접 표현)        |
| `feedback_tailwind_token_class_pattern.md`                          | `bg-surface-page` / `bg-surface-raised` / `bg-surface-sunken` / `text-text-primary` / `text-text-secondary` / `text-text-tertiary` / `border-border-default` / `border-border-strong` / `border-danger-bar` / `border-warning-bar` 등 extend.colors token short form 유지 |
| `feedback_text_caption_leading_none.md`                             | 본 wave 신규 leading 변경 없음 (기존 text-caption/text-label/text-body-sm + leading-none/leading-relaxed/leading-tight 보존) |
| `reference_inspection_remediation_automation_pattern.md`             | **5 카테고리 자동화 useEffect 10건** 100% 보존 (점검 → 조치 → 자재 자동 채움 — 유도등/소화기/소화전/방화셔터/전실제연댐퍼) |
| `project_redesign_28_splash_status.md` (단일 atomic)                  | RemediationDetailPage 단일 파일 단일 atomic commit 패턴 (precedent: 28-splash + 27-login + 23-education + c9s + cjn + gsh) 자동 도달 |

## Commits

| Hash    | Subject                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------ |
| db728c0 | `feat(260528-h3z-01): Phase B Wave 5 — RemediationDetailPage 11 inline → tailwind`                                       |

## Deviations from Plan

### Auto-decisions (PLAN 인용 직접 적용)

**1. L301 paddingBottom conditional — 옵션 M template literal 단일 className**
- PLAN context "옵션 M template literal" 명시 + 기존 className `flex-1 overflow-y-auto` 와 합병
- 결정: multiline style 객체 → 단일 className 통째 template literal (`flex-1 overflow-y-auto ${record.status === 'open' ? 'pb-[calc(72px+var(--sab,0px))]' : 'pb-6'}`)
- 효과: PLAN 옵션 M 정확히 적용. open 시 calc(72px+sab) / 그 외 24px (=pb-6 config override) 두 분기 모두 시각 0 byte 보존
- 24 → `pb-6` 변환 정확: tailwind.config.js spacing.6 = '24px' (extend override 명시) — 일반 tailwind 기본 (6=1.5rem=24px) 과 동일값

**2. L512 CTA bar paddingBottom calc — className 합병**
- 기존 className 에 이미 `py-3` 있으나 inline `paddingBottom: 'calc(12px + var(--sab, 0px))'` 가 후행 선언이라 우선
- 결정: className 합병 시 `pb-[calc(12px+var(--sab,0px))]` 를 마지막에 배치 → cascade 동일 우선순위 유지 (CSS 마지막 선언 우선 룰 + tailwind utility 순서 결정성)
- 효과: py-3 의 pb-12px 가 calc(12px+sab) 로 정확히 override (whitespace 제거 후 동일값)

**3. L285 spinner w-[28px] arbitrary — w-7=32 함정 즉시 회피**
- 변환 중 width:28, height:28 발견. config spacing.7=32px / w-8=48px 함정 (memory `feedback_tailwind_w8_h8_is_48px.md`)
- 결정: `w-7`/`w-8` 모두 28px 아니므로 `w-[28px] h-[28px]` arbitrary 강제 사용
- 효과: 시각 0 byte 룰 100% 준수, 별도 Rule 1 fix patch 불필요 (사전 인지로 1회 통과)

**4. L518 cursor + opacity conditional — 두 prop 모두 옵션 M template literal**
- 두 prop 동일 조건 (`submitting`) 분기. cursor 와 opacity 모두 tailwind utility 직접 표현 가능 (cursor-not-allowed/cursor-pointer + opacity-50/opacity-100)
- 결정: 단일 template literal 로 4 utility 묶음 변환 (style object 완전 제거)
- 효과: 옵션 M 가장 깔끔한 형태로 적용

**5. L486/L496 fontFamily 'inherit' 옵션 N 잔존 — tailwind 표현 불가 확정**
- tailwind.config.js fontFamily: { sans: ['Pretendard Variable', ...] } / mono: [...] 만 정의. `inherit` 키워드 utility 없음
- 결정: 옵션 N 잔존 (Wave 01h LegalFindingDetail 동일 패턴 — fontFamily inherit 은 input 의 system 기본 폰트 회피 패턴, 본 페이지 디자인 의도 유지)
- 효과: 11 → 2 정확히 도달 (PLAN 예상과 일치)

### Auto-fixed Issues

**None.** Wave 3 cjn 의 pb-7→pb-[28px] 사고 / w-7=32 함정 사전 인지 / fontFamily inherit Wave 01h precedent 모두 변환 시점에 즉시 대응 → 별도 fix commit 불필요. Atomic 단일 commit 으로 완료.

## 배포 계획

- **이 워크트리 (디자인 트랙):** main 머지 → cbc7119-preview.pages.dev 자동 배포 (GitHub Actions). 시각 0 byte 보장이므로 preview 검증은 페이지 정상 렌더 + 빌드 통과로 충분.
- **production cherry-pick 후보 묶음:** Phase B Tier 1 Wave 1~11 묶음 B (roadmap 5.B) 완료 후 일괄 cherry-pick. 본 wave (db728c0) 는 묶음 B 의 다섯 번째 commit (a3v 18fd138 + c9s d36a20f + cjn a78963f/4e99270 + gsh 05fddf1 다음).
- **이 워크트리에서는 wrangler 명령 금지 / production deploy 금지** — `.claude/settings.local.json` deny 룰 준수.

## Next Steps (out of scope)

- **Wave 6+ (다음 페이지):** roadmap §4 Tier 1 Wave 6 진행 (다음 단일 파일 또는 묶음).
- **묶음 B production cherry-pick:** Wave 11 까지 완료 후 일괄 (현재 시점에서는 진행 X). 묶음에 db728c0 commit 포함.

## Self-Check: PASSED

**Files:**
- FOUND: cha-bio-safety/src/pages/RemediationDetailPage.tsx (modified, 11→2)
- FOUND: cha-bio-safety/.planning/quick/260528-h3z-phase-b-wave-5/260528-h3z-SUMMARY.md (this file)

**Commits:**
- FOUND: db728c0 (Task 1 atomic — Wave 5 조치 상세)
