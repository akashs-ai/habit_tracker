import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  ChevronDown,
  Plus,
  Check,
  Calendar,
  Clock,
  Sparkles,
  TrendingUp,
  Brain,
  Zap,
  CheckCircle2,
  Loader2,
  Lock,
  ExternalLink,
  Bot,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Shield
} from 'lucide-react';
import { CoachRobotAvatar } from './CoachRobotAvatar';
import {
  CoachChatMessage,
  SuggestedTask,
  CoachPack,
  CoachInsightItem,
  AIIntegrationModel
} from '../../types';
import {
  initialSuggestedTasks,
  initialCoachInsights,
  initialCoachPacks
} from '../../data/aiCoachMockData';
import { ChatGPTLogo, ClaudeLogo, GeminiLogo } from '../aiintegration/ModelLogos';

interface CoachChatWorkspaceProps {
  messages: CoachChatMessage[];
  agents: AIIntegrationModel[];
  selectedModelId: string;
  onSelectModelId: (id: string) => void;
  onOpenConnectModal: (model: AIIntegrationModel) => void;
  isGenerating?: boolean;
  onSendMessage: (text: string) => void;
  onAddTaskToToday?: (taskTitle: string) => void;
  selectedPackId: string;
  onSelectPackId: (id: string) => void;
  onNavigateToIntegrations?: () => void;
  onSyncModels?: () => void;
  isSyncingModels?: boolean;
  lastSyncedTime?: string | null;
  userEmail?: string;
  selectedGeminiModel?: string;
  onChangeGeminiModel?: (model: string) => void;
  selectedRole?: string;
  onChangeRole?: (role: string) => void;
}

