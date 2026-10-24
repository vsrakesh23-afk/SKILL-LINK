// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pwlbgglgdhwbyxkaewgw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bGJnZ2xnZGh3Ynl4a2Fld2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzOTUzMTUsImV4cCI6MjEwNzk3MTMxNX0.oEJEjiCQ1jkqPDjmyKR3Y83XPDmBsws45KDWol9ZJf0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Checks connection health with the live Supabase PostgreSQL backend.
 * @returns {Promise<{ online: boolean, latencyMs: number, error?: string }>}
 */
export async function checkSupabaseConnection() {
  const start = Date.now();
  try {
    const { data, error } = await supabase.from('skills').select('skill_id').limit(1);
    if (error) throw error;
    return { online: true, latencyMs: Date.now() - start };
  } catch (err) {
    console.warn('[Supabase] Healthcheck ping failed:', err.message);
    return { online: false, latencyMs: Date.now() - start, error: err.message };
  }
}

/**
 * Fetches skills directly from the Supabase 'skills' table.
 */
export async function fetchLiveSkills() {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('skill_id, skill_name, base_diagnostic_fee, is_emergency_eligible');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[Supabase] Could not fetch live skills:', err.message);
    return null;
  }
}

/**
 * Fetches verified and pending workers directly from the Supabase 'workers' table joined with 'users' and 'skills'.
 */
export async function fetchLiveWorkers() {
  try {
    const { data, error } = await supabase
      .from('workers')
      .select('*, users(full_name, phone_number, email, address), worker_skills(skills(skill_id, skill_name))');
    if (error) throw error;
    if (!data || data.length === 0) return null;

    return data.map((w) => {
      const rawSkillNames = w.worker_skills?.map((ws) => ws.skills?.skill_name).filter(Boolean) || [];
      const expandedSkills = new Set(rawSkillNames);
      rawSkillNames.forEach((s) => {
        const lower = s.toLowerCase();
        if (lower.includes('plumb')) {
          expandedSkills.add('Plumbing Services');
          expandedSkills.add('Plumber');
        }
        if (lower.includes('electr')) {
          expandedSkills.add('Electrical Repairs');
          expandedSkills.add('Electrician');
        }
        if (lower.includes('carpent')) {
          expandedSkills.add('Carpentry & Woodwork');
          expandedSkills.add('Carpenter');
        }
        if (lower.includes('ac') || lower.includes('appliance') || lower.includes('hvac')) {
          expandedSkills.add('HVAC & AC Service');
          expandedSkills.add('Appliance Repair');
          expandedSkills.add('AC & Appliance Tech');
        }
        if (lower.includes('paint')) {
          expandedSkills.add('Painting & Masonry');
          expandedSkills.add('Painter');
        }
        if (lower.includes('mason')) {
          expandedSkills.add('Painting & Masonry');
          expandedSkills.add('Mason / Tile Worker');
        }
      });
      const finalSkills = expandedSkills.size > 0 ? Array.from(expandedSkills) : ['Plumbing Services', 'Plumber'];

      return {
        id: w.worker_id,
        user_id: w.worker_id,
        name: w.users?.full_name || 'Verified Pro',
        email: w.users?.email || '',
        phone: w.users?.phone_number || '',
        address: w.users?.address || 'Vellore, Tamil Nadu',
        skills: finalSkills,
        experienceYears: w.experience_years || 5,
        hourlyRate: Number(w.hourly_rate) || 45,
        distanceKm: 1.8,
        trustScore: Number(w.trust_score) || 85,
        rating: Number(w.average_rating) || 3.8,
        reviewsCount: w.average_rating > 4 ? 12 : 1,
        status: w.verification_tier === 'VERIFIED' ? 'VERIFIED' : 'PENDING_VERIFICATION',
        isOnline: w.is_available ?? true,
        walletBalance: 0,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        documents: [
          { id: `DOC-${w.worker_id.slice(0, 5)}`, name: 'Trade_License.pdf', type: 'Trade Certificate', verified: w.verification_tier === 'VERIFIED' },
          { id: `DOC-${w.worker_id.slice(0, 5)}-ID`, name: 'Govt_ID_Card.pdf', type: 'Government ID', verified: true }
        ],
        reviews: []
      };
    });
  } catch (err) {
    console.debug('[Supabase] fetchLiveWorkers notice:', err.message);
    return null;
  }
}

/**
 * Registers a new worker in Supabase via PL/pgSQL RPC rpc_worker_register.
 */
