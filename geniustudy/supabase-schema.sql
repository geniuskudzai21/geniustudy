-- ============================================================
-- GENIUSTUDY — Full Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      text UNIQUE,
  display_name  text,
  avatar_url    text,
  xp            integer NOT NULL DEFAULT 0,
  level         integer NOT NULL DEFAULT 1,
  streak_days   integer NOT NULL DEFAULT 0,
  last_studied  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         text NOT NULL,
  source_type   text NOT NULL CHECK (source_type IN ('pdf','docx','pptx','txt','paste')),
  raw_text      text,
  html_content  text,
  word_count    integer NOT NULL DEFAULT 0,
  file_url      text,
  is_favourite  boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own documents" ON public.documents;
CREATE POLICY "Users can CRUD own documents"
  ON public.documents FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- USER PREFERENCES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  theme             text NOT NULL DEFAULT 'dark',
  font_family       text NOT NULL DEFAULT 'serif',
  font_size         integer NOT NULL DEFAULT 18,
  line_height       real NOT NULL DEFAULT 1.7,
  reading_width     text NOT NULL DEFAULT 'medium',
  tts_voice         text,
  tts_speed         real NOT NULL DEFAULT 1.0,
  tts_pitch         real NOT NULL DEFAULT 1.0,
  tts_volume        real NOT NULL DEFAULT 1.0,
  tts_highlight     text NOT NULL DEFAULT 'sentence',
  ambient_preset    text NOT NULL DEFAULT 'none',
  ambient_volume    real NOT NULL DEFAULT 0.4,
  pomodoro_enabled  boolean NOT NULL DEFAULT false,
  pomodoro_focus    integer NOT NULL DEFAULT 25,
  pomodoro_break    integer NOT NULL DEFAULT 5,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage own preferences"
  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- STUDY SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_id   uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  started_at    timestamptz NOT NULL DEFAULT now(),
  ended_at      timestamptz,
  duration_secs integer,
  xp_earned     integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own sessions" ON public.study_sessions;
CREATE POLICY "Users can manage own sessions"
  ON public.study_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- FLASHCARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.flashcards (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_id   uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  question      text NOT NULL,
  answer        text NOT NULL,
  ease_factor   real NOT NULL DEFAULT 2.5,
  interval_days integer NOT NULL DEFAULT 0,
  repetitions   integer NOT NULL DEFAULT 0,
  next_review   timestamptz NOT NULL DEFAULT now(),
  last_quality  integer,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own flashcards" ON public.flashcards;
CREATE POLICY "Users can manage own flashcards"
  ON public.flashcards FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- QUIZ RESULTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_id   uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  score         integer NOT NULL,
  total         integer NOT NULL,
  percentage    real NOT NULL,
  time_secs     integer,
  questions     jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own quiz results" ON public.quiz_results;
CREATE POLICY "Users can manage own quiz results"
  ON public.quiz_results FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- HIGHLIGHTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.highlights (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_id   uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  text          text NOT NULL,
  color         text NOT NULL DEFAULT '#FFD700',
  note          text,
  char_start    integer NOT NULL,
  char_end      integer NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own highlights" ON public.highlights;
CREATE POLICY "Users can manage own highlights"
  ON public.highlights FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_id   uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  role          text NOT NULL CHECK (role IN ('user','assistant')),
  content       text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own chat messages" ON public.chat_messages;
CREATE POLICY "Users can manage own chat messages"
  ON public.chat_messages FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
