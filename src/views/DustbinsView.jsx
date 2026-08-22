import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { DustbinMap } from '../components/maps/DustbinMap';
import {
  Trash2,
  Navigation,
  MapPin,
  Compass,
  Search,
  X,
  Footprints,
} from 'lucide-react';

export const DustbinsView = () => {
  const {
    dustbins,
    vehicles,
    userLocation,
    setUserLocation,
    selectedDustbin,
    setSelectedDustbin,
    activeDustbinRoute,
    setActiveDustbinRoute,
    locateNearestDustbin,
    routeToDustbin,
    calculateDistanceMeters,
    formatDistance,
    addToast,
  } = useDashboard();

  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Compute live distances from user's coordinates to all dustbins
  const processedDustbins = useMemo(() => {
    return dustbins.map((bin) => {
      const dist = calculateDistanceMeters(
        userLocation?.lat,
        userLocation?.lng,
        bin.coordinates?.lat,
        bin.coordinates?.lng
      );
      return {
        ...bin,
        distanceMeters: dist,
        distanceFormatted: formatDistance(dist),
        walkMins: dist ? Math.max(1, Math.round(dist / 80)) : 1,
      };
    });
  }, [dustbins, userLocation, calculateDistanceMeters, formatDistance]);

  // Filtered & Sorted Dustbins
  const filteredDustbins = useMemo(() => {
    return processedDustbins
      .filter((bin) => {
        // Category Filter
        if (filterCategory === 'Wet' && !bin.category.includes('Wet') && !bin.category.includes('Organic') && !bin.category.includes('Food')) return false;
        if (filterCategory === 'Dry' && !bin.category.includes('Dry') && !bin.category.includes('Recyclable')) return false;
        if (filterCategory === 'EWaste' && !bin.category.includes('E-Waste') && !bin.category.includes('Hazardous')) return false;

        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            bin.name.toLowerCase().includes(q) ||
            bin.ward.toLowerCase().includes(q) ||
            bin.id.toLowerCase().includes(q)
          );
        }

        return true;
      })
      .sort((a, b) => (a.distanceMeters ?? 999999) - (b.distanceMeters ?? 999999));
  }, [processedDustbins, filterCategory, searchQuery]);

  // Select any bin and instantly map walking route
  const handleSelectAndRoute = (bin) => {
    if (!bin) return;
    setIsNavigating(true);
    if (routeToDustbin) {
      routeToDustbin(bin);
    } else {
      setSelectedDustbin(bin);
      if (bin.coordinates && userLocation) {
        setActiveDustbinRoute([
          [userLocation.lat, userLocation.lng],
          [bin.coordinates.lat, bin.coordinates.lng],
        ]);
      }
    }
  };

  // Trigger browser GPS locator and route to closest bin
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation not supported by browser. Using default city coordinates.', 'warning');
      const nearest = locateNearestDustbin();
      if (nearest) setIsNavigating(true);
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: 'My GPS Location',
        };
        setUserLocation(coords);
        setIsDetectingLocation(false);
        const nearest = locateNearestDustbin(coords);
        if (nearest) setIsNavigating(true);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsDetectingLocation(false);
        const nearest = locateNearestDustbin();
        if (nearest) setIsNavigating(true);
      },
      { timeout: 8000 }
    );
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setActiveDustbinRoute(null);
  };

  return (
    <div className="animate-fade-in-up" style={{ paddingBottom: '24px' }}>
      {/* 1. Clean Top Action Bar */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#10b981',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Trash2 size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Dustbin Locator
            </h1>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
              Find nearest public waste bins & get walking directions
            </p>
          </div>
        </div>

        <button
          onClick={handleDetectGPS}
          disabled={isDetectingLocation}
          className="btn btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          <Compass size={15} className={isDetectingLocation ? 'animate-spin' : ''} />
          <span>{isDetectingLocation ? 'Locating...' : '📍 Find Nearest Bin'}</span>
        </button>
      </div>

      {/* 2. Split Screen: List on Left, Map on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 380px) 1fr',
          gap: '16px',
          alignItems: 'stretch',
        }}
        className="dustbin-locator-grid"
      >
        {/* Left Column: Search, Category Pills & Clean Bin Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Search & Category Pills */}
          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ position: 'relative', marginBottom: '10px', width: '100%' }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Search dustbins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{
                  width: '100%',
                  height: '38px',
                  paddingLeft: '36px',
                  paddingRight: searchQuery ? '32px' : '12px',
                  fontSize: '13px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  boxShadow: 'var(--shadow-xs)',
                  outline: 'none',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Clean Category Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {[
                { id: 'All', label: 'All' },
                { id: 'Wet', label: '🍏 Wet Waste' },
                { id: 'Dry', label: '♻️ Dry Waste' },
                { id: 'EWaste', label: '🔋 E-Waste' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`btn btn-sm ${filterCategory === cat.id ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Dustbins List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '560px', overflowY: 'auto', paddingRight: '2px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', padding: '0 2px' }}>
              Nearby Locations ({filteredDustbins.length})
            </div>

            {filteredDustbins.length === 0 ? (
              <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
                <Trash2 size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 6px' }} />
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No dustbins match the search query.</div>
              </div>
            ) : (
              filteredDustbins.map((bin) => {
                const isSelected = selectedDustbin?.id === bin.id;
                const isCritical = bin.fillLevel >= 80;
                const isModerate = bin.fillLevel >= 50 && bin.fillLevel < 80;
                const fillBadgeColor = isCritical ? '#e11d48' : isModerate ? '#f59e0b' : '#10b981';
                const fillBadgeBg = isCritical ? '#ffe4e6' : isModerate ? '#fef3c7' : '#ecfdf5';

                return (
                  <div
                    key={bin.id}
                    onClick={() => handleSelectAndRoute(bin)}
                    className="glass-card animate-scale-in"
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid #10b981' : '1px solid var(--border-subtle)',
                      boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'var(--shadow-sm)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
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

                    <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px' }}>
                      {bin.name}
                    </h3>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={11} color="#10b981" /> {bin.ward}
                    </div>

                    {/* Fill Level Bar */}
                    <div style={{ width: '100%', height: '5px', background: 'var(--bg-card)', borderRadius: '99px', overflow: 'hidden', marginBottom: '10px' }}>
                      <div
                        style={{
                          width: `${bin.fillLevel}%`,
                          height: '100%',
                          background: fillBadgeColor,
                          borderRadius: '99px',
                        }}
                      />
                    </div>

                    {/* Bottom Proximity & Route Action */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Navigation size={11} /> {bin.distanceFormatted}
                        <span style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)' }}>
                          (~{bin.walkMins}m walk)
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAndRoute(bin);
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '3px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <Navigation size={10} /> Walk Here
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Clean Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Active Navigation Banner */}
          {isNavigating && selectedDustbin && (
            <div
              className="glass-card animate-fade-in-up"
              style={{
                padding: '10px 14px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, var(--bg-surface) 100%)',
                borderColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Footprints size={16} color="#10b981" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Walking route to {selectedDustbin.name} ({selectedDustbin.distanceFormatted || 'Nearby'})
                </span>
              </div>
              <button
                onClick={handleStopNavigation}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '10px', padding: '2px 8px' }}
              >
                <X size={11} /> End Route
              </button>
            </div>
          )}

          {/* Clean Map with Automatic Route Rendering & Live Municipal Fleet */}
          <div style={{ height: '580px', width: '100%', minHeight: '440px' }}>
            <DustbinMap
              dustbins={filteredDustbins}
              vehicles={vehicles}
              showTrucks={true}
              userLocation={userLocation}
              selectedDustbin={selectedDustbin}
              activeRoute={activeDustbinRoute}
              onSelectDustbin={(bin) => handleSelectAndRoute(bin)}
              onStartRoute={(bin) => handleSelectAndRoute(bin)}
              style={{ height: '100%', width: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
