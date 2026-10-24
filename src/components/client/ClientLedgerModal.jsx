// src/components/client/ClientLedgerModal.jsx
import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, X, ArrowUpRight, Lock, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ClientLedgerModal({ isOpen, onClose }) {
  const { escrowLedger, currentUser } = useApp();

  if (!isOpen || !currentUser) return null;

  const clientEntries = escrowLedger.filter((e) => e.clientId === currentUser.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-900">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 border border-indigo-200 rounded-xl text-indigo-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Escrow Settlement Ledger</h3>
              <p className="text-xs text-slate-500">Cryptographically & OTP-authorized audit trail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {clientEntries.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No escrow transactions logged yet for this account.
            </div>
          ) : (
            <div className="space-y-3">
              {clientEntries.map((entry) => {
                const isHeld = entry.status === 'HELD_IN_ESCROW';
                const isSettled = entry.status === 'SETTLED_RELEASED';
                const isDisputed = entry.status === 'FROZEN_IN_DISPUTE';
                const isAdminSettled = entry.status === 'SETTLED_BY_ADMIN';

                return (
                  <div
                    key={entry.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">{entry.id}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold text-slate-900">{entry.jobId}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900">
                          ${entry.amount.toFixed(2)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            isHeld
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : isSettled
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : isDisputed
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {entry.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>Worker: <strong className="text-slate-800">{entry.workerName}</strong></span>
                      <span>Labor: ${entry.workerCut.toFixed(2)} | Fee: ${entry.platformFee.toFixed(2)}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="italic">{entry.notes}</span>
                      <span className="font-mono text-slate-400">{entry.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
