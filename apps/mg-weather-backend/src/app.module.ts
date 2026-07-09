import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { CitiesModule } from './cities/cities.module.js';
import { FavoritesModule } from './favorites/favorites.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { WeatherModule } from './weather/weather.module.js';

@Module({
    imports: [PrismaModule, CitiesModule, FavoritesModule, WeatherModule],
    controllers: [AppController],
    providers: [],
})
export class AppModule {}
