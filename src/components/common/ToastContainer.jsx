// src/components/common/ToastContainer.jsx
import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isDanger = toast.type === 'danger';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border transition-all duration-300 transform translate-y-0 flex items-start gap-3 backdrop-blur-md ${
              isSuccess
                ? 'bg-emerald-50/95 border-emerald-300 text-emerald-950'
                : isDanger
                ? 'bg-rose-50/95 border-rose-300 text-rose-950'
                : isWarning
                ? 'bg-amber-50/95 border-amber-300 text-amber-950'
                : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {isDanger && <AlertCircle className="w-5 h-5 text-rose-600" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {!isSuccess && !isDanger && !isWarning && <Info className="w-5 h-5 text-indigo-600" />}
            </div>

            <div className="flex-1 text-xs">
              <h4 className="font-bold text-sm mb-0.5 text-slate-900">{toast.title}</h4>
              <p className="text-slate-700 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
