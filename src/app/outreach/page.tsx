"use client";
import { PROSPECTS } from "@/lib/data";
import { TelegramPanel } from "@/components/TelegramPanel";
import type { ProspectStatus } from "@/types/models";

const STATUS_META: Record<ProspectStatus, { label: string; color: string }> = {
  found:          { label: "FOUND",          color: "var(--text-muted)" },
  queued:         { label: "QUEUED",         color: "var(--text-muted)" },
  auditing:       { label: "AUDITING",       color: "var(--amber)" },
  demo_built:     { label: "DEMO BUILT",     color: "#f59e0b" },
  demo_ready:     { label: "DEMO READY",     color: "var(--green)" },
  pitch_sent:     { label: "PITCH SENT",     color: "#3b82f6" },
  outreach_sent:  { label: "OUTREACH SENT",  color: "#3b82f6" },
  opened:         { label: "EMAIL OPENED",   color: "#8b5cf6" },
  replied:        { label: "REPLIED ✉",      color: "#8b5cf6" },
  converted:      { label: "CONVERTED",      color: "var(--green)" },
  won:            { label: "WON ✓",          color: "var(--green)" },
  lost:           { label: "LOST",           color: "var(--red)" },
};

const STATUS_ORDER: ProspectStatus[] = [
  "found", "queued", "auditing", "demo_built", "demo_ready",
  "pitch_sent", "outreach_sent", "opened", "replied", "converted", "won", "lost",
];

function StatusPipeline({ current }: { current: ProspectStatus }) {
  const steps = ["found", "auditing", "demo_ready", "pitch_sent", "opened", "replied", "won"] as ProspectStatus[];
  const currentIdx = steps.indexOf(current);

  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => {
        const done = i <= currentIdx;
        const meta = STATUS_META[s];
        return (
          <div key={s} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: done ? meta.color : "var(--bg-elevated)" }}
            />
            {i < steps.length - 1 && (
              <div
                className="h-px w-4"
                style={{ background: done && i < currentIdx ? meta.color : "var(--bg-elevated)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score <= 3 ? "var(--red)" : score <= 6 ? "var(--amber)" : "var(--green)";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--bg-elevated)" }}>
        <div className="h-full rounded-full" style={{ width: `${score * 10}%`, background: color }} />
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
      </div>

      {/* Prospect list */}
      <div className="flex flex-col gap-4">
        {PROSPECTS.map((p) => {
          const meta = STATUS_META[p.status] ?? { label: p.status.toUpperCase(), color: "var(--text-muted)" };
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
                  <div className="mt-2">
                    <StatusPipeline current={p.status} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className="font-mono text-xs px-2 py-1 rounded"
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
                  {p.revenuePotential && (
                    <span className="font-mono text-xs" style={{ color: "var(--green)" }}>
                      {p.revenuePotential} potential
                    </span>
                  )}
                </div>
              </div>

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

              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded font-mono text-xs transition-all hover:opacity-80"
                  style={{ background: "var(--amber-glow)", color: "var(--amber)", border: "1px solid var(--border-hover)" }}
                >
                  BUILD DEMO
                </button>
                <button
                  className="px-4 py-2 rounded font-mono text-xs transition-all hover:opacity-80"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                >
                  SEND PITCH
                </button>
                <button
                  className="px-4 py-2 rounded font-mono text-xs transition-all hover:opacity-80"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                >
                  ADVANCE STATUS ↑
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Telegram notifications */}
      <div>
        <div className="font-display text-lg mb-3" style={{ color: "var(--amber)" }}>TELEGRAM ALERTS</div>
        <TelegramPanel />
      </div>
    </div>
  );
}
