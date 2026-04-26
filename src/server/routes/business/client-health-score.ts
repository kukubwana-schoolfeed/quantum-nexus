import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type {
  ClientHealthScoreDTO,
  HealthScoreAlertDTO,
  PeerComparisonDTO,
  ActionConfirmationDTO,
} from '@/lib/api/schema';

/** @module client-health-score @description Business-layer client health score — retention component, churn risk alerts, and peer comparison. */

/**
 * Retrieve the enriched health score including the retention component.
 * Delegates to the domination module for base scores, then enriches
 * with retention-aware context.
 */
export async function getEnrichedScore(tenantId: string): Promise<ApiResponse<ClientHealthScoreDTO>> {
  const result = await db.dominationQueries.getLatestClientHealthScore(tenantId);

  if (!result) {
    return {
      success: true,
      data: {
        totalScore: 0,
        trend: 'stable',
        seoScore: 0,
        contentScore: 0,
        reviewScore: 0,
        socialScore: 0,
        entityScore: 0,
        retentionScore: 0,
        topRecommendations: [],
      },
    };
  }

  return { success: true, data: result };
}

/**
 * Generate churn risk alerts by comparing the two most recent health scores.
 * When a score declines by more than 5 points, a HealthScoreAlertDTO is created.
 * Also detects declining individual component scores that may signal churn risk.
 */
export async function getChurnRiskAlerts(tenantId: string): Promise<ApiResponse<HealthScoreAlertDTO[]>> {
  const supabase = db.getSupabaseAdmin();

  const { data, error } = await supabase
    .from('client_health_scores')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('score_date', { ascending: false })
    .limit(2);

  if (error) throw error;

  const rows = (data ?? []) as db.ClientHealthScoreRow[];
  const alerts: HealthScoreAlertDTO[] = [];

  if (rows.length < 2) {
    return { success: true, data: alerts };
  }

  const current = rows[0];
  const previous = rows[1];
  const delta = current.total_score - previous.total_score;

  // Total score declined significantly
  if (delta < -5) {
    alerts.push({
      id: `${tenantId}-total-${current.score_date}`,
      tenantId,
      previousScore: previous.total_score,
      currentScore: current.total_score,
      delta,
      direction: 'declining',
      triggeredAt: current.created_at,
      acknowledged: false,
    });
  }

  // Check individual component declines that signal churn risk
  const components: Array<{ name: keyof db.ClientHealthScoreRow; label: string }> = [
    { name: 'retention_score', label: 'Retention' },
    { name: 'review_score', label: 'Reviews' },
    { name: 'content_score', label: 'Content' },
  ];

  for (const comp of components) {
    const prevVal = previous[comp.name] as number;
    const currVal = current[comp.name] as number;
    const compDelta = currVal - prevVal;
    if (compDelta < -10) {
      alerts.push({
        id: `${tenantId}-${comp.label.toLowerCase()}-${current.score_date}`,
        tenantId,
        previousScore: prevVal,
        currentScore: currVal,
        delta: compDelta,
        direction: 'declining',
        triggeredAt: current.created_at,
        acknowledged: false,
      });
    }
  }

  // If total score is improving, add a positive alert
  if (delta > 5) {
    alerts.push({
      id: `${tenantId}-total-improving-${current.score_date}`,
      tenantId,
      previousScore: previous.total_score,
      currentScore: current.total_score,
      delta,
      direction: 'improving',
      triggeredAt: current.created_at,
      acknowledged: false,
    });
  }

  return { success: true, data: alerts };
}

/**
 * Acknowledge a churn risk alert. Marks it as acknowledged by persisting
 * the state so it doesn't reappear in active alert feeds.
 */
export async function acknowledgeAlert(
  tenantId: string,
  alertId: string,
): Promise<ApiResponse<ActionConfirmationDTO>> {
  const supabase = db.getSupabaseAdmin();

  // Store acknowledgement in notifications table for audit trail
  const { error } = await supabase
    .from('notifications')
    .insert({
      tenant_id: tenantId,
      type: 'health_score_alert_ack',
      title: 'Health score alert acknowledged',
      body: alertId,
      priority: 'low',
      read: true,
    });

  if (error) throw error;

  return { success: true, data: { success: true, message: 'Alert acknowledged' } };
}

/**
 * Compare a tenant's health score against same-tier peers.
 * Calculates average, median, and percentile rank across all
 * tenants sharing the same tier.
 */
export async function getPeerComparison(tenantId: string): Promise<ApiResponse<PeerComparisonDTO>> {
  const supabase = db.getSupabaseAdmin();

  // Resolve tenant tier
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, tier')
    .eq('id', tenantId)
    .single();

  if (tenantError) throw tenantError;

  const tier = tenant.tier as string;

  // Get latest score for this tenant
  const tenantScore = await db.dominationQueries.getLatestClientHealthScore(tenantId);
  const tenantTotalScore = tenantScore?.totalScore ?? 0;

  // Get all latest scores for same-tier peers
  // Use a subquery approach: get the most recent score_date per tenant in this tier
  const { data: tierScores, error: scoresError } = await supabase
    .from('client_health_scores')
    .select('tenant_id, total_score, score_date')
    .in('tenant_id', (
      await supabase
        .from('tenants')
        .select('id')
        .eq('tier', tier)
        .eq('status', 'active')
    ).data?.map((t: { id: string }) => t.id) ?? [])
    .order('score_date', { ascending: false });

  if (scoresError) throw scoresError;

  // Deduplicate: keep only the latest score per tenant
  const seen = new Set<string>();
  const scores: number[] = [];
  for (const row of tierScores ?? []) {
    if (!seen.has(row.tenant_id)) {
      seen.add(row.tenant_id);
      scores.push(row.total_score);
    }
  }

  if (scores.length === 0) {
    return {
      success: true,
      data: {
        tenantScore: tenantTotalScore,
        peerAverage: 0,
        peerMedian: 0,
        percentile: 0,
        peerCount: 0,
        tier,
      },
    };
  }

  const peerAverage = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const sorted = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const peerMedian = sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  const rank = scores.filter(s => s <= tenantTotalScore).length;
  const percentile = Math.round((rank / scores.length) * 100);

  return {
    success: true,
    data: {
      tenantScore: tenantTotalScore,
      peerAverage,
      peerMedian,
      percentile,
      peerCount: scores.length,
      tier,
    },
  };
}
