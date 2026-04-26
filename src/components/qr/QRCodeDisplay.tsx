'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';

const qr = MOCK_DATA.offlineQrBridge.getQrCode('');

export default function QRCodeDisplay(): JSX.Element {
  return (
    <div className="space-y-4">
      <StatCard label="Join URL" value={qr.url} icon="🔗" />
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col items-center">
        <img
          src={qr.imageUrl}
          alt="QR Code"
          className="w-48 h-48 object-contain bg-white rounded"
        />
        <p className="text-xs text-gray-400 mt-3">Scan to join The Flame Grill</p>
        <p className="text-xs text-gray-500 mt-1 font-mono">{qr.url}</p>
      </div>
    </div>
  );
}
