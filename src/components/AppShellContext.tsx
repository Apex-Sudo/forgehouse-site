"use client";
import { createContext, useContext, useState, useCallback } from "react";

interface AppShellContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  refreshConversations: number;
  triggerConversationRefresh: () => void;
}

const AppShellContext = createContext<AppShellContextType>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  toggleSidebar: () => {},
  refreshConversations: 0,
  triggerConversationRefresh: () => {},
});

export function useAppShell() {
  return useContext(AppShellContext);
}

export function AppShellProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshConversations, setRefreshConversations] = useState(0);

  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);
  const triggerConversationRefresh = useCallback(
    () => setRefreshConversations((n) => n + 1),
    []
  );

  return (
    <AppShellContext.Provider
      value={{ sidebarOpen, setSidebarOpen, toggleSidebar, refreshConversations, triggerConversationRefresh }}
    >
      {children}
    </AppShellContext.Provider>
  );
}
