-- ============================================================================
-- Migration: 20260918000000_rewards_persistence.sql
-- LifeRPG Phase F: Authoritative, user-scoped, realtime-synchronized Rewards & Claims
-- ============================================================================

-- 1. Ensure public.rewards table has all presentation and catalog columns
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

-- Idempotently add UI presentation columns
ALTER TABLE public.rewards 
  ADD COLUMN IF NOT EXISTS preview_type TEXT DEFAULT 'custom',
  ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#38BDF8',
  ADD COLUMN IF NOT EXISTS badge_tag TEXT DEFAULT 'Reward',
  ADD COLUMN IF NOT EXISTS includes JSONB DEFAULT '[]'::jsonb;

-- Idempotently add inventory check constraint (Fix 6)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_rewards_quantity_non_negative'
  ) THEN
    ALTER TABLE public.rewards 
      ADD CONSTRAINT chk_rewards_quantity_non_negative 
      CHECK (available_quantity IS NULL OR available_quantity >= 0);
  END IF;
END $$;

-- Catalog indexes
CREATE INDEX IF NOT EXISTS idx_rewards_active_category ON public.rewards (active, category);

-- 2. Seed the 5 Canonical Initial Featured Rewards (Deterministic UUIDs)
-- Ensures store has canonical catalog content immediately without duplicates
INSERT INTO public.rewards (
  id,
  title,
  description,
  category,
  cost,
  available_quantity,
  badge_level,
  badge_tag,
  icon,
  preview_type,
  accent_color,
  includes,
  terms_required,
  active
) VALUES 
(
  '00000000-0000-4000-8000-000000000001'::uuid,
  'Aurora Theme',
  'A clean and modern aesthetic to keep you focused.',
  'themes',
  800,
  NULL,
  'Tier I',
  'Theme',
  'Palette',
  'aurora-theme',
  '#38BDF8',
  '["Calm dark interface with aurora atmospheric glow", "Refined midnight typography and crisp borders", "Seamless support across all productivity dashboards"]'::jsonb,
  true,
  true
),
(
  '00000000-0000-4000-8000-000000000002'::uuid,
  'Focus Icon Pack',
  'Minimal icons for your habits, goals and tasks.',
  'icons',
  500,
  NULL,
  'Tier I',
  'Icons',
  'Sparkles',
  'focus-icons',
  '#818CF8',
  '["30+ handcrafted minimal SVG icons", "Dual line weight and solid fill states", "Custom category markers for tasks & habits"]'::jsonb,
  true,
  true
),
(
  '00000000-0000-4000-8000-000000000003'::uuid,
  '30-Day Consistency',
  'A special badge to celebrate your dedication.',
  'badges',
  1200,
  NULL,
  'Tier II',
  'Badge',
  'Flame',
  'flame-badge',
  '#F59E0B',
  '["Polished hexagonal flame profile badge", "Special streak glow displayed on leaderboards", "Permanent profile showcase recognition"]'::jsonb,
  true,
  true
),
(
  '00000000-0000-4000-8000-000000000004'::uuid,
  'Glass Profile Frame',
  'A minimal glass frame for your profile.',
  'profile',
  700,
  NULL,
  'Tier I',
  'Profile',
  'User',
  'glass-frame',
  '#38BDF8',
  '["Frosted cyan-to-violet circular frame", "Subtle ambient shimmer on profile avatar", "Visible in friends lists, groups, and rankings"]'::jsonb,
  true,
  true
),
(
  '00000000-0000-4000-8000-000000000005'::uuid,
  'Completion Effect',
  'Smooth and satisfying completion animation.',
  'animations',
  600,
  NULL,
  'Tier I',
  'Animation',
  'CheckCircle2',
  'completion-effect',
  '#6366F1',
  '["Restrained, tactile checkmark ripple physics", "Audio-visual haptic resonance effect", "Fully respects reduced-motion preferences"]'::jsonb,
  true,
  true
)
ON CONFLICT (id) DO NOTHING;

-- 3. Ensure public.reward_claims table is hardened
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

-- Idempotently add is_active column for tracking equipped cosmetics
ALTER TABLE public.reward_claims 
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT false;

