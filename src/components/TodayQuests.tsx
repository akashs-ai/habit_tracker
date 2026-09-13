import React, { useState } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Crown, 
  Check, 
  ArrowRight,
  Shield,
  Coffee,
  BookOpen,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import { Quest, QuestCategory } from '../types';
import { soundFx } from '../utils/audioFx';
import { ParticleBurst, FloatingText } from './effects/ParticleBurst';

interface TodayQuestsProps {
  quests: Quest[];
  onToggleComplete: (id: string) => void;
  onOpenAddModal: () => void;
  activeFilter: QuestCategory;
  setActiveFilter: (cat: QuestCategory) => void;
}

export const TodayQuests: React.FC<TodayQuestsProps> = ({
  quests,
  onToggleComplete,
  onOpenAddModal,
  activeFilter,
  setActiveFilter,
}) => {
  const [activeParticles, setActiveParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [activeFloatingTexts, setActiveFloatingTexts] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const categories: { id: QuestCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'focus', label: 'Focus' },
    { id: 'learning', label: 'Learning' },
    { id: 'health', label: 'Health' },
    { id: 'personal', label: 'Personal' },
  ];

  const filteredQuests = quests.filter((q) => {
    if (activeFilter === 'all') return true;
    return q.category === activeFilter;
  });

  const getCardStyle = (category: Quest['category']) => {
    switch (category) {
      case 'focus':
        return {
          bg: 'bg-[#FFFDF2] dark:bg-[#201D14]',
          border: 'border-[#FEF08A] dark:border-[#3D3516]',
          tagBg: 'bg-[#FEF9C3] dark:bg-[#2E2812]',
          tagText: 'text-[#854D0E] dark:text-[#FDE047]',
          pinColor: 'bg-[#F59E0B]',
          icon: Shield,
        };
      case 'health':
        return {
          bg: 'bg-[#F4FAF6] dark:bg-[#132219]',
          border: 'border-[#BBF7D0] dark:border-[#1E3827]',
          tagBg: 'bg-[#DCFCE7] dark:bg-[#193222]',
          tagText: 'text-[#166534] dark:text-[#86EFAC]',
          pinColor: 'bg-[#22C55E]',
          icon: Coffee,
        };
      case 'learning':
        return {
          bg: 'bg-[#F7F7FD] dark:bg-[#19192B]',
          border: 'border-[#DDD6FE] dark:border-[#2C294D]',
          tagBg: 'bg-[#EDE9FE] dark:bg-[#242144]',
          tagText: 'text-[#5B21B6] dark:text-[#C4B5FD]',
          pinColor: 'bg-[#8B5CF6]',
          icon: BookOpen,
        };
      case 'personal':
        return {
          bg: 'bg-[#FCF5F7] dark:bg-[#26161D]',
          border: 'border-[#FBCFE8] dark:border-[#421D2C]',
          tagBg: 'bg-[#FCE7F3] dark:bg-[#381825]',
          tagText: 'text-[#9D174D] dark:text-[#F472B6]',
          pinColor: 'bg-[#EC4899]',
          icon: Target,
        };
    }
  };

  const getAttributeIcon = (attr: Quest['attribute']) => {
    switch (attr) {
      case 'Intellect':
        return <Sparkles className="w-3.5 h-3.5 text-[#6366F1]" />;
      case 'Strength':
        return <Zap className="w-3.5 h-3.5 text-[#EA580C]" />;
      case 'Knowledge':
        return <BookOpen className="w-3.5 h-3.5 text-[#3B82F6]" />;
      case 'Discipline':
        return <Target className="w-3.5 h-3.5 text-[#EC4899]" />;
    }
  };

  const handleQuestAction = (e: React.MouseEvent, quest: Quest) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const spawnX = rect.left + rect.width / 2;
    const spawnY = rect.top + rect.height / 2;

    if (!quest.completed) {
      soundFx.playQuestComplete();
      const burstId = Date.now() + Math.random();
      setActiveParticles((prev) => [...prev, { id: burstId, x: spawnX, y: spawnY }]);
      setActiveFloatingTexts((prev) => [
        ...prev,
        { id: burstId, x: spawnX, y: spawnY, text: `+${quest.xpReward} XP` },
      ]);
    } else {
      soundFx.playCheckmark();
    }

    onToggleComplete(quest.id);
  };

  return (
    <section id="todays-quests-section" className="flex flex-col gap-4 relative">
      {/* Dynamic Particle Bursts */}
      {activeParticles.map((burst) => (
        <ParticleBurst
          key={burst.id}
          x={burst.x}
          y={burst.y}
          onComplete={() => {
            setActiveParticles((prev) => prev.filter((p) => p.id !== burst.id));
          }}
        />
      ))}

      {/* Floating XP Rewards */}
      {activeFloatingTexts.map((ft) => (
        <FloatingText
          key={ft.id}
          x={ft.x}
          y={ft.y}
          text={ft.text}
          color="#F59E0B"
          onComplete={() => {
            setActiveFloatingTexts((prev) => prev.filter((f) => f.id !== ft.id));
          }}
        />
      ))}

      {/* Header with Navigation & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#FAFAFA] tracking-tight">
            Today&apos;s Quests
          </h2>
        </div>

        {/* Filters and Add Button */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 bg-[#F3F4F6] dark:bg-[#18181B] p-1 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === cat.id
                    ? 'bg-[#111827] text-white dark:bg-[#FAFAFA] dark:text-[#111827] shadow-xs'
                    : 'text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111827] dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            id="add-quest-btn"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 bg-[#7C6CFF] hover:bg-[#6D5CEB] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Quest</span>
          </button>
        </div>
      </div>

      {/* 4 Quest Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredQuests.map((quest) => {
          const style = getCardStyle(quest.category);
          const CategoryIcon = style.icon;

          return (
            <div
              key={quest.id}
              id={`quest-card-${quest.id}`}
              className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${style.bg} ${style.border} ${
                quest.completed ? 'opacity-70' : ''
              }`}
            >
              {/* Pushpin / Tape decorative element */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
                <div className={`w-3.5 h-3.5 rounded-full ${style.pinColor} ring-2 ring-white dark:ring-[#111113] shadow-xs opacity-90`} />
              </div>

              <div>
                {/* Card Top: Category Tag + Time + Menu */}
                <div className="flex items-center justify-between mt-1 mb-3">
                  <span
                    className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${style.tagBg} ${style.tagText}`}
                  >
                    <CategoryIcon className="w-3 h-3" />
                    <span>{quest.category} · {quest.durationMinutes} MIN</span>
                  </span>

                  <button className="text-[#9CA3AF] hover:text-[#4B5563] dark:hover:text-[#D1D5DB] transition-colors p-1">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quest Title & Description */}
                <div className="mb-4">
                  <h3
                    className={`font-semibold text-base text-[#111827] dark:text-[#FAFAFA] leading-snug mb-1 ${
                      quest.completed ? 'line-through text-[#9CA3AF]' : ''
                    }`}
                  >
                    {quest.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#A1A1AA] leading-relaxed">
                    {quest.subtitle}
                  </p>
                </div>
              </div>

              <div>
                {/* Rewards & Attribute Indicator */}
                <div className="flex items-center justify-between text-xs font-semibold py-2.5 border-t border-[#E5E7EB]/50 dark:border-[#2E2E38]/50 mb-3">
                  <div className="flex items-center gap-1 text-[#D97706] dark:text-[#FBBF24]">
                    <Crown className="w-3.5 h-3.5 fill-[#D97706] dark:fill-[#FBBF24]" />
                    <span>+{quest.xpReward} XP</span>
                  </div>

                  <div className="flex items-center gap-1 text-[#4B5563] dark:text-[#D1D5DB] text-[11px]">
                    {getAttributeIcon(quest.attribute)}
                    <span>{quest.attribute}</span>
                  </div>
                </div>

                {/* Action Button: Start Quest or Mark Complete */}
                {quest.category === 'focus' && !quest.completed ? (
                  <button
                    onClick={(e) => handleQuestAction(e, quest)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#111827] dark:bg-[#FAFAFA] hover:bg-[#1F2937] dark:hover:bg-white active:scale-95 text-white dark:text-[#111827] text-xs font-semibold transition-all shadow-xs"
                  >
                    <span>Start Quest</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleQuestAction(e, quest)}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                      quest.completed
                        ? 'bg-[#22C55E] border-[#22C55E] text-white shadow-xs'
                        : 'bg-white/80 dark:bg-[#1C1C20] border-[#E5E7EB] dark:border-[#34343A] text-[#374151] dark:text-[#E4E4E7] hover:border-[#7C6CFF] hover:text-[#7C6CFF]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                        quest.completed
                          ? 'border-white bg-white text-[#22C55E] scale-110'
                          : 'border-[#9CA3AF] bg-transparent'
                      }`}
                    >
                      {quest.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{quest.completed ? 'Completed' : 'Mark Complete'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
