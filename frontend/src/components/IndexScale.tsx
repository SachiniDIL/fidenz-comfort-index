import type { City } from '../types/city';
import { GRADIENT_CSS, temperatureColor } from '../lib/temperature';

const SCALE_MIN = 40;
const SCALE_MAX = 90;
const TICKS = [40, 50, 60, 70, 80, 90];

const position = (value: number) =>
  ((Math.min(SCALE_MAX, Math.max(SCALE_MIN, value)) - SCALE_MIN) /
    (SCALE_MAX - SCALE_MIN)) *
  100;

interface IndexScaleProps {
  cities: City[];
}

export function IndexScale({ cities }: IndexScaleProps) {
  if (cities.length === 0) return null;

  const scores = cities.map((c) => c.comfortScore);
  const low = Math.min(...scores);
  const high = Math.max(...scores);

  return (
    <figure
      className="rounded-lg border border-hairline bg-surface px-4 py-4 sm:px-6"
      aria-label={`Comfort index for ${cities.length} stations, ranging ${low.toFixed(
        1,
      )} to ${high.toFixed(1)}`}
    >
      <figcaption className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-slate">
          Comfort index
          <span className="hidden sm:inline"> · {cities.length} stations</span>
        </span>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-slate">
          Cold
          <span
            className="h-1.5 w-14 rounded-full"
            style={{ background: GRADIENT_CSS }}
            aria-hidden="true"
          />
          Warm
        </span>
      </figcaption>

      <div className="px-2" aria-hidden="true">
        <div className="relative h-4">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-hairline" />
          {cities.map((city) => (
            <span
              key={city.cityName}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${position(city.comfortScore)}%` }}
              title={`${city.cityName} · index ${city.comfortScore.toFixed(
                1,
              )} · ${city.temperature.toFixed(1)}°C`}
            >
              <span
                className={
                  city.rank === 1
                    ? 'block w-[3px] rounded-full h-4 ring-1 ring-ink'
                    : 'block w-[3px] rounded-full h-3'
                }
                style={{ backgroundColor: temperatureColor(city.temperature) }}
              />
            </span>
          ))}
        </div>

        <div className="relative mt-2 h-4">
          {TICKS.map((tick) => (
            <span
              key={tick}
              className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1"
              style={{ left: `${position(tick)}%` }}
            >
              <span className="h-1 w-px bg-hairline" />
              <span className="font-mono text-[10px] tabular-nums text-slate">
                {tick}
              </span>
            </span>
          ))}
        </div>
      </div>

      <p className="mt-3 font-mono text-[11px] tabular-nums text-slate">
        Range {low.toFixed(1)}–{high.toFixed(1)}
      </p>
    </figure>
  );
}
