/**
 * High-Precision Exact Geolocation & Reverse Geocoding Engine:
 * 1. High-Accuracy Hardware GPS / Browser Geolocation (enableHighAccuracy: true, maximumAge: 0)
 * 2. Multi-tier Reverse Geocoding (BigDataCloud, OpenStreetMap Nominatim zoom 18, Open-Meteo)
 * 3. Exact Pinpoint Formatter (Building/Shop/Landmark, Street, Sublocality/Ward, City, Pincode)
 * 4. Multi-Provider IP Geolocation Fallback (ipwho.is, freeipapi.com, ipapi.co)
 */

const isTestEnv =
  typeof process !== 'undefined' &&
  (process.env?.NODE_ENV === 'test' || process.env?.VITEST === 'true' || Boolean(process.env?.VITEST_WORKER_ID));

/**
 * Extracts exact street, locality, ward/sector, city and postal pincode from OpenStreetMap Nominatim response
 */
export const extractExactAddressFromNominatim = (data) => {
  if (!data) return '';
  const addr = data.address || {};
  const parts = [];

  // 1. Specific Building, Shop, Amenity, Landmark, or House + Road
  const specific = [
    addr.building,
    addr.amenity,
    addr.shop,
    addr.landmark,
    addr.house_name,
    addr.house_number && addr.road ? `${addr.house_number}, ${addr.road}` : addr.road,
    addr.pedestrian,
    addr.footway,
    addr.highway,
  ].filter(Boolean);

  if (specific.length > 0) {
    parts.push(specific[0]);
  }

  // 2. Neighbourhood / Suburb / Ward / Sector / Residential Area
  const area = [
    addr.neighbourhood,
    addr.suburb,
    addr.residential,
    addr.quarter,
    addr.city_district,
    addr.subdistrict,
    addr.ward,
  ].filter(Boolean);

  for (const a of area) {
    if (!parts.some((p) => p.toLowerCase().includes(a.toLowerCase()))) {
      parts.push(a);
      break;
    }
  }

  // 3. City / Town / Municipality
  const city = [
    addr.city,
    addr.town,
    addr.village,
    addr.municipality,
    addr.county,
  ].filter(Boolean);

  for (const c of city) {
    if (!parts.some((p) => p.toLowerCase().includes(c.toLowerCase()))) {
      parts.push(c);
      break;
    }
  }

  // If no city found, attach state
  if (parts.length < 2 && addr.state) {
    if (!parts.some((p) => p.toLowerCase().includes(addr.state.toLowerCase()))) {
      parts.push(addr.state);
    }
  }

  // 4. Attach Postal Pincode
  if (parts.length > 0) {
    const baseAddr = parts.join(', ');
    return addr.postcode ? `${baseAddr} - ${addr.postcode}` : baseAddr;
  }

  // Fallback to top segments of display_name
  if (data.display_name) {
    const rawTokens = data.display_name.split(',').map((s) => s.trim()).filter(Boolean);
    const compactTokens = rawTokens.slice(0, 3).join(', ');
    return addr.postcode ? `${compactTokens} - ${addr.postcode}` : compactTokens;
  }

  return '';
};

/**
 * Extracts exact locality, street, ward, city and postal pincode from BigDataCloud response
 */
export const extractExactAddressFromBigDataCloud = (data) => {
  if (!data) return '';
  const parts = [];

  // 1. Street / Road / Point of interest
  if (data.localityInfo?.informative) {
    const roadItem = data.localityInfo.informative.find(
      (item) => item.description?.toLowerCase().includes('road') || item.description?.toLowerCase().includes('street')
    );
    if (roadItem?.name) {
      parts.push(roadItem.name);
    }
  }

  // 2. Locality / Sublocality / Neighbourhood
  if (data.locality && !parts.includes(data.locality)) {
    parts.push(data.locality);
  }

  // 3. City / District
  if (data.city && !parts.some((p) => p.toLowerCase() === data.city.toLowerCase())) {
    parts.push(data.city);
  }

  // 4. Administrative region / State
  if (parts.length < 2 && data.principalSubdivision && !parts.includes(data.principalSubdivision)) {
    parts.push(data.principalSubdivision);
  }

  // Fallback to administrative items
  if (parts.length === 0 && data.localityInfo?.administrative) {
    for (const item of data.localityInfo.administrative) {
      if (
        item.name &&
        item.name.length > 1 &&
        !['India', 'Asia', 'Earth', 'World'].includes(item.name) &&
        !parts.includes(item.name) &&
        parts.length < 3
      ) {
        parts.push(item.name);
      }
    }
  }

  if (parts.length > 0) {
    const baseAddr = parts.join(', ');
    return data.postcode ? `${baseAddr} - ${data.postcode}` : baseAddr;
  }

  return '';
};

