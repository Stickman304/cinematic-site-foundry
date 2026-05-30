# Mission Control — QA Scorecard

Every build is scored across 10 dimensions before it is shown to the operator.

A build with a final score below 72 is held and the operator is shown which dimensions failed.

---

## Scoring Dimensions

### 1. Visual Taste (0–100)

**Minimum: 70**

Evaluates whether the site looks premium, intentional, and industry-appropriate.

Pass criteria (all required for 80+):
- Hero visual is business-specific, not generic
- Color palette matches industry and brand feel
- Typography is intentional and consistent
- No banned visual slop patterns (see doc 10)
- Depth and layering feel deliberate

Fail criteria (any drops to 0–40):
- Generic purple/blue AI gradient
- Random floating decorative shapes
- Stock-photo corporate imagery
- Default Inter font with no justification
- Visual clutter obscuring the message

---

### 2. Mobile Experience (0–100)

**Minimum: 80**

Evaluates mobile layout at 390px (iPhone 15) and 360px (Android).

Pass criteria (all required for 80+):
- CTA button visible above fold on 390px
- Phone number reachable without scrolling
- No horizontal overflow
- Tap targets are minimum 44px × 44px
- No content clipped or cut off
- Sticky mobile call bar present

Fail criteria (any drops below 60):
- CTA below fold on mobile
- Horizontal scroll on any common viewport
- Text smaller than 14px body / 11px secondary
- Tap targets under 32px

---

### 3. CTA Strength (0–100)

**Minimum: 80**

Evaluates how clear, prominent, and action-oriented the primary CTA is.

Pass criteria (all required for 80+):
- Primary CTA visible above fold on desktop and mobile
- CTA label is specific and action-oriented (not "Submit" or "Learn More")
- CTA color has sufficient contrast with background
- CTA button size is prominent (min 48px height on mobile)
- Secondary CTA is present and distinct from primary

Fail criteria:
- CTA label is "Submit" or "Learn More" → automatic fail
- CTA hidden below fold → score capped at 50
- Insufficient contrast → score capped at 60

---

### 4. Copy Quality (0–100)

**Minimum: 70**

Evaluates headline quality, CTA copy, and body copy for slop, accuracy, and conversion.

Pass criteria (all required for 70+):
- Headline is outcome-focused and business-specific
- No generic filler phrases (see doc 10)
- CTAs use specific action language
- No invented statistics
- Trust proof is real or clearly placeholder-formatted
- Voice is consistent throughout

Fail criteria (any drops below 50):
- "Welcome to [Company Name]" as headline
- "Solutions for your business" or equivalent
- Fabricated review numbers or ratings
- Copy makes no reference to the specific business or industry

---

### 5. Trust Architecture (0–100)

**Minimum: 75**

Evaluates whether the site builds trust at the right moments in the visitor journey.

Pass criteria (all required for 75+):
- At least one trust signal visible above fold (years, license, rating)
- Trust strip present below hero
- Review section present with proper attribution format
- Phone number visible in hero and nav
- Service area stated on the page

Fail criteria:
- No reviews or trust proof → score capped at 40
- Phone number not in the nav → -15 points
- No service area stated → -15 points

---

### 6. Performance Risk (0–100)

**Minimum: 70**

Evaluates whether the build is likely to have poor Lighthouse / Core Web Vitals scores.

Pass criteria (all required for 70+):
- No heavy unoptimized images in hero
- No render-blocking scripts
- No unnecessary Google Fonts loads (2 fonts maximum)
- Animations use CSS transitions or GPU-composited properties
- WebGL (Tier 3+) has static fallback

Fail criteria:
- Unoptimized hero image over 500KB → -30 points
- Render-blocking synchronous JS → -20 points
- More than 3 external font families → -10 points
- WebGL with no fallback → automatic fail at Tier 3+

---

### 7. Brand Perception (0–100)

**Minimum: 70**

Evaluates whether the site feels like a premium, credible, distinctive brand — not a template.

Pass criteria:
- Design feels specific to this business and industry
- Color palette is intentional, not default
- No patterns borrowed from an obviously different industry
- Site feels premium relative to typical local business sites
- The business "feels worth calling"

Fail criteria:
- Site feels like a generic website builder output → score capped at 50
- Patterns clearly cross-pollinated from wrong industry → -20 points
- Site does not feel premium → score capped at 55

---

### 8. Motion Quality (0–100)

**Minimum: 70**

Evaluates whether motion elements are intentional, appropriate, and non-disruptive.

Pass criteria (all required for 70+):
- All animations respect `prefers-reduced-motion`
- No animation competes with or obscures the CTA
- Animation timing is within spec (see doc 05)
- No stagger spam
- Mobile performance is not hurt by animation

Fail criteria:
- Animation hides CTA at any scroll position → automatic fail
- Animation causes layout shift (CLS > 0.1) → -30 points
- Stagger delay exceeds 100ms per element → -15 points
- No prefers-reduced-motion support → -20 points

---

### 9. SEO Foundation (0–100)

**Minimum: 65**

Evaluates whether the site has the basics of local SEO in place.

Pass criteria (all required for 65+):
- `<title>` tag includes business name + city + primary service
- `<meta name="description">` present and under 160 characters
- `<h1>` present and includes primary keyword
- `<h2>` and `<h3>` are in logical order
- Local schema markup (LocalBusiness) present or placeholder structured
- Service area pages or mentions present

Fail criteria:
- No `<title>` tag → automatic fail
- No `<h1>` → -25 points
- No service area mention → -20 points

---

### 10. Code Maintainability (0–100)

**Minimum: 65**

Evaluates whether the executor's code is clean, documented, and handoff-ready.

Pass criteria:
- No commented-out code blocks in production files
- CSS/Tailwind classes are organized and not redundant
- No hardcoded placeholder text in production code
- Component structure is logical
- No console.log statements in production code

Fail criteria:
- Active `console.log` statements → -15 points per instance
- Hardcoded placeholder text still in production → -25 points
- CSS specificity chaos (overrides on overrides) → -20 points

---

## Final Score Calculation

```
finalScore = average(all 10 dimensions)
```

If any dimension is below its minimum, the build is flagged — even if the final score is above 72.

---

## QA Report Format

```json
{
  "dimensions": {
    "visualTaste": 82,
    "mobileExperience": 91,
    "ctaStrength": 85,
    "copyQuality": 74,
    "trustArchitecture": 78,
    "performanceRisk": 71,
    "brandPerception": 80,
    "motionQuality": 88,
    "seoFoundation": 68,
    "codeMaintainability": 76
  },
  "finalScore": 79.3,
  "pass": true,
  "failingDimensions": [],
  "recommendations": [
    "SEO foundation: add LocalBusiness schema markup to increase score",
    "Copy quality: hero subheadline still generic — suggest specific revision"
  ]
}
```
