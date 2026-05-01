# Phase 24 Plan 06 — UAT Checklist

**UAT date:** 2026-05-02 (start) ~ ___
**Tester:** 윤종엽 (2022051052)
**Environment:** PWA (iOS / Android / PC)
**App version:** 0.2.1
**Production URL:** https://2b5c0059.cbc7119.pages.dev (또는 production alias)
**Sanity SQL baseline (DEPLOY-LOG):** total=448, active=448, mapped=448, 인덱스 3개 모두 존재

## Pre-UAT

- [ ] PWA 앱 재설치 또는 새로고침 완료
- [ ] /api/health 또는 splash version-check 정상 (서버 버전 = 0.2.1 노출)

---

## ROADMAP Success Criteria

### 1. 소화기 리스트 페이지에서 신규 등록·수정(≤3필드)·삭제·폐기·분리 가능

- [ ] `/extinguishers` 진입 — 모든 자산 카드 표시
- [ ] 필터 4종 (전체 / 미배치 / 매핑 / 폐기) 동작
- [ ] zone (연/사/공) / floor / type / 검색 필터 동작
- [ ] `+ 새로 등록` → 7필드 입력 → 저장 → 미배치 카드로 표시
- [ ] 미매핑 + 미점검 카드의 「삭제」 → confirm → 카드 사라짐
- [ ] 미매핑 + 점검O 카드의 「폐기」 → confirm → 폐기 카드로 전환
- [ ] 매핑됨 카드의 「소화기 분리」 → confirm → 미배치 카드로 전환
- [ ] 정보 수정 모달: 변경 1개 → 카운터 acl 파랑 → 저장 정상
- [ ] 정보 수정 모달: 변경 4개 → 카운터 빨강 → 저장 비활성 + microcopy
- [ ] 정보 수정 모달: 변경 4개 강제 우회 시도 → 백엔드 400 + 토스트 「한 번에 최대 3개...」

**Result:** ☐ PASS / ☐ FAIL
**Notes:**

---

### 2. 도면 마커 편집에서 위치 추가·개소명 수정·매핑 변경(스왑/배치/분리) 가능

- [ ] `/floorplan?planType=extinguisher` 진입
- [ ] 편집 모드 마커 추가 모달 — 개소명 + 구역만 (소화기 종류 / 점검 개소 연결 필드 없음)
- [ ] 편집 모드 마커 수정 모달 — 매핑된 마커: 정보 수정 / 소화기 분리 버튼
- [ ] 편집 모드 마커 수정 모달 — 미배치 ❓ 마커: 소화기 배치 버튼 → `/extinguishers?fromMarker=...` 이동
- [ ] `/extinguishers?fromMarker=...` 진입 시 동행 안내 배너 표시
- [ ] 신규 등록 → 자동 매핑 → 토스트 → navigate(-1) 도면 복귀
- [ ] 도면에서 빈 ❓ 마커 시각 확인 (빨강 disk + 흰색 ❓)

**Result:** ☐ PASS / ☐ FAIL
**Notes:**

---

### 3. 소화기 교체 시 폐기 보존 + 새 자산 등록·매핑 흐름이 자연스러움

시나리오: 분말 10년 도래 자산 A 를 폐기하고 새 자산 B 를 동일 위치에 매핑

- [ ] 자산 A 매핑됨 카드 → 분리 → 미배치 카드
- [ ] 자산 A 미배치 카드 → 폐기 → 폐기 카드 (status='폐기' 시각 표시)
- [ ] 도면에 동일 위치가 ❓ 빈 마커로 전환됨
- [ ] 빈 ❓ 마커 → 소화기 배치 → `/extinguishers?fromMarker=...`
- [ ] `+ 새로 등록` → 자산 B 입력 → 저장 → 자동 매핑 + navigate(-1)
- [ ] 도면에서 동일 위치가 정상 마커로 복원됨
- [ ] 자산 A 폐기 카드는 「폐기됨」 으로 보존됨 (조회만)

**Result:** ☐ PASS / ☐ FAIL
**Notes:**

---

### 4. 점검 기록에 그 시점 소화기 ID 스냅샷 저장됨

- [ ] 새 점검 세션 생성 후 소화기 1개 점검 (정상 결과)
- [ ] sanity SQL: `SELECT extinguisher_id, checkpoint_id FROM check_records ORDER BY checked_at DESC LIMIT 1` → ext_id 가 NULL 아님
- [ ] 그 ext_id 가 현재 매핑된 자산 ID 와 일치

