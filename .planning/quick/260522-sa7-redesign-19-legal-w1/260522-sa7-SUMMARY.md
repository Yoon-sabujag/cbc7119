---
phase: quick-260522-sa7
plan: 01
subsystem: redesign/19-legal (sketch wave 1 — index 단일 산출)
tags: [redesign, 19-legal, wave-1, index, legal, soso-jeomgeom, point-management, 4-sub-wave-distribution, biz-anchor, chrome-rules-direct-apply]
requires: []
provides:
  - "W2~W5 진입의 단일 진입점 인덱스 (cha-bio-safety/docs/redesign-context/19-legal/wave-1-index.md)"
  - "LegalPage.tsx 571 lines 4 영역 인벤토리 (상단 유틸 + FindingsPanel + FindingDetailPanel + 메인 LegalPage) + 비즈 시그니처 보존 anchor 박스"
  - "design-system v0.1.1 §1.1/§1.2/§1.3/§6.4/§6.6/§7.1 verbatim 6 fence 박제"
  - "02+06 chrome 통일 룰 직접 적용 케이스 (소방 점검 관리 = 점검 시리즈 = 02 InspectionPage 동일 도메인) + App.tsx 실측 (line 35/71/74/77/98/117/289/290/291)"
  - "메모리 룰 12건 (10 기본 + accentColor/ResultBadge/finding 칩 status 토큰 일반화 + role admin 도구 분기 + filterRounds + sorted open-first source of truth 일반화) inline 인용"
  - "OQ 5건 + default 답 (모바일 헤더 raised 0.97 / status 토큰 치환 / fontSize 격상 / 메인 CTA gradient + 빈/오류 아이콘 / Lucide back+Camera+Loader2 + back 44x44 격상)"
affects: []
tech-stack-added: []
tech-stack-patterns: [4-sub-wave-W2-W5-distribution, flat-sketch-folder-naming, biz-anchor-preservation, chrome-rules-direct-apply-inspection-series, status-token-mapping-no-prefix, role-admin-tools-source-of-truth]
key-files:
  created:
    - "cha-bio-safety/docs/redesign-context/19-legal/wave-1-index.md (758 lines)"
  modified: []
decisions:
  - "Flat sketch folder naming (sketch-wave-N-{slug}.html, sketch/ 서브폴더 안 만듦) — 7 페이지 (13/14/27/16/17/28/23) 일관"
  - "4 sub-wave (W2~W5) 분배 — LegalPage 571 lines 단일 파일 + 3 내부 컴포넌트 + 데스크톱 3분할 + 모바일 sub-route 위임 — 23-education 4 sub-wave 패턴 mirror"
  - "Chrome 룰 직접 적용 케이스 — 19-legal 은 소방 점검 관리 = 점검 시리즈, 02 InspectionPage 와 동일 도메인 (23-education 보수교육과 다름)"
  - "비즈 anchor 1 byte 0 룰 — accentColor 4분기 / ResultBadge 4 라벨 / finding 2분기 / filterRounds 3분기 / TABS key/label mismatch / sorted open-first / role admin 도구 분기 / legalApi 7종 snake_case payload / useMultiPhotoUpload 5장 / buildMetaTxt + ZIP 파일명 패턴 / toast 11종 / @keyframes blink (.6/.3, Education 1/0.4 와 다름) / spin (28-splash + 23-education + 15-daily-report 일반화)"
  - "memory feedback_inspection_unresolved_color 일반화 → accentColor + ResultBadge + finding 칩 status 토큰 매핑 (status- prefix 없음 룰)"
  - "memory project_inspection_completion_rule 일반화 → role admin 도구 분기 (FindingsPanel + FindingDetailPanel) + filterRounds 3분기 + sorted open-first + TABS key/label mismatch + handleRoundClick isDesktop 분기 모두 운영 룰 source of truth"
  - "OQ 5건 모두 default 답 명시 (raised 유지 / status 토큰 치환 / fontSize 12 격상 / CTA gradient + 도구 solid + 아이콘 무 / Lucide back+Camera+Loader2 + back 44x44 격상)"
