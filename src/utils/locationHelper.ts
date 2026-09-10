import { IndiaLocation, INDIA_DISTRICTS, ALL_INDIAN_STATES_AND_UTS } from '../data/indiaLocations';
import { CityHeatInfo, HeatRiskLevel } from '../types/heat';
import { calculateHeatRisk } from './heatIndex';
import { POPULAR_CITIES } from '../services/mockData';

// Map of popular city overrides if any
const popularCityMap = new Map<string, CityHeatInfo>();
POPULAR_CITIES.forEach((c) => {
  popularCityMap.set(c.id.toLowerCase(), c);
  popularCityMap.set(c.name.toLowerCase(), c);
  // Add common partial aliases
  if (c.name === 'Mumbai') popularCityMap.set('mumbai (city & suburban)', c);
  if (c.name === 'Vijayawada') popularCityMap.set('vijayawada (ntr)', c);
  if (c.name === 'Bhubaneswar') popularCityMap.set('bhubaneswar (khurda)', c);
  if (c.name === 'Bengaluru') popularCityMap.set('bengaluru urban', c);
  if (c.name === 'Delhi') popularCityMap.set('new delhi', c);
});

/**
 * Converts an IndiaLocation into a CityHeatInfo structure
 */
export function locationToCityHeatInfo(loc: IndiaLocation): CityHeatInfo {
  // Check if we have an existing curated city record
  const existing =
    popularCityMap.get(loc.id.toLowerCase()) ||
    popularCityMap.get(loc.name.toLowerCase());
  if (existing) {
    return {
      ...existing,
      id: loc.id,
      state: loc.state,
      lat: loc.lat,
      lon: loc.lon,
    };
  }

  // Sensible default temperature estimation based on geography and climate zones of India
  let baseTemp = 36;
  if (loc.lat > 31) {
    baseTemp = 24; // High altitude North (Himachal, Ladakh, Kashmir)
  } else if (loc.lat > 27) {
    baseTemp = 41; // Gangetic plains / North-West (Rajasthan, Haryana, Western UP)
  } else if (loc.lat > 22) {
    baseTemp = 39; // Central & Eastern India (MP, Gujarat, Bihar, WB, Jharkhand)
  } else if (loc.lat > 16) {
    baseTemp = 37; // Deccan Plateau (Maharashtra, Telangana, Odisha)
  } else {
    baseTemp = 34; // Southern coastal / tropical (Tamil Nadu, Kerala, Karnataka)
  }

  // Add slight pseudo-random variation based on character codes so nearby cities don't have identical values
  const charSum = loc.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variance = (charSum % 7) - 3; // -3 to +3
  const currentTemp = Math.max(16, baseTemp + variance);

  // Apparent temperature / Heat index calculation
  const humidity = loc.lat < 18 || loc.lon > 85 ? 65 : 42;
  const feelsLikeTemp = Math.round(
    currentTemp + (humidity > 55 ? 5 : 3) + ((charSum % 3) - 1)
  );

  const riskLevel: HeatRiskLevel = calculateHeatRisk(feelsLikeTemp);
  const isSafeOutsideNow = riskLevel === 'safe' || riskLevel === 'caution';

  const verdict =
    riskLevel === 'extreme'
      ? 'It is NOT safe to be outside during midday. High risk of heat stroke.'
      : riskLevel === 'danger'
      ? 'Dangerous heat stress likely. Postpone non-essential outdoor travel.'
      : riskLevel === 'caution'
      ? 'Moderate heat. Stay hydrated and seek shade during peak sun.'
      : 'Safe and comfortable for outdoor activities.';

  const peakDangerWindow =
    riskLevel === 'extreme'
      ? '11:00 AM – 4:30 PM'
      : riskLevel === 'danger'
      ? '11:30 AM – 4:00 PM'
      : riskLevel === 'caution'
      ? '12:00 PM – 3:30 PM'
      : 'Midday 12:00 PM – 2:00 PM';

  return {
    id: loc.id,
    name: loc.name,
    state: loc.state,
    lat: loc.lat,
    lon: loc.lon,
    currentTemp,
    feelsLikeTemp,
    humidity,
    windSpeedKmH: 12 + (charSum % 8),
    riskLevel,
    verdict,
    isSafeOutsideNow,
    peakDangerWindow,
    uvIndex: Math.min(12, Math.max(5, Math.round(feelsLikeTemp / 4))),
    updatedAt: 'Estimated baseline • Tap to fetch live Open-Meteo data',
  };
}

// Pre-compiled list of all districts as CityHeatInfo
export const ALL_INDIA_CITY_HEAT_INFOS: CityHeatInfo[] = INDIA_DISTRICTS.map(
  locationToCityHeatInfo
);

/**
 * Find district or state by ID or query
 */
export function findLocationById(id: string): CityHeatInfo | undefined {
  return ALL_INDIA_CITY_HEAT_INFOS.find((c) => c.id.toLowerCase() === id.toLowerCase());
}

/**
 * Filter locations by search query and optional state filter
 */
export function filterIndiaLocations(
  query: string,
  stateFilter: string = 'ALL'
): CityHeatInfo[] {
  const q = query.trim().toLowerCase();

  return ALL_INDIA_CITY_HEAT_INFOS.filter((city) => {
    // State filter check
    if (stateFilter !== 'ALL' && city.state.toLowerCase() !== stateFilter.toLowerCase()) {
      return false;
    }

    // Query check
    if (!q) return true;

    return (
      city.name.toLowerCase().includes(q) ||
      city.state.toLowerCase().includes(q)
    );
  });
}

export { ALL_INDIAN_STATES_AND_UTS };
