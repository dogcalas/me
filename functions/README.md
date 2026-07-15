# CineRank — movie rating aggregator

A comparador de películas that fetches ratings from multiple sources, computes an
aggregate average, and lets you compare several titles side by side.

- **Front-end:** [`/peliculas.html`](../peliculas.html) — search, cards, comparison table, ES/EN.
- **Back-end:** Cloudflare Pages Functions under `functions/api/movies/`.

## Why Cloudflare Functions (edge)

The rating sites can't be scraped from the browser (CORS + they block browser
origins). These functions run **server-side on Cloudflare's edge**, so requests
come from a real server IP with no CORS restrictions. That's the "scraping
system" powering the app — the browser only ever talks to our own `/api/...`.

## Endpoints

| Route | Purpose |
|-------|---------|
| `GET /api/movies/search?q=<title>` | Autocomplete candidates via the IMDb suggestion API (no key). |
| `GET /api/movies/ratings?imdb=tt…&title=…&year=…` | Aggregates ratings + metadata and returns a `/10` average. |

Each source is fetched inside its own `try/catch` with a timeout, so a source
that goes down or changes its markup simply drops out of the average instead of
breaking the response.

## Sources

| Source | How | API key |
|--------|-----|---------|
| **IMDb** | Scrapes the title page's JSON-LD (rating + genre, runtime, plot, director, poster). | — |
| **Rotten Tomatoes** | Public `napi/search` endpoint → Tomatómetro + audiencia. | — |
| **FilmAffinity** | Scrapes the search/film page rating (no API exists). | — |
| **Metacritic** | Comes from OMDb. | needs `OMDB_API_KEY` |
| **TMDb** | `find` endpoint → community score + metadata backup. | needs `TMDB_API_KEY` |

The app works out of the box with **no keys** (IMDb + Rotten Tomatoes +
FilmAffinity). Adding keys unlocks Metacritic and TMDb and makes IMDb/RT more
robust (OMDb serves them as clean JSON).

## Optional configuration

In the Cloudflare Pages dashboard → **Settings → Environment variables**, add:

- `OMDB_API_KEY` — free key from https://www.omdbapi.com/apikey.aspx (adds Metacritic; reliable IMDb/RT).
- `TMDB_API_KEY` — free key from https://www.themoviedb.org/settings/api (adds the TMDb score).

No redeploy code change needed — the functions read them from `env` at runtime.

## Local dev

```bash
npx wrangler pages dev .           # serves the static site + functions
# then open http://localhost:8788/peliculas
```
