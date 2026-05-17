---
phase: quick-260517-kup
plan: "01"
subsystem: redesign/08-elevator-finding-detail
tags: [sketch, elevator, finding-detail, redesign, design-tokens]
dependency_graph:
  requires:
    - "05-remediation-detail/sketch/remediation-detail-sketch.html (1:1 mirror 대상)"
    - "cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/tokens.css"
    - "cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/ElevatorFindingDetailPage.tsx (TSX 503 LOC)"
    - "cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md"
  provides:
    - "08 ElevatorFindingDetailPage 시안 HTML (4 viewport)"
    - "TSX 변환 단계 결정사항 확정 source"
  affects:
    - "cha-bio-safety/src/pages/ElevatorFindingDetailPage.tsx (TSX 변환 시)"
tech_stack:
  added: []
  patterns:
    - "05 remediation-detail-sketch.html 1:1 mirror (자체헤더+고정CTA+KVRow+사진뷰어)"
    - "v0.1.1 design-system 토큰 인라인 [data-theme] 패턴"
    - "inspection-modal-chrome-rules.md §2.1/§7.2 헤더 chrome"
key_files:
  created:
    - "cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/sketch/elevator-finding-detail-sketch.html"
  modified: []
decisions:
  - "미조치 배지 = text-status-fire bg-status-fire-bg (TSX 의 danger 교정 — memory: feedback_inspection_unresolved_color)"
  - "헤더 h-12 bg-surface-page (chrome 룰 §2.1 — TSX 의 rgba(22,27,34,0.97) 교정)"
  - "백 버튼 w-8 h-7 bg-surface-sunken border-border-default (chrome 룰 §7.2)"
  - "데스크톱 standalone card 720px (05 det-desktop-card mirror)"
metrics:
  duration: "35m"
  completed: "2026-05-17"
  tasks: 3
  files: 1
---

# 260517-kup — 08 ElevatorFindingDetailPage sketch SUMMARY

One-liner: "08 ElevatorFindingDetailPage 4 viewport 시안 HTML — fire/safe 배지 교정 + chrome 룰 h-12 적용, TSX 변환 준비 완료"

**브랜치:** redesign/06-floorplan-v2 worktree (sketch docs/ 만. TSX 변환 브랜치 `redesign/08-elevator-finding-detail` 은 사용자 컨펌 후 생성)
**산출물:** `cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/sketch/elevator-finding-detail-sketch.html`
**대상 페이지:** `src/pages/ElevatorFindingDetailPage.tsx` (503 LOC, `/elevator/findings/:fid`, BottomNav 숨김)
**스코프:** sketch HTML 만. TSX 변환은 사용자 컨펌 후 별도 quick.

---

## §A. Convention 확정 (기존 sketch 1:1 mirror)

| 항목 | 값 |
|---|---|
| 파일 경로 | `cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/sketch/elevator-finding-detail-sketch.html` |
| Mirror 대상 | 05 `remediation-detail-sketch.html` (자체 헤더 + 고정 CTA + KVRow + 사진 뷰어, 1152줄) |
| Chrome 룰 | 02+06 `inspection-modal-chrome-rules.md §2.1/§7.2` |
| Viewport 수 | 4 (VP1 모바일 다크 미조치 / VP2 모바일 다크 완료 / VP3 데스크톱 다크 미조치+picker / VP4 모바일 라이트 완료+다중사진) |
| Viewport 사이즈 | 모바일 393×852, 데스크톱 1280×720 (05 mirror) |
| 인프라 | Tailwind CDN + Pretendard CDN + JetBrains Mono CDN + Lucide CDN + `[data-theme]` 토큰 인라인 |
| CSS prefix | `.efnd-*` (elevator finding detail) |
| 파일 라인 수 | 1028줄 |

---

## §B. 시각 결정사항 — 헤더 / chrome

| 항목 | 결정 | 근거 |
|---|---|---|
| 헤더 높이 | `height: 48px` (= h-12) — 모바일 기본 | TSX 503 LOC line 219 `height:48` verbatim + 05 mirror |
| 데스크톱 헤더 높이 | `height: 54px` (VP3 적용) | 06 chrome 룰 §2.1 데스크톱 분기 `lg:h-[54px]` |
| 헤더 배경 | `background: var(--surface-page)` | inspection chrome 룰 §2.1 (TSX 의 rgba(22,27,34,0.97) 교정) |
| 헤더 border | `border-bottom: 1px solid var(--border-default)` | chrome 룰 §2.1 |
| 백 버튼 | `width:32px height:28px` (= w-8 h-7) + `bg:surface-sunken` + `border:border-default` + `rounded:8px` + `ChevronLeft size=15` | 06 chrome 룰 §7.2 (TSX 의 36×36 border-none 교정) |
| 헤더 타이틀 | `font-size:16px font-weight:700` (= text-body font-bold) + `color:text-primary` | chrome 룰 §2.3 |
| 클래스 | `.efnd-page-hd` / `.efnd-back-btn` / `.efnd-page-hd-title` | — |

