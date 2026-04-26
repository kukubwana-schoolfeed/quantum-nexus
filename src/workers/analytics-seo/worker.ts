/**
 * Worker 4 — Analytics and SEO Worker
 * Queue: analytics-seo
 * Concurrency: 3
 *
 * Responsibilities:
 * - Google Search Console API pulls (rankings, indexing status, crawl errors)
 * - Google Analytics 4 data pulls (traffic, conversions, behaviour)
 * - DataForSEO competitor rank tracking
 * - Social platform analytics pulls (engagement, reach, follower growth)
 * - Google Business Profile insights pulls
 * - Dashboard data aggregation and caching (Mission Control snapshots every 15 min)
 * - Sitemap submission to GSC (daily, 6am)
 * - New page indexing requests to GSC (triggered immediately on publish)
 * - Niche research jobs (monthly refresh, Claude + web search)
 * - Daily report generation (11pm, WhatsApp + email + in-app)
 * - Lenco payment status checks (daily)
 * - Business audit jobs (initial + monthly refresh)
 * - Trend scanning (daily — feeds trend-intelligence-engine)
 * - Trend expiry checks (daily — flags aging trends)
 * - Reputation velocity score updates (weekly)
 * - Client health score updates (daily)
 * - Keyword cannibalisation scans (monthly)
 * - Entity consistency checks (monthly)
 * - Content refresh jobs (monthly — refreshes posts older than 6 months)
 * - Sprint mode end check (daily — disables sprint mode on day 31)
 * - App revenue sync (daily per app developer tenant)
 * - ASO rank checks (weekly per app developer tenant)
 * - App review monitoring (daily per app developer tenant)
 */

import { Worker, Job } from 'bullmq';
import { bullMQConnection } from '../shared/redis-connection';
import { BaseJobPayload, JobResult } from '../shared/types';
import { createWorkerLogger } from '../shared/logger';

// Job processors
import { processGscApiPull } from './jobs/gsc-api-pull';
import { processGa4DataPull } from './jobs/ga4-data-pull';
import { processCompetitorRankTracking } from './jobs/competitor-rank-tracking';
import { processSocialAnalyticsPull } from './jobs/social-analytics-pull';
import { processGbpInsightsPull } from './jobs/gbp-insights-pull';
import { processDashboardAggregation } from './jobs/dashboard-aggregation';
import { processSitemapSubmission } from './jobs/sitemap-submission';
import { processPageIndexingRequest } from './jobs/page-indexing-request';
import { processNicheResearch } from './jobs/niche-research';
import { processDailyReportGeneration } from './jobs/daily-report-generation';
import { processLencoPaymentCheck } from './jobs/lenco-payment-check';
import { processBusinessAudit } from './jobs/business-audit';
import { processTrendScanning } from './jobs/trend-scanning';
import { processTrendExpiryCheck } from './jobs/trend-expiry-check';
import { processReputationVelocityUpdate } from './jobs/reputation-velocity-update';
import { processClientHealthScoreUpdate } from './jobs/client-health-score-update';
import { processKeywordCannibalisationScan } from './jobs/keyword-cannibalisation-scan';
import { processEntityConsistencyCheck } from './jobs/entity-consistency-check';
import { processContentRefresh } from './jobs/content-refresh';
import { processSprintModeEndCheck } from './jobs/sprint-mode-end-check';
import { processAppRevenueSync } from './jobs/app-revenue-sync';
import { processAsoRankCheck } from './jobs/aso-rank-check';
import { processAppReviewMonitoring } from './jobs/app-review-monitoring';
import { processKeyRotation } from './jobs/key-rotation';

const log = createWorkerLogger(4, 'analytics-seo');

/** Maps job names to their processor functions. */
const jobProcessors: Record<string, (job: Job<BaseJobPayload>) => Promise<JobResult>> = {
  'gsc-api-pull': processGscApiPull as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'ga4-data-pull': processGa4DataPull as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'competitor-rank-tracking': processCompetitorRankTracking as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'social-analytics-pull': processSocialAnalyticsPull as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'gbp-insights-pull': processGbpInsightsPull as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'dashboard-aggregation': processDashboardAggregation as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'sitemap-submission': processSitemapSubmission as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'page-indexing-request': processPageIndexingRequest as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'niche-research': processNicheResearch as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'daily-report-generation': processDailyReportGeneration as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'lenco-payment-check': processLencoPaymentCheck as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'business-audit': processBusinessAudit as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'trend-scanning': processTrendScanning as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'trend-expiry-check': processTrendExpiryCheck as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'reputation-velocity-update': processReputationVelocityUpdate as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'client-health-score-update': processClientHealthScoreUpdate as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'keyword-cannibalisation-scan': processKeywordCannibalisationScan as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'entity-consistency-check': processEntityConsistencyCheck as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'content-refresh': processContentRefresh as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'sprint-mode-end-check': processSprintModeEndCheck as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'app-revenue-sync': processAppRevenueSync as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'aso-rank-check': processAsoRankCheck as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'app-review-monitoring': processAppReviewMonitoring as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'key-rotation': processKeyRotation as (job: Job<BaseJobPayload>) => Promise<JobResult>,
};

/**
 * Analytics and SEO Worker instance.
 * Processes jobs from the 'analytics-seo' queue with concurrency of 3.
 */
export const analyticsSeoWorker = new Worker<BaseJobPayload>(
  'analytics-seo',
  async (job: Job<BaseJobPayload>) => {
    const processor = jobProcessors[job.name];
    if (!processor) {
      throw new Error(`[Worker 4] Unknown job type: ${job.name}`);
    }
    return processor(job);
  },
  {
    connection: bullMQConnection,
    concurrency: 3,
  }
);

analyticsSeoWorker.on('completed', (job: Job<BaseJobPayload>) => {
  log.jobComplete(job.name, job.id, job.data.tenant_id, 0, 'ok');
});

analyticsSeoWorker.on('failed', (job: Job<BaseJobPayload> | undefined, err: Error) => {
  if (job) {
    log.jobFailed(job.name, job.id, job.data.tenant_id, err.message, 0);
  }
});

analyticsSeoWorker.on('error', (err: Error) => {
  log.error('Worker runtime error', { message: err.message });
});

export { log };
export default analyticsSeoWorker;
