'use client';

import { useState, useCallback } from 'react';
import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid } from '@/components/shared/Skeleton';
import NicheSelector from '@/components/app-builder/NicheSelector';
import AppConfigurator, { type AppConfig } from '@/components/app-builder/AppConfigurator';
import FeatureSelector, { AVAILABLE_FEATURES } from '@/components/app-builder/FeatureSelector';
import SubmissionStatus, { type SubmissionPhase } from '@/components/app-builder/SubmissionStatus';
import type { NicheDTO } from '@/lib/api/schema';

type WizardStep = 'niche' | 'configure' | 'features' | 'submit';

interface WizardState {
  niche: NicheDTO | null;
  config: AppConfig | null;
  featureIds: string[];
  submissionStatus: SubmissionPhase;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewerNotes: string | null;
}

const STEP_ORDER: WizardStep[] = ['niche', 'configure', 'features', 'submit'];
const STEP_LABELS: Record<WizardStep, string> = {
  niche: 'Niche',
  configure: 'Configure',
  features: 'Features',
  submit: 'Submit',
};

export default function AppBuilderPage(): JSX.Element {
  const { data: nichesData, loading, error, refetch } = useApi<NicheDTO[]>('/api/niches');
  const niches = nichesData ?? [];

  const [step, setStep] = useState<WizardStep>('niche');
  const [state, setState] = useState<WizardState>({
    niche: null,
    config: null,
    featureIds: [],
    submissionStatus: 'draft',
    submittedAt: null,
    reviewedAt: null,
    reviewerNotes: null,
  });

  const currentIdx = STEP_ORDER.indexOf(step);

  const goTo = useCallback((s: WizardStep) => setStep(s), []);

  const handleNicheSelect = useCallback((niche: NicheDTO) => {
    setState((prev) => ({ ...prev, niche }));
  }, []);

  const handleConfigSave = useCallback((config: AppConfig) => {
    setState((prev) => ({ ...prev, config }));
    setStep('features');
  }, []);

  const handleFeaturesContinue = useCallback(() => {
    setStep('submit');
  }, []);

  const handleSubmit = useCallback(() => {
    setState((prev) => ({
      ...prev,
      submissionStatus: 'submitted',
      submittedAt: new Date().toISOString(),
    }));
  }, []);

  const handleNewApp = useCallback(() => {
    setState({
      niche: null,
      config: null,
      featureIds: [],
      submissionStatus: 'draft',
      submittedAt: null,
      reviewedAt: null,
      reviewerNotes: null,
    });
    setStep('niche');
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">App Builder</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">App Builder</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">App Builder</h1>
        <p className="text-sm text-gray-400 mt-1">
          Create a white-label mobile app for your business in four steps.
        </p>
      </div>

      {/* Step indicator */}
      <nav className="flex items-center gap-1">
        {STEP_ORDER.map((s, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <div key={s} className="flex items-center">
              <button
                onClick={() => isCompleted && goTo(s)}
                disabled={!isCompleted}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isCurrent
                    ? 'bg-nexus-700 text-white font-medium'
                    : isCompleted
                      ? 'text-nexus-400 hover:bg-gray-800 cursor-pointer'
                      : 'text-gray-500 cursor-not-allowed'
                }`}
              >
                <span
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                        ? 'bg-nexus-500 text-white'
                        : 'bg-gray-700 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </span>
                {STEP_LABELS[s]}
              </button>
              {idx < STEP_ORDER.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${isCompleted ? 'bg-green-500' : 'bg-gray-700'}`} />
              )}
            </div>
          );
        })}
      </nav>

      {/* Selected niche pill */}
      {state.niche && step !== 'niche' && (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
          <span className="text-xs text-gray-400">Niche:</span>
          <span className="text-xs font-medium text-white">{state.niche.name}</span>
          <button
            onClick={() => goTo('niche')}
            className="text-xs text-nexus-400 hover:text-nexus-300 ml-1"
          >
            Change
          </button>
        </div>
      )}

      {/* Step content */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        {step === 'niche' && (
          <>
            <NicheSelector
              niches={niches}
              selectedId={state.niche?.id ?? null}
              onSelect={handleNicheSelect}
            />
            {state.niche && (
              <div className="flex justify-end mt-4 pt-4 border-t border-gray-800">
                <button
                  onClick={() => setStep('configure')}
                  className="px-6 py-2 bg-nexus-700 text-white text-sm font-medium rounded-lg hover:bg-nexus-600 transition-colors"
                >
                  Continue with {state.niche.name}
                </button>
              </div>
            )}
          </>
        )}

        {step === 'configure' && (
          <AppConfigurator
            initialConfig={state.config ?? undefined}
            onSave={handleConfigSave}
            onBack={() => setStep('niche')}
          />
        )}

        {step === 'features' && (
          <FeatureSelector
            selectedIds={state.featureIds}
            onChange={(ids) => setState((prev) => ({ ...prev, featureIds: ids }))}
            currentTier="pro"
            onBack={() => setStep('configure')}
            onContinue={handleFeaturesContinue}
          />
        )}

        {step === 'submit' && (
          <SubmissionStatus
            status={state.submissionStatus}
            submittedAt={state.submittedAt}
            reviewedAt={state.reviewedAt}
            reviewerNotes={state.reviewerNotes}
            appName={state.config?.name ?? ''}
            onBack={() => setStep('features')}
            onSubmit={handleSubmit}
            onNewApp={handleNewApp}
          />
        )}
      </div>

      {/* Summary panel when on submit step */}
      {step === 'submit' && state.config && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Configuration Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-gray-500">App Name</p>
              <p className="text-white font-medium mt-0.5">{state.config.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Platform</p>
              <p className="text-white font-medium mt-0.5 capitalize">{state.config.platform}</p>
            </div>
            <div>
              <p className="text-gray-500">Category</p>
              <p className="text-white font-medium mt-0.5">{state.config.category}</p>
            </div>
            <div>
              <p className="text-gray-500">Bundle ID</p>
              <p className="text-white font-medium mt-0.5 font-mono">{state.config.bundleId}</p>
            </div>
          </div>
          {state.featureIds.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-gray-500 text-xs mb-1">Features ({state.featureIds.length})</p>
              <div className="flex flex-wrap gap-1">
                {state.featureIds.map((id) => {
                  const feat = AVAILABLE_FEATURES.find((f) => f.id === id);
                  return feat ? (
                    <span key={id} className="text-[10px] px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                      {feat.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
