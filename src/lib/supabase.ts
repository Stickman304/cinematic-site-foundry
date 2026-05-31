import { createClient } from "@supabase/supabase-js";
import type {
  AuditObject, Direction, QAScorecard, SalesPackage, ExecutorResult,
  WorkflowState, BuildRecord, Client, ClientAsset, ClientIntakeNote,
  ClientWithAssets, AssetType, AssetSource, AssetApprovalStatus, AllowedUse,
} from "@/types/models";

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabaseAdmin: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabase(): any {
  if (!_supabase) _supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey());
  return _supabase;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabaseAdmin(): any {
  if (!_supabaseAdmin) {
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    _supabaseAdmin = serviceKey
      ? createClient(getSupabaseUrl(), serviceKey)
      : getSupabase();
  }
  return _supabaseAdmin;
}

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
  const { error } = await getSupabaseAdmin().from("behavioral_log").insert(entry);
  if (error) console.error("[supabase] log error:", error.message);
}

export async function getBuildLog(build_id: string) {
  const { data } = await getSupabase()
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
  clientId?: string;
  clientSlug?: string;
  clientAssets?: ClientAsset[];
  brandNotes?: string;
  intakeSnapshot?: Partial<Client>;
}) {
  const { error } = await getSupabaseAdmin().from("builds").insert({
    build_id: params.buildId,
    url: params.url,
    client_name: params.clientName,
    tier: params.tier,
    notes: params.notes,
    photo_urls: params.photoUrls ?? [],
    client_id: params.clientId ?? null,
    client_slug: params.clientSlug ?? null,
    client_assets: params.clientAssets ?? [],
    brand_notes: params.brandNotes ?? null,
    intake_snapshot: params.intakeSnapshot ?? null,
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

  const { error } = await getSupabaseAdmin()
    .from("builds")
    .update(update)
    .eq("build_id", buildId);
  if (error) console.error("[supabase] updateBuildState error:", error.message);
}

export async function getBuildRecord(buildId: string): Promise<BuildRecord | null> {
  const { data, error } = await getSupabase()
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
    clientId: data.client_id ?? undefined,
    clientSlug: data.client_slug ?? undefined,
    clientAssets: data.client_assets ?? undefined,
    brandNotes: data.brand_notes ?? undefined,
    intakeSnapshot: data.intake_snapshot ?? undefined,
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

// ── clients table ────────────────────────────────────────────────────────────

function rowToClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    businessType: (row.business_type as string) ?? undefined,
    websiteUrl: (row.website_url as string) ?? undefined,
    brandNotes: (row.brand_notes as string) ?? undefined,
    primaryColor: (row.primary_color as string) ?? undefined,
    secondaryColor: (row.secondary_color as string) ?? undefined,
    fontPreference: (row.font_preference as string) ?? undefined,
    logoUrl: (row.logo_url as string) ?? undefined,
    contactName: (row.contact_name as string) ?? undefined,
    contactEmail: (row.contact_email as string) ?? undefined,
    contactPhone: (row.contact_phone as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    active: (row.active as boolean) ?? true,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToAsset(row: Record<string, unknown>): ClientAsset {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    buildId: (row.build_id as string) ?? undefined,
    assetType: (row.asset_type as AssetType) ?? "other",
    assetSource: (row.asset_source as AssetSource) ?? "upload",
    fileName: (row.file_name as string) ?? undefined,
    fileUrl: row.file_url as string,
    storagePath: (row.storage_path as string) ?? undefined,
    altText: (row.alt_text as string) ?? undefined,
    approvalStatus: (row.approval_status as AssetApprovalStatus) ?? "pending",
    allowedUse: (row.allowed_use as AllowedUse[]) ?? [],
    containsPeople: (row.contains_people as boolean) ?? false,
    containsMinor: (row.contains_minor as boolean) ?? false,
    notes: (row.notes as string) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToNote(row: Record<string, unknown>): ClientIntakeNote {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    note: row.note as string,
    author: (row.author as string) ?? "operator",
    createdAt: row.created_at as string,
  };
}

export async function createClientRecord(params: {
  slug: string;
  name: string;
  businessType?: string;
  websiteUrl?: string;
  brandNotes?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontPreference?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
}): Promise<Client | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("clients")
    .insert({
      slug: params.slug,
      name: params.name,
      business_type: params.businessType ?? null,
      website_url: params.websiteUrl ?? null,
      brand_notes: params.brandNotes ?? null,
      primary_color: params.primaryColor ?? null,
      secondary_color: params.secondaryColor ?? null,
      font_preference: params.fontPreference ?? null,
      contact_name: params.contactName ?? null,
      contact_email: params.contactEmail ?? null,
      contact_phone: params.contactPhone ?? null,
      notes: params.notes ?? null,
      active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("[supabase] createClientRecord error:", error.message);
    return null;
  }
  return rowToClient(data as Record<string, unknown>);
}

export async function updateClientRecord(
  clientId: string,
  patch: Partial<Omit<Client, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.slug !== undefined) update.slug = patch.slug;
  if (patch.businessType !== undefined) update.business_type = patch.businessType;
  if (patch.websiteUrl !== undefined) update.website_url = patch.websiteUrl;
  if (patch.brandNotes !== undefined) update.brand_notes = patch.brandNotes;
  if (patch.primaryColor !== undefined) update.primary_color = patch.primaryColor;
  if (patch.secondaryColor !== undefined) update.secondary_color = patch.secondaryColor;
  if (patch.fontPreference !== undefined) update.font_preference = patch.fontPreference;
  if (patch.logoUrl !== undefined) update.logo_url = patch.logoUrl;
  if (patch.contactName !== undefined) update.contact_name = patch.contactName;
  if (patch.contactEmail !== undefined) update.contact_email = patch.contactEmail;
  if (patch.contactPhone !== undefined) update.contact_phone = patch.contactPhone;
  if (patch.notes !== undefined) update.notes = patch.notes;
  if (patch.active !== undefined) update.active = patch.active;

  const { error } = await getSupabaseAdmin()
    .from("clients")
    .update(update)
    .eq("id", clientId);
  if (error) console.error("[supabase] updateClientRecord error:", error.message);
}

export async function getClientRecord(clientId: string): Promise<ClientWithAssets | null> {
  const [clientRes, assetsRes, notesRes] = await Promise.all([
    getSupabase().from("clients").select("*").eq("id", clientId).single(),
    getSupabase().from("client_assets").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
    getSupabase().from("client_intake_notes").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
  ]);

  if (clientRes.error || !clientRes.data) return null;

  return {
    ...rowToClient(clientRes.data as Record<string, unknown>),
    assets: (assetsRes.data ?? []).map((r: Record<string, unknown>) => rowToAsset(r)),
    intakeNotes: (notesRes.data ?? []).map((r: Record<string, unknown>) => rowToNote(r)),
  };
}

export async function getClientBySlug(slug: string): Promise<Client | null> {
  const { data, error } = await getSupabase()
    .from("clients")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error || !data) return null;
  return rowToClient(data as Record<string, unknown>);
}

export async function listClientRecords(): Promise<Client[]> {
  const { data, error } = await getSupabase()
    .from("clients")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[supabase] listClientRecords error:", error.message);
    return [];
  }
  return (data ?? []).map((r: Record<string, unknown>) => rowToClient(r));
}

// ── client_assets table ──────────────────────────────────────────────────────

export async function getClientAssets(clientId: string): Promise<ClientAsset[]> {
  const { data, error } = await getSupabase()
    .from("client_assets")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[supabase] getClientAssets error:", error.message);
    return [];
  }
  return (data ?? []).map((r: Record<string, unknown>) => rowToAsset(r));
}

