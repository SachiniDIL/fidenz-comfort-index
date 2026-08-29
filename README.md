# Fidenz Comfort Index

A weather analytics dashboard that ranks cities by a custom-designed "Comfort Index" score, built with a React frontend and a Spring Boot backend, secured with Auth0 (OAuth2/OIDC, MFA, and restricted signups).

---

## Architecture Overview

- **Backend:** Java 21, Spring Boot 4.1.1, Maven. Fetches live weather from OpenWeatherMap, computes a comfort score per city, caches responses, and exposes a REST API secured as an OAuth2 resource server.
- **Frontend:** React + TypeScript, Vite, Tailwind CSS v4. Fetches ranked city data from the backend and renders a responsive dashboard behind an Auth0 login wall.
- **Auth:** Auth0 handles login, MFA, and user whitelisting. The backend independently validates JWTs (signature, issuer, and audience) on every request — it never trusts the frontend's authentication state.

There is deliberately **no database**. Nothing in this system needs to outlive a single request cycle beyond a short cache window, and Auth0 already owns user identity — see [Known Limitations](#known-limitations) for the full reasoning.

---

## Setup Instructions

### Prerequisites

- Java 21 (JDK)
- Node.js 22+ and npm
- An [OpenWeatherMap](https://openweathermap.org/api) API key (free tier is sufficient)

### Backend

1. `cd backend`
2. Create a file named `.env` in the `backend/` folder (already gitignored) containing:
   ```
   OPENWEATHERMAP_API_KEY=your-real-key-here
   ```
3. Run:
   ```
   ./mvnw spring-boot:run
   ```
4. The API is now live at `http://localhost:8080`. Both endpoints require a valid Auth0 access token (see [Authentication & Authorization](#authentication--authorization) below) — a request with no token correctly returns `401`.

### Frontend

1. `cd frontend`
2. Create `.env.local` (already gitignored) containing:
   ```
   VITE_API_BASE_URL=http://localhost:8080
   VITE_AUTH0_DOMAIN=dev-5esopfh3mi6fzoxo.us.auth0.com
   VITE_AUTH0_CLIENT_ID=KKP4x60Cen3oVYAtUiHfCaw9b3VEdY7n
   VITE_AUTH0_AUDIENCE=https://comfort-index-api
   ```
   (The Auth0 values above are not secret — a Client ID and audience are always visible in browser network traffic by design — and are provided here so reviewers can log in with the required test account without configuring a separate Auth0 tenant.)
3. `npm install`
4. `npm run dev`
5. Open `http://localhost:5173`

### Test Credentials

| Email | Password |
|---|---|
| `careers@fidenz.com` | `Pass#fidenz` |

Logging in will trigger a **one-time authenticator app enrollment** the first time this specific account logs in on a fresh Auth0 session (see [MFA Design](#multi-factor-authentication) for why), after which subsequent logins present an **email verification code** instead.

---

## Comfort Index Formula

```
ComfortIndex = (0.45 × tempScore) + (0.30 × humidityScore) + (0.25 × windScore)

tempScore     = max(0, 100 - |temp - 22|      × 4)
humidityScore = max(0, 100 - |humidity - 45|  × 1.5)
windScore     = max(0, 100 - |windSpeed - 3|  × 8)
```

Each sub-score is independently clamped to 0–100, so the final blended score is always within that range.

### Why these three parameters

- **Temperature** is the most immediately perceptible driver of weather comfort and the anchor of most real-world comfort metrics (heat index, WBGT, ASHRAE thermal comfort ranges).
- **Humidity** is the primary *modifier* of how temperature feels — it rarely matters in isolation, but suppresses evaporative cooling and makes heat feel worse. Without it, a humid tropical city and a dry city at the same temperature would score identically, which doesn't match lived experience.
- **Wind speed** has a real but smaller effect, cutting both ways: very still air can feel stuffy, very strong wind is unpleasant, so it's centered on a gentle breeze rather than treated as strictly better or worse with more wind.

### Why the weights are 45/30/25, not equal thirds

An equal split would imply wind matters as much as temperature to perceived comfort, which doesn't match how people actually describe good or bad weather — temperature dominates that judgment, humidity is the next most commonly cited factor, and wind is real but usually mentioned third.

### How the penalty rates were derived

Rather than picking penalty rates arbitrarily, each one follows a repeatable recipe: **decide how far a value has to drift from its ideal before that parameter alone should count as "unbearable" (score = 0), then divide 100 by that distance.**

| Parameter | Ideal | "Unbearable" distance | Rate | Score hits 0 at |
|---|---|---|---|---|
| Temperature | 22°C | 25° | 4 | -3°C or 47°C |
| Humidity | 45% | 66.7 pts | 1.5 | Never reachable — humidity only ranges 0–100%, so it can never fully zero out the score (deliberate: humidity should drag the score down, not single-handedly ruin it) |
| Wind speed | 3 m/s | 12.5 m/s | 8 | ~15.5 m/s (roughly gale-force) — the lower bound is physically meaningless since wind speed can't be negative |

### Reserved parameter (added live during the screen recording)

**Pressure** was deliberately left out of the launch formula and is the parameter extended live in the required screen recording, per this assignment's own suggestion to use Visibility or Pressure for that step:

```
pressureScore = max(0, 100 - |pressure - 1013| × 2)
```

Ideal center: 1013 hPa (standard sea-level pressure). Its effect on comfort is real but more indirect than the other three (some sensitivity to pressure swings, correlation with unsettled weather), which is why it's the fourth-weighted addition rather than one of the primary three.

### Parameters deliberately excluded

- **Cloudiness** — its effect is mostly redundant with the weather `description` field already shown in the UI (Clear/Clouds/Rain), and clear-vs-cloudy shifts a numeric comfort score far less than temperature, humidity, or wind.
- **Visibility** — OpenWeatherMap caps this at 10,000m for most non-fog conditions, meaning it would be identical or near-identical across nearly all 10 cities in this dataset, contributing close to zero real differentiation.
- **Dew Point** — explicitly flagged in the assignment as "not directly available in response." It would need to be derived from temperature and humidity (e.g. via the Magnus formula), the same two values already driving 75% of this formula's weight — including it risks double-counting a signal already captured rather than adding a genuinely new one.

---

## Cache Design

- **Provider:** Caffeine, wired in via Spring's caching abstraction (`@Cacheable`).
- **TTL:** 5 minutes (`expireAfterWrite`), applied to the raw OpenWeatherMap response per city (keyed by city code).
- **Why Caffeine over a plain `ConcurrentHashMap`:** built-in, correct TTL eviction without hand-rolling expiry-checking logic.
- **Debug endpoint (`GET /api/debug/cache`):** reports HIT/MISS per city by directly checking whether an entry currently exists in the cache for that city code.

**Known limitation, stated honestly:** this reports *"is this city currently cached"*, not *"was the most recent actual request for this city a hit or a miss."* Checking cache presence has no side effects (it can't trigger a network call either way), which is the correct behavior for a debug endpoint — but it means the two framings aren't strictly identical, even though they usually agree in practice.

---

## Authentication & Authorization

### Architecture

React (SPA) authenticates directly against Auth0 using the Authorization Code flow with PKCE (`@auth0/auth0-react`). Spring Boot is configured as an independent **OAuth2 resource server** — it validates every request's JWT itself (signature via Auth0's JWKS, issuer, and **audience**), rather than trusting that a request came from the legitimate frontend. Without audience validation specifically, any valid token issued by the same Auth0 tenant — even one meant for a completely different application — would be accepted; this is the concrete reason a custom audience validator was added rather than relying on issuer validation alone.

### Multi-Factor Authentication

The assignment requires "MFA via email verification." In practice, Auth0 imposes two platform constraints on non-Enterprise plans that shaped the final implementation:

1. **Email cannot be enabled as the sole MFA factor.** Auth0 requires at least one other enrollable factor alongside it — OTP (Authenticator App) was chosen as the required companion since it's free and needs no external provider.
2. **Email is not an "enrollable" factor at all** — unlike OTP, it has no dedicated sign-up step; it becomes available as a *challenge* option automatically once a user's email address is verified.

The practical consequence: a brand-new user must complete a **one-time OTP enrollment** on their very first login (there is no way to skip this, since Auth0 requires at least one real enrolled factor to exist). A custom Auth0 Login Action was then added to ensure **every subsequent login presents email as the primary MFA challenge**, not OTP:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  if (event.user.enrolledFactors?.length) {
    api.authentication.challengeWithAny([{ type: 'email' }, { type: 'otp' }]);
  }
};
```

This means the actual day-to-day, demonstrable login experience is genuinely email-based, with OTP existing only as a one-time technical prerequisite behind the scenes.

### Restricting Signups

Two settings combine to structurally guarantee only whitelisted users can ever log in:

1. **Public signups disabled** on the database connection (Authentication → Database → Disable Sign Ups).
2. **No social connections enabled** on the application (Google was enabled by default and was explicitly disabled).

With both in place, the only way a user can ever exist is manual creation via the Auth0 dashboard — there is exactly no path for an arbitrary person to create an account. This is a structural guarantee rather than an explicit allow-list check anywhere in the application code.

---

## Architecture & Design Decisions

**React + Spring Boot over a full-stack Next.js or Next.js/Spring Boot BFF setup.** A Spring Boot backend gives a clean, explicit venue for OOP design (interfaces with concrete implementations, layered packages) that directly matches this role's emphasis on algorithms, data structures, and OOP fundamentals over framework breadth. Plain React + Spring Boot (rather than a Next.js BFF) also keeps the architecture boundary simpler to reason about and defend live: browser talks to React, React talks to Spring Boot, with no server-side session relay layer in between.

**Native `fetch` over axios.** With only two endpoints, axios's main advantage (interceptor-based auth header injection across many calls) barely applies. Native fetch means no added dependency and less abstraction to explain if something needs debugging live.

**Interfaces only where a second implementation is plausible.** `WeatherClient` and `ComfortIndexCalculator` are interfaces because swapping providers or formulas is a realistic future need. `CityService` and `CityLoaderService` are concrete classes with no interface — each is the one true orchestrator for its job, and an interface here would be ceremony with no real flexibility gained. (Mockito can and does mock these concrete classes directly in tests without any interface being required.)

**A translation boundary between external and internal data shapes.** `CityJson` mirrors `cities.json`'s exact PascalCase structure for Jackson to deserialize; `City` is the clean two-field domain model everything else in the app actually uses. If Fidenz's file format ever changed, only `CityJson` would need to change — nothing downstream would notice. The same pattern applies to `WeatherResponse` (mirrors OpenWeatherMap's raw shape) versus `CityWeatherResult` (the app's own final response shape).

**Manual refresh over auto-polling.** A button gives the user explicit control and produces no invisible background network activity. Note that clicking Refresh re-checks the API but doesn't force-bypass the 5-minute cache — within that window it will correctly return the same cached data.

---

## Testing

- **Unit tests** (no Spring context): `CityLoaderServiceTest`, `DefaultComfortIndexCalculatorTest`, `CityServiceTest` — pure logic, dependencies mocked directly.
- **Integration-style test**: `WeatherCachingTest` — spins up just enough Spring context to prove the second call within the TTL window genuinely skips the network call, using a mocked `RestTemplate` and a real Caffeine cache.
- **Web-layer slice tests**: `CityControllerTest`, `DebugControllerTest` — `@WebMvcTest` with the real `SecurityConfig` imported and a mocked `JwtDecoder` (avoiding any real network call to Auth0 during tests), using Spring Security Test's `.with(jwt())` to simulate an authenticated request.
- **Frontend**: Vitest + React Testing Library for component rendering (`CityCard.test.tsx`).
- **CI**: GitHub Actions runs the backend (`mvn test`) and frontend (`npm run test` + `npm run build`) suites independently, path-filtered so each only runs when its own half of the monorepo changes.
- **Local enforcement**: Husky pre-commit runs frontend type-checking (and tests, once introduced) via `lint-staged`; pre-push runs the full backend test suite.

---

## Known Limitations

- **`cities.json` as provided contained 8 entries**, despite the assignment's explicit minimum of 10. Two additional, verified real OpenWeatherMap city IDs (London `2643743`, Cairns `2172797` — the latter taken directly from the assignment's own example response) were added to meet the requirement.
- **The debug cache endpoint reports current cache presence, not true last-request hit/miss** (see [Cache Design](#cache-design)).
- **Dew Point, Cloudiness, and Visibility are deliberately excluded** from the Comfort Index formula (see reasoning above) rather than omitted by oversight.
- **CORS is configured for `http://localhost:5173` only** — a deliberate dev-only setting, not intended for a production deployment this assignment doesn't require.
- **No auto-refresh polling** — the frontend fetches once on load plus on-demand via the Refresh button, not on an interval.
- **No persistent storage** for historical comfort scores or trend data — intentional, since nothing in the current scope needs to outlive a single request cycle beyond the existing short-TTL cache.
