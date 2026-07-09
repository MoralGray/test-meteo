import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { FavoritesService } from './favorites.service.js';

@Controller('api/favorites')
export class FavoritesController {
    constructor(@Inject(FavoritesService) private readonly favoritesService: FavoritesService) {}

    @Get()
    async findByUser(@Query('userId') userId: string) {
        return this.favoritesService.findByUser(userId);
    }

    @Post()
    async add(
        @Body() body: {
            userId: string;
            city: { name: string; country: string; lat: number; lon: number; timezone?: string | null };
        }
    ) {
        return this.favoritesService.add(body.userId, body.city);
    }

    @Delete(':cityId')
    async remove(@Query('userId') userId: string, @Param('cityId', ParseIntPipe) cityId: number) {
        await this.favoritesService.remove(userId, cityId);
        return { success: true };
    }
}
