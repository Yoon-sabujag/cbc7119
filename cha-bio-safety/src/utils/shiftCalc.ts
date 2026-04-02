import type { ShiftType } from '../types'

// ── 공휴일 판정 ─────────────────────────────────────────
import { isHoliday as _isHolidayKr } from '@hyunbinseo/holidays-kr'

export function isKoreanHolidayOrWeekend(date: Date): boolean {
  const dow = date.getDay()
  if (dow === 0 || dow === 6) return true
  try {
    return _isHolidayKr(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0))
  } catch { return false }
}

// ── 직원별 근무 패턴 설정 ─────────────────────────────────
// 기준일: 2026-03-01(일) 박보융 = 당직
const REF_DATE = new Date(2026, 2, 1) // 2026-03-01 (로컬 시간)

// 3교대 오프셋 (당=0, 비=1, 주=2)
// 박보융: 0, 윤종엽: 1, 김병조: 2
const SHIFT_OFFSETS: Record<string, number> = {
  '2023071752': 0, // 박보융
  '2022051052': 1, // 윤종엽
  '2021061451': 2, // 김병조
}

const CYCLE = ['당','비','주'] as const
export type RawShift = '당' | '비' | '주' | '휴'

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime()
  return Math.round(ms / 86_400_000)
}

function calcRaw(staffId: string, date: Date): RawShift {
  const isOff = isKoreanHolidayOrWeekend(date)

  // 석현민 (방재책임, 평일 주간 고정 — 공휴일도 휴)
  if (staffId === '2018042451') {
    return isOff ? '휴' : '주'
  }

  const offset = SHIFT_OFFSETS[staffId]
  if (offset === undefined) return '주'

  const diff = daysBetween(REF_DATE, date)
  const base = CYCLE[(((diff + offset) % 3) + 3) % 3]

  // 주간 근무가 공휴일/토/일이면 휴
  if (base === '주' && isOff) return '휴'
  return base
}

// RawShift → ShiftType 변환
const RAW_TO_SHIFT: Record<RawShift, ShiftType> = {
  '당': 'night',
  '비': 'off',
  '주': 'day',
  '휴': 'leave',
}

export function getShiftType(staffId: string, date: Date): ShiftType {
  return RAW_TO_SHIFT[calcRaw(staffId, date)]
}

export function getRawShift(staffId: string, date: Date): RawShift {
  return calcRaw(staffId, date)
}

// 월 전체 스케줄 반환
// staffData: 외부에서 주입되는 직원 배열 (TECH-01: 하드코딩 제거)
export function getMonthlySchedule(
  year: number,
  month: number,
  staffData?: { id: string; name: string; title: string }[]
): {
  daysInMonth: number
  staffRows: { id: string; name: string; title: string; shifts: RawShift[] }[]
} {
  const staff = staffData ?? []
  const daysInMonth = new Date(year, month, 0).getDate()

  const staffRows = staff.map(s => ({
    ...s,
    shifts: Array.from({ length: daysInMonth }, (_, i) =>
      calcRaw(s.id, new Date(year, month - 1, i + 1))
    ),
  }))

  return { daysInMonth, staffRows }
}

export const SHIFT_LABEL: Record<RawShift, string> = { '당':'당','비':'비','주':'주','휴':'휴' }
export const SHIFT_COLOR: Record<RawShift, string> = {
  '당': '#ef4444', // 빨간색
  '비': '#3b82f6', // 파란색
  '주': '#f59e0b', // 노란색
  '휴': '#6b7280', // 회색
}
export const DOW_KO = ['일','월','화','수','목','금','토']
