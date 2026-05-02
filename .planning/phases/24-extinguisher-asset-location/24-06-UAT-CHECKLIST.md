# Phase 24 Plan 06 — UAT Checklist

**UAT date:** 2026-05-02 (start) ~ 2026-05-02 13:34 KST
**Tester:** 윤종엽 (2022051052)
**Environment:** PWA (iOS / Android / PC)
**App version:** 0.2.1
**Production URL:** cha-bio-safety.pages.dev (production alias)
**Sanity SQL baseline (DEPLOY-LOG):** total=448, active=448, mapped=448, 인덱스 3개 모두 존재

## Pre-UAT

- [x] PWA 앱 재설치 또는 새로고침 완료
- [x] /api/health 또는 splash version-check 정상 (서버 버전 = 0.2.1 노출)

---

## ROADMAP Success Criteria

### 1. 소화기 리스트 페이지에서 신규 등록·수정(≤3필드)·삭제·폐기·분리 가능

- [x] `/extinguishers` 진입 — 모든 자산 카드 표시
- [x] 필터 4종 (전체 / 배치 / 미배치 / 폐기) 동작
- [x] zone (연/사/지) / floor / type / 검색 필터 동작
- [x] `+ 새로 등록` → 7필드 입력 → 저장 → 미배치 카드로 표시
- [x] 미매핑 + 미점검 카드의 「삭제」 → confirm → 카드 사라짐
- [x] 미매핑 + 점검O 카드의 「폐기」 → confirm → 폐기 카드로 전환
- [x] 매핑됨 카드의 「소화기 분리」 → confirm → 미배치 카드로 전환
- [x] 정보 수정 모달: 변경 1개 → 카운터 acl 파랑 → 저장 정상
- [x] 정보 수정 모달: 변경 4개 → 카운터 빨강 → 저장 비활성 + microcopy
- [x] 정보 수정 모달: 변경 4개 강제 우회 시도 → 백엔드 400 + 토스트 「한 번에 최대 3개...」

**Result:** ✅ PASS
**UAT 중 발견·수정된 이슈:**
- type 필터 분말20kg/강화액/K급 누락 → 수정
- 카드 표시 순서 사용자 요청 반영 (제조번호·증지번호만 컴팩트 표시)
- 등록 모달 필드 순서 + placeholder 실제 데이터 + 직전 등록값 prefill
- 제조번호/증지번호 numeric 키패드 + 접두문자 자동 대문자
- 정보 수정 모달 필드 순서 정렬 (등록 모달과 통일)

---

### 2. 도면 마커 편집에서 위치 추가·개소명 수정·매핑 변경(스왑/배치/분리) 가능

- [x] `/floorplan?planType=extinguisher` 진입
- [x] 편집 모드 마커 추가 모달 — 4종 옵션(소화기/소화전/완강기/DIV) + 개소명 + 구역
- [x] 편집 모드 마커 수정 모달 — 매핑된 마커: 정보 수정 / 소화기 분리 버튼
- [x] 편집 모드 마커 수정 모달 — 미배치 ❓ 마커: 소화기 배치 → ListPage 동행
- [x] `/extinguishers?fromMarker=...` 진입 시 동행 안내 배너 표시
- [x] 신규 등록 → 자동 매핑 → 토스트 → 도면 복귀
- [x] 도면에서 빈 ❓ 마커 시각 확인 (빨강 disk + 흰색 ❓)
- [x] 매핑 후 자산 type 별 시각으로 자동 전환 (분말/분말 20kg/할로겐/K급/이산화탄소→할로겐/강화액→K급)

