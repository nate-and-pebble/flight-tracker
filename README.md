# Flight Tracker

Track flight availability and pricing across routes. Dark-mode UI with sortable tables, expandable route details, and a recommended route badge.

Live at: https://flights.itsmenate.com

## Stack

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS** for styling
- **Drizzle ORM** + **Turso** (libsql/SQLite)
- **Vercel** for hosting

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `FLIGHTS_DB_URL` | Yes | Turso database URL (e.g. `libsql://your-db.turso.io`) or local file (`file:local.db`) |
| `FLIGHTS_DB_AUTH_TOKEN` | No | Turso auth token (not needed for local file DBs) |

## Setup

```bash
npm install
# Set FLIGHTS_DB_URL and optionally FLIGHTS_DB_AUTH_TOKEN in .env
npx tsx src/db/migrate.ts   # run migrations
npm run dev
```

## CLI

Manage data via the CLI at `cli/add.ts`:

```bash
# Create a search
npx tsx cli/add.ts search --name "Summer Japan" --origin DEN --destination NRT

# Add a route to search ID 1
npx tsx cli/add.ts route --search-id 1 --airline "United" --origin DEN --destination NRT --stops 1 --price 1200

# Add legs to route ID 1
npx tsx cli/add.ts leg --route-id 1 --origin DEN --destination SFO --order 1 --flight "UA123" --depart "08:00" --arrive "10:30" --availability green
npx tsx cli/add.ts leg --route-id 1 --origin SFO --destination NRT --order 2 --flight "UA456" --depart "12:00" --arrive "15:00+1" --availability yellow

# Import from JSON
npx tsx cli/add.ts import --file data.json

# List all searches
npx tsx cli/add.ts list

# List routes for a search
npx tsx cli/add.ts list routes --search-id 1
```

## Web UI

- `/` — List of all searches
- `/search/[id]` — Sortable table of routes with expandable leg details
  - Sort by price, stops, or availability score
  - Recommended badge on the best-scoring route

## Scoring

The recommended route is computed as:
```
score = price + (stops * 50) + (red_legs * 200) + (yellow_legs * 50)
```
Lowest score wins.
