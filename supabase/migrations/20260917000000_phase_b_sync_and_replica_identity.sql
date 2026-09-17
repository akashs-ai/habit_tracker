-- ============================================================================
-- MIGRATION: 20260917000000_phase_b_sync_and_replica_identity.sql
-- Phase B: Core Profile, Habits, Completions, Streak, XP, Level, and Momentum Point Synchronization
-- ============================================================================

-- 1. REALTIME REPLICA IDENTITY
-- Ensures Realtime events broadcast all row columns on DELETE and UPDATE operations.
-- Specifically enables habit_completions DELETE events to provide habit_id and user_id to client listeners.
ALTER TABLE public.habit_completions REPLICA IDENTITY FULL;
ALTER TABLE public.habits REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;

-- 2. ENSURE PROFILES IS IN REALTIME PUBLICATION
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;

-- 3. FIX STREAK TRIGGER REFERENCE DATE ANCHORING
-- Fixes historical streak revival bug: when historical completions are deleted or updated,
-- the reference date must be anchored to at least CURRENT_DATE rather than a past date,
-- ensuring broken streaks are not resurrected as active today.
CREATE OR REPLACE FUNCTION public.trg_sync_habit_completion_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_habit_id UUID;
  v_event_date DATE;
  v_user_ref_date DATE;
  v_habit_ref_date DATE;
  v_user_streak INT;
  v_habit_streak INT;
  v_best_streak INT;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_user_id := OLD.user_id;
    v_habit_id := OLD.habit_id;
    v_event_date := OLD.completed_date;
  ELSE
    v_user_id := NEW.user_id;
    v_habit_id := NEW.habit_id;
    v_event_date := NEW.completed_date;
  END IF;

  -- User reference date: Anchored to at least CURRENT_DATE to prevent historical streak revival
  v_user_ref_date := GREATEST(CURRENT_DATE, v_event_date);

  -- 1. Calculate & update overall user streak in public.profiles
  v_user_streak := public.calculate_user_streak(v_user_id, v_user_ref_date);
  UPDATE public.profiles
  SET streak_days = v_user_streak,
      updated_at = now()
  WHERE id = v_user_id;

  -- Habit reference date: Anchored to at least CURRENT_DATE
  v_habit_ref_date := GREATEST(CURRENT_DATE, v_event_date);

  -- 2. Calculate & update individual habit streak in public.habits
  v_habit_streak := public.calculate_habit_streak(v_habit_id, v_habit_ref_date);
  
  SELECT best_streak INTO v_best_streak
  FROM public.habits
  WHERE id = v_habit_id;

  -- Best streak is monotonic; it never decrements when a habit is uncompleted
  IF v_habit_streak > COALESCE(v_best_streak, 0) THEN
    v_best_streak := v_habit_streak;
  END IF;

  UPDATE public.habits
  SET streak = v_habit_streak,
      best_streak = COALESCE(v_best_streak, 0),
      updated_at = now()
  WHERE id = v_habit_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure exactly one trigger is attached to habit_completions
DROP TRIGGER IF EXISTS on_habit_completion_streak ON public.habit_completions;
CREATE TRIGGER on_habit_completion_streak
  AFTER INSERT OR DELETE ON public.habit_completions
  FOR EACH ROW EXECUTE FUNCTION public.trg_sync_habit_completion_streak();

-- 4. AUTHORITATIVE PROGRESSION SYNCHRONIZATION FUNCTION
-- Centralized database-level XP, Level, and Momentum Points mutation engine.
-- Formula: Level 1 = 500 XP, Level L = 500 + (L - 1) * 200 XP threshold.
-- Supports both positive and negative XP/points deltas with level-up looping and non-punitive floor clamping.
CREATE OR REPLACE FUNCTION public.apply_user_progression_delta(
  p_user_id UUID,
  p_xp_delta INT,
  p_points_delta INT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_points_delta INT := COALESCE(p_points_delta, p_xp_delta);
  v_rec RECORD;
  v_level INT;
  v_xp INT;
  v_next_xp INT;
  v_points INT;
  v_streak INT;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'p_user_id cannot be null';
  END IF;

  IF auth.uid() IS NOT NULL AND auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot modify progression for another user';
  END IF;

  -- Lock row for concurrency safety
  SELECT level, xp, xp_to_next_level, momentum_points, streak_days
  INTO v_rec
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Profile not found');
  END IF;

  v_level := GREATEST(1, COALESCE(v_rec.level, 1));
  v_xp := COALESCE(v_rec.xp, 0) + p_xp_delta;
  v_next_xp := COALESCE(v_rec.xp_to_next_level, 500 + (v_level - 1) * 200);
  v_points := GREATEST(0, COALESCE(v_rec.momentum_points, 0) + v_points_delta);
  v_streak := COALESCE(v_rec.streak_days, 0);

  IF p_xp_delta > 0 THEN
    WHILE v_xp >= v_next_xp LOOP
      v_xp := v_xp - v_next_xp;
      v_level := v_level + 1;
      v_next_xp := 500 + (v_level - 1) * 200;
    END LOOP;
  ELSIF p_xp_delta < 0 THEN
    IF v_xp < 0 THEN
      v_xp := 0;
    END IF;
  END IF;

  UPDATE public.profiles
  SET level = v_level,
      xp = v_xp,
      xp_to_next_level = v_next_xp,
      momentum_points = v_points,
      updated_at = now()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'level', v_level,
    'currentXp', v_xp,
    'nextLevelXp', v_next_xp,
    'totalPoints', v_points,
    'momentumPoints', v_points,
    'streakDays', v_streak
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Security: Explicitly revoke execution from public and anon, grant to authenticated only
REVOKE EXECUTE ON FUNCTION public.apply_user_progression_delta(UUID, INT, INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.apply_user_progression_delta(UUID, INT, INT) FROM anon;
GRANT EXECUTE ON FUNCTION public.apply_user_progression_delta(UUID, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_user_streak(UUID, DATE) TO authenticated;
