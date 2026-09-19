import { TaskItem, TaskPriority, UserProfile, AuthUser, Quest, RewardItem, CollectionItem, FriendUser, FriendRequest, SuggestedFriend, DetailedGoal, GoalMilestone, GoalSubtask, GoalCategory, GoalStatus, CalendarEvent, EventCategory, QuickNote } from '../types';
import { getSupabase } from '../lib/supabase';
import { initialUserProfile } from '../data/mockData';
import { getLiveTodayISO, getStartOfWeek, formatDateISO, formatReadableDate } from '../utils/dateUtils';
import { calculateProgressionDelta, getXpRequiredForLevel } from '../utils/progression';

export interface SerializedTaskPayload {
  description?: string;
  labels?: string[];
  xpReward?: number;
  subtasks?: any[];
  notes?: string;
  dueText?: string;
  viewCategory?: 'today' | 'upcoming' | 'overdue' | 'someday';
  clientTempId?: string;
}

/**
 * Parses description column which may contain serialized JSON metadata for task properties
 */
export function parseTaskDescription(rawDesc: string | null | undefined): {
  description: string;
  labels: string[];
  xpReward: number;
  subtasks: any[];
  notes: string;
  dueText: string;
  viewCategory: 'today' | 'upcoming' | 'overdue' | 'someday';
  clientTempId?: string;
} {
  const defaultResult = {
    description: '',
    labels: ['General'],
    xpReward: 15,
    subtasks: [],
    notes: '',
    dueText: 'Today',
    viewCategory: 'today' as const,
    clientTempId: undefined,
  };

  if (!rawDesc) return defaultResult;

  const trimmed = rawDesc.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed: SerializedTaskPayload = JSON.parse(trimmed);
      return {
        description: typeof parsed.description === 'string' ? parsed.description : '',
        labels: Array.isArray(parsed.labels) && parsed.labels.length > 0 ? parsed.labels : ['General'],
        xpReward: typeof parsed.xpReward === 'number' ? parsed.xpReward : 15,
        subtasks: Array.isArray(parsed.subtasks) ? parsed.subtasks : [],
        notes: typeof parsed.notes === 'string' ? parsed.notes : '',
        dueText: typeof parsed.dueText === 'string' ? parsed.dueText : 'Today',
        viewCategory: parsed.viewCategory || 'today',
        clientTempId: typeof parsed.clientTempId === 'string' ? parsed.clientTempId : undefined,
      };
    } catch {
      // Not valid JSON, treat as plain description text
    }
  }

  return {
    ...defaultResult,
    description: trimmed,
  };
}

/**
 * Converts a database row from public.tasks into a frontend TaskItem
 */
export function mapTaskRowToTaskItem(row: any): TaskItem {
  const meta = parseTaskDescription(row.description);
  
  let dueDateStr: string | undefined = undefined;
  if (row.due_date) {
    dueDateStr = row.due_date.substring(0, 10);
  }

  return {
    id: row.id,
    clientTempId: meta.clientTempId,
    title: row.title || 'Untitled Task',
    description: meta.description,
    completed: Boolean(row.completed),
    viewCategory: meta.viewCategory,
    dueText: meta.dueText,
    dueDate: dueDateStr,
    dueTime: undefined,
    labels: meta.labels.length > 0 ? meta.labels : [row.category || 'General'],
    priority: (['low', 'medium', 'high', 'urgent'].includes(row.priority) ? row.priority : 'medium') as TaskPriority,
    xpReward: meta.xpReward || (row.priority === 'urgent' ? 30 : row.priority === 'high' ? 25 : row.priority === 'low' ? 10 : 15),
    subtasks: meta.subtasks,
    notes: meta.notes,
  };
}

/**
 * Serializes task metadata into the description column for storage in Supabase
 */
export function serializeTaskDescription(task: Partial<TaskItem>): string {
  const payload: SerializedTaskPayload = {
    description: task.description || '',
    labels: task.labels || ['General'],
    xpReward: task.xpReward || 15,
    subtasks: task.subtasks || [],
    notes: task.notes || '',
    dueText: task.dueText || 'Today',
    viewCategory: task.viewCategory || 'today',
    clientTempId: task.clientTempId,
  };
  return JSON.stringify(payload);
}

/**
 * Fetches all tasks belonging to the user from Supabase Postgres
 */
export async function fetchUserTasksFromSupabase(userId: string): Promise<TaskItem[]> {
  const sb = getSupabase();
  if (!sb || !userId) return [];

  const { data, error } = await sb
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks from Supabase:', error);
    throw new Error(`Failed to load tasks from database: ${error.message}`);
  }

  if (!data) return [];
  return data.map(mapTaskRowToTaskItem);
}

/**
 * Inserts a new task for the authenticated user in Supabase Postgres
 */
export async function createUserTaskInSupabase(
  userId: string,
  taskData: Omit<TaskItem, 'id'>
): Promise<TaskItem> {
  const sb = getSupabase();
  if (!sb || !userId) {
    throw new Error('Supabase client not initialized or unauthenticated.');
  }

  const category = (taskData.labels?.[0] || 'work').toLowerCase();
  const priority = ['low', 'medium', 'high', 'urgent'].includes(taskData.priority)
    ? taskData.priority
    : 'medium';

  let dueDate: string | null = null;
  if (taskData.dueDate) {
    try {
      dueDate = new Date(taskData.dueDate).toISOString();
    } catch {
      dueDate = null;
    }
  }

  const serializedDescription = serializeTaskDescription(taskData);

  const insertPayload = {
    user_id: userId,
    title: taskData.title.trim(),
    description: serializedDescription,
    category,
    priority,
    due_date: dueDate,
    completed: Boolean(taskData.completed),
    completed_at: taskData.completed ? new Date().toISOString() : null,
  };

  const { data, error } = await sb
    .from('tasks')
    .insert(insertPayload)
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating task in Supabase:', error);
    throw new Error(`Failed to save task to database: ${error?.message || 'Unknown error'}`);
  }

  return mapTaskRowToTaskItem(data);
}

/**
 * Updates an existing task for the authenticated user in Supabase Postgres
 */
