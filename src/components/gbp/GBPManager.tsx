'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import ProgressBar from '@/components/shared/ProgressBar';

const profile = MOCK_DATA.googleBusinessProfileManager.getProfile('t1');
const insights = MOCK_DATA.googleBusinessProfileManager.getInsights('t1');

export default function GBPManager(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Business Name" value={profile.name} icon="GBP" />
        <StatCard label="Category" value={profile.category} icon="CAT" />
        <StatCard label="Rating" value={profile.rating} icon="STAR" />
        <StatCard label="Reviews" value={profile.reviewCount} icon="REV" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Views" value={insights.views} icon="EYE" />
        <StatCard label="Searches" value={insights.searches} icon="SRC" />
        <StatCard label="Direction Requests" value={insights.directionRequests} icon="DIR" />
      </div>
      <ProgressBar label="Profile Rating" value={Math.round((profile.rating / 5) * 100)} sublabel={`${profile.rating} / 5.0`} />
    </div>
  );
}
