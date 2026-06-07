---
phase: quick-260608-b6f
type: prod-data-correction (RCA)
subsystem: floorplan-markers / extinguisher checkpoints
status: complete
completed: "2026-06-08"
source_changed: false
deploy: none (D1 데이터, 라이브 조회 — 배포 무관)
---

# Quick 260608-b6f: 지하4층 'A-2 기둥' 개소명 3-store 통일 (RCA)

**One-liner:** 마커 수정 모달의 "개소명" 편집이 `floor_plan_markers.label` 만 바꾸고 연결된 `check_points.location`·`extinguishers.location` 에는 전파되지 않아 한 개소명이 화면마다 다르게(A-1 vs A-2) 보이던 불일치를, prod D1 에서 두 테이블을 마커 라벨('A-2 기둥')에 맞춰 통일.

## 증상 (사용자 보고)
지하4층 가장 최근 만든 개소를 'A-1 기둥' → 'A-2 기둥' 으로 바꾸려는데, 마커 수정 모달에서 개소명을 보면 이미 'A-2 기둥' 으로 보임 (화면마다 다름).

## RCA (데이터/코드)
개소명이 **3곳**에 중복 저장됨 (대상: B4 최근 개소 `CP-FE-0472`, 소화기, qr `QR-지-B4-40`, location_no `지-B4-40`):

| 저장 위치 | 필드 | 작업 전 | 노출 화면 |
|---|---|---|---|
| 개소 `CP-FE-0472` | `check_points.location` | A-1 기둥 | 일반점검 목록 · 도면 마커 이름(cp_location 우선) · QR |
| 소화기대장 `id=486` | `extinguishers.location` | A-1 기둥 | 소화기 관리 목록 |
| 마커 `FPM-9XjKJyuupOB0` | `floor_plan_markers.label` | A-2 기둥 (updated_at 2026-06-08 01:41) | 마커 수정 모달 "개소명" 입력칸 |

- 생성 시(06-04)엔 3곳 모두 'A-1 기둥' 으로 동기(마커 추가 시 `floorplan-markers POST` 가 label 로 cp 자동 생성).
- 오늘(06-08) 마커 수정 모달에서 개소명을 'A-2 기둥' 으로 변경 → **`PUT /api/floorplan-markers/:id` (`functions/api/floorplan-markers/[id].ts` L21) 가 `floor_plan_markers.label` 만 UPDATE**, `check_points.location`·`extinguishers.location` 미동기 → divergence.
- 표시 로직: 도면/마커 이름은 `cp_location || label` (FloorPlanPage L1154·L1765) 이라 A-1 노출, 모달 입력칸은 `selected.label` (L1171·L1512) 이라 A-2 노출 → 사용자 혼란.
- `check_records` 0건 (미점검) → 회복 부담 없음. qr_code/location_no 는 이름 미포함('지-B4-40') → 무영향.

## 회복 (적용)
사용자 승인(데이터 통일 = 'A-2 기둥', 마커 기준): prod D1 두 행 UPDATE.
```sql
UPDATE check_points  SET location='A-2 기둥' WHERE id='CP-FE-0472';                                    -- changes=1
UPDATE extinguishers SET location='A-2 기둥', updated_at=datetime('now','+9 hours')
  WHERE check_point_id='CP-FE-0472';                                                                   -- changes=1 (id=486)
```
검증: 3-store SELECT 모두 'A-2 기둥' 일치 확인. 메인 Claude 직접 적용(prod D1 — 서브에이전트 금지). 배포 없음(D1 라이브).

## 가드 (재발 방지) — staging 으로 분리
근본 원인은 "마커 라벨 수정이 개소/소화기대장에 미동기" = **API 동작 변경**이라 콘솔 룰상 prod 직접 적용 금지 → **staging(cbc7119-data)에서 검증 후 반영** 예정.
- 후보: `PUT /api/floorplan-markers/:id` 에서 `label` 변경 + `check_point_id LIKE 'CP-FE-%'` (소화기 개소) 일 때 `check_points.location` + `extinguishers.location` 도 같은 값으로 atomic 동기. 또는 개소명 정식 편집 경로를 소화기 관리(ExtinguishersListPage)로 일원화.
- 의사결정/설계는 staging 작업 시 진행.

## Self-Check
- [x] check_points.location(CP-FE-0472) = 'A-2 기둥'
- [x] extinguishers.location(id=486) = 'A-2 기둥'
- [x] floor_plan_markers.label(FPM-9XjKJyuupOB0) = 'A-2 기둥' (기존)
- [x] check_records 영향 0 / qr_code·location_no 무변경
- [x] source/배포 변경 없음 — production-sync 기준 commit(44c4d40) 유지
- [ ] (follow-up) 동기화 가드 — staging 에서 별도 진행
