# Mission Control — Build Spec Template

The build spec is the locked document sent to the executor. Once locked, it does not change.

The executor reads the build spec and builds exactly what it says.

---

## Build Spec Format

Every build spec contains the following sections.

---

### 1. Client Profile

```markdown
## Client Profile

- Business Name: <name>
- Industry: <industry>
- Location: <city, state>
- URL: <original url>
- Build ID: <uuid>
- Tier: <tier1|tier2|tier3|tier4>
- Direction: <A|B>
```

---

### 2. Approved Creative Direction

```markdown
## Approved Creative Direction

Direction: <A — Safe Premium | B — Bold Premium>

### Concept
<One paragraph describing the visual and brand concept>

### Visual Feel
<3–5 descriptive words>

### Target Audience
<Who this site is built for>

### Hero Concept
<Describe the hero section: layout, visual, headline placeholder, CTA>
```

---

### 3. Design System

```markdown
## Design System

### Color Palette
- Primary Background: #<hex> — <name>
- Secondary Background: #<hex> — <name>
- Primary Text: #<hex> — <name>
- Secondary Text: #<hex> — <name>
- Accent: #<hex> — <name>
- CTA Background: #<hex> — <name>
- CTA Text: #<hex> — <name>
- Border: #<hex> — <name>
- Trust/Success: #<hex> — <name>

### Typography
- Headline Font: <Font Name> — weight <weight>
- Body Font: <Font Name> — weight <weight>
- CTA Font: <Font Name> — weight <weight>
- Font Source: Google Fonts CDN / Local

### Spacing Scale
- Base unit: 4px
- Section padding: 80px (desktop) / 40px (mobile)
- Component gap: 24px
- Card padding: 24px / 16px mobile

### Border Radius
- Cards: 12px
- Buttons: 8px
- Images: 8px
```

---

### 4. Site Structure

```markdown
## Site Structure

### Pages
- / — Home (primary landing page)
- /services — Services detail
- /about — About + trust
- /contact — Lead form + contact info
- /areas — Service area (optional, local SEO)

### Home Page Sections (in order)
1. Sticky navigation
2. Hero section
3. Trust strip
4. Services section
5. Why us / differentiators
6. Portfolio / project gallery (if applicable)
7. Reviews / testimonials
8. Service area map or text block
9. About summary
10. Final CTA / quote form
11. Footer
```

---

### 5. Hero Specification

```markdown
## Hero Specification

### Layout
<A: Left Copy / Right Visual | B: Split Editorial | C: Layered Visual | D: Cinematic Full-Width | E: 3D Object>

### Headline
<Placeholder headline in the voice and format of the brand>

### Subheadline
<Supporting line>

### Primary CTA
Label: <button label>
Action: <phone call | scroll to form | form modal>

### Secondary CTA
Label: <button label>
Action: <scroll to section>

### Trust Line
<e.g., "Licensed & Insured · 15+ Years · 4.9 Stars · Serving Greater Cleveland">

### Hero Visual
<Describe: industry render, photo style, 3D object, etc.>
<If image generation: include the image generation prompt per the Visual Language Bible>

### Floating Trust Cards (if applicable)
Card 1: <content>
Card 2: <content>
Card 3: <content>
```

---

### 6. Motion Plan

```markdown
## Motion Plan

Tier: <tier>

### Hero
<describe animations in hero>

### Scroll Reveals
<which sections use scroll reveals, timing>

### Hover Effects
<cards, buttons, nav>

### Industry Motion
<specific motion tied to the business type>

### Mobile Fallback
<describe fallback for any animation>
```

---

### 7. Anti-Slop Rules (Build-Specific)

```markdown
## Anti-Slop Rules — This Build

Do not use:
- <list of specific bans for this business/industry>
- <stock photos from generic sources>
- <competitor visual patterns>
- <any named pattern that should be avoided>
```

---

### 8. Copy Brief

```markdown
## Copy Brief

### Voice
<1–2 sentences describing tone and personality>

### Headline Formula
<what structure the headlines follow>

### CTA Copy
<specific CTA labels approved for this build>

### Trust Language
<specific trust statements: years, licenses, areas served, stats>

### Forbidden Copy
- "Solutions for your business"
- "We are committed to excellence"
- <other generic phrases banned for this build>
```

---

### 9. Technical Requirements

```markdown
## Technical Requirements

### Stack
- Framework: <Next.js | HTML/CSS/JS | Astro | other>
- Styling: <Tailwind | CSS modules | inline | other>
- Animation: <GSAP | CSS | Framer Motion | vanilla JS | none>
- 3D: <Spline | Three.js | CSS 3D | none>

### Performance Targets
- Lighthouse Mobile: 85+
- LCP: < 2.5s on 4G
- CLS: < 0.1

### Integrations
- Contact form: <action endpoint or service>
- Analytics: <none | GA4 | Plausible>
- CRM: <none | HubSpot | other>

### Deploy Target
- Host: Netlify
- Domain: <custom | subdomain>
- Site ID: <Netlify site ID if known>
```

---

### 10. Executor Handoff Notes

```markdown
## Executor Handoff

### Priority Order
1. Mobile hero CTA
2. Trust section
3. Services section
4. Quote form
5. Everything else

### Known Assets
- Client photos: <urls or "none">
- Logo: <url or "none — generate placeholder">
- Existing brand colors: <hex values or "extract from current site">

### Constraints
- Max build time: <hours>
- QA scorecard minimum: 72 (see 13-qa-scorecard.md)
- Must pass mobile CTA gate
```
