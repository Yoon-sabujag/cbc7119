# CHA Bio Complex 방재 시스템 — 페이지 스펙 (코드 기반 분석)

> 본 문서는 `src/pages/` 의 실제 구현을 코드 베이스에서 직접 읽어 정리한 사실 기반 카탈로그입니다. 디자인 제안이나 변경 권고는 포함하지 않으며, 관찰된 한계만 사실로 적시합니다.
>
> 기준 커밋: `c8bfa86`
> 기준 파일: `src/App.tsx` (라우트 정의), `src/utils/api.ts` (API 클라이언트), `functions/api/**` (Worker 핸들러)

---

## 페이지 (사용자 진입 빈도 순)

### 대시보드 (`/dashboard`)

**파일 위치:** `src/pages/DashboardPage.tsx`

**핵심 기능:**
- 오늘 근무자 칩(주간/당직/비번/휴무 + 연차/공가) 표시 — `getMonthlySchedule` 로컬 계산 + `/api/leaves` 조회 합성
- 통계 카드 4종: 점검 미완료 / 미조치 항목 / 오늘 일정 / 승강기 고장
- “오늘 점검 대상” 배너 + 최근 수신반 이력(48시간) 배너
- 빠른 도구 카드 4종(도면 점검, DIV 트렌드, 고장 접수, 직원 서비스)
- 오늘 일정 리스트(시간 확정/시간 미정 분리), 항목별 수동 완료 처리
- 이번 달 점검 현황 도넛(가로 스크롤, `Donut` 컴포넌트, DIV/컴프 항목은 `doubleCycle` two-lap)
- 근무자 칩 탭 시 전화/문자 액션시트
- 데스크톱 전용: 미니 캘린더(공휴일·일정 dot) + 우측 일정 패널

**사용하는 데이터/API:**
- D1 테이블 (서버 핸들러 기준 추정): `staff`, `schedule_items`, `check_records`, `inspection_sessions`, `annual_leaves`, `holidays`, `fire_alarm_records`, `elevator_faults`, `elevator_inspections`, `elevators`
- Worker 엔드포인트: `GET /api/dashboard/stats`, `GET /api/leaves?year=&month=`, `GET /api/fire-alarm?recent=1`, `PATCH /api/schedule/{id}` (완료 처리)
- 외부 API: 없음 (공휴일은 stats 응답에 포함되거나 fallback)

**주요 UI 요소:**
- 모바일: 5행 그리드(`근무자칩 → 배너 → 통계카드 → 빠른도구 → 오늘일정 → 월간도넛 가로스크롤`), Android 분기로 grid row 보정
- 데스크톱: 좌(점검현황+빠른도구) / 우(미니 캘린더+오늘 일정) 2열 레이아웃
- `DutyChip`, `RoleLabel`, `Donut`, `StatusBadge`, `CatBar` 사용 (`src/components/ui`)
- 전화/문자 BottomSheet 액션시트(인라인 구현)

**상태/인터랙션:**
- React Query: `staleTime: 30s`, `refetchInterval: 30s`, `refetchOnWindowFocus: true`
- 로딩 중: 빈 stats(0) 표시; API 실패 시 목업(MOCK_SCHEDULE) 폴백
- 빈 일정: `오늘 일정 없음`, 빈 월간 도넛: `이번 달 점검 일정 없음`
- 점검 미완료 카드 클릭 시 `/inspection` 으로 이동(오늘 일정에 inspect 카테고리가 있으면 `state.autoSelectCategory` 전달)

**현재 구현의 한계나 개선 여지:**
- 명시적 에러 상태 UI 없음 — API 실패 시 모바일은 목업, 데스크톱도 동일하게 목업 폴백으로 fallthrough
- 안드로이드용 그리드 보정 분기(`IS_ANDROID` 상수)가 곳곳에 박혀 있음 (의도된 우회임이 코드 주석으로 명시)
- 모바일 “이번 달 점검 현황”은 가로 스크롤이 의도된 디자인(메모리에 명시) — flex-wrap 으로 펼치면 안 됨

---

### 일반 점검 (`/inspection`)

**파일 위치:** `src/pages/InspectionPage.tsx` (≈5346 라인 — 단일 파일에 다수의 모달/헬퍼/데스크톱 뷰 포함)

**핵심 기능:**
- 16종 카테고리 그룹(특별피난계단, 청정소화약제, 전실제연댐퍼/연결송수관, 주차장비/회전문, 소방용전원공급반, 방화셔터, DIV, 컴프레셔, 유도등, 배연창, 완강기, 소화전/비상콘센트, 소화기, 소방펌프, 화재수신반, CCTV) 점검
- 카테고리 그룹별 전용 모달 다수 — `StairwellModal`(특별피난계단), `BaeyeonModal`(배연창), `CctvModal`(CCTV DVR 13대 일괄), 소화기/소화전/유도등/방화셔터/전실제연댐퍼 증상 피커 등 (`InspectionPage.tsx` 내부 정의)
- 결과 입력: 정상/주의/불량 (3종); 미조치/미확인 표시(`ALL_RESULT_OPTIONS`)
- WheelPicker(휠 스크롤) — 다수 CP 선택 UX
- 사진 첨부(점검자 사진) + 메모
- QR 진입 시 `state.qrCheckpoint` 으로 자동 선택
- 대시보드 진입 시 `state.autoSelectCategory` 자동 선택
- “이미 점검 완료된 항목입니다” 재진입 팝업(`InspectionRevisitPopup` — `useInspectionRevisitPopup` 훅)
- 접근불가 자동 스킵 안내(`AccessBlockedPopup`)
- 데스크톱 전용 `DesktopInspectionView` 분기 (단일 파일 내부)
- DIV/컴프 1:1 매핑 (`CP-DIV-X-Y` ↔ `CP-COMP-X-Y`) — 메모리에 명시된 룰을 본 페이지에서 강제
- 점검 완료 정의: `isCpCompleted = normal | caution | (bad+resolved)` 의 single source of truth (파일 상단 정의)

**사용하는 데이터/API:**
- D1 테이블: `check_points`, `check_records`, `inspection_sessions`, `floor_plan_markers`, `extinguishers`, `schedule_items`, `fire_alarm_records`
- Worker 엔드포인트:
  - `GET /api/inspections?date=`, `POST /api/inspections`, `POST /api/inspections/{sid}/records`
  - `GET /api/inspections/records?date=&month=`
  - `GET /api/checkpoints?floor=&zone=&qr=`
  - `GET /api/floorplan-markers?...`
  - `GET /api/extinguishers/{cpId}` (소화기 자산 상세)
  - `POST /api/inspections/records/{recordId}/resolve` (조치 완료)
  - `GET /api/remediation`, `POST /api/fire-alarm`, `GET /api/schedule?date=`
- 외부 API: 없음

**주요 UI 요소:**
- 상단: 카테고리 그룹 그리드 (이모지 + 라벨), `ZONE_CONFIG`(연구동/사무동/지하) 탭, 층 선택 칩
- 카테고리별 전용 모달 (다양한 폼 — 단일/다중 CP, 층별 일괄, DVR 13대 일괄 등 패턴 혼재)
- WheelPicker (3개 가시, item height 44px, scroll-snap)
- 결과 버튼(정상/주의/불량 — `INSPECT_RESULT_OPTIONS`)
- `PhotoButton`, 특이사항 textarea, 저장 버튼

**상태/인터랙션:**
- React Query 다수 쿼리 (`['inspections-records']`, `['checkpoints']`, `['markers']` 등)
- 모달은 `position:fixed` slide-up + `transform: translateY(...)` 애니메이션
- 저장 후 `setJustSaved(true)` 토스트 표시 + dashboard/remediation 캐시 무효화
- 카테고리 그룹별로 모달 패턴이 다름 (계단실은 일괄, 배연창은 zone+층+위치 3단계, CCTV는 13대 일괄, 일반은 휠피커 단일선택)

**현재 구현의 한계나 개선 여지:**
- 단일 파일이 5346 라인 — 카테고리별 모달이 한 파일에 인라인 구현, 공통 패턴 추출되어 있지 않음
- 카테고리별 결과 입력 폼/UI가 비슷하지만 미세하게 다름 (gap, padding, fontSize, button size 가 모달마다 다름)
- 카테고리별 증상 피커는 5종에만 존재 (유도등/소화기/소화전/방화셔터/전실제연댐퍼) — 나머지는 모두 직접 입력 (메모리에 의도된 패턴으로 명시)
- 모바일과 데스크톱 분기는 같은 파일 내 `DesktopInspectionView` 함수로 분리되어 있음 — 양쪽 동기화 부담
- 에러 상태 처리는 모달 내부에 `submitError` 박스로 일관 표시되지만, 페이지 레벨 에러 바운더리는 없음

---

### QR 스캔 (`/inspection/qr`)

**파일 위치:** `src/pages/QRScanPage.tsx`

