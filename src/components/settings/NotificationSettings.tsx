import React from 'react';
import {
  Bell,
  Mail,
  CheckSquare,
  Target,
  Users,
  Sparkles,
} from 'lucide-react';
import { NotificationSettings as NotificationSettingsType } from '../../types';

interface NotificationSettingsProps {
  notifications: NotificationSettingsType;
  onToggleNotification: (key: keyof NotificationSettingsType) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  notifications,
  onToggleNotification,
}) => {
  const notificationRows: {
    key: keyof NotificationSettingsType;
    title: string;
    description: string;
    icon: React.ElementType;
  }[] = [
    {
      key: 'pushNotifications',
      title: 'Push notifications',
      description: 'Get notified about important updates, reminders, and activity.',
      icon: Bell,
    },
    {
      key: 'emailNotifications',
      title: 'Email notifications',
      description: 'Receive updates, summaries, and recommendations via email.',
      icon: Mail,
    },
    {
      key: 'taskReminders',
      title: 'Task reminders',
      description: 'Get reminded about your tasks and deadlines.',
      icon: CheckSquare,
    },
    {
      key: 'goalUpdates',
      title: 'Goal updates',
      description: 'Receive progress updates on your goals.',
      icon: Target,
    },
    {
      key: 'friendActivity',
      title: 'Friend activity',
      description: 'Get notified when friends achieve milestones.',
      icon: Users,
    },
    {
      key: 'productUpdates',
      title: 'Product updates',
      description: 'Be the first to know about new features and improvements.',
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="bg-[#101722] border border-white/[0.08] rounded-2xl p-6 md:p-7 shadow-sm">
        {/* Header */}
        <div className="pb-6 border-b border-white/[0.06]">
          <h2 className="text-lg md:text-[19px] font-bold text-[#F5F7FB] tracking-tight">
            Notifications
          </h2>
          <p className="text-xs md:text-sm text-[#94A3B8] mt-0.5">
            Stay updated with what matters.
          </p>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.06]">
          {notificationRows.map((row) => {
            const Icon = row.icon;
            const isEnabled = notifications[row.key];

            return (
              <div
                key={row.key}
                className="py-4 sm:py-5 flex items-center justify-between gap-4 first:pt-5"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#141D2A] flex items-center justify-center text-[#818CF8] shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#F5F7FB] truncate">
                      {row.title}
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-0.5 line-clamp-1 sm:line-clamp-none">
                      {row.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isEnabled}
                  onClick={() => onToggleNotification(row.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5B5CE2] ${
                    isEnabled ? 'bg-[#5B5CE2]' : 'bg-[#334155]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
