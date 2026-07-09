import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { GEOCODING_BASE } from '../weather/weather.constants.js';

@Injectable()
export class CitiesService {
    constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

    async findAll(search?: string) {
        if (!search || search.length < 2) {
            return [];
        }

        const url = `${GEOCODING_BASE}?name=${encodeURIComponent(search)}&count=10&language=en&format=json`;
        const res = await fetch(url);

        if (!res.ok) {
            console.error(`[CitiesService] Geocoding API returned ${res.status}`);
            return [];
        }

        let data: {
            results?: Array<{
                id: number;
                name: string;
                country: string;
                latitude: number;
                longitude: number;
                timezone: string;
            }>;
        };

        try {
            data = await res.json();
        } catch {
            console.error('[CitiesService] Failed to parse geocoding response');
            return [];
        }

        if (!data.results || !Array.isArray(data.results)) {
            return [];
        }

        return data.results
            .filter((r) => r && typeof r.name === 'string')
            .map((r) => ({
                id: r.id,
                name: r.name,
                country: r.country ?? 'Unknown',
                lat: r.latitude,
                lon: r.longitude,
                timezone: r.timezone ?? null,
            }));
    }

    async findOne(id: number) {
        return this.prisma.prisma.city.findUnique({ where: { id } });
    }
}
