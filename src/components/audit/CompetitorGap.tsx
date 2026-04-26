'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import ProgressBar from '@/components/shared/ProgressBar';

const audit = MOCK_DATA.businessAuditEngine.getAudits('t1')[0];
const competitors = MOCK_DATA.competitorIntelligence.getCompetitors('t1');

const columns = [
  { header: 'Domain', key: 'domain' },
  { header: 'Domain Authority', key: 'domainAuthority' },
  { header: 'Indexed Pages', key: 'indexedPages' },
  { header: 'Backlinks', key: 'backlinks' },
];

export default function CompetitorGap(): JSX.Element {
  const topCompetitor = competitors[0];
  const daGap = topCompetitor ? topCompetitor.domainAuthority - audit.domainAuthority : 0;
  const pageGap = topCompetitor ? topCompetitor.indexedPages - audit.totalIndexedPages : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="DA Gap (vs Top)" value={daGap > 0 ? `+${daGap}` : String(daGap)} trend={daGap > 0 ? 'down' : 'up'} icon="DA" />
        <StatCard label="Indexed Page Gap" value={pageGap > 0 ? `+${pageGap}` : String(pageGap)} trend={pageGap > 0 ? 'down' : 'up'} icon="PG" />
        <StatCard label="Backlink Gap" value={topCompetitor ? topCompetitor.backlinks - audit.backlinkCount : 0} trend="down" icon="BL" />
      </div>
      <ProgressBar label="Your Domain Authority" value={audit.domainAuthority} max={50} />
      {competitors.map(c => (
        <ProgressBar key={c.domain} label={c.domain} value={c.domainAuthority} max={50} />
      ))}
      <DataTable
        columns={columns}
        data={competitors as unknown as Record<string, unknown>[]}
        emptyMessage="No competitor data"
      />
    </div>
  );
}
