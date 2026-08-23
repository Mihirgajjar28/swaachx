import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { getDriverAssignmentProfile } from '../../lib/driverRouteAssignments';
import { CheckCircle2, MapPin } from 'lucide-react';

/**
 * Driver Persistent Dispatch Approval Banner:
 * High-visibility sticky notification that remains permanently displayed at the top
 * of the Driver interface across all tabs until the driver explicitly takes action
 * (Confirm & Accept or Decline / Pass).
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

  if (activeRole !== 'driver' || !currentUser) return null;

  const driverProfile = getDriverAssignmentProfile({
    currentUser,
    allDustbins: dustbins,
    allHotspots: hotspots,
    allReports: reports,
    allVehicles: vehicles,
  });

  const { pendingApprovals = [], driverInfo, isOffline } = driverProfile;

  if (isOffline || pendingApprovals.length === 0) return null;

  return (
    <div
      className="driver-persistent-dispatch-container"
      style={{
        position: 'sticky',
        top: '0px',
        zIndex: 90,
        marginBottom: '16px',
      }}
    >
      {pendingApprovals.map((req) => (
        <div
          key={req.id}
          className="animate-slide-down"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.97), rgba(220, 38, 38, 0.99))',
            color: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 8px 30px rgba(239, 68, 68, 0.45), 0 2px 8px rgba(0, 0, 0, 0.25)',
            border: '2px solid rgba(255, 255, 255, 0.35)',
            padding: '14px 18px',
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
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '20px',
              }}
            >
              🚨
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
                  }}
                >
                  ⚡ Confirmation Required • Stays Active Until Decision
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
                  fontSize: '13px',
                  fontWeight: 700,
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexWrap: 'wrap',
                }}
              >
                <MapPin size={14} style={{ flexShrink: 0 }} />
                <span>{req.location}</span>
                <span style={{ opacity: 0.8 }}>•</span>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>
                  📍 ~{req.distanceKm || '1.4'} km away (ETA ~{req.etaMinutes || '5'} mins)
                </span>
              </div>

              {req.description && (
                <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '2px', fontStyle: 'italic' }}>
                  "{req.description}"
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <button
              onClick={() => declineReportDispatch(req.id, driverInfo?.badgeId)}
              className="btn btn-sm"
              id={`decline-dispatch-btn-${req.id}`}
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                fontWeight: 600,
                fontSize: '12px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              Decline / Pass
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
                fontSize: '12px',
                padding: '8px 18px',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckCircle2 size={15} />
              <span>Confirm & Accept Assignment</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
