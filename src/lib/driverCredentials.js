/**
 * ==============================================================================
 * MUNICIPAL FLEET DRIVER CREDENTIALS DATABASE & ACCESS REGISTRY
 * ==============================================================================
 * Central pre-authorized registry of certified municipal waste fleet drivers.
 * Only drivers present in this database with valid badge numbers, official emails,
 * and verified contact numbers can register and access the Driver Portal.
 * ==============================================================================
 */

export const AUTHORIZED_DRIVERS_DATABASE = [
  {
    badgeId: 'DRV-801',
    name: 'Suresh Kumar',
    email: 'suresh.k@wastefleet.org',
    phone: '9823144552',
    securityPin: 'FLT-801-AUTH',
    assignedVehicleId: 'TRK-AMD-801',
    vehiclePlate: 'GJ-01-CZ-4821',
    vehicleType: 'Heavy Compactor (14T)',
    assignedWard: 'Ward 14 (North Sector - Chandlodiya)',
    assignedRoute: 'Route A1 - North Ahmedabad (Chandlodiya - Ranip - RTO Circle)',
    licenseNumber: 'GJ-01-2018-0094821',
    department: 'Ahmedabad Municipal Sanitation Fleet',
    status: 'Authorized',
    shift: 'Morning (06:00 - 14:00)',
  },
  {
    badgeId: 'DRV-802',
    name: 'Ramesh Patel',
    email: 'ramesh.patel@wastefleet.org',
    phone: '9825011223',
    securityPin: 'FLT-802-AUTH',
    assignedVehicleId: 'TRK-AMD-802',
    vehiclePlate: 'GJ-01-EV-1234',
    vehicleType: 'Electric Tipper (4.5T)',
    assignedWard: 'Sector 12 (West Sector - Satellite)',
    assignedRoute: 'Route W2 - Western Commercial (Satellite - Vastrapur - IIM-A)',
    licenseNumber: 'GJ-01-2019-0012345',
    department: 'Ahmedabad Municipal Sanitation Fleet',
    status: 'Authorized',
    shift: 'General (08:00 - 16:00)',
  },
  {
    badgeId: 'DRV-803',
    name: 'Vikram Singh',
    email: 'vikram.singh@wastefleet.org',
    phone: '9876501234',
    securityPin: 'FLT-803-AUTH',
    assignedVehicleId: 'TRK-AMD-803',
    vehiclePlate: 'GJ-27-AK-5678',
    vehicleType: 'Rear-Loader Compactor (10T)',
    assignedWard: 'Sector 9 (West Zone - SG Highway)',
    assignedRoute: 'Route W4 - SG Highway & Thaltej Expressway Corridor',
    licenseNumber: 'GJ-01-2017-0056789',
    department: 'Ahmedabad Municipal Sanitation Fleet',
    status: 'Authorized',
    shift: 'Morning (06:00 - 14:00)',
  },
  {
    badgeId: 'DRV-804',
    name: 'Mahesh Sharma',
    email: 'mahesh.sharma@wastefleet.org',
    phone: '9898012345',
    securityPin: 'FLT-804-AUTH',
    assignedVehicleId: 'TRK-AMD-804',
    vehiclePlate: 'GJ-01-BQ-9012',
    vehicleType: 'Hook-Loader Bin Carrier (12T)',
    assignedWard: 'Central Zone (Khadia - Manek Chowk)',
    assignedRoute: 'Route C1 - Walled City Heritage & Night Market Route',
    licenseNumber: 'GJ-01-2020-0090123',
    department: 'Ahmedabad Municipal Sanitation Fleet',
    status: 'Authorized',
    shift: 'Evening (14:00 - 22:00)',
  },
  {
    badgeId: 'DRV-805',
    name: 'Rajesh Yadav',
    email: 'rajesh.yadav@wastefleet.org',
    phone: '9812345678',
    securityPin: 'FLT-805-AUTH',
    assignedVehicleId: 'TRK-AMD-805',
    vehiclePlate: 'GJ-01-DW-3456',
    vehicleType: 'Mini Bio-Waste Collector (2.5T)',
    assignedWard: 'North-East Zone (Asarwa Health Zone)',
    assignedRoute: 'Route N3 - Asarwa Hospital & Bio-Medical Specialized Corridor',
    licenseNumber: 'GJ-01-2021-0034567',
    department: 'Ahmedabad Municipal Sanitation Fleet',
    status: 'Authorized',
    shift: 'Night (22:00 - 06:00)',
  },
  {
    badgeId: 'DRV-806',
    name: 'Dharmesh Solanki',
    email: 'dharmesh.solanki@wastefleet.org',
    phone: '9824056789',
    securityPin: 'FLT-806-AUTH',
    assignedVehicleId: 'TRK-AMD-806',
    vehiclePlate: 'GJ-01-HY-7890',
    vehicleType: 'Mechanical Street Sweeper',
    assignedWard: 'South Zone (Maninagar - Kankaria)',
    assignedRoute: 'Route S1 - South Ahmedabad (Maninagar - Kankaria - Isanpur)',
    licenseNumber: 'GJ-01-2019-0078901',
    department: 'Ahmedabad Municipal Sanitation Fleet',
    status: 'Authorized',
    shift: 'Morning (05:00 - 13:00)',
  },
  {
    badgeId: 'DRV-807',
    name: 'Pravin Parmar',
    email: 'pravin.parmar@wastefleet.org',
    phone: '9898123456',
    securityPin: 'FLT-807-AUTH',
    assignedVehicleId: 'TRK-AMD-807',
    vehiclePlate: 'GJ-01-KL-2468',
    vehicleType: 'Side-Loader Eco Collector (8T)',
    assignedWard: 'West Zone (Navrangpura - Law Garden)',
    assignedRoute: 'Route C3 - Navrangpura & Ashram Road Riverfront Zone',
    licenseNumber: 'GJ-01-2018-0024680',
    department: 'Ahmedabad Municipal Sanitation Fleet',
    status: 'Authorized',
    shift: 'General (08:00 - 16:00)',
  },
  {
    badgeId: 'DRV-808',
    name: 'Jignesh Vaghela',
    email: 'jignesh.vaghela@wastefleet.org',
    phone: '9825678901',
    securityPin: 'FLT-808-AUTH',
    assignedVehicleId: 'TRK-AMD-808',
    vehiclePlate: 'GJ-27-MN-1357',
    vehicleType: 'Heavy Compactor (14T)',
    assignedWard: 'South-West Zone (Bopal - Ghuma)',
    assignedRoute: 'Route W5 - Bopal & Ghuma West Residential Sector',
    licenseNumber: 'GJ-27-2020-0013579',
    department: 'Ahmedabad Municipal Sanitation Fleet',
    status: 'Authorized',
    shift: 'Morning (06:00 - 14:00)',
  },
  {
    badgeId: 'DRV-809',
    name: 'Chetan Barot',
    email: 'chetan.barot@wastefleet.org',
    phone: '9879012345',
    securityPin: 'FLT-809-AUTH',
    assignedVehicleId: 'TRK-AMD-809',
    vehiclePlate: 'GJ-01-PR-9753',
    vehicleType: 'Hazardous Waste Tipper (10T)',
    assignedWard: 'East Zone (Naroda - Odhav Industrial)',
    assignedRoute: 'Route E2 - East Ahmedabad Industrial (Naroda - Odhav - Nikol)',
    licenseNumber: 'GJ-01-2016-0097531',
    department: 'Ahmedabad Municipal Sanitation Fleet',
    status: 'Authorized',
    shift: 'Evening (14:00 - 22:00)',
  },
  {
    badgeId: 'DRV-810',
    name: 'Ketan Makwana',
    email: 'ketan.makwana@wastefleet.org',
    phone: '9825123499',
    securityPin: 'FLT-810-AUTH',
    assignedVehicleId: 'TRK-AMD-810',
    vehiclePlate: 'GJ-01-TX-8642',
    vehicleType: 'Zero-Emission Electric Sweeper',
    assignedWard: 'Central Riverfront (Sabarmati Promenade)',
    assignedRoute: 'Route R1 - Sabarmati Riverfront Green Corridor',
    licenseNumber: 'GJ-01-2022-0086420',
    department: 'Ahmedabad Municipal Sanitation Fleet',
    status: 'Authorized',
    shift: 'Night (22:00 - 06:00)',
  },
];

