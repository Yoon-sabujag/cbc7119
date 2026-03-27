# Feature Landscape: Korean Building Fire Safety Management System

**Domain:** 건물 소방안전 통합관리 시스템 (Korean Building Fire Safety Facility Management PWA)
**Researched:** 2026-03-28
**Context:** Subsequent milestone — completing remaining features for 4-person fire safety team at CHA Bio Complex (Pangyo, Seongnam)
**Confidence:** MEDIUM-HIGH (primary sources: project design document, reference inspection forms, Korean fire safety regulatory knowledge; web search unavailable)

---

## What's Already Built (Do Not Rebuild)

| Feature | Status |
|---------|--------|
| JWT auth (employee ID + password, 4 accounts) | Done |
| Dashboard (inspection status, unresolved issues, schedule, elevator faults) | Done |
| Fire inspection (13 categories, zone/floor/location selection, result input, photos, action flow) | Done |
| QR scan inspection + QR print (inspection / public) | Done |
| Inspection schedule management (monthly calendar, CRUD) | Done |
| Excel report output — 4 types (flow detector, hydrant, clean agent, emergency outlet) | Done |
| Work shift schedule (3-shift auto-generation, manual adjustment) | Done |
| Annual leave management (apply/approve, balance calculation) | Done |
| DIV pressure management (34 measurement points, trend charts) | Done |
| Building floor plan (floor-by-floor fire facilities) | Done |
| Elevator fault recording/history | Done |

---

## Table Stakes

Features that are legally required or operationally expected. Absence = compliance failure or system unusability.

### TS-1: Excel Inspection Log Output — 6 Remaining Types

**Why expected:** Korean fire safety law (소방시설 설치 및 관리에 관한 법률) requires written records of all self-inspection activities. The facility already uses these 10 specific form types derived from the Ministry of Interior's standard forms. The 4 existing types are done; 6 remain.

| Log Type | Items | Format | Priority |
|----------|-------|--------|----------|
| Monthly Fire Pump Inspection Log (월간 소방펌프 점검일지) | 20 items, dual-column | Monthly, 양호/불량 symbols | Highest |
| Automatic Fire Detection System Log (자동화재탐지설비 점검일지) | 10 items | Annual (12-month column matrix), ○/△/× | High |
| Monthly Smoke Control System Log (월간 제연설비 점검일지) | 9 items | Annual (12-month column matrix), ○/△/× | High |
| Monthly Fire Shutter Log (월간 방화셔터 점검일지) | 9 items per shutter | Annual (12-month column matrix), ○/△/× | High |
| Monthly Evacuation/Fire Protection Facilities Log (월간 피난·방화시설 점검일지) | 9 items | Annual (12-month column matrix), ○/△/× | High |
| Daily Work Report / Disaster Prevention Log (일일업무일지 / 방재업무일지) | Work schedule, inspections, elevator history, fire events | Monthly, tabular + freeform | High |

**Complexity:** Medium per log type. The 12-month matrix types share a common structure — implement one template engine, reuse for 5 types. Fire pump log is structurally different (dual-column monthly format). Daily work report auto-populates from existing data (shifts, schedules, elevator faults).

**Dependencies:**
- TS-1 requires existing inspection records in DB (done)
- Daily work report requires work shifts module (done), elevator fault module (done), schedule module (done)
- Implementation: Excel template copy approach (established pattern from first 4 types) — copy `.xlsx` template → fill values using ExcelJS → download

**Implementation note:** Reference files available at `점검 항목/` directory. The 12-month matrix format (연간 형식) is shared across 5 types: row = inspection item, column = month (1-12), cells = ○/△/×. Use result mapping: 정상→○, 주의→△, 불량→×.

---

### TS-2: Legal Fire Safety Inspection Management (법적 점검 관리)

**Why expected:** Korean law mandates 소방시설 자체점검 (self-inspection) twice per year for buildings of this class. The facility manager (소방안전관리자) is legally responsible for scheduling, executing, documenting, and following up on deficiencies. Without this feature, the team has no systematic way to track the legally-mandated bi-annual comprehensive inspection cycle.

