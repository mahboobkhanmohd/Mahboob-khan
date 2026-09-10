/**
 * HeatSafe Early-Warning System: Heatwave Detection Engine
 * Analyzes forecast temperature and apparent temperature to detect unusually high heat events.
 */

import { formatHour12 } from './outdoorAdvisory';

export type HeatwaveSeverity = 'MODERATE' | 'SEVERE' | 'EXTREME';

export interface HeatwaveDetectionResult {
  isHeatwave: boolean;
  severity: HeatwaveSeverity | null;
  headline: string;
  startTime: string | null;
  endTime: string | null;
  peakStartTime: string | null;
  peakEndTime: string | null;
  peakWindow: string | null;
  peakTemperature: number;
  peakApparentTemperature: number;
  duration: number; // in hours
  explanation: string;
  actionAdvice: string;
}

export interface HeatwaveDetectionInputs {
  hourlyTemperature?: number[];
  hourlyApparentTemperature?: number[];
  fallbackTemp: number;
  fallbackFeelsLike: number;
}

/**
 * Detects whether today's forecast constitutes an unusually high heat event (heatwave / heat warning).
 */
export function detectHeatwave(inputs: HeatwaveDetectionInputs): HeatwaveDetectionResult {
  const { hourlyTemperature, hourlyApparentTemperature, fallbackTemp, fallbackFeelsLike } = inputs;

  // Build full 24-hour array of temperature and apparent temperature
  const hourlyData: { hour: number; temp: number; apparent: number }[] = [];

  for (let h = 0; h < 24; h++) {
    let temp: number;
    let apparent: number;

    if (hourlyTemperature && hourlyTemperature[h] !== undefined) {
      temp = Math.round(hourlyTemperature[h]);
      apparent = Math.round(hourlyApparentTemperature?.[h] ?? temp);
    } else {
      const factor = Math.sin(((h - 6) / 12) * Math.PI);
      const delta = factor > 0 ? factor * 5 : factor * 2;
      temp = Math.round(fallbackTemp - 2 + delta);
      apparent = Math.round(temp + (fallbackFeelsLike - fallbackTemp));
    }

    hourlyData.push({ hour: h, temp, apparent });
  }

  // Identify daytime hours (6 AM to 8 PM) exceeding heat warning thresholds:
  // Heat criteria: actual temp >= 37°C OR apparent temp ("feels like") >= 40°C
  const daytimeHours = hourlyData.filter((d) => d.hour >= 6 && d.hour <= 20);
  const maxDayTemp = Math.max(...daytimeHours.map((d) => d.temp), fallbackTemp);
  const maxDayApparent = Math.max(...daytimeHours.map((d) => d.apparent), fallbackFeelsLike);

  const hotHours = daytimeHours.filter((d) => d.temp >= 37 || d.apparent >= 40);

  // If no sustained heat or peak is below threshold, conditions are normal
  const isSustainedHeat = hotHours.length >= 2;
  const isExtremeSpike = maxDayTemp >= 39 || maxDayApparent >= 42;

  const isHeatwave = isSustainedHeat || isExtremeSpike;

  if (!isHeatwave) {
    return {
      isHeatwave: false,
      severity: null,
      headline: 'CONDITIONS NORMAL',
      startTime: null,
      endTime: null,
      peakStartTime: null,
      peakEndTime: null,
      peakWindow: null,
      peakTemperature: maxDayTemp,
      peakApparentTemperature: maxDayApparent,
      duration: 0,
      explanation: 'Conditions are within normal seasonal range.',
      actionAdvice: 'No special heat precautions required.',
    };
  }

  // Determine start, end, and duration of the elevated heat window
  const activeHours = hotHours.length > 0 ? hotHours : daytimeHours.filter((d) => d.temp >= maxDayTemp - 2);
  const startH = activeHours[0].hour;
  const endH = activeHours[activeHours.length - 1].hour;
  const duration = Math.max(1, endH - startH + 1);

  const startTime = formatHour12(startH);
  const endTime = formatHour12(endH);

  // Determine Peak Period: find the hottest consecutive 2-3 hours
  let peakHour = activeHours[0].hour;
  let highestScore = -Infinity;

  activeHours.forEach((item) => {
    // Composite heat index proxy: actual temp + feels like
    const score = item.temp * 0.5 + item.apparent * 0.5;
    if (score > highestScore) {
      highestScore = score;
      peakHour = item.hour;
    }
  });

  // Define peak window around the peak hour (e.g. 2 PM – 4 PM)
  activeHours.forEach((item) => {
    const score = item.temp * 0.5 + item.apparent * 0.5;
    // Prefer hours closer to 14:00 (2 PM) diurnal lag peak on tie
    if (score > highestScore || (score === highestScore && Math.abs(item.hour - 14) <= Math.abs(peakHour - 14))) {
      highestScore = score;
      peakHour = item.hour;
    }
  });

  const peakStartH = peakHour;
  const peakEndH = Math.min(endH, peakStartH + 2);

  const peakStartTime = formatHour12(peakStartH);
  const peakEndTime = formatHour12(peakEndH);
  const peakWindow = `${peakStartTime} – ${peakEndTime}`;

  // Determine Severity
  let severity: HeatwaveSeverity = 'MODERATE';
  if (maxDayTemp >= 43 || maxDayApparent >= 47) {
    severity = 'EXTREME';
  } else if (maxDayTemp >= 40 || maxDayApparent >= 43) {
    severity = 'SEVERE';
  }

  const headline = severity === 'EXTREME' ? 'EXTREME HEAT WARNING' : 'HEAT WARNING';

  // Determine calm, clear, plain-language explanation
  let explanation: string;
  if (startH >= 11 && endH <= 17) {
    explanation = 'Very high heat is expected this afternoon.';
  } else if (startH < 11) {
    explanation = 'Elevated heat will build early and persist through the afternoon.';
  } else {
    explanation = 'Unusually high temperatures are forecasted today.';
  }

  // Calm, actionable advice
  const actionAdvice =
    severity === 'EXTREME'
      ? 'Stay indoors in air-conditioned spaces and avoid physical exertion outdoors.'
      : 'Avoid unnecessary outdoor activity during this time.';

  return {
    isHeatwave: true,
    severity,
    headline,
    startTime,
    endTime,
    peakStartTime,
    peakEndTime,
    peakWindow,
    peakTemperature: maxDayTemp,
    peakApparentTemperature: maxDayApparent,
    duration,
    explanation,
    actionAdvice,
  };
}
