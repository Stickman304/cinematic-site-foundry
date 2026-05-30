import { NextRequest } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { scrapeUrl } from "@/lib/firecrawl";
import { logBuildEvent, createBuildRecord, updateBuildState } from "@/lib/supabase";
import { randomUUID } from "crypto";
import type { AuditObject, Direction } from "@/types/models";

export const runtime = "nodejs";
export const maxDuration = 300;

function normUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function calcCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * 3 + (outputTokens / 1_000_000) * 15;
}

export async function POST(req: NextRequest) {
  const { tier, url: rawUrl, clientName, notes, photoUrls = [] } = await req.json();

  if (!rawUrl) {
    return new Response(JSON.stringify({ error: "url is required" }), { status: 400 });
  }

  const url = normUrl(rawUrl);
  const buildId = randomUUID();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let totalCost = 0;

      function send(agent: string, action: string, detail: string, extra: Record<string, unknown> = {}) {
        const payload = JSON.stringify({ buildId, agent, action, detail, ts: new Date().toISOString(), ...extra });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        logBuildEvent({ agent, action, tier, build_id: buildId, client_name: clientName, status: action });
      }

      try {
        // ── Init record ────────────────────────────────────────────────────
        await createBuildRecord({ buildId, url, clientName, tier, notes, photoUrls });
        send("mission-control", "URL_RECEIVED", `Build ${buildId} started for ${url}`);

        // ── Stage 1: Firecrawl ─────────────────────────────────────────────
        await updateBuildState(buildId, { workflowState: "AUDITING_WEBSITE" });
        send("scout", "AUDITING_WEBSITE", `Scraping ${url}...`);

        let markdown = "";
        let pageTitle = "";
        try {
          const scraped = await scrapeUrl(url);
          markdown = scraped.markdown.slice(0, 10000);
          pageTitle = scraped.title;
          send("scout", "scrape_complete", `${pageTitle || url} — ${markdown.length} chars captured`);
        } catch (e) {
          send("scout", "scrape_error", `Firecrawl unavailable — proceeding with URL only: ${(e as Error).message}`);
        }

        // ── Stage 2: Audit object ──────────────────────────────────────────
        await updateBuildState(buildId, { workflowState: "SCORING_OPPORTUNITY" });
        send("auditor", "SCORING_OPPORTUNITY", "Generating audit object...");

        const auditMsg = await anthropic.messages.create({
          model: MODEL,
          max_tokens: 1024,
          system: `You are the Mission Control auditor. Analyze the website content and return ONLY a valid JSON object with no markdown, no explanation, no preamble.

Rules from Mission Control doctrine:
- websiteScore: how good is the current site (0=broken/none, 100=already excellent)
- opportunityScore: how much room for upgrade (0=minimal gap, 100=massive opportunity)
- sellabilityScore: how likely the business is to invest in a premium upgrade (0=unlikely, 100=obvious yes)
- topProblems: 3 specific conversion/design problems you observed
- recommendedTier: one of "tier1", "tier2", "tier3", "tier4"
  Tier routing: routingScore = (opportunityScore*0.5 + sellabilityScore*0.5)
  0-30=tier1, 31-55=tier2, 56-75=tier3, 76-100=tier4
- upgradeAngle: one sentence pitch angle for this specific business
- Extract clientNameExtracted, industryExtracted, locationExtracted from the content`,
          messages: [{
            role: "user",
            content: `Client URL: ${url}
Client Name Provided: ${clientName || "not provided"}
Tier Requested: ${tier || "auto-route"}

Scraped content (first 10000 chars):
${markdown || "[scrape unavailable — work from URL]"}

Return ONLY valid JSON. No markdown. No explanation.`,
          }],
        });

        let auditObject: AuditObject;
        try {
          const raw = auditMsg.content[0].type === "text" ? auditMsg.content[0].text : "{}";
          auditObject = JSON.parse(raw);
        } catch {
          auditObject = {
            websiteScore: 30,
            opportunityScore: 70,
            sellabilityScore: 60,
            topProblems: ["Unable to parse audit — using defaults"],
            recommendedTier: "tier2",
            upgradeAngle: `${clientName || "This business"} needs a premium website upgrade`,
          };
        }

        const auditCost = calcCost(auditMsg.usage.input_tokens, auditMsg.usage.output_tokens);
        totalCost += auditCost;
        await updateBuildState(buildId, { workflowState: "SCORING_OPPORTUNITY", auditObject, totalCost });
        send("auditor", "audit_complete", `Scored: website=${auditObject.websiteScore} opportunity=${auditObject.opportunityScore} sellability=${auditObject.sellabilityScore}`, { auditObject, cost: auditCost });

        // ── Stage 3: Two creative directions ──────────────────────────────
        await updateBuildState(buildId, { workflowState: "GENERATING_DIRECTIONS" });
        send("designer", "GENERATING_DIRECTIONS", "Generating two creative directions...");

        const effectiveTier = tier || `${auditObject.recommendedTier} (auto-routed)`;

        const directionsMsg = await anthropic.messages.create({
          model: MODEL,
          max_tokens: 8192,
          system: `You are the Mission Control designer. Return ONLY a valid JSON object with two complete creative directions. No markdown code blocks, no explanation.

Visual Language Bible rules:
- No default Inter font without justification
- No generic purple/blue neon AI gradients
- No generic centered hero as default
- No fake futuristic UI with no business purpose
- Every visual element must connect to the specific business and industry
- Hero must answer: what business, who they help, what problem, why trust, what to click
- Industry recipes: roofing=protection/strength/storms, HVAC=comfort/airflow, surveying=precision/mapping, trucking=movement/reliability, assisted living=warmth/safety/dignity, concrete=strength/craftsmanship, landscaping=transformation/beauty, plumbing=emergency/clean/fast

Direction A = Safe Premium: elevated version of their existing identity
Direction B = Bold Premium: distinctive approach that stands them apart

Return this exact JSON shape:
{
  "directionA": {
    "id": "A",
    "name": "string — 3-5 words",
    "concept": "string — 2 sentences describing the creative concept",
    "heroHeadline": "string — the actual headline for the hero section",
    "heroSubheadline": "string — the supporting line",
    "visualFeel": "string — 4-5 adjectives describing the visual tone",
    "keyDifferentiator": "string — one sentence on what makes this direction distinctive",
    "gradientType": "string — which gradient from: Deep Trust, Warm Residential, Storm-to-Safety, Industrial Precision, Clean Modern White, Premium Black Glass",
    "heroLayout": "string — one of: Layout A (Left Copy Right Visual), Layout B (Split Editorial), Layout C (Layered Visual), Layout D (Cinematic Full-Width), Layout E (3D Object)",
    "artifacts": {
      "designSystem": "string — markdown: colors (hex values), typography, spacing rules",
      "creativeDirection": "string — markdown: full creative brief, hero description, 3 key sections",
      "antiSlopRules": "string — markdown: 5-8 specific banned patterns for this build",
      "copyBrief": "string — markdown: voice, headline formula, CTA copy, forbidden phrases",
      "motionPlan": "string — markdown: tier-appropriate motion for each section",
      "buildSpec": "string — markdown: full build spec per the Mission Control build spec template"
    }
  },
  "directionB": {
    "id": "B",
    "name": "string",
    "concept": "string",
    "heroHeadline": "string",
    "heroSubheadline": "string",
    "visualFeel": "string",
    "keyDifferentiator": "string",
    "gradientType": "string",
    "heroLayout": "string",
    "artifacts": {
      "designSystem": "string",
      "creativeDirection": "string",
      "antiSlopRules": "string",
      "copyBrief": "string",
      "motionPlan": "string",
      "buildSpec": "string"
    }
  }
}`,
          messages: [{
            role: "user",
            content: `Client URL: ${url}
Client Name: ${clientName || auditObject.clientNameExtracted || "not provided"}
Industry: ${auditObject.industryExtracted || "not detected"}
Location: ${auditObject.locationExtracted || "not detected"}
Tier: ${effectiveTier}
Notes: ${notes || "none"}

Audit Results:
- Website Score: ${auditObject.websiteScore}/100
- Opportunity Score: ${auditObject.opportunityScore}/100
- Sellability Score: ${auditObject.sellabilityScore}/100
- Top Problems: ${auditObject.topProblems.join("; ")}
- Upgrade Angle: ${auditObject.upgradeAngle}

Scraped content (first 6000 chars):
${markdown.slice(0, 6000) || "[scrape unavailable]"}

Return ONLY valid JSON. Two complete creative directions. Make them genuinely distinct — not variations of the same idea.`,
          }],
        });

        let directionA: Direction;
        let directionB: Direction;

        try {
          const raw = directionsMsg.content[0].type === "text" ? directionsMsg.content[0].text : "{}";
          const parsed = JSON.parse(raw);
          directionA = parsed.directionA;
          directionB = parsed.directionB;
        } catch {
          directionA = {
            id: "A",
            name: "Safe Premium Upgrade",
            concept: "Elevated version of the business's existing identity with premium visual polish.",
            heroHeadline: `${clientName || "Your Business"} — Premium Service, Local Trust`,
            heroSubheadline: "Professional results. Clear pricing. Fast response.",
            visualFeel: "clean, modern, trustworthy, premium",
            keyDifferentiator: "Safe premium route — preserves brand recognition while upgrading perception",
            gradientType: "Deep Trust",
            heroLayout: "Layout A (Left Copy Right Visual)",
            artifacts: {
              designSystem: "To be generated after approval",
              creativeDirection: "Safe premium creative direction",
              antiSlopRules: "No generic stock photos. No vague copy.",
              copyBrief: "Direct, specific, local, outcome-focused",
              motionPlan: "Subtle reveal animations, button hover effects",
              buildSpec: "Full spec generated after approval",
            },
          };
          directionB = {
            id: "B",
            name: "Bold Market Leader",
            concept: "Distinctive brand positioning that makes this business stand apart from every competitor in the market.",
            heroHeadline: `The ${auditObject.industryExtracted || "Service"} Company ${auditObject.locationExtracted || "Clients"} Call First`,
            heroSubheadline: "Premium work. Transparent pricing. Results you can see.",
            visualFeel: "bold, cinematic, distinctive, confident",
            keyDifferentiator: "Bold differentiation route — positions client as the obvious market leader",
            gradientType: "Premium Black Glass",
            heroLayout: "Layout C (Layered Visual)",
            artifacts: {
              designSystem: "To be generated after approval",
              creativeDirection: "Bold market leader creative direction",
              antiSlopRules: "No industry clichés. No generic trust statements.",
              copyBrief: "Confident, direct, premium-feeling, specific",
              motionPlan: "Signature motion, scroll reveals, industry-specific animation",
              buildSpec: "Full spec generated after approval",
            },
          };
        }

        const directionsCost = calcCost(directionsMsg.usage.input_tokens, directionsMsg.usage.output_tokens);
        totalCost += directionsCost;

        await updateBuildState(buildId, {
          workflowState: "WAITING_FOR_APPROVAL",
          directionA,
          directionB,
          totalCost,
        });

        send("designer", "GENERATING_DIRECTIONS", `Direction A: "${directionA.name}" | Direction B: "${directionB.name}"`, { cost: directionsCost });
        send("mission-control", "WAITING_FOR_APPROVAL", "Two directions ready — awaiting operator approval before any build starts");

        // Final payload
        const finalPayload = JSON.stringify({
          buildId,
          done: true,
          workflowState: "WAITING_FOR_APPROVAL",
          auditObject,
          directionA,
          directionB,
          totalCost,
        });
        controller.enqueue(encoder.encode(`data: ${finalPayload}\n\n`));

        await logBuildEvent({
          agent: "mission-control",
          action: "directions_ready",
          tier,
          cost: totalCost,
          build_id: buildId,
          client_name: clientName,
          status: "WAITING_FOR_APPROVAL",
        });

      } catch (err) {
        const msg = (err as Error).message;
        await updateBuildState(buildId, { workflowState: "ERROR", errorMessage: msg });
        const errPayload = JSON.stringify({ buildId, error: true, detail: msg });
        controller.enqueue(encoder.encode(`data: ${errPayload}\n\n`));
        await logBuildEvent({
          agent: "mission-control",
          action: "pipeline_error",
          tier,
          build_id: buildId,
          client_name: clientName,
          status: "ERROR",
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