**핵심 기능:**
- `html5-qrcode` 라이브러리로 카메라 QR 스캔
- iPhone Ultra Wide 카메라 자동 선택 (라벨 "ultra-wide / 초광각 / 울트라" regex 매칭)
- `track.applyConstraints` 로 zoom 0.5x 강제 (메인 카메라 광각 안전망, 미지원 시 무시) — 메모리에 명시된 패턴
- 권한 미부여 시 `getUserMedia({facingMode:'environment'})` 로 권한 프라임 후 재조회
- 수동 입력 모드(스캔 실패 시 fallback)
- QR 매칭 성공 시 `/inspection` 으로 `state.qrCheckpoint` 전달

**사용하는 데이터/API:**
- D1 테이블: `check_points` (qr_code 컬럼)
- Worker 엔드포인트: `GET /api/checkpoints?qr={qr}` (raw fetch — `api.get` 미사용, `useAuthStore` 토큰 직접 사용)
- 외부 API: 없음

**주요 UI 요소:**
- 카메라 영역(div#qr-reader-region) — 320px max width, 검은 배경, border-radius 20
- GlobalHeader portal slot (`#qr-header-portal-slot`)으로 카메라/수동입력 토글 버튼 주입
- 권한 거부 시 빨간 alert 박스 + 다시 시도 / 수동 입력 버튼
- 수동 입력: input + 조회 버튼

**상태/인터랙션:**
- 컴포넌트 마운트 시 `startCamera()`, 언마운트 시 `stopCamera()` (모든 미디어 트랙 강제 해제)
- 동일 QR 중복 처리 방지 `scannedRef`
- 로딩 상태: 카메라 위 검은 오버레이 + Spinner
- 에러 상태: `camError` (카메라) 와 `cpError` (조회 실패) 분리, 빨간 alert 박스로 표시

**현재 구현의 한계나 개선 여지:**
- iOS web 카메라는 `getUserMedia` 가 매크로 모드 자동 전환을 지원하지 않음 — deviceId 라벨 매칭 + zoom 트랙 제약으로만 가능 (메모리에 명시된 한계)
- raw fetch 사용 — `api.get` 의 자동 401 로그아웃 / cold-retry / telemetry 보고에서 제외됨

---

### 조치 관리 (`/remediation`)

**파일 위치:** `src/pages/RemediationPage.tsx`

**핵심 기능:**
- 불량/주의 점검 기록 목록 (탭: 전체/미조치/완료, 카테고리 드롭다운, 기간: 7/30/90/전체)
- URL 파라미터 `?tab=open|resolved|all` 지원 (대시보드 미조치 카드에서 진입)
- 카드 좌측 색 강조 (불량=빨강, 주의=주황) + 결과/상태 배지
- 카드 클릭: 모바일 → `/remediation/{id}` 이동, 데스크톱 → 우측 상세 패널 표시
- 데스크톱: 좌(50%) 목록 / 우(50%) 보고서 형태 상세 + 보고서 HTML 다운로드 / 사진 다운로드
- 보고서 다운로드는 클라이언트 사이드 HTML 생성 (`Blob` + `<a download>`)

**사용하는 데이터/API:**
- D1 테이블: `check_records`, `check_points`, `staff`, `floor_plan_markers`, `extinguishers`
- Worker 엔드포인트: `GET /api/remediation?status=&category=&days=`, `GET /api/remediation/{id}`, `GET /api/uploads/{key}` (사진)
- 외부 API: 없음

**주요 UI 요소:**
- 상단 sticky 탭 + 카테고리 select + 기간 버튼 그룹
- 카드 리스트 (모바일: 단일 컬럼, 데스크톱: 좌측 패널 50%)
- 데스크톱 우측: KV 테이블 + 조치 전/후 사진 그리드
- 빈 상태: `조치 항목 없음`
- 로딩 상태: 3개 skeleton 카드
- 에러 상태: 텍스트 메시지 (`목록을 불러오지 못했습니다`)

**상태/인터랙션:**
- React Query: `staleTime: 30s`, `refetchOnWindowFocus: true`
- URL searchParams로 탭 상태 영속화
- 보고서 다운로드: 사진을 base64로 fetch → HTML 임베드

**현재 구현의 한계나 개선 여지:**
- 보고서 다운로드 형식은 HTML 단일 (PDF/Excel 옵션 없음)
- 데스크톱 좌/우 분할은 50/50 고정
- 모바일/데스크톱 카드 렌더 함수가 일부 인라인으로 중복 (renderCard, 탭바 jsx 등)

---

### 조치 상세 (`/remediation/:recordId`)

**파일 위치:** `src/pages/RemediationDetailPage.tsx`

**핵심 기능:**
- 조치 상세 정보 표시 + 조치 내용 입력 폼
- 카테고리별 “조치 피커” 자동 선택 — 점검 시 입력된 증상(`record.memo`)에 따라 기본 조치 옵션 결정
  - 유도등: `점등 이상→본체 교체`, `예비전원 이상→예비전원 교체`
  - 소화기: `받침 파손→받침 교체`, `연한 만료→소화기 교체`
  - 소화전: `경종 파손→경종 교체`, `위치표시등 점등 이상→위치표시등 교체`, `호스걸이 파손→호스걸이 교체`
  - 방화셔터: `방화셔터 라인 표시 필요→방화셔터 라인 표시함`, `연동제어기 기판 작동 불→연동제어기 기판 교체`
  - 전실제연댐퍼: `기판 조작 불량→기판 교체`, `모터 기능 이상→모터 교체`
- 조치 → 자재 자동 채움(`materialName`, `materialCount`) — 5개 카테고리 모두 동일 패턴
- 조치 사진 첨부, 조치 메모 입력
- admin 전용: 조치 취소 (`/unresolve`), 점검 기록 삭제 (`/inspections/records/{id}`)
- 조치 완료 후 dashboard/remediation 캐시 invalidate, navigate(-1)

**사용하는 데이터/API:**
- D1 테이블: `check_records`, `check_points`, `extinguishers`
- Worker 엔드포인트:
  - `GET /api/remediation/{recordId}`
  - `POST /api/inspections/records/{recordId}/resolve` (resolution_memo, resolution_photo_key, materials_used)
  - `POST /api/inspections/records/{recordId}/unresolve` (admin 전용)
  - `DELETE /api/inspections/records/{recordId}` (admin 전용)
- 외부 API: 없음

**주요 UI 요소:**
- 자체 헤더 (높이 48, 뒤로가기 버튼 + “조치 상세” 타이틀, BottomNav 숨김)
- KV 행 컴포넌트(`KVRow`)
- 카테고리별 조치 피커 버튼 그룹 + 직접 입력 textarea
- 자재 입력(자재명 input + 수량 number input + ea suffix)
- `PhotoButton` (조치 사진)
- admin: 조치 취소 / 삭제 버튼 (텍스트 컬러 outline 스타일)
- 고정 하단 CTA 버튼 (조치 완료)

**상태/인터랙션:**
- 5종 카테고리에 대해 5개의 별도 `useEffect` 가 `actionPick` 변경 시 자재 자동 채움 — 메모리에 의도된 패턴으로 명시
- `resolve` 성공 시: `queryClient.invalidateQueries(['remediation', 'remediation-detail', 'dashboard'])` + `navigate(-1)`

**현재 구현의 한계나 개선 여지:**
- 5개 카테고리에 대한 useEffect/useState 분기가 `is{Category}` 5개로 중복 — 패턴은 동일
- 자재 자동 채움 시 사용자가 수동 수정 후 다시 카테고리 변경하면 덮어쓰기됨 (의도된 동작인지 코드만으로는 불명)

---

### 소방 시설 도면 (`/floorplan`)

**파일 위치:** `src/pages/FloorPlanPage.tsx` (≈2165 라인)

**핵심 기능:**
- 4종 도면 타입 탭: 유도등 / 감지기 / 스프링클러 / 소화기·소화전
- 13개 층 선택 (8-1F~B5)
- PDF 도면 + 마커 오버레이(layered SVG)
- 마커 추가/이동/삭제, 라벨 편집
- 마커 클릭 시 점검 모달 (재진입 팝업 포함)
- 소화기 마커: 자산(`extinguishers`) 매핑 — `placeAsset`, `assign`, `unassign`, `swap`, `dispose`
- 핀치줌 + 드래그 패닝
- 마커별 상태 색(uninspected/normal/caution/bad/resolved/fault)
- 소화기 교체 경고 표시(`getReplaceWarning`, REPLACE_WARNING_STROKE)
- 도면 재진입/접근불가 팝업

**사용하는 데이터/API:**
- D1 테이블: `floor_plan_markers`, `check_points`, `check_records`, `extinguishers`, `inspection_sessions`, `schedule_items`
- Worker 엔드포인트:
  - `GET /api/floorplan-markers?floor=&plan_type=`
  - `POST /api/floorplan-markers`, `PUT /api/floorplan-markers/{id}`, `DELETE /api/floorplan-markers/{id}`
  - `POST /api/floorplan-markers/{id}/place-asset` (자산 배치)
  - `GET /api/extinguishers/{cpId}`, `POST /api/extinguishers/{id}/{assign|unassign|swap|dispose}`
  - `POST /api/inspections/...` (점검 저장)
- 외부 API: 없음

**주요 UI 요소:**
- 상단 도면 타입 탭 + 층 선택 가로 스크롤
- 도면 컨테이너 (PdfFloorPlan 컴포넌트, 핀치줌)
- 마커: 7종 자산 마커 (유도등 6종, 감지기 2종, 스프링클러 4종, 소화기 7종)
- 마커 클릭 시 점검 모달 / 자산 정보 모달
- 마커 추가 모달 — 4종 옵션(소화기/소화전/완강기/DIV)
- `InspectionRevisitPopup`, `AccessBlockedPopup`

**상태/인터랙션:**
- React Query mutation 다수 (마커 CRUD, 자산 배치/해제/교체, 점검 저장)
- 핀치줌 + 드래그: 직접 touch event 핸들링
- 자산 배치 모드: URL `?fromMarker={id}&zone=&floor=` 컨텍스트 → `/extinguishers` 와 동행

**현재 구현의 한계나 개선 여지:**
- 단일 파일 2165 라인 — 마커 SVG 렌더링, 점검 모달, 자산 배치 모달 등 다수 인라인
- import 주석 처리된 `PdfFloorPlan`, `SvgFloorPlan` 가 파일 상단에 보임 (현재 사용 중인지 확인 필요)
- 데스크톱 분기 별도 함수 / 모바일과 분리됨

---

### 승강기 관리 (`/elevator`)

**파일 위치:** `src/pages/ElevatorPage.tsx` (≈3209 라인)

**핵심 기능:**
- 6개 탭: list(목록) / fault(고장) / repair(수리) / inspect(점검) / annual(연간) / safety(안전관리자)
- 11호기 엘리베이터 + 6대 에스컬레이터 관리
- 호기별 운행층 매핑(`EV_FLOORS`), 그룹 분류(투명/오렌지/기타/화물/덤웨이터)
- 에스컬레이터 노선도(`ES_NODES_FAULT`, `ES_NODES_ANNUAL`)
- 점검 항목 5종 (브레이크/도어/안전장치/조명/비상통화)
- 고장 신고 모달, 수리 등록 모달, 점검 기록 모달, 호기 상세 모달
- KOELSA(한국승강기안전공단) 검사 이력 연동 — `KoelsaHistorySection` 컴포넌트
- TKE 자동 연결 (고장 접수 시)
- 검사성적서 PDF 파싱 데이터 표시 (검사관/기관/판정/유효기간 등)
- URL 파라미터 `?modal=fault_new`, `?tab=fault` 등 지원

**사용하는 데이터/API:**
- D1 테이블: `elevators`, `elevator_faults`, `elevator_repairs`, `elevator_inspections`, `elevator_inspection_findings`, `elevator_inspect_history`, `elevator_inspect_fails`, `elevator_minwon_findings`, `koelsa_inspections`, `koelsa_safety_managers`, `koelsa_self_checks`, `koelsa_inspect_keys`
- Worker 엔드포인트:
  - `GET /api/elevators` (목록)
  - `GET /api/elevators/repairs?...`, `POST /api/elevators/repairs`, `PUT/DELETE`
  - `GET /api/elevators/next-inspection`
  - `GET/POST /api/elevators/{eid}/inspections/{iid}/findings`
  - `POST /api/elevators/{eid}/inspections/{iid}/findings/{fid}/resolve`
  - `GET /api/elevators/inspect-history`, `GET /api/elevators/koelsa-months`, `GET /api/elevators/koelsa-inspect`
  - `GET /api/elevators/safety-manager`, `GET /api/elevators/minwon-findings`
- 외부 API: KOELSA(한국승강기안전공단) `ElevatorInspectsafeService` — `_inspectsafe.ts` 핸들러 경유 (메모리에 명시된 연동, DB 캐싱)

**주요 UI 요소:**
- 자체 헤더 (탭 전환 + 검색)
- 호기 카드 그리드 (그룹별), 상태 배지(정상/고장/점검중/운행중지)
- 수리/점검 모달들 (`PhotoSourceModal` + `usePhotoUpload` + `PhotoButton`)
- 에스컬레이터 노선도 (좌/우 호기 + 층 라벨 행)
- 호기 상세 모달 — 전체 이력 타임라인(`EvDetailHistory` 타입)
- KOELSA 이력 카드 (`KoelsaHistorySection` — 판정 색 분기, expanded 토글)

**상태/인터랙션:**
- 다수 React Query 쿼리 (`['elevators']`, `['elevator-repairs']`, `['elevator-inspect-history']` 등)
- `useQueries` 로 일괄 조회
- 모달 종류: `null | 'fault_new' | 'fault_resolve' | 'inspect_new' | 'repair_new' | 'ev_detail'`
- 데스크톱: 페이지 자체 풍부한 헤더 → App.tsx 헤더 숨김(`DESKTOP_HEADER_HIDE_PATHS`)

**현재 구현의 한계나 개선 여지:**
- 단일 파일 3209 라인 — 6개 탭 + 5개 모달 + 호기 상세를 한 파일에서 관리
- KOELSA 연동은 DB 캐싱 + 데스크톱 미구현 (메모리에 명시)
- 검사성적서 PDF 파싱 데이터(0057 마이그레이션) 표시는 있으나 그 자체 페이지는 없음

---

### 승강기 지적사항 상세 (`/elevator/findings/:fid`)

**파일 위치:** `src/pages/ElevatorFindingDetailPage.tsx`

**핵심 기능:**
- 검사 지적사항 상세 + 조치 입력
- 이미지 뷰어(핀치줌, 드래그, 더블탭 줌) 인라인 구현
- 조치 메모 + 사진 등록 → 완료
- 점검 발견 사항(finding)의 조치 처리 워크플로우

**사용하는 데이터/API:**
- D1 테이블: `elevator_inspection_findings`, `elevator_inspections`, `elevator_repairs`
- Worker 엔드포인트:
  - `GET /api/elevators/{eid}/inspections/{iid}/findings/{fid}` (확인 필요 — `elevatorInspectionApi.getFindings` 만 list 형태로 노출)
  - `POST /api/elevators/{eid}/inspections/{iid}/findings/{fid}/resolve`
- 외부 API: 없음

**주요 UI 요소:**
- 자체 헤더 (BottomNav 숨김 — `/elevator/findings` 패턴 매칭)
- KVRow 정보 표시
- 이미지 뷰어 (zIndex 300, position fixed, 검은 배경)
- `PhotoSourceModal` + `usePhotoUpload`

**상태/인터랙션:**
- useParams 로 fid 파싱
- `useMutation` 으로 resolve 처리

**현재 구현의 한계나 개선 여지:**
- 503 라인 — 이미지 뷰어가 인라인 구현됨(`PhotoGrid` 의 yet-another-react-lightbox 와 분리)
- 라우트 매개변수가 `:fid` 만이라 elevatorId / inspectionId 는 finding 객체에서 추출해야 함

---

### 소화기 관리 (`/extinguishers`)

**파일 위치:** `src/pages/ExtinguishersListPage.tsx` (≈1168 라인)

**핵심 기능:**
- 4탭: 전체 / 미배치(unmapped) / 배치(mapped) / 폐기(disposed)
- 필터: zone(연구동/사무동/지하), 층, 종류, 검색어
- 자산 등록(create), 정보 수정(update — type/prefix_code/seal_no/serial_no/approval_no/manufactured_at/manufacturer)
- 위치 매핑(assign), 분리(unassign), 두 자산 위치 스왑(swap), 폐기(dispose), hard delete(remove — 미매핑+미점검만)
- `?fromMarker=` 쿼리 진입: 도면 페이지에서 빈 마커에 자산 배치 위해 동행 진입
- GlobalHeader portal slot으로 “+ 새로 등록” 버튼 주입
- 통계 (종류별 갯수, zone/floor 목록)
- 교체 경고 (`getReplaceWarning` — 제조일 기준 만료 도래)

**사용하는 데이터/API:**
- D1 테이블: `extinguishers`, `check_points`, `floor_plan_markers`, `check_records`
- Worker 엔드포인트:
  - `GET /api/extinguishers?floor=&zone=&type=&q=&status=&mapping=`
  - `POST /api/extinguishers/create`
  - `PUT /api/extinguishers/{id}`, `DELETE /api/extinguishers/{id}`
  - `POST /api/extinguishers/{id}/assign`, `/unassign`, `/swap`, `/dispose`
- 외부 API: 없음

**주요 UI 요소:**
- 상단: 탭 / zone select / floor select / type select / 검색 input
- 카드 리스트: mgmt_no, type, location, 교체 경고 배지
- 카드 expand → 상세 정보 + 액션 버튼들
- 등록/수정 모달 (`registerOpen`, `editTarget`)
- 확인 모달들: `confirmDelete`, `confirmDispose`, `confirmUnassign`, `swapTarget`
- 모바일/데스크톱 분기 (`useIsDesktop`)

**상태/인터랙션:**
- React Query: list 쿼리 + 다수 mutation
- 모바일에서는 BottomNav 가 보이지만, 헤더 좌측에 뒤로가기 버튼 표시 (`MOBILE_NO_NAV_PATHS` 미포함이지만 App.tsx 에서 `isExtinguishers` 분기로 backBtn 주입)
- skeleton 카드 로딩

**현재 구현의 한계나 개선 여지:**
- 1168 라인 — 등록 모달, 수정 모달, 4종 확인 모달이 모두 한 파일에 인라인
- mapping 상태가 `unmapped-clean | unmapped-inspected | mapped | disposed` 4종으로 분기 — 사용자에게 노출되는 탭은 4개

---

### CCTV 현황 (`/cctv`)

**파일 위치:** `src/pages/CctvInfoPage.tsx` (69라인)

**핵심 기능:**
- DVR 13대(`CCTV_DVRS`) 카드 표시
- 각 DVR: 채널수, 녹화구역 설명, 보존기간(추정/확정 배지), HDD 포트별 용량/교체일자, 합계
- 정적 데이터 페이지 (`src/utils/cctv.ts` import)

**사용하는 데이터/API:**
- D1 테이블: 없음 (정적 데이터)
- Worker 엔드포인트: 없음
- 외부 API: 없음

**주요 UI 요소:**
- 카드 그리드 (모바일 1열 / 데스크톱 2열, max-width 960)
- DVR 카드: 헤더(라벨+채널+보존기간 배지) + 녹화구역 + 포트 그리드(포트/용량/교체일자)
- 하단: `출처: CCTV 녹화 설비 현황 {CCTV_INFO_UPDATED}`

**상태/인터랙션:**
- 상태 없음 — 순수 표시
- 모바일: BottomNav 숨김(헤더에 뒤로가기 버튼 — App.tsx `isCctv` 분기)
- 데스크톱: 사이드바 노출

**현재 구현의 한계나 개선 여지:**
- 정적 데이터 — DB에 동기화되지 않음
- 모바일에서는 SideMenu 미노출(메뉴 항목이 `desktopOnly: true`), CCTV 점검 모달 헤더 “설비 현황” 버튼으로만 진입 가능

---

### DIV 압력 관리 (`/div`)

**파일 위치:** `src/pages/DivPage.tsx` (≈1136 라인)

**핵심 기능:**
- 4탭: 압력 트렌드 / 챔버배수주기 / 오일 주기 / 탱크배수주기
- 34개 측정점(`DIV_POINTS`) — 1차압/2차압/챔버압
- 이상값 감지: 직전 대비 ±10%(주의), ±20%(불량) — `pressureStatus()`
- 층별 그룹 (pos 1→2→3 순, 층 내림차순)
- 최근 12개월 트렌드 차트(SVG inline)
- 기록 간격 막대차트 (`IntervalBar` — 최근 6건 기준 5개 간격)
- DIV 챔버 배수 / 컴프레셔 오일 보충 / 컴프레셔 탱크 배수 이력 입력 모달

**사용하는 데이터/API:**
- D1 테이블: `div_pressures`, `div_drain_log`, `div_compressor_log`, `comp_drain_log`, `comp_inspections`
- Worker 엔드포인트:
  - `GET /api/div/pressure?year=` (raw fetch — `api.get` 미사용, `authHeader()` helper 사용)
  - `GET /api/div/logs?type=drain|compressor|comp_drain`
  - `POST /api/div/logs` (확인 필요)
  - `GET/POST /api/div/comp-inspection`
- 외부 API: 없음

**주요 UI 요소:**
- 자체 헤더 (App.tsx 헤더 숨김 — `DESKTOP_HEADER_HIDE_PATHS`)
- 탭 4종 + 연도 필터
- 측정점 카드 (1차압/2차압/챔버압 + 트렌드 차트)
- 간격 막대차트 (최근 6건)

**상태/인터랙션:**
- React Query 쿼리 다수
- 이상값 색 분기 (`STATUS_COLOR`)

**현재 구현의 한계나 개선 여지:**
- 1136 라인 — 4개 탭 모두 한 파일
- raw fetch 다수 — `api.get` 의 자동 retry / 401 처리 미적용
- 설정압 컬럼 없음 — 직전 대비 편차로 이상값 판정 (코드 주석에 “향후 세팅압 컬럼 추가 시 개선” 명시)

---

### 연차 및 식사 (`/staff-service`)

**파일 위치:** `src/pages/StaffServicePage.tsx` (≈1552 라인)

**핵심 기능:**
- `/leave`, `/meal` 은 별도 라우트가 아님 — 본 페이지가 통합 관리 (`/leave` 는 App.tsx PAGE_TITLES 와 MOBILE_NO_NAV_PATHS 에 있지만 라우트는 없음 — `<Route>` 로 등록되지 않음)
- 연차 등록/삭제, 식사 ‘안 먹은 끼수’ upsert
- 휴가 종류 11종 (연차/오전반차/오후반차/공가/공가오전/공가오후/경조/병가공상/병가사상/보건/기타특별)
- 휴가 신청서 PDF 오버레이 생성 (`generateLeaveRequest.ts`) — 메모리에 명시된 회사 양식 PDF + pdf-lib 좌표 오버레이 패턴
- 입사일 기반 연차 quota 계산 (`calcLeaveQuota`)
- 주말/공휴일 제외 근무일수 계산 (반차는 0.5)
- 주간 식단표 / 일일 식단 표시 (`menuApi`)
- 식대 계산: 5500원/끼, 식당 운영 일정, 공휴일/공휴일직후토요일 보정 (메모리에 운영 규칙 명시)
- 휴가 신청서 미리보기 (PDF.js 렌더 + 좌표 오버레이 정합성 시각화)

**사용하는 데이터/API:**
- D1 테이블: `annual_leaves`, `meal_records`, `weekly_menus`, `staff`, `holidays`, `schedule_items`
- Worker 엔드포인트:
  - `GET/POST/DELETE /api/leaves`
  - `GET/POST /api/meal`
  - `GET/POST /api/menu`
  - `GET /api/holidays?year=`, `POST /api/holidays/sync`
  - `GET /api/schedule?month=` (휴가일 자동 등록 시)
- 외부 API: `https://holidays.hyunbin.page/basic.json` (한국 공휴일) — `HOLIDAYS_FALLBACK` 보강 (메모리에 라이브러리 누락 패턴 명시)

**주요 UI 요소:**
- 좌(달력) 중앙(휴가종류 그리드) 우(휴가 신청서 미리보기) — 데스크톱 3패널
- 모바일: 단일 컬럼, BottomSheet 로 휴가 등록
- 휴가 종류 버튼 그리드 (DOC_LEAVE_GRID — 7행)
- PDF.js 렌더링(`pdfjs-dist` worker) + 오버레이 좌표(`lp` 17개 인덱스)
- 식단 카드, 식대 합산, 주말 수당 (`calcWeekendAllowance`)

**상태/인터랙션:**
- React Query: leaves, meal, menu, holidays, staff
- 휴가 신청서 PDF 다운로드(`generateLeaveRequest`) / 인쇄(`printLeaveRequest`)
- 모바일 휴가 종류 BottomSheet 와 데스크톱 패널 폼 분리

**현재 구현의 한계나 개선 여지:**
- 1552 라인 — 휴가 등록 / 식사 / 식단 / PDF 미리보기 / PDF 생성을 모두 한 파일에서 관리
- `/leave` 와 `/meal` 라우트는 App.tsx PAGE_TITLES/MOBILE_NO_NAV_PATHS 에는 있지만 실제 `<Route>` 등록은 없음 — 사용자가 직접 URL 입력 시 NotFoundPage 매칭됨

---

### 월간 점검 계획 (`/schedule`)

**파일 위치:** `src/pages/SchedulePage.tsx` (≈1062 라인)

**핵심 기능:**
- 월간 캘린더 (캘린더 셀 클릭 시 일자별 일정 표시)
- 일정 등록/수정/삭제, 상태 변경(예정/진행중/완료/지연)
- 카테고리 5종(점검/업무/행사/승강기/소방) — 각각 색상 dot
- 점검 카테고리 19종(`INSP_CATEGORIES`) + 카테고리별 기본 제목/메모(`INSP_DEFAULTS`)
- 승강기 sub-category 3종, 소방 sub-category 4종 + 업체명 자동 매핑(`ELEV_AGENCY`, `FIRE_AGENCY`)
- 월간 계획 자동 생성 (`generateMonthlyPlan` — 1년치 수동 패턴 자동 생성)
- 외부 공휴일 API + fallback
- 일정 멀티데이 범위 처리 (주말/공휴일 자동 제외)

**사용하는 데이터/API:**
- D1 테이블: `schedule_items`, `holidays`
- Worker 엔드포인트: `GET /api/schedule?date=&month=`, `POST /api/schedule`, `PATCH /api/schedule/{id}` (status), `PUT /api/schedule/{id}`, `DELETE`
- 외부 API: `https://holidays.hyunbin.page/basic.json`

**주요 UI 요소:**
- 자체 헤더 (BottomNav 숨김 — `MOBILE_NO_NAV_PATHS`)
- 월간 캘린더 (7x6 그리드), 카테고리 dot
- 일자별 일정 리스트
- 등록/수정 모달
- 월간 점검 계획 미리보기 행 (`PLAN_PREVIEW_ROWS` 21항목)

**상태/인터랙션:**
- React Query: `['schedule', curMonth]`, `['holidays']`
- 일정 멀티데이 범위 매칭 함수(`matchesDate`)

**현재 구현의 한계나 개선 여지:**
- 1062 라인 — 캘린더 + 미리보기 + 등록 모달 + 자동 생성 모두 한 파일
- 상태 변경 후 `dashboard` 캐시 invalidate 명시적

---

### 점검 일지 출력 (`/reports`)

**파일 위치:** `src/pages/ReportsPage.tsx` (405 라인)

**핵심 기능:**
- 10종 보고서 출력 (DIV 월초/월말, 소화전, 청정소화약제, 비상콘센트, 피난방화, 방화셔터, 제연, 자탐, 소방펌프)
- 연도/월 선택, Excel 다운로드
- `xlsx-js-style` 기반 템플릿 패칭 — 기존 양식 파일과 호환
- 보고서별 미리보기 이미지 + 행/열 그리드 오버레이 (`ExcelPreview`)
- 자탐/방화셔터/제연: 점검자 누락 시 ASSISTANTS 3명 중 랜덤 채움

**사용하는 데이터/API:**
- D1 테이블: `check_records`, `check_points`, `staff`
- Worker 엔드포인트: `GET /api/reports/div?year=&timing=`, `GET /api/reports/check-monthly?year=&category=`
- 외부 API: 없음

**주요 UI 요소:**
- 자체 헤더 (BottomNav 숨김)
- 카드 그리드 (10종 보고서)
- 미리보기 패널 (`ExcelPreview`)
- 다운로드 버튼

**상태/인터랙션:**
- 다운로드 시 `generateDivExcel`/`generateCheckExcel`/`generateMatrixExcel`/`generatePumpExcel` 호출 (`src/utils/generateExcel.ts`)

**현재 구현의 한계나 개선 여지:**
- 데스크톱/모바일 분기 (`useIsDesktop`)
- 점검자 자동 채움(랜덤 배치)이 자탐/방화셔터/제연만 적용 — 다른 보고서는 없음

---

### 일일 업무 일지 (`/daily-report`)

**파일 위치:** `src/pages/DailyReportPage.tsx` (840 라인)

**핵심 기능:**
- 날짜 선택(전일/금일/익일 화살표, 캘린더 input)
- 자동 데이터 집계: 일정/연차/승강기 고장/조치/컴프 오일 보충 (`buildDailyReportData`)
- 수동 입력: 금일 업무, 명일 업무, 비고
- 자동 저장 (디바운스)
- Excel 다운로드 (`generateDailyExcel`)
- 월별 일괄 다운로드 옵션
- 미래 날짜는 비활성화

**사용하는 데이터/API:**
- D1 테이블: `daily_notes`, `schedule_items`, `annual_leaves`, `elevator_faults`, `check_records`, `div_compressor_log`
- Worker 엔드포인트:
  - `GET /api/daily-report?date=`, `GET/POST /api/daily-report/notes?date=`
  - `GET /api/daily-report/notes?year=&month=` (월별)
- 외부 API: 없음

**주요 UI 요소:**
- 자체 헤더 (BottomNav 숨김)
- 카드 형태 섹션 (자동 데이터 / 수동 입력)
- textarea(자유 입력)
- Excel 다운로드 버튼 + 월별 일괄 토글

**상태/인터랙션:**
- 디바운스 저장(`debounceRef`)
- React Query: `['daily-report', date]`, `['daily-notes', date]`

**현재 구현의 한계나 개선 여지:**
- 840 라인 — 자동 집계 + 수동 입력 + Excel 생성 한 파일
- gcTime: 0 (notes) 로 캐시 비활성화 — 폼 즉시 반영 의도

---

### 월간 출근부 (`/workshift`)

**파일 위치:** `src/pages/WorkShiftPage.tsx` (226 라인)

**핵심 기능:**
- 직원 4명 × 한 달 일자 매트릭스 (당직/비번/주간/휴무)
- 연/월 선택
- 오늘 셀 자동 가운데 스크롤
- Excel 다운로드 (`generateShiftExcel`)
- 공휴일 빨간색 표시
- 직원 정렬 순서 고정 (`STAFF_ORDER` — 석현민/김병조/윤종엽/박보융)

**사용하는 데이터/API:**
- D1 테이블: `staff` (shift_offset, shift_fixed)
- Worker 엔드포인트: `GET /api/staff` (직원 목록)
- 외부 API: `https://holidays.hyunbin.page/basic.json`

**주요 UI 요소:**
- 자체 헤더 (App.tsx 헤더 숨김 — `DESKTOP_HEADER_HIDE_PATHS`)
- 좌측 고정 이름 컬럼 + 우측 가로 스크롤 날짜 컬럼
- 셀: 당/비/주/휴 텍스트 + 색
- 범례 (4종)
- 데스크톱: padding-top 12vh

**상태/인터랙션:**
- 클라이언트 사이드 shift 계산(`getMonthlySchedule`) — DB 저장 없음, offset 기반 사이클
- React Query: holidays (24h staleTime)

**현재 구현의 한계나 개선 여지:**
- 점검 카테고리와 무관 — 인사 정보만
- 클라이언트 계산만 — 서버 검증 없음

---

### 연간 업무 추진 계획 (`/annual-plan`)

**파일 위치:** `src/pages/AnnualPlanPage.tsx` (225 라인)

**핵심 기능:**
- 다음 연도 연간 계획서 Excel 다운로드 (`generateAnnualPlan`)
- 미리보기 PNG (`/templates/preview/annual-plan.png`) + 연도 위치 보정 모드
- 연도 위치는 localStorage(`annual_plan_year_pos`)에 저장
- 클릭(데스크톱) / 터치(모바일, FINGER_OFFSET 60px 보정) 으로 좌표 입력

**사용하는 데이터/API:**
- D1 테이블: 없음 (템플릿 파일만)
- Worker 엔드포인트: 없음
- 외부 API: 없음

**주요 UI 요소:**
- 자체 헤더 (BottomNav 숨김)
- 미리보기 이미지 (calibrate 모드일 때 testor cursor)
- 연도 오버레이 (절대 위치)
- 다운로드 버튼

**상태/인터랙션:**
- 모바일/데스크톱 분기 (상하 vs 단일 컬럼)
- 캘리브 모드 토글

**현재 구현의 한계나 개선 여지:**
- 정적 미리보기 — 실제 Excel 출력과 좌표 정합성은 사용자 수동 보정에 의존

---

### 업무 수행 기록표 (`/worklog`)

**파일 위치:** `src/pages/WorkLogPage.tsx` (≈1216 라인)

**핵심 기능:**
- 월별 업무 수행 기록표 (소방안전관리자 의무기록)
- 4개 점검 항목(소방시설/피난시설/가스시설/기타) 각 내용/결과(ok|bad)/조치
- 보고 정보(년/월/일, 보고방법: 면담/서면/통신, 시정방법: 이전/제거/수리/기타)
- Excel 다운로드 (`generateWorkLogExcel`)
- admin 전용
- 작성 가능 월 목록 + 미리보기

**사용하는 데이터/API:**
- D1 테이블: `work_logs`
- Worker 엔드포인트: `GET /api/work-logs`, `GET/PUT /api/work-logs/{ym}`, `GET /api/work-logs/{ym}/preview`
- 외부 API: 없음

**주요 UI 요소:**
- 월 선택 + 좌(폼) 우(미리보기) 패널
- 4개 카드 섹션 (점검 항목별)
- textarea/select 폼 다수
- iconBtn / navBtn / smallBtn 등 인라인 스타일 상수 정의

**상태/인터랙션:**
- React Query: `['worklog', ym]`
- admin 권한 체크 (`isAdmin`)
- 폼 상태 14개 useState

**현재 구현의 한계나 개선 여지:**
- 1216 라인 — admin 전용임에도 폼 입력 / 미리보기 / Excel 생성 모두 인라인
- 비-admin 사용자가 진입 시 처리: 코드 상단만 봐서는 명확치 않음 (상세 로직 확인 필요)

---

### 소방 점검 관리 (`/legal`)

**파일 위치:** `src/pages/LegalPage.tsx` (553 라인)

**핵심 기능:**
- 법정 소방점검(상반기 종합/하반기 작동) 라운드 목록
- 탭: 전체/미조치/완료
- 연도 필터
- 라운드별 결과 입력(적합/부적합/조건부적합)
- 검사보고서 PDF 업로드(`report_file_key`)
- 데스크톱: 라운드 목록 + 지적사항 패널 (좌→우)

**사용하는 데이터/API:**
- D1 테이블: `legal_findings`, `schedule_items` (legal sub-category 인 항목)
- Worker 엔드포인트:
  - `GET /api/legal?year=`, `GET /api/legal/{id}`
  - `PATCH /api/legal/{id}` (result, report_file_key)
- 외부 API: 없음

**주요 UI 요소:**
- 자체 헤더 (BottomNav 숨김 시 사용자 측면이 다름 — `MOBILE_NO_NAV_PATHS` 에 `/legal` 포함됨)
- 라운드 카드 (좌측 색 강조 — `accentColor` by result)
- `ResultBadge` (적합/부적합/조건부적합 — 미입력은 회색)
- 데스크톱: `FindingsPanel` 컴포넌트 (지적사항 list + 결과 입력 + 업로드)

**상태/인터琴션:**
- React Query: `['legal-rounds']`, `['legal-round', id]`, `['legal-findings', id]`
- skeleton 로딩

**현재 구현의 한계나 개선 여지:**
- 보고서 파일 업로드는 R2 직접 — multipartUpload 없이 `api.put` 으로 전송하는지 확인 필요
- 모바일에서는 라운드 클릭 시 `/legal/:id` 이동, 데스크톱은 같은 페이지에서 패널 표시

---

### 법정점검 지적사항 목록 (`/legal/:id`)

**파일 위치:** `src/pages/LegalFindingsPage.tsx` (643 라인)

**핵심 기능:**
- 라운드별 지적사항 목록
- 신규 지적사항 등록 (BottomSheet — `FindingBottomSheet`)
- 등록 폼: zone(연구동/사무동/브릿지/지하), 층, 위치 상세, 점검 항목 picker(19종 + 직접입력), 설명, 사진 다중
- 점검 항목 picker(`FINDING_ITEMS`): 감지기 3종/방화문/방화셔터/비상방송설비/비상콘센트/DIV/소방펌프/소화기/소화전/스프링클러/시각경보기/완강기/유도등/자동화재탐지설비/전실제연댐퍼/청정소화약제

**사용하는 데이터/API:**
- D1 테이블: `legal_findings`, `schedule_items`, `staff`
- Worker 엔드포인트:
  - `GET /api/legal/{id}/findings`
  - `POST /api/legal/{id}/findings` (description, location, photo_keys[])
  - `DELETE /api/legal/{id}/findings/{fid}`
- 외부 API: 없음

**주요 UI 요소:**
- 자체 헤더 (BottomNav 숨김 — `/legal/...` 매칭)
- 카드 리스트 (지적사항)
- BottomSheet 등록 폼
- `useMultiPhotoUpload` + `PhotoGrid` (다중 사진)
- `PhotoSourceModal`

**상태/인터랙션:**
- 폼 상태 다수 useState
- React Query mutation

**현재 구현의 한계나 개선 여지:**
- 643 라인 — BottomSheet 폼이 한 파일에 인라인
- 다중 사진 업로드 UX 일관성: `useMultiPhotoUpload` 사용 (소화기 점검의 단일 `usePhotoUpload` 와 다름)

---

### 법정점검 지적사항 상세 (`/legal/:id/finding/:fid`)

**파일 위치:** `src/pages/LegalFindingDetailPage.tsx` (279 라인)

**핵심 기능:**
- 지적사항 상세 + 조치 입력
- 조치 메모 + 사진 다중 등록 → 완료
- 메타 텍스트 다운로드(`buildMetaTxt`)

**사용하는 데이터/API:**
- D1 테이블: `legal_findings`
- Worker 엔드포인트:
  - `GET /api/legal/{id}/findings/{fid}`
  - `PUT /api/legal/{id}/findings/{fid}` (수정)
  - `POST /api/legal/{id}/findings/{fid}/resolve` (조치 완료)
- 외부 API: 없음

**주요 UI 요소:**
- 자체 헤더 + 뒤로가기
- KV 행 + Section 헤더
- `useMultiPhotoUpload` + `PhotoGrid`
- 다운로드 버튼

**상태/인터랙션:**
- React Query: `['legal-finding', id, fid]`
- `useMutation` 으로 resolve

**현재 구현의 한계나 개선 여지:**
- 사진 다중 — RemediationDetailPage 의 단일 사진과 패턴 다름
- 자체 헤더 vs 다른 상세 페이지(RemediationDetail 등)와 헤더 스타일 미세 차이

---

### 소방계획서/훈련자료 (`/documents`)

**파일 위치:** `src/pages/DocumentsPage.tsx` (162 라인)

**핵심 기능:**
- 소방계획서(plan) / 소방훈련자료(drill) 2종 문서 관리
- 모바일: 탭 전환, 데스크톱: 좌우 2단 동시 표시 (max 1200px)
- 업로드 폼 — 모바일은 BottomSheet, 데스크톱은 모달
- multipart 업로드 (5MB 단위)
- admin 전용 업로드/삭제

**사용하는 데이터/API:**
- D1 테이블: `documents`
- Worker 엔드포인트:
  - `GET /api/documents?type=`
  - `POST /api/documents/multipart/create`, `PUT .../upload-part`, `POST .../complete`, `POST .../abort`
  - `DELETE /api/documents/{id}`
- 외부 API: 없음 (R2 multipart)

**주요 UI 요소:**
- `DocumentSection` (per-type, hero card + 과거 이력)
- `DocumentUploadForm` (year + title + file)
- 업로드 backdrop click no-op (취소 버튼 강제 — beforeunload guard 동작)

**상태/인터랙션:**
- React Query: `['documents', type]`
- 업로드 progress (`ProgressState`), abort/retry, beforeunload guard

**현재 구현의 한계나 개선 여지:**
- 162 라인 — 컨테이너만, 실제 로직은 컴포넌트(`DocumentSection`, `DocumentUploadForm`)로 분리 (다른 페이지보다 분리도 양호)

---

### 보수교육 (`/education`)

**파일 위치:** `src/pages/EducationPage.tsx` (591 라인)

**핵심 기능:**
- 직원별 보수교육 이력
- D-day 계산: 선임일 6개월 후 첫 실무교육, 이후 2년마다 보수교육
- D-day 배지 색 분기 (>30일 안전, 0~30일 주의, <0 초과)
- 교육 기록 등록/수정/삭제
- 직급 정렬 (`TITLE_ORDER` — 주임/대리/기사/기타)

**사용하는 데이터/API:**
- D1 테이블: `education_records`, `staff`
- Worker 엔드포인트: `GET /api/education`, `POST/PUT/DELETE /api/education[/{id}]`
- 외부 API: 없음

**주요 UI 요소:**
- 자체 헤더 (BottomNav 숨김)
- 직원 카드 (D-day 배지 + 교육 이력 리스트)
- 등록 모달

**상태/인터랙션:**
- React Query: `['education']`
- D-day 계산 (`date-fns` `addMonths`/`addYears`/`differenceInCalendarDays`)

---

### 소방 시설 추가 (`/checkpoints`)

**파일 위치:** `src/pages/CheckpointsPage.tsx` (693 라인)

**핵심 기능:**
- 점검 대상(check_points) 신규 등록/수정 — admin 전용 (메모리)
- 카테고리별 그룹 표시 (19종 카테고리, 폴백 상수 `CATEGORIES_FALLBACK`)
- zone(연/사/지) + 층 + 위치 + 카테고리 + locationNo + description 등록
- 도면 마커와 연동 (`floorPlanMarkerApi`)
- 소화기 자산 자동 매핑 (`extinguisherApi.create`)

**사용하는 데이터/API:**
- D1 테이블: `check_points`, `floor_plan_markers`, `extinguishers`
- Worker 엔드포인트:
  - `GET /api/check-points?category=`, `GET /api/check-points?categories=all`
  - `POST /api/check-points`, `PUT /api/check-points/{id}`
- 외부 API: 없음

**주요 UI 요소:**
- BottomSheet (모바일) / DesktopModal (데스크톱)
- 등록 폼
- 카테고리 카드 그리드 + expand로 cp 리스트

**상태/인터랙션:**
- React Query mutation
- BottomSheet vs DesktopModal 분기

**현재 구현의 한계나 개선 여지:**
- 모바일 BottomSheet과 데스크톱 Modal이 별도 함수 (`BottomSheet` / `DesktopModal`) 로 정의
- admin 전용이지만 비-admin이 진입 시 처리는 SideMenu 에서 항목 숨김으로 1차 차단

---

### QR 코드 출력 (`/qr-print`)

**파일 위치:** `src/pages/QRPrintPage.tsx` (330 라인)

**핵심 기능:**
- 7종 카테고리(소화기/소화전/DIV/청정소화약제/완강기/전실제연댐퍼/방화셔터) QR 카드 일괄 출력
- 소화기는 공개 페이지 형식(공개 URL `/e/{cpId}`), 그 외는 점검자용 QR
- jsPDF + qrcode 라이브러리로 PDF 생성
- canvas 렌더링 (scale 3 기본)
- 카테고리별 카드 사이즈/레이아웃 다름 (상단 텍스트, QR, 하단 라벨)

**사용하는 데이터/API:**
- D1 테이블: `check_points`
- Worker 엔드포인트: `GET /api/checkpoints` 등 (raw fetch — `useAuthStore` 토큰 직접 사용)
- 외부 API: 없음 (qrcode 라이브러리 클라이언트 생성)

**주요 UI 요소:**
- 자체 헤더 (BottomNav 숨김)
- 카테고리 select + 다운로드 버튼
- canvas 미리보기

**상태/인터랙션:**
- 클라이언트 사이드 PDF 생성 (jsPDF)

---

### 직원 관리 (`/staff-manage`)

**파일 위치:** `src/pages/StaffManagePage.tsx` (530 라인)

**핵심 기능:**
- 직원 목록(이름/사번/직급/연락처/이메일/생일/근무 패턴) — admin 전용
- 등록/수정/삭제, 비밀번호 초기화
- shift_offset / shift_fixed 등록 (근무 패턴)

**사용하는 데이터/API:**
- D1 테이블: `staff`
- Worker 엔드포인트: `GET /api/staff`, `POST /api/staff`, `PUT /api/staff/{id}`, `POST /api/staff/{id}/reset-password`
- 외부 API: 없음

**주요 UI 요소:**
- 직원 카드 리스트
- BottomSheet (모바일) / DesktopModal (데스크톱) 등록·수정 폼
- 비밀번호 초기화 확인 모달

**상태/인터랙션:**
- React Query mutation

**현재 구현의 한계나 개선 여지:**
- BottomSheet / DesktopModal 함수가 CheckpointsPage 와 거의 동일한 코드로 중복 정의됨 (재사용되지 않음)

---

### 로그인 (`/login`)

**파일 위치:** `src/pages/LoginPage.tsx` (220 라인)

**핵심 기능:**
- 사번/비밀번호 인증
- 직원 카드 그리드(`/api/public/staff-list`) 클릭으로 사번 자동 입력
- 직원별 색상 카드 (CARD_COLORS 6종 cycle)
- 비밀번호 표시/숨김 토글
- 로그인 성공 시 `/dashboard` 이동

**사용하는 데이터/API:**
- D1 테이블: `staff`
- Worker 엔드포인트:
  - `POST /api/auth/login` (staffId, password) → JWT + Staff
  - `GET /api/public/staff-list` (로그인 전 공개 — 미들웨어 public route)
- 외부 API: 없음

**주요 UI 요소:**
- 모바일/데스크톱 분기 (`useMediaQuery('(min-width: 768px)')`)
- 직원 카드 그리드 (2열)
- 사번/비밀번호 input
- 로그인 버튼 (그라디언트)
- 안내 문구: 초기 비밀번호 사번 뒤 4자리 / 방재팀 내선

**상태/인터랙션:**
- 로그인 실패 시 비밀번호만 초기화 + focus
- toast 에러 메시지

---

### 스플래시 (`/`)

**파일 위치:** `src/pages/SplashScreen.tsx` (83 라인)

**핵심 기능:**
- 1.6초 진행바 애니메이션
- 버전 체크 (`checkVersionAndRefresh()` — 결과 안 기다리고 진행, mismatch 시 `location.reload()`)
- PWA 설치 미설치 시 `InstallPrompt` 표시
- 인증 상태에 따라 `/dashboard` 또는 `/login` 으로 이동

**사용하는 데이터/API:**
- D1 테이블: 없음
- Worker 엔드포인트: 버전 체크 (`/api/version` 추정 — 확인 필요)
- 외부 API: 없음

**주요 UI 요소:**
- 로고 영역(파란 배경 박스 + icon-192.png)
- 진행 바 (그라디언트 #3b82f6 → #0ea5e9)
- 진행 텍스트 (시스템 초기화/데이터 불러오는 중/준비 완료)
- 버전 라벨 + 위치 (`__APP_VERSION__` Vite define)
- `InstallPrompt`

**상태/인터랙션:**
- pct 0→100% 4씩 증가 (48ms interval)

---

### 소화기 공개 페이지 (`/e/:checkpointId`)

**파일 위치:** `src/pages/ExtinguisherPublicPage.tsx` (149 라인)

**핵심 기능:**
- 인증 없이 접근 가능 (App.tsx에서 `<Auth>` 미감싸기, 미들웨어 public route)
- 소화기 점검표 (월별 1~12월) 종이 양식 흉내 HTML
- 소화기 mgmt_no, type, location, 월별 점검 기록(점검자, 일자, 이상유무) 표시
- 빨간 헤더 “소화기 점검표” + 빨간 푸터 “이상 발견 즉시 수리를 의뢰하십시오”

**사용하는 데이터/API:**
- D1 테이블: `check_points`, `check_records`, `extinguishers`
- Worker 엔드포인트: `GET /api/public/extinguisher/{checkpointId}`
- 외부 API: 없음

**주요 UI 요소:**
- 단순 HTML table (cellSpacing/cellPadding) — 종이 양식 모방
- 흰 배경, 검정 텍스트, 빨강 강조 (`#c00`)
- 점검관리자: 석현민 (하드코딩)
- 우측 7행 셀에 `/extinguisher-check.png` 이미지 (정기점검 안내)
- 점검자 서명 셀

**상태/인터랙션:**
- 텍스트 선택 비활성화 (`WebkitUserSelect: 'none'`)
- 인쇄 친화적 (`@media print` 글로벌 스타일 적용)

**현재 구현의 한계나 개선 여지:**
- 사용자 정보(점검관리자 정)가 하드코딩 (`석현민`)
- 부 점검관리자는 빈 셀

---

### 404 (`*`)

**파일 위치:** `src/pages/NotFoundPage.tsx` (11 라인)

**핵심 기능:**
- 404 텍스트 + 대시보드로 이동 버튼

**사용하는 데이터/API:** 없음

**주요 UI 요소:**
- “404” 큰 텍스트 + 안내 문구 + 버튼

**상태/인터랙션:** 없음

---

## 공통 요소 (`src/components/`)

### `BottomNav.tsx`
모바일 하단 5탭 네비게이션. 항목: 대시보드 / 점검 / QR(중앙 특수 버튼) / 조치 / 승강기. `unresolvedCount` 배지. iOS/Android 분기로 height 보정 (`var(--sab) + 12px` 안드로이드용 — 메모리 명시).

### `GlobalHeader.tsx`
모바일 상단 헤더 (height 48). title + leftSlot(햄버거 또는 뒤로가기) + rightSlot(설정 톱니, portal slot). 모바일 전용.

### `SideMenu.tsx`
모바일 햄버거 드로어. `MENU` 배열 (5개 섹션 — 주요 기능/시설 관리/문서 관리/근무·복지/시스템). admin 전용 항목 필터링. `desktopOnly` 항목은 모바일에서 숨김(`/extinguishers`, `/cctv`).

### `DesktopSidebar.tsx`
데스크톱 좌측 280px 고정 사이드바. `DESKTOP_SECTIONS` 4개 (점검 현황 / 시설 관리 / 문서 관리 / 직원 관리). 섹션 접힘/펼침 (collapsed state, localStorage 영속화 안 함). 설정 톱니 버튼.

### `SettingsPanel.tsx`
설정 패널 (모바일 슬라이드 시트, 데스크톱은 isDesktop prop 활용). 비밀번호 변경 / 프로필 편집 / 알림 설정 / 메뉴 설정(`MenuSettingsSection`) 등.

### `InspectionRevisitPopup.tsx`
점검 재진입 팝업 (variant: `completed` | `pending-action`). 부분 오버레이(`position:absolute; inset:0; zIndex:10`) — 부모는 반드시 `position:relative`. InspectionPage / FloorPlanPage 등에서 사용.

### `AccessBlockedPopup.tsx`
접근 불가 개소 안내 팝업. InspectionRevisitPopup과 동일 부분 오버레이 스타일. “🚫 접근 불가 개소입니다 / 점검 기록 없이 다음 개소로 이동합니다” + 확인 버튼.

### `PhotoButton.tsx` / `PhotoGrid.tsx` / `PhotoSourceModal.tsx`
- `PhotoButton`: 단일 사진 첨부 (72x72 썸네일 + ✕ 제거 + 업로드중 오버레이). `usePhotoUpload` 훅 연계.
- `PhotoGrid`: 다중 사진 그리드 (썸네일 + lightbox `yet-another-react-lightbox` Zoom). 표시 모드 / 업로드 모드 양용. `useMultiPhotoUpload` 훅 연계.
- `PhotoSourceModal`: 카메라/앨범 선택 BottomSheet (모바일 ESC 키로 닫기 지원).

PhotoButton: InspectionPage, RemediationDetailPage, ElevatorPage 등 단일 사진. PhotoGrid: LegalFindingsPage, LegalFindingDetailPage, ElevatorFindingDetailPage(자체 ImageViewer 별도) 등 다중 사진.

### `ExcelPreview.tsx`
점검 일지 Excel 미리보기. `PREVIEW_IMAGES` 매핑(10종 보고서 PNG). `REPORT_GRID` (rows/cols), `MATRIX_TYPES` (피난방화/방화셔터/제연/자탐), `DIV_ORDER` (DIV 측정점). ReportsPage 에서 사용.

### `InstallPrompt.tsx`
PWA 설치 안내 팝업. iOS/Android 분기 (Android: `beforeinstallprompt` 캡처해서 네이티브 prompt, iOS: 공유 → 홈 화면에 추가 가이드). SplashScreen 에서 `shouldShowInstallPrompt()` 시 표시.

### `KoelsaHistorySection.tsx`
공단(KOELSA) 검사이력 카드. 판정 배지 색 분기 (보완후합격/조건부=주의, 보완/불합격=위험, 합격=안전). ElevatorPage annual 탭에서 사용.

### `DocumentSection.tsx` / `DocumentUploadForm.tsx`
- `DocumentSection`: per-type(plan/drill) 문서 리스트 + admin 업로드 버튼 + hero 카드(최신) + 과거 이력. DocumentsPage 에서 사용.
- `DocumentUploadForm`: 업로드 폼 (year + title + file). multipart upload (`runMultipartUpload`). 빈 MIME .hwp/.zip fallback 허용 (`ALLOWED` allowlist).

### `MenuSettingsSection.tsx`
SettingsPanel 내부 — 모바일 SideMenu 항목 표시/순서 사용자 커스터마이즈. `DEFAULT_SIDE_MENU` 와 `migrateLegacyMenuConfig` 사용. desktopOnly 항목은 제외, admin 전용 항목 필터링.

### `PdfFloorPlan.tsx` / `SvgFloorPlan.tsx`
- `PdfFloorPlan`: pdfjs-dist 로 PDF 도면 렌더 (Canvas). cMaps + standardFonts 경로 설정. ElevatorPage(검사도면), FloorPlanPage(층별 도면)에서 사용.
- `SvgFloorPlan`: `<object>` 태그로 SVG 렌더 — 줌 후 디바운스로 SVG 내부 width/height 재설정해 벡터 재래스터화. FloorPlanPage 에서 임포트되어 있지만 import 줄이 주석 처리됨 (현재 미사용 가능성 — 확인 필요).

### `src/components/ui/index.tsx`
- `DutyChip`: 근무자 칩 (캡슐 + 동그라미 + 이름 + 근무 종류). 연차/공가 시 캡슐 색 변경, 반차는 대각 분할(SVG clipPath). 당직+연차 조합 처리.
- `RoleLabel`: “관리자” / “보조자” 세로쓰기 라벨.
- `Donut`: 도넛 차트 (단일 arc 기본 + `doubleCycle` two-lap 옵션 — DIV/컴프 월초/월말 overlay).
- `StatusBadge`: 일정 상태 배지 (예정/진행중/완료/지연).
- `CatBar`: 카테고리 색 세로 바 (event/repair/inspect/task).

DashboardPage / InspectionPage / SchedulePage / WorkShiftPage 등에서 사용.

### `src/components/floors/FloorB5.tsx`
B5 층 평면도 SVG 정적 정의 (viewBox 960x680, 1/100 스케일, KMD ARCHITECTS 2012.04 기준). `FloorMarker` 타입 + `MARKER_STATUS_COLOR` + `TYPE_SYM`. **현재 다른 페이지에서 import 되는지 확인 필요** — `FloorPlanPage` 는 `PdfFloorPlan` 기반이라 직접 사용 안 함.

---

## 디자인 시스템 현황

### 색상 토큰

`src/index.css` 의 `:root` 정의:

```
--bg:    #0d1117          (전역 배경)
--bg2:   #161b22          (카드/헤더 배경)
--bg3:   #1c2128          (input/슬롯 배경)
--bg4:   #22272e          (강조 슬롯/탭 활성)
--bd:    rgba(255,255,255,0.07)  (구분선 약)
--bd2:   rgba(255,255,255,0.13)  (구분선 강 / input 테두리)
--t1:    #e6edf3          (주 텍스트)
--t2:    #8b949e          (보조 텍스트)
--t3:    #6e7681          (희미 텍스트)
--acl:   #3b82f6          (강조/링크/CTA — 파랑)
--info:  #0ea5e9          (정보)
--safe:  #22c55e          (정상/안전 — 초록)
--warn:  #f59e0b          (주의 — 노랑)
--danger:#ef4444          (위험/불량 — 빨강)
--fire:  #f97316          (소방/조치 대기 — 주황)
--c-day:   #f59e0b        (주간 근무)
--c-night: #ef4444        (당직)
--c-off:   #3b82f6        (비번)
--c-leave: #6b7280        (휴무 — 회색)
--sat / --sab             (safe area top/bottom — JS 실측 후 덮어쓰기)
```

`tailwind.config.js` 에서 위 CSS 변수를 Tailwind 색상으로 매핑(`bg`, `bg2`, `bg3`, `bg4`, `t1`, `t2`, `t3`, `acl`, `info`, `safe`, `warn`, `danger`, `fire`).

### 폰트

`tailwind.config.js`:
```js
fontFamily: {
  sans: ['Noto Sans KR', 'system-ui', 'sans-serif', 'Noto Color Emoji'],
  mono: ['JetBrains Mono', 'monospace'],
}
```

`src/index.css` 상단에서 Google Fonts import (`Noto Sans KR` 300/400/500/600/700/900, `JetBrains Mono` 400/600, `Noto Color Emoji`).

JetBrains Mono 는 도넛 % 표시, 통계 카드 숫자, 스케줄 시간 등 숫자에 한정 인라인 사용 (`fontFamily:'JetBrains Mono,monospace'`).

### 스페이싱/반경/그림자 (인라인 스타일에서 반복되는 값)

코드 전반에 걸쳐 인라인 스타일로 반복적으로 등장하는 값들:

- **borderRadius**: 7 (소형 버튼/아이콘 슬롯), 8 (보조 input/버튼), 9 (모바일 select), 10 (input/카드 small), 12 (CTA 버튼/모달 카드), 14 (카드 large), 16 (헤더/패널), 20 (큰 카드), 22 (DutyChip 캡슐)
- **padding 패턴**: `'8px 12px'`, `'10px 14px'`, `'12px 16px'`, `'14px 20px'`, `'20px 24px'`
- **gap**: 4, 5, 6, 8, 10, 12, 14, 16
- **fontSize**: 9 (배지/라벨), 10 (보조), 11 (시간/메타), 12 (본문), 13 (강조), 14 (제목), 16 (헤더), 22 (모달 이모지)
- **box-shadow**: 거의 사용 안 함; LoginPage 데스크톱 카드만 `'0 8px 32px rgba(0,0,0,0.4)'`

이 값들은 **토큰화되어 있지 않음** — 모든 값이 각 페이지 인라인 스타일에 직접 박혀 있음.

### 컴포넌트 토큰

**현황: 인라인 스타일 일변도, 토큰/공통 클래스 시스템 부재.**

- 버튼: 모든 페이지가 인라인 객체로 정의. 페이지마다 `primaryBtnSt`, `ghostBtnSt`, `iconBtn`, `navBtn`, `smallBtn` 같은 로컬 상수를 자체 정의 (예: QRScanPage, DailyReportPage, WorkLogPage). 색/패딩/radius 가 파일마다 미세하게 다름.
- 카드: 거의 모든 페이지가 `background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 12 또는 14` 패턴을 인라인으로 반복.
- 모달: `position: 'fixed', inset: 0, background: 'rgba(0,0,0,...)', zIndex` 패턴이 페이지/컴포넌트마다 인라인 정의 (BottomSheet, DesktopModal, PhotoSourceModal, 각 모달 등). zIndex 값이 50, 99, 100, 300, 1000, 9999 등 산발적으로 사용됨.
- 입력 필드: `background: 'var(--bg3)', border: '1px solid var(--bd2)', borderRadius: 8~12` 패턴 반복. height 가 32/34/36/44 등 페이지별 다름.

**Tailwind 활용도**: 거의 사용 안 함 — 색상 매핑(`bg-bg2` 등)도 코드 grep 시 적용 사례가 보이지 않음. 사실상 모든 스타일이 `style={{...}}` 인라인.

**CSS-in-JS / Emotion / Styled Components**: 사용 안 함.

**전역 클래스**: `[data-no-print]`, `[data-print-only]`, `#excel-preview-table`, `.excel-preview-inner`, `@keyframes slideUp`, `@keyframes blink`, `@keyframes spin` (개별 컴포넌트 인라인 `<style>` 태그) 정도.

요약: **토큰은 색상(CSS variables) 수준에만 존재. 스페이싱/반경/그림자/타이포/컴포넌트 토큰은 부재. 모든 컴포넌트가 인라인 스타일 객체로 직접 작성됨.**
