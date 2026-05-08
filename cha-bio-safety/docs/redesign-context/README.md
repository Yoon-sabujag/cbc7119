# 페이지 재디자인 컨텍스트 패키지

CHA Bio Complex 방재 시스템의 30개 페이지를 디자인 시스템 v0.1.0 기준으로 페이지 단위 재디자인하기 위한 컨텍스트 묶음.

## 사용 방법

페이지 1개를 재디자인할 때마다 새 채팅을 열고:

1. **해당 페이지 폴더(예: `01-dashboard/`) 안의 파일을 모두 새 채팅에 드래그·첨부**
   - 폴더 안에 `.md` 컨텍스트 + 재디자인 대상 `.tsx` + `tokens.css` + `typography.css` + 관련 공통 컴포넌트 스냅샷이 모두 들어 있어 자기-완결적
2. **채팅 시작 — 추가 지시 없이 바로 재디자인 진행 가능**

> 폴더 안의 모든 파일은 작성 시점의 **스냅샷**. 작업이 며칠 이상 미뤄지면 원본이 바뀌었을 수 있으니 재생성 권장.

## 페이지 작업 권장 순서

진입 빈도/리스크/중요도 기준으로 8차로 나눔. 메인 워크플로우부터 시작해 점진적으로 외곽으로.

페이지마다 별도 git 브랜치 사용 권장:
```
git checkout -b redesign/01-dashboard
# 작업 후 머지하지 않고 일단 push
# 망쳐도 그 브랜치만 폐기하면 끝
```

## 진행 상황

### 1차 — 메인 워크플로우 (5개)
- [x] [01-dashboard](./01-dashboard/01-dashboard.md) — `/dashboard`
- [ ] [02-inspection](./02-inspection/02-inspection.md) — `/inspection` ⚠️ 5346 라인, 가장 큰 파일
- [ ] [03-qr-scan](./03-qr-scan/03-qr-scan.md) — `/inspection/qr`
- [ ] [04-remediation](./04-remediation/04-remediation.md) — `/remediation`
- [ ] [05-remediation-detail](./05-remediation-detail/05-remediation-detail.md) — `/remediation/:recordId`

### 2차 — 시설 관리 (4개)
- [ ] [06-floorplan](./06-floorplan/06-floorplan.md) — `/floorplan`
- [ ] [07-elevator](./07-elevator/07-elevator.md) — `/elevator` ⚠️ 3209 라인
- [ ] [08-elevator-finding-detail](./08-elevator-finding-detail/08-elevator-finding-detail.md) — `/elevator/findings/:fid`
- [ ] [09-extinguishers](./09-extinguishers/09-extinguishers.md) — `/extinguishers`

### 3차 — 모니터링 (3개)
- [ ] [11-div](./11-div/11-div.md) — `/div`
- [ ] [10-cctv-info](./10-cctv-info/10-cctv-info.md) — `/cctv`
- [ ] [23-education](./23-education/23-education.md) — `/education`

### 4차 — 법정점검 (3개)
- [ ] [19-legal](./19-legal/19-legal.md) — `/legal`
- [ ] [20-legal-findings](./20-legal-findings/20-legal-findings.md) — `/legal/:id`
- [ ] [21-legal-finding-detail](./21-legal-finding-detail/21-legal-finding-detail.md) — `/legal/:id/finding/:fid`

### 5차 — 근무/복지 (4개)
- [ ] [12-staff-service](./12-staff-service/12-staff-service.md) — `/staff-service`
- [ ] [13-schedule](./13-schedule/13-schedule.md) — `/schedule`
- [ ] [16-workshift](./16-workshift/16-workshift.md) — `/workshift`
- [ ] [17-annual-plan](./17-annual-plan/17-annual-plan.md) — `/annual-plan`

### 6차 — 문서/보고서 (5개)
- [ ] [14-reports](./14-reports/14-reports.md) — `/reports`
- [ ] [15-daily-report](./15-daily-report/15-daily-report.md) — `/daily-report`
- [ ] [18-worklog](./18-worklog/18-worklog.md) — `/worklog`
- [ ] [22-documents](./22-documents/22-documents.md) — `/documents`
- [ ] [25-qr-print](./25-qr-print/25-qr-print.md) — `/qr-print`

### 7차 — 관리자 (2개)
- [ ] [24-checkpoints](./24-checkpoints/24-checkpoints.md) — `/checkpoints`
- [ ] [26-staff-manage](./26-staff-manage/26-staff-manage.md) — `/staff-manage`

### 8차 — 유틸리티 (4개)
- [ ] [27-login](./27-login/27-login.md) — `/login`
- [ ] [28-splash](./28-splash/28-splash.md) — `/`
- [ ] [29-extinguisher-public](./29-extinguisher-public/29-extinguisher-public.md) — `/e/:checkpointId`
- [ ] [30-not-found](./30-not-found/30-not-found.md) — `*`

---

## 메모

- 파일 번호(01~30)는 page-spec.md의 진입 빈도 순서. 작업 권장 순서(1차~8차)는 별개의 우선순위.
- ⚠️ 표시된 페이지는 코드량이 매우 크므로 "1단계: 컨테이너만, 2단계: 카드만…" 식으로 단계별 진행 권장.
- 새 공통 컴포넌트가 필요해지면 `src/components/ui/`에 추가하고 컴포넌트 명세도 함께 출력하도록 채팅에 명시할 것.
- 한 페이지 작업이 끝나면 이 README의 체크박스를 `[x]`로 갱신.
