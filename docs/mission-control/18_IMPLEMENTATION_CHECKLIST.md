# 18 — IMPLEMENTATION CHECKLIST

## 13-Phase Mission Control Build Checklist

Every item must be checked before the pipeline is considered production-ready. No phase is skippable.

---

### Phase 01 — Docs Foundation
- [ ] 01-doctrine.md committed
- [ ] 02-tier-system.md committed
- [ ] 03-build-engine.md committed
- [ ] 04-foundation-rules.md committed
- [ ] 05-motion-rules.md committed
- [ ] 06-quality-gates.md committed
- [ ] 07-url-workflow.md committed
- [ ] 08-build-spec-template.md committed
- [ ] 09-agent-roles.md committed
- [ ] 10-no-slop-rules.md committed
- [ ] 11-local-business-conversion.md committed
- [ ] 12-tier-routing-matrix.md committed
- [ ] 13-qa-scorecard.md committed
- [ ] 14-sales-package-generator.md committed
- [ ] 15-hermes-opencode-integration.md committed
- [ ] 16-executor-policy.md committed
- [ ] 17-codex-handoff.md committed
- [ ] 18_IMPLEMENTATION_CHECKLIST.md committed
- [ ] 19-visual-language-bible.md committed
- [ ] 20_ECC_INTEGRATION_STRATEGY.md committed
- [ ] 21_SKILL_ROUTING_MATRIX.md committed

---

### Phase 02 — Agent Contracts
- [ ] agents/00_AGENT_OPERATING_RULES.md committed
- [ ] agents/01_PROSPECT_HUNTER.md committed
- [ ] agents/02_WEBSITE_AUDIT_AGENT.md committed
- [ ] agents/03_OFFER_STRATEGY_AGENT.md committed
- [ ] agents/04_VISUAL_DIRECTOR.md committed
- [ ] agents/05_MOTION_DIRECTOR.md committed
- [ ] agents/06_BUILD_SPEC_AGENT.md committed
- [ ] agents/07_HIDDEN_BUILD_EXECUTOR.md committed
- [ ] agents/08_QA_INSPECTOR.md committed
- [ ] agents/09_SALES_PACKAGE_AGENT.md committed
- [ ] agents/10_HERMES_MEMORY_OPERATOR.md committed
- [ ] agents/11_OPENCLAW_APPROVAL_GATEWAY.md committed

---

### Phase 03 — Supabase Schema
- [ ] behavioral_log table exists with correct columns
- [ ] builds table exists with all JSONB columns
- [ ] RLS: anon read allowed
- [ ] RLS: service role write allowed
- [ ] migrations.sql committed

---

### Phase 04 — Environment Variables
- [ ] ANTHROPIC_API_KEY set in Vercel
- [ ] NEXT_PUBLIC_SUPABASE_URL set in Vercel
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY set in Vercel
- [ ] SUPABASE_SERVICE_ROLE_KEY set in Vercel
- [ ] FIRECRAWL_API_KEY set in Vercel
- [ ] EXECUTOR_TYPE set (codex | supervised | opencode | custom)
- [ ] OPENAI_API_KEY set if EXECUTOR_TYPE=codex

---

### Phase 05 — URL Intake
- [ ] /api/launch POST accepts { tier, url, clientName, notes, photoUrls }
- [ ] URL normalized (https:// prepended if missing)
- [ ] SSE stream opens immediately on POST
- [ ] buildId returned in stream within 500ms
- [ ] createBuildRecord() called before any Anthropic calls
- [ ] State written to builds table at every stage transition

---

### Phase 06 — Firecrawl Scrape
- [ ] scrapeUrl() hits https://api.firecrawl.dev/v1/scrape
- [ ] Returns { markdown, title }
- [ ] Error fallback: proceeds with URL-only if Firecrawl fails
- [ ] Scrape result truncated to 10,000 chars before Anthropic call
- [ ] scrape_complete or scrape_error event emitted to SSE stream

---

### Phase 07 — Audit Object
- [ ] Anthropic call returns ONLY valid JSON (no markdown, no explanation)
- [ ] AuditObject shape validated: websiteScore, opportunityScore, sellabilityScore, topProblems, recommendedTier, upgradeAngle
- [ ] Tier routing formula applied: routingScore = (opportunityScore×0.5 + sellabilityScore×0.5)
- [ ] Fallback AuditObject used if JSON parse fails
- [ ] auditObject written to builds table
- [ ] audit_complete event emitted with scores

---

### Phase 08 — Two Directions
- [ ] Anthropic call returns { directionA, directionB } as valid JSON
- [ ] Each direction has: id, name, concept, heroHeadline, heroSubheadline, visualFeel, keyDifferentiator, gradientType, heroLayout
- [ ] Each direction has artifacts: designSystem, creativeDirection, antiSlopRules, copyBrief, motionPlan, buildSpec
- [ ] gradientType constrained to approved list (6 options)
- [ ] heroLayout constrained to approved list (5 options)
- [ ] Visual Language Bible rules referenced in system prompt
- [ ] No Inter font without justification
- [ ] No generic purple/blue neon AI gradients
- [ ] Industry recipes applied
- [ ] Fallback directions used if JSON parse fails
- [ ] Both directions written to builds table
- [ ] State set to WAITING_FOR_APPROVAL

---

### Phase 09 — Approval Gate
- [ ] /api/approve POST accepts { buildId, direction: "A" | "B" }
- [ ] Only proceeds if workflowState is WAITING_FOR_APPROVAL
- [ ] Chosen direction locked to lockedBuildSpec
- [ ] State set to LOCKING_BUILD_SPEC then BUILDING_MOCKUP
- [ ] executorType detected from env
- [ ] If codex: runQA() called automatically
- [ ] If supervised: instructions returned for operator

---

### Phase 10 — QA Scorecard
- [ ] QA Anthropic call uses qa-scorer role constraints
- [ ] All 10 dimensions returned with score + pass + notes
- [ ] Minimum scores enforced (see 13-qa-scorecard.md)
- [ ] finalScore = average of all dimensions
- [ ] pass = true only if ALL dimensions meet minimums
- [ ] failingDimensions list populated
- [ ] qaScorecard written to builds table
- [ ] State set to PREVIEW_READY on pass

---

### Phase 11 — Sales Package
- [ ] Sales Anthropic call uses sales-agent role constraints
- [ ] pitchEmail under 200 words
- [ ] sms under 160 characters
- [ ] callScript has opening, if-yes, close sections
- [ ] proposalSummary is one page
- [ ] beforeAfterFraming populated
- [ ] approved object initialized to all false
- [ ] salesPackage written to builds table
- [ ] State set to OUTREACH_DRAFTED

---

### Phase 12 — Channel Approval
- [ ] /api/build PATCH accepts { buildId, channel }
- [ ] channel ∈ { email, sms, callScript, proposal }
- [ ] Each channel approved independently
- [ ] approved object updated in salesPackage
- [ ] No outreach sent without approval flag = true
- [ ] State remains WAITING_FOR_SEND_APPROVAL until operator sends

---

### Phase 13 — Hardening
- [ ] All Anthropic system prompts reference skill routing matrix constraints
- [ ] No agent system prompt exceeds its allowed skill list
- [ ] All 13 agent contract files committed to agents/
- [ ] Pipeline tested end-to-end with a real URL
- [ ] Error states handled at every stage transition
- [ ] All SSE events have { buildId, agent, action, detail, ts }
- [ ] Cost tracked per Anthropic call, summed to totalCost
- [ ] Supabase behavioral_log entries written at every state change
- [ ] No TODO comments in production code
- [ ] Vercel deployment successful with all env vars set
