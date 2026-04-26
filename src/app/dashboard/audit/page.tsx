'use client';

/**
 * Business Audit — Baseline audit and competitor gap
 * Module: businessAuditEngine
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import type { BusinessAuditDTO } from '@/lib/api/schema';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';
import ProgressBar from '@/components/shared/ProgressBar';

export default function Page(): JSX.Element {
  const { data: audits, loading, error, refetch } = useApi<BusinessAuditDTO[]>('/api/audits');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Business Audit</h1>
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
          <h1 className="text-2xl font-bold text-white">Business Audit</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const latestAudit = audits?.[0];

  if (!audits || audits.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Business Audit</h1>
          <p className="text-sm text-gray-400 mt-1">
            Baseline audits and competitor gap analysis
          </p>
        </div>
        <EmptyState title="No audits found" description="Run an initial audit to get started." />
        <div className="flex gap-3">
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Run Initial Audit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Business Audit</h1>
        <p className="text-sm text-gray-400 mt-1">
          Baseline audits and competitor gap analysis
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Domain Authority"
          value={latestAudit?.domainAuthority ?? 0}
          icon="DA"
          trend="up"
          trendValue="+2"
          sublabel="out of 100"
        />
        <StatCard
          label="Indexed Pages"
          value={latestAudit?.totalIndexedPages ?? 0}
          icon="IP"
          sublabel="pages in Google index"
        />
        <StatCard
          label="Backlinks"
          value={latestAudit?.backlinkCount ?? 0}
          icon="BL"
          sublabel="referring domains"
        />
        <StatCard
          label="Avg Rating"
          value={latestAudit?.averageRating?.toFixed(1) ?? '0.0'}
          icon="RT"
          trend="up"
          trendValue="+0.3"
          sublabel={`${latestAudit?.reviewCount ?? 0} reviews`}
        />
      </div>

      {/* GBP Completeness */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
          Google Business Profile Completeness
        </h2>
        <ProgressBar
          value={latestAudit?.gbpCompleteness ?? 0}
          label="Profile completeness"
          showPercent
        />
      </div>

      {/* Audit List */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Audit History</h2>
        <DataTable
          columns={[
            { header: 'Type', key: 'auditType' },
            { header: 'Domain Authority', key: 'domainAuthority' },
            { header: 'Indexed Pages', key: 'totalIndexedPages' },
            { header: 'Backlinks', key: 'backlinkCount' },
            { header: 'GBP %', key: 'gbpCompleteness' },
            { header: 'Rating', key: 'averageRating' },
            { header: 'Reviews', key: 'reviewCount' },
          ]}
          data={audits.map((a) => ({
            id: a.id,
            auditType: a.auditType,
            domainAuthority: a.domainAuthority,
            totalIndexedPages: a.totalIndexedPages,
            backlinkCount: a.backlinkCount,
            gbpCompleteness: `${a.gbpCompleteness}%`,
            averageRating: a.averageRating.toFixed(1),
            reviewCount: a.reviewCount,
          })) as unknown as Record<string, unknown>[]}
          emptyMessage="No audits run yet. Run an initial audit to get started."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Run Initial Audit
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
        >
          Monthly Refresh
        </button>
      </div>
    </div>
  );
}
