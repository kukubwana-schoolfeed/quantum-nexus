'use client';

/**
 * Monetisation — YouTube monetisation and brand deals
 * Module: ugcMonetisationIntelligence
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import ProgressBar from '@/components/shared/ProgressBar';

interface Opportunity {
  id: string;
  brand?: string;
}

interface BrandDeal {
  id: string;
}

interface SuggestedRates {
  suggestedRate: number;
  maxRate: number;
  minRate: number;
}

interface MonetisationData {
  opportunities: Opportunity[];
  brandDeals: BrandDeal[];
  suggestedRates: SuggestedRates;
}

export default function Page(): JSX.Element {
  const { data, loading, error, refetch } = useApi<MonetisationData>('/api/ugc/monetisation');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">UGC Monetisation</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
        <SkeletonPanel />
        <SkeletonPanel />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">UGC Monetisation</h1>
          <p className="text-sm text-gray-400 mt-1">
            Brand deals, rate suggestions, and monetisation opportunities
          </p>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const opportunities = data?.opportunities ?? [];
  const brandDeals = data?.brandDeals ?? [];
  const suggestedRates = data?.suggestedRates ?? { suggestedRate: 0, maxRate: 0, minRate: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">UGC Monetisation</h1>
        <p className="text-sm text-gray-400 mt-1">
          Brand deals, rate suggestions, and monetisation opportunities
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Opportunities"
          value={opportunities.length}
          icon="OP"
          sublabel="available deals"
        />
        <StatCard
          label="Brand Deals"
          value={brandDeals.length}
          icon="BD"
          sublabel="active deals"
        />
        <StatCard
          label="Suggested Rate"
          value={`K${suggestedRates.suggestedRate.toLocaleString()}`}
          icon="SR"
          trend="up"
          trendValue="+10%"
          sublabel="per piece"
        />
        <StatCard
          label="Max Rate"
          value={`K${suggestedRates.maxRate.toLocaleString()}`}
          icon="MR"
          sublabel="premium range"
        />
      </div>

      {/* Rate Range */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
          Suggested Rate Range
        </h2>
        <div className="space-y-3">
          <ProgressBar
            value={suggestedRates.minRate}
            max={suggestedRates.maxRate}
            label={`Min Rate: K${suggestedRates.minRate.toLocaleString()}`}
            showPercent={false}
            colorClass="bg-red-500"
          />
          <ProgressBar
            value={suggestedRates.suggestedRate}
            max={suggestedRates.maxRate}
            label={`Suggested: K${suggestedRates.suggestedRate.toLocaleString()}`}
            showPercent={false}
            colorClass="bg-yellow-500"
          />
          <ProgressBar
            value={suggestedRates.maxRate}
            max={suggestedRates.maxRate}
            label={`Max Rate: K${suggestedRates.maxRate.toLocaleString()}`}
            showPercent={false}
            colorClass="bg-green-500"
          />
        </div>
      </div>

      {/* Opportunities */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Monetisation Opportunities</h2>
        {opportunities.length === 0 ? (
          <EmptyState
            title="No monetisation opportunities"
            description="Brand deals and sponsorship opportunities will appear here as your content gains traction and audience."
          />
        ) : (
          <div className="space-y-3">
            {opportunities.map((o, i) => (
              <div
                key={String(o.id ?? i)}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <span className="text-white">{String(o.brand ?? o.id)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Scan for Opportunities
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
        >
          View Brand Deals
        </button>
      </div>
    </div>
  );
}
