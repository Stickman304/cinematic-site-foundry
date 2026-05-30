import { createClient } from "@supabase/supabase-js";
import type { AuditObject, Direction, QAScorecard, SalesPackage, ExecutorResult, WorkflowState, BuildRecord } from "@/types/models";

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

// ── behavioral_log ──────────────────────────────────────────────────────────

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

// ── builds table ────────────────────────────────────────────────────────────

export async function createBuildRecord(params: {
  buildId: string;
  url: string;
  clientName?: string;
  tier?: string;
  notes?: string;
  photoUrls?: string[];
}) {
  const { error } = await supabaseAdmin.from("builds").insert({
    build_id: params.buildId,
    url: params.url,
    client_name: params.clientName,
    tier: params.tier,
    notes: params.notes,
    photo_urls: params.photoUrls ?? [],
    workflow_state: "URL_RECEIVED",
    total_cost: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) console.error("[supabase] createBuildRecord error:", error.message);
}

export async function updateBuildState(buildId: string, patch: {
  workflowState?: WorkflowState;
  auditObject?: AuditObject;
  directionA?: Direction;
  directionB?: Direction;
  approvedDirection?: "A" | "B";
  lockedBuildSpec?: string;
  executorType?: string;
  executorResult?: ExecutorResult;
  qaScorecard?: QAScorecard;
  salesPackage?: SalesPackage;
  totalCost?: number;
  errorMessage?: string;
}) {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.workflowState !== undefined) update.workflow_state = patch.workflowState;
  if (patch.auditObject !== undefined) update.audit_object = patch.auditObject;
  if (patch.directionA !== undefined) update.direction_a = patch.directionA;
  if (patch.directionB !== undefined) update.direction_b = patch.directionB;
  if (patch.approvedDirection !== undefined) update.approved_direction = patch.approvedDirection;
  if (patch.lockedBuildSpec !== undefined) update.locked_build_spec = patch.lockedBuildSpec;
  if (patch.executorType !== undefined) update.executor_type = patch.executorType;
  if (patch.executorResult !== undefined) update.executor_result = patch.executorResult;
  if (patch.qaScorecard !== undefined) update.qa_scorecard = patch.qaScorecard;
  if (patch.salesPackage !== undefined) update.sales_package = patch.salesPackage;
  if (patch.totalCost !== undefined) update.total_cost = patch.totalCost;
  if (patch.errorMessage !== undefined) update.error_message = patch.errorMessage;

  const { error } = await supabaseAdmin
    .from("builds")
    .update(update)
    .eq("build_id", buildId);
  if (error) console.error("[supabase] updateBuildState error:", error.message);
}

export async function getBuildRecord(buildId: string): Promise<BuildRecord | null> {
  const { data, error } = await supabase
    .from("builds")
    .select("*")
    .eq("build_id", buildId)
    .single();
  if (error || !data) return null;

  return {
    buildId: data.build_id,
    url: data.url,
    clientName: data.client_name,
    tier: data.tier,
    notes: data.notes,
    photoUrls: data.photo_urls ?? [],
    workflowState: data.workflow_state,
    auditObject: data.audit_object,
    directionA: data.direction_a,
    directionB: data.direction_b,
    approvedDirection: data.approved_direction,
    lockedBuildSpec: data.locked_build_spec,
    executorType: data.executor_type,
    executorResult: data.executor_result,
    qaScorecard: data.qa_scorecard,
    salesPackage: data.sales_package,
    totalCost: data.total_cost ?? 0,
    errorMessage: data.error_message,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// ── Storage ─────────────────────────────────────────────────────────────────

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
