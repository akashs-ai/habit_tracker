import React from 'react';
import { 
  Sparkles, 
  Target, 
  Bot, 
  BarChart3, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Flame,
  ChevronRight,
  User,
  LogIn
} from 'lucide-react';
import { MountainArt } from './MountainArt';
import { Footer } from '../footer/Footer';

interface LandingWelcomePageProps {
  onOpenLogin: () => void;
  onOpenSignUp: () => void;
  onContinueAsGuest: () => void;
  onGoToDashboard?: () => void;
  isLoggedIn?: boolean;
}

export const LandingWelcomePage: React.FC<LandingWelcomePageProps> = ({
  onOpenLogin,
  onOpenSignUp,
  onContinueAsGuest,
  onGoToDashboard,
  isLoggedIn = false,
}) => {
  return (
    <div className="min-h-screen bg-[#0A0F1D] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#6366F1]/30">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#6366F1]/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white">LifeRPG</span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold bg-[#201B4B] text-[#818CF8] rounded-full border border-[#6366F1]/30">
              v2.5
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn && onGoToDashboard ? (
            <button
              onClick={onGoToDashboard}
              className="px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#5254E2] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-[#6366F1]/25 flex items-center gap-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={onContinueAsGuest}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#94A3B8] hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Guest Mode</span>
              </button>
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 rounded-xl bg-[#141D2E] hover:bg-[#1C273C] border border-white/10 text-xs sm:text-sm font-semibold text-white transition-all flex items-center gap-2 shadow-xs"
              >
                <LogIn className="w-4 h-4 text-[#818CF8]" />
                <span>Login</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Hero Card Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center">
        <div className="relative rounded-3xl bg-[#101726] border border-white/10 shadow-2xl overflow-hidden">
          {/* Top Scenic Mountain Banner */}
          <div className="relative h-64 sm:h-80 md:h-96 w-full">
            <MountainArt className="w-full h-full" variant="hero" />

            {/* Glowing Accent Orbs */}
            <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-[#6366F1]/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-[#A855F7]/20 rounded-full blur-[90px] pointer-events-none" />

            {/* Overlay Gradient for Smooth Text Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#101726] via-[#101726]/40 to-transparent" />

            {/* Floating Top Pill Badge */}
            <div className="absolute top-6 left-6 z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0A0F1D]/80 backdrop-blur-md border border-white/15 text-xs text-[#E2E8F0] shadow-sm">
                <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="font-medium">Gamified Personal Evolution</span>
              </div>
            </div>
          </div>

          {/* Hero Content Section */}
          <div className="relative px-6 sm:px-10 pb-10 -mt-16 sm:-mt-20 z-10 text-center">
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Build better habits.{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#818CF8] via-[#A78BFA] to-[#C084FC]">
                Create a greater you.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              Track your tasks, build habits, set goals, and grow with AI — all in one place.
            </p>

            {/* 4 Feature Badges */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 max-w-2xl mx-auto">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141D2E] border border-white/10 text-xs sm:text-sm font-medium text-[#E2E8F0]">
                <Sparkles className="w-4 h-4 text-[#818CF8]" />
                <span>Habit Tracker</span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141D2E] border border-white/10 text-xs sm:text-sm font-medium text-[#E2E8F0]">
                <Target className="w-4 h-4 text-[#38BDF8]" />
                <span>Goals</span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141D2E] border border-white/10 text-xs sm:text-sm font-medium text-[#E2E8F0]">
                <Bot className="w-4 h-4 text-[#A855F7]" />
                <span>AI Coach</span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141D2E] border border-white/10 text-xs sm:text-sm font-medium text-[#E2E8F0]">
                <BarChart3 className="w-4 h-4 text-[#34D399]" />
                <span>Analytics</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
              <button
                type="button"
                onClick={onOpenSignUp}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#6366F1] hover:bg-[#5254E2] active:scale-[0.99] text-white text-sm font-semibold tracking-wide shadow-lg shadow-[#6366F1]/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onContinueAsGuest}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#141D2E] hover:bg-[#1A253A] border border-white/10 active:scale-[0.99] text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <span>Continue as Guest</span>
                <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
              </button>
            </div>

            {/* Quote Card */}
            <div className="mt-8 max-w-md mx-auto p-3.5 rounded-xl bg-[#141D2E]/70 border border-white/[0.06] text-xs text-[#94A3B8]">
              <p className="italic">
                “Small steps, bigger tomorrow.” <span className="text-[#818CF8] font-semibold not-italic">— LifeRPG</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Social Proof Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-[#64748B]">
        <div className="flex items-center -space-x-2">
          <img
            className="w-7 h-7 rounded-full ring-2 ring-[#0A0F1D] object-cover"
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"
            alt="User 1"
            referrerPolicy="no-referrer"
          />
          <img
            className="w-7 h-7 rounded-full ring-2 ring-[#0A0F1D] object-cover"
            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&auto=format&fit=crop&q=80"
            alt="User 2"
            referrerPolicy="no-referrer"
          />
          <img
            className="w-7 h-7 rounded-full ring-2 ring-[#0A0F1D] object-cover"
            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&auto=format&fit=crop&q=80"
            alt="User 3"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="text-center sm:text-left">
          Join <span className="text-[#E2E8F0] font-semibold">50,000+</span> people building better lives with LifeRPG.
        </div>
      </footer>

      {/* Team Expo Developer Footer */}
      <Footer className="border-white/5 bg-[#080C16]/90" />
    </div>
  );
};
