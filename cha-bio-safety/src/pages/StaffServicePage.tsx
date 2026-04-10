import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { leaveApi, scheduleApi, mealApi, menuApi, holidayApi, type LeaveItem } from '../utils/api'
import { useAuthStore } from '../stores/authStore'
import { useStaffList } from '../hooks/useStaffList'
import { getRawShift, SHIFT_COLOR, DOW_KO, type RawShift } from '../utils/shiftCalc'
import { calcProvidedMeals, calcWeekendAllowance } from '../utils/mealCalc'
import * as pdfjsLib from 'pdfjs-dist'
import { generateLeaveRequest } from '../utils/generateLeaveRequest'
import type { StaffFull } from '../types'

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

const HIRE_DATES: Record<string, string> = {
  '2018042451': '2018-04-24',
  '2021061451': '2021-06-14',
  '2022051052': '2022-05-10',
  '2023071752': '2023-07-17',
}

function calcLeaveQuota(staffId: string): number {
  const hireStr = HIRE_DATES[staffId]
  if (!hireStr) return 15
  const hire = new Date(hireStr)
  const today = new Date()
  const daysWorked = Math.round((today.getTime() - hire.getTime()) / 86400000) + 1
  if (daysWorked <= 365) return Math.min(Math.floor(daysWorked / 30), 11)
  let years = today.getFullYear() - hire.getFullYear()
  if (today.getMonth() < hire.getMonth() ||
    (today.getMonth() === hire.getMonth() && today.getDate() < hire.getDate())) years--
  const extra = Math.min(Math.max(0, Math.floor((years - 1) / 2)), 10)
  return Math.min(15 + extra, 25)
}

function localYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const HOLIDAYS_FALLBACK: Record<string, string> = {
  '2025-01-01': '신정',
  '2025-01-27': '임시공휴일',
  '2025-01-28': '설날 연휴', '2025-01-29': '설날', '2025-01-30': '설날 연휴',
  '2025-03-01': '삼일절', '2025-03-03': '대체공휴일',
  '2025-05-05': '어린이날/부처님오신날', '2025-05-06': '대체공휴일',
  '2025-06-03': '임시공휴일', '2025-06-06': '현충일',
  '2025-08-15': '광복절',
  '2025-10-03': '개천절',
  '2025-10-05': '추석 연휴', '2025-10-06': '추석', '2025-10-07': '추석 연휴',
  '2025-10-08': '대체공휴일', '2025-10-09': '한글날',
  '2025-12-25': '크리스마스',
  '2026-01-01': '신정',
  '2026-02-16': '설날 연휴', '2026-02-17': '설날', '2026-02-18': '설날 연휴',
  '2026-03-01': '삼일절', '2026-03-02': '대체공휴일',
  '2026-05-05': '어린이날', '2026-05-24': '부처님오신날', '2026-05-25': '대체공휴일',
  '2026-06-03': '전국동시지방선거', '2026-06-06': '현충일',
  '2026-08-15': '광복절', '2026-08-17': '대체공휴일',
  '2026-09-23': '추석 연휴', '2026-09-24': '추석', '2026-09-25': '추석 연휴',
  '2026-10-03': '개천절', '2026-10-05': '대체공휴일', '2026-10-09': '한글날',
  '2026-12-25': '크리스마스',
  '2027-01-01': '신정',
  '2027-02-06': '설날 연휴', '2027-02-07': '설날', '2027-02-08': '설날 연휴', '2027-02-09': '대체공휴일',
  '2027-03-01': '삼일절',
  '2027-05-05': '어린이날', '2027-05-13': '부처님오신날',
  '2027-06-06': '현충일',
  '2027-08-15': '광복절', '2027-08-16': '대체공휴일',
  '2027-10-03': '개천절', '2027-10-04': '대체공휴일', '2027-10-09': '한글날',
  '2027-10-14': '추석 연휴', '2027-10-15': '추석', '2027-10-16': '추석 연휴',
  '2027-12-25': '크리스마스',
}

const SHIFT_LABEL: Record<RawShift, string> = { '당': '당', '비': '비', '주': '주', '휴': '휴' }
const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

// 공가: 보라(#a855f7) — 주간(#f59e0b)과 구분
const LEAVE_TYPES = [
  { type: 'full', label: '연차', rgb: '34,197,94' },
  { type: 'half_am', label: '오전반차', rgb: '34,197,94' },
  { type: 'half_pm', label: '오후반차', rgb: '34,197,94' },
  { type: 'official_full', label: '공가', rgb: '168,85,247' },
  { type: 'official_half_am', label: '공가오전', rgb: '168,85,247' },
  { type: 'official_half_pm', label: '공가오후', rgb: '168,85,247' },
] as const

// 셀 배경색 — 앱 헤더 동그라미와 동일한 CSS 변수
const SHIFT_BG: Record<RawShift, string> = {
  '당': 'var(--c-night)',  // #ef4444
  '비': 'var(--c-off)',    // #3b82f6
  '주': 'var(--c-day)',    // #f59e0b
  '휴': 'var(--c-leave)',  // #6b7280
}
const LEAVE_BG: Record<string, string> = {
  full: '#22c55e',
  half_am: '#22c55e',
  half_pm: '#22c55e',
  official_full: '#a855f7',
  official_half_am: '#a855f7',
  official_half_pm: '#a855f7',
  condolence: '#f97316',
  sick_work: '#ef4444',
  sick_personal: '#ef4444',
  health: '#ec4899',
  other_special: '#6366f1',
}

// 중앙 패널 휴가종류 버튼 구성
// Row 1 (3열): 연차, 오전반차, 오후반차
// Row 2~5 (1열): 경조휴가, 병가(공상), 병가(사상), 보건휴가
// Row 6 (3열): 공가, 오전공가, 오후공가
// Row 7 (1열): 기타특별휴가
const DOC_LEAVE_GRID: { type: string; label: string; cols?: number }[][] = [
  [
    { type: 'annual', label: '연차' },
    { type: 'half_am', label: '오전반차' },
    { type: 'half_pm', label: '오후반차' },
  ],
  [{ type: 'condolence', label: '경조휴가', cols: 3 }],
  [{ type: 'sick_work', label: '병가(공상)', cols: 3 }],
  [{ type: 'sick_personal', label: '병가(사상)', cols: 3 }],
  [{ type: 'health', label: '보건휴가', cols: 3 }],
  [
    { type: 'official', label: '공가' },
    { type: 'official_half_am', label: '오전공가' },
    { type: 'official_half_pm', label: '오후공가' },
  ],
  [{ type: 'other_special', label: '기타특별휴가', cols: 3 }],
]

// 연차 계열 타입 (사유 불필요)
const ANNUAL_TYPES = new Set(['annual', 'half_am', 'half_pm'])

// 중앙 패널 버튼 → API leave type 매핑 (달력 등록용)
const DOC_TO_API_TYPE: Record<string, string> = {
  annual: 'full', half_am: 'half_am', half_pm: 'half_pm',
  official: 'official_full', official_half_am: 'official_half_am', official_half_pm: 'official_half_pm',
  condolence: 'condolence', sick_work: 'sick_work', sick_personal: 'sick_personal',
  health: 'health', other_special: 'other_special',
}
// 역방향: API type → doc type (달력에서 현재 선택 표시용)
const API_TO_DOC_TYPE: Record<string, string> = {
  full: 'annual', half_am: 'half_am', half_pm: 'half_pm',
  official_full: 'official', official_half_am: 'official_half_am', official_half_pm: 'official_half_pm',
  condolence: 'condolence', sick_work: 'sick_work', sick_personal: 'sick_personal',
  health: 'health', other_special: 'other_special',
}

const LEAVE_LABEL: Record<string, string> = {
  full: '연차', half_am: '오전반차', half_pm: '오후반차',
  official_full: '공가', official_half_am: '공가오전', official_half_pm: '공가오후',
  condolence: '경조', sick_work: '병가(공)', sick_personal: '병가(사)', health: '보건', other_special: '기타특별',
}

