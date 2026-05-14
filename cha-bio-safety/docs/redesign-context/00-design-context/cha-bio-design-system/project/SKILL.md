---
name: cha-bio-bangje-design
description: Use this skill to generate well-branded interfaces and assets for CHA Bio Complex 방재 시스템, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Critical Rules (절대 위반 금지)
1. 노안 친화 우선 — 본문 폰트 16px 이상, 9·10·11px 사용 절대 금지
2. 모바일/데스크톱 폰트 사이즈 동일 (spacing만 분기)
3. 인라인 style={{...}} 금지, Tailwind utility만 사용 (production code)
4. 토큰은 design-system.md 기준만 사용 (임의로 색·사이즈 추가 금지)
5. 한국어 UI (모든 텍스트는 한국어)
6. 다크 모드가 기본, 라이트 모드 페어링 필수
7. 게임/SNS/엔터테인먼트 톤 절대 금지 — 진중하고 신뢰감 있는 업무 도구 톤

## Key Files
- `README.md` — Full design system overview, visual foundations, content guide
- `colors_and_type.css` — All CSS variables (colors, type, spacing, radius)
- `reference/design-system.md` — Canonical design system spec (v0.1.0)
- `reference/tokens.css` — Raw CSS token definitions
- `reference/typography.css` — Typography definitions
- `reference/tailwind.config.js` — Tailwind configuration
- `reference/page-spec.md` — All page specs from codebase analysis
- `reference/samples/` — DashboardPage.tsx, InspectionPage.tsx source code
- `preview/` — Design system preview cards (colors, type, components)
- `ui_kits/bangje-app/` — Interactive UI kit prototype

## Token Reference (Quick)
### Surfaces: page → raised → sunken → active → overlay
### Text: primary → secondary → tertiary → disabled → on-accent → link
### Status: safe(녹)/warning(황)/danger(적)/info(청)/fire(주황) × foreground/bar/bg
### Duty: day(주간)/night(당직)/off(비번)/leave(휴무)
### Type: caption(12) → label(13) → body-sm(14) → body(16) → title(18) → heading(22) → display(28)
### Radius: sm(8) → md(12) → lg(16) → pill(99)
### Font: Pretendard Variable (sans), JetBrains Mono (mono)
