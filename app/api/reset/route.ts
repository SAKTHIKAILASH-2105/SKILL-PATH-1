import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const data = db.reset();
    return NextResponse.json({
      message: 'Demo state reset successfully to baseline seed data.',
      usersCount: data.users.length,
      roadmapCount: data.roadmap.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Reset failed' }, { status: 500 });
  }
}
