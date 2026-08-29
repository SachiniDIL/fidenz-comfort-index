import { useId, useMemo, useState } from 'react';
import type { City } from '../types/city';
import { CityCard } from './CityCard';
import { IndexScale } from './IndexScale';

interface CityListProps {
  cities: City[];
}

type SortKey =
  | 'rank'
  | 'comfort-desc'
  | 'comfort-asc'
  | 'temp-desc'
  | 'temp-asc'
  | 'name-asc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'rank', label: 'Rank' },
  { value: 'comfort-desc', label: 'Comfort Index: High to Low' },
  { value: 'comfort-asc', label: 'Comfort Index: Low to High' },
  { value: 'temp-desc', label: 'Temperature: High to Low' },
  { value: 'temp-asc', label: 'Temperature: Low to High' },
  { value: 'name-asc', label: 'Name: A to Z' },
];

// Same shell as the header controls (Refresh / Log out / theme toggle).
const CONTROL_SHELL =
  'rounded border border-hairline bg-surface px-3 py-2 font-mono text-xs text-ink transition-colors hover:border-slate focus:border-slate';

function sortCities(cities: City[], sort: SortKey): City[] {
  const ordered = [...cities];
  switch (sort) {
    case 'comfort-desc':
      return ordered.sort((a, b) => b.comfortScore - a.comfortScore);
    case 'comfort-asc':
      return ordered.sort((a, b) => a.comfortScore - b.comfortScore);
    case 'temp-desc':
      return ordered.sort((a, b) => b.temperature - a.temperature);
    case 'temp-asc':
      return ordered.sort((a, b) => a.temperature - b.temperature);
    case 'name-asc':
      return ordered.sort((a, b) => a.cityName.localeCompare(b.cityName));
    case 'rank':
    default:
      // The backend's original order: comfort score descending.
      return ordered.sort((a, b) => a.rank - b.rank);
  }
}

export function CityList({ cities }: CityListProps) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('rank');
  const sortId = useId();

  const trimmedQuery = query.trim();

  const visibleCities = useMemo(() => {
    const needle = trimmedQuery.toLowerCase();
    const filtered = needle
      ? cities.filter((city) => city.cityName.toLowerCase().includes(needle))
      : cities;
    return sortCities(filtered, sort);
  }, [cities, trimmedQuery, sort]);

  if (cities.length === 0) {
    return (
      <p className="rounded-lg border border-hairline bg-surface p-6 text-center font-mono text-sm text-slate">
        No station data available.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <IndexScale cities={cities} />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by name"
          aria-label="Filter cities by name"
          className={`${CONTROL_SHELL} w-full placeholder:text-[11px] placeholder:uppercase placeholder:tracking-wider placeholder:text-slate sm:max-w-[16rem]`}
        />

        <div className="flex items-center gap-2">
          <label
            htmlFor={sortId}
            className="shrink-0 font-mono text-[11px] font-medium uppercase tracking-wider text-slate"
          >
            Sort
          </label>
          <div className="relative w-full sm:w-56">
            <select
              id={sortId}
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className={`${CONTROL_SHELL} w-full appearance-none pr-8`}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              viewBox="0 0 12 12"
              className="pointer-events-none absolute right-2.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-slate"
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
          </div>
        </div>
      </div>

      {visibleCities.length === 0 ? (
        <p className="rounded-lg border border-hairline bg-surface p-6 text-center font-mono text-sm text-slate">
          No stations match “{trimmedQuery}”.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleCities.map((city) => (
            <li key={city.cityName}>
              <CityCard city={city} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
