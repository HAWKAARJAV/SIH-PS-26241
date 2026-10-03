# Progress (honest)

Evidence column must be filled before ticking.

## R0 Truth reset
- [ ] Restore full `docs/BRIEF.md` — evidence: `docs/BRIEF.md` (still expanding §0–§19)
- [x] `docs/GAPS.md` with all tickets — evidence: [GAPS.md](./GAPS.md)
- [x] Rewrite `.github/copilot-instructions.md` — evidence: `.github/copilot-instructions.md`
- [x] `npm run verify` (local with `.env` from setup), log — evidence: [verify.log](./evidence/verify.log)

## R1 Design system and shell (A1, A10, A11, E1–E8, F4)
- [ ] PWA service worker + icons — evidence: `docs/evidence/pwa.md`
- [ ] `tokens.css` + contrast build gate — evidence: `npm run contrast`
- [ ] `/design` all components — evidence: screenshot `docs/screenshots/design-1280.png`
- [ ] Screenshots 3 widths + design-review — evidence: `docs/evidence/design-review.md`

## R2 Data (G1–G5, A4–A6)
- [ ] Seed §5.4/§5.5 — evidence: `npm run test`
- [ ] Playbook + KnowledgeCard locales — evidence: seed script
- [ ] Admin district names — evidence: admin screenshot

## R3 Explorer (D6–D8, A3)
- [ ] No hard-coded figures — evidence: grep + landing E2E
- [ ] Ladder, compare, drawer — evidence: E2E browse

## R4 AI (B1–B10, C1–C5, D1–D4)
- [ ] AiTurn + retrieval + SSE — evidence: eval report
- [ ] Family Room join SSE — evidence: J8

## R5–R10
- [ ] R5 onboarding, plan, assisted — evidence: J1, J5
- [ ] R6 counsellor — evidence: J2
- [ ] R7 admin + import — evidence: J3, J4
- [ ] R8 i18n + offline — evidence: J6–J8
- [ ] R9 hardening — evidence: lighthouse, axe, bundle
- [ ] R10 docs + demo rehearsal — evidence: DEMO-SCRIPT run notes

## Finish line (brief §18)
- [ ] Each item with file in `docs/evidence/` — see `docs/GAPS.md`
