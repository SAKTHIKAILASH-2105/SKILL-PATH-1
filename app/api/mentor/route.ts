import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateMentorResponse, MentorContext } from '@/lib/llm/provider';
import { AVAILABLE_MENTORS, getMentor } from '@/lib/mentors';

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('skillpath_user_id')?.value;
  const user = userId ? db.getUser(userId) : null;
  let messages = userId ? db.getMentorMessages(userId) : [];

  const activeMentor = getMentor(user?.preferredMentorId);

  // If no mentor messages yet, initialize greeting from active mentor
  if (userId && messages.length === 0) {
    const greeting = db.addMentorMessage({
      userId,
      sender: 'mentor',
      mentorId: activeMentor.id,
      mentorName: activeMentor.name,
      mentorAvatar: activeMentor.avatar,
      text: activeMentor.greeting,
      actionSuggestion: {
        label: 'Explore Active Roadmap',
        actionType: 'navigate',
        payload: '/roadmap',
      },
    });
    messages = [greeting];
  }

  return NextResponse.json({
    messages,
    activeMentor,
    availableMentors: AVAILABLE_MENTORS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.cookies.get('skillpath_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = db.getUser(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { message, action, mentorId } = body;

    // Handle Mentor Selection / Switching
    if (action === 'select_mentor') {
      const selectedMentor = getMentor(mentorId);
      db.updateUser(userId, { preferredMentorId: selectedMentor.id });

      const mentorGreetingMsg = db.addMentorMessage({
        userId,
        sender: 'mentor',
        mentorId: selectedMentor.id,
        mentorName: selectedMentor.name,
        mentorAvatar: selectedMentor.avatar,
        text: selectedMentor.greeting,
        actionSuggestion: {
          label: 'Explore Active Roadmap',
          actionType: 'navigate',
          payload: '/roadmap',
        },
      });

      return NextResponse.json({
        activeMentor: selectedMentor,
        mentorMessage: mentorGreetingMsg,
        message: `Successfully switched active mentor to ${selectedMentor.name}`,
      });
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    const activeMentor = getMentor(mentorId || user.preferredMentorId);

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
      mentorProfile: activeMentor,
    };

    // Generate AI Mentor response
    const mentorResult = await generateMentorResponse(message, context);

    // Save mentor's response
    const mentorMsg = db.addMentorMessage({
      userId,
      sender: 'mentor',
      mentorId: activeMentor.id,
      mentorName: activeMentor.name,
      mentorAvatar: activeMentor.avatar,
      text: mentorResult.text,
      actionSuggestion: mentorResult.actionSuggestion,
    });

    // Log AI Mentor activity
    db.addAgentLog({
      userId,
      agentName: 'AI Mentor Agent',
      agentRole: `${activeMentor.name} (${activeMentor.role})`,
      status: 'completed',
      input: { question: message, career: career?.title, mentor: activeMentor.name },
      output: { replyLength: mentorResult.text.length, action: mentorResult.actionSuggestion?.label },
      summary: `${activeMentor.name} answered query: "${message.slice(0, 45)}...". Guided learner regarding current learning priorities.`,
      decisionImpact: mentorResult.actionSuggestion ? `Suggested actionable step: ${mentorResult.actionSuggestion.label}` : 'Provided conceptual explanation.',
    });

    return NextResponse.json({
      userMessage: userMsg,
      mentorMessage: mentorMsg,
      activeMentor,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Mentor error' }, { status: 500 });
  }
}
