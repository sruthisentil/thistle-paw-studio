# Thistle & Paw — Database Studio

DevOps engineer's view of a fictional pet pharmacy's Postgres platform.
Built for the Dell x NVIDIA local-agent hackathon.

## Run

    npm install
    npm run db:setup   # creates + seeds the local `thistle_paw` Postgres database
    npm run dev         # http://localhost:3000

Requires a local Postgres server reachable at `DATABASE_URL`
(default `postgresql://postgres:postgres@127.0.0.1:5432/thistle_paw`,
matching the "Local PostgreSQL" label in the status bar). `npm run db:setup`
is safe to re-run — it drops and reseeds the demo tables, so it also
doubles as a "reset to the start of the demo" script.

## Deploy to Vercel

    git init && git add -A && git commit -m "init"
    # push to a new GitHub repo, then import it at vercel.com/new

Or `npx vercel` from this directory. Point `DATABASE_URL` at a reachable
Postgres instance first — the API routes need one.

## Demo path

1. Banner shows connection capacity exceeded (storefront-api 12 workers x 10 pool = 120 of 100).
2. Investigate -> Connections -> Open settings on storefront-api.
3. Set pool to 5, Apply and restart workers — persisted live to Postgres.
4. Trigger the agent (`runAgent()`, currently the local demo driver) ->
   it replays on checkout-worker, recomputes floor(30/8) = 3, and applies it.
5. Watch the Agent activity panel and the incident rail's sparklines update
   as it works.

The point of the last step: 5 (what worked on storefront-api) would have
been wrong on checkout-worker. The agent recomputes per-application instead
of reusing the value it saw elsewhere.

## Real data, real edits

Table rows, application connection pools, and incidents are read from and
written to an actual local Postgres database — not in-memory demo state:

- `db/schema.sql` — table definitions.
- `db/seed.mjs` (`npm run db:setup`) — creates the database if missing and
  seeds it with the same fictional pharmacy data the app shipped with.
- `lib/db.js` — the server-side `pg` pool used by the API routes.
- `app/api/tables/[table]`, `app/api/apps`, `app/api/apps/[id]`,
  `app/api/incidents` — GET/POST/PATCH/DELETE routes the frontend calls.

Insert, edit and delete rows from the table editor, or change an
application's pool and hit "Apply and restart workers" — the change is a
real `UPDATE`/`INSERT`/`DELETE` against Postgres and survives a refresh.
Masked columns (DEA numbers, government IDs, card numbers, etc.) are never
accepted from the edit form — the server generates a fresh masked
placeholder itself, the same way a production deployment would deny the
agent's role `SELECT` on those columns.

## Swap points

- `app/page.js` -> `runAgent()` — currently sequences the UI locally so the
  demo is visible (its script lives in `lib/agentScript.js`). Every step is
  handed to a single `pushAgentEvent({ action, evidence, note })` call, so
  swapping this for a websocket subscription to the real agent's action
  stream just means calling `pushAgentEvent` from the socket handler
  instead of from the local timer.

## Recorder hooks

Every interactive control carries a stable `data-action` attribute:

    nav:<view>            table:<name>          investigate:<incident>
    open-app:<app>        set-pool:<app>        apply:<app>
    import:<table>        insert:<table>

The agent's executor finds controls by these, never by coordinates.
Add `data-action` to anything new you build.

## Masked columns

Marked `masked: true` in `lib/data.js` schemas. They render redacted and show a
lock in the header. The API masks them server-side on every insert or edit,
and the agent's database role is denied SELECT on the underlying columns in
production.
