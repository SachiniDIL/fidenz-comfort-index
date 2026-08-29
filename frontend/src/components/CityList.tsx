import type { City } from '../types/city';
import { CityCard } from './CityCard';

interface CityListProps {
  cities: City[];
}

export function CityList({ cities }: CityListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cities.map((city) => (
        <CityCard key={city.cityName} city={city} />
      ))}
    </div>
  );
}
