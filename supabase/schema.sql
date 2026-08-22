-- ==============================================================================
-- swaach.x - Supabase Production Database Schema
-- Run this script in the Supabase SQL Editor to initialize all tables,
-- Row Level Security (RLS) policies, and Realtime replication.
-- ==============================================================================

-- 1. Create Profiles Table (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  ward TEXT DEFAULT 'Ward 14 (North Sector)',
  role TEXT NOT NULL CHECK (role IN ('Citizen', 'Fleet Driver', 'Driver')),
  karma_points INTEGER DEFAULT 0,
  reports_count INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Reports Table (Citizen Waste Issue Submissions)
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY DEFAULT ('REP-' || FLOOR(1000 + RANDOM() * 9000)::TEXT),
  citizen_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  citizen_name TEXT NOT NULL,
  citizen_phone TEXT,
  citizen_email TEXT,
  ward TEXT DEFAULT 'Ward 14',
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  description TEXT NOT NULL,
  photo_url TEXT,
  priority TEXT DEFAULT 'High' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  status TEXT DEFAULT 'Pending Verification' CHECK (status IN ('Pending Verification', 'Triage Review', 'Dispatched', 'Resolved')),
  assigned_driver TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  resolved_at TIMESTAMPTZ
);

-- 3. Create Vehicles Table (Fleet Telemetry & Tracking)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT PRIMARY KEY,
  plate_number TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Idle', 'Maintenance', 'Offline')),
  last_location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  speed INTEGER DEFAULT 0,
  heading TEXT,
  battery_or_fuel INTEGER DEFAULT 100,
  load_capacity_percent INTEGER DEFAULT 0,
  assigned_route TEXT,
  last_updated TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create Route Stops Table (Optimized Routing Sequences)
CREATE TABLE IF NOT EXISTS public.route_stops (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id TEXT REFERENCES public.vehicles(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL,
  stop_name TEXT NOT NULL,
  bin_id TEXT,
  capacity_percent INTEGER DEFAULT 0,
  estimated_arrival TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Serviced', 'Skipped')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Create Hotspots Table (AI Sanitation Predictions)
CREATE TABLE IF NOT EXISTS public.hotspots (
  zone_id TEXT PRIMARY KEY,
  zone_name TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('High', 'Medium', 'Low')),
  confidence_score INTEGER DEFAULT 85,
  predicted_volume TEXT,
  primary_anomaly TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  suggested_action TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. SMART DUSTBINS TABLE
CREATE TABLE IF NOT EXISTS public.dustbins (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ward TEXT NOT NULL,
  category TEXT NOT NULL,
  fill_level INTEGER DEFAULT 0 CHECK (fill_level >= 0 AND fill_level <= 100),
  capacity_liters INTEGER DEFAULT 240,
  battery_level INTEGER DEFAULT 100,
  odour_level TEXT DEFAULT 'Low',
  status TEXT DEFAULT 'Operational',
  last_emptied TEXT DEFAULT 'Recently',
  qr_code TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- Row Level Security (RLS) Configuration
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dustbins ENABLE ROW LEVEL SECURITY;

-- Allow public read access to authenticated/anon for prototype & civic transparency
CREATE POLICY "Allow public read access on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow individual insert/upsert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow individual update on profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow delete on profiles" ON public.profiles FOR DELETE USING (true);

CREATE POLICY "Allow public read access on reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Allow authenticated/anon insert on reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on reports" ON public.reports FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Allow update on vehicles" ON public.vehicles FOR ALL USING (true);

CREATE POLICY "Allow public read access on route_stops" ON public.route_stops FOR SELECT USING (true);
CREATE POLICY "Allow public read access on hotspots" ON public.hotspots FOR SELECT USING (true);
CREATE POLICY "Allow public read access on dustbins" ON public.dustbins FOR SELECT USING (true);
CREATE POLICY "Allow update on dustbins" ON public.dustbins FOR ALL USING (true);

-- ==============================================================================
-- Automated Profile Sync Trigger (from auth.users -> public.profiles)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    name,
    email,
    phone,
    ward,
    role,
    karma_points,
    reports_count,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone', ''), ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'ward', ''), NULLIF(NEW.raw_user_meta_data->>'location', ''), 'Ahmedabad Central'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'Citizen'),
    0,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = CASE 
      WHEN EXCLUDED.name IS NOT NULL AND EXCLUDED.name != '' AND EXCLUDED.name != split_part(EXCLUDED.email, '@', 1)
      THEN EXCLUDED.name 
      ELSE public.profiles.name 
    END,
    phone = CASE 
      WHEN EXCLUDED.phone IS NOT NULL AND EXCLUDED.phone != '' 
      THEN EXCLUDED.phone 
      ELSE public.profiles.phone 
    END,
    ward = CASE 
      WHEN EXCLUDED.ward IS NOT NULL AND EXCLUDED.ward != '' 
      THEN EXCLUDED.ward 
      ELSE public.profiles.ward 
    END,
    role = COALESCE(NULLIF(EXCLUDED.role, ''), public.profiles.role),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- Realtime Replication Publication
-- ==============================================================================
BEGIN;
  -- Add tables to realtime publication
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.profiles, public.reports, public.vehicles, public.route_stops, public.hotspots;
COMMIT;
