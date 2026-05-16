---
quick_id: 260516-rhl
slug: redesign-05-remediation-detail-sketch-v0
date: 2026-05-16
branch: redesign/05-remediation-detail
phase: quick
plan: 260516-rhl
subsystem: redesign/05-remediation-detail
status: complete
tags: [sketch, redesign, remediation-detail, status-color-bar, det-picker, photobutton, admin-actions, design-tokens, lucide, v0.1.1]

dependency-graph:
  requires:
    - cha-bio-safety/docs/redesign-context/04-remediation/sketch/remediation-sketch.html  # paired page (feb8da9, 260516-q2i) — 디자인 결정 1:1 mirror
    - cha-bio-safety/docs/redesign-context/03-qr-scan/sketch/qr-scan-sketch.html          # 인프라 mirror (260516-k2u)
    - cha-bio-safety/docs/redesign-context/05-remediation-detail/05-remediation-detail.md
    - cha-bio-safety/docs/redesign-context/05-remediation-detail/design-system.md         # v0.1.1 권위
    - cha-bio-safety/docs/redesign-context/05-remediation-detail/tokens.css
    - cha-bio-safety/docs/redesign-context/05-remediation-detail/RemediationDetailPage.tsx  # 변환 대상 (594줄, 0건 수정)
  provides:
    - cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html  # v0.1.1 시각 권위 (다음 wave TSX 변환 source)
  affects:
    - redesign/05-remediation-detail 브랜치 시각 권위

tech-stack:
  added: []                                # 코드 0건 변경 (sketch HTML 만)
  patterns:
    - 03-qr-scan + 04-remediation sketch 인프라 1:1 mirror (Tailwind CDN + Pretendard + lucide UMD + tokens/typography 인라인)
    - 6 viewport × 2 status (open/resolved) × 다크/라이트
    - 5종 조치 피커 (유도등 3opt / 소화기 3opt / 소화전 4opt-tight / 방화셔터 / 전실제연댐퍼) + 자탐 textarea-only fallback
    - admin 전용 액션 영역 (조치 취소 warning-outline + 점검 기록 삭제 danger-outline)
    - 자체 헤더 48px + ChevronLeft + "조치 상세" (BottomNav 숨김 페이지)

key-files:
  created:
    - cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html  (1152 lines)
  modified: []

decisions:
  - "04-remediation sketch (feb8da9) 와 배지 페어 1:1 동일 — 결과: 불량 --status-danger-{bg,fg} / 주의 --status-warning-{bg,fg}, 상태: 미조치 --status-fire-{bg,fg} / 완료 --status-safe-{bg,fg}. paired-page 일관성 (04=목록, 05=상세)."
  - "CTA 단색 var(--accent) (그라디언트 0건) — 04 / qr-scan 결정 mirror."
  - "노안 룰 마지노 12px — 1건 의도된 예외: det-picker.tight 4-옵션 소화전 (line 392, 11px). 옵션 4개 가로 배치 위한 폭 절감."
  - "admin 액션 색 구분 — 조치 취소 = warning-bar outline (취소는 경고 의미), 점검 기록 삭제 = danger-bar outline (파괴적 액션)."
  - "5종 피커 + 자탐 textarea-only fallback — 비즈니스 로직 useEffect 5개 (메모 reference_inspection_remediation_automation_pattern) 보존 룰 그대로."

metrics:
  duration_minutes: 15
  completed_date: 2026-05-16
  lines: 1152
  viewports: 6
  data_theme_selectors: 14
  viewport_mobile: 5
  viewport_desktop: 3
  inline_style_count: 12  # token-color 8 + layout-only 4 (KV border-bottom:none)
  inline_style_token_color: 8
  inline_style_layout_only: 4
  small_px_count: 1  # 392줄 det-picker.tight 11px (의도된 예외, 소화전 4-옵션)
  old_token_count: 0  # --bg/--bg2/--bg3/--bd/--bd2/--t1~3/--acl 실제 사용 0건 (line 530 문서화 주석 1건은 false positive)
  linear_gradient_count: 0
  body_emoji_count: 0
  status_fire_count: 10
  status_safe_count: 10
  status_danger_count: 12
  status_warning_count: 11
  lucide_count: 27
  code_changes: 0
  commits: 1
  commit_hash: 0c6315e
---

# Quick Task 260516-rhl: redesign/05-remediation-detail sketch — 조치 상세 v0.1.1 시안 HTML Summary

## One-liner

