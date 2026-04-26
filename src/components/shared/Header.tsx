'use client';

import { useApi } from '@/lib/hooks/useApi';
import type { GbpProfileDTO } from '@/lib/api/schema';
import NotificationCenter from '@/components/notification/NotificationCenter';

export default function Header(): JSX.Element {
  const { data: profile } = useApi<GbpProfileDTO>('/api/gbp');
  const businessName = profile?.name ?? '';

  return (
    <header className="h-16 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-6">
      <div>
        <h2 className="text-sm text-gray-400">
          <span className="text-white font-medium">{businessName}</span>
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <NotificationCenter />
        <div className="h-8 w-8 rounded-full bg-nexus-700 flex items-center justify-center text-white text-sm font-medium">
          U
        </div>
      </div>
    </header>
  );
}