export async function updateUserTaskInSupabase(
  userId: string,
  taskData: TaskItem
): Promise<TaskItem> {
  const sb = getSupabase();
  if (!sb || !userId) {
    throw new Error('Supabase client not initialized or unauthenticated.');
  }

  const category = (taskData.labels?.[0] || 'work').toLowerCase();
  const priority = ['low', 'medium', 'high', 'urgent'].includes(taskData.priority)
    ? taskData.priority
    : 'medium';

  let dueDate: string | null = null;
  if (taskData.dueDate) {
    try {
      dueDate = new Date(taskData.dueDate).toISOString();
    } catch {
      dueDate = null;
    }
  }

  const serializedDescription = serializeTaskDescription(taskData);

  const updatePayload = {
    title: taskData.title.trim(),
    description: serializedDescription,
    category,
    priority,
    due_date: dueDate,
    completed: Boolean(taskData.completed),
    completed_at: taskData.completed ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await sb
    .from('tasks')
    .update(updatePayload)
    .eq('id', taskData.id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating task in Supabase:', error);
    throw new Error(`Failed to update task in database: ${error?.message || 'Task not found or access denied'}`);
  }

  return mapTaskRowToTaskItem(data);
}

/**
 * Persists an XP and Momentum Points delta to the user's profile in Supabase Postgres.
 * Invokes the atomic apply_user_progression_delta RPC when available, falling back
 * to a direct row update using the shared progression engine.
 */
export async function applyUserProgressionDeltaInSupabase(
  userId: string,
  xpDelta: number,
  pointsDelta: number = xpDelta
): Promise<Partial<UserProfile>> {
  const sb = getSupabase();
  if (!sb || !userId) {
    throw new Error('Supabase client not initialized or unauthenticated.');
  }

  // 1. Try atomic PostgreSQL RPC
  try {
    const { data: rpcRes, error: rpcErr } = await sb.rpc('apply_user_progression_delta', {
      p_user_id: userId,
      p_xp_delta: xpDelta,
      p_points_delta: pointsDelta,
    });
    if (!rpcErr && rpcRes && typeof rpcRes === 'object' && !(rpcRes as any).error) {
      const typedRes = rpcRes as any;
      return {
        level: typedRes.level,
        currentXp: typedRes.currentXp ?? typedRes.xp,
        nextLevelXp: typedRes.nextLevelXp ?? typedRes.xp_to_next_level,
        totalPoints: typedRes.totalPoints ?? typedRes.momentum_points,
        momentumPoints: typedRes.momentumPoints ?? typedRes.momentum_points,
        streakDays: typedRes.streakDays ?? typedRes.streak_days,
        streak: typedRes.streakDays ?? typedRes.streak_days,
      };
    }
  } catch (rpcCatch) {
    console.warn('apply_user_progression_delta RPC fallback:', rpcCatch);
  }

  // 2. Fallback to client-side formula calculation and direct table update
  const { data: profile } = await sb
    .from('profiles')
    .select('xp, level, xp_to_next_level, momentum_points, streak_days')
    .eq('id', userId)
    .maybeSingle();

  if (!profile) {
    return {};
  }

  const prog = calculateProgressionDelta(
    {
      level: profile.level ?? 1,
      currentXp: profile.xp ?? 0,
      nextLevelXp: profile.xp_to_next_level ?? 500,
      momentumPoints: profile.momentum_points ?? 0,
      totalPoints: profile.momentum_points ?? 0,
    },
    xpDelta,
    pointsDelta
  );

  await sb
    .from('profiles')
    .update({
      xp: prog.currentXp,
      level: prog.level,
      xp_to_next_level: prog.nextLevelXp,
      momentum_points: prog.momentumPoints,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return {
    level: prog.level,
    currentXp: prog.currentXp,
    nextLevelXp: prog.nextLevelXp,
    totalPoints: prog.totalPoints,
    momentumPoints: prog.momentumPoints,
    streakDays: profile.streak_days ?? 0,
    streak: profile.streak_days ?? 0,
  };
}

/**
 * Calculates authoritative weekly completions, points, and consistency from Supabase
 */
export async function fetchWeeklyStatsFromSupabase(userId: string): Promise<{
  questsDoneThisWeek: number;
  pointsThisWeek: number;
  weeklyConsistency: number;
}> {
  const sb = getSupabase();
  if (!sb || !userId) {
    return { questsDoneThisWeek: 0, pointsThisWeek: 0, weeklyConsistency: 0 };
  }

  try {
    const todayStr = getLiveTodayISO();
    const mondayDate = getStartOfWeek(todayStr, 1);
    const startOfWeekStr = formatDateISO(mondayDate);

    // 1. Fetch habit completions this week
    const { data: compRows } = await sb
      .from('habit_completions')
      .select('completed_date, xp_earned')
      .eq('user_id', userId)
      .gte('completed_date', startOfWeekStr);

    // 2. Fetch completed tasks this week
    const { data: taskRows } = await sb
      .from('tasks')
      .select('completed, completed_at, description')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('completed_at', startOfWeekStr);

    // 3. Fetch count of active habits
    const { count: habitCount } = await sb
      .from('habits')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('archived', false);

    const habitCompletionsCount = compRows?.length || 0;
    const taskCompletionsCount = taskRows?.length || 0;
    const totalWeeklyCompletions = habitCompletionsCount + taskCompletionsCount;

    let habitXp = 0;
    (compRows || []).forEach((c: any) => {
      habitXp += Number(c.xp_earned) || 25;
    });

    let taskXp = 0;
    (taskRows || []).forEach((t: any) => {
      const meta = parseTaskDescription(t.description);
      taskXp += meta.xpReward || 15;
    });

    const pointsThisWeek = habitXp + taskXp;

    // Consistency: days elapsed in current week (Monday = 1, Sunday = 7)
    const now = new Date();
    const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
    const activeHabits = habitCount || 1;
    const expectedHabitCompletions = activeHabits * currentDayOfWeek;
    const consistency = Math.min(
      100,
      Math.round((habitCompletionsCount / Math.max(1, expectedHabitCompletions)) * 100)
    );

    return {
      questsDoneThisWeek: totalWeeklyCompletions,
      pointsThisWeek,
      weeklyConsistency: consistency,
    };
  } catch (err) {
    console.warn('Error fetching weekly stats from Supabase:', err);
    return { questsDoneThisWeek: 0, pointsThisWeek: 0, weeklyConsistency: 0 };
  }
}

/**
 * Toggles task completion state in Supabase Postgres and synchronizes profile XP & Momentum Points
 */
export async function toggleUserTaskInSupabase(
  userId: string,
  taskId: string,
  completed: boolean
): Promise<{ task: TaskItem; userProgression?: Partial<UserProfile> }> {
  const sb = getSupabase();
  if (!sb || !userId) {
    throw new Error('Supabase client not initialized or unauthenticated.');
  }

  const updatePayload = {
    completed,
    completed_at: completed ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await sb
    .from('tasks')
    .update(updatePayload)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) {
    console.error('Error toggling task in Supabase:', error);
    throw new Error(`Failed to update task status in database: ${error?.message || 'Task not found'}`);
  }

  const mappedTask = mapTaskRowToTaskItem(data);
  const xpReward = mappedTask.xpReward || 15;
  const xpChange = completed ? xpReward : -xpReward;

  // Persist updated progression to profiles in Supabase
  let userProgression: Partial<UserProfile> | undefined = undefined;
  try {
    userProgression = await applyUserProgressionDeltaInSupabase(userId, xpChange, xpChange);
  } catch (progErr) {
    console.warn('Failed to update user progression for task:', progErr);
  }

  return { task: mappedTask, userProgression };
}

/**
 * Deletes a task from Supabase Postgres
 */
export async function deleteUserTaskInSupabase(userId: string, taskId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb || !userId) {
    throw new Error('Supabase client not initialized or unauthenticated.');
  }

  const { error } = await sb
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting task in Supabase:', error);
    throw new Error(`Failed to delete task from database: ${error.message}`);
  }
}

/**
 * Fetches user profile from public.profiles in Supabase
 */
export async function fetchUserProfileFromSupabase(userId: string): Promise<{
  profile: any;
  userProgression: UserProfile;
} | null> {
  const sb = getSupabase();
  if (!sb || !userId) return null;

  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Error fetching profile from Supabase:', error);
    return null;
  }

  if (!data) return null;

  // Verify authoritative streak with PostgreSQL calculation engine
  let authoritativeStreak = data.streak_days || 0;
  try {
    const todayStr = getLiveTodayISO();
    const { data: rpcStreak, error: rpcErr } = await sb.rpc('calculate_user_streak', {
      p_user_id: userId,
      p_today: todayStr,
    });
    if (!rpcErr && typeof rpcStreak === 'number') {
      authoritativeStreak = rpcStreak;
      if (rpcStreak !== data.streak_days) {
        sb.from('profiles').update({ streak_days: rpcStreak }).eq('id', userId).then();
      }
    }
  } catch {
    // Fallback to persisted streak_days
  }

  // Calculate authoritative weekly stats
  const weeklyStats = await fetchWeeklyStatsFromSupabase(userId);

  const rawPoints = typeof data.momentum_points === 'number' ? data.momentum_points : 0;
  const userProgression: UserProfile = {
    ...initialUserProfile,
    name: data.display_name || initialUserProfile.name,
    displayName: data.display_name || initialUserProfile.displayName || initialUserProfile.name,
    username: data.username || initialUserProfile.username || '',
    avatarUrl: data.avatar_url || initialUserProfile.avatarUrl,
    bio: data.bio || initialUserProfile.bio,
    level: data.level ?? 1,
    currentXp: data.xp ?? 0,
    nextLevelXp: data.xp_to_next_level || getXpRequiredForLevel(data.level ?? 1),
    totalPoints: rawPoints,
    momentumPoints: rawPoints,
    streak: authoritativeStreak,
    streakDays: authoritativeStreak,
    questsDoneThisWeek: weeklyStats.questsDoneThisWeek,
    pointsThisWeek: weeklyStats.pointsThisWeek,
    weeklyConsistency: weeklyStats.weeklyConsistency,
  };

  return { profile: data, userProgression };
}

/**
 * Updates user profile in public.profiles in Supabase Postgres
 */
export async function updateUserProfileInSupabase(
  userId: string,
  updates: {
    displayName?: string;
    username?: string;
    bio?: string;
    avatarUrl?: string;
    level?: number;
    xp?: number;
    nextLevelXp?: number;
    streakDays?: number;
    momentumPoints?: number;
  }
): Promise<any> {
  const sb = getSupabase();
  if (!sb || !userId) {
    throw new Error('Supabase client not initialized or unauthenticated.');
  }

  const patch: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.displayName !== undefined) patch.display_name = updates.displayName.trim();
  if (updates.username !== undefined) patch.username = updates.username.trim();
  if (updates.bio !== undefined) patch.bio = updates.bio.trim();
  if (updates.avatarUrl !== undefined) patch.avatar_url = updates.avatarUrl.trim();
  if (updates.level !== undefined) patch.level = updates.level;
  if (updates.xp !== undefined) patch.xp = updates.xp;
  if (updates.nextLevelXp !== undefined) patch.xp_to_next_level = updates.nextLevelXp;
  if (updates.streakDays !== undefined) patch.streak_days = updates.streakDays;
  if (updates.momentumPoints !== undefined) patch.momentum_points = updates.momentumPoints;

  const { data, error } = await sb
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating profile in Supabase:', error);
    throw new Error(`Failed to update profile in database: ${error?.message || 'Access denied'}`);
  }

  return data;
}

/**
 * Helper to convert a File or Blob into a base64 Data URL
 */
function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an avatar image to the Supabase Storage 'avatars' bucket.
 * Uses backend /api/user/avatar endpoint (with service-role credentials)
 * or falls back to direct client Supabase Storage upload.
 */
export async function uploadAvatarImage(
  userId: string,
  file: File | Blob,
  token?: string | null
): Promise<string> {
  const mimeType = file.type || 'image/png';
  if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimeType)) {
    throw new Error('Unsupported image format. Allowed formats: JPG, PNG, GIF, WebP.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size exceeds 5MB limit. Please choose a smaller photo.');
  }

  // 1. First attempt: Send base64 payload to the backend /api/user/avatar endpoint
  try {
    const dataUrl = await fileToDataUrl(file);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/user/avatar', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        avatarBase64: dataUrl,
        userId,
        mimeType,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.avatarUrl) {
        return json.avatarUrl;
      }
    }
  } catch (backendErr) {
    console.warn('Backend avatar upload endpoint note:', backendErr);
  }

  // 2. Second attempt: Direct client upload via Supabase storage
  const sb = getSupabase();
  if (sb) {
    const ext = mimeType.split('/')[1] || 'png';
    const filePath = `${userId}/avatar-${Date.now()}.${ext}`;

    const { data, error } = await sb.storage.from('avatars').upload(filePath, file, {
      contentType: mimeType,
      upsert: true,
    });

    if (!error && data) {
      const { data: pubData } = sb.storage.from('avatars').getPublicUrl(filePath);
      if (pubData?.publicUrl) {
        // Update user profile record with new public URL
        await sb
          .from('profiles')
          .update({ avatar_url: pubData.publicUrl, updated_at: new Date().toISOString() })
          .eq('id', userId);

        return pubData.publicUrl;
      }
    }
  }

  throw new Error('Failed to upload image to Supabase Storage. Please try again.');
}

export interface SerializedHabitPayload {
  subtitle?: string;
  durationMinutes?: number;
  attribute?: 'Intellect' | 'Strength' | 'Knowledge' | 'Discipline';
  questCategory?: 'focus' | 'health' | 'learning' | 'personal';
  isStarted?: boolean;
}

export function serializeHabitDescription(payload: SerializedHabitPayload): string {
  return JSON.stringify(payload);
}

