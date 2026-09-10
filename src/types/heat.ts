export type HeatRiskLevel = 'safe' | 'caution' | 'danger' | 'extreme';

export type VulnerableProfile = 'general' | 'elderly' | 'workers' | 'children';

export interface HourlyForecastItem {
  time: string; // e.g., "12:00 PM"
  hour: number; // 0-23
  temp: number; // in Celsius
  feelsLike: number;
  heatStressScore: number; // 0-100 scale
  riskLevel: HeatRiskLevel;
}

export interface CityHeatInfo {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  currentTemp: number;
  feelsLikeTemp: number;
  humidity: number;
  windSpeedKmH: number;
  riskLevel: HeatRiskLevel;
  verdict: string; // "Stay indoors during midday"
  isSafeOutsideNow: boolean;
  peakDangerWindow: string; // e.g., "11:30 AM – 4:00 PM"
  uvIndex: number;
  updatedAt: string;
}

export interface AdvisoryItem {
  id: string;
  title: string;
  description: string;
  iconName: 'Droplets' | 'Home' | 'Sun' | 'Shirt' | 'Heart' | 'Clock';
}
