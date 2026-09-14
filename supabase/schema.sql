-- ============================================================================
-- SUPABASE POSTGRESQL PRODUCTION SCHEMA & ARCHITECTURE
-- Habit Tracker & Productivity RPG
-- Single Source of Truth with Strict Row Level Security (RLS) & User Isolation
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean drop for idempotency if running fresh
-- (In production, migrations add incrementally)

-- ----------------------------------------------------------------------------
-- 1. USER PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT DEFAULT 'Ready for daily quests!',
  level INT NOT NULL DEFAULT 1 CHECK (level >= 1),
  xp INT NOT NULL DEFAULT 0 CHECK (xp >= 0),
  xp_to_next_level INT NOT NULL DEFAULT 500 CHECK (xp_to_next_level > 0),
  rank TEXT NOT NULL DEFAULT 'Novice Adventurer',
  momentum_points INT NOT NULL DEFAULT 0 CHECK (momentum_points >= 0),
  streak_days INT NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  is_guest BOOLEAN NOT NULL DEFAULT false,
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  privacy_profile TEXT NOT NULL DEFAULT 'friends' CHECK (privacy_profile IN ('public', 'friends', 'private')),
  privacy_activity TEXT NOT NULL DEFAULT 'friends' CHECK (privacy_activity IN ('public', 'friends', 'private')),
  privacy_streaks TEXT NOT NULL DEFAULT 'public' CHECK (privacy_streaks IN ('public', 'friends', 'private')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case-insensitive globally unique username enforcement (@alex, @Alex, @ALEX are identical)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower ON public.profiles (LOWER(TRIM(username)));
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON public.profiles (last_seen_at);
CREATE INDEX IF NOT EXISTS idx_profiles_is_online ON public.profiles (is_online);

-- ----------------------------------------------------------------------------
-- 2. USER SETTINGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  accent_color TEXT NOT NULL DEFAULT '#6C63FF',
  density TEXT NOT NULL DEFAULT 'comfortable' CHECK (density IN ('comfortable', 'compact')),
  sound_effects BOOLEAN NOT NULL DEFAULT true,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  weekly_digest BOOLEAN NOT NULL DEFAULT true,
  friend_activity_alerts BOOLEAN NOT NULL DEFAULT true,
  challenge_invites BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. HABITS (QUESTS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'daily' CHECK (category IN ('daily', 'fitness', 'learning', 'mindfulness', 'career', 'health', 'creative')),
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  xp_reward INT NOT NULL DEFAULT 25 CHECK (xp_reward > 0),
  streak INT NOT NULL DEFAULT 0 CHECK (streak >= 0),
  best_streak INT NOT NULL DEFAULT 0 CHECK (best_streak >= 0),
  frequency TEXT NOT NULL DEFAULT 'daily',
  target_days INT NOT NULL DEFAULT 7 CHECK (target_days BETWEEN 1 AND 7),
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits (user_id);
CREATE INDEX IF NOT EXISTS idx_habits_category ON public.habits (user_id, category);

-- ----------------------------------------------------------------------------
-- 4. HABIT COMPLETIONS (Daily completion log)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  xp_earned INT NOT NULL DEFAULT 25 CHECK (xp_earned >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_habit_completion_per_day UNIQUE (habit_id, completed_date)
);

CREATE INDEX IF NOT EXISTS idx_habit_completions_user_date ON public.habit_completions (user_id, completed_date);
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit ON public.habit_completions (habit_id);

-- ----------------------------------------------------------------------------
-- 5. TASKS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'work',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMPTZ,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks (user_id, completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks (user_id, due_date);

-- ----------------------------------------------------------------------------
-- 6. CALENDAR EVENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL DEFAULT 'event',
  color TEXT DEFAULT '#6C63FF',
  habit_id UUID REFERENCES public.habits(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_event_dates CHECK (end_time >= start_time)
);

CREATE INDEX IF NOT EXISTS idx_calendar_user_range ON public.calendar_events (user_id, start_time, end_time);

-- ----------------------------------------------------------------------------
-- 7. GOALS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'personal',
  target_date DATE,
  progress INT NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  target_value NUMERIC NOT NULL DEFAULT 100,
  current_value NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT '%',
  completed BOOLEAN NOT NULL DEFAULT false,
  xp_reward INT NOT NULL DEFAULT 150 CHECK (xp_reward >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals (user_id);

CREATE TABLE IF NOT EXISTS public.goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_goal_milestones_goal ON public.goal_milestones (goal_id);

-- ----------------------------------------------------------------------------
-- 8. REWARDS & CLAIMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'powerup',
  cost INT NOT NULL CHECK (cost >= 0),
  available_quantity INT, -- NULL indicates unlimited
  badge_level TEXT DEFAULT 'Tier I',
  icon TEXT DEFAULT 'Gift',
  terms_required BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE RESTRICT,
  cost_paid INT NOT NULL CHECK (cost_paid >= 0),
  terms_accepted BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'fulfilled' CHECK (status IN ('pending', 'fulfilled', 'revoked')),
  transaction_hash TEXT NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reward_claims_user ON public.reward_claims (user_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_reward ON public.reward_claims (reward_id);

-- ----------------------------------------------------------------------------
-- 9. FRIEND REQUESTS, FRIENDSHIPS & BLOCKED USERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'canceled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT no_self_friend_request CHECK (sender_id != receiver_id),
  CONSTRAINT uq_friend_request_active UNIQUE (sender_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_req_receiver ON public.friend_requests (receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_friend_req_sender ON public.friend_requests (sender_id, status);

CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT no_self_friendship CHECK (user_id1 != user_id2),
  -- Store ordered pair (user_id1 < user_id2) to avoid duplicate reverse records
  CONSTRAINT check_canonical_pair CHECK (user_id1 < user_id2),
  CONSTRAINT uq_canonical_friendship_pair UNIQUE (user_id1, user_id2)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON public.friendships (user_id1);
CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON public.friendships (user_id2);

CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT no_self_block CHECK (blocker_id != blocked_id),
  CONSTRAINT uq_blocked_pair UNIQUE (blocker_id, blocked_id)
);

-- ----------------------------------------------------------------------------
-- 10. NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'friend_request', 'friend_accepted', 'challenge_invite', 'reward_claimed', 'level_up'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications (user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications (user_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 11. CHALLENGES & PARTICIPANTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'fitness',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  target_value INT NOT NULL DEFAULT 7 CHECK (target_value > 0),
  xp_reward INT NOT NULL DEFAULT 200 CHECK (xp_reward >= 0),
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_challenge_dates CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0),
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_challenge_participant UNIQUE (challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON public.challenge_participants (challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON public.challenge_participants (user_id);

-- ----------------------------------------------------------------------------
-- 12. QUICK NOTES & ATTRIBUTES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quick_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quick_notes_user ON public.quick_notes (user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict user data isolation: User A cannot read, edit, or delete User B's data
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;

-- --- PROFILES RLS ---
-- Users can read their own profile, or public profiles, or friends' profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR privacy_profile = 'public'
    OR (
      privacy_profile = 'friends' AND EXISTS (
        SELECT 1 FROM public.friendships
        WHERE (user_id1 = LEAST(auth.uid(), profiles.id) AND user_id2 = GREATEST(auth.uid(), profiles.id))
      )
    )
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- --- USER SETTINGS RLS ---
CREATE POLICY "user_settings_owner_all" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

-- --- HABITS & COMPLETIONS RLS ---
CREATE POLICY "habits_owner_all" ON public.habits
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "habit_completions_owner_all" ON public.habit_completions
  FOR ALL USING (auth.uid() = user_id);

-- --- TASKS RLS ---
CREATE POLICY "tasks_owner_all" ON public.tasks
  FOR ALL USING (auth.uid() = user_id);

-- --- CALENDAR EVENTS RLS ---
CREATE POLICY "calendar_events_owner_all" ON public.calendar_events
  FOR ALL USING (auth.uid() = user_id);

-- --- GOALS & MILESTONES RLS ---
CREATE POLICY "goals_owner_all" ON public.goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "goal_milestones_owner_all" ON public.goal_milestones
  FOR ALL USING (auth.uid() = user_id);

-- --- QUICK NOTES RLS ---
CREATE POLICY "quick_notes_owner_all" ON public.quick_notes
  FOR ALL USING (auth.uid() = user_id);

-- --- REWARDS RLS ---
-- Publicly readable catalog of rewards
CREATE POLICY "rewards_catalog_read_all" ON public.rewards
  FOR SELECT USING (active = true);

-- Claims are private to the user
CREATE POLICY "reward_claims_owner_all" ON public.reward_claims
  FOR ALL USING (auth.uid() = user_id);

-- --- FRIEND REQUESTS RLS ---
CREATE POLICY "friend_requests_select" ON public.friend_requests
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "friend_requests_insert" ON public.friend_requests
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "friend_requests_update" ON public.friend_requests
  FOR UPDATE USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

CREATE POLICY "friend_requests_delete" ON public.friend_requests
  FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- --- FRIENDSHIPS RLS ---
CREATE POLICY "friendships_select" ON public.friendships
  FOR SELECT USING (auth.uid() = user_id1 OR auth.uid() = user_id2);

CREATE POLICY "friendships_delete" ON public.friendships
  FOR DELETE USING (auth.uid() = user_id1 OR auth.uid() = user_id2);

-- --- BLOCKED USERS RLS ---
CREATE POLICY "blocked_users_owner" ON public.blocked_users
  FOR ALL USING (auth.uid() = blocker_id);

-- --- NOTIFICATIONS RLS ---
CREATE POLICY "notifications_owner_all" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- --- CHALLENGES RLS ---
CREATE POLICY "challenges_select" ON public.challenges
  FOR SELECT USING (
    is_public = true 
    OR creator_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.challenge_participants WHERE challenge_id = challenges.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "challenges_insert" ON public.challenges
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "challenges_update" ON public.challenges
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "challenge_participants_select" ON public.challenge_participants
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.challenges WHERE id = challenge_participants.challenge_id AND is_public = true)
  );

CREATE POLICY "challenge_participants_insert" ON public.challenge_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "challenge_participants_update" ON public.challenge_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- STORED PROCEDURES & ATOMIC BUSINESS LOGIC FUNCTIONS
-- ============================================================================

-- 1. Automatic Profile & Settings creation on new Supabase Auth User
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_username TEXT;
  v_display_name TEXT;
  v_counter INT := 0;
BEGIN
  -- Derive default username from email or metadata
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1),
    'hero_' || SUBSTRING(NEW.id::text, 1, 6)
  );
  
  -- Clean up username
  v_username := REGEXP_REPLACE(LOWER(v_username), '[^a-z0-9_]', '', 'g');
  IF LENGTH(v_username) < 3 THEN
    v_username := 'hero_' || SUBSTRING(NEW.id::text, 1, 6);
  END IF;

  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(v_username)) LOOP
    v_counter := v_counter + 1;
    v_username := REGEXP_REPLACE(LOWER(SPLIT_PART(NEW.email, '@', 1)), '[^a-z0-9_]', '', 'g') || v_counter::text;
  END LOOP;

  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    INITCAP(SPLIT_PART(NEW.email, '@', 1)),
    'Adventurer'
  );

  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    avatar_url,
    level,
    xp,
    momentum_points
  ) VALUES (
    NEW.id,
    v_username,
    v_display_name,
    NEW.raw_user_meta_data->>'avatar_url',
    1,
    0,
    50
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users (Supabase native Auth)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Atomic Reward Claim with Server-Side Balance & Limit Verification
CREATE OR REPLACE FUNCTION public.claim_reward(p_reward_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_reward RECORD;
  v_user_points INT;
  v_tx_hash TEXT;
  v_claim_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Lock user profile row for atomic deduction
  SELECT momentum_points INTO v_user_points
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Lock reward row
  SELECT * INTO v_reward
  FROM public.rewards
  WHERE id = p_reward_id AND active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward is not available or inactive';
  END IF;

  -- Check inventory if limited
  IF v_reward.available_quantity IS NOT NULL AND v_reward.available_quantity <= 0 THEN
    RAISE EXCEPTION 'Reward is out of stock';
  END IF;

  -- Verify balance
  IF v_user_points < v_reward.cost THEN
    RAISE EXCEPTION 'Insufficient Momentum Points (Required: %, Current: %)', v_reward.cost, v_user_points;
  END IF;

  -- Deduct points
  UPDATE public.profiles
  SET momentum_points = momentum_points - v_reward.cost,
      updated_at = now()
  WHERE id = v_user_id;

  -- Decrement stock if finite
  IF v_reward.available_quantity IS NOT NULL THEN
    UPDATE public.rewards
    SET available_quantity = available_quantity - 1
    WHERE id = p_reward_id;
  END IF;

  -- Generate hash & record claim
  v_tx_hash := 'TX-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || clock_timestamp()::TEXT), 1, 12));
  INSERT INTO public.reward_claims (
    user_id,
    reward_id,
    cost_paid,
    terms_accepted,
    status,
    transaction_hash
  ) VALUES (
    v_user_id,
    p_reward_id,
    v_reward.cost,
    true,
    'fulfilled',
    v_tx_hash
  ) RETURNING id INTO v_claim_id;

  -- Create notification
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    v_user_id,
    'reward_claimed',
    'Reward Unlocked: ' || v_reward.title,
    'Successfully spent ' || v_reward.cost || ' Momentum Points for ' || v_reward.title,
    jsonb_build_object('reward_id', p_reward_id, 'claim_id', v_claim_id, 'tx_hash', v_tx_hash)
  );

  RETURN jsonb_build_object(
    'success', true,
    'claim_id', v_claim_id,
    'transaction_hash', v_tx_hash,
    'remaining_points', (v_user_points - v_reward.cost)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Atomic Friend Request Acceptance
CREATE OR REPLACE FUNCTION public.accept_friend_request(p_request_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_req RECORD;
  v_u1 UUID;
  v_u2 UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify and lock the request
  SELECT * INTO v_req
  FROM public.friend_requests
  WHERE id = p_request_id AND receiver_id = v_user_id AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request not found or already handled';
  END IF;

  -- Mark accepted
  UPDATE public.friend_requests
  SET status = 'accepted', updated_at = now()
  WHERE id = p_request_id;

  -- Canonical pair ordering
  v_u1 := LEAST(v_req.sender_id, v_req.receiver_id);
  v_u2 := GREATEST(v_req.sender_id, v_req.receiver_id);

  INSERT INTO public.friendships (user_id1, user_id2)
  VALUES (v_u1, v_u2)
  ON CONFLICT (user_id1, user_id2) DO NOTHING;

  -- Notify sender
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    v_req.sender_id,
    'friend_accepted',
    'Friend Request Accepted',
    'Your friend request was accepted!',
    jsonb_build_object('friend_id', v_user_id)
  );

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Atomic Transactional Guest to Registered Account Migration
CREATE OR REPLACE FUNCTION public.migrate_guest_data(p_guest_id UUID, p_new_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_habits_count INT;
  v_tasks_count INT;
BEGIN
  IF v_caller IS NULL OR v_caller != p_new_user_id THEN
    RAISE EXCEPTION 'Unauthorized migration call';
  END IF;

  -- Ensure target new user exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_new_user_id) THEN
    RAISE EXCEPTION 'Target user does not exist';
  END IF;

  -- 1. Transfer habits & completions
  UPDATE public.habits
  SET user_id = p_new_user_id
  WHERE user_id = p_guest_id;
  GET DIAGNOSTICS v_habits_count = ROW_COUNT;

  UPDATE public.habit_completions
  SET user_id = p_new_user_id
  WHERE user_id = p_guest_id;

  -- 2. Transfer tasks
  UPDATE public.tasks
  SET user_id = p_new_user_id
  WHERE user_id = p_guest_id;
  GET DIAGNOSTICS v_tasks_count = ROW_COUNT;

  -- 3. Transfer calendar events
  UPDATE public.calendar_events
  SET user_id = p_new_user_id
  WHERE user_id = p_guest_id;

  -- 4. Transfer goals & milestones
  UPDATE public.goals
  SET user_id = p_new_user_id
  WHERE user_id = p_guest_id;

  UPDATE public.goal_milestones
  SET user_id = p_new_user_id
  WHERE user_id = p_guest_id;

  -- 5. Transfer quick notes
  UPDATE public.quick_notes
  SET user_id = p_new_user_id
  WHERE user_id = p_guest_id;

  -- 6. Clean up temporary guest profile
  DELETE FROM public.profiles WHERE id = p_guest_id AND is_guest = true;

  RETURN jsonb_build_object(
    'success', true,
    'migrated_habits', v_habits_count,
    'migrated_tasks', v_tasks_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. DATABASE-DRIVEN STREAK CALCULATION ENGINE
-- ============================================================================

-- Calculate overall user consistency streak across all habit completions
CREATE OR REPLACE FUNCTION public.calculate_user_streak(
  p_user_id UUID,
  p_today DATE DEFAULT CURRENT_DATE
)
RETURNS INT AS $$
DECLARE
  v_streak INT := 0;
  v_expected_date DATE;
  v_rec RECORD;
BEGIN
  -- Iterate through distinct habit completion dates on or before p_today, latest first
  FOR v_rec IN
    SELECT DISTINCT completed_date
    FROM public.habit_completions
    WHERE user_id = p_user_id
      AND completed_date <= p_today
    ORDER BY completed_date DESC
  LOOP
    IF v_streak = 0 THEN
      -- First record: completion must be either today or yesterday
      IF v_rec.completed_date = p_today THEN
        v_streak := 1;
        v_expected_date := p_today - 1;
      ELSIF v_rec.completed_date = p_today - 1 THEN
        v_streak := 1;
        v_expected_date := p_today - 2;
      ELSE
        -- Completed more than 1 day ago: streak is broken
        RETURN 0;
      END IF;
    ELSE
      -- Subsequent consecutive days
      IF v_rec.completed_date = v_expected_date THEN
        v_streak := v_streak + 1;
        v_expected_date := v_expected_date - 1;
      ELSE
        EXIT;
      END IF;
    END IF;
  END LOOP;

  RETURN v_streak;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Calculate individual habit consistency streak
CREATE OR REPLACE FUNCTION public.calculate_habit_streak(
  p_habit_id UUID,
  p_today DATE DEFAULT CURRENT_DATE
)
RETURNS INT AS $$
DECLARE
  v_streak INT := 0;
  v_expected_date DATE;
  v_rec RECORD;
BEGIN
  FOR v_rec IN
    SELECT DISTINCT completed_date
    FROM public.habit_completions
    WHERE habit_id = p_habit_id
      AND completed_date <= p_today
    ORDER BY completed_date DESC
  LOOP
    IF v_streak = 0 THEN
      IF v_rec.completed_date = p_today THEN
        v_streak := 1;
        v_expected_date := p_today - 1;
      ELSIF v_rec.completed_date = p_today - 1 THEN
        v_streak := 1;
        v_expected_date := p_today - 2;
      ELSE
        RETURN 0;
      END IF;
    ELSE
      IF v_rec.completed_date = v_expected_date THEN
        v_streak := v_streak + 1;
        v_expected_date := v_expected_date - 1;
      ELSE
        EXIT;
      END IF;
    END IF;
  END LOOP;

  RETURN v_streak;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Automatic streak sync trigger on completion insert or delete
CREATE OR REPLACE FUNCTION public.trg_sync_habit_completion_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_habit_id UUID;
  v_event_date DATE;
  v_max_user_date DATE;
  v_max_habit_date DATE;
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

  -- Determine user reference date: whichever is latest between the mutated date and remaining completions
  SELECT MAX(completed_date) INTO v_max_user_date
  FROM public.habit_completions
  WHERE user_id = v_user_id;

  v_user_ref_date := GREATEST(v_event_date, COALESCE(v_max_user_date, v_event_date));

  -- 1. Calculate & update overall user streak in public.profiles
  v_user_streak := public.calculate_user_streak(v_user_id, v_user_ref_date);
  UPDATE public.profiles
  SET streak_days = v_user_streak,
      updated_at = now()
  WHERE id = v_user_id;

  -- Determine habit reference date: whichever is latest between the mutated date and remaining completions for this habit
  SELECT MAX(completed_date) INTO v_max_habit_date
  FROM public.habit_completions
  WHERE habit_id = v_habit_id;

  v_habit_ref_date := GREATEST(v_event_date, COALESCE(v_max_habit_date, v_event_date));

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

DROP TRIGGER IF EXISTS on_habit_completion_streak ON public.habit_completions;
CREATE TRIGGER on_habit_completion_streak
  AFTER INSERT OR DELETE ON public.habit_completions
  FOR EACH ROW EXECUTE FUNCTION public.trg_sync_habit_completion_streak();

-- Safe backfill: synchronizes streak_days on existing user profiles
DO $$
DECLARE
  v_p RECORD;
BEGIN
  FOR v_p IN SELECT id FROM public.profiles LOOP
    UPDATE public.profiles
    SET streak_days = public.calculate_user_streak(v_p.id, CURRENT_DATE)
    WHERE id = v_p.id;
  END LOOP;
END $$;

-- ============================================================================
-- SUPABASE REALTIME REPLICATION PUBLICATION
-- Enable live synchronization for collaborative and cross-device features
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.habits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habit_completions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_participants;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;
