import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Shield,
  Truck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  LogIn,
  UserPlus,
} from 'lucide-react';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authMode,
    setAuthMode,
    loginUser,
    registerUser,
    addToast,
  } = useDashboard();

  // Form states
  const [role, setRole] = useState('Citizen'); // 'Citizen' | 'Officer' | 'Driver'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState('Ward 14 - North Sector');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear errors when mode changes
  useEffect(() => {
    setErrors({});
  }, [authMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Validation
  const validateForm = () => {
    const errs = {};
    if (authMode === 'register' && !name.trim()) {
      errs.name = 'Full Name is required';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (authMode === 'register') {
      if (password !== confirmPassword) {
        errs.confirmPassword = 'Passwords do not match';
      }
      if (!agreeTerms) {
        errs.terms = 'Please accept the citizen terms of service';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      if (authMode === 'signin') {
        loginUser({ email, role, name });
      } else {
        registerUser({ name, email, phone, ward, role });
      }
    }, 400);
  };

  // Quick Demo Auto-Fill
  const handleQuickDemo = (demoRole) => {
    if (demoRole === 'Citizen') {
      setName('Aarav Mehta');
      setEmail('aarav.mehta@citizen.in');
      setPhone('+91 98765 43210');
      setPassword('password123');
      setConfirmPassword('password123');
      setRole('Citizen');
    } else if (demoRole === 'Officer') {
      setName('Dr. Rajesh Verma');
      setEmail('r.verma@municipal.gov.in');
      setPhone('+91 98111 22334');
      setPassword('adminPass2026');
      setConfirmPassword('adminPass2026');
      setRole('Municipal Officer');
    } else if (demoRole === 'Driver') {
      setName('Suresh Kumar');
      setEmail('suresh.k@wastefleet.org');
      setPhone('+91 94555 66778');
      setPassword('driverRoute99');
      setConfirmPassword('driverRoute99');
      setRole('Fleet Driver');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.35)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={closeAuthModal}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-medium)',
          background: 'var(--bg-surface)',
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-elevated)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'var(--primary-500)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {authMode === 'signin' ? <LogIn size={16} /> : <UserPlus size={16} />}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {authMode === 'signin' ? 'Sign In to EcoPulse' : 'Create Citizen Account'}
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {authMode === 'signin'
                ? 'Access municipal reporting, live tracking & dispatch'
                : 'Join the smart community waste monitoring network'}
            </p>
          </div>

          <button
            onClick={closeAuthModal}
            className="btn btn-ghost btn-icon-only"
            style={{ width: '32px', height: '32px' }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher (Sign In vs Register) */}
        <div style={{ padding: '16px 24px 0' }}>
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-surface-elevated)',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: authMode === 'signin' ? 'var(--bg-surface)' : 'transparent',
                color: authMode === 'signin' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: authMode === 'signin' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: authMode === 'signin' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: authMode === 'register' ? 'var(--bg-surface)' : 'transparent',
                color: authMode === 'register' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: authMode === 'register' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: authMode === 'register' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Register New Account
            </button>
          </div>
        </div>

        {/* Role Selector Pill */}
        <div style={{ padding: '14px 24px 0' }}>
          <label className="form-label" style={{ marginBottom: '8px' }}>
            <span>Select Account Role</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { id: 'Citizen', label: 'Citizen', icon: User },
              { id: 'Municipal Officer', label: 'Officer / Admin', icon: Shield },
              { id: 'Fleet Driver', label: 'Fleet Driver', icon: Truck },
            ].map((r) => {
              const Icon = r.icon;
              const isSelected = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '10px 6px',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid var(--primary-500)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'var(--primary-50)' : 'var(--bg-surface-elevated)',
                    color: isSelected ? 'var(--primary-600)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: isSelected ? 700 : 500,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={16} />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '18px 24px 24px' }}>
          {/* Full Name (Only for Register) */}
          {authMode === 'register' && (
            <div className="form-group">
              <label className="form-label">
                <span>Full Name</span>
                <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Enter name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  id="auth-name-input"
                />
              </div>
              {errors.name && <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
            </div>
          )}

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label">
              <span>Email Address</span>
              <span style={{ color: 'var(--accent-rose)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder="Enter email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px' }}
                id="auth-email-input"
              />
            </div>
            {errors.email && <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
          </div>

          {/* Phone & Ward (Only for Register) */}
          {authMode === 'register' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">
                  <span>Mobile Phone</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    placeholder="Enter phone number..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '32px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Municipal Ward</span>
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="form-select"
                >
                  <option value="Ward 14 - North Sector">Ward 14 (North)</option>
                  <option value="Ward 08 - Central Market">Ward 08 (Central)</option>
                  <option value="Ward 22 - Industrial Area">Ward 22 (Industrial)</option>
                  <option value="Ward 03 - Residential South">Ward 03 (South)</option>
                </select>
              </div>
            </div>
          )}

          {/* Password */}
          <div className="form-group">
            <div className="form-label">
              <span>Password</span>
              {authMode === 'signin' && (
                <button
                  type="button"
                  onClick={() => addToast('Password reset link sent to registered email.', 'info')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-500)', fontSize: '11px', cursor: 'pointer' }}
                >
                  Forgot?
                </button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px', paddingRight: '36px' }}
                id="auth-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '4px', display: 'block' }}>{errors.password}</span>}
          </div>

          {/* Confirm Password (Register Only) */}
          {authMode === 'register' && (
            <div className="form-group">
              <label className="form-label">
                <span>Confirm Password</span>
                <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm password..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                />
              </div>
              {errors.confirmPassword && (
                <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '4px', display: 'block' }}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          )}

          {/* Terms Checkbox */}
          {authMode === 'register' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span>I agree to the Community Waste Reporting Terms & Privacy Policy</span>
              </label>
              {errors.terms && <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '4px', display: 'block' }}>{errors.terms}</span>}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '14px', marginBottom: '14px' }}
            disabled={isSubmitting}
            id="auth-submit-btn"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{authMode === 'signin' ? `Sign In as ${role}` : `Register as ${role}`}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>

          {/* Quick Demo Fill Buttons */}
          <div
            style={{
              padding: '12px',
              borderRadius: '10px',
              background: 'var(--bg-surface-elevated)',
              border: '1px dashed var(--border-medium)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Sparkles size={12} style={{ color: 'var(--accent-amber)' }} />
              <span>1-Click Demo Fill:</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleQuickDemo('Citizen')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', padding: '4px 8px' }}
              >
                Citizen Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('Officer')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', padding: '4px 8px' }}
              >
                Officer Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('Driver')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', padding: '4px 8px' }}
              >
                Driver Demo
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
