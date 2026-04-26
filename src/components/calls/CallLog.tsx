'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';

const calls = MOCK_DATA.inboundCallHandler.getCallLog('t1', {});

const columns = [
  {
    header: 'Time',
    key: 'timestamp',
    render: (v: unknown) => new Date(String(v ?? '')).toLocaleTimeString(),
  },
  { header: 'Caller', key: 'callerPhone' },
  { header: 'Duration', key: 'duration', render: (v: unknown) => `${String(v ?? 0)}s` },
  {
    header: 'Classification',
    key: 'classification',
    render: (v: unknown) => <StatusBadge status={String(v ?? '')} />,
  },
  {
    header: 'Handoff',
    key: 'handoffInitiated',
    render: (v: unknown) => (v ? <StatusBadge status="held" /> : <span className="text-xs text-gray-500">No</span>),
  },
];

export default function CallLog(): JSX.Element {
  const avgDuration = calls.length > 0 ? Math.round(calls.reduce((s, c) => s + c.duration, 0) / calls.length) : 0;
  const handoffs = calls.filter(c => c.handoffInitiated).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Calls" value={calls.length} icon="CALL" />
        <StatCard label="Avg Duration" value={`${avgDuration}s`} icon="TIME" />
        <StatCard label="Handoffs" value={handoffs} icon="HO" />
      </div>
      <DataTable
        columns={columns}
        data={calls as unknown as Record<string, unknown>[]}
        emptyMessage="No calls logged"
      />
    </div>
  );
}
