import { useAuth0 } from '@auth0/auth0-react';
import { CityList } from './components/CityList';
import { LoginButton } from './components/LoginButton';
import { LogoutButton } from './components/LogoutButton';
import { useCities } from './hooks/useCities';

function Dashboard() {
  const { cities, loading, error, refresh } = useCities();
  const isInitialLoad = loading && cities.length === 0;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Fidenz Comfort Index
          </h1>
          <p className="mt-1 text-slate-500">
            Cities ranked by current weather comfort.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          <LogoutButton />
        </div>
      </header>

      {isInitialLoad && <p className="text-slate-500">Loading cities…</p>}

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
        >
          {error}
        </div>
      )}

      {!isInitialLoad && !error && <CityList cities={cities} />}
    </main>
  );
}

function LoginScreen() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Fidenz Comfort Index</h1>
      <p className="max-w-sm text-slate-500">
        Cities ranked by current weather comfort. Log in to view the dashboard.
      </p>
      <LoginButton />
    </main>
  );
}

function App() {
  const { isAuthenticated, isLoading, error } = useAuth0();

  console.debug('[App] Auth state - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'error:', error?.message);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="text-slate-500">Loading…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div
          role="alert"
          className="max-w-md rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700"
        >
          Authentication error: {error.message}
        </div>
      </main>
    );
  }

  return isAuthenticated ? <Dashboard /> : <LoginScreen />;
}

export default App;
