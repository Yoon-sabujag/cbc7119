---
phase: quick-260527-aye
plan: 01
subsystem: chrome
tags: [redesign, 31-chrome, w9, settingspanel, tsx-conversion, tailwind, atomic]
dependency-graph:
  requires: [W7-GlobalHeader, W8-SideMenu, W10-MenuSettingsSection, design-tokens-v0.1.1]
  provides: [W9-SettingsPanel-Tailwind, chrome-conversion-complete]
  affects: [SettingsPanel.tsx]
tech-stack:
  added: []
  patterns: [tailwind-class-conversion, lucide-icon-replacement, design-token-fallback, inline-style-whitelist]
key-files:
  created: []
  modified:
    - cha-bio-safety/src/components/SettingsPanel.tsx
decisions:
  - "OQ #4: 프로필 아바타 그라데이션(blue→purple 135deg) 폐기 → bg-accent-active solid"
  - "OQ #6: admin 테스트 푸시 이모지 제거 → Lucide Send / Loader2 (animate-spin)"
  - "W3-OQ #A: close glyph 텍스트 → Lucide X (size 14, w-7 h-7)"
  - "W5 OQ #5-A: Toggle on bg raw blue → bg-accent-active"
  - "OQ #7: panel width 88% / maxWidth 320 보존"
  - "OQ #5 확장: gear svg path + 4 DB/R2 svg path verbatim 인라인 유지"
  - "노안 격상 22건 적용 (9/10/11px → 12/13/16/18px)"
  - "인라인 style={{ 4건 화이트리스트 유지 (사유 코멘트 첨부)"
  - "Row trailing chevron: source의 svg 직접 inline 대신 Lucide ChevronRight 채택 (이미 import됨)"
metrics:
  duration: ~12분
  completed: 2026-05-26
---

# Phase quick-260527-aye Plan 01: redesign/31-chrome W9 SettingsPanel TSX 변환 Summary

`SettingsPanel.tsx` (894→943 라인) — chrome 4 컴포넌트 변환 마지막 wave. 인라인 `style={}` 마크업 v0.1.1 디자인 토큰 기반 Tailwind class 로 교체, OQ #4/#6/#5/#7 + W3-OQ #A + W5 OQ #5-A 6 LOCKED 결정 코드 반영, 노안 격상 22건, JSZip 백업/복원 비즈 + NotificationPreferences 6 키 + 8 내부 컴포넌트 시그니처 1 byte 변경 0.

## Tasks Completed

| Task | Name                                                          | Commit  | Files                                       |
| ---- | ------------------------------------------------------------- | ------- | ------------------------------------------- |
| 1    | SettingsPanel.tsx 단일 atomic TSX 변환 (894→943 라인)            | 2e5b170 | cha-bio-safety/src/components/SettingsPanel.tsx |

## 변환 전후 라인 수

| Metric           | Before | After |
|------------------|--------|-------|
| Total lines      | 894    | 943   |
| Inline `style={{` | 30+   | 4     |

49 라인 증가 — Tailwind class long literals (특히 disabled 분기 / sketch sub-header / 8 필드 라벨) 분기 단순화로 인한 자연스러운 증가. 인라인 30+→4 감소가 핵심 가독성 개선.

## 인라인 잔존 4 예외 (모두 사유 코멘트)

| Line | 위치                              | 사유                                                               |
|------|----------------------------------|--------------------------------------------------------------------|
| 86   | PermBadge (`bg: rgba(...,0.16)`) | 동적 색상 16% alpha 합성 — Tailwind class 한계 (W6 §9.3 화이트리스트)   |
| 296  | ProfileEditForm `type=date` input | type=date native widget 정렬 보정 — Tailwind class 한계              |
| 693  | Overlay opacity/pointerEvents     | open prop 동적 분기 — Tailwind dynamic value 한계                     |
| 702  | Panel transform/transition/top/bottom | isDesktop 분기 + safe-area css var + cubic-bezier transition 종합 |

## 17건 verify grep 결과

| #  | Check                                                  | Expected | Actual | Status |
|----|--------------------------------------------------------|----------|--------|--------|
| 1  | 파일 존재                                                | OK       | OK     | PASS   |
| 2  | `import { ChevronRight, X, Send, Loader2 } from 'lucide-react'` | 1   | 1      | PASS   |
| 3  | 이모지 ⏳🔔 0건                                          | 0        | 0      | PASS   |
| 4  | ✕ 텍스트 글리프 0건                                       | 0        | 0      | PASS   |
| 5  | gear svg path `M10.325 4.317`                          | 1        | 1      | PASS   |
| 6  | 그라데이션 `linear-gradient.*7c3aed`                    | 0        | 0      | PASS   |
| 7  | `bg-accent-active`                                     | ≥1       | 4      | PASS   |
| 8  | panel width `w-[88%]`                                  | ≥1       | 1      | PASS   |
| 9  | 5 collapsible localStorage 키                          | 5        | 5      | PASS   |
| 10 | NotificationPreferences 6 키 occurrences               | ≥6       | 9      | PASS   |
| 11 | JSZip 보존                                              | ≥2       | 3      | PASS   |
| 12 | DB/R2/push API endpoint                                | ≥7       | 9      | PASS   |
| 13 | raw style `#dc2626` form                                | 0        | 0      | PASS   |
| 14 | `fontSize: 9|10|11` 0건                                | 0        | 0      | PASS   |
| 15 | legacy alias `var(--bg|bd|t*|acl|safe|...)`            | 0        | 0      | PASS   |
| 16 | 8 내부 컴포넌트 시그니처                                  | ≥8       | 8      | PASS   |
| 17 | export signature 보존                                   | 1        | 1      | PASS   |

