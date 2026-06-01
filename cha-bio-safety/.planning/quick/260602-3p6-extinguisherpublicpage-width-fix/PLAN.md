---
quick_id: 260602-3p6
slug: extinguisherpublicpage-width-fix
date: 2026-06-01
status: planned
---

# Quick Task: 소화기 점검표 공개 페이지 좌우 눌림(shrink-to-fit) 버그 수정

## Problem

`src/pages/ExtinguisherPublicPage.tsx` 최상위 `page` 박스 스타일(line 148)에 `width`가 없다.
부모 `<main>`(App.tsx)이 `display:flex; flex-direction:column` 이고, `page` 에 `margin:'0 auto'`(가로 auto 마진)가 있어
flexbox 규칙상 stretch 가 꺼지고 박스가 표 내용 최소폭(~260px)으로 shrink-to-fit 된다.
→ 표가 화면을 안 채우고 좌우에 `html` 다크 배경(#161b22)이 비쳐 "눌린" 것처럼 보인다.

## Fix (single line)

`const page` 객체 맨 앞에 `width:'100%'` 추가:

```js
const page: React.CSSProperties = { width:'100%', maxWidth:480, margin:'0 auto', ... }
```

`width:100%` → 부모 폭만큼 늘어남(최대 480 캡), `margin:0 auto` 로 가운데 정렬 유지 → 화면 꽉 채움.

## Scope

- 단일 파일: `src/pages/ExtinguisherPublicPage.tsx`
- `page` 스타일 객체에만 `width:'100%'` 추가. 다른 토큰/구조/표 레이아웃 변경 없음.

## Verify

- `page` 스타일에 `width:'100%'` 포함 확인 (grep)
- `npm run build` 통과 (TS/Vite)

## Out of scope

- 배포 (사용자 컨펌 후 별도 진행)
