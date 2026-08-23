/**
 * ==============================================================================
 * DRIVER ROUTE & TERRITORY ASSIGNMENT ENGINE (AHMEDABAD DISTRICT)
 * ==============================================================================
 * Maps each certified municipal driver to their assigned route, vehicle telemetry,
 * sequence of smart dustbins, AI waste surge hotspots, and citizen reports.
 * ==============================================================================
 */

import { AUTHORIZED_DRIVERS_DATABASE } from './driverCredentials';
import { DEFAULT_AHMEDABAD_VEHICLES, DEFAULT_DUSTBINS, DEFAULT_ML_HOTSPOTS } from '../types';

/**
 * Pre-defined Master Sector Mapping for Ahmedabad District
 */
export const DRIVER_TERRITORY_MAPPINGS = {
  'DRV-801': {
    driverBadge: 'DRV-801',
    driverName: 'Suresh Kumar',
    vehicleId: 'TRK-AMD-801',
    plateNumber: 'GJ-01-CZ-4821',
    vehicleType: 'Heavy Compactor (14T)',
    maxCapacityTons: 14.0,
    ward: 'Ward 14 (North Sector - Chandlodiya)',
    assignedRoute: 'Route A1 - North Ahmedabad (Chandlodiya - Ranip - RTO Circle)',
    sectorKeywords: ['chandlodiya', 'ranip', 'gota', 'rto', 'north'],
    assignedBinIds: ['BIN-AMD-101', 'BIN-AMD-110', 'BIN-AMD-107'],
    assignedHotspotIds: ['HOTSPOT-AMD-09'],
    depotName: 'North Depot (Ranip)',
  },
  'DRV-802': {
    driverBadge: 'DRV-802',
    driverName: 'Ramesh Patel',
    vehicleId: 'TRK-AMD-802',
    plateNumber: 'GJ-01-EV-1234',
    vehicleType: 'Electric Tipper (4.5T)',
    maxCapacityTons: 4.5,
    ward: 'Sector 12 (West Sector - Satellite)',
    assignedRoute: 'Route W2 - Western Commercial (Satellite - Vastrapur - IIM-A)',
    sectorKeywords: ['satellite', 'vastrapur', 'iim', 'shivranjani', 'panchvati'],
    assignedBinIds: ['BIN-AMD-102', 'BIN-AMD-106', 'BIN-AMD-111'],
    assignedHotspotIds: ['HOTSPOT-AMD-08'],
    depotName: 'West Central Depot (Vastrapur)',
  },
  'DRV-803': {
    driverBadge: 'DRV-803',
    driverName: 'Vikram Singh',
    vehicleId: 'TRK-AMD-803',
    plateNumber: 'GJ-27-AK-5678',
    vehicleType: 'Rear-Loader Compactor (10T)',
    maxCapacityTons: 10.0,
    ward: 'Sector 9 (West Zone - SG Highway)',
    assignedRoute: 'Route W4 - SG Highway & Thaltej Expressway Corridor',
    sectorKeywords: ['sindhu bhavan', 'sbr', 'sg highway', 'bodakdev', 'thaltej', 'iscon'],
    assignedBinIds: ['BIN-AMD-105', 'BIN-AMD-112'],
    assignedHotspotIds: ['HOTSPOT-AMD-03'],
    depotName: 'SG Highway Fleet Yard',
  },
  'DRV-804': {
    driverBadge: 'DRV-804',
    driverName: 'Mahesh Sharma',
    vehicleId: 'TRK-AMD-804',
    plateNumber: 'GJ-01-BQ-9012',
    vehicleType: 'Hook-Loader Bin Carrier (12T)',
    maxCapacityTons: 12.0,
    ward: 'Central Zone (Khadia - Manek Chowk)',
    assignedRoute: 'Route C1 - Walled City Heritage & Night Market Route',
    sectorKeywords: ['manek chowk', 'khadia', 'kalupur', 'walled city', 'heritage', 'central'],
    assignedBinIds: ['BIN-AMD-104', 'BIN-AMD-103'],
    assignedHotspotIds: ['HOTSPOT-AMD-01', 'HOTSPOT-AMD-02'],
    depotName: 'Central Heritage Depot (Astodia Gate)',
  },
  'DRV-805': {
    driverBadge: 'DRV-805',
    driverName: 'Rajesh Yadav',
    vehicleId: 'TRK-AMD-805',
    plateNumber: 'GJ-01-DW-3456',
    vehicleType: 'Mini Bio-Waste Collector (2.5T)',
    maxCapacityTons: 2.5,
    ward: 'North-East Zone (Asarwa Health Zone)',
    assignedRoute: 'Route N3 - Asarwa Hospital & Bio-Medical Specialized Corridor',
    sectorKeywords: ['civil hospital', 'asarwa', 'hospital', 'bio', 'health', 'medical', 'north-east'],
    assignedBinIds: ['BIN-AMD-101', 'BIN-AMD-107'],
    assignedHotspotIds: ['HOTSPOT-AMD-09'],
    depotName: 'Asarwa Bio-Medical Incinerator Hub',
  },
  'DRV-806': {
    driverBadge: 'DRV-806',
    driverName: 'Dharmesh Solanki',
    vehicleId: 'TRK-AMD-806',
    plateNumber: 'GJ-01-HY-7890',
    vehicleType: 'Mechanical Street Sweeper',
    maxCapacityTons: 6.0,
    ward: 'South Zone (Maninagar - Kankaria)',
    assignedRoute: 'Route S1 - South Ahmedabad (Maninagar - Kankaria - Isanpur)',
    sectorKeywords: ['maninagar', 'kankaria', 'isanpur', 'geeta mandir', 'south', 'astodia'],
    assignedBinIds: ['BIN-AMD-108', 'BIN-AMD-106'],
    assignedHotspotIds: ['HOTSPOT-AMD-06'],
    depotName: 'South Depot (Maninagar East)',
  },
  'DRV-807': {
    driverBadge: 'DRV-807',
    driverName: 'Pravin Parmar',
    vehicleId: 'TRK-AMD-807',
    plateNumber: 'GJ-01-KL-2468',
    vehicleType: 'Side-Loader Eco Collector (8T)',
    maxCapacityTons: 8.0,
    ward: 'West Zone (Navrangpura - Law Garden)',
    assignedRoute: 'Route C3 - Navrangpura & Ashram Road Riverfront Zone',
    sectorKeywords: ['navrangpura', 'law garden', 'cg road', 'ellisbridge', 'ashram road'],
    assignedBinIds: ['BIN-AMD-103', 'BIN-AMD-104', 'BIN-AMD-102'],
    assignedHotspotIds: ['HOTSPOT-AMD-04', 'HOTSPOT-AMD-07'],
    depotName: 'Ellisbridge Municipal Yard',
  },
  'DRV-808': {
    driverBadge: 'DRV-808',
    driverName: 'Jignesh Vaghela',
    vehicleId: 'TRK-AMD-808',
    plateNumber: 'GJ-27-MN-1357',
    vehicleType: 'Heavy Compactor (14T)',
    maxCapacityTons: 14.0,
    ward: 'South-West Zone (Bopal - Ghuma)',
    assignedRoute: 'Route W5 - Bopal & Ghuma West Residential Sector',
    sectorKeywords: ['bopal', 'ghuma', 'shilaj', 'ring road', 'south-west'],
    assignedBinIds: ['BIN-AMD-109', 'BIN-AMD-105'],
    assignedHotspotIds: ['HOTSPOT-AMD-03'],
    depotName: 'Bopal Municipal Sub-Station',
  },
  'DRV-809': {
    driverBadge: 'DRV-809',
    driverName: 'Chetan Barot',
    vehicleId: 'TRK-AMD-809',
    plateNumber: 'GJ-01-PR-9753',
    vehicleType: 'Hazardous Waste Tipper (10T)',
    maxCapacityTons: 10.0,
    ward: 'East Zone (Naroda - Odhav Industrial)',
    assignedRoute: 'Route E2 - East Ahmedabad Industrial (Naroda - Odhav - Nikol)',
    sectorKeywords: ['naroda', 'odhav', 'nikol', 'gidc', 'industrial', 'east', 'chemical'],
    assignedBinIds: ['BIN-AMD-110', 'BIN-AMD-108'],
    assignedHotspotIds: ['HOTSPOT-AMD-05'],
    depotName: 'Naroda GIDC Industrial Base',
  },
  'DRV-810': {
    driverBadge: 'DRV-810',
    driverName: 'Ketan Makwana',
    vehicleId: 'TRK-AMD-810',
    plateNumber: 'GJ-01-TX-8642',
    vehicleType: 'Zero-Emission Electric Sweeper',
    maxCapacityTons: 3.5,
    ward: 'Central Riverfront (Sabarmati Promenade)',
    assignedRoute: 'Route R1 - Sabarmati Riverfront Green Corridor',
    sectorKeywords: ['sabarmati', 'riverfront', 'promenade', 'ashram', 'paldi', 'subhash bridge'],
    assignedBinIds: ['BIN-AMD-107', 'BIN-AMD-111', 'BIN-AMD-101'],
    assignedHotspotIds: ['HOTSPOT-AMD-10'],
    depotName: 'Riverfront Eco-Depot (Subhash Bridge)',
  },
};

