"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const BUILD_TYPES = [
  { id: "renovation",    label: "RENOVATION",    tier: "TIER 1 — RENOVATION" },
  { id: "new_build",     label: "NEW BUILD",     tier: "TIER 2 — NEW BUILD"  },
  { id: "premium",       label: "PREMIUM",       tier: "TIER 3 — ADVANCED"   },
  { id: "outreach_demo", label: "OUTREACH DEMO", tier: "TIER 1 — RENOVATION" },
  { id: "ugc_campaign",  label: "UGC CAMPAIGN",  tier: "TIER 1 — RENOVATION" },
];

export function CommandBar() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [buildType, setBuildType] = useState("renovation");
  const [notes, setNotes] = useState("");
  const [logoThumb, setLogoThumb] = useState<string | null>(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [firing, setFiring] = useState(false);
  const [fireError, setFireError] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<HTMLInputElement>(null);

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoThumb(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotoCount(e.target.files?.length ?? 0);
  }

  async function handleFire() {
    if (!url.trim() || firing) return;
    setFiring(true);
    setFireError("");

    let validatedUrl = url.trim();
    if (!validatedUrl.startsWith("http://") && !validatedUrl.startsWith("https://")) {
      validatedUrl = `https://${validatedUrl}`;
    }

    const tier = BUILD_TYPES.find(t => t.id === buildType)?.tier ?? "TIER 2 — NEW BUILD";

    try {
      const res = await fetch("/api/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: validatedUrl,
          tier,
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Pipeline failed to start");
      }

      const buildId = res.headers.get("X-Build-ID") ?? "";
      router.push(`/activity?buildId=${buildId}`);
    } catch (err) {
      setFireError((err as Error).message);
      setFiring(false);
    }
  }

  if (collapsed) {
    return (
      <div
        className="flex items-center gap-4 px-5 py-2 border-b"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        <span className="font-display text-sm" style={{ color: "var(--amber)" }}>COMMAND BAR</span>
        <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>— COLLAPSED — drop a URL and hit FIRE AGENTS to launch</span>
        <button
          onClick={() => setCollapsed(false)}
          className="ml-auto font-mono text-xs px-3 py-1 rounded border transition-all hover:opacity-80"
          style={{ borderColor: "var(--border)", color: "var(--amber)" }}
        >
          EXPAND ↓
        </button>
      </div>
    );
  }

  return (
    <div
      className="border-b"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
    >
      <div className="px-5 py-3 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <span className="font-display text-base" style={{ color: "var(--amber)" }}>
            COMMAND BAR — DROP ANY URL TO START A BUILD
          </span>
          <button
            onClick={() => setCollapsed(true)}
            className="font-mono text-xs px-3 py-1 rounded border transition-all hover:opacity-70"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            COLLAPSE ↑
          </button>
        </div>

        {/* Row 1: URL + Build type */}
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Drop any URL here to start a build..."
            className="flex-1 px-4 py-2.5 rounded font-mono text-sm outline-none"
            style={{
              background: "var(--bg-base)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              caretColor: "var(--amber)",
            }}
            onKeyDown={(e) => e.key === "Enter" && handleFire()}
          />
          <div className="flex gap-1.5 flex-wrap">
            {BUILD_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setBuildType(t.id)}
                className="px-3 py-2 rounded font-display text-xs transition-all"
                style={{
                  background: buildType === t.id ? "var(--amber-glow)" : "var(--bg-elevated)",
                  border: `1px solid ${buildType === t.id ? "var(--amber)" : "var(--border)"}`,
                  color: buildType === t.id ? "var(--amber)" : "var(--text-muted)",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Notes + Uploads + Fire */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add direction for the agents..."
            rows={2}
            className="flex-1 px-4 py-2.5 rounded font-mono text-xs outline-none resize-none"
            style={{
              background: "var(--bg-base)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              caretColor: "var(--amber)",
            }}
          />

          {/* Logo upload */}
          <div className="flex flex-col gap-1.5">
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
            <button
              onClick={() => logoRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded border font-mono text-xs transition-all hover:opacity-80"
              style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              {logoThumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoThumb} alt="logo" className="w-5 h-5 object-contain rounded" />
              ) : (
                <span style={{ color: "var(--amber)" }}>◈</span>
              )}
              LOGO
            </button>

            {/* Photos upload */}
            <input ref={photosRef} type="file" multiple accept="image/*" className="hidden" onChange={handlePhotos} />
            <button
              onClick={() => photosRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded border font-mono text-xs transition-all hover:opacity-80"
              style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              <span style={{ color: "var(--amber)" }}>◎</span>
              PHOTOS{photoCount > 0 && (
                <span
                  className="ml-1 px-1.5 py-0.5 rounded font-bold"
                  style={{ background: "var(--amber-glow)", color: "var(--amber)" }}
                >
                  {photoCount}
                </span>
              )}
            </button>
          </div>

          {/* FIRE button + error */}
          <div className="flex flex-col gap-1">
            <button
              onClick={handleFire}
              disabled={firing || !url}
              className="px-8 py-2 rounded-lg font-display text-2xl tracking-widest transition-all"
              style={{
                background: firing ? "var(--bg-elevated)" : url ? "var(--amber)" : "var(--bg-elevated)",
                color: url && !firing ? "#000" : "var(--text-dim)",
                boxShadow: url && !firing ? "0 0 24px rgba(200,151,58,0.35)" : "none",
                cursor: firing || !url ? "not-allowed" : "pointer",
                minWidth: 140,
                opacity: firing ? 0.6 : 1,
              }}
            >
              {firing ? "⚡ FIRING..." : "FIRE AGENTS"}
            </button>
            {fireError && (
              <div className="font-mono text-xs text-center py-1" style={{ color: "var(--red, #e53e3e)" }}>
                ⚠ {fireError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
