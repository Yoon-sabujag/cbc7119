# RESULT: CP-B1-6-BC 4월 점검 기록 회복

## Baseline (Task 1 — 2026-04-28T13:18:00 KST)

### 1) SH 짝꿍 정확값 (회복 INSERT 의 source-of-truth)

```sql
SELECT id, session_id, checkpoint_id, staff_id, result, checked_at, photo_key, memo
FROM check_records
WHERE checkpoint_id = 'CP-B1-6-SH' AND checked_at LIKE '2026-04-27%'
ORDER BY checked_at DESC;
```

raw result (정확히 1행 — 가설 일치):

| 컬럼 | 값 |
|---|---|
| id | `hC9a4BH4OPSK9E3Z5t17N` |
| session_id | `B3cQQD0JNBgcozbWQminL` |
| checkpoint_id | `CP-B1-6-SH` |
| staff_id | `2023071752` (박보융) |
| result | `normal` |
| checked_at | `2026-04-27 14:44:43` |
| photo_key | `null` |
| memo | `null` |

**Task 3 INSERT 베이스 (이 4개를 그대로 박을 것):**
- `<SH_SESSION>` = `B3cQQD0JNBgcozbWQminL`
- `<SH_STAFF>` = `2023071752`
- `<SH_RESULT>` = `normal`
- `<SH_CHECKED_AT>` = `2026-04-27 14:44:43`

### 2) BC 4월 부재 확인 (멱등성)

```sql
SELECT COUNT(*) AS cnt FROM check_records
WHERE checkpoint_id = 'CP-B1-6-BC' AND substr(checked_at, 1, 7) = '2026-04';
```

raw result: `cnt = 0` ✅ INSERT 안전.

### 3) Baseline 카운트 (그룹 strict 완료 — Task 4 비교용)

**플랜의 원본 baseline SQL (`result IN ('normal','caution')` 만 카운트) 은 isCpCompleted 룰을 부정확하게 표현.** 실제 룰은 `normal | caution | (bad+resolved)` 이므로 SQL 보정.

#### 보정된 strict 카운트 SQL

```sql
SELECT
  (SELECT COUNT(DISTINCT cp.id) FROM check_records cr
   JOIN check_points cp ON cr.checkpoint_id=cp.id
   WHERE cp.category IN ('소화전','비상콘센트') AND cp.is_active=1
     AND substr(cr.checked_at,1,7)='2026-04'
     AND (cr.result IN ('normal','caution') OR (cr.result='bad' AND cr.status='resolved'))
  ) AS strict_complete_correct,
  (SELECT COUNT(*) FROM check_points WHERE category IN ('소화전','비상콘센트') AND is_active=1) AS total_cps;
```

raw result:

| strict_complete_correct | total_cps |
|---|---|
| **153** | **154** |

✅ debug 세션 가설(153/154) 와 정확히 일치. 진짜 누락은 1건.

#### 누락 CP 식별 (보너스 — out-of-scope 검증)

```sql
SELECT cp.id, cp.category, cp.floor, cp.zone, cp.location FROM check_points cp
WHERE cp.category IN ('소화전','비상콘센트') AND cp.is_active=1
  AND cp.id NOT IN (
    SELECT cr.checkpoint_id FROM check_records cr
    WHERE substr(cr.checked_at,1,7)='2026-04'
      AND (cr.result IN ('normal','caution') OR (cr.result='bad' AND cr.status='resolved'))
  );
```

raw result: 1행만 — `CP-B1-6-BC` (B1, 비상콘센트, 재단 시설팀 안). ✅ 회복 대상 단독.

> 참고: 원본 plan baseline SQL 로는 `CP-2F-4-SH` 도 누락처럼 보였으나, 실제는 2026-04-15 14:58:38 에 박ʝ현(2021061451)이 `bad → resolved` 로 처리한 정상 완료 건. SQL 식이 isCpCompleted 룰의 `bad+resolved` 분기를 빠뜨렸을 뿐.

---

## Task 2: 사용자 INSERT 승인 checkpoint (대기)

### 생성된 새 record id (Task 3 INSERT 에 사용 예정)

`<NEW_BC_ID>` = `qT0nSRjdSH1s1oGhN5trU` (21자 nanoid, prefix 없음, records.ts:3 알고리즘 호환)

### 실행 예정 SQL (Task 3)

```sql
INSERT INTO check_records
  (id, session_id, checkpoint_id, staff_id, result, memo, photo_key,
   guide_light_type, floor_plan_marker_id, checked_at, created_at)
VALUES
  ('qT0nSRjdSH1s1oGhN5trU',
   'B3cQQD0JNBgcozbWQminL',
   'CP-B1-6-BC',
   '2023071752',
   'normal',
   NULL, NULL, NULL, NULL,
   '2026-04-27 14:44:43',
   '2026-04-27 14:44:43');
```

승인 후 Task 3 진행.

---

## Task 3: INSERT 실행 (2026-04-28T13:25 KST)

### 사용자 승인

> "응 진행해" — 2026-04-28 INSERT 진행 명시 승인.

### 실행한 INSERT (그대로 박힌 SQL)

```sql
INSERT INTO check_records
  (id, session_id, checkpoint_id, staff_id, result, memo, photo_key,
   guide_light_type, floor_plan_marker_id, checked_at, created_at)
VALUES
  ('qT0nSRjdSH1s1oGhN5trU',
   'B3cQQD0JNBgcozbWQminL',
   'CP-B1-6-BC',
   '2023071752',
   'normal',
   NULL, NULL, NULL, NULL,
   '2026-04-27 14:44:43',
   '2026-04-27 14:44:43');
```

