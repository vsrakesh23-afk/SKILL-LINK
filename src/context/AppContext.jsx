// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SERVICE_CATEGORIES,
  INITIAL_CLIENTS,
  INITIAL_WORKERS,
  INITIAL_JOBS,
  INITIAL_ESCROW_LEDGER,
  INITIAL_AUDIT_LOGS,
} from './mockData';
import {
  checkSupabaseConnection,
  fetchLiveSkills,
  fetchLiveWorkers,
  syncClientToSupabase,
  syncWorkerToSupabase,
  logAuditToSupabase,
  supabaseRpcCreateJob,
  supabaseRpcWorkerSubmitFee,
  supabaseRpcClientAcceptQuote,
  supabaseRpcVerifyAcceptanceOtp,
  supabaseRpcVerifyStartOtp,
  supabaseRpcVerifyEndOtp,
  supabaseRpcRaiseDispute,
  supabaseRpcResolveDispute,
  supabaseRpcAdminVerifyWorker,
  supabaseRpcSubmitReview
} from '../services/supabaseClient';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  CLIENTS: 'skilllink_clients_v1',
  WORKERS: 'skilllink_workers_v1',
  JOBS: 'skilllink_jobs_v1',
  ESCROW: 'skilllink_escrow_v1',
  AUDIT: 'skilllink_audit_v1',
  AUTH: 'skilllink_current_user_v1',
};

function loadStored(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (err) {
    console.error(`Error loading ${key} from storage:`, err);
    return defaultValue;
  }
}