export function parseHabitDescription(rawDesc: string | null | undefined): {
  subtitle: string;
  durationMinutes: number;
  attribute: 'Intellect' | 'Strength' | 'Knowledge' | 'Discipline';
  questCategory: 'focus' | 'health' | 'learning' | 'personal';
  isStarted: boolean;
} {
  const defaultResult = {
    subtitle: 'Daily quest',
    durationMinutes: 20,
    attribute: 'Discipline' as const,
    questCategory: 'personal' as const,
    isStarted: false,
  };

  if (!rawDesc) return defaultResult;

  const trimmed = rawDesc.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed: SerializedHabitPayload = JSON.parse(trimmed);
      return {
        subtitle: typeof parsed.subtitle === 'string' ? parsed.subtitle : defaultResult.subtitle,
        durationMinutes: typeof parsed.durationMinutes === 'number' ? parsed.durationMinutes : 20,
        attribute: (['Intellect', 'Strength', 'Knowledge', 'Discipline'].includes(parsed.attribute || '')
          ? parsed.attribute
          : 'Discipline') as 'Intellect' | 'Strength' | 'Knowledge' | 'Discipline',
        questCategory: (['focus', 'health', 'learning', 'personal'].includes(parsed.questCategory || '')
          ? parsed.questCategory
          : 'personal') as 'focus' | 'health' | 'learning' | 'personal',
        isStarted: Boolean(parsed.isStarted),
      };
    } catch {
      // Treat as plain text
    }
  }

  return {
    ...defaultResult,
    subtitle: trimmed,
  };
}

export function mapQuestCategoryToDbCategory(
  cat: string
): 'daily' | 'fitness' | 'learning' | 'mindfulness' | 'career' | 'health' | 'creative' {
  switch (cat) {
    case 'health':
      return 'health';
    case 'learning':
      return 'learning';
    case 'focus':
      return 'mindfulness';
    case 'personal':
    default:
      return 'daily';
  }
}

/**
 * Fetches all active habits and today's completion states for a user from Supabase
 */
export async function fetchUserHabitsFromSupabase(userId: string): Promise<Quest[]> {
  const sb = getSupabase();
  if (!sb || !userId) return [];

  let { data: habits, error } = await sb
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('archived', false)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching habits from Supabase:', error);
    throw new Error(`Failed to load habits from database: ${error.message}`);
  }

  if (!habits || habits.length === 0) {
    return [];
  }

  // Fetch today's completions for this user
  const todayDate = getLiveTodayISO();
  const { data: completions, error: compError } = await sb
    .from('habit_completions')
    .select('habit_id')
    .eq('user_id', userId)
    .eq('completed_date', todayDate);

  if (compError) {
    console.warn('Error fetching habit completions from Supabase:', compError);
  }

  const completedSet = new Set((completions || []).map((c: any) => c.habit_id));

  return habits.map((h: any) => mapHabitRowToQuest(h, completedSet.has(h.id)));
}

/**
 * Maps a Supabase habits row and completion status into a typed Quest item.
 */
export function mapHabitRowToQuest(row: any, isCompleted: boolean = false): Quest {
  const meta = parseHabitDescription(row?.description);
  return {
    id: row?.id || `quest-${Date.now()}`,
    title: row?.title || 'Daily Quest',
    subtitle: meta.subtitle,
    category: meta.questCategory,
    durationMinutes: meta.durationMinutes,
    xpReward: row?.xp_reward || 25,
    attribute: meta.attribute,
    completed: isCompleted,
    isStarted: meta.isStarted,
  };
}

/**
 * Toggles habit completion in Supabase Postgres.
 * Inserts into public.habit_completions on complete, deletes on uncomplete.
 * Respects unique constraint (habit_id, completed_date).
 * Updates user profile XP and momentum points accordingly.
 */
export async function toggleHabitCompletionInSupabase(
  userId: string,
  habitIdOrQuestId: string,
  forceCompleted?: boolean
): Promise<Quest & { userProgression?: Partial<UserProfile> }> {
  const sb = getSupabase();
  if (!sb || !userId) {
    throw new Error('Supabase client not initialized or unauthenticated.');
  }

  let habitRow: any = null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(habitIdOrQuestId);
  if (isUuid) {
    const { data } = await sb
      .from('habits')
      .select('*')
      .eq('id', habitIdOrQuestId)
      .eq('user_id', userId)
      .maybeSingle();
    habitRow = data;
  }

  if (!habitRow) {
    const { data: allHabits } = await sb
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('archived', false)
      .order('created_at', { ascending: true });

    if (allHabits && allHabits.length > 0) {
      habitRow =
        allHabits.find((h: any) => h.id === habitIdOrQuestId) ||
        allHabits.find(
          (h: any, idx: number) =>
            habitIdOrQuestId === `quest-${idx + 1}` ||
            h.title.toLowerCase().includes(habitIdOrQuestId.toLowerCase())
        ) ||
        allHabits[0];
    }
  }

  if (!habitRow) {
    throw new Error('Habit not found in database.');
  }

  const todayDate = getLiveTodayISO();
  const { data: existingCompletion } = await sb
    .from('habit_completions')
    .select('*')
    .eq('habit_id', habitRow.id)
    .eq('user_id', userId)
    .eq('completed_date', todayDate)
    .maybeSingle();

  const isNowCompleted = forceCompleted !== undefined ? forceCompleted : !existingCompletion;
  const xpReward = habitRow.xp_reward || 25;

  if (isNowCompleted) {
    const { error: insErr } = await sb
      .from('habit_completions')
      .upsert(
        {
          habit_id: habitRow.id,
          user_id: userId,
          completed_date: todayDate,
          xp_earned: xpReward,
        },
        { onConflict: 'habit_id,completed_date' }
      );

    if (insErr) {
      console.error('Error inserting habit completion in Supabase:', insErr);
      throw new Error(`Failed to record habit completion: ${insErr.message}`);
    }
  } else {
    const { error: delErr } = await sb
      .from('habit_completions')
      .delete()
      .eq('habit_id', habitRow.id)
      .eq('user_id', userId)
      .eq('completed_date', todayDate);

    if (delErr) {
      console.error('Error deleting habit completion from Supabase:', delErr);
      throw new Error(`Failed to remove habit completion: ${delErr.message}`);
    }
  }

  // Update profile XP & momentum using centralized progression engine
  const xpChange = isNowCompleted ? xpReward : -xpReward;
  let updatedProgression: Partial<UserProfile> | undefined = undefined;

  try {
    updatedProgression = await applyUserProgressionDeltaInSupabase(userId, xpChange, xpChange);

    // Fetch authoritative streak_days updated by PostgreSQL trigger
    const { data: profAfter } = await sb
      .from('profiles')
      .select('streak_days')
      .eq('id', userId)
      .maybeSingle();

    if (profAfter && typeof profAfter.streak_days === 'number') {
      updatedProgression.streakDays = profAfter.streak_days;
      updatedProgression.streak = profAfter.streak_days;
    }
  } catch (err) {
    console.warn('Failed to update progression for habit:', err);
  }

  const meta = parseHabitDescription(habitRow.description);
  return {
    id: habitRow.id,
    title: habitRow.title,
    subtitle: meta.subtitle,
    category: meta.questCategory,
    durationMinutes: meta.durationMinutes,
    xpReward: habitRow.xp_reward || 25,
    attribute: meta.attribute,
    completed: isNowCompleted,
    isStarted: meta.isStarted,
    userProgression: updatedProgression,
  } as Quest & { userProgression?: Partial<UserProfile> };
}

/**
 * Updates an existing habit in Supabase Postgres
 */
export async function updateUserHabitInSupabase(
  userId: string,
  habitId: string,
  updates: Partial<Quest>
): Promise<Quest> {
  const sb = getSupabase();
  if (!sb || !userId) {
    throw new Error('Supabase client not initialized or unauthenticated.');
  }

  // Fetch current habit row to merge description metadata cleanly
  const { data: existing, error: fetchErr } = await sb
    .from('habits')
    .select('*')
    .eq('id', habitId)
    .eq('user_id', userId)
    .single();

  if (fetchErr || !existing) {
    throw new Error(`Failed to find habit for update: ${fetchErr?.message || 'Not found'}`);
  }

  const existingMeta = parseHabitDescription(existing.description);
  const updatedMeta = {
    subtitle: updates.subtitle !== undefined ? updates.subtitle : existingMeta.subtitle,
    durationMinutes: updates.durationMinutes !== undefined ? updates.durationMinutes : existingMeta.durationMinutes,
    attribute: updates.attribute !== undefined ? updates.attribute : existingMeta.attribute,
    questCategory: updates.category !== undefined ? updates.category : existingMeta.questCategory,
    isStarted: updates.isStarted !== undefined ? updates.isStarted : existingMeta.isStarted,
  };

  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) updatePayload.title = updates.title.trim();
  if (updates.category !== undefined) updatePayload.category = mapQuestCategoryToDbCategory(updates.category);
  if (updates.xpReward !== undefined) updatePayload.xp_reward = updates.xpReward;
  updatePayload.description = serializeHabitDescription(updatedMeta);

  const { data, error } = await sb
    .from('habits')
    .update(updatePayload)
    .eq('id', habitId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating habit in Supabase:', error);
    throw new Error(`Failed to update habit: ${error?.message || 'Unknown error'}`);
  }

  const meta = parseHabitDescription(data.description);
  return {
    id: data.id,
    title: data.title,
    subtitle: meta.subtitle,
    category: meta.questCategory,
    durationMinutes: meta.durationMinutes,
    xpReward: data.xp_reward || 25,
    attribute: meta.attribute,
    completed: updates.completed ?? false,
    isStarted: meta.isStarted,
  };
}

/**
 * Deletes a habit and its completions from Supabase Postgres
 */
export async function deleteUserHabitInSupabase(
  userId: string,
  habitId: string
): Promise<void> {
  const sb = getSupabase();
  if (!sb || !userId) {
    throw new Error('Supabase client not initialized or unauthenticated.');
  }

  // 1. Delete associated habit completions first
  await sb
    .from('habit_completions')
    .delete()
    .eq('habit_id', habitId)
    .eq('user_id', userId);

  // 2. Delete the habit
  const { error } = await sb
    .from('habits')
    .delete()
    .eq('id', habitId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting habit from Supabase:', error);
    throw new Error(`Failed to delete habit: ${error.message}`);
  }
}

