// src/components/client/ClientDashboard.jsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Wrench, 
  Zap, 
  Wallet, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Check, 
  AlertTriangle, 
  Phone, 
  Plus, 
  BookOpen, 
  ChevronRight, 
  History, 
  Sparkles,
  ArrowRight,
  Flame,
  FileText,
  MessageSquare
} from 'lucide-react';
import BookJobModal from './BookJobModal';
import AddFundsModal from '../common/AddFundsModal';
import ClientDisputeModal from './ClientDisputeModal';
import ClientReviewModal from './ClientReviewModal';
import ClientLedgerModal from './ClientLedgerModal';
import JobChatModal from '../common/JobChatModal';

export default function ClientDashboard() {
  const { 
    currentUser, 
    clients, 
    jobs, 
    categories, 
    clientAcceptProposal 
  } = useApp();

  const client = clients.find((c) => c.id === currentUser?.id);

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [preselectedCategory, setPreselectedCategory] = useState(null);
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [disputeJob, setDisputeJob] = useState(null);
  const [reviewJob, setReviewJob] = useState(null);
  const [chatJob, setChatJob] = useState(null);
  const [copiedOtp, setCopiedOtp] = useState('');

  // Jobs for this client
  const clientJobs = jobs.filter((j) => j.clientId === currentUser?.id);
  const activeJobs = clientJobs.filter((j) => !['COMPLETED', 'RESOLVED_BY_ADMIN'].includes(j.status));
  const completedJobs = clientJobs.filter((j) => ['COMPLETED', 'RESOLVED_BY_ADMIN'].includes(j.status));

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedOtp(text);
    setTimeout(() => setCopiedOtp(''), 2500);
  };

  const openBookWithCategory = (catName) => {
    setPreselectedCategory(catName);
    setIsBookModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-28">
      {/* Top Banner / Client Profile Summary */}
      <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 overflow-hidden flex-shrink-0">
              {client?.avatar ? (
                <img src={client.avatar} alt={client.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xl text-indigo-700">
                  {client?.name?.[0] || 'C'}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{client?.name}</h1>
                <span className="font-mono text-xs bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full font-semibold">
                  {client?.id}
                </span>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                <span>{client?.address}</span>
              </p>
            </div>
          </div>

          {/* Quick Wallet & Ledger Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-700">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                  Wallet Balance
                </span>
                <span className="text-lg font-bold font-mono text-emerald-700">
                  ${client ? client.walletBalance.toFixed(2) : '0.00'}
                </span>
              </div>
              <button
                onClick={() => setIsAddFundsOpen(true)}
                className="ml-2 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Funds</span>
              </button>
            </div>

            <button
              onClick={() => setIsLedgerOpen(true)}
              className="py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 transition flex items-center gap-2 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Escrow Ledger</span>
            </button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-3">
          <button
            onClick={() => { setPreselectedCategory(null); setIsBookModalOpen(true); }}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center gap-2 shadow-sm"
          >
            <Wrench className="w-4 h-4" />
            <span>Book Standard Trade Service</span>
          </button>

          <button
            onClick={() => { setPreselectedCategory(null); setIsBookModalOpen(true); }}
            className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition flex items-center gap-2 shadow-sm"
          >
            <Flame className="w-4 h-4" />
            <span>🚨 Broadcast Emergency Job</span>
          </button>
        </div>
      </div>

      {/* Active Work In Progress (Hero Lifecycle Area) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Work Lifecycle Tracker</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {activeJobs.length} active service{activeJobs.length === 1 ? '' : 's'}
          </span>
        </div>

        {activeJobs.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">No active work orders right now</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Choose a trade category below to hire a nearby verified tradesperson or broadcast an urgent emergency request.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeJobs.map((job) => {
              const isEstimationReady = job.status === 'ESTIMATION_SUBMITTED' && !job.isEmergency;
              const isAcceptanceOtpPending = job.status === 'ACCEPTANCE_OTP_PENDING';
              const isStartOtpPending = job.status === 'ESCROW_LOCKED_START_PENDING' || (job.isEmergency && ['WORKER_EN_ROUTE', 'ARRIVED_INSPECTING', 'ESCROW_LOCKED_START_PENDING'].includes(job.status) && job.workerId);
              const isInProgress = job.status === 'IN_PROGRESS';
              const isDisputed = job.status === 'DISPUTED';

              return (
                <div
                  key={job.id}
                  className={`bg-white border rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden transition-all ${
                    isDisputed
                      ? 'border-rose-300'
                      : job.isEmergency
                      ? 'border-rose-200'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Job Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">{job.id}</span>
                        {job.isEmergency && (
                          <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Zap className="w-3 h-3 text-rose-600" />
                            Emergency 2-OTP Flow
                          </span>
                        )}
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {job.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">{job.title}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">{job.description}</p>
                    </div>

                    {/* Status Badge */}
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold font-mono ${
                        isDisputed
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isInProgress
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}>
                        STATUS: {job.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Body: Worker Info & Stepper */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">
                    {/* Left: Worker Details */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block font-mono">
                        Assigned Tradesperson
                      </span>

                      {job.workerName ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-indigo-800 text-base">
                              {job.workerName[0]}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{job.workerName}</h4>
                              <span className="text-[10px] font-mono text-cyan-700">{job.workerId}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                            <div className="flex justify-between">
                              <span>Service Address:</span>
                              <span className="text-slate-800 text-right font-medium max-w-[160px] truncate">{job.clientAddress}</span>
                            </div>
                            {job.totalEscrowAmount && (
                              <div className="flex justify-between">
                                <span>Escrow Amount:</span>
                                <span className="text-emerald-700 font-mono font-bold">${job.totalEscrowAmount.toFixed(2)}</span>
                              </div>
                            )}
                          </div>

                          {/* Chat with Pro Action Button */}
                          <button
                            type="button"
                            onClick={() => setChatJob(job)}
                            className="mt-2 w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat with {job.workerName.split(' ')[0]}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="py-4 text-center space-y-2">
                          <Clock className="w-6 h-6 text-amber-500 mx-auto animate-spin" />
                          <p className="text-xs text-slate-700 font-medium">Broadcasted to Local Technicians</p>
                          <p className="text-[11px] text-slate-500">Waiting for first responder to claim...</p>
                        </div>
                      )}
                    </div>

                    {/* Middle & Right: OTP & Action Control Center */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Step A: Estimation Review on Site */}
                      {isEstimationReady && (
                        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-indigo-600" />
                              <h4 className="font-bold text-slate-900 text-xs">On-Site Diagnosis & Quote Received</h4>
                            </div>
                            <span className="text-xs font-mono font-bold text-emerald-700">
                              ${job.totalEscrowAmount.toFixed(2)} Total Escrow
                            </span>
                          </div>

                          <p className="text-xs text-slate-600">
                            The tradesperson has inspected the fault and submitted a proposed labor fee of{' '}
                            <strong className="text-slate-900">${job.proposedLaborFee.toFixed(2)}</strong> (+${job.platformFee.toFixed(2)} platform safety fee).
                            Review and accept to generate your <strong>Acceptance OTP</strong>.
                          </p>

                          <div className="flex items-center gap-3 pt-1">
                            <button
                              onClick={() => clientAcceptProposal(job.id)}
                              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition shadow-sm flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Accept Quote & Generate Acceptance OTP</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step B: Acceptance OTP Display */}
                      {isAcceptanceOtpPending && (
                        <div className="p-5 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider font-mono">
                              Step 1 • Authorization OTP
                            </span>
                            <span className="text-[11px] text-slate-600">Share with Worker to Lock Escrow</span>
                          </div>

                          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-indigo-200 shadow-sm">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Acceptance OTP</span>
                              <span className="text-3xl font-black font-mono text-indigo-700 tracking-widest">
                                {job.acceptanceOtp}
                              </span>
                            </div>

                            <button
                              onClick={() => handleCopy(job.acceptanceOtp)}
                              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition flex items-center gap-1.5 border border-slate-200"
                            >
                              {copiedOtp === job.acceptanceOtp ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                              <span>{copiedOtp === job.acceptanceOtp ? 'Copied' : 'Copy OTP'}</span>
                            </button>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            💡 <strong>Instructions:</strong> Read this 4-digit code to {job.workerName}. When they enter it on their terminal, ${job.totalEscrowAmount?.toFixed(2)} will be deducted from your wallet and held in the Escrow vault.
                          </p>
                        </div>
                      )}

                      {/* Step C: Work-Start OTP Display */}
                      {isStartOtpPending && (
                        <div className="p-5 bg-cyan-50 border border-cyan-200 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider font-mono">
                              Step 2 • Work-Start OTP
                            </span>
                            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Escrow Locked in Vault
                            </span>
                          </div>

                          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-cyan-200 shadow-sm">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Work-Start OTP</span>
                              <span className="text-3xl font-black font-mono text-cyan-700 tracking-widest">
                                {job.workStartOtp}
                              </span>
                            </div>

                            <button
                              onClick={() => handleCopy(job.workStartOtp)}
                              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition flex items-center gap-1.5 border border-slate-200"
                            >
                              {copiedOtp === job.workStartOtp ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                              <span>{copiedOtp === job.workStartOtp ? 'Copied' : 'Copy OTP'}</span>
                            </button>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Provide this OTP to {job.workerName} once they are physically ready to begin work.
                          </p>
                        </div>
                      )}

                      {/* Step D: In Progress & Completion OTP / Dispute Controls */}
                      {isInProgress && (
                        <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                              Work Actively In Progress
                            </span>
                            <span className="text-[11px] text-slate-600">Inspect thoroughly before sharing End OTP</span>
                          </div>

                          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Work-End Release OTP</span>
                              <span className="text-3xl font-black font-mono text-emerald-700 tracking-widest">
                                {job.workEndOtp}
                              </span>
                            </div>

                            <button
                              onClick={() => handleCopy(job.workEndOtp)}
                              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition flex items-center gap-1.5 border border-slate-200"
                            >
                              {copiedOtp === job.workEndOtp ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                              <span>{copiedOtp === job.workEndOtp ? 'Copied' : 'Copy OTP'}</span>
                            </button>
                          </div>

                          {/* Dual Action: Happy vs Dispute */}
                          <div className="pt-2 border-t border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                            <p className="text-[11px] text-slate-600">
                              Satisfied? Read OTP to worker. Funds will release to their wallet.
                            </p>

                            <button
                              onClick={() => setDisputeJob(job)}
                              className="w-full sm:w-auto py-2 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold transition flex items-center justify-center gap-1.5"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Unhappy? Raise Dispute & Freeze Escrow</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step E: Disputed State Banner */}
                      {isDisputed && (
                        <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
                          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider font-mono">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            Dispute Active • Escrow Frozen in Vault
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-rose-200 text-xs space-y-2 shadow-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Grievance Category:</span>
                              <span className="text-slate-900 font-semibold">{job.dispute?.reason}</span>
                            </div>
                            <div>
                              <span className="text-slate-600 block text-[11px] mb-1">Your Complaint:</span>
                              <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] italic">
                                "{job.dispute?.clientComplaint}"
                              </p>
                            </div>
                          </div>

                          <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-[11px] text-indigo-800">
                            🛡️ <strong>Admin Review Pending:</strong> Switch to the <strong>Admin Portal</strong> to review this case and issue a ruling (100% Worker, 100% Client Refund, or 50/50 Split).
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Skills Directory Visual Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Available Trade Services Directory</h2>
            <p className="text-xs text-slate-500">Select any category to browse certified nearby specialists</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            return (
              <div
                key={cat.id}
                onClick={() => openBookWithCategory(cat.name)}
                className="group relative bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl border bg-gradient-to-br ${cat.color}`}>
                      <Wrench className="w-5 h-5 text-indigo-700" />
                    </div>
                    {cat.popular && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                        Popular
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-mono text-indigo-600 font-semibold">{cat.avgRate}</span>
                  <span className="text-slate-600 group-hover:text-indigo-700 flex items-center gap-1 font-medium transition text-[11px]">
                    Book Now <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed Works & History */}
      {completedJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Past Work History & Receipts</h2>
            <span className="text-xs text-slate-500 font-mono">{completedJobs.length} completed</span>
          </div>

          <div className="space-y-3">
            {completedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-700">{job.id}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-900 font-bold">{job.title}</span>
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-mono">
                      COMPLETED
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Worker: <strong className="text-slate-800">{job.workerName}</strong> • Escrow Settled: <strong className="text-emerald-700 font-mono">${job.totalEscrowAmount?.toFixed(2)}</strong>
                  </p>
                  {job.reviewText && (
                    <div className="pt-1 text-slate-700 italic text-[11px] flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>"{job.reviewText}"</span>
                    </div>
                  )}
                </div>

                {!job.reviewSubmitted && (
                  <button
                    onClick={() => setReviewJob(job)}
                    className="py-2 px-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
                  >
                    <Star className="w-3.5 h-3.5 fill-white" />
                    <span>Rate Tradesperson</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <BookJobModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        preselectedCategory={preselectedCategory}
      />
      <AddFundsModal
        isOpen={isAddFundsOpen}
        onClose={() => setIsAddFundsOpen(false)}
      />
      <ClientDisputeModal
        job={disputeJob}
        isOpen={!!disputeJob}
        onClose={() => setDisputeJob(null)}
      />
      <ClientReviewModal
        job={reviewJob}
        isOpen={!!reviewJob}
        onClose={() => setReviewJob(null)}
      />
      <ClientLedgerModal
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
      />
      {chatJob && (
        <JobChatModal
          isOpen={!!chatJob}
          onClose={() => setChatJob(null)}
          job={chatJob}
        />
      )}
    </div>
  );
}
