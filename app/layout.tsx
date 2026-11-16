import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkillPath AI - Autonomous Adaptive Learning Platform',
  description: 'Learn only what you need before learning what you want. Autonomous multi-agent prerequisite diagnostics, personalized roadmaps, and adaptive curriculum remediation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
