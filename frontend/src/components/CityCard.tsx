import type { City } from '../types/city';

interface CityCardProps {
  city: City;
}

export function CityCard({ city }: CityCardProps) {
  const { cityName, description, temperature, comfortScore, rank } = city;
  const isTopRank = rank === 1;

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{cityName}</h2>
          <p className="capitalize text-slate-500">{description}</p>
        </div>
        <span
          className={
            isTopRank
              ? 'inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-sm font-bold text-amber-950 shadow'
              : 'inline-flex shrink-0 items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600'
          }
          aria-label={`Rank ${rank}`}
        >
          {isTopRank && <span aria-hidden="true">★&nbsp;</span>}
          {`#${rank}`}
        </span>
      </header>

      <div className="mt-auto flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Temperature
          </p>
          <p className="text-2xl font-semibold text-slate-900">
            {temperature.toFixed(1)}°C
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Comfort score
          </p>
          <p className="text-2xl font-semibold text-emerald-600">
            {comfortScore.toFixed(1)}
          </p>
        </div>
      </div>
    </article>
  );
}