`RemediationDetailPage.tsx` (594라인) 의 v0.1.1 시각 권위 sketch — 6 viewport × 2 status (open/resolved) × 다크·라이트. 04-remediation sketch (feb8da9) paired-page 디자인 결정 1:1 mirror. 5종 조치 피커 + admin 전용 액션 영역 + 자체 헤더. 다음 wave TSX 변환 source.

## What changed

- **신규 파일 1건:** `cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html` (1152라인)
- **신규 디렉토리:** `cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/` (이 페이지 첫 sketch)
- **코드 0건 변경:** `RemediationDetailPage.tsx` (594줄) / `PhotoButton.tsx` / `ui/index.tsx` / 04-remediation sketch / 다른 페이지 — 단 한 줄도 수정 X

### Sketch 내부 구성

| Viewport | 모드 / 테마 | 상태 시각화 |
|----------|------------|-------------|
| VP1 | 📱 모바일 / 다크 | open 불량×미조치 (유도등 증상 피커 3opt + 자재 input + PhotoButton + det-cta) |
| VP2 | 📱 모바일 / 다크 | open 주의×미조치 (자탐 — textarea-only fallback, 피커 없음) |
| VP3 | 📱 모바일 / 다크 | resolved 불량×완료 (조치 완료 4 KV + after 사진 + admin 액션 2) |
| VP4 | 📱 모바일 / 다크 | open variant (소화전 4-옵션 tight 피커, 11px 의도된 예외) |
| VP5 | 🖥️ 데스크톱 / 다크 | open |
| VP6 | 🖥️ 데스크톱 / 라이트 | resolved (라이트 토큰 분기) |

## Why

`redesign/05-remediation-detail` 브랜치 v0.1.1 시각 권위 확보. 04-remediation 페이지와 짝 (04=목록, 05=상세) — 배지 페어/CTA 단색/노안 룰 모두 04 결정과 일관 유지.

옛 RemediationDetailPage.tsx 는 다수 인라인 var(--bg2/bd/bd2/t1/t2/t3) + 인라인 rgba 배지 색 + 그라디언트 CTA 등 옛 패턴. 본 sketch 권위로 시각 잡고 다음 wave 별도 quick task 에서 TSX 변환 1:1 매핑 source 로 사용.

03-qr-scan / 04-remediation 패턴 (sketch 먼저 → TSX 변환 wave) 그대로 적용.

## Design decisions (요약)

### 1. 04-remediation sketch 배지 페어 1:1 동일

| 배지 | 페어 (bg + fg) |
|---|---|
| 결과 불량 | `--status-danger-bg` + `--status-danger` |
| 결과 주의 | `--status-warning-bg` + `--status-warning` |
| 상태 미조치 | `--status-fire-bg` + `--status-fire` |
| 상태 완료 | `--status-safe-bg` + `--status-safe` |

인라인 rgba 0건 (옛 line 348-351 인라인 색 폐기).

### 2. CTA = 단색 `var(--accent)` (그라디언트 0)

04 / qr-scan 결정 동일. design-system §6.4 룰.

### 3. admin 전용 액션 영역

| 액션 | 색 | 의미 |
|---|---|---|
| 조치 취소 | `--status-warning-bar` outline | 경고 — resolved 상태 되돌리기 |
| 점검 기록 삭제 | `--status-danger-bar` outline | 파괴적 액션 — 데이터 영구 삭제 |

### 4. 5종 조치 피커 + 자탐 textarea-only fallback

비즈니스 로직 useEffect 5개 (메모 `reference_inspection_remediation_automation_pattern` — 유도등/소화기/소화전/방화셔터/전실제연댐퍼 자동화 5종 카테고리) 보존 룰 그대로. 카테고리에 따라 옵션 표시:
- 유도등 3opt / 소화기 3opt / 소화전 4opt-tight (가로 배치, 11px 의도된 예외) / 방화셔터 / 전실제연댐퍼
- 그 외 카테고리 = textarea-only (자탐 등)

### 5. 노안 룰 마지노 12px — 1건 의도된 예외

`det-picker.tight .det-picker-opt { font-size: 11px; }` (line 392) — 소화전 4-옵션 가로 배치 폭 절감 위한 의도. `cat-box-mute` 주석으로 명시.

### 6. 자체 헤더 48px + BottomNav 숨김

ChevronLeft + "조치 상세" — 상세 페이지는 BottomNav 숨김 (모달-like).

## Preserved (절대 건드리지 말 것)

### 코드 0건 변경

- `RemediationDetailPage.tsx` (594라인) — 단 한 줄도 수정 X
- `PhotoButton.tsx` / `ui/index.tsx`
- 다른 sketch HTML / 다른 페이지 / 컴포넌트

