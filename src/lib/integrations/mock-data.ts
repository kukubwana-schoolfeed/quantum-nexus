/**
 * MOCK_DATA — Shared mock utilities for Phase 2
 *
 * Phase 1 returned empty stubs. Phase 2 returns realistic typed mock data
 * that matches real API response shapes so the full UI is demo-able.
 *
 * Each integration file calls these helpers to generate consistent,
 * realistic-looking mock responses. Integration files own their own
 * domain-specific mock content — this file provides shared primitives.
 *
 * Real integrations replace mock calls in Phase 3+.
 */

// --- ID Generators ---

/** Generate a realistic-looking random ID (no crypto dependency) */
export function mockId(prefix: string = '', length: number = 17): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return prefix ? `${prefix}_${id}` : id;
}

/** Generate a realistic SID-style ID (e.g. Twilio CAxxxx, SMxxxx) */
export function mockSid(prefix: string, length: number = 32): string {
  const chars = 'abcdef0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}${id}`;
}

// --- Timestamp Generators ---

/** ISO 8601 timestamp for N minutes ago */
export function mockTimestamp(minutesAgo: number = 0): string {
  const d = new Date(Date.now() - minutesAgo * 60_000);
  return d.toISOString();
}

/** ISO 8601 timestamp for N days from now */
export function mockFutureTimestamp(daysFromNow: number): string {
  const d = new Date(Date.now() + daysFromNow * 86_400_000);
  return d.toISOString();
}

/** Date string YYYY-MM-DD for N days ago */
export function mockDate(daysAgo: number = 0): string {
  const d = new Date(Date.now() - daysAgo * 86_400_000);
  return d.toISOString().split('T')[0];
}

// --- Number Generators ---

/** Random integer between min and max (inclusive) */
export function mockInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Random float between min and max, rounded to 2 decimal places */
export function mockFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

/** Random percentage between min and max */
export function mockPercent(min: number = 0, max: number = 100): number {
  return mockFloat(min, max);
}

// --- URL Generators ---

/** Realistic R2 CDN URL for media */
export function mockR2Url(tenantId: string, path: string, fileName: string): string {
  return `https://media.quantumnexus.app/${tenantId}/${path}/${fileName}`;
}

/** Realistic YouTube video URL */
export function mockYoutubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

// --- Phone Number Generator ---

/** Realistic Zambian phone number format */
export function mockPhone(): string {
  return `+260${mockInt(760000000, 779999999)}`;
}

// --- Pick Helper ---

/** Pick a random element from an array */
export function mockPick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Mock Content Snippets ---

export const MOCK_CONTENT = {
  /** Realistic AI-generated content snippets */
  aiResponses: [
    'Based on your niche profile, here are three content pillars that will establish authority in your market: educational deep-dives, customer success stories, and behind-the-scenes process reveals. Each pillar should produce 2-3 posts per week for optimal engagement.',
    'Your competitive analysis reveals a gap in long-form educational content. Businesses in your niche that publish weekly SEO-optimized guides see 340% more organic traffic. I recommend starting with a "Complete Guide" series targeting your top 5 keywords.',
    'The trending topics in your niche this week centre around sustainability and local sourcing. I recommend creating content that positions your business as a thought leader on these themes before your competitors fill the space.',
    'Your onboarding interview reveals strong differentiation potential in your personal brand story. I recommend building your content strategy around authentic storytelling — customers in your niche trust businesses that show their process and people.',
    'Safety check passed. The proposed content does not violate any platform policies and aligns with your brand voice. The tone is professional yet approachable, and all claims are substantiated.',
  ],

  /** Realistic video analysis output */
  videoAnalysis: 'This video covers the core service offering with strong visual demonstration. Key moments: introduction at 0:00-0:15, product demo at 0:15-1:45, customer testimonial at 1:45-2:30, call-to-action at 2:30-3:00. The testimonial segment has the highest engagement potential for clip extraction.',

  /** Realistic transcription text */
  transcripts: [
    "Welcome to our weekly update. This week we've been focusing on improving our customer experience and I'm excited to share some of the changes we've made. First, we've streamlined our booking process so customers can schedule appointments in under thirty seconds.",
    "Today I want to talk about something that's been on my mind — the importance of consistency in your business operations. When customers know what to expect every single time they interact with you, that builds trust, and trust is the foundation of every successful business.",
    "Let me walk you through our new product line. We've spent the last three months developing these items based directly on customer feedback. Every feature you see here was requested by real customers who use our products daily.",
  ],

  /** Realistic post captions */
  socialCaptions: [
    "Here's what most businesses in our niche get wrong about customer retention — and the one thing that changes everything. Link in bio for the full guide.",
    "We asked 200 of our customers what they value most. The number one answer surprised us. What do you think it was? Drop your guess below.",
    "Behind every great product is a team that refuses to cut corners. Here's a look at our process from raw material to finished product.",
    "Your customers don't buy products. They buy better versions of themselves. Here's how to reframe your messaging to connect on a deeper level.",
    "The difference between a business that survives and one that thrives? Consistency. We've shown up every single day for our community — and it shows.",
  ],

  /** Realistic review texts */
  reviews: [
    'Absolutely fantastic service! The team went above and beyond to make sure everything was perfect. Will definitely be coming back.',
    'Great experience from start to finish. Professional, punctual, and the quality exceeded my expectations. Highly recommend.',
    "Good service overall. There was a small delay in communication but once things got moving, everything was handled well. I'd use them again.",
    'I have been a customer for over a year now and the consistency is what keeps me coming back. Every interaction is positive.',
    'The quality of work speaks for itself. I referred three friends and they all had the same great experience.',
  ],

  /** Realistic negative review texts */
  negativeReviews: [
    'Waited 45 minutes past my scheduled time. The service itself was fine but the wait was frustrating.',
    'Decent product but the customer support response time needs improvement. Took two days to get back to me.',
  ],

  /** Realistic keywords for SEO */
  keywords: [
    'best plumbing services lusaka', 'affordable web design zambia', 'restaurant marketing strategies',
    'local seo tips 2025', 'small business accounting software', 'fitness trainer near me',
    'wedding photography packages', 'auto repair shop reviews', 'real estate investment tips',
    'online shopping zambia delivery', 'dental clinic appointment', 'custom furniture makers',
  ],

  /** Realistic niches */
  niches: [
    'plumbing services', 'web design agency', 'restaurant', 'fitness studio',
    'photography studio', 'auto repair shop', 'real estate agency', 'e-commerce retail',
    'dental clinic', 'custom furniture', 'beauty salon', 'legal services',
  ],
} as const;
