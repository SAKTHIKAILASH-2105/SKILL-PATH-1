import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';

export async function POST(req: NextRequest) {
  try {
    const userId = req.cookies.get('skillpath_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { title, description, techStack, githubUrl, liveUrl } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const project = db.addProject({
      userId,
      title,
      description,
      techStack: Array.isArray(techStack) ? techStack : (techStack || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      githubUrl,
      liveUrl,
    });

    const orchestrator = new AgentOrchestrator(userId);
    orchestrator.runProfileAnalyzer();

    return NextResponse.json({ project, message: 'Project added' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add project' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const success = db.deleteProject(id);
    return NextResponse.json({ success, message: 'Project deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete' }, { status: 500 });
  }
}