export function AppProvider({ children }) {
  const [categories] = useState(SERVICE_CATEGORIES);
  const [clients, setClients] = useState(() => loadStored(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS));
  const [workers, setWorkers] = useState(() => loadStored(STORAGE_KEYS.WORKERS, INITIAL_WORKERS));
  const [jobs, setJobs] = useState(() => loadStored(STORAGE_KEYS.JOBS, INITIAL_JOBS));
  const [escrowLedger, setEscrowLedger] = useState(() => loadStored(STORAGE_KEYS.ESCROW, INITIAL_ESCROW_LEDGER));
  const [auditLogs, setAuditLogs] = useState(() => loadStored(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS));
  
  // Current session: null, or { role: 'CLIENT' | 'WORKER' | 'ADMIN', id, name, ... }
  const [currentUser, setCurrentUser] = useState(() => {
    return loadStored(STORAGE_KEYS.AUTH, null);
  });

  const [toasts, setToasts] = useState([]);
  const [supabaseStatus, setSupabaseStatus] = useState({ online: false, latencyMs: 0 });

  // On Mount: Verify Live Supabase Connection & Sync Skills
  useEffect(() => {
    let isMounted = true;
    checkSupabaseConnection().then((res) => {
      if (isMounted) {
        setSupabaseStatus(res);
        if (res.online) {
          console.log(`⚡ Connected to Supabase PostgreSQL (${res.latencyMs}ms)`);
        }
      }
    });

    fetchLiveSkills().then((liveSkills) => {
      if (liveSkills && liveSkills.length > 0 && isMounted) {
        console.log(`📦 Loaded ${liveSkills.length} verified trade skills from Supabase`);
      }
    });

    fetchLiveWorkers().then((liveWorkers) => {
      if (liveWorkers && liveWorkers.length > 0 && isMounted) {
        setWorkers(liveWorkers);
        console.log(`👷 Loaded ${liveWorkers.length} live workers from Supabase database`);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    } catch (e) {}
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
    } catch (e) {}
  }, [workers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    } catch (e) {}
  }, [jobs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ESCROW, JSON.stringify(escrowLedger));
    } catch (e) {}
  }, [escrowLedger]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
    } catch (e) {}
  }, [auditLogs]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
      }
    } catch (e) {}
  }, [currentUser]);

  // Toast Helper
  const addToast = (title, message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type, time: 'Just now' }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Audit Logger Helper
  const logAudit = (type, actor, message, badge = 'info') => {
    const newLog = {
      id: `AUD-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type,
      badge,
      actor,
      message,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // Background sync to live Supabase audit_log table
    logAuditToSupabase({
      tableName: type,
      operation: badge.toUpperCase(),
      details: `${actor}: ${message}`
    });
  };

  // Helper: Generate 4-digit numeric OTP
  const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

  // Reset demo state
  const resetDemoData = () => {
    setClients(INITIAL_CLIENTS);
    setWorkers(INITIAL_WORKERS);
    setJobs(INITIAL_JOBS);
    setEscrowLedger(INITIAL_ESCROW_LEDGER);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUser({
      role: 'CLIENT',
      id: 'CLI-1042',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
    });
    addToast('Demo State Reset', 'SkillLink mock state restored to factory defaults.', 'success');
  };

  // ==========================================
  // AUTHENTICATION METHODS
  // ==========================================

  const loginClient = (clientId) => {
    const input = (clientId || '').trim().toLowerCase();
    const client = clients.find(
      (c) =>
        c.id.toLowerCase() === input ||
        (c.user_id && c.user_id.toLowerCase() === input) ||
        (c.email && c.email.toLowerCase() === input) ||
        (c.phone && c.phone.includes(input)) ||
        (c.name && c.name.toLowerCase().includes(input))
    ) || clients[0];

    if (!client) {
      return { success: false, message: `Client ID "${clientId}" not found in registry.` };
    }
    const session = {
      role: 'CLIENT',
      id: client.user_id || client.id,
      name: client.name,
      email: client.email,
    };
    setCurrentUser(session);
    addToast('Welcome back!', `Logged in as client ${client.name}`, 'success');
    return { success: true, client };
  };

  const signupClient = ({ name, phone, email, address }) => {
    const newId = `CLI-${Math.floor(1000 + Math.random() * 9000)}`;
    const newClient = {
      id: newId,
      name,
      phone,
      email,
      address,
      walletBalance: 250.00, // Starter bonus for testing!
      memberSince: 'Just now',
      avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 100000)}?w=150&auto=format&fit=crop&q=80`,
      rating: 5.0,
      completedJobsCount: 0,
    };
    setClients((prev) => [...prev, newClient]);
    const session = {
      role: 'CLIENT',
      id: newId,
      name: newClient.name,
      email: newClient.email,
    };
    setCurrentUser(session);
    logAudit('CLIENT_REGISTRATION', `${name} (${newId})`, `New client registered with $250.00 test wallet balance`);
    addToast('Account Created!', `Your unique Client ID is ${newId}`, 'success');

    // Sync client to Supabase users table
    syncClientToSupabase(newClient);

    return { success: true, client: newClient };
  };

  const registerWorker = ({ name, phone, email, skills, experienceYears, hourlyRate, address, documentNames }) => {
    const tempId = `WRK-PENDING-${Math.floor(100 + Math.random() * 900)}`;
    const mockDocs = (documentNames || ['National_ID.pdf', 'Trade_License.pdf']).map((docName, idx) => ({
      id: `DOC-NEW-${idx}`,
      name: docName,
      type: idx === 0 ? 'Government ID' : 'Trade Certificate',
      verified: false,
    }));

    const newWorker = {
      id: tempId,
      name,
      phone,
      email,
      address: address || '12 Community Road, Local Zone',
      skills: Array.isArray(skills) ? skills : [skills],
      experienceYears: Number(experienceYears) || 2,
      hourlyRate: Number(hourlyRate) || 40,
      distanceKm: 2.1,
      trustScore: 85,
      rating: 3.8, // Initial realistic starting rating
      reviewsCount: 0,
      status: 'PENDING_VERIFICATION',
      isOnline: true,
      walletBalance: 0.00,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      documents: mockDocs,
      reviews: [],
    };

    setWorkers((prev) => [...prev, newWorker]);
    logAudit('WORKER_REGISTRATION', `${name}`, `Registered for verification. Skills: ${newWorker.skills.join(', ')}`);
    addToast('Registration Submitted', 'Your profile is pending Admin verification.', 'info');

    // Sync worker to Supabase PL/pgSQL
    syncWorkerToSupabase(newWorker).then((res) => {
      if (res?.worker_id) {
        setWorkers((prev) =>
          prev.map((w) => (w.id === tempId ? { ...w, id: res.worker_id, user_id: res.worker_id } : w))
        );
      }
    });

    return { success: true, worker: newWorker };
  };

  const loginWorker = (workerId) => {
    const input = (workerId || '').trim().toLowerCase();
    const worker = workers.find(
      (w) =>
        w.id.toLowerCase() === input ||
        (w.user_id && w.user_id.toLowerCase() === input) ||
        (w.email && w.email.toLowerCase() === input) ||
        (w.phone && w.phone.includes(input)) ||
        (w.name && w.name.toLowerCase().includes(input)) ||
        (input === 'wrk-8291' && w.name.toLowerCase().includes('alex')) ||
        (input === 'wrk-7412' && w.name.toLowerCase().includes('sarah'))
    ) || (input === 'wrk-8291' ? workers[0] : null);

    if (!worker) {
      return { success: false, message: `Worker ID "${workerId}" not found.` };
    }
    if (worker.status === 'PENDING_VERIFICATION') {
      return { 
        success: false, 
        message: 'Your registration is still Pending Admin Verification. Please check back after admin approval.' 
      };
    }
    if (worker.status === 'SUSPENDED' || worker.status === 'REJECTED') {
      return { success: false, message: 'This worker account is currently inactive or suspended.' };
    }

    const session = {
      role: 'WORKER',
      id: worker.user_id || worker.id,
      name: worker.name,
      email: worker.email,
    };
    setCurrentUser(session);
    addToast('Welcome back!', `Logged in as tradesperson ${worker.name}`, 'success');
    return { success: true, worker };
  };

  const loginAdmin = (username, password) => {
    if (username.trim() === 'admin' && password === 'admin123') {
      const session = {
        role: 'ADMIN',
        id: 'ADM-001',
        name: 'Platform Overseer',
        email: 'admin@skilllink.io',
      };
      setCurrentUser(session);
      addToast('Admin Session Active', 'Logged into Admin Dispute & Verification Command Center', 'info');
      return { success: true };
    }
    return { success: false, message: 'Invalid Admin ID or Password. Use admin / admin123' };
  };

  const logout = () => {
    setCurrentUser(null);
    addToast('Logged Out', 'You have been safely disconnected.', 'info');
  };

  const switchPersona = (role, id = null) => {
    if (role === 'CLIENT') {
      const target = clients.find((c) => (id ? c.id === id : true)) || clients[0];
      setCurrentUser({ role: 'CLIENT', id: target.id, name: target.name, email: target.email });
      addToast('Switched Persona', `Now viewing as Client: ${target.name} (${target.id})`, 'info');
    } else if (role === 'WORKER') {
      const target = workers.find((w) => (id ? w.id === id : w.status === 'VERIFIED')) || workers[0];
      setCurrentUser({ role: 'WORKER', id: target.id, name: target.name, email: target.email });
      addToast('Switched Persona', `Now viewing as Worker: ${target.name} (${target.id})`, 'info');
    } else if (role === 'ADMIN') {
      setCurrentUser({ role: 'ADMIN', id: 'ADM-001', name: 'Platform Overseer', email: 'admin@skilllink.io' });
      addToast('Switched Persona', 'Now viewing as Administrator', 'info');
    }
  };

  // ==========================================
  // WALLET OPERATIONS
  // ==========================================

  const addClientFunds = (clientId, amount) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return false;

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          return { ...c, walletBalance: Number((c.walletBalance + numAmount).toFixed(2)) };
        }
        return c;
      })
    );

    logAudit('WALLET_TOPUP', clientId, `Added $${numAmount.toFixed(2)} to client wallet balance`, 'success');
    addToast('Funds Added', `Successfully deposited $${numAmount.toFixed(2)} to your wallet`, 'success');
    return true;
  };

  // ==========================================
  // JOB CREATION (Standard & Emergency)
  // ==========================================

  const createStandardJob = ({ clientId, category, title, description, address, workerId }) => {
    const client = clients.find((c) => c.id === clientId);
    const worker = workers.find((w) => w.id === workerId);
    if (!client || !worker) return null;

    const newJobId = `JOB-${Math.floor(700 + Math.random() * 200)}`;
    const acceptanceOtp = generateOtp();
    const workStartOtp = generateOtp();
    const workEndOtp = generateOtp();

    const newJob = {
      id: newJobId,
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      clientAddress: address || client.address,
      workerId: worker.id,
      workerName: worker.name,
      category,
      title,
      description,
      isEmergency: false,
      status: 'WORKER_EN_ROUTE', // Worker picked directly; traveling to site
      proposedLaborFee: null,
      platformFee: 5.00,
      totalEscrowAmount: null,
      acceptanceOtp,
      workStartOtp,
      workEndOtp,
      createdAt: new Date().toISOString(),
      timeline: [
        { time: 'Just now', event: `Service requested from ${worker.name}` },
        { time: 'Just now', event: `${worker.name} accepted request and is en route` },
      ],
    };

    setJobs((prev) => [newJob, ...prev]);
    logAudit('JOB_CREATED', `${client.name}`, `Booked ${worker.name} for ${category} (#${newJobId})`);
    addToast('Booking Confirmed', `${worker.name} has been assigned and is heading to your address!`, 'success');
    
    // Delegate to Supabase PL/pgSQL RPC
    supabaseRpcCreateJob({
      clientId: client.user_id || client.id,
      workerId: worker.user_id || worker.id,
      title,
      description,
      address: address || client.address,
      isEmergency: false,
      baseFee: 75.00
    });

    return newJob;
  };

  const createEmergencyJob = ({ clientId, category, title, description, address, baseFee = 90 }) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return null;

    const newJobId = `JOB-EMERGENCY-${Math.floor(500 + Math.random() * 200)}`;
    const workStartOtp = generateOtp();
    const workEndOtp = generateOtp();
    const fee = parseFloat(baseFee) || 90.00;
    const platformFee = 10.00;

    const newJob = {
      id: newJobId,
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      clientAddress: address || client.address,
      workerId: null, // Broadcasted!
      workerName: null,
      category,
      title,
      description,
      isEmergency: true,
      status: 'BROADCASTED_WAITING_CLAIM',
      proposedLaborFee: fee,
      platformFee,
      totalEscrowAmount: fee + platformFee,
      acceptanceOtp: null, // Emergency flow has no estimation talk; 2 OTPs only
      workStartOtp,
      workEndOtp,
      createdAt: new Date().toISOString(),
      timeline: [
        { time: 'Just now', event: `Emergency alert broadcasted to all online ${category} pros` },
      ],
    };

    setJobs((prev) => [newJob, ...prev]);
    logAudit('EMERGENCY_BROADCAST', client.name, `Triggered emergency broadcast #${newJobId} for ${category}`, 'danger');
    addToast('🚨 Emergency Broadcast Sent', 'Nearby qualified technicians alerted to claim immediately!', 'info');
    return newJob;
  };

  // ==========================================
  // WORKER ACTIONS & DISPATCH
  // ==========================================

  const workerClaimEmergencyJob = (jobId, workerId) => {
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return false;

    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId && job.status === 'BROADCASTED_WAITING_CLAIM') {
          return {
            ...job,
            workerId: worker.id,
            workerName: worker.name,
            status: 'WORKER_EN_ROUTE',
            timeline: [
              ...job.timeline,
              { time: 'Just now', event: `${worker.name} claimed emergency job and is rushing to site!` },
            ],
          };
        }
        return job;
      })
    );

    logAudit('EMERGENCY_CLAIMED', `${worker.name}`, `Claimed emergency job #${jobId} - en route`, 'warning');
    addToast('Emergency Claimed', 'You have secured this emergency job. Please head to the address immediately.', 'success');
    return true;
  };

  const workerMarkArrived = (jobId) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            status: 'ARRIVED_INSPECTING',
            timeline: [
              ...job.timeline,
              { time: 'Just now', event: 'Worker arrived on site & started diagnostic inspection' },
            ],
          };
        }
        return job;
      })
    );
    addToast('Arrived on Site', 'Marked as arrived. Please inspect the issue and propose labor fee.', 'info');
  };

  const workerSubmitProposedFee = (jobId, fee) => {
    const numFee = parseFloat(fee);
    if (isNaN(numFee) || numFee <= 0) return false;
    const platformFee = 5.00;
    const total = numFee + platformFee;

    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            proposedLaborFee: numFee,
            platformFee,
            totalEscrowAmount: total,
            status: 'ESTIMATION_SUBMITTED',
            timeline: [
              ...job.timeline,
              { time: 'Just now', event: `Worker proposed fee: $${numFee.toFixed(2)} ($${total.toFixed(2)} total escrow)` },
            ],
          };
        }
        return job;
      })
    );

    logAudit('FEE_PROPOSED', jobId, `Proposed fee of $${numFee.toFixed(2)} submitted for client review`);
    addToast('Fee Submitted', 'Awaiting client review and acceptance.', 'info');
    
    // Delegate to Supabase PL/pgSQL RPC
    supabaseRpcWorkerSubmitFee(jobId, null, numFee);

    return true;
  };

  // ==========================================
  // CLIENT ACCEPTANCE & OTP LIFECYCLE
  // ==========================================

  const clientAcceptProposal = (jobId) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return false;

    const client = clients.find((c) => c.id === job.clientId);
    if (client && client.walletBalance < job.totalEscrowAmount) {
      addToast('Insufficient Wallet Balance', `You need at least $${job.totalEscrowAmount.toFixed(2)} to accept and lock escrow. Please add funds.`, 'danger');
      return false;
    }

    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            status: 'ACCEPTANCE_OTP_PENDING',
            timeline: [
              ...j.timeline,
              { time: 'Just now', event: 'Client approved fee. Acceptance OTP generated.' },
            ],
          };
        }
        return j;
      })
    );

    addToast('Fee Approved!', `Provide Acceptance OTP "${job.acceptanceOtp}" to your worker to lock escrow.`, 'success');
    
    // Delegate to Supabase PL/pgSQL RPC
    supabaseRpcClientAcceptQuote(jobId);

    return true;
  };

  // Step 1 OTP: Worker inputs Acceptance OTP -> Escrow is locked
  const verifyAcceptanceOtp = (jobId, enteredOtp) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) {
      addToast('Error', 'Job not found.', 'danger');
      return { success: false, message: 'Job not found.' };
    }

    if (!job.acceptanceOtp || job.acceptanceOtp.trim() !== enteredOtp.trim()) {
      const msg = `Incorrect Acceptance OTP "${enteredOtp}". Expected client OTP: "${job.acceptanceOtp || 'N/A'}".`;
      addToast('Invalid Acceptance OTP', msg, 'danger');
      return { success: false, message: msg };
    }

    const client = clients.find((c) => c.id === job.clientId);
    if (!client || client.walletBalance < job.totalEscrowAmount) {
      const msg = `Client has insufficient wallet balance ($${client?.walletBalance.toFixed(2) || '0'}) to lock escrow ($${job.totalEscrowAmount.toFixed(2)}).`;
      addToast('Insufficient Escrow Balance', msg, 'danger');
      return { success: false, message: msg };
    }

    // Deduct client wallet
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === job.clientId) {
          return { ...c, walletBalance: Number((c.walletBalance - job.totalEscrowAmount).toFixed(2)) };
        }
        return c;
      })
    );

    // Create / Update Escrow Ledger record
    const newEscrowEntry = {
      id: `ESC-${Math.floor(700 + Math.random() * 200)}`,
      jobId: job.id,
      clientId: job.clientId,
      clientName: job.clientName,
      workerId: job.workerId,
      workerName: job.workerName,
      amount: job.totalEscrowAmount,
      workerCut: job.proposedLaborFee,
      platformFee: job.platformFee,
      status: 'HELD_IN_ESCROW',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      notes: `Funds deducted from ${job.clientName} wallet and secured in Escrow`,
    };
    setEscrowLedger((prev) => [newEscrowEntry, ...prev.filter((e) => e.jobId !== job.id)]);

    // Update Job Status
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            status: 'ESCROW_LOCKED_START_PENDING',
            timeline: [
              ...j.timeline,
              { time: 'Just now', event: `Acceptance OTP verified! $${job.totalEscrowAmount.toFixed(2)} securely held in Escrow` },
            ],
          };
        }
        return j;
      })
    );

    logAudit('ESCROW_LOCKED', job.workerName, `Acceptance OTP verified for #${job.id}. $${job.totalEscrowAmount.toFixed(2)} locked in Escrow`, 'success');
    addToast('Escrow Locked & Verified!', `Successfully locked $${job.totalEscrowAmount.toFixed(2)} in platform Escrow vault.`, 'success');
    
    // Delegate to Supabase PL/pgSQL RPC
    supabaseRpcVerifyAcceptanceOtp(job.id, enteredOtp);

    return { success: true };
  };

  // Step 2 OTP: Worker inputs Work-Start OTP -> Work begins timer
  const verifyWorkStartOtp = (jobId, enteredOtp) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) {
      addToast('Error', 'Job not found.', 'danger');
      return { success: false, message: 'Job not found.' };
    }

    if (!job.workStartOtp || job.workStartOtp.trim() !== enteredOtp.trim()) {
      const msg = `Incorrect Work-Start OTP "${enteredOtp}". Expected client OTP: "${job.workStartOtp || 'N/A'}".`;
      addToast('Invalid Work-Start OTP', msg, 'danger');
      return { success: false, message: msg };
    }

    // In emergency jobs, if escrow wasn't deducted yet, deduct now
    if (job.isEmergency) {
      const client = clients.find((c) => c.id === job.clientId);
      if (client) {
        setClients((prev) =>
          prev.map((c) => {
            if (c.id === job.clientId) {
              const newBal = Math.max(0, c.walletBalance - job.totalEscrowAmount);
              return { ...c, walletBalance: Number(newBal.toFixed(2)) };
            }
            return c;
          })
        );

        const emergencyEscrow = {
          id: `ESC-EMG-${Math.floor(500 + Math.random() * 200)}`,
          jobId: job.id,
          clientId: job.clientId,
          clientName: job.clientName,
          workerId: job.workerId,
          workerName: job.workerName,
          amount: job.totalEscrowAmount,
          workerCut: job.proposedLaborFee,
          platformFee: job.platformFee,
          status: 'HELD_IN_ESCROW',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          notes: `Emergency escrow auto-locked on Work-Start OTP`,
        };
        setEscrowLedger((prev) => [emergencyEscrow, ...prev.filter((e) => e.jobId !== job.id)]);
      }
    }

    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            status: 'IN_PROGRESS',
            workStartedAt: new Date().toISOString(),
            timeline: [
              ...j.timeline,
              { time: 'Just now', event: 'Work-Start OTP verified. Work is actively in progress!' },
            ],
          };
        }
        return j;
      })
    );

    logAudit('WORK_STARTED', job.workerName, `Work started on #${job.id} following start OTP validation`, 'info');
    addToast('Work Started & Timer Running!', 'Work-Start OTP validated. Job is actively in progress.', 'success');
    
    // Delegate to Supabase PL/pgSQL RPC
    supabaseRpcVerifyStartOtp(job.id, enteredOtp);

    return { success: true };
  };

  // Step 3 OTP: Worker inputs Work-End OTP -> Escrow released into worker's wallet
  const verifyWorkEndOtp = (jobId, enteredOtp) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) {
      addToast('Error', 'Job not found.', 'danger');
      return { success: false, message: 'Job not found.' };
    }

    if (!job.workEndOtp || job.workEndOtp.trim() !== enteredOtp.trim()) {
      const msg = `Incorrect Work-End OTP "${enteredOtp}". Expected client OTP: "${job.workEndOtp || 'N/A'}".`;
      addToast('Invalid Work-End OTP', msg, 'danger');
      return { success: false, message: msg };
    }

    // Release escrow to Worker wallet
    const workerCut = job.proposedLaborFee || (job.totalEscrowAmount ? job.totalEscrowAmount - (job.platformFee || 5) : 75);
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === job.workerId) {
          return {
            ...w,
            walletBalance: Number((w.walletBalance + workerCut).toFixed(2)),
            reviewsCount: w.reviewsCount + 1,
          };
        }
        return w;
      })
    );

    // Update Escrow Ledger to SETTLED_RELEASED
    setEscrowLedger((prev) =>
      prev.map((e) => {
        if (e.jobId === jobId) {
          return {
            ...e,
            status: 'SETTLED_RELEASED',
            notes: `Work-End OTP verified. Released $${workerCut.toFixed(2)} to ${job.workerName}`,
          };
        }
        return e;
      })
    );

    // Update Job Status to COMPLETED
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            status: 'COMPLETED',
            completedAt: new Date().toISOString(),
            timeline: [
              ...j.timeline,
              { time: 'Just now', event: `Work-End OTP verified! $${workerCut.toFixed(2)} escrow released to worker.` },
            ],
          };
        }
        return j;
      })
    );

    // Increment client completed jobs count
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === job.clientId) {
          return { ...c, completedJobsCount: c.completedJobsCount + 1 };
        }
        return c;
      })
    );

    logAudit('ESCROW_RELEASED', `${job.clientName} & ${job.workerName}`, `Successfully completed #${job.id}; $${workerCut.toFixed(2)} credited to worker`, 'success');
    addToast('🎉 Job Complete & Escrow Released!', `$${workerCut.toFixed(2)} has been credited to your wallet balance.`, 'success');
    
    // Delegate to Supabase PL/pgSQL RPC
    supabaseRpcVerifyEndOtp(job.id, enteredOtp);

    return { success: true };
  };

  // ==========================================
  // DISPUTE MANAGEMENT
  // ==========================================

  const raiseDispute = (jobId, { reason, clientComplaint }) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return false;

    const newDispute = {
      id: `DISP-${Math.floor(900 + Math.random() * 90)}`,
      filedBy: `${job.clientId} (${job.clientName})`,
      filedAt: new Date().toISOString(),
      reason: reason || 'Service Quality / Unfinished Work',
      clientComplaint,
      workerRebuttal: 'Work is being contested by client. Awaiting Admin review.',
      escrowLocked: job.totalEscrowAmount,
      adminStatus: 'UNDER_REVIEW',
      resolutionNotes: null,
      resolvedAt: null,
    };

    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            status: 'DISPUTED',
            dispute: newDispute,
            timeline: [
              ...j.timeline,
              { time: 'Just now', event: `Client raised formal dispute: "${reason}". Completion OTP withheld and Escrow frozen.` },
            ],
          };
        }
        return j;
      })
    );

    setEscrowLedger((prev) =>
      prev.map((e) => {
        if (e.jobId === jobId) {
          return {
            ...e,
            status: 'FROZEN_IN_DISPUTE',
            notes: `Dispute filed by ${job.clientName}. Escrow held frozen.`,
          };
        }
        return e;
      })
    );

    logAudit('DISPUTE_RAISED', job.clientName, `Dispute filed on #${jobId}: "${reason}". Escalated to Admin queue`, 'danger');
    addToast('Dispute Raised', 'Escrow frozen. Case forwarded to Admin for adjudication.', 'warning');
    
    // Delegate to Supabase PL/pgSQL RPC
    supabaseRpcRaiseDispute(jobId, job.clientId, reason, clientComplaint);

    return true;
  };

  const resolveDispute = (jobId, resolutionType, adminNotes) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job || !job.dispute) return false;

    const escrowAmount = job.totalEscrowAmount;
    const workerCut = job.proposedLaborFee || (escrowAmount - 10);

    let clientRefund = 0;
    let workerPayout = 0;

    if (resolutionType === 'RELEASE_TO_WORKER') {
      workerPayout = workerCut;
    } else if (resolutionType === 'REFUND_TO_CLIENT') {
      clientRefund = escrowAmount;
    } else if (resolutionType === 'SPLIT_50_50') {
      clientRefund = Number((escrowAmount / 2).toFixed(2));
      workerPayout = Number((workerCut / 2).toFixed(2));
    }

    // Adjust Client Wallet
    if (clientRefund > 0) {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === job.clientId) {
            return { ...c, walletBalance: Number((c.walletBalance + clientRefund).toFixed(2)) };
          }
          return c;
        })
      );
    }

    // Adjust Worker Wallet
    if (workerPayout > 0 && job.workerId) {
      setWorkers((prev) =>
        prev.map((w) => {
          if (w.id === job.workerId) {
            return { ...w, walletBalance: Number((w.walletBalance + workerPayout).toFixed(2)) };
          }
          return w;
        })
      );
    }

    // Update Escrow Ledger
    setEscrowLedger((prev) =>
      prev.map((e) => {
        if (e.jobId === jobId) {
          return {
            ...e,
            status: 'SETTLED_BY_ADMIN',
            notes: `Admin Ruling [${resolutionType}]: Client received $${clientRefund.toFixed(2)}, Worker received $${workerPayout.toFixed(2)}. Notes: ${adminNotes}`,
          };
        }
        return e;
      })
    );

    // Update Job and Dispute Object
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            status: 'RESOLVED_BY_ADMIN',
            dispute: {
              ...j.dispute,
              adminStatus: resolutionType,
              resolutionNotes: adminNotes,
              resolvedAt: new Date().toISOString(),
            },
            timeline: [
              ...j.timeline,
              { time: 'Just now', event: `Admin resolved dispute: ${resolutionType}. (${adminNotes})` },
            ],
          };
        }
        return j;
      })
    );

    logAudit('DISPUTE_RESOLVED', 'Admin (ADM-001)', `Resolved #${jobId} with ruling ${resolutionType} ($${clientRefund} client, $${workerPayout} worker)`, 'success');
    addToast('Dispute Adjudicated', `Ruling applied: ${resolutionType.replace(/_/g, ' ')}. Wallets re-balanced.`, 'success');
    
    // Delegate to Supabase PL/pgSQL RPC
    supabaseRpcResolveDispute(jobId, resolutionType, adminNotes);

    return true;
  };

  // ==========================================
  // ADMIN WORKER VERIFICATION
  // ==========================================

  const verifyWorker = (workerId) => {
    const generatedId = `WRK-${Math.floor(8000 + Math.random() * 1000)}`;
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          return {
            ...w,
            id: generatedId,
            status: 'VERIFIED',
            trustScore: 92,
            rating: w.rating && w.rating > 0 ? w.rating : 3.8, // Initial realistic baseline rating
            documents: w.documents.map((d) => ({ ...d, verified: true })),
          };
        }
        return w;
      })
    );

    logAudit('WORKER_VERIFIED', 'Admin (ADM-001)', `Approved worker registration. Assigned official ID: ${generatedId}`, 'success');
    addToast('Worker Verified!', `Profile approved and assigned ID ${generatedId}`, 'success');
    
    // Delegate to Supabase PL/pgSQL RPC
    supabaseRpcAdminVerifyWorker(workerId);

    return generatedId;
  };

  const rejectWorker = (workerId, reason = 'Document criteria not met') => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          return { ...w, status: 'REJECTED' };
        }
        return w;
      })
    );

    logAudit('WORKER_REJECTED', 'Admin (ADM-001)', `Rejected worker ${workerId}: ${reason}`, 'warning');
    addToast('Worker Rejected', `Application for ${workerId} was rejected.`, 'info');
  };

  const toggleWorkerVerification = (workerId) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          const newStatus = w.status === 'VERIFIED' ? 'SUSPENDED' : 'VERIFIED';
          return { ...w, status: newStatus };
        }
        return w;
      })
    );
    addToast('Worker Status Updated', `Status changed for ${workerId}`, 'info');
  };

  // ==========================================
  // REVIEWS
  // ==========================================

  const submitReview = (jobId, { rating, comment }) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job || !job.workerId) return false;

    const newRev = {
      id: `REV-${Date.now()}`,
      clientName: job.clientName,
      rating: Number(rating),
      comment,
      date: new Date().toISOString().substring(0, 10),
    };

    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === job.workerId) {
          const updatedReviews = [newRev, ...w.reviews];
          const avg = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
          return {
            ...w,
            rating: Number(avg.toFixed(1)),
            reviews: updatedReviews,
          };
        }
        return w;
      })
    );

    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            reviewSubmitted: true,
            rating,
            reviewText: comment,
          };
        }
        return j;
      })
    );

    addToast('Thank you!', 'Your rating & review has been posted to the worker profile.', 'success');
    
    // Delegate to Supabase PL/pgSQL RPC
    supabaseRpcSubmitReview(job.id, rating, comment);

    return true;
  };

  // ==========================================
  // IN-APP MESSAGING
  // ==========================================

  const sendJobMessage = (jobId, { senderRole, senderName, text }) => {
    if (!text || !text.trim()) return false;
    const newMsg = {
      id: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      senderRole,
      senderName,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          const currentMsgs = Array.isArray(job.messages) ? job.messages : [];
          return {
            ...job,
            messages: [...currentMsgs, newMsg],
          };
        }
        return job;
      })
    );
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        categories,
        clients,
        workers,
        jobs,
        escrowLedger,
        auditLogs,
        currentUser,
        toasts,
        removeToast,
        addToast,
        resetDemoData,
        // Auth
        loginClient,
        signupClient,
        registerWorker,
        loginWorker,
        loginAdmin,
        logout,
        switchPersona,
        // Wallet
        addClientFunds,
        // Jobs
        createStandardJob,
        createEmergencyJob,
        workerClaimEmergencyJob,
        workerMarkArrived,
        workerSubmitProposedFee,
        clientAcceptProposal,
        // OTPs
        verifyAcceptanceOtp,
        verifyWorkStartOtp,
        verifyWorkEndOtp,
        // Dispute
        raiseDispute,
        resolveDispute,
        // Admin
        verifyWorker,
        rejectWorker,
        toggleWorkerVerification,
        // Reviews
        submitReview,
        // In-app messaging
        sendJobMessage,
        // Supabase Status
        supabaseStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
