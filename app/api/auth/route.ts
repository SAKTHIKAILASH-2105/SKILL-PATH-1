import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabase, getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('skillpath_user_id')?.value;
  if (!userId) {
    return NextResponse.json({ user: null });
  }

  const user = db.getUser(userId);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, portalType } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Special quick check for primary administrator account
    if (cleanEmail === 'admin@skillpath.ai' && (portalType === 'admin' || !portalType)) {
      if (password !== 'admin123') {
        return NextResponse.json({ error: 'Incorrect administrator password. Please try again.' }, { status: 401 });
      }
      let adminUser = db.getUser('usr_admin');
      if (!adminUser) {
        adminUser = {
          id: 'usr_admin',
          name: 'Administrator',
          email: 'admin@skillpath.ai',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
          education: 'Institutional Administration',
          experience: 'Platform Manager & Curriculum Director',
          targetCareerId: 'car_fullstack',
          weeklyHours: 40,
          preferredStyle: 'Analytics & Management',
          streakDays: 1,
          subscriptionTier: 'enterprise',
          subscriptionExpiresAt: null,
          password: 'admin123',
          createdAt: new Date().toISOString(),
        };
        db.createUser(adminUser);
      }
      const resp = NextResponse.json({
        user: adminUser,
        message: 'Administrator logged in successfully!',
      });
      resp.cookies.set('skillpath_user_id', adminUser.id, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });
      return resp;
    }

    let user = db.getUserByEmail(cleanEmail);
    let supabaseAuthenticated = false;

    // 2. Try Supabase Auth sign-in if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        if (supabase) {
          let { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          // If email is not confirmed in Supabase, auto-confirm it using admin API and retry!
          if (error && error.message.toLowerCase().includes('email not confirmed')) {
            const admin = getSupabaseAdmin();
            if (admin) {
              const { data: userList } = await admin.auth.admin.listUsers();
              const sbUserMatch = userList?.users.find((u) => u.email?.toLowerCase() === cleanEmail);
              if (sbUserMatch) {
                await admin.auth.admin.updateUserById(sbUserMatch.id, { email_confirm: true });
                const retry = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
                data = retry.data;
                error = retry.error;
              }
            }
          }

          if (!error && data?.user) {
            supabaseAuthenticated = true;
            // Sync user into local database if missing or update details
            if (!user) {
              user = {
                id: data.user.id,
                name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || split_name(cleanEmail),
                email: cleanEmail,
                role: data.user.user_metadata?.role || (cleanEmail.includes('admin') ? 'admin' : 'learner'),
                avatar: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
                education: 'Professional Development',
                experience: 'Building skills & portfolio',
                targetCareerId: data.user.user_metadata?.target_career_id || 'car_fullstack',
                weeklyHours: 15,
                preferredStyle: 'Hands-on projects & video lessons',
                streakDays: 1,
                subscriptionTier: 'free',
                subscriptionExpiresAt: null,
                password: password,
                supabaseId: data.user.id,
                createdAt: data.user.created_at || new Date().toISOString(),
              };
              db.createUser(user);

              // Enroll in default courses
              const defaultCourses = ['crs_fullstack', 'crs_html_css', 'crs_sql_db'];
              defaultCourses.forEach((cid) => db.enrollInCourse(user!.id, cid));
            } else {
              // Update password and supabaseId locally
              db.updateUser(user.id, { password, supabaseId: data.user.id });
            }
          }
        }
      } catch (sbErr) {
        console.warn('Supabase sign-in notice (falling back to database):', sbErr);
      }
    }

    // 3. Fallback to local DB authentication if not already authenticated via Supabase
    if (!supabaseAuthenticated) {
      if (!user) {
        // Try looking up via Supabase admin if user exists in Supabase
        const admin = getSupabaseAdmin();
        if (admin) {
          try {
            const { data: userList } = await admin.auth.admin.listUsers();
            const sbUserMatch = userList?.users.find((u) => u.email?.toLowerCase() === cleanEmail);
            if (sbUserMatch) {
              // User exists in Supabase Auth! Verify credentials via signInWithPassword
              const supabase = getSupabase();
              if (supabase) {
                const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
                  email: cleanEmail,
                  password,
                });
                if (!signInErr && signInData?.user) {
                  user = {
                    id: sbUserMatch.id,
                    name: sbUserMatch.user_metadata?.name || sbUserMatch.user_metadata?.full_name || split_name(cleanEmail),
                    email: cleanEmail,
                    role: sbUserMatch.user_metadata?.role || (cleanEmail.includes('admin') ? 'admin' : 'learner'),
                    avatar: sbUserMatch.user_metadata?.avatar_url || sbUserMatch.user_metadata?.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
                    education: 'Professional Development',
                    experience: 'Building skills & portfolio',
                    targetCareerId: sbUserMatch.user_metadata?.target_career_id || 'car_fullstack',
                    weeklyHours: 15,
                    preferredStyle: 'Hands-on projects & video lessons',
                    streakDays: 1,
                    subscriptionTier: 'free',
                    subscriptionExpiresAt: null,
                    password: password,
                    supabaseId: sbUserMatch.id,
                    createdAt: sbUserMatch.created_at || new Date().toISOString(),
                  };
                  db.createUser(user);
                  supabaseAuthenticated = true;
                }
              }
            }
          } catch (e) {
            console.warn('Admin user lookup fallback notice:', e);
          }
        }
      }

    }

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email. Please check your spelling or sign up.' },
        { status: 401 }
      );
    }

    // Check local password if not authenticated through Supabase Auth
    if (!supabaseAuthenticated) {
      if (user.password && user.password !== password) {
        return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
      }
    }

    // 4. Role portal check
    if (portalType === 'admin' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'This account does not have administrator privileges. Please switch to the Student Portal tab.' },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      user,
      message: 'Signed in successfully!',
    });

    response.cookies.set('skillpath_user_id', user.id, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error during sign in' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.auth.signOut().catch(() => {});
      }
    }

    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.set('skillpath_user_id', '', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 0,
    });
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to logout' }, { status: 500 });
  }
}

function split_name(email: string): string {
  const namePart = email.split('@')[0];
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
}
