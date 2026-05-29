import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { CommandBar } from "@/components/CommandBar";
import { MobileNav } from "@/components/MobileNav";
import { SwRegister } from "@/components/SwRegister";

export const metadata: Metadata = {
  title: "Stick Man Cinematic Agency — Mission Control",
  description: "Autonomous AI creative agency dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#c8973a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="h-full flex flex-col" style={{ background: "var(--bg-base)" }}>
        <SwRegister />
        <TopBar />
        <CommandBar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto grid-bg pb-16 md:pb-0">
            {children}
          </main>
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
