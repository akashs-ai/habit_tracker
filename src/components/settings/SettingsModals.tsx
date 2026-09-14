import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  AlertTriangle,
  Laptop,
  Smartphone,
  CheckCircle,
  Download,
  FileText,
  Upload,
  HardDrive,
  Sparkles,
  RotateCcw,
  Check,
  AlertCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { UserSettingsProfile } from '../../types';
import { mockSessions } from '../../data/settingsMockData';
import { api } from '../../services/api';

// -------------------------------------------------------------
// Google Drive & Image URL Formatter Helper
// -------------------------------------------------------------
export function formatDriveOrImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Google Drive: /file/d/FILE_ID or /d/FILE_ID
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${dMatch[1]}`;
  }

  // Google Drive: id=FILE_ID
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1] && (trimmed.includes('google.com') || trimmed.includes('googleusercontent.com'))) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }

  // Google Drive open?id= or uc?id=
  const ucMatch = trimmed.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/);
  if (ucMatch && ucMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
  }

  // Dropbox direct link
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('dl=0', 'raw=1');
  }

  return trimmed;
}

// Client-side image compressor for gallery uploads with robust fallback
function compressImage(file: File, maxSize = 400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const dataString = readerEvent.target?.result as string;
      const img = new Image();
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataString);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(mimeType, quality);
          resolve(dataUrl);
        } catch (e) {
          // Fallback to original read string if canvas processing fails
          resolve(dataString);
        }
      };
      img.onerror = () => {
        // Direct resolve data string on image decode issue
        resolve(dataString);
      };
      img.src = dataString;
    };
    reader.onerror = () => reject(new Error('Failed to read file from storage'));
    reader.readAsDataURL(file);
  });
}

const AVATAR_PRESETS = [
  { id: 'adventurer', name: 'Adventurer Alex', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { id: 'cyber', name: 'Cyber Rogue', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80' },
  { id: 'mage', name: 'Mystic Mage', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
  { id: 'warrior', name: 'Iron Warrior', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { id: 'scout', name: 'Swift Scout', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80' },
];

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
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'drive' | 'presets'>('upload');
  const [driveUrl, setDriveUrl] = useState('');
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(profile.displayName);
      setUsername(profile.username);
      setBio(profile.bio);
      setAvatarUrl(profile.avatarUrl);
      setFeedback(null);
      setDriveUrl('');
      setActiveTab('upload');
      setIsUploadingPhoto(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Please select a valid image file (JPG, PNG, WebP, GIF).' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Image size exceeds 10MB limit. Please select a smaller photo.' });
      return;
    }
    setIsUploadingPhoto(true);
    setFeedback(null);
    try {
      // 1. Upload to Supabase Storage
      const uploadedUrl = await api.uploadAvatar(file);
      if (uploadedUrl) {
        setAvatarUrl(uploadedUrl);
        setFeedback({ type: 'success', message: 'Photo uploaded to cloud storage! Click "Save changes" below to confirm.' });
      }
    } catch (uploadErr: any) {
      console.warn('Direct cloud upload fallback to local compressed image:', uploadErr);
      try {
        const compressedDataUrl = await compressImage(file, 400, 0.85);
        setAvatarUrl(compressedDataUrl);
        setFeedback({ type: 'success', message: 'Photo loaded! Click "Save changes" below to confirm.' });
      } catch (err: any) {
        setFeedback({ type: 'error', message: 'Could not process the selected image.' });
      }
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  };

  const handleTriggerGallery = () => {
    setActiveTab('upload');
    setFeedback(null);
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyDriveUrl = () => {
    if (!driveUrl.trim()) return;
    setIsLoadingDrive(true);
    setFeedback(null);
    const converted = formatDriveOrImageUrl(driveUrl);
    setAvatarUrl(converted);
    setFeedback({
      type: 'success',
      message: 'Google Drive photo applied! Click "Save changes" below to confirm.',
    });
    setIsLoadingDrive(false);
  };

  const handleSelectPreset = (url: string) => {
    setAvatarUrl(url);
    setFeedback({ type: 'success', message: 'Preset avatar selected!' });
  };

  const handleResetAvatar = () => {
    setAvatarUrl(profile.avatarUrl);
    setFeedback({ type: 'success', message: 'Restored current saved photo.' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      displayName: displayName.trim() || profile.displayName,
      username: username.trim() || profile.username,
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim() || profile.avatarUrl,
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
      <div className="relative w-full max-w-[520px] bg-white dark:bg-[#101722] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-5 border-b border-slate-200 dark:border-white/[0.08]">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-[#F5F7FB] tracking-tight">
              Edit Profile
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
              Update your information and how you appear on LifeRPG.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 dark:text-[#94A3B8] hover:text-slate-700 dark:hover:text-[#F5F7FB] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="pt-5 space-y-5">
          {/* Avatar / Change photo (Target Selected Focus Element) */}
          <div
            id="profile-avatar-upload-section"
            className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#141D2A]/60 border border-slate-200 dark:border-white/[0.08] transition-all"
          >
            {/* Hidden file input for gallery / device file selection */}
            <input
              ref={fileInputRef}
              id="avatar-gallery-file-input"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Avatar with Dropzone & Interactive Hover */}
            <div className="flex flex-col items-center gap-2">
              <div
                id="avatar-dropzone-target"
                onClick={handleTriggerGallery}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                title="Click to choose from your gallery or drag and drop an image"
                className={`relative group cursor-pointer rounded-full transition-all duration-200 ${
                  isDragging
                    ? 'ring-4 ring-[#6366F1] scale-105 shadow-xl shadow-[#6366F1]/30'
                    : 'ring-2 ring-[#6366F1]/60 hover:ring-[#818CF8] hover:scale-[1.02] shadow-lg shadow-black/20'
                }`}
              >
                <img
                  id="avatar-preview-image"
                  src={avatarUrl || profile.avatarUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                />
                {isUploadingPhoto ? (
                  <div className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center text-white">
                    <Loader2 className="w-5 h-5 animate-spin text-[#818CF8] mb-1" />
                    <span className="text-[9px] font-semibold text-white/90">Uploading...</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 mb-1 text-[#F5F7FB]" />
                    <span className="text-[10px] font-semibold text-white/90">Change</span>
                  </div>
                )}
                {isDragging && !isUploadingPhoto && (
                  <div className="absolute inset-0 rounded-full bg-[#6366F1]/80 flex items-center justify-center text-white text-[10px] font-bold tracking-wide">
                    Drop Here
                  </div>
                )}
              </div>

              {/* Action tabs: Gallery, Google Drive, Presets */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-[#0D131C] border border-slate-200 dark:border-white/[0.06] mt-1">
                <button
                  type="button"
                  id="btn-tab-upload-gallery"
                  onClick={handleTriggerGallery}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'upload'
                      ? 'bg-[#5B5CE2] text-white shadow-sm'
                      : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F5F7FB] hover:bg-white dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Gallery</span>
                </button>

                <button
                  type="button"
                  id="btn-tab-google-drive"
                  onClick={() => {
                    setActiveTab('drive');
                    setFeedback(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'drive'
                      ? 'bg-[#5B5CE2] text-white shadow-sm'
                      : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F5F7FB] hover:bg-white dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Google Drive</span>
                </button>

                <button
                  type="button"
                  id="btn-tab-presets"
                  onClick={() => {
                    setActiveTab('presets');
                    setFeedback(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'presets'
                      ? 'bg-[#5B5CE2] text-white shadow-sm'
                      : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F5F7FB] hover:bg-white dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Presets</span>
                </button>
              </div>
            </div>

            {/* Sub-panel based on active tab */}
            {activeTab === 'upload' && (
              <div className="w-full text-center">
                <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                  Click the photo or "Gallery" to upload from your local photos/gallery, or drag & drop directly (JPG, PNG, WebP up to 15MB).
                </p>
              </div>
            )}

            {activeTab === 'drive' && (
              <div className="w-full p-3 rounded-xl bg-slate-100 dark:bg-[#0D131C] border border-slate-200 dark:border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-[#F5F7FB]">
                    <HardDrive className="w-3.5 h-3.5 text-[#6366F1]" />
                    <span>Import from Google Drive / Cloud Link</span>
                  </div>
                  <a
                    href="https://drive.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-[#6366F1] dark:text-[#818CF8] hover:underline"
                    title="Open Google Drive in new tab"
                  >
                    <span>Open Drive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex gap-2">
                  <input
                    id="input-google-drive-url"
                    type="url"
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    placeholder="Paste Google Drive link (e.g. drive.google.com/file/d/...)"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#141D2A] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-[#F5F7FB] placeholder-slate-400 dark:placeholder-[#64748B] focus:outline-none focus:border-[#5B5CE2]"
                  />
                  <button
                    type="button"
                    id="btn-apply-drive-image"
                    onClick={handleApplyDriveUrl}
                    disabled={!driveUrl.trim() || isLoadingDrive}
                    className="px-3 py-1.5 rounded-lg bg-[#5B5CE2] hover:bg-[#4E4FD1] disabled:opacity-50 text-xs font-semibold text-white transition-colors"
                  >
                    {isLoadingDrive ? 'Loading...' : 'Import'}
                  </button>
                </div>
                <p className="text-[10.5px] text-slate-500 dark:text-[#64748B] leading-tight">
                  Supports Google Drive links (e.g., <code className="text-[#6366F1] dark:text-[#818CF8]">drive.google.com/file/d/...</code>) and web URLs. Ensure file sharing in Google Drive is set to "Anyone with the link can view".
                </p>
              </div>
            )}

            {activeTab === 'presets' && (
              <div className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-[#0D131C] border border-slate-200 dark:border-white/[0.08]">
                <span className="text-[11px] font-medium text-slate-600 dark:text-[#94A3B8] block mb-2 text-center">
                  Select a ready RPG character avatar:
                </span>
                <div className="flex items-center justify-center gap-2.5 flex-wrap">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.url)}
                      title={preset.name}
                      className={`relative rounded-full p-0.5 transition-all ${
                        avatarUrl === preset.url
                          ? 'ring-2 ring-[#6366F1] scale-110 shadow-md shadow-[#6366F1]/30'
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {avatarUrl === preset.url && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#6366F1] text-white flex items-center justify-center text-[9px]">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback alert (Error or Success) */}
            {feedback && (
              <div
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                  feedback.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span className="flex-1">{feedback.message}</span>
              </div>
            )}

            {/* Reset to default avatar if changed */}
            {avatarUrl !== profile.avatarUrl && (
              <button
                type="button"
                onClick={handleResetAvatar}
                className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-[#94A3B8] hover:text-slate-800 dark:hover:text-[#F5F7FB] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to current saved photo</span>
              </button>
            )}
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-[#94A3B8] mb-1.5">
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={40}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#141D2A] border border-slate-300 dark:border-white/10 text-sm text-slate-900 dark:text-[#F5F7FB] placeholder-slate-400 dark:placeholder-[#64748B] focus:outline-none focus:border-[#5B5CE2] focus:ring-1 focus:ring-[#5B5CE2] transition-colors"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-[#94A3B8] mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 dark:text-[#64748B]">
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
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-[#141D2A] border border-slate-300 dark:border-white/10 text-sm text-slate-900 dark:text-[#F5F7FB] placeholder-slate-400 dark:placeholder-[#64748B] focus:outline-none focus:border-[#5B5CE2] focus:ring-1 focus:ring-[#5B5CE2] transition-colors"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-[#94A3B8]">Bio</label>
              <span className="text-[11px] text-slate-400 dark:text-[#64748B]">
                {bio.length}/120
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={120}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#141D2A] border border-slate-300 dark:border-white/10 text-sm text-slate-900 dark:text-[#F5F7FB] placeholder-slate-400 dark:placeholder-[#64748B] focus:outline-none focus:border-[#5B5CE2] focus:ring-1 focus:ring-[#5B5CE2] transition-colors resize-none"
            />
          </div>

          {/* Email (Read only notice) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-[#94A3B8] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#141D2A]/50 border border-slate-200 dark:border-white/[0.06] text-sm text-slate-400 dark:text-[#64748B] cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-400 dark:text-[#64748B] mt-1.5">
              To change your email, please contact support.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#141D2A] dark:hover:bg-[#1A2536] border border-slate-200 dark:border-white/10 text-xs md:text-sm font-medium text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F5F7FB] transition-colors"
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
      <div className="relative w-full max-w-[460px] bg-white dark:bg-[#101722] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl z-10 text-left transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-500 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 dark:text-[#94A3B8] hover:text-slate-700 dark:hover:text-[#F5F7FB] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-[#F5F7FB] tracking-tight">
            Delete your account?
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] mt-2 leading-relaxed">
            This action cannot be undone. This will permanently delete your account and all your data from LifeRPG.
          </p>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-slate-700 dark:text-[#94A3B8] mb-1.5">
            Type <span className="text-rose-500 font-bold">DELETE</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder="DELETE"
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#141D2A] border border-slate-300 dark:border-white/10 text-sm text-slate-900 dark:text-[#F5F7FB] placeholder-slate-400 dark:placeholder-[#64748B] focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#141D2A] dark:hover:bg-[#1A2536] border border-slate-200 dark:border-white/10 text-xs sm:text-sm font-medium text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F5F7FB] transition-colors"
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
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md cursor-pointer'
                : 'bg-rose-500/20 text-rose-400/50 cursor-not-allowed'
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
      <div className="relative w-full max-w-[460px] bg-white dark:bg-[#101722] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl z-10 transition-colors">
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/[0.08]">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-[#F5F7FB]">Change Password</h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
              Keep your LifeRPG account safe with a strong password.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 dark:text-[#94A3B8] hover:text-slate-700 dark:hover:text-[#F5F7FB]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-500">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-[#94A3B8] mb-1.5">
              Current password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#141D2A] border border-slate-300 dark:border-white/10 text-sm text-slate-900 dark:text-[#F5F7FB] focus:outline-none focus:border-[#5B5CE2]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-[#94A3B8] mb-1.5">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#141D2A] border border-slate-300 dark:border-white/10 text-sm text-slate-900 dark:text-[#F5F7FB] focus:outline-none focus:border-[#5B5CE2]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-[#94A3B8] mb-1.5">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#141D2A] border border-slate-300 dark:border-white/10 text-sm text-slate-900 dark:text-[#F5F7FB] focus:outline-none focus:border-[#5B5CE2]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#141D2A] dark:hover:bg-[#1A2536] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F5F7FB]"
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
      <div className="relative w-full max-w-[500px] bg-white dark:bg-[#101722] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl z-10 transition-colors">
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/[0.08]">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-[#F5F7FB]">Active Sessions</h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
              Devices currently signed in to your account.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 dark:text-[#94A3B8] hover:text-slate-700 dark:hover:text-[#F5F7FB]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/[0.06] pt-3 max-h-[60vh] overflow-y-auto">
          {mockSessions.map((session) => (
            <div key={session.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#141D2A] flex items-center justify-center text-[#6366F1] dark:text-[#818CF8]">
                  {session.device.includes('iPhone') ? (
                    <Smartphone className="w-4 h-4" />
                  ) : (
                    <Laptop className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-[#F5F7FB]">
                      {session.device}
                    </span>
                    {session.current && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-[#22C55E] font-medium border border-emerald-500/30">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-[#64748B]">
                    {session.location} • {session.lastActive}
                  </p>
                </div>
              </div>

              {!session.current && (
                <button
                  type="button"
                  onClick={() => onRevoke(session.id)}
                  className="text-xs text-rose-500 hover:underline"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#141D2A] dark:hover:bg-[#1A2536] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-[#F5F7FB]"
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
      <div className="relative w-full max-w-[500px] bg-white dark:bg-[#101722] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl z-10 transition-colors">
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08]">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-[#F5F7FB]">How Your Data Is Used</h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">Privacy principles at LifeRPG.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 dark:text-[#94A3B8] hover:text-slate-700 dark:hover:text-[#F5F7FB]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="pt-4 space-y-3 text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
          <p>
            <strong className="text-slate-900 dark:text-[#F5F7FB]">Zero Ad Targeting:</strong> LifeRPG never sells your habit, quest, or calendar data to third parties or advertising networks.
          </p>
          <p>
            <strong className="text-slate-900 dark:text-[#F5F7FB]">End-to-End Encryption:</strong> Sensitive integration tokens (e.g. Google Calendar OAuth) are encrypted at rest using AES-256.
          </p>
          <p>
            <strong className="text-slate-900 dark:text-[#F5F7FB]">AI Coach Boundaries:</strong> Your chat conversations are processed solely to assist your productivity. They are not used to train foundational AI models.
          </p>
        </div>
        <div className="flex justify-end pt-5 border-t border-slate-200 dark:border-white/[0.08]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-[#5B5CE2] hover:bg-[#4E4FD1] text-xs font-semibold text-white">
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
      <div className="relative w-full max-w-[460px] bg-white dark:bg-[#101722] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl z-10 transition-colors">
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08]">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-[#F5F7FB]">Download Your Data</h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">Export a full archive of your LifeRPG records.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 dark:text-[#94A3B8] hover:text-slate-700 dark:hover:text-[#F5F7FB]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="pt-4 text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed space-y-2">
          <p>Your archive contains:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-800 dark:text-[#F5F7FB]">
            <li>Profile metadata & security audit logs</li>
            <li>Completed quests, tasks & deadlines</li>
            <li>Habit streaks, MP history & achievements</li>
            <li>AI Coach conversations & notes</li>
          </ul>
        </div>
        <div className="flex justify-end gap-3 pt-5 border-t border-slate-200 dark:border-white/[0.08]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#141D2A] text-xs font-medium text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-white/10">
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
