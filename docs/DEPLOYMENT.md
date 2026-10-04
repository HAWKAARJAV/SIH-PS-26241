# Deployment

Local: `npm i && npm run setup && npm run dev`.

Render or any Node host: bind `0.0.0.0:$PORT` (the start script does). The filesystem is ephemeral, so use Postgres and set `DATABASE_URL`. Do not store the SQLite file on the ephemeral disk in production.

Docker: `docker compose up --build`. Optional Postgres: `docker compose --profile postgres up`. Swap Prisma by setting `provider = "postgresql"` and `DATABASE_URL=postgresql://postgres:nourish@localhost:5432/nourish` in `prisma/schema.prisma`, then `npx prisma db push`. SQLite stays the zero-setup default.

If `prisma generate` cannot download engines, set `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` and retry. Do not leave typecheck red.

A full clean-clone check is `bash scripts/clean-clone-check.sh` (writes `docs/evidence/clean-clone.log`). It was not run in the last local pass; CI uses `npm ci`.

Vercel: set env from `.env.example`, use a hosted Postgres, and do not rely on the local file database.

Health: `GET /api/health`.
