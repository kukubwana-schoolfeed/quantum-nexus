'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

const magnets = MOCK_DATA.leadMagnetBuilder.getMagnets('');
const totalDownloads = magnets.reduce((sum, m) => sum + m.downloads, 0);

export default function MagnetBuilder(): JSX.Element {
  const columns = [
    { header: 'Title', key: 'title' },
    { header: 'Type', key: 'type' },
    { header: 'Status', key: 'status', render: (v: unknown) => <StatusBadge status={String(v)} /> },
    { header: 'Downloads', key: 'downloads' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Lead Magnets" value={magnets.length} icon="🧲" />
        <StatCard label="Total Downloads" value={totalDownloads} icon="📥" />
        <StatCard label="Active" value={magnets.filter(m => m.status === 'active').length} icon="✅" />
      </div>
      <DataTable columns={columns} data={magnets as unknown as Record<string, unknown>[]} emptyMessage="No lead magnets created" />
    </div>
  );
}
