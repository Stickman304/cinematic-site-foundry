import { NextRequest, NextResponse } from "next/server";
import { getClientRecord, uploadClientAssetFile, createAssetRecord, updateClientRecord } from "@/lib/supabase";
import type { AssetType, AssetApprovalStatus, AllowedUse } from "@/types/models";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = await getClientRecord(id);
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const assetType = (formData.get("assetType") as AssetType) ?? "other";
  const altText = (formData.get("altText") as string) ?? "";
  const containsPeople = formData.get("containsPeople") === "true";
  const containsMinor = formData.get("containsMinor") === "true";
  const notes = (formData.get("notes") as string) ?? "";
  const allowedUseRaw = formData.get("allowedUse") as string | null;
  const allowedUse = allowedUseRaw ? (JSON.parse(allowedUseRaw) as AllowedUse[]) : [];

  // Determine default approval status based on content flags
  let approvalStatus: AssetApprovalStatus = "pending";
  if (containsMinor) {
    approvalStatus = "restricted";
  } else if (containsPeople) {
    approvalStatus = "needs_permission";
  }

  let fileUrl: string;
  let storagePath: string | undefined;
  let fileName: string | undefined;

  if (file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = `${Date.now()}_${safeName}`;

    fileUrl = await uploadClientAssetFile(
      client.slug,
      assetType,
      uniqueName,
      buffer,
      file.type
    );
    storagePath = `${client.slug}/${assetType}/${uniqueName}`;
    fileName = file.name;
  } else {
    const urlParam = formData.get("fileUrl") as string | null;
    if (!urlParam) {
      return NextResponse.json({ error: "file or fileUrl required" }, { status: 400 });
    }
    fileUrl = urlParam;
  }

  const asset = await createAssetRecord({
    clientId: client.id,
    assetType,
    assetSource: file ? "upload" : "url",
    fileName,
    fileUrl,
    storagePath,
    altText: altText || undefined,
    approvalStatus,
    allowedUse,
    containsPeople,
    containsMinor,
    notes: notes || undefined,
  });

  if (!asset) {
    return NextResponse.json({ error: "Failed to create asset record" }, { status: 500 });
  }

  // If this is a logo, promote to client.logo_url
  if (assetType === "logo" && approvalStatus !== "restricted") {
    await updateClientRecord(client.id, { logoUrl: fileUrl });
  }

  return NextResponse.json({ asset }, { status: 201 });
}
