import { lazy, Suspense, useState } from 'react';
import type { City } from '../types/city';
import { temperatureColor } from '../lib/temperature';
import { useForecast } from '../hooks/useForecast';

// recharts is heavy and only needed once a card is expanded — keep it out of the
// initial bundle.
const ForecastChart = lazy(() =>
  import('./ForecastChart').then((module) => ({ default: module.ForecastChart })),
);

interface CityCardProps {
  city: City;
}

export function CityCard({ city }: CityCardProps) {
  const { cityCode, cityName, description, temperature, comfortScore, rank } = city;
  const isTopRank = rank === 1;
  const swatch = temperatureColor(temperature);

  const [expanded, setExpanded] = useState(false);
  const [everExpanded, setEverExpanded] = useState(false);
  const forecast = useForecast(everExpanded && cityCode ? cityCode : null);

  const toggleForecast = () => {
    setEverExpanded(true);
    setExpanded((open) => !open);
  };

  return (
    <article
      className={[
        'relative flex h-full flex-col gap-3 overflow-hidden rounded-lg bg-surface p-5 transition-colors duration-150',
        'border',
        isTopRank ? 'border-ink' : 'border-hairline hover:border-slate',
      ].join(' ')}
    >
      <span
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundColor: swatch }}
        aria-hidden="true"
      />

      <div className="flex items-center justify-between gap-3">
        <span
          aria-label={`Rank ${rank}`}
          className={[
            'inline-flex items-center rounded px-1.5 py-0.5 font-mono text-xs font-semibold tabular-nums',
            isTopRank ? 'bg-ink text-surface' : 'bg-panel text-slate',
          ].join(' ')}
        >
          {`#${rank}`}
        </span>
        <span className="inline-flex items-center gap-2 font-mono text-sm tabular-nums text-ink">
          <span
            className="h-3.5 w-[3px] rounded-full"
            style={{ backgroundColor: swatch }}
            aria-hidden="true"
          />
          {temperature.toFixed(1)}°C
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-medium leading-tight text-ink">
          {cityName}
        </h2>
        <p className="truncate text-[13px] capitalize text-slate">
          {description}
        </p>
      </div>

      <div className="mt-auto flex items-baseline justify-between border-t border-hairline pt-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate">
          Comfort index
        </span>
        <span className="font-mono text-xl font-medium tabular-nums text-ink">
          {comfortScore.toFixed(1)}
        </span>
      </div>

      {cityCode && (
        <div className="-mx-5 -mb-5 mt-1 border-t border-hairline">
          <button
            type="button"
            onClick={toggleForecast}
            aria-expanded={expanded}
            className="flex w-full items-center justify-between px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-wider text-slate transition-colors hover:text-ink"
          >
            <span>{expanded ? 'Hide forecast' : '5-Day forecast'}</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 12 12"
              className={`h-2.5 w-2.5 transition-transform duration-150 ${
                expanded ? 'rotate-180' : ''
              }`}
            >
              <path
                d="M2 4.5 6 8.5l4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {expanded && (
            <div className="border-t border-hairline">
              <Suspense
                fallback={
                  <p className="px-4 py-4 font-mono text-sm text-slate">
                    Reading forecast…
                  </p>
                }
              >
                <ForecastChart
                  cityName={cityName}
                  currentTemperature={temperature}
                  data={forecast.data}
                  loading={forecast.loading}
                  error={forecast.error}
                />
              </Suspense>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
