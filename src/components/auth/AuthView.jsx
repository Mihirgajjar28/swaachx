import React, { useState, useEffect } from 'react';
import { useDashboard, normalizePhone } from '../../context/DashboardContext';
import { detectCurrentLocation } from '../../lib/geolocation';
import { verifyDriverCredentials, AUTHORIZED_DRIVERS_DATABASE, isAuthorizedDriverEmail } from '../../lib/driverCredentials';
import { isMunicipalAdminEmail } from '../../lib/adminCredentials';
import {
  Recycle,
  User,
  Mail,
  Lock,
  Phone,
  Building,
  ArrowRight,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertTriangle,
  MapPin,
  Navigation,
  Loader2,
  Truck,
  Shield,
  Sparkles,
  CheckCircle2,
  Award,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { AdminLoginModal } from '../admin/AdminLoginModal';

export const AuthView = () => {
  const {
    loginUser,
    registerUser,
    addToast,
    citizens,
    sendEmailOtp,
    verifyEmailOtp,
    checkDuplicateCredentials,
    checkAccountExists,
    resetUserPassword,
    isAdminLoginOpen,
    openAdminLogin,
    closeAdminLogin,
  } = useDashboard();

  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'register'
  const [accountType, setAccountType] = useState('Citizen'); // 'Citizen' | 'Fleet Driver'

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState('Sector 14 (North Sector)');
  const [driverBadge, setDriverBadge] = useState('');
  const [driverPin, setDriverPin] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password state
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // OTP Verification state
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(45);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (isOtpStep && otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpStep, otpCountdown]);

  const fetchDeviceLocation = async (silent = false) => {
    setIsLocating(true);
    try {
      const result = await detectCurrentLocation();
      if (result && result.address) {
        setWard(result.address);
        if (!silent) addToast(`Location detected: ${result.address}`, 'success');
      } else if (!silent) {
        addToast('Unable to detect location. Please type manually.', 'warning');
      }
    } catch (e) {
      if (!silent) addToast('Location detection error. Please type manually.', 'warning');
    } finally {
      setIsLocating(false);
    }
  };

  // Automatically detect location without clicking Detect GPS when in register mode
  useEffect(() => {
    if (authMode === 'register' && !isOtpStep && accountType === 'Citizen') {
      fetchDeviceLocation(true);
    }
  }, [authMode, isOtpStep, accountType]);

  const validate = () => {
    const errs = {};
    if (authMode === 'register') {
      if (!name.trim()) {
        errs.name = 'Full Name is required';
      }

      // Check duplicate credentials dynamically
      const dupCheck = checkDuplicateCredentials ? checkDuplicateCredentials(name, email) : { isNameDuplicate: false, isEmailDuplicate: false };
      if (dupCheck.isNameDuplicate && name.trim()) {
        errs.name = dupCheck.nameError;
      }
      if (dupCheck.isEmailDuplicate && email.trim()) {
        errs.email = dupCheck.emailError;
      }

      // Fleet Driver Strict Credential Check
      if (accountType === 'Fleet Driver') {
        const driverAuth = verifyDriverCredentials({
          email: email.trim().toLowerCase(),
          phone,
          badgeId: driverBadge,
          securityPin: driverPin,
        });

        if (!driverAuth.isAuthorized) {
          errs.driverBadge =
            driverAuth.error ||
            'Driver credentials not found in Municipal Fleet Registry. Only authorized municipal drivers can register.';
        }
      }

      const cleanPhone = normalizePhone(phone);
      if (cleanPhone && cleanPhone.length !== 10) {
        errs.phone = 'Mobile number must be exactly 10 digits';
      }
    }
    const cleanInput = email.trim();
    const isBadgeId = cleanInput.toUpperCase().startsWith('DRV-') || cleanInput.toUpperCase().startsWith('TRK-');
    const isPhone = /^\d{10}$/.test(cleanInput.replace(/[^0-9]/g, ''));
    const isEmail = /\S+@\S+\.\S+/.test(cleanInput);

    if (!cleanInput) {
      errs.email = 'Email address is required';
    } else if (authMode === 'register' && !isEmail) {
      errs.email = 'Please enter a valid email address';
    } else if (authMode === 'register') {
      const cleanEmail = email.trim().toLowerCase();
      if (isMunicipalAdminEmail(cleanEmail)) {
        errs.email = 'Registration Restricted: Municipal Officer/Admin accounts are pre-provisioned by AMC IT Directorate. Please Sign In via the Admin Gateway.';
      } else if (isAuthorizedDriverEmail(cleanEmail) || cleanEmail.includes('wastefleet')) {
        errs.email = 'Registration Restricted: Fleet Driver accounts are pre-certified by Municipal Fleet Operations. Please Sign In directly with your Driver Badge or fleet email.';
      } else {
        const isDuplicateEmail =
          !isOtpStep &&
          (citizens &&
            citizens.some(
              (c) =>
                c.email &&
                c.email.trim().toLowerCase() === cleanEmail &&
                c.name !== 'Citizen Resident' &&
                c.name !== cleanEmail.split('@')[0]
            )) ||
          cleanEmail === 'aarav.mehta@citizen.in';
        if (isDuplicateEmail) {
          errs.email = 'User is already registered with this email ID. Please sign in.';
        }
      }
    } else if (authMode === 'signin' && !isEmail && !isBadgeId && !isPhone) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (authMode === 'register' && confirmPassword && password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendOtp = () => {
    setIsSubmitting(true);
    const otpRes = sendEmailOtp(email, true, name);
    if (otpRes && otpRes.success) {
      setIsOtpStep(true);
      setOtpCountdown(45);
      setOtpCode('');
      setErrors({});
    } else if (otpRes && otpRes.error) {
      if (otpRes.field === 'name') {
        setErrors((prev) => ({ ...prev, name: otpRes.error }));
      } else {
        setErrors((prev) => ({ ...prev, email: otpRes.error }));
      }
    }
    setIsSubmitting(false);
  };

  const handleVerifyOtpAndRegister = async (e) => {
    if (e) e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit verification OTP' });
      return;
    }

    setIsSubmitting(true);
    const verifyRes = await verifyEmailOtp(email, otpCode);
    if (!verifyRes.success) {
      setErrors({ otp: verifyRes.error || 'Invalid OTP code' });
      setIsSubmitting(false);
      return;
    }

    // OTP Verified successfully -> Execute registration
    const res = registerUser({
      name,
      email,
      password,
      phone,
      ward,
      role: accountType,
      driverBadge,
      driverPin,
      isVerified: true,
    });
    if (res && !res.success && res.error) {
      setIsOtpStep(false);
      if (res.field === 'name') {
        setErrors({ name: res.error });
      } else if (res.field === 'phone') {
        setErrors({ phone: res.error });
      } else if (res.field === 'driverBadge') {
        setErrors({ driverBadge: res.error });
      } else {
        setErrors({ email: res.error });
      }
    }
    setIsSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (authMode === 'signin') {
      setIsSubmitting(true);
      const res = await loginUser({ email, password });
      if (res && !res.success) {
        if (res.notFound) {
          setAuthMode('register');
          setErrors({ email: res.error });
        } else if (res.field === 'password') {
          setErrors({ password: res.error });
        } else if (res.error) {
          setErrors({ email: res.error });
        }
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
    } else {
      // Step 1 of Register: Send Email OTP
      handleSendOtp();
    }
  };

  /**
   * Forgot Password Trigger:
   * Checks database presence of email/profile.
   * If yes -> dispatches email OTP and opens reset form.
   * If no -> redirects to registration.
   */
  const handleForgotPasswordClick = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrors({ email: 'Please enter your registered email address first' });
      addToast('Please enter your registered email address in the field to reset password.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const checkRes = await checkAccountExists(cleanEmail);
      if (!checkRes.exists) {
        addToast('No registered account found with this email in the database. Redirecting to registration...', 'warning');
        setAuthMode('register');
        setIsSubmitting(false);
        return;
      }

      // Account exists in database -> Dispatch OTP & Open Reset Interface
      sendEmailOtp(cleanEmail);
      setIsForgotMode(true);
      setErrors({});
      setForgotOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      console.warn('Forgot password check exception:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const errs = {};

    if (!forgotOtp.trim() || forgotOtp.trim().length !== 6) {
      errs.otp = 'Please enter the complete 6-digit OTP received in email';
    }
    if (!newPassword) {
      errs.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters long';
    }
    if (newPassword !== confirmNewPassword) {
      errs.confirmNewPassword = 'Passwords do not match';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    // 1. Verify OTP
    const verifyRes = await verifyEmailOtp(cleanEmail, forgotOtp);
    if (!verifyRes || !verifyRes.success) {
      setErrors({ otp: verifyRes?.error || 'Invalid or expired verification code' });
      setIsSubmitting(false);
      return;
    }

    // 2. Update password in database profiles table
    const updateRes = await resetUserPassword({ email: cleanEmail, newPassword });
    if (updateRes?.success) {
      setIsForgotMode(false);
      setPassword('');
      setErrors({});
    } else {
      setErrors({ newPassword: updateRes?.error || 'Failed to update password' });
    }
    setIsSubmitting(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #ecfdf5 50%, #f1f5f9 100%)',
        position: 'relative',
      }}
    >
      <div
        className="glass-card animate-scale-in"
        style={{
          maxWidth: '430px',
          width: '100%',
          boxShadow: 'var(--shadow-xl), 0 20px 40px -15px rgba(5, 150, 105, 0.15)',
          border: '1px solid var(--border-medium)',
          background: 'var(--bg-surface)',
          padding: 0,
          borderRadius: 'var(--radius-xl)',
        }}
      >
        {/* Top Hero Brand Header */}
        <div
          style={{
            padding: '28px 24px 22px',
            textAlign: 'center',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'linear-gradient(180deg, rgba(5, 150, 105, 0.06) 0%, transparent 100%)',
          }}
        >
          <div
            className="animate-float"
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src="/logo.png"
              alt="swaach.x logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: '0' }}>
            swaach.<span style={{ color: 'var(--primary-500)' }}>x</span>
          </h2>
        </div>

        {/* Mode Switcher: Sign In vs Register with Sliding Glider */}
        {!isOtpStep && !isForgotMode && (
          <div style={{ padding: '16px 24px 0' }}>
            <div className="auth-segmented-control">
              <div className={`auth-segmented-glider ${authMode === 'register' ? 'register' : ''}`} />
              
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrors({});
                }}
                id="header-signin-btn"
                className={`auth-segmented-btn ${authMode === 'signin' ? 'active' : ''}`}
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrors({});
                }}
                id="header-register-btn"
                className={`auth-segmented-btn ${authMode === 'register' ? 'active' : ''}`}
              >
                <UserPlus size={14} />
                <span>Register</span>
              </button>
            </div>
          </div>
        )}

        {/* OTP VERIFICATION STEP */}
        {isOtpStep ? (
          <div className="animate-tab-content" style={{ padding: '24px 24px 28px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(5, 150, 105, 0.1)',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <Mail size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                Verify Your Email Address
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                We've sent a 6-digit OTP verification code to <br />
                <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtpAndRegister}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>
                  <span>Enter 6-Digit Email OTP</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setOtpCode(val);
                    if (errors.otp) setErrors((prev) => ({ ...prev, otp: null }));
                  }}
                  id="auth-otp-input"
                  className="form-input"
                  style={{
                    textAlign: 'center',
                    fontSize: '22px',
                    fontWeight: 700,
                    letterSpacing: '8px',
                    padding: '12px',
                    fontFamily: 'var(--font-mono)',
                    borderColor: errors.otp ? 'var(--accent-rose)' : undefined,
                  }}
                />
                {errors.otp && (
                  <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <AlertTriangle size={12} />
                    {errors.otp}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '11px', fontSize: '13px', marginBottom: '12px' }}
                disabled={isSubmitting || otpCode.length !== 6}
                id="auth-verify-otp-btn"
              >
                {isSubmitting ? (
                  <span>Verifying & Creating Account...</span>
                ) : (
                  <>
                    <span>Verify OTP & Complete Registration</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', fontSize: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsOtpStep(false)}
                  id="auth-back-otp-btn"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                    fontWeight: 500,
                  }}
                >
                  &larr; Edit Details
                </button>

                {otpCountdown > 0 ? (
                  <span style={{ color: 'var(--text-muted)' }}>
                    Resend in {otpCountdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSubmitting}
                    id="auth-resend-otp-btn"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-600)',
                      cursor: 'pointer',
                      padding: 0,
                      fontWeight: 600,
                    }}
                  >
                    Resend OTP Code
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : isForgotMode ? (
          <form onSubmit={handleResetPasswordSubmit} className="animate-tab-content" style={{ padding: '20px 24px 28px' }}>
            <div style={{ marginBottom: '16px', background: 'rgba(5, 150, 105, 0.08)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-800)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                <ShieldCheck size={16} />
                <span>Database Profile Found</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--primary-700)', margin: 0 }}>
                We've sent a 6-digit OTP code to <strong>{email}</strong>. Enter it below along with your new password.
              </p>
            </div>

            {/* 6-Digit OTP */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">
                <span>Enter 6-Digit Email OTP</span>
                <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP..."
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="form-input"
                  style={{ paddingLeft: '36px', letterSpacing: '3px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
                  required
                />
              </div>
              {errors.otp && <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '4px', display: 'block' }}>{errors.otp}</span>}
            </div>

            {/* New Password */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">
                <span>New Password</span>
                <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px', paddingRight: '36px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
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
                  {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.newPassword && <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '4px', display: 'block' }}>{errors.newPassword}</span>}
            </div>

            {/* Confirm New Password */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">
                <span>Confirm New Password</span>
                <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password..."
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  required
                />
              </div>
              {errors.confirmNewPassword && <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '4px', display: 'block' }}>{errors.confirmNewPassword}</span>}
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '11px', fontSize: '13px', marginBottom: '12px', fontWeight: 800 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating Database Password...' : 'Save New Password & Continue'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsForgotMode(false);
                setErrors({});
              }}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '10px', fontSize: '12.5px' }}
            >
              Back to Sign In
            </button>
          </form>
        ) : (
          /* Main Form with Smooth Tab Content Animation */
          <form key={authMode} onSubmit={handleSubmit} className="animate-tab-content" style={{ padding: '16px 24px 24px' }}>

            {authMode === 'register' && (
              <>
                {/* Citizen Registration Badge & Security Notice */}
                <div
                  className="animate-field-expand"
                  style={{
                    marginBottom: '16px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'rgba(5, 150, 105, 0.06)',
                    border: '1px solid rgba(5, 150, 105, 0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--primary-500)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <User size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Citizen Resident Registration
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Drivers & Admins: Pre-certified (Please Sign In)
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(5, 150, 105, 0.15)',
                      color: 'var(--primary-700)',
                    }}
                  >
                    Public
                  </span>
                </div>

                <div className="form-group animate-field-expand">
                  <label className="form-label">
                    <span>Full Name</span>
                    <span style={{ color: 'var(--accent-rose)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Enter full name..."
                      value={name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setName(val);
                        if (authMode === 'register' && val.trim()) {
                          const dup = checkDuplicateCredentials ? checkDuplicateCredentials(val, email) : { isNameDuplicate: false };
                          if (dup.isNameDuplicate) {
                            setErrors((prev) => ({ ...prev, name: dup.nameError }));
                          } else if (errors.name && errors.name.includes('already registered')) {
                            setErrors((prev) => ({ ...prev, name: null }));
                          }
                        } else if (errors.name) {
                          setErrors((prev) => ({ ...prev, name: null }));
                        }
                      }}
                      onBlur={() => {
                        if (authMode === 'register' && name.trim() && checkDuplicateCredentials) {
                          const dup = checkDuplicateCredentials(name, email);
                          if (dup.isNameDuplicate) {
                            setErrors((prev) => ({ ...prev, name: dup.nameError }));
                          }
                        }
                      }}
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
                      id="auth-name-input"
                    />
                  </div>
                  {errors.name && <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
                </div>
              </>
            )}

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label">
                <span>Email Address</span>
                <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={authMode === 'signin' ? 'text' : 'email'}
                  placeholder="Enter email address..."
                  value={email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEmail(val);
                    if (authMode === 'register' && val.trim()) {
                      const dup = checkDuplicateCredentials ? checkDuplicateCredentials(name, val) : { isEmailDuplicate: false };
                      if (dup.isEmailDuplicate) {
                        setErrors((prev) => ({ ...prev, email: dup.emailError }));
                      } else if (errors.email && errors.email.includes('already registered')) {
                        setErrors((prev) => ({ ...prev, email: null }));
                      }
                    } else if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: null }));
                    }
                  }}
                  onBlur={() => {
                    if (authMode === 'register' && email.trim() && checkDuplicateCredentials) {
                      const dup = checkDuplicateCredentials(name, email);
                      if (dup.isEmailDuplicate) {
                        setErrors((prev) => ({ ...prev, email: dup.emailError }));
                      }
                    }
                  }}
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

            {authMode === 'register' && (
              <div className="animate-field-expand" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">
                    <span>Mobile Phone</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="tel"
                      placeholder="10-digit mobile..."
                      value={phone}
                      maxLength={10}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length <= 10) setPhone(val);
                      }}
                      className="form-input"
                      style={{ paddingLeft: '30px' }}
                      id="auth-phone-input"
                    />
                  </div>
                  {errors.phone && (
                    <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '4px', display: 'block' }}>
                      {errors.phone}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      <span>Location</span>
                    </label>
                    <button
                      type="button"
                      onClick={fetchDeviceLocation}
                      disabled={isLocating}
                      id="auth-fetch-location-btn"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-600)',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: 0,
                      }}
                      title="Fetch current device location via GPS"
                    >
                      {isLocating ? (
                        <>
                          <Loader2 size={11} className="spin" />
                          <span>Locating...</span>
                        </>
                      ) : (
                        <>
                          <Navigation size={11} />
                          <span>Detect GPS</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="e.g. Sector 14, Pune or GPS..."
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '30px' }}
                      id="auth-location-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="form-group" style={{ marginBottom: authMode === 'signin' ? '8px' : '14px' }}>
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
            {authMode === 'signin' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  disabled={isSubmitting}
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
            )}

            {authMode === 'register' && (
              <div className="form-group animate-field-expand">
                <label className="form-label">
                  <span>Confirm Password</span>
                  <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm password..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    id="auth-confirm-password-input"
                  />
                </div>
                {errors.confirmPassword && (
                  <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '4px', display: 'block' }}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px', fontSize: '13px', marginBottom: '16px' }}
              disabled={isSubmitting}
              id="auth-submit-btn"
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{authMode === 'signin' ? 'Sign In & Access Portal' : 'Send Email OTP & Continue'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            {/* Bottom Switcher Helper */}
            <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
              {authMode === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setErrors({});
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-600)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Register here
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setErrors({});
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-600)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </form>
        )}

      </div>

      {/* Admin Login Modal */}
      <AdminLoginModal isOpen={isAdminLoginOpen} onClose={closeAdminLogin} />
    </div>
  );
};
