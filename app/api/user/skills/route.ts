import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('skillpath_user_id')?.value;
  const userSkills = userId ? db.getUserSkills(userId) : [];
  const allSkills = db.getSkills();
  const skillMap = new Map(allSkills.map((s) => [s.id, s]));

  const enriched = userSkills.map((us) => ({
    ...us,
    name: skillMap.get(us.skillId)?.name || us.skillId,
    category: skillMap.get(us.skillId)?.category || 'General',
  }));

  return NextResponse.json({ skills: enriched, allAvailableSkills: allSkills });
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.cookies.get('skillpath_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { skillId, proficiency, verifiedScore } = body;

    if (!skillId || !proficiency) {
      return NextResponse.json({ error: 'skillId and proficiency are required' }, { status: 400 });
    }

    const updated = db.setUserSkill(userId, skillId, proficiency, verifiedScore);

    // Re-evaluate profile & skill gaps
    const orchestrator = new AgentOrchestrator(userId);
    orchestrator.runProfileAnalyzer();
    orchestrator.runSkillGap();

    return NextResponse.json({ skill: updated, message: 'Skill saved successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save skill' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.cookies.get('skillpath_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const skillId = searchParams.get('skillId');

    if (!skillId) {
      return NextResponse.json({ error: 'skillId is required' }, { status: 400 });
    }

    const removed = db.deleteUserSkill(userId, skillId);

    const orchestrator = new AgentOrchestrator(userId);
    orchestrator.runProfileAnalyzer();
    orchestrator.runSkillGap();

    return NextResponse.json({ success: removed, message: 'Skill removed' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete skill' }, { status: 500 });
  }
}
