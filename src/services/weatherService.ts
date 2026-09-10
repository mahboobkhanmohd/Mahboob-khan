import { CityHeatInfo, HourlyForecastItem, HeatRiskLevel } from '../types/heat';
import { POPULAR_CITIES, HOURLY_MOCK_DATA } from './mockData';
import { calculateHeatRisk } from '../utils/heatIndex';
import { calculateThermalStress } from '../utils/thermalStress';

/**
 * Weather information needed by the HeatSafe UI.
 * Strictly limited to the requested variables:
 * - temperature
 * - apparent temperature
 * - humidity
 * - wind speed
 * - UV index
 * - hourly temperature
 * - hourly apparent temperature
 * - hourly humidity
 * - hourly UV
 * - daily maximum temperature
 * - daily minimum temperature
 */
export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  hourlyTemperature: number[];
  hourlyApparentTemperature: number[];
  hourlyHumidity: number[];
  hourlyUvIndex: number[];
  dailyMaxTemp: number;
  dailyMinTemp: number;
  dailyForecast: DailyForecast[];
  isFallback: boolean;
  timestamp: string;
}

export interface DailyForecast {
  date: string;
  dayLabel: string;
  high: number;
  low: number;
  riskLabel: 'High' | 'Moderate' | 'Caution' | 'Safe';
}

export interface HeatVerdictDetails {
  score: number;
  label: string;
  verdict: string;
  explanation: string;
  whyReasons: string[];
  badgeBg: string;
  actions: Array<{ emoji: string; text: string }>;
}

export interface OpenMeteoResponse {
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    wind_speed_10m?: number;
    uv_index?: number;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    relative_humidity_2m: number[];
    uv_index?: number[];
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    relative_humidity_2m_max?: number[];
    wind_speed_10m_max?: number[];
    uv_index_max?: number[];
  };
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

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function hasFiniteNumbers(values: unknown, minimumLength = 1): values is number[] {
  return Array.isArray(values) && values.length >= minimumLength && values.every(isFiniteNumber);
}

function getDayLabel(date: Date, index: number): string {
  if (index === 0) return 'TODAY';
  return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
}

function getForecastRiskLabel(
  high: number,
  humidity: number,
  windSpeed: number,
  uvIndex: number
): DailyForecast['riskLabel'] {
  const risk = computeHeatRiskVerdict(high, high, humidity, windSpeed, uvIndex).label;
  if (risk === 'EXTREME RISK' || risk === 'HIGH RISK') return 'High';
  if (risk === 'MODERATE RISK') return 'Moderate';
  if (risk === 'CAUTION') return 'Caution';
  return 'Safe';
}

function createDailyForecast(
  daily: NonNullable<OpenMeteoResponse['daily']>,
  fallbackHumidity: number,
  fallbackWindSpeed: number,
  fallbackUvIndex: number
): DailyForecast[] {
  return daily.time.slice(0, 7).map((dateValue, index) => {
    const date = new Date(`${dateValue}T12:00:00`);
    const high = Math.round(daily.temperature_2m_max[index]);
    const low = Math.round(daily.temperature_2m_min[index]);
    const humidity = Math.round(daily.relative_humidity_2m_max?.[index] ?? fallbackHumidity);
    const windSpeed = Math.round(daily.wind_speed_10m_max?.[index] ?? fallbackWindSpeed);
    const uvIndex = Math.round(daily.uv_index_max?.[index] ?? fallbackUvIndex);

    return {
      date: dateValue,
      dayLabel: getDayLabel(date, index),
      high,
      low,
      riskLabel: getForecastRiskLabel(high, humidity, windSpeed, uvIndex),
    };
  });
}

/**
 * Fetches real weather data from Open-Meteo's free weather API.
 * Requests ONLY the exact fields needed by the application.
 */
