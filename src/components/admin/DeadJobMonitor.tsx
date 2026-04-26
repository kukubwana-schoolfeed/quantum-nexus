'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function DeadJobMonitor(): JSX.Element {
  const deadJobs = MOCK_DATA.deadJobMonitor.getDeadJobs('t1', {});

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Dead Job Monitor</h3>
      <DataTable
        columns={[
          { header: 'Queue', key: 'queueName' },
          { header: 'Job Type', key: 'jobType' },
          { header: 'Error', key: 'errorMessage' },
          {
            header: 'Reviewed',
            key: 'reviewed',
            render: (val) => <StatusBadge status={val ? 'resolved' : 'failed'} />,
          },
          {
            header: 'Failed At',
            key: 'failedAt',
            render: (val) => new Date(String(val)).toLocaleDateString(),
          },
        ]}
        data={deadJobs as unknown as Record<string, unknown>[]}
        emptyMessage="No dead jobs"
      />
    </div>
  );
}
