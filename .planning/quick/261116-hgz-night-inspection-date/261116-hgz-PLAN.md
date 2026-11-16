---
phase: quick-261116-hgz
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/migrations/0107_schedule_night_date.sql
  - cha-bio-safety/functions/_lib/maint.ts
  - cha-bio-safety/functions/api/schedule/index.ts
  - cha-bio-safety/src/types/index.ts
  - cha-bio-safety/src/utils/api.ts
  - cha-bio-safety/src/pages/SchedulePage.tsx
autonomous: true
requirements:
  - NID-01  # migrations/0107_schedule_night_date.sql 신규 — night_date TEXT nullable + 재적용 금지 주석
  - NID-02  # maint.ts hasNightEvent() 를 category='fire' AND night_date=?1 정확매칭으로 교체
  - NID-03  # GET /api/schedule 응답에 nightDate 추가 + POST INSERT 에 night_date 컬럼/바인드 추가
  - NID-04  # ScheduleItem.nightDate + scheduleApi.create body 타입에 night_date 추가
  - NID-05  # AddModal nightDate 상태 + handleCat/handleFireSub 리셋 + isNightEligibleFire 플래그
  - NID-06  # 소방 2개 제목에서만 내용 textarea rows=1 + height 44 로 압축 (나머지는 rows=3 그대로)
  - NID-07  # 종료일 블록 뒤 "야간 점검일" 조건부 date input + handleSave 조건부 스프레드
  - NID-08  # 범위 제한 — EditModal / 다른 구분 / 공유 시작·종료일 블록 1바이트 변경 0

must_haves:
  truths:
    - "월간 점검 계획 > 일정 추가에서 구분=소방 + 제목=소방 상반기 종합정밀점검 또는 소방 하반기 작동기능점검일 때만 종료일 아래에 '야간 점검일 (선택)' date input 이 나타난다"
    - "같은 조건에서 내용 입력칸이 1행(height 44)으로 줄어들어 다른 입력칸과 높이가 같아지고, 그만큼 시작일/종료일 블록이 위로 당겨진다"
    - "제목=소방 시설물 공사 / 소방 관공서 불시 점검 과 구분=inspect/task/event/elevator 에서는 내용칸이 rows=3 그대로이고 야간 점검일 칸이 나타나지 않는다"
    - "구분을 바꾸거나 소방 제목을 바꾸면 입력해 둔 야간 점검일이 초기화된다"
    - "야간 점검일을 입력하고 저장하면 schedule_items.night_date 에 그 날짜가 저장되고, 비워 두면 night_date=NULL 로 저장된다"
    - "화재수신반 점검모드가 night_date 에 등록된 날짜에만 21:00 까지 연장되고, category='event' 낮시간 투어/지원 일정으로는 더 이상 연장되지 않는다"
    - "cd cha-bio-safety && npx tsc --noEmit 이 에러 0으로 통과한다"
  artifacts:
    - path: "cha-bio-safety/migrations/0107_schedule_night_date.sql"
      provides: "schedule_items.night_date TEXT nullable 컬럼 추가 (사용자 1회 수동 적용)"
      contains: "ALTER TABLE schedule_items ADD COLUMN night_date TEXT"
    - path: "cha-bio-safety/functions/_lib/maint.ts"
      provides: "hasNightEvent() — night_date 정확매칭 기반 야간연장 판정"
      contains: "night_date = ?1"
    - path: "cha-bio-safety/functions/api/schedule/index.ts"
      provides: "night_date 왕복 (GET 응답 nightDate / POST INSERT 바인드)"
      contains: "night_date"
    - path: "cha-bio-safety/src/pages/SchedulePage.tsx"
      provides: "AddModal 소방 2개 제목 전용 야간 점검일 입력 + 내용칸 압축"
      contains: "야간 점검일"
  key_links:
    - from: "AddModal 야간 점검일 input (nightDate state)"
      to: "scheduleApi.create payload night_date"
      via: "handleSave 조건부 스프레드 (빈 문자열이면 키 자체 미전송)"
      pattern: "night_date: nightDate"
    - from: "POST /api/schedule body.night_date"
      to: "schedule_items.night_date 컬럼"
      via: "INSERT 컬럼 목록 + .bind() 말미 body.night_date ?? null"
      pattern: "body\\.night_date"
    - from: "schedule_items.night_date"
      to: "computeMaint() autoOff = '21:00'"
      via: "hasNightEvent(env, todayStr) — category='fire' AND night_date=오늘"
      pattern: "category = 'fire' AND night_date"
---

<objective>
화재수신반 점검모드의 "야간 연장" 판정 소스를 교체하고, 그 소스를 사람이 직접 입력하는 UI 를 만든다.

