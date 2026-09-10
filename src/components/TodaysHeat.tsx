import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { calculateThermalStress } from '../utils/thermalStress';

export interface HourlyHeatPoint {
  hour: number;
  time: string;
  temp: number;
  feelsLike: number;
  heatStress: number;
  riskLevel: string;
  isHighestRisk: boolean;
}

interface TodaysHeatProps {
  hourlyTemperature?: number[];
  hourlyApparentTemperature?: number[];
  hourlyHumidity?: number[];
  hourlyUvIndex?: number[];
  fallbackTemp: number;
  fallbackFeelsLike: number;
  fallbackHumidity: number;
  fallbackUvIndex: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: HourlyHeatPoint;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-stone-900 text-stone-100 px-3.5 py-2.5 rounded-xl shadow-xl border border-stone-800 text-xs select-none">
        <div className="font-bold text-stone-200 mb-1.5 flex items-center justify-between gap-2">
          <span>{item.time}</span>
          {item.isHighestRisk && (
            <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800/80">
              Peak Risk
            </span>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-5 text-stone-300">
            <span>Temperature</span>
            <span className="font-semibold text-white tabular-nums">{item.temp}°C</span>
          </div>
          <div className="flex items-center justify-between gap-5 text-stone-300">
            <span>Feels like</span>
            <span className="font-semibold text-amber-300 tabular-nums">{item.feelsLike}°C</span>
          </div>
          <div className="flex items-center justify-between gap-5 text-stone-300">
            <span>Heat stress</span>
            <span className="font-semibold text-stone-100 tabular-nums">
              {item.heatStress} • {item.riskLevel}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const TodaysHeat: React.FC<TodaysHeatProps> = ({
  hourlyTemperature,
  hourlyApparentTemperature,
  hourlyHumidity,
  hourlyUvIndex,
  fallbackTemp,
  fallbackFeelsLike,
  fallbackHumidity,
  fallbackUvIndex,
}) => {
  const [activeHour, setActiveHour] = useState<number | null>(null);

  // Focus on key daytime intervals matching the specification:
  // 8 AM, 10 AM, 12 PM, 2 PM, 4 PM, 6 PM
  const targetHours = [8, 10, 12, 14, 16, 18];

  const points: HourlyHeatPoint[] = targetHours.map((hour) => {
    let temp: number;
    let feelsLike: number;
    let humidity: number;
    let uv: number;

    if (hourlyTemperature && hourlyTemperature[hour] !== undefined) {
      temp = Math.round(hourlyTemperature[hour]);
      feelsLike = Math.round(hourlyApparentTemperature?.[hour] ?? temp);
      humidity = Math.round(hourlyHumidity?.[hour] ?? 50);
      uv = Math.round(hourlyUvIndex?.[hour] ?? (hour >= 10 && hour <= 15 ? 7 : 2));
    } else {
      // Deterministic daytime diurnal curve based on current temp
      const factor = Math.sin(((hour - 6) / 12) * Math.PI);
      const delta = factor > 0 ? factor * 5 : factor * 2;
      temp = Math.round(fallbackTemp - 2 + delta);
      feelsLike = Math.round(temp + (fallbackFeelsLike - fallbackTemp));
      humidity = Math.round(Math.max(25, fallbackHumidity - factor * 10));
      uv = Math.round(Math.max(0, fallbackUvIndex * factor));
    }

    const stressResult = calculateThermalStress({
      temperature: temp,
      relativeHumidity: humidity,
      apparentTemperature: feelsLike,
      windSpeed: 12,
      uvIndex: uv,
    });

    const timeLabel =
      hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;

    const riskLevelLabel =
      stressResult.level === 'EXTREME'
        ? 'Extreme'
        : stressResult.level === 'HIGH'
        ? 'High'
        : stressResult.level === 'MODERATE'
        ? 'Moderate'
        : stressResult.level === 'CAUTION'
        ? 'Caution'
        : 'Safe';

    return {
      hour,
      time: timeLabel,
      temp,
      feelsLike,
      heatStress: stressResult.score,
      riskLevel: riskLevelLabel,
      isHighestRisk: false,
    };
  });

  // Highlight highest-risk period
  let maxScore = -1;
  let maxIndex = 3; // default to 2 PM (index 3) if tie
  points.forEach((p, idx) => {
    if (p.heatStress > maxScore) {
      maxScore = p.heatStress;
      maxIndex = idx;
    } else if (p.heatStress === maxScore && (p.hour === 14 || p.hour === 12)) {
      maxIndex = idx;
    }
  });

  if (points[maxIndex]) {
    points[maxIndex].isHighestRisk = true;
  }

  // Min and max temps for chart domain
  const temps = points.map((p) => p.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);

  return (
    <section id="todays-heat-section" className="w-full mt-10 sm:mt-12 text-left">
      <div className="flex items-baseline justify-between mb-3 px-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
          Today's Heat
        </h2>
        {points[maxIndex] && (
          <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
            <span>Highest risk around</span>
            <strong className="text-stone-800 font-semibold">{points[maxIndex].time}</strong>
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-2xs">
        {/* ONE clean minimal Recharts chart */}
        <div className="h-44 sm:h-48 w-full -ml-2 sm:ml-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={points}
              margin={{ top: 12, right: 14, left: 14, bottom: 4 }}
              onMouseMove={(e: any) => {
                if (e?.activePayload?.[0]?.payload?.hour !== undefined) {
                  setActiveHour(e.activePayload[0].payload.hour);
                }
              }}
              onMouseLeave={() => setActiveHour(null)}
            >
              <defs>
                <linearGradient id="todayHeatGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="90%" stopColor="#f59e0b" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#78716c', fontSize: 12, fontWeight: 500 }}
                dy={6}
              />
              <YAxis domain={[minTemp - 2, maxTemp + 2]} hide={true} />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: '#d6d3d1', strokeWidth: 1, strokeDasharray: '3 3' }}
              />

              <Area
                type="monotone"
                dataKey="temp"
                stroke="#d97706"
                strokeWidth={2.5}
                fill="url(#todayHeatGradient)"
                activeDot={{
                  r: 6,
                  fill: '#b45309',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  const isHighest = payload.isHighestRisk;
                  const isHovered = activeHour === payload.hour;

                  return (
                    <g key={`dot-${payload.hour}`}>
                      {isHighest && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={10}
                          fill="#ef4444"
                          fillOpacity={0.15}
                        />
                      )}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHighest ? 5 : isHovered ? 5 : 3.5}
                        fill={isHighest ? '#ef4444' : '#d97706'}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    </g>
                  );
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Clean, Scannable Timeline Row: Time, Temperature, Risk Level */}
        <div className="mt-5 pt-4 border-t border-stone-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {points.map((p) => {
              const isSelected = activeHour === p.hour;
              return (
                <div
                  key={p.hour}
                  onMouseEnter={() => setActiveHour(p.hour)}
                  onMouseLeave={() => setActiveHour(null)}
                  className={`p-2.5 rounded-xl border transition-all text-center select-none ${
                    p.isHighestRisk
                      ? 'bg-rose-50/50 border-rose-200/90 shadow-2xs'
                      : isSelected
                      ? 'bg-stone-100/90 border-stone-300'
                      : 'bg-stone-50/60 border-stone-200/60 hover:border-stone-300'
                  }`}
                >
                  <div className="text-xs font-semibold text-stone-600">{p.time}</div>
                  <div className="text-lg font-bold text-stone-900 tabular-nums my-0.5">
                    {p.temp}°
                  </div>
                  <div className="text-xs font-medium flex items-center justify-center gap-1">
                    <span
                      className={
                        p.isHighestRisk
                          ? 'text-rose-700 font-semibold'
                          : p.riskLevel === 'High'
                          ? 'text-amber-800'
                          : p.riskLevel === 'Moderate'
                          ? 'text-stone-700'
                          : 'text-stone-500'
                      }
                    >
                      {p.riskLevel}
                    </span>
                    {p.isHighestRisk && <span className="text-xs leading-none">🔴</span>}
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
