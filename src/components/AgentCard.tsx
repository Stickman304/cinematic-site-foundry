"use client";
import type { Agent } from "@/types/models";

const STATUS_COLORS: Record<Agent["status"], string> = {
  active: "var(--amber)",
  idle: "var(--text-muted)",
  blocked: "var(--red)",
  complete: "var(--green)",
};

const STATUS_BG: Record<Agent["status"], string> = {
  active: "rgba(200,151,58,0.12)",
  idle: "rgba(90,98,114,0.1)",
  blocked: "rgba(231,76,60,0.1)",
  complete: "rgba(46,204,113,0.1)",
};

export function AgentCard({ agent, onClick }: { agent: Agent; onClick?: () => void }) {
  const color = STATUS_COLORS[agent.status];
  const isActive = agent.status === "active";

  return (
    <div
      onClick={onClick}
      className="rounded-lg p-4 border flex flex-col gap-3 transition-all"
      style={{
        background: "var(--bg-card)",
        borderColor: isActive ? "var(--border-hover)" : "var(--border)",
        boxShadow: isActive ? "0 0 20px rgba(200,151,58,0.08)" : "none",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-lg" style={{ color: "var(--text-primary)" }}>
            {agent.name}
          </div>
          <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            {agent.role}
          </div>
        </div>
        <span
          className="font-mono text-xs px-2 py-1 rounded uppercase"
          style={{ background: STATUS_BG[agent.status], color }}
        >
          {isActive && (
            <span
              className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 pulse-dot-amber align-middle"
              style={{ background: color }}
            />
          )}
          {agent.status}
        </span>
      </div>

      {/* Current action */}
      <div
        className="font-mono text-xs px-3 py-2 rounded"
        style={{ background: "var(--bg-base)", color: "var(--text-muted)", minHeight: 36 }}
      >
        {agent.currentAction}
      </div>

      {/* Progress bar */}
      {agent.status !== "idle" && (
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>PROGRESS</span>
            <span className="font-mono text-xs" style={{ color }}>{agent.progress}%</span>
          </div>
          <div className="h-1 rounded-full" style={{ background: "var(--bg-elevated)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${agent.progress}%`,
                background: `linear-gradient(90deg, var(--amber-dim), ${color})`,
              }}
            />
          </div>
        </div>
      )}

      {/* Cost */}
      <div className="flex justify-end">
        <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
          ${agent.sessionCost.toFixed(4)}
        </span>
      </div>
    </div>
  );
}
