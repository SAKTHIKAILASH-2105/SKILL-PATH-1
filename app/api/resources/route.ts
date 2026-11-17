import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('skillpath_user_id')?.value;
  const { searchParams } = new URL(req.url);

  const type = searchParams.get('type');
  const difficulty = searchParams.get('difficulty');
  const isPremium = searchParams.get('isPremium');
  const skillId = searchParams.get('skillId');
  const search = searchParams.get('search');

  let resources = db.getResources();
  const allSkills = db.getSkills();
  const skillMap = new Map(allSkills.map((s) => [s.id, s.name]));
  const progress = userId ? db.getUserProgress(userId) : { completedResourceIds: [] as string[] };

  if (type && type !== 'all') {
    resources = resources.filter((r) => r.type.toLowerCase() === type.toLowerCase());
  }
  if (difficulty && difficulty !== 'all') {
    resources = resources.filter((r) => r.difficulty.toLowerCase() === difficulty.toLowerCase());
  }
  if (isPremium !== null && isPremium !== undefined && isPremium !== 'all') {
    const boolVal = isPremium === 'true';
    resources = resources.filter((r) => r.isPremium === boolVal);
  }
  if (skillId && skillId !== 'all') {
    resources = resources.filter((r) => r.skillId === skillId);
  }
  if (search) {
    const q = search.toLowerCase();
    resources = resources.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.provider.toLowerCase().includes(q)
    );
  }

  const user = userId ? db.getUser(userId) : null;

  const enriched = resources.map((r) => ({
    ...r,
    skillName: skillMap.get(r.skillId) || r.skillId,
    isCompleted: progress.completedResourceIds.includes(r.id),
    isAccessible: !r.isPremium || user?.subscriptionTier === 'pro' || user?.subscriptionTier === 'enterprise',
  }));

  return NextResponse.json({
    resources: enriched,
    userSubscription: user?.subscriptionTier || 'free',
  });
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.cookies.get('skillpath_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { resourceId } = body;

    if (!resourceId) {
      return NextResponse.json({ error: 'resourceId is required' }, { status: 400 });
    }

    const orchestrator = new AgentOrchestrator(userId);
    const agentResult = orchestrator.markResourceComplete(resourceId);

    return NextResponse.json({
      message: 'Resource completed successfully',
      agentResult,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to complete resource' }, { status: 500 });
  }
}