export async function syncWorkerToSupabase(workerData, skillId = null) {
  try {
    const { data, error } = await supabase.rpc('rpc_worker_register', {
      p_name: workerData.name,
      p_phone: workerData.phone,
      p_email: workerData.email || `worker_${Date.now()}@skilllink.io`,
      p_address: workerData.address || 'Vellore, Tamil Nadu',
      p_skill_id: skillId || null,
      p_bio: workerData.bio || 'Professional tradesperson registered via SkillLink portal',
      p_hourly_rate: Number(workerData.hourlyRate) || 40,
      p_experience_years: Number(workerData.experienceYears) || 3
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.debug('[Supabase] syncWorkerToSupabase notice:', err.message);
    return null;
  }
}

/**
 * Synchronizes client registration into Supabase via PL/pgSQL RPC or direct insert.
 */
export async function syncClientToSupabase(client) {
  try {
    const { data, error } = await supabase.rpc('rpc_client_register', {
      p_name: client.name,
      p_phone: client.phone,
      p_email: client.email || 'client@example.com',
      p_address: client.address || 'Address provided on booking'
    });

    if (!error && data) return data;

    // Fallback direct insert if RPC not yet created in Supabase SQL editor
    const { data: directData, error: directErr } = await supabase
      .from('users')
      .insert([
        {
          full_name: client.name,
          phone_number: client.phone,
          email: (client.email || '').toLowerCase().trim(),
          role: 'CLIENT',
          address: client.address || 'Address provided on booking'
        }
      ])
      .select()
      .maybeSingle();

    if (directErr) {
      console.warn('[Supabase] Client sync notice:', directErr.message);
    }
    return directData;
  } catch (err) {
    console.warn('[Supabase] Error syncing client:', err.message);
    return null;
  }
}

/**
 * Synchronizes audit entries directly to the Supabase 'audit_log' table.
 */
export async function logAuditToSupabase({ tableName = 'platform', operation = 'ACTION', details = '' }) {
  try {
    const dummyRecordId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-0000-0000-000000000000';
    await supabase.from('audit_log').insert([
      {
        table_name: tableName,
        operation: operation,
        record_id: dummyRecordId,
        details: typeof details === 'object' ? JSON.stringify(details) : String(details),
        timestamp: new Date().toISOString()
      }
    ]);
  } catch (err) {
    console.debug('[Supabase Audit] Sync skipped:', err.message);
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveClientId(id) {
  if (id && UUID_REGEX.test(id)) return id;
  const { data } = await supabase.from('users').select('user_id').eq('role', 'CLIENT').limit(1).maybeSingle();
  return data?.user_id || 'ec3922f4-b60f-4b8e-a918-160df82af414';
}

async function resolveWorkerId(id) {
  if (id && UUID_REGEX.test(id)) return id;
  const { data } = await supabase.from('workers').select('worker_id').limit(1).maybeSingle();
  return data?.worker_id || '3573c753-4d7d-4a1a-8c33-df0ebe129366';
}

async function resolveSkillId(id) {
  if (id && UUID_REGEX.test(id)) return id;
  const { data } = await supabase.from('skills').select('skill_id').limit(1).maybeSingle();
  return data?.skill_id || '90601109-8e57-45db-9a70-130f8a9e4c09';
}

/**
 * Executes PL/pgSQL RPC rpc_create_job in Supabase.
 */
export async function supabaseRpcCreateJob(params) {
  try {
    const validClientId = await resolveClientId(params.clientId);
    const validWorkerId = params.workerId ? await resolveWorkerId(params.workerId) : null;
    const validSkillId = await resolveSkillId(params.skillId);

    const { data, error } = await supabase.rpc('rpc_create_job', {
      p_client_id: validClientId,
      p_worker_id: validWorkerId,
      p_skill_id: validSkillId,
      p_title: params.title || 'Trade Service Request',
      p_description: params.description || 'Standard requested repair',
      p_address: params.address || 'Vellore, Tamil Nadu',
      p_is_emergency: !!params.isEmergency,
      p_base_fee: params.baseFee || 75.00
    });
    if (error) {
      // Fallback direct insert if RPC encounters mismatch
      const { data: directJob } = await supabase
        .from('job_requests')
        .insert([{
          client_id: validClientId,
          worker_id: validWorkerId,
          skill_id: validSkillId,
          title: params.title || 'Trade Service Request',
          description: params.description || 'Standard repair request',
          dest_latitude: 12.92,
          dest_longitude: 79.13,
          estimated_amount: params.baseFee || 75.00,
          status: 'PENDING',
          job_type: params.isEmergency ? 'EMERGENCY' : 'NORMAL'
        }])
        .select()
        .maybeSingle();
      return directJob || null;
    }
    return data;
  } catch (err) {
    console.debug('[Supabase RPC] rpc_create_job notice:', err.message);
    return null;
  }
}

/**
 * Executes PL/pgSQL RPC rpc_worker_submit_fee in Supabase.
 */
export async function supabaseRpcWorkerSubmitFee(jobId, workerId, proposedFee) {
  try {
    const { data, error } = await supabase.rpc('rpc_worker_submit_fee', {
      p_job_id: jobId,
      p_worker_id: workerId,
      p_proposed_fee: parseFloat(proposedFee)
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.debug('[Supabase RPC] rpc_worker_submit_fee notice:', err.message);
    return null;
  }
}

/**
 * Executes PL/pgSQL RPC rpc_client_accept_quote in Supabase.
 */
export async function supabaseRpcClientAcceptQuote(jobId) {
  try {
    const { data, error } = await supabase.rpc('rpc_client_accept_quote', {
      p_job_id: jobId
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.debug('[Supabase RPC] rpc_client_accept_quote notice:', err.message);
    return null;
  }
}

/**
 * Executes PL/pgSQL RPC rpc_verify_acceptance_otp in Supabase.
 */
export async function supabaseRpcVerifyAcceptanceOtp(jobId, enteredOtp) {
  try {
    const { data, error } = await supabase.rpc('rpc_verify_acceptance_otp', {
      p_job_id: jobId,
      p_entered_otp: String(enteredOtp).trim()
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.debug('[Supabase RPC] rpc_verify_acceptance_otp notice:', err.message);
    return null;
  }
}

/**
 * Executes PL/pgSQL RPC rpc_verify_start_otp in Supabase.
 */
export async function supabaseRpcVerifyStartOtp(jobId, enteredOtp) {
  try {
    const { data, error } = await supabase.rpc('rpc_verify_start_otp', {
      p_job_id: jobId,
      p_entered_otp: String(enteredOtp).trim()
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.debug('[Supabase RPC] rpc_verify_start_otp notice:', err.message);
    return null;
  }
}

/**
 * Executes PL/pgSQL RPC rpc_verify_end_otp in Supabase.
 */
export async function supabaseRpcVerifyEndOtp(jobId, enteredOtp) {
  try {
    const { data, error } = await supabase.rpc('rpc_verify_end_otp', {
      p_job_id: jobId,
      p_entered_otp: String(enteredOtp).trim()
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.debug('[Supabase RPC] rpc_verify_end_otp notice:', err.message);
    return null;
  }
}

/**
 * Executes PL/pgSQL RPC rpc_raise_dispute in Supabase.
 */
export async function supabaseRpcRaiseDispute(jobId, clientId, reason, complaint) {
  try {
    const { data, error } = await supabase.rpc('rpc_raise_dispute', {
      p_job_id: jobId,
      p_client_id: clientId,
      p_reason: reason,
      p_complaint: complaint
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.debug('[Supabase RPC] rpc_raise_dispute notice:', err.message);
    return null;
  }
}

/**
 * Executes PL/pgSQL RPC rpc_resolve_dispute in Supabase.
 */
export async function supabaseRpcResolveDispute(jobId, ruling, adminNotes) {
  try {
    const { data, error } = await supabase.rpc('rpc_resolve_dispute', {
      p_job_id: jobId,
      p_ruling: ruling,
      p_admin_notes: adminNotes
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.debug('[Supabase RPC] rpc_resolve_dispute notice:', err.message);
    return null;
  }
}

/**
 * Executes PL/pgSQL RPC rpc_admin_verify_worker in Supabase.
 */
export async function supabaseRpcAdminVerifyWorker(workerId) {
  try {
    const { data, error } = await supabase.rpc('rpc_admin_verify_worker', {
      p_worker_id: workerId
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.debug('[Supabase RPC] rpc_admin_verify_worker notice:', err.message);
    return null;
  }
}

/**
 * Executes PL/pgSQL RPC rpc_submit_review in Supabase.
 */
export async function supabaseRpcSubmitReview(jobId, rating, comment) {
  try {
    const { data, error } = await supabase.rpc('rpc_submit_review', {
      p_job_id: jobId,
      p_rating: parseFloat(rating),
      p_comment: comment
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.debug('[Supabase RPC] rpc_submit_review notice:', err.message);
    return null;
  }
}
