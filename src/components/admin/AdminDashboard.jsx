// src/components/admin/AdminDashboard.jsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  AlertTriangle, 
  UserCheck, 
  FileText, 
  DollarSign, 
  Activity, 
  Scale, 
  Check, 
  X, 
  Lock, 
  History, 
  Search, 
  ExternalLink, 
  HardHat, 
  Users, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Star,
  Clock,
  Briefcase,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function AdminDashboard() {
  const { 
    currentUser, 
    jobs, 
    workers, 
    clients, 
    escrowLedger, 
    auditLogs, 
    resolveDispute, 
    verifyWorker, 
    rejectWorker, 
    toggleWorkerVerification 
  } = useApp();

  // Admin sub-navigation: 'DISPUTES' | 'WORKERS' | 'LEDGER' | 'AUDIT'
  const [activeTab, setActiveTab] = useState('DISPUTES');

  // Selected dispute for inspection modal
  const [selectedDisputeJob, setSelectedDisputeJob] = useState(null);
  const [adminNotes, setAdminNotes] = useState('After reviewing evidence and communication logs, resolution is authorized.');
  const [isResolving, setIsResolving] = useState(false);

  // Audit Logs Grouping State: selected worker id (or 'ALL_WORKERS' or 'SYSTEM')
  const [selectedAuditWorkerId, setSelectedAuditWorkerId] = useState(workers[0]?.id || 'SYSTEM');
  const [auditSearchTerm, setAuditSearchTerm] = useState('');

  // Filter queues
  const disputedJobs = jobs.filter((j) => j.status === 'DISPUTED' || j.dispute);
  const pendingWorkers = workers.filter((w) => w.status === 'PENDING_VERIFICATION');
  const verifiedWorkers = workers.filter((w) => w.status === 'VERIFIED' || w.status === 'SUSPENDED');

  // KPI calculations
  const totalEscrowHeld = escrowLedger
    .filter((e) => e.status === 'HELD_IN_ESCROW' || e.status === 'FROZEN_IN_DISPUTE')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalSettledGMV = escrowLedger
    .filter((e) => e.status === 'SETTLED_RELEASED' || e.status === 'SETTLED_BY_ADMIN')
    .reduce((sum, e) => sum + e.amount, 0);

  const handleApplyRuling = (resolutionType) => {
    if (!selectedDisputeJob) return;
    setIsResolving(true);
    setTimeout(() => {
      resolveDispute(selectedDisputeJob.id, resolutionType, adminNotes);
      setIsResolving(false);
      setSelectedDisputeJob(null);
    }, 600);
  };

  // Helper to test if a log belongs to a worker
  const isWorkerLog = (log, worker) => {
    if (!worker) return false;
    const actorMatch = log.actor?.toLowerCase().includes(worker.name.toLowerCase()) || log.actor?.includes(worker.id);
    const msgMatch = log.message?.toLowerCase().includes(worker.name.toLowerCase()) || log.message?.includes(worker.id);
    return actorMatch || msgMatch;
  };

  // Grouped worker logs count map
  const workerLogCounts = workers.reduce((acc, w) => {
    acc[w.id] = auditLogs.filter((l) => isWorkerLog(l, w)).length;
    return acc;
  }, {});

  const systemLogs = auditLogs.filter((l) => {
    return !workers.some((w) => isWorkerLog(l, w));
  });

  const selectedWorkerObj = workers.find((w) => w.id === selectedAuditWorkerId);

  // Active logs to display in Audit Tab
  let displayedLogs = [];
  if (selectedAuditWorkerId === 'SYSTEM') {
    displayedLogs = systemLogs;
  } else if (selectedAuditWorkerId === 'ALL_WORKERS') {
    displayedLogs = auditLogs;
  } else if (selectedWorkerObj) {
    displayedLogs = auditLogs.filter((l) => isWorkerLog(l, selectedWorkerObj));
  }

  if (auditSearchTerm.trim()) {
    const q = auditSearchTerm.toLowerCase();
    displayedLogs = displayedLogs.filter(
      (l) => l.message?.toLowerCase().includes(q) || l.actor?.toLowerCase().includes(q) || l.type?.toLowerCase().includes(q)
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28">
      {/* Admin Top Header & KPI Summary */}
      <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 flex-shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Command Center</h1>
                <span className="font-mono text-xs bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full font-semibold">
                  ADM-001
                </span>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  GOVERNANCE LIVE
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Overseeing disputes, smart escrow ledger settlement, and tradesperson license verification
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                Vault Escrow Held
              </span>
              <span className="text-lg font-bold font-mono text-amber-700">
                ${totalEscrowHeld.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                Total Settled Volume
              </span>
              <span className="text-lg font-bold font-mono text-emerald-700">
                ${totalSettledGMV.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                Active Disputes
              </span>
              <span className="text-lg font-bold font-mono text-rose-700">
                {disputedJobs.filter((j) => j.status === 'DISPUTED').length}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('DISPUTES')}
            className={`py-2 px-4 rounded-xl font-semibold text-xs transition flex items-center gap-2 ${
              activeTab === 'DISPUTES'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Dispute Adjudication</span>
            {disputedJobs.filter((j) => j.status === 'DISPUTED').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                {disputedJobs.filter((j) => j.status === 'DISPUTED').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('WORKERS')}
            className={`py-2 px-4 rounded-xl font-semibold text-xs transition flex items-center gap-2 ${
              activeTab === 'WORKERS'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4 text-cyan-600" />
            <span>Worker Verifications</span>
            {pendingWorkers.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {pendingWorkers.length} Pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`py-2 px-4 rounded-xl font-semibold text-xs transition flex items-center gap-2 ${
              activeTab === 'LEDGER'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Escrow Vault & Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`py-2 px-4 rounded-xl font-semibold text-xs transition flex items-center gap-2 ${
              activeTab === 'AUDIT'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Audit Trail Logs (Grouped by Worker)</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Dispute Adjudication */}
      {activeTab === 'DISPUTES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Dispute Resolution Queue</h2>
              <p className="text-xs text-slate-500">
                Jobs where client has withheld the completion OTP due to contested work
              </p>
            </div>
          </div>

          {disputedJobs.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl text-xs text-slate-500 shadow-sm">
              No disputes currently registered on the platform.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {disputedJobs.map((job) => {
                const isUnderReview = job.status === 'DISPUTED';
                return (
                  <div
                    key={job.id}
                    className={`bg-white border rounded-3xl p-6 shadow-sm space-y-4 transition-all ${
                      isUnderReview ? 'border-rose-300' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">{job.id}</span>
                          <span className="text-xs font-bold text-slate-900">• {job.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {job.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Client: <strong className="text-slate-800">{job.clientName}</strong> ({job.clientId}) ↔ Worker:{' '}
                          <strong className="text-slate-800">{job.workerName}</strong> ({job.workerId})
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 uppercase font-mono block">Frozen Escrow</span>
                          <span className="font-mono text-sm font-bold text-amber-700">
                            ${job.totalEscrowAmount?.toFixed(2)}
                          </span>
                        </div>

                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono ${
                          isUnderReview
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                    </div>

                    {/* Dispute Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                        <span className="text-rose-700 font-bold block flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Client Grievance ({job.dispute?.reason})
                        </span>
                        <p className="text-slate-800 text-[11px] leading-relaxed italic bg-white p-2.5 rounded-xl border border-slate-200">
                          "{job.dispute?.clientComplaint}"
                        </p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                        <span className="text-cyan-700 font-bold block flex items-center gap-1.5">
                          <HardHat className="w-3.5 h-3.5" />
                          Worker Account & Timeline
                        </span>
                        <p className="text-slate-800 text-[11px] leading-relaxed italic bg-white p-2.5 rounded-xl border border-slate-200">
                          "{job.dispute?.workerRebuttal || 'No rebuttal submitted yet.'}"
                        </p>
                      </div>
                    </div>

                    {/* Resolution Section if Open */}
                    {isUnderReview ? (
                      <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs text-slate-600">
                          Escrow funds currently locked in platform vault. Select adjudication action:
                        </span>

                        <button
                          onClick={() => setSelectedDisputeJob(job)}
                          className="w-full sm:w-auto py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Scale className="w-4 h-4" />
                          <span>Adjudicate Dispute</span>
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 text-[11px] text-emerald-700 font-mono">
                        ✓ Case resolved by Admin: {job.dispute?.adminStatus} ({job.dispute?.resolutionNotes})
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Worker Verification & Management */}
      {activeTab === 'WORKERS' && (
        <div className="space-y-8">
          {/* Pending Verifications Queue */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Pending Worker Verification Queue</h2>
                <p className="text-xs text-slate-500">Review uploaded government IDs and trade licensing credentials</p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">
                {pendingWorkers.length} Pending Approval
              </span>
            </div>

            {pendingWorkers.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl text-xs text-slate-500 shadow-sm">
                All worker registration applications have been processed! No pending items.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingWorkers.map((w) => (
                  <div
                    key={w.id}
                    className="bg-white border border-amber-300 rounded-3xl p-6 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 font-bold text-base">
                          {w.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-base">{w.name}</h3>
                            <span className="font-mono text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              {w.id}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            {w.email} • {w.phone} • {w.experienceYears} Years Experience • Initial Rating: <strong>{w.rating || 3.8}★</strong>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block font-mono">Specializations</span>
                        <span className="text-xs font-semibold text-cyan-700">{w.skills.join(', ')}</span>
                      </div>
                    </div>

                    {/* Uploaded Documents List */}
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block mb-2">
                        Attached Document Proofs:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {w.documents?.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                              <span className="text-slate-800 truncate font-medium">{doc.name}</span>
                            </div>
                            <span className="text-[10px] text-amber-700 font-mono ml-2 font-semibold">Inspect</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-3">
                      <button
                        onClick={() => rejectWorker(w.id)}
                        className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 text-xs font-semibold transition"
                      >
                        Reject Application
                      </button>

                      <button
                        onClick={() => verifyWorker(w.id)}
                        className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        <span>Verify & Issue Worker ID (Set Initial 3.8★)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verified Workers Directory */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Verified Tradespeople</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {verifiedWorkers.map((w) => (
                <div
                  key={w.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-800 text-xs">
                        {w.avatar ? <img src={w.avatar} alt="" className="w-full h-full object-cover" /> : w.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{w.name}</h4>
                        <span className="font-mono text-[10px] text-cyan-700">{w.id}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      w.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {w.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p>Skills: <strong className="text-slate-800">{w.skills.join(', ')}</strong></p>
                    <p>Trust Score: <strong className="text-emerald-700 font-mono">{w.trustScore}%</strong> • Rating: <strong className="text-amber-700 font-mono">{w.rating}★</strong></p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                    <span className="text-[11px] text-slate-500">{w.reviewsCount} jobs completed</span>
                    <button
                      onClick={() => toggleWorkerVerification(w.id)}
                      className="text-[11px] text-slate-600 hover:text-slate-900 underline font-mono font-semibold"
                    >
                      {w.status === 'VERIFIED' ? 'Suspend Account' : 'Reactivate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Escrow Vault & Ledger */}
      {activeTab === 'LEDGER' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Platform Escrow Ledger</h2>
              <p className="text-xs text-slate-500">Real-time ledger entries for all deposits, locks, releases, and rulings</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-4">Escrow ID</th>
                    <th className="p-4">Job Reference</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Worker</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Timestamp & Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {escrowLedger.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-mono font-bold text-indigo-700">{entry.id}</td>
                      <td className="p-4 font-mono text-slate-700">{entry.jobId}</td>
                      <td className="p-4 text-slate-900 font-medium">{entry.clientName}</td>
                      <td className="p-4 text-cyan-700 font-medium">{entry.workerName}</td>
                      <td className="p-4 font-mono font-bold text-emerald-700">${entry.amount.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          entry.status === 'HELD_IN_ESCROW'
                            ? 'bg-amber-100 text-amber-800'
                            : entry.status === 'SETTLED_RELEASED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : entry.status === 'FROZEN_IN_DISPUTE'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 text-[11px]">
                        <div>{entry.notes}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{entry.date}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Trail Logs (STRUCTURED & GROUPED BY WORKER) */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Platform Audit Trail Log</h2>
              <p className="text-xs text-slate-500">
                Organized and grouped by individual tradesperson to review actions, OTP handshakes, and settlements per worker.
              </p>
            </div>

            {/* Quick search input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={auditSearchTerm}
                onChange={(e) => setAuditSearchTerm(e.target.value)}
                placeholder="Search audit events..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Worker Navigation Selector / Horizontal Cards */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
              Filter Audit Stream by Worker Persona:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {workers.map((w) => {
                const count = workerLogCounts[w.id] || 0;
                const isSelected = selectedAuditWorkerId === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => setSelectedAuditWorkerId(w.id)}
                    className={`py-2 px-3.5 rounded-2xl text-xs transition flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isSelected ? 'bg-white text-purple-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {w.name[0]}
                    </div>
                    <span>{w.name}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isSelected ? 'bg-purple-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}

              {/* System & Global Broadcasts Filter */}
              <button
                onClick={() => setSelectedAuditWorkerId('SYSTEM')}
                className={`py-2 px-3.5 rounded-2xl text-xs transition flex items-center gap-2 border ${
                  selectedAuditWorkerId === 'SYSTEM'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>System & Broadcasts</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  selectedAuditWorkerId === 'SYSTEM' ? 'bg-purple-800 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {systemLogs.length}
                </span>
              </button>

              {/* All Platform Master Feed */}
              <button
                onClick={() => setSelectedAuditWorkerId('ALL_WORKERS')}
                className={`py-2 px-3.5 rounded-2xl text-xs transition flex items-center gap-2 border ${
                  selectedAuditWorkerId === 'ALL_WORKERS'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Platform Logs</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  selectedAuditWorkerId === 'ALL_WORKERS' ? 'bg-purple-800 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {auditLogs.length}
                </span>
              </button>
            </div>
          </div>

          {/* Worker Profile Header Banner when a specific worker is selected */}
          {selectedWorkerObj && selectedAuditWorkerId !== 'SYSTEM' && selectedAuditWorkerId !== 'ALL_WORKERS' && (
            <div className="bg-gradient-to-r from-purple-50 via-slate-50 to-white border border-purple-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {selectedWorkerObj.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{selectedWorkerObj.name}</h3>
                    <span className="font-mono text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-semibold">
                      {selectedWorkerObj.id}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      selectedWorkerObj.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedWorkerObj.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Skills: <strong className="text-slate-800">{selectedWorkerObj.skills?.join(', ')}</strong> • Experience: {selectedWorkerObj.experienceYears} Years • Contact: {selectedWorkerObj.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Trust Score</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">{selectedWorkerObj.trustScore}%</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Initial Rating</span>
                  <span className="font-mono font-bold text-amber-700 text-sm">{selectedWorkerObj.rating || 3.8}★</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Worker Balance</span>
                  <span className="font-mono font-bold text-cyan-700 text-sm">${selectedWorkerObj.walletBalance?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Grouped Chronological Timeline */}
          <div className="space-y-3">
            {displayedLogs.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 shadow-sm">
                No audit events match the current filter or search criteria.
              </div>
            ) : (
              displayedLogs.map((log) => {
                const isDispute = log.type?.includes('DISPUTE');
                const isRelease = log.type?.includes('RELEASE') || log.type?.includes('SETTLED');
                const isOtp = log.type?.includes('OTP') || log.type?.includes('START') || log.type?.includes('ACCEPT');
                const isRegister = log.type?.includes('REGISTER') || log.type?.includes('VERIF');

                return (
                  <div
                    key={log.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-300 transition shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {log.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                          isDispute
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : isRelease
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : isOtp
                            ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                            : isRegister
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}>
                          {log.type}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-700 font-mono text-[11px] font-semibold">{log.actor}</span>
                      </div>
                      <p className="text-slate-800 text-[12px] font-medium leading-relaxed">{log.message}</p>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap self-start sm:self-auto bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      {log.timestamp}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Adjudication Modal */}
      {selectedDisputeJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-purple-300 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden space-y-5 p-6 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 border border-purple-200 rounded-xl text-purple-700">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Adjudicate Dispute #{selectedDisputeJob.id}</h3>
                  <p className="text-xs text-slate-500">Binding resolution of ${selectedDisputeJob.totalEscrowAmount?.toFixed(2)} escrow vault</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDisputeJob(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Case Details */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Client Claim:</span>
                <span className="text-rose-700 font-semibold">{selectedDisputeJob.dispute?.reason}</span>
              </div>
              <p className="text-slate-800 italic text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                "{selectedDisputeJob.dispute?.clientComplaint}"
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Official Administrative Ruling Notes
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:border-purple-600 focus:outline-none resize-none"
              />
            </div>

            {/* The 3 Adjudication Buttons */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-mono block font-semibold">
                Execute Binding Ruling:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Option 1: 100% Worker */}
                <button
                  type="button"
                  disabled={isResolving}
                  onClick={() => handleApplyRuling('RELEASE_TO_WORKER')}
                  className="p-3 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-xl text-left transition flex flex-col justify-between"
                >
                  <span className="font-bold text-cyan-800 text-xs">Release to Worker</span>
                  <span className="text-[10px] text-slate-600 mt-1">100% payout to {selectedDisputeJob.workerName}</span>
                </button>

                {/* Option 2: 100% Client Refund */}
                <button
                  type="button"
                  disabled={isResolving}
                  onClick={() => handleApplyRuling('REFUND_TO_CLIENT')}
                  className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition flex flex-col justify-between"
                >
                  <span className="font-bold text-emerald-800 text-xs">Refund Client</span>
                  <span className="text-[10px] text-slate-600 mt-1">100% escrow refund to {selectedDisputeJob.clientName}</span>
                </button>

                {/* Option 3: 50 / 50 Split */}
                <button
                  type="button"
                  disabled={isResolving}
                  onClick={() => handleApplyRuling('SPLIT_50_50')}
                  className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-left transition flex flex-col justify-between"
                >
                  <span className="font-bold text-purple-800 text-xs">Split 50 / 50</span>
                  <span className="text-[10px] text-slate-600 mt-1">Even division between both parties</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDisputeJob(null)}
                className="py-2 px-4 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
