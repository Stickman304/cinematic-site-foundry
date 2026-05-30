import { NextRequest, NextResponse } from "next/server";
import { updateAssetRecord, deleteAssetRecord, deleteStorageFile } from "@/lib/supabase";
import type { AssetApprovalStatus, AllowedUse, AssetType } from "@/types/models";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;
  const body = await req.json() as {
    approvalStatus?: AssetApprovalStatus;
    allowedUse?: AllowedUse[];
    altText?: string;
    notes?: string;
    containsPeople?: boolean;
    containsMinor?: boolean;
    assetType?: AssetType;
    buildId?: string;
  };

  // Enforce: if minor flag is set, status must be restricted
  if (body.containsMinor === true) {
    body.approvalStatus = "restricted";
  }

  await updateAssetRecord(assetId, body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;
  const { storagePath } = await deleteAssetRecord(assetId);

  if (storagePath) {
    await deleteStorageFile(storagePath).catch(e =>
      console.error("[asset delete] storage cleanup failed:", e)
    );
  }

  return NextResponse.json({ ok: true });
}
