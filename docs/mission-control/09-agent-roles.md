# Mission Control — Agent Roles

## Role Separation

Mission Control has a strict separation between roles.
Every agent has a defined job and must not cross into another agent's territory.

---

## Mission Control (Orchestrator)

**What it owns:**
- Workflow orchestration
- Audit object generation
- Tier routing
- Creative direction generation
- Build spec locking
- Approval gate management
- QA scoring
- Sales package drafting
- Outreach approval

**What it does not do:**
- Build websites
- Write production code
- Make design decisions without direction artifacts
- Send outreach without approval

**Tool access:**
- Firecrawl (website scrape)
- Anthropic API (audit, directions, copy)
- Supabase (all state writes)
- Netlify API (deploy only after approval)

---

## The Executor (Build Agent)

**Type options:**
- Codex (OpenAI) — default
- Claude Code — alternative
- OpenCode — open source alternative
- Custom / self-hosted — operator-defined

**What it does:**
- Receives the locked build spec
- Builds the website
- Returns changed files summary
- Returns errors and warnings

**What it does not do:**
- Make design decisions
- Override the build spec
- Choose the tier
- Contact the client

**Interface:**
- Receives: locked build-spec.md (full spec)
- Returns: `{ files: [...], errors: [...], warnings: [...] }`

---

## The Auditor (Anthropic)

**What it does:**
- Reads scraped website content
- Generates audit object
- Scores website, opportunity, sellability
- Identifies top problems
- Recommends tier

**Input:**
- Firecrawl markdown output
- Client context (name, notes, tier if operator-specified)

**Output:**
```json
{
  "websiteScore": 0-100,
  "opportunityScore": 0-100,
  "sellabilityScore": 0-100,
  "topProblems": ["...", "..."],
  "recommendedTier": "tier1|tier2|tier3|tier4",
  "upgradeAngle": "..."
}
```

---

## The Designer (Anthropic)

**What it does:**
- Reads audit object
- Reads Visual Language Bible rules (19-visual-language-bible.md)
- Reads no-slop rules
- Generates Direction A and Direction B
- Generates all 6 artifacts per direction

**What it does not do:**
- Invent design rules
- Ignore the Visual Language Bible
- Default to generic patterns

**Output per direction:**
- design-system.md
- creative-direction.md
- anti-slop-rules.md
- copy-brief.md
- motion-plan.md
- build-spec.md

---

## The QA Scorer (Anthropic)

**What it does:**
- Reviews the built site output against the locked build spec
- Scores 10 QA dimensions
- Returns pass/fail per dimension
- Returns overall score
- Returns fix recommendations for failing dimensions

**Input:**
- Locked build spec
- Executor output (files summary, screenshots if available)
- QA scorecard rubric (from 13-qa-scorecard.md)

**Output:**
```json
{
  "dimensions": {
    "visualTaste": 0-100,
    "mobileExperience": 0-100,
    "ctaStrength": 0-100,
    "copyQuality": 0-100,
    "trustArchitecture": 0-100,
    "performanceRisk": 0-100,
    "brandPerception": 0-100,
    "motionQuality": 0-100,
    "seoFoundation": 0-100,
    "codeMaintainability": 0-100
  },
  "finalScore": 0-100,
  "pass": true|false,
  "failingDimensions": [...],
  "recommendations": [...]
}
```

---

## The Sales Agent (Anthropic)

**What it does:**
- Reads audit object
- Reads client profile
- Reads approved direction
- Generates sales package:
  - Pitch email
  - SMS
  - Call script
  - Proposal summary
  - Before/after framing

**What it does not do:**
- Send anything
- Alter approved creative direction
- Make promises about price without operator review

---

## Role Boundaries — Hard Rules

1. Mission Control does not build. The executor builds.
2. The executor does not design. Mission Control designs.
3. The sales agent does not send. The operator sends.
4. No agent overrides an approval gate.
5. Anthropic is the intelligence layer. It audits, designs, scores, and writes copy.
6. Firecrawl is the eyes. It scrapes.
7. Supabase is the log. It records.
8. Netlify is the deploy target. It hosts.
