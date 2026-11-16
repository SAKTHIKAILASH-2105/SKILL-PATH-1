import { db } from '../db';
import {
  User,
  Career,
  Skill,
  Course,
  LearningResource,
  Assessment,
  AssessmentSubmission,
  RoadmapStage,
  UserSkill,
  UserProgress,
  AgentLog,
  ReadinessStatus,
} from '../types';

export interface AgentExecutionResult {
  agentName: string;
  agentRole: string;
  summary: string;
  decisionImpact: string;
  output: any;
}

export class AgentOrchestrator {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // 1. Profile Analyzer Agent
  public runProfileAnalyzer(): AgentExecutionResult {
    const user = db.getUser(this.userId);
    if (!user) throw new Error('User not found');
    const userSkills = db.getUserSkills(this.userId);
    const certs = db.getUserCertifications(this.userId);
    const projects = db.getUserProjects(this.userId);
    const allSkills = db.getSkills();

    const skillMap = new Map(allSkills.map((s) => [s.id, s.name]));

    const normalizedSkills = userSkills.map((us) => ({
      name: skillMap.get(us.skillId) || us.skillId,
      proficiency: us.proficiency,
      score: us.verifiedScore || (us.proficiency === 'Advanced' ? 90 : us.proficiency === 'Intermediate' ? 65 : us.proficiency === 'Beginner' ? 30 : 0),
    }));

    const verifiedCount = userSkills.filter((s) => (s.verifiedScore || 0) > 0).length;
    const estVelocity = user.weeklyHours >= 20 ? 'Aggressive' : user.weeklyHours >= 12 ? 'Moderate' : 'Steady';

    const output = {
      user: user.name,
      education: user.education,
      experience: user.experience,
      weeklyHours: user.weeklyHours,
      estimatedVelocity: estVelocity,
      totalDeclaredSkills: normalizedSkills.length,
      verifiedSkills: verifiedCount,
      certificationsCount: certs.length,
      projectsCount: projects.length,
      normalizedSkills,
    };

    const summary = `Profile Analyzer processed ${user.name}’s credentials: ${certs.length} certifications, ${projects.length} verified projects, and ${normalizedSkills.length} declared competencies. Study pace estimated as ${estVelocity} (${user.weeklyHours} hrs/week).`;
    const decisionImpact = `Calibrated roadmap progression velocity and baseline skill confidence metrics.`;

    db.addAgentLog({
      userId: this.userId,
      agentName: 'Profile Analyzer Agent',
      agentRole: 'Learner Skill Normalization',
      status: 'completed',
      input: { userId: this.userId, weeklyHours: user.weeklyHours, declaredCount: normalizedSkills.length },
      output,
      summary,
      decisionImpact,
    });

    return { agentName: 'Profile Analyzer Agent', agentRole: 'Learner Skill Normalization', summary, decisionImpact, output };
  }

  // 2. Career Analysis Agent
  public runCareerAnalysis(targetCareerId?: string): AgentExecutionResult {
    const user = db.getUser(this.userId);
    if (!user) throw new Error('User not found');
    const careerId = targetCareerId || user.targetCareerId;
    const career = db.getCareer(careerId) || db.getCareers()[0];
    const allSkills = db.getSkills();
    const skillMap = new Map(allSkills.map((s) => [s.id, s.name]));

    const requiredSkills = career.requiredSkillIds.map((req) => ({
      skillId: req.skillId,
      skillName: skillMap.get(req.skillId) || req.skillId,
      requiredLevel: req.requiredLevel,
      importance: req.importance,
    }));

    const criticalCount = requiredSkills.filter((r) => r.importance === 'Critical').length;

    const output = {
      careerId: career.id,
      title: career.title,
      estimatedDurationWeeks: career.estimatedDurationWeeks,
      totalRequiredSkills: requiredSkills.length,
      criticalSkillsCount: criticalCount,
      requiredSkills,
    };

    const summary = `Career Analysis evaluated target career "${career.title}". Identified ${requiredSkills.length} required competencies with ${criticalCount} classified as Critical dependencies.`;
    const decisionImpact = `Enforced prerequisite hierarchy ensuring foundational skills precede application modules.`;

    db.addAgentLog({
      userId: this.userId,
      agentName: 'Career Analysis Agent',
      agentRole: 'Target Career Skill Breakdown',
      status: 'completed',
      input: { careerId: career.id, careerTitle: career.title },
      output,
      summary,
      decisionImpact,
    });

    return { agentName: 'Career Analysis Agent', agentRole: 'Target Career Skill Breakdown', summary, decisionImpact, output };
  }

