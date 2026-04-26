'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * AppDeveloperSectionNav — Sub-navigation for App Developer section pages.
 * Provides links to all app developer sub-modules.
 * @module App Developer
 * @phase 3
 */

/**
 * App Developer section navigation items.
 */
const APP_DEV_NAV = [
  { label: 'Overview', href: '/dashboard/app-developer' },
  { label: 'Profile', href: '/dashboard/app-developer/profile' },
  { label: 'ASO', href: '/dashboard/app-developer/aso' },
  { label: 'Reviews', href: '/dashboard/app-developer/reviews' },
  { label: 'Content', href: '/dashboard/app-developer/content' },
  { label: 'Support', href: '/dashboard/app-developer/support' },
  { label: 'Revenue', href: '/dashboard/app-developer/revenue' },
  { label: 'Analytics', href: '/dashboard/app-developer/analytics' },
];

/**
 * AppDeveloperLayout — Layout wrapper for all App Developer sub-pages.
 * Provides sub-navigation tabs above the page content.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - App Developer page content
 * @returns {JSX.Element} App Developer section layout with sub-nav
 */
export default function AppDeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const pathname = usePathname();

  return (
    <div>
      <nav className="flex gap-1 mb-6 border-b border-gray-700 pb-2 overflow-x-auto">
        {APP_DEV_NAV.map((item) => {
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

