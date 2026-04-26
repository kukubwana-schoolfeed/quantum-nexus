'use client';

import { useState, useMemo } from 'react';

export interface AppFeature {
  id: string;
  name: string;
  description: string;
  category: string;
  tierGate: 'basic' | 'growth' | 'pro' | 'enterprise';
}

export const AVAILABLE_FEATURES: AppFeature[] = [
  { id: 'push_notifications', name: 'Push Notifications', description: 'Send real-time notifications to users', category: 'Communication', tierGate: 'basic' },
  { id: 'in_app_messaging', name: 'In-App Messaging', description: 'Chat between business and customers', category: 'Communication', tierGate: 'growth' },
  { id: 'loyalty_program', name: 'Loyalty Program', description: 'Points, stamps, and rewards system', category: 'Engagement', tierGate: 'growth' },
  { id: 'online_ordering', name: 'Online Ordering', description: 'Accept orders directly through the app', category: 'Commerce', tierGate: 'pro' },
  { id: 'table_reservations', name: 'Table Reservations', description: 'Let customers book tables in-app', category: 'Commerce', tierGate: 'pro' },
  { id: 'menu_catalogue', name: 'Menu / Catalogue', description: 'Display your full menu or product catalogue', category: 'Content', tierGate: 'basic' },
  { id: 'photo_gallery', name: 'Photo Gallery', description: 'Showcase your business with photos', category: 'Content', tierGate: 'basic' },
  { id: 'customer_reviews', name: 'Customer Reviews', description: 'Collect and display reviews in-app', category: 'Reputation', tierGate: 'growth' },
  { id: 'geo_fencing', name: 'Geo-Fenced Offers', description: 'Trigger offers when customers are nearby', category: 'Marketing', tierGate: 'pro' },
  { id: 'qr_checkin', name: 'QR Check-In', description: 'Scan to check in, earn loyalty points', category: 'Engagement', tierGate: 'growth' },
  { id: 'analytics_dashboard', name: 'In-App Analytics', description: 'Usage stats and customer insights', category: 'Insights', tierGate: 'pro' },
  { id: 'custom_branding', name: 'Full Custom Branding', description: 'Remove all platform branding, 100% yours', category: 'Branding', tierGate: 'enterprise' },
  { id: 'white_label_apis', name: 'White-Label APIs', description: 'Integrate with your own backend systems', category: 'Integration', tierGate: 'enterprise' },
  { id: 'multi_location', name: 'Multi-Location Support', description: 'Manage multiple branches from one app', category: 'Commerce', tierGate: 'enterprise' },
  { id: 'social_feed', name: 'Social Feed', description: 'Embed your social media content', category: 'Content', tierGate: 'growth' },
  { id: 'appointment_booking', name: 'Appointment Booking', description: 'Book services or appointments in-app', category: 'Commerce', tierGate: 'pro' },
];

const TIER_LABELS: Record<string, string> = {
  basic: 'Basic+',
  growth: 'Growth+',
  pro: 'Pro+',
  enterprise: 'Enterprise',
};

const TIER_COLORS: Record<string, string> = {
  basic: 'bg-gray-500/20 text-gray-400',
  growth: 'bg-blue-500/20 text-blue-400',
  pro: 'bg-purple-500/20 text-purple-400',
  enterprise: 'bg-amber-500/20 text-amber-400',
};

interface FeatureSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  currentTier: string;
  onBack: () => void;
  onContinue: () => void;
}

export default function FeatureSelector({
  selectedIds,
  onChange,
  currentTier,
  onBack,
  onContinue,
}: FeatureSelectorProps): JSX.Element {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const map = new Map<string, AppFeature[]>();
    AVAILABLE_FEATURES.forEach((f) => {
      const list = map.get(f.category) ?? [];
      list.push(f);
      map.set(f.category, list);
    });
    return Array.from(map.entries());
  }, []);

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  };

  const selectedFeatures = AVAILABLE_FEATURES.filter((f) => selectedIds.includes(f.id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Select Features</h2>
        <p className="text-sm text-gray-400 mt-1">
          Choose which features to include in your app. Some features require a higher tier.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feature list */}
        <div className="lg:col-span-2 space-y-3">
          {categories.map(([category, features]) => {
            const isExpanded = expandedCategory === category || expandedCategory === null;
            return (
              <div key={category} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <button
                  onClick={() => setExpandedCategory(isExpanded && expandedCategory !== null ? null : category)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-800/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{category}</span>
                    <span className="text-xs text-gray-500">
                      {features.filter((f) => selectedIds.includes(f.id)).length}/{features.length}
                    </span>
                  </div>
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isExpanded && (
                  <div className="border-t border-gray-700 divide-y divide-gray-700/50">
                    {features.map((feature) => {
                      const isSelected = selectedIds.includes(feature.id);
                      return (
                        <button
                          key={feature.id}
                          onClick={() => toggle(feature.id)}
                          className={`w-full flex items-start gap-3 p-3 text-left transition-colors ${
                            isSelected ? 'bg-nexus-500/5' : 'hover:bg-gray-800/50'
                          }`}
                        >
                          <div className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'border-nexus-500 bg-nexus-500'
                              : 'border-gray-600'
                          }`}>
                            {isSelected && (
                              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white">{feature.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${TIER_COLORS[feature.tierGate]}`}>
                                {TIER_LABELS[feature.tierGate]}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{feature.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary sidebar */}
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sticky top-6">
            <h3 className="text-sm font-semibold text-white mb-3">
              Selected Features ({selectedIds.length})
            </h3>
            {selectedFeatures.length === 0 ? (
              <p className="text-xs text-gray-500">No features selected yet.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedFeatures.map((f) => (
                  <div key={f.id} className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">{f.name}</span>
                    <button
                      onClick={() => toggle(f.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          className="px-6 py-2 bg-nexus-700 text-white text-sm font-medium rounded-lg hover:bg-nexus-600 transition-colors"
        >
          Review &amp; Submit
        </button>
      </div>
    </div>
  );
}
