import React, { useEffect } from 'react';
import { AppProviders } from './providers';
import { AppRouter } from './router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';

export const App: React.FC = () => {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  useEffect(() => {
    initializeAuth();
    setTheme(theme);
  }, [initializeAuth, setTheme, theme]);

  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
};

export default App;