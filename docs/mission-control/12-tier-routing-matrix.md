# Mission Control — Tier Routing Matrix

The tier routing matrix converts audit scores into a tier recommendation.

The operator always has override authority.

---

## Primary Scoring Dimensions

| Dimension | Weight | What It Measures |
|---|---|---|
| `websiteScore` | Supporting | Quality of current site (lower = worse current site) |
| `opportunityScore` | 50% | How much room to improve |
| `sellabilityScore` | 50% | How likely the business is to invest in an upgrade |

**Routing Score** = `(opportunityScore * 0.5) + (sellabilityScore * 0.5)`

---

## Routing Table

| Routing Score | Recommended Tier | Reasoning |
|---|---|---|
| 0–30 | Tier 1 | Low opportunity or low likelihood to invest |
| 31–55 | Tier 2 | Solid opportunity, business likely needs motion upgrade |
| 56–75 | Tier 3 | Strong opportunity, premium brand positioning justified |
| 76–100 | Tier 4 | High opportunity, business has budget and complexity |

---

## Secondary Factors That Adjust Tier

These factors can push the recommendation up or down by one tier:

### Push Up One Tier

- Business has multiple locations → +1
- Industry has strong competition in local market → +1
- Client URL shows existing investment in design (not DIY) → +1
- Business is in a high-ticket service category (survey, HVAC, assisted living, trucking) → +1
- Operator notes indicate client has budget → +1

Cap: max Tier 4.

### Push Down One Tier

- Business is single-person operation with very low pricing → -1
- Current site is completely broken (no content to audit) → -1
- Industry has very low willingness to invest in web (e.g., cash-only sole proprietors) → -1

Floor: min Tier 1.

---

## Industry Default Tier Guidance

Starting point if audit data is thin:

| Industry | Default Tier |
|---|---|
| Roofing | Tier 2 |
| HVAC | Tier 2 |
| Plumbing | Tier 1–2 |
| Electrician | Tier 1–2 |
| Concrete | Tier 1–2 |
| Land clearing | Tier 1–2 |
| Landscaping | Tier 1–2 |
| Tree service | Tier 1–2 |
| Towing | Tier 1 |
| Surveying | Tier 2–3 |
| Trucking / Logistics | Tier 2–3 |
| Assisted living | Tier 2–3 |
| Multi-location contractor | Tier 3–4 |
| Commercial construction | Tier 3–4 |

---

## Tier Routing Logic (Code)

```typescript
function routeTier(audit: AuditObject, operatorTier?: string): Tier {
  if (operatorTier) return operatorTier as Tier;

  const routingScore = (audit.opportunityScore * 0.5) + (audit.sellabilityScore * 0.5);

  if (routingScore <= 30) return "tier1";
  if (routingScore <= 55) return "tier2";
  if (routingScore <= 75) return "tier3";
  return "tier4";
}
```

---

## Tier Routing Presentation to Operator

When the audit is complete, Mission Control presents:

```
AUDIT COMPLETE — [Client Name]

Website Score:     [score]/100 — [low/medium/high quality]
Opportunity Score: [score]/100 — [gap assessment]
Sellability Score: [score]/100 — [investment likelihood]

Top Problems:
• [problem 1]
• [problem 2]
• [problem 3]

Recommended Tier: TIER [X]
Upgrade Angle: [angle statement]

[Override Tier ▼]
[Proceed with Tier [X] →]
```

The operator can override at this point before directions are generated.
