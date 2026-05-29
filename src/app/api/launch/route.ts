import { NextRequest } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { scrapeUrl } from "@/lib/firecrawl";
import { logBuildEvent } from "@/lib/supabase";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const maxDuration = 300;

const TIER_BUDGETS: Record<string, { price: string; aiCost: string }> = {
  "TIER 1 — RENOVATION":  { price: "$500–$2,500",    aiCost: "~$0.50" },
  "TIER 2 — NEW BUILD":   { price: "$5,000–$10,000", aiCost: "~$1.50–$3" },
  "TIER 3 — ADVANCED":    { price: "$15,000–$30,000",aiCost: "~$5–$8" },
  "PREMIUM — AN EVENT":   { price: "$30,000+",        aiCost: "~$10–$15" },
};

export async function POST(req: NextRequest) {
  const { tier, url, clientName, notes, photoUrls = [] } = await req.json();

  if (!url) {
    return new Response(JSON.stringify({ error: "url is required" }), { status: 400 });
  }

  const buildId = randomUUID();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(agent: string, action: string, detail: string, cost?: number) {
        const payload = JSON.stringify({ buildId, agent, action, detail, cost, ts: new Date().toISOString() });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        logBuildEvent({ agent, action, tier, cost, build_id: buildId, client_name: clientName, status: "active" });
      }

      try {
        // ── Stage 1: Scout scrapes the client URL ─────────────────────────────
        send("Scout", "scrape_start", `Scraping ${url}...`);
        let scrapeData = { url, title: "", description: "", markdown: "", content: "" };
        try {
          scrapeData = await scrapeUrl(url);
          send("Scout", "scrape_complete", `${scrapeData.title || url} — ${scrapeData.markdown.length} chars captured`, 0.002);
        } catch (e) {
          send("Scout", "scrape_error", `Firecrawl error — proceeding with URL only: ${(e as Error).message}`);
        }

        // ── Stage 2: Build the full pipeline prompt ───────────────────────────
        send("Orchestrator", "prompt_build", "Assembling pipeline prompt...");

        const siteContent = scrapeData.markdown.slice(0, 8000);
        const tierBudget = TIER_BUDGETS[tier] ?? { price: "TBD", aiCost: "TBD" };
        const photoNote = photoUrls.length
          ? `Client photos available at:\n${photoUrls.map((u: string) => `- ${u}`).join("\n")}`
          : "No client photos uploaded.";

        const systemPrompt = `You are the AI engine of Stick Man Cinematic Agency.
You build cinematic websites that sell. Every site moves. Every site has automation.
You produce TWO complete creative directions — not variations, two distinct visions.
The client picks one. You never produce scaffolding. You produce finished products.

MANDATE:
- Two builds required. Two distinct creative directions.
- Every site ships with automation (minimum: contact form → email ≤60 seconds)
- Before shipping: would this site sell without a salesperson? If no — rebuild it.
- Run Impeccable standard. QA score must be 85+ (Tier 1/2) or 90+ (Tier 3/Premium).
- Mix-blend-mode: darken for white background character videos.

DESIGN FOUNDATION (all 6 steps before any code):
1. Intelligence — audit the client site, extract brand signals
2. Design System — define palette, typography, spacing, motion language
3. Anti-Slop filter — remove generic elements, find the specific angle
4. Components — map to cinematic-components library first
5. Motion — define every animation before writing code
6. Quality Gate — would Gary Tan ship this? If no — rethink.`;

        const userPrompt = `CLIENT BRIEF
─────────────────────────────────────────────
Client URL: ${url}
Client Name: ${clientName || "Not provided"}
Tier: ${tier} (${tierBudget.price})
Notes: ${notes || "None"}

${photoNote}

SCRAPED SITE CONTENT (first 8000 chars):
${siteContent || "[scrape unavailable — work from URL only]"}
─────────────────────────────────────────────

Execute the ${tier} pipeline.

STEP 1 — INTELLIGENCE REPORT
Analyze the scraped content. Report:
- Current site quality score (1–10)
- Top 3 conversion gaps
- Brand signals (colors, voice, audience)
- Recommended approach

STEP 2 — DESIGN SYSTEM
Define for this client:
- Color palette (primary, secondary, accent, neutral)
- Typography (heading font, body font, scale)
- Motion language (fast/slow, spring/ease, theatrical/subtle)
- Layout philosophy (dense/airy, dark/light, editorial/commercial)

STEP 3 — TWO CREATIVE DIRECTIONS
For each direction provide:
- Direction name and creative concept
- Hero section description (exact copy + visual treatment)
- 3 key sections with descriptions
- Animation and motion approach
- Component selection from cinematic-components library
- Why this direction wins for this client

STEP 4 — IMPLEMENTATION PLAN (for the approved direction)
Once client approves, you will produce:
- Complete Next.js component code
- Full CSS with cinematic-components
- Contact automation (form → email ≤60s)
- Deployment-ready package

Present both directions now. Await approval before building.`;

        // ── Stage 3: Stream from Anthropic ────────────────────────────────────
        send("Orchestrator", "pipeline_start", `Calling ${MODEL} — streaming response...`);

        let totalTokens = 0;
        let outputText = "";

        const streamResponse = await anthropic.messages.stream({
          model: MODEL,
          max_tokens: 8192,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        });

        for await (const chunk of streamResponse) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            outputText += chunk.delta.text;

            // Send progress pings every ~500 chars
            if (outputText.length % 500 < 20) {
              send("Orchestrator", "streaming", `${outputText.length} chars generated...`);
            }
          }
          if (chunk.type === "message_delta" && chunk.usage) {
            totalTokens = chunk.usage.output_tokens;
          }
        }

        const finalMessage = await streamResponse.finalMessage();
        const inputTokens = finalMessage.usage.input_tokens;
        const outputTokensCount = finalMessage.usage.output_tokens;
        // sonnet-4: $3/MTok in, $15/MTok out
        const cost = (inputTokens / 1_000_000) * 3 + (outputTokensCount / 1_000_000) * 15;

        send("Orchestrator", "pipeline_complete", `Pipeline complete — ${inputTokens} in / ${outputTokensCount} out tokens`, cost);
        send("visual-storyteller", "directions_ready", "Two creative directions produced — awaiting operator approval");

        // ── Send final payload ────────────────────────────────────────────────
        const finalPayload = JSON.stringify({
          buildId,
          done: true,
          output: outputText,
          cost: cost.toFixed(4),
          tokens: { input: inputTokens, output: outputTokensCount },
        });
        controller.enqueue(encoder.encode(`data: ${finalPayload}\n\n`));

        // Log completion
        await logBuildEvent({
          agent: "orchestrator",
          action: "build_complete",
          tier,
          cost,
          build_id: buildId,
          client_name: clientName,
          status: "awaiting_approval",
        });

      } catch (err) {
        const msg = (err as Error).message;
        const errPayload = JSON.stringify({ buildId, error: true, detail: msg });
        controller.enqueue(encoder.encode(`data: ${errPayload}\n\n`));
        await logBuildEvent({
          agent: "orchestrator",
          action: "pipeline_error",
          tier,
          build_id: buildId,
          client_name: clientName,
          status: "error",
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
