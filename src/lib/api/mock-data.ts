/**
 * Mock Data for Phase 2
 * @module api/mock-data
 * @description Realistic typed mock data for all modules.
 * Every external call in Phase 2 uses MOCK_DATA per RULE P-1 and RULE P-2.
 * Primary demo tenant: The Flame Grill — Restaurant in Lusaka, Zambia.
 * Replace with real data in Phase 3+.
 */

import type {
  OnboardingStepDTO, NicheDTO, NicheResearchDTO, ApiKeyDTO, CompletenessScoreDTO,
  PendingAccountDTO, TierDTO, InvoiceDTO, PaymentStatusDTO, ArchivedItemDTO,
  SprintModeConfigDTO, KeywordStrategyDTO, SeoOverviewDTO, ContentPostDTO,
  ConnectedPlatformDTO, CallLogDTO, SalesCampaignDTO, GbpProfileDTO, GbpInsightsDTO,
  BroadcastDTO, CustomerDTO, BirthdayConfigDTO, BirthdayUpcomingDTO, BirthdayTokenDTO,
  ReviewCampaignDTO, TestimonialRequestDTO, LoyaltyBalanceDTO, LoyaltyTransactionDTO,
  LeadMagnetDTO, SeasonalCampaignDTO, QrCodeDTO, JoinPageDTO, CompetitorDTO,
  ReputationOverviewDTO, ApprovalQueueItemDTO, KnowledgeBaseEntryDTO,
  CommunityPostDTO, CommunityCommentDTO, AnalyticsOverviewDTO, ChartDataDTO,
  DailyReportDTO, ReportConfigDTO, CrisisAlertDTO, CrisisSettingsDTO,
  CallFallbackConfigDTO, WhiteLabelAppDTO, AlgorithmScoreDTO, AlgorithmThresholdDTO,
  BusinessAuditDTO, DailyBlogScheduleDTO, QaTaskDTO, DirectorySubmissionDTO,
  TrendDTO, TrendScanResultDTO, RecyclingCandidateDTO, EntityListingDTO,
  EntityConsistencyDTO, ReputationVelocityDTO, CannibalisationReportDTO,
  ClientHealthScoreDTO, UgcVideoDTO, UgcClipDTO, ClipPreviewDTO, RenderJobDTO,
  CalendarEntryDTO, UgcTrendDTO, ClipPerformanceDTO, MonetisationOpportunityDTO,
  SuggestedRatesDTO, PodcastEpisodeDTO, FacelessCharacterDTO, StorylineDTO,
  SeriesBibleDTO, EpisodeOutlineDTO, SceneDTO, RunwayJobDTO, RunwayQuotaDTO,
  VoiceJobDTO, AssemblyJobDTO, ThumbnailDTO, AudienceInsightsDTO,
  AudienceGrowthDTO, EpisodeTrackerDTO, BubbleMessageDTO, BubbleConversationDTO,
  InspirationUploadDTO, InspirationAnalysisDTO, WarmupStatusDTO, WarmupLimitsDTO,
  SafetyCheckDTO, OAuthTokenDTO, ExpiringTokenDTO, QueueStatusDTO, JobDetailsDTO,
  MediaUploadDTO, SignedUrlDTO, TranscriptionDTO, NotificationDTO,
  UnreadCountDTO, WarmupScheduleDTO, AppDTO, AppListingDTO, ASOScoreDTO,
  RankHistoryDTO, AppReviewDTO, AppReviewStatsDTO, ReleaseNotesDTO,
  GeneratedDescriptionDTO, ScreenshotGenerationDTO, SupportTicketDTO,
  AppAnalyticsOverviewDTO, AppRevenueDTO, AppChurnDTO, PlatformStatsDTO,
  TenantSummaryDTO, TenantDetailsDTO, ResellerBrandingDTO, ResellerClientDTO,
  DeadJobDTO, CostOverviewDTO, PlatformHealthDTO, WorkerDetailsDTO,
  PlatformAlertDTO, NicheReviewDTO, AppSubmissionDTO, MissionControlDTO,
  ActionConfirmationDTO, IdReferenceDTO, ImportResultDTO,
} from './schema';

// ═══════════════════════════════════════════════════════════════════════
// STATIC DATA — Realistic Lusaka restaurant: The Flame Grill
// ═══════════════════════════════════════════════════════════════════════

const ONBOARDING_STEPS: OnboardingStepDTO[] = [
  { id: '1', step: 'business_info', label: 'Business Information', status: 'complete' },
  { id: '2', step: 'niche_selection', label: 'Niche Selection', status: 'complete' },
  { id: '3', step: 'brand_voice', label: 'Brand Voice', status: 'complete' },
  { id: '4', step: 'services_pricing', label: 'Services & Pricing', status: 'complete' },
  { id: '5', step: 'platforms', label: 'Platform Connections', status: 'in_progress' },
  { id: '6', step: 'review', label: 'Review & Activate', status: 'pending' },
];

const NICHES: NicheDTO[] = [
  { id: 'n1', name: 'Restaurant', trendScore: 85, competitionLevel: 'medium' },
  { id: 'n2', name: 'Salon & Beauty', trendScore: 78, competitionLevel: 'high' },
  { id: 'n3', name: 'Fitness & Gym', trendScore: 72, competitionLevel: 'medium' },
  { id: 'n4', name: 'Legal Services', trendScore: 65, competitionLevel: 'low' },
  { id: 'n5', name: 'Auto Repair', trendScore: 58, competitionLevel: 'low' },
  { id: 'n6', name: 'Real Estate', trendScore: 70, competitionLevel: 'medium' },
];

const NICHE_RESEARCH: NicheResearchDTO = {
  nicheName: 'Restaurant',
  keywords: ['best restaurant in lusaka', 'zambian cuisine', 'fine dining lusaka', 'braai restaurant zambia', 'nshima near me'],
  contentFormats: ['blog_post', 'instagram_reel', 'tiktok', 'facebook_post'],
  tone: 'Warm, inviting, proudly Zambian',
  platforms: ['instagram', 'tiktok', 'facebook', 'youtube'],
  targetAudience: 'Lusaka professionals and families aged 25-50 who enjoy quality dining experiences',
  postingFrequency: { instagram: 5, tiktok: 3, facebook: 2, youtube: 1 },
  regulatoryFlags: ['food_safety_standards'],
  contentRestrictions: ['no_raw_meat_imagery', 'no_alcohol_focus'],
  seoKeywordClusters: [
    { cluster: 'dining', keywords: ['restaurant', 'fine dining', 'dinner lusaka'] },
    { cluster: 'zambian_food', keywords: ['nshima', 'braai', 'zambian cuisine', 'ifisashi'] },
    { cluster: 'location', keywords: ['lusaka restaurant', 'eat lusaka', 'dining cairo road'] },
  ],
  competitorDomains: ['mintbistro.co.zm', 'the_delicatessen.co.zm', 'marlin_lodge.co.zm'],
};

const API_KEYS: ApiKeyDTO[] = [
  { id: 'k1', keyName: 'anthropic_api_key', isConnected: true, expiresAt: null },
  { id: 'k2', keyName: 'meta_oauth_token', isConnected: true, expiresAt: '2026-05-12T00:00:00Z' },
  { id: 'k3', keyName: 'google_oauth_token', isConnected: true, expiresAt: '2026-05-20T00:00:00Z' },
  { id: 'k4', keyName: 'tiktok_oauth_token', isConnected: false, expiresAt: null },
];

const COMPLETENESS_SCORE: CompletenessScoreDTO = {
  overall: 78,
  sections: { business_info: 100, niche_profile: 95, brand_voice: 90, services_pricing: 85, platforms: 40, knowledge_base: 60 },
  unlocks: { content_generation: true, publishing: true, analytics: false },
};

const PENDING_ACCOUNTS: PendingAccountDTO[] = [
  { id: 'pa1', businessName: 'Chitenge Boutique', submittedAt: '2026-04-14T10:30:00Z', tier: 'growth' },
  { id: 'pa2', businessName: 'Munga Fitness Studio', submittedAt: '2026-04-15T08:15:00Z', tier: 'pro' },
];

const TIERS: TierDTO[] = [
  { id: 'basic', name: 'Basic', price: 0, features: ['content_generation'] },
  { id: 'growth', name: 'Growth', price: 500, features: ['content_generation', 'publishing'] },
  { id: 'pro', name: 'Pro', price: 1500, features: ['content_generation', 'publishing', 'ai_scene', 'analytics'] },
  { id: 'enterprise', name: 'Enterprise', price: 5000, features: ['all'] },
];

const INVOICES: InvoiceDTO[] = [
  { id: 'inv1', invoiceDate: '2026-04-01', dueDate: '2026-04-14', amountZmw: 7500, status: 'unpaid', paidAt: null },
  { id: 'inv2', invoiceDate: '2026-03-01', dueDate: '2026-03-14', amountZmw: 7500, status: 'paid', paidAt: '2026-03-10T14:30:00Z' },
  { id: 'inv3', invoiceDate: '2026-02-01', dueDate: '2026-02-14', amountZmw: 7500, status: 'paid', paidAt: '2026-02-08T09:00:00Z' },
];

const KEYWORD_STRATEGY: KeywordStrategyDTO = {
  keywords: [
    { keyword: 'best restaurant in lusaka', volume: 1200, difficulty: 35, currentRank: 15 },
    { keyword: 'zambian braai restaurant', volume: 480, difficulty: 18, currentRank: 5 },
    { keyword: 'nshima restaurant near me', volume: 720, difficulty: 22, currentRank: 8 },
    { keyword: 'fine dining lusaka', volume: 340, difficulty: 40, currentRank: 22 },
    { keyword: 'family restaurant cairo road', volume: 260, difficulty: 15, currentRank: 3 },
  ],
};

const CONTENT_POSTS: ContentPostDTO[] = [
  { id: 'cp1', contentType: 'social_post', platform: 'instagram', caption: 'Friday braai night at The Flame Grill! 🔥 Our signature mixed grill platter — ribs, boerewors, and chicken, flame-kissed to perfection. Tag someone who needs this.', mediaUrl: 'https://media.quantumnexus.app/the-flame-grill/ig-braai-night.jpg', mediaType: 'image', blogContent: null, emailSubject: null, targetKeyword: null, status: 'published', scheduledFor: null, publishedAt: '2026-04-11T18:00:00Z', algorithmScore: 82, safetyCheckResult: 'pass', impressions: 2450, engagement: 312, engagementRate: 12.73, createdAt: '2026-04-11T10:00:00Z' },
  { id: 'cp2', contentType: 'blog_post', platform: null, caption: null, mediaUrl: null, mediaType: null, blogContent: '# The Ultimate Guide to Zambian Braai Culture\n\nZambia has a rich tradition of outdoor cooking that brings families together...', emailSubject: null, targetKeyword: 'zambian braai restaurant', status: 'published', scheduledFor: null, publishedAt: '2026-04-10T06:00:00Z', algorithmScore: 78, safetyCheckResult: 'pass', impressions: 850, engagement: 45, engagementRate: 5.29, createdAt: '2026-04-09T14:00:00Z' },
  { id: 'cp3', contentType: 'social_post', platform: 'tiktok', caption: 'Wait for the flip... 🤤 Our chef perfecting the nshima flip. #ZambianFood #LusakaEats #TheFlameGrill', mediaUrl: 'https://media.quantumnexus.app/the-flame-grill/tiktok-nshima.mp4', mediaType: 'video', blogContent: null, emailSubject: null, targetKeyword: null, status: 'scheduled', scheduledFor: '2026-04-16T12:00:00Z', publishedAt: null, algorithmScore: 88, safetyCheckResult: 'pass', impressions: 0, engagement: 0, engagementRate: null, createdAt: '2026-04-14T09:30:00Z' },
  { id: 'cp4', contentType: 'social_post', platform: 'facebook', caption: 'This weekend, bring the whole family! Kids eat free on Saturdays at The Flame Grill. Live music from 7pm. 🎵', mediaUrl: null, mediaType: null, blogContent: null, emailSubject: null, targetKeyword: null, status: 'scheduled', scheduledFor: '2026-04-17T10:00:00Z', publishedAt: null, algorithmScore: 72, safetyCheckResult: 'pass', impressions: 0, engagement: 0, engagementRate: null, createdAt: '2026-04-15T11:00:00Z' },
  { id: 'cp5', contentType: 'blog_post', platform: null, caption: null, mediaUrl: null, mediaType: null, blogContent: '# 5 Must-Try Zambian Dishes for Visitors\n\nVisiting Lusaka? Here are the dishes you absolutely cannot leave without trying...', emailSubject: null, targetKeyword: 'zambian cuisine', status: 'draft', scheduledFor: null, publishedAt: null, algorithmScore: null, safetyCheckResult: null, impressions: 0, engagement: 0, engagementRate: null, createdAt: '2026-04-15T16:00:00Z' },
  { id: 'cp6', contentType: 'whatsapp_broadcast', platform: 'whatsapp', caption: 'Happy Easter from The Flame Grill! 🐣 Special Easter Sunday lunch menu — K150 per person. Book your table now: +260 97 1234567', mediaUrl: null, mediaType: null, blogContent: null, emailSubject: null, targetKeyword: null, status: 'published', scheduledFor: null, publishedAt: '2026-04-05T09:00:00Z', algorithmScore: null, safetyCheckResult: 'pass', impressions: 320, engagement: 28, engagementRate: 8.75, createdAt: '2026-04-04T18:00:00Z' },
];

