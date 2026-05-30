import { NextRequest, NextResponse } from "next/server";
import { getClientRecord, updateClientRecord } from "@/lib/supabase";
import type { Client } from "@/types/models";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = await getClientRecord(id);
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }
  return NextResponse.json({ client });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json() as Partial<Omit<Client, "id" | "createdAt" | "updatedAt">>;
  await updateClientRecord(id, body);
  const updated = await getClientRecord(id);
  if (!updated) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }
  return NextResponse.json({ client: updated });
}
