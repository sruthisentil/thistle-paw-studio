import pg from "pg";
import { CREATE_TABLES_SQL, SEED } from "./seedData";

const DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/thistle_paw";

// One pool per server process. In dev, Next.js can re-evaluate this module
// on hot reload, so stash the pool (and the readiness check below) on
// `global` to avoid leaking connections or re-seeding on every reload.
const globalForPg = globalThis;

export const pool =
  globalForPg.__thistlePawPool || new pg.Pool({ connectionString: DATABASE_URL, max: 5 });

if (process.env.NODE_ENV !== "production") {
  globalForPg.__thistlePawPool = pool;
}

// Arbitrary fixed advisory lock id, just to serialize the bootstrap below
// across concurrent cold starts (multiple serverless instances, or Next's
// own build-time module workers) so they don't race each other inserting
// the same seed rows.
const SEED_LOCK_KEY = 892374651;

// Self-heal: a fresh database (never had `npm run db:setup` run against it,
// or one that's reachable but was created empty by a hosting provider)
// gets the demo schema and starting data on first request instead of the
// app silently showing empty tables. Existing rows are never touched — this
// only inserts into a table it finds at zero rows, and only runs lazily
// from an actual query, never as an import-time side effect (which would
// otherwise fire during `next build`'s static analysis of the route files).
async function ensureSeeded() {
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [SEED_LOCK_KEY]);
    await client.query(CREATE_TABLES_SQL);
    for (const [table, { columns, rows }] of Object.entries(SEED)) {
      const { rows: countRows } = await client.query(`SELECT count(*) FROM ${table}`);
      if (Number(countRows[0].count) > 0) continue;
      const pkColumn = columns[0];
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
      for (const row of rows) {
        await client.query(
          `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})
           ON CONFLICT (${pkColumn}) DO NOTHING`,
          row
        );
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [SEED_LOCK_KEY]);
    client.release();
  }
}

let readyPromise = globalForPg.__thistlePawReady || null;

function getReady() {
  if (!readyPromise) {
    readyPromise = ensureSeeded();
    if (process.env.NODE_ENV !== "production") {
      globalForPg.__thistlePawReady = readyPromise;
    }
  }
  return readyPromise;
}

export async function query(text, params) {
  await getReady();
  return pool.query(text, params);
}

export const TABLES = {
  prescriptions: { pk: "rx_id", prefix: "RX" },
  pets: { pk: "pet_id", prefix: "PET" },
  customers: { pk: "customer_id", prefix: "CUS" },
  payments: { pk: "payment_id", prefix: "PAY" },
  support_tickets: { pk: "ticket_id", prefix: "SUP" },
};

export function newRowId(table) {
  const { prefix } = TABLES[table];
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}
