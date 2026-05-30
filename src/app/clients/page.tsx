"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Client } from "@/types/models";

const APPROVAL_COLOR: Record<string, string> = {
  approved: "var(--green)",
  pending: "var(--amber)",
  needs_permission: "#f59e0b",
  restricted: "var(--red)",
};

export default function Clients() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clients")
      .then(r => r.json())
      .then(d => setClients(d.clients ?? []))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="font-display text-3xl" style={{ color: "var(--amber)" }}>CLIENT ROSTER</div>
          <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {loading ? "Loading..." : `${clients.length} CLIENT${clients.length !== 1 ? "S" : ""} — INTAKE + ASSETS + LAUNCH`}
          </div>
        </div>
        <button
          onClick={() => router.push("/clients/new")}
          className="font-mono text-sm px-5 py-2.5 rounded transition-all hover:opacity-80"
          style={{ background: "var(--amber)", color: "#000", border: "none", cursor: "pointer" }}
        >
          + NEW CLIENT
        </button>
      </div>

      {loading ? (
        <div className="rounded-lg border p-10 text-center" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="font-mono text-sm" style={{ color: "var(--text-dim)" }}>Loading clients...</div>
        </div>
      ) : clients.length === 0 ? (
        <div className="rounded-lg border px-5 py-12 flex flex-col items-center gap-4 text-center" style={{ background: "var(--bg-card)", borderColor: "var(--border)", borderStyle: "dashed" }}>
          <div className="font-display text-4xl" style={{ color: "var(--text-dim)" }}>📋</div>
          <div className="font-display text-2xl" style={{ color: "var(--text-muted)" }}>NO CLIENTS YET</div>
          <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>Create your first client to start managing intake, assets, and builds.</div>
          <button
            onClick={() => router.push("/clients/new")}
            className="font-mono text-sm px-5 py-2.5 rounded transition-all hover:opacity-80"
            style={{ background: "var(--amber)", color: "#000", border: "none", cursor: "pointer" }}
          >
            + ADD FIRST CLIENT
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map(client => (
            <ClientCard key={client.id} client={client} onClick={() => router.push(`/clients/${client.id}`)} />
          ))}

          <button
            onClick={() => router.push("/clients/new")}
            className="rounded-lg border p-5 flex flex-col items-center justify-center gap-3 transition-all hover:opacity-70"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)", borderStyle: "dashed", minHeight: 160, cursor: "pointer" }}
          >
            <div className="font-display text-3xl" style={{ color: "var(--text-dim)" }}>+</div>
            <div className="font-display text-sm" style={{ color: "var(--text-muted)" }}>ADD CLIENT</div>
          </button>
        </div>
      )}
    </div>
  );
}

function ClientCard({ client, onClick }: { client: Client; onClick: () => void }) {
  const initials = client.name
    .split(" ")
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();

  return (
    <button
      onClick={onClick}
      className="rounded-lg border p-5 text-left flex flex-col gap-3 transition-all hover:opacity-90"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)", cursor: "pointer" }}
    >
      <div className="flex items-start gap-3">
        {client.logoUrl ? (
          <img
            src={client.logoUrl}
            alt={`${client.name} logo`}
            className="w-10 h-10 rounded object-contain"
            style={{ background: "var(--bg-elevated)", flexShrink: 0 }}
          />
        ) : (
          <div
            className="w-10 h-10 rounded flex items-center justify-center font-display text-sm font-bold flex-shrink-0"
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
          <div className="font-display text-base leading-tight truncate" style={{ color: "var(--text-primary)" }}>
            {client.name}
          </div>
          {client.businessType && (
            <div className="font-mono text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
              {client.businessType}
            </div>
          )}
        </div>

        <div
          className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
          style={{ background: client.active ? "var(--green)" : "var(--text-dim)" }}
        />
      </div>

      {client.websiteUrl && (
        <div className="font-mono text-xs truncate" style={{ color: "var(--amber)", opacity: 0.8 }}>
          {client.websiteUrl.replace(/^https?:\/\//, "")}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {client.primaryColor && (
          <div
            className="w-4 h-4 rounded-full border"
            style={{ background: client.primaryColor, borderColor: "var(--border)" }}
            title={`Primary: ${client.primaryColor}`}
          />
        )}
        {client.secondaryColor && (
          <div
            className="w-4 h-4 rounded-full border"
            style={{ background: client.secondaryColor, borderColor: "var(--border)" }}
            title={`Secondary: ${client.secondaryColor}`}
          />
        )}
        {client.brandNotes && (
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--bg-elevated)", color: "var(--text-dim)" }}>
            BRAND NOTES
          </span>
        )}
      </div>

      <div className="font-mono text-[10px]" style={{ color: "var(--text-dim)" }}>
        Added {new Date(client.createdAt).toLocaleDateString()}
      </div>
    </button>
  );
}

export { APPROVAL_COLOR };
