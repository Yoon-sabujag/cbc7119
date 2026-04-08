# Phase 22: 업무수행기록표 Form + Excel Output - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

소방안전관리자가 매월 말일경 작성·보고해야 하는 법정 별지 제12서식 '업무수행기록표'를 앱에서 자동 생성(기존 데이터 집계)·편집·저장한 후, 업로드된 원본 xlsx 양식과 동일한 셀 구조/서식으로 출력할 수 있도록 한다. 본질은 "일일 업무 일지"와 같은 리포트 생성 페이지 — 대부분의 필드가 기존 DB 데이터(remediation, schedule_items, staff)에서 자동 집계되고, 관리자는 미리 채워진 내용을 검토·수정 후 저장 + 엑셀 출력.

</domain>

<decisions>
## Implementation Decisions

### Schema (D1)

- **D-01:** 새 마이그레이션 `0047_work_logs.sql`, 테이블 `work_logs`.
- **D-02:** 컬럼:
  ```sql
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  year_month      TEXT NOT NULL UNIQUE,       -- 'YYYY-MM' 형식 (월별 단일 레코드)
  year            INTEGER NOT NULL,           -- 2026
  month           INTEGER NOT NULL,           -- 4
  manager_name    TEXT NOT NULL,              -- U4 (자동 프리필, 편집 가능)
  fire_content    TEXT NOT NULL,              -- C10 소방시설 확인내용
  fire_result     TEXT NOT NULL,              -- 'ok' | 'bad' — Y12/Y14 체크 판정
  fire_action     TEXT NOT NULL,              -- AA10 조치내역
  escape_content  TEXT NOT NULL,              -- C14 피난방화시설 확인내용
  escape_result   TEXT NOT NULL,              -- 'ok' | 'bad' — Y19/Y21
  escape_action   TEXT NOT NULL,              -- AA14
  gas_content     TEXT NOT NULL,              -- C17 화기취급감독 확인내용
  etc_content     TEXT NOT NULL,              -- C24 기타사항 확인내용
  updated_by      INTEGER NOT NULL REFERENCES staff(id),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
  ```
  - `year_month UNIQUE` 로 월별 단일 레코드 강제 (Success Criteria #3).
  - 화기취급감독(Y26/Y28/AA17)과 기타사항(Y33/Y35/AA24)의 `result`/`action` 컬럼은 **별도로 두지 않음** — 작성법상 비워두도록 명시되어 있고, 프리필 로직도 없음. 셀에 빈 문자열만 쓰면 됨.
- **D-03:** 인덱스: `year_month` 는 UNIQUE 제약이 자동 인덱스. 별도 인덱스 불필요 (월 1개씩, 4인 팀, 최대 연 12행).
- **D-04:** `content` 필드들은 `TEXT NOT NULL` + empty-string default — NULL vs empty 구분 불필요. 리포트 필드이므로 항상 어떤 값(최소 빈 문자열)이 들어가도록.

### Page Structure (DailyReportPage 패턴 미러링)

- **D-05:** 라우트 `/worklog`, 컴포넌트 `src/pages/WorkLogPage.tsx`. lazy import via App.tsx.
- **D-06:** 상단에 **월 선택기** (일일업무일지의 날짜 이동과 동일 구조) — 이전 월 / 현재 월 / 다음 월 화살표 + 클릭 시 month picker. 기본값 = 현재 월.
- **D-07:** 페이지 진입 시 또는 월 변경 시 `workLogApi.get(year_month)` 호출:
  - 레코드 존재 → 저장된 값 로드, 폼에 채움
  - 레코드 없음 → `workLogApi.preview(year_month)` 호출해 자동 집계 프리필값 받아서 폼에 채움 (서버가 계산)
- **D-08:** 폼 필드는 카드 섹션별 분리 (일일업무일지의 섹션 카드 스타일 재사용):
  1. **기본 정보** 카드 — 관리자 이름 (text input, 프리필됨)
  2. **소방시설** 카드 — 확인내용(textarea, 프리필), 결과 toggle(양호/불량), 조치내역(textarea, 불량일 때 강조)
  3. **피난방화시설** 카드 — 같은 구조
  4. **화기취급감독** 카드 — 확인내용(textarea, 프리필), 결과/조치 없음
  5. **기타사항** 카드 — 확인내용(textarea, 프리필)
- **D-09:** 하단 고정 푸터 버튼 2개:
  - **저장**: `workLogApi.save(year_month, payload)` — upsert. 성공 토스트.
  - **엑셀 출력**: 저장 후(미저장 변경 있으면 먼저 저장 확인 다이얼로그) `generateWorkLogExcel(year_month)` 호출 → xlsx 다운로드.
- **D-10:** 디바운스 자동저장은 **하지 않음** — DailyReportPage는 매일 작성이라 자동저장이 유용하지만, 업무수행기록표는 월 1회 작성이고 사용자가 명시적으로 "완성본"을 저장/출력하는 패턴. 명시적 저장 버튼만.
- **D-11:** "수정됨" 표시: 로드된 값과 현재 폼 값이 다르면 저장 버튼 옆에 "· 수정됨" 텍스트 노출.

### Permissions

- **D-12:** 읽기(`GET /api/work-logs/:ym`, `GET /api/work-logs/:ym/preview`, `GET /api/work-logs`): 인증된 모든 staff 허용 (assistant도 조회 가능).
- **D-13:** 쓰기(`PUT /api/work-logs/:ym`, `DELETE`): **admin only** (`requireAdmin` 패턴 재사용). 작성법 1항 "소방안전관리자가 월 1회 이상 작성" — 관리자 책임.
- **D-14:** 엑셀 출력은 프론트에서 수행 (fetch template → fflate patch → download blob). 서버 엔드포인트 불필요. 일일 업무 일지와 동일 패턴.
- **D-15:** 일반 staff에게는 저장/출력 버튼 비활성화 또는 숨김. 페이지 자체는 읽기 전용으로 진입 가능.

### Auto-Prefill Logic (server-side `GET /:ym/preview`)

작성법 sheet의 셀 매핑 규칙을 그대로 서버가 계산해서 반환:

- **D-16:** **기본 정보**:
  - `manager_name`: `SELECT name FROM staff WHERE role='admin' ORDER BY appointed_at ASC LIMIT 1`. 여러 admin이 있으면 가장 오래 등록된 사람. 없으면 빈 문자열.

- **D-17:** **소방시설** (C10/AA10/Y12/Y14):
  - `fire_content` = 정적 상수:
    ```
    소화기 - 압력, 약제 상태
    소화전 - 호스, 관창 상태, 표시등 상태
    S/P - 밸브 개폐 상태, 압력 상태
    소방 펌프 - 수동 기동 점검
    ```
  - `fire_action`: 해당 월(checked_at 기준)의 remediation 레코드 중 `category IN ('소화기','소화전','스프링클러','소방펌프')`인 불량 조치 내역을 라인별로 집계. 각 라인 포맷: `{location} {category}: {resolutionMemo || memo}`. 여러 건이면 줄바꿈 구분. 없으면 빈 문자열.
  - `fire_result`: `fire_action`이 비어 있으면 `'ok'`, 아니면 `'bad'`.

- **D-18:** **피난방화시설** (C14/AA14/Y19/Y21): 동일 로직, `category IN ('방화셔터','방화문','유도등')`.
  - `escape_content` 상수:
    ```
    방화셔터 - 작동 상태 점검
    방화문 - 닫힘상태, 도어 체크 상태
    유도등 - 점등 상태, 전원 상태
    ```

- **D-19:** **화기취급감독** (C17): 정적 상수만, 자동 집계 없음.
  - `gas_content` 상수:
    ```
    B1F - 직원식당
    B4F - 보일러
    ```
  - Y26/Y28/AA17 셀은 **항상 빈 값** 출력. (작성법에 로직 비어 있음 — 사용자 요구)

- **D-20:** **기타사항** (C24): `schedule_items` 쿼리로 동적 프리필.
  - `etc_content`: 해당 월에 `inspection_category='소방'` AND 해당 월 내 날짜인 schedule_items의 `title`을 한 줄씩 나열. 없으면 빈 문자열. 정렬은 `date ASC`.
  - Y33/Y35/AA24 셀은 **항상 빈 값** 출력.

- **D-21:** 집계 기간: 해당 월의 1일 00:00 ~ 말일 23:59 (Asia/Seoul). KST 처리는 기존 `dailyReportCalc.ts` 패턴 참고.

- **D-22:** `remediation` 카테고리가 위에 나열된 이름과 정확히 일치하는지는 RESEARCH 단계에서 실제 DB 데이터 샘플로 확인해야 함. 혹시 카테고리 이름이 다르면 매핑 테이블 필요 (예: `'sprinkler' → '스프링클러'`).

### Excel Generation (generateExcel.ts 패턴 재사용)

- **D-23:** 새 함수 `generateWorkLogExcel(yearMonth: string, data: WorkLogPayload)` in `src/utils/generateExcel.ts`. 기존 파일에 append — 별도 파일 분리 안 함 (프로젝트 컨벤션).
- **D-24:** **템플릿 파일**: `작업용/점검 일지 양식/소방안전관리자 업무 수행 기록표.xlsx` 를 `cha-bio-safety/public/templates/worklog_template.xlsx` 로 **복사**. 원본(작성법 시트 포함)은 작업용 폴더에 그대로 두고, 런타임용은 `작성법` 시트를 **제거**한 버전이 이상적이지만, fflate 기반 시트 삭제는 복잡하므로 **작성법 시트가 포함된 채로 그대로 배포**하고 양식 시트만 패치. 출력 파일에 작성법 시트가 같이 포함돼도 원본 구조 보존 의도와 부합하므로 수용.
- **D-25:** 패치 대상 셀 (양식 시트 = sheet1, inlineStr 또는 sharedStrings 추가):
  | 셀 | 값 |
  |----|-----|
  | C4 | `year` (숫자) |
  | E4 | `month` (숫자) |
  | G4, K4, M4 | `lastDayOfMonth` (숫자) |
  | U4 | `manager_name` |
  | C10 | `fire_content` |
  | C14 | `escape_content` |
  | C17 | `gas_content` |
  | C24 | `etc_content` |
  | Y12 | `fire_result === 'ok' ? '√' : ''` |
  | Y14 | `fire_result === 'bad' ? '√' : ''` |
  | Y19 | `escape_result === 'ok' ? '√' : ''` |
  | Y21 | `escape_result === 'bad' ? '√' : ''` |
  | AA10 | `fire_action` |
  | AA14 | `escape_action` |
  | Y26, Y28, Y33, Y35, AA17, AA24 | `''` (빈 값 — 덮어쓰지 않거나 빈 문자열로 덮어씀) |
- **D-26:** `√` 문자는 유니코드 U+221A. sharedStrings에 추가하거나 inline string으로 삽입. 기존 양식에 이미 `√` 문자가 sharedStrings에 존재할 가능성 높음 — RESEARCH에서 확인.
- **D-27:** 셀 서식(폰트, 테두리, 정렬)은 **보존**. 값만 교체. 기존 generateExcel.ts의 `patchCell(sheetXml, addr, value)` 패턴 재사용 (line 26-40 부근 참고). 스타일 인덱스(`s="..."`) 건드리지 않음.
- **D-28:** 다중 라인 텍스트(`fire_action`, `etc_content` 등)는 셀 내 줄바꿈 문자(`&#10;`)로 처리. 해당 셀의 스타일에 `wrapText="1"`가 이미 있어야 줄바꿈 렌더링. 원본 xlsx가 wrapText 없으면 해당 셀만 스타일 패치 필요 — RESEARCH에서 확인 후 결정.
- **D-29:** 파일명: `소방안전관리자_업무수행기록표_${year}년_${month}월.xlsx`. Content-Disposition 자동 처리(브라우저 download attribute).

### List / History View (Future-proof minimal)

- **D-30:** `GET /api/work-logs` — 전체 월 목록 반환 (id, year_month, updated_at, updated_by_name). 페이지에서 "과거 월" 이동용.
- **D-31:** 페이지 상단에 "이전 월" 화살표가 바로 가려면 전체 목록이 필요. 간단히 useQuery로 전체 목록 캐시 (월 1회 쓰기라 사이즈 작음).
- **D-32:** 삭제 UI 미제공 — 법정 기록이므로 v1.5+ (Phase 21과 동일 방침).

### SideMenu Integration

- **D-33:** SideMenu `MENU`에 `'문서 관리'` 섹션의 Phase 21 항목 바로 아래에 추가:
  ```ts
  { label: '업무 수행 기록표', path: '/worklog', badge: 0, soon: false }
  ```
- **D-34:** `DesktopSidebar.DESKTOP_SECTIONS`, `DEFAULT_SIDE_MENU` (api.ts) 동일 3곳 패치 (Phase 21에서 확립된 패턴). `migrateLegacyMenuConfig` forward-merge는 Phase 21에서 이미 수정되어 있으므로 추가 작업 불필요 — 기존 메뉴 config 사용자에게 자동으로 새 항목 보임.

### API Routes

- **D-35:** 새 라우트 파일들 (`functions/api/work-logs/`):
  - `index.ts` — GET(list, all staff), (POST 없음 — PUT으로 upsert)
  - `[yearMonth].ts` — GET(read, all staff) / PUT(upsert, admin only) / DELETE(admin only, future-proof)
  - `[yearMonth]/preview.ts` — GET(auto-aggregate, all staff) — 저장 없이 계산만
- **D-36:** 응답 형식: 기존 `{ success: true, data }` / `{ success: false, error }` 패턴.
- **D-37:** `year_month` 파라미터 검증: 정규식 `/^\d{4}-(0[1-9]|1[0-2])$/`. 불일치 시 400.

### api.ts Client Surface

- **D-38:** 새 namespace `workLogApi`:
  ```ts
  export const workLogApi = {
    list:    () => api.get<WorkLogListItem[]>('/work-logs'),
    get:     (ym: string) => api.get<WorkLog | null>(`/work-logs/${ym}`),
    preview: (ym: string) => api.get<WorkLogPreview>(`/work-logs/${ym}/preview`),
    save:    (ym: string, body: WorkLogPayload) => api.put<WorkLog>(`/work-logs/${ym}`, body),
  }
  ```
- **D-39:** 타입 정의는 `src/types/index.ts`에 추가.

### Claude's Discretion

- Form 카드 스타일 세부(spacing, color)는 DailyReportPage와 시각적 일관성 유지 범위에서 자유
- "양호/불량" toggle UI 형태 (버튼 pair vs radio vs switch)
- 월 picker 위젯 구현 (기존 일일업무일지 날짜 picker 재사용 여부)
- Toast 문구 한글 카피
- 저장 중 disabled 상태 표시
- "수정됨" 배지 디자인
- remediation 카테고리 이름 매핑이 필요할 경우의 mapping table 구현 세부

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` §업무수행기록표 작성 — WORKLOG-01, WORKLOG-02, WORKLOG-03
- `.planning/ROADMAP.md` §"Phase 22" — goal + 4 success criteria
- `.planning/phases/21-documents-page-ui/21-CONTEXT.md` — Phase 21 확정 메뉴 통합 패턴 (Phase 18 forward-merge 수정 포함)

### Legal Form Template (CRITICAL — source of truth for cell mappings)
- `작업용/점검 일지 양식/소방안전관리자 업무 수행 기록표.xlsx` — 원본 양식. **"양식" 시트 + "작성법" 시트** 포함. 작성법 시트는 셀별 입력 규칙을 명시.
- `작업용/점검 일지 양식/소방안전관리자 업무 수행 기록표.pdf` — 인쇄본 참고용 (시각적 레이아웃)
- `작업용/점검 일지 양식/소방안전관리자 업무 수행 기록표.png` — PDF 캡처

**작성법 시트 내용 요약 (downstream agent는 원본 xlsx를 직접 읽어 검증 필수):**
- C4 현재 년 숫자 / E4 현재 월 숫자 / G4,K4,M4 현재 월의 말일 숫자 / U4 관리자 이름
- C10 소화기·소화전·S/P·소방펌프 정적 문구 / C14 방화셔터·방화문·유도등 정적 문구 / C17 B1F 직원식당·B4F 보일러 정적 문구 / C24 "해당 월에 구분 '소방'의 일정이 있으면 기재"
- Y12/Y14 소방시설 양호/불량 √ (소화기 등 불량조치 유무) / Y19/Y21 피난방화시설 / Y26,Y28,Y33,Y35 비어둠
- AA10 소방시설 조치내역 / AA14 피난방화시설 조치내역 / AA17,AA24 비어둠

### Existing Frontend Patterns (REUSE, don't reinvent)
- `cha-bio-safety/src/pages/DailyReportPage.tsx` — 페이지 구조, 날짜 이동 UI, 카드 레이아웃, textarea 스타일, preview+save+export 플로우 (전체 파일 참고)
- `cha-bio-safety/src/utils/dailyReportCalc.ts` — 클라이언트 측 데이터 집계 패턴 (서버에서 preview 계산하는 경우 참고용)
- `cha-bio-safety/src/utils/generateExcel.ts` — fflate 기반 xlsx 패치 패턴. 특히 `generateDailyExcel`, `addShrinkStyle`, `getCellStyleIdx`, `patchCell` 유틸 재사용. 새 함수 `generateWorkLogExcel` 을 같은 파일에 append.
- `cha-bio-safety/public/templates/daily_report_template.xlsx` — 디렉토리에 템플릿 xlsx를 어떻게 두는지 예시
- `cha-bio-safety/src/utils/api.ts` — namespace 패턴 (`dailyReportApi`, `documentsApi` 참고)
- `cha-bio-safety/src/stores/authStore.ts` — `useAuthStore().staff?.role` admin 체크

### Existing Backend Patterns
- `cha-bio-safety/functions/api/daily-report/` — 일일업무일지 라우트 구조 (get/save/preview 분리 패턴)
- `cha-bio-safety/functions/api/remediation/index.ts` — remediation list 쿼리 + 카테고리 필터
- `cha-bio-safety/functions/api/schedule/` — schedule_items 쿼리 + inspection_category 필터
- `cha-bio-safety/functions/api/documents/_helpers.ts` — requireAdmin 재사용 가능 (또는 유사 헬퍼)
- `cha-bio-safety/migrations/0045_push_subscriptions.sql` — 가장 최근 마이그레이션 네이밍/스타일 참고

### Phase 21 Menu Integration (mirror exactly)
- `cha-bio-safety/src/components/SideMenu.tsx` — MENU 상수 (Phase 21에서 이미 /documents 추가됨)
- `cha-bio-safety/src/components/DesktopSidebar.tsx` — DESKTOP_SECTIONS
- `cha-bio-safety/src/utils/api.ts` — DEFAULT_SIDE_MENU + migrateLegacyMenuConfig
- `cha-bio-safety/src/App.tsx` — lazy route registration + PAGE_TITLES

### Database Schema References
- `cha-bio-safety/migrations/0001_init.sql` — staff 테이블 (role='admin', appointed_at)
- `cha-bio-safety/migrations/0012_check_records_resolution.sql` — check_records status 컬럼
- `cha-bio-safety/migrations/0029_schedule_inspection_category.sql` — schedule_items.inspection_category
- `cha-bio-safety/src/types/index.ts` — RemediationRecord, ScheduleItem 타입

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **DailyReportPage 전체 구조** — 날짜 이동 헤더, 카드 섹션, textarea 패턴, generating 상태 관리, query + mutation 조합 — 거의 그대로 월 선택 버전으로 재사용 가능
- **generateExcel.ts 유틸** — `fflate.unzipSync`, `zipSync`, `patchCell`, `getCellStyleIdx`, `addShrinkStyle` 모두 이미 존재. `generateWorkLogExcel`은 같은 파일에 append하는 새 함수 하나만 추가하면 됨.
- **remediationApi.list({ category, days })** — 카테고리 필터 이미 지원, `days` 파라미터로 월 범위 조회 가능 (또는 서버 쿼리를 직접 짜도 됨)
- **scheduleApi.list(year, month)** — 월별 일정 조회 이미 존재
- **useAuthStore** — role 체크
- **Phase 21 확립 메뉴 통합 3-patch 패턴** — SideMenu + DesktopSidebar + DEFAULT_SIDE_MENU 동시 수정, migrateLegacyMenuConfig는 이미 forward-merge 수정됨

### Established Patterns
- D1 `env.DB.prepare(sql).bind(...).run()` 트랜잭션 없이 단순 INSERT/UPDATE/UPSERT (`ON CONFLICT DO UPDATE`)
- `functions/api/{resource}/[param].ts` 동적 라우트 패턴
- 클라이언트 템플릿 로딩: `fetch('/templates/X.xlsx')` → `unzipSync` → 패치 → `zipSync` → Blob → download
- 일일업무일지처럼 preview는 서버 계산, 저장은 upsert

### Integration Points
- 새 파일들:
  - `cha-bio-safety/migrations/0047_work_logs.sql`
  - `cha-bio-safety/functions/api/work-logs/index.ts` (GET list)
  - `cha-bio-safety/functions/api/work-logs/[yearMonth].ts` (GET/PUT/DELETE)
  - `cha-bio-safety/functions/api/work-logs/[yearMonth]/preview.ts` (GET preview)
  - `cha-bio-safety/src/pages/WorkLogPage.tsx`
  - `cha-bio-safety/public/templates/worklog_template.xlsx` (copy from 작업용)
- 수정되는 파일:
  - `cha-bio-safety/src/utils/generateExcel.ts` (+ `generateWorkLogExcel` 함수)
  - `cha-bio-safety/src/utils/api.ts` (+ `workLogApi` namespace + `DEFAULT_SIDE_MENU` 새 항목)
  - `cha-bio-safety/src/components/SideMenu.tsx` (+ MENU 새 항목)
  - `cha-bio-safety/src/components/DesktopSidebar.tsx` (+ DESKTOP_SECTIONS 새 항목)
  - `cha-bio-safety/src/App.tsx` (+ lazy route + PAGE_TITLES)
  - `cha-bio-safety/src/types/index.ts` (+ WorkLog, WorkLogPreview, WorkLogPayload 타입)

### Constraints from Existing Code
- `xlsx-js-style` 신규 라이브러리 추가 금지 (ROADMAP D-23 명시) — 기존 fflate 패턴만 사용
- `strict: false` TypeScript — 과도한 타입 체조 불필요
- 인라인 스타일 + CSS 변수만 사용, Tailwind/CSS modules 금지

</code_context>

<specifics>
## Specific Ideas

- "한달에 한번 말일에 가까운 근무일에 작성해서 보고" — 실제 사용 빈도 낮음(월 1회), 따라서 자동저장/디바운스 등 고급 UX 불필요. 명시적 저장 버튼으로 충분.
- 일일업무일지와 구조는 같지만 주기가 달라서 날짜 picker → 월 picker로 치환. 사용자는 "같은 느낌"이면 친숙.
- 대부분의 필드가 자동 집계라 사용자가 해야 할 일은: 월 선택 → 내용 훑어보고 필요시 수정 → 저장 → 엑셀 출력.
- 관리자 이름 자동 프리필은 staff role='admin' 쿼리. 4인 팀에 admin 1명이면 정확히 그 사람. 2명 이상이면 가장 오래 등록된 사람이 소방안전관리자일 가능성 높음 — 관리자가 직접 수정 가능하므로 틀려도 UX 타격 없음.
- 양식 원본이 한글 보존 양식이라 셀에 한국어 값을 넣을 때 UTF-8 XML escape 주의 (`&`, `<`, `>` 이스케이프). 기존 `patchCell` 유틸이 이미 처리할 가능성 높음 — RESEARCH에서 확인.

</specifics>

<deferred>
## Deferred Ideas

- 삭제 UI — v1.5+ (법정 기록이므로 기본 비삭제)
- 작성 알림/리마인더 (말일 근처 푸시) — 별도 phase 또는 v1.5+
- PDF 출력 — 엑셀만 제공 (요구사항 범위 외)
- 여러 관리자 선택 UI — 현재는 첫 번째 admin 자동 프리필 + 편집 가능으로 충분
- 화기취급감독 / 기타사항의 자동 불량 판정 로직 — 작성법에 규칙 없음. v1.5+에서 필요 시 확장.
- 월별 비교/통계 뷰 — 요구사항 외
- 작성법 시트 제거한 clean 템플릿 배포 — fflate로 시트 삭제는 복잡, 현재는 작성법 포함 채 배포하고 출력 파일에도 동반 (원본 구조 보존 의도)
- 서명 이미지 삽입 — 수행자(서명) 필드는 현재 텍스트로 처리. 이미지 서명은 미래 요구 시 확장
- 여러 수행자 기록 — 현재는 단일 관리자. 여러 수행자 기록은 v1.5+

</deferred>

---

*Phase: 22-form-excel-output*
*Context gathered: 2026-04-09*