**Note (#4, #6):** 1차 빌드 후 inline 코멘트에 `✕` / `7c3aed` 문자열이 포함되어 grep 1 hit. LOCKED 정책 문서화를 위해 안전한 어휘(`close glyph` / `raw blue→purple 135deg`)로 코멘트 재작성. 정책 의미 보존 + 자동화 grep 친화.

## TypeScript 컴파일

```
cd cha-bio-safety && npx tsc --noEmit
EXIT=0  (0 errors)
```

## 보호 파일 git diff (17~20 path)

```
git diff --stat \
  cha-bio-safety/src/App.tsx \
  cha-bio-safety/src/components/GlobalHeader.tsx \
  cha-bio-safety/src/components/SideMenu.tsx \
  cha-bio-safety/src/components/MenuSettingsSection.tsx \
  cha-bio-safety/src/styles/tokens.css \
  cha-bio-safety/src/styles/typography.css \
  cha-bio-safety/tailwind.config.js \
  cha-bio-safety/docs/redesign-context/00-design-context/ \
  cha-bio-safety/docs/redesign-context/31-chrome/ \
  cha-bio-safety/src/utils/api.ts \
  cha-bio-safety/src/stores/authStore.ts \
  cha-bio-safety/src/hooks/useStaffList.ts
=== END ===
```

→ 빈 출력 (0 byte 변경 모두 보장)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] 코멘트 텍스트의 LOCKED 글리프/그라데이션 어휘 grep 충돌 회피**
- **Found during:** Task 1 verify gate 1차 실행
- **Issue:** OQ #4 (`linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)`) 폐기 정책 + W3-OQ #A (`✕` → Lucide X) 정책을 코드 주석에 verbatim 인용 → grep `✕` / `linear-gradient.*7c3aed` 의 negative gate 가 의도와 다르게 hit (실제 코드는 모두 Lucide X / bg-accent-active 사용 중)
- **Fix:** 주석 어휘만 `close glyph 텍스트` / `raw blue→purple 135deg` 로 변경 — 정책 의미 보존 + grep negative gate PASS
- **Files modified:** cha-bio-safety/src/components/SettingsPanel.tsx (line 719, 732 — 코멘트 2건만)
- **Commit:** 2e5b170 (단일 atomic 안에 포함)

이외 deviation 없음.

## Authentication Gates

None.

## chrome 4 컴포넌트 변환 완결 박제

W7 GlobalHeader (#5a8...) + W8 SideMenu (180a5dc) + W10 MenuSettingsSection + W9 SettingsPanel (2e5b170, this commit) — 31-chrome 4 컴포넌트 Tailwind class 변환 완결.

| Wave | Component             | Conversion Pattern                                    |
|------|------------------------|-------------------------------------------------------|
| W7   | GlobalHeader.tsx      | 단일 atomic, 5 hidden status indicator                 |
| W8   | SideMenu.tsx          | 단일 atomic, Lucide X 1차 도입, fire-bar 배지            |
| W10  | MenuSettingsSection.tsx | 단일 atomic, ArrowButton/ToggleSmall 패턴 정립          |
| W9   | SettingsPanel.tsx     | 단일 atomic (마지막), 8 내부 컴포넌트 + JSZip + Lucide X/Send/Loader2 |

## TDD Gate Compliance

해당 plan은 type=execute (TSX 변환 atomic). RED/GREEN/REFACTOR gate 적용 대상 아님.

## Self-Check: PASSED

- FOUND: cha-bio-safety/src/components/SettingsPanel.tsx (943 lines)
- FOUND commit: 2e5b170 (in `git log --oneline -3`)
- 17/17 verify greps PASS
- 보호 파일 17~20 path git diff 0 byte
- npx tsc --noEmit EXIT=0
- atomic 1-commit on `worktree-agent-a719bd9ad51e8c566` (재머지 시 redesign/31-chrome 기준)

## Next Steps (사용자 결정 대기)

1. `git push` (worktree → main 머지 경로) — main push 시 GitHub Actions → cbc7119-preview 자동 배포 (memory `feedback_deploy_test`)
2. 4 chrome 컴포넌트 전체 cbc7119-preview 통합 확인 (사용자 컨펌 후)
3. memory 박제: `project_redesign_31_chrome_status.md` (chrome 4 wave 완결)
