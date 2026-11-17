# SkillPath AI — Autonomous Adaptive Learning Platform

> **"Learn only what you need before learning what you want."**

**SkillPath AI** is a complete, production-grade, full-stack educational technology platform engineered to help learners transition into target careers through autonomous prerequisite diagnostics, adaptive curriculum sequencing, skill-gap analysis, and multi-agent AI collaboration.

---

## 🌟 Core Innovation

Traditional online learning forces all students through rigid, monolithic courses regardless of unaddressed prerequisite gaps. When a student struggles with foundational JavaScript (like functions, closures, or DOM bubbling), they fail React and abandon the career path entirely.

**SkillPath AI** enforces a fundamental pedagogical rule:
1. When a learner enrolls in a target course (e.g. *React Developer Path*), the platform first maps the required prerequisite competencies (HTML, CSS, JavaScript fundamentals, Functions, Arrays, Objects, DOM, and ES6+).
2. The learner completes a **Prerequisite Diagnostic Assessment**.
3. If the learner performs poorly in foundational topics (<50% score), the **Adaptive Recommendation Agent**:
   - Classifies the status as **Foundation Required**.
   - Locks the advanced course modules.
   - Dynamically injects free, targeted foundation tutorials and remedial exercises directly into the roadmap.
   - Enforces a reassessment gatekeeper.
4. When the learner reviews the targeted tutorials and retakes the diagnostic with an improved score (≥75%), the system automatically certifies them as **Ready**, skips obsolete introductory modules, and unlocks the main course.

---

## 🏗️ Multi-Agent AI Architecture

The system features **9 specialized AI agents** orchestrated by a central pipeline service (`AgentOrchestrator`):

```mermaid
flowchart TD
    User["Learner Profile & Credentials"] --> A1["1. Profile Analyzer Agent"]
    A1 --> A2["2. Career Analysis Agent"]
    A2 --> A3["3. Skill Gap Agent"]
    A3 --> A4["4. Assessment Agent"]
    A4 --> A5["5. Learning Path Agent"]
    A5 --> A6["6. Resource Recommendation Agent"]
    A6 --> A7["7. Progress Tracking Agent"]
    A7 --> A8["8. Adaptive Recommendation Agent"]
    A8 --> A9["9. AI Mentor Agent"]
```

| Agent Name | Role | Primary Responsibility |
| :--- | :--- | :--- |
| **1. Profile Analyzer Agent** | Learner Skill Normalization | Extracts and normalizes declared skills, analyzes certifications and projects, and calculates baseline study velocity. |
| **2. Career Analysis Agent** | Target Career Breakdown | Deconstructs target market roles into competency graphs and assigns prerequisite dependencies. |
| **3. Skill Gap Agent** | Deficiency & Readiness Scoring | Compares learner mastery against target standards; prioritizes critical, high, and medium gaps. |
| **4. Assessment Agent** | Diagnostic Evaluation | Evaluates diagnostic submissions, computes topic-level breakdowns, and classifies readiness into Ready, Needs Revision, or Foundation Required. |
| **5. Learning Path Agent** | Roadmap Sequencing | Synthesizes an 8-stage progressive roadmap respecting prerequisite constraints. |
| **6. Resource Recommendation Agent** | Resource Curation & Tiering | Prioritizes free high-yield tutorials (MDN, freeCodeCamp) first, reserving paid masterclasses for advanced subscribers. |
| **7. Progress Tracking Agent** | Milestone & Activity Logging | Credits study hours, detects improvement velocity, updates verified skill scores, and sustains streaks. |
| **8. Adaptive Recommendation Agent** | Dynamic Curriculum Adaptation | Dynamically modifies roadmaps: injects remedial modules on low scores, skips basics on high scores, and regenerates paths on career change. |
| **9. AI Mentor Agent** | Pedagogical Guidance | Answers student questions using real-time context (skills, gaps, latest score, roadmap stage) with direct action triggers. |

---

## 📊 Database Schema & Persistence

All records are persistently stored in `data/db.json` with atomic reads and writes in `lib/db.ts`:

