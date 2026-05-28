"use client";

const SKILLS = [
  { name: "Impeccable", category: "QA", status: "active", version: "v2.0" },
  { name: "Firecrawl", category: "Scrape", status: "active", version: "v1.18.3" },
  { name: "GSAP", category: "Motion", status: "active", version: "v3.12" },
  { name: "Motion.dev", category: "Animation", status: "active", version: "v11" },
  { name: "Nano Banana 2", category: "Image Gen", status: "active", version: "latest" },
  { name: "Seedance 2.0", category: "Video Gen", status: "active", version: "i2v" },
  { name: "Kling 3.0", category: "Video Gen", status: "active", version: "pro" },
  { name: "Higgsfield", category: "Style Transfer", status: "active", version: "MCP" },
  { name: "GPT Image 2", category: "Image Edit", status: "active", version: "latest" },
  { name: "21st.dev MCP", category: "UI/UX", status: "pending", version: "manual" },
  { name: "Firecrawl MCP", category: "Data", status: "pending", version: "manual" },
  { name: "Cinematic Modules", category: "Components", status: "active", version: "v1.0" },
  { name: "Cursor Magic", category: "Interaction", status: "active", version: "built-in" },
  { name: "UI/UX Pro Max", category: "Design", status: "active", version: "v2" },
  { name: "OpenRouter", category: "LLM Fallback", status: "active", version: "live" },
  { name: "Muapi", category: "Video Router", status: "active", version: "v2" },
];

const CAT_COLORS: Record<string, string> = {
  "QA":             "#10b981",
  "Scrape":         "#3b82f6",
  "Motion":         "#8b5cf6",
  "Animation":      "#8b5cf6",
  "Image Gen":      "var(--amber)",
  "Video Gen":      "var(--amber)",
  "Style Transfer": "#f59e0b",
  "Image Edit":     "#f59e0b",
  "UI/UX":          "#ec4899",
  "Data":           "#3b82f6",
  "Components":     "#10b981",
  "Interaction":    "#06b6d4",
  "Design":         "#ec4899",
  "LLM Fallback":   "var(--text-muted)",
  "Video Router":   "var(--amber)",
};

export function SkillsStatus() {
  const active = SKILLS.filter((s) => s.status === "active").length;

  return (
    <div
      className="rounded-lg border"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <span className="font-display text-base" style={{ color: "var(--amber)" }}>
          SKILL STACK STATUS
        </span>
        <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
          {active}/{SKILLS.length} ACTIVE
        </span>
      </div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">
        {SKILLS.map((skill) => (
          <div
            key={skill.name}
            className="rounded p-2 flex flex-col gap-1"
            style={{
              background: "var(--bg-base)",
              border: `1px solid ${skill.status === "active" ? "var(--border)" : "transparent"}`,
              opacity: skill.status === "pending" ? 0.45 : 1,
            }}
          >
            <div
              className="font-mono text-xs font-bold leading-tight"
              style={{ color: skill.status === "active" ? "var(--text-primary)" : "var(--text-dim)" }}
            >
              {skill.name}
            </div>
            <div className="flex items-center justify-between">
              <span
                className="font-mono"
                style={{ fontSize: 9, color: CAT_COLORS[skill.category] ?? "var(--text-muted)" }}
              >
                {skill.category}
              </span>
              <span
                className="font-mono"
                style={{ fontSize: 9, color: skill.status === "active" ? "var(--green)" : "var(--red)" }}
              >
                {skill.status === "active" ? "✓" : "⊘"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
