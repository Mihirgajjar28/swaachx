import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { SkeletonMetric, SkeletonChart } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { MapPlaceholder } from '../components/common/MapPlaceholder';
import {
  FileText,
  Truck,
  AlertCircle,
  Flame,
  TrendingUp,
  PieChart as PieChartIcon,
  MapPin,
  Users,
  Phone,
  Mail,
  CheckCircle2,
  Search,
  Send,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { CitizenDashboardView } from './CitizenDashboardView';
import { DriverDashboardView } from './DriverDashboardView';
import { FleetGisMarkers } from '../components/maps/FleetGisMarkers';
import { ReportDetailModal } from '../components/reports/ReportDetailModal';

export const DashboardView = () => {
  const {
    metrics,
    isLoadingSkeleton,
    setActiveTab,
    reports,
    vehicles,
    citizens,
    hotspots,
    activeRole,
    dispatchDriverToReport,
    resolveReport,
  } = useDashboard();

  const [citizenDirectoryTab, setCitizenDirectoryTab] = useState('reports'); // 'reports' | 'citizens'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);

  // If viewing as Driver, render dedicated Driver Cockpit Dashboard
  if (activeRole === 'driver') {
    return <DriverDashboardView />;
  }

  // If viewing as Citizen, render dedicated Citizen Dashboard
  if (activeRole === 'citizen') {
    return <CitizenDashboardView />;
  }

  const pendingReportsCount = reports.filter((r) => r.status === 'Pending Verification').length;
  const activeVehiclesCount = vehicles.filter((v) => v.status === 'Active').length;

  const metricCards = [
    {
      title: 'Total Reports',
      value: reports.length,
      label: 'Citizen Submissions',
      subtext: `${pendingReportsCount} pending triage review`,
      icon: FileText,
      accent: 'var(--primary-500)',
      targetTab: 'reports',
    },
    {
      title: 'Connected Fleet',
      value: activeVehiclesCount,
      label: 'Active Fleet Drivers',
      subtext: `${vehicles.length} total GPS transponders`,
      icon: Truck,
      accent: 'var(--accent-cyan)',
      targetTab: 'vehicles',
    },
    {
      title: 'Triage Queue',
      value: pendingReportsCount,
      label: 'Pending Dispatches',
      subtext: 'Actionable citizen complaints',
      icon: AlertCircle,
      accent: 'var(--accent-amber)',
      targetTab: 'reports',
    },
    {
      title: 'AI High-Risk Sectors',
      value: metrics.predictedHotspots || 2,
      label: 'Predicted Hotspots',
      subtext: 'Spatial anomaly modeling',
      icon: Flame,
      accent: 'var(--accent-rose)',
      targetTab: 'hotspots',
    },
  ];

  const filteredReports = reports.filter((r) => {
    const matchesWard = selectedWard === 'All' || r.ward === selectedWard || (r.ward && r.ward.includes(selectedWard));
    const matchesSearch =
      searchQuery === '' ||
      r.citizenName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesWard && matchesSearch;
  });

  const filteredCitizens = citizens.filter((c) => {
    const matchesWard = selectedWard === 'All' || c.ward === selectedWard || (c.ward && c.ward.includes(selectedWard));
    const matchesSearch =
      searchQuery === '' ||
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesWard && matchesSearch;
  });

  return (
    <div>
      {/* 1. Summary Cards Grid */}
      <div className="metrics-grid">
        {metricCards.map((card, idx) => {
          if (isLoadingSkeleton) {
            return <SkeletonMetric key={idx} />;
          }

          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="metric-card"
              style={{ '--card-accent': card.accent }}
              onClick={() => setActiveTab(card.targetTab)}
              role="button"
              tabIndex={0}
            >
              <div className="metric-header">
                <div className="metric-icon-wrap" style={{ color: card.accent }}>
                  <Icon size={20} />
                </div>
              </div>

              <div className="metric-value">{card.value}</div>
              <div className="metric-label">{card.label}</div>
              <div className="metric-subtext">
                <span>{card.subtext}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Live Citizen Geotagged Incidents GIS Map */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <MapPin size={18} style={{ color: 'var(--primary-500)' }} />
              Citizen Geotagged Incidents & Operations GIS Map
            </h3>
            <p className="card-subtitle">
              Live citizen issue coordinates, category pins, and real-time municipal response GIS
            </p>
          </div>
          <span className="badge badge-active">
            {reports.length} Active Incident Pins
          </span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {isLoadingSkeleton ? (
            <SkeletonChart height={360} />
          ) : (
            <MapPlaceholder
              center={[23.0300, 72.5600]}
              zoom={13}
              title="Ahmedabad Municipal Operations GIS"
              activeItemsCount={vehicles.filter((v) => v.status === 'Active').length + reports.length + (hotspots?.length || 0)}
              itemType="Fleet, Hotspots & Issues"
            >
              <FleetGisMarkers
                vehicles={vehicles}
                reports={reports}
                hotspots={hotspots}
                showRoutes={true}
                showHotspots={true}
                onDispatch={dispatchDriverToReport}
                onResolve={resolveReport}
                onSelectReport={setSelectedReport}
              />
            </MapPlaceholder>
          )}
        </div>
      </div>

      {/* 3. Comprehensive Citizen Intelligence & Reports Directory */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Users size={18} style={{ color: 'var(--primary-500)' }} />
              Citizen Submissions & Civic Contributor Registry
            </h3>
            <p className="card-subtitle">
              Citizen submitted reports with photo geotags, contact info, and 1-click driver dispatch
            </p>
          </div>

          {/* Tab Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-surface-elevated)',
              padding: '3px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => setCitizenDirectoryTab('reports')}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: citizenDirectoryTab === 'reports' ? 'var(--primary-500)' : 'transparent',
                color: citizenDirectoryTab === 'reports' ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Citizen Reports ({reports.length})
            </button>
            <button
              onClick={() => setCitizenDirectoryTab('citizens')}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: citizenDirectoryTab === 'citizens' ? 'var(--primary-500)' : 'transparent',
                color: citizenDirectoryTab === 'citizens' ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Registered Citizens ({citizens.length})
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px', flexWrap: 'wrap' }}>
            <div className="search-bar" style={{ flex: 1, minWidth: '200px', maxWidth: '320px' }}>
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search citizen name, phone, ward..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="form-select"
              style={{ fontSize: '12px', padding: '6px 12px', width: 'auto', height: '36px' }}
            >
              <option value="All">All Wards</option>
              <option value="Ward 14">Ward 14 (North Sector)</option>
              <option value="Ward 08">Ward 08 (Central Market)</option>
              <option value="Ward 11">Ward 11 (East Suburbs)</option>
            </select>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Showing {citizenDirectoryTab === 'reports' ? filteredReports.length : filteredCitizens.length} records
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {/* TAB 1: ALL CITIZEN REPORTS TABLE */}
          {citizenDirectoryTab === 'reports' && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Citizen Details</th>
                    <th>Location & Coordinates</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Assigned Driver</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                        <EmptyState
                          icon={FileText}
                          title="No Matching Reports Found"
                          description="No citizen reports match the current search or ward filter."
                          compact={true}
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedReport(r)}
                        style={{ cursor: 'pointer' }}
                        title="Click to view full ticket details"
                      >
                        <td>
                          <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--primary-600)' }}>
                            #{r.id}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {r.citizenName || 'Citizen Resident'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={10} /> {r.citizenPhone || '+91 98765 00000'}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 600 }}>{r.location}</div>
                          <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                            {r.ward}
                          </div>
                        </td>

                        <td>
                          <span style={{ fontWeight: 600 }}>{r.category}</span>
                        </td>

                        <td>
                          <span
                            className="badge"
                            style={{
                              fontSize: '10px',
                              background: r.priority === 'Critical' ? 'var(--accent-rose-bg)' : 'var(--accent-amber-bg)',
                              color: r.priority === 'Critical' ? 'var(--accent-rose)' : 'var(--accent-amber)',
                              borderColor: r.priority === 'Critical' ? 'rgba(225, 29, 72, 0.25)' : 'rgba(217, 119, 6, 0.25)',
                            }}
                          >
                            {r.priority || 'High'}
                          </span>
                        </td>

                        <td>
                          {r.assignedDriver ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                              <Truck size={12} />
                              <span>{r.assignedDriver}</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Unassigned</span>
                          )}
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              r.status === 'Resolved'
                                ? 'badge-resolved'
                                : r.status === 'Dispatched'
                                ? 'badge-active'
                                : 'badge-pending'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          {r.status === 'Pending Verification' ? (
                            <button
                              onClick={() => dispatchDriverToReport(r.id, 'TRK-804')}
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                              title="Dispatch driver TRK-804"
                            >
                              <Send size={11} /> Dispatch
                            </button>
                          ) : r.status === 'Dispatched' ? (
                            <button
                              onClick={() => resolveReport(r.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '11px', padding: '4px 8px', color: 'var(--primary-600)' }}
                            >
                              <CheckCircle2 size={11} /> Resolve
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--primary-600)', fontWeight: 600 }}>
                              ✓ Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: REGISTERED CITIZENS DIRECTORY */}
          {citizenDirectoryTab === 'citizens' && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Citizen ID</th>
                    <th>Full Name</th>
                    <th>Contact</th>
                    <th>Assigned Ward</th>
                    <th>Karma Points</th>
                    <th>Reports Filed</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCitizens.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                        <EmptyState
                          icon={Users}
                          title="No Registered Citizens Found"
                          description="No citizens match the selected search filter."
                          compact={true}
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredCitizens.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--primary-600)' }}>
                            {c.id}
                          </span>
                        </td>

                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Citizen Resident</div>
                        </td>

                        <td>
                          <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={11} style={{ color: 'var(--text-muted)' }} /> {c.email}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Phone size={10} /> {c.phone}
                          </div>
                        </td>

                        <td>
                          <span style={{ fontWeight: 600 }}>{c.ward}</span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: 'var(--accent-amber)' }}>
                            <Award size={13} />
                            <span>{c.karmaPoints} pts</span>
                          </div>
                        </td>

                        <td>
                          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                            {c.reportsCount} Submissions
                          </span>
                        </td>

                        <td>
                          <span className="badge badge-active" style={{ fontSize: '10px' }}>
                            {c.status || 'Active Resident'}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>
                          {new Date(c.joinedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 4. Charts Section */}
      <div className="two-col-grid">
        {/* Weekly Report Trends Chart */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <TrendingUp size={18} style={{ color: 'var(--primary-500)' }} />
                Weekly Citizen Inflow Trends
              </h3>
              <p className="card-subtitle">Submissions vs resolved tickets timeline</p>
            </div>
          </div>

          <div className="card-body" style={{ minHeight: '260px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={[
                  { day: 'Mon', reports: 4, resolved: 3 },
                  { day: 'Tue', reports: 7, resolved: 6 },
                  { day: 'Wed', reports: 5, resolved: 5 },
                  { day: 'Thu', reports: 9, resolved: 8 },
                  { day: 'Fri', reports: 12, resolved: 10 },
                  { day: 'Sat', reports: 8, resolved: 7 },
                  { day: 'Sun', reports: reports.length, resolved: reports.filter((r) => r.status === 'Resolved').length },
                ]}
              >
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-500)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary-500)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="reports" stroke="var(--primary-500)" strokeWidth={2} fill="url(#colorReports)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Issue Category Distribution Chart */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <PieChartIcon size={18} style={{ color: 'var(--accent-cyan)' }} />
                Issue Category Breakdown
              </h3>
              <p className="card-subtitle">Distribution by waste classification</p>
            </div>
          </div>

          <div className="card-body" style={{ minHeight: '260px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Overflowing Bin', value: 45 },
                    { name: 'Illegal Dumping', value: 30 },
                    { name: 'Missed Pickup', value: 15 },
                    { name: 'Hazardous Waste', value: 10 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell fill="var(--primary-500)" />
                  <Cell fill="var(--accent-amber)" />
                  <Cell fill="var(--accent-cyan)" />
                  <Cell fill="var(--accent-rose)" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Report Detail Interactive Popup */}
      <ReportDetailModal
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        onDispatch={dispatchDriverToReport}
        onResolve={resolveReport}
        isCitizen={false}
      />
    </div>
  );
};
