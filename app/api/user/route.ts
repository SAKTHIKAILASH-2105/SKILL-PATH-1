import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('skillpath_user_id')?.value || 'usr_aarav';
  const user = db.getUser(userId) || db.getUser('usr_aarav');
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const skills = db.getUserSkills(user.id);
  const allSkills = db.getSkills();
  const skillMap = new Map(allSkills.map((s) => [s.id, s]));

  const enrichedSkills = skills.map((us) => ({
    ...us,
    name: skillMap.get(us.skillId)?.name || us.skillId,
    category: skillMap.get(us.skillId)?.category || 'General',
  }));

  const certs = db.getUserCertifications(user.id);
  const projects = db.getUserProjects(user.id);
  const career = db.getCareer(user.targetCareerId);
  const progress = db.getUserProgress(user.id);

  // Run skill gap calculation for current readiness
  const orchestrator = new AgentOrchestrator(user.id);
  const gapResult = orchestrator.runSkillGap();

  return NextResponse.json({
    user,
    career,
    skills: enrichedSkills,
    certifications: certs,
    projects,
    progress,
    readiness: gapResult.output.careerReadinessPct,
    strengths: gapResult.output.strengths,
    weaknesses: gapResult.output.weaknesses,
    missing: gapResult.output.missing,
  });
}

export async function PUT(req: NextRequest) {
  try {
    const userId = req.cookies.get('skillpath_user_id')?.value || 'usr_aarav';
    const body = await req.json();

    const allowedUpdates = [
      'name',
      'email',
      'education',
      'experience',
      'weeklyHours',
      'preferredStyle',
    ];

    const updates: Record<string, any> = {};
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    const updatedUser = db.updateUser(userId, updates);

    // Profile Analyzer Agent update
    const orchestrator = new AgentOrchestrator(userId);
    orchestrator.runProfileAnalyzer();

    return NextResponse.json({ user: updatedUser, message: 'Profile updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 });
  }
}
