import React, { useState, useEffect } from 'react';
import { useDashboard, normalizePhone } from '../../context/DashboardContext';
import { detectCurrentLocation } from '../../lib/geolocation';
import { verifyDriverCredentials, AUTHORIZED_DRIVERS_DATABASE, isAuthorizedDriverEmail } from '../../lib/driverCredentials';
import { isMunicipalAdminEmail } from '../../lib/adminCredentials';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  AlertTriangle,
  MapPin,
  Navigation,
  Loader2,
  Truck,
  Shield,
  Sparkles,
} from 'lucide-react';

export const RegisterModal = () => {
  const {
    isRegisterOpen,
    closeRegister,
    openSignIn,
    registerUser,
    addToast,
    citizens,
    sendEmailOtp,
    verifyEmailOtp,
    checkDuplicateCredentials,
  } = useDashboard();

  const [accountType, setAccountType] = useState('Citizen'); // 'Citizen' | 'Fleet Driver'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState('Sector 14 (North Sector)');
  const [driverBadge, setDriverBadge] = useState('');
  const [driverPin, setDriverPin] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Verification State
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(45);
  const [generatedOtpHint, setGeneratedOtpHint] = useState('');

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

  // Automatically detect location without clicking Detect GPS when modal opens
  useEffect(() => {
    if (isRegisterOpen && !isOtpStep && accountType === 'Citizen') {
      fetchDeviceLocation(true);
    }
  }, [isRegisterOpen, isOtpStep, accountType]);

  if (!isRegisterOpen) return null;

  const validateForm = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Full Name is required';
    }

    // Dynamic duplicate checks
    const dupCheck = checkDuplicateCredentials ? checkDuplicateCredentials(name, email) : { isNameDuplicate: false, isEmailDuplicate: false };
    if (dupCheck.isNameDuplicate && name.trim()) {
      errs.name = dupCheck.nameError;
    }
    if (dupCheck.isEmailDuplicate && email.trim()) {
      errs.email = dupCheck.emailError;
    }

    // Driver Credentials Strict Verification
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

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    const cleanPhone = normalizePhone(phone);
    if (cleanPhone && cleanPhone.length !== 10) {
      errs.phone = 'Mobile number must be exactly 10 digits';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (confirmPassword && password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      errs.terms = 'Please accept the community charter';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendOtp = () => {
    setIsSubmitting(true);
    const otpRes = sendEmailOtp(email, true, name);
    if (otpRes && otpRes.success) {
      setGeneratedOtpHint(otpRes.otp);
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
        setErrors((prev) => ({ ...prev, name: res.error }));
      } else if (res.field === 'phone') {
        setErrors((prev) => ({ ...prev, phone: res.error }));
      } else if (res.field === 'driverBadge') {
        setErrors((prev) => ({ ...prev, driverBadge: res.error }));
      } else {
        setErrors((prev) => ({ ...prev, email: res.error }));
      }
    }
    setIsSubmitting(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    handleSendOtp();
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
      onClick={closeRegister}
    >
      <div
        className="glass-card animate-scale-in"
        style={{
          maxWidth: '480px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg), 0 25px 50px -12px rgba(0, 0, 0, 0.15)',
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
                Create New Account
              </h3>
            </div>
          </div>

          <button
            onClick={closeRegister}
            className="btn btn-ghost btn-icon-only"
            style={{ width: '30px', height: '30px' }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        {!isOtpStep && (
          <div style={{ padding: '16px 20px 0' }}>
            <div className="auth-segmented-control">
              <div className="auth-segmented-glider register" />
              <button
                type="button"
                onClick={openSignIn}
                className="auth-segmented-btn"
              >
                <span>Sign In</span>
              </button>
              <button
                type="button"
                className="auth-segmented-btn active"
              >
                <UserPlus size={13} />
                <span>Register</span>
              </button>
            </div>
          </div>
        )}

        {/* OTP VERIFICATION STEP IN MODAL */}
        {isOtpStep ? (
          <div className="animate-tab-content" style={{ padding: '24px 20px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--primary-50)',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px',
                  border: '1px solid var(--primary-200)',
                }}
              >
                <Mail size={20} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                Verify Your Email Address
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Enter the 6-digit OTP verification code sent to <br />
                <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
              </p>

              {generatedOtpHint && (
                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      background: 'rgba(5, 150, 105, 0.08)',
                      border: '1.5px dashed var(--primary-500)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '10px 16px',
                      width: '100%',
                      maxWidth: '340px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      🔑 Your 6-Digit Verification Code
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '6px', color: 'var(--primary-600)', fontFamily: 'var(--font-mono)' }}>
                      {generatedOtpHint}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpCode(generatedOtpHint);
                        if (errors.otp) setErrors((prev) => ({ ...prev, otp: null }));
                      }}
                      style={{
                        marginTop: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '99px',
                        background: 'var(--primary-500)',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px var(--primary-glow)',
                        transition: 'all 0.15s ease',
                      }}
                      title="Click to autofill OTP"
                    >
                      <Sparkles size={13} />
                      <span>Click to Autofill Code</span>
                    </button>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Tip: If external email is delayed by spam filters, click the instant code above to register immediately.
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleVerifyOtpAndRegister}>
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>
                  <span>Enter 6-Digit Email OTP</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setOtpCode(val);
                    if (errors.otp) setErrors((prev) => ({ ...prev, otp: null }));
                  }}
                  id="modal-otp-input"
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
                style={{ width: '100%', padding: '10px', fontSize: '13px', marginBottom: '12px' }}
                disabled={isSubmitting || otpCode.length !== 6}
                id="modal-verify-otp-btn"
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
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="animate-tab-content" style={{ padding: '16px 20px 20px' }}>

          {/* Citizen Registration Badge & Security Notice */}
          <div
            style={{
              marginBottom: '14px',
              padding: '8px 12px',
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
                  width: '26px',
                  height: '26px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-500)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User size={14} />
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

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">
              <span>Full Name</span>
              <span style={{ color: 'var(--accent-rose)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Enter your full name..."
                value={name}
                onChange={(e) => {
                  const val = e.target.value;
                  setName(val);
                  if (val.trim()) {
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
                  if (name.trim() && checkDuplicateCredentials) {
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

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label">
              <span>Email Address</span>
              <span style={{ color: 'var(--accent-rose)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder="Enter email address..."
                value={email}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmail(val);
                  if (val.trim()) {
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
                  if (email.trim() && checkDuplicateCredentials) {
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

          {/* Phone & Municipal Ward */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
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
                  style={{ paddingLeft: '32px' }}
                  id="modal-phone-input"
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
                  id="modal-fetch-location-btn"
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
                  id="modal-location-input"
                />
              </div>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
            <div className="form-group">
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

            <div className="form-group">
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
                />
              </div>
              {errors.confirmPassword && (
                <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '4px', display: 'block' }}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          </div>

          {/* Terms Agreement */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>I agree to the Community Charter & Terms</span>
            </label>
            {errors.terms && <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '4px', display: 'block' }}>{errors.terms}</span>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px', fontSize: '13px', marginBottom: '12px' }}
            disabled={isSubmitting}
            id="auth-submit-btn"
          >
            {isSubmitting ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>

          {/* Switch to Sign In */}
          <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={openSignIn}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-600)',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Sign In here
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};
