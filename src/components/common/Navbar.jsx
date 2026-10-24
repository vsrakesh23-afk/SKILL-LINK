// src/components/common/Navbar.jsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Zap, 
  Wallet, 
  Plus, 
  LogOut, 
  Shield, 
  User, 
  HardHat, 
  Sparkles
} from 'lucide-react';
import AddFundsModal from './AddFundsModal';

export default function Navbar({ onNavigateToRoleChooser }) {
  const { currentUser, clients, workers, logout, supabaseStatus } = useApp();
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);

  const client = currentUser?.role === 'CLIENT' ? clients.find((c) => c.id === currentUser.id) : null;
  const worker = currentUser?.role === 'WORKER' ? workers.find((w) => w.id === currentUser.id) : null;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Platform Info */}
          <div 
            onClick={onNavigateToRoleChooser}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition">
                  SkillLink
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Escrow Secure
                </span>
                <div 
                  className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border bg-slate-50 border-slate-200"
                  title={supabaseStatus?.online ? `Connected to Supabase PostgreSQL (${supabaseStatus.latencyMs}ms)` : 'Operating in resilient Local Storage mode'}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${supabaseStatus?.online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
                  <span className={supabaseStatus?.online ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                    {supabaseStatus?.online ? 'Supabase Live' : 'Local Fallback'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Hyperlocal Trades & OTP Settlements
              </p>
            </div>
          </div>

          {/* Right Navigation & Persona Status */}
          <div className="flex items-center gap-3 sm:gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                {/* Client Balance Badge */}
                {currentUser.role === 'CLIENT' && (
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <div className="text-left text-xs">
                      <span className="text-[10px] text-slate-500 block leading-tight font-medium">Client Wallet</span>
                      <span className="font-mono font-bold text-slate-900">
                        ${client ? client.walletBalance.toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsAddFundsOpen(true)}
                      className="ml-1 p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                      title="Add Funds to Wallet"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Worker Earnings Badge */}
                {currentUser.role === 'WORKER' && (
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                    <Wallet className="w-4 h-4 text-cyan-600" />
                    <div className="text-left text-xs">
                      <span className="text-[10px] text-slate-500 block leading-tight font-medium">Earnings Balance</span>
                      <span className="font-mono font-bold text-cyan-800">
                        ${worker ? worker.walletBalance.toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Admin Status Badge */}
                {currentUser.role === 'ADMIN' && (
                  <div className="hidden sm:flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl text-xs">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <div>
                      <span className="text-[10px] text-purple-700 font-bold block leading-tight">Admin Master</span>
                      <span className="font-semibold text-slate-900">Dispute & Verification</span>
                    </div>
                  </div>
                )}

                {/* Profile Pill */}
                <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700 overflow-hidden shadow-xs">
                    {currentUser.role === 'CLIENT' && (
                      client?.avatar ? (
                        <img src={client.avatar} alt={client.name} className="w-full h-full object-cover" />
                      ) : <User className="w-4 h-4 text-indigo-600" />
                    )}
                    {currentUser.role === 'WORKER' && (
                      worker?.avatar ? (
                        <img src={worker.avatar} alt={worker.name} className="w-full h-full object-cover" />
                      ) : <HardHat className="w-4 h-4 text-cyan-600" />
                    )}
                    {currentUser.role === 'ADMIN' && <Shield className="w-4 h-4 text-purple-600" />}
                  </div>

                  <div className="hidden md:block text-left text-xs">
                    <p className="font-semibold text-slate-900 leading-tight">{currentUser.name}</p>
                    <span className="text-[10px] text-indigo-600 font-mono font-medium">{currentUser.id}</span>
                  </div>

                  <button
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Log out and return to portal selection"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onNavigateToRoleChooser}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Select Portal / Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Add Funds Modal */}
      <AddFundsModal isOpen={isAddFundsOpen} onClose={() => setIsAddFundsOpen(false)} />
    </>
  );
}
