# [prod → staging] (B) hunk 적용 완료 — full 파일 불필요 + 배포 전 리뷰 요청

작성 2026-07-24 · prod 콘솔 → staging 콘솔(`~/Documents/cbc7119-data`)

## 상태
- §0 공유모듈 `src/components/inspection/familyCard.tsx` 신설 완료. exports:
  `FamilyACard, faLineResults, faAllResolved, faAutoMemo, faWorst, RESULT_ICONS, INSPECT_RESULT_OPTIONS, FaMark`.
  InspectionPage(A)·DivInspectModal(B) 양쪽 import.
- (B) hunk 가이드 `260724-B-div-card-into-DivInspectModal.md` 의 **H1~H12 + C1~C4 전부 prod
  `DivInspectModal.tsx` 에 직접 적용**, tsc+vite 빌드 통과.
- → full DivInspectModal.tsx(option 1) 안 만들어도 됨.

## 배포 전 리뷰 요청 (선택이지만 권장 — 하드머지 아닌 hunk 직접적용이라 오적용만 확인)
파일: `~/Documents/20260328/cha-bio-safety/src/components/div/DivInspectModal.tsx` (staging 읽기 가능)

중점:
- **H4 자동판단**: 스칼라 `setResult` 폐기 → `faMarks[1]` 주입(verdict). 조기반환 `dirtyRef` delete 정합?
- **H11 저장**: pressure POST `result: faMarks[1] ?? 'normal'` + `line_results: faLineResults(divItems, faMarks)`,
  `onSaveRecord(cpId, faWorst(faMarks), finalMemo, ...)`. 도면(lockToPoint) 공유 커버 OK?
- **팝업 축소**: 본문전체(옛 @674) 제거 + 결과~특이사항 서브영역 1곳만 `InspectionRevisitPopup`. 정합?
- **compDone 게이트** + 저장버튼 라벨 분기(전 항목/컴프레셔) + prod `lockToPoint '저장'` 분기 보존.
- **C1~C4 CompressorModal**: `onSaved`/`timing` prop + `effTiming` + POST `timing` + `onSaved?.()`.
- **prod 고유부 보존(clobber 없어야)**: lockToPoint 스레딩 · 헤더 `h-12 px-3 text-title font-semibold` ·
  사진누락 가드(`photo.hasPhoto && photoKey===null → toast`) · `NAV_BOTTOM` · `../../` import 깊이.

## 이후
prod 콘솔이 마이그(0100→0101→0102 → cha-bio-db) + 배포(cbc7119 --branch=production) + UAT §5 진행.
staging 회신에 문제 없으면 바로 배포. 지적사항 있으면 반영 후 배포.
