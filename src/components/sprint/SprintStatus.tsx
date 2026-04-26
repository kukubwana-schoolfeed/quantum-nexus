'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import ProgressBar from '@/components/shared/ProgressBar';

const config = MOCK_DATA.sprintModeEngine.getConfig('t1');

export default function SprintStatus(): JSX.Element {
  const endsAt = new Date(config.endsAt);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const totalDays = 31;
  const elapsed = totalDays - daysLeft;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Sprint Mode" value={config.active ? 'ACTIVE' : 'INACTIVE'} icon="SPR" />
        <StatCard label="Days Remaining" value={daysLeft} icon="DAY" />
        <StatCard label="Posting Multiplier" value={`${config.postingMultiplier}x`} icon="MUL" />
      </div>
      <ProgressBar label="Sprint Progress" value={elapsed} max={totalDays} sublabel={`${daysLeft} days remaining`} />
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Comment Response Speed</span>
          <StatusBadge status={config.commentResponseSpeed === 'every' ? 'active' : 'pending'} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Trend Check Frequency</span>
          <span className="text-xs text-gray-300">{config.trendCheckFrequency}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Clip Extraction</span>
          <span className="text-xs text-gray-300">{config.clipExtractionMode}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Warmup Override</span>
          <StatusBadge status={config.warmupOverride ? 'active' : 'draft'} />
        </div>
      </div>
    </div>
  );
}
