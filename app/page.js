"use client";

import { useState, useCallback, useRef } from "react";
import { TopBar, Sidebar, TableList, StatusBar } from "../components/Chrome";
import { TableView, ConnectionsView, AppConfigView } from "../components/Views";
import { RightRail } from "../components/RightRail";
import { TeachDrawer } from "../components/TeachDrawer";
import { APPS, MAX_CONNECTIONS, INCIDENTS } from "../lib/data";

export default function Page() {
  const [view, setView] = useState("tables");
  const [table, setTable] = useState("prescriptions");
  const [openAppId, setOpenAppId] = useState(null);
  const [apps, setApps] = useState(APPS);

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [drawerTab, setDrawerTab] = useState("teach");
  const [recording, setRecording] = useState(false);
  const [steps, setSteps] = useState([]);
  const [workflows, setWorkflows] = useState([]);

  const [agentRunning, setAgentRunning] = useState(false);
  const [agentLog, setAgentLog] = useState([]);
  const [agentTarget, setAgentTarget] = useState(null);
  const [activeIncident, setActiveIncident] = useState(null);

  const timers = useRef([]);

  const connections = apps.reduce((s, a) => s + a.workers * a.pool, 0);

  /* ------------------------------------------------------------ recording */

  const record = useCallback(
    (entry) => {
      if (!recording) return;
      setSteps((prev) => [...prev, entry]);
    },
    [recording]
  );

  function startStop() {
    if (recording) {
      setRecording(false);
      if (steps.length) {
        setWorkflows([
          {
            id: "WF-001",
            name: "Resolve connection saturation",
            code: "53300",
            demonstrations: 2,
            steps: [
              "open incident",
              "read connections by application",
              "select application holding the most",
              "read workers and connection budget",
              "set pool per worker",
              "apply and restart",
              "rerun verification workload",
            ],
            formula: "pool = floor(budget / workers)",
          },
        ]);
        setDrawerTab("workflows");
      }
    } else {
      setSteps([]);
      setAgentLog([]);
      setRecording(true);
      setDrawerTab("teach");
      setDrawerOpen(true);
    }
  }

  /* ------------------------------------------------------------ navigation */

  function navigate(v) {
    setView(v);
    setOpenAppId(null);
    record({ action: `Opened ${v}`, target: `nav:${v}`, evidence: {} });
  }

  function selectTable(t) {
    setTable(t);
    setView("tables");
    record({ action: `Opened table ${t}`, target: `table:${t}`, evidence: {} });
  }

  function investigate(inc) {
    setActiveIncident(inc.id);
    setView("connections");
    setOpenAppId(null);
    record({
      action: `Opened incident ${inc.id}`,
      target: `investigate:${inc.id}`,
      evidence: { code: inc.code, resource: inc.resource },
    });
  }

  function applyPool(appId, pool) {
    setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, pool } : a)));
  }

  /* ------------------------------------------------------------ agent replay
   * SWAP POINT — today this sequences the UI locally so the demo is visible.
   * On the box, replace with a websocket subscription to the agent's action
   * stream: each message carries { action, target, evidence } exactly as below.
   * ------------------------------------------------------------------------ */

  function runAgent() {
    const target = apps.find((a) => a.id === "checkout-worker");
    const computed = Math.floor(target.budget / target.workers);

    const script = [
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

    setAgentRunning(true);
    setAgentLog([]);
    setDrawerTab("teach");
    setDrawerOpen(true);

    let t = 0;
    timers.current.forEach(clearTimeout);
    timers.current = [];

    script.forEach((s) => {
      t += s.delay;
      timers.current.push(
        setTimeout(() => {
          s.go?.();
          s.act?.();
          if (s.highlight !== undefined) setAgentTarget(s.highlight);
          setAgentLog((prev) => [...prev, s.log]);
        }, t)
      );
    });

    timers.current.push(
      setTimeout(() => {
        setAgentTarget(null);
        setAgentRunning(false);
      }, t + 900)
    );
  }

  /* ------------------------------------------------------------ render */

  const openApp = apps.find((a) => a.id === openAppId);
  const banner = connections > MAX_CONNECTIONS;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-ink">
      <TopBar />

      <div className="flex min-h-0 flex-1">
        <Sidebar view={view} onNavigate={navigate} />
        {view === "tables" && <TableList active={table} onSelect={selectTable} />}

        <main className="flex min-h-0 flex-1 flex-col">
          {banner && (
            <div className="mx-5 mt-4 flex items-center gap-3 rounded border border-danger/30 bg-danger/10 px-4 py-2.5">
              <div className="min-w-0">
                <div className="text-[13px] text-danger">Connection capacity exceeded</div>
                <div className="pt-0.5 font-mono text-[11.5px] text-danger/70">
                  FATAL: remaining connection slots are reserved for non-replication superuser connections
                </div>
              </div>
              <button
                data-action="banner:investigate"
                onClick={() => investigate(INCIDENTS[0])}
                className="ml-auto shrink-0 rounded border border-danger/40 px-2.5 py-1 text-[12px] text-danger hover:bg-danger/10"
              >
                Investigate
              </button>
            </div>
          )}

          {view === "tables" && <TableView table={table} onRecord={record} />}

          {view === "connections" && (
            <ConnectionsView
              apps={apps}
              onRecord={record}
              agentTarget={agentTarget}
              onOpenApp={(id) => {
                setOpenAppId(id);
                setView("apps");
              }}
            />
          )}

          {view === "apps" &&
            (openApp ? (
              <AppConfigView
                key={openApp.id + openApp.pool}
                app={openApp}
                onRecord={record}
                onApply={applyPool}
                agentTarget={agentTarget}
              />
            ) : (
              <ConnectionsView
                apps={apps}
                onRecord={record}
                agentTarget={agentTarget}
                onOpenApp={(id) => setOpenAppId(id)}
              />
            ))}

          {!["tables", "connections", "apps"].includes(view) && (
            <div className="flex flex-1 items-center justify-center px-10 text-center">
              <div>
                <p className="text-[14px]">Not part of the demo path</p>
                <p className="max-w-sm pt-1 text-[12.5px] text-muted">
                  Table editor, Connections and Applications are wired up. Everything else is
                  scaffolding.
                </p>
              </div>
            </div>
          )}
        </main>

        <RightRail
          connections={connections}
          onInvestigate={investigate}
          activeIncident={activeIncident}
        />
      </div>

      <TeachDrawer
        open={drawerOpen}
        onToggle={setDrawerOpen}
        tab={drawerTab}
        onTab={setDrawerTab}
        recording={recording}
        onStartStop={startStop}
        steps={steps}
        workflows={workflows}
        onClear={() => { setSteps([]); setAgentLog([]); }}
        onRunAgent={runAgent}
        agentRunning={agentRunning}
        agentLog={agentLog}
      />

      <StatusBar connections={connections} max={MAX_CONNECTIONS} />
    </div>
  );
}
