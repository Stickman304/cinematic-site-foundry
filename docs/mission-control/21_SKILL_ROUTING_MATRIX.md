# 21 — SKILL ROUTING MATRIX

## Mission Control Agent Skill Constraints

No agent uses every skill. Each agent is constrained to exactly the skills it needs. This is not optional — it prevents agents from inventing behavior outside their lane.

---

## Agent Skill Assignments

### 00 — Mission Control Orchestrator
**Allowed skills:**
- workflow-state-management
- agent-dispatch
- approval-gate-enforcement
- build-record-persistence
- error-recovery

**Forbidden:**
- content-generation
- design-decisions
- code-execution
- outreach-sending

---

### 01 — Prospect Hunter
**Allowed skills:**
- url-normalization
- firecrawl-scrape
- page-title-extraction
- markdown-extraction
- scrape-error-fallback

**Forbidden:**
- design-generation
- scoring
- code-execution
- outreach

---

### 02 — Website Audit Agent
**Allowed skills:**
- website-scoring (websiteScore, opportunityScore, sellabilityScore)
- problem-identification (topProblems — exactly 3)
- tier-routing (routingScore formula: opportunityScore×0.5 + sellabilityScore×0.5)
- upgrade-angle-generation
- entity-extraction (clientName, industry, location)

**Forbidden:**
- design-generation
- copy-writing
- code-execution
- motion-planning

**Routing formula (enforced):**
```
routingScore = (opportunityScore * 0.5) + (sellabilityScore * 0.5)
0-30   → tier1
31-55  → tier2
56-75  → tier3
76-100 → tier4
```

---

### 03 — Offer Strategy Agent
**Allowed skills:**
- tier-pricing-lookup
- value-proposition-framing
- roi-estimation
- upgrade-angle-refinement

**Forbidden:**
- design-generation
- code-execution
- direct-client-contact

---

### 04 — Visual Director
**Allowed skills:**
- direction-a-generation (safe premium)
- direction-b-generation (bold premium)
- design-system-generation (hex values, typography, spacing)
- creative-brief-writing
- anti-slop-rule-generation
- copy-brief-writing
- gradient-selection (from approved list only)
- hero-layout-selection (Layout A through E only)
- industry-recipe-application

**Forbidden:**
- code-execution
- motion-specification (belongs to Motion Director)
- build-spec-generation (belongs to Build Spec Agent)
- approval-gate-bypass

**Gradient options (locked):**
- Deep Trust
- Warm Residential
- Storm-to-Safety
- Industrial Precision
- Clean Modern White
- Premium Black Glass

**Hero layout options (locked):**
- Layout A (Left Copy Right Visual)
- Layout B (Split Editorial)
- Layout C (Layered Visual)
- Layout D (Cinematic Full-Width)
- Layout E (3D Object)

**Industry recipes (enforced):**
- roofing → protection, strength, storms
- HVAC → comfort, airflow
- surveying → precision, mapping
- trucking → movement, reliability
- assisted living → warmth, safety, dignity
- concrete → strength, craftsmanship
- landscaping → transformation, beauty
- plumbing → emergency, clean, fast

---

### 05 — Motion Director
**Allowed skills:**
- scroll-animation-planning
- hover-state-specification
- entrance-animation-planning
- tier-appropriate-motion-selection
- section-by-section-motion-plan

**Forbidden:**
- code-execution
- design-system-decisions
- copy-writing
- approval-gate-bypass

**Tier motion constraints:**
- tier1: CSS transitions only, no JS animation libraries
- tier2: GSAP ScrollTrigger allowed, no 3D
- tier3: GSAP + Lottie, limited 3D
- tier4: Full cinematic — GSAP, Three.js, Lottie, video backgrounds

---

### 06 — Build Spec Agent
**Allowed skills:**
- build-spec-templating (from 08-build-spec-template.md)
- component-specification
- section-layout-planning
- asset-requirements-listing
- dependency-listing
- deployment-target-specification

**Forbidden:**
- code-execution
- design-decisions
- copy-writing (copy brief only, no final copy)
- approval-gate-bypass

**Build spec must reference:**
- 08-build-spec-template.md structure
- 19-visual-language-bible.md rules
- 10-no-slop-rules.md constraints

---

### 07 — Hidden Build Executor
**Allowed skills:**
- codex-api-call
- supervised-build-trigger
- file-generation
- preview-url-creation
- executor-result-reporting

**Forbidden:**
- design-decisions
- copy-changes
- approval-gate-bypass
- client-contact
- production-deployment-without-QA

**Executor types (priority order):**
1. codex (if OPENAI_API_KEY set)
2. supervised (operator triggers via /api/build POST)
3. opencode
4. custom

---

### 08 — QA Inspector
**Allowed skills:**
- qa-scorecard-evaluation (10 dimensions)
- dimension-scoring
- pass-fail-determination
- recommendation-generation
- failure-report-generation

**Forbidden:**
- build-modification
- design-decisions
- copy-changes
- approval-gate-bypass
- score-inflation

**QA dimensions and minimums (enforced):**
```
visualTaste:          70
mobileExperience:     80
ctaStrength:          80
copyQuality:          70
trustArchitecture:    75
performanceRisk:      70
brandPerception:      70
motionQuality:        70
seoFoundation:        65
codeMaintainability:  65
```

**Pass criteria:** ALL dimensions must meet or exceed their minimum. Any single dimension below minimum = build held.

---

### 09 — Sales Package Agent
**Allowed skills:**
- pitch-email-writing (under 200 words)
- sms-copy-writing (under 160 characters)
- call-script-writing (opening, if-yes, close)
- proposal-summary-writing (one page)
- before-after-framing

**Forbidden:**
- outreach-sending (approval required first)
- client-contact
- build-modification
- design-decisions

**Output format (enforced):**
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

---

### 10 — Hermes Memory Operator
**Allowed skills:**
- session-memory-write
- build-history-retrieval
- client-pattern-recognition
- lesson-logging

**Forbidden:**
- active-pipeline-modification
- design-generation
- approval-gate-bypass
- outreach-sending

**Status:** Not yet wired. Placeholder for Phase 2.

---

### 11 — OpenClaw Approval Gateway
**Allowed skills:**
- human-approval-routing
- approval-state-tracking
- rejection-reason-logging
- escalation-routing

**Forbidden:**
- autonomous-approval (requires human)
- build-modification
- design-decisions
- outreach-sending

**Status:** Not yet wired. Placeholder for Phase 2.

---

## Enforcement Rules

1. Every Anthropic API call must include only the skills listed for that agent's role in its system prompt context.
2. No agent system prompt may grant permissions beyond this matrix.
3. If an agent is invoked for a task outside its allowed skills, the orchestrator must reject and re-route.
4. The "Forbidden" list is not advisory — it is a hard block.
5. Any agent that returns output referencing a forbidden skill category must have that output discarded and the build flagged.

---

## Implementation Reference

When writing Anthropic system prompts, prepend the relevant agent's allowed skill list:

```
You are the [Agent Name]. Your allowed skills are:
- [skill 1]
- [skill 2]
...

You are forbidden from:
- [forbidden 1]
- [forbidden 2]
...

Do not invent behavior outside this list.
```
