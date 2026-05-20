---
quick_id: 260520-x4q
slug: legal-findings-edit-button
date: 2026-05-20
status: complete
---

# Summary: LegalFindings 수정 버튼 추가

## What changed

- `src/components/FindingEditModal.tsx` (신규)
  - description textarea + location input (raw string)
  - 지적 사진: 기존 R2 + 신규 합산 5장 제한
  - `status === 'resolved'` 일 때만 조치 영역 추가 표시:
    - 조치 내용 textarea
    - 조치 사진: 기존 R2 + 신규 합산 5장 제한
  - 데스크톱(`min-width:1024px`) 520px 센터드 모달 / 모바일 bottom sheet
  - 저장 시 `legalApi.updateFinding` → 모든 관련 query invalidate (`legal-findings`, `legal-finding`, `legal-round`, `legal-rounds`)
- `src/pages/LegalPage.tsx` — FindingsPanel 카드 우하단에 "수정" 버튼 + 모달 렌더 (데스크톱 3-panel 메인 페이지, 실제 사용자가 보는 화면)
- `src/pages/LegalFindingsPage.tsx` — 동일 패턴 적용 (`/legal/:id` 별도 페이지)
- `functions/api/legal/[id]/findings/[fid].ts` — PUT 핸들러에 `resolution_memo`, `resolution_photo_keys` 필드 partial update 지원 추가

## Verification

- `npx tsc --noEmit` PASS
- `npm run build` PASS (23s, PWA precache 71 entries)
- 브라우저 동작 확인은 사용자가 데스크톱/모바일에서 직접 검증

## Notes

- 등록 시트의 zone/floor/inspectionItem 칩 구조는 round-trip 파싱 어려워서 수정 모달은 raw string 형태로 처리. 사용자가 조립된 문자열을 그대로 편집.
- 서버 PUT 핸들러는 이미 description/location/photo_keys partial update 지원 — 클라이언트만 추가.
