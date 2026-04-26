'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

const broadcasts = MOCK_DATA.broadcastEngine.getBroadcasts('');
const totalRecipients = broadcasts.reduce((sum, b) => sum + b.recipientCount, 0);

export default function ListBuilder(): JSX.Element {
  const columns = [
    { header: 'Type', key: 'type' },
    { header: 'Subject', key: 'subject', render: (v: unknown) => String(v ?? '—') },
    { header: 'Status', key: 'status', render: (v: unknown) => <StatusBadge status={String(v)} /> },
    { header: 'Recipients', key: 'recipientCount' },
    {
      header: 'Sent At',
      key: 'sentAt',
      render: (v: unknown) => v ? new Date(String(v)).toLocaleDateString() : '—',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Broadcasts" value={broadcasts.length} icon="📢" />
        <StatCard label="Total Recipients" value={totalRecipients} icon="👥" />
        <StatCard label="Sent" value={broadcasts.filter(b => b.status === 'sent').length} icon="✅" />
      </div>
      <DataTable columns={columns} data={broadcasts as unknown as Record<string, unknown>[]} emptyMessage="No broadcasts created" />
    </div>
  );
}