/**
 * Creates a new habit for the authenticated user in Supabase Postgres
 */
export async function createUserHabitInSupabase(
  userId: string,
  questData: Omit<Quest, 'id' | 'completed'>
): Promise<Quest> {
  const sb = getSupabase();
  if (!sb || !userId) {
    throw new Error('Supabase client not initialized or unauthenticated.');
  }

  const payload = {
    user_id: userId,
    title: questData.title.trim(),
    description: serializeHabitDescription({
      subtitle: questData.subtitle,
      durationMinutes: questData.durationMinutes,
      attribute: questData.attribute,
      questCategory: questData.category,
      isStarted: questData.isStarted,
    }),
    category: mapQuestCategoryToDbCategory(questData.category),
    difficulty: 'medium',
    xp_reward: questData.xpReward || 25,
    streak: 0,
    best_streak: 0,
  };

  const { data, error } = await sb
    .from('habits')
    .insert(payload)
    .select('*')
    .single();

  if (error || !data) {
    console.error('Error creating habit in Supabase:', error);
    throw new Error(`Failed to create habit in database: ${error?.message || 'Unknown error'}`);
  }

  const meta = parseHabitDescription(data.description);
  return {
    id: data.id,
    title: data.title,
    subtitle: meta.subtitle,
    category: meta.questCategory,
    durationMinutes: meta.durationMinutes,
    xpReward: data.xp_reward || 25,
    attribute: meta.attribute,
    completed: false,
    isStarted: meta.isStarted,
  };
}

/**
 * Temporary verification helper to manually test public.calculate_user_streak() in Supabase
 */
export async function verifyCurrentAuthUserStreak(customDate?: string): Promise<{
  success: boolean;
  userId?: string;
  referenceDate: string;
  rpcStreak?: number;
  profileStreak?: number;
  match?: boolean;
  error?: string;
}> {
  const sb = getSupabase();
  const { data: authData } = await sb.auth.getSession();
  const session = authData?.session;

  if (!session?.user?.id) {
    return {
      success: false,
      referenceDate: customDate || getLiveTodayISO(),
      error: 'No authenticated user session found in Supabase.',
    };
  }

  const userId = session.user.id;
  const targetDate = customDate || getLiveTodayISO();

  try {
    // 1. Call calculate_user_streak directly via RPC
    const { data: rpcVal, error: rpcErr } = await sb.rpc('calculate_user_streak', {
      p_user_id: userId,
      p_today: targetDate,
    });

    if (rpcErr) {
      return {
        success: false,
        userId,
        referenceDate: targetDate,
        error: `RPC call failed: ${rpcErr.message}`,
      };
    }

    // 2. Fetch current profile value from profiles table
    const { data: profileRow, error: profileErr } = await sb
      .from('profiles')
      .select('streak_days')
      .eq('id', userId)
      .single();

    const profileStreak = profileRow?.streak_days ?? 0;
    const rpcStreak = typeof rpcVal === 'number' ? rpcVal : 0;

    return {
      success: true,
      userId,
      referenceDate: targetDate,
      rpcStreak,
      profileStreak: profileErr ? undefined : profileStreak,
      match: profileErr ? undefined : rpcStreak === profileStreak,
    };
  } catch (err: any) {
    return {
      success: false,
      userId,
      referenceDate: targetDate,
      error: err?.message || 'Unknown error during streak verification',
    };
  }
}

/**
 * Fetches authoritative rewards catalog and user-scoped claims from Supabase
 */
export async function fetchUserRewardsFromSupabase(userId?: string): Promise<{
  rewards: RewardItem[];
  claims: any[];
  collection: CollectionItem[];
}> {
  const sb = getSupabase();
  if (!sb) {
    return { rewards: [], claims: [], collection: [] };
  }

  try {
    // 1. Fetch active reward catalog
    const { data: catalogRows, error: catalogErr } = await sb
      .from('rewards')
      .select('*')
      .eq('active', true)
      .order('cost', { ascending: true });

    if (catalogErr) {
      console.warn('Error fetching rewards catalog from Supabase:', catalogErr.message);
      return { rewards: [], claims: [], collection: [] };
    }

    // 2. Fetch user claims if authenticated
    let userClaims: any[] = [];
    if (userId) {
      const { data: claimsData, error: claimsErr } = await sb
        .from('reward_claims')
        .select('*')
        .eq('user_id', userId);

      if (!claimsErr && claimsData) {
        userClaims = claimsData;
      }
    }

    const claimsByRewardId = new Map<string, any>();
    userClaims.forEach((claim) => {
      claimsByRewardId.set(claim.reward_id, claim);
    });

    // 3. Map into UI RewardItem models
    const rewards: RewardItem[] = (catalogRows || []).map((row) => {
      const claim = claimsByRewardId.get(row.id);
      let status: 'locked' | 'available' | 'owned' | 'active' = 'available';
      if (claim) {
        status = claim.is_active ? 'active' : 'owned';
      }

      return {
        id: row.id,
        name: row.title,
        category: (row.category as any) || 'themes',
        badgeTag: row.badge_tag || row.badge_level || 'Reward',
        description: row.description || '',
        cost: row.cost,
        status,
        previewType: (row.preview_type as any) || 'custom',
        accentColor: row.accent_color || '#38BDF8',
        includes: Array.isArray(row.includes) ? row.includes : [],
      };
    });

    // 4. Map user claims into CollectionItem models
    const collection: CollectionItem[] = userClaims.map((claim) => {
      const reward = (catalogRows || []).find((r) => r.id === claim.reward_id);
      return {
        id: claim.id,
        name: reward?.title || 'Reward Item',
        type: (reward?.badge_tag as any) || 'Theme',
        icon: reward?.preview_type || 'star',
        active: Boolean(claim.is_active),
      };
    });

    return { rewards, claims: userClaims, collection };
  } catch (err) {
    console.error('Failed to fetch rewards from Supabase:', err);
    return { rewards: [], claims: [], collection: [] };
  }
}

/**
 * Claims a reward atomically via Supabase claim_user_reward RPC
 */
export async function claimUserRewardInSupabase(
  rewardId: string,
  termsAccepted: boolean = true
): Promise<{
  success: boolean;
  reward?: RewardItem;
  claim?: any;
  remainingPoints?: number;
  error?: string;
}> {
  const sb = getSupabase();
  if (!sb) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await sb.rpc('claim_user_reward', {
    p_reward_id: rewardId,
    p_terms_accepted: termsAccepted,
  });

  if (error) {
    console.error('Supabase claim_user_reward RPC error:', error);
    throw new Error(error.message || 'Failed to claim reward');
  }

  const r = data?.reward;
  const mappedReward: RewardItem | undefined = r
    ? {
        id: r.id,
        name: r.title,
        category: r.category,
        badgeTag: r.badge_tag || 'Reward',
        description: r.description || '',
        cost: r.cost,
        status: 'active',
        previewType: r.preview_type || 'custom',
        accentColor: r.accent_color,
        includes: r.includes || [],
      }
    : undefined;

  return {
    success: true,
    reward: mappedReward,
    claim: {
      id: data?.claim_id,
      rewardId,
      transactionHash: data?.transaction_hash,
      status: 'fulfilled',
      isActive: true,
    },
    remainingPoints: data?.remaining_points,
  };
}

/**
 * Equips / activates an owned reward cosmetic via Supabase activate_user_reward RPC
 */
export async function activateUserRewardInSupabase(
  rewardId: string
): Promise<{
  success: boolean;
  rewardId: string;
  category?: string;
  status: string;
}> {
  const sb = getSupabase();
  if (!sb) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await sb.rpc('activate_user_reward', {
    p_reward_id: rewardId,
  });

  if (error) {
    console.error('Supabase activate_user_reward RPC error:', error);
    throw new Error(error.message || 'Failed to activate reward');
  }

  return {
    success: true,
    rewardId: data?.reward_id || rewardId,
    category: data?.category,
    status: data?.status || 'active',
  };
}

// ============================================================================
// PHASE 4: FRIENDS & SOCIAL ACCOUNTABILITY FUNCTIONS
// ============================================================================

function formatRelativeTime(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return 'Recently';
  }
}

/**
 * Fetches all accepted friends of the given user from Supabase
 */
export async function fetchUserFriendsFromSupabase(userId: string): Promise<FriendUser[]> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase client not initialized');

  const { data: friendships, error: fError } = await sb
    .from('friendships')
    .select('id, user_id1, user_id2, created_at')
    .or(`user_id1.eq.${userId},user_id2.eq.${userId}`);

  if (fError) {
    console.error('Error fetching friendships from Supabase:', fError);
    throw new Error(fError.message || 'Failed to fetch friends');
  }

  if (!friendships || friendships.length === 0) {
    return [];
  }

  const friendIds = friendships.map((f) => (f.user_id1 === userId ? f.user_id2 : f.user_id1));

  const { data: profiles, error: pError } = await sb
    .from('profiles')
    .select('id, username, display_name, avatar_url, level, xp, streak_days, bio, updated_at')
    .in('id', friendIds);

  if (pError) {
    console.error('Error fetching friend profiles from Supabase:', pError);
    throw new Error(pError.message || 'Failed to fetch friend profiles');
  }

  return (profiles || []).map((p) => ({
    id: p.id,
    name: p.display_name || p.username || 'Adventurer',
    username: p.username || 'user',
    avatarUrl: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    level: p.level || 1,
    xp: p.xp || 0,
    consistencyDays: p.streak_days || 0,
    status: 'online',
    activityStatus: 'Active',
    bio: p.bio || undefined,
    isFriend: true,
    tags: ['Accountability'],
  }));
}

/**
 * Fetches incoming pending friend requests for the user from Supabase
 */
