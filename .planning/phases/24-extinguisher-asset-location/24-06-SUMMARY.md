---
phase: 24-extinguisher-asset-location
plan: 06
status: complete
shipped_at: 2026-05-02 13:34 KST
---

# Plan 24-06 Summary — Production Deploy + UAT Pass

## What was built

v0.2.1 production 배포 + 운영 D1 sanity 검증 + 7개 ROADMAP success criteria UAT 모두 PASS. 회귀 검증(다른 기능 영향 없음)도 통과. Phase 24 ship 완료.

## Tasks executed

| Task | Type | Commit | Files |
|------|------|--------|-------|
| Task 1 — version bump + production deploy + sanity SQL | auto | `b394bbf` | `package.json`, `24-06-DEPLOY-LOG.md` |
| Task 2 — 7 ROADMAP UAT 진행 + 발견 이슈 즉시 fix | checkpoint:human-verify | (다수 fix commit) + `7ab5c7c` (template) | `24-06-UAT-CHECKLIST.md` 외 다수 |
| Task 3 — STATE.md / ROADMAP.md 최종 업데이트 + ship | auto | (이번 commit) | `.planning/STATE.md`, `.planning/ROADMAP.md` |

## Production deploy 결과

- v0.2.0 → **v0.2.1**
- Production URL alias: `cha-bio-safety.pages.dev` (latest deployment)
- 빌드: 87 modules, 11.49s, PWA precache 69 entries
- 4종 sanity SQL pass (배포 직후): status 컬럼 / 448 active / 448 mapped / 인덱스 3개

## UAT 진행 + 후속 fix 요약

UAT 중 12건 fix 발견·즉시 적용 — 모두 PWA 재배포 후 사용자 재검증 cycle. gap-closure phase 또는 별도 quick task 미발급 (모든 issue 가 phase 내에서 클로즈).

핵심 fix:
- `migration 0080`: extinguishers.check_point_id NOT NULL 제거 (skip_marker 등록 + dispose/unassign NULL set 가능)
- `migration 0081`: cp.zone CHECK 제약 제거 + `'common'` → `'basement'` 정리 (의미 부합)
- 빈 마커 cp 자동 생성 시점 변경 (마커 추가 → 자산 배치 시점) — 점검 대상 노출 가드
- 마커 시각 가드 (EXT_ASSET_MARKER_TYPES) — 소화전/완강기/DIV 마커가 ❓로 잘못 변환되던 버그
- 마커 시각 자산 type 분기 (`extTypeToMarkerType`) — 분말/분말 20kg/할로겐/K급 + 강화액→K급 + 이산화탄소→할로겐
- placing flow marker_id 기반 endpoint (`POST /api/floorplan-markers/:id/place-asset`) — atomic batch (cp 생성 + ext 매핑 + marker update)
- floor/zone 필터 COALESCE(cp, ext) — 매핑된 자산이 ext.floor=NULL이어도 cp.floor 기준 매치
- ListPage 동행 진입 시 useEffect로 tab='unmapped' + 필터 reset (이미 페이지에 머물던 경우 커버)
- navigate(-1) → 명시적 `/floorplan?planType=...&floor=...` (도면 URL state 손실 방지)
- 카드/모달 UI 사용자 요청 반영: 카드 표시 단순화, 등록/수정 모달 필드 순서 통일, placeholder 실제 데이터, 직전 등록값 prefill, numeric 키패드, 접두문자 자동 대문자, 「동행 해제」→「취소」 버튼
- 타입 필터 6종 노출 (분말 20kg/강화액/K급 누락 fix)
- zone 한글 매핑 (`research/office/basement` → 연구동/사무동/지하)

## 운영 D1 baseline 비교

| 지표 | Plan 01 baseline | UAT 종료 후 | 변화 |
|------|------------------|--------------|------|
| total | 448 | 467 | +19 (UAT 신규 등록) |
| mapped (active) | 448 | 449 | 거의 동일 |
| unmapped (active) | 0 | 16 | UAT 등록 후 미배치 |
| disposed | 0 | 2 | UAT 폐기 |
| 합계 검산 | 448 | 449 + 16 + 2 = 467 | ✓ |

데이터 무손실 확인.

## key-files.created

- `cha-bio-safety/migrations/0079_extinguisher_asset_split.sql` (Plan 01)
- `cha-bio-safety/migrations/0080_extinguisher_cp_nullable.sql` (UAT 후속)
- `cha-bio-safety/migrations/0081_zone_common_to_basement.sql` (UAT 후속)
- `cha-bio-safety/functions/api/extinguishers/[id].ts` + `assign/unassign/swap/dispose.ts` (Plan 02)
- `cha-bio-safety/functions/api/floorplan-markers/[id]/place-asset.ts` (UAT 후속)
- `cha-bio-safety/src/pages/ExtinguishersListPage.tsx` (Plan 03, 984+)
- `cha-bio-safety/src/pages/FloorPlanPage.tsx` (Plan 04 대규모 재작성)
- `cha-bio-safety/src/pages/InspectionPage.tsx` (Plan 05 부분 추가)
- `.planning/phases/24-extinguisher-asset-location/24-01-PRAGMA.md`
- `.planning/phases/24-extinguisher-asset-location/24-06-DEPLOY-LOG.md`
- `.planning/phases/24-extinguisher-asset-location/24-06-UAT-CHECKLIST.md`
- 시안 4종: `sketches/24-03-list-page.html`, `sketches/24-03-modals.html`, `sketches/24-04-empty-marker.html`, `sketches/24-04-legend-and-modals.html`

## What this enables

5월 법정점검 실전 검증을 위한 자산-위치 분리 모델 production-ready. 분말 10년 도래 자산 폐기 → 동일 위치 신규 등록 흐름이 한 페이지에서 완결. 자산 폐기 후에도 점검 이력은 ext_id 스냅샷으로 영구 보존.

## Self-Check: PASSED

- [x] Production deploy v0.2.1 완료
- [x] 7개 ROADMAP success criteria UAT 모두 PASS
- [x] 회귀 검증 통과 (대시보드, 일정, DIV, 다른 도면 plan types, 일반점검 비-소화기 카테고리, 법정점검, 승강기, 식대, 교육, 문서, 업무수행기록표, 직원관리, 설정)
- [x] 데이터 무손실 (1:1 매핑 baseline 보존)
- [x] DEPLOY-LOG.md + UAT-CHECKLIST.md 작성
- [x] UAT 중 발견된 12건 fix 모두 즉시 적용 — gap-closure phase 또는 잔존 quick task 없음
- [x] 점검 일정 알림 푸시 동작은 익일 08:45 KST 자동 검증으로 위임 (cbc-cron-worker, Phase 24 무관)
