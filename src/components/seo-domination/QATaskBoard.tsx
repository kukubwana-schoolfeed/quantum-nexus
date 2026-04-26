'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';

const tasks = MOCK_DATA.seoDominationEngine.getQaTasks('t1');

const columns = [
  { header: 'Platform', key: 'platform' },
  {
    header: 'Question',
    key: 'questionText',
    render: (v: unknown) => {
      const text = String(v ?? '');
      return text.length > 60 ? text.slice(0, 60) + '...' : text;
    },
  },
  { header: 'Status', key: 'status', render: (v: unknown) => <StatusBadge status={String(v ?? '')} /> },
  {
    header: 'Posted',
    key: 'questionPostedAt',
    render: (v: unknown) => (v ? new Date(String(v)).toLocaleDateString() : 'Pending'),
  },
];

export default function QATaskBoard(): JSX.Element {
  const awaiting = tasks.filter(t => t.status === 'awaiting_confirmation').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Q&A Tasks" value={tasks.length} icon="QA" />
        <StatCard label="Awaiting Confirmation" value={awaiting} icon="WAIT" />
      </div>
      <DataTable
        columns={columns}
        data={tasks as unknown as Record<string, unknown>[]}
        emptyMessage="No Q&A tasks"
      />
    </div>
  );
}
