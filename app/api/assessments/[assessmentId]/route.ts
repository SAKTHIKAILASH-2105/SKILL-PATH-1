import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ assessmentId: string }> }
) {
  const { assessmentId } = await context.params;
  const userId = req.cookies.get('skillpath_user_id')?.value || 'usr_aarav';

  const assessment = db.getAssessment(assessmentId);
  if (!assessment) {
    return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
  }

  const submissions = db.getSubmissions(userId);
  const userSubmissions = submissions.filter((s) => s.assessmentId === assessmentId);

  return NextResponse.json({
    assessment,
    previousSubmissions: userSubmissions,
  });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const { assessmentId } = await context.params;
    const userId = req.cookies.get('skillpath_user_id')?.value || 'usr_aarav';
    const body = await req.json();
    const { answers } = body;

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'answers payload is required' }, { status: 400 });
    }

    const orchestrator = new AgentOrchestrator(userId);
    const { submission, result: assessmentResult } = orchestrator.evaluateAssessmentSubmission(assessmentId, answers);

    // Run Adaptive Recommendation Agent
    const adaptiveResult = orchestrator.runAdaptiveRecommendation(submission);

    // Refresh updated roadmap
    const updatedRoadmap = db.getRoadmap(userId);

    return NextResponse.json({
      submission,
      assessmentResult,
      adaptiveResult,
      roadmap: updatedRoadmap,
      message: 'Assessment submitted and evaluated successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Submission failed' }, { status: 500 });
  }
}
