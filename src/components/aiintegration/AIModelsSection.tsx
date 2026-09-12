import React, { useState } from 'react';
import { Bot, Check, ArrowRight, Loader2, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { AIIntegrationModel } from '../../types';
import { ChatGPTLogo, ClaudeLogo, GeminiLogo } from './ModelLogos';

interface AIModelsSectionProps {
  models: AIIntegrationModel[];
  onSelectModel: (id: string) => void;
  onConnectModel: (id: string) => void;
  onManageModel: (id: string) => void;
  onOpenCompare: () => void;
  onSyncModels?: () => void;
  isSyncing?: boolean;
  lastSyncedTime?: string | null;
}

export const AIModelsSection: React.FC<AIModelsSectionProps> = ({
  models,
  onSelectModel,
  onConnectModel,
  onManageModel,
  onOpenCompare,
  onSyncModels,
  isSyncing = false,
  lastSyncedTime,
}) => {
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleConnectClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConnectingId(id);
    setTimeout(() => {
      onConnectModel(id);
      setConnectingId(null);
    }, 450);
  };

  const renderLogo = (iconType: AIIntegrationModel['iconType']) => {
    switch (iconType) {
      case 'chatgpt':
        return <ChatGPTLogo className="w-11 h-11" />;
      case 'claude':
        return <ClaudeLogo className="w-11 h-11" />;
      case 'gemini':
        return <GeminiLogo className="w-11 h-11" />;
    }
  };

  return (
    <section className="bg-[#101722] border border-white/[0.08] rounded-2xl p-6 md:p-7 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#201B4B] border border-[#6366F1]/30 flex items-center justify-center text-[#818CF8] shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg md:text-[19px] font-bold text-[#F5F7FB] tracking-tight">
                AI Models
              </h2>
              {lastSyncedTime && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  Synced {lastSyncedTime}
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-[#94A3B8]">
              Pick and synchronize the AI models you want active in your AI Coach.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {onSyncModels && (
            <button
              type="button"
              onClick={onSyncModels}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#182335] hover:bg-[#202E44] border border-white/10 text-xs font-semibold text-[#F5F7FB] transition-all hover:border-white/20 active:scale-95 disabled:opacity-60 shadow-sm"
              title="Sync AI model credentials, latency, and connection states"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#818CF8] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Models'}</span>
            </button>
          )}

          <button
            onClick={onOpenCompare}
            className="inline-flex items-center gap-1.5 text-xs md:text-sm font-medium text-[#818CF8] hover:text-[#A5B4FC] transition-colors group"
          >
            <span>Compare models</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {models.map((model) => {
          const isSelected = model.selected;
          const isConnected = model.status === 'connected';
          const isConnecting = connectingId === model.id;

          return (
            <div
              key={model.id}
              onClick={() => {
                if (isConnected) {
                  onSelectModel(model.id);
                }
              }}
              className={`relative flex flex-col justify-between rounded-xl p-5 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-[#101722] border-2 border-[#5B5CE2] shadow-[0_0_24px_rgba(99,102,241,0.22)]'
                  : 'bg-[#101722] border border-white/[0.08] hover:border-white/20 hover:-translate-y-0.5 hover:shadow-md'
              }`}
            >
              {/* Selected Checkmark Badge */}
              {isSelected && (
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#5B5CE2] text-white text-[10px] font-bold shadow-sm ring-2 ring-[#101722]">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>ACTIVE COACH</span>
                </div>
              )}

              <div>
                {/* Top Row: Icon + Name + Status */}
                <div className="flex items-center gap-3.5 mb-3 pr-2">
                  {renderLogo(model.iconType)}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#F5F7FB] truncate">
                        {model.name}
                      </h3>
                      {model.modelTier && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.06] text-[#94A3B8] border border-white/[0.05]">
                          {model.modelTier.split(' ')[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isConnected ? 'bg-[#22C55E]' : 'bg-[#64748B]'
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            isConnected ? 'text-[#22C55E]' : 'text-[#94A3B8]'
                          }`}
                        >
                          {isConnected ? 'Connected' : 'Not connected'}
                        </span>
                      </div>

                      {isConnected && model.latencyMs && (
                        <span className="text-[10px] font-mono text-[#64748B] flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5 text-[#F59E0B]" />
                          {model.latencyMs}ms
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account / Tier subtitle if connected */}
                {isConnected && (
                  <div className="mb-3 px-2.5 py-1 rounded bg-[#141D2A] border border-white/[0.05] flex items-center justify-between text-[11px] text-[#94A3B8]">
                    <span className="truncate">{model.accountEmail || model.modelTier || 'Active Session'}</span>
                    <span className="text-[#34D399] font-medium text-[10px] flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-3 h-3" />
                      Synced
                    </span>
                  </div>
                )}

                {/* Description */}
                <p className="text-xs md:text-sm text-[#94A3B8] leading-relaxed mb-4 min-h-[40px]">
                  {model.description}
                </p>

                {/* Capability Chips */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {model.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#141D2A] text-[#94A3B8] border border-white/[0.06]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action Button */}
              <div>
                {isConnected ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onManageModel(model.id);
                    }}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#141D2A] hover:bg-[#1A2536] border border-white/10 text-xs md:text-sm font-medium text-[#F5F7FB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B5CE2]"
                  >
                    Manage Connection
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isConnecting}
                    onClick={(e) => handleConnectClick(e, model.id)}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#5B5CE2]/15 hover:bg-[#5B5CE2]/25 border border-[#5B5CE2]/30 text-xs md:text-sm font-semibold text-[#A5B4FC] hover:text-white transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#5B5CE2]"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#818CF8]" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <span>Connect & Login</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
