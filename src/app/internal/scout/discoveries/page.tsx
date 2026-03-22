'use client';

import React, { useEffect, useState } from 'react';

interface Discovery {
  id: string;
  discoveryType: string;
  repoFullName: string | null;
  title: string;
  url: string;
  stars: number | null;
  forks: number | null;
  language: string | null;
  licenseSpdx: string | null;
  status: string;
  pushedAt: string | null;
  releasedAt: string | null;
  createdAt: string;
  source?: {
    label: string;
    category: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  processed: 'bg-emerald-500/20 text-emerald-400',
  shortlisted: 'bg-amber-500/20 text-amber-400',
  ignored: 'bg-gray-700 text-gray-500',
  rejected: 'bg-red-500/20 text-red-400',
};

export default function ScoutDiscoveriesPage() {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  async function loadDiscoveries() {
    try {
      const res = await fetch('/api/internal/scout/discoveries');
      if (res.ok) {
        const data = await res.json();
        setDiscoveries(data.discoveries || []);
      }
    } catch (e) {
      console.error('Failed to load discoveries', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDiscoveries(); }, []);

  const filtered = filter === 'all' ? discoveries : discoveries.filter((d) => d.status === filter);

  const statusCounts = discoveries.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-100">Discoveries</h1>
        <p className="text-sm text-gray-400">Raw findings from GitHub scans</p>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        <FilterPill
          label={`All (${discoveries.length})`}
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        {Object.entries(statusCounts).map(([status, count]) => (
          <FilterPill
            key={status}
            label={`${status} (${count})`}
            active={filter === status}
            onClick={() => setFilter(status)}
          />
        ))}
      </div>

      {/* Discoveries list */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading discoveries...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">💎</p>
          <p className="text-gray-400 text-lg">No discoveries yet</p>
          <p className="text-gray-500 text-sm mt-1">Run a scan from the overview page to start finding repos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((discovery) => (
            <div
              key={discovery.id}
              className="group rounded-lg border border-gray-800 bg-gray-900/50 p-4 hover:border-gray-700 transition-all"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <TypeIcon type={discovery.discoveryType} />
                    <a
                      href={discovery.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-gray-200 hover:text-emerald-400 transition-colors truncate"
                    >
                      {discovery.repoFullName || discovery.title}
                    </a>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[discovery.status] || 'bg-gray-700 text-gray-400'}`}>
                      {discovery.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-400 line-clamp-2">{discovery.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    {discovery.stars !== null && (
                      <span className="flex items-center gap-1">⭐ {discovery.stars.toLocaleString()}</span>
                    )}
                    {discovery.forks !== null && (
                      <span className="flex items-center gap-1">🍴 {discovery.forks.toLocaleString()}</span>
                    )}
                    {discovery.language && (
                      <span className="flex items-center gap-1">💻 {discovery.language}</span>
                    )}
                    {discovery.licenseSpdx && (
                      <span className="flex items-center gap-1">📄 {discovery.licenseSpdx}</span>
                    )}
                    {discovery.pushedAt && (
                      <span>Pushed {new Date(discovery.pushedAt).toLocaleDateString()}</span>
                    )}
                    {discovery.releasedAt && (
                      <span>Released {new Date(discovery.releasedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={discovery.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    View on GitHub →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );
}

function TypeIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    repo: '📦',
    release: '🏷️',
    issue: '🐛',
    discussion: '💬',
    code_result: '🔎',
    commit_cluster: '📝',
  };

  return <span className="text-base">{icons[type] || '📄'}</span>;
}
