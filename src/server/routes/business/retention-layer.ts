import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type {
  RetentionDashboardDTO,
  ChurnRiskDTO,
  CohortDataDTO,
  WinBackResultDTO,
  RetentionConfigDTO,
  ActionConfirmationDTO,
} from '@/lib/api/schema';

/** @module retention-layer @description Customer retention analytics — dashboard aggregation, churn risk detection, cohort analysis, and automated win-back. */

/** Shape returned by the customers table query for retention dashboard */
interface CustomerRetentionRow {
  id: string;
  status: string;
  loyalty_points: number;
  created_at: string;
  birth_month: number | null;
  birth_day: number | null;
}

/** Shape returned by the customers table query for churn risk analysis */
interface ChurnRiskCustomerRow {
  id: string;
  first_name: string;
  last_name: string | null;
  updated_at: string;
  loyalty_points: number;
  visit_count: number;
  total_spend: number;
  status: string;
}

/** Shape returned by the customers table query for cohort analysis */
interface CohortCustomerRow {
  id: string;
  created_at: string;
  status: string;
}

/** Shape returned by the customers table query for win-back */
interface WinBackCustomerRow {
  id: string;
  first_name: string;
  status: string;
}

const DEFAULT_CHURN_WARNING_DAYS = 30;
const DEFAULT_CHURN_CRITICAL_DAYS = 60;
const DEFAULT_WIN_BACK_POINTS = 500;

/**
 * Retrieve the retention configuration for a tenant.
 * Reads from business_profile, falling back to defaults.
 */
export async function getRetentionConfig(tenantId: string): Promise<ApiResponse<RetentionConfigDTO>> {
  const profile = await db.businessQueries.getBusinessProfile(tenantId);
  const raw = (profile?.retention_config as Record<string, unknown>) ?? {};
  const config: RetentionConfigDTO = {
    churnWarningDays: (raw.churnWarningDays as number) ?? DEFAULT_CHURN_WARNING_DAYS,
    churnCriticalDays: (raw.churnCriticalDays as number) ?? DEFAULT_CHURN_CRITICAL_DAYS,
    autoWinBackEnabled: (raw.autoWinBackEnabled as boolean) ?? false,
    winBackMethod: (raw.winBackMethod as RetentionConfigDTO['winBackMethod']) ?? 'notification',
    loyaltyBonusPoints: (raw.loyaltyBonusPoints as number) ?? DEFAULT_WIN_BACK_POINTS,
    digestFrequency: (raw.digestFrequency as RetentionConfigDTO['digestFrequency']) ?? 'daily',
  };
  return { success: true, data: config };
}

/**
 * Update retention configuration. Persists to business_profile.retention_config.
 */
export async function updateRetentionConfig(
  tenantId: string,
  data: Record<string, unknown>,
): Promise<ApiResponse<ActionConfirmationDTO & Record<string, unknown>>> {
  await db.businessQueries.upsertBusinessProfile(tenantId, {
    retention_config: data,
  });
  const updated = await getRetentionConfig(tenantId);
  return { success: true, data: { success: true, message: 'Retention config updated', ...updated.data } };
}

/**
 * Aggregate retention metrics for the tenant dashboard.
 * Pulls customer counts, loyalty averages, birthday participation,
 * and review ratings into a single snapshot.
 */
export async function getRetentionDashboard(tenantId: string): Promise<ApiResponse<RetentionDashboardDTO>> {
  const supabase = db.getSupabaseAdmin();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const [customersResult, atRiskResult, churnedResult, reviewResult] = await Promise.all([
    supabase.from('customers').select('id, status, loyalty_points, created_at, birth_month, birth_day').eq('tenant_id', tenantId),
    supabase.from('customers').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'inactive'),
    supabase.from('customers').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'blocked'),
    supabase.from('business_audits').select('average_rating').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(1),
  ]);

  if (customersResult.error) throw customersResult.error;
  if (reviewResult.error) throw reviewResult.error;

  const allCustomers = (customersResult.data ?? []) as CustomerRetentionRow[];
  const totalCustomers = allCustomers.length;
  const activeCustomers = allCustomers.filter(c => c.status === 'active').length;
  const atRiskCustomers = atRiskResult.count ?? 0;
  const churnedCustomers = churnedResult.count ?? 0;

  const activeRows = allCustomers.filter(c => c.status === 'active');
  const averageLoyaltyPoints = activeRows.length > 0
    ? Math.round(activeRows.reduce((sum, c) => sum + c.loyalty_points, 0) / activeRows.length)
    : 0;

  const customersWithBirthday = allCustomers.filter(c => c.birth_month !== null && c.birth_day !== null).length;
  const birthdayParticipationRate = totalCustomers > 0
    ? Math.round((customersWithBirthday / totalCustomers) * 100)
    : 0;

  const latestAudit = (reviewResult.data ?? [])[0];
  const averageReviewRating = latestAudit?.average_rating ?? 0;

  const cohort30d = allCustomers.filter(c => {
    const d = new Date(c.created_at);
    return d >= new Date(ninetyDaysAgo) && d < new Date(thirtyDaysAgo);
  });
  const cohort90d = allCustomers.filter(c => new Date(c.created_at) < new Date(ninetyDaysAgo));
  const retained30d = cohort30d.filter(c => c.status === 'active').length;
  const retained90d = cohort90d.filter(c => c.status === 'active').length;
  const retentionRate30d = cohort30d.length > 0 ? Math.round((retained30d / cohort30d.length) * 100) : 100;
  const retentionRate90d = cohort90d.length > 0 ? Math.round((retained90d / cohort90d.length) * 100) : 100;

  return {
    success: true,
    data: {
      totalCustomers,
      activeCustomers,
      atRiskCustomers,
      churnedCustomers,
      averageLoyaltyPoints,
      birthdayParticipationRate,
      averageReviewRating,
      retentionRate30d,
      retentionRate90d,
    },
  };
}

