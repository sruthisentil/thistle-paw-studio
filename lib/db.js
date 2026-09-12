import pg from "pg";

const DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/thistle_paw";

// One pool per server process. In dev, Next.js can re-evaluate this module
// on hot reload, so stash the pool on `global` to avoid leaking connections.
const globalForPg = globalThis;

export const pool =
  globalForPg.__thistlePawPool ||
  new pg.Pool({ connectionString: DATABASE_URL, max: 5 });

if (process.env.NODE_ENV !== "production") {
  globalForPg.__thistlePawPool = pool;
}

export function query(text, params) {
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
