import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ForecastPoint } from '../hooks/useForecast';
import { temperatureColor } from '../lib/temperature';

/** "2026-08-30 15:00:00" -> "Sun 3PM" */
export function formatForecastLabel(dateTime: string): string {
  const parsed = new Date(dateTime.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return dateTime;
  const weekday = parsed.toLocaleDateString('en-US', { weekday: 'short' });
  let hours = parsed.getHours();
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${weekday} ${hours}${suffix}`;
}

interface ForecastDatum extends ForecastPoint {
  label: string;
}

interface ForecastChartProps {
  cityName: string;
  currentTemperature: number;
  data: ForecastPoint[];
  loading: boolean;
  error: string | null;
}

function ForecastTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: ForecastDatum }>;
}) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  return (
    <div className="rounded border border-hairline bg-surface px-2.5 py-1.5 font-mono text-xs shadow-sm">
      <p className="text-slate">{datum.label}</p>
      <p className="tabular-nums text-ink">{datum.temperature.toFixed(1)}°C</p>
    </div>
  );
}

export function ForecastChart({
  cityName,
  currentTemperature,
  data,
  loading,
  error,
}: ForecastChartProps) {
  const lineColor = temperatureColor(currentTemperature);
  const chartData = useMemo<ForecastDatum[]>(
    () =>
      data.map((point) => ({
        ...point,
        label: formatForecastLabel(point.dateTime),
      })),
    [data],
  );

  return (
    <section
      aria-label={`5-day forecast for ${cityName}`}
      className="flex flex-col gap-3 px-4 pb-4 pt-3"
    >
      <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-slate">
        5-Day Forecast
      </p>

      {loading && chartData.length === 0 && (
        <p className="font-mono text-sm text-slate">Reading forecast…</p>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-r border-l-2 border-temp-hot bg-surface p-3"
        >
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate">
            Couldn’t load forecast
          </p>
          <p className="mt-1 text-sm text-ink">{error}</p>
        </div>
      )}

      {!loading && !error && chartData.length === 0 && (
        <p className="font-mono text-sm text-slate">No forecast data available.</p>
      )}

      {!error && chartData.length > 0 && (
        <div className="forecast-chart h-40 w-full sm:h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 28, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="2 3" vertical={false} />
              <XAxis
                dataKey="label"
                interval="preserveStartEnd"
                minTickGap={44}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                padding={{ right: 4 }}
              />
              <YAxis
                width={40}
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                domain={['dataMin - 1', 'dataMax + 1']}
                tickFormatter={(value: number) => `${Math.round(value)}°`}
              />
              <Tooltip content={<ForecastTooltip />} />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke={lineColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
