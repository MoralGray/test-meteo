import { Button, Card, CardContent, CardHeader, CardTitle } from '@mg-nx-forge/mg-ui-shadcn-4';
import { CloudSun, Droplets, Wind } from 'lucide-react';
import type { CityWithSnapshot } from '../services/api';

const weatherEmoji: Record<number, string> = {
    0: '\u2600\uFE0F',
    1: '\u26C5',
    2: '\u26C5',
    3: '\u2601\uFE0F',
    45: '\uF32B\uFE0F',
    48: '\uF32B\uFE0F',
    51: '\uD83C\uDF27\uFE0F',
    53: '\uD83C\uDF27\uFE0F',
    55: '\uD83C\uDF27\uFE0F',
    61: '\uD83C\uDF27\uFE0F',
    63: '\uD83C\uDF27\uFE0F',
    65: '\uD83C\uDF27\uFE0F',
    71: '\u2744\uFE0F',
    73: '\u2744\uFE0F',
    75: '\u2744\uFE0F',
    80: '\uD83C\uDF27\uFE0F',
    81: '\uD83C\uDF27\uFE0F',
    82: '\uD83C\uDF27\uFE0F',
    95: '\u26A1',
    96: '\u26A1',
    99: '\u26A1',
};

export function CityCard({ data, onRemove }: { data: CityWithSnapshot; onRemove: () => void }) {
    const { city, snapshot, stale } = data;

    return (
        <Card className={stale ? 'opacity-70' : ''}>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{city.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{city.country}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={onRemove}>
                    Remove
                </Button>
            </CardHeader>
            <CardContent>
                {snapshot ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-3xl">
                            <span>{weatherEmoji[snapshot.weatherCode] ?? '\u2601\uFE0F'}</span>
                            <span className="font-bold">{snapshot.temperature}°C</span>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Droplets className="h-4 w-4" />
                                {snapshot.humidity}%
                            </span>
                            <span className="flex items-center gap-1">
                                <Wind className="h-4 w-4" />
                                {snapshot.windSpeed} km/h
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {new Date(snapshot.fetchedAt).toLocaleString(undefined, {
                                timeZone: city.timezone ?? undefined,
                            })}
                        </p>
                        {stale && (
                            <p className="text-xs text-amber-500">
                                Data may be outdated \u2014 weather service unavailable
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
                        <CloudSun className="h-8 w-8" />
                        <p className="text-sm">No weather data yet</p>
                        <p className="text-xs">Sync weather to fetch data</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
