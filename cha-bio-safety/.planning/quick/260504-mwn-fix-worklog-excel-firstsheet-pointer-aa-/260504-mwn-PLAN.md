---
quick_id: 260504-mwn
description: 업무수행기록표 엑셀 출력 깨짐 수정 (firstSheet dangling + AA셀 \n 이중이스케이프)
date: 2026-05-04
mode: quick
---

# 260504-mwn — 업무수행기록표 엑셀 출력 깨짐 수정

## 증상
사용자가 업무수행기록표 엑셀 출력 버튼을 누르면 다운로드된 파일이 Excel에서 "복구된 파일" 모드로 열리며 서식·테두리가 무너지고, 조치사항 셀에 `&#10;` 텍스트가 그대로 노출됨.

## 진단

### Bug 1: `firstSheet="1"` dangling pointer
- 파일: `cha-bio-safety/src/utils/generateExcel.ts` (`generateWorkLogExcel`, 라인 920~928)
- 템플릿 `worklog_template.xlsx` 의 `xl/workbook.xml` 에 `<workbookView ... firstSheet="1" ...>` 가 들어있음 (작성법 시트를 먼저 보여주려는 설정)
- 코드는 `작성법` 시트(idx 1, sheetId="3")를 삭제하고 `activeTab="1"→"0"` 만 보정
- `firstSheet="1"` 은 그대로 남아 Excel이 존재하지 않는 시트 인덱스 1을 열려고 하다가 자동 복구 모드 진입 → 서식 파괴

### Bug 2: 조치사항 셀 `\n` 이중 이스케이프
- 파일: `cha-bio-safety/src/utils/generateExcel.ts` (`generateWorkLogExcel`, 라인 1045-1056)
- 코드:
  ```ts
  xml = patchCell(xml, 'AA10', data.fire_action.replace(/\n/g, '&#10;'))
  ```
- `patchCell` 내부 `esc()` 가 `&` → `&amp;` 로 다시 이스케이프
- 결과 XML: `<v>2016년 제작&amp;#10;소화기 교체 -19EA</v>` → 셀에 리터럴 `&#10;` 표시
- 동일 함수 내 C10/C17/C24/C31 (확인내용 셀) 은 raw `\n` 을 그대로 넘겨서 정상 동작 중. 같은 방식으로 통일.

## 수정

**generateExcel.ts:928 직후 추가**
```ts
wbXml = wbXml.replace(/firstSheet="\d+"/, 'firstSheet="0"')
```

**generateExcel.ts:1045-1056 — 4곳에서 `.replace(/\n/g, '&#10;')` 제거**
- 1045: `data.fire_action.replace(...)` → `data.fire_action ?? ''`
- 1046: `data.escape_action.replace(...)` → `data.escape_action ?? ''`
- 1051: `(data.gas_action ?? '').replace(...)` → `data.gas_action ?? ''`
- 1056: `(data.etc_action ?? '').replace(...)` → `data.etc_action ?? ''`

## 검증
1. `npm run build` 성공
2. `dist/assets/index-*.js` (또는 generateExcel 청크) grep:
   - `firstSheet="0"` 포함 확인
   - `&#10;` 패턴 없음 확인 (`replace(/\n/g, '&#10;')` 제거된 결과)
3. 프로덕션 배포: `npx wrangler pages deploy dist --branch production --commit-message "fix worklog excel"`
4. 사용자 PWA 재설치 후 4월분 출력 테스트

## 파일
- `cha-bio-safety/src/utils/generateExcel.ts`

## 커밋
- `fix(worklog): repair Excel corruption — firstSheet pointer + AA cell newline escape`
