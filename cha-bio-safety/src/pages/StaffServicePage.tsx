import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { leaveApi, scheduleApi, mealApi, menuApi, holidayApi, type LeaveItem } from '../utils/api'
import { useAuthStore } from '../stores/authStore'
import { useStaffList } from '../hooks/useStaffList'
import { getRawShift, SHIFT_COLOR, DOW_KO, type RawShift } from '../utils/shiftCalc'
import { calcProvidedMeals, calcWeekendAllowance } from '../utils/mealCalc'
import { HOLIDAYS_FALLBACK } from '../utils/holidays'
import * as pdfjsLib from 'pdfjs-dist'
import { generateLeaveRequest, printLeaveRequest } from '../utils/generateLeaveRequest'
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

/** 전날의 로컬 YMD (월/연 경계 안전) */
function prevYMD(date: Date): string {
  const p = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1)
  return localYMD(p)
}

const SHIFT_LABEL: Record<RawShift, string> = { '당': '당', '비': '비', '주': '주', '휴': '휴' }
const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

// 카테고리 색 — 정규화 hex (W2 결정)
const LEAVE_TYPES = [
  { type: 'full', label: '연차', rgb: '66, 215, 120' },
  { type: 'half_am', label: '오전반차', rgb: '66, 215, 120' },
  { type: 'half_pm', label: '오후반차', rgb: '66, 215, 120' },
  { type: 'official_full', label: '공가', rgb: '143, 66, 215' },
  { type: 'official_half_am', label: '공가오전', rgb: '143, 66, 215' },
  { type: 'official_half_pm', label: '공가오후', rgb: '143, 66, 215' },
] as const

