# Deployment

Local: `npm i && npm run setup && npm run dev`.

Render or any Node host: bind `0.0.0.0:$PORT` (the start script does). The filesystem is ephemeral, so use Postgres and set `DATABASE_URL`. Do not store the SQLite file on the ephemeral disk in production.

Docker: `docker compose up --build`. Optional Postgres profile is documented in `docker-compose.yml`.

Vercel: set env from `.env.example`, use a hosted Postgres, and do not rely on the local file database.

Health: `GET /api/health`.
