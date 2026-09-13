import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { REWARD_TERMS_POLICY } from './server/terms';
import { generateAIChatResponse } from './server/ai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // --- Auth Session & Multi-User Context Middleware ---
  app.use('/api', (req: Request, res: Response, next) => {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.query.token && typeof req.query.token === 'string') {
      token = req.query.token;
    }

    let userId = db.defaultUserId;
    if (token) {
      const user = db.getUserByToken(token);
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

  // Register
  app.post('/api/auth/register', (req: Request, res: Response) => {
    try {
      const { fullName, email, username, password, termsAccepted, guestToken } = req.body;
      const result = db.register({
        fullName,
        email,
        username,
        password,
        termsAccepted: Boolean(termsAccepted),
        guestToken,
      });

      res.status(201).json({
        success: true,
        user: result.user,
        token: result.token,
        migrated: result.migrated,
        state: db.getStore(result.user.id),
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { identifier, email, username, password, rememberMe } = req.body;
      const targetId = identifier || email || username;
      const result = db.login(targetId, password, rememberMe !== false);

      res.json({
        success: true,
        user: result.user,
        token: result.token,
        state: db.getStore(result.user.id),
      });
    } catch (err: any) {
      res.status(401).json({ success: false, error: err.message });
    }
  });

  // Social Login (Google, GitHub, Discord, Apple)
  app.post('/api/auth/social', (req: Request, res: Response) => {
    try {
      const { provider, email, fullName } = req.body;
      const result = db.socialLogin(provider || 'google', email, fullName);

      res.json({
        success: true,
        user: result.user,
        token: result.token,
        state: db.getStore(result.user.id),
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Continue as Guest
  app.post('/api/auth/guest', (req: Request, res: Response) => {
    try {
      const result = db.createGuest();
      res.status(201).json({
        success: true,
        user: result.user,
        token: result.token,
        state: db.getStore(result.user.id),
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
      res.json({
        success: true,
        message: result.message,
        resetToken: result.resetToken,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Reset Password
  app.post('/api/auth/reset-password', (req: Request, res: Response) => {
    try {
      const { token, email, newPassword } = req.body;
      const result = db.resetPassword(token || email, newPassword);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Verify Email
  app.post('/api/auth/verify-email', (req: Request, res: Response) => {
    try {
      const { email, code } = req.body;
      const result = db.verifyEmail(email, code);
      res.json({
        success: true,
        message: result.message,
        emailVerified: result.emailVerified,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    try {
      const token = (req as any).token || req.body.token;
      if (token) {
        db.logout(token);
      }
      res.json({ success: true, message: 'Logged out successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete Account
  app.delete('/api/auth/account', (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      if (!userId || userId === db.defaultUserId) {
        return res.status(400).json({ success: false, error: 'Cannot delete primary administrative account.' });
      }
      db.deleteAccount(userId);
      res.json({ success: true, message: 'Account deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Existing Application API Routes ---

  // Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 1. Full State Snapshot (Single Source of Truth)
  app.get('/api/state', (req: Request, res: Response) => {
    try {
      const state = db.getState();
      res.json({ success: true, data: state });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. User & Progression
  app.get('/api/user', (req: Request, res: Response) => {
    try {
      const state = db.getState();
      res.json({ success: true, data: state.user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/user/profile', (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { avatarUrl, displayName, username, bio } = req.body;
      const result = db.updateUserProfile({ avatarUrl, displayName, username, bio }, userId);
      res.json({
        success: true,
        data: result.user,
        account: result.account,
        state: db.getState(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/user/profile', (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { avatarUrl, displayName, username, bio } = req.body;
      const result = db.updateUserProfile({ avatarUrl, displayName, username, bio }, userId);
      res.json({
        success: true,
        data: result.user,
        account: result.account,
        state: db.getState(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Quests (Habits)
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
      const { questId } = req.body;
      if (!questId) {
        return res.status(400).json({ success: false, error: 'questId is required.' });
      }
      const updated = db.toggleQuest(questId);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Quest not found.' });
      }
      res.json({ success: true, data: updated, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/quests', (req: Request, res: Response) => {
    try {
      const quest = db.addQuest(req.body);
      res.status(201).json({ success: true, data: quest, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Tasks
  app.get('/api/tasks', (req: Request, res: Response) => {
    try {
      const state = db.getState();
      res.json({ success: true, data: state.tasks });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/tasks', (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, error: 'Task title is required.' });
      }
      const task = db.addTask(req.body);
      res.status(201).json({ success: true, data: task, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/tasks/:id', (req: Request, res: Response) => {
    try {
      const updated = db.updateTask({ ...req.body, id: req.params.id });
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Task not found.' });
      }
      res.json({ success: true, data: updated, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/tasks/:id', (req: Request, res: Response) => {
    try {
      const ok = db.deleteTask(req.params.id);
      if (!ok) {
        return res.status(404).json({ success: false, error: 'Task not found.' });
      }
      res.json({ success: true, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/tasks/:id/toggle', (req: Request, res: Response) => {
    try {
      const updated = db.toggleTask(req.params.id);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Task not found.' });
      }
      res.json({ success: true, data: updated, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Calendar Events
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
      const { title, date } = req.body;
      if (!title || !date) {
        return res.status(400).json({ success: false, error: 'Title and date are required.' });
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
        return res.status(404).json({ success: false, error: 'Calendar event not found.' });
      }
      res.json({ success: true, data: updated, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/calendar/events/:id', (req: Request, res: Response) => {
    try {
      const ok = db.deleteCalendarEvent(req.params.id);
      if (!ok) {
        return res.status(404).json({ success: false, error: 'Calendar event not found.' });
      }
      res.json({ success: true, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/calendar/events/:id/toggle', (req: Request, res: Response) => {
    try {
      const updated = db.toggleCalendarEvent(req.params.id);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Calendar event not found.' });
      }
      res.json({ success: true, data: updated, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Goals
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
      const ok = db.deleteGoal(req.params.id);
      if (!ok) {
        return res.status(404).json({ success: false, error: 'Goal not found.' });
      }
      res.json({ success: true, state: db.getState() });
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

  // 7. Rewards & Claims
  app.get('/api/rewards', (req: Request, res: Response) => {
    try {
      const state = db.getState();
      res.json({
        success: true,
        data: {
          rewards: state.rewards,
          badges: state.badges,
          collection: state.collectionItems,
          waysToEarn: state.waysToEarn,
          claims: state.claims,
          momentumPoints: state.user.momentumPoints,
          pointsThisWeek: state.user.pointsThisWeek,
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Reward Claim Terms & Eligibility Policy
  app.get('/api/rewards/terms', (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        data: REWARD_TERMS_POLICY,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Claim / Unlock a Reward with authoritative server-side validation
  app.post('/api/rewards/claim', (req: Request, res: Response) => {
    try {
      const { rewardId, termsAccepted, clientFingerprint } = req.body;
      if (!rewardId) {
        return res.status(400).json({ success: false, error: 'rewardId is required.' });
      }

      const result = db.claimReward(rewardId, termsAccepted === true, clientFingerprint);
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.status(201).json({
        success: true,
        data: {
          reward: result.reward,
          claim: result.claim,
          momentumPoints: db.getState().user.momentumPoints,
        },
        state: db.getState(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Activate / Equip an owned reward
  app.post('/api/rewards/activate', (req: Request, res: Response) => {
    try {
      const { rewardId } = req.body;
      if (!rewardId) {
        return res.status(400).json({ success: false, error: 'rewardId is required.' });
      }

      const result = db.activateReward(rewardId);
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.json({
        success: true,
        data: result.reward,
        state: db.getState(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. Analytics
  app.get('/api/analytics', (req: Request, res: Response) => {
    try {
      const timeRange = (req.query.timeRange as string) || '7d';
      const analytics = db.getAnalytics(timeRange);
      res.json({ success: true, data: analytics });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 9. Notes
  app.post('/api/notes', (req: Request, res: Response) => {
    try {
      const newNote = db.addNote(req.body);
      res.status(201).json({ success: true, data: newNote, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/notes/:id', (req: Request, res: Response) => {
    try {
      const ok = db.deleteNote(req.params.id);
      if (!ok) {
        return res.status(404).json({ success: false, error: 'Note not found.' });
      }
      res.json({ success: true, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 10. Friends & Social Accountability Backend
  // Get all friends + requests + leaderboard + progress cards
  app.get('/api/friends', (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const progress = db.getFriendsProgressData(userId);
      res.json({
        success: true,
        data: progress.friends,
        leaderboard: progress.leaderboard,
        xpComparison: progress.xpComparison,
        consistencyStreaks: progress.consistencyStreaks,
        summary: progress.summary,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get friends progress (Leaderboard, XP comparison, consistency streaks)
  app.get('/api/friends/progress', (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const progress = db.getFriendsProgressData(userId);
      res.json({
        success: true,
        data: progress,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get pending friend requests received
  app.get('/api/friends/requests', (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const requests = db.getFriendRequests(userId);
      res.json({ success: true, data: requests });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get suggested friends
  app.get('/api/friends/suggestions', (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const suggestions = db.getSuggestedFriends(userId);
      res.json({ success: true, data: suggestions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Search users for adding friends
  app.get('/api/friends/search', (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const query = (req.query.q as string) || '';
      const results = db.searchUsers(query, userId);
      res.json({ success: true, data: results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Send a friend request
  app.post('/api/friends/requests', (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { recipientId, username, email, reason } = req.body;
      const identifier = recipientId || username || email;
      if (!identifier) {
        return res.status(400).json({ success: false, error: 'Recipient ID, username, or email is required.' });
      }

      const result = db.sendFriendRequest(userId, identifier, reason);
      const progress = db.getFriendsProgressData(userId);
      res.status(201).json({
        success: true,
        data: result.friendship,
        message: result.message,
        progress,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Accept a friend request
  app.post('/api/friends/requests/:id/accept', (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const result = db.acceptFriendRequest(req.params.id, userId);
      const progress = db.getFriendsProgressData(userId);
      res.json({
        success: true,
        data: result.friendship,
        message: result.message,
        progress,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Decline a friend request
  app.post('/api/friends/requests/:id/decline', (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const result = db.rejectFriendRequest(req.params.id, userId);
      const progress = db.getFriendsProgressData(userId);
      res.json({
        success: true,
        message: result.message,
        progress,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Remove a friend
  app.delete('/api/friends/:id', (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      db.removeFriend(req.params.id, userId);
      const progress = db.getFriendsProgressData(userId);
      res.json({ success: true, progress });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 11. AI Agents & Coaching Backend
  app.get('/api/ai/agents', (req: Request, res: Response) => {
    try {
      const agents = db.getAIAgents();
      res.json({ success: true, data: agents });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/ai/agents/verify-and-connect', (req: Request, res: Response) => {
    try {
      const { agentId, authMethod, accountEmail, password, phoneNumber, verificationCode, apiKey, modelTier } = req.body;
      if (!agentId) {
        return res.status(400).json({ success: false, error: 'agentId is required.' });
      }
      const result = db.verifyAndConnectAIAgent({
        agentId,
        authMethod: authMethod || 'google',
        accountEmail,
        password,
        phoneNumber,
        verificationCode,
        apiKey,
        modelTier,
      });
      res.json({
        success: true,
        data: result.agent,
        agents: result.agents,
        verificationReport: result.verificationReport,
      });
    } catch (err: any) {
      res.status(401).json({ success: false, error: err.message });
    }
  });

  app.post('/api/ai/agents/connect', (req: Request, res: Response) => {
    try {
      const { agentId, accountEmail, apiKey, modelTier, loginMethod, password, authMethod } = req.body;
      if (!agentId) {
        return res.status(400).json({ success: false, error: 'agentId is required.' });
      }
      const method = authMethod || (apiKey ? 'apikey' : loginMethod || 'google');
      const result = db.verifyAndConnectAIAgent({
        agentId,
        authMethod: method,
        accountEmail,
        password: password || 'verified-token',
        apiKey,
        modelTier,
      });
      res.json({
        success: true,
        data: result.agent,
        agents: result.agents,
        verificationReport: result.verificationReport,
      });
    } catch (err: any) {
      res.status(401).json({ success: false, error: err.message });
    }
  });

  app.post('/api/ai/agents/disconnect', (req: Request, res: Response) => {
    try {
      const { agentId } = req.body;
      if (!agentId) {
        return res.status(400).json({ success: false, error: 'agentId is required.' });
      }
      const updatedAgent = db.disconnectAIAgent(agentId);
      res.json({ success: true, data: updatedAgent, agents: db.getAIAgents() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/ai/agents/select', (req: Request, res: Response) => {
    try {
      const { agentId } = req.body;
      if (!agentId) {
        return res.status(400).json({ success: false, error: 'agentId is required.' });
      }
      const agents = db.selectAIAgent(agentId);
      res.json({ success: true, data: agents });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/ai/agents/sync', (req: Request, res: Response) => {
    try {
      const syncResult = db.syncAIAgents();
      res.json({ success: true, ...syncResult });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/ai/agents/sync', (req: Request, res: Response) => {
    try {
      const syncResult = db.syncAIAgents();
      res.json({ success: true, ...syncResult });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Calendar Integration
  app.get('/api/calendar/integration', (req: Request, res: Response) => {
    try {
      const integration = db.getCalendarIntegration();
      res.json({ success: true, data: integration });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/calendar/integration', (req: Request, res: Response) => {
    try {
      const updates = req.body;
      const updated = db.updateCalendarIntegration(updates);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    try {
      const { modelId, message, history, calendarPermission, googleAccessToken } = req.body;
      if (!modelId || !message) {
        return res.status(400).json({ success: false, error: 'modelId and message are required.' });
      }
      const reply = await generateAIChatResponse({ 
        modelId, 
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LifeRPG unified backend server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
