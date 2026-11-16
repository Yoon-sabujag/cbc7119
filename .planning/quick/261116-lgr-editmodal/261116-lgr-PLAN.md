---
phase: quick-261116-lgr-editmodal
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/functions/api/schedule/[id].ts
  - cha-bio-safety/src/utils/api.ts
  - cha-bio-safety/src/pages/SchedulePage.tsx
autonomous: false
requirements: [HANDOFF-1, HANDOFF-2, HANDOFF-3]

must_haves:
  truths:
    - "기간 일정(소방 상/하반기 점검) 수정 모달에 '이 날짜를 야간 점검일로 표시' 체크박스가 보인다"
    - "기간 일정 수정 모달의 날짜 필드 기본값이 시작일이 아니라 오늘 날짜다"
    - "기간 일정을 수정 저장해도 캘린더에서 시작일이 바뀌지 않는다 (앞 날짜 사라짐 없음)"
    - "체크 해제 후 저장하면 night_date 가 실제로 NULL 로 지워진다"
    - "단일 날짜 일정 수정은 기존과 완전히 동일하게 동작한다"
  artifacts:
    - path: "cha-bio-safety/functions/api/schedule/[id].ts"
      provides: "onRequestPut 조건부 SET 절 (night_date 명시 NULL 저장 가능)"
      contains: "'night_date' in body"
    - path: "cha-bio-safety/src/utils/api.ts"
      provides: "scheduleApi.update 타입에 date optional + night_date 추가"
      contains: "night_date?: string | null"
    - path: "cha-bio-safety/src/pages/SchedulePage.tsx"
      provides: "EditModal 야간 점검일 체크박스 + 기간일정 시작일 보호"
      contains: "isNightEligibleFire"
  key_links:
    - from: "cha-bio-safety/src/pages/SchedulePage.tsx (EditModal.handleSave)"
      to: "cha-bio-safety/functions/api/schedule/[id].ts (onRequestPut)"
      via: "scheduleApi.update 의 night_date 키 (null 포함)"
      pattern: "night_date: isNightDay \\? date : null"
---

<objective>
이미 등록된 **기간 일정**(예: 11/12~11/18 소방 하반기 작동기능점검)을 수정 모달(EditModal)에서 열어 **야간 점검일을 나중에 지정/해제**할 수 있게 한다.

Purpose: AddModal 에는 261116-hgz 에서 야간 점검일 입력이 이미 들어갔지만, 기존에 등록된 기간 일정은 수정 경로가 없어 야간 점검일을 지정할 방법이 없다.
Output: EditModal 체크박스 UI + `scheduleApi.update` 타입 확장 + `onRequestPut` 조건부 SET 절(명시 NULL 저장 지원).

**이 플랜은 설계 재논의 금지.** `HANDOFF.md` 에 사용자 승인 완료된 코드 스니펫까지 확정되어 있다. 아래 태스크의 코드/조건식은 HANDOFF.md 를 그대로 옮긴 것이므로 **임의 개선·리팩터·추가 기능 금지**.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/quick/261116-lgr-editmodal/HANDOFF.md
@CLAUDE.md

@cha-bio-safety/functions/api/schedule/[id].ts
@cha-bio-safety/src/utils/api.ts
@cha-bio-safety/src/pages/SchedulePage.tsx
</context>

<interface_context>
실행자가 탐색 없이 바로 쓸 수 있도록 확인된 현재 시그니처/심볼을 그대로 제공한다. (전부 검증 완료 — 재조사 불필요)

**`src/types/index.ts:14`** — `ScheduleItem` 에 `nightDate` 는 **이미 존재**한다. 타입 추가 불필요:
`export interface ScheduleItem { id:string; title:string; date:string; endDate?:string; nightDate?:string; time?:string; assigneeId?:string; category:ScheduleCategory; status:ScheduleStatus; inspectionCategory?:string; memo?:string }`

**`src/pages/SchedulePage.tsx:15`** — `localYMD(d: Date): string` 헬퍼가 파일 상단에 **이미 존재**한다 (`YYYY-MM-DD` 로컬 기준). 새로 만들지 말고 그대로 호출.

**`src/pages/SchedulePage.tsx:1254-1259`** — 모듈 하단에 `lbl`, `inp` (`React.CSSProperties`) 스타일 상수가 존재한다. EditModal 내부 입력은 전부 `{...inp}` 스프레드를 쓴다.

