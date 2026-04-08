# CHA Bio Complex Fire Safety Management System

## What This Is

차바이오컴플렉스(경기도 성남시 분당구 판교로 335) 방재팀 4인을 위한 소방안전 통합관리 PWA 시스템. Cloudflare Pages + D1 + R2 기반으로 소방시설 점검, 승강기 관리, 법적검사, 보수교육, 식사기록, 근무표, 연차, 점검일지 출력, 일일업무일지 등을 하나의 앱에서 처리한다. v1.1 출시 완료.

## Core Value

현장에서 모바일로 소방시설 점검을 기록하고, 법적 요구사항에 맞는 점검일지를 즉시 출력할 수 있어야 한다.

## Requirements

### Validated

- ✓ JWT 인증 (사원번호 + 비밀번호, 4인 계정) — v1.0
- ✓ 대시보드 (점검현황, 미조치 이슈, 오늘 일정, 승강기 고장, 연속 달성일) — v1.0, v1.1
- ✓ 소방 점검 (13개 카테고리, 구역/층/개소 선택, 결과 입력, 사진, 조치 플로우) — v1.0
- ✓ QR 스캔 점검 + QR 출력 + 소화기 공개 점검표 — v1.0
- ✓ 점검 계획 관리 (월간 캘린더, 일정 CRUD, 대시보드 연동) — v1.0
- ✓ 점검일지 엑셀 출력 10종 — v1.0
- ✓ 근무표 (3교대 자동생성, 수동조정) — v1.0
- ✓ 연차 관리 (신청/승인, 잔여 계산, 6타입 확장) — v1.0
- ✓ DIV 압력 관리 (34개 측정점, 트렌드 차트) — v1.0
- ✓ 건물 도면 (층별 소방시설, 마커 시스템) — v1.0, v1.1
- ✓ 승강기 고장 기록/이력/수리 통합 뷰 — v1.0, v1.1
- ✓ Cloudflare 배포 + CI/CD — v1.0
- ✓ BottomNav/SideMenu 네비게이션 재편 — v1.1
- ✓ 조치 관리 (불량 개소 조치 기록/확인, 사진) — v1.1
- ✓ 식사 기록 + 메뉴표 PDF 관리 + 통계 — v1.1
- ✓ 보수교육 관리 (등록, 이수, 인증서, D-day) — v1.1
- ✓ 관리자 설정 (직원 CRUD, 개소 관리, 메뉴 편집) — v1.1
- ✓ 점검자 이름 동적 로딩 + 연속 달성일 — v1.1
- ✓ 법적 점검 (지적사항 조치 추적, 서류 R2) — v1.1
- ✓ 승강기 검사 인증서 + 수리 통합 + 검사 도래 알림 — v1.1
- ✓ 다중 사진 인프라 + 지적사항 BottomSheet + 점검 일정 날짜범위 + 지적사항 다운로드 — v1.2
- ✓ 설정 페이지 진입점 + 프로필/비밀번호/로그아웃 — v1.3
- ✓ PWA 푸시 알림 구독·해제 + 알림 유형별 토글 + Cron Worker — v1.3
- ✓ SideMenu divider 모델 커스터마이징 + 설정 섹션 접힘/펼침 — v1.3
- ✓ 앱 빌드 버전 표시 + 서비스워커 캐시 초기화 — v1.3

### Active

- [ ] 소방계획서 중앙 관리 (admin 업로드, 전체 다운로드, 연도별 이력)
- [ ] 소방훈련자료 중앙 관리 (admin 업로드, 전체 다운로드, 연도별 이력, 대용량 파일)
- [ ] 소방안전관리자 업무수행기록표 프로그램 내 작성 + 기존 양식 엑셀 출력

## Current Milestone: v1.4 문서 관리

**Goal:** 소방 관련 문서(소방계획서·소방훈련자료·업무수행기록표)를 중앙에서 업로드·다운로드·작성할 수 있는 문서 관리 페이지 구축

**Target features:**
- 소방계획서 관리 — R2 업로드(admin)/다운로드(전체), 연도별 이력 보관 (~20-25MB)
- 소방훈련자료 관리 — R2 업로드(admin)/다운로드(전체), 연도별 이력 보관 (~120-130MB, 대용량)
- 소방안전관리자 업무수행기록표 — 폼 입력 → 기존 엑셀 양식과 동일한 형태로 출력 (generateExcel 패턴 재사용)

### Out of Scope

- AI 보고서 자동작성, 소방계획서 자동생성 — 추후 별도 마일스톤
- 모바일 오프라인 점검 — 현재 네트워크 환경 충분
- OAuth/소셜 로그인 — 4인 내부 팀 전용
- 다중 건물/멀티테넌트 — 단일 건물 전용

## Context

- **현재 상태:** v1.3 개발 중 (v1.2 출시 2026-04-06, 프로덕션 운영 중)
- **대상 건물:** 차바이오컴플렉스 (지하5층~지상8층, 4층 없음, M층 있음, 사무동/연구동 분리)
- **사용자:** 방재팀 4인 (관리자 1 + 보조자 3, 3교대 근무)
- **기술 스택:** React 18 / TypeScript 5.6 / Vite 5.4 / Zustand / TanStack Query / Tailwind CSS / Cloudflare Pages Functions
- **인프라:** Cloudflare Pages + D1 (SQLite) + R2, 배포 URL: https://cbc7119.pages.dev
- **DB:** 마이그레이션 0042까지 적용
- **코드베이스:** TypeScript, 280+ commits

## Constraints

- **Tech stack:** Cloudflare 생태계 고정 (Pages + D1 + R2 + Workers)
- **Users:** 4인 내부 팀 전용
- **Compatibility:** PWA, iOS 16.3.1+ / Android 15+ / PC (1920x1080)
- **Data integrity:** 점검 기록 삭제 불가 원칙 (수정 이력 보존)
- **Excel output:** 기존 양식 파일과 호환되는 형태로 출력 필수

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Cloudflare 올인 (Pages + D1 + R2) | 유료 플랜 이미 구독, 추가 비용 $0 | ✓ Good |
| JWT 자체 인증 | 4인 내부 팀, 사원번호 로그인이 현장에서 편리 | ✓ Good |
| fflate 기반 엑셀 템플릿 패치 방식 | xlsx-js-style 대비 번들 절감, 양식 호환 | ✓ Good |
| schedule_items 기반 법적점검 연동 | 별도 테이블 대신 일정과 통합, 중복 관리 방지 | ✓ Good |
| 수리 통합 뷰 (집계 방식) | 별도 입력 대신 고장/점검/검사 조치를 자동 수집 | ✓ Good |
| 개인별 메뉴 설정 | 관리자 일괄이 아닌 각자 커스터마이징 | ✓ Good |

---
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
*Last updated: 2026-04-06 after v1.3 milestone start*
