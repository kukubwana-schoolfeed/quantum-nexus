'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';

const upcoming = MOCK_DATA.customerDatabase.getBirthdayUpcoming('');
const config = MOCK_DATA.birthdayEngine.getConfig('');

export default function BirthdayCalendar(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Upcoming Birthdays" value={upcoming.count} icon="🎂" />
        <StatCard label="Auto Send" value={config.autoSendEnabled ? 'Enabled' : 'Disabled'} icon="🤖" />
        <StatCard label="Send Before" value={`${config.daysBefore} days`} icon="📅" />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-3">Upcoming Birthdays</h3>
        {upcoming.upcoming.length === 0 ? (
          <p className="text-xs text-gray-500">No upcoming birthdays</p>
        ) : (
          <div className="space-y-2">
            {upcoming.upcoming.map(b => (
              <div key={b.customerId} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                <div>
                  <p className="text-sm text-white">{b.firstName}</p>
                  <p className="text-xs text-gray-500">{b.daysUntil} days away</p>
                </div>
                <StatusBadge status={b.daysUntil <= 7 ? 'pending' : 'scheduled'} />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-2">Offer Template</h3>
        <p className="text-xs text-gray-400">{config.offerTemplate}</p>
      </div>
    </div>
  );
}