export async function fetchFriendRequestsFromSupabase(userId: string): Promise<FriendRequest[]> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase client not initialized');

  const { data: requests, error: rError } = await sb
    .from('friend_requests')
    .select('id, sender_id, receiver_id, status, reason, created_at')
    .eq('receiver_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (rError) {
    console.error('Error fetching friend requests from Supabase:', rError);
    throw new Error(rError.message || 'Failed to fetch friend requests');
  }

  if (!requests || requests.length === 0) {
    return [];
  }

  const senderIds = requests.map((r) => r.sender_id);
  const { data: profiles, error: pError } = await sb
    .from('profiles')
    .select('id, username, display_name, avatar_url, level')
    .in('id', senderIds);

  if (pError) {
    console.error('Error fetching sender profiles from Supabase:', pError);
  }

  const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

  return requests.map((r) => {
    const sender = profileMap.get(r.sender_id);
    return {
      id: r.id,
      name: sender?.display_name || sender?.username || 'Adventurer',
      username: sender?.username || 'user',
      avatarUrl: sender?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      reason: r.reason || 'Accountability partner request',
      timeAgo: formatRelativeTime(r.created_at),
    };
  });
}

/**
 * Sends a friend request using the atomic public.send_friend_request RPC
 */
export async function sendFriendRequestInSupabase(
  recipientId: string,
  reason?: string
): Promise<any> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase client not initialized');

  const { data, error } = await sb.rpc('send_friend_request', {
    p_receiver_id: recipientId,
    p_reason: reason || null,
  });

  if (error) {
    console.error('Supabase send_friend_request error:', error);
    throw new Error(error.message || 'Failed to send friend request');
  }

  return data;
}

/**
 * Accepts a pending friend request using the atomic public.accept_friend_request RPC
 */
export async function acceptFriendRequestInSupabase(requestId: string): Promise<any> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase client not initialized');

  const { data, error } = await sb.rpc('accept_friend_request', {
    p_request_id: requestId,
  });

  if (error) {
    console.error('Supabase accept_friend_request error:', error);
    throw new Error(error.message || 'Failed to accept friend request');
  }

  return data;
}

/**
 * Declines a pending friend request using public.decline_friend_request RPC
 */
export async function declineFriendRequestInSupabase(requestId: string): Promise<any> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase client not initialized');

  const { data, error } = await sb.rpc('decline_friend_request', {
    p_request_id: requestId,
  });

  if (error) {
    console.error('Supabase decline_friend_request error:', error);
    throw new Error(error.message || 'Failed to decline friend request');
  }

  return data;
}

/**
 * Cancels an outgoing pending friend request using public.cancel_friend_request RPC
 */
export async function cancelFriendRequestInSupabase(requestId: string): Promise<any> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase client not initialized');

  const { data, error } = await sb.rpc('cancel_friend_request', {
    p_request_id: requestId,
  });

  if (error) {
    console.error('Supabase cancel_friend_request error:', error);
    throw new Error(error.message || 'Failed to cancel friend request');
  }

  return data;
}

/**
 * Removes an existing friend using public.remove_friend RPC
 */
export async function removeFriendInSupabase(friendId: string): Promise<any> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase client not initialized');

  const { data, error } = await sb.rpc('remove_friend', {
    p_friend_id: friendId,
  });

  if (error) {
    console.error('Supabase remove_friend error:', error);
    throw new Error(error.message || 'Failed to remove friend');
  }

  return data;
}

/**
 * Searches users in Supabase profiles by username or display_name
 * Excludes self, existing friends, pending requests, and blocked users.
 */
export async function searchUsersInSupabase(
  query: string,
  currentUserId?: string
): Promise<any[]> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase client not initialized');

  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const excludedIds = new Set<string>();
  if (currentUserId) {
    excludedIds.add(currentUserId);

    // 1. Fetch friend IDs
    const { data: friendships } = await sb
      .from('friendships')
      .select('user_id1, user_id2')
      .or(`user_id1.eq.${currentUserId},user_id2.eq.${currentUserId}`);

    (friendships || []).forEach((f) => {
      excludedIds.add(f.user_id1);
      excludedIds.add(f.user_id2);
    });

    // 2. Fetch pending requests
    const { data: pendingReqs } = await sb
      .from('friend_requests')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .eq('status', 'pending');

    (pendingReqs || []).forEach((r) => {
      excludedIds.add(r.sender_id);
      excludedIds.add(r.receiver_id);
    });

    // 3. Fetch blocked users
    const { data: blockedUsers } = await sb
      .from('blocked_users')
      .select('blocker_id, blocked_id')
      .or(`blocker_id.eq.${currentUserId},blocked_id.eq.${currentUserId}`);

    (blockedUsers || []).forEach((b) => {
      excludedIds.add(b.blocker_id);
      excludedIds.add(b.blocked_id);
    });
  }

  let queryBuilder = sb
    .from('profiles')
    .select('id, username, display_name, avatar_url, level, xp, streak_days')
    .or(`username.ilike.%${trimmed}%,display_name.ilike.%${trimmed}%`)
    .limit(10);

  if (excludedIds.size > 0) {
    const idsArray = Array.from(excludedIds);
    queryBuilder = queryBuilder.not('id', 'in', `(${idsArray.join(',')})`);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Supabase searchUsers error:', error);
    throw new Error(error.message || 'Failed to search users');
  }

  return (data || []).map((p) => ({
    id: p.id,
    name: p.display_name || p.username || 'Adventurer',
    username: p.username || 'user',
    avatarUrl: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    level: p.level || 1,
    xp: p.xp || 0,
    consistencyDays: p.streak_days || 0,
    status: 'online',
    reason: `Level ${p.level || 1} Adventurer`,
  }));
}

/**
 * Fetches suggested friends from public profiles excluding already friends, pending requests, blocked users, or self
 */
export async function fetchSuggestedFriendsFromSupabase(
  currentUserId: string
): Promise<SuggestedFriend[]> {
  const sb = getSupabase();
  if (!sb) return [];

  try {
    // 1. Get friend IDs
    const { data: friendships } = await sb
      .from('friendships')
      .select('user_id1, user_id2')
      .or(`user_id1.eq.${currentUserId},user_id2.eq.${currentUserId}`);

    const excludedIds = new Set<string>([currentUserId]);
    (friendships || []).forEach((f) => {
      excludedIds.add(f.user_id1);
      excludedIds.add(f.user_id2);
    });

    // 2. Get pending requests
    const { data: pendingReqs } = await sb
      .from('friend_requests')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .eq('status', 'pending');

    (pendingReqs || []).forEach((r) => {
      excludedIds.add(r.sender_id);
      excludedIds.add(r.receiver_id);
    });

    // 3. Get blocked users
    const { data: blockedUsers } = await sb
      .from('blocked_users')
      .select('blocker_id, blocked_id')
      .or(`blocker_id.eq.${currentUserId},blocked_id.eq.${currentUserId}`);

    (blockedUsers || []).forEach((b) => {
      excludedIds.add(b.blocker_id);
      excludedIds.add(b.blocked_id);
    });

    // 4. Query profiles
    const { data: profiles, error } = await sb
      .from('profiles')
      .select('id, username, display_name, avatar_url, level, streak_days')
      .limit(20);

    if (error || !profiles) return [];

    const candidates = profiles.filter((p) => !excludedIds.has(p.id)).slice(0, 6);

    return candidates.map((p) => ({
      id: p.id,
      name: p.display_name || p.username || 'Adventurer',
      username: p.username || 'user',
      avatarUrl: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      sharedInterest: `Lv. ${p.level || 1} • ${p.streak_days || 0}d streak`,
    }));
  } catch (err) {
    console.warn('Error fetching suggested friends from Supabase:', err);
    return [];
  }
}

/**
 * Computes authentic friends progress data for authenticated user from Supabase
 */
export async function fetchFriendsProgressFromSupabase(userId: string): Promise<any> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase client not initialized');

  // 1. Fetch current user profile
  const { data: currentUserProfile, error: uError } = await sb
    .from('profiles')
    .select('id, username, display_name, avatar_url, level, xp, streak_days')
    .eq('id', userId)
    .single();

  if (uError && uError.code !== 'PGRST116') {
    console.error('Error fetching user profile for friends progress:', uError);
  }

  // 2. Fetch friends
  const friends = await fetchUserFriendsFromSupabase(userId);

  // User entity for leaderboard
  const userEntry: FriendUser = {
    id: userId,
    name: currentUserProfile?.display_name || currentUserProfile?.username || 'You',
    username: currentUserProfile?.username || 'you',
    avatarUrl: currentUserProfile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    level: currentUserProfile?.level || 1,
    xp: currentUserProfile?.xp || 0,
    consistencyDays: currentUserProfile?.streak_days || 0,
    status: 'online',
    isCurrentUser: true,
    isFriend: false,
  };

  // 3. Combined leaderboard (User + Friends)
  const leaderboard = [userEntry, ...friends].sort((a, b) => b.xp - a.xp);

  // 4. XP Comparison bar chart items (Real data only)
  const xpComparison = [
    {
      name: 'You',
      xp: currentUserProfile?.xp || 0,
      display: `${currentUserProfile?.xp || 0} XP`,
      color: '#6366F1',
    },
    ...friends.map((f, i) => ({
      name: f.name,
      xp: f.xp,
      display: `${f.xp} XP`,
      color: ['#EC4899', '#38BDF8', '#10B981', '#F59E0B', '#A855F7'][i % 5],
    })),
  ];

  // 5. Consistency Streaks (Real data only)
  const consistencyStreaks = [
    {
      name: 'You',
      days: currentUserProfile?.streak_days || 0,
      avatarUrl: currentUserProfile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isCurrent: true,
    },
    ...friends.map((f) => ({
      name: f.name,
      days: f.consistencyDays,
      avatarUrl: f.avatarUrl,
      isCurrent: false,
    })),
  ];

  return {
    friends,
    leaderboard,
    xpComparison,
    consistencyStreaks,
    summary: {
      friendsCount: friends.length,
      onlineCount: friends.filter((f) => f.status === 'online').length,
      totalXp: friends.reduce((acc, f) => acc + f.xp, 0),
    },
  };
}

