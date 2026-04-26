'use client';

import { useState, useCallback } from 'react';
import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import type { BirthdayConfigDTO, BirthdayUpcomingDTO, BirthdayTokenDTO } from '@/lib/api/schema';

interface BirthdayData {
  config: BirthdayConfigDTO;
  upcoming: BirthdayUpcomingDTO;
}

function daysUntilLabel(days: number): string {
  if (days === 0) return 'Today!';
  if (days === 1) return 'Tomorrow';
  return `${days} days away`;
}

function daysUntilUrgency(days: number): 'urgent' | 'high' | 'normal' {
  if (days <= 3) return 'urgent';
  if (days <= 7) return 'high';
  return 'normal';
}

export default function BirthdaysPage(): JSX.Element {
  const { data, loading, error, refetch } = useApi<BirthdayData>('/api/customers/birthdays');

  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [redeemingToken, setRedeemingToken] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [generatedToken, setGeneratedToken] = useState<BirthdayTokenDTO | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  const generateToken = useCallback(async (customerId: string) => {
    setGeneratingFor(customerId);
    setActionError(null);
    try {
      const res = await fetch('/api/customers/birthdays/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });
      if (!res.ok) throw new Error('Token generation failed');
      const json = await res.json();
      if (!json.success && json.data === undefined) throw new Error(json.error ?? 'Token generation failed');
      setGeneratedToken(json.data ?? json);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to generate token');
    } finally {
      setGeneratingFor(null);
    }
  }, []);

  const redeemToken = useCallback(async () => {
    if (!tokenInput.trim()) return;
    setRedeemingToken(true);
    setActionError(null);
    setRedeemSuccess(false);
    try {
      const res = await fetch('/api/customers/birthdays/redeem-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });
      if (!res.ok) throw new Error('Redemption failed');
      const json = await res.json();
      if (!json.success && json.data === undefined) throw new Error(json.error ?? 'Redemption failed');
      setRedeemSuccess(true);
      setTokenInput('');
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to redeem token');
    } finally {
      setRedeemingToken(false);
    }
  }, [tokenInput, refetch]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Birthday Engine</h1>
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
          <h1 className="text-2xl font-bold text-white">Birthday Engine</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Birthday Engine</h1>
        </div>
        <EmptyState title="No birthday data found" description="Configure the birthday engine to get started." />
      </div>
    );
  }

  const { config, upcoming } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Birthday Engine</h1>
        <p className="text-gray-400 text-sm mt-1">Automate birthday greetings and special offers for your customers.</p>
      </div>

      {actionError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{actionError}</div>
      )}

      {redeemSuccess && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">Token redeemed successfully!</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Upcoming Birthdays" value={upcoming.count} icon="B" sublabel="Next 30 days" />
        <StatCard label="Auto-Send" value={config.autoSendEnabled ? 'Enabled' : 'Disabled'} icon="A" />
        <StatCard label="Days Before Send" value={config.daysBefore} icon="D" sublabel="Days in advance" />
        <StatCard label="Active Tokens" value={generatedToken && !generatedToken.redeemed ? 1 : 0} icon="T" sublabel="Unredeemed tokens" />
      </div>

      {/* Birthday Alerts */}
      {upcoming.upcoming.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Upcoming Birthday Alerts</h2>
          <div className="space-y-3">
            {upcoming.upcoming.map(b => {
              const urgency = daysUntilUrgency(b.daysUntil);
              const urgencyBorder = urgency === 'urgent' ? 'border-l-red-500 bg-red-500/5' : urgency === 'high' ? 'border-l-orange-500 bg-orange-500/5' : 'border-l-blue-500 bg-blue-500/5';
              const urgencyDot = urgency === 'urgent' ? 'bg-red-500' : urgency === 'high' ? 'bg-orange-500' : 'bg-blue-500';

              return (
                <div key={b.customerId} className={`rounded-lg border border-gray-700 border-l-2 p-4 ${urgencyBorder}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${urgencyDot}`} />
                      <div>
                        <p className="text-sm font-medium text-white">{b.firstName}</p>
                        <p className="text-xs text-gray-500">{daysUntilLabel(b.daysUntil)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={urgency === 'urgent' ? 'held' : urgency === 'high' ? 'pending_approval' : 'scheduled'} />
                      <button
                        onClick={() => generateToken(b.customerId)}
                        disabled={generatingFor === b.customerId}
                        className="px-3 py-1.5 bg-nexus-600 hover:bg-nexus-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        {generatingFor === b.customerId ? 'Generating...' : 'Send Offer'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Generated Token Display */}
      {generatedToken && (
        <div className="bg-nexus-500/5 rounded-lg border border-nexus-500/20 p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-nexus-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-nexus-400 text-sm font-bold">T</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">Birthday Token Generated</h3>
              <p className="text-gray-400 text-sm mt-1">{generatedToken.offerDescription}</p>
              <div className="mt-3 flex items-center gap-4">
                <div>
                  <span className="text-xs text-gray-500">Token Code</span>
                  <p className="text-sm font-mono text-nexus-300">{generatedToken.token}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Expires</span>
                  <p className="text-sm text-gray-300">{new Date(generatedToken.expiresAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Status</span>
                  <StatusBadge status={generatedToken.redeemed ? 'complete' : 'active'} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Auto-Send</label>
            <StatusBadge status={config.autoSendEnabled ? 'active' : 'held'} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Days Before Birthday</label>
            <p className="text-white text-lg font-semibold">{config.daysBefore} days</p>
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Offer Template</label>
            <p className="text-white text-sm">{config.offerTemplate}</p>
          </div>
        </div>
      </div>

      {/* Token Redemption */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Redeem Token</h2>
        <p className="text-gray-400 text-sm mb-4">Enter a customer's birthday token code to redeem their offer.</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={tokenInput}
            onChange={e => setTokenInput(e.target.value)}
            placeholder="Enter token code..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-nexus-500 font-mono"
          />
          <button
            onClick={redeemToken}
            disabled={redeemingToken || !tokenInput.trim()}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {redeemingToken ? 'Redeeming...' : 'Redeem'}
          </button>
        </div>
      </div>
    </div>
  );
}
