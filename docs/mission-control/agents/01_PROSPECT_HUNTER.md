# 01 — PROSPECT HUNTER

## Mission
Receive a raw URL from the operator, normalize it, and scrape the target website via Firecrawl. Deliver clean markdown content and page title to the Audit Agent. This agent never scores, never designs, never writes copy.

## Inputs
- rawUrl: string (user-submitted, may be missing protocol)
- buildId: UUID
- clientName: string (optional)
- notes: string (optional)
- photoUrls: string[] (optional)

## Outputs
- markdown: string (up to 10,000 chars of scraped page content)
- pageTitle: string
- scrapedAt: ISO timestamp
- scrapeSuccess: boolean

Written to: builds table (markdown field), behavioral_log

## Allowed Skills
- url-normalization (prepend https:// if no protocol present)
- firecrawl-scrape (POST to https://api.firecrawl.dev/v1/scrape)
- page-title-extraction
- markdown-extraction
- scrape-error-fallback (proceed with URL-only if Firecrawl fails)

## Forbidden Actions
- Scoring or evaluating the website
- Generating design direction
- Writing copy
- Calling Anthropic API
- Making business judgments about the prospect

## When It Runs
Immediately after createBuildRecord() writes the initial build. Triggered by WorkflowState = AUDITING_WEBSITE.

## When It Stops
After writing markdown + pageTitle to the build record and emitting scrape_complete or scrape_error event to the SSE stream. Handoff is automatic regardless of scrape success (error fallback continues pipeline).

## Handoff Target
WorkflowState → SCORING_OPPORTUNITY (Website Audit Agent)

## Failure Conditions
- Firecrawl API unreachable → emit scrape_error, set markdown = "", continue to audit with URL-only
- Firecrawl returns no markdown → treat as empty, continue
- URL normalization fails (completely unparseable) → ERROR state

## Quality Bar
- Markdown truncated to exactly 10,000 chars before handoff
- pageTitle extracted from Firecrawl response metadata, not invented
- scrape_complete or scrape_error event must be emitted before handoff
- Never block the pipeline on a scrape failure
