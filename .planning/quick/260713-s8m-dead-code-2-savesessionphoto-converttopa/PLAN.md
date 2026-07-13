---
quick_id: 260713-s8m
slug: dead-code-2-savesessionphoto-converttopa
date: 2026-07-13
branch: production
---

# 프론트 dead code 2건 제거

## 배경

`260713-rwb` 에서 삭제한 orphan 백엔드 핸들러(`photo.ts`, `cert.ts`)를 호출하던 프론트 코드.
핸들러가 git 전 ref 에 없었으므로 **이미 동작 불가 상태**였고, 호출부조차 없어 실행된 적도 없음.
2026-04 미완성 작업의 잔재.

## 대상

| 파일 | 대상 | 근거 |
|---|---|---|
| `src/utils/api.ts` | `saveSessionPhoto` 래퍼 (340–341) | 정의만 존재, 호출 0건 |
| `src/pages/ElevatorPage.tsx` | `convertToPass` useMutation 블록 (2585–2599) | 선언만 존재, `.mutate()` 0건 |

호출하던 라우트: `PUT /inspections/:sessionId/photo`, `PUT /api/elevators/:id/inspections/:iid/cert`
— 둘 다 배포본에 핸들러 없음.

## 작업

1. 두 블록 제거
2. unused import 발생 여부 확인 — 발생 시에만 정리
3. `tsc --noEmit` + `vite build` 통과 검증
4. 커밋까지만 (배포 없음)

## 성공 기준

- `convertToPass` / `saveSessionPhoto` grep 0건
- tsc 에러 0, build 성공
- 동작 변화 0 (호출부가 없으므로 정의상 보장)