export async function createAssetRecord(params: {
  clientId: string;
  buildId?: string;
  assetType: AssetType;
  assetSource: AssetSource;
  fileName?: string;
  fileUrl: string;
  storagePath?: string;
  altText?: string;
  approvalStatus: AssetApprovalStatus;
  allowedUse?: AllowedUse[];
  containsPeople?: boolean;
  containsMinor?: boolean;
  notes?: string;
}): Promise<ClientAsset | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("client_assets")
    .insert({
      client_id: params.clientId,
      build_id: params.buildId ?? null,
      asset_type: params.assetType,
      asset_source: params.assetSource,
      file_name: params.fileName ?? null,
      file_url: params.fileUrl,
      storage_path: params.storagePath ?? null,
      alt_text: params.altText ?? null,
      approval_status: params.approvalStatus,
      allowed_use: params.allowedUse ?? [],
      contains_people: params.containsPeople ?? false,
      contains_minor: params.containsMinor ?? false,
      notes: params.notes ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("[supabase] createAssetRecord error:", error.message);
    return null;
  }
  return rowToAsset(data as Record<string, unknown>);
}

export async function updateAssetRecord(
  assetId: string,
  patch: {
    approvalStatus?: AssetApprovalStatus;
    allowedUse?: AllowedUse[];
    altText?: string;
    notes?: string;
    containsPeople?: boolean;
    containsMinor?: boolean;
    assetType?: AssetType;
    buildId?: string;
  }
): Promise<void> {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.approvalStatus !== undefined) update.approval_status = patch.approvalStatus;
  if (patch.allowedUse !== undefined) update.allowed_use = patch.allowedUse;
  if (patch.altText !== undefined) update.alt_text = patch.altText;
  if (patch.notes !== undefined) update.notes = patch.notes;
  if (patch.containsPeople !== undefined) update.contains_people = patch.containsPeople;
  if (patch.containsMinor !== undefined) update.contains_minor = patch.containsMinor;
  if (patch.assetType !== undefined) update.asset_type = patch.assetType;
  if (patch.buildId !== undefined) update.build_id = patch.buildId;

  const { error } = await getSupabaseAdmin()
    .from("client_assets")
    .update(update)
    .eq("id", assetId);
  if (error) console.error("[supabase] updateAssetRecord error:", error.message);
}

