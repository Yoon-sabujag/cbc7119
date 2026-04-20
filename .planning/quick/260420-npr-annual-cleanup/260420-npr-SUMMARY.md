---
phase: 260420-npr-annual-cleanup
plan: 01
status: complete
date: 2026-04-20
---

# Annual Tab UI Cleanup — Koelsa Card Only

## What Changed

승강기 관리 "검사 기록(annual)" 탭의 기존 UI를 완전 제거하고 공단 공식 검사이력 카드(`KoelsaHistorySection`)만 남김. PDF 파싱 유틸 2개 파일 삭제.

## Commits

- `7c10d3a` refactor(260420-npr-01): ElevatorPage annual 탭을 KoelsaHistorySection 단독으로 축소 (+29 / -846)
- `d7bec4c` chore(260420-npr-01): 고아가 된 PDF 검사성적서 파싱 유틸 2개 파일 삭제 (-168)

**총 -1014 lines, +29 lines (net -985 lines)**

## Files Modified

- `cha-bio-safety/src/pages/ElevatorPage.tsx` — annual 탭 관련 전부 제거
- `cha-bio-safety/src/utils/parseInspectionPdf.ts` — **DELETED** (156 lines)
- `cha-bio-safety/src/utils/splitInspectionPdf.ts` — **DELETED** (12 lines)

## Removed UI

- `AnnualUploadModal`, `AnnualModal` 컴포넌트 정의 + 렌더링
- `modal === 'annual_upload'` / `modal === 'annual_new'` 모달
- FAB "🔍 검사 기록 입력" 버튼
- PDF 업로드/파싱/항목별 1.1~1.15 표시 UI
- 수정/삭제 버튼 관련 핸들러
- annual 탭 데스크톱 블록 (기존 카드 리스트) → KoelsaHistorySection 단독
- annual 탭 모바일 블록 → 동일

## Removed State/Queries

- `annuals` useQuery (`['elevator_annuals']`)
- `evAnnuals`, `mainAnnuals`, `correctiveByParent` 계산
- `expandedMw`, `annualYear` 상태
- `fetchInspections('annual')` 호출
- annual 관련 mutations

## Preserved (의도적 유지)

- **Backend 전부** (`/api/elevators/inspections`, `/api/elevators/koelsa-inspect`, `/api/elevators/inspect-keys`)
- **DB 테이블 전부** (`elevator_inspections`, `koelsa_inspections`, `inspect_keys`)
- `InspectionLookupInput` / `InspectKeyEntry` — **safety 탭에서 사용 중** → 유지
- `minwon24Query` useQuery — inspect-keys 저장 플로우 유지용, 주석에 "annual UI 제거됨" 명시
- `'annual'` 탭 키 (TABS, RIGHT_TABS, 분기 조건) — 탭은 열리되 KoelsaHistorySection만 렌더
- `expandedAnnual` state — desktop `repair` 탭 카드 펼침에서도 공유 → 유지 (레거시 네이밍, repair 탭 전용으로 재정의)
- `CertViewerModal`, `CertSummary`, `CertBlock`, `FindingsPanel`, `FindingCountBadge` — 호출처 없으나 회귀 방지 위해 정의 유지 (`noUnusedLocals: false`이므로 TS 통과)

## Verification

- `npx tsc --noEmit -p cha-bio-safety/` → **0 errors**
- 금지 심볼 0건: `AnnualUploadModal`, `AnnualModal`, `parseInspectionPdf`, `splitInspectionPdf`, `annual_upload`, `evAnnuals`, `mainAnnuals`, `yearAnnuals`, `yearMainAnnuals`, `correctiveByParent`, `expandedMw`, `annualYear`, `fetchInspections`
- 필수 심볼: `KoelsaHistorySection`=3 (import + desktop + mobile), `tab === 'annual'`=2, `desktopRightTab === 'annual'`=2
- 다른 탭(fault, repair, inspect, safety) 모두 정상 유지

## Deploy Notes

1. 빌드 + 배포: `cd cha-bio-safety && npm run build && npx wrangler pages deploy dist --branch production`
2. DB 마이그레이션 없음 (이번 작업은 UI only)
3. 백엔드 코드 변경 없음 → D1 data 건드리지 않음

배포 후 검사 기록 탭에는 KoelsaHistorySection 카드 하나만 표시됩니다.
