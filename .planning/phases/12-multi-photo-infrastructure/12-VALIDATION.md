---
phase: 12
slug: multi-photo-infrastructure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-05
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | No automated test framework (manual validation on production) |
| **Config file** | None |
| **Quick run command** | Manual: deploy + test on device |
| **Full suite command** | Manual: end-to-end walkthrough per success criteria |
| **Estimated runtime** | ~5 minutes (manual) |

---

## Sampling Rate

- **After every task commit:** Manual smoke test — open LegalFindingDetailPage, verify photos render
- **After every plan wave:** Full success criteria walkthrough — all 4 criteria on iOS Safari PWA
- **Before `/gsd:verify-work`:** Full suite must pass on production
- **Max feedback latency:** ~5 minutes

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 12-01-01 | 01 | 1 | PHOTO-01 | manual-only | — | N/A | ⬜ pending |
| 12-01-02 | 01 | 1 | PHOTO-01 | manual-only | — | N/A | ⬜ pending |
| 12-02-01 | 02 | 2 | PHOTO-02 | manual-only | — | N/A | ⬜ pending |
| 12-02-02 | 02 | 2 | PHOTO-03 | manual-only | — | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm install yet-another-react-lightbox` — lightbox dependency
- [ ] Migration 0043 deployed to production D1 — photo_keys columns

*Existing infrastructure covers remaining requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 5장 업로드 + 6번째 차단 | PHOTO-01 | Visual UI on mobile PWA | 1. Open finding detail 2. Add 5 photos 3. Verify + button disappears |
| 72px 썸네일 가로 스크롤 | PHOTO-02 | Visual layout verification | 1. Upload 3+ photos 2. Verify horizontal scroll row 3. Check 72px thumbnails |
| 라이트박스 확대보기 | PHOTO-03 | Touch interaction on device | 1. Tap thumbnail 2. Verify fullscreen lightbox 3. Swipe between photos |
| 기존 photo_key 하위 호환 | PHOTO-02 | Migration data integrity | 1. Check existing finding with single photo 2. Verify displays in new grid |

---

## Validation Sign-Off

- [ ] All tasks have manual verify instructions
- [ ] Wave 0 covers all prerequisites (npm install + migration)
- [ ] No automated test gaps (project has no test framework)
- [ ] Feedback latency < 5 minutes
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
