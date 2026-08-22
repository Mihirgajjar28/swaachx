import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDashboard, resolveDriverDetails } from '../../context/DashboardContext';
import { LiveRouteTracingModal } from '../maps/LiveRouteTracingModal';
import { findKnowledgeBaseMatch } from '../../lib/aiWasteAnalyzer';
import {
  X,
  MapPin,
  User,
  Phone,
  Layers,
  AlertTriangle,
  Truck,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Image as ImageIcon,
  Navigation,
  Sparkles,
  Lightbulb,
} from 'lucide-react';

export const ReportDetailModal = ({
  report,
  isOpen,
  onClose,
  onDispatch,
  onResolve,
  isCitizen = false,
}) => {
  const { citizens, currentUser, vehicles } = useDashboard();
  const [isTracingOpen, setIsTracingOpen] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !report) return null;

  const matchedCitizen = citizens?.find(
    (c) => c.email && report.citizenEmail && c.email.toLowerCase() === report.citizenEmail.toLowerCase()
  );

  const displayedCitizenName =
    report.citizenName ||
    matchedCitizen?.name ||
    (currentUser?.email && report.citizenEmail && currentUser.email.toLowerCase() === report.citizenEmail.toLowerCase()
      ? currentUser.name
      : 'Citizen Resident');

  const displayedCitizenPhone =
    (report.citizenPhone && report.citizenPhone !== '—' && report.citizenPhone !== '+91 98765 00000')
      ? report.citizenPhone
      : (matchedCitizen?.phone && matchedCitizen.phone !== '—')
      ? matchedCitizen.phone
      : (currentUser?.email && report.citizenEmail && currentUser.email.toLowerCase() === report.citizenEmail.toLowerCase() && currentUser.phone)
      ? currentUser.phone
      : report.citizenPhone || '—';

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Critical':
      case 'High':
        return 'badge-high';
      case 'Medium':
        return 'badge-pending';
      default:
        return 'badge-neutral';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Resolved':
        return 'badge-active';
      case 'Dispatched':
        return 'badge-resolved';
      default:
        return 'badge-pending';
    }
  };

  const isDispatched = report.status === 'Dispatched' || report.status === 'Resolved';
  const isResolved = report.status === 'Resolved';

  const mapUrl = report.coordinates?.lat && report.coordinates?.lng
    ? `https://www.google.com/maps/search/?api=1&query=${report.coordinates.lat},${report.coordinates.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(report.location || 'Pune')}`;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 12px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-scale-in"
        style={{
          maxWidth: '520px',
          width: '100%',
          maxHeight: 'min(88vh, calc(100dvh - 32px))',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Request ID, Status Badge & Close Button */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', minWidth: 0 }}>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 800,
                color: 'var(--primary-600)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '-0.2px',
                whiteSpace: 'nowrap',
              }}
            >
              #{report.id}
            </span>
            <span
              className={`badge ${getStatusBadgeClass(report.status)}`}
              style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}
            >
              {report.status}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--border-medium)';
              e.currentTarget.style.background = 'var(--bg-surface)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.background = 'transparent';
            }}
            title="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            padding: '16px',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            flexGrow: 1,
          }}
        >
          {/* Visual Milestone Progression Bar */}
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Resolution Lifecycle Progression
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              {[
                { label: 'Submitted', done: true, icon: CheckCircle2 },
                { label: 'Triage Verified', done: true, icon: ShieldCheck },
                { label: 'Dispatched', done: isDispatched, icon: Truck },
                { label: 'Resolved', done: isResolved, icon: CheckCircle2 },
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <React.Fragment key={idx}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', zIndex: 2 }}>
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: step.done ? 'var(--primary-500)' : 'var(--bg-surface)',
                          border: `2px solid ${step.done ? 'var(--primary-500)' : 'var(--border-medium)'}`,
                          color: step.done ? '#ffffff' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Icon size={13} />
                      </div>
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: step.done ? 700 : 500,
                          color: step.done ? 'var(--text-primary)' : 'var(--text-muted)',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < 3 && (
                      <div
                        style={{
                          flex: 1,
                          height: '2px',
                          background: (idx === 0) || (idx === 1 && isDispatched) || (idx === 2 && isResolved)
                            ? 'var(--primary-500)'
                            : 'var(--border-subtle)',
                          margin: '0 2px',
                          marginBottom: '14px',
                          transition: 'background 0.2s ease',
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Key Attributes Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
            }}
          >
            {/* Category */}
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                <Layers size={12} />
                <span>Category</span>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: '11px', fontWeight: 600 }}>
                {report.category || 'General Waste'}
              </span>
            </div>

            {/* Severity / Priority */}
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                <AlertTriangle size={12} />
                <span>Priority</span>
              </div>
              <span className={`badge ${getPriorityBadgeClass(report.priority)}`} style={{ fontSize: '11px', fontWeight: 700 }}>
                {report.priority || 'Medium'}
              </span>
            </div>

            {/* Assigned Fleet Unit */}
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                <Truck size={12} />
                <span>Assigned Fleet</span>
              </div>
              {report.assignedDriver ? (
                (() => {
                  const dInfo = resolveDriverDetails(report.assignedDriver, vehicles);
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-600)' }}>
                        🚛 {dInfo?.name || report.assignedDriver}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Plate: {dInfo?.vehiclePlate || 'GJ-01'}</span>
                        {dInfo?.phone && (
                          <a
                            href={`tel:${dInfo.phone}`}
                            style={{ color: 'var(--primary-500)', textDecoration: 'none', fontWeight: 700 }}
                          >
                            📞 {dInfo.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Awaiting Dispatch
                </div>
              )}
            </div>

            {/* Date Submitted */}
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                <Calendar size={12} />
                <span>Timestamp</span>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {new Date(report.createdAt).toLocaleString(undefined, {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </div>
            </div>
          </div>

          {/* Location & Geotag Section */}
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                <MapPin size={14} style={{ color: 'var(--primary-500)' }} />
                <span>Incident Location & Geotag</span>
              </div>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--primary-600)',
                  textDecoration: 'none',
                }}
              >
                <span>Maps</span>
                <ExternalLink size={10} />
              </a>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.4 }}>
              {report.location || 'Location not specified'}
            </p>
            {report.ward && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Ward: <strong style={{ color: 'var(--text-secondary)' }}>{report.ward}</strong>
              </div>
            )}
          </div>

          {/* Citizen Commentary & Description */}
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Citizen Commentary / Notes
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                whiteSpace: 'pre-wrap',
              }}
            >
              {report.description || 'No additional description provided.'}
            </p>
          </div>

          {/* Reporter Details (Always show Citizen Name & Phone) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <User size={12} style={{ color: 'var(--primary-500)' }} />
              <span>
                Reported by: <strong style={{ color: 'var(--text-primary)' }}>{displayedCitizenName}</strong>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--text-primary)' }}>
              <Phone size={11} style={{ color: 'var(--primary-500)' }} />
              <span>{displayedCitizenPhone}</span>
            </div>
          </div>

          {/* Attached Photo Evidence */}
          {report.photoUrl && (
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                <ImageIcon size={13} style={{ color: 'var(--primary-500)' }} />
                <span>Attached Visual Evidence</span>
              </div>
              <div
                style={{
                  maxHeight: '180px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <img
                  src={report.photoUrl}
                  alt={`Evidence for report ${report.id}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* 🤖 AI Circular Economy & Segregation Advice */}
          {(() => {
            const aiInfo = findKnowledgeBaseMatch(`${report.category} ${report.description || ''} ${report.photoUrl || ''}`);
            return (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.05) 0%, rgba(2, 132, 199, 0.04) 100%)',
                  border: '1px solid rgba(5, 150, 105, 0.18)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 800, color: 'var(--primary-700)' }}>
                    <Sparkles size={13} color="var(--primary-600)" />
                    <span>AI Circular Economy & Upcycling Advice</span>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#0284c7', background: 'rgba(2, 132, 199, 0.1)', padding: '2px 6px', borderRadius: 'var(--radius-full)' }}>
                    {aiInfo.binColor}
                  </span>
                </div>
                <p style={{ margin: '0 0 6px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  <strong>Segregation Tip:</strong> {aiInfo.segregationTip}
                </p>
                {aiInfo.upcyclingIdeas?.[0] && (
                  <div style={{ fontSize: '11px', color: 'var(--primary-800)', background: 'rgba(5, 150, 105, 0.08)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', lineHeight: 1.3 }}>
                    💡 <strong>Upcycling Idea:</strong> {aiInfo.upcyclingIdeas[0]}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Sticky Footer Actions */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          {/* Quick Officer Dispatch / Resolve Actions */}
          {!isCitizen && onDispatch && report.status === 'Pending Verification' && (
            <button
              onClick={() => {
                onDispatch(report.id);
                onClose();
              }}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '11px', padding: '6px 12px' }}
            >
              <Truck size={13} />
              <span>Dispatch Truck (TRK-801)</span>
            </button>
          )}

          {!isCitizen && onResolve && report.status === 'Dispatched' && (
            <button
              onClick={() => {
                onResolve(report.id);
                onClose();
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', padding: '6px 12px', borderColor: 'var(--primary-500)', color: 'var(--primary-600)' }}
            >
              <CheckCircle2 size={13} />
              <span>Mark Resolved</span>
            </button>
          )}

          {/* Citizen / Officer Track Live Truck Button */}
          {report.assignedDriver && (
            <button
              onClick={() => setIsTracingOpen(true)}
              className="btn btn-primary btn-sm"
              style={{
                fontSize: '11px',
                padding: '6px 14px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              }}
            >
              <Navigation size={13} />
              <span>Track Live Truck Route</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '11px', padding: '6px 16px', fontWeight: 600 }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Live Route Tracing Modal */}
      <LiveRouteTracingModal
        isOpen={isTracingOpen}
        targetReport={report}
        onClose={() => setIsTracingOpen(false)}
        isDriverMode={!isCitizen}
      />
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
};
