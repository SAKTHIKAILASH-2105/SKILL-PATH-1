import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ courseId: string; topicId: string }> }
) {
  try {
    const { courseId, topicId } = await context.params;
    const userId = req.cookies.get('skillpath_user_id')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const course = db.getCourse(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const topic = course.topics?.find((t) => t.id === topicId);
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Mark topic as completed
    db.updateTopicProgress(userId, topicId, 'completed');

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        if (supabase) {
          await supabase.from('user_topic_progress').upsert({
            user_id: userId,
            course_id: courseId,
            topic_id: topicId,
            status: 'completed',
          }, { onConflict: 'user_id,course_id,topic_id' });
        }
      } catch (sbErr) {
        console.warn('Supabase topic complete sync notice:', sbErr);
      }
    }

    // Also update total study hours logged in progress
    const progress = db.getUserProgress(userId);
    const updatedHistory = [
      ...progress.activityHistory,
      {
        date: new Date().toISOString().split('T')[0],
        hours: 0.5,
        activity: `Completed study module for "${topic.title}" in ${course.title}`,
      },
    ];

    db.updateUserProgress(userId, {
      totalHoursSpent: Math.round((progress.totalHoursSpent + 0.5) * 10) / 10,
      activityHistory: updatedHistory,
      lastActiveDate: new Date().toISOString(),
    });

    db.addAgentLog({
      userId,
      agentName: 'Curriculum Agent',
      agentRole: 'Study Completion Tracker',
      status: 'completed',
      input: { courseId, topicId, topicTitle: topic.title },
      output: { topicStatus: 'completed' },
      summary: `Learner reviewed and completed all study material for "${topic.title}".`,
      decisionImpact: `Topic marked completed. Course completion metric updated.`,
    });

    return NextResponse.json({
      success: true,
      topicStatus: 'completed',
      message: `Topic "${topic.title}" marked as completed!`,
    });
  } catch (err: any) {
    console.error('Topic complete error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error completing topic' },
      { status: 500 }
    );
  }
}
