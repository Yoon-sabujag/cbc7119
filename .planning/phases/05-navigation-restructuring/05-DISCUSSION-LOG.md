# Phase 5: Navigation Restructuring - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-01
**Phase:** 05-navigation-restructuring
**Areas discussed:** BottomNav 탭 구성, SideMenu 메뉴 재구성, /more 경로 처리, 조치 탭 아이콘/라벨
**Mode:** Auto (--auto flag, all recommended defaults selected)

---

## BottomNav 탭 구성

| Option | Description | Selected |
|--------|-------------|----------|
| 4탭: 대시보드, 점검, QR, 조치 | 승강기 제거 + 더보기 제거, 조치 신규 추가 | ✓ |
| 5탭: 대시보드, 점검, QR, 조치, 승강기 | 더보기만 제거, 승강기 유지 | |
| 5탭: 대시보드, 점검, QR, 승강기, 조치 | 순서만 변경 | |

**User's choice:** [auto] 4탭 구성 (recommended default — ROADMAP에서 승강기를 햄버거로 이동 명시)
**Notes:** ROADMAP success criteria #2: "승강기 항목이 BottomNav에서 사라지고 햄버거 메뉴에서 접근 가능"

---

## SideMenu 메뉴 재구성

| Option | Description | Selected |
|--------|-------------|----------|
| 기존 3섹션 + MorePage 항목 통합 | 주요 기능/점검 기록/근무복지 유지, QR출력·도면 추가 | ✓ |
| 4섹션으로 확장 | 시스템 섹션 신규 추가 | |
| 전면 재설계 | 카테고리 재분류 | |

**User's choice:** [auto] 기존 3섹션 + 통합 (recommended default — 최소 변경으로 MorePage 기능 흡수)
**Notes:** MorePage의 프로필 카드/로그아웃은 SideMenu 하단에 이미 존재하여 중복 없음

---

## /more 경로 처리

| Option | Description | Selected |
|--------|-------------|----------|
| /dashboard 리디렉트 | Navigate replace로 대시보드 이동 | ✓ |
| 404 표시 | NotFoundPage로 처리 | |
| 라우트 완전 제거 | 매칭 없이 wildcard catch | |

**User's choice:** [auto] /dashboard 리디렉트 (recommended default — 북마크/히스토리 사용자 보호)
**Notes:** ROADMAP success criteria #3: "/more 경로로 접근하면 적절한 페이지로 리디렉션"

---

## 조치 탭 아이콘/라벨

| Option | Description | Selected |
|--------|-------------|----------|
| '조치' + 렌치/공구 아이콘 | 수리/시정 의미 직관적 전달 | ✓ |
| '조치' + 체크리스트 아이콘 | 점검 아이콘과 유사할 수 있음 | |
| '미조치' + 경고 아이콘 | 부정적 뉘앙스, 완료 항목 표현 어려움 | |

**User's choice:** [auto] '조치' + 렌치 아이콘 (recommended default)
**Notes:** 기존 BottomNav 아이콘과 동일한 strokeWidth 1.8 line 스타일 유지

---

## Claude's Discretion

- SVG 아이콘 정확한 path 디자인
- 4탭 레이아웃 간격 조정
- SideMenu 항목 순서 미세 조정

## Deferred Ideas

- SideMenu badge 하드코딩 → live count: Phase 6
- 햄버거 메뉴 항목 순서/표시 관리자 설정: Phase 7
- soon 태그 메뉴 실제 연결: 각 해당 Phase