**`src/utils/api.ts:118`** — `scheduleApi.create` 는 이미 `night_date?:string` 을 받는다. update 만 미반영 상태.

**`functions/api/schedule/[id].ts`** — 동일 파일에 `onRequestPatch`(status 변경), `onRequestDelete`(legal_findings 가드 포함)가 함께 있다. **둘 다 건드리지 않는다.**

**DB:** `schedule_items.night_date` 컬럼은 migration 0107 로 **이미 적용됨**. 추가 마이그레이션 불필요.
</interface_context>

<scope_lock>
수정 허용 파일은 아래 3개가 전부다. 그 외 파일을 열어 수정하면 즉시 중단하고 되돌린다.

1. `cha-bio-safety/functions/api/schedule/[id].ts` — `onRequestPut` 함수 본문만
2. `cha-bio-safety/src/utils/api.ts` — `scheduleApi.update` 타입 시그니처 1줄만
3. `cha-bio-safety/src/pages/SchedulePage.tsx` — `EditModal` 컴포넌트(1152~1249줄) 내부만

**절대 건드리지 않음:** `AddModal`, `migrations/` 전체, `functions/api/schedule/index.ts`, `maint.ts`, `onRequestPatch`, `onRequestDelete`, EditModal 의 카테고리 lock row / 제목 입력 / 저장 버튼 / 모달 래퍼 스타일.

**이 콘솔은 production 전용이다.** 실행자는 D1 직접 실행(`d1 execute`)과 Cloudflare Pages 배포 명령을 **절대 실행하지 않는다.** 코드 수정 + git 커밋까지가 작업의 끝이다. 배포는 사용자가 별도로 수행한다.
</scope_lock>

<tasks>

<task type="auto">
  <name>Task 1: 백엔드 onRequestPut 조건부 SET 절 + scheduleApi.update 타입 확장</name>
  <files>cha-bio-safety/functions/api/schedule/[id].ts, cha-bio-safety/src/utils/api.ts</files>
  <action>
먼저 `functions/api/schedule/[id].ts` 의 `onRequestPut` **함수 본문만** 교체한다 (현재 1~20줄 영역). 현행 COALESCE 패턴은 `night_date: null` 을 보내도 "값 유지"로 해석되어 야간 점검일을 지울 수 없다. body 에 `night_date` **키가 존재할 때만** 직접 SET 하는 조건부 컬럼 방식으로 바꾼다.

교체 후 onRequestPut 의 동작 명세 (HANDOFF.md §3 verbatim):
- `id` 는 `params.id as string`.
- `body` 타입은 `{ title?: string; date?: string; time?: string; memo?: string; night_date?: string | null }`.
- 가드는 현행 그대로 유지: `if (!body.title && !body.date)` 이면 400 `'수정할 내용이 없습니다'`. (handleSave 가 title 을 항상 보내므로 기간일정이 date 를 생략해도 가드에 걸리지 않는다.)
- `setClauses` 배열 초기값 4개: `title = COALESCE(?, title)`, `date = COALESCE(?, date)`, `time = ?`, `memo = ?`.
- `binds` 배열(`(string | null)[]`) 초기값 4개: `body.title ?? null`, `body.date ?? null`, `body.time ?? null`, `body.memo ?? null`.
- `if ('night_date' in body)` 일 때만 `setClauses` 에 `'night_date = ?'` push, `binds` 에 `body.night_date ?? null` push.
- 그 다음 `setClauses` 에 `"updated_at = datetime('now','+9 hours')"` push, `binds` 에 `id` push.
- 쿼리: `` `UPDATE schedule_items SET ${setClauses.join(', ')} WHERE id = ?` `` 를 `.bind(...binds).run()`.
- 반환: `Response.json({ success: true })`.

SET 절 문자열은 전부 코드 내 리터럴만 조합하고 사용자 입력은 전부 `?` 바인딩으로만 들어간다 — 문자열 보간으로 값을 끼워 넣지 말 것.

같은 파일의 `onRequestPatch` / `onRequestDelete` 는 **한 글자도 수정하지 않는다.**