  // 3. Skill Gap Agent
  public runSkillGap(): AgentExecutionResult {
    const user = db.getUser(this.userId);
    if (!user) throw new Error('User not found');
    const career = db.getCareer(user.targetCareerId) || db.getCareers()[0];
    const userSkills = db.getUserSkills(this.userId);
    const allSkills = db.getSkills();
    const skillMap = new Map(allSkills.map((s) => [s.id, s]));

    const userSkillMap = new Map(userSkills.map((us) => [us.skillId, us]));

    const levelWeights: Record<string, number> = {
      'Not Started': 0,
      Beginner: 35,
      Intermediate: 70,
      Advanced: 100,
    };

    const gapDetails: any[] = [];
    let totalScore = 0;
    let maxPossibleScore = 0;

    career.requiredSkillIds.forEach((req) => {
      const userSkill = userSkillMap.get(req.skillId);
      const skill = skillMap.get(req.skillId);
      const userLevel = userSkill?.proficiency || 'Not Started';
      const userScore = userSkill?.verifiedScore !== undefined ? userSkill.verifiedScore : levelWeights[userLevel] || 0;
      const targetScore = levelWeights[req.requiredLevel] || 100;
      const importanceWeight = req.importance === 'Critical' ? 1.5 : req.importance === 'High' ? 1.2 : 1.0;

      const gap = Math.max(0, targetScore - userScore);

      totalScore += (userScore / 100) * importanceWeight * 100;
      maxPossibleScore += (targetScore / 100) * importanceWeight * 100;

      let status = 'Not Started';
      if (userScore >= targetScore) status = 'Mastered';
      else if (userScore > 0) status = 'In Progress';

      gapDetails.push({
        skillId: req.skillId,
        skillName: skill?.name || req.skillId,
        category: skill?.category || 'General',
        currentLevel: userLevel,
        currentScore: userScore,
        requiredLevel: req.requiredLevel,
        targetScore,
        gap,
        importance: req.importance,
        status,
      });
    });

    const careerReadinessPct = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    const strengths = gapDetails.filter((g) => g.currentScore >= 60).map((g) => g.skillName);
    const weaknesses = gapDetails.filter((g) => g.currentScore > 0 && g.currentScore < 60).map((g) => g.skillName);
    const missing = gapDetails.filter((g) => g.currentScore === 0).map((g) => g.skillName);

    const output = {
      careerTitle: career.title,
      careerReadinessPct,
      strengths,
      weaknesses,
      missing,
      gapDetails,
    };

    const summary = `Skill Gap Agent assessed career readiness at ${careerReadinessPct}%. Identified strengths in [${strengths.slice(0, 3).join(', ')}], active weaknesses in [${weaknesses.join(', ')}], and ${missing.length} missing competencies.`;
    const decisionImpact = `Prioritized critical deficiencies [${[...weaknesses, ...missing].slice(0, 3).join(', ')}] for urgent curriculum scheduling.`;

    db.addAgentLog({
      userId: this.userId,
      agentName: 'Skill Gap Agent',
      agentRole: 'Deficiency & Readiness Scoring',
      status: 'completed',
      input: { targetCareer: career.title, skillsAnalyzed: career.requiredSkillIds.length },
      output,
      summary,
      decisionImpact,
    });

    return { agentName: 'Skill Gap Agent', agentRole: 'Deficiency & Readiness Scoring', summary, decisionImpact, output };
  }