**Result:** ✅ PASS
**UAT 중 발견·수정된 이슈:**
- 모든 marker_type이 ❓로 잘못 변환 (소화전/완강기/DIV 포함) → EXT_ASSET_MARKER_TYPES 가드 추가
- 마커 추가 모달 7종 → 4종으로 단순화
- 마커 라벨이 marker_type fallback ('소화기빈 개소')로 표시 → cp.location 우선 표시
- 점검 모달 ext detail '위치' 필드 NULL → cp.location fallback
- 동행 진입 시 floor 필터 1F로 박힘 → 미배치 자산 floor=NULL은 누락 → backend COALESCE(cp.floor, e.floor) + dropdown union
- ListPage useEffect로 동행 진입 시 tab='unmapped' + 필터 reset
- 빈 마커 cp_id 없이 등록 → ListPage 동행 시 fromMarker 빈 문자열 → marker_id 기반 placing flow 신규 endpoint
- 빈 마커에 cp 자동 생성하면 점검 대상으로 노출 → cp 생성을 자산 배치 시점으로 변경
- 도면 복귀 시 default(유도등 첫 층)로 reset → URL state sync + 명시적 navigate URL

---

### 3. 소화기 교체 시 폐기 보존 + 새 자산 등록·매핑 흐름이 자연스러움

시나리오: 분말 10년 도래 자산 A 를 폐기하고 새 자산 B 를 동일 위치에 매핑

- [x] 자산 A 매핑됨 카드 → 분리 → 미배치 카드
- [x] 자산 A 미배치 카드 → 폐기 → 폐기 카드 (status='폐기' 시각 표시)
- [x] 도면에 동일 위치가 ❓ 빈 마커로 전환됨
- [x] 빈 ❓ 마커 → 소화기 배치 → ListPage 동행
- [x] `+ 새로 등록` → 자산 B 입력 → 저장 → 자동 매핑 + 도면 복귀
- [x] 도면에서 동일 위치가 정상 마커로 복원됨 (자산 B type 시각)
- [x] 자산 A 폐기 카드는 「폐기됨」 으로 보존됨 (조회만)

**Result:** ✅ PASS

---

### 4. 점검 기록에 그 시점 소화기 ID 스냅샷 저장됨

- [x] 새 점검 세션 생성 후 소화기 1개 점검 (지하1층 방재실, 정상 결과)
- [x] sanity SQL: `SELECT extinguisher_id, checkpoint_id FROM check_records ORDER BY checked_at DESC LIMIT 1`
- [x] ext_id가 NULL 아니고, 현재 매핑된 자산 ID와 일치

**Sanity SQL output (2026-05-02 13:15:36):**
```
extinguisher_id: 219
checkpoint_id: CP-FE-0219
location: 방재실 (B1)
mgmt_no: 지-B1-02
type: 분말
result: normal
current_ext_id: 219  ← extinguisher_id와 일치 ✓
```

**Result:** ✅ PASS

---

### 5. 빈 마커는 빨간 ❓ 로 도면+범례에 표시되고 점검 모드에선 매핑 유도

- [x] 도면에 ❓ 마커 시각 확인
- [x] 범례 status row 의 「미배치」 항목 표시
- [x] 점검 모드 (편집 X)에서 ❓ 클릭 → 「소화기 미배치」 안내 모달
- [x] 「소화기 배치하기」 → ListPage 동행 이동

**Result:** ✅ PASS

---

### 6. 리스트 ↔ 도면 양방향 매핑 동선이 마커 컨텍스트 동행으로 자연스러움

- [x] 도면 → 리스트 (마커 동행): 검증 2 + 5 에서 확인
- [x] 리스트 → 도면 (placing 흐름): 미배치 카드 → 「소화기 배치」 → 도면 placing 모드
- [x] 도면에 안내 배너 + ❓ 클릭 대기 모드
- [x] 빈 ❓ 클릭 → 「여기에 배치할까요?」 confirm → 「배치」 → 토스트 + 복귀
- [x] 리스트에서 해당 자산이 매핑됨 카드로 전환 표시

**Result:** ✅ PASS
**UAT 중 발견·수정된 이슈:**
- 동행 진입 후 미배치 카드 「소화기 배치」 클릭 시 도면 placing 단계로 우회 → 즉시 배치 + 도면 복귀로 변경
- 「동행 해제」 버튼 라벨 → 「취소」 (사용자 가독성)

