'use client';

import { useState, useMemo } from 'react';
import type { NicheDTO } from '@/lib/api/schema';
import StatusBadge from '@/components/shared/StatusBadge';

interface NicheSelectorProps {
  niches: NicheDTO[];
  selectedId: string | null;
  onSelect: (niche: NicheDTO) => void;
}

const COMPETITION_COLORS: Record<string, string> = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
};

export default function NicheSelector({
  niches,
  selectedId,
  onSelect,
}: NicheSelectorProps): JSX.Element {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return niches.filter((n) => {
      const matchesSearch = n.name.toLowerCase().includes(term);
      const matchesFilter = filter === 'all' || n.competitionLevel === filter;
      return matchesSearch && matchesFilter;
    });
  }, [niches, search, filter]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Select Your Niche</h2>
        <p className="text-sm text-gray-400 mt-1">
          Choose the niche that best fits your business. This shapes your app&apos;s features and content strategy.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search niches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-nexus-500 focus:border-nexus-500"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'low', 'medium', 'high'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                filter === level
                  ? 'bg-nexus-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {level === 'all' ? 'All' : `${level.charAt(0).toUpperCase() + level.slice(1)} comp.`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((niche) => {
          const isSelected = selectedId === niche.id;
          return (
            <button
              key={niche.id}
              onClick={() => onSelect(niche)}
              className={`text-left p-4 rounded-lg border transition-all ${
                isSelected
                  ? 'border-nexus-500 bg-nexus-500/10 ring-1 ring-nexus-500/50'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-800/80'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-white">{niche.name}</span>
                {isSelected && (
                  <svg className="h-5 w-5 text-nexus-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Trend</span>
                    <span className="text-xs text-gray-400">{niche.trendScore}</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        niche.trendScore >= 75
                          ? 'bg-green-500'
                          : niche.trendScore >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${niche.trendScore}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium ${COMPETITION_COLORS[niche.competitionLevel]}`}>
                    {niche.competitionLevel}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No niches match your search.</p>
        </div>
      )}
    </div>
  );
}
