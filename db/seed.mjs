// Creates (if needed) and seeds the local Postgres database behind the demo.
//
//   npm run db:setup
//
// Safe to re-run: it drops and recreates the demo tables each time, so it
// also doubles as a "reset to the start of the demo" script.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const { Client } = pg;

const DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/thistle_paw";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// prescriptions ---------------------------------------------------------
const PRESCRIPTIONS = [
  ["RX-40192", "Biscuit · Beagle", "Apoquel 16mg", "1 tab BID", "Dr. M. Okafor", "••••••1847", 2, "active"],
  ["RX-40193", "Noodle · Dachshund", "Gabapentin 100mg", "1 cap TID", "Dr. S. Reyes", "••••••2210", 0, "expired"],
  ["RX-40194", "Mochi · Ragdoll", "Methimazole 5mg", "1 tab BID", "Dr. M. Okafor", "••••••1847", 5, "active"],
  ["RX-40195", "Tater · Corgi", "Trazodone 50mg", "PRN", "Dr. A. Lindqvist", "••••••0934", 1, "pending_review"],
  ["RX-40196", "Pickle · Whippet", "Carprofen 75mg", "1 tab BID", "Dr. S. Reyes", "••••••2210", 3, "active"],
  ["RX-40197", "Juniper · Maine Coon", "Prednisolone 5mg", "0.5 tab QD", "Dr. N. Adeyemi", "••••••3391", 4, "active"],
  ["RX-40198", "Waffle · Frenchie", "Cerenia 24mg", "1 tab QD", "Dr. A. Lindqvist", "••••••0934", 0, "expired"],
  ["RX-40199", "Sprocket · Border Collie", "Phenobarbital 32mg", "1 tab BID", "Dr. M. Okafor", "••••••1847", 2, "controlled"],
  ["RX-40200", "Olive · Tabby", "Amlodipine 1.25mg", "1 tab QD", "Dr. N. Adeyemi", "••••••3391", 6, "active"],
  ["RX-40201", "Barnaby · Basset", "Thyro-Tabs 0.4mg", "1 tab BID", "Dr. S. Reyes", "••••••2210", 1, "pending_review"],
  ["RX-40202", "Fig · Cockapoo", "Apoquel 5.4mg", "1 tab BID", "Dr. A. Lindqvist", "••••••0934", 3, "active"],
  ["RX-40203", "Marlow · Greyhound", "Trazodone 100mg", "PRN", "Dr. M. Okafor", "••••••1847", 0, "controlled"],
  ["RX-40204", "Clementine · Ragamuffin", "Mirtazapine 2mg", "1 tab QOD", "Dr. N. Adeyemi", "••••••3391", 2, "active"],
  ["RX-40205", "Hopper · Jack Russell", "Galliprant 20mg", "1 tab QD", "Dr. S. Reyes", "••••••2210", 5, "active"],
  ["RX-40206", "Dumpling · Shih Tzu", "Ursodiol 100mg", "1 cap BID", "Dr. A. Lindqvist", "••••••0934", 1, "pending_review"],
];

const PETS = [
  ["PET-8801", "Biscuit", "dog", "Beagle", 11.4, "Maya Chen", "••/••/2019", "active"],
  ["PET-8802", "Noodle", "dog", "Dachshund", 6.2, "Alex Rivera", "••/••/2021", "active"],
  ["PET-8803", "Mochi", "cat", "Ragdoll", 5.8, "Jordan Lee", "••/••/2020", "active"],
  ["PET-8804", "Tater", "dog", "Pembroke Corgi", 13.1, "Casey Patel", "••/••/2018", "active"],
  ["PET-8805", "Pickle", "dog", "Whippet", 12.7, "Riley Scott", "••/••/2022", "active"],
  ["PET-8806", "Juniper", "cat", "Maine Coon", 8.9, "Morgan Diaz", "••/••/2017", "active"],
  ["PET-8807", "Waffle", "dog", "French Bulldog", 10.3, "Jamie Park", "••/••/2021", "inactive"],
  ["PET-8808", "Sprocket", "dog", "Border Collie", 18.6, "Avery Nguyen", "••/••/2016", "active"],
  ["PET-8809", "Olive", "cat", "Domestic Shorthair", 4.4, "Quinn Brooks", "••/••/2019", "active"],
  ["PET-8810", "Barnaby", "dog", "Basset Hound", 24.9, "Cameron Blake", "••/••/2015", "active"],
  ["PET-8811", "Fig", "dog", "Cockapoo", 9.1, "Drew Santos", "••/••/2022", "active"],
  ["PET-8812", "Marlow", "dog", "Greyhound", 30.2, "Parker Ellis", "••/••/2018", "active"],
];

