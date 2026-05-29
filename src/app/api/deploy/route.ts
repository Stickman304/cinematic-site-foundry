import { NextRequest } from "next/server";
import { logBuildEvent } from "@/lib/supabase";
import { createSite, deploySite } from "@/lib/netlify";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const { buildId, clientSlug, clientName, tier, files } = await req.json();

  if (!buildId || !clientSlug) {
    return new Response(JSON.stringify({ error: "buildId and clientSlug required" }), { status: 400 });
  }

  try {
    await logBuildEvent({
      agent: "deployer",
      action: "deploy_start",
      tier,
      build_id: buildId,
      client_name: clientName,
      status: "deploying",
    });

    const site = await createSite(clientSlug);

    const liveUrl = files
      ? await deploySite(site.id, files)
      : site.url;

    await logBuildEvent({
      agent: "deployer",
      action: "deploy_complete",
      tier,
      build_id: buildId,
      client_name: clientName,
      status: "live",
    });

    return new Response(JSON.stringify({ liveUrl, siteId: site.id, siteName: site.name }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = (err as Error).message;
    await logBuildEvent({
      agent: "deployer",
      action: "deploy_error",
      tier,
      build_id: buildId,
      client_name: clientName,
      status: "error",
    });
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
