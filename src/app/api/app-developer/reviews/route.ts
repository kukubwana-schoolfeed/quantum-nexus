import { NextRequest } from 'next/server';
import { getTenantId, apiResponse } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { AppReviewDTO, AppReviewStatsDTO } from '@/lib/api/schema';

const zeroedStats: AppReviewStatsDTO = {
  averageRating: 0,
  totalReviews: 0,
  responseRate: 0,
};

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('app_reviews')
      .select('id, author, rating, text, replied_at, reply_text, platform, created_at')
      .eq('tenant_id', tid);

    if (error) throw error;

    const reviews: AppReviewDTO[] = (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      author: r.author as string,
      rating: r.rating as number,
      text: r.text as string,
      repliedAt: (r.replied_at as string) ?? null,
      replyText: (r.reply_text as string) ?? null,
      platform: r.platform as string,
      createdAt: r.created_at as string,
    }));

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews
      : 0;
    const repliedCount = reviews.filter(r => r.repliedAt !== null).length;
    const responseRate = totalReviews > 0 ? repliedCount / totalReviews : 0;

    const stats: AppReviewStatsDTO = {
      averageRating,
      totalReviews,
      responseRate,
    };

    return apiResponse({ reviews, stats });
  } catch {
    return apiResponse({ reviews: [] as AppReviewDTO[], stats: zeroedStats });
  }
}
