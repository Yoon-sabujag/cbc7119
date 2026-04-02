# Phase 7: Tech Debt + Admin - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-02
**Phase:** 07-tech-debt-admin
**Areas discussed:** 관리자 페이지 구성, 직원 계정 관리 방식, 시스템 설정 범위, Tech Debt 처리 방향, 관리자 접근 경로, 마이그레이션 전략, NO_NAV_PATHS 및 라우팅

---

## 관리자 페이지 구성

| Option | Description | Selected |
|--------|-------------|----------|
| 탭 네비게이션 | 상단 탭으로 직원관리/시스템설정/메뉴배치 구분. RemediationPage 상태탭 패턴과 동일 | ✓ |
| 단일 스크롤 페이지 | 섹션별 구분선으로 전체 설정을 한 페이지에 나열 | |
| 서브라우팅 분리 | /admin/staff, /admin/settings, /admin/menu 각각 별도 페이지 | |

**User's choice:** 탭 네비게이션
**Notes:** 이후 ADMIN-03 제외로 3탭→2탭(직원관리/시스템설정)으로 축소

---

## 관리자 권한

| Option | Description | Selected |
|--------|-------------|----------|
| API + 프론트 모두 | API에 admin role-guard 미들웨어 + 프론트에서 role!='admin'이면 리디렉션. 이중 보호 | ✓ |
| 프론트만 | API는 기존 미들웨어만, 프론트에서만 UI 숨김 | |
| Claude 판단 | 4인 내부 팀 환경에 맞는 수준으로 Claude가 결정 | |

**User's choice:** API + 프론트 모두

---

## 비밀번호 초기화

| Option | Description | Selected |
|--------|-------------|----------|
| 고정 초기 PW | 사번 뒷자리 4자리 등 고정 규칙으로 초기화. 4인 팀이라 구두 전달 가능 | ✓ |
| 임시 PW 자동생성 | 랜덤 임시 PW 생성 → 화면에 표시 → 관리자가 전달 | |
| Claude 판단 | 4인 내부 팀에 맞는 간결한 방식으로 Claude가 결정 | |

**User's choice:** 고정 초기 PW

---

## 삭제 정책

| Option | Description | Selected |
|--------|-------------|----------|
| 비활성화 | active 플래그로 비활성화. 로그인 불가되지만 기존 점검 기록의 점검자 이름 유지 | ✓ |
| 완전 삭제 | staff 테이블에서 삭제. check_records의 staff_id FK가 깨질 수 있음 | |

**User's choice:** 비활성화

---

## 직원 필드

| Option | Description | Selected |
|--------|-------------|----------|
| 기존 DB 필드 그대로 | 사번 + 이름 + 권한 + 직책. 비밀번호는 고정 초기PW로 자동 설정 | |
| 필드 확장 | 연락처, 선임일자, 이메일 등 추가 필드. DB 마이그레이션 필요 | ✓ |
| Claude 판단 | 4인 팀에 필요한 수준으로 Claude가 결정 | |

**User's choice:** 필드 확장
**Notes:** 연락처(phone) — 전체 필수, 선임일자(appointed_at) — 전체 필수 (소방안전관리자/보조자 선임일), 이메일(email) — 선택 (소방안전관리자만 필요). 입사일은 id 앞 8자리에서 파싱하므로 별도 필드 불필요.

---

## 점검 설정 (ADMIN-02)

| Option | Description | Selected |
|--------|-------------|----------|
| 조회만 | 현재 카테고리·개소 목록을 조회하는 용도. 추가/수정/삭제는 v1.2 이후 | |
| 완전 CRUD | 카테고리 추가/수정/비활성화 + 개소 추가/수정/비활성화 | |
| 개소만 CRUD | 카테고리는 고정, 개소(체크포인트)만 추가/수정/비활성화 가능 | ✓ |

