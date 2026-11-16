-- ==============================================================================
-- PROMPTWARS / SKILLPATH AI - SUPABASE SCHEMA & MIGRATION
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'learner',
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  education TEXT DEFAULT '',
  experience TEXT DEFAULT '',
  target_career_id TEXT DEFAULT 'car_fullstack',
  weekly_hours INTEGER DEFAULT 15,
  preferred_style TEXT DEFAULT 'Hands-on projects & videos',
  streak_days INTEGER DEFAULT 1,
  subscription_tier TEXT DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    avatar_url,
    target_career_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'),
    COALESCE(NEW.raw_user_meta_data->>'target_career_id', 'car_fullstack')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. USER SKILLS TABLE
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  proficiency TEXT NOT NULL DEFAULT 'Beginner',
  verified_score INTEGER,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- 5. USER CERTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.user_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  date TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. USER TOPIC PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.user_topic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed', -- 'completed' | 'skipped' | 'study'
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id, topic_id)
);

-- 7. USER PROGRESS & VELOCITY TABLE
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_stage_id TEXT DEFAULT 'stage_1',
  overall_progress_pct INTEGER DEFAULT 0,
  weekly_goal_hours INTEGER DEFAULT 15,
  hours_logged_this_week INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 1,
  last_active_date TIMESTAMPTZ DEFAULT NOW()
);

-- 8. USER PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.user_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skills_used TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'Completed',
  github_url TEXT,
  live_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles can be viewed by owner"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Skills Policies
CREATE POLICY "Users manage own skills"
  ON public.user_skills FOR ALL
  USING (auth.uid() = user_id);

-- Certifications Policies
CREATE POLICY "Users manage own certifications"
  ON public.user_certifications FOR ALL
  USING (auth.uid() = user_id);

-- Topic Progress Policies
CREATE POLICY "Users manage own topic progress"
  ON public.user_topic_progress FOR ALL
  USING (auth.uid() = user_id);

-- Progress Policies
CREATE POLICY "Users manage own progress"
  ON public.user_progress FOR ALL
  USING (auth.uid() = user_id);

-- Projects Policies
CREATE POLICY "Users manage own projects"
  ON public.user_projects FOR ALL
  USING (auth.uid() = user_id);

-- ==============================================================================
-- SCHEMA READY!
-- ==============================================================================
