# PWA evidence (A1 partial)

- Service worker: `public/sw.js` (shell cache, offline fallback, runtime cache on GET).
- Registration: `src/components/layout/shell.tsx` → `/sw.js`.
- Manifest: `public/manifest.webmanifest` (SVG icon only; PNG 192/512 maskable still open in GAPS A1).
- Offline route: `/[locale]/offline`.

Verified: `npm run build` 2026-10-04; worker file present on disk.
