import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api/route-helper';
import type { PlatformHealthDTO } from '@/lib/api/schema';

export async function GET(_req: NextRequest) {
  const result: PlatformHealthDTO = {
    workers: {
      content: 'green',
      publishing: 'green',
      aiScene: 'green',
      analytics: 'green',
    },
    redis: 'green',
    supabase: 'green',
    uptime: 99.9,
  };

  return apiResponse(result);
}
