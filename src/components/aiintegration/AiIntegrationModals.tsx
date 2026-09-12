import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Check,
  Zap,
  Sparkles,
  ExternalLink,
  Bot,
  Calendar,
  Lock,
  Key,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
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

interface ConnectAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: AIIntegrationModel | null;
  onConnect: (
    agentId: string,
    details: { accountEmail?: string; apiKey?: string; modelTier?: string; loginMethod?: string }
  ) => Promise<void>;
}

export const ConnectAgentModal: React.FC<ConnectAgentModalProps> = ({
  isOpen,
  onClose,
  model,
  onConnect,
}) => {
  const [loginMethod, setLoginMethod] = useState<'sso' | 'apikey'>('sso');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (model) {
      if (model.id === 'gemini') {
        setSelectedTier('Gemini 3.8 Flash');
        setEmail('samantaakash755@gmail.com');
      } else if (model.id === 'claude') {
        setSelectedTier('Claude 3.5 Sonnet');
        setEmail('alex.das@anthropic.user');
      } else {
        setSelectedTier('GPT-4o (Omni)');
        setEmail('alex.das@openai.user');
      }
    }
  }, [model]);

  if (!isOpen || !model) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await onConnect(model.id, {
        accountEmail: email.trim() || undefined,
        apiKey: apiKey.trim() || undefined,
        modelTier: selectedTier,
        loginMethod,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate and connect agent.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTierOptions = () => {
    if (model.id === 'gemini') {
      return ['Gemini 3.8 Flash', 'Gemini 3.1 Pro', 'Gemini 3.1 Flash Lite'];
    }
    if (model.id === 'claude') {
      return ['Claude 3.5 Sonnet', 'Claude 3.7 Sonnet', 'Claude 3.5 Haiku'];
    }
    return ['GPT-4o (Omni)', 'o1 Reasoning', 'GPT-4o mini'];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-[#101722] border border-white/10 shadow-2xl p-6 md:p-7">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          {model.iconType === 'chatgpt' ? (
            <ChatGPTLogo className="w-11 h-11" />
          ) : model.iconType === 'claude' ? (
            <ClaudeLogo className="w-11 h-11" />
          ) : (
            <GeminiLogo className="w-11 h-11" />
          )}
          <div>
            <h3 className="text-lg font-bold text-[#F5F7FB]">
              Connect & Log In to {model.name}
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Authorize LifeRPG to activate {model.name} in AI Coach
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Model Tier Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
              Preferred Model Version
            </label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-[#141D2A] border border-white/10 text-xs text-[#F5F7FB] focus:outline-none focus:border-[#6366F1]"
            >
              {getTierOptions().map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
          </div>

          {/* Auth Method Tabs */}
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
              Authentication Method
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#0B1019] border border-white/6 text-xs">
              <button
                type="button"
                onClick={() => setLoginMethod('sso')}
                className={`py-1.5 rounded-lg font-medium transition-colors ${
                  loginMethod === 'sso'
                    ? 'bg-[#6366F1] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {model.id === 'gemini' ? 'Google Account' : 'Account Sign-In'}
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('apikey')}
                className={`py-1.5 rounded-lg font-medium transition-colors ${
                  loginMethod === 'apikey'
                    ? 'bg-[#6366F1] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                API Key / Token
              </button>
            </div>
          </div>

          {loginMethod === 'sso' ? (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`your-name@${model.id === 'gemini' ? 'gmail.com' : model.id === 'claude' ? 'anthropic.com' : 'openai.com'}`}
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#141D2A] border border-white/10 text-xs text-[#F5F7FB] placeholder:text-[#64748B] focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                  Password or Passkey <span className="text-[#64748B] font-normal">(Optional for OAuth)</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#141D2A] border border-white/10 text-xs text-[#F5F7FB] placeholder:text-[#64748B] focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-medium text-[#94A3B8]">
                Personal API Key
              </label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    model.id === 'gemini'
                      ? 'AIzaSy...'
                      : model.id === 'claude'
                      ? 'sk-ant-api03-...'
                      : 'sk-proj-...'
                  }
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#141D2A] border border-white/10 text-xs text-[#F5F7FB] placeholder:text-[#64748B] focus:outline-none focus:border-[#6366F1]"
                />
              </div>
              <p className="text-[11px] text-[#64748B]">
                Keys are stored securely in-memory server session and never logged to clients.
              </p>
            </div>
          )}

          {/* Security note */}
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-2 text-[11px] text-[#94A3B8]">
            <ShieldCheck className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
            <span>
              LifeRPG isolates your tokens with OAuth 2.0 PKCE and memory caching. Your credentials are never shared.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-[#6366F1] hover:bg-[#5558E6] text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Authorizing...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Log In & Connect</span>
                </>
              )}
            </button>
          </div>
        </form>
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
            <span className="text-[#22C55E] font-medium">Active & Synchronized</span>
          </div>
          {isModel && target.model.modelTier && (
            <div className="flex justify-between">
              <span>Model Tier</span>
              <span className="text-[#F5F7FB] font-medium">{target.model.modelTier}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Authentication</span>
            <span className="text-[#F5F7FB] font-medium">OAuth 2.0 PKCE</span>
          </div>
          <div className="flex justify-between">
            <span>Account</span>
            <span className="text-[#F5F7FB] font-medium">
              {isModel ? (target.model.accountEmail || 'Authenticated User') : target.state.account}
            </span>
          </div>
          {isModel && target.model.connectedAt && (
            <div className="flex justify-between">
              <span>Connected Since</span>
              <span className="text-[#94A3B8] text-xs">
                {new Date(target.model.connectedAt).toLocaleDateString()}
              </span>
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
            Done
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
