import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await context.params;
  const userId = req.cookies.get('skillpath_user_id')?.value || 'usr_aarav';

  const course = db.getCourse(courseId);
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const allSkills = db.getSkills();
  const skillMap = new Map(allSkills.map((s) => [s.id, s.name]));
  const userSkills = db.getUserSkills(userId);
  const userSkillMap = new Map(userSkills.map((us) => [us.skillId, us]));

  const prerequisites = course.prerequisiteSkillIds.map((sid) => {
    const us = userSkillMap.get(sid);
    const score = us?.verifiedScore || (us?.proficiency === 'Intermediate' ? 70 : us?.proficiency === 'Beginner' ? 35 : 0);
    return {
      skillId: sid,
      skillName: skillMap.get(sid) || sid,
      proficiency: us?.proficiency || 'Not Started',
      score,
      isMet: score >= 60,
    };
  });

  const allResources = db.getResources();
  const courseResources = allResources.filter(
    (r) => r.courseId === course.id || course.skillsTaught.includes(r.skillId) || course.prerequisiteSkillIds.includes(r.skillId)
  );

  const assessment = course.prerequisiteAssessmentId
    ? db.getAssessment(course.prerequisiteAssessmentId)
    : undefined;

  const submissions = db.getSubmissions(userId);
  const latestSubmission = assessment
    ? submissions.find((s) => s.assessmentId === assessment.id)
    : undefined;

  const progress = db.getUserProgress(userId);
  const topicProgress = db.getTopicProgress(userId);
  const user = db.getUser(userId) || db.getUser('usr_aarav');

  return NextResponse.json({
    course: {
      ...course,
      topicProgress,
    },
    topicProgress,
    subscriptionTier: user?.subscriptionTier || 'free',
    prerequisites,
    resources: courseResources,
    assessment,
    latestSubmission,
    isCompleted: progress.completedCourseIds.includes(course.id),
    readinessStatus: latestSubmission
      ? latestSubmission.readinessStatus
      : course.prerequisiteSkillIds.length === 0
      ? 'Ready'
      : 'Diagnostic Required',
  });
}
