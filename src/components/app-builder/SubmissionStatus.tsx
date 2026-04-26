'use client';

import { useMemo } from 'react';
import StatusBadge from '@/components/shared/StatusBadge';

export type SubmissionPhase = 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';

interface SubmissionStep {
  key: SubmissionPhase;
  label: string;
  description: string;
}

const STEPS: SubmissionStep[] = [
  { key: 'draft', label: 'Draft', description: 'Configure your app details and features' },
  { key: 'submitted', label: 'Submitted', description: 'App submitted for review' },
  { key: 'in_review', label: 'In Review', description: 'Our team is reviewing your submission' },
  { key: 'approved', label: 'Approved', description: 'App approved and ready for publishing' },
];

interface SubmissionStatusProps {
  status: SubmissionPhase;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewerNotes: string | null;
  appName: string;
  onBack: () => void;
  onSubmit: () => void;
  onNewApp: () => void;
}

export default function SubmissionStatus({
  status,
  submittedAt,
  reviewedAt,
  reviewerNotes,
  appName,
  onBack,
  onSubmit,
  onNewApp,
}: SubmissionStatusProps): JSX.Element {
  const currentStepIndex = useMemo(() => {
    if (status === 'rejected') return 2;
    return STEPS.findIndex((s) => s.key === status);
  }, [status]);

  const isRejected = status === 'rejected';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Submission Status</h2>
        <p className="text-sm text-gray-400 mt-1">
          Track your app&apos;s progress through the review pipeline.
        </p>
      </div>

      {/* App info header */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">{appName || 'Untitled App'}</p>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={status} />
            {submittedAt && (
              <span className="text-xs text-gray-500">
                Submitted {new Date(submittedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Timeline stepper */}
      <div className="relative">
        {isRejected && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-red-400">Submission Rejected</span>
            </div>
            {reviewerNotes && (
              <p className="text-xs text-gray-400 mt-1">{reviewerNotes}</p>
            )}
            {reviewedAt && (
              <p className="text-xs text-gray-500 mt-2">
                Reviewed on {new Date(reviewedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        <div className="space-y-0">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex && !isRejected;
            const isPending = idx > currentStepIndex;

            return (
              <div key={step.key} className="flex gap-4">
                {/* Indicator column */}
                <div className="flex flex-col items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? 'bg-green-500'
                        : isCurrent
                          ? 'bg-nexus-500 ring-4 ring-nexus-500/20'
                          : 'bg-gray-700'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className={`text-xs font-medium ${isCurrent ? 'text-white' : 'text-gray-500'}`}>
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-0.5 h-12 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-700'
                    }`} />
                  )}
                </div>

                {/* Content column */}
                <div className="pb-12 last:pb-0">
                  <p className={`text-sm font-medium ${
                    isCompleted ? 'text-gray-400' : isCurrent ? 'text-white' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    isCurrent ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                  {isCurrent && idx === 0 && (
                    <p className="text-xs text-nexus-400 mt-1">Ready to submit</p>
                  )}
                  {isCurrent && idx === 1 && submittedAt && (
                    <p className="text-xs text-blue-400 mt-1">
                      Submitted {new Date(submittedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviewer notes for approved */}
      {status === 'approved' && reviewerNotes && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-sm font-medium text-green-400">Reviewer Notes</p>
          <p className="text-xs text-gray-400 mt-1">{reviewerNotes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Back
        </button>
        <div className="flex items-center gap-3">
          {status === 'draft' && (
            <button
              onClick={onSubmit}
              className="px-6 py-2 bg-nexus-700 text-white text-sm font-medium rounded-lg hover:bg-nexus-600 transition-colors"
            >
              Submit for Review
            </button>
          )}
          {(status === 'approved' || status === 'rejected') && (
            <button
              onClick={onNewApp}
              className="px-6 py-2 bg-nexus-700 text-white text-sm font-medium rounded-lg hover:bg-nexus-600 transition-colors"
            >
              Create New App
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
