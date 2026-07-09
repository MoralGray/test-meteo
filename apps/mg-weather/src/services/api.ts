import { ApiClient } from '@mg-nx-forge/mg-api-axios-1';
import { z } from 'zod';

const client = new ApiClient('/api');

export const citiesApi = client.createApi({
    list: '/cities',
    one: '/cities/$id',
});

export const favoritesApi = client.createApi({
    list: '/favorites',
    add: '/favorites',
    remove: '/favorites/$id',
});

export const weatherApi = client.createApi({
    snapshots: '/weather/snapshots',
    snapshot: '/weather/snapshot/$id',
    sync: '/weather/sync',
});

export const CitySchema = z.object({
    id: z.number(),
    name: z.string(),
    country: z.string(),
    lat: z.number(),
    lon: z.number(),
    timezone: z.string().nullable(),
});

export const WeatherSnapshotSchema = z.object({
    id: z.number(),
    cityId: z.number(),
    temperature: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    weatherCode: z.number(),
    fetchedAt: z.string(),
});

export const CityWithSnapshotSchema = z.object({
    city: CitySchema,
    snapshot: WeatherSnapshotSchema.nullable(),
    stale: z.boolean(),
});

export type City = z.infer<typeof CitySchema>;
export type WeatherSnapshot = z.infer<typeof WeatherSnapshotSchema>;
export type CityWithSnapshot = z.infer<typeof CityWithSnapshotSchema>;

export const CityArraySchema = z.array(CitySchema);
export const CityWithSnapshotArraySchema = z.array(CityWithSnapshotSchema);
