---
status: complete
date: 2026-06-01
branch: redesign/handover-worklist-desktop
---

# Quick 260601-o93 — 인수인계장·업무리스트 데스크톱 디자인 트랙 포팅 + 룰 정렬

## 배경
인수인계장(HandoverPage)·업무관련리스트(WorkListPage) 데스크톱 분기가 `production` 브랜치
커밋 973c31a / 03e18cd 에만 있고 디자인 트랙(main)에는 없었음. 데스크톱 디자인이 룰 미준수
상태라 디자인 트랙으로 가져와(cherry-pick) 룰 정렬.

## 작업 내용
1. **포팅** — 973c31a(HandoverPage 카드그리드+상세모달), 03e18cd(WorkListPage 탭/마스킹 툴바+테이블)을
   `redesign/handover-worklist-desktop`(off origin/main)로 cherry-pick → c0b8c73, 6e82803. 기능 로직 보존.
2. **FIX1 (commit 9d73f73)** — DesktopHandover 카드 그리드를 `maxWidth:1200 + margin:0 auto` 래퍼로 감쌈
   (DocumentsPage 선례). `minmax(290→300px,1fr)`, `gap-2.5→gap-3`. 기존 풀폭 5열 흩뿌림 → 1200px 안 3~4열.
3. **FIX2 (9d73f73)** — 완료/대기/삭제됨 배지 하드코딩 색(8곳, 모바일+데스크톱) → status 토큰
   (`--status-safe-*` / `--status-warning-*` / `--status-danger-*`). 대기 = warning(주황)으로 통일 →
   데스크톱 카드 좌측 바(`bg-warning-bar`)와 일치. **현재 배지(accent)·복원(purple)·pin(amber)은 보존**(개별 치환).
4. **FIX3 (9d73f73)** — 모바일 완료 배지 `✓` 이모지 → lucide `<Check size={12} />` (데스크톱과 통일).

업무리스트 테이블 형식·전체폭은 유지(WorkShift/Schedule 등 데스크톱 테이블 컨벤션 부합).

## Verify — 13 gate 전부 PASS + build PASS
이모지 0 / 하드코딩 green 0 / 현재 배지 accent 보존 / 복원 purple 보존 /
safe·warning·danger 토큰 각 ≥2 / maxWidth 1200 / minmax 300 / gap-3 / old 290 제거 / `npm run build` 성공.

## 남은 작업
- 사용자 시각 검수 → 컨펌 후 **main 머지(→ cbc7119-preview 자동 배포)**. 디자인 트랙 룰상 머지는 사용자 컨펌 후.
- (참고) 직원 production 의 desktop 코드는 룰-정렬 전 버전 — 추후 디자인 트랙 → production sync 시 반영.
