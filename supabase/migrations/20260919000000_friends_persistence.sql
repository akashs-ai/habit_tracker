-- ============================================================================
-- MIGRATION: 20260919000000_friends_persistence.sql
-- Phase 4: Production Friends & Social Accountability Persistence, RLS, RPCs, & Realtime
-- ============================================================================

-- 1. ADD COLUMN IF NOT EXISTS
ALTER TABLE public.friend_requests 
  ADD COLUMN IF NOT EXISTS reason TEXT;

-- 2. REALTIME REPLICA IDENTITY
-- Ensures Realtime events broadcast all row columns on DELETE and UPDATE operations.
ALTER TABLE public.friend_requests REPLICA IDENTITY FULL;
ALTER TABLE public.friendships REPLICA IDENTITY FULL;

-- 3. ENSURE TABLES ARE IN SUPABASE_REALTIME PUBLICATION IDEMPOTENTLY
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'friend_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'friendships'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
  END IF;
END $$;

-- 4. ATOMIC RPC: send_friend_request
CREATE OR REPLACE FUNCTION public.send_friend_request(
  p_receiver_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_sender_id UUID := auth.uid();
  v_sender_profile RECORD;
  v_receiver_profile RECORD;
  v_u1 UUID;
  v_u2 UUID;
  v_existing_req RECORD;
  v_req_id UUID;
BEGIN
  -- 1. Caller identity MUST come from auth.uid()
  IF v_sender_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 2. Reject self-request
  IF v_sender_id = p_receiver_id THEN
    RAISE EXCEPTION 'Cannot send friend request to yourself';
  END IF;

  -- 3. Verify receiver exists
  SELECT id, username, display_name INTO v_receiver_profile
  FROM public.profiles
  WHERE id = p_receiver_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recipient profile not found';
  END IF;

  -- Get sender profile for notification
  SELECT id, username, display_name INTO v_sender_profile
  FROM public.profiles
  WHERE id = v_sender_id;

  -- 4. Check blocked_users in BOTH directions
  IF EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE (blocker_id = v_sender_id AND blocked_id = p_receiver_id)
       OR (blocker_id = p_receiver_id AND blocked_id = v_sender_id)
  ) THEN
    RAISE EXCEPTION 'Unable to send friend request to this user';
  END IF;

  -- 5. Prevent requesting an existing friendship
  v_u1 := LEAST(v_sender_id, p_receiver_id);
  v_u2 := GREATEST(v_sender_id, p_receiver_id);

  IF EXISTS (
    SELECT 1 FROM public.friendships
    WHERE user_id1 = v_u1 AND user_id2 = v_u2
  ) THEN
    RAISE EXCEPTION 'Already friends with this user';
  END IF;

  -- 6. Check if reverse request is already pending
  IF EXISTS (
    SELECT 1 FROM public.friend_requests
    WHERE sender_id = p_receiver_id AND receiver_id = v_sender_id AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'This user has already sent you a friend request. Please check your incoming requests.';
  END IF;

  -- 7. Check if request from sender to receiver already exists
  SELECT * INTO v_existing_req
  FROM public.friend_requests
  WHERE sender_id = v_sender_id AND receiver_id = p_receiver_id;

  IF FOUND THEN
    IF v_existing_req.status = 'pending' THEN
      RAISE EXCEPTION 'A friend request is already pending with this user';
    ELSIF v_existing_req.status = 'accepted' THEN
      RAISE EXCEPTION 'Already friends with this user';
    ELSE
      -- Previously rejected or canceled; reactivate safely
      UPDATE public.friend_requests
      SET status = 'pending',
          reason = p_reason,
          updated_at = now()
      WHERE id = v_existing_req.id
      RETURNING id INTO v_req_id;
    END IF;
  ELSE
    -- Insert new request
    INSERT INTO public.friend_requests (sender_id, receiver_id, status, reason)
    VALUES (v_sender_id, p_receiver_id, 'pending', p_reason)
    RETURNING id INTO v_req_id;
  END IF;

  -- 8. Generate notification for receiver
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    p_receiver_id,
    'friend_request',
    'New Friend Request',
    COALESCE(v_sender_profile.display_name, v_sender_profile.username, 'An adventurer') || ' sent you a friend request',
    jsonb_build_object(
      'request_id', v_req_id,
      'sender_id', v_sender_id,
      'sender_name', COALESCE(v_sender_profile.display_name, v_sender_profile.username, 'Adventurer'),
      'reason', p_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'request_id', v_req_id,
    'receiver_id', p_receiver_id,
    'status', 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. ATOMIC RPC: accept_friend_request
CREATE OR REPLACE FUNCTION public.accept_friend_request(p_request_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_req RECORD;
  v_receiver_profile RECORD;
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

  -- Get receiver's profile name for notification to sender
  SELECT id, username, display_name INTO v_receiver_profile
  FROM public.profiles
  WHERE id = v_user_id;

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
    COALESCE(v_receiver_profile.display_name, v_receiver_profile.username, 'Your partner') || ' accepted your friend request!',
    jsonb_build_object(
      'friend_id', v_user_id,
      'request_id', p_request_id
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'friend_id', v_req.sender_id,
    'request_id', p_request_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. ATOMIC RPC: decline_friend_request
CREATE OR REPLACE FUNCTION public.decline_friend_request(p_request_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.friend_requests
  SET status = 'rejected', updated_at = now()
  WHERE id = p_request_id AND receiver_id = v_user_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request not found or already handled';
  END IF;

  RETURN jsonb_build_object('success', true, 'request_id', p_request_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. ATOMIC RPC: cancel_friend_request
CREATE OR REPLACE FUNCTION public.cancel_friend_request(p_request_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.friend_requests
  SET status = 'canceled', updated_at = now()
  WHERE id = p_request_id AND sender_id = v_user_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request not found or already handled';
  END IF;

  RETURN jsonb_build_object('success', true, 'request_id', p_request_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. ATOMIC RPC: remove_friend
CREATE OR REPLACE FUNCTION public.remove_friend(p_friend_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_u1 UUID;
  v_u2 UUID;
  v_deleted INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_friend_id IS NULL OR v_user_id = p_friend_id THEN
    RAISE EXCEPTION 'Invalid friend ID';
  END IF;

  v_u1 := LEAST(v_user_id, p_friend_id);
  v_u2 := GREATEST(v_user_id, p_friend_id);

  DELETE FROM public.friendships
  WHERE user_id1 = v_u1 AND user_id2 = v_u2;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  -- Clean up active friend requests between them so either can send a request again in future
  DELETE FROM public.friend_requests
  WHERE (sender_id = v_user_id AND receiver_id = p_friend_id)
     OR (sender_id = p_friend_id AND receiver_id = v_user_id);

  RETURN jsonb_build_object('success', true, 'deleted', v_deleted > 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. PERMISSIONS AND GRANTS
REVOKE EXECUTE ON FUNCTION public.send_friend_request(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.send_friend_request(UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.send_friend_request(UUID, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.accept_friend_request(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.accept_friend_request(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.accept_friend_request(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.decline_friend_request(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.decline_friend_request(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.decline_friend_request(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.cancel_friend_request(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cancel_friend_request(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.cancel_friend_request(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.remove_friend(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.remove_friend(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.remove_friend(UUID) TO authenticated;
