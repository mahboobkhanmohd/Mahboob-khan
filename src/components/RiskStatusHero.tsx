import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Droplets, Wind, Clock } from 'lucide-react';
import { CityHeatInfo } from '../types/heat';
import { getRiskMeta } from '../utils/heatIndex';

interface RiskStatusHeroProps {
  city: CityHeatInfo;
  onViewMapClick?: () => void;
  onChangeLocationClick?: () => void;
}

export const RiskStatusHero: React.FC<RiskStatusHeroProps> = ({
  city,
  onViewMapClick,
  onChangeLocationClick,
}) => {
  const meta = getRiskMeta(city.riskLevel);

  const getVerdictAnswer = () => {
    if (city.riskLevel === 'extreme') {
      return {
        verdict: 'NO. AVOID BEING OUTSIDE.',
        tone: 'text-rose-950',
        bg: 'bg-rose-100/70',
        border: 'border-rose-300',
        badgeBg: 'bg-rose-700 text-white',
        icon: <ShieldAlert className="w-8 h-8 text-rose-700 shrink-0" />,
        subtext: 'Acute heat risk. Physical exertion outdoors can cause rapid heat exhaustion or heat stroke.',
      };
    }
    if (city.riskLevel === 'danger') {
      return {
        verdict: 'NOT RECOMMENDED RIGHT NOW.',
        tone: 'text-orange-950',
        bg: 'bg-orange-100/70',
        border: 'border-orange-300',
        badgeBg: 'bg-orange-700 text-white',
        icon: <AlertTriangle className="w-8 h-8 text-orange-700 shrink-0" />,
        subtext: 'High thermal stress. Avoid direct sunlight and postpone strenuous outdoor work.',
      };
    }
    if (city.riskLevel === 'caution') {
      return {
        verdict: 'CAUTION. LIMIT MIDDAY SUN.',
        tone: 'text-amber-950',
        bg: 'bg-amber-100/70',
        border: 'border-amber-300',
        badgeBg: 'bg-amber-700 text-white',
        icon: <AlertTriangle className="w-8 h-8 text-amber-700 shrink-0" />,
        subtext: 'Moderate heat stress. Drink water frequently and seek shade if outdoors.',
      };
    }
    return {
      verdict: 'YES. SAFE TO BE OUTSIDE.',
      tone: 'text-emerald-950',
      bg: 'bg-emerald-100/70',
      border: 'border-emerald-300',
      badgeBg: 'bg-emerald-700 text-white',
      icon: <ShieldCheck className="w-8 h-8 text-emerald-700 shrink-0" />,
      subtext: 'Current temperatures are within safe physiological limits for normal activities.',
    };
  };

  const status = getVerdictAnswer();

  return (
    <section id="heat-hero-verdict" className="relative">
      {/* 5-Second Primary Verdict Container */}
      <div className={`rounded-2xl border ${status.border} ${status.bg} p-6 sm:p-8 transition-colors`}>
        {/* Top bar: Question + Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-medium tracking-wide uppercase text-stone-600">
              Immediate Safety Verdict • {city.name}, {city.state}
            </span>
            {onChangeLocationClick && (
              <button
                id="hero-change-location-btn"
                onClick={onChangeLocationClick}
                className="text-xs font-semibold text-stone-800 hover:text-stone-950 underline underline-offset-2 px-1.5 py-0.5 rounded-md hover:bg-stone-200/50 transition-colors cursor-pointer"
                title="Search any district or state across India"
              >
                Change location
              </button>
            )}
          </div>

          <span
            id="hero-risk-badge"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase ${status.badgeBg}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {meta.badgeText}
          </span>
        </div>

        {/* The Core Question & Direct Answer */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-stone-600 mb-1">
            "Is it safe for me to be outside?"
          </h2>
          <div className="flex items-start gap-4 mt-2">
            {status.icon}
            <div>
              <h1
                id="hero-primary-verdict"
                className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight ${status.tone} leading-tight`}
              >
                {status.verdict}
              </h1>
              <p className="text-base sm:text-lg text-stone-700 mt-2 font-normal max-w-2xl leading-relaxed">
                {status.subtext}
              </p>
            </div>
          </div>
        </div>

        {/* Minimal Metrics Row (Spacious, 3 essential numbers only) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-stone-300/60 mt-6">
          <div>
            <div className="text-xs uppercase tracking-wider text-stone-500 font-medium">
              Feels Like
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-stone-900 mt-0.5">
              {city.feelsLikeTemp}°C
            </div>
            <div className="text-xs text-stone-500">Air Temp: {city.currentTemp}°C</div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-stone-500 font-medium">
              Peak Danger Window
            </div>
            <div className="flex items-center gap-1 text-base sm:text-lg font-bold text-stone-900 mt-1">
              <Clock className="w-4 h-4 text-stone-500 shrink-0" />
              <span>{city.peakDangerWindow}</span>
            </div>
            <div className="text-xs text-stone-500">Peak solar intensity</div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-stone-500 font-medium">
              Humidity Level
            </div>
            <div className="flex items-center gap-1 text-base sm:text-lg font-bold text-stone-900 mt-1">
              <Droplets className="w-4 h-4 text-stone-500 shrink-0" />
              <span>{city.humidity}%</span>
            </div>
            <div className="text-xs text-stone-500">Affects sweat cooling</div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-stone-500 font-medium">
              Wind & Air Flow
            </div>
            <div className="flex items-center gap-1 text-base sm:text-lg font-bold text-stone-900 mt-1">
              <Wind className="w-4 h-4 text-stone-500 shrink-0" />
              <span>{city.windSpeedKmH} km/h</span>
            </div>
            <div className="text-xs text-stone-500">Dry surface breeze</div>
          </div>
        </div>
      </div>
    </section>
  );
};
