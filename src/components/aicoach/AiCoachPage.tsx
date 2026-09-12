import React, { useState, useEffect } from 'react';
import {
  Search,
  Moon,
  Sun,
  Bell,
  Menu,
  Sparkles,
  X
} from 'lucide-react';
import { CoachHeroBanner } from './CoachHeroBanner';
import { TryAskingGrid } from './TryAskingGrid';
import { YourCoachCard } from './YourCoachCard';
import { CoachLandscapeCard } from './CoachLandscapeCard';
import { CoachChatWorkspace } from './CoachChatWorkspace';
import { ConnectAgentModal } from '../aiintegration/AiIntegrationModals';
import {
  initialCoachPrompts,
  initialChatMessages,
} from '../../data/aiCoachMockData';
import { CoachChatMessage, CoachPromptOption, AIIntegrationModel } from '../../types';
import { api } from '../../services/api';

interface AiCoachPageProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onToggleMobileMenu: () => void;
  onAddTaskToToday?: (taskTitle: string) => void;
  onNavigate?: (tab: string) => void;
  agents?: AIIntegrationModel[];
  onSelectModelId?: (id: string) => void;
  onSyncModels?: () => void;
  isSyncingModels?: boolean;
  lastSyncedTime?: string | null;
}

export const AiCoachPage: React.FC<AiCoachPageProps> = ({
  isDark,
  setIsDark,
  onToggleMobileMenu,
  onAddTaskToToday,
  onNavigate,
  agents: propAgents,
  onSelectModelId: propOnSelectModelId,
  onSyncModels: propOnSyncModels,
  isSyncingModels = false,
  lastSyncedTime,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<CoachChatMessage[]>(initialChatMessages);
  const [selectedPackId, setSelectedPackId] = useState('cse_student');
  const [activeDetailModal, setActiveDetailModal] = useState<string | null>(null);

  // Multi-Agent State
  const [localAgents, setLocalAgents] = useState<AIIntegrationModel[]>([]);
  const agents = propAgents || localAgents;

  const [selectedModelId, setSelectedModelId] = useState<string>('chatgpt');
  const [connectingAgent, setConnectingAgent] = useState<AIIntegrationModel | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (propAgents && propAgents.length > 0) {
      const active = propAgents.find((a) => a.selected) || propAgents.find((a) => a.status === 'connected') || propAgents[0];
      if (active) {
        setSelectedModelId(active.id);
      }
      return;
    }

    let isMounted = true;
    api.getAIAgents()
      .then((loaded) => {
        if (!isMounted) return;
        setLocalAgents(loaded);
        const active = loaded.find((a) => a.selected) || loaded.find((a) => a.status === 'connected') || loaded[0];
        if (active) {
          setSelectedModelId(active.id);
        }
      })
      .catch((err) => {
        console.error('Failed to load AI agents in Coach:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [propAgents]);

  const handleSelectModelId = async (modelId: string) => {
    setSelectedModelId(modelId);
    if (propOnSelectModelId) {
      propOnSelectModelId(modelId);
      return;
    }
    try {
      const updated = await api.selectAIAgent(modelId);
      setLocalAgents(updated);
    } catch (err) {
      console.error('Failed to select AI agent:', err);
    }
  };

  const handleConnectAgent = async (
    agentId: string,
    details: { accountEmail?: string; apiKey?: string; modelTier?: string; loginMethod?: string }
  ) => {
    const res = await api.connectAIAgent(agentId, details);
    setLocalAgents(res.agents);
    setSelectedModelId(agentId);
    if (propOnSyncModels) {
      propOnSyncModels();
    }
  };

  const handleSendMessage = async (userText: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: CoachChatMessage = {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      const reply = await api.sendAIChat({
        modelId: selectedModelId,
        message: userText,
      });
      setMessages((prev) => [...prev, reply]);
    } catch (err: any) {
      console.error('AI chat error:', err);
      const activeAgentObj = agents.find((a) => a.id === selectedModelId);
      setMessages((prev) => [
        ...prev,
        {
          id: `coach-fallback-${Date.now()}`,
          sender: 'coach',
          text: `⚠️ **${activeAgentObj?.name || 'Agent'} Note**: ${err.message || 'Unable to connect to model.'} Please check connection in AI Integration.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentId: selectedModelId,
          agentName: activeAgentObj?.name || 'LifeRPG AI Coach',
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPrompt = (prompt: CoachPromptOption) => {
    handleSendMessage(prompt.prompt);
    // Scroll smoothly to chat workspace if user clicked from top
    const chatWorkspace = document.getElementById('ai-coach-workspace-card');
    if (chatWorkspace) {
      chatWorkspace.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      id="ai-coach-page-root"
      className="flex-1 flex flex-col min-w-0 bg-[#080F1A] text-[#F1F5F9] font-sans pb-24 lg:pb-12 min-h-screen"
    >
      {/* 1. Global Header Bar (Desktop 72px / Tablet & Mobile 64px) */}
      <header
        id="ai-coach-top-header"
        className="h-16 lg:h-[72px] px-4 sm:px-6 lg:px-8 border-b border-white/6 flex items-center justify-between gap-4 sticky top-0 bg-[#080F1A]/95 backdrop-blur-md z-20"
      >
        {/* Left: Mobile hamburger + Search input */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 border border-white/6 transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo on Tablet/Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold">
              L
            </div>
            <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
              LifeRPG
            </span>
          </div>

          {/* Search Box */}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything... (e.g. how to stay consistent?)"
              className="w-full h-10 pl-9.5 pr-14 rounded-xl bg-[#0F1723] border border-white/7 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-mono text-[#64748B] bg-white/4 border border-white/7 px-1.5 py-0.5 rounded pointer-events-none">
              <span>⌘</span>
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Right Controls: Theme Toggle, Notifications, Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 sm:p-2.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 border border-white/6 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setActiveDetailModal('notifications')}
              className="p-2 sm:p-2.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 border border-white/6 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-[#080F1A]" />
          </div>

          <div
            onClick={() => setActiveDetailModal('profile')}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] p-0.5 cursor-pointer hover:ring-2 hover:ring-[#818CF8]/50 transition-all flex items-center justify-center shrink-0"
            title="Alex (Level 12)"
          >
            <div className="w-full h-full rounded-full bg-[#1E293B] flex items-center justify-center text-xs font-bold text-white">
              A
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main AI Coach Page Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 max-w-[1440px] w-full mx-auto flex flex-col gap-4 sm:gap-6">
        {/* Page Title & Quote Row */}
        <div className="flex items-start justify-between gap-4 pt-1">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
              AI Coach
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
              Your personal guide, built for a better you.
            </p>
          </div>

          <div className="text-right shrink-0 pt-1 select-none">
            <p className="text-xs sm:text-[13px] italic font-serif text-[#94A3B8] leading-snug">
              &ldquo;Small steps, <br className="hidden sm:inline" /> bigger tomorrows.&rdquo;
            </p>
          </div>
        </div>

        {/* Hero Card Banner */}
        <CoachHeroBanner onSelectAction={(text) => handleSendMessage(text)} />

        {/* Middle Section: "Try asking" + Right Coach Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left: 6 Interactive Prompt Cards (8 cols on desktop) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <TryAskingGrid
              prompts={initialCoachPrompts}
              onSelectPrompt={handleSelectPrompt}
              onSeeAll={() => setActiveDetailModal('prompts')}
            />

            {/* Desktop Bottom Chat Workspace */}
            <div className="hidden lg:block">
              <CoachChatWorkspace
                messages={messages}
                agents={agents}
                selectedModelId={selectedModelId}
                onSelectModelId={handleSelectModelId}
                onOpenConnectModal={(agent) => setConnectingAgent(agent)}
                isGenerating={isGenerating}
                onSendMessage={handleSendMessage}
                onAddTaskToToday={onAddTaskToToday}
                selectedPackId={selectedPackId}
                onSelectPackId={setSelectedPackId}
                onNavigateToIntegrations={() => onNavigate?.('ai-integration')}
                onSyncModels={propOnSyncModels}
                isSyncingModels={isSyncingModels}
                lastSyncedTime={lastSyncedTime}
              />
            </div>
          </div>

          {/* Right: Side Information Cards (4 cols on desktop) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <YourCoachCard onOpenCoachDetails={() => setActiveDetailModal('coach')} />
            <CoachLandscapeCard />
          </div>

          {/* Tablet & Mobile: Chat Workspace Placed Below Side Cards */}
          <div className="lg:hidden col-span-1">
            <CoachChatWorkspace
              messages={messages}
              agents={agents}
              selectedModelId={selectedModelId}
              onSelectModelId={handleSelectModelId}
              onOpenConnectModal={(agent) => setConnectingAgent(agent)}
              isGenerating={isGenerating}
              onSendMessage={handleSendMessage}
              onAddTaskToToday={onAddTaskToToday}
              selectedPackId={selectedPackId}
              onSelectPackId={setSelectedPackId}
              onNavigateToIntegrations={() => onNavigate?.('ai-integration')}
              onSyncModels={propOnSyncModels}
              isSyncingModels={isSyncingModels}
              lastSyncedTime={lastSyncedTime}
            />
          </div>
        </div>
      </main>

      {/* Connect / Login to AI Agent Modal */}
      <ConnectAgentModal
        isOpen={connectingAgent !== null}
        onClose={() => setConnectingAgent(null)}
        model={connectingAgent}
        onConnect={handleConnectAgent}
      />

      {/* Detail Dialog Modal */}
      {activeDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg bg-[#0F1723] border border-white/10 rounded-2xl shadow-2xl p-5 sm:p-6 text-white relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/8">
              <h3 className="text-base font-bold text-white capitalize">
                {activeDetailModal === 'prompts'
                  ? 'All Guided Prompts'
                  : activeDetailModal === 'coach'
                  ? 'About LifeRPG AI Coach'
                  : activeDetailModal === 'notifications'
                  ? 'Coach Notifications'
                  : 'Alex (Level 12)'}
              </h3>
              <button
                onClick={() => setActiveDetailModal(null)}
                className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 text-xs sm:text-sm text-[#94A3B8] space-y-3 max-h-[60vh] overflow-y-auto">
              {activeDetailModal === 'prompts' && (
                <div className="space-y-2">
                  <p className="text-white font-medium">Select any topic to ask your AI coach:</p>
                  {initialCoachPrompts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        handleSelectPrompt(p);
                        setActiveDetailModal(null);
                      }}
                      className="w-full text-left p-3 rounded-xl bg-white/4 hover:bg-white/8 border border-white/6 transition-colors flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="font-semibold text-white text-xs">{p.title}</p>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5">{p.subtitle}</p>
                      </div>
                      <span className="text-[#818CF8] text-xs font-semibold shrink-0">Ask →</span>
                    </button>
                  ))}
                </div>
              )}

              {activeDetailModal === 'coach' && (
                <div className="space-y-2 text-xs">
                  <p className="text-white font-semibold text-sm">Professional Personal Productivity Coach</p>
                  <p>
                    LifeRPG AI Coach observes your daily completion cadence, habits, and task velocity to recommend small, high-impact improvements.
                  </p>
                  <div className="p-3 rounded-xl bg-white/4 border border-white/6 mt-2 space-y-1.5">
                    <p className="text-[#34D399] font-medium">✓ Real-time pattern tracking</p>
                    <p className="text-[#818CF8] font-medium">✓ Guided daily prioritization</p>
                    <p className="text-[#FB7185] font-medium">✓ Friction reduction & habit stacking</p>
                  </div>
                </div>
              )}

              {activeDetailModal === 'notifications' && (
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-white/4 border border-white/6">
                    <p className="text-white font-semibold">Morning Priority Ready</p>
                    <p className="text-[#94A3B8] mt-0.5">
                      Your coach recommends completing your 45-min DSA block before starting tasks.
                    </p>
                  </div>
                </div>
              )}

              {activeDetailModal === 'profile' && (
                <div className="space-y-2 text-xs">
                  <p className="text-white font-bold text-sm">Alex • Productivity Specialist</p>
                  <p>Current Routine: CSE Student Archetype</p>
                  <p className="text-[#94A3B8]">
                    Productivity model tuned for algorithmic study, project milestones, and habit consistency.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/8 flex justify-end">
              <button
                onClick={() => setActiveDetailModal(null)}
                className="px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-xs font-semibold text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
