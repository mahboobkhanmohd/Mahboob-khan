/**
 * Open-Meteo Geocoding Service.
 * Fetches city locations with coordinates, state, and country.
 * Also provides reverse geocoding for browser geolocation.
 */

export interface GeocodedCity {
  id: string;
  name: string;
  state: string; // admin1, e.g. "Telangana", "Karnataka"
  country: string; // e.g. "India"
  latitude: number;
  longitude: number;
}

// Quick popular cities in India for instant suggestions
export const DEFAULT_SEARCH_CITIES: GeocodedCity[] = [
  {
    id: 'om-hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    latitude: 17.385,
    longitude: 78.4867,
  },
  {
    id: 'om-bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.9716,
    longitude: 77.5946,
  },
  {
    id: 'om-delhi',
    name: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.209,
  },
  {
    id: 'om-mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    latitude: 19.076,
    longitude: 72.8777,
  },
  {
    id: 'om-chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 13.0827,
    longitude: 80.2707,
  },
  {
    id: 'om-kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    latitude: 22.5726,
    longitude: 88.3639,
  },
  {
    id: 'om-ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    latitude: 23.0225,
    longitude: 72.5714,
  },
  {
    id: 'om-jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    latitude: 26.9124,
    longitude: 75.7873,
  },
];

const SAVED_LOCATION_KEY = 'heatsafe_selected_location';

/**
 * Persists the selected location in localStorage.
 */
export function saveSelectedLocation(location: GeocodedCity): void {
  try {
    localStorage.setItem(SAVED_LOCATION_KEY, JSON.stringify(location));
  } catch {
    // Ignore storage quota or disabled storage
  }
}

/**
 * Loads the saved location from localStorage if available.
 */
export function getSavedLocation(): GeocodedCity | null {
  try {
    const raw = localStorage.getItem(SAVED_LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.name && typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
      return parsed as GeocodedCity;
    }
  } catch {
    // Fall back to default
  }
  return null;
}

function createTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    try {
      return AbortSignal.timeout(timeoutMs);
    } catch {
      return undefined;
    }
  }
  if (typeof AbortController !== 'undefined') {
    const controller = new AbortController();
    setTimeout(() => {
      try {
        controller.abort();
      } catch {
        // ignore
      }
    }, timeoutMs);
    return controller.signal;
  }
  return undefined;
}

/**
 * Searches cities using Open-Meteo's free geocoding API.
 */
export async function searchCitiesWithOpenMeteo(query: string): Promise<GeocodedCity[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return DEFAULT_SEARCH_CITIES;
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      trimmed
    )}&count=10&language=en&format=json`;

    const signal = createTimeoutSignal(5000);
    const res = await fetch(url, signal ? { signal } : {});
    if (!res.ok) {
      throw new Error(`Geocoding error: ${res.status}`);
    }

    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    // Map to clean GeocodedCity objects
    const results: GeocodedCity[] = data.results.map((item: any, idx: number) => {
      const state = item.admin1 || item.admin2 || '';
      const country = item.country || 'India';
      return {
        id: `om-${item.id || idx}-${item.name.toLowerCase()}`,
        name: item.name,
        state: state,
        country: country,
        latitude: item.latitude,
        longitude: item.longitude,
      };
    });

    // If searching, prioritize Indian cities first for local relevance
    results.sort((a, b) => {
      const aIsIndia = a.country.toLowerCase() === 'india' ? -1 : 1;
      const bIsIndia = b.country.toLowerCase() === 'india' ? -1 : 1;
      return aIsIndia - bIsIndia;
    });

    return results;
  } catch {
    // In case of network error, filter default list locally
    return DEFAULT_SEARCH_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(trimmed.toLowerCase()) ||
        c.state.toLowerCase().includes(trimmed.toLowerCase())
    );
  }
}

/**
 * Reverse geocodes browser coordinates to obtain city and state name.
 */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<GeocodedCity> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    const signal = createTimeoutSignal(4000);
    const res = await fetch(url, signal ? { signal } : {});

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const name =
        addr.city ||
        addr.town ||
        addr.municipality ||
        addr.suburb ||
        addr.district ||
        addr.county ||
        'Current Location';
      const state = addr.state || addr.state_district || 'India';
      const country = addr.country || 'India';

      return {
        id: `geo-${latitude.toFixed(4)}-${longitude.toFixed(4)}`,
        name,
        state,
        country,
        latitude,
        longitude,
      };
    }
  } catch {
    // Silently fall through to fallback
  }

  // Fallback: match closest known city in India
  let closest = DEFAULT_SEARCH_CITIES[0];
  let minDiff = Infinity;
  for (const c of DEFAULT_SEARCH_CITIES) {
    const diff = Math.pow(c.latitude - latitude, 2) + Math.pow(c.longitude - longitude, 2);
    if (diff < minDiff) {
      minDiff = diff;
      closest = c;
    }
  }

  return {
    id: `geo-${latitude.toFixed(4)}-${longitude.toFixed(4)}`,
    name: closest.name,
    state: closest.state,
    country: closest.country,
    latitude,
    longitude,
  };
}
