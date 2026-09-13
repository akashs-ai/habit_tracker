import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, Check, Copy, Link as LinkIcon, Share2, Send, Loader2 } from 'lucide-react';
import { FriendUser } from '../../types';
import { api } from '../../services/api';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFriend: (user: Partial<FriendUser> & { id?: string; reason?: string }) => void;
}

export const AddFriendModal: React.FC<AddFriendModalProps> = ({
  isOpen,
  onClose,
  onAddFriend,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'invite'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [isCopied, setIsCopied] = useState(false);

  // Direct invite input
  const [inviteIdentifier, setInviteIdentifier] = useState('');
  const [inviteNote, setInviteNote] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);

  const fallbackFriends = [
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

  // Perform live search when searchQuery changes
  useEffect(() => {
    if (!isOpen) return;

    if (!searchQuery.trim()) {
      setSearchResults(fallbackFriends);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.searchUsers(searchQuery.trim());
        if (results && results.length > 0) {
          setSearchResults(results);
        } else {
          // Fallback filter
          const filtered = fallbackFriends.filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.reason.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSearchResults(filtered);
        }
      } catch (err) {
        // Fallback filter on network error
        const filtered = fallbackFriends.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.reason.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  if (!isOpen) return null;

  const handleAdd = (user: any) => {
    setAddedIds((prev) => ({ ...prev, [user.id]: true }));
    onAddFriend({
      id: user.id,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      level: user.level,
      xp: user.xp,
      consistencyDays: user.consistencyDays,
      status: user.status,
      reason: user.reason || 'Requested connection',
    });
  };

  const handleSendDirectInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteIdentifier.trim()) return;
    setIsSendingInvite(true);
    setInviteFeedback(null);
    try {
      await onAddFriend({
        username: inviteIdentifier.trim(),
        name: inviteIdentifier.trim(),
        reason: inviteNote.trim() || 'Shared goals & accountability',
      });
      setInviteFeedback(`Invite sent to ${inviteIdentifier.trim()}!`);
      setInviteIdentifier('');
      setInviteNote('');
    } catch (err: any) {
      setInviteFeedback(err?.message || 'Failed to send invite.');
    } finally {
      setIsSendingInvite(false);
    }
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
          <span className="text-sm font-semibold text-[#9AA3B5]">Add Friend</span>
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
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#12161E] border border-white/10 text-white text-xs placeholder:text-[#687185] focus:outline-none focus:border-[#6366F1] transition-colors"
              />
              {isSearching && (
                <Loader2 className="w-4 h-4 text-[#6366F1] absolute right-3.5 top-3.5 animate-spin" />
              )}
            </div>

            {/* Results List */}
            <div className="mt-4 space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {searchResults.map((user) => {
                const isAdded = addedIds[user.id];
                return (
                  <div 
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#12161E] border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white leading-tight truncate">{user.name}</p>
                        <p className="text-[11px] text-[#687185] truncate">@{user.username}</p>
                        <p className="text-[10px] text-[#9AA3B5] mt-0.5 truncate">{user.reason || `Level ${user.level || 1} • ${user.consistencyDays || 0}d streak`}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleAdd(user)}
                      disabled={isAdded}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                        isAdded
                          ? 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30'
                          : 'bg-[#6366F1] hover:bg-[#7C7FF5] text-white shadow-sm shadow-indigo-600/20'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Sent</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
              {searchResults.length === 0 && !isSearching && (
                <div className="py-8 text-center text-xs text-[#687185]">
                  No people found matching "{searchQuery}". Try searching by exact username or use the Invite tab!
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {/* Direct Send Invite by Username or Email */}
            <form onSubmit={handleSendDirectInvite} className="p-4 rounded-xl bg-[#12161E] border border-white/5 space-y-3">
              <h4 className="text-xs font-bold text-white">Send Direct Invitation</h4>
              <div className="space-y-2">
                <input 
                  type="text"
                  value={inviteIdentifier}
                  onChange={(e) => setInviteIdentifier(e.target.value)}
                  placeholder="Enter username or email address..."
                  className="w-full h-10 px-3 rounded-lg bg-[#0B0E14] border border-white/10 text-white text-xs placeholder:text-[#687185] focus:outline-none focus:border-[#6366F1]"
                  required
                />
                <input 
                  type="text"
                  value={inviteNote}
                  onChange={(e) => setInviteNote(e.target.value)}
                  placeholder="Add an optional note or shared goal..."
                  className="w-full h-10 px-3 rounded-lg bg-[#0B0E14] border border-white/10 text-white text-xs placeholder:text-[#687185] focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              {inviteFeedback && (
                <p className={`text-xs ${inviteFeedback.includes('Failed') || inviteFeedback.includes('already') ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {inviteFeedback}
                </p>
              )}

              <button
                type="submit"
                disabled={isSendingInvite || !inviteIdentifier.trim()}
                className="w-full h-9 rounded-lg bg-[#6366F1] hover:bg-[#7C7FF5] disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {isSendingInvite ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{isSendingInvite ? 'Sending Request...' : 'Send Friend Request'}</span>
              </button>
            </form>

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
                  type="button"
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
