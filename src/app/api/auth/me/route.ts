import { NextRequest } from 'next/server';
import { apiResponse, apiError } from '@/lib/api/route-helper';

export async function GET(req: NextRequest) {
  const claimsHeader = req.headers.get('x-session-claims');
  if (!claimsHeader) {
    return apiError('Unauthorized', 401);
  }

  try {
    const claims = JSON.parse(claimsHeader);
    return apiResponse({
      sub: claims.sub ?? null,
      tenant_id: claims.tenant_id ?? null,
      role: claims.role ?? null,
      tier: claims.tier ?? null,
    });
  } catch {
    return apiError('Unauthorized', 401);
  }
}
