"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { INCIDENT_CATALOGUE } from "./incidentCatalogue";

// The one incident that must never come out of the generator — it lives in
// lib/data.js instead and is pinned in the UI. Defensive: the catalogue
// itself doesn't contain this pairing, but a template's resource could in
// principle be edited later, so the generator checks explicitly too.
const PINNED_CODE = "53300";
const PINNED_RESOURCE = "storefront-api";

const MIN_EMIT_MS = 9000;
const MAX_EMIT_MS = 18000;
const RESOLVE_CHANCE = 1 / 6;
const MAX_VISIBLE = 40;
const RESOLVED_LINGER_MS = 4500;
const NOW_TICK_MS = 15000;
const SEED_COUNT = 8;
const DEFAULT_SEED = 1337;

// Age buckets seeded incidents are spread across so the queue reads as
// having real history (minutes to days old) instead of all appearing at once.
const SEED_AGE_BUCKETS_MS = [
  [2 * 60_000, 20 * 60_000], // 2–20 min
  [20 * 60_000, 2 * 3600_000], // 20 min–2 hr
  [2 * 3600_000, 12 * 3600_000], // 2–12 hr
  [12 * 3600_000, 2 * 86_400_000], // 12 hr–2 days
  [2 * 86_400_000, 4 * 86_400_000], // 2–4 days
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng, min, max) {
  return Math.floor(min + rng() * (max - min + 1));
}

function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

function isPinnedPair(template) {
  return template.code === PINNED_CODE && template.resource === PINNED_RESOURCE;
}

function makeIncident(template, { firstSeen, lastSeen, count, idSuffix }) {
  return {
    id: `${template.code ?? "info"}-${template.resource}-${idSuffix}`,
    code: template.code,
    title: template.title,
    resource: template.resource,
    severity: template.severity,
    symptom: template.symptom,
    category: template.category,
    firstSeen,
    lastSeen,
    count,
    resolved: false,
    resolvedAt: null,
  };
}

export function formatRelativeTime(at, now = Date.now()) {
  const diffMs = Math.max(0, now - at);
  const min = Math.round(diffMs / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.round(hr / 24);
  if (day === 1) return "yesterday";
  return `${day} days ago`;
}

export function useIncidentFeed({ seed = DEFAULT_SEED } = {}) {
  const rngRef = useRef(null);
  if (!rngRef.current) rngRef.current = mulberry32(seed);

  const idCounter = useRef(0);
  const timeoutRef = useRef(null);
  const removalTimeouts = useRef(new Set());
  const pausedRef = useRef(false);

  const [incidents, setIncidents] = useState(() => {
    const rng = rngRef.current;
    const now = Date.now();
    const candidates = INCIDENT_CATALOGUE.filter((t) => !isPinnedPair(t));

    // Shuffle (Fisher–Yates) then dedupe by code+resource so the seed set
    // doesn't start with an instant "duplicate" bump.
    const shuffled = candidates.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const seen = new Set();
    const chosen = [];
    for (const t of shuffled) {
      const key = `${t.code}:${t.resource}`;
      if (seen.has(key)) continue;
      seen.add(key);
      chosen.push(t);
      if (chosen.length === SEED_COUNT) break;
    }

    return chosen.map((template, i) => {
      const bucket = SEED_AGE_BUCKETS_MS[i % SEED_AGE_BUCKETS_MS.length];
      const age = randInt(rng, bucket[0], bucket[1]);
      const firstSeen = now - age;
      idCounter.current += 1;
      return makeIncident(template, {
        firstSeen,
        lastSeen: firstSeen,
        count: 1,
        idSuffix: idCounter.current,
      });
    });
  });

  const [paused, setPausedState] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Periodic re-render so "2 min ago" style labels stay fresh without any
  // incident actually changing.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), NOW_TICK_MS);
    return () => clearInterval(t);
  }, []);

  const emitTick = useCallback(() => {
    const rng = rngRef.current;
    const template = pick(
      rng,
      INCIDENT_CATALOGUE.filter((t) => !isPinnedPair(t))
    );
    const at = Date.now();

    setIncidents((prev) => {
      let next;
      const matchIdx = prev.findIndex(
        (inc) => !inc.resolved && inc.code === template.code && inc.resource === template.resource
      );

      if (matchIdx !== -1) {
        next = prev.slice();
        next[matchIdx] = { ...next[matchIdx], count: next[matchIdx].count + 1, lastSeen: at };
      } else {
        idCounter.current += 1;
        const fresh = makeIncident(template, {
          firstSeen: at,
          lastSeen: at,
          count: 1,
          idSuffix: idCounter.current,
        });
        next = [fresh, ...prev];
      }

      // Occasionally resolve an existing warning/info incident so the queue
      // moves in both directions, not just growing.
      if (rng() < RESOLVE_CHANCE) {
        const resolvable = next
          .map((inc, i) => ({ inc, i }))
          .filter(({ inc }) => !inc.resolved && (inc.severity === "warning" || inc.severity === "info"));
        if (resolvable.length > 0) {
          const { i } = pick(rng, resolvable);
          const resolvedAt = Date.now();
          next[i] = { ...next[i], resolved: true, resolvedAt };
          const idToRemove = next[i].id;
          const removalTimer = setTimeout(() => {
            removalTimeouts.current.delete(removalTimer);
            setIncidents((cur) => cur.filter((inc) => inc.id !== idToRemove));
          }, RESOLVED_LINGER_MS);
          removalTimeouts.current.add(removalTimer);
        }
      }

      // Cap the visible list: drop oldest resolved first, then oldest
      // unresolved, so growth never runs away during a long demo.
      if (next.length > MAX_VISIBLE) {
        next = next.slice().sort((a, b) => {
          if (a.resolved !== b.resolved) return a.resolved ? -1 : 1; // resolved first (to trim)
          return a.firstSeen - b.firstSeen; // oldest first within each group
        });
        next = next.slice(next.length - MAX_VISIBLE);
      }

      return next;
    });
  }, []);

  useEffect(() => {
    function scheduleNext() {
      const rng = rngRef.current;
      const delay = randInt(rng, MIN_EMIT_MS, MAX_EMIT_MS);
      timeoutRef.current = setTimeout(() => {
        if (!pausedRef.current) emitTick();
        scheduleNext();
      }, delay);
    }
    scheduleNext();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      removalTimeouts.current.forEach((t) => clearTimeout(t));
      removalTimeouts.current.clear();
    };
  }, [emitTick]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    setPausedState(true);
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
    setPausedState(false);
  }, []);

  const sorted = useMemo(
    () => incidents.slice().sort((a, b) => b.lastSeen - a.lastSeen),
    [incidents]
  );

  const openCount = useMemo(() => incidents.filter((i) => !i.resolved).length, [incidents]);

  return { incidents: sorted, openCount, paused, pause, resume, now };
}
