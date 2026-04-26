# DIV / 컴프레셔 점검 cycle 인식 작업 (260427)

> 작업 일자: 2026-04-27
> Quick task: `260427-1dc` + 인라인 후속 fix + 디자인 개선
> 상태: 룰 단순화 (월 반반 분할) + 디자인 개선 (두 ring 분리) + 컴프 월초 backfill 완료

---

## 배경

DIV(유수검지장치, 34 CP)와 컴프레셔(34 CP)는 **한 달에 두 번 점검** — 다른 카테고리(소화기/소화전/스프링클러/등)와 다른 패턴.

| 카테고리 패턴 | 예시 | 일정 구조 |
|---|---|---|
| 월 1 cycle | 소화기 / 소화전 / 스프링클러 / … | 한 번에 며칠 연속 점검 후 그 달 종료 |
| **월 2 cycle** | **DIV / 컴프레셔** | **월초 + 월말 각각 cycle** |

### 4월 실제 일정 / 기록 (DB 확인)
- **DIV schedule**: 4/6, 4/7 (월초) / 4/20, 4/21 (월말)
- **컴프 schedule**: 4/6 (월초) / 4/20 (월말)
- **DIV 기록**: 4/6 18 + 4/7 16 + 4/20 21 + 4/21 1 + 4/22 34 = 양 cycle 모두 완료
- **컴프 기록**: 4/20 21 + 4/21 1 + 4/22 26 (월초 0건 — 페이지 분리 운영 전이라 누락) → backfill 후 양 cycle 완료

### 문제

기존 모든 진행률 표시는 **monthly 윈도우** 사용 → DIV/컴프는 두 cycle 데이터가 섞여 부정확.

| 시점 | monthly | 의도된 표시 |
|---|---|---|
| 월초 종료 | 100% | "월초 cycle 완료" 표시 (월말 미완 인지 가능) |
| 월초~월말 사이 gap | 100% (잔존) | 직전 cycle 진행률 잔존 표시 |
| 월말 시작일 | 여전히 100% (월초 records 때문) | **0%부터 다시 카운트** 또는 "월말 진행 중" 표시 |

---

## 최종 룰 (locked)

**숫자 표시(점검 미완료/카드)와 도넛 시각화를 분리.**

| # | 위치 | DIV/컴프 룰 | 다른 카테고리 |
|---|---|---|---|
| 1 | 대시보드 "오늘 현황 점검 미완료" | **현재 반쪽 윈도우** (1~15 또는 16~말일) | monthly (변화 없음) |
| 2 | 대시보드 "이번달 점검 현황" 도넛 | **0~200% two-lap** (안쪽 ring=월초 + 바깥 ring=월말) | 0~100% 단일 arc (변화 없음) |
| 3 | 점검 페이지 점검 항목 카드 | **현재 반쪽 윈도우** | monthly (변화 없음) |

