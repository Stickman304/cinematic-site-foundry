"use client";
import { useState } from "react";

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
  {
    id: "outreach_demo",
    label: "OUTREACH DEMO",
    icon: "◎",
    desc: "15-min pitch demo",
    stages: ["Audit", "Brand Profile", "Build (Light)", "QA"],
    avgCost: "$0.50",
    avgTime: "15 min",
  },
  {
    id: "premium",
    label: "PREMIUM",
    icon: "◇",
    desc: "Full cinematic build",
    stages: ["All 10 stages + social content"],
    avgCost: "$8.00",
    avgTime: "3 hr",
  },
  {
    id: "ugc_campaign",
    label: "UGC CAMPAIGN",
    icon: "◑",
    desc: "Social-first content pack",
    stages: ["Brand Profile", "Asset Gen", "Social", "Deploy"],
    avgCost: "$5.00",
    avgTime: "60 min",
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
    </div>
  );
}