// 셀 배경색 — duty 토큰 (alias 0건)
const SHIFT_BG: Record<RawShift, string> = {
  '당': 'var(--duty-night)',
  '비': 'var(--duty-off)',
  '주': 'var(--duty-day)',
  '휴': 'var(--duty-leave)',
}
const LEAVE_BG: Record<string, string> = {
  full: '#42d778',
  half_am: '#42d778',
  half_pm: '#42d778',
  official_full: '#8f42d7',
  official_half_am: '#8f42d7',
  official_half_pm: '#8f42d7',
  condolence: '#d78042',
  sick_work: '#d74242',
  sick_personal: '#d74242',
  health: '#d7428c',
  other_special: '#4244d7',
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
  const [docStartDate, setDocStartDate] = useState<string>('')
  const [docEndDate, setDocEndDate] = useState<string>('')
  const [docOtherReason, setDocOtherReason] = useState<string>('')
  const [docReason, setDocReason] = useState<string>('')  // 연차 외 사유
  const [mobileOtherType, setMobileOtherType] = useState('')  // 모바일 기타 휴가
  const [mobileReason, setMobileReason] = useState('')  // 모바일 사유

  // ── 휴가신청서 미리보기 좌표 (PDF 좌표를 % 로 변환, generateLeaveRequest.ts 와 일치) ─
  // 인덱스: 0=입사일, 1=생년월일, 2=성명, 3=기간시작, 4=기간종료, 5=기간일수,
  //         6~12=체크박스 (연차/경조/병가공상/병가사상/보건/공가/기타특별),
  //         13=기타특별사유, 14=연락처, 15=신청일수, 16=사유기타사항
  // ty(N) = baseline at top-down y=N. 시각적 중앙은 baseline - fontSize×0.25.
  const lp: Record<number, { x: number; y: number }> = {
    0:  { x: 80.34, y: 27.79 },  // 입사일       (cx=478, ty=237, sz=13)
    1:  { x: 80.34, y: 32.07 },  // 생년월일     (cx=478, ty=273, sz=13)
    2:  { x: 43.70, y: 31.81 },  // 성명         (cx=260, ty=271, sz=14)
    3:  { x: 38.99, y: 37.66 },  // 기간시작     (cx=232, ty=320, sz=13)
    4:  { x: 57.82, y: 37.66 },  // 기간종료     (cx=344, ty=320, sz=13)
    5:  { x: 69.75, y: 37.66 },  // 기간 일수    (cx=415, ty=320, sz=13)
    6:  { x: 23.44, y: 44.20 },  // 체크 연차      (box center 139.45, 371.7)
    7:  { x: 40.75, y: 43.88 },  // 체크 경조      (box center 242.45, 369.0)
    8:  { x: 56.60, y: 43.88 },  // 체크 병가공상  (box center 336.75, 369.0)
    9:  { x: 77.32, y: 43.88 },  // 체크 병가사상  (box center 460.05, 369.0)
    10: { x: 23.49, y: 48.79 },  // 체크 보건      (box center 139.75, 410.3)
    11: { x: 40.75, y: 48.79 },  // 체크 공가      (box center 242.45, 410.3)
    12: { x: 56.60, y: 48.79 },  // 체크 기타특별  (box center 336.75, 410.3)
    13: { x: 76.47, y: 48.78 },  // 기타특별 사유 (cx=455, ty=413, sz=11)
    14: { x: 55.29, y: 60.83 },  // 연락처       (cx=329.0, ty=514.8, sz=13)
    15: { x: 62.86, y: 69.77 },  // 신청일수     (cx=374, ty=590, sz=13)
    16: { x: 55.38, y: 74.79 },  // 기타사항     (cx=329.5, ty=632, sz=12)
  }

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

  const buildLeaveData = useCallback(() => {
    if (!staff || !docStartDate || !docEndDate) return null
    const excelTypeMap: Record<string, string> = {
      half_am: 'annual', half_pm: 'annual',
      official_half_am: 'official', official_half_pm: 'official',
    }
    const excelType = excelTypeMap[docLeaveType] ?? docLeaveType
    return {
      staffName: staff.name,
      staffId: staff.id,
      hireDate: `${staff.id.slice(0,4)}-${staff.id.slice(4,6)}-${staff.id.slice(6,8)}`,
      birthDate: staffFull?.birthDate ?? undefined,
      phone: staffFull?.phone ?? '',
      leaveType: excelType,
      otherReason: docOtherReason,
      reason: docReason,
      startDate: docStartDate,
      endDate: docEndDate,
      totalDays: docDays,
      workDays: docDays,
    }
  }, [staff, docStartDate, docEndDate, staffFull?.phone, staffFull?.birthDate, docLeaveType, docOtherReason, docReason, docDays])

  const handleLeaveDownload = useCallback(async () => {
    const data = buildLeaveData()
    if (!data) { toast.error('기간을 입력하세요'); return }
    const toastId = toast.loading('휴가신청서 생성 중...')
    try {
      await generateLeaveRequest(data)
      toast.success('휴가신청서 다운로드 완료', { id: toastId })
    } catch (err: any) {
      toast.error(err?.message ?? '생성 실패', { id: toastId })
    }
  }, [buildLeaveData])

  const handleLeavePrint = useCallback(async () => {
    const data = buildLeaveData()
    if (!data) { toast.error('기간을 입력하세요'); return }
    const toastId = toast.loading('인쇄 준비 중...')
    try {
      await printLeaveRequest(data)
      toast.success('새 탭에서 인쇄 다이얼로그가 열립니다', { id: toastId })
    } catch (err: any) {
      toast.error(err?.message ?? '인쇄 실패', { id: toastId })
    }
  }, [buildLeaveData])

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
      // 공휴일은 식당 미운영 → 추출 단계에서 스킵 (PDF 컬럼이 비어있어도 인접 컬럼 텍스트가
      // x-range 어긋남으로 새어들어오는 케이스 방지)
      const menus = colRanges
        .filter(col => !holidayMap[col.ymd])
        .map(col => ({
          date: col.ymd,
          lunch_a: collectTexts(col.xMin, col.xMax, lunchTopY ?? lunchAY, lunchBTopY ?? lunchBY),
          lunch_b: collectTexts(col.xMin, col.xMax, lunchBTopY ?? lunchBY, plusY ?? dinnerY!),
          dinner: collectTexts(col.xMin, col.xMax, dinnerY!, dinnerSaladY ?? snackY ?? dinnerY! - 200),
        }))
        // 모두 비어있으면 저장 안 함 — PDF 에 해당 날짜 컬럼이 있어도 메뉴가 없는 경우 차단
        .filter(m => m.lunch_a || m.lunch_b || m.dinner)

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
  }, [qc, holidayMap])

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
      const isHoliday = !!holidayMap[ymd]
      const isPrevDayHoliday = !!holidayMap[prevYMD(date)]
      const provided = calcProvidedMeals(raw, leaveType, dow, isHoliday, isPrevDayHoliday)
      const skipped = mealMap[ymd] ?? 0
      totalProvided += provided
      totalSkipped += Math.min(skipped, provided)
      totalAllowance += calcWeekendAllowance(raw, dow, isHoliday, isPrevDayHoliday)
    }

    return {
      totalProvided,
      actualMeals: totalProvided - totalSkipped,
      totalSkipped,
      totalAllowance,
    }
  }, [year, month, staffId, myLeaveMap, mealMap, holidayMap])

  // ── Calendar days ─────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDow = firstDay.getDay()
    const todayYMD = localYMD(today)

    const days: Array<{
      date: Date | null; ymd: string; day: number; dow: number
      isToday: boolean; isHoliday: boolean; isPrevDayHoliday: boolean; holidayName: string; isWeekend: boolean
      rawShift: RawShift; myLeave: LeaveItem | null
      teamLeaveList: LeaveItem[]; skipped: number; provided: number
      hasInspect: boolean
    }> = []

    for (let i = 0; i < startDow; i++) {
      days.push({ date: null, ymd: '', day: 0, dow: -1, isToday: false, isHoliday: false, isPrevDayHoliday: false, holidayName: '', isWeekend: false, rawShift: '휴', myLeave: null, teamLeaveList: [], skipped: 0, provided: 0, hasInspect: false })
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d)
      const ymd = localYMD(date)
      const dow = date.getDay()
      const raw = getRawShift(staffId, date)
      const myLeave = myLeaveMap[ymd] ?? null
      const isHoliday = !!holidayMap[ymd]
      const isPrevDayHoliday = !!holidayMap[prevYMD(date)]
      const provided = calcProvidedMeals(raw, myLeave?.type, dow, isHoliday, isPrevDayHoliday)
      days.push({
        date, ymd, day: d, dow,
        isToday: ymd === todayYMD,
        isHoliday,
        isPrevDayHoliday,
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
  }, [year, month, staffId, myLeaveMap, teamLeaveMap, mealMap, inspectDates, today, holidayMap])

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

    // 해당 날짜에 기존 휴가가 있으면 docLeaveType + docReason 자동 설정
    const cell = calendarDays.find(c => c.ymd === ymd)
    if (cell?.myLeave) {
      setDocLeaveType(API_TO_DOC_TYPE[cell.myLeave.type] ?? cell.myLeave.type)
      setDocReason(cell.myLeave.reason ?? '')
    }

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

  // 연차 잔여 임계치 분기 — W3 §6.3: 색바만 status 토큰, value 색은 임계치 시에만 status (그 외 text-primary)
  const remainingThreshold = remaining < 1 ? 'danger' : remaining < 3 ? 'warning' : 'normal'

  // 달력 셀 안 holidayName 단축 — 4자 초과 시 단축 (대체공휴일 prefix → "대체일")
  const shortHoliday = (name?: string | null): string => {
    if (!name) return ''
    if (name.startsWith('대체공휴일')) return '대체일'
    return name.length > 4 ? name.slice(0, 3) + '…' : name
  }

  // ── 공유 렌더 조각 ─────────────────────────────────────────
  const calendarGrid = (
    <div className="px-2">
      {/* 연도/월 선택 + 요일 헤더 */}
      <div className="grid grid-cols-7 items-center mb-0.5 pt-2 pb-1">
        <div className="col-start-1 col-end-4 flex items-center justify-center gap-1">
          <button onClick={() => setYear(y => y - 1)} className="bg-surface-sunken border-0 cursor-pointer rounded-sm px-2 py-0.5 text-text-secondary text-label font-bold leading-none">&lsaquo;</button>
          <span className="text-title font-extrabold text-text-primary min-w-[50px] text-center leading-none">{year}년</span>
          <button onClick={() => setYear(y => y + 1)} className="bg-surface-sunken border-0 cursor-pointer rounded-sm px-2 py-0.5 text-text-secondary text-label font-bold leading-none">&rsaquo;</button>
        </div>
        <div />
        <div className="col-start-5 col-end-8 flex items-center justify-center gap-1">
          <button onClick={prevMonth} className="bg-surface-sunken border-0 cursor-pointer rounded-sm px-2 py-0.5 text-text-secondary text-label font-bold leading-none">&lsaquo;</button>
          <span className="text-title font-extrabold text-text-primary min-w-[28px] text-center leading-none">{MONTH_NAMES[month]}</span>
          <button onClick={nextMonth} className="bg-surface-sunken border-0 cursor-pointer rounded-sm px-2 py-0.5 text-text-secondary text-label font-bold leading-none">&rsaquo;</button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-0.5">
        {DOW_KO.map((d, i) => (
          <div
            key={d}
            className={`text-center text-caption font-bold py-1 leading-none ${i === 0 ? 'text-danger' : i === 6 ? 'text-info' : 'text-text-tertiary'}`}
          >
            {d}
          </div>
        ))}
      </div>

      {leaveLoading ? (
        <div className="py-10 flex justify-center">
          <div className="w-6 h-6 border-2 border-border-default rounded-full" style={{ borderTopColor: 'var(--accent)', animation: 'spin .7s linear infinite' }} />
          <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
        </div>
      ) : (
        <div className={`grid grid-cols-7 ${isDesktop ? 'gap-[2px]' : 'gap-[3px]'}`}>
          {calendarDays.map((cell, idx) => {
            if (!cell.date) return <div key={`e-${idx}`} className={isDesktop ? 'aspect-[1.2]' : 'aspect-[5/6]'} />

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

            const dateColor = (dow === 0 || isHoliday) ? '#7f1d1d' : dow === 6 ? '#1e3a5f' : 'var(--text-primary)'
            const infoText = getCellInfo(cell)

            return (
              <div
                key={cell.ymd}
                onClick={() => isClickable && handleDayClick(cell.ymd)}
                className={`relative flex flex-col overflow-hidden select-none p-0.5 rounded-sm ${isDesktop ? 'aspect-[1.2]' : 'aspect-[5/6]'} ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                style={{
                  background: cellBg,
                  border: isSel ? '2.5px solid #facc15' : isToday ? '2.5px solid #3b82f6' : '1px solid rgba(255,255,255,0.04)',
                  boxShadow: isToday && !isSel ? '0 0 0 2px rgba(59,130,246,0.35)' : undefined,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {blocked && !myLeave && (
                  <div className="absolute inset-0 rounded-sm pointer-events-none" style={{ background: 'rgba(0,0,0,0.25)' }} />
                )}
                {isToday && (
                  <div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm pointer-events-none z-[1] text-caption font-extrabold text-text-on-accent leading-none flex items-center justify-center whitespace-nowrap ${isDesktop ? 'px-2.5 py-0.5' : 'w-5 h-5'}`}
                    style={{
                      background: 'var(--accent)',
                      letterSpacing: '-.02em',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
                    }}
                  >
                    오늘
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <span
                    className="text-caption font-extrabold leading-none"
                    style={{ color: isFullLeave ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.75)' }}
                  >
                    {isFullLeave ? (LEAVE_LABEL[lt!] ?? '연차') : isHalf ? (isAm ? '전반' : '후반') : SHIFT_LABEL[rawShift]}
                  </span>
                  <span
                    className="text-caption font-bold leading-none"
                    style={{ color: dateColor }}
                  >
                    {cell.day}
                  </span>
                </div>
                <div className="flex-1" />
                {(cell.holidayName || infoText) && (
                  <div className="text-caption font-bold text-right leading-tight overflow-hidden" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    {cell.holidayName && <div className="truncate" style={{ color: '#fca5a5' }}>{shortHoliday(cell.holidayName)}</div>}
                    {infoText && <div className="truncate">{infoText}</div>}
                  </div>
                )}
                {provided > 0 && skipped > 0 && !infoText && !cell.holidayName && (
                  <div className="text-caption font-extrabold leading-none text-right" style={{ color: '#fbbf24' }}>
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

  const dotSize = isDesktop ? 'w-2.5 h-2.5' : 'w-3 h-3'
  const legendRow = (
    <div className={`flex flex-wrap items-center px-3 pt-1.5 ${isDesktop ? 'gap-1.5' : 'gap-2'}`}>
      <div className="flex items-center gap-0.5">
        <span className={`inline-block rounded-full bg-duty-night ${dotSize}`} />
        <span className="text-caption text-text-tertiary leading-none">당직</span>
      </div>
      <div className="flex items-center gap-0.5">
        <span className={`inline-block rounded-full bg-duty-off ${dotSize}`} />
        <span className="text-caption text-text-tertiary leading-none">비번</span>
      </div>
      <div className="flex items-center gap-0.5">
        <span className={`inline-block rounded-full bg-duty-day ${dotSize}`} />
        <span className="text-caption text-text-tertiary leading-none">주간</span>
      </div>
      <div className="flex items-center gap-0.5">
        <span className={`inline-block rounded-full bg-duty-leave ${dotSize}`} />
        <span className="text-caption text-text-tertiary leading-none">휴무</span>
      </div>
      {([
        { label: '연차', bg: '#42d778' },
        { label: '공가', bg: '#8f42d7' },
        { label: '경조', bg: '#d78042' },
        { label: '병가', bg: '#d74242' },
        { label: '보건', bg: '#d7428c' },
        { label: '기타', bg: '#4244d7' },
      ]).map(l => (
        <div key={l.label} className="flex items-center gap-0.5">
          <span className={`inline-block rounded-full ${dotSize}`} style={{ background: l.bg }} />
          <span className="text-caption text-text-tertiary leading-none">{l.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-0.5">
        <span
          className={`inline-block rounded-full ${dotSize}`}
          style={{ background: 'linear-gradient(135deg, #42d778 50%, var(--duty-day) 50%)' }}
        />
        <span className="text-caption text-text-tertiary leading-none">반차</span>
      </div>
    </div>
  )

  const summaryCards = (
    <div className="flex gap-2 px-3 pt-3.5 overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
      {[
        // W3 §6.3 Stat Card: 좌측 3px 색바 + bg-surface-raised 통일 + 값은 text-primary (위험 임계치 시 status)
        {
          label: '연차',
          value: `${remaining % 1 === 0 ? remaining : remaining.toFixed(1)}/${quota}일`,
          barColor: remainingThreshold === 'danger' ? 'var(--status-danger-bar)' : remainingThreshold === 'warning' ? 'var(--status-warning-bar)' : '#42d778',
          valueClass: remainingThreshold === 'danger' ? 'text-danger' : remainingThreshold === 'warning' ? 'text-warning' : 'text-text-primary',
        },
        { label: '제공식수', value: `${monthlySummary.actualMeals}끼`, barColor: '#06b6d4', valueClass: 'text-text-primary' },
        { label: '미사용식수', value: `${monthlySummary.totalSkipped}끼`, barColor: '#d7428c', valueClass: 'text-text-primary' },
        { label: '주말식대', value: `${monthlySummary.totalAllowance.toLocaleString()}원`, barColor: '#8f42d7', valueClass: 'text-text-primary' },
      ].map(c => (
        <div
          key={c.label}
          className="flex-1 min-w-[84px] bg-surface-raised border border-border-default rounded-md p-card overflow-hidden"
          style={{ boxShadow: `inset 3px 0 0 ${c.barColor}` }}
        >
          <div className="text-caption text-text-tertiary font-semibold leading-none mb-1.5 whitespace-nowrap">{c.label}</div>
          <div className={`text-title font-extrabold leading-none whitespace-nowrap ${c.valueClass}`} style={{ letterSpacing: '-0.01em' }}>{c.value}</div>
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
    // 식당 미운영일에는 표시 차단 — 일요일/공휴일/공휴일직후토요일 (mealCalc 운영규칙과 동일)
    // 일반 토요일은 점심만 운영하므로 표시 허용 (시간대로 isLunch/isDinner 컨트롤)
    const dow = now.getDay()
    if (dow === 0) return null
    if (holidayMap[todayStr]) return null
    if (dow === 6) {
      const yest = new Date(now); yest.setDate(yest.getDate() - 1)
      const yestYMD = `${yest.getFullYear()}-${String(yest.getMonth()+1).padStart(2,'0')}-${String(yest.getDate()).padStart(2,'0')}`
      if (holidayMap[yestYMD]) return null
    }
    const isLunch = hm >= 480 && hm < 780
    const isDinner = hm >= 780 && hm < 1110
    if (!isLunch && !isDinner) return null

    return (
      <div className="grid grid-cols-2 gap-2 px-3 pt-2">
        {isLunch && menu.lunch_a && (
          <>
            <div
              className="rounded-md p-3 border"
              style={{ background: 'rgba(6, 182, 212, 0.08)', borderColor: 'rgba(6, 182, 212, 0.2)' }}
            >
              <div className="text-caption font-bold leading-none mb-1.5" style={{ color: '#06b6d4' }}>중식 A코너</div>
              <div className="text-body-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {menu.lunch_a.split(' / ').join('\n')}
              </div>
            </div>
            {menu.lunch_b && (
              <div
                className="rounded-md p-3 border"
                style={{ background: 'rgba(215, 66, 140, 0.08)', borderColor: 'rgba(215, 66, 140, 0.2)' }}
              >
                <div className="text-caption font-bold leading-none mb-1.5" style={{ color: '#d7428c' }}>중식 B코너</div>
                <div className="text-body-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {menu.lunch_b.split(' / ').join('\n')}
                </div>
              </div>
            )}
          </>
        )}
        {isDinner && menu.dinner && (
          <div
            className="col-span-2 rounded-md p-3 border"
            style={{ background: 'rgba(215, 128, 66, 0.08)', borderColor: 'rgba(215, 128, 66, 0.2)' }}
          >
            <div className="text-caption font-bold leading-none mb-1.5" style={{ color: '#d78042' }}>석식 메뉴</div>
            <div className="text-body-sm text-text-secondary leading-relaxed whitespace-pre-line">
              {menu.dinner.split(' / ').join('\n')}
            </div>
          </div>
        )}
      </div>
    )
  })()

  const uploadSection = (
    <div className="px-3 py-3.5">
      <label
        ref={dropRef}
        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent)' }}
        onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)' }}
        onDrop={e => {
          e.preventDefault()
          e.currentTarget.style.borderColor = 'var(--border-default)'
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
        className={`flex items-center justify-center cursor-pointer bg-surface-raised text-text-secondary text-caption font-semibold leading-none rounded-md text-center transition-colors ${isDesktop ? 'border-2 border-dashed border-border-default py-12' : 'border border-border-default py-3'}`}
      >
        {isDesktop ? '식단표 PDF 드래그앤드롭 또는 클릭하여 업로드' : '식단표 PDF 업로드'}
        <input type="file" accept=".pdf" className="hidden" onChange={handleMenuUpload} />
      </label>
    </div>
  )

  // ── Desktop ──────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="h-full flex flex-col overflow-hidden bg-surface-page">
        {/* 페이지 제목은 App.tsx 헤더에서 표시 */}

        {/* 3분할 본문 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 좌측: 달력 + 범례 + 요약 + 메뉴 + 업로드 */}
          <div className="flex-1 min-w-0 border-r border-border-default overflow-y-auto pb-2">
            {calendarGrid}
            {legendRow}
            {summaryCards}
            <div className="border-t border-border-default mt-1 mx-3" />
            <div className="px-1 pt-2">
              {menuSection}
            </div>
            {uploadSection}
          </div>

          {/* 중앙: 휴가신청서 폼 */}
          <div className="w-[280px] flex-shrink-0 border-r border-border-default overflow-y-auto p-modal flex flex-col gap-3">
            <div className="text-body font-bold text-text-primary leading-none mb-2">휴가신청서</div>

            {/* 선택된 날짜 표시 */}
            {selCell?.date && (
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-surface-sunken rounded-sm">
                <span className="text-label font-bold text-text-primary leading-none">
                  {selCell.date.getMonth() + 1}/{selCell.day} ({DOW_KO[selCell.dow]})
                </span>
                <span
                  className="text-caption font-bold text-text-on-accent rounded-sm px-1.5 py-0.5 leading-none"
                  style={{ background: SHIFT_COLOR[selCell.rawShift] }}
                >
                  {selCell.rawShift === '당' ? '당직' : selCell.rawShift === '비' ? '비번' : selCell.rawShift === '주' ? '주간' : '휴무'}
                </span>
              </div>
            )}

            {/* 휴가기간 */}
            <div>
              <div className="text-caption text-text-secondary leading-none mb-1">휴가기간 <span className="text-caption text-text-tertiary">(달력에서 클릭)</span></div>
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={docStartDate}
                  onChange={e => setDocStartDate(e.target.value)}
                  className="flex-1 bg-surface-page border border-border-default text-text-primary rounded-sm px-1.5 py-1 text-caption"
                />
                <span className="text-text-tertiary text-caption leading-none">~</span>
                <input
                  type="date"
                  value={docEndDate}
                  onChange={e => setDocEndDate(e.target.value)}
                  className="flex-1 bg-surface-page border border-border-default text-text-primary rounded-sm px-1.5 py-1 text-caption"
                />
              </div>
              {docDays > 0 && (
                <div className="text-caption font-bold leading-none mt-1" style={{ color: '#facc15' }}>
                  {docDays % 1 === 0 ? docDays : docDays.toFixed(1)}일간
                </div>
              )}
            </div>

            {/* 휴가 종류 버튼 그리드 */}
            <div className="flex flex-col gap-1">
              {DOC_LEAVE_GRID.map((row, ri) => (
                <div
                  key={ri}
                  className={`grid gap-1 ${row.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}
                >
                  {row.map(lt => {
                    const active = docLeaveType === lt.type
                    const apiType = DOC_TO_API_TYPE[lt.type]
                    const isRegistered = !!(apiType && selMyLeave?.type === apiType)
                    return (
                      <button
                        key={lt.type}
                        onClick={() => setDocLeaveType(lt.type)}
                        className={`rounded-sm px-1 py-1.5 text-caption font-semibold cursor-pointer text-center leading-none border ${
                          isRegistered
                            ? 'bg-safe-bg text-safe border-safe-bar border-2'
                            : active
                              ? 'bg-accent text-text-on-accent border-accent'
                              : 'bg-surface-sunken text-text-secondary border-border-default'
                        }`}
                        style={lt.cols ? { gridColumn: `span ${lt.cols}` } : undefined}
                      >
                        {lt.label}
                        {isRegistered && <Check size={12} className="ml-1 inline align-middle" />}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* 사유 입력 (연차 외 전부) */}
            {!ANNUAL_TYPES.has(docLeaveType) && (
              <div>
                <div className="text-caption text-text-secondary leading-none mb-1">사유</div>
                <textarea
                  value={docReason}
                  onChange={e => setDocReason(e.target.value)}
                  placeholder="사유를 입력하세요"
                  className="w-full min-h-[48px] p-2 bg-surface-page border border-border-default text-text-primary rounded-sm text-caption leading-relaxed resize-y"
                />
              </div>
            )}

            {/* 기타특별휴가 추가 사유 (양식 괄호 안 텍스트) */}
            {docLeaveType === 'other_special' && (
              <div>
                <div className="text-caption text-text-secondary leading-none mb-1">기타특별휴가 종류</div>
                <input
                  value={docOtherReason}
                  onChange={e => setDocOtherReason(e.target.value)}
                  placeholder="예: 가족돌봄, 난임치료 등"
                  className="w-full px-2 py-1.5 bg-surface-page border border-border-default text-text-primary rounded-sm text-caption"
                />
              </div>
            )}

            {/* 휴가 신청 버튼 */}
            <button
              onClick={async () => {
                if (!docStartDate || !docLeaveType) {
                  toast.error('기간과 휴가 종류를 선택하세요')
                  return
                }
                const apiType = DOC_TO_API_TYPE[docLeaveType]
                if (!apiType) return
                const end = docEndDate || docStartDate
                const toastId = toast.loading('등록 중...')
                try {
                  const workDates: string[] = []
                  const cur = new Date(docStartDate)
                  const endD = new Date(end)
                  while (cur <= endD) {
                    const ymd = localYMD(cur)
                    const dow = cur.getDay()
                    if (dow !== 0 && dow !== 6 && !HOLIDAYS_FALLBACK[ymd]) workDates.push(ymd)
                    cur.setDate(cur.getDate() + 1)
                  }
                  let count = 0
                  for (const ymd of workDates) {
                    const existing = myLeaveMap[ymd]
                    if (existing?.type === apiType && existing?.reason === (docReason || null)) continue
                    if (existing) await leaveApi.delete(existing.id)
                    await leaveApi.create(ymd, apiType as any, docReason || undefined)
                    count++
                  }
                  toast.success(count > 0 ? `${count}일 등록` : '변경 없음', { id: toastId })
                } catch (err: any) {
                  toast.error(err?.message ?? '오류 발생', { id: toastId })
                }
                await qc.invalidateQueries({ queryKey: ['leaves'] })
                await qc.invalidateQueries({ queryKey: ['leaves-year'] })
              }}
              disabled={!docStartDate || !docLeaveType}
              className={`w-full py-2.5 rounded-md text-label font-bold leading-none border-0 ${
                docStartDate && docLeaveType
                  ? 'bg-safe-bar text-text-on-accent cursor-pointer'
                  : 'bg-surface-sunken text-text-tertiary cursor-default'
              }`}
            >
              휴가 신청
            </button>

            <div className="flex-1" />

            {/* 액션 버튼 */}
            <button
              onClick={handleLeaveDownload}
              className="w-full py-2.5 rounded-md bg-accent text-text-on-accent border-0 text-label font-bold leading-none cursor-pointer"
            >
              PDF 다운로드
            </button>
            <button
              onClick={handleLeavePrint}
              className="w-full py-2.5 rounded-md bg-surface-sunken text-text-secondary border border-border-default text-label font-bold leading-none cursor-pointer"
            >
              인쇄
            </button>
          </div>

          {/* 우측: A4 미리보기 + PDF 좌표 기반 값 오버레이 */}
          <div className="flex-1 min-w-0 overflow-y-auto bg-surface-raised flex items-start justify-center p-modal relative">
            <div className="relative w-full max-w-[595px]">
              <img
                src="/templates/leave_request_preview.png"
                alt="휴가신청서 미리보기"
                className="w-full block rounded-sm"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />

              {(() => {
                const sid = staff?.id ?? ''
                const hireDate = sid.length >= 8 ? `${sid.slice(0,4)}-${sid.slice(4,6)}-${sid.slice(6,8)}` : null
                const fmtDate = (d: string) => {
                  const [y, m, dd] = d.split('-')
                  return `${y.slice(2)}.${String(parseInt(m)).padStart(2,'0')}.${String(parseInt(dd)).padStart(2,'0')}`
                }
                const ovAt = (p: { x: number; y: number } | undefined, text: string, extra?: React.CSSProperties) =>
                  p ? <span key={`${p.x}-${p.y}-${text}`} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)', fontSize: 12, fontWeight: 700, color: '#111', whiteSpace: 'nowrap', fontFamily: "'Noto Sans KR', sans-serif", ...extra }}>{text}</span> : null

                const checkMap: Record<string, { x: number; y: number } | undefined> = {
                  annual: lp[6], half_am: lp[6], half_pm: lp[6],
                  condolence: lp[7],
                  sick_work: lp[8],
                  sick_personal: lp[9],
                  health: lp[10],
                  official: lp[11], official_half_am: lp[11], official_half_pm: lp[11],
                  other_special: lp[12],
                }
                const cp = checkMap[docLeaveType]
                const daysStr = docDays % 1 === 0 ? String(docDays) : docDays.toFixed(1)

                return (
                  <>
                    {hireDate && ovAt(lp[0], fmtDate(hireDate))}
                    {staffFull?.birthDate && ovAt(lp[1], fmtDate(staffFull.birthDate))}
                    {staff && ovAt(lp[2], staff.name)}
                    {docStartDate && ovAt(lp[3], fmtDate(docStartDate))}
                    {docEndDate && ovAt(lp[4], fmtDate(docEndDate))}
                    {docDays > 0 && ovAt(lp[5], daysStr)}
                    {cp && <div style={{ position: 'absolute', left: `${cp.x}%`, top: `${cp.y}%`, transform: 'translate(-50%, -50%)', width: 12, height: 12, background: '#000' }} />}
                    {docLeaveType === 'other_special' && docOtherReason && ovAt(lp[13], docOtherReason)}
                    {staffFull?.phone && ovAt(lp[14], staffFull.phone)}
                    {docDays > 0 && ovAt(lp[15], daysStr)}
                    {!ANNUAL_TYPES.has(docLeaveType) && docReason && ovAt(lp[16], docReason)}
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
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-surface-page relative">

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-5">
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
            className="absolute inset-0 z-[90]"
            style={{ background: 'rgba(0,0,0,0.45)', animation: 'fadeIn .2s ease' }}
          />
          <style>{`
            @keyframes fadeIn{from{opacity:0}to{opacity:1}}
            @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
          `}</style>
          <div
            className="absolute bottom-0 left-0 right-0 z-[100] bg-surface-raised rounded-t-[20px] p-4 pb-6 max-h-[65vh] overflow-y-auto"
            style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.2)', animation: 'slideUp .25s ease' }}
          >
            {/* Handle bar */}
            <div className="flex justify-center mb-3">
              <div className="w-9 h-1 rounded-sm bg-border-default" />
            </div>

            {/* Sheet header + 식사 미사용 */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-body font-bold text-text-primary leading-none">
                {selCell.date.getMonth() + 1}/{selCell.day} ({DOW_KO[selCell.dow]})
              </span>
              <span
                className="text-caption font-bold text-text-on-accent rounded-sm px-2 py-0.5 leading-none"
                style={{ background: SHIFT_COLOR[selCell.rawShift] }}
              >
                {selCell.rawShift === '당' ? '당직근무' : selCell.rawShift === '비' ? '비번' : selCell.rawShift === '주' ? '주간근무' : '휴무'}
              </span>
              {selCell.isHoliday && (
                <span className="text-caption text-danger font-semibold leading-none">{selCell.holidayName}</span>
              )}
              {selCell.provided > 0 && (
                <div className="ml-auto flex items-center gap-1">
                  <span className="text-caption text-text-tertiary leading-tight text-right">식사 미사용<br/>눌러서 표기</span>
                  <button
                    onClick={handleMealCycle}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-sm cursor-pointer text-caption font-bold leading-none border ${
                      selCell.skipped > 0
                        ? 'bg-warning-bg text-warning border-warning-bar'
                        : 'bg-surface-sunken text-text-tertiary border-border-default'
                    }`}
                  >
                    {selCell.skipped}<span className="text-caption font-medium leading-none">끼</span>
                  </button>
                </div>
              )}
            </div>

            {/* Leave section */}
            <div className="mb-4">
              <div className="text-caption font-bold text-text-secondary leading-none mb-2">휴가</div>
              {(selCell.isWeekend || selCell.isHoliday) ? (
                <div className="text-caption text-text-tertiary px-3 py-2 bg-surface-sunken rounded-sm leading-none">
                  {selCell.isHoliday ? `공휴일(${selCell.holidayName})` : '주말'}은 휴가 등록이 불가합니다
                </div>
              ) : (
                <>
                  {selCell.hasInspect && (
                    <div className="text-caption font-semibold mb-1.5 px-2 py-1 bg-warning-bg text-warning rounded-sm leading-none">
                      소방 점검일 - 휴가 등록 주의
                    </div>
                  )}

                  {/* 기간 선택 */}
                  <div className="grid gap-1 items-end mb-2" style={{ gridTemplateColumns: '1fr auto 1fr auto' }}>
                    <div>
                      <div className="text-caption text-text-tertiary leading-none mb-0.5">시작일</div>
                      <input
                        type="date"
                        value={docStartDate}
                        readOnly
                        className="block w-full px-0.5 py-1.5 rounded-sm border border-border-default bg-surface-page text-text-primary text-caption box-border"
                        style={{ WebkitAppearance: 'none', MozAppearance: 'none' } as any}
                      />
                    </div>
                    <span className="text-text-tertiary text-caption pb-2 leading-none">~</span>
                    <div>
                      <div className="text-caption text-text-tertiary leading-none mb-0.5">종료일</div>
                      <input
                        type="date"
                        value={docEndDate}
                        onChange={e => { if (e.target.value >= docStartDate) setDocEndDate(e.target.value) }}
                        className="block w-full px-0.5 py-1.5 rounded-sm border border-border-default bg-surface-page text-text-primary text-caption box-border"
                        style={{ WebkitAppearance: 'none', MozAppearance: 'none' } as any}
                      />
                    </div>
                    {docDays > 0 ? (
                      <span className="text-label font-bold pb-1.5 whitespace-nowrap leading-none" style={{ color: '#facc15' }}>
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
                    return (
                      <div className="flex flex-col gap-1 mb-2">
                        {MOBILE_BTNS.map((row, ri) => (
                          <div key={ri} className="grid grid-cols-3 gap-1">
                            {row.map(b => {
                              const isReg = selMyLeave?.type === b.api
                              const isSel = docLeaveType === b.type
                              return (
                                <button
                                  key={b.type}
                                  onClick={() => setDocLeaveType(b.type)}
                                  className={`px-0.5 py-2 rounded-sm text-caption font-bold cursor-pointer text-center leading-none border ${
                                    isReg
                                      ? 'bg-safe-bg text-safe border-safe-bar border-2'
                                      : isSel
                                        ? 'bg-accent text-text-on-accent border-accent'
                                        : 'bg-surface-sunken text-text-secondary border-border-default'
                                  }`}
                                >
                                  {b.label}
                                  {isReg && <Check size={12} className="ml-1 inline align-middle" />}
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
                    return (
                      <div className="mb-2">
                        <select
                          value={mobileOtherType}
                          onChange={e => { setMobileOtherType(e.target.value); if (e.target.value) setDocLeaveType(e.target.value) }}
                          className="w-full h-[34px] rounded-sm border border-border-default bg-surface-page text-text-primary text-caption px-2"
                        >
                          <option value="">기타 휴가 선택...</option>
                          {OTHER_TYPES.map(o => <option key={o.api} value={o.api}>{o.label}</option>)}
                        </select>
                      </div>
                    )
                  })()}

                  {/* 사유 입력 */}
                  {docLeaveType && !ANNUAL_TYPES.has(docLeaveType) && (
                    <input
                      value={docReason}
                      onChange={e => setDocReason(e.target.value)}
                      placeholder="사유 입력"
                      className="w-full mb-2 px-2 py-1.5 rounded-sm border border-border-default bg-surface-page text-text-primary text-caption box-border"
                    />
                  )}

                  {/* 휴가 신청 버튼 */}
                  <button
                    onClick={async () => {
                      if (!docStartDate || !docLeaveType) {
                        toast.error('기간과 휴가 종류를 선택하세요')
                        return
                      }
                      const apiType = DOC_TO_API_TYPE[docLeaveType] || mobileOtherType || docLeaveType
                      if (!apiType) return
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
                        let cnt = 0
                        for (const ymd of workDates) {
                          const ex = myLeaveMap[ymd]
                          if (ex?.type === apiType && ex?.reason === (docReason || null)) continue
                          if (ex) await leaveApi.delete(ex.id)
                          await leaveApi.create(ymd, apiType as any, docReason || undefined); cnt++
                        }
                        toast.success(cnt > 0 ? `${cnt}일 등록` : '변경 없음', { id: toastId })
                      } catch (err: any) { toast.error(err?.message ?? '오류', { id: toastId }) }
                      await qc.invalidateQueries({ queryKey: ['leaves'] })
                      await qc.invalidateQueries({ queryKey: ['leaves-year'] })
                    }}
                    disabled={!docStartDate || !docLeaveType}
                    className={`w-full py-2.5 rounded-md text-caption font-bold leading-none border-0 mb-1 ${
                      docStartDate && docLeaveType
                        ? 'bg-safe-bar text-text-on-accent cursor-pointer'
                        : 'bg-surface-sunken text-text-tertiary cursor-default'
                    }`}
                  >
                    휴가 신청
                  </button>

                  {/* PDF 다운로드 */}
                  <button
                    onClick={handleLeaveDownload}
                    className="w-full py-2.5 rounded-md bg-info-bar text-text-on-accent border-0 text-caption font-bold leading-none cursor-pointer"
                  >
                    휴가신청서 다운로드
                  </button>
                </>
              )}
            </div>


            {/* Team leave */}
            {selCell.teamLeaveList.length > 0 && (
              <div className="mb-4">
                <div className="text-caption font-bold text-text-secondary leading-none mb-2">팀원 연차</div>
                <div className="flex flex-wrap gap-1.5">
                  {selCell.teamLeaveList.map(tl => (
                    <span
                      key={tl.id}
                      className="text-caption font-semibold text-text-primary bg-surface-sunken rounded-sm px-2.5 py-1 border border-border-default leading-none"
                    >
                      {teamNameMap[tl.staffId] ?? tl.staffId.slice(-4)}
                      <span
                        className={`ml-1 text-caption font-bold leading-none ${
                          tl.type.startsWith('official') ? 'text-info' : 'text-safe'
                        }`}
                      >
                        ({LEAVE_LABEL[tl.type] ?? tl.type})
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Weekend allowance info */}
            {(() => {
              const allow = calcWeekendAllowance(selCell.rawShift, selCell.dow, selCell.isHoliday, selCell.isPrevDayHoliday)
              if (allow > 0) return (
                <div
                  className="mb-4 px-3 py-2 rounded-sm border"
                  style={{ background: 'rgba(143, 66, 215, 0.08)', borderColor: 'rgba(143, 66, 215, 0.2)' }}
                >
                  <span className="text-caption font-bold leading-none" style={{ color: '#8f42d7' }}>주말 식대: ₩{allow.toLocaleString()}</span>
                </div>
              )
              return null
            })()}

            {/* Close button */}
            <button
              onClick={() => { setSheetOpen(false); setSelDate(null) }}
              className="w-full p-3 rounded-md bg-surface-sunken border border-border-default text-body-sm font-bold text-text-secondary cursor-pointer"
            >
              닫기
            </button>
          </div>
        </>
      )}
    </div>
  )
}
