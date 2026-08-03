---
phase: quick-260803-nok-weekend-range-task-event
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/pages/SchedulePage.tsx
  - cha-bio-safety/functions/api/dashboard/stats.ts
autonomous: true
requirements:
  - QUICK-NOK-01  # task/event 연속 일정 주말·공휴일 표시 허용 (유령 일정 수정)
must_haves:
  truths:
    - "8/8(토)~8/9(일) 처럼 범위 전체가 주말인 task·event 연속 일정이 SchedulePage 달력·일자 목록·점 표시에 나타난다"
    - "동일한 task·event 연속 일정이 대시보드 월간 캘린더 점 표시(stats.ts)에도 나타난다"
    - "inspect·elevator·fire 카테고리의 연속 일정은 기존대로 주말·공휴일이 표시에서 제외된다"
    - "task·event 로 범위 일정을 추가할 때 미리보기 안내문이 '주말·공휴일 N일 제외'라는 거짓 문구 대신 'N일 범위로 1건 추가됩니다'만 보여준다"
    - "npx tsc --noEmit 가 오류 없이 통과한다"
  artifacts:
    - path: "cha-bio-safety/src/pages/SchedulePage.tsx"
      provides: "matchesDate 주말·공휴일 예외 + 추가 모달 안내문 분기"
    - path: "cha-bio-safety/functions/api/dashboard/stats.ts"
      provides: "monthScheduleDates isRange 주말·공휴일 예외"
  key_links:
    - from: "SchedulePage.matchesDate"
      to: "달력 dotMap / dayItems"
      via: "category === 'task' || category === 'event' 시 범위 내 전일 return true"
      pattern: "category === 'task' \\|\\| item\\.category === 'event'"
    - from: "stats.ts monthScheduleDates"
      to: "대시보드 월간 캘린더 점"
      via: "isRange 계산에 category task/event 제외 반영"
      pattern: "r\\.category !== 'task'"
---

<objective>
SchedulePage 의 연속(멀티데이) 일정 "주말·공휴일 표시 자동 제외" 규칙을 task(업무)·event(행사) 카테고리에 한해 해제한다. 현재 8/8(토)~8/9(일) 처럼 범위 전체가 주말인 task/event 일정은 DB 에는 저장되지만 표시일이 0일이 되어 앱 어디에도 안 나오는 "유령 일정" 이 된다.

Purpose: 사용자 결정(LOCKED) — task·event 연속 일정은 주말·공휴일에도 표시. inspect 등 나머지 카테고리(평일 N일 점검 회차용)는 기존 규칙 유지. 월간 점검 계획 상단 표(MonthlyPlanPreview dayCatMap)는 inspect 전용이므로 손대지 않는다.
Output: 수정된 SchedulePage.tsx, stats.ts. tsc 통과.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md

# 확정 사실 (재조사 불필요, 플래너가 소스 검증 완료)
# - ScheduleCategory = 'inspect'|'task'|'event'|'elevator'|'fire' (src/types/index.ts:13)
# - 모달 cat 상태: const [cat, setCat] = useState<ScheduleCategory>('inspect') (SchedulePage.tsx:816)
# - workingDays(860) → skippedCount(876) → 안내문(1104~1105) 이 유일한 사용 체인. 다른 사용처 없음.
# - handleSave 는 항상 단일 항목 + end_date 로 저장 (day-split 안 함). workingDays 미사용.
# - stats.ts monthDatesRows 쿼리는 category 컬럼 포함, row 타입 {date; end_date:string|null; category:string} (stats.ts:446,449)
</context>

<tasks>

<task type="auto">
  <name>Task 1: task·event 연속 일정 주말·공휴일 표시 예외 적용 (3개소)</name>
  <files>cha-bio-safety/src/pages/SchedulePage.tsx, cha-bio-safety/functions/api/dashboard/stats.ts</files>
  <action>
동일한 "task/event 예외" 규칙을 서로 미러 관계인 3개소에 적용한다. 리터럴은 반드시 'task', 'event' (ScheduleCategory 검증 완료).

