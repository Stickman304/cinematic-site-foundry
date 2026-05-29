"use client";
import { useState } from "react";

type Stage = 1 | 2 | 3 | 4 | 5;

const FORMATS = [
  { id: "street", label: "Street Interviews", icon: "🎤", desc: "Person-on-street reactions and opinions" },
  { id: "unboxing", label: "Unboxing", icon: "📦", desc: "First-look product reveals and reactions" },
  { id: "reviews", label: "Reviews", icon: "⭐", desc: "Authentic testimonial-style video reviews" },
  { id: "entertainment", label: "Entertainment", icon: "🎬", desc: "Trend-based entertaining content hooks" },
  { id: "asmr", label: "ASMR", icon: "🎧", desc: "Sensory product demonstration videos" },
];

const IDEA_CARDS = [
  { hook: "Street Interview", setting: "Outside competitor store", duration: "30s", caption: '"Why do you keep going back?"' },
  { hook: "Unboxing", setting: "Clean kitchen counter", duration: "45s", caption: "First time opening the box reaction" },
  { hook: "ASMR", setting: "Smoke pit closeup", duration: "60s", caption: "Sound of success — the sizzle" },
  { hook: "Before/After", setting: "Side by side comparison", duration: "15s", caption: "Old vs new — which would you trust?" },
  { hook: "Review", setting: "Backyard BBQ setup", duration: "90s", caption: '"This changed how I smoke brisket"' },
  { hook: "Entertainment", setting: "Kitchen challenge", duration: "30s", caption: "The $5 challenge vs $500 setup" },
];