export default function StaffServicePage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { staff } = useAuthStore()
  const { data: staffList = [] } = useStaffList()
  const isDesktop = useIsDesktop()
  const dropRef = useRef<HTMLLabelElement>(null)

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selDate, setSelDate] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // ── 휴가신청서 폼 state (desktop only) ──────────────────────
  const staffFull = staffList.find(s => s.id === (staff?.id ?? '')) as StaffFull | undefined
  const [docLeaveType, setDocLeaveType] = useState<string>('')
  const [docPhone, setDocPhone] = useState<string>('')
  const [docStartDate, setDocStartDate] = useState<string>('')
  const [docEndDate, setDocEndDate] = useState<string>('')
  const [docOtherReason, setDocOtherReason] = useState<string>('')
  const [docReason, setDocReason] = useState<string>('')  // 연차 외 사유
  const [mobileOtherType, setMobileOtherType] = useState('')  // 모바일 기타 휴가
  const [mobileReason, setMobileReason] = useState('')  // 모바일 사유

  // ── 휴가신청서 미리보기 캘리브레이션 ───────────────────────
  // 마커: 0=입사일yy, 1=입사일dd, 2=성명, 3=기간시작yy, 4=기간시작dd,
  //       5=기간종료yy, 6=기간종료dd, 7=기간일수,
  //       8=체크_연차, 9=체크_경조, 10=체크_병가공상, 11=체크_병가사상,
  //       12=체크_보건, 13=체크_공가, 14=체크_기타특별,
  //       15=기타특별사유, 16=연락처, 17=신청일수, 18=사유기타사항
  const LEAVE_CALIB_STEPS = [
    { label: '입사일 년', color: '#ef4444' },
    { label: '입사일 일', color: '#ef4444' },
    { label: '성명', color: '#3b82f6' },
    { label: '기간시작 년', color: '#22c55e' },
    { label: '기간시작 일', color: '#22c55e' },
    { label: '기간종료 년', color: '#f59e0b' },
    { label: '기간종료 일', color: '#f59e0b' },
    { label: '기간 일수', color: '#a855f7' },
    { label: '체크 연차', color: '#000' },
    { label: '체크 경조', color: '#000' },
    { label: '체크 병가공상', color: '#000' },
    { label: '체크 병가사상', color: '#000' },
    { label: '체크 보건', color: '#000' },
    { label: '체크 공가', color: '#000' },
    { label: '체크 기타특별', color: '#000' },
    { label: '기타특별 사유', color: '#6366f1' },
    { label: '연락처', color: '#ec4899' },
    { label: '신청일수', color: '#14b8a6' },
    { label: '사유 기타사항', color: '#f97316' },
  ] as const

  type LeaveCalibData = Record<number, { x: number; y: number }>
  const LEAVE_CALIB_KEY = 'calib_leave_request'
  const [leaveCalibMode, setLeaveCalibMode] = useState(false)
  const [leaveCalibStep, setLeaveCalibStep] = useState(0)
  const [leaveCalibPoints, setLeaveCalibPoints] = useState<(null | { x: number; y: number })[]>([])
  const [leaveActivePoint, setLeaveActivePoint] = useState<{ x: number; y: number } | null>(null)
  const leavePreviewRef = useRef<HTMLDivElement>(null)
  const [leaveImgRect, setLeaveImgRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)

  const loadLeaveCalib = (): LeaveCalibData => {
    try { return JSON.parse(localStorage.getItem(LEAVE_CALIB_KEY) ?? '{}') } catch { return {} }
  }
  const [leaveCalib, setLeaveCalib] = useState<LeaveCalibData>(loadLeaveCalib)

  const measureLeaveImg = useCallback(() => {
    const cont = leavePreviewRef.current
    if (!cont) return
    const img = cont.querySelector('img')
    if (!img) return
    const cr = cont.getBoundingClientRect()
    const ir = img.getBoundingClientRect()
    setLeaveImgRect({ left: ir.left - cr.left, top: ir.top - cr.top, width: ir.width, height: ir.height })
  }, [])

  useEffect(() => {
    measureLeaveImg()
    const obs = new ResizeObserver(() => measureLeaveImg())
    if (leavePreviewRef.current) obs.observe(leavePreviewRef.current)
    return () => obs.disconnect()
  }, [measureLeaveImg])

  const leaveClientToPct = useCallback((clientX: number, clientY: number) => {
    if (!leaveImgRect) return null
    const cont = leavePreviewRef.current
    if (!cont) return null
    const cb = cont.getBoundingClientRect()
    const x = ((clientX - cb.left - leaveImgRect.left) / leaveImgRect.width) * 100
    const y = ((clientY - cb.top - leaveImgRect.top) / leaveImgRect.height) * 100
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
  }, [leaveImgRect])

  const SNAP_THRESHOLD = 1.5 // Y 좌표 차이 1.5% 이내면 스냅
  const leaveCalibClick = useCallback((e: React.MouseEvent) => {
    if (!leaveCalibMode) return
    const pt = leaveClientToPct(e.clientX, e.clientY)
    if (!pt) return
    // 기존 확정된 포인트들의 Y에 스냅
    const allYs = leaveCalibPoints.filter(Boolean).map(p => p!.y)
    for (const y of allYs) {
      if (Math.abs(pt.y - y) < SNAP_THRESHOLD) { pt.y = y; break }
    }
    setLeaveActivePoint(pt)
  }, [leaveCalibMode, leaveClientToPct, leaveCalibPoints])

  const leaveCalibConfirm = useCallback(() => {
    if (!leaveActivePoint) return
    const newPoints = [...leaveCalibPoints, leaveActivePoint]
    setLeaveCalibPoints(newPoints)
    setLeaveActivePoint(null)
    if (leaveCalibStep + 1 >= LEAVE_CALIB_STEPS.length) {
      const data: LeaveCalibData = {}
      newPoints.forEach((pt, i) => { if (pt) data[i] = pt })
      localStorage.setItem(LEAVE_CALIB_KEY, JSON.stringify(data))
      setLeaveCalib(data)
      setLeaveCalibMode(false); setLeaveCalibStep(0); setLeaveCalibPoints([])
    } else {
      setLeaveCalibStep(leaveCalibStep + 1)
    }
  }, [leaveActivePoint, leaveCalibPoints, leaveCalibStep])

  const leaveCalibSkip = useCallback(() => {
    const newPoints = [...leaveCalibPoints, null]
    setLeaveCalibPoints(newPoints)
    setLeaveActivePoint(null)
    if (leaveCalibStep + 1 >= LEAVE_CALIB_STEPS.length) {
      const data: LeaveCalibData = {}
      newPoints.forEach((pt, i) => { if (pt) data[i] = pt })
      localStorage.setItem(LEAVE_CALIB_KEY, JSON.stringify(data))
      setLeaveCalib(data)
      setLeaveCalibMode(false); setLeaveCalibStep(0); setLeaveCalibPoints([])
    } else {
      setLeaveCalibStep(leaveCalibStep + 1)
    }
  }, [leaveCalibPoints, leaveCalibStep])

  // 캘리브 포인트로부터 보간 계산
  const lp = leaveCalib
  const interp = (a: number, b: number, idx: number, frac: number) => {
    const pa = lp[a], pb = lp[b]
    if (!pa || !pb) return null
    return { x: pa.x + (pb.x - pa.x) * frac, y: pa.y }
  }

  // staffFull.phone이 로드되면 docPhone 초기화
  useEffect(() => {
    if (staffFull?.phone && !docPhone) setDocPhone(staffFull.phone)
  }, [staffFull?.phone])

  // 반차 타입 판별
  const HALF_TYPES = new Set(['half_am', 'half_pm', 'official_half_am', 'official_half_pm'])
  const isHalfType = HALF_TYPES.has(docLeaveType)

  // 근무일수 (주말+공휴일 제외)
  const docRawWorkDays = useMemo(() => {
    if (!docStartDate || !docEndDate) return 0
    const s = new Date(docStartDate), e = new Date(docEndDate)
    let count = 0
    const cur = new Date(s)
    while (cur <= e) {
      const dow = cur.getDay()
      const ymd = localYMD(cur)
      if (dow !== 0 && dow !== 6 && !HOLIDAYS_FALLBACK[ymd]) count++
      cur.setDate(cur.getDate() + 1)
    }
    return count
  }, [docStartDate, docEndDate])

  // 기간 일수 = 신청일수 = 근무일수 (반차는 0.5 적용)
  const docDays = isHalfType ? docRawWorkDays * 0.5 : docRawWorkDays

  const handleLeaveDownload = useCallback(async () => {
    if (!staff || !docStartDate || !docEndDate) {
      toast.error('기간을 입력하세요')
      return
    }
    const toastId = toast.loading('휴가신청서 생성 중...')
    try {
      // half_am/half_pm → annual, official_half_am/pm → official (엑셀 양식에 맞게 매핑)
      const excelTypeMap: Record<string, string> = {
        half_am: 'annual', half_pm: 'annual',
        official_half_am: 'official', official_half_pm: 'official',
      }
      const excelType = excelTypeMap[docLeaveType] ?? docLeaveType
      await generateLeaveRequest({
        staffName: staff.name,
        staffId: staff.id,
        hireDate: `${staff.id.slice(0,4)}-${staff.id.slice(4,6)}-${staff.id.slice(6,8)}`,
        phone: docPhone,
        leaveType: excelType,
        otherReason: docOtherReason,
        reason: docReason,
        startDate: docStartDate,
        endDate: docEndDate,
        totalDays: docDays,
        workDays: docDays,
      })
      toast.success('휴가신청서 다운로드 완료', { id: toastId })
    } catch (err: any) {
      toast.error(err?.message ?? '생성 실패', { id: toastId })
    }
  }, [staff, docStartDate, docEndDate, docPhone, docLeaveType, docOtherReason, docReason, docDays])

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
  const staffId = staff?.id ?? ''

  // ── Data fetching ─────────────────────────────────────────
  const { data: leaveData, isLoading: leaveLoading } = useQuery({
    queryKey: ['leaves', year, monthStr],
    queryFn: () => leaveApi.list(year, monthStr),
    enabled: !!staff,
  })

  const { data: leaveYearData } = useQuery({
    queryKey: ['leaves-year', year],
    queryFn: () => leaveApi.list(year),
    enabled: !!staff,
  })

  const { data: mealData } = useQuery({
    queryKey: ['meals', year, monthStr],
    queryFn: () => mealApi.list(year, monthStr),
    enabled: !!staff,
  })

  const { data: scheduleItems = [] } = useQuery({
    queryKey: ['schedule', monthStr],
    queryFn: () => scheduleApi.getByMonth(monthStr),
    enabled: !!staff,
  })

  // 공휴일: 앱 로드 시 1일 1회 API 동기화 → DB 조회
  useEffect(() => {
    const key = 'holiday_sync_date'
    const today = new Date().toISOString().slice(0, 10)
    if (localStorage.getItem(key) !== today) {
      fetch('/api/holidays/sync', { method: 'POST' })
        .then(() => localStorage.setItem(key, today))
        .catch(() => {})
    }
  }, [])

  const { data: holidayList = [] } = useQuery({
    queryKey: ['holidays', year],
    queryFn: () => holidayApi.list(year),
    staleTime: 60 * 60 * 1000,
    enabled: !!staff,
  })
  const holidayMap = useMemo(() => {
    const m: Record<string, string> = {}
    // DB 데이터 우선
    holidayList.forEach(h => { m[h.date] = h.name })
    // DB에 없으면 하드코딩 fallback
    Object.entries(HOLIDAYS_FALLBACK).forEach(([d, n]) => { if (!m[d]) m[d] = n })
    return m
  }, [holidayList])

  const todayKST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  const todayStr = localYMD(todayKST)

  const { data: menuData } = useQuery({
    queryKey: ['menu', todayStr],
    queryFn: () => menuApi.getByDate(todayStr),
    enabled: !!staff,
  })

  const handleMenuUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const toastId = toast.loading('식단표 분석 중...')

    try {
      // 1) PDF 텍스트 + 좌표 추출
      const arrayBuffer = await file.arrayBuffer()
      const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const page = await doc.getPage(1)
      const tc = await page.getTextContent()
      const items = tc.items
        .filter((i: any) => i.str?.trim())
        .map((i: any) => ({ x: Math.round(i.transform[4]), y: Math.round(i.transform[5]), text: i.str.trim() }))

      // 2) 날짜 헤더 파싱 → 열 경계 결정
      const dateRe = /(\d{1,2})월\s*(\d{1,2})일\(([월화수목금토일])\)/
      const dateCols: { x: number; ymd: string; dow: string }[] = []
      const thisYear = new Date().getFullYear()
      for (const it of items) {
        const m = it.text.match(dateRe)
        if (m) {
          const mo = parseInt(m[1]), da = parseInt(m[2])
          dateCols.push({ x: it.x, ymd: `${thisYear}-${String(mo).padStart(2, '0')}-${String(da).padStart(2, '0')}`, dow: m[3] })
        }
      }
      dateCols.sort((a, b) => a.x - b.x)
      // 토요일 제외 (메뉴 없음)
      const weekdayCols = dateCols.filter(d => d.dow !== '토')
      if (weekdayCols.length < 3) throw new Error('날짜를 찾을 수 없습니다')

      // 3) 섹션 y좌표 찾기 (PDF 좌표는 아래→위, y가 클수록 위)
      const sectionItems = items.filter((i: any) =>
        i.text === '중식' || i.text === 'A' || i.text === 'B' || i.text === '석식' || i.text === 'PLUS' || i.text === 'SNACK'
      )
      // 왼쪽 섹션 헤더만 (x < 첫 열 x)
      const leftHeaders = sectionItems.filter((i: any) => i.x < weekdayCols[0].x)

      const findY = (label: string) => leftHeaders.find(i => i.text === label)?.y
      // "중식" 헤더가 2개 — 첫 번째(높은 y)가 A영역 상단, 두 번째(낮은 y)가 B영역 상단
      const lunchHeaders = leftHeaders.filter(i => i.text === '중식').sort((a: any, b: any) => b.y - a.y)
      const lunchTopY = lunchHeaders[0]?.y  // 중식A 대표메뉴 포함 상한
      const lunchBTopY = lunchHeaders[1]?.y // 중식B 대표메뉴 포함 상한
      const lunchAY = findY('A')
      const lunchBY = findY('B')
      const plusY = findY('PLUS')
      // "석식" 헤더가 2개일 수 있음 (석식 SALAD 라벨 포함) — 가장 높은 y가 석식 본문
      const dinnerHeaders = leftHeaders.filter(i => i.text === '석식').sort((a: any, b: any) => b.y - a.y)
      const dinnerY = dinnerHeaders[0]?.y
      // 석식 SALAD 찾기 — "석식 SALAD" 또는 "SALAD"가 석식 아래에 위치
      const saladItems = items.filter((i: any) => i.text.includes('SALAD') && i.x < weekdayCols[0].x).sort((a: any, b: any) => b.y - a.y)
      const dinnerSaladY = saladItems.find((i: any) => i.y < (dinnerY ?? 0))?.y
      const snackY = findY('SNACK')

      if (!lunchAY || !lunchBY || !dinnerY) throw new Error('메뉴 섹션을 찾을 수 없습니다')

      // 4) 열별 x 범위 계산
      const colRanges = weekdayCols.map((col, idx) => {
        const nextX = idx < weekdayCols.length - 1 ? weekdayCols[idx + 1].x : col.x + 120
        return { ...col, xMin: col.x - 10, xMax: nextX - 10 }
      })

      // 5) 영역별 텍스트 수집
      function collectTexts(xMin: number, xMax: number, yMin: number, yMax: number): string {
        // PDF 좌표: y 큰 값 = 위 → yMin+2 여유로 같은 줄 헤더의 메뉴 포함
        const inRange = items.filter((i: any) =>
          i.x >= xMin && i.x < xMax &&
          i.y <= yMin + 2 && i.y > yMax  // y가 작을수록 아래
        )
        // 김치류, 밥 제외 (주요 메뉴만)
        const filtered = inRange
          .filter((i: any) => !/^(포기김치|깍두기|볶음김치|쌀밥|귀리밥|귀리기장밥|흑미밥)$/.test(i.text) && !/</.test(i.text))
          .sort((a: any, b: any) => b.y - a.y) // 위→아래 순서
          .map((i: any) => i.text)
        return filtered.slice(0, 5).join(' / ')
      }

      // 6) 각 날짜별 메뉴 조합
      // 중식A: "중식" 헤더 ~ 중식B "중식" 헤더 (PLUS/CORNER/SALAD/SNACK 제외)
      // 중식B: 중식B "중식" 헤더 ~ PLUS 시작 (PLUS 이하 제외)
      // 석식: "석식" 헤더 ~ 석식 SALAD 시작 (석식SALAD/SNACK 제외)
      const menus = colRanges.map(col => ({
        date: col.ymd,
        lunch_a: collectTexts(col.xMin, col.xMax, lunchTopY ?? lunchAY, lunchBTopY ?? lunchBY),
        lunch_b: collectTexts(col.xMin, col.xMax, lunchBTopY ?? lunchBY, plusY ?? dinnerY!),
        dinner: collectTexts(col.xMin, col.xMax, dinnerY!, dinnerSaladY ?? snackY ?? dinnerY! - 200),
      }))

      // 7) R2에 PDF 업로드
      const fd = new FormData()
      fd.append('file', file)
      const uploadRes = await fetch('/api/uploads', {
        method: 'POST', body: fd,
        headers: { Authorization: `Bearer ${useAuthStore.getState().token}` },
      })
      const uploadJson = await uploadRes.json() as any
      const pdfKey = uploadJson.success ? uploadJson.data.key : undefined

      // 8) DB에 메뉴 저장
      await menuApi.upsert(menus, pdfKey)
      qc.invalidateQueries({ queryKey: ['menu'] })

      toast.success(`${menus.length}일분 메뉴 등록 완료`, { id: toastId })
    } catch (err: any) {
      toast.error(err?.message ?? '식단표 분석 실패', { id: toastId })
    }
  }, [qc])

  const myLeaves = leaveData?.myLeaves ?? []
  const teamLeaves = leaveData?.teamLeaves ?? []
  const myLeavesYear = leaveYearData?.myLeaves ?? []
  const mealRecords = mealData?.records ?? []

  // ── Derived data ──────────────────────────────────────────
  const usedDays = useMemo(() =>
    myLeavesYear.reduce((a, l) => {
      if (l.type === 'full') return a + 1
      if (l.type === 'half_am' || l.type === 'half_pm') return a + 0.5
      return a
    }, 0)
  , [myLeavesYear])

  const quota = staff ? calcLeaveQuota(staff.id) : 15
  const remaining = quota - usedDays

  const myLeaveMap = useMemo(() => {
    const m: Record<string, LeaveItem> = {}
    myLeaves.forEach(l => { m[l.date] = l })
    return m
  }, [myLeaves])

  const teamLeaveMap = useMemo(() => {
    const m: Record<string, LeaveItem[]> = {}
    teamLeaves.forEach(l => {
      if (!m[l.date]) m[l.date] = []
      m[l.date].push(l)
    })
    return m
  }, [teamLeaves])

  const mealMap = useMemo(() => {
    const m: Record<string, number> = {}
    mealRecords.forEach(r => { m[r.date] = r.skippedMeals })
    return m
  }, [mealRecords])

  const inspectDates = useMemo(() => {
    const s = new Set<string>()
    scheduleItems.forEach(item => {
      if (item.category === 'fire' && (
        item.title?.includes('상반기 종합정밀점검') || item.title?.includes('하반기 작동기능점검')
      )) s.add(item.date)
    })
    return s
  }, [scheduleItems])

  // 승강기 검사일
  const elevInspectDates = useMemo(() => {
    const s = new Set<string>()
    scheduleItems.forEach(item => {
      if (item.category === 'elevator' && item.title?.includes('법정 검사')) s.add(item.date)
    })
    return s
  }, [scheduleItems])

  // 차단일: 팀원 연차 or 소방 점검 or 승강기 검사
  function isBlocked(ymd: string): boolean {
    if ((teamLeaveMap[ymd] ?? []).length > 0) return true
    if (inspectDates.has(ymd)) return true
    if (elevInspectDates.has(ymd)) return true
    return false
  }

  // 셀 우하단 텍스트 생성
  function getCellInfo(cell: any): string {
    const parts: string[] = []
    // 팀원 연차
    ;(cell.teamLeaveList as LeaveItem[]).forEach(tl => {
      const name = (teamNameMap[tl.staffId] ?? '').slice(0, 1) // 성
      const short = LEAVE_LABEL[tl.type] ?? tl.type
      parts.push(`${name}${short}`)
    })
    if (cell.hasInspect) parts.push('소검')
    if (elevInspectDates.has(cell.ymd)) parts.push('승검')
    return parts.join(' ')
  }

  // ── Monthly meal/allowance summary ────────────────────────
  const monthlySummary = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    let totalProvided = 0
    let totalSkipped = 0
    let totalAllowance = 0

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const ymd = localYMD(date)
      const dow = date.getDay()
      const raw = getRawShift(staffId, date)
      const leaveType = myLeaveMap[ymd]?.type
      const provided = calcProvidedMeals(raw, leaveType, dow)
      const skipped = mealMap[ymd] ?? 0
      totalProvided += provided
      totalSkipped += Math.min(skipped, provided)
      totalAllowance += calcWeekendAllowance(raw, dow)
    }

    return {
      totalProvided,
      actualMeals: totalProvided - totalSkipped,
      totalSkipped,
      totalAllowance,
    }
  }, [year, month, staffId, myLeaveMap, mealMap])

  // ── Calendar days ─────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDow = firstDay.getDay()
    const todayYMD = localYMD(today)

    const days: Array<{
      date: Date | null; ymd: string; day: number; dow: number
      isToday: boolean; isHoliday: boolean; holidayName: string; isWeekend: boolean
      rawShift: RawShift; myLeave: LeaveItem | null
      teamLeaveList: LeaveItem[]; skipped: number; provided: number
      hasInspect: boolean
    }> = []

    for (let i = 0; i < startDow; i++) {
      days.push({ date: null, ymd: '', day: 0, dow: -1, isToday: false, isHoliday: false, holidayName: '', isWeekend: false, rawShift: '휴', myLeave: null, teamLeaveList: [], skipped: 0, provided: 0, hasInspect: false })
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d)
      const ymd = localYMD(date)
      const dow = date.getDay()
      const raw = getRawShift(staffId, date)
      const myLeave = myLeaveMap[ymd] ?? null
      const provided = calcProvidedMeals(raw, myLeave?.type, dow)
      days.push({
        date, ymd, day: d, dow,
        isToday: ymd === todayYMD,
        isHoliday: !!holidayMap[ymd],
        holidayName: holidayMap[ymd] ?? '',
        isWeekend: dow === 0 || dow === 6,
        rawShift: raw,
        myLeave,
        teamLeaveList: teamLeaveMap[ymd] ?? [],
        skipped: mealMap[ymd] ?? 0,
        provided,
        hasInspect: inspectDates.has(ymd),
      })
    }
    return days
  }, [year, month, staffId, myLeaveMap, teamLeaveMap, mealMap, inspectDates, today])

  // ── Handlers ──────────────────────────────────────────────
  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelDate(null); setSheetOpen(false)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelDate(null); setSheetOpen(false)
  }

  function handleDayClick(ymd: string) {
    setSelDate(ymd)
    setSheetOpen(true)
    // 달력 클릭 → 휴가기간 자동 입력
    if (isDesktop) {
      // 데스크톱: 첫 클릭=시작일=종료일, 둘째 클릭=종료일 변경
      if (!docStartDate || docStartDate !== docEndDate) {
        setDocStartDate(ymd)
        setDocEndDate(ymd)
      } else {
        if (ymd >= docStartDate) {
          setDocEndDate(ymd)
        } else {
          setDocEndDate(docStartDate)
          setDocStartDate(ymd)
        }
      }
    } else {
      // 모바일: 항상 시작일=종료일=클릭 날짜 (종료일은 date picker로 변경)
      setDocStartDate(ymd)
      setDocEndDate(ymd)
    }
  }

  const selCell = calendarDays.find(c => c.ymd === selDate)
  const selMyLeave = selCell?.myLeave ?? null

  const handleTypeBtn = useCallback(async (type: string) => {
    if (!selDate) return
    const isWeekend = selCell?.isWeekend
    const isHoliday = selCell?.isHoliday
    if (isWeekend || isHoliday) return
    // 이미 등록된 내 연차를 취소하는 게 아니면 차단 체크
    const isCancelling = selMyLeave && selMyLeave.type === type
    if (!isCancelling && isBlocked(selDate)) {
      toast.error('해당 날짜에는 연차 신청이 불가합니다')
      return
    }
    try {
      if (isCancelling) {
        await leaveApi.delete(selMyLeave.id)
        toast.success('취소되었습니다')
      } else {
        if (selMyLeave) await leaveApi.delete(selMyLeave.id)
        await leaveApi.create(selDate, type as any)
        toast.success(`${LEAVE_LABEL[type] ?? type} 등록`)
      }
    } catch (err: any) {
      toast.error(err?.message ?? '오류가 발생했습니다')
      return
    }
    await qc.invalidateQueries({ queryKey: ['leaves'] })
    await qc.invalidateQueries({ queryKey: ['leaves-year'] })
  }, [selDate, selMyLeave, selCell, qc])

  const handleMealCycle = useCallback(async () => {
    if (!selDate || !selCell) return
    const provided = selCell.provided
    if (provided === 0) return
    const current = selCell.skipped
    const next = (current + 1) % (provided + 1)
    try {
      await mealApi.upsert(selDate, next)
      qc.invalidateQueries({ queryKey: ['meals'] })
    } catch (err: any) {
      toast.error(err?.message ?? '오류가 발생했습니다')
    }
  }, [selDate, selCell, qc])

  // ── Team staff name map ───────────────────────────────────
  const teamNameMap = useMemo(() => {
    const m: Record<string, string> = {}
    staffList.forEach(s => { m[s.id] = s.name })
    teamLeaves.forEach(l => {
      if (l.staffName && !m[l.staffId]) m[l.staffId] = l.staffName
    })
    return m
  }, [staffList, teamLeaves])

  // ── 공유 렌더 조각 ─────────────────────────────────────────
  const calendarGrid = (
    <div style={{ padding: '0 8px' }}>
      {/* 연도/월 선택 + 요일 헤더 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', alignItems: 'center', marginBottom: 2, padding: '8px 0 4px' }}>
        <div style={{ gridColumn: '1 / 4', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <button onClick={() => setYear(y => y - 1)} style={{ background: 'var(--bg3)', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '3px 7px', color: 'var(--t2)', fontSize: isDesktop ? 15 : 13, fontWeight: 700 }}>&lsaquo;</button>
          <span style={{ fontSize: isDesktop ? 18 : 15, fontWeight: 800, color: 'var(--t1)', minWidth: 50, textAlign: 'center' }}>{year}년</span>
          <button onClick={() => setYear(y => y + 1)} style={{ background: 'var(--bg3)', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '3px 7px', color: 'var(--t2)', fontSize: isDesktop ? 15 : 13, fontWeight: 700 }}>&rsaquo;</button>
        </div>
        <div />
        <div style={{ gridColumn: '5 / 8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <button onClick={prevMonth} style={{ background: 'var(--bg3)', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '3px 7px', color: 'var(--t2)', fontSize: isDesktop ? 15 : 13, fontWeight: 700 }}>&lsaquo;</button>
          <span style={{ fontSize: isDesktop ? 18 : 15, fontWeight: 800, color: 'var(--t1)', minWidth: 28, textAlign: 'center' }}>{MONTH_NAMES[month]}</span>
          <button onClick={nextMonth} style={{ background: 'var(--bg3)', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '3px 7px', color: 'var(--t2)', fontSize: isDesktop ? 15 : 13, fontWeight: 700 }}>&rsaquo;</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 2 }}>
        {DOW_KO.map((d, i) => (
          <div key={d} style={{ textAlign: 'center', fontSize: isDesktop ? 13 : 10, fontWeight: 700, color: i === 0 ? '#ef4444' : i === 6 ? '#3b82f6' : 'var(--t3)', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {leaveLoading ? (
        <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 24, height: 24, border: '2px solid var(--bd)', borderTopColor: 'var(--acl)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
          <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: isDesktop ? 2 : 3 }}>
          {calendarDays.map((cell, idx) => {
            if (!cell.date) return <div key={`e-${idx}`} style={{ aspectRatio: isDesktop ? '1.2' : '1' }} />

            const { dow, isToday, isHoliday, rawShift, myLeave, skipped, provided } = cell
            const isSel = cell.ymd === selDate
            const lt = myLeave?.type
            const isClickable = rawShift !== '비' && rawShift !== '휴'
            const FULL_LEAVE_TYPES = new Set(['full', 'official_full', 'condolence', 'sick_work', 'sick_personal', 'health', 'other_special'])
            const isFullLeave = lt ? FULL_LEAVE_TYPES.has(lt) : false
            const isHalf = lt === 'half_am' || lt === 'half_pm' || lt === 'official_half_am' || lt === 'official_half_pm'
            const isAm = lt === 'half_am' || lt === 'official_half_am'
            const blocked = isBlocked(cell.ymd)

            const shiftBg = SHIFT_BG[rawShift]
            const leaveBgColor = lt ? LEAVE_BG[lt] : ''
            let cellBg: string
            if (isFullLeave) cellBg = leaveBgColor
            else if (isHalf) cellBg = isAm ? `linear-gradient(135deg, ${leaveBgColor} 50%, ${shiftBg} 50%)` : `linear-gradient(135deg, ${shiftBg} 50%, ${leaveBgColor} 50%)`
            else cellBg = shiftBg

            const dateColor = (dow === 0 || isHoliday) ? '#7f1d1d' : dow === 6 ? '#1e3a5f' : 'var(--t1)'
            const infoText = getCellInfo(cell)

            return (
              <div
                key={cell.ymd}
                onClick={() => isClickable && handleDayClick(cell.ymd)}
                style={{
                  aspectRatio: isDesktop ? '1.2' : '1',
                  borderRadius: 8,
                  background: cellBg,
                  border: isSel ? '2.5px solid #facc15' : isToday ? '2px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.04)',
                  cursor: isClickable ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  position: 'relative',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  padding: 2,
                }}
              >
                {blocked && !myLeave && (
                  <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.25)', borderRadius:8, pointerEvents:'none' }} />
                )}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <span style={{ fontSize: isDesktop ? 10 : 8, fontWeight:800, color: isFullLeave ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.75)', lineHeight:1 }}>
                    {isFullLeave ? (LEAVE_LABEL[lt!] ?? '연차') : isHalf ? (isAm ? '전반' : '후반') : SHIFT_LABEL[rawShift]}
                  </span>
                  <span style={{ fontSize: isDesktop ? 14 : 11, fontWeight:700, color: dateColor, lineHeight:1 }}>
                    {cell.day}
                  </span>
                </div>
                <div style={{ flex:1 }} />
                {(cell.holidayName || infoText) && (
                  <div style={{ fontSize: isDesktop ? 8 : 6, fontWeight:700, color:'rgba(255,255,255,0.85)', lineHeight:1.2, textAlign:'right', wordBreak:'break-all' }}>
                    {cell.holidayName && <div style={{ color:'#fca5a5' }}>{cell.holidayName}</div>}
                    {infoText}
                  </div>
                )}
                {provided > 0 && skipped > 0 && !infoText && !cell.holidayName && (
                  <div style={{ fontSize: isDesktop ? 9 : 7, color:'#fbbf24', fontWeight:800, lineHeight:1, textAlign:'right' }}>
                    미{skipped}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  const legendRow = (
    <div style={{ display: 'flex', gap: isDesktop ? 6 : 8, flexWrap: 'wrap', padding: '6px 12px 0', alignItems: 'center' }}>
      {([
        { label: '당직', bg: 'var(--c-night)' },
        { label: '비번', bg: 'var(--c-off)' },
        { label: '주간', bg: 'var(--c-day)' },
        { label: '휴무', bg: 'var(--c-leave)' },
        { label: '연차', bg: '#22c55e' },
        { label: '공가', bg: '#a855f7' },
        { label: '경조', bg: '#f97316' },
        { label: '병가', bg: '#ef4444' },
        { label: '보건', bg: '#ec4899' },
        { label: '기타', bg: '#6366f1' },
      ]).map(l => (
        <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <span style={{ display: 'inline-block', width: isDesktop ? 10 : 12, height: isDesktop ? 10 : 12, borderRadius: '50%', background: l.bg }} />
          <span style={{ fontSize: isDesktop ? 10 : 10, color: 'var(--t3)' }}>{l.label}</span>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <span style={{ width: isDesktop ? 10 : 12, height: isDesktop ? 10 : 12, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e 50%, var(--c-day) 50%)', display: 'inline-block' }} />
        <span style={{ fontSize: isDesktop ? 10 : 10, color: 'var(--t3)' }}>반차</span>
      </div>
    </div>
  )

  const summaryCards = (
    <div style={{ display: 'flex', gap: 8, padding: '14px 12px 0', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      {[
        { label: '연차', value: `${remaining % 1 === 0 ? remaining : remaining.toFixed(1)}/${quota}일`, color: '#22c55e', bg: 'rgba(34,197,94,0.1)', bd: 'rgba(34,197,94,0.25)' },
        { label: '제공식수', value: `${monthlySummary.actualMeals}끼`, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', bd: 'rgba(6,182,212,0.25)' },
        { label: '미사용식수', value: `${monthlySummary.totalSkipped}끼`, color: '#ec4899', bg: 'rgba(236,72,153,0.1)', bd: 'rgba(236,72,153,0.25)' },
        { label: '주말식대', value: `₩${monthlySummary.totalAllowance.toLocaleString()}`, color: '#f97316', bg: 'rgba(249,115,22,0.1)', bd: 'rgba(249,115,22,0.25)' },
      ].map(c => (
        <div key={c.label} style={{ flex: '1 0 0', minWidth: 72, background: c.bg, border: `1px solid ${c.bd}`, borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: c.color, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{c.value}</div>
        </div>
      ))}
    </div>
  )

  const menuSection = (() => {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
    const h = now.getHours()
    const m = now.getMinutes()
    const hm = h * 60 + m
    const menu = menuData

    if (!menu) return null
    const isLunch = hm >= 480 && hm < 780
    const isDinner = hm >= 780 && hm < 1110
    if (!isLunch && !isDinner) return null

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '8px 12px 0' }}>
        {isLunch && menu.lunch_a && (
          <>
            <div style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#06b6d4', marginBottom: 6 }}>중식 A코너</div>
              <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {menu.lunch_a.split(' / ').join('\n')}
              </div>
            </div>
            {menu.lunch_b && (
              <div style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#ec4899', marginBottom: 6 }}>중식 B코너</div>
                <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {menu.lunch_b.split(' / ').join('\n')}
                </div>
              </div>
            )}
          </>
        )}
        {isDinner && menu.dinner && (
          <div style={{ gridColumn: '1 / 3', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#f97316', marginBottom: 6 }}>석식 메뉴</div>
            <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {menu.dinner.split(' / ').join('\n')}
            </div>
          </div>
        )}
      </div>
    )
  })()

  const detailPanel = selCell?.date ? (
    <div style={{ padding: 16 }}>
      {/* 날짜 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>
          {selCell.date.getMonth() + 1}/{selCell.day} ({DOW_KO[selCell.dow]})
        </span>
        <span style={{
          fontSize: 12, fontWeight: 700, color: '#fff',
          background: SHIFT_COLOR[selCell.rawShift],
          borderRadius: 6, padding: '3px 10px',
        }}>
          {selCell.rawShift === '당' ? '당직근무' : selCell.rawShift === '비' ? '비번' : selCell.rawShift === '주' ? '주간근무' : '휴무'}
        </span>
        {selCell.isHoliday && (
          <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>{selCell.holidayName}</span>
        )}
      </div>

      {/* 식사 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)', marginBottom: 8 }}>
          식사 (제공 {selCell.provided}끼)
        </div>
        {selCell.provided === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--t3)', padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8 }}>
            식사 미제공
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--t2)' }}>미사용:</span>
            <button
              onClick={handleMealCycle}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', borderRadius: 10,
                background: selCell.skipped > 0 ? 'rgba(245,158,11,0.15)' : 'var(--bg3)',
                border: selCell.skipped > 0 ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--bd)',
                cursor: 'pointer', fontSize: 16, fontWeight: 700,
                color: selCell.skipped > 0 ? '#f59e0b' : 'var(--t2)',
              }}
            >
              <span style={{ fontSize: 18 }}>{selCell.skipped}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--t3)' }}>끼</span>
            </button>
            <span style={{ fontSize: 11, color: 'var(--t3)' }}>클릭하여 변경</span>
          </div>
        )}
      </div>

      {/* 팀원 연차 */}
      {selCell.teamLeaveList.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)', marginBottom: 8 }}>팀원 연차</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {selCell.teamLeaveList.map(tl => (
              <span key={tl.id} style={{
                fontSize: 12, fontWeight: 600, color: 'var(--t1)',
                background: 'var(--bg3)', borderRadius: 8, padding: '5px 12px',
                border: '1px solid var(--bd)',
              }}>
                {teamNameMap[tl.staffId] ?? tl.staffId.slice(-4)}
                <span style={{ marginLeft: 4, fontSize: 11, color: tl.type.startsWith('official') ? '#f97316' : '#22c55e', fontWeight: 700 }}>
                  ({LEAVE_LABEL[tl.type] ?? tl.type})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 주말 식대 */}
      {(() => {
        const allow = calcWeekendAllowance(selCell.rawShift, selCell.dow)
        if (allow > 0) return (
          <div style={{ padding: '10px 14px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 8 }}>
            <span style={{ fontSize: 12, color: '#a855f7', fontWeight: 700 }}>주말 식대: ₩{allow.toLocaleString()}</span>
          </div>
        )
        return null
      })()}
    </div>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--t3)', fontSize: 14 }}>
      날짜를 선택하세요
    </div>
  )

  const uploadSection = (
    <div style={{ padding: '14px 12px' }}>
      <label
        ref={dropRef}
        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--acl)' }}
        onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--bd)' }}
        onDrop={e => {
          e.preventDefault()
          e.currentTarget.style.borderColor = 'var(--bd)'
          const file = e.dataTransfer.files[0]
          if (file && file.type === 'application/pdf') {
            const dt = new DataTransfer()
            dt.items.add(file)
            const inp = e.currentTarget.querySelector('input') as HTMLInputElement
            if (inp) { inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true })) }
          } else {
            toast.error('PDF 파일만 업로드 가능합니다')
          }
        }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: isDesktop ? '48px 0' : '12px 0', borderRadius: 12,
          background: 'var(--bg2)',
          border: isDesktop ? '2px dashed var(--bd)' : '1px solid var(--bd)',
          color: 'var(--t2)', fontSize: 12, fontWeight: 600,
          textAlign: 'center', cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
      >
        {isDesktop ? '식단표 PDF 드래그앤드롭 또는 클릭하여 업로드' : '식단표 PDF 업로드'}
        <input type="file" accept=".pdf" style={{ display: 'none' }}
          onChange={handleMenuUpload} />
      </label>
    </div>
  )

  // ── Desktop ──────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
        {/* 헤더 */}
        <div style={{ height: 48, background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', display: 'flex', alignItems: 'center', padding: '0 16px', flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>연차 및 식사 / 휴가신청서</span>
        </div>

        {/* 3분할 본문 */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* 좌측: 달력 + 범례 + 요약 + 메뉴 + 업로드 */}
          <div style={{ flex: 1, minWidth: 0, borderRight: '1px solid var(--bd)', overflowY: 'auto', padding: '0 0 8px' }}>
            {calendarGrid}
            {legendRow}
            {summaryCards}
            <div style={{ borderTop: '1px solid var(--bd)', margin: '4px 12px 0' }} />
            <div style={{ padding: '8px 4px 0' }}>
              {menuSection}
            </div>
            {uploadSection}
          </div>

          {/* 중앙: 휴가신청서 폼 */}
          <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid var(--bd)', overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>휴가신청서</div>

            {/* 선택된 날짜 표시 */}
            {selCell?.date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'var(--bg3)', borderRadius: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
                  {selCell.date.getMonth() + 1}/{selCell.day} ({DOW_KO[selCell.dow]})
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: SHIFT_COLOR[selCell.rawShift], borderRadius: 4, padding: '1px 6px' }}>
                  {selCell.rawShift === '당' ? '당직' : selCell.rawShift === '비' ? '비번' : selCell.rawShift === '주' ? '주간' : '휴무'}
                </span>
              </div>
            )}

            {/* 휴가기간 */}
            <div>
              <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 3 }}>휴가기간 <span style={{ fontSize: 10, color: 'var(--t3)' }}>(달력에서 클릭)</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  type="date"
                  value={docStartDate}
                  onChange={e => setDocStartDate(e.target.value)}
                  style={{
                    flex: 1, padding: '5px 6px', borderRadius: 6,
                    border: '1px solid var(--bd)', background: 'var(--bg)',
                    color: 'var(--t1)', fontSize: 11,
                  }}
                />
                <span style={{ color: 'var(--t3)', fontSize: 11 }}>~</span>
                <input
                  type="date"
                  value={docEndDate}
                  onChange={e => setDocEndDate(e.target.value)}
                  style={{
                    flex: 1, padding: '5px 6px', borderRadius: 6,
                    border: '1px solid var(--bd)', background: 'var(--bg)',
                    color: 'var(--t1)', fontSize: 11,
                  }}
                />
              </div>
              {docDays > 0 && (
                <div style={{ fontSize: 12, color: '#facc15', fontWeight: 700, marginTop: 3 }}>
                  {docDays % 1 === 0 ? docDays : docDays.toFixed(1)}일간
                </div>
              )}
            </div>

            {/* 휴가 종류 버튼 그리드 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {DOC_LEAVE_GRID.map((row, ri) => (
                <div key={ri} style={{ display: 'grid', gridTemplateColumns: row.length === 1 ? '1fr' : 'repeat(3, 1fr)', gap: 4 }}>
                  {row.map(lt => {
                    const active = docLeaveType === lt.type
                    const apiType = DOC_TO_API_TYPE[lt.type]
                    const isRegistered = apiType && selMyLeave?.type === apiType
                    return (
                      <button
                        key={lt.type}
                        onClick={async () => {
                          setDocLeaveType(lt.type)
                          if (!apiType || !docStartDate) return
                          const end = docEndDate || docStartDate
                          const toastId = toast.loading('등록 중...')
                          try {
                            // 범위 내 근무일 목록 수집
                            const workDates: string[] = []
                            const cur = new Date(docStartDate)
                            const endD = new Date(end)
                            while (cur <= endD) {
                              const ymd = localYMD(cur)
                              const dow = cur.getDay()
                              if (dow !== 0 && dow !== 6 && !HOLIDAYS_FALLBACK[ymd]) workDates.push(ymd)
                              cur.setDate(cur.getDate() + 1)
                            }
                            // 전부 같은 타입이면 전체 취소, 아니면 전체 등록
                            const allRegistered = workDates.every(ymd => myLeaveMap[ymd]?.type === apiType)
                            if (allRegistered) {
                              for (const ymd of workDates) {
                                const existing = myLeaveMap[ymd]
                                if (existing) await leaveApi.delete(existing.id)
                              }
                              toast.success(`${workDates.length}일 취소`, { id: toastId })
                            } else {
                              let count = 0
                              for (const ymd of workDates) {
                                const existing = myLeaveMap[ymd]
                                if (existing?.type === apiType) continue // 이미 같은 타입 → 건너뛰기
                                if (existing) await leaveApi.delete(existing.id) // 다른 타입 삭제
                                await leaveApi.create(ymd, apiType as any)
                                count++
                              }
                              toast.success(`${count}일 등록`, { id: toastId })
                            }
                          } catch (err: any) {
                            toast.error(err?.message ?? '오류 발생', { id: toastId })
                          }
                          await qc.invalidateQueries({ queryKey: ['leaves'] })
                          await qc.invalidateQueries({ queryKey: ['leaves-year'] })
                        }}
                        style={{
                          gridColumn: lt.cols ? `span ${lt.cols}` : undefined,
                          padding: '7px 4px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                          cursor: 'pointer', textAlign: 'center',
                          background: isRegistered ? 'rgba(34,197,94,0.25)' : active ? 'var(--ac)' : 'var(--bg3)',
                          color: isRegistered ? '#22c55e' : active ? '#fff' : 'var(--t2)',
                          border: isRegistered ? '2px solid #22c55e' : active ? '1px solid var(--ac)' : '1px solid var(--bd)',
                        }}
                      >
                        {lt.label}{isRegistered ? ' ✓' : ''}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* 사유 입력 (연차 외 전부) */}
            {!ANNUAL_TYPES.has(docLeaveType) && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 3 }}>사유</div>
                <textarea
                  value={docReason}
                  onChange={e => setDocReason(e.target.value)}
                  placeholder="사유를 입력하세요"
                  style={{
                    width: '100%', minHeight: 48, padding: 8, borderRadius: 8,
                    border: '1px solid var(--bd)', background: 'var(--bg)',
                    color: 'var(--t1)', fontSize: 12, resize: 'vertical',
                  }}
                />
              </div>
            )}

            {/* 기타특별휴가 추가 사유 (양식 괄호 안 텍스트) */}
            {docLeaveType === 'other_special' && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 3 }}>기타특별휴가 종류</div>
                <input
                  value={docOtherReason}
                  onChange={e => setDocOtherReason(e.target.value)}
                  placeholder="예: 가족돌봄, 난임치료 등"
                  style={{
                    width: '100%', padding: '6px 8px', borderRadius: 8,
                    border: '1px solid var(--bd)', background: 'var(--bg)',
                    color: 'var(--t1)', fontSize: 12,
                  }}
                />
              </div>
            )}

            {/* 휴대전화번호 */}
            <div>
              <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 3 }}>휴가중 연락처</div>
              <input
                type="tel"
                value={docPhone}
                onChange={e => setDocPhone(e.target.value)}
                placeholder="010-0000-0000"
                style={{
                  width: '100%', padding: '6px 8px', borderRadius: 8,
                  border: '1px solid var(--bd)', background: 'var(--bg)',
                  color: 'var(--t1)', fontSize: 12,
                }}
              />
            </div>

            <div style={{ flex: 1 }} />

            {/* 액션 버튼 */}
            <button
              onClick={handleLeaveDownload}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 8,
                background: 'var(--ac)', color: '#fff', border: 'none',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              엑셀 다운로드
            </button>
            <button
              onClick={() => window.print()}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 8,
                background: 'var(--bg3)', color: 'var(--t2)', border: '1px solid var(--bd)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              인쇄
            </button>
          </div>

          {/* 우측: A4 미리보기 + 캘리브레이션 기반 오버레이 */}
          <div
            ref={leavePreviewRef}
            onClick={leaveCalibClick}
            style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: 'var(--bg2)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16, position: 'relative', cursor: leaveCalibMode ? 'crosshair' : 'default' }}
          >
            <div style={{ position: 'relative', width: '100%', maxWidth: 595 }}>
              {/* 캘리브레이션 버튼 (미리보기 안 상단) */}
              <div style={{ position: 'absolute', top: 4, right: 4, zIndex: 20, display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setLeaveCalibMode(!leaveCalibMode); setLeaveCalibStep(0); setLeaveCalibPoints([]); setLeaveActivePoint(null) }}
                  style={{
                    padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                    background: leaveCalibMode ? '#ef4444' : 'rgba(0,0,0,0.5)', color: '#fff',
                    border: 'none', backdropFilter: 'blur(4px)',
                  }}
                >
                  {leaveCalibMode ? '취소' : '위치 보정'}
                </button>
                {leaveCalibMode && (
                  <>
                    <span style={{ fontSize: 10, color: '#fff', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                      [{leaveCalibStep + 1}/{LEAVE_CALIB_STEPS.length}] {LEAVE_CALIB_STEPS[leaveCalibStep].label}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); leaveCalibConfirm() }} disabled={!leaveActivePoint}
                      style={{ padding: '3px 12px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', background: leaveActivePoint ? '#22c55e' : 'rgba(0,0,0,0.3)', color: '#fff', border: 'none' }}>
                      확인
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); leaveCalibSkip() }}
                      style={{ padding: '3px 12px', borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: 'pointer', background: 'rgba(0,0,0,0.3)', color: '#fff', border: 'none' }}>
                      건너뛰기
                    </button>
                  </>
                )}
              </div>
              <img
                src="/templates/leave_request_preview.png"
                alt="휴가신청서 미리보기"
                onLoad={measureLeaveImg}
                style={{ width: '100%', display: 'block', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />

              {/* 캘리브 모드: 활성 마커 + 기존 마커 */}
              {leaveCalibMode && (
                <>
                  {leaveActivePoint && (
                    <div style={{ position: 'absolute', left: `${leaveActivePoint.x}%`, top: `${leaveActivePoint.y}%`, transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 10 }}>
                      <div style={{ position: 'absolute', left: -15, top: 0, width: 30, height: 2, background: LEAVE_CALIB_STEPS[leaveCalibStep].color, opacity: 0.8 }} />
                      <div style={{ position: 'absolute', top: -15, left: 0, width: 2, height: 30, background: LEAVE_CALIB_STEPS[leaveCalibStep].color, opacity: 0.8 }} />
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: LEAVE_CALIB_STEPS[leaveCalibStep].color, border: '2px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.4)', transform: 'translate(-50%, -50%)', position: 'absolute' }} />
                    </div>
                  )}
                  {leaveCalibPoints.map((pt, i) => pt && (
                    <div key={i} style={{ position: 'absolute', left: `${pt.x}%`, top: `${pt.y}%`, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: LEAVE_CALIB_STEPS[i].color, border: '1px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)', transform: 'translate(-50%, -50%)', position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#fff', fontWeight: 900 }}>
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* 값 오버레이 (캘리브 모드가 아닐 때) */}
              {!leaveCalibMode && (() => {
                const sid = staff?.id ?? ''
                const hp = sid.length >= 8 ? [sid.slice(0,4), sid.slice(4,6), sid.slice(6,8)] : null
                const sp = docStartDate ? docStartDate.split('-') : null
                const ep = docEndDate ? docEndDate.split('-') : null
                const ovAt = (p: { x: number; y: number } | undefined, text: string, extra?: React.CSSProperties) =>
                  p ? <span key={`${p.x}-${p.y}-${text}`} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)', fontSize: 10, fontWeight: 700, color: '#111', whiteSpace: 'nowrap', fontFamily: "'Noto Sans KR', sans-serif", ...extra }}>{text}</span> : null

                // 입사일: 0=yy, 1=dd → mm 보간
                const hireMm = lp[0] && lp[1] ? { x: lp[0].x + (lp[1].x - lp[0].x) * 0.5, y: lp[0].y } : undefined
                // 기간시작: 3=yy, 4=dd → mm 보간
                const startMm = lp[3] && lp[4] ? { x: lp[3].x + (lp[4].x - lp[3].x) * 0.5, y: lp[3].y } : undefined
                // 기간종료: 5=yy, 6=dd → mm 보간
                const endMm = lp[5] && lp[6] ? { x: lp[5].x + (lp[6].x - lp[5].x) * 0.5, y: lp[5].y } : undefined

                // 체크박스: 8=연차, 9=병가사상 → 경조/병가공상 보간, 10=보건, 11=기타특별 → 공가 보간
                // 8=연차, 9=경조, 10=병가공상, 11=병가사상, 12=보건, 13=공가, 14=기타특별
                const checkMap: Record<string, { x: number; y: number } | undefined> = {
                  annual: lp[8], half_am: lp[8], half_pm: lp[8],
                  condolence: lp[9],
                  sick_work: lp[10],
                  sick_personal: lp[11],
                  health: lp[12],
                  official: lp[13], official_half_am: lp[13], official_half_pm: lp[13],
                  other_special: lp[14],
                }
                const cp = checkMap[docLeaveType]

                return (
                  <>
                    {hp && <>
                      {ovAt(lp[0], hp[0].slice(2))}
                      {ovAt(hireMm, String(parseInt(hp[1])))}
                      {ovAt(lp[1], String(parseInt(hp[2])))}
                    </>}
                    {staff && ovAt(lp[2], staff.name)}
                    {sp && <>
                      {ovAt(lp[3], sp[0].slice(2))}
                      {ovAt(startMm, String(parseInt(sp[1])))}
                      {ovAt(lp[4], String(parseInt(sp[2])))}
                    </>}
                    {ep && <>
                      {ovAt(lp[5], ep[0].slice(2))}
                      {ovAt(endMm, String(parseInt(ep[1])))}
                      {ovAt(lp[6], String(parseInt(ep[2])))}
                    </>}
                    {docDays > 0 && ovAt(lp[7], docDays % 1 === 0 ? String(docDays) : docDays.toFixed(1))}
                    {cp && <div style={{ position: 'absolute', left: `${cp.x}%`, top: `${cp.y}%`, transform: 'translate(-50%, -50%)', width: 12, height: 12, background: '#000' }} />}
                    {docLeaveType === 'other_special' && docOtherReason && ovAt(lp[15], docOtherReason)}
                    {docPhone && ovAt(lp[16], docPhone)}
                    {docDays > 0 && ovAt(lp[17], docDays % 1 === 0 ? String(docDays) : docDays.toFixed(1))}
                    {!ANNUAL_TYPES.has(docLeaveType) && docReason && ovAt(lp[18], docReason)}
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Mobile ───────────────────────────────────────────────
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)', position: 'relative' }}>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 20px' }}>
        {calendarGrid}
        {legendRow}
        {summaryCards}
        {menuSection}
        {uploadSection}
      </div>

      {/* Bottom Sheet Overlay */}
      {sheetOpen && selCell?.date && (
        <>
          <div
            onClick={() => { setSheetOpen(false); setSelDate(null) }}
            style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 90,
              animation: 'fadeIn .2s ease',
            }}
          />
          <style>{`
            @keyframes fadeIn{from{opacity:0}to{opacity:1}}
            @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
          `}</style>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100,
            background: 'var(--bg2)', borderTopLeftRadius: 20, borderTopRightRadius: 20,
            padding: '16px 16px 24px', maxHeight: '65vh', overflowY: 'auto',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.2)',
            animation: 'slideUp .25s ease',
          }}>
            {/* Handle bar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--bd)' }} />
            </div>

            {/* Sheet header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>
                {selCell.date.getMonth() + 1}/{selCell.day} ({DOW_KO[selCell.dow]})
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, color: '#fff',
                background: SHIFT_COLOR[selCell.rawShift],
                borderRadius: 6, padding: '2px 8px',
              }}>
                {selCell.rawShift === '당' ? '당직근무' : selCell.rawShift === '비' ? '비번' : selCell.rawShift === '주' ? '주간근무' : '휴무'}
              </span>
              {selCell.isHoliday && (
                <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 600 }}>{selCell.holidayName}</span>
              )}
            </div>

            {/* Leave section */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 8 }}>휴가</div>
              {(selCell.isWeekend || selCell.isHoliday) ? (
                <div style={{ fontSize: 11, color: 'var(--t3)', padding: '8px 12px', background: 'var(--bg3)', borderRadius: 8 }}>
                  {selCell.isHoliday ? `공휴일(${selCell.holidayName})` : '주말'}은 휴가 등록이 불가합니다
                </div>
              ) : (
                <>
                  {selCell.hasInspect && (
                    <div style={{ fontSize: 11, color: '#f59e0b', marginBottom: 6, padding: '4px 8px', background: 'rgba(245,158,11,0.1)', borderRadius: 6 }}>
                      소방 점검일 - 휴가 등록 주의
                    </div>
                  )}

                  {/* 기간 선택 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto', gap: 4, alignItems: 'end', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 2 }}>시작일</div>
                      <input type="date" value={docStartDate} readOnly
                        style={{ display: 'block', width: '100%', padding: '6px 2px', borderRadius: 6, border: '1px solid var(--bd)', background: 'var(--bg)', color: 'var(--t1)', fontSize: 12, boxSizing: 'border-box', WebkitAppearance: 'none', MozAppearance: 'none' } as any} />
                    </div>
                    <span style={{ color: 'var(--t3)', fontSize: 11, paddingBottom: 8 }}>~</span>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 2 }}>종료일</div>
                      <input type="date" value={docEndDate} onChange={e => { if (e.target.value >= docStartDate) setDocEndDate(e.target.value) }}
                        style={{ display: 'block', width: '100%', padding: '6px 2px', borderRadius: 6, border: '1px solid var(--bd)', background: 'var(--bg)', color: 'var(--t1)', fontSize: 12, boxSizing: 'border-box', WebkitAppearance: 'none', MozAppearance: 'none' } as any} />
                    </div>
                    {docDays > 0 ? (
                      <span style={{ fontSize: 13, color: '#facc15', fontWeight: 700, paddingBottom: 6, whiteSpace: 'nowrap' }}>
                        {docDays % 1 === 0 ? docDays : docDays.toFixed(1)}일
                      </span>
                    ) : <span />}
                  </div>

                  {/* 주요 버튼: 연차/반차/공가 (2행 3열) */}
                  {(() => {
                    const MOBILE_BTNS = [
                      [
                        { type: 'annual', label: '연차', api: 'full' },
                        { type: 'half_am', label: '오전반차', api: 'half_am' },
                        { type: 'half_pm', label: '오후반차', api: 'half_pm' },
                      ],
                      [
                        { type: 'official', label: '공가', api: 'official_full' },
                        { type: 'official_half_am', label: '오전공가', api: 'official_half_am' },
                        { type: 'official_half_pm', label: '오후공가', api: 'official_half_pm' },
                      ],
                    ]
                    const registerRange = async (apiType: string, label: string, docType: string) => {
                      if (!docStartDate) return
                      setDocLeaveType(docType)
                      const end = docEndDate || docStartDate
                      const toastId = toast.loading('등록 중...')
                      try {
                        const workDates: string[] = []
                        const cur = new Date(docStartDate); const endD = new Date(end)
                        while (cur <= endD) {
                          const ymd = localYMD(cur); const dow = cur.getDay()
                          if (dow !== 0 && dow !== 6 && !HOLIDAYS_FALLBACK[ymd]) workDates.push(ymd)
                          cur.setDate(cur.getDate() + 1)
                        }
                        const allReg = workDates.every(ymd => myLeaveMap[ymd]?.type === apiType)
                        if (allReg) {
                          for (const ymd of workDates) { const ex = myLeaveMap[ymd]; if (ex) await leaveApi.delete(ex.id) }
                          toast.success(`${workDates.length}일 취소`, { id: toastId })
                        } else {
                          let cnt = 0
                          for (const ymd of workDates) {
                            const ex = myLeaveMap[ymd]
                            if (ex?.type === apiType) continue
                            if (ex) await leaveApi.delete(ex.id)
                            await leaveApi.create(ymd, apiType as any); cnt++
                          }
                          toast.success(`${cnt}일 ${label} 등록`, { id: toastId })
                        }
                      } catch (err: any) { toast.error(err?.message ?? '오류', { id: toastId }) }
                      await qc.invalidateQueries({ queryKey: ['leaves'] })
                      await qc.invalidateQueries({ queryKey: ['leaves-year'] })
                    }
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                        {MOBILE_BTNS.map((row, ri) => (
                          <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                            {row.map(b => {
                              const isReg = selMyLeave?.type === b.api
                              return (
                                <button key={b.type} onClick={() => registerRange(b.api, b.label, b.type)}
                                  style={{
                                    padding: '8px 2px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'center',
                                    background: isReg ? 'rgba(34,197,94,0.25)' : 'var(--bg3)',
                                    color: isReg ? '#22c55e' : 'var(--t2)',
                                    border: isReg ? '2px solid #22c55e' : '1px solid var(--bd)',
                                  }}>
                                  {b.label}{isReg ? ' ✓' : ''}
                                </button>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    )
                  })()}

                  {/* 기타 휴가종류 (셀렉트) */}
                  {(() => {
                    const OTHER_TYPES = [
                      { type: 'condolence', label: '경조휴가', api: 'condolence' },
                      { type: 'sick_work', label: '병가(공상)', api: 'sick_work' },
                      { type: 'sick_personal', label: '병가(사상)', api: 'sick_personal' },
                      { type: 'health', label: '보건휴가', api: 'health' },
                      { type: 'other_special', label: '기타특별휴가', api: 'other_special' },
                    ]
                    const registerOther = async () => {
                      if (!mobileOtherType || !docStartDate) return
                      const end = docEndDate || docStartDate
                      const toastId = toast.loading('등록 중...')
                      try {
                        const workDates: string[] = []
                        const cur = new Date(docStartDate); const endD = new Date(end)
                        while (cur <= endD) {
                          const ymd = localYMD(cur); const dow = cur.getDay()
                          if (dow !== 0 && dow !== 6 && !HOLIDAYS_FALLBACK[ymd]) workDates.push(ymd)
                          cur.setDate(cur.getDate() + 1)
                        }
                        const allReg = workDates.every(ymd => myLeaveMap[ymd]?.type === mobileOtherType)
                        if (allReg) {
                          for (const ymd of workDates) { const ex = myLeaveMap[ymd]; if (ex) await leaveApi.delete(ex.id) }
                          toast.success(`${workDates.length}일 취소`, { id: toastId })
                        } else {
                          let cnt = 0
                          for (const ymd of workDates) {
                            const ex = myLeaveMap[ymd]
                            if (ex?.type === mobileOtherType) continue
                            if (ex) await leaveApi.delete(ex.id)
                            await leaveApi.create(ymd, mobileOtherType as any); cnt++
                          }
                          const lbl = OTHER_TYPES.find(o => o.api === mobileOtherType)?.label ?? ''
                          toast.success(`${cnt}일 ${lbl} 등록`, { id: toastId })
                        }
                      } catch (err: any) { toast.error(err?.message ?? '오류', { id: toastId }) }
                      await qc.invalidateQueries({ queryKey: ['leaves'] })
                      await qc.invalidateQueries({ queryKey: ['leaves-year'] })
                    }
                    const needsReason = ['official_full', 'official_half_am', 'official_half_pm'].includes(selMyLeave?.type ?? '') || !!mobileOtherType
                    return (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <select value={mobileOtherType} onChange={e => { setMobileOtherType(e.target.value); if (e.target.value) setDocLeaveType(e.target.value) }}
                            style={{ flex: 1, height: 34, borderRadius: 6, border: '1px solid var(--bd)', background: 'var(--bg)', color: 'var(--t1)', fontSize: 11, padding: '0 8px' }}>
                            <option value="">기타 휴가 선택...</option>
                            {OTHER_TYPES.map(o => <option key={o.api} value={o.api}>{o.label}</option>)}
                          </select>
                          {mobileOtherType && (
                            <button onClick={registerOther}
                              style={{ height: 34, padding: '0 14px', borderRadius: 6, background: 'var(--ac)', color: '#fff', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              등록
                            </button>
                          )}
                        </div>
                        {needsReason && (
                          <input value={mobileReason} onChange={e => setMobileReason(e.target.value)} placeholder="사유 입력"
                            style={{ width: '100%', marginTop: 6, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--bd)', background: 'var(--bg)', color: 'var(--t1)', fontSize: 11, boxSizing: 'border-box' }} />
                        )}
                      </div>
                    )
                  })()}

                  {/* 엑셀 다운로드 */}
                  <button onClick={handleLeaveDownload}
                    style={{ width: '100%', marginTop: 4, padding: '10px 0', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    휴가신청서 다운로드
                  </button>
                </>
              )}
            </div>

            {/* Meal section */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 8 }}>
                식사 (제공 {selCell.provided}끼)
              </div>
              {selCell.provided === 0 ? (
                <div style={{ fontSize: 11, color: 'var(--t3)', padding: '8px 12px', background: 'var(--bg3)', borderRadius: 8 }}>
                  식사 미제공
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--t2)' }}>미사용:</span>
                  <button
                    onClick={handleMealCycle}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 10,
                      background: selCell.skipped > 0 ? 'rgba(245,158,11,0.15)' : 'var(--bg3)',
                      border: selCell.skipped > 0 ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--bd)',
                      cursor: 'pointer', fontSize: 14, fontWeight: 700,
                      color: selCell.skipped > 0 ? '#f59e0b' : 'var(--t2)',
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{selCell.skipped}</span>
                    <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--t3)' }}>끼</span>
                  </button>
                  <span style={{ fontSize: 10, color: 'var(--t3)' }}>탭하여 변경</span>
                </div>
              )}
            </div>

            {/* Team leave */}
            {selCell.teamLeaveList.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 8 }}>팀원 연차</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selCell.teamLeaveList.map(tl => (
                    <span key={tl.id} style={{
                      fontSize: 11, fontWeight: 600, color: 'var(--t1)',
                      background: 'var(--bg3)', borderRadius: 8, padding: '4px 10px',
                      border: '1px solid var(--bd)',
                    }}>
                      {teamNameMap[tl.staffId] ?? tl.staffId.slice(-4)}
                      <span style={{ marginLeft: 4, fontSize: 10, color: tl.type.startsWith('official') ? '#f97316' : '#22c55e', fontWeight: 700 }}>
                        ({LEAVE_LABEL[tl.type] ?? tl.type})
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Weekend allowance info */}
            {(() => {
              const allow = calcWeekendAllowance(selCell.rawShift, selCell.dow)
              if (allow > 0) return (
                <div style={{ marginBottom: 16, padding: '8px 12px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 8 }}>
                  <span style={{ fontSize: 11, color: '#a855f7', fontWeight: 700 }}>주말 식대: ₩{allow.toLocaleString()}</span>
                </div>
              )
              return null
            })()}

            {/* Close button */}
            <button
              onClick={() => { setSheetOpen(false); setSelDate(null) }}
              style={{
                width: '100%', padding: '12px', borderRadius: 12,
                background: 'var(--bg3)', border: '1px solid var(--bd)',
                fontSize: 14, fontWeight: 700, color: 'var(--t2)',
                cursor: 'pointer',
              }}
            >
              닫기
            </button>
          </div>
        </>
      )}
    </div>
  )
}
