import { createClient } from '@supabase/supabase-js';

// Environment variables or localStorage override for dynamic configuration
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const DEFAULT_SUPABASE_URL = 'https://xnixcnkxgiadipzqgbym.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuaXhjbmt4Z2lhZGlwenFnYnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODIyMTIsImV4cCI6MjEwMjU1ODIxMn0.pMMUKefwgzmSoKMgdBBx4paeizsfXfR5pIgVzpDSLKw';

const localUrl = typeof window !== 'undefined' ? localStorage.getItem('SWAACHX_SUPABASE_URL') || '' : '';
const localKey = typeof window !== 'undefined' ? localStorage.getItem('SWAACHX_SUPABASE_KEY') || '' : '';

export const SUPABASE_URL = localUrl || envUrl || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY = localKey || envKey || DEFAULT_SUPABASE_KEY;

export const isTestEnv =
  typeof process !== 'undefined' &&
  (process.env?.NODE_ENV === 'test' || Boolean(process.env?.VITEST) || Boolean(process.env?.VITEST_WORKER_ID));

export const isSupabaseConfigured = () => {
  if (isTestEnv) return false;
  const url = SUPABASE_URL;
  const key = SUPABASE_ANON_KEY;
  return Boolean(url && key && url.startsWith('http') && key.length > 20);
};

export const saveSupabaseConfig = (url, key) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('SWAACHX_SUPABASE_URL', url.trim());
    localStorage.setItem('SWAACHX_SUPABASE_KEY', key.trim());
    window.location.reload();
  }
};

export const clearSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('SWAACHX_SUPABASE_URL');
    localStorage.removeItem('SWAACHX_SUPABASE_KEY');
    window.location.reload();
  }
};

// Initialize Supabase Client with graceful fallback
export const supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : {
      auth: {
        signInWithPassword: async () => ({ data: null, error: new Error('Supabase credentials not configured') }),
        signUp: async () => ({ data: null, error: new Error('Supabase credentials not configured') }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
      },
      from: () => ({
        select: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
          eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }),
        }),
        insert: (data) => ({
          select: () => ({ single: () => Promise.resolve({ data: data?.[0] || {}, error: null }) }),
        }),
        update: (updates) => ({
          eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: updates, error: null }) }) }),
        }),
        upsert: (data) => ({
          select: () => ({ single: () => Promise.resolve({ data: data?.[0] || {}, error: null }) }),
        }),
      }),
      channel: () => ({
        on: function () {
          return this;
        },
        subscribe: function () {
          return this;
        },
      }),
      removeChannel: () => {},
    };

/**
 * Database Services for swaach.x
 */
