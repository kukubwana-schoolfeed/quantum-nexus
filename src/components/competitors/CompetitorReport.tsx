'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import ProgressBar from '@/components/shared/ProgressBar';

const competitors = MOCK_DATA.competitorIntelligence.getCompetitors('t1');

const columns = [
  { header: 'Domain', key: 'domain' },
  { header: 'Domain Authority', key: 'domainAuthority' },
  { header: 'Indexed Pages', key: 'indexedPages' },
  { header: 'Backlinks', key: 'backlinks' },
];

export default function CompetitorReport(): JSX.Element {
  const topDA = Math.max(...competitors.map(c => c.domainAuthority));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Competitors Tracked" value={competitors.length} icon="COMP" />
        <StatCard label="Top Competitor DA" value={topDA} icon="DA" />
        <StatCard label="Avg Indexed Pages" value={Math.round(competitors.reduce((s, c) => s + c.indexedPages, 0) / competitors.length)} icon="PG" />
      </div>
      {competitors.map(c => (
        <ProgressBar key={c.domain} label={`${c.domain} (DA: ${c.domainAuthority})`} value={c.domainAuthority} max={50} />
      ))}
      <DataTable
        columns={columns}
        data={competitors as unknown as Record<string, unknown>[]}
        emptyMessage="No competitor data"
      />
    </div>
  );
}
