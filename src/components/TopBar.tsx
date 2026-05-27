"use client";
import { useState, useEffect } from "react";
import { SESSION_START_COST, AGENTS, ACTIVE_BUILD } from "@/lib/data";

export function TopBar() {
  const [cost, setCost] = useState(SESSION_START_COST);
  const activeAgents = AGENTS.filter((a) => a.status === "active").length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCost((c) => parseFloat((c + 0.00001 + Math.random() * 0.00003).toFixed(6)));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="flex items-center justify-between px-6 py-3 border-b z-50 shrink-0"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Left — brand */}
      <div className="flex items-center gap-4">
        <span className="font-display text-2xl glow-amber-text" style={{ color: "var(--amber)" }}>
          STICK MAN CINEMATIC AGENCY
        </span>
        <span
          className="font-mono text-xs px-2 py-0.5 rounded border"
          style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
        >
          MISSION CONTROL v1.0
        </span>
      </div>

      {/* Center — active build */}
      {ACTIVE_BUILD && (
        <div className="hidden md:flex items-center gap-2">
          <span className="pulse-dot-amber w-2 h-2 rounded-full" style={{ background: "var(--amber)" }} />
          <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            ACTIVE BUILD:
          </span>
          <span className="font-mono text-xs" style={{ color: "var(--amber)" }}>
            {ACTIVE_BUILD.clientName.toUpperCase()}
          </span>
          <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            STAGE {ACTIVE_BUILD.currentStage}/7
          </span>
        </div>
      )}

      {/* Right — metrics */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>AGENTS</span>
          <span
            className="font-mono text-sm font-bold px-2 py-0.5 rounded"
            style={{ background: "var(--amber-glow)", color: "var(--amber)" }}
          >
            {activeAgents} ACTIVE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>SESSION COST</span>
          <span className="font-mono text-sm font-bold" style={{ color: "var(--amber)" }}>
            ${cost.toFixed(4)}
          </span>
        </div>
      </div>
    </header>
  );
}
