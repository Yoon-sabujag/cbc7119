---
created: 2026-04-03T16:20:30.170Z
title: Implement settings panel features
area: ui
files:
  - src/components/SettingsPanel.tsx
---

## Problem

SettingsPanel.tsx의 설정 항목들이 로컬 React state만 변경하고 실제 동작하지 않음. 토글/셀렉트 조작해도 아무 효과 없이 UI만 바뀜.

### 미구현 항목

**계정 카테고리:**
- 계정 프로필 변경 (신규 추가) — 이름/연락처 등 프로필 수정 UI + API 엔드포인트
- 비밀번호 변경은 이미 `authApi.changePassword`로 구현됨 (제외)

**알림 카테고리:**
- 점검 미완료 알림 (마감 1시간 전) — 백엔드 알림 시스템 연동 필요
- 미조치 항목 알림 (매일 09:00) — 백엔드 알림 시스템 연동 필요
- 승강기 점검 D-7 알림 — 백엔드 알림 시스템 연동 필요

**화면 카테고리:**
- 테마 변경 (다크/라이트/시스템) — 실제 CSS 변수 전환 + localStorage 저장
- 주간 현황 기준 (이번 주/최근 7일) — 대시보드 데이터 조회 기준 연동
- 결과 즉시 저장 토글 — 점검 결과 자동저장 로직 연동

## Solution

1. **계정 프로필 변경**: staff 테이블에 PUT /api/auth/profile 엔드포인트 추가, SettingsPanel에 프로필 편집 폼 추가
2. **알림**: Cloudflare Workers 환경에서 Push API 또는 주기적 체크 방식 검토 필요 (Service Worker 기반 로컬 알림이 현실적)
3. **화면 설정**: Zustand store + localStorage persist로 설정값 저장, CSS 변수 토글 로직 구현
4. **주간 현황/즉시 저장**: 대시보드 API 파라미터화 + 점검 페이지 자동저장 로직 추가
