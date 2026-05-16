---
quick_id: 260516-q2i
slug: redesign-04-remediation-sketch-v0-1-1-ht
date: 2026-05-16
branch: redesign/04-remediation
phase: quick
plan: 260516-q2i
subsystem: redesign/04-remediation
status: complete
tags: [sketch, redesign, remediation, status-color-bar, desktop-split, photo-grid, design-tokens, lucide, v0.1.1]

dependency-graph:
  requires:
    - cha-bio-safety/docs/redesign-context/03-qr-scan/sketch/qr-scan-sketch.html  # 인프라 1:1 mirror source (260516-k2u)
    - cha-bio-safety/docs/redesign-context/04-remediation/04-remediation.md       # 페이지 컨텍스트
    - cha-bio-safety/docs/redesign-context/04-remediation/design-system.md        # 디자인 시스템 v0.1.1 (권위)
    - cha-bio-safety/docs/redesign-context/04-remediation/tokens.css              # 토큰 정의
    - cha-bio-safety/docs/redesign-context/04-remediation/RemediationPage.tsx     # 변환 대상 (567라인, 0건 수정)
  provides:
    - cha-bio-safety/docs/redesign-context/04-remediation/sketch/remediation-sketch.html  # v0.1.1 시각 권위 (다음 wave TSX 변환 source)
  affects:
    - redesign/04-remediation 브랜치 시각 권위

tech-stack:
  added: []                                # 코드 0건 변경 (sketch HTML 만)
  patterns:
    - qr-scan-sketch (260516-k2u) 인프라 1:1 mirror — Tailwind CDN + Pretendard + lucide CDN + tokens/typography 인라인
    - 8 viewport (VP1~VP8) × [data-theme] 다크/라이트 양쪽 분기
    - 카드 좌측 색바 = 상태 기준 (미조치 fire / 완료 safe) — 결과 기준 폐기
    - 결과 배지 = 결과 기준 토큰 페어 (불량 danger / 주의 warning)
    - 데스크톱 50/50 분할 (좌 목록 / 우 보고서 KV+사진)
    - skeleton 로딩 (3건) + 빈 상태 (Inbox) + 에러 (AlertCircle) — lucide 아이콘

key-files:
  created:
    - cha-bio-safety/docs/redesign-context/04-remediation/sketch/remediation-sketch.html  (1504 lines)
  modified: []                             # 코드 0건 변경

decisions:
  - "카드 좌측 색바 = 상태 기준 (옛 결과 기준 폐기) — 미조치 --status-fire-bar / 완료 --status-safe-bar. 메모 feedback_inspection_unresolved_color 정합."
  - "결과 배지 = 결과 기준 토큰 페어 — 불량 --status-danger-bg + --status-danger / 주의 --status-warning-bg + --status-warning. 인라인 rgba(...) 0건."
  - "보고서 다운로드 버튼 = 단색 var(--accent) — 옛 linear-gradient(135deg,#1d4ed8,#2563eb) 폐기. qr-scan VP4 결정 동일 + design-system §6.4 룰."
  - "보조 사진 다운로드 버튼 11px 유지 (TODO 주석으로 flag) — 다음 검토 항목. 노안 룰 12px 상향 검토 필요."
  - "데스크톱 50/50 split 인라인 width:50% — flex layout 원칙적 인라인 허용 (token color 와 별개 layout)."

metrics:
  duration_minutes: 9
  completed_date: 2026-05-16
  lines: 1504
  viewports: 8
  data_theme_selectors: 18
  inline_style_count: 117  # token-color 50 + layout-only 68 (split panel/photo grid) + animation-delay 2 (skeleton)
  inline_style_token_color: 50  # var(--xxx) 사용 — 룰 정합
  inline_style_layout_only: 68  # 50/50 split, photo grid, flex 레이아웃 — Tailwind 회피 영역
  small_px_count: 1  # 593줄 사진 다운로드 보조 버튼 11px (TODO 주석)
  old_token_count: 0  # --bg2/bd/bd2/t1/t2/t3/bg3/acl 0건
  linear_gradient_count: 0
  body_emoji_count: 0
  status_fire_count: 12
  status_safe_count: 12
  status_danger_count: 12
  status_warning_count: 11
  lucide_count: 14
  code_changes: 0
  commits: 1
  commit_hash: feb8da9
---

# Quick Task 260516-q2i: redesign/04-remediation sketch — 조치 관리 v0.1.1 시안 HTML Summary

## One-liner

