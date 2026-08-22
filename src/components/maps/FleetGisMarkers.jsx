import React from 'react';
import { Marker, Popup, Tooltip, CircleMarker, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Truck, MapPin, Navigation, Phone, Shield, CheckCircle2, Send, AlertTriangle } from 'lucide-react';

/**
 * Creates custom styled HTML DivIcons for Leaflet
 */
export const createTruckIcon = (color = '#0891b2', label = 'TRK', isMoving = true) => {
  return L.divIcon({
    className: 'custom-leaflet-marker-truck',
    html: `
      <div style="
        position: relative;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${isMoving ? `
          <div style="
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            background: ${color};
            opacity: 0.25;
            animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
        ` : ''}
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #ffffff;
          border: 2.5px solid ${color};
          box-shadow: 0 4px 12px rgba(0,0,0,0.18), 0 0 10px ${color}66;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          z-index: 2;
        ">
          🚛
        </div>
        <div style="
          position: absolute;
          bottom: -5px;
          background: ${color};
          color: #ffffff;
          font-size: 9px;
          font-weight: 800;
          padding: 1px 5px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          z-index: 3;
        ">
          ${label}
        </div>
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -22],
  });
};

export const createWaypointIcon = (seqNumber = 1, fillLevel = 50, isServiced = false) => {
  const isCritical = fillLevel >= 80;
  const isModerate = fillLevel >= 50 && fillLevel < 80;
  const color = isServiced ? '#059669' : isCritical ? '#e11d48' : isModerate ? '#d97706' : '#2563eb';
  const bgColor = isServiced ? '#059669' : '#ffffff';
  const textColor = isServiced ? '#ffffff' : '#0f172a';

  return L.divIcon({
    className: 'custom-leaflet-marker-waypoint',
    html: `
      <div style="
        position: relative;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${!isServiced && isCritical ? `
          <div style="
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            background: #e11d48;
            opacity: 0.35;
            animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
        ` : ''}
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${bgColor};
          border: 2.5px solid ${color};
          box-shadow: 0 4px 10px rgba(0,0,0,0.2), 0 0 8px ${color}66;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 900;
          font-family: 'JetBrains Mono', monospace;
          color: ${textColor};
          z-index: 2;
        ">
          ${isServiced ? '✓' : `#${seqNumber}`}
        </div>
        <div style="
          position: absolute;
          bottom: -5px;
          background: ${color};
          color: #ffffff;
          font-size: 8.5px;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.25);
          z-index: 3;
        ">
          ${isServiced ? 'DONE' : `${fillLevel}%`}
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
};

export const createCitizenIssueIcon = (category = 'Bin', priority = 'High') => {
  const isCritical = priority === 'Critical';
  const color = isCritical ? '#e11d48' : priority === 'High' ? '#d97706' : '#2563eb';
  const emoji = category.includes('Bin') ? '🗑️' : category.includes('Dump') ? '⚠️' : category.includes('Hazard') ? '☣️' : '📦';

  return L.divIcon({
    className: 'custom-leaflet-marker-issue',
    html: `
      <div style="
        position: relative;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid ${color};
          box-shadow: 0 4px 10px rgba(0,0,0,0.15), 0 0 8px ${color}55;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
        ">
          ${emoji}
        </div>
        <div style="
          position: absolute;
          top: -2px;
          right: -2px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: ${color};
          border: 1.5px solid #ffffff;
        "></div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
};

export const createHotspotIcon = (riskLevel = 'High') => {
  const isHigh = riskLevel === 'High' || riskLevel === 'Critical';
  const color = isHigh ? '#e11d48' : '#d97706';
  return L.divIcon({
    className: 'custom-leaflet-marker-hotspot',
    html: `
      <div style="
        position: relative;
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: ${color};
          opacity: 0.25;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid ${color};
          box-shadow: 0 4px 10px rgba(0,0,0,0.18), 0 0 8px ${color}55;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        ">
          ${isHigh ? '🔥' : '⚠️'}
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
};

export const createDepotIcon = (label = 'Depot') => {
  return L.divIcon({
    className: 'custom-leaflet-marker-depot',
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #0f172a;
          border: 2px solid #38bdf8;
          box-shadow: 0 4px 10px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          color: #fff;
        ">
          🏢
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

export const createDustbinIcon = (fillLevel = 40, category = 'General', isSelected = false) => {
  const isCritical = fillLevel >= 80;
  const isModerate = fillLevel >= 50 && fillLevel < 80;
  const color = isCritical ? '#e11d48' : isModerate ? '#d97706' : '#059669';
  const emoji = category.includes('Organic') || category.includes('Food') || category.includes('Wet')
    ? '🍏'
    : category.includes('E-Waste') || category.includes('Hazardous')
    ? '🔋'
    : category.includes('Recyclable') || category.includes('Dry')
    ? '♻️'
    : '🗑️';

  return L.divIcon({
    className: 'custom-leaflet-marker-dustbin',
    html: `
      <div style="
        position: relative;
        width: ${isSelected ? '46px' : '40px'};
        height: ${isSelected ? '46px' : '40px'};
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
      ">
        ${isCritical ? `
          <div style="
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            background: #e11d48;
            opacity: 0.35;
            animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
        ` : ''}
        ${isSelected ? `
          <div style="
            position: absolute;
            inset: -6px;
            border-radius: 50%;
            border: 2px dashed #059669;
            animation: spin 6s linear infinite;
          "></div>
        ` : ''}
        <div style="
          width: ${isSelected ? '38px' : '32px'};
          height: ${isSelected ? '38px' : '32px'};
          border-radius: 50%;
          background: #ffffff;
          border: 2.5px solid ${color};
          box-shadow: 0 4px 12px rgba(0,0,0,0.18), 0 0 10px ${color}55;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isSelected ? '18px' : '15px'};
          z-index: 2;
        ">
          ${emoji}
        </div>
        <div style="
          position: absolute;
          bottom: -6px;
          background: ${color};
          color: #ffffff;
          font-size: 9px;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.25);
          z-index: 3;
        ">
          ${fillLevel}%
        </div>
      </div>
    `,
    iconSize: [isSelected ? 46 : 40, isSelected ? 46 : 40],
    iconAnchor: [isSelected ? 23 : 20, isSelected ? 23 : 20],
    popupAnchor: [0, isSelected ? -24 : -20],
  });
};

export const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker-user-location',
    html: `
      <div style="
        position: relative;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: #2563eb;
          opacity: 0.3;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #2563eb;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #ffffff;
        ">
          📍
        </div>
        <div style="
          position: absolute;
          bottom: -6px;
          background: #1e293b;
          color: #ffffff;
          font-size: 8px;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 3px;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          YOU
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
  });
};

/**
 * Composite Fleet GIS Layer displaying Trucks, Citizen Issues, AI Hotspots & Smart Dustbins
 */
export const FleetGisMarkers = ({
  vehicles = [],
  reports = [],
  hotspots = [],
  dustbins = [],
  stops = [],
  servicedStops = new Set(),
  userLocation = null,
  activeDustbinRoute = null,
  selectedDustbinId = null,
  routeCoordinates = null,
  showRoutes = true,
  showHotspots = false,
  showDustbins = true,
  onDispatch,
  onResolve,
  onSelectReport,
  onSelectDustbin,
  onRouteToDustbin,
  onReportDustbinIssue,
  onCollectStop,
}) => {
  // Compute polyline coordinates from truck and sequential stops if provided
  const activeRouteCoordinates = React.useMemo(() => {
    if (routeCoordinates && routeCoordinates.length >= 2) return routeCoordinates;
    if (stops && stops.length > 0) {
      const coords = [];
      const v = vehicles[0];
      const vLat = v?.coordinates?.lat ?? v?.latitude;
      const vLng = v?.coordinates?.lng ?? v?.longitude;
      if (vLat && vLng) coords.push([vLat, vLng]);
      stops.forEach((s) => {
        const sLat = s.coordinates?.lat ?? s.latitude;
        const sLng = s.coordinates?.lng ?? s.longitude;
        if (sLat && sLng) coords.push([sLat, sLng]);
      });
      if (coords.length >= 2) return coords;
    }
    // Default Ahmedabad sanitation corridors
    return [
      [23.0350, 72.5750], // AMC Central Depot (Dudheshwar)
      [23.0248, 72.5898], // Stop 1: Manek Chowk Night Food Corridor
      [23.0270, 72.5596], // Stop 2: Law Garden Khau Galli
      [23.0338, 72.5607], // Stop 3: CG Road Corridor
      [23.0350, 72.5293], // Stop 4: Vastrapur Lake Hub
      [23.0451, 72.5085], // Stop 5: Sindhu Bhavan Road (SBR)
    ];
  }, [routeCoordinates, stops, vehicles]);

  return (
    <>
      {/* Route Trajectory Polyline (Active when routes enabled) */}
      {showRoutes && activeRouteCoordinates && activeRouteCoordinates.length >= 2 && (
        <Polyline
          positions={activeRouteCoordinates}
          color="#0891b2"
          weight={3.5}
          opacity={0.8}
          dashArray="6, 8"
        />
      )}

      {/* Central Depot Marker */}
      <Marker position={[23.0350, 72.5750]} icon={createDepotIcon('AMC Depot')}>
        <Popup>
          <div style={{ padding: '4px', minWidth: '160px', color: '#0f172a' }}>
            <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
              🏢 AMC Central Sanitation Depot
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Ahmedabad Municipal Corp. Headquarters & MRF
            </div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#059669', marginTop: '6px' }}>
              Status: Operational (6 Compactor Bays Active)
            </div>
          </div>
        </Popup>
        <Tooltip direction="top" offset={[0, -18]}>
          <span>🏢 AMC Central Sanitation Depot (Ahmedabad)</span>
        </Tooltip>
      </Marker>

      {/* AI Hotspot Risk Area Circles & Center Pins */}
      {showHotspots && (
        <>
          {hotspots.map((h, idx) => {
            const lat = h.coordinates?.lat || (idx === 0 ? 18.5230 : idx === 1 ? 18.4980 : idx === 2 ? 18.5325 : 18.5362);
            const lng = h.coordinates?.lng || (idx === 0 ? 73.8510 : idx === 1 ? 73.8720 : idx === 2 ? 73.8540 : 73.8940);
            const isHigh = h.riskLevel === 'High' || h.riskLevel === 'Critical';
            const color = isHigh ? '#e11d48' : '#d97706';

            return (
              <React.Fragment key={h.zoneId || idx}>
                {/* 1. Heatmap Radius Perimeter */}
                <Circle
                  center={[lat, lng]}
                  radius={h.radiusMeters || (isHigh ? 450 : 350)}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.18,
                    weight: 1.5,
                    dashArray: '4, 4',
                  }}
                />

                {/* 2. Interactive Hotspot Center Marker */}
                <Marker
                  position={[lat, lng]}
                  icon={createHotspotIcon(h.riskLevel)}
                >
                  <Popup>
                    <div style={{ padding: '6px', minWidth: '220px', color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                          {isHigh ? '🔥' : '⚠️'} {h.zoneId || `ZONE-0${idx + 1}`}
                        </div>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '99px',
                            background: isHigh ? '#ffe4e6' : '#fef3c7',
                            color,
                          }}
                        >
                          {h.riskLevel} Risk ({h.confidenceScore || 85}%)
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                        {h.zoneName}
                      </div>

                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                        <strong>Predicted Volume:</strong>{' '}
                        <span style={{ color: '#7c3aed', fontWeight: 700 }}>{h.predictedVolume || '3.2 Tons'}</span>
                      </div>

                      {h.primaryAnomaly && (
                        <div style={{ fontSize: '11px', color: '#475569', background: '#f8fafc', padding: '6px', borderRadius: '6px', marginBottom: '6px', lineHeight: 1.3 }}>
                          <strong>Anomaly:</strong> {h.primaryAnomaly}
                        </div>
                      )}

                      <div style={{ fontSize: '11px', color: '#059669', background: '#ecfdf5', padding: '6px', borderRadius: '6px', fontWeight: 600, lineHeight: 1.3 }}>
                        💡 <strong>AI Action:</strong> {h.suggestedAction}
                      </div>
                    </div>
                  </Popup>

                  <Tooltip direction="top" offset={[0, -18]}>
                    <span style={{ fontWeight: 700 }}>
                      {isHigh ? '🔥' : '⚠️'} {h.zoneName} ({h.riskLevel} Risk - {h.predictedVolume})
                    </span>
                  </Tooltip>
                </Marker>
              </React.Fragment>
            );
          })}
        </>
      )}

      {/* 1. Fleet Truck Location Markers */}
      {vehicles.map((v, vIdx) => {
        const lat = v.coordinates?.lat ?? v.latitude ?? (Array.isArray(v.coords) ? v.coords[0] : null);
        const lng = v.coordinates?.lng ?? v.longitude ?? (Array.isArray(v.coords) ? v.coords[1] : null);
        if (!lat || !lng) return null;

        const driverName = v.driverName || v.driver_name || 'Municipal Driver';
        const plateNumber = v.plateNumber || v.plate_number || 'GJ-01-CZ-4821';
        const lastLocation = v.lastLocation || v.last_location || 'Ahmedabad Sanitation Ward';
        const loadPercent = v.loadCapacityPercent ?? v.load_capacity_percent ?? 35;
        const fuelLevel = v.batteryOrFuel ?? v.battery_or_fuel ?? 85;
        const assignedRoute = v.assignedRoute || v.assigned_route || 'Sector Route';
        const color = v.status === 'Active' ? '#0891b2' : '#64748b';
        const isMoving = v.status === 'Active' && (v.speed || 0) > 0;

        return (
          <Marker
            key={v.id || vIdx}
            position={[lat, lng]}
            icon={createTruckIcon(color, v.id || `TRK-${vIdx + 1}`, isMoving)}
          >
            <Popup>
              <div style={{ padding: '6px', minWidth: '220px', color: '#0f172a' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                    🚚 {v.id}
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '99px',
                      background: v.status === 'Active' ? '#ecfdf5' : '#f1f5f9',
                      color: v.status === 'Active' ? '#059669' : '#64748b',
                    }}
                  >
                    {v.status || 'Active'}
                  </span>
                </div>

                <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                  <strong>Driver:</strong> {driverName}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                  <strong>Phone:</strong> {v.driverPhone || v.driver_phone || '+91 98230 11223'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                  <strong>Type:</strong> {v.type || 'Compactor (14T)'} ({plateNumber})
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                  <strong>Location:</strong> {lastLocation}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', margin: '8px 0', background: '#f8fafc', padding: '6px', borderRadius: '6px' }}>
                  <div>
                    <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Speed</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0891b2' }}>{v.speed || 0} km/h</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Payload</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#7c3aed' }}>{loadPercent}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Fuel</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>{fuelLevel}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Heading</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{v.heading || 'N/A'}</div>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#475569', fontStyle: 'italic' }}>
                  {assignedRoute}
                </div>
              </div>
            </Popup>

            <Tooltip direction="top" offset={[0, -22]}>
              <span style={{ fontWeight: 700 }}>
                🚚 {v.id}: {driverName} ({v.speed || 0} km/h)
              </span>
            </Tooltip>
          </Marker>
        );
      })}

      {/* 2. Citizen Reported Issue Markers */}
      {reports.map((r, rIdx) => {
        const lat = r.coordinates?.lat || (r.latitude ? parseFloat(r.latitude) : (23.0248 + ((rIdx * 7) % 15 - 7) * 0.005));
        const lng = r.coordinates?.lng || (r.longitude ? parseFloat(r.longitude) : (72.5898 + ((rIdx * 11) % 15 - 7) * 0.005));
        if (!lat || !lng) return null;

        return (
          <Marker
            key={r.id || rIdx}
            position={[lat, lng]}
            icon={createCitizenIssueIcon(r.category, r.priority)}
          >
            <Popup>
              <div style={{ padding: '6px', minWidth: '220px', color: '#0f172a' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                    #{r.id}: {r.category}
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '99px',
                      background: r.priority === 'Critical' ? '#ffe4e6' : '#fef3c7',
                      color: r.priority === 'Critical' ? '#e11d48' : '#d97706',
                    }}
                  >
                    {r.priority || 'High'}
                  </span>
                </div>

                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  <strong>Reported By:</strong> {r.citizenName || 'Citizen Resident'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>
                  <strong>Phone:</strong> {r.citizenPhone || '+91 98765 00000'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                  <strong>Address:</strong> {r.location} ({r.ward || 'Ahmedabad'})
                </div>

                <div style={{ fontSize: '11px', background: '#f8fafc', padding: '6px', borderRadius: '6px', marginBottom: '8px', color: '#334155' }}>
                  "{r.description}"
                </div>

                <div style={{ fontSize: '11px', marginBottom: '8px' }}>
                  <strong>Status:</strong>{' '}
                  <span style={{ color: r.status === 'Resolved' ? '#059669' : '#d97706', fontWeight: 600 }}>
                    {r.status}
                  </span>
                  {r.assignedDriver && (
                    <div style={{ color: '#0891b2', fontWeight: 600, marginTop: '2px' }}>
                      🚛 {r.assignedDriver}
                    </div>
                  )}
                </div>

                {onSelectReport && (
                  <button
                    type="button"
                    onClick={() => onSelectReport(r)}
                    style={{
                      width: '100%',
                      marginBottom: onDispatch || onResolve ? '6px' : '0',
                      padding: '5px 8px',
                      background: '#f0fdf4',
                      color: '#15803d',
                      border: '1px solid #bbf7d0',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    📄 View Report Popup Details
                  </button>
                )}

                {onDispatch && r.status === 'Pending Verification' && (
                  <button
                    onClick={() => onDispatch(r.id, 'TRK-804')}
                    style={{
                      width: '100%',
                      padding: '6px',
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <Send size={12} /> Dispatch Driver TRK-804
                  </button>
                )}

                {onResolve && r.status === 'Dispatched' && (
                  <button
                    onClick={() => onResolve(r.id)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      background: '#047857',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ✓ Mark Resolved
                  </button>
                )}
              </div>
            </Popup>

            <Tooltip direction="top" offset={[0, -20]}>
              <span style={{ fontWeight: 700 }}>
                ⚠️ #{r.id}: {r.category} ({r.citizenName})
              </span>
            </Tooltip>
          </Marker>
        );
      })}

      {/* 3. User Current Geolocation Pin */}
      {userLocation && userLocation.lat && userLocation.lng && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={createUserLocationIcon()}
        >
          <Popup>
            <div style={{ padding: '6px', minWidth: '180px', color: '#0f172a' }}>
              <div style={{ fontWeight: 800, fontSize: '13px', color: '#2563eb', marginBottom: '4px' }}>
                📍 Your Location
              </div>
              <div style={{ fontSize: '11px', color: '#475569' }}>
                {userLocation.address || 'Ahmedabad, Gujarat'}
              </div>
              <div style={{ fontSize: '10px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
                GPS Telemetry Active
              </div>
            </div>
          </Popup>
          <Tooltip direction="top" offset={[0, -20]}>
            <span style={{ fontWeight: 700 }}>📍 You are here ({userLocation.address || 'My GPS'})</span>
          </Tooltip>
        </Marker>
      )}

      {/* 4. Active Walking Navigation Polyline to Selected Bin */}
      {activeDustbinRoute && activeDustbinRoute.length >= 2 && (
        <Polyline
          positions={activeDustbinRoute}
          color="#059669"
          weight={4}
          opacity={0.85}
          dashArray="4, 8"
        />
      )}

      {/* 5. Smart Public Dustbins GIS Layer */}
      {showDustbins &&
        dustbins.map((bin) => {
          if (!bin.coordinates || !bin.coordinates.lat || !bin.coordinates.lng) return null;
          const isSelected = selectedDustbinId === bin.id;
          const isCritical = bin.fillLevel >= 80;
          const isModerate = bin.fillLevel >= 50 && bin.fillLevel < 80;
          const fillBadgeColor = isCritical ? '#e11d48' : isModerate ? '#d97706' : '#059669';
          const fillBadgeBg = isCritical ? '#ffe4e6' : isModerate ? '#fef3c7' : '#ecfdf5';

          return (
            <Marker
              key={bin.id}
              position={[bin.coordinates.lat, bin.coordinates.lng]}
              icon={createDustbinIcon(bin.fillLevel, bin.category, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onSelectDustbin) onSelectDustbin(bin);
                },
              }}
            >
              <Popup>
                <div style={{ padding: '6px', minWidth: '230px', color: '#0f172a' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                      🗑️ {bin.id}
                    </div>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '99px',
                        background: fillBadgeBg,
                        color: fillBadgeColor,
                      }}
                    >
                      {bin.fillLevel}% Full
                    </span>
                  </div>

                  {/* Bin Name & Ward */}
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                    {bin.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                    📍 {bin.ward}
                  </div>

                  {/* Fill Level Progress Bar */}
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                      <span>Bin Capacity ({bin.capacityLiters || 240}L)</span>
                      <span style={{ color: fillBadgeColor, fontWeight: 800 }}>{bin.fillLevel}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${bin.fillLevel}%`,
                          height: '100%',
                          background: fillBadgeColor,
                          borderRadius: '99px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Telemetry metadata */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '10px', color: '#64748b', background: '#f8fafc', padding: '6px', borderRadius: '6px', marginBottom: '8px' }}>
                    <div>🔋 Battery: <strong>{bin.batteryLevel || 95}%</strong></div>
                    <div>🕒 Emptied: <strong>{bin.lastEmptied || 'Recently'}</strong></div>
                    <div style={{ gridColumn: 'span 2' }}>📦 Category: <strong>{bin.category}</strong></div>
                  </div>

                  {/* Accepted waste tags */}
                  {bin.acceptedWaste && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginBottom: '8px' }}>
                      {bin.acceptedWaste.map((tag, i) => (
                        <span key={i} style={{ fontSize: '9px', fontWeight: 600, background: '#f1f5f9', color: '#334155', padding: '1px 5px', borderRadius: '4px' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    {onRouteToDustbin && (
                      <button
                        onClick={() => onRouteToDustbin(bin)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          background: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        🚶 Route Here
                      </button>
                    )}

                    {onReportDustbinIssue && (
                      <button
                        onClick={() => onReportDustbinIssue(bin)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          background: '#f1f5f9',
                          color: '#e11d48',
                          border: '1px solid #fecdd3',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        🚨 Report Full
                      </button>
                    )}
                  </div>
                </div>
              </Popup>

              <Tooltip direction="top" offset={[0, -20]}>
                <span style={{ fontWeight: 700 }}>
                  🗑️ {bin.name} ({bin.fillLevel}% Full - {bin.ward})
                </span>
              </Tooltip>
            </Marker>
          );
        })}

      {/* 6. Driver Assigned Route Stops / Waypoints GIS Layer */}
      {stops && stops.length > 0 &&
        stops.map((stop, sIdx) => {
          const lat = stop.coordinates?.lat ?? stop.latitude;
          const lng = stop.coordinates?.lng ?? stop.longitude;
          if (!lat || !lng) return null;

          const isServiced = servicedStops.has(stop.binId || stop.id);
          const seqNum = stop.sequenceOrder || sIdx + 1;
          const fill = stop.capacityPercent ?? stop.fillLevel ?? 50;
          const isCritical = fill >= 80;
          const isModerate = fill >= 50 && fill < 80;
          const fillBadgeColor = isServiced ? '#059669' : isCritical ? '#e11d48' : isModerate ? '#d97706' : '#2563eb';
          const fillBadgeBg = isServiced ? '#ecfdf5' : isCritical ? '#ffe4e6' : isModerate ? '#fef3c7' : '#eff6ff';

          return (
            <Marker
              key={stop.binId || stop.id || sIdx}
              position={[lat, lng]}
              icon={createWaypointIcon(seqNum, fill, isServiced)}
            >
              <Popup>
                <div style={{ padding: '6px', minWidth: '220px', color: '#0f172a' }}>
                  {/* Waypoint Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                      📍 Stop #{seqNum}: {stop.stopName || stop.name}
                    </div>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '99px',
                        background: fillBadgeBg,
                        color: fillBadgeColor,
                      }}
                    >
                      {isServiced ? '✓ Serviced' : `${fill}% Full`}
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                    <strong>Ward:</strong> {stop.ward} • <span style={{ fontFamily: 'monospace' }}>{stop.binId || stop.id}</span>
                  </div>

                  {/* Fill Level Bar */}
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                      <span>Bin Sensor Level</span>
                      <span style={{ color: fillBadgeColor, fontWeight: 800 }}>{fill}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${fill}%`,
                          height: '100%',
                          background: fillBadgeColor,
                          borderRadius: '99px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Distance & ETA */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '10px', color: '#64748b', background: '#f8fafc', padding: '6px', borderRadius: '6px', marginBottom: '8px' }}>
                    <div>📏 Distance: <strong>~{stop.distanceKm || 1.2} km</strong></div>
                    <div>🕒 ETA: <strong>{stop.estimatedArrival || '10 mins'}</strong></div>
                  </div>

                  {/* Action Button */}
                  {onCollectStop && (
                    <div style={{ marginTop: '6px' }}>
                      {isServiced ? (
                        <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#059669', padding: '4px', background: '#ecfdf5', borderRadius: '6px' }}>
                          ✅ Picked Up & Emptied
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onCollectStop(stop)}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                          }}
                        >
                          <CheckCircle2 size={12} /> Collect & Empty Bin
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </Popup>

              <Tooltip direction="top" offset={[0, -20]}>
                <span style={{ fontWeight: 700 }}>
                  Stop #{seqNum}: {stop.stopName || stop.name} ({isServiced ? 'Serviced' : `${fill}% Full`})
                </span>
              </Tooltip>
            </Marker>
          );
        })}
    </>
  );
};
