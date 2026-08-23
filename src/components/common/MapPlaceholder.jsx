import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Radio, MapPin } from 'lucide-react';

export const MapPlaceholder = ({
  center = [28.6139, 77.2090], // Default urban center
  zoom = 13,
  title = 'GIS Fleet Telemetry View',
  activeItemsCount = 0,
  itemType = 'Vehicles',
  emptyMessage = 'No active GPS telemetry markers plotted.',
  showHud = true,
  children,
}) => {
  const mapRef = useRef(null);

  // Invalidate map size to prevent gray tiles on tab changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="leaflet-map-wrapper">
      {/* Top HUD Telemetry Indicator */}
      {showHud && (
        <div className="map-hud-overlay">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={13} className="animate-pulse" style={{ color: activeItemsCount > 0 ? '#10b981' : '#94a3b8' }} />
            <div className="map-hud-stat">
              <span className="map-hud-stat-label">Feed Status</span>
              <span className="map-hud-stat-val">{activeItemsCount > 0 ? 'Live Stream' : 'Standby'}</span>
            </div>
          </div>

          <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)' }} />

          <div className="map-hud-stat">
            <span className="map-hud-stat-label">{itemType}</span>
            <span className="map-hud-stat-val">{activeItemsCount}</span>
          </div>
        </div>
      )}

      {/* Empty State Overlay if count is 0 and no children */}
      {activeItemsCount === 0 && !children && (
        <div className="map-empty-overlay-banner">
          <MapPin size={13} style={{ color: 'var(--accent-amber)' }} />
          <span>{emptyMessage}</span>
        </div>
      )}

      {/* Leaflet Interactive Map Container */}
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="leaflet-container"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {children}
      </MapContainer>
    </div>
  );
};
