import React, { useState } from 'react';
import { ShieldAlert, ChevronDown, AlertCircle, RotateCw } from 'lucide-react';
import { CityHeatInfo } from '../types/heat';
import { LocationSearchModal } from '../components/LocationSearchModal';
import { TodaysHeat } from '../components/TodaysHeat';
import { BestTimeToGoOutside } from '../components/BestTimeToGoOutside';
import { HeatwaveAlertBanner } from '../components/HeatwaveAlertBanner';
import { detectHeatwave } from '../utils/heatwaveDetection';
import { WeatherData, computeHeatRiskVerdict } from '../services/weatherService';

interface HomeProps {
  selectedCity: CityHeatInfo;
  weatherData?: WeatherData | null;
  onNavigateToMap: () => void;
  onNavigateToAbout?: () => void;
  onSelectCityDirect?: (city: CityHeatInfo) => void;
  isLoading?: boolean;
  error?: string | null;
  isFallback?: boolean;
  onRetry?: () => void;
}

export const Home: React.FC<HomeProps> = ({
  selectedCity,
  weatherData,
  onNavigateToMap,
  onNavigateToAbout,
  onSelectCityDirect,
  isLoading = false,
  error = null,
  isFallback = false,
  onRetry,
}) => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  // Weather values: prioritizes real weather data, with city fallback
  const currentTemp = weatherData ? weatherData.temperature : selectedCity.currentTemp;
  const feelsLikeTemp = weatherData ? weatherData.apparentTemperature : selectedCity.feelsLikeTemp;
  const humidity = weatherData ? weatherData.humidity : selectedCity.humidity;
  const windSpeed = weatherData ? weatherData.windSpeed : selectedCity.windSpeedKmH;
  const uvIndex = weatherData ? weatherData.uvIndex : selectedCity.uvIndex;

  // Deterministic calculated verdict and guidance using the thermal stress calculation engine
  const details = computeHeatRiskVerdict(currentTemp, feelsLikeTemp, humidity, windSpeed, uvIndex);

  // HeatSafe Early-Warning Detection: only triggers an alert during periods of unusually high heat
  const heatwaveAlert = detectHeatwave({
    hourlyTemperature: weatherData?.hourlyTemperature,
    hourlyApparentTemperature: weatherData?.hourlyApparentTemperature,
    fallbackTemp: currentTemp,
    fallbackFeelsLike: feelsLikeTemp,
  });

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      {/* Top Bar: Brand & Discreet Navigation */}
      <header className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex items-center justify-between">
        {/* HeatSafe Logo */}
        <div className="flex items-center gap-2.5 select-none">
          <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <span className="font-extrabold tracking-tight text-xl text-stone-950">
            HEATSAFE
          </span>
        </div>

        {/* Quiet Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            id="nav-to-map-btn"
            onClick={onNavigateToMap}
            className="text-xs font-semibold text-stone-600 hover:text-stone-950 px-3 py-1.5 rounded-full hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            Heat Map
          </button>
          {onNavigateToAbout && (
            <button
              id="nav-to-about-btn"
              onClick={onNavigateToAbout}
              className="text-xs font-semibold text-stone-600 hover:text-stone-950 px-3 py-1.5 rounded-full hover:bg-stone-200/60 transition-colors cursor-pointer"
            >
              About
            </button>
          )}
        </nav>
      </header>

      {/* Main Content: Single focused column */}
      <main className="w-full max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center text-center">
        {/* Location Section */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <button
            id="home-location-btn"
            onClick={() => setSearchModalOpen(true)}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-stone-100/90 border border-stone-200/90 text-stone-900 font-semibold text-sm sm:text-base shadow-2xs hover:border-stone-300 transition-all cursor-pointer"
            title="Search any district or state in India"
          >
            <span className="text-base">📍</span>
            <span>
              {selectedCity.name}
              {selectedCity.state ? `, ${selectedCity.state}` : ', India'}
            </span>
            <ChevronDown className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-transform group-hover:translate-y-0.5" />
          </button>

          {/* Connection / Update status */}
          <div className="flex items-center gap-2 mt-2">
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Updating conditions from Open-Meteo...
              </span>
            ) : error ? (
              <span className="text-xs text-amber-800 font-medium">
                Showing offline fallback data
              </span>
            ) : isFallback ? (
              <span className="text-xs text-stone-500 font-normal">
                Estimated regional conditions
              </span>
            ) : (
              <div className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-stone-500 font-normal tracking-wide">
                  Live from Open-Meteo
                </span>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    title="Refresh live weather"
                    className="p-1 text-stone-400 hover:text-stone-700 transition-colors rounded-full cursor-pointer ml-0.5"
                    aria-label="Refresh weather data"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error State Banner with Retry button */}
        {error && (
          <div
            id="weather-error-banner"
            className="w-full bg-amber-50/90 border border-amber-200/80 rounded-2xl px-4 py-3 mb-6 flex items-center justify-between gap-3 text-xs text-amber-900"
          >
            <div className="flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Could not refresh from Open-Meteo. Displaying cached safety data.</span>
            </div>
            {onRetry && (
              <button
                id="weather-retry-btn"
                onClick={onRetry}
                disabled={isLoading}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-stone-50 text-stone-900 font-semibold rounded-full border border-amber-300 shadow-2xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Checking...' : 'Retry'}</span>
              </button>
            )}
          </div>
        )}

        {/* MAIN QUESTION */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wider text-stone-900 uppercase mb-6 sm:mb-8 text-center select-none">
          HOW SAFE IS IT OUTSIDE?
        </h1>

        {/* ONE LARGE CENTRAL RISK SECTION (Visual Centerpiece) */}
        <div
          id="central-risk-card"
          className={`w-full bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/90 shadow-sm flex flex-col items-center relative overflow-hidden transition-opacity duration-300 ${
            isLoading ? 'opacity-80' : 'opacity-100'
          }`}
        >
          {/* Risk Score Number - Visual Centerpiece */}
          <div className="text-8xl sm:text-9xl font-black tracking-tighter text-stone-900 tabular-nums leading-none mb-4 sm:mb-5 select-none">
            {details.score}
          </div>

          {/* RISK Badge - Tasteful, minimal accent color */}
          <div
            className={`inline-flex items-center justify-center px-4 py-1 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase border ${details.badgeBg} mb-3`}
          >
            {details.label}
          </div>

          {/* Short Plain-Language Verdict */}
          <p className="text-stone-700 text-base sm:text-lg font-medium leading-snug max-w-sm text-center">
            "{details.verdict}"
          </p>

          {/* Small Expandable: Why? */}
          <div className="mt-4 sm:mt-5 flex flex-col items-center w-full max-w-xs">
            <button
              id="why-toggle-btn"
              onClick={() => setShowWhy(!showWhy)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-500 hover:text-stone-900 py-1.5 px-3 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
              aria-expanded={showWhy}
            >
              <span>Why?</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showWhy ? 'rotate-180 text-stone-800' : 'text-stone-400'
                }`}
              />
            </button>

            {showWhy && (
              <div
                id="why-details"
                className="mt-2.5 w-full bg-stone-50 rounded-2xl p-4 border border-stone-200/80 text-left text-xs sm:text-sm text-stone-700 space-y-2 animate-in fade-in duration-150"
              >
                {details.whyReasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-1.5 shrink-0" />
                    <span className="font-medium text-stone-800 leading-snug">{reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clean, quiet temperature reference */}
          <div className="w-full max-w-xs border-t border-stone-100 my-5 sm:my-6" />

          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-stone-500 font-normal">
            <span className="font-semibold text-stone-800">{currentTemp}°C</span>
            <span className="text-stone-300">•</span>
            <span>Feels like {feelsLikeTemp}°C</span>
          </div>
        </div>

        {/* Educational indicator notice */}
        <p className="text-[11px] text-stone-400 font-normal mt-3 select-none">
          Experimental educational indicator • Not an official government index
        </p>

        {/* EARLY-WARNING HEAT ALERT (Rendered ONLY when conditions are unusually hot, calm & actionable) */}
        <HeatwaveAlertBanner alert={heatwaveAlert} />

        {/* TODAY'S HEAT SECTION (ONE beautiful clean Recharts chart, minimal, time/temp/risk) */}
        <TodaysHeat
          hourlyTemperature={weatherData?.hourlyTemperature}
          hourlyApparentTemperature={weatherData?.hourlyApparentTemperature}
          hourlyHumidity={weatherData?.hourlyHumidity}
          hourlyUvIndex={weatherData?.hourlyUvIndex}
          fallbackTemp={currentTemp}
          fallbackFeelsLike={feelsLikeTemp}
          fallbackHumidity={humidity}
          fallbackUvIndex={uvIndex}
        />

        {/* BEST TIME TO GO OUTSIDE (Simple timeline & automatically generated recommendation) */}
        <BestTimeToGoOutside
          hourlyTemperature={weatherData?.hourlyTemperature}
          hourlyApparentTemperature={weatherData?.hourlyApparentTemperature}
          hourlyHumidity={weatherData?.hourlyHumidity}
          hourlyUvIndex={weatherData?.hourlyUvIndex}
          fallbackTemp={currentTemp}
          fallbackFeelsLike={feelsLikeTemp}
          fallbackHumidity={humidity}
          fallbackUvIndex={uvIndex}
        />

        {/* WHAT SHOULD I DO? */}
        <section className="w-full mt-12 sm:mt-16">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-950 mb-5 sm:mb-6">
            What should I do?
          </h2>

          {/* 3-4 Concise Actions */}
          <div className="space-y-3">
            {details.actions.map((action, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-stone-200/80 p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 text-left shadow-2xs hover:border-stone-300 transition-colors"
              >
                <span className="text-2xl sm:text-3xl shrink-0 select-none">{action.emoji}</span>
                <span className="text-stone-900 text-base sm:text-lg font-medium">
                  {action.text}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Location Search Dialog Modal */}
        <LocationSearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          selectedCity={selectedCity}
          onSelectCity={(city) => {
            onSelectCityDirect?.(city);
          }}
        />
      </main>

      {/* Clean, quiet bottom area */}
      <footer className="w-full max-w-xl mx-auto px-4 sm:px-6 py-8 text-center text-xs text-stone-400">
        <p>HeatSafe Early Warning • Human Heat Stress Awareness</p>
      </footer>
    </div>
  );
};
