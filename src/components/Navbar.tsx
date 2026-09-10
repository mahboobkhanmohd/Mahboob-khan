import React, { useState } from 'react';
import { ShieldAlert, MapPin, Search } from 'lucide-react';
import { CityHeatInfo } from '../types/heat';
import { LocationSearchModal } from './LocationSearchModal';

interface NavbarProps {
  currentPage: 'home' | 'map' | 'about';
  onNavigate: (page: 'home' | 'map' | 'about') => void;
  selectedCity: CityHeatInfo;
  allCities: CityHeatInfo[];
  onSelectCity: (cityId: string) => void;
  onSelectCityDirect?: (city: CityHeatInfo) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  selectedCity,
  onSelectCity,
  onSelectCityDirect,
}) => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const handleSelectCity = (city: CityHeatInfo) => {
    if (onSelectCityDirect) {
      onSelectCityDirect(city);
    } else {
      onSelectCity(city.id);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 min-h-18 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <button
          id="nav-brand-btn"
          onClick={() => onNavigate('home')}
          className="text-left flex items-center gap-3 group focus:outline-hidden cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl heatsafe-brand-gradient text-amber-400 flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-xl text-stone-900 leading-none">
                HEATSAFE
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded-sm bg-stone-200/70 text-stone-600">
                Early Warning
              </span>
            </div>
            <p className="text-xs text-stone-500 font-normal leading-tight mt-0.5 hidden xs:block">
              Know the heat. Protect yourself.
            </p>
          </div>
        </button>

        {/* Navigation Links */}
        <nav className="order-3 flex w-full items-center justify-center gap-1 sm:order-none sm:w-auto sm:justify-end sm:gap-2">
          <button
            id="nav-home-btn"
            onClick={() => onNavigate('home')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              currentPage === 'home'
                ? 'bg-stone-900 text-stone-50'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            Advisory
          </button>
          <button
            id="nav-map-btn"
            onClick={() => onNavigate('map')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              currentPage === 'map'
                ? 'bg-stone-900 text-stone-50'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            Heat Map
          </button>
          <button
            id="nav-about-btn"
            onClick={() => onNavigate('about')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              currentPage === 'about'
                ? 'bg-stone-900 text-stone-50'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            About
          </button>
        </nav>

        {/* Location Search Trigger Button */}
        <div>
          <button
            id="city-switcher-toggle"
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 text-sm font-medium transition-colors shadow-2xs group cursor-pointer"
            aria-label={`Change location. Currently selected: ${selectedCity.name}, ${selectedCity.state}`}
            title="Search any Indian district or state"
          >
            <MapPin className="w-4 h-4 text-stone-500 shrink-0 group-hover:text-amber-600 transition-colors" />
            <div className="flex flex-col text-left">
              <span className="truncate max-w-[100px] sm:max-w-[140px] font-semibold text-stone-900 text-xs sm:text-sm leading-tight">
                {selectedCity.name}
              </span>
              <span className="text-[10px] text-stone-400 truncate max-w-[100px] sm:max-w-[140px] leading-tight hidden xs:block">
                {selectedCity.state}
              </span>
            </div>
            <Search className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-0.5 group-hover:text-stone-700" />
          </button>

          {/* Search Modal supporting every district and every state */}
          <LocationSearchModal
            isOpen={searchModalOpen}
            onClose={() => setSearchModalOpen(false)}
            selectedCity={selectedCity}
            onSelectCity={handleSelectCity}
          />
        </div>
      </div>
    </header>
  );
};
