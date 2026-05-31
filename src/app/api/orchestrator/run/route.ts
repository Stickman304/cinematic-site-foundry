import { NextRequest } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { scrapeUrl } from "@/lib/firecrawl";
import { logBuildEvent, createBuildRecord, updateBuildState } from "@/lib/supabase";
import { randomUUID } from "crypto";
import type { AuditObject, Direction } from "@/types/models";

export const runtime = "nodejs";
export const maxDuration = 300;

// ── Timeouts ──────────────────────────────────────────────────────────────────

const TIMEOUT = {
  scrape:     90_000,
  audit:      180_000,
  directions: 180_000,
} as const;

function raceTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
    ),
  ]);
}

// ── Tier classification ───────────────────────────────────────────────────────

type BuildTier = "tier1_renovation" | "tier2_new_website" | "tier2_premium" | "tier3_cinematic";

function classifyTier(tier?: string): BuildTier {
  if (!tier) return "tier1_renovation";
  const t = tier.toLowerCase();
  if (t.includes("cinematic")) return "tier3_cinematic";
  if (t.includes("premium")) return "tier2_premium";
  if (t.includes("new") || t.includes("website")) return "tier2_new_website";
  return "tier1_renovation";
}

function isFastMode(bt: BuildTier): boolean {
  return bt === "tier1_renovation";
}

// ── Cost calc ─────────────────────────────────────────────────────────────────

