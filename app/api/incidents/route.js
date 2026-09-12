import { NextResponse } from "next/server";
import { query } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await query("SELECT * FROM incidents ORDER BY id DESC");
  return NextResponse.json({ incidents: rows });
}