- **Users**: `id`, `name`, `email`, `role` ('learner' \| 'admin'), `education`, `experience`, `targetCareerId`, `weeklyHours`, `streakDays`, `subscriptionTier`.
- **Skills**: `id`, `name`, `category` (Frontend, Backend, Database, DevOps, AI & Data), `description`, `importance`.
- **UserSkills**: `id`, `userId`, `skillId`, `proficiency` ('Not Started', 'Beginner', 'Intermediate', 'Advanced'), `verifiedScore`.
- **Careers**: `id`, `title`, `description`, `requiredSkillIds`, `estimatedDurationWeeks`, `averageSalary`, `category`.
- **Courses**: `id`, `title`, `description`, `difficulty`, `duration`, `isPremium`, `prerequisiteSkillIds`, `prerequisiteAssessmentId`, `learningObjectives`.
- **Assessments**: `id`, `title`, `courseId`, `targetSkillIds`, `passingScore` (75%), `questions` (topic, question, options, correctAnswer, explanation).
- **Submissions**: `id`, `userId`, `assessmentId`, `score`, `readinessStatus`, `topicScores`, `answers`, `recommendedResourceIds`.
- **RoadmapStages**: `id`, `userId`, `careerId`, `stageNumber`, `title`, `skillId`, `reason`, `estimatedHours`, `status` (Locked, Available, In Progress, Completed), `isFoundationModule`.
- **UserProgress**: `id`, `userId`, `completedResourceIds`, `totalHoursSpent`, `currentStreak`, `activityHistory`.
- **AgentLogs**: `id`, `userId`, `agentName`, `agentRole`, `timestamp`, `input`, `output`, `summary`, `decisionImpact`.
- **MentorMessages**: `id`, `userId`, `sender` ('user' \| 'mentor'), `text`, `actionSuggestion`, `timestamp`.

---

## 🔑 Authentication & Portals

SkillPath AI provides two dedicated access portals with full authentication:

| Portal | Role | Email | Password / OAuth | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Portal** | **Platform Administrator** | `admin@skillpath.ai` | `admin123` | Monitor student enrollments across all courses, inspect student profiles, review certifications, and manage curriculum catalog (Courses, Careers, Skills, Resources). |
| **Student Portal** | **Learner** | Student Email or **Google Sign-In** | Student Password / Google OAuth | Personalized roadmaps, course study topics, diagnostics, interactive quizzes, automated certificates, and AI mentoring. |

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node v24.19)
- npm `v9+`

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** (or the designated port) in your browser.

### 3. Build & Run Production Server
```bash
npm run build
npm run start
```

### 4. Run Automated Demo Flow Verification
```bash
npm run verify
```
This runs the automated 19-step simulation test script (`scripts/verify-flow.mjs`) verifying all user actions, assessment evaluations, and agent telemetry.

---

## 🎯 Core Features & Platform Walkthrough

### 1. Administrator Portal (`/admin`)
- **Login**: Navigate to `/login`, switch to the **Admin Portal** tab, and enter `admin@skillpath.ai` with password `admin123`.
- **Course Enrollments**: Live dashboard table showing how many students have enrolled in each course, completion counts, average class progress, and student avatars.
- **Student Directory**: Complete directory of registered students with search, course filtering, target careers, progress bars, certificate counts, and detailed student drawer inspection.
- **Curriculum Management**: Create, edit, and curate Careers, Courses, Skills, and Learning Resources.

### 2. Student Portal & Learning Path (`/dashboard`, `/courses`, `/roadmap`)
- **Sign Up / Sign In**: Register with email/password or use **Continue with Google** (via Supabase OAuth).
- **Personalized Dashboard**: Real-time competency radar, weekly velocity, and target career tracking.
- **Interactive Course Player**: Study curriculum topics, complete theory modules, watch video lessons, and take topic check quizzes.
- **Verifiable Certificates**: Direct client-side certificate generation with PNG downloads and landscape print formats.
- **Adaptive AI Mentor**: Pedagogical guidance and automated recommendations tailored to the student's active roadmap.

---

## 🤖 Connecting an LLM API Key (Optional)

SkillPath AI features a dual-engine architecture:
- By default, it operates with a **Realistic Contextual Fallback Engine** that analyzes learner skills, career targets, assessment scores, and roadmap stages without requiring external API keys.
- To connect a live LLM (Google Gemini or OpenAI), create a `.env.local` file:

```env
# Optional: Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here
```

When configured, `lib/llm/provider.ts` dynamically routes prompts to the live LLM with fallback protection.

---

## 🛡️ Known Limitations

- **Simulated Payment Gateway**: The Pro Subscription flow provides a functional 1-click demo upgrade to Pro and Enterprise tiers without connecting real Stripe or PayPal webhooks.
- **Demo Database**: Persistence is handled via an atomic JSON storage engine (`data/db.json`). For multi-server production clusters, replace `lib/db.ts` with PostgreSQL / Prisma ORM.
