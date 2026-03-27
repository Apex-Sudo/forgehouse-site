"use client";
import { createContext, useContext, useState, useCallback } from "react";

interface AppShellContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  refreshConversations: number;
  triggerConversationRefresh: () => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
}

const AppShellContext = createContext<AppShellContextType>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  toggleSidebar: () => {},
  refreshConversations: 0,
  triggerConversationRefresh: () => {},
  activeConversationId: null,
  setActiveConversationId: () => {},
});

export function useAppShell() {
  return useContext(AppShellContext);
}

export function AppShellProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshConversations, setRefreshConversations] = useState(0);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);
  const triggerConversationRefresh = useCallback(
    () => setRefreshConversations((n) => n + 1),
    []
  );

  return (
    <AppShellContext.Provider
      value={{ sidebarOpen, setSidebarOpen, toggleSidebar, refreshConversations, triggerConversationRefresh, activeConversationId, setActiveConversationId }}
    >
      {children}
    </AppShellContext.Provider>
  );
}
