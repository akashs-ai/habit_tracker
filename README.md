# ⚔️ LifeRPG — Gamified Productivity & Habit Tracking Dashboard

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg?logo=express)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg?logo=supabase)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.4-8E75B2.svg?logo=google)](https://ai.google.dev/)

**LifeRPG** transforms daily habits, recurring routines, and everyday tasks into an immersive RPG adventure. Level up your real-life attributes (Intellect, Discipline, Strength, and Knowledge), earn Momentum Points (MP), maintain streaks, visualize 14-week consistency heatmaps, and receive personalized coaching from multi-agent AI companions.

---

## 🌟 Key Features

- **🎮 RPG Progression System**: Earn XP and Momentum Points (MP) for completed tasks and habits. Level up your character, upgrade core attributes, and unlock shop rewards.
- **⚡ Daily Quests & Habits**: Track habits with real-time streak calculations, categorized durations, and tactile audio feedback.
- **📋 Task & Goal Management**: Organize prioritized tasks (low/medium/high/urgent) with due dates, tags, and milestones tied directly to long-term goals.
- **📊 Analytics & Activity Heatmap**: Monitor a 14-week GitHub-style consistency heatmap, donut charts for time distribution, category breakdown, and weekly trend graphs.
- **🤖 Multi-Agent AI Coaching**: Integrated AI assistant featuring custom personas (Gemini, Claude, and ChatGPT) powered by Google Gemini SDK for advice, task planning, and accountability.
- **🔒 Full-Stack Architecture**: Built on Node.js + Express with an authenticated session layer, Supabase PostgreSQL persistence, Row Level Security (RLS), and database RPC functions.
- **🌓 Adaptive Theme & Sound FX**: Fluid Dark, Light, and System theme switching with customizable sound effects and responsive design from mobile to desktop.

---

## 🏗️ Architecture & Project Structure

```text
liferpg/
├── .env.example             # Template for required environment variables
├── server.ts                # Express backend entry point & Vite middleware
├── package.json             # NPM dependencies, scripts, and build configuration
├── tsconfig.json            # TypeScript compiler configuration
├── vite.config.ts           # Vite configuration with Tailwind CSS plugin
├── metadata.json            # Application metadata and platform capabilities
│
├── server/                  # Backend modules
│   ├── ai.ts                # Google Gemini AI coaching service
│   ├── db.ts                # Persistent in-memory / local fallback store
│   ├── supabase.ts          # Server-side Supabase client & JWT verification
│   └── terms.ts             # Terms of service & rewards policy
│
├── src/                     # Frontend React 19 client
│   ├── App.tsx              # Main application root & state orchestration
│   ├── main.tsx             # React entry point
│   ├── index.css            # Tailwind CSS styling & custom utility rules
│   ├── types.ts             # Global TypeScript type definitions & interfaces
│   │
│   ├── components/          # Reusable UI components
│   │   ├── Header.tsx       # Top navigation, global search, notifications, & user profile
│   │   ├── Sidebar.tsx      # Navigation sidebar, theme switcher, & level stats
│   │   ├── HeroBanner.tsx   # Bento-grid carousel with XP donut & quick stats
│   │   ├── QuestsList.tsx   # Active quests, habit toggles, & audio rewards
│   │   ├── TasksList.tsx    # Prioritized tasks, filtering, & modals
│   │   ├── analytics/       # Analytics dashboard, heatmap, trend cards, & KPIs
│   │   ├── ai/              # Multi-agent AI companion drawer & conversation engine
│   │   ├── auth/            # Sign in, Sign up, & Guest modal dialogs
│   │   ├── goals/           # Long-term goals & milestone progress cards
│   │   ├── rewards/         # Momentum point redemption & item shop
│   │   └── settings/        # Profile customization, audio controls, & data export
│   │
│   ├── lib/                 # Shared utilities
│   │   ├── supabase.ts      # Client-side Supabase initialization & Realtime hooks
│   │   └── soundEffects.ts  # Audio synthesizer & sound effect triggers
│   │
│   └── services/            # Client API services
│       ├── api.ts           # Centralized API service layer
│       └── supabaseData.ts  # Direct Supabase database queries & sync logic
│
└── supabase/                # Database migrations & schemas
    ├── schema.sql           # Complete PostgreSQL schema (tables, RLS, triggers, RPC)
    └── migrations/          # Incremental database migration scripts
```

---

## 🚀 Quick Start & Installation

### Prerequisites

- **Node.js**: `v18.x` or `v20.x`+ recommended ([Download Node.js](https://nodejs.org/))
- **npm** (bundled with Node) or **bun** / **pnpm**
- **Supabase Account**: Free tier at [supabase.com](https://supabase.com) (optional for guest mode, required for cloud sync)
- **Google Gemini API Key**: Free at [Google AI Studio](https://aistudio.google.com/app/apikey) (for AI coaching features)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/liferpg.git
cd liferpg
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to create your local `.env` file:

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials:

```env
# Google Gemini API key for AI coaching
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Server-side credentials
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Supabase Client-side credentials (Vite)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here

# Server Port
PORT=3000
NODE_ENV=development
```

*(Note: If Supabase keys are left empty, the application will automatically run in local fallback mode with full guest functionality).*

### 4. Setup Supabase Database

1. Open your Supabase Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Navigate to the **SQL Editor** in your project.
3. Open `supabase/schema.sql` from this repository.
4. Copy and paste the entire script into the SQL Editor and click **Run**.
5. This provisions all required tables, triggers, Row-Level Security (RLS) policies, and the `calculate_user_streak` PostgreSQL stored function.

### 5. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser. The app runs with full hot-reloading for the frontend and instant backend route handling.

---

## 📜 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Boots Express backend with `tsx` and mounts Vite dev server at port `3000` |
| `npm run build` | Builds the client via Vite and bundles `server.ts` to `dist/server.cjs` via `esbuild` |
| `npm start` | Launches the compiled standalone production server (`node dist/server.cjs`) |
| `npm run lint` | Type-checks all TypeScript code across client and server (`tsc --noEmit`) |
| `npm run preview` | Runs Vite static preview on the client build |
| `npm run clean` | Deletes compiled build outputs (`dist/`, `server.js`) |

---

## 🔐 Environment Variables Reference

| Variable | Required | Scope | Description |
| :--- | :---: | :---: | :--- |
| `GEMINI_API_KEY` | Optional | Server | Google Gemini API Key for multi-agent AI assistant coaching |
| `SUPABASE_URL` | Optional | Server | Supabase project URL for server-side auth and data synchronization |
| `SUPABASE_ANON_KEY` | Optional | Server | Supabase public anon key for server verification |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Server | Supabase service role secret key for administrative database tasks |
| `VITE_SUPABASE_URL` | Optional | Client | Supabase URL accessible to the browser client |
| `VITE_SUPABASE_ANON_KEY` | Optional | Client | Supabase Anon Key accessible to the browser client |
| `PORT` | Optional | Server | Network port for Express server (default `3000`) |
| `NODE_ENV` | Optional | Server | Runtime environment (`development` or `production`) |

---

## 🗄️ Database Schema Overview

The database uses PostgreSQL on Supabase with Row Level Security (RLS):

- **`profiles`**: Stores user levels, total XP, next level thresholds, Momentum Points, and streaks.
- **`habits`**: Core habit and recurring quest definitions (attribute affinity, XP reward, category).
- **`habit_completions`**: Daily completion ledger tracking completions per day with unique `(habit_id, completed_date)`.
- **`tasks`**: User task management with priorities, completion timestamps, and tags.
- **`goals`**: Long-term objectives with milestone units and progress tracking.
- **`rewards` & `user_items`**: Redeemable shop items and user inventory tracking.
- **`calculate_user_streak`**: PostgreSQL RPC function calculating consecutive active days without timezone drift.

---

## 🚢 Production Deployment

### Option A: Cloud Run / Container Deployment
The application builds cleanly into a self-contained Node.js server:
```bash
npm run build
npm start
```

### Option B: Vercel Deployment
The repository includes dedicated Vercel Serverless API handlers (`api/index.ts`, `api/[...all].ts`) and rewrites (`vercel.json`) to serve all REST API routes without 405 Method Not Allowed errors.
1. Connect your repository to Vercel.
2. Set Environment Variables in Project Settings (`GEMINI_API_KEY`, `VITE_SUPABASE_URL`, etc.).
3. Deploy!

### Option C: Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📐 RPG Progression Engine Math

LifeRPG implements an authoritative non-linear leveling curve where every subsequent level requires increasingly more XP to master:

$$\text{XP Required for Level } L = 500 + (L - 1) \times 200$$

- **Level 1**: 500 XP
- **Level 2**: 700 XP (+200 XP delta)
- **Level 3**: 900 XP (+200 XP delta)
- **Level 4**: 1,100 XP (+200 XP delta)
- **Level $N$**: Non-linear compounded curve ensuring long-term engagement.

### Attributes System
Tasks and quests boost specific character RPG attributes:
- **Coding / Architecture** $\rightarrow$ **Intellect**
- **Workout / Gym / Physical activity** $\rightarrow$ **Strength**
- **Reading / Strategy / Research** $\rightarrow$ **Knowledge / Wisdom**
- **Consistency / Mindfulness / Routine** $\rightarrow$ **Discipline**

---

## 📜 Daily Wisdom & Inscription Engine
- Inscribe personalized motivational quotes with custom authors and category tags (Discipline, Mindset, Courage, Focus, Growth, Wisdom).
- Earn **+10 XP** and tactile celebrations upon inscribing wisdom.
- Instantly syncs across the Hero Banner, Header, and Sidebar.
- Shuffle mode allows instantaneous cycling through curated and user-inscribed quotes.

---

## ♿ Accessibility & Tactile Micro-Interactions
- **Zero-Latency Audio Synthesizer**: Pure Web Audio API synthesizes wooden checkmark pops, heroic major pentatonic fanfares, coin chimes, and crystal unlocks in-memory without external asset latency.
- **Keyboard Navigation**: 100% navigable via keyboard (<kbd>Tab</kbd>, <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>Esc</kbd>) with explicit `aria-label`, dialog roles, and visible focus rings.
- **Resilient Offline Architecture**: Optimistic task and quest addition preserves your input during network hiccups or offline mode without ever deleting your work.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