### 데이터 / 로직 보존 (변환 wave 에서도)

- URL `/remediation/{id}` route param (대시보드 미조치 / 04 목록 카드에서 진입)
- React Query `useQuery` / `useMutation` (조치 저장 / 조치 취소 / 점검 기록 삭제)
- 5종 조치 피커 useEffect 자동화 로직
- PhotoButton 사진 업로드 mutation
- admin 권한 분기 (`useAuthStore.role === 'admin'`)
- 보고서 다운로드 (04 paired)
- `record.memo` 통합 필드 (메모 `reference_check_records_memo_unified`)

## Verification

| Gate | Target | Result |
|------|--------|--------|
| A. 라인 수 | 800~2500 | **1152** ✅ |
| B. fontSize 9·10·11px | ≤1 (det-picker.tight 예외) | **1** ⚠️ (line 392, 의도된 예외) |
| C. 인라인 style — token-color | 허용 (var() 사용) | **8** ✅ |
| C'. 인라인 style — layout-only | 허용 (KV border-bottom:none 4건) | **4** ✅ |
| D. [data-theme] 컨테이너 | ≥4 | **14** ✅ |
| E. viewport-mobile | ≥4 | **5** ✅ |
| F. viewport-desktop | ≥2 | **3** ✅ |
| G. 옛 토큰 (--bg2/bd/bd2/t1/t2/t3/bg3/acl) 실사용 | 0건 | **0** ✅ (line 530 문서화 주석 1건은 false positive) |
| H. linear-gradient | 0건 | **0** ✅ |
| I. 본문 이모지 | 0건 | **0** ✅ |
| J. status 페어 매핑 (fire/safe/danger/warning) | 각 ≥8 | **10 / 10 / 12 / 11** ✅ |
| K. lucide 아이콘 | ≥10 | **27** ✅ |
| L. 코드 변경 | 0건 | **0** ✅ |

**verify gate 11/12 PASS, 1 ⚠️ 의도된 예외 (det-picker.tight 11px).**

npm build 무관 (HTML sketch 단독). 배포 X. main 머지는 사용자 컨펌 후.

## Out of scope

- TSX 변환 (다음 quick task — 별도 wave 예정)
- 데스크톱 마스터-디테일 구조 (05는 상세 페이지 단독 — 04 데스크톱 우측 패널 케이스는 04에서 처리)
- 보고서 다운로드 버튼 (04와 페어 — 04에서 처리)
- PhotoButton 자체 디자인 변경 (컴포넌트 본체는 별도 wave 후보)

## User Verification

**2026-05-16:** 사용자 "확인 완료" — 시안 시각 디자인 + 2 status (open/resolved) + 5종 피커 + admin 액션 OK.

## Recovery Notes

Worktree 격리 중 executor 의 sketch 커밋 `0c6315e` 가 worktree 브랜치 (`worktree-agent-a40683a42909a0c6c`) 에만 landing. 정리 시 worktree branch -D 으로 ref 가 사라졌으나 commit 객체는 reflog 에 잔존 → `git merge --ff-only 0c6315e` 로 redesign/05-remediation-detail 에 fast-forward 복구. 결과 정상. SUMMARY.md 는 worktree 정리 시 uncommitted 로 사라져 본 문서로 재작성.

## Next

1. 다음 quick task: redesign/05-remediation-detail TSX 변환 wave — 본 sketch 1:1 매핑 source. 인라인 var(--bg2/bd/bd2/t1~3) 모두 v0.1.1 토큰 + Tailwind 교체. 5종 피커 useEffect / PhotoButton mutation / admin 권한 분기 0건 변경.
2. 차수별 main 머지 시점은 사용자 컨펌 후 (메모 `feedback_deploy_test`).

## Commits

| Hash | Message |
|------|---------|
| `d476400` | docs(260516-rhl): pre-dispatch plan for redesign/05-remediation-detail sketch — 조치 상세 v0.1.1 시안 |
| `0c6315e` | docs(redesign-05-remediation-detail): v0.1.1 sketch — 6 viewport (모바일 4 + 데스크톱 2) |

## Self-Check: PASSED

- ✅ Created file `cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html` exists (1152 lines)
- ✅ Commit `0c6315e` reachable + ff-merged to redesign/05-remediation-detail
- ✅ verify gate 11/12 PASS (1 ⚠️ 의도된 예외)
- ✅ 코드 0건 변경
- ✅ 사용자 확인완료 (2026-05-16)
