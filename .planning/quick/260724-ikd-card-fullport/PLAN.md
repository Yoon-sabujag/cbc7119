---
quick_id: 260724-ikd
slug: card-fullport
date: 2026-07-24
status: in-progress
---

# 점검 내용 카드 프로젝트 FULL-PORT (staging cbc7119-data → prod)

## 목표
staging(`cbc7119-data`)에서 UAT 완료된 "점검 내용 카드" 프로젝트(증분 A~E-2 + 리파인 4건:
DIV 압력카드·컴프레셔 timing·소방전원)를 prod(`cha-bio-safety`, branch=production, DB=cha-bio-db)에
**처음** 이관. prod는 카드 프로젝트 0%(7-22 이전 버전)라 delta 패치가 아니라 full-port.

**권위 문서:** `~/Documents/cbc7119-data/.planning/handoffs/260724-CARD-FULLPORT-sync-to-prod.md`
(이 문서가 옛 `260724-div-comp-pp-sync-to-prod.md`(4-delta 전제)를 supersede)

## 실측 증거 (2026-07-24, prod 콘솔)

### prod 라이브 DB (cha-bio-db)
- `check_records`: `line_results`·`remediation_symbol` **없음** → 0100 필요 (2컬럼 ADD, 비파괴)
- `div_pressures`: `timing`+`UNIQUE(year,month,timing,location_no)` **있음**(0068 라이브). `line_results` **없음** → 0101 필요
- `comp_inspections`: `UNIQUE(div_id,year,month)` (옛). `timing` 없음 → 0102 필요 (재생성, comp-inspection.ts 원자결합)

### 파일 발산 실측 (prod current ↔ staging fork-base 82875b5)
- **발산 0 (통짜 안전)**: API 8종(`[sessionId]/records`·`records`·`comp-inspection`·`pressure`·
  `remediation/[recordId]`·`remediation/index`·`reports/check-monthly`·`reports/div`) +
  `useInspectionRevisitPopup.ts` + `types/index.ts` = 10파일 (+ 신규 `inspectionContent.ts`)
- **발산≠0 (통짜 금지, hunk 이식)**: `InspectionPage.tsx`(발산1590/churn2118) ·
  `ExcelPreview.tsx`(121/99) · `generateExcel.ts`(59/100) · `ReportsPage.tsx`(6/19) ·
  `RemediationDetailPage.tsx`(30/18) · `RemediationPage.tsx`(137/4)

### 바이너리
- prod `annual_matrix_template.xlsx` = `8a7527e6…` = **fork 순정 base** → §8 case (B) 통짜 복사 안전
  (복사 후 `cb1250de…` 검증). PNG 2개(report-07/08) 단순 복사.

## 실행 순서 (원자 커밋)
1. **T0 통짜(11)**: inspectionContent.ts(신규) + API 8 + useInspectionRevisitPopup + types/index.ts.
   staging HEAD 통짜 복사(발산 0이라 hunk 이식과 수학적 동일). + 마이그 파일 3개 복사.
2. **T1/T2 hunk(5)**: ReportsPage·RemediationDetailPage·RemediationPage(소형) + generateExcel·ExcelPreview(중형).
   카드 hunk만 prod 위 이식, prod 고유부 보존.
3. **T3 InspectionPage(HIGH)**: 신규 모듈(FamilyACard·헬퍼·상수) 통짜 + 5개 모달(Stairwell/Damper/
   PowerPanel/Div + onSave 시그니처) 3-way 이식. prod 헤더 스타일(h-12/px-3/text-title) 보존.
4. **바이너리(3)**: case (B) 통짜 복사 + xlsx 해시 검증.
5. **빌드**: `npm run build` (컴파일 통과 확인).
6. **마이그 → cha-bio-db**: 0100 → 0101 → 0102(배포 직전). 전부 코드 배포 前.
7. **배포**: pages deploy dist --project-name=cbc7119 --branch=production (메인 Claude 직접).
8. **UAT §5**: DIV 4건 + 전 카테고리 회귀(소화기/유도등 저장·조치·리포트 10종).

## 리스크 & 안전장치
- 🔴 0100은 코드 배포 前 필수 (4개 공용 엔드포인트 참조 → 컬럼 부재 시 전앱 500).
- 🟠 0102↔옛 코드 창: 0102 적용~배포 완료 사이 옛 comp-inspection ON CONFLICT 불일치 →
  컴프레셔 저장만 일시 에러. 0102를 배포 직전 마지막 적용해 창 최소화.
- ⚪ 0096(drop_minwon) 이관 제외 (§4).
- 🛡️ production 브랜치 직접(worktree 금지) + 서브에이전트 prod deploy 금지 + 발산≠0 통짜 금지.
- 커밋 메시지 bare "wrangler" 단어 금지(require-production-branch 훅 오탐).

## 롤백
- 코드: 파일 revert. DB 0102: 역마이그 필요(재생성). 코드+0102 같이 적용/같이 롤백.
