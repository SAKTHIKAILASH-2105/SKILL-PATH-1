import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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
      // Sync or create session cookie in local system as well
      const response = NextResponse.redirect(`${origin}${next}`);
      const user = data.session.user;
      const sessionData = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Learner',
        role: 'user',
        avatar: user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        careerTrack: 'car_fullstack',
      };
      
      response.cookies.set('promptwars_session', JSON.stringify(sessionData), {
        path: '/',
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }
  }

  // Return the user to an error page or back to login
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate with Google`);
}
