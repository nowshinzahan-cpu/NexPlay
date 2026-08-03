import { createContext, useState, useEffect, useCallback, useMemo } from 'react';

export const ThemeContext = createContext(null);

/**
 * ThemeProvider — supports light, dark, and system themes.
 *
 * - Persists preference to localStorage under 'nexplay-theme'
 * - 'system' follows prefers-color-scheme and updates live
 * - Sets data-theme on <html> for CSS variable switching
 * - Exposes resolvedTheme ('light'|'dark') for JS logic
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem('nexplay-theme');
      if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    } catch {}
    return 'dark';
  });

  // Resolved theme: the actual 'light' or 'dark' value
  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (theme === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      }
    }
    return theme;
  });

  // Apply theme to document
  useEffect(() => {
    const applyTheme = (resolved) => {
      document.documentElement.setAttribute('data-theme', resolved);
      document.documentElement.style.colorScheme = resolved;
    };

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: light)');
      const handleChange = (e) => {
        const resolved = e.matches ? 'light' : 'dark';
        setResolvedTheme(resolved);
        applyTheme(resolved);
      };
      handleChange(mq);
      mq.addEventListener('change', handleChange);
      return () => mq.removeEventListener('change', handleChange);
    } else {
      setResolvedTheme(theme);
      applyTheme(theme);
    }
  }, [theme]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nexplay-theme', theme);
    } catch {}
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark' || newTheme === 'system') {
      setThemeState(newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'dark';
      // If system, toggle to the opposite of current resolved
      return resolvedTheme === 'dark' ? 'light' : 'dark';
    });
  }, [resolvedTheme]);

  const value = useMemo(() => ({
    theme,              // 'light' | 'dark' | 'system' (user preference)
    resolvedTheme,      // 'light' | 'dark' (actual applied)
    setTheme,           // setTheme('light') | setTheme('dark') | setTheme('system')
    toggleTheme,        // toggle between light <-> dark
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system'
  }), [theme, resolvedTheme, setTheme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
