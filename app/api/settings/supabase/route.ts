import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isSupabaseConfigured, testSupabaseConnection } from '@/lib/supabase';

export async function GET() {
  const isConfigured = isSupabaseConfigured();
  const testResult = await testSupabaseConnection();

  return NextResponse.json({
    configured: isConfigured,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKeyConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your-anon-key')),
    test: testResult,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { url, anonKey, serviceRoleKey } = await req.json();

    if (!url || !anonKey) {
      return NextResponse.json({ error: 'Supabase URL and Anon Key are required.' }, { status: 400 });
    }

    if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
      return NextResponse.json({ error: 'Invalid Supabase Project URL. Expected format: https://[project-id].supabase.co' }, { status: 400 });
    }

    // Write to .env.local file
    const envPath = path.join(process.cwd(), '.env.local');
    const content = `# Updated via PromptWars Settings
NEXT_PUBLIC_SUPABASE_URL=${url.trim()}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey.trim()}
SUPABASE_SERVICE_ROLE_KEY=${(serviceRoleKey || '').trim()}
`;

    fs.writeFileSync(envPath, content, 'utf-8');

    // Update in runtime process.env
    process.env.NEXT_PUBLIC_SUPABASE_URL = url.trim();
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = anonKey.trim();
    if (serviceRoleKey) {
      process.env.SUPABASE_SERVICE_ROLE_KEY = serviceRoleKey.trim();
    }

    const test = await testSupabaseConnection();

    return NextResponse.json({
      success: true,
      message: 'Supabase credentials saved to .env.local!',
      test,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save Supabase settings' }, { status: 500 });
  }
}
