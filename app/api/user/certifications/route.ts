import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const userId = req.cookies.get('skillpath_user_id')?.value || 'usr_aarav';
    const body = await req.json();
    const { title, issuer, date, url } = body;

    if (!title || !issuer) {
      return NextResponse.json({ error: 'Title and issuer are required' }, { status: 400 });
    }

    const cert = db.addCertification({
      userId,
      title,
      issuer,
      date: date || new Date().toISOString().split('T')[0],
      url,
    });

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        if (supabase) {
          await supabase.from('user_certifications').insert({
            user_id: userId,
            title,
            issuer,
            date: date || new Date().toISOString().split('T')[0],
            url: url || null,
          });
        }
      } catch (sbErr) {
        console.warn('Supabase cert sync notice:', sbErr);
      }
    }

    const orchestrator = new AgentOrchestrator(userId);
    orchestrator.runProfileAnalyzer();

    return NextResponse.json({ certification: cert, message: 'Certification added' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add certification' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const success = db.deleteCertification(id);
    return NextResponse.json({ success, message: 'Certification deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete' }, { status: 500 });
  }
}
