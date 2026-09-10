import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Navigation, Loader2 } from 'lucide-react';
import { CityHeatInfo } from '../types/heat';
import {
  GeocodedCity,
  searchCitiesWithOpenMeteo,
  reverseGeocodeCoordinates,
  DEFAULT_SEARCH_CITIES,
} from '../services/geocodingService';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: CityHeatInfo;
  onSelectCity: (city: CityHeatInfo) => void;
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  selectedCity,
  onSelectCity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<GeocodedCity[]>(DEFAULT_SEARCH_CITIES);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const searchRequestRef = useRef(0);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement;
      const focusTimer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setLocationError(null);
      return () => window.clearTimeout(focusTimer);
    } else {
      setSearchQuery('');
      setResults(DEFAULT_SEARCH_CITIES);
      previouslyFocusedElementRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Perform geocoding search with debounce
  useEffect(() => {
    const trimmed = searchQuery.trim();
    const requestId = ++searchRequestRef.current;
    if (!trimmed) {
      setResults(DEFAULT_SEARCH_CITIES);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const list = await searchCitiesWithOpenMeteo(trimmed);
        if (requestId !== searchRequestRef.current) return;
        setResults(list);
      } catch {
        if (requestId !== searchRequestRef.current) return;
        setResults([]);
      } finally {
        if (requestId === searchRequestRef.current) setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle "Use my location" using browser geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your device.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const loc = await reverseGeocodeCoordinates(latitude, longitude);
          handleSelectLocation(loc);
        } catch {
          // Fallback location
          const fallbackLoc: GeocodedCity = {
            id: `geo-${latitude.toFixed(3)}-${longitude.toFixed(3)}`,
            name: 'My Location',
            state: 'India',
            country: 'India',
            latitude,
            longitude,
          };
          handleSelectLocation(fallbackLoc);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setLocationError('Location permission was denied.');
        } else {
          setLocationError('Could not retrieve your location.');
        }
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  // When a location is clicked
  const handleSelectLocation = (loc: GeocodedCity) => {
    // Construct new CityHeatInfo with exact coordinates and names
    const newCity: CityHeatInfo = {
      id: loc.id,
      name: loc.name,
      state: loc.state,
      lat: loc.latitude,
      lon: loc.longitude,
      currentTemp: selectedCity.currentTemp,
      feelsLikeTemp: selectedCity.feelsLikeTemp,
      humidity: selectedCity.humidity,
      windSpeedKmH: selectedCity.windSpeedKmH,
      riskLevel: selectedCity.riskLevel,
      verdict: selectedCity.verdict,
      isSafeOutsideNow: selectedCity.isSafeOutsideNow,
      peakDangerWindow: selectedCity.peakDangerWindow,
      uvIndex: selectedCity.uvIndex,
      updatedAt: 'Updating...',
    };

    onSelectCity(newCity);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-dialog-title"
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-24 px-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden flex flex-col max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Search Input */}
        <div className="p-4 sm:p-5 border-b border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <h2 id="location-dialog-title" className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Location
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search field */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your city"
              className="w-full pl-10 pr-9 py-2.5 bg-stone-100/90 rounded-2xl text-stone-900 text-base placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-900/20 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-stone-400 hover:text-stone-700 p-0.5 rounded-full"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Use My Location Button */}
        <div className="px-4 py-2.5 border-b border-stone-100 bg-stone-50/50">
          <button
            id="use-my-location-btn"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-stone-100/90 transition-colors cursor-pointer disabled:opacity-50 text-stone-900"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
            ) : (
              <Navigation className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className="text-sm font-semibold">
              {isLocating ? 'Detecting your location...' : 'Use my location'}
            </span>
          </button>
          {locationError && (
            <p className="text-xs text-rose-600 mt-1 px-3">{locationError}</p>
          )}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-stone-50 flex-1">
          {isSearching ? (
            <div className="py-8 flex flex-col items-center justify-center text-stone-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-stone-500" />
              <span className="text-xs">Searching Open-Meteo...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center text-stone-400 text-sm">
              No cities found for "{searchQuery}"
            </div>
          ) : (
            results.map((item) => {
              const isSelected =
                item.name.toLowerCase() === selectedCity.name.toLowerCase() ||
                (Math.abs(item.latitude - selectedCity.lat) < 0.05 &&
                  Math.abs(item.longitude - selectedCity.lon) < 0.05);

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectLocation(item)}
                  className={`w-full text-left px-3.5 py-3 rounded-2xl flex flex-col transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/80 hover:bg-amber-100/80'
                      : 'hover:bg-stone-100/80'
                  }`}
                >
                  <span className="font-semibold text-stone-900 text-base leading-tight">
                    {item.name}
                  </span>
                  <span className="text-xs text-stone-500 mt-0.5">
                    {item.state ? `${item.state}, ${item.country}` : item.country}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
