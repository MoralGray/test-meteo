import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WeatherService } from './weather.service.js';

const mockPrisma = {
    favoriteCity: {
        findMany: vi.fn(),
    },
    city: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
    },
    weatherSnapshot: {
        findFirst: vi.fn(),
        create: vi.fn(),
    },
};

const mockPrismaService = {
    prisma: mockPrisma,
};

function createService() {
    return new WeatherService(mockPrismaService as never);
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe('WeatherService', () => {
    describe('getLatestForUser', () => {
        it('returns empty array when user has no favorites', async () => {
            mockPrisma.favoriteCity.findMany.mockResolvedValue([]);
            const service = createService();
            const result = await service.getLatestForUser('user1');
            expect(result).toEqual([]);
        });

        it('returns weather data for each favorite city', async () => {
            mockPrisma.favoriteCity.findMany.mockResolvedValue([
                {
                    userId: 'user1',
                    cityId: 1,
                    city: { id: 1, name: 'Moscow', country: 'Russia', lat: 55.7, lon: 37.6 },
                },
            ]);
            mockPrisma.weatherSnapshot.findFirst.mockResolvedValue({
                id: 1,
                cityId: 1,
                temperature: 20.5,
                humidity: 65,
                windSpeed: 10,
                weatherCode: 0,
                fetchedAt: new Date(),
            });

            const service = createService();
            const result = await service.getLatestForUser('user1');

            expect(result).toHaveLength(1);
            expect(result[0].city.name).toBe('Moscow');
            expect(result[0].snapshot?.temperature).toBe(20.5);
            expect(result[0].stale).toBe(false);
        });

        it('marks city as stale when snapshot is old', async () => {
            const elevenMinutesAgo = new Date(Date.now() - 11 * 60 * 1000);

            mockPrisma.favoriteCity.findMany.mockResolvedValue([
                {
                    userId: 'user1',
                    cityId: 1,
                    city: { id: 1, name: 'Moscow', country: 'Russia', lat: 55.7, lon: 37.6 },
                },
            ]);
            mockPrisma.weatherSnapshot.findFirst.mockResolvedValue({
                id: 1,
                cityId: 1,
                temperature: 15,
                humidity: 50,
                windSpeed: 5,
                weatherCode: 1,
                fetchedAt: elevenMinutesAgo,
            });

            const service = createService();
            const result = await service.getLatestForUser('user1');

            expect(result[0].stale).toBe(true);
        });

        it('marks city as stale when no snapshot exists', async () => {
            mockPrisma.favoriteCity.findMany.mockResolvedValue([
                {
                    userId: 'user1',
                    cityId: 1,
                    city: { id: 1, name: 'Moscow', country: 'Russia', lat: 55.7, lon: 37.6 },
                },
            ]);
            mockPrisma.weatherSnapshot.findFirst.mockResolvedValue(null);

            const service = createService();
            const result = await service.getLatestForUser('user1');

            expect(result[0].stale).toBe(true);
            expect(result[0].snapshot).toBeNull();
        });
    });

    describe('getLatestForCity', () => {
        it('returns city with null snapshot when no data exists', async () => {
            mockPrisma.weatherSnapshot.findFirst.mockResolvedValue(null);
            mockPrisma.city.findUnique.mockResolvedValue({
                id: 1,
                name: 'London',
                country: 'UK',
                lat: 51.5,
                lon: -0.1,
            });

            const service = createService();
            const result = await service.getLatestForCity(1);

            expect(result.city.name).toBe('London');
            expect(result.snapshot).toBeNull();
            expect(result.stale).toBe(true);
        });
    });

    describe('syncAll', () => {
        it('returns error result when fetch fails', async () => {
            mockPrisma.city.findMany.mockResolvedValue([
                { id: 1, name: 'Moscow', country: 'Russia', lat: 55.7, lon: 37.6 },
            ]);

            const service = createService();
            vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

            const results = await service.syncAll();

            expect(results).toHaveLength(1);
            expect(results[0].status).toBe('error');
            expect(results[0].city).toBe('Moscow');
        });

        it('returns error when API returns non-ok status', async () => {
            mockPrisma.city.findMany.mockResolvedValue([
                { id: 1, name: 'Moscow', country: 'Russia', lat: 55.7, lon: 37.6 },
            ]);

            const service = createService();
            vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 500 }));

            const results = await service.syncAll();

            expect(results[0].status).toBe('error');
        });

        it('returns error when response shape is invalid', async () => {
            mockPrisma.city.findMany.mockResolvedValue([
                { id: 1, name: 'Moscow', country: 'Russia', lat: 55.7, lon: 37.6 },
            ]);

            const service = createService();
            vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

            const results = await service.syncAll();

            expect(results[0].status).toBe('error');
        });

        it('stores snapshot and returns ok on success', async () => {
            const city = { id: 1, name: 'Moscow', country: 'Russia', lat: 55.7, lon: 37.6 };
            mockPrisma.city.findMany.mockResolvedValue([city]);
            mockPrisma.weatherSnapshot.create.mockResolvedValue({ id: 1 });

            const service = createService();
            vi.spyOn(globalThis, 'fetch').mockResolvedValue(
                new Response(
                    JSON.stringify({
                        current: {
                            temperature_2m: 22.3,
                            relative_humidity_2m: 55,
                            wind_speed_10m: 12,
                            weather_code: 0,
                        },
                    }),
                    { status: 200 }
                )
            );

            const results = await service.syncAll();

            expect(results).toHaveLength(1);
            expect(results[0].status).toBe('ok');
            expect(mockPrisma.weatherSnapshot.create).toHaveBeenCalledWith({
                data: {
                    cityId: 1,
                    temperature: 22.3,
                    humidity: 55,
                    windSpeed: 12,
                    weatherCode: 0,
                },
            });
        });
    });
});
