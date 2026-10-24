// src/components/auth/AdminAuth.jsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  AlertCircle 
} from 'lucide-react';

export default function AdminAuth({ onBack }) {
  const { loginAdmin } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = loginAdmin(username, password);
    if (!res.success) {
      setError(res.message);
    }
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
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
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-purple-700 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Admin Command Center</h2>
            <p className="text-xs text-slate-500">Dispute arbitration, verification queue & escrow ledger</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Administrator ID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-sm focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Secure Passkey
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-sm focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none transition"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Preset helper */}
          <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-900 font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-purple-600" />
                Preset Credentials
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold underline font-mono"
              >
                Auto-fill
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Preset demo admin credentials: <code className="text-purple-800 bg-white px-1.5 py-0.5 rounded border border-purple-200 font-mono">admin</code> / <code className="text-purple-800 bg-white px-1.5 py-0.5 rounded border border-purple-200 font-mono">admin123</code>
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-purple-700/20 flex items-center justify-center gap-2"
          >
            <span>Enter Admin Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
