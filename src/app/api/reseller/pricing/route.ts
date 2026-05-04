import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getPricing } from '@/server/routes/admin/reseller-dashboard';

const RESELLER_TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 599,
    features: [
      '1 client account',
      'Basic branding',
      'Standard support',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 1199,
    features: [
      '5 client accounts',
      'Custom branding',
      'Priority support',
      'Client analytics dashboard',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 2499,
    features: [
      '25 client accounts',
      'Full white-label',
      'Dedicated support',
      'Advanced client analytics',
      'Custom onboarding flows',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 4999,
    features: [
      'Unlimited client accounts',
      'Full white-label + custom domain',
      'Dedicated success team',
      'Custom pricing per client',
      'API access',
      'SLA guarantee',
    ],
  },
];

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const pricing = await getPricing(tid);
    return apiResponse({ tiers: RESELLER_TIERS, pricing: pricing.data });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load pricing');
  }
}
