// Resets the local Postgres database behind the demo to its starting state.
//
//   npm run db:setup
//
// Table shapes and seed rows live in lib/seedData.js — the same module the
// app itself uses to self-heal an empty database on first request. This
// script is the explicit, destructive version: it always drops and
// recreates the demo tables, so it doubles as a "reset to the start of the
// demo" command even if rows have since been inserted/edited/deleted.

import pg from "pg";
import { CREATE_TABLES_SQL, SEED } from "../lib/seedData.js";

const { Client } = pg;

const DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/thistle_paw";

async function ensureDatabaseExists() {
  const url = new URL(DATABASE_URL);
  const dbName = url.pathname.replace(/^\//, "");
  const adminUrl = new URL(DATABASE_URL);
  adminUrl.pathname = "/postgres";

  const admin = new Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  const { rowCount } = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
  if (rowCount === 0) {
    const quoted = `"${dbName.replace(/"/g, '""')}"`;
    await admin.query(`CREATE DATABASE ${quoted}`);
    console.log(`Created database "${dbName}"`);
  }
  await admin.end();
}

async function seed() {
  await ensureDatabaseExists();

  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const tables = Object.keys(SEED);
  await client.query(`DROP TABLE IF EXISTS ${tables.join(", ")} CASCADE`);
  await client.query(CREATE_TABLES_SQL);

  for (const [table, { columns, rows }] of Object.entries(SEED)) {
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    for (const row of rows) {
      await client.query(
        `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`,
        row
      );
    }
  }

  await client.end();
  console.log("Seeded thistle_paw database.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
