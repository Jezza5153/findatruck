'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Stats {
  totalSources: number;
  enabledSources: number;
  totalDiscoveries: number;
  newDiscoveries: number;
  recentJobs: {
    id: string;
    jobType: string;
    status: string;
    createdAt: string;
  }[];
}

export default function ScoutOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadStats() {
    try {
      const res = await fetch('/api/internal/scout/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      // Stats endpoint may not exist yet — show empty state
      setStats({
        totalSources: 0,
        enabledSources: 0,
        totalDiscoveries: 0,
        newDiscoveries: 0,
        recentJobs: [],
      });
    }
  }

  async function triggerScan(mode: 'priority' | 'all') {
    setScanning(true);
    setScanResult(null);
    setError(null);
    try {
      const res = await fetch(`/api/internal/scout/scan?mode=${mode}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setScanResult(data);
        loadStats();
      } else {
        setError(data.error || 'Scan failed');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setScanning(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Scout Overview
          </h1>
          <p className="mt-1 text-gray-400">
            GitHub research engine for FoodTruckNext2Me
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => triggerScan('priority')}
            disabled={scanning}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {scanning ? '⏳ Scanning...' : '⚡ Priority Scan'}
          </Button>
          <Button
            onClick={() => triggerScan('all')}
            disabled={scanning}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            🔄 Full Scan
          </Button>
        </div>
      </div>

      {/* Scan result banner */}
      {scanResult && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
          <p className="font-medium text-emerald-400">✅ Scan completed</p>
          <p className="mt-1 text-sm text-gray-400">
            Repos: {scanResult.repoResults} | Releases: {scanResult.releaseResults} | Searches: {scanResult.searchResults}
            {scanResult.errors?.length > 0 && (
              <span className="text-amber-400"> | {scanResult.errors.length} error(s)</span>
            )}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-red-400">❌ {error}</p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="🔍"
          label="Total Sources"
          value={stats?.totalSources ?? '—'}
          sub={`${stats?.enabledSources ?? 0} enabled`}
          gradient="from-blue-500 to-indigo-500"
        />
        <StatCard
          icon="💎"
          label="Discoveries"
          value={stats?.totalDiscoveries ?? '—'}
          sub={`${stats?.newDiscoveries ?? 0} new`}
          gradient="from-emerald-500 to-teal-500"
        />
        <StatCard
          icon="🧩"
          label="Patterns"
          value="—"
          sub="Phase 2"
          gradient="from-amber-500 to-orange-500"
        />
        <StatCard
          icon="🎯"
          label="Adopt Now"
          value="—"
          sub="Phase 2"
          gradient="from-rose-500 to-pink-500"
        />
      </div>

      {/* Recent jobs */}
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-200">Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentJobs && stats.recentJobs.length > 0 ? (
            <div className="space-y-2">
              {stats.recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-md bg-gray-800/50 px-3 py-2 text-sm"
                >
                  <span className="text-gray-300">{job.jobType}</span>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={job.status} />
                    <span className="text-xs text-gray-500">
                      {new Date(job.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-4 text-center">
              No jobs yet. Run a scan to get started.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick start */}
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-200">🚀 Quick Start</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-400 space-y-2">
          <p>1. Go to <a href="/internal/scout/sources" className="text-emerald-400 underline">Sources</a> and add repos/search queries to watch</p>
          <p>2. Run a <strong className="text-gray-300">Priority Scan</strong> to fetch data from GitHub</p>
          <p>3. Check <a href="/internal/scout/discoveries" className="text-emerald-400 underline">Discoveries</a> to see what was found</p>
          <p>4. Cron jobs will automatically scan every 2 hours</p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  gradient,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  gradient: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 p-5 transition-all hover:border-gray-700">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity`} />
      <div className="relative">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span className="text-lg">{icon}</span>
          {label}
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-100">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    queued: 'bg-gray-700 text-gray-300',
    running: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-emerald-500/20 text-emerald-400',
    failed: 'bg-red-500/20 text-red-400',
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-700 text-gray-400'}`}>
      {status}
    </span>
  );
}
