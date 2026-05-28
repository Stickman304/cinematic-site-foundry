"use client";
import { useState } from "react";

const DEMO_SITES = [
  {
    id: "memphis-bbq",
    name: "Memphis Barbeque Supply",
    url: "https://memphisbbqsupply.com",
    status: "auditing",
    desc: "Stage 1 audit complete — full rebuild in queue",
  },
];

const VIEWPORT_OPTIONS = [
  { id: "desktop", label: "DESKTOP", width: "100%", icon: "⊡" },
  { id: "tablet", label: "TABLET", width: "768px", icon: "◻" },
  { id: "mobile", label: "MOBILE", width: "390px", icon: "▭" },
];

export default function Preview() {
  const [selected, setSelected] = useState(DEMO_SITES[0]);
  const [viewport, setViewport] = useState("desktop");
  const [urlInput, setUrlInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState(selected.url);
  const [tab, setTab] = useState<"live" | "before">("live");

  const vp = VIEWPORT_OPTIONS.find((v) => v.id === viewport)!;

  function handleLoad() {
    const raw = urlInput.trim();
    if (!raw) return;
    const withProto = raw.startsWith("http") ? raw : `https://${raw}`;
    setPreviewUrl(withProto);
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div>
        <div className="font-display text-3xl" style={{ color: "var(--amber)" }}>SPLIT SCREEN PREVIEW</div>
        <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          LIVE SITE VIEWER — BEFORE / AFTER COMPARISON
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* URL input */}
        <div className="flex flex-1 gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Enter any URL to preview..."
            className="flex-1 px-4 py-2.5 rounded font-mono text-sm outline-none"
            style={{
              background: "var(--bg-base)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              caretColor: "var(--amber)",
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLoad()}
          />
          <button
            onClick={handleLoad}
            className="px-4 py-2.5 rounded font-mono text-xs transition-all hover:opacity-80"
            style={{ background: "var(--amber)", color: "#000" }}
          >
            LOAD ↗
          </button>
        </div>

        {/* Viewport toggle */}
        <div className="flex gap-1.5">
          {VIEWPORT_OPTIONS.map((v) => (
            <button
              key={v.id}
              onClick={() => setViewport(v.id)}
              className="px-3 py-2 rounded font-mono text-xs transition-all"
              style={{
                background: viewport === v.id ? "var(--amber-glow)" : "var(--bg-elevated)",
                border: `1px solid ${viewport === v.id ? "var(--amber)" : "var(--border)"}`,
                color: viewport === v.id ? "var(--amber)" : "var(--text-muted)",
              }}
            >
              {v.icon} {v.label}
            </button>
          ))}
        </div>

        {/* Tab toggle */}
        <div className="flex gap-1">
          {(["live", "before"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 rounded font-display text-xs transition-all"
              style={{
                background: tab === t ? (t === "before" ? "rgba(231,76,60,0.15)" : "var(--amber-glow)") : "var(--bg-elevated)",
                border: `1px solid ${tab === t ? (t === "before" ? "var(--red)" : "var(--amber)") : "var(--border)"}`,
                color: tab === t ? (t === "before" ? "var(--red)" : "var(--amber)") : "var(--text-muted)",
              }}
            >
              {t === "live" ? "AFTER / LIVE" : "BEFORE"}
            </button>
          ))}
        </div>
      </div>

      {/* Known prospects quick select */}
      {DEMO_SITES.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <span className="font-mono text-xs pt-1.5" style={{ color: "var(--text-dim)" }}>QUICK:</span>
          {DEMO_SITES.map((site) => (
            <button
              key={site.id}
              onClick={() => { setPreviewUrl(site.url); setUrlInput(site.url); }}
              className="px-3 py-1.5 rounded font-mono text-xs transition-all hover:opacity-80"
              style={{
                background: previewUrl === site.url ? "var(--amber-glow)" : "var(--bg-elevated)",
                border: `1px solid ${previewUrl === site.url ? "var(--amber)" : "var(--border)"}`,
                color: previewUrl === site.url ? "var(--amber)" : "var(--text-muted)",
              }}
            >
              {site.name}
            </button>
          ))}
        </div>
      )}

      {/* Preview frame */}
      <div
        className="rounded-lg border overflow-hidden flex flex-col"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)", minHeight: 600 }}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b shrink-0"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: "var(--red)" }} />
            <span className="w-3 h-3 rounded-full" style={{ background: "var(--amber)" }} />
            <span className="w-3 h-3 rounded-full" style={{ background: "var(--green)" }} />
          </div>
          <div
            className="flex-1 px-3 py-1.5 rounded font-mono text-xs"
            style={{ background: "var(--bg-base)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            {previewUrl}
          </div>
          <span
            className="font-mono text-xs px-2 py-1 rounded"
            style={{
              background: tab === "before" ? "rgba(231,76,60,0.1)" : "var(--amber-glow)",
              color: tab === "before" ? "var(--red)" : "var(--amber)",
            }}
          >
            {tab === "before" ? "ORIGINAL" : "LIVE"}
          </span>
        </div>

        {/* Iframe wrapper */}
        <div className="flex-1 flex justify-center" style={{ background: "#111" }}>
          <div
            style={{
              width: vp.width,
              maxWidth: "100%",
              transition: "width 0.3s ease",
              position: "relative",
              height: "100%",
            }}
          >
            {tab === "live" ? (
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title="site preview"
                style={{ minHeight: 560 }}
              />
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center gap-4"
                style={{ minHeight: 560 }}
              >
                <div className="font-display text-4xl" style={{ color: "var(--text-dim)" }}>◻</div>
                <div className="font-display text-xl" style={{ color: "var(--text-muted)" }}>
                  BEFORE SCREENSHOT
                </div>
                <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
                  Scout captures before screenshot during Stage 1 audit
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Viewport info */}
      <div className="flex justify-center">
        <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
          Viewport: {vp.label} ({vp.width}) — {tab === "before" ? "ORIGINAL SITE" : "LIVE BUILD"}
        </span>
      </div>
    </div>
  );
}
