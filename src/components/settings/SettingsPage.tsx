import React, { useState } from 'react';
import {
  Search,
  Moon,
  Sun,
  Bell,
  Menu,
} from 'lucide-react';
import {
  SettingsTabId,
  UserSettingsProfile,
  AppearanceSettings as AppearanceSettingsType,
  NotificationSettings as NotificationSettingsType,
  PreferenceSettings as PreferenceSettingsType,
  SecuritySettings as SecuritySettingsType,
} from '../../types';
import {
  initialUserProfile,
  initialNotificationSettings,
  initialPreferenceSettings,
  initialSecuritySettings,
} from '../../data/settingsMockData';
import { getStoredAppearance, applyAppearanceToDOM } from '../../utils/appearanceManager';
import { SettingsTabs } from './SettingsTabs';
import { AccountSettings } from './AccountSettings';
import { AppearanceSettings } from './AppearanceSettings';
import { NotificationSettings } from './NotificationSettings';
import { PrivacySettings } from './PrivacySettings';
import { ConnectedAppsSettings } from './ConnectedAppsSettings';
import { PreferencesSettings } from './PreferencesSettings';
import { SecuritySettings } from './SecuritySettings';
import {
  EditProfileModal,
  DeleteAccountModal,
  ChangePasswordModal,
  ActiveSessionsModal,
  DataUsageModal,
  DownloadDataModal,
} from './SettingsModals';
import { ToastSystem, ToastMessage } from './ToastSystem';
import { AuthUser } from '../../types';

