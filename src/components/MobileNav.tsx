"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/activity", label: "Live", icon: "🟢" },
  { href: "/pipeline", label: "Pipeline", icon: "▶" },
  { href: "/command", label: "Command", icon: "⌘" },
  { href: "/work", label: "Work", icon: "◻" },
  { href: "/outreach", label: "Outreach", icon: "◎" },
  { href: "/costs", label: "Costs", icon: "◇" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 flex border-t z-50"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-all"
            style={{
              color: active ? "var(--amber)" : "var(--text-dim)",
              minHeight: 56,
              borderTop: active ? "2px solid var(--amber)" : "2px solid transparent",
            }}
          >
            <span style={{ fontSize: 14 }}>{tab.icon}</span>
            <span className="font-mono" style={{ fontSize: 8, letterSpacing: "0.05em" }}>
              {tab.label.toUpperCase()}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
