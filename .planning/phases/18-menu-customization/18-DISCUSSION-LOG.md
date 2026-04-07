# Phase 18: Menu Customization - Discussion Log

> **Audit trail only.** Decisions are captured in CONTEXT.md.

**Date:** 2026-04-07
**Phase:** 18-menu-customization
**Areas discussed:** 저장 위치, SideMenu 항목 관리

---

## 저장 위치

| Option | Selected |
|--------|----------|
| Server 유지 (settingsApi 재사용) | ✓ |
| Local persist (Zustand) | |
| Hybrid (server + local cache) | |

**Notes:** v1.3 ROADMAP은 local persist로 결정했으나, 기존 SideMenu가 이미 server settingsApi.getMenu/saveMenu 사용 중이라 server 유지로 뒤집음.

---

## SideMenu 항목 관리

| Option | Selected |
|--------|----------|
| 설정 페이지로 이전 | ✓ |
| 양쪽 유지 | |
| 현재 그대로 유지 | |

**섹션 편집 범위:**
| Option | Selected |
|--------|----------|
| 항목만 섹션 간 이동 | |
| 섹션 추가/삭제까지 | ✓ |
| 섹션 순서도 변경 | ✓ |

**Notes:** 사용자가 섹션 추가/삭제 + 순서 변경 둘 다 원함 → 완전 자유도. 메뉴 config 스키마 확장 필요 (path별 단순 visible/order → 섹션 트리 구조).

---

## BottomNav (Claude 재량)

사용자 의견: "항목만 순서 변경되는 게 아니라 섹션 이동까지 가능해야 한다" — 이건 SideMenu에 해당. BottomNav는 평면 5개라 섹션 개념 없음.

Claude 결정:
- 4개 항목(QR 제외) 순서 변경 + visible 토글
- QR은 중앙 특수 버튼 위치 고정 (UX)
- BottomNav config는 menu config와 같은 엔드포인트의 별도 키로 저장
