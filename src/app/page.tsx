"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AGENTS, ACTIVE_BUILD } from "@/lib/data";
import type { Agent } from "@/types/models";
import { AgentCard } from "@/components/AgentCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { TerminalPanel } from "@/components/TerminalPanel";
import { SkillsStatus } from "@/components/SkillsStatus";

// ── Types ──────────────────────────────────────────────────────────────────────

type TierId = "tier1" | "tier2" | "tier3" | "premium";

interface Tier {
  id: TierId;
  label: string;
  price: string;
  aiCost: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TIERS: Tier[] = [
  { id: "tier1",   label: "TIER 1 — RENOVATION", price: "$500–$2,500",    aiCost: "~$0.50 AI cost" },
  { id: "tier2",   label: "TIER 2 — NEW BUILD",  price: "$5,000–$10,000", aiCost: "~$1.50–$3 AI cost" },
  { id: "tier3",   label: "TIER 3 — ADVANCED",   price: "$15,000–$30,000",aiCost: "~$5–$8 AI cost" },
  { id: "premium", label: "PREMIUM — AN EVENT",   price: "$30,000+",       aiCost: "~$10–$15 AI cost" },
];

// ── Build Launcher ────────────────────────────────────────────────────────────

function BuildLauncher() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<TierId | null>(null);
  const [url, setUrl] = useState("");
  const [clientName, setClientName] = useState("");
  const [notes, setNotes] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [logoFiles, setLogoFiles] = useState<File[]>([]);
  const [urlError, setUrlError] = useState("");
  const [launchStatus, setLaunchStatus] = useState<"idle" | "uploading" | "launching" | "error">("idle");
  const [launchError, setLaunchError] = useState("");

  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setPhotoFiles(Array.from(e.target.files));
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setLogoFiles(Array.from(e.target.files));
  }

  async function handleLaunch() {
    if (!url.trim()) { setUrlError("Client URL is required"); return; }
    if (!selectedTier) return;
    setUrlError("");
    setLaunchError("");
    const tier = TIERS.find((t) => t.id === selectedTier)!;

    try {
      // Step 1: upload photos to Supabase Storage
      let photoUrls: string[] = [];
      const allFiles = [...photoFiles, ...logoFiles];
      if (allFiles.length > 0) {
        setLaunchStatus("uploading");
        const buildId = crypto.randomUUID();
        const fd = new FormData();
        fd.append("buildId", buildId);
        allFiles.forEach((f) => fd.append("files", f));
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        if (!upRes.ok) throw new Error("Photo upload failed");
        const { urls } = await upRes.json();
        photoUrls = urls;
      }

      // Step 2: fire the pipeline
      setLaunchStatus("launching");
      const body = {
        tier: tier.label,
        url: url.trim(),
        clientName: clientName.trim() || undefined,
        notes: notes.trim() || undefined,
        photoUrls,
      };
      const res = await fetch("/api/launch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Pipeline failed to start");
      const buildId = res.headers.get("X-Build-ID") ?? "";

      // Step 3: navigate to activity to watch live
      router.push(`/activity?buildId=${buildId}`);
    } catch (err) {
      setLaunchStatus("error");
      setLaunchError((err as Error).message);
    }
  }

  const activeTier = TIERS.find((t) => t.id === selectedTier);
  const isBusy = launchStatus === "uploading" || launchStatus === "launching";

  return (
    <div
      className="rounded-lg border p-5 flex flex-col gap-5"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div>
        <div className="font-display text-2xl" style={{ color: "var(--amber)" }}>
          BUILD LAUNCHER
        </div>
        <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          Select a tier to open the build panel
        </div>
      </div>

      {/* Tier grid */}
      <div className="grid grid-cols-2 gap-3">
        {TIERS.map((tier) => {
          const isSelected = selectedTier === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(isSelected ? null : tier.id)}
              className="rounded-lg border text-left px-4 py-3 flex flex-col gap-1 transition-all"
              style={{
                minHeight: "88px",
                background: isSelected ? "var(--amber)" : "var(--bg-elevated)",
                borderColor: isSelected ? "var(--amber)" : "var(--border)",
                boxShadow: isSelected ? "0 0 16px var(--amber-glow)" : "none",
                color: isSelected ? "#030407" : "inherit",
              }}
            >
              <span
                className="font-display text-lg leading-tight"
                style={{ color: isSelected ? "#030407" : "var(--amber)" }}
              >
                {tier.label}
              </span>
              <span
                className="font-mono text-xs"
                style={{ color: isSelected ? "#030407" : "var(--text-muted)" }}
              >
                {tier.price}
              </span>
              <span
                className="font-mono text-[10px]"
                style={{ color: isSelected ? "rgba(3,4,7,0.65)" : "var(--text-dim)" }}
              >
                {tier.aiCost}
              </span>
            </button>
          );
        })}
      </div>

      {/* Two-build rule banner — always visible */}
      <div
        className="rounded border px-4 py-3 font-mono text-xs leading-relaxed"
        style={{
          background: "var(--amber)",
          borderColor: "var(--amber)",
          color: "#030407",
          fontWeight: 600,
        }}
      >
        ⚡ TWO-BUILD RULE — Two distinct creative directions required. visual-storyteller produces both. You approve before any code is written.
      </div>

      {/* Panel — slides open when tier selected */}
      {selectedTier && activeTier && (
        <div className="flex flex-col gap-4">
          {/* Panel title */}
          <div className="font-display text-xl" style={{ color: "var(--amber)" }}>
            {activeTier.label} — BUILD PANEL
          </div>

          {/* CLIENT URL */}
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              CLIENT URL <span style={{ color: "var(--amber)" }}>*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (e.target.value.trim()) setUrlError("");
              }}
              placeholder="https://example.com — paste client website"
              className="w-full rounded border bg-transparent px-3 py-2 font-mono text-sm outline-none transition-all"
              style={{
                minHeight: "44px",
                borderColor: urlError ? "var(--red)" : "var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                if (!urlError) e.currentTarget.style.borderColor = "var(--amber)";
              }}
              onBlur={(e) => {
                if (!urlError) e.currentTarget.style.borderColor = "var(--border)";
              }}
            />
            {urlError && (
              <span className="font-mono text-xs" style={{ color: "var(--red)" }}>
                {urlError}
              </span>
            )}
          </div>

          {/* CLIENT NAME */}
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              CLIENT NAME
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Business name (optional at launch)"
              className="w-full rounded border bg-transparent px-3 py-2 font-mono text-sm outline-none transition-all"
              style={{
                minHeight: "44px",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--amber)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            />
          </div>

          {/* UPLOAD CLIENT PHOTOS */}
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              UPLOAD CLIENT PHOTOS
            </label>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="w-full rounded border px-4 py-4 font-mono text-xs text-center transition-all cursor-pointer"
              style={{
                minHeight: "64px",
                borderColor: "var(--border)",
                borderStyle: "dashed",
                background: "var(--bg-elevated)",
                color: "var(--text-muted)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--amber)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              📎 Drop photos here or click to upload · jpg, png, webp · multiple OK
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handlePhotoChange}
            />
            {photoFiles.length > 0 && (
              <div className="flex flex-col gap-0.5 mt-1">
                {photoFiles.map((f, i) => (
                  <span key={i} className="font-mono text-xs" style={{ color: "var(--amber)" }}>
                    ✓ {f.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* UPLOAD LOGO */}
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              UPLOAD LOGO
            </label>
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="w-full rounded border px-4 py-4 font-mono text-xs text-center transition-all cursor-pointer"
              style={{
                minHeight: "64px",
                borderColor: "var(--border)",
                borderStyle: "dashed",
                background: "var(--bg-elevated)",
                color: "var(--text-muted)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--amber)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              📎 Drop logo here or click to upload · png or svg · transparent preferred
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/svg+xml"
              className="hidden"
              onChange={handleLogoChange}
            />
            {logoFiles.length > 0 && (
              <div className="flex flex-col gap-0.5 mt-1">
                {logoFiles.map((f, i) => (
                  <span key={i} className="font-mono text-xs" style={{ color: "var(--amber)" }}>
                    ✓ {f.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* NOTES */}
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              NOTES
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any special instructions, brand notes, target audience..."
              className="w-full rounded border bg-transparent px-3 py-2 font-mono text-sm outline-none transition-all resize-none"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--amber)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            />
          </div>

          {/* Launch button */}
          <button
            onClick={handleLaunch}
            disabled={isBusy}
            className="w-full rounded font-display text-2xl tracking-wide transition-all"
            style={{
              minHeight: "56px",
              background: isBusy ? "var(--bg-elevated)" : "var(--amber)",
              color: isBusy ? "var(--text-muted)" : "#030407",
              border: "none",
              cursor: isBusy ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => { if (!isBusy) e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {launchStatus === "uploading" && "⏫ UPLOADING ASSETS..."}
            {launchStatus === "launching" && "⚡ PIPELINE FIRING..."}
            {(launchStatus === "idle" || launchStatus === "error") && "🎬 LAUNCH BUILD"}
          </button>

          {launchStatus === "error" && (
            <div
              className="font-mono text-xs text-center py-2 rounded"
              style={{ color: "var(--red)", background: "rgba(231,76,60,0.07)", border: "1px solid var(--red)" }}
            >
              ⚠ {launchError || "Launch failed — check Anthropic API key and try again"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Empty State Banner ─────────────────────────────────────────────────────────

function EmptyStateBanner() {
  return (
    <div
      className="rounded-lg border px-5 py-8 flex flex-col items-center justify-center gap-3 text-center"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <span style={{ fontSize: "1.875rem" }}>🎬</span>
      <div className="font-display text-2xl" style={{ color: "var(--amber)" }}>
        NO ACTIVE BUILD. CREW STANDING BY.
      </div>
      <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
        Drop a URL and select a tier to launch the pipeline.
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MissionControl() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  function handleAgentClick(agent: Agent) {
    setSelectedAgent((prev) => (prev?.id === agent.id ? null : agent));
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">

          {/* Empty state — only when no active build */}
          {!ACTIVE_BUILD && <EmptyStateBanner />}

          {/* Build Launcher — always visible */}
          <BuildLauncher />

          {/* Agent grid */}
          <div>
            <div className="font-display text-xl mb-1" style={{ color: "var(--amber)" }}>
              AGENT TEAM — 200+ LOADED
            </div>
            <div className="font-mono text-xs mb-4" style={{ color: "var(--text-dim)" }}>
              Click any agent card to open live terminal log
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {AGENTS.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onClick={() => handleAgentClick(agent)}
                />
              ))}
            </div>
          </div>

          {/* Skills status */}
          <SkillsStatus />

          {/* Activity feed */}
          <ActivityFeed />

        </div>
      </div>

      {/* Terminal panel — slides in on agent click */}
      {selectedAgent && (
        <TerminalPanel
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
