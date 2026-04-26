'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';

const listings = MOCK_DATA.entityBuilder.getListings('t1');

const columns = [
  { header: 'Directory', key: 'directoryName' },
  {
    header: 'Status',
    key: 'status',
    render: (v: unknown) => <StatusBadge status={String(v ?? '')} />,
  },
  {
    header: 'NAP Consistent',
    key: 'isConsistent',
    render: (v: unknown) => {
      if (v === null || v === undefined) return <span className="text-xs text-gray-500">Pending</span>;
      return <StatusBadge status={v ? 'active' : 'held'} />;
    },
  },
  {
    header: 'Listing URL',
    key: 'listingUrl',
    render: (v: unknown) =>
      v ? (
        <a href={String(v)} className="text-blue-400 hover:underline text-xs" target="_blank" rel="noreferrer">{String(v)}</a>
      ) : (
        <span className="text-xs text-gray-500">Not available</span>
      ),
  },
];

export default function DirectorySubmissionTracker(): JSX.Element {
  const live = listings.filter(l => l.status === 'live').length;
  const pending = listings.filter(l => l.status === 'pending').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Listings" value={listings.length} icon="DIR" />
        <StatCard label="Live" value={live} icon="LIVE" />
        <StatCard label="Pending" value={pending} icon="PEND" />
      </div>
      <DataTable
        columns={columns}
        data={listings as unknown as Record<string, unknown>[]}
        emptyMessage="No directory submissions"
      />
    </div>
  );
}