export async function fetchWeatherDataFromOpenMeteo(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,uv_index&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,uv_index&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,wind_speed_10m_max,uv_index_max&timezone=auto&forecast_days=7`;

  const signal = createTimeoutSignal(6000);
  const res = await fetch(url, signal ? { signal } : {});
  if (!res.ok) {
    throw new Error(`Open-Meteo service responded with status ${res.status}`);
  }

  const data: OpenMeteoResponse = await res.json();

  if (
    !data.current ||
    !isFiniteNumber(data.current.temperature_2m) ||
    !isFiniteNumber(data.current.relative_humidity_2m) ||
    !isFiniteNumber(data.current.apparent_temperature) ||
    !isFiniteNumber(data.current.wind_speed_10m) ||
    !isFiniteNumber(data.current.uv_index) ||
    !data.hourly ||
    !hasFiniteNumbers(data.hourly.temperature_2m, 6) ||
    !hasFiniteNumbers(data.hourly.apparent_temperature, 6) ||
    !hasFiniteNumbers(data.hourly.relative_humidity_2m, 6) ||
    !data.daily ||
    !hasFiniteNumbers(data.daily.time.map((value) => Date.parse(`${value}T12:00:00`)), 7) ||
    !hasFiniteNumbers(data.daily.temperature_2m_max, 7) ||
    !hasFiniteNumbers(data.daily.temperature_2m_min, 7)
  ) {
    throw new Error('Incomplete weather payload received from Open-Meteo');
  }

  const current = data.current;
  const hourly = data.hourly || {
    time: [],
    temperature_2m: [],
    apparent_temperature: [],
    relative_humidity_2m: [],
    uv_index: [],
  };
  const daily = data.daily || {
    time: [],
    temperature_2m_max: [],
    temperature_2m_min: [],
  };

  const currentTemp = Math.round(current.temperature_2m);
  const apparentTemp = Math.round(current.apparent_temperature);
  const humidity = Math.round(current.relative_humidity_2m);
  const windSpeed = Math.round(current.wind_speed_10m ?? 12);
  const uvIndex = Math.round(current.uv_index);
  const dailyForecast = createDailyForecast(daily, humidity, windSpeed, uvIndex);

  const dailyMax =
    daily.temperature_2m_max && daily.temperature_2m_max.length > 0
      ? Math.round(daily.temperature_2m_max[0])
      : Math.max(currentTemp, apparentTemp);

  const dailyMin =
    daily.temperature_2m_min && daily.temperature_2m_min.length > 0
      ? Math.round(daily.temperature_2m_min[0])
      : Math.max(16, currentTemp - 7);

  return {
    temperature: currentTemp,
    apparentTemperature: apparentTemp,
    humidity,
    windSpeed,
    uvIndex,
    hourlyTemperature: hourly.temperature_2m.map((t) => Math.round(t)),
    hourlyApparentTemperature: hourly.apparent_temperature.map((t) => Math.round(t)),
    hourlyHumidity: hourly.relative_humidity_2m.map((h) => Math.round(h)),
    hourlyUvIndex: (hourly.uv_index || []).map((u) => Math.round(u)),
    dailyMaxTemp: dailyMax,
    dailyMinTemp: dailyMin,
    dailyForecast,
    isFallback: false,
    timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
  };
}

/**
 * Generates robust fallback mock weather data when API is unreachable.
 */
export function getFallbackWeatherData(city: CityHeatInfo): WeatherData {
  const curTemp = city.currentTemp || 35;
  const apparentTemp = city.feelsLikeTemp || curTemp + 3;
  const humidity = city.humidity || 55;
  const windSpeed = city.windSpeedKmH || 14;
  const uvIndex = city.uvIndex || 7;

  // Generate realistic 24-hour curves
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const hourlyTemp = hours.map((h) => {
    const factor = Math.sin(((h - 6) / 12) * Math.PI); // peak around 2-3 PM
    const delta = factor > 0 ? factor * 6 : factor * 3;
    return Math.round(curTemp - 2 + delta);
  });

  const hourlyApparent = hourlyTemp.map((t) => Math.round(t + (apparentTemp - curTemp)));
  const hourlyHumidity = hours.map((h) => {
    // Humidity is usually inverse of temperature curve
    const factor = Math.sin(((h - 6) / 12) * Math.PI);
    return Math.min(95, Math.max(30, Math.round(humidity - factor * 15)));
  });
  const hourlyUv = hours.map((h) => {
    if (h < 6 || h > 18) return 0;
    const factor = Math.sin(((h - 6) / 12) * Math.PI);
    return Math.max(0, Math.round(uvIndex * factor));
  });

  const dailyForecast = Array.from({ length: 7 }, (_, index) => {
    const high = Math.round(curTemp + 2 - index * 0.5);
    const low = Math.round(curTemp - 6 - index * 0.3);
    return {
      date: new Date(Date.now() + index * 86400000).toISOString().slice(0, 10),
      dayLabel: getDayLabel(new Date(Date.now() + index * 86400000), index),
      high,
      low,
      riskLabel: getForecastRiskLabel(high, humidity, windSpeed, uvIndex),
    };
  });

  return {
    temperature: curTemp,
    apparentTemperature: apparentTemp,
    humidity,
    windSpeed,
    uvIndex,
    hourlyTemperature: hourlyTemp,
    hourlyApparentTemperature: hourlyApparent,
    hourlyHumidity: hourlyHumidity,
    hourlyUvIndex: hourlyUv,
    dailyMaxTemp: Math.max(curTemp + 2, ...hourlyTemp),
    dailyMinTemp: Math.min(curTemp - 6, ...hourlyTemp),
    dailyForecast,
    isFallback: true,
    timestamp: 'Offline fallback',
  };
}

/**
 * Calculates user-facing heat verdict, risk score, and simple actionable recommendations
 * using the transparent deterministic thermal stress calculation engine.
 */
export function computeHeatRiskVerdict(
  currentTemp: number,
  feelsLikeTemp: number,
  humidity: number = 50,
  windSpeed: number = 14,
  uvIndex: number = 7
): HeatVerdictDetails {
  const result = calculateThermalStress({
    temperature: currentTemp,
    relativeHumidity: humidity,
    apparentTemperature: feelsLikeTemp,
    windSpeed,
    uvIndex,
  });

  const badgeBg =
    result.level === 'EXTREME'
      ? 'bg-rose-50 text-rose-900 border-rose-300'
      : result.level === 'HIGH'
      ? 'bg-amber-50 text-amber-900 border-amber-300'
      : result.level === 'MODERATE'
      ? 'bg-amber-50/80 text-amber-900 border-amber-200'
      : result.level === 'CAUTION'
      ? 'bg-stone-100 text-stone-800 border-stone-300'
      : 'bg-emerald-50 text-emerald-800 border-emerald-200';

  const label =
    result.level === 'EXTREME'
      ? 'EXTREME RISK'
      : result.level === 'HIGH'
      ? 'HIGH RISK'
      : result.level === 'MODERATE'
      ? 'MODERATE RISK'
      : result.level === 'CAUTION'
      ? 'CAUTION'
      : 'SAFE';

  return {
    score: result.score,
    label,
    verdict: result.verdict,
    explanation: result.explanation,
    whyReasons: result.whyReasons,
    badgeBg,
    actions: result.recommendations,
  };
}

/**
 * Main service method consumed by the application hooks.
 * Loads live Open-Meteo weather or returns fallback mock data with error details.
 */
export async function fetchLiveHeatData(
  city: CityHeatInfo
): Promise<{
  city: CityHeatInfo;
  hourly: HourlyForecastItem[];
  weather: WeatherData;
  error: string | null;
}> {
  try {
    const weather = await fetchWeatherDataFromOpenMeteo(city.lat, city.lon);
    const riskLevel: HeatRiskLevel = calculateHeatRisk(weather.apparentTemperature);
    const verdictInfo = computeHeatRiskVerdict(
      weather.temperature,
      weather.apparentTemperature,
      weather.humidity,
      weather.windSpeed,
      weather.uvIndex
    );

    const updatedCity: CityHeatInfo = {
      ...city,
      currentTemp: weather.temperature,
      feelsLikeTemp: weather.apparentTemperature,
      humidity: weather.humidity,
      windSpeedKmH: weather.windSpeed,
      uvIndex: weather.uvIndex,
      riskLevel,
      verdict: verdictInfo.verdict,
      isSafeOutsideNow: riskLevel === 'safe' || riskLevel === 'caution',
      updatedAt: 'Live from Open-Meteo',
    };

    // Format hourly items for secondary map views
    const targetHours = [6, 8, 10, 12, 14, 16, 18, 20];
    const hourly: HourlyForecastItem[] = targetHours.map((h) => {
      const temp = weather.hourlyTemperature[h] ?? weather.temperature;
      const feels = weather.hourlyApparentTemperature[h] ?? weather.apparentTemperature;
      const timeLabel = h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`;
      return {
        time: timeLabel,
        hour: h,
        temp,
        feelsLike: feels,
        heatStressScore: Math.min(100, Math.max(10, Math.round((feels - 20) * 3.5))),
        riskLevel: calculateHeatRisk(feels),
      };
    });

    return { city: updatedCity, hourly, weather, error: null };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unable to connect to Open-Meteo weather service';
    const fallbackWeather = getFallbackWeatherData(city);
    const verdictInfo = computeHeatRiskVerdict(
      city.currentTemp,
      city.feelsLikeTemp,
      city.humidity,
      city.windSpeedKmH,
      city.uvIndex
    );

    const fallbackCity: CityHeatInfo = {
      ...city,
      verdict: verdictInfo.verdict,
      updatedAt: 'Offline data',
    };

    const hourly = getMockHourly(city.id, city.currentTemp, city.feelsLikeTemp);

    return {
      city: fallbackCity,
      hourly,
      weather: fallbackWeather,
      error: errorMessage,
    };
  }
}

export function getMockHourly(
  cityId: string,
  currentTemp: number,
  feelsLike: number
): HourlyForecastItem[] {
  if (HOURLY_MOCK_DATA[cityId]) {
    return HOURLY_MOCK_DATA[cityId];
  }

  const hours = [
    { label: '6 AM', hour: 6, offset: -8 },
    { label: '8 AM', hour: 8, offset: -5 },
    { label: '10 AM', hour: 10, offset: -2 },
    { label: '12 PM', hour: 12, offset: 0 },
    { label: '2 PM', hour: 14, offset: +1 },
    { label: '4 PM', hour: 16, offset: 0 },
    { label: '6 PM', hour: 18, offset: -3 },
    { label: '8 PM', hour: 20, offset: -6 },
  ];

  return hours.map((h) => {
    const fl = Math.max(15, feelsLike + h.offset);
    const tm = Math.max(15, currentTemp + h.offset);
    return {
      time: h.label,
      hour: h.hour,
      temp: tm,
      feelsLike: fl,
      heatStressScore: Math.min(100, Math.max(10, Math.round((fl - 20) * 3.5))),
      riskLevel: calculateHeatRisk(fl),
    };
  });
}