현재 `functions/_lib/maint.ts` 의 `hasNightEvent()` 는 그날 `schedule_items.category='event'` 행이
있으면 점검모드 자동 OFF 시각을 17:30 → 21:00 으로 연장한다. 그런데 실측 확인 결과 `category='event'`
로 등록된 일정은 전부 "투어"/"지원" 같은 **낮 시간(09:00~16:00) 행사**이고 저녁 등록은 0건이라,
야간 연장 신호로 전혀 쓸 수 없다. 즉 이 분기는 사실상 오작동(낮 행사에 21:00 연장)이다.

사용자 확정 정의: **"화재수신반에서의 야간 일정 = 소방 점검이 야간까지 이어지는 경우."**
따라서 월간 점검 계획 > 일정 추가에서 소방 종합정밀/작동기능점검을 등록할 때 "야간 점검일"을
직접 입력받고, 점검모드가 그 날짜를 정확매칭으로 참조하게 한다.

Purpose: 추측 기반 신호(category='event')를 사람이 명시 입력한 사실(night_date)로 바꿔
점검모드 연장이 실제 야간 작업일에만 걸리게 한다.

Output:
- 신규 마이그레이션 1개(사용자가 1회 수동 적용)
- 백엔드 2파일(maint.ts, schedule/index.ts) + 타입 2파일(types/index.ts, utils/api.ts)
- 프론트 1파일(SchedulePage.tsx AddModal 만)
신규 의존성 0. 캘린더·대시보드 등 다른 화면에 night_date 표시 기능은 요청 범위 밖이므로 추가하지 않는다.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md

소스 루트는 리포 루트가 아니라 `cha-bio-safety/` 서브디렉토리다. 아래 경로는 모두 그 기준.

@cha-bio-safety/functions/_lib/maint.ts
@cha-bio-safety/functions/api/schedule/index.ts
</context>

<interface_context>
아래는 메인 세션이 **직접 파일을 읽어 확정한 사실**이다. 추가 탐색·재조사·재설계 없이 그대로
신뢰할 것. production D1 조회도 이미 끝났다 — executor 는 D1 을 일절 건드리지 않는다.

**A. `src/pages/SchedulePage.tsx` — AddModal (수정 대상은 AddModal 뿐, EditModal 은 1146줄~ 로 범위 밖)**

- 상태 선언: 818~822줄에 `cat`/`insCat`/`inspTitle`/`title`/`memo`,
  835~843줄에 `date`/`time`/`endDate`/`endTime`/`elevSub`/`elevAgency`/`fireSub`/`fireAgency`/`saving`.
  `const [endDate,   setEndDate]   = useState(defaultDate)` 는 **837줄**.
- `handleCat` (824~827줄):
  `const handleCat = (v: ScheduleCategory) => { setCat(v); setInsCat(''); setInspTitle(''); setTitle(''); setMemo('') }`
  (실제로는 825~826 두 줄로 쪼개져 있음)
- `handleFireSub` (846줄):
  `const handleFireSub = (v: FireSubCat) => { setFireSub(v); setFireAgency(FIRE_AGENCY[v]) }`
- `FIRE_SUBCATS` (66줄):
  `['소방 상반기 종합정밀점검', '소방 하반기 작동기능점검', '소방 시설물 공사', '소방 관공서 불시 점검'] as const`
  → **야간 점검일 대상은 앞의 2개뿐.**
- 소방 분기 JSX: `{cat === 'fire' && (` 는 **1046줄**. 내부 구성 = 제목 버튼그리드(1048~1061) →
  업체 및 기관 input(1062~1065) → **내용 textarea 블록(1066~1071)**. 닫힘은 1072~1073.
- **내용 textarea 현재 코드 (1066~1071줄, verbatim):**
  ```
              <div>
                <label style={lbl}>내용 <span style={{ fontWeight:400, color:'var(--text-tertiary)' }}>(선택)</span></label>
                <textarea value={memo} onChange={e=>setMemo(e.target.value)}
                  placeholder="상세 내용을 입력하세요" rows={3}
                  style={{ ...inp, resize:'none', lineHeight:1.5 }} />
              </div>
  ```
  **중요 — `rows={3}` 은 이 파일에 3곳(1009, 1039, 1069줄) 있다.** 1009=일반점검(inspect) 분기,
  1039=업무/행사 분기, **1069=소방 분기**. 반드시 소방 분기(1046줄 `{cat === 'fire' && (` 안,
  업체 및 기관 input 바로 다음) 것만 수정한다. Edit 시 `placeholder="상세 내용을 입력하세요" rows={3}`
  단독 문자열은 유일하지 않으므로, 앞뒤 줄을 충분히 포함한 고유 컨텍스트로 치환할 것.
- **공유 시작일/종료일 블록 (1075~1101줄): 1바이트도 수정하지 않는다.**
  시작일/시작시간 flex row(1076~1087), 종료일/종료시간 flex row(1090~1101).
  종료일 input 스타일: `style={{ ...inp, display:'block', WebkitAppearance:'none', height:44 }}`, `min={date}`.
  이 블록들은 모든 구분이 공유하므로 수정하면 inspect/task/event/elevator 가 전부 오염된다.
