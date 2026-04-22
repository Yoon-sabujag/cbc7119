---
slug: div-pressure-late-save-fails
status: resolved
trigger: |
  그저께 어제 이틀에 걸쳐 월말 div 점검 일정이 있어서 점검을 시행했는데,
  데이터가 우선 입력이 다 되었는지 모르겠어. 4월말 데이터라고 표시가 안되니까.
created: 2026-04-22
updated: 2026-04-22
---

# DIV 월말 압력 저장 실패 (silent)

## Symptoms

- **Expected behavior:** 4월 말 DIV 점검(2026-04-20~22) 후 `div_pressures` 테이블에 `timing='late'`로 16건 저장되고, DivPage에서 "4월말" 라벨과 함께 1차압/2차압/세팅압 표시
- **Actual behavior:**
  - `check_records`에는 CP-DIV-* 체크포인트 16건(4/20: 2, 4/21: 1, 4/22: 13) 정상 저장
  - `div_pressures`에는 **0건** 저장 — 4월 2026 데이터는 4/6,7자 월초(early) 34건만 존재
  - UI는 "점검 완료" 화면 정상 표시, 사용자가 실패 인지 불가
- **Error messages:** 사용자 레이어에 표면화된 오류 없음. API 응답 실패가 silent하게 무시됨
- **Timeline:** 이번 4월 말 점검부터 발견. `0049_div_timing.sql` (timing 컬럼 추가) 이후 첫 월말 점검 사이클로 추정
- **Reproduction:** 같은 `(year, month, location_no)`에 대해 월초 점검 레코드가 이미 존재하는 상태에서 월말 점검(`timing='late'`) 저장 시도

## Scope

- DB: `div_pressures` 테이블의 UNIQUE 제약
- API: `functions/api/div/pressure.ts` (POST 핸들러)
- UI: `src/pages/InspectionPage.tsx` (DIV 저장 로직, line ~1109)

## Initial Evidence

- `div_pressures` 스키마: `CREATE TABLE div_pressures (... UNIQUE(year, month, location_no))` — `timing` 컬럼을 제약에 미포함
- `0049_div_timing.sql`은 `ALTER TABLE ... ADD COLUMN timing` 만 수행, UNIQUE 제약 변경 없음
- API는 `id = 'DIV-{year}-{month}-{timing}-{location_no}'`로 PK 생성 + `ON CONFLICT(id) DO UPDATE` 사용
  - 월초 레코드: `id = DIV-2026-04-early-8-1`
  - 월말 레코드: `id = DIV-2026-04-late-8-1` (다른 id)
  - → ON CONFLICT(id) 발동 안 함 + `UNIQUE(year, month, location_no)` 제약 위반으로 INSERT 거부
- `InspectionPage.tsx` 1109번째 줄 `await fetch('/api/div/pressure', ...)` — 응답/에러 체크 없음
- `check_records`는 별도 엔드포인트(`onSaveRecord`)로 저장되어 auth/network 자체는 정상

## Current Focus

hypothesis: |
  div_pressures의 UNIQUE(year, month, location_no) 제약이 timing 컬럼 도입 이후 모순 상태가 되어,
  월초 레코드가 존재하는 location에 대해 월말 INSERT를 거부. API의 ON CONFLICT(id)는 id 자체가 달라 발동 안 함.
  InspectionPage의 fetch 호출에 응답 체크 부재로 사용자는 실패 인지 불가.

test: |
  리모트 D1에 `timing='late'`로 기존 월초 레코드 존재 상태의 location에 대해 직접 INSERT 시도.

expecting: |
  SQLITE_CONSTRAINT_UNIQUE 에러

next_action: |
  해결: 마이그레이션 + API 에러 핸들링 + UI 응답 체크 3종 반영 완료.

reasoning_checkpoint: ""
tdd_checkpoint: ""

## Evidence

- timestamp: 2026-04-22T08:50+09:00
  finding: |
    `SELECT DATE(created_at), COUNT(*), checkpoint_id FROM check_records WHERE checkpoint_id LIKE 'CP-DIV%' AND created_at >= '2026-04-19'`
    → 4/20: 2건, 4/21: 1건, 4/22: 13건
- timestamp: 2026-04-22T08:50+09:00
  finding: |
    `SELECT DATE(created_at), COUNT(*) FROM div_pressures GROUP BY DATE(created_at) ORDER BY d DESC`
    → 최근: 4/7(13), 4/6(21), 3/30(34), 3/23(884), 3/21(408). 4/20~22: 0건.
- timestamp: 2026-04-22T08:50+09:00
  finding: |
    `SELECT sql FROM sqlite_master WHERE name='div_pressures'`
    → `... timing TEXT DEFAULT 'early', UNIQUE(year, month, location_no))`
- timestamp: 2026-04-22T09:00+09:00
  finding: |
    리모트 D1 스키마 재확인: live production DB도 UNIQUE(year, month, location_no). timing 누락 확정.
- timestamp: 2026-04-22T09:02+09:00
  finding: |
    2026-04 기존 early 34건의 id가 모두 구포맷 `DIV-2026-04-{location_no}` (timing 세그먼트 없음).
    commit f8452f5 (2026-04-11) 이전에 저장되었기 때문. 신포맷 id 레코드는 전체 DB에 0건.
    → ON CONFLICT(id) 미동작 + UNIQUE 위반의 2중 구조 확정.
