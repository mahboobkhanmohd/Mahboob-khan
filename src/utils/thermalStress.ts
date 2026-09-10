/**
 * Experimental Thermal Stress Calculation Engine
 *
 * IMPORTANT:
 * - This is an experimental educational indicator.
 * - Do NOT call it an official government index.
 * - Do NOT use an AI model to calculate the score.
 * - The score is 100% deterministic and transparently weighted.
 */

export type HeatStressLevel = 'SAFE' | 'CAUTION' | 'MODERATE' | 'HIGH' | 'EXTREME';

export interface ThermalStressInputs {
  /** Ambient air temperature in °C */
  temperature: number;
  /** Relative humidity in % (0 - 100) */
  relativeHumidity: number;
  /** Apparent ("feels like") temperature in °C */
  apparentTemperature: number;
  /** Wind speed in km/h */
  windSpeed: number;
  /** Solar UV index (0 - 14+) */
  uvIndex: number;
}

export interface ThermalScoreBreakdown {
  temperatureScore: number;
  humidityScore: number;
  apparentTempScore: number;
  uvScore: number;
  windCoolingScore: number;
}

export interface ThermalStressResult {
  /** Calculated score clamped between 0 and 100 */
  score: number;
  /** Risk classification level */
  level: HeatStressLevel;
  /** Short verdict statement */
  verdict: string;
  /** Plain-language human explanation */
  explanation: string;
  /** Short, simple reasons answering 'Why?' */
  whyReasons: string[];
  /** Actionable protective recommendations */
  recommendations: Array<{ emoji: string; text: string }>;
  /** Transparent weighted component scores */
  breakdown: ThermalScoreBreakdown;
  /** Informational educational notice */
  disclaimer: string;
}

/**
 * Clamps a number between a minimum and maximum value.
 */
function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

/**
 * Normalizes ambient temperature (°C) onto a 0–100 scale.
 * 18°C represents baseline thermal comfort (0).
 * 46°C or above represents severe heat stress (100).
 */
export function normalizeTemperature(temp: number): number {
  return clamp(((temp - 18) / (46 - 18)) * 100, 0, 100);
}

/**
 * Normalizes relative humidity (%) onto a 0–100 scale.
 */
export function normalizeHumidity(rh: number): number {
  return clamp(rh, 0, 100);
}

/**
 * Normalizes apparent temperature (°C) onto a 0–100 scale.
 * 20°C represents mild comfort (0).
 * 50°C or above represents extreme thermal loading (100).
 */
export function normalizeApparentTemp(appTemp: number): number {
  return clamp(((appTemp - 20) / (50 - 20)) * 100, 0, 100);
}

/**
 * Normalizes UV Index onto a 0–100 scale.
 * Standard WHO UV scale: 0 to 12+.
 */
export function normalizeUV(uv: number): number {
  return clamp((uv / 12) * 100, 0, 100);
}

/**
 * Normalizes wind speed (km/h) into an evaporative cooling factor (0–100 scale).
 * 0 km/h indicates stagnant air (0 cooling relief).
 * 30 km/h indicates effective convective and sweat-evaporative cooling (100).
 */
export function normalizeWindCooling(windKmH: number): number {
  return clamp((windKmH / 30) * 100, 0, 100);
}

/**
 * Determines the risk level from the score (0–100).
 * 0–20   = SAFE
 * 21–40  = CAUTION
 * 41–60  = MODERATE
 * 61–80  = HIGH
 * 81–100 = EXTREME
 */
export function getHeatStressLevel(score: number): HeatStressLevel {
  if (score <= 20) return 'SAFE';
  if (score <= 40) return 'CAUTION';
  if (score <= 60) return 'MODERATE';
  if (score <= 80) return 'HIGH';
  return 'EXTREME';
}

/**
 * Generates short, human-friendly reasons answering "Why?" without technical jargon.
 */
