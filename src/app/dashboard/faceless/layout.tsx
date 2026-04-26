'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * FacelessSectionNav — Sub-navigation for Faceless Channel section pages.
 * Provides links to all faceless sub-modules.
 * @module Faceless
 * @phase 4
 */

/**
 * Faceless section navigation items.
 */
const FACELESS_NAV = [
  { label: 'Overview', href: '/dashboard/faceless' },
  { label: 'Characters', href: '/dashboard/faceless/characters' },
  { label: 'Storyline', href: '/dashboard/faceless/storyline' },
  { label: 'Series Bible', href: '/dashboard/faceless/series-bible' },
  { label: 'Episodes', href: '/dashboard/faceless/episodes' },
  { label: 'Scenes', href: '/dashboard/faceless/scenes' },
  { label: 'Voice', href: '/dashboard/faceless/voice' },
  { label: 'Assembly', href: '/dashboard/faceless/assembly' },
  { label: 'Audience', href: '/dashboard/faceless/audience' },
  { label: 'Tracker', href: '/dashboard/faceless/episode-tracker' },
];

/**
 * FacelessLayout — Layout wrapper for all Faceless sub-pages.
 * Provides sub-navigation tabs above the page content.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Faceless page content
 * @returns {JSX.Element} Faceless section layout with sub-nav
 */
export default function FacelessLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const pathname = usePathname();

  return (
    <div>
      <nav className="flex gap-1 mb-6 border-b border-gray-700 pb-2 overflow-x-auto">
        {FACELESS_NAV.map((item) => {
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

