import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { CityHeatInfo, HeatRiskLevel } from '../types/heat';
import { getRiskMarkerMeta } from './HeatMapLeaflet';

interface IndiaHeatOverviewProps {
  cities: CityHeatInfo[];
  onSelectCity: (city: CityHeatInfo) => void;
}

const riskOrder: HeatRiskLevel[] = ['safe', 'caution', 'danger', 'extreme'];

const riskMeta: Record<HeatRiskLevel, { label: string; color: string; dot: string }> = {
  safe: { label: 'Safe', color: 'text-emerald-700', dot: 'bg-emerald-500' },
  caution: { label: 'Caution', color: 'text-amber-700', dot: 'bg-amber-500' },
  danger: { label: 'High Risk', color: 'text-orange-700', dot: 'bg-orange-500' },
  extreme: { label: 'Extreme', color: 'text-rose-700', dot: 'bg-rose-500' },
};

export const IndiaHeatOverview: React.FC<IndiaHeatOverviewProps> = ({ cities, onSelectCity }) => {
  const { counts, highestRisk } = useMemo(() => {
    const counts = riskOrder.reduce<Record<HeatRiskLevel, number>>(
      (result, level) => ({ ...result, [level]: cities.filter((city) => city.riskLevel === level).length }),
      { safe: 0, caution: 0, danger: 0, extreme: 0 }
    );
    const highestRisk = cities
      .map((city) => ({ city, score: getRiskMarkerMeta(city).score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return { counts, highestRisk };
  }, [cities]);

  return (
    <section aria-labelledby="heat-overview-title" className="space-y-5">
      <div>
        <h1 id="heat-overview-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          Heat across India
        </h1>
        <p className="text-sm text-stone-600 mt-1">A simple view of today&apos;s heat risk by location.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {riskOrder.map((level) => {
          const meta = riskMeta[level];
          return (
            <div key={level} className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
              <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
              <div className="mt-1 text-2xl font-black tabular-nums text-stone-900">{counts[level]}</div>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="text-base font-bold text-stone-900 mb-3">Highest heat risk today</h2>
        <div className="rounded-xl border border-stone-200 bg-white px-4 shadow-2xs">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-3 border-b border-stone-100 py-2.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            <span>Location</span>
            <span>Temperature</span>
            <span>Heat Stress</span>
          </div>
          {highestRisk.map(({ city, score }) => {
            const meta = getRiskMarkerMeta(city);
            return (
              <button
                key={city.id}
                type="button"
                onClick={() => onSelectCity(city)}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-stone-100 py-3 text-left last:border-0 hover:bg-stone-50 cursor-pointer"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-stone-900">{city.name}</span>
                  <span className="block truncate text-xs text-stone-500">{city.state}</span>
                </span>
                <span className="text-sm font-semibold tabular-nums text-stone-800">{city.currentTemp}°C</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold tabular-nums text-stone-800">
                  <span className={`h-2 w-2 rounded-full ${meta.colorHex === '#dc2626' ? 'bg-rose-500' : meta.colorHex === '#ea580c' ? 'bg-orange-500' : 'bg-amber-500'}`} aria-hidden="true" />
                  {score}
                  <ArrowRight className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};