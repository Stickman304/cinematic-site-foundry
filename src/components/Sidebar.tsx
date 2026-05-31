"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "MISSION CONTROL", icon: "◈" },
  { href: "/pipeline", label: "PIPELINE", icon: "▶" },
  { href: "/activity", label: "LIVE ACTIVITY", icon: "🟢" },
  { href: "/command", label: "COMMAND", icon: "⌘" },
  { href: "/work", label: "WORK", icon: "◻" },
  { href: "/costs", label: "COSTS", icon: "◇" },
  { href: "/preview", label: "PREVIEW", icon: "⊡" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      className="w-48 shrink-0 flex flex-col border-r"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
    >
      <div className="flex flex-col gap-1 p-3 mt-2">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded transition-all"
              style={{
                background: active ? "var(--amber-glow)" : "transparent",
                color: active ? "var(--amber)" : "var(--text-muted)",
                borderLeft: active ? `2px solid var(--amber)` : "2px solid transparent",
              }}
            >
              <span className="text-sm">{item.icon}</span>
              <span className="font-display text-sm tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom — status */}
      <div className="mt-auto p-4 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="pulse-dot-green w-1.5 h-1.5 rounded-full" style={{ background: "var(--green)" }} />
          <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>SYSTEMS ONLINE</span>
        </div>
        <div className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
          Orchestrator v2.0.1
        </div>
      </div>
    </nav>
  );
}
