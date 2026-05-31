import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { getBuildRecord, updateBuildState, logBuildEvent } from "@/lib/supabase";
import { getExecutor, detectExecutorType } from "@/lib/mission-control/executors";
import type { ExecutorInput } from "@/lib/mission-control/executors";

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

  // Detect executor type from env
  const executorType = detectExecutorType();
  await updateBuildState(buildId, { executorType, workflowState: "READY_FOR_EXECUTOR" });

  await logBuildEvent({
    agent: "mission-control",
    action: "READY_FOR_EXECUTOR",
    tier: build.tier,
    build_id: buildId,
    client_name: build.clientName,
    status: "READY_FOR_EXECUTOR",
  });

  // Build executor input from locked artifacts
  const executorInput: ExecutorInput = {
    buildId,
    approvedDirection: direction,
    tier: build.tier ?? "tier2",
    clientName: build.clientName,
    photoUrls: build.photoUrls,
    artifacts: {
      buildSpec: chosen.artifacts.buildSpec,
      designSystem: chosen.artifacts.designSystem,
      creativeDirection: chosen.artifacts.creativeDirection,
      antiSlopRules: chosen.artifacts.antiSlopRules,
      copyBrief: chosen.artifacts.copyBrief,
      motionPlan: chosen.artifacts.motionPlan,
    },
  };

  // Transition to executor running state
  await updateBuildState(buildId, { workflowState: "EXECUTOR_RUNNING" });
  await logBuildEvent({
    agent: "executor",
    action: "EXECUTOR_RUNNING",
    tier: build.tier,
    build_id: buildId,
    client_name: build.clientName,
    status: "EXECUTOR_RUNNING",
  });

  // For UI compat: also mark BUILDING_MOCKUP (high-level label for activity panel)
  await updateBuildState(buildId, { workflowState: "BUILDING_MOCKUP" });

  // Run executor via adapter
  const executor = getExecutor(executorType);
  const result = await executor.run(executorInput);

  if (result.status === "EXECUTOR_FAILED") {
    await updateBuildState(buildId, {
      workflowState: "EXECUTOR_FAILED",
      errorMessage: result.errors[0] ?? "Executor failed",
    });
    await logBuildEvent({
      agent: "executor",
      action: "EXECUTOR_FAILED",
      tier: build.tier,
      build_id: buildId,
      client_name: build.clientName,
      status: "EXECUTOR_FAILED",
    });
    return NextResponse.json({
      ok: false,
      buildId,
      direction,
      executorType,
      workflowState: "EXECUTOR_FAILED",
      error: result.errors[0],
    });
  }

  // Supervised — waiting for operator POST /api/build
  if (executorType === "supervised") {
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
      instructions: `Build spec locked. Send to your executor:\n\n${chosen.artifacts.buildSpec.slice(0, 500)}...`,
    });
  }

  // Codex or mock — executor returned qaReady: true, run QA now
  await updateBuildState(buildId, { workflowState: "EXECUTOR_COMPLETE" });
  await logBuildEvent({
    agent: "executor",
    action: "EXECUTOR_COMPLETE",
    tier: build.tier,
    build_id: buildId,
    client_name: build.clientName,
    status: "EXECUTOR_COMPLETE",
  });

  if (result.qaReady) {
    await runQA(buildId, build, chosen.artifacts.buildSpec);
    return NextResponse.json({
      ok: true,
      buildId,
      direction,
      executorType,
      workflowState: "QA_RUNNING",
    });
  }

  return NextResponse.json({ ok: true, buildId, direction, executorType, workflowState: "EXECUTOR_COMPLETE" });
}

async function runQA(buildId: string, build: { tier?: string; clientName?: string; totalCost: number }, buildSpec: string) {
  await updateBuildState(buildId, { workflowState: "QA_RUNNING" });

  try {
    const qaMsg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: `You are the Mission Control QA Inspector (Agent 08). Score the build spec against 10 quality dimensions. Return ONLY valid JSON. No markdown. No explanation.

SKILL ROUTING MATRIX — your allowed skills only:
- qa-scorecard-evaluation: score all 10 dimensions
- dimension-scoring: integer 0-100 per dimension, specific notes per dimension
- pass-fail-determination: pass=true only if score meets or exceeds the minimum
- recommendation-generation: actionable specific recommendations for any failing dimension
- failure-report-generation: list every failing dimension in failingDimensions array

FORBIDDEN — do not do any of the following:
- Modify the build
- Inflate scores to force a pass
- Return pass=true for any dimension below its minimum
- Return generic notes — all notes must be specific to this build spec

MINIMUM SCORES (enforced — any dimension below minimum means pass=false for that dimension AND the overall build):
visualTaste=70, mobileExperience=80, ctaStrength=80, copyQuality=70, trustArchitecture=75, performanceRisk=70, brandPerception=70, motionQuality=70, seoFoundation=65, codeMaintainability=65

finalScore = mathematical average of all 10 dimension scores
pass = true ONLY if every single dimension meets or exceeds its minimum

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
      agent: "orchestrator",
      action: "PREVIEW_READY",
      tier: build.tier,
      cost: qaCost,
      build_id: buildId,
      client_name: build.clientName,
      status: "PREVIEW_READY",
    });
  } catch (err) {
    await updateBuildState(buildId, { workflowState: "FAILED", errorMessage: (err as Error).message });
  }
}
