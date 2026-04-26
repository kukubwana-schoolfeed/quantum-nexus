'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import DataTable from '@/components/shared/DataTable';
import ProgressBar from '@/components/shared/ProgressBar';
import StatusBadge from '@/components/shared/StatusBadge';

const TENANT_ID = 't1';

export default function RankTracker(): JSX.Element {
  const strategy = MOCK_DATA.seoEngine.getKeywordStrategy(TENANT_ID);

  const columns = [
    { header: 'Keyword', key: 'keyword' },
    { header: 'Volume', key: 'volume' },
    { header: 'Difficulty', key: 'difficulty', render: (v: unknown) => <ProgressBar value={v as number} max={100} showPercent label={`Difficulty`} /> },
    { header: 'Current Rank', key: 'currentRank', render: (v: unknown) => {
      const rank = v as number;
      const status = rank <= 5 ? 'live' : rank <= 10 ? 'improving' : 'declining';
      return <span className="flex items-center gap-2"><StatusBadge status={status} /> #{rank}</span>;
    }},
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Keyword Rank Tracking</h3>
      <DataTable columns={columns} data={strategy.keywords as unknown as Record<string, unknown>[]} />
    </div>
  );
}
