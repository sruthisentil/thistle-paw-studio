// ---------------------------------------------------------------------------
// Table rows, application connection pools and incidents now come from a
// real local Postgres database (see db/schema.sql, db/seed.mjs, lib/db.js)
// via the API routes under app/api/. This file keeps only the metadata the
// UI needs synchronously: column layouts, nav lists and decorative metrics
// that aren't part of the "edit it for the demo" surface.
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
