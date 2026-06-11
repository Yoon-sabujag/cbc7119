# 260611-jo8 후속 — ④ 과거 세션 날짜 소급 보정 (prod D1, 사용자 승인)

2026-06-11. KST 새벽~아침 UTC 날짜귀속 버그(④, 가드는 1dc8450 으로 배포 완료)로
`date = 실제 점검일 - 1` 이던 inspection_sessions 5행의 date 를 실제 점검일로 교정.
**check_records 는 무수정** (총량 3917 보정 전후 동일).

## 적용 SQL

```sql
UPDATE inspection_sessions SET date = DATE(created_at)
WHERE id IN ('qigJTv2ONRgyhDKIN8Feh','oCQUTXEITyx7GJHepy7X1','4Kgy3PQvEELLirHYNFYRG','c6axXZjrn6tGjbuH7l6fv','5W1WO3zAPqU0ZqprfeRPe')
  AND date <> DATE(created_at);
-- changes=5
```

## 보정 전 스냅샷 (세션 5행 전체)

```jsonl
{"id": "qigJTv2ONRgyhDKIN8Feh", "date": "2026-03-25", "staff_id": "2022051052", "floor": null, "zone": null, "completed_at": null, "created_at": "2026-03-26 08:58:02", "photo_key": null}
{"id": "oCQUTXEITyx7GJHepy7X1", "date": "2026-04-01", "staff_id": "2018042451", "floor": null, "zone": null, "completed_at": null, "created_at": "2026-04-02 01:09:38", "photo_key": null}
{"id": "4Kgy3PQvEELLirHYNFYRG", "date": "2026-04-21", "staff_id": "2022051052", "floor": null, "zone": null, "completed_at": null, "created_at": "2026-04-22 08:36:42", "photo_key": null}
{"id": "c6axXZjrn6tGjbuH7l6fv", "date": "2026-04-21", "staff_id": "2021061451", "floor": null, "zone": null, "completed_at": null, "created_at": "2026-04-22 08:39:38", "photo_key": null}
{"id": "5W1WO3zAPqU0ZqprfeRPe", "date": "2026-05-05", "staff_id": "2022051052", "floor": null, "zone": null, "completed_at": null, "created_at": "2026-05-06 01:31:56", "photo_key": null}
```

## 세션 내용 (보정 사유 근거)

| 세션 | 표기→교정 | 직원 | 내용 |
|---|---|---|---|
| qigJ… | 03-25 → 03-26 | 윤종엽 | 소화기 일제 점검 172건 (전부 정상) |
| oCQU… | 04-01 → 04-02 | 석현민 | 빈 세션 (기록 0) |
| 4Kgy… | 04-21 → 04-22 | 윤종엽 | DIV 13 + 컴프레셔 12 = 25건 (정상) |
| c6ax… | 04-21 → 04-22 | 김병조 | DIV 1건 (정상) |
| 5W1W… | 05-05 → 05-06 | 윤종엽 | 유도등 불량 1건 (점등 이상, 05-06 14:10 조치 완료) |

## 검증 (보정 후)

- 5행 모두 `date == DATE(created_at)` / 전체 `date <> DATE(created_at)` 잔존 **0**
- 날짜별 기록 수 이동이 예측과 정확히 일치:
  03-25 172→0(세션 소멸), 03-26 0→172 / 04-01 59→59(빈 세션), 04-02 →0 세션 출현 /
  04-21 29→**3**, 04-22 124→**150**(+26) / 05-05 1→0, 05-06 22→**23**(+1)
- `check_records` 총량 3917 불변 (기록 본문·시각·사진 무수정)
- 월별 통계 무영향 (5건 모두 같은 달 안 하루 이동)

## 의도적으로 안 한 것

- **CP-FE-0203 기록 1건의 checked_at UTC 아티팩트** (`2026-03-25 23:59:12` = created_at 03-26 08:59 − 9h):
  세션 보정만으로 화면 귀속은 정상화되므로 기록 무수정 원칙대로 보존. 필요 시 별도 결정.
- 4/22 동일 직원 세션 2개 공존(버그 세션 + 기존 정상 세션) merge — 조회가 s.date JOIN 합산이라
  불필요 + 세션 삭제가 침습적이라 비채택 (사용자 동의).
