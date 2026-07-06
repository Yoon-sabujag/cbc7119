-- 0095: fail-detail 동기화 성공 마커
--
-- 증분 fail-detail 동기화(260706 검사주기 인지형 TTL 핸드오프 변경 3)의 자가 치유 복원:
-- "history UPSERT 성공 + fail-detail 조회 실패" 건이 knownFailCds 에 들어가 60일 후
-- 영구 재조회 불가가 되는 구멍을 막는다. 성공 시각을 history 행에 기록하고,
-- NULL 인 건은 다음 동기화에서 자동 재시도.
--
-- 주의: 판정 기준은 여전히 elevator_inspect_history (스펙이 금지한
-- elevator_inspect_fails 부재 기반 판정 아님 — 부적합 0건 합격 검사도 성공 조회 후 마커가 찍힘).

ALTER TABLE elevator_inspect_history ADD COLUMN fails_synced_at TEXT;

-- 백필: 기존 캐시는 구코드(매 동기화 전건 재조회)가 채운 완결 상태이므로
-- fetched_at 으로 마킹해 일회성 전건 재조회 폭주(~290회)를 방지.
-- (prod 이식 시에도 동일 백필 필수)
UPDATE elevator_inspect_history SET fails_synced_at = fetched_at;
