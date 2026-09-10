import React, { useMemo } from 'react';
import {
  computeOutdoorAdvisory,
  OutdoorAdvisoryInputs,
} from '../utils/outdoorAdvisory';

interface BestTimeToGoOutsideProps extends OutdoorAdvisoryInputs {}

export const BestTimeToGoOutside: React.FC<BestTimeToGoOutsideProps> = ({
  hourlyTemperature,
  hourlyApparentTemperature,
  hourlyHumidity,
  hourlyUvIndex,
  fallbackTemp,
  fallbackFeelsLike,
  fallbackHumidity,
  fallbackUvIndex,
}) => {
  const advisory = useMemo(() => {
    return computeOutdoorAdvisory({
      hourlyTemperature,
      hourlyApparentTemperature,
      hourlyHumidity,
      hourlyUvIndex,
      fallbackTemp,
      fallbackFeelsLike,
      fallbackHumidity,
      fallbackUvIndex,
    });
  }, [
    hourlyTemperature,
    hourlyApparentTemperature,
    hourlyHumidity,
    hourlyUvIndex,
    fallbackTemp,
    fallbackFeelsLike,
    fallbackHumidity,
    fallbackUvIndex,
  ]);

  return (
    <section id="best-time-section" className="w-full mt-10 sm:mt-12 text-left">
      <div className="flex items-baseline justify-between mb-3 px-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
          Best time to go outside
        </h2>
        <span className="text-xs font-medium text-stone-500">Today's Guide</span>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-2xs">
        {/* AUTOMATICALLY GENERATED RECOMMENDATION */}
        <div
          id="outdoor-recommendation-banner"
          className={`rounded-2xl p-4 sm:p-5 border transition-all mb-6 ${
            advisory.isAllSafe
              ? 'bg-emerald-50/70 border-emerald-200/90 text-emerald-950'
              : 'bg-stone-900 border-stone-800 text-stone-100'
          }`}
        >
          <div className="flex items-start gap-3.5 sm:gap-4">
            <span className="text-2xl sm:text-3xl shrink-0 mt-0.5 select-none">
              {advisory.isAllSafe ? '🌿' : '☀️'}
            </span>
            <div className="space-y-1">
              <div
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  advisory.isAllSafe ? 'text-emerald-700' : 'text-amber-400'
                }`}
              >
                Recommendation
              </div>
              <p
                id="outdoor-recommendation-text"
                className={`text-base sm:text-lg md:text-xl font-bold leading-snug ${
                  advisory.isAllSafe ? 'text-emerald-950' : 'text-white'
                }`}
              >
                "{advisory.recommendation}"
              </p>
              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  advisory.isAllSafe ? 'text-emerald-800' : 'text-stone-400'
                }`}
              >
                {advisory.subText}
              </p>
            </div>
          </div>
        </div>

        {/* SIMPLE TIMELINE: Morning, Afternoon, Evening */}
        <div className="mb-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3 px-1">
            Timeline
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {advisory.periods.map((period) => {
              const isRed = period.indicator === '🔴';
              return (
                <div
                  key={period.name}
                  id={`period-${period.name.toLowerCase()}`}
                  className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between select-none ${
                    isRed
                      ? 'bg-rose-50/40 border-rose-200/80 shadow-2xs'
                      : 'bg-stone-50/70 border-stone-200/70'
                  }`}
                >
                  {/* Top row: Name and Time Range */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-bold text-stone-900">
                        {period.name}
                      </h3>
                      <span className="text-2xl sm:text-3xl leading-none">
                        {period.indicator}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-stone-500 mt-1">
                      {period.timeRange}
                    </div>
                  </div>

                  {/* Bottom row: Status badge & simple guidance */}
                  <div className="mt-4 pt-3 border-t border-stone-200/50 flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        isRed
                          ? 'bg-rose-100/80 text-rose-800 border-rose-200'
                          : 'bg-emerald-100/80 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {period.statusLabel}
                    </span>
                    <span className="text-xs font-semibold text-stone-700 tabular-nums">
                      ~{period.avgTemp}°C
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
