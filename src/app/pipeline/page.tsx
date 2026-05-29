"use client";
import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const SIX_STEPS = [
  {
    n: 1,
    label: "INTELLIGENCE",
    detail:
      "Firecrawl scrape + website-design-clone · Stitch MCP + stitch-design-taste → DESIGN.md · firecrawl-competitive-intel + firecrawl-market-research",
  },
  {
    n: 2,
    label: "DESIGN SYSTEM",
    detail:
      "ui-ux-pro-max → 161 palettes · 57 fonts · 67 styles · RoboNuggets design-system → brand_profile.json + brand book PDF · awesome-design-md → template matched",
  },
  {
    n: 3,
    label: "ANTI-SLOP + DIRECTION",
    detail:
      "frontend-design → no Inter, no purple gradients · design-taste-frontend (Taste Skill v2) · cinematic-ui → decisions.md + storyboard.md · digital-marketing-pro → B+ copy minimum",
  },
  {
    n: 4,
    label: "COMPONENTS",
    detail:
      "21st.dev Magic MCP → /ui at every component stage · MotionSites.ai → 65 hero section prompt recipes",
  },
  {
    n: 5,
    label: "MOTION PRINCIPLES",
    detail:
      "LottieFiles/motion-design-skill (Disney 12 principles — fires BEFORE code) · cinematic-modules default set · framer-motion-skill + motion-dev-skill + tweak",
  },
  {
    n: 6,
    label: "QUALITY GATE",
    detail:
      "design-motion-principles /audit · VOIDXAI/taste 5-dimension · impeccable 85+ (90+ Premium) · vercel-labs/agent-skills · caveman",
  },
];

const TIER1_PIPELINE = [
  "01  Create PROJECT-BRIEF.md",
  "02  firecrawl-scrape + firecrawl-website-design-clone",
  "03  stitch-mcp + stitch-design-taste → DESIGN.md",
  "04  firecrawl-market-research + firecrawl-competitive-intel",
  "05  design-system → brand_profile.json + brand book PDF",
  "06  ui-ux-pro-max → --design-system",
  "07  awesome-design-md → template match",
  "08  frontend-design + design-taste-frontend + cinematic-ui → decisions.md + storyboard.md",
  "09  GPT Image 2 via Higgsfield → enhance client photos only",
  "10  motionsites-prompts → pick hero recipe + 21st.dev → /ui every component",
  "11  LottieFiles motion principles + cinematic-modules #01 #07 #10 #16 #25 + framer-motion-skill + motion-dev-skill + website-builder-setup + tweak",
  "12  digital-marketing-pro → B+ copy",
  "13  design-motion-principles audit + VOIDXAI/taste + impeccable 85+ + vercel rules",
  "14  Deploy → Netlify connector",
];

const TIER1_AGENTS = [
  "brand-guardian",
  "visual-storyteller",
  "frontend-developer",
  "content-creator",
  "seo-specialist",
  "reality-checker",
  "devops-automator",
];

const TIER2_ADDS = [
  "01  firecrawl-deep-research + notebooklm-py",
  "02  Reloom (zero-brand clients · browser step) → sitemap + wireframe → ZIP → Claude Code",
  "03  claudedesignskills → GSAP · Locomotive · Lottie · Anime.js",
  "04  image-prompt-engineer → MCSLA video prompt (camera angle + lens + lighting + negative space)",
  "05  Nano Banana 2 via Higgsfield → hero still",
  "06  Kling 3.0 via Higgsfield → transition/ambient video OR Google Flow (Veo 3.1) — agent chooses per brief",
  "07  Seedance 2.0 → 15s ambient loop",
  "08  FFmpeg → under 4MB · ping-pong WebM · muted + autoplay",
  "09  Scroll-linked video animation",
  "10  Full SEO suite (10 agents)",
  "11  gsd-new-project + gsd-plan-phase + gsd-ship",
];

const TIER2_ADDS_AGENTS = [
  "agents-orchestrator",
  "visual-storyteller",
  "image-prompt-engineer",
  "senior-developer",
  "studio-producer",
];

