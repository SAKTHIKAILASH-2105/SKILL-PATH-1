import fs from 'fs';
import path from 'path';
import {
  User,
  Skill,
  Career,
  Course,
  LearningResource,
  Assessment,
  AssessmentSubmission,
  RoadmapStage,
  UserSkill,
  UserCertification,
  UserProject,
  UserProgress,
  AgentLog,
  MentorMessage,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_SKILLS,
  INITIAL_CAREERS,
  INITIAL_COURSES,
  INITIAL_ASSESSMENTS,
  INITIAL_RESOURCES,
  INITIAL_ROADMAP,
  INITIAL_USER_SKILLS,
  INITIAL_CERTIFICATIONS,
  INITIAL_PROJECTS,
  INITIAL_USER_PROGRESS,
  INITIAL_AGENT_LOGS,
  INITIAL_MENTOR_MESSAGES,
} from './seedData';
import { TOPIC_VIDEOS } from './topicVideos';

interface DatabaseSchema {
  users: User[];
  skills: Skill[];
  careers: Career[];
  courses: Course[];
  assessments: Assessment[];
  resources: LearningResource[];
  userSkills: UserSkill[];
  certifications: UserCertification[];
  projects: UserProject[];
  roadmap: RoadmapStage[];
  progress: UserProgress[];
  submissions: AssessmentSubmission[];
  agentLogs: AgentLog[];
  mentorMessages: MentorMessage[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

function getInitialData(): DatabaseSchema {
  return {
    users: INITIAL_USERS,
    skills: INITIAL_SKILLS,
    careers: INITIAL_CAREERS,
    courses: INITIAL_COURSES,
    assessments: INITIAL_ASSESSMENTS,
    resources: INITIAL_RESOURCES,
    userSkills: INITIAL_USER_SKILLS,
    certifications: INITIAL_CERTIFICATIONS,
    projects: INITIAL_PROJECTS,
    roadmap: INITIAL_ROADMAP,
    progress: [INITIAL_USER_PROGRESS],
    submissions: [],
    agentLogs: INITIAL_AGENT_LOGS,
    mentorMessages: INITIAL_MENTOR_MESSAGES,
  };
}

let memoryCache: DatabaseSchema | null = null;

function ensureDbFile(): DatabaseSchema {
  if (memoryCache) {
    return memoryCache;
  }

  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      memoryCache = initial;
      return initial;
    }

    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content) as DatabaseSchema;
    
    // Sync courses with initial topics and videos if missing
    let updated = false;
    for (const c of parsed.courses) {
      if (!c.topics || c.topics.length === 0) {
        const seed = INITIAL_COURSES.find((s) => s.id === c.id);
        if (seed?.topics) {
          c.topics = seed.topics;
          updated = true;
        }
      }
      if (c.topics) {
        for (const t of c.topics) {
          if (!t.videos || t.videos.length === 0) {
            const vids = TOPIC_VIDEOS[t.id];
            if (vids && vids.length > 0) {
              t.videos = vids;
              updated = true;
            }
          }
        }
      }
    }
    if (updated) {
      saveDb(parsed);
    }

    memoryCache = parsed;
    return parsed;
  } catch (err) {
    console.error('Error reading database file, falling back to memory/seed:', err);
    const initial = getInitialData();
    memoryCache = initial;
    return initial;
  }
}

function saveDb(data: DatabaseSchema): void {
  memoryCache = data;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting database file:', err);
  }
}

