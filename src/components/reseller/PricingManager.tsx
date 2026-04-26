'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';

export default function PricingManager(): JSX.Element {
  const pricing = MOCK_DATA.resellerDashboard.getPricing('t1');

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Pricing Tiers</h3>
      <div className="space-y-3">
        {pricing.tiers.map((tier) => (
          <div key={tier.id} className="p-3 rounded bg-gray-900 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-white font-medium">{tier.name}</span>
                <p className="text-xs text-gray-400 mt-0.5">
                  {tier.price === 0 ? 'Free' : `K${tier.price.toLocaleString()}/mo`}
                </p>
              </div>
              <StatusBadge status={tier.price === 0 ? 'draft' : 'active'} />
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {tier.features.map((f) => (
                <span key={f} className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                  {f}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
