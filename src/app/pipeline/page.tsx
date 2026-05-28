"use client";
import { PIPELINE_STAGES } from "@/lib/data";

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
  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div>
        <div className="font-display text-3xl" style={{ color: "var(--amber)" }}>PIPELINE</div>
        <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          10-STAGE AUTONOMOUS BUILD PIPELINE — MEMPHIS BBQ SUPPLY
        </div>
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