export const db = {
  reset(): DatabaseSchema {
    const fresh = getInitialData();
    saveDb(fresh);
    return fresh;
  },

  getRaw(): DatabaseSchema {
    return ensureDbFile();
  },

  // USERS
  getUsers(): User[] {
    return ensureDbFile().users;
  },
  getUser(id: string): User | undefined {
    return ensureDbFile().users.find((u) => u.id === id);
  },
  getUserByEmail(email: string): User | undefined {
    return ensureDbFile().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  createUser(user: User): User {
    const data = ensureDbFile();
    const existing = data.users.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (existing) {
      throw new Error(`A user with email ${user.email} already exists.`);
    }
    data.users.push(user);
    // Initialize user progress entry if not already present
    const progIdx = data.progress.findIndex((p) => p.userId === user.id);
    if (progIdx === -1) {
      data.progress.push({
        id: `prog_${user.id}`,
        userId: user.id,
        completedResourceIds: [],
        completedExerciseIds: [],
        completedStageIds: [],
        completedCourseIds: [],
        totalHoursSpent: 0,
        currentStreak: 1,
        lastActiveDate: new Date().toISOString(),
        activityHistory: [
          {
            date: new Date().toISOString().split('T')[0],
            hours: 0,
            activity: 'Account registered and initialized',
          },
        ],
        topicProgress: {},
      });
    }
    saveDb(data);
    return user;
  },
  updateUser(id: string, updates: Partial<User>): User {
    const data = ensureDbFile();
    const idx = data.users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error(`User ${id} not found`);
    data.users[idx] = { ...data.users[idx], ...updates };
    saveDb(data);
    return data.users[idx];
  },

  // SKILLS
  getSkills(): Skill[] {
    return ensureDbFile().skills;
  },
  getSkill(id: string): Skill | undefined {
    return ensureDbFile().skills.find((s) => s.id === id);
  },
  createSkill(skill: Skill): Skill {
    const data = ensureDbFile();
    data.skills.push(skill);
    saveDb(data);
    return skill;
  },
  updateSkill(id: string, updates: Partial<Skill>): Skill {
    const data = ensureDbFile();
    const idx = data.skills.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Skill ${id} not found`);
    data.skills[idx] = { ...data.skills[idx], ...updates };
    saveDb(data);
    return data.skills[idx];
  },
  deleteSkill(id: string): boolean {
    const data = ensureDbFile();
    const initialLen = data.skills.length;
    data.skills = data.skills.filter((s) => s.id !== id);
    saveDb(data);
    return data.skills.length < initialLen;
  },

  // USER SKILLS
  getUserSkills(userId: string): UserSkill[] {
    return ensureDbFile().userSkills.filter((us) => us.userId === userId);
  },
  setUserSkill(userId: string, skillId: string, proficiency: UserSkill['proficiency'], verifiedScore?: number): UserSkill {
    const data = ensureDbFile();
    const idx = data.userSkills.findIndex((us) => us.userId === userId && us.skillId === skillId);
    if (idx >= 0) {
      data.userSkills[idx] = {
        ...data.userSkills[idx],
        proficiency,
        verifiedScore: verifiedScore !== undefined ? verifiedScore : data.userSkills[idx].verifiedScore,
        lastUpdated: new Date().toISOString(),
      };
      saveDb(data);
      return data.userSkills[idx];
    } else {
      const newSkill: UserSkill = {
        id: `us_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        userId,
        skillId,
        proficiency,
        verifiedScore,
        lastUpdated: new Date().toISOString(),
      };
      data.userSkills.push(newSkill);
      saveDb(data);
      return newSkill;
    }
  },
  deleteUserSkill(userId: string, skillId: string): boolean {
    const data = ensureDbFile();
    const initLen = data.userSkills.length;
    data.userSkills = data.userSkills.filter((us) => !(us.userId === userId && us.skillId === skillId));
    saveDb(data);
    return data.userSkills.length < initLen;
  },

  // CERTIFICATIONS
  getUserCertifications(userId: string): UserCertification[] {
    return ensureDbFile().certifications.filter((c) => c.userId === userId);
  },
  addCertification(cert: Omit<UserCertification, 'id'>): UserCertification {
    const data = ensureDbFile();
    const newCert: UserCertification = {
      ...cert,
      id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };
    data.certifications.push(newCert);
    saveDb(data);
    return newCert;
  },
  deleteCertification(id: string): boolean {
    const data = ensureDbFile();
    const initLen = data.certifications.length;
    data.certifications = data.certifications.filter((c) => c.id !== id);
    saveDb(data);
    return data.certifications.length < initLen;
  },

  // PROJECTS
  getUserProjects(userId: string): UserProject[] {
    return ensureDbFile().projects.filter((p) => p.userId === userId);
  },
  addProject(project: Omit<UserProject, 'id'>): UserProject {
    const data = ensureDbFile();
    const newProj: UserProject = {
      ...project,
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };
    data.projects.push(newProj);
    saveDb(data);
    return newProj;
  },
  deleteProject(id: string): boolean {
    const data = ensureDbFile();
    const initLen = data.projects.length;
    data.projects = data.projects.filter((p) => p.id !== id);
    saveDb(data);
    return data.projects.length < initLen;
  },

  // CAREERS
  getCareers(): Career[] {
    return ensureDbFile().careers;
  },
  getCareer(id: string): Career | undefined {
    return ensureDbFile().careers.find((c) => c.id === id);
  },
  createCareer(career: Career): Career {
    const data = ensureDbFile();
    data.careers.push(career);
    saveDb(data);
    return career;
  },
  updateCareer(id: string, updates: Partial<Career>): Career {
    const data = ensureDbFile();
    const idx = data.careers.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Career ${id} not found`);
    data.careers[idx] = { ...data.careers[idx], ...updates };
    saveDb(data);
    return data.careers[idx];
  },
  deleteCareer(id: string): boolean {
    const data = ensureDbFile();
    const initLen = data.careers.length;
    data.careers = data.careers.filter((c) => c.id !== id);
    saveDb(data);
    return data.careers.length < initLen;
  },

  // COURSES
  getCourses(): Course[] {
    const courses = ensureDbFile().courses;
    for (const c of courses) {
      if (c.topics) {
        for (const t of c.topics) {
          if (!t.videos || t.videos.length === 0) {
            t.videos = TOPIC_VIDEOS[t.id] || [];
          }
        }
      }
    }
    return courses;
  },
  getCourse(id: string): Course | undefined {
    const course = ensureDbFile().courses.find((c) => c.id === id);
    if (!course) return undefined;
    if (course.topics) {
      for (const t of course.topics) {
        if (!t.videos || t.videos.length === 0) {
          t.videos = TOPIC_VIDEOS[t.id] || [];
        }
      }
    }
    return course;
  },
  createCourse(course: Course): Course {
    const data = ensureDbFile();
    data.courses.push(course);
    saveDb(data);
    return course;
  },
  updateCourse(id: string, updates: Partial<Course>): Course {
    const data = ensureDbFile();
    const idx = data.courses.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Course ${id} not found`);
    data.courses[idx] = { ...data.courses[idx], ...updates };
    saveDb(data);
    return data.courses[idx];
  },
  deleteCourse(id: string): boolean {
    const data = ensureDbFile();
    const initLen = data.courses.length;
    data.courses = data.courses.filter((c) => c.id !== id);
    saveDb(data);
    return data.courses.length < initLen;
  },

  // RESOURCES
  getResources(): LearningResource[] {
    return ensureDbFile().resources;
  },
  getResource(id: string): LearningResource | undefined {
    return ensureDbFile().resources.find((r) => r.id === id);
  },
  createResource(resource: LearningResource): LearningResource {
    const data = ensureDbFile();
    data.resources.push(resource);
    saveDb(data);
    return resource;
  },
  updateResource(id: string, updates: Partial<LearningResource>): LearningResource {
    const data = ensureDbFile();
    const idx = data.resources.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Resource ${id} not found`);
    data.resources[idx] = { ...data.resources[idx], ...updates };
    saveDb(data);
    return data.resources[idx];
  },
  deleteResource(id: string): boolean {
    const data = ensureDbFile();
    const initLen = data.resources.length;
    data.resources = data.resources.filter((r) => r.id !== id);
    saveDb(data);
    return data.resources.length < initLen;
  },

  // ASSESSMENTS
  getAssessments(): Assessment[] {
    return ensureDbFile().assessments;
  },
  getAssessment(id: string): Assessment | undefined {
    return ensureDbFile().assessments.find((a) => a.id === id);
  },
  getAssessmentByCourse(courseId: string): Assessment | undefined {
    return ensureDbFile().assessments.find((a) => a.courseId === courseId);
  },
  createAssessment(assessment: Assessment): Assessment {
    const data = ensureDbFile();
    data.assessments.push(assessment);
    saveDb(data);
    return assessment;
  },
  updateAssessment(id: string, updates: Partial<Assessment>): Assessment {
    const data = ensureDbFile();
    const idx = data.assessments.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error(`Assessment ${id} not found`);
    data.assessments[idx] = { ...data.assessments[idx], ...updates };
    saveDb(data);
    return data.assessments[idx];
  },
  deleteAssessment(id: string): boolean {
    const data = ensureDbFile();
    const initLen = data.assessments.length;
    data.assessments = data.assessments.filter((a) => a.id !== id);
    saveDb(data);
    return data.assessments.length < initLen;
  },

  // SUBMISSIONS
  getSubmissions(userId?: string): AssessmentSubmission[] {
    const subs = ensureDbFile().submissions;
    if (userId) return subs.filter((s) => s.userId === userId);
    return subs;
  },
  addSubmission(sub: AssessmentSubmission): AssessmentSubmission {
    const data = ensureDbFile();
    data.submissions.unshift(sub);
    saveDb(data);
    return sub;
  },

  // ROADMAP
  getRoadmap(userId: string): RoadmapStage[] {
    const list = ensureDbFile().roadmap.filter((r) => r.userId === userId).sort((a, b) => a.stageNumber - b.stageNumber);
    if (list.length > 0) return list;
    const template = INITIAL_ROADMAP.map((r, idx) => ({
      ...r,
      id: `stage_${userId}_${idx + 1}`,
      userId,
      status: (idx === 0 ? 'In Progress' : 'Available') as any,
    }));
    db.setRoadmap(userId, template);
    return template;
  },
  setRoadmap(userId: string, stages: RoadmapStage[]): RoadmapStage[] {
    const data = ensureDbFile();
    data.roadmap = data.roadmap.filter((r) => r.userId !== userId).concat(stages);
    saveDb(data);
    return stages;
  },
  updateRoadmapStage(stageId: string, updates: Partial<RoadmapStage>): RoadmapStage {
    const data = ensureDbFile();
    const idx = data.roadmap.findIndex((r) => r.id === stageId);
    if (idx === -1) throw new Error(`Roadmap stage ${stageId} not found`);
    data.roadmap[idx] = { ...data.roadmap[idx], ...updates };
    saveDb(data);
    return data.roadmap[idx];
  },

  // USER PROGRESS
  getUserProgress(userId: string): UserProgress {
    const data = ensureDbFile();
    let prog = data.progress.find((p) => p.userId === userId);
    if (!prog) {
      prog = {
        id: `prog_${userId}`,
        userId,
        completedResourceIds: [],
        completedExerciseIds: [],
        completedStageIds: [],
        completedCourseIds: [],
        totalHoursSpent: 0,
        currentStreak: 1,
        lastActiveDate: new Date().toISOString(),
        activityHistory: [],
      };
      data.progress.push(prog);
      saveDb(data);
    }
    return prog;
  },
  updateUserProgress(userId: string, updates: Partial<UserProgress>): UserProgress {
    const data = ensureDbFile();
    const idx = data.progress.findIndex((p) => p.userId === userId);
    if (idx === -1) {
      const newProg = { ...this.getUserProgress(userId), ...updates };
      data.progress.push(newProg);
      saveDb(data);
      return newProg;
    }
    data.progress[idx] = { ...data.progress[idx], ...updates };
    saveDb(data);
    return data.progress[idx];
  },

  updateTopicProgress(userId: string, topicId: string, status: 'skipped' | 'study' | 'completed'): void {
    const data = ensureDbFile();
    const idx = data.progress.findIndex((p) => p.userId === userId);
    if (idx === -1) return;
    if (!data.progress[idx].topicProgress) data.progress[idx].topicProgress = {};
    data.progress[idx].topicProgress![topicId] = status;
    saveDb(data);
  },

  getTopicProgress(userId: string): Record<string, 'skipped' | 'study' | 'completed'> {
    const data = ensureDbFile();
    const prog = data.progress.find((p) => p.userId === userId);
    return prog?.topicProgress || {};
  },

  // AGENT LOGS
  getAgentLogs(userId?: string): AgentLog[] {
    const logs = ensureDbFile().agentLogs;
    if (userId) return logs.filter((l) => l.userId === userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
  addAgentLog(log: Omit<AgentLog, 'id' | 'timestamp'>): AgentLog {
    const data = ensureDbFile();
    const newLog: AgentLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    data.agentLogs.unshift(newLog);
    // keep max 100 logs
    if (data.agentLogs.length > 100) {
      data.agentLogs = data.agentLogs.slice(0, 100);
    }
    saveDb(data);
    return newLog;
  },

  // MENTOR MESSAGES
  getMentorMessages(userId: string): MentorMessage[] {
    return ensureDbFile().mentorMessages.filter((m) => m.userId === userId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },
  addMentorMessage(msg: Omit<MentorMessage, 'id' | 'timestamp'>): MentorMessage {
    const data = ensureDbFile();
    const newMsg: MentorMessage = {
      ...msg,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    data.mentorMessages.push(newMsg);
    saveDb(data);
    return newMsg;
  },

  // ENROLLMENTS & ADMIN STUDENT ANALYTICS
  enrollInCourse(userId: string, courseId: string): void {
    const data = ensureDbFile();
    let prog = data.progress.find((p) => p.userId === userId);
    if (!prog) {
      prog = this.getUserProgress(userId);
    }
    if (!prog.enrolledCourseIds) {
      prog.enrolledCourseIds = [];
    }
    if (!prog.enrolledCourseIds.includes(courseId)) {
      prog.enrolledCourseIds.push(courseId);
      saveDb(data);
    }
  },

  getEnrolledCourseIds(userId: string): string[] {
    const data = ensureDbFile();
    const prog = data.progress.find((p) => p.userId === userId);
    if (prog?.enrolledCourseIds && prog.enrolledCourseIds.length > 0) {
      return prog.enrolledCourseIds;
    }
    const user = data.users.find((u) => u.id === userId);
    if (user?.targetCareerId === 'car_react_frontend') {
      return ['crs_html_css', 'crs_js_fund', 'crs_react'];
    } else if (user?.targetCareerId === 'car_ai_ml_engineer') {
      return ['crs_python_ds', 'crs_ml_found', 'crs_sql_db'];
    } else if (user?.targetCareerId === 'car_data_scientist') {
      return ['crs_python_ds', 'crs_sql_db'];
    } else if (user?.targetCareerId === 'car_backend_node') {
      return ['crs_js_fund', 'crs_nodejs', 'crs_sql_db'];
    }
    return ['crs_fullstack', 'crs_html_css', 'crs_sql_db'];
  },

  getCourseEnrollmentStats() {
    const data = ensureDbFile();
    const learners = data.users.filter((u) => u.role === 'learner');
    const courses = this.getCourses();
    const certifications = data.certifications || [];

    return courses.map((course) => {
      const enrolledStudents: {
        id: string;
        name: string;
        email: string;
        avatar: string;
        progressPercent: number;
        topicsCompleted: number;
        totalTopics: number;
        hasCertificate: boolean;
      }[] = [];

      let completedCount = 0;
      let totalProgress = 0;

      const courseTopics = course.topics || [];
      const totalTopics = courseTopics.length || 1;

      for (const student of learners) {
        const studentEnrolled = this.getEnrolledCourseIds(student.id);
        const prog = data.progress.find((p) => p.userId === student.id);
        const hasTopicProgress = courseTopics.some((t) => prog?.topicProgress && prog.topicProgress[t.id]);

        if (studentEnrolled.includes(course.id) || hasTopicProgress) {
          let doneTopics = 0;
          if (prog?.topicProgress) {
            for (const t of courseTopics) {
              const status = prog.topicProgress[t.id];
              if (status === 'completed' || status === 'skipped') {
                doneTopics++;
              }
            }
          }

          const hasCert = certifications.some(
            (c) => c.userId === student.id && (c.title?.includes(course.title) || c.url?.includes(course.id))
          ) || (prog?.completedCourseIds?.includes(course.id) ?? false);

          const percent = hasCert
            ? 100
            : totalTopics > 0
            ? Math.min(100, Math.round((doneTopics / totalTopics) * 100))
            : 0;

          if (percent === 100 || hasCert) {
            completedCount++;
          }
          totalProgress += percent;

          enrolledStudents.push({
            id: student.id,
            name: student.name,
            email: student.email,
            avatar: student.avatar,
            progressPercent: percent,
            topicsCompleted: doneTopics,
            totalTopics,
            hasCertificate: hasCert,
          });
        }
      }

      const enrolledCount = enrolledStudents.length;
      const avgProgress = enrolledCount > 0 ? Math.round(totalProgress / enrolledCount) : 0;

      return {
        courseId: course.id,
        courseTitle: course.title,
        category: course.category,
        difficulty: course.difficulty,
        duration: course.duration,
        isPremium: course.isPremium,
        totalTopics,
        enrolledCount,
        completedCount,
        inProgressCount: enrolledCount - completedCount,
        averageProgressPercent: avgProgress,
        students: enrolledStudents,
      };
    });
  },

  getAllStudentsWithDetails() {
    const data = ensureDbFile();
    const learners = data.users.filter((u) => u.role === 'learner');
    const courses = this.getCourses();
    const careers = this.getCareers();
    const certifications = data.certifications || [];
    const submissions = data.submissions || [];

    return learners.map((student) => {
      const prog = this.getUserProgress(student.id);
      const studentEnrolledIds = this.getEnrolledCourseIds(student.id);
      const studentCerts = certifications.filter((c) => c.userId === student.id);
      const studentSubs = submissions.filter((s) => s.userId === student.id);
      const career = careers.find((c) => c.id === student.targetCareerId);

      const enrolledCourses = studentEnrolledIds.map((cid) => {
        const course = courses.find((c) => c.id === cid);
        const courseTopics = course?.topics || [];
        const totalTopics = courseTopics.length || 1;

        let topicsCompleted = 0;
        if (prog?.topicProgress) {
          for (const t of courseTopics) {
            const st = prog.topicProgress[t.id];
            if (st === 'completed' || st === 'skipped') topicsCompleted++;
          }
        }

        const isCompleted = studentCerts.some(
          (c) => c.title?.includes(course?.title || '') || c.url?.includes(cid)
        ) || (prog?.completedCourseIds?.includes(cid) ?? false);

        const progressPercent = isCompleted
          ? 100
          : totalTopics > 0
          ? Math.min(100, Math.round((topicsCompleted / totalTopics) * 100))
          : 0;

        return {
          courseId: cid,
          courseTitle: course?.title || cid,
          difficulty: course?.difficulty || 'Intermediate',
          category: course?.category || 'General',
          totalTopics,
          topicsCompleted,
          progressPercent,
          isCompleted,
        };
      });

      const avgProg = enrolledCourses.length > 0
        ? Math.round(enrolledCourses.reduce((acc, c) => acc + c.progressPercent, 0) / enrolledCourses.length)
        : 0;

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        avatar: student.avatar,
        education: student.education || 'Professional Learner',
        experience: student.experience || 'Self-paced student',
        targetCareerId: student.targetCareerId,
        targetCareerTitle: career?.title || 'Full Stack Developer',
        createdAt: student.createdAt,
        streakDays: student.streakDays || 1,
        weeklyHours: student.weeklyHours || 15,
        preferredStyle: student.preferredStyle || 'Hands-on practice',
        subscriptionTier: student.subscriptionTier || 'free',
        enrolledCourses,
        totalEnrolled: enrolledCourses.length,
        overallProgress: avgProg,
        certificates: studentCerts,
        totalCertificates: studentCerts.length,
        totalHoursSpent: prog.totalHoursSpent || 10,
        lastActiveDate: prog.lastActiveDate || student.createdAt,
        recentSubmissions: studentSubs.slice(0, 5),
      };
    });
  },
};
