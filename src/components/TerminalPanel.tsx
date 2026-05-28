"use client";
import { useEffect, useRef, useState } from "react";
import type { Agent } from "@/types/models";

const TERMINAL_LINES: Record<string, string[]> = {
  orchestrator: [
    "$ orchestrator.init() — pipeline v10 loaded",
    "→ stage_1: audit dispatched to scout@memphisbbqsupply.com",
    "→ firecrawl.scrape(url, depth=3) — 14 pages queued",
    "→ brand_profile.json target: projects/memphis-bbq/",
    "→ opportunity_flag: 4.8★ reviews NOT on homepage",
    "→ recommendation: FULL REBUILD — $7.5K–$12K tier",
    "→ waiting for stage_2 signal...",
  ],
  scout: [
    "$ scout.boot() — firecrawl v1.18.3 ready",
    "→ scraping memphisbbqsupply.com",
    "→ page 1/14: homepage — quality: 4/10",
    "→ page 2/14: products — Wix template detected",
    "→ writing brand extract: #1A0A00, #C94B0C",
    "→ tagline captured: 'Flavor Made by Memphis'",
    "→ brand_profile.json written",
    "→ quality_score: 4/10 — full rebuild recommended",
  ],
  "image-prompt-engineer": [
    "$ img_pe.standby() — waiting for brief approval",
    "→ GPT Image 2 endpoint: ready",
    "→ nano-banana-2: google_search=true enabled",
    "→ Seedance 2.0 i2v: static camera rule loaded",
    "→ PALETTE: cyan #00D4E8 · blue #2A7BFF · amber #C8973A",
    "→ queue empty — awaiting creative brief",
  ],
  builder: [
    "$ builder.standby() — modules v2.1 loaded",
    "→ cinematic-components: 30 modules ready",
    "→ GSAP: timeline engine initialized",
    "→ Motion.dev: spring presets loaded",
    "→ Cursor Magic: pointer-reactive layer armed",
    "→ standby — awaiting approved brief",
  ],
  "reality-checker": [
    "$ reality_checker.init() — Impeccable v2 loaded",
    "→ audit ruleset: 47 checks enabled",
    "→ mobile breakpoints: 320/375/414/768/1024/1280",
    "→ WCAG AA baseline: enforced",
    "→ no build in QA queue — standby",
  ],
  deployer: [
    "$ deployer.init() — Vercel + Netlify connected",
    "→ github.auth: token validated",
    "→ vercel.token: active",
    "→ QA threshold: ≥85 required to proceed",
    "→ waiting for reality-checker sign-off",
  ],
};

const FALLBACK_LINES = [
  "$ agent.init() — connected",
  "→ awaiting task assignment",
  "→ all systems nominal",
];

interface Props {
  agent: Agent;
  onClose: () => void;
}

export function TerminalPanel({ agent, onClose }: Props) {
  const lines = TERMINAL_LINES[agent.id] ?? FALLBACK_LINES;
  const [visibleCount, setVisibleCount] = useState(0);
  const [cursor, setCursor] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(0);
    const interval = setInterval(() => {
      setVisibleCount((c) => {
        if (c >= lines.length) {
          clearInterval(interval);
          return c;
        }
        return c + 1;
      });
    }, 280);
    return () => clearInterval(interval);
  }, [agent.id, lines.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleCount]);

  useEffect(() => {
    const t = setInterval(() => setCursor((c) => !c), 530);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="flex flex-col border-l shrink-0"
      style={{
        width: 380,
        background: "#020408",
        borderColor: "var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: agent.status === "active" ? "var(--amber)" : "var(--text-dim)",
              boxShadow: agent.status === "active" ? "0 0 6px var(--amber)" : "none",
            }}
          />
          <span className="font-mono text-xs" style={{ color: "#00cc44" }}>
            {agent.name.toUpperCase()} — LIVE LOG
          </span>
        </div>
        <button
          onClick={onClose}
          className="font-mono text-xs px-2 py-1 rounded transition-all hover:opacity-70"
          style={{ color: "var(--text-muted)", background: "rgba(255,255,255,0.04)" }}
        >
          ✕
        </button>
      </div>

      {/* Terminal output */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
        {lines.slice(0, visibleCount).map((line, i) => (
          <div
            key={i}
            className="font-mono text-xs leading-relaxed"
            style={{
              color: line.startsWith("$") ? "#00ff66" : line.startsWith("→") ? "#88cc88" : "#55aa55",
            }}
          >
            {line}
          </div>
        ))}
        {visibleCount < lines.length && (
          <div className="font-mono text-xs" style={{ color: "#00ff66" }}>
            {cursor ? "█" : " "}
          </div>
        )}
        {visibleCount >= lines.length && (
          <div className="font-mono text-xs mt-2" style={{ color: "#334433" }}>
            — log tail — {cursor ? "█" : " "}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      <div
        className="px-4 py-3 border-t flex items-center justify-between shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <span className="font-mono text-xs" style={{ color: "#334433" }}>
          {lines.length} events · ${agent.sessionCost.toFixed(4)}
        </span>
        <button
          className="font-mono text-xs transition-all hover:opacity-70"
          style={{ color: "#00cc44" }}
        >
          VIEW FULL LOG ↗
        </button>
      </div>
    </div>
  );
}
