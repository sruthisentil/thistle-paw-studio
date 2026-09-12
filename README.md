# Thistle & Paw — Database Studio

DevOps engineer's view of a fictional pet pharmacy's Postgres platform.
Built for the Dell x NVIDIA local-agent hackathon.

## Run

    npm install
    npm run dev        # http://localhost:3000

## Deploy to Vercel

    git init && git add -A && git commit -m "init"
    # push to a new GitHub repo, then import it at vercel.com/new

Or `npx vercel` from this directory.

## Demo path

1. Banner shows connection capacity exceeded (storefront-api 12 workers x 10 pool = 120 of 100).
2. Teach mode -> Start recording.
3. Investigate -> Connections -> Open settings on storefront-api.
4. Set pool to 5, Apply and restart workers.
5. Stop and save -> a workflow appears under the Workflows tab.
6. Run on checkout-worker -> the agent replays, recomputes
   floor(30/8) = 3, and applies it.

The point of the last step: 5 would have been wrong. The agent recomputes.

## Swap points

Two places, both commented in the source:

- `lib/data.js` — all seed data. Replace each export with a fetch to the
  backend API on the box (`/api/tables/:name`, `/api/connections`, `/api/apps`,
  `/api/incidents`).
- `app/page.js` -> `runAgent()` — currently sequences the UI locally so the
  demo is visible. Replace with a websocket subscription to the agent's action
  stream. Each message carries `{ action, target, evidence }` in exactly the
  shape the local script already emits.

## Recorder hooks

Every interactive control carries a stable `data-action` attribute:

    nav:<view>            table:<name>          investigate:<incident>
    open-app:<app>        set-pool:<app>        apply:<app>
    import:<table>        insert:<table>        workflow:run

The agent's executor finds controls by these, never by coordinates.
Add `data-action` to anything new you build.

## Masked columns

Marked `masked: true` in `lib/data.js` schemas. They render redacted and show a
lock in the header. In production the API masks them server-side and the agent's
database role is denied SELECT on the underlying columns.
