/**
 * Job: Sprint Mode End Check
 * Worker: 4 — Analytics and SEO
 *
 * Checks if a tenant's sprint mode has expired (day 31+). If sprint_mode_active
 * is true and sprint_mode_ends_at has passed, disables sprint mode and notifies
 * via tenantQueries.updateTenant.
 */

import { Job } from 'bullmq';
import { tenantQueries, notificationQueries } from '../../../lib/db';
import { SprintModeEndCheckPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

export async function processSprintModeEndCheck(job: Job<SprintModeEndCheckPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id } = job.data;

  log.jobStart('sprint-mode-end-check', job.id, tenant_id, [`Check sprint mode status`]);

  try {
    const tenant = await tenantQueries.getTenantById(tenant_id);

    if (!tenant) {
      const duration = Date.now() - start;
      log.jobComplete('sprint-mode-end-check', job.id, tenant_id, duration, `Tenant not found — skipping`);
      return { success: true, data: { sprint_mode_active: false, action_taken: 'skipped', reason: 'tenant_not_found' }, tenant_id, job_type: 'sprint-mode-end-check', timestamp: new Date().toISOString() };
    }

    if (!tenant.sprint_mode_active) {
      const duration = Date.now() - start;
      log.jobComplete('sprint-mode-end-check', job.id, tenant_id, duration, `Sprint mode already inactive`);
      return { success: true, data: { sprint_mode_active: false, action_taken: 'none', reason: 'already_inactive' }, tenant_id, job_type: 'sprint-mode-end-check', timestamp: new Date().toISOString() };
    }

    const now = new Date();
    const endsAt = tenant.sprint_mode_ends_at ? new Date(tenant.sprint_mode_ends_at) : null;

    if (endsAt && now >= endsAt) {
      await tenantQueries.updateTenant(tenant_id, {
        sprint_mode_active: false,
        sprint_mode_ends_at: null,
      });

      try {
        await notificationQueries.createNotification(tenant_id, {
          type: 'sprint_mode_ended',
          title: 'Sprint Mode Ended',
          body: 'Your 30-day sprint mode has ended. Content cadence will return to normal scheduling.',
          priority: 'normal',
        });
      } catch {
        log.jobComplete('sprint-mode-end-check', job.id, tenant_id, Date.now() - start, `Sprint disabled — notification failed`);
      }

      const daysSinceActivation = endsAt
        ? Math.round((now.getTime() - endsAt.getTime() + 30 * 24 * 60 * 60 * 1000) / (24 * 60 * 60 * 1000))
        : 30;

      const duration = Date.now() - start;
      log.jobComplete('sprint-mode-end-check', job.id, tenant_id, duration, `Sprint mode disabled after ${daysSinceActivation} days`);

      return {
        success: true,
        data: {
          sprint_mode_active: false,
          days_since_activation: daysSinceActivation,
          action_taken: 'disabled',
          notification_sent: true,
        },
        tenant_id,
        job_type: 'sprint-mode-end-check',
        timestamp: new Date().toISOString(),
      };
    }

    const remainingDays = endsAt ? Math.ceil((endsAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : null;
    const duration = Date.now() - start;
    log.jobComplete('sprint-mode-end-check', job.id, tenant_id, duration, `Sprint mode still active — ${remainingDays} days remaining`);

    return {
      success: true,
      data: {
        sprint_mode_active: true,
        remaining_days: remainingDays,
        action_taken: 'none',
        notification_sent: false,
      },
      tenant_id,
      job_type: 'sprint-mode-end-check',
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('sprint-mode-end-check', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'sprint-mode-end-check', timestamp: new Date().toISOString() };
  }
}
