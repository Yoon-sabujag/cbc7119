---
phase: 18
slug: menu-customization
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-07
---

# Phase 18 — Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual + build verification (no test framework in project) |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run deploy -- --branch production` |
| **Estimated runtime** | ~30s build, ~60s deploy |

## Sampling Rate

- After every task: `npm run build`
- After wave complete: full deploy + manual verify
- Before verify-work: deployed + UAT items green

## Wave 0

Existing infrastructure covers all phase requirements. No test framework installation needed.

## Manual-Only Verifications

| Behavior | Requirement | Test Instructions |
|----------|-------------|-------------------|
| BottomNav 순서 변경 반영 | MENU-01 | 설정에서 순서 변경 → 저장 → BottomNav에 즉시 반영 확인 |
| SideMenu 항목 섹션 간 이동 | MENU-02 | 항목을 다른 섹션으로 이동 → 저장 → SideMenu 열어서 확인 |
| 섹션 추가/삭제 | MENU-02 | 새 섹션 추가 → 항목 이동 → 저장 → 페이지 새로고침 후에도 유지 |
| QR 버튼 고정 | D-12 | BottomNav 편집 시 QR 위치 변경/숨김 불가 확인 |

## Sign-Off

- [ ] All tasks have build verify or manual verification
- [ ] Build check after every task
- [ ] No watch-mode flags
- [ ] `nyquist_compliant: true` after execution

**Approval:** pending
