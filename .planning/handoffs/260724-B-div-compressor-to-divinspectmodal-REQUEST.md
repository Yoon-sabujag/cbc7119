# [prod → staging 요청] (B) DIV·컴프레셔 카드를 prod DivInspectModal.tsx 로 이식

작성 2026-07-24 · prod 콘솔(`~/Documents/20260328`) → **staging 콘솔(`~/Documents/cbc7119-data`)**
FULL-PORT 핸드오프(`260724-CARD-FULLPORT-sync-to-prod.md`)의 InspectionPage HIGH 중 **DIV·컴프레셔 부분만** 분리 요청.

---

## §0. 왜 분리하나 (핸드오프가 놓친 구조 분기)

prod 는 `260626-7vq`(staging 260626-5hm 검증본)에서 **인라인 `DivModal`+`CompressorModal`+
`DivTrendSubview`+`DivUnderPicker`+DIV 상수+`detectDivTrend` 를 `src/components/div/DivInspectModal.tsx`
(1338줄) 로 추출**했다. InspectionPage 는 그걸 `import { DivInspectModal, CompressorModal }`(line 22)
해서 `<DivInspectModal>`(line 3988) 로 쓰고, **FloorPlanPage 도 같은 모듈을 공유**(lockToPoint 도면 진입).

staging 은 추출 전 fork(82875b5)라 여전히 **인라인 DivModal(1282)·CompressorModal(2002)** 이고
거기에 카드를 붙였다. → FULL-PORT 3-way 는 DIV 구역에서 **prod side 가 0줄(추출로 비어있음)** 이라
staging 인라인 카드본을 InspectionPage 에 되살리면 `<DivInspectModal>` import 와 **중복/깨짐**.

**결론:** DIV·컴프레셔 카드는 InspectionPage 가 아니라 **prod `DivInspectModal.tsx` 에 이식**해야 한다.
나머지 모달(특별피난계단·댐퍼·소방전원·공용 Family A)은 prod 에도 인라인이라 prod 콘솔에서 (A) 로 별도 진행 중.

---

## §1. (B) 범위 = staging 인라인 DivModal/CompressorModal 카드 변경

staging `82875b5..HEAD` diff 중 아래 함수 구역:
- `function DivModal(...)` (staging line ~1282~2001) — 증분 E-2 DIV Family A 카드:
  faMarks/FamilyACard/faLineResults, **i1 압력상태 = detectDivTrend 자동판정 마크**(수동 3항목만 체크),
  line_results 4원소 저장, **압력 미입력 시 i1 무마크**(리파인 1), **DIV 저장 게이트에 현재-timing 컴프레셔
  저장여부**(리파인 3, compRecords fetch + compDone).
- `function CompressorModal(...)` (staging line ~2002~2270) — **timing(월초/월말)별 저장**(리파인 2):
  `timing`/`effTiming`/`onSaved` prop 추가, POST body `timing`, 저장후 `onSaved?.()`.

해당 diff hunk 헤더(참고): `@@ 1306,17 +1326,24 @@ DivModal` … `@@ 1889,17 +1999,21 @@ DivModal`,
`@@ 1993,7 +2107,7 @@ CompressorModal` `@@ 2009,6 +2123,7 @@ CompressorModal`.
(staging 이 base..HEAD 로 정확한 diff 재추출 가능)

**중요 — DIV line_results 저장처:** 0101 주석대로 DIV 라인결과는 **`div_pressures.line_results`(압력 저장 경로
`/api/div/pressure`)** 로 간다. check_records(CP-DIV)는 line_results 없이 worst result+memo 만. prod
`pressure.ts` 는 이미 line_results 스레딩 이관됨(T0). 카드 → 압력 저장 payload 에 line_results 실리게 매핑.

---

## §2. 이식 타겟 = prod DivInspectModal.tsx 구조 (staging 이 읽고 맞춰야 할 것)

**파일:** `~/Documents/20260328/cha-bio-safety/src/components/div/DivInspectModal.tsx` (1338줄, 읽기 가능)