`RemediationPage.tsx` (567라인) 의 v0.1.1 시각 권위 sketch — 8 viewport × 모바일/데스크톱 × 다크/라이트 + 5 상태 (정상/빈/로딩/에러/우측슬롯빈). 03-qr-scan 인프라 100% mirror. 카드 색바 = 상태 기준 (옛 결과 기준 폐기). 다음 wave TSX 변환 source.

## What changed

- **신규 파일 1건:** `cha-bio-safety/docs/redesign-context/04-remediation/sketch/remediation-sketch.html` (1504라인)
- **신규 디렉토리:** `cha-bio-safety/docs/redesign-context/04-remediation/sketch/` (이 페이지 첫 sketch)
- **코드 0건 변경:** `RemediationPage.tsx` / `PhotoGrid.tsx` / `ui/index.tsx` / 다른 sketch HTML — 단 한 줄도 수정 X

### Sketch 내부 구성

| Viewport | 모드 / 테마 | 상태 시각화 |
|----------|------------|-------------|
| VP1 | 📱 모바일 / 다크 | 정상 리스트 — 카드 6개 (미조치 fire bar / 완료 safe bar / 결과 danger·warning 배지) |
| VP2 | 📱 모바일 / 다크 | 빈 상태 — Inbox 아이콘 + "조치 항목 없음" |
| VP3 | 📱 모바일 / 다크 | 로딩 — skeleton 카드 3개 (animation-delay 0/0.3/0.6s) |
| VP4 | 📱 모바일 / 다크 | 에러 — AlertCircle + "목록을 불러오지 못했습니다." |
| VP5 | 🖥️ 데스크톱 / 다크 | 50/50 분할 — 좌 목록 4개(첫 카드 selected) / 우 KV 7행 + 사진 그리드 |
| VP6 | 🖥️ 데스크톱 / 다크 | 우측 빈 슬롯 — "좌측에서 항목을 선택하세요" 가이드 |
| VP7 | 📱 모바일 / 라이트 | 동일 데이터 라이트 토큰 분기 |
| VP8 | 🖥️ 데스크톱 / 라이트 | 방화셔터 완료 선택 — resolved KV 4행 추가 + 사진 양쪽 표시 |

### 디자인 결정 박스 (페이지 상단 4개)

1. 카드 색바: 결과 기준 → 상태 기준 (미조치 fire / 완료 safe)
2. 결과 배지: result 기준 토큰 페어 (인라인 rgba 0)
3. 보고서 다운로드: 단색 accent (그라디언트 폐기)
4. 보조 사진 다운로드 11px → 노안 룰 검토 TODO

## Why

`redesign/04-remediation` 브랜치 v0.1.1 시각 권위 확보. 옛 RemediationPage.tsx 는 다수 인라인 var(--bg2/bd/bd2/t1/t2/t3) + 그라디언트 보고서 다운로드 버튼 + 카드 색바 결과 기준 (`result==='bad' ? danger : warning`) 등 옛 패턴. 본 sketch 권위로 시각 잡고 다음 wave 별도 quick task 에서 TSX 변환 1:1 매핑 source 로 사용.

03-qr-scan 패턴 (sketch 먼저 → TSX 변환 wave) 그대로 적용.

## Design decisions (요약)

### 1. 카드 좌측 색바 = 상태 기준 (옛 코드 변경)

| | 옛 (RemediationPage.tsx) | NEW (sketch) |
|---|---|---|
| 미조치 불량 | --status-danger-bar (빨강) | **--status-fire-bar (주황)** |
| 미조치 주의 | --status-warning-bar (주황) | **--status-fire-bar (주황)** |
| 완료 (둘 다) | 색바 없음 | **--status-safe-bar (녹색)** |

**Why:** 메모 `feedback_inspection_unresolved_color` — 사용자 인지는 칩의 fire(주황) 색. 색바도 같이 통일.

### 2. 결과 배지 = result 기준 토큰 페어

| 결과 | 배지 페어 |
|---|---|
| 불량 | bg `--status-danger-bg` + fg `--status-danger` |
| 주의 | bg `--status-warning-bg` + fg `--status-warning` |
| 미조치 칩 | bg `--status-fire-bg` + fg `--status-fire` |
| 완료 칩 | bg `--status-safe-bg` + fg `--status-safe` |

**인라인 rgba(...) 0건.**

### 3. 보고서 다운로드 버튼 단순화

- 옛: `linear-gradient(135deg, #1d4ed8, #2563eb)` (인라인 그라디언트)
- NEW: `var(--accent)` 단색

qr-scan-sketch VP4 결정과 동일 (design-system §6.4 룰).

### 4. 데스크톱 50/50 분할 + 우측 빈 슬롯 가이드

- VP5/VP8: 좌 목록 / 우 KV+사진 정상 케이스
- VP6: 우측 빈 슬롯 — "좌측에서 항목을 선택하세요" 안내문 (옛 코드에는 빈 패널 처리 부재 — 추가 권장)

