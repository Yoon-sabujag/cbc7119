import { getMonthlySchedule, DOW_KO } from './shiftCalc'
import { isHoliday as _isHolidayKr } from '@hyunbinseo/holidays-kr'

// ── 공휴일 판정 ────────────────────────────────────────────
// @hyunbinseo/holidays-kr — v3.2026.2 covers 2025-2026
// Throws RangeError outside coverage window — wrapped in try/catch per Pitfall 4
function isKoreanHoliday(date: Date): boolean {
  const dow = date.getDay()
  if (dow === 0 || dow === 6) return true // 토/일
  try {
    const kst = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    return _isHolidayKr(kst)
  } catch {
    return false // RangeError: 범위 밖 날짜 → 비공휴일로 처리
  }
}

// ── 순찰 교대 기준일 ───────────────────────────────────────
// shiftCalc.ts와 동일한 REF_DATE 사용
// REF_DATE(2026-03-01) 기준: daysBetween 짝수 = 저녁순찰, 홀수 = 야간순찰
const PATROL_REF_DATE = new Date(2026, 2, 1) // 2026-03-01

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime()
  return Math.round(ms / 86_400_000)
}

// ── 직원 목록 (shiftCalc.ts의 STAFF와 동일) ──────────────
const STAFF = [
  { id: '2018042451', name: '석현민' },
  { id: '2023071752', name: '박보융' },
  { id: '2021061451', name: '김병조' },
  { id: '2022051052', name: '윤종엽' },
]

// ── 인터페이스 정의 ───────────────────────────────────────

export interface PersonnelStatus {
  total: number        // 총원 (always 4)
  present: number      // 현재원
  onDuty: string       // 당직자 이름
  offDuty: string      // 비번자 이름
  dayShift: string[]   // 주간근무자 이름 목록
  onLeave: string[]    // 연차자
  halfLeave: string[]  // 반차자
  training: string[]   // 교육/훈련자
  holiday: string[]    // 휴무자
  absent: number       // 결원
}

export interface PatrolEntry {
  type: '저녁순찰' | '야간순찰'
  time: string         // e.g., '22:00~23:00' or '01:00~02:00'
  patroller: string    // 순찰자 이름 (당직자)
}

export interface TaskEntry {
  number: number       // 동적 번호 (1, 2, 3, ...)
  content: string      // 업무 내용
}

export interface DailyReportData {
  date: string              // YYYY-MM-DD
  dayOfWeek: string         // 월, 화, ... (한글 요일)
  personnel: PersonnelStatus
  patrol: PatrolEntry[]     // 1-2 entries (저녁 and/or 야간)
  todayTasks: TaskEntry[]   // 금일업무 항목
  tomorrowTasks: TaskEntry[] // 명일업무 항목
  notes: string             // 특이사항
}

// ── 날짜 파싱 헬퍼 ────────────────────────────────────────

function parseDateStr(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function addDays(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n)
}

function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ── 인원현황 계산 ─────────────────────────────────────────

function buildPersonnel(
  date: Date,
  leaves: any[],
  schedules: any[]
): PersonnelStatus {
  const dateStr = toDateStr(date)
  const day = date.getDate()
  const year = date.getFullYear()
  const month = date.getMonth() + 1

  // 시프트 계산: shiftCalc.ts의 getMonthlySchedule 기반
  const { staffRows } = getMonthlySchedule(year, month)
  const shifts: Record<string, string> = {}
  for (const row of staffRows) {
    shifts[row.id] = row.shifts[day - 1]
  }

  // 연차/반차 목록 (date 기준)
  const todayLeaves = (leaves ?? []).filter((l: any) => l.date === dateStr)
  const leaveMap: Record<string, string> = {}
  for (const l of todayLeaves) {
    if (l.staffId) leaveMap[l.staffId] = l.type // 'full' | 'half'
  }

  // 교육/훈련 목록
  const trainingSchedules = (schedules ?? []).filter((s: any) =>
    s.date === dateStr && (s.title?.includes('교육') || s.title?.includes('훈련'))
  )
  const trainingAssignees = new Set<string>(
    trainingSchedules.map((s: any) => s.assigneeId).filter(Boolean)
  )

  const onLeave: string[] = []
  const halfLeave: string[] = []
  const training: string[] = []
  const holiday: string[] = []
  const dayShift: string[] = []
  let onDuty = ''
  let offDuty = ''

  for (const staff of STAFF) {
    const shift = shifts[staff.id]
    const leaveType = leaveMap[staff.id]

    // 연차/반차 우선
    if (leaveType === 'full') {
      onLeave.push(staff.name)
      continue
    }
    if (leaveType === 'half') {
      halfLeave.push(staff.name)
      // 반차는 현재원에 포함
    }

    // 교육/훈련
    if (trainingAssignees.has(staff.id)) {
      training.push(staff.name)
      continue
    }

    if (shift === '당') {
      onDuty = staff.name
    } else if (shift === '비') {
      offDuty = staff.name
    } else if (shift === '주') {
      dayShift.push(staff.name)
    } else if (shift === '휴') {
      holiday.push(staff.name)
    }
  }

  // 현재원 = 총원 - 비번 - 연차 - 결원
  const absent = 0
  const notPresent = offDuty ? 1 : 0
  const present = STAFF.length - notPresent - onLeave.length - absent

  return {
    total: STAFF.length,
    present,
    onDuty,
    offDuty,
    dayShift,
    onLeave,
    halfLeave,
    training,
    holiday,
    absent,
  }
}