metrics:
  duration: "약 25분 (Read PLAN 979 lines + Read LegalPage 571 lines + Read design-system 461 lines + Read inspection-modal-chrome-rules 281 lines + Read 23-education wave-1-index.md template 612 lines + grep App.tsx + grep tokens.css + Write 758 lines + 자체 verify 9 gate + 1 commit)"
  completed: "2026-05-22"
  tasks_completed: 1
  files_created: 1
  files_modified: 0
  commits: 1
  deviations: 0
---

# Quick Task 260522-sa7: redesign/19-legal W1 인덱스 Summary

W1 산출 1개 파일 — `cha-bio-safety/docs/redesign-context/19-legal/wave-1-index.md` (758 lines) + 자체 verify 9 gate PASS + 1 commit. 23-education / 28-splash / 17-annual-plan / 16-workshift / 27-login W1 의 7 섹션 + 4 sub-wave 구조 정확히 mirror. LegalPage = 소방 점검 관리 = 점검 시리즈 직접 적용 케이스 (02 InspectionPage 와 동일 도메인) — 23-education 보수교육과 다름. 비즈 anchor 1 byte 0 룰 + status 토큰 매핑 (status- prefix 없음) + role admin 도구 분기 운영 룰 source of truth.

---

## What was built

**1 markdown 파일** — `cha-bio-safety/docs/redesign-context/19-legal/wave-1-index.md` (758 lines).

7 섹션 구조 (PLAN must_haves 100% 충족):

- **§1 LegalPage 인벤토리** — 4 영역 (상단 유틸/포맷터/스켈레톤/탭/KVRow + FindingsPanel 데스크톱 중앙 + FindingDetailPanel 데스크톱 우측 + 메인 LegalPage) + 영역별 표 + 비즈 시그니처 보존 anchor 박스 (useQuery 4종 + useMutation resolveMutation + legalApi 7종 + accentColor 4분기 + ResultBadge 4 라벨 + filterRounds 3분기 + TABS key/label mismatch + sorted open-first + handleRoundClick isDesktop 분기 + useMultiPhotoUpload 5장 + buildMetaTxt + fflate ZIP + toast 11종 + 빈/오류 카피 다수 + KVRow 라벨 7건 + 데스크톱 fallback 3종 + @keyframes blink (.6/.3) + spin + 첨부 button '📷' 이모지 사고 케이스)
- **§2 4 sub-wave 분배** — W2 chrome+빈/로딩/오류+모바일 헤더+데스크톱 3분할 outline / W3 라운드 카드+탭+연도 필터+accentColor+ResultBadge / W4 FindingsPanel + FindingDetailPanel (지적사항 목록 + 상세 + 조치 입력 + 사진 5장 + 다운로드 + admin 도구) / W5 markdown TSX checklist + 각 wave 보존/토큰/폰트/레이아웃 분리
- **§3 design-system v0.1.1 인용** — §1.1 노안 친화 + §1.2 정보 인지 + §1.3 모바일/데스크톱 동일 폰트 + §6.4 Backgrounds & Gradients + §6.6 Animation + §7.1 Lucide 6 fence verbatim + 적용 메타 (§6.1 Progress / §6.2 Stat Card / §6.3 카테고리 카드 / §7.2 카테고리 아이콘 = LegalPage 미적용 1줄 메타)
- **§4 02+06 chrome 룰 직접 적용 케이스** — 19-legal = 소방 점검 관리 = 점검 시리즈 (02 InspectionPage 동일 도메인). 23-education 보수교육과 다름. 각 룰 (§1~§7) 1줄 메타 (적용/미적용 판정) + App.tsx 실측 (line 35/71/74/77/98/117/289/290/291 — 특수 regex 포함)
- **§5 메모리 룰 12건 inline** — 10 기본 + 19-legal 특화 2건 (★ feedback_inspection_unresolved_color accentColor + ResultBadge + finding 칩 status 토큰 일반화 + ★ project_inspection_completion_rule role admin 도구 분기 + filterRounds + sorted open-first source of truth 일반화)
- **§6 negative rule** — sketch HTML 금지 / LegalPage.tsx + 외부 6 파일 (PhotoGrid / PhotoSourceModal / FindingFormSheet / useMultiPhotoUpload / findingDownload / api) 미수정 / wrangler + npm run deploy 금지 / 평면 폴더 / App.tsx 미수정 / sub-route 페이지 미수정 / 비즈 anchor 전체 1 byte 0 (★ 6 별표 항목 + 외 11개 = 17 보존 항목)
- **§7 OQ 5건** — 모두 default 답 명시 (1: 모바일 헤더 raised 0.97 유지 / 2: accentColor + ResultBadge status 토큰 치환 OK / 3: §1.1 fontSize 12 격상 OK / 4: 메인 CTA gradient OK + 빈/오류 아이콘 무 유지 / 5: Lucide back+Camera+Loader2 교체 OK + back 44x44 격상)

