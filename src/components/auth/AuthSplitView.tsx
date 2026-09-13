import React, { useState } from 'react';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Check, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { MountainArt } from './MountainArt';
import { AuthUser } from '../../types';
import { api } from '../../services/api';

interface AuthSplitViewProps {
  initialTab?: 'login' | 'signup';
  onSuccess: (user: AuthUser, token: string) => void;
  onForgotPassword: () => void;
  onContinueAsGuest: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const AuthSplitView: React.FC<AuthSplitViewProps> = ({
  initialTab = 'login',
  onSuccess,
  onForgotPassword,
  onContinueAsGuest,
  onClose,
  isModal = false,
}) => {
  const [tab, setTab] = useState<'login' | 'signup'>(initialTab);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('iitangaming18@gmail.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign up form state
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!loginIdentifier.trim()) {
      setError('Please enter your email or username.');
      return;
    }
    if (!loginPassword) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.login({
        identifier: loginIdentifier.trim(),
        password: loginPassword,
        rememberMe,
      });
      onSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!signupFullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!signupUsername.trim() || signupUsername.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!signupPassword || signupPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the Terms of Service to continue.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.register({
        fullName: signupFullName.trim(),
        email: signupEmail.trim(),
        username: signupUsername.trim(),
        password: signupPassword,
        termsAccepted: true,
      });
      onSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'discord' | 'apple' | 'github') => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.socialLogin({
        provider,
        email: provider === 'google' ? 'iitangaming18@gmail.com' : undefined,
        fullName: provider === 'google' ? 'Alex Das' : undefined,
      });
      if (data?.user && data?.token) {
        onSuccess(data.user, data.token);
      }
    } catch (err: any) {
      setError(err.message || `Social login with ${provider} failed.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full ${isModal ? 'max-w-4xl' : 'max-w-5xl'} bg-[#101726] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row relative selection:bg-[#6366F1]/30`}>
      {/* Close button if presented as a modal */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Left Column: Scenic Mountain Artwork & Brand Pillars */}
      <div className="md:w-5/12 relative min-h-[280px] md:min-h-[580px] flex flex-col justify-between p-6 sm:p-8 overflow-hidden bg-[#0C1020]">
        <MountainArt className="absolute inset-0 w-full h-full" variant="split" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C1020]/80 via-transparent to-[#0C1020]/90 pointer-events-none" />

        {/* Top Brand Badge */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-white">LifeRPG</span>
        </div>

        {/* Middle Value Proposition & Bullet Points */}
        <div className="relative z-10 my-auto py-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            Build better habits.{' '}
            <span className="text-[#A78BFA] block">Create a stronger you.</span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            Track your goals, stay consistent, and grow with AI-powered guidance.
          </p>

          <div className="mt-6 space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#F1F5F9]">
              <div className="w-4 h-4 rounded-full bg-[#22C55E]/20 text-[#4ADE80] flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>Track your habits</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#F1F5F9]">
              <div className="w-4 h-4 rounded-full bg-[#22C55E]/20 text-[#4ADE80] flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>Set and achieve goals</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#F1F5F9]">
              <div className="w-4 h-4 rounded-full bg-[#22C55E]/20 text-[#4ADE80] flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>Get AI coaching</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#F1F5F9]">
              <div className="w-4 h-4 rounded-full bg-[#22C55E]/20 text-[#4ADE80] flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>Connect with friends</span>
            </div>
          </div>
        </div>

        {/* Bottom Small Tagline */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#94A3B8]">
          <span>© LifeRPG Platform</span>
          <span>Gamified Self Growth</span>
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="md:w-7/12 p-6 sm:p-10 flex flex-col justify-between bg-[#12192B]">
        <div>
          {/* Top Segmented Tabs: Login | Sign Up */}
          <div className="flex bg-[#0A0F1D] p-1 rounded-xl border border-white/10 max-w-xs mx-auto mb-6">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-[#1E293B] text-white shadow-xs'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                tab === 'signup'
                  ? 'bg-[#1E293B] text-white shadow-xs'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {tab === 'login' ? 'Welcome back' : 'Create your account'}
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
              {tab === 'login'
                ? 'Sign in to your account to continue'
                : 'Start your journey towards a better you.'}
            </p>
          </div>

          {/* Error Message Box */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs text-[#FCA5A5] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Notice Message Box */}
          {notice && (
            <div className="mb-5 p-3 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-xs text-[#86EFAC] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
              <span>{notice}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="you@example.com or username"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#0A0F1D] border border-white/10 text-xs sm:text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#0A0F1D] border border-white/10 text-xs sm:text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8]"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[#94A3B8] hover:text-[#CBD5E1]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-[#0A0F1D] border-white/20 text-[#6366F1] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-[#818CF8] hover:text-[#A78BFA] transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 rounded-xl bg-[#6366F1] hover:bg-[#5254E2] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md shadow-[#6366F1]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    placeholder="Alex Das"
                    className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-[#0A0F1D] border border-white/10 text-xs sm:text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="alex@gmail.com"
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#0A0F1D] border border-white/10 text-xs sm:text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <span className="text-[#64748B] text-xs absolute left-3.5 top-1/2 -translate-y-1/2 font-medium">@</span>
                    <input
                      type="text"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      placeholder="alex"
                      className="w-full h-10 pl-8 pr-3 rounded-xl bg-[#0A0F1D] border border-white/10 text-xs sm:text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full h-10 pl-10 pr-10 rounded-xl bg-[#0A0F1D] border border-white/10 text-xs sm:text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8]"
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#94A3B8]">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 rounded bg-[#0A0F1D] border-white/20 text-[#6366F1] focus:ring-0 cursor-pointer"
                  />
                  <span>
                    I agree to the <span className="text-[#818CF8] hover:underline">Terms of Service</span> and{' '}
                    <span className="text-[#818CF8] hover:underline">Privacy Policy</span>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 rounded-xl bg-[#6366F1] hover:bg-[#5254E2] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md shadow-[#6366F1]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Social Sign-in Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative px-3 bg-[#12192B] text-[11px] uppercase tracking-wider text-[#64748B]">
              or continue with
            </span>
          </div>

          {/* Social Buttons Grid */}
          <div className="grid grid-cols-4 gap-2.5">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="h-10 rounded-xl bg-[#0A0F1D] hover:bg-[#162035] border border-white/10 flex items-center justify-center text-white transition-colors"
              title="Continue with Google"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.8 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-4.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.3-6.7-5.3L1.6 16c1.9 3.8 5.8 7 10.4 7z"
                />
              </svg>
            </button>

            {/* Discord */}
            <button
              type="button"
              onClick={() => handleSocialLogin('discord')}
              className="h-10 rounded-xl bg-[#0A0F1D] hover:bg-[#162035] border border-white/10 flex items-center justify-center text-[#5865F2] hover:text-white transition-colors"
              title="Continue with Discord"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleSocialLogin('apple')}
              className="h-10 rounded-xl bg-[#0A0F1D] hover:bg-[#162035] border border-white/10 flex items-center justify-center text-white transition-colors"
              title="Continue with Apple"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.06-1.81.94-2.87-.91.04-2.02.61-2.67 1.37-.58.67-.99 1.74-.86 2.78.02 0 .04 0 .07 0 .95 0 1.94-.58 2.52-1.28z" />
              </svg>
            </button>

            {/* GitHub */}
            <button
              type="button"
              onClick={() => handleSocialLogin('github')}
              className="h-10 rounded-xl bg-[#0A0F1D] hover:bg-[#162035] border border-white/10 flex items-center justify-center text-white transition-colors"
              title="Continue with GitHub"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Guest Alternative Link at Bottom */}
        <div className="mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
          <div>
            {tab === 'login' ? (
              <span>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className="text-[#818CF8] hover:underline font-semibold"
                >
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-[#818CF8] hover:underline font-semibold"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onContinueAsGuest}
            className="text-[#94A3B8] hover:text-white transition-colors underline underline-offset-4"
          >
            Explore as Guest →
          </button>
        </div>
      </div>
    </div>
  );
};