---

## §C. 시각 결정사항 — 정보 영역 (지적 정보 / 지적 사진)

| 항목 | 결정 | 근거 |
|---|---|---|
| 섹션 padding | `padding: 20px 16px` | TSX line 270 verbatim |
| 섹션 구분선 | `border-bottom: 1px solid var(--border-default)` | TSX line 270 |
| SectionHeader | `font-size:12px font-weight:700 color:text-tertiary margin-bottom:10px letter-spacing:0.04em` | TSX SectionHeader 함수 verbatim |
| 섹션 헤더 행 | `display:flex align-items:center justify-content:space-between margin-bottom:12px` | TSX line 271 |
| **미조치 배지** | `background:var(--status-fire-bg) color:var(--status-fire)` + `border-radius:var(--radius-pill)` | **memory `feedback_inspection_unresolved_color` 적용 — TSX 의 danger(rgba(239,68,68,.12)) 교정** |
| 조치완료 배지 | `background:var(--status-safe-bg) color:var(--status-safe)` + `border-radius:var(--radius-pill)` | safe 페어 |
| 배지 공통 | `font-size:12px font-weight:700 padding:2px 8px line-height:1` | TSX font-size:10px → 12px 상향 (노안 12px 마지노선) |
| KVRow gap | `gap:12px` | TSX KVRow 함수 line 103 verbatim |
| KVRow label | `width:64px flex-shrink:0 font-size:12px color:text-tertiary line-height:1.5` | TSX KVRow label verbatim |
| KVRow value | `flex:1 font-size:14px color:text-primary line-height:1.5` | TSX KVRow value verbatim |
| KV list gap | `gap:8px` | TSX line 281 |
| 지적 사진 | `width:100% max-height:240px object-fit:cover border-radius:10px border:border-default cursor:pointer margin-top:12px` | TSX line 295~310 verbatim |
| 사진 없음 | `font-size:13px color:text-tertiary margin-top:8px` | TSX line 311 verbatim |
| 이미지 뷰어 진입 | 클릭 → fullscreen `zIndex:300 black 95% overlay` + 우상단 ✕ 24px white. **시안에서는 VP4 내 callout 으로 시각 결정만 명시.** 실제 핀치줌/패닝/더블탭 인터랙션은 TSX line 9~91 보존 | TSX ImageViewer 함수 |

---

## §D. 시각 결정사항 — 조치 입력 폼 (status='open')

| 항목 | 결정 | 근거 |
|---|---|---|
| 수리이력 선택 버튼 | `width:100% padding:10px 12px border-radius:8px bg:rgba(14,165,233,0.08) border:rgba(14,165,233,0.2) color:status-info font-size:12px font-weight:700` | TSX line 323 info 페어 |
| 수리이력 drawer | `bg:surface-sunken border-radius:8px padding:10px max-height:200px overflow-y:auto` | TSX line 328 verbatim |
| drawer 카드 | `padding:8px 10px border-radius:6px bg:surface-raised border:border-default` | TSX line 337~340 |
| drawer 카드 제목 | `font-size:13px font-weight:600 color:text-primary` | TSX line 339 (12px 아닌 13px 사용) |
| drawer 카드 부제 | `font-size:12px color:text-tertiary margin-top:2px` | TSX line 340 |
| "수리 이력이 없습니다" | `font-size:12px color:text-tertiary text-align:center padding:8px` | TSX line 330 |
| linkedRepair badge | `bg:status-safe-bg border:status-safe-bar border-radius:8px padding:8px 12px flex` | TSX line 346 safe-bg outline 페어 |
| linkedRepair 텍스트 | `font-size:13px` label `font-weight:700 color:status-safe` + value `color:text-primary` | TSX line 348~349 |
| 조치일 라벨 | `font-size:12px color:text-tertiary margin-bottom:4px` | TSX line 356 |
| 조치일 input | `width:100% padding:10px 12px border-radius:8px bg:surface-raised border:border-strong color:text-primary font-size:13px` | chrome 룰 §6.2 / TSX line 357~375 교정 |
| textarea | `width:100% bg:surface-raised border:border-strong border-radius:8px font-size:14px line-height:1.5 padding:12px resize:vertical` | chrome 룰 §6.2 / TSX line 378~396 |
| textarea placeholder | `color:text-tertiary` | — |
| 조치 사진 라벨 | `font-size:12px color:text-tertiary margin-bottom:4px` "조치 사진 (N/5)" | TSX line 399 verbatim |
| 사진 추가 버튼 | `width:72px height:72px border-radius:10px bg:surface-raised border:1px dashed border-strong font-size:12px flex-shrink:0` + Camera 아이콘 + "N/5" | TSX line 406~417 verbatim |
| 사진 썸네일 | `width:72px height:72px object-fit:cover border-radius:10px border:border-default flex-shrink:0` | TSX line 422~423 verbatim |
| 썸네일 ✕ 버튼 | `width:18px height:18px border-radius:50% bg:status-danger-bar color:#fff font-size:12px` (TSX 원본 10px → 12px 상향) | TSX line 423 / 노안 12px 마지노선 적용 |
| 사진 가로 스크롤 | `display:flex gap:8px overflow-x:auto` | TSX line 400 |

