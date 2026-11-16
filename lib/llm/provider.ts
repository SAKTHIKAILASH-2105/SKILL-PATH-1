import { User, Career, RoadmapStage, UserSkill, AssessmentSubmission, UserProgress } from '../types';

export interface MentorContext {
  user: User;
  career?: Career;
  skills: (UserSkill & { name: string })[];
  roadmap: RoadmapStage[];
  latestSubmission?: AssessmentSubmission;
  progress: UserProgress;
}

export interface MentorResponse {
  text: string;
  actionSuggestion?: {
    label: string;
    actionType: 'navigate' | 'update_roadmap' | 'take_assessment' | 'view_resource';
    payload?: string;
  };
}

export async function generateMentorResponse(
  userQuery: string,
  context: MentorContext
): Promise<MentorResponse> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      if (process.env.GEMINI_API_KEY) {
        return await callGeminiAPI(process.env.GEMINI_API_KEY, userQuery, context);
      }
    } catch (err) {
      console.warn('LLM API call failed, falling back to contextual engine:', err);
    }
  }

  // Realistic Contextual Fallback Engine
  return generateContextualFallback(userQuery, context);
}

async function callGeminiAPI(
  apiKey: string,
  query: string,
  context: MentorContext
): Promise<MentorResponse> {
  const prompt = `You are the AI Mentor on SkillPath AI, a personalized learning platform with the philosophy "Learn only what you need before learning what you want."
Learner Profile:
- Name: ${context.user.name}
- Target Career: ${context.career?.title || 'Not specified'}
- Current Skills: ${context.skills.map((s) => `${s.name} (${s.proficiency})`).join(', ')}
- Latest Assessment Score: ${context.latestSubmission ? `${context.latestSubmission.score}% (${context.latestSubmission.readinessStatus})` : 'None taken yet'}
- Roadmap Stages: ${context.roadmap.map((s) => `Stage ${s.stageNumber}: ${s.title} [${s.status}]`).join(' | ')}
- Weekly Hours: ${context.user.weeklyHours}h/week
- Streak: ${context.user.streakDays} days

Learner asks: "${query}"

Provide a warm, highly pedagogical, and encouraging answer strictly tailored to their profile and roadmap. Keep response to 2-3 concise paragraphs. Format with clean markdown.`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.statusText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from LLM');

  return { text };
}