const TIER3_ADDS = [
  "01  ux-architect → full XD doc before code",
  "02  claudedesignskills full 3D suite: threejs-webgl · react-three-fiber · babylonjs-engine · pixijs-2d · barba-js · spline-interactive",
  "03  zyliu0/3d-frontend → scroll-driven 3D (40+ patterns: walkthroughs · tunnels · camera paths · water shaders · Fresnel glow · particles)",
  "04  Spline MCP → 3D hero objects (automated via @splinetool/runtime)",
  "05  GSAP scroll frames → video → 100+ frames → scroll playback",
  "06  evolver · graphify · arcads-external-api",
  "07  CMS → Sanity or Contentful",
  "08  Full paid media suite · Full gsd suite",
];

const TIER3_ADDS_AGENTS = [
  "chief-of-staff",
  "ux-architect",
  "whimsy-injector",
  "cms-developer",
  "performance-benchmarker",
  "accessibility-auditor",
];

const PREMIUM_ADDS = [
  "01  claude-gstack CEO mode → product review before code",
  "02  GStack Conductor → parallel isolated sessions: A: UX + wireframes · B: Design system + brand · C: 3D development · D: Copy + SEO",
  "03  Three.js custom → shaders · particles · procedural textures · water · Fresnel glow · WebGPU via TSL",
  "04  R3F physics-based 3D interactions",
  "05  Multiple Nano Banana + Kling + Seedance/Flow rounds",
  "06  whimsy-injector at 80% → unexpected delight moments",
  "07  Full brand system → every touchpoint",
  "08  Full marketing suite → paid media launch-ready",
];

const PREMIUM_ALL_AGENTS = [
  "chief-of-staff",
  "agents-orchestrator",
  "ux-architect",
  "visual-storyteller",
  "image-prompt-engineer",
  "whimsy-injector",
  "senior-developer",
  "cms-developer",
  "performance-benchmarker",
  "accessibility-auditor",
  "reality-checker",
  "studio-producer",
];

const PREMIUM_REFS = [
  {
    name: "shader.se",
    detail: "WebGPU + R3F + TSL · Lenis · Codrops case study May 2026",
  },
  {
    name: "airborne.studio",
    detail: "Kinetic bold type + floating 3D objects",
  },
  {
    name: "longshotfeatures.com",
    detail: "Film noir WebGL · B&W composition",
  },
  {
    name: "vincent-lowe.info",
    detail: "Editorial scroll-driven photography",
  },
];

const BRIEF_FIELDS = [
  "Client name",
  "Brand description",
  "Products / services",
  "Tier (1 / 2 / 3 / Premium / UGC)",
  "Deploy target (Vercel / Netlify)",
  "Stats (reviews, revenue signals)",
  "Social handles",
  "Notes",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function AgentChip({ name }: { name: string }) {
  return (
    <span
      className="font-mono text-xs px-2 py-1 rounded"
      style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
    >
      {name}
    </span>
  );
}

function PipelineStep({ line }: { line: string }) {
  return (
    <div
      className="font-mono py-1 leading-relaxed"
      style={{ color: "var(--text-muted)", fontSize: 11 }}
    >
      {line}
    </div>
  );
}

function SpecBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="font-mono uppercase"
        style={{ color: "var(--text-dim)", fontSize: 9, letterSpacing: "0.08em" }}
      >
        {label}
      </span>
      <span className="font-mono text-xs font-bold" style={{ color: "var(--text-primary)" }}>
        {value}
      </span>
    </div>
  );
}