const CUSTOMERS = [
  ["CUS-1041", "Maya Chen", "maya.chen@example.com", "Ithaca, NY •••••", "[REDACTED]", "yes", "active"],
  ["CUS-1042", "Alex Rivera", "alex.rivera@example.com", "Rochester, NY •••••", "[REDACTED]", "yes", "active"],
  ["CUS-1043", "Jordan Lee", "jordan.lee@example.com", "Binghamton, NY •••••", "[REDACTED]", "no", "pending"],
  ["CUS-1044", "Casey Patel", "casey.patel@example.com", "Syracuse, NY •••••", "[REDACTED]", "yes", "active"],
  ["CUS-1045", "Riley Scott", "riley.scott@example.com", "Buffalo, NY •••••", "[REDACTED]", "yes", "active"],
  ["CUS-1046", "Morgan Diaz", "morgan.diaz@example.com", "Albany, NY •••••", "[REDACTED]", "no", "active"],
  ["CUS-1047", "Jamie Park", "jamie.park@example.com", "Utica, NY •••••", "[REDACTED]", "yes", "active"],
  ["CUS-1048", "Avery Nguyen", "avery.nguyen@example.com", "Ithaca, NY •••••", "[REDACTED]", "yes", "active"],
  ["CUS-1049", "Quinn Brooks", "quinn.brooks@example.com", "Corning, NY •••••", "[REDACTED]", "no", "pending"],
  ["CUS-1050", "Cameron Blake", "cameron.blake@example.com", "Elmira, NY •••••", "[REDACTED]", "yes", "active"],
];

const PAYMENTS = [
  ["PAY-77120", "ORD-31884", "$64.20", "•••• 4242", "[REDACTED]", "stripe", "captured"],
  ["PAY-77121", "ORD-31885", "$128.00", "•••• 1881", "[REDACTED]", "stripe", "captured"],
  ["PAY-77122", "ORD-31886", "$41.75", "•••• 9043", "[REDACTED]", "stripe", "failed"],
  ["PAY-77123", "ORD-31887", "$210.40", "•••• 4242", "[REDACTED]", "ach", "pending"],
  ["PAY-77124", "ORD-31888", "$88.10", "•••• 7755", "[REDACTED]", "stripe", "captured"],
  ["PAY-77125", "ORD-31889", "$33.99", "•••• 3120", "[REDACTED]", "stripe", "captured"],
  ["PAY-77126", "ORD-31890", "$155.00", "•••• 1881", "[REDACTED]", "ach", "captured"],
  ["PAY-77127", "ORD-31891", "$72.30", "•••• 6604", "[REDACTED]", "stripe", "failed"],
];

const SUPPORT_TICKETS = [
  ["SUP-1043", "Maya Chen", "Pill form refused", "My beagle spits out the tablet ever…[TRUNCATED]", "2h ago", "open"],
  ["SUP-1044", "Casey Patel", "Autoship arrived early", "Got the refill nine days before I ex…[TRUNCATED]", "5h ago", "open"],
  ["SUP-1045", "Jordan Lee", "Wrong dosage on label", "Label says 5mg, the vet wrote 2.5m…[TRUNCATED]", "6h ago", "escalated"],
  ["SUP-1046", "Riley Scott", "Cold pack melted", "The insulin shipment arrived warm a…[TRUNCATED]", "1d ago", "open"],
  ["SUP-1047", "Morgan Diaz", "Cancel autoship", "Juniper finished her course, please…[TRUNCATED]", "1d ago", "resolved"],
  ["SUP-1048", "Avery Nguyen", "Vet approval stuck", "It's been four days pending review …[TRUNCATED]", "2d ago", "open"],
];