/**
 * Identify customers at risk of churning based on inactivity.
 * Risk levels: low (7-30 days inactive), medium (30-60), high (60-90), critical (>90).
 */
export async function getChurnRisks(
  tenantId: string,
  params?: Record<string, unknown>,
): Promise<ApiResponse<ChurnRiskDTO[]>> {
  const supabase = db.getSupabaseAdmin();
  const config = await getRetentionConfig(tenantId);
  const warningDays = config.data!.churnWarningDays;
  const criticalDays = config.data!.churnCriticalDays;

  const { data, error } = await supabase
    .from('customers')
    .select('id, first_name, last_name, updated_at, loyalty_points, visit_count, total_spend, status')
    .eq('tenant_id', tenantId)
    .eq('status', 'active');

  if (error) throw error;

  const now = new Date();
  const minRisk = (params?.minRisk as string) ?? 'low';
  const riskOrder = ['low', 'medium', 'high', 'critical'];

  const risks: ChurnRiskDTO[] = ((data ?? []) as ChurnRiskCustomerRow[])
    .map(customer => {
      const lastActivity = new Date(customer.updated_at);
      const daysInactive = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      let riskLevel: ChurnRiskDTO['riskLevel'] = 'low';
      let suggestedAction = 'Send re-engagement notification';

      if (daysInactive >= criticalDays) {
        riskLevel = 'critical';
        suggestedAction = 'Immediate win-back with loyalty bonus';
      } else if (daysInactive >= warningDays) {
        riskLevel = 'high';
        suggestedAction = 'Send personalised offer or discount';
      } else if (daysInactive >= 7) {
        riskLevel = 'medium';
        suggestedAction = 'Send engagement notification';
      } else {
        riskLevel = 'low';
        suggestedAction = 'No action needed';
      }

      return {
        customerId: customer.id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        riskLevel,
        riskScore: Math.min(100, Math.round((daysInactive / criticalDays) * 100)),
        lastActivityAt: customer.updated_at,
        daysInactive,
        loyaltyPoints: customer.loyalty_points,
        totalVisits: customer.visit_count,
        totalSpend: Number(customer.total_spend),
        suggestedAction,
      };
    })
    .filter(r => riskOrder.indexOf(r.riskLevel) >= riskOrder.indexOf(minRisk))
    .sort((a, b) => b.riskScore - a.riskScore);

  return { success: true, data: risks };
}

/**
 * Analyse retention by monthly cohort. Groups customers by their
 * creation month and tracks how many remain active after 30/60/90 days.
 */
export async function getCohortAnalysis(
  tenantId: string,
  params?: Record<string, unknown>,
): Promise<ApiResponse<CohortDataDTO[]>> {
  const supabase = db.getSupabaseAdmin();
  const months = Number(params?.months ?? 6);

  const { data, error } = await supabase
    .from('customers')
    .select('id, created_at, status')
    .eq('tenant_id', tenantId);

  if (error) throw error;

  const now = new Date();
  const customers = (data ?? []) as CohortCustomerRow[];

  const cohortMap = new Map<string, { total: number; activeIds: Set<string>; memberIds: Set<string> }>();

  for (const c of customers) {
    const d = new Date(c.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!cohortMap.has(key)) {
      cohortMap.set(key, { total: 0, activeIds: new Set(), memberIds: new Set() });
    }
    const cohort = cohortMap.get(key)!;
    cohort.total++;
    cohort.memberIds.add(c.id);
    if (c.status === 'active') cohort.activeIds.add(c.id);
  }

  const intervals = [30, 60, 90];
  const cohorts: CohortDataDTO[] = [];
  const sortedKeys = [...cohortMap.keys()].sort().reverse().slice(0, months);

  for (const cohortKey of sortedKeys) {
    const cohort = cohortMap.get(cohortKey)!;
    const cohortDate = new Date(cohortKey + '-01');
    const daysSinceCohort = Math.floor((now.getTime() - cohortDate.getTime()) / (1000 * 60 * 60 * 24));

    const retainedCounts: Record<string, number> = {};
    const retentionRates: Record<string, number> = {};

    for (const days of intervals) {
      if (daysSinceCohort >= days) {
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
        const retained = customers.filter(c =>
          cohort.memberIds.has(c.id) && c.created_at <= cutoff && c.status === 'active',
        ).length;
        retainedCounts[`d${days}`] = retained;
        retentionRates[`d${days}`] = cohort.total > 0 ? Math.round((retained / cohort.total) * 100) : 0;
      }
    }

    cohorts.push({
      cohort: cohortKey,
      cohortSize: cohort.total,
      retainedCounts,
      retentionRates,
    });
  }

  return { success: true, data: cohorts };
}

