'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import ProgressBar from '@/components/shared/ProgressBar';

const overview = MOCK_DATA.seoEngine.getSeoOverview('t1');

export default function IndexGrowthChart(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Domain Authority" value={overview.domainAuthority} icon="DA" />
        <StatCard label="Indexed Pages" value={overview.indexedPages} icon="PG" />
        <StatCard label="Backlinks" value={overview.backlinks} icon="BL" />
      </div>
      <div className="space-y-3">
        <ProgressBar label="Domain Authority" value={overview.domainAuthority} max={50} />
        <ProgressBar label="Indexing Progress" value={Math.min(overview.indexedPages * 2, 100)} sublabel={`${overview.indexedPages} pages indexed`} />
        <ProgressBar label="Backlink Growth" value={Math.min(overview.backlinks * 5, 100)} sublabel={`${overview.backlinks} backlinks`} />
      </div>
    </div>
  );
}
