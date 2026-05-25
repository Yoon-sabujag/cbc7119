---
phase: quick-260526-9bv
plan: 01
type: execute
status: complete
created: 2026-05-25
completed: 2026-05-25
quick_id: 260526-9bv
branch: redesign/22-documents
commits:
  - hash: cdfb95b
    type: feat
    msg: "feat(redesign/22-documents): W7 TSX 변환 — 4 파일 단일 atomic"
files_modified:
  - cha-bio-safety/src/pages/DocumentsPage.tsx (162 → 82)
  - cha-bio-safety/src/components/DocumentSection.tsx (517 → 308)
  - cha-bio-safety/src/components/DocumentUploadForm.tsx (402 → 290)
  - cha-bio-safety/src/styles/components.css (504 → 613, +109)
mirror_of:
  - 18-worklog (slq) / 19-legal (6if) / 20-legal-findings (bbz) / 21-legal-finding-detail (lft) / 23-education (4i9) / 28-splash (0803d2f)
metrics:
  duration_min: ~10
  src_lines_before: 1081
  src_lines_after: 680
  src_delta: -401
  components_css_lines_added: 109
  docs_classes_new: 60+
  biz_anchor_groups_preserved: 9
  oq_locked_applied: 5
  verbatim_strings_preserved: 4
  negative_gates_passed: 17
  positive_grep_passed: 20+
  build_chunk_kb: 13.72
  build_chunk_gzip_kb: 5.29
  ts_errors: 0
---

# redesign/22-documents W7 TSX 변환 SUMMARY

## One-liner

