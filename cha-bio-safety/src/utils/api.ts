import { useAuthStore } from '../stores/authStore'

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); this.name = 'ApiError' }
}

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token } = useAuthStore.getState()
  const headers: Record<string,string> = { 'Content-Type':'application/json', ...(init.headers as Record<string,string>) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res  = await fetch(`${BASE}${path}`, { ...init, headers })
  const json = await res.json() as { success: boolean; data?: T; error?: string }
  if (!res.ok || !json.success) {
    // 로그인 엔드포인트에서의 401은 리다이렉트 없이 에러만 throw (잘못된 비밀번호 등)
    if (res.status === 401 && !path.includes('/auth/login')) { useAuthStore.getState().logout(); window.location.href = '/login' }
    throw new ApiError(res.status, json.error ?? '요청 실패')
  }
  return json.data as T
}

export const api = {
  get:    <T>(p: string)             => req<T>(p),
  post:   <T>(p: string, b: unknown) => req<T>(p, { method:'POST',  body: JSON.stringify(b) }),
  put:    <T>(p: string, b: unknown) => req<T>(p, { method:'PUT',   body: JSON.stringify(b) }),
  delete: <T>(p: string)             => req<T>(p, { method:'DELETE' }),
  patch:  <T>(p: string, b: unknown) => req<T>(p, { method:'PATCH', body: JSON.stringify(b) }),
}

