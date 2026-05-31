import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const buildId = searchParams.get("buildId");
  const since = searchParams.get("since");

  let query = getSupabaseAdmin()
    .from("behavioral_log")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(100);

  if (buildId) query = query.eq("build_id", buildId);
  if (since) query = query.gt("created_at", since);

  const { data, error } = await query;
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ entries: data ?? [] }), {
    headers: { "Content-Type": "application/json" },
  });
}
