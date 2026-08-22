import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDashboard, resolveDriverDetails, calculateDistanceMeters, formatDistance } from '../../context/DashboardContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  X,
  Truck,
  MapPin,
  Navigation,
  Phone,
  Clock,
  Gauge,
  ExternalLink,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';

/**
 * Custom animated Truck DivIcon
 */
const createTracingTruckIcon = (label = 'TRK', speed = 32) => {
  return L.divIcon({
    className: 'tracing-truck-icon',
    html: `
      <div style="
        position: relative;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: #0ea5e9;
          opacity: 0.35;
          animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #0f172a;
          border: 3px solid #0ea5e9;
          box-shadow: 0 4px 14px rgba(14, 165, 233, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          z-index: 2;
        ">
          🚛
        </div>
        <div style="
          position: absolute;
          bottom: -6px;
          background: #0ea5e9;
          color: #ffffff;
          font-size: 9px;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 99px;
          font-family: monospace;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          z-index: 3;
        ">
          ${label}
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -26],
  });
};

/**
 * Custom incident destination DivIcon
 */
const createTracingTargetIcon = (label = 'Incident') => {
  return L.divIcon({
    className: 'tracing-target-icon',
    html: `
      <div style="
        position: relative;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: #ef4444;
          opacity: 0.3;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #ef4444;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: #ffffff;
          z-index: 2;
        ">
          📍
        </div>
        <div style="
          position: absolute;
          bottom: -6px;
          background: #1e293b;
          color: #ffffff;
          font-size: 8.5px;
          font-weight: 800;
          padding: 1px 5px;
          border-radius: 4px;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          z-index: 3;
        ">
          ${label}
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  });
};

// Map View auto-fitter helper
const MapBoundsFitter = ({ coords = [] }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length >= 2) {
      try {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      } catch (e) {}
    }
  }, [coords, map]);
  return null;
};

