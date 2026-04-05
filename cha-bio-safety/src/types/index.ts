export type Role      = 'admin' | 'assistant'
export type ShiftType = 'day' | 'night' | 'off' | 'leave'
export type LeaveType = 'full' | 'half_am' | 'half_pm' | 'official_full' | 'official_half_am' | 'official_half_pm'
export interface Staff { id:string; name:string; role:Role; title:string; shiftType?:ShiftType; leaveType?:LeaveType }

export type CheckResult  = 'normal'|'caution'|'bad'|'unresolved'|'missing'
export type BuildingZone = 'office'|'research'|'common'
export type Floor = 'B5'|'B4'|'B3'|'B2'|'LOBBY'|'B1'|'1F'|'2F'|'3F'|'M'|'5F'|'6F'|'7F'|'8F'|'8-1F'
export interface CheckPoint { id:string; qrCode:string; floor:Floor; zone:BuildingZone; location:string; category:string; description?:string; locationNo?:string; defaultResult?:CheckResult }
export interface CheckRecord { id:string; sessionId:string; checkpointId:string; staffId:string; result:CheckResult; memo?:string; checkedAt:string }

export type ScheduleStatus   = 'pending'|'in_progress'|'done'|'overdue'
export type ScheduleCategory = 'inspect'|'task'|'event'|'elevator'|'fire'
export interface ScheduleItem { id:string; title:string; date:string; time?:string; assigneeId?:string; category:ScheduleCategory; status:ScheduleStatus; inspectionCategory?:string; memo?:string }

export interface DashboardStats { inspectTotal:number; inspectDone:number; scheduleCount:number; unresolved:number; elevatorFault:number; streakDays:number; elevInspDueSoon:number }
export interface DashboardScheduleItem { id:string; title:string; date:string; time?:string; category:ScheduleCategory; status:ScheduleStatus; completed:boolean; memo?:string }
export interface WeeklyItem { day:string; label:string; pct:number; color:string; isToday:boolean }

export type ElevatorType   = 'passenger'|'cargo'|'dumbwaiter'|'escalator'
export type ElevatorStatus = 'normal'|'fault'|'maintenance'|'out_of_service'
export interface Elevator { id:string; number:number; type:ElevatorType; location:string; status:ElevatorStatus; lastInspection?:string; nextInspection?:string }

export interface ApiResponse<T> { success:boolean; data?:T; error?:string }

export interface StaffFull {
  id: string; name: string; role: Role; title: string;
  phone: string | null; email: string | null; appointedAt: string | null;
  active: number; shiftType: string | null; createdAt: string;
}
export interface StaffCreatePayload { id: string; name: string; role: Role; title: string; phone?: string; email?: string; appointedAt?: string }
export interface StaffUpdatePayload { name?: string; role?: Role; title?: string; phone?: string; email?: string; appointedAt?: string; active?: number }

export interface CheckPointFull {
  id: string; qrCode: string; floor: string; zone: BuildingZone;
  location: string; category: string; description: string | null;
  locationNo: string | null; isActive: number; createdAt: string;
}
export interface CheckPointCreatePayload { id: string; qrCode: string; floor: string; zone: BuildingZone; location: string; category: string; description?: string; locationNo?: string }
export interface CheckPointUpdatePayload { location?: string; category?: string; description?: string; locationNo?: string; floor?: string; zone?: BuildingZone; isActive?: number }

export interface EducationRecord {
  id: string
  staffId: string
  educationType: 'initial' | 'refresher'
  completedAt: string   // YYYY-MM-DD
  createdAt: string
}

export interface StaffEducation {
  staff: { id: string; name: string; title: string; appointedAt: string | null }
  records: EducationRecord[]
}

export interface RemediationRecord {
  id: string
  result: 'bad' | 'caution'
  memo: string | null
  photoKey: string | null
  status: 'open' | 'resolved'
  resolutionMemo: string | null
  resolutionPhotoKey: string | null
  resolvedAt: string | null
  resolvedBy: string | null
  checkedAt: string
  staffId: string
  staffName: string | null
  category: string
  location: string
  floor: string
  zone: string
}

// ── Legal Inspection ─────────────────────────────────────
export type LegalInspectionResult = 'pass' | 'fail' | 'conditional'
export type LegalFindingStatus = 'open' | 'resolved'

export interface LegalRound {
  id: string
  title: string
  date: string
  inspectionCategory: string
  status: string
  result: LegalInspectionResult | null
  reportFileKey: string | null
  findingCount: number
  resolvedCount: number
}

export interface LegalFinding {
  id: string
  scheduleItemId: string
  description: string
  location: string | null
  photoKey: string | null
  resolutionMemo: string | null
  resolutionPhotoKey: string | null
  status: LegalFindingStatus
  resolvedAt: string | null
  resolvedBy: string | null
  resolvedByName: string | null
  createdBy: string
  createdByName: string | null
  createdAt: string
}

// ── Elevator Inspection Certs ───────────────────────────
export type ElevatorInspectType = 'regular' | 'special' | 'detailed'
export type ElevatorInspectionResult = 'pass' | 'conditional' | 'fail'
export type ElevatorFindingStatus = 'open' | 'resolved'

export interface ElevatorInspectionFinding {
  id: string
  inspectionId: string
  description: string
  location: string | null
  photoKey: string | null
  resolutionMemo: string | null
  resolutionPhotoKey: string | null
  status: ElevatorFindingStatus
  resolvedAt: string | null
  resolvedBy: string | null
  resolvedByName: string | null
  createdBy: string
  createdByName: string | null
  createdAt: string
}

export interface ElevatorNextInspection {
  elevatorId: string
  elevatorNumber: number
  elevatorType: ElevatorType
  installYear: number | null
  lastDate: string | null
  nextDate: string | null
  cycleMonths: number
  status: 'ok' | 'due_soon' | 'overdue' | 'no_record'
  daysUntil: number | null
}

export type RepairTarget = 'car' | 'hall' | 'machine_room' | 'pit' | 'escalator'
export type RepairSource = 'standalone' | 'fault' | 'inspect' | 'annual'
export interface ElevatorRepair {
  id: string
  elevatorId: string
  elevatorNumber: number
  elevatorLocation: string
  elevatorType: string
  repairDate: string
  repairTarget: RepairTarget
  hallFloor: string | null
  repairItem: string
  repairDetail: string | null
  repairCompany: string | null
  source: RepairSource
  sourceId: string | null
  partsArrivalPhotos: string | null
  damagedPartsPhotos: string | null
  duringRepairPhotos: string | null
  completedPhotos: string | null
  createdBy: string
  createdAt: string
}
