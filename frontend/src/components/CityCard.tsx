import type { City } from '../types/city';
import { temperatureColor } from '../lib/temperature';

interface CityCardProps {
  city: City;
}

export function CityCard({ city }: CityCardProps) {
  const { cityName, description, temperature, comfortScore, rank } = city;
  const isTopRank = rank === 1;
  const swatch = temperatureColor(temperature);

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
    </article>
  );
}
