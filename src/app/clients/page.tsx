"use client";
import { useState } from "react";
import { CLIENTS } from "@/lib/data";

export default function Clients() {
  const [selected, setSelected] = useState(CLIENTS[0] ?? null);
  const [newRequest, setNewRequest] = useState("");
  const [requests, setRequests] = useState(selected?.requestHistory ?? []);

  function submitRequest() {
    if (!newRequest.trim() || !selected) return;
    const entry = {
      date: new Date().toLocaleDateString(),
      request: newRequest.trim(),
      status: "pending" as const,
    };
    setRequests((prev) => [entry, ...prev]);
    setNewRequest("");
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div>
        <div className="font-display text-3xl" style={{ color: "var(--amber)" }}>CLIENT PORTAL TRACKER</div>
        <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {CLIENTS.length} CLIENT{CLIENTS.length !== 1 ? "S" : ""} — INTAKE + REQUESTS
        </div>
      </div>

      {/* Client intake cards */}
      <div>
        <div className="font-display text-lg mb-3" style={{ color: "var(--amber)" }}>CLIENT ACCOUNTS</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {CLIENTS.map((client) => (
            <button
              key={client.id}
              onClick={() => { setSelected(client); setRequests(client.requestHistory); }}
              className="rounded-lg border p-5 text-left flex flex-col gap-3 transition-all hover:opacity-90"
              style={{
                background: selected?.id === client.id ? "var(--amber-glow)" : "var(--bg-card)",
                borderColor: selected?.id === client.id ? "var(--amber)" : "var(--border)",
                boxShadow: selected?.id === client.id ? "0 0 20px rgba(200,151,58,0.12)" : "none",
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-base" style={{ color: "var(--text-primary)" }}>
                    {client.name}
                  </div>
                  <div className="font-mono text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {client.businessType}
                  </div>
                </div>
                {client.pendingRequests > 0 && (
                  <span
                    className="font-mono text-xs px-2 py-0.5 rounded font-bold"
                    style={{ background: "var(--amber)", color: "#000" }}
                  >
                    {client.pendingRequests} PENDING
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: client.retainerActive ? "var(--green)" : "var(--text-dim)" }}
                />
                <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  {client.retainerActive
                    ? `RETAINER — $${client.monthlyRetainerAmount}/mo`
                    : "NO RETAINER"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs" style={{ color: "var(--amber)" }}>{client.liveUrl}</span>
                <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>↗</span>
              </div>

              <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
                Last: {client.lastUpdated}
              </div>
            </button>
          ))}

          {/* Add client placeholder */}
          <div
            className="rounded-lg border p-5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:opacity-70"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)", borderStyle: "dashed", minHeight: 160 }}
          >
            <div className="font-display text-3xl" style={{ color: "var(--text-dim)" }}>+</div>
            <div className="font-display text-sm" style={{ color: "var(--text-muted)" }}>ADD CLIENT</div>
            <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>New intake form</div>
          </div>
        </div>
      </div>

      {/* Selected client detail */}
      {selected && (
        <div className="rounded-lg border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div
            className="px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: "var(--border)" }}
          >
            <div>
              <div className="font-display text-xl" style={{ color: "var(--amber)" }}>
                {selected.name.toUpperCase()}
              </div>
              <div className="font-mono text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {selected.liveUrl} · {selected.businessType}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>NEXT BILLING</div>
                <div className="font-mono text-sm" style={{ color: "var(--text-primary)" }}>
                  {selected.nextBillingDate}
                </div>
              </div>
              <span
                className="font-mono text-xs px-3 py-1.5 rounded"
                style={{
                  background: selected.retainerActive ? "rgba(46,204,113,0.1)" : "var(--bg-elevated)",
                  color: selected.retainerActive ? "var(--green)" : "var(--text-dim)",
                  border: `1px solid ${selected.retainerActive ? "rgba(46,204,113,0.3)" : "var(--border)"}`,
                }}
              >
                {selected.retainerActive ? "RETAINER ACTIVE" : "NO RETAINER"}
              </span>
            </div>
          </div>

          {/* New request input */}
          <div className="px-5 py-4 border-b flex gap-3" style={{ borderColor: "var(--border)" }}>
            <input
              type="text"
              value={newRequest}
              onChange={(e) => setNewRequest(e.target.value)}
              placeholder="Add a client request or change order..."
              className="flex-1 px-4 py-2.5 rounded font-mono text-sm outline-none"
              style={{
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                caretColor: "var(--amber)",
              }}
              onKeyDown={(e) => e.key === "Enter" && submitRequest()}
            />
            <button
              onClick={submitRequest}
              className="px-5 py-2.5 rounded font-mono text-xs transition-all hover:opacity-80"
              style={{ background: "var(--amber)", color: "#000" }}
            >
              LOG REQUEST
            </button>
          </div>

          {/* Request history */}
          {requests.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
                No requests logged yet — build in progress
              </div>
            </div>
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
              {requests.map((r, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="font-mono text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                      {r.request}
                    </div>
                    <div className="font-mono text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                      {r.date}
                    </div>
                  </div>
                  <span
                    className="font-mono text-xs px-2 py-0.5 rounded shrink-0"
                    style={{
                      background: r.status === "done" ? "rgba(46,204,113,0.1)" : "rgba(200,151,58,0.1)",
                      color: r.status === "done" ? "var(--green)" : "var(--amber)",
                    }}
                  >
                    {r.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
