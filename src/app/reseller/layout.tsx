import Link from 'next/link';

/**
 * ResellerLayout — Layout wrapper for all reseller/agency pages.
 * Provides reseller-specific navigation sidebar.
 * @module Reseller
 * @phase 1
 */

/**
 * Reseller navigation items.
 */
const RESELLER_NAV = [
  { label: 'Overview', href: '/reseller' },
  { label: 'Clients', href: '/reseller/clients' },
  { label: 'Pricing', href: '/reseller/pricing' },
];

/**
 * Reseller layout component wrapping all /reseller/* pages.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Reseller page content
 * @returns {JSX.Element} Reseller layout with navigation sidebar
 */
export default function ResellerLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <aside className="w-56 bg-gray-950 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-sm font-bold text-white">Reseller Dashboard</h1>
          <p className="text-xs text-gray-500">Agency Panel</p>
        </div>
        <nav className="flex-1 py-2">
          {RESELLER_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
}
