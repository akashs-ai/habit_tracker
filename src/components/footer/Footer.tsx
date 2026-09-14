import React, { useState } from 'react';
import { Sparkles, Calendar, Code2, Users } from 'lucide-react';
import { TEAM_MEMBERS, TEAM_INFO, TeamMember } from './teamData';
import { TeamProfileModal } from './TeamProfileModal';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenMember = (member: TeamMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  return (
    <>
      <footer 
        id="app-team-footer"
        className={`w-full border-t border-slate-200/80 dark:border-white/8 bg-white/70 dark:bg-[#090C15]/85 backdrop-blur-md transition-colors ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            
            {/* Left: Team Expo Badge & Branding */}
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50/80 dark:bg-[#6366F1]/10 border border-indigo-200/70 dark:border-[#6366F1]/25 text-indigo-700 dark:text-[#A5B4FC]">
                <div className="w-5 h-5 rounded-lg bg-[#6366F1] flex items-center justify-center text-white">
                  <Sparkles className="w-3 h-3 fill-white" />
                </div>
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                  {TEAM_INFO.teamName}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-[#818CF8]" />
                <span>Developed on: <strong className="font-semibold text-slate-700 dark:text-slate-200">{TEAM_INFO.developmentDate}</strong></span>
              </div>
            </div>

            {/* Center: Developed by Interactive Member Names */}
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Users className="w-3.5 h-3.5 text-indigo-500 dark:text-[#818CF8]" />
                <span>Developed by:</span>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                {TEAM_MEMBERS.map((member, index) => (
                  <React.Fragment key={member.id}>
                    <button
                      type="button"
                      onClick={() => handleOpenMember(member)}
                      title={`View ${member.name} (${member.role}) profile`}
                      className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-white bg-slate-100/80 hover:bg-indigo-50 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40"
                    >
                      <Code2 className="w-3 h-3 text-indigo-500 dark:text-[#818CF8] opacity-70 group-hover:opacity-100 transition-opacity" />
                      <span>{member.name}</span>
                    </button>
                    {index < TEAM_MEMBERS.length - 1 && (
                      <span className="text-slate-300 dark:text-slate-700 select-none text-xs">·</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Right: Copyright & Rights */}
            <div className="text-center md:text-right text-xs text-slate-500 dark:text-slate-400">
              <p>{TEAM_INFO.copyright}</p>
            </div>

          </div>
        </div>
      </footer>

      {/* Team Member Profile Popup */}
      <TeamProfileModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};
