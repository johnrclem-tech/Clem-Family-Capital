export interface Theme {
  name: string;
  class: string;
  description: string;
  colors: {
    primary: string;
    accent: string;
  };
}

export const themes = {
  default: {
    name: "Default",
    class: "theme-default",
    description: "Clean and modern default theme",
    colors: {
      primary: "#18181b",
      accent: "#3b82f6",
    },
  },
  corporate: {
    name: "Corporate",
    class: "theme-corporate",
    description: "Professional business theme with navy and teal",
    colors: {
      primary: "#1e40af",
      accent: "#0891b2",
    },
  },
  "clean-slate": {
    name: "Clean Slate",
    class: "theme-clean-slate",
    description: "Minimalist monochrome theme",
    colors: {
      primary: "#404040",
      accent: "#737373",
    },
  },
  ocean: {
    name: "Ocean",
    class: "theme-ocean",
    description: "Calm blues and aqua tones",
    colors: {
      primary: "#0369a1",
      accent: "#06b6d4",
    },
  },
  sunset: {
    name: "Sunset",
    class: "theme-sunset",
    description: "Warm oranges and purples",
    colors: {
      primary: "#ea580c",
      accent: "#c026d3",
    },
  },
  forest: {
    name: "Forest",
    class: "theme-forest",
    description: "Natural greens and earth tones",
    colors: {
      primary: "#15803d",
      accent: "#65a30d",
    },
  },
  lavender: {
    name: "Lavender",
    class: "theme-lavender",
    description: "Soft purples and pinks",
    colors: {
      primary: "#7c3aed",
      accent: "#ec4899",
    },
  },
  amber: {
    name: "Amber",
    class: "theme-amber",
    description: "Warm amber and gold tones",
    colors: {
      primary: "#d97706",
      accent: "#f59e0b",
    },
  },
} as const;

export type ThemeName = keyof typeof themes;

export const themesList = Object.entries(themes).map(([key, theme]) => ({
  key: key as ThemeName,
  ...theme,
}));
