# Mission Control — Quality Gates

Every build passes through defined quality gates before moving to the next stage.
Gates are not optional. A failed gate holds the build.

---

## Gate 1: URL Validation

**When:** On URL submission

**Pass criteria:**
- Valid URL format
- URL resolves (HTTP 200 or 301/302 to 200)
- Page has readable content (Firecrawl returns markdown)

**Fail action:** Return error to operator. Build does not start.

---

## Gate 2: Audit Quality

**When:** After Anthropic generates audit object

**Pass criteria:**
- `websiteScore` populated (0–100)
- `opportunityScore` populated (0–100)
- `topProblems` has at least 1 item
- `recommendedTier` is one of: tier1, tier2, tier3, tier4
- `upgradeAngle` is non-empty string

**Fail action:** Retry Anthropic call once. If second attempt fails, log error, surface to operator.

---

## Gate 3: Direction Quality

**When:** After two directions generated

**Pass criteria:**
- Direction A present with all 6 artifacts
- Direction B present with all 6 artifacts
- Both directions are distinct (not near-identical)
- Neither direction repeats the audit's identified slop patterns

**Required artifacts per direction:**
- design-system.md
- creative-direction.md
- anti-slop-rules.md
- copy-brief.md
- motion-plan.md
- build-spec.md

**Fail action:** Retry generation once. If still failing quality, surface to operator for manual direction.

---

## Gate 4: Direction Approval

**When:** Operator views both directions

**Pass criteria:**
- Operator explicitly clicks "Approve Direction A" or "Approve Direction B"
- Approval is logged to Supabase with timestamp

**Fail action:** Pipeline waits indefinitely. No timeout. No auto-approval.

---

## Gate 5: Build Spec Lock

**When:** Direction approved

**Pass criteria:**
- Locked build spec written to Supabase
- Executor receives spec confirmation
- Build started

**Fail action:** Log error, surface to operator.

---

## Gate 6: Executor Completion

**When:** Executor finishes build

**Pass criteria:**
- Executor returns changed files summary
- No critical errors in error list
- Build artifact accessible

**Fail action:** Surface errors to operator. No QA or deploy until resolved.

---

## Gate 7: QA Scorecard

**When:** After executor build completes

**Pass criteria (minimum scores):**

| Dimension | Minimum |
|---|---|
| Visual Taste | 70 |
| Mobile Experience | 80 |
| CTA Strength | 80 |
| Copy Quality | 70 |
| Trust Architecture | 75 |
| Performance Risk | 70 |
| Brand Perception | 70 |
| Motion Quality | 70 |
| SEO Foundation | 65 |
| Code Maintainability | 65 |
| **Final Score** | **72** |

**Fail action:** Build flagged. Operator must review. Specific failing dimensions surfaced with fix recommendations.

---

## Gate 8: Preview Approval

**When:** QA passes

**Pass criteria:**
- Operator views preview link
- Operator approves: "Build is ready for outreach"

**Fail action:** Pipeline waits. No outreach generated.

---

## Gate 9: Outreach Approval

**When:** Sales package drafted

**Pass criteria:**
- Operator reviews pitch email, SMS, call script, proposal summary
- Operator explicitly approves each outreach channel before send

**Fail action:** Outreach held. No sends without per-channel approval.

---

## Gate 10: Deploy Approval

**When:** Client agrees to move forward

**Pass criteria:**
- Operator triggers production deploy
- Operator confirms deploy target (domain/Netlify site)

**Fail action:** Site remains on staging. No production deploy without trigger.

---

## Summary Table

| Gate | Stage | Auto or Manual |
|---|---|---|
| 1 | URL validation | Auto |
| 2 | Audit quality | Auto (retry once) |
| 3 | Direction quality | Auto (retry once) |
| 4 | Direction approval | Manual |
| 5 | Build spec lock | Auto |
| 6 | Executor completion | Auto |
| 7 | QA scorecard | Auto (flag on fail) |
| 8 | Preview approval | Manual |
| 9 | Outreach approval | Manual (per channel) |
| 10 | Deploy approval | Manual |
