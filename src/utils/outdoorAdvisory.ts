import { calculateThermalStress } from './thermalStress';

export interface DayPeriodAdvisory {
  name: 'Morning' | 'Afternoon' | 'Evening';
  timeRange: string;
  hours: number[];
  indicator: '🟢' | '🟡' | '🔴';
  statusLabel: string;
  avgTemp: number;
  maxScore: number;
  riskLevel: string;
}

export interface OutdoorAdvisory {
  recommendation: string;
  subText: string;
  periods: DayPeriodAdvisory[];
  isAllSafe: boolean;
  peakHourRange?: string;
}

export interface OutdoorAdvisoryInputs {
  hourlyTemperature?: number[];
  hourlyApparentTemperature?: number[];
  hourlyHumidity?: number[];
  hourlyUvIndex?: number[];
  fallbackTemp: number;
  fallbackFeelsLike: number;
  fallbackHumidity: number;
  fallbackUvIndex: number;
}

/**
 * Formats a 24-hour number into a human-readable 12-hour string (e.g. 12 -> "12 PM", 16 -> "4 PM").
 */
export function formatHour12(h: number): string {
  if (h === 0 || h === 24) return '12 AM';
  if (h === 12) return '12 PM';
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
}

/**
 * Computes simple, human-friendly outdoor advisory and timeline for Morning, Afternoon, and Evening.
 */
export function computeOutdoorAdvisory(inputs: OutdoorAdvisoryInputs): OutdoorAdvisory {
  const {
    hourlyTemperature,
    hourlyApparentTemperature,
    hourlyHumidity,
    hourlyUvIndex,
    fallbackTemp,
    fallbackFeelsLike,
    fallbackHumidity,
    fallbackUvIndex,
  } = inputs;

  // Calculate thermal stress for each hour 0-23
  const hourlyScores: { hour: number; temp: number; feelsLike: number; score: number }[] = [];

  for (let h = 0; h < 24; h++) {
    let temp: number;
    let feelsLike: number;
    let humidity: number;
    let uv: number;

    if (hourlyTemperature && hourlyTemperature[h] !== undefined) {
      temp = Math.round(hourlyTemperature[h]);
      feelsLike = Math.round(hourlyApparentTemperature?.[h] ?? temp);
      humidity = Math.round(hourlyHumidity?.[h] ?? 50);
      uv = Math.round(hourlyUvIndex?.[h] ?? (h >= 10 && h <= 15 ? 7 : 2));
    } else {
      // Deterministic diurnal variation based on current temperature
      const factor = Math.sin(((h - 6) / 12) * Math.PI);
      const delta = factor > 0 ? factor * 5 : factor * 2;
      temp = Math.round(fallbackTemp - 2 + delta);
      feelsLike = Math.round(temp + (fallbackFeelsLike - fallbackTemp));
      humidity = Math.round(Math.max(25, fallbackHumidity - factor * 10));
      uv = Math.round(Math.max(0, fallbackUvIndex * factor));
    }

    const stress = calculateThermalStress({
      temperature: temp,
      apparentTemperature: feelsLike,
      relativeHumidity: humidity,
      windSpeed: 12,
      uvIndex: uv,
    });

    hourlyScores.push({
      hour: h,
      temp,
      feelsLike,
      score: stress.score,
    });
  }

  // Periods configuration:
  // Morning: 7 AM – 11 AM (hours 7, 8, 9, 10, 11)
  // Afternoon: 12 PM – 4 PM (hours 12, 13, 14, 15, 16)
  // Evening: 5 PM – 8 PM (hours 17, 18, 19, 20)
  const periodDefs: Array<{
    name: 'Morning' | 'Afternoon' | 'Evening';
    timeRange: string;
    hours: number[];
  }> = [
    { name: 'Morning', timeRange: '7 AM – 11 AM', hours: [7, 8, 9, 10, 11] },
    { name: 'Afternoon', timeRange: '12 PM – 4 PM', hours: [12, 13, 14, 15, 16] },
    { name: 'Evening', timeRange: '5 PM – 8 PM', hours: [17, 18, 19, 20] },
  ];

  const periods: DayPeriodAdvisory[] = periodDefs.map((def) => {
    const periodHours = hourlyScores.filter((hs) => def.hours.includes(hs.hour));
    const maxScore = Math.max(...periodHours.map((hs) => hs.score), 0);
    const avgTemp = Math.round(
      periodHours.reduce((acc, curr) => acc + curr.temp, 0) / (periodHours.length || 1)
    );

    let indicator: '🟢' | '🟡' | '🔴';
    let statusLabel: string;
    let riskLevel: string;

    // High heat threshold: score >= 50 or temp >= 37
    if (maxScore >= 50 || avgTemp >= 37) {
      indicator = '🔴';
      statusLabel = 'Avoid peak heat';
      riskLevel = 'High Heat';
    } else {
      indicator = '🟢';
      statusLabel = def.name === 'Morning' ? 'Best time' : 'Good time';
      riskLevel = 'Comfortable';
    }

    return {
      name: def.name,
      timeRange: def.timeRange,
      hours: def.hours,
      indicator,
      statusLabel,
      avgTemp,
      maxScore,
      riskLevel,
    };
  });

  // Check if conditions are safe all day
  const maxDayScore = Math.max(...periods.map((p) => p.maxScore));
  const hasRed = periods.some((p) => p.indicator === '🔴');
  const isAllSafe = !hasRed && maxDayScore < 45;

  let recommendation: string;
  let subText: string;
  let peakHourRange: string | undefined;

  if (isAllSafe) {
    recommendation = 'Conditions are relatively comfortable today.';
    subText = 'You can safely enjoy outdoor activities throughout the day.';
  } else {
    // Find peak/hot window between 8 AM and 7 PM
    const hotHours = hourlyScores
      .filter((hs) => hs.hour >= 8 && hs.hour <= 19)
      .filter((hs) => hs.score >= 50 || hs.temp >= 36);

    let startH = 12;
    let endH = 16;

    if (hotHours.length > 0) {
      startH = hotHours[0].hour;
      endH = hotHours[hotHours.length - 1].hour;
    }

    // Format start and end hours
    const startStr = formatHour12(startH);
    const endStr = formatHour12(endH);

    if (startH === endH) {
      recommendation = `Try to avoid going outside around ${startStr}.`;
      peakHourRange = `Around ${startStr}`;
    } else {
      recommendation = `Try to avoid going outside between ${startStr} and ${endStr}.`;
      peakHourRange = `${startStr} – ${endStr}`;
    }

    // Helpful, non-technical context
    const morningPeriod = periods.find((p) => p.name === 'Morning');
    const eveningPeriod = periods.find((p) => p.name === 'Evening');

    if (morningPeriod?.indicator === '🟢' && eveningPeriod?.indicator === '🟢') {
      subText = 'Morning and evening are much cooler and safer for walks, exercise, or errands.';
    } else if (morningPeriod?.indicator === '🟢') {
      subText = 'Early morning is your best window for outdoor errands and exercise.';
    } else if (eveningPeriod?.indicator === '🟢') {
      subText = 'Wait until evening when conditions cool down before heading outside.';
    } else {
      subText = 'Heat remains intense for most of the day. Limit time outdoors and stay hydrated.';
    }
  }

  return {
    recommendation,
    subText,
    periods,
    isAllSafe,
    peakHourRange,
  };
}
