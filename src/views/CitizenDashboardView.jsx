import React, { useState } from 'react';
import { useDashboard, resolveDriverDetails } from '../context/DashboardContext';
import { SkeletonCard, SkeletonList } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { MapPlaceholder } from '../components/common/MapPlaceholder';
import { FleetGisMarkers } from '../components/maps/FleetGisMarkers';
import { ReportDetailModal } from '../components/reports/ReportDetailModal';
import { LiveRouteTracingModal } from '../components/maps/LiveRouteTracingModal';
import { AiWasteAnalyzerModal } from '../components/citizen/AiWasteAnalyzerModal';
import {
  FileText,
  CheckCircle2,
  Award,
  Sparkles,
  MapPin,
  Calendar,
  PlusCircle,
  AlertCircle,
  Leaf,
  Layers,
  Flame,
  Clock,
  ChevronRight,
  Trash2,
  Navigation,
  Compass,
  Truck,
  Phone,
  Users,
} from 'lucide-react';

export const CitizenDashboardView = () => {
  const {
    reports,
    vehicles,
    hotspots,
    dustbins,
    userLocation,
    locateNearestDustbin,
    activeDustbinRoute,
    setActiveDustbinRoute,
    selectedDustbin,
    setSelectedDustbin,
    currentUser,
    communityQuests = [],
    userKarmaPoints = 0,
    setActiveTab,
    isLoadingSkeleton,
    addToast,
  } = useDashboard();

  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedTrackingReport, setSelectedTrackingReport] = useState(null);
  const [isAiAnalyzerOpen, setIsAiAnalyzerOpen] = useState(false);

  // Filter strictly to only this authenticated citizen's email
  const myReports = reports.filter((r) => {
    if (!currentUser?.email) return false;
    return (
      r.citizenEmail &&
      r.citizenEmail.toLowerCase() === currentUser.email.toLowerCase()
    );
  });

  const resolvedCount = myReports.filter((r) => r.status === 'Resolved').length;

  const handleQuickLocateBin = () => {
    const nearest = locateNearestDustbin();
    if (nearest) {
      addToast(`Closest smart bin: ${nearest.name} (~${nearest.walkMins}m walk)`, 'success');
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* 1. Citizen Welcome & Status Banner */}
      <div
        className="glass-card"
        style={{
          padding: '18px 22px',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.06) 0%, var(--bg-surface) 100%)',
          borderColor: 'rgba(5, 150, 105, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'var(--primary-500)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px var(--primary-glow)',
                flexShrink: 0,
              }}
            >
              <Leaf size={22} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Welcome, {currentUser?.name || 'Citizen Partner'}!
                </h2>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Report municipal waste anomalies, track resolution stages & earn community eco karma points.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('reports')}
              className="btn btn-primary btn-sm"
              id="citizen-report-cta"
            >
              <PlusCircle size={14} />
              <span>Report Waste Issue</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🤖 KNOW YOUR WASTE HERO CARD */}
      <div
        className="glass-card animate-fade-in"
        style={{
          marginBottom: '20px',
          padding: '18px 22px',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(2, 132, 199, 0.06) 50%, var(--bg-surface) 100%)',
          border: '1.5px solid rgba(5, 150, 105, 0.25)',
          boxShadow: '0 8px 25px rgba(5, 150, 105, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', maxWidth: '640px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--primary-500) 0%, #0284c7 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
              flexShrink: 0,
            }}
          >
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Know Your Waste
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
              Send a photo of any household or street waste item to instantly discover its proper municipal segregation bin, creative DIY reuse/upcycling projects & carbon emissions avoided.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAiAnalyzerOpen(true)}
          className="btn btn-primary"
          id="hero-open-ai-scanner-btn"
          style={{
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px var(--primary-glow)',
          }}
        >
          <Sparkles size={16} />
          <span>Scan Waste Photo Now</span>
        </button>
      </div>

      {/* 🌟 COMMUNITY CLEANLINESS QUESTS BANNER */}
      <div
        className="glass-card animate-fade-in"
        style={{
          marginBottom: '20px',
          padding: '16px 20px',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(5, 150, 105, 0.06) 100%)',
          border: '1.5px solid rgba(14, 165, 233, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '620px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--primary-500) 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
              flexShrink: 0,
            }}
          >
            <Users size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Community Cleanliness Quests & Plog Drives
              </h3>
              <span className="badge badge-active" style={{ fontSize: '10px' }}>
                {communityQuests.length} Active Drives
              </span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.4 }}>
              Meet nearby residents on scheduled dates, clean lakefronts & markets, and earn +50 Karma rewards. (100+ Karma required to organize).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('quests')}
          className="btn btn-secondary"
          style={{
            padding: '8px 16px',
            fontWeight: 700,
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Users size={14} />
          <span>Browse Quests</span>
        </button>
      </div>

      {/* 2. Citizen KPI Metrics */}
      <div className="metrics-grid">
        {isLoadingSkeleton ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* KPI 1 */}
            <div className="metric-card stagger-1" style={{ '--card-accent': 'var(--primary-500)' }}>
              <div className="metric-header">
                <div className="metric-icon-wrap" style={{ color: 'var(--primary-600)' }}>
                  <FileText size={20} />
                </div>
              </div>
              <div className="metric-value">{myReports.length}</div>
              <div className="metric-label">My Reports Submitted</div>
              <div className="metric-subtext">
                <span>Active tickets in queue</span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="metric-card stagger-2" style={{ '--card-accent': 'var(--accent-cyan)' }}>
              <div className="metric-header">
                <div className="metric-icon-wrap" style={{ color: 'var(--accent-cyan)' }}>
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="metric-value">{resolvedCount}</div>
              <div className="metric-label">Resolved Issues</div>
              <div className="metric-subtext">
                <span>Verified cleanups</span>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="metric-card stagger-3" style={{ '--card-accent': 'var(--accent-amber)' }}>
              <div className="metric-header">
                <div className="metric-icon-wrap" style={{ color: 'var(--accent-amber)' }}>
                  <Award size={20} />
                </div>
              </div>
              <div className="metric-value">{userKarmaPoints} pts</div>
              <div className="metric-label">My Eco Karma Points</div>
              <div className="metric-subtext">
                <span>{userKarmaPoints >= 100 ? '⭐ Quest Organizer Unlocked' : `${100 - userKarmaPoints} more to organize`}</span>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="metric-card stagger-4" style={{ '--card-accent': 'var(--accent-violet)' }}>
              <div className="metric-header">
                <div className="metric-icon-wrap" style={{ color: 'var(--accent-violet)' }}>
                  <Sparkles size={20} />
                </div>
              </div>
              <div className="metric-value">— %</div>
              <div className="metric-label">Ward Cleanliness Index</div>
              <div className="metric-subtext">
                <span>Sanitation index</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 🚨 LIVE DISPATCHED DRIVER TRACKING BANNER FOR CITIZEN */}
      {myReports.filter((r) => r.status === 'Dispatched').length > 0 && (
        <div
          className="glass-card animate-slide-down"
          style={{
            marginBottom: '20px',
            border: '2px solid var(--accent-cyan)',
            background: 'rgba(14, 165, 233, 0.06)',
            boxShadow: '0 8px 30px rgba(14, 165, 233, 0.15)',
          }}
        >
          <div className="card-header" style={{ borderBottomColor: 'rgba(14, 165, 233, 0.2)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🚚</span>
                <h3 className="card-title" style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>
                  Municipal Driver Dispatched to Your Report ({myReports.filter((r) => r.status === 'Dispatched').length})
                </h3>
              </div>
              <p className="card-subtitle">
                A certified sanitation driver has accepted your report and is currently en route for site clearance.
              </p>
            </div>
            <span className="badge" style={{ background: 'rgba(14, 165, 233, 0.2)', color: 'var(--accent-cyan)', fontWeight: 800 }}>
              Live En Route
            </span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myReports.filter((r) => r.status === 'Dispatched').map((rep) => {
              const driverInfo = resolveDriverDetails(rep.assignedDriver, vehicles);
              return (
                <div
                  key={rep.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '540px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary-600)' }}>
                        #{rep.id}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '11px', fontWeight: 600 }}>
                        {rep.category}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                        📍 {rep.location}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap',
                        background: 'var(--bg-surface-elevated)',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--primary-600)' }}>
                        <Truck size={14} />
                        <span>Driver: {driverInfo?.name || rep.assignedDriver}</span>
                        {driverInfo?.badgeId && <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{driverInfo.badgeId}</span>}
                      </div>

                      <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                        <span>🚛 Truck: {driverInfo?.vehiclePlate || 'GJ-01-CZ-4821'}</span>
                      </div>

                      {driverInfo?.phone && (
                        <a
                          href={`tel:${driverInfo.phone}`}
                          style={{
                            color: 'var(--primary-600)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            textDecoration: 'none',
                            fontWeight: 700,
                          }}
                        >
                          <Phone size={12} />
                          <span>{driverInfo.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => setSelectedTrackingReport(rep)}
                      className="btn btn-primary btn-sm"
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                        boxShadow: '0 2px 10px rgba(14, 165, 233, 0.35)',
                      }}
                    >
                      <Navigation size={13} />
                      <span>Track Live Truck Route</span>
                    </button>
                    <button
                      onClick={() => setSelectedReport(rep)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '12px', fontWeight: 700 }}
                    >
                      Ticket Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Quick Action Hub for Common Waste Issues */}
      <div className="glass-card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <PlusCircle size={18} style={{ color: 'var(--primary-500)' }} />
              Quick Issue Reporting Shortcuts
            </h3>
            <p className="card-subtitle">Select an issue type to immediately geotag and submit evidence</p>
          </div>
        </div>

        <div className="card-body">
          <div className="shortcuts-grid">
            {[
              { label: 'Overflowing Bin', desc: 'Street bin exceeding capacity', icon: Layers, color: 'var(--primary-500)' },
              { label: 'Illegal Dumping', desc: 'Unauthorized roadside waste pile', icon: AlertCircle, color: 'var(--accent-rose)' },
              { label: 'Missed Pickup', desc: 'Scheduled collection truck skipped', icon: Clock, color: 'var(--accent-amber)' },
              { label: 'Hazardous Waste', desc: 'Chemical, battery or industrial spill', icon: Flame, color: 'var(--accent-violet)' },
            ].map((shortcut, idx) => {
              const Icon = shortcut.icon;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveTab('reports')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = shortcut.color;
                    e.currentTarget.style.background = 'var(--bg-surface)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.background = 'var(--bg-surface-elevated)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon size={15} style={{ color: shortcut.color }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {shortcut.label}
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                    {shortcut.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Two Column Layout: My Reports Tracker + Ward Schedule Map */}
      <div className="two-col-grid">
        {/* Left: My Active Reports Tracker */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <FileText size={18} style={{ color: 'var(--primary-500)' }} />
                My Incident Reports & Live Resolution Stages
              </h3>
              <p className="card-subtitle">Status updates from municipal triage to field cleanup</p>
            </div>
            <span className="badge badge-active">{myReports.length} Reports</span>
          </div>

          <div className="card-body">
            {isLoadingSkeleton ? (
              <SkeletonList count={3} />
            ) : myReports.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No Active Reports"
                description="You haven't submitted any waste reports yet. Notice an overflowing bin or illegal dumping in your street?"
                actionLabel="Submit First Report"
                onAction={() => setActiveTab('reports')}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {myReports.map((rep) => (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary-500)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {/* Top Row: Request ID & Live Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--primary-600)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                          #{rep.id}
                        </span>
                        <span className="badge badge-neutral" style={{ fontSize: '10px', fontWeight: 600, whiteSpace: 'nowrap' }}>{rep.category}</span>
                      </div>
                      <span
                        className={`badge ${
                          rep.status === 'Resolved'
                            ? 'badge-active'
                            : rep.status === 'Dispatched'
                            ? 'badge-resolved'
                            : rep.status === 'Pending Driver Approval'
                            ? 'badge-pending'
                            : 'badge-neutral'
                        }`}
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          background: rep.status === 'Pending Driver Approval' ? 'rgba(245, 158, 11, 0.15)' : undefined,
                          color: rep.status === 'Pending Driver Approval' ? 'var(--accent-amber)' : undefined,
                          borderColor: rep.status === 'Pending Driver Approval' ? 'rgba(245, 158, 11, 0.4)' : undefined,
                        }}
                      >
                        {rep.status === 'Pending Driver Approval' ? '⏳ Awaiting Driver Confirmation' : rep.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '6px', wordBreak: 'break-word' }}>
                      <MapPin size={13} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontWeight: 500, lineHeight: 1.3 }}>{rep.location}</span>
                    </div>

                    {rep.description && (
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, margin: '0 0 8px', wordBreak: 'break-word' }}>
                        {rep.description}
                      </p>
                    )}

                    {/* Timeline Stages & View Details button */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '6px',
                        marginTop: '8px',
                        paddingTop: '10px',
                        borderTop: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexWrap: 'wrap' }}>
                        {[
                          { label: 'Submitted', active: true },
                          { label: 'Triage', active: true },
                          { label: 'Dispatched', active: rep.status === 'Dispatched' || rep.status === 'Resolved' },
                          { label: 'Resolved', active: rep.status === 'Resolved' },
                        ].map((step, sIdx) => (
                          <React.Fragment key={sIdx}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '10px',
                                fontWeight: step.active ? 700 : 500,
                                color: step.active ? 'var(--text-primary)' : 'var(--text-muted)',
                              }}
                              title={step.label}
                            >
                              <div
                                style={{
                                  width: '7px',
                                  height: '7px',
                                  borderRadius: '50%',
                                  background: step.active ? 'var(--primary-500)' : 'var(--border-medium)',
                                  flexShrink: 0,
                                }}
                              />
                              <span style={{ whiteSpace: 'nowrap' }}>{step.label}</span>
                            </div>
                            {sIdx < 3 && (
                              <div
                                style={{
                                  width: '8px',
                                  height: '2px',
                                  background: step.active ? 'var(--primary-500)' : 'var(--border-subtle)',
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--primary-600)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          marginLeft: 'auto',
                        }}
                      >
                        Details <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Ward Sanitation Schedule & Map */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Calendar size={18} style={{ color: 'var(--accent-cyan)' }} />
                Ahmedabad Sanitation Network
              </h3>
              <p className="card-subtitle">Live fleet tracking and citizen community reports</p>
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {isLoadingSkeleton ? (
              <SkeletonCard />
            ) : (
              <MapPlaceholder
                center={[23.0338, 72.5607]}
                zoom={13}
                title="Ahmedabad Sanitation Network"
                activeItemsCount={(vehicles?.length || 0) + (hotspots?.length || 0) + myReports.length}
                itemType="Trucks, Hotspots & Issues"
                emptyMessage="Ready to stream scheduled ward collection routes and public smart bin locations."
              >
                <FleetGisMarkers
                  vehicles={vehicles}
                  reports={myReports}
                  hotspots={hotspots}
                  dustbins={dustbins}
                  userLocation={userLocation}
                  activeDustbinRoute={activeDustbinRoute}
                  selectedDustbinId={selectedDustbin?.id}
                  showHotspots={true}
                  showRoutes={true}
                  showDustbins={true}
                  onSelectReport={setSelectedReport}
                  onSelectDustbin={(bin) => setSelectedDustbin(bin)}
                  onRouteToDustbin={(bin) => {
                    setSelectedDustbin(bin);
                    if (userLocation && bin.coordinates) {
                      setActiveDustbinRoute([
                        [userLocation.lat, userLocation.lng],
                        [bin.coordinates.lat, bin.coordinates.lng],
                      ]);
                      addToast(`🚶 Walking route mapped to ${bin.name}!`, 'info');
                    }
                  }}
                  onReportDustbinIssue={(bin) => {
                    setActiveTab('reports');
                    addToast(`Pre-filled report for ${bin.name} (${bin.id})`, 'info');
                  }}
                />
              </MapPlaceholder>
            )}

            {/* GIS Layer Legend */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', padding: '10px 16px', background: 'var(--bg-surface-elevated)', borderTop: '1px solid var(--border-subtle)', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  <span style={{ fontSize: '13px' }}>🚛</span> Live Trucks ({vehicles.length})
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-rose)', fontWeight: 600 }}>
                  <span style={{ fontSize: '13px' }}>🔥</span> Hotspot Zone
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary-600)', fontWeight: 600 }}>
                  <span style={{ fontSize: '13px' }}>🗑️</span> Smart Dustbins ({dustbins.length})
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontWeight: 600 }}>
                  <span style={{ fontSize: '13px' }}>📍</span> You
                </span>
              </div>
              <button
                onClick={() => setActiveTab('dustbins')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-600)',
                  fontWeight: 700,
                  fontSize: '11px',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Explore All Bins &rarr;
              </button>
            </div>

            {/* Schedule Highlights */}
            <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--primary-600)', fontWeight: 700 }}>
                    Morning Organic Pickup
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    07:00 AM – 09:30 AM
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Daily (Mon – Sat)</div>
                </div>

                <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    Dry Recyclables
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    02:00 PM – 04:30 PM
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Tue, Thu, Sat</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Detail Interactive Popup */}
      <ReportDetailModal
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        isCitizen={true}
      />

      {/* Live Real-Time Truck & Route Tracing Modal */}
      <LiveRouteTracingModal
        isOpen={!!selectedTrackingReport}
        targetReport={selectedTrackingReport}
        onClose={() => setSelectedTrackingReport(null)}
        isDriverMode={false}
      />

      {/* 🤖 AI Gemini Waste Scanner & Upcycling Suggestions Modal */}
      <AiWasteAnalyzerModal
        isOpen={isAiAnalyzerOpen}
        onClose={() => setIsAiAnalyzerOpen(false)}
      />
    </div>
  );
};
