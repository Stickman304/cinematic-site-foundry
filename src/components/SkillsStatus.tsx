"use client";

const ACTIVE_SKILLS = [
  "Firecrawl MCP · 25+ skills",
  "21st.dev Magic MCP",
  "Higgsfield MCP (OAuth) — L1+L2+L3",
  "Stitch MCP — stitch-design-taste + stitch-skills",
  "Gmail MCP",
  "Google Calendar MCP",
  "Google Drive MCP",
  "Ruflo MCP (3 tools)",
  "ECC — harness + memory + orchestration",
  "UI/UX Pro Max",
  "Impeccable",
  "frontend-design",
  "cinematic-modules (30)",
  "cinematic-ui (film director workflow)",
  "design-taste-frontend (Taste Skill v2)",
  "imagegen-frontend-web · image-to-code-skill · redesign-skill",
  "VOIDXAI/taste (5-dimension judgment)",
  "LottieFiles/motion-design-skill",
  "RoboNuggets: higgsfield-skill · seedance-skill",
  "design-motion-principles",
  "emilkowalski/skill (case-by-case)",
  "claudedesignskills (23 skills)",
  "framer-motion-skill",
  "motion-dev-skill",
  "website-builder-setup",
  "tweak · personalise",
  "design-system · awesome-design-md",
  "digital-marketing-pro",
  "caveman suite",
  "calibrate · evolver · graphify",
  "notebooklm-py",
  "arcads-external-api",
  "last30days-skill",
  "vercel skills suite",
  "gsd suite (80+ commands)",
  "claude-gstack",
  "MotionSites.ai (65 hero prompts)",
  "RoboNuggets design-system",
];

const NEEDS_CONFIG = [
  { name: "Meta Ads MCP", note: "not yet installed" },
  { name: "Telegram bots", note: "verify active: 227955526" },
  { name: "n8n Scout workflow", note: "schedule Monday 6AM" },
  { name: "n8n Prospector", note: "schedule weekly" },
];

const BROWSER_ONLY = [
  { name: "Reloom", note: "reloom.com · Tier 2 zero-brand clients", href: "https://reloom.com" },
  { name: "Google Flow", note: "labs.google/fx/tools/flow · Tier 2+ video", href: "https://labs.google/fx/tools/flow" },
];

export function SkillsStatus() {
  return (
    <div
      className="rounded-lg border"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <span className="font-display text-base" style={{ color: "var(--amber)" }}>
          SKILL STACK STATUS
        </span>
        <span className="font-mono text-xs" style={{ color: "var(--green)" }}>
          {ACTIVE_SKILLS.length} ACTIVE · {NEEDS_CONFIG.length} NEED CONFIG
        </span>
      </div>

      <div className="p-4 flex flex-col gap-5">
        {/* ACTIVE */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--green)" }} />
            <span className="font-mono text-xs font-bold" style={{ color: "var(--green)" }}>ACTIVE</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ACTIVE_SKILLS.map((s) => (
              <span
                key={s}
                className="font-mono px-2 py-0.5 rounded"
                style={{ fontSize: 10, background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* NEEDS CONFIG */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full" style={{ background: "#f59e0b" }} />
            <span className="font-mono text-xs font-bold" style={{ color: "#f59e0b" }}>NEEDS CONFIG</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {NEEDS_CONFIG.map((s) => (
              <span
                key={s.name}
                className="font-mono px-2 py-0.5 rounded"
                style={{ fontSize: 10, background: "var(--bg-elevated)", color: "#f59e0b", border: "1px solid #f59e0b44" }}
                title={s.note}
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>

        {/* BROWSER ONLY */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>🔗</span>
            <span className="font-mono text-xs font-bold" style={{ color: "var(--text-muted)" }}>BROWSER ONLY</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {BROWSER_ONLY.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono px-2 py-0.5 rounded"
                style={{ fontSize: 10, background: "var(--bg-elevated)", color: "var(--text-dim)", border: "1px solid var(--border)" }}
                title={s.note}
              >
                {s.name} ↗
              </a>
            ))}
          </div>
        </div>

        {/* AGENTS */}
        <div className="border-t pt-3" style={{ borderColor: "var(--border)" }}>
          <span className="font-mono text-xs font-bold" style={{ color: "var(--text-muted)" }}>AGENTS — 200+ installed</span>
          <div className="font-mono text-xs mt-1" style={{ color: "var(--text-dim)", lineHeight: 1.8 }}>
            ECC (harness + memory + orchestration) ·{" "}
            NicholasSpisak/claude-code-subagents (primary roster) ·{" "}
            trend-researcher (Scout) ·{" "}
            prospector (client acquisition)
          </div>
        </div>
      </div>
    </div>
  );
}