export function getWhyReasons(inputs: ThermalStressInputs, level: HeatStressLevel): string[] {
  const reasons: string[] = [];

  // 1. Temperature factor
  if (inputs.temperature >= 40) {
    reasons.push('Temperature is very high.');
  } else if (inputs.temperature >= 32) {
    reasons.push('Temperature is high.');
  } else if (inputs.temperature >= 26) {
    reasons.push('Temperature is warm.');
  } else {
    reasons.push('Temperature is comfortable.');
  }

  // 2. Humidity factor
  if (inputs.relativeHumidity >= 50 || inputs.apparentTemperature > inputs.temperature + 1) {
    reasons.push('Humidity is making cooling harder.');
  } else if (inputs.relativeHumidity <= 25 && inputs.temperature >= 33) {
    reasons.push('Dry air accelerates fluid loss.');
  } else {
    reasons.push('Humidity is at a comfortable level.');
  }

  // 3. Solar / UV factor
  if (inputs.uvIndex >= 7) {
    reasons.push('Strong sunlight is increasing heat exposure.');
  } else if (inputs.uvIndex >= 4) {
    reasons.push('Moderate sunlight exposure.');
  } else {
    reasons.push('Sunlight intensity is low.');
  }

  return reasons;
}

/**
 * Generates human explanation and recommendations based on inputs and level.
 */
function getVerdictDetails(
  level: HeatStressLevel,
  inputs: ThermalStressInputs
): {
  verdict: string;
  explanation: string;
  whyReasons: string[];
  recommendations: Array<{ emoji: string; text: string }>;
} {
  const isHighHumidity = inputs.relativeHumidity >= 60;
  const isHighUV = inputs.uvIndex >= 8;
  const whyReasons = getWhyReasons(inputs, level);

  switch (level) {
    case 'EXTREME':
      return {
        verdict: 'Dangerous heat levels. Stay indoors and avoid physical exertion.',
        explanation:
          inputs.apparentTemperature > inputs.temperature + 2
            ? 'Severe temperature and high humidity combine to create dangerous heat stress.'
            : 'Extreme ambient heat places severe strain on the body to regulate temperature.',
        whyReasons,
        recommendations: [
          { emoji: '🏠', text: 'Stay inside cooled or shaded spaces' },
          { emoji: '💧', text: 'Drink water regularly and continuously' },
          { emoji: '🛑', text: 'Avoid outdoor exercise and manual labor' },
          { emoji: '👴', text: 'Check on elderly family members' },
        ],
      };

    case 'HIGH':
      return {
        verdict: 'Very hot conditions. Take care if you go outside.',
        explanation:
          inputs.apparentTemperature > inputs.temperature + 1
            ? 'Heat and humidity are making it feel much hotter.'
            : isHighUV
            ? 'Intense solar radiation and high heat accelerate dehydration and fatigue.'
            : 'High thermal conditions require care during any outdoor activity.',
        whyReasons,
        recommendations: [
          { emoji: '💧', text: 'Drink water regularly' },
          { emoji: '☀️', text: 'Avoid strong afternoon heat' },
          { emoji: '🏠', text: 'Stay somewhere cool' },
          { emoji: '👴', text: 'Check on elderly family members' },
        ],
      };

    case 'MODERATE':
      return {
        verdict: 'Warm and uncomfortable. Drink fluids regularly when outside.',
        explanation: isHighHumidity
          ? 'Warmth and moisture in the air make physical exertion uncomfortable.'
          : 'Warm daytime conditions increase fluid loss. Stay hydrated.',
        whyReasons,
        recommendations: [
          { emoji: '💧', text: 'Drink water regularly before feeling thirsty' },
          { emoji: '☀️', text: 'Seek shade during peak midday hours' },
          { emoji: '🧢', text: 'Wear a hat or head covering outside' },
          { emoji: '🏠', text: 'Rest in well-ventilated or cool areas' },
        ],
      };

    case 'CAUTION':
      return {
        verdict: 'Mild heat discomfort. Take breaks if out in the sun.',
        explanation:
          'Mild heat discomfort. Prolonged direct sun exposure may cause fatigue.',
        whyReasons,
        recommendations: [
          { emoji: '💧', text: 'Drink water regularly' },
          { emoji: '🧢', text: 'Wear lightweight, breathable clothing' },
          { emoji: '🚶', text: 'Take periodic rests if walking in direct sun' },
          { emoji: '🏠', text: 'Keep indoor spaces well ventilated' },
        ],
      };

    case 'SAFE':
    default:
      return {
        verdict: 'Mild conditions outside. Comfortable for normal outdoor activities.',
        explanation:
          'Thermal conditions are comfortable and safe for normal outdoor activities.',
        whyReasons,
        recommendations: [
          { emoji: '💧', text: 'Stay regularly hydrated' },
          { emoji: '☀️', text: 'Enjoy outdoor activities comfortably' },
          { emoji: '🧴', text: 'Wear sunscreen if outdoors for extended periods' },
          { emoji: '🏃', text: 'Outdoor sports and walking are safe' },
        ],
      };
  }
}

