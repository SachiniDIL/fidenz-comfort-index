import { CityList } from './components/CityList';
import { useCities } from './hooks/useCities';

function App() {
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
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
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

export default App;
