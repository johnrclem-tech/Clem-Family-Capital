import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/app-shell";
import { SyncProvider } from "@/components/layout/sync-context";

export const metadata: Metadata = {
  title: "Clem Finance Tagger",
  description: "Aggregate and tag financial transactions from all your accounts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <TooltipProvider>
            <SyncProvider>
              <AppShell>
                {children}
              </AppShell>
            </SyncProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
