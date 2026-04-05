# Phase 16: Settings Page + Profile - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.

**Date:** 2026-04-06
**Phase:** 16-settings-page-profile
**Areas discussed:** 설정 페이지 구조, 이름 변경 구현, 로그아웃 위치

---

## 설정 페이지 구조

| Option | Description | Selected |
|--------|-------------|----------|
| 독립 페이지 (/settings) | 기존 패널 제거, /settings 라우트로 전환 | ✓ |
| 패널 유지 + 페이지 추가 | 간단 설정은 패널, 상세는 페이지 | |
| 패널만 개선 | 독립 페이지 없이 기존 패널에 기능 추가 | |

**User's choice:** 독립 페이지 (/settings)

---

## 이름 변경 구현

| Option | Description | Selected |
|--------|-------------|----------|
| 인라인 편집 | 프로필 섹션에서 탭 → 인라인 수정 + 저장 | |
| 별도 편집 모달 | 이름 클릭 → 모달에서 수정 (비밀번호 변경과 동일 패턴) | ✓ |

**User's choice:** 별도 편집 모달

---

## 로그아웃 위치

| Option | Description | Selected |
|--------|-------------|----------|
| 설정 페이지로 이동 | SideMenu/DesktopSidebar에서 제거, 설정 페이지 하단에 배치 | ✓ |
| 양쪽 모두 유지 | 기존 위치 + 설정 페이지 모두 | |
| SideMenu에만 유지 | 설정 페이지에는 로그아웃 없이 기존대로 | |

**User's choice:** 설정 페이지로 이동

---

## Claude's Discretion

- 설정 페이지 레이아웃, 섹션 그룹핑 순서
- 이름 변경 모달 UI 디테일
- 데스크탑 레이아웃

## Deferred Ideas

- PWA 푸시 알림 → Phase 17
- 메뉴 커스터마이징 → Phase 18
- 앱 정보/캐시 → Phase 19
