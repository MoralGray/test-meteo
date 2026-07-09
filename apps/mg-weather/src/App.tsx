import { ThemeProvider, Toaster, TooltipProvider } from '@mg-nx-forge/mg-ui-shadcn-4';
import { Route, Routes } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';

export default function App() {
    return (
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <TooltipProvider>
                <main className="mx-auto max-w-5xl px-4 py-8">
                    <Routes>
                        <Route path="/" element={<DashboardPage />} />
                    </Routes>
                </main>
                <Toaster />
            </TooltipProvider>
        </ThemeProvider>
    );
}
