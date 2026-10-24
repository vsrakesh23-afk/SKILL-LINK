// src/components/worker/WorkerDashboard.jsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  HardHat, 
  Wallet, 
  Star, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  MessageSquare, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Check, 
  KeyRound, 
  FileText, 
  Navigation, 
  DollarSign, 
  Award,
  Sparkles,
  Lock,
  RefreshCw,
  Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import JobChatModal from '../common/JobChatModal';

export default function WorkerDashboard() {
  const { 
    currentUser, 
    workers, 
    jobs, 
    workerClaimEmergencyJob, 
    workerMarkArrived, 
    workerSubmitProposedFee, 
    clientAcceptProposal,
    verifyAcceptanceOtp, 
    verifyWorkStartOtp, 
    verifyWorkEndOtp,
    toggleWorkerVerification,
    addToast
  } = useApp();

  const worker = workers.find((w) => w.id === currentUser?.id);

  // Active sub-tab: 'ACTIVE_JOB' | 'AVAILABLE_FEED' | 'PROFILE_REVIEWS'
  const [activeTab, setActiveTab] = useState('ACTIVE_JOB');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Input states for OTPs & fee
  const [proposedFeeInput, setProposedFeeInput] = useState('75');
  const [acceptanceOtpInput, setAcceptanceOtpInput] = useState('');
  const [workStartOtpInput, setWorkStartOtpInput] = useState('');
  const [workEndOtpInput, setWorkEndOtpInput] = useState('');

  // Per-stage error states
  const [acceptanceError, setAcceptanceError] = useState('');
  const [startError, setStartError] = useState('');
  const [endError, setEndError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Jobs for this worker
  const activeWorkerJobs = jobs.filter((j) => j.workerId === worker?.id && !['COMPLETED', 'RESOLVED_BY_ADMIN'].includes(j.status));
  const [selectedJobId, setSelectedJobId] = useState(activeWorkerJobs[0]?.id || null);

  // Sync selectedJobId if previous job completed or list changed
  const currentActiveJob = activeWorkerJobs.find((j) => j.id === selectedJobId) || activeWorkerJobs[0] || null;

  // Unclaimed emergency jobs or jobs in worker's skill category
  const availableBroadcasts = jobs.filter(
    (j) => j.isEmergency && j.status === 'BROADCASTED_WAITING_CLAIM' && (worker?.skills?.includes(j.category) || true)
  );

  const completedJobs = jobs.filter((j) => j.workerId === worker?.id && ['COMPLETED', 'RESOLVED_BY_ADMIN'].includes(j.status));

  // Handlers
  const handleFeeSubmit = (e) => {
    e.preventDefault();
    if (!currentActiveJob) return;
    workerSubmitProposedFee(currentActiveJob.id, proposedFeeInput);
  };

  const handleSimulateClientApproval = () => {
    if (!currentActiveJob) return;
    clientAcceptProposal(currentActiveJob.id);
  };

  const handleVerifyAcceptanceOtp = (e) => {
    e.preventDefault();
    setAcceptanceError('');
    if (!currentActiveJob) return;

    if (!acceptanceOtpInput.trim()) {
      setAcceptanceError('Please enter the 4-digit Acceptance OTP provided by the client.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      const res = verifyAcceptanceOtp(currentActiveJob.id, acceptanceOtpInput.trim());
      setIsVerifying(false);
      if (!res.success) {
        setAcceptanceError(res.message);
      } else {
        setAcceptanceOtpInput('');
        setAcceptanceError('');
      }
    }, 400);
  };

  const handleVerifyStartOtp = (e) => {
    e.preventDefault();
    setStartError('');
    if (!currentActiveJob) return;

    if (!workStartOtpInput.trim()) {
      setStartError('Please enter the 4-digit Work-Start OTP provided by the client.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      const res = verifyWorkStartOtp(currentActiveJob.id, workStartOtpInput.trim());
      setIsVerifying(false);
      if (!res.success) {
        setStartError(res.message);
      } else {
        setWorkStartOtpInput('');
        setStartError('');
      }
    }, 400);
  };

  const handleVerifyEndOtp = (e) => {
    e.preventDefault();
    setEndError('');
    if (!currentActiveJob) return;

    if (!workEndOtpInput.trim()) {
      setEndError('Please enter the 4-digit Work-End Completion OTP provided by the client.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      const res = verifyWorkEndOtp(currentActiveJob.id, workEndOtpInput.trim());
      setIsVerifying(false);
      if (!res.success) {
        setEndError(res.message);
      } else {
        setWorkEndOtpInput('');
        setEndError('');
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }
    }, 400);
  };

  // Status checks for current active job
  const isEnRoute = currentActiveJob?.status === 'WORKER_EN_ROUTE';
  const isInspecting = currentActiveJob?.status === 'ARRIVED_INSPECTING';
  const isQuotePendingClient = currentActiveJob?.status === 'ESTIMATION_SUBMITTED';
  const isAcceptanceReady = currentActiveJob?.status === 'ACCEPTANCE_OTP_PENDING';
  const isEscrowLocked = ['ESCROW_LOCKED_START_PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(currentActiveJob?.status);
  const isStartOtpReady = currentActiveJob?.status === 'ESCROW_LOCKED_START_PENDING' || (currentActiveJob?.isEmergency && ['ARRIVED_INSPECTING', 'WORKER_EN_ROUTE'].includes(currentActiveJob?.status));
  const isInProgress = currentActiveJob?.status === 'IN_PROGRESS';
  const isCompleted = currentActiveJob?.status === 'COMPLETED';
  const isDisputed = currentActiveJob?.status === 'DISPUTED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28">
      {/* Top Profile / Earnings Bar */}
      <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-cyan-200 overflow-hidden flex-shrink-0">
              {worker?.avatar ? (
                <img src={worker.avatar} alt={worker.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xl text-cyan-700">
                  {worker?.name?.[0] || 'W'}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{worker?.name}</h1>
                <span className="font-mono text-xs bg-cyan-100 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded-full font-semibold">
                  {worker?.id}
                </span>
                <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  VERIFIED PRO
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Specialties: <span className="text-slate-900 font-semibold">{worker?.skills?.join(', ')}</span> • {worker?.experienceYears} Years Exp
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Wallet Earnings */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="p-2.5 bg-cyan-100 border border-cyan-200 rounded-xl text-cyan-700">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                  Wallet Earnings
                </span>
                <span className="text-lg font-bold font-mono text-cyan-700">
                  ${worker ? worker.walletBalance.toFixed(2) : '0.00'}
                </span>
              </div>
            </div>

            {/* Trust Score */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-700">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                  Trust Score
                </span>
                <span className="text-lg font-bold font-mono text-emerald-700">
                  {worker?.trustScore}%
                </span>
              </div>
            </div>

            {/* Rating */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 border border-amber-200 rounded-xl text-amber-700">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                  Average Rating
                </span>
                <span className="text-lg font-bold font-mono text-amber-700">
                  {worker?.rating || 3.8}★
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs within Worker Portal */}
        <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('ACTIVE_JOB')}
            className={`py-2 px-4 rounded-xl font-semibold text-xs transition flex items-center gap-2 ${
              activeTab === 'ACTIVE_JOB'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>Active Job Terminal & OTP Hub</span>
            {activeWorkerJobs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 text-[10px] font-bold">
                {activeWorkerJobs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('AVAILABLE_FEED')}
            className={`py-2 px-4 rounded-xl font-semibold text-xs transition flex items-center gap-2 ${
              activeTab === 'AVAILABLE_FEED'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Available Jobs Feed</span>
            {availableBroadcasts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold animate-pulse">
                {availableBroadcasts.length} Emergency
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('PROFILE_REVIEWS')}
            className={`py-2 px-4 rounded-xl font-semibold text-xs transition flex items-center gap-2 ${
              activeTab === 'PROFILE_REVIEWS'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500" />
            <span>Reviews & Documents ({worker?.reviewsCount || 0})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Active Job Execution Stepper & OTP Hub */}
      {activeTab === 'ACTIVE_JOB' && (
        <div className="space-y-6">
          {/* Active Job Selector (if multiple jobs) */}
          {activeWorkerJobs.length > 1 && (
            <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-2xl overflow-x-auto text-xs shadow-sm">
              <span className="text-slate-500 text-[11px] px-2 font-mono uppercase font-semibold">Select Job:</span>
              {activeWorkerJobs.map((j) => (
                <button
                  key={j.id}
                  onClick={() => setSelectedJobId(j.id)}
                  className={`py-1.5 px-3 rounded-xl font-mono text-xs transition flex items-center gap-1.5 ${
                    currentActiveJob?.id === j.id
                      ? 'bg-cyan-600 text-white font-bold shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{j.id}</span>
                  <span className="text-[10px] opacity-75">({j.status.replace(/_/g, ' ')})</span>
                </button>
              ))}
            </div>
          )}

          {!currentActiveJob ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
              <HardHat className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-semibold text-slate-800">No Job Currently in Execution</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You are currently idle. Check the <strong>Available Jobs Feed</strong> tab to claim nearby emergency broadcasts or wait for client direct bookings.
              </p>
              <button
                onClick={() => setActiveTab('AVAILABLE_FEED')}
                className="py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition shadow-sm"
              >
                <Zap className="w-4 h-4" />
                <span>Check Available Job Feed</span>
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Job Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">{currentActiveJob.id}</span>
                    {currentActiveJob.isEmergency && (
                      <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3 text-rose-600" />
                        Emergency Broadcast Job
                      </span>
                    )}
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {currentActiveJob.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">{currentActiveJob.title}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">{currentActiveJob.description}</p>
                </div>

                <div className="text-right">
                  <span className={`inline-block text-xs font-mono font-bold px-3 py-1 rounded-xl border ${
                    isDisputed
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : isInProgress
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200 animate-pulse'
                      : 'bg-cyan-100 text-cyan-800 border-cyan-200'
                  }`}>
                    STAGE: {currentActiveJob.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Destination & Client Contact Card with In-App Chat */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block font-semibold">Service Location & Client</span>
                  <div className="flex items-center gap-2 text-slate-900 font-semibold">
                    <MapPin className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                    <span>{currentActiveJob.clientAddress}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Client: <strong className="text-slate-800">{currentActiveJob.clientName}</strong> ({currentActiveJob.clientId})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsChatOpen(true)}
                    className="py-2.5 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold transition flex items-center gap-2 shadow-sm text-xs"
                  >
                    <MessageSquare className="w-4 h-4 text-white" />
                    <span>Chat with Client</span>
                  </button>
                </div>
              </div>

              {/* Travel / Diagnostic Pre-Step */}
              {isEnRoute && (
                <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Navigation className="w-5 h-5 text-cyan-600 animate-bounce" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">You are En Route to Destination</h4>
                      <p className="text-[11px] text-slate-600">Head to {currentActiveJob.clientAddress}. Once on site, mark your arrival to start inspection.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => workerMarkArrived(currentActiveJob.id)}
                    className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Arrived on Site</span>
                  </button>
                </div>
              )}

              {/* Fee Proposal Step (Standard Flow) */}
              {isInspecting && !currentActiveJob.isEmergency && (
                <form onSubmit={handleFeeSubmit} className="p-5 bg-slate-50 border border-cyan-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">On-Site Diagnosis: Enter Proposed Labor Fee</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Inspect the problem, verify parts needed, and submit your labor quote for client approval.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded font-bold">Standard Workflow</span>
                  </div>

                  <div className="max-w-xs">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Proposed Labor Fee ($)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                      <input
                        type="number"
                        min="10"
                        step="5"
                        value={proposedFeeInput}
                        onChange={(e) => setProposedFeeInput(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-base focus:border-cyan-600 focus:outline-none"
                        required
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      +$5 platform safety reserve added to client escrow total.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-sm"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Submit Quotation to Client</span>
                  </button>
                </form>
              )}

              {/* Awaiting Client Acceptance Card with 1-Click Simulation */}
              {isQuotePendingClient && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600 animate-spin" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">
                        Quotation (${currentActiveJob.proposedLaborFee?.toFixed(2)}) Awaiting Client Acceptance
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Client ({currentActiveJob.clientName}) needs to review and click "Accept Quote" on their screen to generate the Acceptance OTP.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSimulateClientApproval}
                    className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                    title="Simulate client accepting quote to generate OTP"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Simulate Client Approval</span>
                  </button>
                </div>
              )}

              {/* ======================================================== */}
              {/* DEDICATED 3-STAGE OTP VERIFICATION & ESCROW SETTLEMENT HUB */}
              {/* ======================================================== */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-cyan-600" />
                    <h3 className="font-bold text-slate-900 text-base">OTP Verification & Escrow Lifecycle Hub</h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Dual-party cryptographic handshake
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* STAGE 1: ACCEPTANCE / ESCROW LOCK OTP */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    isEscrowLocked
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : isAcceptanceReady
                      ? 'bg-indigo-50/70 border-indigo-300 shadow-sm ring-1 ring-indigo-200'
                      : 'bg-slate-50 border-slate-200 opacity-80'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          isEscrowLocked
                            ? 'bg-emerald-600 text-white'
                            : isAcceptanceReady
                            ? 'bg-indigo-600 text-white animate-pulse'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isEscrowLocked ? '✓' : '1'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            Stage 1: Acceptance & Escrow Lock OTP
                          </h4>
                          <p className="text-[11px] text-slate-600">
                            Locks ${currentActiveJob.totalEscrowAmount?.toFixed(2) || '0.00'} from client's wallet into the Escrow Ledger.
                          </p>
                        </div>
                      </div>

                      <div>
                        {currentActiveJob.isEmergency ? (
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-mono font-semibold">
                            ⚡ Bypassed (Emergency Broadcast Pre-Locked)
                          </span>
                        ) : isEscrowLocked ? (
                          <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono font-bold">
                            <Check className="w-3.5 h-3.5" />
                            Escrow Locked in Vault (${currentActiveJob.totalEscrowAmount?.toFixed(2)})
                          </span>
                        ) : isAcceptanceReady ? (
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 font-mono font-bold animate-pulse">
                            ● Ready for Worker Verification
                          </span>
                        ) : (
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 font-mono">
                            Pending Client Quote Acceptance
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stage 1 Verification Input Area */}
                    {!isEscrowLocked && !currentActiveJob.isEmergency && (
                      <div className="pt-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                          <div>
                            <span className="text-xs font-semibold text-slate-800 block">
                              Enter Client's 4-Digit Acceptance OTP:
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Client Jane Doe sees this OTP on her dashboard screen.
                            </span>
                          </div>

                          {/* Quick Auto-Fill helper */}
                          {currentActiveJob.acceptanceOtp && (
                            <button
                              type="button"
                              onClick={() => {
                                setAcceptanceOtpInput(currentActiveJob.acceptanceOtp);
                                setAcceptanceError('');
                              }}
                              className="px-2.5 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-mono transition flex items-center gap-1.5 self-start sm:self-auto"
                            >
                              <Sparkles className="w-3 h-3 text-indigo-600" />
                              <span>Sync Client OTP: <strong>{currentActiveJob.acceptanceOtp}</strong> [Fill]</span>
                            </button>
                          )}
                        </div>

                        <form onSubmit={handleVerifyAcceptanceOtp} className="flex flex-col sm:flex-row items-center gap-3">
                          <input
                            type="text"
                            maxLength="4"
                            value={acceptanceOtpInput}
                            disabled={!isAcceptanceReady || isVerifying}
                            onChange={(e) => {
                              setAcceptanceOtpInput(e.target.value);
                              setAcceptanceError('');
                            }}
                            placeholder="e.g. 4921"
                            className="w-full sm:w-44 text-center px-4 py-2.5 bg-white border border-indigo-300 rounded-xl text-slate-900 font-mono text-xl tracking-widest focus:border-indigo-600 focus:outline-none disabled:opacity-50"
                          />

                          <button
                            type="submit"
                            disabled={!isAcceptanceReady || isVerifying || acceptanceOtpInput.length !== 4}
                            className="w-full sm:w-auto py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 whitespace-nowrap"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>{isVerifying ? 'Verifying...' : 'Verify Acceptance OTP & Lock Escrow'}</span>
                          </button>
                        </form>

                        {acceptanceError && (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                            <span>{acceptanceError}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* STAGE 2: WORK-START OTP */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    isInProgress || isCompleted
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : isStartOtpReady
                      ? 'bg-cyan-50/70 border-cyan-300 shadow-sm ring-1 ring-cyan-200'
                      : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          isInProgress || isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isStartOtpReady
                            ? 'bg-cyan-600 text-white animate-pulse'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isInProgress || isCompleted ? '✓' : '2'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            Stage 2: Work-Start OTP
                          </h4>
                          <p className="text-[11px] text-slate-600">
                            Authorizes physical start of labor and activates official work timer.
                          </p>
                        </div>
                      </div>

                      <div>
                        {isInProgress || isCompleted ? (
                          <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono font-bold">
                            <Check className="w-3.5 h-3.5" />
                            Work Active & Running
                          </span>
                        ) : isStartOtpReady ? (
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200 font-mono font-bold animate-pulse">
                            ● Ready for Start OTP Verification
                          </span>
                        ) : (
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 font-mono">
                            Unlocks after Escrow Lock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stage 2 Verification Input Area */}
                    {!isInProgress && !isCompleted && (
                      <div className="pt-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                          <div>
                            <span className="text-xs font-semibold text-slate-800 block">
                              Enter Client's 4-Digit Work-Start OTP:
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Client provides this OTP once you are physically ready to commence work.
                            </span>
                          </div>

                          {/* Quick Auto-Fill helper */}
                          {currentActiveJob.workStartOtp && (
                            <button
                              type="button"
                              onClick={() => {
                                setWorkStartOtpInput(currentActiveJob.workStartOtp);
                                setStartError('');
                              }}
                              className="px-2.5 py-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-700 border border-cyan-200 rounded-lg text-xs font-mono transition flex items-center gap-1.5 self-start sm:self-auto"
                            >
                              <Sparkles className="w-3 h-3 text-cyan-600" />
                              <span>Sync Client OTP: <strong>{currentActiveJob.workStartOtp}</strong> [Fill]</span>
                            </button>
                          )}
                        </div>

                        <form onSubmit={handleVerifyStartOtp} className="flex flex-col sm:flex-row items-center gap-3">
                          <input
                            type="text"
                            maxLength="4"
                            value={workStartOtpInput}
                            disabled={!isStartOtpReady || isVerifying}
                            onChange={(e) => {
                              setWorkStartOtpInput(e.target.value);
                              setStartError('');
                            }}
                            placeholder="e.g. 8315"
                            className="w-full sm:w-44 text-center px-4 py-2.5 bg-white border border-cyan-300 rounded-xl text-slate-900 font-mono text-xl tracking-widest focus:border-cyan-600 focus:outline-none disabled:opacity-50"
                          />

                          <button
                            type="submit"
                            disabled={!isStartOtpReady || isVerifying || workStartOtpInput.length !== 4}
                            className="w-full sm:w-auto py-2.5 px-5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 whitespace-nowrap"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isVerifying ? 'Verifying...' : 'Authorize & Start Work Timer'}</span>
                          </button>
                        </form>

                        {startError && (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                            <span>{startError}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* STAGE 3: WORK-COMPLETION & ESCROW PAYOUT OTP */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : isInProgress
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-sm ring-1 ring-emerald-200'
                      : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isInProgress
                            ? 'bg-emerald-600 text-white animate-pulse'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isCompleted ? '✓' : '3'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            Stage 3: Work Completion & Escrow Release OTP
                          </h4>
                          <p className="text-[11px] text-slate-600">
                            Releases ${currentActiveJob.proposedLaborFee?.toFixed(2) || '0.00'} from Escrow directly into your worker wallet.
                          </p>
                        </div>
                      </div>

                      <div>
                        {isCompleted ? (
                          <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono font-bold">
                            <Check className="w-3.5 h-3.5" />
                            Escrow Settled & Transferred ($
                            {currentActiveJob.proposedLaborFee?.toFixed(2)})
                          </span>
                        ) : isInProgress ? (
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono font-bold animate-pulse">
                            ● Active: Awaiting Completion OTP
                          </span>
                        ) : (
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 font-mono">
                            Unlocks when Work is In Progress
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stage 3 Verification Input Area */}
                    {!isCompleted && (
                      <div className="pt-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                          <div>
                            <span className="text-xs font-semibold text-slate-800 block">
                              Enter Client's 4-Digit Work-End Release OTP:
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Client inspects the completed repair and provides this final release code.
                            </span>
                          </div>

                          {/* Quick Auto-Fill helper */}
                          {currentActiveJob.workEndOtp && (
                            <button
                              type="button"
                              onClick={() => {
                                setWorkEndOtpInput(currentActiveJob.workEndOtp);
                                setEndError('');
                              }}
                              className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-mono transition flex items-center gap-1.5 self-start sm:self-auto"
                            >
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>Sync Client OTP: <strong>{currentActiveJob.workEndOtp}</strong> [Fill]</span>
                            </button>
                          )}
                        </div>

                        <form onSubmit={handleVerifyEndOtp} className="flex flex-col sm:flex-row items-center gap-3">
                          <input
                            type="text"
                            maxLength="4"
                            value={workEndOtpInput}
                            disabled={!isInProgress || isVerifying}
                            onChange={(e) => {
                              setWorkEndOtpInput(e.target.value);
                              setEndError('');
                            }}
                            placeholder="e.g. 6742"
                            className="w-full sm:w-44 text-center px-4 py-2.5 bg-white border border-emerald-300 rounded-xl text-slate-900 font-mono text-xl tracking-widest focus:border-emerald-600 focus:outline-none disabled:opacity-50"
                          />

                          <button
                            type="submit"
                            disabled={!isInProgress || isVerifying || workEndOtpInput.length !== 4}
                            className="w-full sm:w-auto py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 whitespace-nowrap"
                          >
                            <KeyRound className="w-4 h-4" />
                            <span>
                              {isVerifying
                                ? 'Settling Escrow...'
                                : `Verify & Release $${currentActiveJob.proposedLaborFee?.toFixed(2) || '0.00'} to Wallet`}
                            </span>
                          </button>
                        </form>

                        {endError && (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                            <span>{endError}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Disputed State Notice */}
              {isDisputed && (
                <div className="p-5 bg-rose-50 border border-rose-300 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider font-mono">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Work Contested • Escrow Frozen Pending Admin Review
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    The client has withheld the completion OTP and filed a dispute: "{currentActiveJob.dispute?.reason}".
                    The escrow funds are safely locked in platform custody. The administrator will review and resolve the case.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Available Jobs Feed */}
      {activeTab === 'AVAILABLE_FEED' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Real-Time Available Jobs & Broadcasts</h3>
              <p className="text-xs text-slate-500">Emergency broadcasts and open inquiries within 10 km</p>
            </div>
          </div>

          {availableBroadcasts.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 shadow-sm">
              No unclaimed emergency broadcasts right now. Check back soon or toggle to your Active Job.
            </div>
          ) : (
            <div className="space-y-3">
              {availableBroadcasts.map((b) => (
                <div
                  key={b.id}
                  className="bg-white border border-rose-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-rose-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        EMERGENCY BROADCAST
                      </span>
                      <span className="font-mono text-xs text-indigo-700 font-bold">{b.id}</span>
                      <span className="text-xs font-mono text-slate-500">• {b.category}</span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{b.title}</h4>
                    <p className="text-xs text-slate-600 max-w-xl">{b.description}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                        {b.clientAddress}
                      </span>
                      <span>•</span>
                      <span>Client: <strong className="text-slate-800">{b.clientName}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Guaranteed Base</span>
                      <span className="text-xl font-mono font-bold text-rose-600">${b.proposedLaborFee?.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={() => {
                        workerClaimEmergencyJob(b.id, worker.id);
                        setSelectedJobId(b.id);
                        setActiveTab('ACTIVE_JOB');
                      }}
                      className="w-full sm:w-auto py-3 px-5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Claim Emergency Call</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Reviews & Verification Credentials */}
      {activeTab === 'PROFILE_REVIEWS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Verified Documents */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Verified Credentials & Licenses</h3>
                <span className="text-xs font-mono text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                  Admin Approved
                </span>
              </div>

              <div className="space-y-2.5">
                {worker?.documents?.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-cyan-600" />
                      <div>
                        <span className="text-slate-800 font-medium block">{doc.name}</span>
                        <span className="text-[10px] text-slate-500">{doc.type}</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono font-semibold">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Reviews List */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Client Reviews & Testimonials</h3>
                <span className="text-xs text-amber-600 font-bold font-mono">
                  {worker?.rating || 3.8}★ ({worker?.reviews?.length || 0})
                </span>
              </div>

              {(!worker?.reviews || worker.reviews.length === 0) ? (
                <p className="text-xs text-slate-500 text-center py-6">No reviews logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {worker.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-900">{rev.clientName}</span>
                        <span className="text-amber-600 font-bold flex items-center gap-1 font-mono">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {rev.rating}.0
                        </span>
                      </div>
                      <p className="text-slate-600 italic text-[11px]">"{rev.comment}"</p>
                      <span className="text-[10px] text-slate-500 font-mono block text-right">{rev.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Job Chat Modal */}
      {currentActiveJob && (
        <JobChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          job={currentActiveJob}
        />
      )}
    </div>
  );
}
