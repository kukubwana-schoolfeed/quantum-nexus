/**
 * Server Index — Route Registry
 * @module server/index
 * @description Central export point for all server route modules.
 * Used for route mapping in the Next.js API layer.
 */

// Platform Core
export * as onboardingEngine from './routes/platform-core/onboarding-engine';
export * as nicheIntelligence from './routes/platform-core/niche-intelligence';
export * as nicheResearch from './routes/platform-core/niche-research';
export * as apiKeyManager from './routes/platform-core/api-key-manager';
export * as completenessScoring from './routes/platform-core/completeness-scoring';
export * as adminApprovalGate from './routes/platform-core/admin-approval-gate';
export * as tierSystem from './routes/platform-core/tier-system';
export * as billingEngine from './routes/platform-core/billing-engine';
export * as paymentTracker from './routes/platform-core/payment-tracker';
export * as softDeleteArchive from './routes/platform-core/soft-delete-archive';
export * as sprintModeEngine from './routes/platform-core/sprint-mode-engine';

// Business
export * as seoEngine from './routes/business/seo-engine';
export * as contentMachine from './routes/business/content-machine';
export * as socialMediaLayer from './routes/business/social-media-layer';
export * as inboundCallHandler from './routes/business/inbound-call-handler';
export * as outboundSalesEngine from './routes/business/outbound-sales-engine';
export * as googleBusinessProfileManager from './routes/business/google-business-profile-manager';
export * as broadcastEngine from './routes/business/broadcast-engine';
export * as customerDatabase from './routes/business/customer-database';
export * as birthdayEngine from './routes/business/birthday-engine';
export * as retentionLayer from './routes/business/retention-layer';
export * as reviewCampaignManager from './routes/business/review-campaign-manager';
export * as videoTestimonialCollector from './routes/business/video-testimonial-collector';
export * as loyaltyPointsEngine from './routes/business/loyalty-points-engine';
export * as leadMagnetBuilder from './routes/business/lead-magnet-builder';
export * as seasonalCampaignEngine from './routes/business/seasonal-campaign-engine';
export * as offlineQrBridge from './routes/business/offline-qr-bridge';
export * as competitorIntelligence from './routes/business/competitor-intelligence';
export * as reputationLayer from './routes/business/reputation-layer';
export * as approvalQueue from './routes/business/approval-queue';
export * as knowledgeBaseBuilder from './routes/business/knowledge-base-builder';
export * as communityModule from './routes/business/community-module';
export * as analyticsDashboard from './routes/business/analytics-dashboard';
export * as dailyReportEngine from './routes/business/daily-report-engine';
export * as crisisDetection from './routes/business/crisis-detection';
export * as callFallbackHandler from './routes/business/call-fallback-handler';
export * as whiteLabelAppBuilder from './routes/business/white-label-app-builder';
export * as algorithmScoringEngine from './routes/business/algorithm-scoring-engine';
export * as clientHealthScoreBusiness from './routes/business/client-health-score';

// Domination
export * as businessAuditEngine from './routes/domination/business-audit-engine';
export * as seoDominationEngine from './routes/domination/seo-domination-engine';
export * as trendIntelligenceEngine from './routes/domination/trend-intelligence-engine';
export * as contentRecyclingEngine from './routes/domination/content-recycling-engine';
export * as entityBuilder from './routes/domination/entity-builder';
export * as reputationVelocityTracker from './routes/domination/reputation-velocity-tracker';
export * as keywordCannibalisationDetector from './routes/domination/keyword-cannibalisation-detector';
export * as clientHealthScore from './routes/domination/client-health-score';

// UGC
export * as ugcVideoIngestion from './routes/ugc/ugc-video-ingestion';
export * as ugcClipIntelligence from './routes/ugc/ugc-clip-intelligence';
export * as ugcClipPreview from './routes/ugc/ugc-clip-preview';
export * as ugcRenderPipeline from './routes/ugc/ugc-render-pipeline';
export * as ugcContentCalendar from './routes/ugc/ugc-content-calendar';
export * as ugcTrendMonitor from './routes/ugc/ugc-trend-monitor';
export * as ugcPerformanceFeedback from './routes/ugc/ugc-performance-feedback';
export * as ugcMonetisationIntelligence from './routes/ugc/ugc-monetisation-intelligence';
export * as ugcPodcastSupport from './routes/ugc/ugc-podcast-support';

// Faceless
export * as facelessCharacterStudio from './routes/faceless/faceless-character-studio';
export * as facelessStorylineEditor from './routes/faceless/faceless-storyline-editor';
export * as facelessSeriesBible from './routes/faceless/faceless-series-bible';
export * as facelessEpisodeOutliner from './routes/faceless/faceless-episode-outliner';
export * as facelessSceneBreakdown from './routes/faceless/faceless-scene-breakdown';
export * as facelessRunwayPipeline from './routes/faceless/faceless-runway-pipeline';
export * as facelessVoicePipeline from './routes/faceless/faceless-voice-pipeline';
export * as facelessAssemblyPipeline from './routes/faceless/faceless-assembly-pipeline';
export * as facelessThumbnailGenerator from './routes/faceless/faceless-thumbnail-generator';
export * as facelessAudienceIntelligence from './routes/faceless/faceless-audience-intelligence';
export * as facelessEpisodeTracker from './routes/faceless/faceless-episode-tracker';

// Shared Modules
export * as aiBubbleAssistant from './routes/shared-modules/ai-bubble-assistant';
export * as accountWarmupEngine from './routes/shared-modules/account-warmup-engine';
export * as contentSafetyChecker from './routes/shared-modules/content-safety-checker';
export * as oauthTokenManager from './routes/shared-modules/oauth-token-manager';
export * as bullmqJobRegistry from './routes/shared-modules/bullmq-job-registry';
export * as mediaStorageManager from './routes/shared-modules/media-storage-manager';
export * as whisperTranscription from './routes/shared-modules/whisper-transcription';
export * as notificationEngine from './routes/shared-modules/notification-engine';
export * as warmupEngine from './routes/shared-modules/warmup-engine';

// App Developer
export * as appProfileEngine from './routes/app-developer/app-profile-engine';
export * as appStoreOptimizer from './routes/app-developer/app-store-optimizer';
export * as appReviewMonitor from './routes/app-developer/app-review-monitor';
export * as appContentGenerator from './routes/app-developer/app-content-generator';
export * as appSupportInbox from './routes/app-developer/app-support-inbox';
export * as appAnalyticsDashboard from './routes/app-developer/app-analytics-dashboard';
export * as appPaymentIntelligence from './routes/app-developer/app-payment-intelligence';

// Admin
export * as superAdminDashboard from './routes/admin/super-admin-dashboard';
export * as resellerDashboard from './routes/admin/reseller-dashboard';
export * as deadJobMonitor from './routes/admin/dead-job-monitor';
export * as costDashboard from './routes/admin/cost-dashboard';
export * as nicheResearchReview from './routes/admin/niche-research-review';
export * as appPublishingPipeline from './routes/admin/app-publishing-pipeline';
export * as platformHealthMonitor from './routes/admin/platform-health-monitor';
