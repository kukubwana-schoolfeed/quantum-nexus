'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import ProgressBar from '@/components/shared/ProgressBar';
import StatusBadge from '@/components/shared/StatusBadge';

const TENANT_ID = 't1';

export default function SEORankings(): JSX.Element {
  const strategy = MOCK_DATA.seoEngine.getKeywordStrategy(TENANT_ID);
  const seo = MOCK_DATA.seoEngine.getSeoOverview(TENANT_ID);

  const columns = [
    { header: 'Keyword', key: 'keyword' },
    { header: 'Volume', key: 'volume' },
    { header: 'Difficulty', key: 'difficulty', render: (v: unknown) => <ProgressBar value={v as number} max={100} showPercent={false} /> },
    { header: 'Rank', key: 'currentRank', render: (v: unknown) => {
      const rank = v as number;
      const status = rank <= 5 ? 'live' : rank <= 10 ? 'improving' : 'declining';
      return <><StatusBadge status={status} /> <span className="text-gray-400 ml-1">#{rank}</span></>;
    }},
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Domain Authority" value={seo.domainAuthority} />
        <StatCard label="Indexed Pages" value={seo.indexedPages} />
        <StatCard label="Backlinks" value={seo.backlinks} />
      </div>
      <DataTable columns={columns} data={strategy.keywords as unknown as Record<string, unknown>[]} />
    </div>
  );
}
