'use client';

import QAConfirmationScreen from '@/components/seo-domination/QAConfirmationScreen';

export default function QATasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Q&amp;A Seeding Tasks</h1>
        <p className="text-gray-400 text-sm mt-1">Review and confirm Q&amp;A seeding tasks for SEO domination.</p>
      </div>
      <QAConfirmationScreen />
    </div>
  );
}
