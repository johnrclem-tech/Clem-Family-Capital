"use client";

import * as React from "react";

interface SyncContextType {
  syncing: boolean;
  handleSync: (() => Promise<void>) | null;
  registerSync: (handler: () => Promise<void>, syncingState: boolean) => void;
}

const SyncContext = React.createContext<SyncContextType>({
  syncing: false,
  handleSync: null,
  registerSync: () => {},
});

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [syncing, setSyncing] = React.useState(false);
  const [handleSync, setHandleSync] = React.useState<(() => Promise<void>) | null>(null);

  const registerSync = React.useCallback((handler: () => Promise<void>, syncingState: boolean) => {
    setHandleSync(() => handler);
    setSyncing(syncingState);
  }, []);

  const value = React.useMemo(
    () => ({
      syncing,
      handleSync,
      registerSync,
    }),
    [syncing, handleSync, registerSync]
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const context = React.useContext(SyncContext);
  if (!context) {
    throw new Error("useSync must be used within a SyncProvider");
  }
  return context;
}

// Hook for pages to register their sync handler
export function useRegisterSync(handler: () => Promise<void>, syncing: boolean) {
  const { registerSync } = useSync();

  React.useEffect(() => {
    registerSync(handler, syncing);
  }, [handler, syncing, registerSync]);
}