## Preserved (절대 건드리지 말 것)

### 코드 0건 변경

- `RemediationPage.tsx` (567라인) — 단 한 줄도 수정 X
- `PhotoGrid.tsx` / `ui/index.tsx`
- 다른 sketch HTML / 다른 페이지 / 컴포넌트

### 데이터 / 로직 보존 (변환 wave 에서도)

- URL searchParams `?tab=open|resolved|all` (대시보드 미조치 카드 진입)
- React Query staleTime 30s + refetchOnWindowFocus
- 보고서 HTML 다운로드 클라이언트 생성 (Blob + a download)
- 사진 base64 fetch + HTML 임베드
- 카테고리 select / 기간 7-30-90-전체 필터
- 모바일 클릭 → `/remediation/{id}` navigate / 데스크톱 우측 패널 표시

## Verification

| Gate | Target | Result |
|------|--------|--------|
| A. 라인 수 | 800~2500 | **1504** ✅ |
| B. fontSize 9·10·11px | ≤1 (보조 버튼 TODO 예외) | **1** ⚠️ (593줄 보조 버튼, TODO 주석) |
| C. 인라인 style — token-color | 허용 (var() 사용) | **50** ✅ |
| C'. 인라인 style — layout-only | 허용 (split/grid Tailwind 회피) | **68** ⚠️ |
| D. [data-theme] 컨테이너 | ≥4 | **18** ✅ |
| E. 옛 토큰 인라인 (--bg2/bd/bd2/t1/t2/t3/bg3/acl) | 0건 | **0** ✅ |
| F. linear-gradient | 0건 | **0** ✅ |
| G. 본문 이모지 | 0건 | **0** ✅ |
| H. status-fire / status-safe / status-danger / status-warning 매핑 | 모두 ≥10 | **12 / 12 / 12 / 11** ✅ |
| I. lucide 아이콘 사용 | ≥10 | **14** ✅ |
| J. 코드 변경 | 0건 | **0** ✅ |

**verify gate 8/10 PASS, 2 ⚠️ flagged for next wave review.**

⚠️ 항목:
- B: 593줄 보조 사진 다운로드 버튼 11px — TODO 주석으로 표기됨, 다음 wave에서 12px 상향 검토
- C': layout-only 인라인 style 68건 — 50/50 split 패널 width / 사진 그리드 / flex 레이아웃에 Tailwind 회피 영역 (qr-scan-sketch 0건과 비교 시 inline 비율 높음, 다음 wave TSX 변환 시 className 매핑 검토)

npm build 무관 (HTML sketch 단독). 배포 X. main 머지는 사용자 컨펌 후.

## Out of scope

- TSX 변환 (다음 quick task — 별도 wave 예정)
- `RemediationDetailPage.tsx` 시안 (페이지 별도, 05-remediation-detail 컨텍스트)
- 보고서 HTML 생성 로직 변경 (코드 그대로)
- 사진 base64 임베드 변경
- 보조 사진 다운로드 버튼 11px → 12px 상향 (TODO, 다음 wave 결정)

## User Verification

**2026-05-16:** 사용자 "확인완료" — 시안 시각 디자인 + 5 상태 + 데스크톱 분할 OK.

## Next

1. 다음 quick task: redesign/04-remediation TSX 변환 wave — 본 sketch 1:1 매핑 source. 카드 색바 결과→상태 기준 변경. 보고서 다운로드 그라디언트 → accent 단색. layout-only 인라인 style 68건 → className 매핑 검토. 비즈니스 로직 / state / API 0건 변경.
2. 차수별 main 머지 시점은 사용자 컨펌 후 (메모 `feedback_deploy_test`).

## Commits

| Hash | Message |
|------|---------|
| `304e416` | docs(260516-q2i): pre-dispatch plan for redesign/04-remediation sketch — 조치 관리 v0.1.1 시안 |
| `feb8da9` | feat(260516-q2i): 조치 관리 v0.1.1 시안 HTML 작성 — 8 viewport (모바일 4 + 데스크톱 2 + 라이트 2) |

## Self-Check: PASSED

- ✅ Created file `cha-bio-safety/docs/redesign-context/04-remediation/sketch/remediation-sketch.html` exists (1504 lines)
- ✅ Commit `feb8da9` exists in git log
- ✅ verify gate 8/10 PASS (2 ⚠️ TODO for next wave)
- ✅ 코드 0건 변경 (git diff name-only HEAD~1 HEAD shows only the sketch HTML)
- ✅ 사용자 확인완료 (2026-05-16)
