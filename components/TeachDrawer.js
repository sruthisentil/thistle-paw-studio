"use client";

function formatClock(ms) {
  return new Date(ms).toLocaleTimeString([], { hour12: false });
}

export function TeachDrawer({ open, onToggle, entries, agentRunning }) {
  return (
    <div className="shrink-0 border-t border-line bg-panel">
      <div className="flex h-10 items-center gap-1 px-3">
        <span className="rounded px-2.5 py-1 text-[12.5px] text-fg">Agent activity</span>

        <button
          data-action="drawer:toggle"
          onClick={() => onToggle(!open)}
          className="ml-auto rounded px-2 py-1 text-[12px] text-muted hover:text-fg"
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {open && (
        <div className="h-56 overflow-y-auto border-t border-line p-3">
          {entries.length === 0 ? (
            <p className="pt-6 text-center text-[12.5px] text-faint">
              No agent activity. Workflows run from the operations console.
            </p>
          ) : (
            <div className="relative pl-1">
              <div className="pointer-events-none absolute bottom-1 left-3 top-1 w-px bg-line" />
              <ol className="space-y-3">
                {entries.map((s, i) => {
                  const isLast = i === entries.length - 1;
                  const live = isLast && agentRunning;
                  return (
                    <li key={i} className="relative flex gap-3">
                      <div className="relative z-10 flex w-6 shrink-0 justify-center">
                        <span
                          className={`mt-1 h-[9px] w-[9px] rounded-full border-2 bg-ink ${
                            live ? "border-brand pulsedot" : "border-brand/60"
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1 pb-0.5">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[12.5px] text-brand">{s.action}</span>
                          {s.at && (
                            <span className="ml-auto shrink-0 font-mono text-[10.5px] text-faint">
                              {formatClock(s.at)}
                            </span>
                          )}
                        </div>
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
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
