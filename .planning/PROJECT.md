# CHA Bio Complex Fire Safety Management System

## What This Is

차바이오컴플렉스(경기도 성남시 분당구 판교로 335) 방재팀 4인을 위한 소방안전 통합관리 PWA 시스템. Cloudflare Pages + D1 + R2 기반으로 소방시설 점검, 승강기 관리, 근무표, 연차, 점검일지 출력 등을 하나의 앱에서 처리한다. 1단계(MVP) 95% 완료 상태에서 전체 재점검/버그수정 후 잔여 기능을 구현하고 배포까지 완료하는 것이 목표.

## Core Value

현장에서 모바일로 소방시설 점검을 기록하고, 법적 요구사항에 맞는 점검일지를 즉시 출력할 수 있어야 한다.

## Requirements

### Validated

- ✓ JWT 인증 (사원번호 + 비밀번호, 4인 계정) — 1단계
- ✓ 대시보드 (점검현황, 미조치 이슈, 오늘 일정, 승강기 고장) — 1단계
- ✓ 소방 점검 페이지 (13개 카테고리, 구역/층/개소 선택, 결과 입력, 사진, 조치 플로우) — 1단계
- ✓ QR 스캔 점검 + QR 출력 (점검용/점검확인용) + 소화기 공개 점검표 — 1단계
- ✓ 점검 계획 관리 (월간 캘린더, 일정 CRUD, 대시보드 연동) — 1단계
- ✓ 점검일지 엑셀 출력 4종 (유수검지장치, 옥내소화전, 청정소화약제, 비상콘센트) — 2단계
- ✓ 근무표 (3교대 자동생성, 수동조정) — 1단계
- ✓ 연차 관리 (신청/승인, 잔여 계산) — 1단계
- ✓ DIV 압력 관리 (34개 측정점, 트렌드 차트) — 1단계
- ✓ 건물 도면 (층별 소방시설) — 1단계
- ✓ 승강기 고장 기록/이력 — 1단계

### Active

- [ ] 기존 완료 기능 전수 동작 테스트 + 코드 품질 점검 + 버그 수정
- [ ] 점검일지 엑셀 출력 6종 추가 (소방펌프, 자탐, 제연, 방화셔터, 피난방화시설, 일일업무일지)
- [ ] 승강기 실데이터 연동 (법정 검사 일지, 연간 검사 일정 관리)
- [ ] 보수교육 일정 관리 (등록, 알림, 이수 기록)
- [ ] 식사 이용 기록 (개인별 식사 기록, 월별 통계)
- [ ] 법적 점검 관리 (소방 연 2회, 일정 알림, 결과/서류 관리, 지적사항 추적)
- [ ] 관리자 설정 (사용자/시스템 설정, 소방시설 현황 관리)
- [ ] 점검 일정 ↔ 점검 기록 연결 로직
- [ ] Cloudflare Pages 배포 이슈(504) 해결 + 실제 배포 확인

### Out of Scope

- 4단계 기능 (일일보고서 AI 자동작성, 소방계획서 자동생성) — 추후 별도 마일스톤
- 모바일 오프라인 점검 — 현재 네트워크 환경 충분
- OAuth/소셜 로그인 — 4인 내부 팀 전용, 사원번호 로그인 충분
- iOS PWA BottomNav 바닥 미접착 이슈 — safe-area-inset 관련, 건드리지 말 것 (영구 미해결 판단)

## Context

- **대상 건물:** 차바이오컴플렉스 (지하5층~지상8층, 4층 없음, M층 있음, 사무동/연구동 분리)
- **사용자:** 방재팀 4인 (관리자 1 + 보조자 3, 3교대 근무)
- **기술 스택:** React 18 / TypeScript / Vite / Zustand / TanStack Query / Tailwind CSS / Hono (API)
- **인프라:** Cloudflare Pages + D1 (SQLite) + R2, 배포 URL: https://cbc7119.pages.dev
- **DB:** 마이그레이션 0023까지 적용 (2026-03-28 기준)
- **개발 방식:** Claude AI 보조 개발, 로컬 Git 커밋 완료 (89 files), GitHub 원격 미생성
- **참고 양식 파일:** `점검항목/소방설비_월간점검일지_2026.xlsx`, `점검항목/비상콘센트_점검일지_연도입력형_2026.xlsx`, `점검항목/각종 점검일지.xlsx`, `점검항목/일일업무일지(00월).xlsx`
- **기존 설계서:** `cbio_fire_system_design.md` (전체 설계), `cbio_fire_progress_report_20260328.md` (진행 보고서)

## Constraints

- **Tech stack:** Cloudflare 생태계 고정 (Pages + D1 + R2 + Workers) — 이미 유료 플랜 구독 중, 추가 비용 $0 목표
- **Users:** 4인 내부 팀 전용 — 트래픽 매우 낮음, 복잡한 스케일링 불필요
- **Compatibility:** PWA, iOS 16.3.1+ / Android 15+ / PC (1920x1080)
- **Data integrity:** 점검 기록 삭제 불가 원칙 (수정 이력 보존)
- **Excel output:** 기존 양식 파일과 호환되는 형태로 출력 필수

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Cloudflare 올인 (Pages + D1 + R2) | 유료 플랜 이미 구독, 추가 비용 $0, 서버리스 | ✓ Good |
| JWT 자체 인증 (Cloudflare Access 미사용) | 4인 내부 팀, 사원번호 로그인이 현장에서 편리 | ✓ Good |
| 엑셀 템플릿 복사 방식 출력 | 기존 양식 파일 호환, 현장 인쇄 요구사항 | — Pending |
| iOS PWA BottomNav 이슈 미해결 | safe-area-inset 관련, 수정 시 다른 레이아웃 깨짐 위험 | ✓ Good (건드리지 않기로) |
| 재점검/버그수정 우선, 신규 개발은 그 후 | 기존 코드 안정화 후 신규 기능 추가 | — Pending |

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
*Last updated: 2026-03-28 after initialization*