interface SettingsPageProps {
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenMobileMenu?: () => void;
  currentUser?: AuthUser | null;
  onOpenAuthModal?: (screen: 'login' | 'signup' | 'guest_prompt') => void;
  onLogout?: () => void;
  appearance?: AppearanceSettingsType;
  onUpdateAppearance?: (newSettings: Partial<AppearanceSettingsType>) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  isDark,
  setIsDark,
  onOpenMobileMenu,
  currentUser,
  onOpenAuthModal,
  onLogout,
  appearance: propAppearance,
  onUpdateAppearance: propOnUpdateAppearance,
}) => {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<SettingsTabId>('account');
  const [showSecurityView, setShowSecurityView] = useState<boolean>(false);

  // Core settings states
  const [profile, setProfile] = useState<UserSettingsProfile>(initialUserProfile);
  const [localAppearance, setLocalAppearance] = useState<AppearanceSettingsType>(getStoredAppearance);
  const appearance = propAppearance || localAppearance;

  const [notifications, setNotifications] = useState<NotificationSettingsType>(initialNotificationSettings);
  const [preferences, setPreferences] = useState<PreferenceSettingsType>(initialPreferenceSettings);
  const [security, setSecurity] = useState<SecuritySettingsType>(initialSecuritySettings);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isActiveSessionsOpen, setIsActiveSessionsOpen] = useState(false);
  const [isDataUsageOpen, setIsDataUsageOpen] = useState(false);
  const [isDownloadDataOpen, setIsDownloadDataOpen] = useState(false);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Toasts state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateProfile = (updated: Partial<UserSettingsProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
    addToast('Profile updated successfully.', 'success');
  };

  const handleUpdateAppearance = (newSettings: Partial<AppearanceSettingsType>) => {
    if (propOnUpdateAppearance) {
      propOnUpdateAppearance(newSettings);
    } else {
      setLocalAppearance((prev) => {
        const next = { ...prev, ...newSettings };
        applyAppearanceToDOM(next);
        return next;
      });
    }
    addToast('Appearance preferences saved.', 'success');
  };

  const handleHeaderThemeToggle = () => {
    const nextDark = !isDark;
    const nextTheme: 'light' | 'dark' = nextDark ? 'dark' : 'light';
    handleUpdateAppearance({ theme: nextTheme });
    setIsDark(nextDark);
  };

  const handleToggleNotification = (key: keyof NotificationSettingsType) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      addToast(
        `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${
          next[key] ? 'enabled' : 'disabled'
        }.`,
        'success'
      );
      return next;
    });
  };

  const handleUpdatePreferences = (newPrefs: Partial<PreferenceSettingsType>) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
    addToast('Preferences updated.', 'success');
  };

  const handleUpdateSecurity = (newSec: Partial<SecuritySettingsType>) => {
    setSecurity((prev) => ({ ...prev, ...newSec }));
    addToast('Security settings updated.', 'success');
  };

  const handleDownloadData = () => {
    const dataBlob = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            profile,
            appearance,
            notifications,
            preferences,
            security,
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `liferpg-data-export-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Your data export has downloaded.', 'success');
  };

  const handleDeleteAccount = () => {
    addToast('Account scheduled for deletion.', 'error');
  };

  return (
    <div className="flex-1 min-h-screen bg-[#F8FAFC] dark:bg-[#070B14] text-slate-900 dark:text-[#F8FAFF] pb-24 lg:pb-12 transition-colors">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#070B14]/85 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.06] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-[#9AA7BD] hover:text-slate-900 dark:hover:text-[#F8FAFF] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Search bar */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 dark:text-[#6F7C93] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything... (e.g. how to stay consistent?)"
              className="w-full bg-slate-100 dark:bg-[#101827] border border-slate-200 dark:border-white/[0.08] rounded-xl pl-9 pr-12 py-2 text-xs md:text-sm text-slate-900 dark:text-[#F8FAFF] placeholder-slate-400 dark:placeholder-[#6F7C93] focus:outline-none transition-all"
              style={{ '--tw-ring-color': 'var(--accent-color)' } as React.CSSProperties}
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-[#6F7C93] bg-white dark:bg-[#141D2E] border border-slate-200 dark:border-white/10 rounded absolute right-3 top-1/2 -translate-y-1/2">
              ⌘ K
            </kbd>
          </div>
        </div>

        {/* Right Header Icons */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={handleHeaderThemeToggle}
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#101827] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-[#9AA7BD] hover:text-slate-900 dark:hover:text-[#F8FAFF] transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notification Bell */}
          <button
            type="button"
            className="relative p-2 rounded-xl bg-slate-100 dark:bg-[#101827] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-[#9AA7BD] hover:text-slate-900 dark:hover:text-[#F8FAFF] transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F04452]" />
          </button>

          {/* User Profile Avatar */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('account');
              setShowSecurityView(false);
            }}
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C63FF] to-[#8B7CFF] flex items-center justify-center text-white text-xs font-bold shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            A
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-8 space-y-6">
        {/* Page Title & Quote Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 dark:text-[#F8FAFF] tracking-tight leading-tight">
              Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9AA7BD] mt-1">
              Manage your account, preferences, and everything else.
            </p>
          </div>

          {/* Optional quote matching Figma reference screenshot */}
          <div className="hidden md:block text-right">
            <p className="text-xs italic text-slate-400 dark:text-[#9AA7BD]/90 font-serif tracking-wide">
              “A better you,
              <br />
              starts with the right settings.”
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <SettingsTabs
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setShowSecurityView(false);
          }}
        />

        {/* Tab Content Display */}
        <div className="pt-2">
          {showSecurityView ? (
            <SecuritySettings
              security={security}
              onUpdateSecurity={handleUpdateSecurity}
              onOpenChangePassword={() => setIsChangePasswordOpen(true)}
              onOpenManageSessions={() => setIsActiveSessionsOpen(true)}
              onBackToAccount={() => setShowSecurityView(false)}
            />
          ) : (
            <>
              {activeTab === 'account' && (
                <AccountSettings
                  profile={profile}
                  currentUser={currentUser}
                  onOpenEditProfile={() => setIsEditProfileOpen(true)}
                  onOpenChangePassword={() => setIsChangePasswordOpen(true)}
                  onOpenSecurity={() => setShowSecurityView(true)}
                  onOpenManageData={() => setIsDownloadDataOpen(true)}
                  onOpenConnectedApps={() => setActiveTab('connected-apps')}
                  onOpenFeedback={() =>
                    addToast('Feedback portal will open soon. Thank you!', 'success')
                  }
                  onOpenHelp={() =>
                    addToast('Support documentation opened in help drawer.', 'success')
                  }
                  onOpenAuthModal={onOpenAuthModal}
                  onLogout={onLogout}
                />
              )}

              {activeTab === 'appearance' && (
                <AppearanceSettings
                  settings={appearance}
                  onUpdateSettings={handleUpdateAppearance}
                  isDark={isDark}
                  setIsDark={setIsDark}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationSettings
                  notifications={notifications}
                  onToggleNotification={handleToggleNotification}
                />
              )}

              {activeTab === 'privacy' && (
                <PrivacySettings
                  onOpenDataUsage={() => setIsDataUsageOpen(true)}
                  onOpenDownloadData={() => setIsDownloadDataOpen(true)}
                  onOpenDeleteAccount={() => setIsDeleteAccountOpen(true)}
                />
              )}

              {activeTab === 'connected-apps' && (
                <ConnectedAppsSettings onNotify={addToast} />
              )}

              {activeTab === 'preferences' && (
                <PreferencesSettings
                  preferences={preferences}
                  onUpdatePreferences={handleUpdatePreferences}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={profile}
        onSave={handleUpdateProfile}
      />

      <DeleteAccountModal
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        onConfirmDelete={handleDeleteAccount}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSuccess={() => addToast('Password changed successfully.', 'success')}
      />

      <ActiveSessionsModal
        isOpen={isActiveSessionsOpen}
        onClose={() => setIsActiveSessionsOpen(false)}
        onRevoke={(id) => addToast(`Session ${id} revoked.`, 'success')}
      />

      <DataUsageModal
        isOpen={isDataUsageOpen}
        onClose={() => setIsDataUsageOpen(false)}
      />

      <DownloadDataModal
        isOpen={isDownloadDataOpen}
        onClose={() => setIsDownloadDataOpen(false)}
        onDownload={handleDownloadData}
      />

      {/* Toast Notification Container */}
      <ToastSystem toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