const CONNECTED_PLATFORMS: ConnectedPlatformDTO[] = [
  { platform: 'instagram', connected: true, username: '@theflamegrill_lsk', tokenExpiresAt: '2026-06-01T00:00:00Z' },
  { platform: 'facebook', connected: true, username: 'The Flame Grill Lusaka', tokenExpiresAt: '2026-06-01T00:00:00Z' },
  { platform: 'tiktok', connected: true, username: '@flamegrill_zm', tokenExpiresAt: '2026-05-01T00:00:00Z' },
  { platform: 'youtube', connected: false, username: null, tokenExpiresAt: null },
  { platform: 'linkedin', connected: false, username: null, tokenExpiresAt: null },
  { platform: 'pinterest', connected: false, username: null, tokenExpiresAt: null },
];

const CALL_LOG: CallLogDTO[] = [
  { id: 'cl1', callerPhone: '+260977000001', duration: 95, classification: 'resolved', transcript: 'Caller asked about opening hours. Confirmed Mon-Sat 11am-10pm, Sunday 12pm-8pm.', timestamp: '2026-04-16T09:12:00Z', handoffInitiated: false },
  { id: 'cl2', callerPhone: '+260955000023', duration: 180, classification: 'pricing_query', transcript: 'Caller asked about braai platter price. Confirmed K250 for two, K450 for family platter.', timestamp: '2026-04-16T11:30:00Z', handoffInitiated: false },
  { id: 'cl3', callerPhone: '+260966000045', duration: 45, classification: 'complex', transcript: 'Caller wants to book a private event for 80 guests with custom menu. Requires human follow-up.', timestamp: '2026-04-16T14:05:00Z', handoffInitiated: true },
];

const CUSTOMERS: CustomerDTO[] = [
  { id: 'c1', firstName: 'Chanda', lastName: 'Mulenga', phoneNumber: '+260977000001', email: 'chanda.m@email.zm', source: 'qr_bridge', hasBirthday: true, birthdayThisMonth: false, daysUntilBirthday: 42, loyaltyPoints: 350, tier: 'priority', totalSpend: 4500, visitCount: 28, status: 'active' },
  { id: 'c2', firstName: 'Mwansa', lastName: 'Banda', phoneNumber: '+260955000023', email: 'mwansa.b@email.zm', source: 'call', hasBirthday: true, birthdayThisMonth: true, daysUntilBirthday: 5, loyaltyPoints: 120, tier: 'standard', totalSpend: 1800, visitCount: 12, status: 'active' },
  { id: 'c3', firstName: 'Tendai', lastName: 'Phiri', phoneNumber: '+260966000045', email: null, source: 'whatsapp', hasBirthday: false, birthdayThisMonth: false, daysUntilBirthday: null, loyaltyPoints: 80, tier: 'standard', totalSpend: 950, visitCount: 6, status: 'active' },
  { id: 'c4', firstName: 'Bwalya', lastName: 'Chisenga', phoneNumber: '+260978000012', email: 'bwalya.c@email.zm', source: 'manual', hasBirthday: true, birthdayThisMonth: false, daysUntilBirthday: 18, loyaltyPoints: 520, tier: 'vip', totalSpend: 8200, visitCount: 45, status: 'active' },
  { id: 'c5', firstName: 'Natasha', lastName: 'Tembo', phoneNumber: '+260944000078', email: 'natasha.t@email.zm', source: 'social', hasBirthday: true, birthdayThisMonth: false, daysUntilBirthday: 90, loyaltyPoints: 200, tier: 'priority', totalSpend: 3200, visitCount: 20, status: 'active' },
  { id: 'c6', firstName: 'Kapila', lastName: 'Mwale', phoneNumber: '+260933000056', email: null, source: 'qr_bridge', hasBirthday: false, birthdayThisMonth: false, daysUntilBirthday: null, loyaltyPoints: 0, tier: 'standard', totalSpend: 0, visitCount: 1, status: 'active' },
  { id: 'c7', firstName: 'Luyando', lastName: 'Sinkala', phoneNumber: '+260911000034', email: 'luyando.s@email.zm', source: 'import', hasBirthday: true, birthdayThisMonth: false, daysUntilBirthday: 120, loyaltyPoints: 45, tier: 'standard', totalSpend: 600, visitCount: 3, status: 'inactive' },
];

const TRENDS: TrendDTO[] = [
  { id: 't1', trendType: 'hashtag', trendText: '#ZambianFood', platform: 'instagram', score: 88, status: 'ACTIVE', detectedAt: '2026-04-10T08:00:00Z', expiredAt: null, expiryReason: null, timesUsedInContent: 4 },
  { id: 't2', trendType: 'sound', trendText: 'African Kitchen Vibes - Trending Audio', platform: 'tiktok', score: 75, status: 'NEW', detectedAt: '2026-04-15T14:00:00Z', expiredAt: null, expiryReason: null, timesUsedInContent: 0 },
  { id: 't3', trendType: 'format', trendText: 'Behind the scenes kitchen tour', platform: 'tiktok', score: 82, status: 'ACTIVE', detectedAt: '2026-04-12T10:00:00Z', expiredAt: null, expiryReason: null, timesUsedInContent: 1 },
  { id: 't4', trendType: 'keyword', trendText: 'nshima recipe', platform: null, score: 68, status: 'AGING', detectedAt: '2026-03-28T12:00:00Z', expiredAt: null, expiryReason: null, timesUsedInContent: 2 },
  { id: 't5', trendType: 'topic', trendText: 'Easter brunch ideas', platform: 'facebook', score: 45, status: 'EXPIRED', detectedAt: '2026-03-20T09:00:00Z', expiredAt: '2026-04-06T00:00:00Z', expiryReason: 'Post-holiday decline', timesUsedInContent: 3 },
];

const BUSINESS_AUDIT: BusinessAuditDTO = {
  id: 'ba1', auditType: 'initial', domainAuthority: 18, totalIndexedPages: 8, backlinkCount: 3,
  gscImpressions90d: 4200, gscClicks90d: 380, gbpCompleteness: 55, reviewCount: 7,
  averageRating: 4.4, socialPresence: { instagram: { followers: 820, posts: 45 }, facebook: { followers: 340, posts: 28 }, tiktok: { followers: 150, posts: 12 } },
  competitorData: [{ domain: 'mintbistro.co.zm', domainAuthority: 32, indexedPages: 45, reviewCount: 22, averageRating: 4.2 }, { domain: 'the_delicatessen.co.zm', domainAuthority: 28, indexedPages: 30, reviewCount: 15, averageRating: 4.5 }],
  recommendedPriority: ['Complete GBP profile', 'Increase blog output to 2/week', 'Connect Google Search Console', 'Build backlinks from local directories'],
  summary: 'The Flame Grill has a solid foundation with strong social engagement but low search visibility. Focus on content velocity and GBP optimisation to close the gap with Mint Bistro.',
  createdAt: '2026-04-02T10:00:00Z',
};

const NOTIFICATIONS: NotificationDTO[] = [
  { id: 'n1', type: 'trend_alert', title: 'New Trend Detected', body: '#ZambianFood is trending on Instagram with a score of 88. Consider incorporating it into your next post.', read: false, readAt: null, actionUrl: '/dashboard/trends', priority: 'normal', createdAt: '2026-04-15T14:05:00Z' },
  { id: 'n2', type: 'post_published', title: 'Post Published', body: 'Your Instagram post "Friday braai night" was published successfully.', read: true, readAt: '2026-04-11T18:02:00Z', actionUrl: '/dashboard/content', priority: 'low', createdAt: '2026-04-11T18:00:00Z' },
  { id: 'n3', type: 'birthday_alert', title: 'Upcoming Birthday', body: 'Mwansa Banda has a birthday in 5 days. Send a birthday offer?', read: false, readAt: null, actionUrl: '/dashboard/birthdays', priority: 'high', createdAt: '2026-04-16T06:00:00Z' },
  { id: 'n4', type: 'token_expiring', title: 'TikTok Token Expiring', body: 'Your TikTok connection expires in 14 days. Re-authorise to keep posting.', read: false, readAt: null, actionUrl: '/dashboard/integrations', priority: 'high', createdAt: '2026-04-16T07:00:00Z' },
  { id: 'n5', type: 'payment_overdue', title: 'Invoice Overdue', body: 'Invoice #inv1 for K7,500 is overdue. Please arrange payment to avoid service interruption.', read: false, readAt: null, actionUrl: '/dashboard/billing', priority: 'urgent', createdAt: '2026-04-15T00:00:00Z' },
];

// ═══════════════════════════════════════════════════════════════════════
// MOCK_DATA EXPORT — All modules with typed methods
// ═══════════════════════════════════════════════════════════════════════

