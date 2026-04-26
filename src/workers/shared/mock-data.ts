/**
 * Mock data for Phase 1 and Phase 2.
 * All external API calls return data from this module until real integrations
 * are connected in Phase 3. Follows the PLACEHOLDER pattern from CLAUDE.md.
 *
 * Every function accepts tenant_id for multi-tenant mock isolation.
 * Every function produces unique IDs using a nanosecond timestamp fragment.
 *
 * Usage:
 *   // PLACEHOLDER: [SERVICE_NAME] — [WHAT IT DOES]
 *   // REAL INTEGRATION: /src/lib/integrations/[service].ts
 *   // PHASE: 3
 *   const result = MOCK_DATA.[module].[action]({ tenant_id, ... });
 */

let _seq = 0;
/** Generate a unique mock ID incorporating a sequence counter. */
function mockId(prefix: string): string {
  _seq++;
  return `${prefix}-${Date.now().toString(36)}-${_seq.toString(36)}`;
}

export const MOCK_DATA = {
  // ─── Content Generation ───────────────────────────────────
  content: {
    writing: (params: { tenant_id: string; content_type: string; target_platform: string; keywords?: string[] }) => ({
      id: mockId('cnt'),
      tenant_id: params.tenant_id,
      content_type: params.content_type,
      target_platform: params.target_platform,
      body: `[MOCK ${params.content_type.toUpperCase()}] AI-generated content for ${params.target_platform}. Tenant: ${params.tenant_id}. Keywords: ${(params.keywords ?? ['general']).join(', ')}. Dynamically constructed system prompt from Niche Profile injected with active trend data from trend-intelligence-engine.`,
      title: `Mock ${params.content_type} — ${params.target_platform} (${new Date().toLocaleDateString()})`,
      status: 'draft',
      word_count: params.content_type === 'blog_post' ? 1500 : params.content_type === 'script' ? 800 : 120,
      created_at: new Date().toISOString(),
    }),

    voice: (params: { tenant_id: string; voice_id: string; text: string; purpose: string }) => ({
      id: mockId('vce'),
      tenant_id: params.tenant_id,
      audio_url: `https://media.quantumnexus.app/${params.tenant_id}/audio/${mockId('vce')}.mp3`,
      duration_seconds: Math.ceil(params.text.length / 15), // rough estimate
      voice_id: params.voice_id,
      purpose: params.purpose,
      text_preview: params.text.substring(0, 80) + (params.text.length > 80 ? '...' : ''),
      generated_at: new Date().toISOString(),
    }),

    video: (params: { tenant_id: string; template_id: string; scenes: Array<{ id: string; duration: number }>; output_format: string }) => ({
      id: mockId('vid'),
      tenant_id: params.tenant_id,
      video_url: `https://media.quantumnexus.app/${params.tenant_id}/video/${mockId('vid')}.mp4`,
      thumbnail_url: `https://media.quantumnexus.app/${params.tenant_id}/video/${mockId('vid')}-thumb.jpg`,
      duration_seconds: params.scenes.reduce((sum, s) => sum + s.duration, 0),
      template_id: params.template_id,
      output_format: params.output_format,
      scene_count: params.scenes.length,
      rendered_at: new Date().toISOString(),
    }),

    image: (params: { tenant_id: string; prompt: string; size: string; purpose: string }) => ({
      id: mockId('img'),
      tenant_id: params.tenant_id,
      image_url: `https://media.quantumnexus.app/${params.tenant_id}/images/${mockId('img')}.png`,
      prompt: params.prompt,
      size: params.size,
      purpose: params.purpose,
      generated_at: new Date().toISOString(),
    }),

    transcription: (params: { tenant_id: string; media_url: string; language?: string }) => ({
      id: mockId('trn'),
      tenant_id: params.tenant_id,
      text: `[MOCK TRANSCRIPTION] Full transcription of media at ${params.media_url}. Language: ${params.language ?? 'en'}. Whisper self-hosted on Hetzner — zero external cost. Transcript includes timestamps and speaker diarisation.`,
      language: params.language ?? 'en',
      duration_seconds: 120,
      media_url: params.media_url,
      confidence: 0.95,
      transcribed_at: new Date().toISOString(),
    }),

    algorithmScore: (params: { tenant_id: string; content_id: string; target_platform: string }) => {
      const thresholds: Record<string, number> = { tiktok: 70, youtube: 65, instagram: 70, facebook: 60, linkedin: 65 };
      const threshold = thresholds[params.target_platform] ?? 65;
      const score = threshold + Math.floor(Math.random() * 20) + 5; // always pass in mock
      return {
        tenant_id: params.tenant_id,
        content_id: params.content_id,
        target_platform: params.target_platform,
        score,
        threshold,
        passed: score >= threshold,
        breakdown: {
          hook_strength: Math.min(25, 15 + Math.floor(Math.random() * 10)),
          completion_likelihood: Math.min(25, 14 + Math.floor(Math.random() * 10)),
          curiosity_gap: Math.min(15, 8 + Math.floor(Math.random() * 7)),
          trend_alignment: Math.min(15, 7 + Math.floor(Math.random() * 8)),
          rewatch_likelihood: Math.min(20, 12 + Math.floor(Math.random() * 8)),
        },
        scored_at: new Date().toISOString(),
      };
    },

    safetyCheck: (params: { tenant_id: string; content_id: string; content_type: string }) => ({
      tenant_id: params.tenant_id,
      content_id: params.content_id,
      safe: true,
      flags: [] as string[],
      classifier: 'claude-haiku-4-5',
      classification: 'APPROVED',
      checked_at: new Date().toISOString(),
    }),

    inspirationAnalysis: (params: { tenant_id: string; file_url: string; file_type: string }) => ({
      analysis_id: mockId('ins'),
      tenant_id: params.tenant_id,
      file_url: params.file_url,
      file_type: params.file_type,
      ai_model: params.file_type === 'video' ? 'Gemini 2.5 Pro' : 'Claude Sonnet 4.6 (vision)',
      summary: `[MOCK ${params.file_type.toUpperCase()} ANALYSIS] Identified style patterns, content hooks, format structure, and audience engagement signals. File: ${params.file_url}`,
      content_plan: {
        posts: 3 + Math.floor(Math.random() * 3),
        formats: ['carousel', 'reel', 'story', 'single-image'].slice(0, 2 + Math.floor(Math.random() * 2)),
        suggested_hooks: ['Question hook — ask audience directly', 'Shock stat hook — surprising data point', 'Behind-the-scenes hook — process transparency'],
        estimated_engagement: 'high',
      },
      analysed_at: new Date().toISOString(),
    }),

    recycling: (params: { tenant_id: string; original_content_id: string; target_format: string; target_platform: string }) => ({
      id: mockId('rcy'),
      tenant_id: params.tenant_id,
      original_content_id: params.original_content_id,
      target_format: params.target_format,
      target_platform: params.target_platform,
      new_content: `[MOCK RECYCLED] Content from ${params.original_content_id} repurposed as ${params.target_format} for ${params.target_platform}. High-performing source adapted with platform-specific hooks and formatting.`,
      status: 'draft',
      recycled_at: new Date().toISOString(),
    }),

    seoBlog: (params: { tenant_id: string; keyword: string; niche_profile_id: string }) => ({
      id: mockId('seo'),
      tenant_id: params.tenant_id,
      keyword: params.keyword,
      niche_profile_id: params.niche_profile_id,
      title: `The Complete Guide to ${params.keyword} — Expert Insights for 2026`,
      body: `[MOCK SEO BLOG] Comprehensive blog post optimised for keyword "${params.keyword}". Title includes keyword in H1. Internal links to 3-5 related posts. Meta description crafted for CTR. Schema markup included. Active trend data injected from trend-intelligence-engine.`,
      word_count: 1500 + Math.floor(Math.random() * 500),
      internal_links: [`/blog/${params.keyword}-guide-part-1`, `/blog/${params.keyword}-tips`, `/services/${params.keyword}`],
      meta_description: `Everything you need to know about ${params.keyword}. Expert tips, actionable strategies, and the latest insights.`,
      status: 'draft',
      generated_at: new Date().toISOString(),
    }),

    leadMagnet: (params: { tenant_id: string; topic: string; format: string; niche_profile_id: string }) => ({
      id: mockId('lm'),
      tenant_id: params.tenant_id,
      topic: params.topic,
      format: params.format,
      niche_profile_id: params.niche_profile_id,
      download_url: `https://media.quantumnexus.app/${params.tenant_id}/lead-magnets/${mockId('lm')}.${params.format === 'pdf' ? 'pdf' : 'docx'}`,
      title: `${params.topic} — Free ${params.format === 'pdf' ? 'Guide' : params.format === 'checklist' ? 'Checklist' : 'Template'}`,
      pages: 8 + Math.floor(Math.random() * 12),
      generated_at: new Date().toISOString(),
    }),
  },

  // ─── Social Publishing ────────────────────────────────────
  publishing: {
    socialPost: (params: { tenant_id: string; platform: string; content_id: string; post_text: string; media_urls?: string[] }) => ({
      post_id: mockId(`pst-${params.platform}`),
      tenant_id: params.tenant_id,
      platform: params.platform,
      content_id: params.content_id,
      platform_post_id: `platform-${mockId(params.platform)}`,
      status: 'published',
      published_at: new Date().toISOString(),
      post_text_preview: params.post_text.substring(0, 60) + (params.post_text.length > 60 ? '...' : ''),
      media_attached: (params.media_urls ?? []).length,
    }),

    oauthValidation: (params: { tenant_id: string; platform: string; account_id: string }) => ({
      tenant_id: params.tenant_id,
      valid: true,
      platform: params.platform,
      account_id: params.account_id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      scopes: ['publish', 'read', 'profile'],
      validated_at: new Date().toISOString(),
    }),

    oauthRefresh: (params: { tenant_id: string; platform: string; account_id: string }) => ({
      tenant_id: params.tenant_id,
      refreshed: true,
      platform: params.platform,
      account_id: params.account_id,
      new_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      refreshed_at: new Date().toISOString(),
    }),

    tokenExpiryAlert: (params: { tenant_id: string; platform: string; account_id: string; hours_until_expiry: number }) => ({
      tenant_id: params.tenant_id,
      alert_sent: true,
      platform: params.platform,
      account_id: params.account_id,
      hours_until_expiry: params.hours_until_expiry,
      channels: ['in_app', 'whatsapp', 'email'] as const,
      alert_id: mockId('exp'),
      sent_at: new Date().toISOString(),
    }),

    heldPost: (params: { tenant_id: string; held_post_id: string; action: string }) => ({
      tenant_id: params.tenant_id,
      held_post_id: params.held_post_id,
      action: params.action,
      result: params.action === 'retry' ? 'requeued for publishing' : params.action === 'cancel' ? 'cancelled from queue' : 'held — awaiting re-authentication',
      processed_at: new Date().toISOString(),
    }),

    gbpPost: (params: { tenant_id: string; location_id: string; content_id: string }) => ({
      tenant_id: params.tenant_id,
      post_id: mockId('gbp'),
      location_id: params.location_id,
      content_id: params.content_id,
      status: 'published',
      published_at: new Date().toISOString(),
    }),

    whatsappBroadcast: (params: { tenant_id: string; contact_list_id: string; message_template_id: string }) => ({
      tenant_id: params.tenant_id,
      broadcast_id: mockId('wab'),
      contact_list_id: params.contact_list_id,
      message_template_id: params.message_template_id,
      recipients: 120 + Math.floor(Math.random() * 80),
      delivered: 115 + Math.floor(Math.random() * 70),
      read: 70 + Math.floor(Math.random() * 50),
      status: 'completed',
      completed_at: new Date().toISOString(),
    }),

    smsDelivery: (params: { tenant_id: string; to: string; message: string }) => ({
      tenant_id: params.tenant_id,
      message_id: mockId('sms'),
      to: params.to,
      message_preview: params.message.substring(0, 40) + (params.message.length > 40 ? '...' : ''),
      provider: 'twilio',
      status: 'delivered',
      delivered_at: new Date().toISOString(),
    }),

    emailDelivery: (params: { tenant_id: string; to: string; subject: string; template_id: string }) => ({
      tenant_id: params.tenant_id,
      message_id: mockId('eml'),
      to: params.to,
      subject: params.subject,
      template_id: params.template_id,
      provider: 'mock-email-provider',
      status: 'sent',
      sent_at: new Date().toISOString(),
    }),

    accountWarmup: (params: { tenant_id: string; platform: string; account_id: string; days_since_connection: number }) => ({
      tenant_id: params.tenant_id,
      platform: params.platform,
      account_id: params.account_id,
      days_since_connection: params.days_since_connection,
      max_posts_per_day: Math.min(Math.floor(params.days_since_connection / 2) + 1, 10),
      posts_today: Math.min(Math.floor(params.days_since_connection / 3), 5),
      warmup_complete: params.days_since_connection >= 30,
      can_post: true,
      checked_at: new Date().toISOString(),
    }),

    qaPost: (params: { tenant_id: string; platform: string; question_id: string; answer_text: string }) => ({
      tenant_id: params.tenant_id,
      answer_id: mockId(`qa-${params.platform}`),
      platform: params.platform,
      question_id: params.question_id,
      answer_preview: params.answer_text.substring(0, 60) + '...',
      status: 'posted',
      posted_at: new Date().toISOString(),
    }),

    directorySubmission: (params: { tenant_id: string; directory: string; business_name: string }) => ({
      tenant_id: params.tenant_id,
      submission_id: mockId('dir'),
      directory: params.directory,
      business_name: params.business_name,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      estimated_review_days: 7 + Math.floor(Math.random() * 14),
    }),

    appReviewReply: (params: { tenant_id: string; store: string; review_id: string; reply_text: string }) => ({
      tenant_id: params.tenant_id,
      reply_id: mockId(`rev-${params.store}`),
      store: params.store,
      review_id: params.review_id,
      reply_preview: params.reply_text.substring(0, 60) + '...',
      status: 'posted',
      posted_at: new Date().toISOString(),
    }),
  },

  // ─── AI Scene Generation ─────────────────────────────────
  aiScene: {
    runwayVideo: (params: { tenant_id: string; scene_description: string; style: string; duration_seconds: number }) => ({
      video_id: mockId('rwy'),
      tenant_id: params.tenant_id,
      video_url: `https://media.quantumnexus.app/${params.tenant_id}/ai-scenes/${mockId('rwy')}.mp4`,
      scene_description: params.scene_description,
      style: params.style,
      duration_seconds: params.duration_seconds,
      status: 'completed',
      generated_at: new Date().toISOString(),
    }),

    premiumCheck: (params: { tenant_id: string }) => ({
      tenant_id: params.tenant_id,
      is_premium: true,
      tier: 'premium',
      checked_at: new Date().toISOString(),
    }),

    quotaCheck: (params: { tenant_id: string }) => {
      const total = 10;
      const used = 3 + Math.floor(Math.random() * 5);
      return {
        tenant_id: params.tenant_id,
        quota_total: total,
        quota_used: used,
        quota_remaining: total - used,
        quota_period: 'monthly',
        checked_at: new Date().toISOString(),
      };
    },
  },

  // ─── Analytics & SEO ─────────────────────────────────────
  analytics: {
    gscPull: (params: { tenant_id: string; site_url: string; data_type: string; date_range: { start: string; end: string } }) => ({
      tenant_id: params.tenant_id,
      site_url: params.site_url,
      data_type: params.data_type,
      date_range: params.date_range,
      records: 20 + Math.floor(Math.random() * 30),
      summary: {
        impressions: 1200 + Math.floor(Math.random() * 800),
        clicks: 200 + Math.floor(Math.random() * 200),
        average_position: +(5 + Math.random() * 10).toFixed(1),
        indexed_pages: 45 + Math.floor(Math.random() * 30),
      },
      pulled_at: new Date().toISOString(),
    }),

    ga4Pull: (params: { tenant_id: string; property_id: string; metrics: string[]; date_range: { start: string; end: string } }) => ({
      tenant_id: params.tenant_id,
      property_id: params.property_id,
      metrics: params.metrics,
      date_range: params.date_range,
      records: 25 + Math.floor(Math.random() * 20),
      summary: {
        sessions: 2000 + Math.floor(Math.random() * 1500),
        page_views: 3500 + Math.floor(Math.random() * 2000),
        conversions: 30 + Math.floor(Math.random() * 40),
        bounce_rate: +(35 + Math.random() * 25).toFixed(1),
        avg_session_duration: `${2 + Math.floor(Math.random() * 3)}m ${Math.floor(Math.random() * 60)}s`,
      },
      pulled_at: new Date().toISOString(),
    }),

    competitorRank: (params: { tenant_id: string; keywords: string[]; competitor_domains: string[] }) => ({
      tenant_id: params.tenant_id,
      keywords_tracked: params.keywords.length,
      competitor_domains: params.competitor_domains,
      rankings: params.keywords.map((kw, i) => ({
        keyword: kw,
        tenant_position: Math.max(1, i + Math.floor(Math.random() * 5)),
        competitors: params.competitor_domains.map((domain, j) => ({
          domain,
          position: Math.max(1, i + j + Math.floor(Math.random() * 8)),
        })),
      })),
      tracked_at: new Date().toISOString(),
    }),

    socialAnalytics: (params: { tenant_id: string; platform: string; account_id: string; metrics: string[]; date_range: { start: string; end: string } }) => ({
      tenant_id: params.tenant_id,
      platform: params.platform,
      account_id: params.account_id,
      metrics: params.metrics,
      date_range: params.date_range,
      engagement: {
        likes: 300 + Math.floor(Math.random() * 400),
        comments: 20 + Math.floor(Math.random() * 50),
        shares: 10 + Math.floor(Math.random() * 30),
        saves: 5 + Math.floor(Math.random() * 20),
      },
      reach: 4000 + Math.floor(Math.random() * 3000),
      follower_growth: 10 + Math.floor(Math.random() * 40),
      pulled_at: new Date().toISOString(),
    }),

    gbpInsights: (params: { tenant_id: string; location_id: string; date_range: { start: string; end: string } }) => ({
      tenant_id: params.tenant_id,
      location_id: params.location_id,
      date_range: params.date_range,
      impressions: 2500 + Math.floor(Math.random() * 2000),
      searches: { direct: 300 + Math.floor(Math.random() * 200), discovery: 400 + Math.floor(Math.random() * 300) },
      views: { search: 800 + Math.floor(Math.random() * 500), maps: 400 + Math.floor(Math.random() * 300) },
      actions: { website: 30 + Math.floor(Math.random() * 30), calls: 8 + Math.floor(Math.random() * 15), directions: 20 + Math.floor(Math.random() * 20) },
      pulled_at: new Date().toISOString(),
    }),

    dashboardAggregation: (params: { tenant_id: string; aggregation_type: string }) => ({
      tenant_id: params.tenant_id,
      aggregation_type: params.aggregation_type,
      cached_at: new Date().toISOString(),
      data: {
        posts_published_today: 4 + Math.floor(Math.random() * 6),
        posts_scheduled_next_24h: 6 + Math.floor(Math.random() * 8),
        seo_tasks_completed_today: 5 + Math.floor(Math.random() * 5),
        seo_tasks_pending_today: 2 + Math.floor(Math.random() * 3),
        active_trends: 2 + Math.floor(Math.random() * 4),
        customer_new_today: 1 + Math.floor(Math.random() * 5),
        revenue_today: `ZMW ${(3000 + Math.floor(Math.random() * 5000)).toLocaleString()}`,
        worker_health: { worker1: 'green', worker2: 'green', worker3: 'green', worker4: 'green' },
        reputation_velocity: 60 + Math.floor(Math.random() * 30),
        client_health_score: 70 + Math.floor(Math.random() * 25),
      },
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }),

    sitemapSubmission: (params: { tenant_id: string; sitemap_url: string }) => ({
      tenant_id: params.tenant_id,
      sitemap_url: params.sitemap_url,
      submitted: true,
      gsc_response: 'Received — sitemap queued for processing',
      submitted_at: new Date().toISOString(),
    }),

    pageIndexing: (params: { tenant_id: string; page_url: string }) => ({
      tenant_id: params.tenant_id,
      page_url: params.page_url,
      indexing_requested: true,
      gsc_response: 'Indexing request received — URL queued',
      requested_at: new Date().toISOString(),
      indexed_pages_table_updated: true,
      mission_control_feed_updated: true,
    }),

    nicheResearch: (params: { tenant_id: string; niche: string; location: string }) => ({
      tenant_id: params.tenant_id,
      niche: params.niche,
      location: params.location,
      ai_model: 'Claude Sonnet 4.6 + web search',
      trends: [
        { name: `${params.niche} automation trend 2026`, relevance: 92, volume: 'rising' },
        { name: `${params.niche} customer experience`, relevance: 85, volume: 'stable' },
        { name: `${params.niche} local SEO in ${params.location}`, relevance: 78, volume: 'rising' },
      ],
      competitors: [
        { domain: `top-${params.niche}-${params.location.toLowerCase().replace(/\s/g, '')}.com`, strength: 'strong SEO presence' },
        { domain: `${params.niche}-leader-zm.com`, strength: 'active social media' },
      ],
      keyword_opportunities: [
        { keyword: `best ${params.niche} in ${params.location}`, difficulty: 45, volume: 1200 },
        { keyword: `affordable ${params.niche} ${params.location}`, difficulty: 35, volume: 800 },
      ],
      researched_at: new Date().toISOString(),
    }),

    dailyReport: (params: { tenant_id: string; report_date: string; channels: string[] }) => ({
      tenant_id: params.tenant_id,
      report_date: params.report_date,
      channels: params.channels,
      summary: {
        posts_published: 6 + Math.floor(Math.random() * 6),
        engagement_rate: +(3 + Math.random() * 4).toFixed(1),
        seo_progress: `+${2 + Math.floor(Math.random() * 5)} indexed pages, ${1 + Math.floor(Math.random() * 3)} keywords improved`,
        revenue: `ZMW ${(8000 + Math.floor(Math.random() * 10000)).toLocaleString()}`,
        new_customers: 1 + Math.floor(Math.random() * 4),
        pending_tasks: Math.floor(Math.random() * 3),
      },
      alerts: Math.random() > 0.7 ? ['TikTok token expiring in 72 hours'] : [],
      delivered_via: params.channels,
      generated_at: new Date().toISOString(),
    }),

    lencoPayment: (params: { tenant_id: string; invoice_id: string }) => {
      const daysOverdue = Math.floor(Math.random() * 20);
      const statuses = ['paid', 'paid', 'paid', 'grace_period', 'overdue']; // weighted toward paid
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      return {
        tenant_id: params.tenant_id,
        invoice_id: params.invoice_id,
        status,
        amount: `ZMW ${(3000 + Math.floor(Math.random() * 7000)).toLocaleString()}`,
        days_overdue: status === 'paid' ? 0 : daysOverdue,
        grace_trigger: status === 'grace_period',
        suspension_trigger: daysOverdue >= 14,
        deletion_warning: daysOverdue >= 30,
        paid_at: status === 'paid' ? new Date().toISOString() : undefined,
        checked_at: new Date().toISOString(),
      };
    },

    businessAudit: (params: { tenant_id: string; audit_type: string }) => ({
      tenant_id: params.tenant_id,
      audit_id: mockId('aud'),
      audit_type: params.audit_type,
      overall_score: 55 + Math.floor(Math.random() * 35),
      gaps: [
        'Missing or incomplete Google Business Profile',
        'Backlink count below niche average',
        'No systematic review generation strategy',
        'Social media posting frequency inconsistent',
      ].slice(0, 2 + Math.floor(Math.random() * 3)),
      strengths: [
        'Active social media presence',
        'Good content publishing frequency',
        'Website has structured data markup',
        'Mobile-responsive website',
      ].slice(0, 1 + Math.floor(Math.random() * 3)),
      recommendations: [
        'Claim and optimise Google Business Profile',
        'Implement review request automation',
        'Increase backlink acquisition rate',
      ].slice(0, 1 + Math.floor(Math.random() * 3)),
      audited_at: new Date().toISOString(),
    }),

    trendScan: (params: { tenant_id: string; niche: string }) => ({
      tenant_id: params.tenant_id,
      niche: params.niche,
      ai_model: 'Gemini 2.0 Flash',
      new_trends: [
        { name: `${params.niche} short-form video format trending`, score: 80 + Math.floor(Math.random() * 15), source: 'tiktok_discover', status: 'NEW' },
        { name: `${params.niche} seasonal demand spike`, score: 65 + Math.floor(Math.random() * 20), source: 'google_trends', status: 'NEW' },
        { name: `${params.niche} AI tools adoption`, score: 55 + Math.floor(Math.random() * 25), source: 'reddit_discussion', status: 'ACTIVE' },
      ],
      scanned_at: new Date().toISOString(),
    }),

    trendExpiry: (params: { tenant_id: string }) => ({
      tenant_id: params.tenant_id,
      expired_trends: [
        { name: 'Outdated seasonal trend', expired_at: new Date().toISOString(), previous_score: 45 },
      ],
      active_trends: 3 + Math.floor(Math.random() * 4),
      checked_at: new Date().toISOString(),
    }),

    reputationVelocity: (params: { tenant_id: string }) => ({
      tenant_id: params.tenant_id,
      score: 55 + Math.floor(Math.random() * 35),
      trend: Math.random() > 0.3 ? 'up' : 'stable',
      backlinks: { change: Math.floor(Math.random() * 10) - 2, total: 50 + Math.floor(Math.random() * 100) },
      indexed_pages: { change: 5 + Math.floor(Math.random() * 15), total: 40 + Math.floor(Math.random() * 60) },
      reviews: { change: Math.floor(Math.random() * 5), total: 10 + Math.floor(Math.random() * 40) },
      followers: { change: 10 + Math.floor(Math.random() * 50), total: 200 + Math.floor(Math.random() * 800) },
      updated_at: new Date().toISOString(),
    }),

    clientHealth: (params: { tenant_id: string }) => {
      const content = 65 + Math.floor(Math.random() * 30);
      const seo = 55 + Math.floor(Math.random() * 35);
      const social = 60 + Math.floor(Math.random() * 30);
      const billing = 70 + Math.floor(Math.random() * 25);
      return {
        tenant_id: params.tenant_id,
        score: Math.round((content + seo + social + billing) / 4),
        trend: Math.random() > 0.2 ? 'stable' : 'declining',
        factors: { content, seo, social, billing },
        updated_at: new Date().toISOString(),
      };
    },

    keywordCannibalisation: (params: { tenant_id: string }) => ({
      tenant_id: params.tenant_id,
      issues_found: Math.random() > 0.6 ? 1 : 0,
      details: Math.random() > 0.6
        ? [{ keyword: 'primary service keyword', competing_pages: ['/services', '/blog/service-guide', '/homepage'], recommendation: 'Consolidate /blog/service-guide into /services with 301 redirect' }]
        : [],
      scanned_at: new Date().toISOString(),
    }),

    entityConsistency: (params: { tenant_id: string }) => ({
      tenant_id: params.tenant_id,
      consistent: Math.random() > 0.3,
      issues: Math.random() > 0.3
        ? []
        : ['NAP mismatch on Yelp — phone number outdated', 'Category mismatch on Bing Places'],
      directories_checked: 8 + Math.floor(Math.random() * 7),
      checked_at: new Date().toISOString(),
    }),

    contentRefresh: (params: { tenant_id: string; content_id?: string }) => ({
      tenant_id: params.tenant_id,
      target: params.content_id ?? 'all posts older than 6 months',
      refreshed_count: params.content_id ? 1 : 2 + Math.floor(Math.random() * 5),
      refreshed_content_ids: params.content_id
        ? [params.content_id]
        : Array.from({ length: 2 + Math.floor(Math.random() * 4) }, () => mockId('ref')),
      refreshed_at: new Date().toISOString(),
    }),

    sprintModeEnd: (params: { tenant_id: string }) => ({
      tenant_id: params.tenant_id,
      sprint_mode_active: false,
      days_since_activation: 31,
      action_taken: 'sprint_mode_disabled',
      notification_sent: 'Your 30-day growth sprint is complete. Your sustainable schedule is now active.',
      sustainable_schedule_active: true,
      warmup_limits_still_enforced: true,
      checked_at: new Date().toISOString(),
    }),

    appRevenue: (params: { tenant_id: string; app_id: string }) => ({
      tenant_id: params.tenant_id,
      app_id: params.app_id,
      revenue: `USD ${(1500 + Math.floor(Math.random() * 3000)).toLocaleString()}`,
      period: 'monthly',
      currency: 'USD',
      sync_source: 'google_play',
      synced_at: new Date().toISOString(),
    }),

    asoRank: (params: { tenant_id: string; app_id: string; store: string }) => ({
      tenant_id: params.tenant_id,
      app_id: params.app_id,
      store: params.store,
      rank: 20 + Math.floor(Math.random() * 60),
      category: 'business',
      previous_rank: 25 + Math.floor(Math.random() * 55),
      rank_change: -(5 + Math.floor(Math.random() * 10)), // negative = improved
      checked_at: new Date().toISOString(),
    }),

    appReviewMonitoring: (params: { tenant_id: string; app_id: string }) => ({
      tenant_id: params.tenant_id,
      app_id: params.app_id,
      new_reviews: 1 + Math.floor(Math.random() * 5),
      average_rating: +(3.5 + Math.random() * 1.5).toFixed(1),
      total_reviews: 50 + Math.floor(Math.random() * 200),
      flagged_negative: Math.random() > 0.7 ? [{ review_id: mockId('rev'), rating: 2, preview: 'App crashes when...' }] : [],
      reply_jobs_triggered: Math.random() > 0.5 ? 1 : 0,
      monitored_at: new Date().toISOString(),
    }),
  },
} as const;
