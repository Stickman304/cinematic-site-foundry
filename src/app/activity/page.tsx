"use client";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ActivityFeed } from "@/components/ActivityFeed";
import type { BuildRecord, WorkflowState, QAScorecardDimension } from "@/types/models";
import { WORKFLOW_STEPS } from "@/types/models";

// ── Constants ─────────────────────────────────────────────────────────────────

const STALL_THRESHOLD_MS = 90_000;

const TERMINAL_STATES: WorkflowState[] = [
  "WAITING_FOR_APPROVAL", "COMPLETE", "OUTREACH_DRAFTED",
  "PREVIEW_READY", "ERROR", "EXECUTOR_FAILED",
];

function isTerminal(state: WorkflowState) {
  return TERMINAL_STATES.includes(state);
}

function pollInterval(state: WorkflowState): number {
  return isTerminal(state) ? 5000 : 2000;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatElapsed(secs: number): string {
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

function derivedStatusLabel(state: WorkflowState, stalled: boolean): string {
  if (stalled) return "STALLED";
  if (state === "WAITING_FOR_APPROVAL") return "WAITING_FOR_APPROVAL";
  if (state === "ERROR" || state === "EXECUTOR_FAILED") return "FAILED";
  if (state === "COMPLETE" || state === "OUTREACH_DRAFTED" || state === "PREVIEW_READY") return "COMPLETE";
  return "RUNNING";
}

function statusColor(label: string): string {
  switch (label) {
    case "STALLED": return "var(--red, #e53e3e)";
    case "WAITING_FOR_APPROVAL": return "var(--amber)";
    case "FAILED": return "var(--red, #e53e3e)";
    case "COMPLETE": return "var(--green)";
    default: return "var(--text-muted)";
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryCell({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>{label}</div>
      <div className="font-mono text-xs font-bold truncate" style={{ color: valueColor ?? "var(--text-primary)" }}>{value}</div>
    </div>
  );
}

function RunSummaryBanner({
  build, elapsedSec, stalled,
}: {
  build: BuildRecord;
  elapsedSec: number;
  stalled: boolean;
}) {
  const state = build.workflowState;
  const label = derivedStatusLabel(state, stalled);
  const color = statusColor(label);
  const pulsing = label === "RUNNING";

  return (
    <div className="rounded-lg border p-4 flex flex-col gap-3" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="font-display text-sm" style={{ color: "var(--amber)" }}>RUN SUMMARY</div>
        <div
          className="font-mono text-xs font-bold px-3 py-1 rounded border flex items-center gap-2"
          style={{ color, borderColor: color }}
        >
          {pulsing && (
            <span
              className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--text-muted)" }}
            />
          )}
          {label}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
        <SummaryCell label="URL" value={build.url?.replace(/^https?:\/\//, "") ?? "—"} />
        <SummaryCell label="BUILD TYPE" value={build.tier ?? "renovation"} />
        <SummaryCell label="EXECUTOR" value={(build.executorType ?? "mock").toUpperCase()} />
        <SummaryCell label="ELAPSED" value={formatElapsed(elapsedSec)} />
        <SummaryCell label="WORKFLOW STATE" value={state} />
        <SummaryCell
          label="DIRECTIONS"
          value={build.directionA && build.directionB ? "✓ READY" : "PENDING"}
          valueColor={build.directionA && build.directionB ? "var(--green)" : undefined}
        />
        <SummaryCell
          label="QA SCORECARD"
          value={build.qaScorecard ? "✓ READY" : "PENDING"}
          valueColor={build.qaScorecard ? "var(--green)" : undefined}
        />
        <SummaryCell
          label="SALES PACKAGE"
          value={build.salesPackage ? "✓ READY" : "PENDING"}
          valueColor={build.salesPackage ? "var(--green)" : undefined}
        />
      </div>
    </div>
  );
}

// ── Workflow progress bar ─────────────────────────────────────────────────────

function WorkflowProgress({ state, elapsedSec }: { state: WorkflowState; elapsedSec: number }) {
  const currentIdx = WORKFLOW_STEPS.findIndex(s => s.state === state);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {WORKFLOW_STEPS.map((step, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          const error = (state === "ERROR" || state === "EXECUTOR_FAILED") && i === currentIdx;
          return (
            <div key={step.state} className="flex items-center shrink-0">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all"
                  style={{
                    background: error ? "var(--red, #e53e3e)" : done ? "var(--green)" : active ? "var(--amber)" : "var(--bg-elevated)",
                    color: (done || active || error) ? "#030407" : "var(--text-dim)",
                    boxShadow: active && !error ? "0 0 12px var(--amber-glow)" : "none",
                  }}
                >
                  {done ? "✓" : i + 1}
                </div>
                <span
                  className="font-mono text-[9px] text-center leading-tight max-w-[60px]"
                  style={{ color: active ? "var(--amber)" : done ? "var(--green)" : "var(--text-dim)" }}
                >
                  {step.label}
                </span>
              </div>
              {i < WORKFLOW_STEPS.length - 1 && (
                <div
                  className="h-0.5 w-6 mx-1 shrink-0"
                  style={{ background: done ? "var(--green)" : "var(--border)" }}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Current step detail */}
      {currentIdx >= 0 && (
        <div className="flex items-center gap-2 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
          <span style={{ color: "var(--amber)" }}>▶</span>
          <span>Currently: <span style={{ color: "var(--text-primary)" }}>{WORKFLOW_STEPS[currentIdx]?.label}</span></span>
          <span style={{ color: "var(--text-dim)" }}>·</span>
          <span style={{ color: "var(--text-dim)" }}>{formatElapsed(elapsedSec)} elapsed</span>
        </div>
      )}
    </div>
  );
}

// ── Audit results panel ───────────────────────────────────────────────────────

function ScoreCircle({ value, label, color }: { value: number; label: string; color: string }) {
  const pct = Math.min(100, Math.max(0, value));
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
        />
        <text x="36" y="40" textAnchor="middle" fontSize="14" fontWeight="700" fill={color}>{pct}</text>
      </svg>
      <span className="font-mono text-[10px] text-center leading-tight" style={{ color: "var(--text-dim)" }}>{label}</span>
    </div>
  );
}

function AuditPanel({ build }: { build: BuildRecord }) {
  const a = build.auditObject;
  if (!a) return null;
  return (
    <div className="rounded-lg border p-5 flex flex-col gap-4" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <div className="font-display text-lg" style={{ color: "var(--amber)" }}>AUDIT RESULTS — {build.url}</div>
      <div className="flex gap-6 justify-center">
        <ScoreCircle value={a.websiteScore} label="Website Quality" color="var(--text-muted)" />
        <ScoreCircle value={a.opportunityScore} label="Opportunity" color="var(--amber)" />
        <ScoreCircle value={a.sellabilityScore} label="Sellability" color="var(--green)" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="font-mono text-xs font-bold" style={{ color: "var(--text-muted)" }}>TOP PROBLEMS</div>
        {a.topProblems.map((p, i) => (
          <div key={i} className="font-mono text-xs flex gap-2" style={{ color: "var(--text-muted)" }}>
            <span style={{ color: "var(--red, #e53e3e)" }}>✗</span> {p}
          </div>
        ))}
      </div>
      <div className="rounded border px-4 py-3" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
        <div className="font-mono text-[10px] mb-1" style={{ color: "var(--text-dim)" }}>UPGRADE ANGLE</div>
        <div className="font-mono text-xs" style={{ color: "var(--text-primary)" }}>{a.upgradeAngle}</div>
      </div>
      <div className="flex gap-3 flex-wrap">
        <div className="rounded px-3 py-1.5 font-mono text-xs" style={{ background: "var(--bg-elevated)" }}>
          <span style={{ color: "var(--text-dim)" }}>Recommended: </span>
          <span style={{ color: "var(--amber)", fontWeight: 700 }}>{a.recommendedTier?.toUpperCase()}</span>
        </div>
        {a.industryExtracted && (
          <div className="rounded px-3 py-1.5 font-mono text-xs" style={{ background: "var(--bg-elevated)" }}>
            <span style={{ color: "var(--text-dim)" }}>Industry: </span>
            <span style={{ color: "var(--text-primary)" }}>{a.industryExtracted}</span>
          </div>
        )}
        {a.locationExtracted && (
          <div className="rounded px-3 py-1.5 font-mono text-xs" style={{ background: "var(--bg-elevated)" }}>
            <span style={{ color: "var(--text-dim)" }}>Location: </span>
            <span style={{ color: "var(--text-primary)" }}>{a.locationExtracted}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Direction cards ───────────────────────────────────────────────────────────

function DirectionCard({
  direction, approved, waiting, onApprove,
}: {
  direction: NonNullable<BuildRecord["directionA"]>;
  approved: boolean;
  waiting: boolean;
  onApprove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isA = direction.id === "A";

  return (
    <div
      className="rounded-lg border flex flex-col"
      style={{
        background: "var(--bg-card)",
        borderColor: approved ? "var(--amber)" : "var(--border)",
        boxShadow: approved ? "0 0 16px var(--amber-glow)" : "none",
        flex: 1,
      }}
    >
      <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-mono text-[10px] mb-0.5" style={{ color: "var(--text-dim)" }}>
              DIRECTION {direction.id} — {isA ? "SAFE PREMIUM" : "BOLD PREMIUM"}
            </div>
            <div className="font-display text-lg leading-tight" style={{ color: "var(--amber)" }}>{direction.name}</div>
          </div>
          <div
            className="font-mono text-[10px] px-2 py-1 rounded"
            style={{
              background: isA ? "rgba(79,143,255,0.15)" : "rgba(255,100,79,0.15)",
              color: isA ? "#4f8fff" : "#ff644f",
              border: `1px solid ${isA ? "rgba(79,143,255,0.3)" : "rgba(255,100,79,0.3)"}`,
            }}
          >
            {isA ? "SAFE" : "BOLD"}
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <div className="font-mono text-[10px] mb-1" style={{ color: "var(--text-dim)" }}>CONCEPT</div>
          <div className="font-mono text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{direction.concept}</div>
        </div>

        <div className="rounded border p-3" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
          <div className="font-mono text-[10px] mb-1" style={{ color: "var(--text-dim)" }}>HERO HEADLINE</div>
          <div className="font-display text-base leading-tight" style={{ color: "var(--text-primary)" }}>"{direction.heroHeadline}"</div>
          {direction.heroSubheadline && (
            <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>{direction.heroSubheadline}</div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {direction.visualFeel?.split(",").map((f, i) => (
            <span key={i} className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--bg-elevated)", color: "var(--text-dim)", border: "1px solid var(--border)" }}>
              {f.trim()}
            </span>
          ))}
        </div>

        <div className="font-mono text-[10px] leading-relaxed" style={{ color: "var(--green)" }}>
          ↗ {direction.keyDifferentiator}
        </div>

        <div className="flex gap-2 text-[10px] font-mono" style={{ color: "var(--text-dim)" }}>
          <span>{direction.gradientType}</span>
          <span>·</span>
          <span>{direction.heroLayout?.split("(")[0].trim()}</span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="font-mono text-[10px] text-left transition-opacity hover:opacity-70"
          style={{ color: "var(--text-dim)" }}
        >
          {expanded ? "▲ Hide artifacts" : "▼ View all artifacts"}
        </button>

        {expanded && (
          <div className="flex flex-col gap-2">
            {Object.entries(direction.artifacts).map(([key, val]) => (
              <div key={key} className="rounded border p-2" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
                <div className="font-mono text-[10px] mb-1 uppercase font-bold" style={{ color: "var(--text-dim)" }}>{key}</div>
                <div className="font-mono text-[10px] leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto" style={{ color: "var(--text-muted)" }}>{val}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-t" style={{ borderColor: "var(--border)" }}>
        {approved ? (
          <div className="font-mono text-sm text-center py-2" style={{ color: "var(--amber)" }}>✓ DIRECTION {direction.id} APPROVED</div>
        ) : (
          <button
            onClick={onApprove}
            disabled={!waiting}
            className="w-full rounded font-display text-lg transition-all"
            style={{
              minHeight: 48,
              background: waiting ? "var(--amber)" : "var(--bg-elevated)",
              color: waiting ? "#030407" : "var(--text-dim)",
              border: "none",
              cursor: waiting ? "pointer" : "not-allowed",
            }}
          >
            ✓ APPROVE DIRECTION {direction.id} — BUILD IT
          </button>
        )}
      </div>
    </div>
  );
}

// ── QA Scorecard ─────────────────────────────────────────────────────────────

const QA_MINIMUMS: Record<string, number> = {
  visualTaste: 70, mobileExperience: 80, ctaStrength: 80, copyQuality: 70,
  trustArchitecture: 75, performanceRisk: 70, brandPerception: 70,
  motionQuality: 70, seoFoundation: 65, codeMaintainability: 65,
};

const QA_LABELS: Record<string, string> = {
  visualTaste: "Visual Taste", mobileExperience: "Mobile Experience", ctaStrength: "CTA Strength",
  copyQuality: "Copy Quality", trustArchitecture: "Trust Architecture", performanceRisk: "Performance Risk",
  brandPerception: "Brand Perception", motionQuality: "Motion Quality",
  seoFoundation: "SEO Foundation", codeMaintainability: "Code Maintainability",
};

function QAScorecardPanel({ qa }: { qa: BuildRecord["qaScorecard"] }) {
  if (!qa) return null;
  return (
    <div className="rounded-lg border p-5 flex flex-col gap-4" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between">
        <div className="font-display text-lg" style={{ color: "var(--amber)" }}>QA SCORECARD</div>
        <div
          className="font-display text-2xl px-4 py-1 rounded"
          style={{
            background: qa.pass ? "rgba(46,204,113,0.1)" : "rgba(231,76,60,0.1)",
            color: qa.pass ? "var(--green)" : "var(--red, #e53e3e)",
            border: `1px solid ${qa.pass ? "rgba(46,204,113,0.3)" : "rgba(231,76,60,0.3)"}`,
          }}
        >
          {qa.finalScore.toFixed(1)} — {qa.pass ? "PASS" : "FAIL"}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {(Object.entries(qa.dimensions) as [string, QAScorecardDimension][]).map(([key, dim]) => {
          const min = QA_MINIMUMS[key] ?? 70;
          const pass = dim.score >= min;
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="font-mono text-xs w-40 shrink-0" style={{ color: "var(--text-muted)" }}>{QA_LABELS[key]}</div>
              <div className="flex-1 rounded-full overflow-hidden h-1.5" style={{ background: "var(--bg-elevated)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${dim.score}%`, background: pass ? "var(--green)" : "var(--red, #e53e3e)" }}
                />
              </div>
              <div className="font-mono text-xs w-8 text-right" style={{ color: pass ? "var(--green)" : "var(--red, #e53e3e)" }}>{dim.score}</div>
              <div className="font-mono text-[10px] w-4" style={{ color: pass ? "var(--green)" : "var(--red, #e53e3e)" }}>{pass ? "✓" : "✗"}</div>
            </div>
          );
        })}
      </div>

      {qa.recommendations.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="font-mono text-xs font-bold" style={{ color: "var(--amber)" }}>RECOMMENDATIONS</div>
          {qa.recommendations.map((r, i) => (
            <div key={i} className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>• {r}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sales Package ─────────────────────────────────────────────────────────────

function SalesPackagePanel({ buildId, sales, onApprove }: {
  buildId: string;
  sales: BuildRecord["salesPackage"];
  onApprove: (channel: string) => void;
}) {
  const [tab, setTab] = useState<"email" | "sms" | "callScript" | "proposal" | "before">("email");
  if (!sales) return null;

  const tabs = [
    { id: "email" as const, label: "Email" },
    { id: "sms" as const, label: "SMS" },
    { id: "callScript" as const, label: "Call Script" },
    { id: "proposal" as const, label: "Proposal" },
    { id: "before" as const, label: "Before/After" },
  ];

  const content: Record<string, string> = {
    email: sales.pitchEmail,
    sms: sales.sms,
    callScript: sales.callScript,
    proposal: sales.proposalSummary,
    before: sales.beforeAfterFraming,
  };

  const approveMap: Record<string, keyof typeof sales.approved> = {
    email: "email", sms: "sms", callScript: "callScript", proposal: "proposal",
  };

  return (
    <div className="rounded-lg border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <div className="font-display text-lg" style={{ color: "var(--amber)" }}>SALES PACKAGE</div>
        <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>Approve each channel before sending</div>
      </div>

      <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2.5 font-mono text-xs transition-all"
            style={{
              background: tab === t.id ? "var(--bg-elevated)" : "transparent",
              color: tab === t.id ? "var(--amber)" : "var(--text-dim)",
              borderBottom: tab === t.id ? "2px solid var(--amber)" : "2px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto" style={{ color: "var(--text-muted)" }}>
          {content[tab]}
        </pre>
      </div>

      {tab !== "before" && (
        <div className="px-5 py-4 border-t" style={{ borderColor: "var(--border)" }}>
          {sales.approved[approveMap[tab]] ? (
            <div className="font-mono text-sm text-center" style={{ color: "var(--green)" }}>✓ {tabs.find(t => t.id === tab)?.label} APPROVED</div>
          ) : (
            <button
              onClick={() => onApprove(approveMap[tab])}
              className="w-full rounded font-mono text-sm py-3 transition-all hover:opacity-90"
              style={{ background: "var(--amber)", color: "#030407", border: "none", cursor: "pointer" }}
            >
              ✓ APPROVE {tabs.find(t => t.id === tab)?.label.toUpperCase()} — READY TO SEND
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Executor panel ────────────────────────────────────────────────────────────

function ExecutorPanel({ build, onBuildComplete }: { build: BuildRecord; onBuildComplete: () => void }) {
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!["BUILDING_MOCKUP", "QA_IN_PROGRESS", "PREVIEW_READY", "OUTREACH_DRAFTED", "WAITING_FOR_SEND_APPROVAL", "COMPLETE"].includes(build.workflowState)) return null;

  const result = build.executorResult;

  async function markComplete() {
    setSubmitting(true);
    await fetch("/api/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buildId: build.buildId, previewUrl, filesChanged: [], errors: [] }),
    });
    setSubmitting(false);
    onBuildComplete();
  }

  return (
    <div className="rounded-lg border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3 flex items-center justify-between transition-opacity hover:opacity-80"
        style={{ background: "var(--bg-elevated)" }}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold" style={{ color: "var(--text-dim)" }}>⚙ EXECUTOR PANEL</span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--bg-card)", color: "var(--text-dim)" }}>
            {build.executorType?.toUpperCase() ?? "SUPERVISED"}
          </span>
        </div>
        <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="p-5 flex flex-col gap-4">
          {build.workflowState === "BUILDING_MOCKUP" && build.executorType !== "codex" && (
            <div className="flex flex-col gap-3">
              <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                Build spec is locked. Run your executor against it, then mark the build complete.
              </div>
              <div className="rounded border p-3 font-mono text-xs overflow-y-auto max-h-40 whitespace-pre-wrap" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-dim)" }}>
                {build.lockedBuildSpec?.slice(0, 800)}...
              </div>
              <input
                type="text"
                placeholder="Preview URL (optional)"
                value={previewUrl}
                onChange={e => setPreviewUrl(e.target.value)}
                className="w-full rounded border bg-transparent px-3 py-2 font-mono text-xs outline-none"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)", minHeight: 36 }}
              />
              <button
                onClick={markComplete}
                disabled={submitting}
                className="rounded font-mono text-sm py-2.5 transition-all hover:opacity-90"
                style={{ background: "var(--green)", color: "#030407", border: "none", cursor: "pointer" }}
              >
                {submitting ? "SAVING..." : "✓ MARK BUILD COMPLETE"}
              </button>
            </div>
          )}

          {result && (
            <>
              <div className="flex items-center gap-3">
                <span
                  className="font-mono text-xs px-2 py-0.5 rounded"
                  style={{
                    background: result.status === "complete" ? "rgba(46,204,113,0.1)" : "rgba(231,76,60,0.1)",
                    color: result.status === "complete" ? "var(--green)" : "var(--red, #e53e3e)",
                  }}
                >
                  {result.status.toUpperCase()}
                </span>
                {result.buildTimeMs > 0 && (
                  <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
                    {(result.buildTimeMs / 1000).toFixed(1)}s
                  </span>
                )}
                {result.previewUrl && (
                  <a href={result.previewUrl} target="_blank" rel="noreferrer" className="font-mono text-xs" style={{ color: "var(--amber)" }}>
                    View Preview →
                  </a>
                )}
              </div>

              {result.files.length > 0 && (
                <div className="flex flex-col gap-1">
                  <div className="font-mono text-[10px] font-bold" style={{ color: "var(--text-dim)" }}>FILES CHANGED ({result.files.length})</div>
                  {result.files.slice(0, 10).map((f, i) => (
                    <div key={i} className="font-mono text-[10px] flex gap-2">
                      <span style={{ color: f.operation === "created" ? "var(--green)" : f.operation === "deleted" ? "var(--red, #e53e3e)" : "var(--amber)" }}>
                        {f.operation === "created" ? "+" : f.operation === "deleted" ? "-" : "~"}
                      </span>
                      <span style={{ color: "var(--text-muted)" }}>{f.path}</span>
                    </div>
                  ))}
                </div>
              )}

              {result.errors.length > 0 && (
                <div className="flex flex-col gap-1">
                  <div className="font-mono text-[10px] font-bold" style={{ color: "var(--red, #e53e3e)" }}>ERRORS</div>
                  {result.errors.map((e, i) => (
                    <div key={i} className="font-mono text-[10px]" style={{ color: "var(--red, #e53e3e)" }}>✗ {e.message}</div>
                  ))}
                </div>
          )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main activity page ────────────────────────────────────────────────────────

function ActivityContent() {
  const searchParams = useSearchParams();
  const buildId = searchParams.get("buildId") ?? undefined;

  const [build, setBuild] = useState<BuildRecord | null>(null);
  const [approving, setApproving] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [stalled, setStalled] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);

  const lastUpdateRef = useRef<number>(Date.now());

  const fetchBuild = useCallback(async () => {
    if (!buildId) return;
    const res = await fetch(`/api/build?buildId=${buildId}`);
    if (!res.ok) return;
    const { build: b } = await res.json();
    setBuild(b);
    lastUpdateRef.current = Date.now();
    setStalled(false);
  }, [buildId]);

  // Adaptive polling — fast when pipeline is active
  useEffect(() => {
    fetchBuild();
    const state = build?.workflowState ?? "URL_RECEIVED";
    const interval = setInterval(fetchBuild, pollInterval(state));
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildId, build?.workflowState]);

  // Elapsed ticker
  useEffect(() => {
    if (!build?.createdAt) return;
    const startMs = new Date(build.createdAt).getTime();
    const tick = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startMs) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [build?.createdAt]);

  // Stall detection — check every 10s
  useEffect(() => {
    const check = setInterval(() => {
      const state = build?.workflowState ?? "URL_RECEIVED";
      if (isTerminal(state)) { setStalled(false); return; }
      if (Date.now() - lastUpdateRef.current > STALL_THRESHOLD_MS) {
        setStalled(true);
      }
    }, 10_000);
    return () => clearInterval(check);
  }, [build?.workflowState]);

  async function handleApprove(direction: "A" | "B") {
    if (!buildId || approving) return;
    setApproving(true);
    await fetch("/api/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buildId, direction }),
    });
    await fetchBuild();
    setApproving(false);
  }

  const state: WorkflowState = build?.workflowState ?? "URL_RECEIVED";
  const isError = state === "ERROR" || state === "EXECUTOR_FAILED";
  const directionsReady = !!(build?.directionA && build?.directionB);
  const awaitingApproval = state === "WAITING_FOR_APPROVAL";

  return (
    <div className="p-6 flex flex-col gap-4 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="font-display text-3xl" style={{ color: "var(--amber)" }}>MISSION CONTROL — PIPELINE</div>
          <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {buildId ? `Build ${buildId.slice(0, 8)}...` : "No active build"}
            {build && ` · ${pollInterval(state) / 1000}s refresh`}
          </div>
        </div>
        {build && (
          <div className="font-mono text-xs px-3 py-1.5 rounded" style={{ background: "var(--bg-card)", color: "var(--amber)", border: "1px solid var(--border)" }}>
            ${build.totalCost.toFixed(4)} total cost
          </div>
        )}
      </div>

      {/* No build */}
      {!buildId && (
        <div className="rounded-lg border px-5 py-12 flex flex-col items-center gap-4 text-center" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="font-display text-4xl" style={{ color: "var(--text-dim)" }}>🎬</div>
          <div className="font-display text-2xl" style={{ color: "var(--text-muted)" }}>NO ACTIVE BUILD</div>
          <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>Launch a build from Mission Control to see live pipeline activity here.</div>
          <a href="/" className="font-mono text-xs px-5 py-2.5 rounded transition-all hover:opacity-80" style={{ background: "var(--amber)", color: "#000" }}>
            GO TO MISSION CONTROL
          </a>
        </div>
      )}

      {buildId && build && (
        <>
          {/* Run summary — primary status block */}
          <RunSummaryBanner build={build} elapsedSec={elapsedSec} stalled={stalled} />

          {/* Stall warning */}
          {stalled && (
            <div className="rounded-lg border px-5 py-4 flex items-center justify-between gap-3 flex-wrap" style={{ background: "rgba(231,76,60,0.07)", borderColor: "var(--red, #e53e3e)" }}>
              <div className="font-mono text-xs" style={{ color: "var(--red, #e53e3e)" }}>
                ⚠ No update for {Math.round(STALL_THRESHOLD_MS / 1000)}s — possible stall. The pipeline may be waiting on an external service.
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={fetchBuild}
                  className="font-mono text-xs px-3 py-1.5 rounded border transition-all hover:opacity-80"
                  style={{ borderColor: "var(--amber)", color: "var(--amber)" }}
                >
                  RETRY
                </button>
                <a
                  href="/"
                  className="font-mono text-xs px-3 py-1.5 rounded border transition-all hover:opacity-80"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                >
                  CANCEL
                </a>
              </div>
            </div>
          )}

          {/* Error state — prominent, not hidden */}
          {isError && (
            <div className="rounded-lg border px-5 py-4 flex flex-col gap-2" style={{ background: "rgba(231,76,60,0.07)", borderColor: "var(--red, #e53e3e)" }}>
              <div className="font-mono text-xs font-bold" style={{ color: "var(--red, #e53e3e)" }}>
                ⚠ PIPELINE {state === "EXECUTOR_FAILED" ? "EXECUTOR" : ""} ERROR
              </div>
              {build.errorMessage && (
                <div className="font-mono text-xs" style={{ color: "var(--red, #e53e3e)" }}>{build.errorMessage}</div>
              )}
              <a href="/" className="font-mono text-xs self-start" style={{ color: "var(--amber)" }}>← Start a new build</a>
            </div>
          )}

          {/* Workflow progress */}
          <div className="rounded-lg border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <WorkflowProgress state={state} elapsedSec={elapsedSec} />
          </div>

          {/* Directions CTA banner — shown when operator action is needed */}
          {awaitingApproval && directionsReady && !build.approvedDirection && (
            <div className="rounded-lg border px-5 py-4 flex items-center justify-between gap-3 flex-wrap" style={{ background: "rgba(200,151,58,0.08)", borderColor: "var(--amber)" }}>
              <div>
                <div className="font-display text-base" style={{ color: "var(--amber)" }}>DIRECTIONS READY — OPERATOR ACTION REQUIRED</div>
                <div className="font-mono text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Review Direction A (safe) and Direction B (bold) below, then approve one to start the build.
                </div>
              </div>
              <button
                onClick={() => document.getElementById("directions-section")?.scrollIntoView({ behavior: "smooth" })}
                className="font-mono text-xs px-4 py-2 rounded shrink-0 transition-all hover:opacity-80"
                style={{ background: "var(--amber)", color: "#000", border: "none" }}
              >
                REVIEW & APPROVE ↓
              </button>
            </div>
          )}

          {/* Audit results */}
          {build.auditObject && <AuditPanel build={build} />}

          {/* Direction approval */}
          {build.directionA && build.directionB && (
            <div className="flex flex-col gap-4" id="directions-section">
              <div className="flex items-center justify-between">
                <div className="font-display text-xl" style={{ color: "var(--amber)" }}>TWO CREATIVE DIRECTIONS</div>
                {awaitingApproval && !build.approvedDirection && (
                  <div className="font-mono text-xs px-3 py-1 rounded" style={{ background: "rgba(200,151,58,0.15)", color: "var(--amber)", border: "1px solid rgba(200,151,58,0.3)" }}>
                    CHOOSE ONE TO BUILD
                  </div>
                )}
              </div>
              <div className="flex gap-4" style={{ alignItems: "stretch" }}>
                <DirectionCard
                  direction={build.directionA}
                  approved={build.approvedDirection === "A"}
                  waiting={awaitingApproval && !approving}
                  onApprove={() => handleApprove("A")}
                />
                <DirectionCard
                  direction={build.directionB}
                  approved={build.approvedDirection === "B"}
                  waiting={awaitingApproval && !approving}
                  onApprove={() => handleApprove("B")}
                />
              </div>
              {awaitingApproval && !build.approvedDirection && (
                <div className="font-mono text-xs text-center" style={{ color: "var(--text-dim)" }}>
                  ⚡ No build starts until you approve one direction. The executor reads the locked build spec.
                </div>
              )}
            </div>
          )}

          {/* Executor panel */}
          <ExecutorPanel build={build} onBuildComplete={fetchBuild} />

          {/* QA Scorecard */}
          {build.qaScorecard && <QAScorecardPanel qa={build.qaScorecard} />}

          {/* Activity feed — secondary, collapsed by default */}
          <div className="rounded-lg border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <button
              onClick={() => setFeedOpen(o => !o)}
              className="w-full px-5 py-3 flex items-center justify-between transition-opacity hover:opacity-80"
              style={{ background: "var(--bg-elevated)" }}
            >
              <span className="font-mono text-xs font-bold" style={{ color: "var(--text-dim)" }}>⬡ AGENT EVENT LOG</span>
              <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>{feedOpen ? "▲ COLLAPSE" : "▼ EXPAND"}</span>
            </button>
            {feedOpen && (
              <div className="p-4">
                <ActivityFeed buildId={buildId} />
              </div>
            )}
          </div>
        </>
      )}

      {/* Build not yet loaded but buildId present */}
      {buildId && !build && (
        <div className="rounded-lg border px-5 py-8 text-center font-mono text-xs" style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-dim)" }}>
          Loading build {buildId.slice(0, 8)}...
        </div>
      )}
    </div>
  );
}

export default function Activity() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <div className="font-display text-3xl" style={{ color: "var(--amber)" }}>LOADING...</div>
      </div>
    }>
      <ActivityContent />
    </Suspense>
  );
}
