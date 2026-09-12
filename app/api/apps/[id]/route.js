import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  const { id } = params;
  const { pool } = await req.json();
  const { rows } = await query(
    "UPDATE apps SET pool = $1 WHERE id = $2 RETURNING *",
    [pool, id]
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: "App not found" }, { status: 404 });
  }
  return NextResponse.json({ app: rows[0] });
}