- 1102줄 빈 줄 → **1103줄 주석 `{/* N일 미리보기 — ... */}` → 1104줄 `{rangeDays > 1 && (`.**
  신규 "야간 점검일" 블록은 **1101줄 `</div>`(종료일 row 닫힘) 다음, 1103줄 주석 앞**에 삽입한다.
- 폼 wrapper(954줄 부근)는 `display:'flex', flexDirection:'column', gap:16` →
  내용칸이 짧아지면 **아래 블록들이 자동으로 위로 당겨진다. "시작일/종료일을 위로 올리는" 별도 구현 불필요.**
- `handleSave` payload (908~917줄, verbatim):
  ```
        await scheduleApi.create({
          title:              finalTitle,
          date,
          time:               time || undefined,
          category:           cat,
          assigneeId:         staffId,
          inspectionCategory: finalInsCat,
          memo:               memo || undefined,
          ...(hasRange ? { end_date: endDate } : {}),
        })
  ```
  (`const hasRange = endDate && endDate > date` 는 903줄) → 같은 조건부 스프레드 패턴을 재사용한다.
- 스타일 상수 (파일 말미): `lbl` = 1242줄 부근
  `{ fontSize:12, fontWeight:700, color:'var(--text-tertiary)', display:'block', marginBottom:6, lineHeight:1 }`,
  `inp` = 1246줄 부근 — `padding:'11px 12px'`, `fontSize:13`, **명시적 height 없음**.
  그래서 날짜 input 들은 개별적으로 `height:44` 를 붙인다.
- 선택 필드 라벨 패턴(1007·1067·1092줄 공통):
  `<label style={lbl}>내용 <span style={{ fontWeight:400, color:'var(--text-tertiary)' }}>(선택)</span></label>`

**B. `functions/api/schedule/index.ts` (현재 상태)**

- `onRequestGet`: `SELECT * FROM schedule_items WHERE 1=1` + date/month 조건 → `.map` 안에서
  반환 객체를 camelCase 로 조립. 반환 객체 마지막 두 줄은
  `inspectionCategory:  r.inspection_category ?? undefined,` / `memo:                r.memo ?? undefined,`
  (`SELECT *` 이므로 **쿼리 수정 없이** `r.night_date` 가 그대로 들어온다.)
- `onRequestPost`: `body` 인라인 타입의 마지막 필드가 `end_date?: string`.
  INSERT 는 **88줄 단 1곳**:
  `INSERT INTO schedule_items (id, title, date, time, assignee_id, category, status, inspection_category, memo, end_date) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`
  → `.bind(id, body.title.trim(), body.date, body.time ?? null, body.assigneeId ?? staffId, body.category, body.inspectionCategory ?? null, body.memo ?? null, body.end_date ?? null,)`
- 전수 확인 완료: 리포 전체에서 `INSERT INTO schedule_items` 는 이 1곳뿐이고 컬럼명을 명시한다.
  다른 리더(dashboard/stats.ts, daily-report, leaves, legal, work-logs, [id].ts)는 모두
  필요한 컬럼만 SELECT/UPDATE 하므로 **nullable 컬럼 추가는 전부 하위호환**이다.

**C. `functions/_lib/maint.ts` (현재 상태 — 이번 세션 초반에 메인이 이미 category='fire' 버그와 WORK_START=08:30 를 고쳐 둔 상태)**

- 29~40줄: `isFireInspectionDay()` — `category = 'fire'` 로 소방점검일 판정. **수정 금지.**
- **43~50줄 `hasNightEvent()` 현재 코드 (교체 대상):**
  ```ts
  // 오늘 야간 일정? category='event' (§3④). range-aware. 저녁 time 필터는 v1 미적용.
  export async function hasNightEvent(env: MaintEnv, dateStr: string): Promise<boolean> {
    const r = await env.DB.prepare(
      `SELECT 1 FROM schedule_items
       WHERE (date = ?1 OR (date <= ?1 AND end_date >= ?1))
         AND category = 'event' LIMIT 1`,
    ).bind(dateStr).first()
    return !!r
  }
  ```
- 호출부는 **78줄과 101줄 2곳**, 둘 다
  `const autoOff = (await hasNightEvent(env, todayStr)) ? '21:00' : '17:30'`.
  시그니처가 동일하므로 **호출부·computeMaint()·setManualOverride() 는 1바이트도 수정하지 않는다.**

**D. 타입 2곳**

- `src/types/index.ts` **14줄** (한 줄 전체):
  `export interface ScheduleItem { id:string; title:string; date:string; endDate?:string; time?:string; assigneeId?:string; category:ScheduleCategory; status:ScheduleStatus; inspectionCategory?:string; memo?:string }`
- `src/utils/api.ts` **118줄**:
  `create: (body: { title:string; date:string; time?:string; category:string; assigneeId?:string; inspectionCategory?:string; memo?:string }) =>`
  (현재 `end_date` 가 타입에 없지만 SchedulePage 가 스프레드로 넘기고 있어 통과 중 —
  night_date 는 명시 추가해 둔다.)

