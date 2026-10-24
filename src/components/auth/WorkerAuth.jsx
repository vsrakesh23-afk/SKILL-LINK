// src/components/auth/WorkerAuth.jsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  HardHat, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Upload, 
  FileText, 
  Clock, 
  LogIn, 
  UserPlus, 
  ShieldCheck 
} from 'lucide-react';

export default function WorkerAuth({ onBack }) {
  const { loginWorker, registerWorker, workers, categories } = useApp();
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // Login state
  const [workerIdInput, setWorkerIdInput] = useState('WRK-8291');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    skills: ['Plumbing Services'],
    experienceYears: '5',
    hourlyRate: '45',
  });
  const [mockDocs, setMockDocs] = useState([
    { name: 'Trade_License_Proof.pdf', size: '1.4 MB' },
    { name: 'National_Identity_Card.pdf', size: '2.1 MB' },
  ]);
  const [submittedWorker, setSubmittedWorker] = useState(null);

  const handleToggleSkill = (skillName) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skillName);
      if (exists) {
        if (prev.skills.length === 1) return prev; // keep at least 1
        return { ...prev, skills: prev.skills.filter((s) => s !== skillName) };
      } else {
        return { ...prev, skills: [...prev.skills, skillName] };
      }
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    if (!workerIdInput.trim()) {
      setLoginError('Please enter a Worker ID.');
      return;
    }
    const res = loginWorker(workerIdInput.trim());
    if (!res.success) {
      setLoginError(res.message);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) return;

    const res = registerWorker({
      ...formData,
      documentNames: mockDocs.map((d) => d.name),
    });

    if (res.success) {
      setSubmittedWorker(res.worker);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Portal Selection</span>
      </button>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-2xl text-cyan-700 shadow-xs">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Tradesperson Portal</h2>
            <p className="text-xs text-slate-500">Access dispatched jobs & verified escrow payouts</p>
          </div>
        </div>

        {/* Tab Switcher */}
        {!submittedWorker && (
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200 text-xs">
            <button
              onClick={() => { setMode('login'); setLoginError(''); }}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white text-cyan-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login via Worker ID</span>
            </button>
            <button
              onClick={() => { setMode('register'); setLoginError(''); }}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-white text-cyan-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Trade Profile</span>
            </button>
          </div>
        )}

        {/* Mode 1: Login */}
        {mode === 'login' && !submittedWorker && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assigned Worker ID
              </label>
              <input
                type="text"
                value={workerIdInput}
                onChange={(e) => setWorkerIdInput(e.target.value)}
                placeholder="e.g. WRK-8291"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-sm uppercase tracking-wide focus:bg-white focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 focus:outline-none transition"
                required
              />
              {loginError && (
                <p className="text-rose-600 text-xs mt-1.5 font-medium">{loginError}</p>
              )}
            </div>

            {/* Quick Demo Worker Accounts */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 block mb-2 font-mono">
                ⚡ Verified Demo Worker Accounts:
              </span>
              <div className="space-y-2">
                {workers
                  .filter((w) => w.status === 'VERIFIED')
                  .map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWorkerIdInput(w.id)}
                      className="w-full p-2.5 bg-slate-50 hover:bg-cyan-50/70 border border-slate-200 hover:border-cyan-300 rounded-xl flex items-center justify-between text-left text-xs transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-700">{w.id}</span>
                        <span className="text-slate-900 font-medium">{w.name}</span>
                        <span className="text-[10px] text-slate-500">({w.skills[0]})</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold font-mono">★ {w.rating}</span>
                    </button>
                  ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-cyan-700 hover:bg-cyan-800 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-cyan-700/20 flex items-center justify-center gap-2"
            >
              <span>Access Worker Dispatch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Mode 2: Register */}
        {mode === 'register' && !submittedWorker && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Marcus Vance"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-cyan-600 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 789-0123"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-cyan-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="marcus.vance@trades.net"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-cyan-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Skills selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Qualified Trade Skills * (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = formData.skills.includes(cat.name);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleToggleSkill(cat.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-cyan-50 border-cyan-400 text-cyan-800 font-semibold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />}
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-cyan-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Standard Hourly Rate ($)
                </label>
                <input
                  type="number"
                  min="20"
                  max="250"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-cyan-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Document Uploads Mock */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                KYC Verification Proofs & Licenses
              </label>
              <div className="space-y-2">
                {mockDocs.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-600" />
                      <span className="font-mono text-[11px] font-medium text-slate-800">{doc.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{doc.size}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="leading-tight">
                <strong>Admin KYC Review:</strong> Registrations undergo administrative document verification before entering the live job dispatch pool. Starting rating is set to 3.8 ★ upon approval.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-cyan-700 hover:bg-cyan-800 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-cyan-700/20 flex items-center justify-center gap-2"
            >
              <span>Submit Application for Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Mode 3: Submitted Confirmation */}
        {submittedWorker && (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <Clock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Application Submitted!</h3>
              <p className="text-xs text-slate-600 mt-1">Your trade profile is pending Admin Review.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Temporary Ref ID:</span>
                <span className="font-mono font-bold text-slate-800">{submittedWorker.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  PENDING_VERIFICATION
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Starting Rating:</span>
                <span className="font-mono font-bold text-slate-800">3.8 ★ (Baseline)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Tip: You can switch to the Admin Portal to immediately approve this application and issue an official Worker ID.
            </p>

            <button
              onClick={() => {
                setSubmittedWorker(null);
                setMode('login');
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition"
            >
              Back to Worker Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
