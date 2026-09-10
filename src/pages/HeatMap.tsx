import React, { useState, useMemo } from 'react';
import { HeatMapLeaflet } from '../components/HeatMapLeaflet';
import { CityHeatInfo } from '../types/heat';
import { ArrowLeft, MapPin, ArrowRight, Search, Filter, X } from 'lucide-react';
import { getRiskMeta } from '../utils/heatIndex';
import { ALL_INDIAN_STATES_AND_UTS } from '../data/indiaLocations';

interface HeatMapPageProps {
  cities: CityHeatInfo[];
  selectedCity: CityHeatInfo;
  onSelectCity: (city: CityHeatInfo) => void;
  onViewAdvisory: (city: CityHeatInfo) => void;
  onBackToHome: () => void;
}

export const HeatMap: React.FC<HeatMapPageProps> = ({
  cities,
  selectedCity,
  onSelectCity,
  onViewAdvisory,
  onBackToHome,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('ALL');

  // Filter cities displayed on map and list
  const filteredCities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return cities.filter((city) => {
      if (selectedState !== 'ALL' && city.state.toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }
      if (!q) return true;
      return city.name.toLowerCase().includes(q) || city.state.toLowerCase().includes(q);
    });
  }, [cities, searchQuery, selectedState]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Safety Advisory</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            National Heat Stress Map
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Real-time thermal risk zones and human heat stress levels across all Indian states and districts.
          </p>
        </div>

        {/* Selected City Quick Info Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-white shadow-2xs">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-xs text-stone-500 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>Selected District</span>
            </div>
            <span className="font-bold text-stone-900 text-sm">{selectedCity.name}</span>
          </div>
          <div className="h-7 w-px bg-stone-200" />
          <div className="flex flex-col">
            <span className="text-xs text-stone-500">Feels Like</span>
            <span className="font-extrabold text-stone-900 text-sm">
              {selectedCity.feelsLikeTemp}°C
            </span>
          </div>
          <button
            onClick={() => onViewAdvisory(selectedCity)}
            className="ml-1 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Full Report</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar for Map */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-white border border-stone-200 shadow-2xs">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search district or state on map..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-stone-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* State filter selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 hidden sm:inline-block" />
          <select
            id="heatmap-state-filter"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="text-xs font-medium text-stone-700 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 focus:outline-hidden focus:ring-1 focus:ring-stone-900 cursor-pointer w-full sm:w-auto"
          >
            <option value="ALL">All States & UTs ({cities.length} districts)</option>
            {ALL_INDIAN_STATES_AND_UTS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaflet + OpenStreetMap Canvas */}
      <HeatMapLeaflet
        cities={filteredCities}
        selectedCity={selectedCity}
        onSelectCity={onSelectCity}
        onViewAdvisory={onViewAdvisory}
      />

      {/* City Directory Grid (Clean, readable, tap to inspect) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
            District Directory ({filteredCities.length} locations)
          </h3>
          {(searchQuery || selectedState !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedState('ALL');
              }}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {filteredCities.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-stone-200">
            <p className="text-sm font-semibold text-stone-700">No districts match your filter.</p>
            <p className="text-xs text-stone-400 mt-1">Try clearing your search query or choosing another state.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCities.slice(0, 36).map((city) => {
              const meta = getRiskMeta(city.riskLevel);
              const isSelected = city.id === selectedCity.id;

              return (
                <div
                  key={city.id}
                  id={`city-card-${city.id}`}
                  onClick={() => onSelectCity(city)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">{city.name}</h4>
                      <p className="text-xs text-stone-500">{city.state}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        city.riskLevel === 'extreme'
                          ? 'bg-rose-100 text-rose-800'
                          : city.riskLevel === 'danger'
                          ? 'bg-orange-100 text-orange-800'
                          : city.riskLevel === 'caution'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {meta.badgeText}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-3 pt-2 border-t border-stone-100">
                    <div className="text-xs text-stone-500">
                      Feels like <span className="font-bold text-stone-900 text-sm">{city.feelsLikeTemp}°C</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewAdvisory(city);
                      }}
                      className="text-xs font-semibold text-stone-900 hover:text-amber-600 transition-colors cursor-pointer"
                    >
                      View advice →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredCities.length > 36 && (
          <p className="text-center text-xs text-stone-400 mt-4">
            Showing first 36 districts of {filteredCities.length}. Use the search bar above to narrow down to any specific district.
          </p>
        )}
      </div>
    </div>
  );
};
