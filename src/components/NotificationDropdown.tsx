import React from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  X, 
  Calendar, 
  Sparkles, 
  Award, 
  UserPlus, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNavigateToTab,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderIcon = (notif: AppNotification) => {
    switch (notif.type) {
      case 'calendar':
        return <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
      case 'level':
        return <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      case 'quest':
        return <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />;
      case 'friend':
        return <UserPlus className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />;
    }
  };

  const handleAction = (notif: AppNotification) => {
    onMarkAsRead(notif.id);
    if (notif.type === 'calendar' && onNavigateToTab) {
      onNavigateToTab('calendar');
      onClose();
    } else if (notif.type === 'quest' && onNavigateToTab) {
      onNavigateToTab('dashboard');
      onClose();
    } else if (notif.type === 'friend' && onNavigateToTab) {
      onNavigateToTab('friends');
      onClose();
    }
  };

  return (
    <div
      id="notification-dropdown-panel"
      className="absolute right-0 top-full mt-2 w-[340px] sm:w-[390px] max-w-[90vw] rounded-2xl bg-white dark:bg-[#121620] border border-slate-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 dark:border-white/8 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
          {unreadCount > 0 ? (
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-[#7C6CFF]/15 text-[#7C6CFF] border border-[#7C6CFF]/30">
              {unreadCount} new
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-[#A6AEC0]">
              All caught up
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-[#A6AEC0] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
              <span className="text-[11px] hidden sm:inline">Mark read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-xs cursor-pointer"
              title="Clear all notifications"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close notifications"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.05]">
        {notifications.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
              <Bell className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No notifications</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              You're all caught up with your daily habits, quests, and calendar updates.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onMarkAsRead(notif.id)}
              className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                notif.read
                  ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-white/[0.02] opacity-80 hover:opacity-100'
                  : 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30'
              }`}
            >
              {/* Type Icon */}
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/60 dark:border-white/5">
                {renderIcon(notif)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 dark:text-[#8892B0] shrink-0 font-medium">
                    {notif.timeAgo}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-[#A6AEC0] mt-1 line-clamp-2 leading-relaxed">
                  {notif.description}
                </p>

                {/* Optional Action Button */}
                {notif.actionLabel && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(notif);
                    }}
                    className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#7C6CFF]/15 hover:bg-[#7C6CFF]/25 text-[#7C6CFF] dark:text-[#A297FF] border border-[#7C6CFF]/20 transition-colors cursor-pointer"
                  >
                    <span>{notif.actionLabel}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Unread indicator dot */}
              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-[#7C6CFF] shrink-0 mt-1.5 ring-2 ring-white dark:ring-[#121620]" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-white/8 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between text-[11px] text-slate-500 dark:text-[#8892B0]">
          <span>Synced with your LifeRPG progression</span>
          <button
            onClick={() => {
              if (onNavigateToTab) onNavigateToTab('settings');
              onClose();
            }}
            className="text-[#7C6CFF] hover:underline font-semibold cursor-pointer"
          >
            Preferences
          </button>
        </div>
      )}
    </div>
  );
};
