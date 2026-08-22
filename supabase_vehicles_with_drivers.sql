-- ==============================================================================
-- SWAACHX: AHMEDABAD DISTRICT MUNICIPAL FLEET TRUCKS (PUBLIC.VEHICLES)
-- ==============================================================================
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xnixcnkxgiadipzqgbym/sql
-- ==============================================================================

-- 1. Ensure Table Exists with Driver Credential Columns
CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT PRIMARY KEY,
  plate_number TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT,
  driver_badge TEXT,
  driver_email TEXT,
  driver_pin TEXT DEFAULT 'FLT-AUTH-2026',
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

-- 2. Add Driver Credential Columns if table was created previously
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS driver_badge TEXT,
ADD COLUMN IF NOT EXISTS driver_email TEXT,
ADD COLUMN IF NOT EXISTS driver_pin TEXT DEFAULT 'FLT-AUTH-2026';

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
DROP POLICY IF EXISTS "Allow public read access on vehicles" ON public.vehicles;
CREATE POLICY "Allow public read access on vehicles"
ON public.vehicles FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Allow public/authenticated update on vehicles" ON public.vehicles;
CREATE POLICY "Allow public/authenticated update on vehicles"
ON public.vehicles FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 5. Seed 10 Ahmedabad District Municipal Trucks & Certified Drivers
INSERT INTO public.vehicles (
  id, plate_number, driver_name, driver_phone, driver_badge, driver_email, driver_pin,
  type, status, last_location, latitude, longitude, speed, heading,
  battery_or_fuel, load_capacity_percent, assigned_route, last_updated
) VALUES
(
  'TRK-AMD-801', 'GJ-01-CZ-4821', 'Suresh Kumar', '9823144552', 'DRV-801', 'suresh.k@wastefleet.org', 'FLT-801-AUTH',
  'Heavy Compactor (14T)', 'Active', 'Chandlodiya Garden - Sector 14 North Junction, Ahmedabad', 23.0784, 72.5441, 24, 'NE',
  85, 68, 'Route A1 - North Ahmedabad (Chandlodiya - Ranip - RTO Circle)', NOW()
),
(
  'TRK-AMD-802', 'GJ-01-EV-1234', 'Ramesh Patel', '9825011223', 'DRV-802', 'ramesh.patel@wastefleet.org', 'FLT-802-AUTH',
  'Electric Tipper (4.5T)', 'Active', 'Satellite Shivranjani Cross Road, Ahmedabad', 23.0225, 72.5280, 18, 'SW',
  92, 42, 'Route W2 - Western Commercial (Satellite - Vastrapur - IIM-A)', NOW()
),
(
  'TRK-AMD-803', 'GJ-27-AK-5678', 'Vikram Singh', '9876501234', 'DRV-803', 'vikram.singh@wastefleet.org', 'FLT-803-AUTH',
  'Rear-Loader Compactor (10T)', 'Active', 'Sindhu Bhavan Road (SBR) & Pakwan Junction, Ahmedabad', 23.0451, 72.5085, 31, 'E',
  76, 88, 'Route W4 - SG Highway & Thaltej Expressway Corridor', NOW()
),
(
  'TRK-AMD-804', 'GJ-01-BQ-9012', 'Mahesh Sharma', '9898012345', 'DRV-804', 'mahesh.sharma@wastefleet.org', 'FLT-804-AUTH',
  'Hook-Loader Bin Carrier (12T)', 'Active', 'Manek Chowk & Khadia Heritage Corridor, Ahmedabad', 23.0248, 72.5898, 14, 'N',
  68, 91, 'Route C1 - Walled City Heritage & Night Market Route', NOW()
),
(
  'TRK-AMD-805', 'GJ-01-DW-3456', 'Rajesh Yadav', '9812345678', 'DRV-805', 'rajesh.yadav@wastefleet.org', 'FLT-805-AUTH',
  'Mini Bio-Waste Collector (2.5T)', 'Active', 'Civil Hospital & Asarwa Health Zone, Ahmedabad', 23.0538, 72.5975, 20, 'NW',
  80, 55, 'Route N3 - Asarwa Hospital & Bio-Medical Specialized Corridor', NOW()
),
(
  'TRK-AMD-806', 'GJ-01-HY-7890', 'Dharmesh Solanki', '9824056789', 'DRV-806', 'dharmesh.solanki@wastefleet.org', 'FLT-806-AUTH',
  'Mechanical Street Sweeper', 'Active', 'Kankaria Lake Front Gate 3 - Maninagar, Ahmedabad', 23.0063, 72.6025, 12, 'SE',
  88, 35, 'Route S1 - South Ahmedabad (Maninagar - Kankaria - Isanpur)', NOW()
),
(
  'TRK-AMD-807', 'GJ-01-KL-2468', 'Pravin Parmar', '9898123456', 'DRV-807', 'pravin.parmar@wastefleet.org', 'FLT-807-AUTH',
  'Side-Loader Eco Collector (8T)', 'Idle', 'Law Garden Khau Galli & Ellisbridge, Ahmedabad', 23.0270, 72.5596, 0, 'W',
  95, 15, 'Route C3 - Navrangpura & Ashram Road Riverfront Zone', NOW()
),
(
  'TRK-AMD-808', 'GJ-27-MN-1357', 'Jignesh Vaghela', '9825678901', 'DRV-808', 'jignesh.vaghela@wastefleet.org', 'FLT-808-AUTH',
  'Heavy Compactor (14T)', 'Active', 'South Bopal Ring Road & Shilaj Junction, Ahmedabad', 23.0335, 72.4640, 28, 'NW',
  83, 62, 'Route W5 - Bopal & Ghuma West Residential Sector', NOW()
),
(
  'TRK-AMD-809', 'GJ-01-PR-9753', 'Chetan Barot', '9879012345', 'DRV-809', 'chetan.barot@wastefleet.org', 'FLT-809-AUTH',
  'Hazardous Waste Tipper (10T)', 'Maintenance', 'Naroda GIDC Industrial Estate Phase 2, Ahmedabad', 23.0760, 72.6580, 0, 'NE',
  60, 0, 'Route E2 - East Ahmedabad Industrial (Naroda - Odhav - Nikol)', NOW()
),
(
  'TRK-AMD-810', 'GJ-01-TX-8642', 'Ketan Makwana', '9825123499', 'DRV-810', 'ketan.makwana@wastefleet.org', 'FLT-810-AUTH',
  'Zero-Emission Electric Sweeper', 'Active', 'Sabarmati Riverfront Promenade West, Ahmedabad', 23.0390, 72.5710, 15, 'S',
  91, 28, 'Route R1 - Sabarmati Riverfront Green Corridor', NOW()
)
ON CONFLICT (id) DO UPDATE SET
  plate_number = EXCLUDED.plate_number,
  driver_name = EXCLUDED.driver_name,
  driver_phone = EXCLUDED.driver_phone,
  driver_badge = EXCLUDED.driver_badge,
  driver_email = EXCLUDED.driver_email,
  driver_pin = EXCLUDED.driver_pin,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  last_location = EXCLUDED.last_location,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  speed = EXCLUDED.speed,
  heading = EXCLUDED.heading,
  battery_or_fuel = EXCLUDED.battery_or_fuel,
  load_capacity_percent = EXCLUDED.load_capacity_percent,
  assigned_route = EXCLUDED.assigned_route,
  last_updated = NOW();

-- 6. Verification
SELECT id, plate_number, driver_name, driver_badge, last_location, assigned_route, status 
FROM public.vehicles;
