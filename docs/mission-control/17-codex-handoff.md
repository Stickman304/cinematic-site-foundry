# Mission Control — Codex / Claude Code Handoff Format

This document defines the exact format used when Mission Control hands off a locked build spec to a code executor.

---

## Handoff Trigger

The handoff is triggered when:
1. The operator approves a direction
2. Mission Control locks the build spec
3. The operator clicks "Send to Executor" in the Mission Control UI

---

## Codex Handoff — API Call

Mission Control sends a single API request to the Codex Responses API:

```typescript
const response = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "codex-mini-latest",
    input: buildHandoffPrompt(lockedBuildSpec, photoUrls),
    tools: [
      { type: "shell" },
      { type: "text_editor" },
    ],
  }),
});
```

---

## Handoff Prompt Format

```
You are executing a locked website build specification. You are the builder. Mission Control has designed this site. Your job is to build exactly what the spec says.

RULES:
- Build exactly what the spec describes. Do not interpret or improve it.
- Do not add features not in the spec.
- Do not remove features from the spec.
- Use the exact colors, fonts, and layout described.
- Do not include placeholder text in the final output. Use [PLACEHOLDER: description] format for content requiring client input.
- Do not hardcode API keys. Use process.env.VAR_NAME references.
- Return all changed files in the executor output format.

CLIENT: [clientName]
TIER: [tier]
DIRECTION: [A|B]
BUILD ID: [buildId]

--- BUILD SPEC BEGIN ---
[full content of locked build-spec.md]
--- BUILD SPEC END ---

CLIENT PHOTOS:
[list of photo URLs or "None provided"]

Begin building.
```

---

## Claude Code Handoff — Operator-Supervised

When the executor is Claude Code (operator-supervised), Mission Control:

1. Writes the locked build spec to `builds/[buildId]/build-spec.md`
2. Displays this message in Mission Control:

```
BUILD SPEC LOCKED
Build ID: [buildId]
Spec written to: builds/[buildId]/build-spec.md

To start the build:
1. Open a Claude Code session
2. cd to your project directory
3. Run: claude "Read builds/[buildId]/build-spec.md and build this website"
4. When complete, return to Mission Control and click "Build Complete"
```

3. Waits for the operator to click "Build Complete"
4. Operator pastes or uploads the executor output JSON

---

## Executor Output JSON

The executor (Codex, Claude Code, or other) returns:

```json
{
  "buildId": "uuid",
  "status": "complete",
  "files": [
    {
      "path": "src/app/page.tsx",
      "operation": "created"
    },
    {
      "path": "src/components/Hero.tsx",
      "operation": "created"
    },
    {
      "path": "public/images/hero-bg.jpg",
      "operation": "created"
    }
  ],
  "errors": [],
  "warnings": [
    {
      "message": "Hero image is a placeholder — replace with client-supplied photo before launch"
    }
  ],
  "previewUrl": "https://preview-url.netlify.app",
  "buildTimeMs": 42000
}
```

Mission Control receives this JSON and:
1. Logs it to Supabase
2. Updates build status to `QA_IN_PROGRESS`
3. Sends to QA scoring
4. Displays executor panel in Mission Control

---

## Partial Build Handling

If the executor returns `"status": "partial"`:
- Mission Control logs `status: "error"` to Supabase
- Surfaces the partial result to the operator
- Operator reviews errors and decides: retry, fix manually, or discard build
- No QA or preview generated for partial builds

---

## File Count Expectations by Tier

| Tier | Expected File Count |
|---|---|
| Tier 1 | 8–15 files |
| Tier 2 | 15–25 files |
| Tier 3 | 20–35 files |
| Tier 4 | 30–60+ files |

If the executor returns significantly fewer files than expected for the tier, Mission Control flags this to the operator before QA.
