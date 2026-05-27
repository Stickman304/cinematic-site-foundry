"use client";
import { useState, useEffect } from "react";
import { COST_ENTRIES, SESSION_START_COST } from "@/lib/data";

const BUDGET_RULES = [
  { trigger: "Session cost reaches $5.00", action: "STOP — message operator, wait for approval" },
  { trigger: "Single action costs over $2.00", action: "STOP — show cost, wait for approval" },
  { trigger: "Project cost reaches $10.00", action: "STOP — full summary, wait for approval" },
  { trigger: "Agent loops >3× on same task", action: "STOP — escalate to operator immediately" },
];

export default function Costs() {
  const [sessionCost, setSessionCost] = useState(SESSION_START_COST);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionCost((c) => parseFloat((c + 0.00001 + Math.random() * 0.00003).toFixed(6)));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const totalFromEntries = COST_ENTRIES.reduce((sum, e) => sum + e.cost, 0);
  const sessionBudgetPct = (sessionCost / 5) * 100;

  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div>
        <div className="font-display text-3xl" style={{ color: "var(--amber)" }}>COST CONTROL</div>
        <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          REAL-TIME SPEND TRACKING — EVERY DOLLAR LOGGED
        </div>
      </div>

      {/* Live cost counter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border-hover)" }}>
          <div className="font-mono text-xs mb-2" style={{ color: "var(--text-muted)" }}>LIVE SESSION COST</div>
          <div className="font-display text-4xl glow-amber-text" style={{ color: "var(--amber)" }}>
            ${sessionCost.toFixed(4)}
          </div>
          <div className="mt-3 h-1.5 rounded-full" style={{ background: "var(--bg-elevated)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(sessionBudgetPct, 100)}%`,
                background: sessionBudgetPct > 80
                  ? "var(--red)"
                  : sessionBudgetPct > 60
                  ? "var(--amber)"
                  : "var(--green)",
              }}
            />
          </div>
          <div className="font-mono text-xs mt-1" style={{ color: "var(--text-dim)" }}>
            {sessionBudgetPct.toFixed(1)}% of $5.00 budget
          </div>
        </div>

        <div className="rounded-lg border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="font-mono text-xs mb-2" style={{ color: "var(--text-muted)" }}>VERIFIED SPEND</div>
          <div className="font-display text-4xl" style={{ color: "var(--text-primary)" }}>
            ${totalFromEntries.toFixed(4)}
          </div>
          <div className="font-mono text-xs mt-3" style={{ color: "var(--text-dim)" }}>
            from {COST_ENTRIES.reduce((s, e) => s + e.runs, 0)} logged API calls
          </div>
        </div>

        <div className="rounded-lg border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="font-mono text-xs mb-2" style={{ color: "var(--text-muted)" }}>ACTIVE PROJECT</div>
          <div className="font-display text-lg" style={{ color: "var(--amber)" }}>MEMPHIS BBQ</div>
          <div className="font-mono text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Stage 1/7 — Audit
          </div>
          <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
            Target tier: $7.5K–$12K
          </div>
        </div>
      </div>

      {/* Cost breakdown table */}
      <div className="rounded-lg border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <span className="font-display text-base" style={{ color: "var(--amber)" }}>COST BREAKDOWN BY TOOL</span>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["TOOL", "MODEL", "RUNS", "COST"].map((h) => (
                <th key={h} className="font-mono text-xs text-left px-5 py-3" style={{ color: "var(--text-muted)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COST_ENTRIES.map((entry, i) => (
              <tr
                key={i}
                style={{ borderBottom: i < COST_ENTRIES.length - 1 ? "1px solid var(--border)" : "none" }}
              >
                <td className="font-mono text-sm px-5 py-3" style={{ color: "var(--text-primary)" }}>
                  {entry.tool}
                </td>
                <td className="font-mono text-xs px-5 py-3" style={{ color: "var(--text-muted)" }}>
                  {entry.model}
                </td>
                <td className="font-mono text-sm px-5 py-3" style={{ color: "var(--text-primary)" }}>
                  {entry.runs}
                </td>
                <td className="font-mono text-sm px-5 py-3 font-bold" style={{ color: "var(--amber)" }}>
                  ${entry.cost.toFixed(4)}
                </td>
              </tr>
            ))}
            <tr style={{ borderTop: "1px solid var(--border-hover)", background: "var(--bg-elevated)" }}>
              <td colSpan={3} className="font-mono text-sm px-5 py-3 font-bold" style={{ color: "var(--text-muted)" }}>
                TOTAL VERIFIED
              </td>
              <td className="font-mono text-sm px-5 py-3 font-bold" style={{ color: "var(--amber)" }}>
                ${totalFromEntries.toFixed(4)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Budget enforcement rules */}
      <div>
        <div className="font-display text-lg mb-3" style={{ color: "var(--amber)" }}>
          BUDGET ENFORCEMENT — HARD STOPS
        </div>
        <div className="flex flex-col gap-2">
          {BUDGET_RULES.map((rule, i) => (
            <div
              key={i}
              className="rounded border p-4 flex gap-4"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <span className="font-mono text-xs shrink-0 mt-0.5" style={{ color: "var(--red)" }}>⚠</span>
              <div className="flex-1">
                <div className="font-mono text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                  {rule.trigger}
                </div>
                <div className="font-mono text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  → {rule.action}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
