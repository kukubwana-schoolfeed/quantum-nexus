'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';

export default function ReviewFeed(): JSX.Element {
  const reviews = MOCK_DATA.appReviewMonitor.getReviews('t1', {});
  const stats = MOCK_DATA.appReviewMonitor.getReviewStats('t1');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Avg Rating" value={stats.averageRating} icon="★" />
        <StatCard label="Total Reviews" value={stats.totalReviews} />
        <StatCard label="Response Rate" value={`${stats.responseRate}%`} />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-3">Review Feed</h3>
        <div className="space-y-2">
          {reviews.map((review) => (
            <div key={review.id} className="p-2 rounded bg-gray-900 border border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white font-medium">{review.author}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-yellow-400">{'★'.repeat(review.rating)}</span>
                  <StatusBadge status={review.repliedAt ? 'resolved' : 'pending'} />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
