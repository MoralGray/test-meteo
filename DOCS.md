# mg-nx-forge

## Concept

Weather dashboard for favorite cities.
Select cities, save favorites, view live weather from Open-Meteo with offline fallback.

## Architecture

```
Browser → Vite proxy (/api) → NestJS → Prisma → SQLite
                                  ↘ Open-Meteo API
```

## Features

### Feature: City Search
- ID: F-001
- Status: Done
- Description
- - Search cities worldwide via Open-Meteo Geocoding API (400k+ cities)
- - Display results in a searchable combobox
- User Flow
- - User types city name in search field
- - Results appear after brief debounce
- - User selects a city from results
- Technical Notes
- - Calls Open-Meteo Geocoding API at `api.open-meteo.com/v1/search`
- - Debounce implemented client-side before sending request
- - Backend proxies search through `/api/cities?search=...`
- Test Spec
- - Type "London" in search
- - Verify London shows in results
- - Select it and verify it appears in the dashboard

### Feature: Favorite Cities
- ID: F-002
- Status: Done
- Description
- - Add cities to personal favorites list
- - Remove cities from favorites
- - Each user identified by userId string
- User Flow
- - User clicks "Add" on a searched city
- - City appears in favorites grid
- - User clicks remove icon to delete
- Technical Notes
- - CRUD via `/api/favorites` endpoints
- - Favorites stored in SQLite via Prisma
- - userId is a string passed as query param
- Test Spec
- - Add a city via the dialog
- - Verify it appears in the city grid
- - Remove it and verify it disappears

### Feature: Weather Display
- ID: F-003
- Status: Done
- Description
- - Display current weather for each favorite city
- - Shows temperature, humidity, wind speed, weather condition
- - Each city shows local timezone
- User Flow
- - Dashboard loads weather for all favorites on mount
- - Each city rendered as a CityCard with weather data
- Technical Notes
- - Weather data from Open-Meteo API at `api.open-meteo.com/v1/forecast`
- - CityCard component from `@/components/CityCard`
- - Zustand store manages cities and loading state
- Test Spec
- - Navigate to /
- - Verify weather data appears for each favorite city

### Feature: Background Weather Sync
- ID: F-004
- Status: Done
- Description
- - Automatic weather refresh every 10 minutes
- - Manual sync via "Sync" button
- - Avoids redundant fetches for recent data
- User Flow
- - Weather updates in background without page reload
- - User can force refresh with Sync button
- Technical Notes
- - NestJS interval scheduler runs every 10 minutes
- - Skips cities with data fetched <10 minutes ago
- - Sync endpoint at `POST /api/weather/sync`
- Test Spec
- - Wait 10 minutes
- - Verify weather data timestamps update
- - Click Sync and verify immediate refresh

### Feature: Offline Resilience
- ID: F-005
- Status: Done
- Description
- - Shows cached weather when Open-Meteo is unreachable
- - Clear visual indicator when data is stale
- - No data loss on API failure
- User Flow
- - If API fails, user sees last known weather with "stale" label
- - Normal display resumes when API recovers
- Technical Notes
- - Snapshot staleness checked via `fetchedAt` timestamp
- - Prisma stores all snapshots in SQLite
- - WeatherService handles fetch errors gracefully
- Test Spec
- - Disconnect network
- - Verify stale indicator appears on cards
- - Reconnect and verify data updates

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cities?search=... | Search cities |
| GET | /api/favorites?userId=... | List favorites |
| POST | /api/favorites | Add favorite |
| DELETE | /api/favorites/:cityId | Remove favorite |
| GET | /api/weather/snapshots?userId=... | Latest weather per favorite |
| GET | /api/weather/snapshot/:cityId | Weather for one city |
| POST | /api/weather/sync | Force refresh |

## Database Schema

| Model | Fields |
|-------|--------|
| City | id, name, country, lat, lon, timezone |
| FavoriteCity | id, userId, cityId |
| WeatherSnapshot | id, cityId, temperature, humidity, windSpeed, weatherCode, fetchedAt |

## State Management

Zustand store: `userId`, `cities[]`, `loading`, `error`
