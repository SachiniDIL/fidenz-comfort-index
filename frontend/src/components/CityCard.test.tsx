import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CityCard } from './CityCard';
import type { City } from '../types/city';

const oslo: City = {
  cityName: 'Oslo',
  description: 'clear sky',
  temperature: -3.9,
  comfortScore: 85,
  rank: 1,
};

describe('CityCard', () => {
  it('renders the city name, description, temperature, comfort score and rank', () => {
    render(<CityCard city={oslo} />);

    expect(screen.getByRole('heading', { name: 'Oslo' })).toBeInTheDocument();
    expect(screen.getByText('clear sky')).toBeInTheDocument();
    expect(screen.getByText('-3.9°C')).toBeInTheDocument();
    expect(screen.getByText('85.0')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByLabelText('Rank 1')).toBeInTheDocument();
  });

  it('renders a non-top rank without the star treatment', () => {
    render(
      <CityCard
        city={{ ...oslo, cityName: 'Cairo', rank: 7, comfortScore: 42.3 }}
      />,
    );

    expect(screen.getByText('#7')).toBeInTheDocument();
    expect(screen.getByText('42.3')).toBeInTheDocument();
  });
});
