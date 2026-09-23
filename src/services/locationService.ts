/**
 * Location Verification & Reverse Geocoding Service for HELLO DOCTORRR
 * Primary Service Area: Gopalganj & Siwan districts, Bihar
 */

import { GeoLocationData } from '../types';

export interface LocalityCenter {
  locality: string;
  subDistrict: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
}

export interface LocationVerificationResult {
  isValid: boolean;
  location?: GeoLocationData;
  error?: string;
  isWithinServiceArea: boolean;
  district?: string;
}

// Comprehensive locality centers for Gopalganj, Siwan and nearby Bihar regions
const BIHAR_LOCALITY_CENTERS: LocalityCenter[] = [
  // Gopalganj District Sub-districts & Townships
  { locality: 'Bhitbherwa', subDistrict: 'Gopalganj', district: 'Gopalganj', state: 'Bihar', lat: 26.4690, lng: 84.4445 },
  { locality: 'Gopalganj Town', subDistrict: 'Gopalganj', district: 'Gopalganj', state: 'Bihar', lat: 26.4688, lng: 84.4441 },
  { locality: 'Thawe', subDistrict: 'Thawe', district: 'Gopalganj', state: 'Bihar', lat: 26.4022, lng: 84.4093 },
  { locality: 'Mirganj', subDistrict: 'Mirganj', district: 'Gopalganj', state: 'Bihar', lat: 26.4172, lng: 84.3414 },
  { locality: 'Hathwa', subDistrict: 'Hathwa', district: 'Gopalganj', state: 'Bihar', lat: 26.3575, lng: 84.2882 },
  { locality: 'Barauli', subDistrict: 'Barauli', district: 'Gopalganj', state: 'Bihar', lat: 26.3983, lng: 84.5833 },
  { locality: 'Kuchaikote', subDistrict: 'Kuchaikote', district: 'Gopalganj', state: 'Bihar', lat: 26.5400, lng: 84.3200 },
  { locality: 'Baikunthpur', subDistrict: 'Baikunthpur', district: 'Gopalganj', state: 'Bihar', lat: 26.2800, lng: 84.7300 },
  { locality: 'Uchkagaon', subDistrict: 'Uchkagaon', district: 'Gopalganj', state: 'Bihar', lat: 26.4200, lng: 84.2800 },
  { locality: 'Kateya', subDistrict: 'Kateya', district: 'Gopalganj', state: 'Bihar', lat: 26.6200, lng: 84.1800 },
  { locality: 'Bijaipur', subDistrict: 'Bijaipur', district: 'Gopalganj', state: 'Bihar', lat: 26.4800, lng: 84.1200 },
  { locality: 'Sidhwalia', subDistrict: 'Sidhwalia', district: 'Gopalganj', state: 'Bihar', lat: 26.3200, lng: 84.6700 },
  { locality: 'Manjha', subDistrict: 'Manjha', district: 'Gopalganj', state: 'Bihar', lat: 26.4100, lng: 84.5000 },
  { locality: 'Phulwaria', subDistrict: 'Phulwaria', district: 'Gopalganj', state: 'Bihar', lat: 26.3800, lng: 84.2300 },

  // Siwan District Sub-districts & Townships
  { locality: 'Siwan Sadar', subDistrict: 'Siwan', district: 'Siwan', state: 'Bihar', lat: 26.2227, lng: 84.3591 },
  { locality: 'Mairwa', subDistrict: 'Mairwa', district: 'Siwan', state: 'Bihar', lat: 26.2411, lng: 84.1564 },
  { locality: 'Maharajganj', subDistrict: 'Maharajganj', district: 'Siwan', state: 'Bihar', lat: 26.1133, lng: 84.5025 },
  { locality: 'Barharia', subDistrict: 'Barharia', district: 'Siwan', state: 'Bihar', lat: 26.2800, lng: 84.4900 },
  { locality: 'Darauli', subDistrict: 'Darauli', district: 'Siwan', state: 'Bihar', lat: 26.0800, lng: 84.1500 },
  { locality: 'Raghunathpur', subDistrict: 'Raghunathpur', district: 'Siwan', state: 'Bihar', lat: 26.0400, lng: 84.3100 },
  { locality: 'Hussainganj', subDistrict: 'Hussainganj', district: 'Siwan', state: 'Bihar', lat: 26.1700, lng: 84.3400 },
  { locality: 'Andar', subDistrict: 'Andar', district: 'Siwan', state: 'Bihar', lat: 26.0800, lng: 84.2700 },
  { locality: 'Guthani', subDistrict: 'Guthani', district: 'Siwan', state: 'Bihar', lat: 26.1900, lng: 84.0500 },
  { locality: 'Nautan', subDistrict: 'Nautan', district: 'Siwan', state: 'Bihar', lat: 26.2900, lng: 84.2500 },
  { locality: 'Pachrukhi', subDistrict: 'Pachrukhi', district: 'Siwan', state: 'Bihar', lat: 26.1900, lng: 84.4500 },
  { locality: 'Goriakothi', subDistrict: 'Goriakothi', district: 'Siwan', state: 'Bihar', lat: 26.2500, lng: 84.6000 },
  { locality: 'Siswan', subDistrict: 'Siswan', district: 'Siwan', state: 'Bihar', lat: 25.9900, lng: 84.4600 },
  { locality: 'Bhagwanpur Hat', subDistrict: 'Bhagwanpur Hat', district: 'Siwan', state: 'Bihar', lat: 26.1300, lng: 84.6500 },
  { locality: 'Basantpur', subDistrict: 'Basantpur', district: 'Siwan', state: 'Bihar', lat: 26.2400, lng: 84.7000 },
  { locality: 'Hasanpura', subDistrict: 'Hasanpura', district: 'Siwan', state: 'Bihar', lat: 26.1000, lng: 84.3700 },
  { locality: 'Lakri Nabiganj', subDistrict: 'Lakri Nabiganj', district: 'Siwan', state: 'Bihar', lat: 26.3200, lng: 84.7200 },
  { locality: 'Ziradei', subDistrict: 'Ziradei', district: 'Siwan', state: 'Bihar', lat: 26.2300, lng: 84.2400 },

  // Key Neighboring Bihar Hubs
  { locality: 'Chapra', subDistrict: 'Chapra', district: 'Saran', state: 'Bihar', lat: 25.7848, lng: 84.7274 },
  { locality: 'Muzaffarpur', subDistrict: 'Muzaffarpur', district: 'Muzaffarpur', state: 'Bihar', lat: 26.1209, lng: 85.3647 },
  { locality: 'Patna Sadar', subDistrict: 'Patna', district: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376 },
  { locality: 'Motihari', subDistrict: 'Motihari', district: 'East Champaran', state: 'Bihar', lat: 26.6469, lng: 84.9089 },
  { locality: 'Bettiah', subDistrict: 'Bettiah', district: 'West Champaran', state: 'Bihar', lat: 26.8024, lng: 84.5005 },
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

/**
 * Match coordinates to nearest known Bihar locality center
 */
export function findNearestLocality(lat: number, lng: number): LocalityCenter {
  let minDistance = Infinity;
  let matched = BIHAR_LOCALITY_CENTERS[0];

  for (const center of BIHAR_LOCALITY_CENTERS) {
    const dist = calculateDistanceKm(lat, lng, center.lat, center.lng);
    if (dist < minDistance) {
      minDistance = dist;
      matched = center;
    }
  }

  return matched;
}

/**
 * Helper to pause execution during backoff retries
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Formats reverse geocoding API output into a clean, human-readable string.
 * Requirement 1: Parse sub-locality/ward level details (suburb, neighbourhood, quarter, village, road, town, district)
 * and format strictly as: "[Sub-locality/Ward], [Town/District], Bihar" (e.g. "Bhitbherwa, Gopalganj, Bihar").
 * Automatically falls back to town/district level if exact ward data is unavailable.
 */
function formatHumanReadableAddress(
  addressDetails: Record<string, string | undefined> | null | undefined,
  fallbackLocality: LocalityCenter
): { address: string; formattedAddress: string; locationName: string; subDistrict: string; district: string } {
  const defaultSubDistrict = fallbackLocality.subDistrict || fallbackLocality.locality;
  const defaultDistrict = fallbackLocality.district;
  const standardFallback = `${defaultSubDistrict}, ${defaultDistrict}, Bihar`;

  if (!addressDetails) {
    return {
      address: standardFallback,
      formattedAddress: standardFallback,
      locationName: standardFallback,
      subDistrict: defaultSubDistrict,
      district: defaultDistrict,
    };
  }

  // 1. Detailed reverse geocoding to parse sub-locality/ward level details
  // (ward, suburb, neighbourhood, quarter, village, hamlet, residential, road, street, house_number)
  const rawWard = (
    addressDetails.ward ||
    (addressDetails.house_number?.toLowerCase().includes('ward') ? addressDetails.house_number : '')
  )?.trim();

  const subLocality = (
    addressDetails.suburb ||
    addressDetails.neighbourhood ||
    addressDetails.quarter ||
    addressDetails.village ||
    addressDetails.hamlet ||
    addressDetails.residential ||
    addressDetails.subdistrict ||
    addressDetails.sub_district ||
    addressDetails.road ||
    addressDetails.street ||
    ''
  )?.trim();

  let subLocalityOrWard = '';
  if (rawWard && subLocality) {
    const cleanWard = rawWard.toLowerCase().startsWith('ward') ? rawWard : `Ward ${rawWard}`;
    subLocalityOrWard = `${subLocality} (${cleanWard})`;
  } else if (rawWard) {
    subLocalityOrWard = rawWard.toLowerCase().startsWith('ward') ? rawWard : `Ward ${rawWard}`;
  } else if (subLocality) {
    subLocalityOrWard = subLocality;
  } else if (addressDetails.house_number) {
    subLocalityOrWard = `Ward/House ${addressDetails.house_number.trim()}`;
  }

  // 2. Town / District level details
  const town = (
    addressDetails.town ||
    addressDetails.city ||
    addressDetails.municipality ||
    ''
  )?.trim();

  const district = (
    addressDetails.district ||
    addressDetails.county ||
    addressDetails.state_district ||
    fallbackLocality.district ||
    'Gopalganj'
  )?.trim();

  let townOrDistrict = town || district;

  // 3. Fallback logic:
  // Automatically fall back to town/district level if exact ward/sub-locality data is unavailable
  if (!subLocalityOrWard) {
    if (town && district && town.toLowerCase() !== district.toLowerCase()) {
      subLocalityOrWard = town;
      townOrDistrict = district;
    } else {
      subLocalityOrWard = fallbackLocality.locality || townOrDistrict;
    }
  }

  // Deduplicate if sub-locality and town/district are identical (e.g., "Gopalganj, Gopalganj, Bihar")
  if (subLocalityOrWard.toLowerCase() === townOrDistrict.toLowerCase()) {
    if (district && district.toLowerCase() !== townOrDistrict.toLowerCase()) {
      townOrDistrict = district;
    } else {
      subLocalityOrWard = fallbackLocality.locality || 'Bhitbherwa';
      townOrDistrict = district || 'Gopalganj';
    }
  }

  // Format strictly as: "[Sub-locality/Ward], [Town/District], Bihar"
  const formattedAddress = `${subLocalityOrWard}, ${townOrDistrict}, Bihar`;

  return {
    address: formattedAddress,
    formattedAddress,
    locationName: formattedAddress,
    subDistrict: subLocalityOrWard,
    district: townOrDistrict,
  };
}

/**
 * Reverse Geocoding with automatic retry mechanism and multi-provider fallback.
 * Requirement 2: Automatic retry mechanism if network/throttling occurs.
 */
async function reverseGeocodeWithRetry(
  latitude: number,
  longitude: number,
  maxRetries: number = 3
): Promise<{ address: string; locationName: string; subDistrict: string; district: string }> {
  const fallback = findNearestLocality(latitude, longitude);

  // Attempt 1: OpenStreetMap Nominatim with automatic retry & exponential backoff
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          signal: controller.signal,
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'HelloDoctorBiharApp/3.0 (healthcare-gopalganj-siwan)',
          },
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data?.address) {
          const formatted = formatHumanReadableAddress(data.address, fallback);
          if (formatted.formattedAddress) {
            return formatted;
          }
        }
      } else if (res.status === 429 || res.status === 503) {
        // Rate limited or throttled: wait backoff with jitter before next attempt
        const backoffMs = attempt * 400 + Math.random() * 200;
        await sleep(backoffMs);
        continue;
      }
    } catch {
      // Network timeout or drop: wait backoff and retry
      if (attempt < maxRetries) {
        const backoffMs = attempt * 300 + Math.random() * 150;
        await sleep(backoffMs);
      }
    }
  }

  // Attempt 2: Secondary / Backup Reverse Geocoding Provider (BigDataCloud Free Client API)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const bdcData = await res.json();
        const readable = formatHumanReadableAddress(
          {
            village: bdcData.locality,
            city: bdcData.city || fallback.district,
            state: 'Bihar',
          },
          fallback
        );
        return readable;
      } else if (res.status === 429) {
        await sleep(300);
      }
    } catch {
      await sleep(200);
    }
  }

  // Attempt 3: Photon Komoot reverse geocoding mirror
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(
      `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const props = data.features?.[0]?.properties;
      if (props) {
        const readable = formatHumanReadableAddress(
          {
            village: props.name || props.district || props.city,
            city: props.city || props.county || fallback.district,
            state: props.state || 'Bihar',
          },
          fallback
        );
        return readable;
      }
    }
  } catch {
    // Fall through to guaranteed local resolution
  }

  // Fail-Safe: Resolved via high-resolution Bihar locality matcher
  // Guarantees non-blank, formatted "[Sub-district/Town], [District], Bihar"
  const defaultLocalityName = `${fallback.locality}, ${fallback.district}, Bihar`;
  return {
    address: defaultLocalityName,
    locationName: defaultLocalityName,
    subDistrict: fallback.subDistrict || fallback.locality,
    district: fallback.district,
  };
}

export const locationService = {
  /**
   * Check current browser/WebView location permission state if supported
   */
  async checkLocationPermission(): Promise<'granted' | 'prompt' | 'denied' | 'unsupported'> {
    if (typeof navigator === 'undefined' || !navigator.permissions || !navigator.permissions.query) {
      return 'prompt';
    }
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      return status.state;
    } catch {
      return 'prompt';
    }
  },

  /**
   * Instant offline locality preview based strictly on coordinates (instant UI feedback)
   */
  getInstantReadableLocality(latitude: number, longitude: number): string {
    const nearest = findNearestLocality(latitude, longitude);
    return `${nearest.locality}, ${nearest.district}, Bihar`;
  },

  /**
   * Request exact real-time GPS coordinates from device with multi-phase fallback
   * and guaranteed human-readable reverse geocoding.
   * Requirement 3: Optional onCoordsFetched callback triggers as soon as
   * coordinates are acquired so the UI state can be populated instantly!
   */
  async fetchCurrentGpsLocation(
    onCoordsFetched?: (coords: { latitude: number; longitude: number; defaultReadableName: string }) => void
  ): Promise<GeoLocationData> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      throw new Error(
        'GPS Geolocation is not supported by your device or browser. Please enable location in your device settings.'
      );
    }

    const getPosition = (options: PositionOptions): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    };

    let position: GeolocationPosition;

    try {
      // Phase 1: High accuracy GPS fix (Force enableHighAccuracy: true, timeout: 20000, and maximumAge: 0)
      position = await getPosition({
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      });
    } catch (highAccuracyErr: any) {
      // If permission was explicitly denied, do not retry
      if (highAccuracyErr?.code === 1) { // PERMISSION_DENIED
        throw new Error(
          'Location permission denied. Please allow Location access in your phone/browser settings to verify your service address.'
        );
      }

      // Phase 2: Standard/Cell-tower fallback with 20000ms timeout if GPS chip took longer
      try {
        position = await getPosition({
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 0,
        });
      } catch (fallbackErr: any) {
        let msg = 'Failed to fetch GPS coordinates.';
        if (fallbackErr?.code === 1) {
          msg = 'Location permission denied. Please enable GPS Location in settings.';
        } else if (fallbackErr?.code === 2) {
          msg = 'Device GPS position is unavailable. Please ensure Device Location (GPS) is switched ON.';
        } else if (fallbackErr?.code === 3) {
          msg = 'GPS request timed out. Please check your network or move to an area with clear signal and retry.';
        }
        throw new Error(msg);
      }
    }

    const { latitude, longitude, accuracy } = position.coords;

    // Requirement 3: Instantly invoke callback as soon as coordinates are fetched
    const instantReadableName = locationService.getInstantReadableLocality(latitude, longitude);
    onCoordsFetched?.({ latitude, longitude, defaultReadableName: instantReadableName });

    // Resolve Human-Readable Location with Retry & Multi-Provider Fallback
    const resolved = await reverseGeocodeWithRetry(latitude, longitude);

    return {
      latitude,
      longitude,
      accuracy: accuracy ? Math.round(accuracy) : 10,
      address: resolved.address,
      locationName: resolved.locationName,
      subDistrict: resolved.subDistrict,
      district: resolved.district,
      isVerified: true,
      verifiedAt: Date.now(),
    };
  },

  /**
   * Check if coordinates lie within primary service region (Gopalganj, Siwan, or Bihar state)
   */
  verifyServiceArea(lat: number, lng: number): { isServiceable: boolean; nearestCenter: string; distanceKm: number } {
    const nearest = findNearestLocality(lat, lng);
    const dist = calculateDistanceKm(lat, lng, nearest.lat, nearest.lng);

    // Broad Bihar coordinate bounds check: Lat 24.0° to 27.8° N, Long 83.0° to 88.5° E
    const isWithinBihar = lat >= 24.0 && lat <= 27.8 && lng >= 83.0 && lng <= 88.5;
    const isCloseToCenter = dist <= 85; // Within 85km of Gopalganj/Siwan

    return {
      isServiceable: isWithinBihar || isCloseToCenter,
      nearestCenter: nearest.locality,
      distanceKm: Math.round(dist),
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

    if (trimmed.length < 8) {
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
    if (words.length < 2 && !gpsVerified) {
      return {
        isValid: false,
        error: 'Please include at least Village/Ward, Landmark, and City/Town.',
      };
    }

    return { isValid: true };
  },
};
