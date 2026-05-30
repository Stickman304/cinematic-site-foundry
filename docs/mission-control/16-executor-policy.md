# Mission Control — Executor Policy

Mission Control supports hidden executors. The executor's only job is to build what the locked build spec says. Mission Control is the product. The executor is the implementation worker.

---

## Approved Executor Types

| Type | Description | Status |
|---|---|---|
| supervised | Operator manually provides previewUrl via POST /api/build | Active — default |
| mock | Returns a fake successful result for testing | Active |
| codex | Codex/OpenAI Responses API hidden build executor | Active — requires OPENAI_API_KEY |

**Claude Code is not the Mission Control runtime executor.**
Claude Code may be used only as a temporary repo setup and development assistant outside the Mission Control runtime. It is not invoked during any build pipeline step.

---

## Executor Selection

`EXECUTOR_TYPE` environment variable controls which executor runs:

```
EXECUTOR_TYPE=supervised   → operator-supervised mode
EXECUTOR_TYPE=mock         → mock executor (testing only)
EXECUTOR_TYPE=codex        → Codex/OpenAI hidden executor
```

If `EXECUTOR_TYPE` is not set:
- If `OPENAI_API_KEY` is present → defaults to `codex`
- Otherwise → defaults to `supervised`

---

## What the Executor Must Obey

All executors must obey:
- The locked build spec (from 08-build-spec-template.md)
- The approved direction (A or B — set at approval gate, never changed by executor)
- No-slop rules (from 10-no-slop-rules.md)
- Visual Language Bible (from 19-visual-language-bible.md)
- Skill routing matrix (from 21_SKILL_ROUTING_MATRIX.md — executor role is Agent 07)
- QA scorecard minimums (enforced by QA Inspector after executor completes)
- Approval gates (executor cannot deploy to production; that requires operator action)

---

## What the Executor Must Not Do

1. Make design decisions
2. Choose fonts, colors, or layouts not in the spec
3. Add features not in the spec
4. Remove features from the spec
5. Send outreach of any kind
6. Deploy to production without operator approval
7. Delete project files without explicit approval
8. Commit or push git changes without operator approval
9. Make outbound API calls not listed in the build spec
10. Create files outside the site build scope

---

## What Mission Control Sends to the Executor

Mission Control sends via `ExecutorInput`:
1. buildId
2. approvedDirection (A or B)
3. tier
4. clientName and photoUrls
5. Locked artifacts: buildSpec, designSystem, creativeDirection, antiSlopRules, copyBrief, motionPlan
6. acceptanceCriteria (if set)
7. targetFramework (if set)

Mission Control never sends:
- Raw API keys in executor prompts
- Personal client contact information
- Pricing information

---

## Executor Workflow States

```
LOCKING_BUILD_SPEC
  → READY_FOR_EXECUTOR
    → EXECUTOR_RUNNING / BUILDING_MOCKUP (UI label)
      → EXECUTOR_COMPLETE → QA_IN_PROGRESS (codex/mock)
      → BUILDING_MOCKUP   (supervised — waits for operator POST /api/build)
      → EXECUTOR_FAILED   (error — no QA)
```

---

## Supervised Mode (Active)

Supervised mode is the default when Codex is not configured.

1. Operator approves direction → Mission Control locks build spec
2. Mission Control sets `BUILDING_MOCKUP`, returns build spec + instructions
3. Operator takes the spec to their executor of choice (manual, external tool, etc.)
4. When build is ready: POST `/api/build` with `{ buildId, previewUrl, filesChanged, errors }`
5. Mission Control transitions to `QA_IN_PROGRESS`
6. QA runs → Sales Package generates → `OUTREACH_DRAFTED`

---

## Codex/OpenAI Mode

1. Operator approves direction → Mission Control locks build spec
2. Mission Control calls `CodexExecutor.run(input)` via the executor adapter
3. CodexExecutor POSTs to OpenAI Responses API with the full handoff prompt
4. On success: transitions to `EXECUTOR_COMPLETE` → `QA_IN_PROGRESS`
5. On failure: transitions to `EXECUTOR_FAILED` — operator reviews

Required env var: `OPENAI_API_KEY`
Optional: `OPENAI_CODEX_MODEL` (default: codex-mini-latest), `OPENAI_EXECUTOR_TIMEOUT_MS`, `OPENAI_EXECUTOR_MAX_RETRIES`

If `OPENAI_API_KEY` is missing, `CodexExecutor` returns `status: "EXECUTOR_FAILED"` with error `"OPENAI_API_KEY is not configured"` — it does not crash the whole workflow.

---

## Raw API Keys — Hard Rule

No raw API keys are ever included in executor prompts.

If the build requires an API key, the build spec references `process.env.VAR_NAME`. The executor writes code that reads from environment variables — never hardcoded.

---

## Executor Timeout Policy

| Tier | Max Build Time |
|---|---|
| Tier 1 | 3 minutes |
| Tier 2 | 5 minutes |
| Tier 3 | 8 minutes |
| Tier 4 | 15 minutes |

Controlled by `OPENAI_EXECUTOR_TIMEOUT_MS` for Codex executor.

---

## Error Handling

### Non-Critical
Warnings that do not block the build → logged to executor output, surfaced in activity panel, do not block QA.

### Critical
Errors that block the build → `EXECUTOR_FAILED` state, operator must review.

---

## Operator Overrides

The operator can:
- Change `EXECUTOR_TYPE` per deployment
- Increase timeout via `OPENAI_EXECUTOR_TIMEOUT_MS`
- Review executor output before QA proceeds (supervised mode)
- Reject executor output and send back for revision

The operator cannot:
- Bypass the locked build spec
- Allow executor to send outreach
- Allow executor to deploy to production without the approval gate

---

## Executor Security Review

Before any new executor type is added to Mission Control:

1. Review what file system access the executor has
2. Confirm executor cannot read files outside the build directory
3. Confirm executor cannot make outbound requests not in the build spec
4. Confirm executor returns structured JSON via `ExecutorOutput` type
5. Confirm `failResult()` is implemented for graceful failure
