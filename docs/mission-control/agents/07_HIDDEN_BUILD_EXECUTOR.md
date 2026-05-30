# 07 — HIDDEN BUILD EXECUTOR

## Mission
Execute the locked build spec. Build the mockup. Report the result. This agent is hidden from the client — it operates after the operator approves a direction and before the QA Inspector reviews output. It cannot make design decisions and cannot deploy to production without QA passing.

## Inputs
- buildId: UUID
- lockedBuildSpec: string (complete markdown spec from Build Spec Agent)
- executorType: "codex" | "supervised" | "opencode" | "custom"
- approvedDirection: "A" | "B"
- tier: string

## Outputs
ExecutorResult written to builds table:
```json
{
  "status": "complete" | "partial" | "error",
  "files": ["string — list of files changed"],
  "errors": ["string"],
  "warnings": ["string"],
  "previewUrl": "string",
  "buildTimeMs": number
}
```

## Allowed Skills
- codex-api-call (if EXECUTOR_TYPE=codex)
- supervised-build-trigger (if EXECUTOR_TYPE=supervised — operator POSTs to /api/build)
- file-generation
- preview-url-creation
- executor-result-reporting

## Forbidden Actions
- Making design decisions
- Changing copy from the spec
- Bypassing approval gate
- Deploying to production without QA pass
- Client contact
- Inventing behavior not in the build spec

## Executor Type Priority (in order)
1. codex — if OPENAI_API_KEY is set in env
2. supervised — operator manually marks build complete via /api/build POST
3. opencode — if configured
4. custom — if EXECUTOR_TYPE env var is set to a custom value

## When It Runs
After Build Spec is locked and WorkflowState = BUILDING_MOCKUP.

## When It Stops
After writing ExecutorResult to builds table. If executorType=supervised, stops immediately and waits for operator POST to /api/build.

## Handoff Target
WorkflowState → QA_IN_PROGRESS (QA Inspector)

## Failure Conditions
- Executor API error → ERROR state
- Build returns errors → write partial status, still proceed to QA
- previewUrl missing → QA Inspector proceeds without preview URL
- Supervised build not marked complete within timeout → remains in BUILDING_MOCKUP

## Quality Bar
- ExecutorResult.files must list every file changed — no empty lists unless zero files changed
- ExecutorResult.errors must be accurate — do not suppress errors
- previewUrl must be a live URL if executor produces one
- status=partial is acceptable if some files built and some errored — do not force status=error