이어서 `src/utils/api.ts` 의 `scheduleApi.update` (122~123줄) 타입 시그니처만 바꾼다:
- `date: string` → `date?: string` (optional 로 변경)
- `night_date?: string | null` 추가
- `title: string`, `time?: string`, `memo?: string` 와 함수 본문(`api.put<void>(...)`)은 그대로.
- 같은 객체의 `create`, `getByDate`, `getByMonth`, `updateStatus`, `delete` 는 건드리지 않는다.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && npx tsc --noEmit</automated>
    <automated>grep -c "'night_date' in body" /Users/jykevin/Documents/20260328/cha-bio-safety/functions/api/schedule/\[id\].ts</automated>
    <automated>grep -c "night_date?: string | null" /Users/jykevin/Documents/20260328/cha-bio-safety/src/utils/api.ts</automated>
  </verify>
  <done>`onRequestPut` 이 `setClauses`/`binds` 조건부 조립 방식이고 `'night_date' in body` 분기를 포함한다. `scheduleApi.update` 의 `date` 가 optional 이고 `night_date?: string | null` 이 존재한다. `onRequestPatch`/`onRequestDelete` 는 `git diff` 상 변경 0줄. `npx tsc --noEmit` 통과.</done>
</task>

<task type="auto">
  <name>Task 2: EditModal 야간 점검일 체크박스 + 기간일정 시작일 보호</name>
  <files>cha-bio-safety/src/pages/SchedulePage.tsx</files>
  <action>
`EditModal` 컴포넌트(1152~1249줄) **내부만** 수정한다. HANDOFF.md §1 의 설계를 그대로 적용한다.

**(a) 파생 상수 추가** — `useState` 선언들 바로 위(컴포넌트 본문 최상단)에 배치:
- `isRangeItem` = `!!item.endDate && item.endDate !== item.date`
- `isNightEligibleFire` = `isRangeItem && item.category === 'fire' && (item.title === '소방 상반기 종합정밀점검' || item.title === '소방 하반기 작동기능점검')` — 제목 문자열 2개는 **정확히 이대로**, 공백/표기 변형 금지.
- `todayStr` = `localYMD(new Date())` — 파일 15줄의 기존 헬퍼 사용.

**(b) state 변경/추가:**
- 기존 `const [date, setDate] = useState(item.date)` 의 초기값을 `useState(isRangeItem ? todayStr : item.date)` 로 변경. (기간 일정은 시작일이 아니라 "오늘"을 기본으로 보여준다.)
- 신규 state 추가: `const [isNightDay, setIsNightDay] = useState(isNightEligibleFire && item.nightDate === todayStr)`
- `title`/`time`/`memo`/`saving`/`titleError` state 는 그대로.

**(c) 날짜 input 범위 제한** — 1226줄 `<input type="date" ...>` 에 속성 2개 추가 (기존 value/onChange/style 은 유지):
- `min={isRangeItem ? item.date : undefined}`
- `max={isRangeItem ? item.endDate : undefined}`

**(d) 체크박스 삽입** — 날짜/시간 flex row 를 닫는 `</div>` **다음**, 내용(memo) 블록 **앞**에 아래를 그대로 삽입. `isNightEligibleFire` 게이트 필수:

label 은 `style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}`,
내부에 `<input type="checkbox" checked={isNightDay} onChange={e => setIsNightDay(e.target.checked)} />` 와
`<span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>이 날짜를 야간 점검일로 표시</span>`.
문구는 "이 날짜를 야간 점검일로 표시" 정확히 이대로. (HANDOFF.md 29~36줄 스니펫 verbatim)

**(e) 내용 textarea 압축** — 1237~1238줄:
- `rows={4}` → `rows={isNightEligibleFire ? 1 : 4}`
- style 을 `{ ...inp, resize:'none', lineHeight:1.6, ...(isNightEligibleFire ? { height:44 } : {}) }` 로 변경.

**(f) handleSave payload (핵심 안전장치)** — 1166줄 `scheduleApi.update(...)` 호출을 아래 형태로 교체:
- `title: title.trim()` (그대로)
- `...(isRangeItem ? {} : { date })` — **기간 일정이면 `date` 키 자체를 payload 에서 제외**한다. 이게 시작일 덮어쓰기를 막는 유일한 장치다. `date: undefined` 로 보내면 안 된다(키는 존재하게 됨). 반드시 스프레드 조건부로.
- `time: time || undefined` (그대로)
- `memo: memo || undefined` (그대로)
- `...(isNightEligibleFire ? { night_date: isNightDay ? date : null } : {})` — 체크 해제 시 `null` 을 **명시적으로** 보내야 백엔드가 지운다. `undefined` 로 바꾸면 안 된다.