| Sub-feature | Details | Complexity |
|-------------|---------|------------|
| Legal inspection schedule registration | Date entry, inspection agency name, type (작동기능점검 / 종합정밀점검) | Low |
| Result and document management | Pass/fail/partial, PDF attachment in R2 | Low-Med |
| Deficiency (지적사항) tracking | Item list, responsible party, due date, completion status | Medium |
| Notification | Dashboard alert when inspection is overdue or within 30/7 days | Low |
| Next inspection auto-calculation | Based on previous inspection date + legal interval (6 months) | Low |

**Legal context (HIGH confidence from regulatory knowledge):**
- 작동기능점검 (functional inspection): once per year, can be done by the facility's own fire safety manager
- 종합정밀점검 (comprehensive precision inspection): once per year, must be done by licensed external inspector
- Total = 2 inspections per year minimum
- Results must be reported to the fire station (소방서) within specified timeframe
- Deficiency items (지적사항) must be remediated and documented

**Complexity:** Medium overall. The deficiency tracking sub-feature (linking findings to closure) is the most complex part. Suggest simple list-based approach — no workflow engine needed for 4 users.

**Dependencies:** Legal inspection management is largely independent. Dashboard integration requires dashboard modification (low effort).

---

### TS-3: Elevator Real Data Integration (승강기 실데이터 연동)

**Why expected:** Korea's elevator safety law (승강기 안전관리법) requires annual statutory inspection by KOELSA (한국승강기안전공단) or accredited body. The building has 17 elevators. The team already records faults; they need legal inspection records and annual schedule management tied to actual elevator data.

| Sub-feature | Details | Complexity |
|-------------|---------|------------|
| Legal inspection record per elevator | Date, inspector/agency, result (합격/불합격/조건부합격), certificate valid until | Medium |
| Annual inspection schedule management | Per-elevator inspection due date tracking, 30/7-day alerts | Medium |
| Monthly inspection checklist per elevator | Brake, door, safety devices, lighting, emergency comm — standard KOELSA checklist format | Medium |
| Inspection log Excel output | Legal inspection journal format for all 17 units | High |
| Historical inspection records | Multi-year lookup per elevator | Low |

**Context specifics:**
- 17 units: passenger elevators (8), freight (2), dumbwaiter (1), escalators (6)
- Escalators have separate inspection schedules from elevators
- Each unit has a unique registration number (고유번호) — already documented in design spec
- The team does NOT control inspection scheduling (handled by parent organization 차바이오재단 시설팀) — app receives and records, does not originate schedules

**Complexity:** Medium-High. The existing elevator fault module provides the foundation; extending it with inspection records and schedule management requires new DB tables and UI screens. Excel output for legal inspection log adds complexity.

**Dependencies:** Builds on existing `elevator_faults` table and `/elevator` route. Requires new `elevator_inspections` table (already designed in design spec but not implemented).

---

### TS-4: Admin Settings (관리자 설정)

**Why expected:** Without admin settings, the system cannot be maintained over time. Staff changes, facility additions, and system configuration require an admin interface.

| Sub-feature | Details | Complexity |
|-------------|---------|------------|
| User management | Password reset, role change for 4 accounts | Low |
| Fire facility inventory management | Add/edit/deactivate checkpoints, change quantities | Medium |
| System configuration | Building info, inspection period defaults | Low |
| QR code management | Regenerate QR codes, link to checkpoints | Low (QR print already exists) |

**Complexity:** Low-Medium. For a 4-person team, this does not need to be sophisticated. Focus on: password reset (admin can reset any account), checkpoint enable/disable (for when a facility is removed), and basic system settings.

**Scope constraint:** Do NOT build a full CRUD facility registration wizard. The facility data is stable — a simple enable/disable plus field edit is sufficient.

---

## Differentiators

Features that provide operational efficiency beyond legal minimum. Not expected by regulators but valued by the team.

### D-1: Daily Work Report Auto-Population (일일업무일지 자동 기재)