// ── 순찰 항목 생성 ────────────────────────────────────────

function buildPatrol(date: Date, onDutyName: string): PatrolEntry[] {
  const isHoliday = isKoreanHoliday(date)
  const diff = daysBetween(PATROL_REF_DATE, date)
  // 짝수 차이 = 저녁순찰, 홀수 = 야간순찰
  const isEvening = diff % 2 === 0

  const entries: PatrolEntry[] = []

  if (isEvening) {
    // 저녁순찰: 평일 22:00~23:00, 휴일 21:00~22:00
    const time = isHoliday ? '21:00~22:00' : '22:00~23:00'
    const type = isHoliday ? '저녁순찰' : '저녁순찰'
    entries.push({ type, time, patroller: onDutyName })
  } else {
    // 야간순찰: 01:00~02:00
    entries.push({ type: '야간순찰', time: '01:00~02:00', patroller: onDutyName })
  }

  return entries
}

// ── 업무 항목 생성 ────────────────────────────────────────

// 월점검 카테고리 매핑 (schedule inspection_category → 업무일지 표시명)
const INSPECT_CATEGORY_LABELS: Record<string, string> = {
  '방화문': '전층 방화문 동작상태 점검',
  '특별피난계단': '피난계단 점검',
  '전실제연댐퍼': '전실제연댐퍼 점검',
  '연결송수관': '연결송수관 설비 점검',
  '청정소화약제': '가스소화설비(청정소화약제) 점검',
  '주차장비': '주차관제 시스템 점검',
  '회전문': '회전문 점검',
  'DIV': '전층 DIV 점검',
  '컴프레셔': '전층 DIV 컴프레샤 점검',
  '유도등': '전층 유도등 점검',
  '배연창': '전층 배연창 점검',
  '완강기': '전층 완강기 점검',
  '소방용전원공급반': '화재수신기 및 전원공급반 점검',
  '방화셔터': '전층 방화셔터 점검',
  '소화전': '전층 소화전 점검',
  '비상콘센트': '전층 비상 콘센트 설비 점검',
  '소화기': '전층 소화기 점검',
  'CCTV': '전층 CCTV 및 DVR 점검',
  '소방펌프': '소방펌프 점검',
}

