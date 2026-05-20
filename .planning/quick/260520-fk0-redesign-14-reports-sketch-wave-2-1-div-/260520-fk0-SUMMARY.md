---
phase: quick-260520-fk0
plan: 01
type: execute
wave: 2
status: complete
completed_at: 2026-05-20
commit: c78769c
files_created:
  - cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-2-mobile-header-card.html
files_modified: []
src_touched: false
wrangler_invoked: false
deploy_invoked: false
worktree_rule: PASS
---

# redesign/14-reports W2 — 모바일 헤더 + DIV early 카드 sketch SUMMARY

## 1. 산출물

| 항목 | 값 |
|---|---|
| 파일 | `cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-2-mobile-header-card.html` (절대 경로: `/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-2-mobile-header-card.html`) |
| 라인 수 | 738 (PLAN min_lines 400 충족) |
| commit | `c78769c` (atomic 1-commit, redesign/14-reports 브랜치) |
| src 변경 | 0 |
| 명령 0건 (워크트리 룰) | wrangler 0 / 직원도메인 배포 명령 0 |

## 2. Frame matrix (시각 component instances)

| frame | 헤더 | 카드 enabled | 카드 loading | 합계 |
|---|---|---|---|---|
| 다크 (393px) | 1 | 1 | 1 | 3 |
| 라이트 (393px) | 1 | 1 | 1 | 3 |
| **합계** | **2** | **2** | **2** | **6 instances** |

## 3. verify gate 15건 결과

| # | gate | 기대 | 실측 | 결과 |
|---|---|---|---|---|
| G1 | 다운로드 글리프 (U+2B07) | =0 | 0 | PASS |
| G2 | `linear-gradient` | =0 | 0 | PASS |
| G3 | `text-status-` / `bg-status-` prefix Tailwind | =0 | 0 | PASS |
| G4 | 가운뎃점 ` · ` 텍스트 (comment 제외) | =0 | 0 | PASS |
| G5 | `w-8` / `h-8` 본문 (comment+메모리 룰 제외) | =0 | 0 | PASS |
| G6 | `font-size: 10px` / `font-size: 11px` | =0 | 0 | PASS |
| G7 | 기타 이모지 (📄 ✅ ❌ ⚠️ ⚙️) | =0 | 0 | PASS |
| G8 | ChevronLeft SVG | ≥2 | 2 | PASS |
| G9 | Download SVG | ≥2 | 2 | PASS |
| G10 | `dot-meta` span | ≥4 | 5 | PASS |
| G11 | `var(--status-safe-bar)` (다운로드 버튼) | ≥2 | 3 | PASS |
| G12 | text-body font-bold 다운로드 라벨 | ≥2 | 4 (각 frame 2 버튼, inline CSS `font-size: 16px; font-weight: 700`) | PASS |
| G13 | dual frame (`data-theme="dark"` + `"light"`) | ≥2 | 6 | PASS |
| G14 | 메모리 룰 unique `feedback_*.md` | ≥7 | 7 | PASS |
| G15 | enabled + disabled state (`생성 중...` ≥1 + `엑셀 다운로드` ≥2) | OK | loading=4, 엑셀=4 | PASS |

**총: 15 / 15 PASS** (negative 7 + positive 8).

## 4. W1 LOCKED 5건 적용 매트릭스

| OQ | W1 LOCKED 답 | W2 적용 | 위치 |
|---|---|---|---|
| #1 모바일 카드 그라데이션 폐기 | `bg-safe-bar` solid | **적용** | 다크/라이트 카드 enabled 버튼 (`var(--status-safe-bar)`) |
| #2 데스크톱 좌측 260px 유지 | 260 유지 | (W5 scope, W2 미해당) | — |
| #3 데스크톱 일괄 다운로드 그라데이션 폐기 | `bg-safe-bar` solid | (W4 scope, W2 미해당) | — |
| #4 모바일 footer 카피 유지 | verbatim 유지 | (W3 scope, W2 미해당) | — |
| #5 sub 라인 dot span | `<span class="dot-meta"></span>` | **적용** | 다크/라이트 카드 4매 모두 sub 라인 |

## 5. 메모리 룰 박제 7건 (file 위치)

| # | 룰 슬러그 | 박제 위치 | 14-reports 컨텍스트 적용 |
|---|---|---|---|
| 1 | `feedback_design_sketch_first.md` | 헤더 comment line 27 | 본 sketch 가 W3 진입 전 단일 카드 패턴 컨펌용 |
| 2 | `feedback_sketch_realistic_data.md` | 헤더 comment line 31 | REPORT_CARDS[0].title/sub verbatim 보존 |
| 3 | `feedback_planner_prompt_sketch_verbatim.md` | 헤더 comment line 36 | W7 변환 wave 에 sketch CSS 그대로 인용 예정 |
| 4 | `feedback_tailwind_token_class_pattern.md` | 헤더 comment line 40 | `bg-safe-bar` 패턴 (prefix 없는 짧은 alias) |
| 5 | `feedback_tailwind_w8_h8_is_48px.md` | 헤더 comment line 44 | iconBtn 34x34 / navBtn 28x28 source verbatim 보존 |
| 6 | `feedback_tsx_wave_emoji_dot_gap.md` | 헤더 comment line 49 + frame inline (다운로드 글리프 폐기) | 이모지 0 / dot span 패턴 |
| 7 | `feedback_text_caption_leading_none.md` | 헤더 comment line 54 + CSS leading-none helper line 279 | sub + year-label + year-nav-btn `line-height: 1` |

