// src/components/common/AddFundsModal.jsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Wallet, X, CreditCard, ShieldCheck, ArrowRight, Check } from 'lucide-react';

export default function AddFundsModal({ isOpen, onClose }) {
  const { currentUser, clients, addClientFunds } = useApp();
  const [amount, setAmount] = useState('100');
  const [method, setMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !currentUser || currentUser.role !== 'CLIENT') return null;

  const client = clients.find((c) => c.id === currentUser.id);

  const handleDeposit = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;

    setLoading(true);
    setTimeout(() => {
      addClientFunds(currentUser.id, val);
      setLoading(false);
      onClose();
    }, 600);
  };

  const presets = [50, 100, 200, 500];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden text-slate-900">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 border border-indigo-200 rounded-xl text-indigo-700">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Add Wallet Balance</h3>
              <p className="text-xs text-slate-500">Escrow Pre-funding & Job Security</p>
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
        <form onSubmit={handleDeposit} className="p-6 space-y-5">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Current Available Balance:</span>
            <span className="font-mono text-emerald-700 text-sm font-bold">
              ${client ? client.walletBalance.toFixed(2) : '0.00'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select or Enter Amount ($)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                min="10"
                step="5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-base focus:border-indigo-600 focus:outline-none"
                placeholder="100.00"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2 mt-2.5">
              {presets.map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmount(val.toString())}
                  className={`py-1.5 rounded-lg text-xs font-semibold font-mono border transition ${
                    amount === val.toString()
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  +${val}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Payment Method (Simulated Instant Clearance)
            </label>
            <div className="space-y-2">
              <label
                onClick={() => setMethod('card')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                  method === 'card'
                    ? 'bg-indigo-50 border-indigo-300 text-slate-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 text-xs">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Credit / Debit Card</p>
                    <p className="text-[11px] text-slate-500">•••• 4242 (Instant Zero Fee)</p>
                  </div>
                </div>
                {method === 'card' && <Check className="w-4 h-4 text-indigo-600" />}
              </label>

              <label
                onClick={() => setMethod('instant_bank')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                  method === 'instant_bank'
                    ? 'bg-indigo-50 border-indigo-300 text-slate-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Instant Escrow Pre-Authorization</p>
                    <p className="text-[11px] text-slate-500">Auto-cleared direct escrow reserve</p>
                  </div>
                </div>
                {method === 'instant_bank' && <Check className="w-4 h-4 text-emerald-600" />}
              </label>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Escrow guarantee: Funds remain in your account until you approve Acceptance OTP.</span>
          </div>

          {/* Action */}
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
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              {loading ? (
                <span>Authorizing...</span>
              ) : (
                <>
                  <span>Deposit ${amount || '0'}</span>
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
