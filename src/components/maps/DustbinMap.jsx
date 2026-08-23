import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Polyline, Circle, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin } from 'lucide-react';

/**
 * Clean & minimal Leaflet HTML DivIcon for Smart Dustbins
 */
export const createSmartDustbinIcon = (bin, isSelected = false) => {
  const fillLevel = bin.fillLevel ?? 0;
  const isCritical = fillLevel >= 80;
  const isModerate = fillLevel >= 50 && fillLevel < 80;

  const color = isCritical ? '#e11d48' : isModerate ? '#f59e0b' : '#10b981';

  const category = bin.category || '';
  const emoji = category.includes('Organic') || category.includes('Wet') || category.includes('Food')
    ? '🍏'
    : category.includes('E-Waste') || category.includes('Hazardous')
    ? '🔋'
    : category.includes('Recyclable') || category.includes('Dry')
    ? '♻️'
    : '🗑️';

  const size = isSelected ? 44 : 38;

  return L.divIcon({
    className: 'custom-dustbin-map-pin',
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s ease;
        transform: ${isSelected ? 'scale(1.12)' : 'scale(1)'};
      ">
        ${isCritical ? `
          <div style="
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            background: #e11d48;
            opacity: 0.35;
            animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
        ` : ''}

        ${isSelected ? `
          <div style="
            position: absolute;
            inset: -6px;
            border-radius: 50%;
            border: 2px dashed #10b981;
          "></div>
        ` : ''}

        <div style="
          width: ${size - 4}px;
          height: ${size - 4}px;
          border-radius: 50%;
          background: #ffffff;
          border: 2.5px solid ${color};
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isSelected ? '17px' : '15px'};
          z-index: 2;
        ">
          ${emoji}
        </div>

        <div style="
          position: absolute;
          bottom: -6px;
          background: ${color};
          color: #ffffff;
          font-size: 9px;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          z-index: 3;
        ">
          ${fillLevel}%
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  });
};

/**
 * Truck Map Pin for Live Municipal Fleet on Citizen Map
 */