추가: 자체 verify 9 gate (섹션 / sub-wave / 메모리 / wrangler / deploy / OQ / fence / src 변경 / legalApi anchor).

---

## Deviations from Plan

**None — plan executed exactly as written.**

PLAN 의 must_haves 7건 (truths) + artifacts 1건 + key_links 9건 모두 1:1 충족. line 범위 drift 0 — LegalPage.tsx 571 lines 실측 일치, design-system.md 461 lines 실측 일치, inspection-modal-chrome-rules.md 281 lines 실측 일치, App.tsx 모든 인용 라인 (35/71/74/77/98/117/289/290/291) grep 으로 사전 검증 후 verbatim 인용.

비즈 anchor 박스 (§1.3) 추정/paraphrase 0건 — LegalPage.tsx 본문 grep 으로 모두 직접 박제 (accentColor 4분기 매핑 + ResultBadge map 4 라벨 + rgba 값 + TABS key/label mismatch + filterRounds 3분기 + sorted open-first 정확한 코드 인용 + toast 카피 11종 line 번호 + 빈/오류 카피 + 섹션 라벨 + KVRow 라벨 + ZIP 파일명 정규식 + 사진 파일명 패턴 등).

---

## Self-Check: PASSED

**파일 존재 확인:**
- ✓ `cha-bio-safety/docs/redesign-context/19-legal/wave-1-index.md` (758 lines)

**자체 verify 9 gate 결과:**
| gate | 명령 | 기대값 | 실제값 | PASS |
|---|---|---|---|---|
| 1. 7 헤더 존재 | `grep -c '^# §[1-7]'` | =7 | 7 | ✓ |
| 2. sub-wave 분배 표 W2~W5 | `grep -E '^\| W[2-5] \|' \| wc -l` | =4 | 4 | ✓ |
| 3. 메모리 룰 unique | `grep -oE 'feedback_[a-z_]+' \| sort -u \| wc -l` | ≥10 | 12 | ✓ |
| 4a. wrangler 키워드 | `grep -c 'wrangler'` | ≥1 | 4 | ✓ |
| 4b. npm run deploy 키워드 | `grep -c 'npm run deploy'` | ≥1 | 3 | ✓ |
| 5. src/LegalPage.tsx 변경 0 | `git diff --name-only HEAD -- ...` | 0 | 0 | ✓ |
| 6. OQ §7 ≥5 | `grep -cE 'OQ #[1-5]'` | ≥5 | 59 | ✓ |
| 7. design-system fence | `grep -c '^\`\`\`'` | ≥12 | 18 | ✓ |
| 8. legalApi 7-method anchor | `grep -cE 'legalApi\.(list\|get\|...)'` | ≥7 | 20 | ✓ |

**commit 확인:**
- ✓ `5677764 docs(quick-260522-sa7): redesign/19-legal W1 인덱스 ...` (758 insertions, 1 file)
- ✓ deletion check PASS (`git diff --diff-filter=D HEAD~1 HEAD` = empty)
- ✓ working tree clean post-commit

