'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import ProgressBar from '@/components/shared/ProgressBar';
import DataTable from '@/components/shared/DataTable';

const audit = MOCK_DATA.businessAuditEngine.getAudits('t1')[0];

const columns = [
  { header: 'Domain', key: 'domain' },
  { header: 'Domain Authority', key: 'domainAuthority' },
  { header: 'Indexed Pages', key: 'indexedPages' },
  { header: 'Reviews', key: 'reviewCount' },
  { header: 'Avg Rating', key: 'averageRating' },
];

export default function AuditReport(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Domain Authority" value={audit.domainAuthority} icon="DA" />
        <StatCard label="Indexed Pages" value={audit.totalIndexedPages} icon="PG" />
        <StatCard label="Backlinks" value={audit.backlinkCount} icon="BL" />
        <StatCard label="GBP Completeness" value={`${audit.gbpCompleteness}%`} icon="GBP" />
      </div>
      <ProgressBar label="GBP Profile Completeness" value={audit.gbpCompleteness} />
      <ProgressBar label="Review Coverage" value={Math.min(audit.reviewCount * 5, 100)} sublabel={`${audit.reviewCount} reviews`} />
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">Competitor Data</h4>
        <DataTable
          columns={columns}
          data={audit.competitorData as unknown as Record<string, unknown>[]}
          emptyMessage="No competitor data"
        />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Priority Actions</h4>
        <ul className="space-y-1">
          {audit.recommendedPriority.map((item, i) => (
            <li key={i} className="text-xs text-gray-400 flex items-center gap-2">
              <span className="text-yellow-400">{i + 1}.</span> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
