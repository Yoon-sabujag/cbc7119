---
phase: 15
slug: finding-download
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual + TypeScript compile check |
| **Config file** | tsconfig.json |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd:verify-work`:** Full build must pass + manual iOS PWA test
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 15-01-01 | 01 | 1 | DL-01 | build + manual | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 15-01-02 | 01 | 1 | DL-02 | build + manual | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 15-01-03 | 01 | 1 | DL-03 | manual | iOS PWA physical test | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework installation needed — this phase is client-side only with manual verification on iOS PWA.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 건별 다운로드 HTML 새 탭 | DL-01 | UI interaction + print preview | 1. 지적사항 상세 → 다운로드 버튼 클릭 2. 새 탭에 HTML 보고서 표시 확인 3. 인쇄 대화상자 또는 PDF 저장 가능 확인 |
| 일괄 ZIP 다운로드 | DL-02 | File download + content check | 1. 라운드 목록 → 일괄 다운로드 클릭 2. ZIP 파일 다운로드 확인 3. 내부 폴더 구조(finding-001/) 확인 4. 사진 파일 + 내용.txt 존재 확인 |
| iOS PWA 다운로드 | DL-03 | Physical device required | 1. iOS 16.x 디바이스 PWA 홈 화면 모드 2. 건별 다운로드 → 새 탭 열림 확인 3. 일괄 다운로드 → 공유시트 또는 파일 저장 확인 4. window.open 팝업 차단 안 됨 확인 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
