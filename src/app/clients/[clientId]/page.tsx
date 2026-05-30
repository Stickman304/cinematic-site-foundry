"use client";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import type { ClientWithAssets, ClientAsset, AssetApprovalStatus, AllowedUse, AssetType } from "@/types/models";

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<AssetApprovalStatus, string> = {
  approved: "var(--green)",
  pending: "var(--amber)",
  needs_permission: "#f59e0b",
  restricted: "var(--red)",
};

const STATUS_LABEL: Record<AssetApprovalStatus, string> = {
  approved: "APPROVED",
  pending: "PENDING",
  needs_permission: "NEEDS PERMISSION",
  restricted: "RESTRICTED",
};

const ASSET_TYPE_OPTIONS: AssetType[] = ["logo", "product", "personal", "location", "social", "other"];

// ── Details Tab ───────────────────────────────────────────────────────────────

function DetailsTab({ client, onRefresh }: { client: ClientWithAssets; onRefresh: () => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [form, setForm] = useState({
    name: client.name,
    businessType: client.businessType ?? "",
    websiteUrl: client.websiteUrl ?? "",
    brandNotes: client.brandNotes ?? "",
    primaryColor: client.primaryColor ?? "",
    secondaryColor: client.secondaryColor ?? "",
    fontPreference: client.fontPreference ?? "",
    contactName: client.contactName ?? "",
    contactEmail: client.contactEmail ?? "",
    contactPhone: client.contactPhone ?? "",
    notes: client.notes ?? "",
  });

  function set(key: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [key]: v }));
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        businessType: form.businessType || undefined,
        websiteUrl: form.websiteUrl.trim() || undefined,
        brandNotes: form.brandNotes.trim() || undefined,
        primaryColor: form.primaryColor || undefined,
        secondaryColor: form.secondaryColor || undefined,
        fontPreference: form.fontPreference.trim() || undefined,
        contactName: form.contactName.trim() || undefined,
        contactEmail: form.contactEmail.trim() || undefined,
        contactPhone: form.contactPhone.trim() || undefined,
        notes: form.notes.trim() || undefined,
      }),
    });
    setSaving(false);
    setEditing(false);
    onRefresh();
  }

  async function addNote() {
    if (!note.trim()) return;
    setAddingNote(true);
    await fetch(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: note.trim() }),
    });
    setNote("");
    setAddingNote(false);
    onRefresh();
  }

  const inputStyle: React.CSSProperties = {
    background: "var(--bg-base)",
    color: "var(--text-primary)",
    border: "1px solid var(--border)",
    caretColor: "var(--amber)",
    borderRadius: 6,
    padding: "8px 10px",
    fontFamily: "monospace",
    fontSize: 12,
    outline: "none",
    width: "100%",
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Client info card */}
      <div className="rounded-lg border p-5 flex flex-col gap-4" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between">
          <div className="font-mono text-xs font-bold" style={{ color: "var(--amber)" }}>BRAND IDENTITY</div>
          <button
            onClick={() => setEditing(!editing)}
            className="font-mono text-xs px-3 py-1.5 rounded transition-all hover:opacity-80"
            style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)", cursor: "pointer" }}
          >
            {editing ? "CANCEL" : "EDIT"}
          </button>
        </div>

        {editing ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>BUSINESS NAME</label>
              <input style={inputStyle} value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>BUSINESS TYPE</label>
                <input style={inputStyle} value={form.businessType} onChange={e => set("businessType", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>WEBSITE URL</label>
                <input style={inputStyle} value={form.websiteUrl} onChange={e => set("websiteUrl", e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>BRAND NOTES</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.brandNotes} onChange={e => set("brandNotes", e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>PRIMARY COLOR</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={form.primaryColor || "#4f8fff"} onChange={e => set("primaryColor", e.target.value)} style={{ width: 32, height: 32, border: "1px solid var(--border)", background: "none", padding: 2, borderRadius: 4, cursor: "pointer" }} />
                  <input style={{ ...inputStyle, flex: 1 }} value={form.primaryColor} onChange={e => set("primaryColor", e.target.value)} placeholder="#4f8fff" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>SECONDARY COLOR</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={form.secondaryColor || "#ffffff"} onChange={e => set("secondaryColor", e.target.value)} style={{ width: 32, height: 32, border: "1px solid var(--border)", background: "none", padding: 2, borderRadius: 4, cursor: "pointer" }} />
                  <input style={{ ...inputStyle, flex: 1 }} value={form.secondaryColor} onChange={e => set("secondaryColor", e.target.value)} placeholder="#ffffff" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>FONT PREFERENCE</label>
                <input style={inputStyle} value={form.fontPreference} onChange={e => set("fontPreference", e.target.value)} placeholder="Montserrat, etc." />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>CONTACT NAME</label>
                <input style={inputStyle} value={form.contactName} onChange={e => set("contactName", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>EMAIL</label>
                <input style={inputStyle} type="email" value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>PHONE</label>
                <input style={inputStyle} type="tel" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>INTERNAL NOTES</label>
              <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.notes} onChange={e => set("notes", e.target.value)} />
            </div>
            <button
              onClick={save}
              disabled={saving}
              className="rounded font-mono text-sm py-2.5 transition-all hover:opacity-90"
              style={{ background: "var(--amber)", color: "#030407", border: "none", cursor: saving ? "not-allowed" : "pointer" }}
            >
              {saving ? "SAVING..." : "SAVE CHANGES"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-4">
              {client.businessType && (
                <div>
                  <div className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>TYPE</div>
                  <div className="font-mono text-xs" style={{ color: "var(--text-primary)" }}>{client.businessType}</div>
                </div>
              )}
              {client.websiteUrl && (
                <div>
                  <div className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>WEBSITE</div>
                  <a href={client.websiteUrl} target="_blank" rel="noreferrer" className="font-mono text-xs" style={{ color: "var(--amber)" }}>
                    {client.websiteUrl.replace(/^https?:\/\//, "")} ↗
                  </a>
                </div>
              )}
            </div>

            {client.brandNotes && (
              <div>
                <div className="font-mono text-[10px] mb-1" style={{ color: "var(--text-dim)" }}>BRAND NOTES</div>
                <div className="font-mono text-xs leading-relaxed rounded p-3" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", borderRadius: 6 }}>
                  {client.brandNotes}
                </div>
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              {client.primaryColor && (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border" style={{ background: client.primaryColor, borderColor: "var(--border)" }} />
                  <span className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>PRIMARY {client.primaryColor}</span>
                </div>
              )}
              {client.secondaryColor && (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border" style={{ background: client.secondaryColor, borderColor: "var(--border)" }} />
                  <span className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>SECONDARY {client.secondaryColor}</span>
                </div>
              )}
              {client.fontPreference && (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--bg-elevated)", color: "var(--text-dim)" }}>
                  FONT: {client.fontPreference}
                </span>
              )}
            </div>

            {(client.contactName || client.contactEmail || client.contactPhone) && (
              <div>
                <div className="font-mono text-[10px] mb-1" style={{ color: "var(--text-dim)" }}>CONTACT</div>
                <div className="font-mono text-xs flex flex-wrap gap-3" style={{ color: "var(--text-muted)" }}>
                  {client.contactName && <span>{client.contactName}</span>}
                  {client.contactEmail && <a href={`mailto:${client.contactEmail}`} style={{ color: "var(--amber)" }}>{client.contactEmail}</a>}
                  {client.contactPhone && <span>{client.contactPhone}</span>}
                </div>
              </div>
            )}

            {client.notes && (
              <div>
                <div className="font-mono text-[10px] mb-1" style={{ color: "var(--text-dim)" }}>INTERNAL NOTES</div>
                <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{client.notes}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Intake notes */}
      <div className="rounded-lg border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="font-mono text-xs font-bold" style={{ color: "var(--amber)" }}>INTAKE NOTES</div>
        </div>
        <div className="p-4 flex gap-2">
          <input
            style={{ ...{ background: "var(--bg-base)", color: "var(--text-primary)", border: "1px solid var(--border)", caretColor: "var(--amber)", borderRadius: 6, padding: "8px 10px", fontFamily: "monospace", fontSize: 12, outline: "none" }, flex: 1 }}
            value={note}
            onChange={e => setNote(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addNote()}
            placeholder="Log a note about this client..."
          />
          <button
            onClick={addNote}
            disabled={addingNote || !note.trim()}
            className="font-mono text-xs px-4 rounded transition-all hover:opacity-80"
            style={{ background: "var(--amber)", color: "#000", border: "none", cursor: "pointer" }}
          >
            ADD
          </button>
        </div>
        {client.intakeNotes.length === 0 ? (
          <div className="px-5 py-6 text-center">
            <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>No notes yet.</div>
          </div>
        ) : (
          <div className="flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
            {client.intakeNotes.map(n => (
              <div key={n.id} className="px-5 py-3">
                <div className="font-mono text-xs" style={{ color: "var(--text-primary)" }}>{n.note}</div>
                <div className="font-mono text-[10px] mt-0.5" style={{ color: "var(--text-dim)" }}>
                  {n.author} · {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Assets Tab ────────────────────────────────────────────────────────────────

function AssetCard({ asset, onUpdate, onDelete }: {
  asset: ClientAsset;
  onUpdate: (patch: Record<string, unknown>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(asset.fileUrl);

  const statusCycles: AssetApprovalStatus[] = ["pending", "approved", "needs_permission", "restricted"];

  async function cycleStatus() {
    const next = statusCycles[(statusCycles.indexOf(asset.approvalStatus) + 1) % statusCycles.length];
    setSaving(true);
    await fetch(`/api/client-assets/${asset.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvalStatus: next }),
    });
    setSaving(false);
    onUpdate({ approvalStatus: next });
  }

  async function handleDelete() {
    if (!confirm("Delete this asset? This cannot be undone.")) return;
    await fetch(`/api/client-assets/${asset.id}`, { method: "DELETE" });
    onDelete();
  }

  return (
    <div className="rounded-lg border overflow-hidden flex flex-col" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      {/* Preview */}
      <div className="relative" style={{ paddingBottom: "66%", background: "var(--bg-elevated)" }}>
        {isImage ? (
          <img
            src={asset.fileUrl}
            alt={asset.altText ?? asset.assetType}
            className="absolute inset-0 w-full h-full object-contain p-2"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
              {asset.assetType.toUpperCase()}
            </span>
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2 font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: "var(--bg-card)", color: "var(--text-dim)", border: "1px solid var(--border)" }}>
          {asset.assetType.toUpperCase()}
        </div>

        {/* Flags */}
        {(asset.containsPeople || asset.containsMinor) && (
          <div className="absolute top-2 right-2 font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(231,76,60,0.15)", color: "var(--red)", border: "1px solid rgba(231,76,60,0.3)" }}>
            {asset.containsMinor ? "MINOR" : "PEOPLE"}
          </div>
        )}
      </div>

      {/* Status + controls */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <button
          onClick={cycleStatus}
          disabled={saving}
          className="font-mono text-[9px] px-2 py-1 rounded transition-all hover:opacity-80"
          style={{
            background: `${STATUS_COLOR[asset.approvalStatus]}22`,
            color: STATUS_COLOR[asset.approvalStatus],
            border: `1px solid ${STATUS_COLOR[asset.approvalStatus]}44`,
            cursor: "pointer",
          }}
          title="Click to cycle approval status"
        >
          {STATUS_LABEL[asset.approvalStatus]}
        </button>

        <div className="flex gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="font-mono text-[9px] px-2 py-1 rounded transition-all hover:opacity-70"
            style={{ background: "var(--bg-elevated)", color: "var(--text-dim)", cursor: "pointer" }}
          >
            {expanded ? "▲" : "▼"}
          </button>
          <a
            href={asset.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[9px] px-2 py-1 rounded transition-all hover:opacity-70"
            style={{ background: "var(--bg-elevated)", color: "var(--text-dim)" }}
          >
            ↗
          </a>
          <button
            onClick={handleDelete}
            className="font-mono text-[9px] px-2 py-1 rounded transition-all hover:opacity-80"
            style={{ background: "rgba(231,76,60,0.1)", color: "var(--red)", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 flex flex-col gap-2 border-t" style={{ borderColor: "var(--border)" }}>
          {asset.altText && (
            <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>{asset.altText}</div>
          )}
          {asset.allowedUse.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {asset.allowedUse.map(u => (
                <span key={u} className="font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: "var(--bg-elevated)", color: "var(--text-dim)" }}>
                  {u}
                </span>
              ))}
            </div>
          )}
          {asset.notes && (
            <div className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>{asset.notes}</div>
          )}
          <div className="font-mono text-[9px]" style={{ color: "var(--text-dim)" }}>
            Added {new Date(asset.createdAt).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}

function AssetsTab({ client, onRefresh }: { client: ClientWithAssets; onRefresh: () => void }) {
  const [assets, setAssets] = useState<ClientAsset[]>(client.assets);
  const [filter, setFilter] = useState<AssetType | "all">("all");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [form, setForm] = useState({
    assetType: "other" as AssetType,
    altText: "",
    containsPeople: false,
    containsMinor: false,
    notes: "",
    allowedUse: [] as AllowedUse[],
  });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAssets(client.assets);
  }, [client.assets]);

  const displayed = filter === "all" ? assets : assets.filter(a => a.assetType === filter);

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError("");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("assetType", form.assetType);
    fd.append("altText", form.altText);
    fd.append("containsPeople", String(form.containsPeople));
    fd.append("containsMinor", String(form.containsMinor));
    fd.append("notes", form.notes);
    fd.append("allowedUse", JSON.stringify(form.allowedUse));

    try {
      const res = await fetch(`/api/clients/${client.id}/assets`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed");
      } else {
        setAssets(prev => [data.asset, ...prev]);
        onRefresh();
        setForm({ assetType: "other", altText: "", containsPeople: false, containsMinor: false, notes: "", allowedUse: [] });
      }
    } catch {
      setUploadError("Network error — try again");
    } finally {
      setUploading(false);
    }
  }

  function toggleAllowedUse(use: AllowedUse) {
    setForm(f => ({
      ...f,
      allowedUse: f.allowedUse.includes(use)
        ? f.allowedUse.filter(u => u !== use)
        : [...f.allowedUse, use],
    }));
  }

  const approved = assets.filter(a => a.approvalStatus === "approved").length;
  const restricted = assets.filter(a => a.approvalStatus === "restricted" || a.containsMinor).length;

  return (
    <div className="flex flex-col gap-5">
      {/* Summary strip */}
      <div className="flex gap-3 flex-wrap">
        {([
          { label: "TOTAL", value: assets.length, color: "var(--text-muted)" },
          { label: "APPROVED", value: approved, color: "var(--green)" },
          { label: "RESTRICTED", value: restricted, color: "var(--red)" },
        ] as { label: string; value: number; color: string }[]).map(s => (
          <div key={s.label} className="rounded px-4 py-2 flex flex-col items-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="font-display text-xl" style={{ color: s.color }}>{s.value}</div>
            <div className="font-mono text-[9px]" style={{ color: "var(--text-dim)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upload card */}
      <div className="rounded-lg border p-4 flex flex-col gap-3" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="font-mono text-xs font-bold" style={{ color: "var(--amber)" }}>UPLOAD ASSET</div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>ASSET TYPE</label>
            <select
              value={form.assetType}
              onChange={e => setForm(f => ({ ...f, assetType: e.target.value as AssetType }))}
              style={{ background: "var(--bg-base)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 10px", fontFamily: "monospace", fontSize: 12, outline: "none" }}
            >
              {ASSET_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>ALT TEXT</label>
            <input
              value={form.altText}
              onChange={e => setForm(f => ({ ...f, altText: e.target.value }))}
              placeholder="Describe the image"
              style={{ background: "var(--bg-base)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 10px", fontFamily: "monospace", fontSize: 12, outline: "none" }}
            />
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.containsPeople} onChange={e => setForm(f => ({ ...f, containsPeople: e.target.checked }))} />
            <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>Contains people</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.containsMinor} onChange={e => setForm(f => ({ ...f, containsMinor: e.target.checked }))} />
            <span className="font-mono text-xs" style={{ color: "var(--red)" }}>Contains minor (auto-restricted)</span>
          </label>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>ALLOWED USE</label>
          <div className="flex gap-2 flex-wrap">
            {(["build", "sales", "social", "any"] as AllowedUse[]).map(u => (
              <button
                key={u}
                type="button"
                onClick={() => toggleAllowedUse(u)}
                className="font-mono text-[10px] px-2.5 py-1 rounded transition-all"
                style={{
                  background: form.allowedUse.includes(u) ? "var(--amber)" : "var(--bg-elevated)",
                  color: form.allowedUse.includes(u) ? "#000" : "var(--text-dim)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                }}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*,.pdf"
          style={{ display: "none" }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />

        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded font-mono text-sm py-3 transition-all hover:opacity-80"
          style={{
            background: "var(--bg-elevated)",
            color: "var(--text-muted)",
            border: "2px dashed var(--border)",
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        >
          {uploading ? "UPLOADING..." : "⬆ CLICK TO UPLOAD FILE"}
        </button>

        {uploadError && (
          <div className="font-mono text-xs" style={{ color: "var(--red)" }}>⚠ {uploadError}</div>
        )}
      </div>

      {/* Filter row */}
      <div className="flex gap-2 flex-wrap">
        {(["all", ...ASSET_TYPE_OPTIONS] as (AssetType | "all")[]).map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className="font-mono text-[10px] px-3 py-1.5 rounded transition-all"
            style={{
              background: filter === t ? "var(--amber)" : "var(--bg-card)",
              color: filter === t ? "#000" : "var(--text-dim)",
              border: "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            {t.toUpperCase()} {t !== "all" && `(${assets.filter(a => a.assetType === t).length})`}
          </button>
        ))}
      </div>

      {/* Grid */}
      {displayed.length === 0 ? (
        <div className="rounded-lg border p-8 text-center" style={{ background: "var(--bg-card)", borderColor: "var(--border)", borderStyle: "dashed" }}>
          <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
            No {filter === "all" ? "assets" : filter} assets yet.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {displayed.map(a => (
            <AssetCard
              key={a.id}
              asset={a}
              onUpdate={patch => setAssets(prev => prev.map(x => x.id === a.id ? { ...x, ...patch } as ClientAsset : x))}
              onDelete={() => setAssets(prev => prev.filter(x => x.id !== a.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Launch Tab ────────────────────────────────────────────────────────────────

const TIERS = ["auto", "tier1", "tier2", "tier3", "tier4"];

function LaunchTab({ client }: { client: ClientWithAssets }) {
  const router = useRouter();
  const [tier, setTier] = useState("auto");
  const [notes, setNotes] = useState("");
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const approvedAssets = client.assets.filter(a => a.approvalStatus === "approved" && !a.containsMinor);
  const restrictedCount = client.assets.filter(a => a.approvalStatus === "restricted" || a.containsMinor).length;

  async function handleLaunch() {
    if (!client.websiteUrl) {
      setError("Add a website URL to the client details before launching.");
      return;
    }

    setLaunching(true);
    setError("");
    setStatus("Fetching launch params...");

    try {
      // Get enriched launch params from client launch helper
      const paramsRes = await fetch(`/api/clients/${client.id}/launch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tier === "auto" ? undefined : tier, notes }),
      });
      const { launchParams, error: paramError } = await paramsRes.json();
      if (!paramsRes.ok) {
        setError(paramError ?? "Failed to get launch params");
        return;
      }

      setStatus("Starting pipeline...");

      // Connect to /api/launch SSE stream
      const res = await fetch("/api/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(launchParams),
      });

      if (!res.ok || !res.body) {
        setError("Pipeline failed to start");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buildId = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(l => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.buildId && !buildId) {
              buildId = payload.buildId;
            }
            if (payload.action) {
              setStatus(payload.action);
            }
            if (payload.done) {
              router.push(`/activity?buildId=${payload.buildId}`);
              return;
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      if (buildId) {
        router.push(`/activity?buildId=${buildId}`);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLaunching(false);
      setStatus("");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Asset readiness summary */}
      <div className="rounded-lg border p-4 flex flex-col gap-3" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="font-mono text-xs font-bold" style={{ color: "var(--amber)" }}>ASSET READINESS</div>
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: approvedAssets.length > 0 ? "var(--green)" : "var(--text-dim)" }} />
            <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{approvedAssets.length} approved assets in build</span>
          </div>
          {restrictedCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: "var(--red)" }} />
              <span className="font-mono text-xs" style={{ color: "var(--red)" }}>{restrictedCount} restricted — excluded from build</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: client.brandNotes ? "var(--green)" : "var(--text-dim)" }} />
            <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>Brand notes {client.brandNotes ? "ready" : "not set"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: client.websiteUrl ? "var(--green)" : "var(--red)" }} />
            <span className="font-mono text-xs" style={{ color: client.websiteUrl ? "var(--text-muted)" : "var(--red)" }}>
              {client.websiteUrl ? `URL: ${client.websiteUrl.replace(/^https?:\/\//, "")}` : "No website URL — required"}
            </span>
          </div>
        </div>
      </div>

      {/* Launch config */}
      <div className="rounded-lg border p-5 flex flex-col gap-4" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="font-mono text-xs font-bold" style={{ color: "var(--amber)" }}>LAUNCH CONFIG</div>

        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>TIER</label>
          <div className="flex gap-2 flex-wrap">
            {TIERS.map(t => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className="font-mono text-xs px-3 py-1.5 rounded transition-all"
                style={{
                  background: tier === t ? "var(--amber)" : "var(--bg-elevated)",
                  color: tier === t ? "#000" : "var(--text-dim)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                }}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
          {tier === "auto" && (
            <div className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>Audit agent will auto-route based on opportunity + sellability scores.</div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>LAUNCH NOTES (OPTIONAL)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any special instructions for this build run..."
            style={{
              background: "var(--bg-base)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              caretColor: "var(--amber)",
              borderRadius: 6,
              padding: "10px 12px",
              fontFamily: "monospace",
              fontSize: 12,
              outline: "none",
              resize: "vertical",
              minHeight: 80,
            }}
          />
        </div>

        {/* What gets injected */}
        {(client.brandNotes || approvedAssets.length > 0) && (
          <div className="rounded border p-3 flex flex-col gap-1" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
            <div className="font-mono text-[10px] font-bold" style={{ color: "var(--text-dim)" }}>INJECTED INTO CLAUDE PROMPTS:</div>
            {client.brandNotes && (
              <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>• Brand notes: {client.brandNotes.slice(0, 80)}{client.brandNotes.length > 80 ? "..." : ""}</div>
            )}
            {approvedAssets.length > 0 && (
              <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>• {approvedAssets.length} approved asset URLs (logo, products, locations)</div>
            )}
            {restrictedCount > 0 && (
              <div className="font-mono text-[10px]" style={{ color: "var(--red)" }}>• {restrictedCount} restricted assets: EXCLUDED from all prompts</div>
            )}
          </div>
        )}

        {error && (
          <div className="rounded border px-4 py-3 font-mono text-xs" style={{ background: "rgba(231,76,60,0.07)", borderColor: "var(--red)", color: "var(--red)" }}>
            ⚠ {error}
          </div>
        )}

        {status && (
          <div className="font-mono text-xs" style={{ color: "var(--amber)" }}>
            ◉ {status}
          </div>
        )}

        <button
          onClick={handleLaunch}
          disabled={launching || !client.websiteUrl}
          className="w-full rounded font-display text-xl py-4 transition-all hover:opacity-90"
          style={{
            background: launching ? "var(--bg-elevated)" : client.websiteUrl ? "var(--amber)" : "var(--bg-elevated)",
            color: launching || !client.websiteUrl ? "var(--text-dim)" : "#030407",
            border: "none",
            cursor: launching || !client.websiteUrl ? "not-allowed" : "pointer",
            minHeight: 64,
          }}
        >
          {launching ? `◉ ${status || "LAUNCHING..."}` : "⚡ LAUNCH BUILD"}
        </button>

        {!client.websiteUrl && (
          <div className="font-mono text-xs text-center" style={{ color: "var(--text-dim)" }}>
            Add a website URL in the Details tab to enable launch.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Tab = "details" | "assets" | "launch";

export default function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<ClientWithAssets | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("details");

  async function load() {
    const res = await fetch(`/api/clients/${clientId}`);
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = await res.json();
    setClient(data.client);
    setLoading(false);
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="font-mono text-sm" style={{ color: "var(--text-dim)" }}>Loading...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6 flex flex-col gap-4">
        <div className="font-mono text-sm" style={{ color: "var(--red)" }}>Client not found.</div>
        <button onClick={() => router.push("/clients")} className="font-mono text-xs" style={{ color: "var(--amber)" }}>
          ← Back to clients
        </button>
      </div>
    );
  }

  const initials = client.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  return (
    <div className="p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push("/clients")}
          className="font-mono text-xs transition-opacity hover:opacity-70"
          style={{ color: "var(--text-dim)" }}
        >
          ← All clients
        </button>

        <div className="flex items-center gap-4 mt-3">
          {client.logoUrl ? (
            <img
              src={client.logoUrl}
              alt={`${client.name} logo`}
              className="w-12 h-12 rounded object-contain flex-shrink-0"
              style={{ background: "var(--bg-elevated)" }}
            />
          ) : (
            <div
              className="w-12 h-12 rounded flex items-center justify-center font-display text-base font-bold flex-shrink-0"
              style={{
                background: client.primaryColor ? `${client.primaryColor}22` : "var(--bg-elevated)",
                color: client.primaryColor ?? "var(--amber)",
                border: `1px solid ${client.primaryColor ?? "var(--border)"}`,
              }}
            >
              {initials}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="font-display text-3xl leading-tight truncate" style={{ color: "var(--amber)" }}>
              {client.name.toUpperCase()}
            </div>
            <div className="font-mono text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {client.businessType ?? "No type"} · {client.assets.length} assets · Added {new Date(client.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-2 h-2 rounded-full" style={{ background: client.active ? "var(--green)" : "var(--text-dim)" }} />
            <span className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>{client.active ? "ACTIVE" : "INACTIVE"}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
        {(["details", "assets", "launch"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-3 font-mono text-xs transition-all"
            style={{
              background: "transparent",
              color: tab === t ? "var(--amber)" : "var(--text-dim)",
              borderBottom: tab === t ? "2px solid var(--amber)" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            {t.toUpperCase()}
            {t === "assets" && client.assets.length > 0 && (
              <span className="ml-2 font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: "var(--bg-elevated)", color: "var(--text-dim)" }}>
                {client.assets.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "details" && <DetailsTab client={client} onRefresh={load} />}
      {tab === "assets" && <AssetsTab client={client} onRefresh={load} />}
      {tab === "launch" && <LaunchTab client={client} />}
    </div>
  );
}
