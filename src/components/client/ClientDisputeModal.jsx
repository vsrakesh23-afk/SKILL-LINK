// src/components/client/ClientDisputeModal.jsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, X, ShieldAlert, ArrowRight } from 'lucide-react';

export default function ClientDisputeModal({ job, isOpen, onClose }) {
  const { raiseDispute } = useApp();
  const [reason, setReason] = useState('Poor Workmanship & Defective Assembly');
  const [complaint, setComplaint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !job) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!complaint.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      raiseDispute(job.id, {
        reason,
        clientComplaint: complaint.trim(),
      });
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  const reasonOptions = [
    'Poor Workmanship & Defective Assembly',
    'Worker Left Job Incomplete / Abandoned',
    'Damage Caused to Personal Property',
    'Worker Demanded Unauthorized Extra Cash',
    'Severe Delay / Unprofessional Behavior',
    'Other Critical Grievance',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-rose-200 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden text-slate-900">
        {/* Header */}
        <div className="p-5 border-b border-rose-100 bg-rose-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 border border-rose-200 rounded-xl text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Raise Formal Dispute</h3>
              <p className="text-xs text-rose-700">Escalate Job #{job.id} to Admin Adjudication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Worker:</span>
              <span className="text-slate-900 font-semibold">{job.workerName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Escrow Amount Frozen:</span>
              <span className="text-amber-700 font-mono font-bold">${job.totalEscrowAmount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Primary Dispute Category
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:border-rose-600 focus:outline-none"
            >
              {reasonOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-white text-slate-900">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Describe the Issue & Specific Evidence
            </label>
            <textarea
              rows={4}
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="State what went wrong, what was left unfinished, or what the worker did improperly. This report will be reviewed by the Admin."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:border-rose-600 focus:outline-none resize-none"
              required
            />
          </div>

          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-[11px]">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Important:</strong> By raising a dispute, the Work-End OTP will be withheld and the escrow funds will be <strong>frozen</strong> in the platform vault. The Admin will review client evidence, worker activity logs, and issue a binding resolution.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !complaint.trim()}
              className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Escalating...</span>
              ) : (
                <>
                  <span>Freeze Escrow & Dispute</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
