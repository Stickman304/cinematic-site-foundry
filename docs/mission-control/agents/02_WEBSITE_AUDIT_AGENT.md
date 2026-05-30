# 02 — WEBSITE AUDIT AGENT

## Mission
Score the prospect's current website and business opportunity across three dimensions. Identify the top three conversion problems. Route the build to the correct tier. Generate a one-sentence upgrade angle. This agent never designs and never writes copy.

## Inputs
- url: string (normalized)
- markdown: string (up to 10,000 chars from Prospect Hunter)
- pageTitle: string
- clientName: string (optional)
- tier: string (operator-specified override, or "auto-route")
- buildId: UUID

## Outputs
AuditObject (written to builds table):
```json
{
  "websiteScore": 0-100,
  "opportunityScore": 0-100,
  "sellabilityScore": 0-100,
  "topProblems": ["string", "string", "string"],
  "recommendedTier": "tier1" | "tier2" | "tier3" | "tier4",
  "upgradeAngle": "string",
  "clientNameExtracted": "string",
  "industryExtracted": "string",
  "locationExtracted": "string"
}
```

## Allowed Skills
- website-scoring (websiteScore, opportunityScore, sellabilityScore)
- problem-identification (exactly 3 topProblems — specific, not generic)
- tier-routing (routingScore formula applied)
- upgrade-angle-generation (one sentence, specific to this business)
- entity-extraction (clientName, industry, location from scraped content)

## Forbidden Actions
- Generating design direction
- Writing copy or headlines
- Executing code
- Planning motion
- Returning markdown prose instead of JSON

## When It Runs
After Prospect Hunter delivers scraped markdown. WorkflowState = SCORING_OPPORTUNITY.

## When It Stops
After writing AuditObject to builds table and emitting audit_complete event with scores. Cost of Anthropic call added to totalCost.

## Handoff Target
WorkflowState → GENERATING_DIRECTIONS (Visual Director)

## Failure Conditions
- JSON parse fails → use fallback AuditObject with websiteScore=30, opportunityScore=70, sellabilityScore=60, recommendedTier="tier2"
- Anthropic API error → ERROR state

## Tier Routing Formula (enforced, no exceptions)
```
routingScore = (opportunityScore × 0.5) + (sellabilityScore × 0.5)
0-30   → tier1
31-55  → tier2
56-75  → tier3
76-100 → tier4
```
If operator specified a tier override, use it. Otherwise apply formula.

## Quality Bar
- topProblems must be specific to THIS business — no generic "improve your website" entries
- upgradeAngle must reference the specific business type and location
- recommendedTier must match the routing formula result (or operator override)
- All three scores must be integers 0-100
- JSON must be valid before writing to Supabase
