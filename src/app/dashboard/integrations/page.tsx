'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';

interface ConnectedPlatform {
  platform: string;
  connected: boolean;
  token_expires_at: string | null;
  updated_at: string | null;
}

const PLATFORMS = [
  { key: 'meta', name: 'Meta', emoji: '📘' },
  { key: 'google', name: 'Google', emoji: '🎬' },
  { key: 'tiktok', name: 'TikTok', emoji: '🎵' },
  { key: 'pinterest', name: 'Pinterest', emoji: '📌' },
] as const;

export default function IntegrationsPage() {
  const { data: connections, loading, error, refetch } = useApi<ConnectedPlatform[]>('/api/oauth/connections');
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === 'true') {
      setBanner({ type: 'success', message: 'Platform connected successfully!' });
      window.history.replaceState({}, '', '/dashboard/integrations');
    } else if (params.get('error')) {
      const err = params.get('error');
      const message = err === 'unknown_platform' ? 'Unknown platform.' : 'OAuth connection failed. Please try again.';
      setBanner({ type: 'error', message });
      window.history.replaceState({}, '', '/dashboard/integrations');
    }
  }, []);

  const connectedMap = new Map((connections ?? []).map((c) => [c.platform, c]));

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Integrations</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-1/2 mb-4" />
              <div className="h-4 bg-gray-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Integrations</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Integrations</h1>
        <p className="text-gray-400 text-sm mt-1">Connect your social media accounts to publish and manage content.</p>
      </div>

      {banner && (
        <div
          className={`px-4 py-3 rounded-lg text-sm ${
            banner.type === 'success'
              ? 'bg-green-900/50 border border-green-700 text-green-300'
              : 'bg-red-900/50 border border-red-700 text-red-300'
          }`}
        >
          {banner.message}
          <button
            onClick={() => setBanner(null)}
            className="ml-3 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLATFORMS.map(({ key, name, emoji }) => {
          const conn = connectedMap.get(key);
          const isConnected = conn?.connected ?? false;

          return (
            <div
              key={key}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{emoji}</span>
                  <h3 className="text-lg font-semibold text-white">{name}</h3>
                </div>
                {isConnected && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-900/50 text-green-400 border border-green-700 rounded-full">
                    Connected
                  </span>
                )}
              </div>

              <div className="mt-auto">
                {isConnected ? (
                  <button
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors cursor-not-allowed opacity-60"
                    disabled
                    title="Disconnect coming soon"
                  >
                    Disconnect
                  </button>
                ) : (
                  <a
                    href={`/api/oauth/connect/${key}`}
                    className="block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Connect
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
