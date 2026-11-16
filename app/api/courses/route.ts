import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('skillpath_user_id')?.value || 'usr_aarav';
  const courses = db.getCourses();
  const allSkills = db.getSkills();
  const skillMap = new Map(allSkills.map((s) => [s.id, s.name]));
  const userSkills = db.getUserSkills(userId);
  const userSkillMap = new Map(userSkills.map((us) => [us.skillId, us]));
  const progress = db.getUserProgress(userId);
  const submissions = db.getSubmissions(userId);
  const topicProgress = db.getTopicProgress(userId);
  const user = db.getUser(userId) || db.getUser('usr_aarav');

  const enriched = courses.map((crs) => {
    // Check prerequisites
    const prereqStatus = crs.prerequisiteSkillIds.map((sid) => {
      const us = userSkillMap.get(sid);
      const isMet = us && (us.verifiedScore || (us.proficiency === 'Advanced' ? 100 : us.proficiency === 'Intermediate' ? 70 : 35)) >= 60;
      return {
        skillId: sid,
        skillName: skillMap.get(sid) || sid,
        isMet: !!isMet,
        score: us?.verifiedScore || 0,
      };
    });

    const allPrereqsMet = prereqStatus.every((p) => p.isMet);

    // Latest assessment for this course
    const assessment = crs.prerequisiteAssessmentId ? db.getAssessment(crs.prerequisiteAssessmentId) : undefined;
    const latestSub = assessment ? submissions.find((s) => s.assessmentId === assessment.id) : undefined;

    let readinessStatus = 'Prerequisites Not Checked';
    if (latestSub) {
      readinessStatus = latestSub.readinessStatus;
    } else if (crs.prerequisiteSkillIds.length === 0) {
      readinessStatus = 'Ready';
    }

    const isCompleted = progress.completedCourseIds.includes(crs.id);

    return {
      ...crs,
      topicProgress,
      prerequisites: prereqStatus,
      allPrereqsMet,
      readinessStatus,
      assessmentId: assessment?.id,
      isCompleted,
      progressPct: isCompleted ? 100 : readinessStatus === 'Ready' ? 35 : 0,
    };
  });

  return NextResponse.json({
    courses: enriched,
    topicProgress,
    subscriptionTier: user?.subscriptionTier || 'free',
  });
}
