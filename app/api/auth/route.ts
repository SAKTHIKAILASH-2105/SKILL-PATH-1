import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

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

    // Special quick check for primary administrator account
    if (cleanEmail === 'admin@skillpath.ai' && (portalType === 'admin' || !portalType)) {
      if (password !== 'admin123') {
        return NextResponse.json({ error: 'Incorrect administrator password. Please try again.' }, { status: 401 });
      }
      let adminUser = db.getUser('usr_admin');
      if (!adminUser) {
        adminUser = {
          id: 'usr_admin',
          name: 'Platform Administrator',
          email: 'admin@skillpath.ai',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
          education: 'M.S. in Computer Science',
          experience: 'Curriculum Director & Platform Admin',
          targetCareerId: 'car_fullstack',
          weeklyHours: 40,
          preferredStyle: 'Curriculum & Analytics Management',
          streakDays: 45,
          subscriptionTier: 'enterprise',
          subscriptionExpiresAt: null,
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

    // Try Supabase Auth sign-in if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          if (!error && data.user) {
            // If user exists in Supabase but not yet in local DB, create them
            if (!user) {
              user = {
                id: data.user.id,
                name: data.user.user_metadata?.name || split_name(cleanEmail),
                email: cleanEmail,
                role: 'learner',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
                education: 'Professional Development',
                experience: 'Learner',
                targetCareerId: data.user.user_metadata?.target_career_id || 'car_fullstack',
                weeklyHours: 15,
                preferredStyle: 'Hands-on projects',
                streakDays: 1,
                subscriptionTier: 'free',
                subscriptionExpiresAt: null,
                supabaseId: data.user.id,
                createdAt: new Date().toISOString(),
              };
              db.createUser(user);
            }
          }
        }
      } catch (sbErr) {
        console.warn('Supabase sign-in fallback:', sbErr);
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email. Please check your spelling or sign up.' },
        { status: 401 }
      );
    }

    // Verify password if user set one
    if (user.password && user.password !== password) {
      return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
    }

    // Role portal check
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
