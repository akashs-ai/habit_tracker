import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { CoachRobotAvatar } from './CoachRobotAvatar';
import { CoachChatMessage, SuggestedTask, CoachPack, CoachInsightItem } from '../../types';
import {
  initialSuggestedTasks,
  initialCoachInsights,
  initialCoachPacks,
  getCoachResponse
} from '../../data/aiCoachMockData';

interface CoachChatWorkspaceProps {
  messages: CoachChatMessage[];
  onSendMessage: (text: string) => void;
  onAddTaskToToday?: (taskTitle: string) => void;
  selectedPackId: string;
  onSelectPackId: (id: string) => void;
}

export const CoachChatWorkspace: React.FC<CoachChatWorkspaceProps> = ({
  messages,
  onSendMessage,
  onAddTaskToToday,
  selectedPackId,
  onSelectPackId,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'planner' | 'insights' | 'resources'>('chat');
  const [selectedModel, setSelectedModel] = useState('GPT-5 (LifeRPG)');
  const [inputText, setInputText] = useState('');
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>(initialSuggestedTasks);
  const [addedRecommendationIds, setAddedRecommendationIds] = useState<Record<string, boolean>>({});

  const handleSend = () => {
    if (!inputText.trim()) return;
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

  const handleRecommendationAction = (msgId: string, title: string) => {
    setAddedRecommendationIds((prev) => ({ ...prev, [msgId]: true }));
    onAddTaskToToday?.(title);
  };

  const selectedPack = initialCoachPacks.find((p) => p.id === selectedPackId) || initialCoachPacks[0];

  return (
    <div
      id="ai-coach-workspace-card"
      className="rounded-2xl bg-[#0F1723] border border-white/7 flex flex-col justify-between overflow-hidden shadow-xl"
    >
      {/* Top Workspace Header Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-white/6 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#0C121D]">
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

        {/* Right Model Dropdown Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => {
              setSelectedModel((m) =>
                m === 'GPT-5 (LifeRPG)' ? 'Gemini 2.5 Flash' : 'GPT-5 (LifeRPG)'
              );
            }}
            className="h-7 sm:h-8 px-2.5 rounded-lg bg-white/4 hover:bg-white/7 border border-white/6 text-xs text-[#94A3B8] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="font-medium text-white/90">{selectedModel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive Chat View */}
      {activeTab === 'chat' && (
        <div className="flex flex-col flex-1 min-h-[300px] sm:min-h-[340px]">
          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[440px] space-y-4">
            {messages.map((msg) => {
              const isCoach = msg.sender === 'coach';
              const isActionAdded = addedRecommendationIds[msg.id];

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 items-start ${isCoach ? 'justify-start' : 'justify-end'}`}
                >
                  {isCoach && <CoachRobotAvatar size="sm" className="mt-1" />}

                  <div className={`max-w-[85%] sm:max-w-xl space-y-2`}>
                    {/* Message Bubble */}
                    <div
                      className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                        isCoach
                          ? 'bg-[#151D2C] border border-white/8 text-[#F1F5F9]'
                          : 'bg-[#6366F1] text-white font-medium ml-auto'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-[10px] text-[#64748B] block mt-1.5 text-right tabular-nums">
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Actionable recommendation box (if attached) */}
                    {isCoach && msg.actionRecommendation && (
                      <div className="p-3 rounded-xl bg-white/4 border border-white/8 flex items-center justify-between gap-3 animate-in fade-in duration-200">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {msg.actionRecommendation.title}
                          </p>
                          <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                            {msg.actionRecommendation.description}
                          </p>
                        </div>

                        <button
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
                              : 'bg-[#6366F1] hover:bg-[#4F46E5] text-white cursor-pointer'
                          }`}
                        >
                          {isActionAdded ? (
                            <span className="flex items-center gap-1">
                              <Check className="w-3 h-3" /> Added ✓
                            </span>
                          ) : (
                            msg.actionRecommendation.actionLabel
                          )}
                        </button>
                      </div>
                    )}

                    {/* Follow-up Quick Suggestion Chips */}
                    {isCoach && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.suggestions.map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => onSendMessage(sug)}
                            className="text-left text-[11px] text-[#818CF8] hover:text-white bg-white/4 hover:bg-white/8 border border-white/6 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Box Bar */}
          <div className="p-3 sm:p-4 border-t border-white/6 bg-[#0B101A]">
            <div className="flex items-center gap-2 bg-[#141C2B] border border-white/8 focus-within:border-[#6366F1] rounded-xl px-3 py-1.5 transition-all">
              <button
                className="text-[#64748B] hover:text-[#94A3B8] p-1 transition-colors"
                title="Attach context note"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 bg-transparent border-none text-xs sm:text-sm text-white placeholder-[#64748B] focus:outline-none py-1.5"
              />

              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="w-8 h-8 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] disabled:opacity-40 disabled:hover:bg-[#6366F1] text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[10px] text-[#64748B] text-center mt-2">
              AI Coach may make mistakes. Always verify important information.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Suggested Today Planner View */}
      {activeTab === 'planner' && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/6">
            <div>
              <h4 className="text-sm font-bold text-white">Suggested Today</h4>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Targeted recommendations aligned with your {selectedPack.name} routine.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#818CF8]">
              {suggestedTasks.filter((t) => t.isAdded).length} of {suggestedTasks.length} added
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {suggestedTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 sm:p-3.5 rounded-xl bg-[#141C2B] border border-white/6 flex items-center justify-between gap-3 group hover:border-white/12 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 text-center text-xs font-mono font-semibold text-[#818CF8] bg-white/4 py-1 rounded-md shrink-0">
                    {task.time}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-[13px] font-semibold text-white truncate">
                      {task.title}
                    </p>
                    <p className="text-[11px] text-[#94A3B8] flex items-center gap-1.5 mt-0.5">
                      <span>{task.category}</span>
                      <span>•</span>
                      <span>{task.durationMinutes} min</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleTaskAdd(task)}
                  className={`h-7 px-3 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    task.isAdded
                      ? 'bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30'
                      : 'bg-[#6366F1] hover:bg-[#4F46E5] text-white'
                  }`}
                >
                  {task.isAdded ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3" /> Added ✓
                    </span>
                  ) : (
                    'Add'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Coach Insights View */}
      {activeTab === 'insights' && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="pb-2 border-b border-white/6">
            <h4 className="text-sm font-bold text-white">Data-Driven Patterns</h4>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Behavioral analytics derived from your completion cadence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {initialCoachInsights.map((ins) => (
              <div
                key={ins.id}
                className="p-4 rounded-xl bg-[#141C2B] border border-white/6 flex flex-col justify-between gap-2"
              >
                <div>
                  <span className="text-[11px] font-semibold text-[#818CF8] uppercase tracking-wider">
                    {ins.title}
                  </span>
                  <p className="text-xl font-bold text-white mt-1">{ins.stat}</p>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed mt-1">
                  {ins.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Resources & Coach Pack Switcher */}
      {activeTab === 'resources' && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="pb-2 border-b border-white/6">
            <h4 className="text-sm font-bold text-white">Coach Packs & Rhythms</h4>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Switch your active focus archetype to update advice parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {initialCoachPacks.map((pack) => {
              const isCurrent = pack.id === selectedPackId;
              return (
                <div
                  key={pack.id}
                  onClick={() => onSelectPackId(pack.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isCurrent
                      ? 'bg-[#182035] border-[#6366F1] ring-1 ring-[#6366F1]'
                      : 'bg-[#141C2B] border-white/6 hover:border-white/14'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{pack.icon}</span>
                      <h5 className="text-sm font-bold text-white">{pack.name}</h5>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-[#6366F1] bg-[#6366F1]/15 px-2 py-0.5 rounded-md">
                        Active
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {pack.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {pack.focusAreas.map((area, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-white/80 bg-white/4 px-2 py-0.5 rounded"
                      >
                        • {area}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
