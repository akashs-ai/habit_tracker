-- Migration: 20260916000000_goals_persistence.sql
-- Phase D: Goals & Milestones Realtime & Authoritative Schema Migration

-- 1. Ensure goals table has subtasks JSONB and presentation columns
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#6C63FF';
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'target';
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived'));
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS completed_tasks INT DEFAULT 0;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS total_tasks INT DEFAULT 1;

-- 2. Ensure goal_milestones table has notes and target_date columns
ALTER TABLE public.goal_milestones ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.goal_milestones ADD COLUMN IF NOT EXISTS target_date TEXT;

-- 3. Ensure Row Level Security (RLS) is enabled and policies exist
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;

-- 4. Ensure REPLICA IDENTITY FULL for Realtime DELETE events
ALTER TABLE public.goals REPLICA IDENTITY FULL;
ALTER TABLE public.goal_milestones REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'goals' AND policyname = 'goals_owner_all'
  ) THEN
    CREATE POLICY "goals_owner_all" ON public.goals
      FOR ALL USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Hardened goal milestones ownership policy:
-- Enforces both user_id = auth.uid() AND that the referenced goal belongs to auth.uid()
DROP POLICY IF EXISTS "goal_milestones_owner_all" ON public.goal_milestones;
CREATE POLICY "goal_milestones_owner_all" ON public.goal_milestones
  FOR ALL
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.goals g
      WHERE g.id = goal_id AND g.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.goals g
      WHERE g.id = goal_id AND g.user_id = auth.uid()
    )
  );

-- 5. Enable Supabase Realtime Replication for goals & milestones
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'goals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'goal_milestones'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.goal_milestones;
  END IF;
END $$;

-- 6. Atomic Subtask Toggle RPC (Concurrency Safe)
CREATE OR REPLACE FUNCTION public.toggle_goal_subtask(
  p_goal_id UUID,
  p_subtask_id TEXT,
  p_completed BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
  v_updated_subtasks JSONB;
  v_goal_row public.goals%ROWTYPE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- 1. Validate goal ownership and acquire row-level lock
  SELECT * INTO v_goal_row
  FROM public.goals
  WHERE id = p_goal_id
    AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Goal not found or access denied';
  END IF;

  -- 2. Transform the subtasks JSONB array atomically
  SELECT COALESCE(
    jsonb_agg(
      CASE 
        WHEN elem->>'id' = p_subtask_id THEN
          jsonb_set(
            elem, 
            '{completed}', 
            to_jsonb(
              CASE 
                WHEN p_completed IS NOT NULL THEN p_completed
                ELSE NOT COALESCE((elem->>'completed')::boolean, false)
              END
            )
          )
        ELSE elem
      END
    ),
    '[]'::jsonb
  ) INTO v_updated_subtasks
  FROM jsonb_array_elements(COALESCE(v_goal_row.subtasks, '[]'::jsonb)) AS elem;

  -- 3. Update only subtasks and updated_at
  UPDATE public.goals
  SET subtasks = v_updated_subtasks,
      updated_at = now()
  WHERE id = p_goal_id AND user_id = v_user_id
  RETURNING * INTO v_goal_row;

  RETURN to_jsonb(v_goal_row);
END;
$$;

REVOKE ALL ON FUNCTION public.toggle_goal_subtask(UUID, TEXT, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.toggle_goal_subtask(UUID, TEXT, BOOLEAN) TO authenticated;
