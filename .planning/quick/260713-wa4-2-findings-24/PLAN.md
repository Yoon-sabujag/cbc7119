---
quick_id: 260713-wa4
slug: 2-findings-24
date: 2026-07-13
branch: production
---

# 승강기 미사용 기능 2건 폐기 (findings 체인 + 민원24)

staging(`cbc7119-data`)에서 구현·배포·UAT 검증까지 끝낸 뒤 prod 로 이식.
핸드오프: `~/Documents/cbc7119-data/.planning/handoffs/260713-prod-findings-chain-removal.md`

## Part A — findings 프론트 체인 제거

백엔드 핸들러 2개는 `260713-rwb` 에서 이미 삭제됨. 프론트만 남아
**`CertSummary` 를 한 줄 렌더하는 순간 GET/POST findings + resolve 가 404 나는 지뢰** 상태.
(현재는 `CertSummary` 렌더 0건 + 번들러 DCE 로 런타임 영향 없음)

| 파일 | 작업 |
|---|---|
| `ElevatorPage.tsx` | 4블록 절단 (3479→3164, −315) |
| `ElevatorFindingDetailPage.tsx` | 파일 삭제 (−484) |
| `App.tsx` | lazy import / `MOBILE_NO_NAV_PATHS` 원소 / Route / showNav 절 |
| `api.ts` | `elevatorInspectionApi` 의 getFindings/createFinding/resolveFinding (−12) |
| `types/index.ts` | `ElevatorFindingStatus`, `ElevatorInspectionFinding` (−19) |

## Part B — 민원24 지적사항 폐기

한 번도 쓰인 적 없는 기능. `MinwonFindingsPanel` 정의만·렌더 0건 → 백엔드 4개 메서드 소비자 0.

- `ElevatorPage.tsx` — `MinwonFindingsPanel` (파일 마지막 최상위 심볼, −123)
- `functions/api/elevators/minwon-findings.ts` — 파일 삭제 (−75)
- **D1 `elevator_minwon_findings` 테이블은 존치** (드롭 비가역, 빈 테이블 비용 0)

## 🚨 최대 함정 — api.ts 이름 충돌

`getFindings` / `createFinding` / `resolveFinding` 이 **두 벌** 존재:

| 객체 | 라인 | 정체 | 처리 |
|---|---|---|---|
| `legalApi` | 355 / 357 / 363 | 소방 점검 (`scheduleItemId`) | **절대 보존** |
| `elevatorInspectionApi` | 374 / 378 / 382 | 승강기 (`elevatorId, inspectionId`) | 제거 |

이름 기반 grep 삭제 금지. 라인 단언 스크립트로 374–385 만 절단.

## 이식 방식 (cherry-pick 금지)

staging↔prod 가 이미 드리프트 (`ElevatorPage.tsx` 3479 vs 3475 등).
staging 커밋(`e51f2c5`/`89e93e6`)을 cherry-pick/patch 하면 안 됨 →
핸드오프의 **내용 단언 python 스크립트 + 심볼 기반 편집**만 사용.

## 게이트 (production-sync.md 표준 절차)

① 사전 점검 → ③ 상태 `작업중` → 편집 → ⑤ verify → ⑥ build+deploy → ⑦ 표 갱신·`안정` 환원 → ⑧ commit

## 성공 기준

- dead 심볼 grep 0건 / 함정 8종 생존
- tsc 0 + build 성공 + `ElevatorFindingDetailPage` 청크 소멸
- 배포 후 라우트 테이블: minwon·elevator findings 0건, **legal findings 3건 생존**
- **UI 화면 변화 0** (원래 렌더 안 되던 UI 제거이므로)
