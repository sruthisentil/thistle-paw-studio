"use client";

import { ORG, TABLES } from "../lib/data";

/* ---------------------------------------------------------------- primitives */

export function Spark({ points, tone = "ok", w = 120, h = 34 }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = w / (points.length - 1);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(h - ((p - min) / span) * (h - 4) - 2).toFixed(1)}`)
    .join(" ");
  const stroke = tone === "bad" ? "#f45b5b" : tone === "warn" ? "#f0a92c" : "#3ecf8e";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="overflow-visible">
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function Dot({ tone = "ok", pulse = false }) {
  const bg = tone === "bad" ? "bg-danger" : tone === "warn" ? "bg-amber" : tone === "muted" ? "bg-faint" : "bg-brand";
  return <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${bg} ${pulse ? "pulsedot" : ""}`} />;
}

export function Pill({ value }) {
  const tones = {
    ok: "bg-brand/10 text-brand border-brand/25",
    warn: "bg-amber/10 text-amber border-amber/25",
    bad: "bg-danger/10 text-danger border-danger/25",
    ctrl: "bg-[#8b7cf6]/10 text-[#a99bff] border-[#8b7cf6]/30",
    muted: "bg-line text-muted border-line2",
  };
  const s = String(value).toLowerCase();
  let tone = "muted";
  if (["active", "captured", "resolved", "healthy"].includes(s)) tone = "ok";
  else if (["pending", "pending_review", "open"].includes(s)) tone = "warn";
  else if (["failed", "expired", "escalated"].includes(s)) tone = "bad";
  else if (s === "controlled") tone = "ctrl";
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] leading-none ${tones[tone]}`}>
      {value}
    </span>
  );
}

export function Lock() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="shrink-0 opacity-60">
      <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2.2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}

/* ---------------------------------------------------------------- brand mark */

function Mark() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="20.5" r="6.5" fill="#3ecf8e" />
      <circle cx="8.5" cy="11.5" r="3.1" fill="#3ecf8e" opacity="0.85" />
      <circle cx="15.2" cy="8.2" r="3.1" fill="#3ecf8e" opacity="0.85" />
      <circle cx="22.3" cy="11.8" r="3.1" fill="#3ecf8e" opacity="0.85" />
    </svg>
  );
}

/* ---------------------------------------------------------------- top bar */

export function TopBar() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-line bg-panel px-3">
      <div className="flex items-center gap-2 pr-2">
        <Mark />
        <span className="text-[13px] font-medium tracking-tight">Database Studio</span>
      </div>
      <div className="flex items-center gap-2 border-l border-line pl-3 text-[12px] text-muted">
        <span>{ORG.company}</span>
        <span className="text-faint">/</span>
        <span>{ORG.project}</span>
        <span className="text-faint">/</span>
        <span className="rounded border border-brand/30 bg-brand/10 px-1.5 py-0.5 text-[11px] text-brand">
          {ORG.env}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="flex h-7 w-64 items-center gap-2 rounded border border-line bg-ink px-2 text-[12px] text-faint">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" />
          </svg>
          Search tables, columns, incidents
        </div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-line2 text-[10px] font-medium">
          JD
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- sidebar */

const NAV = [
  { id: "overview", label: "Project overview" },
  { id: "tables", label: "Table editor" },
  { id: "sql", label: "SQL editor" },
  { id: "connections", label: "Connections", indent: true, group: "Database" },
  { id: "apps", label: "Applications", indent: true },
  { id: "indexes", label: "Indexes", indent: true },
  { id: "roles", label: "Roles", indent: true },
  { id: "observability", label: "Observability" },
  { id: "settings", label: "Settings" },
];

export function Sidebar({ view, onNavigate }) {
  return (
    <nav className="flex w-52 shrink-0 flex-col border-r border-line bg-panel py-2">
      {NAV.map((item) => (
        <div key={item.id}>
          {item.group && (
            <div className="px-3 pb-1 pt-3 text-[11px] text-faint">{item.group}</div>
          )}
          <button
            data-action={`nav:${item.id}`}
            onClick={() => onNavigate(item.id)}
            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12.5px] transition-colors ${
              item.indent ? "pl-6" : ""
            } ${
              view === item.id
                ? "bg-brand/10 text-brand"
                : "text-muted hover:bg-raised hover:text-fg"
            }`}
          >
            {item.label}
          </button>
        </div>
      ))}
    </nav>
  );
}

/* ---------------------------------------------------------------- table list */

export function TableList({ active, onSelect }) {
  return (
    <div className="flex w-56 shrink-0 flex-col border-r border-line bg-ink">
      <div className="border-b border-line px-3 py-2">
        <div className="flex h-7 items-center gap-2 rounded border border-line bg-panel px-2 text-[12px] text-faint">
          Search tables
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-2 text-[12px] text-muted">
        <span>schema: <span className="text-fg">public</span></span>
      </div>
      <div className="flex-1 overflow-y-auto pb-2">
        {TABLES.map((t) => (
          <button
            key={t.name}
            data-action={`table:${t.name}`}
            onClick={() => onSelect(t.name)}
            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12.5px] transition-colors ${
              active === t.name ? "bg-brand/10 text-brand" : "text-muted hover:bg-raised hover:text-fg"
            }`}
          >
            <span className="truncate">{t.name}</span>
            {t.sensitive && <span className="ml-auto text-faint"><Lock /></span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- status bar */

export function StatusBar({ connections, max }) {
  const hot = connections / max > 0.9;
  return (
    <footer className="flex h-8 shrink-0 items-center gap-4 border-t border-line bg-panel px-3 text-[11.5px] text-muted">
      <span className="flex items-center gap-2">
        <Dot tone={hot ? "bad" : "ok"} pulse={hot} />
        Local PostgreSQL
      </span>
      <span className="text-faint">Synthetic records · no live PHI</span>
      <span className="ml-auto font-mono text-faint">
        {connections}/{max} connections
      </span>
    </footer>
  );
}
