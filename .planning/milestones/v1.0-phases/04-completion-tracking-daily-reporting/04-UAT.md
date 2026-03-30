---
status: testing
phase: 04-completion-tracking-daily-reporting
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md]
started: 2026-03-30T20:00:00.000Z
updated: 2026-03-30T20:00:00.000Z
---

## Current Test

number: 1
name: Cold Start Smoke Test
expected: |
  로컬 개발 서버를 종료하고 다시 시작합니다. `npm run dev:api`로 API 서버 시작 후 에러 없이 부팅되고, 브라우저에서 로그인 후 대시보드가 정상 로드됩니다.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: 로컬 개발 서버를 종료하고 다시 시작합니다. `npm run dev:api`로 API 서버 시작 후 에러 없이 부팅되고, 브라우저에서 로그인 후 대시보드가 정상 로드됩니다.
result: [pending]

### 2. 사이드메뉴 일일업무일지 접근
expected: 사이드메뉴(햄버거 메뉴)를 열면 '점검 기록' 섹션 아래에 '일일업무일지' 항목이 보입니다. 클릭하면 /daily-report 페이지로 이동합니다.
result: [pending]

### 3. 일일업무일지 날짜 선택 및 미리보기
expected: /daily-report 페이지에서 날짜 네비게이터(좌/우 화살표)로 날짜를 변경하면, 해당 날짜의 인원현황(총원/현재원/당직/비번 등)과 금일업무/명일업무 항목이 미리보기 카드에 표시됩니다.
result: [pending]

### 4. 일별 방재업무일지 엑셀 다운로드
expected: '일별' 모드 선택 상태에서 다운로드 버튼을 클릭하면, `방재업무일지(dd일).xlsx` 파일이 다운로드됩니다. 엑셀을 열면 해당 날짜, 금일업무 항목, 인원현황이 채워져 있습니다.
result: [pending]

### 5. 월별 일일업무일지 엑셀 다운로드
expected: '월별' 모드로 전환 후 다운로드 버튼을 클릭하면, `일일업무일지(mm월).xlsx` 파일이 다운로드됩니다. 엑셀을 열면 1일부터 오늘까지 각 날짜별 시트가 있고, 각 시트에 해당 날짜 데이터가 채워져 있습니다.
result: [pending]

### 6. 특이사항 입력 및 저장
expected: /daily-report 페이지에서 특이사항 텍스트 영역에 내용을 입력하고 '저장' 버튼을 클릭하면, 저장 완료 토스트가 표시됩니다. 다른 날짜로 이동했다가 돌아오면 저장한 내용이 그대로 남아있습니다.
result: [pending]

### 7. 대시보드 점검 일정 완료 표시
expected: 대시보드의 '오늘 일정' 영역에서, 오늘 점검 일정 중 실제 점검 기록이 있는 항목은 초록색 배경 틴트와 체크마크(✓)가 표시됩니다. 점검 기록이 없는 항목은 기본 상태로 표시됩니다.
result: [pending]

### 8. 비점검 일정 수동 완료 처리
expected: 대시보드 '오늘 일정'에서 점검(inspect) 카테고리가 아닌 일정(업무, 승강기 등) 옆에 '완료 처리' 버튼이 보입니다. 클릭하면 인라인 확인(확인/취소)이 나타나고, 확인 시 해당 일정이 완료 상태로 변경됩니다.
result: [pending]

## Summary

total: 8
passed: 0
issues: 0
pending: 8
skipped: 0
blocked: 0

## Gaps

[none yet]
