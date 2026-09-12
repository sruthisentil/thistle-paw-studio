"use client";

import { useState, useCallback, useRef } from "react";
import { TopBar, Sidebar, TableList, StatusBar } from "../components/Chrome";
import { TableView, ConnectionsView, AppConfigView } from "../components/Views";
import { RightRail } from "../components/RightRail";
import { TeachDrawer } from "../components/TeachDrawer";
import { APPS, MAX_CONNECTIONS, INCIDENTS } from "../lib/data";
import { buildAgentScript } from "../lib/agentScript";

export default function Page() {
  const [view, setView] = useState("tables");
  const [table, setTable] = useState("prescriptions");
  const [openAppId, setOpenAppId] = useState(null);
  const [apps, setApps] = useState(APPS);

  const [drawerOpen, setDrawerOpen] = useState(true);

  const [agentRunning, setAgentRunning] = useState(false);
  const [agentLog, setAgentLog] = useState([]);
  const [agentTarget, setAgentTarget] = useState(null);
  const [activeIncident, setActiveIncident] = useState(null);

  const timers = useRef([]);

  const connections = apps.reduce((s, a) => s + a.workers * a.pool, 0);

  /* ------------------------------------------------------------ agent feed */

  const pushAgentEvent = useCallback((entry) => {
    setAgentLog((prev) => [...prev, entry]);
  }, []);

  /* ------------------------------------------------------------ navigation */

  function navigate(v) {
    setView(v);
    setOpenAppId(null);
  }

  function selectTable(t) {
    setTable(t);
    setView("tables");
  }

  function investigate(inc) {
    setActiveIncident(inc.id);
    setView("connections");
    setOpenAppId(null);
  }

  function applyPool(appId, pool) {
    setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, pool } : a)));
  }

  /* ------------------------------------------------------------ agent replay
   * SWAP POINT — today this sequences the UI locally so the demo is visible.
   * On the box, replace with a websocket subscription to the agent's action
   * stream: each message carries { action, evidence, note } and should be
   * handed to pushAgentEvent exactly as the local script already does.
   * ------------------------------------------------------------------------ */

  function runAgent() {
    const script = buildAgentScript({
      apps,
      connections,
      MAX_CONNECTIONS,
      setView,
      setOpenAppId,
      applyPool,
    });

    setAgentRunning(true);
    setAgentLog([]);
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
          pushAgentEvent(s.log);
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

          {view === "tables" && <TableView table={table} />}

          {view === "connections" && (
            <ConnectionsView
              apps={apps}
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
                onApply={applyPool}
                agentTarget={agentTarget}
              />
            ) : (
              <ConnectionsView
                apps={apps}
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

      <TeachDrawer open={drawerOpen} onToggle={setDrawerOpen} entries={agentLog} />

      <StatusBar connections={connections} max={MAX_CONNECTIONS} />
    </div>
  );
}
