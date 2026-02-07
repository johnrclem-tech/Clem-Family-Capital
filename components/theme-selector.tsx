"use client";

import * as React from "react";
import { Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useColorTheme } from "@/components/theme-provider";
import { themesList } from "@/lib/themes";

export function ThemeSelector() {
  const { colorTheme, setColorTheme } = useColorTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="h-9 w-9" disabled>
        <Palette className="h-4 w-4" />
        <span className="sr-only">Select color theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Select color theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Color Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {themesList.map((theme) => (
            <DropdownMenuItem
              key={theme.key}
              onClick={() => setColorTheme(theme.key)}
              className="flex items-start gap-3 py-2 cursor-pointer"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex gap-1 shrink-0">
                  <div
                    className="w-4 h-4 rounded-sm border"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div
                    className="w-4 h-4 rounded-sm border"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{theme.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {theme.description}
                  </div>
                </div>
              </div>
              {colorTheme === theme.key && (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
