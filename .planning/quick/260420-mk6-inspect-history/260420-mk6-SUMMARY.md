---
phase: 260420-mk6
plan: 01
subsystem: 승강기/공단 API
tags: [elevator, koelsa, d1, migration, api, inspect-history]
requires:
  - "elevators.cert_no (0054 schema)"
  - "D1 binding DB + JWT middleware"
provides:
  - "D1: elevator_inspect_history (UPSERT by fail_cd)"
  - "D1: elevator_inspect_fails (by fail_cd)"
  - "GET /api/elevators/inspect-history (cert_no / sync_all / refresh=0)"
affects: []
tech_stack:
  added:
    - "공단 공식 API: ElevatorInspectsafeService (getInspectsafeList / getInspectFailList)"
  patterns:
    - "koelsa.ts 정규식 XML 파서 패턴 재사용 (CF Workers fetch-only)"
    - "UPSERT on unique fail_cd + DELETE+INSERT for child fails"
key_files:
  created:
    - cha-bio-safety/migrations/0067_inspect_history.sql
    - cha-bio-safety/functions/api/elevators/_inspectsafe.ts
    - cha-bio-safety/functions/api/elevators/inspect-history.ts
  modified: []
decisions:
  - "fail_cd 를 elevator_inspect_history UNIQUE 키로 선정 — 검사건 고유 ID 역할, UPSERT 간결"
  - "elevator_inspect_fails 는 FK 선언만(ON DELETE CASCADE 없음) — 동기화 시마다 DELETE+INSERT 로 자체 관리"
  - "sync_all 은 호기 순차 실행(Promise.all 금지) — 공단 API rate limit/키 단위 제한 보호"
  - "fail detail 호출은 5건 청크 병렬 — 17대×10~20건 시 체감 속도 개선"
  - "fail detail API 오류 시 기존 fails 캐시는 DELETE 하지 않음 — 일시적 에러로 데이터 손실 방지"
  - "admin gate 는 sync_all 에만 적용 — 단일 호기 조회는 기존 JWT 인증으로 충분"
metrics:
  duration_minutes: 6
  completed_date: "2026-04-20"
  tasks: 3
  files: 3
---

# Phase 260420-mk6 Plan 01: 공단 공식 검사이력 API/DB 레이어 Summary

공단 ElevatorInspectsafeService(getInspectsafeList/getInspectFailList)로 승강기 공식 검사이력을 조회해 D1에 캐싱하는 API/DB 레이어 추가 (UI 연동 및 마이그레이션 실행은 별도).

## Overview

**목적:** 민원24(koelsa-inspect.ts)는 특정 접수번호 단건만 조회 가능해 전체 검사이력 뷰의 데이터 소스가 없었다. 공단 공식 API로 호기별 전체 검사이력 + 부적합 상세를 확보해 데스크톱 검사이력 뷰의 백엔드 기반을 마련한다.

**구성요소 (파일 3개):**

| # | 파일 | 역할 |
|---|------|------|
| 1 | `cha-bio-safety/migrations/0067_inspect_history.sql` | D1 스키마 (2 테이블 + 2 인덱스) |
| 2 | `cha-bio-safety/functions/api/elevators/_inspectsafe.ts` | 공단 API XML fetch/parse 공용 유틸 |
| 3 | `cha-bio-safety/functions/api/elevators/inspect-history.ts` | `GET /api/elevators/inspect-history` 엔드포인트 |

## 생성된 파일 상세

### 1. `migrations/0067_inspect_history.sql`

스키마 (IF NOT EXISTS, 중복 실행 안전):

```sql
CREATE TABLE elevator_inspect_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  elevator_no TEXT NOT NULL,
  fail_cd TEXT UNIQUE NOT NULL,   -- 검사건 고유 ID (UPSERT 키)
  inspect_date TEXT,               -- YYYY-MM-DD
  inspect_kind TEXT,               -- 설치/정기/수시/정밀
  inspect_institution TEXT,
  company_name TEXT,
  disp_words TEXT,                 -- 합격/보완/보완후합격/불합격
  valid_start TEXT, valid_end TEXT,
  rated_speed TEXT, rated_cap INTEGER, floor_count INTEGER,
  building_name TEXT, address TEXT,
  raw_json TEXT,                   -- 원본 item 전체 (확장/디버그용)
  fetched_at TEXT NOT NULL
);
CREATE INDEX idx_inspect_hist_elev ON elevator_inspect_history(elevator_no, inspect_date DESC);

CREATE TABLE elevator_inspect_fails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fail_cd TEXT NOT NULL,           -- FK (enforce 없음 — DELETE+INSERT 자체 관리)
  fail_desc TEXT, fail_desc_inspector TEXT,
  standard_article TEXT,           -- 규정 조항번호 (예: 5.2.1.1)
  standard_title TEXT,             -- 조항 제목 (standardTitle1)
  FOREIGN KEY(fail_cd) REFERENCES elevator_inspect_history(fail_cd)
);
CREATE INDEX idx_inspect_fails_code ON elevator_inspect_fails(fail_cd);
```

