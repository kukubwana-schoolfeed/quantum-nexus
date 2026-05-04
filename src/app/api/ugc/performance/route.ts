import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api/route-helper';

export async function GET(req: NextRequest) {
  // No performance table exists — return hardcoded defaults
  const performance = {
    views: 0,
    engagement: 0,
    saves: 0,
    shares: 0,
  };

  const suggestedRates = {
    minRate: 0,
    suggestedRate: 0,
    maxRate: 0,
  };

  return apiResponse({ performance, suggestedRates });
}
