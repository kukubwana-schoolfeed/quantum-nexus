'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';

export default function CostBreakdown(): JSX.Element {
  const costs = MOCK_DATA.costDashboard.getCostOverview('t1');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Anthropic" value={`$${costs.anthropic}`} />
        <StatCard label="ElevenLabs" value={`$${costs.elevenlabs}`} />
        <StatCard label="Twilio" value={`$${costs.twilio}`} />
        <StatCard label="Runway" value={`$${costs.runway}`} />
        <StatCard label="Total" value={`$${costs.total}`} icon="$" />
      </div>
    </div>
  );
}
