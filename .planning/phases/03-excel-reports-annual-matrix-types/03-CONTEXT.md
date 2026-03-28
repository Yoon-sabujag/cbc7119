# Phase 3: Excel Reports — Annual Matrix Types - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

법정 요구 점검일지 9종(기존 4종 교체 + 신규 5종)을 사용자가 제공한 양식(`점검 일지 양식.xlsx`)과 동일한 레이아웃으로 엑셀 출력한다. 연 1회 출력이며, 점검 기록 DB 데이터를 기반으로 자동 채워진다.

</domain>

<decisions>
## Implementation Decisions

### 양식 파일
- **D-01:** 기준 양식 파일은 `작업용/점검 일지 양식/점검 일지 양식.xlsx` (10시트)
- **D-02:** 이 파일을 `public/templates/`에 ASCII 파일명으로 복사하여 프로덕션 템플릿으로 사용 (Phase 2에서 한글 파일명 문제 확인됨)

### 출력 범위
- **D-03:** 기존 엑셀 4종(유수검지/소화전/청정소화약제/비상콘센트)을 사용자 양식으로 **교체** + 신규 5종(소방펌프/자탐/제연/방화셔터/피난방화) 추가 = 총 9종
- **D-04:** 유수검지는 월초/월말 2개 시트 별도 존재 — 각각 출력

### 출력 단위
- **D-05:** 양식이 1년치(12개월 매트릭스)이므로 연 1회 출력
- **D-06:** 출력 시 연도 선택 UI 필요 (기본값: 현재 연도)

### 데이터 매핑
- **D-07:** 점검 결과 → 기호 변환: 점검 기록이 있으면 **○** (normal/caution/bad 구분 없이)
- **D-08:** 점검 기록이 없으면 빈 셀 (기호 없음)
- **D-09:** ○만 사용 — △/× 기호는 사용하지 않음

### Excel 생성 방식
- **D-10:** 현재 `generateExcel.ts`의 `patchCell()` 방식은 사용자 양식(shared-string `t="s"`)과 비호환 — Phase 2 M-05에서 확인
- **D-11:** shared-string 방식 셀 패치 로직으로 전면 재작성 필요 (또는 inline-string으로 변환하는 새 패치 함수)
- **D-12:** fflate(unzip→patch XML→rezip) 패턴 유지 — Workers CPU 제한 때문에 클라이언트 사이드 생성

### Claude's Discretion
- shared-string vs inline-string 패치 방식 선택
- 9종 엑셀 생성 함수의 코드 구조 (공통 헬퍼 추출 정도)
- 출력 페이지 UI 레이아웃 (기존 /report 페이지 확장)
- 월별 데이터 쿼리 최적화 방식

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 양식 파일 (원본)
- `작업용/점검 일지 양식/점검 일지 양식.xlsx` — 10시트 기준 양식. 시트 목록: 월초 유수검지 장치 점검표, 월말 유수검지 장치 점검표, 옥내소화전 점검표, 비상콘센트 점검표, 청정소화약제설비 점검표, 월간 피난방화시설 점검일지, 월간 방화셔터 점검일지, 월간 제연설비 점검일지, 자동화재탐지설비 점검일지, 월간 소방펌프 점검일지

### 기존 Excel 생성 코드
- `cha-bio-safety/src/utils/generateExcel.ts` — fflate 기반 xlsx 패치 패턴, patchCell() 함수, shared-string 비호환 이슈

### Phase 2 발견 사항
- `.planning/phases/02-stabilization-code-quality/02-04-SUMMARY.md` — M-05 이관 사유: shared-string `t="s"` vs inline-string `t="str"` 비호환
- `.planning/phases/02-stabilization-code-quality/02-02-BUG-REPORT.md` — M-05 엑셀 양식 불일치 상세

### 요구사항
- `.planning/REQUIREMENTS.md` — EXCEL-01~05 상세

</canonical_refs>

<deferred>
## Deferred Ideas

(없음)

</deferred>
