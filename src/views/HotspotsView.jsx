import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { MapPlaceholder } from '../components/common/MapPlaceholder';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonChart, SkeletonTable } from '../components/common/SkeletonLoader';
import { FleetGisMarkers } from '../components/maps/FleetGisMarkers';
import {
  Flame,
  BrainCircuit,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const HotspotsView = () => {
  const { hotspots, isLoadingSkeleton } = useDashboard();

  return (
    <div>
      {/* ML Engine Status Banner */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, var(--bg-surface) 100%)',
          borderColor: 'rgba(124, 58, 237, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--bg-surface-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-violet)',
                border: '1px solid rgba(124, 58, 237, 0.25)',
                flexShrink: 0,
              }}
            >
              <BrainCircuit size={20} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Spatial-Temporal AI Anomaly Detection Engine</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Predictive overflow clustering using historical geotag patterns & municipal collection schedules.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Zones</div>
              <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-rose)' }}>{hotspots.length || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Spatial Heatmap & Distribution Chart */}
      <div className="two-col-grid">
        {/* Heatmap Map */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Flame size={18} style={{ color: 'var(--accent-rose)' }} />
                Spatial Waste Density & Heatmap Layer
              </h3>
              <p className="card-subtitle">Geographic risk clustering and surge radius</p>
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {isLoadingSkeleton ? (
              <SkeletonChart height={340} />
            ) : (
              <MapPlaceholder
                center={[23.0350, 72.5500]}
                zoom={12}
                title="Ahmedabad Risk Density Heatmap"
                activeItemsCount={hotspots.length || 10}
                itemType="Hotspot Zones"
                emptyMessage="No high-risk zones detected. Awaiting citizen submission density thresholds."
              >
                <FleetGisMarkers hotspots={hotspots} showHotspots={true} showRoutes={false} />
              </MapPlaceholder>
            )}
          </div>
        </div>

        {/* Risk Level Distribution Chart */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <BarChart3 size={18} style={{ color: 'var(--accent-amber)' }} />
                Zone Risk Probability Distribution
              </h3>
              <p className="card-subtitle">Predicted overflow probability score by municipal ward</p>
            </div>
          </div>

          <div className="card-body" style={{ minHeight: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isLoadingSkeleton ? (
              <SkeletonChart height={300} />
            ) : (
              <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EmptyState
                  icon={BarChart3}
                  title="No Predictive Risk Data"
                  description="Clustering algorithm requires min. 20 citizen incident logs to establish predictive baseline."
                  badgeText="Model Pipeline Standing By"
                  compact={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Predicted Hotspots List / Table */}
      <div className="glass-card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Sparkles size={18} style={{ color: 'var(--accent-violet)' }} />
              High-Risk Predicted Hotspots Feed
            </h3>
            <p className="card-subtitle">
              Algorithmically ranked urban sectors projected to experience waste surge in next 24-48 hours
            </p>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {isLoadingSkeleton ? (
            <div style={{ padding: '16px' }}>
              <SkeletonTable rows={4} cols={5} />
            </div>
          ) : hotspots.length === 0 ? (
            <div style={{ padding: '32px 16px' }}>
              <EmptyState
                icon={Flame}
                title="No Hotspots Predicted Yet"
                description="The spatial-temporal machine learning model has not identified any anomalous accumulation zones. Predicted clusters will appear here once inference runs."
                badgeText="Awaiting Inflow Thresholds"
              />
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Zone Code</th>
                    <th>Sector / Area</th>
                    <th>Risk Level</th>
                    <th>Confidence</th>
                    <th>Predicted Surge Volume</th>
                    <th>Primary Anomaly Factor</th>
                    <th>Suggested Action</th>
                  </tr>
                </thead>
                <tbody>
                  {hotspots.map((h) => (
                    <tr key={h.zoneId}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-rose)' }}>
                          {h.zoneId}
                        </span>
                      </td>
                      <td>{h.zoneName}</td>
                      <td>
                        <span
                          className={`badge ${
                            h.riskLevel === 'High'
                              ? 'badge-high'
                              : h.riskLevel === 'Medium'
                              ? 'badge-pending'
                              : 'badge-active'
                          }`}
                        >
                          {h.riskLevel} Risk
                        </span>
                      </td>
                      <td>{h.confidenceScore}%</td>
                      <td>{h.predictedVolume}</td>
                      <td>{h.primaryAnomaly}</td>
                      <td style={{ color: 'var(--primary-600)' }}>{h.suggestedAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
