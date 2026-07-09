import { Controller, Get, Inject, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { WeatherService } from './weather.service.js';

@Controller('api/weather')
export class WeatherController {
    constructor(@Inject(WeatherService) private readonly weatherService: WeatherService) {}

    @Get('snapshots')
    async getSnapshots(@Query('userId') userId: string) {
        return this.weatherService.getLatestForUser(userId);
    }

    @Get('snapshot/:cityId')
    async getSnapshot(@Param('cityId', ParseIntPipe) cityId: number) {
        return this.weatherService.getLatestForCity(cityId);
    }

    @Post('sync')
    async sync() {
        return this.weatherService.syncAll();
    }
}
