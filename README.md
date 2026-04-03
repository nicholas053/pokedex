# Pokédex

Full-stack Pokédex demo: **Laravel** backend (PokeAPI proxy, caching, search, multi-type filter, pagination) and **Next.js** frontend (infinite scroll, filters, cards with artwork).

## Prerequisites

- **PHP** 8.3+ and [Composer](https://getcomposer.org/)
- **Node.js** 20+ and npm (or pnpm/yarn)
- Network access to [PokeAPI](https://pokeapi.co/) (backend fetches data from there)

## Project structure

```
pokedex/
├── backend/          # Laravel API
│   ├── app/Http/Controllers/PokemonController.php
│   ├── app/Services/PokemonService.php
│   └── routes/api.php
├── frontend/         # Next.js (App Router)
│   └── src/
└── README.md
```

---

## Backend setup (Laravel)

From the repository root:

```bash
cd backend
composer install
```

### Environment

```bash
cp .env.example .env
php artisan key:generate
```

The default `.env.example` uses **SQLite** (`DB_CONNECTION=sqlite`) and **database** cache (`CACHE_STORE=database`). Ensure the database file exists:

```bash
# Windows (PowerShell)
New-Item -ItemType File -Force database/database.sqlite

# macOS / Linux
touch database/database.sqlite
```

Run migrations (creates users, cache, jobs, sessions tables as shipped with this project):

```bash
php artisan migrate
```

### Run the API server

```bash
php artisan serve
```

By default the app is available at **http://127.0.0.1:8000**. API routes are prefixed with **`/api`** (Laravel default), so the Pokédex endpoint is:

**http://127.0.0.1:8000/api/pokemons**

### Optional: production notes

- Point `APP_URL` at your public URL.
- Use a production cache store (e.g. **Redis**) if you expect high traffic.
- Configure CORS if the frontend is on another domain (see Laravel docs for `config/cors.php` or middleware).

---

## Frontend setup (Next.js)

```bash
cd frontend
npm install
```

### Environment

Create **`frontend/.env.local`** (not committed) with the **full base URL to the Laravel API**, including the `/api` prefix:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Use the same host/port as `php artisan serve`. If the browser shows CORS errors, align origins (e.g. both `localhost` or both `127.0.0.1`) and adjust Laravel CORS settings if needed.

### Run the dev server

```bash
npm run dev
```

Open **http://localhost:3000** (or the URL printed in the terminal).

### Production build

```bash
npm run build
npm start
```

---

## Running backend and frontend together

1. Terminal 1: `cd backend && php artisan serve`
2. Terminal 2: `cd frontend && npm run dev`
3. Ensure `NEXT_PUBLIC_API_URL` in `frontend/.env.local` matches the backend (e.g. `http://127.0.0.1:8000/api`).

---

## API documentation

Base path: **`/api`** (all routes below are relative to that prefix).

### `GET /pokemons`

Returns a **page** of Pokémon with artwork, types, height, and weight. Data is resolved via [PokeAPI](https://pokeapi.co/docs/v2); the backend caches species indexes and per-type lists to reduce upstream calls.

#### Query parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number (1-based). |
| `limit` | integer | `15` | Items per page. |
| `search` | string | — | Case-insensitive substring match on Pokémon **name**. |
| `types` | string | — | Comma-separated PokeAPI type slugs, e.g. `fire,flying`. Pokémon must have **every** listed type (AND). |
| `type` | string | — | **Legacy:** single type slug if `types` is omitted (e.g. `water`). |

Examples:

```http
GET /api/pokemons?page=1&limit=15
GET /api/pokemons?search=pika&page=1&limit=15
GET /api/pokemons?types=fire,flying&page=1&limit=15
```

#### Success response

**Status:** `200 OK`  
**Body:** JSON array of objects:

```json
[
  {
    "name": "bulbasaur",
    "image": "https://raw.githubusercontent.com/...",
    "types": ["grass", "poison"],
    "height": 7,
    "weight": 69
  }
]
```

- `image` may be `null` if no official artwork is available.
- `types` are slugs in API order (slot order from PokeAPI).

#### Error responses

| Status | Body | When |
|--------|------|------|
| `400` | `{"error": "Invalid type provided"}` | Unknown or invalid `types` / `type` for PokeAPI. |
| `502` | `{"error": "Unable to reach Pokémon data source"}` | PokeAPI index/type request failed after retries (not cached as success). |

---

## Tech stack summary

| Layer | Technology |
|-------|------------|
| Backend | Laravel 13, HTTP client + `Http::pool`, `Cache::remember` |
| Frontend | Next.js 16, React 19, SWR Infinite, Tailwind CSS, shadcn-style UI |
| Data source | [PokeAPI v2](https://pokeapi.co/) |

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| Frontend shows no data | `NEXT_PUBLIC_API_URL` includes `/api` and matches `php artisan serve` URL. |
| CORS errors in browser | Same scheme/host/port conventions; Laravel CORS config for your frontend origin. |
| Empty list / 502 | PokeAPI reachability; backend logs in `storage/logs/laravel.log`. |
| Cache oddities after code changes | `php artisan cache:clear` |