export const CoachChatWorkspace: React.FC<CoachChatWorkspaceProps> = ({
  messages,
  agents,
  selectedModelId,
  onSelectModelId,
  onOpenConnectModal,
  isGenerating = false,
  onSendMessage,
  onAddTaskToToday,
  selectedPackId,
  onSelectPackId,
  onNavigateToIntegrations,
  onSyncModels,
  isSyncingModels = false,
  lastSyncedTime,
  userEmail = 'iitangaming18@gmail.com',
  selectedGeminiModel = 'gemini-3.5-flash',
  onChangeGeminiModel,
  selectedRole = 'general_coach',
  onChangeRole,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'planner' | 'insights' | 'resources'>('chat');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>(initialSuggestedTasks);
  const [addedRecommendationIds, setAddedRecommendationIds] = useState<Record<string, boolean>>({});
  const [pendingConfirmAction, setPendingConfirmAction] = useState<{
    title: string;
    description: string;
    actionText: string;
    destructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating, activeTab]);

  const activeAgent = agents.find((a) => a.id === selectedModelId) || agents[0] || {
    id: 'chatgpt',
    name: 'ChatGPT',
    status: 'not_connected' as const,
    selected: true,
    description: '',
    tags: [],
    iconType: 'chatgpt' as const,
    modelTier: 'GPT-4o (Omni)',
    verified: false,
  };

  const isAgentVerified = activeAgent.status === 'connected' && activeAgent.verified === true;
  const connectedVerifiedAgents = agents.filter((a) => a.status === 'connected' && a.verified === true);
  const unverifiedOrDisconnectedAgents = agents.filter((a) => !(a.status === 'connected' && a.verified === true));

  const handleSend = () => {
    if (!inputText.trim() || isGenerating) return;
    const lower = inputText.toLowerCase();
    const isDestructive = 
      (lower.includes('delete') || lower.includes('remove') || lower.includes('cancel')) &&
      (lower.includes('event') || lower.includes('workout') || lower.includes('calendar') || lower.includes('meeting') || lower.includes('session'));

    if (isDestructive) {
      setPendingConfirmAction({
        title: 'Confirm Calendar Event Deletion',
        description: `You are requesting a destructive calendar modification: "${inputText.trim()}". This will permanently delete the event from your Google Calendar and LifeRPG schedule.`,
        actionText: 'Confirm & Delete Event',
        destructive: true,
        onConfirm: () => {
          onSendMessage(inputText.trim());
          setInputText('');
        },
      });
      return;
    }

    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleToggleTaskAdd = (task: SuggestedTask) => {
    setSuggestedTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, isAdded: !t.isAdded } : t))
    );
    if (!task.isAdded) {
      onAddTaskToToday?.(task.title);
    }
  };

  const handleSuggestionClick = (s: string) => {
    const lower = s.toLowerCase();
    const isDestructive =
      (lower.includes('delete') || lower.includes('remove') || lower.includes('cancel')) &&
      (lower.includes('event') || lower.includes('workout') || lower.includes('calendar') || lower.includes('meeting') || lower.includes('session'));

    if (isDestructive) {
      setPendingConfirmAction({
        title: 'Confirm Calendar Event Deletion',
        description: `You are requesting: "${s}". This will permanently delete the event from your Google Calendar.`,
        actionText: 'Confirm & Delete Event',
        destructive: true,
        onConfirm: () => onSendMessage(s),
      });
      return;
    }
    onSendMessage(s);
  };

  const handleRecommendationAction = (msgId: string, title: string) => {
    setAddedRecommendationIds((prev) => ({ ...prev, [msgId]: true }));
    onAddTaskToToday?.(title);
  };

  const renderAgentLogo = (iconType: 'chatgpt' | 'claude' | 'gemini' | string, size = 'w-5 h-5') => {
    switch (iconType) {
      case 'chatgpt':
        return <ChatGPTLogo className={size} />;
      case 'claude':
        return <ClaudeLogo className={size} />;
      case 'gemini':
      default:
        return <GeminiLogo className={size} />;
    }
  };

  const selectedPack = initialCoachPacks.find((p) => p.id === selectedPackId) || initialCoachPacks[0];

  return (
    <div
      id="ai-coach-workspace-card"
      className="rounded-2xl bg-[#0F1723] border border-white/8 flex flex-col justify-between overflow-hidden shadow-xl"
    >
      {/* Top Workspace Header Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-white/6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0C121D]">
        {/* Left Segmented Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-[#6366F1] text-white shadow-sm shadow-indigo-600/30'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/4'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'planner'
                ? 'bg-[#6366F1] text-white shadow-sm shadow-indigo-600/30'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/4'
            }`}
          >
            Planner
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'insights'
                ? 'bg-[#6366F1] text-white shadow-sm shadow-indigo-600/30'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/4'
            }`}
          >
            Insights
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'resources'
                ? 'bg-[#6366F1] text-white shadow-sm shadow-indigo-600/30'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/4'
            }`}
          >
            Resources
          </button>
        </div>

        {/* Right AI Agent Model Dropdown Selector & Sync Button */}
        <div className="flex items-center gap-1.5">
          {onSyncModels && (
            <button
              type="button"
              onClick={onSyncModels}
              disabled={isSyncingModels}
              className="h-8 w-8 rounded-xl bg-[#141D2A] hover:bg-[#1A2536] border border-white/10 text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
              title="Sync AI Models"
              aria-label="Sync AI Models"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#818CF8] ${isSyncingModels ? 'animate-spin' : ''}`} />
            </button>
          )}

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`h-8 px-3 rounded-xl border text-xs text-[#F5F7FB] flex items-center gap-2 transition-colors cursor-pointer shadow-sm ${
                isAgentVerified
                  ? 'bg-[#141D2A] hover:bg-[#1A2536] border-white/10'
                  : 'bg-amber-950/20 hover:bg-amber-950/40 border-amber-500/30 text-amber-200'
              }`}
              aria-label="Select AI Model"
            >
              {renderAgentLogo(activeAgent.iconType, 'w-4 h-4')}
              <span className="font-semibold text-white truncate max-w-[130px]">
                {activeAgent.modelTier || activeAgent.name}
              </span>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isAgentVerified ? 'bg-[#22C55E]' : 'bg-amber-400 animate-pulse'
                }`}
                title={isAgentVerified ? 'Verified & Connected' : 'Unverified / Not Connected'}
              />
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Popup */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-[#101722] border border-white/10 shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-white/6 mb-1.5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-[#818CF8] uppercase tracking-wider">
                      Select AI Coach Agent
                    </p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Switch between verified intelligence models
                    </p>
                  </div>
                  {onSyncModels && (
                    <button
                      type="button"
                      onClick={onSyncModels}
                      disabled={isSyncingModels}
                      className="p-1 rounded-lg hover:bg-white/5 text-[#818CF8] transition-colors"
                      title="Sync AI Models"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingModels ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>

                {/* Verified Connected Agents */}
                <div className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-semibold text-[#94A3B8] uppercase flex items-center justify-between">
                    <span>Verified Models ({connectedVerifiedAgents.length})</span>
                    <span className="text-[10px] text-emerald-400 font-medium">Ready to chat</span>
                  </div>

                  {connectedVerifiedAgents.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-[#64748B] italic">
                      No AI model verified yet. Connect an account below to chat.
                    </div>
                  ) : (
                    connectedVerifiedAgents.map((agent) => {
                      const isSelected = agent.id === activeAgent.id;
                      return (
                        <button
                          key={agent.id}
                          type="button"
                          onClick={() => {
                            onSelectModelId(agent.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#6366F1]/15 border border-[#6366F1]/30 text-white'
                              : 'hover:bg-white/5 text-[#F5F7FB]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {renderAgentLogo(agent.iconType, 'w-6 h-6')}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-white truncate">
                                  {agent.name}
                                </span>
                                {agent.id === 'gemini' && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#6366F1]/25 text-[#A5B4FC] font-semibold border border-[#6366F1]/40 flex items-center gap-0.5">
                                    <Sparkles className="w-2.5 h-2.5 text-[#F59E0B]" />
                                    DEFAULT
                                  </span>
                                )}
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-medium flex items-center gap-0.5">
                                  <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
                                  Verified
                                </span>
                              </div>
                              <p className="text-[11px] text-[#94A3B8] truncate">
                                {agent.accountEmail || agent.modelTier || 'Active session'}
                              </p>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#6366F1] flex items-center justify-center text-white shrink-0 ml-2">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Not Connected / Unverified Section */}
                {unverifiedOrDisconnectedAgents.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/6 space-y-1">
                    <div className="px-3 py-1 text-[10px] font-semibold text-[#64748B] uppercase">
                      Available to Connect ({unverifiedOrDisconnectedAgents.length})
                    </div>
                    {unverifiedOrDisconnectedAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className="p-2.5 rounded-xl bg-white/[0.02] border border-white/4 flex items-center justify-between gap-2"
                      >
                        <div
                          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                          onClick={() => {
                            onSelectModelId(agent.id);
                            setIsDropdownOpen(false);
                          }}
                        >
                          {renderAgentLogo(agent.iconType, 'w-6 h-6 opacity-75')}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-semibold text-[#94A3B8] truncate">
                                {agent.name}
                              </p>
                              <span className="text-[9px] px-1 rounded bg-amber-500/15 text-amber-300 font-medium">
                                Auth Req
                              </span>
                            </div>
                            <p className="text-[10px] text-[#64748B] truncate">
                              {agent.modelTier || agent.description}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onOpenConnectModal(agent);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#6366F1] hover:bg-[#5558E6] text-[11px] font-semibold text-white whitespace-nowrap transition-colors shrink-0 shadow-sm cursor-pointer"
                        >
                          + Connect
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Link to AI Integration Hub */}
                {onNavigateToIntegrations && (
                  <div className="mt-2 pt-2 border-t border-white/6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigateToIntegrations();
                      }}
                      className="w-full py-1.5 px-3 rounded-lg text-left text-[11px] font-medium text-[#818CF8] hover:text-white hover:bg-white/5 flex items-center justify-between transition-colors"
                    >
                      <span>Manage all AI Integrations</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab 1: Interactive Chat View */}
      {activeTab === 'chat' && (
        <div className="flex flex-col flex-1 min-h-[340px]">
          {/* Active Model Subtitle Bar */}
          <div className="px-4 sm:px-6 py-2 bg-[#090E17] border-b border-white/4 flex items-center justify-between text-[11px] text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isAgentVerified ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>
                Chatting with <strong className="text-[#F5F7FB]">{activeAgent.name}</strong> ({activeAgent.modelTier || 'Active Model'})
              </span>
              {isAgentVerified ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-medium ml-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified ({activeAgent.accountEmail || userEmail})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-medium ml-1">
                  <AlertCircle className="w-3 h-3" />
                  Login Required
                </span>
              )}
            </div>

            {!isAgentVerified ? (
              <button
                type="button"
                onClick={() => onOpenConnectModal(activeAgent)}
                className="text-[#818CF8] hover:text-white font-medium flex items-center gap-1 cursor-pointer transition-colors text-xs"
              >
                <span>Connect & Verify →</span>
              </button>
            ) : (
              <span className="text-[#64748B] hidden sm:inline">
                Backed by LifeRPG Momentum Engine
              </span>
            )}
          </div>

          {/* Special Gemini Dynamic Model & Persona Selector Bar */}
          {activeAgent.id === 'gemini' && (
            <div className="px-4 sm:px-6 py-2.5 bg-[#0C1320] border-b border-white/6 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              {/* Model Options: 3.5 Flash, 3.1 Flash Lite, 3.1 Pro Preview */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#A5B4FC]">
                  <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Gemini Model:</span>
                </div>
                <div className="inline-flex p-0.5 rounded-lg bg-white/[0.04] border border-white/8">
                  <button
                    type="button"
                    onClick={() => onChangeGeminiModel?.('gemini-3.5-flash')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      (selectedGeminiModel || 'gemini-3.5-flash') === 'gemini-3.5-flash'
                        ? 'bg-[#6366F1] text-white shadow-sm ring-1 ring-[#818CF8]'
                        : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.06]'
                    }`}
                    title="Gemini 3.5 Flash: Balanced multimodal model for general tasks (Default)"
                  >
                    ⚡ 3.5 Flash <span className="text-[9px] opacity-80">(Default)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeGeminiModel?.('gemini-3.1-flash-lite')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      selectedGeminiModel === 'gemini-3.1-flash-lite'
                        ? 'bg-[#6366F1] text-white shadow-sm ring-1 ring-[#818CF8]'
                        : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.06]'
                    }`}
                    title="Gemini 3.1 Flash Lite: Lightweight and ultra-fast for quick check-ins"
                  >
                    🚀 3.1 Lite <span className="text-[9px] opacity-80">(Fast)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeGeminiModel?.('gemini-3.1-pro-preview')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      selectedGeminiModel === 'gemini-3.1-pro-preview'
                        ? 'bg-[#6366F1] text-white shadow-sm ring-1 ring-[#818CF8]'
                        : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.06]'
                    }`}
                    title="Gemini 3.1 Pro Preview: Deep reasoning and complex tasks"
                  >
                    🧠 3.1 Pro <span className="text-[9px] opacity-80">(Complex)</span>
                  </button>
                </div>
              </div>

              {/* Persona Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-[#64748B] font-medium hidden sm:inline">Persona:</span>
                <div className="inline-flex p-0.5 rounded-lg bg-white/[0.04] border border-white/8">
                  {[
                    { id: 'general_coach', label: '🎯 Coach' },
                    { id: 'strict_drill_sergeant', label: '⚡ Drill Sgt' },
                    { id: 'calendar_strategist', label: '📅 Schedule' },
                    { id: 'habit_architect', label: '🧠 Habit Arc' },
                  ].map((roleItem) => (
                    <button
                      key={roleItem.id}
                      type="button"
                      onClick={() => onChangeRole?.(roleItem.id)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        (selectedRole || 'general_coach') === roleItem.id
                          ? 'bg-[#818CF8]/25 text-[#CBD5E1] border border-[#818CF8]/40'
                          : 'text-[#64748B] hover:text-[#CBD5E1]'
                      }`}
                    >
                      {roleItem.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[440px] space-y-4">
            {/* Unverified Model Warning Card */}
            {!isAgentVerified && (
              <div className="p-4 rounded-2xl bg-[#141D2A] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      {activeAgent.name} Authentication & Verification Required
                    </p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                      Verify your account credentials with Google, Phone, or API key to unlock {activeAgent.name} chat coaching.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenConnectModal(activeAgent)}
                  className="px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#5254E0] text-xs font-semibold text-white transition-all shrink-0 flex items-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Connect {activeAgent.name}</span>
                </button>
              </div>
            )}
            {messages.map((msg) => {
              const isCoach = msg.sender === 'coach';
              const isActionAdded = addedRecommendationIds[msg.id];
              const msgAgentId = msg.agentId || activeAgent.id;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 items-start ${isCoach ? 'justify-start' : 'justify-end'}`}
                >
                  {isCoach && (
                    <div className="shrink-0 mt-0.5">
                      {renderAgentLogo(msgAgentId, 'w-8 h-8')}
                    </div>
                  )}

                  <div className="max-w-[85%] sm:max-w-xl space-y-2">
                    {/* Header Label for Coach */}
                    {isCoach && (
                      <div className="flex items-center gap-2 ml-1 flex-wrap">
                        <span className="text-[11px] font-bold text-[#818CF8]">
                          {msg.agentName || (msgAgentId === 'gemini' ? 'Gemini' : msgAgentId === 'claude' ? 'Claude 3.5 Sonnet' : 'GPT-4o')}
                        </span>
                        {msgAgentId === 'gemini' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#6366F1]/20 text-[#A5B4FC] font-semibold border border-[#6366F1]/30">
                            {msg.geminiModel === 'gemini-3.1-pro-preview' ? '3.1 Pro' : msg.geminiModel === 'gemini-3.1-flash-lite' ? '3.1 Lite' : '3.5 Flash'}
                          </span>
                        )}
                        {msg.role && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 font-medium border border-amber-500/25">
                            {msg.role === 'strict_drill_sergeant' ? 'Drill Sgt' : msg.role === 'calendar_strategist' ? 'Calendar' : msg.role === 'habit_architect' ? 'Habits' : 'Coach'}
                          </span>
                        )}
                        <span className="text-[10px] text-[#64748B] tabular-nums">
                          {msg.timestamp}
                        </span>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                        isCoach
                          ? 'bg-[#141D2A] border border-white/8 text-[#F1F5F9]'
                          : 'bg-[#6366F1] text-white font-medium ml-auto'
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.text}</div>
                      {!isCoach && (
                        <span className="text-[10px] text-white/70 block mt-1.5 text-right tabular-nums">
                          {msg.timestamp}
                        </span>
                      )}
                    </div>

                    {/* Calendar Action Result Banner */}
                    {isCoach && msg.calendarAction && (
                      <div
                        className={`p-3 rounded-xl border text-xs flex flex-col gap-2 animate-in fade-in duration-200 ${
                          msg.calendarAction.action === 'created'
                            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-100'
                            : msg.calendarAction.action === 'rescheduled'
                            ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-100'
                            : msg.calendarAction.action === 'deleted'
                            ? 'bg-rose-950/40 border-rose-500/30 text-rose-100'
                            : 'bg-amber-950/40 border-amber-500/30 text-amber-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`p-2 rounded-lg shrink-0 ${
                                msg.calendarAction.action === 'created'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : msg.calendarAction.action === 'rescheduled'
                                  ? 'bg-indigo-500/20 text-indigo-400'
                                  : msg.calendarAction.action === 'deleted'
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {msg.calendarAction.action === 'permission_denied' ? (
                                <Lock className="w-4 h-4" />
                              ) : msg.calendarAction.action === 'deleted' ? (
                                <Trash2 className="w-4 h-4" />
                              ) : (
                                <Calendar className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-xs tracking-tight">
                                {msg.calendarAction.action === 'created' && 'Calendar Event Created & Synced'}
                                {msg.calendarAction.action === 'rescheduled' && 'Calendar Event Rescheduled'}
                                {msg.calendarAction.action === 'deleted' && 'Calendar Event Removed'}
                                {msg.calendarAction.action === 'permission_denied' && 'Calendar Action Blocked (Read Only)'}
                              </p>
                              {msg.calendarAction.eventTitle && (
                                <p className="text-[11px] opacity-80 truncate mt-0.5">
                                  <strong>{msg.calendarAction.eventTitle}</strong>
                                  {msg.calendarAction.date ? ` · ${msg.calendarAction.date}` : ''}
                                  {msg.calendarAction.time ? ` at ${msg.calendarAction.time}` : ''}
                                </p>
                              )}
                              {msg.calendarAction.details && (
                                <p className="text-[10px] opacity-75 mt-0.5 truncate">
                                  {msg.calendarAction.details}
                                </p>
                              )}
                            </div>
                          </div>

                          {msg.calendarAction.action === 'permission_denied' ? (
                            onNavigateToIntegrations && (
                              <button
                                type="button"
                                onClick={onNavigateToIntegrations}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-[11px] shrink-0 transition-colors shadow-sm cursor-pointer flex items-center gap-1"
                              >
                                <span>Switch to Read & Edit</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                              Read & Edit Active
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actionable recommendation box (if attached) */}
                    {isCoach && msg.actionRecommendation && (
                      <div className="p-3 rounded-xl bg-[#090E17] border border-white/8 flex items-center justify-between gap-3 animate-in fade-in duration-200">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {msg.actionRecommendation.title}
                          </p>
                          <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                            {msg.actionRecommendation.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleRecommendationAction(
                              msg.id,
                              msg.actionRecommendation!.title
                            )
                          }
                          disabled={isActionAdded}
                          className={`h-7 px-3 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                            isActionAdded
                              ? 'bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30 cursor-default'
                              : 'bg-[#6366F1] hover:bg-[#4F46E5] text-white cursor-pointer shadow-sm'
                          }`}
                        >
                          {isActionAdded ? (
                            <span className="flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Added
                            </span>
                          ) : (
                            <span>{msg.actionRecommendation.actionLabel || 'Add to Tasks'}</span>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Suggestion Chips */}
                    {isCoach && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSuggestionClick(s)}
                            className="px-2.5 py-1 rounded-lg bg-white/4 hover:bg-white/8 border border-white/6 text-[11px] text-[#94A3B8] hover:text-white transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Thinking / Generating State */}
            {isGenerating && (
              <div className="flex gap-3 items-start animate-fadeIn">
                <div className="shrink-0 mt-0.5">
                  {renderAgentLogo(activeAgent.iconType, 'w-8 h-8')}
                </div>
                <div className="p-3.5 rounded-2xl bg-[#141D2A] border border-white/8 text-xs text-[#94A3B8] flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#818CF8]" />
                  <span>{activeAgent.name} is thinking & analyzing schedule...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-3 sm:p-4 bg-[#0C121D] border-t border-white/6">
            {!isAgentVerified && (
              <div className="mb-2.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Verify your account credentials before chatting with <strong>{activeAgent.name}</strong>.
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => onOpenConnectModal(activeAgent)}
                  className="font-bold underline hover:text-white cursor-pointer ml-2 shrink-0 text-amber-200"
                >
                  Verify Now →
                </button>
              </div>
            )}

            <div
              className={`flex items-center gap-2 rounded-xl bg-[#141D2A] border px-3 py-1.5 transition-colors ${
                isAgentVerified
                  ? 'border-white/8 focus-within:border-[#6366F1]'
                  : 'border-amber-500/30 bg-amber-950/10'
              }`}
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!isAgentVerified}
                placeholder={
                  isAgentVerified
                    ? `Ask ${activeAgent.name} (${activeAgent.modelTier || 'AI Coach'})...`
                    : `Authenticate ${activeAgent.name} account to begin chatting...`
                }
                className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-[#64748B] outline-none py-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              />

              {isAgentVerified ? (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!inputText.trim() || isGenerating}
                  className="w-8 h-8 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] disabled:opacity-40 disabled:hover:bg-[#6366F1] flex items-center justify-center text-white transition-all shadow-sm shrink-0 cursor-pointer"
                >
                  {isGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenConnectModal(activeAgent)}
                  className="px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Connect Account</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Planner Tab */}
      {activeTab === 'planner' && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Suggested Focus Sprints</h4>
              <p className="text-xs text-[#94A3B8]">
                Curated by {activeAgent.name} to maximize your streak XP
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {suggestedTasks.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl bg-[#141D2A] border border-white/6 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white truncate">{t.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#94A3B8]">
                      {t.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    {t.category} • {t.durationMinutes} mins
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleTaskAdd(t)}
                  className={`h-7 px-3 rounded-lg text-xs font-semibold transition-all ${
                    t.isAdded
                      ? 'bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30'
                      : 'bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  {t.isAdded ? 'Added' : '+ Add'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Insights Tab */}
      {activeTab === 'insights' && (
        <div className="p-4 sm:p-6 space-y-3">
          <h4 className="text-sm font-bold text-white">Coach Intelligence Insights</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {initialCoachInsights.map((insight) => (
              <div
                key={insight.id}
                className="p-3.5 rounded-xl bg-[#141D2A] border border-white/6 space-y-1"
              >
                <span className="text-xs font-bold text-[#818CF8]">{insight.stat}</span>
                <p className="text-xs font-semibold text-white">{insight.title}</p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Resources Tab */}
      {activeTab === 'resources' && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Active Coaching Blueprint</h4>
          </div>
          <div className="p-4 rounded-xl bg-[#141D2A] border border-white/6 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#818CF8]" />
              <span className="text-xs font-bold text-white">{selectedPack.name}</span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">{selectedPack.description}</p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {selectedPack.focusAreas.map((area, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-white/5 border border-white/6 text-[10px] text-[#94A3B8]"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Explicit User Confirmation Dialog for Destructive / Mutation Calendar Operations */}
      {pendingConfirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#101725] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl ${
                  pendingConfirmAction.destructive
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {pendingConfirmAction.destructive ? (
                  <Trash2 className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {pendingConfirmAction.title}
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Action Confirmation
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/6 text-xs text-[#CBD5E1] leading-relaxed">
              {pendingConfirmAction.description}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPendingConfirmAction(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  pendingConfirmAction.onConfirm();
                  setPendingConfirmAction(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md transition-all cursor-pointer ${
                  pendingConfirmAction.destructive
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                    : 'bg-[#6366F1] hover:bg-[#4F46E5] shadow-indigo-600/20'
                }`}
              >
                {pendingConfirmAction.actionText || 'Confirm & Execute'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