export const MOCK_DATA = {

  // ─── Platform Core ───────────────────────────────────────────────

  onboardingEngine: {
    /** Returns the onboarding step list for a tenant */
    getOnboardingState: (_tenantId: string): OnboardingStepDTO[] => ONBOARDING_STEPS,
    /** Saves data for a single onboarding step */
    saveStep: (_tenantId: string, stepData: Record<string, unknown>): { success: boolean; step: Record<string, unknown> } => ({ success: true, step: stepData }),
    /** Marks onboarding as complete and activates the account */
    completeOnboarding: (_tenantId: string): { success: boolean; activated: boolean } => ({ success: true, activated: true }),
  },

  nicheIntelligence: {
    /** Returns all available niches */
    getNiches: (_tenantId: string): NicheDTO[] => NICHES,
    /** Returns a niche by exact name match */
    getNicheByName: (_tenantId: string, name: string): NicheDTO | null => NICHES.find(n => n.name === name) ?? null,
    /** Returns niche suggestions based on a search query */
    getSuggestions: (_tenantId: string, _query: string): NicheDTO[] => NICHES,
  },

  nicheResearch: {
    /** Returns the researched niche profile data */
    getResearch: (_tenantId: string, _nicheName: string): NicheResearchDTO => NICHE_RESEARCH,
    /** Refreshes the niche research from latest data */
    refreshResearch: (_tenantId: string, _nicheName: string): NicheResearchDTO => NICHE_RESEARCH,
  },

  apiKeyManager: {
    /** Returns all API keys for a tenant (never includes encrypted values) */
    getKeys: (_tenantId: string): ApiKeyDTO[] => API_KEYS,
    /** Stores a new encrypted API key */
    storeKey: (_tenantId: string, keyName: string, _keyValue: string): { success: boolean; keyName: string } => ({ success: true, keyName }),
    /** Deletes an API key by name */
    deleteKey: (_tenantId: string, _keyName: string): ActionConfirmationDTO => ({ success: true }),
    /** Tests whether an API key connection is valid */
    testConnection: (_tenantId: string, keyName: string): { success: boolean; keyName: string; valid: boolean } => ({ success: true, keyName, valid: true }),
  },

  completenessScoring: {
    /** Returns the completeness score for a tenant */
    getScore: (_tenantId: string): CompletenessScoreDTO => COMPLETENESS_SCORE,
    /** Recalculates the completeness score */
    recalculate: (_tenantId: string): CompletenessScoreDTO => COMPLETENESS_SCORE,
  },

  adminApprovalGate: {
    /** Returns all accounts pending admin approval */
    getPendingAccounts: (_tenantId: string): PendingAccountDTO[] => PENDING_ACCOUNTS,
    /** Approves a pending account */
    approveAccount: (_tenantId: string, accountId: string, _approvedBy: string): { success: boolean; accountId: string } => ({ success: true, accountId }),
    /** Rejects a pending account with a reason */
    rejectAccount: (_tenantId: string, accountId: string, _reason: string, _rejectedBy: string): { success: boolean; accountId: string } => ({ success: true, accountId }),
  },

  tierSystem: {
    /** Returns all available platform tiers */
    getTiers: (): TierDTO[] => TIERS,
    /** Returns the current tier for a tenant */
    getTenantTier: (_tenantId: string): TierDTO => TIERS[1],
    /** Updates a tenant's tier */
    updateTier: (_tenantId: string, tier: string): { success: boolean; tier: string } => ({ success: true, tier }),
    /** Checks if a tenant has access to a specific feature */
    checkFeatureAccess: (_tenantId: string, feature: string): { hasAccess: boolean; feature: string } => ({ hasAccess: true, feature }),
  },

  billingEngine: {
    /** Returns all invoices for a tenant */
    getInvoices: (_tenantId: string): InvoiceDTO[] => INVOICES,
    /** Generates a new monthly invoice */
    generateInvoice: (_tenantId: string): IdReferenceDTO => ({ id: 'inv_new' }),
    /** Returns a single invoice by ID */
    getInvoice: (_tenantId: string, invoiceId: string): InvoiceDTO | null => INVOICES.find(i => i.id === invoiceId) ?? null,
  },

  paymentTracker: {
    /** Returns the current payment status */
    getPaymentStatus: (_tenantId: string): PaymentStatusDTO => ({ status: 'current', lastPaymentDate: '2026-03-10T14:30:00Z', nextDueDate: '2026-04-14' }),
    /** Checks payment status against Lenco */
    checkPayment: (_tenantId: string): PaymentStatusDTO => ({ status: 'current', lastPaymentDate: '2026-03-10T14:30:00Z', nextDueDate: '2026-04-14' }),
    /** Triggers the 7-day grace period */
    triggerGracePeriod: (_tenantId: string): ActionConfirmationDTO => ({ success: true }),
    /** Triggers account suspension */
    triggerSuspension: (_tenantId: string): ActionConfirmationDTO => ({ success: true }),
  },

  softDeleteArchive: {
    /** Returns archived items for a tenant */
    getArchivedItems: (_tenantId: string, _params: Record<string, unknown>): ArchivedItemDTO[] => [],
    /** Archives an item (soft delete) */
    archiveItem: (_tenantId: string, itemType: string, itemId: string): ArchivedItemDTO => ({ id: 'arch1', itemType, itemId, archivedAt: new Date().toISOString(), restorableUntil: '2026-05-16T00:00:00Z' }),
    /** Restores an archived item */
    restoreItem: (_tenantId: string, _itemType: string, _itemId: string): ActionConfirmationDTO => ({ success: true }),
    /** Permanently deletes an archived item (super admin only) */
    permanentDelete: (_tenantId: string, _itemType: string, _itemId: string): ActionConfirmationDTO => ({ success: true }),
  },

  sprintModeEngine: {
    /** Returns the current sprint mode configuration */
    getConfig: (_tenantId: string): SprintModeConfigDTO => ({ active: true, postingMultiplier: 2.5, clipExtractionMode: 'maximum', commentResponseSpeed: 'every', trendCheckFrequency: 'daily', warmupOverride: false, endsAt: '2026-05-12T00:00:00Z' }),
    /** Activates sprint mode for a new tenant */
    activate: (_tenantId: string): ActionConfirmationDTO => ({ success: true }),
    /** Deactivates sprint mode (automatic on day 31) */
    deactivate: (_tenantId: string): ActionConfirmationDTO => ({ success: true, message: 'Sprint mode ended. Sustainable schedule active.' }),
  },

  // ─── Business Modules ────────────────────────────────────────────

  seoEngine: {
    /** Returns the keyword strategy for a tenant */
    getKeywordStrategy: (_tenantId: string): KeywordStrategyDTO => KEYWORD_STRATEGY,
    /** Updates a keyword in the strategy */
    updateKeyword: (_tenantId: string, _keywordId: string, _data: Record<string, unknown>): ActionConfirmationDTO => ({ success: true }),
    /** Returns the SEO overview */
    getSeoOverview: (_tenantId: string): SeoOverviewDTO => ({ domainAuthority: 18, indexedPages: 8, backlinks: 3 }),
  },

  contentMachine: {
    /** Returns content posts for a tenant */
    getPosts: (_tenantId: string, _params: Record<string, unknown>): ContentPostDTO[] => CONTENT_POSTS,
    /** Returns a single content post */
    getPost: (_tenantId: string, postId: string): ContentPostDTO | null => CONTENT_POSTS.find(p => p.id === postId) ?? null,
    /** Creates a new content post in draft status */
    createPost: (_tenantId: string, data: Record<string, unknown>): ContentPostDTO => ({ id: 'cp_new', contentType: (data.contentType as string) ?? 'social_post', platform: (data.platform as string) ?? null, caption: (data.caption as string) ?? null, mediaUrl: null, mediaType: null, blogContent: (data.blogContent as string) ?? null, emailSubject: null, targetKeyword: null, status: 'draft', scheduledFor: null, publishedAt: null, algorithmScore: null, safetyCheckResult: null, impressions: 0, engagement: 0, engagementRate: null, createdAt: new Date().toISOString() }),
    /** Updates an existing content post */
    updatePost: (_tenantId: string, _postId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
    /** Deletes a content post */
    deletePost: (_tenantId: string, _postId: string): ActionConfirmationDTO => ({ success: true }),
    /** Generates content using AI */
    generateContent: (_tenantId: string, data: Record<string, unknown>): ContentPostDTO => ({ id: 'cp_gen', contentType: (data.contentType as string) ?? 'social_post', platform: (data.platform as string) ?? 'instagram', caption: 'Experience the rich flavours of Zambia at The Flame Grill. Our nshima and ifisashi will remind you of home. 🇿🇲', mediaUrl: null, mediaType: null, blogContent: (data.contentType === 'blog_post') ? '# Discover Zambian Cuisine\n\nAt The Flame Grill, we celebrate the rich culinary heritage of Zambia...' : null, emailSubject: null, targetKeyword: (data.targetKeyword as string) ?? null, status: 'draft', scheduledFor: null, publishedAt: null, algorithmScore: null, safetyCheckResult: null, impressions: 0, engagement: 0, engagementRate: null, createdAt: new Date().toISOString() }),
    /** Schedules a content post for publishing */
    schedulePost: (_tenantId: string, _postId: string, scheduledFor: string): { success: boolean; scheduledFor: string } => ({ success: true, scheduledFor }),
    /** Approves a content post for publishing */
    approvePost: (_tenantId: string, _postId: string): { success: boolean; status: string } => ({ success: true, status: 'approved' }),
  },

  socialMediaLayer: {
    /** Returns all connected social platforms */
    getConnectedPlatforms: (_tenantId: string): ConnectedPlatformDTO[] => CONNECTED_PLATFORMS,
    /** Connects a social platform via OAuth */
    connectPlatform: (_tenantId: string, platform: string, _authCode: string): { success: boolean; platform: string } => ({ success: true, platform }),
    /** Disconnects a social platform */
    disconnectPlatform: (_tenantId: string, platform: string): { success: boolean; platform: string } => ({ success: true, platform }),
    /** Returns the post history across all platforms */
    getPostHistory: (_tenantId: string, _params: Record<string, unknown>): ContentPostDTO[] => CONTENT_POSTS.filter(p => p.status === 'published'),
  },

  inboundCallHandler: {
    /** Returns the call log for a tenant */
    getCallLog: (_tenantId: string, _params: Record<string, unknown>): CallLogDTO[] => CALL_LOG,
    /** Returns a single call by ID */
    getCall: (_tenantId: string, callId: string): CallLogDTO | null => CALL_LOG.find(c => c.id === callId) ?? null,
    /** Handles an incoming call webhook */
    handleIncomingCall: (_tenantId: string, _callData: Record<string, unknown>): IdReferenceDTO => ({ id: 'cl_new' }),
    /** Triggers a human handoff for a complex call */
    triggerHandoff: (_tenantId: string, _callId: string): { success: boolean; handoffTo: string } => ({ success: true, handoffTo: 'human' }),
  },

  outboundSalesEngine: {
    /** Returns sales campaigns */
    getCampaigns: (_tenantId: string): SalesCampaignDTO[] => [{ id: 'se1', name: 'Corporate Catering Outreach', status: 'active', targetsCount: 35, responsesCount: 8 }],
    /** Returns a single campaign */
    getCampaign: (_tenantId: string, campaignId: string): SalesCampaignDTO | null => campaignId === 'se1' ? { id: 'se1', name: 'Corporate Catering Outreach', status: 'active', targetsCount: 35, responsesCount: 8 } : null,
    /** Creates a new sales campaign */
    createCampaign: (_tenantId: string, data: Record<string, unknown>): SalesCampaignDTO => ({ id: 'se_new', name: (data.name as string) ?? 'New Campaign', status: 'draft', targetsCount: 0, responsesCount: 0 }),
    /** Updates an existing campaign */
    updateCampaign: (_tenantId: string, _campaignId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
    /** Pauses an active campaign */
    pauseCampaign: (_tenantId: string, _campaignId: string): { success: boolean; status: string } => ({ success: true, status: 'paused' }),
  },

  googleBusinessProfileManager: {
    /** Returns the Google Business Profile data */
    getProfile: (_tenantId: string): GbpProfileDTO => ({ name: 'The Flame Grill', category: 'Restaurant', rating: 4.4, reviewCount: 7 }),
    /** Updates the GBP profile */
    updateProfile: (_tenantId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
    /** Returns GBP insights data */
    getInsights: (_tenantId: string): GbpInsightsDTO => ({ views: 680, searches: 190, directionRequests: 42 }),
    /** Publishes a post to GBP */
    publishPost: (_tenantId: string, _data: Record<string, unknown>): IdReferenceDTO => ({ id: 'gbp_new' }),
  },

  broadcastEngine: {
    /** Returns all broadcasts */
    getBroadcasts: (_tenantId: string): BroadcastDTO[] => [{ id: 'b1', type: 'whatsapp', subject: null, body: 'Happy Easter from The Flame Grill! 🐣 Special Easter Sunday lunch menu — K150 per person. Book your table now!', status: 'sent', sentAt: '2026-04-05T09:00:00Z', scheduledFor: null, recipientCount: 87 }],
    /** Returns a single broadcast */
    getBroadcast: (_tenantId: string, broadcastId: string): BroadcastDTO | null => broadcastId === 'b1' ? { id: 'b1', type: 'whatsapp', subject: null, body: 'Happy Easter from The Flame Grill! 🐣 Special Easter Sunday lunch menu — K150 per person.', status: 'sent', sentAt: '2026-04-05T09:00:00Z', scheduledFor: null, recipientCount: 87 } : null,
    /** Creates a new broadcast */
    createBroadcast: (_tenantId: string, data: Record<string, unknown>): BroadcastDTO => ({ id: 'b_new', type: (data.type as 'whatsapp' | 'email' | 'sms') ?? 'whatsapp', subject: (data.subject as string) ?? null, body: (data.body as string) ?? '', status: 'draft', sentAt: null, scheduledFor: null, recipientCount: 0 }),
    /** Sends a broadcast immediately */
    sendBroadcast: (_tenantId: string, _broadcastId: string): { success: boolean; sentCount: number } => ({ success: true, sentCount: 87 }),
    /** Schedules a broadcast for future delivery */
    scheduleBroadcast: (_tenantId: string, _broadcastId: string, scheduledFor: string): { success: boolean; scheduledFor: string } => ({ success: true, scheduledFor }),
  },

  customerDatabase: {
    /** Returns customers for a tenant (DOB never sent to frontend per RULE D-3) */
    getCustomers: (_tenantId: string, _params: Record<string, unknown>): CustomerDTO[] => CUSTOMERS,
    /** Returns a single customer */
    getCustomer: (_tenantId: string, customerId: string): CustomerDTO | null => CUSTOMERS.find(c => c.id === customerId) ?? null,
    /** Creates a new customer */
    createCustomer: (_tenantId: string, data: Record<string, unknown>): CustomerDTO => ({ id: 'c_new', firstName: (data.firstName as string) ?? 'New', lastName: (data.lastName as string) ?? null, phoneNumber: (data.phoneNumber as string) ?? '+260970000000', email: (data.email as string) ?? null, source: (data.source as string) ?? 'manual', hasBirthday: false, birthdayThisMonth: false, daysUntilBirthday: null, loyaltyPoints: 0, tier: 'standard', totalSpend: 0, visitCount: 0, status: 'active' }),
    /** Updates a customer record */
    updateCustomer: (_tenantId: string, _customerId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
    /** Soft-deletes a customer record */
    deleteCustomer: (_tenantId: string, _customerId: string): ActionConfirmationDTO => ({ success: true }),
    /** Bulk imports customers */
    importCustomers: (_tenantId: string, _data: Record<string, unknown>): ImportResultDTO => ({ importedCount: 12, failedCount: 1, errors: [{ row: 5, reason: 'Duplicate phone number' }] }),
    /** Returns upcoming birthday data (RULE D-3: no full DOB) */
    getBirthdayUpcoming: (_tenantId: string): BirthdayUpcomingDTO => ({ upcoming: [{ customerId: 'c2', firstName: 'Mwansa', daysUntil: 5 }, { customerId: 'c4', firstName: 'Bwalya', daysUntil: 18 }], count: 2 }),
  },

  birthdayEngine: {
    /** Returns birthday engine configuration */
    getConfig: (_tenantId: string): BirthdayConfigDTO => ({ autoSendEnabled: true, daysBefore: 7, offerTemplate: 'Happy Birthday from The Flame Grill! 🎂 Enjoy 20% off your next visit. Show this token at the counter.' }),
    /** Updates birthday engine config */
    updateConfig: (_tenantId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
    /** Returns upcoming birthdays */
    getUpcomingBirthdays: (_tenantId: string): BirthdayUpcomingDTO => ({ upcoming: [{ customerId: 'c2', firstName: 'Mwansa', daysUntil: 5 }, { customerId: 'c4', firstName: 'Bwalya', daysUntil: 18 }], count: 2 }),
    /** Generates a single-use birthday redemption token */
    generateToken: (_tenantId: string, _customerId: string): BirthdayTokenDTO => ({ token: 'bday_a1b2c3d4', offerDescription: '20% off your next visit', expiresAt: '2026-04-23T23:59:59Z', redeemed: false }),
    /** Redeems a birthday token */
    redeemToken: (_tenantId: string, _token: string, _redeemedByStaff: string): { success: boolean; redeemed: boolean } => ({ success: true, redeemed: true }),
  },

  reviewCampaignManager: {
    /** Returns review campaigns */
    getCampaigns: (_tenantId: string): ReviewCampaignDTO[] => [{ id: 'rc1', name: 'Google Reviews Push', status: 'active', sentCount: 28, responseCount: 5 }],
    /** Returns a single review campaign */
    getCampaign: (_tenantId: string, campaignId: string): ReviewCampaignDTO | null => campaignId === 'rc1' ? { id: 'rc1', name: 'Google Reviews Push', status: 'active', sentCount: 28, responseCount: 5 } : null,
    /** Creates a new review campaign */
    createCampaign: (_tenantId: string, data: Record<string, unknown>): ReviewCampaignDTO => ({ id: 'rc_new', name: (data.name as string) ?? 'New Review Campaign', status: 'draft', sentCount: 0, responseCount: 0 }),
    /** Launches a review campaign */
    launchCampaign: (_tenantId: string, _campaignId: string): { success: boolean; status: string } => ({ success: true, status: 'active' }),
  },

  videoTestimonialCollector: {
    /** Returns testimonial collection requests */
    getRequests: (_tenantId: string): TestimonialRequestDTO[] => [{ id: 'vt1', customerName: 'Bwalya Chisenga', status: 'received', sentAt: '2026-04-10T10:00:00Z', videoUrl: 'https://media.quantumnexus.app/the-flame-grill/testimonials/bwalya.mp4' }],
    /** Creates a testimonial request */
    createRequest: (_tenantId: string, data: Record<string, unknown>): TestimonialRequestDTO => ({ id: 'vt_new', customerName: (data.customerName as string) ?? 'Customer', status: 'sent', sentAt: new Date().toISOString(), videoUrl: null }),
    /** Returns collected video testimonials */
    getTestimonials: (_tenantId: string): TestimonialRequestDTO[] => [{ id: 'vt1', customerName: 'Bwalya Chisenga', status: 'received', sentAt: '2026-04-10T10:00:00Z', videoUrl: 'https://media.quantumnexus.app/the-flame-grill/testimonials/bwalya.mp4' }],
  },

  loyaltyPointsEngine: {
    /** Returns the loyalty balance for a customer */
    getBalance: (_tenantId: string, _customerId: string): LoyaltyBalanceDTO => ({ points: 350, tier: 'priority' }),
    /** Returns loyalty transaction history */
    getTransactions: (_tenantId: string, _customerId: string, _params: Record<string, unknown>): LoyaltyTransactionDTO[] => [{ id: 'lt1', type: 'earn', points: 50, balanceAfter: 350, description: 'Visit reward', createdAt: '2026-04-11T19:30:00Z' }, { id: 'lt2', type: 'earn', points: 25, balanceAfter: 300, description: 'Instagram mention bonus', createdAt: '2026-04-08T14:00:00Z' }],
    /** Awards loyalty points */
    earnPoints: (_tenantId: string, _customerId: string, points: number, description: string): { success: boolean; newBalance: number } => ({ success: true, newBalance: 350 + points }),
    /** Redeems loyalty points */
    redeemPoints: (_tenantId: string, _customerId: string, points: number, description: string): { success: boolean; newBalance: number } => ({ success: true, newBalance: 350 - points }),
    /** Adjusts loyalty points (admin) */
    adjustPoints: (_tenantId: string, _customerId: string, points: number, reason: string): { success: boolean; newBalance: number } => ({ success: true, newBalance: 350 + points }),
  },

  leadMagnetBuilder: {
    /** Returns lead magnets */
    getMagnets: (_tenantId: string): LeadMagnetDTO[] => [{ id: 'lm1', title: 'Top 10 Zambian Dishes You Must Try', type: 'pdf', status: 'active', downloads: 45, url: 'https://media.quantumnexus.app/the-flame-grill/leads/top-10-dishes.pdf' }],
    /** Returns a single lead magnet */
    getMagnet: (_tenantId: string, magnetId: string): LeadMagnetDTO | null => magnetId === 'lm1' ? { id: 'lm1', title: 'Top 10 Zambian Dishes You Must Try', type: 'pdf', status: 'active', downloads: 45, url: 'https://media.quantumnexus.app/the-flame-grill/leads/top-10-dishes.pdf' } : null,
    /** Creates a new lead magnet */
    createMagnet: (_tenantId: string, data: Record<string, unknown>): LeadMagnetDTO => ({ id: 'lm_new', title: (data.title as string) ?? 'New Lead Magnet', type: (data.type as 'pdf' | 'checklist' | 'template') ?? 'pdf', status: 'draft', downloads: 0, url: null }),
    /** Updates an existing lead magnet */
    updateMagnet: (_tenantId: string, _magnetId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
    /** Generates a lead magnet PDF */
    generatePdf: (_tenantId: string, _magnetId: string): { success: boolean; url: string } => ({ success: true, url: 'https://media.quantumnexus.app/the-flame-grill/leads/generated.pdf' }),
  },

  seasonalCampaignEngine: {
    /** Returns seasonal campaigns */
    getCampaigns: (_tenantId: string): SeasonalCampaignDTO[] => [{ id: 'sc1', name: 'Independence Day Special', status: 'scheduled', startsAt: '2026-10-23T00:00:00Z', endsAt: '2026-10-25T00:00:00Z' }, { id: 'sc2', name: 'Christmas Feast Menu', status: 'draft', startsAt: '2026-12-20T00:00:00Z', endsAt: '2026-12-26T00:00:00Z' }],
    /** Returns a single campaign */
    getCampaign: (_tenantId: string, campaignId: string): SeasonalCampaignDTO | null => campaignId === 'sc1' ? { id: 'sc1', name: 'Independence Day Special', status: 'scheduled', startsAt: '2026-10-23T00:00:00Z', endsAt: '2026-10-25T00:00:00Z' } : null,
    /** Creates a new seasonal campaign */
    createCampaign: (_tenantId: string, data: Record<string, unknown>): SeasonalCampaignDTO => ({ id: 'sc_new', name: (data.name as string) ?? 'New Campaign', status: 'draft', startsAt: (data.startsAt as string) ?? '2026-06-01T00:00:00Z', endsAt: (data.endsAt as string) ?? '2026-06-07T00:00:00Z' }),
    /** Updates a seasonal campaign */
    updateCampaign: (_tenantId: string, _campaignId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
  },

  offlineQrBridge: {
    /** Returns the QR code for a tenant */
    getQrCode: (_tenantId: string): QrCodeDTO => ({ url: 'https://nexus.app/join/the-flame-grill', imageUrl: 'https://media.quantumnexus.app/qr/the-flame-grill.png' }),
    /** Regenerates the QR code */
    regenerateQrCode: (_tenantId: string): QrCodeDTO => ({ url: 'https://nexus.app/join/the-flame-grill', imageUrl: 'https://media.quantumnexus.app/qr/the-flame-grill-v2.png' }),
    /** Returns join page data (public endpoint) */
    getJoinPageData: (_businessSlug: string): JoinPageDTO => ({ businessName: 'The Flame Grill', slug: 'the-flame-grill' }),
    /** Submits a join form from the QR bridge page (public endpoint) */
    submitJoin: (_businessSlug: string, _data: Record<string, unknown>): IdReferenceDTO => ({ id: 'c_new' }),
  },

  competitorIntelligence: {
    /** Returns competitor data */
    getCompetitors: (_tenantId: string): CompetitorDTO[] => [{ domain: 'mintbistro.co.zm', domainAuthority: 32, indexedPages: 45, backlinks: 85 }, { domain: 'the_delicatessen.co.zm', domainAuthority: 28, indexedPages: 30, backlinks: 52 }],
    /** Returns a single competitor */
    getCompetitor: (_tenantId: string, domain: string): CompetitorDTO | null => domain === 'mintbistro.co.zm' ? { domain: 'mintbistro.co.zm', domainAuthority: 32, indexedPages: 45, backlinks: 85 } : null,
    /** Refreshes competitor data */
    refreshData: (_tenantId: string): ActionConfirmationDTO => ({ success: true }),
  },

  reputationLayer: {
    /** Returns the reputation overview */
    getOverview: (_tenantId: string): ReputationOverviewDTO => ({ averageRating: 4.4, totalReviews: 7, responseRate: 85 }),
    /** Returns reviews for the tenant */
    getReviews: (_tenantId: string, _params: Record<string, unknown>): Array<{ id: string; author: string; rating: number; text: string; repliedAt: string | null }> => [{ id: 'r1', author: 'Chanda M.', rating: 5, text: 'Best braai in Lusaka! The mixed grill platter is incredible.', repliedAt: '2026-04-12T08:00:00Z' }, { id: 'r2', author: 'Natasha T.', rating: 4, text: 'Great food and atmosphere. Service could be a bit faster on weekends.', repliedAt: null }],
    /** Responds to a review */
    respondToReview: (_tenantId: string, _reviewId: string, _response: string): ActionConfirmationDTO => ({ success: true }),
  },

  approvalQueue: {
    /** Returns items in the approval queue */
    getItems: (_tenantId: string): ApprovalQueueItemDTO[] => [{ id: 'aq1', contentType: 'social_post', platform: 'instagram', status: 'pending_approval', createdAt: '2026-04-16T08:00:00Z' }],
    /** Returns a single approval queue item */
    getItem: (_tenantId: string, itemId: string): ApprovalQueueItemDTO | null => itemId === 'aq1' ? { id: 'aq1', contentType: 'social_post', platform: 'instagram', status: 'pending_approval', createdAt: '2026-04-16T08:00:00Z' } : null,
    /** Approves an item in the queue */
    approveItem: (_tenantId: string, _itemId: string): { success: boolean; status: string } => ({ success: true, status: 'approved' }),
    /** Rejects an item in the queue */
    rejectItem: (_tenantId: string, _itemId: string, _reason: string): { success: boolean; status: string } => ({ success: true, status: 'rejected' }),
    /** Enables or disables the approval queue */
    updateConfig: (_tenantId: string, enabled: boolean): { success: boolean; enabled: boolean } => ({ success: true, enabled }),
  },

  knowledgeBaseBuilder: {
    /** Returns knowledge base entries */
    getEntries: (_tenantId: string, _params: Record<string, unknown>): KnowledgeBaseEntryDTO[] => [{ id: 'kb1', title: 'Menu & Pricing', content: 'Mixed Grill Platter: K250 (2 people), K450 (family). Nshima with Ifisashi: K65. Braai Combo: K180. Kids Menu: K55.', category: 'services', source: 'manual', isActive: true }, { id: 'kb2', title: 'Opening Hours', content: 'Monday to Saturday: 11:00 - 22:00. Sunday: 12:00 - 20:00. Closed on public holidays except by private booking.', category: 'operations', source: 'manual', isActive: true }, { id: 'kb3', title: 'Location & Contact', content: 'Cairo Road, Lusaka, Zambia. Phone: +260 97 123 4567. Email: info@theflamegrill.co.zm', category: 'business_info', source: 'manual', isActive: true }],
    /** Returns a single knowledge base entry */
    getEntry: (_tenantId: string, entryId: string): KnowledgeBaseEntryDTO | null => entryId === 'kb1' ? { id: 'kb1', title: 'Menu & Pricing', content: 'Mixed Grill Platter: K250 (2 people)', category: 'services', source: 'manual', isActive: true } : null,
    /** Creates a knowledge base entry */
    createEntry: (_tenantId: string, data: Record<string, unknown>): KnowledgeBaseEntryDTO => ({ id: 'kb_new', title: (data.title as string) ?? 'New Entry', content: (data.content as string) ?? '', category: (data.category as string) ?? 'general', source: 'manual', isActive: true }),
    /** Updates a knowledge base entry */
    updateEntry: (_tenantId: string, _entryId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
    /** Deletes a knowledge base entry */
    deleteEntry: (_tenantId: string, _entryId: string): ActionConfirmationDTO => ({ success: true }),
  },

  communityModule: {
    /** Returns community posts */
    getPosts: (_tenantId: string, _params: Record<string, unknown>): CommunityPostDTO[] => [{ id: 'comm1', authorId: 'c1', content: 'Just had the most amazing braai at The Flame Grill! Highly recommend the mixed grill platter.', likesCount: 14, commentsCount: 3, createdAt: '2026-04-14T19:00:00Z' }],
    /** Creates a community post */
    createPost: (_tenantId: string, data: Record<string, unknown>): CommunityPostDTO => ({ id: 'comm_new', authorId: (data.authorId as string) ?? 'user', content: (data.content as string) ?? '', likesCount: 0, commentsCount: 0, createdAt: new Date().toISOString() }),
    /** Returns comments on a community post */
    getComments: (_tenantId: string, _postId: string, _params: Record<string, unknown>): CommunityCommentDTO[] => [{ id: 'commc1', authorId: 'c4', content: 'The boerewors is my favourite!', createdAt: '2026-04-14T20:15:00Z' }],
  },

  analyticsDashboard: {
    /** Returns the analytics overview for Mission Control */
    getOverview: (_tenantId: string): AnalyticsOverviewDTO => ({ revenueToday: 2800, revenueThisWeek: 18500, revenueThisMonth: 72000, postsPublishedToday: 2, postsScheduled24h: 3, newCustomersToday: 2, totalIndexedPages: 8, pagesIndexedToday: 1, tasksTodayTotal: 4, tasksTodayComplete: 2, latestHealthScore: 55, healthTrend: 'stable', latestVelocityScore: 42 }),
    /** Returns chart data for a specific type and period */
    getChart: (_tenantId: string, _chartType: string, period: string): ChartDataDTO => ({ data: [{ label: 'Mon', value: 4200 }, { label: 'Tue', value: 3800 }, { label: 'Wed', value: 5100 }, { label: 'Thu', value: 4600 }, { label: 'Fri', value: 6200 }, { label: 'Sat', value: 8500 }, { label: 'Sun', value: 5900 }], period }),
    /** Exports a report in the requested format */
    exportReport: (_tenantId: string, _format: string, _period: string): { url: string } => ({ url: 'https://media.quantumnexus.app/the-flame-grill/reports/weekly-2026-04-16.csv' }),
  },

  dailyReportEngine: {
    /** Returns the latest daily report */
    getLatestReport: (_tenantId: string): DailyReportDTO => ({ date: '2026-04-15', summary: '2 posts published, 2 new customers, K2,800 revenue. Trend alert: #ZambianFood trending on Instagram.', channels: ['whatsapp', 'email', 'in_app'] }),
    /** Generates a daily report on demand */
    generateReport: (_tenantId: string): DailyReportDTO => ({ date: '2026-04-16', summary: '1 post published, 2 new customers, K2,800 revenue today. TikTok post scheduled for 12:00.', channels: ['whatsapp', 'email', 'in_app'] }),
    /** Returns daily report configuration */
    getConfig: (_tenantId: string): ReportConfigDTO => ({ channels: ['whatsapp', 'email', 'in_app'], time: '23:00' }),
    /** Updates daily report configuration */
    updateConfig: (_tenantId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
  },

  crisisDetection: {
    /** Returns active crisis alerts */
    getAlerts: (_tenantId: string): CrisisAlertDTO[] => [],
    /** Acknowledges a crisis alert */
    acknowledgeAlert: (_tenantId: string, _alertId: string): ActionConfirmationDTO => ({ success: true }),
    /** Returns crisis detection settings */
    getSettings: (_tenantId: string): CrisisSettingsDTO => ({ autoPauseEnabled: true, sensitivityLevel: 'medium' }),
    /** Updates crisis detection settings */
    updateSettings: (_tenantId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
  },

  callFallbackHandler: {
    /** Returns the call fallback configuration */
    getConfig: (_tenantId: string): CallFallbackConfigDTO => ({ humanHandoffMessage: 'Our team will follow up within 2 hours. Thank you for calling The Flame Grill!', followUpDelayMinutes: 120 }),
    /** Updates the call fallback configuration */
    updateConfig: (_tenantId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
    /** Triggers a human fallback for a call */
    triggerFallback: (_tenantId: string, _callId: string): { success: boolean; handoffInitiated: boolean } => ({ success: true, handoffInitiated: true }),
  },

  whiteLabelAppBuilder: {
    /** Returns white-label apps for a tenant */
    getApps: (_tenantId: string): WhiteLabelAppDTO[] => [],
    /** Creates a new white-label app */
    createApp: (_tenantId: string, data: Record<string, unknown>): WhiteLabelAppDTO => ({ id: 'app_new', name: (data.name as string) ?? 'My App', platform: (data.platform as 'android' | 'ios' | 'both') ?? 'android', status: 'draft', bundleId: null, iconUrl: null }),
    /** Updates a white-label app */
    updateApp: (_tenantId: string, _appId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
    /** Submits a white-label app for publishing review */
    submitForPublishing: (_tenantId: string, _appId: string): { success: boolean; status: string } => ({ success: true, status: 'submitted' }),
  },

  algorithmScoringEngine: {
    /** Scores content against a platform algorithm */
    scoreContent: (_tenantId: string, platform: string, _contentData: Record<string, unknown>): AlgorithmScoreDTO => ({ score: 78, breakdown: { hook: 18, completion: 20, caption: 12, trend: 10, rewatch: 18 }, platform, passed: true, suggestions: [] }),
    /** Returns the algorithm score threshold for a platform */
    getThreshold: (platform: string): AlgorithmThresholdDTO => ({ platform, threshold: platform === 'tiktok' ? 70 : platform === 'instagram' ? 70 : 65 }),
  },

  // ─── Domination Modules ──────────────────────────────────────────

  businessAuditEngine: {
    /** Returns all audits for a tenant */
    getAudits: (_tenantId: string): BusinessAuditDTO[] => [BUSINESS_AUDIT],
    /** Returns a single audit by ID */
    getAudit: (_tenantId: string, auditId: string): BusinessAuditDTO | null => auditId === 'ba1' ? BUSINESS_AUDIT : null,
    /** Runs the initial business audit */
    runInitialAudit: (_tenantId: string): BusinessAuditDTO => BUSINESS_AUDIT,
    /** Runs the monthly audit refresh */
    runMonthlyRefresh: (_tenantId: string): BusinessAuditDTO => ({ ...BUSINESS_AUDIT, id: 'ba2', auditType: 'monthly_refresh', domainAuthority: 20, totalIndexedPages: 12, createdAt: new Date().toISOString() }),
  },

  seoDominationEngine: {
    /** Returns the daily blog posting schedule */
    getDailyBlogSchedule: (_tenantId: string): DailyBlogScheduleDTO => ({ posts: [{ time: '06:00', keyword: 'zambian braai restaurant', postId: null }, { time: '14:00', keyword: 'nshima restaurant near me', postId: null }] }),
    /** Returns pending Q&A seeding tasks */
    getQaTasks: (_tenantId: string): QaTaskDTO[] => [{ id: 'qa1', platform: 'quora', questionText: 'What is the best restaurant in Lusaka for traditional Zambian food?', answerText: 'The Flame Grill on Cairo Road is widely regarded as one of the best spots for authentic Zambian cuisine in Lusaka...', status: 'awaiting_confirmation', questionPostedAt: null }],
    /** Confirms a Q&A question has been manually posted (RULE DOM-3) */
    confirmQuestionPosted: (_tenantId: string, _taskId: string): { success: boolean; status: string } => ({ success: true, status: 'awaiting_confirmation' }),
    /** Submits a directory listing (RULE DOM-6: NAP from tenants table) */
    submitDirectory: (_tenantId: string, _data: Record<string, unknown>): DirectorySubmissionDTO => ({ id: 'ds_new', directoryName: 'ZambiaBusiness.com', status: 'submitted', listingUrl: null }),
  },

  trendIntelligenceEngine: {
    /** Returns trends with optional filters */
    getTrends: (_tenantId: string, _params: Record<string, unknown>): TrendDTO[] => TRENDS,
    /** Returns a single trend */
    getTrend: (_tenantId: string, trendId: string): TrendDTO | null => TRENDS.find(t => t.id === trendId) ?? null,
    /** Flags a trend as expired (RULE DOM-7: never removed silently) */
    flagExpired: (_tenantId: string, _trendId: string, _reason: string): { success: boolean; status: string } => ({ success: true, status: 'EXPIRED' }),
    /** Triggers an immediate trend scan */
    scanNow: (_tenantId: string): TrendScanResultDTO => ({ newTrendsFound: 2, trendsUpdated: 3 }),
  },

  contentRecyclingEngine: {
    /** Returns content recycling candidates */
    getCandidates: (_tenantId: string, _params: Record<string, unknown>): RecyclingCandidateDTO[] => [{ postId: 'cp1', contentType: 'social_post', platform: 'instagram', performanceScore: 82, daysSincePublish: 5, suggestedFormats: ['tiktok', 'facebook_post'] }],
    /** Recycles a piece of content into a new format */
    recycleContent: (_tenantId: string, _postId: string, _targetFormat: string): IdReferenceDTO => ({ id: 'cp_recycled' }),
    /** Returns recycling history */
    getRecyclingHistory: (_tenantId: string, _params: Record<string, unknown>): Array<{ originalPostId: string; newPostId: string; newFormat: string; recycledAt: string }> => [],
  },

  entityBuilder: {
    /** Returns directory listings */
    getListings: (_tenantId: string): EntityListingDTO[] => [{ id: 'el1', directoryName: 'Google Business Profile', directoryUrl: 'https://business.google.com', listingUrl: 'https://g.page/the-flame-grill', status: 'live', isConsistent: true, submittedName: 'The Flame Grill', submittedAddress: 'Cairo Road, Lusaka, Zambia', submittedPhone: '+260 97 123 4567' }, { id: 'el2', directoryName: 'Yelp Zambia', directoryUrl: 'https://yelp.co.zm', listingUrl: null, status: 'pending', isConsistent: null, submittedName: 'The Flame Grill', submittedAddress: 'Cairo Road, Lusaka, Zambia', submittedPhone: '+260 97 123 4567' }],
    /** Returns a single directory listing */
    getListing: (_tenantId: string, listingId: string): EntityListingDTO | null => listingId === 'el1' ? { id: 'el1', directoryName: 'Google Business Profile', directoryUrl: 'https://business.google.com', listingUrl: 'https://g.page/the-flame-grill', status: 'live', isConsistent: true, submittedName: 'The Flame Grill', submittedAddress: 'Cairo Road, Lusaka, Zambia', submittedPhone: '+260 97 123 4567' } : null,
    /** Submits a directory listing */
    submitListing: (_tenantId: string, _data: Record<string, unknown>): { success: boolean; status: string } => ({ success: true, status: 'submitted' }),
    /** Checks NAP consistency across all listings */
    checkConsistency: (_tenantId: string): EntityConsistencyDTO => ({ consistent: 1, inconsistent: 0, pending: 1 }),
  },

  reputationVelocityTracker: {
    /** Returns the current reputation velocity */
    getVelocity: (_tenantId: string): ReputationVelocityDTO => ({ velocityScore: 42, velocityTrend: 'improving', newBacklinks: 1, newIndexedPages: 2, newReviews: 1, netNewFollowers: 35, gscImpressionsGrowth: 8.5 }),
    /** Returns reputation velocity history */
    getHistory: (_tenantId: string, _params: Record<string, unknown>): Array<ReputationVelocityDTO & { weekStart: string }> => [{ velocityScore: 42, velocityTrend: 'improving', newBacklinks: 1, newIndexedPages: 2, newReviews: 1, netNewFollowers: 35, gscImpressionsGrowth: 8.5, weekStart: '2026-04-14' }],
  },

  keywordCannibalisationDetector: {
    /** Returns cannibalisation reports */
    getReports: (_tenantId: string): CannibalisationReportDTO[] => [],
    /** Runs a cannibalisation scan */
    runScan: (_tenantId: string): { conflictsFound: number; reports: CannibalisationReportDTO[] } => ({ conflictsFound: 0, reports: [] }),
    /** Approves a consolidation action */
    approveAction: (_tenantId: string, _reportId: string): { success: boolean; status: string } => ({ success: true, status: 'approved' }),
    /** Dismisses a cannibalisation report */
    dismissAction: (_tenantId: string, _reportId: string, _reason: string): { success: boolean; status: string } => ({ success: true, status: 'dismissed' }),
  },

  clientHealthScore: {
    /** Returns the current client health score (RULE DOM-8: never raw without context) */
    getScore: (_tenantId: string): ClientHealthScoreDTO => ({ totalScore: 55, trend: 'stable', seoScore: 50, contentScore: 60, reviewScore: 45, socialScore: 65, entityScore: 40, retentionScore: 85, topRecommendations: ['Complete your Google Business Profile', 'Increase weekly blog output to 2 posts'] }),
    /** Returns client health score history */
    getHistory: (_tenantId: string, _params: Record<string, unknown>): Array<ClientHealthScoreDTO & { date: string }> => [{ totalScore: 55, trend: 'stable', seoScore: 50, contentScore: 60, reviewScore: 45, socialScore: 65, entityScore: 40, retentionScore: 85, topRecommendations: ['Complete GBP'], date: '2026-04-16' }],
  },

  // ─── UGC Modules ─────────────────────────────────────────────────

  ugcVideoIngestion: {
    /** Returns uploaded UGC videos */
    getVideos: (_tenantId: string, _params: Record<string, unknown>): UgcVideoDTO[] => [{ id: 'ugc_v1', fileName: 'braai-cooking-tutorial.mp4', fileSize: 52428800, durationSeconds: 180, status: 'transcribed', uploadedAt: '2026-04-14T10:00:00Z', r2Url: 'https://media.quantumnexus.app/the-flame-grill/ugc/braai-tutorial.mp4', transcript: 'Hey everyone, today we are showing you how The Flame Grill prepares our signature boerewors on the braai...' }],
    /** Returns a single UGC video */
    getVideo: (_tenantId: string, videoId: string): UgcVideoDTO | null => videoId === 'ugc_v1' ? { id: 'ugc_v1', fileName: 'braai-cooking-tutorial.mp4', fileSize: 52428800, durationSeconds: 180, status: 'transcribed', uploadedAt: '2026-04-14T10:00:00Z', r2Url: 'https://media.quantumnexus.app/the-flame-grill/ugc/braai-tutorial.mp4', transcript: 'Hey everyone, today we are showing you how The Flame Grill prepares our signature boerewors...' } : null,
    /** Uploads a new UGC video to R2 */
    uploadVideo: (_tenantId: string, data: Record<string, unknown>): UgcVideoDTO => ({ id: 'ugc_v_new', fileName: (data.fileName as string) ?? 'upload.mp4', fileSize: (data.fileSize as number) ?? 0, durationSeconds: null, status: 'uploading', uploadedAt: new Date().toISOString(), r2Url: 'https://media.quantumnexus.app/the-flame-grill/ugc/new.mp4', transcript: null }),
    /** Deletes a UGC video */
    deleteVideo: (_tenantId: string, _videoId: string): ActionConfirmationDTO => ({ success: true }),
  },

  ugcClipIntelligence: {
    /** Returns detected clips */
    getClips: (_tenantId: string, _params: Record<string, unknown>): UgcClipDTO[] => [{ id: 'clip1', videoId: 'ugc_v1', startTime: 12.5, endTime: 42.0, score: 82, hookText: 'This is how we do the perfect boerewors flip...', status: 'candidate' }, { id: 'clip2', videoId: 'ugc_v1', startTime: 65.0, endTime: 95.5, score: 75, hookText: 'The secret to our signature nshima...', status: 'candidate' }],
    /** Returns a single clip */
    getClip: (_tenantId: string, clipId: string): UgcClipDTO | null => clipId === 'clip1' ? { id: 'clip1', videoId: 'ugc_v1', startTime: 12.5, endTime: 42.0, score: 82, hookText: 'This is how we do the perfect boerewors flip...', status: 'candidate' } : null,
    /** Analyses a video for clip candidates */
    analyseVideo: (_tenantId: string, _videoId: string): { clips: UgcClipDTO[] } => ({ clips: [{ id: 'clip1', videoId: 'ugc_v1', startTime: 12.5, endTime: 42.0, score: 82, hookText: 'Perfect boerewors flip...', status: 'candidate' }] }),
  },

  ugcClipPreview: {
    /** Returns a clip preview thumbnail */
    getPreview: (_tenantId: string, _clipId: string): ClipPreviewDTO => ({ thumbnailUrl: 'https://media.quantumnexus.app/the-flame-grill/ugc/thumbnails/clip1.jpg', duration: 29.5 }),
    /** Approves a clip for rendering */
    approveClip: (_tenantId: string, _clipId: string): { success: boolean; status: string } => ({ success: true, status: 'approved' }),
    /** Rejects a clip */
    rejectClip: (_tenantId: string, _clipId: string, _reason: string): { success: boolean; status: string } => ({ success: true, status: 'rejected' }),
  },

  ugcRenderPipeline: {
    /** Returns render jobs */
    getJobs: (_tenantId: string, _params: Record<string, unknown>): RenderJobDTO[] => [],
    /** Starts a new render job */
    startRender: (_tenantId: string, data: Record<string, unknown>): RenderJobDTO => ({ id: 'render_new', clipId: (data.clipId as string) ?? 'clip1', status: 'queued', progress: 0, outputUrl: null, createdAt: new Date().toISOString() }),
    /** Returns a render job status */
    getRenderStatus: (_tenantId: string, jobId: string): RenderJobDTO => ({ id: jobId, clipId: 'clip1', status: 'processing', progress: 45, outputUrl: null, createdAt: '2026-04-16T12:00:00Z' }),
  },

  ugcContentCalendar: {
    /** Returns calendar entries */
    getEntries: (_tenantId: string, _params: Record<string, unknown>): CalendarEntryDTO[] => [{ id: 'cal1', clipId: 'clip1', platform: 'instagram', scheduledFor: '2026-04-18T12:00:00Z', status: 'scheduled' }],
    /** Adds a calendar entry */
    addEntry: (_tenantId: string, data: Record<string, unknown>): CalendarEntryDTO => ({ id: 'cal_new', clipId: (data.clipId as string) ?? 'clip1', platform: (data.platform as string) ?? 'instagram', scheduledFor: (data.scheduledFor as string) ?? '2026-04-20T12:00:00Z', status: 'scheduled' }),
    /** Updates a calendar entry */
    updateEntry: (_tenantId: string, _entryId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
    /** Removes a calendar entry */
    removeEntry: (_tenantId: string, _entryId: string): ActionConfirmationDTO => ({ success: true }),
  },

  ugcTrendMonitor: {
    /** Returns UGC trend data */
    getTrends: (_tenantId: string): UgcTrendDTO[] => [{ id: 'ut1', trendType: 'sound', trendText: 'Kitchen ASMR - Sizzling Audio', platform: 'tiktok', score: 80 }, { id: 'ut2', trendType: 'format', trendText: 'Cooking in 60 seconds', platform: 'instagram', score: 72 }],
    /** Scans for new UGC trends */
    scanTrends: (_tenantId: string): { newTrends: number; trends: UgcTrendDTO[] } => ({ newTrends: 2, trends: [{ id: 'ut_new', trendType: 'hashtag', trendText: '#FlameGrillChallenge', platform: 'tiktok', score: 65 }] }),
  },

  ugcPerformanceFeedback: {
    /** Returns clip performance data */
    getPerformance: (_tenantId: string, _clipId: string): ClipPerformanceDTO => ({ views: 1200, engagement: 8.5, saves: 45, shares: 23 }),
    /** Returns top-performing clips */
    getTopPerforming: (_tenantId: string, _params: Record<string, unknown>): UgcClipDTO[] => [{ id: 'clip1', videoId: 'ugc_v1', startTime: 12.5, endTime: 42.0, score: 82, hookText: 'Perfect boerewors flip...', status: 'rendered' }],
  },

  ugcMonetisationIntelligence: {
    /** Returns monetisation opportunities */
    getOpportunities: (_tenantId: string): MonetisationOpportunityDTO[] => [{ id: 'mo1', brandName: 'Zambian Spices Co.', campaignType: 'product_placement', estimatedPay: 2500, deadline: '2026-05-01T00:00:00Z', status: 'available' }],
    /** Returns brand deal history */
    getBrandDeals: (_tenantId: string): MonetisationOpportunityDTO[] => [],
    /** Returns suggested rate card */
    getSuggestedRates: (_tenantId: string): SuggestedRatesDTO => ({ minRate: 500, suggestedRate: 1500, maxRate: 3000 }),
  },

  ugcPodcastSupport: {
    /** Returns podcast episodes */
    getEpisodes: (_tenantId: string, _params: Record<string, unknown>): PodcastEpisodeDTO[] => [{ id: 'ep1', title: 'The Flame Grill Story: From Market Stall to Lusaka Institution', durationSeconds: 1800, status: 'ready', audioUrl: 'https://media.quantumnexus.app/the-flame-grill/podcast/ep1.mp3', publishedAt: null }],
    /** Uploads a new podcast episode */
    uploadEpisode: (_tenantId: string, data: Record<string, unknown>): PodcastEpisodeDTO => ({ id: 'ep_new', title: (data.title as string) ?? 'New Episode', durationSeconds: 0, status: 'processing', audioUrl: null, publishedAt: null }),
    /** Returns a single episode */
    getEpisode: (_tenantId: string, episodeId: string): PodcastEpisodeDTO | null => episodeId === 'ep1' ? { id: 'ep1', title: 'The Flame Grill Story', durationSeconds: 1800, status: 'ready', audioUrl: 'https://media.quantumnexus.app/the-flame-grill/podcast/ep1.mp3', publishedAt: null } : null,
  },

  // ─── Faceless Channel Modules ────────────────────────────────────

  facelessCharacterStudio: {
    getCharacters: (_tenantId: string): FacelessCharacterDTO[] => [{ id: 'fc1', name: 'Chef Ziko', personality: 'Knowledgeable, warm, passionate about Zambian food heritage', voiceId: 'voice_chef_ziko', avatarStyle: 'illustrated', backstory: 'A veteran chef who has cooked in kitchens across Southern Africa', isActive: true }],
    getCharacter: (_tenantId: string, characterId: string): FacelessCharacterDTO | null => characterId === 'fc1' ? { id: 'fc1', name: 'Chef Ziko', personality: 'Knowledgeable, warm, passionate about Zambian food heritage', voiceId: 'voice_chef_ziko', avatarStyle: 'illustrated', backstory: 'A veteran chef who has cooked in kitchens across Southern Africa', isActive: true } : null,
    createCharacter: (_tenantId: string, data: Record<string, unknown>): FacelessCharacterDTO => ({ id: 'fc_new', name: (data.name as string) ?? 'New Character', personality: (data.personality as string) ?? 'Friendly and informative', voiceId: 'voice_new', avatarStyle: (data.avatarStyle as 'illustrated' | 'animated' | 'ai_generated') ?? 'illustrated', backstory: null, isActive: true }),
    updateCharacter: (_tenantId: string, _characterId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
    deleteCharacter: (_tenantId: string, _characterId: string): ActionConfirmationDTO => ({ success: true }),
  },

  facelessStorylineEditor: {
    getStorylines: (_tenantId: string): StorylineDTO[] => [{ id: 'sl1', title: 'Zambian Kitchen Secrets', characterId: 'fc1', episodeCount: 3, status: 'active', description: 'Chef Ziko reveals the techniques behind Zambian favourite dishes' }],
    getStoryline: (_tenantId: string, storylineId: string): StorylineDTO | null => storylineId === 'sl1' ? { id: 'sl1', title: 'Zambian Kitchen Secrets', characterId: 'fc1', episodeCount: 3, status: 'active', description: 'Chef Ziko reveals the techniques behind Zambian favourite dishes' } : null,
    createStoryline: (_tenantId: string, data: Record<string, unknown>): StorylineDTO => ({ id: 'sl_new', title: (data.title as string) ?? 'New Storyline', characterId: (data.characterId as string) ?? 'fc1', episodeCount: 0, status: 'draft', description: (data.description as string) ?? null }),
    updateStoryline: (_tenantId: string, _storylineId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
  },

  facelessSeriesBible: {
    getBibles: (_tenantId: string): SeriesBibleDTO[] => [{ id: 'sb1', storylineId: 'sl1', worldRules: 'Set in a warm, rustic Zambian kitchen. Natural lighting, earthy tones. No modern gadgets visible.', recurringThemes: ['heritage', 'community', 'slow cooking'], toneNotes: 'Respectful of tradition, accessible to beginners', characterArcs: null }],
    getBible: (_tenantId: string, bibleId: string): SeriesBibleDTO | null => bibleId === 'sb1' ? { id: 'sb1', storylineId: 'sl1', worldRules: 'Set in a warm, rustic Zambian kitchen.', recurringThemes: ['heritage', 'community', 'slow cooking'], toneNotes: 'Respectful of tradition', characterArcs: null } : null,
    createBible: (_tenantId: string, data: Record<string, unknown>): SeriesBibleDTO => ({ id: 'sb_new', storylineId: (data.storylineId as string) ?? 'sl1', worldRules: (data.worldRules as string) ?? '', recurringThemes: [], toneNotes: '', characterArcs: null }),
    updateBible: (_tenantId: string, _bibleId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
  },

  facelessEpisodeOutliner: {
    getOutlines: (_tenantId: string, _storylineId: string): EpisodeOutlineDTO[] => [{ id: 'eo1', storylineId: 'sl1', episodeNumber: 1, title: 'The Perfect Nshima', synopsis: 'Chef Ziko demonstrates the traditional technique for perfectly smooth nshima, sharing tips passed down through generations.', status: 'approved' }, { id: 'eo2', storylineId: 'sl1', episodeNumber: 2, title: 'Ifisashi: The Peanut Stew', synopsis: 'A deep dive into making authentic ifisashi with groundnuts from the local market.', status: 'draft' }],
    getOutline: (_tenantId: string, outlineId: string): EpisodeOutlineDTO | null => outlineId === 'eo1' ? { id: 'eo1', storylineId: 'sl1', episodeNumber: 1, title: 'The Perfect Nshima', synopsis: 'Chef Ziko demonstrates the traditional nshima technique.', status: 'approved' } : null,
    createOutline: (_tenantId: string, data: Record<string, unknown>): EpisodeOutlineDTO => ({ id: 'eo_new', storylineId: (data.storylineId as string) ?? 'sl1', episodeNumber: (data.episodeNumber as number) ?? 1, title: (data.title as string) ?? 'New Episode', synopsis: (data.synopsis as string) ?? '', status: 'draft' }),
    updateOutline: (_tenantId: string, _outlineId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
    generateOutline: (_tenantId: string, _storylineId: string, _data: Record<string, unknown>): EpisodeOutlineDTO => ({ id: 'eo_gen', storylineId: 'sl1', episodeNumber: 3, title: 'The Art of Braai', synopsis: 'Chef Ziko shares the secrets of the perfect Zambian braai fire and marinades.', status: 'draft' }),
  },

  facelessSceneBreakdown: {
    getScenes: (_tenantId: string, _outlineId: string): SceneDTO[] => [{ id: 'fs1', outlineId: 'eo1', sceneNumber: 1, description: 'Kitchen establishing shot — warm lighting on rustic counter', visualStyle: 'illustrated', durationSeconds: 8, scriptText: 'Welcome to Zambian Kitchen Secrets. I am Chef Ziko, and today...' }, { id: 'fs2', outlineId: 'eo1', sceneNumber: 2, description: 'Close-up of hands mixing nshima', visualStyle: 'illustrated', durationSeconds: 15, scriptText: 'The key to perfect nshima is the water-to-mealie-meal ratio...' }],
    getScene: (_tenantId: string, sceneId: string): SceneDTO | null => sceneId === 'fs1' ? { id: 'fs1', outlineId: 'eo1', sceneNumber: 1, description: 'Kitchen establishing shot', visualStyle: 'illustrated', durationSeconds: 8, scriptText: 'Welcome to Zambian Kitchen Secrets...' } : null,
    createScene: (_tenantId: string, data: Record<string, unknown>): SceneDTO => ({ id: 'fs_new', outlineId: (data.outlineId as string) ?? 'eo1', sceneNumber: (data.sceneNumber as number) ?? 1, description: (data.description as string) ?? '', visualStyle: (data.visualStyle as string) ?? 'illustrated', durationSeconds: (data.durationSeconds as number) ?? 10, scriptText: (data.scriptText as string) ?? '' }),
    updateScene: (_tenantId: string, _sceneId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
    breakdownOutline: (_tenantId: string, _outlineId: string): { scenes: SceneDTO[] } => ({ scenes: [{ id: 'fs_new1', outlineId: 'eo1', sceneNumber: 1, description: 'Opening — kitchen establishing', visualStyle: 'illustrated', durationSeconds: 8, scriptText: 'Welcome...' }, { id: 'fs_new2', outlineId: 'eo1', sceneNumber: 2, description: 'Main cooking demonstration', visualStyle: 'illustrated', durationSeconds: 30, scriptText: 'Today we make...' }] }),
  },

  facelessRunwayPipeline: {
    getJobs: (_tenantId: string, _params: Record<string, unknown>): RunwayJobDTO[] => [],
    submitJob: (_tenantId: string, data: Record<string, unknown>): RunwayJobDTO => ({ id: 'runway_new', sceneId: (data.sceneId as string) ?? 'fs1', status: 'queued', progress: 0, outputUrl: null, submittedAt: new Date().toISOString() }),
    getJobStatus: (_tenantId: string, jobId: string): RunwayJobDTO => ({ id: jobId, sceneId: 'fs1', status: 'processing', progress: 30, outputUrl: null, submittedAt: '2026-04-16T10:00:00Z' }),
    checkQuota: (_tenantId: string): RunwayQuotaDTO => ({ used: 0, limit: 50, remaining: 50 }),
  },

  facelessVoicePipeline: {
    getVoices: (_tenantId: string): VoiceJobDTO[] => [{ id: 'fv1', characterId: 'fc1', provider: 'elevenlabs', voiceId: 'voice_chef_ziko', sampleUrl: 'https://media.quantumnexus.app/the-flame-grill/voices/chef-ziko-sample.mp3', status: 'complete' }],
    generateVoice: (_tenantId: string, data: Record<string, unknown>): VoiceJobDTO => ({ id: 'fv_new', characterId: (data.characterId as string) ?? 'fc1', provider: 'elevenlabs', voiceId: (data.voiceId as string) ?? 'voice_new', sampleUrl: null, status: 'processing' }),
    getVoiceStatus: (_tenantId: string, voiceJobId: string): VoiceJobDTO => ({ id: voiceJobId, characterId: 'fc1', provider: 'elevenlabs', voiceId: 'voice_chef_ziko', sampleUrl: 'https://media.quantumnexus.app/the-flame-grill/voices/chef-ziko.mp3', status: 'complete' }),
  },

  facelessAssemblyPipeline: {
    getJobs: (_tenantId: string, _params: Record<string, unknown>): AssemblyJobDTO[] => [],
    startAssembly: (_tenantId: string, data: Record<string, unknown>): AssemblyJobDTO => ({ id: 'asm_new', episodeId: (data.episodeId as string) ?? 'eo1', status: 'queued', progress: 0, previewUrl: null, outputUrl: null }),
    getAssemblyStatus: (_tenantId: string, jobId: string): AssemblyJobDTO => ({ id: jobId, episodeId: 'eo1', status: 'processing', progress: 50, previewUrl: null, outputUrl: null }),
    previewAssembly: (_tenantId: string, jobId: string): { id: string; previewUrl: string } => ({ id: jobId, previewUrl: 'https://media.quantumnexus.app/the-flame-grill/episodes/preview.mp4' }),
  },

  facelessThumbnailGenerator: {
    getThumbnails: (_tenantId: string): ThumbnailDTO[] => [{ id: 'thumb1', episodeId: 'eo1', url: 'https://media.quantumnexus.app/the-flame-grill/thumbnails/ep1.jpg', style: 'illustrated', isSelected: true }],
    generateThumbnail: (_tenantId: string, data: Record<string, unknown>): ThumbnailDTO => ({ id: 'thumb_new', episodeId: (data.episodeId as string) ?? 'eo1', url: 'https://media.quantumnexus.app/the-flame-grill/thumbnails/new.jpg', style: (data.style as string) ?? 'illustrated', isSelected: false }),
    getThumbnailOptions: (_tenantId: string, _episodeId: string): { options: ThumbnailDTO[]; count: number } => ({ options: [{ id: 'thumb_a', episodeId: 'eo1', url: 'https://media.quantumnexus.app/the-flame-grill/thumbnails/opt-a.jpg', style: 'illustrated', isSelected: false }, { id: 'thumb_b', episodeId: 'eo1', url: 'https://media.quantumnexus.app/the-flame-grill/thumbnails/opt-b.jpg', style: 'animated', isSelected: false }, { id: 'thumb_c', episodeId: 'eo1', url: 'https://media.quantumnexus.app/the-flame-grill/thumbnails/opt-c.jpg', style: 'ai_generated', isSelected: false }], count: 3 }),
  },

  facelessAudienceIntelligence: {
    getInsights: (_tenantId: string): AudienceInsightsDTO => ({ avgViewDuration: 45, topDemographic: '25-34', engagementPeakDay: 'Wednesday', suggestedPostTime: '18:00' }),
    getGrowthData: (_tenantId: string): AudienceGrowthDTO => ({ subscribers: 1200, views: 15000, growthRate: 12.5 }),
  },

  facelessEpisodeTracker: {
    getEpisodes: (_tenantId: string, _storylineId: string): EpisodeTrackerDTO[] => [{ id: 'et1', storylineId: 'sl1', episodeNumber: 1, title: 'The Perfect Nshima', status: 'published', publishedAt: '2026-04-10T10:00:00Z', views: 850, engagement: 72 }],
    getEpisode: (_tenantId: string, episodeId: string): EpisodeTrackerDTO | null => episodeId === 'et1' ? { id: 'et1', storylineId: 'sl1', episodeNumber: 1, title: 'The Perfect Nshima', status: 'published', publishedAt: '2026-04-10T10:00:00Z', views: 850, engagement: 72 } : null,
    updateEpisodeStatus: (_tenantId: string, _episodeId: string, status: string): { success: boolean; status: string } => ({ success: true, status }),
  },

  // ─── Shared Modules ──────────────────────────────────────────────

  aiBubbleAssistant: {
    sendMessage: (_tenantId: string, message: string, _conversationId?: string): BubbleMessageDTO => ({ response: `Great question! Based on The Flame Grill's menu, I'd recommend our signature Mixed Grill Platter at K250 for two. It includes boerewors, ribs, and chicken — all flame-grilled to perfection. Would you like me to help you create a post about this?`, conversationId: _conversationId ?? 'conv_1' }),
    getConversation: (_tenantId: string, conversationId: string): BubbleConversationDTO => ({ messages: [{ role: 'user', content: 'What is our most popular dish?', timestamp: '2026-04-16T09:00:00Z' }, { role: 'assistant', content: 'Based on order data, the Mixed Grill Platter is your most popular item, ordered by 42% of dine-in customers last month.', timestamp: '2026-04-16T09:00:05Z' }], conversationId }),
    uploadInspiration: (_tenantId: string, _data: Record<string, unknown>): InspirationUploadDTO => ({ fileId: 'insp_new', analysisStatus: 'processing' }),
    getAnalysis: (_tenantId: string, _fileId: string): InspirationAnalysisDTO => ({ status: 'complete', analysis: 'This video features a behind-the-scenes kitchen format with natural lighting. The pacing is well-suited for Instagram Reels. Key hook at 0:03 — the flame ignition. Suggested content plan: recreate this format with your braai preparation sequence.', suggestedContentPlan: ['Instagram Reel: 30s braai preparation sequence', 'TikTok: 60s "Day in the Life of a Flame Grill Chef"', 'Blog: "The Art of the Perfect Braai — Our Secret Techniques"'] }),
  },

  accountWarmupEngine: {
    getWarmupStatus: (_tenantId: string): WarmupStatusDTO => ({ daysActive: 12, limits: { dailyPosts: 3, dailyStories: 1 }, isWarmupComplete: false }),
    getLimits: (_tenantId: string): WarmupLimitsDTO => ({ dailyPosts: 3, dailyStories: 1, dailyComments: 8 }),
    overrideLimits: (_tenantId: string, _data: Record<string, unknown>): ActionConfirmationDTO => ({ success: false, message: 'Warm-up limits cannot be overridden (RULE C-2)' }),
  },

  contentSafetyChecker: {
    checkContent: (_tenantId: string, _contentData: Record<string, unknown>): SafetyCheckDTO => ({ result: 'pass', flags: [], score: 98 }),
    getHistory: (_tenantId: string, _params: Record<string, unknown>): Array<{ id: string; result: string; score: number; checkedAt: string }> => [{ id: 'sch1', result: 'pass', score: 98, checkedAt: '2026-04-16T08:30:00Z' }],
  },

  oauthTokenManager: {
    getToken: (_tenantId: string, platform: string): OAuthTokenDTO => ({ platform, isValid: true, expiresAt: platform === 'tiktok' ? '2026-05-01T00:00:00Z' : '2026-06-01T00:00:00Z' }),
    refreshToken: (_tenantId: string, platform: string): { success: boolean; platform: string; expiresAt: string } => ({ success: true, platform, expiresAt: '2026-07-01T00:00:00Z' }),
    validateToken: (_tenantId: string, platform: string): { valid: boolean; platform: string } => ({ valid: true, platform }),
    getExpiringTokens: (_tenantId: string, _withinHours: number): ExpiringTokenDTO[] => [{ keyName: 'tiktok_oauth_token', platform: 'tiktok', expiresAt: '2026-05-01T00:00:00Z', hoursUntilExpiry: 360 }],
  },

  bullmqJobRegistry: {
    getQueueStatus: (_tenantId: string, queueName: string): QueueStatusDTO => ({ queue: queueName, waiting: 3, active: 2, completed: 847, failed: 4 }),
    getJobDetails: (_tenantId: string, _jobId: string): JobDetailsDTO => ({ id: 'job_detail', status: 'completed', progress: 100, createdAt: '2026-04-16T08:00:00Z', processedAt: '2026-04-16T08:02:30Z' }),
    retryJob: (_tenantId: string, _jobId: string): ActionConfirmationDTO => ({ success: true }),
    getDeadJobs: (_tenantId: string, _params: Record<string, unknown>): DeadJobDTO[] => [],
  },

  mediaStorageManager: {
    upload: (_tenantId: string, data: Record<string, unknown>): MediaUploadDTO => ({ url: `https://media.quantumnexus.app/the-flame-grill/${(data.fileName as string) ?? 'upload.png'}`, key: `the-flame-grill/${(data.fileName as string) ?? 'upload.png'}` }),
    deleteMedia: (_tenantId: string, _key: string): ActionConfirmationDTO => ({ success: true }),
    getSignedUrl: (_tenantId: string, key: string, _expiresIn: number): SignedUrlDTO => ({ url: `https://media.quantumnexus.app/signed/${key}?expires=1h`, expiresAt: '2026-04-16T17:00:00Z' }),
  },

  whisperTranscription: {
    submitJob: (_tenantId: string, _data: Record<string, unknown>): IdReferenceDTO => ({ id: 'whisper_new' }),
    getTranscription: (_tenantId: string, jobId: string): TranscriptionDTO => jobId === 'whisper_1' ? { id: jobId, status: 'complete', text: 'Welcome to The Flame Grill, Lusaka\'s home of authentic Zambian braai...', language: 'en' } : { id: jobId, status: 'processing', text: null, language: null },
  },

  notificationEngine: {
    getNotifications: (_tenantId: string, _params: Record<string, unknown>): NotificationDTO[] => NOTIFICATIONS,
    markRead: (_tenantId: string, _notificationId: string): ActionConfirmationDTO => ({ success: true }),
    markAllRead: (_tenantId: string): ActionConfirmationDTO => ({ success: true }),
    getUnreadCount: (_tenantId: string): UnreadCountDTO => ({ count: 3 }),
    updatePreferences: (_tenantId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
  },

  warmupEngine: {
    getStatus: (_tenantId: string): WarmupStatusDTO => ({ daysActive: 12, limits: { dailyPosts: 3, dailyStories: 1 }, isWarmupComplete: false }),
    getSchedule: (_tenantId: string): WarmupScheduleDTO => ({ postsPerDay: 3, optimalTimes: ['09:00', '13:00', '18:00'] }),
  },

  // ─── App Developer Modules ───────────────────────────────────────

  appProfileEngine: {
    getApps: (_tenantId: string): AppDTO[] => [{ id: 'ap1', name: 'Flame Grill Order App', platform: 'android', category: 'food_and_drink', status: 'published', downloads: 5200, iconUrl: 'https://media.quantumnexus.app/the-flame-grill/app/icon.png' }],
    getApp: (_tenantId: string, appId: string): AppDTO | null => appId === 'ap1' ? { id: 'ap1', name: 'Flame Grill Order App', platform: 'android', category: 'food_and_drink', status: 'published', downloads: 5200, iconUrl: 'https://media.quantumnexus.app/the-flame-grill/app/icon.png' } : null,
    createApp: (_tenantId: string, data: Record<string, unknown>): AppDTO => ({ id: 'ap_new', name: (data.name as string) ?? 'New App', platform: (data.platform as 'android' | 'ios' | 'both') ?? 'android', category: (data.category as string) ?? 'general', status: 'draft', downloads: 0, iconUrl: null }),
    updateApp: (_tenantId: string, _appId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
  },

  appStoreOptimizer: {
    getListing: (_tenantId: string, _appId: string): AppListingDTO => ({ title: 'Flame Grill — Order & Menu', description: 'Order your favourite Zambian dishes from The Flame Grill. Browse our menu, place orders for pickup, and earn loyalty points with every visit.', keywords: ['zambian food', 'restaurant', 'lusaka', 'braai', 'order food'], screenshots: ['https://media.quantumnexus.app/the-flame-grill/app/ss1.png', 'https://media.quantumnexus.app/the-flame-grill/app/ss2.png'] }),
    updateListing: (_tenantId: string, _appId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
    getASOScore: (_tenantId: string, _appId: string): ASOScoreDTO => ({ score: 68, suggestions: ['Add "nshima" to keywords', 'Include a video preview', 'Localise description for Zambian English'] }),
    getRankHistory: (_tenantId: string, keyword: string): RankHistoryDTO => ({ ranks: [{ date: '2026-04-10', rank: 15 }, { date: '2026-04-11', rank: 14 }, { date: '2026-04-12', rank: 12 }, { date: '2026-04-13', rank: 11 }, { date: '2026-04-14', rank: 10 }], keyword }),
  },

  appReviewMonitor: {
    getReviews: (_tenantId: string, _params: Record<string, unknown>): AppReviewDTO[] => [{ id: 'ar1', author: 'Chanda M.', rating: 5, text: 'Love ordering ahead! Food is always ready when I arrive.', repliedAt: '2026-04-12T08:00:00Z', replyText: 'Thank you Chanda! See you at the grill!', platform: 'google_play', createdAt: '2026-04-11T19:00:00Z' }, { id: 'ar2', author: 'Tendai P.', rating: 4, text: 'Great app but sometimes slow on mobile data.', repliedAt: null, replyText: null, platform: 'google_play', createdAt: '2026-04-14T15:00:00Z' }],
    getReviewStats: (_tenantId: string): AppReviewStatsDTO => ({ averageRating: 4.5, totalReviews: 28, responseRate: 75 }),
    respondToReview: (_tenantId: string, _reviewId: string, _response: string): ActionConfirmationDTO => ({ success: true }),
  },

  appContentGenerator: {
    generateReleaseNotes: (_tenantId: string, version: string, _changes: string[]): ReleaseNotesDTO => ({ content: `Version ${version}: We have improved order tracking and added push notifications for loyalty rewards. Performance improvements for slower networks.`, version }),
    generateDescription: (_tenantId: string, _appId: string): GeneratedDescriptionDTO => ({ content: 'Order your favourite Zambian dishes from The Flame Grill with ease. Browse the full menu, place orders for pickup, and earn loyalty points with every visit. Features: Full menu with photos, Order ahead for pickup, Loyalty points tracker, Push notifications for deals, Saved order history.' }),
    generateScreenshots: (_tenantId: string, _appId: string, _data: Record<string, unknown>): ScreenshotGenerationDTO => ({ urls: ['https://media.quantumnexus.app/the-flame-grill/app/gen-ss1.png', 'https://media.quantumnexus.app/the-flame-grill/app/gen-ss2.png', 'https://media.quantumnexus.app/the-flame-grill/app/gen-ss3.png'] }),
  },

  appSupportInbox: {
    getTickets: (_tenantId: string, _params: Record<string, unknown>): SupportTicketDTO[] => [{ id: 'ticket1', appId: 'ap1', userEmail: 'mwansa.b@email.zm', subject: 'Cannot see loyalty points', status: 'open', createdAt: '2026-04-15T10:00:00Z' }],
    getTicket: (_tenantId: string, ticketId: string): SupportTicketDTO | null => ticketId === 'ticket1' ? { id: 'ticket1', appId: 'ap1', userEmail: 'mwansa.b@email.zm', subject: 'Cannot see loyalty points', status: 'open', createdAt: '2026-04-15T10:00:00Z' } : null,
    createTicket: (_tenantId: string, data: Record<string, unknown>): SupportTicketDTO => ({ id: 'ticket_new', appId: (data.appId as string) ?? 'ap1', userEmail: (data.userEmail as string) ?? '', subject: (data.subject as string) ?? '', status: 'open', createdAt: new Date().toISOString() }),
    updateTicket: (_tenantId: string, _ticketId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
  },

  appAnalyticsDashboard: {
    getOverview: (_tenantId: string): AppAnalyticsOverviewDTO => ({ downloads: 5200, activeUsers: 1200, revenue: 45000, crashRate: 0.3 }),
    getCharts: (_tenantId: string, _chartType: string, period: string): ChartDataDTO => ({ data: [{ label: 'Week 1', value: 800 }, { label: 'Week 2', value: 950 }, { label: 'Week 3', value: 1100 }, { label: 'Week 4', value: 1250 }], period }),
    getRevenueBreakdown: (_tenantId: string): { total: number; inApp: number; subscriptions: number } => ({ total: 45000, inApp: 28000, subscriptions: 17000 }),
  },

  appPaymentIntelligence: {
    getRevenue: (_tenantId: string): AppRevenueDTO => ({ today: 1500, thisWeek: 8500, thisMonth: 45000 }),
    getChurnRate: (_tenantId: string): AppChurnDTO => ({ rate: 2.8, trend: 'improving' }),
    getTopProducts: (_tenantId: string): Array<{ name: string; revenue: number }> => [{ name: 'Premium Order Pass', revenue: 18000 }, { name: 'Loyalty Boost Pack', revenue: 12000 }],
  },

  // ─── Admin Modules ───────────────────────────────────────────────

  superAdminDashboard: {
    getPlatformStats: (_adminUserId: string): PlatformStatsDTO => ({ totalTenants: 148, activeTenants: 120, totalRevenue: 520000, monthlyGrowth: 8.5 }),
    getTenantList: (_adminUserId: string, _params: Record<string, unknown>): TenantSummaryDTO[] => [{ id: 't1', businessName: 'The Flame Grill', tier: 'growth', status: 'active', activatedAt: '2026-03-12T10:00:00Z', healthScore: 55 }, { id: 't2', businessName: 'Chitenge Boutique', tier: 'basic', status: 'pending_approval', activatedAt: null, healthScore: null }, { id: 't3', businessName: 'Munga Fitness Studio', tier: 'pro', status: 'active', activatedAt: '2026-02-28T14:00:00Z', healthScore: 72 }],
    getTenantDetails: (_adminUserId: string, tenantId: string): TenantDetailsDTO => ({ id: tenantId, name: 'The Flame Grill', status: 'active', tier: 'growth', niche: 'Restaurant', completenessScore: 78, sprintModeActive: true, activatedAt: '2026-03-12T10:00:00Z' }),
    suspendTenant: (_adminUserId: string, _tenantId: string, _reason: string): ActionConfirmationDTO => ({ success: true }),
    reactivateTenant: (_adminUserId: string, _tenantId: string): ActionConfirmationDTO => ({ success: true }),
  },

  resellerDashboard: {
    getClients: (_tenantId: string): ResellerClientDTO[] => [{ id: 'rc1', name: 'The Flame Grill', status: 'active', tier: 'growth', monthlySpend: 7500 }, { id: 'rc2', name: 'Lusaka Dry Cleaners', status: 'active', tier: 'basic', monthlySpend: 0 }],
    getClient: (_tenantId: string, clientId: string): ResellerClientDTO | null => clientId === 'rc1' ? { id: 'rc1', name: 'The Flame Grill', status: 'active', tier: 'growth', monthlySpend: 7500 } : null,
    getBranding: (_tenantId: string): ResellerBrandingDTO => ({ brandName: 'ZamBiz Digital', logo: 'https://media.quantumnexus.app/resellers/zambiz/logo.png', primaryColor: '#1B5E20', secondaryColor: '#FFC107' }),
    updateBranding: (_tenantId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
    getPricing: (_tenantId: string): { tiers: TierDTO[] } => ({ tiers: [{ id: 'basic', name: 'Starter', price: 0, features: ['content_generation'] }, { id: 'growth', name: 'Business', price: 500, features: ['content_generation', 'publishing'] }] }),
    updatePricing: (_tenantId: string, data: Record<string, unknown>): ActionConfirmationDTO & Record<string, unknown> => ({ success: true, ...data }),
  },

  deadJobMonitor: {
    getDeadJobs: (_adminUserId: string, _params: Record<string, unknown>): DeadJobDTO[] => [{ id: 'dj1', tenantId: 't5', queueName: 'social-publishing', jobType: 'instagram_post', errorMessage: 'OAuth token expired — post held', failedAt: '2026-04-14T18:30:00Z', reviewed: false }],
    getDeadJob: (_adminUserId: string, jobId: string): DeadJobDTO | null => jobId === 'dj1' ? { id: 'dj1', tenantId: 't5', queueName: 'social-publishing', jobType: 'instagram_post', errorMessage: 'OAuth token expired', failedAt: '2026-04-14T18:30:00Z', reviewed: false } : null,
    retryDeadJob: (_adminUserId: string, _jobId: string): ActionConfirmationDTO => ({ success: true }),
    dismissDeadJob: (_adminUserId: string, _jobId: string, _notes: string): ActionConfirmationDTO => ({ success: true }),
  },

  costDashboard: {
    getCostOverview: (_adminUserId: string): CostOverviewDTO => ({ anthropic: 420, elevenlabs: 180, twilio: 120, runway: 85, total: 805 }),
    getCostByTenant: (_adminUserId: string, _params: Record<string, unknown>): Array<{ tenantId: string; businessName: string; cost: number }> => [{ tenantId: 't1', businessName: 'The Flame Grill', cost: 45 }, { tenantId: 't3', businessName: 'Munga Fitness', cost: 62 }],
    getCostTrend: (_adminUserId: string, _period: string): ChartDataDTO => ({ data: [{ label: 'Jan', value: 650 }, { label: 'Feb', value: 720 }, { label: 'Mar', value: 780 }, { label: 'Apr', value: 805 }], period: 'monthly' }),
  },

  nicheResearchReview: {
    getPendingReviews: (_adminUserId: string): NicheReviewDTO[] => [{ id: 'nr1', nicheName: 'Zambian Crafts & Souvenirs', submittedAt: '2026-04-14T12:00:00Z', status: 'pending_review' }],
    approveNiche: (_adminUserId: string, _nicheId: string): ActionConfirmationDTO => ({ success: true }),
    rejectNiche: (_adminUserId: string, _nicheId: string, _reason: string): ActionConfirmationDTO => ({ success: true }),
  },

  appPublishingPipeline: {
    getSubmissions: (_adminUserId: string, _params: Record<string, unknown>): AppSubmissionDTO[] => [{ id: 'aps1', appId: 'ap2', appName: 'Lusaka Dry Cleaners App', submittedAt: '2026-04-15T10:00:00Z', status: 'submitted', reviewerNotes: null }],
    getSubmission: (_adminUserId: string, submissionId: string): AppSubmissionDTO | null => submissionId === 'aps1' ? { id: 'aps1', appId: 'ap2', appName: 'Lusaka Dry Cleaners App', submittedAt: '2026-04-15T10:00:00Z', status: 'submitted', reviewerNotes: null } : null,
    approveSubmission: (_adminUserId: string, _submissionId: string, _notes: string): { success: boolean; status: string } => ({ success: true, status: 'approved' }),
    rejectSubmission: (_adminUserId: string, _submissionId: string, _reason: string): { success: boolean; status: string } => ({ success: true, status: 'rejected' }),
  },

  platformHealthMonitor: {
    getHealth: (_adminUserId: string): PlatformHealthDTO => ({ workers: { content: 'green', publishing: 'green', aiScene: 'green', analytics: 'green' }, redis: 'green', supabase: 'green', uptime: 99.95 }),
    getWorkerDetails: (_adminUserId: string, _workerName: string): WorkerDetailsDTO => ({ worker: 'content-generation', status: 'green', jobsProcessed: 2847, errorRate: 0.3, lastJobAt: '2026-04-16T13:45:00Z' }),
    getAlerts: (_adminUserId: string, _params: Record<string, unknown>): PlatformAlertDTO[] => [],
  },
};

