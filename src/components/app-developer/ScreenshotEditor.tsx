'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';

export default function ScreenshotEditor(): JSX.Element {
  const listing = MOCK_DATA.appStoreOptimizer.getListing('t1', 'ap1');

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Screenshot Editor</h3>
      <p className="text-xs text-gray-400 mb-3">{listing.title}</p>
      <div className="grid grid-cols-2 gap-3">
        {listing.screenshots.map((url, i) => (
          <div key={i} className="relative rounded border border-gray-600 overflow-hidden">
            <img
              src={url}
              alt={`Screenshot ${i + 1}`}
              className="w-full h-32 object-cover bg-gray-700"
            />
            <div className="absolute top-1 right-1">
              <StatusBadge status="published" />
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-center py-1">
              <span className="text-xs text-gray-300">Screenshot {i + 1}</span>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-3 text-xs text-blue-400 hover:text-blue-300">
        + Add Screenshot
      </button>
    </div>
  );
}