→ **숫자(#1, #3)** 는 *"지금 무엇을 해야 하나"* (현재 반쪽), **도넛(#2)** 는 *"이번 달 전체 누적 진행"* (단조 증가)

### Cycle window 정의 — 월 반반 분할 (#1, #3 공유)

```
getCycleHalfRange(today):
  day = day-of-month(today)
  if day <= 15: return [YYYY-MM-01, YYYY-MM-15]   # 월초 cycle
  else:         return [YYYY-MM-16, YYYY-MM-{말일}] # 월말 cycle
```

→ schedule 일자에 의존하지 않음. 일정 외 점검 기록(예: 4/22)도 자연스럽게 포함됨.

### 200% two-lap 도넛 (#2)

- **안쪽 ring**: 색A (월초 cycle, 1~15) — earlyPct 0~100%
- **바깥 ring**: 색B (월말 cycle, 16~말일) — latePct 0~100%
- 두 ring 분리 (사이 1px 갭) — 두 바퀴 의미 시각적으로 명확
- 가운데 텍스트: 단일 `pct%` ((earlyDone + lateDone) / cpTotal × 100) → **0~200%**
- 하단 텍스트: `done/total` (예: 68/68). `done >= total` 일 때 녹색

### 동작 예시 (DIV, total CP=34)

| 시점 | #1/#3 (반쪽 윈도우) | #2 도넛 |
|---|---|---|
| 4/9 (월초 종료, today=4/9 → 1~15) | 34/34 (월초 완료) | 안쪽 한 바퀴, 50% (34/68) |
| 4/15 (gap, today≤15 → 1~15) | 34/34 (잔존) | 50% (변화 없음) |
| 4/22 (월말 day3, today=4/22 → 16~말) | **0/34부터 카운트** | 안쪽 그대로 + 바깥 진행 |
| 4/30 (월말 종료) | 34/34 | 안쪽 + 바깥 모두 꽉, 200% (68/68) |

---

## 적용 파일

| 파일 | 변경 내용 |
|---|---|
| `functions/api/dashboard/stats.ts` | `CYCLE_CATEGORIES` 상수 / `getCycleHalfRange` / `getMonthHalves` 헬퍼 / `inspDoneN` 분기 / `monthlyItems` doubleCycle 메타 (early_done/late_done/early_pct/late_pct/early_color/late_color, total = cpTotal × 2, **pct = done/cpTotal × 100 → 0~200%**) |
| `functions/api/inspections/records.ts` | month 조회 시 dedupe 제거 — cycle window 매칭이 CP 의 모든 record 날짜를 봐야 정확. 일자 조회는 기존 동작 유지 |
| `src/utils/inspectionProgress.ts` | `CYCLE_CATEGORIES` / `getCycleHalfRange` / `computeCardCompletion` 시그니처에 `today` optional. **scheduleItems 의존 제거** |
| `src/components/ui/index.tsx` | `Donut` 컴포넌트 `doubleCycle` prop. **두 ring 분리** (안쪽=earlyColor, 바깥=lateColor, ringStroke ~ strokeWidth × 0.55). 가운데 텍스트 `{pct}%` 0~200% 지원, fontSize 10px 통일 |
| `src/pages/DashboardPage.tsx` | `MonthlyItem` 타입에 doubleCycle 필드. 도넛 호출부 분기. **하단 done/total 색상: `done >= total` 이면 녹색** (이전 `pct === 100` 룰 → 200% 케이스 회색 버그 해결) |
| `src/pages/InspectionPage.tsx` | line 4423 `computeCardCompletion` 호출부에 `today` 인자 전달 (IIFE 로 `_todayForCycle` 한 번만 계산). scheduleItems 인자 제거 |

### 카테고리명 (검증됨)
- `check_points.category` AND `schedule_items.inspection_category` 모두 정확히 `'DIV'`, `'컴프레셔'`
- 클라/서버 양쪽: `const CYCLE_CATEGORIES = new Set(['DIV', '컴프레셔'])`

### 회귀 가드
- DIV/컴프 외 카테고리 통계/카드/도넛 동작 100% 동일
- Donut backward compat (`doubleCycle` undefined → 기존 단일 arc)
- `check_records` 데이터 무수정 (룰만 변경) — 단, 컴프 월초는 **누락 backfill** 진행
- mode='edit' / 마커 분기 / 점검 기록 보존 모두 유지

---

## 진화 과정 (어떻게 도달했나)

**v1: schedule blocks 기반 cycle window** (초기 구현, c5708fc / 067c813)
- `getCycleRange` / `getMonthlyBlocks` — schedule_items 의 연속 일자 블록을 cycle 단위로 사용
- 문제: 4/22처럼 schedule 외 점검 기록 누락 (도넛/카드 underreport)

**v2: 월 반반 분할 (1~15 / 16~말)** (현재)
- `getCycleHalfRange` / `getMonthHalves` — schedule 의존 제거
- 일정 외 기록도 자연 포함, 코드 단순

**도넛 시각화 진화**
- v1: 같은 트랙에 두 색 overlay → 두 바퀴 의미 모호
- v2: 안쪽 ring + 바깥 ring 분리 (1px 갭) → 두 cycle 시각적으로 명확
- 가운데 % 0~100 cap 제거 → 두 cycle 모두 완료 시 200% 표시

**색상 룰 정정**
- 이전: `pct === 100 → 녹색` (200% 케이스 회색 됨)
- 현재: `done >= total → 녹색` (단일 100%, 더블 200% 모두 자연스럽게)

---

## 컴프 월초 backfill (2026-04-27)

**원인**: 4월 초까지는 점검 페이지에서 DIV/컴프 분리 운영을 안 함 → 실제 점검은 같이 했지만 컴프 월초 기록 통째로 누락. 4월 월말부터 분리 운영 시작.

**해결**: DIV 4/6, 4/7 record 34건을 컴프 cp_id 매핑하여 복제 INSERT.

```sql
INSERT INTO check_records (id, session_id, checkpoint_id, staff_id, result, memo, photo_key, checked_at, status)
SELECT
  lower(hex(randomblob(10))),
  cr.session_id,
  REPLACE(cp.id, 'CP-DIV-', 'CP-COMP-'),
  cr.staff_id, cr.result, cr.memo, cr.photo_key, cr.checked_at, cr.status
FROM check_records cr
JOIN check_points cp ON cr.checkpoint_id = cp.id
WHERE cp.category='DIV' AND date(cr.checked_at) BETWEEN '2026-04-06' AND '2026-04-07';
```

- CP 1:1 매핑 (`CP-DIV-X-Y` ↔ `CP-COMP-X-Y`) 완전 검증됨 (34/34 매칭)
- 같은 session_id 재사용 (현장 점검 시점 그대로)
- 결과: 컴프 월초 0 → 34 (DIV와 동일)

---

## 검증 결과 (사용자 PWA 확인 완료)

1. ✓ **대시보드 "오늘 현황 점검 미완료"** — 반쪽 윈도우 카운트
2. ✓ **이번달 점검 현황 도넛 (DIV/컴프)** — 두 ring 분리, 가운데 200% 표시, 하단 `68/68` 녹색
3. ✓ **점검 페이지 점검 항목 카드 (DIV/컴프)** — 반쪽 윈도우 기준
4. ✓ **다른 카테고리** — 회귀 없음
5. ✓ **컴프 월초 backfill** — 도넛 안쪽 ring 채워짐

---

## 관련 commits / 배포

- `260427-1dc` — DIV/컴프레셔 cycle 인식 (`.planning/quick/260427-1dc-div-cycle/`)
  - 067c813 server stats.ts (v1 schedule blocks)
  - c5708fc client (v1)
  - 4bd25f0 docs
- 후속 fix + 디자인 개선 (이 작업, 미커밋 → 본 정리 후 commit)
  - records.ts dedupe 제거
  - 월 반반 분할 룰 (v2)
  - 도넛 가운데 0~200%, 안/바깥 ring 분리
  - done/total 색상 룰 (`done >= total`)
  - 컴프 월초 backfill (DB 직접)

## 배포 URL (최종)
- `https://5e8381e9.cbc7119.pages.dev` (안쪽 월초 / 바깥 월말 + 컴프 월초 backfill 반영)