**소스 변경 0건 확인:**
- ✓ `git diff --name-only HEAD~1 HEAD` = `cha-bio-safety/docs/redesign-context/19-legal/wave-1-index.md` (단일 파일)
- ✓ `cha-bio-safety/src/pages/LegalPage.tsx` untouched
- ✓ 외부 컴포넌트/훅 (PhotoGrid / PhotoSourceModal / FindingFormSheet / useMultiPhotoUpload / findingDownload / api / authStore / useIsDesktop) untouched
- ✓ App.tsx untouched

---

## Key Decisions

1. **Flat sketch folder naming** — 7 페이지 (13/14/27/16/17/28/23) 일관 패턴 채택. `sketch/` 서브폴더 X. 19-legal 도 `19-legal/sketch-wave-N-{slug}.html` 평면 배치.
2. **4 sub-wave (W2~W5) 분배** — LegalPage 571 lines 단일 파일 + 3 내부 컴포넌트 (FindingsPanel/FindingDetailPanel/메인 LegalPage) + 데스크톱 3분할 + 모바일은 sub-route 위임 — 23-education 4 sub-wave 패턴 mirror. W3 = 라운드 카드 / W4 = FindingsPanel + FindingDetailPanel 통합 (조치 입력 + 사진 5장 + admin 다운로드 + admin 도구 포함).
3. **Chrome 룰 직접 적용 케이스 (★ 19-legal 의 23-education 과 가장 큰 차이)** — 19-legal = 소방 점검 관리 = 점검 시리즈, 02 InspectionPage 와 동일 도메인. 23-education = 보수교육 (점검 시리즈 아님) chrome 룰 직접 적용 X. 19-legal 의 chrome 룰 적용 여부는 각 §1~§7 룰별로 1줄 메타 (적용/부분/미적용) 정리 — 모달 chrome 룰 (§1) 은 본 wave 범위 아님 (FindingFormSheet/PhotoSourceModal 별도 wave), 페이지 chrome (§2 헤더/§5 상태 색/§6 본문/§7 back button) 부분 적용.
4. **비즈 anchor 1 byte 0 룰** — 28-splash 16건 + 23-education D-day + role 그룹핑 보존 룰 일반화. LegalPage 의 핵심 비즈 약 25건 (useQuery 4종 + useMutation + legalApi 7종 + accentColor 4분기 + ResultBadge 4 라벨 + filterRounds 3분기 + TABS key/label mismatch + sorted open-first + handleRoundClick isDesktop + useMultiPhotoUpload 5장 + buildMetaTxt + ZIP 파일명 + 사진 파일명 + toast 11종 + 빈/오류 카피 20+건 + 섹션 라벨 + KVRow 라벨 + 데스크톱 3분할 width 500/500/flex 1 + @keyframes blink (.6/.3) + spin) 모두 §1.3 비즈 시그니처 박스에 명시 + §6 negative rule 의 ★ 별표 항목으로 cross-ref.
5. **memory feedback_inspection_unresolved_color 일반화 (★ 19-legal 특화 룰 1)** — 점검 페이지의 미조치 fire 칩 일반화 → 19-legal 의 accentColor 4분기 + ResultBadge 4 라벨 + finding 상태 칩 2분기 모두 결과 status 토큰 매핑 패턴. status- prefix 없음 룰과 결합 → `border-l-{safe|warning|danger}-bar` / `bg-{safe|warning|danger}-bg text-{safe|warning|danger}`. 토큰 치환은 OQ #2 default OK, 임계치 + 라벨 1 byte 변경 금지.
6. **memory project_inspection_completion_rule 일반화 (★ 19-legal 특화 룰 2)** — isCpCompleted source of truth 일반화 → 19-legal 의 role admin 도구 분기 (FindingsPanel select+저장+보고서 + FindingDetailPanel 다운로드) + filterRounds 3분기 + sorted open-first + handleRoundClick isDesktop 분기 + TABS key/label mismatch 모두 운영 룰 source of truth. UI/시안에서 권한/분기/정렬 변경 금지.
7. **OQ 5건 default 답 명시** — sketch 진입 직전 컨펌 필요 항목 5건 + 각 default 답 명시 (사용자 별 의견 없으면 reasonable call). 단 "approved" 받기 전까지 W2 진입 금지 (memory `feedback_avoid_premature_confirmation`).