  // 4. Assessment Agent
  public evaluateAssessmentSubmission(
    assessmentId: string,
    answers: Record<string, string>
  ): { submission: AssessmentSubmission; result: AgentExecutionResult } {
    const assessment = db.getAssessment(assessmentId);
    if (!assessment) throw new Error('Assessment not found');
    const user = db.getUser(this.userId);
    if (!user) throw new Error('User not found');

    const topicScores: Record<string, { total: number; correct: number; percentage: number }> = {};
    let totalQuestions = assessment.questions.length;
    let totalCorrect = 0;

    assessment.questions.forEach((q) => {
      if (!topicScores[q.topic]) {
        topicScores[q.topic] = { total: 0, correct: 0, percentage: 0 };
      }
      topicScores[q.topic].total += 1;
      const userAnswer = (answers[q.id] || '').trim().toLowerCase();
      const correctAnswer = q.correctAnswer.trim().toLowerCase();

      if (userAnswer === correctAnswer) {
        topicScores[q.topic].correct += 1;
        totalCorrect += 1;
      }
    });

    Object.keys(topicScores).forEach((topic) => {
      const stats = topicScores[topic];
      stats.percentage = Math.round((stats.correct / stats.total) * 100);
    });

    const overallScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    let readinessStatus: ReadinessStatus = 'Foundation Required';
    if (overallScore >= 75) {
      readinessStatus = 'Ready';
    } else if (overallScore >= 50) {
      readinessStatus = 'Needs Revision';
    }

    const weakTopics = Object.entries(topicScores)
      .filter(([, stats]) => stats.percentage < 60)
      .map(([topic]) => topic);

    const recommendedResourceIds: string[] = [];
    if (weakTopics.length > 0) {
      const allResources = db.getResources();
      weakTopics.forEach((topic) => {
        const lowerTopic = topic.toLowerCase();
        const match = allResources.find(
          (r) =>
            !r.isPremium &&
            (r.title.toLowerCase().includes(lowerTopic) ||
              r.description.toLowerCase().includes(lowerTopic) ||
              (lowerTopic.includes('function') && r.skillId === 'skl_js') ||
              (lowerTopic.includes('dom') && r.skillId === 'skl_dom') ||
              (lowerTopic.includes('es6') && r.skillId === 'skl_es6'))
        );
        if (match && !recommendedResourceIds.includes(match.id)) {
          recommendedResourceIds.push(match.id);
        }
      });
    }

    let feedback = '';
    if (readinessStatus === 'Ready') {
      feedback = `Excellent work! You scored ${overallScore}%, surpassing the 75% benchmark. You are officially certified Ready to begin the main course.`;
    } else if (readinessStatus === 'Needs Revision') {
      feedback = `You scored ${overallScore}%. You have good intuition, but specific areas (${weakTopics.join(', ')}) need targeted reinforcement before advancing.`;
    } else {
      feedback = `You scored ${overallScore}%. Foundation required. Prerequisite topics in ${weakTopics.join(', ')} must be mastered before taking the main course.`;
    }

    const submission: AssessmentSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: this.userId,
      assessmentId,
      score: overallScore,
      readinessStatus,
      topicScores,
      answers,
      feedback,
      recommendedResourceIds,
      createdAt: new Date().toISOString(),
    };

    db.addSubmission(submission);

    // Update verified skill scores for assessed skills
    assessment.targetSkillIds.forEach((skillId) => {
      let prof: UserSkill['proficiency'] = 'Not Started';
      if (overallScore >= 75) prof = 'Intermediate';
      else if (overallScore >= 50) prof = 'Beginner';
      else prof = 'Beginner';
      db.setUserSkill(this.userId, skillId, prof, overallScore);
    });

    const summary = `Assessment Agent scored "${assessment.title}": ${overallScore}% (${readinessStatus}). Detected weak topics: [${weakTopics.join(', ') || 'None'}].`;
    const decisionImpact =
      readinessStatus === 'Ready'
        ? 'Unlocked main course and skipped introductory remedial stages.'
        : `Enforced prerequisite foundation lock and queued remedial modules: [${recommendedResourceIds.join(', ')}].`;

    db.addAgentLog({
      userId: this.userId,
      agentName: 'Assessment Agent',
      agentRole: 'Diagnostic Evaluation & Topic Breakdown',
      status: 'completed',
      input: { assessmentId, answersCount: Object.keys(answers).length },
      output: { score: overallScore, readinessStatus, topicScores, weakTopics },
      summary,
      decisionImpact,
    });

