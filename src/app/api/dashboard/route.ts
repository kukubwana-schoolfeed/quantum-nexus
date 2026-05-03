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

    const [
      analyticsResult,
      velocityResult,
      scoreResult,
      healthResult,
      trendsResult,
      auditsResult,
      customersResult,
      postsResult,
      seoResult,
      sprintResult,
    ] = await Promise.allSettled([
      getAnalyticsOverview(tid),
      getVelocity(tid),
      getScore(tid),
      getHealth(tid),
      getTrends(tid, {}),
      getAudits(tid),
      getCustomers(tid, {}),
      getPosts(tid, {}),
      getSeoOverview(tid),
      getSprintConfig(tid),
    ]);

    if (analyticsResult.status === 'rejected') console.error('[dashboard] getAnalyticsOverview failed:', analyticsResult.reason);
    if (velocityResult.status === 'rejected') console.error('[dashboard] getVelocity failed:', velocityResult.reason);
    if (scoreResult.status === 'rejected') console.error('[dashboard] getScore failed:', scoreResult.reason);
    if (healthResult.status === 'rejected') console.error('[dashboard] getHealth failed:', healthResult.reason);
    if (trendsResult.status === 'rejected') console.error('[dashboard] getTrends failed:', trendsResult.reason);
    if (auditsResult.status === 'rejected') console.error('[dashboard] getAudits failed:', auditsResult.reason);
    if (customersResult.status === 'rejected') console.error('[dashboard] getCustomers failed:', customersResult.reason);
    if (postsResult.status === 'rejected') console.error('[dashboard] getPosts failed:', postsResult.reason);
    if (seoResult.status === 'rejected') console.error('[dashboard] getSeoOverview failed:', seoResult.reason);
    if (sprintResult.status === 'rejected') console.error('[dashboard] getSprintConfig failed:', sprintResult.reason);

    const analytics = analyticsResult.status === 'fulfilled' ? analyticsResult.value.data : null;
    const velocity = velocityResult.status === 'fulfilled' ? velocityResult.value.data : null;
    const healthData = scoreResult.status === 'fulfilled' ? scoreResult.value.data : null;
    const platformHealth = healthResult.status === 'fulfilled' ? healthResult.value.data : null;
    const trends = trendsResult.status === 'fulfilled' ? trendsResult.value.data : [];
    const audits = auditsResult.status === 'fulfilled' ? auditsResult.value.data : [];
    const customers = customersResult.status === 'fulfilled' ? customersResult.value.data : [];
    const posts = postsResult.status === 'fulfilled' ? postsResult.value.data : [];
    const seo = seoResult.status === 'fulfilled' ? seoResult.value.data : null;
    const sprint = sprintResult.status === 'fulfilled' ? sprintResult.value.data : null;

    return apiResponse({
      analytics,
      velocity,
      healthScore: healthData,
      platformHealth,
      trends,
      audit: audits?.[0] ?? null,
      customers,
      posts,
      seo,
      sprint,
    });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load dashboard');
  }
}
