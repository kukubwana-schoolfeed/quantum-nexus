'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';

export default function InterviewChat(): JSX.Element {
  const steps = MOCK_DATA.onboardingEngine.getOnboardingState('t1');

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Onboarding Steps</h3>
      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center justify-between p-2 rounded bg-gray-900 border border-gray-700">
            <div>
              <p className="text-xs text-white">{step.label}</p>
              <p className="text-xs text-gray-500">{step.step.replace(/_/g, ' ')}</p>
            </div>
            <StatusBadge status={step.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
