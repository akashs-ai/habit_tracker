import React from 'react';
import { Check, X } from 'lucide-react';
import { FriendRequest } from '../../types';

interface FriendRequestsCardProps {
  requests: FriendRequest[];
  onAccept: (request: FriendRequest) => void;
  onDecline: (requestId: string) => void;
  onSeeAll?: () => void;
}

export const FriendRequestsCard: React.FC<FriendRequestsCardProps> = ({
  requests,
  onAccept,
  onDecline,
  onSeeAll,
}) => {
  return (
    <div 
      id="friends-requests-card"
      className="bg-[#11161D] border border-white/6 rounded-2xl p-4 lg:p-5 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <h3 className="text-base font-bold text-white tracking-tight">
          Friend Requests ({requests.length})
        </h3>
        {onSeeAll && (
          <button 
            onClick={onSeeAll}
            className="text-xs font-semibold text-[#6366F1] hover:text-[#818CF8] transition-colors"
          >
            See All
          </button>
        )}
      </div>

      {/* Requests List */}
      <div className="space-y-3 mt-3">
        {requests.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#687185]">
            You're all caught up! No pending requests.
          </div>
        ) : (
          requests.slice(0, 3).map((req) => (
            <div 
              key={req.id}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-white/4 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img 
                  src={req.avatarUrl} 
                  alt={req.name}
                  className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white leading-tight truncate">{req.name}</p>
                  <p className="text-[11px] text-[#9AA3B5] truncate mt-0.5">{req.reason}</p>
                </div>
              </div>

              {/* Action Buttons: Accept (Check) & Decline (X) */}
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <button
                  onClick={() => onAccept(req)}
                  title="Accept request"
                  className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-[#6366F1] hover:bg-indigo-500 hover:text-white flex items-center justify-center transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDecline(req.id)}
                  title="Decline request"
                  className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
