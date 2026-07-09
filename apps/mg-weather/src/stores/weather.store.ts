import { create } from 'zustand';
import type { CityWithSnapshot } from '../services/api';

type WeatherStore = {
    userId: string;
    cities: CityWithSnapshot[];
    loading: boolean;
    error: string | null;
    setUserId: (id: string) => void;
    setCities: (cities: CityWithSnapshot[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
};

export const useWeatherStore = create<WeatherStore>((set) => ({
    userId: 'default-user',
    cities: [],
    loading: false,
    error: null,
    setUserId: (userId) => set({ userId }),
    setCities: (cities) => set({ cities }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
