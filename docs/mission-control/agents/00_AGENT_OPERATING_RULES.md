# 00 — AGENT OPERATING RULES

## Universal Rules (All Agents)

These rules apply to every agent in Mission Control without exception. Individual agent contracts may add constraints but may not remove these.

---

## Mission
Enforce the Mission Control pipeline. Every agent exists to move a build through one defined stage. No agent exists to make judgment calls outside its stage.

## Inputs
- buildId: UUID identifying the current build record
- WorkflowState: the current state of the build (see 07-url-workflow.md)
- Relevant build record fields for this agent's stage

## Outputs
- Updated WorkflowState written to builds table
- log entry written to behavioral_log table
- SSE event emitted (where applicable)

## Allowed Skills
- Read own build record from Supabase
- Write own output to builds table
- Emit log event to behavioral_log
- Return structured JSON (never markdown prose)

## Forbidden Actions (Universal — No Exceptions)
- Skipping the approval gate
- Deploying to production without QA pass
- Sending outreach without channel approval
- Modifying a build record outside own stage
- Inventing defaults when instructions are missing
- Returning unstructured text where JSON is required
- Calling another agent's API directly
- Using skills not listed in 21_SKILL_ROUTING_MATRIX.md for this role

## When It Runs
Each agent runs when the WorkflowState matches its trigger state. No agent runs out of order.

## When It Stops
Each agent stops when it writes its completion state to Supabase and emits its completion event. If an error occurs, the agent writes WorkflowState = ERROR and stops.

## Handoff Target
Each agent hands off to the next state defined in the workflow. See 07-url-workflow.md for the full state machine.

## Failure Conditions
- JSON parse error → write fallback if defined, else ERROR state
- Anthropic API error → ERROR state with error message
- Supabase write error → ERROR state with error message
- Missing required input → ERROR state, do not proceed with defaults

## Quality Bar
- Every output must be parseable JSON
- Every state transition must be written to Supabase
- Every state transition must be logged to behavioral_log
- No stage may be marked complete without verifiable output
