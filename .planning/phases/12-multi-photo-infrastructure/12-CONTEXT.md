# Phase 12: Multi-Photo Infrastructure - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

지적사항·조치 사진을 최대 5장 저장·표시하는 공유 인프라. 법적 점검(legal_findings)의 지적 사진 + 조치 사진만 대상. 소방 점검(check_records), 도면(FloorPlanPage) 등은 이번 범위에 포함하지 않는다.

</domain>

<decisions>
## Implementation Decisions

### 적용 범위
- **D-01:** 법적 점검 지적사항(legal_findings)의 photo_key + resolution_photo_key만 다중화한다
- **D-02:** 소방 점검(check_records), 도면 인라인 점검, 승강기 고장 등은 이번 Phase에서 제외

### 사진 그리드 레이아웃
- **D-03:** 72px 정사각형 썸네일이 가로로 나열되는 가로 스크롤 행
- **D-04:** 5장 미만일 때 마지막에 점선 + 버튼 칸 표시 (기존 PhotoButton 스타일 유지)
- **D-05:** 썸네일 탭 시 yet-another-react-lightbox로 풀스크린 확대보기

### 카메라/갤러리 입력
- **D-06:** + 버튼 탭 시 `accept="image/*"` 로 바로 갤러리 열기 (iOS에서 카메라/사진 선택 시트 자동 표시)
- **D-07:** capture 속성 없이 — 카메라/갤러리 분리 버튼 불필요

### 마이그레이션 전략
- **D-08:** migration 0043에서 photo_keys TEXT DEFAULT '[]' + resolution_photo_keys TEXT DEFAULT '[]' 컬럼 추가
- **D-09:** 같은 migration에서 기존 photo_key 값을 photo_keys로 복사 (UPDATE ... SET photo_keys = '["' || photo_key || '"]' WHERE photo_key IS NOT NULL)
- **D-10:** resolution_photo_key도 동일하게 resolution_photo_keys로 복사
- **D-11:** 이후 API/프론트엔드는 photo_keys/resolution_photo_keys만 사용, 기존 photo_key 컬럼은 무시

### Claude's Discretion
- useMultiPhotoUpload hook 내부 구현 (순차 업로드 vs 병렬)
- PhotoGrid 컴포넌트 세부 스타일 (gap, border-radius 등)
- 라이트박스 플러그인 설정 (줌, 슬라이드 등)
- 에러 처리 (업로드 실패 시 재시도 UX)

</decisions>

<canonical_refs>
## Canonical References

No external specs — requirements are fully captured in decisions above

### 기존 코드 참조
- `cha-bio-safety/src/hooks/usePhotoUpload.ts` — 단일 사진 업로드 hook (확장 기반)
- `cha-bio-safety/src/components/PhotoButton.tsx` — 단일 사진 72px 썸네일 UI (스타일 참조)
- `cha-bio-safety/functions/api/legal/[id]/findings/index.ts` — 지적사항 CRUD (photo_key → photo_keys 전환 대상)
- `cha-bio-safety/functions/api/legal/[id]/findings/[fid].ts` — 지적사항 상세/수정 (photo_key → photo_keys)
- `cha-bio-safety/functions/api/legal/[id]/findings/[fid]/resolve.ts` — 조치 완료 (resolution_photo_key → resolution_photo_keys)
- `.planning/research/SUMMARY.md` — v1.2 리서치 종합 (yet-another-react-lightbox, fflate ZIP 등)
- `.planning/research/PITFALLS.md` — iOS PWA 제약, Worker 메모리 제한 등

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `usePhotoUpload`: compressImage → FormData → /api/uploads 패턴. useMultiPhotoUpload로 확장 가능
- `PhotoButton`: 72x72 점선 + 칸 스타일. PhotoGrid에서 동일 디자인 언어 재사용
- `compressImage` (imageUtils.ts): 이미지 압축 유틸리티 — 그대로 사용
- `/api/uploads` endpoint: 단일 파일 업로드 → 다중 사진은 순차 호출로 대응

### Established Patterns
- 인라인 스타일 (CSS-in-JS 객체), Tailwind 미사용 (컴포넌트 레벨)
- TanStack Query mutation으로 API 호출
- BottomSheet 패턴으로 모바일 폼 처리
- camelCase 필드 매핑 (API 응답에서 snake_case → camelCase)

### Integration Points
- LegalFindingDetailPage: 지적사항 상세에서 PhotoGrid 렌더 + 사진 추가
- LegalPage BottomSheet: 지적사항 등록 시 다중 사진 첨부 (Phase 13에서 활용)
- 조치 완료 플로우 (resolve.ts): resolution_photo_keys 지원

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

- 소방 점검(check_records) 다중 사진 — 별도 Phase
- 도면 인라인 점검 다중 사진 — 별도 Phase
- 사진 업로드 진행률 표시 — v1.2 Future Requirements (PHOTO-04)
- 사진 드래그 정렬 — v1.2 Future Requirements (PHOTO-05)

</deferred>

---

*Phase: 12-multi-photo-infrastructure*
*Context gathered: 2026-04-05*
