import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase env vars not set");
}

// Browser-safe client (anon key, respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-only admin client (service key, bypasses RLS)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;

export interface BuildLogEntry {
  agent: string;
  action: string;
  tier?: string;
  cost?: number;
  build_id?: string;
  client_name?: string;
  status?: string;
}

export async function logBuildEvent(entry: BuildLogEntry) {
  const { error } = await supabaseAdmin.from("behavioral_log").insert(entry);
  if (error) console.error("[supabase] log error:", error.message);
}

export async function getBuildLog(build_id: string) {
  const { data } = await supabase
    .from("behavioral_log")
    .select("*")
    .eq("build_id", build_id)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function uploadClientAsset(
  buildId: string,
  fileName: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  const path = `${buildId}/${fileName}`;
  const { error } = await supabaseAdmin.storage
    .from("client-assets")
    .upload(path, file, { contentType, upsert: true });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabaseAdmin.storage
    .from("client-assets")
    .getPublicUrl(path);
  return data.publicUrl;
}
