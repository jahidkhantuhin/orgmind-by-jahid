'use client';

import { createContext, useContext, useEffect, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';

const ThemeContext = createContext<{ dark: boolean; toggle: () => void }>({
  dark: false,
  toggle: () => undefined,
});
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('orgmind-theme-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('orgmind-theme-change', callback);
  };
}
function getDarkPreference() {
  return localStorage.getItem('orgmind-theme') === 'dark';
}
export function ThemeProvider({ children }: { children: ReactNode }) {
  const dark = useSyncExternalStore(subscribe, getDarkPreference, () => false);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  const toggle = () => {
    localStorage.setItem('orgmind-theme', dark ? 'light' : 'dark');
    window.dispatchEvent(new Event('orgmind-theme-change'));
  };
  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
