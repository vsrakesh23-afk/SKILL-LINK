// src/components/auth/RoleChooser.jsx
import React from 'react';
import { 
  Users, 
  HardHat, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Lock,
  Radio
} from 'lucide-react';

export default function RoleChooser({ onSelectRole }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Title */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Production-Grade Hyperlocal Trade Ecosystem</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Select Your Portal in <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 bg-clip-text text-transparent">SkillLink</span>
        </h1>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Secure escrow-backed trades with 3-stage OTP protection, instant emergency broadcasts, verified local technicians, and an impartial dispute adjudication center.
        </p>
      </div>

      {/* Role Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Card 1: Client Portal */}
        <div className="relative group bg-white border border-slate-200 hover:border-indigo-500 rounded-3xl p-7 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition duration-300 shadow-xs">
              <Users className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 font-mono">
                Portal 01 • Demand
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Client Portal</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Book certified local tradespeople, negotiate transparent on-site labor quotes, and control funds through 3-tier OTP releases.
              </p>
            </div>

            <ul className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>On-site transparent quote negotiation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Escrow locked until job verified complete</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>1-Click Emergency hazard broadcast</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Withhold completion OTP & raise dispute</span>
              </li>
            </ul>
          </div>

          <div className="pt-8 mt-6 border-t border-slate-100">
            <button
              onClick={() => onSelectRole('CLIENT')}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 group-hover:gap-3"
            >
              <span>Enter Client Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2.5 font-mono">
              Sign Up or Enter with Client ID
            </p>
          </div>
        </div>

        {/* Card 2: Worker Portal */}
        <div className="relative group bg-white border border-slate-200 hover:border-cyan-500 rounded-3xl p-7 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-cyan-500/10 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 group-hover:scale-105 group-hover:bg-cyan-600 group-hover:text-white transition duration-300 shadow-xs">
              <HardHat className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700 font-mono">
                Portal 02 • Supply
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Tradesperson Portal</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Access hyper-local trade job leads, claim urgent emergency calls, verify OTPs on-site, and receive guaranteed payouts.
              </p>
            </div>

            <ul className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Hyper-local dispatched service feeds</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Guaranteed escrow-backed payment</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Direct on-site diagnosis fee proposals</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Automated trust score & review tracking</span>
              </li>
            </ul>
          </div>

          <div className="pt-8 mt-6 border-t border-slate-100">
            <button
              onClick={() => onSelectRole('WORKER')}
              className="w-full py-3 px-4 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-cyan-700/25 group-hover:gap-3"
            >
              <span>Enter Worker Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2.5 font-mono">
              Apply for KYC or Log In via Worker ID
            </p>
          </div>
        </div>

        {/* Card 3: Admin Portal */}
        <div className="relative group bg-white border border-slate-200 hover:border-purple-500 rounded-3xl p-7 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 group-hover:scale-105 group-hover:bg-purple-700 group-hover:text-white transition duration-300 shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 font-mono">
                Portal 03 • Governance
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Admin Command Center</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Approve worker license certificates, arbitrate disputed escrow funds with split refunds, and inspect immutable audit logs.
              </p>
            </div>

            <ul className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Worker KYC document review & verification</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Split escrow arbitration (0% to 100%)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Audit trail grouped by individual worker</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Platform financial oversight & escrow health</span>
              </li>
            </ul>
          </div>

          <div className="pt-8 mt-6 border-t border-slate-100">
            <button
              onClick={() => onSelectRole('ADMIN')}
              className="w-full py-3 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-purple-700/25 group-hover:gap-3"
            >
              <span>Enter Admin Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2.5 font-mono">
              Secure Credential Authentication
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
