"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ActivityFeed } from "@/components/ActivityFeed";

interface StreamEvent {
  buildId?: string;
  agent?: string;
  action?: string;
  detail?: string;
  cost?: number;
  ts?: string;
  done?: boolean;
  output?: string;
  error?: boolean;
  tokens?: { input: number; output: number };
}

function ActivityContent() {
  const searchParams = useSearchParams();
  const buildId = searchParams.get("buildId") ?? undefined;

  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [output, setOutput] = useState("");
  const [done, setDone] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [streaming, setStreaming] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!buildId) return;

    setStreaming(true);
    const controller = new AbortController();

    // Connect to the streaming endpoint — we already POSTed, now just read
    // The /api/launch already started streaming; we watch Supabase for updates.
    // But also fetch any in-flight stream if the page loaded mid-stream.
    // For now, rely on ActivityFeed polling Supabase.
    setStreaming(false);

    return () => controller.abort();
  }, [buildId]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const activeCount = events.filter((e) => !e.done && !e.error).length;

  return (
    <div className="p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display text-3xl" style={{ color: "var(--amber)" }}>
            LIVE ACTIVITY — PIPELINE STATUS
          </div>
          <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {buildId ? `Build ID: ${buildId}` : "No active build"} · Supabase behavioral_log · 5s refresh
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ background: "var(--green)", boxShadow: "0 0 8px rgba(46,204,113,0.6)" }}
          />
          <span className="font-mono text-xs" style={{ color: "var(--green)" }}>
            {streaming ? "STREAMING" : "MONITORING"}
          </span>
        </div>
      </div>

      {/* No build state */}
      {!buildId && (
        <div
          className="rounded-lg border px-5 py-12 flex flex-col items-center gap-4 text-center"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <div className="font-display text-4xl" style={{ color: "var(--text-dim)" }}>🎬</div>
          <div className="font-display text-2xl" style={{ color: "var(--text-muted)" }}>
            NO ACTIVE BUILD
          </div>
          <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
            Launch a build from Mission Control to see live pipeline activity here.
          </div>
          <a
            href="/"
            className="font-mono text-xs px-5 py-2.5 rounded transition-all hover:opacity-80"
            style={{ background: "var(--amber)", color: "#000" }}
          >
            GO TO MISSION CONTROL
          </a>
        </div>
      )}

      {/* Live feed — always visible when build is active */}
      {buildId && (
        <>
          {/* Cost bar */}
          {totalCost > 0 && (
            <div
              className="rounded-lg border px-5 py-4 flex items-center gap-6"
              style={{ background: "var(--bg-card)", borderColor: "var(--border-hover)" }}
            >
              <div>
                <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>SESSION COST</div>
                <div className="font-display text-2xl glow-amber-text" style={{ color: "var(--amber)" }}>
                  ${totalCost.toFixed(4)}
                </div>
              </div>
              <div>
                <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>STATUS</div>
                <div className="font-mono text-sm" style={{ color: done ? "var(--green)" : "var(--amber)" }}>
                  {done ? "✓ COMPLETE — AWAITING APPROVAL" : "⚡ PIPELINE RUNNING"}
                </div>
              </div>
            </div>
          )}

          {/* Activity feed */}
          <ActivityFeed buildId={buildId} />

          {/* Output panel */}
          {output && (
            <div
              className="rounded-lg border overflow-hidden"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <div
                className="px-5 py-3 border-b flex items-center justify-between"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="font-display text-base" style={{ color: "var(--amber)" }}>
                  PIPELINE OUTPUT — TWO CREATIVE DIRECTIONS
                </span>
                {done && (
                  <span
                    className="font-mono text-xs px-3 py-1 rounded"
                    style={{ background: "rgba(46,204,113,0.1)", color: "var(--green)", border: "1px solid rgba(46,204,113,0.3)" }}
                  >
                    ✓ AWAITING YOUR APPROVAL
                  </span>
                )}
              </div>
              <div
                ref={outputRef}
                className="p-5 font-mono text-xs leading-relaxed overflow-y-auto whitespace-pre-wrap max-h-[600px]"
                style={{ color: "var(--text-muted)" }}
              >
                {output}
              </div>
              {done && (
                <div
                  className="px-5 py-4 border-t flex gap-3"
                  style={{ borderColor: "var(--border)" }}
                >
                  <button
                    className="flex-1 rounded font-display text-lg transition-all hover:opacity-90"
                    style={{ minHeight: 48, background: "var(--amber)", color: "#030407", border: "none", cursor: "pointer" }}
                  >
                    ✓ APPROVE DIRECTION 1 — BUILD IT
                  </button>
                  <button
                    className="flex-1 rounded font-display text-lg transition-all hover:opacity-90"
                    style={{ minHeight: 48, background: "var(--bg-elevated)", color: "var(--amber)", border: "1px solid var(--amber)", cursor: "pointer" }}
                  >
                    ✓ APPROVE DIRECTION 2 — BUILD IT
                  </button>
                </div>
              )}
            </div>
          )}
        </>
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
