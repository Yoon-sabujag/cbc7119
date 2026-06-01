---
status: complete
phase: quick
plan: 260602-3p6-extinguisherpublicpage-width-fix
date: 2026-06-02
---

# ExtinguisherPublicPage page box width:100% fix

## Change made

src/pages/ExtinguisherPublicPage.tsx line 148 — added width:'100%' as the first property of the page style object.

Before:
  const page: React.CSSProperties = { maxWidth:480, margin:'0 auto', padding:'8px 8px 8px', ... }
After:
  const page: React.CSSProperties = { width:'100%', maxWidth:480, margin:'0 auto', padding:'8px 8px 8px', ... }

## Why

The page box was shrink-to-fitting to ~260px because its flex-column parent combined with margin:'0 auto' defeats flex stretch when no explicit width is set. width:'100%' makes it fill the viewport up to the 480 maxWidth cap.

## Verification

- grep -n "width:'100%', maxWidth:480" returns line 148. PASS.
- npm run build (TS + Vite + PWA) succeeded — built in 13.71s, no errors. PASS.

## Commit

- Hash: 3614304
- Files: src/pages/ExtinguisherPublicPage.tsx, plan + summary under .planning/quick/260602-3p6-extinguisherpublicpage-width-fix/

## Deploy

Pending user confirmation. No wrangler / deploy / push run.
