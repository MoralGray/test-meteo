import {
    Button,
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@mg-nx-forge/mg-ui-shadcn-4';
import { useState } from 'react';
import { toast } from 'sonner';
import { type City, CityArraySchema, citiesApi, favoritesApi } from '../services/api';
import { useWeatherStore } from '../stores/weather.store';

export function AddCityDialog({ onCityAdded }: { onCityAdded: () => void }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [cities, setCities] = useState<City[]>([]);
    const userId = useWeatherStore((s) => s.userId);

    const handleSearch = async (value: string) => {
        setSearch(value);
        if (value.length < 2) {
            setCities([]);
            return;
        }
        try {
            const res = await citiesApi.list.get({ filters: { search: value } });
            const parsed = CityArraySchema.parse(res);
            setCities(parsed);
        } catch {
            toast.error('Failed to search cities');
            setCities([]);
        }
    };

    const handleSelect = async (city: City) => {
        try {
            await favoritesApi.add.post({
                userId,
                city: { name: city.name, country: city.country, lat: city.lat, lon: city.lon, timezone: city.timezone },
            });
            setOpen(false);
            setSearch('');
            setCities([]);
            onCityAdded();
        } catch {
            toast.error('Failed to add city to favorites');
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline">Add City</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                <Command>
                    <CommandInput placeholder="Search cities..." value={search} onValueChange={handleSearch} />
                    <CommandList>
                        <CommandEmpty>Type at least 2 characters to search</CommandEmpty>
                        <CommandGroup>
                            {cities.map((city) => (
                                <CommandItem
                                    key={city.id}
                                    value={`${city.name}, ${city.country}`}
                                    onSelect={() => handleSelect(city)}
                                >
                                    {city.name}, {city.country}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
