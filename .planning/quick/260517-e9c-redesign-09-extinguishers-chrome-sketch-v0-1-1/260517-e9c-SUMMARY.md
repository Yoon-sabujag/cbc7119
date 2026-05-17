---
quick_id: 260517-e9c
title: redesign/09-extinguishers — chrome 영역 sketch wave 1 (헤더 portal + 마커 배너 + 4탭 + 필터 + chip 3종)
branch: redesign/09-extinguishers
date: 2026-05-17
status: sketch wave 1 완료 · 사용자 컨펌 대기
---

# 260517-e9c · 09 chrome sketch wave 1

## 작성 파일

- `cha-bio-safety/docs/redesign-context/09-extinguishers/sketch/chrome-sketch.html` (439 lines)

## 영역 범위 (ExtinguishersListPage.tsx 라인 315-485)

- 페이지 wrapper
- 헤더 portal slot "+ 새로 등록" 버튼 (GlobalHeader 설정 톱니 좌측)
- 마커 동행 안내 배너 (`?fromMarker` 진입 시 조건부)
- Filter bar wrapper (`surface-raised` + `border-default` 하단 보더)
  - Row 1: 4탭 (전체 / 배치 / 미배치 / 폐기)
  - Row 2: zone/floor/type select + 검색 input
  - Row 3: 교체 경고 chip 3종 (warn/imminent/danger, 조건부)

## 6 viewport 구성

| ID | frame | 상태 | 검증 포인트 |
|---|---|---|---|
| V1 | 모바일 | 탭 "전체" active / 배너 OFF / chip 없음 | 일상 chrome 외관 |
| V2 | 모바일 | 마커 배너 ON / 탭 "미배치" active | 조건부 배너 톤 + 자동 리셋 시나리오 |
| V3 | 모바일 | chip 3종 (warn active) | 3 status chip 톤 분기 검증 |
| V4 | 모바일 | 탭 "폐기" active | 4번째 탭 시각 |
| V5 | 데스크톱 1024 | 기본 | 데스크톱 폭 filter row flex |
| V6 | 데스크톱 1024 | 배너 + chip 3종 (imminent active) | 일괄 변형 노출 |

## 11 verify gate 결과 (모두 PASS)

```
G1 viewport markers       : 6 (≥6) PASS
G2 status-warning-bg      : 2 (≥1) PASS
G3 status-fire-bg         : 2 (≥1) PASS
G4 status-danger-bg       : 2 (≥1) PASS
G5 status-info-bg         : 2 (≥1) PASS
G6 surface-raised (filter): 7 (≥6) PASS
G7 accent (탭/등록버튼)   : 8 (≥1) PASS
G8 옛 alias               : 0 (=0) PASS
G9 linear-gradient        : 0 (=0) PASS
G10 raw hex/rgba in body  : 0 (=0) PASS
G11 emoji/shadow/blur     : 0 (=0) PASS
```

## v0.1.1 토큰 (chrome 영역 사용)

- Surface 4: page / raised / sunken / active
- Text 3: primary / secondary / tertiary
- Border 2: default / strong
- Accent: accent / accent-fg
- Status 4 페어: info / warning / fire / danger (각 fg + bar + bg)
- Radius: sm / md / pill

## 비즈니스 로직 보존 (TSX 변환 wave 에서 그대로)

- `searchParams.get('tab')` 기본값 분기 (fromMarker → 'unmapped')
- `useEffect(() => { if (hasMarkerContext) ... }, [fromMarker])` 자동 리셋
- `zones` / `floors` / `EXTINGUISHER_TYPES` 옵션 list
- `replaceCounts.warn|imm|danger` 조건부 chip 노출
- `replaceFilter === 'warn|imminent|danger'` active 분기
- `dismissMarkerContext` 핸들러

## 다음 단계

1. **사용자 시각 컨펌** — preview URL 로 6 viewport 확인
2. 컨펌 OK 시 다음 wave 후보:
   - **wave 2: 카드 영역** (소화기 카드 collapsed / expanded / disposed / 교체경고 배지)
   - wave 3: 등록 모달
   - wave 4: 수정 모달
   - wave 5: 확인 모달 4종 (delete/dispose/unassign/swap)
   - wave 6: skeleton / 빈 상태 / 에러 상태
3. 모든 sketch wave 완료 후 → TSX 변환 wave (별도 quick)

## 파일 변경 요약

```
A  cha-bio-safety/docs/redesign-context/09-extinguishers/sketch/chrome-sketch.html  (439 lines)
A  .planning/quick/260517-e9c-redesign-09-extinguishers-chrome-sketch-v0-1-1/260517-e9c-PLAN.md
A  .planning/quick/260517-e9c-redesign-09-extinguishers-chrome-sketch-v0-1-1/260517-e9c-SUMMARY.md
```
