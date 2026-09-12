import React, { useState } from 'react';
import { X, Search, UserPlus, Check, Copy, Link as LinkIcon, Share2 } from 'lucide-react';
import { FriendUser } from '../../types';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFriend: (user: Partial<FriendUser>) => void;
}

export const AddFriendModal: React.FC<AddFriendModalProps> = ({
  isOpen,
  onClose,
  onAddFriend,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'invite'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const potentialFriends = [
    {
      id: 'pot-1',
      name: 'Ishita Sen',
      username: 'ishita.sen',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      reason: 'Similar goals: Fitness, Focus',
      level: 11,
      xp: 2610,
      consistencyDays: 17,
      status: 'online' as const,
    },
    {
      id: 'pot-2',
      name: 'Kabir Malhotra',
      username: 'kabir.dev',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      reason: 'Similar goals: Coding, Tech',
      level: 12,
      xp: 2740,
      consistencyDays: 18,
      status: 'away' as const,
    },
    {
      id: 'pot-3',
      name: 'Meera Joshi',
      username: 'meera.n',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      reason: 'Similar goals: Reading, Growth',
      level: 10,
      xp: 2340,
      consistencyDays: 16,
      status: 'offline' as const,
    },
    {
      id: 'pot-4',
      name: 'Aarav Mehta',
      username: 'aarav.fit',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      reason: 'Similar goals: Fitness, Focus',
      level: 9,
      xp: 2010,
      consistencyDays: 14,
      status: 'online' as const,
    }
  ];

  const filteredList = potentialFriends.filter((p) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = (user: typeof potentialFriends[0]) => {
    setAddedIds((prev) => ({ ...prev, [user.id]: true }));
    onAddFriend({
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      level: user.level,
      xp: user.xp,
      consistencyDays: user.consistencyDays,
      status: user.status,
    });
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText('https://liferpg.app/invite/alex-8921');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div 
      id="add-friend-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="add-friend-modal-card"
        className="w-full max-w-[500px] bg-[#0E1217] border border-white/10 rounded-2xl p-6 shadow-2xl relative text-[#F7F8FC] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/8">
          <span className="text-sm font-semibold text-[#9AA3B5]">Add Friend (Modal)</span>
          <button 
            id="close-add-friend-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#687185] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs: Search / Invite */}
        <div className="flex items-center gap-2 mt-4">
          <button 
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'search'
                ? 'bg-[#6366F1] text-white shadow-sm shadow-indigo-500/20'
                : 'bg-[#12161E] text-[#9AA3B5] hover:text-white hover:bg-white/5'
            }`}
          >
            Search
          </button>
          <button 
            onClick={() => setActiveTab('invite')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'invite'
                ? 'bg-[#6366F1] text-white shadow-sm shadow-indigo-500/20'
                : 'bg-[#12161E] text-[#9AA3B5] hover:text-white hover:bg-white/5'
            }`}
          >
            Invite
          </button>
        </div>

        {activeTab === 'search' ? (
          <div className="mt-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#687185] absolute left-3.5 top-3.5" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or username..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#12161E] border border-white/10 text-white text-xs placeholder:text-[#687185] focus:outline-none focus:border-[#6366F1] transition-colors"
              />
            </div>

            {/* Results List */}
            <div className="mt-4 space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {filteredList.map((user) => {
                const isAdded = addedIds[user.id];
                return (
                  <div 
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#12161E] border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatarUrl} 
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
                        <p className="text-[11px] text-[#687185]">@{user.username}</p>
                        <p className="text-[10px] text-[#9AA3B5] mt-0.5">{user.reason}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleAdd(user)}
                      disabled={isAdded}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isAdded
                          ? 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30'
                          : 'bg-[#6366F1] hover:bg-[#7C7FF5] text-white shadow-sm shadow-indigo-600/20'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
              {filteredList.length === 0 && (
                <div className="py-8 text-center text-xs text-[#687185]">
                  No people found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-xl bg-[#12161E] border border-white/5 text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-[#6366F1] mx-auto flex items-center justify-center mb-3">
                <LinkIcon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Share your personal invite link</h4>
              <p className="text-xs text-[#9AA3B5] mt-1">Friends who join through this link will automatically connect as your accountability partners.</p>
              
              <div className="mt-4 flex items-center gap-2 p-1.5 rounded-xl bg-black/40 border border-white/10">
                <input 
                  type="text"
                  readOnly
                  value="https://liferpg.app/invite/alex-8921"
                  className="bg-transparent px-2.5 text-xs text-white flex-1 focus:outline-none select-all"
                />
                <button 
                  onClick={handleCopyInvite}
                  className="px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#7C7FF5] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
