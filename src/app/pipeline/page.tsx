"use client";
import { useState } from "react";
import { PIPELINE_STAGES } from "@/lib/data";

const SIX_STEPS = [
  { n: 1, label: "INTELLIGENCE", detail: "Firecrawl + Stitch + competitive intel" },
  { n: 2, label: "DESIGN SYSTEM", detail: "UI/UX Pro Max + RoboNuggets + awesome-design-md" },
  { n: 3, label: "ANTI-SLOP + DIRECTION", detail: "frontend-design + Taste Skill + cinematic-ui → decisions.md + storyboard.md" },
  { n: 4, label: "COMPONENTS", detail: "21st.dev Magic /ui + MotionSites.ai prompts" },
  { n: 5, label: "MOTION PRINCIPLES", detail: "LottieFiles (principles first) + cinematic-modules + framer + motion-dev" },
  { n: 6, label: "QUALITY GATE", detail: "design-motion-principles + VOIDXAI/taste + impeccable 85/90+ + Vercel performance rules" },
];

const PREMIUM_REFS = [
  { name: "shader.se", detail: "WebGPU + R3F + TSL · Lenis scroll · Codrops May 2026" },
  { name: "airborne.studio", detail: "Kinetic bold type + floating 3D objects" },
  { name: "longshotfeatures.com", detail: "Film noir WebGL · B&W composition" },
  { name: "vincent-lowe.info", detail: "Editorial scroll-driven photography" },
];

const MODEL_COLORS: Record<string, string> = {
  "claude-sonnet-4-6": "#3b82f6",
  "claude-opus-4-6": "#8b5cf6",
  "claude-haiku-4-5": "#10b981",
  "nano-banana-pro": "var(--amber)",
  "seedance-2.0": "#f59e0b",
};

function msToTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

