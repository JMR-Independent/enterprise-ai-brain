import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '@/types';
// import { getSystemTheme } from '@/lib/utils';

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  isMobile: boolean;
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setIsMobile: (mobile: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      sidebarOpen: true,
      isMobile: false,

      setTheme: (theme: Theme) => {
        set({ theme });
        
        // Apply theme to document
        const root = document.documentElement;
        
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          root.classList.toggle('dark', systemTheme === 'dark');
        } else {
          root.classList.toggle('dark', theme === 'dark');
        }
      },

      toggleTheme: () => {
        const { theme } = get();
        let newTheme: Theme;
        
        if (theme === 'light') {
          newTheme = 'dark';
        } else if (theme === 'dark') {
          newTheme = 'system';
        } else {
          newTheme = 'light';
        }
        
        get().setTheme(newTheme);
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      setIsMobile: (mobile: boolean) => {
        set({ isMobile: mobile });
        
        // Auto-close sidebar on mobile
        if (mobile) {
          set({ sidebarOpen: false });
        }
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const store = useUIStore.getState();
  store.setTheme(store.theme);
  
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    if (store.theme === 'system') {
      store.setTheme('system');
    }
  });
  
  // Listen for window resize
  const handleResize = () => {
    store.setIsMobile(window.innerWidth < 768);
  };
  
  window.addEventListener('resize', handleResize);
  handleResize(); // Initial check
}