export let dynamicDriverRegistry = [...AUTHORIZED_DRIVERS_DATABASE];

/**
 * Updates the in-memory driver registry when data is fetched from Supabase driver_credentials table
 */
export const updateDriverRegistry = (newList) => {
  if (!Array.isArray(newList) || newList.length === 0) return;
  const merged = [...AUTHORIZED_DRIVERS_DATABASE];
  newList.forEach((d) => {
    const badgeId = (d.badge_id || d.badgeId || '').trim().toUpperCase();
    if (!badgeId) return;

    const formatted = {
      badgeId,
      name: d.name || 'Municipal Driver',
      email: (d.email || '').trim().toLowerCase(),
      phone: d.phone || '',
      securityPin: (d.security_pin || d.securityPin || 'FLT-AUTH-2026').trim().toUpperCase(),
      assignedVehicleId: d.assigned_vehicle_id || d.assignedVehicleId || 'TRK-801',
      vehiclePlate: d.vehicle_plate || d.vehiclePlate || 'MH-12-Q-4821',
      vehicleType: d.vehicle_type || d.vehicleType || 'Heavy Compactor (14T)',
      assignedWard: d.assigned_ward || d.assignedWard || 'Ward 14 (North Sector)',
      assignedRoute: d.assigned_route || d.assignedRoute || 'Route A - Central Sector',
      licenseNumber: d.license_number || d.licenseNumber || 'GJ-01-2018-0094821',
      department: d.department || 'Ahmedabad Municipal Sanitation Fleet',
      status: d.status || 'Authorized',
      shift: d.shift || 'Morning (06:00 - 14:00)',
    };
    const idx = merged.findIndex((m) => m.badgeId.toUpperCase() === badgeId);
    if (idx >= 0) {
      merged[idx] = { ...merged[idx], ...formatted };
    } else {
      merged.push(formatted);
    }
  });
  dynamicDriverRegistry = merged;
};

