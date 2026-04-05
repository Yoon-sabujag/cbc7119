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
// REF_DATE(2026-03-01) 기준: daysBetween 짝수 = 야간순찰, 홀수 = 야간순찰
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
  type: '야간순찰'
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
  todayTasks: TaskEntry[]   // 금일업무 항목 (개별)
  tomorrowTasks: TaskEntry[] // 명일업무 항목 (개별)
  todayText: string         // 금일업무 전체 텍스트 (엑셀 병합셀용)
  tomorrowText: string      // 명일업무 전체 텍스트 (엑셀 병합셀용)
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
  schedules: any[],
  staffData?: { id: string; name: string; title?: string }[]
): PersonnelStatus {
  const dateStr = toDateStr(date)
  const day = date.getDate()
  const year = date.getFullYear()
  const month = date.getMonth() + 1

  // 시프트 계산: shiftCalc.ts의 getMonthlySchedule 기반
  const staffForCalc = (staffData ?? STAFF).map(s => ({ id: s.id, name: s.name, title: (s as any).title ?? '' }))
  const { staffRows } = getMonthlySchedule(year, month, staffForCalc)
  const shifts: Record<string, string> = {}
  for (const row of staffRows) {
    shifts[row.id] = row.shifts[day - 1]
  }

  // 연차/반차/공가 목록 (date 기준)
  // type: 'full'=연차1일, 'half'=연차0.5일(반차), 'official_full'=공가1일, 'official_half'=공가0.5일(교육/훈련)
  const todayLeaves = (leaves ?? []).filter((l: any) => l.date === dateStr)
  const leaveMap: Record<string, string> = {}
  for (const l of todayLeaves) {
    if (l.staff_id) leaveMap[l.staff_id] = l.type
  }

  const onLeave: string[] = []    // 연차 1일
  const halfLeave: string[] = []  // 연차 0.5일 (반차)
  const training: string[] = []   // 공가 0.5일 (교육/훈련)
  const holiday: string[] = []    // 휴무 (공휴일/토일 주간→휴)
  const dayShift: string[] = []   // 주간근무자
  let onDuty = ''
  let offDuty = ''
  const absent = 0

  const staffList = staffData ?? STAFF
  for (const staff of staffList) {
    const shift = shifts[staff.id]
    const leaveType = leaveMap[staff.id]

    // 연차 1일 → 현재원에서 제외
    if (leaveType === 'full') {
      onLeave.push(staff.name)
      continue
    }

    // 공가 1일 → 현재원에서 제외
    if (leaveType === 'official_full') {
      onLeave.push(staff.name)
      continue
    }

    // 반차 (오전/오후) → 주간근무자에 포함, 현재원에 포함
    if (leaveType === 'half_am' || leaveType === 'half_pm') {
      halfLeave.push(staff.name)
      dayShift.push(staff.name)
      continue
    }

    // 공가 반일 (오전/오후) → 교육/훈련란, 주간근무자에 포함, 현재원에 포함
    if (leaveType === 'official_half_am' || leaveType === 'official_half_pm') {
      training.push(staff.name)
      dayShift.push(staff.name)
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

  // 총원 = 4 - 결원
  // 현재원 = 주간근무자 수(반차/교육훈련 포함) + 당직자 수 (비번/연차1일/공가1일 제외)
  // 석현민을 맨 앞으로
  const sIdx = dayShift.indexOf('석현민')
  if (sIdx > 0) { dayShift.splice(sIdx, 1); dayShift.unshift('석현민') }

  const present = dayShift.length + (onDuty ? 1 : 0)

  return {
    total: staffList.length - absent,
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
  // 매월 1일에 전달 말일 순찰을 반복 → 월 경계마다 패턴이 1일씩 밀림
  // 기준월(2026-03) 이후 경과한 월 수만큼 diff에서 빼서 보정
  const refYear = PATROL_REF_DATE.getFullYear()
  const refMonth = PATROL_REF_DATE.getMonth()
  const monthsFromRef = (date.getFullYear() - refYear) * 12 + (date.getMonth() - refMonth)
  const adjustedDiff = diff - Math.max(0, monthsFromRef)
  const isEvening = adjustedDiff % 2 === 0

  const entries: PatrolEntry[] = []

  if (isEvening) {
    // 야간순찰: 평일 22:00~23:00, 휴일 21:00~22:00
    const time = isHoliday ? '21:00~22:00' : '22:00~23:00'
    const type = isHoliday ? '야간순찰' : '야간순찰'
    entries.push({ type, time, patroller: onDutyName })
  } else {
    // 야간순찰: 01:00~02:00
    entries.push({ type: '야간순찰', time: '01:00~02:00', patroller: onDutyName })
  }

  return entries
}

// ── 업무 항목 생성 ────────────────────────────────────────

// 금일업무 월점검 항목 전체 내용 (작성법 Sheet3 기준, 기재번호 포함)
const INSPECT_FULL_CONTENT: Record<string, { num: number; text: string }> = {
  '방화문':       { num: 4, text: '전층 방화문 동작상태 점검\n  - 방화문 폐쇄상태 및 파손상태 점검\n  - 방화문 도어첵크 설치상태 점검' },
  '특별피난계단': { num: 5, text: '전층 피난계단 점검\n  - 계단내 적재물 상태점검\n  - 계단 통로유도등 점검' },
  '전실제연댐퍼': { num: 4, text: '1F~B5F 특별피난계단 전실댐퍼(급,배기) 점검\n  - 급,배기 댐퍼 모터동작 및 개폐상태 점검\n  - 댐퍼 동작시 방재실 화재수신반 점등확인' },
  '연결송수관':   { num: 5, text: '연결송수관 설비 점검\n  - 1층, B4층 배관 점검 및 오토드립밸브 점검\n  - 2층, B1층 송수구 점검 및 연결부 이상유무 점검' },
  '청정소화약제': { num: 4, text: '가스소화설비(집합관,모듈러) 점검\n  - 소화약제 저장용기 압력상태 점검\n  - 회로도통시험 및 예비전원 시험\n  - 솔레노이드 체결상태 점검' },
  '주차장비':     { num: 4, text: '주차관제 시스템 점검\n  - 2층 및 B1층 주차상태 표시기 점검\n  - 주차입, 출구 차단바 작동상태 점검\n  - B1층 주차시스템 표시 상태 점검 및 차량출입 상태 점검\n  - 주차램프구간내 차량검지기 상태 점검' },
  '회전문':       { num: 5, text: '회전문 점검\n  - 구리스 주입 및 안전센서 점검' },
  'DIV':          { num: 4, text: '전층 DIV 점검\n  - 밸브 정위치 상태 점검 및 누기상태 점검\n  - 1차수압 및 2차 공기압 상태 점검\n  - 클래퍼 셋팅압력 점검\n  - 압력스위치 상태점검' },
  '컴프레셔':     { num: 5, text: '전층 DIV 컴프레샤 점검\n  - 컴프레샤 작동상태 압력 점검\n  - 컴프레샤 오일상태 체크 및 작동시험' },
  '유도등':       { num: 4, text: '전층 유도등 점검\n  - 유도등 점등상태 및 부착상태 점검\n  - 상용전원 및 예비전원 점검' },
  '배연창':       { num: 4, text: '전층 배연창 점검\n  - 배연창 기밀상태 점검\n  - 현장 수동기동 테스트\n  - 배연창 동작시 화재수신반 시그널 확인상태 점검' },
  '완강기':       { num: 4, text: '전층 완강기 점검\n  - 지지대 고정상태 점검\n  - 완강기 장비 배치상태 점검\n  - 완강기 및 장비 외관 청소' },
  '소방용전원공급반': { num: 4, text: '화재수신기 및 전원공급반 점검\n  - 전층 전원공급반 전압상태 확인\n  - 휴즈 및 LED 점등상태 확인\n  - 중계기 통신상태 점검 및 예비전원 시험' },
  '방화셔터':     { num: 4, text: '전층 방화셔터 점검\n  - 방화셔터 수동 업,다운 점검\n  - 연동제어기 전원 및 예비전원 점검\n  - 방화셔터 하부 물품적치상태 점검 및 이동조치' },
  '소화전':       { num: 4, text: '전층 소화전 점검\n  - 소화전 앵글밸브 누수여부 점검\n  - 소화전 호스 및 관창 상태 점검\n  - 발신기 및 표시등 상태 점검' },
  '비상콘센트':   { num: 5, text: '전층 비상 콘센트 설비 점검\n  - 단상220V, 삼상380V 전압 측정\n  - 차단기 점검 및 트립버튼 점검' },
  '소화기':       { num: 4, text: '전층 소화기 점검\n  - 소화기 압력상태 점검\n  - 안전핀 체결상태 확인\n  - 위치표시 스티커 부착상태 점검\n  - 받침대 파손여부 점검\n  - 소화기 점검표 교체' },
  'CCTV':         { num: 4, text: '전층 CCTV 및 DVR 점검\n  - CCTV 부착상태 및 화각체크\n  - DVR 작동상태 및 녹화상태 점검' },
  '소방펌프':     { num: 4, text: '소방펌프 점검\n  - 밸브 개폐상태 점검 및 템퍼스위치 점검\n  - 압력셋팅 확인 및 MCC반 조작스위치 상태 점검\n  - 펌프 수동테스트\n  - 밸브 동작시 화재수신반 시그널 확인상태 점검' },
}

// 명일업무 월점검 항목 (작성법 Sheet4 기준 — 간략 버전)
const TOMORROW_INSPECT_LABELS: Record<string, { num: number; text: string }> = {
  '방화문':       { num: 3, text: '피난계단 점검' },    // 방화문 일정 → 명일: 피난계단+방화문
  '특별피난계단': { num: 4, text: '방화문 점검' },
  '전실제연댐퍼': { num: 3, text: '전실제연댐퍼 점검' },
  '연결송수관':   { num: 4, text: '연결송수관 점검' },
  '청정소화약제': { num: 3, text: '가스계소화설비 점검' },
  '회전문':       { num: 3, text: '회전문, 주차장비 시스템 점검' },
  '주차장비':     { num: 3, text: '회전문, 주차장비 시스템 점검' },
  'DIV':          { num: 3, text: '전층 DIV 점검' },
  '컴프레셔':     { num: 3, text: '전층 DIV 점검' },
  '유도등':       { num: 3, text: '전층 유도등 점검' },
  '배연창':       { num: 3, text: '전층 배연창 점검' },
  '완강기':       { num: 3, text: '전층 완강기 점검' },
  '소방용전원공급반': { num: 3, text: '전층 소방용 전원공급장치 점검' },
  '방화셔터':     { num: 3, text: '전층 방화셔터 점검' },
  '소화전':       { num: 3, text: '전층 소화전 점검' },
  '비상콘센트':   { num: 3, text: '전층 소화전 점검' },
  '소화기':       { num: 3, text: '전층 소화기 점검' },
  'CCTV':         { num: 3, text: '전층 CCTV 점검' },
  '소방펌프':     { num: 3, text: '소방펌프 작동 점검' },
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

  // 1. 일상점검 (기재번호 1)
  tasks.push({ number: num++, content: '화재수신반 감시 및 승강기 운행상태 점검' })
  // 2. 방화 순찰 (기재번호 2)
  tasks.push({ number: num++, content: '전층 방화 순찰' })

  // 3. 순찰 항목 (기재번호 3)
  for (const p of patrol) {
    const label = `야간순찰 및 소등 (${p.time})`
    tasks.push({ number: num++, content: label })
  }

  // 월점검 (schedule_items에서 inspect 카테고리 — 작성법 기재번호 사용)
  const inspectItems = (schedules ?? []).filter((s: any) =>
    s.date === dateStr && s.category === 'inspect'
  )
  for (const s of inspectItems) {
    const cat = s.inspection_category ?? ''
    const full = INSPECT_FULL_CONTENT[cat]
    if (full) {
      tasks.push({ number: full.num, content: full.text })
    } else {
      tasks.push({ number: num, content: s.title ?? cat })
    }
    num = Math.max(num, (full?.num ?? num) + 1)
  }

  // 업무 일정 (제목 + 내용)
  const taskItems = (schedules ?? []).filter((s: any) =>
    s.date === dateStr && s.category === 'task'
  )
  for (const s of taskItems) {
    const memo = s.memo ? `\n  - ${s.memo}` : ''
    tasks.push({ number: num++, content: `${s.title ?? ''}${memo}` })
  }

  // 승강기 고장 수리 (호기 + 증상 + 수리내용)
  const faults = (elevatorFaults ?? []).filter((f: any) => {
    if (!f.fault_at) return false
    return f.fault_at.startsWith(dateStr)
  })
  for (const f of faults) {
    const detail = f.repair_detail ? `\n  - ${f.repair_detail}` : ''
    tasks.push({ number: num++, content: `승강기 고장 수리\n  - ${f.elevator_id ?? ''} : ${f.symptoms ?? ''}${detail}` })
  }

  // 승강기 정기 점검 / 검사 (제목 - 업체및기관 + 메모)
  // inspection_category에 업체명이 저장됨
  const elevatorItems = (schedules ?? []).filter((s: any) =>
    s.date === dateStr && s.category === 'elevator'
  )
  for (const s of elevatorItems) {
    const agency = s.inspection_category ?? ''
    const agencyStr = agency ? ` - ${agency}` : ''
    const memoStr = s.memo ? `\n  - ${s.memo}` : ''
    tasks.push({ number: num++, content: `${s.title ?? ''}${agencyStr}${memoStr}` })
  }

  // 소방 일정 (제목 - 업체및기관 + 내용)
  const fireItems = (schedules ?? []).filter((s: any) =>
    s.date === dateStr && s.category === 'fire'
  )
  for (const s of fireItems) {
    const agency = s.inspection_category ?? ''
    const agencyStr = agency ? ` - ${agency}` : ''
    const memoStr = s.memo ? `\n  - ${s.memo}` : ''
    tasks.push({ number: num++, content: `${s.title ?? ''}${agencyStr}${memoStr}` })
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

  // 1. 승강기 운행상태 점검 (기재번호 1)
  tasks.push({ number: num++, content: '승강기 운행상태 점검' })

  // 2. 전층 방화 순찰 (기재번호 2)
  tasks.push({ number: num++, content: '전층 방화 순찰' })

  // 명일 월점검 일정 (작성법 Sheet4 기재번호 사용)
  const tomorrowInspect = (schedules ?? []).filter((s: any) =>
    s.date === tomorrowStr && s.category === 'inspect'
  )
  const seen = new Set<string>()
  for (const s of tomorrowInspect) {
    const cat = s.inspection_category ?? ''
    const entry = TOMORROW_INSPECT_LABELS[cat]
    if (entry && !seen.has(entry.text)) {
      seen.add(entry.text)
      tasks.push({ number: entry.num, content: entry.text })
      num = Math.max(num, entry.num + 1)
    } else if (!entry) {
      tasks.push({ number: num++, content: s.title ?? cat })
    }
  }

  // 명일 업무 일정 (제목 + 내용)
  const tomorrowTask = (schedules ?? []).filter((s: any) =>
    s.date === tomorrowStr && s.category === 'task'
  )
  for (const s of tomorrowTask) {
    const memoStr = s.memo ? `\n  - ${s.memo}` : ''
    tasks.push({ number: num++, content: `${s.title ?? ''}${memoStr}` })
  }

  // 명일 승강기 일정 (제목 - 업체및기관 + 내용)
  const tomorrowElev = (schedules ?? []).filter((s: any) =>
    s.date === tomorrowStr && s.category === 'elevator'
  )
  for (const s of tomorrowElev) {
    const agency = s.inspection_category ?? ''
    const agencyStr = agency ? ` - ${agency}` : ''
    const memoStr = s.memo ? `\n  - ${s.memo}` : ''
    tasks.push({ number: num++, content: `${s.title ?? ''}${agencyStr}${memoStr}` })
  }

  // 명일 소방 일정 (제목 - 업체및기관 + 내용)
  const tomorrowFire = (schedules ?? []).filter((s: any) =>
    s.date === tomorrowStr && s.category === 'fire'
  )
  for (const s of tomorrowFire) {
    const agency = s.inspection_category ?? ''
    const agencyStr = agency ? ` - ${agency}` : ''
    const memoStr = s.memo ? `\n  - ${s.memo}` : ''
    tasks.push({ number: num++, content: `${s.title ?? ''}${agencyStr}${memoStr}` })
  }

  return tasks
}

// ── 메인 함수 ──────────────────────────────────────────────

export function buildDailyReportData(
  date: string,
  apiData: { schedules: any[]; leaves: any[]; elevatorFaults: any[] },
  notes: string,
  staffData?: { id: string; name: string; title?: string }[]
): DailyReportData {
  const dateObj = parseDateStr(date)
  const dow = DOW_KO[dateObj.getDay()]

  const personnel = buildPersonnel(dateObj, apiData.leaves ?? [], apiData.schedules ?? [], staffData)
  const patrol = buildPatrol(dateObj, personnel.onDuty)
  const todayTasks = buildTasks(dateObj, patrol, apiData.schedules ?? [], apiData.elevatorFaults ?? [])
  const tomorrowTasks = buildTomorrowTasks(dateObj, patrol, apiData.schedules ?? [])

  // 텍스트 조합 (엑셀 병합셀용)
  const todayText = todayTasks.map(t => `${t.number}. ${t.content}`).join('\n')
  const tomorrowText = tomorrowTasks.map(t => `${t.number}. ${t.content}`).join('\n')

  return {
    date,
    dayOfWeek: dow,
    personnel,
    patrol,
    todayTasks,
    tomorrowTasks,
    todayText,
    tomorrowText,
    notes,
  }
}
