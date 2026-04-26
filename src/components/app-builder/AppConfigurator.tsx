'use client';

import { useState } from 'react';
import type { WhiteLabelAppDTO } from '@/lib/api/schema';

export interface AppConfig {
  name: string;
  platform: 'android' | 'ios' | 'both';
  category: string;
  bundleId: string;
  iconUrl: string | null;
  primaryColor: string;
  description: string;
}

interface AppConfiguratorProps {
  initialConfig?: Partial<AppConfig>;
  onSave: (config: AppConfig) => void;
  onBack: () => void;
}

const CATEGORIES = [
  'Business',
  'Food & Drink',
  'Health & Fitness',
  'Lifestyle',
  'Shopping',
  'Services',
  'Education',
  'Entertainment',
];

const PLATFORM_OPTIONS: { value: AppConfig['platform']; label: string; desc: string }[] = [
  { value: 'android', label: 'Android', desc: 'Google Play Store' },
  { value: 'ios', label: 'iOS', desc: 'App Store' },
  { value: 'both', label: 'Both', desc: 'Android + iOS' },
];

export default function AppConfigurator({
  initialConfig,
  onSave,
  onBack,
}: AppConfiguratorProps): JSX.Element {
  const [config, setConfig] = useState<AppConfig>({
    name: initialConfig?.name ?? '',
    platform: initialConfig?.platform ?? 'android',
    category: initialConfig?.category ?? '',
    bundleId: initialConfig?.bundleId ?? '',
    iconUrl: initialConfig?.iconUrl ?? null,
    primaryColor: initialConfig?.primaryColor ?? '#6366f1',
    description: initialConfig?.description ?? '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AppConfig, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AppConfig, string>> = {};
    if (!config.name.trim()) newErrors.name = 'App name is required';
    if (!config.category) newErrors.category = 'Select a category';
    if (!config.bundleId.trim()) {
      newErrors.bundleId = 'Bundle ID is required';
    } else if (!/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*){2,}$/.test(config.bundleId)) {
      newErrors.bundleId = 'Format: com.company.appname';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave(config);
  };

  const update = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Configure Your App</h2>
        <p className="text-sm text-gray-400 mt-1">
          Set up your white-label mobile app details. All fields are required before submission.
        </p>
      </div>

      {/* App Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">App Name</label>
        <input
          type="text"
          value={config.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="e.g. Flame Grill Ordering"
          className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-nexus-500 focus:border-nexus-500 ${
            errors.name ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
      </div>

      {/* Platform */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
        <div className="grid grid-cols-3 gap-3">
          {PLATFORM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update('platform', opt.value)}
              className={`p-3 rounded-lg border text-center transition-all ${
                config.platform === opt.value
                  ? 'border-nexus-500 bg-nexus-500/10 ring-1 ring-nexus-500/50'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }`}
            >
              <span className="text-sm font-medium text-white block">{opt.label}</span>
              <span className="text-xs text-gray-400">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => update('category', cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                config.category === cat
                  ? 'bg-nexus-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {errors.category && <p className="text-xs text-red-400 mt-1">{errors.category}</p>}
      </div>

      {/* Bundle ID */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Bundle ID</label>
        <input
          type="text"
          value={config.bundleId}
          onChange={(e) => update('bundleId', e.target.value)}
          placeholder="com.theflamegrill.ordering"
          className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-sm text-white placeholder-gray-500 font-mono focus:outline-none focus:ring-1 focus:ring-nexus-500 focus:border-nexus-500 ${
            errors.bundleId ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.bundleId && <p className="text-xs text-red-400 mt-1">{errors.bundleId}</p>}
      </div>

      {/* Primary Color */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Brand Primary Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={config.primaryColor}
            onChange={(e) => update('primaryColor', e.target.value)}
            className="h-10 w-10 rounded border border-gray-700 bg-transparent cursor-pointer"
          />
          <input
            type="text"
            value={config.primaryColor}
            onChange={(e) => update('primaryColor', e.target.value)}
            className="w-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-nexus-500"
          />
          <div
            className="h-10 w-20 rounded-lg border border-gray-700"
            style={{ backgroundColor: config.primaryColor }}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">App Description</label>
        <textarea
          value={config.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Briefly describe what your app does..."
          rows={3}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-nexus-500 focus:border-nexus-500 resize-none"
        />
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
          onClick={handleSave}
          className="px-6 py-2 bg-nexus-700 text-white text-sm font-medium rounded-lg hover:bg-nexus-600 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