export default function Pipeline() {
  const [showProjectBrief, setShowProjectBrief] = useState(false);
  const [showFoundation, setShowFoundation] = useState(false);
  const [showPremiumRefs, setShowPremiumRefs] = useState(false);

  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div>
        <div className="font-display text-3xl" style={{ color: "var(--amber)" }}>PIPELINE</div>
        <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          10-STAGE AUTONOMOUS BUILD PIPELINE — MEMPHIS BBQ SUPPLY
        </div>
      </div>

      {/* Addition H — Step 0 PROJECT BRIEF */}
      <div
        className="rounded-lg border p-5"
        style={{ background: "var(--bg-card)", borderColor: "var(--amber)", boxShadow: "0 0 20px rgba(200,151,58,0.08)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-display text-xl" style={{ color: "var(--amber)" }}>⚡ STEP 0 — PROJECT BRIEF</div>
            <div className="font-mono text-xs mt-1" style={{ color: "#f59e0b" }}>REQUIRED BEFORE ANY AGENT FIRES</div>
            <div className="font-mono text-xs mt-2" style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
              Create PROJECT-BRIEF.md for this client. Every agent reads this first.<br />
              Without it: agents are generic. With it: agents are specialists.
            </div>
            <div className="font-mono text-xs mt-2" style={{ color: "var(--text-dim)" }}>
              Fields: client · brand · products · tier · deploy · stats · social · notes
            </div>
          </div>
          <button
            onClick={() => setShowProjectBrief((p) => !p)}
            className="font-mono text-xs px-4 py-2.5 rounded shrink-0 transition-all"
            style={{
              background: showProjectBrief ? "var(--bg-elevated)" : "var(--amber)",
              color: showProjectBrief ? "var(--text-muted)" : "#000",
              minHeight: 44,
            }}
          >
            {showProjectBrief ? "CLOSE" : "📋 CREATE PROJECT BRIEF"}
          </button>
        </div>

        {showProjectBrief && (
          <div className="mt-4 flex flex-col gap-3">
            {["Client name", "Brand description", "Products / services", "Tier (1 / 2 / 3 / Premium / UGC)", "Deploy target (Vercel / Netlify)", "Stats (reviews, revenue signals)", "Social handles", "Notes"].map((field) => (
              <div key={field}>
                <label className="font-mono text-xs block mb-1" style={{ color: "var(--text-dim)" }}>{field.toUpperCase()}</label>
                <input
                  className="w-full px-3 py-2 rounded font-mono text-xs outline-none"
                  style={{ background: "var(--bg-base)", color: "var(--text-primary)", border: "1px solid var(--border)", caretColor: "var(--amber)" }}
                  placeholder={field}
                />
              </div>
            ))}
            <button
              className="font-mono text-xs px-4 py-2.5 rounded mt-2 self-start transition-all"
              style={{ background: "var(--amber)", color: "#000", minHeight: 44 }}
            >
              GENERATE PROJECT-BRIEF.md
            </button>
          </div>
        )}
      </div>

      {/* Addition I — 6-Step Design Foundation collapsible */}
      <div className="rounded-lg border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <button
          onClick={() => setShowFoundation((o) => !o)}
          className="w-full px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: showFoundation ? "1px solid var(--border)" : "none" }}
        >
          <span className="font-display text-base" style={{ color: "var(--amber)" }}>THE 6-STEP DESIGN FOUNDATION</span>
          <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
            {showFoundation ? "▲ COLLAPSE" : "▼ EXPAND"} · fires on every tier · no exceptions
          </span>
        </button>
        {showFoundation && (
          <div className="p-5 flex flex-col gap-3">
            {SIX_STEPS.map((step) => (
              <div key={step.n} className="flex items-start gap-4">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center font-display text-sm shrink-0"
                  style={{ background: "var(--amber-glow)", border: "2px solid var(--amber)", color: "var(--amber)" }}
                >
                  {step.n}
                </div>
                <div>
                  <div className="font-display text-sm" style={{ color: "var(--amber)" }}>{step.label}</div>
                  <div className="font-mono text-xs" style={{ color: "var(--text-muted)", fontSize: 10 }}>{step.detail}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Addition J — Premium Reference Sites collapsible */}
      <div className="rounded-lg border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <button
          onClick={() => setShowPremiumRefs((o) => !o)}
          className="w-full px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: showPremiumRefs ? "1px solid var(--border)" : "none" }}
        >
          <span className="font-display text-base" style={{ color: "var(--amber)" }}>AWARD LEVEL REFERENCE — PREMIUM BUILDS</span>
          <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
            {showPremiumRefs ? "▲ COLLAPSE" : "▼ EXPAND"} · study before every Premium build
          </span>
        </button>
        {showPremiumRefs && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            {PREMIUM_REFS.map((ref) => (
              <div
                key={ref.name}
                className="rounded p-3 flex flex-col gap-1"
                style={{ background: "var(--bg-base)", border: "1px solid var(--border)" }}
              >
                <div className="font-mono text-xs font-bold" style={{ color: "var(--amber)" }}>{ref.name}</div>
                <div className="font-mono text-xs" style={{ color: "var(--text-muted)", fontSize: 10 }}>{ref.detail}</div>
                <div className="font-mono text-xs mt-1" style={{ color: "var(--text-dim)", fontSize: 9 }}>
                  STUDY VIA FIRECRAWL → firecrawl-website-design-clone
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {PIPELINE_STAGES.map((stage) => {
          const active = stage.status === "active";
          const done = stage.status === "complete";
          const pending = stage.status === "pending";

          const stateColor = active
            ? "var(--amber)"
            : done
            ? "var(--green)"
            : "var(--text-dim)";

          return (
            <div
              key={stage.n}
              className="rounded-lg border p-5 transition-all"
              style={{
                background: "var(--bg-card)",
                borderColor: active ? "var(--border-hover)" : "var(--border)",
                boxShadow: active ? "0 0 24px rgba(200,151,58,0.1)" : "none",
                opacity: pending ? 0.5 : 1,
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {/* Stage number */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-display text-lg shrink-0"
                    style={{
                      background: active ? "var(--amber-glow)" : "var(--bg-elevated)",
                      border: `2px solid ${stateColor}`,
                      color: stateColor,
                      boxShadow: active ? "0 0 20px rgba(200,151,58,0.35)" : "none",
                    }}
                  >
                    {done ? "✓" : stage.n}
                  </div>

                  <div>
                    <div className="font-display text-xl" style={{ color: stateColor }}>
                      {stage.label}
                    </div>
                    <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                      {stage.sub}
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                <span
                  className="font-mono text-xs px-2 py-1 rounded uppercase"
                  style={{
                    background: active ? "var(--amber-glow)" : "var(--bg-elevated)",
                    color: stateColor,
                  }}
                >
                  {active && <span className="pulse-dot-amber inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style={{ background: "var(--amber)" }} />}
                  {stage.status}
                </span>
              </div>

              {/* Active stage details */}
              {active && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {stage.elapsedMs !== undefined && (
                    <div className="rounded p-3" style={{ background: "var(--bg-base)" }}>
                      <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>ELAPSED</div>
                      <div className="font-mono text-base font-bold mt-1" style={{ color: "var(--amber)" }}>
                        {msToTime(stage.elapsedMs)}
                      </div>
                    </div>
                  )}
                  {stage.model && (
                    <div className="rounded p-3" style={{ background: "var(--bg-base)" }}>
                      <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>MODEL</div>
                      <div
                        className="font-mono text-xs font-bold mt-1"
                        style={{ color: MODEL_COLORS[stage.model] ?? "var(--text-primary)" }}
                      >
                        {stage.model}
                      </div>
                    </div>
                  )}
                  {stage.tokensUsed !== undefined && (
                    <div className="rounded p-3" style={{ background: "var(--bg-base)" }}>
                      <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>TOKENS</div>
                      <div className="font-mono text-base font-bold mt-1" style={{ color: "var(--amber)" }}>
                        {stage.tokensUsed.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Agents */}
              <div className="mt-3 flex flex-wrap gap-2">
                {stage.agents.map((a) => (
                  <span
                    key={a}
                    className="font-mono text-xs px-2 py-0.5 rounded"
                    style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
