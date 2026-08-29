import type { ReactElement } from 'react';
import { cloneElement } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ForecastChart, formatForecastLabel } from './ForecastChart';
import type { ForecastPoint } from '../hooks/useForecast';

// Give the chart a real size so recharts renders an SVG surface under jsdom.
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactElement }) =>
      cloneElement(children, { width: 600, height: 300 } as Record<string, unknown>),
  };
});

const points: ForecastPoint[] = [
  { dateTime: '2026-08-30 12:00:00', temperature: 20.1 },
  { dateTime: '2026-08-30 15:00:00', temperature: 22.4 },
  { dateTime: '2026-08-30 18:00:00', temperature: 19.7 },
  { dateTime: '2026-08-31 09:00:00', temperature: 17.2 },
];

describe('formatForecastLabel', () => {
  it('formats "YYYY-MM-DD HH:MM:SS" as "Wkd Hn(AM|PM)"', () => {
    const wkd = new Date(2026, 7, 30, 15).toLocaleDateString('en-US', {
      weekday: 'short',
    });
    expect(formatForecastLabel('2026-08-30 15:00:00')).toBe(`${wkd} 3PM`);
    expect(formatForecastLabel('2026-08-30 09:00:00')).toBe(`${wkd} 9AM`);
    expect(formatForecastLabel('2026-08-30 00:00:00')).toBe(`${wkd} 12AM`);
    expect(formatForecastLabel('2026-08-30 12:00:00')).toBe(`${wkd} 12PM`);
  });

  it('returns the input unchanged when it is not a valid date', () => {
    expect(formatForecastLabel('not-a-date')).toBe('not-a-date');
  });
});

describe('ForecastChart', () => {
  const baseProps = {
    cityName: 'Oslo',
    currentTemperature: -3.9,
    loading: false,
    error: null,
  };

  it('renders the "5-Day Forecast" label and a chart surface for the data', () => {
    render(<ForecastChart {...baseProps} data={points} />);

    expect(screen.getByText('5-Day Forecast')).toBeInTheDocument();
    expect(
      screen.getByLabelText('5-day forecast for Oslo'),
    ).toBeInTheDocument();

    const surface = document.querySelector('.recharts-surface');
    expect(surface).toBeTruthy();
    // one continuous temperature line
    expect(document.querySelector('.recharts-line-curve')).toBeTruthy();
    // x-axis carries formatted labels, not raw ISO strings
    const tickText = Array.from(
      document.querySelectorAll('.recharts-cartesian-axis-tick-value'),
    ).map((n) => n.textContent);
    expect(tickText.join(' ')).toMatch(/\b\d{1,2}(AM|PM)\b/);
    expect(tickText.join(' ')).not.toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('shows the loading state and no chart while the first fetch is in flight', () => {
    render(<ForecastChart {...baseProps} data={[]} loading />);

    expect(screen.getByText('Reading forecast…')).toBeInTheDocument();
    expect(document.querySelector('.recharts-surface')).toBeNull();
  });

  it('shows an error panel matching the app error style', () => {
    render(
      <ForecastChart
        {...baseProps}
        data={[]}
        error="Failed to load forecast (HTTP 500 Server Error)."
      />,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/Couldn.t load forecast/i);
    expect(alert).toHaveTextContent('HTTP 500');
    expect(document.querySelector('.recharts-surface')).toBeNull();
  });

  it('handles an empty forecast without rendering a chart', () => {
    render(<ForecastChart {...baseProps} data={[]} />);

    expect(screen.getByText('No forecast data available.')).toBeInTheDocument();
    expect(document.querySelector('.recharts-surface')).toBeNull();
  });
});
