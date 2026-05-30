# 11 — OPENCLAW APPROVAL GATEWAY

## Mission
Route approval decisions to the correct human or automated approver. Track approval state. Log rejection reasons. Escalate stalled approvals. This agent never approves autonomously — every approval requires a human signal.

## Inputs
- buildId: UUID
- WorkflowState: current state requiring approval
- approvalType: "direction" | "build" | "channel"
- requestedBy: string (agent requesting approval)

## Outputs
```json
{
  "approvalState": "pending" | "approved" | "rejected",
  "approvedBy": "string",
  "rejectionReason": "string | null",
  "approvedAt": "ISO timestamp | null",
  "escalated": boolean
}
```

## Allowed Skills
- human-approval-routing
- approval-state-tracking
- rejection-reason-logging
- escalation-routing

## Forbidden Actions
- Autonomous approval (requires human signal always)
- Modifying the build
- Making design decisions
- Sending outreach
- Overriding rejection decisions

## Approval Gates in Pipeline
1. Direction approval: operator chooses A or B via /api/approve
2. Build approval: operator marks supervised build complete via /api/build POST
3. Channel approval: operator approves each outreach channel via /api/build PATCH

## When It Runs
When any WorkflowState requires human approval. Currently implemented via direct API routes — OpenClaw is the Phase 2 abstraction layer.

## When It Stops
After writing approval state and emitting approval event.

## Handoff Target
Varies by approval type:
- Direction approved → Build Spec Agent
- Build complete → QA Inspector
- Channel approved → (outreach sending — out of scope for Phase 1)

## Failure Conditions
- Approval request times out → escalated = true, log to behavioral_log
- Rejection with no reason → log reason = "no reason provided", continue

## Quality Bar
- Every approval must have an approvedBy identifier
- Every rejection must have a rejectionReason (or "no reason provided")
- Escalation must fire if approval is not received within configured timeout
- Never mark approved=true without a human signal

## Status
Not yet wired. Direct API routes (/api/approve, /api/build) handle approval for Phase 1. OpenClaw replaces these in Phase 2. Contract locked.