function generateContextualFallback(
  query: string,
  context: MentorContext
): MentorResponse {
  const q = query.toLowerCase();
  const userName = context.user.name.split(' ')[0];
  const careerTitle = context.career?.title || 'Full Stack Developer';
  const latestScore = context.latestSubmission?.score;
  const latestStatus = context.latestSubmission?.readinessStatus;

  // 1. "What should I learn next?"
  if (q.includes('what should i learn next') || q.includes('learn next') || q.includes('next step') || q.includes('next topic')) {
    const activeStage = context.roadmap.find((s) => s.status === 'In Progress') || context.roadmap.find((s) => s.status === 'Available');
    if (activeStage) {
      return {
        text: `Hey ${userName}! Based on your current roadmap for **${careerTitle}**, your highest-priority next step is **${activeStage.title}** (Stage ${activeStage.stageNumber}).\n\n**Why this now?** ${activeStage.reason}\n\nRemember our core principle: *"Learn only what you need before learning what you want."* Completing this foundational stage unlocks subsequent advanced modules.`,
        actionSuggestion: {
          label: `Open ${activeStage.title}`,
          actionType: 'navigate',
          payload: '/roadmap',
        },
      };
    }
    return {
      text: `Great progress, ${userName}! You have completed all unlocked stages. To unlock your next modules, head over to your courses and verify your prerequisite readiness with a quick diagnostic!`,
      actionSuggestion: {
        label: 'View Course Catalog',
        actionType: 'navigate',
        payload: '/courses',
      },
    };
  }

  // 2. "Why do I need JavaScript before React?"
  if (q.includes('javascript before react') || q.includes('js before react') || (q.includes('why') && q.includes('react') && q.includes('javascript'))) {
    return {
      text: `That's a classic and essential question, ${userName}!\n\nReact is not a separate programming language—it is a UI library built entirely on modern JavaScript. Every single React component utilizes:\n\n1. **ES6 Array Methods**: Rendering lists in JSX requires \`.map()\`, \`.filter()\`, and \`.reduce()\`. Without understanding closures and immutability, state mutation bugs will plague your code.\n2. **Destructuring & Rest/Spread**: Passing props and updating object state relies directly on \`{ ...prevState, key: value }\`.\n3. **Event Bubbling & DOM Synthetic Events**: React's synthetic event system is an abstraction over standard DOM event delegation.\n4. **Asynchronous JS (Promises & async/await)**: Fetching API data in \`useEffect\` hooks requires understanding microtasks and race conditions.\n\nBy mastering JavaScript and DOM first, React becomes straightforward rather than magical!`,
      actionSuggestion: {
        label: 'Check React Readiness Diagnostic',
        actionType: 'take_assessment',
        payload: 'asm_react_prereq',
      },
    };
  }

  // 3. "Explain promises simply"
  if (q.includes('promise') || q.includes('async') || q.includes('explain promises')) {
    return {
      text: `Think of a **JavaScript Promise** like ordering a coffee at a busy café:\n\n1. **Pending**: When you pay the barista, they hand you a buzzer receipt. Your coffee isn't ready yet, but you have a guarantee that it is being processed.\n2. **Fulfilled (Resolved)**: The buzzer rings! You pick up your hot coffee. In code, this triggers \`.then((coffee) => drink(coffee))\` or your \`await\` expression returns the value.\n3. **Rejected**: If the café ran out of oat milk, the barista apologizes. In code, this triggers \`.catch((error) => handleError(error))\`.\n\nPromises keep your web app smooth and responsive by allowing heavy tasks (like fetching data from a database) to run in the background without freezing the browser UI!`,
      actionSuggestion: {
        label: 'Practice Async Exercises',
        actionType: 'view_resource',
        payload: 'res_free_es6_promises',
      },
    };
  }

  // 4. "I scored poorly in my assessment. What should I do?"
  if (q.includes('scored poorly') || q.includes('failed') || q.includes('low score') || q.includes('poor score') || (q.includes('assessment') && q.includes('what should i do'))) {
    const weakTopics = context.latestSubmission
      ? Object.entries(context.latestSubmission.topicScores)
          .filter(([, stats]) => stats.percentage < 60)
          .map(([topic]) => topic)
      : ['JavaScript Functions', 'DOM Manipulation'];

    return {
      text: `Don't be discouraged, ${userName}! A low diagnostic score is not a failure—it is the most valuable diagnostic signal you can receive.\n\nOur **Adaptive Recommendation Agent** detected specific weaknesses in:\n${weakTopics.map((t) => `• **${t}**`).join('\n')}\n\nInstead of wasting 50 hours struggling inside an advanced course with shaky foundations, we automatically injected free targeted foundation tutorials directly into your roadmap.\n\n**Action Plan:**\n1. Review the recommended free tutorials for those weak topics.\n2. Complete the short interactive practice exercises.\n3. Retake the diagnostic assessment to verify mastery. Once you score ≥75%, the main course automatically unlocks!`,
      actionSuggestion: {
        label: 'Review Foundation Modules in Roadmap',
        actionType: 'navigate',
        payload: '/roadmap',
      },
    };
  }

  // 5. "Why did my roadmap change?"
  if (q.includes('why did my roadmap change') || q.includes('roadmap changed') || q.includes('roadmap change')) {
    return {
      text: `SkillPath AI utilizes an active **Adaptive Recommendation Agent** that continuously aligns your learning sequence with your real-time performance and goals.\n\nYour roadmap adjusts when:\n1. **Diagnostic Assessment Results**: If you score below 75% on prerequisite topics (such as DOM or JS Functions), the agent dynamically injects prerequisite foundation modules to prevent frustration.\n2. **Career Goal Updates**: When you pivot careers (e.g. from Full Stack to Data Science), existing compatible skills (like Python or SQL) are preserved, while irrelevant stages are archived and career-critical skills are scheduled.\n3. **Verified Skill Completion**: When you score 75%+ or complete lessons, basic prerequisite stages are marked complete and the next tier automatically unlocks!\n\nThis guarantees you never waste time studying what you already know or jump into complex topics without prerequisites!`,
      actionSuggestion: {
        label: 'Inspect Agent Activity Logs',
        actionType: 'navigate',
        payload: '/agents',
      },
    };
  }

  // 6. "Recommend a project for my current skill level"
  if (q.includes('recommend a project') || q.includes('project idea') || q.includes('portfolio project')) {
    const hasPython = context.skills.some((s) => s.name === 'Python' && s.proficiency !== 'Not Started');
    const hasJS = context.skills.some((s) => s.name === 'JavaScript' && s.proficiency !== 'Not Started');

    if (careerTitle === 'Data Scientist') {
      return {
        text: `For your current **Data Science** progression with **Python & SQL**, here is an impactful real-world portfolio project:\n\n### 📊 **E-Commerce Customer Churn Predictor**\n- **Objective**: Ingest simulated user transaction logs from PostgreSQL into Pandas.\n- **Key Skills**: SQL window functions, exploratory data analysis with seaborn, feature engineering, and logistic regression.\n- **Deliverable**: An interactive Streamlit dashboard showing high-risk churn cohorts with actionable retention insights.`,
        actionSuggestion: {
          label: 'View Learning Resources',
          actionType: 'navigate',
          payload: '/resources',
        },
      };
    }

    return {
      text: `For your **${careerTitle}** path at your current stage, here is an ideal targeted project:\n\n### ⚡ **Interactive Task Management & Habit Tracker**\n- **Objective**: Build a responsive browser-based productivity app using semantic HTML5, modern CSS flexbox, and vanilla JavaScript.\n- **Prerequisites Exercised**: DOM element creation, local storage persistence, synthetic event delegation, and filter callbacks.\n- **Bonus Milestone**: Refactor the state logic into reusable components once you unlock React!\n\nThis project directly proves your DOM and JavaScript fundamentals to future hiring managers.`,
      actionSuggestion: {
        label: 'View Project Details',
        actionType: 'navigate',
        payload: '/resources',
      },
    };
  }

  // 7. General fallback
  return {
    text: `Hello ${userName}! As your AI Mentor for **${careerTitle}**, I am tracking your learning journey in real time.\n\nYou have an active **${context.user.streakDays}-day learning streak** and have logged **${context.progress.totalHoursSpent} hours** of study.\n\n${latestScore !== undefined ? `Your latest assessment score was **${latestScore}% (${latestStatus})**.` : 'You have not taken your course readiness diagnostic yet.'}\n\nFeel free to ask me:\n- *"What should I learn next?"*\n- *"Why do I need JavaScript before React?"*\n- *"Explain promises simply"*\n- *"Why did my roadmap change?"*\n- *"Recommend a project for my skill level"*`,
    actionSuggestion: {
      label: 'Explore Roadmap',
      actionType: 'navigate',
      payload: '/roadmap',
    },
  };
}
