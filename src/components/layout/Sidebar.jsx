import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  LayoutDashboard,
  ClipboardList,
  Truck,
  Route,
  Recycle,
  Trash2,
  Compass,
  Users,
  X,
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { activeTab, setActiveTab, activeRole } = useDashboard();

  const citizenNavItems = [
    {
      id: 'dashboard',
      label: 'Citizen Portal',
      icon: LayoutDashboard,
      badge: null,
      description: 'My Reports & Karma',
    },
    {
      id: 'dustbins',
      label: 'Dustbin Locator',
      icon: Trash2,
      badge: null,
      description: 'Dedicated GPS & Navigation',
    },
    {
      id: 'reports',
      label: 'Report Waste Issue',
      icon: ClipboardList,
      badge: null,
      description: 'Submit Photo & GPS',
    },
    {
      id: 'quests',
      label: 'Community Quests',
      icon: Users,
      badge: '100+ ⭐',
      description: 'Neighborhood Cleanup Drives',
    },
  ];

  const driverNavItems = [
    {
      id: 'dashboard',
      label: 'Driver Cockpit',
      icon: LayoutDashboard,
      badge: null,
      description: 'Shift & Telemetry',
    },
    {
      id: 'routes',
      label: 'Assigned Routes',
      icon: Route,
      badge: null,
      description: 'Waypoint Sequence',
    },
    {
      id: 'vehicles',
      label: 'Fleet GPS & Transponder',
      icon: Truck,
      badge: null,
      description: 'Truck Diagnostics',
    },
  ];

  const adminNavItems = [
    {
      id: 'dashboard',
      label: 'Executive Command',
      icon: LayoutDashboard,
      badge: null,
      description: 'City Overview & KPIs',
    },
    {
      id: 'gis-map',
      label: 'Live GIS Grid',
      icon: Compass,
      badge: null,
      description: 'Master Map Telemetry',
    },
    {
      id: 'incidents',
      label: 'Incident Hub',
      icon: ClipboardList,
      badge: null,
      description: 'Override Dispatch',
    },
    {
      id: 'vehicles',
      label: 'Fleet & Drivers',
      icon: Truck,
      badge: null,
      description: '10 Trucks & Telemetry',
    },
    {
      id: 'dustbins',
      label: 'Smart IoT Dustbins',
      icon: Trash2,
      badge: null,
      description: 'Sensors & Fill Levels',
    },
  ];

  const navItems =
    activeRole === 'admin'
      ? adminNavItems
      : activeRole === 'driver'
      ? driverNavItems
      : citizenNavItems;

  const isItemActive = (itemId) => {
    if (activeRole === 'admin') {
      if (itemId === 'dashboard') return activeTab === 'dashboard' || activeTab === 'overview' || activeTab === 'admin-overview';
      if (itemId === 'vehicles') return activeTab === 'vehicles' || activeTab === 'fleet';
      return activeTab === itemId;
    }
    return activeTab === itemId;
  };

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div>
        <div
          style={{
            height: '68px',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              className="animate-float"
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <img
                src="/logo.png"
                alt="swaach.x logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
                swaach.<span style={{ color: 'var(--primary-500)' }}>x</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.4px', textTransform: 'uppercase', fontWeight: 600 }}>
                {activeRole === 'admin' ? 'Municipal Admin HQ' : activeRole === 'driver' ? 'Driver Field App' : 'Citizen App'}
              </div>
            </div>
          </div>

          {/* Mobile Close Button */}
          {isMobileOpen && (
            <button
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              className="btn btn-ghost btn-icon-only"
              style={{ width: '32px', height: '32px' }}
              title="Close Menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.id);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  justifyContent: 'flex-start',
                  borderRadius: 'var(--radius-md)',
                  border: isActive ? '1px solid var(--border-highlight)' : '1px solid transparent',
                  background: isActive ? 'var(--primary-50)' : 'transparent',
                  color: isActive ? 'var(--primary-600)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  textAlign: 'left',
                  fontWeight: isActive ? 600 : 500,
                  transform: isActive ? 'translateX(4px)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-surface-elevated)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.transform = 'none';
                  }
                }}
              >
                <Icon size={18} style={{ flexShrink: 0, color: isActive ? 'var(--primary-500)' : 'var(--text-muted)', transition: 'color 0.2s ease' }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: isActive ? 700 : 500, lineHeight: 1.2 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {item.description}
                  </div>
                </div>

                {item.badge !== null && (
                  <span
                    className="animate-check-pop"
                    style={{
                      padding: '2px 6px',
                      borderRadius: '99px',
                      fontSize: '10px',
                      fontWeight: 700,
                      background: 'var(--primary-500)',
                      color: '#ffffff',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Live Telemetry & Status Footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="radar-dot" style={{ width: '7px', height: '7px' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
            {activeRole === 'driver' ? 'Field Telemetry Active' : 'Citizen Grid Online'}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          v2.0
        </span>
      </div>
    </aside>
  );
};
