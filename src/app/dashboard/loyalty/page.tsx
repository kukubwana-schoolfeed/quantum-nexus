'use client';

import { useState, useCallback } from 'react';
import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import ProgressBar from '@/components/shared/ProgressBar';
import type { LoyaltyBalanceDTO, LoyaltyTransactionDTO } from '@/lib/api/schema';

interface LoyaltyData {
  balance: LoyaltyBalanceDTO;
  transactions: LoyaltyTransactionDTO[];
}

const TIER_THRESHOLD: Record<string, number> = { standard: 0, priority: 100, vip: 500 };

const REWARDS = [
  { id: 'r1', name: 'Free Dessert', pointsCost: 100, category: 'Food' },
  { id: 'r2', name: '10% Off Next Visit', pointsCost: 200, category: 'Discount' },
  { id: 'r3', name: 'Free Drink', pointsCost: 50, category: 'Beverage' },
  { id: 'r4', name: 'VIP Table Booking', pointsCost: 500, category: 'Experience' },
];

const TYPE_STYLES: Record<string, string> = {
  earn: 'bg-green-500/20 text-green-400',
  redeem: 'bg-blue-500/20 text-blue-400',
  expire: 'bg-red-500/20 text-red-400',
  adjustment: 'bg-yellow-500/20 text-yellow-400',
};

export default function LoyaltyPage(): JSX.Element {
  const { data, loading, error, refetch } = useApi<LoyaltyData>('/api/loyalty');
  const [actionError, setActionError] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const handleRedeem = useCallback(async (rewardId: string, pointsCost: number) => {
    setRedeeming(rewardId);
    setActionError(null);
    try {
      const res = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: pointsCost, description: `Redeemed: ${REWARDS.find(r => r.id === rewardId)?.name}` }),
      });
      if (!res.ok) throw new Error('Redemption failed');
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Redemption failed');
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to redeem');
    } finally {
      setRedeeming(null);
    }
  }, [refetch]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Loyalty Points</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
        <SkeletonPanel />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Loyalty Points</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Loyalty Points</h1>
        </div>
        <EmptyState title="No loyalty data found" description="Loyalty points information will appear here once available." />
      </div>
    );
  }

  const { balance, transactions } = data;
  const currentTierPoints = TIER_THRESHOLD[balance.tier] ?? 0;
  const nextTier = balance.tier === 'standard' ? 'priority' : balance.tier === 'priority' ? 'vip' : null;
  const nextTierPoints = nextTier ? TIER_THRESHOLD[nextTier] : 500;
  const progressToNext = nextTier
    ? ((balance.points - currentTierPoints) / (nextTierPoints - currentTierPoints)) * 100
    : 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Loyalty Points</h1>
        <p className="text-gray-400 text-sm mt-1">Track loyalty points, manage tiers, and redeem rewards.</p>
      </div>

      {actionError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{actionError}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Current Balance" value={balance.points} icon="P" sublabel="Loyalty points" />
        <StatCard label="Current Tier" value={balance.tier.charAt(0).toUpperCase() + balance.tier.slice(1)} icon="T" />
        <StatCard label="Transactions" value={transactions.length} icon="X" sublabel="All time" />
        <StatCard
          label="Next Tier"
          value={nextTier ? nextTier.charAt(0).toUpperCase() + nextTier.slice(1) : 'Max'}
          icon="N"
          sublabel={nextTier ? `${nextTierPoints - balance.points} pts away` : 'Highest tier reached'}
        />
      </div>

      {/* Tier Progress */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Tier Progress</h2>
        <ProgressBar
          value={progressToNext}
          max={100}
          label={nextTier ? `Progress to ${nextTier.charAt(0).toUpperCase() + nextTier.slice(1)}` : 'Max tier reached'}
          showPercent
        />
        <div className="flex gap-6 text-sm mt-4">
          {Object.entries(TIER_THRESHOLD).map(([tier, pts]) => (
            <div key={tier} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                balance.tier === tier
                  ? tier === 'standard' ? 'bg-yellow-500' : tier === 'priority' ? 'bg-blue-500' : 'bg-purple-500'
                  : 'bg-gray-600'
              }`} />
              <span className="text-gray-400">{tier.charAt(0).toUpperCase() + tier.slice(1)} ({pts} pts)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards Catalogue */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Rewards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {REWARDS.map(reward => {
            const canAfford = balance.points >= reward.pointsCost;
            return (
              <div
                key={reward.id}
                className={`p-4 rounded-lg border transition-colors ${
                  canAfford ? 'border-gray-600 bg-gray-900' : 'border-gray-700 bg-gray-900 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-white">{reward.name}</p>
                  <span className="text-xs text-gray-500">{reward.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-yellow-400 font-medium">{reward.pointsCost} pts</span>
                  <button
                    onClick={() => handleRedeem(reward.id, reward.pointsCost)}
                    disabled={!canAfford || redeeming === reward.id}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      canAfford
                        ? 'bg-green-600 text-white hover:bg-green-500 disabled:opacity-50'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {redeeming === reward.id ? 'Redeeming...' : 'Redeem'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <EmptyState title="No transactions yet" description="Points will appear here when earned or redeemed." />
        ) : (
          <div className="space-y-2">
            {transactions.map(t => (
              <div key={t.id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">{t.description ?? 'Transaction'}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`text-sm font-semibold ${
                    t.type === 'earn' ? 'text-green-400' : t.type === 'redeem' ? 'text-blue-400' : t.type === 'expire' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {t.type === 'earn' ? '+' : '-'}{t.points}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_STYLES[t.type] ?? 'bg-gray-500/20 text-gray-400'}`}>
                    {t.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
