'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';

const TENANT_ID = 't1';

export default function ContentCalendar(): JSX.Element {
  const entries = MOCK_DATA.ugcContentCalendar.getEntries(TENANT_ID, {});
  const scheduled = entries.filter(e => e.status === 'scheduled').length;
  const published = entries.filter(e => e.status === 'published').length;

  const columns = [
    { header: 'Clip', key: 'clipId' },
    { header: 'Platform', key: 'platform' },
    {
      header: 'Scheduled For',
      key: 'scheduledFor',
      render: (val: unknown) => new Date(val as string).toLocaleString(),
    },
    { header: 'Status', key: 'status', render: (val: unknown) => <StatusBadge status={val as string} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Entries" value={entries.length} />
        <StatCard label="Scheduled" value={scheduled} />
        <StatCard label="Published" value={published} />
      </div>
      <DataTable columns={columns} data={entries as unknown as Record<string, unknown>[]} />
    </div>
  );
}