나머지 `handleSave` 로직(title 공백 가드, setSaving, catch 토스트 `'수정 실패'`, finally)은 그대로 유지.

**건드리지 않을 것:** 카테고리 lock row(1201~1211), 제목 입력 블록(1213~1222), 저장 버튼(1240~1244), 모달 래퍼/헤더 스타일, 그리고 파일 내 `AddModal` 전체.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && npx tsc --noEmit</automated>
    <automated>grep -c "isNightEligibleFire" /Users/jykevin/Documents/20260328/cha-bio-safety/src/pages/SchedulePage.tsx</automated>
    <automated>grep -c "이 날짜를 야간 점검일로 표시" /Users/jykevin/Documents/20260328/cha-bio-safety/src/pages/SchedulePage.tsx</automated>
    <automated>grep -c "\.\.\.(isRangeItem ? {} : { date })" /Users/jykevin/Documents/20260328/cha-bio-safety/src/pages/SchedulePage.tsx</automated>
  </verify>
  <done>EditModal 에 `isRangeItem`/`isNightEligibleFire`/`todayStr`/`isNightDay` 가 존재하고, 날짜 input 에 `min`/`max` 가 붙고, 체크박스가 `isNightEligibleFire` 게이트로 날짜 row 와 내용 블록 사이에 있으며, handleSave payload 가 기간일정일 때 `date` 키를 스프레드로 제외하고 `night_date` 를 `date | null` 로 보낸다. `npx tsc --noEmit` 통과.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Checkpoint: payload 안전장치 3종 코드 리뷰</name>
  <files>(검토만 — 변경 없음)</files>
  <what-built>
EditModal 야간 점검일 체크박스 3파일 수정 완료:
- `functions/api/schedule/[id].ts` — onRequestPut 조건부 SET (night_date 명시 NULL 저장 가능)
- `src/utils/api.ts` — scheduleApi.update 타입 확장 (date optional + night_date)
- `src/pages/SchedulePage.tsx` — EditModal 체크박스 + 기간일정 시작일 보호 + textarea 압축

타입 체크(`npx tsc --noEmit`) 통과 확인됨.
  </what-built>
  <how-to-verify>
아래 3가지를 **코드 diff 로** 확인해 주세요. (배포 전이므로 실기기 확인은 불가 — 코드 리뷰 단계입니다.)

1. `git diff cha-bio-safety/src/pages/SchedulePage.tsx` 에서 `handleSave` 의 `scheduleApi.update` payload 확인:
   → 기간 일정일 때 `date` 키가 **스프레드 조건부로 아예 빠지는지** (`...(isRangeItem ? {} : { date })`). `date: undefined` 형태면 실패입니다.

2. 같은 diff 에서 `night_date` 확인:
   → 체크 해제 시 `null` 이 **명시적으로** 들어가는지 (`night_date: isNightDay ? date : null`). `undefined` 면 백엔드가 못 지웁니다.

3. 단일 날짜 일정(기간 아님) 편집 경로 무변화 확인:
   → `isRangeItem === false` 일 때 `date` state 초기값이 `item.date` 그대로이고, payload 에 `date` 가 포함되며, 체크박스/textarea 압축이 모두 노출되지 않는지.

추가로 `git status --short` 로 **수정 파일이 위 3개뿐인지** (AddModal·migrations·index.ts·maint.ts 변경 없음) 확인해 주세요.
  </how-to-verify>
  <resume-signal>"approved" 입력 시 커밋 진행 / 문제가 있으면 구체적으로 지적해 주세요</resume-signal>
  <action>실행 중단하고 사용자 리뷰를 기다린다. 코드 변경 금지. 승인 전에는 Task 3(커밋)으로 진행하지 않는다. 지적이 나오면 해당 파일만 수정 후 다시 이 체크포인트로 돌아온다.</action>
  <verify>
    <automated>git status --short | grep -v '^??' | wc -l</automated>
    <human-check>(a) 기간일정 payload 에 date 키 없음 (b) 체크 해제 시 night_date 가 명시 null (c) 단일 날짜 일정 무변화</human-check>
  </verify>
  <done>사용자가 "approved" 를 입력했고, 변경 파일이 지정된 3개뿐임이 확인되었다.</done>
</task>

