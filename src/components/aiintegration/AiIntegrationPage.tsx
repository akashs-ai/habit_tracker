import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  Bot,
  Command,
} from 'lucide-react';
import {
  initialAIModels,
  initialCalendarIntegration,
} from '../../data/aiIntegrationMockData';
import { AIIntegrationModel, CalendarIntegrationState, CalendarPermissionLevel } from '../../types';
import { AIModelsSection } from './AIModelsSection';
import { CalendarSection } from './CalendarSection';
import { PermissionsSection } from './PermissionsSection';
import {
  CompareModelsModal,
  ManageConnectionModal,
  SecurityLearnMoreModal,
  ConnectAgentModal,
} from './AiIntegrationModals';
import { api } from '../../services/api';

interface AiIntegrationPageProps {
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
  onToggleMobileMenu?: () => void;
  models?: AIIntegrationModel[];
  onSelectModel?: (id: string) => void;
  onConnectSubmit?: (agentId: string, details: any) => Promise<void>;
  onDisconnectModel?: (agentId: string) => Promise<void>;
  onSyncModels?: () => void;
  isSyncing?: boolean;
  lastSyncedTime?: string | null;
  userEmail?: string;
}

export const AiIntegrationPage: React.FC<AiIntegrationPageProps> = ({
  isDark,
  setIsDark,
  onToggleMobileMenu,
  models: propModels,
  onSelectModel: propOnSelectModel,
  onConnectSubmit: propOnConnectSubmit,
  onDisconnectModel: propOnDisconnectModel,
  onSyncModels: propOnSyncModels,
  isSyncing = false,
  lastSyncedTime,
  userEmail = 'iitangaming18@gmail.com',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [localModels, setLocalModels] = useState<AIIntegrationModel[]>(initialAIModels);
  const models = propModels || localModels;

  const [calendarState, setCalendarState] = useState<CalendarIntegrationState>(
    initialCalendarIntegration
  );

  // Modals state
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [manageTarget, setManageTarget] = useState<
    | { type: 'model'; model: AIIntegrationModel }
    | { type: 'calendar'; state: CalendarIntegrationState }
    | null
  >(null);
  const [connectModalModel, setConnectModalModel] = useState<AIIntegrationModel | null>(null);
  const [isSecurityLearnMoreOpen, setIsSecurityLearnMoreOpen] = useState(false);

  // Load AI agents and calendar integration from backend on mount
  useEffect(() => {
    let isMounted = true;
    if (!propModels) {
      api.getAIAgents()
        .then((loaded) => {
          if (!isMounted) return;
          setLocalModels(loaded);
        })
        .catch((err) => {
          console.error('Failed to load AI agents:', err);
        });
    }

    api.getCalendarIntegration()
      .then((cal) => {
        if (!isMounted || !cal) return;
        setCalendarState(cal);
      })
      .catch((err) => {
        console.error('Failed to load calendar integration:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [propModels]);

  // Handlers for Model Selection & Connection
  const handleSelectModel = async (modelId: string) => {
    if (propOnSelectModel) {
      propOnSelectModel(modelId);
      return;
    }
    // Optimistic local
    setLocalModels((prev) =>
      prev.map((m) => ({
        ...m,
        selected: m.id === modelId,
      }))
    );
    try {
      const updated = await api.selectAIAgent(modelId);
      setLocalModels(updated);
    } catch (err) {
      console.error('Failed to select model on backend:', err);
    }
  };

  const handleConnectModel = (modelId: string) => {
    const targetModel = models.find((m) => m.id === modelId);
    if (targetModel) {
      setConnectModalModel(targetModel);
    }
  };

  const handleConnectSubmit = async (
    agentId: string,
    details: any
  ) => {
    if (propOnConnectSubmit) {
      await propOnConnectSubmit(agentId, details);
      return;
    }
    try {
      const res = await api.verifyAndConnectAIAgent(agentId, details);
      setLocalModels(res.agents);
    } catch (err) {
      console.error('Failed to verify and connect agent:', err);
      throw err;
    }
  };

  const handleManageModel = (modelId: string) => {
    const targetModel = models.find((m) => m.id === modelId);
    if (targetModel) {
      setManageTarget({ type: 'model', model: targetModel });
    }
  };

  const handleManageCalendar = () => {
    setManageTarget({ type: 'calendar', state: calendarState });
  };

  const handleDisconnectTarget = async () => {
    if (!manageTarget) return;

    if (manageTarget.type === 'model') {
      const targetId = manageTarget.model.id;
      if (propOnDisconnectModel) {
        await propOnDisconnectModel(targetId);
        return;
      }
      try {
        const res = await api.disconnectAIAgent(targetId);
        setLocalModels(res.agents);
      } catch (err) {
        console.error('Failed to disconnect agent:', err);
        setLocalModels((prev) => {
          const updated = prev.map((m) =>
            m.id === targetId ? { ...m, status: 'not_connected' as const, selected: false } : m
          );
          const hasSelected = updated.some((m) => m.selected);
          if (!hasSelected) {
            const firstConnected = updated.find((m) => m.status === 'connected');
            if (firstConnected) {
              firstConnected.selected = true;
            }
          }
          return updated;
        });
      }
    } else {
      setCalendarState((prev) => ({
        ...prev,
        status: 'not_connected',
      }));
    }
  };

  const handlePermissionChange = async (perm: CalendarPermissionLevel) => {
    setCalendarState((prev) => ({
      ...prev,
      permission: perm,
    }));
    try {
      await api.updateCalendarIntegration({ permission: perm });
    } catch (err) {
      console.error('Failed to sync calendar permission:', err);
    }
  };

  const handleToggleUseInCoach = async () => {
    const nextVal = !calendarState.useInCoach;
    setCalendarState((prev) => ({
      ...prev,
      useInCoach: nextVal,
    }));
    try {
      await api.updateCalendarIntegration({ useInCoach: nextVal });
    } catch (err) {
      console.error('Failed to sync calendar useInCoach:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B12] text-slate-900 dark:text-[#F5F7FB] flex flex-col">
      {/* Top Global Header (Locked Layout matching LifeRPG Shell) */}
      <header className="h-[68px] border-b border-slate-200 dark:border-white/[0.07] px-4 md:px-8 flex items-center justify-between gap-4 sticky top-0 bg-white/95 dark:bg-[#070B12]/95 backdrop-blur-md z-30">
        {/* Mobile menu trigger + Search Input */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="relative w-full max-w-[480px]">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything... (e.g. connect calendar, use Claude, etc.)"
              className="w-full pl-9 pr-14 py-2 bg-[#101722] hover:bg-[#141D2A] focus:bg-[#141D2A] border border-white/[0.08] focus:border-[#5B5CE2] rounded-xl text-xs md:text-sm text-[#F5F7FB] placeholder-[#64748B] transition-all outline-none"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-[#94A3B8]">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Right Controls: Theme Toggle, Notifications, User Avatar */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle Theme"
          >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <div className="relative">
            <button
              type="button"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444]" />
            </button>
          </div>

          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-white/10">
            A
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 py-7 md:py-8 pb-24 lg:pb-12 max-w-[1250px] w-full mx-auto space-y-6 animate-fadeIn">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#818CF8] uppercase mb-1.5">
              <Bot className="w-3.5 h-3.5" />
              <span>AI INTEGRATION</span>
            </div>

            {/* Page Title */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F7FB] tracking-tight leading-tight">
              Connect your AI
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-[15px] text-[#94A3B8] mt-1 max-w-2xl leading-relaxed">
              Choose an AI model to chat with in AI Coach and connect your Google Calendar for better, more personalized guidance.
            </p>
          </div>

          {/* Right Inspirational Quote */}
          <div className="hidden lg:block text-right self-center shrink-0">
            <p className="text-xs md:text-sm font-medium italic text-[#94A3B8] leading-snug">
              “Right tools.
              <br />
              Deeper conversations.
              <br />
              A better you.”
            </p>
          </div>
        </div>

        {/* Section 1: AI Models */}
        <AIModelsSection
          models={models}
          onSelectModel={handleSelectModel}
          onConnectModel={handleConnectModel}
          onManageModel={handleManageModel}
          onOpenCompare={() => setIsCompareOpen(true)}
          onSyncModels={propOnSyncModels}
          isSyncing={isSyncing}
          lastSyncedTime={lastSyncedTime}
        />

        {/* Section 2: Google Calendar + Value Card */}
        <CalendarSection
          calendarState={calendarState}
          onManageCalendar={handleManageCalendar}
          onDisconnectCalendar={() => {
            setCalendarState((prev) => ({ ...prev, status: 'not_connected' }));
          }}
        />

        {/* Section 3: Permissions Card */}
        <PermissionsSection
          permission={calendarState.permission}
          useInCoach={calendarState.useInCoach}
          onPermissionChange={handlePermissionChange}
          onToggleUseInCoach={handleToggleUseInCoach}
          onManageAllPermissions={() => setIsSecurityLearnMoreOpen(true)}
          onLearnMore={() => setIsSecurityLearnMoreOpen(true)}
        />
      </main>

      {/* Interactive Modals */}
      <CompareModelsModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        models={models}
        onSelectModel={handleSelectModel}
      />

      <ManageConnectionModal
        isOpen={manageTarget !== null}
        onClose={() => setManageTarget(null)}
        target={manageTarget}
        onDisconnect={handleDisconnectTarget}
      />

      <ConnectAgentModal
        isOpen={connectModalModel !== null}
        onClose={() => setConnectModalModel(null)}
        model={connectModalModel}
        onConnect={handleConnectSubmit}
        userEmail={userEmail}
      />

      <SecurityLearnMoreModal
        isOpen={isSecurityLearnMoreOpen}
        onClose={() => setIsSecurityLearnMoreOpen(false)}
      />
    </div>
  );
};
