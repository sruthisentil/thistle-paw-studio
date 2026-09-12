"use client";

export function TeachDrawer({ open, onToggle, entries }) {
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
            <ol className="space-y-1.5">
              {entries.map((s, i) => (
                <li key={i} className="flex gap-3 rounded border border-line bg-ink px-3 py-2">
                  <span className="pt-0.5 font-mono text-[11px] text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12.5px] text-brand">{s.action}</div>
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
      )}
    </div>
  );
}
