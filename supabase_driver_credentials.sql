-- ==============================================================================
-- SWAACHX: AHMEDABAD DISTRICT MUNICIPAL DRIVER CREDENTIALS REGISTRY
-- ==============================================================================
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xnixcnkxgiadipzqgbym/sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.driver_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    security_pin VARCHAR(100) NOT NULL DEFAULT 'FLT-AUTH-2026',
    assigned_vehicle_id VARCHAR(50) NOT NULL,
    vehicle_plate VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(100) DEFAULT 'Heavy Compactor (14T)',
    assigned_ward VARCHAR(255) DEFAULT 'Ward 14 (North Sector - Chandlodiya)',
    assigned_route VARCHAR(255) DEFAULT 'Route A1 - North Ahmedabad (Chandlodiya - Ranip - RTO Circle)',
    license_number VARCHAR(100) NOT NULL,
    department VARCHAR(255) DEFAULT 'Ahmedabad Municipal Sanitation Fleet',
    status VARCHAR(50) DEFAULT 'Authorized',
    shift VARCHAR(100) DEFAULT 'Morning (06:00 - 14:00)',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.driver_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on driver_credentials" ON public.driver_credentials;
CREATE POLICY "Allow public read access on driver_credentials"
ON public.driver_credentials FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert/update on driver_credentials" ON public.driver_credentials;
CREATE POLICY "Allow authenticated insert/update on driver_credentials"
ON public.driver_credentials FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

