---
quick_id: 260520-x4q
slug: legal-findings-edit-button
date: 2026-05-20
status: complete
---

# Summary: LegalFindings 수정 버튼 추가

## What changed

- `src/pages/LegalFindingsPage.tsx`
  - `editingFinding: LegalFinding | null` state 추가
  - 카드 우하단 createdAt 옆에 "수정" 버튼 (삭제 버튼 왼쪽), `stopPropagation` 으로 카드 click 분리
  - `FindingEditModal` 컴포넌트 신설 (같은 파일)
    - description textarea + location input (raw string 직접 편집)
    - 기존 R2 사진 미리보기 + 제거 / 새 사진 추가 (`useMultiPhotoUpload`)
    - 합산 5장 제한
    - 데스크톱(`min-width:1024px`) 520px 센터드 모달 / 모바일 bottom sheet 분기
    - 저장 시 `legalApi.updateFinding` (PUT `/api/legal/:id/findings/:fid`) → `['legal-findings', id]` + 상세 query invalidate

## Verification

- `npx tsc --noEmit` PASS
- `npm run build` PASS (23s, PWA precache 71 entries)
- 브라우저 동작 확인은 사용자가 데스크톱/모바일에서 직접 검증

## Notes

- 등록 시트의 zone/floor/inspectionItem 칩 구조는 round-trip 파싱 어려워서 수정 모달은 raw string 형태로 처리. 사용자가 조립된 문자열을 그대로 편집.
- 서버 PUT 핸들러는 이미 description/location/photo_keys partial update 지원 — 클라이언트만 추가.
