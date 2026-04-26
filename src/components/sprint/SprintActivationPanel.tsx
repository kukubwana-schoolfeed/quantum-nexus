'use client';

import { useState, useCallback } from 'react';
import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import { SkeletonPanel } from '@/components/shared/Skeleton';
import ProgressBar from '@/components/shared/ProgressBar';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import type { SprintModeConfigDTO } from '@/lib/api/schema';

export default function SprintActivationPanel(): JSX.Element {
  const { data: config, loading, error, refetch } = useApi<SprintModeConfigDTO>('/api/sprint');
  const [activating, setActivating] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<'activate' | 'deactivate' | null>(null);

  const handleActivate = useCallback(async () => {
    setActivating(true);
    setActionError(null);
    try {
      const res = await fetch('/api/sprint/activate', { method: 'POST' });
      if (!res.ok) throw new Error(`Activate failed: ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Activate failed');
      setShowConfirm(null);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to activate sprint');
    } finally {
      setActivating(false);
    }
  }, [refetch]);

  const handleDeactivate = useCallback(async () => {
    setDeactivating(true);
    setActionError(null);
    try {
      const res = await fetch('/api/sprint/deactivate', { method: 'POST' });
      if (!res.ok) throw new Error(`Deactivate failed: ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Deactivate failed');
      setShowConfirm(null);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to deactivate sprint');
    } finally {
      setDeactivating(false);
    }
  }, [refetch]);

  if (loading) {
    return <SkeletonPanel />;
  }

  if (error) {
    return <ApiError message={error} onRetry={refetch} />;
  }

  if (!config) return <></>;

  const endsAt = new Date(config.endsAt);
  const now = new Date();
  const totalDays = 30;
  const daysRemaining = Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const daysElapsed = totalDays - daysRemaining;
  const sprintProgress = Math.min(100, (daysElapsed / totalDays) * 100);

  return (
    <div className="space-y-6">
      {actionError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {actionError}
        </div>
      )}

      {/* Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Sprint Status" value={config.active ? 'Active' : 'Inactive'} icon="S" sublabel={config.active ? 'Elevated mode running' : 'Normal mode'} />
        <StatCard label="Posting Multiplier" value={`${config.postingMultiplier}x`} icon="M" sublabel="Content output boost" />
        <StatCard label="Days Remaining" value={daysRemaining} icon="D" sublabel={`Of ${totalDays}-day sprint`} />
        <StatCard label="Trend Check" value={config.trendCheckFrequency.charAt(0).toUpperCase() + config.trendCheckFrequency.slice(1)} icon="T" />
      </div>

      {/* Sprint Progress */}
      {config.active && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Sprint Progress</h2>
          <ProgressBar value={sprintProgress} label={`${daysElapsed} days elapsed / ${totalDays} total`} showPercent />
          <p className="text-gray-500 text-sm mt-2">
            Sprint ends on {endsAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      )}

      {/* Configuration */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Active</label>
            <StatusBadge status={config.active ? 'active' : 'held'} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Posting Multiplier</label>
            <p className="text-white text-lg font-semibold">{config.postingMultiplier}x</p>
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Clip Extraction</label>
            <p className="text-white">{config.clipExtractionMode.charAt(0).toUpperCase() + config.clipExtractionMode.slice(1)}</p>
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Comment Response</label>
            <p className="text-white">{config.commentResponseSpeed.charAt(0).toUpperCase() + config.commentResponseSpeed.slice(1)}</p>
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Trend Check</label>
            <p className="text-white">{config.trendCheckFrequency.charAt(0).toUpperCase() + config.trendCheckFrequency.slice(1)}</p>
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Warmup Override</label>
            <StatusBadge status={config.warmupOverride ? 'active' : 'held'} />
          </div>
        </div>
      </div>

      {/* Sprint Details Card (when active) */}
      {config.active && (
        <div className="bg-nexus-500/5 rounded-lg border border-nexus-500/20 p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-nexus-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-nexus-400 text-sm font-bold">S</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Sprint Mode Active</h3>
              <p className="text-gray-400 text-sm mt-1">
                Your account is in 30-day elevated mode. Posting frequency is boosted to {config.postingMultiplier}x, trend checks run {config.trendCheckFrequency}, and clip extraction is set to {config.clipExtractionMode}.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Sprint mode automatically ends after 30 days. All configurations revert to sustainable defaults.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Activation / Deactivation */}
      <div className="flex gap-3">
        {config.active ? (
          <>
            <button
              onClick={() => setShowConfirm('deactivate')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
            >
              Deactivate Sprint
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowConfirm('activate')}
            className="px-4 py-2 bg-nexus-600 hover:bg-nexus-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Activate Sprint
          </button>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full space-y-4">
            {showConfirm === 'activate' ? (
              <>
                <h3 className="text-lg font-semibold text-white">Activate Sprint Mode?</h3>
                <p className="text-gray-400 text-sm">
                  This will activate 30-day elevated mode with:
                </p>
                <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                  <li>Boosted posting frequency (2.5x)</li>
                  <li>Daily trend checks</li>
                  <li>Maximum clip extraction</li>
                  <li>Response to every comment</li>
                </ul>
                <p className="text-gray-500 text-xs">
                  Sprint mode automatically ends after 30 days and reverts to sustainable defaults.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-white">Deactivate Sprint Mode?</h3>
                <p className="text-gray-400 text-sm">
                  This will end your sprint early and revert to sustainable posting frequency. Any scheduled content will remain but at normal priority.
                </p>
              </>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={showConfirm === 'activate' ? handleActivate : handleDeactivate}
                disabled={activating || deactivating}
                className={`flex-1 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                  showConfirm === 'activate' ? 'bg-nexus-600 hover:bg-nexus-500' : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                {activating ? 'Activating...' : deactivating ? 'Deactivating...' : showConfirm === 'activate' ? 'Activate' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
