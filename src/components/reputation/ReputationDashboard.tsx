'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import ProgressBar from '@/components/shared/ProgressBar';

const overview = MOCK_DATA.reputationLayer.getOverview('t1');
const reviews = MOCK_DATA.reputationLayer.getReviews('t1', {});

export default function ReputationDashboard(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Average Rating" value={overview.averageRating} icon="STAR" />
        <StatCard label="Total Reviews" value={overview.totalReviews} icon="REV" />
        <StatCard label="Response Rate" value={`${overview.responseRate}%`} icon="RES" />
      </div>
      <ProgressBar label="Response Rate" value={overview.responseRate} />
      <div className="space-y-3">
        {reviews.map(review => (
          <div key={review.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{review.author}</span>
                <span className="text-yellow-400 text-xs">{'*'.repeat(review.rating)}</span>
              </div>
              <StatusBadge status={review.repliedAt ? 'resolved' : 'pending'} />
            </div>
            <p className="text-xs text-gray-300">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