**E. 마이그레이션 주석 컨벤션 (`migrations/0103_panel_alarms_confirmed.sql` 실제 헤더)**
```
-- 0103: panel_alarms.confirmed 컬럼 — 영상+오디오 교차-source 동시확인된 경보 여부(0=미확정, 1=확정).
-- trigger.ts dedupe 단계에서 ...
-- 기존 21행은 DEFAULT 0 으로 자동 백필된다.
-- 경고: 이 파일은 wrangler d1 execute --file 로 1회 수동 적용한다. SQLite 는 ADD COLUMN IF NOT EXISTS 미지원 → 재실행 시
-- 'duplicate column: confirmed' 에러가 나는 것이 정상이며, 재적용 금지.
ALTER TABLE panel_alarms ADD COLUMN confirmed INTEGER NOT NULL DEFAULT 0;
```
→ 0107 도 같은 형식(의미 / 입력 경로 / 재적용 금지 경고).

**F. tsconfig**
`include: ["src","functions"]`, `strict: false` → `npx tsc --noEmit` 한 번으로 프론트+Functions
양쪽이 전부 타입체크된다.
</interface_context>

<critical_constraints>
이 콘솔은 **production 전용**이다(cbc7119 / cha-bio-db / cha-bio-storage, 브랜치 `production`).

**executor 절대 금지:**
1. `wrangler d1 execute` — 읽기 SELECT 든 쓰기 든, `--remote` 든 `--local` 든 **일절 실행 금지.**
   0107 마이그레이션은 **파일만 생성**한다. 적용은 사용자가 직접 한다.
2. `wrangler pages deploy` 등 **모든 배포 명령 금지.** 코드 수정 + git 커밋까지만.
3. `git add -A` / `git add .` **금지.** 이 리포에는 untracked 잔재가 있어 광범위 add 사고 전례가 있다.
   변경 파일 6개를 **명시적으로 나열해 스테이징**한다.
4. 커밋 메시지는 **ASCII 전용**(wrangler/훅 한글 거부 전례).
   커밋 메시지·echo 문자열에 bare `wrangler ` 나 `git commit` 리터럴을 넣지 말 것(훅 오탐).

**적용 순서 경고 (사용자 안내용 — SUMMARY 에 반드시 기재):**
`hasNightEvent()` 가 `night_date` 를 참조하므로, **0107 마이그레이션을 prod D1 에 적용하기 전에
코드를 배포하면 점검모드 조회 API 가 `no such column: night_date` 로 500** 이 된다.
반드시 ①0107 수동 적용 → ②배포 순서.

**범위 제한:**
- `EditModal`(1146줄~) 수정 금지. 기존 일정의 야간 점검일 수정 기능은 이번 요청 범위 밖.
- 공유 시작일/종료일 블록(1075~1101줄) 수정 금지.
- `category='event'` 를 쓰는 다른 로직(캘린더 표시, dashboard/stats 등) 수정 금지.
- night_date 를 캘린더·대시보드·일일보고 등에 **표시하는 기능 추가 금지**(요청에 없음).
</critical_constraints>

<tasks>

<task type="auto">
  <name>Task 1: 마이그레이션 + 백엔드/타입 체인 (night_date 왕복 + hasNightEvent 교체)</name>
  <files>cha-bio-safety/migrations/0107_schedule_night_date.sql, cha-bio-safety/functions/api/schedule/index.ts, cha-bio-safety/functions/_lib/maint.ts, cha-bio-safety/src/types/index.ts, cha-bio-safety/src/utils/api.ts</files>
  <action>
NID-01 — `migrations/0107_schedule_night_date.sql` 신규 생성(Write 툴 사용, heredoc 금지).
본문은 `ALTER TABLE schedule_items ADD COLUMN night_date TEXT;` 한 줄. 그 위에 interface_context E
의 0103 스타일 주석 헤더: ①컬럼 의미 — 소방 상반기 종합정밀점검 / 소방 하반기 작동기능점검이
야간까지 이어지는 특정 날짜(`YYYY-MM-DD`), nullable, 일정 1건당 날짜 1개 ②입력 경로 — 월간 점검
계획 > 일정 추가(AddModal) 소방 2개 제목 전용 "야간 점검일" 필드, 소비처는 `functions/_lib/maint.ts`
의 `hasNightEvent()` ③경고 — `wrangler d1 execute --file` 로 1회 수동 적용, SQLite 는
ADD COLUMN IF NOT EXISTS 미지원이라 재실행 시 `duplicate column: night_date` 에러가 나는 것이
정상이며 재적용 금지. (주석 안에서도 bare `wrangler ` 토큰은 허용 — SQL 주석은 커밋 메시지가 아님.
단 커밋 메시지에는 넣지 말 것.)

