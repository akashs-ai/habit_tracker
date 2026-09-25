import express, { Request, Response } from 'express';
import { db } from './db';
import { REWARD_TERMS_POLICY } from './terms';
import { generateAIChatResponse } from './ai';
import { verifySupabaseToken, getServerSupabase } from './supabase';
import { fetchInstagramProfile } from './instagram';

export function createLifeRPGApp() {
  const app = express();

  // Basic CORS headers to allow cross-origin API calls on deployed environments
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });


  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // --- Auth Session & Multi-User Context Middleware ---
  app.use('/api', async (req: Request, res: Response, next) => {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.query.token && typeof req.query.token === 'string') {
      token = req.query.token;
    }

    let userId = db.defaultUserId;
    if (token) {
      let user = db.getUserByToken(token);
      
      // If token is a Supabase JWT (starts with ey or length > 50) and not found locally, verify with Supabase
      if (!user && (token.startsWith('ey') || token.length > 50)) {
        try {
          const sbUser = await verifySupabaseToken(token);
          if (sbUser) {
            user = db.getOrCreateSupabaseUser({
              id: sbUser.id,
              email: sbUser.email || '',
              username: (sbUser.user_metadata?.username as string) || (sbUser.email ? sbUser.email.split('@')[0] : `user_${sbUser.id.substring(0, 6)}`),
              fullName: (sbUser.user_metadata?.full_name as string) || (sbUser.user_metadata?.name as string) || 'Adventurer',
              avatarUrl: (sbUser.user_metadata?.avatar_url as string) || '',
              isGuest: Boolean((sbUser as any).is_anonymous),
            });
          }
        } catch (e) {
          console.warn('Supabase token verification fallback:', e);
        }
      }

      if (user) {
        (req as any).user = user;
        (req as any).userId = user.id;
        (req as any).token = token;
        userId = user.id;
      }
    }
    db.runWithUserContext(userId, () => next());
  });

  // --- Authentication Routes ---

  // Current authenticated user
  app.get('/api/auth/me', (req: Request, res: Response) => {
    try {
      const reqUser = (req as any).user;
      const user = reqUser || db.getUserById(db.defaultUserId);
      const token = (req as any).token || 'token_alex_master';
      res.json({
        success: true,
        user,
        token,
        state: db.getState(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Diagnostics check
  app.get('/api/diagnostics/connections', async (req: Request, res: Response) => {
    try {
      const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
      const sbAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      const sbServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

      const isConfigured = Boolean(sbUrl && sbAnonKey && !sbUrl.includes('placeholder'));
      let authStatus = 'not_configured';
      let restStatus = 'not_configured';
      let remoteTablesDetected: string[] = [];

      if (isConfigured) {
        try {
          const authRes = await fetch(`${sbUrl}/auth/v1/health`, {
            headers: {
              apikey: sbAnonKey,
              Authorization: `Bearer ${sbAnonKey}`,
            },
          });
          authStatus = authRes.ok ? 'connected_ok_200' : `status_${authRes.status}`;
        } catch (e: any) {
          authStatus = `error: ${e.message}`;
        }

        try {
          const restRes = await fetch(`${sbUrl}/rest/v1/`, {
            headers: {
              apikey: sbServiceKey || sbAnonKey,
              Authorization: `Bearer ${sbServiceKey || sbAnonKey}`,
            },
          });
          if (restRes.ok) {
            restStatus = 'connected_ok_200';
            try {
              const ct = restRes.headers.get('content-type') || '';
              const text = await restRes.text();
              if ((ct.includes('application/json') || text.trim().startsWith('{')) && !text.trim().startsWith('<')) {
                const spec = JSON.parse(text) as any;
                const paths = Object.keys(spec.paths || {}).map((p) => p.replace(/^\//, ''));
                remoteTablesDetected = paths.filter((p) =>
                  ['profiles', 'habits', 'tasks', 'detailed_goals', 'user_rewards', 'calendar_events'].includes(p)
                );
              }
            } catch {
              // ignore parse errors
            }
          } else {
            restStatus = `status_${restRes.status}`;
          }
        } catch (e: any) {
          restStatus = `error: ${e.message}`;
        }
      }

      res.json({
        success: true,
        data: {
          timestamp: new Date().toISOString(),
          supabaseConfigured: isConfigured,
          supabaseUrl: sbUrl ? sbUrl.replace(/https?:\/\//, '').split('.')[0] + '...' : 'none',
          authStatus,
          restStatus,
          remoteTablesDetected,
          hasServiceRoleKey: Boolean(sbServiceKey),
          localUserCount: db.getUserCount(),
          defaultUserId: db.defaultUserId,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Check username availability
  app.get('/api/auth/check-username', (req: Request, res: Response) => {
    try {
      const username = (req.query.username as string) || '';
      const available = db.isUsernameAvailable(username);
      res.json({ success: true, available });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Register new user
  app.post('/api/auth/register', (req: Request, res: Response) => {
    try {
      const { email, password, username, fullName, termsAccepted, guestToken } = req.body;
      const result = db.register({
        email: email || '',
        password: password || '',
        username: username || '',
        fullName: fullName || 'Adventurer',
        termsAccepted: Boolean(termsAccepted !== false),
        guestToken,
      });
      res.status(201).json({
        success: true,
        user: result.user,
        token: result.token,
        state: db.getState(),
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, username, identifier, password, rememberMe } = req.body;
      const loginId = identifier || email || username;
      const result = db.login(loginId, password, rememberMe !== false);
      res.json({
        success: true,
        user: result.user,
        token: result.token,
        state: db.getState(),
      });
    } catch (err: any) {
      res.status(401).json({ success: false, error: err.message });
    }
  });

  // Social Auth
  app.post('/api/auth/social', (req: Request, res: Response) => {
    try {
      const { provider, email, fullName } = req.body;
      const safeProvider = (provider === 'github' || provider === 'discord' ? provider : 'google') as 'google' | 'github' | 'discord';
      const result = db.socialLogin(safeProvider, email, fullName);
      res.json({
        success: true,
        user: result.user,
        token: result.token,
        state: db.getState(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Guest Account Creation
  app.post('/api/auth/guest', (req: Request, res: Response) => {
    try {
      const result = db.createGuest();
      res.status(201).json({
        success: true,
        user: result.user,
        token: result.token,
        state: db.getState(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Forgot Password
  app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const result = db.forgotPassword(email);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Reset Password
  app.post('/api/auth/reset-password', (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;
      const result = db.resetPassword(token, newPassword);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Verify Email
  app.post('/api/auth/verify-email', (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const result = db.verifyEmail(token);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      if (token) {
        db.logout(token);
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete Account
  app.delete('/api/auth/account', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ success: false, error: 'Unauthorized.' });
      }
      const success = db.deleteAccount(user.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Health
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Team Instagram Profile lookup
  app.get('/api/team/instagram-profile', async (req: Request, res: Response) => {
    try {
      const username = (req.query.username as string) || '';
      if (!username) {
        return res.status(400).json({ success: false, error: 'Missing username parameter' });
      }
      const data = await fetchInstagramProfile(username);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Main Full App State ---
  app.get('/api/state', (req: Request, res: Response) => {
    try {
      const state = db.getState();
      res.json({ success: true, data: state });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // User Profile
  app.get('/api/user', (req: Request, res: Response) => {
    try {
      const state = db.getState();
      res.json({ success: true, data: state.user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/user/profile', async (req: Request, res: Response) => {
    try {
      const updated = db.updateUserProfile(req.body);
      const userId = (req as any).user?.id;
      const serverSb = getServerSupabase();
      if (serverSb && userId && !userId.startsWith('guest-')) {
        Promise.resolve(serverSb.from('profiles').update({
          full_name: updated.user.name,
          username: updated.user.username,
          updated_at: new Date().toISOString(),
        }).eq('id', userId)).catch((e) => console.warn('Supabase profile sync note:', e));
      }
      res.json({ success: true, data: updated.user, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/user/avatar', async (req: Request, res: Response) => {
    try {
      const { avatarUrl } = req.body;
      if (!avatarUrl) {
        return res.status(400).json({ success: false, error: 'Avatar URL is required.' });
      }
      const updated = db.updateAvatar(avatarUrl);
      const userId = (req as any).user?.id;
      const serverSb = getServerSupabase();
      if (serverSb && userId && !userId.startsWith('guest-')) {
        Promise.resolve(serverSb.from('profiles').update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        }).eq('id', userId)).catch((e) => console.warn('Supabase avatar sync note:', e));
      }
      res.json({ success: true, data: updated, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Quests / Habits
  app.get('/api/quests', (req: Request, res: Response) => {
    try {
      const state = db.getState();
      res.json({ success: true, data: state.quests });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/quests/toggle', (req: Request, res: Response) => {
    try {
      const { questId, forceCompleted } = req.body;
      if (!questId) {
        return res.status(400).json({ success: false, error: 'questId is required.' });
      }
      const quest = db.toggleQuest(questId, forceCompleted);
      if (!quest) {
        return res.status(404).json({ success: false, error: 'Quest not found.' });
      }
      res.json({ success: true, data: quest, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/quests', (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, error: 'Quest title is required.' });
      }
      const quest = db.addQuest(req.body);
      res.status(201).json({ success: true, data: quest, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/quests/:id', (req: Request, res: Response) => {
    try {
      const success = db.deleteQuest(req.params.id);
      res.json({ success, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Tasks
  app.get('/api/tasks', (req: Request, res: Response) => {
    try {
      const state = db.getState();
      res.json({ success: true, data: state.tasks });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/tasks', async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, error: 'Task title is required.' });
      }
      const task = db.addTask(req.body);
      const userId = (req as any).user?.id;
      const serverSb = getServerSupabase();
      if (serverSb && userId && !userId.startsWith('guest-')) {
        Promise.resolve(serverSb.from('tasks').insert({
          user_id: userId,
          title: title.trim(),
          description: JSON.stringify({
            description: req.body.description || '',
            labels: req.body.labels || ['General'],
            xpReward: req.body.xpReward || 15,
            subtasks: req.body.subtasks || [],
            notes: req.body.notes || '',
            dueText: req.body.dueText || 'Today',
            viewCategory: req.body.viewCategory || 'today',
          }),
          category: (req.body.labels?.[0] || 'work').toLowerCase(),
          priority: ['low', 'medium', 'high', 'urgent'].includes(req.body.priority) ? req.body.priority : 'medium',
          due_date: req.body.dueDate ? new Date(req.body.dueDate).toISOString() : null,
          completed: Boolean(req.body.completed),
        })).catch((e) => console.warn('Supabase task insert note:', e));
      }
      res.status(201).json({ success: true, data: task, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
      const updated = db.updateTask({ ...req.body, id: req.params.id });
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Task not found.' });
      }
      const userId = (req as any).user?.id;
      const serverSb = getServerSupabase();
      if (serverSb && userId && !userId.startsWith('guest-') && !req.params.id.startsWith('task-')) {
        Promise.resolve(serverSb.from('tasks').update({
          title: updated.title,
          completed: updated.completed,
          category: (updated.labels?.[0] || 'work').toLowerCase(),
          priority: ['low', 'medium', 'high', 'urgent'].includes(updated.priority) ? updated.priority : 'medium',
          due_date: updated.dueDate ? new Date(updated.dueDate).toISOString() : null,
          description: JSON.stringify({
            description: updated.description || '',
            labels: updated.labels || [],
            xpReward: updated.xpReward || 15,
            subtasks: updated.subtasks || [],
            notes: updated.notes || '',
            dueText: updated.dueText || '',
            viewCategory: updated.viewCategory || 'today',
          }),
        }).eq('id', req.params.id).eq('user_id', userId)).catch((e) => console.warn('Supabase task update note:', e));
      }
      res.json({ success: true, data: updated, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
      const deleted = db.deleteTask(req.params.id);
      const userId = (req as any).user?.id;
      const serverSb = getServerSupabase();
      if (serverSb && userId && !userId.startsWith('guest-') && !req.params.id.startsWith('task-')) {
        Promise.resolve(serverSb.from('tasks').delete().eq('id', req.params.id).eq('user_id', userId))
          .catch((e) => console.warn('Supabase task delete note:', e));
      }
      res.json({ success: deleted, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/tasks/:id/toggle', async (req: Request, res: Response) => {
    try {
      const { forceCompleted } = req.body;
      const task = db.toggleTask(req.params.id, forceCompleted);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found.' });
      }
      const userId = (req as any).user?.id;
      const serverSb = getServerSupabase();
      if (serverSb && userId && !userId.startsWith('guest-') && !req.params.id.startsWith('task-')) {
        Promise.resolve(serverSb.from('tasks').update({
          completed: task.completed,
        }).eq('id', req.params.id).eq('user_id', userId)).catch((e) => console.warn('Supabase task toggle note:', e));
      }
      res.json({ success: true, data: task, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Quotes & Daily Wisdom Endpoints ---
  app.get('/api/quotes', (req: Request, res: Response) => {
    try {
      const data = db.getQuotes();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/quotes', (req: Request, res: Response) => {
    try {
      const { text, author, category, setActive } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ success: false, error: 'Quote text is required.' });
      }
      const result = db.addQuote({ text, author, category, setActive });
      res.status(201).json({ success: true, data: result, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/quotes/:id/active', (req: Request, res: Response) => {
    try {
      const result = db.setActiveQuote(req.params.id);
      res.json({ success: true, data: result, state: db.getState() });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/quotes/:id', (req: Request, res: Response) => {
    try {
      const success = db.deleteQuote(req.params.id);
      res.json({ success, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/quotes/shuffle', (req: Request, res: Response) => {
    try {
      const result = db.shuffleQuote();
      res.json({ success: true, data: result, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/quotes/random', (req: Request, res: Response) => {
    try {
      const result = db.shuffleQuote();
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Calendar Events
  app.get('/api/calendar/events', (req: Request, res: Response) => {
    try {
      const state = db.getState();
      res.json({ success: true, data: state.calendarEvents });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/calendar/events', (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, error: 'Event title is required.' });
      }
      const event = db.addCalendarEvent(req.body);
      res.status(201).json({ success: true, data: event, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/calendar/events/:id', (req: Request, res: Response) => {
    try {
      const updated = db.updateCalendarEvent({ ...req.body, id: req.params.id });
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Event not found.' });
      }
      res.json({ success: true, data: updated, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/calendar/events/:id', (req: Request, res: Response) => {
    try {
      const deleted = db.deleteCalendarEvent(req.params.id);
      res.json({ success: deleted, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/calendar/events/:id/toggle', (req: Request, res: Response) => {
    try {
      const event = db.toggleCalendarEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ success: false, error: 'Event not found.' });
      }
      res.json({ success: true, data: event, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Goals
  app.get('/api/goals', (req: Request, res: Response) => {
    try {
      const state = db.getState();
      res.json({ success: true, data: state.goals });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/goals', (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, error: 'Goal title is required.' });
      }
      const goal = db.addGoal(req.body);
      res.status(201).json({ success: true, data: goal, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/goals/:id', (req: Request, res: Response) => {
    try {
      const updated = db.updateGoal({ ...req.body, id: req.params.id });
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Goal not found.' });
      }
      res.json({ success: true, data: updated, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/goals/:id', (req: Request, res: Response) => {
    try {
      const deleted = db.deleteGoal(req.params.id);
      res.json({ success: deleted, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/goals/:id/subtask-toggle', (req: Request, res: Response) => {
    try {
      const { subtaskId } = req.body;
      const updated = db.toggleGoalSubtask(req.params.id, subtaskId);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Goal or subtask not found.' });
      }
      res.json({ success: true, data: updated, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/goals/:id/milestone-toggle', (req: Request, res: Response) => {
    try {
      const { milestoneId } = req.body;
      const updated = db.toggleGoalMilestone(req.params.id, milestoneId);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Goal or milestone not found.' });
      }
      res.json({ success: true, data: updated, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Rewards
  app.get('/api/rewards', (req: Request, res: Response) => {
    try {
      const state = db.getState();
      res.json({ success: true, data: state.rewards });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/rewards/terms', (req: Request, res: Response) => {
    try {
      res.json({ success: true, data: REWARD_TERMS_POLICY });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/rewards/claim', (req: Request, res: Response) => {
    try {
      const { rewardId, termsAccepted } = req.body;
      if (!rewardId) {
        return res.status(400).json({ success: false, error: 'rewardId is required.' });
      }
      if (!termsAccepted) {
        return res.status(400).json({ success: false, error: 'Terms and Conditions must be accepted.' });
      }
      const result = db.claimReward(rewardId, termsAccepted);
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }
      res.json({ success: true, data: result.claim, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/rewards/activate', (req: Request, res: Response) => {
    try {
      const { rewardId } = req.body;
      const result = db.activateReward(rewardId);
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }
      res.json({ success: true, data: result.reward, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Analytics
  app.get('/api/analytics', (req: Request, res: Response) => {
    try {
      const timeRange = (req.query.range as string) || '7d';
      const analytics = db.getAnalytics(timeRange);
      res.json({ success: true, data: analytics });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Notes
  app.post('/api/notes', (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, error: 'Note title is required.' });
      }
      const note = db.addNote(req.body);
      res.status(201).json({ success: true, data: note, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/notes/:id', (req: Request, res: Response) => {
    try {
      const deleted = db.deleteNote(req.params.id);
      res.json({ success: deleted, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Friends & Social Leaderboard
  app.get('/api/friends', (req: Request, res: Response) => {
    try {
      const friends = db.getFriends();
      res.json({ success: true, data: friends });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/friends/progress', (req: Request, res: Response) => {
    try {
      const progress = db.getFriendsProgressData();
      res.json({ success: true, data: progress });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/friends/requests', (req: Request, res: Response) => {
    try {
      const requests = db.getFriendRequests();
      res.json({ success: true, data: requests });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/friends/suggestions', (req: Request, res: Response) => {
    try {
      const suggestions = db.getSuggestedFriends();
      res.json({ success: true, data: suggestions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/friends/search', (req: Request, res: Response) => {
    try {
      const q = (req.query.q as string) || '';
      const results = db.searchUsers(q);
      res.json({ success: true, data: results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/friends/requests', (req: Request, res: Response) => {
    try {
      const { targetUserId } = req.body;
      const currentUid = (req as any).user?.id || db.defaultUserId;
      const result = db.sendFriendRequest(currentUid, targetUserId);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.status(201).json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/friends/requests/:id/accept', (req: Request, res: Response) => {
    try {
      const currentUid = (req as any).user?.id || db.defaultUserId;
      const result = db.acceptFriendRequest(req.params.id, currentUid);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/friends/requests/:id/decline', (req: Request, res: Response) => {
    try {
      const currentUid = (req as any).user?.id || db.defaultUserId;
      const result = db.rejectFriendRequest(req.params.id, currentUid);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/friends/:id', (req: Request, res: Response) => {
    try {
      const currentUid = (req as any).user?.id || db.defaultUserId;
      const result = db.removeFriend(req.params.id, currentUid);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // AI & Coach Integrations
  app.get('/api/ai/agents', (req: Request, res: Response) => {
    try {
      const agents = db.getAIAgents();
      res.json({ success: true, data: agents });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/ai/agents/verify-and-connect', async (req: Request, res: Response) => {
    try {
      const { modelId, agentId, accountEmail, apiKey, authMethod, modelTier, password } = req.body;
      const result = await db.verifyAndConnectAIAgent({ 
        agentId: agentId || modelId || 'gemini', 
        authMethod: authMethod || (apiKey ? 'apikey' : 'google'),
        accountEmail, 
        apiKey,
        modelTier,
        password
      });
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/ai/agents/connect', (req: Request, res: Response) => {
    try {
      const { modelId, agentId } = req.body;
      const agents = db.connectAIAgent(agentId || modelId);
      res.json({ success: true, data: agents });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/ai/agents/disconnect', (req: Request, res: Response) => {
    try {
      const { modelId, agentId } = req.body;
      const agents = db.disconnectAIAgent(agentId || modelId);
      res.json({ success: true, data: agents });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/ai/agents/select', (req: Request, res: Response) => {
    try {
      const { modelId, agentId } = req.body;
      const agents = db.selectAIAgent(agentId || modelId);
      res.json({ success: true, data: agents });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/ai/agents/sync', (req: Request, res: Response) => {
    try {
      const state = db.syncAIAgents();
      res.json({ success: true, data: state });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/ai/agents/sync', (req: Request, res: Response) => {
    try {
      const state = db.getAIAgents();
      res.json({ success: true, data: state });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/calendar/integration', (req: Request, res: Response) => {
    try {
      const state = db.getCalendarIntegration();
      res.json({ success: true, data: state });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/calendar/integration', (req: Request, res: Response) => {
    try {
      const { permissionLevel, permission, syncEnabled, useInCoach, status, account } = req.body;
      const state = db.updateCalendarIntegration({
        permission: (permissionLevel || permission) as any,
        useInCoach: syncEnabled !== undefined ? syncEnabled : useInCoach,
        status,
        account
      });
      res.json({ success: true, data: state });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    try {
      const { modelId, message, history, calendarPermission, googleAccessToken } = req.body;
      const reply = await generateAIChatResponse({ 
        modelId: modelId || 'gemini',
        message, 
        history,
        calendarPermission,
        googleAccessToken
      });
      res.json({ success: true, data: reply });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/ai/gemini-config', (req: Request, res: Response) => {
    try {
      const { modelOption, role } = req.body;
      const updatedAgents = db.updateGeminiConfig({ modelOption, role });
      res.json({ success: true, data: updatedAgents });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // API 404 handler - prevents unhandled /api/* requests from falling through to HTML SPA fallback
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.originalUrl || req.url}`,
    });
  });

  return app;
}

export const app = createLifeRPGApp();