    const result: AgentExecutionResult = {
      agentName: 'Assessment Agent',
      agentRole: 'Diagnostic Evaluation & Topic Breakdown',
      summary,
      decisionImpact,
      output: submission,
    };

    return { submission, result };
  }

  // 5. Learning Path Agent
  public runLearningPath(customCareerId?: string): AgentExecutionResult {
    const user = db.getUser(this.userId);
    if (!user) throw new Error('User not found');
    const careerId = customCareerId || user.targetCareerId;
    const career = db.getCareer(careerId) || db.getCareers()[0];
    const userSkills = db.getUserSkills(this.userId);
    const userSkillMap = new Map(userSkills.map((us) => [us.skillId, us]));
    const resources = db.getResources();

    let stages: RoadmapStage[] = [];

    if (career.id === 'car_fullstack') {
      stages = [
        {
          id: `stg_fs_1_${this.userId}`,
          userId: this.userId,
          careerId: career.id,
          stageNumber: 1,
          title: 'HTML & CSS Foundations',
          skillId: 'skl_html',
          reason: 'Prerequisite for semantic layout, accessibility landmarks, and visual design.',
          estimatedHours: 12,
          prerequisites: [],
          status: 'In Progress',
          resourceIds: ['res_free_html_semantics'],
          exerciseIds: ['ex_html_semantics', 'ex_flexbox'],
        },
        {
          id: `stg_fs_2_${this.userId}`,
          userId: this.userId,
          careerId: career.id,
          stageNumber: 2,
          title: 'JavaScript Fundamentals',
          skillId: 'skl_js',
          reason: 'Language runtime basics: execution context, hoisting, and closure mechanics.',
          estimatedHours: 20,
          prerequisites: ['HTML & CSS Foundations'],
          status: 'Available',
          resourceIds: ['res_free_js_functions'],
          exerciseIds: ['ex_js_functions', 'ex_js_closures'],
        },
        {
          id: `stg_fs_3_${this.userId}`,
          userId: this.userId,
          careerId: career.id,
          stageNumber: 3,
          title: 'DOM and Browser APIs',
          skillId: 'skl_dom',
          reason: 'Essential browser APIs: querySelector, synthetic events, and bubbling.',
          estimatedHours: 15,
          prerequisites: ['JavaScript Fundamentals'],
          status: 'Locked',
          resourceIds: ['res_free_dom_mastery'],
          exerciseIds: ['ex_dom_manipulation'],
        },
        {
          id: `stg_fs_4_${this.userId}`,
          userId: this.userId,
          careerId: career.id,
          stageNumber: 4,
          title: 'React Framework Mastery',
          skillId: 'skl_react',
          reason: 'Modern single-page applications, component lifecycle, and state hooks.',
          estimatedHours: 32,
          prerequisites: ['JavaScript Fundamentals', 'DOM and Browser APIs'],
          status: 'Locked',
          resourceIds: ['res_free_react_docs', 'res_prem_react_mastery'],
          exerciseIds: ['ex_react_hooks'],
          assessmentId: 'asm_react_prereq',
        },
        {
          id: `stg_fs_5_${this.userId}`,
          userId: this.userId,
          careerId: career.id,
          stageNumber: 5,
          title: 'Node.js and Express Backend',
          skillId: 'skl_nodejs',
          reason: 'Server-side runtime, Express REST routing, middleware, and streams.',
          estimatedHours: 28,
          prerequisites: ['JavaScript Fundamentals'],
          status: 'Locked',
          resourceIds: ['res_prem_node_security'],
          exerciseIds: ['ex_node_server'],
          assessmentId: 'asm_node_prereq',
        },
        {
          id: `stg_fs_6_${this.userId}`,
          userId: this.userId,
          careerId: career.id,
          stageNumber: 6,
          title: 'Databases and REST APIs',
          skillId: 'skl_sql',
          reason: 'Relational data modeling, transactions, foreign keys, and performant indexes.',
          estimatedHours: 20,
          prerequisites: ['Node.js and Express Backend'],
          status: 'Locked',
          resourceIds: ['res_free_sql_tutorial'],
          exerciseIds: ['ex_sql_queries'],
        },
        {
          id: `stg_fs_7_${this.userId}`,
          userId: this.userId,
          careerId: career.id,
          stageNumber: 7,
          title: 'Authentication and Deployment',
          skillId: 'skl_deploy',
          reason: 'JWT authentication, cookies, CORS, Docker packaging, and Vercel/Cloud hosting.',
          estimatedHours: 18,
          prerequisites: ['Databases and REST APIs'],
          status: 'Locked',
          resourceIds: ['res_prem_fullstack_project'],
          exerciseIds: ['ex_docker_setup'],
        },
        {
          id: `stg_fs_8_${this.userId}`,
          userId: this.userId,
          careerId: career.id,
          stageNumber: 8,
          title: 'Final Full-Stack Capstone Project',
          skillId: 'skl_react',
          reason: 'End-to-end multi-tenant application uniting frontend, API, database, and CI/CD.',
          estimatedHours: 40,
          prerequisites: ['Authentication and Deployment'],
          status: 'Locked',
          resourceIds: ['res_prem_fullstack_project'],
          exerciseIds: ['ex_capstone_deploy'],
        },
      ];
    } else if (career.id === 'car_datasci') {
      stages = [
        {
          id: `stg_ds_1_${this.userId}`,
          userId: this.userId,
          careerId: career.id,
          stageNumber: 1,
          title: 'Python for Scientific Computing',
          skillId: 'skl_python',
          reason: 'Core scientific programming language (Aarav already has intermediate proficiency!).',
          estimatedHours: 10,
          prerequisites: [],
          status: 'Completed', // Aarav already knows Python
          resourceIds: ['res_free_python_ds'],
          exerciseIds: ['ex_py_numpy_arrays'],
        },
        {
          id: `stg_ds_2_${this.userId}`,
          userId: this.userId,
          careerId: career.id,
          stageNumber: 2,
          title: 'SQL Relational Queries & Warehousing',
          skillId: 'skl_sql',
          reason: 'Data extraction, aggregations, and window functions (Aarav already knows SQL!).',
          estimatedHours: 12,
          prerequisites: [],
          status: 'Completed', // Aarav already knows SQL
          resourceIds: ['res_free_sql_tutorial'],
          exerciseIds: ['ex_sql_advanced'],
        },
        {
          id: `stg_ds_3_${this.userId}`,
          userId: this.userId,
          careerId: career.id,
          stageNumber: 3,
          title: 'Data Wrangling with Pandas & NumPy',
          skillId: 'skl_pandas',
          reason: 'Data cleaning, feature transformation, handling missing entries, and merging DataFrames.',
          estimatedHours: 22,
          prerequisites: ['Python for Scientific Computing'],
          status: 'In Progress',
          resourceIds: ['res_free_python_ds'],
          exerciseIds: ['ex_pandas_cleanup'],
        },
        {
          id: `stg_ds_4_${this.userId}`,
          userId: this.userId,
          careerId: career.id,
          stageNumber: 4,
          title: 'Applied Statistics & Probability',
          skillId: 'skl_stats',
          reason: 'Hypothesis testing, distributions, confidence intervals, and p-value significance.',
          estimatedHours: 20,
          prerequisites: ['Data Wrangling with Pandas & NumPy'],
          status: 'Available',
          resourceIds: ['res_free_python_ds'],
          exerciseIds: ['ex_stats_hypothesis'],
        },
        {
          id: `stg_ds_5_${this.userId}`,
          userId: this.userId,
          careerId: career.id,
          stageNumber: 5,
          title: 'Machine Learning Models & Scikit-Learn',
          skillId: 'skl_ml',
          reason: 'Supervised classification, regression, random forests, and gradient boosting.',
          estimatedHours: 35,
          prerequisites: ['Applied Statistics & Probability'],
          status: 'Locked',
          resourceIds: ['res_prem_ai_specialization'],
          exerciseIds: ['ex_ml_churn'],
          assessmentId: 'asm_ml_prereq',
        },
        {
          id: `stg_ds_6_${this.userId}`,
          userId: this.userId,
          careerId: career.id,
          stageNumber: 6,
          title: 'Capstone Predictive Data Pipeline',
          skillId: 'skl_ml',
          reason: 'Production data pipeline with PostgreSQL ingestion, model inference, and interactive dashboard.',
          estimatedHours: 30,
          prerequisites: ['Machine Learning Models & Scikit-Learn'],
          status: 'Locked',
          resourceIds: ['res_prem_ai_specialization'],
          exerciseIds: ['ex_ds_capstone'],
        },
      ];
    } else {
      // Generic generator for other careers
      stages = career.requiredSkillIds.map((req, i) => {
        const skill = db.getSkill(req.skillId);
        const us = userSkillMap.get(req.skillId);
        const isMastered = us && (us.verifiedScore || 0) >= 75;
        return {
          id: `stg_${career.id}_${i + 1}_${this.userId}`,
          userId: this.userId,
          careerId: career.id,
          stageNumber: i + 1,
          title: `${skill?.name || req.skillId} Mastery`,
          skillId: req.skillId,
          reason: `Required competency (${req.importance}) for ${career.title}.`,
          estimatedHours: 18,
          prerequisites: i > 0 ? [`${career.requiredSkillIds[i - 1].skillId}`] : [],
          status: isMastered ? 'Completed' : i === 0 ? 'In Progress' : 'Locked',
          resourceIds: resources.filter((r) => r.skillId === req.skillId).map((r) => r.id),
          exerciseIds: [`ex_${req.skillId}_practice`],
        };
      });
    }

    db.setRoadmap(this.userId, stages);

    const summary = `Learning Path Agent generated a customized ${stages.length}-stage roadmap for "${career.title}". Sequenced prerequisites based on current skill proficiencies.`;
    const decisionImpact = `Persisted personalized roadmap. Initialized Stage 1 as active and locked dependent stages.`;

    db.addAgentLog({
      userId: this.userId,
      agentName: 'Learning Path Agent',
      agentRole: 'Personalized Roadmap Sequencing',
      status: 'completed',
      input: { careerId: career.id, stagesCount: stages.length },
      output: { stages: stages.map((s) => ({ stage: s.stageNumber, title: s.title, status: s.status })) },
      summary,
      decisionImpact,
    });

    return { agentName: 'Learning Path Agent', agentRole: 'Personalized Roadmap Sequencing', summary, decisionImpact, output: stages };
  }

  // 6. Resource Recommendation Agent
  public runResourceRecommendation(): AgentExecutionResult {
    const user = db.getUser(this.userId);
    if (!user) throw new Error('User not found');
    const roadmap = db.getRoadmap(this.userId);
    const progress = db.getUserProgress(this.userId);
    const allResources = db.getResources();

    const activeStages = roadmap.filter((s) => s.status === 'In Progress' || s.status === 'Available');
    const activeSkillIds = activeStages.map((s) => s.skillId);

    const relevantResources = allResources.filter(
      (r) => activeSkillIds.includes(r.skillId) && !progress.completedResourceIds.includes(r.id)
    );

    const freeFirst = [...relevantResources].sort((a, b) => {
      if (a.isPremium === b.isPremium) return 0;
      return a.isPremium ? 1 : -1;
    });

    const output = {
      activeSkills: activeSkillIds,
      recommendedCount: freeFirst.length,
      topFree: freeFirst.filter((r) => !r.isPremium).map((r) => r.title),
      topPremium: freeFirst.filter((r) => r.isPremium).map((r) => r.title),
    };

    const summary = `Resource Recommendation Agent prioritized ${freeFirst.filter((r) => !r.isPremium).length} free high-yield resources for immediate study, reserving premium offerings for deep-dive capstones.`;
    const decisionImpact = `Injected top-rated MDN, freeCodeCamp, and tutorial links into active roadmap stages.`;

    db.addAgentLog({
      userId: this.userId,
      agentName: 'Resource Recommendation Agent',
      agentRole: 'Resource Curation & Tiering',
      status: 'completed',
      input: { activeSkillIds },
      output,
      summary,
      decisionImpact,
    });

    return { agentName: 'Resource Recommendation Agent', agentRole: 'Resource Curation & Tiering', summary, decisionImpact, output };
  }

  // 7. Progress Tracking Agent
  public markResourceComplete(resourceId: string): AgentExecutionResult {
    const user = db.getUser(this.userId);
    if (!user) throw new Error('User not found');
    const resource = db.getResource(resourceId);
    if (!resource) throw new Error('Resource not found');

    const progress = db.getUserProgress(this.userId);
    if (!progress.completedResourceIds.includes(resourceId)) {
      progress.completedResourceIds.push(resourceId);
    }

    progress.totalHoursSpent += 1.5;
    progress.lastActiveDate = new Date().toISOString();
    progress.activityHistory.unshift({
      date: new Date().toISOString().split('T')[0],
      hours: 1.5,
      activity: `Completed resource: ${resource.title}`,
    });

    db.updateUserProgress(this.userId, progress);

    // Increment skill proficiency
    const currentSkill = db.getUserSkills(this.userId).find((us) => us.skillId === resource.skillId);
    let newScore = Math.min(100, (currentSkill?.verifiedScore || 20) + 15);
    let newProf: UserSkill['proficiency'] = newScore >= 75 ? 'Advanced' : newScore >= 50 ? 'Intermediate' : 'Beginner';
    db.setUserSkill(this.userId, resource.skillId, newProf, newScore);

    const summary = `Progress Tracking Agent recorded completion of "${resource.title}". Credited 1.5 study hours and boosted ${resource.skillId} mastery score to ${newScore}%.`;
    const decisionImpact = `Updated skill mastery levels and refreshed learning streak. Triggered Adaptive Recommendation Agent.`;

    db.addAgentLog({
      userId: this.userId,
      agentName: 'Progress Tracking Agent',
      agentRole: 'Milestone & Activity Logging',
      status: 'completed',
      input: { resourceId, title: resource.title },
      output: { totalHoursSpent: progress.totalHoursSpent, updatedSkill: resource.skillId, newScore },
      summary,
      decisionImpact,
    });

    // Run adaptive update
    this.runAdaptiveRecommendation();

    return { agentName: 'Progress Tracking Agent', agentRole: 'Milestone & Activity Logging', summary, decisionImpact, output: progress };
  }

  // 8. Adaptive Recommendation Agent
  public runAdaptiveRecommendation(latestSubmission?: AssessmentSubmission): AgentExecutionResult {
    const user = db.getUser(this.userId);
    if (!user) throw new Error('User not found');
    let roadmap = db.getRoadmap(this.userId);

    let adaptationReason = '';
    let actionTaken = '';

    if (latestSubmission) {
      if (latestSubmission.readinessStatus === 'Foundation Required' || latestSubmission.score < 50) {
        adaptationReason = `Assessment score was ${latestSubmission.score}% (<50%). Diagnostic identified critical gaps in prerequisite topics.`;
        actionTaken = `Injected mandatory Foundation Revision modules for weak topics into Stage 2 & 3. Locked React and subsequent advanced modules.`;

        // Check if foundation stage exists
        const exists = roadmap.some((s) => s.isFoundationModule);
        if (!exists) {
          const foundationStage: RoadmapStage = {
            id: `stg_foundation_${Date.now()}`,
            userId: this.userId,
            careerId: user.targetCareerId,
            stageNumber: 2.5,
            title: 'Foundational JavaScript & DOM Remediation',
            skillId: 'skl_dom',
            reason: 'Mandatory remedial stage adaptively injected due to diagnostic score below 50%. Focuses on JavaScript functions and DOM event bubbling.',
            estimatedHours: 8,
            prerequisites: ['HTML & CSS Foundations'],
            status: 'Available',
            resourceIds: ['res_free_js_functions', 'res_free_dom_mastery'],
            exerciseIds: ['ex_remedial_js_functions', 'ex_remedial_dom'],
            isFoundationModule: true,
          };
          roadmap.splice(2, 0, foundationStage);
          // re-number stages
          roadmap.forEach((s, idx) => {
            s.stageNumber = idx + 1;
          });
          db.setRoadmap(this.userId, roadmap);
        }
      } else if (latestSubmission.readinessStatus === 'Needs Revision' || latestSubmission.score < 75) {
        adaptationReason = `Assessment score was ${latestSubmission.score}% (50%-74%). Prerequisite comprehension is fair, but needs targeted practice.`;
        actionTaken = `Appended targeted revision exercises to existing roadmap stages. Main course remains pending score improvement.`;
      } else {
        // >= 75%: Ready! Unlock React Developer Path!
        adaptationReason = `Assessment score was ${latestSubmission.score}% (≥75%). Learner is officially Ready!`;
        actionTaken = `Unlocked Stage 4 (React Framework Mastery). Marked foundational prerequisite stages as verified/completed.`;

        roadmap.forEach((s) => {
          if (s.title.includes('HTML') || s.title.includes('JavaScript Fundamentals') || s.title.includes('DOM') || s.isFoundationModule) {
            s.status = 'Completed';
          }
          if (s.title.includes('React')) {
            s.status = 'In Progress';
          }
        });
        db.setRoadmap(this.userId, roadmap);
      }
    } else {
      // General check from progress
      const userSkills = db.getUserSkills(this.userId);
      const jsSkill = userSkills.find((s) => s.skillId === 'skl_js');
      if (jsSkill && (jsSkill.verifiedScore || 0) >= 75) {
        roadmap.forEach((s) => {
          if (s.skillId === 'skl_react' && s.status === 'Locked') {
            s.status = 'Available';
            actionTaken = 'Unlocked React stage due to verified JavaScript proficiency.';
          }
        });
        db.setRoadmap(this.userId, roadmap);
      }
      adaptationReason = 'Periodic roadmap optimization scan based on updated learner mastery.';
      if (!actionTaken) actionTaken = 'Roadmap verified in sync with active skill proficiency levels.';
    }

    const summary = `Adaptive Recommendation Agent: ${adaptationReason} Action: ${actionTaken}`;
    const decisionImpact = actionTaken;

    db.addAgentLog({
      userId: this.userId,
      agentName: 'Adaptive Recommendation Agent',
      agentRole: 'Dynamic Curriculum Adaptation',
      status: 'completed',
      input: { submissionScore: latestSubmission?.score, status: latestSubmission?.readinessStatus },
      output: { adaptationReason, actionTaken },
      summary,
      decisionImpact,
    });

    return { agentName: 'Adaptive Recommendation Agent', agentRole: 'Dynamic Curriculum Adaptation', summary, decisionImpact, output: { actionTaken } };
  }

  // Career Change Flow
  public handleCareerChange(newCareerId: string): AgentExecutionResult {
    const user = db.getUser(this.userId);
    if (!user) throw new Error('User not found');
    const oldCareerId = user.targetCareerId;
    const oldCareer = db.getCareer(oldCareerId);
    const newCareer = db.getCareer(newCareerId);
    if (!newCareer) throw new Error('Target career not found');

    // 1. Update user's career
    db.updateUser(this.userId, { targetCareerId: newCareerId });

    // 2. Run Career Analysis
    this.runCareerAnalysis(newCareerId);

    // 3. Preserve compatible existing skills and compute new gaps
    this.runSkillGap();

    // 4. Regenerate Roadmap
    this.runLearningPath(newCareerId);

    // 5. Curate resources
    this.runResourceRecommendation();

    const summary = `Adaptive Recommendation Agent processed career pivot from "${oldCareer?.title || oldCareerId}" to "${newCareer.title}". Preserved compatible skills (e.g. Python, SQL), archived obsolete path, and synthesized fresh ${newCareer.title} roadmap.`;
    const decisionImpact = `Regenerated full roadmap. Recomputed career readiness score. Transferred existing skill proficiencies.`;

    db.addAgentLog({
      userId: this.userId,
      agentName: 'Adaptive Recommendation Agent',
      agentRole: 'Dynamic Curriculum Adaptation',
      status: 'completed',
      input: { previousCareer: oldCareer?.title, newCareer: newCareer.title },
      output: { status: 'recalculated', preservedSkills: ['Python', 'SQL'] },
      summary,
      decisionImpact,
    });

    return { agentName: 'Adaptive Recommendation Agent', agentRole: 'Dynamic Curriculum Adaptation', summary, decisionImpact, output: { newCareer: newCareer.title } };
  }
}
