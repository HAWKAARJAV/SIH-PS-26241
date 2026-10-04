# Assumptions

- Demo mode is the default when no LLM key is set. Disha then uses ScriptedBrain.
- SQLite file `prisma/dev.db` is the zero-setup database. Postgres is a provider swap.
- District names (Neemganj, Mullai, and the rest) and all 30 providers are fictional. No real ITI is given fake statistics.
- LGD codes are null. Coordinates are approximate anchors for a cartogram, not a surveyed map. No geographic outline of India is drawn.
- Knowledge-card bodies in Hindi, Marathi, and Tamil are machine copies of the English card (`reviewStatus: machine`) except the interface chrome, which is written for those four languages.
- Playbook lines beyond English are short glosses marked machine.
- A custom service worker is used instead of Serwist so the Next.js build stays a single config.
- Parent OTP is the labelled demo code 123456. There is no SMS provider.
- PLFS earnings stay `pending_verification` and are hidden from family pages.
- Bundle budget in `scripts/bundle-check.ts` is 350 KB gzipped for the largest chunk. The brief’s 170 KB landing target is recorded as not yet met.
- Lighthouse is not executed inside `verify` because a Chrome run is environment-specific. The script prints the budgets.
- Analytics (about 4,200 rows) are synthetic and badged.
- Western digits are the default. A native-digit toggle is not a separate control yet; `formatInr` accepts a flag.
- `next/font` self-hosts Figtree and Fraunces. Indic Noto faces failed to load through the Google font loader in this workspace (null match in the loader), so Hindi, Marathi, and Tamil use the Noto families by name when the operating system has them.
- Staff auth is Auth.js credentials. Families have no accounts.
- 2026-10-04: Family Room live updates use an in-process `RoomBus` plus client polling. A multi-instance host does not share that memory.
- 2026-10-04: Join QR codes use the `qrcode` package, rendered on the server. No external QR host.
- 2026-10-04: Join attempts are limited in memory (10 per IP per 10 minutes). A restart clears the counter. A persisted limiter is still open under C8.
