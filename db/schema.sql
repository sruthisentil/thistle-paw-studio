-- Thistle & Paw — Database Studio
-- Schema for the real Postgres backend behind the demo tables.
-- Row shapes mirror lib/data.js SCHEMAS so the frontend needs no translation.

DROP TABLE IF EXISTS prescriptions, pets, customers, payments, support_tickets, apps, incidents;

CREATE TABLE prescriptions (
  rx_id           TEXT PRIMARY KEY,
  pet             TEXT NOT NULL,
  medication      TEXT NOT NULL,
  dosage          TEXT NOT NULL,
  prescribing_vet TEXT NOT NULL,
  dea_number      TEXT NOT NULL,
  refills_left    INT NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE pets (
  pet_id        TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  species       TEXT NOT NULL,
  breed         TEXT NOT NULL,
  weight_kg     NUMERIC NOT NULL,
  owner         TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE customers (
  customer_id   TEXT PRIMARY KEY,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  home_address  TEXT NOT NULL,
  government_id TEXT NOT NULL,
  autoship      TEXT NOT NULL DEFAULT 'no',
  status        TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE payments (
  payment_id   TEXT PRIMARY KEY,
  order_id     TEXT NOT NULL,
  amount       TEXT NOT NULL,
  card_number  TEXT NOT NULL,
  bank_account TEXT NOT NULL,
  processor    TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'captured'
);

CREATE TABLE support_tickets (
  ticket_id TEXT PRIMARY KEY,
  customer  TEXT NOT NULL,
  subject   TEXT NOT NULL,
  body      TEXT NOT NULL,
  opened    TEXT NOT NULL,
  status    TEXT NOT NULL DEFAULT 'open'
);

-- Applications connected to the database. `pool` is the editable control
-- the agent (and a human) adjusts to fix connection-saturation incidents.
CREATE TABLE apps (
  id      TEXT PRIMARY KEY,
  name    TEXT NOT NULL,
  workers INT NOT NULL,
  pool    INT NOT NULL,
  budget  INT NOT NULL,
  role    TEXT NOT NULL,
  note    TEXT NOT NULL
);

CREATE TABLE incidents (
  id        TEXT PRIMARY KEY,
  code      TEXT NOT NULL,
  title     TEXT NOT NULL,
  resource  TEXT NOT NULL,
  severity  TEXT NOT NULL,
  seen      TEXT NOT NULL,
  count     INT,
  live      BOOLEAN NOT NULL DEFAULT false,
  symptom   TEXT NOT NULL,
  history   INT[] NOT NULL DEFAULT '{}'
);
