# mg-nx-forge — Weather App

Weather dashboard for favorite cities. Pick cities, save them, and see live weather — temperature, humidity, wind, and conditions. Frontend talks to a NestJS API that fetches from Open-Meteo (free, no key needed) and stores data in SQLite. Weather refreshes automatically every 10 minutes; if the API is unreachable, stale data is shown with a clear indicator.

## Quick start

```bash
mise run all
```

Frontend → http://localhost:3006
Backend  → http://localhost:8008

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite 8, Tailwind v4, shadcn/ui |
| Backend | NestJS 11, Prisma 7, SQLite |
| Weather | Open-Meteo API (free, no key) |

## Commands

| Command | What |
|---------|------|
| `mise run all` | Start frontend + backend |
| `npm run dev` (in app dir) | Start single app |
| `npm run test` | Run tests |
| `npm run typecheck` | TypeScript check |

