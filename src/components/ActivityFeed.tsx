"use client";
import { useState, useEffect, useCallback } from "react";

interface LogEntry {
  id: string;
  created_at: string;
  agent: string;
  action: string;
  tier?: string;
  cost?: number;
  build_id?: string;
  client_name?: string;
  status?: string;
}

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

interface Props {
  buildId?: string;
}

export function ActivityFeed({ buildId }: Props) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [lastFetch, setLastFetch] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const fetchLog = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (buildId) params.set("buildId", buildId);
      if (lastFetch) params.set("since", lastFetch);

      const res = await fetch(`/api/activity?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { entries: newEntries } = await res.json();

      if (newEntries.length > 0) {
        setEntries((prev) => {
          const ids = new Set(prev.map((e) => e.id));
          const fresh = (newEntries as LogEntry[]).filter((e) => !ids.has(e.id));
          return [...fresh.reverse(), ...prev].slice(0, 50);
        });
        setLastFetch(newEntries[newEntries.length - 1].created_at);
      }
      setConnected(true);
      setError("");
    } catch (e) {
      setConnected(false);
      setError((e as Error).message);
    }
  }, [buildId, lastFetch]);

  useEffect(() => {
    fetchLog();
    const interval = setInterval(fetchLog, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildId]);

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
        <div className="flex items-center gap-2">
          {error && (
            <span className="font-mono text-xs" style={{ color: "var(--red)" }}>
              {error}
            </span>
          )}
          <span
            className={connected ? "pulse-dot-green" : ""}
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: connected ? "var(--green)" : "var(--text-dim)",
            }}
          />
          <span className="font-mono text-xs" style={{ color: connected ? "var(--green)" : "var(--text-dim)" }}>
            {connected ? "LIVE" : "CONNECTING..."}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {entries.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
              {connected ? "No activity yet — launch a build to start" : "Connecting to activity log..."}
            </span>
          </div>
        )}
        {entries.map((e) => (
          <div key={e.id} className="activity-entry flex gap-3 items-start">
            <span className="font-mono text-xs shrink-0 mt-0.5" style={{ color: "var(--text-dim)" }}>
              {fmt(e.created_at)}
            </span>
            <div className="flex-1 min-w-0">
              <span className="font-mono text-xs font-bold mr-2" style={{ color: "var(--amber)" }}>
                [{e.agent}]
              </span>
              <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                {e.action}
              </span>
              {e.client_name && (
                <div className="font-mono text-xs mt-0.5" style={{ color: "var(--text-primary)" }}>
                  {e.client_name}
                </div>
              )}
              {e.cost !== undefined && e.cost !== null && (
                <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
                  cost: ${Number(e.cost).toFixed(4)}
                </div>
              )}
            </div>
            {e.status && (
              <span
                className="font-mono text-xs shrink-0 px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--bg-elevated)",
                  color: e.status === "live" ? "var(--green)" : e.status === "error" ? "var(--red)" : "var(--text-dim)",
                }}
              >
                {e.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
