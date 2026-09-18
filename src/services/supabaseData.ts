import { TaskItem, TaskPriority, UserProfile, AuthUser, Quest, RewardItem, CollectionItem } from '../types';
import { getSupabase } from '../lib/supabase';
import { initialUserProfile } from '../data/mockData';
import { getLiveTodayISO, getStartOfWeek, formatDateISO } from '../utils/dateUtils';
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

