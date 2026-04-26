'use client';

import { useState, useCallback } from 'react';
import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import { SkeletonPanel } from '@/components/shared/Skeleton';
import ProgressBar from '@/components/shared/ProgressBar';
import StatusBadge from '@/components/shared/StatusBadge';
import type { OnboardingStepDTO, CompletenessScoreDTO, NicheDTO, TierDTO } from '@/lib/api/schema';

interface OnboardingData {
  state: OnboardingStepDTO[];
  score: CompletenessScoreDTO;
}

const STEPS = [
  { key: 'business_info', label: 'Business Information', description: 'Tell us about your business' },
  { key: 'niche_selection', label: 'Niche Selection', description: 'Pick your industry niche' },
  { key: 'brand_voice', label: 'Brand Voice', description: 'Define your brand personality' },
  { key: 'services_pricing', label: 'Services & Pricing', description: 'Set up your offerings' },
  { key: 'platforms', label: 'Platform Connections', description: 'Connect social accounts' },
  { key: 'review', label: 'Review & Activate', description: 'Confirm and launch' },
] as const;

type StepKey = typeof STEPS[number]['key'];

interface FormData {
  businessName: string;
  businessType: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  nicheId: string;
  brandTone: string;
  brandValues: string;
  services: string;
  pricingModel: string;
  platforms: string[];
}

