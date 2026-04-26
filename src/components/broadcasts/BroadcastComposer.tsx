'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';

const broadcasts = MOCK_DATA.broadcastEngine.getBroadcasts('');

export default function BroadcastComposer(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-3">New Broadcast</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Channel</label>
            <select className="w-full bg-gray-700 text-white text-sm rounded px-3 py-2 border border-gray-600">
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Message</label>
            <textarea
              className="w-full bg-gray-700 text-white text-sm rounded px-3 py-2 border border-gray-600 h-24 resize-none"
              placeholder="Type your broadcast message..."
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-500">Send Now</button>
            <button className="px-4 py-2 bg-gray-600 text-white text-xs rounded hover:bg-gray-500">Schedule</button>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-2">Previous Broadcasts</h3>
        {broadcasts.length === 0 ? (
          <p className="text-xs text-gray-500">No broadcasts yet</p>
        ) : (
          <div className="space-y-2">
            {broadcasts.map(b => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{b.body?.slice(0, 60)}...</p>
                  <p className="text-xs text-gray-500">{b.type} · {b.recipientCount} recipients</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
