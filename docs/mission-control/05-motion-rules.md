# Mission Control — Motion Rules

Motion must feel expensive, not busy.

---

## Core Principle

Motion should:
- Guide attention toward the CTA
- Make the site feel alive and premium
- Reinforce the business type and industry
- Feel smooth and intentional

Motion must not:
- Delay comprehension of the headline or offer
- Compete with or obscure the CTA
- Hurt mobile performance
- Add noise without purpose
- Use random stagger spam

---

## Tier 1 — Allowed Motion

- Button hover (color shift, slight scale, shadow)
- Soft scroll reveal (fade + translateY, 0.3s, no delay)
- Light hero image drift (Ken Burns, 0.5% movement over 8s)
- Floating trust card (subtle bob, 4s loop)
- Subtle gradient shift in hero background
- Smooth sticky call button appearance on scroll

**Not allowed at Tier 1:**
- Heavy animation sequences
- WebGL or canvas animation
- Scroll-driven complex parallax
- Multiple competing motion elements

---

## Tier 2 — Allowed Motion

Everything in Tier 1, plus:

- Animated hero background (industry-specific)
  - HVAC: airflow stream animation
  - Trucking: route line pulse
  - Survey: scan line reveal
  - Roofing: storm-cloud drift + light break
  - Plumbing: water-flow line
- Scroll reveals on service cards (stagger: max 100ms between items, max 4 items)
- Hover cards (lift + shadow on hover)
- Background motion gradients
- Service flow animation (step sequence)

**Not allowed at Tier 2:**
- Animation that hides the CTA at any scroll position
- Stagger delay over 100ms per element
- More than 5 independently animated elements in the hero
- Full-page parallax that causes jank on mobile

---

## Tier 3 — Allowed Motion

Everything in Tier 2, plus:

- Interactive 3D-style hero (Spline embed or CSS 3D + JS)
- Mouse-follow effect on 3D hero object (15-degree max rotation)
- Richer page transitions
- Motion storytelling sections (scroll-driven narrative)
- Scroll choreography on key sections

**Static fallback required** for all 3D/WebGL at Tier 3.

**Not allowed at Tier 3:**
- Full-page WebGL without fallback
- Mouse-follow that causes accessibility issues
- Motion that breaks print/reduced-motion preferences

---

## Tier 4 — Allowed Motion

Everything in Tier 3, plus:

- Full motion system
- WebGL / Three.js scenes (with required fallback)
- Interactive configurators with animated transitions
- Advanced scroll-driven story sections
- Cross-page transitions

**Performance fallback always required.**

---

## Global Motion Rules

### Reduced Motion

All animation must respect `prefers-reduced-motion: reduce`.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Timing Standards

| Motion Type | Duration | Easing |
|---|---|---|
| Button hover | 150–200ms | ease-out |
| Scroll reveal | 300–400ms | ease-out |
| Card hover | 200ms | ease |
| Hero drift | 8–12s | linear |
| 3D follow | 250ms | ease-out |

### No Infinite Spin

No element spins indefinitely unless it is a loading indicator.

### No Bounce Spam

One bounce/spring effect per page maximum.

### CTA Protection

The primary CTA must never be:
- Hidden by an animation
- Pushed off screen by a scroll effect
- Made unclickable during a transition
- Reduced in opacity below 80%

---

## Motion QA Gate

Before any build passes motion QA:

- [ ] CTA visible at all scroll positions
- [ ] All animations respect prefers-reduced-motion
- [ ] No jank on 3G mobile throttle (Chrome DevTools)
- [ ] No competing animations in the hero
- [ ] Stagger delays within spec
- [ ] Static fallback tested for Tier 3+