(전체 unique 슬러그 7건, 일부는 본문에 추가 인용도 있음.)

## 6. W3 진입 전 OQ 3건 (sketch 안 default 답 명시)

| # | 질문 | default 답 | 근거 |
|---|---|---|---|
| W2 OQ #1 | W2 안에 데스크톱 1280px placeholder 둘지? | **미배치** | 데스크톱은 W4~W6 책임. W2 = 모바일 검증 집중 |
| W2 OQ #2 | 카드에 진행률/완료 status 칩 둘지? | **미배치** | ReportsPage 는 점검 페이지 아님. 카드 = 제목+sub+버튼 단순 구조 |
| W2 OQ #3 | 모바일 카드 hover/press state 시각화? | **미배치** | 모바일은 hover 없음. 데스크톱 카드 hover/press 는 W5 책임 |

## 7. 노안 격상 매핑

| 영역 | source fontSize | sketch 격상 후 | 기준 |
|---|---|---|---|
| 헤더 타이틀 | 14px (line 337) | **18px** (text-title) | W1 §2.1 W2 행 + design-system §2.7 |
| 연도 라벨 | 13px (line 346) | **14px** (text-body-sm) | 마이그레이션 룰 §4.2 |
| 카드 제목 | 13px (line 359) | **16px** (text-body, 마지노선) | design-system §1.1 |
| sub 라인 | 11px (line 360) | **12px** (text-caption) | 9·10·11px 금지 룰 (mig 룰 §4.2) |
| 버튼 라벨 | 12px (line 372) | **16px** (text-body) | design-system §1.1 마지노선 |

## 8. Source verbatim 보존 확인

ReportsPage.tsx 비즈 데이터 / 카피 / 시그니처 변경 0건:

| source line | 보존 항목 | sketch 매핑 |
|---|---|---|
| line 13 | REPORT_CARDS[0].title "월초 유수검지 장치 점검표" | 다크/라이트 4매 카드 모두 verbatim |
| line 13 | REPORT_CARDS[0].sub "DIV · 34개소" | dot span 변환 (가운뎃점 텍스트 → dot 4x4) |
| line 332 | `useNavigate(-1)` | 백 버튼 `aria-label="뒤로"` |
| line 318 | `useState(year)` initial = CURRENT_YEAR (2026) | 라벨 "2026년" |
| line 342 | `year > MIN_YEAR` 분기 | 좌측 slot `‹` 노출 |
| line 348 | `year < CURRENT_YEAR` 분기 | 우측 slot 비움 (2026 = CURRENT) |
| line 374 | `loading === card.type ? '생성 중...' : '⬇ 엑셀 다운로드'` | variant 2 패턴 (텍스트 라벨 분기) |
| line 380 | footer 카피 | (W3 scope, 본 wave 미포함) |
| line 388 | iconBtn 34x34 | back-btn `width:34px; height:34px` |
| line 394 | navBtn 28x28 | year-nav-btn `width:28px; height:28px` |

## 9. 워크트리 룰 (CLAUDE.local.md) 준수 확인

| 룰 | 결과 |
|---|---|
| `cha-bio-safety/src/**` 변경 0 | PASS (`git diff --name-only HEAD~ HEAD -- cha-bio-safety/src` 0 lines) |
| `migrations/**` 변경 0 | PASS |
| `functions/**` 변경 0 | PASS |
| `scripts/**` 변경 0 | PASS |
| `ReportsPage.tsx` / `ExcelPreview.tsx` / `App.tsx` 손대지 않음 | PASS |
| 다른 페이지 (13-schedule / 02 / 06 등) 영향 0 | PASS (커밋 1개 file 만 변경) |
| wrangler 명령 0건 | PASS (실행 0건, `.claude/settings.local.json` deny) |
| 직원 도메인 배포 경로 명령 0건 | PASS |
| 평면(flat sibling) 폴더 구조 (sketch/ 서브폴더 X) | PASS (`14-reports/sketch-wave-2-*.html`) |

## 10. 다음 단계

1. 사용자 W2 시각 컨펌 (HTML 파일 열어서 다크/라이트 393px frame 확인)
2. W2 OQ 3건 default 답 컨펌 또는 조정
3. 컨펌 후 → W3 진입 (모바일 카드 그리드 10종 + footer, `sketch-wave-3-mobile-card-list.html`)

## Self-Check: PASSED

- 파일 존재: `cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-2-mobile-header-card.html` (FOUND)
- 커밋 hash: `c78769c` (FOUND in git log)
- 라인 수: 738 (≥400)
- verify gate: 15/15 PASS
- src 변경 0 / 워크트리 룰 100% 준수
