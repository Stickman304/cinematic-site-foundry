"use client";
import Link from "next/link";

const WORKFLOW_STEPS = [
  {
    step: "01",
    label: "INPUT",
    desc: "Select tier · paste URL · add brand notes · fire agents",
  },
  {
    step: "02",
    label: "DIRECTIONS",
    desc: "Orchestrator scrapes site · generates audit · produces Direction A & B",
  },
  {
    step: "03",
    label: "APPROVE",
    desc: "Review both directions · approve one · pipeline locks the build spec",
  },
  {
    step: "04",
    label: "BUILD",
    desc: "Executor builds mockup · QA inspector scores · preview goes live",
  },
];

export default function MissionControl() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 flex flex-col gap-6 max-w-4xl mx-auto w-full">

        {/* Ready state */}
        <div
          className="rounded-lg border px-6 py-8 flex flex-col items-center gap-3 text-center"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <div className="font-display text-3xl" style={{ color: "var(--amber)" }}>
            ORCHESTRATOR READY
          </div>
          <div className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>
            Use the command bar above to select a tier, enter a URL, and fire agents.
          </div>
          <div className="flex gap-3 mt-2">
            <Link
              href="/activity"
              className="font-mono text-xs px-4 py-2 rounded border transition-all"
              style={{
                borderColor: "var(--amber)",
                color: "var(--amber)",
                background: "var(--amber-glow)",
              }}
            >
              LIVE ACTIVITY →
            </Link>
            <Link
              href="/pipeline"
              className="font-mono text-xs px-4 py-2 rounded border transition-all"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-muted)",
              }}
            >
              PIPELINE VIEW
            </Link>
          </div>
        </div>

        {/* Workflow steps */}
        <div>
          <div className="font-display text-lg mb-4" style={{ color: "var(--amber)" }}>
            BUILD WORKFLOW
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {WORKFLOW_STEPS.map((s) => (
              <div
                key={s.step}
                className="rounded-lg border px-4 py-4 flex gap-4"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                <div
                  className="font-display text-2xl shrink-0 w-10 text-center leading-none pt-0.5"
                  style={{ color: "var(--amber)", opacity: 0.4 }}
                >
                  {s.step}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="font-display text-base" style={{ color: "var(--amber)" }}>
                    {s.label}
                  </div>
                  <div className="font-mono text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {s.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tiers reference */}
        <div>
          <div className="font-display text-lg mb-4" style={{ color: "var(--amber)" }}>
            TIERS
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "FAST RENOVATION", tier: "TIER 1", desc: "Fix an existing site. URL required." },
              { label: "NEW WEBSITE",     tier: "TIER 2", desc: "Build from scratch. URL optional." },
              { label: "PREMIUM REDESIGN",tier: "TIER 2", desc: "Full redesign with stronger design system." },
            ].map((t) => (
              <div
                key={t.label}
                className="rounded-lg border px-4 py-4 flex flex-col gap-1"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                <div className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>
                  {t.tier}
                </div>
                <div className="font-display text-base" style={{ color: "var(--amber)" }}>
                  {t.label}
                </div>
                <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  {t.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
