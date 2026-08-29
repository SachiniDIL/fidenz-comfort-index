import { useAuth0 } from '@auth0/auth0-react';
import { CityList } from './components/CityList';
import { LoginButton } from './components/LoginButton';
import { LogoutButton } from './components/LogoutButton';
import { useCities } from './hooks/useCities';
import { GRADIENT_CSS } from './lib/temperature';

function Nameplate({ subline }: { subline: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-slate">
        Fidenz
      </p>
      <h1 className="font-display text-2xl font-medium leading-none text-ink sm:text-[28px]">
        Comfort Index
      </h1>
      <p className="font-mono text-xs tabular-nums text-slate">{subline}</p>
    </div>
  );
}

function Dashboard() {
  const { cities, loading, error, refresh } = useCities();
  const isInitialLoad = loading && cities.length === 0;
  const subline =
    cities.length > 0
      ? `${cities.length} stations · ranked by comfort score`
      : 'Live weather-comfort readings';

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <header className="flex flex-col gap-5 border-b border-hairline pb-6 sm:flex-row sm:items-end sm:justify-between">
          <Nameplate subline={subline} />
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="inline-flex min-w-[7rem] items-center justify-center rounded border border-hairline bg-surface px-3 py-2 font-mono text-xs font-medium uppercase tracking-wider text-ink transition-colors hover:border-slate disabled:opacity-50 disabled:hover:border-hairline"
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <LogoutButton />
          </div>
        </header>

        <main className="pt-6">
          {isInitialLoad && (
            <p className="font-mono text-sm text-slate">Reading stations…</p>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-r-lg border-l-2 border-temp-hot bg-surface p-4"
            >
              <p className="font-mono text-[11px] uppercase tracking-wider text-slate">
                Couldn’t load stations
              </p>
              <p className="mt-1 text-sm text-ink">{error}</p>
            </div>
          )}

          {!isInitialLoad && !error && <CityList cities={cities} />}
        </main>
      </div>
    </div>
  );
}

function LoginScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-lg border border-hairline bg-surface p-8">
        <div className="flex flex-col gap-6">
          <Nameplate subline="Sign in to view the index" />

          <div className="flex flex-col gap-1.5">
            <div
              className="h-1.5 w-full rounded-full"
              style={{ background: GRADIENT_CSS }}
              aria-hidden="true"
            />
            <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-slate">
              <span>Cold</span>
              <span>Warm</span>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-slate">
            Live weather-comfort readings for cities worldwide, scored from
            temperature, humidity, and wind speed.
          </p>

          <LoginButton />

          <p className="font-mono text-[11px] text-slate">
            Secure sign-in via Auth0
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated, isLoading, error } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="font-mono text-sm text-slate">Initializing…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div
          role="alert"
          className="w-full max-w-sm rounded-r-lg border-l-2 border-temp-hot bg-surface p-6"
        >
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate">
            Authentication error
          </p>
          <p className="mt-2 text-sm text-ink">{error.message}</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <LoginScreen />;
}

export default App;
