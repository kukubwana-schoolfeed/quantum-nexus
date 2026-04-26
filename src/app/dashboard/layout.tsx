import Sidebar from '@/components/shared/Sidebar';
import Header from '@/components/shared/Header';
import AiBubble from '@/components/shared/AiBubble';

/**
 * DashboardLayout — Layout wrapper for all dashboard pages.
 * Provides sidebar navigation, top header, main content area, and AI Bubble.
 * @module Platform Core
 * @phase 7
 */

/**
 * Dashboard layout component wrapping all /dashboard/* pages.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Dashboard page content
 * @returns {JSX.Element} Dashboard layout with sidebar and header
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <AiBubble />
    </div>
  );
}
