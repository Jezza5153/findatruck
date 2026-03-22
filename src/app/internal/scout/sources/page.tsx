'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Source {
  id: string;
  sourceType: string;
  sourceKey: string;
  url: string | null;
  label: string;
  category: string;
  enabled: boolean;
  priority: number;
  pollMode: string;
  lastCheckedAt: string | null;
  createdAt: string;
}

const CATEGORIES = ['seo', 'marketplace', 'ux', 'trust', 'infra', 'security', 'data', 'cro'];
const SOURCE_TYPES = ['repo', 'search', 'org', 'awesome_list', 'changelog'];

export default function ScoutSourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sourceType: 'repo',
    sourceKey: '',
    label: '',
    category: 'marketplace',
    priority: 50,
    pollMode: 'poll',
  });
  const [submitting, setSubmitting] = useState(false);

  async function loadSources() {
    try {
      const res = await fetch('/api/internal/scout/sources');
      if (res.ok) {
        const data = await res.json();
        setSources(data.sources || []);
      }
    } catch (e) {
      console.error('Failed to load sources', e);
    } finally {
      setLoading(false);
    }
  }

  async function createSource() {
    setSubmitting(true);
    try {
      const url = formData.sourceType === 'repo'
        ? `https://github.com/${formData.sourceKey}`
        : null;

      const res = await fetch('/api/internal/scout/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          url,
          label: formData.label || formData.sourceKey,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({ sourceType: 'repo', sourceKey: '', label: '', category: 'marketplace', priority: 50, pollMode: 'poll' });
        loadSources();
      }
    } catch (e) {
      console.error('Failed to create source', e);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleSource(id: string, enabled: boolean) {
    await fetch('/api/internal/scout/sources', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, enabled }),
    });
    loadSources();
  }

  async function deleteSource(id: string) {
    if (!confirm('Delete this source?')) return;
    await fetch(`/api/internal/scout/sources?id=${id}`, { method: 'DELETE' });
    loadSources();
  }

  useEffect(() => { loadSources(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-100">Sources</h1>
          <p className="text-sm text-gray-400">Manage GitHub repos, orgs, and search queries to watch</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          {showForm ? '✕ Cancel' : '+ Add Source'}
        </Button>
      </div>

      {/* Add source form */}
      {showForm && (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-gray-200">New Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
                <select
                  value={formData.sourceType}
                  onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200"
                >
                  {SOURCE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  {formData.sourceType === 'repo' ? 'Owner/Repo' : formData.sourceType === 'search' ? 'Search Query' : 'Key'}
                </label>
                <input
                  type="text"
                  value={formData.sourceKey}
                  onChange={(e) => setFormData({ ...formData, sourceKey: e.target.value })}
                  placeholder={formData.sourceType === 'repo' ? 'vercel/next.js' : 'nextjs marketplace'}
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Label</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Optional display name"
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Priority ({formData.priority})</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={createSource}
                  disabled={!formData.sourceKey || submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  {submitting ? 'Adding...' : 'Add Source'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sources table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading sources...</div>
      ) : sources.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">🔍</p>
          <p className="text-gray-400 text-lg">No sources yet</p>
          <p className="text-gray-500 text-sm mt-1">Add repos and search queries to start watching GitHub</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Last Checked</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sources.map((source) => (
                <tr key={source.id} className={`hover:bg-gray-800/30 transition-colors ${!source.enabled ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-200">{source.label || source.sourceKey}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{source.sourceKey}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">{source.sourceType}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <CategoryBadge category={source.category} />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-gray-800 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${source.priority}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{source.priority}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500">
                    {source.lastCheckedAt ? new Date(source.lastCheckedAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleSource(source.id, !source.enabled)}
                        className={`rounded px-2 py-1 text-xs transition-colors ${source.enabled ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}
                      >
                        {source.enabled ? 'ON' : 'OFF'}
                      </button>
                      <button
                        onClick={() => deleteSource(source.id)}
                        className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    seo: 'bg-blue-500/20 text-blue-400',
    marketplace: 'bg-emerald-500/20 text-emerald-400',
    ux: 'bg-purple-500/20 text-purple-400',
    trust: 'bg-amber-500/20 text-amber-400',
    infra: 'bg-cyan-500/20 text-cyan-400',
    security: 'bg-red-500/20 text-red-400',
    data: 'bg-indigo-500/20 text-indigo-400',
    cro: 'bg-pink-500/20 text-pink-400',
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[category] || 'bg-gray-800 text-gray-400'}`}>
      {category}
    </span>
  );
}
