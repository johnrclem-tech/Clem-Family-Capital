"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import type { ThemeName } from "@/lib/themes";

const ColorThemeContext = React.createContext<{
  colorTheme: ThemeName;
  setColorTheme: (theme: ThemeName) => void;
} | undefined>(undefined);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [colorTheme, setColorThemeState] = React.useState<ThemeName>("default");
  const [mounted, setMounted] = React.useState(false);

  // Load theme from localStorage on mount
  React.useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("color-theme") as ThemeName | null;
    if (stored) {
      setColorThemeState(stored);
      document.documentElement.classList.add(stored);
    }
  }, []);

  // Update localStorage and document class when theme changes
  const setColorTheme = React.useCallback((theme: ThemeName) => {
    setColorThemeState((prev) => {
      // Remove old theme class
      if (prev) {
        document.documentElement.classList.remove(`theme-${prev}`);
      }
      // Add new theme class
      document.documentElement.classList.add(`theme-${theme}`);
      localStorage.setItem("color-theme", theme);
      return theme;
    });
  }, []);

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = React.useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error("useColorTheme must be used within a ThemeProvider");
  }
  return context;
}
