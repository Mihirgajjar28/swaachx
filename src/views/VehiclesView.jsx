import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { MapPlaceholder } from '../components/common/MapPlaceholder';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonTable, SkeletonChart } from '../components/common/SkeletonLoader';
import { FleetGisMarkers } from '../components/maps/FleetGisMarkers';
import {
  Truck,
  Battery,
  MapPin,
  Search,
  Navigation,
  Radio,
  Layers,
  Gauge,
  Compass,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';

export const VehiclesView = () => {
  const { vehicles, isLoadingSkeleton } = useDashboard();
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  const activeCount = vehicles.filter((v) => v.status === 'Active').length;
  const idleCount = vehicles.filter((v) => v.status === 'Idle').length;
  const maintenanceCount = vehicles.filter((v) => v.status === 'Maintenance' || v.status === 'Offline').length;

  const filteredVehicles = vehicles.filter((v) => {
    const matchesStatus = filterStatus === 'All' || v.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      v.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.plateNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.driverName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.lastLocation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.assignedRoute?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  // Map center: Selected truck or Ahmedabad municipal center
  const mapCenter = selectedVehicle?.coordinates?.lat
    ? [selectedVehicle.coordinates.lat, selectedVehicle.coordinates.lng]
    : [23.0450, 72.5600]; // Ahmedabad Municipal Sanitation Center

  const mapZoom = selectedVehicle ? 15 : 12;

  return (
    <div className="animate-fade-in-up">
      {/* Fleet KPI Quick Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        {[
          { label: 'Connected Transponders', val: `${vehicles.length} Units`, desc: 'Active GPS transponders', color: 'var(--primary-500)', stagger: 'stagger-1' },
          { label: 'On Route / Active', val: `${activeCount}`, desc: 'Dispatched to collection zones', color: 'var(--accent-cyan)', stagger: 'stagger-2' },
          { label: 'Idle in Depot', val: `${idleCount}`, desc: 'Standby / depot check', color: 'var(--accent-amber)', stagger: 'stagger-3' },
          { label: 'Maintenance / Offline', val: `${maintenanceCount}`, desc: 'Scheduled servicing', color: 'var(--text-muted)', stagger: 'stagger-4' },
        ].map((kpi, idx) => (
          <div key={idx} className={`metric-card ${kpi.stagger}`} style={{ padding: '16px', '--card-accent': kpi.color }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', margin: '4px 0', color: 'var(--text-primary)' }}>
              {kpi.val}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{kpi.desc}</div>
          </div>
        ))}
      </div>

      {/* 1. Live GIS Map Container */}
      <div className="glass-card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="card-title">
                <Navigation size={18} style={{ color: 'var(--accent-cyan)' }} />
                Live Fleet Telemetry & Geofencing Map
              </h3>
              <span className="badge badge-active" style={{ fontSize: '10px' }}>
                <span className="radar-dot" style={{ width: '5px', height: '5px' }} />
                10 Ahmedabad Trucks Live
              </span>
            </div>
            <p className="card-subtitle">
              Real-time GPS tracking of all municipal compactor trucks across Ahmedabad sanitation wards
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedVehicle && (
              <button
                onClick={() => setSelectedVehicleId(null)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '11px' }}
              >
                Reset Map View (Show All)
              </button>
            )}
            <span className="badge badge-neutral" style={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
              {filteredVehicles.length} of {vehicles.length} Trucks Plotted
            </span>
          </div>
        </div>

        {/* Quick Truck Filter Chips */}
        <div
          style={{
            padding: '10px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>
            Quick Track:
          </span>
          {vehicles.map((v) => {
            const isSelected = selectedVehicleId === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVehicleId(isSelected ? null : v.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '99px',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--primary-500)' : 'var(--border-subtle)',
                  background: isSelected ? 'var(--primary-50)' : 'var(--bg-surface)',
                  color: isSelected ? 'var(--primary-700)' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: isSelected ? 800 : 500,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
              >
                <span>🚛 {v.id}</span>
                <span style={{ fontSize: '10px', opacity: 0.75 }}>({v.driverName?.split(' ')[0]})</span>
              </button>
            );
          })}
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {isLoadingSkeleton ? (
            <SkeletonChart height={420} />
          ) : (
            <MapPlaceholder
              center={mapCenter}
              zoom={mapZoom}
              title="Ahmedabad Fleet GIS Tracking Map"
              activeItemsCount={filteredVehicles.length}
              itemType="Municipal Trucks"
              emptyMessage="No active vehicle GPS markers plotted. Ready to receive streaming coordinates."
            >
              <FleetGisMarkers vehicles={filteredVehicles.length > 0 ? filteredVehicles : vehicles} showRoutes={true} />
            </MapPlaceholder>
          )}
        </div>
      </div>

      {/* 2. Vehicle Telemetry Table */}
      <div className="glass-card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Truck size={18} style={{ color: 'var(--primary-500)' }} />
              Fleet Roster & Telemetry Feeds
            </h3>
            <p className="card-subtitle">Vehicle status, last transmitted location, and diagnostics</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search */}
            <div className="search-bar" style={{ minWidth: '160px' }}>
              <Search size={13} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search vehicles, drivers, plates..."
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

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select"
              style={{ height: '34px', fontSize: '12px', width: 'auto' }}
            >
              <option value="All">All Fleet States ({vehicles.length})</option>
              <option value="Active">Active ({activeCount})</option>
              <option value="Idle">Idle ({idleCount})</option>
              <option value="Maintenance">Maintenance ({maintenanceCount})</option>
            </select>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {isLoadingSkeleton ? (
            <div style={{ padding: '16px' }}>
              <SkeletonTable rows={5} />
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div style={{ padding: '32px 16px' }}>
              <EmptyState
                icon={Truck}
                title="No Vehicles Match Filters"
                description="No municipal vehicles match the current search term or filter status."
                badgeText="Fleet Filter Active"
              />
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vehicle ID</th>
                    <th>Driver Operator</th>
                    <th>Status</th>
                    <th>Vehicle Type</th>
                    <th>Live GPS Location</th>
                    <th>Speed & Heading</th>
                    <th>Payload / Fuel</th>
                    <th>Assigned Route</th>
                    <th style={{ textAlign: 'right' }}>Track</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((v) => {
                    const isSelected = selectedVehicleId === v.id;
                    const lat = v.coordinates?.lat ?? v.latitude;
                    const lng = v.coordinates?.lng ?? v.longitude;

                    return (
                      <tr
                        key={v.id}
                        onClick={() => setSelectedVehicleId(isSelected ? null : v.id)}
                        style={{
                          background: isSelected ? 'rgba(8, 145, 178, 0.08)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary-600)' }}>
                              {v.id}
                            </span>
                            {isSelected && (
                              <span className="badge badge-active" style={{ fontSize: '9px' }}>
                                Selected
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {v.plateNumber}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {v.driverName}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {v.driverPhone}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              v.status === 'Active'
                                ? 'badge-active'
                                : v.status === 'Idle'
                                ? 'badge-pending'
                                : 'badge-neutral'
                            }`}
                          >
                            {v.status}
                          </span>
                        </td>
                        <td>{v.type}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            <MapPin size={12} style={{ color: 'var(--accent-cyan)' }} />
                            <span>{v.lastLocation}</span>
                          </div>
                          {lat && lng && (
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              [{lat.toFixed(4)}, {lng.toFixed(4)}]
                            </div>
                          )}
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                            {v.speed} km/h
                          </span>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            {v.heading}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Battery size={13} style={{ color: 'var(--primary-500)' }} />
                            <span>{v.batteryOrFuel}%</span>
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            Load: {v.loadCapacityPercent}%
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {v.assignedRoute}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVehicleId(isSelected ? null : v.id);
                            }}
                            className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                          >
                            {isSelected ? 'Focused' : 'View on Map'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
