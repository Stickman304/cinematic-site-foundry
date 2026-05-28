"use client";
import { useState } from "react";

interface TelegramMessage {
  id: string;
  from: string;
  text: string;
  time: string;
  type: "build_update" | "cost_alert" | "completion" | "outreach";
}

const DEMO_MESSAGES: TelegramMessage[] = [
  {
    id: "t1",
    from: "Orchestrator",
    text: "Stage 1 complete — memphisbbqsupply.com scored 4/10. Full rebuild recommended.",
    time: "11:42 AM",
    type: "build_update",
  },
  {
    id: "t2",
    from: "Scout",
    text: "brand_profile.json written. 4.8★ / 310 reviews identified as key opportunity.",
    time: "11:44 AM",
    type: "build_update",
  },
  {
    id: "t3",
    from: "Cost Monitor",
    text: "Session cost: $0.0169. Well under $5.00 hard stop.",
    time: "11:45 AM",
    type: "cost_alert",
  },
];

const TYPE_COLORS: Record<TelegramMessage["type"], string> = {
  build_update: "var(--amber)",
  cost_alert: "#3b82f6",
  completion: "var(--green)",
  outreach: "#8b5cf6",
};

const TYPE_ICONS: Record<TelegramMessage["type"], string> = {
  build_update: "▶",
  cost_alert: "◇",
  completion: "✓",
  outreach: "◎",
};

interface Props {
  botConnected?: boolean;
}

export function TelegramPanel({ botConnected = false }: Props) {
  const [connected, setConnected] = useState(botConnected);
  const [messages] = useState<TelegramMessage[]>(DEMO_MESSAGES);

  if (!connected) {
    return (
      <div
        className="rounded-lg border p-6 flex flex-col items-center gap-4"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
          ✈
        </div>
        <div className="text-center">
          <div className="font-display text-lg" style={{ color: "var(--text-primary)" }}>TELEGRAM NOTIFICATIONS</div>
          <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Bot @Claude304bot — connect to receive real-time build alerts
          </div>
        </div>
        <div className="font-mono text-xs px-4 py-2 rounded border flex items-center gap-2"
          style={{ borderColor: "var(--border)", color: "var(--text-dim)", background: "var(--bg-base)" }}>
          <span style={{ color: "var(--red)" }}>●</span>
          TELEGRAM_BOT_TOKEN — add to Vercel env to activate
        </div>
        <button
          onClick={() => setConnected(true)}
          className="px-6 py-2 rounded font-mono text-xs transition-all hover:opacity-80"
          style={{ background: "var(--amber-glow)", color: "var(--amber)", border: "1px solid var(--border-hover)" }}
        >
          SIMULATE CONNECTED
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div
        className="px-5 py-3 border-b flex items-center justify-between"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--green)", boxShadow: "0 0 6px var(--green)" }} />
          <span className="font-display text-base" style={{ color: "var(--amber)" }}>TELEGRAM — @CLAUDE304BOT</span>
        </div>
        <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{messages.length} MESSAGES</span>
      </div>
      <div className="flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
        {messages.map((msg) => (
          <div key={msg.id} className="px-5 py-3 flex gap-3">
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-xs shrink-0 mt-0.5"
              style={{ background: "var(--bg-elevated)", color: TYPE_COLORS[msg.type] }}
            >
              {TYPE_ICONS[msg.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="font-display text-xs" style={{ color: TYPE_COLORS[msg.type] }}>
                  {msg.from}
                </span>
                <span className="font-mono text-xs shrink-0" style={{ color: "var(--text-dim)" }}>
                  {msg.time}
                </span>
              </div>
              <div className="font-mono text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