---

## §E. 시각 결정사항 — 고정 하단 CTA (status='open' only)

| 항목 | 결정 | 근거 |
|---|---|---|
| Wrapper position | `position:absolute bottom:0 left:0 right:0` (viewport-frame 내 절대 배치, 실제 TSX 는 fixed) | TSX line 470~479 / 시안 frame 내 절대 표현 |
| Wrapper bg | `background:var(--surface-page) border-top:1px solid var(--border-default)` | TSX line 475~476 |
| Wrapper padding | `padding:12px 16px` | TSX line 477 verbatim |
| safe-area 보정 | `padding-bottom: calc(12px + var(--sab, 0px))` — 시안에서는 정적 표현 | TSX line 478 |
| 버튼 높이 | `height:48px` (= h-12) | TSX line 485 verbatim |
| 버튼 배경 | `background:var(--accent)` 단색 — gradient 폐기 | TSX line 486 `--acl` → `--accent` |
| 버튼 색 | `color:var(--text-on-accent)` | TSX line 487 |
| 버튼 타이포 | `font-size:14px font-weight:700` | TSX line 488~489 |
| 버튼 border-radius | `border-radius:12px` | TSX line 490 |
| disabled | `opacity:0.5 cursor:not-allowed` | TSX line 491~493 |
| 버튼 텍스트 | "조치 완료" / (submitting: "처리 중...") | TSX line 497 verbatim |
| 본문 padding-bottom 보정 | `padding-bottom:72px` (= `.has-cta` 클래스) | TSX line 267 `calc(72px + var(--sab, 0px))` |

---

## §F. 시각 결정사항 — 조치 결과 (status='resolved')

| 항목 | 결정 | 근거 |
|---|---|---|
| 섹션 헤더 | "조치 결과" | TSX line 434 verbatim |
| KVRow × 3 | 조치일시 / 조치자 / 조치 내용 (`white-space:pre-wrap`) | TSX line 436~440 verbatim |
| 단일 조치 사진 | `width:100% max-height:240px object-fit:cover border-radius:10px border:border-default cursor:pointer margin-top:12px` | TSX line 446~449 |
| 다중 조치 사진 | `display:flex gap:6px flex-wrap:wrap margin-top:12px` + 각 `width:80px height:80px object-fit:cover border-radius:8px border:border-default cursor:pointer` | TSX line 453~459 verbatim |
| 하단 CTA | 없음 (resolved 는 본문만) | TSX line 468 분기 |
| 본문 padding-bottom | `24px` (resolved, CTA 없음) | TSX line 267 분기 |

---

## §G. 데스크톱 standalone card (VP3)

| 항목 | 결정 | 근거 |
|---|---|---|
| 외곽 shell | `display:flex align-items:center justify-content:center width:100% height:100% padding:24px bg:surface-page` | 05 `.det-desktop-shell` mirror |
| card 너비 | `width:720px max-height:100%` | 05 `.det-desktop-card` width:720px mirror |
| card 외관 | `bg:surface-raised border:border-default border-radius:16px overflow:hidden` | 05 mirror |
| 헤더 높이 | `height:54px` (데스크톱 분기) | 06 chrome 룰 §2.1 |
| 나머지 구조 | 모바일과 동일 (섹션/KVRow/조치폼/CTA) | — |

---

## §H. 사용자 검토 항목 (예 / 아니오 / 수정 후 진행)

1. **헤더 chrome** — `h-12 (48px) bg-surface-page` + 백 버튼 `w-8 h-7 bg-surface-sunken border` + 타이틀 `text-body font-bold` — 06 chrome 룰 mirror 진행 OK?
   - 참고: TSX 원본은 `height:48 bg:rgba(22,27,34,0.97)` 백 버튼 `36×36 border-none`. 룰 적용으로 모두 교정됨.