export const authApi = {
  login: (staffId: string, password: string) =>
    api.post<{ token: string; staff: import('../types').Staff }>('/auth/login', { staffId, password }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<void>('/auth/change-password', data),
}

export const dashboardApi = {
  getStats: () => api.get<{
    stats: import('../types').DashboardStats
    todaySchedule: import('../types').DashboardScheduleItem[]
    onDutyStaff: import('../types').Staff[]
    monthlyItems: { label:string; pct:number; color:string; total:number; done:number }[]
    todayTarget: string
  }>('/dashboard/stats'),
}

export const remediationApi = {
  list: (params: { status?: string; category?: string; days?: number }) => {
    const q = new URLSearchParams()
    if (params.status && params.status !== 'all') q.set('status', params.status)
    if (params.category) q.set('category', params.category)
    if (params.days !== undefined) q.set('days', String(params.days))
    const qs = q.toString()
    return api.get<{ records: import('../types').RemediationRecord[]; categories: string[] }>(
      `/remediation${qs ? '?' + qs : ''}`
    )
  },
  get: (recordId: string) =>
    api.get<import('../types').RemediationRecord>(`/remediation/${recordId}`),
}

export const scheduleApi = {
  getByDate:  (date: string)  => api.get<import('../types').ScheduleItem[]>(`/schedule?date=${date}`),
  getByMonth: (month: string) => api.get<import('../types').ScheduleItem[]>(`/schedule?month=${month}`),
  create: (body: { title:string; date:string; time?:string; category:string; assigneeId?:string; inspectionCategory?:string; memo?:string }) =>
    api.post<{ id:string }>('/schedule', body),
  updateStatus: (id: string, status: string) =>
    api.patch<void>(`/schedule/${id}`, { status }),
  update: (id: string, body: { title: string; date: string; time?: string; memo?: string }) =>
    api.put<void>(`/schedule/${id}`, body),
  delete: (id: string) =>
    api.delete<void>(`/schedule/${id}`),
}

export interface LeaveItem {
  id:        string
  staffId:   string
  staffName?: string
  date:      string
  type:      'full' | 'half_am' | 'half_pm' | 'official_full' | 'official_half_am' | 'official_half_pm'
  year:      number
  createdAt: string
}

export const leaveApi = {
  list:   (year: number, month?: string) =>
    api.get<{ myLeaves: LeaveItem[]; teamLeaves: LeaveItem[] }>(
      `/leaves?year=${year}${month ? `&month=${month}` : ''}`
    ),
  create: (date: string, type: string) =>
    api.post<{ id: string }>('/leaves', { date, type }),
  delete: (id: string) =>
    api.delete<void>(`/leaves/${id}`),
}

export const dailyReportApi = {
  getData: (date: string) => req<{ schedules: any[]; leaves: any[]; elevatorFaults: any[] }>(`/daily-report?date=${date}`),
  getNotes: (date: string) => req<any>(`/daily-report/notes?date=${date}`),
  getMonthNotes: (year: number, month: number) => req<any[]>(`/daily-report/notes?year=${year}&month=${String(month).padStart(2, '0')}`),
  saveNotes: (data: { date: string; today_text?: string; tomorrow_text?: string; content?: string; is_auto?: number }) =>
    req<any>('/daily-report/notes', { method: 'POST', body: JSON.stringify(data) }),
}

export const fireAlarmApi = {
  getByYear: (year: number) => req<any[]>(`/fire-alarm?year=${year}`),
  getRecent: () => req<any[]>('/fire-alarm?recent=1'),
  create: (data: { type: string; occurred_at: string; location: string; cause: string; action: string }) =>
    req<{ id: string }>('/fire-alarm', { method: 'POST', body: JSON.stringify(data) }),
}

export interface FloorPlanMarker {
  id: string
  floor: string
  plan_type: string
  marker_type: string | null
  x_pct: number
  y_pct: number
  label: string | null
  check_point_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  last_result: string | null
  last_inspected_at: string | null
}

export const floorPlanMarkerApi = {
  list: (floor: string, planType: string) =>
    api.get<FloorPlanMarker[]>(`/floorplan-markers?floor=${floor}&plan_type=${planType}`),
  create: (body: { floor: string; plan_type: string; marker_type?: string; x_pct: number; y_pct: number; label?: string; check_point_id?: string }) =>
    api.post<{ id: string }>('/floorplan-markers', body),
  update: (id: string, body: { x_pct?: number; y_pct?: number; label?: string; marker_type?: string; check_point_id?: string | null }) =>
    api.put<void>(`/floorplan-markers/${id}`, body),
  delete: (id: string) =>
    api.delete<void>(`/floorplan-markers/${id}`),
}

export interface ExtinguisherDetail {
  mgmt_no: string
  zone: string
  floor: string
  location: string
  type: string
  approval_no: string | null
  manufactured_at: string | null
  manufacturer: string | null
  prefix_code: string | null
  seal_no: string | null
  serial_no: string | null
  note: string | null
}

export interface ExtinguisherListResponse {
  items: (ExtinguisherDetail & { seq_no: number; cp_id: string })[]
  stats: { type: string; cnt: number }[]
  zones: string[]
  floors: string[]
  total: number
}

export const extinguisherApi = {
  getDetail: (checkPointId: string) =>
    api.get<ExtinguisherDetail | null>(`/extinguishers/${checkPointId}`),
  list: (params?: { floor?: string; zone?: string; type?: string; q?: string }) => {
    const qs = new URLSearchParams()
    if (params?.floor) qs.set('floor', params.floor)
    if (params?.zone) qs.set('zone', params.zone)
    if (params?.type) qs.set('type', params.type)
    if (params?.q) qs.set('q', params.q)
    const q = qs.toString()
    return api.get<ExtinguisherListResponse>(`/extinguishers${q ? '?' + q : ''}`)
  },
}

export const staffApi = {
  list:          () => api.get<import('../types').StaffFull[]>('/staff'),
  create:        (data: import('../types').StaffCreatePayload)           => api.post<import('../types').StaffFull>('/staff', data),
  update:        (id: string, data: import('../types').StaffUpdatePayload) => api.put<import('../types').StaffFull>(`/staff/${id}`, data),
  resetPassword: (id: string) => api.post<void>(`/staff/${id}/reset-password`, {}),
}

export const checkPointApi = {
  list:       (category?: string) => api.get<import('../types').CheckPointFull[]>(`/check-points${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  categories: () => api.get<string[]>('/check-points?categories=all'),
  create:     (data: import('../types').CheckPointCreatePayload)           => api.post<import('../types').CheckPointFull>('/check-points', data),
  update:     (id: string, data: import('../types').CheckPointUpdatePayload) => api.put<import('../types').CheckPointFull>(`/check-points/${id}`, data),
}

export const mealApi = {
  list: (year: number, month: string) =>
    api.get<{ records: { date: string; skippedMeals: number }[] }>(
      `/meal?month=${month}`
    ),
  upsert: (date: string, skippedMeals: number) =>
    api.post<void>('/meal', { date, skippedMeals }),
}

export const educationApi = {
  list: () => api.get<import('../types').StaffEducation[]>('/education'),
  create: (data: { staffId: string; education_type: 'initial' | 'refresher'; completed_at: string }) =>
    api.post<import('../types').EducationRecord>('/education', data),
  update: (id: string, data: { completed_at: string }) =>
    api.put<void>(`/education/${id}`, data),
}

export const menuApi = {
  getByDate:  (date: string) => api.get<{ date: string; lunch_a: string | null; lunch_b: string | null; dinner: string | null; pdf_key?: string }>(`/menu?date=${date}`),
  getByWeek:  (weekStart: string) => api.get<{ date: string; lunch_a: string | null; lunch_b: string | null; dinner: string | null; pdf_key?: string }[]>(`/menu?week=${weekStart}`),
  upsert:     (menus: { date: string; lunch_a?: string; lunch_b?: string; dinner?: string }[], pdfKey?: string) =>
    api.post<{ date: string; id: string }[]>('/menu', { menus, pdf_key: pdfKey }),
}

export const holidayApi = {
  list: (year?: number) => api.get<{ date: string; name: string }[]>(`/holidays${year ? `?year=${year}` : ''}`),
  sync: () => api.post<{ years: number[]; inserted: number }>('/holidays/sync', {}),
}

export const inspectionApi = {
  getSessions:    (date: string) => api.get<any[]>(`/inspections?date=${date}`),
  createSession:  (body: any)    => api.post<any>('/inspections', body),
  submitRecord:   (sid: string, body: any) => api.post<any>(`/inspections/${sid}/records`, body),
  getTodayRecords:(date: string) => api.get<any[]>(`/inspections/records?date=${date}`),
  resolveRecord:  (recordId: string, resolution_memo: string, resolution_photo_key?: string) =>
    api.post<any>(`/inspections/records/${recordId}/resolve`, { resolution_memo, resolution_photo_key }),
  saveSessionPhoto: (sessionId: string, photoKey: string) =>
    api.put<any>(`/inspections/${sessionId}/photo`, { photoKey }),
  getCheckpoints: (floor?: string, zone?: string) => {
    const p = new URLSearchParams()
    if (floor) p.set('floor', floor)
    if (zone)  p.set('zone',  zone)
    return api.get<any[]>(`/checkpoints?${p}`)
  },
}

export const legalApi = {
  list: (year?: string) =>
    api.get<import('../types').LegalRound[]>(`/legal${year ? `?year=${year}` : ''}`),
  get: (id: string) =>
    api.get<import('../types').LegalRound>(`/legal/${id}`),
  updateResult: (id: string, body: { result?: string; report_file_key?: string }) =>
    api.patch<void>(`/legal/${id}`, body),
  getFindings: (scheduleItemId: string) =>
    api.get<import('../types').LegalFinding[]>(`/legal/${scheduleItemId}/findings`),
  createFinding: (scheduleItemId: string, body: { description: string; location?: string; photo_key?: string }) =>
    api.post<{ id: string }>(`/legal/${scheduleItemId}/findings`, body),
  getFinding: (scheduleItemId: string, fid: string) =>
    api.get<import('../types').LegalFinding>(`/legal/${scheduleItemId}/findings/${fid}`),
  updateFinding: (scheduleItemId: string, fid: string, body: Record<string, any>) =>
    api.put<void>(`/legal/${scheduleItemId}/findings/${fid}`, body),
  resolveFinding: (scheduleItemId: string, fid: string, body: { resolution_memo: string; resolution_photo_key?: string }) =>
    api.post<void>(`/legal/${scheduleItemId}/findings/${fid}/resolve`, body),
  deleteFinding: (scheduleItemId: string, fid: string) =>
    api.delete<void>(`/legal/${scheduleItemId}/findings/${fid}`),
}

export const elevatorInspectionApi = {
  getFindings: (elevatorId: string, inspectionId: string) =>
    api.get<import('../types').ElevatorInspectionFinding[]>(
      `/elevators/${elevatorId}/inspections/${inspectionId}/findings`
    ),
  createFinding: (elevatorId: string, inspectionId: string, body: { description: string; location?: string; photo_key?: string }) =>
    api.post<{ id: string }>(
      `/elevators/${elevatorId}/inspections/${inspectionId}/findings`, body
    ),
  resolveFinding: (elevatorId: string, inspectionId: string, fid: string, body: { resolution_memo: string; resolution_photo_key?: string; resolved_date?: string }) =>
    api.post<void>(
      `/elevators/${elevatorId}/inspections/${inspectionId}/findings/${fid}/resolve`, body
    ),
  getNextInspection: () =>
    api.get<import('../types').ElevatorNextInspection[]>('/elevators/next-inspection'),
}

export const elevatorRepairApi = {
  list: (params?: { elevator_id?: string; target?: string; keyword?: string; from?: string; to?: string; ev_type?: string }) => {
    const q = new URLSearchParams()
    if (params?.elevator_id) q.set('elevator_id', params.elevator_id)
    if (params?.target) q.set('target', params.target)
    if (params?.keyword) q.set('keyword', params.keyword)
    if (params?.from) q.set('from', params.from)
    if (params?.to) q.set('to', params.to)
    if (params?.ev_type) q.set('ev_type', params.ev_type)
    const qs = q.toString()
    return api.get<any[]>(`/elevators/repairs${qs ? '?' + qs : ''}`)
  },
  create: (body: any) =>
    api.post<{ id: string }>('/elevators/repairs', body),
  delete: (id: string) =>
    api.delete<void>(`/elevators/repairs?id=${id}`),
}
