# 261116-lgr: EditModal 야간점검일 체크박스 (261116-hgz 후속) — 컨텍스트 클리어 전 핸드오프

## 배경
AddModal에는 이미 "야간 점검일" 입력이 완료됨(261116-hgz, 배포됨). 이번엔 **이미 등록된 기간 일정**(예: 11/12~11/18 소방 하반기 작동기능점검)을 **수정(EditModal)**해서 나중에 야간 점검일을 지정할 수 있게 하는 작업.

## 확정된 설계 (사용자 승인 완료, 재논의 불필요)
EditModal의 "날짜" 필드는 현재 기간일정의 **시작일(item.date)** 그 자체를 편집한다. 체크박스만 추가하면 "어느 날이 야간인지" 구분이 안 되고, 날짜를 바꾸면 시작일이 바뀌어 캘린더에서 앞 날짜들이 사라지는 부작용이 있음 — 사용자에게 보고 후 다음으로 확정:

- **기간 일정(item.endDate && item.endDate !== item.date)을 수정할 때**: 날짜 필드 기본값을 시작일이 아닌 **오늘(수정일)**로 보여준다.
- 이 필드는 저장 시 **시작일 컬럼을 절대 건드리지 않는다** (payload에서 `date` 키 자체를 뺀다).
- 날짜/시간 row와 내용(memo) 사이에 체크박스 "이 날짜를 야간 점검일로 표시" — **소방 상/하반기 점검 + 기간일정일 때만** 노출.
- 체크 시 `night_date` = 그 날짜, 체크 해제 시 `night_date` = NULL 명시 저장(백엔드가 COALESCE라 안 지워짐 — 조건부 SET 절로 바꿔야 함).
- 내용 textarea도 같은 조건에서 압축(rows 4→1, height:44).
- 단일 날짜 일정 편집은 전부 기존 동작 그대로(무변화).

## 구현 대상 3개 파일 (이미 전부 정독·설계 완료, 재조사 불필요)

### 1. src/pages/SchedulePage.tsx — EditModal (1152~1244줄)
```
const isRangeItem = !!item.endDate && item.endDate !== item.date
const isNightEligibleFire = isRangeItem && item.category === 'fire' &&
  (item.title === '소방 상반기 종합정밀점검' || item.title === '소방 하반기 작동기능점검')
const todayStr = localYMD(new Date())  // 파일 15줄에 이미 있는 헬퍼
```
- `date` state 초기값: `useState(isRangeItem ? todayStr : item.date)`
- 신규: `const [isNightDay, setIsNightDay] = useState(isNightEligibleFire && item.nightDate === todayStr)`
- 날짜 input에 `min={isRangeItem ? item.date : undefined}` `max={isRangeItem ? item.endDate : undefined}`
- 날짜/시간 row 다음, 내용 블록 앞에 체크박스 (isNightEligibleFire 게이트):
  ```tsx
  {isNightEligibleFire && (
    <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
      <input type="checkbox" checked={isNightDay} onChange={e => setIsNightDay(e.target.checked)} />
      <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>이 날짜를 야간 점검일로 표시</span>
    </label>
  )}
  ```
- 내용 textarea: `rows={isNightEligibleFire ? 1 : 4}`, style에 `...(isNightEligibleFire ? { height:44 } : {})` 추가
- handleSave payload (**핵심 안전장치**):
  ```ts
  await scheduleApi.update(item.id, {
    title: title.trim(),
    ...(isRangeItem ? {} : { date }),
    time: time || undefined,
    memo: memo || undefined,
    ...(isNightEligibleFire ? { night_date: isNightDay ? date : null } : {}),
  })
  ```
- 범위 제한: 카테고리 lock row/제목/저장버튼 등 다른 부분, AddModal 전혀 건드리지 않음.

### 2. src/utils/api.ts — scheduleApi.update (122~123줄)
현재: `update: (id: string, body: { title: string; date: string; time?: string; memo?: string }) => api.put<void>(...)`
변경: `date`를 **optional**로(`date?: string`), `night_date?: string | null` 추가.

### 3. functions/api/schedule/[id].ts — onRequestPut 전체 재작성
현재 COALESCE 패턴은 null 보내도 "유지"로 해석되어 night_date를 못 지움. body에 `night_date` 키가 존재할 때만 직접 SET하는 조건부 컬럼으로 구현:
```ts
export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const id   = params.id as string
  const body = await request.json<{ title?: string; date?: string; time?: string; memo?: string; night_date?: string | null }>()
  if (!body.title && !body.date) return Response.json({ success: false, error: '수정할 내용이 없습니다' }, { status: 400 })

  const setClauses = ["title = COALESCE(?, title)", "date = COALESCE(?, date)", "time = ?", "memo = ?"]
  const binds: (string | null)[] = [body.title ?? null, body.date ?? null, body.time ?? null, body.memo ?? null]
  if ('night_date' in body) {
    setClauses.push('night_date = ?')
    binds.push(body.night_date ?? null)
  }
  setClauses.push("updated_at = datetime('now','+9 hours')")
  binds.push(id)

  await env.DB.prepare(
    `UPDATE schedule_items SET ${setClauses.join(', ')} WHERE id = ?`
  ).bind(...binds).run()

  return Response.json({ success: true })
}
```
onRequestPatch/onRequestDelete는 건드리지 않음. title은 handleSave가 항상 보내므로 기간일정이 date 생략해도 가드에 안 걸림.

## 범위 제한
AddModal, migrations(0107 이미 적용됨, 추가 마이그레이션 불필요 — night_date 컬럼 이미 존재), functions/api/schedule/index.ts(GET/POST, 이미 완료), maint.ts(이미 완료)는 전혀 건드리지 않음. 이번 작업은 위 3개 파일만.

## 제약
이 콘솔은 production 전용(브랜치=production). executor는 wrangler d1 execute·pages deploy 절대 금지, 코드 수정+git 커밋까지만(명시적 git add 3개 파일만, `-A` 금지). 커밋 메시지 ASCII.

## 완료 기준
`cd cha-bio-safety && npx tsc --noEmit` 통과. human-check: (a) isRangeItem일 때 handleSave payload에 date 키가 없는지 (b) night_date 체크 해제 시 null이 명시 전송되는지 (c) 단일 날짜 일정 편집 시 기존 동작 무변화인지.

## 재개 방법
`/clear` 후 새 세션에서: "이 파일(`.planning/quick/261116-lgr-editmodal/HANDOFF.md`)을 읽고 거기 적힌 대로 GSD 퀵 태스크(quick_id=261116-lgr, slug=editmodal, 디렉토리 이미 생성됨)로 진행해줘" 라고 요청하면 됨. 마이그레이션 적용/배포는 필요 없음(코드만 수정, 배포는 코드 머지 후 한 번에).