export default function OnboardingPage(): JSX.Element {
  const { data, loading, error, refetch } = useApi<OnboardingData>('/api/onboarding');
  const { data: niches } = useApi<NicheDTO[]>('/api/onboarding/niches');
  const { data: tiers } = useApi<TierDTO[]>('/api/onboarding/tiers');

  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    businessType: '',
    location: '',
    phone: '',
    email: '',
    website: '',
    nicheId: '',
    brandTone: '',
    brandValues: '',
    services: '',
    pricingModel: '',
    platforms: [],
  });

  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setSaveError(null);
  }, []);

  const togglePlatform = useCallback((platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }));
    setSaveError(null);
  }, []);

  const saveStep = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const stepKey = STEPS[currentStep].key;
      const res = await fetch('/api/onboarding/save-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: stepKey, data: formData }),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Save failed');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save step');
      return false;
    } finally {
      setSaving(false);
    }
    return true;
  }, [currentStep, formData]);

  const handleNext = useCallback(async () => {
    const ok = await saveStep();
    if (ok && currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [saveStep, currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  }, [currentStep]);

  const handleComplete = useCallback(async () => {
    const ok = await saveStep();
    if (!ok) return;
    setCompleting(true);
    try {
      const res = await fetch('/api/onboarding/complete', { method: 'POST' });
      if (!res.ok) throw new Error(`Complete failed: ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Complete failed');
      setCompleted(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to complete onboarding');
    } finally {
      setCompleting(false);
    }
  }, [saveStep]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Welcome to Quantum Nexus</h1>
            <p className="text-gray-400 mt-2">Loading...</p>
          </div>
          <SkeletonPanel />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Welcome to Quantum Nexus</h1>
          </div>
          <ApiError message={error} onRetry={refetch} />
        </div>
      </div>
    );
  }

  const score = data?.score;
  const steps = data?.state ?? [];
  const stepStatusMap = Object.fromEntries(steps.map(s => [s.step, s.status]));

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="w-full max-w-lg text-center space-y-6">
          <div className="w-16 h-16 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-3xl font-bold text-white">You&apos;re All Set!</h1>
          <p className="text-gray-400">Your business is now active on Quantum Nexus. Head to your dashboard to start creating content and growing your presence.</p>
          <a href="/dashboard" className="inline-block px-6 py-3 bg-nexus-600 hover:bg-nexus-500 text-white font-medium rounded-lg transition-colors">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Welcome to Quantum Nexus</h1>
          <p className="text-gray-400 mt-2">Let&apos;s set up your business. This takes about 5 minutes.</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">Step {currentStep + 1} of {STEPS.length}</span>
            <span className="text-sm text-nexus-400">{Math.round(((currentStep + 1) / STEPS.length) * 100)}%</span>
          </div>
          <ProgressBar value={Math.round(((currentStep + 1) / STEPS.length) * 100)} />
        </div>

        {/* Step Indicator */}
        <div className="flex gap-1">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => i <= currentStep && setCurrentStep(i)}
              className={`flex-1 h-2 rounded-full transition-colors ${
                i < currentStep ? 'bg-nexus-500' : i === currentStep ? 'bg-nexus-400' : 'bg-gray-700'
              }`}
              title={s.label}
            />
          ))}
        </div>

        {/* Completeness Score (collapsed) */}
        {score && (
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 text-xs">
            <span className="text-gray-400">Completeness</span>
            <span className="text-nexus-400 font-semibold">{score.overall}%</span>
            <div className="flex gap-3">
              <span className="text-gray-500">Content: <StatusBadge status={score.unlocks.content_generation ? 'active' : 'held'} /></span>
              <span className="text-gray-500">Publish: <StatusBadge status={score.unlocks.publishing ? 'active' : 'held'} /></span>
              <span className="text-gray-500">Analytics: <StatusBadge status={score.unlocks.analytics ? 'active' : 'held'} /></span>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-1">{STEPS[currentStep].label}</h2>
          <p className="text-gray-400 text-sm mb-6">{STEPS[currentStep].description}</p>

          {currentStep === 0 && <StepBusinessInfo formData={formData} updateField={updateField} />}
          {currentStep === 1 && <StepNicheSelection niches={niches} formData={formData} updateField={updateField} />}
          {currentStep === 2 && <StepBrandVoice formData={formData} updateField={updateField} />}
          {currentStep === 3 && <StepServicesPricing tiers={tiers} formData={formData} updateField={updateField} />}
          {currentStep === 4 && <StepPlatforms formData={formData} togglePlatform={togglePlatform} />}
          {currentStep === 5 && <StepReview formData={formData} niches={niches} stepStatusMap={stepStatusMap} />}

          {saveError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {saveError}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>
          <div className="flex gap-3">
            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={saving}
                className="px-6 py-2 bg-nexus-600 hover:bg-nexus-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Next'}
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {completing ? 'Activating...' : 'Complete & Activate'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 1: Business Info ────────────────────────────────────────────── */

function StepBusinessInfo({ formData, updateField }: { formData: FormData; updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Business Name" value={formData.businessName} onChange={v => updateField('businessName', v)} placeholder="e.g. The Flame Grill" />
      <Field label="Business Type" value={formData.businessType} onChange={v => updateField('businessType', v)} placeholder="e.g. Restaurant, Salon, Gym" />
      <Field label="Location" value={formData.location} onChange={v => updateField('location', v)} placeholder="e.g. Cairo Road, Lusaka, Zambia" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Phone" value={formData.phone} onChange={v => updateField('phone', v)} placeholder="+260 97 123 4567" />
        <Field label="Email" value={formData.email} onChange={v => updateField('email', v)} placeholder="info@example.co.zm" />
      </div>
      <Field label="Website (optional)" value={formData.website} onChange={v => updateField('website', v)} placeholder="https://example.co.zm" />
    </div>
  );
}

/* ─── Step 2: Niche Selection ────────────────────────────────────────────── */

function StepNicheSelection({ niches, formData, updateField }: { niches: NicheDTO[] | null; formData: FormData; updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm">Select the niche that best describes your business.</p>
      {niches ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {niches.map(niche => (
            <button
              key={niche.id}
              onClick={() => updateField('nicheId', niche.id)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                formData.nicheId === niche.id
                  ? 'bg-nexus-500/15 border-nexus-500/50 ring-1 ring-nexus-500/30'
                  : 'bg-gray-900 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{niche.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  niche.competitionLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                  niche.competitionLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {niche.competitionLevel} competition
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">Trend Score</span>
                <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-nexus-500 rounded-full" style={{ width: `${niche.trendScore}%` }} />
                </div>
                <span className="text-xs text-nexus-400">{niche.trendScore}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-sm">Loading niches...</div>
      )}
    </div>
  );
}

/* ─── Step 3: Brand Voice ────────────────────────────────────────────── */

const TONE_OPTIONS = ['Professional', 'Friendly & Casual', 'Bold & Energetic', 'Warm & Nurturing', 'Luxury & Premium', 'Playful & Fun'] as const;

function StepBrandVoice({ formData, updateField }: { formData: FormData; updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Brand Tone</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TONE_OPTIONS.map(tone => (
            <button
              key={tone}
              onClick={() => updateField('brandTone', tone)}
              className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                formData.brandTone === tone
                  ? 'bg-nexus-500/15 border-nexus-500/50 text-nexus-300'
                  : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Brand Values</label>
        <textarea
          value={formData.brandValues}
          onChange={e => updateField('brandValues', e.target.value)}
          placeholder="e.g. Quality, Community, Authenticity, Sustainability"
          rows={3}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-nexus-500 resize-none"
        />
      </div>
    </div>
  );
}

/* ─── Step 4: Services & Pricing ────────────────────────────────────── */

function StepServicesPricing({ tiers, formData, updateField }: { tiers: TierDTO[] | null; formData: FormData; updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Services / Products" value={formData.services} onChange={v => updateField('services', v)} placeholder="e.g. Dine-in, Takeaway, Catering, Events" multiline />
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Pricing Model</label>
        <select
          value={formData.pricingModel}
          onChange={e => updateField('pricingModel', e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-nexus-500"
        >
          <option value="">Select pricing model</option>
          <option value="fixed">Fixed Price</option>
          <option value="variable">Variable / Custom Quotes</option>
          <option value="subscription">Subscription / Membership</option>
          <option value="freemium">Freemium / Tiered</option>
        </select>
      </div>
      {tiers && tiers.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Platform Tier</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tiers.map(tier => (
              <div key={tier.id} className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{tier.name}</span>
                  <span className="text-sm text-nexus-400">K{tier.price.toLocaleString()}/mo</span>
                </div>
                <ul className="mt-2 space-y-1">
                  {tier.features.map(f => (
                    <li key={f} className="text-xs text-gray-500 flex items-center gap-1.5">
                      <span className="text-nexus-500">&#10003;</span> {f.replace(/_/g, ' ')}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Step 5: Platforms ────────────────────────────────────────────── */

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', color: 'bg-pink-500/20 border-pink-500/40' },
  { id: 'facebook', name: 'Facebook', color: 'bg-blue-500/20 border-blue-500/40' },
  { id: 'tiktok', name: 'TikTok', color: 'bg-gray-300/20 border-gray-300/40' },
  { id: 'youtube', name: 'YouTube', color: 'bg-red-500/20 border-red-500/40' },
  { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700/20 border-blue-700/40' },
  { id: 'pinterest', name: 'Pinterest', color: 'bg-red-600/20 border-red-600/40' },
  { id: 'reddit', name: 'Reddit', color: 'bg-orange-500/20 border-orange-500/40' },
  { id: 'whatsapp', name: 'WhatsApp (Business)', color: 'bg-green-500/20 border-green-500/40' },
] as const;

function StepPlatforms({ formData, togglePlatform }: { formData: FormData; togglePlatform: (platform: string) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm">Select the platforms you want to connect. You can add more later.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PLATFORMS.map(p => {
          const selected = formData.platforms.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => togglePlatform(p.id)}
              className={`p-4 rounded-lg border text-center transition-colors ${
                selected
                  ? `${p.color} ring-1 ring-white/20`
                  : 'bg-gray-900 border-gray-700 hover:border-gray-600'
              }`}
            >
              <span className="block text-sm font-medium text-white">{p.name}</span>
              <span className={`block text-xs mt-1 ${selected ? 'text-nexus-300' : 'text-gray-500'}`}>
                {selected ? 'Selected' : 'Not connected'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Step 6: Review ────────────────────────────────────────────── */

function StepReview({ formData, niches, stepStatusMap }: { formData: FormData; niches: NicheDTO[] | null; stepStatusMap: Record<string, string> }) {
  const selectedNiche = niches?.find(n => n.id === formData.nicheId);

  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm">Review your information before activating your account.</p>

      <ReviewSection title="Business Information" status={stepStatusMap['business_info']}>
        <ReviewRow label="Business Name" value={formData.businessName || '—'} />
        <ReviewRow label="Type" value={formData.businessType || '—'} />
        <ReviewRow label="Location" value={formData.location || '—'} />
        <ReviewRow label="Phone" value={formData.phone || '—'} />
        <ReviewRow label="Email" value={formData.email || '—'} />
      </ReviewSection>

      <ReviewSection title="Niche" status={stepStatusMap['niche_selection']}>
        <ReviewRow label="Selected Niche" value={selectedNiche?.name ?? (formData.nicheId || '—')} />
      </ReviewSection>

      <ReviewSection title="Brand Voice" status={stepStatusMap['brand_voice']}>
        <ReviewRow label="Tone" value={formData.brandTone || '—'} />
        <ReviewRow label="Values" value={formData.brandValues || '—'} />
      </ReviewSection>

      <ReviewSection title="Services & Pricing" status={stepStatusMap['services_pricing']}>
        <ReviewRow label="Services" value={formData.services || '—'} />
        <ReviewRow label="Pricing Model" value={formData.pricingModel || '—'} />
      </ReviewSection>

      <ReviewSection title="Platforms" status={stepStatusMap['platforms']}>
        <div className="flex flex-wrap gap-2">
          {formData.platforms.length > 0
            ? formData.platforms.map(p => (
              <span key={p} className="px-2 py-1 bg-nexus-500/15 border border-nexus-500/30 rounded text-xs text-nexus-300 capitalize">{p}</span>
            ))
            : <span className="text-gray-500 text-xs">No platforms selected</span>
          }
        </div>
      </ReviewSection>
    </div>
  );
}

/* ─── Shared Field Component ─────────────────────────────────────── */

function Field({ label, value, onChange, placeholder, multiline }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) {
  const cls = 'w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-nexus-500';
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={`${cls} resize-none`} />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}

function ReviewSection({ title, status, children }: { title: string; status?: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {status && <StatusBadge status={status} />}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm text-gray-300">{value}</span>
    </div>
  );
}