/**
 * Calculates straight line / road distance approximation in kilometers
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 1.5;
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};

// Default verified citizen reports across Ahmedabad sectors
export const DEFAULT_AHMEDABAD_SECTOR_REPORTS = [
  {
    id: 'REP-AMD-301',
    category: 'Overflowing Public Bin',
    priority: 'Critical',
    location: 'Railway Crossing Market, Chandlodiya',
    ward: 'Ward 14 (Chandlodiya)',
    description: 'Commercial dumpster overflowing with vegetable market packaging and plastic crates.',
    citizenName: 'Priya Joshi',
    citizenPhone: '+91 98251 44521',
    status: 'Pending Verification',
    assignedDriver: 'TRK-AMD-801',
    coordinates: { lat: 23.0812, lng: 72.5425 },
  },
  {
    id: 'REP-AMD-302',
    category: 'Illegal Construction Dumping',
    priority: 'High',
    location: 'Ranip BRTS Bus Corridor Junction',
    ward: 'Ranip Ward',
    description: 'Debris sacks and broken masonry dumped on public service road near BRTS station.',
    citizenName: 'Manish Shah',
    citizenPhone: '+91 98790 33411',
    status: 'Pending Verification',
    assignedDriver: 'TRK-AMD-801',
    coordinates: { lat: 23.0855, lng: 72.5380 },
  },
  {
    id: 'REP-AMD-303',
    category: 'Food Market Organic Waste',
    priority: 'High',
    location: 'Vastrapur Lake Food Promenade Gate #2',
    ward: 'Sector 12 (Vastrapur)',
    description: 'Food stall wet organic waste bags accumulating near public walkway.',
    citizenName: 'Bhavin Patel',
    citizenPhone: '+91 98240 77612',
    status: 'Pending Verification',
    assignedDriver: 'TRK-AMD-802',
    coordinates: { lat: 23.0360, lng: 72.5285 },
  },
  {
    id: 'REP-AMD-304',
    category: 'Litter & Road Hazard',
    priority: 'Critical',
    location: 'Shivranjani Crossroads Flyover Underpass',
    ward: 'Satellite Ward',
    description: 'Broken glass crates and packaging scattered on left turn lane.',
    citizenName: 'Divya Desai',
    citizenPhone: '+91 99099 22188',
    status: 'Pending Verification',
    assignedDriver: 'TRK-AMD-802',
    coordinates: { lat: 23.0295, lng: 72.5320 },
  },
  {
    id: 'REP-AMD-305',
    category: 'Commercial Night Café Packaging',
    priority: 'High',
    location: 'Sindhu Bhavan Road Food Hub',
    ward: 'Bodakdev Ward',
    description: 'Weekend café carton boxes and cups pileup near highway service lane.',
    citizenName: 'Kunal Varma',
    citizenPhone: '+91 98980 11455',
    status: 'Pending Verification',
    assignedDriver: 'TRK-AMD-803',
    coordinates: { lat: 23.0465, lng: 72.5075 },
  },
  {
    id: 'REP-AMD-306',
    category: 'Heritage Market Food Waste',
    priority: 'Critical',
    location: 'Manek Chowk Heritage Square',
    ward: 'Khadia Ward',
    description: 'Food stalls leftover packaging and vegetable grease bins overflowing.',
    citizenName: 'Harshil Soni',
    citizenPhone: '+91 98255 66789',
    status: 'Pending Verification',
    assignedDriver: 'TRK-AMD-804',
    coordinates: { lat: 23.0252, lng: 72.5890 },
  },
  {
    id: 'REP-AMD-307',
    category: 'Biomedical & Outer Waste',
    priority: 'Critical',
    location: 'Civil Hospital Gate No. 4 Ring Road',
    ward: 'Asarwa Ward',
    description: 'Sanitation boxes and dry discarded cartons near hospital outer corridor.',
    citizenName: 'Dr. Anita Roy',
    citizenPhone: '+91 98244 88990',
    status: 'Pending Verification',
    assignedDriver: 'TRK-AMD-805',
    coordinates: { lat: 23.0535, lng: 72.6040 },
  },
  {
    id: 'REP-AMD-308',
    category: 'Tourist Litter & Plastic Accumulation',
    priority: 'High',
    location: 'Kankaria Lakefront Gate 3 Promenade',
    ward: 'Maninagar Ward',
    description: 'Water bottles and plastic food trays outside public bins.',
    citizenName: 'Jatin Trivedi',
    citizenPhone: '+91 98982 33211',
    status: 'Pending Verification',
    assignedDriver: 'TRK-AMD-806',
    coordinates: { lat: 23.0070, lng: 72.5995 },
  },
  {
    id: 'REP-AMD-309',
    category: 'Commercial Shopping Plaza Carton Buildup',
    priority: 'Medium',
    location: 'CG Road Commercial Plaza',
    ward: 'Navrangpura Ward',
    description: 'Retail stores corrugated carton boxes stacked on pavement.',
    citizenName: 'Ritu Agarwal',
    citizenPhone: '+91 98250 12390',
    status: 'Pending Verification',
    assignedDriver: 'TRK-AMD-807',
    coordinates: { lat: 23.0345, lng: 72.5615 },
  },
  {
    id: 'REP-AMD-310',
    category: 'Green Garden Clippings Overflow',
    priority: 'Medium',
    location: 'TRP Mall Circle, South Bopal',
    ward: 'Bopal Ward',
    description: 'Pruned tree branches and garden refuse obstructing pedestrian sidewalk.',
    citizenName: 'Gaurav Mehta',
    citizenPhone: '+91 98795 66712',
    status: 'Pending Verification',
    assignedDriver: 'TRK-AMD-808',
    coordinates: { lat: 23.0335, lng: 72.4690 },
  },
  {
    id: 'REP-AMD-311',
    category: 'Industrial Scrap & Plastic Packaging',
    priority: 'Critical',
    location: 'Odhav GIDC Phase 2 Ring Road',
    ward: 'Odhav Ward',
    description: 'Industrial drum plastic wrappings and pallet scrap dumped near drainage line.',
    citizenName: 'Chetan Gajjar',
    citizenPhone: '+91 98242 55678',
    status: 'Pending Verification',
    assignedDriver: 'TRK-AMD-809',
    coordinates: { lat: 23.0245, lng: 72.6685 },
  },
  {
    id: 'REP-AMD-312',
    category: 'Promenade Walkway Public Bin Overflow',
    priority: 'High',
    location: 'Sabarmati Riverfront West Promenade',
    ward: 'Riverfront West Ward',
    description: 'Pedestrian park bins overflowing with tourist beverage containers and food wrappers.',
    citizenName: 'Sneha Dave',
    citizenPhone: '+91 98988 44321',
    status: 'Pending Verification',
    assignedDriver: 'TRK-AMD-810',
    coordinates: { lat: 23.0290, lng: 72.5710 },
  },
];

/**
 * Resolves complete driver profile with equally distributed assigned route, smart bins, AI hotspots, and citizen reports.
 */
