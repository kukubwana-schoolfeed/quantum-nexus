import { apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function GET() {
  try {
    const tiers = MOCK_DATA.tierSystem.getTiers();
    return apiResponse(tiers);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load tiers');
  }
}
