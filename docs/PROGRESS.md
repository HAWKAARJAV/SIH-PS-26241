# Progress (R0–R9)

A box is ticked only when `docs/evidence/` contains the command log or report.

## R0 Truth and safety
- [x] Sensitive phrases including "I am thinking about suicide", "she faces harassment", and "I am being abused" escalate. See `docs/evidence/r0-safety.md`.
- [x] "Do you want to see local data?" and "Come and see one centre" pass the number guard. Same evidence file.
- [ ] Importer approval writes OutcomeStat rows and J4 shows the number change and rollback
- [x] Held-out eval is 125 natively written cases and the gates passed. See `docs/evidence/eval/report.json`.
- [ ] Rights cookie, purge job, CSRF, and database rate limits proven by tests beyond the unit checks in `r0-safety.md`
- [ ] Duplicated CSS tokens removed

## R1 AI engine
- [ ] Context, plan, generate, validate, persist split with fact IDs and no numeric values in the prompt

## R2 Premium UI
- [ ] Kaarigar editorial components, motion, Indic fonts, screenshots

## R3 Family flows
- [ ] Voice, i18n, assisted mode, PWA, J5–J8

## R4 Counsellor
- [ ] Live takeover with a composer and hand-back

## R5 Admin
- [ ] Hotspot and insights computed from session rows

## R6 Explorer
- [ ] Trade, provider, ladder, and compare with fallback rules

## R7 Hardening
- [ ] axe on every route and locale, Lighthouse, bundle budget, clean clone

## R8 Docs and pitch
- [ ] Full docs, pitch kit, demo recording

## R9 Demo
- [ ] Five demo moments rehearsed and logged