**Sanity SQL output:**
```
(여기에 결과 붙여넣기)
```

**Result:** ☐ PASS / ☐ FAIL
**Notes:**

---

### 5. 빈 마커는 빨간 ❓ 로 도면+범례에 표시되고 점검 모드에선 매핑 유도

- [ ] 도면에 ❓ 마커 시각 확인
- [ ] 범례 status row 의 「미배치」 항목 (빨강 ❓ 13px + t2 라벨) 표시
- [ ] 점검 모드 (편집 X)에서 ❓ 클릭 → 「소화기 미배치」 안내 모달
- [ ] 「소화기 배치하기」 → `/extinguishers?fromMarker=...` 이동

**Result:** ☐ PASS / ☐ FAIL
**Notes:**

---

### 6. 리스트 ↔ 도면 양방향 매핑 동선이 마커 컨텍스트 동행으로 자연스러움

- [ ] 도면 → 리스트 (마커 동행): 검증 2 + 5 에서 이미 확인
- [ ] 리스트 → 도면 (placing 흐름): 미배치 카드 → 「소화기 배치」 → `/floorplan?planType=extinguisher&placingExtinguisher=...` 이동
- [ ] 도면에 안내 배너 + ❓ 클릭 대기 모드
- [ ] 빈 ❓ 클릭 → 「여기에 배치할까요?」 confirm → 「배치」 → 토스트 + navigate(-1) 리스트 복귀
- [ ] 리스트에서 해당 자산이 매핑됨 카드로 전환 표시

**Result:** ☐ PASS / ☐ FAIL
**Notes:**

---

### 7. 기존 1:1 데이터가 손실 없이 새 모델로 보존됨

- [ ] sanity SQL: `SELECT COUNT(*) FROM extinguishers WHERE check_point_id IS NOT NULL` → Plan 01 baseline (448) 과 동일 (또는 본 UAT 에서 분리/스왑/등록한 만큼만 차이)
- [ ] sanity SQL: `SELECT COUNT(*) FROM extinguishers` → Plan 01 baseline (448) + 본 UAT 에서 등록한 신규 자산 수
- [ ] 기존 자산의 mgmt_no / type / 제조 정보 모두 그대로 (랜덤 5개 카드 클릭하여 시각 확인)
- [ ] 폐기된 자산이 삭제되지 않고 status='폐기' 로 보존됨 — sanity SQL: `SELECT COUNT(*) FROM extinguishers WHERE status='폐기'`

**Sanity SQL output:**
```
mapped count: ___
total count: ___
disposed count: ___
```

**Result:** ☐ PASS / ☐ FAIL
**Notes:**

---

## 회귀 검증

다른 메뉴/기능이 Phase 24 변경에 의해 깨지지 않았는지 확인.

- [ ] 대시보드 (/) — 정상 진입, 카드/스탯 표시
- [ ] 일정 (/schedule) — 정상
- [ ] DIV 압력관리 — 모바일 + 데스크톱 정상
- [ ] 도면 — 다른 plan type (자동화재 / 유도등 / SH / BC / 비상콘센트) 정상
- [ ] 일반점검 (/inspection) — 자탐 / 펌프 / SH / BC 등 비-소화기 카테고리 정상
- [ ] 법정점검 (/legal-inspection) — 정상
- [ ] 승강기 (/elevator) — 정상
- [ ] 식대 — 정상
- [ ] 교육 — 정상
- [ ] 문서 (/documents) — 정상 진입, 업로드/다운로드
- [ ] 업무수행기록표 — 정상
- [ ] 직원관리 — 정상
- [ ] 설정 — 정상
- [ ] 점검 일정 알림 푸시 동작 (cbc-cron-worker — Phase 24 변경 무관) — 다음날 08:45 KST 자동 푸시 확인

**Regression Result:** ☐ PASS / ☐ FAIL
**Notes:**

---

## Issues found

발견된 문제를 인라인으로 기록. 수정 방향 결정:
- 사소한 버그 → quick task (`/gsd-quick`)
- 큰 결함 → gap-closure phase (`/gsd-plan-phase 24 --gaps`)

| # | Description | Severity | Disposition |
|---|-------------|----------|-------------|
|   |             |          |             |

---

## UAT result

- ☐ PASS — 모든 7개 success criteria + 회귀 통과
- ☐ FAIL — 일부 항목 FAIL, issues 섹션 참조

**Tester signature / 일자:**
