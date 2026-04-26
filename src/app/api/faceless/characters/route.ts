import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getCharacters } from '@/server/routes/faceless/faceless-character-studio';

export async function GET(req: NextRequest) {
  try {
    const result = await getCharacters(getTenantId(req));
    return apiResponse(result.data);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load characters');
  }
}
