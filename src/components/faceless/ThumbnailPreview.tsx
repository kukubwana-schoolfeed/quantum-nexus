'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';

export default function ThumbnailPreview(): JSX.Element {
  const thumbnails = MOCK_DATA.facelessThumbnailGenerator.getThumbnails('t1');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {thumbnails.map((thumb) => (
          <div key={thumb.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <img
              src={thumb.url}
              alt={`Thumbnail for episode ${thumb.episodeId}`}
              className="w-full h-32 object-cover"
            />
            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Episode {thumb.episodeId}</p>
                <p className="text-xs text-gray-500 capitalize">{thumb.style}</p>
              </div>
              {thumb.isSelected && <StatusBadge status="active" />}
            </div>
          </div>
        ))}
      </div>
      {thumbnails.length === 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
          <p className="text-gray-500 text-sm">No thumbnails generated yet</p>
        </div>
      )}
    </div>
  );
}
