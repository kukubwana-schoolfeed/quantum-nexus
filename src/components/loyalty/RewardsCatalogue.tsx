'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';

const balance = MOCK_DATA.loyaltyPointsEngine.getBalance('', 'c1');

const rewards = [
  { id: 'r1', name: 'Free Dessert', pointsCost: 100, category: 'Food' },
  { id: 'r2', name: '10% Off Next Visit', pointsCost: 200, category: 'Discount' },
  { id: 'r3', name: 'Free Drink', pointsCost: 50, category: 'Beverage' },
  { id: 'r4', name: 'VIP Table Booking', pointsCost: 500, category: 'Experience' },
];

export default function RewardsCatalogue(): JSX.Element {
  return (
    <div className="space-y-4">
      <StatCard label="Available Points" value={balance.points} sublabel={`${balance.tier} tier`} icon="⭐" />
      <div className="grid grid-cols-2 gap-3">
        {rewards.map(reward => (
          <div
            key={reward.id}
            className={`bg-gray-800 rounded-lg p-4 border ${balance.points >= reward.pointsCost ? 'border-gray-600' : 'border-gray-700 opacity-60'}`}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-white">{reward.name}</p>
              <span className="text-xs text-gray-500">{reward.category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-yellow-400">{reward.pointsCost} pts</span>
              <button
                className={`text-xs px-3 py-1 rounded ${balance.points >= reward.pointsCost ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                disabled={balance.points < reward.pointsCost}
              >
                Redeem
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
