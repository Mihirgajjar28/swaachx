import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Camera,
  RefreshCw,
  ArrowRight,
  Check,
  MapPin,
  FileText,
} from 'lucide-react';
import {
  verifyCleanupBeforeAfterWithGemini,
  DRIVER_CLEANUP_TEST_SAMPLES,
} from '../../lib/aiWasteAnalyzer';

export const DriverCleanupVerificationModal = ({
  report,
  onClose,
  onVerifiedResolve,
}) => {
  const fileInputRef = useRef(null);
  const [afterPhotoFile, setAfterPhotoFile] = useState(null);
  const [afterPhotoPreview, setAfterPhotoPreview] = useState('');
  const [afterPhotoName, setAfterPhotoName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!report) return null;

  const defaultBeforePhoto =
    report.photoUrl ||
    'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=500&auto=format&fit=crop&q=60';

  const handleFileSelect = (file) => {
    if (!file) return;
    setAfterPhotoFile(file);
    setAfterPhotoName(file.name);
    setVerificationResult(null);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = (e) => {
      setAfterPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (preset) => {
    setAfterPhotoPreview(preset.previewUrl);
    setAfterPhotoName(preset.name);
    setAfterPhotoFile(preset.tag);
    setVerificationResult(null);
    setErrorMessage('');
  };

  const handleRunAiVerification = async () => {
    if (!afterPhotoPreview && !afterPhotoFile) {
      setErrorMessage('Please upload a post-cleanup photo of the cleared area (Compulsory).');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const res = await verifyCleanupBeforeAfterWithGemini({
        beforeImage: defaultBeforePhoto,
        afterImage: afterPhotoFile || afterPhotoPreview,
        reportDetails: {
          id: report.id,
          category: report.category,
          location: report.location,
          description: report.description,
        },
      });

      setVerificationResult(res);
    } catch (e) {
      console.warn('AI Verification failed:', e);
      setErrorMessage('Verification process encountered an issue. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmResolution = () => {
    if (!verificationResult || !verificationResult.isClean) {
      setErrorMessage('Cannot resolve: AI verification must confirm the site is clean (≥ 80% cleanliness score).');
      return;
    }

    onVerifiedResolve(report.id, {
      afterPhotoUrl: afterPhotoPreview,
      cleanlinessScore: verificationResult.cleanlinessScore,
      aiExplanation: verificationResult.explanation,
    });
    onClose();
  };

  const modalContent = (
    <div
      className="modal-backdrop animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 8px',
        overflow: 'hidden',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-card animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-surface)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.1) 0%, rgba(16, 185, 129, 0.08) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--primary-600) 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(8, 145, 178, 0.3)',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  AI Cleanup Verification Gate
                </h3>
                <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                  #{report.id}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Google Gemini Vision compares Before & After photos before marking site resolved
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '16px', overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>
          {/* Incident Summary Card */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-primary)' }}>
                {report.category}
              </div>
              <span className={`badge ${report.priority === 'Critical' ? 'badge-high' : 'badge-neutral'}`} style={{ fontSize: '10px' }}>
                {report.priority} Priority
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} color="var(--primary-600)" />
              <span>{report.location}</span>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {report.description}
            </div>
          </div>

          {/* Dual-Image Comparison Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
              marginBottom: '14px',
            }}
          >
            {/* 1. BEFORE PHOTO: Citizen Evidence */}
            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid rgba(244, 63, 94, 0.3)',
                background: 'var(--bg-surface-elevated)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  background: 'rgba(244, 63, 94, 0.08)',
                  borderBottom: '1px solid rgba(244, 63, 94, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  🔴 BEFORE: Citizen Complaint Photo
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Original Issue</span>
              </div>
              <div style={{ position: 'relative', height: '180px', background: '#000' }}>
                <img
                  src={defaultBeforePhoto}
                  alt="Before Cleanup"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>

            {/* 2. AFTER PHOTO: Driver Cleanup Upload */}
            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid rgba(16, 185, 129, 0.35)',
                background: 'var(--bg-surface-elevated)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  🟢 AFTER: Driver Resolution Photo *
                </span>
                <span style={{ fontSize: '10px', color: 'var(--primary-700)', fontWeight: 700 }}>
                  Compulsory
                </span>
              </div>

              <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {afterPhotoPreview ? (
                  <div style={{ position: 'relative', height: '160px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000' }}>
                    <img
                      src={afterPhotoPreview}
                      alt="After Cleanup"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setAfterPhotoPreview('');
                        setAfterPhotoFile(null);
                        setAfterPhotoName('');
                        setVerificationResult(null);
                      }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      title="Remove Photo"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Dropzone */}
                    <div
                      className="file-dropzone"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: '16px 10px',
                        borderRadius: 'var(--radius-md)',
                        border: '2px dashed var(--primary-400)',
                        background: 'rgba(16, 185, 129, 0.03)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <Camera size={22} style={{ color: 'var(--primary-600)', margin: '0 auto 4px' }} />
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Take / Upload Post-Cleanup Photo
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        Shows cleared pavement or emptied bin
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      />
                    </div>

                    {/* Preset Test Samples */}
                    <div>
                      <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Or Choose Quick Test Sample:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                        {DRIVER_CLEANUP_TEST_SAMPLES.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handlePresetSelect(preset)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)',
                              background: preset.type === 'valid' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)',
                              fontSize: '10.5px',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              textAlign: 'left',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Verification Analysis Trigger */}
          <div style={{ marginBottom: '14px' }}>
            <button
              type="button"
              onClick={handleRunAiVerification}
              disabled={isVerifying || !afterPhotoPreview}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '10px',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--primary-600) 100%)',
                boxShadow: '0 4px 14px rgba(8, 145, 178, 0.25)',
                cursor: (isVerifying || !afterPhotoPreview) ? 'not-allowed' : 'pointer',
                opacity: !afterPhotoPreview ? 0.6 : 1,
              }}
            >
              {isVerifying ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Gemini AI Comparing Before & After Site Photos...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>🤖 Run Gemini Dual-Vision AI Verification</span>
                </>
              )}
            </button>
          </div>

          {/* Error / Rejection Alert */}
          {errorMessage && (
            <div
              className="animate-fade-in"
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: 'var(--accent-rose)',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* AI Verification Result Card */}
          {verificationResult && (
            <div
              className="animate-scale-in"
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-lg)',
                border: `1.5px solid ${verificationResult.isClean ? '#10b981' : '#e11d48'}`,
                background: verificationResult.isClean ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {verificationResult.isClean ? (
                    <CheckCircle2 size={22} color="#10b981" />
                  ) : (
                    <AlertTriangle size={22} color="#e11d48" />
                  )}
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: verificationResult.isClean ? '#10b981' : '#e11d48' }}>
                      {verificationResult.isClean ? '✅ AI Verification PASSED: Site Verified Clean' : '❌ AI Verification REJECTED: Waste Still Present'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {verificationResult.source || 'Google Gemini Vision AI'}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: verificationResult.isClean ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    color: verificationResult.isClean ? '#10b981' : '#e11d48',
                    fontWeight: 800,
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  Score: {verificationResult.cleanlinessScore}%
                </div>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.4, margin: '0 0 8px 0' }}>
                {verificationResult.explanation}
              </p>

              {verificationResult.residualWasteDetected?.length > 0 && (
                <div style={{ fontSize: '11px', color: '#e11d48', background: 'rgba(244, 63, 94, 0.08)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Residual Debris Detected:</strong> {verificationResult.residualWasteDetected.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmResolution}
            disabled={!verificationResult || !verificationResult.isClean}
            className="btn btn-primary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontWeight: 700,
              cursor: (!verificationResult || !verificationResult.isClean) ? 'not-allowed' : 'pointer',
              opacity: (!verificationResult || !verificationResult.isClean) ? 0.5 : 1,
            }}
          >
            <Check size={14} />
            <span>Mark Resolved & Close Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
