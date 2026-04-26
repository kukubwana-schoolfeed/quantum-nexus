import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const query = req.nextUrl.searchParams.get('q');
    const niches = query
      ? MOCK_DATA.nicheIntelligence.getSuggestions(tid, query)
      : MOCK_DATA.nicheIntelligence.getNiches(tid);
    return apiResponse(niches);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load niches');
  }
}
