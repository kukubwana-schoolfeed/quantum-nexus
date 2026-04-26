'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';

const apiKeys = MOCK_DATA.apiKeyManager.getKeys('t1');
const platforms = MOCK_DATA.socialMediaLayer.getConnectedPlatforms('t1');

const keyColumns = [
  { header: 'Key Name', key: 'keyName' },
  {
    header: 'Connected',
    key: 'isConnected',
    render: (v: unknown) => <StatusBadge status={v ? 'active' : 'draft'} />,
  },
  {
    header: 'Expires',
    key: 'expiresAt',
    render: (v: unknown) => (v ? new Date(String(v)).toLocaleDateString() : 'N/A'),
  },
];

const platformColumns = [
  { header: 'Platform', key: 'platform' },
  { header: 'Username', key: 'username' },
  {
    header: 'Connected',
    key: 'connected',
    render: (v: unknown) => <StatusBadge status={v ? 'active' : 'draft'} />,
  },
];

export default function ConnectedAccounts(): JSX.Element {
  const connectedKeys = apiKeys.filter(k => k.isConnected).length;
  const connectedPlatforms = platforms.filter(p => p.connected).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="API Keys Connected" value={`${connectedKeys}/${apiKeys.length}`} icon="KEY" />
        <StatCard label="Platforms Connected" value={`${connectedPlatforms}/${platforms.length}`} icon="SOC" />
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">API Keys</h4>
        <DataTable
          columns={keyColumns}
          data={apiKeys as unknown as Record<string, unknown>[]}
          emptyMessage="No API keys"
        />
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">Social Platforms</h4>
        <DataTable
          columns={platformColumns}
          data={platforms as unknown as Record<string, unknown>[]}
          emptyMessage="No connected platforms"
        />
      </div>
    </div>
  );
}
