import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface UIState {
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  isNotificationOpen: boolean;
  theme: ThemeMode;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setNotificationOpen: (open: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      isMobileMenuOpen: false,
      isNotificationOpen: false,
      theme: 'light',
      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      setNotificationOpen: (open) => set({ isNotificationOpen: open }),
      setTheme: (theme) => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        if (theme === 'system') {
          const sys = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
          root.classList.add(sys);
        } else {
          root.classList.add(theme);
        }
        set({ theme });
      },
    }),
    {
      name: 'projectflow-ui-storage',
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);