'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import DataTable from '@/components/shared/DataTable';

const KEYWORD = 'zambian food';

export default function KeywordTracker(): JSX.Element {
  const history = MOCK_DATA.appStoreOptimizer.getRankHistory('t1', KEYWORD);

  const columns = [
    { header: 'Date', key: 'date' },
    { header: 'Rank', key: 'rank', render: (v: unknown) => (
      <span className="text-yellow-400 font-medium">#{String(v)}</span>
    )},
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Keyword Tracker</h3>
      <p className="text-xs text-gray-400">Tracking: <span className="text-white">{history.keyword}</span></p>
      <DataTable columns={columns} data={history.ranks as unknown as Record<string, unknown>[]} />
    </div>
  );
}