// =========================================================================
// GOALS & MILESTONES SUPABASE PERSISTENCE ENGINE
// =========================================================================

/**
 * Normalizes goal categories from database or payload into valid GoalCategory.
 */
export function normalizeGoalCategory(cat?: string | null): GoalCategory {
  if (!cat) return 'Personal';
  const lower = cat.toLowerCase();
  if (lower === 'career') return 'Career';
  if (lower === 'health') return 'Health';
  if (lower === 'learning' || lower === 'education') return 'Learning';
  if (lower === 'personal') return 'Personal';
  if (lower === 'projects' || lower === 'project') return 'Projects';
  if (lower === 'custom') return 'Custom';
  return 'Personal';
}

/**
 * Single authoritative calculation for goal progress, task counts, and status.
 * Prevents competing formulas between GoalsPage, GoalCard, Modal, Dashboard, and Realtime.
 */
export function calculateGoalMetrics(
  goal: Pick<DetailedGoal, 'subtasks' | 'milestones' | 'progress' | 'completedTasks' | 'totalTasks' | 'status'>
): {
  progress: number;
  completedTasks: number;
  totalTasks: number;
  status: GoalStatus;
} {
  const subtasks = Array.isArray(goal.subtasks) ? goal.subtasks : [];
  const milestones = Array.isArray(goal.milestones) ? goal.milestones : [];

  let completedTasks = 0;
  let totalTasks = 1;
  let progress = 0;

  if (subtasks.length > 0) {
    const done = subtasks.filter((s) => s.completed).length;
    completedTasks = done;
    totalTasks = subtasks.length;
    progress = Math.round((done / totalTasks) * 100);
  } else if (milestones.length > 0) {
    const done = milestones.filter((m) => m.completed).length;
    completedTasks = done;
    totalTasks = milestones.length;
    progress = Math.round((done / totalTasks) * 100);
  } else {
    progress = Math.max(0, Math.min(100, Math.round(goal.progress || 0)));
    completedTasks = goal.completedTasks || 0;
    totalTasks = Math.max(1, goal.totalTasks || 1);
  }

  const status: GoalStatus =
    goal.status === 'archived'
      ? 'archived'
      : progress >= 100
      ? 'completed'
      : 'active';

  return { progress, completedTasks, totalTasks, status };
}

/**
 * Maps Supabase goals row and associated goal_milestones rows to a DetailedGoal.
 */
export function mapGoalRowToDetailedGoal(
  row: any,
  milestoneRows: any[] = []
): DetailedGoal {
  const rawSubtasks = Array.isArray(row.subtasks) ? row.subtasks : [];
  const subtasks: GoalSubtask[] = rawSubtasks.map((st: any) => ({
    id: String(st.id || ''),
    title: String(st.title || ''),
    completed: Boolean(st.completed),
  }));

  const milestones: GoalMilestone[] = (milestoneRows || []).map((m: any) => ({
    id: String(m.id),
    title: String(m.title || ''),
    targetDate: m.target_date || (m.due_date ? formatReadableDate(m.due_date) : ''),
    notes: m.notes || undefined,
    completed: Boolean(m.completed),
  }));

  // Format target_date to human-readable dueDate (e.g., "Dec 31, 2026")
  let dueDate = 'Dec 31, 2026';
  if (row.target_date) {
    try {
      dueDate = formatReadableDate(row.target_date);
    } catch {
      dueDate = String(row.target_date);
    }
  }

  const rawGoal: Pick<DetailedGoal, 'subtasks' | 'milestones' | 'progress' | 'completedTasks' | 'totalTasks' | 'status'> = {
    subtasks,
    milestones,
    progress: typeof row.progress === 'number' ? row.progress : 0,
    completedTasks: typeof row.completed_tasks === 'number' ? row.completed_tasks : 0,
    totalTasks: typeof row.total_tasks === 'number' ? row.total_tasks : 1,
    status: (row.status as GoalStatus) || 'active',
  };

  const metrics = calculateGoalMetrics(rawGoal);

  return {
    id: String(row.id),
    title: String(row.title || ''),
    category: normalizeGoalCategory(row.category),
    description: String(row.description || ''),
    progress: metrics.progress,
    completedTasks: metrics.completedTasks,
    totalTasks: metrics.totalTasks,
    dueDate,
    priority: (['high', 'medium', 'low'].includes(row.priority) ? row.priority : 'medium') as 'high' | 'medium' | 'low',
    status: metrics.status,
    color: String(row.color || '#6C63FF'),
    icon: String(row.icon || 'target'),
    subtasks,
    milestones,
    notes: row.notes || undefined,
    updatedAt: row.updated_at
      ? String(row.updated_at).split('T')[0]
      : (row.created_at ? String(row.created_at).split('T')[0] : getLiveTodayISO()),
  };
}

/**
 * Fetches all goals and associated milestones for an authenticated user from Supabase.
 * Returns an empty array [] if 0 rows exist (valid zero state, NEVER demo data).
 */
export async function fetchUserGoalsFromSupabase(userId: string): Promise<DetailedGoal[]> {
  const sb = getSupabase();
  if (!sb || !userId) return [];

  const { data: goalRows, error: goalsErr } = await sb
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (goalsErr) {
    console.error('Error fetching user goals from Supabase:', goalsErr);
    return [];
  }

  if (!goalRows || goalRows.length === 0) {
    return [];
  }

  const goalIds = goalRows.map((g) => g.id);

  const { data: milestoneRows, error: milesErr } = await sb
    .from('goal_milestones')
    .select('*')
    .eq('user_id', userId)
    .in('goal_id', goalIds)
    .order('created_at', { ascending: true });

  if (milesErr) {
    console.warn('Error fetching goal milestones from Supabase:', milesErr);
  }

  const milestonesByGoal = new Map<string, any[]>();
  if (milestoneRows) {
    for (const m of milestoneRows) {
      const list = milestonesByGoal.get(m.goal_id) || [];
      list.push(m);
      milestonesByGoal.set(m.goal_id, list);
    }
  }

  return goalRows.map((g) => mapGoalRowToDetailedGoal(g, milestonesByGoal.get(g.id) || []));
}

/**
 * Fetches a single goal and its milestones from Supabase.
 */
