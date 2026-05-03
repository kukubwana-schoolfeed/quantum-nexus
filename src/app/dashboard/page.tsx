'use client';

import { useApi } from '@/lib/hooks/useApi';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import ReputationVelocity from '@/components/dashboard/ReputationVelocity';
import ClientHealthScore from '@/components/dashboard/ClientHealthScore';
import EmptyState from '@/components/shared/EmptyState';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import type { AnalyticsOverviewDTO, ReputationVelocityDTO, ClientHealthScoreDTO, PlatformHealthDTO, TrendDTO, BusinessAuditDTO, CustomerDTO, ContentPostDTO, SeoOverviewDTO, SprintModeConfigDTO } from '@/lib/api/schema';

interface MissionControlData {
  analytics: AnalyticsOverviewDTO | null;
  velocity: ReputationVelocityDTO | null;
  healthScore: ClientHealthScoreDTO | null;
  platformHealth: PlatformHealthDTO | null;
  trends: TrendDTO[] | null;
  audit: BusinessAuditDTO | null;
  customers: CustomerDTO[] | null;
  posts: ContentPostDTO[] | null;
  seo: SeoOverviewDTO | null;
  sprint: SprintModeConfigDTO | null;
}

export default function MissionControlPage(): JSX.Element {
  const { data, loading, error, refetch } = useApi<MissionControlData>('/api/dashboard');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mission Control</h1>
          <p className="text-sm text-gray-400 mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonPanel />
          <SkeletonPanel />
        </div>
        <SkeletonGrid count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mission Control</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mission Control</h1>
        </div>
        <EmptyState title="No data available" description="Your dashboard data will appear here once your business is set up." />
      </div>
    );
  }

  const analytics = data.analytics ?? { revenueToday: 0, revenueThisWeek: 0, revenueThisMonth: 0, postsPublishedToday: 0, postsScheduled24h: 0, newCustomersToday: 0, totalIndexedPages: 0 } as AnalyticsOverviewDTO;
  const seo = data.seo ?? { domainAuthority: 0, indexedPages: 0, backlinks: 0 } as SeoOverviewDTO;
  const sprint = data.sprint ?? { active: false } as SprintModeConfigDTO;
  const healthMonitor = data.platformHealth ?? { workers: {}, redis: 'unknown', supabase: 'unknown' } as PlatformHealthDTO;
  const trends = data.trends ?? [];
  const customers = data.customers ?? [];
  const posts = data.posts ?? [];
  const audit = data.audit;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mission Control</h1>
          <p className="text-sm text-gray-400 mt-1">
            Your business at a glance — last updated just now
          </p>
        </div>
        {sprint.active && (
          <StatusBadge status="active" />
        )}
        {sprint.active && (
          <span className="text-xs text-yellow-400 ml-2">Sprint Mode Active</span>
        )}
      </div>

      {/* Top Row: Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Revenue Today"
          value={`K${analytics.revenueToday.toLocaleString()}`}
          sublabel={`Week: K${analytics.revenueThisWeek.toLocaleString()}`}
          trend="up"
          trendValue="+8%"
          icon="▣"
        />
        <StatCard
          label="Posts Published"
          value={analytics.postsPublishedToday}
          sublabel={`Scheduled 24h: ${analytics.postsScheduled24h}`}
          trend="up"
          trendValue="+2"
          icon="◧"
        />
        <StatCard
          label="SEO Tasks Today"
          value={`${seo.indexedPages} indexed`}
          sublabel={`DA: ${seo.domainAuthority} | BL: ${seo.backlinks}`}
          trend="up"
          trendValue="+5 pages"
          icon="◉"
        />
        <StatCard
          label="New Customers"
          value={analytics.newCustomersToday}
          sublabel="Via QR bridge & calls"
          trend="up"
          trendValue="+3"
          icon="⚇"
        />
      </div>

      {/* Middle Row: Live Feed + Health Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Post Queue — Next 24h */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h2 className="text-sm font-semibold text-white mb-3">Live Post Queue — Next 24h</h2>
          <div className="space-y-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between py-2 px-3 bg-gray-900/50 rounded"
              >
                <div className="flex items-center gap-3">
                  <StatusBadge status={post.status} />
                  <span className="text-sm text-gray-300">
                    {post.contentType.replace(/_/g, ' ')}
                  </span>
                  {post.platform && (
                    <span className="text-xs text-gray-500">{post.platform}</span>
                  )}
                </div>
                <div className="text-right">
                  {post.scheduledFor ? (
                    <span className="text-xs text-gray-400">
                      {new Date(post.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">Not scheduled</span>
                  )}
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <EmptyState title="No posts in queue" description="Content will appear here when scheduled." />
            )}
          </div>
        </div>

        {/* Health Scores */}
        <div className="space-y-4">
          <ReputationVelocity />
          <ClientHealthScore />
        </div>
      </div>

      {/* Bottom Row: Trends, Workers, Indexing, Competitors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Trend Alerts */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h2 className="text-sm font-semibold text-white mb-3">Active Trends</h2>
          <div className="space-y-2">
            {trends.length === 0 ? (
              <p className="text-gray-500 text-xs text-center py-2">No active trends</p>
            ) : (
              trends.slice(0, 4).map((trend) => (
                <div key={trend.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={trend.status} />
                    <span className="text-xs text-gray-300 truncate max-w-[100px]">
                      {trend.trendText}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-nexus-400">
                    {trend.score}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Worker Health */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h2 className="text-sm font-semibold text-white mb-3">Worker Health</h2>
          <div className="space-y-2">
            {(Object.entries(healthMonitor.workers) as [string, string][]).map(
              ([name, status]) => (
                <div key={name} className="flex justify-between text-xs">
                  <span className="text-gray-400 capitalize">
                    Worker {name === 'content' ? '1' : name === 'publishing' ? '2' : name === 'aiScene' ? '3' : '4'}: {name === 'aiScene' ? 'AI Scene' : name.charAt(0).toUpperCase() + name.slice(1)}
                  </span>
                  <StatusBadge status={status} />
                </div>
              ),
            )}
            <div className="flex justify-between text-xs pt-1 border-t border-gray-700">
              <span className="text-gray-400">Redis</span>
              <StatusBadge status={healthMonitor.redis} />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Supabase</span>
              <StatusBadge status={healthMonitor.supabase} />
            </div>
          </div>
        </div>

        {/* Live SEO Indexing Feed */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h2 className="text-sm font-semibold text-white mb-3">Pages Indexed Today</h2>
          <div className="text-center py-2">
            <p className="text-3xl font-bold text-green-400">{analytics.totalIndexedPages}</p>
            <p className="text-xs text-gray-500 mt-1">total indexed pages</p>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>2 new blog posts today</span>
              <span className="text-green-400">submitted to GSC</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>1 page refreshed</span>
              <span className="text-green-400">re-indexed</span>
            </div>
          </div>
        </div>

        {/* Competitor Gap Snapshot */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h2 className="text-sm font-semibold text-white mb-3">Competitor Gap</h2>
          {audit ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Your DA</span>
                <span className="text-white font-medium">{audit.domainAuthority}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Backlinks</span>
                <span className="text-white font-medium">{audit.backlinkCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">GBP Rating</span>
                <span className="text-white font-medium">{audit.averageRating} ({audit.reviewCount} reviews)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Competitor DA</span>
                <span className="text-yellow-400 font-medium">45</span>
              </div>
              <div className="text-xs text-gray-500 mt-2 border-t border-gray-700 pt-2">
                Est. 6 months to close DA gap at current pace
              </div>
            </div>
          ) : (
            <EmptyState title="No audit data" description="Run an audit to see competitor gaps." />
          )}
        </div>
      </div>

      {/* Content Scheduled + Customer Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Scheduled — Next 3 Days */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h2 className="text-sm font-semibold text-white mb-3">Content Scheduled — Next 3 Days</h2>
          <div className="space-y-2">
            {posts.filter((p) => p.status === 'scheduled').map((post) => (
              <div key={post.id} className="flex items-center justify-between py-2 px-3 bg-gray-900/50 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">
                    {post.contentType.replace(/_/g, ' ')}
                  </span>
                  {post.platform && (
                    <span className="text-xs text-nexus-400">{post.platform}</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {post.scheduledFor
                    ? new Date(post.scheduledFor).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </span>
              </div>
            ))}
            {posts.filter(p => p.status === 'scheduled').length === 0 && (
              <EmptyState title="No scheduled content" description="Content will appear here when scheduled." />
            )}
            <div className="text-xs text-gray-500 mt-2">
              {analytics.postsScheduled24h} posts in next 24h | 2 blog posts queued for today
            </div>
          </div>
        </div>

        {/* Customer Activity */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h2 className="text-sm font-semibold text-white mb-3">Customer Activity</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Customers</span>
              <span className="text-white font-medium">{customers.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">New Today</span>
              <span className="text-green-400 font-medium">+{analytics.newCustomersToday}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Upcoming Birthdays (7d)</span>
              <span className="text-white font-medium">2</span>
            </div>
            <div className="mt-3 border-t border-gray-700 pt-3">
              <p className="text-xs text-gray-500 mb-2">Recent Activity</p>
              {customers.length === 0 ? (
                <EmptyState title="No customers yet" description="Customers will appear as they join." />
              ) : (
                customers.slice(0, 3).map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-300">
                      {c.firstName} {c.lastName}
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={c.tier} />
                      <span className="text-xs text-gray-500">{c.loyaltyPoints} pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Snapshot */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h2 className="text-sm font-semibold text-white mb-3">Revenue Snapshot</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-400">Today</p>
            <p className="text-xl font-bold text-white">K{analytics.revenueToday.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">This Week</p>
            <p className="text-xl font-bold text-white">K{analytics.revenueThisWeek.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">This Month</p>
            <p className="text-xl font-bold text-white">K{analytics.revenueThisMonth.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
