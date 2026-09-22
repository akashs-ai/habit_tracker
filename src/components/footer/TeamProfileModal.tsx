import React, { useEffect, useState } from 'react';
import { 
  X, 
  Linkedin, 
  Instagram, 
  Github, 
  Sparkles, 
  Code2, 
  Award, 
  ExternalLink,
  Star,
  BookOpen,
  Users2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { TeamMember, TEAM_INFO } from './teamData';
import { fetchGitHubDeveloperStats, GitHubDeveloperStats } from './githubService';
import { fetchInstagramAvatar } from './instagramService';

interface TeamProfileModalProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  initialGitHubStats?: GitHubDeveloperStats | null;
  initialInstagramAvatar?: string | null;
  onStatsUpdated?: (memberId: string, stats: GitHubDeveloperStats) => void;
  onInstagramAvatarUpdated?: (memberId: string, avatarUrl: string) => void;
}

export const TeamProfileModal: React.FC<TeamProfileModalProps> = ({
  member,
  isOpen,
  onClose,
  initialGitHubStats = null,
  initialInstagramAvatar = null,
  onStatsUpdated,
  onInstagramAvatarUpdated
}) => {
  const [imgError, setImgError] = useState(false);
  const [bannerError, setBannerError] = useState(false);

  // Instagram Avatar Auto-Sync state
  const [instagramAvatar, setInstagramAvatar] = useState<string | null>(initialInstagramAvatar || null);
  const [instagramImgError, setInstagramImgError] = useState(false);

  // GitHub Auto-Sync state
  const [isLoadingGitHub, setIsLoadingGitHub] = useState(false);
  const [gitHubStats, setGitHubStats] = useState<GitHubDeveloperStats | null>(null);
  const [gitHubError, setGitHubError] = useState<string | null>(null);

  // Auto-sync whenever the modal is opened for a member
  useEffect(() => {
    setImgError(false);
    setBannerError(false);
    setGitHubError(null);
    setInstagramImgError(false);

    if (initialInstagramAvatar) {
      setInstagramAvatar(initialInstagramAvatar);
    } else {
      setInstagramAvatar(null);
    }

    if (initialGitHubStats) {
      setGitHubStats(initialGitHubStats);
    } else {
      setGitHubStats(null);
    }

    if (!isOpen || !member) return;

    let isMounted = true;

    // 1. Fetch Instagram avatar if available and not supplied
    if (member.instagram && !initialInstagramAvatar) {
      fetchInstagramAvatar(member.instagram).then((avatar) => {
        if (isMounted && avatar) {
          setInstagramAvatar(avatar);
          if (onInstagramAvatarUpdated && member.id) {
            onInstagramAvatarUpdated(member.id, avatar);
          }
        }
      });
    }

    // 2. Automatically fetch GitHub stats if not already supplied
    if (member.github) {
      const autoSync = async () => {
        if (!initialGitHubStats) {
          setIsLoadingGitHub(true);
        }
        try {
          const stats = await fetchGitHubDeveloperStats(member.github);
          if (isMounted) {
            setGitHubStats(stats);
            if (onStatsUpdated && member.id) {
              onStatsUpdated(member.id, stats);
            }
          }
        } catch (err: any) {
          if (isMounted && !initialGitHubStats) {
            setGitHubError(err.message || 'GitHub stats currently unavailable');
          }
        } finally {
          if (isMounted) {
            setIsLoadingGitHub(false);
          }
        }
      };

      autoSync();
    }

    return () => {
      isMounted = false;
    };
  }, [member?.id, isOpen, initialInstagramAvatar, initialGitHubStats]);

  // Handle ESC key press to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !member) return null;

  const hasBanner = Boolean(member.bannerImage && !bannerError);
  // Priority: 1. Synced Instagram Avatar -> 2. Member profileImage -> 3. GitHub Avatar -> 4. Initials fallback
  const hasInstagramAvatar = Boolean(instagramAvatar && !instagramImgError);
  const effectiveProfileImage = hasInstagramAvatar
    ? instagramAvatar
    : (member.profileImage || gitHubStats?.avatarUrl);
  const hasProfileImage = Boolean(effectiveProfileImage && !imgError);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="team-member-modal-title"
    >
      {/* Modal Container */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden transition-all animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Banner: Image if provided, with seamless gradient fallback */}
        <div className="h-24 sm:h-28 w-full bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#4F46E5] relative overflow-hidden">
          {hasBanner && (
            <img
              src={member.bannerImage}
              alt={`${member.name} banner`}
              className="absolute inset-0 w-full h-full object-cover object-center"
              onError={() => setBannerError(true)}
            />
          )}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]" />
          
          <div className="absolute top-3 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/35 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>{TEAM_INFO.teamName}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile modal"
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/35 hover:bg-black/60 text-white/90 hover:text-white transition-colors focus:outline-hidden focus:ring-2 focus:ring-white/40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Container */}
        <div className="px-6 pb-6 pt-0">
          {/* Avatar and Info Header */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            {/* Perfect circular profile avatar container */}
            <div className="relative z-10 w-20 h-20 aspect-square shrink-0 rounded-full bg-gradient-to-br from-[#6366F1] to-[#3B82F6] p-0.5 shadow-xl ring-4 ring-white dark:ring-[#0F172A] flex items-center justify-center">
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#1E293B]">
                {hasProfileImage ? (
                  <img
                    src={effectiveProfileImage}
                    alt={member.name}
                    className="w-full h-full object-cover object-center rounded-full"
                    onError={() => {
                      if (hasInstagramAvatar) {
                        setInstagramImgError(true);
                      } else {
                        setImgError(true);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl tracking-wider select-none">
                    {member.initials}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-[#6366F1]/15 border border-indigo-200 dark:border-[#6366F1]/30 text-indigo-700 dark:text-[#A5B4FC] text-xs font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>Team Member</span>
            </div>
          </div>

          {/* Name and Role */}
          <div>
            <h3 
              id="team-member-modal-title"
              className="text-xl font-bold text-slate-900 dark:text-white tracking-tight"
            >
              {member.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-[#818CF8]">
                <Code2 className="w-3.5 h-3.5" />
                {member.role}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {TEAM_INFO.teamName}
              </span>
            </div>
          </div>

          {/* Short Bio */}
          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {member.bio}
          </p>

          {/* Skills / Badges */}
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {member.skills.map((skill) => (
              <span 
                key={skill}
                className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-medium text-slate-700 dark:text-slate-300"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* GitHub Auto-Synced Activity Section */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <Github className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                <span>GitHub Activity (Auto-synced)</span>
              </div>

              {gitHubStats && (
                <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live</span>
                </div>
              )}
            </div>

            {/* Error notice if GitHub API fails */}
            {gitHubError && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{gitHubError}</span>
              </div>
            )}

            {/* Loading skeleton while auto-syncing */}
            {isLoadingGitHub && !gitHubStats && (
              <div className="space-y-2 animate-pulse">
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-14 rounded-xl bg-slate-100 dark:bg-white/5" />
                  <div className="h-14 rounded-xl bg-slate-100 dark:bg-white/5" />
                  <div className="h-14 rounded-xl bg-slate-100 dark:bg-white/5" />
                </div>
                <div className="h-10 rounded-lg bg-slate-100 dark:bg-white/5" />
              </div>
            )}

            {/* If stats are loaded */}
            {gitHubStats && (
              <div className="space-y-2.5">
                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-[10px] mb-0.5">
                      <BookOpen className="w-3 h-3" />
                      <span>Repos</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {gitHubStats.publicRepos}
                    </span>
                  </div>

                  <div className="px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-[10px] mb-0.5">
                      <Star className="w-3 h-3 text-amber-500" />
                      <span>Stars</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {gitHubStats.totalStars}
                    </span>
                  </div>

                  <div className="px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-[10px] mb-0.5">
                      <Users2 className="w-3 h-3" />
                      <span>Followers</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {gitHubStats.followers}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Social Profiles Section */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
              Connect & Portfolio
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* LinkedIn */}
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-[#0A66C2]/10 border border-slate-200 hover:border-[#0A66C2]/40 text-slate-700 hover:text-[#0A66C2] dark:bg-white/[0.03] dark:hover:bg-[#0A66C2]/20 dark:border-white/10 dark:hover:border-[#0A66C2]/50 dark:text-slate-200 dark:hover:text-white transition-all text-xs font-semibold group"
                aria-label={`${member.name} on LinkedIn (opens in new tab)`}
              >
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-[#0A66C2] shrink-0" />
                  <span>LinkedIn</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
              </a>

              {/* Instagram */}
              <a
                href={member.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-[#E4405F]/10 border border-slate-200 hover:border-[#E4405F]/40 text-slate-700 hover:text-[#E4405F] dark:bg-white/[0.03] dark:hover:bg-[#E4405F]/20 dark:border-white/10 dark:hover:border-[#E4405F]/50 dark:text-slate-200 dark:hover:text-white transition-all text-xs font-semibold group"
                aria-label={`${member.name} on Instagram (opens in new tab)`}
              >
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-[#E4405F] shrink-0" />
                  <span>Instagram</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
              </a>

              {/* GitHub */}
              <a
                href={member.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] dark:border-white/10 dark:hover:border-white/20 dark:text-slate-200 dark:hover:text-white transition-all text-xs font-semibold group"
                aria-label={`${member.name} on GitHub (opens in new tab)`}
              >
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-slate-800 dark:text-slate-200 shrink-0" />
                  <span>GitHub</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
