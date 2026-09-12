// ---------------------------------------------------------------------------
// This is the demo's seed content: the connection-saturation incident the
// whole app exists to show, plus the table rows it's staged against. The
// live app reads this same data from a real local Postgres database (see
// lib/seedData.js, db/seed.mjs, lib/db.js) so edits made during a demo
// persist — but it's seeded from exactly these values, so this file is the
// fixture of record and must never go back to holding empty tables or a
// healthy-looking connection count. The incident is the point of the demo,
// not a bug to quietly fix.
// ---------------------------------------------------------------------------

export const ORG = {
  company: "Thistle & Paw",
  project: "Pharmacy Platform",
  env: "production",
};

export const TABLES = [
  { name: "prescriptions", records: 8412, sensitive: true },
  { name: "pets", records: 5108, sensitive: false },
  { name: "customers", records: 4390, sensitive: true },
  { name: "vets", records: 312, sensitive: true },
  { name: "orders", records: 61204, sensitive: false },
  { name: "shipments", records: 59871, sensitive: false },
  { name: "payments", records: 60933, sensitive: true },
  { name: "support_tickets", records: 2244, sensitive: true },
  { name: "inventory", records: 486, sensitive: false },
  { name: "audit_logs", records: 184092, sensitive: false },
];

// Columns flagged `masked` render redacted and show a lock in the header.
export const SCHEMAS = {
  prescriptions: [
    { key: "rx_id", label: "rx_id", w: "w-28" },
    { key: "pet", label: "pet", w: "w-44" },
    { key: "medication", label: "medication", w: "w-44" },
    { key: "dosage", label: "dosage", w: "w-28" },
    { key: "prescribing_vet", label: "prescribing_vet", w: "w-40" },
    { key: "dea_number", label: "dea_number", masked: true, w: "w-32" },
    { key: "refills_left", label: "refills", w: "w-20" },
    { key: "status", label: "status", pill: true, w: "w-36" },
  ],
  pets: [
    { key: "pet_id", label: "pet_id", w: "w-28" },
    { key: "name", label: "name", w: "w-32" },
    { key: "species", label: "species", w: "w-24" },
    { key: "breed", label: "breed", w: "w-40" },
    { key: "weight_kg", label: "weight_kg", w: "w-24" },
    { key: "owner", label: "owner", w: "w-40" },
    { key: "date_of_birth", label: "date_of_birth", masked: true, w: "w-32" },
    { key: "status", label: "status", pill: true, w: "w-28" },
  ],
  customers: [
    { key: "customer_id", label: "customer_id", w: "w-32" },
    { key: "full_name", label: "full_name", w: "w-40" },
    { key: "email", label: "email", w: "w-56" },
    { key: "home_address", label: "home_address", masked: true, w: "w-44" },
    { key: "government_id", label: "government_id", masked: true, w: "w-36" },
    { key: "autoship", label: "autoship", w: "w-24" },
    { key: "status", label: "status", pill: true, w: "w-28" },
  ],
  payments: [
    { key: "payment_id", label: "payment_id", w: "w-32" },
    { key: "order_id", label: "order_id", w: "w-28" },
    { key: "amount", label: "amount", w: "w-24" },
    { key: "card_number", label: "card_number", masked: true, w: "w-32" },
    { key: "bank_account", label: "bank_account", masked: true, w: "w-36" },
    { key: "processor", label: "processor", w: "w-28" },
    { key: "status", label: "status", pill: true, w: "w-28" },
  ],
  support_tickets: [
    { key: "ticket_id", label: "ticket_id", w: "w-28" },
    { key: "customer", label: "customer", w: "w-36" },
    { key: "subject", label: "subject", w: "w-64" },
    { key: "body", label: "body", masked: true, w: "w-64" },
    { key: "opened", label: "opened", w: "w-32" },
    { key: "status", label: "status", pill: true, w: "w-28" },
  ],
};

export const ROWS = {
  prescriptions: [
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
  ],
  pets: [
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
  ],
  customers: [
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
  ],
  payments: [
    ["PAY-77120", "ORD-31884", "$64.20", "•••• 4242", "[REDACTED]", "stripe", "captured"],
    ["PAY-77121", "ORD-31885", "$128.00", "•••• 1881", "[REDACTED]", "stripe", "captured"],
    ["PAY-77122", "ORD-31886", "$41.75", "•••• 9043", "[REDACTED]", "stripe", "failed"],
    ["PAY-77123", "ORD-31887", "$210.40", "•••• 4242", "[REDACTED]", "ach", "pending"],
    ["PAY-77124", "ORD-31888", "$88.10", "•••• 7755", "[REDACTED]", "stripe", "captured"],
    ["PAY-77125", "ORD-31889", "$33.99", "•••• 3120", "[REDACTED]", "stripe", "captured"],
    ["PAY-77126", "ORD-31890", "$155.00", "•••• 1881", "[REDACTED]", "ach", "captured"],
    ["PAY-77127", "ORD-31891", "$72.30", "•••• 6604", "[REDACTED]", "stripe", "failed"],
  ],
  support_tickets: [
    ["SUP-1043", "Maya Chen", "Pill form refused", "My beagle spits out the tablet ever…[TRUNCATED]", "2h ago", "open"],
    ["SUP-1044", "Casey Patel", "Autoship arrived early", "Got the refill nine days before I ex…[TRUNCATED]", "5h ago", "open"],
    ["SUP-1045", "Jordan Lee", "Wrong dosage on label", "Label says 5mg, the vet wrote 2.5m…[TRUNCATED]", "6h ago", "escalated"],
    ["SUP-1046", "Riley Scott", "Cold pack melted", "The insulin shipment arrived warm a…[TRUNCATED]", "1d ago", "open"],
    ["SUP-1047", "Morgan Diaz", "Cancel autoship", "Juniper finished her course, please…[TRUNCATED]", "1d ago", "resolved"],
    ["SUP-1048", "Avery Nguyen", "Vet approval stuck", "It's been four days pending review …[TRUNCATED]", "2d ago", "open"],
  ],
};

