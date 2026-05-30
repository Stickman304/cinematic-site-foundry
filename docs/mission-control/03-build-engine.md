# Mission Control — Build Engine

## Architecture

```
Browser
  → /api/launch (Next.js serverless)
  → Firecrawl (website scrape)
  → Anthropic API (audit + directions)
  → Supabase (behavioral_log)
  → Executor (Codex / Claude Code / OpenCode / custom)
  → Netlify (deploy)
```

No VPS. No Claude Code in the browser. No copy-paste. Every step is server-side.

## Workflow States

The pipeline tracks every build through the following states:

```
URL_RECEIVED
AUDITING_WEBSITE
SCORING_OPPORTUNITY
GENERATING_DIRECTIONS
WAITING_FOR_APPROVAL
LOCKING_BUILD_SPEC
BUILDING_MOCKUP
QA_IN_PROGRESS
PREVIEW_READY
OUTREACH_DRAFTED
WAITING_FOR_SEND_APPROVAL
COMPLETE
ERROR
```

State is written to `behavioral_log.status` on every transition.

## Pipeline Stages

### Stage 1: URL Intake

Input: `{ url, clientName?, tier?, notes?, photoUrls? }`

Actions:
1. Validate URL format
2. Assign `buildId` (UUID)
3. Log `URL_RECEIVED` to Supabase
4. Return `buildId` to browser

### Stage 2: Website Audit (Firecrawl)

Actions:
1. Scrape client URL via Firecrawl REST API
2. Extract: title, description, content, markdown
3. Build audit prompt for Anthropic
4. Log `AUDITING_WEBSITE` to Supabase

### Stage 3: Opportunity Scoring (Anthropic)

Input: Scraped markdown + client context

Anthropic generates the audit object:
```json
{
  "websiteScore": 0-100,
  "opportunityScore": 0-100,
  "sellabilityScore": 0-100,
  "topProblems": ["...", "...", "..."],
  "recommendedTier": "tier1|tier2|tier3|tier4",
  "upgradeAngle": "..."
}
```

Log `SCORING_OPPORTUNITY` to Supabase.

### Stage 4: Direction Generation (Anthropic)

Generates two complete creative directions:

**Direction A — Safe Premium**  
Elevated version of the business's existing identity.

**Direction B — Bold Premium**  
Distinctive approach that makes them stand out.

Each direction includes:
- design-system.md
- creative-direction.md
- anti-slop-rules.md
- copy-brief.md
- motion-plan.md
- build-spec.md

Log `GENERATING_DIRECTIONS` to Supabase.

### Stage 5: Approval Gate

Operator reviews both directions in Mission Control UI.
Nothing is built until one direction is approved.

Log `WAITING_FOR_APPROVAL` to Supabase.

### Stage 6: Build Spec Lock

Approved direction is locked into a final build spec.
No further changes accepted after lock.

Log `LOCKING_BUILD_SPEC` to Supabase.

### Stage 7: Executor Build

Locked build spec sent to executor via hidden interface.
Executor: Codex / Claude Code / OpenCode / custom.

Executor returns:
- Changed files summary
- Errors / warnings

Log `BUILDING_MOCKUP` to Supabase.

### Stage 8: QA Scoring

Automated QA scorecard generated (see `13-qa-scorecard.md`).
Any score below passing threshold holds the build.

Log `QA_IN_PROGRESS` then `PREVIEW_READY` to Supabase.

### Stage 9: Sales Package

Before/after preview generated.
Pitch email, SMS, call script, and proposal summary drafted.
Operator must approve before any outreach is sent.

Log `OUTREACH_DRAFTED` then `WAITING_FOR_SEND_APPROVAL` to Supabase.

### Stage 10: Deploy (on approval)

Site deployed to Netlify via API.
Log `COMPLETE` to Supabase.

## Cost Tracking

Every Anthropic API call logs:
- `inputTokens`
- `outputTokens`
- `cost` = `(inputTokens/1M)*3 + (outputTokens/1M)*15`

Cumulative cost shown in Mission Control Activity feed.

## Error Handling

All errors logged to Supabase with `status: "error"`.
Operator notified in Activity feed.
Build held; no automatic retry.
