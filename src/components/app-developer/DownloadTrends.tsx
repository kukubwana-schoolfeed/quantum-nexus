'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';

export default function DownloadTrends(): JSX.Element {
  const chart = MOCK_DATA.appAnalyticsDashboard.getCharts('t1', 'downloads', '4w');
  const maxVal = Math.max(...chart.data.map((d) => d.value));

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Download Trends</h3>
      <div className="flex items-end gap-2 h-32">
        {chart.data.map((point) => (
          <div key={point.label} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-gray-400">{point.value}</span>
            <div
              className="w-full bg-blue-500 rounded-t"
              style={{ height: `${(point.value / maxVal) * 100}%`, minHeight: 4 }}
            />
            <span className="text-xs text-gray-500">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
