---
quick_id: 260504-mwn
status: complete
date: 2026-05-04
commit: 4edeb94
---

# 260504-mwn — 업무수행기록표 엑셀 출력 깨짐 수정 (완료)

## 결과
- 사용자 제보: 업무수행기록표 엑셀 다운로드 후 열면 서식 다 깨지고 조치사항 셀에 `&#10;` 리터럴 출력
- 원인 2종 식별 후 일괄 수정·배포

## 수정 내역

### Bug 1: `firstSheet="1"` dangling pointer
- `src/utils/generateExcel.ts` 928 라인 직후에 `wbXml.replace(/firstSheet="\d+"/, 'firstSheet="0"')` 추가
- 작성법 시트(idx 1) 삭제 후 firstSheet 인덱스 미보정 → Excel 복구 모드 진입 → 서식 파괴

### Bug 2: AA 셀 `\n` 이중 이스케이프
- `src/utils/generateExcel.ts` 1047-1058 라인의 `.replace(/\n/g, '&#10;')` 4곳 제거
- raw `\n` 으로 통일 (C10/C17/C24/C31 확인내용 셀과 동일 방식, 셀 wrapText 스타일이 줄바꿈 처리)
- patchCell 내부 `esc()` 가 `&` → `&amp;` 로 재이스케이프하던 문제 해소

## 검증
- 빌드 산출물(`dist/assets/generateExcel-B32Lmv59.js`):
  - `firstSheet="0"` 포함 ✓
  - `*_action.replace` 호출 0건 ✓
- 프로덕션 배포 완료: `https://a60d53bf.cbc7119.pages.dev`
- git push 완료: `4edeb94`

## 사용자 액션
- PWA 캐시 때문에 즉시 반영 안 될 수 있음 → 앱 재설치 후 4월분 출력 재테스트
- 5월부터 신규 출력 시 정상 동작 확인 필요

## 변경 파일
- `cha-bio-safety/src/utils/generateExcel.ts` (+8 -5)

## 커밋
- `4edeb94 fix(worklog): repair Excel corruption on workrecord export`
