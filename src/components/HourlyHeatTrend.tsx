import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { HourlyForecastItem } from '../types/heat';
import { formatTemp } from '../utils/heatIndex';

interface HourlyHeatTrendProps {
  data: HourlyForecastItem[];
  cityName: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: HourlyForecastItem;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    const isDangerous = item.feelsLike >= 40;
    const isCaution = item.feelsLike >= 33 && item.feelsLike < 40;

    return (
      <div className="bg-stone-900 text-stone-50 px-3 py-2 rounded-lg shadow-lg text-xs">
        <div className="font-semibold text-stone-200">{label}</div>
        <div className="text-sm font-bold text-amber-400 mt-0.5">
          Feels like {item.feelsLike}°C
        </div>
        <div className="text-[11px] text-stone-400">Actual air temp: {item.temp}°C</div>
        <div
          className={`mt-1 font-medium ${
            isDangerous
              ? 'text-rose-400'
              : isCaution
              ? 'text-amber-400'
              : 'text-emerald-400'
          }`}
        >
          {isDangerous
            ? 'Severe heat stress'
            : isCaution
            ? 'Moderate risk'
            : 'Safe conditions'}
        </div>
      </div>
    );
  }
  return null;
};

export const HourlyHeatTrend: React.FC<HourlyHeatTrendProps> = ({ data, cityName }) => {
  if (!data || data.length === 0) return null;

  return (
    <section id="hourly-heat-trend-section" className="mt-8">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">
            Daytime Heat Timeline
          </h2>
          <p className="text-sm text-stone-600">
            When is it safest to go outdoors today in {cityName}?
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-stone-500 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>Feels-Like Heat Index</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t border-dashed border-rose-500" />
            <span>38°C Danger Line</span>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-stone-200 bg-white shadow-2xs">
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="heatGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                stroke="#78716c"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e7e5e4' }}
              />
              <YAxis
                domain={['dataMin - 3', 'dataMax + 3']}
                stroke="#78716c"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e7e5e4' }}
                tickFormatter={(val) => `${val}°`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={38}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: 'Danger Threshold (38°C)',
                  position: 'top',
                  fill: '#b91c1c',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
              <Area
                type="monotone"
                dataKey="feelsLike"
                stroke="#ea580c"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#heatGradient)"
                name="Feels Like"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
          <span>Morning (before 10 AM) and evening (after 5 PM) are noticeably cooler and safer.</span>
          <span className="font-semibold text-stone-700">Peak heat risk occurs between 12 PM – 4 PM</span>
        </div>
      </div>
    </section>
  );
};
