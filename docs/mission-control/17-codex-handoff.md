# Mission Control — Codex/OpenAI Executor Handoff

Mission Control is the product. Codex/OpenAI is the preferred hidden executor. Claude Code is not used inside the Mission Control runtime. All executors must follow Mission Control specs.

---

## Architecture

```
Mission Control (product)
  → Executor Adapter (src/lib/mission-control/executors/)
    → CodexExecutor    — Codex/OpenAI Responses API
    → SupervisedExecutor — operator-triggered via POST /api/build
    → MockExecutor     — testing only
```

Claude Code may help maintain the repo externally (as a developer tool). It is not invoked during any build pipeline step.

---

## Handoff Trigger

The handoff is triggered when:
1. The operator approves a direction (POST /api/approve)
2. Mission Control locks the build spec
3. The executor adapter selects the appropriate executor
4. The executor receives `ExecutorInput` with all locked artifacts

---

## Codex/OpenAI Executor — API Call

`CodexExecutor.run()` sends a single API request to the OpenAI Responses API:

```typescript
const res = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: process.env.OPENAI_CODEX_MODEL ?? "codex-mini-latest",
    input: buildHandoffPrompt(input),
    tools: [
      { type: "shell" },
      { type: "text_editor" },
    ],
  }),
});
```

---

## Handoff Prompt Format

The prompt passed to the executor includes:

```
You are the Hidden Build Executor for Mission Control. You have been given a locked
build specification. Your only job is to build exactly what the spec describes.

HARD RULES — NO EXCEPTIONS:
- Build exactly what the spec describes. Do not interpret, improve, or extend it.
- Do not add features not in the spec.
- Do not remove features from the spec.
- Use the exact colors, fonts, and layouts described in the design system.
- Do not hardcode API keys — use process.env.VAR_NAME references.
- Do not send outreach of any kind.
- Do not deploy to production — build locally only.
- Do not delete project files without explicit approval.

CLIENT: [clientName]
TIER: [tier]
DIRECTION: [A|B]
BUILD ID: [buildId]

--- DESIGN SYSTEM BEGIN ---
[designSystem artifacts]
--- DESIGN SYSTEM END ---

--- ANTI-SLOP RULES BEGIN ---
[antiSlopRules artifacts]
--- ANTI-SLOP RULES END ---

--- COPY BRIEF BEGIN ---
[copyBrief artifacts]
--- COPY BRIEF END ---

--- MOTION PLAN BEGIN ---
[motionPlan artifacts]
--- MOTION PLAN END ---

--- BUILD SPEC BEGIN ---
[full content of locked buildSpec]
--- BUILD SPEC END ---
```

---

## Executor Output Format

`CodexExecutor.run()` returns `ExecutorOutput`:

```typescript
{
  status: "complete" | "partial" | "EXECUTOR_FAILED",
  executorType: "codex",
  changedFiles: [{ path: string, operation: "created" | "updated" | "deleted" }],
  previewUrl?: string,
  logs: string[],
  errors: string[],
  qaReady: boolean,
  completedAt?: string,
}
```

Mission Control receives this and:
1. If `status === "EXECUTOR_FAILED"` → sets `workflowState = EXECUTOR_FAILED`, surfaces error to operator
2. If `qaReady === true` → runs QA Inspector, transitions to `QA_IN_PROGRESS`
3. QA passes → generates sales package → `OUTREACH_DRAFTED`

---

## Supervised Mode — Operator-Triggered

When `EXECUTOR_TYPE=supervised`:

1. Mission Control locks build spec, sets `BUILDING_MOCKUP`
2. Mission Control returns instructions to the operator with the spec preview
3. Operator takes the spec to their executor of choice
4. When the build is ready, operator calls:

```
POST /api/build
Content-Type: application/json

{
  "buildId": "uuid",
  "previewUrl": "https://preview.example.com",
  "filesChanged": ["src/app/page.tsx", "src/components/Hero.tsx"],
  "errors": []
}
```

5. Mission Control marks executor complete, transitions to `QA_IN_PROGRESS`
6. QA runs → Sales Package generates

---

## Missing OPENAI_API_KEY Behavior

If `EXECUTOR_TYPE=codex` and `OPENAI_API_KEY` is not set, `CodexExecutor` returns:

```json
{
  "status": "EXECUTOR_FAILED",
  "executorType": "codex",
  "changedFiles": [],
  "logs": [],
  "errors": ["OPENAI_API_KEY is not configured"],
  "qaReady": false
}
```

Mission Control sets `workflowState = EXECUTOR_FAILED` and surfaces the error. The workflow does not crash. The operator can set the key and retry.

---

## Required Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| OPENAI_API_KEY | Yes (codex only) | — | Codex/OpenAI executor authentication |
| OPENAI_CODEX_MODEL | No | codex-mini-latest | Model to use |
| OPENAI_EXECUTOR_TIMEOUT_MS | No | 600000 | Per-request timeout |
| OPENAI_EXECUTOR_MAX_RETRIES | No | 2 | Retry count on transient errors |
| EXECUTOR_TYPE | No | auto-detected | supervised \| mock \| codex |

---

## File Count Expectations by Tier

| Tier | Expected File Count |
|---|---|
| Tier 1 | 8–15 files |
| Tier 2 | 15–25 files |
| Tier 3 | 20–35 files |
| Tier 4 | 30–60+ files |

If the executor returns significantly fewer files than expected for the tier, Mission Control flags this to the operator before QA.

---

## Partial Build Handling

If the executor returns `status: "partial"`:
- Mission Control surfaces the partial result to the operator
- Operator reviews errors and decides: retry, fix manually, or discard
- No QA or preview is generated for partial builds without operator approval
