import { Controller, Get, Inject, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CitiesService } from './cities.service.js';

@Controller('api/cities')
export class CitiesController {
    constructor(@Inject(CitiesService) private readonly citiesService: CitiesService) {}

    @Get()
    async findAll(@Query('search') search?: string) {
        return this.citiesService.findAll(search);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.citiesService.findOne(id);
    }
}
