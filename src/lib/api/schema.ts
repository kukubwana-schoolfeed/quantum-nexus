/**
 * API Response Schema — Typed DTOs for every module
 * @module api/schema
 * @description Concrete response interfaces for all server route handlers.
 * Every handler returns ApiResponse<T> where T is defined here.
 * Aligned with DATA_MODELS.md table definitions.
 */

// ─── Platform Core ──────────────────────────────────────────────────

export interface OnboardingStepDTO {
  id: string;
  step: string;
  label: string;
  status: 'complete' | 'in_progress' | 'pending';
}

export interface NicheDTO {
  id: string;
  name: string;
  trendScore: number;
  competitionLevel: 'low' | 'medium' | 'high';
}

export interface NicheResearchDTO {
  nicheName: string;
  keywords: string[];
  contentFormats: string[];
  tone: string;
  platforms: string[];
  targetAudience: string;
  postingFrequency: Record<string, number>;
  regulatoryFlags: string[];
  contentRestrictions: string[];
  seoKeywordClusters: Array<{ cluster: string; keywords: string[] }>;
  competitorDomains: string[];
}

export interface ApiKeyDTO {
  id: string;
  keyName: string;
  isConnected: boolean;
  expiresAt: string | null;
}

export interface CompletenessScoreDTO {
  overall: number;
  sections: Record<string, number>;
  unlocks: {
    content_generation: boolean;
    publishing: boolean;
    analytics: boolean;
  };
}

export interface PendingAccountDTO {
  id: string;
  businessName: string;
  submittedAt: string;
  tier: string;
}

