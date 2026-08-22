import React, { useState, useEffect } from 'react';
import { ShieldAlert, Monitor, Smartphone, Lock, LogOut } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

/**
 * DesktopOnlyGuard: Restricts access to the Municipal Admin Command Center on mobile / tablet devices.
 * Enforces a minimum display width of 1024px for multi-stream GIS telemetry and municipal command operations.
 */
export const DesktopOnlyGuard = ({ children }) => {
  const { logoutUser } = useDashboard();
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = windowWidth >= 1024;

  if (isDesktop) {
    return <>{children}</>;
  }

  // Mobile / Non-Desktop Device Restriction Security Screen
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #081e2b 100%)',
        color: '#f8fafc',
        padding: '24px 16px',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          background: 'rgba(15, 23, 42, 0.92)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '16px',
          padding: '32px 24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 25px rgba(239, 68, 68, 0.2)',
          textAlign: 'center',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {/* Security Shield Icon */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid rgba(239, 68, 68, 0.5)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px auto',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
          }}
        >
          <ShieldAlert size={34} />
        </div>

        {/* Security Alert Header */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#fca5a5',
            padding: '4px 12px',
            borderRadius: '99px',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '12px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <Lock size={12} />
          <span>Desktop Security Protocol • AMC Level 5</span>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', margin: '0 0 8px 0', letterSpacing: '-0.3px' }}>
          Desktop Workstation Required
        </h2>

        <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 20px 0' }}>
          Access to the <strong>Ahmedabad Municipal Corporation (AMC) Executive Admin Command Center</strong> is strictly restricted to certified desktop workstations. Mobile and tablet displays are blocked for telemetry integrity and security compliance.
        </p>

        {/* Diagnostic Resolution HUD */}
        <div
          style={{
            background: 'rgba(2, 6, 23, 0.7)',
            borderRadius: '10px',
            padding: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '22px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Smartphone size={14} style={{ color: '#ef4444' }} /> Current Device Viewport:
            </span>
            <span style={{ fontWeight: 800, color: '#ef4444', fontFamily: 'monospace' }}>
              {windowWidth} × {windowHeight} px (Restricted)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Monitor size={14} style={{ color: '#0ea5e9' }} /> Required Resolution:
            </span>
            <span style={{ fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>
              ≥ 1024 px Width (Desktop)
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={logoutUser}
            className="btn btn-secondary"
            style={{
              width: '100%',
              padding: '12px',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
            }}
          >
            <LogOut size={16} />
            <span>Sign Out & Return to Citizen Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
