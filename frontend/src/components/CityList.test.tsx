import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CityList } from './CityList';
import type { City } from '../types/city';

// Supplied in the backend's rank order (comfort score descending), as the real
// app receives it. Temperatures are arranged so every sort produces a
// distinguishable order.
const cities: City[] = [
  { cityName: 'Oslo', description: 'clear sky', temperature: -2, comfortScore: 90, rank: 1 },
  { cityName: 'Boston', description: 'few clouds', temperature: -5, comfortScore: 80, rank: 2 },
  { cityName: 'London', description: 'light rain', temperature: 18, comfortScore: 70, rank: 3 },
  { cityName: 'Cairo', description: 'clear sky', temperature: 34, comfortScore: 55, rank: 4 },
];

const visibleNames = () =>
  screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);

const cardFor = (name: string) =>
  screen.getByRole('heading', { name }).closest('article') as HTMLElement;

describe('CityList', () => {
  it('filters by city name (case-insensitive, partial match)', async () => {
    const user = userEvent.setup();
    render(<CityList cities={cities} />);
    const search = screen.getByRole('searchbox');

    await user.type(search, 'lon');
    expect(visibleNames()).toEqual(['London']);

    await user.clear(search);
    await user.type(search, 'OSL');
    expect(visibleNames()).toEqual(['Oslo']);

    await user.clear(search);
    expect(visibleNames()).toEqual(['Oslo', 'Boston', 'London', 'Cairo']);
  });

  it('shows a distinct "no results" empty state when a search matches nothing', async () => {
    const user = userEvent.setup();
    render(<CityList cities={cities} />);

    await user.type(screen.getByRole('searchbox'), 'zzz');

    expect(screen.getByText(/^No stations match .*zzz.*$/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    // Not the same as the "nothing loaded" state.
    expect(
      screen.queryByText('No station data available.'),
    ).not.toBeInTheDocument();
  });

  it('reorders the visible list for each sort option', async () => {
    const user = userEvent.setup();
    render(<CityList cities={cities} />);
    const sort = screen.getByLabelText('Sort');

    expect(visibleNames()).toEqual(['Oslo', 'Boston', 'London', 'Cairo']); // rank (default)

    await user.selectOptions(sort, 'comfort-desc');
    expect(visibleNames()).toEqual(['Oslo', 'Boston', 'London', 'Cairo']);

    await user.selectOptions(sort, 'comfort-asc');
    expect(visibleNames()).toEqual(['Cairo', 'London', 'Boston', 'Oslo']);

    await user.selectOptions(sort, 'temp-desc');
    expect(visibleNames()).toEqual(['Cairo', 'London', 'Oslo', 'Boston']);

    await user.selectOptions(sort, 'temp-asc');
    expect(visibleNames()).toEqual(['Boston', 'Oslo', 'London', 'Cairo']);

    await user.selectOptions(sort, 'name-asc');
    expect(visibleNames()).toEqual(['Boston', 'Cairo', 'London', 'Oslo']);

    await user.selectOptions(sort, 'rank');
    expect(visibleNames()).toEqual(['Oslo', 'Boston', 'London', 'Cairo']);
  });

  it('keeps each rank badge tied to the city backend rank regardless of sort', async () => {
    const user = userEvent.setup();
    render(<CityList cities={cities} />);

    await user.selectOptions(screen.getByLabelText('Sort'), 'temp-desc');

    // Visual order changed …
    expect(visibleNames()).toEqual(['Cairo', 'London', 'Oslo', 'Boston']);

    // … but the badges still report real comfort ranks, not list position.
    expect(within(cardFor('Cairo')).getByText('#4')).toBeInTheDocument();
    expect(within(cardFor('London')).getByText('#3')).toBeInTheDocument();
    expect(within(cardFor('Oslo')).getByText('#1')).toBeInTheDocument();
    expect(within(cardFor('Boston')).getByText('#2')).toBeInTheDocument();

    // The first card shown is the hottest city, and it is NOT badge #1.
    const firstCard = screen.getAllByRole('article')[0];
    expect(within(firstCard).getByRole('heading')).toHaveTextContent('Cairo');
    expect(within(firstCard).queryByText('#1')).not.toBeInTheDocument();
  });

  it('combines search and sort', async () => {
    const user = userEvent.setup();
    render(<CityList cities={cities} />);

    await user.type(screen.getByRole('searchbox'), 'on'); // Boston, London
    await user.selectOptions(screen.getByLabelText('Sort'), 'name-asc');

    expect(visibleNames()).toEqual(['Boston', 'London']);
    expect(within(cardFor('Boston')).getByText('#2')).toBeInTheDocument();
    expect(within(cardFor('London')).getByText('#3')).toBeInTheDocument();
  });

  it('renders the load-time empty state when no cities are supplied', () => {
    render(<CityList cities={[]} />);
    expect(screen.getByText('No station data available.')).toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });
});
