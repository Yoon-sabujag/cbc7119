# Phase 14: Schedule Date Range - Context

**Gathered:** 2026-04-06
**Status:** Ready for implementation

<domain>
## Phase Boundary

법적 점검 등 연속 일정을 시작일/종료일 범위로 한번에 등록. SchedulePage AddModal 수정 + API handler 루프 INSERT.

</domain>

<decisions>
## Implementation Decisions

### UI 배치
- **D-01:** 기존 "날짜 | 시간" 행을 "시작일 | 시작시간"으로 라벨 변경
- **D-02:** 그 아래 행에 "종료일 | 종료시간" 추가 (동일 레이아웃)
- **D-03:** 전체 카테고리(점검/업무/행사/승강기/소방)에서 종료일 표시

### 미리보기
- **D-04:** 종료일 선택 시 "N일 일정이 추가됩니다" 텍스트 표시

### API
- **D-05:** 1일 1행 모델 유지 — handler에서 시작일~종료일 루프 INSERT
- **D-06:** DB 스키마 변경 없음

</decisions>

<specifics>
## Specific Ideas

사용자 원문: "날짜를 '시작일' 시간을 '시작시간'으로 표기, 종료일은 날짜칸 밑에, 종료시간은 시간칸 밑에"

</specifics>

<deferred>
## Deferred Ideas

None

</deferred>

---

*Phase: 14-schedule-date-range*
*Context gathered: 2026-04-06*
