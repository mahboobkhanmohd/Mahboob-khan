import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DailyForecast } from '../services/weatherService';

interface SevenDayForecastProps {
  forecast: DailyForecast[];
}

const riskStyles: Record<DailyForecast['riskLabel'], string> = {
  High: 'bg-rose-50 text-rose-800',
  Moderate: 'bg-orange-50 text-orange-800',
  Caution: 'bg-amber-50 text-amber-800',
  Safe: 'bg-emerald-50 text-emerald-800',
};

const riskDots: Record<DailyForecast['riskLabel'], string> = {
  High: 'bg-rose-500',
  Moderate: 'bg-orange-500',
  Caution: 'bg-amber-500',
  Safe: 'bg-emerald-500',
};

export const SevenDayForecast: React.FC<SevenDayForecastProps> = ({ forecast }) => {
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  if (forecast.length === 0) {
    return (
      <section className="w-full mt-12 sm:mt-16 text-left" aria-labelledby="seven-day-forecast-heading">
        <h2 id="seven-day-forecast-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-stone-950 mb-3">
          7-day forecast
        </h2>
        <p className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-600 shadow-2xs">
          The forecast is unavailable right now. Please try again shortly.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full mt-12 sm:mt-16 text-left" aria-labelledby="seven-day-forecast-heading">
      <h2 id="seven-day-forecast-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-stone-950 mb-5">
        7-day forecast
      </h2>
      <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200/80 bg-white px-4 shadow-2xs">
        {forecast.map((day) => {
          const isExpanded = expandedDate === day.date;
          return (
            <div key={day.date}>
              <button
                type="button"
                onClick={() => setExpandedDate(isExpanded ? null : day.date)}
                aria-expanded={isExpanded}
                className="flex w-full items-center gap-3 py-4 text-left cursor-pointer"
              >
                <span className="w-14 shrink-0 text-xs font-bold tracking-wide text-stone-500">
                  {day.dayLabel}
                </span>
                <span className="min-w-0 flex-1 text-base font-semibold text-stone-900">
                  {day.high}° / {day.low}°
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${riskStyles[day.riskLabel]}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${riskDots[day.riskLabel]}`} aria-hidden="true" />
                  {day.riskLabel}
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {isExpanded && (
                <p className="pb-4 pl-14 text-xs leading-relaxed text-stone-500">
                  {day.riskLabel === 'Safe'
                    ? 'Comfortable conditions are expected for normal outdoor plans.'
                    : `Plan around the heat and take extra care during the warmest part of the day.`}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};