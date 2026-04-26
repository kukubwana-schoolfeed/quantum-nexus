'use client';

import { useApi } from '@/lib/hooks/useApi';
import type { InvoiceDTO, PaymentStatusDTO } from '@/lib/api/schema';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function BillingPage() {
  const { data: invoices, loading: invoicesLoading, error: invoicesError, refetch: refetchInvoices } = useApi<InvoiceDTO[]>('/api/billing/invoices');
  const { data: paymentStatus, loading: paymentLoading, error: paymentError, refetch: refetchPayment } = useApi<PaymentStatusDTO>('/api/billing/payment-status');

  if (invoicesLoading || paymentLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
        <SkeletonTable />
      </div>
    );
  }

  if (invoicesError || paymentError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing</h1>
        </div>
        <ApiError message={invoicesError ?? paymentError ?? 'Failed to load data'} onRetry={() => { refetchInvoices(); refetchPayment(); }} />
      </div>
    );
  }

  const totalOwed = invoices?.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + i.amountZmw, 0) ?? 0;
  const unpaidCount = invoices?.filter(i => i.status === 'unpaid').length ?? 0;

  const columns = [
    { header: 'Invoice Date', key: 'invoiceDate', render: (value: unknown) =>
      new Date(String(value)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
    { header: 'Due Date', key: 'dueDate', render: (value: unknown) =>
      new Date(String(value)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
    { header: 'Amount (ZMW)', key: 'amountZmw', render: (value: unknown) =>
      `K${Number(value).toLocaleString()}` },
    { header: 'Status', key: 'status', render: (value: unknown) =>
      <StatusBadge status={String(value)} /> },
    { header: 'Actions', key: 'actions', render: (_: unknown, row: Record<string, unknown>) =>
      row.status === 'unpaid' ? (
        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
          Pay Now
        </button>
      ) : (
        <span className="text-gray-500 text-xs">--</span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-gray-400 text-sm mt-1">View invoices, track payments, and manage your subscription billing.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Payment Status" value={paymentStatus ? paymentStatus.status.charAt(0).toUpperCase() + paymentStatus.status.slice(1) : '—'} icon="💳" />
        <StatCard label="Outstanding" value={`K${totalOwed.toLocaleString()}`} icon="💰" sublabel="Unpaid invoices" />
        <StatCard label="Unpaid Invoices" value={unpaidCount} icon="📄" />
        <StatCard label="Next Due Date" value={paymentStatus ? new Date(paymentStatus.nextDueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'} icon="📅" />
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
          Generate Invoice
        </button>
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
          Payment History
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        {invoices && invoices.length > 0 ? (
          <DataTable columns={columns} data={invoices as unknown as Record<string, unknown>[]} emptyMessage="No invoices found." />
        ) : (
          <EmptyState title="No invoices yet" description="Invoices will appear here once billing activity begins." />
        )}
      </div>
    </div>
  );
}
