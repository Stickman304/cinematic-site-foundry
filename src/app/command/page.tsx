"use client";
import { useState } from "react";

function CollapsibleCard({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-5 py-3 flex items-center justify-between transition-all"
        style={{ borderBottom: open ? "1px solid var(--border)" : "none" }}
      >
        <span className="font-display text-base" style={{ color: "var(--amber)" }}>{title}</span>
        <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>{open ? "▲ COLLAPSE" : "▼ EXPAND"}</span>
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

const DESIGN_STACK_TIERS = [
  {
    label: "EVERY BUILD (all tiers)",
    items: [
      "Google Stitch MCP + stitch-design-taste → DESIGN.md",
      "google-labs-code/stitch-skills → Stitch → React",
      "UI/UX Pro Max → 161 palettes · 57 fonts · 67 styles",
      "Impeccable → 85+ required · anti-pattern enforcement",
      "frontend-design (anthropics) → no AI slop",
      "design-taste-frontend (Taste Skill v2) → anti-slop",
      "cinematic-ui → film director workflow",
      "RoboNuggets design-system → brand book PDF",
      "awesome-design-md → DESIGN.md templates",
      "digital-marketing-pro → copy quality gate B+",
      "LottieFiles motion-design-skill → Step 5 principles",
      "design-motion-principles → Step 6 motion audit",
      "VOIDXAI/taste → 5-dimension quality judgment",
      "21st.dev Magic MCP → /ui every component stage",
      "MotionSites.ai → 65 hero section prompt recipes",
    ],
  },
  {
    label: "TIER 1 RENOVATION ADDS",
    items: [
      "Firecrawl website-design-clone",
      "cinematic-modules (30 modules) #01 #07 #10 #16 #25",
      "framer-motion-skill · motion-dev-skill",
      "website-builder-setup · tweak",
      "GPT Image 2 via Higgsfield (photos only)",
    ],
  },
  {
    label: "TIER 2 NEW BUILD ADDS",
    items: [
      "Reloom (zero-brand clients, browser step)",
      "Nano Banana 2 → hero still",
      "Kling 3.0 → ambient/transition video",
      "OR Google Flow (Veo 3.1) → second video engine",
      "Seedance 2.0 → 15s ambient loop",
      "FFmpeg → compress + ping-pong WebM",
      "claudedesignskills: GSAP · Locomotive · Lottie · Anime.js",
    ],
  },
  {
    label: "TIER 3 ADVANCED ADDS",
    items: [
      "Spline MCP → 3D hero objects (automated)",
      "Three.js · React Three Fiber · Babylon.js",
      "zyliu0/3d-frontend → scroll-driven 3D",
      "GSAP scroll frames → video to 100+ frames",
      "CMS → Sanity or Contentful",
    ],
  },
  {
    label: "PREMIUM ADDS",
    items: [
      "GStack CEO mode + Conductor (Garry Tan)",
      "Three.js + R3F + Babylon.js combined",
      "Multiple generation rounds",
      "Full 3D world — no limitations",
      "Reference: shader.se · airborne.studio · longshotfeatures.com",
    ],
  },
];

const ANIMATION_TIERS = [
  { label: "TIER 1 — CSS + GSAP Modules Only", color: "#10b981", lines: ["No video generation", "Modules: #01 #07 #10 #16 #25", "Cost: ~$0.50 · Time: 30–45 min"] },
  { label: "TIER 2 — Higgsfield + Google Flow Video Pipeline", color: "var(--amber)", lines: ["Nano Banana 2 + Kling 3.0 + Seedance 2.0", "OR Google Flow + Veo 3.1 (agent decides per brief)", "Modules add: #09 #13 #14 #20 #29", "Cost: ~$1.50–$3 · Time: 60–90 min"] },
  { label: "TIER 3 — Full 3D Stack", color: "#8b5cf6", lines: ["Spline + Three.js + GSAP scroll frames", "Modules add: #03 #22 #24 #26 #28", "Cost: ~$5–$8 · Time: 3–4 hours"] },
  { label: "PREMIUM — Event Level", color: "#ec4899", lines: ["Full 3D world · multiple generation rounds", "WebGPU via TSL where applicable", "All modules active", "Cost: ~$10–$15 · Time: 4–6 hours"] },
];

const CINEMATIC_RULES = [
  {
    category: "CURSOR (every site)",
    rules: [
      "Tier 1: glow follows cursor (Module #10) — always",
      "Tier 2: image trail (Module #13)",
      "Tier 3+: magnetic cursor with spring physics",
    ],
  },
  {
    category: "SCROLL (every site)",
    rules: [
      "Tier 1: text reveals on enter (Module #01) — always",
      "Tier 1: curtain reveals (Module #07) — always",
      "Tier 2+: scroll-linked video playback",
      "Tier 3+: scroll-driven 3D camera paths",
    ],
  },
  {
    category: "HERO (never static)",
    rules: [
      "Tier 1: CSS gradient or particle drift",
      "Tier 2: Seedance 2.0 loop + scroll video OR Google Flow + Veo 3.1",
      "Tier 3: GSAP scroll frames (100+ frames)",
      "Premium: Three.js or R3F immersive world",
    ],
  },
  {
    category: "ALWAYS",
    rules: [
      "NAV: glassmorphism blur on scroll",
      "CARDS: spotlight glow + 3D tilt on hover (Module #16 on every product grid)",
      "MARQUEE: Module #25 between every section",
    ],
  },
  {
    category: "TWO BUILDS",
    rules: [
      "Every client gets two distinct creative directions",
      "visual-storyteller produces both — human approves first",
    ],
  },
];

const BUILD_TYPES = [
  {
    id: "audit",
    label: "AUDIT",
    desc: "Full site audit only",
    icon: "◈",
    stages: ["Audit", "Brand Profile"],
    avgCost: "$0.02",
    avgTime: "8 min",
  },
  {
    id: "renovate",
    label: "RENOVATE",
    icon: "◻",
    desc: "Full renovation pipeline",
    stages: ["Audit", "Brand Profile", "Creative Brief", "Photo Enhancement", "Logo Processing", "Asset Gen", "Build", "QA", "Deploy"],
    avgCost: "$1.50",
    avgTime: "45 min",
  },
  {
    id: "new_build",
    label: "NEW BUILD",
    icon: "▶",
    desc: "From brief to deployed",
    stages: ["Audit", "Brand Profile", "Creative Brief", "Asset Gen", "Build", "QA", "Deploy"],
    avgCost: "$3.00",
    avgTime: "90 min",
  },
];

const BUDGET_TIERS = [
  { id: "demo", label: "$0.50", desc: "Outreach Demo" },
  { id: "reno", label: "$1.50", desc: "Renovation $500-2K" },
  { id: "standard", label: "$3.00", desc: "Standard $2K-5K" },
  { id: "premium", label: "$5.00", desc: "Premium $5K-15K" },
  { id: "cinematic", label: "$8.00", desc: "Full Cinematic $15K-20K" },
];

const QUICK_ACTIONS = [
  { label: "RUN SCOUT", sub: "Find ugly sites in a niche", color: "var(--amber)" },
  { label: "CLIENT ASSETS", sub: "Photo/logo intake pipeline", color: "var(--green)" },
  { label: "OUTREACH BLAST", sub: "Execute outreach sequences", color: "#3b82f6" },
  { label: "QA ALL", sub: "Impeccable on all deployed sites", color: "#8b5cf6" },
];

export default function Command() {
  const [url, setUrl] = useState("");
  const [buildType, setBuildType] = useState("audit");
  const [budget, setBudget] = useState("standard");
  const [fired, setFired] = useState(false);

  const selectedBuild = BUILD_TYPES.find((b) => b.id === buildType);

  function handleFire() {
    if (!url) return;
    setFired(true);
    setTimeout(() => setFired(false), 3000);
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div>
        <div className="font-display text-3xl" style={{ color: "var(--amber)" }}>COMMAND CENTER</div>
        <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          FIRE THE FULL AGENT PIPELINE FROM HERE
        </div>
      </div>

      {/* URL + fire */}
      <div className="rounded-lg border p-5 flex flex-col gap-4" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div>
          <label className="font-mono text-xs block mb-2" style={{ color: "var(--text-muted)" }}>TARGET URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-3 rounded font-mono text-sm outline-none transition-all"
            style={{
              background: "var(--bg-base)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              caretColor: "var(--amber)",
            }}
            onKeyDown={(e) => e.key === "Enter" && handleFire()}
          />
        </div>

        {/* Budget tier */}
        <div>
          <label className="font-mono text-xs block mb-2" style={{ color: "var(--text-muted)" }}>BUDGET TIER (MAX AI COST)</label>
          <div className="flex gap-2 flex-wrap">
            {BUDGET_TIERS.map((t) => (
              <button
                key={t.id}
                onClick={() => setBudget(t.id)}
                className="px-3 py-2 rounded border font-mono text-xs transition-all"
                style={{
                  background: budget === t.id ? "var(--amber-glow)" : "var(--bg-elevated)",
                  borderColor: budget === t.id ? "var(--amber)" : "var(--border)",
                  color: budget === t.id ? "var(--amber)" : "var(--text-muted)",
                }}
              >
                {t.label} — {t.desc}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleFire}
          disabled={!url}
          className="w-full py-5 rounded-lg font-display text-2xl tracking-widest transition-all"
          style={{
            background: fired ? "var(--green)" : url ? "var(--amber)" : "var(--bg-elevated)",
            color: fired || url ? "#000" : "var(--text-dim)",
            boxShadow: url && !fired ? "0 0 30px rgba(200,151,58,0.3)" : "none",
            cursor: url ? "pointer" : "not-allowed",
          }}
        >
          {fired ? "✓ AGENTS DISPATCHED" : "FIRE"}
        </button>
      </div>

      {/* Build type workflow cards */}
      <div>
        <div className="font-display text-lg mb-3" style={{ color: "var(--amber)" }}>BUILD TYPE — SELECT WORKFLOW</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {BUILD_TYPES.map((t) => {
            const active = buildType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setBuildType(t.id)}
                className="rounded-lg border p-4 text-left flex flex-col gap-2 transition-all"
                style={{
                  background: active ? "var(--amber-glow)" : "var(--bg-card)",
                  borderColor: active ? "var(--amber)" : "var(--border)",
                  boxShadow: active ? "0 0 20px rgba(200,151,58,0.12)" : "none",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ color: active ? "var(--amber)" : "var(--text-muted)" }}>{t.icon}</span>
                    <span className="font-display text-sm" style={{ color: active ? "var(--amber)" : "var(--text-primary)" }}>
                      {t.label}
                    </span>
                  </div>
                  {active && (
                    <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: "var(--amber)", color: "#000" }}>
                      SELECTED
                    </span>
                  )}
                </div>
                <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{t.desc}</div>
                <div className="flex gap-3 mt-1">
                  <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>≈{t.avgCost} AI cost</span>
                  <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>~{t.avgTime}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {t.stages.slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="font-mono px-1.5 py-0.5 rounded"
                      style={{ fontSize: 9, background: "var(--bg-base)", color: "var(--text-dim)" }}
                    >
                      {s}
                    </span>
                  ))}
                  {t.stages.length > 4 && (
                    <span className="font-mono px-1.5 py-0.5 rounded" style={{ fontSize: 9, background: "var(--bg-base)", color: "var(--text-dim)" }}>
                      +{t.stages.length - 4} more
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Workflow preview for selected type */}
      {selectedBuild && (
        <div
          className="rounded-lg border p-5"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-hover)" }}
        >
          <div className="font-display text-base mb-3" style={{ color: "var(--amber)" }}>
            {selectedBuild.label} — STAGE SEQUENCE
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedBuild.stages.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span
                  className="font-mono text-xs px-3 py-1.5 rounded"
                  style={{ background: "var(--bg-base)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                >
                  {s}
                </span>
                {i < selectedBuild.stages.length - 1 && (
                  <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <div className="font-display text-lg mb-3" style={{ color: "var(--amber)" }}>QUICK ACTIONS</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              className="rounded-lg border p-4 text-left transition-all hover:opacity-80"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <div className="font-display text-base" style={{ color: a.color }}>{a.label}</div>
              <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>{a.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Addition C — Design Stack Reference Card */}
      <CollapsibleCard title="ACTIVE DESIGN STACK PER TIER">
        <div className="flex flex-col gap-4">
          {DESIGN_STACK_TIERS.map((tier) => (
            <div key={tier.label}>
              <div className="font-mono text-xs font-bold mb-2" style={{ color: "var(--amber)" }}>{tier.label}</div>
              <div className="flex flex-wrap gap-1.5">
                {tier.items.map((item) => (
                  <span
                    key={item}
                    className="font-mono px-2 py-0.5 rounded"
                    style={{ fontSize: 10, background: "var(--bg-base)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CollapsibleCard>

      {/* Addition D — Animation Tier Guide */}
      <CollapsibleCard title="ANIMATION STANDARD PER TIER">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {ANIMATION_TIERS.map((tier) => (
            <div
              key={tier.label}
              className="rounded p-3 flex flex-col gap-1"
              style={{ background: "var(--bg-base)", border: `1px solid ${tier.color}33` }}
            >
              <div className="font-display text-sm" style={{ color: tier.color }}>{tier.label}</div>
              {tier.lines.map((line) => (
                <div key={line} className="font-mono text-xs" style={{ fontSize: 10, color: "var(--text-muted)" }}>
                  {line}
                </div>
              ))}
            </div>
          ))}
        </div>
      </CollapsibleCard>

      {/* Addition G — Cinematic Standard Reference Card */}
      <CollapsibleCard title="CINEMATIC STANDARD — NON-NEGOTIABLE">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {CINEMATIC_RULES.map((section) => (
            <div key={section.category}>
              <div className="font-mono text-xs font-bold mb-2" style={{ color: "var(--amber)" }}>{section.category}</div>
              <div className="flex flex-col gap-1">
                {section.rules.map((rule) => (
                  <div key={rule} className="font-mono text-xs" style={{ color: "var(--text-muted)", fontSize: 10 }}>
                    · {rule}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CollapsibleCard>

      {/* Emil Kowalski — Animation Review */}
      <CollapsibleCard title="EMIL KOWALSKI — ANIMATION REVIEW">
        <div className="flex flex-col gap-4">
          {/* Status badge row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-mono px-2 py-0.5 rounded"
              style={{ fontSize: 10, background: "var(--amber-glow)", color: "var(--amber)", border: "1px solid var(--amber)" }}
            >
              emilkowalski/skill
            </span>
            <span
              className="font-mono px-2 py-0.5 rounded"
              style={{ fontSize: 10, background: "var(--bg-elevated)", color: "#f59e0b", border: "1px solid #f59e0b44" }}
            >
              CASE-BY-CASE ONLY — NOT ALWAYS ON
            </span>
          </div>

          {/* Info block */}
          <div className="flex flex-col gap-1">
            <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              · Activate: /emil-review → fires Emil review on current animation
            </div>
            <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              · Call when: reviewing or improving a specific animation, not as a background layer
            </div>
            <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              · NOT for: general builds, passive enforcement, every animation
            </div>
          </div>

          {/* Three rule cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "≤ 300ms", detail: "All animations complete in under 300 milliseconds" },
              { label: "CUSTOM EASING", detail: "No default ease-in-out. Custom cubic-bezier per interaction." },
              { label: "PERCEIVED PERFORMANCE", detail: "Animation should make the app feel faster, not slower" },
            ].map(({ label, detail }) => (
              <div
                key={label}
                className="p-3 rounded flex flex-col gap-1"
                style={{ background: "var(--bg-base)", border: "1px solid var(--border)" }}
              >
                <div className="font-display text-sm" style={{ color: "var(--amber)" }}>{label}</div>
                <div className="font-mono text-xs" style={{ fontSize: 10, color: "var(--text-muted)" }}>{detail}</div>
              </div>
            ))}
          </div>

          {/* Example trigger */}
          <div
            className="font-mono text-xs"
            style={{ color: "var(--text-dim)", opacity: 0.7 }}
          >
            Say: &quot;review my hero animation&quot; → Emil fires
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