INSERT INTO public.driver_credentials (
    badge_id, name, email, phone, security_pin, 
    assigned_vehicle_id, vehicle_plate, vehicle_type, 
    assigned_ward, assigned_route, license_number, department, status, shift
) VALUES 
(
    'DRV-801', 'Suresh Kumar', 'suresh.k@wastefleet.org', '9823144552', 'FLT-801-AUTH',
    'TRK-AMD-801', 'GJ-01-CZ-4821', 'Heavy Compactor (14T)',
    'Ward 14 (North Sector - Chandlodiya)', 'Route A1 - North Ahmedabad (Chandlodiya - Ranip - RTO Circle)', 'GJ-01-2018-0094821',
    'Ahmedabad Municipal Sanitation Fleet', 'Authorized', 'Morning (06:00 - 14:00)'
),
(
    'DRV-802', 'Ramesh Patel', 'ramesh.patel@wastefleet.org', '9825011223', 'FLT-802-AUTH',
    'TRK-AMD-802', 'GJ-01-EV-1234', 'Electric Tipper (4.5T)',
    'Sector 12 (West Sector - Satellite)', 'Route W2 - Western Commercial (Satellite - Vastrapur - IIM-A)', 'GJ-01-2019-0012345',
    'Ahmedabad Municipal Sanitation Fleet', 'Authorized', 'General (08:00 - 16:00)'
),
(
    'DRV-803', 'Vikram Singh', 'vikram.singh@wastefleet.org', '9876501234', 'FLT-803-AUTH',
    'TRK-AMD-803', 'GJ-27-AK-5678', 'Rear-Loader Compactor (10T)',
    'Sector 9 (West Zone - SG Highway)', 'Route W4 - SG Highway & Thaltej Expressway Corridor', 'GJ-01-2017-0056789',
    'Ahmedabad Municipal Sanitation Fleet', 'Authorized', 'Morning (06:00 - 14:00)'
),
(
    'DRV-804', 'Mahesh Sharma', 'mahesh.sharma@wastefleet.org', '9898012345', 'FLT-804-AUTH',
    'TRK-AMD-804', 'GJ-01-BQ-9012', 'Hook-Loader Bin Carrier (12T)',
    'Central Zone (Khadia - Manek Chowk)', 'Route C1 - Walled City Heritage & Night Market Route', 'GJ-01-2020-0090123',
    'Ahmedabad Municipal Sanitation Fleet', 'Authorized', 'Evening (14:00 - 22:00)'
),
(
    'DRV-805', 'Rajesh Yadav', 'rajesh.yadav@wastefleet.org', '9812345678', 'FLT-805-AUTH',
    'TRK-AMD-805', 'GJ-01-DW-3456', 'Mini Bio-Waste Collector (2.5T)',
    'North-East Zone (Asarwa Health Zone)', 'Route N3 - Asarwa Hospital & Bio-Medical Specialized Corridor', 'GJ-01-2021-0034567',
    'Ahmedabad Municipal Sanitation Fleet', 'Authorized', 'Night (22:00 - 06:00)'
),
(
    'DRV-806', 'Dharmesh Solanki', 'dharmesh.solanki@wastefleet.org', '9824056789', 'FLT-806-AUTH',
    'TRK-AMD-806', 'GJ-01-HY-7890', 'Mechanical Street Sweeper',
    'South Zone (Maninagar - Kankaria)', 'Route S1 - South Ahmedabad (Maninagar - Kankaria - Isanpur)', 'GJ-01-2019-0078901',
    'Ahmedabad Municipal Sanitation Fleet', 'Authorized', 'Morning (05:00 - 13:00)'
),
(
    'DRV-807', 'Pravin Parmar', 'pravin.parmar@wastefleet.org', '9898123456', 'FLT-807-AUTH',
    'TRK-AMD-807', 'GJ-01-KL-2468', 'Side-Loader Eco Collector (8T)',
    'West Zone (Navrangpura - Law Garden)', 'Route C3 - Navrangpura & Ashram Road Riverfront Zone', 'GJ-01-2018-0024680',
    'Ahmedabad Municipal Sanitation Fleet', 'Authorized', 'General (08:00 - 16:00)'
),
(
    'DRV-808', 'Jignesh Vaghela', 'jignesh.vaghela@wastefleet.org', '9825678901', 'FLT-808-AUTH',
    'TRK-AMD-808', 'GJ-27-MN-1357', 'Heavy Compactor (14T)',
    'South-West Zone (Bopal - Ghuma)', 'Route W5 - Bopal & Ghuma West Residential Sector', 'GJ-27-2020-0013579',
    'Ahmedabad Municipal Sanitation Fleet', 'Authorized', 'Morning (06:00 - 14:00)'
),
(
    'DRV-809', 'Chetan Barot', 'chetan.barot@wastefleet.org', '9879012345', 'FLT-809-AUTH',
    'TRK-AMD-809', 'GJ-01-PR-9753', 'Hazardous Waste Tipper (10T)',
    'East Zone (Naroda - Odhav Industrial)', 'Route E2 - East Ahmedabad Industrial (Naroda - Odhav - Nikol)', 'GJ-01-2016-0097531',
    'Ahmedabad Municipal Sanitation Fleet', 'Authorized', 'Evening (14:00 - 22:00)'
),
(
    'DRV-810', 'Ketan Makwana', 'ketan.makwana@wastefleet.org', '9825123499', 'FLT-810-AUTH',
    'TRK-AMD-810', 'GJ-01-TX-8642', 'Zero-Emission Electric Sweeper',
    'Central Riverfront (Sabarmati Promenade)', 'Route R1 - Sabarmati Riverfront Green Corridor', 'GJ-01-2022-0086420',
    'Ahmedabad Municipal Sanitation Fleet', 'Authorized', 'Night (22:00 - 06:00)'
)
ON CONFLICT (badge_id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    assigned_vehicle_id = EXCLUDED.assigned_vehicle_id,
    vehicle_plate = EXCLUDED.vehicle_plate,
    assigned_ward = EXCLUDED.assigned_ward,
    assigned_route = EXCLUDED.assigned_route,
    updated_at = NOW();

SELECT badge_id, name, email, phone, assigned_vehicle_id, vehicle_plate, status FROM public.driver_credentials;
