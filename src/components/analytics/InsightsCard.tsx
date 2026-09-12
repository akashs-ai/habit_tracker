import React from 'react';
import { TrendingUp, Clock, Heart, ArrowRight } from 'lucide-react';
import { AnalyticsInsight } from '../../types';

interface InsightsCardProps {
  insights: AnalyticsInsight[];
  onSeeAll?: () => void;
}

export const InsightsCard: React.FC<InsightsCardProps> = ({ insights, onSeeAll }) => {
  const getInsightIcon = (type: AnalyticsInsight['icon']) => {
    switch (type) {
      case 'trending-up':
        return <TrendingUp className="w-4 h-4 text-[#34D399]" />;
      case 'clock':
        return <Clock className="w-4 h-4 text-[#818CF8]" />;
      case 'heart':
        return <Heart className="w-4 h-4 text-[#F43F5E] fill-[#F43F5E]" />;
    }
  };

  const getIconBg = (type: AnalyticsInsight['icon']) => {
    switch (type) {
      case 'trending-up':
        return 'bg-[#34D399]/10 border-[#34D399]/20';
      case 'clock':
        return 'bg-[#818CF8]/10 border-[#818CF8]/20';
      case 'heart':
        return 'bg-[#F43F5E]/10 border-[#F43F5E]/20';
    }
  };

  return (
    <div 
      id="analytics-insights-card"
      className="p-4 sm:p-5 rounded-xl bg-[#0F1723] border border-white/7 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Insights
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            AI-powered insights based on your data.
          </p>
        </div>

        <button
          onClick={onSeeAll}
          className="text-xs text-[#818CF8] hover:text-[#A5B4FC] font-medium flex items-center gap-1 transition-colors cursor-pointer group"
        >
          <span>See All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 3 Insight Sub-Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
        {insights.slice(0, 3).map((insight) => (
          <div
            key={insight.id}
            className="p-3.5 rounded-xl bg-[#141C2B] border border-white/6 hover:border-white/10 transition-all duration-200 flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-8 h-8 rounded-lg border flex items-center justify-center ${getIconBg(
                  insight.icon
                )}`}
              >
                {getInsightIcon(insight.icon)}
              </div>
            </div>

            <div>
              <p className="text-xs sm:text-[13px] font-semibold text-white group-hover:text-[#A5B4FC] transition-colors leading-snug">
                {insight.headline}
              </p>
              <p className="text-[11px] text-[#94A3B8] mt-1.5 leading-relaxed">
                {insight.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
