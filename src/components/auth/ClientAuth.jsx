// src/components/auth/ClientAuth.jsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  UserPlus, 
  LogIn,
  KeyRound,
  ShieldCheck,
  MapPin
} from 'lucide-react';

export default function ClientAuth({ onBack }) {
  const { loginClient, signupClient, clients } = useApp();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'

  // Login form state
  const [clientIdInput, setClientIdInput] = useState('CLI-1042');
  const [loginError, setLoginError] = useState('');

  // Signup form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [createdClient, setCreatedClient] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    if (!clientIdInput.trim()) {
      setLoginError('Please enter a valid Client ID.');
      return;
    }
    const res = loginClient(clientIdInput.trim());
    if (!res.success) {
      setLoginError(res.message);
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email || !formData.address) {
      return;
    }
    const res = signupClient(formData);
    if (res.success) {
      setCreatedClient(res.client);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-12">
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
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-600 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Client Portal Access</h2>
            <p className="text-xs text-slate-500">Hire verified trades with OTP escrow security</p>
          </div>
        </div>

        {/* Tab Switcher */}
        {!createdClient && (
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200 text-xs">
            <button
              onClick={() => { setMode('login'); setLoginError(''); }}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login via Client ID</span>
            </button>
            <button
              onClick={() => { setMode('signup'); setLoginError(''); }}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Client Sign Up</span>
            </button>
          </div>
        )}

        {/* Mode 1: Login */}
        {mode === 'login' && !createdClient && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assigned Client ID
              </label>
              <input
                type="text"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                placeholder="e.g. CLI-1042"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-sm uppercase tracking-wide focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition"
                required
              />
              {loginError && (
                <p className="text-rose-600 text-xs mt-1.5 font-medium">{loginError}</p>
              )}
            </div>

            {/* Quick Demo Accounts */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 block mb-2 font-mono">
                ⚡ Demo Client Accounts:
              </span>
              <div className="space-y-2">
                {clients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setClientIdInput(c.id)}
                    className="w-full p-2.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center justify-between text-left text-xs transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-600">{c.id}</span>
                      <span className="text-slate-800 font-medium">{c.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">${c.walletBalance.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              <span>Access Client Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Mode 2: Sign Up */}
        {mode === 'signup' && !createdClient && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Eleanor Vance"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-indigo-600 focus:outline-none"
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
                  placeholder="+1 (555) 012-3456"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-indigo-600 focus:outline-none"
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
                  placeholder="eleanor@example.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-indigo-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Home / Service Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="42 Hill House Lane, Springfield"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-indigo-600 focus:outline-none"
                required
              />
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="leading-tight">
                <strong>Starter Promotion:</strong> New client registrations receive a complimentary $250.00 escrow test wallet balance!
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              <span>Create Account & Generate ID</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Mode 3: Created Confirmation */}
        {createdClient && (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Welcome to SkillLink!</h3>
              <p className="text-xs text-slate-600 mt-1">Your client credentials have been issued.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-500 font-medium">Your Unique Client ID:</span>
                <span className="font-mono text-base font-black text-indigo-600">{createdClient.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-500 font-medium">Starter Balance:</span>
                <span className="font-mono font-bold text-emerald-600">${createdClient.walletBalance.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => loginClient(createdClient.id)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-indigo-600/20"
            >
              Enter Client Dashboard Now →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
