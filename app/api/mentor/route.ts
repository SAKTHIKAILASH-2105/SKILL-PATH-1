import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateMentorResponse, MentorContext } from '@/lib/llm/provider';

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('skillpath_user_id')?.value || 'usr_aarav';
  const messages = db.getMentorMessages(userId);

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.cookies.get('skillpath_user_id')?.value || 'usr_aarav';
    const user = db.getUser(userId) || db.getUser('usr_aarav');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    // Save user's question
    const userMsg = db.addMentorMessage({
      userId,
      sender: 'user',
      text: message.trim(),
    });

    // Assemble rich context
    const career = db.getCareer(user.targetCareerId);
    const userSkills = db.getUserSkills(userId);
    const allSkills = db.getSkills();
    const skillMap = new Map(allSkills.map((s) => [s.id, s.name]));
    const enrichedSkills = userSkills.map((us) => ({
      ...us,
      name: skillMap.get(us.skillId) || us.skillId,
    }));
    const roadmap = db.getRoadmap(userId);
    const submissions = db.getSubmissions(userId);
    const latestSubmission = submissions[0];
    const progress = db.getUserProgress(userId);

    const context: MentorContext = {
      user,
      career,
      skills: enrichedSkills,
      roadmap,
      latestSubmission,
      progress,
    };

    // Generate AI Mentor response
    const mentorResult = await generateMentorResponse(message, context);

    // Save mentor's response
    const mentorMsg = db.addMentorMessage({
      userId,
      sender: 'mentor',
      text: mentorResult.text,
      actionSuggestion: mentorResult.actionSuggestion,
    });

    // Log AI Mentor activity
    db.addAgentLog({
      userId,
      agentName: 'AI Mentor Agent',
      agentRole: 'Personalized Pedagogical Guidance',
      status: 'completed',
      input: { question: message, career: career?.title },
      output: { replyLength: mentorResult.text.length, action: mentorResult.actionSuggestion?.label },
      summary: `AI Mentor answered query: "${message.slice(0, 45)}...". Guided learner regarding current learning priorities.`,
      decisionImpact: mentorResult.actionSuggestion ? `Suggested actionable step: ${mentorResult.actionSuggestion.label}` : 'Provided conceptual explanation.',
    });

    return NextResponse.json({
      userMessage: userMsg,
      mentorMessage: mentorMsg,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Mentor error' }, { status: 500 });
  }
}
