# CHA Bio Complex Fire Safety Management System

## What This Is

차바이오컴플렉스(경기도 성남시 분당구 판교로 335) 방재팀 4인을 위한 소방안전 통합관리 PWA 시스템. Cloudflare Pages + D1 + R2 기반으로 소방시설 점검, 승강기 관리, 근무표, 연차, 점검일지 출력 등을 하나의 앱에서 처리한다.

## Core Value

현장에서 모바일로 소방시설 점검을 기록하고, 법적 요구사항에 맞는 점검일지를 즉시 출력할 수 있어야 한다.

## Requirements

### Validated

- ✓ JWT 기반 인증 (로그인/로그아웃, 12시간 만료) — v1.0
- ✓ 소방시설 점검 세션 생성/기록/조회 — v1.0
- ✓ 점검 결과 사진 촬영 및 R2 업로드 — v1.0
- ✓ 대시보드 통계 (점검 현황, 주간 진행률) — v1.0
- ✓ 근무표/교대 일정 관리 — v1.0
- ✓ 승강기 점검 관리 — v1.0
- ✓ 엑셀 점검일지 출력 (기존 양식 호환) — v1.0
- ✓ PWA 설치 및 모바일 최적화 — v1.0
- ✓ 비밀번호 변경 — v1.0

### Active

- [ ] 데스크톱 레이아웃 최적화 (1920x1080)
- [ ] File System Access API로 점검일지 폴더 지정 자동 저장
- [ ] 설정 패널 기능 구현 (테마, 알림, 계정 프로필)
- [ ] 메뉴표 업로드 간소화 (드래그 앤 드롭)
- [ ] 데스크톱 UX 개선

### Out of Scope

- 네이티브 데스크톱 앱 (Electron/Tauri) — PWA 최적화로 충분, 향후 필요시 재검토
- 복잡한 스케일링/CDN — 4인 내부 팀 전용, 트래픽 매우 낮음
- 추가 유료 서비스 — Cloudflare 유료 플랜 내에서 해결

## Current Milestone: v1.1 PWA 데스크톱 최적화

**Goal:** 데스크톱 환경(1920x1080)에서 PWA를 최적화하여, IT 역량이 낮은 사용자도 복잡한 조작 없이 소방시설을 관리할 수 있게 한다.

**Target features:**
- 1920x1080 데스크톱 레이아웃 (사이드바, 넓은 테이블, 멀티 패널)
- File System Access API로 점검일지 폴더 지정 자동 저장
- 설정 패널 미구현 기능 구현 (테마, 알림, 계정 프로필 변경)
- 메뉴표 업로드 간소화 (드래그 앤 드롭)
- 데스크톱 UX 개선 (키보드 단축키, 인쇄 최적화 등)

## Context

- MVP(v1.0) 95% 완료 상태. 모바일 점검 기록/출력 핵심 기능은 동작 중.
- 설정 패널 UI는 존재하나 알림/테마/프로필 등 실제 동작 미구현.
- 사용자 4인 중 IT 능숙자 있지만, 향후 인력 교체 시에도 사용 가능하도록 조작 최소화가 핵심 목표.
- 데스크톱에서 주로 하는 작업: 엑셀 점검일지 출력, 인쇄, 대시보드 확인, 메뉴표 관리.

## Constraints

- **Tech stack**: Cloudflare 생태계 고정 (Pages + D1 + R2 + Workers) — 이미 유료 플랜 구독 중, 추가 비용 $0 목표
- **Users**: 4인 내부 팀 전용 — 트래픽 매우 낮음
- **Compatibility**: PWA, iOS 16.3.1+ / Android 15+ / PC (Chrome/Edge, 1920x1080)
- **Data integrity**: 점검 기록 삭제 불가 원칙 (수정 이력 보존)
- **Excel output**: 기존 양식 파일과 호환되는 형태로 출력 필수
- **File API**: File System Access API는 Chrome/Edge 전용 — Safari/Firefox 미지원 허용

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PWA 유지 (네이티브 앱 X) | 4인 팀 규모에서 네이티브 빌드 파이프라인은 오버헤드. PWA+File System Access API로 80% 커버 가능 | — Pending |
| File System Access API 채택 | 점검일지 폴더 자동 저장 필요. 브라우저 재시작 시 권한 재요청 1회 감수 | — Pending |
| Chrome/Edge 타겟 | File System Access API 지원 브라우저 한정. 데스크톱 PC는 Chrome 강제 가능 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-04 after milestone v1.1 initialization*
