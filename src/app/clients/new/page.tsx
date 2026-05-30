"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const BUSINESS_TYPES = [
  "Retail", "Restaurant / Food & Beverage", "Professional Services",
  "Healthcare", "Construction / Trades", "Real Estate", "Fitness / Wellness",
  "Beauty / Salon", "Automotive", "Legal", "Financial Services", "Other",
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-xs font-bold" style={{ color: "var(--text-dim)" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--bg-base)",
  color: "var(--text-primary)",
  border: "1px solid var(--border)",
  caretColor: "var(--amber)",
  borderRadius: 6,
  padding: "10px 12px",
  fontFamily: "monospace",
  fontSize: 13,
  outline: "none",
  width: "100%",
};

export default function NewClientPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    businessType: "",
    websiteUrl: "",
    brandNotes: "",
    primaryColor: "#4f8fff",
    secondaryColor: "",
    fontPreference: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    notes: "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Client name is required.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
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

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create client.");
        return;
      }

      router.push(`/clients/${data.client.id}`);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-3xl mx-auto w-full">
      <div>
        <button
          onClick={() => router.push("/clients")}
          className="font-mono text-xs transition-opacity hover:opacity-70"
          style={{ color: "var(--text-dim)" }}
        >
          ← Back to clients
        </button>
        <div className="font-display text-3xl mt-3" style={{ color: "var(--amber)" }}>NEW CLIENT INTAKE</div>
        <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          Add a client. Upload assets and launch builds from their profile.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Core identity */}
        <div className="rounded-lg border p-5 flex flex-col gap-4" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="font-mono text-xs font-bold" style={{ color: "var(--amber)" }}>CLIENT IDENTITY</div>

          <Field label="BUSINESS NAME *">
            <input
              style={inputStyle}
              value={form.name}
              onChange={e => set("name", e.target.value)}
              placeholder="Teffy's Scented Serenity Shop"
              required
            />
          </Field>

          <Field label="BUSINESS TYPE">
            <select
              style={{ ...inputStyle, background: "var(--bg-base)" }}
              value={form.businessType}
              onChange={e => set("businessType", e.target.value)}
            >
              <option value="">Select type...</option>
              {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="WEBSITE URL">
            <input
              style={inputStyle}
              type="url"
              value={form.websiteUrl}
              onChange={e => set("websiteUrl", e.target.value)}
              placeholder="https://example.com"
            />
          </Field>
        </div>

        {/* Brand */}
        <div className="rounded-lg border p-5 flex flex-col gap-4" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="font-mono text-xs font-bold" style={{ color: "var(--amber)" }}>BRAND CONTEXT</div>

          <Field label="BRAND NOTES">
            <textarea
              style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
              value={form.brandNotes}
              onChange={e => set("brandNotes", e.target.value)}
              placeholder="Describe the brand personality, target audience, tone, visual priorities. Injected directly into Claude's audit and direction prompts."
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="PRIMARY COLOR">
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={e => set("primaryColor", e.target.value)}
                  className="rounded cursor-pointer"
                  style={{ width: 40, height: 36, border: "1px solid var(--border)", background: "none", padding: 2 }}
                />
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={form.primaryColor}
                  onChange={e => set("primaryColor", e.target.value)}
                  placeholder="#4f8fff"
                />
              </div>
            </Field>

            <Field label="SECONDARY COLOR">
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={form.secondaryColor || "#ffffff"}
                  onChange={e => set("secondaryColor", e.target.value)}
                  className="rounded cursor-pointer"
                  style={{ width: 40, height: 36, border: "1px solid var(--border)", background: "none", padding: 2 }}
                />
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={form.secondaryColor}
                  onChange={e => set("secondaryColor", e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </Field>
          </div>

          <Field label="FONT PREFERENCE">
            <input
              style={inputStyle}
              value={form.fontPreference}
              onChange={e => set("fontPreference", e.target.value)}
              placeholder="e.g. Montserrat, Playfair Display, or inherit existing"
            />
          </Field>
        </div>

        {/* Contact */}
        <div className="rounded-lg border p-5 flex flex-col gap-4" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="font-mono text-xs font-bold" style={{ color: "var(--amber)" }}>CONTACT (OPTIONAL)</div>

          <Field label="CONTACT NAME">
            <input style={inputStyle} value={form.contactName} onChange={e => set("contactName", e.target.value)} placeholder="Jane Smith" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="EMAIL">
              <input style={inputStyle} type="email" value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} placeholder="jane@example.com" />
            </Field>
            <Field label="PHONE">
              <input style={inputStyle} type="tel" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} placeholder="(216) 555-0100" />
            </Field>
          </div>
        </div>

        {/* Internal notes */}
        <div className="rounded-lg border p-5 flex flex-col gap-4" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="font-mono text-xs font-bold" style={{ color: "var(--amber)" }}>INTERNAL NOTES</div>
          <Field label="NOTES">
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              placeholder="Anything else — source of lead, deal stage, special constraints..."
            />
          </Field>
        </div>

        {error && (
          <div className="rounded border px-4 py-3 font-mono text-xs" style={{ background: "rgba(231,76,60,0.07)", borderColor: "var(--red)", color: "var(--red)" }}>
            ⚠ {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/clients")}
            className="flex-1 rounded font-mono text-sm py-3 transition-all hover:opacity-80"
            style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)", cursor: "pointer" }}
          >
            CANCEL
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded font-display text-lg py-3 transition-all hover:opacity-90"
            style={{ background: "var(--amber)", color: "#030407", border: "none", cursor: saving ? "not-allowed" : "pointer" }}
          >
            {saving ? "CREATING..." : "CREATE CLIENT →"}
          </button>
        </div>
      </form>
    </div>
  );
}
