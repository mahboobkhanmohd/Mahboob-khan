import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CityHeatInfo } from '../types/heat';
import { calculateThermalStress } from '../utils/thermalStress';

interface HeatMapLeafletProps {
  cities: CityHeatInfo[];
  selectedCity: CityHeatInfo;
  onSelectCity: (city: CityHeatInfo) => void;
  onViewAdvisory: (city: CityHeatInfo) => void;
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  };
  return value.replace(/[&<>'"]/g, (character) => entities[character]);
}

export function getRiskMarkerMeta(city: CityHeatInfo) {
  const thermalStress = calculateThermalStress({
    temperature: city.currentTemp,
    relativeHumidity: city.humidity,
    apparentTemperature: city.feelsLikeTemp,
    windSpeed: city.windSpeedKmH || 12,
    uvIndex: city.uvIndex || 7,
  });

  const score = thermalStress.score;

  if (score >= 75 || city.riskLevel === 'extreme' || city.feelsLikeTemp >= 44) {
    return {
      score,
      levelLabel: 'EXTREME RISK',
      shortLabel: 'Extreme',
      emoji: '🔴',
      colorHex: '#dc2626',
      badgeBg: '#fef2f2',
      badgeText: '#991b1b',
      badgeBorder: '#fecaca',
      advice: city.verdict || 'Avoid outdoor activity during peak afternoon.',
    };
  } else if (score >= 52 || city.riskLevel === 'danger' || city.feelsLikeTemp >= 38) {
    return {
      score,
      levelLabel: 'HIGH RISK',
      shortLabel: 'High',
      emoji: '🟠',
      colorHex: '#ea580c',
      badgeBg: '#fff7ed',
      badgeText: '#9a3412',
      badgeBorder: '#fed7aa',
      advice: city.verdict || 'Take care during the afternoon.',
    };
  } else if (score >= 32 || city.riskLevel === 'caution' || city.feelsLikeTemp >= 32) {
    return {
      score,
      levelLabel: 'CAUTION',
      shortLabel: 'Caution',
      emoji: '🟡',
      colorHex: '#d97706',
      badgeBg: '#fffbeb',
      badgeText: '#92400e',
      badgeBorder: '#fde68a',
      advice: city.verdict || 'Stay hydrated and seek shade.',
    };
  } else {
    return {
      score,
      levelLabel: 'SAFE',
      shortLabel: 'Safe',
      emoji: '🟢',
      colorHex: '#16a34a',
      badgeBg: '#f0fdf4',
      badgeText: '#166534',
      badgeBorder: '#bbf7d0',
      advice: city.verdict || 'Conditions are relatively comfortable today.',
    };
  }
}

export const HeatMapLeaflet: React.FC<HeatMapLeafletProps> = ({
  cities,
  selectedCity,
  onSelectCity,
  onViewAdvisory,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map centered on India
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [21.5, 79.5],
        zoom: 5,
        minZoom: 4,
        maxZoom: 14,
        zoomControl: false,
        attributionControl: true,
      });

      // Add OpenStreetMap standard tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Discreet zoom control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    Object.keys(markersRef.current).forEach((key) => {
      markersRef.current[key]?.remove();
    });
    markersRef.current = {};

    // Ensure selected city is plotted even if not in current filter slice
    const plotCities = cities.some((c) => c.id === selectedCity.id)
      ? cities
      : [selectedCity, ...cities];

    plotCities.forEach((city) => {
      const meta = getRiskMarkerMeta(city);
      const isSelected = city.id === selectedCity.id;
      const popupCityName = escapeHtml(city.name);
      const popupState = escapeHtml(city.state);
      const popupAdvice = escapeHtml(meta.advice);
      const popupCityId = escapeHtml(city.id);

      // Clean simple risk marker with temperature
      const size = isSelected ? 34 : 26;
      const customIcon = L.divIcon({
        className: 'custom-heat-pin',
        html: `
          <div style="
            position: relative;
            width: ${size}px;
            height: ${size}px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            ${
              isSelected
                ? `<div style="
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 9999px;
                    background-color: ${meta.colorHex};
                    opacity: 0.35;
                    animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                  "></div>`
                : ''
            }
            <div style="
              width: ${size}px;
              height: ${size}px;
              border-radius: 9999px;
              background-color: ${meta.colorHex};
              border: 2px solid #ffffff;
              box-shadow: 0 3px 6px -1px rgba(0, 0, 0, 0.25);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-size: ${isSelected ? '11px' : '9px'};
              font-weight: 700;
              font-family: system-ui, -apple-system, sans-serif;
            ">
              ${city.feelsLikeTemp}°
            </div>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([city.lat, city.lon], { icon: customIcon }).addTo(map);

      // SMALL information card on click
      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 2px; min-width: 175px; text-align: left;">
          <div style="font-size: 15px; font-weight: 700; color: #1c1917; line-height: 1.2;">
            ${popupCityName}
          </div>
          <div style="font-size: 11px; color: #78716c; margin-bottom: 8px;">
            ${popupState}
          </div>

          <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 22px; font-weight: 800; color: #0c0a09;">
              ${city.currentTemp}°C
            </span>
            <span style="font-size: 12px; color: #57534e; font-weight: 500;">
              Feels like ${city.feelsLikeTemp}°C
            </span>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="
              display: inline-flex;
              align-items: center;
              gap: 4px;
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 0.05em;
              padding: 2px 7px;
              border-radius: 9999px;
              background-color: ${meta.badgeBg};
              color: ${meta.badgeText};
              border: 1px solid ${meta.badgeBorder};
            ">
              ${meta.emoji} ${meta.levelLabel}
            </span>
            <span style="font-size: 10px; font-weight: 600; color: #78716c;">
              Score: ${meta.score}/100
            </span>
          </div>

          <div style="font-size: 11px; color: #44403c; font-style: italic; margin-bottom: 10px; line-height: 1.35;">
            "${popupAdvice}"
          </div>

          <button
            id="popup-btn-${popupCityId}"
            style="
              width: 100%;
              padding: 6px 10px;
              background-color: #1c1917;
              color: #ffffff;
              font-size: 11px;
              font-weight: 600;
              border: none;
              border-radius: 6px;
              cursor: pointer;
            "
          >
            View Safety Advice →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 240,
        className: 'clean-leaflet-popup',
      });

      marker.on('click', () => {
        onSelectCity(city);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${city.id}`);
        if (btn) {
          btn.onclick = () => {
            onViewAdvisory(city);
          };
        }
      });

      markersRef.current[city.id] = marker;
    });
  }, [cities, selectedCity, onSelectCity, onViewAdvisory]);

  useEffect(() => {
    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markersRef.current = {};
    };
  }, []);

  return (
    <div className="relative w-full h-[540px] sm:h-[600px] rounded-2xl overflow-hidden border border-stone-200 shadow-2xs">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Clean, minimalist risk legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 border border-stone-200/90 shadow-sm text-xs flex items-center gap-3 sm:gap-4 select-none">
        <span className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider hidden sm:inline">
          Heat Risk:
        </span>
        <div className="flex items-center gap-1.5 font-medium text-stone-700">
          <span>🟢</span>
          <span>Safe</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-stone-700">
          <span>🟡</span>
          <span>Caution</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-stone-700">
          <span>🟠</span>
          <span>High</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-stone-700">
          <span>🔴</span>
          <span>Extreme</span>
        </div>
      </div>
    </div>
  );
};