NID-03 — `functions/api/schedule/index.ts` 두 핸들러 수정.
(a) `onRequestGet` 의 `.map` 반환 객체에서 `memo:                r.memo ?? undefined,` 줄 **다음**에
`nightDate:           r.night_date ?? undefined,` 추가(기존 컬럼 정렬 공백 스타일 맞춤).
SQL 은 `SELECT *` 이므로 **쿼리문 수정 없음.**
(b) `onRequestPost` 의 `body` 인라인 타입에서 `end_date?: string` 다음 줄에 `night_date?: string` 추가.
(c) INSERT(88줄) 컬럼 목록 끝 `end_date` 다음에 `, night_date` 추가, `VALUES (...)` 에 `?` 1개 추가
(총 10개 placeholder + 리터럴 `'pending'`).
(d) `.bind(...)` 인자 리스트에서 `body.end_date ?? null,` 다음에 `body.night_date ?? null,` 추가.
**바인드 순서와 컬럼 순서가 1:1 대응하는지 눈으로 재확인할 것** — 틀리면 날짜가 엉뚱한 컬럼에 들어간다.

NID-02 — `functions/_lib/maint.ts` 의 `hasNightEvent()`(43~50줄) **본문과 주석을 교체**:
주석은 "오늘 소방점검이 야간까지 연장되는 날? schedule_items.night_date 직접 매칭
(category='event' 가정은 실측 결과 전부 낮 시간 투어/지원이라 폐기됨)." 취지로 2줄.
쿼리는 `SELECT 1 FROM schedule_items WHERE category = 'fire' AND night_date = ?1 LIMIT 1` 로,
`.bind(dateStr).first()` + `return !!r` 는 유지. **함수 시그니처
`(env: MaintEnv, dateStr: string): Promise<boolean>` 동일 유지** → 78·101줄 호출부 무수정.
range-aware(`date <= ?1 AND end_date >= ?1`) 로직은 **의도적으로 제거**한다 — night_date 는
범위가 아니라 단일 날짜이므로 정확매칭이 맞다. `isFireInspectionDay` / `computeMaint` /
`setManualOverride` 는 1바이트도 건드리지 않는다.

NID-04 — 타입 2곳.
(a) `src/types/index.ts` 14줄 `ScheduleItem` 에서 `endDate?:string;` **바로 다음**에 `nightDate?:string;` 추가.
(b) `src/utils/api.ts` 118줄 `scheduleApi.create` body 타입에서 `memo?:string` 다음에 `; night_date?:string` 추가
(기존 한 줄 인라인 스타일 유지).
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && npx tsc --noEmit</automated>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && test -f migrations/0107_schedule_night_date.sql && grep -c "ALTER TABLE schedule_items ADD COLUMN night_date TEXT" migrations/0107_schedule_night_date.sql</automated>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && grep -n "category = 'fire' AND night_date = ?1" functions/_lib/maint.ts</automated>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && test "$(grep -v '^ *//' functions/_lib/maint.ts | grep -c "category = 'event'")" = "0" && echo "EVENT-GONE-OK"</automated>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && grep -c "night_date" functions/api/schedule/index.ts && grep -n "nightDate" functions/api/schedule/index.ts src/types/index.ts && grep -n "night_date" src/utils/api.ts</automated>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && test "$(grep -c 'hasNightEvent(env, todayStr)' functions/_lib/maint.ts)" = "2" && echo "CALLSITES-INTACT-OK"</automated>
    <human-check>
      maint.ts 의 `hasNightEvent()` 가 **정확매칭 1줄 쿼리**로 바뀌었고 `date <= ?1 AND end_date >= ?1`
      range 조건이 사라졌는지, 그리고 같은 파일의 `isFireInspectionDay()`(여기는 `category = 'fire'`
      가 그대로 있어야 정상) 는 손대지 않았는지 git diff 로 확인.
      schedule/index.ts INSERT 의 컬럼 10개 ↔ `?` placeholder 9개 + `'pending'` 리터럴 ↔ `.bind()` 인자 9개가
      순서까지 1:1 대응하는지 diff 에서 직접 세어 확인.
    </human-check>
  </verify>
  <done>
0107 마이그레이션 파일 생성 완료(미적용 상태), `hasNightEvent()` 가 `category='fire' AND night_date=?1`
정확매칭으로 교체됨, GET 응답에 `nightDate` 포함, POST 가 `night_date` 를 INSERT 하며,
`npx tsc --noEmit` 이 에러 0으로 통과한다. `wrangler` 명령 실행 0회.
  </done>
</task>

<task type="auto">
  <name>Task 2: AddModal 소방 2개 제목 전용 야간 점검일 입력 + 내용칸 압축</name>
  <files>cha-bio-safety/src/pages/SchedulePage.tsx</files>
  <action>
**AddModal 만 수정한다.** EditModal(1146줄~)과 공유 시작일/종료일 블록(1075~1101줄)은 1바이트도
변경하지 않는다.

