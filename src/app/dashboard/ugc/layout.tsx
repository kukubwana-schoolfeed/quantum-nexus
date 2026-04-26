'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * UGCSectionNav — Sub-navigation for UGC section pages.
 * Provides links to all UGC sub-modules.
 * @module UGC
 * @phase 3
 */

/**
 * UGC section navigation items.
 */
const UGC_NAV = [
  { label: 'Overview', href: '/dashboard/ugc' },
  { label: 'Upload', href: '/dashboard/ugc/upload' },
  { label: 'Clips', href: '/dashboard/ugc/clips' },
  { label: 'Calendar', href: '/dashboard/ugc/calendar' },
  { label: 'Trends', href: '/dashboard/ugc/trends' },
  { label: 'Performance', href: '/dashboard/ugc/performance' },
  { label: 'Monetisation', href: '/dashboard/ugc/monetisation' },
  { label: 'Podcast', href: '/dashboard/ugc/podcast' },
];

/**
 * UGCLayout — Layout wrapper for all UGC sub-pages.
 * Provides sub-navigation tabs above the page content.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - UGC page content
 * @returns {JSX.Element} UGC section layout with sub-nav
 */
export default function UGCLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const pathname = usePathname();

  return (
    <div>
      <nav className="flex gap-1 mb-6 border-b border-gray-700 pb-2 overflow-x-auto">
        {UGC_NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 text-xs rounded-md whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-nexus-700/30 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}

