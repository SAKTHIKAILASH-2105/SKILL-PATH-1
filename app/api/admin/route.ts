import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Career, Course, Skill, LearningResource, Assessment } from '@/lib/types';

export async function GET(req: NextRequest) {
  const users = db.getUsers();
  const careers = db.getCareers();
  const courses = db.getCourses();
  const skills = db.getSkills();
  const resources = db.getResources();
  const assessments = db.getAssessments();
  const submissions = db.getSubmissions();

  const totalLearners = users.filter((u) => u.role === 'learner').length;
  const activeLearners = users.filter((u) => u.streakDays > 0).length;
  const proSubscribers = users.filter((u) => u.subscriptionTier === 'pro' || u.subscriptionTier === 'enterprise').length;

  // Most selected careers
  const careerCounts: Record<string, number> = {};
  users.forEach((u) => {
    if (u.targetCareerId) {
      careerCounts[u.targetCareerId] = (careerCounts[u.targetCareerId] || 0) + 1;
    }
  });

  const popularCareers = Object.entries(careerCounts).map(([cid, count]) => {
    const car = careers.find((c) => c.id === cid);
    return { id: cid, title: car?.title || cid, count };
  });

  // Assessment performance stats
  const avgScore = submissions.length > 0
    ? Math.round(submissions.reduce((acc, s) => acc + s.score, 0) / submissions.length)
    : 72;

  const passedSubmissions = submissions.filter((s) => s.score >= 75).length;
  const passRate = submissions.length > 0 ? Math.round((passedSubmissions / submissions.length) * 100) : 65;

  // Difficult skills (skills where users have lowest average verified score)
  const allUserSkills = db.getRaw().userSkills;
  const skillScores: Record<string, { total: number; count: number }> = {};
  allUserSkills.forEach((us) => {
    if (!skillScores[us.skillId]) skillScores[us.skillId] = { total: 0, count: 0 };
    skillScores[us.skillId].total += us.verifiedScore || 0;
    skillScores[us.skillId].count += 1;
  });

  const difficultSkills = Object.entries(skillScores)
    .map(([sid, data]) => {
      const sk = skills.find((s) => s.id === sid);
      return {
        id: sid,
        name: sk?.name || sid,
        avgScore: Math.round(data.total / data.count),
      };
    })
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 5);

  return NextResponse.json({
    analytics: {
      totalLearners,
      activeLearners,
      proSubscribers,
      averageAssessmentScore: avgScore,
      assessmentPassRate: passRate,
      popularCareers,
      difficultSkills,
      totalCourses: courses.length,
      totalResources: resources.length,
      totalAssessments: assessments.length,
    },
    learners: users.filter((u) => u.role === 'learner'),
    careers,
    courses,
    skills,
    resources,
    assessments,
  });
}

// Admin CRUD Handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entityType, action, data } = body;

    if (!entityType || !action || !data) {
      return NextResponse.json({ error: 'entityType, action, and data are required' }, { status: 400 });
    }

    if (entityType === 'career') {
      if (action === 'create') {
        const created = db.createCareer({ ...data, id: data.id || `car_${Date.now()}` });
        return NextResponse.json({ item: created, message: 'Career created' });
      }
      if (action === 'update') {
        const updated = db.updateCareer(data.id, data);
        return NextResponse.json({ item: updated, message: 'Career updated' });
      }
      if (action === 'delete') {
        const success = db.deleteCareer(data.id);
        return NextResponse.json({ success, message: 'Career deleted' });
      }
    }

    if (entityType === 'course') {
      if (action === 'create') {
        const created = db.createCourse({ ...data, id: data.id || `crs_${Date.now()}` });
        return NextResponse.json({ item: created, message: 'Course created' });
      }
      if (action === 'update') {
        const updated = db.updateCourse(data.id, data);
        return NextResponse.json({ item: updated, message: 'Course updated' });
      }
      if (action === 'delete') {
        const success = db.deleteCourse(data.id);
        return NextResponse.json({ success, message: 'Course deleted' });
      }
    }

    if (entityType === 'skill') {
      if (action === 'create') {
        const created = db.createSkill({ ...data, id: data.id || `skl_${Date.now()}` });
        return NextResponse.json({ item: created, message: 'Skill created' });
      }
      if (action === 'update') {
        const updated = db.updateSkill(data.id, data);
        return NextResponse.json({ item: updated, message: 'Skill updated' });
      }
      if (action === 'delete') {
        const success = db.deleteSkill(data.id);
        return NextResponse.json({ success, message: 'Skill deleted' });
      }
    }

    if (entityType === 'resource') {
      if (action === 'create') {
        const created = db.createResource({ ...data, id: data.id || `res_${Date.now()}` });
        return NextResponse.json({ item: created, message: 'Resource created' });
      }
      if (action === 'update') {
        const updated = db.updateResource(data.id, data);
        return NextResponse.json({ item: updated, message: 'Resource updated' });
      }
      if (action === 'delete') {
        const success = db.deleteResource(data.id);
        return NextResponse.json({ success, message: 'Resource deleted' });
      }
    }

    if (entityType === 'assessment') {
      if (action === 'create') {
        const created = db.createAssessment({ ...data, id: data.id || `asm_${Date.now()}` });
        return NextResponse.json({ item: created, message: 'Assessment created' });
      }
      if (action === 'update') {
        const updated = db.updateAssessment(data.id, data);
        return NextResponse.json({ item: updated, message: 'Assessment updated' });
      }
      if (action === 'delete') {
        const success = db.deleteAssessment(data.id);
        return NextResponse.json({ success, message: 'Assessment deleted' });
      }
    }

    return NextResponse.json({ error: 'Invalid entityType or action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Operation failed' }, { status: 500 });
  }
}
