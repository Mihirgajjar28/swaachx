import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  LayoutDashboard,
  Truck,
  Route,
  PlusCircle,
  Trash2,
  User,
  LogOut,
  X,
  Shield,
  Building,
} from 'lucide-react';

export const MobileBottomNav = () => {
  const { activeTab, setActiveTab, activeRole, currentUser, logoutUser } = useDashboard();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const citizenItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'dustbins', label: 'Locator', icon: Trash2 },
    { id: 'reports', label: 'Report', icon: PlusCircle, highlight: true },
  ];

  const driverItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'routes', label: 'Routes', icon: Route },
    { id: 'vehicles', label: 'Telemetry', icon: Truck },
  ];

  const navItems = activeRole === 'driver' ? driverItems : citizenItems;

  return (
    <>
      {/* 1. Mobile Bottom Sheet for Profile */}
      {isProfileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setIsProfileOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              background: 'var(--bg-surface)',
              borderTopLeftRadius: 'var(--radius-xl)',
              borderTopRightRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-medium)',
              borderBottom: 'none',
              boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.15)',
              padding: '20px',
              animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div
              style={{
                width: '36px',
                height: '4px',
                borderRadius: '99px',
                background: 'var(--border-medium)',
                margin: '0 auto 16px',
              }}
            />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'var(--primary-500)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '16px',
                    boxShadow: '0 2px 8px var(--primary-glow)',
                  }}
                >
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {currentUser?.name || 'Active User'}
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {currentUser?.email || 'user@swaachx.in'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsProfileOpen(false)}
                className="btn btn-ghost btn-icon-only"
                style={{ width: '32px', height: '32px' }}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* User Metadata Badges */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginBottom: '18px',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} style={{ color: 'var(--primary-500)' }} />
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Role</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser?.role || 'Citizen'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={14} style={{ color: 'var(--accent-cyan)' }} />
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Ward Sector</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser?.ward || 'Ward 14'}</div>
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => {
                setIsProfileOpen(false);
                logoutUser();
              }}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '13px',
                color: 'var(--accent-rose)',
                borderColor: 'rgba(225, 29, 72, 0.25)',
                background: 'var(--accent-rose-bg)',
                fontWeight: 700,
              }}
              id="logout-btn"
            >
              <LogOut size={15} />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsProfileOpen(false);
              }}
              className={`mobile-bottom-nav-item ${isActive ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`}
              aria-label={item.label}
            >
              <div style={{ position: 'relative' }}>
                <Icon size={20} />
              </div>
              <span className="mobile-bottom-nav-label">{item.label}</span>
            </button>
          );
        })}

        {/* Profile Button in Bottom Bar */}
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className={`mobile-bottom-nav-item ${isProfileOpen ? 'active' : ''}`}
          aria-label="User Profile"
          id="user-profile-btn"
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: isProfileOpen ? 'var(--primary-500)' : 'var(--bg-surface-elevated)',
              color: isProfileOpen ? '#fff' : 'var(--text-secondary)',
              border: '1.5px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '11px',
              transition: 'all 0.15s ease',
            }}
          >
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User size={14} />}
          </div>
          <span className="mobile-bottom-nav-label">Profile</span>
        </button>
      </nav>
    </>
  );
};