export default function UGC() {
  const [activeStage, setActiveStage] = useState<Stage>(1);
  const [niche, setNiche] = useState("");
  const [platforms, setPlatforms] = useState({ tiktok: true, instagram: true, facebook: true });
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [researched, setResearched] = useState(false);
  const [stage1Approved, setStage1Approved] = useState(false);
  const [videoCount, setVideoCount] = useState(20);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({ street: true, unboxing: true, reviews: true, entertainment: true, asmr: false });
  const [stage2Approved, setStage2Approved] = useState(false);
  const [batchApproved, setBatchApproved] = useState(0);
  const [metaConnected, setMetaConnected] = useState(false);
  const [budget, setBudget] = useState("");
  const [campaignScheduled, setCampaignScheduled] = useState(false);

  const videosGenerated = Math.min(batchApproved * 10, videoCount);
  const generationPct = videoCount > 0 ? Math.round((videosGenerated / videoCount) * 100) : 0;

  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="font-display text-3xl" style={{ color: "var(--amber)" }}>UGC CAMPAIGN ENGINE</div>
        <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          20–100 videos · Facebook · Instagram · TikTok
        </div>
      </div>

      {/* Cost comparison banner */}
      <div
        className="rounded-lg px-5 py-4 flex items-center justify-between"
        style={{ background: "var(--amber)", color: "#000" }}
      >
        <span className="font-mono text-xs font-bold">Traditional agency: $28,000–$99,000</span>
        <span className="font-display text-base">VS</span>
        <span className="font-mono text-xs font-bold">AI cost: ~$900 / 100 videos</span>
      </div>

      {/* Stage nav */}
      <div className="flex gap-2 overflow-x-auto">
        {([1, 2, 3, 4, 5] as Stage[]).map((s) => {
          const labels = ["", "RESEARCH", "CONTENT PLAN", "GENERATE", "META ADS", "COST REPORT"];
          const unlocked =
            s === 1 ||
            (s === 2 && stage1Approved) ||
            (s === 3 && stage2Approved) ||
            (s === 4 && stage2Approved) ||
            (s === 5 && stage2Approved);
          return (
            <button
              key={s}
              onClick={() => unlocked && setActiveStage(s)}
              className="shrink-0 px-4 py-2 rounded font-display text-xs transition-all"
              style={{
                background: activeStage === s ? "var(--amber)" : "var(--bg-elevated)",
                color: activeStage === s ? "#000" : unlocked ? "var(--text-muted)" : "var(--text-dim)",
                opacity: unlocked ? 1 : 0.4,
                cursor: unlocked ? "pointer" : "not-allowed",
              }}
            >
              {s}. {labels[s]}
            </button>
          );
        })}
      </div>

      {/* Stage 1 — Research */}
      {activeStage === 1 && (
        <div className="rounded-lg border" style={{ background: "var(--bg-card)", borderColor: "var(--border-hover)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="font-display text-xl" style={{ color: "var(--amber)" }}>STAGE 1 — RESEARCH</div>
            <div className="font-mono text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Market analysis · viral content brief · 20 idea cards
            </div>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div>
              <label className="font-mono text-xs block mb-2" style={{ color: "var(--text-muted)" }}>
                DESCRIBE YOUR PRODUCT OR NICHE
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. specialty BBQ supplies, artisan candles, pet accessories..."
                className="w-full px-4 py-2.5 rounded font-mono text-sm outline-none"
                style={{
                  background: "var(--bg-base)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                  caretColor: "var(--amber)",
                }}
              />
            </div>

            <div>
              <label className="font-mono text-xs block mb-2" style={{ color: "var(--text-muted)" }}>
                TARGET PLATFORMS
              </label>
              <div className="flex gap-3">
                {(Object.keys(platforms) as (keyof typeof platforms)[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatforms((prev) => ({ ...prev, [p]: !prev[p] }))}
                    className="px-4 py-2 rounded font-mono text-xs transition-all"
                    style={{
                      background: platforms[p] ? "var(--amber-glow)" : "var(--bg-elevated)",
                      color: platforms[p] ? "var(--amber)" : "var(--text-muted)",
                      border: `1px solid ${platforms[p] ? "var(--amber)" : "var(--border)"}`,
                    }}
                  >
                    {platforms[p] ? "✓" : ""} {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-mono text-xs block mb-2" style={{ color: "var(--text-muted)" }}>
                COMPETITOR URL (OPTIONAL)
              </label>
              <input
                type="url"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                placeholder="https://topcompetitor.com"
                className="w-full px-4 py-2.5 rounded font-mono text-sm outline-none"
                style={{
                  background: "var(--bg-base)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                  caretColor: "var(--amber)",
                }}
              />
            </div>

            <button
              onClick={() => niche && setResearched(true)}
              disabled={!niche}
              className="w-full py-3 rounded font-display text-lg tracking-widest transition-all"
              style={{
                background: niche ? "var(--amber)" : "var(--bg-elevated)",
                color: niche ? "#000" : "var(--text-dim)",
                cursor: niche ? "pointer" : "not-allowed",
              }}
            >
              🔍 RUN RESEARCH
            </button>

            {researched && (
              <>
                <div
                  className="rounded border p-4"
                  style={{ background: "var(--bg-base)", borderColor: "var(--border)" }}
                >
                  <div className="font-display text-sm mb-2" style={{ color: "var(--amber)" }}>VIRAL CONTENT BRIEF</div>
                  <div className="font-mono text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    Market analysis complete for <span style={{ color: "var(--amber)" }}>{niche}</span>.
                    Top viral hook categories identified: authentic reaction (38%), before/after (29%),
                    social proof chain (22%), ASMR sensory (11%). Primary platform: {Object.entries(platforms).filter(([,v]) => v).map(([k]) => k).join(", ")}.
                    Peak posting windows: Tue–Thu 6–9PM, Sat 10AM–2PM.
                    Estimated CPM: $2.10–$4.80. Target: 18–45, interest in quality/craft products.
                  </div>
                </div>

                <div>
                  <div className="font-display text-sm mb-3" style={{ color: "var(--amber)" }}>
                    IDEA CARDS — 20 GENERATED
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {IDEA_CARDS.map((card, i) => (
                      <div
                        key={i}
                        className="rounded border p-3"
                        style={{ background: "var(--bg-base)", borderColor: "var(--border)" }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="font-mono text-xs px-1.5 py-0.5 rounded"
                            style={{ background: "var(--amber-glow)", color: "var(--amber)" }}
                          >
                            {card.hook}
                          </span>
                          <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>{card.duration}</span>
                        </div>
                        <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{card.setting}</div>
                        <div className="font-mono text-xs mt-1" style={{ color: "var(--text-primary)" }}>{card.caption}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => { setStage1Approved(true); setActiveStage(2); }}
                  className="w-full py-3 rounded font-display text-lg tracking-widest transition-all hover:opacity-90"
                  style={{ background: "var(--green)", color: "#000" }}
                >
                  ✅ APPROVE RESEARCH — UNLOCK STAGE 2
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Stage 2 — Content Plan */}
      {activeStage === 2 && (
        <div className="rounded-lg border" style={{ background: "var(--bg-card)", borderColor: stage1Approved ? "var(--border-hover)" : "var(--border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="font-display text-xl" style={{ color: "var(--amber)" }}>STAGE 2 — CONTENT PLAN</div>
            <div className="font-mono text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              60-day calendar · format selection · approval gate
            </div>
          </div>
          <div className="p-5 flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-xs block mb-2" style={{ color: "var(--text-muted)" }}>CAMPAIGN NAME</label>
                <div className="px-4 py-2.5 rounded font-mono text-sm" style={{ background: "var(--bg-base)", color: "var(--amber)", border: "1px solid var(--border)" }}>
                  {niche || "Campaign"} UGC Wave 1
                </div>
              </div>
              <div>
                <label className="font-mono text-xs block mb-2" style={{ color: "var(--text-muted)" }}>VIDEO COUNT</label>
                <div className="flex gap-2">
                  {[20, 50, 100].map((n) => (
                    <button
                      key={n}
                      onClick={() => setVideoCount(n)}
                      className="px-4 py-2.5 rounded font-mono text-sm transition-all"
                      style={{
                        background: videoCount === n ? "var(--amber)" : "var(--bg-elevated)",
                        color: videoCount === n ? "#000" : "var(--text-muted)",
                        border: `1px solid ${videoCount === n ? "var(--amber)" : "var(--border)"}`,
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="font-mono text-xs block mb-3" style={{ color: "var(--text-muted)" }}>FORMAT MIX</label>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFormats((prev) => ({ ...prev, [f.id]: !prev[f.id] }))}
                    className="rounded border p-3 text-left transition-all"
                    style={{
                      background: activeFormats[f.id] ? "var(--amber-glow)" : "var(--bg-elevated)",
                      borderColor: activeFormats[f.id] ? "var(--amber)" : "var(--border)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>{f.icon}</span>
                      <span className="font-display text-sm" style={{ color: activeFormats[f.id] ? "var(--amber)" : "var(--text-primary)" }}>
                        {f.label}
                      </span>
                    </div>
                    <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { setStage2Approved(true); setActiveStage(3); }}
              className="w-full py-3 rounded font-display text-lg tracking-widest transition-all hover:opacity-90"
              style={{ background: "var(--amber)", color: "#000" }}
            >
              ✅ APPROVE PLAN — UNLOCK GENERATION
            </button>
          </div>
        </div>
      )}

      {/* Stage 3 — Generate */}
      {activeStage === 3 && (
        <div className="rounded-lg border" style={{ background: "var(--bg-card)", borderColor: stage2Approved ? "var(--border-hover)" : "var(--border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="font-display text-xl" style={{ color: "var(--amber)" }}>STAGE 3 — GENERATE</div>
            <div className="font-mono text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Batches of 10 · approve each batch · your content, your call
            </div>
          </div>
          <div className="p-5 flex flex-col gap-5">
            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>PROGRESS</span>
                <span className="font-mono text-sm font-bold" style={{ color: "var(--amber)" }}>
                  {videosGenerated} / {videoCount} videos
                </span>
              </div>
              <div className="h-2 rounded-full" style={{ background: "var(--bg-elevated)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${generationPct}%`, background: "var(--amber)" }}
                />
              </div>
              <div className="font-mono text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                {generationPct}% complete · {videoCount - videosGenerated} remaining
              </div>
            </div>

            {/* Batch approval */}
            <div className="rounded border p-4" style={{ background: "var(--bg-base)", borderColor: "var(--border)" }}>
              <div className="font-display text-sm mb-3" style={{ color: "var(--amber)" }}>
                BATCH {batchApproved + 1} — 10 VIDEOS READY
              </div>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-video rounded flex items-center justify-center"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                  >
                    <span style={{ color: "var(--text-dim)", fontSize: 18 }}>▶</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (videosGenerated < videoCount) setBatchApproved((n) => n + 1);
                  }}
                  className="flex-1 py-2.5 rounded font-display text-sm transition-all hover:opacity-90"
                  style={{ background: "var(--green)", color: "#000" }}
                >
                  ✅ APPROVE BATCH
                </button>
                <button
                  className="flex-1 py-2.5 rounded font-display text-sm transition-all hover:opacity-80"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                >
                  🔄 REGENERATE BATCH
                </button>
              </div>
            </div>

            {videosGenerated >= videoCount && videosGenerated > 0 && (
              <div className="flex gap-3">
                <button
                  className="flex-1 py-3 rounded font-display text-base transition-all hover:opacity-80"
                  style={{ background: "var(--amber-glow)", color: "var(--amber)", border: "1px solid var(--border-hover)" }}
                >
                  👁 PREVIEW ALL
                </button>
                <button
                  className="flex-1 py-3 rounded font-display text-base transition-all hover:opacity-80"
                  style={{ background: "var(--amber)", color: "#000" }}
                >
                  ⬇️ DOWNLOAD ALL
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stage 4 — Meta Ads */}
      {activeStage === 4 && (
        <div className="rounded-lg border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="font-display text-xl" style={{ color: "var(--amber)" }}>STAGE 4 — META ADS</div>
            <div className="font-mono text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Facebook · Instagram · campaign scheduling
            </div>
          </div>
          <div className="p-5 flex flex-col gap-5">
            {!metaConnected ? (
              <button
                onClick={() => setMetaConnected(true)}
                className="w-full py-3 rounded font-display text-lg transition-all hover:opacity-90"
                style={{ background: "var(--amber)", color: "#000" }}
              >
                🔗 CONNECT META ADS MCP
              </button>
            ) : (
              <div
                className="px-4 py-3 rounded font-mono text-sm"
                style={{ background: "rgba(46,204,113,0.1)", color: "var(--green)", border: "1px solid rgba(46,204,113,0.3)" }}
              >
                ✓ Meta Ads MCP Connected
              </div>
            )}

            {metaConnected && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-xs block mb-2" style={{ color: "var(--text-muted)" }}>DAILY BUDGET ($)</label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="50"
                      className="w-full px-4 py-2.5 rounded font-mono text-sm outline-none"
                      style={{ background: "var(--bg-base)", color: "var(--text-primary)", border: "1px solid var(--border)", caretColor: "var(--amber)" }}
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs block mb-2" style={{ color: "var(--text-muted)" }}>PLACEMENTS</label>
                    <div className="flex gap-2">
                      {["Facebook", "Instagram", "Both"].map((p) => (
                        <button
                          key={p}
                          className="px-3 py-2 rounded font-mono text-xs"
                          style={{ background: p === "Both" ? "var(--amber)" : "var(--bg-elevated)", color: p === "Both" ? "#000" : "var(--text-muted)", border: "1px solid var(--border)" }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setCampaignScheduled(true)}
                  className="w-full py-3 rounded font-display text-lg transition-all hover:opacity-90"
                  style={{ background: "var(--amber)", color: "#000" }}
                >
                  📅 SCHEDULE CAMPAIGN
                </button>
                {campaignScheduled && (
                  <div className="px-4 py-3 rounded font-mono text-sm" style={{ background: "rgba(46,204,113,0.1)", color: "var(--green)", border: "1px solid rgba(46,204,113,0.3)" }}>
                    ✓ Campaign scheduled — {videoCount} videos queued · ${budget}/day
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Stage 5 — Cost Report */}
      {activeStage === 5 && (
        <div className="rounded-lg border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="font-display text-xl" style={{ color: "var(--amber)" }}>STAGE 5 — COST REPORT</div>
            <div className="font-mono text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              ROI comparison · profit margin calculator
            </div>
          </div>
          <div className="p-5 flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded border p-4 text-center" style={{ background: "var(--bg-base)", borderColor: "var(--border)" }}>
                <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>CREDITS USED</div>
                <div className="font-display text-2xl mt-1" style={{ color: "var(--text-primary)" }}>
                  {videoCount * 9}
                </div>
              </div>
              <div className="rounded border p-4 text-center" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-hover)" }}>
                <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>YOUR AI COST</div>
                <div className="font-display text-4xl mt-1" style={{ color: "var(--amber)" }}>
                  ${Math.round((videoCount / 100) * 900)}
                </div>
              </div>
              <div className="rounded border p-4 text-center" style={{ background: "var(--bg-base)", borderColor: "var(--border)" }}>
                <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>TRADITIONAL AGENCY</div>
                <div className="font-display text-2xl mt-1" style={{ color: "var(--red)" }}>
                  $28K–$99K
                </div>
              </div>
            </div>

            <div className="rounded border p-4" style={{ background: "var(--bg-base)", borderColor: "var(--border)" }}>
              <div className="font-mono text-xs mb-3" style={{ color: "var(--text-muted)" }}>SAVINGS vs TRADITIONAL</div>
              <div className="font-display text-4xl" style={{ color: "var(--green)" }}>
                $27,100 – $98,100 saved
              </div>
              <div className="font-mono text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                Based on {videoCount} videos at ~${Math.round((videoCount / 100) * 900)} AI cost
              </div>
            </div>

            <div>
              <label className="font-mono text-xs block mb-2" style={{ color: "var(--text-muted)" }}>
                CLIENT RATE → PROFIT MARGIN
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  placeholder="3500"
                  className="flex-1 px-4 py-2.5 rounded font-mono text-sm outline-none"
                  style={{ background: "var(--bg-base)", color: "var(--text-primary)", border: "1px solid var(--border)", caretColor: "var(--amber)" }}
                />
                <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>→ margin ~{Math.round(((3500 - (videoCount / 100) * 900) / 3500) * 100)}%</span>
              </div>
            </div>

            <button
              className="w-full py-3 rounded font-display text-lg transition-all hover:opacity-90"
              style={{ background: "var(--amber)", color: "#000" }}
            >
              ⬇️ DOWNLOAD PDF REPORT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
