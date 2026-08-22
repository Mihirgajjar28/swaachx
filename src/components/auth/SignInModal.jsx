import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  LogIn,
  AlertTriangle,
} from 'lucide-react';

export const SignInModal = () => {
  const {
    isSignInOpen,
    closeSignIn,
    openRegister,
    openAdminLogin,
    loginUser,
    addToast,
  } = useDashboard();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isSignInOpen) return null;

  const validateForm = () => {
    const errs = {};
    const cleanInput = email.trim();
    const isBadgeId = cleanInput.toUpperCase().startsWith('DRV-') || cleanInput.toUpperCase().startsWith('TRK-');
    const isPhone = /^\d{10}$/.test(cleanInput.replace(/[^0-9]/g, ''));
    const isEmail = /\S+@\S+\.\S+/.test(cleanInput);

    if (!cleanInput) {
      errs.email = 'Email address is required';
    } else if (!isEmail && !isBadgeId && !isPhone) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const res = await loginUser({ email, password });
    if (res && !res.success) {
      if (res.notFound) {
        openRegister();
      } else if (res.field === 'password') {
        setErrors((prev) => ({ ...prev, password: res.error }));
      } else if (res.error) {
        setErrors((prev) => ({ ...prev, email: res.error }));
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={closeSignIn}
    >
      <div
        className="glass-card animate-scale-in"
        style={{
          maxWidth: '430px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg), 0 20px 40px -15px rgba(0, 0, 0, 0.15)',
          border: '1px solid var(--border-medium)',
          background: 'var(--bg-surface)',
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-elevated)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
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
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Sign In to swaach.x
              </h3>
            </div>
          </div>

          <button
            onClick={closeSignIn}
            className="btn btn-ghost btn-icon-only"
            style={{ width: '30px', height: '30px' }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ padding: '16px 20px 0' }}>
          <div className="auth-segmented-control">
            <div className="auth-segmented-glider" />
            <button
              type="button"
              className="auth-segmented-btn active"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={openRegister}
              className="auth-segmented-btn"
            >
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="animate-tab-content" style={{ padding: '16px 20px 20px' }}>
          {/* Email Address */}
          <div className="form-group">
            <label className="form-label">
              <span>Email Address</span>
              <span style={{ color: 'var(--accent-rose)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Enter email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px' }}
                id="auth-email-input"
              />
            </div>
            {errors.email && (
              <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={12} />
                {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: '8px' }}>
            <label className="form-label">
              <span>Password</span>
              <span style={{ color: 'var(--accent-rose)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '4px', display: 'block' }}>{errors.password}</span>}
          </div>

          {/* Forgot Password Button below Password Input */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
            <button
              type="button"
              onClick={() => addToast('Password reset link sent to registered email.', 'info')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-600)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '0',
              }}
            >
              Forgot Password?
            </button>
          </div>

          {/* Remember Me */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember this session</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px', fontSize: '13px', marginBottom: '12px' }}
            disabled={isSubmitting}
            id="auth-submit-btn"
          >
            {isSubmitting ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <span>Sign In & Access Portal</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>

          {/* Switch to Register */}
          <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={openRegister}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-600)',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Sign up / Create account
            </button>
          </div>

          {/* Municipal Administrator Gateway Link */}
          <div
            style={{
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center',
            }}
          >
            <button
              type="button"
              onClick={openAdminLogin}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0284c7')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              🏛️ Municipal Official / Admin Login Gateway
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