-- Indexes for performance and foreign key lookups
CREATE INDEX IF NOT EXISTS idx_reward_claims_user ON public.reward_claims (user_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_reward ON public.reward_claims (reward_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_user_active ON public.reward_claims (user_id, is_active);

-- 4. One-Time Claim Unique Constraint
-- Enforces that a user can claim any given reward at most once.
-- Safely detects duplicate legacy claims without destructive deletion.
DO $$
DECLARE
  v_duplicate_count INT;
BEGIN
  -- Defensive check: detect pre-existing duplicate claims without destructive deletion
  SELECT COUNT(*) INTO v_duplicate_count
  FROM (
    SELECT user_id, reward_id
    FROM public.reward_claims
    GROUP BY user_id, reward_id
    HAVING COUNT(*) > 1
  ) duplicates;

  IF v_duplicate_count > 0 THEN
    RAISE EXCEPTION 'Cannot apply unique constraint uq_reward_claims_user_reward: % duplicate (user_id, reward_id) groups found in public.reward_claims. Reconcile duplicate claims manually before applying uniqueness constraint.', v_duplicate_count;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'uq_reward_claims_user_reward'
  ) THEN
    ALTER TABLE public.reward_claims 
      ADD CONSTRAINT uq_reward_claims_user_reward 
      UNIQUE (user_id, reward_id);
  END IF;
END $$;

-- 5. Row-Level Security (RLS) Configuration
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_claims ENABLE ROW LEVEL SECURITY;

-- Rewards Catalog Policies: Publicly/Authenticated readable, never writable by clients
DROP POLICY IF EXISTS "rewards_catalog_read_all" ON public.rewards;
CREATE POLICY "rewards_catalog_read_all" ON public.rewards
  FOR SELECT USING (active = true);

-- Reward Claims Policies:
-- Users may SELECT their own claims
DROP POLICY IF EXISTS "reward_claims_owner_all" ON public.reward_claims;
DROP POLICY IF EXISTS "reward_claims_owner_select" ON public.reward_claims;
CREATE POLICY "reward_claims_owner_select" ON public.reward_claims
  FOR SELECT USING (auth.uid() = user_id);

-- Explicitly deny direct client INSERT, UPDATE, and DELETE on claims
-- All claim creation and activation must proceed through the atomic SECURITY DEFINER RPCs
DROP POLICY IF EXISTS "reward_claims_no_direct_insert" ON public.reward_claims;
CREATE POLICY "reward_claims_no_direct_insert" ON public.reward_claims
  FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "reward_claims_no_direct_update" ON public.reward_claims;
CREATE POLICY "reward_claims_no_direct_update" ON public.reward_claims
  FOR UPDATE USING (false);

DROP POLICY IF EXISTS "reward_claims_no_direct_delete" ON public.reward_claims;
CREATE POLICY "reward_claims_no_direct_delete" ON public.reward_claims
  FOR DELETE USING (false);

-- 6. Realtime Publication Configuration
ALTER TABLE public.reward_claims REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'reward_claims'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reward_claims;
  END IF;
END $$;

-- 7. Atomic Claim RPC (Concurrency & Economy Safe)
-- Lock order: profiles row FOR UPDATE -> rewards row FOR UPDATE
CREATE OR REPLACE FUNCTION public.claim_user_reward(
  p_reward_id UUID,
  p_terms_accepted BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile public.profiles%ROWTYPE;
  v_reward public.rewards%ROWTYPE;
  v_existing_claim public.reward_claims%ROWTYPE;
  v_claim_id UUID;
  v_tx_hash TEXT;
  v_updated_points INT;
BEGIN
  -- 1. Authentication Check
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- 2. Validate Terms Acceptance
  IF p_terms_accepted IS NOT TRUE THEN
    RAISE EXCEPTION 'You must review and accept the LifeRPG Reward Claim Terms & Eligibility Policy';
  END IF;

  -- 3. Lock user profile row to guarantee authoritative point deduction without race conditions
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- 4. Lock reward catalog row to verify existence, status, and stock
  SELECT * INTO v_reward
  FROM public.rewards
  WHERE id = p_reward_id AND active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward not found or is currently inactive in the catalog';
  END IF;

  -- 5. Verify one-time claim uniqueness
  SELECT * INTO v_existing_claim
  FROM public.reward_claims
  WHERE user_id = v_user_id AND reward_id = p_reward_id;

  IF FOUND THEN
    RAISE EXCEPTION 'Reward "%" has already been claimed and is in your collection', v_reward.title;
  END IF;

  -- 6. Verify inventory stock if finite
  IF v_reward.available_quantity IS NOT NULL AND v_reward.available_quantity <= 0 THEN
    RAISE EXCEPTION 'Reward "%" is currently out of stock', v_reward.title;
  END IF;

  -- 7. Authoritative Balance Verification
  IF COALESCE(v_profile.momentum_points, 0) < v_reward.cost THEN
    RAISE EXCEPTION 'Insufficient Momentum Points (Required: %, Available: %)', 
      v_reward.cost, COALESCE(v_profile.momentum_points, 0);
  END IF;

  -- 8. Deduct Momentum Points atomically
  v_updated_points := COALESCE(v_profile.momentum_points, 0) - v_reward.cost;
  UPDATE public.profiles
  SET momentum_points = v_updated_points,
      updated_at = now()
  WHERE id = v_user_id;

  -- 9. Decrement finite inventory if applicable
  IF v_reward.available_quantity IS NOT NULL THEN
    UPDATE public.rewards
    SET available_quantity = available_quantity - 1
    WHERE id = p_reward_id;
  END IF;

  -- 10. Deactivate previous active item in same category for this user
  UPDATE public.reward_claims rc
  SET is_active = false
  FROM public.rewards r
  WHERE rc.reward_id = r.id 
    AND rc.user_id = v_user_id 
    AND r.category = v_reward.category;

  -- 11. Generate cryptographically safe transaction hash
  v_tx_hash := 'TX-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || clock_timestamp()::TEXT || v_user_id::TEXT), 1, 16));

  -- 12. Insert immutable claim row with equipped status
  INSERT INTO public.reward_claims (
    user_id,
    reward_id,
    cost_paid,
    terms_accepted,
    status,
    is_active,
    transaction_hash,
    claimed_at
  ) VALUES (
    v_user_id,
    p_reward_id,
    v_reward.cost,
    true,
    'fulfilled',
    true,
    v_tx_hash,
    now()
  ) RETURNING id INTO v_claim_id;

  -- 13. Create notification record
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
    'Successfully unlocked ' || v_reward.title || ' for ' || v_reward.cost || ' Momentum Points',
    jsonb_build_object(
      'reward_id', p_reward_id,
      'claim_id', v_claim_id,
      'cost_paid', v_reward.cost,
      'transaction_hash', v_tx_hash
    )
  );

  -- 14. Return composite success payload
  RETURN jsonb_build_object(
    'success', true,
    'claim_id', v_claim_id,
    'transaction_hash', v_tx_hash,
    'remaining_points', v_updated_points,
    'reward', jsonb_build_object(
      'id', v_reward.id,
      'title', v_reward.title,
      'description', v_reward.description,
      'category', v_reward.category,
      'cost', v_reward.cost,
      'badge_tag', v_reward.badge_tag,
      'preview_type', v_reward.preview_type,
      'accent_color', v_reward.accent_color,
      'includes', v_reward.includes,
      'status', 'active'
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.claim_user_reward(UUID, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_user_reward(UUID, BOOLEAN) TO authenticated;

-- 8. Atomic Activation RPC (Equipping owned cosmetic)
CREATE OR REPLACE FUNCTION public.activate_user_reward(
  p_reward_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_claim public.reward_claims%ROWTYPE;
  v_reward public.rewards%ROWTYPE;
BEGIN
  -- 1. Authentication Check
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- 2. Lock user profile row first to establish consistent per-user lock hierarchy:
  -- profiles -> rewards -> reward_claims. Eliminates activation deadlock (Fix 1).
  PERFORM 1
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  -- 3. Verify user owns the reward and lock the claim row
  SELECT * INTO v_claim
  FROM public.reward_claims
  WHERE user_id = v_user_id AND reward_id = p_reward_id AND status = 'fulfilled'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot activate reward: You do not own this reward or claim is not fulfilled';
  END IF;

  -- 4. Fetch reward category
  SELECT * INTO v_reward
  FROM public.rewards
  WHERE id = p_reward_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Associated reward metadata not found';
  END IF;

  -- 5. Deactivate currently active reward(s) in the same category for this user
  UPDATE public.reward_claims rc
  SET is_active = false
  FROM public.rewards r
  WHERE rc.reward_id = r.id
    AND rc.user_id = v_user_id
    AND r.category = v_reward.category;

  -- 6. Activate target claim
  UPDATE public.reward_claims
  SET is_active = true
  WHERE id = v_claim.id;

  RETURN jsonb_build_object(
    'success', true,
    'reward_id', p_reward_id,
    'category', v_reward.category,
    'status', 'active'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.activate_user_reward(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.activate_user_reward(UUID) TO authenticated;
