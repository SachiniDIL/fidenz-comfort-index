import type { City } from '../types/city';
import { CityCard } from './CityCard';
import { IndexScale } from './IndexScale';

interface CityListProps {
  cities: City[];
}

export function CityList({ cities }: CityListProps) {
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
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => (
          <li key={city.cityName}>
            <CityCard city={city} />
          </li>
        ))}
      </ul>
    </div>
  );
}
