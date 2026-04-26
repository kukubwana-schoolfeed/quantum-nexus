'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * SidebarItem — Defines a single navigation item in the dashboard sidebar.
 * @module Shared
 * @phase 1
 */
interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  group: string;
}

/**
 * Sidebar navigation items grouped by module category.
 * Each item maps to a module page in the dashboard.
 */
const NAV_ITEMS: SidebarItem[] = [
  { label: 'Mission Control', href: '/dashboard', icon: '◈', group: 'Overview' },
  { label: 'SEO', href: '/dashboard/seo', icon: '◉', group: 'Growth' },
  { label: 'SEO Domination', href: '/dashboard/seo-domination', icon: '◆', group: 'Growth' },
  { label: 'Content', href: '/dashboard/content', icon: '◧', group: 'Growth' },
  { label: 'Social Media', href: '/dashboard/social', icon: '◎', group: 'Growth' },
  { label: 'Trends', href: '/dashboard/trends', icon: '▲', group: 'Growth' },
  { label: 'Audit', href: '/dashboard/audit', icon: '▤', group: 'Growth' },
  { label: 'Entity Builder', href: '/dashboard/entity', icon: '▦', group: 'Growth' },
  { label: 'Customers', href: '/dashboard/customers', icon: '⚇', group: 'Retention' },
  { label: 'Birthdays', href: '/dashboard/birthdays', icon: '★', group: 'Retention' },
  { label: 'Loyalty', href: '/dashboard/loyalty', icon: '♦', group: 'Retention' },
  { label: 'Reviews', href: '/dashboard/reviews', icon: '✦', group: 'Retention' },
  { label: 'Health Score', href: '/dashboard/health-score', icon: '♥', group: 'Retention' },
  { label: 'Knowledge Base', href: '/dashboard/knowledge', icon: '🕮', group: 'Retention' },
  { label: 'Broadcasts', href: '/dashboard/broadcasts', icon: '◉', group: 'Outreach' },
  { label: 'Sales', href: '/dashboard/sales', icon: '▶', group: 'Outreach' },
  { label: 'Campaigns', href: '/dashboard/campaigns', icon: '⚑', group: 'Outreach' },
  { label: 'Lead Magnets', href: '/dashboard/lead-magnets', icon: '◈', group: 'Outreach' },
  { label: 'GBP', href: '/dashboard/gbp', icon: '▣', group: 'Outreach' },
  { label: 'Calls', href: '/dashboard/calls', icon: '☏', group: 'Outreach' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: '◫', group: 'Insights' },
  { label: 'Competitors', href: '/dashboard/competitors', icon: '⊞', group: 'Insights' },
  { label: 'Approval Queue', href: '/dashboard/approval', icon: '☑', group: 'Settings' },
  { label: 'Billing', href: '/dashboard/billing', icon: '⊡', group: 'Settings' },
  { label: 'Integrations', href: '/dashboard/integrations', icon: '⚙', group: 'Settings' },
  { label: 'Notifications', href: '/dashboard/notifications', icon: '⊡', group: 'Settings' },
  { label: 'Sprint Mode', href: '/dashboard/sprint', icon: '⚡', group: 'Settings' },
  { label: 'App Builder', href: '/dashboard/app-builder', icon: '◧', group: 'Apps' },
  { label: 'Community', href: '/dashboard/community', icon: '⋑', group: 'Apps' },
  { label: 'Reputation', href: '/dashboard/reputation', icon: 'shield', group: 'Insights' },
  { label: 'UGC Studio', href: '/dashboard/ugc', icon: '▷', group: 'Creator' },
  { label: 'Faceless Studio', href: '/dashboard/faceless', icon: '▻', group: 'Creator' },
  { label: 'App Developer', href: '/dashboard/app-developer', icon: '◧', group: 'Developer' },
];

/**
 * Sidebar — Dashboard navigation sidebar component.
 * Renders grouped navigation links for all dashboard modules.
 * Highlights the currently active route.
 * @module Shared
 * @phase 1
 * @returns {JSX.Element} Sidebar navigation component
 */
export default function Sidebar(): JSX.Element {
  const pathname = usePathname();

  const grouped = NAV_ITEMS.reduce<Record<string, SidebarItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <aside className="w-64 min-h-screen bg-gray-950 text-gray-300 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-lg font-bold text-white">Quantum Nexus</h1>
        <p className="text-xs text-gray-500 mt-1">AI Business Operating System</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="mb-4">
            <p className="px-4 py-1 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {group}
            </p>
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-nexus-700/30 text-white border-r-2 border-nexus-400'
                      : 'hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
