import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OpenClaw Scout',
  robots: { index: false, follow: false },
};

const navItems = [
  { href: '/internal/scout', label: 'Overview', icon: '📊' },
  { href: '/internal/scout/sources', label: 'Sources', icon: '🔍' },
  { href: '/internal/scout/discoveries', label: 'Discoveries', icon: '💎' },
  { href: '/internal/scout/patterns', label: 'Patterns', icon: '🧩' },
  { href: '/internal/scout/candidates', label: 'Candidates', icon: '🎯' },
  { href: '/internal/scout/reports', label: 'Reports', icon: '📋' },
  { href: '/internal/scout/build-runs', label: 'Build Runs', icon: '🔨' },
];

export default function ScoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
        <div className="flex h-14 items-center px-4 lg:px-6">
          <Link
            href="/internal/scout"
            className="flex items-center gap-2 font-display text-lg font-bold tracking-tight"
          >
            <span className="text-2xl">🐾</span>
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              OpenClaw Scout
            </span>
          </Link>
          <span className="ml-3 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
            Internal
          </span>
          <div className="ml-auto">
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              ← Back to app
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-56 flex-col border-r border-gray-800 bg-gray-950 sticky top-14 h-[calc(100vh-3.5rem)]">
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800/50 hover:text-gray-100 transition-colors"
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-800 p-4">
            <div className="rounded-lg bg-gray-900 p-3">
              <p className="text-xs text-gray-500">Phase 1 — Research Engine</p>
              <p className="mt-1 text-xs text-gray-400">Source tracking + discovery ingestion active</p>
            </div>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-800 bg-gray-950/95 backdrop-blur-xl">
          <nav className="flex overflow-x-auto px-2 py-2 gap-1">
            {navItems.slice(0, 5).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs text-gray-400 hover:text-gray-100 min-w-[60px]"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-3.5rem)] pb-20 md:pb-0">
          <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
