import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { User } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.session?.user) {
      const sbUser = data.session.user;
      const cleanEmail = (sbUser.email || '').toLowerCase().trim();
      const cleanName =
        sbUser.user_metadata?.full_name ||
        sbUser.user_metadata?.name ||
        cleanEmail.split('@')[0] ||
        'Learner';
      const avatar =
        sbUser.user_metadata?.avatar_url ||
        sbUser.user_metadata?.picture ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';

      let localUser = db.getUser(sbUser.id) || db.getUserByEmail(cleanEmail);
      if (!localUser) {
        localUser = {
          id: sbUser.id,
          name: cleanName,
          email: cleanEmail,
          role: 'learner',
          avatar,
          education: 'Self-Directed / Professional Development',
          experience: 'Building skills & portfolio',
          targetCareerId: sbUser.user_metadata?.target_career_id || 'car_fullstack',
          weeklyHours: 15,
          preferredStyle: 'Hands-on projects & video lessons',
          streakDays: 1,
          subscriptionTier: 'free',
          subscriptionExpiresAt: null,
          supabaseId: sbUser.id,
          createdAt: sbUser.created_at || new Date().toISOString(),
        };
        db.createUser(localUser);

        const defaultCourses = ['crs_fullstack', 'crs_html_css', 'crs_sql_db'];
        defaultCourses.forEach((cid) => db.enrollInCourse(localUser!.id, cid));
      } else {
        // Update avatar if newer from Google
        if (avatar && !localUser.avatar?.includes('googleusercontent')) {
          db.updateUser(localUser.id, { avatar, supabaseId: sbUser.id });
        }
      }

      const response = NextResponse.redirect(`${origin}${next}`);
      response.cookies.set('skillpath_user_id', localUser.id, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return response;
    }
  }

  // Return user back to login with error
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate with Google`);
}
