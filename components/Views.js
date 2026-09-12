"use client";

import { useState } from "react";
import { SCHEMAS, ROWS, TABLES, MAX_CONNECTIONS } from "../lib/data";
import { Pill, Lock, Dot } from "./Chrome";

/* ---------------------------------------------------------------- table view */

export function TableView({ table }) {
  const schema = SCHEMAS[table];
  const rows = ROWS[table];

  if (!schema) {
    return (
      <Empty
        title={`No preview for ${table}`}
        body="This table isn't wired into the demo seed. Pick prescriptions, pets, customers, payments or support_tickets."
      />
    );
  }

  const meta = TABLES.find((t) => t.name === table);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-end gap-3 px-5 pb-3 pt-4">
        <div>
          <h1 className="text-[22px] font-medium leading-tight tracking-tight">{table}</h1>
          <p className="pt-1 text-[12px] text-muted">
            public · {meta?.records.toLocaleString()} records
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Btn label="Insert row" primary action={`insert:${table}`} />
          <Btn label="Import data" action={`import:${table}`} />
          <Btn label="Filter" action={`filter:${table}`} />
          <Btn label="Sort" action={`sort:${table}`} />
        </div>
      </div>

      <div className="mx-5 mb-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-line bg-panel">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-collapse text-[12.5px]">
            <thead className="sticky top-0 z-10 bg-raised">
              <tr className="border-b border-line">
                {schema.map((c) => (
                  <th
                    key={c.key}
                    className={`${c.w} whitespace-nowrap border-r border-line px-3 py-2 text-left font-normal text-muted`}
                  >
                    <span className="flex items-center gap-1.5">
                      {c.masked && <span className="text-amber"><Lock /></span>}
                      {c.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-line/70 hover:bg-raised/60">
                  {row.map((cell, j) => {
                    const col = schema[j];
                    return (
                      <td
                        key={j}
                        className={`whitespace-nowrap border-r border-line/50 px-3 py-[7px] ${
                          col.masked ? "font-mono text-[11.5px] text-faint" : "text-fg/90"
                        }`}
                      >
                        {col.pill ? <Pill value={cell} /> : cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex h-9 shrink-0 items-center gap-3 border-t border-line px-3 text-[11.5px] text-muted">
          <span>100 rows per page</span>
          <span className="ml-auto">Page 1 of {Math.ceil((meta?.records || 0) / 100).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- connections */

export function ConnectionsView({ apps, onOpenApp, agentTarget }) {
  const total = apps.reduce((s, a) => s + a.workers * a.pool, 0);
  const sorted = [...apps].sort((a, b) => b.workers * b.pool - a.workers * a.pool);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-5 pb-3 pt-4">
        <h1 className="text-[22px] font-medium leading-tight tracking-tight">Connections</h1>
        <p className="pt-1 text-[12px] text-muted">
          Live sessions by application · capacity {MAX_CONNECTIONS}
        </p>
      </div>

      <div className="mx-5 mb-3 rounded border border-line bg-panel p-4">
        <div className="flex items-baseline gap-2">
          <span className={`font-mono text-[28px] leading-none ${total > MAX_CONNECTIONS ? "text-danger" : "text-fg"}`}>
            {total}
          </span>
          <span className="text-[13px] text-muted">of {MAX_CONNECTIONS} connections held</span>
          {total > MAX_CONNECTIONS && (
            <span className="ml-2 rounded border border-danger/30 bg-danger/10 px-1.5 py-0.5 font-mono text-[11px] text-danger">
              53300 over capacity
            </span>
          )}
        </div>
        <div className="mt-3 flex h-2 overflow-hidden rounded bg-ink">
          {sorted.map((a) => (
            <div
              key={a.id}
              style={{ width: `${Math.min(100, ((a.workers * a.pool) / MAX_CONNECTIONS) * 100)}%` }}
              className={a.workers * a.pool > a.budget ? "bg-danger" : "bg-brand"}
              title={a.name}
            />
          ))}
        </div>
      </div>

      <div className="mx-5 mb-4 overflow-hidden rounded border border-line bg-panel">
        <table className="w-full border-collapse text-[12.5px]">
          <thead className="bg-raised">
            <tr className="border-b border-line text-left text-muted">
              <th className="px-3 py-2 font-normal">application</th>
              <th className="px-3 py-2 font-normal">db role</th>
              <th className="px-3 py-2 font-normal">workers</th>
              <th className="px-3 py-2 font-normal">pool / worker</th>
              <th className="px-3 py-2 font-normal">connections held</th>
              <th className="px-3 py-2 font-normal">budget</th>
              <th className="px-3 py-2 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => {
              const held = a.workers * a.pool;
              const over = held > a.budget;
              return (
                <tr key={a.id} className="border-b border-line/70">
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-2">
                      <Dot tone={over ? "bad" : "ok"} pulse={over} />
                      {a.name}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11.5px] text-faint">{a.role}</td>
                  <td className="px-3 py-2.5 font-mono">{a.workers}</td>
                  <td className="px-3 py-2.5 font-mono">{a.pool}</td>
                  <td className={`px-3 py-2.5 font-mono ${over ? "text-danger" : ""}`}>{held}</td>
                  <td className="px-3 py-2.5 font-mono text-muted">{a.budget}</td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      data-action={`open-app:${a.id}`}
                      onClick={() => onOpenApp(a.id)}
                      className={`rounded border px-2 py-1 text-[11.5px] transition-colors ${
                        agentTarget === `open-app:${a.id}`
                          ? "agent-target border-brand text-brand"
                          : "border-line2 text-muted hover:border-brand/50 hover:text-fg"
                      }`}
                    >
                      Open settings
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- app config */

export function AppConfigView({ app, onApply, agentTarget }) {
  const [pool, setPool] = useState(app.pool);
  const demand = app.workers * pool;
  const fits = demand <= app.budget;
  const suggested = Math.floor(app.budget / app.workers);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="px-5 pb-3 pt-4">
        <h1 className="text-[22px] font-medium leading-tight tracking-tight">{app.name}</h1>
        <p className="pt-1 text-[12px] text-muted">{app.note} · connection settings</p>
      </div>

      <div className="mx-5 mb-4 grid grid-cols-3 gap-3">
        <Stat label="Worker processes" value={app.workers} hint="set by deployment" />
        <Stat label="Connection budget" value={app.budget} hint="allocated share of capacity" />
        <Stat
          label="Current demand"
          value={demand}
          hint={fits ? "within budget" : "exceeds budget"}
          tone={fits ? "ok" : "bad"}
        />
      </div>

      <div className="mx-5 mb-4 rounded border border-line bg-panel p-4">
        <label className="block text-[12.5px] text-fg">Maximum connections per worker</label>
        <p className="pb-3 pt-1 text-[12px] text-muted">
          Each worker opens a pool of this size. Total demand is workers multiplied by pool size.
        </p>
        <div className="flex items-center gap-3">
          <input
            data-action={`set-pool:${app.id}`}
            type="number"
            min={1}
            max={20}
            value={pool}
            onChange={(e) => setPool(Number(e.target.value))}
            className={`h-9 w-24 rounded border bg-ink px-3 font-mono text-[13px] text-fg ${
              agentTarget === `set-pool:${app.id}` ? "agent-target border-brand" : "border-line2"
            }`}
          />
          <span className="font-mono text-[12.5px] text-muted">
            {app.workers} workers × {pool} = {demand} connections
          </span>
          {!fits && (
            <span className="rounded border border-danger/30 bg-danger/10 px-2 py-1 text-[11.5px] text-danger">
              Over budget by {demand - app.budget}
            </span>
          )}
          {fits && demand === 0 && (
            <span className="rounded border border-amber/30 bg-amber/10 px-2 py-1 text-[11.5px] text-amber">
              No connections means no throughput
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
          <button
            data-action={`apply:${app.id}`}
            onClick={() => onApply(app.id, pool)}
            className={`rounded px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
              agentTarget === `apply:${app.id}`
                ? "agent-target bg-brand text-ink"
                : "bg-brand text-ink hover:bg-brand/90"
            }`}
          >
            Apply and restart workers
          </button>
          <button
            data-action={`suggest:${app.id}`}
            onClick={() => setPool(suggested)}
            className="rounded border border-line2 px-3 py-1.5 text-[12.5px] text-muted hover:text-fg"
          >
            Fit to budget
          </button>
          <span className="ml-auto font-mono text-[11.5px] text-faint">
            floor({app.budget} / {app.workers}) = {suggested}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- bits */

function Stat({ label, value, hint, tone }) {
  const color = tone === "bad" ? "text-danger" : tone === "warn" ? "text-amber" : "text-fg";
  return (
    <div className="rounded border border-line bg-panel p-3">
      <div className="text-[12px] text-muted">{label}</div>
      <div className={`pt-1 font-mono text-[24px] leading-none ${color}`}>{value}</div>
      <div className="pt-1.5 text-[11.5px] text-faint">{hint}</div>
    </div>
  );
}

function Btn({ label, primary, action }) {
  return (
    <button
      data-action={action}
      className={`rounded px-2.5 py-1.5 text-[12px] transition-colors ${
        primary
          ? "bg-brand text-ink hover:bg-brand/90"
          : "border border-line2 text-muted hover:border-line2 hover:text-fg"
      }`}
    >
      {label}
    </button>
  );
}

function Empty({ title, body }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-10 text-center">
      <p className="text-[14px] text-fg">{title}</p>
      <p className="max-w-sm text-[12.5px] text-muted">{body}</p>
    </div>
  );
}
