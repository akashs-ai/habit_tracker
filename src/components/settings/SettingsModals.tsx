import React, { useState } from 'react';
import {
  X,
  Camera,
  AlertTriangle,
  Laptop,
  Smartphone,
  CheckCircle,
  Download,
  FileText,
} from 'lucide-react';
import { UserSettingsProfile } from '../../types';
import { mockSessions } from '../../data/settingsMockData';

// -------------------------------------------------------------
// Edit Profile Modal
// -------------------------------------------------------------
interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserSettingsProfile;
  onSave: (updated: Partial<UserSettingsProfile>) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      displayName: displayName.trim() || profile.displayName,
      username: username.trim() || profile.username,
      bio: bio.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-[520px] bg-[#101722] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-5 border-b border-white/[0.08]">
          <div>
            <h3 className="text-lg font-bold text-[#F5F7FB] tracking-tight">
              Edit Profile
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Update your information and how you appear on LifeRPG.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F5F7FB] hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="pt-5 space-y-5">
          {/* Avatar / Change photo */}
          <div className="flex flex-col items-center justify-center gap-2 pb-2">
            <div className="relative group cursor-pointer">
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover ring-2 ring-[#6366F1]/50 shadow-md"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6" />
              </div>
            </div>
            <span className="text-xs font-semibold text-[#818CF8] hover:underline cursor-pointer">
              Change photo
            </span>
            <span className="text-[11px] text-[#64748B]">
              JPG, PNG (max 5MB)
            </span>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={40}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141D2A] border border-white/10 text-sm text-[#F5F7FB] placeholder-[#64748B] focus:outline-none focus:border-[#5B5CE2] focus:ring-1 focus:ring-[#5B5CE2] transition-colors"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#64748B]">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                }
                maxLength={24}
                required
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#141D2A] border border-white/10 text-sm text-[#F5F7FB] placeholder-[#64748B] focus:outline-none focus:border-[#5B5CE2] focus:ring-1 focus:ring-[#5B5CE2] transition-colors"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#94A3B8]">Bio</label>
              <span className="text-[11px] text-[#64748B]">
                {bio.length}/120
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={120}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141D2A] border border-white/10 text-sm text-[#F5F7FB] placeholder-[#64748B] focus:outline-none focus:border-[#5B5CE2] focus:ring-1 focus:ring-[#5B5CE2] transition-colors resize-none"
            />
          </div>

          {/* Email (Read only notice) */}
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141D2A]/50 border border-white/[0.06] text-sm text-[#64748B] cursor-not-allowed"
            />
            <p className="text-[11px] text-[#64748B] mt-1.5">
              To change your email, please contact support.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#141D2A] hover:bg-[#1A2536] border border-white/10 text-xs md:text-sm font-medium text-[#94A3B8] hover:text-[#F5F7FB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#5B5CE2] hover:bg-[#4E4FD1] text-xs md:text-sm font-semibold text-white transition-colors shadow-sm"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Delete Account Confirmation Modal
// -------------------------------------------------------------
interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  const [confirmInput, setConfirmInput] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-[460px] bg-[#101722] border border-white/10 rounded-2xl p-6 shadow-2xl z-10 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/25 flex items-center justify-center text-[#EF4444] shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F5F7FB] hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-bold text-[#F5F7FB] tracking-tight">
            Delete your account?
          </h3>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-2 leading-relaxed">
            This action cannot be undone. This will permanently delete your account and all your data from LifeRPG.
          </p>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
            Type <span className="text-[#EF4444] font-bold">DELETE</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder="DELETE"
            className="w-full px-3 py-2 rounded-xl bg-[#141D2A] border border-white/10 text-sm text-[#F5F7FB] placeholder-[#64748B] focus:outline-none focus:border-[#EF4444]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#141D2A] hover:bg-[#1A2536] border border-white/10 text-xs sm:text-sm font-medium text-[#94A3B8] hover:text-[#F5F7FB] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={confirmInput !== 'DELETE'}
            onClick={() => {
              onConfirmDelete();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              confirmInput === 'DELETE'
                ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-md cursor-pointer'
                : 'bg-[#EF4444]/20 text-[#EF4444]/50 cursor-not-allowed'
            }`}
          >
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Change Password Modal
// -------------------------------------------------------------
interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setError('');
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[460px] bg-[#101722] border border-white/10 rounded-2xl p-6 shadow-2xl z-10">
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/[0.08]">
          <div>
            <h3 className="text-lg font-bold text-[#F5F7FB]">Change Password</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Keep your LifeRPG account safe with a strong password.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F5F7FB]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs text-[#EF4444]">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Current password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-[#141D2A] border border-white/10 text-sm text-[#F5F7FB] focus:outline-none focus:border-[#5B5CE2]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              className="w-full px-3.5 py-2 rounded-xl bg-[#141D2A] border border-white/10 text-sm text-[#F5F7FB] focus:outline-none focus:border-[#5B5CE2]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-[#141D2A] border border-white/10 text-sm text-[#F5F7FB] focus:outline-none focus:border-[#5B5CE2]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#141D2A] hover:bg-[#1A2536] border border-white/10 text-xs font-medium text-[#94A3B8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#5B5CE2] hover:bg-[#4E4FD1] text-xs font-semibold text-white"
            >
              Update password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Active Sessions Modal
// -------------------------------------------------------------
interface ActiveSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRevoke: (id: string) => void;
}

export const ActiveSessionsModal: React.FC<ActiveSessionsModalProps> = ({
  isOpen,
  onClose,
  onRevoke,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[500px] bg-[#101722] border border-white/10 rounded-2xl p-6 shadow-2xl z-10">
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/[0.08]">
          <div>
            <h3 className="text-lg font-bold text-[#F5F7FB]">Active Sessions</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Devices currently signed in to your account.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F5F7FB]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="divide-y divide-white/[0.06] pt-3 max-h-[60vh] overflow-y-auto">
          {mockSessions.map((session) => (
            <div key={session.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#141D2A] flex items-center justify-center text-[#818CF8]">
                  {session.device.includes('iPhone') ? (
                    <Smartphone className="w-4 h-4" />
                  ) : (
                    <Laptop className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#F5F7FB]">
                      {session.device}
                    </span>
                    {session.current && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] font-medium border border-[#22C55E]/30">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B]">
                    {session.location} • {session.lastActive}
                  </p>
                </div>
              </div>

              {!session.current && (
                <button
                  type="button"
                  onClick={() => onRevoke(session.id)}
                  className="text-xs text-[#EF4444] hover:underline"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#141D2A] hover:bg-[#1A2536] border border-white/10 text-xs font-medium text-[#F5F7FB]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Data Usage Modal
// -------------------------------------------------------------
export const DataUsageModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[500px] bg-[#101722] border border-white/10 rounded-2xl p-6 shadow-2xl z-10">
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
          <div>
            <h3 className="text-lg font-bold text-[#F5F7FB]">How Your Data Is Used</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">Privacy principles at LifeRPG.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F5F7FB]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="pt-4 space-y-3 text-xs text-[#94A3B8] leading-relaxed">
          <p>
            <strong className="text-[#F5F7FB]">Zero Ad Targeting:</strong> LifeRPG never sells your habit, quest, or calendar data to third parties or advertising networks.
          </p>
          <p>
            <strong className="text-[#F5F7FB]">End-to-End Encryption:</strong> Sensitive integration tokens (e.g. Google Calendar OAuth) are encrypted at rest using AES-256.
          </p>
          <p>
            <strong className="text-[#F5F7FB]">AI Coach Boundaries:</strong> Your chat conversations are processed solely to assist your productivity. They are not used to train foundational AI models.
          </p>
        </div>
        <div className="flex justify-end pt-5 border-t border-white/[0.08]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-[#5B5CE2] text-xs font-semibold text-white">
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Download Data Modal
// -------------------------------------------------------------
export const DownloadDataModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}> = ({ isOpen, onClose, onDownload }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[460px] bg-[#101722] border border-white/10 rounded-2xl p-6 shadow-2xl z-10">
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
          <div>
            <h3 className="text-lg font-bold text-[#F5F7FB]">Download Your Data</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">Export a full archive of your LifeRPG records.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F5F7FB]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="pt-4 text-xs text-[#94A3B8] leading-relaxed space-y-2">
          <p>Your archive contains:</p>
          <ul className="list-disc pl-5 space-y-1 text-[#F5F7FB]">
            <li>Profile metadata & security audit logs</li>
            <li>Completed quests, tasks & deadlines</li>
            <li>Habit streaks, MP history & achievements</li>
            <li>AI Coach conversations & notes</li>
          </ul>
        </div>
        <div className="flex justify-end gap-3 pt-5 border-t border-white/[0.08]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-[#141D2A] text-xs font-medium text-[#94A3B8]">
            Cancel
          </button>
          <button
            onClick={() => {
              onDownload();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B5CE2] hover:bg-[#4E4FD1] text-xs font-semibold text-white"
          >
            <Download className="w-4 h-4" />
            <span>Generate JSON Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};
