import * as db from '@/lib/db';
import { AppError, internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { OnboardingStepDTO } from '@/lib/api/schema';

/** @module platform-core/onboarding-engine @description Manages the multi-step onboarding flow for new tenants, including retrieving the current state, persisting individual step data, and marking onboarding as complete. */

/**
 * Retrieves the current onboarding state for a tenant,
 * including all steps and their completion statuses.
 * Derives step statuses from tenant data: pending_approval → step 1 pending;
 * no business profile → step 2 pending; no api keys → step 3 pending;
 * completeness_score < 60 → step 4 pending; activated_at exists → all complete.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @returns ApiResponse wrapping the onboarding steps with each step's id, key, label, and status
 */
export async function getOnboardingState(tenantId: string): Promise<ApiResponse<OnboardingStepDTO[]>> {
  try {
    const tenant = await db.tenantQueries.getTenantById(tenantId);

    if (!tenant) {
      throw internalError('TENANT_NOT_FOUND');
    }

    const steps: OnboardingStepDTO[] = [
      {
        id: 'step-1',
        step: 'approval',
        label: 'Admin Approval',
        status: tenant.status === 'pending_approval' ? 'pending' : 'complete',
      },
      {
        id: 'step-2',
        step: 'business_profile',
        label: 'Business Profile',
        status: 'pending',
      },
      {
        id: 'step-3',
        step: 'api_keys',
        label: 'Connect API Keys',
        status: 'pending',
      },
      {
        id: 'step-4',
        step: 'completeness',
        label: 'Reach 60% Completeness',
        status: 'pending',
      },
    ];

    // Step 2: check if business profile exists
    const profile = await db.businessQueries.getBusinessProfile(tenantId);
    if (profile) {
      steps[1].status = 'complete';
    }

    // Step 3: check if any API keys exist
    const keys = await db.billingQueries.listApiKeys(tenantId);
    if (keys.length > 0) {
      steps[2].status = 'complete';
    }

    // Step 4: check completeness score
    if (tenant.completeness_score >= 60) {
      steps[3].status = 'complete';
    }

    // If activated_at exists, all steps are complete
    if (tenant.activated_at) {
      for (const step of steps) {
        step.status = 'complete';
      }
    }

    return { success: true, data: steps };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('ONBOARDING_STATE_FETCH_FAILED');
  }
}

/**
 * Saves the data submitted for a single onboarding step,
 * updating the step's status to reflect the saved progress.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @param stepData - The step payload (step key, form values, etc.)
 * @returns ApiResponse wrapping confirmation of the saved step with the submitted data echoed back
 */
export async function saveStep(tenantId: string, stepData: Record<string, unknown>): Promise<ApiResponse<{ success: boolean; step: Record<string, unknown> }>> {
  try {
    await db.businessQueries.upsertBusinessProfile(tenantId, stepData);
    return { success: true, data: { success: true, step: stepData } };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('ONBOARDING_STEP_SAVE_FAILED');
  }
}

/**
 * Marks the tenant's onboarding as fully complete and activates the account.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @returns ApiResponse wrapping confirmation that onboarding is complete and the account is activated
 */
export async function completeOnboarding(tenantId: string): Promise<ApiResponse<{ success: boolean; activated: boolean }>> {
  try {
    await db.tenantQueries.updateTenant(tenantId, {
      status: 'active',
      activated_at: new Date().toISOString(),
    } as Partial<db.TenantRow>);
    return { success: true, data: { success: true, activated: true } };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('ONBOARDING_COMPLETE_FAILED');
  }
}
