---
phase: quick-260526-8yx
plan: 01
status: complete
quick_id: 260526-8yx
branch: redesign/22-documents
date: 2026-05-26
completed_date: 2026-05-26
duration_minutes: ~8
commits:
  - 71edcf2 docs(quick-260526-8yx): redesign/22-documents W6 TSX 변환 verify checklist (12 섹션 + multi-file 3 파일 박제)
files_created:
  - cha-bio-safety/docs/redesign-context/22-documents/wave-6-tsx-conversion-checklist.md (501 lines)
files_modified: []
mirror_of:
  - 18-worklog/wave-7-tsx-conversion-checklist.md (slq, 단일 1216 lines)
  - 19-legal (6if) / 20-legal-findings (bbz) / 21-legal-finding-detail (lft) / 23-education (4i9) / 28-splash (0803d2f) 5 mirror
metrics:
  lines: 501 (>=380 OK)
  section_headers: 12 (=12 OK)
  biz_anchor_groups: 9 (>=9 OK)
  oq_locked: 5 (=5 OK)
  sketch_grep_classes: 36 (>=8 OK, 4.5x 초과)
  memory_unique_slugs: 13 (>=10 OK)
  negative_count: 17 in §11 (>=15 OK)
  verify_gate_count: 22 in §12 (>=18 OK)
  components_css_new: 17 (>=15 OK)
  components_css_reuse: 3 (>=3 OK)
  lucide_icons: 7 (FileText/Plus/Loader2/Trash2 + Upload/X/AlertTriangle 옵션 — >=5 OK)
key_anchors_verbatim:
  - delete_confirm: "정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다." (memory project_legal_findings_delete_incident_260520, 1 byte 변경 0)
  - beforeunload: "업로드 중입니다. 페이지를 나가면 전송이 중단됩니다."
  - abort_confirm: "업로드를 취소하시겠습니까? 지금까지 전송된 데이터는 저장되지 않습니다."
  - admin_403: "관리자만 업로드할 수 있습니다."
  - admin_anchor: "useAuthStore((s) => s.staff?.role === 'admin')"
  - typeLabel: "소방계획서 / 소방훈련자료"
next_wave: W7 TSX 변환 실행 (W6 checklist 단일 진입점 참조)
---

# Phase quick-260526-8yx Plan 01: redesign/22-documents W6 TSX 변환 verify checklist Summary

**One-liner:** W7 TSX 변환 wave 단일 진입점 — `wave-6-tsx-conversion-checklist.md` 501 lines / 12 섹션 / 9 비즈 anchor / 5 OQ LOCKED / 36 sketch grep class / 13 메모리 slug / 17 negative / 22 verify gate atomic 1 commit.

## Scope

22-documents 3 파일 (DocumentsPage 162 + DocumentSection 517 + DocumentUploadForm 402 = 1081 lines) TSX 변환 wave 의 verify checklist markdown 1개 만 산출. src/sketch HTML/components.css/App.tsx/utils 모두 0 byte 변경 (W7 wave 에서 실행). slq mirror multi-file scope 적용.

## Commits

| Hash | Message |
|------|---------|
| 71edcf2 | docs(quick-260526-8yx): redesign/22-documents W6 TSX 변환 verify checklist (12 섹션 + multi-file 3 파일 박제) |

(W6 atomic 1 commit + 본 SUMMARY commit = 합계 2 commit on branch)

## §12 verify gate 22 + 3 git diff gate 결과 (모두 PASS)