export interface TierDTO {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export interface InvoiceDTO {
  id: string;
  invoiceDate: string;
  dueDate: string;
  amountZmw: number;
  status: 'unpaid' | 'paid' | 'grace_period' | 'overdue' | 'written_off';
  paidAt: string | null;
}

export interface PaymentStatusDTO {
  status: 'current' | 'grace_period' | 'overdue' | 'suspended';
  lastPaymentDate: string | null;
  nextDueDate: string;
}

export interface ArchivedItemDTO {
  id: string;
  itemType: string;
  itemId: string;
  archivedAt: string;
  restorableUntil: string;
}

export interface SprintModeConfigDTO {
  active: boolean;
  postingMultiplier: number;
  clipExtractionMode: 'maximum' | 'normal';
  commentResponseSpeed: 'every' | 'filtered';
  trendCheckFrequency: 'daily' | 'weekly';
  warmupOverride: boolean;
  endsAt: string;
}

// ─── Business Modules ────────────────────────────────────────────────

export interface KeywordDTO {
  keyword: string;
  volume: number;
  difficulty: number;
  currentRank: number;
}

export interface KeywordStrategyDTO {
  keywords: KeywordDTO[];
}

export interface SeoOverviewDTO {
  domainAuthority: number;
  indexedPages: number;
  backlinks: number;
}

export interface ContentPostDTO {
  id: string;
  contentType: string;
  platform: string | null;
  caption: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  blogContent: string | null;
  emailSubject: string | null;
  targetKeyword: string | null;
  status: string;
  scheduledFor: string | null;
  publishedAt: string | null;
  algorithmScore: number | null;
  safetyCheckResult: 'pass' | 'fail' | null;
  impressions: number;
  engagement: number;
  engagementRate: number | null;
  createdAt: string;
}

export interface ConnectedPlatformDTO {
  platform: string;
  connected: boolean;
  username: string | null;
  tokenExpiresAt: string | null;
}

export interface CallLogDTO {
  id: string;
  callerPhone: string;
  duration: number;
  classification: 'resolved' | 'complex' | 'pricing_query';
  transcript: string;
  timestamp: string;
  handoffInitiated: boolean;
}

export interface SalesCampaignDTO {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  targetsCount: number;
  responsesCount: number;
}

export interface GbpProfileDTO {
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
}

export interface GbpInsightsDTO {
  views: number;
  searches: number;
  directionRequests: number;
}

export interface BroadcastDTO {
  id: string;
  type: 'whatsapp' | 'email' | 'sms';
  subject: string | null;
  body: string;
  status: 'draft' | 'sent' | 'scheduled' | 'failed';
  sentAt: string | null;
  scheduledFor: string | null;
  recipientCount: number;
}

export interface CustomerDTO {
  id: string;
  firstName: string;
  lastName: string | null;
  phoneNumber: string;
  email: string | null;
  source: string;
  hasBirthday: boolean;
  birthdayThisMonth: boolean;
  daysUntilBirthday: number | null;
  loyaltyPoints: number;
  tier: string;
  totalSpend: number;
  visitCount: number;
  status: 'active' | 'inactive' | 'blocked';
}

export interface BirthdayConfigDTO {
  autoSendEnabled: boolean;
  daysBefore: number;
  offerTemplate: string;
}

export interface BirthdayTokenDTO {
  token: string;
  offerDescription: string;
  expiresAt: string;
  redeemed: boolean;
}

export interface BirthdayUpcomingDTO {
  upcoming: Array<{
    customerId: string;
    firstName: string;
    daysUntil: number;
  }>;
  count: number;
}

export interface ReviewCampaignDTO {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed';
  sentCount: number;
  responseCount: number;
}

export interface TestimonialRequestDTO {
  id: string;
  customerName: string;
  status: 'sent' | 'received' | 'expired';
  sentAt: string;
  videoUrl: string | null;
}

export interface LoyaltyBalanceDTO {
  points: number;
  tier: string;
}

export interface LoyaltyTransactionDTO {
  id: string;
  type: 'earn' | 'redeem' | 'expire' | 'adjustment';
  points: number;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
}

export interface LeadMagnetDTO {
  id: string;
  title: string;
  type: 'pdf' | 'checklist' | 'template';
  status: 'draft' | 'active' | 'archived';
  downloads: number;
  url: string | null;
}

export interface SeasonalCampaignDTO {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  startsAt: string;
  endsAt: string;
}

export interface QrCodeDTO {
  url: string;
  imageUrl: string;
}

export interface JoinPageDTO {
  businessName: string;
  slug: string;
}

export interface CompetitorDTO {
  domain: string;
  domainAuthority: number;
  indexedPages: number;
  backlinks: number;
}

export interface ReputationOverviewDTO {
  averageRating: number;
  totalReviews: number;
  responseRate: number;
}

export interface ApprovalQueueItemDTO {
  id: string;
  contentType: string;
  platform: string | null;
  status: 'pending_approval' | 'approved' | 'rejected';
  createdAt: string;
}

export interface KnowledgeBaseEntryDTO {
  id: string;
  title: string;
  content: string;
  category: string;
  source: 'manual' | 'document_upload' | 'ai_extracted';
  isActive: boolean;
}

export interface CommunityPostDTO {
  id: string;
  authorId: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface CommunityCommentDTO {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface AnalyticsOverviewDTO {
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  postsPublishedToday: number;
  postsScheduled24h: number;
  newCustomersToday: number;
  totalIndexedPages: number;
  pagesIndexedToday: number;
  tasksTodayTotal: number;
  tasksTodayComplete: number;
  latestHealthScore: number;
  healthTrend: string | null;
  latestVelocityScore: number;
  totalRevenue?: number;
  monthlyRevenue?: number;
  totalPosts?: number;
  totalFollowers?: number;
  totalEngagement?: number;
  growthRate?: number;
}

export interface ChartDataDTO {
  data: Array<{ label: string; value: number }>;
  period: string;
}

export interface DailyReportDTO {
  date: string;
  summary: string;
  channels: string[];
}

export interface ReportConfigDTO {
  channels: string[];
  time: string;
}

export interface CrisisAlertDTO {
  id: string;
  platform: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  detectedAt: string;
  acknowledged: boolean;
}

export interface CrisisSettingsDTO {
  autoPauseEnabled: boolean;
  sensitivityLevel: 'low' | 'medium' | 'high';
}

export interface CallFallbackConfigDTO {
  humanHandoffMessage: string;
  followUpDelayMinutes: number;
}

export interface WhiteLabelAppDTO {
  id: string;
  name: string;
  platform: 'android' | 'ios' | 'both';
  status: 'draft' | 'submitted' | 'published' | 'rejected';
  bundleId: string | null;
  iconUrl: string | null;
}

export interface AlgorithmScoreDTO {
  score: number;
  breakdown: Record<string, number>;
  platform: string;
  passed: boolean;
  suggestions: string[];
}

export interface AlgorithmThresholdDTO {
  platform: string;
  threshold: number;
}

// ─── Domination Modules ──────────────────────────────────────────────

export interface BusinessAuditDTO {
  id: string;
  auditType: 'initial' | 'monthly_refresh' | 'on_demand';
  domainAuthority: number;
  totalIndexedPages: number;
  backlinkCount: number;
  gscImpressions90d: number;
  gscClicks90d: number;
  gbpCompleteness: number;
  reviewCount: number;
  averageRating: number;
  socialPresence: Record<string, unknown>;
  competitorData: Array<Record<string, unknown>>;
  recommendedPriority: string[];
  summary: string;
  createdAt: string;
}

export interface DailyBlogScheduleDTO {
  posts: Array<{ time: string; keyword: string; postId: string | null }>;
}

export interface QaTaskDTO {
  id: string;
  platform: string;
  questionText: string;
  answerText: string;
  status: 'pending' | 'awaiting_confirmation' | 'answered';
  questionPostedAt: string | null;
}

export interface DirectorySubmissionDTO {
  id: string;
  directoryName: string;
  status: 'pending' | 'submitted' | 'live' | 'rejected';
  listingUrl: string | null;
}

export interface TrendDTO {
  id: string;
  trendType: string;
  trendText: string;
  platform: string | null;
  score: number;
  status: 'NEW' | 'ACTIVE' | 'AGING' | 'EXPIRED';
  detectedAt: string;
  expiredAt: string | null;
  expiryReason: string | null;
  timesUsedInContent: number;
}

export interface TrendScanResultDTO {
  newTrendsFound: number;
  trendsUpdated: number;
}

export interface RecyclingCandidateDTO {
  postId: string;
  contentType: string;
  platform: string;
  performanceScore: number;
  daysSincePublish: number;
  suggestedFormats: string[];
}

export interface EntityListingDTO {
  id: string;
  directoryName: string;
  directoryUrl: string | null;
  listingUrl: string | null;
  status: 'pending' | 'submitted' | 'live' | 'inconsistent' | 'rejected';
  isConsistent: boolean | null;
  submittedName: string;
  submittedAddress: string | null;
  submittedPhone: string | null;
}

export interface EntityConsistencyDTO {
  consistent: number;
  inconsistent: number;
  pending: number;
}

export interface ReputationVelocityDTO {
  velocityScore: number;
  velocityTrend: 'improving' | 'stable' | 'declining';
  newBacklinks: number;
  newIndexedPages: number;
  newReviews: number;
  netNewFollowers: number;
  gscImpressionsGrowth: number;
}

export interface CannibalisationReportDTO {
  id: string;
  conflictingKeyword: string;
  strongPostUrl: string;
  weakPostUrl: string;
  recommendedAction: 'consolidate' | 'redirect';
  status: 'pending' | 'approved' | 'dismissed';
}

export interface ClientHealthScoreDTO {
  totalScore: number;
  trend: 'improving' | 'stable' | 'declining';
  seoScore: number;
  contentScore: number;
  reviewScore: number;
  socialScore: number;
  entityScore: number;
  retentionScore: number;
  topRecommendations: string[];
}

// ─── UGC Modules ─────────────────────────────────────────────────────

export interface UgcVideoDTO {
  id: string;
  fileName: string;
  fileSize: number;
  durationSeconds: number | null;
  status: 'uploading' | 'uploaded' | 'transcribing' | 'transcribed' | 'analysed';
  uploadedAt: string;
  r2Url: string;
  transcript: string | null;
}

export interface UgcClipDTO {
  id: string;
  videoId: string;
  startTime: number;
  endTime: number;
  score: number;
  hookText: string;
  status: 'candidate' | 'approved' | 'rejected' | 'rendered';
}

export interface ClipPreviewDTO {
  thumbnailUrl: string;
  duration: number;
}

export interface RenderJobDTO {
  id: string;
  clipId: string;
  status: 'queued' | 'processing' | 'complete' | 'failed';
  progress: number;
  outputUrl: string | null;
  createdAt: string;
}

export interface CalendarEntryDTO {
  id: string;
  clipId: string;
  platform: string;
  scheduledFor: string;
  status: 'scheduled' | 'published' | 'failed';
}

export interface UgcTrendDTO {
  id: string;
  trendType: string;
  trendText: string;
  platform: string;
  score: number;
}

export interface ClipPerformanceDTO {
  views: number;
  engagement: number;
  saves: number;
  shares: number;
}

export interface MonetisationOpportunityDTO {
  id: string;
  brandName: string;
  campaignType: string;
  estimatedPay: number;
  deadline: string;
  status: 'available' | 'applied' | 'accepted' | 'rejected';
}

export interface SuggestedRatesDTO {
  minRate: number;
  suggestedRate: number;
  maxRate: number;
}

export interface PodcastEpisodeDTO {
  id: string;
  title: string;
  durationSeconds: number;
  status: 'processing' | 'ready' | 'published';
  audioUrl: string | null;
  publishedAt: string | null;
}

// ─── Faceless Channel Modules ────────────────────────────────────────

export interface FacelessCharacterDTO {
  id: string;
  name: string;
  personality: string;
  voiceId: string;
  avatarStyle: 'illustrated' | 'animated' | 'ai_generated';
  backstory: string | null;
  isActive: boolean;
}

export interface StorylineDTO {
  id: string;
  title: string;
  characterId: string;
  episodeCount: number;
  status: 'draft' | 'active' | 'completed' | 'paused';
  description: string | null;
}

export interface SeriesBibleDTO {
  id: string;
  storylineId: string;
  worldRules: string;
  recurringThemes: string[];
  toneNotes: string;
  characterArcs: string | null;
}

export interface EpisodeOutlineDTO {
  id: string;
  storylineId: string;
  episodeNumber: number;
  title: string;
  synopsis: string;
  status: 'draft' | 'approved' | 'in_production' | 'published';
}

export interface SceneDTO {
  id: string;
  outlineId: string;
  sceneNumber: number;
  description: string;
  visualStyle: string;
  durationSeconds: number;
  scriptText: string;
}

export interface RunwayJobDTO {
  id: string;
  sceneId: string;
  status: 'queued' | 'processing' | 'complete' | 'failed';
  progress: number;
  outputUrl: string | null;
  submittedAt: string;
}

export interface RunwayQuotaDTO {
  used: number;
  limit: number;
  remaining: number;
}

export interface VoiceJobDTO {
  id: string;
  characterId: string;
  provider: string;
  voiceId: string;
  sampleUrl: string | null;
  status: 'queued' | 'processing' | 'complete';
}

export interface AssemblyJobDTO {
  id: string;
  episodeId: string;
  status: 'queued' | 'processing' | 'complete' | 'failed';
  progress: number;
  previewUrl: string | null;
  outputUrl: string | null;
}

export interface ThumbnailDTO {
  id: string;
  episodeId: string;
  url: string;
  style: string;
  isSelected: boolean;
}

export interface AudienceInsightsDTO {
  avgViewDuration: number;
  topDemographic: string;
  engagementPeakDay: string;
  suggestedPostTime: string;
}

export interface AudienceGrowthDTO {
  subscribers: number;
  views: number;
  growthRate: number;
}

export interface EpisodeTrackerDTO {
  id: string;
  storylineId: string;
  episodeNumber: number;
  title: string;
  status: 'draft' | 'published' | 'failed';
  publishedAt: string | null;
  views: number;
  engagement: number;
}

// ─── Shared Modules ──────────────────────────────────────────────────

export interface BubbleMessageDTO {
  response: string;
  conversationId: string;
}

export interface BubbleConversationDTO {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  conversationId: string;
}

export interface InspirationUploadDTO {
  fileId: string;
  analysisStatus: 'processing' | 'complete' | 'failed';
}

export interface InspirationAnalysisDTO {
  status: 'processing' | 'complete' | 'failed';
  analysis: string;
  suggestedContentPlan: string[] | null;
}

export interface WarmupStatusDTO {
  daysActive: number;
  limits: { dailyPosts: number; dailyStories: number };
  isWarmupComplete: boolean;
}

export interface WarmupLimitsDTO {
  dailyPosts: number;
  dailyStories: number;
  dailyComments: number;
}

export interface SafetyCheckDTO {
  result: 'pass' | 'fail';
  flags: string[];
  score: number;
}

export interface OAuthTokenDTO {
  platform: string;
  isValid: boolean;
  expiresAt: string | null;
}

export interface ExpiringTokenDTO {
  keyName: string;
  platform: string;
  expiresAt: string;
  hoursUntilExpiry: number;
}

export interface QueueStatusDTO {
  queue: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

export interface JobDetailsDTO {
  id: string;
  status: string;
  progress: number;
  createdAt: string;
  processedAt: string | null;
}

export interface MediaUploadDTO {
  url: string;
  key: string;
}

export interface SignedUrlDTO {
  url: string;
  expiresAt: string;
}

export interface TranscriptionDTO {
  id: string;
  status: 'processing' | 'complete' | 'failed';
  text: string | null;
  language: string | null;
}

export interface NotificationDTO {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  readAt: string | null;
  actionUrl: string | null;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  createdAt: string;
}

export interface UnreadCountDTO {
  count: number;
}

export interface WarmupScheduleDTO {
  postsPerDay: number;
  optimalTimes: string[];
}

// ─── App Developer Modules ───────────────────────────────────────────

export interface AppDTO {
  id: string;
  name: string;
  platform: 'android' | 'ios' | 'both';
  category: string;
  status: 'draft' | 'published' | 'suspended';
  downloads: number;
  iconUrl: string | null;
}

export interface AppListingDTO {
  title: string;
  description: string;
  keywords: string[];
  screenshots: string[];
}

export interface ASOScoreDTO {
  score: number;
  suggestions: string[];
}

export interface RankHistoryDTO {
  ranks: Array<{ date: string; rank: number }>;
  keyword: string;
}

export interface AppReviewDTO {
  id: string;
  author: string;
  rating: number;
  text: string;
  repliedAt: string | null;
  replyText: string | null;
  platform: string;
  createdAt: string;
}

export interface AppReviewStatsDTO {
  averageRating: number;
  totalReviews: number;
  responseRate: number;
}

export interface ReleaseNotesDTO {
  content: string;
  version: string;
}

export interface GeneratedDescriptionDTO {
  content: string;
}

export interface ScreenshotGenerationDTO {
  urls: string[];
}

export interface SupportTicketDTO {
  id: string;
  appId: string;
  userEmail: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
}

export interface AppAnalyticsOverviewDTO {
  downloads: number;
  activeUsers: number;
  revenue: number;
  crashRate: number;
}

export interface AppRevenueDTO {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export interface AppChurnDTO {
  rate: number;
  trend: 'improving' | 'stable' | 'declining';
}

// ─── Admin Modules ───────────────────────────────────────────────────

export interface PlatformStatsDTO {
  totalTenants: number;
  activeTenants: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

export interface TenantSummaryDTO {
  id: string;
  businessName: string;
  tier: string;
  status: string;
  activatedAt: string | null;
  healthScore: number | null;
}

export interface TenantDetailsDTO {
  id: string;
  name: string;
  status: string;
  tier: string;
  niche: string;
  completenessScore: number;
  sprintModeActive: boolean;
  activatedAt: string | null;
}

export interface ResellerBrandingDTO {
  brandName: string;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string | null;
}

export interface ResellerClientDTO {
  id: string;
  name: string;
  status: string;
  tier: string;
  monthlySpend: number;
}

export interface DeadJobDTO {
  id: string;
  tenantId: string | null;
  queueName: string;
  jobType: string;
  errorMessage: string;
  failedAt: string;
  reviewed: boolean;
}

export interface CostOverviewDTO {
  anthropic: number;
  elevenlabs: number;
  twilio: number;
  runway: number;
  total: number;
}

export interface PlatformHealthDTO {
  workers: {
    content: 'green' | 'amber' | 'red';
    publishing: 'green' | 'amber' | 'red';
    aiScene: 'green' | 'amber' | 'red';
    analytics: 'green' | 'amber' | 'red';
  };
  redis: 'green' | 'amber' | 'red';
  supabase: 'green' | 'amber' | 'red';
  uptime: number;
}

export interface WorkerDetailsDTO {
  worker: string;
  status: 'green' | 'amber' | 'red';
  jobsProcessed: number;
  errorRate: number;
  lastJobAt: string;
}

export interface PlatformAlertDTO {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  detectedAt: string;
  resolved: boolean;
}

export interface NicheReviewDTO {
  id: string;
  nicheName: string;
  submittedAt: string;
  status: 'pending_review' | 'approved' | 'rejected';
}

export interface AppSubmissionDTO {
  id: string;
  appId: string;
  appName: string;
  submittedAt: string;
  status: 'submitted' | 'approved' | 'rejected';
  reviewerNotes: string | null;
}

// ─── Mission Control ─────────────────────────────────────────────────

export interface MissionControlDTO {
  livePostQueue: ContentPostDTO[];
  seoTasksToday: { total: number; complete: number };
  activeTrends: TrendDTO[];
  contentScheduled3Days: ContentPostDTO[];
  customerActivity: { newToday: number; upcomingBirthdays7d: number };
  revenueSnapshot: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  workerHealth: {
    content: 'green' | 'amber' | 'red';
    publishing: 'green' | 'amber' | 'red';
    aiScene: 'green' | 'amber' | 'red';
    analytics: 'green' | 'amber' | 'red';
  };
  reputationVelocity: ReputationVelocityDTO;
  clientHealthScore: ClientHealthScoreDTO;
  liveIndexingFeed: Array<{ pageUrl: string; indexedAt: string }>;
  competitorGapSnapshot: Array<{ metric: string; gap: number }>;
}

// ─── Retention Layer ────────────────────────────────────────────────────

export interface RetentionDashboardDTO {
  totalCustomers: number;
  activeCustomers: number;
  atRiskCustomers: number;
  churnedCustomers: number;
  averageLoyaltyPoints: number;
  birthdayParticipationRate: number;
  averageReviewRating: number;
  retentionRate30d: number;
  retentionRate90d: number;
}

export interface ChurnRiskDTO {
  customerId: string;
  firstName: string;
  lastName: string | null;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  lastActivityAt: string;
  daysInactive: number;
  loyaltyPoints: number;
  totalVisits: number;
  totalSpend: number;
  suggestedAction: string;
}

export interface CohortDataDTO {
  cohort: string;
  cohortSize: number;
  retainedCounts: Record<string, number>;
  retentionRates: Record<string, number>;
}

export interface WinBackResultDTO {
  customerId: string;
  method: 'notification' | 'loyalty_bonus' | 'birthday_token' | 'discount';
  status: 'triggered' | 'failed' | 'skipped';
  message: string;
}

export interface RetentionConfigDTO {
  churnWarningDays: number;
  churnCriticalDays: number;
  autoWinBackEnabled: boolean;
  winBackMethod: 'notification' | 'loyalty_bonus' | 'birthday_token' | 'discount';
  loyaltyBonusPoints: number;
  digestFrequency: 'daily' | 'weekly';
}

export interface BirthdayRedemptionStatsDTO {
  totalGenerated: number;
  totalRedeemed: number;
  totalExpired: number;
  redemptionRate: number;
  thisMonthGenerated: number;
  thisMonthRedeemed: number;
}

export interface DeliveryLogDTO {
  notificationId: string;
  channel: 'in_app' | 'push' | 'email' | 'sms';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt: string | null;
  deliveredAt: string | null;
  failureReason: string | null;
}

export interface DigestDTO {
  date: string;
  notificationCount: number;
  notifications: NotificationDTO[];
  summary: string;
}

export interface HealthScoreAlertDTO {
  id: string;
  tenantId: string;
  previousScore: number;
  currentScore: number;
  delta: number;
  direction: 'improving' | 'declining';
  triggeredAt: string;
  acknowledged: boolean;
}

export interface PeerComparisonDTO {
  tenantScore: number;
  peerAverage: number;
  peerMedian: number;
  percentile: number;
  peerCount: number;
  tier: string;
}

// ─── Generic action confirmations ────────────────────────────────────

export interface ActionConfirmationDTO {
  success: boolean;
  message?: string;
}

export interface IdReferenceDTO {
  id: string;
}

export interface ImportResultDTO {
  importedCount: number;
  failedCount: number;
  errors?: Array<{ row: number; reason: string }>;
}
