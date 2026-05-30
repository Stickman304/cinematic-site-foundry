# Mission Control — Foundation Rules

These rules apply to every build at every tier. No exceptions.

---

## 1. URL First

No build starts without a real client URL.
No URL = no audit = no build.

## 2. Audit Before Design

Mission Control audits the client's website before generating any design.
The audit drives the tier, the angle, and the direction.
Designing without auditing is guessing.

## 3. Two Directions Always

Every client gets Direction A and Direction B.
No single direction is presented.
The operator chooses which one to build.

## 4. Approval Gates Hold Everything

Nothing bypasses an approval gate.
- No build without direction approval
- No deploy without build approval
- No outreach without outreach approval

If a gate is not cleared, the pipeline stops and waits.

## 5. Mobile Is Primary

Every site is designed mobile-first.
Desktop is the enhancement, not the target.

Test order:
1. iPhone 390px
2. Android 360px
3. iPad 768px
4. Desktop 1440px

If mobile fails, the build fails.

## 6. CTA Above the Fold Always

On every page, on every device, the primary CTA must be visible above the fold.
Phone number, quote form, or call button must be reachable in under 3 taps on mobile.

## 7. Trust Proof Near the Top

Reviews, ratings, licenses, certifications, years in business, or service area must appear near the top of every page.
Trust proof should be within scroll distance of the hero.

## 8. No Generic AI Design

Do not produce:
- Default Inter font without justification
- Generic purple/blue neon gradients
- Generic centered hero as default
- Random floating cubes
- Fake futuristic UI with no business purpose
- "Solutions for your business" copy
- Stock-photo corporate clichés

Every visual element must connect to the specific business and industry.

## 9. Industry-Specific Visuals

Every business gets visuals tied to their trade.
No cross-industry visual reuse.
A roofing site does not look like an HVAC site.
An assisted living site does not look like a concrete site.

## 10. Performance Is a Feature

Sites must load fast.
- Tier 1: no heavy WebGL
- Tier 2: all animations get a mobile fallback
- Tier 3: static fallback required for 3D hero
- Tier 4: full performance testing before ship

Slow sites do not ship.

## 11. The Five-Second Test

Any visitor should understand what the business does and what to do next within five seconds.
If they cannot, the hero fails.

## 12. No Fake Numbers

No fabricated review counts, star ratings, years in business, or service area claims.
Use real numbers from the client's existing site or supplied by the operator.
If no number is available, do not invent one.

## 13. Every Action Logged

Every pipeline step is logged to Supabase behavioral_log.
Every Anthropic API call logs tokens and cost.
Every approval gate records operator's decision.

## 14. No Outreach Without Approval

No pitch email, SMS, call script, or proposal is sent without explicit operator approval.
Drafting is automatic. Sending is always manual.

## 15. The Operator Is Always Right

The operator can override any tier routing recommendation.
The operator can approve or reject either direction for any reason.
The operator can stop any pipeline stage at any time.

Mission Control recommends. The operator decides.