**Value proposition:** The daily work report (방재업무일지) is currently filled out manually every day. Auto-populating from existing data (today's scheduled inspections, elevator fault records, work shift assignments) eliminates ~10-15 minutes of daily data entry per report.

**What auto-populates:**
- Today's duty staff from work shift schedule
- Scheduled inspection items from schedule module
- Elevator fault entries from that day
- Fire-related events from inspection records

**What remains manual:**
- Free-text "특이사항" (notable events) field
- Any events not captured in the system

**Complexity:** Medium. Requires a report-composition API endpoint that queries multiple tables and assembles the report structure. The Excel output follows the `일일업무일지(00월).xlsx` template.

---

### D-2: Training / Continuing Education Tracking (보수교육 일정 관리)

**Value proposition:** Fire safety managers in Korea are required to complete continuing education (보수교육) every 2 years. Missing the deadline results in disqualification. This is currently tracked ad-hoc.

| Sub-feature | Details | Complexity |
|-------------|---------|------------|
| Training schedule registration | Course name, provider, date, per-person | Low |
| Completion recording | Date completed, certificate upload to R2 | Low |
| Dashboard reminder | Alert when training is due within 60/30 days | Low |
| History view | Past training records per staff member | Low |

**Legal context:** 소방안전관리자 보수교육 주기: 관리자 2년마다, 보조자 기준 동일. Education providers are approved by the National Fire Agency (소방청).

**Complexity:** Low. Simple CRUD with date-based alerting. The `trainings` table is already designed in the schema.

---

### D-3: Meal Tracking (식사 이용 기록)

**Value proposition:** The employer provides meals. Individual meal records are needed for monthly cost reconciliation. Currently tracked manually or on paper.

| Sub-feature | Details | Complexity |
|-------------|---------|------------|
| Daily meal entry | Lunch / dinner per person, per day | Low |
| Monthly summary per person | Count by meal type | Low |
| Admin monthly report | All-staff meal usage for expense reporting | Low |

**Complexity:** Low. The `meals` table is already designed. This is a simple log + aggregation feature. No approval workflow needed.

---

### D-4: Inspection Schedule ↔ Inspection Record Linkage (점검 일정 ↔ 점검 기록 연결)

**Value proposition:** Currently, inspection schedules and inspection records are separate — completing an inspection does not mark the corresponding schedule item as done. Linking them closes the loop: dashboard shows accurate completion rates and prevents double-counting.

**Implementation options (as noted in design doc):**
- Option A: Auto-match records to schedule items by date + category
- Option B: Manual link from inspection record to schedule item

**Recommendation:** Option A (auto-match) for simplicity — the 4-person team should not need to manually link every record. Auto-match on [inspection date + facility category]. Allow manual override for edge cases.

**Complexity:** Medium. Requires logic change in inspection submission flow and schedule display logic. Risk: false matches if categories don't align perfectly with schedule item definitions.

---

## Anti-Features

Features to deliberately NOT build during this milestone.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| AI daily report auto-writing (AI 자동작성) | Out of scope per PROJECT.md, 4단계 feature. Requires LLM integration, adds external dependency and cost | Manual text field in daily report; auto-populate structured data only |
| Fire safety plan auto-generation (소방계획서 자동생성) | Same — 4단계. Complex document generation, regulatory format compliance risk | Out of scope for this milestone |
| Mobile offline inspection support | Explicitly out of scope — network is sufficient, adds service worker complexity | Keep online-only; fail gracefully with user message |
| OAuth / social login | 4-person internal team, employee ID login is sufficient and simpler | Stay with JWT + employee ID |
| Push notifications for mobile | PWA push notifications on iOS remain unreliable below iOS 16.4, and the safe-area-inset issue is already permanently unresolved — avoid further PWA edge case work | In-app alerts and dashboard indicators only |
| Multi-building / multi-tenant support | This system is for one specific building. Generalizing adds UI and data model complexity for zero near-term benefit | Single building, hardcoded configuration |
| Public-facing compliance dashboard | The public-facing QR inspection history (소화기) already exists. No need to expand public access | Keep scope to existing public QR endpoint |
| Email / SMS alert system | External service dependency, added cost, team is on-site — in-app dashboard indicators and browser notifications sufficient | Dashboard alert cards |
| Barcode scanning (non-QR) | Adds library complexity. QR is already implemented and in use | QR only |
| Complex role permission matrix | 4 users, 2 roles (admin + staff). Simple role check is enough | Keep binary role check (admin / staff) |

---

## Feature Dependencies

```
TS-1 (Excel output 6 types)
  └── requires: inspection_records data (done)
  └── requires: work_schedules (done, for daily work report)
  └── requires: elevator_faults (done, for daily work report)
  └── requires: ExcelJS library (already in use for first 4 types)

TS-2 (Legal inspection management)
  └── requires: R2 storage (done, for document attachments)
  └── feeds into: Dashboard alert cards (done, needs new alert type)

TS-3 (Elevator real data)
  └── requires: elevators table (done)
  └── requires: elevator_faults table (done)
  └── new: elevator_inspections table (designed, not implemented)
  └── feeds into: Dashboard elevator fault card (done, needs inspection status)

TS-4 (Admin settings)
  └── requires: staff table (done)
  └── requires: check_points table (done)
  └── no blocking dependencies

D-1 (Daily work report auto-population)
  └── part of: TS-1 daily work log output
  └── requires: schedule_items (done), work_schedules (done), elevator_faults (done)

D-2 (Training tracking)
  └── requires: trainings table (designed, not implemented)
  └── feeds into: Dashboard reminder card (optional enhancement)

D-3 (Meal tracking)
  └── requires: meals table (designed, not implemented)
  └── no other dependencies

D-4 (Schedule ↔ record linkage)
  └── requires: schedule_items (done), inspection_records (done)
  └── feeds into: Dashboard completion stats (done, improves accuracy)
```

---

## MVP Recommendation for This Milestone

Given a 4-person internal team and the milestone goal (complete remaining features + deploy), prioritize in this order:

**Priority 1 — Ship these first (legally required / high operational value):**
1. TS-1: Excel output 6 types — highest daily-use value, legally required documentation
2. TS-2: Legal inspection management — legal compliance tracking
3. TS-3: Elevator real data / inspection management — legally required per 승강기 안전관리법

**Priority 2 — Ship these second (complete the system):**
4. TS-4: Admin settings — needed before deployment, but minimal scope
5. D-4: Schedule ↔ record linkage — closes the loop on existing features

**Priority 3 — Ship if time allows:**
6. D-2: Training tracking — simple, legally relevant
7. D-3: Meal tracking — simple, team-requested

**Defer permanently (this milestone):**
- D-1 (daily work report auto-population) is partially covered by TS-1 (the Excel output). Full auto-population is a refinement on top of basic Excel output — implement basic version first, enhance later.
- All anti-features listed above.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Excel output 6 types | Fire shutter log has 52 shutters — if each shutter gets its own row, the Excel template becomes very long and complex to generate | Confirm with team: do they need per-shutter rows or aggregated? Use existing `방화셔터.xlsx` reference file before coding |
| Daily work report | Auto-populating from multiple tables is easy to code but hard to make "feel right" — the report has freeform narrative sections the system cannot fill | Clearly separate auto-populated fields from manual entry areas in the UI |
| Elevator real data | 17 elevators × annual inspection records × multi-year history = potential for complex UI. KOELSA result codes have specific formats | Start with simple date + pass/fail + certificate upload. Don't over-engineer the result codes |
| Legal inspection management | Deficiency tracking requires status transitions (발견 → 조치중 → 완료). Without careful design this becomes a mini ticketing system | Keep it as a simple checklist with status column. No state machine needed |
| Admin settings | Checkpoint edit/disable must preserve historical inspection records (데이터 삭제 불가 원칙) | Soft-delete only (active flag), never hard delete checkpoints |
| Schedule ↔ record linkage | Auto-matching by date + category may fail when monthly inspection spans multiple days | Use month + year + category as the match key, not exact date |

---

## Sources

- Project design document: `/Users/jykevin/Documents/20260328/cbio_fire_system_design.md` (HIGH confidence — first-party design spec)
- Progress report: `/Users/jykevin/Documents/20260328/cbio_fire_progress_report_20260328.md` (HIGH confidence — current state of implementation)
- Reference inspection forms: `/Users/jykevin/Documents/20260328/점검 항목/` directory (HIGH confidence — actual forms in use)
- PROJECT.md requirements: `/Users/jykevin/Documents/20260328/.planning/PROJECT.md` (HIGH confidence)
- Korean fire safety law knowledge (소방시설 설치 및 관리에 관한 법률, 소방시설법): MEDIUM confidence (training data, ~August 2025 cutoff; verify against 국가법령정보센터 for current regulation text)
- Korean elevator safety law (승강기 안전관리법): MEDIUM confidence (same caveat)
- Continuing education (보수교육) requirements: MEDIUM confidence (known regulatory pattern, verify schedule via 한국소방안전원)
