"use client";

import { Dot } from "./Chrome";

export function TeachDrawer({
  open,
  onToggle,
  tab,
  onTab,
  recording,
  onStartStop,
  steps,
  workflows,
  onClear,
  onRunAgent,
  agentRunning,
  agentLog,
}) {
  return (
    <div className="shrink-0 border-t border-line bg-panel">
      <div className="flex h-10 items-center gap-1 px-3">
        <button
          data-action="drawer:teach"
          onClick={() => {
            onTab("teach");
            if (!open) onToggle(true);
          }}
          className={`rounded px-2.5 py-1 text-[12.5px] ${
            tab === "teach" && open ? "bg-raised text-fg" : "text-muted hover:text-fg"
          }`}
        >
          Teach mode
        </button>
        <button
          data-action="drawer:workflows"
          onClick={() => {
            onTab("workflows");
            if (!open) onToggle(true);
          }}
          className={`rounded px-2.5 py-1 text-[12.5px] ${
            tab === "workflows" && open ? "bg-raised text-fg" : "text-muted hover:text-fg"
          }`}
        >
          Workflows
          <span className="ml-1.5 rounded bg-line px-1 text-[11px] text-muted">{workflows.length}</span>
        </button>

        {recording && (
          <span className="ml-2 flex items-center gap-1.5 rounded border border-danger/30 bg-danger/10 px-2 py-0.5 text-[11.5px] text-danger">
            <Dot tone="bad" pulse />
            Recording · {steps.length} actions
          </span>
        )}
        {agentRunning && (
          <span className="ml-2 flex items-center gap-1.5 rounded border border-brand/30 bg-brand/10 px-2 py-0.5 text-[11.5px] text-brand">
            <Dot tone="ok" pulse />
            Agent running
          </span>
        )}

        <button
          data-action="drawer:toggle"
          onClick={() => onToggle(!open)}
          className="ml-auto rounded px-2 py-1 text-[12px] text-muted hover:text-fg"
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {open && (
        <div className="h-56 overflow-y-auto border-t border-line">
          {tab === "teach" ? (
            <TeachPanel
              recording={recording}
              onStartStop={onStartStop}
              steps={steps}
              onClear={onClear}
              agentLog={agentLog}
              agentRunning={agentRunning}
            />
          ) : (
            <WorkflowPanel workflows={workflows} onRunAgent={onRunAgent} agentRunning={agentRunning} />
          )}
        </div>
      )}
    </div>
  );
}

function TeachPanel({ recording, onStartStop, steps, onClear, agentLog, agentRunning }) {
  const feed = agentRunning || agentLog.length ? agentLog : steps;
  const isAgent = agentRunning || (agentLog.length > 0 && steps.length === 0);

  return (
    <div className="flex h-full">
      <div className="w-56 shrink-0 border-r border-line p-3">
        <button
          data-action="teach:start-stop"
          onClick={onStartStop}
          disabled={agentRunning}
          className={`w-full rounded px-3 py-1.5 text-[12.5px] font-medium disabled:opacity-40 ${
            recording ? "bg-danger text-white" : "bg-brand text-ink hover:bg-brand/90"
          }`}
        >
          {recording ? "Stop and save" : "Start recording"}
        </button>
        <button
          data-action="teach:clear"
          onClick={onClear}
          className="mt-2 w-full rounded border border-line2 px-3 py-1.5 text-[12.5px] text-muted hover:text-fg"
        >
          Clear
        </button>
        <p className="pt-3 text-[11.5px] leading-relaxed text-faint">
          Fix the incident the way you normally would. Each action is captured with the
          values that were on screen when you took it.
        </p>
      </div>

      <div className="min-w-0 flex-1 p-3">
        {feed.length === 0 ? (
          <p className="pt-6 text-center text-[12.5px] text-faint">
            Nothing captured yet. Start recording, then work the incident.
          </p>
        ) : (
          <ol className="space-y-1.5">
            {feed.map((s, i) => (
              <li key={i} className="flex gap-3 rounded border border-line bg-ink px-3 py-2">
                <span className="pt-0.5 font-mono text-[11px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <div className={`text-[12.5px] ${isAgent ? "text-brand" : "text-fg"}`}>{s.action}</div>
                  {s.evidence && Object.keys(s.evidence).length > 0 && (
                    <div className="pt-0.5 font-mono text-[11px] text-muted">
                      {Object.entries(s.evidence)
                        .map(([k, v]) => `${k}=${v}`)
                        .join("  ")}
                    </div>
                  )}
                  {s.note && <div className="pt-0.5 text-[11.5px] text-faint">{s.note}</div>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function WorkflowPanel({ workflows, onRunAgent, agentRunning }) {
  if (workflows.length === 0) {
    return (
      <p className="p-6 text-center text-[12.5px] text-faint">
        No workflows yet. Record a repair in teach mode and it will appear here.
      </p>
    );
  }
  return (
    <div className="p-3">
      {workflows.map((w) => (
        <div key={w.id} className="rounded border border-line bg-ink p-3">
          <div className="flex items-center gap-2">
            <Dot tone="ok" />
            <span className="text-[13px]">{w.name}</span>
            <span className="font-mono text-[11px] text-faint">{w.code}</span>
            <span className="ml-auto text-[11.5px] text-muted">
              learned from {w.demonstrations} demonstrations
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <div className="pb-1 text-[11.5px] text-faint">Steps</div>
              <ol className="space-y-1">
                {w.steps.map((s, i) => (
                  <li key={i} className="font-mono text-[11.5px] text-muted">
                    {i + 1}. {s}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <div className="pb-1 text-[11.5px] text-faint">Generalised parameter</div>
              <div className="rounded border border-brand/25 bg-brand/5 px-2.5 py-2 font-mono text-[12px] text-brand">
                {w.formula}
              </div>
              <div className="pt-2 text-[11.5px] leading-relaxed text-faint">
                Recorded as a rule, not a value. The agent recomputes it against whichever
                application it is pointed at.
              </div>
            </div>
          </div>

          <button
            data-action="workflow:run"
            onClick={onRunAgent}
            disabled={agentRunning}
            className="mt-3 rounded bg-brand px-3 py-1.5 text-[12.5px] font-medium text-ink hover:bg-brand/90 disabled:opacity-40"
          >
            Run on checkout-worker
          </button>
        </div>
      ))}
    </div>
  );
}
