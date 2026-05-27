"use client";
import { useState } from "react";

const BUILD_TYPES = [
  { id: "audit", label: "AUDIT", desc: "Full site audit only" },
  { id: "renovate", label: "RENOVATE", desc: "Full renovation pipeline" },
  { id: "new_build", label: "NEW BUILD", desc: "From brief to deployed" },
  { id: "outreach_demo", label: "OUTREACH DEMO", desc: "15-min pitch demo" },
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

const ACTIVE_SKILLS = [
  "Impeccable", "UI/UX Pro Max", "Motion.dev", "GSAP",
  "Nano Banana Pro", "Seedance 2.0", "Kling 3.0", "Wiggle",
  "Firecrawl", "21st.dev MCP", "digital-marketing-pro", "cinematic-modules",
];

export default function Command() {
  const [url, setUrl] = useState("");
  const [buildType, setBuildType] = useState("audit");
  const [budget, setBudget] = useState("standard");
  const [fired, setFired] = useState(false);

  function handleFire() {
    if (!url) return;
    setFired(true);
    setTimeout(() => setFired(false), 3000);
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div>
        <div className="font-display text-3xl" style={{ color: "var(--amber)" }}>COMMAND CENTER</div>
        <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          FIRE THE FULL AGENT PIPELINE FROM HERE
        </div>
      </div>

      {/* URL + Build type */}
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
          />
        </div>

        {/* Build type */}
        <div>
          <label className="font-mono text-xs block mb-2" style={{ color: "var(--text-muted)" }}>BUILD TYPE</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {BUILD_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setBuildType(t.id)}
                className="p-3 rounded border text-left transition-all"
                style={{
                  background: buildType === t.id ? "var(--amber-glow)" : "var(--bg-elevated)",
                  borderColor: buildType === t.id ? "var(--amber)" : "var(--border)",
                  color: buildType === t.id ? "var(--amber)" : "var(--text-muted)",
                }}
              >
                <div className="font-display text-sm">{t.label}</div>
                <div className="font-mono text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
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

        {/* FIRE button */}
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

      {/* Active skills */}
      <div>
        <div className="font-display text-lg mb-3" style={{ color: "var(--amber)" }}>ACTIVE SKILL STACK</div>
        <div className="flex flex-wrap gap-2">
          {ACTIVE_SKILLS.map((s) => (
            <span
              key={s}
              className="font-mono text-xs px-3 py-1.5 rounded border"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              ✓ {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
