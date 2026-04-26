'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';

export default function RevenueChart(): JSX.Element {
  const revenue = MOCK_DATA.appPaymentIntelligence.getRevenue('t1');
  const items = [
    { label: 'Today', value: revenue.today },
    { label: 'This Week', value: revenue.thisWeek },
    { label: 'This Month', value: revenue.thisMonth },
  ];
  const maxVal = Math.max(...items.map((i) => i.value));

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Revenue</h3>
      <div className="flex items-end gap-4 h-28">
        {items.map((item) => (
          <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-gray-400">K{item.value.toLocaleString()}</span>
            <div
              className="w-full bg-green-500 rounded-t"
              style={{ height: `${(item.value / maxVal) * 100}%`, minHeight: 4 }}
            />
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
