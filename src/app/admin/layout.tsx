import Link from 'next/link';

/**
 * AdminLayout — Layout wrapper for all super admin pages.
 * Provides admin-specific navigation and sidebar.
 * @module Admin
 * @phase 1
 */

/**
 * Admin navigation items for the super admin sidebar.
 */
const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Businesses', href: '/admin/businesses' },
  { label: 'Approvals', href: '/admin/approvals' },
  { label: 'Niche Research', href: '/admin/niches' },
  { label: 'App Publishing', href: '/admin/apps' },
  { label: 'Platform Health', href: '/admin/health' },
  { label: 'Costs', href: '/admin/costs' },
  { label: 'Dead Jobs', href: '/admin/dead-jobs' },
];

/**
 * Admin layout component wrapping all /admin/* pages.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Admin page content
 * @returns {JSX.Element} Admin layout with navigation sidebar
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <aside className="w-56 bg-gray-950 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-sm font-bold text-white">Super Admin</h1>
          <p className="text-xs text-gray-500">Quantum Leaf Software</p>
        </div>
        <nav className="flex-1 py-2">
          {ADMIN_NAV.map((item) => (
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
