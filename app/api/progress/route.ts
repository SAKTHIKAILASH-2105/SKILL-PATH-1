import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('skillpath_user_id')?.value;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = db.getUser(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const progress = db.getUserProgress(userId);
  const submissions = db.getSubmissions(userId);
  const userSkills = db.getUserSkills(userId);
  const allSkills = db.getSkills();
  const skillMap = new Map(allSkills.map((s) => [s.id, s.name]));
  const assessments = db.getAssessments();
  const assessmentMap = new Map(assessments.map((a) => [a.id, a.title]));
  const roadmap = db.getRoadmap(userId);

  const enrichedSubmissions = submissions.map((sub) => ({
    ...sub,
    assessmentTitle: assessmentMap.get(sub.assessmentId) || sub.assessmentId,
  }));

  // Before and After skills
  const skillsComparison = userSkills.map((us) => {
    const name = skillMap.get(us.skillId) || us.skillId;
    const currentScore = us.verifiedScore !== undefined
      ? us.verifiedScore
      : us.proficiency === 'Advanced' ? 90 : us.proficiency === 'Intermediate' ? 65 : us.proficiency === 'Beginner' ? 30 : 10;
    const baselineScore = Math.max(0, currentScore - 25);
    return {
      skill: name,
      before: baselineScore,
      after: currentScore,
      proficiency: us.proficiency,
    };
  });

  const orchestrator = new AgentOrchestrator(userId);
  const gap = orchestrator.runSkillGap();

  const totalStages = roadmap.length;
  const completedStages = roadmap.filter((s) => s.status === 'Completed').length;
  const overallProgress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  return NextResponse.json({
    user,
    progress,
    overallProgress,
    careerReadiness: gap.output.careerReadinessPct,
    streakDays: user.streakDays,
    totalHoursSpent: progress.totalHoursSpent,
    activityHistory: progress.activityHistory,
    assessmentHistory: enrichedSubmissions,
    skillsComparison,
    completedStagesCount: completedStages,
    totalStagesCount: totalStages,
    completedResourcesCount: progress.completedResourceIds.length,
  });
}
