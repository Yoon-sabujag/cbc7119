---
phase: 13
slug: finding-bottomsheet-restructure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual browser testing (no automated test framework configured) |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run deploy -- --branch production` |
| **Estimated runtime** | ~30 seconds (build) |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd-verify-work`:** Build must pass + manual verification on production
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | FIND-02 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |
| 13-01-02 | 01 | 1 | FIND-01 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 구역→층→상세위치 3단계 선택 | FIND-02 | UI interaction flow | 1. Open finding sheet 2. Select zone 3. Select floor 4. Select/enter detail location 5. Verify location string concatenation |
| 공통 점검항목 선택 or 직접입력 | FIND-01 | UI interaction flow | 1. Open finding sheet 2. Tap FINDING_ITEMS item 3. Verify selection 4. Try 직접입력 5. Verify text entry |
| 사진 최대 5장 첨부 | FIND-02 | Camera/photo integration | 1. Open finding sheet 2. Add photos via PhotoGrid 3. Verify up to 5 photos display |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
