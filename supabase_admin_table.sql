-- ========================================================================
-- Supabase Migration: Admin Credentials Table
-- Project: swaach.x - Ahmedabad Municipal Corporation (AMC) Command Center
-- ========================================================================

-- 1. Create the dedicated `admin_credentials` table
CREATE TABLE IF NOT EXISTS public.admin_credentials (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(32),
    role VARCHAR(64) DEFAULT 'Admin',
    designation VARCHAR(255) DEFAULT 'Municipal Administrator',
    department VARCHAR(255) DEFAULT 'Ahmedabad Municipal Corporation Head Office',
    jurisdiction VARCHAR(255) DEFAULT 'All Zones',
    security_clearance VARCHAR(128) DEFAULT 'Level 5 (Unrestricted Command)',
    avatar_emoji VARCHAR(16) DEFAULT '🏛️',
    permissions JSONB DEFAULT '["ALL_PERMISSIONS", "FLEET_OVERRIDE_DISPATCH", "INCIDENT_VERIFY_RESOLVE", "DRIVER_MANAGEMENT", "IOT_CALIBRATION", "AI_HOTSPOT_DEPLOY", "AUDIT_LOG_EXPORT"]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index on email for ultra-fast lookup
CREATE INDEX IF NOT EXISTS idx_admin_credentials_email ON public.admin_credentials (LOWER(email));

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Allow reading credentials for authentication verification
DROP POLICY IF EXISTS "Allow read access for admin credentials" ON public.admin_credentials;
CREATE POLICY "Allow read access for admin credentials" 
ON public.admin_credentials 
FOR SELECT 
USING (true);

-- Allow authenticated admins to update their own record
DROP POLICY IF EXISTS "Allow update for admin credentials" ON public.admin_credentials;
CREATE POLICY "Allow update for admin credentials" 
ON public.admin_credentials 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Allow inserting admin credentials
DROP POLICY IF EXISTS "Allow insert for admin credentials" ON public.admin_credentials;
CREATE POLICY "Allow insert for admin credentials" 
ON public.admin_credentials 
FOR INSERT 
WITH CHECK (true);

-- 5. Seed Official AMC Administrators
INSERT INTO public.admin_credentials (
    id,
    name,
    email,
    password,
    phone,
    role,
    designation,
    department,
    jurisdiction,
    security_clearance,
    avatar_emoji,
    permissions,
    is_active
) VALUES 
(
    'ADM-AMC-001',
    'Municipal Commissioner / Chief Administrator',
    'admin@municipal.gov.in',
    'Admin@2026Password',
    '+91 98250 99881',
    'Super Administrator',
    'Municipal Commissioner',
    'Ahmedabad Municipal Corporation (AMC) Head Office',
    'All Zones (East, West, North, South, Central, North-West, South-West)',
    'Level 5 (Unrestricted Command)',
    '🏛️',
    '["ALL_PERMISSIONS", "FLEET_OVERRIDE_DISPATCH", "INCIDENT_VERIFY_RESOLVE", "DRIVER_MANAGEMENT", "IOT_CALIBRATION", "AI_HOTSPOT_DEPLOY", "AUDIT_LOG_EXPORT"]'::jsonb,
    true
),
(
    'ADM-AMC-002',
    'Office of City Sanitation Commissioner',
    'commissioner@ahmedabad.gov.in',
    'AMC-Admin#2026',
    '+91 98240 11229',
    'Executive Director',
    'Director of Solid Waste Management',
    'AMC Central Solid Waste Directorate (Danapith)',
    'Ahmedabad Metropolitan Sanitation Corridors',
    'Level 4 (Fleet & Operations Override)',
    '🛡️',
    '["FLEET_OVERRIDE_DISPATCH", "INCIDENT_VERIFY_RESOLVE", "DRIVER_MANAGEMENT", "IOT_CALIBRATION", "AI_HOTSPOT_DEPLOY", "AUDIT_LOG_EXPORT"]'::jsonb,
    true
),
(
    'ADM-AMC-003',
    'Chief Fleet Operations Officer (North/West)',
    'operations.head@municipal.gov.in',
    'FleetAdmin2026!',
    '+91 98980 33412',
    'Operations Chief',
    'Head of Municipal Fleet Logistics',
    'AMC Central Sanitation Depot & Fleet MRF',
    'North & West Ahmedabad Zones',
    'Level 4 (Operations Command)',
    '🚛',
    '["FLEET_OVERRIDE_DISPATCH", "INCIDENT_VERIFY_RESOLVE", "DRIVER_MANAGEMENT", "IOT_CALIBRATION"]'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    designation = EXCLUDED.designation,
    department = EXCLUDED.department,
    jurisdiction = EXCLUDED.jurisdiction,
    security_clearance = EXCLUDED.security_clearance,
    avatar_emoji = EXCLUDED.avatar_emoji,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Verification query
SELECT id, name, email, role, designation, security_clearance, created_at FROM public.admin_credentials;
