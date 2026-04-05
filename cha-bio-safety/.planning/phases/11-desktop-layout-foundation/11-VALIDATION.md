---
phase: 11
slug: desktop-layout-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-05
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual browser verification (no test framework configured in project) |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run dev:api` |
| **Estimated runtime** | ~15 seconds (build) |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run dev:api` + manual browser check
- **Before `/gsd:verify-work`:** Full build must pass + visual verification at 1920x1080 and 375px
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | LAYOUT-01 | build | `npm run build` | ✅ | ⬜ pending |
| 11-01-02 | 01 | 1 | LAYOUT-04 | build | `npm run build` | ✅ | ⬜ pending |
| 11-02-01 | 02 | 1 | LAYOUT-02 | build | `npm run build` | ✅ | ⬜ pending |
| 11-03-01 | 03 | 2 | LAYOUT-03 | build+manual | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework needed — this phase is pure layout/CSS work validated by build + visual inspection.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 사이드바 280px 영구 표시 | LAYOUT-01 | 시각적 레이아웃 검증 | 1024px+ 브라우저에서 사이드바 항상 보이는지 확인 |
| 넓은 테이블/카드 스크롤 | LAYOUT-02 | 스크롤 동작 검증 | 데스크톱에서 페이지 스크롤이 정상 동작하는지 확인 |
| 멀티 패널 나란히 보기 | LAYOUT-03 | 분할 레이아웃 검증 | 도면+점검목록이 나란히 표시되는지 확인 |
| 모바일 기존 동작 유지 | LAYOUT-04 | 모바일 회귀 테스트 | 375px에서 BottomNav, 헤더, 드로어 기존과 동일한지 확인 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