DocumentsPage + DocumentSection + DocumentUploadForm 3 파일 var alias/inline-style → Tailwind class + components.css inherit 변환 + 신규 60+ .docs-* class + .btn-primary-gradient (OQ #2 lin-grad) 단일 atomic.

## 결과 표

| 항목 | before | after | delta | 비고 |
|---|---|---|---|---|
| DocumentsPage.tsx | 162 | 82 | -80 | chrome 만, class extraction |
| DocumentSection.tsx | 517 | 308 | -209 | 인라인 → class, JSX 단순화 |
| DocumentUploadForm.tsx | 402 | 290 | -112 | 인라인 → class, JSX 단순화 |
| components.css | 504 | 613 | +109 | .docs-* 17 base + variants + .btn-primary-gradient + @keyframes 3종 |
| **src 합계** | **1585** | **1293** | **-292** | -18% |

## Build

- `npx tsc --noEmit` → **0 errors**
- `npm run build` → **PASS (built in 14.58s)**
- DocumentsPage chunk = **13.72 kB / gzip 5.29 kB**

## 비즈 anchor 9 그룹 grep PASS (1 byte 변경 0)

| # | anchor | 위치 | 상태 |
|---|---|---|---|
| 1 | documentsApi.list / .remove | DocumentSection | ✓ |
| 2 | useQuery key ['documents', type] + invalidateQueries | Section + Form | ✓ |
| 3 | ALLOWED 6 ext + MAX_SIZE 500MB | Form | ✓ |
| 4 | empty MIME fallback `f.type && !(entry.mimes...)` | Form line 96 | ✓ |
| 5 | runMultipartUpload({file,type,year,title,contentType,signal,onProgress}) | Form | ✓ |
| 6 | abortRef + AbortController + AbortError 분기 | Form | ✓ |
| 7 | beforeunload returnValue verbatim | Form | ✓ |
| 8 | useAuthStore + isAdmin + 403 카피 | Section + Form | ✓ |
| 9 | ★ delete confirm full string verbatim | Section line 87 | ✓ |

## 카피 verbatim 4건 (1 byte 변경 0)

| 카피 | 파일 | 위치 |
|---|---|---|
| `"${item.title}\n(${item.filename})\n\n정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.` | DocumentSection | handleDelete window.confirm |
| `업로드 중입니다. 페이지를 나가면 전송이 중단됩니다.` | DocumentUploadForm | beforeunload returnValue |
| `업로드를 취소하시겠습니까? 지금까지 전송된 데이터는 저장되지 않습니다.` | DocumentUploadForm | handleCancel window.confirm |
| `관리자만 업로드할 수 있습니다.` | DocumentUploadForm | 403 ApiError 분기 |

## OQ LOCKED 5건 적용

| OQ | 룰 | 적용 |
|---|---|---|
| #1 | chrome 강조색 토큰 통일 (bg-accent) | 7곳 `#2f81f7` → `var(--accent)` (components.css) |
| #2 | submit button lin-grad 135deg #1d4ed8 #0ea5e9 | `.btn-primary-gradient` 신규 (canSubmit false 시 sunken+tertiary) |
| #3 | 최신 pill 11 → 12 + leading-none | `.docs-latest-pill` font-size 12 + line-height 1 |
| #4 | 모달 title 20→22 + Error 13→14 격상 | `.docs-form-title` 22 + `.docs-error-msg` 14/500 |
| #5 | var(--bg3)/var(--bg4) → bg-surface-sunken | 4곳 (input + progress + Year tile + dashed file btn) |

## Negative gate 17 PASS

| # | 룰 | 결과 |
|---|---|---|
| 1 | src 4 파일만 변경 | ✓ (DocumentsPage + DocumentSection + DocumentUploadForm + components.css) |
| 2 | sketch HTML 변경 0 | ✓ |
| 3 | wrangler 명령 0 | ✓ |
| 4 | npm run deploy 0 | ✓ |
| 5 | 이모지 0 | ✓ |
| 6 | lin-grad 약어 — anchor 만 | ✓ (components.css OQ #2 inline 1곳) |
| 7 | status- prefix 0 | ✓ |
| 8 | w-8/h-8 className 0 | ✓ |
| 9 | fontSize 9·10·11 인라인 0 | ✓ |
| 10 | 옛 alias 토큰 본문 0 | ✓ (var(--*) → components.css 캡슐화) |
| 11~16 | utils/api / utils/multipartUpload / utils/downloadBlob / hooks/useIsDesktop / stores/authStore / App.tsx 0 byte | ✓ (git diff = 0) |
| 17 | 기존 .btn-primary / .btn-secondary / .empty-state 수정 0 | ✓ (참조도 없음) |

## Deviations from Plan

### mbr deviation 2건 (LOCKED — 본문 약어 발생)

**1. "warning glyph" 약어**
- 등장 위치: 본 SUMMARY 외 src 0건 (AlertTriangle 미사용 — OQ #4 LOCKED 옵션 only)
- 이유: PLAN 박스의 deviation_abbreviations 그대로 (메모리 anchor 박제)

**2. "lin-grad" 약어**
- 등장 위치: SUMMARY + commit message (anchor 인용). components.css 안 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` 본문 verbatim 1회.
- 이유: OQ #2 LOCKED — `.btn-primary-gradient` anchor

### 신규 class 갯수

PLAN 박제 17 unique base는 모두 추가하되, `--busy` / `--first` / `--last` / `--filled` / `--hero` 등 modifier variant + `-col` 보조 wrapper class 도 함께 추가하면서 총 `.docs-*` line count 65 (base 17 + modifier 25 + wrapper 23 = grep 65). 신규 base ≥15 마지노선 4배 초과 충족.

## 메모리 룰 enforcement

- ✓ `feedback_planner_prompt_sketch_verbatim` — components.css §1~§13 PLAN T1 박스 verbatim 적용
- ✓ `feedback_tailwind_token_class_pattern` — status- prefix 0, Lucide size prop only
- ✓ `feedback_tailwind_w8_h8_is_48px` — `.docs-trash-btn` 32px 명시, `.docs-upload-btn-mobile` 40px 명시
- ✓ `feedback_text_caption_leading_none` — `.docs-latest-pill` 12 + leading-none, `.docs-file-hint` 12 + leading-none
- ✓ `feedback_check_branch_before_edit` — redesign/22-documents 확인 후 진입
- ✓ `feedback_cbc7119_design_never_wrangler` — wrangler 0 실행
- ✓ `project_legal_findings_delete_incident_260520` — ★ delete confirm full string verbatim + per-item deletingIds 잠금 + Loader2 spin during delete

## Known Stubs

None.

## Threat Flags

None — chrome/JSX restructuring 만. 비즈 anchor 9 그룹 + 외부 의존 6 파일 모두 1 byte 변경 0.

## Self-Check: PASSED

- [x] cha-bio-safety/src/pages/DocumentsPage.tsx exists (82 lines)
- [x] cha-bio-safety/src/components/DocumentSection.tsx exists (308 lines)
- [x] cha-bio-safety/src/components/DocumentUploadForm.tsx exists (290 lines)
- [x] cha-bio-safety/src/styles/components.css exists (613 lines)
- [x] commit cdfb95b exists in git log
- [x] git diff --name-only HEAD~1 HEAD = 4 lines (4 files)
- [x] external deps (utils/api / utils/multipartUpload / utils/downloadBlob / hooks/useIsDesktop / stores/authStore / App.tsx) 0 byte changed
- [x] tsc 0 errors / build PASS / chunk 13.72 kB
