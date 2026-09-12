// ---------------------------------------------------------------------------
// SWAP POINT
// This is the local demo driver's script: a fixed sequence of steps that
// stand in for a real agent working the checkout-worker incident. Each step
// carries an optional `go`/`act` side effect, an `highlight` target for the
// `.agent-target` glow, and a `log` entry shaped exactly like the messages a
// websocket-driven agent would stream in via `pushAgentEvent`.
// ---------------------------------------------------------------------------

export function buildAgentScript({ apps, connections, MAX_CONNECTIONS, setView, setOpenAppId, applyPool }) {
  const target = apps.find((a) => a.id === "checkout-worker");
  const computed = Math.floor(target.budget / target.workers);

  return [
    {
      delay: 400,
      go: () => { setView("connections"); setOpenAppId(null); },
      log: {
        action: "Reading connections by application",
        evidence: { capacity: MAX_CONNECTIONS, held: connections },
      },
    },
    {
      delay: 1300,
      highlight: "open-app:checkout-worker",
      log: {
        action: "Selected checkout-worker as the responsible application",
        evidence: { held: target.workers * target.pool, budget: target.budget },
      },
    },
    {
      delay: 1300,
      go: () => { setOpenAppId("checkout-worker"); setView("apps"); },
      highlight: null,
      log: {
        action: "Read worker count and connection budget",
        evidence: { workers: target.workers, budget: target.budget },
        note: "Values re-read from the application, not carried over from the demonstration.",
      },
    },
    {
      delay: 1400,
      highlight: `set-pool:checkout-worker`,
      log: {
        action: "Computed pool per worker",
        evidence: { formula: `floor(${target.budget}/${target.workers})`, result: computed },
        note: "The demonstration used 5 on storefront-api. Recomputing gives a different answer here.",
      },
    },
    {
      delay: 1500,
      highlight: `apply:checkout-worker`,
      log: {
        action: "Applied configuration and restarted workers",
        evidence: { pool: computed, demand: computed * target.workers, budget: target.budget },
      },
    },
    {
      delay: 1400,
      act: () => applyPool("checkout-worker", computed),
      highlight: null,
      log: {
        action: "Verification workload passed",
        evidence: { success_rate: "100%", throughput: "preserved", rows_changed: 0 },
      },
    },
  ];
}
