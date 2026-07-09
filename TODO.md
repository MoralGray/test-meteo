# TODO

## epic-scaffold | Scaffold mg-weather monorepo apps in Nx
- [DONE] Create apps/mg-weather as React+Vite app via Nx generator
- [DONE] Create apps/mg-weather-backend as NestJS app
- [DONE] Add project.json with nx:run-commands targets (dev, build, typecheck, lint, db:push, db:generate)
- [DONE] Add package.json scripts following existing convention (vite --port, tsx watch, tsc -b, tsc --noEmit)
- [DONE] Set up vite.config.ts with @tailwindcss/vite plugin and path aliases
- [DONE] Wire @mg-nx-forge/mg-ui-shadcn-4 dependency for frontend UI components
- [DONE] Add port vars MG_WEATHER_PORT=3006 and MG_WEATHER_BACKEND_PORT=8008 to mise.toml
- [DONE] Update mise.toml all task to include new apps

## epic-db | Prisma schema for weather domain
- [DONE] Create apps/mg-weather-backend/prisma/schema.prisma with City model (id, name, country, lat, lon)
- [DONE] Add FavoriteCity model linking user id to city id
- [DONE] Add WeatherSnapshot model for cached weather data (temperature, humidity, windSpeed, weatherCode, timestamp)
- [DONE] Add prisma.config.ts with dual SQLite/PostgreSQL adapter support
- [DONE] Add db:push and db:generate scripts to backend package.json
- [DONE] Create .env with DATABASE_URL for SQLite dev database
- [DONE] Run prisma generate to create client
- [DONE] Add seed script with initial popular cities list (Moscow, London, Tokyo, etc.)

## epic-backend-core | NestJS weather API endpoints
- [DONE] Create PrismaModule as global module exporting PrismaService
- [DONE] Create CityModule with CRUD endpoints for listing cities
- [DONE] Create FavoriteCityModule for user favorite cities management (add, remove, list)
- [DONE] Create WeatherSnapshotModule for reading latest cached weather per city
- Skip DTOs with class-validator decorators for all inputs
- [DONE] Wire all modules in AppModule with global validation pipe
- [DONE] Add healthcheck endpoint at GET /api/health

## epic-background-sync | Periodic weather fetch from Open-Meteo
- [DONE] Create WeatherSyncService that fetches from https://api.open-meteo.com/v1/forecast
- [DONE] Implement scheduler (setInterval) to poll every 10 minutes for all cities
- [DONE] Store snapshots in WeatherSnapshot table with current timestamp
- [DONE] Handle API errors gracefully -- log failure, keep last known snapshot
- [DONE] Add POST /api/weather/sync endpoint to manually trigger sync
- [DONE] Add GET /api/weather/snapshots endpoint returning latest per city with staleness flag
- [DONE] Add GET /api/weather/snapshot/:cityId returning single city snapshot with staleness info

## epic-frontend-core | React weather dashboard UI
- [DONE] Create pages: Dashboard page displaying weather cards with AddCityDialog
- [DONE] Create CityCard component showing temperature, humidity, wind speed, weather emoji
- [DONE] Add FavoriteButton for toggling favorite status (Remove button on card)
- [DONE] Show staleness indicator (muted timestamp label, warning banner when API is down)
- [DONE] Wire API client via @mg-nx-forge/mg-api-axios-1
- [DONE] Use Zustand store for favorites state and weather data cache
- [DONE] Handle loading skeleton state, empty state (no cities), error state (API unavailable)
- [DONE] Style with Tailwind v4 and shadcn/ui components from mg-ui-shadcn-4

## epic-merge | Final wiring and verification
- [DONE] Verify end-to-end flow: frontend calls backend, backend serves weather data
- [DONE] Run lint and typecheck on both apps
- [DONE] Update mise.toml with port vars and all task
- [DONE] Update DOCS.md with weather app section and API reference
