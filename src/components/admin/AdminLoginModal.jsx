import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDashboard } from '../../context/DashboardContext';
import { verifyAdminCredentials, AUTHORIZED_ADMINS_DATABASE } from '../../lib/adminCredentials';
import {
  Shield,
  Lock,
  Mail,
  Key,
  X,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Building,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AdminLoginModal = ({ isOpen, onClose }) => {
  const { setCurrentUser, setActiveTab, addToast } = useDashboard();
  const [email, setEmail] = useState('admin@municipal.gov.in');
  const [password, setPassword] = useState('Admin@2026Password');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const cleanEmail = email.trim();
      const cleanPass = password.trim();

      const matchedAdmin = verifyAdminCredentials(cleanEmail, cleanPass);

      if (!matchedAdmin) {
        setError('Invalid Municipal Administrator credentials. Access restricted to authorized AMC personnel.');
        setIsLoading(false);
        return;
      }

      // Successful Admin Authentication
      const adminUser = {
        id: matchedAdmin.id,
        name: matchedAdmin.name,
        email: matchedAdmin.email,
        phone: matchedAdmin.phone,
        role: 'Admin',
        designation: matchedAdmin.designation,
        department: matchedAdmin.department,
        ward: matchedAdmin.jurisdiction,
        securityClearance: matchedAdmin.securityClearance,
        permissions: matchedAdmin.permissions,
        joinedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem('swaachx_user_session', JSON.stringify(adminUser));
        localStorage.setItem('swaachx_admin_session', JSON.stringify(adminUser));
      } catch (err) {}

      setCurrentUser(adminUser);
      setActiveTab('admin-overview');
      addToast(`🏛️ Welcome, ${matchedAdmin.name}! Executive Command Portal unlocked.`, 'success');
      onClose();
    } catch (err) {
      setError('Authentication failed. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 15, 29, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-scale-in"
        style={{
          maxWidth: '480px',
          width: '100%',
          background: '#0f172a',
          border: '1px solid rgba(14, 165, 233, 0.3)',
          borderRadius: '16px',
          padding: '28px 24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 25px rgba(14, 165, 233, 0.15)',
          position: 'relative',
          color: '#f8fafc',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close admin login modal"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={20} />
        </button>

        {/* Municipal Seal & Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(2, 132, 199, 0.1))',
              border: '2px solid #0ea5e9',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)',
            }}
          >
            <Building size={26} />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(14, 165, 233, 0.12)',
              color: '#38bdf8',
              padding: '3px 10px',
              borderRadius: '99px',
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '6px',
              border: '1px solid rgba(14, 165, 233, 0.3)',
            }}
          >
            <Shield size={11} />
            <span>Authorized Officials Only</span>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: '4px 0', letterSpacing: '-0.3px' }}>
            Municipal Executive Portal
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
            Ahmedabad Municipal Corporation (AMC) Solid Waste Command Center
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              fontSize: '12px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
              Municipal Officer Email ID
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@municipal.gov.in"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
              Security Command Password
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 38px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* 3 Quick-Login Administrator Profiles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⚡ Select Certified Admin Profile (1-Click Fill):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px' }}>
              {[
                {
                  label: 'Commissioner',
                  icon: '🏛️',
                  email: 'admin@municipal.gov.in',
                  pass: 'Admin@2026Password',
                  badge: 'Level 5 Super Admin',
                },
                {
                  label: 'SWM Director',
                  icon: '🛡️',
                  email: 'commissioner@ahmedabad.gov.in',
                  pass: 'AMC-Admin#2026',
                  badge: 'Level 4 SWM Head',
                },
                {
                  label: 'Fleet Chief',
                  icon: '🚛',
                  email: 'operations.head@municipal.gov.in',
                  pass: 'FleetAdmin2026!',
                  badge: 'Level 4 Logistics',
                },
              ].map((adm, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setEmail(adm.email);
                    setPassword(adm.pass);
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: email === adm.email ? 'rgba(14, 165, 233, 0.2)' : 'rgba(30, 41, 59, 0.7)',
                    border: email === adm.email ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{adm.icon}</span>
                    <span>{adm.label}</span>
                  </div>
                  <span style={{ fontSize: '9.5px', color: email === adm.email ? '#38bdf8' : '#94a3b8', fontWeight: 600 }}>
                    {adm.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '4px',
              boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
            }}
          >
            {isLoading ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <span>Enter Municipal Command Center</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};
