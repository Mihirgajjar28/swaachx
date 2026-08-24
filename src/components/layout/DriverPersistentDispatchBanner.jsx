import React, { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { getDriverAssignmentProfile } from '../../lib/driverRouteAssignments';
import { LiveRouteTracingModal } from '../maps/LiveRouteTracingModal';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Truck,
  Navigation,
  Clock,
  Phone,
  CheckCircle2,
  X,
} from 'lucide-react';

// Auto-Fit map bounds so both driver truck and incident location are clearly visible
const AutoFitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !points || points.length === 0) return;
    try {
      const validPoints = points.filter(
        (p) => p && Array.isArray(p) && typeof p[0] === 'number' && typeof p[1] === 'number' && !isNaN(p[0]) && !isNaN(p[1])
      );
      if (validPoints.length > 1) {
        map.fitBounds(validPoints, { padding: [35, 35], maxZoom: 15 });
      } else if (validPoints.length === 1) {
        map.setView(validPoints[0], 14);
      }
    } catch (e) {}
  }, [map, points]);
  return null;
};

// Custom Pin Icons for Mini-Map in Popup
const reportPinIcon = L.divIcon({
  className: 'direct-assign-pin-icon',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #dc2626;
      border: 2.5px solid #ffffff;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #ffffff;
      animation: pulse 1.8s infinite;
    ">
      📍
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const driverTruckIcon = L.divIcon({
  className: 'direct-assign-truck-icon',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #0284c7;
      border: 2.5px solid #ffffff;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #ffffff;
    ">
      🚛
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

/**
 * Driver Persistent Dispatch & Direct Assignment Modal:
 * Automatically alerts the assigned driver with an immediate pop-up modal containing
 * report location, citizen issue details, route mini-map, and 30-minute SLA resolution target.
 */
export const DriverPersistentDispatchBanner = () => {
  const {
    activeRole,
    currentUser,
    reports,
    vehicles,
    dustbins,
    hotspots,
    acceptReportDispatch,
    declineReportDispatch,
  } = useDashboard();

  const [activePopupReport, setActivePopupReport] = useState(null);
  const [navigatingReport, setNavigatingReport] = useState(null);
  const [acknowledgedSet, setAcknowledgedSet] = useState(() => new Set());

  if (activeRole !== 'driver' || !currentUser) return null;

  const driverProfile = getDriverAssignmentProfile({
    currentUser,
    allDustbins: dustbins,
    allHotspots: hotspots,
    allReports: reports,
    allVehicles: vehicles,
  });

  const { assignedReports = [], pendingApprovals = [], driverInfo, vehicle, isOffline } = driverProfile;

  // Active Dispatched Reports directly assigned to this driver that are not yet resolved
  const activeDispatchedReports = useMemo(() => {
    if (isOffline) return [];
    return assignedReports.filter((r) => r.status === 'Dispatched');
  }, [assignedReports, isOffline]);

  // Track acknowledged reports from localStorage
  const storageKey = `swaachx_driver_acknowledged_reports_${driverInfo?.badgeId || 'DRV-801'}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setAcknowledgedSet(new Set(JSON.parse(saved)));
      }
    } catch (e) {}
  }, [storageKey]);

  // Automatically trigger popup for any newly assigned unacknowledged report
  useEffect(() => {
    if (isOffline) return;

    // Check if there are any unacknowledged active dispatched reports
    const unacknowledged = activeDispatchedReports.find((r) => !acknowledgedSet.has(r.id));
    if (unacknowledged && !activePopupReport) {
      setActivePopupReport(unacknowledged);
    }
  }, [activeDispatchedReports, acknowledgedSet, isOffline]);

  const handleAcknowledge = (reportId) => {
    const nextSet = new Set(acknowledgedSet);
    nextSet.add(reportId);
    setAcknowledgedSet(nextSet);
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(nextSet)));
    } catch (e) {}
    if (activePopupReport?.id === reportId) {
      setActivePopupReport(null);
    }
  };

  const handleStartNavigation = (report) => {
    handleAcknowledge(report.id);
    setActivePopupReport(null);
    setNavigatingReport(report);
  };

  // Combine direct assignments and any pending requests
  const unacknowledgedReports = [...activeDispatchedReports, ...pendingApprovals].filter(
    (req) => !acknowledgedSet.has(req.id)
  );

  if (isOffline || (!activePopupReport && !navigatingReport && unacknowledgedReports.length === 0)) return null;

  const truckLat = vehicle?.coordinates?.lat || 23.0450;
  const truckLng = vehicle?.coordinates?.lng || 72.5441;

  return (
    <>
      {/* 1. Top Status Alert Banner for Driver (Only when new alert is active) */}
      {unacknowledgedReports.length > 0 && (
        <div
          className="driver-persistent-dispatch-container"
          style={{
            position: 'sticky',
            top: '0px',
            zIndex: 90,
            marginBottom: '16px',
          }}
        >
          {unacknowledgedReports.map((req) => {
            const isDirect = req.status === 'Dispatched';
            return (
              <div
                key={req.id}
                className="animate-slide-down"
                style={{
                  background: isDirect
                    ? 'linear-gradient(135deg, rgba(15, 118, 110, 0.98), rgba(13, 148, 136, 0.98))'
                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.97), rgba(220, 38, 38, 0.99))',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: isDirect
                    ? '0 8px 24px rgba(13, 148, 136, 0.35), 0 2px 6px rgba(0, 0, 0, 0.2)'
                    : '0 8px 30px rgba(239, 68, 68, 0.45), 0 2px 8px rgba(0, 0, 0, 0.25)',
                  border: '2px solid rgba(255, 255, 255, 0.35)',
                  padding: '12px 18px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '280px', flex: '1' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '18px',
                  }}
                >
                  {isDirect ? '🚨' : '⚡'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 900,
                        letterSpacing: '0.6px',
                        textTransform: 'uppercase',
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '2px 8px',
                        borderRadius: '99px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Clock size={10} />
                      {isDirect ? 'Direct Assignment • 30 Min SLA Target' : 'Dispatch Assignment Request'}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                      #{req.id}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {req.category}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 700,
                      marginTop: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <MapPin size={13} style={{ flexShrink: 0 }} />
                    <span>{req.location}</span>
                    <span style={{ opacity: 0.8 }}>•</span>
                    <span style={{ fontSize: '11.5px', fontWeight: 600 }}>
                      📍 ~{req.distanceKm || '1.8'} km away (ETA ~{req.etaMinutes || '12'} mins)
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => setActivePopupReport(req)}
                  className="btn btn-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    fontWeight: 700,
                    fontSize: '11.5px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <MapPin size={12} />
                  <span>View Location & Details</span>
                </button>

                <button
                  onClick={() => handleStartNavigation(req)}
                  className="btn btn-sm"
                  style={{
                    background: '#ffffff',
                    color: isDirect ? 'var(--primary-700)' : '#dc2626',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '11.5px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <Navigation size={13} />
                  <span>Start Navigation</span>
                </button>

                {!isDirect && (
                  <>
                    <button
                      onClick={() => declineReportDispatch(req.id, driverInfo?.badgeId)}
                      className="btn btn-sm"
                      id={`decline-dispatch-btn-${req.id}`}
                      style={{
                        background: 'rgba(0, 0, 0, 0.35)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        fontWeight: 600,
                        fontSize: '11.5px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                      }}
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => acceptReportDispatch(req.id, driverInfo)}
                      className="btn btn-sm"
                      id={`accept-dispatch-btn-${req.id}`}
                      style={{
                        background: '#ffffff',
                        color: '#dc2626',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: '11.5px',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <CheckCircle2 size={13} />
                      <span>Accept</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* 2. High-Priority Direct Assignment Pop-up Modal */}
      {activePopupReport && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleAcknowledge(activePopupReport.id);
            }
          }}
        >
          <div
            className="animate-scale-up"
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '2px solid var(--primary-500)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 35px rgba(16, 185, 129, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                  }}
                >
                  🚨
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 900,
                        letterSpacing: '0.6px',
                        textTransform: 'uppercase',
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '2px 8px',
                        borderRadius: '99px',
                      }}
                    >
                      30-Min Resolution Target
                    </span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '3px 0 0 0', color: '#ffffff' }}>
                    Direct Waste Clearance Assignment
                  </h3>
                </div>
              </div>

              <button
                onClick={() => handleAcknowledge(activePopupReport.id)}
                id="close-assignment-popup-btn"
                aria-label="Close notification"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '18px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Key SLA & Distance Metric Banner */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>TICKET ID</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary-600)' }}>
                    #{activePopupReport.id}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>DISTANCE</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ~{activePopupReport.distanceKm || '1.8'} km
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>RESOLUTION SLA</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#10b981' }}>
                    &lt; 30 Mins
                  </div>
                </div>
              </div>

              {/* Location Landmark & Category */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                    LOCATION & CLUSTER
                  </span>
                  <span className="badge badge-active" style={{ fontSize: '10px' }}>
                    {activePopupReport.category}
                  </span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />
                  <span>{activePopupReport.location}</span>
                </div>
                {activePopupReport.ward && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', marginLeft: '22px' }}>
                    Jurisdiction: {activePopupReport.ward}
                  </div>
                )}
              </div>

              {/* Description & Citizen Info */}
              {activePopupReport.description && (
                <div
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    CITIZEN COMPLAINT SUMMARY
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    "{activePopupReport.description}"
                  </p>
                  {activePopupReport.citizenPhone && activePopupReport.citizenPhone !== '—' && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                      <Phone size={12} style={{ color: 'var(--primary-600)' }} />
                      <span style={{ color: 'var(--text-muted)' }}>Reporter: {activePopupReport.citizenName}</span>
                      <a
                        href={`tel:${activePopupReport.citizenPhone}`}
                        style={{ color: 'var(--primary-600)', fontWeight: 700, textDecoration: 'none', marginLeft: 'auto' }}
                      >
                        Call Citizen ({activePopupReport.citizenPhone})
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Interactive Mini-Map Preview */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Navigation size={12} style={{ color: 'var(--primary-600)' }} />
                    <span>PROXIMITY & ROUTE TRAJECTORY</span>
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--primary-600)', background: 'rgba(14, 165, 233, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                    📍 ~{activePopupReport.distanceKm || '1.4'} km • ETA ~{activePopupReport.etaMinutes || '12'} mins
                  </span>
                </div>

                <div
                  style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-medium)',
                    height: '210px',
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  {/* Top-Left Truck HUD Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      zIndex: 500,
                      background: 'rgba(15, 23, 42, 0.88)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      backdropFilter: 'blur(4px)',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <span>🚛</span>
                    <span>Your Truck ({vehicle?.id || 'TRK-801'})</span>
                  </div>

                  {/* Top-Right Incident Site HUD Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      zIndex: 500,
                      background: 'rgba(220, 38, 38, 0.92)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      backdropFilter: 'blur(4px)',
                      boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)',
                    }}
                  >
                    <span>📍</span>
                    <span>Incident Location</span>
                  </div>

                  <MapContainer
                    center={[
                      activePopupReport.coordinates?.lat || activePopupReport.latitude || 23.0338,
                      activePopupReport.coordinates?.lng || activePopupReport.longitude || 72.5607,
                    ]}
                    zoom={14}
                    zoomControl={false}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />

                    {/* Auto-fit map viewport to show both truck & report */}
                    <AutoFitBounds
                      points={[
                        [truckLat, truckLng],
                        [
                          activePopupReport.coordinates?.lat || activePopupReport.latitude || 23.0338,
                          activePopupReport.coordinates?.lng || activePopupReport.longitude || 72.5607,
                        ],
                      ]}
                    />

                    {/* Truck Marker */}
                    <Marker position={[truckLat, truckLng]} icon={driverTruckIcon}>
                      <Popup>
                        <div style={{ fontSize: '11px', fontWeight: 700 }}>🚛 Your Truck ({vehicle?.id || 'TRK-801'})</div>
                      </Popup>
                    </Marker>

                    {/* Report Location Pin */}
                    <Marker
                      position={[
                        activePopupReport.coordinates?.lat || activePopupReport.latitude || 23.0338,
                        activePopupReport.coordinates?.lng || activePopupReport.longitude || 72.5607,
                      ]}
                      icon={reportPinIcon}
                    >
                      <Popup>
                        <div style={{ fontSize: '11px', fontWeight: 700 }}>📍 #{activePopupReport.id}: {activePopupReport.location}</div>
                      </Popup>
                    </Marker>

                    {/* Route Line connecting truck and incident site */}
                    <Polyline
                      positions={[
                        [truckLat, truckLng],
                        [
                          activePopupReport.coordinates?.lat || activePopupReport.latitude || 23.0338,
                          activePopupReport.coordinates?.lng || activePopupReport.longitude || 72.5607,
                        ],
                      ]}
                      color="#0284c7"
                      dashArray="6, 8"
                      weight={3.5}
                    />
                  </MapContainer>
                </div>

                {/* 1-Click Launch Live GPS Navigation button */}
                <button
                  type="button"
                  onClick={() => handleStartNavigation(activePopupReport)}
                  className="btn btn-primary"
                  style={{
                    marginTop: '10px',
                    width: '100%',
                    padding: '10px 16px',
                    fontSize: '12px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <Navigation size={14} />
                  <span>Open Turn-by-Turn GPS Navigation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Live Turn-by-Turn GPS Route Navigation Modal */}
      {navigatingReport && (
        <LiveRouteTracingModal
          isOpen={!!navigatingReport}
          targetReport={navigatingReport}
          onClose={() => setNavigatingReport(null)}
          isDriverMode={true}
        />
      )}
    </>
  );
};
