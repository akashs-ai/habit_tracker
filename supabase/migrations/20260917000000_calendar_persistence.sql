-- ============================================================================
-- Migration: 20260917000000_calendar_persistence.sql
-- LifeRPG Phase E: Authoritative, user-scoped, realtime-synchronized Calendar Events
-- ============================================================================

-- 1. Safely adapt public.calendar_events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  all_day BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL DEFAULT 'other',
  color TEXT DEFAULT '#6C63FF',
  habit_id UUID REFERENCES public.habits(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure all required columns exist with idempotent ALTER TABLE statements
ALTER TABLE public.calendar_events 
  ADD COLUMN IF NOT EXISTS event_date DATE,
  ADD COLUMN IF NOT EXISTS start_time_text TEXT,
  ADD COLUMN IF NOT EXISTS end_time_text TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS repeat_rule TEXT,
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS subtasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS google_event_id TEXT,
  ADD COLUMN IF NOT EXISTS is_auto_task BOOLEAN NOT NULL DEFAULT false;

-- Allow start_time and end_time to be nullable for all-day events or local-clock-only events
ALTER TABLE public.calendar_events ALTER COLUMN start_time DROP NOT NULL;
ALTER TABLE public.calendar_events ALTER COLUMN end_time DROP NOT NULL;

-- Staged backfill: safely populate event_date from existing start_time or created_at before enforcing NOT NULL
UPDATE public.calendar_events
SET event_date = COALESCE(
  (start_time AT TIME ZONE 'UTC')::DATE,
  (created_at AT TIME ZONE 'UTC')::DATE,
  CURRENT_DATE
)
WHERE event_date IS NULL;

-- Staged backfill: safely populate start_time_text and end_time_text from legacy timestamps if missing
UPDATE public.calendar_events
SET start_time_text = TO_CHAR(start_time AT TIME ZONE 'UTC', 'HH12:MI AM')
WHERE start_time_text IS NULL AND start_time IS NOT NULL AND all_day = false;

UPDATE public.calendar_events
SET end_time_text = TO_CHAR(end_time AT TIME ZONE 'UTC', 'HH12:MI AM')
WHERE end_time_text IS NULL AND end_time IS NOT NULL AND all_day = false;

-- Now safely enforce DEFAULT and NOT NULL on event_date
ALTER TABLE public.calendar_events 
  ALTER COLUMN event_date SET DEFAULT CURRENT_DATE,
  ALTER COLUMN event_date SET NOT NULL;

-- Replace check constraint to allow nullable timestamps
ALTER TABLE public.calendar_events DROP CONSTRAINT IF EXISTS check_event_dates;
ALTER TABLE public.calendar_events 
  ADD CONSTRAINT check_event_dates 
  CHECK (end_time IS NULL OR start_time IS NULL OR end_time >= start_time);

-- Ensure task_id cascade behavior if foreign key exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'calendar_events_task_id_fkey'
  ) THEN
    ALTER TABLE public.calendar_events DROP CONSTRAINT calendar_events_task_id_fkey;
    ALTER TABLE public.calendar_events 
      ADD CONSTRAINT calendar_events_task_id_fkey 
      FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'calendar_events_habit_id_fkey'
  ) THEN
    ALTER TABLE public.calendar_events DROP CONSTRAINT calendar_events_habit_id_fkey;
    ALTER TABLE public.calendar_events 
      ADD CONSTRAINT calendar_events_habit_id_fkey 
      FOREIGN KEY (habit_id) REFERENCES public.habits(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 2. Indexes for fast user queries, date lookups, and external sync
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id 
  ON public.calendar_events(user_id);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date 
  ON public.calendar_events(user_id, event_date);

CREATE INDEX IF NOT EXISTS idx_calendar_events_task_id 
  ON public.calendar_events(task_id) 
  WHERE task_id IS NOT NULL;

-- Unique constraint index for Google event deduplication per user
DROP INDEX IF EXISTS public.idx_calendar_events_google_id;
CREATE UNIQUE INDEX IF NOT EXISTS idx_calendar_events_user_google_unique 
  ON public.calendar_events(user_id, google_event_id) 
  WHERE google_event_id IS NOT NULL;

-- 3. Row-Level Security: strictly enforce authenticated user ownership for ALL operations
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "calendar_events_owner_all" ON public.calendar_events;

CREATE POLICY "calendar_events_owner_all" ON public.calendar_events
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Realtime Configuration
ALTER TABLE public.calendar_events REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'calendar_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_events;
  END IF;
END $$;
