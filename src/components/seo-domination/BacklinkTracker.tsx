'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import ProgressBar from '@/components/shared/ProgressBar';

const overview = MOCK_DATA.seoEngine.getSeoOverview('t1');

export default function BacklinkTracker(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total Backlinks" value={overview.backlinks} icon="BL" />
        <StatCard label="Domain Authority" value={overview.domainAuthority} icon="DA" />
      </div>
      <div className="space-y-3">
        <ProgressBar label="Backlink Growth" value={Math.min(overview.backlinks * 5, 100)} sublabel={`${overview.backlinks} backlinks acquired`} />
        <ProgressBar label="Domain Authority" value={overview.domainAuthority} max={50} sublabel="Target: 30" />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Backlink Sources</h4>
        <p className="text-sm text-gray-300">{overview.backlinks} backlinks from {Math.max(overview.backlinks - 1, 1)} referring domains</p>
      </div>
    </div>
  );
}
