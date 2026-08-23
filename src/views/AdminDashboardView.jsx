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
  Users,
  Award,
  Recycle,
  Scale,
  Sparkles,
  TrendingUp,
  Cpu,
  Check,
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
    communityQuests = [],
    dispatchDriverToReport,
    resolveReport,
    emptyDustbin,
    addToast,
    logoutUser,
  } = useDashboard();

  // Admin Persona Identification
  const adminId = currentUser?.id || 'ADM-AMC-001';
  const isSuperAdmin = adminId === 'ADM-AMC-001'; // Municipal Commissioner
  const isSanitationDirector = adminId === 'ADM-AMC-002'; // Director of Solid Waste Management
  const isOperationsChief = adminId === 'ADM-AMC-003'; // Chief Fleet Operations Officer

  // Admin Sub-Tabs based on persona
  const adminTab = useMemo(() => {
    if (activeTab === 'gis-map') return 'gis-map';
    if (activeTab === 'incidents') return 'incidents';
    if (activeTab === 'vehicles' || activeTab === 'fleet') return 'fleet';
    if (activeTab === 'dustbins') return 'dustbins';
    if (activeTab === 'hotspots') return 'hotspots';
    if (activeTab === 'audit-logs') return 'audit-logs';
    if (activeTab === 'ward-rankings') return 'ward-rankings';
    if (activeTab === 'directives') return 'directives';
    if (activeTab === 'officers') return 'officers';
    if (activeTab === 'quests-approval') return 'quests-approval';
    if (activeTab === 'mrf') return 'mrf';
    if (activeTab === 'dispatch-overrides') return 'dispatch-overrides';
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

  // State for Directives
  const [activeDirectives, setActiveDirectives] = useState({
    monsoon: true,
    diwali: false,
    vipCorridor: true,
  });

  // State for Quests Approved by Sanitation Director
  const [approvedQuestGrants, setApprovedQuestGrants] = useState(new Set(['QUEST-AMD-101', 'QUEST-AMD-103']));

  // State for Fines Issued
  const [finedReports, setFinedReports] = useState(new Set());

  // State for Sensor Calibration
  const [calibratedBins, setCalibratedBins] = useState(new Set());

  // Filters for Incidents Table
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [wardFilter, setWardFilter] = useState('All');

  // Selected items for Modals
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedTracingReport, setSelectedTracingReport] = useState(null);
  const [dispatchOverrideModal, setDispatchOverrideModal] = useState(null);
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
  const criticalBins = dustbins.filter((b) => (b.fillLevel || 0) >= 80).length;

  // 48 AMC Wards League Table Data
  const wardRankings = useMemo(() => [
    { rank: 1, ward: 'Ward 18 (Sola & Science City)', score: 98.4, sla: '99.2%', activeBins: 42, compliance: 'Grade A+', status: 'Exemplary' },
    { rank: 2, ward: 'Ward 12 (Vastrapur & Bodakdev)', score: 97.1, sla: '98.5%', activeBins: 38, compliance: 'Grade A+', status: 'Exemplary' },
    { rank: 3, ward: 'Ward 8 (Navrangpura & CG Road)', score: 96.5, sla: '97.8%', activeBins: 45, compliance: 'Grade A+', status: 'Exemplary' },
    { rank: 4, ward: 'Ward 24 (Maninagar South)', score: 95.2, sla: '96.4%', activeBins: 36, compliance: 'Grade A', status: 'Optimal' },
    { rank: 5, ward: 'Ward 14 (Chandlodiya & Ranip)', score: 94.0, sla: '95.1%', activeBins: 32, compliance: 'Grade A', status: 'Optimal' },
    { rank: 6, ward: 'Ward 3 (Kalupur & Relief Road)', score: 91.8, sla: '93.2%', activeBins: 29, compliance: 'Grade A', status: 'Surveillance Active' },
    { rank: 7, ward: 'Ward 30 (Naroda Industrial Phase 3)', score: 88.5, sla: '89.6%', activeBins: 26, compliance: 'Grade B+', status: 'Priority Patrol' },
    { rank: 8, ward: 'Ward 21 (South Bopal & Ghuma)', score: 86.9, sla: '88.0%', activeBins: 24, compliance: 'Grade B', status: 'Action Required' },
  ], []);

  // AMC Officer Registry
  const officerRegistry = [
    { id: 'OFF-AMC-101', name: 'Dr. Ramesh G. Vora (IAS)', designation: 'Deputy Municipal Commissioner (Solid Waste)', zone: 'Central & West Zones', phone: '+91 98251 11201', status: 'Active on Duty' },
    { id: 'OFF-AMC-102', name: 'Smt. Ananya Trivedi', designation: 'Chief Medical Officer of Health (Sanitation)', zone: 'North & East Zones', phone: '+91 98252 33409', status: 'Active on Duty' },
    { id: 'OFF-AMC-103', name: 'Shri Vikram K. Solanki', designation: 'Superintending Engineer (MRF & Landfills)', zone: 'Pirana & Danapith Plants', phone: '+91 98254 55671', status: 'On Field Inspection' },
    { id: 'OFF-AMC-104', name: 'Shri Pravin B. Parmar', designation: 'Zonal Health & Hygiene Officer', zone: 'North-West Zone (Sola/Chandlodiya)', phone: '+91 98259 88712', status: 'Active on Duty' },
  ];

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

  // Issue Municipal Fine for Illegal Dumping (Sanitation Director)
  const handleIssueFine = (report) => {
    setFinedReports((prev) => new Set([...prev, report.id]));
    addToast(`⚖️ Penalty Notice Dispatched: ₹15,000 fine levied for illegal dumping at ${report.location}!`, 'success');
  };

  // Approve AMC Grant & Certificate for Community Quests (Sanitation Director)
  const handleApproveQuestGrant = (questId) => {
    setApprovedQuestGrants((prev) => new Set([...prev, questId]));
    addToast(`✅ AMC Sanitation Grant Approved: 50 Bio-Bags & Official Volunteer Certificates sanctioned for ${questId}!`, 'success');
  };

  // Recalibrate IoT Smart Bin Ultrasonic Sensor (Fleet Operations Chief)
  const handleCalibrateBin = (binId) => {
    setCalibratedBins((prev) => new Set([...prev, binId]));
    addToast(`🔧 Ultrasonic sensor for Smart Bin #${binId} calibrated (Offset adjusted, Battery: 96%)!`, 'success');
  };

  // Toggle Emergency Directives (Municipal Commissioner)
  const handleToggleDirective = (key, name) => {
    setActiveDirectives((prev) => {
      const next = !prev[key];
      addToast(`${next ? '🚨 Directive Activated' : 'Directive Deactivated'}: ${name}`, next ? 'warning' : 'info');
      return { ...prev, [key]: next };
    });
  };

  // Sub-tabs specific to current admin
  const currentSubTabs = useMemo(() => {
    if (isSuperAdmin) {
      return [
        { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
        { id: 'incidents', label: `Incident Tickets (${pendingReports + dispatchedReports})`, icon: FileText },
        { id: 'ward-rankings', label: 'Ward Rankings & League', icon: TrendingUp },
        { id: 'directives', label: 'Emergency Directives', icon: Zap },
        { id: 'audit-logs', label: 'SBM Compliance Audit', icon: Activity },
        { id: 'officers', label: 'Officer Role Registry', icon: Shield },
      ];
    }
    if (isSanitationDirector) {
      return [
        { id: 'overview', label: 'Directorate Overview', icon: BarChart3 },
        { id: 'incidents', label: `Incident Tickets & Grievances (${pendingReports + dispatchedReports})`, icon: FileText },
        { id: 'hotspots', label: `AI Predictive Hotspots (${hotspots.length})`, icon: Flame },
        { id: 'quests-approval', label: `Community Quests (${communityQuests.length})`, icon: Users },
        { id: 'mrf', label: 'MRF & Waste Diversion', icon: Recycle },
        { id: 'audit-logs', label: 'Directorate Audit Logs', icon: Activity },
      ];
    }
    // Fleet Operations Chief
    return [
      { id: 'overview', label: 'Fleet Overview', icon: BarChart3 },
      { id: 'gis-map', label: 'Live Fleet GIS Grid', icon: Layers },
      { id: 'fleet', label: `10 Compactor Trucks (${vehicles.length})`, icon: Truck },
      { id: 'dustbins', label: `Smart IoT Sensors (${dustbins.length})`, icon: Trash2 },
      { id: 'dispatch-overrides', label: 'Dispatch Overrides', icon: Zap },
      { id: 'audit-logs', label: 'Fleet Logs', icon: Activity },
    ];
  }, [isSuperAdmin, isSanitationDirector, pendingReports, dispatchedReports, hotspots.length, communityQuests.length, vehicles.length, dustbins.length]);

  return (
    <DesktopOnlyGuard>
      <div className="animate-fade-in-up" style={{ paddingBottom: '40px' }}>
        {/* 1. Municipal Executive Header Banner */}
        <div
          className="glass-card"
          style={{
            padding: '20px 24px',
            marginBottom: '20px',
            background: isSuperAdmin
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(8, 47, 73, 0.9))'
              : isSanitationDirector
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(4, 47, 46, 0.9))'
              : 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 27, 75, 0.9))',
            border: isSuperAdmin
              ? '1px solid rgba(14, 165, 233, 0.3)'
              : isSanitationDirector
              ? '1px solid rgba(16, 185, 129, 0.3)'
              : '1px solid rgba(139, 92, 246, 0.3)',
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
                  background: isSuperAdmin
                    ? 'linear-gradient(135deg, #0ea5e9, #0369a1)'
                    : isSanitationDirector
                    ? 'linear-gradient(135deg, #10b981, #047857)'
                    : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                }}
              >
                {isSuperAdmin ? '🏛️' : isSanitationDirector ? '🛡️' : '🚛'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.3px' }}>
                    Ahmedabad Municipal Corporation (AMC) Command Center
                  </h2>
                  <span
                    className="badge"
                    style={{
                      background: isSuperAdmin
                        ? 'rgba(14, 165, 233, 0.2)'
                        : isSanitationDirector
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(139, 92, 246, 0.2)',
                      color: isSuperAdmin ? '#38bdf8' : isSanitationDirector ? '#34d399' : '#c084fc',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      fontWeight: 800,
                      fontSize: '10px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {currentUser?.securityClearance || (isSuperAdmin ? 'Level 5 Super Admin' : 'Level 4 Directorate')}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0 0' }}>
                  Logged in as <strong>{currentUser?.name || 'Municipal Officer'}</strong> ({currentUser?.designation || 'Directorate Head'}) • {currentUser?.department || 'AMC Command'}
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

          {/* Sub-Tabs Selector */}
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
            {currentSubTabs.map((tab) => {
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
                    background: isActive
                      ? (isSuperAdmin ? '#0ea5e9' : isSanitationDirector ? '#10b981' : '#8b5cf6')
                      : 'rgba(255, 255, 255, 0.06)',
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

        {/* 2. OVERVIEW TAB: Customized per Admin Role */}
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
              {isSuperAdmin ? (
                <>
                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>City Sanitation Index</span>
                      <TrendingUp size={16} color="#0ea5e9" />
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 900, fontFamily: 'monospace', margin: '6px 0', color: '#38bdf8' }}>94.2%</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Top Tier • Swachh Survekshan #1 Metro</div>
                  </div>

                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>SLA Resolution Rate</span>
                      <CheckCircle2 size={16} color="#10b981" />
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 900, fontFamily: 'monospace', margin: '6px 0', color: '#10b981' }}>{slaResolutionRate}%</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{resolvedReports} of {totalReports} tickets verified & cleared</div>
                  </div>

                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Active Compactor Fleet</span>
                      <Truck size={16} color="#8b5cf6" />
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 900, fontFamily: 'monospace', margin: '6px 0', color: '#a78bfa' }}>10/10 Units</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>100% Operational Readiness Across Zones</div>
                  </div>

                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Annual SWM Budget Allocation</span>
                      <Building size={16} color="#f59e0b" />
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 900, fontFamily: 'monospace', margin: '6px 0', color: '#f59e0b' }}>₹ 42.8 Cr</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>84% allocated to EV Fleet & IoT Infrastructure</div>
                  </div>

                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Active Emergency Protocols</span>
                      <Zap size={16} color="#ec4899" />
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 900, fontFamily: 'monospace', margin: '6px 0', color: '#ec4899' }}>2 Active</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Monsoon Flood Protocol & VIP Corridor</div>
                  </div>
                </>
              ) : isSanitationDirector ? (
                <>
                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Daily MRF Processing Yield</span>
                      <Recycle size={16} color="#10b981" />
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 900, fontFamily: 'monospace', margin: '6px 0', color: '#10b981' }}>420 Tons/day</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>82.4% Landfill Diversion (Compost + RDF)</div>
                  </div>

                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Grievance Arbitration Queue</span>
                      <FileText size={16} color="#f59e0b" />
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 900, fontFamily: 'monospace', margin: '6px 0', color: '#f59e0b' }}>{pendingReports} Pending</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Disputed tickets & illegal commercial dumps</div>
                  </div>

                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>AI Predictive Surge Hotspots</span>
                      <Flame size={16} color="#f43f5e" />
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 900, fontFamily: 'monospace', margin: '6px 0', color: '#f43f5e' }}>{hotspots.length} Zones</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>CCTV ML Surveillance Active</div>
                  </div>

                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Community Quests Sanctioned</span>
                      <Users size={16} color="#0ea5e9" />
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 900, fontFamily: 'monospace', margin: '6px 0', color: '#38bdf8' }}>{communityQuests.length} Drives</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Neighborhood Volunteer Cleanups</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Fleet Operational Readiness</span>
                      <Truck size={16} color="#8b5cf6" />
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 900, fontFamily: 'monospace', margin: '6px 0', color: '#a78bfa' }}>10/10 Online</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>10 Heavy Compactor Trucks Active</div>
                  </div>

                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Daily Route Execution</span>
                      <Activity size={16} color="#10b981" />
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 900, fontFamily: 'monospace', margin: '6px 0', color: '#10b981' }}>92.4%</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Stops & Smart Bins Collected</div>
                  </div>

                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Average Compactor Payload</span>
                      <Gauge size={16} color="#f59e0b" />
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 900, fontFamily: 'monospace', margin: '6px 0', color: '#f59e0b' }}>84.5%</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>11.8 / 14.0 Tons Per Truck</div>
                  </div>

                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>IoT Ultrasonic Sensor Health</span>
                      <Cpu size={16} color="#0ea5e9" />
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 900, fontFamily: 'monospace', margin: '6px 0', color: '#38bdf8' }}>98.6%</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{criticalBins} Bins Awaiting Immediate Pickup</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 3. WARD RANKINGS LEAGUE TABLE (Commissioner Exclusive) */}
        {adminTab === 'ward-rankings' && (
          <div className="glass-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <TrendingUp size={18} style={{ color: '#0ea5e9' }} />
                  48 AMC Wards Cleanliness League Table & Swachh Survekshan Scorecard
                </h3>
                <p className="card-subtitle">Real-time ranking of Ahmedabad municipal wards by SLA resolution rate, smart bin fill level compliance, and citizen ratings</p>
              </div>
              <span className="badge badge-active">48 Wards Audited</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Rank</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Ward Sector</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Cleanliness Score</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>SLA Resolution</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Active IoT Bins</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Grade</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {wardRankings.map((w) => (
                    <tr key={w.rank} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: w.rank <= 3 ? '#f59e0b' : 'var(--text-primary)' }}>
                        #{w.rank}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {w.ward}
                      </td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 800, color: '#0ea5e9' }}>
                        {w.score}/100
                      </td>
                      <td style={{ padding: '10px 14px', color: '#10b981', fontWeight: 700 }}>
                        {w.sla}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                        {w.activeBins} Smart Bins
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 800 }}>
                          {w.compliance}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. EMERGENCY PROTOCOLS & DIRECTIVES (Commissioner Exclusive) */}
        {adminTab === 'directives' && (
          <div className="glass-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Zap size={18} style={{ color: '#f59e0b' }} />
                  City-Wide Emergency Sanitation Directives & Protocols
                </h3>
                <p className="card-subtitle">Executive power to mandate 24/7 reserve fleet mobilization, monsoon silt extraction, and festive zero-waste enforcement</p>
              </div>
              <span className="badge badge-active">Level 5 Authority</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '18px 20px' }}>
              {[
                {
                  key: 'monsoon',
                  title: 'Monsoon Flood & Stormwater Drain Debris Protocol',
                  desc: 'Deploys 40 reserve silt extractors and 24/7 emergency drain unclogging teams along major underpasses and canal culverts.',
                  assets: '12 Silt Extractors • 40 Reserve Cleaners • High Priority',
                  active: activeDirectives.monsoon,
                },
                {
                  key: 'diwali',
                  title: 'Diwali & Navratri Festive Zero-Waste Mandate',
                  desc: 'Mandates 24/7 night sweeping around religious temples, commercial sweet markets, and public celebration grounds with mobile compactor hubs.',
                  assets: '6 Mobile Compactors • 80 Temporary Night Sweepers',
                  active: activeDirectives.diwali,
                },
                {
                  key: 'vipCorridor',
                  title: 'Vibrant Gujarat & Riverfront VIP Sanitation Protocol',
                  desc: 'Zero-tolerance littering enforcement with CCTV surveillance along SG Highway, Airport Corridor, and Sabarmati Riverfront Promenade.',
                  assets: '10 Patrol Trucks • 15 CCTV ML Surge Cameras',
                  active: activeDirectives.vipCorridor,
                },
              ].map((directive) => (
                <div
                  key={directive.key}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    background: directive.active ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-surface-elevated)',
                    border: `1.5px solid ${directive.active ? '#f59e0b' : 'var(--border-subtle)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                  }}
                >
                  <div style={{ maxWidth: '600px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {directive.title}
                      </span>
                      <span
                        className="badge"
                        style={{
                          background: directive.active ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                          color: directive.active ? '#f59e0b' : 'var(--text-muted)',
                          fontSize: '10px',
                          fontWeight: 800,
                        }}
                      >
                        {directive.active ? '● LIVE DIRECTIVE ACTIVE' : '○ Standby Protocol'}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                      {directive.desc}
                    </p>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      🏷️ Deployed Assets: {directive.assets}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleDirective(directive.key, directive.title)}
                    className={`btn ${directive.active ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                    style={{ fontWeight: 800, minWidth: '140px' }}
                  >
                    {directive.active ? 'Deactivate Directive' : 'Declare & Mobilize'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. OFFICER REGISTRY (Commissioner Exclusive) */}
        {adminTab === 'officers' && (
          <div className="glass-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Shield size={18} style={{ color: '#0ea5e9' }} />
                  Municipal Officers & Deputy Commissioners Registry
                </h3>
                <p className="card-subtitle">Certified AMC Solid Waste Management leadership directory and security clearance levels</p>
              </div>
              <span className="badge badge-neutral">4 Deputy Heads</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Officer ID</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Officer Name</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Designation</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Jurisdiction / Zone</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Official Contact</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {officerRegistry.map((off) => (
                    <tr key={off.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#0ea5e9' }}>
                        {off.id}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {off.name}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                        {off.designation}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                        {off.zone}
                      </td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {off.phone}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <span className="badge badge-active" style={{ fontSize: '10px' }}>
                          {off.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. COMMUNITY QUESTS APPROVAL HUB (Sanitation Director Exclusive) */}
        {adminTab === 'quests-approval' && (
          <div className="glass-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Users size={18} style={{ color: '#10b981' }} />
                  Community Cleanliness Quests Sanction & Equipment Grant Hub
                </h3>
                <p className="card-subtitle">Review citizen-organized neighborhood cleanup drives, sanction official AMC bio-equipment, and grant verified volunteer certificates</p>
              </div>
              <span className="badge badge-active">{communityQuests.length} Quests Under Review</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '18px 20px' }}>
              {communityQuests.map((quest) => {
                const isApproved = approvedQuestGrants.has(quest.id);
                return (
                  <div
                    key={quest.id}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--bg-surface-elevated)',
                      border: `1px solid ${isApproved ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {quest.categoryIcon} {quest.title}
                        </span>
                        <span className="badge badge-neutral" style={{ fontSize: '10px', fontFamily: 'monospace' }}>
                          {quest.id}
                        </span>
                        {isApproved && (
                          <span className="badge badge-active" style={{ fontSize: '10px' }}>
                            ✓ AMC Equipment Granted
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 6px 0' }}>
                        🎯 <strong>Target:</strong> {quest.targetGoal}
                      </p>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span>📍 {quest.location}</span>
                        <span>•</span>
                        <span>📅 {quest.date} ({quest.time})</span>
                        <span>•</span>
                        <span>👤 Organizer: <strong>{quest.organizerName}</strong> ({quest.organizerKarma} ⭐ Karma)</span>
                        <span>•</span>
                        <span>👥 {quest.volunteersCount}/{quest.volunteersTarget} Volunteers Joined</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApproveQuestGrant(quest.id)}
                      disabled={isApproved}
                      className={`btn ${isApproved ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                      style={{ fontWeight: 800 }}
                    >
                      {isApproved ? '✓ AMC Grant Sanctioned' : 'Grant Equipment & Certificate'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. MRF & LANDFILL DIVERSION ANALYTICS (Sanitation Director Exclusive) */}
        {adminTab === 'mrf' && (
          <div className="glass-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Recycle size={18} style={{ color: '#10b981' }} />
                  Material Recovery Facility (MRF) & Landfill Diversion Analytics
                </h3>
                <p className="card-subtitle">Daily solid waste treatment, organic composting yield, RDF fuel conversion, and Pirana landfill diversion rate</p>
              </div>
              <span className="badge badge-active">82.4% Diversion Rate</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', padding: '18px 20px' }}>
              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Daily Waste Collected</div>
                <div style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'monospace', color: 'var(--text-primary)', margin: '6px 0' }}>510 Tons</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>From all 48 municipal wards</div>
              </div>

              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Organic Wet Waste Composting</div>
                <div style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'monospace', color: '#10b981', margin: '6px 0' }}>180 Tons</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Converted into municipal compost manure</div>
              </div>

              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Dry Recyclables Segregated</div>
                <div style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'monospace', color: '#0ea5e9', margin: '6px 0' }}>160 Tons</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Plastic, metal, and cardboard recovery</div>
              </div>

              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Refuse-Derived Fuel (RDF)</div>
                <div style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'monospace', color: '#f59e0b', margin: '6px 0' }}>80 Tons</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Supplied to cement kilns & power plants</div>
              </div>
            </div>
          </div>
        )}

        {/* 8. DYNAMIC EMERGENCY DISPATCH OVERRIDES (Fleet Chief Exclusive) */}
        {adminTab === 'dispatch-overrides' && (
          <div className="glass-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Zap size={18} style={{ color: '#f59e0b' }} />
                  Dynamic Emergency Dispatch Override & Fleet Contingencies
                </h3>
                <p className="card-subtitle">Real-time truck reassignment, emergency overflow response, and breakdown truck substitutions</p>
              </div>
              <span className="badge badge-active">10 Trucks Ready</span>
            </div>

            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Pending Citizen Incident Reports Requiring Immediate Dispatch ({pendingReports}):
              </div>

              {reports.filter((r) => r.status === 'Pending Verification' || r.status === 'Pending Driver Approval').map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{r.category}</span>
                      <span className="badge badge-active" style={{ fontSize: '10px', fontFamily: 'monospace' }}>#{r.id}</span>
                      <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '10px' }}>{r.priority}</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      📍 {r.location} • {r.ward}
                    </div>
                  </div>

                  <button
                    onClick={() => setDispatchOverrideModal({ reportId: r.id, report: r })}
                    className="btn btn-primary btn-sm"
                    style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Send size={12} />
                    <span>Force Dispatch Truck</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. INCIDENT TICKETS & GRIEVANCE ARBITRATION (Sanitation Director / Fleet Admin) */}
        {adminTab === 'incidents' && (
          <div className="glass-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <FileText size={18} style={{ color: 'var(--accent-amber)' }} />
                  Municipal Incidents & Community Tickets (Grievance Arbitration)
                </h3>
                <p className="card-subtitle">Review resident waste reports, verify photo evidence, and arbitrate municipal dumping penalties</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-active">{filteredReports.length} Reports</span>
              </div>
            </div>

            {/* Filter Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '12px 18px',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by ID, category, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '32px', fontSize: '12px', height: '34px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select"
                  style={{ fontSize: '12px', height: '34px', width: 'auto' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Resolved">Resolved</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="form-select"
                  style={{ fontSize: '12px', height: '34px', width: 'auto' }}
                >
                  <option value="All">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                </select>
              </div>
            </div>

            {/* Incidents Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>ID</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Category & Description</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Location & Ward</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Priority</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Status</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Assigned Unit</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((rep) => {
                    const isFined = finedReports.has(rep.id);
                    return (
                      <tr key={rep.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#0ea5e9' }}>
                          #{rep.id}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{rep.category}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{rep.description || 'Public waste report'}</div>
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                          <div>{rep.location}</div>
                          <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>{rep.ward}</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span
                            className="badge"
                            style={{
                              background: rep.priority === 'Critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: rep.priority === 'Critical' ? '#ef4444' : '#f59e0b',
                              fontSize: '10px',
                              fontWeight: 800,
                            }}
                          >
                            {rep.priority}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span
                            className="badge"
                            style={{
                              background: rep.status === 'Resolved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(14, 165, 233, 0.15)',
                              color: rep.status === 'Resolved' ? '#10b981' : '#0ea5e9',
                              fontSize: '10px',
                              fontWeight: 700,
                            }}
                          >
                            {rep.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '11px' }}>
                          {rep.assignedDriver || '—'}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => setSelectedReport(rep)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                            >
                              Details
                            </button>

                            {isSanitationDirector && (
                              <button
                                onClick={() => handleIssueFine(rep)}
                                disabled={isFined}
                                className="btn btn-secondary btn-sm"
                                style={{
                                  fontSize: '11px',
                                  padding: '4px 8px',
                                  color: isFined ? 'var(--text-muted)' : '#f59e0b',
                                  borderColor: isFined ? undefined : 'rgba(245, 158, 11, 0.4)',
                                }}
                                title="Issue ₹15,000 fine for illegal dumping"
                              >
                                <Scale size={12} />
                                <span>{isFined ? 'Fined ✓' : 'Fine ₹15k'}</span>
                              </button>
                            )}

                            {rep.status !== 'Resolved' && (
                              <button
                                onClick={() => setDispatchOverrideModal({ reportId: rep.id, report: rep })}
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: '11px', padding: '4px 8px' }}
                              >
                                Dispatch
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 10. LIVE CITY GIS GRID (Fleet Operations / Command) */}
        {adminTab === 'gis-map' && (
          <div className="glass-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Layers size={18} style={{ color: '#0ea5e9' }} />
                  Master Ahmedabad City GIS Fleet & Smart Bin Grid
                </h3>
                <p className="card-subtitle">Real-time transponder tracking of all 10 compactor trucks, smart bins, and AI ML surge hotspots</p>
              </div>
              <span className="badge badge-active">{vehicles.length} Trucks Live</span>
            </div>

            <div className="card-body" style={{ padding: 0 }}>
              <MapPlaceholder
                center={[23.0500, 72.5600]}
                zoom={12}
                title="Ahmedabad Smart Waste GIS Control Map"
                activeItemsCount={vehicles.length + dustbins.length + hotspots.length}
                itemType="Live Transponders & Sensors"
                emptyMessage="No GIS transponders connected."
              >
                <FleetGisMarkers
                  showVehicles={true}
                  showDustbins={true}
                  showHotspots={true}
                  vehicles={vehicles}
                  dustbins={dustbins}
                  hotspots={hotspots}
                />
              </MapPlaceholder>
            </div>
          </div>
        )}

        {/* 11. MUNICIPAL FLEET & TRUCKS DIAGNOSTICS (Fleet Chief) */}
        {adminTab === 'fleet' && (
          <div className="glass-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Truck size={18} style={{ color: '#8b5cf6' }} />
                  Municipal Fleet Compactor Trucks (10 Units Telemetry)
                </h3>
                <p className="card-subtitle">Heavy compactor payload tonnage, fuel diagnostics, and driver assignments</p>
              </div>
              <span className="badge badge-active">10 Trucks Active</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Truck ID</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Plate Number</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Assigned Driver</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Assigned Sector / Ward</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Payload Tonnage</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Fuel / Battery</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 800, color: '#8b5cf6' }}>
                        {v.id}
                      </td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 700 }}>
                        {v.plateNumber}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-primary)' }}>
                        <strong>{v.driverName}</strong> ({v.driverBadge})
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                        {v.assignedRoute || 'North Ahmedabad Corridor'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{v.loadCapacityPercent || 35}%</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            ({(((v.loadCapacityPercent || 35) * 14) / 100).toFixed(1)} / 14.0 T)
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#10b981', fontWeight: 700 }}>
                        {v.batteryOrFuel || 92}%
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <span className="badge badge-active" style={{ fontSize: '10px' }}>
                          {v.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 12. SMART IOT DUSTBINS & SENSORS CALIBRATION */}
        {adminTab === 'dustbins' && (
          <div className="glass-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Trash2 size={18} style={{ color: '#10b981' }} />
                  Smart IoT Dustbins & Ultrasonic Sensor Calibration
                </h3>
                <p className="card-subtitle">Live ultrasonic fill levels, optical sensor health, and remote hardware calibration offset</p>
              </div>
              <span className="badge badge-active">{dustbins.length} Smart Bins</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Bin ID</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Landmark Name</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Ward</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Category</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Fill %</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Battery</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, textAlign: 'right' }}>Calibration</th>
                  </tr>
                </thead>
                <tbody>
                  {dustbins.map((bin) => {
                    const isCalibrated = calibratedBins.has(bin.id);
                    return (
                      <tr key={bin.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#0ea5e9' }}>
                          {bin.id}
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {bin.name}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                          {bin.ward}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span className="badge badge-neutral" style={{ fontSize: '10.5px' }}>{bin.category}</span>
                        </td>
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 800, color: bin.fillLevel >= 80 ? '#ef4444' : '#10b981' }}>
                          {bin.fillLevel}%
                        </td>
                        <td style={{ padding: '10px 14px', color: '#10b981', fontWeight: 700 }}>
                          {bin.batteryLevel || 94}%
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleCalibrateBin(bin.id)}
                            className={`btn ${isCalibrated ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                            style={{ fontSize: '11px', padding: '3px 8px' }}
                          >
                            {isCalibrated ? '✓ Calibrated' : 'Calibrate Offset'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 13. AI PREDICTIVE HOTSPOTS & SURVEILLANCE */}
        {adminTab === 'hotspots' && (
          <div className="glass-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Flame size={18} style={{ color: '#f43f5e' }} />
                  AI Machine Learning Waste Surge Hotspots & CCTV Patrols
                </h3>
                <p className="card-subtitle">Predictive models forecast waste overflow 6 hours in advance using historical citizen footfall and market traffic</p>
              </div>
              <span className="badge badge-active">{hotspots.length} Surge Zones</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', padding: '18px 20px' }}>
              {hotspots.map((h) => (
                <div
                  key={h.id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{h.location}</span>
                      <span className="badge badge-active" style={{ fontSize: '10px', fontFamily: 'monospace' }}>{h.id}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 6px 0' }}>
                      📍 {h.ward} • Risk Score: <strong>{h.riskScore || 'High (91%)'}</strong>
                    </p>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      📊 Predicted Surge Volume: <strong style={{ color: '#f43f5e' }}>{h.predictedVolume || '3.2 Tons'}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>● CCTV ML Surveillance Active</span>
                    <button
                      onClick={() => addToast(`⚡ Preventive compactor pre-positioned at ${h.location}!`, 'success')}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                    >
                      Pre-Position Compactor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 14. MUNICIPAL AUDIT LOGS */}
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
