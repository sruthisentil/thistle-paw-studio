"use client";

import { ACTIVITY, SPARK, MAX_CONNECTIONS } from "../lib/data";
import { Spark, Dot } from "./Chrome";

function Metric({ label, value, unit, points, tone }) {
  return (
    <div className="border-b border-line px-4 py-3">
      <div className="text-[12px] text-muted">{label}</div>
      <div className="flex items-end justify-between gap-2">
        <div className="pt-1 font-mono text-[20px] leading-none">
          {value}
          {unit && <span className="pl-1 text-[12px] text-muted">{unit}</span>}
        </div>
        <Spark points={points} tone={tone} w={110} h={30} />
      </div>
    </div>
  );
}

export function RightRail({ connections, incidents, onInvestigate, activeIncident }) {
  const hot = connections / MAX_CONNECTIONS > 0.9;
  const live = incidents.filter((i) => i.live);
  const backlog = incidents.filter((i) => !i.live);

  return (
    <aside className="flex w-[310px] shrink-0 flex-col overflow-y-auto border-l border-line bg-panel">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="text-[13px] font-medium">Database health</span>
        <span className="ml-auto flex items-center gap-1.5 text-[11.5px] text-muted">
          <Dot tone={hot ? "bad" : "ok"} pulse={hot} />
          {hot ? "Degraded" : "Healthy"}
        </span>
      </div>

      <Metric
        label="Connections"
        value={`${connections} / ${MAX_CONNECTIONS}`}
        points={SPARK.connections}
        tone={hot ? "bad" : "ok"}
      />
      <Metric label="Memory" value="68" unit="%" points={SPARK.memory} tone="ok" />
      <Metric label="Query latency" value="840" unit="ms" points={SPARK.latency} tone="bad" />

      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="text-[13px] font-medium">Incidents</span>
        <span className="ml-auto text-[11.5px] text-faint">{incidents.length} open</span>
      </div>

      <div className="border-b border-line">
        {live.map((inc) => (
          <IncidentRow
            key={inc.id}
            inc={inc}
            active={activeIncident === inc.id}
            onInvestigate={onInvestigate}
          />
        ))}
      </div>

      <div className="px-4 pb-1 pt-3 text-[11.5px] text-faint">
        Unresolved · nobody has had time
      </div>
      <div>
        {backlog.map((inc) => (
          <IncidentRow
            key={inc.id}
            inc={inc}
            dim
            active={activeIncident === inc.id}
            onInvestigate={onInvestigate}
          />
        ))}
      </div>

      <div className="border-b border-t border-line px-4 py-3 text-[13px] font-medium">
        Recent activity
      </div>
      <div className="pb-6">
        {ACTIVITY.map((a, i) => (
          <div key={i} className="flex gap-2.5 px-4 py-2.5">
            <span className="pt-1.5">
              <Dot tone={a.tone === "warn" ? "warn" : "ok"} />
            </span>
            <div className="min-w-0">
              <div className="text-[12.5px] leading-snug">{a.title}</div>
              <div className="pt-0.5 text-[11.5px] leading-snug text-muted">{a.detail}</div>
              <div className="pt-0.5 text-[11px] text-faint">{a.when}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function IncidentRow({ inc, dim, active, onInvestigate }) {
  const tone = inc.severity === "critical" ? "bad" : inc.severity === "warning" ? "warn" : "muted";
  return (
    <div
      className={`px-4 py-3 ${active ? "bg-brand/5" : ""} ${dim ? "opacity-75" : ""} border-b border-line/60`}
    >
      <div className="flex items-start gap-2">
        <span className="pt-1.5">
          <Dot tone={tone} pulse={inc.live} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-[12.5px] text-fg">{inc.title}</span>
            <span className="ml-auto shrink-0 font-mono text-[11px] text-faint">{inc.code}</span>
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            <div className="min-w-0 flex-1 text-[11.5px] text-muted">
              {inc.resource} · {inc.count ? `seen ${inc.count}× · ` : ""}
              {inc.seen}
            </div>
            {inc.history?.length > 1 && <Spark points={inc.history} tone={tone} w={56} h={18} />}
          </div>
          <button
            data-action={`investigate:${inc.id}`}
            onClick={() => onInvestigate(inc)}
            className="pt-1.5 text-[11.5px] text-brand hover:underline"
          >
            Investigate
          </button>
        </div>
      </div>
    </div>
  );
}
