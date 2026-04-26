'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';

const token = MOCK_DATA.birthdayEngine.generateToken('', 'c2');

export default function RedemptionScanner(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Token" value={token.token} icon="🎫" />
        <StatCard label="Status" value={token.redeemed ? 'Redeemed' : 'Active'} icon={token.redeemed ? '✅' : '⏳'} />
        <StatCard label="Expires" value={new Date(token.expiresAt).toLocaleDateString()} icon="📅" />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-3">Token Details</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Token Code</span>
            <span className="text-sm font-mono text-white">{token.token}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Offer</span>
            <span className="text-sm text-gray-300">{token.offerDescription}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Redeemed</span>
            <StatusBadge status={token.redeemed ? 'approved' : 'pending'} />
          </div>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-2">Scan / Enter Token</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter token code..."
            className="flex-1 bg-gray-700 text-white text-sm rounded px-3 py-2 border border-gray-600"
          />
          <button className="px-4 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-500">Redeem</button>
        </div>
      </div>
    </div>
  );
}