export const createTruckMapPin = (truck) => {
  const isMoving = truck.status === 'Active' && (truck.speed || 0) > 0;
  const color = truck.status === 'Active' ? '#0891b2' : truck.status === 'Idle' ? '#f59e0b' : '#94a3b8';
  return L.divIcon({
    className: 'custom-truck-map-pin',
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        ${isMoving ? `
          <div style="
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            background: ${color};
            opacity: 0.35;
            animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
        ` : ''}
        <div style="
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #ffffff;
          border: 2.5px solid ${color};
          box-shadow: 0 4px 12px rgba(0,0,0,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          z-index: 2;
        ">
          🚛
        </div>
        <div style="
          position: absolute;
          bottom: -6px;
          background: ${color};
          color: #ffffff;
          font-size: 8.5px;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          z-index: 3;
        ">
          ${truck.id?.replace('TRK-AMD-', 'T-') || 'TRK'}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
};

/**
 * User Location Pin
 */
export const createUserLocationPin = () => {
  return L.divIcon({
    className: 'custom-user-gps-pin',
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: #3b82f6;
          opacity: 0.35;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #2563eb;
          border: 2.5px solid #ffffff;
          box-shadow: 0 3px 10px rgba(37, 99, 235, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          color: #ffffff;
          z-index: 2;
        ">
          📍
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

/**
 * Helper to smoothly fly map to active selection and fit bounds when walking route is active
 */
const MapController = ({ centerCoords, activeRoute = null, zoom = 14 }) => {
  const map = useMap();

  useEffect(() => {
    if (activeRoute && Array.isArray(activeRoute) && activeRoute.length >= 2) {
      // Auto fit bounds to encompass user location, destination dustbin and path
      try {
        map.fitBounds(activeRoute, {
          padding: [50, 50],
          maxZoom: 16,
          animate: true,
        });
      } catch (e) {
        console.warn('fitBounds error:', e);
      }
    } else if (centerCoords && centerCoords.lat && centerCoords.lng) {
      map.flyTo([centerCoords.lat, centerCoords.lng], zoom, {
        duration: 1,
        easeLinearity: 0.25,
      });
    }
  }, [centerCoords, activeRoute, zoom, map]);

  return null;
};

export const DustbinMap = ({
  dustbins = [],
  vehicles = [],
  showTrucks = true,
  userLocation = null,
  selectedDustbin = null,
  activeRoute = null,
  onSelectDustbin,
  onStartRoute,
  className = '',
  style = {},
}) => {
  const defaultCenter = [23.0350, 72.5750];

  const activeCenter = selectedDustbin?.coordinates
    ? selectedDustbin.coordinates
    : userLocation?.lat
    ? { lat: userLocation.lat, lng: userLocation.lng }
    : { lat: defaultCenter[0], lng: defaultCenter[1] };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        ...style,
      }}
      className={className}
    >
      <MapContainer
        center={[activeCenter.lat, activeCenter.lng]}
        zoom={13}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <MapController centerCoords={activeCenter} activeRoute={activeRoute} zoom={selectedDustbin ? 15 : 13} />

        {/* 1. User Location Radar & Marker */}
        {userLocation && userLocation.lat && userLocation.lng && (
          <>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={200}
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.12,
                weight: 1.5,
              }}
            />
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={createUserLocationPin()}
            >
              <Tooltip direction="top" offset={[0, -18]}>
                <span style={{ fontWeight: 700 }}>📍 You Are Here</span>
              </Tooltip>
            </Marker>
          </>
        )}

        {/* 2. Walking Navigation Route (Dual Emerald Glow & Dash Lines) */}
        {activeRoute && activeRoute.length >= 2 && (
          <>
            <Polyline
              positions={activeRoute}
              color="#10b981"
              weight={8}
              opacity={0.3}
            />
            <Polyline
              positions={activeRoute}
              color="#047857"
              weight={4.5}
              opacity={0.95}
              dashArray="6, 8"
            />
          </>
        )}

        {/* 3. Dustbins Layer */}
        {dustbins.map((bin) => {
          if (!bin.coordinates || !bin.coordinates.lat || !bin.coordinates.lng) return null;
          const isSelected = selectedDustbin?.id === bin.id;
          const isCritical = bin.fillLevel >= 80;
          const isModerate = bin.fillLevel >= 50 && bin.fillLevel < 80;
          const fillBadgeColor = isCritical ? '#e11d48' : isModerate ? '#f59e0b' : '#10b981';
          const fillBadgeBg = isCritical ? '#ffe4e6' : isModerate ? '#fef3c7' : '#ecfdf5';

          return (
            <Marker
              key={bin.id}
              position={[bin.coordinates.lat, bin.coordinates.lng]}
              icon={createSmartDustbinIcon(bin, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onSelectDustbin) onSelectDustbin(bin);
                },
              }}
            >
              <Popup>
                <div
                  style={{ padding: '4px', minWidth: '200px', color: '#0f172a', cursor: 'pointer' }}
                  onClick={() => {
                    if (onSelectDustbin) onSelectDustbin(bin);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>
                      {bin.id}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '99px',
                        background: fillBadgeBg,
                        color: fillBadgeColor,
                      }}
                    >
                      {bin.fillLevel}% Full
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
                    {bin.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <MapPin size={11} color="#10b981" /> {bin.ward}
                  </div>

                  {onStartRoute && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartRoute(bin);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px',
                        background: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      <Navigation size={12} /> Walk Here
                    </button>
                  )}
                </div>
              </Popup>

              <Tooltip direction="top" offset={[0, -20]} permanent={false}>
                <span
                  style={{ fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => {
                    if (onSelectDustbin) onSelectDustbin(bin);
                  }}
                >
                  {bin.name}
                </span>
              </Tooltip>
            </Marker>
          );
        })}

        {/* 4. Live Ahmedabad Fleet Trucks Layer */}
        {showTrucks &&
          vehicles.map((truck) => {
            if (!truck.coordinates || !truck.coordinates.lat || !truck.coordinates.lng) return null;
            const statusColor = truck.status === 'Active' ? '#10b981' : truck.status === 'Idle' ? '#f59e0b' : '#64748b';

            return (
              <Marker
                key={truck.id}
                position={[truck.coordinates.lat, truck.coordinates.lng]}
                icon={createTruckMapPin(truck)}
              >
                <Popup>
                  <div style={{ padding: '4px', minWidth: '220px', color: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#0891b2', fontFamily: 'var(--font-mono)' }}>
                        🚛 {truck.id}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '99px',
                          background: `${statusColor}18`,
                          color: statusColor,
                        }}
                      >
                        {truck.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
                      {truck.plateNumber || 'MH-12-Q-4821'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                      👤 Driver: <strong>{truck.driverName}</strong>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', lineHeight: 1.3 }}>
                      📍 {truck.lastLocation}
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '4px',
                        background: '#f8fafc',
                        padding: '6px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        color: '#334155',
                      }}
                    >
                      <div>
                        Speed: <strong>{truck.speed || 0} km/h</strong>
                      </div>
                      <div>
                        Load: <strong>{truck.loadCapacityPercent ?? 0}%</strong>
                      </div>
                      <div style={{ gridColumn: 'span 2', fontSize: '9.5px', color: '#64748b' }}>
                        🛣️ {truck.assignedRoute || 'Active Sector Route'}
                      </div>
                    </div>
                  </div>
                </Popup>

                <Tooltip direction="top" offset={[0, -22]}>
                  <span style={{ fontWeight: 700 }}>
                    🚛 {truck.id} — {truck.driverName} ({truck.plateNumber})
                  </span>
                </Tooltip>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};
