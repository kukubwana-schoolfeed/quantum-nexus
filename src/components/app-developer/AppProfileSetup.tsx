'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';

const TENANT = 'tenant_1';

export default function AppProfileSetup(): JSX.Element {
  const apps = MOCK_DATA.appProfileEngine.getApps(TENANT);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">App Profile Setup</h3>
      {apps.map((app) => (
        <div key={app.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">{app.name}</p>
            <StatusBadge status={app.status} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
            <div>Platform: <span className="text-gray-300">{app.platform}</span></div>
            <div>Category: <span className="text-gray-300">{app.category}</span></div>
            <div>Downloads: <span className="text-gray-300">{app.downloads.toLocaleString()}</span></div>
          </div>
          <button className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Edit Profile
          </button>
        </div>
      ))}
    </div>
  );
}
