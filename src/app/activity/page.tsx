"use client";
import { useState, useEffect } from "react";

const AGENT_ROSTER = [
  { id: "orchestrator", name: "orchestrator", tier: "ALL", task: "Coordinating build pipeline...", elapsed: "2m 14s", status: "active" },
  { id: "brand-guardian", name: "brand-guardian", tier: "TIER 1", task: "Locking brand palette and typography rules", elapsed: "1m 48s", status: "active" },
  { id: "cinematic-ui", name: "cinematic-ui", tier: "ALL", task: "Director: Kubrick → decisions.md produced", elapsed: "Completed", status: "complete" },
  { id: "scout", name: "scout", tier: "ALL", task: "Firecrawl scrape → brand_profile.json", elapsed: "3m 02s", status: "active" },
  { id: "visual-storyteller", name: "visual-storyteller", tier: "ALL", task: "Waiting for brand-guardian sign-off", elapsed: "—", status: "waiting" },
  { id: "image-prompt-engineer", name: "image-prompt-engineer", tier: "TIER 2+", task: "Standby — creative brief not yet approved", elapsed: "—", status: "idle" },
  { id: "frontend-developer", name: "frontend-developer", tier: "ALL", task: "Building hero section...", elapsed: "0m 33s", status: "active" },
  { id: "21st-magic", name: "21st.dev Magic MCP", tier: "ALL", task: "Component: cinematic-hero-shader", elapsed: "Completed", status: "complete" },
  { id: "design-motion", name: "design-motion-principles", tier: "ALL", task: "Motion audit: 2 gaps found", elapsed: "Completed", status: "complete" },
  { id: "impeccable", name: "impeccable", tier: "ALL", task: "Score: 87/100 — polishing...", elapsed: "0m 12s", status: "waiting" },
  { id: "content-creator", name: "content-creator", tier: "ALL", task: "No build in queue", elapsed: "—", status: "idle" },
  { id: "reality-checker", name: "reality-checker", tier: "ALL", task: "No build in QA queue", elapsed: "—", status: "idle" },
];

const INITIAL_LOG = [
  { ts: "14:23:01", agent: "brand-guardian", action: "Locked brand palette #c8973a" },
  { ts: "14:23:04", agent: "cinematic-ui", action: "Director: Kubrick · decisions.md produced" },
  { ts: "14:23:09", agent: "frontend-developer", action: "Building hero section..." },
  { ts: "14:24:11", agent: "21st.dev Magic", action: "Component: cinematic-hero-shader" },
  { ts: "14:26:33", agent: "design-motion-principles", action: "Motion audit: 2 gaps found" },
  { ts: "14:27:01", agent: "impeccable", action: "Score: 87/100 — polishing..." },
  { ts: "14:27:44", agent: "scout", action: "Firecrawl: 14 pages scraped" },
  { ts: "14:28:02", agent: "orchestrator", action: "Stage 1 complete → advancing to Stage 2" },
];

const STATUS_DOT: Record<string, { symbol: string; color: string; label: string }> = {
  active:   { symbol: "🟢", color: "var(--green)",      label: "ACTIVE" },
  waiting:  { symbol: "🟡", color: "#f59e0b",           label: "WAITING" },
  complete: { symbol: "✅", color: "var(--text-muted)", label: "COMPLETE" },
  error:    { symbol: "🔴", color: "var(--red)",        label: "ERROR" },
  idle:     { symbol: "⚪", color: "var(--text-dim)",   label: "IDLE" },
};

