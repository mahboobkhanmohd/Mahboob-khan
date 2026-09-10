import { useState, useEffect, useCallback, useRef } from 'react';
import { CityHeatInfo, HourlyForecastItem, VulnerableProfile } from '../types/heat';
import { POPULAR_CITIES } from '../services/mockData';
import { fetchLiveHeatData, WeatherData, getFallbackWeatherData } from '../services/weatherService';
import { ALL_INDIA_CITY_HEAT_INFOS } from '../utils/locationHelper';
import { getSavedLocation, saveSelectedLocation } from '../services/geocodingService';

const DEFAULT_CITY = POPULAR_CITIES.find((c) => c.id === 'hyderabad') || {
  id: 'hyderabad',
  name: 'Hyderabad',
  state: 'Telangana',
  lat: 17.385,
  lon: 78.4867,
  currentTemp: 39,
  feelsLikeTemp: 44,
  humidity: 62,
  windSpeedKmH: 14,
  riskLevel: 'danger',
  verdict: 'Very hot conditions. Take care if you need to go outside.',
  isSafeOutsideNow: false,
  peakDangerWindow: '11:30 AM – 4:00 PM',
  uvIndex: 9,
  updatedAt: 'Updated recently',
};

function getInitialCity(): CityHeatInfo {
  const saved = getSavedLocation();
  if (saved) {
    const existing =
      ALL_INDIA_CITY_HEAT_INFOS.find(
        (c) => c.name.toLowerCase() === saved.name.toLowerCase()
      ) ||
      POPULAR_CITIES.find(
        (c) => c.name.toLowerCase() === saved.name.toLowerCase()
      );

    if (existing) {
      return {
        ...existing,
        lat: saved.latitude,
        lon: saved.longitude,
        state: saved.state || existing.state,
      };
    }

    return {
      id: saved.id,
      name: saved.name,
      state: saved.state,
      lat: saved.latitude,
      lon: saved.longitude,
      currentTemp: 38,
      feelsLikeTemp: 42,
      humidity: 50,
      windSpeedKmH: 12,
      riskLevel: 'danger',
      verdict: 'Warm to hot conditions.',
      isSafeOutsideNow: false,
      peakDangerWindow: '11:30 AM – 4:00 PM',
      uvIndex: 8,
      updatedAt: 'Updated recently',
    };
  }
  return DEFAULT_CITY;
}

export function useHeatData() {
  const [selectedCity, setSelectedCity] = useState<CityHeatInfo>(getInitialCity);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastItem[]>([]);
  const [vulnerableProfile, setVulnerableProfile] = useState<VulnerableProfile>('general');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'live' | 'standard'>('standard');

  const cityRef = useRef(selectedCity);
  const requestIdRef = useRef(0);
  cityRef.current = selectedCity;

  const loadCityData = useCallback(async (city: CityHeatInfo) => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);
    setWeatherData(null);
    try {
      const result = await fetchLiveHeatData(city);
      if (requestId !== requestIdRef.current) return;
      setSelectedCity(result.city);
      setHourlyForecast(result.hourly);
      setWeatherData(result.weather);

      if (result.error) {
        setError('Weather data is temporarily unavailable. Showing estimated conditions.');
        setDataSource('standard');
      } else {
        setError(null);
        setDataSource('live');
      }
    } catch (err: unknown) {
      if (requestId !== requestIdRef.current) return;
      setError('Weather data is temporarily unavailable. Showing estimated conditions.');
      setDataSource('standard');
      // Gracefully fall back to local mock data
      setWeatherData(getFallbackWeatherData(city));
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, []);

  // Reload weather whenever city or coordinates change
  useEffect(() => {
    loadCityData(selectedCity);
  }, [selectedCity.id, selectedCity.lat, selectedCity.lon, loadCityData]);

  const selectCityById = (cityId: string) => {
    const found =
      ALL_INDIA_CITY_HEAT_INFOS.find((c) => c.id === cityId) ||
      POPULAR_CITIES.find((c) => c.id === cityId);
    if (found) {
      saveSelectedLocation({
        id: found.id,
        name: found.name,
        state: found.state,
        country: 'India',
        latitude: found.lat,
        longitude: found.lon,
      });
      setSelectedCity(found);
    }
  };

  const selectCityDirect = (city: CityHeatInfo) => {
    saveSelectedLocation({
      id: city.id,
      name: city.name,
      state: city.state,
      country: 'India',
      latitude: city.lat,
      longitude: city.lon,
    });
    setSelectedCity(city);
  };

  const retry = useCallback(() => {
    return loadCityData(cityRef.current);
  }, [loadCityData]);

  return {
    selectedCity,
    weatherData,
    hourlyForecast,
    vulnerableProfile,
    setVulnerableProfile,
    isLoading,
    error,
    isFallback: weatherData?.isFallback ?? false,
    dataSource,
    selectCityById,
    selectCityDirect,
    allCities: ALL_INDIA_CITY_HEAT_INFOS,
    popularCities: POPULAR_CITIES,
    refresh: retry,
    retry,
  };
}
