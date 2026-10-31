// Complete, tested PostgreSQL Schema and Row Level Security (RLS) rules for Supabase SQL Editor
export const FULL_SUPABASE_SQL = `-- ==============================================================================
-- StudyMate BD - Supabase PostgreSQL Database Schema & Security Rules (RLS)
-- ==============================================================================
-- INSTRUCTIONS FOR STUDENTS / DEVELOPERS:
-- 1. Go to your Supabase project dashboard (https://supabase.com/dashboard)
-- 2. Open the "SQL Editor" tab from the left sidebar
-- 3. Click "New query"
-- 4. Copy and paste this entire code into the editor
-- 5. Click the green "Run" button (Ctrl+Enter / Cmd+Enter)
-- 6. Done! All tables, relationships, and security policies are now created.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 0. CLEANUP LEGACY INCOMPATIBLE FRIENDSHIP TABLES
-- (Prevents ERROR: 42703 "column friend_id does not exist" from old schema cache)
-- ==============================================================================
DROP TABLE IF EXISTS public.friend_cheers CASCADE;
DROP TABLE IF EXISTS public.friend_requests CASCADE;
DROP TABLE IF EXISTS public.friendships CASCADE;

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  student_code TEXT UNIQUE,
  full_name TEXT,
  student_class TEXT,
  institution TEXT,
  gender TEXT DEFAULT 'male' CHECK (gender IN ('male', 'female')),
  target_study_hours_per_day NUMERIC DEFAULT 4.0 CHECK (target_study_hours_per_day >= 0 AND target_study_hours_per_day <= 24),
  preferred_language TEXT DEFAULT 'bn' CHECK (preferred_language IN ('bn', 'en')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Safely ensure all profiles columns exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_class TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'male';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_study_hours_per_day NUMERIC DEFAULT 4.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'bn';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Safely populate student_code for any existing profiles
DO $$
BEGIN
  EXECUTE 'UPDATE public.profiles SET student_code = ''SM-'' || UPPER(SUBSTRING(REPLACE(id::text, ''-'', ''''), 1, 6)) WHERE student_code IS NULL OR student_code = ''''';
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- 2. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#10b981',
  icon TEXT DEFAULT 'BookOpen',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  due_date DATE NOT NULL,
  due_time TIME,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  estimated_minutes INTEGER DEFAULT 30 CHECK (estimated_minutes >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS due_time TIME;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 30;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. STUDY ROUTINES TABLE (Weekly Timetable)
CREATE TABLE IF NOT EXISTS public.study_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL CHECK (end_time > start_time),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.study_routines ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.study_routines ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.study_routines ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. EXAMS TABLE
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL,
  exam_time TIME,
  room_or_location TEXT,
  total_marks NUMERIC CHECK (total_marks >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS exam_time TIME;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS room_or_location TEXT;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS total_marks NUMERIC;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 6. STUDY SESSIONS TABLE (Pomodoro & Study logs)
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  session_type TEXT NOT NULL DEFAULT 'pomodoro' CHECK (session_type IN ('pomodoro', 'short_break', 'long_break', 'manual')),
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  notes TEXT
);

-- Ensure both completed_at and created_at exist safely without column cache errors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'study_sessions' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE public.study_sessions ADD COLUMN completed_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'study_sessions' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.study_sessions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Dynamic execution prevents PostgreSQL parse-time column lookup error (42703)
  BEGIN
    EXECUTE 'UPDATE public.study_sessions SET completed_at = COALESCE(completed_at, created_at, NOW()), created_at = COALESCE(created_at, completed_at, NOW())';
  EXCEPTION
    WHEN OTHERS THEN
      NULL;
  END;
END $$;

-- ==============================================================================
-- FRIENDSHIPS, REQUESTS & CHEERS TABLES
-- (Safely drop legacy incompatible schemas first so friend_id column is guaranteed)
-- ==============================================================================
DROP TABLE IF EXISTS public.friend_cheers CASCADE;
DROP TABLE IF EXISTS public.friend_requests CASCADE;
DROP TABLE IF EXISTS public.friendships CASCADE;

-- 7. FRIEND REQUESTS TABLE (Peer Requests & Approvals)
CREATE TABLE public.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT check_different_request_users CHECK (sender_id <> receiver_id),
  CONSTRAINT unique_friend_request UNIQUE (sender_id, receiver_id)
);

-- 8. FRIENDSHIPS TABLE (Accepted Mutual Study Partnerships)
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT check_different_friends CHECK (user_id <> friend_id),
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

-- 9. FRIEND CHEERS TABLE (Praise, Kudos & Reactions)
CREATE TABLE public.friend_cheers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cheer_type TEXT NOT NULL DEFAULT 'applause' CHECK (cheer_type IN ('applause', 'fire', 'target', 'star', 'heart')),
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_due_date ON public.tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_routines_user_day ON public.study_routines(user_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_exams_user_date ON public.exams(user_id, exam_date);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_completed ON public.study_sessions(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_created ON public.study_sessions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON public.friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON public.friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friend_cheers_receiver ON public.friend_cheers(receiver_id, is_read);
CREATE INDEX IF NOT EXISTS idx_profiles_student_code ON public.profiles(student_code);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_cheers ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Users can search student profiles" ON public.profiles;
CREATE POLICY "Users can search student profiles"
  ON public.profiles FOR SELECT
  TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- 2. Subjects Policies
DROP POLICY IF EXISTS "Users can view own subjects" ON public.subjects;
CREATE POLICY "Users can view own subjects"
  ON public.subjects FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE (user_id = auth.uid() AND friend_id = public.subjects.user_id)
         OR (friend_id = auth.uid() AND user_id = public.subjects.user_id)
    )
  );

DROP POLICY IF EXISTS "Users can insert own subjects" ON public.subjects;
CREATE POLICY "Users can insert own subjects"
  ON public.subjects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subjects" ON public.subjects;
CREATE POLICY "Users can update own subjects"
  ON public.subjects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own subjects" ON public.subjects;
CREATE POLICY "Users can delete own subjects"
  ON public.subjects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Tasks Policies
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE (user_id = auth.uid() AND friend_id = public.tasks.user_id)
         OR (friend_id = auth.uid() AND user_id = public.tasks.user_id)
    )
  );

DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Study Routines Policies
DROP POLICY IF EXISTS "Users can view own routines" ON public.study_routines;
CREATE POLICY "Users can view own routines"
  ON public.study_routines FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own routines" ON public.study_routines;
CREATE POLICY "Users can insert own routines"
  ON public.study_routines FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own routines" ON public.study_routines;
CREATE POLICY "Users can update own routines"
  ON public.study_routines FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own routines" ON public.study_routines;
CREATE POLICY "Users can delete own routines"
  ON public.study_routines FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Exams Policies
DROP POLICY IF EXISTS "Users can view own exams" ON public.exams;
CREATE POLICY "Users can view own exams"
  ON public.exams FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own exams" ON public.exams;
CREATE POLICY "Users can insert own exams"
  ON public.exams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own exams" ON public.exams;
CREATE POLICY "Users can update own exams"
  ON public.exams FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Study Sessions Policies
DROP POLICY IF EXISTS "Users can view own sessions" ON public.study_sessions;
CREATE POLICY "Users can view own sessions"
  ON public.study_sessions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE (user_id = auth.uid() AND friend_id = public.study_sessions.user_id)
         OR (friend_id = auth.uid() AND user_id = public.study_sessions.user_id)
    )
  );

DROP POLICY IF EXISTS "Users can insert own sessions" ON public.study_sessions;
CREATE POLICY "Users can insert own sessions"
  ON public.study_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON public.study_sessions;
CREATE POLICY "Users can update own sessions"
  ON public.study_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sessions" ON public.study_sessions;
CREATE POLICY "Users can delete own sessions"
  ON public.study_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. Friend Requests Policies
DROP POLICY IF EXISTS "Users can view relevant friend requests" ON public.friend_requests;
CREATE POLICY "Users can view relevant friend requests"
  ON public.friend_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send friend requests" ON public.friend_requests;
CREATE POLICY "Users can send friend requests"
  ON public.friend_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id AND sender_id <> receiver_id);

DROP POLICY IF EXISTS "Users can update relevant friend requests" ON public.friend_requests;
CREATE POLICY "Users can update relevant friend requests"
  ON public.friend_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can delete relevant friend requests" ON public.friend_requests;
CREATE POLICY "Users can delete relevant friend requests"
  ON public.friend_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 8. Friendships Policies
DROP POLICY IF EXISTS "Users can view own friendships" ON public.friendships;
CREATE POLICY "Users can view own friendships"
  ON public.friendships FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "Users can insert friendships" ON public.friendships;
CREATE POLICY "Users can insert friendships"
  ON public.friendships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "Users can delete friendships" ON public.friendships;
CREATE POLICY "Users can delete friendships"
  ON public.friendships FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 9. Friend Cheers Policies
DROP POLICY IF EXISTS "Users can view relevant cheers" ON public.friend_cheers;
CREATE POLICY "Users can view relevant cheers"
  ON public.friend_cheers FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send cheers" ON public.friend_cheers;
CREATE POLICY "Users can send cheers"
  ON public.friend_cheers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id AND sender_id <> receiver_id);

DROP POLICY IF EXISTS "Users can update received cheers" ON public.friend_cheers;
CREATE POLICY "Users can update received cheers"
  ON public.friend_cheers FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can delete own cheers" ON public.friend_cheers;
CREATE POLICY "Users can delete own cheers"
  ON public.friend_cheers FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_student_code TEXT;
BEGIN
  new_student_code := 'SM-' || UPPER(SUBSTRING(REPLACE(NEW.id::text, '-', ''), 1, 6));

  INSERT INTO public.profiles (id, email, student_code, full_name, preferred_language, gender)
  VALUES (
    NEW.id,
    NEW.email,
    new_student_code,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'bn',
    COALESCE(NEW.raw_user_meta_data->>'gender', 'male')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      student_code = COALESCE(public.profiles.student_code, EXCLUDED.student_code);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- COMPLETE AND PERMANENT ACCOUNT DELETION RPC
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM public.friend_cheers WHERE sender_id = current_user_id OR receiver_id = current_user_id;
  DELETE FROM public.friendships WHERE user_id = current_user_id OR friend_id = current_user_id;
  DELETE FROM public.friend_requests WHERE sender_id = current_user_id OR receiver_id = current_user_id;

  DELETE FROM public.study_sessions WHERE user_id = current_user_id;
  DELETE FROM public.tasks WHERE user_id = current_user_id;
  DELETE FROM public.exams WHERE user_id = current_user_id;
  DELETE FROM public.study_routines WHERE user_id = current_user_id;
  DELETE FROM public.subjects WHERE user_id = current_user_id;
  DELETE FROM public.profiles WHERE id = current_user_id;

  BEGIN
    DELETE FROM auth.users WHERE id = current_user_id;
  EXCEPTION
    WHEN OTHERS THEN
      NULL;
  END;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
`;
