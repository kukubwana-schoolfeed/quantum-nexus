'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';

const TENANT_ID = 't1';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function KeywordCalendar(): JSX.Element {
  const strategy = MOCK_DATA.seoEngine.getKeywordStrategy(TENANT_ID);

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Keyword Calendar</h3>
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs text-gray-500 font-medium py-1">{day}</div>
        ))}
        {strategy.keywords.map((kw, i) => (
          <div key={kw.keyword} className={`bg-gray-900 rounded p-2 text-xs border border-gray-700 ${i % 7 === 5 || i % 7 === 6 ? 'opacity-50' : ''}`}>
            <StatusBadge status={kw.currentRank <= 5 ? 'live' : 'improving'} />
            <p className="text-gray-300 mt-1 truncate">{kw.keyword}</p>
            <p className="text-gray-500 mt-0.5">Vol {kw.volume}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