/**
 * Trigger a win-back action for an at-risk customer.
 * Dispatches the configured win-back method: notification, loyalty bonus,
 * birthday token, or discount.
 */
export async function triggerWinBack(
  tenantId: string,
  customerId: string,
  method?: 'notification' | 'loyalty_bonus' | 'birthday_token' | 'discount',
): Promise<ApiResponse<WinBackResultDTO>> {
  const config = await getRetentionConfig(tenantId);
  const winBackMethod = method ?? config.data!.winBackMethod;
  const supabase = db.getSupabaseAdmin();

  const { data: customer, error: custError } = await supabase
    .from('customers')
    .select('id, first_name, status')
    .eq('tenant_id', tenantId)
    .eq('id', customerId)
    .single();

  const typedCustomer = customer as unknown as WinBackCustomerRow;

  if (custError || !typedCustomer) {
    return {
      success: false,
      data: { customerId, method: winBackMethod, status: 'failed', message: 'Customer not found' },
    };
  }

  if (customer.status !== 'active') {
    return {
      success: false,
      data: { customerId, method: winBackMethod, status: 'skipped', message: 'Customer is not active' },
    };
  }

  switch (winBackMethod) {
    case 'notification': {
      const { error: notifError } = await supabase.from('notifications').insert({
        tenant_id: tenantId,
        type: 'win_back',
        title: 'We miss you!',
        body: `Hi ${customer.first_name}, we noticed you haven't visited in a while. Come back and see what's new!`,
        priority: 'high',
        read: false,
      });
      if (notifError) throw notifError;
      return {
        success: true,
        data: { customerId, method: 'notification', status: 'triggered', message: 'Win-back notification sent' },
      };
    }

    case 'loyalty_bonus': {
      const bonusPoints = config.data!.loyaltyBonusPoints;
      const newBalance = await db.customerQueries.adjustLoyaltyPoints(tenantId, customerId, bonusPoints);
      await db.customerQueries.createLoyaltyTransaction(tenantId, customerId, {
        type: 'earn',
        points: bonusPoints,
        balance_after: newBalance ?? 0,
        description: 'Win-back loyalty bonus',
      });

      const { error: notifError } = await supabase.from('notifications').insert({
        tenant_id: tenantId,
        type: 'win_back',
        title: 'A gift for you!',
        body: `Hi ${customer.first_name}, we've added ${bonusPoints} bonus points to your account. Come in and use them!`,
        priority: 'high',
        read: false,
      });
      if (notifError) throw notifError;

      return {
        success: true,
        data: { customerId, method: 'loyalty_bonus', status: 'triggered', message: `Awarded ${bonusPoints} loyalty bonus points and sent notification` },
      };
    }

    case 'birthday_token': {
      const thisYear = new Date().getFullYear();
      const existing = await db.customerQueries.getBirthdayTokenForYear(tenantId, customerId, thisYear);
      if (existing) {
        return {
          success: true,
          data: { customerId, method: 'birthday_token', status: 'skipped', message: 'Birthday token already exists for this year' },
        };
      }

      const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      await db.customerQueries.createBirthdayToken(tenantId, customerId, 'We miss you! Enjoy a special treat on us.', expiresAt, thisYear);

      const { error: notifError } = await supabase.from('notifications').insert({
        tenant_id: tenantId,
        type: 'win_back',
        title: 'A special treat for you!',
        body: `Hi ${customer.first_name}, we have a special offer waiting for you. Claim it on your next visit!`,
        priority: 'high',
        read: false,
      });
      if (notifError) throw notifError;

      return {
        success: true,
        data: { customerId, method: 'birthday_token', status: 'triggered', message: 'Win-back birthday token created and notification sent' },
      };
    }

    case 'discount': {
      const { error: notifError } = await supabase.from('notifications').insert({
        tenant_id: tenantId,
        type: 'win_back',
        title: 'Special discount just for you!',
        body: `Hi ${customer.first_name}, enjoy an exclusive discount on your next visit. Show this message to redeem!`,
        priority: 'high',
        read: false,
      });
      if (notifError) throw notifError;

      return {
        success: true,
        data: { customerId, method: 'discount', status: 'triggered', message: 'Win-back discount notification sent' },
      };
    }
  }
}

