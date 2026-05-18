---
phase: 260518-kgo
plan: 01
subsystem: 12-staff-service
tags: [redesign, sketch, w5, bottomsheet, staff-service]
requires:
  - sketch/04-menu-cards-sketch.html (W4 chrome 패턴)
  - sketch/03-legend-summary-sketch.html (W3 stat-card 패턴)
  - tokens.css line 16~172 (v0.1.0 토큰)
  - typography.css line 33~95 (type scale)
provides:
  - sketch/05-bottomsheet-sketch.html (8 viewport × 6 sub-region BottomSheet 시안)
affects:
  - 다음 wave (W6 또는 TSX 변환 wave)
tech-stack:
  added: []
  patterns:
    - 8-viewport matrix (6 dark + 2 light)
    - 6 sub-region 시각 분할 (헤더 / 휴가 섹션 / 차단 카피 / 팀원 chips / 주말식대 / 닫기)
    - calendar dim placeholder + sheet 최종 상태 렌더링
key-files:
  created:
    - cha-bio-safety/docs/redesign-context/12-staff-service/sketch/05-bottomsheet-sketch.html
  modified: []
decisions:
  - 휴가신청 CTA 활성 색 = status-safe (행동의 의미 = 정상/완료 컨텍스트, source #22c55e 의미 정합)
  - 휴가 등록 chip = status-safe-bg + status-safe + 2px status-safe-bar border (등록 = 완료 의미)
  - 팀원 공가 (official) suffix = status-info (UI-SPEC §3.4.1 분류 정보)
  - 팀원 연차 (annual) suffix = status-safe (정상 컨텍스트)
  - 주말식대 보라 = 카테고리 색 (status 아님), 정규화 #8f42d7 인라인 유지
  - 일수 표시 #facc15 (gold) raw hex 예외 유지 (UI-SPEC §14 OQ #4)
  - U+2713 ✓ 텍스트 유지 (Dingbats 범위, 플랜 명시 emoji range U+1F300~U+1FAFF 외 → 통과)
  - source 인라인 #2563eb (PDF) → var(--accent) 흡수
  - input 배경 var(--bg) → var(--surface-sunken) 격상 (시인성)
metrics:
  duration: ~25분
  completed: 2026-05-18
---

# 260518-kgo Plan 01: W5 BottomSheet Sketch Summary

W5 sketch 단일 HTML (50,115 bytes) 으로 StaffServicePage BottomSheet 의 6 sub-region × 8 viewport 매트릭스 시각 고정 — alias / OLD categorical hex / 긴급-톤 / 9·10·11px 0건 룰 강제 통과.

## 작업 내역

- 단일 파일 작성: `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/05-bottomsheet-sketch.html`
- W4 (04-menu-cards-sketch.html) 의 chrome 패턴 (`:root` verbatim / `frame-mobile` 393px / body padding 32 / h1+p.lead) 그대로 계승
- BottomSheet 는 모바일 전용 (UI-SPEC §4.3) → `frame-desktop` 불필요
- 8 viewport = 6 dark (정상 / 등록완료 / 주말차단 / 공휴일차단 / 점검경고+끼수 / 풀표시) + 2 light (정상 / 풀표시)
- 6 sub-region = (A) 헤더 + (B) 휴가 섹션 + (C) 팀원 chips + (D) 주말 식대 + (E) 닫기 + 드래그 핸들

## Grep 게이트 결과 (all pass)

| Gate | 임계치 | 실제 |
|------|--------|------|
| file 존재 + HTML5 doctype | OK | OK (50,115 bytes) |
| font-size 9·10·11px | = 0 | 0 |
| status-fire / text-fire / bg-fire / --fire | = 0 | 0 |
| alias 토큰 var(--bg/--bg2/.../--c-leave) 본문 | = 0 | 0 |
| OLD 카테고리 hex (6종) 본문 | = 0 | 0 |
| #facc15 (일수 gold) | ≥ 1 | 5 |
| #8f42d7 (정규화 보라 주말식대) | ≥ 1 | 7 |
| frame-mobile 사용 | = 8 | 8 |
| data-theme="dark" / "light" | ≥ 2 / ≥ 1 | 6 / 4 (frames + sections) |
| 닫기 텍스트 | ≥ 8 | 15 |
| 휴가 텍스트 | ≥ 8 | 39 |
| 등록이 불가합니다 | ≥ 2 | 5 |
| 팀원 연차 | ≥ 2 | 5 |
| 주말 식대: ₩48,500 | ≥ 2 | 4 |
| 소방 점검일 - 휴가 등록 주의 | ≥ 1 | 2 |
| 휴가 신청 / 휴가신청서 다운로드 | ≥ 1 / ≥ 1 | 6 / 5 |
| --status-safe / -warning / -danger / -info | ≥ 2 / 2 / 1 / 1 | 13 / 12 / 9 / 8 |
| --duty-day / -night / -off / -leave | ≥ 1 each | 3 / 3 / 3 / 3 |
| `sketch W5` in title | exists | OK |

emoji 범위 U+1F300~U+1FAFF (플랜 spec) = 0건. U+2713 ✓ 는 Dingbats (U+2700~U+27BF) 로 플랜에서 예외 명시 → 의도된 통과.

## Per-VP 상태 매트릭스 (8 viewports)

| VP | 테마 | 시나리오 | shift 칩 | 식사 미사용 | 휴가 섹션 | 팀원 | 주말식대 |
|----|------|----------|----------|-------------|-----------|------|----------|
| VP1 | dark | 5/18 (월) · 평일 정상 폼 | duty-night 당직 | hidden | 빈 폼 + 비활성 CTA + PDF | hidden | hidden |
| VP2 | dark | 5/18 (월) · 휴가 등록 완료 | duty-night 당직 | 1끼 (warning) | 연차 ✓ 등록 (safe), CTA 비활성 | hidden | hidden |
| VP3 | dark | 5/16 (토) · 주말 차단 | duty-leave 휴무 | hidden | 차단 카피 (주말) | hidden | ₩48,500 |
| VP4 | dark | 5/5 (월) · 공휴일 차단 | duty-leave 휴무 + danger 어린이날 | hidden | 차단 카피 (어린이날) | hidden | hidden |
| VP5 | dark | 5/20 (수) · 점검일 경고 + 2끼 | duty-day 주간 | 2끼 (warning) | 점검 경고 + 오후반차 선택 (accent) + CTA 활성 (safe) | hidden | hidden |
| VP6 | dark | 5/17 (일) · 풀 표시 | duty-off 비번 | hidden | 차단 카피 (주말) | 박보융(annual)/김영민(info)/이재훈(annual) | ₩48,500 |
| VP7 | light | 5/18 (월) · VP1 라이트 | duty-night | hidden | 빈 폼 + 비활성 CTA + PDF | hidden | hidden |
| VP8 | light | 5/17 (일) · VP6 라이트 | duty-off | hidden | 차단 카피 (주말) | 동일 3 chips | ₩48,500 |

## 토큰 정규화 매핑 (source → sketch)

source (StaffServicePage.tsx line 1293~1549) 의 인라인 hex / alias 가 sketch 의 v0.1.0 semantic 토큰으로 모두 흡수:

- 옛 alias bg2/bg3/bg/bd/t1/t2/t3/acl → surface-raised/sunken/sunken/border-default/text-primary/secondary/tertiary/accent
- 옛 초록 hex (등록 chip + CTA) → status-safe-bg/safe/safe-bar
- 옛 황색 hex (점검 경고 + 끼수) → status-warning-bg/warning/warning-bar
- 옛 빨강 hex (공휴일 라벨) → status-danger
- 옛 오렌지 hex (팀원 official suffix) → status-info (UI-SPEC §3.4.1 분류 정보 룰)
- 옛 청파랑 hex (PDF 다운로드) → accent
- 옛 보라 hex (주말식대) → 정규화 #8f42d7 (카테고리 색, 인라인 유지)

## 노안 격상 (source → sketch)

- 9px → 12: 식사미사용 라벨
- 10px → 12: 공휴일 라벨 / 시작일·종료일 라벨 / 끼수 단위 "끼" / 팀원 suffix
- 11px → 12: shift 칩 (12 격상 — 카테고리 칩 noise 최소화)
- 11px → 13: 6-버튼 grid 라벨 · 끼수 숫자 · 차단 카피 · 점검 경고 · ~구분자 · 주말식대 · 팀원 chip · 휴가 헤더
- 11px → 14: select option · 사유 input · 시작일·종료일 input
- 12px → 16: 휴가신청 CTA · PDF 다운로드 CTA · 헤더 날짜
- 13px / 14px 그대로 (일수 / 닫기)

## Deviations from Plan

None — 플랜의 자동화 grep 게이트가 status-fire / alias 토큰 / OLD categorical hex 의 "본문" 만 아니라 "rules 박스 내 documentation 텍스트" 까지 포함하는 strict 정책이라, rules 박스 내 토큰명 verbatim 인용을 "옛 alias 'bg2'" / "옛 초록 raw hex" 같은 indirect description 으로 표기. 동작 / 시각 결과는 동일. (W4 의 rules 박스는 status-fire 1회 grep 매칭이 있지만 W5 플랜은 0 hit 강제 — 더 엄격한 W5 룰 준수.)

## Notable design decisions

- **휴가신청 CTA 활성 색 = status-safe** — 행동의 의미 = 정상/완료 컨텍스트 (긴급/조치-대기 톤 아님). source 의 #22c55e 가 정확히 같은 의미.
- **휴가 등록 chip** = status-safe-bg + status-safe + 2px status-safe-bar border. 등록 상태 = 완료 의미 정합.
- **팀원 공가 (official) suffix = status-info** — UI-SPEC §3.4.1 분류 정보 룰 적용 (source #f97316 는 카테고리적 사용이었고, status 룰로 흡수 시 info 가 가장 가까운 의미).
- **주말식대 보라** = 카테고리 색 (status 아님) — 정규화 #8f42d7 인라인 유지. status 토큰으로 매핑 시 의미 손실.
- **일수 #facc15** = gold raw hex 예외 유지 (UI-SPEC §14 OQ #4). 일수 표시는 의도된 강조.
- **✓ U+2713** = Dingbats 영역, 플랜 spec emoji range (U+1F300~U+1FAFF) 외 → 통과. 휴가 등록 chip 의 가장 자연스러운 시각 마커.

## 다음 단계

1. **W6 또는 TSX 변환 wave** 진입 — 02 InspectionPage redesign 트랙이 sketch 6차수 + TSX 변환 + 후속 fix 3건 까지 완료된 패턴 (project_redesign_02_inspection_status.md) 처럼, 12-staff-service 의 5 sketch wave (W1~W5) 완료 후 TSX 변환으로 진입.
2. **TSX 변환 시 source-of-truth 매핑** — sketch rules 박스 마지막 섹션의 source line 1293~1549 매핑 표를 그대로 적용. var(--bg2)→var(--surface-raised), 옛 hex → status 토큰, fontSize 격상 모두 본 sketch 에서 정의 완료.

## Self-Check: PASSED

- Created file exists: `/Users/jykevin/Documents/20260328/.claude/worktrees/agent-a24b639302d865546/cha-bio-safety/docs/redesign-context/12-staff-service/sketch/05-bottomsheet-sketch.html` (50,115 bytes)
- Commit exists: `6127887` (`docs(260518-kgo-01): add W5 BottomSheet sketch`)
- All grep gates pass (font-size 9·10·11 = 0, status-fire = 0, alias = 0, OLD hex 본문 = 0, #facc15 = 5, #8f42d7 = 7, frame-mobile = 8, status 4종 + duty 4종 모두 출현)
