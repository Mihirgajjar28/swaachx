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
  const handleDetectGPS = async () => {
    if (!navigator.geolocation) {
      addToast('Geolocation not supported by browser. Locating closest city dustbin.', 'warning');
      const nearest = await locateNearestDustbin();
      if (nearest) setIsNavigating(true);
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: 'My GPS Location',
        };
        setUserLocation(coords);
        setIsDetectingLocation(false);
        const nearest = await locateNearestDustbin(coords);
        if (nearest) {
          setIsNavigating(true);
          addToast(`Located nearest bin: ${nearest.name || 'Dustbin'}`, 'success');
        }
      },
      async (err) => {
        console.warn('Geolocation error:', err);
        setIsDetectingLocation(false);
        const nearest = await locateNearestDustbin();
        if (nearest) {
          setIsNavigating(true);
          addToast(`Located nearest bin: ${nearest.name || 'Dustbin'}`, 'success');
        }
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

      {/* 3. Full-Width Map with Direct Dustbin Locations & Floating Direct Pin Selector */}
      <div
        className="glass-card"
        style={{
          position: 'relative',
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

        {/* Floating Direct Pin Quick Bar on Map */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} color="#10b981" /> Public Bins:
          </div>
          {filteredDustbins.map((bin) => {
            const isSelected = selectedDustbin?.id === bin.id;
            return (
              <button
                key={bin.id}
                onClick={() => handleSelectAndRoute(bin)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? '#10b981' : 'var(--bg-surface)',
                  color: isSelected ? '#ffffff' : 'var(--text-primary)',
                  border: isSelected ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                  fontSize: '11px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: isSelected ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{bin.name}</span>
                <span
                  style={{
                    fontSize: '9px',
                    padding: '1px 4px',
                    borderRadius: '4px',
                    background: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(16, 185, 129, 0.12)',
                    color: isSelected ? '#ffffff' : '#10b981',
                    fontWeight: 800,
                  }}
                >
                  {bin.fillLevel}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
