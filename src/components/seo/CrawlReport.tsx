'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import ProgressBar from '@/components/shared/ProgressBar';

const TENANT_ID = 't1';

export default function CrawlReport(): JSX.Element {
  const seo = MOCK_DATA.seoEngine.getSeoOverview(TENANT_ID);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Domain Authority" value={seo.domainAuthority} />
        <StatCard label="Indexed Pages" value={seo.indexedPages} />
        <StatCard label="Backlinks" value={seo.backlinks} />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-3">Crawl & Indexing Health</h3>
        <div className="space-y-3">
          <ProgressBar value={seo.domainAuthority} max={100} label="Domain Authority" />
          <ProgressBar value={seo.indexedPages} max={50} label="Indexed Pages (target: 50)" />
          <ProgressBar value={seo.backlinks} max={100} label="Backlinks (target: 100)" />
        </div>
      </div>
    </div>
  );
}
