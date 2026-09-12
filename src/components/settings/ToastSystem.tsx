import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastSystemProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastSystem: React.FC<ToastSystemProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl shadow-2xl border transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              isSuccess
                ? 'bg-[#101722] border-[#22C55E]/40 text-[#F5F7FB]'
                : 'bg-[#101722] border-[#EF4444]/40 text-[#F5F7FB]'
            }`}
          >
            <div className="flex items-center gap-3">
              {isSuccess ? (
                <div className="w-7 h-7 rounded-lg bg-[#22C55E]/15 flex items-center justify-center text-[#22C55E] shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-lg bg-[#EF4444]/15 flex items-center justify-center text-[#EF4444] shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
              <span className="text-xs sm:text-sm font-medium">
                {toast.message}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-md text-[#94A3B8] hover:text-[#F5F7FB] hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
