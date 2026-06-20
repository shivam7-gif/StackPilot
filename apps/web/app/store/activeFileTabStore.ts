import { create } from "zustand";

export type FileTab = {
  path: string;
  value: string;
  extension: string;
  fileType: "text" | "image";
  isDirty?: boolean;
};

type ActiveFileTabStore = {
  tabs: FileTab[];
  activeTabPath: string | null;
  // derived helper
  activeFileTab: FileTab | null;

  openTab: (path: string, value: string, extension: string, fileType?: "text" | "image") => void;
  closeTab: (path: string) => void;
  switchTab: (path: string) => void;
  updateTabValue: (path: string, value: string) => void;
  markDirty: (path: string, dirty: boolean) => void;

  // legacy compat — used by existing socket handler
  setActiveFileTab: (path: string, value: string, extension: string, fileType?: "text" | "image") => void;
};

export const useActiveFileTabStore = create<ActiveFileTabStore>((set, get) => ({
  tabs: [],
  activeTabPath: null,
  activeFileTab: null,

  openTab: (path, value, extension, fileType = "text") => {
    set((state) => {
      const exists = state.tabs.find((t) => t.path === path);
      if (exists) {
        // Tab already open — just switch to it, update value if provided
        const updatedTabs = value
          ? state.tabs.map((t) => (t.path === path ? { ...t, value } : t))
          : state.tabs;
        const active = updatedTabs.find((t) => t.path === path) ?? null;
        return { tabs: updatedTabs, activeTabPath: path, activeFileTab: active };
      }
      const newTab: FileTab = { path, value, extension, fileType, isDirty: false };
      const newTabs = [...state.tabs, newTab];
      return { tabs: newTabs, activeTabPath: path, activeFileTab: newTab };
    });
  },

  closeTab: (path) => {
    set((state) => {
      const idx = state.tabs.findIndex((t) => t.path === path);
      if (idx === -1) return state;
      const newTabs = state.tabs.filter((t) => t.path !== path);
      let newActivePath = state.activeTabPath;
      if (state.activeTabPath === path) {
        // Pick neighbor tab
        if (newTabs.length === 0) {
          newActivePath = null;
        } else {
          newActivePath = (newTabs[idx] ?? newTabs[idx - 1])?.path ?? null;
        }
      }
      const activeTab = newTabs.find((t) => t.path === newActivePath) ?? null;
      return { tabs: newTabs, activeTabPath: newActivePath, activeFileTab: activeTab };
    });
  },

  switchTab: (path) => {
    set((state) => {
      const tab = state.tabs.find((t) => t.path === path) ?? null;
      return { activeTabPath: path, activeFileTab: tab };
    });
  },

  updateTabValue: (path, value) => {
    set((state) => {
      const newTabs = state.tabs.map((t) => (t.path === path ? { ...t, value } : t));
      const activeFileTab = newTabs.find((t) => t.path === state.activeTabPath) ?? null;
      return { tabs: newTabs, activeFileTab };
    });
  },

  markDirty: (path, dirty) => {
    set((state) => {
      const newTabs = state.tabs.map((t) => (t.path === path ? { ...t, isDirty: dirty } : t));
      return { tabs: newTabs };
    });
  },

  // Legacy compat — same as openTab
  setActiveFileTab: (path, value, extension, fileType = "text") => {
    get().openTab(path, value, extension, fileType);
  },
}));
