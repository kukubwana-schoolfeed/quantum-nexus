'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';

const TENANT_ID = 't1';

export default function ContentQueue(): JSX.Element {
  const posts = MOCK_DATA.contentMachine.getPosts(TENANT_ID, {});
  const queue = posts.filter((p: { status: string }) => p.status === 'draft' || p.status === 'scheduled');

  const columns = [
    { header: 'Type', key: 'contentType' },
    { header: 'Platform', key: 'platform', render: (v: unknown) => (v as string) ?? '—' },
    { header: 'Status', key: 'status', render: (v: unknown) => <StatusBadge status={v as string} /> },
    { header: 'Scheduled', key: 'scheduledFor', render: (v: unknown) => v ? new Date(v as string).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—' },
    { header: 'Preview', key: 'caption', render: (v: unknown) => <span className="truncate max-w-[200px] block">{v ? (v as string).slice(0, 50) : '—'}</span> },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Content Queue</h3>
      <DataTable columns={columns} data={queue as unknown as Record<string, unknown>[]} emptyMessage="No drafts or scheduled posts" />
    </div>
  );
}
