'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';

const invoices = MOCK_DATA.billingEngine.getInvoices('t1');

const columns = [
  {
    header: 'Invoice Date',
    key: 'invoiceDate',
    render: (v: unknown) => new Date(String(v ?? '')).toLocaleDateString(),
  },
  {
    header: 'Due Date',
    key: 'dueDate',
    render: (v: unknown) => new Date(String(v ?? '')).toLocaleDateString(),
  },
  {
    header: 'Amount (ZMW)',
    key: 'amountZmw',
    render: (v: unknown) => `K${Number(v ?? 0).toLocaleString()}`,
  },
  {
    header: 'Status',
    key: 'status',
    render: (v: unknown) => <StatusBadge status={String(v ?? '')} />,
  },
];

export default function InvoiceList(): JSX.Element {
  const totalDue = invoices.filter(i => i.status === 'unpaid').reduce((s, i) => s + i.amountZmw, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Invoices" value={invoices.length} icon="INV" />
        <StatCard label="Outstanding" value={`K${totalDue.toLocaleString()}`} trend="down" icon="DUE" />
        <StatCard label="Paid" value={invoices.filter(i => i.status === 'paid').length} icon="OK" />
      </div>
      <DataTable
        columns={columns}
        data={invoices as unknown as Record<string, unknown>[]}
        emptyMessage="No invoices"
      />
    </div>
  );
}
