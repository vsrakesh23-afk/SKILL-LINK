// src/components/common/JobChatModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Send, 
  MessageSquare, 
  Clock, 
  CheckCheck, 
  Sparkles,
  MapPin,
  ShieldCheck,
  User,
  HardHat
} from 'lucide-react';

export default function JobChatModal({ isOpen, onClose, job, currentUserRole }) {
  const { sendJobMessage, currentUser } = useApp();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  if (!isOpen || !job) return null;

  const messages = Array.isArray(job.messages) ? job.messages : [];

  const isClient = currentUserRole === 'CLIENT';
  const partnerName = isClient ? job.workerName || 'Assigned Technician' : job.clientName || 'Client';
  const partnerRole = isClient ? 'Certified Tradesperson' : 'Client';

  // Quick Action Chips depending on role
  const quickSuggestions = isClient
    ? [
        'What is your current ETA?',
        'Gate code is #1042',
        'Main water valve is already shut off',
        'Please ring doorbell when you arrive',
      ]
    : [
        'I am en route, ETA 8 mins',
        'I have arrived at your building entrance',
        'Completed inspection, preparing quote',
        'Tools ready, commencing repair now',
      ];

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text || !text.trim()) return;

    sendJobMessage(job.id, {
      senderRole: isClient ? 'CLIENT' : 'WORKER',
      senderName: currentUser?.name || (isClient ? 'Client' : 'Technician'),
      text: text.trim(),
    });

    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl flex flex-col h-[600px] max-h-[90vh] overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm ${
              isClient ? 'bg-cyan-600' : 'bg-indigo-600'
            }`}>
              {isClient ? <HardHat className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">{partnerName}</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active On-Site
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                {partnerRole} • Ref: {job.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition"
            title="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Job Context Strip */}
        <div className="px-5 py-2.5 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-indigo-700 uppercase tracking-wider text-[10px] bg-white border border-indigo-200 px-1.5 py-0.5 rounded font-mono">
              {job.category}
            </span>
            <span className="truncate font-medium">{job.title}</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-700 flex-shrink-0 ml-2">
            Escrow: ${job.totalEscrowAmount ? job.totalEscrowAmount.toFixed(2) : 'Pending'}
          </span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/40">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-slate-600">Direct In-App Messaging</p>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Communicate directly regarding on-site instructions, arrival time, or service access.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = (isClient && msg.senderRole === 'CLIENT') || (!isClient && msg.senderRole === 'WORKER');
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 px-1 mb-0.5 font-medium">
                    {msg.senderName} • {msg.time}
                  </span>
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions Chips */}
        <div className="px-4 py-2 border-t border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
          <span className="text-slate-400 font-semibold flex-shrink-0 text-[10px] uppercase font-mono">Quick:</span>
          {quickSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(suggestion)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200 rounded-full whitespace-nowrap text-slate-600 transition text-[11px]"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${partnerName}...`}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition flex items-center justify-center shadow-md shadow-indigo-600/20"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
