import { apiResponse, apiError } from '@/lib/api/route-helper';

const TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 599,
    features: [
      '1 business profile',
      '5 content posts per month',
      'Basic SEO audit',
      'WhatsApp integration',
      'Email support',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 1199,
    features: [
      '3 business profiles',
      '25 content posts per month',
      'Advanced SEO audit & tracking',
      'WhatsApp + Email integration',
      'Knowledge base (50 entries)',
      'Priority email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 2499,
    features: [
      '10 business profiles',
      'Unlimited content posts',
      'Full SEO suite with competitor tracking',
      'All integrations included',
      'Knowledge base (500 entries)',
      'AI content generation',
      'Dedicated account manager',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 4999,
    features: [
      'Unlimited business profiles',
      'Unlimited everything',
      'White-label platform access',
      'Custom integrations & API',
      'Unlimited knowledge base',
      'AI content generation + approval queue',
      'Dedicated success team',
      'SLA guarantee',
    ],
  },
];

export async function GET() {
  try {
    return apiResponse(TIERS);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load tiers');
  }
}
