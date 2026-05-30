import { BaseExecutor } from "./base";
import type { ExecutorInput, ExecutorOutput } from "./types";

const CODEX_MODEL = process.env.OPENAI_CODEX_MODEL ?? "codex-mini-latest";
const TIMEOUT_MS = Number(process.env.OPENAI_EXECUTOR_TIMEOUT_MS ?? 600_000);
const MAX_RETRIES = Number(process.env.OPENAI_EXECUTOR_MAX_RETRIES ?? 2);

function buildHandoffPrompt(input: ExecutorInput): string {
  return `You are the Hidden Build Executor for Mission Control. You have been given a locked build specification. Your only job is to build exactly what the spec describes.

HARD RULES — NO EXCEPTIONS:
- Build exactly what the spec describes. Do not interpret, improve, or extend it.
- Do not add features not in the spec.
- Do not remove features from the spec.
- Use the exact colors, fonts, and layouts described in the design system.
- Do not hardcode API keys — use process.env.VAR_NAME references.
- Do not send outreach of any kind.
- Do not deploy to production — build locally only.
- Do not delete project files without explicit approval.
- Return all changed files in the structured output format.
- Use [PLACEHOLDER: description] for any content requiring client input.

CLIENT: ${input.clientName ?? "unknown"}
TIER: ${input.tier}
DIRECTION: ${input.approvedDirection}
BUILD ID: ${input.buildId}

--- DESIGN SYSTEM BEGIN ---
${input.artifacts.designSystem}
--- DESIGN SYSTEM END ---

--- ANTI-SLOP RULES BEGIN ---
${input.artifacts.antiSlopRules}
--- ANTI-SLOP RULES END ---

--- COPY BRIEF BEGIN ---
${input.artifacts.copyBrief}
--- COPY BRIEF END ---

--- MOTION PLAN BEGIN ---
${input.artifacts.motionPlan}
--- MOTION PLAN END ---

--- BUILD SPEC BEGIN ---
${input.artifacts.buildSpec}
--- BUILD SPEC END ---

CLIENT PHOTOS:
${input.photoUrls?.length ? input.photoUrls.join("\n") : "None provided"}

${input.acceptanceCriteria ? `--- ACCEPTANCE CRITERIA BEGIN ---\n${input.acceptanceCriteria}\n--- ACCEPTANCE CRITERIA END ---` : ""}

Begin building.`;
}

export class CodexExecutor extends BaseExecutor {
  readonly executorType = "codex" as const;

  async run(input: ExecutorInput): Promise<ExecutorOutput> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        status: "EXECUTOR_FAILED",
        executorType: "codex",
        changedFiles: [],
        logs: [],
        errors: ["OPENAI_API_KEY is not configured"],
        qaReady: false,
      };
    }

    const prompt = buildHandoffPrompt(input);
    const startedAt = Date.now();
    let attempt = 0;

    while (attempt <= MAX_RETRIES) {
      attempt++;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const res = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: CODEX_MODEL,
            input: prompt,
            tools: [
              { type: "shell" },
              { type: "text_editor" },
            ],
          }),
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (!res.ok) {
          const errText = await res.text();
          if (attempt > MAX_RETRIES) {
            return this.failResult(`Codex API error ${res.status}: ${errText}`);
          }
          continue;
        }

        const data = await res.json() as {
          output?: { type: string; content?: string }[];
          error?: { message: string };
        };

        if (data.error) {
          if (attempt > MAX_RETRIES) {
            return this.failResult(`Codex returned error: ${data.error.message}`);
          }
          continue;
        }

        const buildTimeMs = Date.now() - startedAt;
        const rawOutput = data.output?.find((o) => o.type === "text")?.content ?? "";

        return {
          status: "complete",
          executorType: "codex",
          changedFiles: [],
          previewUrl: undefined,
          logs: [
            `[codex] Build started for ${input.buildId}`,
            `[codex] Model: ${CODEX_MODEL}`,
            `[codex] Attempt: ${attempt}/${MAX_RETRIES + 1}`,
            `[codex] Build time: ${buildTimeMs}ms`,
            rawOutput ? `[codex] Output preview: ${rawOutput.slice(0, 300)}` : "[codex] No text output",
          ],
          errors: [],
          qaReady: true,
          completedAt: new Date().toISOString(),
        };

      } catch (err) {
        if (attempt > MAX_RETRIES) {
          return this.failResult((err as Error).message);
        }
      }
    }

    return this.failResult(`Codex executor failed after ${MAX_RETRIES + 1} attempts`);
  }
}