NID-05 — 상태와 리셋.
(a) 837줄 `const [endDate,   setEndDate]   = useState(defaultDate)` 다음 줄에
`const [nightDate, setNightDate] = useState('')` 추가(주변 정렬 공백 스타일 맞춤).
(b) `handleCat`(824~827줄) 의 리셋 목록에 `setNightDate('')` 추가.
(c) `handleFireSub`(846줄) 에 `setNightDate('')` 추가 → 소방 제목을 2개 대상 밖(소방 시설물 공사 /
소방 관공서 불시 점검)으로 바꿨을 때 입력값이 남아 저장되는 일을 막는다.
(d) 조건 플래그 — `handleFireSub` 선언 아래(846줄 이후, JSX 밖 컴포넌트 본문)에
`const isNightEligibleFire = cat === 'fire' && (fireSub === '소방 상반기 종합정밀점검' || fireSub === '소방 하반기 작동기능점검')`
추가. 문자열은 `FIRE_SUBCATS`(66줄) 와 **글자 하나까지 동일**해야 한다 — 복붙할 것.
`rangeDays`/`skippedCount` 같은 기존 파생값 계산부가 있으면 그 근처에 두어도 무방.

NID-06 — 내용 textarea 압축 (소방 분기 1066~1071줄 **1곳만**).
`rows={3}` → `rows={isNightEligibleFire ? 1 : 3}`,
`style={{ ...inp, resize:'none', lineHeight:1.5 }}` →
`style={{ ...inp, resize:'none', lineHeight:1.5, ...(isNightEligibleFire ? { height:44 } : {}) }}`.
(`height:44` 는 종료일/시작일 date input 과 동일한 값 → 입력칸 높이가 맞춰진다.)
**주의: 같은 파일 1009줄(일반점검)·1039줄(업무/행사) 의 `rows={3}` 은 절대 건드리지 않는다.**
Edit 의 old_string 에는 바로 윗줄 `<label style={lbl}>내용 ...` 과
`<textarea value={memo} onChange={e=>setMemo(e.target.value)}` 를 포함해도 여전히 3곳과 겹칠 수
있으므로, **1062~1065줄 업체 및 기관 input 블록까지 포함**한 고유 컨텍스트로 치환하라.
치환 후 `grep -c "rows={3}"` 가 **2** 여야 한다(남은 두 분기).

NID-07 — 야간 점검일 입력 + 저장.
(a) 종료일/종료시간 flex row 닫힘(1101줄 `</div>`) **다음**, `{/* N일 미리보기 ... */}` 주석(1103줄)
**앞**에 조건부 블록 삽입:
label 은 `<label style={lbl}>야간 점검일 <span style={{ fontWeight:400, color:'var(--text-tertiary)' }}>(선택)</span></label>`
(1092줄 종료일 라벨과 동일 패턴), input 은 `type="date"`, `value={nightDate}`,
`onChange={e=>setNightDate(e.target.value)}`, `min={date}`, `max={endDate || undefined}`,
`style={{ ...inp, display:'block', WebkitAppearance:'none', height:44 }}`.
전체를 `{isNightEligibleFire && ( <div> ... </div> )}` 로 감싼다.
시작일/종료일처럼 2열 flex 로 만들지 말고 **단독 전폭 1개 필드**로 둔다(짝이 되는 필드가 없음).
들여쓰기는 주변 JSX(10 스페이스 기준)와 맞춘다.
(b) `handleSave` payload(908~917줄) 에서 `...(hasRange ? { end_date: endDate } : {}),` **다음 줄**에
`...(nightDate ? { night_date: nightDate } : {}),` 추가. 빈 문자열이면 키 자체를 보내지 않아
서버에서 `?? null` 로 NULL 저장된다.
(c) 추가 검증 로직(야간 점검일이 범위 밖이면 toast 등)은 **넣지 않는다** — `min`/`max` 속성만으로
충분하고, 요청 범위 밖이다.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && npx tsc --noEmit</automated>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && test "$(grep -c 'rows={3}' src/pages/SchedulePage.tsx)" = "2" && test "$(grep -c 'rows={isNightEligibleFire ? 1 : 3}' src/pages/SchedulePage.tsx)" = "1" && echo "TEXTAREA-SCOPE-OK"</automated>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && grep -n "isNightEligibleFire\|setNightDate\|야간 점검일\|night_date: nightDate" src/pages/SchedulePage.tsx</automated>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && test "$(grep -c 'setNightDate' src/pages/SchedulePage.tsx)" -ge "4" && echo "RESET-WIRED-OK"</automated>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && git diff --stat src/pages/SchedulePage.tsx</automated>
    <human-check>
      **범위 격리 코드리뷰 (git diff src/pages/SchedulePage.tsx 전체를 눈으로 읽고 확인):**
      1. `isNightEligibleFire` 가 `cat === 'fire'` **그리고** 제목이 `소방 상반기 종합정밀점검` /
         `소방 하반기 작동기능점검` **둘 중 하나**일 때만 true 인가? 문자열이 `FIRE_SUBCATS`(66줄)와
         글자 단위로 완전히 일치하는가(공백·한글 표기 포함)?
      2. 변경된 hunk 가 ①상태 선언 1줄 ②handleCat ③handleFireSub ④isNightEligibleFire 선언
         ⑤소방 분기 textarea ⑥종료일 row 뒤 신규 블록 ⑦handleSave payload 1줄 — **총 7곳뿐**인가?
         이 외 hunk(특히 1075~1101 공유 시작일/종료일 블록, 1146줄~ EditModal, 1009/1039줄 textarea)
         가 diff 에 **단 하나도 없는가**?
      3. 소방 제목 `소방 시설물 공사` / `소방 관공서 불시 점검` 선택 시, 그리고 구분
         `inspect`/`task`/`event`/`elevator` 선택 시 — 내용칸은 `rows={3}` 경로를 타고 야간 점검일
         블록은 렌더되지 않는가(조건이 `isNightEligibleFire` 단일 게이트인지)?
      4. 신규 input 의 `style` 이 종료일 input(1094줄)과 동일한
         `{ ...inp, display:'block', WebkitAppearance:'none', height:44 }` 인가?
         압축된 textarea 의 `height:44` 와 같은 값인가?
    </human-check>
  </verify>
  <done>
