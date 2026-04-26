'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function CharacterBuilder(): JSX.Element {
  const characters = MOCK_DATA.facelessCharacterStudio.getCharacters('t1');
  const activeCount = characters.filter(c => c.isActive).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Characters" value={characters.length} />
        <StatCard label="Active" value={activeCount} />
      </div>
      <DataTable
        columns={[
          { header: 'Name', key: 'name' },
          { header: 'Personality', key: 'personality' },
          { header: 'Voice ID', key: 'voiceId' },
          { header: 'Avatar', key: 'avatarStyle' },
          {
            header: 'Status', key: 'isActive',
            render: (val) => <StatusBadge status={val ? 'active' : 'draft'} />,
          },
        ]}
        data={characters as unknown as Record<string, unknown>[]}
        emptyMessage="No characters created yet"
      />
    </div>
  );
}