---

### 7. 기존 1:1 데이터가 손실 없이 새 모델로 보존됨

- [x] sanity SQL 결과 (2026-05-02 13:34 KST):

**Sanity SQL output:**
```
total: 467           (Plan 01 baseline 448 + UAT 신규 등록 19)
mapped_active: 449
unmapped_active: 16
disposed: 2
합계 검산: 449 + 16 + 2 = 467 ✓
```

- [x] mapped 449 ≈ Plan 01 baseline 448 (+1 UAT 분리/재배치)
- [x] 기존 자산의 mgmt_no/type/제조 정보 모두 그대로 (랜덤 5개 카드 시각 확인)
- [x] 폐기된 자산 2건은 삭제되지 않고 status='폐기'로 보존

**Result:** ✅ PASS

---

## 회귀 검증

다른 메뉴/기능이 Phase 24 변경에 의해 깨지지 않았는지 확인.

- [x] 대시보드 (/) — 정상
- [x] 일정 (/schedule) — 정상
- [x] DIV 압력관리 — 정상
- [x] 도면 — 다른 plan type (자동화재 / 유도등 / 스프링클러) 모두 정상
- [x] 일반점검 (/inspection) — 자탐 / 펌프 / SH / BC 등 비-소화기 카테고리 정상
- [x] 법정점검 — 정상
- [x] 승강기 — 정상
- [x] 식대 — 정상
- [x] 교육 — 정상
- [x] 문서 (/documents) — 정상
- [x] 업무수행기록표 — 정상
- [x] 직원관리 — 정상
- [x] 설정 — 정상
- [ ] 점검 일정 알림 푸시 동작 (cbc-cron-worker, Phase 24 무관) — 다음날 08:45 KST 자동 푸시 확인 (UAT 완료 시점에 미검증, 일상 관찰로 이어짐)

**Regression Result:** ✅ PASS (푸시 크론은 익일 자동 검증)

---

## Issues found

UAT 중 발견된 이슈는 모두 즉시 fix → commit + production 재배포 → 사용자 재검증 cycle 로 처리. gap-closure phase 또는 별도 quick task 발급 없음.

### Major fix 요약

| # | 영역 | 이슈 | 해결 |
|---|------|------|------|
| 1 | 마커 시각 | 모든 marker_type이 ❓로 잘못 변환 | EXT_ASSET_MARKER_TYPES 가드 |
| 2 | 마커 라벨 | '소화기빈 개소' fallback | cp.location join + 우선 표시 |
| 3 | 점검 모달 위치 | NULL | cp_location fallback |
| 4 | 등록 흐름 | check_point_id NOT NULL constraint | migration 0080 (nullable) |
| 5 | floor 필터 | mapped 자산이 1F 필터 누락 | COALESCE(cp.floor, e.floor) |
| 6 | 동행 흐름 | 빈 마커 cp_id 없으면 placing 불가 | marker_id 기반 placeAsset endpoint + cp 자산 배치 시 생성 |
| 7 | 동행 흐름 | 미배치 카드 「소화기 배치」 우회 | 즉시 배치 + 도면 복귀 |
| 8 | navigation | 도면 복귀 시 state reset | URL sync + 명시적 navigate |
| 9 | zone 라벨 | 영문 noise (research/office/common) | 한글 매핑 + migration 0081 (common→basement) |
| 10 | type 필터 | 6종 중 3종만 노출 | EXTINGUISHER_TYPES 확장 |
| 11 | 카드 표시 | 사용자 요청 반영 | 제조번호·증지번호 위주, 상세는 펼침 |
| 12 | 등록 모달 | 입력 편의 | placeholder 실제 데이터 + 직전 등록값 prefill + numeric 키패드 + 자동 대문자 |

---

## UAT result

- [x] **✅ PASS — 모든 7개 success criteria + 회귀 통과**

**Tester signature:** 윤종엽 / 2026-05-02 13:34 KST
