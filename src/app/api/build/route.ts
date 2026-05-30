import { NextRequest, NextResponse } from "next/server";
import { getBuildRecord, updateBuildState, logBuildEvent } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const buildId = req.nextUrl.searchParams.get("buildId");
  if (!buildId) return NextResponse.json({ error: "buildId required" }, { status: 400 });

  const record = await getBuildRecord(buildId);
  if (!record) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({ build: record });
}

// Operator marks executor build as complete (supervised mode)
export async function POST(req: NextRequest) {
  const { buildId, previewUrl, filesChanged, errors } = await req.json();
  if (!buildId) return NextResponse.json({ error: "buildId required" }, { status: 400 });

  const build = await getBuildRecord(buildId);
  if (!build) return NextResponse.json({ error: "not found" }, { status: 404 });

  const executorResult = {
    status: (errors?.length ? "partial" : "complete") as "complete" | "partial" | "error",
    files: filesChanged ?? [],
    errors: errors ?? [],
    warnings: [],
    previewUrl,
    buildTimeMs: 0,
  };

  await updateBuildState(buildId, {
    executorResult,
    workflowState: "QA_IN_PROGRESS",
  });

  await logBuildEvent({
    agent: "operator",
    action: "build_marked_complete",
    build_id: buildId,
    status: "QA_IN_PROGRESS",
  });

  return NextResponse.json({ ok: true });
}

// Update sales package approval
export async function PATCH(req: NextRequest) {
  const { buildId, channel } = await req.json() as { buildId: string; channel: "email" | "sms" | "callScript" | "proposal" };
  if (!buildId || !channel) return NextResponse.json({ error: "buildId and channel required" }, { status: 400 });

  const build = await getBuildRecord(buildId);
  if (!build?.salesPackage) return NextResponse.json({ error: "no sales package" }, { status: 400 });

  const updated = {
    ...build.salesPackage,
    approved: { ...build.salesPackage.approved, [channel]: true },
  };

  await updateBuildState(buildId, { salesPackage: updated });

  await logBuildEvent({
    agent: "operator",
    action: `approved_${channel}`,
    build_id: buildId,
    status: "WAITING_FOR_SEND_APPROVAL",
  });

  return NextResponse.json({ ok: true });
}
