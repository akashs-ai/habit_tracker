import React, { useState } from 'react';
import { 
  X, 
  Quote, 
  Sparkles, 
  Shuffle, 
  Check, 
  Copy, 
  Trash2, 
  Plus, 
  Bookmark, 
  Feather,
  Flame,
  Award
} from 'lucide-react';
import { MotivationalQuote, QuoteCategory } from '../../types';
import { soundFx } from '../../utils/audioFx';

interface QuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotes: MotivationalQuote[];
  activeQuote?: MotivationalQuote;
  onAddQuote: (quoteData: { text: string; author?: string; category?: string; setActive?: boolean }) => Promise<void>;
  onSetActiveQuote: (quoteId: string) => Promise<void>;
  onDeleteQuote: (quoteId: string) => Promise<void>;
  onShuffleQuote: () => Promise<void>;
}

const CATEGORIES: { id: QuoteCategory; label: string; color: string; bg: string }[] = [
  { id: 'mindset', label: 'Mindset', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800' },
  { id: 'discipline', label: 'Discipline', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
  { id: 'courage', label: 'Courage', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
  { id: 'focus', label: 'Focus', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' },
  { id: 'growth', label: 'Growth', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
  { id: 'wisdom', label: 'Wisdom', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
];

export const QuotesModal: React.FC<QuotesModalProps> = ({
  isOpen,
  onClose,
  quotes,
  activeQuote,
  onAddQuote,
  onSetActiveQuote,
  onDeleteQuote,
  onShuffleQuote,
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'add'>('browse');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [newText, setNewText] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState<QuoteCategory>('mindset');
  const [setAsActiveImmediately, setSetAsActiveImmediately] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentActive = activeQuote || quotes.find((q) => q.isActive) || quotes[0];

  const filteredQuotes = quotes.filter((q) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'custom') return q.isCustom;
    return q.category === selectedFilter;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    soundFx.playCheckmark();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShuffle = async () => {
    soundFx.playCheckmark();
    await onShuffleQuote();
  };

  const handleSelectActive = async (id: string) => {
    soundFx.playCheckmark();
    await onSetActiveQuote(id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this custom quote?')) {
      await onDeleteQuote(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newText.trim();
    if (!trimmed) {
      setValidationError('Please enter a quote or reflection.');
      return;
    }
    setValidationError(null);
    setIsSubmitting(true);
    try {
      await onAddQuote({
        text: trimmed,
        author: newAuthor.trim() || undefined,
        category: newCategory,
        setActive: setAsActiveImmediately,
      });
      soundFx.playRewardUnlocked();
      setNewText('');
      setNewAuthor('');
      setActiveTab('browse');
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to add quote');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quotes-modal-title"
    >
      <div 
        id="quotes-management-modal"
        className="w-full max-w-xl bg-white dark:bg-[#151518] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#27272A] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-[#27272A] flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <Quote className="w-5 h-5" />
            </div>
            <div>
              <h2 id="quotes-modal-title" className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Daily Wisdom & Inscriptions
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  +10 XP Inscribe
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspire your daily hero journey on the Hero Banner, Header, and Sidebar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 pb-1 flex items-center gap-2 border-b border-slate-100 dark:border-[#27272A]">
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'browse'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Browse Library ({quotes.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'add'
                ? 'bg-[#7C6CFF] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Inscribe New Quote</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'browse' ? (
            <>
              {/* Highlighted Active Quote Banner */}
              {currentActive && (
                <div className="relative p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-[#1E1B18] dark:to-[#2A231C] border border-amber-200/80 dark:border-amber-900/40 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                      Active Daily Inscription
                    </span>
                    <button
                      type="button"
                      onClick={handleShuffle}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-800 dark:text-amber-200 bg-amber-200/60 dark:bg-amber-900/50 hover:bg-amber-300/80 dark:hover:bg-amber-900/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Shuffle to another wisdom quote"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span>Shuffle</span>
                    </button>
                  </div>
                  <blockquote className="font-handwriting text-2xl sm:text-3xl text-slate-800 dark:text-amber-100 font-semibold tracking-wide leading-snug my-2 select-text">
                    &ldquo;{currentActive.text}&rdquo;
                  </blockquote>
                  <div className="flex items-center justify-between text-xs text-amber-800/80 dark:text-amber-200/80 font-medium pt-1">
                    <span>— {currentActive.author || 'Adventurer'}</span>
                    <span className="capitalize px-2 py-0.5 rounded-md bg-amber-500/15 text-[10px] font-bold">
                      {currentActive.category}
                    </span>
                  </div>
                </div>
              )}

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
                    selectedFilter === 'all'
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-slate-100 text-slate-600 dark:bg-[#1E1E22] dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  All Quotes
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter('custom')}
                  className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
                    selectedFilter === 'custom'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-[#1E1E22] dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  My Custom ({quotes.filter((q) => q.isCustom).length})
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedFilter(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 capitalize transition-colors ${
                      selectedFilter === cat.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-[#1E1E22] dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Quotes List */}
              <div className="space-y-3">
                {filteredQuotes.map((q) => {
                  const isActive = q.id === currentActive?.id;
                  const catConfig = CATEGORIES.find((c) => c.id === q.category) || CATEGORIES[0];
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-600 shadow-xs ring-1 ring-indigo-400/40'
                          : 'bg-slate-50/60 dark:bg-[#1A1A1E] border-slate-200/80 dark:border-[#27272A] hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catConfig.bg} ${catConfig.color}`}>
                            {catConfig.label}
                          </span>
                          {q.isCustom && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              Custom
                            </span>
                          )}
                          {isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Active Display
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug">
                          &ldquo;{q.text}&rdquo;
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          — {q.author || 'Anonymous'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleCopy(q.text, q.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#27272A] transition-colors"
                          title="Copy quote"
                        >
                          {copiedId === q.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => handleSelectActive(q.id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#25252A] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#3F3F46] hover:bg-slate-100 dark:hover:bg-[#2E2E34] transition-colors"
                          >
                            Set Active
                          </button>
                        )}
                        {q.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDelete(q.id)}
                            className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete custom quote"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Add Custom Quote Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {validationError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                  {validationError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Quote / Wisdom Text *</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {newText.length} characters
                  </span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="e.g., Discipline today, a brighter tomorrow. / Progress over perfection."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#111113] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C6CFF] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Author / Origin
                  </label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g., Marcus Aurelius, Alex Rivera, or You"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#111113] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C6CFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Category Theme
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as QuoteCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#111113] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C6CFF] capitalize"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Handwritten Preview Card */}
              <div>
                <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Feather className="w-3.5 h-3.5 text-amber-500" />
                  Hero Banner & Sidebar Handwritten Preview
                </span>
                <div className="p-4 rounded-2xl bg-[#FFFDF7] dark:bg-[#1A1816] border border-amber-200/70 dark:border-amber-900/30 shadow-2xs">
                  <p className="font-handwriting text-2xl text-[#2B3674] dark:text-[#E2E8F0] font-semibold tracking-wide">
                    {newText.trim() ? newText : 'Progress, not perfection.'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                    — {newAuthor.trim() ? newAuthor : 'Adventurer'}
                  </p>
                </div>
              </div>

              {/* Set as active immediately checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={setAsActiveImmediately}
                  onChange={(e) => setSetAsActiveImmediately(e.target.checked)}
                  className="w-4 h-4 rounded text-[#7C6CFF] focus:ring-[#7C6CFF]"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Set as Active Daily Quote immediately across the app
                </span>
              </label>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#27272A]">
                <button
                  type="button"
                  onClick={() => setActiveTab('browse')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#7C6CFF] hover:bg-[#6855FF] text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>{isSubmitting ? 'Inscribing...' : 'Inscribe Quote (+10 XP)'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