**User's choice:** 개소만 CRUD
**Notes:** 사용자가 "완전 CRUD로 가야 맞긴한데, 카테고리가 추가될때 점검 페이지도 만들어져야하고... 현실적으로는 개소만 CRUD할 수밖에 없지 않나?"라고 확인. 카테고리 CRUD는 점검 페이지 동적 생성 체계와 함께 v1.2 이후로 이관.

---

## 메뉴 배치 (ADMIN-03)

| Option | Description | Selected |
|--------|-------------|----------|
| v1.1에서 제외 | SideMenu 항목 순서는 Phase 5에서 확정. 4인 팀이라 변경 요구 거의 없음 | ✓ |
| 간단 토글 | SideMenu 항목별 표시/숨김 토글만 | |
| 완전 커스터마이징 | 드래그로 순서 변경 + 표시/숨김 | |

**User's choice:** v1.1에서 제외

---

## 개소 관리 UI

| Option | Description | Selected |
|--------|-------------|----------|
| 카테고리 선택 → 개소 리스트 | 상단 카테고리 드롭다운으로 13개 중 선택 → 해당 카테고리의 개소 목록 표시 | ✓ |
| 트리 뷰 | 카테고리 > 동 > 층 > 개소를 펼침/접힘 트리로 표시 | |

**User's choice:** 카테고리 선택 → 개소 리스트

---

## Tech Debt — TECH-01

| Option | Description | Selected |
|--------|-------------|----------|
| 연구문서 방안 따르기 | GET /api/staff + useStaffList() 훅 + STAFF_ROLES 제거. shiftCalc.ts 등도 동적 로딩 전환 | ✓ |
| Claude 판단 | 연구문서 기반으로 최적 방식 Claude가 결정 | |
| 다른 방식 제안 | 직접 다른 방식을 설명 | |

**User's choice:** 연구문서 방안 따르기

---

## Tech Debt — TECH-02 streakDays

**User's choice:** 기능 보류
**Notes:** 사용자가 "이 기능은 보류하자"로 명시적 결정. v1.1에서 제외.

---

## 관리자 접근 경로

| Option | Description | Selected |
|--------|-------------|----------|
| admin만 표시 | SideMenu에서 role=admin일 때만 '관리자 설정' 항목 노출. assistant에게는 아예 안 보임 | ✓ |
| 모두 표시, 접근 제한 | 모든 사용자에게 표시하되 assistant가 클릭하면 권한 필요 안내 | |
| 현재 유지 (준비중) | soon:true 상태 유지하되 admin일 때만 soon:false로 전환 | |

**User's choice:** admin만 표시

---

## 마이그레이션 전략

| Option | Description | Selected |
|--------|-------------|----------|
| ALTER TABLE + 기본값 | phone/email NULL 허용, appointed_at NULL 허용, check_points.active DEFAULT 1. 기존 데이터 손실 없음 | ✓ |
| 데이터 사전 투입 | 마이그레이션에 현재 4인 데이터 INSERT. 배포 즉시 정보 완성 상태 | |

**User's choice:** ALTER TABLE + 기본값

---

## NO_NAV_PATHS 및 라우팅

| Option | Description | Selected |
|--------|-------------|----------|
| NO_NAV_PATHS 추가 | /admin을 NO_NAV_PATHS에 추가. BottomNav/글로벌헤더 숨김, 자체 헤더(← 뒤로가기)만 표시 | ✓ |
| BottomNav 유지 | /admin에서도 BottomNav 표시. 상단만 자체 헤더 | |

**User's choice:** NO_NAV_PATHS 추가

---

## Claude's Discretion

- 고정 초기 PW의 구체적 규칙
- 개소 리스트 카드/테이블 디자인
- 직원 목록 표시 순서
- admin role-guard 미들웨어 구현 방식

## Deferred Ideas

- TECH-02 streakDays 계산 — 사용자가 기능 자체를 보류
- ADMIN-03 햄버거 메뉴 배치 — 4인 팀에 불필요, v1.2에서
- 카테고리 CRUD — 점검 페이지 동적 생성 체계 필요, v1.2 이후
