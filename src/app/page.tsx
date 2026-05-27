"use client";
import { AGENTS, PIPELINE_STAGES, ACTIVE_BUILD } from "@/lib/data";
import { AgentCard } from "@/components/AgentCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { PipelineTracker } from "@/components/PipelineTracker";

export default function MissionControl() {
  const elapsedMin = ACTIVE_BUILD
    ? Math.floor((Date.now() - ACTIVE_BUILD.startedAt.getTime()) / 60000)
    : 0;

  return (
    <div className="p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Active build banner */}
      {ACTIVE_BUILD && (
        <div
          className="rounded-lg border px-5 py-4 flex items-center justify-between"
          style={{ background: "var(--amber-glow)", borderColor: "var(--border-hover)" }}
        >
          <div className="flex items-center gap-4">
            <span className="pulse-dot-amber w-3 h-3 rounded-full inline-block" style={{ background: "var(--amber)" }} />
            <div>
              <div className="font-display text-xl" style={{ color: "var(--amber)" }}>
                ACTIVE BUILD — {ACTIVE_BUILD.clientName.toUpperCase()}
              </div>
              <div className="font-mono text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Stage {ACTIVE_BUILD.currentStage}/7 · {elapsedMin}m elapsed · Est. {ACTIVE_BUILD.estimatedCompletion}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-lg font-bold" style={{ color: "var(--amber)" }}>
              ${ACTIVE_BUILD.sessionCost.toFixed(4)}
            </div>
            <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>session cost</div>
          </div>
        </div>
      )}

      {/* Pipeline tracker */}
      <PipelineTracker stages={PIPELINE_STAGES} />

      {/* Agent grid */}
      <div>
        <div className="font-display text-xl mb-4" style={{ color: "var(--amber)" }}>
          AGENT TEAM — {AGENTS.filter((a) => a.status === "active").length} ACTIVE
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {AGENTS.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <ActivityFeed />
    </div>
  );
}
