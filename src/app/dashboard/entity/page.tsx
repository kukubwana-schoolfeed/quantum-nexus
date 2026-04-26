'use client';

/**
 * Entity Builder — Online entity consistency builder
 * Module: entityBuilder
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';
import ProgressBar from '@/components/shared/ProgressBar';

export default function Page(): JSX.Element {
  const { data, loading, error, refetch } = useApi<{ listings: Record<string, unknown>[]; consistency: Record<string, unknown> }>('/api/entity');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Entity Builder</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
        <SkeletonTable />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Entity Builder</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Entity Builder</h1>
          <p className="text-sm text-gray-400 mt-1">
            Directory listings and NAP consistency management
          </p>
        </div>
        <EmptyState title="No entity data found" description="Submit your business to directories to get started." />
      </div>
    );
  }

  const listings = data.listings;
  const consistency = data.consistency as { consistent: number; inconsistent: number; pending: number };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Entity Builder</h1>
        <p className="text-sm text-gray-400 mt-1">
          Directory listings and NAP consistency management
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Listings"
          value={listings.length}
          icon="TL"
          sublabel="directories"
        />
        <StatCard
          label="Consistent"
          value={consistency.consistent}
          icon="OK"
          trend="up"
          trendValue={`${consistency.consistent}/${listings.length}`}
        />
        <StatCard
          label="Inconsistent"
          value={consistency.inconsistent}
          icon="IC"
          sublabel="needs fixing"
        />
        <StatCard
          label="Pending"
          value={consistency.pending}
          icon="PD"
          sublabel="not yet verified"
        />
      </div>

      {/* NAP Consistency */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
          NAP Consistency Score
        </h2>
        <ProgressBar
          value={consistency.consistent}
          max={listings.length}
          label="Consistent listings"
          showPercent
        />
      </div>

      {/* Listings Table */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Directory Listings</h2>
        {listings.length === 0 ? (
          <EmptyState title="No directory listings" description="Submit your business to directories to get started." />
        ) : (
          <DataTable
            columns={[
              { header: 'Directory', key: 'directoryName' },
              {
                header: 'Status',
                key: 'status',
                render: (value) => <StatusBadge status={String(value)} />,
              },
              {
                header: 'Consistent',
                key: 'isConsistent',
                render: (value) => {
                  if (value === null || value === undefined)
                    return <span className="text-gray-500">Unverified</span>;
                  return value ? (
                    <span className="text-green-400">Yes</span>
                  ) : (
                    <span className="text-red-400">No</span>
                  );
                },
              },
            ]}
            data={listings.map((l) => ({
              id: l.id,
              directoryName: l.directoryName,
              status: l.status,
              isConsistent: l.isConsistent,
            }))}
            emptyMessage="No directory listings yet. Submit your business to directories."
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Submit Listing
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
        >
          Check Consistency
        </button>
      </div>
    </div>
  );
}
