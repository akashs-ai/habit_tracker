import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Mail, 
  Lock, 
  KeyRound, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  PartyPopper,
  Compass,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { AuthSplitView } from './AuthSplitView';
import { AuthUser, AuthScreenType } from '../../types';
import { api } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialScreen?: AuthScreenType;
  onAuthSuccess: (user: AuthUser, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialScreen = 'login',
  onAuthSuccess,
}) => {
  const [screen, setScreen] = useState<AuthScreenType>(initialScreen);

  // Email / Reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [tempResetToken, setTempResetToken] = useState<string>('');

  // New password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verification state
  const [verifyEmailAddress, setVerifyEmailAddress] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  // Common UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [recentlyCreatedUser, setRecentlyCreatedUser] = useState<AuthUser | null>(null);

  const getEmailProviderLink = (email: string) => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return null;
    if (domain.includes('gmail')) return { name: 'Open Gmail', url: 'https://mail.google.com' };
    if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) return { name: 'Open Outlook', url: 'https://outlook.live.com' };
    if (domain.includes('yahoo')) return { name: 'Open Yahoo Mail', url: 'https://mail.yahoo.com' };
    if (domain.includes('icloud')) return { name: 'Open iCloud Mail', url: 'https://www.icloud.com/mail' };
    return null;
  };

  useEffect(() => {
    setScreen(initialScreen);
    setError(null);
    setSuccessNotice(null);
    if (!isOpen) {
      setResetEmail('');
      setVerifyEmailAddress('');
      setNewPassword('');
      setConfirmPassword('');
      setTempResetToken('');
      setResetSent(false);
    }
  }, [initialScreen, isOpen]);

  // Resend timer tick
  useEffect(() => {
    let timer: any;
    if (screen === 'verify_email' && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [screen, resendCountdown]);

  if (!isOpen) return null;

  // Password validation checks for Reset Password
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumberOrSpecial = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Handle Continue as Guest
  const handleContinueAsGuest = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.continueAsGuest();
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Could not start guest session.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Submit
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.forgotPassword(resetEmail.trim());
      setTempResetToken(data.resetToken || '');
      setResetSent(true);
      setSuccessNotice('Password reset link generated! You can now choose your new password.');
      // Automatically advance to reset password screen for demo convenience
      setTimeout(() => {
        setScreen('reset_password');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to process password reset.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!hasMinLength || !hasUpper || !hasLower || !hasNumberOrSpecial) {
      setError('Please ensure your password meets all required criteria.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword({
        email: resetEmail,
        token: tempResetToken,
        newPassword,
      });
      setSuccessNotice('Password updated successfully! Please sign in with your new password.');
      setTimeout(() => {
        setScreen('login');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email Verification Check
  const handleConfirmVerifyEmail = async () => {
    setLoading(true);
    setError(null);
    setSuccessNotice(null);
    try {
      const res = await api.verifyEmail({ email: verifyEmailAddress });
      if (res.emailVerified) {
        setSuccessNotice('Your email has been verified successfully! Preparing your account...');
        try {
          const me = await api.getMe();
          onAuthSuccess(me.user, me.token);
        } catch {
          if (recentlyCreatedUser) {
            onAuthSuccess({ ...recentlyCreatedUser, emailVerified: true }, 'verified');
          }
        }
        setTimeout(() => {
          setScreen('welcome_onboarding');
        }, 1200);
      } else {
        setError(res.message || 'We have not detected your verification yet. Please click the link in your email.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification check failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend Email with Supabase API and rate limit handling
  const handleResendEmail = async () => {
    if (resendCountdown > 0 || resendLoading) return;
    setError(null);
    setSuccessNotice(null);
    setResendLoading(true);
    try {
      const res = await api.resendVerificationEmail(verifyEmailAddress);
      setResendCountdown(60);
      setSuccessNotice(res.message || 'A new verification link has been sent to your email.');
    } catch (e: any) {
      const msg = e.message || 'Could not resend verification email.';
      setError(msg);
      if (msg.toLowerCase().includes('rate limit')) {
        setResendCountdown(60);
      } else {
        setResendCountdown(10);
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#050811]/80 backdrop-blur-md overflow-y-auto">
      {/* 1. Split View for Login / Sign Up */}
      {(screen === 'login' || screen === 'signup') && (
        <AuthSplitView
          key={screen}
          isModal={true}
          initialTab={screen === 'signup' ? 'signup' : 'login'}
          onSuccess={(user, token) => {
            // Strict Gatekeeping: Unverified accounts MUST NOT access the dashboard
            if (!user.emailVerified && !user.isGuest) {
              setRecentlyCreatedUser(user);
              setVerifyEmailAddress(user.email);
              setResendCountdown(60);
              setError(null);
              setSuccessNotice(null);
              setScreen('verify_email');
              return;
            }

            // Only verified or guest users proceed
            setRecentlyCreatedUser(user);
            onAuthSuccess(user, token);
            setScreen('welcome_onboarding');
          }}
          onForgotPassword={() => setScreen('forgot_password')}
          onContinueAsGuest={() => setScreen('guest_prompt')}
          onClose={onClose}
        />
      )}

      {/* 2. Continue As Guest Modal (Screen 04) */}
      {screen === 'guest_prompt' && (
        <div className="relative w-full max-w-md bg-[#101726] rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 text-center text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* User Glow Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#201B4B] border border-[#6366F1]/30 flex items-center justify-center shadow-lg shadow-[#6366F1]/20 mb-5">
            <Compass className="w-8 h-8 text-[#818CF8]" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Continue as Guest</h3>
          <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            Explore LifeRPG and see how it works. You can always create an account later to keep your streaks and data.
          </p>

          {/* Perks list */}
          <div className="mt-6 p-4 rounded-2xl bg-[#0A0F1D] border border-white/5 space-y-2.5 text-left text-xs sm:text-sm text-[#CBD5E1]">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-[#22C55E]/20 text-[#4ADE80] flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>Try basic features & quests</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-[#22C55E]/20 text-[#4ADE80] flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>Explore the interactive dashboard</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-[#22C55E]/20 text-[#4ADE80] flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>Seamlessly migrate progress to full account anytime</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs text-[#FCA5A5] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleContinueAsGuest}
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#6366F1] hover:bg-[#5254E2] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md shadow-[#6366F1]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Launching guest session...</span>
                </>
              ) : (
                <>
                  <span>Continue as Guest</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setScreen('signup')}
              className="w-full h-11 rounded-xl bg-[#141D2E] hover:bg-[#1A253A] border border-white/10 text-white text-xs sm:text-sm font-medium transition-all"
            >
              Create Free Account
            </button>
          </div>

          <div className="mt-5 text-xs text-[#94A3B8]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setScreen('login')}
              className="text-[#818CF8] hover:underline font-semibold"
            >
              Sign in
            </button>
          </div>
        </div>
      )}

      {/* 3. Forgot Password Modal (Screen 05) */}
      {screen === 'forgot_password' && (
        <div className="relative w-full max-w-md bg-[#101726] rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 text-center text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Key / Lock Aura */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#201B4B] border border-[#6366F1]/30 flex items-center justify-center shadow-lg shadow-[#6366F1]/20 mb-5">
            <KeyRound className="w-8 h-8 text-[#818CF8]" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Forgot your password?</h3>
          <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs text-[#FCA5A5] flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successNotice && (
            <div className="mt-4 p-3 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-xs text-[#86EFAC] flex items-center gap-2 text-left">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          <form onSubmit={handleForgotPasswordSubmit} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="off"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#0A0F1D] border border-white/10 text-xs sm:text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#6366F1] hover:bg-[#5254E2] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md shadow-[#6366F1]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending reset link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setScreen('login')}
              className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to login</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Reset Password Modal (Screen 06) */}
      {screen === 'reset_password' && (
        <div className="relative w-full max-w-md bg-[#101726] rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 text-center text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#201B4B] border border-[#6366F1]/30 flex items-center justify-center shadow-lg shadow-[#6366F1]/20 mb-5">
            <Lock className="w-8 h-8 text-[#818CF8]" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Reset your password</h3>
          <p className="mt-2 text-xs sm:text-sm text-[#94A3B8]">
            Enter a new password for your account.
          </p>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs text-[#FCA5A5] flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successNotice && (
            <div className="mt-4 p-3 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-xs text-[#86EFAC] flex items-center gap-2 text-left">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          <form onSubmit={handleResetPasswordSubmit} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#0A0F1D] border border-white/10 text-xs sm:text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8]"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#0A0F1D] border border-white/10 text-xs sm:text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8]"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Live Criteria Checklist */}
            <div className="p-3.5 rounded-xl bg-[#0A0F1D] border border-white/5 space-y-2 text-[11px] text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                    hasMinLength ? 'bg-[#22C55E]/20 text-[#4ADE80]' : 'bg-white/10 text-[#64748B]'
                  }`}
                >
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span className={hasMinLength ? 'text-[#F1F5F9]' : ''}>At least 8 characters</span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                    hasUpper ? 'bg-[#22C55E]/20 text-[#4ADE80]' : 'bg-white/10 text-[#64748B]'
                  }`}
                >
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span className={hasUpper ? 'text-[#F1F5F9]' : ''}>One uppercase letter</span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                    hasLower ? 'bg-[#22C55E]/20 text-[#4ADE80]' : 'bg-white/10 text-[#64748B]'
                  }`}
                >
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span className={hasLower ? 'text-[#F1F5F9]' : ''}>One lowercase letter</span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                    hasNumberOrSpecial ? 'bg-[#22C55E]/20 text-[#4ADE80]' : 'bg-white/10 text-[#64748B]'
                  }`}
                >
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span className={hasNumberOrSpecial ? 'text-[#F1F5F9]' : ''}>
                  One number or special character
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#6366F1] hover:bg-[#5254E2] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md shadow-[#6366F1]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setScreen('login')}
              className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to login</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Check Your Email / Verification Modal (Screen 07) */}
      {screen === 'verify_email' && (
        <div className="relative w-full max-w-md bg-[#101726] rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 text-center text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Mail Envelope Aura */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#201B4B] border border-[#6366F1]/30 flex items-center justify-center shadow-lg shadow-[#6366F1]/20 mb-5">
            <Mail className="w-8 h-8 text-[#818CF8]" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Check your email</h3>
          <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            We sent a verification link to
          </p>
          <div className="mt-1.5 inline-block px-3.5 py-1 rounded-full bg-[#0A0F1D] border border-white/10 text-xs sm:text-sm text-white font-medium max-w-full truncate">
            {verifyEmailAddress}
          </div>

          <p className="mt-3 text-xs text-[#94A3B8] leading-relaxed">
            Click the link in the message to activate your account and start your LifeRPG adventure.
          </p>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs text-[#FCA5A5] flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successNotice && (
            <div className="mt-4 p-3 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-xs text-[#86EFAC] flex items-center gap-2 text-left">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {/* Direct Webmail Link if known provider */}
            {(() => {
              const provider = getEmailProviderLink(verifyEmailAddress);
              if (!provider) return null;
              return (
                <a
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 rounded-xl bg-[#6366F1] hover:bg-[#5254E2] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md shadow-[#6366F1]/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>{provider.name}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              );
            })()}

            {/* Check status button */}
            <button
              type="button"
              onClick={handleConfirmVerifyEmail}
              disabled={loading}
              className={`w-full h-11 rounded-xl ${
                getEmailProviderLink(verifyEmailAddress)
                  ? 'bg-[#141D2E] hover:bg-[#1A253A] border border-white/10 text-white'
                  : 'bg-[#6366F1] hover:bg-[#5254E2] text-white shadow-md shadow-[#6366F1]/25'
              } active:scale-[0.99] text-xs sm:text-sm font-semibold tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking verification status...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 text-[#818CF8]" />
                  <span>I&apos;ve clicked the verification link</span>
                </>
              )}
            </button>

            {/* Resend button */}
            <button
              type="button"
              disabled={resendCountdown > 0 || resendLoading}
              onClick={handleResendEmail}
              className="w-full h-11 rounded-xl bg-[#0A0F1D] hover:bg-[#141D2E] border border-white/10 text-white text-xs sm:text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending email...</span>
                </>
              ) : resendCountdown > 0 ? (
                `Resend email (0:${resendCountdown < 10 ? '0' : ''}${resendCountdown})`
              ) : (
                'Resend verification email'
              )}
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#94A3B8]">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessNotice(null);
                setScreen('signup');
              }}
              className="hover:text-white transition-colors"
            >
              Change email
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessNotice(null);
                setScreen('login');
              }}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Sign In</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. Welcome / Onboarding Success Modal (Screen 02 Bottom) */}
      {screen === 'welcome_onboarding' && (
        <div className="relative w-full max-w-md bg-[#101726] rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 text-center text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Celebration Aura */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-xl shadow-[#6366F1]/30 mb-5">
            <PartyPopper className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">Welcome to LifeRPG!</h3>
          <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            Your journey to a better you starts now.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-[#0A0F1D] border border-white/5 text-left text-xs sm:text-sm text-[#CBD5E1] space-y-2">
            <p className="text-[#94A3B8]">Your profile is initialized with:</p>
            <div className="flex items-center gap-2 text-white font-medium">
              <Sparkles className="w-4 h-4 text-[#818CF8]" />
              <span>Level 1 Adventurer • 0 XP • 1,250 Momentum Points</span>
            </div>
            <div className="flex items-center gap-2 text-white font-medium">
              <Check className="w-4 h-4 text-[#22C55E]" />
              <span>Daily Quests & Habit System Loaded</span>
            </div>
          </div>

          <div className="mt-7">
            <button
              type="button"
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-[#6366F1] hover:bg-[#5254E2] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md shadow-[#6366F1]/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
