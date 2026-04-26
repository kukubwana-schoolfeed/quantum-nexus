'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';

const TENANT = 'tenant_1';

export default function AppPreview(): JSX.Element {
  const apps = MOCK_DATA.appProfileEngine.getApps(TENANT);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">App Preview</h3>
      {apps.map((app) => (
        <div key={app.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center gap-4">
          {app.iconUrl ? (
            <img src={app.iconUrl} alt={app.name} className="w-12 h-12 rounded-lg" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center text-gray-500 text-lg">?</div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{app.name}</p>
            <p className="text-xs text-gray-400">{app.platform} &middot; {app.category}</p>
          </div>
          <StatusBadge status={app.status} />
          <p className="text-xs text-gray-400">{app.downloads.toLocaleString()} downloads</p>
        </div>
      ))}
    </div>
  );
}