### 2. `functions/api/elevators/_inspectsafe.ts`

**Exports:**
- `INSPECTSAFE_SERVICE_KEY` — 기존 koelsa 서비스키 재사용
- `fetchInspectHistory(elevatorNo: string): Promise<InspectHistoryItem[]>` — 7자리 숫자 검증 + totalCount 기반 전체 페이지 순회 (numOfRows=100)
- `fetchFailDetails(failCd: string): Promise<FailItem[]>` — fail_cd 빈 값이면 [] 리턴, `standardTitle1` → `standardTitle` 리매핑
- `yyyymmdd_to_iso(s: string): string` — `'20140210'` → `'2014-02-10'`, 8자리 숫자 아니면 `''`
- `InspectHistoryItem`, `FailItem` 인터페이스

**구현 포인트:**
- Cloudflare Workers 호환 — `fs`/`path`/`xml2js` 등 Node 모듈 미사용
- koelsa.ts 의 정규식 XML 파서 패턴 차용하되, 알려진 필드 하드코딩 대신 `<tag>value</tag>` 자동 추출 → `raw` 필드에 원본 dict 전체 보존
- `checkError()` 로 공단 API 에러 문자열 감지 (`Unexpected errors`, `SERVICE_KEY_IS_NOT_REGISTERED`, `API not found`, `SERVICE ERROR`) → 스니펫(200자) 포함해 throw

### 3. `functions/api/elevators/inspect-history.ts`

**Endpoint:** `GET /api/elevators/inspect-history`

| 쿼리 | 동작 |
|------|------|
| `?cert_no=2114-971` | 단일 호기: 동기화 후 DB 재조회 반환 (`cached: false`) |
| `?cert_no=2114-971&refresh=0` | 캐시만 조회 (`cached: true`) |
| `?sync_all=1` | elevators 중 cert_no 보유 전체를 **순차** 동기화 (**admin only**) |

**Response shape (단일):**
```json
{
  "success": true,
  "data": {
    "elevatorNo": "2114971",
    "certNo": "2114-971",
    "historyCount": 14,
    "failCount": 0,
    "lastInspectDate": "2026-02-12",
    "history": [
      {
        "failCd": "...",
        "inspectDate": "2026-02-12",
        "inspectKind": "정기",
        "inspectInstitution": "...",
        "companyName": "...",
        "dispWords": "합격",
        "validStart": "2026-02-12",
        "validEnd": "2027-02-11",
        "ratedSpeed": "...",
        "ratedCap": 1150,
        "floorCount": 20,
        "buildingName": "...",
        "address": "...",
        "fails": [
          { "failDesc": "...", "failDescInspector": "...",
            "standardArticle": "5.2.1.1", "standardTitle": "..." }
        ]
      }
    ],
    "cached": false
  }
}
```

**내부 루틴:**
- `certToElevatorNo(certNo)` — 하이픈/공백 제거 후 7자리 숫자 검증 (T-mk6-02)
- `syncOne(env, elevatorNo)` — `fetchInspectHistory` → history UPSERT → failCds 5건 청크 병렬 `fetchFailDetails` → 각 fc 에 대해 DELETE + INSERT → `{historyCount, failCount, lastInspectDate}` 리턴
- `loadFromDb(env, elevatorNo)` — history + fails 일괄 조회 (fails 는 `IN (...)` 로 N+1 회피)

**보안/안전성:**
- 모든 D1 쿼리: `prepare().bind()` prepared statement (T-mk6-02 mitigation)
- `sync_all`: `ctx.data.role !== 'admin'` → 403 (T-mk6-01 mitigation)
- fail detail 개별 호출 실패 시 해당 fc 의 기존 DB fails 보존 (DELETE 스킵)
- sync_all 은 호기 순차(Promise.all 금지) — 공단 API rate limit 준수 (T-mk6-04)
- 기존 JWT 미들웨어 자동 적용 — public route 아님 (T-mk6-07)

## Task 실행 결과

| # | Task | 결과 | Commit |
|---|------|------|--------|
| 1 | 마이그레이션 0067 생성 | OK (2 table + 2 index + UNIQUE) | `c630cd3` |
| 2 | _inspectsafe.ts 서비스 모듈 생성 | OK (exports 4개, tsc 에러 0) | `d432e1b` |
| 3 | inspect-history.ts 엔드포인트 생성 | OK (3 모드 + admin gate + UPSERT/DELETE+INSERT) | `9f6fa3e` |

## Deviations from Plan

### 자동 조정 사항

**1. [Rule 1 - 빌드 타임 버그] `_inspectsafe.ts` 의 데드코드 참조 제거**
- **Found during:** Task 2 작성 직후
- **Issue:** 중간 리팩토링 과정에서 `parseTag` 함수 정의는 삭제했지만 하단 `void parseTag` 참조가 남아 undefined identifier 발생 가능
- **Fix:** 파일 말미의 `void parseTag` 라인 및 주석 제거
- **Files modified:** `cha-bio-safety/functions/api/elevators/_inspectsafe.ts`
- **Commit:** `d432e1b` (동일 task 내부 정리, 별도 커밋 아님)