<task type="auto">
  <name>Task 3: 수정 파일 3개만 명시적 스테이징 후 커밋</name>
  <files>(git 커밋만 — 소스 변경 없음)</files>
  <action>
체크포인트 승인 후에만 실행한다.

1. `git status --short` 로 변경 파일이 아래 3개뿐인지 재확인. 그 외 파일이 섞여 있으면 **커밋하지 말고 중단**하고 사용자에게 보고한다.
2. 스테이징은 **파일 경로를 하나씩 명시**한다. `git add -A` / `git add .` 금지:
   - `cha-bio-safety/functions/api/schedule/[id].ts` (대괄호 경로 — 쉘 glob 때문에 반드시 따옴표로 감싼다)
   - `cha-bio-safety/src/utils/api.ts`
   - `cha-bio-safety/src/pages/SchedulePage.tsx`
3. 커밋 메시지는 **ASCII 전용**(한글 금지 — CLI 거부 이슈):
   `feat(schedule): allow setting night inspection date from edit modal`
4. 커밋 후 `git log -1 --stat` 으로 3개 파일만 포함되었는지 확인한다.

**금지:** D1 직접 실행 명령, Cloudflare Pages 배포 명령. 배포는 사용자가 별도 수행한다.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328 && git log -1 --name-only --format=%s | grep -v '^#' | grep -c 'schedule'</automated>
    <automated>cd /Users/jykevin/Documents/20260328 && git status --short | grep -v '^??' | wc -l</automated>
  </verify>
  <done>3개 파일만 포함된 커밋 1개가 생성되었고, 커밋 메시지는 ASCII 전용이며, 추적 중인 파일 중 미커밋 변경이 남아 있지 않다.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| 브라우저 → `/api/schedule/:id` (PUT) | 인증된 내부 사용자 입력(title/date/memo/night_date)이 D1 UPDATE 로 들어감 |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-lgr-01 | Tampering | `onRequestPut` 동적 `setClauses.join()` | mitigate | SET 절 문자열은 코드 내 리터럴만 조합. 모든 사용자 값은 `?` 바인딩으로만 전달 — 보간 금지 (Task 1 action 에 명시) |
| T-lgr-02 | Tampering | 기간 일정 `date` 덮어쓰기 | mitigate | payload 스프레드 조건부로 `date` 키 자체 제외 → 시작일 컬럼 미변경. human-check (a) 로 검증 |
| T-lgr-03 | Elevation of Privilege | PUT 권한 | accept | `functions/_middleware.ts` 가 JWT 검증 선행. 4인 내부 팀 전용, 본 작업 범위에서 권한 모델 변경 없음 |
| T-lgr-SC | Tampering | 패키지 설치 | n/a | 신규 의존성 설치 없음 — 기존 파일 3개 수정만 |
</threat_model>

<verification>
- `cd cha-bio-safety && npx tsc --noEmit` 통과 (유일한 자동 완료 기준)
- `git status --short` 상 수정 파일이 정확히 3개
- `onRequestPatch` / `onRequestDelete` / `AddModal` / `migrations/` diff 0줄
- 신규 마이그레이션 파일 생성 0건 (`night_date` 컬럼은 0107 로 이미 존재)
</verification>

<success_criteria>
- [ ] `onRequestPut` 이 `'night_date' in body` 조건부 SET 절 방식으로 재작성됨
- [ ] `scheduleApi.update` 가 `date?: string` + `night_date?: string | null` 를 받음
- [ ] EditModal 에 `isRangeItem` / `isNightEligibleFire` / `isNightDay` 가 존재
- [ ] 기간 일정일 때 날짜 기본값 = 오늘, `min`/`max` = 시작일/종료일
- [ ] 체크박스 "이 날짜를 야간 점검일로 표시" 가 소방 상/하반기 + 기간일정 조건에서만 노출
- [ ] handleSave payload 가 기간 일정에서 `date` 키를 제외하고 `night_date` 를 `null` 로 명시 전송
- [ ] 단일 날짜 일정 편집 동작 무변화
- [ ] `npx tsc --noEmit` 통과
- [ ] 3개 파일만 명시적으로 스테이징된 ASCII 커밋 1개 생성
- [ ] 배포/D1 실행 명령 미수행
</success_criteria>

<output>
완료 시 `.planning/quick/261116-lgr-editmodal/261116-lgr-SUMMARY.md` 생성
</output>
