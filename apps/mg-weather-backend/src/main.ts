import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

const PORT = Number(process.env.MG_WEATHER_BACKEND_PORT) || 8008;

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });
    await app.listen(PORT);
    console.log(`[mg-weather-backend] Server running on http://localhost:${PORT}`);
}

bootstrap();