export const db = {
  // --- REPORTS ---
  async getReports() {
    if (!isSupabaseConfigured()) return { data: [], error: null };
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createReport(reportData) {
    if (!isSupabaseConfigured()) return { data: reportData, error: null };
    const { data, error } = await supabase
      .from('reports')
      .insert([reportData])
      .select()
      .single();
    return { data, error };
  },

  async updateReport(id, updates) {
    if (!isSupabaseConfigured()) return { data: updates, error: null };
    const { data, error } = await supabase
      .from('reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // --- VEHICLES ---
  async getVehicles() {
    if (!isSupabaseConfigured()) return { data: [], error: null };
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('id', { ascending: true });
    return { data, error };
  },

  async updateVehicleTelemetry(id, telemetry) {
    if (!isSupabaseConfigured()) return { data: telemetry, error: null };
    const { data, error } = await supabase
      .from('vehicles')
      .update(telemetry)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // --- CITIZENS / PROFILES ---
  async getProfiles() {
    if (!isSupabaseConfigured()) return { data: [], error: null };
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getProfile(userId) {
    if (!isSupabaseConfigured()) return { data: null, error: null };
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async getProfileByEmail(email) {
    if (!isSupabaseConfigured() || !email) return { data: null, error: null };
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', cleanEmail)
      .limit(1);
    return { data: data?.[0] || null, error };
  },

  async createProfile(profileData) {
    if (!isSupabaseConfigured()) return { data: profileData, error: null };
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData)
        .select();

      if (error && error.code === 'PGRST204') {
        // Fallback without password if column is not yet present
        const { password, ...safeData } = profileData;
        const { data: retryData, error: retryError } = await supabase
          .from('profiles')
          .upsert(safeData)
          .select();
        return { data: retryData?.[0] || safeData, error: retryError };
      }
      return { data: data?.[0] || profileData, error };
    } catch (err) {
      return { data: profileData, error: err };
    }
  },

  async verifyProfilePassword(emailOrPhone, password) {
    if (!isSupabaseConfigured() || !emailOrPhone || !password) return { verified: false, profile: null };
    try {
      const input = emailOrPhone.trim().toLowerCase();
      const isEmail = input.includes('@');
      let query = supabase.from('profiles').select('*');
      if (isEmail) {
        query = query.ilike('email', input);
      } else {
        query = query.or(`phone.ilike.%${input}%,email.ilike.%${input}%`);
      }

      const { data, error } = await query.limit(1);
      if (!error && data && data.length > 0) {
        const profile = data[0];
        // 1. Exact match with stored database password
        if (profile.password && profile.password === password) {
          return { verified: true, profile };
        }
        // 2. Legacy profile with null password (auto-bind password on first login)
        if (!profile.password && password.length >= 6) {
          try {
            await supabase.from('profiles').update({ password }).eq('id', profile.id);
          } catch (e) {}
          return { verified: true, profile: { ...profile, password } };
        }
        return { verified: false, profile, passwordMismatch: true };
      }
    } catch (e) {
      console.warn('verifyProfilePassword error:', e);
    }
    return { verified: false, profile: null };
  },

  async checkEmailExists(input) {
    if (!isSupabaseConfigured() || !input) return { exists: false, profile: null };
    try {
      const cleanInput = input.trim().toLowerCase();
      const isEmail = cleanInput.includes('@');
      let query = supabase.from('profiles').select('*');
      if (isEmail) {
        query = query.ilike('email', cleanInput);
      } else {
        query = query.or(`phone.ilike.%${cleanInput}%,email.ilike.%${cleanInput}%`);
      }
      const { data, error } = await query.limit(1);
      if (!error && data && data.length > 0) {
        return { exists: true, profile: data[0] };
      }
    } catch (e) {
      console.warn('checkEmailExists exception:', e);
    }
    return { exists: false, profile: null };
  },

  async updateProfilePassword(emailOrPhone, newPassword) {
    if (!isSupabaseConfigured() || !emailOrPhone || !newPassword) return { success: false };
    try {
      const clean = emailOrPhone.trim().toLowerCase();
      const isEmail = clean.includes('@');
      let query = supabase.from('profiles').update({ password: newPassword });
      if (isEmail) {
        query = query.ilike('email', clean);
      } else {
        query = query.or(`phone.ilike.%${clean}%,email.ilike.%${clean}%`);
      }
      const { data, error } = await query.select();
      if (!error) {
        return { success: true, data };
      }
    } catch (e) {
      console.warn('updateProfilePassword exception:', e);
    }
    return { success: false };
  },

  async getCitizens() {
    if (!isSupabaseConfigured()) return { data: [], error: null };
    const { data, error } = await supabase
      .from('citizens')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createCitizen(citizenData) {
    if (!isSupabaseConfigured()) return { data: citizenData, error: null };
    const { data, error } = await supabase
      .from('citizens')
      .upsert([citizenData])
      .select()
      .single();
    return { data, error };
  },

  // --- ROUTE STOPS ---
  async getRouteStops() {
    if (!isSupabaseConfigured()) return { data: [], error: null };
    const { data, error } = await supabase
      .from('route_stops')
      .select('*')
      .order('sequence_order', { ascending: true });
    return { data, error };
  },

  // --- HOTSPOTS ---
  async getHotspots() {
    if (!isSupabaseConfigured()) return { data: [], error: null };
    const { data, error } = await supabase
      .from('hotspots')
      .select('*')
      .order('confidence_score', { ascending: false });
    return { data, error };
  },

  // --- SMART DUSTBINS ---
  async getDustbins() {
    if (!isSupabaseConfigured()) return { data: [], error: null };
    const { data, error } = await supabase
      .from('dustbins')
      .select('*')
      .order('fill_level', { ascending: false });
    return { data, error };
  },

  async updateDustbin(id, updates) {
    if (!isSupabaseConfigured()) return { data: updates, error: null };
    const { data, error } = await supabase
      .from('dustbins')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // --- REALTIME SUBSCRIPTION ---
  subscribeToReports(onInsert, onUpdate) {
    if (!isSupabaseConfigured()) return () => {};
    const channel = supabase
      .channel('realtime_reports')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reports' },
        (payload) => {
          if (onInsert) onInsert(payload.new);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'reports' },
        (payload) => {
          if (onUpdate) onUpdate(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToVehicles(onUpdate) {
    if (!isSupabaseConfigured()) return () => {};
    const channel = supabase
      .channel('realtime_vehicles')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'vehicles' },
        (payload) => {
          if (onUpdate) onUpdate(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToProfiles(onInsert, onUpdate) {
    if (!isSupabaseConfigured()) return () => {};
    const channel = supabase
      .channel('realtime_profiles')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload) => {
          if (onInsert) onInsert(payload.new);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          if (onUpdate) onUpdate(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToDustbins(onInsert, onUpdate) {
    if (!isSupabaseConfigured()) return () => {};
    const channel = supabase
      .channel('realtime_dustbins')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'dustbins' },
        (payload) => {
          if (onInsert) onInsert(payload.new);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'dustbins' },
        (payload) => {
          if (onUpdate) onUpdate(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // --- DRIVER CREDENTIALS ---
  async getDriverCredentials() {
    if (!isSupabaseConfigured()) return { data: [], error: null };
    try {
      const { data, error } = await supabase
        .from('driver_credentials')
        .select('*')
        .order('badge_id', { ascending: true });
      return { data: data || [], error };
    } catch (err) {
      return { data: [], error: err };
    }
  },

  async upsertDriverCredential(driverData) {
    if (!isSupabaseConfigured()) return { data: driverData, error: null };
    try {
      const { data, error } = await supabase
        .from('driver_credentials')
        .upsert(driverData, { onConflict: 'badge_id' })
        .select()
        .single();
      return { data, error };
    } catch (err) {
      return { data: driverData, error: err };
    }
  },
};
