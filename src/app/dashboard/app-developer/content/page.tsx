'use client';

/**
 * App Content — Promotional content generation
 * Module: app-content-generator
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import type { ReleaseNotesDTO, GeneratedDescriptionDTO, ScreenshotGenerationDTO } from '@/lib/api/schema';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';

interface AppContentData {
  releaseNotes: ReleaseNotesDTO;
  description: GeneratedDescriptionDTO;
  screenshots: ScreenshotGenerationDTO;
}

export default function Page(): JSX.Element {
  const { data, loading, error, refetch } = useApi<AppContentData>('/api/app-developer/content');
  const releaseNotes = data?.releaseNotes ?? { version: '', content: '' };
  const description = data?.description ?? { content: '' };
  const screenshots = data?.screenshots ?? { urls: [] };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">App Content</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={3} />
        <SkeletonPanel />
        <SkeletonPanel />
        <SkeletonPanel />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">App Content</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">App Content</h1>
        <p className="text-sm text-gray-400 mt-1">
          Generate release notes, app descriptions, and promotional screenshots.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Release Notes Version"
          value={releaseNotes.version ?? '—'}
          icon="📋"
        />
        <StatCard
          label="Description Status"
          value="Generated"
          icon="📝"
        />
        <StatCard
          label="Screenshots"
          value={screenshots.urls?.length ?? 0}
          icon="🖼️"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Release Notes</h2>
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-5 space-y-3">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Version</span>
            <p className="text-white text-sm mt-1">{releaseNotes.version}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Content</span>
            <p className="text-gray-300 text-sm mt-1">{releaseNotes.content}</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors mt-2">
            Generate Release Notes
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Description Generator</h2>
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-5 space-y-3">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Generated Description</span>
            <p className="text-gray-300 text-sm mt-1">{description.content}</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors mt-2">
            Generate Description
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Screenshot Generator</h2>
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-5 space-y-3">
          {screenshots.urls?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {screenshots.urls.map((url: string, idx: number) => (
                <div
                  key={idx}
                  className="bg-gray-800 rounded-lg border border-gray-700 p-3 text-center"
                >
                  <span className="text-gray-400 text-xs">Screenshot {idx + 1}</span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-xs underline block mt-1"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No screenshots generated yet.</p>
          )}
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors mt-2">
            Generate Screenshots
          </button>
        </div>
      </div>
    </div>
  );
}
