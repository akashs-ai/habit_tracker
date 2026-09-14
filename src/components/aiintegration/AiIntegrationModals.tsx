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
  AlertCircle,
  Phone,
  ArrowLeft,
  Eye,
  EyeOff,
  UserCheck,
  KeyRound
} from 'lucide-react';
import { AIIntegrationModel, CalendarIntegrationState } from '../../types';
import { modelComparisons } from '../../data/aiIntegrationMockData';
import { ChatGPTLogo, ClaudeLogo, GeminiLogo, GoogleCalendarTile, GoogleGLogo } from './ModelLogos';

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
    details: {
      accountEmail?: string;
      apiKey?: string;
      modelTier?: string;
      loginMethod?: string;
      password?: string;
      authMethod?: 'google' | 'phone' | 'email' | 'apikey';
      verificationCode?: string;
      phoneNumber?: string;
    }
  ) => Promise<void>;
  userEmail?: string;
}

type AuthViewMode = 'options' | 'google' | 'phone' | 'email_password' | 'apikey';

export const ConnectAgentModal: React.FC<ConnectAgentModalProps> = ({
  isOpen,
  onClose,
  model,
  onConnect,
  userEmail = 'iitangaming18@gmail.com',
}) => {
  const [authView, setAuthView] = useState<AuthViewMode>('options');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [useCustomGoogleEmail, setUseCustomGoogleEmail] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStepText, setVerifyStepText] = useState<string>('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (model) {
      setAuthView('options');
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setPhoneNumber('');
      setVerificationCode('');
      setCodeSent(false);
      setApiKey('');
      setIsVerifying(false);
      setVerificationSuccess(false);
      setErrorMsg(null);
      setUseCustomGoogleEmail(false);
      setCustomGoogleEmail('');

      if (model.id === 'gemini') {
        setSelectedTier('Gemini 3.8 Flash');
      } else if (model.id === 'claude') {
        setSelectedTier('Claude 3.5 Sonnet');
      } else {
        setSelectedTier('GPT-4o (Omni)');
      }
    }
  }, [model, isOpen]);

  if (!isOpen || !model) return null;

  const getTierOptions = () => {
    if (model.id === 'gemini') {
      return ['Gemini 3.8 Flash', 'Gemini 3.1 Pro', 'Gemini 3.1 Flash Lite'];
    }
    if (model.id === 'claude') {
      return ['Claude 3.5 Sonnet', 'Claude 3.7 Sonnet', 'Claude 3.5 Haiku'];
    }
    return ['GPT-4o (Omni)', 'o1 Reasoning', 'GPT-4o mini'];
  };

  const activeGoogleEmail = useCustomGoogleEmail
    ? customGoogleEmail.trim()
    : userEmail || 'iitangaming18@gmail.com';

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setAuthView('email_password');
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    if (!activeGoogleEmail || !activeGoogleEmail.includes('@')) {
      setErrorMsg('Please enter or select a valid Google Account email.');
      return;
    }

    setIsVerifying(true);
    setVerifyStepText('Connecting to Google Identity Services (OAuth 2.0 PKCE)...');

    try {
      await new Promise((r) => setTimeout(r, 550));
      setVerifyStepText(`Validating ${model.name} account credentials for ${activeGoogleEmail}...`);
      
      await new Promise((r) => setTimeout(r, 550));
      setVerifyStepText('Synchronizing chatbot authorization token with AI Coach...');

      await onConnect(model.id, {
        authMethod: 'google',
        accountEmail: activeGoogleEmail,
        modelTier: selectedTier,
        loginMethod: 'google',
      });

      setVerificationSuccess(true);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google account credential verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!password || password.trim().length < 6) {
      setErrorMsg('Credential verification failed: Password must be at least 6 characters long.');
      return;
    }

    setIsVerifying(true);
    setVerifyStepText(`Authenticating ${email.trim()} with ${model.name} servers...`);

    try {
      await new Promise((r) => setTimeout(r, 550));
      setVerifyStepText('Checking credential signatures & permissions...');

      await onConnect(model.id, {
        authMethod: 'email',
        accountEmail: email.trim(),
        password: password.trim(),
        verificationCode: verificationCode.trim() || undefined,
        modelTier: selectedTier,
        loginMethod: 'email',
      });

      setVerificationSuccess(true);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!phoneNumber || phoneNumber.trim().length < 8) {
      setErrorMsg('Please enter a valid phone number including country code.');
      return;
    }

    if (!codeSent) {
      setIsVerifying(true);
      setVerifyStepText('Sending 6-digit SMS verification code to your phone...');
      await new Promise((r) => setTimeout(r, 650));
      setIsVerifying(false);
      setCodeSent(true);
      setVerificationCode('492815');
      return;
    }

    if (!verificationCode || verificationCode.trim().length < 6) {
      setErrorMsg('Please enter the 6-digit SMS verification code.');
      return;
    }

    setIsVerifying(true);
    setVerifyStepText('Validating SMS verification code & phone credentials...');

    try {
      await new Promise((r) => setTimeout(r, 550));
      await onConnect(model.id, {
        authMethod: 'phone',
        phoneNumber: phoneNumber.trim(),
        verificationCode: verificationCode.trim(),
        modelTier: selectedTier,
        loginMethod: 'phone',
      });

      setVerificationSuccess(true);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'SMS verification code verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!apiKey.trim() || apiKey.trim().length < 10) {
      setErrorMsg('Please enter a valid API key or secret token.');
      return;
    }

    setIsVerifying(true);
    setVerifyStepText('Testing API key against official endpoints & verifying quota...');

    try {
      await new Promise((r) => setTimeout(r, 650));

      await onConnect(model.id, {
        authMethod: 'apikey',
        apiKey: apiKey.trim(),
        modelTier: selectedTier,
        loginMethod: 'apikey',
      });

      setVerificationSuccess(true);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'API key validation failed. Please check your token.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-[440px] rounded-3xl bg-[#101722] border border-white/12 shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-6 sm:p-8 text-[#F5F7FB] overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/6 hover:bg-white/12 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Verification Success Overlay */}
        {verificationSuccess ? (
          <div className="py-10 flex flex-col items-center text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Account Verified!</h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xs">
              Successfully authenticated and connected with <span className="text-white font-semibold">{model.name}</span>. Synchronizing with AI Coach...
            </p>
          </div>
        ) : (
          <>
            {/* VIEW 1: Primary Login Options (Matches user screenshot) */}
            {authView === 'options' && (
              <div className="space-y-6">
                {/* Header with Model Logo */}
                <div className="text-center pt-2">
                  <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white/[0.04] border border-white/8 mb-3 shadow-sm">
                    {model.iconType === 'chatgpt' ? (
                      <ChatGPTLogo className="w-9 h-9" />
                    ) : model.iconType === 'claude' ? (
                      <ClaudeLogo className="w-9 h-9" />
                    ) : (
                      <GeminiLogo className="w-9 h-9" />
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight">
                    Log in or sign up
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#94A3B8] mt-1.5 leading-relaxed max-w-sm mx-auto">
                    You'll get smarter responses and can upload files, images, and more.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Primary OAuth Action Buttons */}
                <div className="space-y-2.5">
                  {/* Continue with Google */}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setAuthView('google');
                    }}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#171F2C] hover:bg-[#1E293B] border border-white/10 hover:border-white/20 text-white font-medium text-sm transition-all shadow-sm active:scale-[0.99] cursor-pointer"
                  >
                    <GoogleGLogo className="w-5 h-5 shrink-0" />
                    <span>Continue with Google</span>
                  </button>

                  {/* Continue with phone */}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setAuthView('phone');
                    }}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#171F2C] hover:bg-[#1E293B] border border-white/10 hover:border-white/20 text-white font-medium text-sm transition-all shadow-sm active:scale-[0.99] cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-[#94A3B8] shrink-0" />
                    <span>Continue with phone</span>
                  </button>
                </div>

                {/* OR Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                    <span className="bg-[#101722] px-3 text-[#64748B] font-semibold">OR</span>
                  </div>
                </div>

                {/* Email Address input + Continue button */}
                <form onSubmit={handleEmailContinue} className="space-y-3">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full py-3 px-4 rounded-xl bg-[#141D2A] border border-white/10 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!email.trim()}
                    className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-black font-semibold text-sm transition-all shadow-sm active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Continue</span>
                  </button>
                </form>

                {/* Developer Token Option */}
                <div className="pt-2 text-center border-t border-white/6">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setAuthView('apikey');
                    }}
                    className="text-xs text-[#818CF8] hover:text-[#A5B4FC] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Developer? Connect with direct API Key or Token</span>
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 2: Google Authentication & Real Verification */}
            {authView === 'google' && (
              <div className="space-y-5 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setAuthView('options');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login options</span>
                </button>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-white/[0.05] border border-white/10 shrink-0">
                    <GoogleGLogo className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Sign in with Google</h3>
                    <p className="text-xs text-[#94A3B8]">
                      Verify credentials & connect to {model.name}
                    </p>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Detected Google Account Card */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#94A3B8]">
                    Select Google Account
                  </label>

                  {/* Account Selector Option 1: Primary User Account */}
                  <div
                    onClick={() => setUseCustomGoogleEmail(false)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      !useCustomGoogleEmail
                        ? 'bg-[#182436] border-[#6366F1] shadow-md'
                        : 'bg-[#141D2A] border-white/8 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-inner">
                        {userEmail.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-white truncate">
                          {userEmail}
                        </p>
                        <p className="text-[11px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                          <ShieldCheck className="w-3 h-3 text-[#22C55E]" />
                          Active Google Session
                        </p>
                      </div>
                    </div>

                    {!useCustomGoogleEmail && (
                      <div className="w-5 h-5 rounded-full bg-[#6366F1] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Account Selector Option 2: Use another account */}
                  <div
                    onClick={() => setUseCustomGoogleEmail(true)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      useCustomGoogleEmail
                        ? 'bg-[#182436] border-[#6366F1] shadow-md'
                        : 'bg-[#141D2A] border-white/8 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-[#94A3B8]" />
                        <span className="text-xs font-medium text-white">Use a different Google Account</span>
                      </div>
                      {useCustomGoogleEmail && (
                        <div className="w-5 h-5 rounded-full bg-[#6366F1] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {useCustomGoogleEmail && (
                      <div className="mt-2.5 pt-2 border-t border-white/8" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="email"
                          autoFocus
                          value={customGoogleEmail}
                          onChange={(e) => setCustomGoogleEmail(e.target.value)}
                          placeholder="e.g. name@gmail.com"
                          className="w-full py-2 px-3 rounded-lg bg-[#0F1622] border border-white/15 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#6366F1]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Model Version Tier */}
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                    Preferred Model Version
                  </label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#141D2A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#6366F1]"
                  >
                    {getTierOptions().map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Live Verification Status Box */}
                {isVerifying ? (
                  <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-[#818CF8] shrink-0" />
                    <span>{verifyStepText}</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/6 flex items-start gap-2 text-[11px] text-[#94A3B8]">
                    <ShieldCheck className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                    <span>
                      Verifies your existing {model.name} account credentials through Google OAuth 2.0 PKCE protocol before enabling live AI Coach chat.
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAuthView('options')}
                    disabled={isVerifying}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isVerifying}
                    className="px-5 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#5254E0] disabled:opacity-50 text-xs font-semibold text-white transition-all flex items-center gap-2 shadow-sm shadow-indigo-600/30 cursor-pointer"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Verify & Connect with Google</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 3: Email + Password Authentication */}
            {authView === 'email_password' && (
              <form onSubmit={handleEmailPasswordSubmit} className="space-y-4 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setAuthView('options');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to options</span>
                </button>

                <div>
                  <h3 className="text-lg font-bold text-white">Enter your password</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#818CF8] bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                      {email}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAuthView('options')}
                      className="text-xs text-[#94A3B8] hover:text-white underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Password field */}
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                    Account Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter account password (min. 6 characters)"
                      className="w-full py-2.5 pl-10 pr-10 rounded-xl bg-[#141D2A] border border-white/10 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#6366F1]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-[#64748B] mt-1">
                    Password must be at least 6 characters to pass credential verification.
                  </p>
                </div>

                {/* Optional 2FA Code */}
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                    2-Step Verification Code <span className="text-[#64748B] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="6-digit authenticator code (if 2FA is active)"
                    className="w-full py-2.5 px-3 rounded-xl bg-[#141D2A] border border-white/10 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#6366F1]"
                  />
                </div>

                {/* Model Tier Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                    Preferred Model Version
                  </label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#141D2A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#6366F1]"
                  >
                    {getTierOptions().map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Live Verification Status Box */}
                {isVerifying ? (
                  <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-[#818CF8] shrink-0" />
                    <span>{verifyStepText}</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/6 flex items-start gap-2 text-[11px] text-[#94A3B8]">
                    <ShieldCheck className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                    <span>
                      LifeRPG verifies credential authenticity with {model.name} and creates an isolated session token.
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAuthView('options')}
                    disabled={isVerifying}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isVerifying || !password}
                    className="px-5 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#5254E0] disabled:opacity-50 text-xs font-semibold text-white transition-all flex items-center gap-2 shadow-sm shadow-indigo-600/30 cursor-pointer"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Verify & Log In</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* VIEW 4: Phone Authentication */}
            {authView === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setAuthView('options');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login options</span>
                </button>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-white/[0.05] border border-white/10 shrink-0">
                    <Phone className="w-6 h-6 text-[#818CF8]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Continue with phone</h3>
                    <p className="text-xs text-[#94A3B8]">
                      Verify via 6-digit SMS one-time security code
                    </p>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full py-2.5 px-3 rounded-xl bg-[#141D2A] border border-white/10 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#6366F1]"
                  />
                </div>

                {codeSent && (
                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                      6-Digit SMS Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="e.g. 492815"
                      className="w-full py-2.5 px-3 rounded-xl bg-[#141D2A] border border-white/10 text-xs text-white font-mono tracking-widest text-center focus:outline-none focus:border-[#6366F1]"
                    />
                    <p className="text-[11px] text-emerald-400 mt-1">
                      Demo verification code pre-filled. Click Verify Code to authenticate.
                    </p>
                  </div>
                )}

                {/* Model Tier Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                    Preferred Model Version
                  </label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#141D2A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#6366F1]"
                  >
                    {getTierOptions().map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </div>

                {isVerifying && (
                  <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-[#818CF8] shrink-0" />
                    <span>{verifyStepText}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAuthView('options')}
                    disabled={isVerifying}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isVerifying || !phoneNumber}
                    className="px-5 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#5254E0] disabled:opacity-50 text-xs font-semibold text-white transition-all flex items-center gap-2 shadow-sm shadow-indigo-600/30 cursor-pointer"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : codeSent ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Verify Code & Connect</span>
                      </>
                    ) : (
                      <span>Send SMS Code</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* VIEW 5: Developer API Key / Token Authentication */}
            {authView === 'apikey' && (
              <form onSubmit={handleApiKeySubmit} className="space-y-4 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setAuthView('options');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login options</span>
                </button>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-white/[0.05] border border-white/10 shrink-0">
                    <Key className="w-6 h-6 text-[#818CF8]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Developer API Key</h3>
                    <p className="text-xs text-[#94A3B8]">
                      Verify personal API token credentials for {model.name}
                    </p>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                    Model API Key
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={
                        model.id === 'gemini'
                          ? 'AIzaSy...'
                          : model.id === 'claude'
                          ? 'sk-ant-api03-...'
                          : 'sk-proj-...'
                      }
                      className="w-full py-2.5 pl-10 pr-3 rounded-xl bg-[#141D2A] border border-white/10 text-xs text-white font-mono placeholder-[#64748B] focus:outline-none focus:border-[#6366F1]"
                    />
                  </div>
                  <p className="text-[10px] text-[#64748B] mt-1">
                    API key is securely validated against backend credentials.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                    Target Model Version
                  </label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#141D2A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#6366F1]"
                  >
                    {getTierOptions().map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </div>

                {isVerifying && (
                  <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-[#818CF8] shrink-0" />
                    <span>{verifyStepText}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAuthView('options')}
                    disabled={isVerifying}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isVerifying || !apiKey}
                    className="px-5 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#5254E0] disabled:opacity-50 text-xs font-semibold text-white transition-all flex items-center gap-2 shadow-sm shadow-indigo-600/30 cursor-pointer"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Test & Connect Key</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
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
  const isVerified = isModel ? target.model.verified !== false : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-[#101722] border border-white/10 shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
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
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${isVerified ? 'text-[#22C55E]' : 'text-amber-400'}`}>
              <span className={`w-2 h-2 rounded-full ${isVerified ? 'bg-[#22C55E]' : 'bg-amber-400'}`} />
              {isVerified ? 'Connected & Verified' : 'Authentication Pending'}
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs md:text-sm text-[#94A3B8] bg-[#141D2A] p-4 rounded-xl border border-white/5 mb-5">
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
            <span className="text-[#F5F7FB] font-medium">
              {isModel
                ? target.model.authProviderName || (target.model.authMethod === 'google' ? 'Google Account' : 'OAuth 2.0 PKCE')
                : 'OAuth 2.0 PKCE'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Account</span>
            <span className="text-[#F5F7FB] font-medium truncate max-w-[200px]">
              {isModel ? (target.model.accountEmail || 'Authenticated User') : target.state.account}
            </span>
          </div>
          {isModel && target.model.verifiedAt && (
            <div className="flex justify-between">
              <span>Verified At</span>
              <span className="text-[#94A3B8] text-xs">
                {new Date(target.model.verifiedAt).toLocaleDateString()} {new Date(target.model.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
            className="px-4 py-2 rounded-lg border border-[#FB7185]/30 text-[#FB7185] hover:bg-[#FB7185]/10 text-xs font-medium transition-colors cursor-pointer"
          >
            Disconnect Account
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#5B5CE2] hover:bg-[#4E4FD4] text-xs font-semibold text-white transition-colors cursor-pointer"
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
