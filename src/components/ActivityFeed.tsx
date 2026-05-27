"use client";
import { useState, useEffect } from "react";
import type { ActivityEntry } from "@/types/models";
import { INITIAL_ACTIVITY } from "@/lib/data";

const NEW_ENTRIES: Omit<ActivityEntry, "id" | "timestamp">[] = [
  { agent: "Orchestrator", action: "stage_advance", detail: "Stage 1 → 2 queued after brand_profile.json verified" },
  { agent: "Scout", action: "anti_pattern_flag", detail: "Domain split detected: memphisbbqsupply.com vs mbbqsupply.com — SEO leak" },
  { agent: "Orchestrator", action: "module_select", detail: "Modules queued: #25 Kinetic Marquee, #03 Parallax, #07 Curtain, #20 Odometer, #05 Sticky Stack" },
  { agent: "Scout", action: "review_count", detail: "310 reviews @ 4.8★ — NOT on homepage. Single biggest conversion gap." },
  { agent: "Orchestrator", action: "price_estimate", detail: "Recommended tier: $7.5K–$12K full rebuild. Wix is the ceiling." },
];

function fmt(d: Date) {
  return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function ActivityFeed() {
  const [entries, setEntries] = useState<ActivityEntry[]>(INITIAL_ACTIVITY);
  const [nextIdx, setNextIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (nextIdx >= NEW_ENTRIES.length) return;
      const entry = NEW_ENTRIES[nextIdx];
      setEntries((prev) => [
        { ...entry, id: `live-${Date.now()}`, timestamp: new Date() },
        ...prev.slice(0, 19),
      ]);
      setNextIdx((i) => i + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, [nextIdx]);

  return (
    <div
      className="rounded-lg border flex flex-col"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)", height: 320 }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="font-display text-base" style={{ color: "var(--amber)" }}>
          LIVE ACTIVITY FEED
        </span>
        <span className="pulse-dot-green w-2 h-2 rounded-full" style={{ background: "var(--green)" }} />
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {entries.map((e) => (
          <div key={e.id} className="activity-entry flex gap-3 items-start">
            <span className="font-mono text-xs shrink-0 mt-0.5" style={{ color: "var(--text-dim)" }}>
              {fmt(e.timestamp)}
            </span>
            <div className="flex-1 min-w-0">
              <span
                className="font-mono text-xs font-bold mr-2"
                style={{ color: "var(--amber)" }}
              >
                [{e.agent}]
              </span>
              <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                {e.action}
              </span>
              <div className="font-mono text-xs mt-0.5" style={{ color: "var(--text-primary)" }}>
                {e.detail}
              </div>
              {e.cost !== undefined && (
                <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
                  cost: ${e.cost.toFixed(4)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