export const LiveRouteTracingModal = ({
  isOpen,
  onClose,
  targetReport = null,
  targetStop = null,
  isDriverMode = false,
}) => {
  const { vehicles = [], resolveReport } = useDashboard();

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Destination coordinates & title
  const targetLat = targetReport?.coordinates?.lat || targetReport?.latitude || targetStop?.coordinates?.lat || 23.0784;
  const targetLng = targetReport?.coordinates?.lng || targetReport?.longitude || targetStop?.coordinates?.lng || 72.5441;
  const targetTitle = targetReport ? `#${targetReport.id}: ${targetReport.category || 'Waste Clearance'}` : targetStop?.name || 'Assigned Stop';
  const targetLocation = targetReport?.location || targetStop?.address || 'Ahmedabad Sector';

  // Matched Driver and Vehicle
  const driverInfo = useMemo(() => {
    if (targetReport?.assignedDriver) {
      return resolveDriverDetails(targetReport.assignedDriver, vehicles);
    }
    return resolveDriverDetails('Suresh Kumar (DRV-801)', vehicles);
  }, [targetReport, vehicles]);

  // Initial Truck origin coords
  const initialTruckLat = driverInfo?.assignedVehicleId
    ? vehicles.find((v) => v.id === driverInfo.assignedVehicleId)?.coordinates?.lat || 23.0450
    : 23.0450;
  const initialTruckLng = driverInfo?.assignedVehicleId
    ? vehicles.find((v) => v.id === driverInfo.assignedVehicleId)?.coordinates?.lng || 72.5250
    : 72.5250;

  // Road Polyline Coordinates
  const [roadPolyline, setRoadPolyline] = useState(() => [
    [initialTruckLat, initialTruckLng],
    [initialTruckLat + (targetLat - initialTruckLat) * 0.35, initialTruckLng + (targetLng - initialTruckLng) * 0.1],
    [initialTruckLat + (targetLat - initialTruckLat) * 0.7, initialTruckLng + (targetLng - initialTruckLng) * 0.8],
    [targetLat, targetLng],
  ]);

  // Live truck simulation step index along polyline
  const [stepIndex, setStepIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(true);
  const [speedKmh, setSpeedKmh] = useState(32);

  // Fetch real OSRM driving road route
  useEffect(() => {
    let isMounted = true;
    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${initialTruckLng},${initialTruckLat};${targetLng},${targetLat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.code === 'Ok' && data.routes && data.routes.length > 0 && isMounted) {
            const waypoints = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            if (waypoints.length > 1) {
              setRoadPolyline(waypoints);
            }
          }
        }
      } catch (e) {}
    };
    if (isOpen) {
      fetchRoute();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, initialTruckLat, initialTruckLng, targetLat, targetLng]);

  // Animate truck along polyline
  useEffect(() => {
    if (!isOpen || !isSimulating || roadPolyline.length <= 1) return;

    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= roadPolyline.length - 1) {
          return prev; // Arrived at destination
        }
        return prev + 1;
      });
      // Vary speed realistically between 24 and 38 km/h
      setSpeedKmh(Math.floor(26 + Math.sin(Date.now() / 1000) * 10));
    }, 1800);

    return () => clearInterval(interval);
  }, [isOpen, isSimulating, roadPolyline]);

  // Current Truck Position
  const currentTruckPos = roadPolyline[Math.min(stepIndex, roadPolyline.length - 1)] || [initialTruckLat, initialTruckLng];
  const isArrived = stepIndex >= roadPolyline.length - 1;

  // Remaining Distance & Live ETA
  const remainingMeters = useMemo(() => {
    if (isArrived) return 0;
    let dist = 0;
    for (let i = stepIndex; i < roadPolyline.length - 1; i++) {
      dist += calculateDistanceMeters(roadPolyline[i][0], roadPolyline[i][1], roadPolyline[i + 1][0], roadPolyline[i + 1][1]);
    }
    return Math.max(50, dist);
  }, [stepIndex, roadPolyline, isArrived]);

  const remainingDistanceFormatted = formatDistance(remainingMeters);
  const liveEtaMins = isArrived ? 0 : Math.max(1, Math.round((remainingMeters / 1000) * 3));

  if (!isOpen) return null;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentTruckPos[0]},${currentTruckPos[1]}&destination=${targetLat},${targetLng}`;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 12px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-scale-in"
        style={{
          maxWidth: '780px',
          width: '100%',
          maxHeight: 'min(92vh, calc(100dvh - 24px))',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '14px 18px',
            background: 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: isDriverMode ? 'rgba(14, 165, 233, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: isDriverMode ? 'var(--accent-cyan)' : 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              {isDriverMode ? '🧭' : '🚚'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {isDriverMode ? 'Turn-by-Turn Route Navigation' : 'Live Real-Time Truck Tracing'}
                </h3>
                <span
                  className="badge"
                  style={{
                    background: isArrived ? 'rgba(16, 185, 129, 0.2)' : 'rgba(14, 165, 233, 0.2)',
                    color: isArrived ? 'var(--accent-green, #10b981)' : 'var(--accent-cyan, #0ea5e9)',
                    fontWeight: 700,
                    fontSize: '10px',
                  }}
                >
                  {isArrived ? '✓ Arrived on Site' : '⚡ GPS Transponder Active'}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {targetTitle} • {targetLocation}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close route tracing modal"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Telemetry Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            padding: '10px 16px',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Live ETA
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Clock size={14} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-primary)' }}>
                {isArrived ? 'Arrived' : `~${liveEtaMins} mins`}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Distance Left
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <MapPin size={14} style={{ color: 'var(--primary-500)' }} />
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {remainingDistanceFormatted}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Truck Speed
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Gauge size={14} style={{ color: 'var(--accent-amber)' }} />
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {isArrived ? '0 km/h' : `${speedKmh} km/h`}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Vehicle Plate
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Truck size={14} style={{ color: 'var(--accent-violet)' }} />
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {driverInfo?.vehiclePlate || 'GJ-01-CZ-4821'}
              </span>
            </div>
          </div>
        </div>

        {/* Map View */}
        <div style={{ position: 'relative', height: '360px', width: '100%' }}>
          <MapContainer
            center={[currentTruckPos[0], currentTruckPos[1]]}
            zoom={14}
            zoomControl={false}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapBoundsFitter coords={[currentTruckPos, [targetLat, targetLng]]} />

            {/* Trajectory Polyline */}
            <Polyline
              positions={roadPolyline}
              color="#0ea5e9"
              weight={5}
              opacity={0.85}
              dashArray="8, 6"
            />

            {/* Completed Path */}
            {stepIndex > 0 && (
              <Polyline
                positions={roadPolyline.slice(0, stepIndex + 1)}
                color="#10b981"
                weight={5}
                opacity={0.9}
              />
            )}

            {/* Moving Truck Marker */}
            <Marker
              position={[currentTruckPos[0], currentTruckPos[1]]}
              icon={createTracingTruckIcon(driverInfo?.assignedVehicleId || 'TRK-801', speedKmh)}
            >
              <Popup>
                <div style={{ padding: '4px', minWidth: '160px' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                    🚚 {driverInfo?.name || 'Municipal Driver'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Badge: {driverInfo?.badgeId || 'DRV-801'} • {driverInfo?.vehiclePlate || 'GJ-01'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#0ea5e9', fontWeight: 700, marginTop: '4px' }}>
                    Speed: {speedKmh} km/h • ETA ~{liveEtaMins} mins
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Target Destination Marker */}
            <Marker
              position={[targetLat, targetLng]}
              icon={createTracingTargetIcon(targetReport?.id || 'Target')}
            >
              <Popup>
                <div style={{ padding: '4px', minWidth: '160px' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                    📍 {targetTitle}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {targetLocation}
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>

          {/* Floating Controls Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(6px)',
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              style={{
                background: isSimulating ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {isSimulating ? <Pause size={12} /> : <Play size={12} />}
              <span>{isSimulating ? 'Live Transponder: Active' : 'Paused'}</span>
            </button>

            <button
              onClick={() => setStepIndex(0)}
              title="Reset simulation"
              style={{
                background: 'transparent',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Modal Footer Controls & Driver Contact */}
        <div
          style={{
            padding: '12px 18px',
            background: 'var(--bg-surface-elevated)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {/* Driver details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'var(--primary-500)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '13px',
                flexShrink: 0,
              }}
            >
              {driverInfo?.name?.charAt(0) || 'D'}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {driverInfo?.name || 'Suresh Kumar'} {driverInfo?.badgeId ? `(${driverInfo.badgeId})` : ''}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Certified Municipal Sanitation Fleet Crew
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {driverInfo?.phone && (
              <a
                href={`tel:${driverInfo.phone}`}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <Phone size={13} />
                <span>Call Driver ({driverInfo.phone})</span>
              </a>
            )}

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              <ExternalLink size={13} />
              <span>Google Maps</span>
            </a>

            {isDriverMode && targetReport?.id && (
              <button
                onClick={() => {
                  resolveReport(targetReport.id);
                  onClose();
                }}
                className="btn btn-primary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                <CheckCircle2 size={14} />
                <span>Confirm Site Cleared</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