// One live incident (the connection-saturation banner) plus the backlog —
// an ops engineer with a queue and no time is the premise of the demo.
export const INCIDENTS = [
  {
    id: "INC-2041",
    code: "53300",
    title: "Connection capacity reached",
    resource: "storefront-api",
    severity: "critical",
    seen: "2 min ago",
    count: null,
    live: true,
    symptom: "FATAL: remaining connection slots are reserved for non-replication superuser connections",
  },
  {
    id: "INC-2038",
    code: "42501",
    title: "Row-level security blocking inserts",
    resource: "prescriptions",
    severity: "critical",
    seen: "18 min ago",
    count: 47,
    symptom: 'new row violates row-level security policy for table "prescriptions"',
  },
  {
    id: "INC-2036",
    code: "23505",
    title: "Duplicate key on bulk import",
    resource: "pets",
    severity: "warning",
    seen: "1 hour ago",
    count: 12,
    symptom: 'duplicate key value violates unique constraint "pets_pkey"',
  },
  {
    id: "INC-2034",
    code: "22021",
    title: "Invalid byte sequence in clinic CSV",
    resource: "vet_imports",
    severity: "warning",
    seen: "3 hours ago",
    count: 4,
    symptom: 'invalid byte sequence for encoding "UTF8": 0x00',
  },
  {
    id: "INC-2033",
    code: "57014",
    title: "Statement timeout on refill lookup",
    resource: "prescriptions",
    severity: "warning",
    seen: "4 hours ago",
    count: 8,
    symptom: "canceling statement due to statement timeout",
  },
  {
    id: "INC-2029",
    code: "23503",
    title: "Foreign key violation on prescription insert",
    resource: "prescriptions",
    severity: "info",
    seen: "yesterday",
    count: 3,
    symptom: 'insert violates foreign key constraint "prescriptions_vet_id_fkey"',
  },
];

// Applications connected to the database. `pool` is the editable control —
// storefront-api and checkout-worker both start over their budget on
// purpose (120 and 72 of a 100-connection cap) and resolve to different
// per-worker answers (floor(60/12)=5, floor(30/8)=3) so the demo proves the
// agent recomputes per application instead of reusing a value it saw
// elsewhere.
export const APPS = [
  {
    id: "storefront-api",
    name: "storefront-api",
    workers: 12,
    pool: 10,
    budget: 60,
    role: "app_storefront",
    note: "Customer-facing catalog and checkout",
  },
  {
    id: "checkout-worker",
    name: "checkout-worker",
    workers: 8,
    pool: 9,
    budget: 30,
    role: "app_checkout",
    note: "Autoship batch and payment capture",
  },
  {
    id: "rx-verifier",
    name: "rx-verifier",
    workers: 2,
    pool: 4,
    budget: 10,
    role: "app_rx",
    note: "Vet approval queue",
  },
];

export const MAX_CONNECTIONS = 100;

export const ACTIVITY = [
  { title: "Autoship batch processed", detail: "1,204 refills", when: "12 min ago", tone: "ok" },
  { title: "Clinic import completed", detail: "Ithaca Veterinary Group — 340 prescriptions", when: "1 hour ago", tone: "ok" },
  { title: "Controlled substance audit exported", detail: "DEA Schedule IV", when: "3 hours ago", tone: "ok" },
  { title: "Deployment completed", detail: "storefront-api v2.1 — workers 4 → 12", when: "14 min ago", tone: "warn" },
];

export const SPARK = {
  connections: [41, 44, 43, 47, 52, 58, 61, 70, 78, 86, 91, 94, 96, 97, 98],
  memory: [52, 54, 53, 55, 58, 57, 60, 62, 61, 64, 66, 65, 67, 68, 68],
  latency: [120, 118, 126, 131, 140, 168, 210, 302, 440, 610, 720, 780, 810, 828, 840],
};

export function statusTone(v) {
  const s = String(v).toLowerCase();
  if (["active", "captured", "resolved", "ok", "healthy"].includes(s)) return "ok";
  if (["pending", "pending_review", "open"].includes(s)) return "warn";
  if (["failed", "expired", "escalated"].includes(s)) return "bad";
  if (s === "controlled") return "ctrl";
  return "muted";
}
