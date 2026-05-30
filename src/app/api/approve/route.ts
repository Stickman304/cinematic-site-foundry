import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { getBuildRecord, updateBuildState, logBuildEvent } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 300;

function calcCost(input: number, output: number) {
  return (input / 1_000_000) * 3 + (output / 1_000_000) * 15;
}

export async function POST(req: NextRequest) {
  const { buildId, direction } = await req.json() as { buildId: string; direction: "A" | "B" };

  if (!buildId || !direction) {
    return NextResponse.json({ error: "buildId and direction required" }, { status: 400 });
  }

  const build = await getBuildRecord(buildId);
  if (!build) {
    return NextResponse.json({ error: "Build not found" }, { status: 404 });
  }

  const chosen = direction === "A" ? build.directionA : build.directionB;
  if (!chosen) {
    return NextResponse.json({ error: "Direction not found in build record" }, { status: 400 });
  }

  // Lock the build spec
  await updateBuildState(buildId, {
    workflowState: "LOCKING_BUILD_SPEC",
    approvedDirection: direction,
    lockedBuildSpec: chosen.artifacts.buildSpec,
  });

  await logBuildEvent({
    agent: "mission-control",
    action: "LOCKING_BUILD_SPEC",
    tier: build.tier,
    build_id: buildId,
    client_name: build.clientName,
    status: "LOCKING_BUILD_SPEC",
  });

  // Determine executor type
  const executorType = process.env.EXECUTOR_TYPE ?? (process.env.OPENAI_API_KEY ? "codex" : "supervised");
  await updateBuildState(buildId, { executorType });

  // If Codex is configured, trigger the build
  if (executorType === "codex" && process.env.OPENAI_API_KEY) {
    await updateBuildState(buildId, { workflowState: "BUILDING_MOCKUP" });
    await logBuildEvent({
      agent: "executor",
      action: "BUILDING_MOCKUP",
      tier: build.tier,
      build_id: buildId,
      client_name: build.clientName,
      status: "BUILDING_MOCKUP",
    });

    // Run QA via Anthropic on the build spec
    await runQA(buildId, build, chosen.artifacts.buildSpec);

    return NextResponse.json({ ok: true, buildId, direction, executorType: "codex", workflowState: "QA_IN_PROGRESS" });
  }

  // Supervised executor — wait for operator to mark build complete
  await updateBuildState(buildId, { workflowState: "BUILDING_MOCKUP" });
  await logBuildEvent({
    agent: "executor",
    action: "BUILDING_MOCKUP",
    tier: build.tier,
    build_id: buildId,
    client_name: build.clientName,
    status: "BUILDING_MOCKUP",
  });

  return NextResponse.json({
    ok: true,
    buildId,
    direction,
    executorType: "supervised",
    workflowState: "BUILDING_MOCKUP",
    instructions: `Build spec locked. Send to executor:\n\n${chosen.artifacts.buildSpec.slice(0, 500)}...`,
  });
}

async function runQA(buildId: string, build: { tier?: string; clientName?: string; totalCost: number }, buildSpec: string) {
  await updateBuildState(buildId, { workflowState: "QA_IN_PROGRESS" });

  try {
    const qaMsg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: `You are the Mission Control QA scorer. Score the build spec against 10 quality dimensions. Return ONLY valid JSON.

Minimum scores: visualTaste=70, mobileExperience=80, ctaStrength=80, copyQuality=70, trustArchitecture=75, performanceRisk=70, brandPerception=70, motionQuality=70, seoFoundation=65, codeMaintainability=65.

Return this exact JSON shape:
{
  "dimensions": {
    "visualTaste": { "score": 0-100, "pass": true|false, "notes": "string" },
    "mobileExperience": { "score": 0-100, "pass": true|false, "notes": "string" },
    "ctaStrength": { "score": 0-100, "pass": true|false, "notes": "string" },
    "copyQuality": { "score": 0-100, "pass": true|false, "notes": "string" },
    "trustArchitecture": { "score": 0-100, "pass": true|false, "notes": "string" },
    "performanceRisk": { "score": 0-100, "pass": true|false, "notes": "string" },
    "brandPerception": { "score": 0-100, "pass": true|false, "notes": "string" },
    "motionQuality": { "score": 0-100, "pass": true|false, "notes": "string" },
    "seoFoundation": { "score": 0-100, "pass": true|false, "notes": "string" },
    "codeMaintainability": { "score": 0-100, "pass": true|false, "notes": "string" }
  },
  "finalScore": 0-100,
  "pass": true|false,
  "failingDimensions": ["string"],
  "recommendations": ["string"]
}`,
      messages: [{
        role: "user",
        content: `Score this build spec:\n\n${buildSpec}`,
      }],
    });

    const raw = qaMsg.content[0].type === "text" ? qaMsg.content[0].text : "{}";
    const qaScorecard = JSON.parse(raw);
    const qaCost = calcCost(qaMsg.usage.input_tokens, qaMsg.usage.output_tokens);

    await updateBuildState(buildId, {
      workflowState: "PREVIEW_READY",
      qaScorecard,
      totalCost: build.totalCost + qaCost,
    });

    await logBuildEvent({
      agent: "qa-scorer",
      action: "PREVIEW_READY",
      tier: build.tier,
      cost: qaCost,
      build_id: buildId,
      client_name: build.clientName,
      status: "PREVIEW_READY",
    });

    // Auto-generate sales package
    await generateSalesPackage(buildId, build, buildSpec, qaCost);
  } catch (err) {
    await updateBuildState(buildId, { workflowState: "ERROR", errorMessage: (err as Error).message });
  }
}

async function generateSalesPackage(buildId: string, build: { tier?: string; clientName?: string; totalCost: number }, buildSpec: string, prevCost: number) {
  try {
    const salesMsg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 3000,
      system: `You are the Mission Control sales agent. Generate a complete sales package. Return ONLY valid JSON.

{
  "pitchEmail": "string — full cold email under 200 words",
  "sms": "string — under 160 characters",
  "callScript": "string — opening, if-yes, close",
  "proposalSummary": "string — one page proposal",
  "beforeAfterFraming": "string — before/after comparison text",
  "approved": { "email": false, "sms": false, "callScript": false, "proposal": false }
}`,
      messages: [{
        role: "user",
        content: `Generate a sales package for this build:\n\n${buildSpec.slice(0, 3000)}`,
      }],
    });

    const raw = salesMsg.content[0].type === "text" ? salesMsg.content[0].text : "{}";
    const salesPackage = JSON.parse(raw);
    const salesCost = calcCost(salesMsg.usage.input_tokens, salesMsg.usage.output_tokens);

    await updateBuildState(buildId, {
      workflowState: "OUTREACH_DRAFTED",
      salesPackage,
      totalCost: build.totalCost + prevCost + salesCost,
    });

    await logBuildEvent({
      agent: "sales-agent",
      action: "OUTREACH_DRAFTED",
      tier: build.tier,
      cost: salesCost,
      build_id: buildId,
      client_name: build.clientName,
      status: "OUTREACH_DRAFTED",
    });
  } catch {
    // Sales package failure is non-critical — build still passes QA
  }
}
