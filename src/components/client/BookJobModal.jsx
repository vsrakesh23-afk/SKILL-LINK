// src/components/client/BookJobModal.jsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Wrench, 
  Zap, 
  MapPin, 
  Star, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Radio, 
  CheckCircle2, 
  Clock, 
  Flame 
} from 'lucide-react';

export default function BookJobModal({ isOpen, onClose, preselectedCategory = null }) {
  const { 
    currentUser, 
    clients, 
    workers, 
    categories, 
    createStandardJob, 
    createEmergencyJob 
  } = useApp();

  const client = clients.find((c) => c.id === currentUser?.id);

  const [step, setStep] = useState(1); // 1: Job Details & Category, 2: Worker Matching (if Standard)
  const [isEmergency, setIsEmergency] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(preselectedCategory || 'Plumbing Services');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState(client?.address || '742 Evergreen Terrace, Sector 4');
  const [baseFee, setBaseFee] = useState('90');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');

  if (!isOpen || !currentUser) return null;

  // Helper for flexible skill & trade matching
  const isSkillMatch = (workerSkills, category) => {
    if (!Array.isArray(workerSkills)) return false;
    const catLower = (category || '').toLowerCase().trim();
    return workerSkills.some((skill) => {
      const sLower = (skill || '').toLowerCase().trim();
      if (sLower === catLower || sLower.includes(catLower) || catLower.includes(sLower)) return true;
      if (sLower.includes('plumb') && catLower.includes('plumb')) return true;
      if (sLower.includes('electr') && catLower.includes('electr')) return true;
      if (sLower.includes('carpent') && catLower.includes('carpent')) return true;
      if (
        (sLower.includes('ac') || sLower.includes('appliance') || sLower.includes('hvac')) &&
        (catLower.includes('ac') || catLower.includes('appliance') || catLower.includes('hvac'))
      ) return true;
      if (sLower.includes('paint') && catLower.includes('paint')) return true;
      if (sLower.includes('mason') && catLower.includes('mason')) return true;
      return false;
    });
  };

  // Filter verified workers matching category and sort by distance
  const matchingWorkers = workers
    .filter((w) => (w.status === 'VERIFIED' || !w.status) && isSkillMatch(w.skills, selectedCategory))
    .sort((a, b) => (a.distanceKm || 1.5) - (b.distanceKm || 1.5));

  const handleNextOrSubmit = (e) => {
    e.preventDefault();
    if (!title || !description || !address) return;

    if (isEmergency) {
      // Direct emergency broadcast!
      createEmergencyJob({
        clientId: currentUser.id,
        category: selectedCategory,
        title,
        description,
        address,
        baseFee: parseFloat(baseFee) || 90,
      });
      onClose();
    } else {
      // Proceed to worker matching step
      setStep(2);
      if (matchingWorkers.length > 0 && !selectedWorkerId) {
        setSelectedWorkerId(matchingWorkers[0].id);
      }
    }
  };

  const handleConfirmStandardBooking = () => {
    if (!selectedWorkerId) return;

    createStandardJob({
      clientId: currentUser.id,
      category: selectedCategory,
      title,
      description,
      address,
      workerId: selectedWorkerId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`p-5 border-b border-slate-200 flex items-center justify-between transition-colors ${
          isEmergency ? 'bg-rose-50 border-rose-200' : 'bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isEmergency
                ? 'bg-rose-100 border-rose-200 text-rose-700'
                : 'bg-indigo-100 border-indigo-200 text-indigo-700'
            }`}>
              {isEmergency ? <Zap className="w-5 h-5 text-rose-600" /> : <Wrench className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  {isEmergency ? 'Instant Emergency Dispatch' : 'Book Local Trade Service'}
                </h3>
                {isEmergency && (
                  <span className="bg-rose-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                    Critical Alert
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {step === 1 ? 'Step 1 of 2: Job Scope & Urgency' : 'Step 2 of 2: Select Proximity-Matched Tradesperson'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {step === 1 && (
            <form onSubmit={handleNextOrSubmit} className="space-y-4">
              {/* Emergency Toggle Banner */}
              <div
                onClick={() => setIsEmergency(!isEmergency)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                  isEmergency
                    ? 'bg-rose-50 border-rose-300 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    isEmergency ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">
                      Toggle Emergency Job Mode
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {isEmergency
                        ? 'Broadcasts to all online workers. First to accept claims. 2 OTPs only.'
                        : 'Standard mode: Browse & match nearby worker, negotiate labor on-site.'}
                    </span>
                  </div>
                </div>

                <div className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                  isEmergency ? 'bg-rose-600' : 'bg-slate-300'
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isEmergency ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Trade Specialty
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:border-indigo-600 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name} className="bg-white text-slate-900">
                      {c.name} ({c.avgRate})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Issue Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Leaking high-pressure pipe under bathroom sink"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:border-indigo-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Problem Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened, any visible damage, parts needed, or special access instructions."
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:border-indigo-600 focus:outline-none resize-none"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:border-indigo-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Emergency Base Rate if Emergency is Active */}
              {isEmergency && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-700 font-medium">Standard Emergency Base Labor:</span>
                    <span className="font-mono text-rose-700 font-bold">$90.00</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Includes rush diagnostic dispatch fee. Escrow will auto-lock upon Work-Start OTP.
                  </p>
                </div>
              )}

              {/* Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm ${
                    isEmergency
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isEmergency ? (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Broadcast Emergency Alert to All Workers</span>
                    </>
                  ) : (
                    <>
                      <span>Find Nearby Qualified Tradespeople</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Proximity Worker Matching (Standard Flow) */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs">
                    Available Verified {selectedCategory}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Sorted by proximity to your address
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-indigo-600 hover:underline font-medium"
                >
                  Edit Job Details
                </button>
              </div>

              {matchingWorkers.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-800 font-semibold">No verified workers currently online for this specialty.</p>
                  <p className="text-[11px] text-slate-500 mt-1">Try switching categories or toggle Emergency Broadcast.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {matchingWorkers.map((w) => {
                    const isSelected = selectedWorkerId === w.id;
                    return (
                      <div
                        key={w.id}
                        onClick={() => setSelectedWorkerId(w.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 shadow-sm ring-1 ring-indigo-200'
                            : 'bg-white border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                              {w.avatar ? (
                                <img src={w.avatar} alt={w.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="w-full h-full flex items-center justify-center font-bold text-slate-700 text-sm">{w.name[0]}</span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm">{w.name}</span>
                                <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] px-1.5 py-0.2 rounded font-mono font-medium">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  Verified
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                                <span className="flex items-center gap-1 text-amber-600 font-bold">
                                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                  {w.rating || 3.8}★
                                </span>
                                <span>•</span>
                                <span className="font-mono text-cyan-700 font-semibold">
                                  {w.trustScore}% Trust
                                </span>
                                <span>•</span>
                                <span>{w.reviewsCount} reviews</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-indigo-700 block">
                              {w.distanceKm} km away
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              ~${w.hourlyRate}/hr base
                            </span>
                          </div>
                        </div>

                        {/* Recent review snippet */}
                        {w.reviews && w.reviews[0] && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600 italic">
                            "{w.reviews[0].comment}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Confirm Selection */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition border border-slate-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!selectedWorkerId}
                  onClick={handleConfirmStandardBooking}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Request Selected Tradesperson</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