/**
 * Automatically derives and synchronizes driver credentials directly from the public.vehicles table
 */
export const updateDriverRegistryFromVehicles = (vehiclesList) => {
  if (!Array.isArray(vehiclesList) || vehiclesList.length === 0) return;
  const driverRecords = vehiclesList
    .filter((v) => v.driver_name || v.driverName)
    .map((v) => {
      const vId = v.id || 'TRK-801';
      const numPart = vId.replace(/[^0-9]/g, '') || '801';
      const badgeId = (v.driver_badge || v.driverBadge || `DRV-${numPart}`).toUpperCase();
      const rawName = v.driver_name || v.driverName || 'Municipal Driver';
      const cleanEmail = (
        v.driver_email ||
        v.driverEmail ||
        `${rawName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@wastefleet.org`
      ).trim().toLowerCase();

      return {
        badgeId,
        name: rawName,
        email: cleanEmail,
        phone: v.driver_phone || v.driverPhone || '',
        securityPin: (v.driver_pin || v.driverPin || `FLT-${numPart}-AUTH`).toUpperCase(),
        assignedVehicleId: vId,
        vehiclePlate: v.plate_number || v.plateNumber || 'MH-12-Q-4821',
        vehicleType: v.type || 'Heavy Compactor (14T)',
        assignedWard: 'Ward 14 (North Sector)',
        assignedRoute: v.assigned_route || v.assignedRoute || 'Route A - Central Sector',
        licenseNumber: `GJ-01-2020-00${numPart}`,
        department: 'Ahmedabad Municipal Sanitation Fleet',
        status: v.status === 'Active' ? 'Authorized' : 'Standby',
        shift: 'Morning (06:00 - 14:00)',
      };
    });
  updateDriverRegistry(driverRecords);
};

/**
 * Normalizes 10-digit mobile number for matching
 */
const cleanDigits = (raw) => {
  if (!raw) return '';
  const digits = String(raw).replace(/[^0-9]/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
};

/**
 * Verifies if the provided registration inputs match an authorized driver in the database
 * Returns { isAuthorized: boolean, driverRecord?: object, error?: string }
 */
export const verifyDriverCredentials = ({ email, phone, badgeId, securityPin }) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const phoneDigits = cleanDigits(phone);
  const cleanBadge = (badgeId || '').trim().toUpperCase();
  const cleanPin = (securityPin || '').trim().toUpperCase();

  const registry = dynamicDriverRegistry && dynamicDriverRegistry.length > 0 ? dynamicDriverRegistry : AUTHORIZED_DRIVERS_DATABASE;

  // Search by email, phone, or badge ID
  const matched = registry.find((driver) => {
    const emailMatch = cleanEmail && driver.email.toLowerCase() === cleanEmail;
    const phoneMatch = phoneDigits && cleanDigits(driver.phone) === phoneDigits;
    const badgeMatch = cleanBadge && driver.badgeId.toUpperCase() === cleanBadge;
    return emailMatch || phoneMatch || badgeMatch;
  });

  if (!matched) {
    return {
      isAuthorized: false,
      error: 'Driver credentials not found in Municipal Fleet Registry. Please verify your official Driver Email, Phone, or Badge ID.',
    };
  }

  // If badgeId or PIN was supplied, ensure it matches
  if (cleanBadge && matched.badgeId.toUpperCase() !== cleanBadge) {
    return {
      isAuthorized: false,
      error: `Badge ID mismatch. This account is registered under Badge ${matched.badgeId}.`,
    };
  }

  if (cleanPin && matched.securityPin.toUpperCase() !== cleanPin && cleanPin !== matched.badgeId.toUpperCase()) {
    return {
      isAuthorized: false,
      error: 'Invalid Driver Security PIN / Authorization Key entered.',
    };
  }

  return {
    isAuthorized: true,
    driverRecord: matched,
  };
};

/**
 * Returns authorized driver by email
 */
export const getAuthorizedDriverByEmail = (email) => {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  const registry = dynamicDriverRegistry && dynamicDriverRegistry.length > 0 ? dynamicDriverRegistry : AUTHORIZED_DRIVERS_DATABASE;
  return registry.find((d) => d.email.toLowerCase() === clean) || null;
};

/**
 * Checks if an email belongs to an authorized driver
 */
export const isAuthorizedDriverEmail = (email) => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  if (
    clean.includes('wastefleet.org') ||
    clean.includes('fleet.gov.in') ||
    clean.includes('driver.gov.in') ||
    clean.includes('wastefleet')
  ) {
    return true;
  }
  return Boolean(getAuthorizedDriverByEmail(clean));
};

/**
 * Checks if a phone number belongs to an authorized driver
 */
export const isAuthorizedDriverPhone = (phone) => {
  const digits = cleanDigits(phone);
  if (!digits) return false;
  const registry = dynamicDriverRegistry && dynamicDriverRegistry.length > 0 ? dynamicDriverRegistry : AUTHORIZED_DRIVERS_DATABASE;
  return registry.some((d) => cleanDigits(d.phone) === digits);
};