function buildTasks(
  date: Date,
  patrol: PatrolEntry[],
  schedules: any[],
  elevatorFaults: any[]
): TaskEntry[] {
  const dateStr = toDateStr(date)
  const tasks: TaskEntry[] = []
  let num = 1

  // 1. 일상점검 (매일 고정 3개)
  tasks.push({ number: num++, content: '. 화재수신반 감시 및 승강기 운행상태 점검' })
  tasks.push({ number: num++, content: '. 전층 방화 순찰' })

  // 2. 순찰 항목 (저녁순찰 or 야간순찰)
  for (const p of patrol) {
    const label = p.type === '저녁순찰'
      ? `. 저녁순찰 및 소등 (${p.time})`
      : `. 야간순찰 및 소등 (${p.time})`
    tasks.push({ number: num++, content: label })
  }

  // 3. 월점검 (schedule_items에서 inspect 카테고리)
  const inspectItems = (schedules ?? []).filter((s: any) =>
    s.date === dateStr && s.category === 'inspect'
  )
  for (const s of inspectItems) {
    const label = INSPECT_CATEGORY_LABELS[s.inspection_category ?? '']
      ?? s.title
    tasks.push({ number: num++, content: `. ${label}` })
  }

  // 4. 업무 일정
  const taskItems = (schedules ?? []).filter((s: any) =>
    s.date === dateStr && s.category === 'task'
  )
  for (const s of taskItems) {
    tasks.push({ number: num++, content: `. ${s.title}` })
  }

  // 5. 승강기 고장 수리
  const faults = (elevatorFaults ?? []).filter((f: any) => {
    if (!f.reported_at) return false
    return f.reported_at.startsWith(dateStr)
  })
  for (const f of faults) {
    tasks.push({ number: num++, content: `. 승강기 고장 수리\n  - ${f.elevator_number ?? ''}: ${f.description ?? ''}` })
  }

  // 6. 승강기 정기 점검 / 검사 (schedule elevator 카테고리)
  const elevatorItems = (schedules ?? []).filter((s: any) =>
    s.date === dateStr && s.category === 'elevator'
  )
  for (const s of elevatorItems) {
    tasks.push({ number: num++, content: `. ${s.title}` })
  }

  // 7. 소방 일정
  const fireItems = (schedules ?? []).filter((s: any) =>
    s.date === dateStr && s.category === 'fire'
  )
  for (const s of fireItems) {
    tasks.push({ number: num++, content: `. ${s.title}` })
  }

  return tasks
}

function buildTomorrowTasks(
  date: Date,
  patrol: PatrolEntry[],
  schedules: any[]
): TaskEntry[] {
  const tomorrow = addDays(date, 1)
  const tomorrowStr = toDateStr(tomorrow)
  const tasks: TaskEntry[] = []
  let num = 1

  // 1. 승강기 운행상태 점검 (매일)
  tasks.push({ number: num++, content: '. 승강기 운행상태 점검' })

  // 2. 명일 순찰
  const tomorrowIsHoliday = isKoreanHoliday(tomorrow)
  const tomorrowDiff = daysBetween(PATROL_REF_DATE, tomorrow)
  const tomorrowIsEvening = tomorrowDiff % 2 === 0
  if (tomorrowIsEvening) {
    const time = tomorrowIsHoliday ? '21:00~22:00' : '22:00~23:00'
    tasks.push({ number: num++, content: `. 저녁순찰 및 소등 (${time})` })
  } else {
    tasks.push({ number: num++, content: '. 야간순찰 및 소등 (01:00~02:00)' })
  }

  // 3. 명일 월점검 일정
  const tomorrowInspect = (schedules ?? []).filter((s: any) =>
    s.date === tomorrowStr && s.category === 'inspect'
  )
  for (const s of tomorrowInspect) {
    const label = INSPECT_CATEGORY_LABELS[s.inspection_category ?? '']
      ?? s.title
    tasks.push({ number: num++, content: `. ${label}` })
  }

  // 4. 명일 업무/소방 일정
  const tomorrowOther = (schedules ?? []).filter((s: any) =>
    s.date === tomorrowStr && (s.category === 'task' || s.category === 'fire')
  )
  for (const s of tomorrowOther) {
    tasks.push({ number: num++, content: `. ${s.title}` })
  }

  return tasks
}

// ── 메인 함수 ──────────────────────────────────────────────

export function buildDailyReportData(
  date: string,
  apiData: { schedules: any[]; leaves: any[]; elevatorFaults: any[] },
  notes: string
): DailyReportData {
  const dateObj = parseDateStr(date)
  const dow = DOW_KO[dateObj.getDay()]

  const personnel = buildPersonnel(dateObj, apiData.leaves ?? [], apiData.schedules ?? [])
  const patrol = buildPatrol(dateObj, personnel.onDuty)
  const todayTasks = buildTasks(dateObj, patrol, apiData.schedules ?? [], apiData.elevatorFaults ?? [])
  const tomorrowTasks = buildTomorrowTasks(dateObj, patrol, apiData.schedules ?? [])

  return {
    date,
    dayOfWeek: dow,
    personnel,
    patrol,
    todayTasks,
    tomorrowTasks,
    notes,
  }
}
