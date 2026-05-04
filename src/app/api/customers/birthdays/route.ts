import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { BirthdayConfigDTO, BirthdayUpcomingDTO } from '@/lib/api/schema';

const DEFAULT_CONFIG: BirthdayConfigDTO = {
  autoSendEnabled: false,
  daysBefore: 7,
  offerTemplate: '',
};

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    // Query customers with birthday data
    const { data: customers, error: custError } = await supabase
      .from('customers')
      .select('id, first_name, birth_month, birth_day')
      .eq('tenant_id', tid)
      .not('birth_month', 'is', null)
      .not('birth_day', 'is', null);

    if (custError) {
      console.error('[Birthdays] Failed to fetch customers:', custError.message);
      return apiResponse({ config: DEFAULT_CONFIG, upcoming: { upcoming: [], count: 0 } });
    }

    // Compute days until birthday for each customer
    const now = new Date();
    const currentYear = now.getFullYear();
    const upcoming: BirthdayUpcomingDTO['upcoming'] = [];

    for (const row of customers ?? []) {
      const birthMonth = row.birth_month as number;
      const birthDay = row.birth_day as number;
      let nextBirthday = new Date(currentYear, birthMonth - 1, birthDay);
      if (nextBirthday < now) {
        nextBirthday = new Date(currentYear + 1, birthMonth - 1, birthDay);
      }
      const daysUntil = Math.ceil(
        (nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      upcoming.push({
        customerId: row.id,
        firstName: row.first_name,
        daysUntil,
      });
    }

    // Sort by daysUntil ascending
    upcoming.sort((a, b) => a.daysUntil - b.daysUntil);

    // Query business_profiles for birthday config (columns may not exist yet, use defaults)
    let config: BirthdayConfigDTO = DEFAULT_CONFIG;
    try {
      const { data: profile, error: profileError } = await supabase
        .from('business_profiles')
        .select('birthday_auto_send, birthday_days_before, birthday_offer_template')
        .eq('tenant_id', tid)
        .maybeSingle();

      if (!profileError && profile) {
        config = {
          autoSendEnabled: profile.birthday_auto_send ?? false,
          daysBefore: profile.birthday_days_before ?? 7,
          offerTemplate: profile.birthday_offer_template ?? '',
        };
      }
    } catch {
      // birthday columns may not exist yet — keep defaults
    }

    const result: BirthdayUpcomingDTO = { upcoming, count: upcoming.length };
    return apiResponse({ config, upcoming: result });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load birthday data');
  }
}
