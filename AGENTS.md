# Agent notes (Base44 dev environment)

- Run: `docker compose -f docker-compose.base44.yml up -d --build`. Services: `db` (Postgres 15), `setup` (one-shot), `web` (`next dev`, Turbopack, port 3000).
- The `setup` service must finish before `web` starts. It runs `pnpm install --frozen-lockfile`, `build:db` (Prisma generate + bundles `generated/prisma/client.js`), `check:db` (which runs `prisma migrate deploy`), the tracker/recorder builds (`public/script.js`, `public/recorder.js`), `build:packages` (workspace `packages/*/dist`, which the app imports), and `build:geo` (downloads the GeoLite DB and is allowed to fail).
- After you change the Prisma schema, migrations, or `packages/*`, re-run setup: `docker compose -f docker-compose.base44.yml up -d setup`, then restart `web`.
- pnpm is pinned to 12.3.4 (see `engines`). The dev image installs it globally.
- Default login after migrations: `admin` / `umami`.
- Health: `GET /api/heartbeat` returns `{"ok":true}`. The first page compile takes about 15s.
- `next.config.ts` sets `allowedDevOrigins` from `BASE44_PUBLIC_HOST_SUFFIX` so the preview origin can load dev assets/HMR.
- `.env.*` is gitignored, so there is no repo defaults env file. No secrets are needed to boot: APP_SECRET falls back to DATABASE_URL, and TWO_FACTOR_ENCRYPTION_KEY is only needed for 2FA.
- Tests: `pnpm test` (vitest) inside the web container.
