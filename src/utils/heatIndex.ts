import { HeatRiskLevel } from '../types/heat';

export interface RiskMeta {
  level: HeatRiskLevel;
  label: string;
  badgeText: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  accentBg: string;
  dotColor: string;
  summary: string;
}

export function getRiskMeta(level: HeatRiskLevel): RiskMeta {
  switch (level) {
    case 'safe':
      return {
        level: 'safe',
        label: 'Safe Conditions',
        badgeText: 'Safe Outdoors',
        bgLight: 'bg-emerald-50/80',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-800',
        accentBg: 'bg-emerald-600',
        dotColor: 'bg-emerald-500',
        summary: 'Safe for normal outdoor activities. Regular hydration is always good practice.',
      };
    case 'caution':
      return {
        level: 'caution',
        label: 'Caution Advised',
        badgeText: 'Moderate Heat',
        bgLight: 'bg-amber-50/80',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-800',
        accentBg: 'bg-amber-600',
        dotColor: 'bg-amber-500',
        summary: 'Prolonged outdoor exertion may cause fatigue. Drink water regularly and seek shade.',
      };
    case 'danger':
      return {
        level: 'danger',
        label: 'High Heat Danger',
        badgeText: 'Danger Outdoors',
        bgLight: 'bg-orange-50/90',
        borderColor: 'border-orange-300',
        textColor: 'text-orange-950',
        accentBg: 'bg-orange-600',
        dotColor: 'bg-orange-500',
        summary: 'Dangerous heat stress likely. Avoid direct sun and postpone heavy outdoor exertion.',
      };
    case 'extreme':
      return {
        level: 'extreme',
        label: 'Extreme Heat Warning',
        badgeText: 'Severe Risk',
        bgLight: 'bg-rose-50/90',
        borderColor: 'border-rose-300',
        textColor: 'text-rose-950',
        accentBg: 'bg-rose-600',
        dotColor: 'bg-rose-500',
        summary: 'Heat stroke and acute thermal stress imminent with physical activity. Stay indoors.',
      };
  }
}

/**
 * Calculates risk level based on "Feels Like" (apparent) temperature
 */
export function calculateHeatRisk(feelsLikeCelsius: number): HeatRiskLevel {
  if (feelsLikeCelsius >= 43) return 'extreme';
  if (feelsLikeCelsius >= 38) return 'danger';
  if (feelsLikeCelsius >= 32) return 'caution';
  return 'safe';
}

export function formatTemp(celsius: number): string {
  return `${Math.round(celsius)}°C`;
}
