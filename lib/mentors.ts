import { MentorProfile } from './types';

export const AVAILABLE_MENTORS: MentorProfile[] = [
  {
    id: 'mnt_alex',
    name: 'Alex Rivera',
    title: 'Principal Full-Stack Architect',
    role: 'Full-Stack Architecture & Systems',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    specialties: ['React 19 & Next.js', 'Node.js & Express', 'REST & WebSockets', 'PostgreSQL & Relational Data', 'System Design'],
    bio: 'Lead architect with 12+ years designing distributed web systems and reactive frontends. Focuses on scalable patterns, clean architecture, and modular code.',
    personality: 'Pragmatic, systems-oriented, clear. Demystifies async runtimes, state propagation, and full-stack integration.',
    greeting: 'Hello! I am Alex Rivera, your Full-Stack Architecture Mentor. Whether you are debugging component re-renders, structuring backend endpoints, or designing SQL schemas, I am here to help you build production-ready applications with confidence.',
    tagline: 'Build resilient, scalable full-stack web applications with architectural rigor.',
    badgeColor: 'blue',
  },
  {
    id: 'mnt_sophia',
    name: 'Dr. Sophia Chen',
    title: 'Lead AI Scientist & ML Researcher',
    role: 'Artificial Intelligence & Data Science',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    specialties: ['Python & Vectorization', 'Pandas & NumPy', 'Machine Learning Models', 'Feature Engineering', 'Statistical Analysis'],
    bio: 'Ph.D. in Computer Science with a passion for pedagogy. Specializes in turning complex mathematics and machine learning algorithms into practical code.',
    personality: 'Insightful, analytical, encouraging. Breaks down matrix operations, cost functions, and predictive pipelines into clear mental models.',
    greeting: 'Welcome! I am Dr. Sophia Chen, your AI & Data Science Mentor. Let us explore datasets, master analytical foundations, and build machine learning solutions from first principles.',
    tagline: 'Master machine learning models, statistical inference, and modern data science.',
    badgeColor: 'purple',
  },
  {
    id: 'mnt_marcus',
    name: 'Marcus Vance',
    title: 'Principal Design Technologist',
    role: 'Frontend Engineering & UI/UX Design',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    specialties: ['Modern React & Hooks', 'Tailwind CSS & Styling', 'WCAG Accessibility (a11y)', 'Animation & Micro-interactions', 'Responsive Layouts'],
    bio: 'Design system specialist who bridges creative UI design and high-performance frontend code. Obsessed with accessibility, fluid micro-interactions, and user happiness.',
    personality: 'Creative, empathetic, detail-focused. Helps you write clean declarative UI components that look visually stunning and feel effortless to navigate.',
    greeting: 'Hey there! I am Marcus Vance, your Frontend & UI/UX Mentor. Let’s make sure your user interfaces are not just functional, but delightfully accessible, responsive, and polished to perfection.',
    tagline: 'Craft fluid, accessible, and responsive user interfaces with modern React.',
    badgeColor: 'cyan',
  },
  {
    id: 'mnt_elena',
    name: 'Elena Rostova',
    title: 'Staff Cloud & Platform Engineer',
    role: 'Cloud Infrastructure & DevOps',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    specialties: ['Docker & Containers', 'CI/CD Pipelines', 'Cloud Deployments', 'API Security & OAuth', 'Observability & Monitoring'],
    bio: 'Veteran platform engineer dedicated to continuous delivery, container orchestration, zero-downtime releases, and defensive cloud security.',
    personality: 'Direct, methodical, security-conscious. Champions automated test suites, clean environments, and reliable deployment practices.',
    greeting: 'Greetings! I am Elena Rostova, your Cloud & DevOps Mentor. Writing working code is just step one; let’s make sure your code builds reliably, tests thoroughly, and ships securely to production.',
    tagline: 'Automate your deployments, master cloud infrastructure, and build resilient systems.',
    badgeColor: 'emerald',
  },
  {
    id: 'mnt_david',
    name: 'David Park',
    title: 'Director of Tech Talent & Career Coach',
    role: 'Career Strategy & Technical Interviews',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    specialties: ['Technical Coding Interviews', 'Portfolio Reviews', 'Resume Optimization', 'Behavioral Question Prep', 'Career Roadmapping'],
    bio: 'Former VP of Engineering and hiring director who has evaluated over 1,000 engineering candidates. Passionate about helping learners translate skills into dream jobs.',
    personality: 'Inspiring, strategic, motivational. Focuses on articulating problem-solving clarity, showing portfolio impact, and acing hiring loops.',
    greeting: 'Hello! I am David Park, your Career & Interview Coach. My goal is to help you stand out in competitive job markets, showcase your real projects, and tackle tech interviews with total confidence.',
    tagline: 'Turn your skills into standout portfolio projects and conquer technical interviews.',
    badgeColor: 'amber',
  },
];

export const DEFAULT_MENTOR = AVAILABLE_MENTORS[0];

export function getMentor(id?: string | null): MentorProfile {
  if (!id) return DEFAULT_MENTOR;
  return AVAILABLE_MENTORS.find((m) => m.id === id) || DEFAULT_MENTOR;
}
