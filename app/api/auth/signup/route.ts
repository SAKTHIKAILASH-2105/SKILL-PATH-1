import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { User } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, targetCareerId, accountType = 'student', adminPasscode } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    if (accountType === 'admin') {
      const validCodes = ['ADMIN2026', 'SKILLPATH_ADMIN', 'ADMIN'];
      if (!adminPasscode || !validCodes.includes(adminPasscode.trim().toUpperCase())) {
        return NextResponse.json(
          { error: 'Invalid Administrator Passcode. Enter ADMIN2026 to register as an Administrator.' },
          { status: 403 }
        );
      }
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check if user exists in local database
    const existing = db.getUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 409 });
    }

    let supabaseUserId: string | undefined;

    // If Supabase is configured, create the user in Supabase Auth!
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        if (supabase) {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                name: cleanName,
                target_career_id: targetCareerId || 'car_fullstack',
              },
            },
          });
          if (error) {
            console.warn('Supabase Auth signup notice:', error.message);
          } else if (data.user) {
            supabaseUserId = data.user.id;
          }
        }
      } catch (sbErr: any) {
        console.warn('Supabase Auth error (proceeding with local account):', sbErr.message);
      }
    }

    // Generate random avatar gradient or Unsplash photo
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    ];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const newUser: User = {
      id: supabaseUserId || `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: cleanName,
      email: cleanEmail,
      role: accountType === 'admin' ? 'admin' : 'learner',
      avatar: randomAvatar,
      education: accountType === 'admin' ? 'Platform Administration' : 'Self-Directed / Professional Development',
      experience: accountType === 'admin' ? 'Platform Manager & Curriculum Director' : '0-2 years (Building Portfolio)',
      targetCareerId: targetCareerId || 'car_fullstack',
      weeklyHours: accountType === 'admin' ? 35 : 15,
      preferredStyle: accountType === 'admin' ? 'Curriculum Analytics' : 'Hands-on projects & video lessons',
      streakDays: 1,
      subscriptionTier: accountType === 'admin' ? 'enterprise' : 'free',
      subscriptionExpiresAt: null,
      password,
      supabaseId: supabaseUserId,
      createdAt: new Date().toISOString(),
    };

    db.createUser(newUser);

    // If student, enroll in default courses
    if (newUser.role === 'learner') {
      const defaultCourses = ['crs_fullstack', 'crs_html_css', 'crs_sql_db'];
      defaultCourses.forEach((cid) => db.enrollInCourse(newUser.id, cid));
    }

    const response = NextResponse.json({
      user: newUser,
      message: 'Account created successfully! Welcome to PromptWars.',
      supabaseConnected: Boolean(supabaseUserId),
    });

    response.cookies.set('skillpath_user_id', newUser.id, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create account' }, { status: 500 });
  }
}
