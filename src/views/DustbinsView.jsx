import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { DustbinMap } from '../components/maps/DustbinMap';
import {
  Trash2,
  Compass,
  Search,
  X,
  Footprints,
  MapPin,
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

  // Select any bin and instantly map walking route directly on map
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

  // Trigger browser GPS locator and route to closest bin directly on map
  const handleDetectGPS = () => {
    setIsNavigating(true);
    const result = locateNearestDustbin();
    if (result && typeof result.then === 'function') {
      result.then((bin) => {
        if (bin) setSelectedDustbin(bin);
      });
    } else if (dustbins && dustbins.length > 0) {
      setSelectedDustbin(dustbins[0]);
    }
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setActiveDustbinRoute(null);
  };

  return (
    <div className="animate-fade-in-up" style={{ paddingBottom: '24px' }}>
      {/* 1. Clean Top Action & Filter Bar */}
      <div
        className="glass-card"
        style={{
          padding: '14px 18px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Title */}
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
              Click any dustbin on the map or tap Find Nearest Bin for live walking directions
            </p>
          </div>
        </div>

        {/* Search, Category Filters & Nearest CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '200px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
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
                height: '34px',
                paddingLeft: '30px',
                paddingRight: searchQuery ? '28px' : '10px',
                fontSize: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '4px' }}>
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
                style={{ fontSize: '11px', padding: '4px 9px', height: '34px' }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Find Nearest Bin CTA Button */}
          <button
            onClick={handleDetectGPS}
            disabled={isDetectingLocation}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              height: '34px',
            }}
          >
            <Compass size={15} className={isDetectingLocation ? 'animate-spin' : ''} />
            <span>{isDetectingLocation ? 'Locating...' : '📍 Find Nearest Bin'}</span>
          </button>
        </div>
      </div>

      {/* 2. Active Navigation Route Banner */}
      {isNavigating && selectedDustbin && (
        <div
          className="glass-card animate-fade-in-up"
          style={{
            padding: '10px 16px',
            marginBottom: '12px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, var(--bg-surface) 100%)',
            borderColor: '#10b981',
            borderWidth: '1.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Footprints size={18} color="#10b981" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Walking route to {selectedDustbin.name} ({selectedDustbin.distanceFormatted || 'Nearby'})
            </span>
          </div>
          <button
            onClick={handleStopNavigation}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '11px', padding: '3px 10px', borderColor: '#10b981', color: '#10b981' }}
          >
            <X size={12} /> End Route
          </button>
        </div>
      )}

      {/* 3. Full-Width Map with Direct Dustbin Locations */}
      <div
        className="glass-card"
        style={{
          height: 'calc(100vh - 210px)',
          minHeight: '560px',
          width: '100%',
          padding: '0',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
        }}
      >
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
  );
};