---

## Authentication Gates

None.

---

## Known Stubs

None — wave-1-index.md 는 documentation-only 인덱스 문서로, 코드 stub 없음. UI 가 없는 markdown 파일이라 데이터 와이어링 영역 자체 없음.

---

## Threat Flags

None — documentation-only 변경. 새 네트워크 endpoint / auth 경로 / 파일 접근 / 스키마 변경 0건. PLAN 의 threat_model 섹션도 없음 (디자인 wave 인덱스 작성).

---

## Files Created

- `cha-bio-safety/docs/redesign-context/19-legal/wave-1-index.md` (758 lines, 1 commit)

## Files Modified

None.

## Commits

- `5677764` — `docs(quick-260522-sa7): redesign/19-legal W1 인덱스 (wave-1-index.md 단일 산출 + LegalPage 571 lines 4영역 인벤토리 + 점검 chrome 직접 적용 케이스 + biz anchor 10건 + 4 sub-wave 분배 + OQ 5건 + 메모리 12건 inline)` — 1 file changed, 758 insertions(+)

---

## Next Step (사용자 컨펌 대기)

본 wave 산출 끝. W2 진입 = 사용자가 §7 OQ 5건 답변 + "approved" 명시 후 (memory `feedback_avoid_premature_confirmation`).

### §7 OQ 5건 default 답 요약 (사용자 확인 부탁)

| OQ | 항목 | default 답 |
|---|---|---|
| #1 | 모바일 자체 헤더 배경 `rgba(22,27,34,0.97)` | raised 유지 + alpha 0.97 보존 (16-workshift + 17-annual-plan + 02 + 28-splash + 23-education 5 페이지 일관) |
| #2 | accentColor 4분기 + ResultBadge map + finding 상태 칩 색 | status 토큰 치환 OK (status- prefix 없음) — `border-l-{safe\|warning\|danger}-bar` + `bg-{safe\|warning\|danger}-bg text-{safe\|warning\|danger}`. 4분기 + 4 라벨 + 2분기 1 byte 변경 금지. ResultBadge alpha 0.13/0.15 vs tokens.css 0.16 미세 차이 사용자 컨펌 후 결정. |
| #3 | §1.1 fontSize 9·10·11 위반 격상 | 격상 OK (text-caption(12) + leading-none) — 단 시각 균형 우려 시 부분 인라인 유지 가능 |
| #4 | 메인 CTA gradient + 빈/오류 아이콘 | (CTA) gradient OK (#1d4ed8, #0ea5e9) — 메인 CTA 한정, 작은 도구 button solid 유지 / (아이콘) 무 유지 (4 페이지 일관) — 사용자 컨펌으로 추가 가능 |
| #5 | Lucide back + Camera + Loader2 교체 + back 44x44 격상 | (1) ChevronLeft size={20} 교체 + 44x44 격상 OK / (2) Camera size={18} 교체 OK / (3) Loader2 animate-spin 교체 OK |

W2 진입 = 5건 OQ 답변 + "approved" 후. 권장 다음 명령:

```bash
/clear  # 컨텍스트 reset
/gsd:quick  # 새 quick task 시작 (W2 sketch-wave-2-chrome.html)
```

sub-route 페이지 (`/legal/:id` LegalFindingsPage @ App.tsx line 290 / `/legal/:id/finding/:fid` LegalFindingDetailPage @ line 291) 는 본 wave + W2~W5 범위 아님 — 별도 wave 에서 처리.
