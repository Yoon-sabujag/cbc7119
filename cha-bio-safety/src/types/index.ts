export type Role      = 'admin' | 'assistant'
export type ShiftType = 'day' | 'night' | 'off' | 'leave'
export interface Staff { id:string; name:string; role:Role; title:string; shiftType?:ShiftType }

export type CheckResult  = 'normal'|'caution'|'bad'|'unresolved'|'missing'
export type BuildingZone = 'office'|'research'|'common'
export type Floor = 'B5'|'B4'|'B3'|'B2'|'LOBBY'|'B1'|'1F'|'2F'|'3F'|'M'|'5F'|'6F'|'7F'|'8F'
export interface CheckPoint { id:string; qrCode:string; floor:Floor; zone:BuildingZone; location:string; category:string; description?:string; locationNo?:string }
export interface CheckRecord { id:string; sessionId:string; checkpointId:string; staffId:string; result:CheckResult; memo?:string; checkedAt:string }

export type ScheduleStatus   = 'pending'|'in_progress'|'done'|'overdue'
export type ScheduleCategory = 'inspect'|'task'|'event'|'elevator'|'fire'
export interface ScheduleItem { id:string; title:string; date:string; time?:string; assigneeId?:string; category:ScheduleCategory; status:ScheduleStatus; inspectionCategory?:string; memo?:string }

export interface DashboardStats { inspectTotal:number; inspectDone:number; scheduleCount:number; unresolved:number; elevatorFault:number; streakDays:number }
export interface WeeklyItem { day:string; label:string; pct:number; color:string; isToday:boolean }

export type ElevatorType   = 'passenger'|'cargo'|'dumbwaiter'|'escalator'
export type ElevatorStatus = 'normal'|'fault'|'maintenance'|'out_of_service'
export interface Elevator { id:string; number:number; type:ElevatorType; location:string; status:ElevatorStatus; lastInspection?:string; nextInspection?:string }

export interface ApiResponse<T> { success:boolean; data?:T; error?:string }
