import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { verifyOtp } from '@/lib/otp';
import { User } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      targetCareerId,
      accountType = 'student',
      adminPasscode,
      otpCode,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // 1. Strong Password Validation
    if (!password) {
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
    }
    const hasMinLen = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasMinLen || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return NextResponse.json(
        {
          error: 'WEAK_PASSWORD',
          message:
            'Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character.',
        },
        { status: 400 }
      );
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

    // 2. Check if user already exists in local DB
    const existingLocal = db.getUserByEmail(cleanEmail);
    if (existingLocal) {
      return NextResponse.json(
        {
          error: 'ACCOUNT_EXISTS',
          message: `An account with ${cleanEmail} already exists. Please sign in or use a different email address.`,
        },
        { status: 409 }
      );
    }

    // 3. Check if user already exists in Supabase Auth
    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      try {
        const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
        const existingSb = userList?.users.find((u) => u.email?.toLowerCase() === cleanEmail);
        if (existingSb) {
          return NextResponse.json(
            {
              error: 'ACCOUNT_EXISTS',
              message: `An account with ${cleanEmail} already exists. Please sign in or use a different email address.`,
            },
            { status: 409 }
          );
        }
      } catch (sbErr: any) {
        console.warn('Supabase duplicate check notice:', sbErr.message);
      }
    }

    // 4. Verify OTP if provided
    if (otpCode) {
      const otpCheck = verifyOtp(cleanEmail, otpCode);
      if (!otpCheck.valid) {
        return NextResponse.json(
          { error: otpCheck.reason || 'Invalid or expired verification code.' },
          { status: 400 }
        );
      }
    }

    let supabaseUserId: string | undefined;

    // 5. Create user in Supabase Auth with guaranteed email_confirm: true
    if (supabaseAdmin) {
      try {
        const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password: password,
          email_confirm: true,
          user_metadata: {
            name: cleanName,
            target_career_id: targetCareerId || 'car_fullstack',
            role: accountType === 'admin' ? 'admin' : 'learner',
          },
        });

        if (!createErr && created.user) {
          supabaseUserId = created.user.id;
        } else if (createErr) {
          console.warn('Supabase admin.createUser notice:', createErr.message);
        }
      } catch (adminErr: any) {
        console.warn('Supabase admin create error:', adminErr.message);
      }
    }

    // 6. Generate random avatar
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
      experience: accountType === 'admin' ? 'Platform Manager & Curriculum Director' : 'Building Skills & Portfolio',
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
      message: 'Account created and verified successfully! Welcome to SkillPath Academy.',
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
