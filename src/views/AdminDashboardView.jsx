import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { DesktopOnlyGuard } from '../components/admin/DesktopOnlyGuard';
import { MapPlaceholder } from '../components/common/MapPlaceholder';
import { FleetGisMarkers } from '../components/maps/FleetGisMarkers';
import { ReportDetailModal } from '../components/reports/ReportDetailModal';
import { LiveRouteTracingModal } from '../components/maps/LiveRouteTracingModal';
import { AUTHORIZED_DRIVERS_DATABASE } from '../lib/driverCredentials';
import {
  Shield,
  Building,
  Truck,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  FileText,
  MapPin,
  Flame,
  Layers,
  Gauge,
  Clock,
  Download,
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  Send,
  UserCheck,
  Zap,
  Activity,
  Phone,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Sliders,
  Radio,
} from 'lucide-react';

export const AdminDashboardView = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    reports,
    vehicles,
    dustbins,
    hotspots,
    citizens,
    dispatchDriverToReport,
    resolveReport,
    emptyDustbin,
    addToast,
    logoutUser,
  } = useDashboard();

  // Admin Sub-Tab: 'overview' | 'gis-map' | 'incidents' | 'fleet' | 'dustbins' | 'hotspots' | 'audit-logs'
  const adminTab = useMemo(() => {
    if (activeTab === 'gis-map') return 'gis-map';
    if (activeTab === 'incidents') return 'incidents';
    if (activeTab === 'vehicles' || activeTab === 'fleet') return 'fleet';
    if (activeTab === 'dustbins') return 'dustbins';
    if (activeTab === 'hotspots') return 'hotspots';
    if (activeTab === 'audit-logs') return 'audit-logs';
    return 'overview';
  }, [activeTab]);

  const setAdminTab = (tabId) => {
    if (tabId === 'overview') {
      setActiveTab('dashboard');
    } else if (tabId === 'fleet') {
      setActiveTab('vehicles');
    } else {
      setActiveTab(tabId);
    }
  };

  // Filters for Incidents Table
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [wardFilter, setWardFilter] = useState('All');

  // Selected items for Modals
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedTracingReport, setSelectedTracingReport] = useState(null);
  const [dispatchOverrideModal, setDispatchOverrideModal] = useState(null); // { reportId: string }
  const [overrideVehicleId, setOverrideVehicleId] = useState('TRK-AMD-801');

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        searchQuery === '' ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.citizenName || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Pending' && (r.status === 'Pending Verification' || r.status === 'Pending Driver Approval')) ||
        r.status === statusFilter;

      const matchesPriority = priorityFilter === 'All' || r.priority === priorityFilter;
      const matchesWard = wardFilter === 'All' || (r.ward || '').includes(wardFilter);

      return matchesSearch && matchesStatus && matchesPriority && matchesWard;
    });
  }, [reports, searchQuery, statusFilter, priorityFilter, wardFilter]);

  // Executive KPI Aggregations
  const totalReports = reports.length;
  const pendingReports = reports.filter((r) => r.status === 'Pending Verification' || r.status === 'Pending Driver Approval').length;
  const dispatchedReports = reports.filter((r) => r.status === 'Dispatched').length;
  const resolvedReports = reports.filter((r) => r.status === 'Resolved').length;
  const slaResolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 100;

  const activeVehiclesCount = vehicles.filter((v) => v.status === 'Active').length;
  const totalFleetCapacityTons = 84.5;
  const activeFleetPayloadTons = vehicles
    .reduce((acc, v) => acc + ((v.loadCapacityPercent || 30) * 10) / 100, 0)
    .toFixed(1);

  const criticalBins = dustbins.filter((b) => (b.fillLevel || 0) >= 80).length;
  const totalDustbinsCount = dustbins.length;

  const totalHotspotVolumeTons = hotspots
    .reduce((acc, h) => acc + parseFloat((h.predictedVolume || '3.0').replace(/[^0-9.]/g, '') || 3.0), 0)
    .toFixed(1);

  // Wards list
  const allWards = useMemo(() => {
    const wardsSet = new Set(reports.map((r) => r.ward).filter(Boolean));
    return ['All', ...Array.from(wardsSet)];
  }, [reports]);

  // Audit Logs (Chronological system history)
  const auditLogs = useMemo(() => {
    const logs = [];
    reports.forEach((r, idx) => {
      if (r.status === 'Resolved') {
        logs.push({
          id: `AUD-${idx + 100}`,
          timestamp: new Date(Date.now() - (idx * 15 + 10) * 60000).toISOString(),
          type: 'INCIDENT_RESOLVED',
          severity: 'SUCCESS',
          actor: r.assignedDriver ? `Driver (${r.assignedDriver})` : 'Municipal Field Crew',
          details: `Report #${r.id} at ${r.location} marked as Resolved. Site cleared and audited.`,
          ward: r.ward,
        });
      }
      if (r.status === 'Dispatched' || r.assignedDriver) {
        logs.push({
          id: `AUD-${idx + 300}`,
          timestamp: new Date(Date.now() - (idx * 25 + 30) * 60000).toISOString(),
          type: 'DISPATCH_CONFIRMED',
          severity: 'INFO',
          actor: 'Fleet Automated Dispatcher',
          details: `Assigned truck ${r.assignedDriver || 'TRK-801'} to Report #${r.id} (${r.category}).`,
          ward: r.ward,
        });
      }
    });
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [reports]);

  // Export CSV Audit Log
  const exportCsvLogs = () => {
    const headers = ['Audit ID', 'Timestamp', 'Event Type', 'Severity', 'Actor', 'Ward', 'Details'];
    const rows = auditLogs.map((l) => [
      l.id,
      new Date(l.timestamp).toLocaleString(),
      l.type,
      l.severity,
      l.actor,
      l.ward || 'AMC',
      `"${l.details.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amc_sanitation_audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Audit log CSV exported successfully.', 'success');
  };

  // Force Dispatch Handler
  const handleForceDispatch = (reportId, vehicleId) => {
    dispatchDriverToReport(reportId, vehicleId);
    setDispatchOverrideModal(null);
    addToast(`⚡ Command Override: Force-dispatched ${vehicleId} to Report #${reportId}!`, 'success');
  };

  return (
    <DesktopOnlyGuard>
      <div className="animate-fade-in-up" style={{ paddingBottom: '40px' }}>
        {/* 1. Municipal Executive Header Banner */}
        <div
          className="glass-card"
          style={{
            padding: '20px 24px',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(8, 47, 73, 0.9))',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0ea5e9, #0369a1)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)',
                }}
              >
                🏛️
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.3px' }}>
                    Ahmedabad Municipal Corporation (AMC) Command Center
                  </h2>
                  <span
                    className="badge"
                    style={{
                      background: 'rgba(14, 165, 233, 0.2)',
                      color: '#38bdf8',
                      border: '1px solid rgba(14, 165, 233, 0.4)',
                      fontWeight: 800,
                      fontSize: '10px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Executive Level 5
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0 0' }}>
                  Logged in as <strong>{currentUser?.name || 'Municipal Commissioner'}</strong> ({currentUser?.designation || 'Director of Solid Waste'}) • Danapith HQ
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={exportCsvLogs}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}
              >
                <Download size={14} />
                <span>Export Audit CSV</span>
              </button>

              <button
                onClick={logoutUser}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                <span>Exit Portal</span>
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '18px',
              paddingTop: '14px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              overflowX: 'auto',
            }}
          >
            {[
              { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
              { id: 'gis-map', label: 'Live City GIS Map', icon: Layers },
              { id: 'incidents', label: `Incident Tickets (${pendingReports + dispatchedReports})`, icon: FileText },
              { id: 'fleet', label: `Municipal Fleet (${vehicles.length})`, icon: Truck },
              { id: 'dustbins', label: `Smart IoT Bins (${dustbins.length})`, icon: Trash2 },
              { id: 'hotspots', label: `AI ML Hotspots (${hotspots.length})`, icon: Flame },
              { id: 'audit-logs', label: 'Municipal Audit Logs', icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = adminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? '#0ea5e9' : 'rgba(255, 255, 255, 0.06)',
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Executive Overview Tab */}
        {adminTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* KPI Metric Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '14px',
              }}
            >
              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    SLA Resolution Rate
                  </span>
                  <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '8px' }}>
                  {slaResolutionRate}%
                </div>
                <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>
                  {resolvedReports} of {totalReports} tickets completed
                </div>
              </div>

              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Active Compactor Fleet
                  </span>
                  <Truck size={18} style={{ color: '#0ea5e9' }} />
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '8px' }}>
                  {activeVehiclesCount} / {vehicles.length} Active
                </div>
                <div style={{ fontSize: '11px', color: '#0ea5e9', marginTop: '4px' }}>
                  {activeFleetPayloadTons} Tons current mobile payload
                </div>
              </div>

              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Critical Smart Bins
                  </span>
                  <Trash2 size={18} style={{ color: criticalBins > 0 ? '#ef4444' : '#10b981' }} />
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: criticalBins > 0 ? '#ef4444' : 'var(--text-primary)', marginTop: '8px' }}>
                  {criticalBins} Critical
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Across {totalDustbinsCount} IoT sensor points
                </div>
              </div>

              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    AI Waste Surge Volume
                  </span>
                  <Flame size={18} style={{ color: '#f59e0b' }} />
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '8px' }}>
                  {totalHotspotVolumeTons} Tons
                </div>
                <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px' }}>
                  Predicted across {hotspots.length} high-density zones
                </div>
              </div>
            </div>

            {/* Quick Master Map Preview + Emergency Dispatch Stream */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Map Preview */}
              <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="card-header" style={{ padding: '14px 18px' }}>
                  <div>
                    <h3 className="card-title">
                      <Layers size={16} style={{ color: '#0ea5e9' }} />
                      City-Wide GIS Operations Grid
                    </h3>
                    <p className="card-subtitle">Ahmedabad Municipal Sanitation Network Real-Time Status</p>
                  </div>
                  <button onClick={() => setAdminTab('gis-map')} className="btn btn-secondary btn-sm" style={{ fontSize: '11px' }}>
                    Full Map View
                  </button>
                </div>

                <div style={{ height: '340px' }}>
                  <MapPlaceholder
                    center={[23.0350, 72.5750]}
                    zoom={12}
                    title="Ahmedabad Sanitation Operations"
                    activeItemsCount={vehicles.length + dustbins.length + reports.length}
                    itemType="Fleet, Bins & Incidents"
                  >
                    <FleetGisMarkers
                      vehicles={vehicles}
                      reports={reports}
                      hotspots={hotspots}
                      dustbins={dustbins}
                      showHotspots={true}
                      showRoutes={true}
                      showDustbins={true}
                    />
                  </MapPlaceholder>
                </div>
              </div>

              {/* Real-time Pending Tickets Requiring Dispatch / Action */}
              <div className="glass-card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">
                      <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
                      High-Priority Unresolved Incidents
                    </h3>
                    <p className="card-subtitle">{pendingReports + dispatchedReports} active field tickets</p>
                  </div>
                  <button onClick={() => setAdminTab('incidents')} className="btn btn-secondary btn-sm" style={{ fontSize: '11px' }}>
                    View All
                  </button>
                </div>

                <div className="card-body" style={{ padding: '12px', maxHeight: '340px', overflowY: 'auto' }}>
                  {reports.filter((r) => r.status !== 'Resolved').length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
                      <CheckCircle2 size={32} style={{ color: '#10b981', margin: '0 auto 8px auto' }} />
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>All Incidents Resolved</div>
                      <div style={{ fontSize: '11px' }}>No active unresolved citizen complaints in queue.</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {reports
                        .filter((r) => r.status !== 'Resolved')
                        .slice(0, 5)
                        .map((rep) => (
                          <div
                            key={rep.id}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              background: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-subtle)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                                  #{rep.id}
                                </span>
                                <span
                                  className={`badge ${rep.priority === 'Critical' ? 'badge-high' : 'badge-neutral'}`}
                                  style={{ fontSize: '9px', padding: '1px 6px' }}
                                >
                                  {rep.priority}
                                </span>
                              </div>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                                {rep.category}
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                📍 {rep.location}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setDispatchOverrideModal({ reportId: rep.id, report: rep });
                              }}
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '11px', padding: '4px 10px' }}
                            >
                              Dispatch
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Live City GIS Master Map Tab */}
        {adminTab === 'gis-map' && (
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="card-header" style={{ padding: '14px 20px' }}>
              <div>
                <h3 className="card-title">
                  <Layers size={18} style={{ color: '#0ea5e9' }} />
                  Ahmedabad Municipal Corporation Full GIS Master Command
                </h3>
                <p className="card-subtitle">
                  Live satellite tracking of all 10 compactor trucks, smart dustbins, reported incidents, and ML waste zones
                </p>
              </div>
            </div>

            <div style={{ height: '580px' }}>
              <MapPlaceholder
                center={[23.0350, 72.5750]}
                zoom={13}
                title="Full Municipal GIS Operations"
                activeItemsCount={vehicles.length + dustbins.length + reports.length}
                itemType="Active GIS Nodes"
              >
                <FleetGisMarkers
                  vehicles={vehicles}
                  reports={reports}
                  hotspots={hotspots}
                  dustbins={dustbins}
                  showHotspots={true}
                  showRoutes={true}
                  showDustbins={true}
                  onSelectReport={(r) => setSelectedReport(r)}
                  onDispatch={(rId) => setDispatchOverrideModal({ reportId: rId, report: reports.find((r) => r.id === rId) })}
                  onResolve={(rId) => resolveReport(rId)}
                />
              </MapPlaceholder>
            </div>
          </div>
        )}

        {/* 4. Incident Management & Force Dispatch Override Matrix */}
        {adminTab === 'incidents' && (
          <div className="glass-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <FileText size={18} style={{ color: '#0ea5e9' }} />
                  Municipal Incidents & Community Tickets
                </h3>
                <p className="card-subtitle">Manage, audit, and force-dispatch municipal trucks to reported incidents</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-active">{filteredReports.length} Shown</span>
              </div>
            </div>

            {/* Filter Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 18px',
                background: 'var(--bg-surface-elevated)',
                borderBottom: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
              }}
            >
              {/* Search */}
              <div style={{ position: 'relative', minWidth: '220px', flex: '1' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by ID, Category, Location, Citizen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 32px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Resolved">Resolved</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                }}
              >
                <option value="All">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              {/* Ward Filter */}
              <select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                }}
              >
                {allWards.map((w) => (
                  <option key={w} value={w}>
                    {w === 'All' ? 'All Wards' : w}
                  </option>
                ))}
              </select>
            </div>

            {/* Incidents Data Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--text-muted)' }}>Ticket ID</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--text-muted)' }}>Category</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--text-muted)' }}>Location / Ward</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--text-muted)' }}>Citizen Reporter</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--text-muted)' }}>Priority</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--text-muted)' }}>Assigned Fleet</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--text-muted)', textAlign: 'right' }}>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No incident tickets match current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((rep) => (
                      <tr
                        key={rep.id}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary-600)' }}>
                          #{rep.id}
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {rep.category}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                          <div>{rep.location}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{rep.ward}</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rep.citizenName || 'Resident'}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{rep.citizenPhone || '—'}</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span className={`badge ${rep.priority === 'Critical' ? 'badge-high' : rep.priority === 'High' ? 'badge-medium' : 'badge-neutral'}`} style={{ fontSize: '10px' }}>
                            {rep.priority}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: rep.status === 'Resolved' ? '#10b981' : rep.status === 'Dispatched' ? '#0ea5e9' : '#f59e0b',
                            }}
                          >
                            {rep.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          {rep.assignedDriver ? (
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0ea5e9' }}>
                              🚛 {rep.assignedDriver}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Unassigned</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => setSelectedReport(rep)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '11px', padding: '3px 8px' }}
                            >
                              Details
                            </button>

                            {rep.assignedDriver && (
                              <button
                                onClick={() => setSelectedTracingReport(rep)}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '11px', padding: '3px 8px', color: '#0ea5e9', borderColor: 'rgba(14, 165, 233, 0.3)' }}
                              >
                                Track GPS
                              </button>
                            )}

                            {rep.status !== 'Resolved' && (
                              <button
                                onClick={() => setDispatchOverrideModal({ reportId: rep.id, report: rep })}
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: '11px', padding: '3px 8px' }}
                              >
                                Override Dispatch
                              </button>
                            )}

                            {rep.status === 'Dispatched' && (
                              <button
                                onClick={() => resolveReport(rep.id)}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '11px', padding: '3px 8px', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                              >
                                Mark Resolved
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Municipal Fleet & Drivers Management Tab */}
        {adminTab === 'fleet' && (
          <div className="glass-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Truck size={18} style={{ color: '#0ea5e9' }} />
                  Municipal Compactor Fleet & Certified Crew Directory
                </h3>
                <p className="card-subtitle">Real-time transponders, battery/fuel levels, and driver shift assignments</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', padding: '16px' }}>
              {vehicles.map((v) => {
                const isMoving = v.status === 'Active' && (v.speed || 0) > 0;
                return (
                  <div
                    key={v.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: v.status === 'Active' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                            color: v.status === 'Active' ? '#0ea5e9' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                          }}
                        >
                          🚛
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-primary)' }}>
                            {v.id} ({v.plateNumber})
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {v.type || 'Hydraulic Compactor'}
                          </div>
                        </div>
                      </div>

                      <span
                        className="badge"
                        style={{
                          background: v.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                          color: v.status === 'Active' ? '#10b981' : '#94a3b8',
                          fontWeight: 800,
                          fontSize: '10px',
                        }}
                      >
                        {v.status} {isMoving ? '• In Transit' : '• Stationary'}
                      </span>
                    </div>

                    {/* Driver info */}
                    <div
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <strong>Driver:</strong> {v.driverName} ({v.driverBadge || 'DRV-801'})
                      </div>
                      {v.driverPhone && (
                        <a href={`tel:${v.driverPhone}`} style={{ color: 'var(--primary-600)', textDecoration: 'none', fontWeight: 700 }}>
                          📞 {v.driverPhone}
                        </a>
                      )}
                    </div>

                    {/* Telemetry gauges */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', fontSize: '11px' }}>
                      <div style={{ background: 'var(--bg-surface)', padding: '6px', borderRadius: '6px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '9.5px' }}>Speed</div>
                        <div style={{ fontWeight: 800, color: '#0ea5e9' }}>{v.speed || 0} km/h</div>
                      </div>
                      <div style={{ background: 'var(--bg-surface)', padding: '6px', borderRadius: '6px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '9.5px' }}>Payload</div>
                        <div style={{ fontWeight: 800, color: '#a855f7' }}>{v.loadCapacityPercent || 35}%</div>
                      </div>
                      <div style={{ background: 'var(--bg-surface)', padding: '6px', borderRadius: '6px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '9.5px' }}>Fuel / Battery</div>
                        <div style={{ fontWeight: 800, color: '#10b981' }}>{v.batteryOrFuel || 85}%</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                      <strong>Route:</strong> {v.assignedRoute}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Smart IoT Dustbin Network Tab */}
        {adminTab === 'dustbins' && (
          <div className="glass-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Trash2 size={18} style={{ color: '#0ea5e9' }} />
                  Public Smart Dustbin IoT Telemetry & Fill Levels
                </h3>
                <p className="card-subtitle">Real-time ultrasonic fill sensors, battery levels, and emergency collection triggers</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', padding: '16px' }}>
              {dustbins.map((bin) => {
                const isCritical = (bin.fillLevel || 0) >= 80;
                const isModerate = (bin.fillLevel || 0) >= 50 && (bin.fillLevel || 0) < 80;
                const color = isCritical ? '#ef4444' : isModerate ? '#f59e0b' : '#10b981';

                return (
                  <div
                    key={bin.id}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      background: 'var(--bg-surface-elevated)',
                      border: `1px solid ${isCritical ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '10.5px', fontFamily: 'monospace', fontWeight: 800, color: 'var(--text-muted)' }}>
                        {bin.id}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color,
                          background: `${color}18`,
                          padding: '2px 7px',
                          borderRadius: '99px',
                        }}
                      >
                        {bin.fillLevel}% Full
                      </span>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-primary)' }}>
                      {bin.name}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      📍 {bin.ward}
                    </div>

                    {/* Fill Level Bar */}
                    <div style={{ width: '100%', height: '6px', background: 'var(--border-subtle)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${bin.fillLevel}%`, height: '100%', background: color }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <span>🔋 Battery: {bin.batteryLevel || 95}%</span>
                      <span>Odour: {bin.odourLevel || 'Low'}</span>
                    </div>

                    <button
                      onClick={() => {
                        emptyDustbin(bin.id);
                        addToast(`🧹 Emergency reset triggered for ${bin.name}. Fill sensor calibrated to 0%.`, 'success');
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', fontSize: '11px', marginTop: '4px' }}
                    >
                      Trigger Emergency Emptied Reset
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. AI ML Hotspots Tab */}
        {adminTab === 'hotspots' && (
          <div className="glass-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Flame size={18} style={{ color: '#f59e0b' }} />
                  AI Waste Surge Prediction & Risk Corridors
                </h3>
                <p className="card-subtitle">Predictive models forecast waste overflow based on footfall, events, and historical seasonality</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', padding: '16px' }}>
              {hotspots.map((h) => {
                const isHigh = h.riskLevel === 'High' || h.riskLevel === 'Critical';
                return (
                  <div
                    key={h.zoneId}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      background: 'var(--bg-surface-elevated)',
                      border: `1px solid ${isHigh ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '11px', color: 'var(--text-muted)' }}>
                        {h.zoneId}
                      </span>
                      <span
                        className="badge"
                        style={{
                          background: isHigh ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: isHigh ? '#ef4444' : '#f59e0b',
                          fontWeight: 800,
                        }}
                      >
                        {h.riskLevel} Risk ({h.confidenceScore || 85}%)
                      </span>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-primary)' }}>
                      {h.zoneName}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      📍 {h.ward} • Radius: {h.radiusMeters || 400}m
                    </div>

                    <div style={{ fontSize: '11px', background: 'var(--bg-surface)', padding: '8px', borderRadius: '6px', color: 'var(--text-secondary)' }}>
                      <strong>AI Anomaly:</strong> {h.primaryAnomaly}
                    </div>

                    <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                      💡 Recommended Action: {h.suggestedAction}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 8. Municipal Audit Logs Tab */}
        {adminTab === 'audit-logs' && (
          <div className="glass-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Activity size={18} style={{ color: '#0ea5e9' }} />
                  Municipal Security & Incident Dispatch Audit Log
                </h3>
                <p className="card-subtitle">Tamper-evident timestamped system logs for regulatory and municipal governance audit</p>
              </div>
              <button onClick={exportCsvLogs} className="btn btn-secondary btn-sm" style={{ fontSize: '11px' }}>
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--text-muted)' }}>Audit Log ID</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--text-muted)' }}>Timestamp</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--text-muted)' }}>Event Type</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--text-muted)' }}>Actor</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--text-muted)' }}>Ward</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--text-muted)' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#0ea5e9' }}>
                        {log.id}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span
                          className="badge"
                          style={{
                            background: log.severity === 'SUCCESS' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(14, 165, 233, 0.15)',
                            color: log.severity === 'SUCCESS' ? '#10b981' : '#0ea5e9',
                            fontSize: '9.5px',
                            fontWeight: 700,
                          }}
                        >
                          {log.type}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {log.actor}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                        {log.ward || 'AMC Central'}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dispatch Override Modal */}
        {dispatchOverrideModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(6px)',
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
            onClick={() => setDispatchOverrideModal(null)}
          >
            <div
              className="glass-card animate-scale-in"
              style={{
                maxWidth: '460px',
                width: '100%',
                background: '#0f172a',
                border: '1px solid rgba(14, 165, 233, 0.4)',
                borderRadius: '14px',
                padding: '22px',
                color: '#ffffff',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px 0' }}>
                ⚡ Manual Compactor Force-Dispatch Override
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 16px 0' }}>
                Override default proximity routing and assign a specific municipal truck to Report #{dispatchOverrideModal.reportId}.
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Select Municipal Fleet Truck
                </label>
                <select
                  value={overrideVehicleId}
                  onChange={(e) => setOverrideVehicleId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    background: '#1e293b',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.id} — {v.driverName} ({v.type || 'Compactor'}) • {v.plateNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                <button onClick={() => setDispatchOverrideModal(null)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button
                  onClick={() => handleForceDispatch(dispatchOverrideModal.reportId, overrideVehicleId)}
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 800 }}
                >
                  Confirm Force Dispatch
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report Detail Modal */}
        <ReportDetailModal
          report={selectedReport}
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          onDispatch={(rId) => setDispatchOverrideModal({ reportId: rId, report: selectedReport })}
          onResolve={(rId) => resolveReport(rId)}
          isCitizen={false}
        />

        {/* Live Truck GPS Tracing Modal */}
        <LiveRouteTracingModal
          isOpen={!!selectedTracingReport}
          targetReport={selectedTracingReport}
          onClose={() => setSelectedTracingReport(null)}
          isDriverMode={true}
        />
      </div>
    </DesktopOnlyGuard>
  );
};
