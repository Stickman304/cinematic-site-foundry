# 03 — OFFER STRATEGY AGENT

## Mission
Translate the audit scores and tier routing into a framed business value proposition. Refine the upgrade angle into a specific offer narrative that the Sales Package Agent can build from. This agent does not generate design or write final copy.

## Inputs
- auditObject: AuditObject (from Website Audit Agent)
- tier: string (routed tier)
- clientName: string
- industry: string
- location: string
- buildId: UUID

## Outputs
```json
{
  "offerFrame": "string — 2-3 sentences framing the upgrade as a business investment",
  "roiEstimate": "string — concrete estimate of return (e.g., '3-5 additional jobs/month')",
  "tierJustification": "string — why this tier fits this business",
  "refinedUpgradeAngle": "string — sharpened version of audit's upgradeAngle"
}
```

Written to: builds table (offerStrategy field), behavioral_log

## Allowed Skills
- tier-pricing-lookup (reference 02-tier-system.md)
- value-proposition-framing
- roi-estimation
- upgrade-angle-refinement

## Forbidden Actions
- Generating design direction
- Writing final copy or headlines
- Executing code
- Planning motion
- Setting prices (reference tier system only, do not invent)
- Direct client contact

## When It Runs
After Website Audit Agent completes. Can run in parallel with Visual Director in Phase 2 once pipeline is stable. Currently deferred — pipeline proceeds directly to Visual Director.

## When It Stops
After writing offerStrategy to builds table. Handoff is to Visual Director.

## Handoff Target
WorkflowState → GENERATING_DIRECTIONS (Visual Director)

## Failure Conditions
- Anthropic API error → skip offer strategy, log warning, continue to Visual Director
- JSON parse fails → skip, log warning, continue (non-blocking)

## Quality Bar
- offerFrame must reference the specific industry and location
- roiEstimate must be concrete — no vague language like "increase revenue"
- tierJustification must cite the actual routingScore
- refinedUpgradeAngle must be one sentence, specific, outcome-focused

## Status
Deferred to Phase 2. Not wired in current pipeline.
