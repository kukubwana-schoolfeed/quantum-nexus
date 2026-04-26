'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import ProgressBar from '@/components/shared/ProgressBar';

const TENANT_ID = 't1';

export default function ClipPreview(): JSX.Element {
  const clips = MOCK_DATA.ugcClipIntelligence.getClips(TENANT_ID, {});
  const avgScore = clips.length > 0 ? Math.round(clips.reduce((s, c) => s + c.score, 0) / clips.length) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Clip Candidates" value={clips.length} />
        <StatCard label="Avg Score" value={avgScore} sublabel="clip quality" />
      </div>
      <div className="grid gap-3">
        {clips.map((clip) => {
          const preview = MOCK_DATA.ugcClipPreview.getPreview(TENANT_ID, clip.id);
          return (
            <div key={clip.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700 flex gap-3">
              <div className="w-28 h-16 bg-gray-700 rounded flex-shrink-0 flex items-center justify-center text-xs text-gray-500">
                {preview.duration.toFixed(1)}s
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{clip.hookText}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={clip.status} />
                  <span className="text-xs text-gray-500">
                    {clip.startTime.toFixed(1)}s - {clip.endTime.toFixed(1)}s
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={clip.score} label="Score" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
