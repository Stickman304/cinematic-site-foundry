# 09 — SALES PACKAGE AGENT

## Mission
Generate the complete outreach package for the prospect after the build passes QA. Five deliverables: pitch email, SMS, call script, proposal summary, and before/after framing. Every channel requires operator approval before sending. This agent never sends outreach — it only generates content.

## Inputs
- buildId: UUID
- lockedBuildSpec: string (first 3,000 chars)
- clientName: string
- industry: string
- location: string
- auditObject: AuditObject
- qaScorecard: QAScorecard

## Outputs
SalesPackage written to builds table:
```json
{
  "pitchEmail": "string — full cold email under 200 words",
  "sms": "string — under 160 characters",
  "callScript": "string — opening, if-yes, close",
  "proposalSummary": "string — one page proposal",
  "beforeAfterFraming": "string — before/after comparison text",
  "approved": {
    "email": false,
    "sms": false,
    "callScript": false,
    "proposal": false
  }
}
```

## Allowed Skills
- pitch-email-writing (under 200 words)
- sms-copy-writing (under 160 characters)
- call-script-writing (opening, if-yes, close sections)
- proposal-summary-writing (one page)
- before-after-framing

## Forbidden Actions
- Sending outreach (requires operator approval per channel)
- Client contact
- Modifying the build
- Making design decisions
- Marking any channel as approved=true (initial state always false)

## When It Runs
After QA Inspector writes pass=true. Triggered automatically. WorkflowState = PREVIEW_READY → OUTREACH_DRAFTED.

## When It Stops
After writing SalesPackage to builds table with all approved flags = false. Operator approves channels individually via /api/build PATCH.

## Handoff Target
WorkflowState → OUTREACH_DRAFTED → WAITING_FOR_SEND_APPROVAL

## Failure Conditions
- Anthropic API error → log warning, skip sales package (non-blocking — QA already passed)
- JSON parse fails → log warning, skip sales package (non-blocking)
- Sales package failure does NOT put the build in ERROR state

## Channel Approval Flow
Each channel approved independently:
- PATCH /api/build { buildId, channel: "email" } → approved.email = true
- PATCH /api/build { buildId, channel: "sms" } → approved.sms = true
- PATCH /api/build { buildId, channel: "callScript" } → approved.callScript = true
- PATCH /api/build { buildId, channel: "proposal" } → approved.proposal = true

No outreach sent until operator explicitly approves the channel. Sending is out of scope for current phase.

## Quality Bar
- pitchEmail must reference specific business name, industry, and identified problems
- sms must be under 160 characters (hard limit — truncate if needed)
- callScript must have clear opening, if-yes branch, and close — not a single paragraph
- proposalSummary must reference the actual QA scores as proof of quality
- beforeAfterFraming must reference specific topProblems from the audit
- All approved flags must initialize to false — never true
