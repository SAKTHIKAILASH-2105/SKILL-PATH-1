import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('skillpath_user_id')?.value;
  const logs = userId ? db.getAgentLogs(userId) : [];

  // Agent descriptions metadata
  const agentsCatalog = [
    {
      id: 'profile-analyzer',
      name: 'Profile Analyzer Agent',
      role: 'Learner Skill Normalization',
      purpose: 'Extract and normalize learner skills, analyze certifications and projects, estimate baseline proficiency.',
    },
    {
      id: 'career-analysis',
      name: 'Career Analysis Agent',
      role: 'Target Career Skill Breakdown',
      purpose: 'Analyze target career demands, decompose required skill graphs, assign prerequisite hierarchy.',
    },
    {
      id: 'skill-gap',
      name: 'Skill Gap Agent',
      role: 'Deficiency & Readiness Scoring',
      purpose: 'Compare declared and verified skills against target standards, prioritize deficiencies, calculate readiness %.',
    },
    {
      id: 'assessment',
      name: 'Assessment Agent',
      role: 'Diagnostic Evaluation & Topic Breakdown',
      purpose: 'Generate diagnostic questions, score answers, analyze topic-level mastery, determine readiness status.',
    },
    {
      id: 'learning-path',
      name: 'Learning Path Agent',
      role: 'Personalized Roadmap Sequencing',
      purpose: 'Synthesize optimal learning stages, sequence prerequisites, enforce "Learn only what you need before what you want".',
    },
    {
      id: 'resource-recommendation',
      name: 'Resource Recommendation Agent',
      role: 'Resource Curation & Tiering',
      purpose: 'Recommend free high-yield tutorials first, tier premium masterclasses, avoid completed materials.',
    },
    {
      id: 'progress-tracking',
      name: 'Progress Tracking Agent',
      role: 'Milestone & Activity Logging',
      purpose: 'Track study velocity, detect improvement patterns, adjust skill proficiencies, sustain learning streaks.',
    },
    {
      id: 'adaptive-recommendation',
      name: 'Adaptive Recommendation Agent',
      role: 'Dynamic Curriculum Adaptation',
      purpose: 'Modify roadmaps dynamically: inject foundation remediation on low scores, unlock stages on high scores, pivot on career change.',
    },
    {
      id: 'ai-mentor',
      name: 'AI Mentor Agent',
      role: 'Personalized Pedagogical Guidance',
      purpose: 'Answer student questions, clarify complex concepts, provide encouragement, propose direct roadmap actions.',
    },
  ];

  return NextResponse.json({
    logs,
    agents: agentsCatalog,
  });
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.cookies.get('skillpath_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { action } = body; // 'full_pipeline' | 'refresh_gap'

    const orchestrator = new AgentOrchestrator(userId);

    if (action === 'full_pipeline') {
      orchestrator.runProfileAnalyzer();
      orchestrator.runCareerAnalysis();
      orchestrator.runSkillGap();
      orchestrator.runLearningPath();
      orchestrator.runResourceRecommendation();
      orchestrator.runAdaptiveRecommendation();
    } else {
      orchestrator.runProfileAnalyzer();
      orchestrator.runSkillGap();
    }

    const updatedLogs = db.getAgentLogs(userId);

    return NextResponse.json({
      message: 'Agent pipeline executed successfully',
      logs: updatedLogs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Pipeline execution failed' }, { status: 500 });
  }
}