export default function Activity() {
  const [log, setLog] = useState(INITIAL_LOG);
  const [source, setSource] = useState<"Ruflo" | "Supabase backup">("Ruflo");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      if (Math.random() > 0.7) {
        const actions = [
          { agent: "orchestrator", action: "Heartbeat — pipeline nominal" },
          { agent: "scout", action: "Scanning prospect #4..." },
          { agent: "impeccable", action: "Score updated: 88/100" },
          { agent: "brand-guardian", action: "Typography rules locked" },
          { agent: "frontend-developer", action: "Scroll animation wired" },
        ];
        const entry = actions[Math.floor(Math.random() * actions.length)];
        const now = new Date();
        const ts = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
        setLog((prev) => [{ ts, ...entry }, ...prev].slice(0, 40));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const activeCount = AGENT_ROSTER.filter((a) => a.status === "active").length;
  const completeCount = AGENT_ROSTER.filter((a) => a.status === "complete").length;
  const waitingCount = AGENT_ROSTER.filter((a) => a.status === "waiting").length;

  return (
    <div className="p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display text-3xl" style={{ color: "var(--amber)" }}>LIVE ACTIVITY — CREW STATUS</div>
          <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {source} primary · Supabase backup · 2s refresh
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ background: "var(--green)", boxShadow: "0 0 8px rgba(46,204,113,0.6)" }}
          />
          <span className="font-mono text-xs" style={{ color: "var(--green)" }}>ACTIVE</span>
        </div>
      </div>

      {/* Swarm Status Bar */}
      <div
        className="rounded-lg border px-5 py-4 flex flex-wrap gap-6"
        style={{ background: "var(--bg-card)", borderColor: "var(--border-hover)" }}
      >
        <div>
          <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>SWARM STATUS</div>
          <div className="font-display text-base mt-0.5" style={{ color: "var(--amber)" }}>🐝 ACTIVE</div>
        </div>
        <div>
          <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>TOPOLOGY</div>
          <div className="font-mono text-sm mt-0.5" style={{ color: "var(--text-primary)" }}>Hierarchical</div>
        </div>
        <div>
          <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>AGENTS</div>
          <div className="font-mono text-sm mt-0.5" style={{ color: "var(--text-primary)" }}>
            <span style={{ color: "var(--green)" }}>{activeCount}</span>/{AGENT_ROSTER.length} active
          </div>
        </div>
        <div>
          <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>TASKS</div>
          <div className="font-mono text-sm mt-0.5" style={{ color: "var(--text-primary)" }}>
            {AGENT_ROSTER.length} total ·{" "}
            <span style={{ color: "var(--green)" }}>{completeCount} complete</span> ·{" "}
            <span style={{ color: "var(--amber)" }}>{activeCount} in-progress</span> ·{" "}
            <span style={{ color: "#f59e0b" }}>{waitingCount} pending</span>
          </div>
        </div>
        <div>
          <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>MEMORY</div>
          <div className="font-mono text-sm mt-0.5" style={{ color: "var(--green)" }}>ECC session hooks active</div>
        </div>
        <div className="ml-auto">
          <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>SOURCE</div>
          <div className="flex gap-2 mt-0.5">
            {(["Ruflo", "Supabase backup"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSource(s)}
                className="font-mono text-xs px-2 py-0.5 rounded"
                style={{
                  background: source === s ? "var(--amber-glow)" : "var(--bg-elevated)",
                  color: source === s ? "var(--amber)" : "var(--text-dim)",
                  border: `1px solid ${source === s ? "var(--amber)" : "var(--border)"}`,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {AGENT_ROSTER.map((agent) => {
          const dot = STATUS_DOT[agent.status];
          return (
            <div
              key={agent.id}
              className="rounded-lg border p-4 flex flex-col gap-2"
              style={{
                background: "var(--bg-card)",
                borderColor: agent.status === "active" ? "var(--border-hover)" : "var(--border)",
                boxShadow: agent.status === "active" ? "0 0 16px rgba(200,151,58,0.08)" : "none",
                opacity: agent.status === "idle" ? 0.55 : 1,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span>{dot.symbol}</span>
                  <div>
                    <div className="font-display text-sm" style={{ color: "var(--amber)" }}>
                      {agent.name}
                    </div>
                    <div
                      className="font-mono px-1.5 py-0.5 rounded mt-0.5 inline-block"
                      style={{ fontSize: 9, background: "var(--bg-elevated)", color: "var(--text-dim)" }}
                    >
                      {agent.tier}
                    </div>
                  </div>
                </div>
                <span
                  className="font-mono text-xs px-2 py-0.5 rounded shrink-0"
                  style={{ background: "var(--bg-elevated)", color: dot.color }}
                >
                  {dot.label}
                </span>
              </div>
              <div
                className="font-mono text-xs leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                {agent.task}
              </div>
              <div
                className="font-mono border-t pt-2"
                style={{ fontSize: 10, color: "var(--text-dim)", borderColor: "var(--border)" }}
              >
                {agent.status === "idle" ? "Not called yet" : `Started: ${agent.elapsed} ago`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Build Log */}
      <div className="rounded-lg border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div
          className="px-5 py-3 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border)" }}
        >
          <span className="font-display text-base" style={{ color: "var(--amber)" }}>BUILD LOG</span>
          <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
            {log.length} entries · live · tick #{tick}
          </span>
        </div>
        <div className="flex flex-col divide-y max-h-80 overflow-y-auto" style={{ borderColor: "var(--border)" }}>
          {log.map((entry, i) => (
            <div key={i} className="px-5 py-2.5 flex items-center gap-4">
              <span className="font-mono text-xs shrink-0" style={{ color: "var(--text-dim)" }}>
                {entry.ts}
              </span>
              <span
                className="font-mono text-xs shrink-0 px-1.5 py-0.5 rounded"
                style={{ background: "var(--bg-elevated)", color: "var(--amber)" }}
              >
                {entry.agent}
              </span>
              <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                {entry.action}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
