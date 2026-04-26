'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import DataTable from '@/components/shared/DataTable';

export default function SeriesBible(): JSX.Element {
  const bibles = MOCK_DATA.facelessSeriesBible.getBibles('t1');

  return (
    <div className="space-y-4">
      <DataTable
        columns={[
          { header: 'Storyline', key: 'storylineId' },
          {
            header: 'World Rules', key: 'worldRules',
            render: (val) => <span className="text-gray-400 text-xs">{String(val).slice(0, 60)}...</span>,
          },
          {
            header: 'Themes', key: 'recurringThemes',
            render: (val) => (
              <div className="flex gap-1 flex-wrap">
                {(val as string[]).map((t: string) => (
                  <span key={t} className="bg-purple-500/20 text-purple-400 text-xs px-1.5 py-0.5 rounded">{t}</span>
                ))}
              </div>
            ),
          },
          {
            header: 'Tone', key: 'toneNotes',
            render: (val) => <span className="text-gray-400 text-xs">{String(val).slice(0, 40)}</span>,
          },
        ]}
        data={bibles as unknown as Record<string, unknown>[]}
        emptyMessage="No series bibles created yet"
      />
    </div>
  );
}