- `export function DivInspectModal({ onClose, onSaveRecord, initialLocationNo, monthRecords, scheduleItems, lockToPoint })` @297
- `export function CompressorModal({ onClose, onSaveRecord, initialLocationNo, mode, monthRecords, scheduleItems, lockToPoint })` @945
  — **prod CompressorModal 엔 아직 timing/onSaved 없음** → 리파인 2 여기 추가.
- `detectDivTrend`@56, `autoReason` 상태@354, `DivUnderPicker`@76, `DivTrendSubview`@155 이미 있음(재사용).
- import 깊이 `../../`(모듈이 components/div/ 하위라 staging 인라인의 `../` 아님). `MonthRecordEntry`,
  `useInspectionRevisitPopup`, `usePhotoUpload`, `DIV_POINTS`, `useDivNames` 등 이미 import.
- **카드 마커 0** — FamilyACard/faMarks/faLineResults/inspectionContent 전무. 이식으로 신설.

## §3. ★ 반드시 보존할 prod 고유부 (clobber 금지)

- **`lockToPoint` prop 전체 스레딩** (도면 진입: zone/line/지하 네비 숨김, 저장후 다음-개소 대신 onClose,
  full-screen bottom:0, safe-area 푸터). @304/498/574/626/650/712/895 등. FloorPlanPage 가 이걸로 진입.
- **헤더 스타일** `flex items-center gap-2.5 h-12 px-3 … text-title font-semibold`(@593-595), 완료뷰
  `text-title font-bold`(@577). staging 인라인 헤더로 덮지 말 것.
- **`NAV_BOTTOM` 모듈-로컬 상수**, `../../` import 경로.
- **FloorPlanPage 공유 계약** — 카드가 추가되면 도면 DIV 모달에도 뜬다. lockToPoint 경로에서 카드 line_results
  저장이 divSaveAdapter/이중쓰기와 충돌 안 하게 확인. (도면은 check_records 전용 어댑터 — DIV 압력/logs/comp
  중복쓰기 금지 계약. 카드 line_results 는 div_pressures 로 가야지 어댑터로 새면 안 됨.)

## §4. FloorPlanPage 영향 — 확인/결정 요청
카드 feature 가 DivInspectModal 에 들어가면 **도면(FloorPlanPage) DIV 마커 점검에도 카드가 노출**된다.
- 의도된 동작인가? (일반 점검과 동일 UX면 OK로 보임)
- lockToPoint=true(도면) 일 때 카드 line_results 저장 경로가 정상인지(div_pressures 로, 어댑터 우회 금지).
staging 이 판단해서 핸드오프에 명시.

---

## §5. staging 산출물 (택1, 전자 선호)
1. **(선호) prod DivInspectModal.tsx 의 카드 이식본 전체** — prod 파일을 읽어 §3 고유부 보존한 채 DivModal/
   CompressorModal 에 카드 hunk 를 얹은 최종 파일. prod 콘솔이 diff 검토 후 적용.
2. **또는 hunk 단위 이식 가이드** — "prod DivInspectModal.tsx line N 의 X 를 Y 로" 형태 + 신규 삽입 블록 verbatim.
   (대괄호/좌표 어긋남 방지 위해 앵커 문자열 인용.)

두 경우 모두: 신규 import(FamilyACard·faMarks 헬퍼·inspectionContent·FaMark 타입) 명시 + prod 모듈의 `../../` 깊이로.

## §6. prod 타겟 (혼동 금지)
- 파일: `cha-bio-safety/src/components/div/DivInspectModal.tsx` (+ InspectionPage 는 이미 import 중, 변경 불필요)
- DB=`cha-bio-db` / 배포=`cbc7119 --branch=production`. line_results 마이그(0101 div_pressures)는 prod 콘솔이 (A) 배포 때 함께 적용.

## §7. 진행 상태 (prod 콘솔, 참고)
- ✅ T0(API 8+inspectionContent+마이그 3) · T1/T2(reports/remediation/generateExcel/ExcelPreview) 커밋됨.
- 🔄 (A) InspectionPage 인라인 18충돌(특별피난계단·댐퍼·소방전원·공용 Family A) prod 콘솔 진행 중.
- ⏸ (B) = 이 요청. staging 산출물 수령 후 prod DivInspectModal.tsx 에 적용 → 통합 빌드·배포·UAT.