const APPS = [
  ["storefront-api", "storefront-api", 12, 10, 60, "app_storefront", "Customer-facing catalog and checkout"],
  ["checkout-worker", "checkout-worker", 8, 9, 30, "app_checkout", "Autoship batch and payment capture"],
  ["rx-verifier", "rx-verifier", 2, 4, 10, "app_rx", "Vet approval queue"],
];

// `history` is a short recent-occurrence series that drives the incident
// rail's per-row sparkline — the same "seen 47x, and here's the shape of
// that curve" pattern Sentry's issue list uses.
const INCIDENTS = [
  ["INC-2041", "53300", "Connection capacity reached", "storefront-api", "critical", "2 min ago", null, true,
    "FATAL: remaining connection slots are reserved for non-replication superuser connections",
    [58, 61, 67, 70, 74, 79, 83, 88, 93, 97, 101, 106, 112, 118, 121]],
  ["INC-2038", "42501", "Row-level security blocking inserts", "prescriptions", "critical", "18 min ago", 47, false,
    'new row violates row-level security policy for table "prescriptions"',
    [2, 3, 2, 4, 6, 5, 8, 11, 14, 19, 24, 30, 36, 41, 47]],
  ["INC-2036", "23505", "Duplicate key on bulk import", "pets", "warning", "1 hour ago", 12, false,
    'duplicate key value violates unique constraint "pets_pkey"',
    [0, 0, 1, 1, 2, 3, 3, 4, 5, 6, 7, 8, 9, 11, 12]],
  ["INC-2034", "22021", "Invalid byte sequence in clinic CSV", "vet_imports", "warning", "3 hours ago", 4, false,
    'invalid byte sequence for encoding "UTF8": 0x00',
    [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4]],
  ["INC-2033", "57014", "Statement timeout on refill lookup", "prescriptions", "warning", "4 hours ago", 8, false,
    "canceling statement due to statement timeout",
    [1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6, 7, 7, 8, 8]],
  ["INC-2029", "23503", "Foreign key violation on prescription insert", "prescriptions", "info", "yesterday", 3, false,
    'insert violates foreign key constraint "prescriptions_vet_id_fkey"',
    [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3]],
];

async function seed() {
  await ensureDatabaseExists();

  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const schema = readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await client.query(schema);

  for (const row of PRESCRIPTIONS) {
    await client.query(
      `INSERT INTO prescriptions (rx_id, pet, medication, dosage, prescribing_vet, dea_number, refills_left, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      row
    );
  }
  for (const row of PETS) {
    await client.query(
      `INSERT INTO pets (pet_id, name, species, breed, weight_kg, owner, date_of_birth, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      row
    );
  }
  for (const row of CUSTOMERS) {
    await client.query(
      `INSERT INTO customers (customer_id, full_name, email, home_address, government_id, autoship, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      row
    );
  }
  for (const row of PAYMENTS) {
    await client.query(
      `INSERT INTO payments (payment_id, order_id, amount, card_number, bank_account, processor, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      row
    );
  }
  for (const row of SUPPORT_TICKETS) {
    await client.query(
      `INSERT INTO support_tickets (ticket_id, customer, subject, body, opened, status)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      row
    );
  }
  for (const row of APPS) {
    await client.query(
      `INSERT INTO apps (id, name, workers, pool, budget, role, note)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      row
    );
  }
  for (const row of INCIDENTS) {
    await client.query(
      `INSERT INTO incidents (id, code, title, resource, severity, seen, count, live, symptom, history)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      row
    );
  }

  await client.end();
  console.log("Seeded thistle_paw database.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
