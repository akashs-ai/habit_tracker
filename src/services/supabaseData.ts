import { TaskItem, TaskPriority, UserProfile, AuthUser, Quest } from '../types';
import { getSupabase } from '../lib/supabase';
import { initialUserProfile, initialQuests } from '../data/mockData';
import { getLiveTodayISO } from '../utils/dateUtils';

export interface SerializedTaskPayload {
  description?: string;
  labels?: string[];
  xpReward?: number;
  subtasks?: any[];
  notes?: string;
  dueText?: string;
  viewCategory?: 'today' | 'upcoming' | 'overdue' | 'someday';
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
} {
  const defaultResult = {
    description: '',
    labels: ['General'],
    xpReward: 15,
    subtasks: [],
    notes: '',
    dueText: 'Today',
    viewCategory: 'today' as const,
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
 * Toggles task completion state in Supabase Postgres
 */
export async function toggleUserTaskInSupabase(
  userId: string,
  taskId: string,
  completed: boolean
): Promise<TaskItem> {
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

  return mapTaskRowToTaskItem(data);
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

  const userProgression: UserProfile = {
    ...initialUserProfile,
    name: data.display_name || initialUserProfile.name,
    displayName: data.display_name || initialUserProfile.displayName || initialUserProfile.name,
    username: data.username || initialUserProfile.username || '',
    avatarUrl: data.avatar_url || initialUserProfile.avatarUrl,
    bio: data.bio || initialUserProfile.bio,
    level: data.level || 1,
    currentXp: data.xp || 0,
    nextLevelXp: data.xp_to_next_level || 500,
    totalPoints: data.momentum_points || 50,
    momentumPoints: data.momentum_points || 50,
    streak: authoritativeStreak,
    streakDays: authoritativeStreak,
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

  // If newly registered user has no habits in Supabase yet, seed starter habits
  if (!habits || habits.length === 0) {
    const starterPayload = initialQuests.map((q) => ({
      user_id: userId,
      title: q.title,
      description: serializeHabitDescription({
        subtitle: q.subtitle,
        durationMinutes: q.durationMinutes,
        attribute: q.attribute,
        questCategory: q.category,
        isStarted: q.isStarted,
      }),
      category: mapQuestCategoryToDbCategory(q.category),
      difficulty: 'medium',
      xp_reward: q.xpReward,
      streak: 0,
      best_streak: 0,
    }));

    const { data: inserted, error: insertError } = await sb
      .from('habits')
      .insert(starterPayload)
      .select('*');

    if (insertError) {
      console.warn('Error seeding starter habits in Supabase:', insertError);
    } else if (inserted) {
      habits = inserted;
    }
  }

  if (!habits) return [];

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

  return habits.map((h: any) => {
    const meta = parseHabitDescription(h.description);
    return {
      id: h.id,
      title: h.title,
      subtitle: meta.subtitle,
      category: meta.questCategory,
      durationMinutes: meta.durationMinutes,
      xpReward: h.xp_reward || 25,
      attribute: meta.attribute,
      completed: completedSet.has(h.id),
      isStarted: meta.isStarted,
    };
  });
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
): Promise<Quest> {
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

  // Update profile XP & momentum
  const xpChange = isNowCompleted ? xpReward : -xpReward;
  const { data: profile } = await sb
    .from('profiles')
    .select('xp, level, xp_to_next_level, momentum_points')
    .eq('id', userId)
    .maybeSingle();

  if (profile) {
    let newXp = (profile.xp || 0) + xpChange;
    let newLevel = profile.level || 1;
    let nextLevelXp = profile.xp_to_next_level || 500;

    if (newXp >= nextLevelXp) {
      newLevel += 1;
      newXp = newXp - nextLevelXp;
      nextLevelXp += 200;
    } else if (newXp < 0) {
      newXp = 0;
    }

    await sb
      .from('profiles')
      .update({
        xp: newXp,
        level: newLevel,
        xp_to_next_level: nextLevelXp,
        momentum_points: Math.max(0, (profile.momentum_points || 50) + xpChange),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
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
  };
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
