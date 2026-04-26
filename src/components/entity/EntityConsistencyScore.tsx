'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import ProgressBar from '@/components/shared/ProgressBar';

const consistency = MOCK_DATA.entityBuilder.checkConsistency('t1');
const total = consistency.consistent + consistency.inconsistent + consistency.pending;

export default function EntityConsistencyScore(): JSX.Element {
  const score = total > 0 ? Math.round((consistency.consistent / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Consistent" value={consistency.consistent} trend="up" icon="OK" />
        <StatCard label="Inconsistent" value={consistency.inconsistent} trend={consistency.inconsistent > 0 ? 'down' : 'stable'} icon="BAD" />
        <StatCard label="Pending" value={consistency.pending} icon="PEND" />
      </div>
      <ProgressBar label="NAP Consistency Score" value={score} sublabel={`${consistency.consistent} of ${total} listings consistent`} />
    </div>
  );
}
