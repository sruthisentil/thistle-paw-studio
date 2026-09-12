import { NextResponse } from "next/server";
import { query } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await query("SELECT * FROM apps ORDER BY id ASC");
  return NextResponse.json({ apps: rows });
}
