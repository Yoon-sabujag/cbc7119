---
quick_id: 260713-wa4
status: complete
date: 2026-07-13
branch: production
commits: [bc2895cc, 9a9b2a50]
deploy: https://395f5ce5.cbc7119.pages.dev
---

# SUMMARY — 승강기 미사용 기능 2건 폐기

## 결과

배포 완료. **1032줄 삭제** (Part A −834, Part B −198). D1 무변경.

| Part | 커밋 | 규모 | 핸드오프 예상 | 일치 |
|---|---|---|---|---|
| A findings 체인 | `bc2895cc` | 5 files, −834 | ≈ −834 | ✅ |
| B 민원24 | `9a9b2a50` | 2 files, −198 | −198 | ✅ |

`ElevatorPage.tsx` 3479 → 3164 → 3041.

## 검증

**경계 단언** — 핸드오프 스크립트의 boundary 7 + neighbor 4 전부 PASS (드리프트 0).

**dead 심볼 grep 0건** — CertSummary / CertBlock / certHasData / FindingCountBadge /
CertViewerModal / ElevatorFindingDetailPage / ElevatorInspectionFinding /
ElevatorFindingStatus / elevator/findings / MinwonFindingsPanel / minwon-findings

**함정 8종 생존** — legalApi.getFindings 1 · getNextInspection 1 · ModalWrap/Field/EmptyState 3 ·
ElevatorInfoCard 1 · LegalFindingDetailPage 2 · PdfFloorPlan.tsx 파일 · authHeader 9 ·
외부 KOELSA 민원 폼 URL(280행)

**빌드** — tsc exit=0 · build exit=0 · precache 88→87 (`ElevatorFindingDetailPage` 청크 소멸)

**배포 후 라우트 테이블 실측** (`wrangler pages functions build` 산출물):
- `/api/elevators/minwon-findings` — **소멸** ✅
- `/api/elevators/:id/inspections/:iid/findings*` — **소멸** ✅
- `/api/legal/:id/findings` + `/:fid` + `/:fid/resolve` — **3개 생존** ✅ ← 이름 충돌 함정 회피 증명
- 승강기 나머지 12개 라우트 정상

## ⚠️ 진단 교훈 (재확인)

배포 후 `curl` 로 `/api/elevators/minwon-findings` 를 찔러 401 이 나왔지만 **이건 라우트 존재 증거가 아님** —
`_middleware` 가 leaf 핸들러 유무와 무관하게 선-401. 라우트 검증은 반드시
`wrangler pages functions build` 산출물 실측으로 했음. (메모리 `feedback_api_401_not_route_existence_proof`)

## 동승 커밋 (이 배포에 최초 반영)

- `137e7161` (260713-s8m) 프론트 dead code 2건 제거 −18
- `e8bf59ad` (260713-rwb) orphan 백엔드 핸들러 5개 삭제

셋 다 동작 변화 0.

## UAT ✅ 완료 (2026-07-13 사용자 확인)

3개 지점 전부 정상 확인. **승강기 페이지 화면 변화 0** — 원래 렌더 안 되던 UI 제거이므로 의도된 결과.

- ✅ 승강기 — 목록/고장/수리/검사이력/도면 그대로
- ✅ **소방 점검(legal) — 지적사항 정상** ← 이름 충돌 함정 최종 검증 통과
- ✅ 도면 — PDF 표시 정상
- `/elevator/findings/...` 직접 URL → 라우트 없음 (의도된 폐기)

## 롤백

`git revert 9a9b2a50 bc2895cc` (프론트만 복구). 기능 실제 부활은 백엔드 핸들러도 필요 —
`~/Documents/archive/orphan-handlers-260713.tgz`
