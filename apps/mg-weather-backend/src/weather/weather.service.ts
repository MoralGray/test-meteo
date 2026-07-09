import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { OPEN_METEO_BASE, OPEN_METEO_PARAMS, WEATHER_STALE_AFTER_MS } from './weather.constants.js';

export interface SyncResult {
    city: string;
    status: 'ok' | 'error';
}

export interface CityWeather {
    city: { id: number; name: string; country: string; lat: number; lon: number; timezone: string | null };
    snapshot: {
        id: number;
        cityId: number;
        temperature: number;
        humidity: number;
        windSpeed: number;
        weatherCode: number;
        fetchedAt: Date;
    } | null;
    stale: boolean;
}

@Injectable()
export class WeatherService implements OnModuleInit {
    constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

    async onModuleInit() {
        setInterval(() => {
            this.syncAll().catch((e: unknown) => console.error('[WeatherService] Background sync failed:', e));
        }, WEATHER_STALE_AFTER_MS);
    }

    async getLatestForUser(userId: string): Promise<CityWeather[]> {
        const favorites = await this.prisma.prisma.favoriteCity.findMany({
            where: { userId },
            include: { city: true },
        });

        return Promise.all(
            favorites.map(async (fav) => {
                const snapshot = await this.prisma.prisma.weatherSnapshot.findFirst({
                    where: { cityId: fav.cityId },
                    orderBy: { fetchedAt: 'desc' },
                });
                return {
                    city: fav.city,
                    snapshot,
                    stale: snapshot ? Date.now() - snapshot.fetchedAt.getTime() > WEATHER_STALE_AFTER_MS : true,
                };
            })
        );
    }

    async getLatestForCity(cityId: number): Promise<CityWeather> {
        const [snapshot, city] = await Promise.all([
            this.prisma.prisma.weatherSnapshot.findFirst({
                where: { cityId },
                orderBy: { fetchedAt: 'desc' },
            }),
            this.prisma.prisma.city.findUnique({ where: { id: cityId } }),
        ]);

        return {
            city: city ?? { id: cityId, name: 'Unknown', country: '', lat: 0, lon: 0, timezone: null },
            snapshot,
            stale: snapshot ? Date.now() - snapshot.fetchedAt.getTime() > WEATHER_STALE_AFTER_MS : true,
        };
    }

    async syncAll(): Promise<SyncResult[]> {
        const cities = await this.prisma.prisma.city.findMany();
        const results: SyncResult[] = [];

        for (const city of cities) {
            try {
                const url = `${OPEN_METEO_BASE}?latitude=${city.lat}&longitude=${city.lon}&current=${OPEN_METEO_PARAMS}`;
                const res = await fetch(url);

                if (!res.ok) {
                    throw new Error(`Open-Meteo returned ${res.status} for ${city.name}`);
                }

                const raw = await res.json();
                const current = raw?.current;

                if (!current || typeof current.temperature_2m !== 'number') {
                    throw new Error(`Invalid response shape from Open-Meteo for ${city.name}`);
                }

                await this.prisma.prisma.weatherSnapshot.create({
                    data: {
                        cityId: city.id,
                        temperature: current.temperature_2m,
                        humidity: current.relative_humidity_2m,
                        windSpeed: current.wind_speed_10m,
                        weatherCode: current.weather_code,
                    },
                });

                results.push({ city: city.name, status: 'ok' });
            } catch (e: unknown) {
                console.error(`[WeatherService] Failed to fetch weather for ${city.name}:`, e);
                results.push({ city: city.name, status: 'error' });
            }
        }

        return results;
    }
}