function calcCost(input: number, output: number): number {
  return (input / 1_000_000) * 3 + (output / 1_000_000) * 15;
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const {
    url: rawUrl,
    buildType,
    tier,
    operatorDirections,
    brandNotes,
    notes,
    clientName,
  } = await req.json() as {
    url?: string;
    buildType?: string;
    tier?: string;
    operatorDirections?: string;
    brandNotes?: string;
    notes?: string;
    clientName?: string;
  };

  const directions = operatorDirections ?? notes ?? "";

  const buildTier = classifyTier(tier ?? buildType);
  const fast = isFastMode(buildTier);
  const url = rawUrl
    ? (rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`)
    : undefined;

  if (!url && buildTier === "tier1_renovation") {
    return new Response(JSON.stringify({ error: "url is required for renovation builds" }), { status: 400 });
  }

  const buildId = randomUUID();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let totalCost = 0;
      const startMs = Date.now();

      function send(stage: string, detail: string, extra: Record<string, unknown> = {}) {
        const payload = JSON.stringify({
          buildId, stage, detail,
          ts: new Date().toISOString(),
          elapsedMs: Date.now() - startMs,
          buildMode: fast ? "FAST_RENOVATION" : buildTier,
          ...extra,
        });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        logBuildEvent({
          agent: "orchestrator",
          action: stage,
          tier: tier ?? buildType,
          build_id: buildId,
          client_name: clientName,
          status: stage,
        });
      }

      try {
        // ── Init ────────────────────────────────────────────────────────────
        await createBuildRecord({
          buildId,
          url: url ?? "",
          clientName,
          tier: tier ?? buildType,
          notes: directions || undefined,
          photoUrls: [],
        });
        await updateBuildState(buildId, { workflowState: "URL_RECEIVED" });
        send("URL_RECEIVED", `Build ${buildId} started · ${fast ? "Fast Renovation" : buildTier} mode`);

        // ── Stage 1: Scrape ─────────────────────────────────────────────────
        let markdown = "";
        let pageTitle = "";

        if (url) {
          await updateBuildState(buildId, { workflowState: "SCRAPING_SITE" });
          send("SCRAPING_SITE", `Scraping ${url}...`);

          try {
            const scraped = await raceTimeout(scrapeUrl(url), TIMEOUT.scrape, "Scrape");
            markdown = scraped.markdown.slice(0, 10_000);
            pageTitle = scraped.title;
            send("SCRAPING_SITE", `${pageTitle || url} — ${markdown.length} chars captured`);
          } catch (e) {
            send("SCRAPING_SITE", `Scrape failed — continuing with URL only: ${(e as Error).message}`);
          }
        }

        // ── Stage 2: Audit ──────────────────────────────────────────────────
        await updateBuildState(buildId, { workflowState: "GENERATING_AUDIT" });
        send("GENERATING_AUDIT", "Analyzing site and scoring opportunity...");

        const auditMsg = await raceTimeout(
          anthropic.messages.create({
            model: MODEL,
            max_tokens: 1024,
            system: `You are the Mission Control Audit Agent. Return ONLY valid JSON. No markdown, no explanation.

Score the site and extract entity data. Apply these skills:
- website-scoring: websiteScore (0=broken, 100=excellent), opportunityScore (0=minimal gap, 100=massive), sellabilityScore (0=unlikely to invest, 100=obvious yes)
- problem-identification: exactly 3 specific topProblems — specific to THIS business, never generic
- tier-routing: routingScore = (opportunityScore×0.5 + sellabilityScore×0.5); 0-30=tier1, 31-55=tier2, 56-100=tier3
- upgrade-angle-generation: one sentence, specific to this business
- entity-extraction: clientNameExtracted, industryExtracted, locationExtracted

Return:
{"websiteScore":0,"opportunityScore":0,"sellabilityScore":0,"topProblems":["","",""],"recommendedTier":"tier1","upgradeAngle":"","clientNameExtracted":"","industryExtracted":"","locationExtracted":""}`,
            messages: [{
              role: "user",
              content: `URL: ${url ?? "not provided"}
Client: ${clientName ?? "not provided"}
Tier: ${tier ?? buildType ?? "auto"}
Operator directions: ${directions || "none"}
Brand notes: ${brandNotes ?? "none"}

Scraped content:
${markdown || "[not available]"}

Return ONLY valid JSON.`,
            }],
          }),
          TIMEOUT.audit,
          "Audit"
        );

        let auditObject: AuditObject;
        try {
          const raw = auditMsg.content[0].type === "text" ? auditMsg.content[0].text : "{}";
          auditObject = JSON.parse(raw);
        } catch {
          auditObject = {
            websiteScore: 30, opportunityScore: 70, sellabilityScore: 60,
            topProblems: ["Audit parse failed — proceeding with defaults"],
            recommendedTier: "tier1", upgradeAngle: "Site needs modernization",
          };
        }

        const auditCost = calcCost(auditMsg.usage.input_tokens, auditMsg.usage.output_tokens);
        totalCost += auditCost;
        await updateBuildState(buildId, { workflowState: "GENERATING_AUDIT", auditObject, totalCost });
        send("GENERATING_AUDIT", `Audit complete — opportunity ${auditObject.opportunityScore}/100, sellability ${auditObject.sellabilityScore}/100`, {
          auditObject, cost: auditCost,
        });

        // ── Stage 3: Directions ─────────────────────────────────────────────
        await updateBuildState(buildId, { workflowState: "GENERATING_DIRECTIONS" });
        send("GENERATING_DIRECTIONS", fast
          ? "Generating compact Direction A/B for fast approval..."
          : "Generating detailed Direction A/B...");

        const effectiveTier = tier ?? buildType ?? `${auditObject.recommendedTier} (auto)`;

        const systemPrompt = fast
          ? `You are the Mission Control Creative Director (FAST RENOVATION MODE). Return ONLY valid JSON — two compact creative directions for quick operator review. No markdown, no explanation.

RULES:
- Every artifact field must be under 80 words — concise, decision-ready
- gradientType: one of Deep Trust, Warm Residential, Storm-to-Safety, Industrial Precision, Clean Modern White, Premium Black Glass
- heroLayout: one of Layout A (Left Copy Right Visual), Layout B (Split Editorial), Layout C (Layered Visual), Layout D (Cinematic Full-Width), Layout E (3D Object)
- Direction A = Safe Premium (elevate existing identity)
- Direction B = Bold Premium (distinct stand-apart strategy)
- buildSpec: 120-word renovation brief — top 3-5 changes, page structure, priority order
- Incorporate any operator brand direction or notes as primary creative input

Return compact JSON:
{"directionA":{"id":"A","name":"string","concept":"string","heroHeadline":"string","heroSubheadline":"string","visualFeel":"string","keyDifferentiator":"string","gradientType":"string","heroLayout":"string","artifacts":{"designSystem":"string","creativeDirection":"string","antiSlopRules":"string","copyBrief":"string","motionPlan":"string","buildSpec":"string"}},"directionB":{"id":"B","name":"string","concept":"string","heroHeadline":"string","heroSubheadline":"string","visualFeel":"string","keyDifferentiator":"string","gradientType":"string","heroLayout":"string","artifacts":{"designSystem":"string","creativeDirection":"string","antiSlopRules":"string","copyBrief":"string","motionPlan":"string","buildSpec":"string"}}}`
          : `You are the Mission Control Creative Director (Agent 04). Return ONLY valid JSON with two complete creative directions. No markdown, no explanation.

RULES:
- gradientType: one of Deep Trust, Warm Residential, Storm-to-Safety, Industrial Precision, Clean Modern White, Premium Black Glass
- heroLayout: one of Layout A (Left Copy Right Visual), Layout B (Split Editorial), Layout C (Layered Visual), Layout D (Cinematic Full-Width), Layout E (3D Object)
- Direction A = Safe Premium (elevate existing identity)
- Direction B = Bold Premium (distinct stand-apart strategy)
- Directions must be genuinely distinct — not color variations of the same idea
- Incorporate any operator brand direction or notes as primary creative input
- Visual Language Bible: connect every element to the specific business and industry

Return:
{"directionA":{"id":"A","name":"string","concept":"string","heroHeadline":"string","heroSubheadline":"string","visualFeel":"string","keyDifferentiator":"string","gradientType":"string","heroLayout":"string","artifacts":{"designSystem":"string","creativeDirection":"string","antiSlopRules":"string","copyBrief":"string","motionPlan":"string","buildSpec":"string"}},"directionB":{"id":"B","name":"string","concept":"string","heroHeadline":"string","heroSubheadline":"string","visualFeel":"string","keyDifferentiator":"string","gradientType":"string","heroLayout":"string","artifacts":{"designSystem":"string","creativeDirection":"string","antiSlopRules":"string","copyBrief":"string","motionPlan":"string","buildSpec":"string"}}}`;

        const directionsMsg = await raceTimeout(
          anthropic.messages.create({
            model: MODEL,
            max_tokens: fast ? 2500 : 8192,
            system: systemPrompt,
            messages: [{
              role: "user",
              content: `URL: ${url ?? "not provided"}
Client: ${clientName ?? auditObject.clientNameExtracted ?? "not provided"}
Industry: ${auditObject.industryExtracted ?? "not detected"}
Location: ${auditObject.locationExtracted ?? "not detected"}
Tier: ${effectiveTier}
Build type: ${buildType ?? "renovation"}

Operator directions:
${directions || "none"}

Brand notes:
${brandNotes ?? "none"}

Audit:
- Website: ${auditObject.websiteScore}/100
- Opportunity: ${auditObject.opportunityScore}/100
- Sellability: ${auditObject.sellabilityScore}/100
- Problems: ${auditObject.topProblems.join("; ")}
- Angle: ${auditObject.upgradeAngle}

Scraped content (first ${fast ? 3000 : 6000} chars):
${markdown.slice(0, fast ? 3000 : 6000) || "[not available]"}

Return ONLY valid JSON. Two ${fast ? "compact" : "complete"} directions — genuinely distinct.`,
            }],
          }),
          TIMEOUT.directions,
          "Directions"
        );

        let directionA: Direction;
        let directionB: Direction;

        try {
          const raw = directionsMsg.content[0].type === "text" ? directionsMsg.content[0].text : "{}";
          const parsed = JSON.parse(raw);
          directionA = parsed.directionA;
          directionB = parsed.directionB;
        } catch {
          directionA = {
            id: "A", name: "Safe Premium Upgrade",
            concept: "Elevated version of the business's existing identity with premium visual polish.",
            heroHeadline: `${clientName || auditObject.clientNameExtracted || "Your Business"} — Premium, Local, Trusted`,
            heroSubheadline: "Professional results. Clear pricing. Fast response.",
            visualFeel: "clean, modern, trustworthy, premium",
            keyDifferentiator: "Safe premium — preserves brand recognition while upgrading perception",
            gradientType: "Deep Trust", heroLayout: "Layout A (Left Copy Right Visual)",
            artifacts: {
              designSystem: "To be generated after approval",
              creativeDirection: "Safe premium renovation direction",
              antiSlopRules: "No generic stock photos. No vague copy.",
              copyBrief: "Direct, specific, local, outcome-focused",
              motionPlan: "Subtle reveal animations, button hover effects",
              buildSpec: "Full spec generated after approval",
            },
          };
          directionB = {
            id: "B", name: "Bold Market Leader",
            concept: "Distinctive brand positioning that makes this business stand apart from every competitor.",
            heroHeadline: `The ${auditObject.industryExtracted || "Service"} Company ${auditObject.locationExtracted || "Clients"} Call First`,
            heroSubheadline: "Premium work. Transparent pricing. Proven results.",
            visualFeel: "bold, cinematic, distinctive, confident",
            keyDifferentiator: "Bold differentiation — positions client as the obvious market leader",
            gradientType: "Premium Black Glass", heroLayout: "Layout C (Layered Visual)",
            artifacts: {
              designSystem: "To be generated after approval",
              creativeDirection: "Bold market leader direction",
              antiSlopRules: "No industry clichés. No generic trust statements.",
              copyBrief: "Confident, direct, premium-feeling, specific",
              motionPlan: "Signature motion, scroll reveals, industry-specific animation",
              buildSpec: "Full spec generated after approval",
            },
          };
        }

        const dirCost = calcCost(directionsMsg.usage.input_tokens, directionsMsg.usage.output_tokens);
        totalCost += dirCost;

        await updateBuildState(buildId, {
          workflowState: "WAITING_FOR_APPROVAL",
          directionA, directionB, totalCost,
        });

        send("WAITING_FOR_APPROVAL", `Direction A: "${directionA.name}" · Direction B: "${directionB.name}"`, {
          cost: dirCost,
        });
        send("WAITING_FOR_APPROVAL", "Directions ready — awaiting operator approval");

        // Final payload
        const finalPayload = JSON.stringify({
          buildId, done: true,
          workflowState: "WAITING_FOR_APPROVAL",
          auditObject, directionA, directionB, totalCost,
        });
        controller.enqueue(encoder.encode(`data: ${finalPayload}\n\n`));

        await logBuildEvent({
          agent: "orchestrator",
          action: "directions_ready",
          tier: tier ?? buildType,
          cost: totalCost,
          build_id: buildId,
          client_name: clientName,
          status: "WAITING_FOR_APPROVAL",
        });

      } catch (err) {
        const msg = (err as Error).message;
        await updateBuildState(buildId, { workflowState: "FAILED", errorMessage: msg });
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ buildId, error: true, detail: msg })}\n\n`));
        await logBuildEvent({
          agent: "orchestrator", action: "pipeline_error",
          tier: tier ?? buildType, build_id: buildId, client_name: clientName, status: "FAILED",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Build-ID": buildId,
    },
  });
}
