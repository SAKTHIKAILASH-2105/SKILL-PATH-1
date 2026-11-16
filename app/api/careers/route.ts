import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('skillpath_user_id')?.value || 'usr_aarav';
  const user = db.getUser(userId) || db.getUser('usr_aarav');
  const careers = db.getCareers();
  const allSkills = db.getSkills();
  const skillMap = new Map(allSkills.map((s) => [s.id, s.name]));

  const userSkills = user ? db.getUserSkills(user.id) : [];
  const userSkillScoreMap = new Map(
    userSkills.map((us) => [
      us.skillId,
      us.verifiedScore !== undefined
        ? us.verifiedScore
        : us.proficiency === 'Advanced'
        ? 100
        : us.proficiency === 'Intermediate'
        ? 70
        : us.proficiency === 'Beginner'
        ? 35
        : 0,
    ])
  );

  const enrichedCareers = careers.map((c) => {
    let scoreSum = 0;
    let targetSum = 0;

    c.requiredSkillIds.forEach((req) => {
      const userScore = userSkillScoreMap.get(req.skillId) || 0;
      const targetScore = req.requiredLevel === 'Advanced' ? 100 : req.requiredLevel === 'Intermediate' ? 70 : 35;
      const weight = req.importance === 'Critical' ? 1.5 : 1.0;
      scoreSum += (userScore / 100) * weight * 100;
      targetSum += (targetScore / 100) * weight * 100;
    });

    const readinessPct = targetSum > 0 ? Math.round((scoreSum / targetSum) * 100) : 0;

    return {
      ...c,
      readinessPct,
      requiredSkillNames: c.requiredSkillIds.map((r) => skillMap.get(r.skillId) || r.skillId),
      isSelected: user?.targetCareerId === c.id,
    };
  });

  return NextResponse.json({
    careers: enrichedCareers,
    selectedCareerId: user?.targetCareerId,
  });
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.cookies.get('skillpath_user_id')?.value || 'usr_aarav';
    const body = await req.json();
    const { careerId } = body;

    if (!careerId) {
      return NextResponse.json({ error: 'careerId is required' }, { status: 400 });
    }

    const orchestrator = new AgentOrchestrator(userId);
    const result = orchestrator.handleCareerChange(careerId);

    const user = db.getUser(userId);
    const updatedRoadmap = db.getRoadmap(userId);

    return NextResponse.json({
      message: `Career updated to ${result.output.newCareer}`,
      careerId,
      user,
      roadmap: updatedRoadmap,
      agentResult: result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to select career' }, { status: 500 });
  }
}