export const getDriverAssignmentProfile = ({
  currentUser,
  allDustbins = DEFAULT_DUSTBINS,
  allHotspots = DEFAULT_ML_HOTSPOTS,
  allReports = [],
  allVehicles = DEFAULT_AHMEDABAD_VEHICLES,
  shiftStatus = null,
}) => {
  // 1. Identify which driver is logged in
  const email = (currentUser?.email || '').toLowerCase().trim();
  const phone = (currentUser?.phone || '').replace(/[^0-9]/g, '');
  const badgeId = (currentUser?.badgeId || currentUser?.driverBadge || '').toUpperCase().trim();
  const name = (currentUser?.name || '').toLowerCase().trim();

  let matchedCred = AUTHORIZED_DRIVERS_DATABASE.find(
    (d) =>
      (badgeId && d.badgeId.toUpperCase() === badgeId) ||
      (email && d.email.toLowerCase() === email) ||
      (phone && d.phone.replace(/[^0-9]/g, '') === phone) ||
      (name && d.name.toLowerCase() === name)
  );

  // Fallback to DRV-801 if not found
  if (!matchedCred) {
    matchedCred = AUTHORIZED_DRIVERS_DATABASE[0];
  }

  const territoryConfig = DRIVER_TERRITORY_MAPPINGS[matchedCred.badgeId] || DRIVER_TERRITORY_MAPPINGS['DRV-801'];

  // 2. Match Vehicle Telemetry
  const matchedVehicle =
    (allVehicles &&
      allVehicles.find(
        (v) =>
          v.id === matchedCred.assignedVehicleId ||
          (v.driverBadge && v.driverBadge.toUpperCase() === matchedCred.badgeId.toUpperCase()) ||
          (v.plateNumber && v.plateNumber === matchedCred.vehiclePlate)
      )) ||
    DEFAULT_AHMEDABAD_VEHICLES.find((v) => v.id === matchedCred.assignedVehicleId) ||
    DEFAULT_AHMEDABAD_VEHICLES[0];

  // Check driver's active shift vs offline status
  let activeShiftStatus = shiftStatus;
  if (!activeShiftStatus) {
    try {
      const saved = localStorage.getItem(`swaachx_driver_shift_state_${matchedCred.badgeId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.shiftStatus) activeShiftStatus = parsed.shiftStatus;
      }
    } catch (e) {}
  }

  const isDriverOffline = activeShiftStatus === 'Shift Completed' || activeShiftStatus === 'Offline';

  // 3. Resolve Assigned Smart Dustbins
  let assignedBins = (allDustbins || []).filter((bin) => {
    if (territoryConfig.assignedBinIds.includes(bin.id)) return true;
    const binWard = (bin.ward || '').toLowerCase();
    const binName = (bin.name || '').toLowerCase();
    return territoryConfig.sectorKeywords.some(
      (kw) => binWard.includes(kw) || binName.includes(kw)
    );
  });

  // Ensure at least 2-4 bins are assigned
  if (assignedBins.length === 0) {
    assignedBins = (allDustbins || []).slice(0, 3);
  }

  // Format bins into ordered collection sequence stops
  const stops = assignedBins.map((bin, index) => {
    const dist = calculateDistanceKm(
      matchedVehicle.coordinates?.lat,
      matchedVehicle.coordinates?.lng,
      bin.coordinates?.lat,
      bin.coordinates?.lng
    );
    const etaMins = Math.max(5, Math.round(dist * 3.5) + (index * 8));

    return {
      sequenceOrder: index + 1,
      stopName: bin.name,
      binId: bin.id,
      ward: bin.ward,
      category: bin.category,
      capacityPercent: bin.fillLevel ?? 50,
      capacityLiters: bin.capacityLiters ?? 360,
      batteryLevel: bin.batteryLevel ?? 90,
      odourLevel: bin.odourLevel ?? 'Normal',
      status: bin.fillLevel >= 80 ? 'Critical' : 'Pending',
      distanceKm: dist,
      estimatedArrival: `${etaMins} mins`,
      coordinates: bin.coordinates,
      isServiced: false,
    };
  });

  // 4. Resolve Assigned AI Hotspots
  let assignedHotspots = (allHotspots || []).filter((hs) => {
    if (territoryConfig.assignedHotspotIds.includes(hs.zoneId)) return true;
    const hsWard = (hs.ward || '').toLowerCase();
    const hsName = (hs.zoneName || '').toLowerCase();
    return territoryConfig.sectorKeywords.some(
      (kw) => hsWard.includes(kw) || hsName.includes(kw)
    );
  });

  if (assignedHotspots.length === 0 && allHotspots && allHotspots.length > 0) {
    const driverIdx = parseInt(matchedCred.badgeId.replace(/[^0-9]/g, '') || '1', 10) % allHotspots.length;
    assignedHotspots = [allHotspots[driverIdx]];
  }

  // 5. Resolve Assigned Citizen Reports & Pending Approvals
  // If driver is OFFLINE or has COMPLETED SHIFT: No reports or approval requests are assigned!
  let pendingApprovals = [];
  let assignedReports = [];

  if (!isDriverOffline) {
    let pastCompletedIds = new Set();
    try {
      const saved = localStorage.getItem('swaachx_completed_shift_reports');
      if (saved) {
        pastCompletedIds = new Set(JSON.parse(saved));
      }
    } catch (e) {}

    const sourceReports = (allReports && allReports.length > 0) ? allReports : DEFAULT_AHMEDABAD_SECTOR_REPORTS;

    // 1. Live Pending Approval Requests specifically offered to this Driver
    let declinedSet = new Set();
    try {
      const savedDeclined = localStorage.getItem(`swaachx_declined_dispatch_ids_${matchedCred.badgeId}`);
      if (savedDeclined) declinedSet = new Set(JSON.parse(savedDeclined));
    } catch (e) {}

    pendingApprovals = sourceReports
      .filter((rep) => {
        if (rep.status !== 'Pending Driver Approval') return false;
        if (declinedSet.has(rep.id)) return false;
        if ((rep.declinedDrivers || []).includes(matchedCred.badgeId)) return false;

        const propBadge = (rep.proposedBadge || '').toUpperCase();
        const propDriver = (rep.proposedDriver || '').toLowerCase();
        const myBadge = (matchedCred.badgeId || '').toUpperCase();
        const myName = (matchedCred.name || '').toLowerCase();
        const myVeh = (matchedVehicle.id || '').toLowerCase();

        return (
          propBadge === myBadge ||
          propDriver.includes(myBadge.toLowerCase()) ||
          propDriver.includes(myName) ||
          propDriver.includes(myVeh)
        );
      })
      .map((rep) => {
        if (rep.distanceKm && rep.etaMinutes) return rep;
        const repLat = rep.coordinates?.lat || rep.latitude;
        const repLng = rep.coordinates?.lng || rep.longitude;
        const dKm = calculateDistanceKm(matchedVehicle.coordinates?.lat, matchedVehicle.coordinates?.lng, repLat, repLng);
        const eta = Math.max(3, Math.round(dKm * 3.5));
        return {
          ...rep,
          distanceKm: dKm,
          etaMinutes: eta,
        };
      });

    // 2. Confirmed & Assigned reports for this driver
    assignedReports = sourceReports.filter((rep) => {
      if (pastCompletedIds.has(rep.id)) return false;
      if (rep.status === 'Pending Driver Approval') return false;

      const driverRef = (rep.assignedDriver || rep.assigned_driver || '').toLowerCase();
      if (
        driverRef &&
        (driverRef.includes(matchedCred.name.toLowerCase()) ||
          driverRef.includes(matchedCred.badgeId.toLowerCase()) ||
          driverRef.includes(matchedVehicle.id.toLowerCase()))
      ) {
        return true;
      }
      const loc = (rep.location || '').toLowerCase();
      const ward = (rep.ward || '').toLowerCase();
      const cat = (rep.category || '').toLowerCase();
      return territoryConfig.sectorKeywords.some((kw) => loc.includes(kw) || ward.includes(kw) || cat.includes(kw));
    });

    if (assignedReports.length === 0) {
      assignedReports = DEFAULT_AHMEDABAD_SECTOR_REPORTS.filter((rep) => {
        if (pastCompletedIds.has(rep.id)) return false;
        const loc = (rep.location || '').toLowerCase();
        const ward = (rep.ward || '').toLowerCase();
        const cat = (rep.category || '').toLowerCase();
        const driverRef = (rep.assignedDriver || '').toLowerCase();
        return (
          driverRef.includes(matchedCred.badgeId.toLowerCase()) ||
          driverRef.includes(matchedVehicle.id.toLowerCase()) ||
          territoryConfig.sectorKeywords.some((kw) => loc.includes(kw) || ward.includes(kw) || cat.includes(kw))
        );
      });
    }
  }

  // 6. Compute Route Metrics
  const totalDistance = stops.reduce((acc, stop) => acc + (stop.distanceKm || 1.2), 0);
  const totalEstDuration = Math.round(totalDistance * 3.5 + stops.length * 10);
  const maxTons = territoryConfig.maxCapacityTons || 12.0;
  const loadPercent = matchedVehicle.loadCapacityPercent ?? 45;
  const loadedTons = ((loadPercent * maxTons) / 100).toFixed(1);

  return {
    driverInfo: matchedCred,
    territoryConfig,
    vehicle: matchedVehicle,
    isOffline: isDriverOffline,
    shiftStatus: activeShiftStatus || 'Active Shift',
    assignedRoute: {
      routeName: matchedCred.assignedRoute,
      ward: matchedCred.assignedWard,
      depot: territoryConfig.depotName,
      totalStops: stops.length,
      distanceKm: totalDistance.toFixed(1),
      estimatedDurationMins: totalEstDuration,
    },
    stops,
    assignedBins,
    assignedHotspots,
    assignedReports,
    pendingApprovals,
    metrics: {
      totalAssignedStops: stops.length,
      completedStops: 0,
      pendingStops: stops.length,
      estimatedDuration: `${totalEstDuration} mins`,
      remainingDistance: `${totalDistance.toFixed(1)} km`,
      loadCapacityPercent: loadPercent,
      loadedTons: `${loadedTons} / ${maxTons.toFixed(1)} Tons`,
      batteryOrFuel: matchedVehicle.batteryOrFuel ?? 85,
      speed: matchedVehicle.speed ?? 0,
      pendingApprovalsCount: pendingApprovals.length,
    },
  };
};

/**
 * AI-powered Proximity Driver Matching:
 * Evaluates report GPS coordinates against active fleet locations
 * and assigns to the closest operating municipal truck within minutes.
 * Excludes drivers who are offline or have completed their shift.
 */
export const findNearestDriverForReport = ({ lat, lng, ward = '', location = '' }, vehiclesList = [], excludedBadges = []) => {
  const allCandidates = (vehiclesList && vehiclesList.length > 0) ? vehiclesList : DEFAULT_AHMEDABAD_VEHICLES;
  const excludedSet = new Set((excludedBadges || []).map((b) => String(b).toUpperCase()));

  // Filter ONLY drivers who are NOT offline / NOT completed shift
  const candidates = allCandidates.filter((v) => {
    const badge = (v.driverBadge || v.driver_badge || v.badgeId || `DRV-${(v.id || '').replace(/[^0-9]/g, '')}`).toUpperCase();
    if (excludedSet.has(badge)) return false;

    // Check driver's offline / shift status in localStorage
    try {
      const saved = localStorage.getItem(`swaachx_driver_shift_state_${badge}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.shiftStatus === 'Shift Completed' || parsed.shiftStatus === 'Offline')) {
          return false; // Driver is offline, do NOT dispatch reports to them!
        }
      }
    } catch (e) {}

    return true;
  });

  const pool = candidates.length > 0 ? candidates : allCandidates;

  if (lat && lng) {
    const withDistance = pool.map((v) => {
      const vLat = v.coordinates?.lat || v.latitude || 23.0784;
      const vLng = v.coordinates?.lng || v.longitude || 72.5441;
      const dLat = (vLat - lat) * (Math.PI / 180);
      const dLng = (vLng - lng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat * (Math.PI / 180)) * Math.cos(vLat * (Math.PI / 180)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distKm = 6371 * c;
      return { vehicle: v, distKm };
    }).sort((a, b) => a.distKm - b.distKm);

    if (withDistance.length > 0) {
      const best = withDistance[0];
      const v = best.vehicle;
      const driverName = v.driverName || v.driver_name || 'Suresh Kumar';
      const badgeId = v.driverBadge || v.driver_badge || `DRV-${(v.id || '801').replace(/[^0-9]/g, '') || '801'}`;
      const distFormatted = best.distKm.toFixed(1);
      const etaMins = Math.max(3, Math.round(best.distKm * 3.5 + 2));
      return {
        assignedDriver: `${driverName} (${badgeId})`,
        driverName,
        badgeId,
        vehicleId: v.id,
        vehiclePlate: v.plateNumber || v.plate_number || 'GJ-01-CZ-4821',
        distanceKm: distFormatted,
        etaMinutes: etaMins,
      };
    }
  }

  // Fallback: match by sector/ward keywords
  const text = `${ward} ${location}`.toLowerCase();
  const matched = pool.find((v) => {
    const route = (v.assignedRoute || v.assigned_route || '').toLowerCase();
    const vWard = (v.currentWard || v.current_ward || '').toLowerCase();
    return text.includes('chandlodiya') || text.includes('ranip') || text.includes('gota')
      ? v.id === 'TRK-AMD-801' || v.id === 'TRK-801'
      : text.includes('satellite') || text.includes('vastrapur') || text.includes('iim')
      ? v.id === 'TRK-AMD-802' || v.id === 'TRK-802'
      : text.includes('sg highway') || text.includes('thaltej') || text.includes('bodakdev')
      ? v.id === 'TRK-AMD-803' || v.id === 'TRK-803'
      : text.includes('manek') || text.includes('khadia') || text.includes('walled')
      ? v.id === 'TRK-AMD-804' || v.id === 'TRK-804'
      : route.includes(text) || vWard.includes(text);
  }) || pool[0];

  const driverName = matched?.driverName || matched?.driver_name || 'Suresh Kumar';
  const badgeId = matched?.driverBadge || matched?.driver_badge || 'DRV-801';
  return {
    assignedDriver: `${driverName} (${badgeId})`,
    driverName,
    badgeId,
    vehicleId: matched?.id || 'TRK-AMD-801',
    vehiclePlate: matched?.plateNumber || matched?.plate_number || 'GJ-01-CZ-4821',
    distanceKm: '1.4',
    etaMinutes: 5,
  };
};

