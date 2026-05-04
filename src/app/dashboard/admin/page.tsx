'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/lib/hooks/useApi';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import ApiError from '@/components/shared/ApiError';
import type { TenantSummaryDTO } from '@/lib/api/schema';

interface AuthMeResponse {
  sub: string | null;
  tenant_id: string | null;
  role: string | null;
  tier: string | null;
}

interface BusinessesResponse {
  stats: { totalTenants: number; activeTenants: number; totalRevenue: number; monthlyGrowth: number } | null;
  tenants: TenantSummaryDTO[];
}

export default function AdminDashboardPage(): JSX.Element | null {
  const router = useRouter();
  const { data: me, loading: meLoading } = useApi<AuthMeResponse>('/api/auth/me');
  const { data, loading, error, refetch } = useApi<BusinessesResponse>('/api/admin/businesses');

  useEffect(() => {
    if (!meLoading && me && me.tier !== 'internal') {
      router.push('/dashboard');
    }
  }, [me, meLoading, router]);

  if (meLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  if (me && me.tier !== 'internal') {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-400">Loading businesses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const tenants = data?.tenants ?? [];
  const totalBusinesses = tenants.length;
  const pendingApproval = tenants.filter((t) => t.status === 'pending_approval').length;
  const activeCount = tenants.filter((t) => t.status === 'active').length;

  async function handleApprove(tenantId: string) {
    await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId }),
    });
    refetch();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Manage platform businesses and approvals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Total Businesses</p>
          <p className="text-2xl font-bold text-white">{totalBusinesses}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-400">{pendingApproval}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Active</p>
          <p className="text-2xl font-bold text-green-400">{activeCount}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="px-4 py-3 border-b border-gray-700">
          <h2 className="text-sm font-semibold text-white">All Businesses</h2>
        </div>
        {tenants.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No businesses found" description="Businesses will appear here as they sign up." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3">Business Name</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Activated At</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-gray-700 hover:bg-gray-900/50">
                    <td className="px-4 py-3 text-white font-medium">{tenant.businessName}</td>
                    <td className="px-4 py-3 text-gray-300">{tenant.tier}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={tenant.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {tenant.activatedAt
                        ? new Date(tenant.activatedAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {tenant.status === 'pending_approval' ? (
                        <button
                          type="button"
                          onClick={() => handleApprove(tenant.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded transition-colors"
                        >
                          Approve
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