2. **미조치 배지 교정** — `text-status-fire bg-status-fire-bg` (주황) 으로 변경. TSX 원본은 `--danger` (빨강) 사용. memory 룰 `feedback_inspection_unresolved_color` 적용 OK?

3. **배지 font-size 상향** — TSX 원본 10px → 시안에서 12px (노안 마지노선). OK?

4. **KVRow label width** — `w-16 (64px)` 유지 — 모바일 393px 좁은 화면에서도 ok? (TSX 원본 64px verbatim)

5. **데스크톱 헤더 높이** — VP3 에서 `h-[54px]` 적용 (06 chrome 룰 데스크톱 분기). 모바일/데스크톱 `h-12` 통일 쪽이 낫다면 교체 가능.

6. **이미지 뷰어 표현** — 시안에서 VP4 내 callout 으로만 표시 (실제 fullscreen viewport 없음). fullscreen mock VP 1개 추가 필요한지?

7. **조치 사진 추가 버튼 크기** — 72×72 dashed (TSX 원본 verbatim). OK?

8. **수리이력 drawer 카드 폰트** — 제목 13px / 부제 12px (TSX 원본: 두 줄 모두 11px). 12px 마지노선 적용으로 상향. OK?

---

## §I. 다음 단계

§H 검토 항목에 응답 후 새 quick 으로 TSX 변환 진행 (브랜치 `redesign/08-elevator-finding-detail`):

- 시안 verbatim 적용 → `cha-bio-safety/src/pages/ElevatorFindingDetailPage.tsx` 교체
- 비즈니스 로직 100% 보존 (ImageViewer 핀치줌/패닝/더블탭 line 9~91 / useQuery / useMutation / handlePhotoAdd 5장 제한 / linkedRepair 자동 채움 흐름)
- 옛 var() 토큰 (`--bg`, `--bg2`, `--bg3`, `--bd`, `--bd2`, `--t1`, `--t2`, `--t3`, `--acl`, `--danger`, `--safe`) → v0.1.1 Tailwind utility 토큰
- Lucide 아이콘 `ChevronLeft / Camera / Wrench / X / Check` 적용 (이모지 📷 교체)
- `npm run build` PASS + 시각 검수
- 배지 danger → fire 교정이 핵심 (1곳, TSX line 276~277)

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] 배지 font-size 10px → 12px 상향**
- **Found during:** Task 2 자체 검수
- **Issue:** TSX 원본 line 274의 `fontSize:10` 이 배지에 적용됨. 노안 친화 12px 마지노선 위반.
- **Fix:** 시안에서 `font-size:12px` 으로 교정. TSX 변환 시도 동일하게 적용.
- **Files modified:** sketch HTML
- **Commit:** fefd771

**2. [Rule 1 - Bug] 썸네일 ✕ 버튼 font-size 10px → 12px 상향**
- **Found during:** Task 2 자체 검수 grep
- **Issue:** TSX 원본 line 423의 `fontSize:10` (18×18 삭제 버튼). 노안 규칙 위반.
- **Fix:** 시안에서 `font-size:12px` 으로 교정.
- **Files modified:** sketch HTML
- **Commit:** fefd771

**3. [Rule 2 - Missing] TSX 의 `--danger` 미조치 배지 → `--status-fire` 교정**
- **Found during:** Task 2 (memory `feedback_inspection_unresolved_color` 룰 적용)
- **Issue:** ElevatorFindingDetailPage.tsx line 276~277 은 미조치를 `--danger` (빨강) 으로 표시 — 통일 룰 위반.
- **Fix:** 시안에서 `text-status-fire bg-status-fire-bg` (주황) 으로 선적용. TSX 변환 시 동일 교정 필요.
- **Files modified:** sketch HTML
- **Commit:** fefd771

**None** — plan 이외 architectural 변경 없음.

---

## Self-Check: PASSED

- sketch HTML 파일 존재: `cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/sketch/elevator-finding-detail-sketch.html` FOUND
- commit fefd771 존재: FOUND
- 4 viewport 표현: VP1(모바일다크미조치) VP2(모바일다크완료) VP3(데스크톱다크미조치+picker) VP4(모바일라이트완료+다중사진) CONFIRMED
- 옛 var() 토큰 0건: grep PASS
- 9·10·11px 0건: grep PASS
- §A~§I 모두 작성: CONFIRMED
- §H 사용자 검토 항목 8개: CONFIRMED
