import React, { useState } from 'react';
import { Bot, Check, ArrowRight, Loader2 } from 'lucide-react';
import { AIIntegrationModel } from '../../types';
import { ChatGPTLogo, ClaudeLogo, GeminiLogo } from './ModelLogos';

interface AIModelsSectionProps {
  models: AIIntegrationModel[];
  onSelectModel: (id: string) => void;
  onConnectModel: (id: string) => void;
  onManageModel: (id: string) => void;
  onOpenCompare: () => void;
}

export const AIModelsSection: React.FC<AIModelsSectionProps> = ({
  models,
  onSelectModel,
  onConnectModel,
  onManageModel,
  onOpenCompare,
}) => {
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleConnectClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConnectingId(id);
    setTimeout(() => {
      onConnectModel(id);
      setConnectingId(null);
    }, 850);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#201B4B] border border-[#6366F1]/30 flex items-center justify-center text-[#818CF8] shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg md:text-[19px] font-bold text-[#F5F7FB] tracking-tight">
              AI Models
            </h2>
            <p className="text-xs md:text-sm text-[#94A3B8]">
              Pick the AI model you want to use in AI Coach.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCompare}
          className="inline-flex items-center gap-1.5 text-xs md:text-sm font-medium text-[#818CF8] hover:text-[#A5B4FC] transition-colors self-start sm:self-auto group"
        >
          <span>Compare models</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
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
                <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[#5B5CE2] flex items-center justify-center text-white shadow-sm ring-2 ring-[#101722]">
                  <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                </div>
              )}

              <div>
                {/* Top Row: Icon + Name + Status */}
                <div className="flex items-center gap-3.5 mb-3.5 pr-6">
                  {renderLogo(model.iconType)}
                  <div>
                    <h3 className="text-base font-bold text-[#F5F7FB]">
                      {model.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
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
                  </div>
                </div>

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
                    Manage
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isConnecting}
                    onClick={(e) => handleConnectClick(e, model.id)}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#141D2A] hover:bg-[#1A2536] border border-white/10 text-xs md:text-sm font-medium text-[#F5F7FB] transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#5B5CE2]"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#818CF8]" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <span>Connect</span>
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