**2. [Rule 3 - 검증 충돌] inspect-history.ts 주석에서 `koelsa-inspect` 문자열 제거**
- **Found during:** Task 3 verify 실행
- **Issue:** 파일 상단 주의사항 주석에 `민원24(koelsa-inspect.ts) 와는 독립적` 문구 포함 → verify 의 `! grep -q "koelsa-inspect"` 검사 실패
- **Fix:** `민원24 API(별도 핸들러) 와는 독립적` 으로 리워드
- **Files modified:** `cha-bio-safety/functions/api/elevators/inspect-history.ts`
- **Commit:** `9f6fa3e` (동일 task 내부 정리)

**3. [Rule 3 - 코드베이스 컨벤션 충돌] `ctx.data` 접근 패턴**
- **Found during:** Task 3 구현
- **Issue:** 플랜은 `as any` 금지를 명시하나, `_middleware.ts` 가 `(ctx as any).data = {...}` 로 값을 주입하여 기존 핸들러(`faults.ts`)들도 `(data as any).role` 패턴 사용
- **Fix:** `as any` 대신 로컬 `CtxData` 인터페이스 + `as unknown as { data: CtxData }` 단일 캐스트로 타입 안전하게 접근
- **Files modified:** `cha-bio-safety/functions/api/elevators/inspect-history.ts`
- **Commit:** `9f6fa3e`

### 의도된 플랜 밖 행위

없음 — 프론트엔드/기존 핸들러/마이그레이션 실행/배포는 모두 플랜 범위 밖이며 건드리지 않음.

## 사용자 수동 수행 (플랜 밖, 배포 전 필수)

### 1. 마이그레이션 적용 (local + remote)
```bash
cd cha-bio-safety
npx wrangler d1 execute cha-bio-db --local  --file=migrations/0067_inspect_history.sql
npx wrangler d1 execute cha-bio-db --remote --file=migrations/0067_inspect_history.sql
```

### 2. 빌드 + 프로덕션 배포
```bash
npm run deploy   # --branch=production 자동 포함되어 있다면 그대로, 아니면 명시
```

### 3. 단일 호기 smoke test
```bash
# JWT 토큰 획득 후 (예: 로그인 응답의 token)
curl -s "https://cbc7119.pages.dev/api/elevators/inspect-history?cert_no=2114-971" \
  -H "Authorization: Bearer <JWT>" | jq '.data | {historyCount, failCount, lastInspectDate}'
# 기대: historyCount >= 10
```

### 4. admin 로그인 후 전체 최초 캐싱 (1회)
```bash
curl -s "https://cbc7119.pages.dev/api/elevators/inspect-history?sync_all=1" \
  -H "Authorization: Bearer <ADMIN_JWT>" | jq '.data | {totalOk, totalFail}'
# 기대: totalOk = 17, totalFail = 0 (대략 수십 초 ~ 1~2분 소요)
```

## 다음 Quick 에서 다룰 것

1. **데스크톱 검사이력 UI** — 승강기 상세 페이지에 "공식 검사이력" 탭 추가 (테이블 형태: 검사일/종류/판정/유효기간/부적합 수), 행 클릭 시 부적합 상세 펼침.
2. **프론트엔드 API 클라이언트** — `src/utils/api.ts` 에 `elevatorApi.getInspectHistory(certNo, {refresh?})` 추가, React Query 30일 staleTime 캐싱.
3. **유효기간 경고 뱃지** — `validEnd` 기준 30/7 일 이내 도래 시 대시보드 알림 (기존 `elevator_status` 위젯 연동).
4. **부적합 미해결 highlight** — `disp_words` 가 `보완` / `불합격` 인 최근 건 카운트 → 대시보드 요약 카드.

## Self-Check: PASSED

- [x] `cha-bio-safety/migrations/0067_inspect_history.sql` 존재 (2 CREATE TABLE + 2 CREATE INDEX, fail_cd UNIQUE NOT NULL)
- [x] `cha-bio-safety/functions/api/elevators/_inspectsafe.ts` 존재 (exports: `INSPECTSAFE_SERVICE_KEY`, `fetchInspectHistory`, `fetchFailDetails`, `yyyymmdd_to_iso`)
- [x] `cha-bio-safety/functions/api/elevators/inspect-history.ts` 존재 (`onRequestGet`, sync_all admin gate, UPSERT on fail_cd, DELETE+INSERT fails, `certToElevatorNo` 검증)
- [x] 3 commits found: `c630cd3`, `d432e1b`, `9f6fa3e`
- [x] `koelsa.ts`, `koelsa-inspect.ts`, `src/**` 미변경
- [x] `npx tsc --noEmit -p cha-bio-safety` 0 errors (전체 프로젝트)
- [x] 금지 패턴 확인: `inspect-history.ts` 에 `as any` 없음, `koelsa-inspect` 문자열 없음
- [x] 마이그레이션 실행/배포 미수행 (사용자 수동)
