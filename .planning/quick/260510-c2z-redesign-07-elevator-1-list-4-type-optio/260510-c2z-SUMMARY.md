---
quick_id: 260510-c2z
slug: redesign-07-elevator-1-list-4-type-optio
status: complete
date: 2026-05-10
commit: 8bbf504
parent: 260510-4x7
---

# 260510-c2z — redesign/07-elevator 1차 시안 재작성

## What changed

`elevator-sketch.html` 통째 덮어쓰기 (2013→2020 줄, +716/-709). 헤더/토큰/CSS/뷰포트 컨테이너 등 형식 일관성 부분은 보존, 본문의 호기 그리드 영역만 전면 재구성.

### 제거 (이전 시안의 잘못된 구조)

- **5그룹 분류** ("투명 엘리베이터 / 오렌지 엘리베이터 / 기타 엘리베이터 / 화물 엘리베이터 / 덤웨이터") — list 탭이 아닌 EvSelector 모달 전용 분류였음. 2차 시안 (모달) 으로 이동.
- **에스컬레이터 노선도** (`es-rail` / `es-row` / `es-floor` / EsNodeMap 마크업 + 관련 CSS 7클래스) — list 탭에 안 들어감. 모달 EvSelector 안에서만 사용. 2차 시안.
- **이모지 type 아이콘** (🛗📦🔲↕️) — §7.1 위반.

### 추가 (실제 코드 line 1039-1098 구조 1:1 매핑)

- **4 type 그룹** (`['passenger','cargo','dumbwaiter','escalator']`) — 인승용 8 / 화물용 2 / 덤웨이터 1 / 에스컬레이터 6
- **Lucide Option A 아이콘 매핑**:
  - 인승용: `ArrowUpDown` (28회 사용)
  - 화물용: `Package` (4회)
  - 덤웨이터: `UtensilsCrossed` (7회)
  - 에스컬레이터: `ChevronsUpDown` (11회)
- **§6.3 회색 통일**: 모든 type 아이콘 `--text-secondary`, 종류 차이는 그룹 라벨로
- **카드 메타** (코드 1:1):
  - 호기 번호 + 위치 (회색 작은 글씨)
  - 에스컬레이터 한정 `(공단 N호기)` 추가 표시
  - 최근 점검일 또는 "점검 기록 없음"
  - 미해결 N건 (active_faults > 0 일 때 danger 색)
  - 우측 상태 배지 (정상/고장/점검중/운행중지) — §6.1 색 매핑
  - 다음 점검 배지 (`D-N` warning / `검사 초과` danger / `기록 없음` info)
  - chevron-right 화살표 (Lucide)
  - 좌측 3px 색바 (§6.1: safe/warning/danger/fire)
- **상태 4종 + 다음 점검 변종** 4 viewport 안에 골고루 분포

### 보존

- 헤더/Pretendard/Lucide CDN, 토큰 정의 (다크/라이트), alias 변수, base 스타일
- 4 viewport 컨테이너 패턴
- 자체 헤더 (6탭 + 검색 + 액션)
- BottomNav (모바일), 데스크톱 사이드바
- 검색 활성/Empty/Skeleton 변종
- placeholder 박스 (텍스트만 갱신: "2차 시안 — 5 모달 + EvSelector(에스컬 노선도 포함)" / "3차 시안 — KOELSA 검사 이력")

## Verify

9/9 PASS:

| # | Check | Target | Result |
|---|---|---|---|
| 1 | 5그룹 분류 잔재 (투명/오렌지/기타) | 0 | 0 ✅ |
| 2 | 노선도 마크업 (es-rail/es-row/es-floor/EsNodeMap) | 0 | 0 ✅ |
| 3 | arrow-up-down (인승용 8대) | 8+ | 28 ✅ |
| 4 | chevrons-up-down (에스컬 6대) | 6+ | 11 ✅ |
| 5 | utensils-crossed (덤웨이터) | 1+ | 7 ✅ |
| 6 | 9·10·11px 폰트 잔재 | empty | empty ✅ |
| 7 | 4 type 라벨 등장 (4×4뷰포트) | 16+ | 53 ✅ |
| 8 | viewport 라벨 (📱/🖥️) | 4+ | 4 ✅ |
| 9 | 라인 수 (합리적 범위) | 1500-3500 | 2020 ✅ |

## Out of scope

- 5개 모달 (EvSelector + 노선도 포함) — 2차 시안 (별도 quick)
- KOELSA 이력 — 3차 시안 (별도 quick)
- TSX 변환 — 시안 사용자 검토 후 별도 quick

## Commit

- code: `8bbf504` — `docs(260510-c2z): rewrite elevator 1차 sketch — 4-type list + Option A icons (no route diagram)`