- timestamp: 2026-04-22T09:03+09:00
  finding: |
    직접 INSERT 재현: `INSERT INTO div_pressures (... timing='late', location_no='-1-2', year=2026, month=4 ...)`
    → `UNIQUE constraint failed: div_pressures.year, div_pressures.month, div_pressures.location_no` (SQLITE_CONSTRAINT_UNIQUE)
    근본 원인 100% 실증 완료.
- timestamp: 2026-04-22T09:08+09:00
  finding: |
    마이그레이션 Dry-run:
    - id 정규화 결과 PK 충돌 0건
    - 신규 UNIQUE(year, month, timing, location_no) 기준 그룹 중복 0건
    → 기존 데이터 손실/충돌 없이 재생성 가능.

## Eliminated

- 네트워크/인증 실패: check_records는 정상 저장되었으므로 탈락.
- 클라이언트 입력 누락: parsedP1/P2/P3 체크가 handleSave 진입부에 있고 체크포인트 저장은 성공했으므로 탈락.

## Resolution

root_cause: |
  마이그레이션 `0049_div_timing.sql`이 `ALTER TABLE ADD COLUMN timing` 만 수행하고 UNIQUE 제약을
  `(year, month, location_no)` 그대로 유지. 이후 commit `f8452f5` 에서 API의 id 포맷이
  `DIV-{year}-{month}-{location_no}` → `DIV-{year}-{month}-{timing}-{location_no}` 로 변경됨.

  4월 초(4/6~7) early 점검은 이전 id 포맷으로 이미 저장되어 있었고, 4월 말(4/20~22) late 점검은
  새 id 포맷으로 INSERT 시도 → 두 id가 서로 다르므로 `ON CONFLICT(id)`가 발동하지 않고, 기존 행의
  `(year=2026, month=4, location_no=X)` 와 `UNIQUE` 충돌하여 SQLITE_CONSTRAINT로 거부됨.

  API 핸들러에는 try/catch가 없어 예외가 런타임 500으로 튕기고, InspectionPage:1109의 fetch는
  응답 체크가 없어 에러가 사용자에게 전파되지 않고 다음 포인트로 넘어감 (silent failure).

fix: |
  3개 레이어 동시 수정:

  1) DB 스키마 — `migrations/0068_div_pressures_unique_timing.sql` 추가
     - `div_pressures` 테이블을 재생성하며 UNIQUE 제약을 `(year, month, timing, location_no)` 로 변경
     - 기존 구포맷 id (`DIV-{year}-{month}-{location_no}`)를 신포맷 (`DIV-{year}-{month}-{timing}-{location_no}`)
       으로 일괄 정규화 (이미 신포맷인 레코드는 그대로 유지)
     - 기존 `timing IS NULL` 레코드는 `'early'` 로 채움
     - 보조 인덱스 `(year, month)`, `(location_no)` 추가
     - dry-run으로 PK/UNIQUE 충돌 0건 확인 완료

  2) API — `functions/api/div/pressure.ts`
     - POST 핸들러에 `try/catch` 추가. DB 예외 발생 시 `{ ok: false, error }` 형태로 500 응답 반환
     - 콘솔에 `[div/pressure POST] save failed` 로그 남겨 wrangler tail 로 추적 가능

  3) UI — `src/pages/InspectionPage.tsx` (handleSave, line 1109~)
     - fetch 응답을 `pressureRes` 로 받아 `!pressureRes.ok` 체크
     - 실패 시 서버 error 메시지를 토스트로 표시하고 `return` — 다음 포인트로 진행 중단
     - `resetForm` / 진행 로직은 성공 분기에서만 실행

verification: |
  코드 레벨:
  - `npx tsc --noEmit` 통과
  - 마이그레이션 SQL 리모트 D1에서 SELECT 형태로 dry-run 실행 → id 재생성 결과 및 UNIQUE 그룹 충돌 검증

  배포 후 사용자 검증 필요 (운영 관찰 모드):
  1. `npm run deploy` 후 `npx wrangler pages deploy dist --branch production` (또는 deploy 스크립트에 --branch production 추가) 로 프로덕션 배포
  2. `npx wrangler d1 execute cha-bio-db --remote --file=migrations/0068_div_pressures_unique_timing.sql` 로 마이그레이션 적용
  3. 동일 location(예: -1-2)에 대해 DIV 월말 점검 재수행 → `div_pressures` 에 `timing='late'` 레코드 저장 확인:
     `SELECT id, year, month, timing, location_no, day FROM div_pressures WHERE year=2026 AND month=4 AND timing='late';`
  4. 실패 시나리오 확인: 잘못된 바디로 POST → UI에 "압력 저장 실패 (…)" 토스트 노출 확인
  5. 손실된 4/20~22자 16건 데이터는 DB에서 복구 불가 — 해당 포인트 재점검하여 새 기록 입력 필요.

files_changed:
  - migrations/0068_div_pressures_unique_timing.sql (new)
  - functions/api/div/pressure.ts
  - src/pages/InspectionPage.tsx
