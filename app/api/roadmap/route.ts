import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('skillpath_user_id')?.value;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = db.getUser(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  let stages = db.getRoadmap(userId);
  if (stages.length === 0) {
    const orchestrator = new AgentOrchestrator(userId);
    orchestrator.runLearningPath();
    stages = db.getRoadmap(userId);
  }

  const allSkills = db.getSkills();
  const skillMap = new Map(allSkills.map((s) => [s.id, s.name]));
  const allResources = db.getResources();
  const resourceMap = new Map(allResources.map((r) => [r.id, r]));

  const enrichedStages = stages.map((stg) => ({
    ...stg,
    skillName: skillMap.get(stg.skillId) || stg.skillId,
    resources: stg.resourceIds.map((rid) => resourceMap.get(rid)).filter(Boolean),
  }));

  const career = db.getCareer(user.targetCareerId);

  return NextResponse.json({
    stages: enrichedStages,
    career,
    totalStages: stages.length,
    completedStages: stages.filter((s) => s.status === 'Completed').length,
    activeStage: stages.find((s) => s.status === 'In Progress') || stages.find((s) => s.status === 'Available'),
  });
}

export async function PUT(req: NextRequest) {
  try {
    const userId = req.cookies.get('skillpath_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { stageId, status } = body;

    if (!stageId || !status) {
      return NextResponse.json({ error: 'stageId and status required' }, { status: 400 });
    }

    const updated = db.updateRoadmapStage(stageId, { status });

    // If marked completed, run progress tracking & adaptive check
    if (status === 'Completed') {
      const orchestrator = new AgentOrchestrator(userId);
      orchestrator.runAdaptiveRecommendation();
    }

    return NextResponse.json({ stage: updated, message: 'Stage updated' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 });
  }
}
