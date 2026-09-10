import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { HeatwaveDetectionResult } from '../utils/heatwaveDetection';

interface HeatwaveAlertBannerProps {
  alert: HeatwaveDetectionResult;
}

export const HeatwaveAlertBanner: React.FC<HeatwaveAlertBannerProps> = ({ alert }) => {
  // IMPORTANT: Never render an alert if conditions are normal
  if (!alert.isHeatwave) {
    return null;
  }

  const isExtreme = alert.severity === 'EXTREME';

  return (
    <div
      id="heatwave-warning-banner"
      role="alert"
      className={`w-full mt-8 sm:mt-10 rounded-2xl border p-4 sm:p-5 text-left transition-all ${
        isExtreme
          ? 'bg-rose-50/80 border-rose-300/80 text-rose-950'
          : 'bg-amber-50/80 border-amber-300/80 text-amber-950'
      }`}
    >
      <div className="flex items-start gap-3.5 sm:gap-4">
        {/* Warning Icon */}
        <div
          className={`p-2 rounded-xl shrink-0 ${
            isExtreme ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
          }`}
        >
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="space-y-2 flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                isExtreme
                  ? 'bg-rose-200/70 text-rose-900 border-rose-300'
                  : 'bg-amber-200/70 text-amber-900 border-amber-300'
              }`}
            >
              ⚠️ {alert.headline}
            </span>
            {alert.duration > 0 && (
              <span className="text-xs text-stone-500 font-medium">
                Expected duration: ~{alert.duration} hours
              </span>
            )}
          </div>

          {/* Explanation Quote */}
          <p className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
            "{alert.explanation}"
          </p>

          {/* Peak Window & Temperature */}
          {alert.peakWindow && (
            <div className="flex items-baseline gap-2 text-xs sm:text-sm font-medium text-stone-700 pt-0.5">
              <span className="text-stone-500 font-semibold uppercase text-[11px] tracking-wider">
                Peak:
              </span>
              <strong className="text-stone-900 font-bold bg-white/80 px-2 py-0.5 rounded-md border border-stone-200">
                {alert.peakWindow}
              </strong>
              <span className="text-stone-500">
                (Up to {alert.peakTemperature}°C
                {alert.peakApparentTemperature > alert.peakTemperature &&
                  `, feels like ${alert.peakApparentTemperature}°C`}
                )
              </span>
            </div>
          )}

          {/* Calm, actionable instruction */}
          <p className="text-xs sm:text-sm text-stone-700 pt-1 font-medium leading-relaxed">
            "{alert.actionAdvice}"
          </p>
        </div>
      </div>
    </div>
  );
};
