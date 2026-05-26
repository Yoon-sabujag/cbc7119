---
quick_id: 260520-x4q
slug: legal-findings-edit-button
date: 2026-05-20
status: in-progress
---

# Quick: LegalFindings 수정 버튼 추가

## Context

`LegalFindingsPage` (모바일/데스크톱 공용 — `/legal/:id`) 의 지적사항 카드 우하단에 "삭제" 버튼만 있고 "수정" 버튼이 없음 (`src/pages/LegalFindingsPage.tsx:542`). 서버 PUT `/api/legal/:id/findings/:fid` (`functions/api/legal/[id]/findings/[fid].ts`) 는 `description`/`location`/`photo_keys` partial update 이미 지원. 클라이언트 UI 만 보충하면 됨.

## Scope

지적사항 카드에 "수정" 버튼 + 수정 모달 추가.

## Out of Scope

- 조치(remediation) 수정 (이미 `RemediationDetailPage` 에서 처리됨)
- 등록 시트의 zone/floor/inspectionItem 구조 파싱 (legacy 데이터 형식이 일관적이지 않아 raw string 으로 처리)

## Design Decisions

1. **Edit UI = raw textarea/input 형태** — 등록 시트는 zone/floor/item 칩으로 location/description 을 조립하는데, edit 모드에서 round-trip 파싱하기엔 legacy 데이터 형식이 일관적이지 않음. 따라서 수정 모달은 단순 `description` 텍스트 + `location` 텍스트 입력으로 처리. 사용자가 조립된 문자열을 그대로 편집.
2. **사진 핸들링** — 기존 R2 키들은 별도 array 로 관리 + `useMultiPhotoUpload` 는 새 사진 추가에만 사용. 저장 시 `[...existingKeys, ...uploadedNewKeys]` 결합. 합쳐서 5장 제한.
3. **모달 레이아웃** — 데스크톱(`min-width:1024px`)은 520px 센터드 모달, 모바일은 bottom sheet — `FindingBottomSheet` 의 isDesktopSheet 분기 동일하게 적용.
4. **새 컴포넌트 위치** — `FindingEditModal` 을 `LegalFindingsPage.tsx` 내부에 추가 (등록 시트와 동거). 추후 분리 필요해지면 옮김.
5. **수정 버튼 위치** — 카드 우하단 createdAt 옆 (삭제 버튼 왼쪽). 같은 fontSize/color/style 적용해서 일관성 유지.

## Tasks

- [ ] LegalFindingsPage.tsx 에 `editingFinding` state 추가
- [ ] findingCard 에 "수정" 버튼 추가 (삭제 버튼 옆, stopPropagation)
- [ ] `FindingEditModal` 컴포넌트 추가 (같은 파일 내)
  - 입력: description textarea, location input
  - 사진: 기존 R2 키 미리보기 + 제거 / 추가 슬롯 (useMultiPhotoUpload)
  - 데스크톱 modal vs 모바일 bottom sheet 분기
  - 저장 시 PUT 호출, queryClient.invalidateQueries
- [ ] 메인 페이지 return 에 모달 렌더 (편집 중일 때만)
- [ ] tsc 통과 확인
- [ ] dev 서버 띄워서 데스크톱/모바일 양쪽 동작 확인

## Verification

- 데스크톱: 카드의 "수정" 버튼 클릭 → 520px 모달 열림 → 내용/위치/사진 수정 → 저장 → 카드 갱신
- 모바일: 카드의 "수정" 버튼 클릭 → bottom sheet → 동일
- 사진 5장 제한 (기존 + 추가 합산) 유효
- 카드 클릭 → 상세 페이지 이동은 그대로 (수정 버튼 click 은 stopPropagation)
