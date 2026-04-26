import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getOverview as getAnalyticsOverview } from '@/server/routes/business/analytics-dashboard';
import { getVelocity } from '@/server/routes/domination/reputation-velocity-tracker';
import { getScore } from '@/server/routes/domination/client-health-score';
import { getHealth } from '@/server/routes/admin/platform-health-monitor';
import { getTrends } from '@/server/routes/domination/trend-intelligence-engine';
import { getAudits } from '@/server/routes/domination/business-audit-engine';
import { getCustomers } from '@/server/routes/business/customer-database';
import { getPosts } from '@/server/routes/business/content-machine';
import { getSeoOverview } from '@/server/routes/business/seo-engine';
import { getConfig as getSprintConfig } from '@/server/routes/platform-core/sprint-mode-engine';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const [analytics, velocity, health, trends, audits, customers, posts, seo, sprint] = await Promise.all([
      getAnalyticsOverview(tid),
      getVelocity(tid),
      getScore(tid),
      getHealth(tid),
      getAudits(tid),
      getCustomers(tid, {}),
      getPosts(tid, {}),
      getSeoOverview(tid),
      getSprintConfig(tid),
    ]);
    return apiResponse({
      analytics: analytics.data,
      velocity: velocity.data,
      healthScore: health.data,
      platformHealth: health.data,
      trends: trends.data,
      audit: audits.data?.[0] ?? null,
      customers: customers.data,
      posts: posts.data,
      seo: seo.data,
      sprint: sprint.data,
    });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load dashboard');
  }
}
