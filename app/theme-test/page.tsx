"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function ThemeTestPage() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8 min-h-screen bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-8">Theme Test Page</h1>
      
      <div className="space-y-4 mb-8">
        <div className="p-4 border rounded">
          <p><strong>Current theme:</strong> {theme}</p>
          <p><strong>Resolved theme:</strong> {resolvedTheme}</p>
          <p><strong>System theme:</strong> {systemTheme}</p>
          <p><strong>HTML classes:</strong> {typeof document !== 'undefined' ? document.documentElement.className : 'N/A'}</p>
        </div>

        <div className="flex gap-4">
          <Button onClick={() => setTheme("light")}>
            Set Light
          </Button>
          <Button onClick={() => setTheme("dark")}>
            Set Dark
          </Button>
          <Button onClick={() => setTheme("system")}>
            Set System
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-card text-card-foreground border rounded">
          Card background
        </div>
        <div className="p-4 bg-primary text-primary-foreground rounded">
          Primary background
        </div>
        <div className="p-4 bg-secondary text-secondary-foreground rounded">
          Secondary background
        </div>
        <div className="p-4 bg-muted text-muted-foreground rounded">
          Muted background
        </div>
      </div>
    </div>
  );
}
