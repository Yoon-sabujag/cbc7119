# CHA Bio Complex Fire Safety Management System

## What This Is

차바이오컴플렉스(경기도 성남시 분당구 판교로 335) 방재팀 4인을 위한 소방안전 통합관리 PWA 시스템. Cloudflare Pages + D1 + R2 기반으로 소방시설 점검, 승강기 관리, 근무표, 연차, 점검일지 출력, 일일업무일지 등을 하나의 앱에서 처리한다. v1.0 출시 완료 — 프로덕션 배포, 전수 테스트, 10종 엑셀 출력, 일정↔점검 연동까지 구현.

## Core Value

현장에서 모바일로 소방시설 점검을 기록하고, 법적 요구사항에 맞는 점검일지를 즉시 출력할 수 있어야 한다.

## Requirements

### Validated

- ✓ JWT 인증 (사원번호 + 비밀번호, 4인 계정) — v1.0
- ✓ 대시보드 (점검현황, 미조치 이슈, 오늘 일정, 승강기 고장) — v1.0
- ✓ 소방 점검 (13개 카테고리, 구역/층/개소 선택, 결과 입력, 사진, 조치 플로우) — v1.0
- ✓ QR 스캔 점검 + QR 출력 (점검용/점검확인용) + 소화기 공개 점검표 — v1.0
- ✓ 점검 계획 관리 (월간 캘린더, 일정 CRUD, 대시보드 연동) — v1.0
- ✓ 점검일지 엑셀 출력 10종 (유수검지장치, 옥내소화전, 청정소화약제, 비상콘센트, 소방펌프, 자탐, 제연, 방화셔터, 피난방화, 일일업무일지) — v1.0
- ✓ 근무표 (3교대 자동생성, 수동조정) — v1.0
- ✓ 연차 관리 (신청/승인, 잔여 계산, 6타입 확장) — v1.0
- ✓ DIV 압력 관리 (34개 측정점, 트렌드 차트) — v1.0
- ✓ 건물 도면 (층별 소방시설) — v1.0
- ✓ 승강기 고장 기록/이력 — v1.0
- ✓ Cloudflare Pages 배포 + GitHub Actions CI/CD — v1.0
- ✓ 기존 기능 전수 테스트 + 버그 수정 — v1.0
- ✓ 점검 일정 ↔ 점검 기록 연결 (대시보드 완료 자동 표시) — v1.0

### Active

- [ ] BottomNav/SideMenu 네비게이션 재편 (더보기 제거, 조치 메뉴 신규, 승강기 이동, 햄버거 통합)
- [ ] 조치 관리 페이지 (점검 불량 개소 조치 기록/확인, BottomNav 배치)
- [ ] 식사 이용 기록 + 식당 메뉴표 (개인별 식사 기록, 월별 통계, 메뉴표 관리)
- [ ] 보수교육 일정 관리 (등록, 알림, 이수 기록)
- [ ] 관리자 설정 (사용자/시스템 설정, 햄버거 메뉴 항목 분배)
- [ ] 점검자 이름 DB 기반 동적 로딩 (하드코딩 제거)
- [ ] 연속 달성일 (streakDays) 계산 구현
- [ ] 법적 점검 관리 (소방 연 2회, 일정 알림, 결과/서류 관리, 지적사항 추적)
- [ ] 승강기 법정 검사 일지, 연간 검사 일정 관리

### Out of Scope

- AI 보고서 자동작성, 소방계획서 자동생성 — 추후 별도 마일스톤
- 모바일 오프라인 점검 — 현재 네트워크 환경 충분
- OAuth/소셜 로그인 — 4인 내부 팀 전용, 사원번호 로그인 충분
- iOS PWA BottomNav 바닥 미접착 이슈 — safe-area-inset 관련, 건드리지 말 것
- 다중 건물/멀티테넌트 — 단일 건물 전용 시스템
- Web Push 알림 — 4인 팀에 과도, Workers 런타임 호환 이슈
- 도면 리뉴얼 (DWG → SVG) — DWG 레이어 미분리로 용량 이슈, 별도 마일스톤에서 처리

## Current Milestone: v1.1 UI 재편 + 기능 확장

**Goal:** BottomNav/SideMenu 네비게이션 재편과 함께 조치관리, 식사기록, 보수교육, 법적점검, 승강기검사, 관리자설정 등 잔여 기능 구현

**Target features:**
- BottomNav 재편 (더보기 제거, 조치 메뉴 신규, 승강기 이동, 햄버거 통합)
- 조치 관리 (점검 불량 개소 조치 기록/확인)
- 식사 이용 기록 + 식당 메뉴표
- 보수교육 일정 관리
- 관리자 설정 + 햄버거 메뉴 항목 분배
- 점검자 이름 동적 로딩, streakDays 계산
- 법적 점검 관리, 승강기 법정 검사

## Context

- **현재 상태:** v1.0 출시 (2026-03-31), 프로덕션 운영 중
- **대상 건물:** 차바이오컴플렉스 (지하5층~지상8층, 4층 없음, M층 있음, 사무동/연구동 분리)
- **사용자:** 방재팀 4인 (관리자 1 + 보조자 3, 3교대 근무)
- **기술 스택:** React 18 / TypeScript 5.6 / Vite 5.4 / Zustand / TanStack Query / Tailwind CSS / Cloudflare Pages Functions
- **인프라:** Cloudflare Pages + D1 (SQLite) + R2, 배포 URL: https://cbc7119.pages.dev
- **DB:** 마이그레이션 0032까지 적용, d1_migrations 추적 테이블 부트스트랩 완료
- **CI/CD:** GitHub Actions → wrangler d1 migrations apply → wrangler pages deploy
- **코드베이스:** TypeScript ~11,900 LOC, 103 commits
- **엑셀 출력:** fflate 기반 xlsx 패치 방식 (template unzip → XML patch → rezip)

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
| fflate 기반 엑셀 템플릿 패치 방식 | xlsx-js-style 대비 ~400KB 번들 절감, 양식 호환 | ✓ Good |
| iOS PWA BottomNav 이슈 미해결 | safe-area-inset 관련, 수정 시 다른 레이아웃 깨짐 위험 | ✓ Good (건드리지 않기로) |
| 재점검/버그수정 우선, 신규 개발은 그 후 | Phase 2에서 안정화 후 Phase 3-4 신규 기능 추가 | ✓ Good |
| 자탐 엑셀에 소방용전원공급반 기록 사용 | 자탐은 일상점검 영역, 소방용전원공급반만 월간 점검 수행 | ✓ Good |
| D1 수동 마이그레이션 → 추적 테이블 부트스트랩 | 초기 deploy.sh 수동 적용 → v1.0 완료 시 d1_migrations 부트스트랩 | ✓ Good |

---
*Last updated: 2026-03-31 after v1.0 milestone completion*
