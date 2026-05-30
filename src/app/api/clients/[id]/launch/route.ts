import { NextRequest, NextResponse } from "next/server";
import { getClientRecord } from "@/lib/supabase";
import type { ClientAsset } from "@/types/models";

export const runtime = "nodejs";

// Returns the pre-populated launch params for this client.
// The UI calls /api/launch with these params as an SSE stream.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json() as { tier?: string; notes?: string };
  const client = await getClientRecord(id);
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Only pass approved + non-restricted assets to the build pipeline
  const buildableAssets: ClientAsset[] = client.assets.filter(
    a => a.approvalStatus === "approved" && !a.containsMinor
  );

  // Photo URLs: approved personal/product/location assets
  const photoUrls = buildableAssets
    .filter(a => ["personal", "product", "location"].includes(a.assetType))
    .map(a => a.fileUrl);

  return NextResponse.json({
    ok: true,
    launchParams: {
      url: client.websiteUrl ?? "",
      clientName: client.name,
      clientId: client.id,
      clientSlug: client.slug,
      brandNotes: client.brandNotes ?? "",
      clientAssets: buildableAssets,
      photoUrls,
      tier: body.tier ?? "auto",
      notes: body.notes ?? client.notes ?? "",
    },
  });
}
