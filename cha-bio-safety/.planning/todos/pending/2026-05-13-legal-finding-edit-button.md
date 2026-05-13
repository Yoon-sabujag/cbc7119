---
created: 2026-05-13T02:38:28.440Z
title: 소방점검관리 종합정밀 카드 지적사항 수정 버튼 추가
area: ui
files:
  - src/pages/LegalFindingsPage.tsx
  - src/pages/LegalFindingDetailPage.tsx
---

## Problem

소방점검관리 페이지의 종합정밀 카드(2026.05.) 지적사항 항목에 **삭제 버튼만 있고 수정 버튼이 없다**. 잘못 입력된 지적사항을 고칠 수 없어 한 번 등록한 항목은 삭제 후 재등록해야 하는 불편함이 있음.

2026-05-13 상반기 종합정밀 검사 시작 시점에 발견. 현재 redesign/02-inspection 브랜치 작업 중이라 보류 상태.

## Solution

- 삭제 버튼 **왼편**에 수정 버튼 추가
- 작업 브랜치: **main** (현재 redesign/02-inspection 작업이 main으로 머지된 이후 진행)
- 수정 동작은 등록 폼을 재사용하거나 인라인 편집 — 구현 시 결정
- 관련 파일 후보:
  - `src/pages/LegalFindingsPage.tsx` — 지적사항 리스트
  - `src/pages/LegalFindingDetailPage.tsx` — 지적사항 상세
- 점검 기록 수정 이력 보존 원칙(CLAUDE.md) 확인 필요 — 지적사항이 inspection 기록과 동급인지 판단
