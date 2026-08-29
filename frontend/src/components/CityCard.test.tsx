import type { ReactElement } from 'react';
import { cloneElement } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { CityCard } from './CityCard';
import type { City } from '../types/city';

const auth = vi.hoisted(() => ({ getAccessTokenSilently: vi.fn() }));

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    getAccessTokenSilently: auth.getAccessTokenSilently,
  }),
}));

// Give recharts a real size so its SVG surface renders under jsdom.
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactElement }) =>
      cloneElement(children, { width: 600, height: 300 } as Record<string, unknown>),
  };
});

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

describe('CityCard — 5-day forecast', () => {
  const cairns: City = {
    cityCode: '2172797',
    cityName: 'Cairns',
    description: 'light rain',
    temperature: 23,
    comfortScore: 78.5,
    rank: 1,
  };

  const forecastPoints = [
    { dateTime: '2026-08-30 12:00:00', temperature: 20 },
    { dateTime: '2026-08-30 15:00:00', temperature: 22 },
    { dateTime: '2026-08-30 18:00:00', temperature: 19 },
  ];

  const okResponse = (body: unknown) =>
    ({ ok: true, status: 200, json: async () => body }) as Response;

  // Warm the code-split ForecastChart chunk so the lazy() boundary resolves
  // promptly in every test (the app still loads it on demand).
  beforeAll(async () => {
    await import('./ForecastChart');
  });

  beforeEach(() => {
    auth.getAccessTokenSilently.mockResolvedValue('test-token');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('shows no forecast control when the city has no cityCode', () => {
    render(<CityCard city={{ ...cairns, cityCode: undefined }} />);
    expect(
      screen.queryByRole('button', { name: /forecast/i }),
    ).not.toBeInTheDocument();
  });

  it('does not fetch until the forecast is expanded', () => {
    render(<CityCard city={cairns} />);

    expect(
      screen.getByRole('button', { name: /5-day forecast/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/5-day forecast for/i),
    ).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('fetches lazily with the bearer token and renders the chart on expand', async () => {
    vi.mocked(fetch).mockResolvedValue(okResponse(forecastPoints));
    const user = userEvent.setup();
    render(<CityCard city={cairns} />);

    await user.click(screen.getByRole('button', { name: /5-day forecast/i }));

    expect(
      await screen.findByLabelText('5-day forecast for Cairns'),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(document.querySelector('.recharts-surface')).toBeTruthy(),
    );

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toContain('/api/cities/2172797/forecast');
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      'Bearer test-token',
    );
  });

  it('collapses without losing data and re-expands without refetching', async () => {
    vi.mocked(fetch).mockResolvedValue(okResponse(forecastPoints));
    const user = userEvent.setup();
    render(<CityCard city={cairns} />);
    const button = screen.getByRole('button', { name: /forecast/i });

    await user.click(button); // expand
    await screen.findByLabelText('5-day forecast for Cairns');

    await user.click(button); // collapse
    expect(
      screen.queryByLabelText('5-day forecast for Cairns'),
    ).not.toBeInTheDocument();

    await user.click(button); // re-expand
    expect(
      await screen.findByLabelText('5-day forecast for Cairns'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Reading forecast…')).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('shows a loading state while the forecast request is pending', async () => {
    let resolveFetch: (() => void) | undefined;
    vi.mocked(fetch).mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveFetch = () => resolve(okResponse(forecastPoints));
      }),
    );
    const user = userEvent.setup();
    render(<CityCard city={cairns} />);

    await user.click(screen.getByRole('button', { name: /5-day forecast/i }));
    expect(await screen.findByText('Reading forecast…')).toBeInTheDocument();

    resolveFetch?.();
    expect(
      await screen.findByLabelText('5-day forecast for Cairns'),
    ).toBeInTheDocument();
  });

  it('shows an error state when the forecast request fails', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
    } as Response);
    const user = userEvent.setup();
    render(<CityCard city={cairns} />);

    await user.click(screen.getByRole('button', { name: /5-day forecast/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/Couldn.t load forecast/i);
    expect(alert).toHaveTextContent('HTTP 502');
  });
});
