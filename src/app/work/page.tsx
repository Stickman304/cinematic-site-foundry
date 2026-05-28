"use client";
import { useState } from "react";
import { COMPLETED_BUILDS, ACTIVE_BUILD } from "@/lib/data";

export default function Work() {
  const [showBefore, setShowBefore] = useState<Record<string, boolean>>({});

  function toggleView(id: string) {
    setShowBefore((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-3xl" style={{ color: "var(--amber)" }}>WORK PORTFOLIO</div>
          <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {COMPLETED_BUILDS.length} COMPLETED BUILDS · {ACTIVE_BUILD ? 1 : 0} IN PROGRESS
          </div>
        </div>
        <div className="font-mono text-xs px-3 py-1.5 rounded border" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
          TOTAL MARGIN: —
        </div>
      </div>

      {/* Active build in progress */}
      {ACTIVE_BUILD && (
        <div
          className="rounded-lg border p-5"
          style={{ background: "var(--amber-glow)", borderColor: "var(--border-hover)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-xl" style={{ color: "var(--amber)" }}>
                IN PROGRESS — {ACTIVE_BUILD.clientName}
              </div>
              <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Stage {ACTIVE_BUILD.currentStage}/10 · Started {ACTIVE_BUILD.startedAt.toLocaleTimeString()}
              </div>
            </div>
            <span className="pulse-dot-amber w-3 h-3 rounded-full" style={{ background: "var(--amber)" }} />
          </div>
          <div className="mt-4 h-1.5 rounded-full" style={{ background: "var(--bg-elevated)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${((ACTIVE_BUILD.currentStage - 1) / 10) * 100}%`,
                background: "linear-gradient(90deg, var(--amber-dim), var(--amber))",
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>AUDIT</span>
            <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>DEPLOY</span>
          </div>
        </div>
      )}

      {/* Completed builds */}
      {COMPLETED_BUILDS.length === 0 ? (
        <div
          className="rounded-lg border flex flex-col items-center justify-center py-24"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <div className="font-display text-4xl mb-3" style={{ color: "var(--text-dim)" }}>◻</div>
          <div className="font-display text-xl" style={{ color: "var(--text-muted)" }}>NO COMPLETED BUILDS YET</div>
          <div className="font-mono text-xs mt-2" style={{ color: "var(--text-dim)" }}>
            Memphis BBQ Supply is in Stage 1 — first delivery incoming
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {COMPLETED_BUILDS.map((build) => {
            const isBefore = showBefore[build.id];
            const hasToggle = build.beforeScreenshot || build.afterScreenshot;

            return (
              <div
                key={build.id}
                className="rounded-lg border flex flex-col gap-3 overflow-hidden"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                {/* Before/After screenshot toggle */}
                {hasToggle && (
                  <div className="relative" style={{ height: 200, background: "var(--bg-base)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={isBefore ? build.beforeScreenshot : build.afterScreenshot}
                      alt={isBefore ? "before" : "after"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <button
                        onClick={() => toggleView(build.id)}
                        className="font-mono text-xs px-2 py-1 rounded"
                        style={{
                          background: isBefore ? "var(--red)" : "var(--green)",
                          color: "#000",
                        }}
                      >
                        {isBefore ? "BEFORE" : "AFTER"}
                      </button>
                      <button
                        onClick={() => toggleView(build.id)}
                        className="font-mono text-xs px-2 py-1 rounded"
                        style={{ background: "rgba(0,0,0,0.6)", color: "var(--text-muted)" }}
                      >
                        TOGGLE ↔
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-display text-lg" style={{ color: "var(--text-primary)" }}>{build.name}</div>
                      <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{build.industry}</div>
                    </div>
                    <span
                      className="font-mono text-xs px-2 py-0.5 rounded"
                      style={{ background: "rgba(46,204,113,0.1)", color: "var(--green)" }}
                    >
                      QA {build.qaScore}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>CHARGED</div>
                      <div className="font-mono text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                        ${build.priceCharged.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>AI COST</div>
                      <div className="font-mono text-sm font-bold" style={{ color: "var(--amber)" }}>
                        ${build.aiCost.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>MARGIN</div>
                      <div className="font-mono text-sm font-bold" style={{ color: "var(--green)" }}>
                        {build.marginPct.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
                    {build.buildTimeMin}min · {build.deployedAt}
                  </div>

                  <a
                    href={`https://${build.liveUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs underline transition-opacity hover:opacity-70"
                    style={{ color: "var(--amber)" }}
                  >
                    {build.liveUrl} ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
