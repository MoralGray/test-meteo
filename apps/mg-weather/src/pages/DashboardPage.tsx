import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@mg-nx-forge/mg-ui-shadcn-4';
import { CloudSun, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { AddCityDialog } from '../components/AddCityDialog';
import { CityCard } from '../components/CityCard';
import { CityWithSnapshotArraySchema, favoritesApi, weatherApi } from '../services/api';
import { useWeatherStore } from '../stores/weather.store';

export function DashboardPage() {
    const { userId, cities, loading, setCities, setLoading, setError } = useWeatherStore();

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await weatherApi.snapshots.get({ filters: { userId } });
            const parsed = CityWithSnapshotArraySchema.parse(res);
            setCities(parsed);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load weather data';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setLoading(true);
        try {
            await weatherApi.sync.post({});
            toast.success('Weather data synced');
            await loadData();
        } catch {
            toast.error('Sync failed \u2014 weather service unavailable');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (cityId: number) => {
        try {
            await favoritesApi.remove.del({ id: cityId, filters: { userId } });
            await loadData();
        } catch {
            toast.error('Failed to remove city');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Weather Dashboard</h1>
                    <p className="text-muted-foreground">Your favorite cities weather</p>
                </div>
                <div className="flex gap-2">
                    <AddCityDialog onCityAdded={loadData} />
                    <Button variant="outline" onClick={handleSync} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Sync
                    </Button>
                </div>
            </div>

            {loading && cities.length === 0 && (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {!loading && cities.length === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>No cities yet</CardTitle>
                        <CardDescription>Add cities to your favorites to see weather data</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center py-6">
                        <div className="flex flex-col items-center gap-4">
                            <CloudSun className="h-16 w-16 text-muted-foreground" />
                            <AddCityDialog onCityAdded={loadData} />
                        </div>
                    </CardContent>
                </Card>
            )}

            {cities.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cities.map((item) => (
                        <CityCard key={item.city.id} data={item} onRemove={() => handleRemove(item.city.id)} />
                    ))}
                </div>
            )}
        </div>
    );
}