소방 2개 제목에서만 내용칸이 1행(height 44)으로 줄고 종료일 아래 "야간 점검일 (선택)" date input 이
나타나며, 다른 소방 제목·다른 구분·EditModal·공유 날짜 블록은 diff 상 변경 0.
`npx tsc --noEmit` 통과. 야간 점검일 값이 `night_date` 로 create payload 에 조건부 포함된다.
  </done>
</task>

<task type="auto">
  <name>Task 3: 명시적 스테이징 + ASCII 커밋</name>
  <files>(git only)</files>
  <action>
`git status --porcelain` 로 변경 목록을 먼저 확인한다(이 리포에는 `.claire/`,
`cha-bio-safety/.recovery-260526*/` 등 untracked 잔재가 있다 — **절대 스테이징하지 말 것**).

`git add` 에 **아래 6개 경로만 명시적으로 나열**한다(`-A`/`.` 금지):
```
cha-bio-safety/migrations/0107_schedule_night_date.sql
cha-bio-safety/functions/_lib/maint.ts
cha-bio-safety/functions/api/schedule/index.ts
cha-bio-safety/src/types/index.ts
cha-bio-safety/src/utils/api.ts
cha-bio-safety/src/pages/SchedulePage.tsx
```
(이번 세션 초반에 메인이 수정한 maint.ts 의 기존 변경분이 같은 파일에 섞여 있을 수 있다 —
`git diff` 로 확인하고, 섞여 있으면 그대로 함께 커밋한다. 그 변경도 같은 작업 맥락이다.)

`git add` 후 `git status --porcelain --untracked-files=no` 와 `git diff --cached --stat` 로
**스테이징된 파일이 정확히 위 6개(±maint.ts 선행 변경)뿐인지** 확인한다.

커밋 메시지는 **ASCII 전용**(한글 금지, 훅이 거부함). bare `wrangler ` 토큰과 `git commit`
리터럴 문자열을 메시지·echo 에 넣지 말 것(훅 오탐 전례):
```
feat(schedule): add night_date field for fire inspection overnight extension

- migrations/0107: schedule_items.night_date TEXT (manual apply required, once)
- AddModal: night inspection date input for 2 fire titles only, memo box shrunk to 1 row
- schedule API: night_date round-trip (GET nightDate / POST insert)
- maint.ts hasNightEvent(): exact night_date match replaces category='event' heuristic
```
배포(`pages deploy`)와 D1 적용은 **실행하지 않는다.**
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328 && git log -1 --stat | head -20</automated>
    <automated>cd /Users/jykevin/Documents/20260328 && git log -1 --pretty=%s%n%b | LC_ALL=C grep -qP '^[\x00-\x7F]*$' && echo "ASCII-OK" || echo "NON-ASCII-FOUND"</automated>
    <human-check>
      `git log -1 --stat` 에 나온 파일이 정확히 의도한 것들뿐인가? `.claire/` 나
      `.recovery-260526*` 같은 untracked 잔재가 커밋에 섞이지 않았는가?
    </human-check>
  </verify>
  <done>변경 6파일(±maint.ts 선행분)이 ASCII 메시지로 1커밋에 담겼고, 잔재 파일 혼입 0. 배포·D1 적용 미실행.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| 브라우저 AddModal → POST /api/schedule | 사용자 입력 `night_date` 문자열이 서버로 넘어옴 (JWT 인증된 내부 4인 전용) |
