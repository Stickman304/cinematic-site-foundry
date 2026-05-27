"use client";
import { PROSPECTS } from "@/lib/data";

const STATUS_META: Record<string, { label: string; color: string }> = {
  queued:        { label: "QUEUED",         color: "var(--text-muted)" },
  auditing:      { label: "AUDITING",       color: "var(--amber)" },
  demo_ready:    { label: "DEMO READY",     color: "var(--green)" },
  outreach_sent: { label: "OUTREACH SENT",  color: "#3b82f6" },
  won:           { label: "WON ✓",          color: "var(--green)" },
  lost:          { label: "LOST",           color: "var(--red)" },
};

function ScoreBar({ score }: { score: number }) {
  const color = score <= 3 ? "var(--red)" : score <= 6 ? "var(--amber)" : "var(--green)";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--bg-elevated)" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${score * 10}%`, background: color }}
        />
      </div>
      <span className="font-mono text-xs font-bold w-4" style={{ color }}>{score}</span>
    </div>
  );
}

export default function Outreach() {
  return (
    <div className="p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-3xl" style={{ color: "var(--amber)" }}>OUTREACH PIPELINE</div>
          <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {PROSPECTS.length} PROSPECT{PROSPECTS.length !== 1 ? "S" : ""} IN PIPELINE
          </div>
        </div>
        {/* Telegram status */}
        <div
          className="font-mono text-xs px-3 py-2 rounded border flex items-center gap-2"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)", background: "var(--bg-card)" }}
        >
          <span style={{ color: "var(--red)" }}>●</span>
          TELEGRAM — AWAITING TOKEN
        </div>
      </div>

      {/* Prospect list */}
      <div className="flex flex-col gap-4">
        {PROSPECTS.map((p) => {
          const meta = STATUS_META[p.status];
          return (
            <div
              key={p.id}
              className="rounded-lg border p-5 flex flex-col gap-4"
              style={{
                background: "var(--bg-card)",
                borderColor: p.status === "auditing" ? "var(--border-hover)" : "var(--border)",
                boxShadow: p.status === "auditing" ? "0 0 20px rgba(200,151,58,0.08)" : "none",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="font-display text-xl" style={{ color: "var(--text-primary)" }}>
                    {p.name}
                  </div>
                  <div className="font-mono text-xs mt-0.5" style={{ color: "var(--amber)" }}>
                    {p.url}
                  </div>
                  <div className="font-mono text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {p.industry}
                  </div>
                </div>
                <span
                  className="font-mono text-xs px-2 py-1 rounded shrink-0"
                  style={{
                    background: p.status === "auditing" ? "var(--amber-glow)" : "var(--bg-elevated)",
                    color: meta.color,
                  }}
                >
                  {p.status === "auditing" && (
                    <span className="pulse-dot-amber inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style={{ background: "var(--amber)" }} />
                  )}
                  {meta.label}
                </span>
              </div>

              {/* Score bar */}
              <div>
                <div className="font-mono text-xs mb-1" style={{ color: "var(--text-muted)" }}>SITE QUALITY SCORE</div>
                <ScoreBar score={p.score} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>EST. REVENUE</div>
                  <div className="font-mono text-sm" style={{ color: "var(--text-primary)" }}>{p.estimatedRevenue}</div>
                </div>
                <div>
                  <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>RECOMMENDED TIER</div>
                  <div className="font-mono text-sm" style={{ color: "var(--amber)" }}>{p.recommendedTier}</div>
                </div>
              </div>

              <div className="font-mono text-xs p-3 rounded" style={{ background: "var(--bg-base)", color: "var(--text-muted)" }}>
                {p.notes}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded font-mono text-xs transition-all"
                  style={{ background: "var(--amber-glow)", color: "var(--amber)", border: "1px solid var(--border-hover)" }}
                >
                  BUILD DEMO
                </button>
                <button
                  className="px-4 py-2 rounded font-mono text-xs transition-all"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                >
                  SEND PITCH
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
