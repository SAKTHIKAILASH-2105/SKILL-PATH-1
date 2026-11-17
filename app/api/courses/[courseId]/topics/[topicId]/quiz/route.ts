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

    const body = await req.json().catch(() => ({}));
    const answers: Record<string, string> = body.answers || {};

    const questions = topic.quiz || [];
    let correctCount = 0;

    const questionResults = questions.map((q) => {
      const userAns = answers[q.id]?.trim().toLowerCase() || '';
      const correctAns = q.correctAnswer.trim().toLowerCase();
      const isCorrect = userAns === correctAns;
      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        userAnswer: answers[q.id] || '',
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const totalCount = questions.length;
    const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    // Passing criteria: >= 67% (e.g. 2 out of 3 questions)
    const passed = score >= 67;
    const topicStatus: 'skipped' | 'study' = passed ? 'skipped' : 'study';

    // Persist progress to DB
    db.updateTopicProgress(userId, topicId, topicStatus);

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        if (supabase) {
          await supabase.from('user_topic_progress').upsert({
            user_id: userId,
            course_id: courseId,
            topic_id: topicId,
            status: topicStatus,
          }, { onConflict: 'user_id,course_id,topic_id' });
        }
      } catch (sbErr) {
        console.warn('Supabase quiz sync notice:', sbErr);
      }
    }

    // Record agent log for diagnostics
    db.addAgentLog({
      userId,
      agentName: 'Diagnostic Assessment Agent',
      agentRole: 'Topic Proficiency Evaluator',
      status: 'completed',
      input: { courseId, topicId, topicTitle: topic.title, score, totalQuestions: totalCount },
      output: { passed, topicStatus, correctCount, totalCount },
      summary: passed
        ? `Passed diagnostic for "${topic.title}" with ${score}%. Topic marked as skipped.`
        : `Diagnostic failed for "${topic.title}" with ${score}%. Comprehensive study module recommended.`,
      decisionImpact: passed
        ? `Topic "${topic.title}" skipped from required study path.`
        : `Full course study material activated for topic "${topic.title}".`,
    });

    return NextResponse.json({
      passed,
      score,
      correctCount,
      totalCount,
      topicStatus,
      questionResults,
      feedback: passed
        ? 'Great job! You proved you understand the basics of this topic. It has been marked as skipped!'
        : 'You missed some core concepts. Please read and study the complete topic content below.',
    });
  } catch (err: any) {
    console.error('Topic quiz evaluation error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error evaluating topic quiz' },
      { status: 500 }
    );
  }
}
