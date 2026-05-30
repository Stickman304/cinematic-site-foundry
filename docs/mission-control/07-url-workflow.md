# Mission Control — URL Workflow

The URL is the entry point for every build. This document defines what happens from the moment a URL is entered.

---

## Input

The operator provides:

| Field | Required | Notes |
|---|---|---|
| `url` | Yes | Client website URL |
| `clientName` | No | Business name (auto-extracted from site if not provided) |
| `tier` | No | Override if known; auto-routed from audit if not |
| `notes` | No | Special instructions, brand notes, target audience |
| `photoUrls` | No | Client-supplied photos uploaded via Mission Control |

---

## Step 1: URL Validation

Before any API call:

1. Strip whitespace from URL
2. Validate URL format (must include protocol: `http://` or `https://`)
3. If no protocol, prepend `https://`
4. Do not call Firecrawl until URL is valid

Validation errors surface immediately to the operator — no waiting.

---

## Step 2: Build ID Assignment

On valid URL:
1. Generate `buildId` = `crypto.randomUUID()`
2. Log initial event to Supabase:

```json
{
  "agent": "mission-control",
  "action": "build started",
  "build_id": "<buildId>",
  "client_name": "<clientName or 'unknown'>",
  "status": "URL_RECEIVED"
}
```

3. Redirect operator to `/activity?buildId=<buildId>`

---

## Step 3: Firecrawl Audit

Firecrawl scrapes the client URL:

```
POST https://api.firecrawl.dev/v1/scrape
{
  "url": "<client url>",
  "formats": ["markdown", "html"]
}
```

Extracted fields:
- `title` — page title
- `description` — meta description
- `content` — HTML content
- `markdown` — clean markdown version

Log `AUDITING_WEBSITE` to Supabase.

**If Firecrawl fails:**
- Log error to Supabase with `status: "error"`
- Surface error to operator
- Build holds

---

## Step 4: Audit Object Generation

Anthropic receives the scraped markdown and generates:

```json
{
  "websiteScore": 0-100,
  "opportunityScore": 0-100,
  "sellabilityScore": 0-100,
  "topProblems": [
    "No mobile CTA above fold",
    "No trust proof visible",
    "Generic stock photography"
  ],
  "recommendedTier": "tier1|tier2|tier3|tier4",
  "upgradeAngle": "Premium roofing company with 15-year track record deserves a site that projects that trust upfront"
}
```

**Scoring definitions:**

- `websiteScore` — How good is the current site? (100 = already excellent)
- `opportunityScore` — How much room is there to improve? (100 = massive gap)
- `sellabilityScore` — How likely is this business to buy a premium upgrade? (100 = obvious yes)

Log `SCORING_OPPORTUNITY` to Supabase with audit object.

---

## Step 5: Tier Routing

If operator did not specify a tier:

| Score | Recommended Tier |
|---|---|
| opportunityScore 0–30 | tier1 |
| opportunityScore 31–55 | tier2 |
| opportunityScore 56–75 | tier3 |
| opportunityScore 76–100 | tier4 |

Operator always overrides.

---

## Step 6: Two-Direction Generation

Anthropic generates Direction A and Direction B.

Each direction is a complete creative brief containing:
- `design-system.md`
- `creative-direction.md`
- `anti-slop-rules.md`
- `copy-brief.md`
- `motion-plan.md`
- `build-spec.md`

Log `GENERATING_DIRECTIONS` to Supabase.

---

## Step 7: Approval Gate

Both directions presented to operator in Mission Control UI.
Operator reviews and clicks Approve on one.

Log `WAITING_FOR_APPROVAL` to Supabase.

No further action until approval received.

---

## Prospect Storage

Each URL intake creates a prospect record:

```json
{
  "buildId": "uuid",
  "url": "https://example.com",
  "clientName": "Example Roofing",
  "scrapedTitle": "Example Roofing — Cleveland OH",
  "auditObject": {...},
  "recommendedTier": "tier2",
  "operatorTier": null,
  "status": "WAITING_FOR_APPROVAL",
  "createdAt": "ISO timestamp"
}
```

This record follows the build through every state transition.