export async function fetchSingleGoalFromSupabase(
  userId: string,
  goalId: string
): Promise<DetailedGoal | null> {
  const sb = getSupabase();
  if (!sb || !userId || !goalId) return null;

  const { data: goalRow, error: goalErr } = await sb
    .from('goals')
    .select('*')
    .eq('id', goalId)
    .eq('user_id', userId)
    .maybeSingle();

  if (goalErr || !goalRow) return null;

  const { data: milestoneRows } = await sb
    .from('goal_milestones')
    .select('*')
    .eq('goal_id', goalId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  return mapGoalRowToDetailedGoal(goalRow, milestoneRows || []);
}

/**
 * Creates a new Goal in Supabase and inserts any initial milestones atomically.
 */
export async function createGoalInSupabase(
  userId: string,
  goalData: Omit<DetailedGoal, 'id'>
): Promise<DetailedGoal> {
  const sb = getSupabase();
  if (!sb || !userId) {
    throw new Error('Supabase client not initialized or unauthenticated.');
  }

  const metrics = calculateGoalMetrics(goalData);

  let targetDate: string | null = null;
  if (goalData.dueDate) {
    try {
      const parsed = new Date(goalData.dueDate);
      if (!isNaN(parsed.getTime())) {
        targetDate = parsed.toISOString().split('T')[0];
      }
    } catch {
      targetDate = null;
    }
  }

  const newGoalRow = {
    user_id: userId,
    title: goalData.title.trim(),
    description: goalData.description || '',
    category: (goalData.category || 'Personal').toLowerCase(),
    target_date: targetDate,
    progress: metrics.progress,
    completed_tasks: metrics.completedTasks,
    total_tasks: metrics.totalTasks,
    priority: goalData.priority || 'medium',
    status: metrics.status,
    color: goalData.color || '#6C63FF',
    icon: goalData.icon || 'target',
    notes: goalData.notes || null,
    subtasks: Array.isArray(goalData.subtasks) ? goalData.subtasks : [],
  };

  const { data: insertedGoal, error: insertGoalErr } = await sb
    .from('goals')
    .insert(newGoalRow)
    .select('*')
    .single();

  if (insertGoalErr || !insertedGoal) {
    throw new Error(insertGoalErr?.message || 'Failed to create goal in Supabase.');
  }

  const insertedMilestones: any[] = [];
  if (Array.isArray(goalData.milestones) && goalData.milestones.length > 0) {
    const milestonePayloads = goalData.milestones.map((m) => {
      let mDueDate: string | null = null;
      if (m.targetDate) {
        try {
          const parsed = new Date(m.targetDate);
          if (!isNaN(parsed.getTime())) {
            mDueDate = parsed.toISOString().split('T')[0];
          }
        } catch {
          mDueDate = null;
        }
      }
      return {
        goal_id: insertedGoal.id,
        user_id: userId,
        title: m.title.trim(),
        completed: Boolean(m.completed),
        completed_at: m.completed ? new Date().toISOString() : null,
        target_date: m.targetDate || null,
        due_date: mDueDate,
        notes: m.notes || null,
      };
    });

    const { data: mData, error: mErr } = await sb
      .from('goal_milestones')
      .insert(milestonePayloads)
      .select('*');

    if (!mErr && mData) {
      insertedMilestones.push(...mData);
    }
  }

  return mapGoalRowToDetailedGoal(insertedGoal, insertedMilestones);
}

/**
 * Updates an existing Goal in Supabase and synchronizes its milestones.
 */
export async function updateGoalInSupabase(
  userId: string,
  goalData: DetailedGoal
): Promise<DetailedGoal> {
  const sb = getSupabase();
  if (!sb || !userId) {
    throw new Error('Supabase client not initialized or unauthenticated.');
  }

  const metrics = calculateGoalMetrics(goalData);

  let targetDate: string | null = null;
  if (goalData.dueDate) {
    try {
      const parsed = new Date(goalData.dueDate);
      if (!isNaN(parsed.getTime())) {
        targetDate = parsed.toISOString().split('T')[0];
      }
    } catch {
      targetDate = null;
    }
  }

  const updateFields = {
    title: goalData.title.trim(),
    description: goalData.description || '',
    category: (goalData.category || 'Personal').toLowerCase(),
    target_date: targetDate,
    progress: metrics.progress,
    completed_tasks: metrics.completedTasks,
    total_tasks: metrics.totalTasks,
    priority: goalData.priority || 'medium',
    status: metrics.status,
    color: goalData.color || '#6C63FF',
    icon: goalData.icon || 'target',
    notes: goalData.notes || null,
    subtasks: Array.isArray(goalData.subtasks) ? goalData.subtasks : [],
    updated_at: new Date().toISOString(),
  };

  const { data: updatedGoal, error: updateErr } = await sb
    .from('goals')
    .update(updateFields)
    .eq('id', goalData.id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (updateErr || !updatedGoal) {
    throw new Error(updateErr?.message || 'Failed to update goal in Supabase.');
  }

  const incomingMilestones = Array.isArray(goalData.milestones) ? goalData.milestones : [];

  const { data: existingMilestones } = await sb
    .from('goal_milestones')
    .select('*')
    .eq('goal_id', goalData.id)
    .eq('user_id', userId);

  const existingMap = new Map((existingMilestones || []).map((m) => [m.id, m]));
  const incomingIds = new Set(incomingMilestones.map((m) => m.id));

  // Delete removed milestones
  const toDelete = (existingMilestones || [])
    .filter((m) => !incomingIds.has(m.id))
    .map((m) => m.id);

  if (toDelete.length > 0) {
    await sb.from('goal_milestones').delete().in('id', toDelete).eq('user_id', userId);
  }

  // Update or insert incoming
  const finalMilestones: any[] = [];
  for (const m of incomingMilestones) {
    let mDueDate: string | null = null;
    if (m.targetDate) {
      try {
        const parsed = new Date(m.targetDate);
        if (!isNaN(parsed.getTime())) {
          mDueDate = parsed.toISOString().split('T')[0];
        }
      } catch {
        mDueDate = null;
      }
    }

    if (existingMap.has(m.id)) {
      const existing = existingMap.get(m.id);
      const isCompleted = Boolean(m.completed);
      const { data: updatedM } = await sb
        .from('goal_milestones')
        .update({
          title: m.title.trim(),
          completed: isCompleted,
          completed_at: isCompleted ? (existing.completed_at || new Date().toISOString()) : null,
          target_date: m.targetDate || null,
          due_date: mDueDate,
          notes: m.notes || null,
        })
        .eq('id', m.id)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (updatedM) finalMilestones.push(updatedM);
    } else {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(m.id);
      const newMRecord: any = {
        goal_id: goalData.id,
        user_id: userId,
        title: m.title.trim(),
        completed: Boolean(m.completed),
        completed_at: m.completed ? new Date().toISOString() : null,
        target_date: m.targetDate || null,
        due_date: mDueDate,
        notes: m.notes || null,
      };
      if (isUUID) newMRecord.id = m.id;

      const { data: insertedM } = await sb
        .from('goal_milestones')
        .insert(newMRecord)
        .select('*')
        .single();

      if (insertedM) finalMilestones.push(insertedM);
    }
  }

  return mapGoalRowToDetailedGoal(updatedGoal, finalMilestones);
}

/**
 * Deletes a Goal and cascades deletion of its milestones.
 */
export async function deleteGoalInSupabase(
  userId: string,
  goalId: string
): Promise<void> {
  const sb = getSupabase();
  if (!sb || !userId) {
    throw new Error('Supabase client not initialized or unauthenticated.');
  }

  const { error } = await sb
    .from('goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message || 'Failed to delete goal from Supabase.');
  }
}

/**
 * Toggles a Goal Subtask using the atomic PostgreSQL toggle_goal_subtask RPC.
 */
export async function toggleGoalSubtaskInSupabase(
  userId: string,
  goalId: string,
  subtaskId: string
): Promise<DetailedGoal> {
  const sb = getSupabase();
  if (!sb || !userId) {
    throw new Error('Supabase client not initialized or unauthenticated.');
  }

  let goalRow: any = null;

  // 1. Invoke atomic PostgreSQL RPC
  const { data: rpcData, error: rpcErr } = await sb.rpc('toggle_goal_subtask', {
    p_goal_id: goalId,
    p_subtask_id: subtaskId,
  });

  if (!rpcErr && rpcData) {
    goalRow = rpcData;
  } else {
    console.warn('toggle_goal_subtask RPC failed or unavailable, falling back:', rpcErr);
    const { data: existingGoal, error: getErr } = await sb
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single();

    if (getErr || !existingGoal) {
      throw new Error(getErr?.message || 'Goal not found or access denied.');
    }

    const subtasks = Array.isArray(existingGoal.subtasks) ? existingGoal.subtasks : [];
    const updatedSubtasks = subtasks.map((st: any) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    const { data: fallbackUpdated, error: updateErr } = await sb
      .from('goals')
      .update({
        subtasks: updatedSubtasks,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (updateErr || !fallbackUpdated) {
      throw new Error(updateErr?.message || 'Failed to toggle goal subtask.');
    }
    goalRow = fallbackUpdated;
  }

  const { data: milestoneRows } = await sb
    .from('goal_milestones')
    .select('*')
    .eq('goal_id', goalId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  const mapped = mapGoalRowToDetailedGoal(goalRow, milestoneRows || []);

  if (
    mapped.progress !== goalRow.progress ||
    mapped.status !== goalRow.status ||
    mapped.completedTasks !== goalRow.completed_tasks
  ) {
    await sb
      .from('goals')
      .update({
        progress: mapped.progress,
        completed_tasks: mapped.completedTasks,
        total_tasks: mapped.totalTasks,
        status: mapped.status,
      })
      .eq('id', goalId)
      .eq('user_id', userId);
  }

  return mapped;
}

/**
 * Toggles a Milestone for a goal in Supabase and updates the goal's metrics.
 */
export async function toggleGoalMilestoneInSupabase(
  userId: string,
  goalId: string,
  milestoneId: string
): Promise<DetailedGoal> {
  const sb = getSupabase();
  if (!sb || !userId) {
    throw new Error('Supabase client not initialized or unauthenticated.');
  }

  const { data: mRow, error: mGetErr } = await sb
    .from('goal_milestones')
    .select('*')
    .eq('id', milestoneId)
    .eq('goal_id', goalId)
    .eq('user_id', userId)
    .single();

  if (mGetErr || !mRow) {
    throw new Error(mGetErr?.message || 'Milestone not found.');
  }

  const isNowCompleted = !mRow.completed;
  const { error: mUpdateErr } = await sb
    .from('goal_milestones')
    .update({
      completed: isNowCompleted,
      completed_at: isNowCompleted ? new Date().toISOString() : null,
    })
    .eq('id', milestoneId)
    .eq('user_id', userId);

  if (mUpdateErr) {
    throw new Error(mUpdateErr.message || 'Failed to toggle milestone.');
  }

  const { data: goalRow, error: goalErr } = await sb
    .from('goals')
    .select('*')
    .eq('id', goalId)
    .eq('user_id', userId)
    .single();

  if (goalErr || !goalRow) {
    throw new Error(goalErr?.message || 'Goal not found.');
  }

  const { data: allMilestones } = await sb
    .from('goal_milestones')
    .select('*')
    .eq('goal_id', goalId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  const mapped = mapGoalRowToDetailedGoal(goalRow, allMilestones || []);

  await sb
    .from('goals')
    .update({
      progress: mapped.progress,
      completed_tasks: mapped.completedTasks,
      total_tasks: mapped.totalTasks,
      status: mapped.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', goalId)
    .eq('user_id', userId);

  return mapped;
}

/**
 * Maps a public.calendar_events row from Supabase to the frontend CalendarEvent interface.
 */
export function mapCalendarRowToCalendarEvent(row: any): CalendarEvent {
  const isAllDay = Boolean(row.all_day);
  const startTime = row.start_time_text || (row.start_time ? new Date(row.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined);
  const endTime = row.end_time_text || (row.end_time ? new Date(row.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined);

  let dateStr = row.event_date;
  if (!dateStr && row.start_time) {
    try {
      dateStr = new Date(row.start_time).toISOString().split('T')[0];
    } catch {}
  }
  if (!dateStr) {
    dateStr = new Date().toISOString().split('T')[0];
  }

  return {
    id: row.id,
    title: row.title || 'Untitled Event',
    date: dateStr,
    startTime: isAllDay ? undefined : (startTime || undefined),
    endTime: isAllDay ? undefined : (endTime || undefined),
    allDay: isAllDay,
    category: (row.category || 'other') as EventCategory,
    color: row.color || '#6C63FF',
    location: row.location || undefined,
    description: row.description || '',
    repeat: row.repeat_rule || undefined,
    priority: (row.priority || 'medium') as 'high' | 'medium' | 'low',
    subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    googleEventId: row.google_event_id || undefined,
    taskId: row.task_id || undefined,
    isAutoTask: Boolean(row.is_auto_task),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Fetches all calendar events for an authenticated user from Supabase.
 * Deterministically sorted by event_date, start_time_text, and created_at.
 * Returns [] for zero rows (NEVER mock/demo data).
 */
export async function fetchUserCalendarEventsFromSupabase(userId: string): Promise<CalendarEvent[]> {
  const sb = getSupabase();
  if (!sb || !userId) return [];

  const { data: rows, error } = await sb
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .order('event_date', { ascending: true })
    .order('start_time_text', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching calendar events from Supabase:', error);
    throw new Error(error.message || 'Failed to fetch calendar events from Supabase.');
  }

  if (!rows || rows.length === 0) {
    return [];
  }

  return rows.map(mapCalendarRowToCalendarEvent);
}

/**
 * Helper to construct optional timestamptz from date + time string
 */
function buildEventTimestamps(eventDate: string, startTimeText?: string, endTimeText?: string, allDay?: boolean) {
  if (allDay || !eventDate) {
    return { start_time: null, end_time: null };
  }
  let startTimeIso: string | null = null;
  let endTimeIso: string | null = null;

  try {
    if (startTimeText) {
      const match = startTimeText.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const ampm = match[3]?.toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        const hStr = hours < 10 ? '0' + hours : hours.toString();
        startTimeIso = new Date(`${eventDate}T${hStr}:${minutes}:00`).toISOString();
      }
    }
  } catch {}

  try {
    if (endTimeText) {
      const match = endTimeText.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const ampm = match[3]?.toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        const hStr = hours < 10 ? '0' + hours : hours.toString();
        endTimeIso = new Date(`${eventDate}T${hStr}:${minutes}:00`).toISOString();
      }
    }
  } catch {}

  return { start_time: startTimeIso, end_time: endTimeIso };
}

/**
 * Creates a Calendar Event in Supabase.
 * Authoritative UUID generated by Postgres default or preserved if provided UUID is valid.
 */
export async function createCalendarEventInSupabase(
  userId: string,
  eventData: Omit<CalendarEvent, 'id'> & { id?: string }
): Promise<CalendarEvent> {
  const sb = getSupabase();
  if (!sb || !userId) {
    throw new Error('Supabase client not initialized or unauthenticated.');
  }

  const isUUID = eventData.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventData.id);
  const isTaskIdUUID = eventData.taskId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventData.taskId);

  const eventDate = eventData.date || new Date().toISOString().split('T')[0];
  const { start_time, end_time } = buildEventTimestamps(eventDate, eventData.startTime, eventData.endTime, eventData.allDay);

  const insertPayload: Record<string, any> = {
    user_id: userId,
    title: (eventData.title || 'Untitled Event').trim(),
    description: eventData.description || '',
    event_date: eventDate,
    start_time_text: eventData.allDay ? null : (eventData.startTime || null),
    end_time_text: eventData.allDay ? null : (eventData.endTime || null),
    start_time,
    end_time,
    all_day: Boolean(eventData.allDay),
    category: (eventData.category || 'other').toLowerCase(),
    color: eventData.color || '#6C63FF',
    location: eventData.location || null,
    repeat_rule: eventData.repeat || null,
    priority: eventData.priority || 'medium',
    subtasks: Array.isArray(eventData.subtasks) ? eventData.subtasks : [],
    attachments: Array.isArray(eventData.attachments) ? eventData.attachments : [],
    google_event_id: eventData.googleEventId || null,
    task_id: isTaskIdUUID ? eventData.taskId : null,
    is_auto_task: Boolean(eventData.isAutoTask),
  };

  if (isUUID) {
    insertPayload.id = eventData.id;
  }

  // Deduplication check for Google-linked events
  if (eventData.googleEventId) {
    const { data: existingGcal } = await sb
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .eq('google_event_id', eventData.googleEventId)
      .maybeSingle();

    if (existingGcal) {
      return mapCalendarRowToCalendarEvent(existingGcal);
    }
  }

  const { data, error } = await sb
    .from('calendar_events')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error || !data) {
    // If unique constraint violated on google_event_id, fetch existing
    if (error?.code === '23505' && eventData.googleEventId) {
      const { data: existing } = await sb
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .eq('google_event_id', eventData.googleEventId)
        .maybeSingle();
      if (existing) return mapCalendarRowToCalendarEvent(existing);
    }
    console.error('Error creating calendar event in Supabase:', error);
    throw new Error(error?.message || 'Failed to create calendar event in Supabase.');
  }

  return mapCalendarRowToCalendarEvent(data);
}

/**
 * Updates an existing Calendar Event in Supabase.
 */
export async function updateCalendarEventInSupabase(
  userId: string,
  eventData: CalendarEvent
): Promise<CalendarEvent> {
  const sb = getSupabase();
  if (!sb || !userId) {
    throw new Error('Supabase client not initialized or unauthenticated.');
  }

  const eventDate = eventData.date || new Date().toISOString().split('T')[0];
  const { start_time, end_time } = buildEventTimestamps(eventDate, eventData.startTime, eventData.endTime, eventData.allDay);
  const isTaskIdUUID = eventData.taskId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventData.taskId);

  const updatePayload: Record<string, any> = {
    title: (eventData.title || 'Untitled Event').trim(),
    description: eventData.description || '',
    event_date: eventDate,
    start_time_text: eventData.allDay ? null : (eventData.startTime || null),
    end_time_text: eventData.allDay ? null : (eventData.endTime || null),
    start_time,
    end_time,
    all_day: Boolean(eventData.allDay),
    category: (eventData.category || 'other').toLowerCase(),
    color: eventData.color || '#6C63FF',
    location: eventData.location || null,
    repeat_rule: eventData.repeat || null,
    priority: eventData.priority || 'medium',
    subtasks: Array.isArray(eventData.subtasks) ? eventData.subtasks : [],
    attachments: Array.isArray(eventData.attachments) ? eventData.attachments : [],
    google_event_id: eventData.googleEventId || null,
    task_id: isTaskIdUUID ? eventData.taskId : null,
    is_auto_task: Boolean(eventData.isAutoTask),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await sb
    .from('calendar_events')
    .update(updatePayload)
    .eq('id', eventData.id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error || !data) {
    console.error('Error updating calendar event in Supabase:', error);
    throw new Error(error?.message || 'Failed to update calendar event in Supabase.');
  }

  return mapCalendarRowToCalendarEvent(data);
}

/**
 * Deletes a Calendar Event from Supabase.
 */
export async function deleteCalendarEventInSupabase(
  userId: string,
  eventId: string
): Promise<void> {
  const sb = getSupabase();
  if (!sb || !userId) {
    throw new Error('Supabase client not initialized or unauthenticated.');
  }

  const { error } = await sb
    .from('calendar_events')
    .delete()
    .eq('id', eventId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting calendar event in Supabase:', error);
    throw new Error(error.message || 'Failed to delete calendar event from Supabase.');
  }
}

/**
 * Maps a public.quick_notes row from Supabase to frontend QuickNote.
 * Handles both JSON-serialized content payloads and simple text content.
 */
export function mapQuickNoteRowToQuickNote(row: any): QuickNote {
  let parsedTitle = '';
  let parsedContent = '';
  let parsedType: QuickNote['type'] = 'yellow';
  let parsedBullets: string[] | undefined = undefined;

  const rawContent = row.content || '';

  if (rawContent.trim().startsWith('{') && rawContent.trim().endsWith('}')) {
    try {
      const parsed = JSON.parse(rawContent);
      if (typeof parsed === 'object' && parsed !== null) {
        parsedTitle = typeof parsed.title === 'string' ? parsed.title : '';
        parsedContent = typeof parsed.content === 'string' ? parsed.content : '';
        if (parsed.type === 'yellow' || parsed.type === 'purple' || parsed.type === 'pink') {
          parsedType = parsed.type;
        }
        if (Array.isArray(parsed.bullets)) {
          parsedBullets = parsed.bullets.map((b: any) => String(b));
        }
      }
    } catch {
      parsedTitle = rawContent.slice(0, 40);
      parsedContent = rawContent;
    }
  } else {
    parsedContent = rawContent;
    parsedTitle = rawContent.split('\n')[0]?.slice(0, 40) || 'Note';
  }

  // Fallback to row.category for note type if not in json payload
  if (!parsedType || (parsedType !== 'yellow' && parsedType !== 'purple' && parsedType !== 'pink')) {
    if (row.category === 'yellow' || row.category === 'purple' || row.category === 'pink') {
      parsedType = row.category;
    } else {
      parsedType = 'yellow';
    }
  }

  return {
    id: row.id,
    type: parsedType,
    title: parsedTitle || 'Note',
    content: parsedContent,
    bullets: parsedBullets,
  };
}

/**
 * Fetches all Quick Notes for an authenticated user from Supabase.
 */
export async function fetchUserNotesFromSupabase(userId: string): Promise<QuickNote[]> {
  const sb = getSupabase();
  if (!sb || !userId) {
    return [];
  }

  const { data, error } = await sb
    .from('quick_notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quick notes from Supabase:', error);
    throw new Error(error.message || 'Failed to fetch quick notes from Supabase.');
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map(mapQuickNoteRowToQuickNote);
}

/**
 * Creates a new Quick Note in Supabase.
 */
export async function createNoteInSupabase(
  userId: string,
  noteData: Omit<QuickNote, 'id'> & { id?: string }
): Promise<QuickNote> {
  const sb = getSupabase();
  if (!sb || !userId) {
    throw new Error('Supabase client not initialized or unauthenticated.');
  }

  // Lossless payload encoding: title, content, type, bullets preserved in content JSON
  const payloadToStore = {
    title: noteData.title || '',
    content: noteData.content || '',
    type: noteData.type || 'yellow',
    bullets: noteData.bullets || [],
  };

  const insertPayload: any = {
    user_id: userId,
    content: JSON.stringify(payloadToStore),
    category: noteData.type || 'yellow',
  };

  // Only pass UUID id if explicitly provided and valid UUID format
  if (noteData.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(noteData.id)) {
    insertPayload.id = noteData.id;
  }

  const { data, error } = await sb
    .from('quick_notes')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error || !data) {
    console.error('Error creating quick note in Supabase:', error);
    throw new Error(error?.message || 'Failed to create quick note in Supabase.');
  }

  return mapQuickNoteRowToQuickNote(data);
}

/**
 * Deletes a Quick Note from Supabase by UUID.
 */
export async function deleteNoteInSupabase(
  userId: string,
  noteId: string
): Promise<void> {
  const sb = getSupabase();
  if (!sb || !userId) {
    throw new Error('Supabase client not initialized or unauthenticated.');
  }

  const { error } = await sb
    .from('quick_notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting quick note from Supabase:', error);
    throw new Error(error.message || 'Failed to delete quick note from Supabase.');
  }
}
