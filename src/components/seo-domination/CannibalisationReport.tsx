'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';

const reports = MOCK_DATA.keywordCannibalisationDetector.getReports('t1');
const scanResult = MOCK_DATA.keywordCannibalisationDetector.runScan('t1');

export default function CannibalisationReport(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Conflicts Found" value={scanResult.conflictsFound} icon="CON" />
        <StatCard label="Reports" value={reports.length} icon="RPT" />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Last Scan Result</p>
          <p className="text-xs text-gray-400 mt-1">{scanResult.conflictsFound} keyword conflicts detected</p>
        </div>
        <StatusBadge status={scanResult.conflictsFound === 0 ? 'pass' : 'held'} />
      </div>
      {scanResult.reports.length > 0 ? (
        <div className="space-y-2">
          {scanResult.reports.map((r, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <p className="text-sm text-gray-300">Conflict on keyword: <span className="text-white font-medium">{String((r as unknown as Record<string, unknown>).keyword ?? 'unknown')}</span></p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
          <p className="text-sm text-gray-500">No keyword cannibalisation detected. Your content is well-structured.</p>
        </div>
      )}
    </div>
  );
}
