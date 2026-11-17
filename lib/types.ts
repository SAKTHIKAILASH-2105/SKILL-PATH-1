export type UserRole = 'learner' | 'admin';

export type SkillProficiency = 'Not Started' | 'Beginner' | 'Intermediate' | 'Advanced';

export type ReadinessStatus = 'Ready' | 'Needs Revision' | 'Foundation Required';

export type StageStatus = 'Locked' | 'Available' | 'In Progress' | 'Completed';

export type ResourceType = 'Course' | 'Tutorial' | 'Video' | 'Documentation' | 'Exercise' | 'Project';

export type SkillImportance = 'Critical' | 'High' | 'Medium';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  education: string;
  experience: string;
  targetCareerId: string;
  weeklyHours: number;
  preferredStyle: string;
  streakDays: number;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  subscriptionExpiresAt: string | null;
  password?: string;
  supabaseId?: string;
  createdAt: string;
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  proficiency: SkillProficiency;
  verifiedScore?: number;
  lastUpdated: string;
}

export interface UserCertification {
  id: string;
  userId: string;
  title: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface UserProject {
  id: string;
  userId: string;
  title: string;
  description: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'AI & Data' | 'Design & Security';
  description: string;
  importance: SkillImportance;
}

export interface Career {
  id: string;
  title: string;
  description: string;
  requiredSkillIds: {
    skillId: string;
    requiredLevel: SkillProficiency;
    importance: SkillImportance;
  }[];
  estimatedDurationWeeks: number;
  averageSalary: string;
  category: string;
  iconName: string;
}

export interface TopicVideo {
  id: string;
  title: string;
  platform: 'YouTube' | 'Coursera' | 'freeCodeCamp' | 'edX' | 'Udemy';
  duration: string;
  url: string;
  embedId?: string; // YouTube video ID for embedded player
  isPro: boolean;
  instructor?: string;
  thumbnailUrl?: string;
  description: string;
}

export interface CourseTopic {
  id: string;
  title: string;
  description: string;
  studyContent: string; // Theory content
  videos?: TopicVideo[]; // Multi-platform video content (YouTube, Coursera, etc.)
  quiz: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  isPremium: boolean;
  prerequisiteSkillIds: string[];
  prerequisiteAssessmentId?: string;
  skillsTaught: string[];
  modulesCount: number;
  learningObjectives: string[];
  topics?: CourseTopic[];
}

export interface LearningResource {
  id: string;
  title: string;
  type: ResourceType;
  skillId: string;
  courseId?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  isPremium: boolean;
  provider: string;
  url: string;
  description: string;
  rating?: number;
}

export interface AssessmentQuestion {
  id: string;
  topic: string; // e.g. "JavaScript Functions", "DOM Manipulation", "ES6"
  question: string;
  type: 'multiple-choice' | 'short-answer';
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Assessment {
  id: string;
  title: string;
  courseId: string;
  targetSkillIds: string[];
  description: string;
  passingScore: number; // usually 75%
  questions: AssessmentQuestion[];
}

export interface AssessmentSubmission {
  id: string;
  userId: string;
  assessmentId: string;
  score: number;
  readinessStatus: ReadinessStatus;
  topicScores: Record<string, { total: number; correct: number; percentage: number }>;
  answers: Record<string, string>;
  feedback: string;
  recommendedResourceIds: string[];
  createdAt: string;
}

export interface RoadmapStage {
  id: string;
  userId: string;
  careerId: string;
  stageNumber: number;
  title: string;
  skillId: string;
  reason: string;
  estimatedHours: number;
  prerequisites: string[];
  status: StageStatus;
  resourceIds: string[];
  exerciseIds: string[];
  assessmentId?: string;
  isFoundationModule?: boolean; // injected adaptively when assessment fails
}

export interface UserProgress {
  id: string;
  userId: string;
  completedResourceIds: string[];
  completedExerciseIds: string[];
  completedStageIds: string[];
  completedCourseIds: string[];
  enrolledCourseIds?: string[];
  totalHoursSpent: number;
  currentStreak: number;
  lastActiveDate: string;
  activityHistory: {
    date: string;
    hours: number;
    activity: string;
  }[];
  topicProgress?: Record<string, 'skipped' | 'study' | 'completed'>; // key = topicId
}

export interface AgentLog {
  id: string;
  userId: string;
  agentName: string;
  agentRole: string;
  status: 'idle' | 'running' | 'completed' | 'triggered';
  timestamp: string;
  input: Record<string, any>;
  output: Record<string, any>;
  summary: string;
  decisionImpact: string;
}

export interface MentorMessage {
  id: string;
  userId: string;
  sender: 'user' | 'mentor' | 'system';
  text: string;
  actionSuggestion?: {
    label: string;
    actionType: 'navigate' | 'update_roadmap' | 'take_assessment' | 'view_resource';
    payload?: string;
  };
  timestamp: string;
}
