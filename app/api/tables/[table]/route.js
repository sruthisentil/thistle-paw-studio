import { NextResponse } from "next/server";
import { query, TABLES, newRowId } from "../../../../lib/db";
import { SCHEMAS } from "../../../../lib/data";

export const dynamic = "force-dynamic";

function maskedPlaceholder(key) {
  if (key.includes("date")) return `••/••/${2015 + Math.floor(Math.random() * 9)}`;
  if (key.includes("card")) return `•••• ${1000 + Math.floor(Math.random() * 9000)}`;
  if (key === "dea_number") return `••••••${1000 + Math.floor(Math.random() * 9000)}`;
  return "[REDACTED]";
}

function assertTable(table) {
  if (!TABLES[table]) {
    throw new Response(JSON.stringify({ error: `Unknown table "${table}"` }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function GET(_req, { params }) {
  const { table } = params;
  try {
    assertTable(table);
  } catch (res) {
    return res;
  }
  const { pk } = TABLES[table];
  const { rows } = await query(`SELECT * FROM ${table} ORDER BY ${pk} ASC`);
  return NextResponse.json({ rows });
}

export async function POST(req, { params }) {
  const { table } = params;
  try {
    assertTable(table);
  } catch (res) {
    return res;
  }
  const { pk } = TABLES[table];
  const schema = SCHEMAS[table];
  const body = await req.json();
  const values = body.values || {};

  const id = newRowId(table);
  const columns = [pk];
  const params_ = [id];

  for (const col of schema) {
    if (col.key === pk) continue;
    columns.push(col.key);
    params_.push(col.masked ? maskedPlaceholder(col.key) : values[col.key] ?? "");
  }

  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
  const { rows } = await query(
    `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders}) RETURNING *`,
    params_
  );
  return NextResponse.json({ row: rows[0] });
}

export async function PATCH(req, { params }) {
  const { table } = params;
  try {
    assertTable(table);
  } catch (res) {
    return res;
  }
  const { pk } = TABLES[table];
  const schema = SCHEMAS[table];
  const body = await req.json();
  const { id, values = {} } = body;

  const editable = schema.filter((c) => c.key !== pk && !c.masked && values[c.key] !== undefined);
  if (editable.length === 0) {
    return NextResponse.json({ error: "Nothing editable in that request" }, { status: 400 });
  }

  const sets = editable.map((c, i) => `${c.key} = $${i + 1}`).join(", ");
  const params_ = editable.map((c) => values[c.key]);
  params_.push(id);

  const { rows } = await query(
    `UPDATE ${table} SET ${sets} WHERE ${pk} = $${params_.length} RETURNING *`,
    params_
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: "Row not found" }, { status: 404 });
  }
  return NextResponse.json({ row: rows[0] });
}

export async function DELETE(req, { params }) {
  const { table } = params;
  try {
    assertTable(table);
  } catch (res) {
    return res;
  }
  const { pk } = TABLES[table];
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id query param required" }, { status: 400 });
  }
  await query(`DELETE FROM ${table} WHERE ${pk} = $1`, [id]);
  return NextResponse.json({ ok: true });
}
