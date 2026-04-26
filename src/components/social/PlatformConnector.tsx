'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';

const TENANT_ID = 't1';

export default function PlatformConnector(): JSX.Element {
  const platforms = MOCK_DATA.socialMediaLayer.getConnectedPlatforms(TENANT_ID);

  const columns = [
    { header: 'Platform', key: 'platform' },
    { header: 'Status', key: 'connected', render: (v: unknown) => <StatusBadge status={v ? 'live' : 'draft'} /> },
    { header: 'Username', key: 'username', render: (v: unknown) => (v as string) ?? '—' },
    { header: 'Token Expires', key: 'tokenExpiresAt', render: (v: unknown) => v ? new Date(v as string).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Platform Connections</h3>
      <DataTable columns={columns} data={platforms as unknown as Record<string, unknown>[]} />
    </div>
  );
}
