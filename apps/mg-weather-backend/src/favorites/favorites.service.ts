import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class FavoritesService {
    constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

    async findByUser(userId: string) {
        return this.prisma.prisma.favoriteCity.findMany({
            where: { userId },
            include: { city: true },
            orderBy: { city: { name: 'asc' } },
        });
    }

    async add(
        userId: string,
        cityData: { name: string; country: string; lat: number; lon: number; timezone?: string | null }
    ) {
        const city = await this.prisma.prisma.city.upsert({
            where: { name_country: { name: cityData.name, country: cityData.country } },
            create: cityData,
            update: {},
        });

        return this.prisma.prisma.favoriteCity.create({
            data: { userId, cityId: city.id },
            include: { city: true },
        });
    }

    async remove(userId: string, cityId: number) {
        await this.prisma.prisma.favoriteCity.delete({
            where: { userId_cityId: { userId, cityId } },
        });
    }
}