(a) SchedulePage.tsx `matchesDate` (약 174~185행):
- 함수 위 주석 블록(174~176행)에 예외 한 줄 추가 — 기존 주석 스타일 유지: "// 예외: task(업무)·event(행사) 범위 일정은 주말·공휴일에도 표시."
- `if (!item.endDate || item.endDate === item.date) return true` 다음 줄에 예외 early-return 추가:
  "if (item.category === 'task' || item.category === 'event') return true"
- 이 한 줄만 삽입한다. 아래의 dow/holidays 스킵 로직(inspect 등 기존 경로)은 그대로 둔다.

(b) SchedulePage.tsx 추가 모달 `skippedCount` (약 876행):
- 현재: `const skippedCount = rangeDays > 0 ? rangeDays - workingDays.length : 0`
- 카테고리 인식으로 변경: rangeDays>0 이고 cat 이 'task'/'event' 가 아닐 때만 실제 스킵 수, 그 외 0.
  예) `const skippedCount = (rangeDays > 0 && cat !== 'task' && cat !== 'event') ? rangeDays - workingDays.length : 0`
- 이렇게 하면 1104~1105행 안내문이 자동으로 else 분기(`${rangeDays}일 범위로 1건 추가됩니다`)로 떨어져 거짓 "제외" 문구가 사라진다. workingDays 계산 블록(860~875)은 손대지 않는다(유일 사용처가 skippedCount 라 부작용 없음).

(c) stats.ts `monthScheduleDates` (약 470행 isRange):
- 현재: `const isRange = !!r.end_date && r.end_date !== r.date`
- task/event 예외 포함: `const isRange = !!r.end_date && r.end_date !== r.date && r.category !== 'task' && r.category !== 'event'`
- isRange 는 이 블록에서 오직 주말·공휴일 스킵(479~483행) 게이트로만 쓰이므로, task/event 는 isRange=false → 단일 일정처럼 범위 전일 점 표시. for 루프의 startDay..endDay 순회는 그대로 유지되어 범위 내 모든 날에 점이 찍힌다.

주의: 새 카테고리 추가·기존 스킵 로직 삭제·MonthlyPlanPreview dayCatMap(668~693, inspect 전용) 변경 금지. 표시 로직만 예외 처리.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && npx tsc --noEmit</automated>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && grep -n "category === 'task' || item.category === 'event'" src/pages/SchedulePage.tsx && grep -n "cat !== 'task' && cat !== 'event'" src/pages/SchedulePage.tsx && grep -n "r.category !== 'task' && r.category !== 'event'" functions/api/dashboard/stats.ts</automated>
  </verify>
  <done>
tsc 오류 0. 3개 grep 모두 매치. matchesDate 는 task/event 범위 시 return true, inspect 등은 기존 dow/holidays 스킵 유지. 추가 모달 안내문은 task/event 시 "제외" 문구 미표시. stats.ts monthScheduleDates 는 task/event 범위 전일 점 표시.
  </done>
</task>

</tasks>

<threat_model>
표시(read-only) 로직 예외 처리로 신규 신뢰 경계·입력 검증·인증 변경 없음. DB 스키마/쿼리 파라미터 불변. STRIDE 신규 위협 없음(N/A).
</threat_model>

<verification>
1. `cd cha-bio-safety && npx tsc --noEmit` 통과.
2. 코드 리뷰: matchesDate·skippedCount·monthScheduleDates 3개소에 동일 예외가 일관 적용되었는지, inspect/elevator/fire 경로는 무변경인지 확인.
</verification>

<success_criteria>
- task·event 연속 일정(범위 전체 주말 포함)이 SchedulePage 달력·일자 목록·점 및 대시보드 월간 캘린더 점에 표시된다.
- inspect·elevator·fire 연속 일정의 주말·공휴일 제외는 그대로 유지된다.
- 추가 모달 미리보기 안내문이 task/event 시 거짓 제외 문구를 표시하지 않는다.
- tsc 통과.
</success_criteria>

<output>
Create `.planning/quick/260803-nok-weekend-range-task-event/260803-nok-SUMMARY.md` when done
</output>