function NotUsedBadge({ items }: { items: string }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded font-mono text-xs"
      style={{ background: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-dim)" }}
    >
      <span style={{ color: "var(--red)", fontSize: 10 }}>NOT USED</span>
      <span style={{ fontSize: 10 }}>{items}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-mono uppercase mb-2 mt-4"
      style={{ color: "var(--amber)", fontSize: 10, letterSpacing: "0.12em" }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div
      className="my-3 h-px"
      style={{ background: "var(--border)" }}
    />
  );
}

// ─── Tier Card ────────────────────────────────────────────────────────────────

interface TierCardProps {
  id: string;
  headerLabel: string;
  priceBadge: string;
  specs: { label: string; value: string }[];
  subtitle?: string;
  sectionLabel: string;
  pipeline: string[];
  agentsLabel: string;
  agents: string[];
  deliverables?: string;
  notUsed?: string;
  modules?: string;
  isPremium?: boolean;
  premiumNote?: string;
  expanded: boolean;
  onToggle: () => void;
}

function TierCard({
  headerLabel,
  priceBadge,
  specs,
  subtitle,
  sectionLabel,
  pipeline,
  agentsLabel,
  agents,
  deliverables,
  notUsed,
  modules,
  isPremium,
  premiumNote,
  expanded,
  onToggle,
}: TierCardProps) {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        background: "var(--bg-card)",
        borderColor: isPremium ? "var(--amber)" : "var(--border)",
        boxShadow: isPremium ? "0 0 32px rgba(200,151,58,0.15)" : "none",
      }}
    >
      {/* Header — tap target */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex flex-col gap-2 text-left"
        style={{
          minHeight: 44,
          borderBottom: expanded ? "1px solid var(--border)" : "none",
          background: isPremium ? "rgba(200,151,58,0.04)" : "transparent",
        }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-display text-xl" style={{ color: "var(--amber)" }}>
              {headerLabel}
            </span>
            <span
              className="font-mono text-xs px-2 py-1 rounded"
              style={{ background: "var(--bg-elevated)", color: "var(--amber)", border: "1px solid var(--amber)" }}
            >
              {priceBadge}
            </span>
          </div>
          <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
            {expanded ? "▲ COLLAPSE" : "▼ EXPAND"}
          </span>
        </div>

        {/* Specs row */}
        <div className="flex gap-5 flex-wrap">
          {specs.map((s) => (
            <SpecBadge key={s.label} label={s.label} value={s.value} />
          ))}
        </div>

        {subtitle && (
          <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            {subtitle}
          </div>
        )}
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-5 py-4 flex flex-col gap-1">
          {modules && (
            <>
              <SectionLabel>Modules</SectionLabel>
              <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                {modules}
              </div>
            </>
          )}

          {notUsed && (
            <div className="mt-3">
              <NotUsedBadge items={notUsed} />
            </div>
          )}

          <Divider />

          <SectionLabel>{sectionLabel}</SectionLabel>
          <div
            className="rounded p-3 flex flex-col"
            style={{ background: "var(--bg-base)", border: "1px solid var(--border)" }}
          >
            {pipeline.map((line) => (
              <PipelineStep key={line} line={line} />
            ))}
          </div>

          <SectionLabel>{agentsLabel}</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {agents.map((a) => (
              <AgentChip key={a} name={a} />
            ))}
          </div>

          {premiumNote && (
            <div
              className="font-mono text-xs mt-2 text-center py-2 rounded"
              style={{ color: "var(--amber)", background: "rgba(200,151,58,0.06)", border: "1px solid var(--amber)" }}
            >
              {premiumNote}
            </div>
          )}

          {deliverables && (
            <>
              <Divider />
              <SectionLabel>Deliverables</SectionLabel>
              <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                {deliverables}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Pipeline() {
  const [showBrief, setShowBrief] = useState(false);
  const [showFoundation, setShowFoundation] = useState(false);
  const [showPremiumRefs, setShowPremiumRefs] = useState(false);
  const [expandedTier, setExpandedTier] = useState<string | null>(null);

  function toggleTier(id: string) {
    setExpandedTier((prev) => (prev === id ? null : id));
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">

      {/* ── Page header ─────────────────────────────────────── */}
      <div>
        <div className="font-display text-3xl" style={{ color: "var(--amber)" }}>
          PIPELINE
        </div>
        <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          Select a tier to see the full build pipeline.
        </div>
      </div>

      {/* ── Step 0 — Project Brief ───────────────────────────── */}
      <div
        className="rounded-lg border p-5"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--amber)",
          boxShadow: "0 0 20px rgba(200,151,58,0.08)",
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <div className="font-display text-xl" style={{ color: "var(--amber)" }}>
              ⚡ STEP 0 — PROJECT BRIEF (required)
            </div>
            <div className="font-mono text-xs" style={{ color: "#f59e0b" }}>
              REQUIRED BEFORE ANY AGENT FIRES
            </div>
            <div
              className="font-mono text-xs mt-1 leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              Create PROJECT-BRIEF.md for this client. Every agent reads this first.
              <br />
              Without it: agents are generic. With it: agents are specialists.
            </div>
            <div className="font-mono text-xs mt-1" style={{ color: "var(--text-dim)" }}>
              Fields: client · brand · products · tier · deploy · stats · social · notes
            </div>
          </div>

          <button
            onClick={() => setShowBrief((p) => !p)}
            className="font-mono text-xs px-4 rounded shrink-0 transition-all"
            style={{
              background: showBrief ? "var(--bg-elevated)" : "var(--amber)",
              color: showBrief ? "var(--text-muted)" : "#000",
              minHeight: 44,
              paddingTop: 10,
              paddingBottom: 10,
            }}
          >
            {showBrief ? "CLOSE" : "📋 CREATE PROJECT BRIEF"}
          </button>
        </div>

        {showBrief && (
          <div className="mt-5 flex flex-col gap-3">
            {BRIEF_FIELDS.map((field) => (
              <div key={field}>
                <label
                  className="font-mono text-xs block mb-1"
                  style={{ color: "var(--text-dim)", letterSpacing: "0.06em" }}
                >
                  {field.toUpperCase()}
                </label>
                <input
                  className="w-full px-3 py-2 rounded font-mono text-xs outline-none"
                  placeholder={field}
                  style={{
                    background: "var(--bg-base)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                    caretColor: "var(--amber)",
                    minHeight: 44,
                  }}
                />
              </div>
            ))}
            <button
              className="font-mono text-xs px-4 rounded mt-1 self-start transition-all"
              style={{
                background: "var(--amber)",
                color: "#000",
                minHeight: 44,
                paddingTop: 10,
                paddingBottom: 10,
              }}
            >
              GENERATE PROJECT-BRIEF.md
            </button>
          </div>
        )}
      </div>

      {/* ── 6-Step Design Foundation ─────────────────────────── */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <button
          onClick={() => setShowFoundation((o) => !o)}
          className="w-full px-5 py-4 flex items-center justify-between gap-4"
          style={{
            minHeight: 44,
            borderBottom: showFoundation ? "1px solid var(--border)" : "none",
          }}
        >
          <div className="text-left">
            <div className="font-display text-base" style={{ color: "var(--amber)" }}>
              THE 6-STEP DESIGN FOUNDATION
            </div>
            <div className="font-mono text-xs" style={{ color: "var(--text-dim)", fontSize: 10 }}>
              fires on every tier · no exceptions
            </div>
          </div>
          <span className="font-mono text-xs shrink-0" style={{ color: "var(--text-dim)" }}>
            {showFoundation ? "▲ COLLAPSE" : "▼ EXPAND"}
          </span>
        </button>

        {showFoundation && (
          <div className="p-5 flex flex-col gap-4">
            {SIX_STEPS.map((step) => (
              <div key={step.n} className="flex items-start gap-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-display text-sm shrink-0"
                  style={{
                    background: "var(--amber-glow)",
                    border: "2px solid var(--amber)",
                    color: "var(--amber)",
                  }}
                >
                  {step.n}
                </div>
                <div>
                  <div className="font-display text-sm" style={{ color: "var(--amber)" }}>
                    {step.label}
                  </div>
                  <div
                    className="font-mono leading-relaxed"
                    style={{ color: "var(--text-muted)", fontSize: 11 }}
                  >
                    {step.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Two-Build Rule Banner ────────────────────────────── */}
      <div
        className="rounded-lg px-5 py-3 font-mono text-xs"
        style={{
          background: "var(--amber)",
          color: "#000",
          lineHeight: 1.6,
        }}
      >
        ⚡ TWO-BUILD RULE: Every client gets two distinct creative directions.{" "}
        <span className="font-bold">visual-storyteller</span> produces both. You approve before build starts.
      </div>

      {/* ── Tier Cards 2×2 grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* TIER 1 */}
        <TierCard
          id="tier1"
          headerLabel="TIER 1 — RENOVATION"
          priceBadge="$500–$2,500"
          specs={[
            { label: "Cost", value: "~$0.50" },
            { label: "Time", value: "30–45 min" },
            { label: "Budget stop", value: "$2" },
            { label: "QA", value: "85+" },
          ]}
          subtitle="RoboNuggets cinematic modules · CSS + GSAP only"
          modules="#01 #07 #10 #16 #25"
          notUsed="Nano Banana · Kling · Seedance · Three.js · Spline"
          sectionLabel="Pipeline"
          pipeline={TIER1_PIPELINE}
          agentsLabel="Agents"
          agents={TIER1_AGENTS}
          deliverables="Two live demo links · Market intelligence report PDF · Branded change-request page → Notion"
          expanded={expandedTier === "tier1"}
          onToggle={() => toggleTier("tier1")}
        />

        {/* TIER 2 */}
        <TierCard
          id="tier2"
          headerLabel="TIER 2 — NEW BUILD"
          priceBadge="$5,000–$10,000"
          specs={[
            { label: "Cost", value: "~$1.50–$3" },
            { label: "Time", value: "60–90 min" },
            { label: "Budget stop", value: "$5" },
            { label: "QA", value: "85+" },
          ]}
          subtitle="Everything Tier 1 PLUS video pipeline"
          modules="Adds #09 #13 #14 #20 #29"
          notUsed="Three.js · Spline · R3F · Babylon.js"
          sectionLabel="Adds to Tier 1"
          pipeline={TIER2_ADDS}
          agentsLabel="Adds agents"
          agents={TIER2_ADDS_AGENTS}
          expanded={expandedTier === "tier2"}
          onToggle={() => toggleTier("tier2")}
        />

        {/* TIER 3 */}
        <TierCard
          id="tier3"
          headerLabel="TIER 3 — ADVANCED"
          priceBadge="$15,000–$30,000"
          specs={[
            { label: "Cost", value: "~$5–$8" },
            { label: "Time", value: "3–4 hrs" },
            { label: "Budget stop", value: "$10" },
            { label: "QA", value: "90+" },
          ]}
          subtitle="Everything Tier 2 PLUS full 3D stack"
          modules="Adds #03 #22 #24 #26 #28"
          sectionLabel="Adds to Tier 2"
          pipeline={TIER3_ADDS}
          agentsLabel="Adds agents"
          agents={TIER3_ADDS_AGENTS}
          expanded={expandedTier === "tier3"}
          onToggle={() => toggleTier("tier3")}
        />

        {/* PREMIUM */}
        <TierCard
          id="premium"
          headerLabel="PREMIUM — AN EVENT"
          priceBadge="$30,000+"
          specs={[
            { label: "Cost", value: "~$10–$15" },
            { label: "Time", value: "4–6 hrs" },
            { label: "Budget stop", value: "$15" },
            { label: "QA", value: "90+" },
          ]}
          subtitle="Not a service. An event. Every agent fires."
          sectionLabel="Adds to Tier 3"
          pipeline={PREMIUM_ADDS}
          agentsLabel="All agents"
          agents={PREMIUM_ALL_AGENTS}
          premiumNote="None sit idle. All agents fire."
          isPremium
          expanded={expandedTier === "premium"}
          onToggle={() => toggleTier("premium")}
        />
      </div>

      {/* ── Premium Reference Sites ──────────────────────────── */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <button
          onClick={() => setShowPremiumRefs((o) => !o)}
          className="w-full px-5 py-4 flex items-center justify-between gap-4"
          style={{
            minHeight: 44,
            borderBottom: showPremiumRefs ? "1px solid var(--border)" : "none",
          }}
        >
          <div className="text-left">
            <div className="font-display text-base" style={{ color: "var(--amber)" }}>
              AWARD LEVEL REFERENCE — STUDY BEFORE EVERY PREMIUM BUILD
            </div>
          </div>
          <span className="font-mono text-xs shrink-0" style={{ color: "var(--text-dim)" }}>
            {showPremiumRefs ? "▲ COLLAPSE" : "▼ EXPAND"}
          </span>
        </button>

        {showPremiumRefs && (
          <div className="p-5 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PREMIUM_REFS.map((ref) => (
                <div
                  key={ref.name}
                  className="rounded p-4 flex flex-col gap-1"
                  style={{ background: "var(--bg-base)", border: "1px solid var(--border)" }}
                >
                  <div className="font-mono text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {ref.name}
                  </div>
                  <div className="font-mono leading-relaxed" style={{ color: "var(--text-muted)", fontSize: 11 }}>
                    {ref.detail}
                  </div>
                  <div
                    className="font-mono mt-1 uppercase"
                    style={{ color: "var(--amber)", fontSize: 9, letterSpacing: "0.1em" }}
                  >
                    STUDY VIA FIRECRAWL →
                  </div>
                </div>
              ))}
            </div>
            <div
              className="font-mono text-xs text-center"
              style={{ color: "var(--text-dim)" }}
            >
              firecrawl-website-design-clone · Extract patterns · Elevate, never copy.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
