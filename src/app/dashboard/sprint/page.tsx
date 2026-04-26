'use client';

import SprintActivationPanel from '@/components/sprint/SprintActivationPanel';

export default function SprintPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Sprint Mode</h1>
        <p className="text-gray-400 text-sm mt-1">Activate 30-day elevated operating mode with boosted posting frequency and aggressive growth tactics.</p>
      </div>
      <SprintActivationPanel />
    </div>
  );
}