export async function deleteAssetRecord(assetId: string): Promise<{ storagePath?: string }> {
  const { data } = await getSupabaseAdmin()
    .from("client_assets")
    .select("storage_path")
    .eq("id", assetId)
    .single();

  const storagePath = (data as Record<string, unknown> | null)?.storage_path as string | undefined;

  const { error } = await getSupabaseAdmin()
    .from("client_assets")
    .delete()
    .eq("id", assetId);
  if (error) console.error("[supabase] deleteAssetRecord error:", error.message);

  return { storagePath };
}

// ── Storage ─────────────────────────────────────────────────────────────────

export async function uploadClientAssetFile(
  clientSlug: string,
  assetType: string,
  fileName: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  const path = `${clientSlug}/${assetType}/${fileName}`;
  const { error } = await getSupabaseAdmin().storage
    .from("client-assets")
    .upload(path, file, { contentType, upsert: true });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = getSupabaseAdmin().storage
    .from("client-assets")
    .getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteStorageFile(storagePath: string): Promise<void> {
  const { error } = await getSupabaseAdmin().storage
    .from("client-assets")
    .remove([storagePath]);
  if (error) console.error("[supabase] deleteStorageFile error:", error.message);
}

// ── client_intake_notes ──────────────────────────────────────────────────────

export async function addIntakeNote(params: {
  clientId: string;
  note: string;
  author?: string;
}): Promise<ClientIntakeNote | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("client_intake_notes")
    .insert({
      client_id: params.clientId,
      note: params.note,
      author: params.author ?? "operator",
    })
    .select()
    .single();

  if (error) {
    console.error("[supabase] addIntakeNote error:", error.message);
    return null;
  }
  return rowToNote(data as Record<string, unknown>);
}

// Legacy build-based upload (kept for backward compat)
export async function uploadClientAsset(
  buildId: string,
  fileName: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  const path = `builds/${buildId}/${fileName}`;
  const { error } = await getSupabaseAdmin().storage
    .from("client-assets")
    .upload(path, file, { contentType, upsert: true });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = getSupabaseAdmin().storage
    .from("client-assets")
    .getPublicUrl(path);
  return data.publicUrl;
}
