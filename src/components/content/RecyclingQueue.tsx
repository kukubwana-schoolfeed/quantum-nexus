'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import ProgressBar from '@/components/shared/ProgressBar';

const TENANT_ID = 't1';

export default function RecyclingQueue(): JSX.Element {
  const candidates = MOCK_DATA.contentRecyclingEngine.getCandidates(TENANT_ID, {});

  const columns = [
    { header: 'Post ID', key: 'postId' },
    { header: 'Type', key: 'contentType' },
    { header: 'Platform', key: 'platform' },
    { header: 'Score', key: 'performanceScore', render: (v: unknown) => <ProgressBar value={v as number} max={100} showPercent label={`Score: ${v}`} /> },
    { header: 'Age (days)', key: 'daysSincePublish' },
    { header: 'Suggested Formats', key: 'suggestedFormats', render: (v: unknown) => <span className="text-xs text-gray-400">{(v as string[]).join(', ')}</span> },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Recycling Candidates</h3>
      <DataTable columns={columns} data={candidates as unknown as Record<string, unknown>[]} emptyMessage="No recycling candidates" />
    </div>
  );
}