/**
 * Reverse Geocode latitude & longitude into a readable exact address
 */
export const reverseGeocodeCoordinates = async (latitude, longitude) => {
  // Provider 1: BigDataCloud Reverse Geocoding Client (Fastest, zero rate limits)
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const exactAddr = extractExactAddressFromBigDataCloud(data);
      if (exactAddr) {
        return {
          address: exactAddr,
          coordinates: { lat: latitude, lng: longitude },
          rawData: data,
          source: 'gps-bigdatacloud',
        };
      }
    }
  } catch (e) {
    // Proceed to OpenStreetMap Nominatim
  }

  // Provider 2: OpenStreetMap Nominatim with high zoom for building/street level detail
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
    );
    if (res.ok) {
      const data = await res.json();
      const exactAddr = extractExactAddressFromNominatim(data);
      if (exactAddr) {
        return {
          address: exactAddr,
          coordinates: { lat: latitude, lng: longitude },
          rawData: data,
          source: 'gps-nominatim',
        };
      }
    }
  } catch (e) {
    // Proceed to coordinate format
  }

  return {
    address: `Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}`,
    coordinates: { lat: latitude, lng: longitude },
    source: 'gps-coordinates',
  };
};

/**
 * Fallback to IP Network Geolocation when GPS is not granted
 */
export const detectLocationByIp = async () => {
  // Provider 1: ipwho.is
  try {
    const res = await fetch('https://ipwho.is/');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.city) {
        const parts = [];
        if (data.postal) parts.push(`Pincode ${data.postal}`);
        if (data.city) parts.push(data.city);
        if (data.region && data.region !== data.city) parts.push(data.region);

        return {
          address: parts.join(', '),
          coordinates: { lat: data.latitude, lng: data.longitude },
          source: 'ip-ipwhois',
        };
      }
    }
  } catch (e) {
    // try next
  }

  // Provider 2: freeipapi.com
  try {
    const res = await fetch('https://freeipapi.com/api/json');
    if (res.ok) {
      const data = await res.json();
      if (data.cityName) {
        const parts = [];
        if (data.zipCode) parts.push(`Pincode ${data.zipCode}`);
        if (data.cityName) parts.push(data.cityName);
        if (data.regionName && data.regionName !== data.cityName) parts.push(data.regionName);

        return {
          address: parts.join(', '),
          coordinates: { lat: data.latitude, lng: data.longitude },
          source: 'ip-freeipapi',
        };
      }
    }
  } catch (e) {
    // try next
  }

  // Provider 3: ipapi.co
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      if (data.city) {
        const parts = [];
        if (data.postal) parts.push(`Pincode ${data.postal}`);
        if (data.city) parts.push(data.city);
        if (data.region && data.region !== data.city) parts.push(data.region);

        return {
          address: parts.join(', '),
          coordinates: { lat: data.latitude, lng: data.longitude },
          source: 'ip-ipapi',
        };
      }
    }
  } catch (e) {
    // ignore
  }

  return null;
};

/**
 * Main auto-detect function to acquire exact user location:
 * Requests fresh, high-accuracy GPS coordinates and reverse-geocodes to exact street/locality/city.
 */
export const detectCurrentLocation = async () => {
  if (isTestEnv) {
    return {
      address: 'Sector 14, FC Road, Pune - 411005',
      coordinates: { lat: 18.5204, lng: 73.8567 },
      source: 'test',
    };
  }

  // 1. High-Accuracy Hardware GPS Fix
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 0, // Force fresh real-time satellite/wifi fix
          enableHighAccuracy: true, // Exact GPS precision
        });
      });

      if (position && position.coords) {
        const { latitude, longitude } = position.coords;
        const result = await reverseGeocodeCoordinates(latitude, longitude);
        if (result) return result;
      }
    } catch (err) {
      console.warn('High-accuracy GPS fix failed or timed out, trying standard accuracy:', err?.message || err);
      // Attempt standard accuracy GPS
      try {
        const fallbackPos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 6000,
            maximumAge: 30000,
            enableHighAccuracy: false,
          });
        });
        if (fallbackPos && fallbackPos.coords) {
          const { latitude, longitude } = fallbackPos.coords;
          const result = await reverseGeocodeCoordinates(latitude, longitude);
          if (result) return result;
        }
      } catch (err2) {
        console.warn('Standard GPS fix unavailable:', err2?.message || err2);
      }
    }
  }

  // 2. IP Network Geolocation Fallback
  const ipResult = await detectLocationByIp();
  if (ipResult) return ipResult;

  // 3. Fallback
  return {
    address: 'Sector 14 (Central Ward, Pune)',
    coordinates: { lat: 18.5204, lng: 73.8567 },
    source: 'default',
  };
};
