# Progress (honest)

Re-read `docs/BRIEF.md` §17 at the start of each phase. Tick only with evidence in `docs/evidence/` or a saved command log.

## P0 Foundation
- [x] `docs/BRIEF.md` (full §0–§19) — [BRIEF.md](./BRIEF.md)
- [x] `docs/GAPS.md` + honest tracking — [GAPS.md](./GAPS.md)
- [x] `.github/copilot-instructions.md` — `.github/copilot-instructions.md`
- [x] Scaffold, scripts, CI workflow — repo root
- [x] `npm run verify` (setup + contrast + i18n + typecheck + lint + test + eval + build + bundle) — [verify-r0.txt](./evidence/verify-r0.txt)
- [ ] `verify` includes e2e, a11y, lighthouse, audit (§14) — evidence: TBD
- [ ] Clean clone, zero env vars, verify log — evidence: TBD

## P1 Design system + shell
- [x] `tokens.css` + contrast gate — `npm run contrast`
- [ ] Self-hosted Indic fonts (§8.3) — evidence: TBD
- [x] `/design` expanded component gallery — `/en/design`
- [ ] PWA: icons 192/512, background sync, offline banner — [pwa.md](./evidence/pwa.md) (partial)
- [ ] Screenshots 360/768/1280 + design-review §8.9 — evidence: TBD

## P2 Data layer
- [x] Schema + seed (16 trades, 30 providers, 60 cards) — seed log in verify
- [x] Playbook openers in 4 languages from brain — seed
- [ ] KnowledgeCard hi/mr/ta bodies translated — evidence: TBD
- [ ] Import wizard XLSX/JSON + maker-checker UI — evidence: TBD
- [ ] Unit: importer, tier fallback, ROI — evidence: TBD

## P3 Explorer + pathways
- [x] Landing hero DB-driven (no hard-coded figures) — [landing-hero.md](./evidence/landing-hero.md)
- [x] Ladder stepped UI — `/en/ladder`
- [x] Compare worry ↔ data table — `/en/compare`
- [x] Evidence Drawer + SourceStrip — `src/components/evidence/drawer.tsx`
- [ ] E2E browse — evidence: TBD

## P4 AI + Family Room
- [x] `AiTurn` Zod schema — `src/ai/schema/aiturn.ts` (SSE still TBD)
- [x] MiniSearch retrieval in pipeline trace — `src/ai/retrieval/knowledge.ts`
- [x] Judge Mode readable panel — `src/components/chat/judge-panel.tsx`
- [x] Family Room UI (bubbles, meters, i18n chips) — `/en/room`
- [ ] Eval §6.11 gates (80+ cases, red-team, counterfactual) — eval passes 91 cases, gates partial
- [ ] Join-by-code SSE J8 — evidence: TBD

## P5 Onboarding, plan, Assisted
- [ ] F2 consent + parental OTP (simulated) — evidence: TBD
- [ ] Plan PNG export + Indic shaping — evidence: TBD
- [ ] J1, J5 — evidence: TBD

## P6 Escalation + counsellor
- [ ] Live takeover demo — evidence: TBD
- [ ] J2 — evidence: TBD

## P7 Admin + import
- [x] District names in admin tables — verify build
- [ ] Cartogram §12, funnel, AI Quality — evidence: TBD
- [ ] J3, J4 — evidence: TBD

## P8 Localisation + speech + offline
- [x] `i18n:check` keys — verify log
- [ ] Full flow copy hi/mr/ta — evidence: TBD
- [ ] J6, J7, J8 — evidence: TBD

## P9 Hardening
- [ ] axe all routes × 4 locales — evidence: TBD
- [ ] Lighthouse budgets §10 — evidence: TBD
- [ ] Bundle 170/220 KB route budgets §10 — evidence: TBD

## P10 Docs + pitch + rehearsal
- [ ] Pitch kit 20 judge Qs, expanded docs §16 — evidence: TBD
- [ ] DEMO-SCRIPT three runs — evidence: TBD

## §18 Definition of done
- [ ] All boxes in BRIEF §18 with evidence — see [GAPS.md](./GAPS.md)