| schedule_items.night_date → hasNightEvent() 쿼리 | 저장된 값이 점검모드 자동 OFF 시각(17:30/21:00) 판정에 사용됨 |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-hgz-01 | Tampering | POST /api/schedule `night_date` | mitigate | D1 prepared statement `.bind()` 파라미터 바인딩만 사용 — 문자열 연결 쿼리 생성 0. `hasNightEvent()` 도 `?1` 바인드 유지 |
| T-hgz-02 | Tampering | `night_date` 포맷 비정상 입력(임의 문자열) | accept | `<input type="date">` 가 `YYYY-MM-DD` 로 제한. API 직접 호출로 임의 문자열을 넣어도 `night_date = ?1` 정확매칭이 실패해 17:30 기본값으로 떨어질 뿐(fail-safe). 내부 4인 인증 사용자만 접근 |
| T-hgz-03 | Denial of Service | 마이그레이션 미적용 상태 배포 | mitigate | `no such column` 으로 점검모드 API 500 → 0107 수동 적용 후 배포 순서를 SUMMARY 와 마이그레이션 헤더 주석에 명기 |
| T-hgz-04 | Information Disclosure | GET /api/schedule 응답에 `nightDate` 추가 | accept | 내부 소방점검 일정 날짜 1개, PII 아님. 기존 일정 필드와 동일 민감도. `_middleware` JWT 게이트 통과 필요 |
| T-hgz-SC | Tampering | 패키지 설치 | n/a | **신규 의존성 0** — npm/pip/cargo install 작업 없음 |
</threat_model>

<verification>
1. `cd cha-bio-safety && npx tsc --noEmit` → 에러 0 (`include: ["src","functions"]` 이므로 프론트+Functions 동시 검증)
2. `grep -n "category = 'fire' AND night_date = ?1" functions/_lib/maint.ts` → 1건 매칭
3. 주석 제외 `category = 'event'` 잔존 0: `grep -v '^ *//' functions/_lib/maint.ts | grep -c "category = 'event'"` → `0`
4. `grep -c 'rows={3}' src/pages/SchedulePage.tsx` → `2` (일반점검·업무/행사 분기만 남음) +
   `rows={isNightEligibleFire ? 1 : 3}` → `1`
5. `hasNightEvent(env, todayStr)` 호출부 2건 그대로 유지
6. `git diff --stat` 에 변경 파일이 6개(±maint.ts 선행분)뿐 — EditModal·공유 날짜 블록 hunk 0
7. **배포·D1 적용 미실행 확인** — 세션 내 `wrangler` 실행 0회
</verification>

<success_criteria>
- [ ] `migrations/0107_schedule_night_date.sql` 생성(0103 스타일 헤더 + 재적용 금지 경고), **미적용 상태**
- [ ] `hasNightEvent()` 가 `category='fire' AND night_date=?1` 정확매칭으로 교체, 시그니처·호출부 불변
- [ ] `maint.ts` 의 `isFireInspectionDay`/`computeMaint`/`setManualOverride` 변경 0
- [ ] GET /api/schedule 응답에 `nightDate`, POST 가 `night_date` INSERT(컬럼↔바인드 순서 1:1)
- [ ] `ScheduleItem.nightDate` + `scheduleApi.create` body `night_date?` 타입 추가
- [ ] AddModal: `nightDate` 상태 + handleCat/handleFireSub 리셋 + `isNightEligibleFire` 플래그
- [ ] 소방 2개 제목에서만 내용칸 `rows={1}` + `height:44`, 나머지 2곳 `rows={3}` 그대로
- [ ] 종료일 블록 뒤 "야간 점검일 (선택)" date input (`min={date}`, `max={endDate || undefined}`, height 44)
- [ ] `handleSave` 에 `...(nightDate ? { night_date: nightDate } : {})` 조건부 스프레드
- [ ] EditModal / 공유 시작일·종료일 블록 / 다른 구분 UI / category='event' 타 로직 변경 0
- [ ] `npx tsc --noEmit` 통과
- [ ] 변경 6파일만 명시 스테이징(`git add -A` 미사용) + ASCII 커밋 1건
- [ ] `wrangler d1 execute` / `pages deploy` 실행 0회
</success_criteria>

<output>
`.planning/quick/261116-hgz-night-inspection-date/261116-hgz-SUMMARY.md` 작성.

**SUMMARY 에 반드시 포함할 사용자 후속 조치 2단계(순서 중요):**
1. `migrations/0107_schedule_night_date.sql` 을 prod D1(`cha-bio-db`)에 **1회 수동 적용**
   (`--remote`, `--file`). 재적용 금지 — 두 번째 실행은 `duplicate column: night_date` 로 실패한다.
2. 적용 **후** production 배포(`--branch production`). 순서를 뒤집으면 점검모드 조회가
   `no such column: night_date` 로 500 이 된다.

추가 기재:
- 기존 일정의 야간 점검일 **수정(EditModal) 미구현** — 잘못 입력 시 삭제 후 재등록 필요. 후속 과제.
- `category='event'` 기반 야간 연장은 **완전 폐기** — 기존 투어/지원 일정으로 21:00 연장되던
  (오)동작이 사라진다. 이제 야간 연장은 AddModal 에서 명시 입력한 날짜에만 발생.
- PWA 캐시 전례 — 사용자가 "폼이 안 바뀐다" 하면 서비스워커 캐시 의심(앱 재설치 유도).
</output>
</content>
</invoke>
