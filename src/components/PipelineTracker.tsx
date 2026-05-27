"use client";
import type { PipelineStage } from "@/types/models";

function msToTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

export function PipelineTracker({ stages }: { stages: PipelineStage[] }) {
  return (
    <div
      className="rounded-lg border p-4"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="font-display text-base mb-4" style={{ color: "var(--amber)" }}>
        7-STAGE PIPELINE
      </div>
      <div className="flex items-center gap-0">
        {stages.map((stage, i) => {
          const active = stage.status === "active";
          const done = stage.status === "complete";
          const blocked = stage.status === "blocked";

          const nodeColor = active
            ? "var(--amber)"
            : done
            ? "var(--green)"
            : blocked
            ? "var(--red)"
            : "var(--text-dim)";

          return (
            <div key={stage.n} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                {/* Node */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all"
                  style={{
                    background: active ? "var(--amber-glow)" : "var(--bg-elevated)",
                    border: `2px solid ${nodeColor}`,
                    color: nodeColor,
                    boxShadow: active ? "0 0 16px rgba(200,151,58,0.4)" : "none",
                  }}
                >
                  {done ? "✓" : stage.n}
                </div>
                {/* Label */}
                <div className="text-center">
                  <div className="font-display text-xs" style={{ color: nodeColor }}>
                    {stage.label}
                  </div>
                  {active && stage.elapsedMs && (
                    <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
                      {msToTime(stage.elapsedMs)}
                    </div>
                  )}
                </div>
              </div>
              {/* Connector */}
              {i < stages.length - 1 && (
                <div
                  className="h-px flex-1 mx-1"
                  style={{
                    background: i < stages.findIndex((s) => s.status === "active")
                      ? "var(--green)"
                      : "var(--border)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