/**
 * Calculates the deterministic experimental Heat Stress score and advisory.
 *
 * Transparent formula:
 * - Temperature: 40%
 * - Humidity: 25%
 * - Apparent temperature: 20%
 * - UV: 10%
 * - Wind cooling: 5% relief (higher wind reduces stress; calm air provides 0 relief)
 *
 * Result is strictly clamped between 0 and 100.
 */
export function calculateThermalStress(inputs: ThermalStressInputs): ThermalStressResult {
  // If ambient and feels-like temperatures are cold (<= 15°C), heat stress is naturally 0
  if (inputs.temperature <= 15 && inputs.apparentTemperature <= 15) {
    return {
      score: 0,
      level: 'SAFE',
      verdict: 'Cold or cool conditions. No heat stress present.',
      explanation: 'Thermal conditions are cool or cold. No heat stress present.',
      whyReasons: [
        'Temperature is cool.',
        'No heat stress is present.',
        'Sunlight intensity is low.',
      ],
      recommendations: [
        { emoji: '💧', text: 'Stay regularly hydrated' },
        { emoji: '☀️', text: 'Comfortable for outdoor activities' },
        { emoji: '🧥', text: 'Dress warmly for cooler conditions' },
      ],
      breakdown: {
        temperatureScore: 0,
        humidityScore: 0,
        apparentTempScore: 0,
        uvScore: 0,
        windCoolingScore: 0,
      },
      disclaimer:
        'Experimental educational indicator based on transparent weighted thermal variables. Not an official government index.',
    };
  }

  const normTemp = normalizeTemperature(inputs.temperature);
  const normHumidity = normalizeHumidity(inputs.relativeHumidity);
  const normApparent = normalizeApparentTemp(inputs.apparentTemperature);
  const normUV = normalizeUV(inputs.uvIndex);
  const normWind = normalizeWindCooling(inputs.windSpeed);

  // Component weights
  const temperatureScore = normTemp * 0.40;
  const humidityScore = normHumidity * 0.25;
  const apparentTempScore = normApparent * 0.20;
  const uvScore = normUV * 0.10;

  // Stagnant air (0 km/h) provides 0 cooling relief (adds 5% stagnation stress).
  // Strong breeze (30 km/h) provides full 5% cooling mitigation.
  const windCoolingScore = (100 - normWind) * 0.05;

  const rawScore =
    temperatureScore +
    humidityScore +
    apparentTempScore +
    uvScore +
    windCoolingScore;

  const score = clamp(Math.round(rawScore), 0, 100);
  const level = getHeatStressLevel(score);
  const { verdict, explanation, whyReasons, recommendations } = getVerdictDetails(level, inputs);

  return {
    score,
    level,
    verdict,
    explanation,
    whyReasons,
    recommendations,
    breakdown: {
      temperatureScore: Number(temperatureScore.toFixed(2)),
      humidityScore: Number(humidityScore.toFixed(2)),
      apparentTempScore: Number(apparentTempScore.toFixed(2)),
      uvScore: Number(uvScore.toFixed(2)),
      windCoolingScore: Number(windCoolingScore.toFixed(2)),
    },
    disclaimer:
      'Experimental educational indicator based on transparent weighted thermal variables. Not an official government index.',
  };
}
