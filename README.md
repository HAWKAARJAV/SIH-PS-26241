# Nourish

Skills that feed a family. A family-layer counselling prototype for Smart India Hackathon 2026 (PS SIH26241). Not an official government portal.

## Quick start

```bash
npm install
npm run setup
npm run dev
```

No API keys are required. Demo mode uses the scripted guide, Disha.

Open http://localhost:3000/en/demo

Staff (Demo Mode): `admin@nourish.local` / `nourish-demo-admin` and the same password for `counsellor@nourish.local`, `steward@nourish.local`, `state@nourish.local`, `viewer@nourish.local`.

## What is real

- Family room, number guard, resistance index, importer checks, and the SQLite seed are executable code.
- Outcome figures in the seed are synthetic (tier V0) and labelled.
- SIDH, NCS, DigiLocker, Bhashini, and Sarvam adapters are typed mocks.
- The parent OTP `123456` is simulated and labelled.

## Load an organiser file

Sign in as a data steward, open Admin → Data, and dry-run `/samples/organiser.csv`. A different steward must approve. Rollback is on the import API.

## Add a language

Add `src/messages/<locale>.json` with the same keys, register the locale in `src/lib/i18n/routing.ts`, and run `npm run i18n:check`.

## Scripts

`setup`, `dev`, `dev:clean`, `demo`, `build`, `start`, `lint`, `typecheck`, `test`, `e2e`, `a11y`, `lighthouse`, `eval`, `contrast`, `i18n:check`, `bundle:check`, `seed`, `verify`.

If pages or APIs return 500 with a JSON parse error in the terminal, stop the dev server and run `npm run dev:clean` (clears a stale `.next` cache).

## Postgres

Change `provider` in `prisma/schema.prisma` to `postgresql` and set `DATABASE_URL`. Avoid SQLite-only features; this schema uses strings and decimals.

## Local model

`LLM_PROVIDER=openai_compat`, `OPENAI_COMPAT_BASE_URL=http://127.0.0.1:11434/v1`, and an API key placeholder. If the call fails, Disha falls back to the scripted guide.