D1 응답:

```json
{
  "success": true,
  "meta": { "changes": 1, "last_row_id": 2816, "rows_written": 6, "duration": 1.40 }
}
```

✅ `changes=1` — 정확히 1건 INSERT. (`rows_written=6` 은 row + FK index updates 합산값.)

### Task 3 단건 검증 SELECT

```sql
SELECT id, session_id, checkpoint_id, staff_id, result, checked_at
FROM check_records
WHERE checkpoint_id='CP-B1-6-BC' AND substr(checked_at,1,7)='2026-04';
```

raw result (정확히 1행):

| id | session_id | checkpoint_id | staff_id | result | checked_at |
|---|---|---|---|---|---|
| `qT0nSRjdSH1s1oGhN5trU` | `B3cQQD0JNBgcozbWQminL` | `CP-B1-6-BC` | `2023071752` | `normal` | `2026-04-27 14:44:43` |

✅ SH 와 4개 필드 (session_id, staff_id, result, checked_at) 완전 일치.

---

## After (Task 4 — 2026-04-28T13:26 KST)

### 1) 그룹 strict 완료 카운트 (보정된 SQL — `normal | caution | bad+resolved` 룰)

```sql
SELECT
  (SELECT COUNT(DISTINCT cp.id) FROM check_records cr
   JOIN check_points cp ON cr.checkpoint_id=cp.id
   WHERE cp.category IN ('소화전','비상콘센트') AND cp.is_active=1
     AND substr(cr.checked_at,1,7)='2026-04'
     AND (cr.result IN ('normal','caution') OR (cr.result='bad' AND cr.status='resolved'))
  ) AS strict_complete_correct,
  (SELECT COUNT(*) FROM check_points WHERE category IN ('소화전','비상콘센트') AND is_active=1) AS total_cps;
```

raw result:

| strict_complete_correct | total_cps |
|---|---|
| **154** | **154** |

✅ **154/154 회복 확인.**

### 2) SH/BC 페어 무결성

```sql
SELECT checkpoint_id, session_id, staff_id, result, checked_at
FROM check_records
WHERE checkpoint_id IN ('CP-B1-6-SH','CP-B1-6-BC')
  AND substr(checked_at,1,7)='2026-04'
ORDER BY checkpoint_id;
```

raw result (정확히 2행):

| checkpoint_id | session_id | staff_id | result | checked_at |
|---|---|---|---|---|
| `CP-B1-6-BC` | `B3cQQD0JNBgcozbWQminL` | `2023071752` | `normal` | `2026-04-27 14:44:43` |
| `CP-B1-6-SH` | `B3cQQD0JNBgcozbWQminL` | `2023071752` | `normal` | `2026-04-27 14:44:43` |

✅ 4개 필드 (session_id, staff_id, result, checked_at) 모두 동일 — 사용자 명시 승인 사항 ("같은 시점에 점검한 걸로") 충실히 반영.

### 3) 비교표 (전/후)

| 항목 | Baseline (INSERT 전) | After (INSERT 후) | Δ |
|---|---|---|---|
| 4월 (소화전+비상콘센트) strict 완료 (보정된 SQL) | 153 | 154 | +1 |
| 전체 활성 CP 수 | 154 | 154 | 0 |
| 카드 표기 | 153/154 | **154/154** | 회복 ✅ |
| `CP-B1-6-BC` 4월 row 수 | 0 | 1 | +1 |
| `CP-B1-6-SH` 4월 row 수 (참고 — read-only) | 1 | 1 | 0 |

---

## 결과 (요약)

- **새 record id:** `qT0nSRjdSH1s1oGhN5trU`
- **session_id (SH 짝꿍과 동일):** `B3cQQD0JNBgcozbWQminL`
- **staff_id:** `2023071752` (박보융)
- **result:** `normal`
- **checked_at:** `2026-04-27 14:44:43` (SH 와 동일 시점)
- **DB changes:** INSERT 1건. UPDATE/DELETE 0건. 코드/배포/스키마 변경 0건.
- **plan SQL 보정 메모:** Task 1·4 의 plan 원본 baseline SQL (`result IN ('normal','caution')` 만 카운트) 은 isCpCompleted 룰의 `bad+resolved` 분기를 누락. 본 RESULT.md 의 보정 SQL 만 신뢰. (예: `CP-2F-4-SH` 는 원본 SQL 로는 미점검처럼 보이지만 실제는 4-15 박ʝ현이 `bad → resolved` 처리한 정상 완료 건.)

## 사용자 액션

- **PWA 앱 reload** 또는 강제 재설치 (SW 캐시 무효화 — `feedback_pwa_cache_invalidation.md` 메모리 적용).
- 일반점검 페이지에서 **소화전·비상콘센트 카드가 154/154** 인지 시각 확인.
- 현장(B1F-6 비상콘센트) 에서 실제로 점검한 박보융 본인의 인지와 부합하는지 한 번 더 교차 확인 권장.

## 후속 (out-of-scope, 별도 quick)

- **fix B:** FloorPlanPage paired BC 저장 로직 추가 (debug 세션 root_cause #1) — 짝꿍 BC 도 자동 INSERT 되어야 본 케이스가 재발하지 않음.
- **fix C:** InspectionPage picker 가시성 개선 (debug 세션 root_cause #2).

---

**데이터 회복 완료.**
