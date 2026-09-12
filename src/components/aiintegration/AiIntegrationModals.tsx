import React from 'react';
import { X, ShieldCheck, Check, Zap, Sparkles, ExternalLink, Bot, Calendar } from 'lucide-react';
import { AIIntegrationModel, CalendarIntegrationState } from '../../types';
import { modelComparisons } from '../../data/aiIntegrationMockData';
import { ChatGPTLogo, ClaudeLogo, GeminiLogo, GoogleCalendarTile } from './ModelLogos';

interface CompareModelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: AIIntegrationModel[];
  onSelectModel: (id: string) => void;
}

export const CompareModelsModal: React.FC<CompareModelsModalProps> = ({
  isOpen,
  onClose,
  models,
  onSelectModel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#101722] border border-white/10 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#201B4B] border border-[#6366F1]/30 flex items-center justify-center text-[#818CF8]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#F5F7FB]">Compare AI Models</h3>
            <p className="text-xs md:text-sm text-[#94A3B8]">
              Choose the best reasoning engine for your daily habit coaching.
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4 font-semibold text-[#94A3B8] w-1/4">Model</th>
                <th className="py-3 px-4 font-semibold text-[#F5F7FB] w-1/4">
                  <div className="flex items-center gap-2">
                    <ChatGPTLogo className="w-6 h-6" />
                    <span>ChatGPT</span>
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold text-[#F5F7FB] w-1/4">
                  <div className="flex items-center gap-2">
                    <ClaudeLogo className="w-6 h-6" />
                    <span>Claude</span>
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold text-[#F5F7FB] w-1/4">
                  <div className="flex items-center gap-2">
                    <GeminiLogo className="w-6 h-6" />
                    <span>Gemini</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {modelComparisons.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 font-medium text-[#94A3B8]">{row.feature}</td>
                  <td className="py-3.5 px-4 text-[#F5F7FB]">{row.chatgpt}</td>
                  <td className="py-3.5 px-4 text-[#F5F7FB]">{row.claude}</td>
                  <td className="py-3.5 px-4 text-[#F5F7FB]">{row.gemini}</td>
                </tr>
              ))}
              <tr>
                <td className="py-4 px-4 font-medium text-[#94A3B8]">Current Status</td>
                {models.map((m) => (
                  <td key={m.id} className="py-4 px-4">
                    {m.selected ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#5B5CE2]/20 text-[#818CF8] border border-[#5B5CE2]/40">
                        <Check className="w-3 h-3" />
                        Active in Coach
                      </span>
                    ) : m.status === 'connected' ? (
                      <button
                        onClick={() => {
                          onSelectModel(m.id);
                          onClose();
                        }}
                        className="px-3 py-1 rounded-lg bg-[#141D2A] hover:bg-[#1E293B] border border-white/10 text-xs font-medium text-[#F5F7FB]"
                      >
                        Set as Active
                      </button>
                    ) : (
                      <span className="text-xs text-[#64748B]">Not connected</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-[#5B5CE2] hover:bg-[#4E4FD4] text-xs md:text-sm font-semibold text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

interface ManageConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: { type: 'model'; model: AIIntegrationModel } | { type: 'calendar'; state: CalendarIntegrationState } | null;
  onDisconnect: () => void;
}

export const ManageConnectionModal: React.FC<ManageConnectionModalProps> = ({
  isOpen,
  onClose,
  target,
  onDisconnect,
}) => {
  if (!isOpen || !target) return null;

  const isModel = target.type === 'model';
  const title = isModel ? target.model.name : target.state.provider;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-[#101722] border border-white/10 shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          {isModel ? (
            target.model.iconType === 'chatgpt' ? (
              <ChatGPTLogo className="w-10 h-10" />
            ) : target.model.iconType === 'claude' ? (
              <ClaudeLogo className="w-10 h-10" />
            ) : (
              <GeminiLogo className="w-10 h-10" />
            )
          ) : (
            <GoogleCalendarTile className="w-10 h-10" />
          )}
          <div>
            <h3 className="text-base font-bold text-[#F5F7FB]">{title}</h3>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#22C55E] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              Connected & Verified
            </span>
          </div>
        </div>

        <div className="space-y-3.5 text-xs md:text-sm text-[#94A3B8] bg-[#141D2A] p-4 rounded-xl border border-white/5 mb-5">
          <div className="flex justify-between">
            <span>Status</span>
            <span className="text-[#F5F7FB] font-medium">Active</span>
          </div>
          <div className="flex justify-between">
            <span>Authentication</span>
            <span className="text-[#F5F7FB] font-medium">OAuth 2.0</span>
          </div>
          <div className="flex justify-between">
            <span>Last Sync</span>
            <span className="text-[#F5F7FB] font-medium">Just now</span>
          </div>
          {!isModel && (
            <div className="flex justify-between">
              <span>Account</span>
              <span className="text-[#F5F7FB] font-medium">{target.state.account}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={() => {
              onDisconnect();
              onClose();
            }}
            className="px-4 py-2 rounded-lg border border-[#FB7185]/30 text-[#FB7185] hover:bg-[#FB7185]/10 text-xs font-medium transition-colors"
          >
            Disconnect
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#5B5CE2] hover:bg-[#4E4FD4] text-xs font-semibold text-white transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface SecurityLearnMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityLearnMoreModal: React.FC<SecurityLearnMoreModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#101722] border border-white/10 shadow-2xl p-6 md:p-7">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#201B4B] border border-[#6366F1]/30 flex items-center justify-center text-[#818CF8]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F5F7FB]">Security & Privacy</h3>
            <p className="text-xs text-[#94A3B8]">
              Your data stays your data at all times.
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs md:text-sm text-[#94A3B8] leading-relaxed mb-6">
          <div className="p-3.5 rounded-xl bg-[#141D2A] border border-white/5">
            <h4 className="font-semibold text-[#F5F7FB] mb-1">OAuth 2.0 Direct Tokens</h4>
            <p>
              LifeRPG connects using official Google and AI provider OAuth endpoints. Your credentials and passwords are never stored on our servers.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#141D2A] border border-white/5">
            <h4 className="font-semibold text-[#F5F7FB] mb-1">Strict Read-Only Access</h4>
            <p>
              Calendar synchronization requests only read access to upcoming titles and start/end times to prevent schedule conflicts. It cannot alter or delete your calendar events.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#141D2A] border border-white/5">
            <h4 className="font-semibold text-[#F5F7FB] mb-1">Zero Training Policy</h4>
            <p>
              Your habits, tasks, and private conversations are never shared with public model training sets.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-[#5B5CE2] hover:bg-[#4E4FD4] text-xs font-semibold text-white transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
