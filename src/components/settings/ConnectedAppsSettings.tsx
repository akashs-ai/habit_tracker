import React, { useState } from 'react';
import { Sparkles, Calendar } from 'lucide-react';

interface ConnectedAppsSettingsProps {
  onNotify: (msg: string, type: 'success' | 'error') => void;
}

interface AppItem {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'not_connected';
  type: 'calendar' | 'chatgpt' | 'claude' | 'gemini';
}

export const ConnectedAppsSettings: React.FC<ConnectedAppsSettingsProps> = ({
  onNotify,
}) => {
  const [apps, setApps] = useState<AppItem[]>([
    {
      id: 'gcal',
      name: 'Google Calendar',
      description: 'Connect your calendar to give better suggestions.',
      status: 'connected',
      type: 'calendar',
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      description: 'Use ChatGPT in AI Coach.',
      status: 'connected',
      type: 'chatgpt',
    },
    {
      id: 'claude',
      name: 'Claude',
      description: 'Use Claude in AI Coach.',
      status: 'not_connected',
      type: 'claude',
    },
    {
      id: 'gemini',
      name: 'Gemini',
      description: 'Use Gemini in AI Coach.',
      status: 'not_connected',
      type: 'gemini',
    },
  ]);

  const toggleConnection = (appId: string) => {
    setApps((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const newStatus = app.status === 'connected' ? 'not_connected' : 'connected';
          if (newStatus === 'connected') {
            onNotify(`${app.name} connected successfully.`, 'success');
          } else {
            onNotify(`${app.name} disconnected.`, 'success');
          }
          return { ...app, status: newStatus };
        }
        return app;
      })
    );
  };

  const renderIcon = (type: AppItem['type']) => {
    switch (type) {
      case 'calendar':
        return (
          <div className="w-11 h-11 rounded-xl bg-[#1E293B] border border-white/10 flex items-center justify-center text-[#3B82F6] font-bold text-sm shadow-inner shrink-0">
            <span className="font-mono text-base tracking-tighter text-[#60A5FA]">31</span>
          </div>
        );
      case 'chatgpt':
        return (
          <div className="w-11 h-11 rounded-xl bg-[#10A37F]/10 border border-[#10A37F]/30 flex items-center justify-center text-[#10A37F] shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.5 10.2a5.5 5.5 0 0 0-.4-3.8 5.6 5.6 0 0 0-4.7-2.9 5.8 5.8 0 0 0-2.3.5 5.6 5.6 0 0 0-4.3-2 5.5 5.5 0 0 0-5 3.3 5.6 5.6 0 0 0-2.2 4.3c0 .8.2 1.6.5 2.3a5.5 5.5 0 0 0 .4 3.8 5.6 5.6 0 0 0 4.7 2.9c.8 0 1.5-.2 2.3-.5a5.6 5.6 0 0 0 4.3 2 5.5 5.5 0 0 0 5-3.3c.9-.3 1.7-.9 2.2-1.7a5.6 5.6 0 0 0 .5-4.4zM12 13.6l-3.3 1.9a2.3 2.3 0 0 1-1.1.3c-.6 0-1.2-.2-1.6-.6a2.4 2.4 0 0 1-.9-1.5 2.3 2.3 0 0 1 .4-1.7l1.9-3.3-1.9-1.1a2.3 2.3 0 0 1-.9-1.5c0-.6.2-1.2.6-1.6.4-.4 1-.7 1.6-.7.4 0 .8.1 1.1.3l5.2 3v2.2L12 13.6zm1.1 5.3c-.4.2-.8.3-1.2.3-.6 0-1.2-.2-1.6-.6a2.4 2.4 0 0 1-.9-1.5v-3.8l3.3 1.9v3.7h.4zm-2.2-6.5l-3.3-1.9 3.3-1.9 3.3 1.9-3.3 1.9zm4.4 5.3a2.3 2.3 0 0 1-1.1-.3l-3.3-1.9v-2.2l5.2-3c.4-.2.8-.3 1.2-.3.6 0 1.2.2 1.6.6.4.4.7 1 .7 1.6 0 .6-.2 1.2-.6 1.6l-4.8 3.9zm2.2-6.5l-1.9-1.1 1.9-3.3c.3-.5.4-1.1.4-1.7 0-.6-.3-1.2-.7-1.6a2.3 2.3 0 0 0-1.6-.6c-.4 0-.8.1-1.1.3l-5.2 3v2.2l3.3 1.9 5-3.1v1.1l-.1.9z" />
            </svg>
          </div>
        );
      case 'claude':
        return (
          <div className="w-11 h-11 rounded-xl bg-[#D97706]/10 border border-[#D97706]/30 flex items-center justify-center text-[#D97706] shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3m15.364-6.364l-12.728 12.728m0-12.728l12.728 12.728" />
            </svg>
          </div>
        );
      case 'gemini':
        return (
          <div className="w-11 h-11 rounded-xl bg-[#6366F1]/15 border border-[#6366F1]/30 flex items-center justify-center text-[#818CF8] shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-[#101722] border border-white/[0.08] rounded-2xl p-6 md:p-7 shadow-sm">
        {/* Header */}
        <div className="pb-6 border-b border-white/[0.06]">
          <h2 className="text-lg md:text-[19px] font-bold text-[#F5F7FB] tracking-tight">
            Connected Apps
          </h2>
          <p className="text-xs md:text-sm text-[#94A3B8] mt-0.5">
            Connect tools to get a better, more personalized experience.
          </p>
        </div>

        {/* List of Apps */}
        <div className="divide-y divide-white/[0.06]">
          {apps.map((app) => {
            const isConnected = app.status === 'connected';

            return (
              <div
                key={app.id}
                className="py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-5"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {renderIcon(app.type)}
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#F5F7FB] truncate">
                      {app.name}
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      {app.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:self-center justify-between sm:justify-end shrink-0 pl-15 sm:pl-0">
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isConnected
                          ? 'bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                          : 'bg-[#64748B]'
                      }`}
                    />
                    <span
                      className={
                        isConnected ? 'text-[#22C55E]' : 'text-[#64748B]'
                      }
                    >
                      {isConnected ? 'Connected' : 'Not connected'}
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={() => toggleConnection(app.id)}
                    className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-colors ${
                      isConnected
                        ? 'bg-[#141D2A] hover:bg-[#1A2536] border border-white/10 text-[#F5F7FB]'
                        : 'bg-[#5B5CE2] hover:bg-[#4E4FD1] text-white shadow-xs'
                    }`}
                  >
                    {isConnected ? 'Manage' : 'Connect'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
