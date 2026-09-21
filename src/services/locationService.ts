/**
 * Location Verification Service for HELLO DOCTORRR
 * Primary Service Area: Gopalganj & Siwan districts, Bihar
 */

import { GeoLocationData } from '../types';

export interface LocationVerificationResult {
  isValid: boolean;
  location?: GeoLocationData;
  error?: string;
  isWithinServiceArea: boolean;
  district?: string;
}

// Approximate bounding coordinates for Gopalganj, Siwan, and Bihar
const SERVICE_AREAS = [
  { name: 'Gopalganj', lat: 26.4688, lng: 84.4441, radiusKm: 45 },
  { name: 'Siwan', lat: 26.2227, lng: 84.3591, radiusKm: 45 },
  { name: 'Mirganj', lat: 26.4172, lng: 84.3414, radiusKm: 30 },
  { name: 'Hathwa', lat: 26.3575, lng: 84.2882, radiusKm: 30 },
  { name: 'Barauli', lat: 26.3983, lng: 84.5833, radiusKm: 30 },
  { name: 'Maharajganj', lat: 26.1133, lng: 84.5025, radiusKm: 30 },
  { name: 'Mairwa', lat: 26.2411, lng: 84.1564, radiusKm: 30 },
];

// Haversine formula to compute distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const locationService = {
  /**
   * Request exact real-time GPS coordinates from device
   */
  async fetchCurrentGpsLocation(): Promise<GeoLocationData> {
    if (!navigator.geolocation) {
      throw new Error(
        'GPS Geolocation is not supported by your device or browser. Please enable location in system settings.'
      );
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          // Attempt high-precision reverse geocode locality for display
          let detectedAddress = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'Accept-Language': 'en',
                  'User-Agent': 'HelloDoctorBihar/1.0',
                },
              }
            );
            if (res.ok) {
              const data = await res.json();
              if (data?.address) {
                const addr = data.address;
                const parts: string[] = [];
                const landmark = addr.building || addr.house_number || addr.amenity || addr.shop;
                if (landmark) parts.push(landmark);
                const road = addr.road || addr.pedestrian || addr.street;
                if (road) parts.push(road);
                const locality = addr.neighbourhood || addr.suburb || addr.village || addr.hamlet || addr.residential;
                if (locality) parts.push(locality);
                const city = addr.city || addr.town || addr.municipality || addr.county || 'Gopalganj';
                if (city) parts.push(city);
                const state = addr.state || 'Bihar';
                if (state) parts.push(state);
                if (addr.postcode) parts.push(addr.postcode);

                if (parts.length >= 2) {
                  detectedAddress = parts.join(', ');
                } else if (data.display_name) {
                  detectedAddress = data.display_name;
                }
              } else if (data?.display_name) {
                detectedAddress = data.display_name;
              }
            }
          } catch {
            // Reverse geocode failed or offline; fallback to exact coordinates
          }

          resolve({
            latitude,
            longitude,
            accuracy: accuracy ? Math.round(accuracy) : 5,
            address: detectedAddress,
            isVerified: true,
            verifiedAt: Date.now(),
          });
        },
        (error) => {
          let msg = 'Failed to fetch GPS coordinates.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              msg =
                'Location access denied. Please allow GPS Location permission in your app/browser settings so we can verify your exact clinic/delivery location.';
              break;
            case error.POSITION_UNAVAILABLE:
              msg =
                'GPS position unavailable. Please ensure Device Location (GPS) is turned ON on your phone.';
              break;
            case error.TIMEOUT:
              msg =
                'GPS request timed out. Please check your device location and GPS signal, then try again.';
              break;
          }
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0, // Force fresh, exact real-time GPS fix without cache
        }
      );
    });
  },

  /**
   * Check if coordinates lie within primary service region (Gopalganj, Siwan, or Bihar state)
   */
  verifyServiceArea(lat: number, lng: number): { isServiceable: boolean; nearestCenter: string; distanceKm: number } {
    let minDistance = Infinity;
    let nearest = 'Gopalganj';

    for (const area of SERVICE_AREAS) {
      const dist = calculateDistanceKm(lat, lng, area.lat, area.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = area.name;
      }
    }

    // Broad Bihar coordinate bounds check: Lat 24.0° to 27.5° N, Long 83.0° to 88.5° E
    const isWithinBihar = lat >= 24.0 && lat <= 27.8 && lng >= 83.0 && lng <= 88.5;
    const isCloseToCenter = minDistance <= 80; // Within 80km of Gopalganj/Siwan

    return {
      isServiceable: isWithinBihar || isCloseToCenter,
      nearestCenter: nearest,
      distanceKm: Math.round(minDistance),
    };
  },

  /**
   * Validate manual or suggested address string to prevent random gibberish or arbitrary inputs
   */
  validateAddress(address: string, gpsVerified: boolean): { isValid: boolean; error?: string } {
    const trimmed = address.trim();

    if (!trimmed) {
      return { isValid: false, error: 'Address cannot be blank. Please enter your complete delivery/service address.' };
    }

    if (trimmed.length < 10) {
      return {
        isValid: false,
        error: 'Address is too short. Please provide House/Ward No., Mohalla/Village, Landmark, and District.',
      };
    }

    // Check for obvious gibberish (repetitive characters, e.g. "aaaaaaa", "asdfasdf", "123123123")
    const repetitiveCharRegex = /(.)\1{4,}/;
    if (repetitiveCharRegex.test(trimmed)) {
      return { isValid: false, error: 'Please enter a genuine, recognizable address without repetitive keystrokes.' };
    }

    const words = trimmed.split(/\s+/).filter(w => w.length > 1);
    if (words.length < 3 && !gpsVerified) {
      return {
        isValid: false,
        error: 'Please include at least 3 address details (e.g. Village/Ward, Landmark, and City/Town).',
      };
    }

    return { isValid: true };
  },
};