| # | gate | 기대값 | 실측 | result |
|---|---|---|---|---|
| 1 | grep -c '^# §' | =12 | 12 | PASS |
| 2 | grep -c '^\[GROUP [1-9]' | >=9 | 9 | PASS |
| 3 | grep -cE '^## §5\.[1-5]' | =5 | 5 | PASS |
| 4 | sketch grep classes | >=8 | 36 | PASS (4.5x) |
| 5 | unique memory slugs | >=10 | 13 | PASS |
| 6 | negative count §11 | >=15 | 17 (총 34 — 표 포함) | PASS |
| 7 | verify table rows §12 | >=18 | 22 | PASS |
| 8 | wc -l DocumentsPage.tsx | =162 | 162 | PASS |
| 9 | wc -l DocumentSection.tsx | =517 | 517 | PASS |
| 10 | wc -l DocumentUploadForm.tsx | =402 | 402 | PASS |
| 11 | components.css inherit (.docs- + .btn-) | 재사용 >=2 + 신규 >=15 | 신규 17 + 재사용 3 = 20 | PASS |
| 12 | text-caption | >=1 | 16 | PASS |
| 13 | Lucide 5종 | >=5종 | 7종 (FileText/Plus/Loader2/Trash2/Upload/X/AlertTriangle, 74 hits) | PASS |
| 14 | @keyframes 3종 | >=3 | 5 | PASS |
| 15 | typeLabel verbatim (소방계획서/소방훈련자료) | >=2 | 2 | PASS |
| 16 | ★ delete confirm verbatim | >=1 | 2 | PASS |
| 17 | beforeunload verbatim | >=1 | 2 | PASS |
| 18 | abort confirm verbatim | >=1 | 1 | PASS |
| 19 | 403 카피 verbatim | >=1 | 2 | PASS |
| 20 | useAuthStore anchor | >=1 | 5 | PASS |
| 21 | lin-grad anchor (OQ #2) | >=3 | 6 | PASS |
| 22 | bg-surface-sunken 통일 (OQ #5) | >=3 | 24 | PASS |
| + | src 3 파일 + utils 3개 + hooks + stores + App.tsx + components.css diff | =0 lines | 0 | PASS |
| + | sketch HTML 4 파일 diff | =0 lines | 0 | PASS |
| + | W6 markdown 신규 1 파일 | =1 | 1 (501 lines) | PASS |

**ALL 22 verify gate + 3 git diff gate PASS.**

## Sketch Grep §6 fence 실측 (executor 직접 grep)

명령:
```bash
grep -hoE 'class="[^"]+"' cha-bio-safety/docs/redesign-context/22-documents/sketch-wave-*.html | sort -u
```

결과: 36 unique class verbatim 박제 (§6 fence). 8 마지노선 4.5배 초과 충족. 4 sketch wave (chrome + document-section + upload-form-inline + modal-confirm) 합산 결과. 비즈 토큰 anchor (bg-accent / bg-surface-sunken / bg-surface-raised / text-danger / text-text-on-accent / text-text-primary / text-text-secondary / text-text-tertiary / border-border-default) 모두 일관 박제.

## OQ #1~#5 LOCKED 5건 verbatim §5 인용

- **OQ #1** chrome 강조색 토큰 통일 (bg-accent / border-accent) — 7곳 적용 + fallback bg-[#2f81f7]
- **OQ #2** submit button 그라데이션 (linear-gradient 135deg #1d4ed8 #0ea5e9) — DocumentUploadForm submit 인라인 또는 `.btn-primary-gradient` 신규
- **OQ #3** 최신 pill 11 → 12 격상 + leading-none — text-caption font-bold leading-none
- **OQ #4** 모달 title 20 → 22 격상 + Error 13 → 14 격상 + 빈 FileText 48 유지
- **OQ #5** var(--bg4) → bg-surface-sunken 통일 — inputBaseStyle / progress bar / Year tile / dashed file button 4곳

## ★ 비즈 anchor 9 그룹 verbatim 박제 (1 byte 변경 0)

1. documentsApi 2종 (list + remove)
2. useQuery + invalidateQueries (queryKey ['documents', type] + staleTime 60_000)
3. ALLOWED 6 ext + EXT_TO_MIME + MAX_SIZE 500MB
4. empty MIME fallback (HWP/ZIP iOS Safari)
5. multipart upload runMultipartUpload + contentType fallback + ProgressState
6. abort/retry (AbortController abortRef + AbortError 분기 + handleCancel + handleRetry + unmount cleanup)
7. beforeunload guard (isUploading 동안만 listener)
8. admin 권한 isAdmin (useAuthStore + 403 카피)
9. **★ delete confirm gate full string verbatim** (memory `project_legal_findings_delete_incident_260520` 1 byte 변경 0 — 2026-05-20 22행 삭제 사고 가드 강화 룰 일반화)

## Deviations from Plan

**None — plan 그대로 실행.** 

mbr deviation 2건 mirror 패턴 적용:
- "warning glyph" 약어 패턴 — 본문 `이모지 0` negative 충돌 회피
- "lin-grad" 약어 — `linear-gradient` 본문 등장은 §4/§5 OQ #2 LOCKED 인용 anchor 만 (§6 sketch fence 안 자체는 인용 fence escape OK)

## Self-Check: PASSED

- `cha-bio-safety/docs/redesign-context/22-documents/wave-6-tsx-conversion-checklist.md` (501 lines) — FOUND
- 71edcf2 commit (本 W6 atomic) — FOUND on branch redesign/22-documents
- 22 verify gate + 3 git diff gate 모두 PASS (위 표 참조)

## 다음 단계 (W7 TSX 변환 wave)

본 W6 checklist 는 W7 TSX 변환 wave 의 **단일 진입점** 이다. W7 executor 는:

1. 본 checklist 12 섹션 (§1~§12) 만 참조
2. src 3 파일 (DocumentsPage 162 + DocumentSection 517 + DocumentUploadForm 402) 변환
3. components.css 신규 17 클래스 추가 (+ 재사용 3)
4. 9 비즈 anchor 그룹 1 byte 변경 0
5. OQ #1~#5 LOCKED default 5건 적용
6. negative 17건 + verify 22건 모두 만족
7. atomic commit 패턴 — W7 변환 본인 + cbc7119-preview 자동 deploy (wrangler 절대 X)

진행 가능 시점: 사용자가 별도 quick (예: `/gsd:quick redesign/22-documents W7`) 트리거 후 W7 executor spawn. 본 checklist HEAD 71edcf2 직후 base.
