# Mission Control — Hermes / OpenCode Integration

Mission Control supports multiple executor backends. This document defines the Hermes and OpenCode integration paths.

---

## Executor Interface Contract

Every executor receives the same input and must return the same output shape.

### Input to Executor

```json
{
  "buildId": "uuid",
  "buildSpec": "full markdown content of locked build spec",
  "clientName": "Business Name",
  "tier": "tier1|tier2|tier3|tier4",
  "direction": "A|B",
  "photoUrls": ["https://..."],
  "targetDomain": "business-name.netlify.app",
  "constraints": {
    "maxBuildTimeMs": 300000,
    "qaMinimumScore": 72,
    "framework": "nextjs|html|astro"
  }
}
```

### Output from Executor

```json
{
  "buildId": "uuid",
  "status": "complete|error|partial",
  "files": [
    { "path": "src/app/page.tsx", "operation": "created|updated|deleted" }
  ],
  "errors": [
    { "file": "...", "line": 42, "message": "..." }
  ],
  "warnings": [
    { "message": "..." }
  ],
  "previewUrl": "https://...",
  "buildTimeMs": 45000
}
```

---

## Codex (OpenAI) — Default Executor

Codex is the default build executor.

### Setup

```env
OPENAI_API_KEY=sk-...
CODEX_MODEL=codex-mini-latest
```

### How Mission Control Calls Codex

```typescript
// src/lib/executor/codex.ts
export async function runCodexBuild(spec: BuildSpec): Promise<ExecutorResult> {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.CODEX_MODEL ?? "codex-mini-latest",
      input: buildCodexPrompt(spec),
      tools: [{ type: "shell" }, { type: "text_editor" }],
    }),
  });
  // parse and return ExecutorResult
}
```

### Codex Prompt Pattern

```
You are a senior web developer executing a locked build specification.

DO NOT deviate from the spec.
DO NOT make design decisions.
DO NOT add features not in the spec.

Build exactly what the spec says.
Return the list of files created or modified.

BUILD SPEC:
---
[full build-spec.md content]
---

Start building.
```

---

## Claude Code — Alternative Executor

Claude Code can act as an executor when running locally with operator supervision.

### When to Use

- Operator prefers Claude Code for specific builds
- Local build with file system access needed
- Complex framework integration requiring interactive debugging

### Interface

Mission Control writes the build spec to a temp file and hands off to the operator:
```
Build spec locked.
Write to: builds/[buildId]/build-spec.md
Run Claude Code against this spec.
Return executor output JSON when complete.
```

No automated Claude Code spawning from the browser. The operator triggers Claude Code manually.

---

## OpenCode — Open Source Executor

OpenCode is the open-source alternative to Codex.

### Setup

```env
OPENCODE_ENDPOINT=http://localhost:3001  # or hosted endpoint
OPENCODE_API_KEY=...                    # if auth required
```

### Interface

Same input/output contract as Codex. Mission Control routes to OpenCode if `OPENCODE_ENDPOINT` is set.

---

## Custom Executor

Any executor can be wired by implementing the executor interface contract.

```env
EXECUTOR_TYPE=custom
EXECUTOR_ENDPOINT=https://your-executor.com/build
EXECUTOR_API_KEY=...
```

Mission Control POSTs the build input JSON to `EXECUTOR_ENDPOINT` and expects the executor output JSON in return.

---

## Executor Selection Logic

```typescript
function getExecutor(): "codex" | "claude" | "opencode" | "custom" {
  if (process.env.EXECUTOR_TYPE === "custom") return "custom";
  if (process.env.OPENCODE_ENDPOINT) return "opencode";
  if (process.env.OPENAI_API_KEY) return "codex";
  return "claude"; // fallback: operator-supervised
}
```

---

## Hidden Executor Interface in Mission Control UI

The executor interface in the Mission Control UI is a collapsed panel.
It is not shown to clients.
It is only visible to the operator.

It shows:
- Executor type (Codex / Claude / OpenCode / Custom)
- Build status
- Changed files summary (expandable)
- Errors and warnings (highlighted)
- Build time
- Raw executor log (collapsed by default)

The operator can:
- Retry a failed build
- Override executor type for the next build
- Copy the build spec to clipboard for manual executor use
