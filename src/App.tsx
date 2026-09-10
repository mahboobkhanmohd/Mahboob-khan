import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { HeatMap } from './pages/HeatMap';
import { About } from './pages/About';
import { useHeatData } from './hooks/useHeatData';
import { CityHeatInfo } from './types/heat';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'map' | 'about'>('home');
  const {
    selectedCity,
    weatherData,
    isLoading,
    error,
    isFallback,
    retry,
    selectCityById,
    selectCityDirect,
    allCities,
  } = useHeatData();

  const handleCitySelectFromMap = (city: CityHeatInfo) => {
    selectCityDirect(city);
  };

  const handleViewAdvisoryFromMap = (city: CityHeatInfo) => {
    selectCityDirect(city);
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      <div>
        {/* Navigation Bar for secondary views (Heat Map and About) */}
        {currentPage !== 'home' && (
          <Navbar
            currentPage={currentPage}
            onNavigate={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            selectedCity={selectedCity}
            allCities={allCities}
            onSelectCity={selectCityById}
            onSelectCityDirect={selectCityDirect}
          />
        )}

        {/* Page Content */}
        <main id="main-content">
          {currentPage === 'home' && (
            <Home
              selectedCity={selectedCity}
              weatherData={weatherData}
              onNavigateToMap={() => {
                setCurrentPage('map');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToAbout={() => {
                setCurrentPage('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectCityDirect={selectCityDirect}
              isLoading={isLoading}
              error={error}
              isFallback={isFallback}
              onRetry={retry}
            />
          )}

          {currentPage === 'map' && (
            <HeatMap
              cities={allCities}
              selectedCity={selectedCity}
              onSelectCity={handleCitySelectFromMap}
              onViewAdvisory={handleViewAdvisoryFromMap}
              onBackToHome={() => {
                setCurrentPage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {currentPage === 'about' && <About />}
        </main>
      </div>

      {/* Trustworthy Minimal Footer for secondary views */}
      {currentPage !== 'home' && <Footer />}
    </div>
  );
}
