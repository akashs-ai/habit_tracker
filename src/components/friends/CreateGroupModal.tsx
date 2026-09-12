import React, { useState } from 'react';
import { X, Users, ChevronDown } from 'lucide-react';
import { SocialGroup } from '../../types';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (group: Omit<SocialGroup, 'id' | 'membersCount'>) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateGroup({
      name: name.trim(),
      description: description.trim() || 'A supportive group focused on consistent daily growth.',
      isPrivate: privacy === 'private',
      category: 'Focus & Study',
    });

    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div 
      id="create-group-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="create-group-modal-card"
        className="w-full max-w-[480px] bg-[#0E1217] border border-white/10 rounded-2xl p-6 shadow-2xl relative text-[#F7F8FC] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/8">
          <span className="text-sm font-semibold text-[#9AA3B5]">Create Group (Modal)</span>
          <button 
            id="close-group-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#687185] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Icon & Title */}
        <div className="pt-4 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#6366F1]/15 border border-[#6366F1]/30 flex items-center justify-center text-[#6366F1] mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Create a Group</h3>
          <p className="text-xs text-[#9AA3B5] mt-1 max-w-xs">Bring people together around a common goal.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#9AA3B5] mb-1.5">Group Name</label>
            <input 
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g. Study Squad"
              className="w-full h-11 px-3.5 rounded-xl bg-[#12161E] border border-white/10 text-white text-xs placeholder:text-[#687185] focus:outline-none focus:border-[#6366F1] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9AA3B5] mb-1.5">Description (optional)</label>
            <textarea 
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g. A group to stay consistent with DSA practice"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12161E] border border-white/10 text-white text-xs placeholder:text-[#687185] focus:outline-none focus:border-[#6366F1] transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9AA3B5] mb-1.5">Privacy</label>
            <div className="relative">
              <select 
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as 'public' | 'private')}
                className="w-full h-11 px-3.5 rounded-xl bg-[#12161E] border border-white/10 text-white text-xs appearance-none focus:outline-none focus:border-[#6366F1] cursor-pointer"
              >
                <option value="public" className="bg-[#151A22] text-white">Public (Anyone can join)</option>
                <option value="private" className="bg-[#151A22] text-white">Private (Invite only)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#687185] absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/8">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9AA3B5] hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#6366F1] hover:bg-[#7C7FF5] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-600/30"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
