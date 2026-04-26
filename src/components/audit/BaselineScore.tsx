'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import ProgressBar from '@/components/shared/ProgressBar';

const audit = MOCK_DATA.businessAuditEngine.getAudits('t1')[0];

export default function BaselineScore(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Domain Authority" value={audit.domainAuthority} icon="DA" />
        <StatCard label="Indexed Pages" value={audit.totalIndexedPages} icon="PG" />
        <StatCard label="Backlinks" value={audit.backlinkCount} icon="BL" />
        <StatCard label="Avg Rating" value={audit.averageRating} icon="STAR" />
      </div>
      <div className="space-y-3">
        <ProgressBar label="Domain Authority" value={audit.domainAuthority} max={50} />
        <ProgressBar label="GBP Completeness" value={audit.gbpCompleteness} />
        <ProgressBar label="GSC Clicks (90d)" value={Math.min(Math.round((audit.gscClicks90d / audit.gscImpressions90d) * 100), 100)} sublabel={`${audit.gscClicks90d} / ${audit.gscImpressions90d}`} />
        <ProgressBar label="Review Count" value={Math.min(audit.reviewCount * 5, 100)} sublabel={`${audit.reviewCount} reviews`} />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <p className="text-xs text-gray-400">{audit.summary}</p>
      </div>
    </div>
  );
}
